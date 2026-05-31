# 知识库导航精细化 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让全局图谱的迁移训练按细分支精准检索、图谱支持一键全展开+搜索定位+触控板平移、书本速查跳转到精确讲解位置、tab 顺序前置全局图谱/书本速查、迁移抽屉可"显示全部"，并在上线前对 28 个有题的 fine tag 做标注抽查。

**Architecture:** 纯前端改造，集中在 `docs/grammar-fill/`。可测试的判断逻辑抽成纯函数放进 view-model 模块（`knowledge-view-model.js` / `teaching-view-model.js`），UI 接线在 `index.html`，渲染在 `teaching-render.js`。数据微调在 `data/decision_map.js`。测试沿用项目惯例：Playwright + `page.evaluate` 打 window 全局（`tests/smoke.spec.js`）。

**Tech Stack:** 原生 JS（IIFE 模块挂 window）、Playwright（chromium smoke）、本地静态站。

**测试运行**：`npm run test:smoke`（boot chromium 跑 `tests/smoke.spec.js`）。单测试块可用 `npx playwright test tests/smoke.spec.js --project=chromium -g "<test name>"`。

---

## 文件结构

| 文件 | 职责 | 本计划改动 |
|------|------|-----------|
| `docs/grammar-fill/index.html` | 视图渲染 + 接线 | tab 顺序、`startByFineTag`、`startMigrationFromMap`、`openKnowledgePoint`、`renderSystemView`（HUD/搜索/wheel）、`selectKnowledgeCategory`（section 滚动）、`getMigrationData`+`toggleMigrationShowAll`、`_migrationShowAll` 状态 |
| `docs/grammar-fill/modules/category-rules.js` | 粗类别练习计划 | 新增 `buildFineTagPracticePlan` |
| `docs/grammar-fill/modules/knowledge-view-model.js` | 知识库纯逻辑 | 新增 `searchDecisionNodes`、`collectDecisionAncestors`、`collectExpandableIds` |
| `docs/grammar-fill/modules/teaching-view-model.js` | 图谱纯逻辑 | 新增 `buildDmWheelAction` |
| `docs/grammar-fill/modules/teaching-render.js` | 迁移抽屉/讲题台 HTML | 两处渲染加"显示全部/收起"按钮 |
| `docs/grammar-fill/modules/migration-training.js` | 迁移推荐数据 | `buildMigrationContentViewModel` 增 `showAll` 入参 + `showAllButton` 模型 |
| `docs/grammar-fill/data/decision_map.js` | 决策地图数据 | 中间父节点补 `kd` section 映射 |
| `tests/smoke.spec.js` | 端到端 smoke | 新增断言块 |
| `docs/planning/bank-fine-tag-audit-2026-05-31.md` | 抽查报告 | Task 7 产出 |

---

## Task 1: tab 顺序前置（需求4）

**Files:**
- Modify: `docs/grammar-fill/index.html:3843-3847`

- [ ] **Step 1: 调整 tab 按钮顺序**

把 `index.html:3843-3847` 五个按钮重排为 全局图谱 → 书本速查 → 教材视图 → 考点视图 → 知识地图。替换：

```html
        <button class="knowledge-view-btn active" id="knowledgeSystemBtn" onclick="setKnowledgeView('system')">🌐 全局图谱</button>
        <button class="knowledge-view-btn" id="knowledgeBookBtn" onclick="setKnowledgeView('book')">📖 书本速查</button>
        <button class="knowledge-view-btn" id="knowledgeTextbookBtn" onclick="setKnowledgeView('textbook')">📚 教材视图</button>
        <button class="knowledge-view-btn" id="knowledgeFineCatBtn" onclick="setKnowledgeView('fine-cat')">🏷️ 考点视图</button>
        <button class="knowledge-view-btn" id="knowledgeMapBtn" onclick="setKnowledgeView('map')">🗺 知识地图</button>
```

注意：`active` class 从 `knowledgeTextbookBtn` 移到 `knowledgeSystemBtn`（默认视图已是 system，见 `index.html:9280` 不动）。其余渲染分派 `setKnowledgeView`、默认 `renderSystemView` 逻辑不变。

- [ ] **Step 2: 手动验证**

本地打开语法填空 → 知识库，确认 tab 第一二位是「🌐 全局图谱」「📖 书本速查」，进入默认高亮全局图谱且渲染决策地图。

- [ ] **Step 3: Commit**

```bash
git add docs/grammar-fill/index.html
git commit -m "feat(knowledge): tab 顺序前置全局图谱+书本速查"
```

---

## Task 2: 图谱叶子按细分支精准迁移（需求1）

