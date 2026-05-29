# 讲题台渲染抽离(第二批·总装/埋点函数)实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans。Steps 用 `- [ ]` 跟踪。

**Goal:** 把 3 个总装/埋点函数(`buildMigrationContent`/`buildTeachingMigrationHtml`/`buildAnalysisContent`)的**纯渲染部分**迁入 `teaching-render.js`,主文件继续瘦身,行为零差异。

**Architecture:** 核心原则——模块函数**只接收「数据 model + 已生成的 HTML 片段」,纯拼字符串输出**;取数、副作用(埋点 `recordUsageEvent`、注册 `registerTeachingMigrationItem`/`clearTeachingMigrationRegistry`)、片段生成,**全留在 index.html 的 inline 编排**。副作用原位不变 = 行为零差异最强保证。分 3 个 checkpoint,每个迁一个函数即验证+commit。

**Tech Stack:** 原生 ES(IIFE + `window.GrammarTeachingRender` 全局)、Playwright(`page.evaluate` 断言)、`check_grammar_modules.py` 契约校验。

**上游:** 第一批 commit `dfc7633`;设计/计划 `docs/planning/2026-05-29-teaching-render-extraction-{design,plan}.md`。当前分支 `feature/teaching-render`。

---

## File Structure

| 文件 | 动作 |
|---|---|
| `docs/grammar-fill/modules/teaching-render.js` | 加 `migrationDrawerHtml` / `migrationStageHtml` / `analysisHtml` + 内部 helper `migrationEmptyHint` |
| `docs/grammar-fill/index.html` | 3 个函数改为「inline 编排 + 调模块」 |
| `scripts/check_grammar_modules.py` | `GrammarTeachingRender` exports 增 3 个 |
| `tests/smoke.spec.js` | render 单测加 3 个输出断言 |

通用提取规则(三个 Task 共用):从 index.html 对应函数的**拼 HTML 部分**原样搬入模块,仅做三处机械替换:① `escapeHtml(` → `window.escapeHtml(`;② `renderMigrationEmptyHint(` → 模块内部 `migrationEmptyHint(`;③ 句子/桥片段改为从入参取。**不改任何拼装结构、class、onclick 文本**。

---

## Task 1: migrationDrawerHtml(抽屉迁移,checkpoint 1)

**拆点:** `buildMigrationContent`(index.html)前 4 行 `clearTeachingMigrationRegistry()` + `getMigrationData(q)` + `getMigrationSourceSnapshot()` + `buildMigrationContentViewModel(...)` 留 inline;内嵌 `tab()`、`tabsHtml`、`emptyHint` 分支、`entries.forEach` 拼装迁入模块。entries 的 `sentenceHtml` 已由 `getMigrationData` 预生成,模块直接用 `entryModel.sentenceHtml`。

**Files:** teaching-render.js, index.html, check_grammar_modules.py, tests/smoke.spec.js

- [ ] **Step 1: render 单测加断言(红)**

在 smoke.spec.js 的 `teaching-render pure html output` 测试 evaluate 块内追加(在 return 对象前构造 + return 字段):
```js
    const migDrawer = R.migrationDrawerHtml({
      tabs: [{ key: 'bank', label: '真题', count: 3, active: true }],
      heading: '迁移练习', subline: '', countText: '共 1 题',
      entries: [{ id: 'x1', sentenceHtml: '<i>句子</i>', card: { sourceLabel: '2024浙江', questionNo: '5', tagLabel: '时态', ctaText: '点开讲', sourceAccent: false, typeTag: null } }]
    });
    const migDrawerEmpty = R.migrationDrawerHtml({ tabs: [], emptyHint: { primaryText: '暂无' } });
```
return 对象加:
```js
      migDrawerHasCard: migDrawer.includes('migration-card') && migDrawer.includes('teacher-quick-card'),
      migDrawerEmpty: migDrawerEmpty.includes('empty-hint'),
```
末尾加:
```js
  expect(out.migDrawerHasCard).toBe(true);
  expect(out.migDrawerEmpty).toBe(true);
```

- [ ] **Step 2: 跑红**

`npx playwright test tests/smoke.spec.js --project=chromium -g "teaching-render pure html output"` → FAIL(`migrationDrawerHtml` 未定义,`migDrawer.includes` 抛错或 undefined)。

- [ ] **Step 3: 模块加 migrationEmptyHint + migrationDrawerHtml**

在 teaching-render.js 的 `window.GrammarTeachingRender = {` 之前,按通用提取规则从 index.html `renderMigrationEmptyHint`(改名 `migrationEmptyHint`)和 `buildMigrationContent` 的拼 HTML 部分搬入两个函数。`migrationDrawerHtml(contentModel)` 内的 `renderMigrationEmptyHint(` 改为 `migrationEmptyHint(`。

- [ ] **Step 4: inline buildMigrationContent 改桥**

