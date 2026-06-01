# 考点体系地基重订 · Phase 3（知识地图/决策地图）· 设计 spec

> 日期：2026-06-01　状态：**设计完成，待用户审**
> 父 spec：`docs/superpowers/specs/2026-06-01-taxonomy-facet-grain-design.md`（地基总设计，§六③视图层）
> 前置：Phase 1（数据层 tag 重订 + `q.points` 派生挂载）、Phase 2（迁移引擎按 `questionsSharePoint`）已完成于分支 `feat/taxonomy-points-phase1`，check + 17 smoke 全绿。

---

## 一、目标（用户三件 + 卫生收尾）

1. **节点计数/叶子改按 points** —— 决策地图叶子的题数与跳转池从「按 `fine_category` 粗数」升级到「按 `points` 的 `{tag, key}` 精数」，使**时态 6 节点不再雷同**。
2. **叶子跳转修复（点 which 跳 which）** —— 具体词 chip 点击携带该词，按 `{tag, key}` 取池；**不同类型从句绝不互混**（points 的 tag 天然隔离：定从 which=`{attrib-pronoun,which}`、名从 which=`{nounc-wh-pronoun,which}`）。
3. **冠词重合修正** —— 删 `l_art_spec`（特指/独指/类指），保留 `l_art_the`（定冠词 the）。
4. **Phase 2 卫生收尾** —— 删范围筛选器（scope）死代码 + 相关 smoke。

非目标（留后）：SVA 三原则子区分（需新 agreement 子 facet）、主动表被动数据积累、词缀 affix 维度、介词按功能拆。

---

## 二、根因（已证实）

决策地图 `renderSystemView`（index.html）每个叶子做三件事，全部按 `fine`：

| 动作 | 现状调用 | 问题 |
|------|---------|------|
| 计数徽章 | `countByFineTag(fine)` —— 数 `q.fine_category===fine` | 6 个时态叶子都 `fine:'pred-tense'` → 计数全相同 |
| 迁移按钮 | `startMigrationFromMap(fine)` → `startByFineTag(fine)` → 按 `fine_category` 筛 | 谓语叶子拉到同一粗池 |
| 词 chip | `buildLeafWordBreakdown(fine)` 列词，但 onclick 仍 `startMigrationFromMap(fine)` | **word 没传** → 点 which 进整个 attrib-pronoun 池 |

数据现状：`facets.tense` 仅 5 个真实值 —— `present`(24,一般现在)、`past`(26,一般过去)、`perfect`(2,现在完成)、`perfect-progressive`(2,现在完成进行)、`past-future`(2,过去将来)。冠词 `l_art_spec` 与 `l_art_the` 同 `fine:'art-the'` → 重复叶子。

---

## 三、时态叶子结构（做题导向，已与用户确认）

时态 = **时间 × 体** 两个独立维度。学生做题决策链「先抓信号 → 定时态」，不同时态靠不同信号：

- **一般时**靠**时间标志**（now/ago/tomorrow）→ 按时间拆开（一般过去≠一般将来）。
- **进行/完成/完成进行**靠**体的信号词**（强调正在 / already·since·by / 持续至今）→ 按体归类（助动词时态随上下文走）。

最终 6 个时态叶子（`pred_tense` 下）：

| 叶子 id | 标题 | 决定性信号 | `point.keys`（facets.tense） | 现真题 |
|---------|------|-----------|------------------------------|--------|
| `l_tense_present` | 一般现在 | 事实/习惯/now | `['present']` | 24 |
| `l_tense_past` | 一般过去 | 叙述主线/ago | `['past']` | 26 |
| `l_tense_future` | 一般将来·过去将来 | will/would, tomorrow | `['future','past-future']` | 2 |
| `l_tense_progressive` | 进行体 | 强调正在/某时刻 | `['progressive','present-progressive','past-progressive']` | 0·储备 |
| `l_tense_perfect` | 完成体 | already/since/by/影响 | `['perfect','past-perfect','future-perfect']` | 2 |
| `l_tense_perfectprog` | 完成进行 | 持续至今还在继续 | `['perfect-progressive','past-perfect-progressive']` | 2 |

