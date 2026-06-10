# 学生追踪（云端）· v3 设计 —— 单老师 / 一学期

> 状态：设计已与负责人确认（2026-06-10），待写实施计划。
> 前置：错题画像双文件导入已上线（main）。本特性在其之上加"按学生纵向看 + 云端持久"。

## 目标

让老师在一个班、一学期内**按学生纵向追踪考点弱项**——"这学期 8 张卷里，张三老栽在时态、介词"——并且数据**持久存在 Supabase**（不再怕清缓存/换设备丢）。

## 范围（这一版做什么）

- **单老师**：每个老师只看自己导入的数据（沿用 `error_book` 的 per-user + RLS 模式）。
- **一学期 / 一个班稳定期**：用**学号**当这段时间的钥匙（负责人确认学号会随分班/换届变，故不跨届）。
- **云端只存学号**，姓名只留在**上传者本地浏览器**。
- 新增"学生时间线"视图。
- **加法式**：现有班级画像板块（localStorage）**一行不动**，只额外把每生一行推云 + 写本地名字 + 新增时间线读云。

## 不做（明确推迟，但数据模型给它们留了钩子）

- 科组长 / 管理员跨人查看、组织层（管理员排整个年级班级 + 派老师 + 混入独立用户）。
- 永久学号（一人一个永不变的号）、跨届 / 跨班追踪。
- 班级画像板块上云（这版仍 localStorage；因为每生数据已在云端，下一版切云端会很顺）。

## 两条红线（隐私不变量 + 未来钩子）

1. **名字永驻上传者本地。** 学号 + 成绩上云；`学号→姓名` 只写上传者自己的浏览器。任何人（含未来管理员）和云端，永远只见学号。对独立用户、组织用户都成立。
2. **`class_id` 用稳定 id。** 将来一张 `classes` 表能接管它（管理员建班、派老师）；"谁看谁的数据"是将来加 RLS + 成员表的事，不用回头重塑 `exam_results`。

---

## A. 数据模型

新表 `public.exam_results`，每行 = 一个学生在一张卷上的成绩。

```sql
create table if not exists public.exam_results (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  client_id   text not null,            -- 幂等键：classId__examId__studentNo
  class_id    text not null,            -- 稳定 id（cls_...），未来 classes 表可接管
  class_name  text,                     -- "高三①班"（班名，非学生隐私）
  exam_id     text not null,
  exam_label  text,                     -- "2026广州一模"
  exam_date   date,                     -- 时间线排序（无则回退 created_at）
  student_no  text not null,            -- 学号（化名键；【无姓名列】）
  result      jsonb not null,           -- 见下方形状
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, client_id)
);

alter table public.exam_results enable row level security;

create policy exam_results_all_own on public.exam_results
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create index if not exists exam_results_class_student
  on public.exam_results (user_id, class_id, student_no);
create index if not exists exam_results_class_exam
  on public.exam_results (user_id, class_id, exam_id);
```

`result` JSONB 形状（一个学生在这张卷上的表现，来自 `buildErrorProfile` 的 `students[i]` + 该卷题目考点 `examForBuild`）：

```json
{
  "right": [37, 41],
  "wrong": [36, 38],
  "blank": [],
  "wrongQuestions": [
    { "no": 36, "category": "preposition", "fine_category": null, "answer": "from" }
  ],
  "byCat": {
    "preposition": { "right": 0, "wrong": 1 },
    "tense":       { "right": 1, "wrong": 1 }
  }
}
```

- `byCat` = 这个学生**本卷各考点**的对错，在导入时由 `student.right/wrong` 题号 join `examForBuild` 的题→考点表算出（`buildExamResultRows` 负责）。**自包含**——时间线只需跨卷把各卷 `byCat` 相加，不必回查原卷题目。
- 必须有配套 `.rollback.sql`（drop policy / index / table），过 `check_supabase_migrations`。

## B. 本地名字层（隐私边界）

- localStorage 键 `grammar-student-names`，按账号隔离：`{ "_owner": userId, "names": { "2023531001": "张三" } }`（沿用现有 owner-isolation 写法）。
- 导入时：从成绩单读**学号列 + 姓名列**；学号→姓名写本地，**不上云**。
- 显示时：`resolveName(学号)` → 本地有则姓名，无则回退显示学号。
- 换设备 / 清缓存 → 先显示学号，**导一张成绩单即自愈**（成绩单自带姓名列）。

