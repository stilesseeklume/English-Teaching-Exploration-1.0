# 迁移训练 · 谓语多轴改单考点纯池 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 讲题迁移抽屉不再把谓语动词题的多个考点轴取并集，改为一次只展示一个考点的纯池，并用 chip 在该题各考点间切换（默认时态）。

**Architecture:** `buildMigrationData` 新增 `pointIdx`，用新纯函数 `questionMatchesPoint` 只按选中考点建池（去并集），并返回 `pointChips`。渲染层在标题下渲染 chip 行；index.html 加 `_migrationPointIdx` 状态 + `setMigrationPoint`，切题复位、切来源保留。

**Tech Stack:** 原生 JS（浏览器 IIFE 模块挂 `window.*`），Playwright smoke（`npm run test:smoke`），`npm run check`。

设计依据：[docs/superpowers/specs/2026-06-02-migration-per-axis-pure-pools-design.md](../specs/2026-06-02-migration-per-axis-pure-pools-design.md)

---

### Task 1: 失败的 smoke 测试 —— 单考点纯池

锁死核心修复：谓语 time+passive 题，时态池含同时态主谓一致题、被动池只含被动。

**Files:**
- Modify: `tests/smoke.spec.js`（文件末尾新增独立 `test(...)` 块）

- [ ] **Step 1: 在 `tests/smoke.spec.js` 末尾追加测试块**

在文件最后一个 `test(...)` 之后追加：

```js
test('migration pool is per-axis pure (predicate multi-axis)', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/docs/grammar-fill/');
  await expect(page.locator('html')).toHaveClass(/ready/);

  const out = await page.evaluate(() => {
    const M = window.GrammarMigrationTraining;
    const q = { exam: 'EQ', no: 1, category: 'predicate', facets: { tense: '一般现在', voice: 'passive' } };
    const bank = [
      { exam: 'EA', no: 11, type: '真题', category: 'predicate', facets: { tense: '一般现在', voice: 'passive' } }, // 被动+现在
      { exam: 'EB', no: 12, type: '真题', category: 'predicate', facets: { tense: '一般现在', agreement: true } },  // 主谓一致+现在
      { exam: 'EC', no: 13, type: '真题', category: 'predicate', facets: { tense: '一般过去', voice: 'passive' } }, // 被动+过去
      { exam: 'ED', no: 14, type: '真题', category: 'predicate', facets: { agreement: true } }                      // 纯主谓一致
    ];
    const opts = (pointIdx) => ({
      source: 'bank',
      bankQuestions: bank,
      errorQuestions: [],
      categoryMap: { predicate: '谓语动词' },
      getFineTagInfo: function () { return null; },
      getPointTitle: function (pts) { return pts.map(function (p) { return p.tag + (p.key ? ':' + p.key : ''); }).join(' + '); },
      pointIdx: pointIdx,
      limit: 9999
    });
    const d0 = M.buildMigrationData(q, opts(0)); // 时态轴
    const d1 = M.buildMigrationData(q, opts(1)); // 被动轴
    const nos = (d) => d.migration.map(function (e) { return e.item.no; }).sort();
    return {
      tenseNos: nos(d0),
      passiveNos: nos(d1),
      headerHasPlus: d0.headerLabel.indexOf(' + ') !== -1,
      chipsLen0: (d0.pointChips || []).length,
      chip0Active: (d0.pointChips || [])[0] && d0.pointChips[0].active,
      chip1Active1: (d1.pointChips || [])[1] && d1.pointChips[1].active
    };
  });

  expect(out.tenseNos).toEqual([11, 12]);   // 时态池：被动(11)+主谓一致(12)，含同时态题
  expect(out.passiveNos).toEqual([11, 13]); // 被动池：只含被动(11,13)，不含主谓一致(12,14)
  expect(out.headerHasPlus).toBe(false);    // 标题不再出现 " + "
  expect(out.chipsLen0).toBe(2);            // 两个考点 chip
  expect(out.chip0Active).toBe(true);       // idx0 时 0 号高亮
  expect(out.chip1Active1).toBe(true);      // idx1 时 1 号高亮
  expect(errors).toEqual([]);
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test:smoke -- -g "per-axis pure"`
Expected: FAIL —— 当前 `buildMigrationData` 取并集，`passiveNos` 会包含 12（主谓一致），且 `pointChips` 为 undefined（`chipsLen0` 为 0）。

