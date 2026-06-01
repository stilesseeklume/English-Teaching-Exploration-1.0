# 考点体系 Phase 3（知识地图/决策地图）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 决策地图叶子的计数与跳转从「按 `fine_category` 粗数」升级到「按 `points` 的 `{tag, keys}` 精数」，修时态 6 节点雷同、点 which 跳非 which、冠词 the 重复叶；并清掉 Phase 2 遗留的 scope 死代码。

**Architecture:** 新增纯函数 `countByPoint`（视图计数）和 `buildPointPracticePlan`（练习池），各自模块内联点匹配谓词（与现有 `countByFineTag`/`selectFineTagQuestions` 自包含风格一致，不跨模块 window 耦合）。决策地图数据 `decision_map.js` 给谓语叶子加可选 `point:{tag,keys?}` 字段；`index.html` 渲染按 `point` 优先选计数函数、词 chip 携带具体词跳转。

**Tech Stack:** 纯浏览器 IIFE 模块（`window.GrammarKnowledgeViewModel` / `GrammarCategoryRules` / `GRAMMAR_DECISION_MAP`），Playwright smoke（`tests/smoke.spec.js`，`page.evaluate`），`npm run check`（python exports 契约 + 静态站点）。

**前置：** 分支 `feat/taxonomy-points-phase1`，Phase 1+2 已完成（`q.points` 加载时派生、迁移按 `questionsSharePoint`），check + 17 smoke 全绿。

**spec：** `docs/superpowers/specs/2026-06-01-taxonomy-phase3-knowledge-map.md`

---

## File Structure

| 文件 | 职责 | 改动 |
|------|------|------|
| `docs/grammar-fill/modules/knowledge-view-model.js` | 知识页纯计数/视图模型 | 新增并导出 `countByPoint` |
| `docs/grammar-fill/modules/category-rules.js` | 练习池选择/进入计划 | 新增并导出 `selectPointQuestions`、`buildPointPracticePlan`（内联 `questionHasPoint`） |
| `docs/data/decision_map.js` | 决策树数据（纯数据） | 替换时态 6 叶 + 语态 2 叶加 `point`；删 `l_art_spec` |
| `docs/grammar-fill/index.html` | 决策地图渲染 + 练习入口 | 计数按 point；新增 `startByPoint`/`startByPointFromMap`/`dmKeysLiteral`；chip 带 word |
| `docs/grammar-fill/modules/migration-training.js` | 迁移引擎 | 删 scope 死代码 + exports |
| `docs/grammar-fill/modules/teaching-render.js` | 迁移抽屉渲染 | 删 `migrationScopeSelectorHtml` + 两处读点 |
| `tests/smoke.spec.js` | 烟测 | 加 4 个新 test；删 scope 旧 test、改 T2 |

---

## Task 1: `countByPoint`（视图按 point 计数）

**Files:**
- Modify: `docs/grammar-fill/modules/knowledge-view-model.js`（在 `countByFineTag` 后，约 55 行后插入；导出表约 1524 行）
- Test: `tests/smoke.spec.js`（文件末尾追加）

- [ ] **Step 1: 写失败测试**（追加到 `tests/smoke.spec.js` 末尾）

```javascript
test('countByPoint 按 tag+keys 精数，不同 key 计数互不相同', async ({ page }) => {
  await page.goto('/docs/grammar-fill/');
  await page.waitForFunction(() => !!window.GrammarKnowledgeViewModel, null, { timeout: 15000 });
  expect(await page.evaluate(() => {
    var kvm = window.GrammarKnowledgeViewModel;
    var P = function(tag, key){ return key === undefined ? { tag:tag } : { tag:tag, key:key }; };
    var bank = [
      { type:'真题', points:[P('pred-tense','present')] },
      { type:'真题', points:[P('pred-tense','present')] },
      { type:'真题', points:[P('pred-tense','past')] },
      { type:'真题', points:[P('pred-tense','past'), P('pred-passive')] },
      { type:'模拟卷', points:[P('pred-passive')] }
    ];
    var present = kvm.countByPoint('pred-tense', ['present'], bank, []);
    var past = kvm.countByPoint('pred-tense', ['past'], bank, []);
    var perfect = kvm.countByPoint('pred-tense', ['perfect'], bank, []);
    var passive = kvm.countByPoint('pred-passive', [], bank, []); // keyless = 全部被动
    // present.total=2(均真题), past.total=2 但 real 不同(1道带passive仍真题→real=2), perfect=0, passive.total=2 real=1
    return [
      present.total, present.real,
      past.total,
      perfect.total,
      passive.total, passive.real
    ].join(',');
  })).toBe('2,2,2,0,2,1');
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "countByPoint 按 tag"`
Expected: FAIL —— `kvm.countByPoint is not a function`

