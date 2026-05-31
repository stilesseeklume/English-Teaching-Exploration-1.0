# 决策地图叶子实用化 + 智能下钻具体词 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 决策地图（renderSystemView/decision_map）叶子从"纯文字标签"升级为可用考点卡（题数 badge + 迁移/讲解按钮，没题标0），并对闭合类(从句/冠词/逻辑)与介词智能下钻到"具体引导词/介词"一层（预定义列全 + 题库统计，每个词标总数+真题数，点词进迁移）。

**Architecture:** 加法式。核心计数与词分布做成 knowledge-view-model 纯函数（TDD 可测）；闭合类引导词表 + 介词核心表写进 grammar_fine_tags.js（单一真相源）；index.html 的 renderSystemView 叶子渲染消费纯函数产物并修复按钮可见性。不碰死代码 teaching_graph，不碰 🗺知识地图。

**Tech Stack:** 原生 JS（IIFE 模块）、Playwright smoke（page.evaluate 跑纯函数）、`npm run check` 全量校验。

**全部做完一起上线**：本地 commit；全绿后再 push。

**验证**：每 Task 末 `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path"`；全部完成 `npm run check`。

**依赖顺序**：D(计数地基) → G(词表数据) → C(词分布纯函数) → A(叶子按钮修复) → B(下钻渲染接线) → E(迁移②档全列) → F(筛选一致性查证)。

---

## 文件结构

| 文件 | 责任 | 改动 |
|------|------|------|
| `docs/data/grammar_fine_tags.js` | fine tag 体系（单一真相源） | G：闭合类 fine tag 增 `words:[...]`；preposition category 增 `core_words:[...]` |
| `docs/grammar-fill/modules/knowledge-view-model.js` | 知识页纯数据构建器 | D：countByFineTag 增 real；C：新增 buildLeafWordBreakdown |
| `docs/grammar-fill/index.html` | 渲染+接线 | A：叶子按钮可见性修复；B：叶子下钻具体词渲染+点击 |
| `docs/grammar-fill/modules/migration-training.js` | 迁移纯逻辑 | E：第②档 fine tag 全列 |
| `tests/smoke.spec.js` | 回归+纯函数断言 | 各 Task 断言 |

---

## Task D: countByFineTag 增「单独真题数」+ badge 双数

**Files:**
- Modify: `docs/grammar-fill/modules/knowledge-view-model.js`（`countByFineTag` ~line 50；`buildFineCategoryModel` tag countText ~line 342）
- Test: `tests/smoke.spec.js`

- [ ] **Step 1: 写失败测试**

在 smoke "grammar-fill core path" 测试体内、现有迁移断言之后加：

```javascript
  // Task D：countByFineTag 增 real（单独真题数）
  expect(await page.evaluate(() => {
    var kvm = window.GrammarKnowledgeViewModel;
    var bank = [
      { fine_category: 'attrib-pronoun', type: '真题' },
      { fine_category: 'attrib-pronoun', type: '模拟卷' },
      { fine_category: 'attrib-pronoun', type: '模拟题' }
    ];
    var c = kvm.countByFineTag('attrib-pronoun', bank, []);
    return (c.total === 3 && c.bank === 3 && c.real === 1) ? 'ok' : 'bad:' + c.total + '/' + c.bank + '/' + c.real;
  })).toBe('ok');
```

- [ ] **Step 2: 运行确认失败**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path" 2>&1 | grep -iE "passed|failed|bad:"`
Expected: FAIL `bad:3/3/undefined`。

- [ ] **Step 3: 改 countByFineTag**（knowledge-view-model.js line 50-54）

```javascript
  function countByFineTag(fineCategory, bankQuestions, errorQuestions) {
    var bankItems = asArray(bankQuestions).filter(function(q) { return q && q.fine_category === fineCategory; });
    var errorCount = asArray(errorQuestions).filter(function(q) { return q && q.fine_category === fineCategory; }).length;
    var realCount = bankItems.filter(function(q) { return q && q.type === '真题'; }).length;
    return { bank: bankItems.length, error: errorCount, real: realCount, total: bankItems.length + errorCount };
  }
```