**Files:**
- Modify: `docs/grammar-fill/modules/category-rules.js`（新增 `buildFineTagPracticePlan`）
- Modify: `docs/grammar-fill/index.html`（`startByFineTag`、`startMigrationFromMap`、叶子按钮、window 暴露）
- Test: `tests/smoke.spec.js`

### 2A · category-rules 加细 tag 练习计划

- [ ] **Step 1: 写失败测试（page.evaluate 打 window.GrammarCategoryRules）**

在 `tests/smoke.spec.js` 已有 grammar-fill 用例内（参考 958-979 行已加载页面后的 `page.evaluate`）新增一段断言。在 “grammar-fill core path renders and opens teaching stage” 测试体末尾追加：

```js
  // 需求1：按 fine tag 精准筛题
  expect(await page.evaluate(() => {
    var cr = window.GrammarCategoryRules;
    if (!cr || !cr.buildFineTagPracticePlan) return 'no-fn';
    var all = window.ALL_QUESTIONS || [];
    var plan = cr.buildFineTagPracticePlan('pred-passive-form', all, window.CATEGORY_MAP || {});
    if (!plan.hasQuestions) return 'empty';
    var allSame = plan.questions.every(function(q){ return q.fine_category === 'pred-passive-form'; });
    return allSame ? 'ok' : 'mixed';
  })).toBe('ok');
```

- [ ] **Step 2: 运行确认失败**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path"`
Expected: FAIL（`no-fn`，函数未定义）

- [ ] **Step 3: 实现 buildFineTagPracticePlan**

在 `category-rules.js` 的 `buildCategoryPracticePlan`（约 164 行）之后新增函数，并加入文件底部 `window.GrammarCategoryRules` 导出对象（紧跟 `buildCategoryPracticePlan: buildCategoryPracticePlan` 后加一行）：

```js
  function selectFineTagQuestions(allQuestions, fineCategory) {
    return asArray(allQuestions).filter(function(q) {
      return q && q.fine_category === fineCategory;
    });
  }

  function buildFineTagPracticePlan(fineCategory, allQuestions, categoryMap) {
    var questions = selectFineTagQuestions(allQuestions, fineCategory);
    var category = questions.length ? questions[0].category : '';
    return buildCategoryPracticeEntryModel(category, questions, categoryMap);
  }
```

导出对象内新增：

```js
    selectFineTagQuestions: selectFineTagQuestions,
    buildFineTagPracticePlan: buildFineTagPracticePlan,
```

注：`buildCategoryPracticeEntryModel` 已存在（导出于 186 行），返回 `{ hasQuestions, questions, currentExam, emptyMessage }` 同构于粗类别计划。

- [ ] **Step 4: 运行确认通过**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add docs/grammar-fill/modules/category-rules.js tests/smoke.spec.js
git commit -m "feat(migration): category-rules 加 buildFineTagPracticePlan 按细tag筛题"
```

### 2B · index.html 接线：startByFineTag + 叶子按钮传 fine

- [ ] **Step 6: 新增 startByFineTag（紧跟 startByCategory 之后，约 index.html:6300）**

```js
function startByFineTag(fine) {
  closeDrawer();
  resetPracticeDisplayState();
  var entryModel = window.GrammarCategoryRules.buildFineTagPracticePlan(fine, ALL_QUESTIONS, CATEGORY_MAP);
  if (!entryModel.hasQuestions) {
    alert(entryModel.emptyMessage);
    return;
  }
  applyPracticeContextState({
    currentQuestions: entryModel.questions,
    currentExam: entryModel.currentExam
  });
  setPreviousView(getPracticeEntryPreviousView('category'));
  syncAppState();
  switchPage('practice');
  renderExam();
}
```

- [ ] **Step 7: 改 startMigrationFromMap 走 fine（index.html:8807-8813）**

替换函数体，签名改为接收 `fine`：

```js
function startMigrationFromMap(fine) {
  // 从图谱叶子开练：按细分支(fine tag)精准筛题，"返回"指回知识库(全局图谱)
  startByFineTag(fine);
  setPreviousView({ page: 'knowledge' });
  if (typeof syncAppState === 'function') syncAppState();
  if (typeof updateDockBackButton === 'function') updateDockBackButton();
}
```

- [ ] **Step 8: 叶子按钮传 n.fine（index.html:8893）**

把该行的 `startMigrationFromMap('cat')` 改为传 `fine`，并把按钮显隐条件从 `qn > 0 && cat` 改为 `qn > 0 && fine`（0 题分支沿用 `qn>0` 灰掉，不显示按钮）：

```js
      if (qn > 0 && fine) acts += '<button type="button" onclick="event.stopPropagation();startMigrationFromMap(\'' + graphEscapeAttr(fine) + '\')">🔁 迁移训练 · ' + qn + ' 题</button>';