- [ ] **Step 3: 实现 `countByPoint`**（在 `knowledge-view-model.js` 的 `countByFineTag` 函数之后插入）

```javascript
  // 按 points 精数：q.points 中存在 {tag 相同 且 (keys 空=只认tag，或 key∈keys)} 即命中。
  // 口径对齐 countByFineTag：total=bank+error，real=bank 中真题数。
  function countByPoint(tag, keys, bankQuestions, errorQuestions) {
    keys = asArray(keys);
    function matches(q) {
      if (!q || !Array.isArray(q.points)) return false;
      return q.points.some(function(p) {
        if (!p || p.tag !== tag) return false;
        return keys.length === 0 || keys.indexOf(p.key) !== -1;
      });
    }
    var bankItems = asArray(bankQuestions).filter(matches);
    var errorCount = asArray(errorQuestions).filter(matches).length;
    var realCount = bankItems.filter(function(q) { return q && q.type === '真题'; }).length;
    return { bank: bankItems.length, error: errorCount, real: realCount, total: bankItems.length + errorCount };
  }
```

在导出对象 `window.GrammarKnowledgeViewModel = {` 内，`countByFineTag: countByFineTag,` 之后加一行：

```javascript
    countByPoint: countByPoint,
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "countByPoint 按 tag"`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add docs/grammar-fill/modules/knowledge-view-model.js tests/smoke.spec.js
git commit -m "feat(points): countByPoint 按 tag+keys 精数(视图计数地基)"
```

---

## Task 2: `buildPointPracticePlan`（按 point 进练习池）

**Files:**
- Modify: `docs/grammar-fill/modules/category-rules.js`（在 `buildFineTagPracticePlan` 后，约 183 行；导出表约 202 行）
- Test: `tests/smoke.spec.js`（追加）

- [ ] **Step 1: 写失败测试**

```javascript
test('buildPointPracticePlan 按 point 选题：which→which，定从 which 不串名从 which', async ({ page }) => {
  await page.goto('/docs/grammar-fill/');
  await page.waitForFunction(() => !!window.GrammarCategoryRules, null, { timeout: 15000 });
  expect(await page.evaluate(() => {
    var cr = window.GrammarCategoryRules;
    var P = function(t,k){ return { tag:t, key:k }; };
    var all = [
      { exam:'e', no:1, category:'attrib', points:[P('attrib-pronoun','which')], type:'真题', answer:'which' },
      { exam:'e', no:2, category:'attrib', points:[P('attrib-pronoun','that')],  type:'真题', answer:'that' },
      { exam:'e', no:3, category:'nounclause', points:[P('nounc-wh-pronoun','which')], type:'真题', answer:'which' }
    ];
    var plan = cr.buildPointPracticePlan('attrib-pronoun', ['which'], all, {});
    var empty = cr.buildPointPracticePlan('attrib-as', ['as'], all, {});
    return [
      plan.hasQuestions, plan.questions.length, plan.questions[0] && plan.questions[0].no,
      plan.category, empty.hasQuestions
    ].join(',');
  })).toBe('true,1,1,attrib,false'); // 只命中 no1(定从which)，不含 no3(名从which)；空 point→false
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "buildPointPracticePlan 按 point"`
Expected: FAIL —— `cr.buildPointPracticePlan is not a function`

- [ ] **Step 3: 实现**（在 `category-rules.js` 的 `buildFineTagPracticePlan` 之后插入）

```javascript
  function questionHasPoint(q, tag, keys) {
    if (!q || !Array.isArray(q.points)) return false;
    for (var i = 0; i < q.points.length; i++) {
      var p = q.points[i];
      if (!p || p.tag !== tag) continue;
      if (!keys || !keys.length || keys.indexOf(p.key) !== -1) return true;
    }
    return false;
  }

  function selectPointQuestions(allQuestions, tag, keys) {
    return asArray(allQuestions).filter(function(q) {
      return questionHasPoint(q, tag, keys);
    });
  }

  function buildPointPracticePlan(tag, keys, allQuestions, categoryMap) {
    var questions = selectPointQuestions(allQuestions, tag, keys);
    var category = questions.length ? questions[0].category : '';
    return buildCategoryPracticeEntryModel(category, questions, categoryMap);
  }
```

在导出对象 `window.GrammarCategoryRules = {` 内，`buildFineTagPracticePlan: buildFineTagPracticePlan` 那行末尾加逗号，并追加：

```javascript
    selectPointQuestions: selectPointQuestions,
    buildPointPracticePlan: buildPointPracticePlan
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "buildPointPracticePlan 按 point"`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add docs/grammar-fill/modules/category-rules.js tests/smoke.spec.js
git commit -m "feat(points): buildPointPracticePlan 按 point 选题(练习入口地基;which→which不串从句)"
```

---

## Task 3: 决策地图数据 —— 时态/语态叶子加 point + 删冠词重复叶

**Files:**
- Modify: `docs/data/decision_map.js:27-43`（pred 分支）、`:90`（删 l_art_spec）
- Test: `tests/smoke.spec.js`（追加）

- [ ] **Step 1: 写失败测试**（同时验数据结构 + 真实题库计数不雷同 + 无 l_art_spec）

```javascript
test('决策地图谓语叶子带 point；时态6叶真实计数不全相等；无 l_art_spec', async ({ page }) => {
  await page.goto('/docs/grammar-fill/');
  await page.waitForFunction(() => !!window.GRAMMAR_DECISION_MAP && !!window.ALL_QUESTIONS, null, { timeout: 15000 });
  expect(await page.evaluate(() => {
    var DM = window.GRAMMAR_DECISION_MAP;
    var kvm = window.GrammarKnowledgeViewModel;
    var byId = {};
    DM.nodes.forEach(function(n){ byId[n.id] = n; });
    // 1) 时态 6 叶都带 point.keys，且 id 为新结构
    var tenseIds = ['l_tense_present','l_tense_past','l_tense_future','l_tense_progressive','l_tense_perfect','l_tense_perfectprog'];
    var allHavePoint = tenseIds.every(function(id){
      var n = byId[id];
      return n && n.point && n.point.tag === 'pred-tense' && Array.isArray(n.point.keys) && n.point.keys.length > 0;
    });
    // 2) 旧时态叶子已不存在
    var oldGone = !byId['l_tense_cont'] && !byId['l_tense_pastperfect'] && !byId['l_tense_other'];
    // 3) 真实题库派生 points 后，6 叶 countByPoint.total 不全相等
    var counts = tenseIds.map(function(id){
      var n = byId[id];
      return kvm.countByPoint(n.point.tag, n.point.keys, window.ALL_QUESTIONS, []).total;
    });
    var notUniform = new Set(counts).size > 1;
    // 4) 语态叶子带 point；冠词无 l_art_spec、仅 l_art_the 指向 art-the
    var voiceOk = byId['l_voice_form'] && byId['l_voice_form'].point && byId['l_voice_form'].point.tag === 'pred-passive'
      && byId['l_voice_implicit'] && byId['l_voice_implicit'].point;
    var artOk = !byId['l_art_spec'] && byId['l_art_the'] && byId['l_art_the'].fine === 'art-the';
    return [allHavePoint, oldGone, notUniform, !!voiceOk, artOk].join(',');
  })).toBe('true,true,true,true,true');
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "决策地图谓语叶子带 point"`
Expected: FAIL（旧 id 仍在、无 point 字段）

- [ ] **Step 3: 改 `decision_map.js`**。把 27–43 行（`pred` 到 SVA 叶子之前）整段替换：

找到并替换这段（27–43 行，`{ id: 'pred', …` 到 `{ id: 'pred_sva', …` 之前的时态+语态部分）：

```javascript
    { id: 'pred', parent: 'verb', title: '谓语动词', sub: '缺谓语 → 定 时态 / 语态 / 主谓一致', cat: 'predicate' },
    // 时态：做题导向 6 叶——一般时按时间拆(靠时间标志)、进行/完成按体归(靠体的信号词)。point.keys 对齐 facets.tense。
    { id: 'pred_tense', parent: 'pred', title: '时态', sub: '先抓信号再定时态', kd: 'predicate-tense' },
    { id: 'l_tense_present',     parent: 'pred_tense', title: '一般现在',        cat: 'predicate', fine: 'pred-tense', point: { tag: 'pred-tense', keys: ['present'] } },
    { id: 'l_tense_past',        parent: 'pred_tense', title: '一般过去',        cat: 'predicate', fine: 'pred-tense', point: { tag: 'pred-tense', keys: ['past'] } },
    { id: 'l_tense_future',      parent: 'pred_tense', title: '一般将来·过去将来', cat: 'predicate', fine: 'pred-tense', point: { tag: 'pred-tense', keys: ['future', 'past-future'] } },
    { id: 'l_tense_progressive', parent: 'pred_tense', title: '进行体',          cat: 'predicate', fine: 'pred-tense', point: { tag: 'pred-tense', keys: ['progressive', 'present-progressive', 'past-progressive'] } },
    { id: 'l_tense_perfect',     parent: 'pred_tense', title: '完成体',          cat: 'predicate', fine: 'pred-tense', point: { tag: 'pred-tense', keys: ['perfect', 'past-perfect', 'future-perfect'] } },
    { id: 'l_tense_perfectprog', parent: 'pred_tense', title: '完成进行',        cat: 'predicate', fine: 'pred-tense', point: { tag: 'pred-tense', keys: ['perfect-progressive', 'past-perfect-progressive'] } },
    { id: 'pred_voice', parent: 'pred', title: '语态', sub: '主语是否承受动作？', kd: 'predicate-voice' },
    { id: 'l_voice_form',     parent: 'pred_voice', title: '被动语态的构成', cat: 'predicate', fine: 'pred-passive', point: { tag: 'pred-passive' } },
    { id: 'l_voice_implicit', parent: 'pred_voice', title: '主动形式表被动', cat: 'predicate', fine: 'pred-passive', point: { tag: 'pred-passive', keys: ['__implicit__'] } },
```

（SVA 4 叶 `l_sva_*` 保持原样不动，不加 point —— 计数走 fine 回退，已知局限见 spec。）

然后删第 90 行整行：

```javascript
    { id: 'l_art_spec', parent: 'art', title: '特指 / 独指 / 类指', cat: 'article', fine: 'art-the' },
```

- [ ] **Step 4: 跑测试确认通过 + 全量 smoke 不回归**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "决策地图谓语叶子带 point"`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add docs/data/decision_map.js tests/smoke.spec.js
git commit -m "feat(points): 决策地图时态6叶按做题导向重订(point.keys);语态加point;删冠词重复叶l_art_spec"
```

---

## Task 4: 渲染接线 —— 计数按 point + 词 chip 带 word 跳转

**Files:**
- Modify: `docs/grammar-fill/index.html`
  - 新增 `startByPoint` / `startByPointFromMap`（在 `startByFineTag` 之后，约 2677 行后）
  - 新增 `dmKeysLiteral`（在 `startMigrationFromMap` 附近，约 5213 行后）
  - 叶子计数 + 按钮 + chip（约 5288–5316）
- Test: `tests/smoke.spec.js`（追加；通过设置 `dmExpanded` 后调用 `renderSystemView()` 读 HTML）

- [ ] **Step 1: 写失败测试**

```javascript
test('决策地图渲染：时态叶迁移按钮按 point；词 chip 带具体词跳 point', async ({ page }) => {
  await page.goto('/docs/grammar-fill/');
  await page.waitForFunction(() => !!window.GRAMMAR_DECISION_MAP && typeof renderSystemView === 'function', null, { timeout: 15000 });
  expect(await page.evaluate(() => {
    // 展开到时态叶 + 定语从句叶，渲染决策地图
    ['root','clue','verb','pred','pred_tense','noclue','conj','rel','attrib'].forEach(function(id){ dmExpanded[id] = true; });
    renderSystemView();
    var html = document.getElementById('knowledgeContent').innerHTML;
    // 时态「一般现在」叶有题→迁移按钮按 point(pred-tense, ['present'])
    var tenseBtn = html.indexOf("startByPointFromMap('pred-tense',['present']") !== -1;
    // 定从「关系词的选择」叶下的 which 词 chip→带具体词 which 跳 point
    var whichChip = html.indexOf("startByPointFromMap('attrib-pronoun',['which']") !== -1;
    return [tenseBtn, whichChip].join(',');
  })).toBe('true,true');
});
```

> 说明：依赖真实题库里「一般现在(present)」与定从 which 各有题。若 present 计数为 0 会导致按钮不渲染——已由 Task 3 真实计数（present=24）保证非空；which 由 attrib-pronoun 词表保证 chip 渲染。

- [ ] **Step 2: 跑测试确认失败**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "决策地图渲染：时态叶迁移按钮"`
Expected: FAIL —— `startByPointFromMap is not defined`（HTML 不含该串）

- [ ] **Step 3a: 新增练习入口**（`index.html` `startByFineTag` 函数之后，约 2677 行后插入）

```javascript
function startByPoint(tag, keys) {
  closeDrawer();
  resetPracticeDisplayState();
  var entryModel = window.GrammarCategoryRules.buildPointPracticePlan(tag, keys, ALL_QUESTIONS, CATEGORY_MAP);
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

- [ ] **Step 3b: 新增 map 跳转包装 + keys 序列化**（`index.html` `startMigrationFromMap` 之后，约 5213 行后插入）

```javascript
function dmKeysLiteral(keys) {
  // 把 keys 数组序列化成 onclick 里可嵌的 JS 数组字面量：['a','b']（值为受控的考点key，无引号/特殊字符）
  return '[' + (keys || []).map(function(k){ return "'" + String(k) + "'"; }).join(',') + ']';
}
function startByPointFromMap(tag, keys) {
  // 从图谱叶子/词 chip 按 point 精准开练，"返回"指回知识库
  startByPoint(tag, keys);
  setPreviousView({ page: 'knowledge' });
  if (typeof syncAppState === 'function') syncAppState();
  if (typeof updateDockBackButton === 'function') updateDockBackButton();
}
```

- [ ] **Step 3c: 叶子计数 + 按钮 + chip 改向**。把 5288–5316 行（`if (isLeaf) {` 内部）替换为：

```javascript
    if (isLeaf) {
      var cat = n.cat || '';
      var fine = n.fine || '';
      var kd = n.kd || '';
      if (!kd && n.parent && full.byId[n.parent]) kd = full.byId[n.parent].kd || '';
      var pointTag = (n.point && n.point.tag) || fine;        // 词 chip / 跳转用的 tag
      var c = n.point
        ? window.GrammarKnowledgeViewModel.countByPoint(n.point.tag, n.point.keys, ALL_QUESTIONS, errorBookQuestions)
        : (fine && window.GrammarKnowledgeViewModel)
          ? window.GrammarKnowledgeViewModel.countByFineTag(fine, ALL_QUESTIONS, errorBookQuestions)
          : { total: 0, real: 0 };
      var qn = c.total || 0;
      var badge = (c.real < qn) ? (qn + ' 题 · 真题' + c.real) : (qn + ' 题');
      var acts = '';
      if (qn > 0 && n.point) acts += '<button type="button" onclick="event.stopPropagation();startByPointFromMap(\'' + graphEscapeAttr(n.point.tag) + '\',' + dmKeysLiteral(n.point.keys) + ')">🔁 迁移训练 · ' + badge + '</button>';
      else if (qn > 0 && fine) acts += '<button type="button" onclick="event.stopPropagation();startMigrationFromMap(\'' + graphEscapeAttr(fine) + '\')">🔁 迁移训练 · ' + badge + '</button>';
      else acts += '<span style="font-size:12px;color:var(--text-3);">暂无题 · 0 题</span>';
      acts += '<button type="button" class="ghost" onclick="event.stopPropagation();openKnowledgePoint(\'' + graphEscapeAttr(cat) + '\',\'' + graphEscapeAttr(kd) + '\')">📖 看讲解</button>';
      tip = '<div class="dm-see">' + acts + '</div>';
      // 闭合类/介词叶子下钻具体词 chip（点词→按 {tag, word} 精准进迁移，which→which）
      var words = (fine && window.GrammarKnowledgeViewModel.buildLeafWordBreakdown)
        ? window.GrammarKnowledgeViewModel.buildLeafWordBreakdown(fine, window.GRAMMAR_FINE_TAGS, ALL_QUESTIONS, errorBookQuestions)
        : [];
      if (words.length) {
        var chips = words.map(function(wd) {
          var z = wd.total === 0 ? ' style="opacity:.4;"' : '';
          var rt = (wd.real < wd.total) ? ('·真题' + wd.real) : '';
          return '<button type="button" class="dm-word-chip"' + z
            + ' onclick="event.stopPropagation();startByPointFromMap(\'' + graphEscapeAttr(pointTag) + '\',[\'' + graphEscapeAttr(wd.word) + '\'])">'
            + escapeHtml(wd.word) + ' <span style="opacity:.6;">' + wd.total + rt + '</span></button>';
        }).join('');
        tip += '<div class="dm-words">' + chips + '</div>';
      }
    }
```

> 注：词 chip onclick 用 `[\'word\']` 直接拼单元素数组（`graphEscapeAttr` 已转义），与 `dmKeysLiteral` 输出格式一致，故测试里两处都匹配 `startByPointFromMap('TAG',['VAL']`。

- [ ] **Step 4: 跑测试确认通过 + 全量 smoke**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "决策地图渲染：时态叶迁移按钮"`
Expected: PASS

Run（全量不回归）: `npm run test:smoke`
Expected: 全绿（新增 4 个 + 原有；scope 旧 test 仍在，Task 5 处理）

- [ ] **Step 5: 提交**

```bash
git add docs/grammar-fill/index.html tests/smoke.spec.js
git commit -m "feat(points): 决策地图渲染按point计数;词chip带具体词跳转(which→which);新增startByPoint入口"
```

---

## Task 5: Phase 2 卫生收尾 —— 删 scope 死代码

**Files:**
- Modify: `docs/grammar-fill/modules/migration-training.js`（删 8 个 scope 函数/常量 + exports + `buildMigrationData` 返回字段 + `buildMigrationContentViewModel` 字段）
- Modify: `docs/grammar-fill/modules/teaching-render.js`（删 `migrationScopeSelectorHtml` 162–177 + 两处读点 ~210–211、~263–264）
- Modify: `docs/grammar-fill/index.html`（删 `_migrationScope` 变量 + 两处复位 + `buildMigrationData` 调用里 `scope`/`fineTags` 选项）
- Modify: `tests/smoke.spec.js`（删「facets 可缩放范围」test；改 T2）

- [ ] **Step 1: 写/改测试先确立目标**。在 `tests/smoke.spec.js`：

(a) **删整段**「facets 可缩放范围（word↔type↔category）—— 纯逻辑」test（约 3174 起，到该 `test(...)` 结束）。

(b) **改 T2**（约 3228「T2：迁移渲染去掉旧答案派生 chip 回退」）：把断言里对 `scopeSelector` 的引用去掉。将返回判断改为只验旧答案派生 chip 不渲染：

```javascript
    return (cm.filterChips === undefined && cm.scopeSelector === undefined && Array.isArray(cm.entries))
      ? 'ok'
      : 'bad:filterChips=' + (typeof cm.filterChips) + '/scopeSelector=' + (typeof cm.scopeSelector);
```

(c) **新增**一个断言「exports 不再含 scope 函数」（追加到末尾）：

```javascript
test('Phase2 卫生：scope 死代码已删除', async ({ page }) => {
  await page.goto('/docs/grammar-fill/');
  await page.waitForFunction(() => !!window.GrammarMigrationTraining, null, { timeout: 15000 });
  expect(await page.evaluate(() => {
    var mt = window.GrammarMigrationTraining;
    var gone = !mt.buildMigrationScopes && !mt.migrationMatchesScope && !mt.buildMigrationScopeSelectorModel;
    // buildMigrationData 不再返回 scopes/activeScope
    var d = mt.buildMigrationData({ category:'attrib', points:[{tag:'attrib-pronoun',key:'which'}] }, { source:'bank', bankQuestions:[], errorQuestions:[], categoryMap:{} });
    var noScopeFields = d.scopes === undefined && d.activeScope === undefined;
    // 内容视图模型不再含 scopeSelector
    var cm = mt.buildMigrationContentViewModel(d, 'bank', false);
    return [gone, noScopeFields, cm.scopeSelector === undefined].join(',');
  })).toBe('true,true,true');
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "Phase2 卫生：scope 死代码已删除"`
Expected: FAIL（函数仍导出、`scopes`/`scopeSelector` 仍在）

- [ ] **Step 3a: `migration-training.js` 删代码**
  - 删函数定义：`facetWordValue`、`facetTypeValue`、`buildMigrationScopes`、`migrationMatchesScope`、`SCOPE_VALUE_LABELS`、`scopeButtonLabel`、`sameScope`、`buildMigrationScopeSelectorModel`（约 36–116 行整片，注意保留其后 `sameQuestion` 起的代码）。
  - `buildMigrationData` 内删两行：`var scopes = []; ... var activeScope = null;`；并删返回对象里 `scopes: scopes,` 和 `activeScope: activeScope,` 两行。
  - `buildMigrationContentViewModel` 内删 `scopeSelector: buildMigrationScopeSelectorModel(...),` 一行。
  - 导出对象删三行：`buildMigrationScopes`、`migrationMatchesScope`、`buildMigrationScopeSelectorModel`。

- [ ] **Step 3b: `teaching-render.js` 删代码**
  - 删 `migrationScopeSelectorHtml` 函数（162–177 行整片）。
  - 删两处读点。约 210–211（`teacher-quick` 卡片分支）把：

```javascript
      + ((contentModel.scopeSelector && contentModel.scopeSelector.visible)
          ? migrationScopeSelectorHtml(contentModel.scopeSelector)
          : '')
      + '<div class="migration-list">';
```
改为：
```javascript
      + '<div class="migration-list">';
```

约 263–264（`migrationStageHtml` 分支）把：
```javascript
    html += (contentModel.scopeSelector && contentModel.scopeSelector.visible)
      ? migrationScopeSelectorHtml(contentModel.scopeSelector)
      : '';
    html += '<div class="teaching-migration-scroll">';
```
改为：
```javascript
    html += '<div class="teaching-migration-scroll">';
```

- [ ] **Step 3c: `index.html` 删 plumbing**
  - 删 `var _migrationScope = null;`（约 3850）及其上方相关注释行。
  - 删两处 `_migrationScope = null;` 复位（约 3292、3523）。
  - `getMigrationData` 里 `buildMigrationData(q, {…})` 调用删 `scope: _migrationScope,` 和 `fineTags: window.GRAMMAR_FINE_TAGS,` 两行（约 3860–3862，均未被引擎读取）。

- [ ] **Step 4: 跑测试 + check**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "Phase2 卫生"`
Expected: PASS

Run: `npm run test:smoke`
Expected: 全绿（scope 旧 test 已删，T2 已改）

Run: `npm run check`
Expected: `OK: all engineering checks passed`（已核查 check_grammar_modules.py 仅校验模块顺序/存在，不枚举 scope 函数名，删项不影响）

- [ ] **Step 5: 提交**

```bash
git add docs/grammar-fill/modules/migration-training.js docs/grammar-fill/modules/teaching-render.js docs/grammar-fill/index.html tests/smoke.spec.js
git commit -m "chore(migration): 删scope死代码(buildMigrationScopes/matchesScope/selectorModel/Html+_migrationScope plumbing)+旧smoke"
```

---

## Self-Review 记录

- **Spec 覆盖**：①节点按 points 计数 → Task 1(countByPoint)+Task 3(数据)+Task 4(渲染)；②叶子跳转 which→which → Task 2(引擎)+Task 4(chip 带 word)；③冠词重合 → Task 3(删 l_art_spec)；④scope 卫生 → Task 5。SVA 局限 spec 已声明，Task 3 显式保留不动。✅
- **类型一致**：`countByPoint(tag, keys, bank, errors)` 返回 `{bank,error,real,total}`；`buildPointPracticePlan(tag, keys, all, map)` 返回 `buildCategoryPracticeEntryModel` 形（`hasQuestions/questions/currentExam/emptyMessage`）；`startByPoint(tag, keys)`/`startByPointFromMap(tag, keys)`/`dmKeysLiteral(keys)` 全程一致。✅
- **占位符**：无 TBD。
- **风险点**：Task 4 渲染测试依赖真实题库 present/which 非空（数据层 present=24、attrib-pronoun 词表含 which 已保证）；`check_grammar_modules.py` 已核查不枚举 scope 导出名，Task 5 不需动它。