## C. 数据流（加法式）

```
拖套卷+成绩 → 算画像（现有，不动）→ localStorage 画像（现有班级画像板块照旧读）
                                  ├─ 额外①：extractStudentRoster(rows) → 学号→姓名 写本地名字层
                                  └─ 额外②：把 profile.students[] 拆成每生一行 → upsert 到 exam_results（云）
新增"学生时间线"：fetchExamResults(classId) → 按学号 group → 渲染（本地 resolveName）
```

- 现有班级画像板块、错题→迁移等**完全不动**（低风险）。
- 云写失败：不阻塞画像（已在 localStorage）；toast 提示"云同步失败，稍后重试"，下次导入再补。

## D. 新界面 —— 学生时间线

- 入口：班级画像里每个学生行 → 点"看历程"。
- 内容：该生本班**所有卷**按时间排列，每卷他的对错 + 高频反复错的考点（跨卷聚合 top N）。本地显名（无则学号）。
- 纯渲染走 render 模块（拼字符串），控制器接 fetch + resolveName。

## E. 模块落点（沿用现有架构）

- 纯逻辑（`node:test`）：
  - `extractStudentRoster(rows)` → `[{studentNo, name}]`（引擎，读学号+姓名列）。
  - `buildExamResultRows(profile, examForBuild, meta)` → 每生一行 `{client_id, class_id, ..., student_no, result}`；`result.byCat` 在这里由题号 join `examForBuild` 算（纯）。
  - `buildStudentTimeline(rows)` → 按学号聚合（各卷 `byCat` 相加得跨卷弱项）的时间线视图模型（纯）。
  - `resolveStudentName(map, studentNo)`（纯）。
- 云同步（`docs/shared/cloud.js`，照搬 `error_book` 三件套）：`uploadExamResults` / `fetchExamResults(classId)` / `deleteExamResults`。
- 控制器：导入流程加"额外①②"；新增时间线页渲染 + 事件。
- 本地名字层：app.js 加 `loadStudentNames/saveStudentNames/mergeStudentNames`（owner-aware，照搬 classes 那套）。

## F. 现有数据迁移

- 一次性 best-effort：首次进入"学生时间线"时，把现有 localStorage 画像里的每生数据回填到 `exam_results`（按 client_id 幂等，跑一次即可）。
- 名字：现有 localStorage 画像只存了学号（化名设计），**没有姓名**——所以历史数据回填后只有学号，姓名要等老师重新导一次对应成绩单才补上（可接受）。

## G. 测试

- `node:test`：extractStudentRoster / buildExamResultRows / buildStudentTimeline / resolveStudentName 四个纯函数。
- migration：`check_supabase_migrations`（rollback + RLS 存在）。
- smoke：mock 云端（注入 fetchExamResults 返回）→ 学生时间线渲染 + 本地名字解析 + 无姓名上云断言（检查 upload 负载不含姓名字段）。
- 门禁：`check_grammar_modules` 登记新纯模块/控制器；`npm run check` 全绿。

## H. 未来钩子（这版不建，但不挡路）

- 组织层：新增 `classes` 表（org 拥有、派老师）+ `memberships` + 给 `exam_results` 加科组长/管理员 RLS 策略。`class_id` 已是稳定 id，可被接管。
- 永久学号：`exam_results` 加 `student_uid` 列 + 一张 `学号→uid` 映射，回填即可，不重塑。
- 班级画像板块上云：复用 `exam_results`（每生数据已在），把板块改成异步读云。
- 待解小张力：管理员"分班"时脑子里是名字、但名字在各老师本地 —— 组织层需定"分班按学号操作 / 另设信任层"。

## 完成定义

- `exam_results` 表 + RLS + rollback 落地，`check_supabase_migrations` 绿。
- 导入成绩 → 每生一行上云（不含姓名）+ 学号→姓名写本地。
- 学生时间线视图：选班 → 点学生 → 看其本学期各卷考点历程，本地显名。
- 现有班级画像 / 错题迁移 / 备课等**零回归**；`npm run check` 全绿。
