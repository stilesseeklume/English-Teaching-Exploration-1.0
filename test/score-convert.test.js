import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  detectSections, parseExamScores, buildStudentRows,
  parseSpeakingInput, mergeSpeaking, toTable, toTSV, toCSV,
} from '../docs/score-analysis/score-convert.js';

// 小题分表夹具：阅读3题(2.5) 七选2题(2.5,含G/E) 完形2题(1.0) 语法2题(1.5) 应用文 续写
export const H0 = ['序号','姓名','班级','学号','考号','总分',
  '21（答案C）','','22（答案A）','','23（答案B）','',
  '36（答案G）','','37（答案E）','',
  '41（答案B）','','42（答案C）','',
  '56','57','66','67'];
export const H1 = ['','','','','','',
  '得分','作答','得分','作答','得分','作答',
  '得分','作答','得分','作答',
  '得分','作答','得分','作答',
  '得分','得分','得分','得分'];
// 张三 学号1001：阅读5/七选5/完形1/语法3/应用文12/续写16 = 客观14 主观28 总分42
export const ROW_A = [1,'张三','2023级15班','1001','1001',42,
  2.5,'',2.5,'',0,'', 2.5,'',2.5,'', 1.0,'',0,'', 1.5,1.5, 12,16];
// 李四 学号1002：阅读5/七选2.5/完形2/语法1.5/应用文9/续写20 = 客观11 主观29 总分40
export const ROW_B = [2,'李四','2023级15班','1002','1002',40,
  2.5,'',0,'',2.5,'', 0,'',2.5,'', 1.0,'',1.0,'', 0,1.5, 9,20];
export const DATA = [ROW_A, ROW_B];

// 考生成绩-英语表夹具（用于合并排名/档次）
export const EXAM_H = ['姓名','班级','学号','考号','班内学号（座位号）','学籍号','得分','年级排名','班级排名','档次'];
export const EXAM_ROWS = [
  ['张三','2023级15班','1001','1001','-','-',42,32,1,'A+'],
  ['李四','2023级15班','1002','1002','-','-',40,55,2,'A'],
];

test('detectSections 划分六板块并判定 scope=120', () => {
  const d = detectSections(H0, H1, DATA);
  assert.equal(d.scope, 120);
  const byName = Object.fromEntries(d.sections.map(s => [s.name, s]));
  assert.deepEqual(byName['阅读理解'].cols, [6, 8, 10]);
  assert.deepEqual(byName['七选五'].cols, [12, 14]);
  assert.deepEqual(byName['完形填空'].cols, [16, 18]);
  assert.deepEqual(byName['语法填空'].cols, [20, 21]);
  assert.deepEqual(byName['应用文'].cols, [22]);
  assert.deepEqual(byName['续写'].cols, [23]);
  assert.equal(byName['阅读理解'].kind, 'objective');
  assert.equal(byName['应用文'].kind, 'subjective');
  assert.deepEqual(d.meta, { nameCol: 1, clsCol: 2, idCol: 3, totalCol: 5 });
});

test('detectSections 无作文则 scope=80', () => {
  const h0 = H0.slice(0, 22);   // 去掉 66/67 两列
  const h1 = H1.slice(0, 22);
  const data = DATA.map(r => r.slice(0, 22));
  const d = detectSections(h0, h1, data);
  assert.equal(d.scope, 80);
  assert.ok(!d.sections.some(s => s.name === '应用文' || s.name === '续写'));
  assert.ok(d.sections.some(s => s.name === '语法填空'));
});

test('parseExamScores 学号→排名档次', () => {
  const m = parseExamScores(EXAM_H, EXAM_ROWS);
  assert.deepEqual(m['1001'], { gradeRank: 32, classRank: 1, tier: 'A+' });
  assert.deepEqual(m['1002'], { gradeRank: 55, classRank: 2, tier: 'A' });
});

