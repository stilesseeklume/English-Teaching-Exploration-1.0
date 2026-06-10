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
const w = loadWindow(['docs/grammar-fill/modules/error-profile-render.js']);
w.escapeHtml = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const { profilePageHtml, uploadPanelHtml, boardListHtml, studentTimelineHtml } = w.GrammarErrorProfileRender;

test('studentTimelineHtml: 本地显名 + 弱考点 + 每卷对错', () => {
  const timeline = [
    { studentNo: '2023531001', exams: [
        { examLabel: '一模', examDate: '2026-03-01', rightCount: 8, wrongCount: 2, blankCount: 0, wrongQuestions: [] },
      ],
      weakCats: [{ category: 'tense', right: 1, wrong: 2 }] },
  ];
  const html = studentTimelineHtml(timeline, { '2023531001': '张三' });
  assert.ok(html.includes('张三'), '应本地显名');
  assert.ok(!html.includes('2023531001'), '不应暴露学号(有名时)');
  assert.ok(html.includes('一模'), '应列卷子');
  assert.ok(html.includes('tense'), '应显示弱考点');
});

test('uploadPanelHtml: 套卷+成绩两个拖拽框 + 题库下拉 + 两个隐藏文件输入', () => {
  const html = uploadPanelHtml([{ examId: '2026广州一模', label: '2026 广州一模' }]);
  assert.ok(html.includes('2026 广州一模'), '应含题库套卷标签');
  assert.ok(html.includes('id="errorExamDrop"'), '应含套卷拖拽区 id');
  assert.ok(html.includes('id="errorScoreDrop"'), '应含成绩拖拽区 id');
  assert.ok(html.includes('把套卷 Word 拖进来'), '应含套卷拖拽提示');
  assert.ok(html.includes('把网阅成绩 .xls 拖进来'), '应含成绩拖拽提示');
  assert.ok(html.includes('class="docx-dropzone"'), '应复用备课 docx-dropzone 样式');
  assert.ok(html.includes('id="errorExamFile"'), '应含套卷隐藏文件输入');
  assert.ok(html.includes('id="errorProfileFile"'), '应含成绩隐藏文件输入');
  assert.ok(html.includes('id="errorProfileExam"'), '应含题库下拉 id');
});

test('profilePageHtml: 含考点排行+正确率+优先级标签+学生学号', () => {
  const vm = {
    catRanking: [
      { category: 'nonpredicate', categoryName: '非谓语', right: 2, wrong: 8, rate: 20, priority: 'focus' },
      { category: 'preposition',  categoryName: '介词',   right: 8, wrong: 2, rate: 80, priority: 'watch' },
    ],
    noList: [{ no: 36, right: 8, wrong: 2, blank: 0 }],
    students: [{ studentNo: '2023531001', rightCount: 1, wrongCount: 1, blankCount: 0, wrongQuestions: [{ no: 40, category: 'nonpredicate', answer: 'valuing' }] }],
    summary: { studentCount: 2, questionCount: 1, focusCount: 1 },
  };
  const html = profilePageHtml(vm);
  assert.ok(html.includes('非谓语'), '含考点名');
  assert.ok(html.includes('20%'), '含正确率');
  assert.ok(html.includes('重点讲'), '含 focus 优先级标签');
  assert.ok(html.includes('2023531001'), '含学生学号');
  assert.ok(html.includes('valuing'), '含错题答案');
});

test('boardListHtml: 空→提示；有→卷名/计数/看画像/删 按钮带 data-id', () => {
  assert.ok(boardListHtml([]).includes('还没有导入的卷子'), '空态提示');
  const html = boardListHtml([
    { id: '2026广州一模', examId: '2026广州一模', examLabel: '2026广州一模', savedAtText: '6/9 12:00', studentCount: 48, focusCount: 6 },
  ]);
  assert.ok(html.includes('2026广州一模'), '含卷名');
  assert.ok(html.includes('48 生'), '含人数');
  assert.ok(html.includes('重点讲 6'), '含重点考点数');
  assert.ok(html.includes('data-id="2026广州一模"'), '含 data-id');
  assert.ok(html.includes('ep-board-view') && html.includes('ep-board-del'), '含看/删按钮 class');
});