```

`看讲解`按钮（8894 行）暂不动，Task 4 再改。

- [ ] **Step 9: window 暴露 startByFineTag**

在 `Object.assign(window, {...})` 块（约 index.html:9439 起）补一行（按字母位置插入，紧邻 `startByExam`/`startByCategory` 若有，否则任意处）：

```js
  startByFineTag: startByFineTag,
```

确认 `startByCategory`、`startMigrationFromMap` 是否已在该块；`startMigrationFromMap` 由 svg onclick 调用须为全局——它本就是函数声明（非块内），onclick 字符串能解析，无需额外暴露；保持现状即可。

- [ ] **Step 10: 写 smoke 断言（迁移进练习页且题目同 fine）**

在 “grammar-fill core path” 测试体追加（页面已在知识库/可调用全局函数）：

```js
  // 需求1：从图谱叶子按 fine 开练，currentQuestions 全部同 fine
  expect(await page.evaluate(() => {
    window.startByFineTag('pred-passive-form');
    var qs = (window.GrammarAppState.state.currentQuestions) || [];
    return qs.length > 0 && qs.every(function(q){ return q.fine_category === 'pred-passive-form'; });
  })).toBe(true);
```

- [ ] **Step 11: 运行确认通过**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path"`
Expected: PASS

- [ ] **Step 12: Commit**

```bash
git add docs/grammar-fill/index.html tests/smoke.spec.js
git commit -m "feat(migration): 图谱叶子按细分支(fine tag)精准迁移"
```

---

## Task 3: 全局图谱 一键全展开 + 搜索定位 + 触控板平移（需求2）

**Files:**
- Modify: `docs/grammar-fill/modules/knowledge-view-model.js`（纯函数 `searchDecisionNodes`、`collectDecisionAncestors`、`collectExpandableIds`）
- Modify: `docs/grammar-fill/modules/teaching-view-model.js`（纯函数 `buildDmWheelAction`）
- Modify: `docs/grammar-fill/index.html`（`renderSystemView` HUD+搜索框、`dmExpandAll`/`dmRevealNode`/`dmSearch`、wheel 监听）
- Test: `tests/smoke.spec.js`

### 3A · 纯函数：搜索 / 祖先 / 全展开 id 集

- [ ] **Step 1: 写失败测试**

在 smoke 的图谱用例附近（参考 2980 行 `currentKnowledgeView === 'system'`）新增断言：

```js
  expect(await page.evaluate(() => {
    var kvm = window.GrammarKnowledgeViewModel;
    var DM = window.GRAMMAR_DECISION_MAP;
    var tree = kvm.buildDecisionTree(DM.nodes);
    if (!kvm.searchDecisionNodes || !kvm.collectDecisionAncestors || !kvm.collectExpandableIds) return 'no-fn';
    var hits = kvm.searchDecisionNodes('定语从句', tree.byId);
    if (!hits.length) return 'no-hit';
    var anc = kvm.collectDecisionAncestors(hits[0].id, tree.byId);
    var expandable = kvm.collectExpandableIds(tree.childrenOf);
    return (Array.isArray(anc) && expandable.length > 0) ? 'ok' : 'bad';
  })).toBe('ok');
```

- [ ] **Step 2: 运行确认失败**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path"`
Expected: FAIL（`no-fn`）

- [ ] **Step 3: 实现三个纯函数（knowledge-view-model.js）**

在 `buildDecisionTree`（约 1354 行）附近新增，并加入该模块的 window 导出对象：

```js
  function searchDecisionNodes(query, byId, limit) {
    var q = String(query || '').trim().toLowerCase().replace(/\s+/g, '');
    if (!q) return [];
    limit = limit || 12;
    var out = [];
    Object.keys(byId || {}).forEach(function(id) {
      var n = byId[id] || {};
      var title = String(n.title || '').toLowerCase().replace(/\s+/g, '');
      var sub = String(n.sub || '').toLowerCase().replace(/\s+/g, '');
      if (title.indexOf(q) !== -1 || sub.indexOf(q) !== -1) {
        out.push({ id: id, title: n.title || '', isLeaf: !!(n.fine || n.cat) });
      }
    });
    return out.slice(0, limit);
  }

  function collectDecisionAncestors(id, byId) {
    var out = [], n = (byId || {})[id];
    while (n && n.parent && byId[n.parent]) {
      out.push(n.parent);
      n = byId[n.parent];
    }
    return out;
  }

  function collectExpandableIds(childrenOf) {
    return Object.keys(childrenOf || {}).filter(function(id) {
      return (childrenOf[id] || []).length > 0;
    });
  }
```