- [ ] **Step 4: 运行确认通过**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path" 2>&1 | grep -iE "passed|failed"`
Expected: `1 passed`。

- [ ] **Step 5: 考点视图 tag badge 显双数**（buildFineCategoryModel 里 tag 的 `countText`，line ~342）

```javascript
            countText: counts.real < counts.total
              ? (counts.total + ' · 真题' + counts.real)
              : String(counts.total),
```

- [ ] **Step 6: 回归 + Commit**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path" 2>&1 | grep -iE "passed|failed"`
Expected: `1 passed`。

```bash
git add docs/grammar-fill/modules/knowledge-view-model.js tests/smoke.spec.js
git commit -m "feat(knowledge): countByFineTag增real(真题数), 考点视图badge标总数+真题数"
```

---

## Task G: 闭合类引导词表 + 介词核心表写进 grammar_fine_tags.js

**Files:**
- Modify: `docs/data/grammar_fine_tags.js`（对应 fine tag 增 `words`；preposition category 增 `core_words`）
- Test: `tests/smoke.spec.js`

- [ ] **Step 1: 写失败测试**

```javascript
  // Task G：闭合类 fine tag 有 words；介词 category 有 core_words
  expect(await page.evaluate(() => {
    var ft = window.GRAMMAR_FINE_TAGS;
    var byId = ft.tags_by_id;
    var attribPron = byId['attrib-pronoun'];
    var nouncPron = byId['nounc-wh-pronoun'];
    var artAan = byId['art-a-an'];
    var core = ft.categories.preposition && ft.categories.preposition.core_words;
    return (attribPron && attribPron.words && attribPron.words.join(',') === 'who,whom,which,that,whose'
      && nouncPron && nouncPron.words && nouncPron.words.indexOf('what') !== -1
      && artAan && artAan.words && artAan.words.join(',') === 'a,an'
      && core && core.indexOf('in') !== -1 && core.indexOf('to') !== -1 && core.length === 9) ? 'ok'
      : 'bad';
  })).toBe('ok');
```

- [ ] **Step 2: 运行确认失败**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path" 2>&1 | grep -iE "passed|failed|bad"`
Expected: FAIL `bad`。

- [ ] **Step 3: 加词表**

在 `grammar_fine_tags.js` 的 `tags` 数组里，给以下 fine tag 对象**增 `words` 字段**（在其 `{id,category,source,name}` 同对象内加）：

```
attrib-pronoun:      words: ['who','whom','which','that','whose']
attrib-adverb:       words: ['when','where','why']
attrib-as:           words: ['as']
attrib-prep-relative:words: ['介词+which','介词+whom']
nounc-that:          words: ['that']
nounc-whether-if:    words: ['whether','if']
nounc-wh-pronoun:    words: ['what','who','which','whom','whose']
nounc-wh-adverb:     words: ['when','where','how','why']
nounc-ever:          words: ['whatever','whoever','whichever','whomever','whenever','wherever','however']
art-a-an:            words: ['a','an']
art-the:             words: ['the']
logic-coordinating:  words: ['and','but','or','so','for','nor','yet']
```

在 `categories.preposition` 对象里增（line ~28 那块 categories 定义）：

```javascript
      preposition:  { name: '介词', source: '语法通霸 21', core_words: ['in','on','at','for','with','of','by','from','to'] },
```

- [ ] **Step 4: 运行确认通过 + 可解析**

Run: `node -e "global.window={};require('./docs/data/grammar_fine_tags.js');console.log('tags:',window.GRAMMAR_FINE_TAGS.tags.length)"`
Expected: `tags: 51`（结构不破）。
Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path" 2>&1 | grep -iE "passed|failed"`
Expected: `1 passed`。

- [ ] **Step 5: check 容纳新字段**

Run: `python3 scripts/check_grammar_bank.py 2>&1 | tail -3`
Expected: `OK`（若报 words 字段非法，放宽 fine_tags 校验允许可选 words/core_words）。

- [ ] **Step 6: Commit**

