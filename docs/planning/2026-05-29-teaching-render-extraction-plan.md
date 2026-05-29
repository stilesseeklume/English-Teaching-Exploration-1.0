# 讲题台渲染层抽离(第一批)实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把讲题台/抽屉的 6 个纯叶子 build* 函数抽进新模块 `docs/grammar-fill/modules/teaching-render.js`,主文件保留薄兼容桥,行为零差异。

**Architecture:** 新建"渲染层"纯模块(数据/model 进、HTML 字符串出,无 DOM/无副作用),与现有"view-model 数据层"分工。index.html 里 6 个旧函数体替换为转发桥,所有现有调用点零改动。inline 依赖通过 deps 对象注入。

**Tech Stack:** 原生 ES(IIFE + `window.Namespace` 全局挂载)、Python 模块契约校验(`check_grammar_modules.py`)、Playwright(`page.evaluate` 断言)。

**上游:** [设计文档](2026-05-29-teaching-render-extraction-design.md)

---

## File Structure

| 文件 | 动作 | 责任 |
|---|---|---|
| `docs/grammar-fill/modules/teaching-render.js` | 创建 | 6 个纯渲染函数(数据→HTML 字符串) |
| `docs/grammar-fill/index.html` | 修改 | 6 个旧函数体→转发桥;`<script>` 加载顺序加一行 |
| `scripts/check_grammar_modules.py` | 修改 | `EXPECTED_MODULES` 登记新模块 |
| `tests/smoke.spec.js` | 修改 | 加 render 输出断言 |
| `PROJECT_LOG.md` | 修改 | 记一条 |

---

## Task 0: 准备分支与回滚基线

- [ ] **Step 1: 记回滚基线**

```bash
cd /Users/zhenliu/Desktop/英语教学系统1.0
git rev-parse --short HEAD
git status --short --branch
```
记下短哈希备用。

- [ ] **Step 2: 建并切到 feature 分支**

```bash
git checkout -b feature/teaching-render
```
Expected: `Switched to a new branch 'feature/teaching-render'`

---

## Task 1: 写 render 输出单测(先红)

**Files:** Modify `tests/smoke.spec.js`(末尾追加新 `test`,与现有 test 同级)

- [ ] **Step 1: 追加 render 单测**

```js
test('teaching-render pure html output', async ({ page }) => {
  await page.goto('/grammar-fill/index.html');
  await page.waitForFunction(() => !!window.GrammarTeachingGuide);

  const out = await page.evaluate(() => {
    const R = window.GrammarTeachingRender;
    if (!R) return { missing: true };
    const practical = R.practicalGuideHtml({
      title: '考点：谓语动词', trigger: '抓主语和时间线索。',
      steps: ['第一步', '第二步'], commonMistake: '只看最近名词。'
    });
    const solveDual = R.solutionCard({ hasSolve: true, solveText: '先看括号', pointText: '考查动词' });
    const solvePoint = R.solutionCard({ pointText: '考查时态' });
    const solutionPanel = R.solutionPanelHtml({ answer: 'learn', solve: '先看括号', explanation: '考查动词' });
    const theoryCategory = Object.keys(window.KNOWLEDGE_DATA || {})[0] || '谓语动词';
    const theory = R.theoryContent({ category: theoryCategory, fine_category: '', answer: 'learn' }, {
      knowledgeData: window.KNOWLEDGE_DATA || {}, categoryMap: window.CATEGORY_MAP || {},
      safeQuestionFocus: function() { return { key: theoryCategory, label: theoryCategory, note: '' }; },
      getFineTagInfo: function() { return null; }
    });
    const emptyTheory = R.theoryContent({ category: 'missing-smoke' }, {
      knowledgeData: {}, categoryMap: { 'missing-smoke': '缺失考点' },
      safeQuestionFocus: function() { return { key: 'missing-smoke', label: '缺失考点', note: '' }; },
      getFineTagInfo: function() { return null; }
    });
    const guideHtml = R.teachingGuideHtml({ category: '谓语动词', answer: 'learn' }, null, {
      getTeachingHeaderInfo: function() { return { headline: 'G', subline: 'S', practicalGuide: null }; }
    });
    return {
      missing: false,
      practicalHasCard: practical.includes('teacher-quick-card'),
      practicalHasStepNo: practical.includes('teacher-quick-step-no'),
      solveDualHasToggle: solveDual.includes('analysis-solution-card sol-dual') && solveDual.includes('做题思路'),
      solvePointPlain: solvePoint.includes('analysis-solution-card') && !solvePoint.includes('sol-dual'),
      solutionPanelHasCard: solutionPanel.includes('analysis-solution-card'),
      theoryHasNowCard: theory.includes('theory-now-card') && theory.includes('lesson-path-chip'),
      emptyTheoryHint: emptyTheory.includes('empty-hint'),
      guideHasTitle: guideHtml.includes('teaching-tab-heading') && guideHtml.includes('teaching-tab-kicker')
    };
  });

  expect(out.missing).toBe(false);
  expect(out.practicalHasCard).toBe(true);
  expect(out.practicalHasStepNo).toBe(true);
  expect(out.solveDualHasToggle).toBe(true);
  expect(out.solvePointPlain).toBe(true);
  expect(out.solutionPanelHasCard).toBe(true);
  expect(out.theoryHasNowCard).toBe(true);
  expect(out.emptyTheoryHint).toBe(true);
  expect(out.guideHasTitle).toBe(true);
});
```