test('buildStudentRows 归并六板块 + 客观/主观 + 折算130 + 合并排名', () => {
  const d = detectSections(H0, H1, DATA);
  const exam = parseExamScores(EXAM_H, EXAM_ROWS);
  const rows = buildStudentRows(DATA, d, exam);
  const a = rows[0];
  assert.equal(a.name, '张三');
  assert.equal(a.id, '1001');
  assert.equal(a.sections['阅读理解'], 5);
  assert.equal(a.sections['七选五'], 5);
  assert.equal(a.sections['完形填空'], 1);
  assert.equal(a.sections['语法填空'], 3);
  assert.equal(a.sections['应用文'], 12);
  assert.equal(a.sections['续写'], 16);
  assert.equal(a.objective, 14);
  assert.equal(a.subjective, 28);
  assert.equal(a.total120, 42);
  assert.equal(a.converted130, 45.5);   // 42*130/120
  assert.equal(a.gradeRank, 32);
  assert.equal(a.classRank, 1);
  assert.equal(a.tier, 'A+');
  assert.equal(a.warn, false);
});

test('buildStudentRows 总分对不上时标 warn', () => {
  const bad = ROW_A.slice();
  bad[5] = 99;                       // 总分列与板块之和(42)不符
  const d = detectSections(H0, H1, DATA);
  const rows = buildStudentRows([bad], d, {});
  assert.equal(rows[0].warn, true);
  assert.equal(rows[0].reportedTotal, 99);
});

test('buildStudentRows 在 80 分卷不产出折算', () => {
  const h0 = H0.slice(0, 22), h1 = H1.slice(0, 22);
  const data = DATA.map(r => r.slice(0, 22));
  const d = detectSections(h0, h1, data);
  const rows = buildStudentRows(data, d, {});
  assert.equal(rows[0].converted130, null);
  assert.equal(rows[0].subjective, null);
});

test('parseSpeakingInput 解析「学号 分数」文本，跳过表头', () => {
  const txt = '学号\t听说\n1001\t18\n1002, 15.5\n';
  const m = parseSpeakingInput(txt);
  assert.equal(m['1001'], 18);
  assert.equal(m['1002'], 15.5);
});

test('mergeSpeaking 按学号补出听说与总分150', () => {
  const d = detectSections(H0, H1, DATA);
  const rows = buildStudentRows(DATA, d, {});
  const res = mergeSpeaking(rows, { '1001': 18 });
  assert.equal(res.matched, 1);
  assert.equal(res.unmatched, 1);
  assert.equal(rows[0].listening, 18);
  assert.equal(rows[0].total150, 63.5);   // 45.5 + 18
  assert.equal(rows[1].listening, null);
  assert.equal(rows[1].total150, null);
});

test('toTable 列随 scope/听说 伸缩', () => {
  const d = detectSections(H0, H1, DATA);
  const rows = buildStudentRows(DATA, d, parseExamScores(EXAM_H, EXAM_ROWS));
  mergeSpeaking(rows, { '1001': 18 });
  const t = toTable(rows, d, { hasSpeaking: true });
  assert.deepEqual(t.columns, [
    '姓名','班级','学号','年级排名','班级排名','档次',
    '阅读理解','七选五','完形填空','语法填空','应用文','续写',
    '客观题(80)','主观题(40)','总分(120)','折算(130)','听说(20)','总分(150)',
  ]);
  assert.equal(t.data[0][0], '张三');
  assert.equal(t.data[0][t.columns.indexOf('折算(130)')], 45.5);
  assert.equal(t.data[0][t.columns.indexOf('总分(150)')], 63.5);
});

test('toTable 80 分卷去掉作文/折算/听说列', () => {
  const h0 = H0.slice(0, 22), h1 = H1.slice(0, 22);
  const data = DATA.map(r => r.slice(0, 22));
  const d = detectSections(h0, h1, data);
  const rows = buildStudentRows(data, d, {});
  const t = toTable(rows, d, { hasSpeaking: false });
  assert.ok(!t.columns.includes('主观题(40)'));
  assert.ok(!t.columns.includes('折算(130)'));
  assert.ok(!t.columns.includes('应用文'));
  assert.ok(t.columns.includes('客观题(80)'));
});

test('toTSV / toCSV 序列化', () => {
  const t = { columns: ['姓名', '总分(120)'], data: [['张三', 42], ['李,四', 40]] };
  assert.equal(toTSV(t), '姓名\t总分(120)\n张三\t42\n李,四\t40');
  assert.equal(toCSV(t), '姓名,总分(120)\n张三,42\n"李,四",40');
});
