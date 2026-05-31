# Fine Tag 体系重订 + facets 多维 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把分类升级为「`fine_category` 主标（13 类 52 tag）+ `facets` 多维属性」，重标全部题目并打 facets，迁移升级为 facets 可缩放筛选，导入解析也吐 facets；三套尺子对齐。

**Architecture:** 加法式：保留 `fine_category` 主标管线（决策地图/讲解/校验），每题新增 `facets` 对象（精简 schema，见 spec §一之二）。重标走"AI 逐题读题→fine_category+facets，用户确认 ambiguous"流程。迁移读 facets 做 word↔type↔category 可缩放。**执行顺序：非谓语→高频→从句→剩余→谓语压轴**（避免开会前卡最难）。设计依据：`docs/superpowers/specs/2026-05-31-fine-tag-taxonomy-redesign-design.md`。

**Tech Stack:** 原生 JS（IIFE 模块）、Python 校验、Playwright smoke、Supabase Edge Function（deepseek-parse）。

**全部做完一起上线**：期间只在 `feature/teaching-render` commit，不 push；全绿后再合并 main。

**验证**：`python3 scripts/check_grammar_bank.py`、`npm run check`、`npm run test:smoke`。

## 数据架构与重标机制（执行中发现，关键）

题库 **3 处须一致**（校验脚本强制）：
- `data/grammar_bank.json`（源；fine_category 选填，但 present 的须合法）
- `docs/data/grammar_bank.js`（应用读，格式 `window.GRAMMAR_BANK = {…JSON…};` + 头部注释）——内含 **`exams[].questions` 和 flat `questions[]` 两份镜像**，必须在 `category/category_name/fine_category/answer/grammar_point` 上一致（`check_flat_questions_mirror`）。跨文件还校验 exam 数量与 exam_id 集合一致（不校验 fine_category 跨文件相等）。

**重标机制（所有 re-tag 阶段统一用）**：手改多副本极易 desync。改为——
1. AI 产出**映射 JSON**：`{ "<exam_id>-<no>": { "fine_category": "新tag", "facets": {…} }, … }`（用户确认 ambiguous 后定稿）。
2. 跑可复用脚本 **`scripts/apply_retag.py <mapping.json>`**：解析 `docs/data/grammar_bank.js`（剥 `window.GRAMMAR_BANK = ` 前缀 + 去尾 `;` → json.loads），对 `exams[].questions` 和 flat `questions[]` 按 `<exam_id>-<no>` 一致写入新 `fine_category`+`facets`，保留头部注释与格式回写；同时把 `data/grammar_bank.json` 中已有 fine_category 的题一并 remap。
3. `python3 scripts/check_grammar_bank.py` 验证（镜像/白名单/facets 全过）。

`scripts/apply_retag.py` 在 Task 3 首次建好，后续阶段复用。

---

## 文件结构

| 文件 | 改动 |
|------|------|
| `docs/data/grammar_fine_tags.js` | `tags` 重写为 52 主标；`textbook_units` 不动（教材已搁置） |
| `docs/data/grammar_bank.js` | 每题 `fine_category` 重标 + 新增 `facets` 对象 |
| `scripts/check_grammar_bank.py` | 校验 fine_category∈新白名单 + facets 形态（有 facets、键合法） |
| `docs/data/decision_map.js` | 叶子 `fine` 对齐新 tag（名从按引导词/非谓语按形式） |
| `docs/data/grammar_knowledge.js` | 讲解 section/kd 对齐（按需） |
| `docs/grammar-fill/modules/migration-training.js` | 迁移读 facets：word↔type↔category 可缩放范围选择 |
| `docs/grammar-fill/modules/teaching-render.js` | 渲染范围选择器（替换/增强现有筛选片） |
| `docs/grammar-fill/index.html` | 范围选择接线 + A3 取句修复 |
| `supabase/functions/deepseek-parse/*` | 解析输出 schema 增 facets（导入一致） |
| `tests/smoke.spec.js` | facets/迁移断言 |

## facets 目标 schema（每 Task 重标时按此打，源自 spec §一之二）