> `teachingKnowledgeHtml` 依赖完整图谱数据,放 Task 5 人眼验收;此处覆盖其余 5 个 + `teachingGuideHtml`。

- [ ] **Step 2: 跑单测,确认失败**

```bash
npx playwright test tests/smoke.spec.js --project=chromium -g "teaching-render pure html output"
```
Expected: FAIL。`window.GrammarTeachingRender` 不存在,`out.missing` 为 `true`,首条断言失败。

---

## Task 2: 创建 teaching-render.js(第一部分:3 个无 deps 函数)

**Files:** Create `docs/grammar-fill/modules/teaching-render.js`

- [ ] **Step 1: 建文件骨架 + practicalGuideHtml / solutionCard / solutionPanelHtml**

```js
// grammar-fill/modules/teaching-render.js
//
// Pure teaching/drawer render helpers. Data/model in, HTML string out.
// No DOM access, no side effects (no telemetry, no storage, no network).

/* eslint-disable */
(function(){
  function practicalGuideHtml(guide) {
    var model = window.GrammarTeachingGuide.buildPracticalGuideCardModel(guide);
    if (!model.visible) return '';
    var steps = model.steps.map(function(step, idx) {
      return '<div class="teacher-quick-step">'
        + '<span class="teacher-quick-step-no">' + (idx + 1) + '</span>'
        + '<span>' + window.escapeHtml(step) + '</span>'
        + '</div>';
    }).join('');
    return '<section class="teacher-quick-card">'
      + '<div class="teacher-quick-head">'
      + '<div class="teacher-quick-kicker">' + window.escapeHtml(model.kicker) + '</div>'
      + '<div class="teacher-quick-title-line">' + window.escapeHtml(model.titleLine) + '</div>'
      + '</div>'
      + (model.trigger ? '<div class="teacher-quick-lead">' + window.escapeHtml(model.trigger) + '</div>' : '')
      + (steps ? '<div class="teacher-quick-steps">' + steps + '</div>' : '')
      + (model.mistake ? '<div class="teacher-quick-warn">常错：' + window.escapeHtml(model.mistake) + '</div>' : '')
      + '</section>';
  }

  function solutionCard(model) {
    model = model || {};
    if (model.hasSolve) {
      return '<div class="analysis-solution-card sol-dual">'
        + '<div class="sol-toggle">'
        +   '<button type="button" class="sol-chip sol-chip-solve" onclick="setSolutionView(\'solve\')">做题思路</button>'
        +   '<button type="button" class="sol-chip sol-chip-point" onclick="setSolutionView(\'point\')">考点</button>'
        + '</div>'
        + '<div class="sol-text sol-solve"><strong>做题思路：</strong>' + window.escapeHtml(model.solveText) + '</div>'
        + '<div class="sol-text sol-point"><strong>考点：</strong>' + window.escapeHtml(model.pointText) + '</div>'
        + '</div>';
    }
    return '<div class="analysis-solution-card"><strong>解题：</strong>' + window.escapeHtml(model.pointText || model.text || '') + '</div>';
  }

  function solutionPanelHtml(q) {
    return solutionCard(window.GrammarTeachingGuide.buildSolutionPanelModel(q));
  }

  window.GrammarTeachingRender = {
    practicalGuideHtml: practicalGuideHtml,
    solutionCard: solutionCard,
    solutionPanelHtml: solutionPanelHtml
  };
})();
```

