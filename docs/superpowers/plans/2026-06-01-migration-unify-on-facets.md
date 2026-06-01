# 迁移训练统一到 fine_category + facets 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把迁移训练的默认池、筛选、标签、计数全部改为只读 `fine_category + facets`（体系 A），拔除 focus/nonpAxis/practicalGuide/答案派生（体系 B），并删除统一后零引用的死代码，让筛选 UI 统一为单一范围选择器、真题/模拟/错题表现一致。

**Architecture:** `buildMigrationData` 重写为：默认池=同 fine_category（排除自身），范围选择器三档（具体词 facets.word/form → fine tag → 大类 category）始终基于"同大类底池"动态取，默认激活当前题 fine_category 档。废除旧答案派生 chip（filterChips）渲染分支。删除迁移专用 B 函数；讲题卡用的 getNonpAxis/getQuestionPracticalGuide 保留（与迁移解耦）。

**Tech Stack:** 原生 JS（IIFE 模块）、Playwright smoke（page.evaluate 跑纯函数）、`npm run check` 全量校验。

**纪律（来自记忆铁律）**：每个 Edit 确认返回 success；commit 前本消息内新鲜跑出绿色证据；Edit 与 commit 不放同一批调用；message 不写未验证结论。

**依赖顺序**：T1(重写buildMigrationData) → T2(渲染去旧chip) → T3(countAnalysisMigrationCandidates改A) → T4(删死代码) → T5(全量回归+浏览器验收)。

---

## 文件结构

| 文件 | 责任 | 改动 |
|------|------|------|
| `docs/grammar-fill/modules/migration-training.js` | 迁移纯逻辑 | 重写 buildMigrationData 为纯 A；删 B 函数 |
| `docs/grammar-fill/modules/teaching-render.js` | 迁移渲染 | 去 filterChips 回退分支；删 migrationFilterChipsHtml |
| `docs/grammar-fill/index.html` | 接线 | 删迁移专用 B 包装/导出；getMigrationData 去 B 入参 |
| `tests/smoke.spec.js` | 回归 | 改/删旧断言；加统一行为断言 |

---

## Task 1: 重写 buildMigrationData 为纯 fine_category + facets

**Files:** Modify `docs/grammar-fill/modules/migration-training.js`（buildMigrationData ~494-573 的 B 逻辑段）；Test `tests/smoke.spec.js`

**目标行为**：默认池 = 同 fine_category（排除自身）；范围选择器底池 = 同 category；默认激活档 = 当前题 fine_category；标签用 fineTags 的 fine name。

- [ ] **Step 1: 写失败测试**

在 smoke "grammar-fill core path" 的迁移断言区后加：

```javascript
  // T1：迁移默认池=同fine_category，默认激活当前fine档，标签用fine name
  expect(await page.evaluate(() => {
    var mt = window.GrammarMigrationTraining;
    var ft = window.GRAMMAR_FINE_TAGS;
    var q = { exam:'e', no:1, category:'article', fine_category:'art-a-an', facets:{ word:'a-an' }, type:'真题' };
    var bank = [ q,
      { exam:'e', no:2, category:'article', fine_category:'art-a-an', facets:{ word:'a-an' }, type:'真题' },
      { exam:'e', no:3, category:'article', fine_category:'art-the', facets:{ word:'the' }, type:'真题' } ];
    var data = mt.buildMigrationData(q, { source:'bank', bankQuestions:bank, errorQuestions:[],
      categoryMap:{ article:'冠词' }, fineTags:ft, limit:99 });
    // 默认池=同fine art-a-an 排除自身 → 仅 no2 → poolCount 1
    var sel = mt.buildMigrationContentViewModel(data, 'bank', false).scopeSelector;
    var ftBtns = (sel.buttons||[]).filter(function(b){ return b.level==='finetag'; });
    var ids = ftBtns.map(function(b){ return b.value; }).sort().join(',');
    return (data.poolCount === 1
      && data.activeScope && data.activeScope.level==='finetag' && data.activeScope.value==='art-a-an'
      && sel.visible && ftBtns.length === 2 && ids === 'art-a-an,art-the') ? 'ok'
      : 'bad:' + data.poolCount + '|' + (data.activeScope&&data.activeScope.value) + '|' + ftBtns.length + '/' + ids + '/' + sel.visible;
  })).toBe('ok');
```

- [ ] **Step 2: 运行确认失败**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path" 2>&1 | grep -iE "passed|failed|bad:"`
Expected: FAIL（现 buildMigrationData 用 B 逻辑，poolCount/activeScope 不符）。