导出对象内补：

```js
    searchDecisionNodes: searchDecisionNodes,
    collectDecisionAncestors: collectDecisionAncestors,
    collectExpandableIds: collectExpandableIds,
```

- [ ] **Step 4: 实现 buildDmWheelAction（teaching-view-model.js）**

在 `searchGraphNodes`（约 717 行）附近新增并导出：

```js
  function buildDmWheelAction(deltaX, deltaY, ctrlKey) {
    // 触控板捏合手势浏览器带 ctrlKey → 缩放；普通双指/滚轮 → 平移画布
    if (ctrlKey) {
      return { action: 'zoom', factor: deltaY < 0 ? 1.12 : 0.9 };
    }
    return { action: 'pan', dx: -(Number(deltaX) || 0), dy: -(Number(deltaY) || 0) };
  }
```

导出（`searchGraphNodes: searchGraphNodes,` 旁）：

```js
    buildDmWheelAction: buildDmWheelAction,
```

- [ ] **Step 5: 运行确认通过（纯函数部分）**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path"`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add docs/grammar-fill/modules/knowledge-view-model.js docs/grammar-fill/modules/teaching-view-model.js tests/smoke.spec.js
git commit -m "feat(graph): 加图谱搜索/祖先/全展开/滚轮判断纯函数"
```

### 3B · index.html：全展开按钮 + 搜索框 + reveal + wheel 平移

- [ ] **Step 7: 加 dmExpandAll / dmRevealNode / dmSearch 函数（紧邻 dmResetView，约 index.html:8797-8801 之后）**

```js
function dmExpandAll() {
  if (!dmCtx || !dmCtx.full) return;
  var ids = window.GrammarKnowledgeViewModel.collectExpandableIds(dmCtx.full.childrenOf);
  ids.forEach(function(id) { dmExpanded[id] = true; });
  renderSystemView();
  dmFit(true);
}
function dmRevealNode(id) {
  if (!dmCtx || !dmCtx.full) return;
  var anc = window.GrammarKnowledgeViewModel.collectDecisionAncestors(id, dmCtx.full.byId);
  anc.forEach(function(a) { dmExpanded[a] = true; });
  renderSystemView(id);
  var input = document.getElementById('dmSearch');
  var box = document.getElementById('dmSearchResults');
  if (box) box.innerHTML = '';
  if (input) input.blur();
}
function dmSearch(value) {
  var box = document.getElementById('dmSearchResults');
  if (!box || !dmCtx || !dmCtx.full) return;
  var hits = window.GrammarKnowledgeViewModel.searchDecisionNodes(value, dmCtx.full.byId);
  if (!hits.length) { box.innerHTML = ''; return; }
  box.innerHTML = hits.map(function(h) {
    return '<button type="button" class="dm-search-hit" onclick="dmRevealNode(\'' + graphEscapeAttr(h.id) + '\')">' + escapeHtml(h.title) + '</button>';
  }).join('');
}
```

- [ ] **Step 8: 渲染搜索框 + 全展开按钮（renderSystemView 内）**

在 `index.html:8859` `var html = '<div class="dm-wrap">';` 之后、`dm-caption` 之前插入搜索框：

```js
  html += '<div class="dm-search-wrap"><input id="dmSearch" type="text" placeholder="搜索语法考点…" autocomplete="off" oninput="dmSearch(this.value)"><div class="dm-search-results" id="dmSearchResults"></div></div>';
```

在 HUD（`index.html:8904-8906`）的「⤢ 收起」按钮后加全展开按钮：

```js
  html += '<div class="dm-hud"><button type="button" class="dm-hud-wide" onclick="dmResetView()">⤢ 收起</button>'
    + '<button type="button" class="dm-hud-wide" onclick="dmExpandAll()">⊞ 全展开</button>'
    + '<button type="button" onclick="dmZoom(1.25)">＋</button>'
    + '<button type="button" onclick="dmZoom(0.8)">－</button></div>';
```

- [ ] **Step 9: wheel 改为按 buildDmWheelAction 平移/缩放（index.html:8919）**

替换原 `vp.addEventListener('wheel', ...)` 一行：

```js
    vp.addEventListener('wheel', function(e) {
      e.preventDefault();
      var act = window.GrammarTeachingViewModel.buildDmWheelAction(e.deltaX, e.deltaY, e.ctrlKey);
      if (act.action === 'zoom') { dmZoom(act.factor, false); }
      else { dmCam.tx += act.dx; dmCam.ty += act.dy; applyDmCamera(false); }
    }, { passive: false });