> 与 index.html 原函数唯一差异:`escapeHtml` → `window.escapeHtml`。下面 Step 2–3 继续把另 3 个函数加入本文件并补全导出。

- [ ] **Step 2: 在导出对象前插入 theoryContent 与 teachingGuideHtml**

```js
  function theoryContent(q, deps) {
    deps = deps || {};
    var model = window.GrammarTeachingGuide.buildTheoryPanelModel(q, {
      knowledgeData: deps.knowledgeData,
      categoryMap: deps.categoryMap,
      safeQuestionFocus: deps.safeQuestionFocus,
      getFineTagInfo: deps.getFineTagInfo
    });
    if (!model.hasTheory) {
      return '<div class="empty-hint">' + window.escapeHtml(model.emptyText) + '</div>';
    }
    var html = '<div class="theory-now-card">'
      + '<div class="lesson-card-kicker">当前考点</div>'
      + '<div class="theory-now-title">' + window.escapeHtml(model.title) + '</div>'
      + '<div class="lesson-path">'
      + model.path.map(function(item, idx) { return '<span class="lesson-path-chip' + (idx === model.path.length - 1 ? ' current' : '') + '">' + window.escapeHtml(item) + '</span>'; }).join('')
      + '</div>'
      + '</div>';
    if (model.overviewHtml) {
      html += '<div style="margin-bottom:16px;">' + model.overviewHtml + '</div>';
    }
    if (model.sections.length) {
      html += '<div class="drawer-fold-list">';
      model.sections.forEach(function(section) {
        html += '<details class="drawer-fold">';
        html += '<summary class="drawer-fold-summary">' + window.escapeHtml(section.title) + ' · ' + window.escapeHtml(section.desc) + '</summary>';
        html += '<div class="drawer-fold-body">' + section.contentHtml + '</div>';
        html += '</details>';
      });
      html += '</div>';
    }
    return html;
  }

  function teachingGuideHtml(q, practicalGuide, deps) {
    deps = deps || {};
    var header = deps.getTeachingHeaderInfo(q);
    var model = window.GrammarTeachingGuide.buildGuidePanelModel(header, practicalGuide);
    return '<div class="teaching-tab-title">'
      + '<div class="teaching-tab-kicker">' + window.escapeHtml(model.kicker) + '</div>'
      + '<div class="teaching-tab-heading">' + window.escapeHtml(model.heading) + '</div>'
      + (model.subline ? '<div class="teaching-tab-sub">' + window.escapeHtml(model.subline) + '</div>' : '')
      + '</div>'
      + practicalGuideHtml(model.practicalGuide);
  }
```

- [ ] **Step 3: 插入 teachingKnowledgeHtml,并把导出对象补成 6 个**