- [ ] **Step 3: 重写 buildMigrationData 的 B 逻辑段**

把 `buildMigrationData` 从 `var safeQuestionFocus = ...`（~500）到 `var tabs = buildTabs(...)`（~596）整段，替换为纯 A 逻辑：

```javascript
    var fineCat = q.fine_category || '';
    var getFineTagInfo = options.getFineTagInfo || function() { return null; };
    var fineInfo = getFineTagInfo(fineCat);

    // 同大类底池（排除自身）——范围选择器与默认池都从这里取
    var fallbackBankPool = bankQuestions.filter(function(item) {
      return item.category === q.category && !sameQuestion(item, q);
    });
    var fallbackErrorPool = errorQuestions.filter(function(item) {
      return item.category === q.category && !sameQuestion(item, q);
    });
    // 同 fine_category 池（默认显示）
    var fineBankPool = fineCat ? fallbackBankPool.filter(function(item) {
      return item.fine_category === fineCat;
    }) : fallbackBankPool;
    var fineErrorPool = fineCat ? fallbackErrorPool.filter(function(item) {
      return item.fine_category === fineCat;
    }) : fallbackErrorPool;

    var bankDisplayPool = dedupe(fineBankPool);
    var errorDisplayPool = dedupe(fineErrorPool);
    var pool = selectSourcePool(source, bankDisplayPool, errorDisplayPool);
    var tabs = buildTabs(bankDisplayPool, errorDisplayPool);
```

（删除：safeQuestionFocus/Trap/FocusKey、getNonpAxis、getQuestionPracticalGuide、deps、focus、trap/trapId、nonpAxis、practicalGuide、teachingKeys、focusFirst、teachingBankPool/ErrorPool、nonpExact*/nonpForm* 四池、trapBankPool/ErrorPool、bankPool/errorPool、buildDisplayPools 调用。）

- [ ] **Step 4: 改 scopes 段——底池用同大类，默认激活 fine 档**

紧接其后的 `if (hasFacets) {...}` 段（~604）改为：scopes 用 fineTagsByCategory 生成（含 finetag 全列），默认激活 = 当前 fine 档：

```javascript
    var qFacets = q.facets || {};
    var fineTagsByCategory = (options.fineTags && options.fineTags.tags_by_category) || {};
    var scopeBasePool = selectSourcePool(source, fallbackBankPool, fallbackErrorPool);
    var scopes = buildMigrationScopes(qFacets, fineCat, q.category, fineTagsByCategory).map(function(s) {
      return {
        level: s.level, value: s.value, label: s.label,
        count: scopeBasePool.filter(function(it) { return migrationMatchesScope(it, s); }).length
      };
    });
    var activeScope = options.scope
      || scopes.filter(function(s){ return s.level === 'finetag' && s.value === fineCat; })[0]
      || scopes.filter(function(s){ return s.level === 'finetag'; })[0]
      || scopes[0] || null;
    if (activeScope) {
      pool = scopeBasePool.filter(function(it) { return migrationMatchesScope(it, activeScope); });
    }
```

- [ ] **Step 5: 改 headerLabel/emptyState/migration 标签段用 fineInfo**

`buildMigrationData` 后半段（headerLabel/headerSubLabel ~此前依赖 practicalGuide/focus；emptyState.focusLabel；migration.map 里 tagLabel/teachingLine 依赖 itemGuide/itemAxis）改为只用 fineInfo：

```javascript
    var resolvedFineInfo = fineInfo || firstFineTagFromPool(pool, getFineTagInfo);
    var headerLabel = resolvedFineInfo ? ('同考点：' + resolvedFineInfo.name) : ('同类型：' + (categoryMap[q.category] || q.category || '语法填空'));
    var headerSubLabel = resolvedFineInfo ? formatFineHeaderSubLabel(resolvedFineInfo) : '';

    var fallbackCount = source === 'errors'
      ? fallbackErrorPool.length
      : (source === 'mock'
          ? fallbackBankPool.filter(isMockQuestion).length
          : fallbackBankPool.filter(isRealQuestion).length);
    var focusLabel = resolvedFineInfo ? resolvedFineInfo.name : (categoryMap[q.category] || q.category || '当前考点');
    var emptyState = pool.length ? null : {
      source: source, focusLabel: focusLabel, fallbackCount: fallbackCount,
      fallbackCategoryLabel: categoryMap[q.category] || q.category || '语法填空'
    };

    var migration = selectMigrationItems(pool, source, options.limit || 6).map(function(item) {
      var isError = isErrorQuestionItem(item);
      var itemFineInfo = getFineTagInfo(item.fine_category);
      return {
        item: item, isError: isError,
        srcLabel: isError ? '📝 我的错题' : item.exam,
        tagLabel: (itemFineInfo && itemFineInfo.name) || (categoryMap[item.category] || item.category || '同类迁移'),
        teachingLine: ''
      };
    });
```

