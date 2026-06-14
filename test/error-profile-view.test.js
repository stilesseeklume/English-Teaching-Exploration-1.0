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
const w = loadWindow(['docs/grammar-fill/modules/error-profile-view.js']);
const { buildProfileViewModel, teachPriority } = w.GrammarErrorProfileView;
const json = (v) => JSON.stringify(v);

test('teachPriority: 全对→skip，低正确率→focus，中→watch，高→skip', () => {
  assert.equal(teachPriority(100, 0), 'skip');
  assert.equal(teachPriority(40, 3), 'focus');
  assert.equal(teachPriority(70, 2), 'watch');
  assert.equal(teachPriority(90, 1), 'skip');
  assert.equal(teachPriority(null, 0), 'skip');
});

test('buildProfileViewModel: 考点排行(差的在前)+优先级、题表、学生(错多在前)、汇总', () => {
  const profile = {
    byCat: {
      preposition:  { right: 8, wrong: 2, rate: 80 },
      nonpredicate: { right: 2, wrong: 8, rate: 20 },
    },
    byNo: { '40': { right: 2, wrong: 8, blank: 0 }, '36': { right: 8, wrong: 2, blank: 0 } },
    students: [
      { studentNo: '2023531001', right: [36], wrong: [40], blank: [], wrongQuestions: [{ no: 40, category: 'nonpredicate', answer: 'valuing' }] },
      { studentNo: '2023531002', right: [36, 40], wrong: [], blank: [], wrongQuestions: [] },
    ],
  };
  const catNames = { preposition: '介词', nonpredicate: '非谓语' };
  const vm = buildProfileViewModel(profile, catNames);
  assert.equal(json(vm.catRanking), json([
    { category: 'nonpredicate', categoryName: '非谓语', right: 2, wrong: 8, rate: 20, priority: 'focus' },
    { category: 'preposition',  categoryName: '介词',   right: 8, wrong: 2, rate: 80, priority: 'watch' },
  ]));
  assert.equal(json(vm.noList), json([
    { no: 36, right: 8, wrong: 2, blank: 0 },
    { no: 40, right: 2, wrong: 8, blank: 0 },
  ]));
  assert.equal(json(vm.students), json([
    { studentNo: '2023531001', rightCount: 1, wrongCount: 1, blankCount: 0, wrongQuestions: [{ no: 40, category: 'nonpredicate', answer: 'valuing' }] },
    { studentNo: '2023531002', rightCount: 2, wrongCount: 0, blankCount: 0, wrongQuestions: [] },
  ]));
  assert.equal(json(vm.summary), json({ studentCount: 2, questionCount: 2, focusCount: 1 }));
});

const { buildCatTrends } = w.GrammarErrorProfileView;

test('buildCatTrends: 跨卷考点趋势(按最新正确率升序,含变化量与缺卷null)', () => {
  const exams = [
    { examLabel: '一模', examDate: '2026-01-01', byCat: { tense: { right: 4, wrong: 6, rate: 40 }, article: { right: 9, wrong: 1, rate: 90 } } },
    { examLabel: '二模', examDate: '2026-02-01', byCat: { tense: { right: 6, wrong: 4, rate: 60 } } },
  ];
  const t = buildCatTrends(exams);
  const byCat = {}; t.forEach((x) => { byCat[x.category] = x; });
  assert.equal(t[0].category, 'tense');
  assert.equal(byCat.tense.latestRate, 60);
  assert.equal(byCat.tense.firstRate, 40);
  assert.equal(byCat.tense.delta, 20);
  assert.equal(json(byCat.tense.series.map((p) => p.rate)), json([40, 60]));
  assert.equal(json(byCat.article.series.map((p) => p.rate)), json([90, null]));
});

const { buildStudentProfileVM } = w.GrammarErrorProfileView;

test('buildStudentProfileVM: 每卷正确率序列 + 弱项考点带 rate + 最近正确率', () => {
  const st = {
    studentNo: 'S1',
    exams: [
      { examLabel: '一模', rightCount: 4, wrongCount: 6, blankCount: 0 },
      { examLabel: '二模', rightCount: 7, wrongCount: 3, blankCount: 0 },
    ],
    weakCats: [{ category: 'tense', right: 2, wrong: 6 }],
    missedCount: 1,
  };
  const vm = buildStudentProfileVM(st, { tense: '谓语动词' });
  assert.equal(vm.rateSeries.length, 2);
  assert.equal(vm.rateSeries[0].rate, 40, '一模 4/10=40%');
  assert.equal(vm.rateSeries[1].rate, 70, '二模 7/10=70%');
  assert.equal(vm.latestRate, 70, '最近=最后一卷');
  assert.equal(vm.weakCats[0].categoryName, '谓语动词', '考点名解析');
  assert.equal(vm.weakCats[0].rate, 25, '2/(2+6)=25%');
  assert.equal(vm.missedCount, 1);
  assert.equal(vm.examCount, 2);
});

test('buildStudentProfileVM: 全缺考卷 rate=null 且不计入 latestRate', () => {
  const st = { studentNo: 'S1', exams: [{ examLabel: '一模', rightCount: 0, wrongCount: 0, blankCount: 10 }], weakCats: [], missedCount: 0 };
  const vm = buildStudentProfileVM(st, {});
  assert.equal(vm.rateSeries[0].rate, null, '全缺考→null');
  assert.equal(vm.latestRate, null, '无有效卷→null');
});