```
nonpredicate { form: to-do|doing|done }
word         { subtype: derivation|gerund|participle-adj|comparative|superlative|selection }
number       { type: plural|possessive|numeral }
article      { word: a-an|the }
pronoun      { type: personal|indefinite|it }
preposition  { word:<答案>, sense?: time|place|manner|reason|collocation }
logic        { word:<答案>, kind: coordinating|correlative }
attrib       { type: relative-pronoun|relative-adverb|prep-relative|as-relative, word:<答案>, restrictive: bool }
nounclause   { type: that|whether-if|wh-pronoun|wh-adverb|wh-ever, word:<答案> }
advclause    { type: time|cause|condition|concession|purpose-result|manner-place }
modal        { type: speculation|ability-permission|advice-obligation|other }
special      { type: subjunctive|emphasis|inversion|tag-question|ellipsis }
predicate    { tense:..., voice: active|passive, agreement: bool }   ← Task 9 压轴
```

---

## Task 1: 重写 fine tag 主标为 52 体系

**Files:** Modify `docs/data/grammar_fine_tags.js`

- [ ] **Step 1: 存档旧 tag 分布**
```bash
cd /Users/zhenliu/Desktop/英语教学系统1.0/docs && grep -o 'fine_category"\?:\s*"[^"]*"' data/grammar_bank.js | sed 's/.*"\([^"]*\)"$/\1/' | sort | uniq -c | sort -rn > /tmp/old_tag_counts.txt && cat /tmp/old_tag_counts.txt
```
Expected: 28 行旧 tag+题数。

- [ ] **Step 2: 重写 `tags` 数组为 52 新 tag**

把 `tags: [...]` 整段替换为 52 个 `{ id, category, source, name }`（id 见 spec §I，category 用现有 13 个 id，name 用 §I 中文名，source 填语法通霸章节或 '体系重订2026-05-31'）。**52 个全部写出**。

- [ ] **Step 3: 更新 stats 注释（main_tags=52）；`aux_tags` 若引用旧考点 tag 则清理。`textbook_units` 不改（教材已搁置）。**

- [ ] **Step 4: 验证可解析 + check 列出旧 tag 题（预期此刻失败）**
```bash
cd /Users/zhenliu/Desktop/英语教学系统1.0 && node -e "global.window={};require('./docs/data/grammar_fine_tags.js');console.log('tags:',window.GRAMMAR_FINE_TAGS.tags.length)" && python3 scripts/check_grammar_bank.py 2>&1 | grep -i "unknown fine_category" | head
```
Expected: `tags: 52`；check 报 unknown（=重标清单）。

- [ ] **Step 5: Commit**
```bash
git add docs/data/grammar_fine_tags.js && git commit -m "feat(taxonomy): fine tag主标重写为13类52体系"
```

---

## Task 2: 校验脚本支持 facets 形态

**Files:** Modify `scripts/check_grammar_bank.py`；Test: 运行

- [ ] **Step 1: 读现有校验逻辑**

`grep -n "fine_category\|facets\|def check" scripts/check_grammar_bank.py`。确认它从 `grammar_fine_tags.js` 读合法 fine_category 白名单（约 line 50）、逐题校验（约 line 125）。

- [ ] **Step 2: 加 facets 形态校验**

在逐题校验处增加：若题有 `facets`，则 `facets` 必须是对象；其键应属于该题 category 对应的允许键集合（按 spec schema：如 category=nonpredicate → 仅 `form`；attrib → `type/word/restrictive`…）。允许 facets 暂缺（重标分阶段，未标的题先不报错，仅报"已标 facets 但键非法"）。给出 Python 校验代码（在脚本里加一个 `ALLOWED_FACET_KEYS = {category: set(...)}` 字典 + 校验循环）。

- [ ] **Step 3: 运行校验（此刻题库还没 facets，应只报 unknown fine_category，不报 facets 错）**
```bash
python3 scripts/check_grammar_bank.py 2>&1 | tail -8
```
Expected: 报 unknown fine_category（旧 tag 未重标）；不报 facets 相关错。

- [ ] **Step 4: Commit**
```bash
git add scripts/check_grammar_bank.py && git commit -m "feat(check): 校验facets形态(键须属category允许集)"
```

