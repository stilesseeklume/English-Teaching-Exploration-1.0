# 标注纠错批次（A+B+C）实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用 AI 自己写对的散文字段纠正错填的 fine_category/facets（A），让错题项按精确考点迁移（B），合并重复的名词叶子使标题=小标（C）。

**Architecture:** 新增纯函数模块 `question-correction.js`，在 `question-model.js` 归一化时纠正 canonical 字段；迁移入口给错题项补纠正后的带 key points；删除决策地图里重复的名词叶子。三件独立、分开提交。

**Tech Stack:** 原生 JS（浏览器 IIFE 挂 window.*），Playwright smoke（`npm run test:smoke`），`npm run check`。

设计依据：[docs/superpowers/specs/2026-06-02-classification-correction-batch-design.md](../specs/2026-06-02-classification-correction-batch-design.md)。D（介词按词迁移）不在本计划，另排。

---

### Task 1（A）: 字段纠错层模块 + 接入归一化

**Files:**
- Create: `docs/grammar-fill/modules/question-correction.js`
- Modify: `docs/grammar-fill/index.html`（脚本标签）、`docs/grammar-fill/modules/question-model.js`（buildAllQuestions / createExamQuestionFromRaw）
- Test: `tests/smoke.spec.js`

- [ ] **Step 1: 写失败的 smoke 测试**

在 `tests/smoke.spec.js` 末尾追加：

```js
test('字段纠错层 R1/R2：myself→反身, to_be_done→不定式, 已对的不动, 幂等, 不改原对象', async ({ page }) => {
  await page.goto('/docs/grammar-fill/');
  await page.waitForFunction(() => !!(window.GrammarQuestionCorrection && window.GrammarQuestionPoints), null, { timeout: 15000 });
  expect(await page.evaluate(() => {
    var C = window.GrammarQuestionCorrection, P = window.GrammarQuestionPoints;
    var myself = { category:'pronoun', answer:'myself', grammar_point:'反身代词', fine_category:'pron-personal', facets:{type:'personal'} };
    var c1 = C.correctClassification(myself);
    var ok1 = c1.fine_category==='pron-reflexive' && c1.facets.type==='reflexive' && P.buildQuestionPoints(c1)[0].tag==='pron-reflexive';
    var origUntouched = myself.fine_category==='pron-personal' && myself.facets.type==='personal';
    var lifted = { category:'nonpredicate', answer:'to be lifted', nonp_form:'to_be_done', fine_category:'nonpred-done', facets:{form:'done'} };
    var c2 = C.correctClassification(lifted);
    var ok2 = c2.fine_category==='nonpred-to-do' && c2.facets.form==='to-do';
    var rightDone = { category:'nonpredicate', answer:'lifted', nonp_form:'done', fine_category:'nonpred-done', facets:{form:'done'} };
    var c3 = C.correctClassification(rightDone);
    var ok3 = c3.fine_category==='nonpred-done' && c3.facets.form==='done';
    var c2b = C.correctClassification(C.correctClassification(lifted));
    var ok4 = c2b.fine_category==='nonpred-to-do' && c2b.facets.form==='to-do';
    return (ok1&&origUntouched&&ok2&&ok3&&ok4) ? 'ok' : 'bad:'+[ok1,origUntouched,ok2,ok3,ok4].join(',');
  })).toBe('ok');
});

test('纠错接入 buildAllQuestions：真题里的 myself 已归到 pron-reflexive', async ({ page }) => {
  await page.goto('/docs/grammar-fill/');
  await page.waitForFunction(() => !!(window.GrammarQuestionModel && window.GRAMMAR_BANK), null, { timeout: 15000 });
  expect(await page.evaluate(() => {
    var qs = window.GrammarQuestionModel.buildAllQuestions(window.GRAMMAR_BANK, {});
    var m = qs.filter(function(q){ return String(q.answer||'').toLowerCase()==='myself'; });
    var allRef = m.length>0 && m.every(function(q){ return q.fine_category==='pron-reflexive' && q.points[0] && q.points[0].tag==='pron-reflexive'; });
    return allRef ? 'ok' : 'bad:count='+m.length+' '+m.map(function(q){return q.fine_category;}).join(',');
  })).toBe('ok');
});
```

- [ ] **Step 2: 运行确认失败**

Run: `npm run test:smoke -- -g "字段纠错层|纠错接入"`
Expected: FAIL —— `window.GrammarQuestionCorrection` 未定义。

- [ ] **Step 3: 创建模块 `docs/grammar-fill/modules/question-correction.js`**