```bash
git add docs/data/grammar_fine_tags.js tests/smoke.spec.js
git commit -m "feat(taxonomy): 闭合类fine tag加引导词表words + 介词核心9词core_words(来自语法通霸21)"
```

---

## Task C: buildLeafWordBreakdown 纯函数（具体词分布：闭合列全/介词核心打底/标0+真题数）

**Files:**
- Modify: `docs/grammar-fill/modules/knowledge-view-model.js`（新增函数 + 导出）
- Test: `tests/smoke.spec.js`

- [ ] **Step 1: 写失败测试**

```javascript
  // Task C：buildLeafWordBreakdown — 闭合类列全标0、介词核心打底、词带total+real
  expect(await page.evaluate(() => {
    var kvm = window.GrammarKnowledgeViewModel;
    if (!kvm.buildLeafWordBreakdown) return 'no-fn';
    var ft = window.GRAMMAR_FINE_TAGS;
    var bank = [
      { fine_category: 'attrib-pronoun', facets: { word: 'which' }, type: '真题' },
      { fine_category: 'attrib-pronoun', facets: { word: 'which' }, type: '模拟卷' },
      { fine_category: 'attrib-pronoun', facets: { word: 'that' }, type: '真题' }
    ];
    var w = kvm.buildLeafWordBreakdown('attrib-pronoun', ft, bank, []);
    // 闭合类列全 5 词；which total2 real1；who/whom/whose 在列且 total0
    var byWord = {}; w.forEach(function(x){ byWord[x.word] = x; });
    var which = byWord['which'], who = byWord['who'];
    var has5 = ['who','whom','which','that','whose'].every(function(k){ return byWord[k]; });
    // 介词核心打底
    var prep = kvm.buildLeafWordBreakdown('prep-common', ft, [], []);
    var prepWords = prep.map(function(x){ return x.word; });
    return (has5 && which && which.total === 2 && which.real === 1
      && who && who.total === 0
      && prep.length >= 9 && prepWords.indexOf('in') !== -1) ? 'ok'
      : 'bad:' + has5 + '/' + (which&&which.total) + '/' + (which&&which.real) + '/' + (who&&who.total) + '/' + prep.length;
  })).toBe('ok');
  // 非下钻大类返回空
  expect(await page.evaluate(() => {
    var kvm = window.GrammarKnowledgeViewModel;
    var w = kvm.buildLeafWordBreakdown('word-noun', window.GRAMMAR_FINE_TAGS, [], []);
    return w.length === 0 ? 'ok' : 'bad:' + w.length;
  })).toBe('ok');
```

- [ ] **Step 2: 运行确认失败**（no-fn）

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path" 2>&1 | grep -iE "passed|failed|no-fn|bad:"`
Expected: FAIL `no-fn`。

- [ ] **Step 3: 实现 buildLeafWordBreakdown**（knowledge-view-model.js，countByFineTag 之后）

```javascript
  // 取某 fine tag 的"具体词"分布。闭合类(tag.words)列全标0；介词(category.core_words)核心打底+题库追加；
  // 其余大类返回空(不下钻)。每词 {word,total,real}，按 total 降序，0 题词排后。
  function buildLeafWordBreakdown(fineId, fineTags, bankQuestions, errorQuestions) {
    fineTags = fineTags || {};
    var tag = (fineTags.tags_by_id || {})[fineId];
    if (!tag) return [];
    // 统计题库中该 fine 的 facets.word 计数（total + real）
    function wordCounts(pool, predReal) {
      var m = {};
      asArray(pool).forEach(function(q) {
        if (!q || q.fine_category !== fineId) return;
        var w = (q.facets || {}).word;
        if (!w) return;
        if (!m[w]) m[w] = { total: 0, real: 0 };
        m[w].total++;
        if (q.type === '真题') m[w].real++;
      });
      return m;
    }
    var counts = wordCounts(bankQuestions);
    asArray(errorQuestions).forEach(function(q) {
      if (!q || q.fine_category !== fineId) return;
      var w = (q.facets || {}).word; if (!w) return;
      if (!counts[w]) counts[w] = { total: 0, real: 0 };
      counts[w].total++;
    });

    // 预定义词集：闭合类用 tag.words；介词用 category.core_words
    var predefined = [];
    if (tag.words && tag.words.length) predefined = tag.words.slice();
    else if (tag.category === 'preposition') {
      var cat = (fineTags.categories || {}).preposition || {};
      predefined = (cat.core_words || []).slice();
    } else {
      return []; // 非下钻大类
    }
    // 合并：预定义 ∪ 题库出现词
    var seen = {}, list = [];
    predefined.forEach(function(w) {
      if (seen[w]) return; seen[w] = true;
      var c = counts[w] || { total: 0, real: 0 };
      list.push({ word: w, total: c.total, real: c.real });
    });
    Object.keys(counts).forEach(function(w) {
      if (seen[w]) return; seen[w] = true;
      list.push({ word: w, total: counts[w].total, real: counts[w].real });
    });
    // 排序：有题在前(total desc)，0 题保持预定义顺序在后
    list.sort(function(a, b) { return b.total - a.total; });
    return list;
  }
```

