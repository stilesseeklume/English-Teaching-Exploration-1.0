# 设计 · 讲题台渲染层抽离(第一批)

> 日期:2026-05-29
> 状态:设计已与用户确认,待写实现计划
> 上游:[roadmap.md](roadmap.md) · [PROJECT_CHARTER.md](../../PROJECT_CHARTER.md) · [AGENTS.md](../../AGENTS.md)
> 性质:**重构**(行为零差异),不是功能开发,不是 UI 改版

---

## 1. 背景与目标

`docs/grammar-fill/index.html` 的主内联脚本约 5636 行(3933–9569)。其中决策逻辑大多已抽进 31 个外部模块,主文件剩下的是"渲染层 + 接线层"。本次目标:把讲题台/抽屉的一批**纯渲染函数**(数据→HTML 字符串)抽进一个新的渲染层模块,让主文件继续瘦身,并立起一个可复用的"渲染层模块"模式。

**这是用户选定的"瘦身见效"方向的第一批**,范围刻意收窄到"最安全的纯叶子",把容易出错的总装函数和带副作用的函数隔离在外。

### 判断标尺(对齐 PROJECT_CHARTER 阶段 2)
本次属于"让加 v2 题型时少写代码、少出错"的架构改善:渲染层独立后,未来题型的 HTML 拼装有明确的家,且 view-model 数据层保持纯净可测。

---

## 2. 范围

### 2.1 第一批迁移的 6 个纯叶子(已确认:无 DOM、无埋点、纯字符串拼装)

| 函数 | 当前行号 | 区 | 依赖要点 |
|---|---|---|---|
| `buildPracticalGuideHtml` | 6808 | 抽屉 | `escapeHtml` |
| `renderSolutionCard` | 6828 | 抽屉 | `escapeHtml` |
| `buildSolutionPanelHtml` | 6852 | 抽屉 | `GrammarTeachingGuide.buildSolutionPanelModel`,模块内调 `renderSolutionCard` |
| `buildTheoryContent` | 7770 | 抽屉/讲题 | `GrammarTeachingGuide.buildTheoryPanelModel`(需 `KNOWLEDGE_DATA`/`CATEGORY_MAP`/`safeQuestionFocus`/`getFineTagInfo`)、`escapeHtml` |
| `buildTeachingGuideHtml` | 7304 | 讲题台 | `getTeachingHeaderInfo`、`GrammarTeachingGuide.buildGuidePanelModel`,模块内调 `buildPracticalGuideHtml` |
| `buildTeachingKnowledgeHtml` | 7368 | 讲题台 | `teachingViewModelDeps`、`getGraphNodeIndex`、`GrammarTeachingViewModel.buildTeachingKnowledgePanelModel`、`escapeHtml` |

> 行号是 2026-05-29 现状,实现时以函数名为准定位(主文件会变动)。

### 2.2 明确不切(本批),及理由

| 函数 | 行号 | 不切的理由 |
|---|---|---|
| `buildTeachingMigrationHtml` | 7315 | 内部调 `recordUsageEvent('migration_training_viewed', ...)`,**带埋点副作用**,不是纯函数;且依赖 `renderTeachingMigrationSentence`。下一批切时需先把埋点剥离到 inline 调用点。 |
| `buildAnalysisContent` | 6889 | 总装函数,依赖一大串 inline 函数(`renderSentenceWithBlank`、`getQuestionChineseSentence`、`getNonpAxis`、`getQuestionPracticalGuide`、`getTeachingSessionSnapshot` 等),依赖网大,留待摸清模式后再切。 |
| `buildMigrationContent` | 7706 | 总装函数,依赖 `getMigrationData`/`getMigrationSourceSnapshot`/`registerTeachingMigrationItem` 等,同上。 |

---

## 3. 设计

### 3.1 新模块