---

## Task 3: 【Phase 1 试点】非谓语重标 + facets

**Files:** Create `docs/planning/2026-05-31-retag-nonpredicate.md`（对照表）；Modify `docs/data/grammar_bank.js`

- [ ] **Step 1: 导出非谓语题清单**
```bash
cd /Users/zhenliu/Desktop/英语教学系统1.0/docs && grep -n '"fine_category": "nonp-' data/grammar_bank.js | head -80
```

- [ ] **Step 2: AI 逐题判定（fine_category + facets.form）**

对每道旧 `nonp-*` 题，AI 读"句子+答案+解析"，按 spec §2.4 判：
- 分词/不定式作非谓语成分 → `fine_category`=`nonpred-to-do`/`nonpred-doing`/`nonpred-done`（按答案形式），`facets`=`{ form: 对应 }`。
- 动名词作名词用 → `fine_category`=`word-noun`，`facets`=`{ subtype: 'gerund' }`（移入 word）。
- -ed/-ing 表性质形容词 → `fine_category`=`word-adj`，`facets`=`{ subtype: 'participle-adj' }`（移入 word）。
写入对照表（exam/题号/句子/答案/旧tag/新fine_category/facets/依据）。

- [ ] **Step 3: 标 ambiguous 交用户确认（硬门）**

边界拿不准的（"公认的"形容词 vs "被认出"分词、动名词 vs 现在分词）单列，交用户裁定回填。**未确认不进 Step 4。**

- [ ] **Step 4: 写入题库 + 校验**

按对照表改 `grammar_bank.js`（保留题内 `nonp_form` 不冲突）。Run:
```bash
python3 scripts/check_grammar_bank.py 2>&1 | tail -5
```
Expected: 非谓语相关 unknown 消失、facets 合法（其余类别仍报 unknown，正常）。

- [ ] **Step 5: Commit**
```bash
git add docs/data/grammar_bank.js docs/planning/2026-05-31-retag-nonpredicate.md && git commit -m "feat(bank): 非谓语重标+facets(form), 动名词/分词形容词归词转"
```

---

## Task 4: 迁移升级为 facets 可缩放筛选

**Files:** Modify `modules/migration-training.js`、`modules/teaching-render.js`、`index.html`；Test `tests/smoke.spec.js`

> 现有筛选原型（f016965）按答案派生筛选片；本 Task 升级为读 `facets` 的"范围选择器"。用 Task 3 的非谓语 facets 数据先验证。

- [ ] **Step 1: 写失败测试（范围选择纯逻辑）**

在 smoke 加断言：新增纯函数 `buildMigrationScopes(facets, fine_category)` 返回可选范围列表（如 `[{level:'word',value:'doing'},{level:'type',...},{level:'category',value:'nonpredicate'}]`），并 `selectMigrationByScope(pool, scope)` 按范围过滤。先断言函数存在且对一个非谓语 facets 返回含 word/category 两级。

- [ ] **Step 2: 运行确认失败**（no-fn）

- [ ] **Step 3: 实现范围纯函数（migration-training.js）**

加 `buildMigrationScopes(facets, fineCategory)`：根据 facets 字段生成层级（word←facets.word/form；type←facets.type/subtype；category←fineCategory 的 category）。加 `migrationMatchesScope(item, scope)`：按 scope.level 比对 item 的对应 facets/category。导出。

- [ ] **Step 4: 迁移池按范围动态取**

`buildMigrationData` 改为：默认池=同最细范围（word/form），但返回时附带 `scopes`（可放大选项）；范围切换时重算池（同 type / 同 category / 兄弟 type）。范围选择器替换现有筛选片。

- [ ] **Step 5: 渲染范围选择器（teaching-render.js）+ 接线（index.html）**

把 `migrationFilterChipsHtml` 升级为范围选择器：`[本词 doing][本类型 关系代词][关系副词][整个定语从句]` 等，点击调 `setMigrationScope(level,value)` 重渲染。

- [ ] **Step 6: 运行通过 + 无回归**
```bash
npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path"
```
Expected: PASS。

