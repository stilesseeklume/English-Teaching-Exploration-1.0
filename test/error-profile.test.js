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
const w = loadWindow(['docs/grammar-fill/modules/error-profile.js']);
const { extractGrammarResults, buildErrorProfile } = w.GrammarErrorProfile;
const json = (v) => JSON.stringify(v);

test('extractGrammarResults: 每生每题分 对/错/缺考 三类（按表头定位，跳过非学生行）', () => {
  const rows = [
    ['序号','姓名','班级','学号','36','37','38'],
    ['','','','','得分','得分','得分'],
    ['1','张三','17班','2023531001','1.5','0.0','1.5'],   // 对36,38 错37
    ['2','李四','17班','2023531002','0.0','0.0','1.5'],   // 对38 错36,37
    ['','平均','','','1.0','0.5','1.5'],                  // 统计行→跳过
  ];
  const res = extractGrammarResults(rows, [36, 37, 38]);
  assert.equal(json(res.students), json([
    { studentNo: '2023531001', right: [36, 38], wrong: [37], blank: [] },
    { studentNo: '2023531002', right: [38], wrong: [36, 37], blank: [] },
  ]));
});

test('buildErrorProfile: 完整画像——每考点对错+正确率、每题对错、每生完整+错题集', () => {
  const studentResults = { students: [
    { studentNo: '2023531001', right: [36, 38], wrong: [37], blank: [] },
    { studentNo: '2023531002', right: [38], wrong: [36, 37], blank: [] },
  ]};
  const examQuestions = [
    { no: 36, category: 'preposition', fine_category: 'prep-common', answer: 'from' },
    { no: 37, category: 'number',      fine_category: 'num-plural',  answer: 'gestures' },
    { no: 38, category: 'word',        fine_category: 'word-adv',    answer: 'instantly' },
  ];
  const p = buildErrorProfile(studentResults, examQuestions);
  assert.equal(json(p.byCat), json({
    preposition: { right: 1, wrong: 1, rate: 50 },
    word:        { right: 2, wrong: 0, rate: 100 },
    number:      { right: 0, wrong: 2, rate: 0 },
  }));
  assert.equal(json(p.byNo), json({
    '36': { right: 1, wrong: 1, blank: 0 },
    '37': { right: 0, wrong: 2, blank: 0 },
    '38': { right: 2, wrong: 0, blank: 0 },
  }));
  assert.equal(json(p.students[0]), json({
    studentNo: '2023531001',
    right: [36, 38], wrong: [37], blank: [],
    wrongQuestions: [{ no: 37, category: 'number', fine_category: 'num-plural', answer: 'gestures' }],
  }));
});

test('正确率排除缺考：缺考计入 byNo.blank，但不进考点正确率分母', () => {
  const rows = [
    ['序号','姓名','班级','学号','36'],
    ['','','','','得分'],
    ['1','甲','17班','2023531001','1.5'],   // 对
    ['2','乙','17班','2023531002','0.0'],   // 错
    ['3','丙','17班','2023531003',''],      // 缺考
  ];
  const exam = [{ no: 36, category: 'preposition', answer: 'from' }];
  const p = buildErrorProfile(extractGrammarResults(rows, [36]), exam);
  assert.equal(json(p.byCat), json({ preposition: { right: 1, wrong: 1, rate: 50 } }));  // 丙缺考不计入分母
  assert.equal(json(p.byNo), json({ '36': { right: 1, wrong: 1, blank: 1 } }));          // 但缺考计入 byNo.blank
});

test('端到端：extract→build 用真实2026广州一模考点跑通（完整画像）', () => {
  // 真实 2026广州一模 语法填空考点（来自题库 data/grammar_bank.json，仅取 36/40/44）。
  // 第40题 value→valuing 是动名词同位语＝非谓语。
  const exam = [
    { no: 36, category: 'preposition',  answer: 'from' },
    { no: 40, category: 'nonpredicate', answer: 'valuing' },
    { no: 44, category: 'nonpredicate', answer: 'rooted' },
  ];
  const rows = [
    ['序号','姓名','班级','学号','36','40','44'],
    ['','','','','得分','得分','得分'],
    ['1','甲','17班','2023531001','0.0','0.0','1.5'],   // 对44 错36,40
    ['2','乙','17班','2023531002','1.5','0.0','0.0'],   // 对36 错40,44
  ];
  const p = buildErrorProfile(extractGrammarResults(rows, [36, 40, 44]), exam);
  assert.equal(json(p.byCat), json({
    nonpredicate: { right: 1, wrong: 3, rate: 25 },
    preposition:  { right: 1, wrong: 1, rate: 50 },
  }));
  // 甲的错题集：第36题(介词,from) 与 第40题(非谓语,valuing)
  assert.equal(json(p.students[0].wrongQuestions), json([
    { no: 36, category: 'preposition',  answer: 'from' },
    { no: 40, category: 'nonpredicate', answer: 'valuing' },
  ]));
});

test('extractGrammarResults: 整行空白（缺考/未作答）→ 全进 blank，不误判全错', () => {
  const rows = [
    ['序号','姓名','班级','学号','36','37'],
    ['','','','','得分','得分'],
    ['1','缺考生','17班','2023531009','',''],
  ];
  const res = extractGrammarResults(rows, [36, 37]);
  assert.equal(json(res.students), json([
    { studentNo: '2023531009', right: [], wrong: [], blank: [36, 37] },
  ]));
});
