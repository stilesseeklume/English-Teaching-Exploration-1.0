# 考点导航去重 + 迁移可读性优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 落地组长线上反馈 5 点：迁移卡片显示模拟计数、迁移页标题改具体考点面包屑、删讲题局部图谱、知识库默认全局图谱、dock 合并「考点训练」(图/文字双视图) 并消除三代重复入口。

**Architecture:** 语法填空是 `docs/grammar-fill/index.html`（巨型 legacy 页，含渲染+事件）+ `docs/grammar-fill/modules/*.js`（纯数据 builder，挂 `window.Grammar*`，禁浏览器副作用）。改动遵循现有分层：逻辑放纯模块（可被 smoke 验证），DOM/事件留 index.html。测试是 `tests/smoke.spec.js`（Playwright，通过 `page.evaluate` 调模块函数断言）。

**Tech Stack:** 原生 JS（ES5 风格 IIFE 模块）、Playwright smoke、Python 契约校验（`scripts/check_grammar_modules.py`，仅校验导出**存在**，不校验精确集合——加导出无需改它，删导出必须同步删）。

**关键约束：**
- 纯模块禁用 `document`/`window.alert` 等（`check_grammar_modules.py` 的 `FORBIDDEN_IN_PURE_MODULES` 会拒）。
- 行号会随编辑漂移：每步先 `grep` 锚点字符串再改，不要硬信行号。
- 验证统一 `npm run check`（含 lint + python 契约 + 静态站点 + Playwright smoke）。单独跑 smoke：`npm run test:smoke`。

---

## File Structure

| 文件 | 职责 | 本计划改动 |
|---|---|---|
| `docs/grammar-fill/modules/knowledge-view-model.js` | 知识页/计数纯 builder | 新增 `formatCountBadge`；考点视图 countText 改用它 |
| `docs/grammar-fill/modules/category-rules.js` | 考点名/练习入口 builder | 三个 builder 加可选 `sourceLabel` 参数 |
| `docs/grammar-fill/modules/app-state.js` | 页面/dock 状态机 | 删讲题图谱 tab；注册新 `points-training` 页 |
| `docs/grammar-fill/modules/teaching-render.js` | 讲题/迁移 HTML | 删 `teachingKnowledgeHtml` |
| `docs/grammar-fill/modules/teaching-view-model.js` | 讲题 view-model | 删 `buildTeachingKnowledgePanelModel`；`normalizeTab`/`getTabLabel` 去 knowledge |
| `docs/grammar-fill/index.html` | 页/渲染/事件 | 徽章、面包屑、删图谱 tab、新考点训练页、知识库瘦身、默认视图 |
| `tests/smoke.spec.js` | Playwright smoke | 新增/改断言 |
| `scripts/check_grammar_modules.py` | 模块契约 | 删图谱相关导出后同步删契约项 |

---

## Task 1: 决策地图徽章 + 考点视图显示「模拟」计数

**Files:**
- Modify: `docs/grammar-fill/modules/knowledge-view-model.js`（新增 `formatCountBadge` + 导出；改 `buildFineCategoryViewModel` countText）
- Modify: `docs/grammar-fill/index.html`（决策地图叶子徽章 + 词 chip）
- Test: `tests/smoke.spec.js`

- [ ] **Step 1: 写失败的 smoke 断言**

在 `tests/smoke.spec.js` 找现有调用 `window.GrammarKnowledgeViewModel` 的某个 `page.evaluate(() => {...})` 断言块（grep `GrammarKnowledgeViewModel`），在其返回的布尔链里追加对 `formatCountBadge` 的断言。新增表达式：

```js
// formatCountBadge：真题+模拟+错题分段
var kvmBadge = window.GrammarKnowledgeViewModel;
var badgeMixed = kvmBadge.formatCountBadge({ bank: 12, real: 5, error: 0, total: 12 });
var badgeAllReal = kvmBadge.formatCountBadge({ bank: 5, real: 5, error: 0, total: 5 });
var badgeWithErr = kvmBadge.formatCountBadge({ bank: 12, real: 5, error: 3, total: 15 });
```

并入断言：

```js
&& badgeMixed === '12 题 · 真题5 · 模拟7'
&& badgeAllReal === '5 题'
&& badgeWithErr === '15 题 · 真题5 · 模拟7 · 错题3'
```

- [ ] **Step 2: 跑 smoke 确认失败**

Run: `npm run test:smoke`
Expected: FAIL（`formatCountBadge` is not a function / 断言为 false）

- [ ] **Step 3: 实现 `formatCountBadge`**

在 `knowledge-view-model.js` 的 `countByPoint` 之后（约 line 72 后）新增：