---

### Task 2: `buildMigrationData` 单考点纯池 + pointChips

**Files:**
- Modify: `docs/grammar-fill/modules/migration-training.js`

- [ ] **Step 1: 新增纯函数 `questionMatchesPoint`**

在 `questionsSharePoint`（约 :302）之后插入：

```js
  // item 是否带有与 point 同 tag 的考点，且(同 key，或任一方 keyless 通配)。单点匹配版。
  function questionMatchesPoint(item, point) {
    if (!point) return false;
    var ip = questionPoints(item);
    var pk = String(point.key == null ? '' : point.key);
    for (var i = 0; i < ip.length; i++) {
      if (ip[i].tag !== point.tag) continue;
      var ik = String(ip[i].key == null ? '' : ip[i].key);
      if (ik === pk || ik === '' || pk === '') return true;
    }
    return false;
  }
```

- [ ] **Step 2: 在 `buildMigrationData` 选中单考点、按它建池**

把现有显示池构建（约 :351-357，注释「显示池=与当前题共享至少一个 point…取并集」到 `pointErrorPool` 结束）整段替换为：

```js
    // 当前题考点清单(谓语已按 时态→被动→主谓一致 顺序派生)；选中一个考点(默认时态)，只按它建纯池。
    var points = questionPoints(q);
    var pointIdx = (typeof options.pointIdx === 'number' && options.pointIdx >= 0 && options.pointIdx < points.length)
      ? options.pointIdx : 0;
    var selectedPoint = points[pointIdx];

    // 显示池=只与选中考点匹配的题(去并集)，排除自身。
    var pointBankPool = bankQuestions.filter(function(item) {
      return !sameQuestion(item, q) && questionMatchesPoint(item, selectedPoint);
    });
    var pointErrorPool = errorQuestions.filter(function(item) {
      return !sameQuestion(item, q) && questionMatchesPoint(item, selectedPoint);
    });
```

- [ ] **Step 3: 标题只用选中考点（去掉 ` + `）**

把现有 `titlePoints`（约 :367-369）替换为：

```js
    var titlePoints = [ poolHomogeneousOnKey(pool, selectedPoint) ? selectedPoint : { tag: selectedPoint.tag } ];
```

- [ ] **Step 4: 构建 `pointChips` 并加入返回值**

在 `buildMigrationData` 的 `return {` 之前插入 chip 标签助手与 chips 构建：

```js
    var catLabel = categoryMap[q.category] || q.category || '';
    function chipLabel(fullTitle) {
      var s = String(fullTitle || '').replace(/^按考点\s*·?\s*/, '');
      if (catLabel && s.indexOf(catLabel + ' · ') === 0) s = s.slice((catLabel + ' · ').length);
      return s.split(' · ').join('·');
    }
    var getPointTitleFn = (typeof options.getPointTitle === 'function') ? options.getPointTitle : function() { return ''; };
    var pointChips = points.map(function(p, i) {
      return { idx: i, label: chipLabel(getPointTitleFn([p])), active: i === pointIdx };
    });
```

然后在 `return { ... }` 对象里追加一行（与 `migration: migration` 同级）：

```js
      migration: migration,
      pointChips: pointChips
```

- [ ] **Step 5: 导出 `questionMatchesPoint`**

在底部 `window.GrammarMigrationTraining = { ... }` 中，`questionsSharePoint`/`countAnalysisMigrationCandidates` 附近补一行（若 `questionsSharePoint` 未导出则只加 `questionMatchesPoint`）：

```js
    questionMatchesPoint: questionMatchesPoint,
```

- [ ] **Step 6: 运行测试确认通过**

Run: `npm run test:smoke -- -g "per-axis pure"`
Expected: PASS（`passiveNos` = [11,13]，`tenseNos` = [11,12]，无 ` + `，chips 长度 2）。

- [ ] **Step 7: 提交**

```bash
git add docs/grammar-fill/modules/migration-training.js tests/smoke.spec.js
git commit -m "feat(migration): 谓语多轴改单考点纯池(questionMatchesPoint去并集+pointChips), 修被动/主谓一致串味"
```

---

### Task 3: view model 透传 pointChips

**Files:**
- Modify: `docs/grammar-fill/modules/migration-training.js`（`buildMigrationContentViewModel`）
- Modify: `tests/smoke.spec.js`（扩展 Task 1 的断言）

