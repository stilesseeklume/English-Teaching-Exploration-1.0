# 考点视图(文字)改叶子驱动+可点进迁移 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把「考点训练」文字 tab（`renderFineCategoryView` / 考点视图）从"102 个 fine-tag 网格 + 点击只弹 alert"改成"决策地图叶子按大类分组 + 每个可点叶子进与图完全一致的精准迁移"。

**Architecture:** 决策地图（`docs/data/decision_map.js`）的叶子是精确考点的单一来源。新增纯 builder `buildPointsLeafListModel` 收集叶子、分组、算计数(points/fine 同图口径)、定 click action；抽共用纯函数 `buildPointBreadcrumb`（图的 `dmBreadcrumb` 也改调它）。重写 `renderFineCategoryView` 渲染叶子 chips（可点→`startByPointFromMap`/`startMigrationFromMap`，0题置灰）。删旧网格 builder。

**Tech Stack:** 原生 JS（ES5 IIFE 模块 `window.Grammar*`，纯模块禁浏览器副作用）；测试 `tests/smoke.spec.js`（Playwright `page.evaluate`）；契约 `scripts/check_grammar_modules.py`（仅校验导出存在）。

**关键约束：**
- 行号会漂移：每步先 `grep` 锚点再改。
- 纯模块禁 `document`/`alert`（`FORBIDDEN_IN_PURE_MODULES`）。
- 删导出必须同步删 `check_grammar_modules.py`。
- 全量验证 `npm run check`；本地可跑（Playwright + chromium 已装），子代理沙箱内跑不了 Playwright → 纯模块用 node-shim 验证、index.html 用内联脚本语法检查，浏览器行为留主控验证。
- node-shim 验证纯模块：`node -e "global.window={};require('./docs/grammar-fill/modules/knowledge-view-model.js');..."`（模块只挂 window、无 DOM，可跑）。
- index.html 内联脚本语法检查片段（每次改 index.html 后跑，须 `checked 3 inline scripts, 0 errors`）：
```
node - <<'EOF'
const fs=require('fs'),vm=require('vm');const html=fs.readFileSync('docs/grammar-fill/index.html','utf8');
const re=/<script\b([^>]*)>([\s\S]*?)<\/script>/gi;let m,i=0,bad=0;
while((m=re.exec(html))){if(/\bsrc\s*=/.test(m[1]||''))continue;i++;try{new vm.Script(m[2],{filename:'x'+i});}catch(e){bad++;console.log('ERR #'+i+': '+e.message);}}
console.log('checked '+i+' inline scripts, '+bad+' errors');
EOF
```

---

## File Structure

| 文件 | 职责 | 改动 |
|---|---|---|
| `docs/grammar-fill/modules/knowledge-view-model.js` | 知识/考点纯 builder | +`buildPointBreadcrumb` +`buildPointsLeafListModel`；删 `buildFineCategoryModel`/`buildFineCategoryViewModel`/`buildFineCategoryTagMessage` |
| `docs/grammar-fill/index.html` | 渲染/事件 | 重写 `renderFineCategoryView`；`dmBreadcrumb` 改调共用；修 `startMigrationFromMap` 返回指向 |
| `scripts/check_grammar_modules.py` | 模块契约 | +2 新导出；-3 旧导出 |
| `tests/smoke.spec.js` | Playwright smoke | +新 builder 断言；删旧 builder 断言；扩展考点训练页点击 chip 断言 |

数据来源：`window.GRAMMAR_DECISION_MAP.nodes`（叶子带 `cat`/`point{tag,keys}`/`fine`/`parent`/`title`）。`buildDecisionTree(nodes)` → `{rootId, byId, childrenOf}`；叶子 = `childrenOf[id].length===0`。

---

## Task 1: 抽共用纯函数 buildPointBreadcrumb

**Files:**
- Modify: `docs/grammar-fill/modules/knowledge-view-model.js`
- Modify: `docs/grammar-fill/index.html`（`dmBreadcrumb` 改调）
- Modify: `scripts/check_grammar_modules.py`（+导出）
- Test: `tests/smoke.spec.js`

- [ ] **Step 1: 写失败的 smoke 断言**

