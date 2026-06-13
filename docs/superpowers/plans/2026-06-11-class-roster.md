# 班级名单导入 + 全班/缺考视图 — 实施计划

> **For agentic workers:** subagent-driven 或内联执行；TDD；checkbox 步骤。

**Goal:** 班级可提前导入「学号+姓名」名单 → 时间线显示全班（含没考的），并按"名单有、成绩没有"算缺考。

**设计（负责人已认可）：** 班级对象加 `students:[学号]`（随班级存 localStorage）。「导入名单」拖 学号+姓名 Excel → 复用 `extractStudentRoster` → 学号→姓名 写本地名字层（**名字不上云**）+ 学号清单进班级。时间线 `buildStudentTimeline(rows, rosterNos)` 把名单里没成绩的学生也列出（"暂无成绩"），并按"全班卷数−该生卷数"显示缺考次数。隐私照旧：名字本地、`students` 只存学号、不上云。

**Tech Stack:** vanilla JS · SheetJS(已加载) · node:test · smoke · 门禁。前置：v3 学生追踪已在 main。

---

### Task 1: 引擎 buildStudentTimeline 支持名单（纯, TDD）

**Files:** Modify `docs/grammar-fill/modules/student-tracking.js`；Test `test/student-tracking.test.js`

`buildStudentTimeline(rows, rosterNos)`：除现有按 rows 聚合外，把 `rosterNos` 里没出现在 rows 的学号也加进来（`exams:[]`、`weakCats:[]`）；每个学生加 `examCount`（其卷数）与 `missedCount`（= 全班总卷数 − examCount，下限 0）。全班总卷数 = rows 里 distinct `exam_id` 数。排序不变（按总错次降序，0 数据沉底）。

- [ ] 测试：rows 有 S1（1卷）+ rosterNos=[S1,S2]，全班总卷数=1 → 返回含 S1(examCount1,missed0) 与 S2(examCount0,missed1,exams[])。
- [ ] 实现 + 跑 `node --test test/student-tracking.test.js` 绿。Commit。

### Task 2: 渲染 studentTimelineHtml 显示缺考/暂无成绩（纯, TDD）

**Files:** Modify `error-profile-render.js`；Test `test/error-profile-render.test.js`

studentTimelineHtml 的每个学生：有 `missedCount>0` 显「缺考 N 次」徽章；`exams.length===0` 时正文显「暂无成绩」。

- [ ] 测试：传一个 examCount0/missedCount1 的学生 → 含「暂无成绩」与「缺考 1」。实现 + 跑测试绿。Commit。

### Task 3: app.js 班级名单存储

**Files:** Modify `docs/grammar-fill/app.js`

```js
function loadClassRoster(classId) {
  var c = (loadClasses() || []).filter(function(x){ return x.id === classId; })[0];
  return (c && c.students) || [];
}
function mergeClassRoster(classId, studentNos) {
  var list = loadClasses();
  var c = list.filter(function(x){ return x.id === classId; })[0];
  if (!c) return [];
  var set = {}; (c.students || []).forEach(function(n){ set[n] = 1; });
  (studentNos || []).forEach(function(n){ if (n) set[n] = 1; });
  c.students = Object.keys(set);
  saveClasses(list);
  return c.students;
}
```
- [ ] `node --check` 绿。Commit（与 Task 4 一起）。

### Task 4: 时间线页「导入名单」拖拽 + 全班渲染

**Files:** Modify `error-profile-controller.js`、`app.js`

- 控制器 renderTimelinePage：class chips 行加一个「＋ 导入名单」拖拽/上传（学号+姓名 .xls/.xlsx）；解析交给 dep `onRosterFile(classId, file)`。fetch 后 `buildStudentTimeline(rows, _tl.classRoster(_tlClassId))`。
- app.js timeline deps 加：`classRoster: loadClassRoster`、`importRoster: function(classId, rows){ var roster = window.GrammarStudentTracking.extractStudentRoster(rows); mergeStudentNames(roster); return mergeClassRoster(classId, roster.map(function(s){return s.studentNo;})); }`。
- 控制器里用 SheetJS 解析名单文件（同导入成绩：read→sheet_to_json header:1）→ 调 importRoster → renderTimelinePage 重渲染。
- [ ] `node --check` + `check_grammar_modules` 绿。手验/smoke。Commit。

### Task 5: smoke + 全量门禁

**Files:** Modify `tests/smoke.spec.js`

- smoke：注入 grammar-classes（含 students:[S1,S2]）+ mock 云端只返回 S1 → 时间线含 S2「暂无成绩」。
- [ ] `npm run test:unit && npm run check` 全绿。Commit。

## 完成定义
- 时间线页可导入名单；全班都显示（没考的标暂无成绩 + 缺考次数）；名字本地、students 只存学号不上云；零回归；门禁绿。

## 不含
- 名单/students 上云（先本地，随班级）；画像板块的"本次缺考名单"（时间线已给缺考信号）；组织层。