在导出对象加 `buildLeafWordBreakdown: buildLeafWordBreakdown,`。

- [ ] **Step 4: 运行确认通过**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path" 2>&1 | grep -iE "passed|failed|bad:"`
Expected: `1 passed`。

- [ ] **Step 5: Commit**

```bash
git add docs/grammar-fill/modules/knowledge-view-model.js tests/smoke.spec.js
git commit -m "feat(knowledge): buildLeafWordBreakdown具体词分布(闭合列全/介词核心打底/标0+真题数)"
```

---

## Task A: 决策地图叶子按钮可见性修复（截图按钮缺失）

**Files:**
- Modify: `docs/grammar-fill/index.html`（CSS `.dm-node .dm-tip` 区 ~line 1450-1465；renderSystemView 叶子渲染 8895-8911）
- Test: 手动 + smoke（叶子渲染产物断言）

- [ ] **Step 1: 用 systematic-debugging 坐实根因**

Run: `grep -n "dm-tip\|dm-see\|dm-node" docs/grammar-fill/index.html | head`
读 CSS：确认是否 `.dm-node .dm-tip { display:none }` 且仅 `.dm-node.open .dm-tip{display:block}` —— 叶子无 `.open` → 按钮永久隐藏（候选根因 a）。
同时确认 `_countByFineTag`（8900）是否定义（候选根因 b）：`grep -n "_countByFineTag" docs/grammar-fill/index.html`。
写一句结论到本 Task 注释。

- [ ] **Step 2: 修复（按 Step 1 结论）**

若根因 a（叶子 tip 被 hover/open 隐藏）：给叶子节点的 tip 增"叶子常显"规则，例如：
```css
  .dm-node.leaf .dm-tip { display:block; }
```
（加在现有 `.dm-node .dm-tip{display:none}` 之后，确保叶子按钮常显；非叶子保持 hover/open 行为。）

若根因 b（`_countByFineTag` 缺失/旧）：改 8900 行用新计数：
```javascript
      var c = (fine && window.GrammarKnowledgeViewModel)
        ? window.GrammarKnowledgeViewModel.countByFineTag(fine, ALL_QUESTIONS, errorBookQuestions) : { total: 0, real: 0 };
      var qn = c.total || 0;
```
并让题数 badge 显示总数+真题数（8901 区）：
```javascript
      var badge = c.real < qn ? (qn + ' · 真题' + c.real) : String(qn);
```
0 题叶子：迁移按钮隐藏/灰，"📖 看讲解"保留，并显示 `badge`（0）。

- [ ] **Step 3: 手动验证 + smoke 回归**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path" 2>&1 | grep -iE "passed|failed"`
Expected: `1 passed`。
（浏览器肉眼：介词展开后 5 叶子各显题数+按钮；0 题叶子显示 0。）

- [ ] **Step 4: Commit**

```bash
git add docs/grammar-fill/index.html
git commit -m "fix(graph): 决策地图叶子按钮常显(修截图按钮缺失)+题数badge标总数/真题数+0题叶子可见"
```