- [ ] **Step 7: Commit**
```bash
git add docs/grammar-fill/modules/migration-training.js docs/grammar-fill/modules/teaching-render.js docs/grammar-fill/index.html tests/smoke.spec.js && git commit -m "feat(migration): facets可缩放范围筛选(word↔type↔category)"
```

---

## Task 5: 【Phase 2】高频类重标 + facets（词性/介词/冠词/逻辑连词）

**Files:** Create `docs/planning/2026-05-31-retag-highfreq.md`；Modify `docs/data/grammar_bank.js`

- [ ] **Step 1: AI 逐题判定四类**（旧 word-*/prep-*/art-*/logic-* 的有题项），按 facets schema：
  - 词性：`fine_category`=word-noun/adj/adv/verb/adj-vs-adv/comparative，`facets.subtype`。
  - 介词：`fine_category`=prep-collocation/...，`facets={word:答案介词, sense?:...}`。
  - 冠词：`facets={word:a-an/the}`。
  - 逻辑连词：`fine_category`=logic-coordinating，`facets={word:答案, kind}`。
  写对照表。
- [ ] **Step 2: ambiguous 交用户确认（硬门）。**
- [ ] **Step 3: 写库 + `python3 scripts/check_grammar_bank.py` 通过（这四类 unknown 消失）。**
- [ ] **Step 4: Commit** `git commit -m "feat(bank): 高频类(词性/介词/冠词/连词)重标+facets"`

---

## Task 6: 【Phase 3】从句重标 + facets（定语/名词性/状语）

**Files:** Create `docs/planning/2026-05-31-retag-clauses.md`；Modify `docs/data/grammar_bank.js`

- [ ] **Step 1: AI 逐题判定**（旧 attrib-*/nounc-*/advc-* 有题项）：
  - 定从：`fine_category`=attrib-pronoun/adverb/prep-relative/as，`facets={type,word,restrictive}`。
  - 名从：`fine_category`=nounc-that/whether-if/wh-pronoun/wh-adverb/ever，`facets={type,word}`。
  - 状从：`facets={type}`。
  写对照表。
- [ ] **Step 2: ambiguous 交用户确认（硬门）。**
- [ ] **Step 3: 写库 + 校验通过。**
- [ ] **Step 4: Commit** `git commit -m "feat(bank): 从句类(定/名/状)重标+facets"`

---

## Task 7: 【Phase 4】剩余类重标 + facets（代词/名词数词/情态/特殊）

**Files:** Create `docs/planning/2026-05-31-retag-rest.md`；Modify `docs/data/grammar_bank.js`

- [ ] **Step 1: AI 逐题判定**（旧 pron-*/num-*/modal-*/special-* 有题项），facets：代词`{type}`、名词数词`{type}`、情态`{type}`、特殊`{type}`。写对照表。
- [ ] **Step 2: ambiguous 交用户确认（硬门）。**
- [ ] **Step 3: 写库 + 校验通过（此时全部题应无 unknown）。**
- [ ] **Step 4: Commit** `git commit -m "feat(bank): 剩余类(代词/名词数词/情态/特殊)重标+facets"`

---

## Task 8: 决策地图 + 讲解对齐新 tag

**Files:** Modify `docs/data/decision_map.js`、`docs/data/grammar_knowledge.js`、`tests/smoke.spec.js`

- [ ] **Step 1: decision_map 叶子 `fine` 全量对齐新 tag**（非谓语按形式、名从按引导词、其余按 §III）；父节点 `kd` 对齐讲解 section。
- [ ] **Step 2: 讲解 section key 与新 tag 口径核对（按需微调）。**
- [ ] **Step 3: 同步 smoke 中旧 tag 引用为新 tag**（如 `pred-passive-form`→对应新 tag）。
- [ ] **Step 4: 跑** `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path"` 至 PASS。
- [ ] **Step 5: Commit** `git commit -m "feat(graph/knowledge): 决策地图+讲解对齐新tag体系"`

---

## Task 9: 【Phase 5 压轴】谓语重标 + facets（tense/voice/agreement）

**Files:** Create `docs/planning/2026-05-31-retag-predicate.md`；Modify `docs/data/grammar_bank.js`