```js
  function teachingKnowledgeHtml(q, deps) {
    deps = deps || {};
    var vmDeps = deps.teachingViewModelDeps();
    vmDeps.graphNodeIndex = deps.getGraphNodeIndex();
    var model = window.GrammarTeachingViewModel.buildTeachingKnowledgePanelModel(q, vmDeps);
    var html = '<div class="teaching-tab-title">'
      + '<div class="teaching-tab-kicker">' + window.escapeHtml(model.kicker) + '</div>'
      + '<div class="teaching-tab-heading">' + window.escapeHtml(model.heading) + '</div>'
      + '<div class="teaching-tab-sub">' + window.escapeHtml(model.subline) + '</div>'
      + '</div>';
    html += '<div class="teaching-global-locator">'
      + '<button class="node-link-chip" onclick="openGlobalGraphForTeachingQuestion()">' + window.escapeHtml(model.locatorLabel) + '</button>'
      + '</div>';
    html += '<div class="teaching-mindmap">';
    html += '<div class="teaching-mindmap-path">';
    model.path.forEach(function(item, idx) {
      if (idx > 0) html += '<span class="arrow">›</span>';
      html += '<span' + (item.current ? ' class="current"' : '') + '>' + window.escapeHtml(item.label) + '</span>';
    });
    html += '</div>';
    html += '<div class="teaching-mindmap-board">';
    html += '<div class="teaching-mindmap-column">';
    html += '<div class="mindmap-label">上级</div>';
    html += '<div class="mindmap-up-node"><b>' + window.escapeHtml(model.parent.title) + '</b><span>' + window.escapeHtml(model.parent.note) + '</span></div>';
    if (model.siblings && model.siblings.length) {
      html += '<div class="mindmap-label">同级分支</div><div class="mindmap-siblings">';
      model.siblings.forEach(function(label) {
        html += '<div class="mindmap-sibling">' + window.escapeHtml(label) + '</div>';
      });
      html += '</div>';
    }
    html += '</div>';
    html += '<div class="teaching-mindmap-center">';
    html += '<div class="mindmap-label">当前考点</div>';
    html += '<div class="mindmap-center-node"><b>' + window.escapeHtml(model.center.title) + '</b><span>' + window.escapeHtml(model.center.note) + '</span></div>';
    html += '<div class="mindmap-current-focus">' + window.escapeHtml(model.center.focusText) + '</div>';
    html += '</div>';
    html += '<div class="teaching-mindmap-branches">';
    model.branches.forEach(function(branch) {
      html += '<div class="mindmap-branch' + (branch.active ? ' active' : '') + '">';
      html += '<div class="mindmap-branch-node"><b>' + window.escapeHtml(branch.title || '') + '</b><span>' + window.escapeHtml(branch.note || '') + '</span></div>';
      html += '<div class="mindmap-leaves">';
      (branch.leaves || []).forEach(function(leaf) {
        html += '<div class="mindmap-leaf' + (branch.active ? ' active' : '') + '">' + window.escapeHtml(leaf) + '</div>';
      });
      html += '</div></div>';
    });
    html += '</div></div>';
    if (model.rules && model.rules.length) {
      html += '<div class="teaching-mindmap-rules">';
      model.rules.forEach(function(rule) {
        html += '<div class="mindmap-rule"><span>' + rule.no + '</span><div>' + window.escapeHtml(rule.text) + '</div></div>';
      });
      html += '</div>';
    }
    html += '</div>';
    return html;
  }
```

把文件末尾的导出对象替换为完整 6 个:

```js
  window.GrammarTeachingRender = {
    practicalGuideHtml: practicalGuideHtml,
    solutionCard: solutionCard,
    solutionPanelHtml: solutionPanelHtml,
    theoryContent: theoryContent,
    teachingGuideHtml: teachingGuideHtml,
    teachingKnowledgeHtml: teachingKnowledgeHtml
  };
})();
```

---

## Task 3: index.html 改为转发桥 + 加载顺序

**Files:** Modify `docs/grammar-fill/index.html`

- [ ] **Step 1: 加 `<script>` 加载行**

定位 `<script src="./modules/app-state.js"></script>`(modules 加载序最后一行),在其**后**新增:

```html
<script src="./modules/teaching-render.js"></script>
```

- [ ] **Step 2: 6 个旧函数体替换为转发桥**

用 grep 定位(如 `grep -n "^function buildPracticalGuideHtml" docs/grammar-fill/index.html`),把每个函数整体替换为下面对应一行。**函数名保持不变**,故所有现有调用点(`switchDrawerTab`、`renderTeachingStage`、暂留的 `buildAnalysisContent` 等)零改动:

```js
function buildPracticalGuideHtml(guide) { return window.GrammarTeachingRender.practicalGuideHtml(guide); }
function renderSolutionCard(model) { return window.GrammarTeachingRender.solutionCard(model); }
function buildSolutionPanelHtml(q) { return window.GrammarTeachingRender.solutionPanelHtml(q); }
function buildTheoryContent(q) { return window.GrammarTeachingRender.theoryContent(q, { knowledgeData: KNOWLEDGE_DATA, categoryMap: CATEGORY_MAP, safeQuestionFocus: safeQuestionFocus, getFineTagInfo: getFineTagInfo }); }
function buildTeachingGuideHtml(q, practicalGuide) { return window.GrammarTeachingRender.teachingGuideHtml(q, practicalGuide, { getTeachingHeaderInfo: getTeachingHeaderInfo }); }
function buildTeachingKnowledgeHtml(q) { return window.GrammarTeachingRender.teachingKnowledgeHtml(q, { teachingViewModelDeps: teachingViewModelDeps, getGraphNodeIndex: getGraphNodeIndex }); }
```

> 辅助函数 `getTeachingHeaderInfo` / `teachingViewModelDeps` / `getGraphNodeIndex` 留在 index.html 作 deps 源。