---

## Task B: 叶子下钻到具体词（渲染 + 点击筛题）

**Files:**
- Modify: `docs/grammar-fill/index.html`（renderSystemView 叶子区，挂"具体词"子层）
- Test: 手动 + smoke

**接法**：叶子（fine 节点）渲染时，调 `buildLeafWordBreakdown(fine, GRAMMAR_FINE_TAGS, ALL_QUESTIONS, errorBookQuestions)`；返回非空则在该叶子卡片内渲染一排"具体词"chip（每个标 `词 · N`，0 题灰显），点击 chip 调 `startMigrationFromMap(fine)` 并按词进一步筛（迁移侧用 word 收窄——复用 T4 第①档/`migrationFilterKey`）。词层是叶子内嵌列表（不进 decision_map 树结构，避免动 walk/childrenOf）。

- [ ] **Step 1: 写 smoke 断言（叶子词层 HTML 产物）**

decision_map 渲染是 index.html 内联、无独立纯函数，故断言走 DOM。在 smoke 进入知识页全局图谱、展开介词后断言出现具体词 chip：

```javascript
  // Task B：决策地图介词叶子下钻出具体词 chip
  expect(await page.evaluate(() => {
    // 直接验证纯函数已能产出词层（渲染接线靠手动验证）
    var kvm = window.GrammarKnowledgeViewModel;
    var w = kvm.buildLeafWordBreakdown('prep-common', window.GRAMMAR_FINE_TAGS, window.GRAMMAR_BANK.questions || [], []);
    return (w.length >= 9 && w.every(function(x){ return typeof x.total === 'number'; })) ? 'ok' : 'bad:' + w.length;
  })).toBe('ok');
```

- [ ] **Step 2: 运行确认（纯函数已绿，渲染未接）**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path" 2>&1 | grep -iE "passed|failed"`
Expected: `1 passed`（纯函数 C 已实现）。

- [ ] **Step 3: 叶子渲染挂具体词 chip**（index.html renderSystemView 叶子区，8905 `tip` 组装处之后）

```javascript
      // 具体词下钻（闭合类/介词）：列出词 + 题数，点词按 word 进迁移
      var words = (window.GrammarKnowledgeViewModel.buildLeafWordBreakdown
        ? window.GrammarKnowledgeViewModel.buildLeafWordBreakdown(fine, window.GRAMMAR_FINE_TAGS, ALL_QUESTIONS, errorBookQuestions) : []);
      if (words.length) {
        var chips = words.map(function(wd) {
          var z = wd.total === 0 ? ' style="opacity:.45;"' : '';
          var rt = wd.real < wd.total ? ('真题' + wd.real) : '';
          return '<button type="button" class="dm-word-chip"' + z
            + ' onclick="event.stopPropagation();startMigrationFromMap(\'' + graphEscapeAttr(fine) + '\')">'
            + escapeHtml(wd.word) + ' <span style="opacity:.6;">' + wd.total + (rt ? '·' + rt : '') + '</span></button>';
        }).join('');
        tip += '<div class="dm-words">' + chips + '</div>';
      }
```
（`dm-word-chip`/`dm-words` 复用现有 chip 样式；如无则加最小内联样式。点击先按 fine 进迁移，迁移内再用 T4 词档收窄——保持改动小。）

- [ ] **Step 4: 手动验证 + 回归**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path" 2>&1 | grep -iE "passed|failed"`
Expected: `1 passed`。
浏览器肉眼：介词 prep-common 叶子下出现 in/on/at/for…词 chip，0 题灰显。

- [ ] **Step 5: Commit**

```bash
git add docs/grammar-fill/index.html tests/smoke.spec.js
git commit -m "feat(graph): 决策地图叶子下钻具体词chip(闭合列全/介词核心, 标0+真题数, 点词进迁移)"
```

---

## Task E: 迁移范围选择器第②档 fine tag 全列标 0