grep `GrammarKnowledgeViewModel` 找 smoke 里现有 evaluate 块，加：
```js
var kvmBc = window.GrammarKnowledgeViewModel;
var dmTree = kvmBc.buildDecisionTree((window.GRAMMAR_DECISION_MAP||{}).nodes||[]);
var bcPresent = kvmBc.buildPointBreadcrumb(dmTree, 'l_tense_present', window.CATEGORY_MAP||{});
```
并入布尔链：
```js
&& bcPresent === '按考点 · 谓语动词 · 时态 · 一般现在'
```

- [ ] **Step 2: 跑 node-shim 确认失败**

Run:
```
node -e "global.window={};require('./docs/grammar-fill/modules/knowledge-view-model.js');console.log(typeof window.GrammarKnowledgeViewModel.buildPointBreadcrumb)"
```
Expected: `undefined`（函数还不存在）。

- [ ] **Step 3: 实现 buildPointBreadcrumb**

在 `knowledge-view-model.js` 的 `buildDecisionTree` 函数之后（grep `function buildDecisionTree` 找到其结尾 `}` 后）新增：
```js
  // 叶子→「按考点 · 粗类 · 父分组(≠粗类时) · 叶子标题」。图的 dmBreadcrumb 与考点视图共用。
  function buildPointBreadcrumb(tree, nodeId, categoryMap) {
    tree = tree || { byId: {} };
    categoryMap = categoryMap || {};
    var node = (tree.byId || {})[nodeId];
    if (!node) return '';
    var catName = node.cat ? (categoryMap[node.cat] || node.cat) : '';
    var parent = (node.parent && tree.byId[node.parent]) ? tree.byId[node.parent] : null;
    var parts = [];
    if (catName) parts.push(catName);
    if (parent && parent.title && parent.title !== catName) parts.push(parent.title);
    if (node.title) parts.push(node.title);
    return '按考点' + (parts.length ? ' · ' + parts.join(' · ') : '');
  }
```

- [ ] **Step 4: 导出 buildPointBreadcrumb**

grep `buildDecisionTree: buildDecisionTree,`（约 line 1557），其后加：
```js
    buildPointBreadcrumb: buildPointBreadcrumb,
```

- [ ] **Step 5: index.html 的 dmBreadcrumb 改调共用**

grep `function dmBreadcrumb(full, node)`（index.html），整函数替换为：
```js
function dmBreadcrumb(full, node) {
  return node ? window.GrammarKnowledgeViewModel.buildPointBreadcrumb(full, node.id, CATEGORY_MAP) : '';
}
```

- [ ] **Step 6: 加 python 契约**

`scripts/check_grammar_modules.py` grep `"buildDecisionTree",`，其后加一行：
```python
            "buildPointBreadcrumb",
```

- [ ] **Step 7: 验证**

```
node -e "global.window={};require('./docs/grammar-fill/modules/knowledge-view-model.js');var k=window.GrammarKnowledgeViewModel;var t=k.buildDecisionTree(require('./docs/data/decision_map.js')||[]);" 2>/dev/null || true
node -e "global.window={};require('./docs/data/decision_map.js');require('./docs/grammar-fill/modules/knowledge-view-model.js');var k=window.GrammarKnowledgeViewModel;var t=k.buildDecisionTree(window.GRAMMAR_DECISION_MAP.nodes);console.log(k.buildPointBreadcrumb(t,'l_tense_present',{predicate:'谓语动词'}))"
```
Expected: `按考点 · 谓语动词 · 时态 · 一般现在`
然后 `python3 scripts/check_grammar_modules.py`（OK）+ index.html 内联脚本语法检查（3 scripts 0 errors）。

- [ ] **Step 8: 提交**

```bash
git add docs/grammar-fill/modules/knowledge-view-model.js docs/grammar-fill/index.html scripts/check_grammar_modules.py tests/smoke.spec.js
git commit -m "refactor(points): 抽共用纯函数 buildPointBreadcrumb(图与考点视图共用面包屑)"
```

---

## Task 2: 新增 buildPointsLeafListModel（叶子清单纯 builder）