```

- [ ] **Step 10: 加最小样式（搜索框/结果/全展开）**

在图谱相关 CSS 区（搜索 `.dm-hud` 的样式定义处）补：

```css
.dm-search-wrap { position: relative; margin-bottom: 8px; max-width: 320px; }
.dm-search-wrap input { width: 100%; padding: 7px 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text); font-family: inherit; font-size: 13px; }
.dm-search-results { position: absolute; z-index: 20; left: 0; right: 0; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; margin-top: 4px; max-height: 240px; overflow: auto; box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
.dm-search-results:empty { display: none; }
.dm-search-hit { display: block; width: 100%; text-align: left; padding: 8px 12px; border: none; background: transparent; color: var(--text); cursor: pointer; font-family: inherit; font-size: 13px; }
.dm-search-hit:hover { background: var(--accent-bg); color: var(--accent); }
```

- [ ] **Step 11: window 暴露新函数**

在 `Object.assign(window, {...})` 块补：

```js
  dmExpandAll: dmExpandAll,
  dmRevealNode: dmRevealNode,
  dmSearch: dmSearch,
```

- [ ] **Step 12: 写 smoke 断言（全展开后可见叶子增多 + 搜索 reveal 聚焦）**

```js
  // 需求2：进入全局图谱 → 全展开 → 搜索 reveal 聚焦
  expect(await page.evaluate(() => {
    window.setKnowledgeView('system');
    window.dmExpandAll();
    var leaves = document.querySelectorAll('#knowledgeContent .dm-node.leaf').length;
    return leaves > 0;
  })).toBe(true);
  expect(await page.evaluate(() => {
    var kvm = window.GrammarKnowledgeViewModel;
    var hits = kvm.searchDecisionNodes('定语从句', window.dmCtx.full.byId);
    if (!hits.length) return 'no-hit';
    window.dmRevealNode(hits[0].id);
    return window.dmCam.focusId === hits[0].id ? 'ok' : 'no-focus';
  })).toBe('ok');
```

- [ ] **Step 13: 运行确认通过**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path"`
Expected: PASS

- [ ] **Step 14: 手动验证触控板**（自动化无法可靠合成 wheel+ctrlKey）

Mac 触控板：双指上下/左右滑 → 画布平移；两指捏合 → 缩放；鼠标滚轮 → 平移（捏合/ctrl+滚轮缩放，＋/－按钮兜底缩放）。

- [ ] **Step 15: Commit**

```bash
git add docs/grammar-fill/index.html tests/smoke.spec.js
git commit -m "feat(graph): 全局图谱一键全展开+搜索定位+触控板双指平移"
```

---

## Task 4: 书本速查精确跳转（需求3）

**Files:**
- Modify: `docs/grammar-fill/data/decision_map.js`（中间父节点补 `kd`）
- Modify: `docs/grammar-fill/index.html`（`openKnowledgePoint(cat, section)`、`selectKnowledgeCategory` 支持目标 section 滚动、叶子「看讲解」传 kd）
- Test: `tests/smoke.spec.js`

- [ ] **Step 1: decision_map.js 中间父节点补 kd（指向 KNOWLEDGE_DATA section key）**

为有对应讲解 section 的中间父节点加 `kd` 字段。已核实 `KNOWLEDGE_DATA.predicate.sub` 的真实 key 为 `predicate-tense` / `predicate-voice` / `predicate-agreement`（注意主谓一致是 **agreement** 不是 sva）。这三个父节点在 `decision_map.js:28/35/38` 现有定义带 `sub` 字段，**必须保留原 `sub`，只追加 `kd`**：

```js
    { id: 'pred_tense', parent: 'pred', title: '时态', sub: '找时间标志和上下文', kd: 'predicate-tense' },
    { id: 'pred_voice', parent: 'pred', title: '语态', sub: '主语是否承受动作？', kd: 'predicate-voice' },
    { id: 'pred_sva',   parent: 'pred', title: '主谓一致', sub: '回到主语中心词', kd: 'predicate-agreement' },
```

> 实现者注意：用 Edit 在三个对象现有定义上**只追加 `kd` 字段**（上面已含原 `sub` 原值，照抄即可）。对其余主类别（nonpredicate/word/...）的中间父节点，逐一比对 `data/grammar_knowledge.js` 里 `KNOWLEDGE_DATA[cat].sub` 的真实 key（用 `grep -n "': {" data/grammar_knowledge.js` 列出），能对上的补 `kd`，对不上的留空（Task 4 fallback 会退到类别顶部，不报错）。本步只要求 predicate 三个父节点必须补全，其余尽力补。

- [ ] **Step 2: 写失败测试（openKnowledgePoint 带 section 自动展开）**

```js
  // 需求3：看讲解跳到指定 section 并展开
  expect(await page.evaluate(() => {
    window.openKnowledgePoint('predicate', 'predicate-tense');
    var el = document.getElementById('sub-predicate-tense');
    return !!el && !el.classList.contains('collapsed');
  })).toBe(true);
```

- [ ] **Step 3: 运行确认失败**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path"`
Expected: FAIL（section 仍 collapsed，因 openKnowledgePoint 未处理 section）

- [ ] **Step 4: 改 openKnowledgePoint 接收 section（index.html:8802-8806）**

```js
function openKnowledgePoint(cat, section) {
  // 看讲解：进「书本速查」该考点讲解；若给了 section 则展开并滚到该小节
  if (cat && typeof selectKnowledgeCategory === 'function') {
    selectKnowledgeCategory(cat, false, section);
  } else if (typeof setKnowledgeView === 'function') {
    setKnowledgeView('book');
  }
}
```

- [ ] **Step 5: selectKnowledgeCategory 支持 targetSection（index.html:9375）**

把签名改为 `function selectKnowledgeCategory(key, isPattern, targetSection)`，在函数末尾 `updateDockBackButton();`（约 9433）之前插入：

```js
  if (targetSection && !isPattern) {
    var target = document.getElementById('sub-' + targetSection);
    if (target) {
      if (target.classList.contains('collapsed')) toggleSubsection(targetSection);
      try { target.scrollIntoView({ block: 'start', behavior: 'smooth' }); } catch(e) {}
    }
  }
```

注：`toggleSubsection`（7814 行）切换 `#sub-<key>` 的 `collapsed` class；section 渲染默认带 `collapsed`（9423 行），故只在仍 collapsed 时 toggle 展开。`targetSection` 默认 undefined，旧调用行为不变。

- [ ] **Step 6: 叶子「看讲解」传 kd（index.html:8894，renderSystemView 内）**

在叶子渲染处取 kd（叶子自身无 `kd` 则向上找父节点的 `kd`），改 8894 行按钮：

在 8888-8889（`var cat = n.cat; var fine = n.fine;`）附近加：

```js
      var kd = n.kd || '';
      if (!kd && n.parent && full.byId[n.parent]) kd = full.byId[n.parent].kd || '';
```

改 8894 行：

```js
      acts += '<button type="button" class="ghost" onclick="event.stopPropagation();openKnowledgePoint(\'' + graphEscapeAttr(cat) + '\',\'' + graphEscapeAttr(kd) + '\')">📖 看讲解</button>';
```

- [ ] **Step 7: window 暴露 openKnowledgePoint（若未暴露）**

`openKnowledgePoint` 由 svg onclick 调用，作为顶层函数声明可被 onclick 解析，无需改动；确认 `selectKnowledgeCategory` 已在 window（被 sidebar 调用，应已暴露）。无新增暴露则跳过。

- [ ] **Step 8: 运行确认通过**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path"`
Expected: PASS

- [ ] **Step 9: 手动验证**

全局图谱 → 展开到「谓语动词→时态」某叶子 → 点「📖 看讲解」→ 书本速查打开谓语动词，且「时态判断」小节自动展开并滚到位。

- [ ] **Step 10: Commit**

```bash
git add docs/grammar-fill/data/decision_map.js docs/grammar-fill/index.html tests/smoke.spec.js
git commit -m "feat(knowledge): 书本速查从图谱跳转精确定位到讲解小节"
```

---

## Task 5: 迁移训练"显示全部"（需求5）

**Files:**
- Modify: `docs/grammar-fill/modules/migration-training.js`（`buildMigrationContentViewModel` 加 `showAll` 入参 + `showAllButton`）
- Modify: `docs/grammar-fill/modules/teaching-render.js`（`migrationDrawerHtml` + `migrationStageHtml` 渲染按钮）
- Modify: `docs/grammar-fill/index.html`（`_migrationShowAll` 状态、`getMigrationData` 动态 limit、`toggleMigrationShowAll`、两处 contentModel 传 showAll）
- Test: `tests/smoke.spec.js`

- [ ] **Step 1: 写失败测试（showAll 模型）**

```js
  expect(await page.evaluate(() => {
    var mt = window.GrammarMigrationTraining;
    var data = { migration: [1,2,3,4,5,6], poolCount: 14, tabs: [], headerLabel: 'x' };
    var vm6 = mt.buildMigrationContentViewModel(data, 'bank', false);
    var vmAll = mt.buildMigrationContentViewModel(data, 'bank', true);
    if (!vm6.showAllButton) return 'no-field';
    return (vm6.showAllButton.visible && /显示全部 14/.test(vm6.showAllButton.label)
      && vmAll.showAllButton.visible && /只看 6/.test(vmAll.showAllButton.label)) ? 'ok' : 'bad';
  })).toBe('ok');
```

- [ ] **Step 2: 运行确认失败**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path"`
Expected: FAIL（`no-field`）

- [ ] **Step 3: buildMigrationContentViewModel 加 showAll（migration-training.js:296）**

签名改 `function buildMigrationContentViewModel(data, source, showAll)`，在 `return {` 对象内（`entries:` 之前）加：

```js
      showAllButton: (function() {
        var poolCount = Number(data.poolCount) || 0;
        return {
          visible: poolCount > 6,
          showingAll: !!showAll,
          label: showAll ? '收起，只看 6 题' : ('显示全部 ' + poolCount + ' 题')
        };
      })(),
```

- [ ] **Step 4: migrationDrawerHtml 渲染按钮（teaching-render.js:161）**

在 `html += '</div>';`（214 行，迁移列表收尾）与 `return html;`（215 行）之间插入：

```js
    if (contentModel.showAllButton && contentModel.showAllButton.visible) {
      html += '<button type="button" class="migration-show-all" onclick="toggleMigrationShowAll()" '
        + 'style="display:block;width:100%;margin-top:10px;padding:9px 12px;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--accent);font-weight:600;font-family:inherit;cursor:pointer;font-size:calc(var(--drawer-font-size-sm,23px) - 4px);">'
        + window.escapeHtml(contentModel.showAllButton.label) + '</button>';
    }
```

- [ ] **Step 5: migrationStageHtml 渲染按钮（teaching-render.js:218 起）**

找到 `migrationStageHtml` 中迁移列表 `</div>` 收尾处（`teaching-migration-scroll` 块之后、`return` 之前），插入同款按钮（沿用讲题台样式 class，无内联也可）：

```js
    if (contentModel.showAllButton && contentModel.showAllButton.visible) {
      html += '<button type="button" class="teaching-migration-show-all" onclick="toggleMigrationShowAll()">'
        + window.escapeHtml(contentModel.showAllButton.label) + '</button>';
    }
```

> 实现者：读 `migrationStageHtml` 全文确认列表收尾的确切位置（`teaching-migration-scroll` 闭合 `</div>` 后），把按钮加在 `return html;` 前。

- [ ] **Step 6: index.html 加 _migrationShowAll 状态 + 动态 limit**

在 `getMigrationData`（index.html:7373）之前加模块级状态：

```js
var _migrationShowAll = false;
```

改 `getMigrationData` 的 limit（7387 行）：

```js
    limit: _migrationShowAll ? 9999 : 6
```

- [ ] **Step 7: 两处 contentModel 传 showAll**

`buildMigrationContent`（7401 行）与 `buildTeachingMigrationHtml`（7140 行）的 `buildMigrationContentViewModel(data, migrationSource)` 均改为：

```js
  var contentModel = window.GrammarMigrationTraining.buildMigrationContentViewModel(data, migrationSource, _migrationShowAll);
```

- [ ] **Step 8: 加 toggleMigrationShowAll（紧邻 setMigrationSource，约 index.html:6874 之后）**

复用 setMigrationSource 的 render target 判断：

```js
function toggleMigrationShowAll() {
  _migrationShowAll = !_migrationShowAll;
  var sessionState = getTeachingSessionSnapshot();
  var selectedState = getSelectedQuestionSnapshot();
  if (sessionState.teachingSession) {
    renderTeachingStage();
  } else if (selectedState.selectedQuestion) {
    try {
      document.getElementById('drawerContent').innerHTML = buildMigrationContent(selectedState.selectedQuestion);
    } catch (e) { console.error('迁移展开失败：', e); }
  }
}
```

并在切题/切 source 时复位（可选但更稳）：在 `setMigrationSource`（6831）函数体开头加 `_migrationShowAll = false;`，避免切来源后仍停在"全部"态导致计数错乱。

- [ ] **Step 9: window 暴露 toggleMigrationShowAll**

`Object.assign(window, {...})` 块补：

```js
  toggleMigrationShowAll: toggleMigrationShowAll,
```

- [ ] **Step 10: 运行确认通过**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path"`
Expected: PASS

- [ ] **Step 11: 手动验证**

讲一道 fine tag 题数 >6 的题（如 `word-adj-adv-choice`，54 题）→ 迁移抽屉默认 6 题 + 底部「显示全部 N 题」→ 点开列全部 → 按钮变「收起，只看 6 题」→ 点收起回到 6。

- [ ] **Step 12: Commit**

```bash
git add docs/grammar-fill/modules/migration-training.js docs/grammar-fill/modules/teaching-render.js docs/grammar-fill/index.html tests/smoke.spec.js
git commit -m "feat(migration): 迁移抽屉/讲题台加显示全部，不再固定6题"
```

---

## Task 6: 全量回归 + 工程校验

**Files:** 无（运行检查）

- [ ] **Step 1: 跑全部工程检查**

Run: `npm run check`
Expected: `OK: all engineering checks passed`（含 grammar_bank/modules/secrets/migrations/edge/static/browser smoke 校验）

- [ ] **Step 2: 跑完整 smoke**

Run: `npm run test:smoke`
Expected: 全绿（含本计划新增断言 + 既有迁移/图谱/知识库用例）

- [ ] **Step 3: 若有失败，按 systematic-debugging 修复后重跑，直到全绿**

---

## Task 7: 地基校对 — 28 个 populated fine tag 标注抽查（上线前 gate）

**Files:**
- Create: `docs/planning/bank-fine-tag-audit-2026-05-31.md`（报告）
- Modify: `docs/grammar-fill/data/grammar_bank.js`（仅修正确认的误标）

> 此任务是"迁移要准"的最后一道关：grep 已验证 `fine_category` 非空、格式对，但验不了"标得对不对"。

- [ ] **Step 1: 导出 28 个 populated tag 的题目清单**

Run（列出每个 fine tag 下的题干，供逐题核对）：

```bash
cd docs && node -e '
require("./data/grammar_fine_tags.js"); 
const fs=require("fs"); const src=fs.readFileSync("data/grammar_bank.js","utf8");
' 2>/dev/null || grep -o "fine_category\"\?:\s*\"[^\"]*\"" docs/data/grammar_bank.js | sed 's/.*"\([^"]*\)"$/\1/' | sort | uniq -c | sort -rn
```

（若 node 直接 require 不便，改用浏览器 console：打开站点后 `window.ALL_QUESTIONS.filter(q=>q.fine_category==='pred-passive-form').map(q=>q.sentence||q.text)`，逐 tag 导出。）

- [ ] **Step 2: 逐题语义核对（AI 辅助 + 人工确认）**

对 28 个 tag 各自的题，核对「句子考查的语法点 ↔ fine_category 名称」是否吻合（fine tag 名称见 `data/grammar_fine_tags.js`）。把可疑项（疑似误标）记入报告：题目定位、当前 tag、建议 tag、依据。参考 `docs/planning/bank-correctness-audit.md` 既有结论，避免重复劳动。

- [ ] **Step 3: 写报告 `docs/planning/bank-fine-tag-audit-2026-05-31.md`**

含：①28 tag 题数分布；②逐 tag 核对结论（OK / 可疑项清单）；③稀疏 tag（≤2 题）标注；④空 tag（79 个）说明为"题库尚未覆盖，非错误"。

- [ ] **Step 4: 修正确认的误标**

仅对**用户确认**的误标项改 `grammar_bank.js` 对应题的 `fine_category`。改完跑 `python3 scripts/check_grammar_bank.py` 确认结构仍合法。

- [ ] **Step 5: Commit**

```bash
git add docs/planning/bank-fine-tag-audit-2026-05-31.md docs/grammar-fill/data/grammar_bank.js
git commit -m "docs+fix(bank): 28个populated fine tag标注抽查报告 + 修正确认的误标"
```

---

## 自检（Self-Review）记录

- **Spec 覆盖**：需求1→Task2；需求2→Task3；需求3→Task4；需求4→Task1；需求5→Task5；地基校对→Task7；回归→Task6。全覆盖。
- **类型一致**：`buildFineTagPracticePlan`(Task2) 返回 `{hasQuestions, questions, currentExam, emptyMessage}` 与 `startByFineTag` 消费一致；`buildMigrationContentViewModel(data, source, showAll)` 第三参 `showAll` 在 Task5 三处调用一致；`showAllButton.{visible,showingAll,label}` 渲染端与模型端字段一致；`collectExpandableIds(childrenOf)`/`collectDecisionAncestors(id, byId)`/`searchDecisionNodes(query, byId)` 签名在 index.html 调用一致。
- **无占位符**：所有代码步骤含完整代码与确切命令。decision_map 的 `kd` 补全对 predicate 三父节点给出确切值，其余给出确切核对方法（比对 KNOWLEDGE_DATA.sub key）。