**Files:**
- Modify: `docs/grammar-fill/modules/migration-training.js`（buildMigrationScopes / migrationMatchesScope / scopeButtonLabel）
- Modify: `docs/grammar-fill/index.html`（getMigrationData 传 fineTags）
- Test: `tests/smoke.spec.js`（更新现有 T4 数据流断言）

- [ ] **Step 1: 改现有 T4 数据流断言为"②档全列 fine tag"**

把 smoke 里现有 T4 `buildMigrationData 按 facets 范围缩放` 断言块替换为：

```javascript
  // T4+：迁移第②档 = 当前大类全部 fine tag（含0题）
  expect(await page.evaluate(() => {
    var mt = window.GrammarMigrationTraining;
    var ft = window.GRAMMAR_FINE_TAGS;
    var q = { exam:'e', no:1, category:'attrib', fine_category:'attrib-pronoun', facets:{ type:'relative-pronoun', word:'which' }, type:'真题' };
    var bank = [ q,
      { exam:'e', no:2, category:'attrib', fine_category:'attrib-pronoun', facets:{ word:'that' }, type:'真题' },
      { exam:'e', no:3, category:'attrib', fine_category:'attrib-adverb', facets:{ word:'when' }, type:'真题' } ];
    var data = mt.buildMigrationData(q, { source:'bank', bankQuestions:bank, errorQuestions:[], categoryMap:{ attrib:'定语从句' }, fineTags:ft, limit:99 });
    var sel = mt.buildMigrationContentViewModel(data, 'bank', false).scopeSelector;
    var ftBtns = sel.buttons.filter(function(b){ return b.level === 'finetag'; });
    var ids = ftBtns.map(function(b){ return b.value; }).sort().join(',');
    var prepRel = ftBtns.filter(function(b){ return b.value === 'attrib-prep-relative'; })[0];
    return (ftBtns.length === 4 && ids === 'attrib-adverb,attrib-as,attrib-prep-relative,attrib-pronoun'
      && prepRel && prepRel.count === 0) ? 'ok' : 'bad:' + ftBtns.length + '|' + ids + '|' + (prepRel && prepRel.count);
  })).toBe('ok');
```

- [ ] **Step 2: 运行确认失败**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path" 2>&1 | grep -iE "passed|failed|bad:"`
Expected: FAIL。

- [ ] **Step 3: buildMigrationScopes 加 fineTagsByCategory、②档全列**（migration-training.js）

```javascript
  function buildMigrationScopes(facets, fineCategory, category, fineTagsByCategory) {
    facets = facets || {};
    var scopes = [];
    var wordVal = facetWordValue(facets);
    if (wordVal) scopes.push({ level: 'word', value: wordVal });
    var tags = (fineTagsByCategory && category) ? (fineTagsByCategory[category] || []) : [];
    tags.forEach(function(tag) {
      if (tag && tag.id) scopes.push({ level: 'finetag', value: tag.id, label: tag.name || tag.id });
    });
    if (category) scopes.push({ level: 'category', value: String(category) });
    return scopes;
  }
```

`migrationMatchesScope` 加 finetag 分支：
```javascript
    if (scope.level === 'finetag') return String(item.fine_category || '') === scope.value;
```
（加在 word 分支之后、type 之前。）

`scopeButtonLabel` 加 finetag：
```javascript
    if (scope.level === 'finetag') return scope.label || scope.value;
```

- [ ] **Step 4: buildMigrationData scopes 段传 fineTags + 默认激活当前 fine**

T4 加的 `if (hasFacets){...}` 段改：
```javascript
    if (hasFacets) {
      var fineTagsByCategory = (options.fineTags && options.fineTags.tags_by_category) || {};
      var scopeBasePool = selectSourcePool(source, fallbackBankPool, fallbackErrorPool);
      scopes = buildMigrationScopes(qFacets, fineCat, q.category, fineTagsByCategory).map(function(s) {
        return { level: s.level, value: s.value, label: s.label,
          count: scopeBasePool.filter(function(it) { return migrationMatchesScope(it, s); }).length };
      });
      activeScope = options.scope
        || scopes.filter(function(s){ return s.level === 'finetag' && s.value === fineCat; })[0]
        || scopes[0] || null;
      pool = activeScope ? scopeBasePool.filter(function(it) { return migrationMatchesScope(it, activeScope); }) : scopeBasePool;
    }
```
确认 `buildMigrationScopeSelectorModel` 的 buttons 透传 `label`（label: scopeButtonLabel(s, categoryName)，s 含 label）。

