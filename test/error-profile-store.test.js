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
const w = loadWindow(['docs/grammar-fill/modules/error-profile-store.js']);
const { upsertEntry, removeEntry, getEntry, buildBoardModel } = w.GrammarErrorProfileStore;
const json = (v) => JSON.stringify(v);

const E = (examId, savedAt, focus) => ({
  id: examId, examId, examLabel: examId, savedAt, savedAtText: 't' + savedAt,
  summary: { studentCount: 48, questionCount: 10, focusCount: focus }, profile: { byCat: {}, byNo: {}, students: [] },
});

test('upsertEntry: 同 examId 覆盖，不同则追加', () => {
  let list = [];
  list = upsertEntry(list, E('2026广州一模', 100, 6));
  list = upsertEntry(list, E('2026深圳一模', 200, 4));
  list = upsertEntry(list, E('2026广州一模', 300, 5));   // 覆盖广州那条
  assert.equal(list.length, 2);
  assert.equal(getEntry(list, '2026广州一模').summary.focusCount, 5);
  assert.equal(getEntry(list, '2026深圳一模').savedAt, 200);
});

test('removeEntry: 按 id 删', () => {
  const list = [E('A', 1, 1), E('B', 2, 2)];
  const next = removeEntry(list, 'A');
  assert.equal(next.length, 1);
  assert.equal(next[0].id, 'B');
});

test('buildBoardModel: 按 savedAt 倒序 + 投影出列表项', () => {
  const list = [E('A', 100, 3), E('B', 300, 5), E('C', 200, 1)];
  const model = buildBoardModel(list);
  assert.equal(json(model), json([
    { id: 'B', examId: 'B', examLabel: 'B', savedAtText: 't300', studentCount: 48, focusCount: 5 },
    { id: 'C', examId: 'C', examLabel: 'C', savedAtText: 't200', studentCount: 48, focusCount: 1 },
    { id: 'A', examId: 'A', examLabel: 'A', savedAtText: 't100', studentCount: 48, focusCount: 3 },
  ]));
});