```js
  // 计数徽章：total 题 · 真题R · 模拟M · 错题E。全真题(无模拟无错题)时只显示「N 题」。
  // mock = bank - real（bank 中非真题即模拟卷）；error = 错题本命中数。
  function formatCountBadge(counts) {
    counts = counts || {};
    var total = Number(counts.total) || 0;
    var real = Number(counts.real) || 0;
    var error = Number(counts.error) || 0;
    var mock = Math.max(0, (Number(counts.bank) || 0) - real);
    if (mock === 0 && error === 0) return total + ' 题';
    var segs = [];
    if (real > 0) segs.push('真题' + real);
    if (mock > 0) segs.push('模拟' + mock);
    if (error > 0) segs.push('错题' + error);
    return total + ' 题 · ' + segs.join(' · ');
  }
```

在文件底部 `window.GrammarKnowledgeViewModel = { ... }` 导出对象里加一行（grep `countByPoint: countByPoint` 定位）：

```js
    formatCountBadge: formatCountBadge,
```

- [ ] **Step 4: 决策地图叶子徽章改用 `formatCountBadge`**

在 `index.html` grep 锚点 `var badge = (c.real < qn)`（约 line 5324），替换该行为：

```js
      var badge = window.GrammarKnowledgeViewModel.formatCountBadge(c);
```

（`c` 已是 `{bank,error,real,total}`，`qn` 仍用于 `if (qn > 0 ...)` 判断，保留不动。）

- [ ] **Step 5: 考点视图 countText 改用 `formatCountBadge`**

在 `knowledge-view-model.js` 的 `buildFineCategoryViewModel` 里，grep 锚点 `(counts.total + ' · 真题' + counts.real)`（约 line 415-417），把该三元表达式整体替换为：

```js
            countText: formatCountBadge(counts),
```

（注意删掉原 `(counts.real < counts.total) ? (...) : String(counts.total)` 整段，只留 `countText: formatCountBadge(counts),`。）

- [ ] **Step 6: 词 chip 也显示模拟（次要，保持口径一致）**

在 `index.html` grep 锚点 `var rt = (wd.real < wd.total)`（约 line 5338），替换为：

```js
          var wmock = Math.max(0, wd.total - wd.real);
          var rt = wmock > 0 ? ('·真' + wd.real + '·模' + wmock) : '';
```

- [ ] **Step 7: 跑 smoke 确认通过**

Run: `npm run test:smoke`
Expected: PASS

- [ ] **Step 8: 提交**

```bash
git add docs/grammar-fill/modules/knowledge-view-model.js docs/grammar-fill/index.html tests/smoke.spec.js
git commit -m "feat(points): 决策地图徽章+考点视图显示模拟计数(真题R·模拟M·错题E)"
```

---

## Task 2: 迁移页标题改具体考点面包屑

**背景**：从决策地图叶子点「迁移训练」→ `startByPointFromMap(tag,keys)` → `startByPoint` → `buildPointPracticePlan` 把标题写死成粗类「按考点·谓语动词」。要改成 `按考点 · 谓语动词 · 时态 · 一般现在`。

**面包屑算法**（3 段，确定性）：粗类名 + 父分组(若与粗类不同) + 叶子标题。词 chip 再追加具体词。文字视图(考点视图)用「粗类 · fine tag 名」。

**Files:**
- Modify: `docs/grammar-fill/modules/category-rules.js`（3 个 builder 加可选 `sourceLabel`）
- Modify: `docs/grammar-fill/index.html`（`dmBreadcrumb` 助手 + 三处入口透传）
- Test: `tests/smoke.spec.js`

- [ ] **Step 1: 写失败的 smoke 断言**

grep `GrammarCategoryRules` 找 smoke 里现有断言块，追加：

```js
var cr = window.GrammarCategoryRules;
var planWithLabel = cr.buildPointPracticePlan('pred-tense', ['present'],
  [{ category: 'predicate', points: [{ tag: 'pred-tense', key: 'present' }] }],
  { predicate: '谓语动词' }, '按考点 · 谓语动词 · 时态 · 一般现在');
var planNoLabel = cr.buildPointPracticePlan('pred-tense', ['present'],
  [{ category: 'predicate', points: [{ tag: 'pred-tense', key: 'present' }] }],
  { predicate: '谓语动词' });
```

并入断言：

```js
&& planWithLabel.currentExam.source === '按考点 · 谓语动词 · 时态 · 一般现在'
&& planNoLabel.currentExam.source === '按考点 · 谓语动词'
```

- [ ] **Step 2: 跑 smoke 确认失败**

