# 设计：考点视图（文字）改为叶子驱动 + 可点进迁移

> 日期：2026-06-01
> 起因：5 点反馈上线后，组长试用反馈"文字视图也得变（精确）、并且能链接进去"。
> 前序：本轮建立在已上线的 `feat/ui-feedback-points-dock`（考点训练 dock 页：图=决策地图 / 文字=考点视图）之上。

## 背景与问题

「考点训练」dock 页有两个视图：
- **图**（`renderSystemView` / 决策地图）：基于新 `points` 体系，叶子精确到具体时态/语态等，点叶子 = 精准迁移（which→which）。
- **文字**（`renderFineCategoryView` / 考点视图）：基于旧 `fine_category`，"时态"是一坨 tag；而且**点击只弹 `alert()`，根本不进迁移**（`buildFineCategoryViewModel` 的 `action:{type:'alert'}`）。

两个问题：
1. **不精确**：文字视图 102 个 fine-tag 里"时态"等是粗的一坨，和图的精确叶子对不上（同叫"时态"，图 12 题 points 口径、文字 8 题 fine_category 口径，计数矛盾）。
2. **点不进去**：文字视图的 tag 点击只 alert，不能进同类训练。

**目标**：让文字视图 = 决策地图叶子拍平成清单，每个叶子可点进**与图完全一致**的精准迁移。图是树、文字是清单，同一份精确数据两种布局。

## 决策（已与用户确认）

- **粒度**：镜像决策地图叶子（一般现在/一般过去/将来·过去将来/进行体/完成体/完成进行/被动构成/主动表被动/主谓一致 4 叶/非谓语 to do·doing·done/名词·数词各叶/形容词·副词·比较级各叶/冠词 a/an·the/代词各叶/介词各叶/逻辑·定从·名从·状从各叶）。
- **0 题叶子**：置灰显示、不可点（与图的词 chip / "暂无题"一致；老师能看到完整考点全貌，传新卷自然激活）。
- **布局**：保留现有卡片网格（大类卡 + chips），chips 改为"叶子"、可点。
- **旧网格 builder**：删除（不留死代码）。

## 改动

### 1. 纯模块：新增叶子清单 builder（knowledge-view-model.js）

新增 `buildPointsLeafListModel(decisionNodes, fineTags, bankQuestions, errorQuestions, categoryMap)`：
- `buildDecisionTree(decisionNodes)` 拿到 tree（byId/childrenOf/rootId，节点带 cat/point/fine/parent/title）。
- 收集**叶子**（childrenOf 为空的节点）。
- 按 `leaf.cat` 分组，分组顺序对齐 `DEFAULT_CATEGORY_NAMES` 的大类顺序（predicate→…→advclause）；无 cat 的叶子归"其他"或跳过（决策树里叶子都带 cat，正常不会有）。
- 每叶子产出：
  ```
  {
    id, title,
    breadcrumb,            // 「按考点 · 粗类 · 父分组 · 叶子」
    counts,               // {bank,error,real,total}
    badge,                // formatCountBadge(counts)
    frequencyStyle,       // getFrequencyStyle(counts.total) —— 颜色=频次
    clickable,            // total > 0
    action                // {kind:'point', tag, keys} | {kind:'fine', fine}
  }
  ```
  - count：`leaf.point ? countByPoint(point.tag, point.keys, ...) : countByFineTag(leaf.fine, ...)`。
  - action：`leaf.point ? {kind:'point', tag:point.tag, keys:point.keys} : {kind:'fine', fine:leaf.fine}`。
- 分组产出：`{ id:cat, titleText:categoryMap[cat], leaves:[...], total, leafCount }`，total = 组内 leaves 计数和。
- 返回：`{ empty, header:{titleText,descriptionText}, legend:buildFineCategoryLegendModel(), groups:[...] }`。

新增纯函数 `buildPointBreadcrumb(tree, nodeId, categoryMap)`：叶子→「按考点 · 粗类 · 父分组(≠粗类时) · 叶子」。与 index.html 现有 `dmBreadcrumb` 同逻辑——**抽到这里做单一来源**，`dmBreadcrumb` 改为调用它（DRY）。

导出 `buildPointsLeafListModel`、`buildPointBreadcrumb`（加 check_grammar_modules.py 契约）。

### 2. 渲染：重写 renderFineCategoryView（index.html）

- 改用 `buildPointsLeafListModel(window.GRAMMAR_DECISION_MAP.nodes, GRAMMAR_FINE_TAGS, ALL_QUESTIONS, errorBookQuestions, CATEGORY_MAP)`。
- 保留卡片网格外观（大类卡 + 频次色 + 角标总数 + 图例）。
- chips 改为叶子：
  - 可点（total>0）：`onclick` 按 action 走 `startByPointFromMap(tag, keys, breadcrumb)` 或 `startMigrationFromMap(fine)`；breadcrumb 经 `graphEscapeAttr` 转义。
  - 不可点（total=0）：置灰（opacity .4）、无 onclick（或 onclick 空）。
  - chip 文本：叶子 title + `badge`（如"一般现在 12 · 真题5 · 模拟7"，或精简）。
- header 文案更新为叶子导向（如"🏷️ 考点视图 · 点任一考点直接进同类训练；颜色=题量频次"）。
- `dmBreadcrumb` 改调用 `buildPointBreadcrumb`（共用）。

### 3. 一致性修复：startMigrationFromMap 返回指向

`startMigrationFromMap`（fine 叶子迁移）现仍 `setPreviousView({ page:'knowledge' })`——决策地图已迁到考点训练，应改 `{ page:'points-training' }`，与 `startByPointFromMap` 一致。

### 4. 删除旧网格 builder（knowledge-view-model.js + 契约 + smoke）

- 删 `buildFineCategoryModel`、`buildFineCategoryViewModel`、`buildFineCategoryTagMessage`（grid + alert 专用，重写后无引用）。
- **保留** `getFrequencyStyle`、`buildFineCategoryLegendModel`（频次色 + 图例，新视图复用）、`countByFineTag`、`countByPoint`、`formatCountBadge`。
- 同步删 check_grammar_modules.py 中这 3 个导出项。
- 删/改 smoke 中针对 `buildFineCategoryViewModel`/`buildFineCategoryModel`/`buildFineCategoryTagMessage` 的断言；新增 `buildPointsLeafListModel` 断言。

## 验证

- `npm run check` 全绿。
- smoke：
  - `buildPointsLeafListModel`：分组数=有叶子的大类数；谓语组含 6 个时态叶子；某 point 叶子 action.kind==='point' 且 keys 正确；某 fine 叶子 action.kind==='fine'；0 题叶子 clickable===false；breadcrumb 含"按考点 · 谓语动词 · 时态 · 一般现在"。
  - `buildPointBreadcrumb`：present 叶子→"按考点 · 谓语动词 · 时态 · 一般现在"。
  - 扩展「考点训练页」浏览器 smoke：切文字 → 点一个具体时态 chip（如一般现在）→ 落 `#page-practice`、标题=该叶子 breadcrumb、题目全为该 point。
- preview 视觉：文字视图卡片列精确叶子、可点、0 题置灰；点进去标题精确、返回回考点训练。

## 不做（YAGNI）

- 不改图（renderSystemView）的渲染结构，只把 breadcrumb 抽成共用纯函数。
- 不改迁移引擎 / points 体系本身。
- 不动 docs/index.html（首页是并行会话领域）。
- SVA 4 叶仍共享 pred-agreement 计数/迁移（无 agreement 子 facet，与图现状一致，留后）。
