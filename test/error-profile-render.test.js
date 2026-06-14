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

test('studentTimelineHtml: 名单里没成绩的学生显示「暂无成绩」+ 缺考徽章', () => {
  const timeline = [
    { studentNo: 'S2', exams: [], weakCats: [], examCount: 0, missedCount: 1 },
  ];
  const html = studentTimelineHtml(timeline, { S2: '李四' });
  assert.ok(html.includes('李四'), '应显名');
  assert.ok(html.includes('暂无成绩'), '无成绩应标暂无成绩');
  assert.ok(html.includes('缺考 1'), '应显示缺考次数');
});

test('uploadPanelHtml: 套卷+成绩两个拖拽框 + 题库下拉 + 两个隐藏文件输入', () => {
  const html = uploadPanelHtml([{ examId: '2026广州一模', label: '2026 广州一模' }]);
  assert.ok(html.includes('2026 广州一模'), '应含题库套卷标签');
  assert.ok(html.includes('id="errorExamDrop"'), '应含套卷拖拽区 id');
  assert.ok(html.includes('id="errorScoreDrop"'), '应含成绩拖拽区 id');
  assert.ok(html.includes('套卷 Word 拖进来'), '应含套卷拖拽提示');
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

const { examChipsHtml, catTrendHtml } = w.GrammarErrorProfileRender;

test('examChipsHtml: 时间 chips + 选中高亮 + 重点讲红点', () => {
  const html = examChipsHtml([{ id: 'e1', examLabel: '一模', focusCount: 2 }, { id: 'e2', examLabel: '二模', focusCount: 0 }], 'e2');
  assert.ok(html.includes('class="ep-exam-chip"'), '应是 chip');
  assert.ok(html.includes('一模') && html.includes('二模'), '应列两套');
  assert.ok(html.includes('●2'), '一模重点讲红点');
});

test('catTrendHtml: 趋势行含考点名 + sparkline svg + 最新正确率 + 箭头', () => {
  const trends = [{ category: 'tense', series: [{ rate: 40 }, { rate: 60 }], latestRate: 60, firstRate: 40, delta: 20 }];
  const html = catTrendHtml(trends, { tense: '谓语动词' });
  assert.ok(html.includes('谓语动词'), '中文考点名');
  assert.ok(html.includes('<svg'), 'sparkline');
  assert.ok(html.includes('60%'), '最新正确率');
  assert.ok(html.includes('↑20'), '上升箭头');
});

const { studentSearchBoxHtml, studentMatchListHtml, studentProfileHtml, catTrendDetailsHtml } = w.GrammarErrorProfileRender;

test('catRankingHtml 行内趋势：传 trendByCat 时每行含迷你 sparkline + 升降箭头', () => {
  const vm = {
    summary: { studentCount: 10, questionCount: 10, focusCount: 1 },
    catRanking: [{ category: 'tense', categoryName: '谓语动词', right: 2, wrong: 8, rate: 20, priority: 'focus' }],
    noList: [], students: [],
  };
  const html = profilePageHtml(vm, { tense: { series: [{ rate: 10 }, { rate: 20 }], delta: 10 } });
  assert.ok(html.includes('谓语动词'), '考点名');
  assert.ok(html.includes('20%'), '当前正确率');
  assert.ok(html.includes('<svg'), '行内迷你趋势线');
  assert.ok(html.includes('↑10'), '升箭头');
  assert.ok(html.includes('重点讲'), '优先级标签');
});

test('profilePageHtml 不传 trendByCat 时不渲染 svg（向后兼容）', () => {
  const vm = { summary: {}, catRanking: [{ category: 't', categoryName: '时态', right: 1, wrong: 1, rate: 50, priority: 'watch' }], noList: [], students: [] };
  const html = profilePageHtml(vm);
  assert.ok(html.includes('时态'), '考点名');
  assert.ok(!html.includes('<svg'), '无趋势数据不出 sparkline');
});

test('studentSearchBoxHtml: 搜索框 + 人数 + 匹配/画像容器', () => {
  const html = studentSearchBoxHtml(42);
  assert.ok(html.includes('id="stSearch"'), '搜索框 id');
  assert.ok(html.includes('共 42 人'), '人数');
  assert.ok(html.includes('id="stMatchList"'), '匹配容器');
  assert.ok(html.includes('id="stStudentDetail"'), '画像容器');
});

test('studentMatchListHtml: 命中行带 data-no + 本地显名 + 错次/缺考 + 标题', () => {
  const html = studentMatchListHtml([{ studentNo: '2023531001', totalWrong: 9, missedCount: 1 }], { '2023531001': '张三' }, { title: '最需要关注的学生' });
  assert.ok(html.includes('class="st-pick"'), '可点 class');
  assert.ok(html.includes('data-no="2023531001"'), 'data-no');
  assert.ok(html.includes('张三'), '本地显名');
  assert.ok(html.includes('错 9'), '错次');
  assert.ok(html.includes('缺考 1'), '缺考');
  assert.ok(html.includes('最需要关注的学生'), '标题');
});

test('studentMatchListHtml: 无命中 + emptyText → 提示', () => {
  assert.ok(studentMatchListHtml([], {}, { emptyText: '没找到' }).includes('没找到'), '空态提示');
});

test('studentProfileHtml: 姓名 + 正确率折线 svg + 弱项考点 + 各卷明细 + 缺考徽章', () => {
  const vm = {
    studentNo: 'S1',
    rateSeries: [{ examLabel: '一模', rate: 40 }, { examLabel: '二模', rate: 70 }],
    weakCats: [{ category: 'tense', categoryName: '谓语动词', right: 2, wrong: 6, rate: 25 }],
    exams: [{ examLabel: '一模', rightCount: 4, wrongCount: 6, blankCount: 0 }, { examLabel: '二模', rightCount: 7, wrongCount: 3, blankCount: 0 }],
    examCount: 2, missedCount: 1, latestRate: 70,
  };
  const html = studentProfileHtml(vm, '张三');
  assert.ok(html.includes('张三'), '姓名');
  assert.ok(html.includes('缺考 1'), '缺考徽章');
  assert.ok(html.includes('<svg'), '正确率折线图');
  assert.ok(html.includes('谓语动词'), '弱项考点名');
  assert.ok(html.includes('一模') && html.includes('二模'), '各卷明细');
  assert.ok(html.includes('70%'), '最近正确率');
});

test('studentProfileHtml: 单卷数据不足 → 折线图给提示而非报错', () => {
  const vm = { studentNo: 'S1', rateSeries: [{ examLabel: '一模', rate: 40 }], weakCats: [], exams: [{ examLabel: '一模', rightCount: 4, wrongCount: 6, blankCount: 0 }], examCount: 1, missedCount: 0, latestRate: 40 };
  assert.ok(studentProfileHtml(vm, '李四').includes('数据不足'), '少于2卷提示');
});

test('catTrendDetailsHtml: 折叠 details/summary 包住趋势；空→空串', () => {
  assert.equal(catTrendDetailsHtml([]), '', '空趋势→空串');
  const html = catTrendDetailsHtml([{ category: 'tense', series: [{ rate: 40 }, { rate: 60 }], latestRate: 60, firstRate: 40, delta: 20 }], { tense: '谓语动词' });
  assert.ok(html.includes('<details'), 'details 包裹');
  assert.ok(html.includes('<summary'), 'summary 摘要');
  assert.ok(html.includes('谓语动词'), '内含趋势内容');
});

test('importClassBarHtml: 只「选班」——有班给下拉 + 指向学生管理；班级管理按钮不在这', () => {
  const html = w.GrammarErrorProfileRender.importClassBarHtml([{ id: 'c1', name: '高三①班' }]);
  assert.ok(html.includes('id="errorImportClass"'), '班级下拉');
  assert.ok(html.includes('高三①班'), '班级名');
  assert.ok(html.includes('班级工作台'), '指向班级工作台');
  assert.ok(!html.includes('id="errorImportNewClass"'), '导入页不再有新建班级');
  assert.ok(!html.includes('id="errorDeleteClass"'), '导入页不再有删除该班');
  assert.ok(!html.includes('id="errorImportRoster"'), '导入页不再有导入名单');
});

test('importClassBarHtml: 无班级→提示去学生管理建班（不出下拉）', () => {
  const html = w.GrammarErrorProfileRender.importClassBarHtml([]);
  assert.ok(html.includes('班级工作台'), '提示去班级工作台');
  assert.ok(!html.includes('id="errorImportClass"'), '无班级不渲染下拉');
});