- 路径:`docs/grammar-fill/modules/teaching-render.js`
- 命名空间:`window.GrammarTeachingRender`
- 定位:**渲染层纯模块**。输入数据/model,输出 HTML 字符串。不得出现 `document`/`querySelector`/`getElementById`/`addEventListener`/`innerHTML`/`localStorage`/`sessionStorage`/`fetch`/`alert`/`confirm`/`navigator`/`location`,也不得做埋点等副作用。可过 `check_grammar_modules.py` 的纯模块禁用清单。
- 与现有分层的关系:`view-model 算数据 → teaching-render 拼 HTML → index.html 塞页面 + 处理点击`。这是 grammar-fill 第一个渲染层模块,但 `shared/`(admin-ui/auth-ui/ai-assistant)早有"拼 HTML 字符串"的先例,模式一致。

### 3.2 依赖处理三原则

1. **全局基础设施直接用**:`escapeHtml`(shared/utils.js,全局,加载在前)、`window.GrammarTeachingGuide`、`window.GrammarTeachingViewModel`。模块内用 `window.escapeHtml` 形式引用以表明来源。
2. **inline 辅助函数与数据常量,通过 `deps` 对象参数注入**:如 `getTeachingHeaderInfo`、`teachingViewModelDeps`、`getGraphNodeIndex`、`KNOWLEDGE_DATA`、`CATEGORY_MAP`、`safeQuestionFocus`、`getFineTagInfo`。沿用代码库已有的 deps 注入模式(现有 build* 已用 `window.GrammarTeachingGuide.buildTheoryPanelModel(q, {knowledgeData, categoryMap, ...})` 这种写法)。
3. **副作用一律留在 inline 调用点**:模块内不得出现 `recordUsageEvent` 等。本批不涉及埋点函数,此原则用于约束后续批次。

### 3.3 函数签名(示意,实现时定稿)

```js
// teaching-render.js
// view-model(GrammarTeachingGuide / TeachingViewModel)按原则① 全局直接调;
// deps 只注入 inline 辅助函数与数据常量(原则②)。
window.GrammarTeachingRender = {
  practicalGuideHtml: function(guide) { /* 纯拼装,仅用 escapeHtml */ },
  solutionCard: function(model) { /* 纯拼装 */ },
  solutionPanelHtml: function(q) { return this.solutionCard(window.GrammarTeachingGuide.buildSolutionPanelModel(q)); },
  theoryContent: function(q, deps) { /* window.GrammarTeachingGuide.buildTheoryPanelModel(q, deps) + 拼装;deps = {knowledgeData, categoryMap, safeQuestionFocus, getFineTagInfo} */ },
  teachingGuideHtml: function(q, practicalGuide, deps) { /* deps.getTeachingHeaderInfo(q) + window.GrammarTeachingGuide.buildGuidePanelModel + this.practicalGuideHtml */ },
  teachingKnowledgeHtml: function(q, deps) { /* deps.teachingViewModelDeps()/getGraphNodeIndex() + window.GrammarTeachingViewModel.buildTeachingKnowledgePanelModel + 拼装 */ },
};
```

> 模块内互调用 `this.xxx` 或局部函数引用,保持 `buildSolutionPanelHtml→renderSolutionCard`、`buildTeachingGuideHtml→buildPracticalGuideHtml` 的关系。

### 3.4 加载顺序

`teaching-render.js` 依赖 `teaching-view-model.js` 与 `teaching-guide.js`,故插入到 modules 加载序的**末尾**(`app-state.js` 之后)、主内联 `<script>` 之前。需同步更新 `check_grammar_modules.py` 的 `EXPECTED_MODULES` 顺序。

### 3.5 index.html 改动

6 个函数体移走;原位置改为对 `window.GrammarTeachingRender.*` 的调用(薄包装函数,保持旧函数名以最小化调用点改动,或直接替换调用点)。主要调用点:
- `switchDrawerTab`(约 6577–6581):`buildAnalysisContent`/`buildTheoryContent`/`buildMigrationContent`——本批只换 `buildTheoryContent`
- `renderTeachingStage` 的 `contentHtml` 组装
- `setTeachingTab` / 抽屉浮层逻辑里对上述叶子的引用