并删 return 对象里的 `focus/trap/nonpAxis/practicalGuide` 字段（保留 q/fineInfo/headerLabel/headerSubLabel/poolCount/tabs/scopes/activeScope/categoryName/emptyState/migration）。

- [ ] **Step 6: 运行确认通过**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path" 2>&1 | grep -iE "passed|failed|bad:"`
Expected: `1 passed`。

- [ ] **Step 7: Commit**

```bash
git add docs/grammar-fill/modules/migration-training.js tests/smoke.spec.js
git commit -m "refactor(migration): buildMigrationData重写为纯fine_category+facets(默认同fine, 范围选择器统一); 拔除focus/nonpAxis/practicalGuide体系B"
```

---

## Task 2: 渲染去除旧答案派生 chip 回退

**Files:** Modify `docs/grammar-fill/modules/teaching-render.js`（migrationStageHtml ~277、migrationDrawerHtml ~224）；Test smoke

**目标**：scopeSelector 不可见时不再回退旧 chip，统一只用 scopeSelector（始终基于 facets 生成，谓语题也有 fine tag 档所以总可见）。

- [ ] **Step 1: 写失败测试（旧 chip 不再出现）**

```javascript
  // T2：迁移渲染只用范围选择器，无旧 mig-filter-chip
  expect(await page.evaluate(() => {
    var mt = window.GrammarMigrationTraining;
    var ft = window.GRAMMAR_FINE_TAGS;
    var q = { exam:'e', no:1, category:'article', fine_category:'art-a-an', facets:{ word:'a-an' }, type:'真题' };
    var bank = [ q, { exam:'e', no:2, category:'article', fine_category:'art-a-an', facets:{ word:'a-an' }, type:'真题' } ];
    var data = mt.buildMigrationData(q, { source:'bank', bankQuestions:bank, errorQuestions:[], categoryMap:{article:'冠词'}, fineTags:ft, limit:99 });
    var cm = mt.buildMigrationContentViewModel(data, 'bank', false);
    cm.entries.forEach(function(e){ e.stageSentenceHtml = '<span>x</span>'; });
    var html = window.GrammarTeachingRender.migrationStageHtml(cm);
    return (html.indexOf('mig-scope-chip') !== -1 && html.indexOf('mig-filter-chip') === -1) ? 'ok'
      : 'bad:scope=' + (html.indexOf('mig-scope-chip')!==-1) + '/oldchip=' + (html.indexOf('mig-filter-chip')!==-1);
  })).toBe('ok');
```

- [ ] **Step 2: 运行确认失败**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path" 2>&1 | grep -iE "passed|failed|bad:"`
Expected: FAIL（现仍有回退分支可能出旧 chip）。

- [ ] **Step 3: 改 migrationStageHtml 去回退**（teaching-render.js ~277）

```javascript
    html += (contentModel.scopeSelector && contentModel.scopeSelector.visible)
      ? migrationScopeSelectorHtml(contentModel.scopeSelector)
      : '';
```

- [ ] **Step 4: 改 migrationDrawerHtml 去回退**（teaching-render.js ~224）

```javascript
      + ((contentModel.scopeSelector && contentModel.scopeSelector.visible)
          ? migrationScopeSelectorHtml(contentModel.scopeSelector)
          : '')
```

- [ ] **Step 5: 运行确认通过**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path" 2>&1 | grep -iE "passed|failed|bad:"`
Expected: `1 passed`。

- [ ] **Step 6: Commit**

```bash
git add docs/grammar-fill/modules/teaching-render.js tests/smoke.spec.js
git commit -m "refactor(migration): 渲染去除旧答案派生chip回退, 统一只用范围选择器"
```

---

## Task 3: countAnalysisMigrationCandidates 改为按 fine_category 计数

**Files:** Modify `docs/grammar-fill/modules/migration-training.js`（countAnalysisMigrationCandidates ~448-490）；Test smoke

**背景**：讲题面板的"同类迁移 N 题"计数现走 nonpAxis/practicalGuide/focusKey（B）。改为：有 fine_category 则数同 fine，否则数同 category。

- [ ] **Step 1: 写失败测试**