Run: `npm run test:smoke`
Expected: FAIL（`planWithLabel.currentExam.source` 仍是 `按考点 · 谓语动词`）

- [ ] **Step 3: `buildCategoryPracticeEntryModel` 接受 `sourceLabel`**

在 `category-rules.js` grep `function buildCategoryPracticeEntryModel`（line 148），替换整个函数为：

```js
  function buildCategoryPracticeEntryModel(category, questions, categoryMap, sourceLabel) {
    questions = asArray(questions);
    return {
      category: category || '',
      questions: questions,
      hasQuestions: questions.length > 0,
      emptyMessage: getEmptyCategoryMessage(category),
      currentExam: {
        source: sourceLabel || getCategorySourceText(category, categoryMap),
        questions: questions,
        mode: 'category',
        category: category || ''
      }
    };
  }
```

- [ ] **Step 4: `buildPointPracticePlan` / `buildFineTagPracticePlan` 透传 `sourceLabel`**

grep `function buildPointPracticePlan`（line 201），替换为：

```js
  function buildPointPracticePlan(tag, keys, allQuestions, categoryMap, sourceLabel) {
    var questions = selectPointQuestions(allQuestions, tag, keys);
    var category = questions.length ? questions[0].category : '';
    return buildCategoryPracticeEntryModel(category, questions, categoryMap, sourceLabel);
  }
```

grep `function buildFineTagPracticePlan`（line 178），替换为：

```js
  function buildFineTagPracticePlan(fineCategory, allQuestions, categoryMap, sourceLabel) {
    var questions = selectFineTagQuestions(allQuestions, fineCategory);
    // 假设同一 fine_category 下所有题目属于同一粗类别（当前数据成立）
    var category = questions.length ? questions[0].category : '';
    return buildCategoryPracticeEntryModel(category, questions, categoryMap, sourceLabel);
  }
```

- [ ] **Step 5: 跑 smoke 确认模块层通过**

Run: `npm run test:smoke`
Expected: PASS（Task 2 的两条断言通过）

- [ ] **Step 6: index.html 加 `dmBreadcrumb` 助手 + `startByPoint` 透传**

在 `index.html` grep `function startByPoint(tag, keys)`（line 2679），把该函数签名与内部调用改为带 `sourceLabel`：