计数 → **24 / 26 / 2 / 0 / 2 / 2**，互不雷同 ✓。空叶子（进行体）显「0 题·储备」，与现有空叶子一致；将来上传卷子自然激活。keys 互不重叠，无重复计数。

**语态叶子**（`pred_voice` 下）：
- `l_voice_form`（被动语态构成）→ `point:{tag:'pred-passive'}`（keyless = 全部被动）= 24。
- `l_voice_implicit`（主动形式表被动）→ `point:{tag:'pred-passive', keys:['__implicit__']}` = 0·储备。「主动表被动」题语态为 active、不带 `pred-passive` point，当前无数据信号；用占位 key 诚实显 0，数据积累后或加独立 tag（留后）。
→ 两叶子计数 24 / 0，不雷同 ✓。

**主谓一致叶子**（`pred_sva` 下，4 个）：facets 仅有 `agreement:true/false`，无子原则标签 → 4 个叶子仍共享 `pred-agreement` 计数（语法形式/意义/集合/数量无法从现数据区分）。**已知局限**：差异化需新增 agreement 子 facet（语法形式/意义/就近），列入留后。本期保持 4 叶按 `pred-agreement` 计数（点进去是同一池）。

---

## 四、改动四面

### ① 数据层 `docs/data/decision_map.js`

- **替换 `pred_tense` 下 6 个旧叶子**（present/past/cont/perfect/pastperfect/other）为上表 6 个，每个带新字段 `point:{tag, keys?}`，`fine` 保留（供「看讲解」回退）。
- **语态 2 叶子**加 `point`（见上）。
- **SVA 4 叶子**：保持现状（仍 `fine:'pred-agreement'`，不加 point；计数走 fine 回退）。
- **删 `l_art_spec`**；`l_art_the` 不变。

> 字段约定：叶子可选 `point:{tag:'<考点id>', keys?:['<facets值>',...]}`。无 `point` 的叶子（非谓语全部 + SVA）计数/跳转沿用 `fine` 路径，行为不变（这些叶子 `fine` 即 tag，按 fine 计数本就正确）。

### ② 视图层 `docs/grammar-fill/modules/knowledge-view-model.js`

新增纯函数 `countByPoint(tag, keys, bankQuestions, errorQuestions)`：
- 数 `q.points` 中存在元素 `p.tag===tag && (keys 空 ? true : keys.indexOf(p.key)!==-1)` 的题。
- 返回 `{ bank, error, real, total }`，口径与 `countByFineTag` 对齐（`total=bank+error`，`real`=bank 中 `type==='真题'`）。
- 导出。

### ③ 引擎层 `docs/grammar-fill/modules/migration-training.js` + `category-rules.js`

- migration-training 新增并导出 `questionMatchesPoint(item, tag, keys)`：item.points 任一元素同 tag 且（keys 空或 key∈keys）。
- category-rules 新增并导出 `selectPointQuestions(allQuestions, tag, keys)` + `buildPointPracticePlan(tag, keys, allQuestions, categoryMap)`，镜像现有 `selectFineTagQuestions`/`buildFineTagPracticePlan`，但按 point 筛、category 取池中首题的 category。

### ④ 渲染 `docs/grammar-fill/index.html`

- `renderSystemView` 叶子计数：`n.point ? countByPoint(n.point.tag, n.point.keys, …) : countByFineTag(n.fine, …)`。
- 新增 `startByPointFromMap(tag, keys)`：`startByPoint`（调 `buildPointPracticePlan`）+ `setPreviousView({page:'knowledge'})` + sync/dock（镜像 `startMigrationFromMap`）。新增 `startByPoint(tag, keys)`（镜像 `startByFineTag`，改调 `buildPointPracticePlan`）。
- 谓语带 `point` 的叶子：迁移按钮 onclick → `startByPointFromMap(tag, keys)`。
- **词 chip 修复**：`buildLeafWordBreakdown` 的 chip onclick 从 `startMigrationFromMap(fine)` 改为 `startByPointFromMap(tag, [word])`，其中 tag = 该叶子的 `point?.tag || fine`。→ 点 which 按 `{tag,'which'}` 取池，which→which；不同从句 tag 不同天然不串 ✓。
- 引导词类叶子（attrib/nounc 等）的**叶子级迁移按钮**保持 `startMigrationFromMap(fine)`（整 tag 一池，如「关系词的选择」= who/which/that，语义正确）；细分靠词 chip。