---

## Task 4: 登记模块契约

**Files:** Modify `scripts/check_grammar_modules.py`

- [ ] **Step 1: 在 `EXPECTED_MODULES` 末尾(app-state.js 条目后、列表 `]` 前)追加**

```python
    {
        "path": "teaching-render.js",
        "namespace": "GrammarTeachingRender",
        "exports": [
            "practicalGuideHtml",
            "solutionCard",
            "solutionPanelHtml",
            "theoryContent",
            "teachingGuideHtml",
            "teachingKnowledgeHtml",
        ],
    },
```

> 列表有序,校验比对 index.html 的 `<script>` 顺序,故此条目必须是最后一个。

- [ ] **Step 2: 单独跑模块契约检查**

```bash
python3 scripts/check_grammar_modules.py
```
Expected: `OK: grammar-fill module contracts valid (N modules)`(N 比之前 +1)。若报 "script order mismatch"/"missing export",核对 Task 3 Step 1 的加载位置与 exports 拼写。

---

## Task 5: 全量验证 + 人眼验收

- [ ] **Step 1: render 单测转绿**

```bash
npx playwright test tests/smoke.spec.js --project=chromium -g "teaching-render pure html output"
```
Expected: PASS。

- [ ] **Step 2: 核心路径 smoke(行为不变)**

```bash
npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path"
```
Expected: PASS。

- [ ] **Step 3: 全量发布门禁**

```bash
npm run check
```
Expected: 末行 `OK: all engineering checks passed`。

- [ ] **Step 4: 人眼验收(浏览器)**

起本地服务打开 `/grammar-fill/index.html`,逐项对照(应与切前完全一致):
- 讲题台「考点理论」tab:考点卡 + 路径链 + 折叠小节
- 讲题台「做题思路/考点」:solve/point 两 chip 可切换,文案正确
- 讲题台思维导图(`teachingKnowledgeHtml`):上级/同级/当前/分支/规则完整,定位按钮可点
- 抽屉(点空格):解题卡 + 实战指引卡
- 暗黑模式下复看上述各处

> 任一处异常即停,`git diff` 比对桥与模块,优先查 deps 注入漏传或 `escapeHtml` 引用。

---

## Task 6: 记录与提交

- [ ] **Step 1: PROJECT_LOG 记一条(2026-05-29)**

在 `PROJECT_LOG.md` 顶部追加:新增渲染层模块 `teaching-render.js`,迁入讲题台/抽屉 6 个纯叶子 build*,index.html 保留同名转发桥(调用点零改动),`check_grammar_modules.py` 登记,新增 render 输出 smoke 断言,`npm run check` 全绿 + 人眼验收通过。行为零差异重构;埋点函数与总装函数留待下一批。

- [ ] **Step 2: 提交(等用户授权后执行)**

> AGENTS.md:未经用户明确授权不得 commit/push。

```bash
git add docs/grammar-fill/modules/teaching-render.js docs/grammar-fill/index.html scripts/check_grammar_modules.py tests/smoke.spec.js PROJECT_LOG.md docs/planning/2026-05-29-teaching-render-extraction-*.md
git commit -m "refactor(grammar-fill): extract teaching/drawer leaf renderers to teaching-render module"
```

---

## 完成定义(对照设计 §8)

- [ ] `teaching-render.js` 建好,6 个纯叶子迁入,模块内 `solutionPanelHtml→solutionCard`、`teachingGuideHtml→practicalGuideHtml` 互调保留
- [ ] index.html 6 个同名转发桥就位,加载顺序正确,调用点零改动
- [ ] `check_grammar_modules.py` 更新并通过
- [ ] render 单测通过
- [ ] `npm run check` 全绿
- [ ] 人眼验收清单全过(含暗黑模式)
- [ ] `PROJECT_LOG.md` 记一条

## 非目标(YAGNI)

- 不切 `buildTeachingMigrationHtml`(埋点副作用)、`buildAnalysisContent`/`buildMigrationContent`(总装)——下一批
- 不动任何交互/DOM 渲染函数(`switchDrawerTab`、`renderTeachingStage`、`toggleAnalysisFloat` 等)
- 不动辅助函数 `getTeachingHeaderInfo`/`teachingViewModelDeps`/`getGraphNodeIndex`(留 inline 作 deps 源)
- 不引入构建工具、不改 UI、不改数据模型
