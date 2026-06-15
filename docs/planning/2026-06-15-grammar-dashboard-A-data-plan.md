# 语法填空看板 · 阶段 A 数据层 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现班级/学生看板与错题本共用的纯数据层——把 `exam_results` 行算成"10 考点得分率、热力图、成长矩阵、处方、错题本选题"，全为纯函数 + node 单测，零 UI、零外部依赖。

**Architecture:** 新建单文件 `docs/grammar-fill/modules/dashboard-model.js`，IIFE 挂 `window.GrammarDashboard`，与现有模块同构。它读 `row.result.byCat`（已按 `catKeyOf` 键）+ `right/wrong/blank` 题号数组，靠 `window.GRAMMAR_FINE_TAGS.tags_by_id` 把精细/粗 key 卷到 10 个看板考点。所有函数无副作用、可独立单测。

**Tech Stack:** 原生 ES5 风格 JS（与现有模块一致）；node `--test` + `node:assert/strict` + `vm` 沙箱单测。设计文档：[2026-06-15-grammar-dashboard-design.md](2026-06-15-grammar-dashboard-design.md)（§4 考点轴、§9 算法）。

---

## 文件结构

- 新建 `docs/grammar-fill/modules/dashboard-model.js` —— 全部纯函数，挂 `window.GrammarDashboard`。
- 新建 `test/dashboard-model.test.js` —— 对应单测，`vm` 加载 `grammar_fine_tags.js` + 本模块。
- 不改任何现有文件（阶段 A 纯加法）。

**公开 API**（`window.GrammarDashboard`）：
`BOARD_CATS`、`boardCatOf`、`examScore`、`classExamMean`、`heatmap`、`catLevel`、`catTrend`、`catState`、`growthMatrix`、`prescription`、`errorBookClass`、`errorBookStudent`。
内部 helper（不导出，经公开函数覆盖）：`rateOf`、`boardCatRates`、`aggClassByExamCat`、`examIdsInOrder`、`linregSlope`、`classQuestionRates`。

**关键常量**：及格线 9、优秀线 12、满分 15；错题本班级线 `< 0.50`；趋势阈值 `±0.02`/次；水平档 `≥0.70 高 / ≥0.50 中 / <0.50 低`；趋势需 `≥3` 有效考次。

---

## Task 1: 模块骨架 + 考点映射 `boardCatOf` / `BOARD_CATS`

**Files:**
- Create: `docs/grammar-fill/modules/dashboard-model.js`
- Test: `test/dashboard-model.test.js`

- [ ] **Step 1: 写失败测试**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function loadWindow(relPaths) {
  const window = {};
  const sandbox = { window, console };
  vm.createContext(sandbox);
  for (const p of relPaths) {
    vm.runInContext(readFileSync(new URL('../' + p, import.meta.url), 'utf8'), sandbox, { filename: p });
  }
  return window;
}
const w = loadWindow(['docs/data/grammar_fine_tags.js', 'docs/grammar-fill/modules/dashboard-model.js']);
const D = w.GrammarDashboard;

test('BOARD_CATS: 10 个考点，分两组', () => {
  assert.equal(D.BOARD_CATS.length, 10);
  assert.deepEqual(D.BOARD_CATS.map(c => c.name), ['时态','谓语其他','非谓语','词性转换','名词数词','冠词','介词','代词','连词逻辑','从句']);
  assert.equal(D.BOARD_CATS.filter(c => c.group === '有提示').length, 5);
});

test('boardCatOf: 精细 tag → 看板考点（仅用已确认存在的 id）', () => {
  assert.equal(D.boardCatOf('pred-tense'), '时态');
  assert.equal(D.boardCatOf('pred-passive'), '谓语其他');   // 谓语里只有时态单拆
  assert.equal(D.boardCatOf('nonpred-to-do'), '非谓语');
  assert.equal(D.boardCatOf('word-comparative'), '词性转换');
});