### ⑤ Phase 2 卫生收尾（已核查全部消费点）

死代码全貌：scope 控件从未接通 —— `setMigrationScope` **从未定义**（chip onclick 是死 handler，即「范围筛选器点不动」的根因）；`buildMigrationData` **不读** `options.scope`/`options.fineTags`（调用点传了但被忽略）。

- **`migration-training.js`** 删函数：`buildMigrationScopes`、`migrationMatchesScope`、`buildMigrationScopeSelectorModel`、`facetWordValue`、`facetTypeValue`、`scopeButtonLabel`、`sameScope`、`SCOPE_VALUE_LABELS`，及 exports 对应项。`buildMigrationContentViewModel` 删 `scopeSelector` 字段；`buildMigrationData` 删返回里的 `scopes`/`activeScope`。
- **`teaching-render.js`** 删内部函数 `migrationScopeSelectorHtml`（162–177）；删两处读点（约 210–211 的 `teacher-quick` 卡片分支、约 263–264 的 `migrationStageHtml` 分支）的 `scopeSelector` 条件片段。
- **`index.html`** 删 `_migrationScope` 变量（约 3850）+ 两处复位（约 3292、3523）+ `getMigrationData` 里 `buildMigrationData` 调用的 `scope: _migrationScope` 和未用的 `fineTags:` 选项（约 3860–3863）。
- **smoke**：删「facets 可缩放范围」(约 3174)；T2(约 3228) 改为不再断言 `scopeSelector` 相关（保留「旧答案派生 chip 不渲染」断言）。
- `npm run check`（check_grammar_modules.py exports 契约）须随删项更新后全绿。

---

## 五、验证（TDD，红→绿→commit，每步一 commit）

1. **`countByPoint` 单测**（smoke 内 page.evaluate）：构造谓语题集，断言各 tense key 计数互不相同（present≠past≠perfect），keyless（pred-passive）数全部被动，keys 命中正确、空叶子=0。
2. **decision_map 结构**：smoke 断言 `pred_tense` 下 6 叶各带 `point.keys` 且并集覆盖、互不重叠；`l_art_spec` 不存在；用真实 `GRAMMAR_BANK` 派生 points 后 6 时态叶子 `countByPoint` 结果不全相等。
3. **`questionMatchesPoint`/`buildPointPracticePlan` 单测**：which 题集 → 仅命中 which；定从 which 不命中名从 which（tag 不同）；空池→hasQuestions=false。
4. **渲染接线**（smoke，最小 DOM 或 view-model 级）：词 chip 的 onclick 串含 `startByPointFromMap` 且带 word；谓语叶子迁移按钮带 tag+keys。
5. **Phase 2 删死代码 + 删旧 smoke**：`npm run check` 全绿；剩余 smoke 全绿。

`npm run check`（含 check_grammar_modules.py 的 exports 契约）必须全绿。浏览器验收：决策地图时态 6 节点计数不同；点 which chip 进 which 池；冠词无重复 the 叶。

---

## 六、单元边界小结

- `countByPoint`：纯函数，输入 (tag, keys, bank, errors) → 计数对象。不依赖 DOM。
- `questionMatchesPoint`：纯谓词。`buildPointPracticePlan`：纯 plan 构造，复用 `buildCategoryPracticeEntryModel`。
- `decision_map.js`：纯数据，叶子新增可选 `point` 字段，不破坏既有 `fine`/`cat`/`kd` 消费。
- index.html 仅接线（选择 count 函数、chip/按钮 onclick 改向），无新业务逻辑。
