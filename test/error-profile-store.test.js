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
const { upsertEntry, removeEntry, getEntry, buildBoardModel, addClass, removeClass, renameClass, buildClassListModel } = w.GrammarErrorProfileStore;
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

test('班级 CRUD: add / rename / remove', () => {
  let cs = [];
  cs = addClass(cs, { id: 'c1', name: '高三①班' });
  cs = addClass(cs, { id: 'c2', name: '高三②班' });
  cs = renameClass(cs, 'c1', '高三1班');
  assert.equal(json(cs), json([{ id: 'c1', name: '高三1班' }, { id: 'c2', name: '高三②班' }]));
  cs = removeClass(cs, 'c2');
  assert.equal(json(cs), json([{ id: 'c1', name: '高三1班' }]));
});

test('buildClassListModel: 每班带画像数', () => {
  const classes = [{ id: 'c1', name: 'A班' }, { id: 'c2', name: 'B班' }];
  const profiles = [{ id: 'c1__e1', classId: 'c1' }, { id: 'c1__e2', classId: 'c1' }, { id: 'c2__e1', classId: 'c2' }];
  assert.equal(json(buildClassListModel(classes, profiles)), json([
    { id: 'c1', name: 'A班', count: 2 }, { id: 'c2', name: 'B班', count: 1 },
  ]));
});

test('buildBoardModel: classId 过滤只取该班；同卷不同班不互相覆盖', () => {
  let list = [];
  list = upsertEntry(list, { id: 'c1__A', classId: 'c1', examId: 'A', examLabel: 'A卷', savedAt: 100, summary: { studentCount: 40, focusCount: 3 } });
  list = upsertEntry(list, { id: 'c2__A', classId: 'c2', examId: 'A', examLabel: 'A卷', savedAt: 200, summary: { studentCount: 30, focusCount: 1 } });
  assert.equal(list.length, 2);
  const m = buildBoardModel(list, 'c1');
  assert.equal(m.length, 1);
  assert.equal(m[0].id, 'c1__A');
  assert.equal(m[0].classId, 'c1');
});