```js
// grammar-fill/modules/question-correction.js
//
// 用 AI 写对的散文字段(grammar_point/nonp_form)纠正错填的 canonical 字段(fine_category/facets)。
// 纯函数、无 DOM、不改入参、幂等。

/* eslint-disable */
(function(){
  function lower(v){ return String(v == null ? '' : v).trim().toLowerCase(); }

  function shallowCopy(obj){
    var out = {};
    for (var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k]; }
    return out;
  }

  // 返回纠正后的浅拷贝；命中规则才改对应字段，否则等价拷贝。不改入参。
  function correctClassification(raw){
    if (!raw || typeof raw !== 'object') return raw;
    var q = shallowCopy(raw);
    var cat = q.category || '';
    var answer = lower(q.answer);
    var prose = String((q.grammar_point || '') + ' ' + (q.explanation || ''));

    // R1 反身代词：answer 以 self/selves 结尾，或散文写明"反身"
    if (cat === 'pronoun' && (/(?:self|selves)$/.test(answer) || /反身/.test(prose))) {
      if (q.fine_category !== 'pron-reflexive') {
        q.fine_category = 'pron-reflexive';
        var fa = shallowCopy(q.facets || {});
        fa.type = 'reflexive';
        q.facets = fa;
      }
    }

    // R2 非谓语形式对齐权威 nonp_form
    if (cat === 'nonpredicate' && q.nonp_form) {
      var nf = q.nonp_form;
      var target = null;
      if (nf === 'to_do' || nf === 'to_be_done') target = { fine: 'nonpred-to-do', form: 'to-do' };
      else if (nf === 'doing') target = { fine: 'nonpred-doing', form: 'doing' };
      else if (nf === 'done') target = { fine: 'nonpred-done', form: 'done' };
      if (target && (q.fine_category !== target.fine || ((q.facets || {}).form !== target.form))) {
        q.fine_category = target.fine;
        var fa2 = shallowCopy(q.facets || {});
        fa2.form = target.form;
        q.facets = fa2;
      }
    }

    return q;
  }

  window.GrammarQuestionCorrection = { correctClassification: correctClassification };
})();
```

- [ ] **Step 4: 在 index.html 加脚本标签（在 question-points.js 之前）**

`docs/grammar-fill/index.html` 第 426 行 `<script src="./modules/question-points.js"></script>` 之前插入一行：

```html
<script src="./modules/question-correction.js"></script>
```

- [ ] **Step 5: 接入 `question-model.js` 的 buildAllQuestions**

`docs/grammar-fill/modules/question-model.js` `buildAllQuestions`（约 :10）把 `.map(function(q) {` 的回调首行改为先纠正：

```js
    return (bank.questions || []).map(function(q) {
      q = (typeof window !== 'undefined' && window.GrammarQuestionCorrection)
        ? window.GrammarQuestionCorrection.correctClassification(q)
        : q;
      return {
```

（其余 return 对象不变；`buildQuestionPoints(q)` 现在拿到纠正后的 q。）

- [ ] **Step 6: 接入 `createExamQuestionFromRaw`**

同文件 `createExamQuestionFromRaw(raw, exam, categoryTips)`（约 :76）在 `raw = raw || {};` 之后加一行：

```js
    raw = (typeof window !== 'undefined' && window.GrammarQuestionCorrection)
      ? window.GrammarQuestionCorrection.correctClassification(raw)
      : raw;
```

- [ ] **Step 7: 运行确认通过**

Run: `npm run test:smoke -- -g "字段纠错层|纠错接入"`
Expected: PASS。

- [ ] **Step 8: 提交**

```bash
git add docs/grammar-fill/modules/question-correction.js docs/grammar-fill/index.html docs/grammar-fill/modules/question-model.js tests/smoke.spec.js
git commit -m "feat(correction): 字段纠错层(R1反身/R2非谓语形式对齐nonp_form)+接入归一化, 用散文修错填枚举"
```

---

### Task 2（B）: 错题项补纠正后的带 key points（修 from→to）

**Files:**
- Modify: `docs/grammar-fill/index.html`（getMigrationData）
- Test: `tests/smoke.spec.js`

- [ ] **Step 1: 写失败的 smoke 测试（验证机制）**

在 `tests/smoke.spec.js` 末尾追加：

```js
test('错题精确迁移：无 points 的错题被 keyless 通配误配；补带 key points 后不误配', async ({ page }) => {
  await page.goto('/docs/grammar-fill/');
  await page.waitForFunction(() => !!(window.GrammarMigrationTraining && window.GrammarQuestionPoints), null, { timeout: 15000 });
  expect(await page.evaluate(() => {
    var M = window.GrammarMigrationTraining, P = window.GrammarQuestionPoints;
    var fromQ = { exam:'EQ', no:1, category:'preposition', answer:'from', fine_category:'prep-common', facets:{word:'from'}, points:[{tag:'prep-common', key:'from'}] };
    var errNoPoints = { exam:'错题本', no:9, category:'preposition', answer:'to', fine_category:'prep-common' }; // 无 .points
    var bad = M.buildMigrationData(fromQ, { source:'errors', bankQuestions:[], errorQuestions:[errNoPoints], categoryMap:{}, limit:9 });
    var errFixed = Object.assign({}, errNoPoints, { points: P.buildQuestionPoints(errNoPoints) });
    var good = M.buildMigrationData(fromQ, { source:'errors', bankQuestions:[], errorQuestions:[errFixed], categoryMap:{}, limit:9 });
    return (bad.poolCount >= 1 && good.poolCount === 0) ? 'ok' : 'bad:'+bad.poolCount+'/'+good.poolCount;
  })).toBe('ok');
});
```

