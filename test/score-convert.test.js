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
