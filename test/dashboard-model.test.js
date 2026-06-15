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

function mkRow(examId, no, right, wrong, byCat){
  return { exam_id: examId, student_no: no, result: { right: right||[], wrong: wrong||[], blank: [], byCat: byCat||{} } };
}
// 模块对象来自 vm 沙箱 realm，deepStrictEqual 比原型会挂 → 用 JSON 比结构（仓库现有测试同款）
const jeq = (a, b) => assert.equal(JSON.stringify(a), JSON.stringify(b));

/* ---- Task 1: boardCatOf / BOARD_CATS ---- */
test('BOARD_CATS: 10 个考点，分两组', () => {
  assert.equal(D.BOARD_CATS.length, 10);
  jeq(D.BOARD_CATS.map(c => c.name), ['时态','谓语其他','非谓语','词性转换','名词数词','冠词','介词','代词','连词逻辑','从句']);
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

/* ---- Task 2: examScore / classExamMean ---- */
test('examScore: 对题数 × 1.5', () => {
  assert.equal(D.examScore(mkRow('e1','s1',[36,37,38],[39])), 4.5);
  assert.equal(D.examScore(mkRow('e1','s2',[],[36,37])), 0);
  assert.equal(D.examScore({ exam_id:'e1' }), 0);
});

test('classExamMean: 该卷全班均分', () => {
  const rows = [ mkRow('e1','s1',[36,37],[]), mkRow('e1','s2',[36],[37]), mkRow('e2','s1',[36,37,38],[]) ];
  assert.equal(D.classExamMean(rows, 'e1'), 2.25);
  assert.equal(D.classExamMean(rows, 'e2'), 4.5);
  assert.equal(D.classExamMean(rows, 'eX'), null);
});

/* ---- Task 3: heatmap ---- */
test('heatmap: 按卷序 × 看板考点 给得分率，缺考为 null', () => {
  const rows = [
    mkRow('e1','s1',[],[], { 'pred-tense': {right:1,wrong:1}, 'preposition': {right:0,wrong:2} }),
    mkRow('e1','s2',[],[], { 'pred-tense': {right:2,wrong:0}, 'preposition': {right:1,wrong:1} }),
    mkRow('e2','s1',[],[], { 'pred-tense': {right:1,wrong:0} }),
  ];
  const hm = D.heatmap(rows);
  jeq(hm.exams, ['e1','e2']);
  const t = hm.cells['时态'];
  assert.equal(t[0], 0.75);
  assert.equal(t[1], 1);
  const prep = hm.cells['介词'];
  assert.equal(prep[0], 0.25);
  assert.equal(prep[1], null);
});

/* ---- Task 4: catLevel / catTrend ---- */
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
  assert.equal(D.catTrend([0.40,0.50,0.60,0.70]).dir, '升');
  assert.equal(D.catTrend([0.70,0.60,0.50,0.40]).dir, '降');
  assert.equal(D.catTrend([0.50,0.51,0.49,0.50]).dir, '平');
});

/* ---- Task 5: catState / growthMatrix / prescription ---- */
test('catState: 水平×趋势 → 状态/是否红区/优先级', () => {
  jeq(D.catState('低','平'), { state:'顽固盲点', red:true, priority:2 });
  jeq(D.catState('低','降'), { state:'恶化',     red:true, priority:1 });
  jeq(D.catState('中','降'), { state:'滑坡',     red:true, priority:3 });
  jeq(D.catState('低','升'), { state:'在好转',   red:false });
  jeq(D.catState('高','平'), { state:'稳固',     red:false });
  jeq(D.catState('中','平'), { state:'待突破',   red:false });
});

test('growthMatrix: 每考点给 累计率/水平/趋势/状态；样本不足标 insufficient', () => {
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
  assert.ok(!rx.find(x => x.cat === '词性转换'));
  assert.equal(rx[0].cat, '介词');
});

/* ---- Task 6: errorBookClass / errorBookStudent ---- */
test('errorBookClass: 该卷全班正确率<50%的题号', () => {
  const rows = [
    mkRow('e1','s1',[36,37],[38]), mkRow('e1','s2',[36],[37,38]), mkRow('e1','s3',[36],[37,38]),
  ];
  const list = D.errorBookClass(rows, 'e1').map(x => x.no).sort((a,b)=>a-b);
  jeq(list, [37, 38]);
  const q37 = D.errorBookClass(rows, 'e1').find(x => x.no === 37);
  assert.ok(q37.classRate < 0.5 && q37.exam_id === 'e1');
});

test('errorBookStudent: 某生该卷做错的题号', () => {
  const out = D.errorBookStudent(mkRow('e1','s2',[36],[37,38]));
  jeq(out.map(x => x.no), [37, 38]);
  assert.equal(out[0].student_no, 's2');
  assert.equal(out[0].exam_id, 'e1');
});
