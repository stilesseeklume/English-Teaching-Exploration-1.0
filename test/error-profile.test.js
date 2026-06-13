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

const { extractGrammarResults: _dup1, buildErrorProfile: _dup2, detectGrammarNos, alignExamQuestions } = w.GrammarErrorProfile;

test('detectGrammarNos: 按「满分1.5/题」认语填列（含全班错的0列），跳过非1.5题型与非题号列', () => {
  const rows = [
    ['序号','姓名','学号','36','37','38','39'],
    ['','','','得分','得分','得分','得分'],
    ['1','甲','2023531001','1.5','0.0','2.5','0.0'],
    ['2','乙','2023531002','0.0','1.5','0.0','0.0'],
    ['3','丙','2023531003','1.5','1.5','2.5','0.0'],
  ];
  assert.equal(JSON.stringify(detectGrammarNos(rows)), JSON.stringify([36, 37, 39]));
});

test('alignExamQuestions: 套卷语填题号按序重映射成成绩单检出的题号', () => {
  const exam = [
    { no: 1, category: 'preposition', fine_category: 'p', answer: 'from' },
    { no: 2, category: 'word', answer: 'instantly' },
    { no: 3, category: 'nonpredicate', answer: 'rooted' },
  ];
  const aligned = alignExamQuestions(exam, [36, 40, 44]);
  assert.equal(JSON.stringify(aligned), JSON.stringify([
    { no: 36, category: 'preposition', fine_category: 'p', answer: 'from' },
    { no: 40, category: 'word', fine_category: undefined, answer: 'instantly' },
    { no: 44, category: 'nonpredicate', fine_category: undefined, answer: 'rooted' },
  ]));
});

const { extractGrammarBlanks } = w.GrammarErrorProfile;

test('extractGrammarBlanks: 拍平 passages 的 blanks→按题号升序去重的语填题', () => {
  const passages = [
    { title: 'P1', blanks: [
      { no: 37, answer: 'instantly', category: 'word', fine_category: 'adv', analysis: 'x' },
      { no: 36, answer: 'from', category: 'preposition', analysis: 'y' },
    ] },
    { title: 'P2', blanks: [
      { no: 36, answer: 'DUP', category: 'word' },
      { no: 38, answer: 'rooted', category: 'nonpredicate' },
    ] },
  ];
  assert.equal(JSON.stringify(extractGrammarBlanks(passages)), JSON.stringify([
    { no: 36, category: 'preposition', answer: 'from', fine_category: undefined },
    { no: 37, category: 'word', answer: 'instantly', fine_category: 'adv' },
    { no: 38, category: 'nonpredicate', answer: 'rooted', fine_category: undefined },
  ]));
});

const { buildProfileFromExamRows } = w.GrammarErrorProfile;

test('buildProfileFromExamRows: 云端行重建班级画像(byCat正确率/byNo/students)', () => {
  const rows = [
    { student_no: 'S1', result: { right: [37], wrong: [36], blank: [], wrongQuestions: [{ no: 36, category: 'preposition', fine_category: null, answer: 'from' }], byCat: { preposition: { right: 0, wrong: 1 }, tense: { right: 1, wrong: 0 } } } },
    { student_no: 'S2', result: { right: [36, 37], wrong: [], blank: [], wrongQuestions: [], byCat: { preposition: { right: 1, wrong: 0 }, tense: { right: 1, wrong: 0 } } } },
  ];
  const p = buildProfileFromExamRows(rows);
  assert.equal(JSON.stringify(p.byCat), JSON.stringify({ preposition: { right: 1, wrong: 1, rate: 50 }, tense: { right: 2, wrong: 0, rate: 100 } }));
  assert.equal(JSON.stringify(p.byNo['36']), JSON.stringify({ right: 1, wrong: 1, blank: 0 }));
  assert.equal(p.students.length, 2);
  assert.equal(p.students[0].studentNo, 'S1');
  assert.equal(JSON.stringify(p.students[0].wrongQuestions), JSON.stringify([{ no: 36, category: 'preposition', fine_category: null, answer: 'from' }]));
});