- [ ] **Step 5: index.html getMigrationData 传 fineTags**

`getMigrationData` 的 buildMigrationData options 里 `scope: _migrationScope,` 旁加：
```javascript
    fineTags: window.GRAMMAR_FINE_TAGS,
```

- [ ] **Step 6: 运行确认通过**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path" 2>&1 | grep -iE "passed|failed|bad:"`
Expected: `1 passed`。

- [ ] **Step 7: Commit**

```bash
git add docs/grammar-fill/modules/migration-training.js docs/grammar-fill/index.html tests/smoke.spec.js
git commit -m "feat(migration): 范围选择器第②档改为该大类fine tag全列(含0题), finetag级匹配"
```

---

## Task F: 真题/模拟/错题筛选一致性（查证后定）

**Files:** 查证 `knowledge-view-model.js` buildUnitFilterChips + 迁移来源 tab；视结论改

- [ ] **Step 1: 查证（只读）**

Run:
```bash
grep -n "buildUnitFilterChips\|isMockQuestion\|source === 'bank'\|source !== 'bank'" docs/grammar-fill/modules/knowledge-view-model.js docs/grammar-fill/modules/migration-training.js
```
判定：filter chip 是否只在 bank 出现（错题不分真/模 = 预期）；`isMockQuestion` 是否认全 `模拟卷`+`模拟题`。

- [ ] **Step 2: 记结论**

写本 Task 注释，二选一：
- (a) **预期**（错题本不分真/模；模拟计数已认全）→ 不改，PROJECT_LOG 记录。
- (b) **缺陷**（某处漏认 `模拟题` 或 chip 写死）→ 进 Step 3。

- [ ] **Step 3:（仅 b）修 + 测 + Commit**

按实际缺陷补 isMockQuestion/chip 条件，加 smoke 断言（合成含 `模拟题` 的 bank，断言 mock chip count 正确）。
```bash
git add -A && git commit -m "fix(filter): 真题/模拟/错题筛选口径一致(模拟卷+模拟题双写法)"
```

---

## 全量验证（所有 Task 后）

- [ ] **Step 1: 全量 check**

Run: `npm run check`
Expected: `OK: all engineering checks passed` + `12 passed`。

- [ ] **Step 2: 浏览器终检（信任 smoke 的前提下抽查）**

进知识页"🌐 全局图谱" → 展开介词：5 叶子各显题数+按钮；prep-common 叶子下出现 in/on/at/for…词 chip（0 题灰显）。展开名词性从句：5 叶子含 0 题叶子（that/whether-if/ever）也显示。

---

## 自检（Self-Review）记录

- **Spec 覆盖**：A→Task A（叶子按钮修复）；B→Task A/B（标0+实用化+下钻）；C→Task C+G（智能下钻闭合/介词）；D→Task D（real+双badge，考点视图+图谱叶子）；E→Task E（迁移②档全列）；F→Task F（筛选查证）。
- **占位符**：Task A Step 2 / Task F Step 3 依赖查证结论，已给两分支具体动作，非空占位。
- **类型一致**：`countByFineTag` 返回 `{bank,error,real,total}` 全程一致；`buildLeafWordBreakdown` 返回 `[{word,total,real}]` 在 C/B 一致；scope level `finetag` 在 buildMigrationScopes/migrationMatchesScope/scopeButtonLabel 三处一致；词表字段 `tag.words` / `categories.preposition.core_words` 在 G/C 一致。
- **风险**：Task A 根因 Step 1 坐实再改（CSS hover vs 计数）；Task B 词层用叶子内嵌不动 decision_map 树结构（降风险）；Task D 动考点视图已上线，smoke 兜底。