**Files:**
- Modify: `docs/grammar-fill/modules/knowledge-view-model.js`
- Modify: `scripts/check_grammar_modules.py`
- Test: `tests/smoke.spec.js`

- [ ] **Step 1: 写失败的 smoke 断言**

在 Task 1 的 smoke 块（或新 evaluate 块）加：
```js
var leafModel = window.GrammarKnowledgeViewModel.buildPointsLeafListModel(
  (window.GRAMMAR_DECISION_MAP||{}).nodes||[], window.GRAMMAR_FINE_TAGS||{},
  window.ALL_QUESTIONS||[], window.errorBookQuestions||[], window.CATEGORY_MAP||{});
var predGroup = (leafModel.groups||[]).find(function(g){return g.id==='predicate';});
var presentLeaf = predGroup && predGroup.leaves.find(function(l){return l.id==='l_tense_present';});
var aanLeaf = (leafModel.groups||[]).reduce(function(acc,g){return acc||g.leaves.find(function(l){return l.id==='l_art_aan';});}, null);
```
注意：smoke 在浏览器里跑，`ALL_QUESTIONS`/`errorBookQuestions`/`CATEGORY_MAP`/`GRAMMAR_DECISION_MAP`/`GRAMMAR_FINE_TAGS` 是 index.html 的全局，evaluate 里可直接访问（用 `window.` 前缀更稳）。
并入断言：
```js
&& leafModel && Array.isArray(leafModel.groups) && leafModel.groups.length >= 8
&& predGroup && predGroup.titleText === '谓语动词' && predGroup.leaves.length >= 6
&& presentLeaf && presentLeaf.action.kind === 'point' && presentLeaf.action.tag === 'pred-tense'
&& presentLeaf.action.keys.length === 1 && presentLeaf.action.keys[0] === 'present'
&& presentLeaf.breadcrumb === '按考点 · 谓语动词 · 时态 · 一般现在'
&& presentLeaf.clickable === (presentLeaf.counts.total > 0)
&& aanLeaf && aanLeaf.action.kind === 'fine' && aanLeaf.action.fine === 'art-a-an'
```

- [ ] **Step 2: 跑 node-shim 确认失败**

```
node -e "global.window={};require('./docs/data/decision_map.js');require('./docs/grammar-fill/modules/knowledge-view-model.js');console.log(typeof window.GrammarKnowledgeViewModel.buildPointsLeafListModel)"
```
Expected: `undefined`。

- [ ] **Step 3: 实现 buildPointsLeafListModel**

在 `knowledge-view-model.js` 的 `buildFineCategoryLegendModel` 之后（grep `function buildFineCategoryLegendModel` 找其结尾）新增：
```js
  var POINTS_LEAF_CAT_ORDER = ['predicate','nonpredicate','word','number','article','pronoun','preposition','logic','attrib','nounclause','advclause'];

  // 决策地图叶子拍平成"考点清单"：按大类分组，每叶子带计数(points/fine 同图口径)+面包屑+点击动作。
  // 图(决策树)与文字(此清单)同一份数据两种布局。
  function buildPointsLeafListModel(decisionNodes, fineTags, bankQuestions, errorQuestions, categoryMap) {
    categoryMap = categoryMap || {};
    var tree = buildDecisionTree(decisionNodes);
    var byId = tree.byId, childrenOf = tree.childrenOf;
    var groupsMap = {};
    Object.keys(byId).forEach(function(id) {
      if ((childrenOf[id] || []).length !== 0) return; // 非叶子跳过
      var n = byId[id] || {};
      if (!n.cat) return; // 无大类的路由节点跳过（决策树叶子正常都带 cat）
      var counts = n.point
        ? countByPoint(n.point.tag, n.point.keys, bankQuestions, errorQuestions)
        : (n.fine ? countByFineTag(n.fine, bankQuestions, errorQuestions) : { bank: 0, error: 0, real: 0, total: 0 });
      var leaf = {
        id: id,
        title: n.title || id,
        breadcrumb: buildPointBreadcrumb(tree, id, categoryMap),
        counts: counts,
        badge: formatCountBadge(counts),
        frequencyStyle: getFrequencyStyle(counts.total),
        clickable: counts.total > 0,
        action: n.point
          ? { kind: 'point', tag: n.point.tag, keys: asArray(n.point.keys) }
          : { kind: 'fine', fine: n.fine || '' }
      };
      (groupsMap[n.cat] = groupsMap[n.cat] || []).push(leaf);
    });
    var groups = POINTS_LEAF_CAT_ORDER
      .filter(function(cat) { return groupsMap[cat] && groupsMap[cat].length; })
      .map(function(cat) {
        var leaves = groupsMap[cat];
        var total = leaves.reduce(function(s, l) { return s + (l.counts.total || 0); }, 0);
        return { id: cat, titleText: categoryMap[cat] || cat, leaves: leaves, total: total, leafCount: leaves.length, frequencyStyle: getFrequencyStyle(total) };
      });
    return {
      empty: groups.length === 0,
      emptyText: '决策地图数据未加载。',
      header: {
        titleText: '🏷️ 考点视图 · 点任一考点直接进同类训练',
        descriptionText: '决策地图叶子拍平成考点清单。颜色 = 当前题库题量频次；灰色 = 暂无真题（传新卷自然激活）。'
      },
      legend: buildFineCategoryLegendModel(),
      groups: groups
    };
  }
```