```javascript
  // T3：countAnalysisMigrationCandidates 按 fine_category 计数
  expect(await page.evaluate(() => {
    var mt = window.GrammarMigrationTraining;
    var q = { exam:'e', no:1, category:'article', fine_category:'art-a-an' };
    var bank = [ q,
      { exam:'e', no:2, category:'article', fine_category:'art-a-an' },
      { exam:'e', no:3, category:'article', fine_category:'art-the' } ];
    var n = mt.countAnalysisMigrationCandidates(q, { bankQuestions: bank });
    return n === 1 ? 'ok' : 'bad:' + n;  // 同 art-a-an 排除自身 = no2 = 1
  })).toBe('ok');
```

- [ ] **Step 2: 运行确认失败**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path" 2>&1 | grep -iE "passed|failed|bad:"`
Expected: FAIL 或现逻辑偶合。读现状后若已巧合通过，仍按 Step 3 简化。

- [ ] **Step 3: 重写 countAnalysisMigrationCandidates**（整函数替换）

```javascript
  function countAnalysisMigrationCandidates(q, options) {
    q = q || {};
    options = options || {};
    var bankQuestions = options.bankQuestions || [];
    var fineCat = q.fine_category || '';
    return bankQuestions.filter(function(item) {
      if (sameQuestion(item, q)) return false;
      return fineCat
        ? item.fine_category === fineCat
        : item.category === q.category;
    }).length;
  }
```

- [ ] **Step 4: 运行确认通过**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path" 2>&1 | grep -iE "passed|failed|bad:"`
Expected: `1 passed`。

- [ ] **Step 5: Commit**

```bash
git add docs/grammar-fill/modules/migration-training.js tests/smoke.spec.js
git commit -m "refactor(migration): countAnalysisMigrationCandidates改为按fine_category计数(去practicalGuide/focus)"
```

---

## Task 4: 删死代码（统一后零引用）

**Files:** Modify `migration-training.js`、`teaching-render.js`、`index.html`、`tests/smoke.spec.js`

**纪律**：每删一个先 grep 确认零引用（除被删定义自身），删后 `npm run check` 全绿。

- [ ] **Step 1: grep 确认各函数引用面**

Run:
```bash
cd /Users/zhenliu/Desktop/英语教学系统1.0
for fn in nonpAxisExactMatch nonpAxisFormMatch getTeachingMigrationKeys hasTeachingMigrationOverlap migrationFilterKey buildMigrationFilterChips buildDisplayPools filterMigrationCards migrationFilterChipsHtml teachingMigrationDeps; do
  echo "=== $fn ==="; grep -rn "$fn" docs/grammar-fill/ tests/ | grep -v "function $fn\|$fn:"; done
```
读输出，确认每个仅剩"定义+导出+被删段"引用（无活跃调用）。若某函数仍被活跃调用，记录到本 Task 注释，单独处理或保留。

- [ ] **Step 2: 删 migration-training.js 内的 B 函数 + 导出**

删除函数定义：`nonpAxisExactMatch`、`nonpAxisFormMatch`、`getTeachingMigrationKeys`、`hasTeachingMigrationOverlap`、`migrationFilterKey`、`buildMigrationFilterChips`、`buildDisplayPools`。
删除 `window.GrammarMigrationTraining = {...}` 导出里这 7 个键。
（`buildMigrationContentViewModel` 里若引用 `migrationFilterKey`/`buildMigrationFilterChips` 生成 filterChips，一并删除该 filterChips 字段及 entries 里的 filterKey。）

- [ ] **Step 3: 删 teaching-render.js 的 migrationFilterChipsHtml + data-mig-filter**

删除 `migrationFilterChipsHtml` 函数定义。
删除迁移卡/行 HTML 里的 `data-mig-filter="..."` 属性输出（migrationDrawerHtml 卡片 + migrationStageHtml 行）。

- [ ] **Step 4: 删 index.html 的迁移专用 B 包装 + 导出**

删除函数：`nonpAxisExactMatch`(603)、`nonpAxisFormMatch`(607)、`teachingMigrationDeps`(611)、`getTeachingMigrationKeys`(3236)、`hasTeachingMigrationOverlap`(3240)、`filterMigrationCards`(6938 区)。
删除 `window.*` 导出里这些键（filterMigrationCards、nonpAxisExactMatch、nonpAxisFormMatch、getTeachingMigrationKeys、hasTeachingMigrationOverlap）。
`getMigrationData` 的 buildMigrationData options 里删除 B 入参：`safeQuestionFocus`、`safeQuestionFocusKey`、`safeQuestionTrap`、`safeQuestionTrapId`、`getNonpAxis`、`getQuestionPracticalGuide`（保留 source/bankQuestions/errorQuestions/categoryMap/getFineTagInfo/fineTags/scope/limit）。
`buildMigrationContent`（抽屉）同样删 B 入参。