- [ ] **Step 1: 在 smoke 测试 evaluate 里追加 content view model 断言**

在 Task 1 测试的 `page.evaluate` return 对象里追加一个字段（在 `chip1Active1` 后）：

```js
      contentChipsLen: (function () {
        var cm = M.buildMigrationContentViewModel(d0, 'bank', false);
        return (cm.pointChips || []).length;
      })()
```

并在 evaluate 之后追加断言：

```js
  expect(out.contentChipsLen).toBe(2); // content view model 透传 pointChips
```

- [ ] **Step 2: 运行确认失败**

Run: `npm run test:smoke -- -g "per-axis pure"`
Expected: FAIL —— `contentChipsLen` 为 0（view model 还没透传）。

- [ ] **Step 3: 在 `buildMigrationContentViewModel` 透传 pointChips**

在 `buildMigrationContentViewModel`（约 :246）的 `return { ... }` 对象里，`entries: entries` 之前追加：

```js
      pointChips: asArray(data.pointChips),
```

- [ ] **Step 4: 运行确认通过**

Run: `npm run test:smoke -- -g "per-axis pure"`
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add docs/grammar-fill/modules/migration-training.js tests/smoke.spec.js
git commit -m "feat(migration): buildMigrationContentViewModel 透传 pointChips"
```

---

### Task 4: 渲染 chip 行（抽屉视图 + 舞台视图）

**Files:**
- Modify: `docs/grammar-fill/modules/teaching-render.js`（`migrationDrawerHtml` + `migrationStageHtml`）
- Modify: `tests/smoke.spec.js`

- [ ] **Step 1: smoke 断言 —— 多考点时 HTML 含 setMigrationPoint，单考点不含**

在 Task 1 测试 evaluate 的 return 里追加（需要 `window.GrammarTeachingRender`）：

```js
      drawerHasChips: (function () {
        var cm = M.buildMigrationContentViewModel(d0, 'bank', false);
        return window.GrammarTeachingRender.migrationDrawerHtml(cm).indexOf('setMigrationPoint(') !== -1;
      })(),
      singlePointNoChips: (function () {
        var sq = { exam: 'SQ', no: 9, category: 'predicate', facets: { agreement: true } }; // 单考点
        var ds = M.buildMigrationData(sq, opts(0));
        var cm = M.buildMigrationContentViewModel(ds, 'bank', false);
        return window.GrammarTeachingRender.migrationDrawerHtml(cm).indexOf('setMigrationPoint(') === -1;
      })()
```

并追加断言：

```js
  expect(out.drawerHasChips).toBe(true);       // 多考点渲染 chip 行
  expect(out.singlePointNoChips).toBe(true);   // 单考点不渲染 chip 行
```

- [ ] **Step 2: 运行确认失败**

Run: `npm run test:smoke -- -g "per-axis pure"`
Expected: FAIL —— `drawerHasChips` 为 false（还没渲染 chip）。

- [ ] **Step 3: 在 `migrationDrawerHtml` 标题块后插入 chip 行**

在 `migrationDrawerHtml` 中，标题卡 `</div>`（`teacher-quick-card` 闭合，约 :133）与 `+ '<div class="migration-list">'`（:134）之间插入：

```js
      + (function() {
          var chips = (contentModel.pointChips || []);
          if (chips.length <= 1) return '';
          return '<div style="display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 4px;">'
            + chips.map(function(c) {
                return '<button type="button" onclick="setMigrationPoint(' + c.idx + ')" '
                  + 'style="padding:4px 12px;border:1px solid ' + (c.active ? 'var(--accent)' : 'var(--border)')
                  + ';background:' + (c.active ? 'var(--accent-bg)' : 'var(--surface)')
                  + ';color:' + (c.active ? 'var(--accent)' : 'var(--text-2)')
                  + ';border-radius:14px;cursor:pointer;font-family:inherit;font-weight:' + (c.active ? '700' : '500')
                  + ';font-size:calc(var(--drawer-font-size-sm,23px) - 6px);">'
                  + window.escapeHtml(c.label) + '</button>';
              }).join('')
            + '</div>';
        })()
