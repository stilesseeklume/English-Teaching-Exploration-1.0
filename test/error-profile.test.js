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

test('extractGrammarResults: 按表头定位学号与36-45列，得分0=错，跳过非学生行', () => {
  const rows = [
    ['序号','姓名','班级','学号','36','37','38'],          // 表头（简化：语填只放 36-38）
    ['','','','','得分','得分','得分'],                     // 子表头（学号列为空→跳过）
    ['1','张三','17班','2023531001','1.5','0.0','1.5'],     // 张三 错 37
    ['2','李四','17班','2023531002','0.0','0.0','1.5'],     // 李四 错 36,37
    ['','平均','','','1.0','0.5','1.5'],                    // 统计行（无学号）→跳过
  ];
  const res = extractGrammarResults(rows, [36, 37, 38]);
  assert.equal(json(res.students), json([
    { studentNo: '2023531001', wrong: [37] },
    { studentNo: '2023531002', wrong: [36, 37] },
  ]));
});

test('buildErrorProfile: 题号→考点匹配，出班级画像+个人弱项+题级错题集', () => {
  const studentResults = { students: [
    { studentNo: '2023531001', wrong: [37] },
    { studentNo: '2023531002', wrong: [36, 37] },
  ]};
  const examQuestions = [
    { no: 36, category: 'preposition', fine_category: 'prep-common', answer: 'from' },
    { no: 37, category: 'number',      fine_category: 'num-plural',  answer: 'gestures' },
    { no: 38, category: 'word',        fine_category: 'word-adv',    answer: 'instantly' },
  ];
  const p = buildErrorProfile(studentResults, examQuestions);
  assert.equal(json(p.classByCat), json({ number: 2, preposition: 1 }));
  assert.equal(json(p.classByNo), json({ '37': 2, '36': 1 }));
  assert.equal(json(p.students[0]), json({
    studentNo: '2023531001',
    wrongCats: ['number'],
    wrongQuestions: [{ no: 37, category: 'number', fine_category: 'num-plural', answer: 'gestures' }],
  }));
});