- [ ] **Step 4: 导出 buildPointsLeafListModel**

grep `buildPointBreadcrumb: buildPointBreadcrumb,`（Task 1 加的），其后加：
```js
    buildPointsLeafListModel: buildPointsLeafListModel,
```

- [ ] **Step 5: 加 python 契约**

grep `"buildPointBreadcrumb",`（Task 1 加的），其后加：
```python
            "buildPointsLeafListModel",
```

- [ ] **Step 6: 验证**

```
node -e "global.window={};require('./docs/data/decision_map.js');require('./docs/data/grammar_fine_tags.js');require('./docs/data/grammar_bank.js');require('./docs/grammar-fill/modules/knowledge-view-model.js');var k=window.GrammarKnowledgeViewModel;var qs=(window.GRAMMAR_BANK&&window.GRAMMAR_BANK.questions)||[]; /* points 需 q.points，bank 原始无 points→计数可能 0，仅验结构 */ var m=k.buildPointsLeafListModel(window.GRAMMAR_DECISION_MAP.nodes,window.GRAMMAR_FINE_TAGS,qs,[],{predicate:'谓语动词',article:'冠词'});var pg=m.groups.find(function(g){return g.id==='predicate';});var pl=pg.leaves.find(function(l){return l.id==='l_tense_present';});console.log(JSON.stringify({groups:m.groups.length,predLeaves:pg.leaves.length,presentAction:pl.action,bc:pl.breadcrumb}))"
```
Expected: groups ≥ 8，predLeaves ≥ 6，presentAction `{kind:'point',tag:'pred-tense',keys:['present']}`，bc `按考点 · 谓语动词 · 时态 · 一般现在`。
（注：node-shim 里 bank 原始数据可能没派生 `q.points`，计数可能为 0——只验结构/action/面包屑；真实计数由浏览器 smoke 验，那里 ALL_QUESTIONS 已挂 points。）
然后 `python3 scripts/check_grammar_modules.py`（OK）。

- [ ] **Step 7: 提交**

```bash
git add docs/grammar-fill/modules/knowledge-view-model.js scripts/check_grammar_modules.py tests/smoke.spec.js
git commit -m "feat(points): 新增 buildPointsLeafListModel(决策地图叶子拍平成可点考点清单)"
```

---

## Task 3: 重写 renderFineCategoryView + 修 startMigrationFromMap 返回指向

**Files:**
- Modify: `docs/grammar-fill/index.html`

- [ ] **Step 1: 修 startMigrationFromMap 返回指向**

grep `function startMigrationFromMap`（index.html）。其内 `setPreviousView({ page: 'knowledge' });` 改为：
```js
  setPreviousView({ page: 'points-training' });
```
并把注释里"返回指回知识库(全局图谱)"改为"返回指回考点训练"。

- [ ] **Step 2: 重写 renderFineCategoryView**