```js
function startByPoint(tag, keys, sourceLabel) {
  closeDrawer();
  resetPracticeDisplayState();
  var entryModel = window.GrammarCategoryRules.buildPointPracticePlan(tag, keys, ALL_QUESTIONS, CATEGORY_MAP, sourceLabel);
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

在 `startByPoint` 之前新增面包屑助手（粗类 · 父分组 · 叶子）：

```js
// 决策地图叶子→「按考点 · 粗类 · 父分组 · 叶子」面包屑。父分组与粗类同名时省略。
function dmBreadcrumb(full, node) {
  if (!node) return '';
  var catName = node.cat ? (CATEGORY_MAP[node.cat] || node.cat) : '';
  var parent = node.parent && full.byId[node.parent] ? full.byId[node.parent] : null;
  var parts = [];
  if (catName) parts.push(catName);
  if (parent && parent.title && parent.title !== catName) parts.push(parent.title);
  if (node.title) parts.push(node.title);
  return '按考点' + (parts.length ? ' · ' + parts.join(' · ') : '');
}
```

- [ ] **Step 7: `startByPointFromMap` 接受并透传面包屑**

grep `function startByPointFromMap`（line 5231）。当前是 `function startByPointFromMap(tag, keys) { ... startByPoint(tag, keys); }`。改为：

```js
function startByPointFromMap(tag, keys, sourceLabel) {
  // 关闭知识库覆盖层等（保留原函数体的其余逻辑），最后带 sourceLabel 进练习
  startByPoint(tag, keys, sourceLabel);
}
```

（注意：保留 `startByPointFromMap` 原有的其它语句——grep 看清原函数体后只追加第三参并透传，勿删原逻辑。）

- [ ] **Step 8: 决策地图叶子按钮 + 词 chip 传面包屑**

在 `index.html` 决策地图叶子渲染处，grep 锚点 `startByPointFromMap(\'' + graphEscapeAttr(n.point.tag)`（约 line 5326）。在该叶子分支内、构造按钮前先算面包屑：

```js
      var dmBc = dmBreadcrumb(full, n);
```

把叶子迁移按钮的 onclick 第三参补上（在 `dmKeysLiteral(n.point.keys)` 之后）：

```js
      if (qn > 0 && n.point) acts += '<button type="button" onclick="event.stopPropagation();startByPointFromMap(\'' + graphEscapeAttr(n.point.tag) + '\',' + dmKeysLiteral(n.point.keys) + ',\'' + graphEscapeAttr(dmBc) + '\')">🔁 迁移训练 · ' + badge + '</button>';
```

词 chip 处 grep `startByPointFromMap(\'' + graphEscapeAttr(pointTag) + '\',[\'' + graphEscapeAttr(wd.word)`（约 line 5340），第三参用「叶子面包屑 · 具体词」：

```js
            + ' onclick="event.stopPropagation();startByPointFromMap(\'' + graphEscapeAttr(pointTag) + '\',[\'' + graphEscapeAttr(wd.word) + '\'],\'' + graphEscapeAttr(dmBc + ' · ' + wd.word) + '\')">'
```

（`dmBc` 在该叶子作用域已可见——确认 chip 渲染在同一叶子分支内；若不在，把 `dmBreadcrumb(full, n)` 提到 chip 构造前。）

- [ ] **Step 9: 考点视图(文字)点 fine tag 也传面包屑**

grep `function startByFineTag(fine)`（line 2661）。把内部调用改为带 label：

```js
function startByFineTag(fine) {
  closeDrawer();
  resetPracticeDisplayState();
  var fineName = (window.GRAMMAR_FINE_TAGS && window.GRAMMAR_FINE_TAGS.tags_by_id && window.GRAMMAR_FINE_TAGS.tags_by_id[fine] && window.GRAMMAR_FINE_TAGS.tags_by_id[fine].name) || fine;
  var probe = window.GrammarCategoryRules.selectFineTagQuestions(ALL_QUESTIONS, fine);
  var catName = probe.length ? (CATEGORY_MAP[probe[0].category] || probe[0].category) : '';
  var label = '按考点' + (catName ? ' · ' + catName : '') + ' · ' + fineName;
  var entryModel = window.GrammarCategoryRules.buildFineTagPracticePlan(fine, ALL_QUESTIONS, CATEGORY_MAP, label);
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

- [ ] **Step 10: preview 手动验证三条路径标题**

启动 preview（见末尾验证任务），分别从：①决策地图「一般现在」叶子点迁移 → 标题应为「按考点 · 谓语动词 · 时态 · 一般现在」；②冠词叶子 a/an 词 chip → 末段带 `· a`；③考点视图点某 fine tag → 「按考点 · 粗类 · tag名」。若某叶子面包屑层级不合理，微调 `dmBreadcrumb`（父分组取舍）。

- [ ] **Step 11: 跑 check 全绿 + 提交**

```bash
npm run check
git add docs/grammar-fill/modules/category-rules.js docs/grammar-fill/index.html tests/smoke.spec.js
git commit -m "feat(points): 迁移页标题改具体考点面包屑(粗类·分组·叶子，词chip带具体词)"
```

---

## Task 3: 删讲题舞台的「图谱」tab（局部图谱）

**背景**：讲题底部 tab 讲题/迁移/图谱，「图谱」是 per-question 知识思维导图。全删，只留 讲题/迁移。删除涉及契约导出，须同步 `check_grammar_modules.py`。

**Files:**
- Modify: `docs/grammar-fill/modules/app-state.js`（删 knowledge tabButton）
- Modify: `docs/grammar-fill/modules/teaching-view-model.js`（`normalizeTab`/`getTabLabel` 去 knowledge；删 `buildTeachingKnowledgePanelModel`）
- Modify: `docs/grammar-fill/modules/teaching-render.js`（删 `teachingKnowledgeHtml`）
- Modify: `docs/grammar-fill/index.html`（删 render 分支 + `buildTeachingKnowledgeHtml` + `openGlobalGraphForTeachingQuestion` + 导出 + CSS）
- Modify: `scripts/check_grammar_modules.py`（删 `teachingKnowledgeHtml`、`buildTeachingKnowledgePanelModel` 契约项）
- Test: `tests/smoke.spec.js`（去掉/改依赖 knowledge tab 的断言）

- [ ] **Step 1: app-state 删 knowledge tabButton**

grep `{ key: 'knowledge', label: '图谱', active: activeTab === 'knowledge' }`（app-state.js line 1200），删除该行（连同其前一行末尾逗号无需动，它是数组最后一项——删掉后 `migration` 行成为末项，确保其后无悬挂逗号）。结果 tabButtons：

```js
      tabButtons: [
        { key: 'guide', label: '讲题', active: activeTab === 'guide' },
        { key: 'migration', label: '迁移', active: activeTab === 'migration' }
      ],
```

- [ ] **Step 2: `normalizeTab` 折叠 knowledge→guide；`getTabLabel` 去图谱**

在 `teaching-view-model.js` grep `function normalizeTab`（line 227）：

```js
  function normalizeTab(tab) {
    if (tab === 'migration' || tab === 'guide') return tab;
    return 'guide';
  }
```

grep `if (tab === 'knowledge') return '图谱';`（line 236），删除该行。

- [ ] **Step 3: index.html 删 knowledge render 分支**

grep `} else if (stageModel.tab === 'knowledge') {`（line 3604），删除该 `else if` 整块（两行：判断 + `contentHtml = buildTeachingKnowledgeHtml(q);`），使其变成 `if (tab==='migration'){...} else {guide}`：

```js
    if (stageModel.tab === 'migration') {
      contentHtml = buildTeachingMigrationHtml(q);
    } else {
      contentHtml = buildTeachingGuideHtml(q, practicalGuide);
    }
```

- [ ] **Step 4: index.html 删 `buildTeachingKnowledgeHtml` 与 `openGlobalGraphForTeachingQuestion`**

grep `function buildTeachingKnowledgeHtml(q)`（line 3645），删除整行函数。
grep `function openGlobalGraphForTeachingQuestion`（line 3503），删除整个函数。
grep `openGlobalGraphForTeachingQuestion: openGlobalGraphForTeachingQuestion,`（line 5970），删除该导出行。
grep 确认 `buildTeachingKnowledgeHtml`、`openGlobalGraphForTeachingQuestion` 全仓再无引用（`grep -rn` 两个名字，应只剩已删处）。

- [ ] **Step 5: teaching-render 删 `teachingKnowledgeHtml`**

grep `function teachingKnowledgeHtml(q, deps)`（line 93），删除整个函数（到其 `return html; }`，约 line 151）。
grep `teachingKnowledgeHtml: teachingKnowledgeHtml,`（line ~355），删除该导出行。

- [ ] **Step 6: teaching-view-model 删 `buildTeachingKnowledgePanelModel`**

grep `function buildTeachingKnowledgePanelModel(q, deps)`（line 403），删除整个函数（到其闭合）。grep 其在导出对象 `buildTeachingKnowledgePanelModel:` 一行删除。
grep `buildGraphNodeIndex`：若仅被 `buildTeachingKnowledgePanelModel` 使用（`grep -rn buildGraphNodeIndex`），一并删除函数+导出；若 index.html 的 `getGraphNodeIndex` 仍引用则保留。**先 grep 确认再决定。**

- [ ] **Step 7: 同步删除 python 契约项**

在 `scripts/check_grammar_modules.py`：
- grep `"teachingKnowledgeHtml",`（line 636）删除该行。
- grep `"buildTeachingKnowledgePanelModel",`（line ~111）删除该行。
- 若 Step 6 删了 `buildGraphNodeIndex` 且它在契约里，同步删。

- [ ] **Step 8: 删 CSS（仅图谱用的类）**

grep CSS 类 `teaching-mindmap`、`mindmap-`（`teaching-mindmap-board`/`mindmap-leaf`/`mindmap-branch` 等）在 index.html `<style>` 中的定义。**先 grep 确认这些类只在已删的 `teachingKnowledgeHtml` 出现过**（`grep -rn "teaching-mindmap\|mindmap-"`），确认后删除对应 CSS 规则。`teaching-global-locator`/`node-link-chip` 若别处仍用则保留。

- [ ] **Step 9: 清理依赖 knowledge tab 的 smoke 断言**

grep smoke.spec.js 中 `'knowledge'` 与讲题 tab 相关、或 `buildTeachingKnowledgePanelModel`、`teachingKnowledgeHtml`、`返回全局图谱`（line ~2056 `dockKnowledgeLabel === '返回全局图谱'` 是知识库 map-node 返回，**与讲题 tab 无关，勿动**）。只移除/改对“讲题图谱 tab”或已删函数的断言。逐条 grep 判断归属后再改。

- [ ] **Step 10: 跑 check 全绿**

Run: `npm run check`
Expected: PASS（python 契约不再要求已删导出；smoke 不再断言图谱 tab）

- [ ] **Step 11: preview 验证讲题只剩 讲题/迁移**

进任一题讲题舞台，底部应只有 讲题/迁移（无图谱），切换正常，无 console 报错。

- [ ] **Step 12: 提交**

```bash
git add docs/grammar-fill/ scripts/check_grammar_modules.py tests/smoke.spec.js
git commit -m "refactor(teaching): 删讲题局部图谱tab(teachingKnowledgeHtml/PanelModel/openGlobalGraph+契约+CSS)"
```

---

## Task 4: dock 合并「考点训练」(图/文字双视图) + 知识库瘦身

**背景**：消除三代重复入口。dock 把「考点分类训练」换成「考点训练」(新页，图=决策地图 / 文字=考点视图)；知识库移除 🌐全局图谱、🏷️考点视图 两按钮；退役粗 11 类落地页 UI（保留 category-rules 纯函数不动，仅删 index.html UI 表层）。

**新页 `points-training`**：复用 `renderSystemView`（图）和 `renderFineCategoryView`（文字），不重写渲染。

**Files:**
- Modify: `docs/grammar-fill/modules/app-state.js`（注册 `points-training` 页 + dock key）
- Modify: `docs/grammar-fill/index.html`（新页 DOM + 渲染 + dock 改线 + 删 home categories 表层 + 知识库去两按钮）
- Test: `tests/smoke.spec.js`

- [ ] **Step 1: 写失败的 smoke 断言（app-state 认 points-training）**

grep smoke 里 `GrammarAppState` 的 evaluate 块，追加：

```js
var as = window.GrammarAppState;
var ptPage = as.buildActivePageState('points-training');
```

并入断言：

```js
&& ptPage.activePage === 'points-training' && ptPage.activeDock === 'points-training'
```

- [ ] **Step 2: 跑 smoke 确认失败**

Run: `npm run test:smoke`
Expected: FAIL（`points-training` 被规范化成 `home`，activeDock 为空）

- [ ] **Step 3: app-state 注册 `points-training` 页 + dock key**

`app-state.js` `normalizePageKey`（line 253-267）在 `|| page === 'knowledge'` 后加一行 `|| page === 'points-training'`。
`normalizeDockKey`（line 294-307）在 `|| dockKey === 'categories'` 后加 `|| dockKey === 'points-training'`（`categories` 保留兼容，不删）。
`getDockKeyForPage`（line 309-315）把条件改为：

```js
    if (page === 'home' || page === 'knowledge' || page === 'error-book' || page === 'lesson-prep' || page === 'points-training') {
      return page;
    }
```

`buildPageRenderPlan`（line 331-346）加一支：

```js
    if (page === 'points-training') renderAction = 'render-points-training';
```

- [ ] **Step 4: 跑 smoke 确认 app-state 断言通过**

Run: `npm run test:smoke`
Expected: PASS（Step 1 断言通过）

- [ ] **Step 5: index.html 新增 `points-training` 页 DOM**

grep 知识库页容器 `id="page-knowledge"` 看其结构（顶部 view 按钮组 + `#knowledgeContent`）。在 `page-knowledge` 的 `</div>` 之后（或紧邻其他 `<div class="page">` 处）插入新页：

```html
<div class="page" id="page-points-training">
  <div class="knowledge-view-switch">
    <button class="knowledge-view-btn active" id="ptGraphBtn" onclick="setPointsTrainingView('graph')">🌐 图谱</button>
    <button class="knowledge-view-btn" id="ptTextBtn" onclick="setPointsTrainingView('text')">🏷️ 文字</button>
  </div>
  <div id="pointsTrainingContent"></div>
</div>
```

（`knowledge-view-switch`/`knowledge-view-btn` 复用知识库已有 CSS；若类名不同，grep line 308 那组按钮的容器类名照抄。）

- [ ] **Step 6: index.html 实现 `setPointsTrainingView` + 渲染复用**

`renderSystemView` 与 `renderFineCategoryView` 当前把 HTML 写进 `#knowledgeContent`。为复用且不污染知识库，新增渲染函数把它们的输出导向 `#pointsTrainingContent`。最稳妥做法：让 `setPointsTrainingView` 临时切换目标容器——但两渲染函数硬编码了 `getElementById('knowledgeContent')`。**改为**：给两函数加可选目标参数。

grep `function renderSystemView(focusNodeId)`：把 `var content = document.getElementById('knowledgeContent');` 改为：

```js
  var content = document.getElementById(renderSystemView._target || 'knowledgeContent');
```

grep `function renderFineCategoryView`：同样把其 `getElementById('knowledgeContent')` 改为 `getElementById(renderFineCategoryView._target || 'knowledgeContent')`（grep 确认该函数内容器变量名后改）。

新增（放在 `renderKnowledgePage` 附近）：

```js
var _pointsTrainingView = 'graph';
function setPointsTrainingView(view) {
  _pointsTrainingView = (view === 'text') ? 'text' : 'graph';
  document.getElementById('ptGraphBtn').classList.toggle('active', _pointsTrainingView === 'graph');
  document.getElementById('ptTextBtn').classList.toggle('active', _pointsTrainingView === 'text');
  if (_pointsTrainingView === 'graph') {
    renderSystemView._target = 'pointsTrainingContent';
    try { renderSystemView(''); } finally { renderSystemView._target = ''; }
  } else {
    renderFineCategoryView._target = 'pointsTrainingContent';
    try { renderFineCategoryView(); } finally { renderFineCategoryView._target = ''; }
  }
}
function renderPointsTrainingPage() {
  setPointsTrainingView(_pointsTrainingView);
}
```

在 window 导出处（grep `navigateHome: navigateHome,` 附近）加 `setPointsTrainingView: setPointsTrainingView,`。

> 注意：`renderSystemView` 内部还调用 `applyKnowledgeViewState({currentKnowledgeView:'system'...})` 改全局知识库状态。在考点训练页复用会顺带改 `currentKnowledgeView`——可接受（不影响显示，知识库下次进入由 Task 5 强制重置）。preview 时确认决策地图在新页能正常拖拽/点叶子迁移。

- [ ] **Step 7: switchPage 接 `render-points-training`**

grep `if (renderPlan.renderAction === 'render-admin') renderAdminPage();`（line 2526），其后加：

```js
  if (renderPlan.renderAction === 'render-points-training') renderPointsTrainingPage();
```

- [ ] **Step 8: dock 改线——「考点分类训练」→「考点训练」**

grep dock HTML `data-dock-key="categories" onclick="navigateHome('categories')"`（line 5999），替换该 dock-item 为：

```html
  <div class="dock-item" data-label="考点训练" data-dock-key="points-training" onclick="switchPage('points-training')">
```

（保留其内部 `<div class="dock-dot">`/图标结构，只改 data-label / data-dock-key / onclick。grep 看清原 inner HTML 后照抄。）

- [ ] **Step 9: 知识库移除 🌐全局图谱 + 🏷️考点视图 两按钮**

grep `onclick="setKnowledgeView('system')"`（line 308）删除该 `<button>🌐 全局图谱</button>` 整行。
grep `onclick="setKnowledgeView('fine-cat')"`（line 311）删除该 `<button>🏷️ 考点视图</button>` 整行。
知识库剩：📖书本速查 / 📚教材视图 / 🗺知识地图。

- [ ] **Step 10: 退役粗 11 类落地页 UI（保留纯函数）**

- grep `function renderHomeCategories`，删除整个函数。
- grep `renderHomeCategories(`：删除所有调用处（如 `renderHome`/init 里的调用）。
- grep `id="homeCategories"`：删除 home 页里这块 DOM 容器及其相关切换（`navigateHome` 里 `homeCategories` 那行 toggle）。
- grep `function startByCategory`，删除整个函数 + 其 window 导出行（若有）。
- grep `function navigateHome`：删除 `categories` 分支相关行（`homeCategories` toggle）；`navigateHome('categories')` 已无调用方（dock 已改），但 `getPracticeEntryPreviousView('category')` 仍返回 `{page:'home',view:'categories'}` 作为迁移返回目标——**保留 category-rules 与 previousView 逻辑不动**（迁移“返回”仍可指向 home，落到 cards 即可；preview 验证返回不报错）。
- **不动** `category-rules.js`（`buildHomeCategoryModel`/`buildCategoryPracticePlan`/`HOME_CATEGORY_SECTIONS` 等纯函数保留，仍被 smoke + 契约覆盖；它们现在仅作未用工具，零风险，避免改 python 契约）。
- grep 确认 `buildHomeCategoryModel`/`homeCategoriesHtml` 在 index.html 已无调用（home-render 的 `homeCategoriesHtml` 若仅 renderHomeCategories 用，可留着不删——YAGNI 不强删模块导出）。

- [ ] **Step 11: 跑 check 全绿**

Run: `npm run check`
Expected: PASS

- [ ] **Step 12: preview 全流程验证**

- dock「考点训练」→ 默认图(决策地图)，可拖拽、点叶子「迁移训练」进练习（标题面包屑正确）。
- 切「文字」→ 考点视图网格，点 fine tag 进练习。
- 知识库 dock → 顶部只有 书本速查/教材视图/知识地图（无全局图谱/考点视图）。
- home 页无粗 11 类落地块，无 console 报错。

- [ ] **Step 13: 提交**

```bash
git add docs/grammar-fill/ tests/smoke.spec.js
git commit -m "feat(nav): dock合并考点训练(图=决策地图/文字=考点视图)+知识库瘦身+退役粗分类落地页"
```

---

## Task 5: 知识库每次进入默认全局图谱→改默认书本速查

**背景**：原需求是“知识库优先显示全局图谱”。但 Task 4 已把全局图谱移出知识库到「考点训练」。因此知识库默认视图应落到剩余视图里的合理项（📖书本速查），且每次进入都重置（修原 bug：只 init 一次、重进停在上次视图）。

**Files:**
- Modify: `docs/grammar-fill/index.html`
- Test: `tests/smoke.spec.js`

- [ ] **Step 1: `renderKnowledgePage` 默认视图改 book**

grep `setKnowledgeView('system');  // 知识库默认打开全局图谱`（line 5735），替换为：

```js
  setKnowledgeView('book');  // 全局图谱已迁到「考点训练」；知识库默认书本速查
```

- [ ] **Step 2: 每次进知识库都重置默认视图**

知识库现在只 init 调一次 `renderKnowledgePage`。需保证每次 `switchPage('knowledge')` 都重置。grep switchPage 里是否有 knowledge 渲染分支；当前 `buildPageRenderPlan` 对 knowledge 无 renderAction（依赖 init 那次）。在 switchPage 末尾、或 `renderPageSidebar('home')` 之类处之后，加 knowledge 专属重置。最简：在 switchPage 中 `pageEl.classList.add('active')` 之后加：

```js
  if (page === 'knowledge') setKnowledgeView('book');
```

（grep `pageEl.classList.add('active')` 定位，line ~2520。）

- [ ] **Step 3: 写/改 smoke 断言**

grep smoke 里现有断言 `currentKnowledgeView === 'system'`（line ~2930，原断言进知识库后 view 为 system）。该断言已过时——改为进入知识库后默认 `book`：

```js
await expect(await page.evaluate(() => {
  switchPage('knowledge');
  return window.GrammarAppState.state.currentKnowledgeView;
})).toBe('book');
```

（按该 smoke 块原有写法调整；若原断言依赖 `dmCam` 等全局图谱状态，相应移除/改到「考点训练」页的断言。逐条 grep 判断后改。）

- [ ] **Step 4: 跑 check 全绿**

Run: `npm run check`
Expected: PASS

- [ ] **Step 5: preview 验证**

知识库 dock 进入默认书本速查；切到知识地图后再切走、再进知识库 → 仍回书本速查（不停在知识地图）。

- [ ] **Step 6: 提交**

```bash
git add docs/grammar-fill/index.html tests/smoke.spec.js
git commit -m "fix(knowledge): 知识库默认书本速查+每次进入重置(全局图谱已迁考点训练)"
```

---

## Task 6: 整体验证 + 收尾

**Files:** 无新增改动（除非发现回归）

- [ ] **Step 1: 全量 check**

Run: `npm run check`
Expected: `OK: all engineering checks passed`

- [ ] **Step 2: preview 端到端走查（对照 5 点）**

按 superpowers:verification-before-completion 逐项确认并截图：
1. 决策地图叶子徽章显示「真题R · 模拟M」。
2. 迁移页标题面包屑（叶子/词chip/考点视图三路径）。
3. 讲题舞台只剩 讲题/迁移。
4. dock「考点训练」图/文字切换可用；知识库无全局图谱/考点视图。
5. 知识库默认书本速查、重进不漂移。
无 console 报错；返回/退出导航不崩。

- [ ] **Step 3: 更新进度记忆**

更新 `~/.claude/.../memory/taxonomy-points-resume.md`：记录本轮 5 点反馈已落地、分支 `feat/ui-feedback-points-dock`、待用户验收后走发布流程（feature→main→push，见 [[deploy-push-workflow]]）。

- [ ] **Step 4: 汇报，等用户验收后再发布**

不自动 push。汇报改了什么、preview 证据，询问是否合并 main 部署。

---

## Self-Review 记录

- **Spec 覆盖**：5 点全部映射到 Task 1–5；point 4 因 point 5 迁走全局图谱而调整为“默认书本速查”，已在 Task 5 背景说明。✅
- **占位符**：无 TBD；删除类步骤均带 grep-verify 前置。✅
- **类型/命名一致**：`formatCountBadge(counts)` 入参为 `{bank,real,error,total}`，与 `countByPoint`/`countByFineTag` 返回一致；`sourceLabel` 第 5 参贯穿 `buildPointPracticePlan`/`buildFineTagPracticePlan`/`buildCategoryPracticeEntryModel`；新页 key `points-training` 在 app-state 四处 + index 三处一致。✅
- **风险点**：① 删除类(Task 3/4)行号漂移——已统一要求 grep 锚点；② 契约导出删除必须同步 python(Task 3 Step 7)；③ `renderSystemView` 复用时副作用改 `currentKnowledgeView`，由 Task 5 重置兜底；④ category-rules 纯函数保留不删，规避契约风险。
