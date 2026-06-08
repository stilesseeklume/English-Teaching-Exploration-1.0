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
const { profilePageHtml, uploadPanelHtml } = w.GrammarErrorProfileRender;

test('uploadPanelHtml: 列出套卷下拉 + 文件输入', () => {
  const html = uploadPanelHtml([{ examId: '2026广州一模', label: '2026 广州一模' }]);
  assert.ok(html.includes('2026 广州一模'), '应含套卷标签');
  assert.ok(html.includes('errorProfileExam'), '应含套卷下拉 id');
  assert.ok(html.includes('errorProfileFile'), '应含文件输入 id');
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
