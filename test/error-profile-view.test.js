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
