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
const w = loadWindow(['docs/grammar-fill/modules/migration-training.js']);
const { buildMigrationData } = w.GrammarMigrationTraining;

// 班级工作台「弱项一键迁移」的底层机制：用一个只带 fine_category 的【合成源题】
// 喂 buildMigrationData，让它按该 fine_tag 从题库筛出同类题（app.js openMigrationDrawerForTag 用此）。
// 这些用例锁住「合成源题能命中迁移引擎」——零改 migration-training.js。
// type:'真题' 必需 —— selectSourcePool('bank') 会 filter(isRealQuestion)，无 type 会被全过滤。
const bank = [
  { exam: '2024一模', no: 1, type: '真题', fine_category: 'word-comparative', category: 'word', answer: 'better' },
  { exam: '2024二模', no: 2, type: '真题', fine_category: 'word-comparative', category: 'word', answer: 'best' },
  { exam: '2024三模', no: 3, type: '真题', fine_category: 'pred-tense', category: 'predicate', answer: 'gone' },
  { exam: '2024三模', no: 4, type: '真题', fine_category: 'prep-common', category: 'preposition', answer: 'from' },
];

test('合成源题{fine_category} → 只筛出同 fine_tag 的题（poolCount 准、不串类）', () => {
  const synthQ = { fine_category: 'word-comparative', category: 'word', no: 0, exam: '__profile__' };
  const data = buildMigrationData(synthQ, { source: 'bank', bankQuestions: bank, limit: 9999 });
  assert.equal(data.poolCount, 2);
  assert.ok(data.migration.length >= 1);
  assert.ok(data.migration.every((e) => e.item.fine_category === 'word-comparative'));
  assert.equal(data.emptyState, null);
});

test('合成源题精确到单考点：prep-common 只命中那一题', () => {
  const synthQ = { fine_category: 'prep-common', category: 'preposition', no: 0, exam: '__profile__' };
  const data = buildMigrationData(synthQ, { source: 'bank', bankQuestions: bank, limit: 9999 });
  assert.equal(data.poolCount, 1);
  assert.equal(data.migration[0].item.no, 4);
});

test('题库无该 fine_tag → 空池 emptyState（老数据降级考点的兜底，不报错）', () => {
  const synthQ = { fine_category: 'special-subjunctive', category: 'special', no: 0, exam: '__profile__' };
  const data = buildMigrationData(synthQ, { source: 'bank', bankQuestions: bank, limit: 9999 });
  assert.equal(data.poolCount, 0);
  assert.ok(data.emptyState);
});