- [ ] **Step 2: 运行确认通过/失败基线**

Run: `npm run test:smoke -- -g "错题精确迁移"`
Expected: PASS —— 该测试本身验证机制（无 points→误配；带 key points→不误配），证明 B 的映射有必要。（若 FAIL，说明 questionMatchesPoint 行为与预期不符，需先排查。）

- [ ] **Step 3: 在 getMigrationData 给错题项补纠正后的带 key points**

`docs/grammar-fill/index.html` `getMigrationData`（约 :3829）`buildMigrationData` 入参里把
```js
    errorQuestions: errorBookQuestions,
```
改为：
```js
    errorQuestions: errorBookQuestions.map(function(it){
      var c = (window.GrammarQuestionCorrection ? window.GrammarQuestionCorrection.correctClassification(it) : it);
      return Object.assign({}, c, { points: window.GrammarQuestionPoints.buildQuestionPoints(c) });
    }),
```

- [ ] **Step 4: 运行全量 smoke 确认无回归**

Run: `npm run test:smoke`
Expected: 全部 PASS（含上面新测试）。

- [ ] **Step 5: 提交**

```bash
git add docs/grammar-fill/index.html tests/smoke.spec.js
git commit -m "fix(migration): 错题项进迁移前补纠正后的带key points, 修 from 把 to 错题迁出(keyless通配)"
```

---

### Task 3（C）: 合并重复名词叶子（标题=小标）

**Files:**
- Modify: `docs/data/decision_map.js`
- Test: `tests/smoke.spec.js`

- [ ] **Step 1: 写失败的 smoke 测试**

在 `tests/smoke.spec.js` 末尾追加：

```js
test('名词叶子合并：num-plural 标题末段=名词复数，无可数/不可数重复叶子', async ({ page }) => {
  await page.goto('/docs/grammar-fill/');
  await page.waitForFunction(() => !!(window.GrammarKnowledgeViewModel && window.GRAMMAR_DECISION_MAP && window.GRAMMAR_FINE_TAGS && window.CATEGORY_MAP), null, { timeout: 15000 });
  expect(await page.evaluate(() => {
    var kvm = window.GrammarKnowledgeViewModel;
    var DM = (window.GRAMMAR_DECISION_MAP || {}).nodes || [];
    var title = kvm.buildMigrationPointTitle(DM, window.GRAMMAR_FINE_TAGS || {}, window.CATEGORY_MAP || {}, [{ tag: 'num-plural' }]);
    var endsRight = /名词复数$/.test(title);
    var noCountLeaf = !DM.some(function(n){ return n.id === 'l_noun_count'; });
    return (endsRight && noCountLeaf) ? 'ok' : 'bad: title=' + title + ' noCountLeaf=' + noCountLeaf;
  })).toBe('ok');
});
```

- [ ] **Step 2: 运行确认失败**

Run: `npm run test:smoke -- -g "名词叶子合并"`
Expected: FAIL —— 当前还有 `l_noun_count`，且标题末段是"可数 / 不可数"。

- [ ] **Step 3: 改 `docs/data/decision_map.js`**

删除 `l_noun_count` 节点行（约 :56）：
```js
    { id: 'l_noun_count', parent: 'noun', title: '可数 / 不可数', cat: 'number', fine: 'num-plural' },
```
并把保留的 `l_noun_plural`（约 :57）title 改为「名词复数」：
```js
    { id: 'l_noun_plural', parent: 'noun', title: '名词复数', cat: 'number', fine: 'num-plural' },
```

- [ ] **Step 4: 运行确认通过 + 全量回归**

Run: `npm run test:smoke -- -g "名词叶子合并" && npm run test:smoke`
Expected: 全部 PASS（若有旧测试引用 `l_noun_count` 或"可数/不可数"会暴露，需一并修正）。

- [ ] **Step 5: 提交**

```bash
git add docs/data/decision_map.js tests/smoke.spec.js
git commit -m "fix(taxonomy): 合并 num-plural 重复叶子(删可数/不可数, 留名词复数), 迁移标题=小标"
```

---

### 收尾

- [ ] **全量验证**

Run: `npm run check && npm run test:smoke`
Expected: `OK: all engineering checks passed` + 全部 smoke PASS。

---

## Self-Review 记录

- **Spec 覆盖**：A=Task1（R1/R2 + 接入 buildAllQuestions/createExamQuestionFromRaw + 脚本标签）；B=Task2（getMigrationData 补带 key points）；C=Task3（删 l_noun_count + 改名）。D 不在范围（spec 已注明）。
- **类型一致**：`correctClassification(raw)`、`window.GrammarQuestionCorrection`、`buildQuestionPoints`、节点 id `l_noun_count`/`l_noun_plural` 全篇一致。
- **无占位符**：每步含完整代码与命令。
- **观察项**：spec 提到的 console.info 纠正计数为 YAGNI 省略（保持模块纯净），不影响功能。
- **边界**：window.GrammarQuestionCorrection 不存在时各接入点回退原值（守卫）；correctClassification 不改入参（测试覆盖 origUntouched）；幂等（测试覆盖）。