保留薄包装(如 `function buildTheoryContent(q){ return window.GrammarTeachingRender.theoryContent(q, theoryDeps()); }`)是允许的兼容桥,新代码应直接走模块。

---

## 4. 行为不变保证

- 迁移本质是**剪切-粘贴 + 加 deps 参数**,不改任何拼装逻辑、不改任何 CSS class、不改任何 `onclick` 文本。
- 切前切后,讲题台与抽屉的 HTML 输出应逐字符一致(除非 deps 注入引入空白差异,实现时核对)。

---

## 5. 验证步骤(行为不变的执行序)

1. 记回滚基线:`git rev-parse --short HEAD` + `git status --short --branch`。
2. 新建 `feature/teaching-render` 分支(`main` 保持随时可演示)。
3. 建 `teaching-render.js`,搬入 6 个函数 + 导出对象。
4. 改 `index.html`:调用点改走模块 + 调整 `<script>` 加载顺序。
5. **更新 `scripts/check_grammar_modules.py`**:`EXPECTED_MODULES` 加 teaching-render 条目(namespace + exports 白名单)并放到正确加载位置。
6. 新增纯逻辑单测(见 §6)。
7. `npm run check` 全绿。
8. 人眼验收(见 §6)。
9. checkpoint commit(默认不 push,不 tag)。

---

## 6. 测试计划

- **新增纯逻辑单测**(沿用现有"纯模块单测"模式):构造假 `q`/`model` + 假 `deps`,断言输出 HTML 含关键 class / 文本片段(如 `teaching-tab-heading`、`teaching-tab-kicker`、考点路径链、`analysis-solution-card`)。
- **更新 `tests/smoke.spec.js`**(若已有讲题台渲染断言):按 AGENTS.md 要求,模块导出变化时同步。
- **人眼验收清单**:
  - 讲题台三 tab:做题思路/考点(solve/point 切换)、迁移、考点理论——各点开,对比切前切后视觉一致
  - 抽屉:答案行、解题卡、考点理论面板——逐个点开核对
  - 暗黑模式下复看一遍(CSS var 依赖)

---

## 7. 风险与缓解

| 风险 | 缓解 |
|---|---|
| 碰命门区(讲题台/抽屉是教研会演示主路径) | 纯剪切粘贴行为不变 + 9 条 smoke + 人眼逐面板验 + feature 分支可一键回滚 |
| deps 注入遗漏某依赖,导致运行时 `undefined` | `npm run check` 的 smoke 会在讲题台路径暴露;人眼验收兜底 |
| `check_grammar_modules.py` 白名单/顺序漏更新 | 列入 §5 步骤 5,且 `npm run check` 会因顺序不符直接 FAIL |

**本批主动隔离了最容易出错的部分**:不动总装函数、不动埋点函数。

---

## 8. 完成定义

- [ ] `teaching-render.js` 建好,6 个纯叶子迁入,模块内互调保留
- [ ] index.html 调用点改走模块,加载顺序正确
- [ ] `check_grammar_modules.py` 更新并通过
- [ ] 新增纯逻辑单测通过
- [ ] `npm run check` 全绿
- [ ] 人眼验收清单全过(含暗黑模式)
- [ ] 主文件减少约 130–150 行
- [ ] `PROJECT_LOG.md` 记一条(按 AGENTS.md:拆模块需记日志)

---

## 9. 非目标(YAGNI)

- 不切 `buildTeachingMigrationHtml`(埋点)、`buildAnalysisContent`/`buildMigrationContent`(总装)——下一批
- 不切非命门区的 build*(图谱/知识库/首页)——可作为后续批次
- 不动任何交互/事件/DOM 渲染函数(`switchDrawerTab`、`renderTeachingStage` 等本体)
- 不引入构建工具、不改 UI、不改数据模型