- [ ] **Step 5: 删 CSS .mig-filter-chip**

grep `.mig-filter-chip` 确认仅 CSS 定义无 JS 引用后，删除 index.html 里 `.mig-filter-chip` 及其 `.active` 样式行。

- [ ] **Step 6: 删/改 smoke 旧断言**

删除引用 `migrationFilterKey`、`buildMigrationFilterChips`、`getTeachingMigrationKeys`、`hasTeachingMigrationOverlap`、`data-mig-filter`、`nonpAxisExactMatch`、`nonpAxisFormMatch` 的 smoke 断言块。

- [ ] **Step 7: 全量 check**

Run: `npm run check 2>&1 | grep -iE "OK: all|passed|failed|✘"`
Expected: `OK: all engineering checks passed` + `12 passed`（或现有数量）。若红，按报错补删/改，直到全绿。

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor(migration): 删除统一后零引用的体系B死代码(nonpAxis*/migrationKeys/旧chip/filterMigrationCards等); check全绿"
```

---

## Task 5: 全量回归 + 浏览器验收

- [ ] **Step 1: 全量 check**

Run: `npm run check 2>&1 | grep -iE "OK: all|passed|failed|✘"`
Expected: `OK: all engineering checks passed` + 全部 passed。

- [ ] **Step 2: 浏览器验收（临时 spec，验后删）**

写临时 `tests/_verify_migration.spec.js`：进讲题台某冠词题→迁移 tab，断言：真题库 tab 与模拟题 tab **都**出现范围选择器（`mig-scope-chip`），**都不**出现旧 chip（`mig-filter-chip`）；切换 source 选择器始终在。跑通后删除该临时文件。

```javascript
import { test, expect } from '@playwright/test';
test('migration filter unified across sources', async ({ page }) => {
  await page.goto('/docs/grammar-fill/');
  await expect(page.locator('html')).toHaveClass(/ready/);
  var r = await page.evaluate(() => {
    var mt = window.GrammarMigrationTraining, ft = window.GRAMMAR_FINE_TAGS;
    var bank = (window.GRAMMAR_BANK.questions||[]).filter(function(x){return x.category==='article';});
    var q = bank[0]; if (!q) return { skip:true };
    function html(src){
      var d = mt.buildMigrationData(q, { source:src, bankQuestions:bank, errorQuestions:[], categoryMap:window.CATEGORY_MAP||{}, fineTags:ft, limit:99 });
      var cm = mt.buildMigrationContentViewModel(d, src, false);
      cm.entries.forEach(function(e){ e.stageSentenceHtml='<span>x</span>'; });
      return window.GrammarTeachingRender.migrationStageHtml(cm);
    }
    var b = html('bank'), m = html('mock');
    return {
      bankScope: b.indexOf('mig-scope-chip')!==-1, bankOld: b.indexOf('mig-filter-chip')!==-1,
      mockScope: m.indexOf('mig-scope-chip')!==-1, mockOld: m.indexOf('mig-filter-chip')!==-1
    };
  });
  console.log('UNIFY:', JSON.stringify(r));
  if (r.skip) return;
  expect(r.bankOld).toBe(false);
  expect(r.mockOld).toBe(false);
});
```

Run: `npx playwright test tests/_verify_migration.spec.js --project=chromium 2>&1 | grep -E "UNIFY|passed|failed"`
读 UNIFY 输出确认 bankOld/mockOld 均 false。然后 `rm tests/_verify_migration.spec.js`。

- [ ] **Step 3: push**

```bash
git push origin main
```

---

## 自检（Self-Review）记录

- **Spec 覆盖**：默认同fine_category→T1；统一范围选择器/去旧chip→T1+T2；标签用fine name→T1 Step5；计数改A→T3；删死代码清单→T4（逐项对应 spec 清单）；保留讲题卡B函数→T4 只删迁移专用、不碰 getNonpAxis/getQuestionPracticalGuide/teachingGuideDeps。
- **占位符**：T4 Step1 grep 驱动删除，每函数有明确处置；无 TODO。
- **类型一致**：scope level `finetag` 与 T4 前 Task 一致；buildMigrationData 返回字段（poolCount/scopes/activeScope/migration/tabs/emptyState）贯穿 T1-T2；countAnalysisMigrationCandidates 签名 `(q, options)` 不变。
- **风险**：buildMigrationData 是大改，T1 分 5 步逐段替换降风险；删死代码在功能改完后（T4）做，避免边删边断；index.html 巨型文件用精确行号+grep 定位。