- [ ] **Step 1: AI 逐题判定谓语三轴**

对旧 `pred-*` 有题项，AI 读"句子+答案+解析"判：`facets={ tense:..., voice: active|passive, agreement: bool }`；`fine_category` 取主考点（解析强调时态→pred-tense；强调被动→pred-passive；强调一致→pred-agreement）。写对照表。

- [ ] **Step 2: ambiguous 交用户确认（硬门）——谓语最易多维交叠，重点核。**

- [ ] **Step 3: 写库 + 校验全通过（全库无 unknown、facets 合法）。**
```bash
python3 scripts/check_grammar_bank.py 2>&1 | tail -5
```
Expected: 通过。

- [ ] **Step 4: 抽样核对全库新分布**
```bash
cd /Users/zhenliu/Desktop/英语教学系统1.0/docs && grep -o 'fine_category"\?:\s*"[^"]*"' data/grammar_bank.js | sed 's/.*"\([^"]*\)"$/\1/' | sort | uniq -c | sort -rn
```
Expected: 全部 ∈ 52 新集。

- [ ] **Step 5: Commit** `git commit -m "feat(bank): 谓语重标+facets(tense/voice/agreement)压轴"`

---

## Task 10: 导入解析吐 facets（deepseek-parse）

**Files:** Modify `supabase/functions/deepseek-parse/*`

- [ ] **Step 1: 读现有解析输出 schema**

`grep -rn "fine_category\|category\|prompt" supabase/functions/deepseek-parse/ | head`。找到 AI 解析的输出 JSON 结构与 prompt。

- [ ] **Step 2: prompt/schema 增 facets**

在解析 prompt 里加入 facets 规则（同 spec §一之二 schema + §2.4 准则），要求模型对每题输出 `fine_category` + `facets`。输出 schema 增 facets 字段。

- [ ] **Step 3: 前端导入落库写入 facets**

`grep -rn "fine_category" docs/shared/word-import*.js docs/grammar-fill/modules/word-import-model.js`，确认导入映射把 facets 一并存入题对象。

- [ ] **Step 4: 验证（mock 解析返回带 facets 的题，导入后题对象含 facets）**

加/改 smoke 断言：模拟 AI 解析返回含 facets，导入后该题 `facets` 落地。Run smoke。

- [ ] **Step 5: Commit** `git commit -m "feat(import): 解析输出含facets, 导入题与题库同结构"`

---

## Task 11: A3 迁移取句修复 + 全量回归

**Files:** Modify `docs/grammar-fill/index.html`（取句）；运行检查

- [ ] **Step 1: 定位"迁移句残缺/变 bridges"根因**（systematic-debugging：`grep -n "renderSentenceWithBlank\|registerTeachingMigrationItem"`，判断取错空格 index 还是切分截断），写最小复现断言。
- [ ] **Step 2: 修取句逻辑。**
- [ ] **Step 3: 全量校验** `npm run check` → `OK`；`npm run test:smoke` → 全绿。
- [ ] **Step 4: Commit** `git commit -m "fix(migration): 修复迁移取句残缺 + 全量回归通过"`

---

## 自检（Self-Review）记录
- **Spec 覆盖**：§I 52tag→Task1；§一之二 facets schema→Task3/5/6/7/9 各类按表打；导入一致→Task10；可缩放迁移→Task4；§III 对齐→Task8；§五取句→Task11；执行序(谓语压轴)→Task9 在 Task3-7 之后。教材已搁置，不在范围。
- **占位符**：重标为数据任务，用"AI 判定+对照表+用户硬门"流程替代逐题代码——数据任务正确形态。
- **类型一致**：facets 键名全程按 spec schema（form/type/subtype/word/sense/kind/restrictive/tense/voice/agreement）；fine_category 用新 52 id。check 的 ALLOWED_FACET_KEYS 与 schema 对齐。
- **风险**：Task4 facets 可缩放迁移是最重的代码任务，依赖 facets 数据（Task3 试点后即可建）；各重标 Task 有用户硬门，节奏取决于确认速度；谓语(Task9)三轴交叠最需核。