index.html `buildMigrationContent` 改为:
```js
function buildMigrationContent(q) {
  clearTeachingMigrationRegistry();
  var data = getMigrationData(q);
  var migrationSource = getMigrationSourceSnapshot().migrationSource;
  var contentModel = window.GrammarMigrationTraining.buildMigrationContentViewModel(data, migrationSource);
  return window.GrammarTeachingRender.migrationDrawerHtml(contentModel);
}
```

- [ ] **Step 5: check_grammar_modules.py exports 加 `migrationDrawerHtml`**

(不导出内部 helper `migrationEmptyHint`)

- [ ] **Step 6: npm run check 全绿**

`npm run check` → 末行 `OK: all engineering checks passed`,10+ 测试通过。

- [ ] **Step 7: checkpoint commit**

`git add` 4 文件 + `git commit -m "refactor(grammar-fill): extract migrationDrawerHtml to teaching-render"`

---

## Task 2: migrationStageHtml(讲题台迁移,checkpoint 2)

**拆点:** `buildTeachingMigrationHtml` 的 `getMigrationData` + `getMigrationSourceSnapshot` + `buildMigrationContentViewModel` + `recordUsageEvent(...)`(埋点)留 inline。**关键:讲题台版句子用 `renderTeachingMigrationSentence(item, id)` 渲染时调**——按原则,inline 先给每个 entry 补 `stageSentenceHtml`,模块只用它。内嵌 `sourceTab()` + entries 拼装迁入模块。

**Files:** teaching-render.js, index.html, check_grammar_modules.py, tests/smoke.spec.js

- [ ] **Step 1: render 单测加断言(红)**

evaluate 块加:
```js
    const migStage = R.migrationStageHtml({
      tabs: [{ key: 'bank', label: '真题', count: 2, active: true }],
      heading: '迁移训练', subline: '同考点', countText: '共 1 题',
      entries: [{ id: 's1', item: {}, stageSentenceHtml: '<i>句</i>', row: { rowClass: '', indexText: '1', typeClass: '', typeLabel: '真题', sourceText: '2024', tagLabel: '时态', teachingLine: '讲法' } }]
    });
    const migStageEmpty = R.migrationStageHtml({ tabs: [], emptyHint: { primaryText: '暂无' } });
```
return 对象加:
```js
      migStageHasRow: migStage.includes('teaching-migration-row') && migStage.includes('teaching-migration-source-tabs'),
      migStageEmpty: migStageEmpty.includes('empty-hint'),
```
末尾加 `expect(out.migStageHasRow).toBe(true); expect(out.migStageEmpty).toBe(true);`

- [ ] **Step 2: 跑红** → FAIL(`migrationStageHtml` 未定义)。

- [ ] **Step 3: 模块加 migrationStageHtml(contentModel)**

按提取规则从 `buildTeachingMigrationHtml` 拼 HTML 部分搬入:内嵌 `sourceTab`、`teaching-migration-source-tabs`、标题、emptyHint 分支(用内部 `migrationEmptyHint`)、`teaching-migration-scroll` + entries.forEach。**唯一改动**:entries 里 `renderTeachingMigrationSentence(item, entryModel.id)` → `entryModel.stageSentenceHtml`;`escapeHtml` → `window.escapeHtml`。

- [ ] **Step 4: inline buildTeachingMigrationHtml 改**

```js
function buildTeachingMigrationHtml(q) {
  var data = getMigrationData(q);
  var migrationSource = getMigrationSourceSnapshot().migrationSource;
  var contentModel = window.GrammarMigrationTraining.buildMigrationContentViewModel(data, migrationSource);
  recordUsageEvent('migration_training_viewed', 'migration-training', {
    source: migrationSource,
    question_no: q ? (q.no || null) : null,
    category: q ? (q.category || '') : '',
    fine_category: q ? (q.fine_category || '') : '',
    pool_count: contentModel.poolCount || 0,
    shown_count: contentModel.shownCount || 0
  });
  contentModel.entries.forEach(function(e) { e.stageSentenceHtml = renderTeachingMigrationSentence(e.item, e.id); });
  return window.GrammarTeachingRender.migrationStageHtml(contentModel);
}
```

- [ ] **Step 5: check exports 加 `migrationStageHtml`**

- [ ] **Step 6: npm run check 全绿**

- [ ] **Step 7: checkpoint commit** `-m "refactor(grammar-fill): extract migrationStageHtml to teaching-render"`

---

## Task 3: analysisHtml(抽屉解析,checkpoint 3)

**拆点:** `buildAnalysisContent` 全部取数(`renderSentenceWithBlank`/`getQuestionChineseSentence`/`safeQuestionFocus`/`getNonpAxis`/`getQuestionPracticalGuide`/`countAnalysisMigrationCandidates`/`getTeachingSessionSnapshot`)+ 算 `buildAnalysisPanelModel` + 调桥拿 `guideHtml`/`solutionHtml` + 句子片段 `sent`,全留 inline;`navHtml` 拼装 + 最终 HTML 拼装迁入模块 `analysisHtml(model, parts)`,`parts = { sentHtml, guideHtml, solutionHtml }`。