grep `function renderFineCategoryView`（index.html），整函数体替换为：
```js
function renderFineCategoryView() {
  applyKnowledgeViewState({ currentKnowledgeView: 'fine-cat', currentKnowledgeNodeId: '' });
  var content = document.getElementById(_knowledgeRenderTarget);
  if (!content) { updateDockBackButton(); return; }
  var model = window.GrammarKnowledgeViewModel.buildPointsLeafListModel(
    (window.GRAMMAR_DECISION_MAP || {}).nodes || [],
    window.GRAMMAR_FINE_TAGS || {},
    ALL_QUESTIONS, errorBookQuestions, CATEGORY_MAP);
  if (model.empty) {
    content.innerHTML = '<div class="empty-hint">' + escapeHtml(model.emptyText) + '</div>';
    updateDockBackButton();
    return;
  }
  var html = '<div class="knowledge-section">';
  html += '<div style="padding:20px 24px;background:var(--surface-2);border-radius:12px;margin-bottom:20px;">';
  html += '<h2 style="margin:0 0 6px 0;">' + escapeHtml(model.header.titleText) + '</h2>';
  html += '<p style="margin:0;color:var(--text-2);">' + escapeHtml(model.header.descriptionText) + '</p>';
  html += '</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:14px;">';
  model.groups.forEach(function(group) {
    var gc = group.frequencyStyle;
    html += '<section style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px;">';
    html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">';
    html += '<h3 style="margin:0;color:var(--text);">' + escapeHtml(group.titleText) + '</h3>';
    html += '<span style="background:' + gc.bg + ';color:' + gc.color + ';padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600;flex-shrink:0;">' + escapeHtml(group.total + ' 题') + '</span>';
    html += '</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
    group.leaves.forEach(function(leaf) {
      var c = leaf.frequencyStyle;
      var label = escapeHtml(leaf.title) + ' <span style="opacity:0.7;margin-left:2px;">' + escapeHtml(leaf.badge) + '</span>';
      var baseStyle = 'background:' + c.bg + ';color:' + c.color + ';border:1px solid color-mix(in srgb, ' + c.color + ' 30%, transparent);padding:4px 10px;border-radius:14px;font-size:12px;font-family:inherit;';
      if (!leaf.clickable) {
        html += '<span style="' + baseStyle + 'opacity:0.4;">' + label + '</span>';
      } else if (leaf.action.kind === 'point') {
        html += '<button onclick="startByPointFromMap(\'' + graphEscapeAttr(leaf.action.tag) + '\',' + dmKeysLiteral(leaf.action.keys) + ',\'' + graphEscapeAttr(leaf.breadcrumb) + '\')" style="' + baseStyle + 'cursor:pointer;">' + label + '</button>';
      } else {
        html += '<button onclick="startMigrationFromMap(\'' + graphEscapeAttr(leaf.action.fine) + '\')" style="' + baseStyle + 'cursor:pointer;">' + label + '</button>';
      }
    });
    html += '</div></section>';
  });
  html += '</div>';
  var legend = model.legend || {};
  html += '<div style="margin-top:24px;padding:14px 18px;background:var(--surface-2);border-radius:10px;font-size:13px;color:var(--text-2);">';
  html += '<b>' + escapeHtml(legend.labelText || '') + '</b> ';
  (legend.items || []).forEach(function(item) {
    var style = item.style || {};
    html += '<span style="background:' + style.bg + ';color:' + style.color + ';padding:2px 8px;border-radius:10px;margin:0 4px;">' + escapeHtml(item.text || '') + '</span>';
  });
  html += '<br><span style="color:var(--text-3);">' + escapeHtml(legend.noteText || '') + '</span>';
  html += '</div></div>';
  content.innerHTML = html;
  updateDockBackButton();
}
```
（注：`legend` 用 `buildFineCategoryLegendModel` 产出的 `labelText`/`items`/`noteText`——grep 该函数确认字段名，若是 `labelText` 则照用，若不同则按实际字段改这三处。`dmKeysLiteral`、`graphEscapeAttr`、`escapeHtml`、`_knowledgeRenderTarget` 均已存在。）