```

- [ ] **Step 4: 在 `migrationStageHtml` 标题块后插入同样的 chip 行**

在 `migrationStageHtml` 中，`teaching-tab-title` 块的结尾 `+ '</div>'`（约 :180，紧接 countText 那个 `</div>`）之后、`if (contentModel.emptyHint)` 之前插入：

```js
    var stageChips = (contentModel.pointChips || []);
    if (stageChips.length > 1) {
      html += '<div class="teaching-migration-source-tabs" style="margin-top:6px;">'
        + stageChips.map(function(c) {
            return '<button class="' + (c.active ? 'active' : '') + '" onclick="setMigrationPoint(' + c.idx + ')">'
              + window.escapeHtml(c.label) + '</button>';
          }).join('')
        + '</div>';
    }
```

- [ ] **Step 5: 运行确认通过**

Run: `npm run test:smoke -- -g "per-axis pure"`
Expected: PASS（`drawerHasChips` true、`singlePointNoChips` true）。

- [ ] **Step 6: 提交**

```bash
git add docs/grammar-fill/modules/teaching-render.js tests/smoke.spec.js
git commit -m "feat(migration): 抽屉/舞台视图渲染考点切换 chip 行(>1 考点才显示)"
```

---

### Task 5: index.html 接线（状态 + setMigrationPoint + 复位）

**Files:**
- Modify: `docs/grammar-fill/index.html`

- [ ] **Step 1: 新增状态 `_migrationPointIdx`**

在 `var _migrationShowAll = false;`（:3825）下一行加：

```js
var _migrationPointIdx = 0;
```

- [ ] **Step 2: `getMigrationData` 传入 pointIdx**

在 `getMigrationData` 的 buildMigrationData 入参对象里，`limit:` 那行（:3843）之前加：

```js
    pointIdx: _migrationPointIdx,
```

- [ ] **Step 3: 新增全局 `setMigrationPoint`**

在 `toggleMigrationShowAll`（:3360）函数之后插入：

```js
function setMigrationPoint(idx) {
  _migrationPointIdx = idx;
  _migrationShowAll = false;   // 切考点复位"显示全部"
  var session = getTeachingSessionSnapshot().teachingSession;
  if (session) { renderTeachingStage(); return; }
  var selectedState = getSelectedQuestionSnapshot();
  if (selectedState.selectedQuestion) {
    try {
      document.getElementById('drawerContent').innerHTML = buildMigrationContent(selectedState.selectedQuestion);
    } catch (e) {
      console.error('迁移考点切换失败：', e);
    }
  }
}
```

- [ ] **Step 4: 切题复位 `_migrationPointIdx`**

在 `openTeachingStageByIdx`（:3502）的 `_migrationShowAll = false;` 同一处下一行加：

```js
  _migrationPointIdx = 0;       // 切题复位到默认考点(时态), 避免串到下一题
```

- [ ] **Step 5: 导出 `setMigrationPoint`**

在底部 window 导出表 `toggleMigrationShowAll: toggleMigrationShowAll,`（:5926）下一行加：

```js
  setMigrationPoint: setMigrationPoint,
```

- [ ] **Step 6: 确认切来源不复位考点（仅核对，不改代码）**

核对 `setMigrationSource`（:3314）函数体未出现 `_migrationPointIdx`（保留当前考点）。若有则删除。Expected: 无需改动。

- [ ] **Step 7: 运行全量检查**

Run: `npm run check && npm run test:smoke`
Expected: 全绿（含新加的 "per-axis pure" 测试）。

- [ ] **Step 8: 提交**

```bash
git add docs/grammar-fill/index.html
git commit -m "feat(migration): index 接线 _migrationPointIdx + setMigrationPoint(切题复位/切源保留)"
```

---

## Self-Review 记录

- **Spec 覆盖**：① 数据层=Task 2；② 视图层=Task 3+4；③ index 接线=Task 5；④ 计数/空态/tab 由纯池驱动（Task 2 自然得到，countAnalysis 不动=不在范围）；⑤ 测试=Task 1/3/4 smoke。全覆盖。
- **类型一致**：`questionMatchesPoint(item, point)`、`pointChips: [{idx,label,active}]`、`options.pointIdx`、全局 `setMigrationPoint(idx)`、状态 `_migrationPointIdx` 在各 Task 命名一致。
- **无占位符**：每步含完整代码与可运行命令。
- **边界**：pointIdx 越界 clamp（Task 2 Step 2）；单考点不渲染 chip（Task 4 验证）；非谓语单点池行为不变。
