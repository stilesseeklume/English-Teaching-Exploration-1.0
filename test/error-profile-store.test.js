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
const { upsertEntry, removeEntry, getEntry, buildBoardModel, addClass, removeClass, renameClass, buildClassListModel, addStudentsToClass, removeStudentFromClass, buildClassList } = w.GrammarErrorProfileStore;
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

test('renameClass: 改名保留 students 等其它字段（不再把名单清掉）', () => {
  const cs = [{ id: 'c1', name: '高三①班', students: ['S1', 'S2'] }, { id: 'c2', name: '高三②班' }];
  const next = renameClass(cs, 'c1', '高三1班');
  assert.equal(json(next), json([
    { id: 'c1', name: '高三1班', students: ['S1', 'S2'] },
    { id: 'c2', name: '高三②班' },
  ]));
});

test('addStudentsToClass: 追加去重保序，只动目标班', () => {
  const cs = [{ id: 'c1', name: 'A班', students: ['S1'] }, { id: 'c2', name: 'B班' }];
  const next = addStudentsToClass(cs, 'c1', ['S2', 'S1', 'S3', '']);   // S1 已在→不重复，空串忽略
  assert.equal(json(next), json([
    { id: 'c1', name: 'A班', students: ['S1', 'S2', 'S3'] },
    { id: 'c2', name: 'B班' },
  ]));
});

test('addStudentsToClass: 目标班还没有 students 时也能建起来', () => {
  const next = addStudentsToClass([{ id: 'c1', name: 'A班' }], 'c1', ['S1', 'S2']);
  assert.equal(json(next), json([{ id: 'c1', name: 'A班', students: ['S1', 'S2'] }]));
});

test('removeStudentFromClass: 按学号移除，其它字段与其它班不动', () => {
  const cs = [{ id: 'c1', name: 'A班', students: ['S1', 'S2', 'S3'] }, { id: 'c2', name: 'B班', students: ['S1'] }];
  const next = removeStudentFromClass(cs, 'c1', 'S2');
  assert.equal(json(next), json([
    { id: 'c1', name: 'A班', students: ['S1', 'S3'] },
    { id: 'c2', name: 'B班', students: ['S1'] },
  ]));
});

test('buildClassList: 人数=名单∪成绩（修两页 0 vs 40 口径不同步）', () => {
  const rows = [
    { class_id: 'c1', class_name: '高三①班', student_no: 'S1' },
    { class_id: 'c1', class_name: '高三①班', student_no: 'S2' },
  ];
  const local = [
    { id: 'c1', name: '高三①班', students: ['S2', 'S3'] },       // S2 重叠、S3 仅名单
    { id: 'cDemo', name: '演示班级', students: ['m1', 'm2', 'm3'] }, // 纯名单、无成绩
  ];
  const list = buildClassList(rows, local);
  const byId = {}; list.forEach((c) => { byId[c.id] = c; });
  assert.equal(byId.c1.count, 3);        // S1,S2,S3 并集
  assert.equal(byId.cDemo.count, 3);     // 纯名单也算 3（不再是 0）
  assert.equal(byId.c1.name, '高三①班');
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