- [ ] **Step 3: 验证 index.html 语法**

跑内联脚本语法检查片段（见顶部），须 `checked 3 inline scripts, 0 errors`。grep 确认 `buildFineCategoryViewModel` 在 index.html 已无引用（`grep -n "buildFineCategoryViewModel\|buildFineCategoryModel\|buildFineCategoryTagMessage" docs/grammar-fill/index.html` → 0）。

- [ ] **Step 4: 提交**

```bash
git add docs/grammar-fill/index.html
git commit -m "feat(points): 考点视图改叶子驱动clickable chips(point→精准迁移/fine→startMigration/0题置灰)+修startMigration返回考点训练"
```

---

## Task 4: 删除旧网格 builder（保留 legend/频次/计数助手）

**Files:**
- Modify: `docs/grammar-fill/modules/knowledge-view-model.js`
- Modify: `scripts/check_grammar_modules.py`
- Modify: `tests/smoke.spec.js`

- [ ] **Step 1: 删三个旧函数**

`knowledge-view-model.js`：
- grep `function buildFineCategoryTagMessage` → 删整函数。
- grep `function buildFineCategoryModel` → 删整函数。
- grep `function buildFineCategoryViewModel` → 删整函数。
- **保留** `buildFineCategoryLegendModel`、`getFrequencyStyle`、`countByFineTag`、`countByPoint`、`formatCountBadge`。
删导出行：grep 并删 `buildFineCategoryTagMessage: buildFineCategoryTagMessage,`、`buildFineCategoryModel: buildFineCategoryModel,`、`buildFineCategoryViewModel: buildFineCategoryViewModel,`（保留 `buildFineCategoryLegendModel: ...`）。

- [ ] **Step 2: 删 python 契约 3 项**

`scripts/check_grammar_modules.py` grep 并删：`"buildFineCategoryTagMessage",`、`"buildFineCategoryModel",`、`"buildFineCategoryViewModel",`（**保留** `"buildFineCategoryLegendModel",`）。

- [ ] **Step 3: 删 smoke 里旧 builder 断言**

`tests/smoke.spec.js`：grep `fineCategoryModel`、`fineCategoryViewModel`、`fineCategoryTagMessage`。删除它们的 `var` 声明行 + 巨型 core-path 链里引用它们的 `&&` 操作数行（grep `buildFineCategoryModel(`、`buildFineCategoryViewModel(`、`buildFineCategoryTagMessage(` 找声明；grep `fineCategoryModel`、`fineCategoryViewModel`、`fineCategoryTagMessage &&`、`fineCategoryTagMessage.indexOf` 找断言操作数）。**保留** `fineCategoryLegend`（buildFineCategoryLegendModel 的断言）。逐条 grep 确认归属再删，删后确保 `&&` 链无悬空（不要删成 `&& && `）。

- [ ] **Step 4: 验证**

```
node -e "global.window={};require('./docs/grammar-fill/modules/knowledge-view-model.js');var k=window.GrammarKnowledgeViewModel;console.log([k.buildFineCategoryViewModel,k.buildFineCategoryModel,k.buildFineCategoryTagMessage].map(function(f){return typeof f;}).join(','), '| legend:', typeof k.buildFineCategoryLegendModel)"
```
Expected: `undefined,undefined,undefined | legend: function`。
`node --check tests/smoke.spec.js`（通过）+ `python3 scripts/check_grammar_modules.py`（OK）。

- [ ] **Step 5: 提交**

```bash
git add docs/grammar-fill/modules/knowledge-view-model.js scripts/check_grammar_modules.py tests/smoke.spec.js
git commit -m "refactor(points): 删旧考点视图网格builder(buildFineCategoryModel/ViewModel/TagMessage)+契约+smoke,保留legend/频次助手"
```

---

## Task 5: 扩展考点训练页浏览器 smoke（点精确叶子→精确标题）+ 全量验证

**Files:**
- Modify: `tests/smoke.spec.js`

- [ ] **Step 1: 扩展「考点训练页」浏览器测试**

