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
const w = loadWindow(['docs/grammar-fill/modules/student-tracking.js']);
const { extractStudentRoster, buildExamResultRows, buildStudentTimeline, resolveStudentName } = w.GrammarStudentTracking;

test('extractStudentRoster: 读学号+姓名列，跳过非学生行', () => {
  const rows = [
    ['序号', '姓名', '学号', '36'],
    ['', '', '', ''],
    ['1', '张三', '2023531001', '1.5'],
    ['2', '李四', '2023531002', '0'],
  ];
  assert.equal(JSON.stringify(extractStudentRoster(rows)), JSON.stringify([
    { studentNo: '2023531001', name: '张三' },
    { studentNo: '2023531002', name: '李四' },
  ]));
});

test('buildExamResultRows: 每生一行；byCat 错用 wrongQuestions、对用 examForBuild', () => {
  const profile = { students: [
    { studentNo: '2023531001', right: [37], wrong: [36], blank: [],
      wrongQuestions: [{ no: 36, category: 'preposition', fine_category: null, answer: 'from' }] },
  ] };
  const examForBuild = [
    { no: 36, category: 'preposition', answer: 'from' },
    { no: 37, category: 'tense', answer: 'has gone' },
  ];
  const rows = buildExamResultRows(profile, examForBuild, { classId: 'cls_1', className: '高三①班', examId: 'e1', examLabel: '一模', examDate: '2026-03-01' });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].client_id, 'cls_1__e1__2023531001');
  assert.equal(rows[0].class_id, 'cls_1');
  assert.equal(rows[0].student_no, '2023531001');
  assert.equal(JSON.stringify(rows[0].result.byCat), JSON.stringify({ preposition: { right: 0, wrong: 1 }, tense: { right: 1, wrong: 0 } }));
});

test('buildStudentTimeline: 同一学号跨卷聚合，weakCats 按错次降序、exams 按日期升序', () => {
  const rows = [
    { student_no: 'S1', exam_id: 'e2', exam_label: '二模', exam_date: '2026-04-01',
      result: { right: [], wrong: [36], blank: [], wrongQuestions: [{ no: 36, category: 'tense' }], byCat: { tense: { right: 0, wrong: 1 } } } },
    { student_no: 'S1', exam_id: 'e1', exam_label: '一模', exam_date: '2026-03-01',
      result: { right: [], wrong: [38], blank: [], wrongQuestions: [], byCat: { tense: { right: 1, wrong: 1 }, preposition: { right: 0, wrong: 1 } } } },
  ];
  const tl = buildStudentTimeline(rows);
  assert.equal(tl.length, 1);
  assert.equal(tl[0].studentNo, 'S1');
  assert.equal(JSON.stringify(tl[0].exams.map((e) => e.examLabel)), JSON.stringify(['一模', '二模']));
  assert.equal(JSON.stringify(tl[0].weakCats), JSON.stringify([
    { category: 'tense', right: 1, wrong: 2 },
    { category: 'preposition', right: 0, wrong: 1 },
  ]));
});

test('resolveStudentName: 本地有则名、无则回退学号', () => {
  assert.equal(resolveStudentName({ '2023531001': '张三' }, '2023531001'), '张三');
  assert.equal(resolveStudentName({}, '2023531002'), '2023531002');
});

test('buildExamResultRows: 行里绝不含姓名（隐私红线）', () => {
  const profile = { students: [{ studentNo: 'S1', right: [], wrong: [36], blank: [], wrongQuestions: [{ no: 36, category: 'tense' }] }] };
  const rows = buildExamResultRows(profile, [], { classId: 'c', examId: 'e' });
  const allowed = ['client_id', 'class_id', 'class_name', 'exam_id', 'exam_label', 'exam_date', 'student_no', 'result'];
  Object.keys(rows[0]).forEach((k) => assert.ok(allowed.includes(k), '意外字段(疑似姓名): ' + k));
  assert.ok(!JSON.stringify(rows).includes('"name"'), '行 JSON 不应有 name 键（class_name 不算）');
});