test('boardCatOf: 粗 category 直传（老数据降级 / 混合键）也能归类', () => {
  assert.equal(D.boardCatOf('preposition'), '介词');
  assert.equal(D.boardCatOf('article'), '冠词');
  assert.equal(D.boardCatOf('predicate'), '谓语其他');   // 老数据无 fine → 时态并入谓语其他
  assert.equal(D.boardCatOf('nounclause'), '从句');
  assert.equal(D.boardCatOf('advclause'), '从句');
});

test('boardCatOf: 少见/未知 → 其他；空 → 其他', () => {
  assert.equal(D.boardCatOf('special-emphasis'), '其他');
  assert.equal(D.boardCatOf(''), '其他');
  assert.equal(D.boardCatOf(undefined), '其他');
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npm run test:unit`
Expected: FAIL —— `Cannot read properties of undefined (reading 'BOARD_CATS')`（模块尚不存在）。

- [ ] **Step 3: 写最小实现**

创建 `docs/grammar-fill/modules/dashboard-model.js`：

```js
/* eslint-disable */
(function(){
  var BOARD_CATS = [
    { name: '时态',     group: '有提示' },
    { name: '谓语其他', group: '有提示' },
    { name: '非谓语',   group: '有提示' },
    { name: '词性转换', group: '有提示' },
    { name: '名词数词', group: '有提示' },
    { name: '冠词',     group: '无提示' },
    { name: '介词',     group: '无提示' },
    { name: '代词',     group: '无提示' },
    { name: '连词逻辑', group: '无提示' },
    { name: '从句',     group: '无提示' }
  ];
  // 粗 category → 看板考点（13 粗类全覆盖；modal 并谓语其他，special 归其他）
  var CAT_TO_BOARD = {
    predicate: '谓语其他', nonpredicate: '非谓语', word: '词性转换',
    number: '名词数词', article: '冠词', preposition: '介词',
    pronoun: '代词', logic: '连词逻辑',
    attrib: '从句', nounclause: '从句', advclause: '从句',
    modal: '谓语其他', special: '其他'
  };
  function boardCatOf(key){
    if (!key) return '其他';
    if (key === 'pred-tense') return '时态';            // 仅时态从谓语里拆出
    var tags = (window.GRAMMAR_FINE_TAGS && window.GRAMMAR_FINE_TAGS.tags_by_id) || {};
    var cat = (tags[key] && tags[key].category) || key; // key 可能本身就是粗 category
    return CAT_TO_BOARD[cat] || '其他';
  }

  window.GrammarDashboard = {
    BOARD_CATS: BOARD_CATS,
    boardCatOf: boardCatOf
  };
})();
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npm run test:unit`
Expected: PASS（4 个用例全绿）。测试只用已确认的细 id（pred-tense / pred-passive / nonpred-to-do / word-comparative）+ 粗 category 键（preposition/article/predicate/nounclause/advclause），不赌未核实的细 id；介词/冠词/从句走 category 路径验证。

- [ ] **Step 5: 提交**

```bash
git add docs/grammar-fill/modules/dashboard-model.js test/dashboard-model.test.js
git commit -m "feat(dashboard): 数据层骨架 + boardCatOf 10考点映射"
```

---

## Task 2: 得分 `examScore` / 班级均分 `classExamMean`

**Files:**
- Modify: `docs/grammar-fill/modules/dashboard-model.js`
- Test: `test/dashboard-model.test.js`

- [ ] **Step 1: 写失败测试**（追加到测试文件末尾）

```js
function mkRow(examId, no, right, wrong, byCat){
  return { exam_id: examId, student_no: no, result: { right: right||[], wrong: wrong||[], blank: [], byCat: byCat||{} } };
}

test('examScore: 对题数 × 1.5', () => {
  assert.equal(D.examScore(mkRow('e1','s1',[36,37,38],[39])), 4.5);
  assert.equal(D.examScore(mkRow('e1','s2',[],[36,37])), 0);
  assert.equal(D.examScore({ exam_id:'e1' }), 0);           // 容错：无 result
});

test('classExamMean: 该卷全班均分', () => {
  const rows = [ mkRow('e1','s1',[36,37],[]), mkRow('e1','s2',[36],[37]), mkRow('e2','s1',[36,37,38],[]) ];
  assert.equal(D.classExamMean(rows, 'e1'), 2.25);          // (3 + 1.5)/2
  assert.equal(D.classExamMean(rows, 'e2'), 4.5);
  assert.equal(D.classExamMean(rows, 'eX'), null);          // 无该卷 → null
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npm run test:unit`
Expected: FAIL —— `D.examScore is not a function`。

- [ ] **Step 3: 写最小实现**（在 IIFE 内、`window.GrammarDashboard` 赋值前加函数，并加入导出）

```js
  function examScore(row){
    var r = row && row.result && row.result.right;
    return (r ? r.length : 0) * 1.5;
  }
  function classExamMean(rows, examId){
    var xs = (rows || []).filter(function(r){ return r.exam_id === examId; }).map(examScore);
    if (!xs.length) return null;
    return xs.reduce(function(a,b){ return a + b; }, 0) / xs.length;
  }
```

导出对象追加：`examScore: examScore, classExamMean: classExamMean`。

- [ ] **Step 4: 跑测试确认通过**

Run: `npm run test:unit`
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add docs/grammar-fill/modules/dashboard-model.js test/dashboard-model.test.js
git commit -m "feat(dashboard): examScore + classExamMean"
```

---

## Task 3: 考点热力图 `heatmap`（每卷 × 每考点 得分率）

**Files:**
- Modify: `docs/grammar-fill/modules/dashboard-model.js`
- Test: `test/dashboard-model.test.js`

- [ ] **Step 1: 写失败测试**

```js
test('heatmap: 按卷序 × 看板考点 给得分率，缺考为 null', () => {
  const rows = [
    mkRow('e1','s1',[],[], { 'pred-tense': {right:1,wrong:1}, 'preposition': {right:0,wrong:2} }),
    mkRow('e1','s2',[],[], { 'pred-tense': {right:2,wrong:0}, 'preposition': {right:1,wrong:1} }),
    mkRow('e2','s1',[],[], { 'pred-tense': {right:1,wrong:0} }),
  ];
  const hm = D.heatmap(rows);
  assert.deepEqual(hm.exams, ['e1','e2']);                  // 卷序（按出现顺序＝已按日期排）
  const t = hm.cells['时态'];                                // 每考点一行：与 exams 对齐的 rate 数组
  assert.equal(t[0], 0.75);                                  // e1 时态：(1+2)对 / 4 总
  assert.equal(t[1], 1);                                     // e2 时态：1/1
  const prep = hm.cells['介词'];
  assert.equal(prep[0], 0.25);                               // e1 介词：1对 / 4 总
  assert.equal(prep[1], null);                               // e2 介词：未考 → null
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npm run test:unit`
Expected: FAIL —— `D.heatmap is not a function`。

- [ ] **Step 3: 写最小实现**

```js
  function rateOf(rw){ var t = rw.right + rw.wrong; return t ? rw.right / t : null; }

  function boardCatRates(row){              // 单生单卷：boardCat -> {right,wrong}
    var byCat = (row.result && row.result.byCat) || {};
    var agg = {};
    Object.keys(byCat).forEach(function(k){
      var bc = boardCatOf(k);
      if (!agg[bc]) agg[bc] = { right: 0, wrong: 0 };
      agg[bc].right += byCat[k].right || 0;
      agg[bc].wrong += byCat[k].wrong || 0;
    });
    return agg;
  }
  function examIdsInOrder(rows){            // 去重保序（rows 已按 exam_date 升序）
    var seen = {}, out = [];
    (rows || []).forEach(function(r){ if (!seen[r.exam_id]) { seen[r.exam_id] = 1; out.push(r.exam_id); } });
    return out;
  }
  function aggClassByExamCat(rows){         // {examId: {boardCat: {right,wrong}}}
    var out = {};
    (rows || []).forEach(function(row){
      var ex = row.exam_id;
      if (!out[ex]) out[ex] = {};
      var rates = boardCatRates(row);
      Object.keys(rates).forEach(function(bc){
        if (!out[ex][bc]) out[ex][bc] = { right: 0, wrong: 0 };
        out[ex][bc].right += rates[bc].right;
        out[ex][bc].wrong += rates[bc].wrong;
      });
    });
    return out;
  }
  function heatmap(rows){
    var exams = examIdsInOrder(rows);
    var agg = aggClassByExamCat(rows);
    var cells = {};
    BOARD_CATS.forEach(function(c){
      cells[c.name] = exams.map(function(ex){
        var rw = agg[ex] && agg[ex][c.name];
        return rw ? rateOf(rw) : null;
      });
    });
    return { exams: exams, cells: cells };
  }
```

导出追加：`heatmap: heatmap`。

- [ ] **Step 4: 跑测试确认通过**

Run: `npm run test:unit`
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add docs/grammar-fill/modules/dashboard-model.js test/dashboard-model.test.js
git commit -m "feat(dashboard): heatmap 卷×考点得分率矩阵"
```

---

## Task 4: 水平 `catLevel` + 趋势 `catTrend`（线性回归 + 样本<3 守卫）

**Files:**
- Modify: `docs/grammar-fill/modules/dashboard-model.js`
- Test: `test/dashboard-model.test.js`

- [ ] **Step 1: 写失败测试**

```js
test('catLevel: ≥0.70 高 / ≥0.50 中 / <0.50 低 / null 无', () => {
  assert.equal(D.catLevel(0.82), '高');
  assert.equal(D.catLevel(0.55), '中');
  assert.equal(D.catLevel(0.40), '低');
  assert.equal(D.catLevel(null), null);
});

test('catTrend: <3 有效点 → 数据不足', () => {
  assert.equal(D.catTrend([0.5, null, 0.6]).status, 'insufficient');
  assert.equal(D.catTrend([0.5, 0.6]).status, 'insufficient');
});

test('catTrend: ≥3 点回归判方向（阈值 ±0.02/次）', () => {
  assert.equal(D.catTrend([0.40,0.50,0.60,0.70]).dir, '升');   // 斜率 +0.1
  assert.equal(D.catTrend([0.70,0.60,0.50,0.40]).dir, '降');
  assert.equal(D.catTrend([0.50,0.51,0.49,0.50]).dir, '平');   // 近水平
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npm run test:unit`
Expected: FAIL —— `D.catLevel is not a function`。

- [ ] **Step 3: 写最小实现**

```js
  function catLevel(rate){
    if (rate == null) return null;
    return rate >= 0.70 ? '高' : (rate >= 0.50 ? '中' : '低');
  }
  function linregSlope(ys){                 // x = 0..n-1
    var n = ys.length; if (n < 2) return 0;
    var sx=0, sy=0, sxx=0, sxy=0;
    for (var i=0;i<n;i++){ sx+=i; sy+=ys[i]; sxx+=i*i; sxy+=i*ys[i]; }
    var d = n*sxx - sx*sx; if (!d) return 0;
    return (n*sxy - sx*sy) / d;
  }
  function catTrend(seriesRates){
    var ys = (seriesRates || []).filter(function(v){ return v != null; });
    if (ys.length < 3) return { status: 'insufficient', n: ys.length };
    var slope = linregSlope(ys);
    var dir = slope > 0.02 ? '升' : (slope < -0.02 ? '降' : '平');
    return { status: 'ok', slope: slope, dir: dir, n: ys.length };
  }
```

导出追加：`catLevel: catLevel, catTrend: catTrend`。

- [ ] **Step 4: 跑测试确认通过**

Run: `npm run test:unit`
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add docs/grammar-fill/modules/dashboard-model.js test/dashboard-model.test.js
git commit -m "feat(dashboard): catLevel + catTrend（含样本<3守卫）"
```

---

## Task 5: 状态 `catState` + 成长矩阵 `growthMatrix` + 处方 `prescription`

**Files:**
- Modify: `docs/grammar-fill/modules/dashboard-model.js`
- Test: `test/dashboard-model.test.js`

- [ ] **Step 1: 写失败测试**

```js
test('catState: 水平×趋势 → 状态/是否红区/优先级', () => {
  assert.deepEqual(D.catState('低','平'), { state:'顽固盲点', red:true, priority:2 });
  assert.deepEqual(D.catState('低','降'), { state:'恶化',     red:true, priority:1 });
  assert.deepEqual(D.catState('中','降'), { state:'滑坡',     red:true, priority:3 });
  assert.deepEqual(D.catState('低','升'), { state:'在好转',   red:false });
  assert.deepEqual(D.catState('高','平'), { state:'稳固',     red:false });
  assert.deepEqual(D.catState('中','平'), { state:'待突破',   red:false });
});

test('growthMatrix: 每考点给 累计率/水平/趋势/状态；样本不足标 insufficient', () => {
  // 介词 4 卷持续低且降 → 恶化(红)；时态仅 1 卷 → 数据不足
  const rows = [
    mkRow('e1','s1',[],[], { 'preposition':{right:2,wrong:2}, 'pred-tense':{right:1,wrong:1} }),
    mkRow('e2','s1',[],[], { 'preposition':{right:2,wrong:3} }),
    mkRow('e3','s1',[],[], { 'preposition':{right:1,wrong:3} }),
    mkRow('e4','s1',[],[], { 'preposition':{right:1,wrong:4} }),
  ];
  const m = D.growthMatrix(rows);
  const prep = m.find(x => x.cat === '介词');
  assert.equal(prep.level, '低');
  assert.equal(prep.trend.dir, '降');
  assert.equal(prep.state.red, true);
  const tense = m.find(x => x.cat === '时态');
  assert.equal(tense.trend.status, 'insufficient');
});

test('prescription: 只收红区，按优先级→低分排序', () => {
  const rows = [
    mkRow('e1','s1',[],[], { 'preposition':{right:1,wrong:4}, 'article':{right:2,wrong:3}, 'word-adj':{right:4,wrong:1} }),
    mkRow('e2','s1',[],[], { 'preposition':{right:1,wrong:4}, 'article':{right:2,wrong:3}, 'word-adj':{right:4,wrong:1} }),
    mkRow('e3','s1',[],[], { 'preposition':{right:1,wrong:4}, 'article':{right:2,wrong:2}, 'word-adj':{right:4,wrong:1} }),
  ];
  const rx = D.prescription(rows);
  assert.ok(rx.every(x => x.state.red));
  assert.ok(!rx.find(x => x.cat === '词性转换'));            // 强项不进处方
  assert.equal(rx[0].cat, '介词');                          // 最低分排最前
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npm run test:unit`
Expected: FAIL —— `D.catState is not a function`。

- [ ] **Step 3: 写最小实现**

```js
  function catState(level, dir){
    if (level === '高') return dir === '降' ? { state:'高位回落', red:false } : { state:'稳固', red:false };
    if (level === '中') {
      if (dir === '降') return { state:'滑坡', red:true, priority:3 };
      if (dir === '升') return { state:'良性', red:false };
      return { state:'待突破', red:false };
    }
    // 低
    if (dir === '升') return { state:'在好转', red:false };
    if (dir === '降') return { state:'恶化', red:true, priority:1 };
    return { state:'顽固盲点', red:true, priority:2 };
  }
  function cumulativeRate(rows, catName){   // 该考点全历次累计 right/wrong → rate
    var agg = aggClassByExamCat(rows);
    var rw = { right:0, wrong:0 };
    Object.keys(agg).forEach(function(ex){
      if (agg[ex][catName]) { rw.right += agg[ex][catName].right; rw.wrong += agg[ex][catName].wrong; }
    });
    return rateOf(rw);
  }
  function growthMatrix(rows){
    var hm = heatmap(rows);
    return BOARD_CATS.map(function(c){
      var rate = cumulativeRate(rows, c.name);
      var level = catLevel(rate);
      var trend = catTrend(hm.cells[c.name]);
      var state = (level && trend.status === 'ok') ? catState(level, trend.dir) : { state:'数据不足', red:false };
      return { cat: c.name, group: c.group, rate: rate, level: level, trend: trend, state: state };
    });
  }
  function prescription(rows){
    return growthMatrix(rows)
      .filter(function(x){ return x.state.red; })
      .sort(function(a,b){
        if (a.state.priority !== b.state.priority) return a.state.priority - b.state.priority;
        return (a.rate == null ? 1 : a.rate) - (b.rate == null ? 1 : b.rate);
      });
  }
```

导出追加：`catState: catState, growthMatrix: growthMatrix, prescription: prescription`。

- [ ] **Step 4: 跑测试确认通过**

Run: `npm run test:unit`
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add docs/grammar-fill/modules/dashboard-model.js test/dashboard-model.test.js
git commit -m "feat(dashboard): catState + growthMatrix + prescription"
```

---

## Task 6: 错题本选题 `errorBookClass`（班级<50%）+ `errorBookStudent`（个人错题）

**Files:**
- Modify: `docs/grammar-fill/modules/dashboard-model.js`
- Test: `test/dashboard-model.test.js`

- [ ] **Step 1: 写失败测试**

```js
test('errorBookClass: 该卷全班正确率<50%的题号', () => {
  const rows = [
    mkRow('e1','s1',[36,37],[38]), mkRow('e1','s2',[36],[37,38]), mkRow('e1','s3',[36],[37,38]),
  ];
  // 36: 3对0错=100%；37: 1对2错≈33%；38: 0对3错=0%
  const list = D.errorBookClass(rows, 'e1').map(x => x.no).sort((a,b)=>a-b);
  assert.deepEqual(list, [37, 38]);
  const q37 = D.errorBookClass(rows, 'e1').find(x => x.no === 37);
  assert.ok(q37.classRate < 0.5 && q37.exam_id === 'e1');
});

test('errorBookStudent: 某生该卷做错的题号', () => {
  const out = D.errorBookStudent(mkRow('e1','s2',[36],[37,38]));
  assert.deepEqual(out.map(x => x.no), [37, 38]);
  assert.equal(out[0].student_no, 's2');
  assert.equal(out[0].exam_id, 'e1');
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npm run test:unit`
Expected: FAIL —— `D.errorBookClass is not a function`。

- [ ] **Step 3: 写最小实现**

```js
  function classQuestionRates(rows, examId){    // {no: {right,wrong,rate}}
    var m = {};
    (rows || []).filter(function(r){ return r.exam_id === examId; }).forEach(function(r){
      (r.result.right || []).forEach(function(no){ (m[no] = m[no] || {right:0,wrong:0}).right++; });
      (r.result.wrong || []).forEach(function(no){ (m[no] = m[no] || {right:0,wrong:0}).wrong++; });
    });
    Object.keys(m).forEach(function(no){ m[no].rate = rateOf(m[no]); });
    return m;
  }
  function errorBookClass(rows, examId){
    var m = classQuestionRates(rows, examId);
    return Object.keys(m)
      .filter(function(no){ return m[no].rate != null && m[no].rate < 0.50; })
      .map(function(no){ return { exam_id: examId, no: Number(no), classRate: m[no].rate }; });
  }
  function errorBookStudent(row){
    return (row.result.wrong || []).map(function(no){
      return { exam_id: row.exam_id, student_no: row.student_no, no: no };
    });
  }
```

导出追加：`errorBookClass: errorBookClass, errorBookStudent: errorBookStudent`。

- [ ] **Step 4: 跑测试确认通过**

Run: `npm run test:unit`
Expected: PASS（全文件用例全绿）。

- [ ] **Step 5: 提交**

```bash
git add docs/grammar-fill/modules/dashboard-model.js test/dashboard-model.test.js
git commit -m "feat(dashboard): errorBookClass(<50%) + errorBookStudent"
```

---

## 收口验证

- [ ] `npm run test:unit` 全绿（含本计划新增全部用例 + 既有用例无回归）。
- [ ] `node --check docs/grammar-fill/modules/dashboard-model.js` 无语法错。
- [ ] 浏览器随便开一页确认 `window.GrammarDashboard` 已挂载、不报错（脚本已在 `index.html` 引入；若未引入，在阶段 B 接 UI 时加 `<script src="modules/dashboard-model.js">`，阶段 A 不强制）。

## 阶段 A 产出

一套纯数据层：考点映射、得分/均分、热力图矩阵、成长矩阵（水平×趋势×状态，含样本守卫）、处方排序、错题本选题。**全部可单测、零 UI、零依赖**，供阶段 B 班级看板 / C 学生看板 / E 错题本直接消费。