**Files:** teaching-render.js, index.html, check_grammar_modules.py, tests/smoke.spec.js

- [ ] **Step 1: render 单测加断言(红)**

evaluate 块加:
```js
    const analysis = R.analysisHtml(
      { answer: 'learning', floatButtons: [{ key: 'guide', label: '讲题卡' }], zhSentence: '中文句', showNavigation: true, migrationCount: 2 },
      { sentHtml: '<span>SENT</span>', guideHtml: '<div>G</div>', solutionHtml: '<div>S</div>' }
    );
```
return 对象加:
```js
      analysisHasRow: analysis.includes('analysis-answer-row-lg') && analysis.includes('SENT') && analysis.includes('analysis-answer-tools'),
      analysisHasNav: analysis.includes('navigateBlank') && analysis.includes('switchDrawerTab'),
```
末尾加 `expect(out.analysisHasRow).toBe(true); expect(out.analysisHasNav).toBe(true);`

- [ ] **Step 2: 跑红** → FAIL(`analysisHtml` 未定义)。

- [ ] **Step 3: 模块加 analysisHtml(model, parts)**

按提取规则从 `buildAnalysisContent` 的 `navHtml` 计算 + `return '<div class="analysis-answer-row-lg">' ...` 拼装部分搬入。机械替换:`model.*` 保持;`sent` → `parts.sentHtml`;`guideHtml` → `parts.guideHtml`;`solutionHtml` → `parts.solutionHtml`;`escapeHtml(` → `window.escapeHtml(`。`navHtml` 用 `model.showNavigation`/`model.migrationCount`,`onclick="navigateBlank(...)"`/`switchDrawerTab(...)` 文本原样保留。

- [ ] **Step 4: inline buildAnalysisContent 改**

index.html `buildAnalysisContent` 改为:
```js
function buildAnalysisContent(q) {
  q = q || {};
  var sent = renderSentenceWithBlank(q, true);
  var zhSentence = getQuestionChineseSentence(q);
  var focus = safeQuestionFocus(q);
  var nonpAxis = getNonpAxis(q);
  var practicalGuide = getQuestionPracticalGuide(q, focus, nonpAxis);
  var migrationCount = 0;
  try {
    migrationCount = window.GrammarMigrationTraining.countAnalysisMigrationCandidates(q, {
      bankQuestions: ALL_QUESTIONS,
      focus: focus,
      nonpAxis: nonpAxis,
      practicalGuide: practicalGuide,
      safeQuestionFocus: safeQuestionFocus,
      safeQuestionFocusKey: safeQuestionFocusKey,
      getNonpAxis: getNonpAxis,
      getQuestionPracticalGuide: getQuestionPracticalGuide
    });
  } catch(e) {}
  var session = getTeachingSessionSnapshot().teachingSession;
  var model = window.GrammarTeachingGuide.buildAnalysisPanelModel(q, {
    zhSentence: zhSentence,
    practicalGuide: practicalGuide,
    teachingSession: session,
    migrationCount: migrationCount
  });
  return window.GrammarTeachingRender.analysisHtml(model, {
    sentHtml: sent,
    guideHtml: buildPracticalGuideHtml(model.practicalGuide),
    solutionHtml: renderSolutionCard(model.solution)
  });
}
```

- [ ] **Step 5: check exports 加 `analysisHtml`**

- [ ] **Step 6: npm run check 全绿**

- [ ] **Step 7: checkpoint commit** `-m "refactor(grammar-fill): extract analysisHtml to teaching-render"`

---

## 完成定义

- [ ] 3 个模块函数(`migrationDrawerHtml`/`migrationStageHtml`/`analysisHtml`)迁入,内部 `migrationEmptyHint` helper 复用
- [ ] index.html 3 个函数 = 「inline 取数/副作用编排 + 调模块」;埋点 `recordUsageEvent`、注册 `clearTeachingMigrationRegistry`/`getMigrationData` **原位保留**
- [ ] `check_grammar_modules.py` exports 增 3 个(不含 helper),18 modules 仍通过
- [ ] render 单测加 6 条断言,全绿
- [ ] 每个 checkpoint `npm run check` 全绿后才 commit
- [ ] 主文件再瘦约 130–180 行

## 非目标(YAGNI)

- 不改任何拼装结构/class/onclick 文本/CSS — 纯平移
- 不动 `getMigrationData`/`renderTeachingMigrationSentence`/`renderSentenceWithBlank` 等取数/片段函数(留 inline 作编排)
- 不碰交互函数(`switchDrawerTab`/`renderTeachingStage`/`setMigrationSource`)
- 不引入构建工具

## 行为不变保证

每个 checkpoint:① 副作用留原位(埋点次数、注册时机不变) ② `npm run check` 含 core path 真实渲染讲题台/抽屉/迁移 ③ render 单测断言模块输出含关键 class/片段。三层兜底。