grep `考点训练页：dock 入口` 找到现有那条 test。在它"切 文字"之后、`expect(errors)` 之前，加点击精确叶子 chip 的断言：
```js
  // 文字视图：点具体时态叶子 → 落精确练习标题（叶子驱动 + 可点进迁移）
  await page.locator('#ptTextBtn').click();
  await expect(page.locator('#pointsTrainingContent')).toContainText(/考点视图/);
  await page.locator('#pointsTrainingContent button', { hasText: '一般现在' }).first().click();
  await expect(page.locator('#page-practice')).toHaveClass(/active/);
  await expect(page.locator('#sourceName')).toHaveText('按考点 · 谓语动词 · 时态 · 一般现在');
  await expect(await page.evaluate(() => {
    var qs = (window.GrammarAppState.state.currentQuestions) || [];
    return qs.length > 0 && qs.every(function(q){ return (q.points||[]).some(function(p){ return p.tag==='pred-tense' && p.key==='present'; }); });
  })).toBe(true);
```
（注：若该 test 末尾切回图的断言会因导航到 practice 而失效，把那两行"切回图"挪到本段之前，或删除——保证本段是该 test 最后的导航动作。grep 看清该 test 结构后调整。）

- [ ] **Step 2: 本地全量验证**

Run:
```
SMOKE_PORT=8970; python3 -m http.server $SMOKE_PORT >/tmp/sk.log 2>&1 & SRV=$!; sleep 1.5
for i in $(seq 1 20); do curl -fsS "http://localhost:$SMOKE_PORT/docs/" >/dev/null 2>&1 && break; sleep 0.4; done
SEEKLUME_BASE_URL="http://localhost:$SMOKE_PORT" npx playwright test tests/smoke.spec.js --project=chromium --reporter=line 2>&1 | tail -4
kill $SRV 2>/dev/null
```
Expected: 全部 passed（含新断言）。
然后 `npm run check` → `OK: all engineering checks passed`。

- [ ] **Step 3: preview 视觉确认**

主控用 Playwright 截图：考点训练→文字视图→卡片列精确叶子、有题的可点/0题置灰；点"一般现在"→标题"按考点 · 谓语动词 · 时态 · 一般现在"。

- [ ] **Step 4: 提交**

```bash
git add tests/smoke.spec.js
git commit -m "test(smoke): 考点训练页点精确时态叶子→精确练习标题(叶子驱动可点进迁移)"
```

---

## Task 6: 收尾

- [ ] **Step 1:** `npm run check` 全绿确认。
- [ ] **Step 2:** 更新记忆 `ui-feedback-points-dock-resume.md` / 新建条目：考点视图改叶子驱动+可点，已完成待验收。
- [ ] **Step 3:** 不自动发布——汇报 + 截图，问用户是否合 main + push（按 [[deploy-push-workflow]]，注意并行会话仍在推 main，沿用按路径上车的发布法）。

---

## Self-Review 记录

- **Spec 覆盖**：①叶子驱动 builder=Task2；②可点进迁移=Task3 chips；③0题置灰=Task3；④共用面包屑=Task1；⑤startMigration 返回修=Task3 Step1；⑥删旧 builder=Task4；⑦布局保留卡片网格=Task3；⑧测试=Task1/2 node-shim+smoke、Task5 浏览器。全覆盖。✅
- **占位符**：无 TBD；删除步骤带 grep-verify。✅
- **类型/命名一致**：`buildPointsLeafListModel(decisionNodes, fineTags, bank, errors, categoryMap)`、`buildPointBreadcrumb(tree, nodeId, categoryMap)`、leaf `{id,title,breadcrumb,counts,badge,frequencyStyle,clickable,action:{kind:'point',tag,keys}|{kind:'fine',fine}}`、group `{id,titleText,leaves,total,leafCount,frequencyStyle}` 在 Task2/3/5 一致。✅
- **风险**：① legend 字段名（labelText/items/noteText）需 grep `buildFineCategoryLegendModel` 实际确认（Task3 Step2 已提示）；② 删 smoke 操作数注意 `&&` 链不悬空（Task4 Step3 已提示）；③ node-shim 里 bank 无 points→计数 0，结构验证为主，真实计数靠浏览器 smoke（Task2 Step6 已注）。
