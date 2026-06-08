# 错题画像页 · 切片② 实施计划（选卷 + 传成绩 → 完整画像页）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 grammar-fill SPA 里加一个「导入成绩 · 算考点画像」页：选题库已有套卷 + 传网阅成绩 .xls → 调引擎 → 渲染完整画像（考点正确率排行 + 讲评优先级 + 每题对错 + 点学生看错题集）。

**Architecture:** 沿用纯模块 + 控制器切分。引擎 `error-profile.js`（已建，复用）。新增 2 个纯模块（view-model 把画像→视图模型；render 把视图模型→HTML，均无 DOM、node 可测）+ 1 个控制器（碰 DOM/文件/SheetJS）。入口为语法填空主页一张 featured 卡片 → `switchPage('error-profile')`。

**Tech Stack:** vanilla JS（IIFE 纯模块 + 控制器薄壳）· SheetJS（xlsx@0.18.5 CDN，同 score-analysis）· `node --test`（纯模块）· Playwright smoke（页面）· `check_grammar_modules.py` 门禁。

**设计依据：** [docs/planning/2026-06-08-错题精准训练-v1-design.md](../../planning/2026-06-08-错题精准训练-v1-design.md) §11（修正核心模型：每套卷循环 / 完整画像）。**本片只做「选题库已有卷 + 传成绩」**；新卷 Word 导入 + 「我的卷子」累积 = 紧接着的下一片，不在本片。

**引擎契约（已建，复用，勿改）：**
- `window.GrammarErrorProfile.extractGrammarResults(rows, grammarNos)` → `{students:[{studentNo,right:[],wrong:[],blank:[]}]}`
- `window.GrammarErrorProfile.buildErrorProfile(studentResults, examQuestions)` → `{byCat:{cat:{right,wrong,rate}}, byNo:{no:{right,wrong,blank}}, students:[{studentNo,right,wrong,blank,wrongQuestions}]}`

---

## 文件结构

| 文件 | 角色 | 命名空间 / 职责 |
|---|---|---|
| `docs/grammar-fill/modules/error-profile.js` | 纯（已建） | `GrammarErrorProfile`：引擎。本片**登记进门禁**（首次被页面加载）。 |
| `docs/grammar-fill/modules/error-profile-view.js` | 纯（新） | `GrammarErrorProfileView`：画像 → 视图模型（排行/优先级/学生列表）。 |
| `docs/grammar-fill/modules/error-profile-render.js` | 纯（新） | `GrammarErrorProfileRender`：视图模型 → HTML。 |
| `docs/grammar-fill/modules/error-profile-controller.js` | 控制器（新） | `GrammarErrorProfileController`：文件→SheetJS→引擎→view→render→DOM。**勿用 `GrammarErrorProfile` 命名空间（撞引擎）**。 |
| `test/error-profile-view.test.js` | 测试（新） | view-model node:test |
| `test/error-profile-render.test.js` | 测试（新） | render node:test |
| `docs/grammar-fill/index.html` | 改 | SheetJS CDN + `#page-error-profile` + 3 个脚本标签 |
| `docs/grammar-fill/app.js` | 改 | `errorProfileDeps()` + `renderErrorProfilePage()` + switchPage 派发 |
| `docs/grammar-fill/modules/home-dashboard-model.js` | 改 | 主页加 featured 卡片 |
| `docs/grammar-fill/modules/app-state.js` | 改 | `normalizePageKey` + `isProtectedPage` 加 `'error-profile'` |
| `scripts/check_grammar_modules.py` | 改 | 登记 3 纯模块 + 1 控制器 |
| `tests/smoke.spec.js` | 改 | 页面 smoke |

---

### Task 1: `error-profile-view.js` —— 画像 → 视图模型（排行/优先级/学生）

**Files:**
- Create: `docs/grammar-fill/modules/error-profile-view.js`
- Test: `test/error-profile-view.test.js`

- [ ] **Step 1: Write the failing test**

创建 `test/error-profile-view.test.js`：

```js
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
  assert.equal(teachPriority(100, 0), 'skip');   // 全对
  assert.equal(teachPriority(40, 3), 'focus');   // 低
  assert.equal(teachPriority(70, 2), 'watch');   // 中
  assert.equal(teachPriority(90, 1), 'skip');    // 高
  assert.equal(teachPriority(null, 0), 'skip');  // 无应答
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
  // 排行：非谓语(20%)在介词(80%)前
  assert.equal(json(vm.catRanking), json([
    { category: 'nonpredicate', categoryName: '非谓语', right: 2, wrong: 8, rate: 20, priority: 'focus' },
    { category: 'preposition',  categoryName: '介词',   right: 8, wrong: 2, rate: 80, priority: 'watch' },
  ]));
  // 题表按题号升序
  assert.equal(json(vm.noList), json([
    { no: 36, right: 8, wrong: 2, blank: 0 },
    { no: 40, right: 2, wrong: 8, blank: 0 },
  ]));
  // 学生：错多的在前
  assert.equal(json(vm.students), json([
    { studentNo: '2023531001', rightCount: 1, wrongCount: 1, blankCount: 0, wrongQuestions: [{ no: 40, category: 'nonpredicate', answer: 'valuing' }] },
    { studentNo: '2023531002', rightCount: 2, wrongCount: 0, blankCount: 0, wrongQuestions: [] },
  ]));
  assert.equal(json(vm.summary), json({ studentCount: 2, questionCount: 2, focusCount: 1 }));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/error-profile-view.test.js`
Expected: FAIL — `Cannot read properties of undefined (reading 'GrammarErrorProfileView')`.

- [ ] **Step 3: Write minimal implementation**

创建 `docs/grammar-fill/modules/error-profile-view.js`：

```js
// grammar-fill/modules/error-profile-view.js
//
// 纯逻辑：完整画像（引擎产物）→ 视图模型（考点排行+讲评优先级、题表、学生列表、汇总）。
// 无 DOM / 无网络。

/* eslint-disable */
(function(){
  // 讲评优先级：全对/无应答→skip(可略过)；正确率<60→focus(重点讲)；<85→watch(关注)；否则 skip。
  function teachPriority(rate, wrong) {
    if (!wrong) return 'skip';
    if (rate == null) return 'skip';
    if (rate < 60) return 'focus';
    if (rate < 85) return 'watch';
    return 'skip';
  }

  function buildProfileViewModel(profile, catNames) {
    profile = profile || {};
    catNames = catNames || {};
    var byCat = profile.byCat || {};
    var byNo = profile.byNo || {};
    var students = profile.students || [];

    var catRanking = Object.keys(byCat).map(function(cat){
      var b = byCat[cat];
      return {
        category: cat,
        categoryName: catNames[cat] || cat,
        right: b.right, wrong: b.wrong, rate: b.rate,
        priority: teachPriority(b.rate, b.wrong)
      };
    }).sort(function(a, z){
      var ar = a.rate == null ? 999 : a.rate, zr = z.rate == null ? 999 : z.rate;
      if (ar !== zr) return ar - zr;          // 正确率低的在前
      return z.wrong - a.wrong;               // 同率，错多的在前
    });

    var noList = Object.keys(byNo).map(function(no){
      var b = byNo[no];
      return { no: Number(no), right: b.right, wrong: b.wrong, blank: b.blank };
    }).sort(function(a, z){ return a.no - z.no; });

    var studentList = students.map(function(s){
      return {
        studentNo: s.studentNo,
        rightCount: (s.right || []).length,
        wrongCount: (s.wrong || []).length,
        blankCount: (s.blank || []).length,
        wrongQuestions: s.wrongQuestions || []
      };
    }).sort(function(a, z){ return z.wrongCount - a.wrongCount; });

    var summary = {
      studentCount: students.length,
      questionCount: noList.length,
      focusCount: catRanking.filter(function(c){ return c.priority === 'focus'; }).length
    };

    return { catRanking: catRanking, noList: noList, students: studentList, summary: summary };
  }

  window.GrammarErrorProfileView = {
    buildProfileViewModel: buildProfileViewModel,
    teachPriority: teachPriority
  };
})();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/error-profile-view.test.js`
Expected: PASS（2 tests）。

- [ ] **Step 5: Commit**

```bash
git add docs/grammar-fill/modules/error-profile-view.js test/error-profile-view.test.js
git commit -m "feat(error-profile-view): 画像→视图模型（考点排行+讲评优先级+学生列表）"
```

---

### Task 2: `error-profile-render.js` —— 视图模型 → HTML

**Files:**
- Create: `docs/grammar-fill/modules/error-profile-render.js`
- Test: `test/error-profile-render.test.js`

- [ ] **Step 1: Write the failing test**

创建 `test/error-profile-render.test.js`（render 内部用 `window.escapeHtml`，测试里注入一个）：

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/error-profile-render.test.js`
Expected: FAIL — `Cannot read properties of undefined (reading 'GrammarErrorProfileRender')`.

- [ ] **Step 3: Write minimal implementation**

创建 `docs/grammar-fill/modules/error-profile-render.js`：

```js
// grammar-fill/modules/error-profile-render.js
//
// 纯逻辑：视图模型 → HTML 字符串。无 DOM 操作（不碰 document/innerHTML），只拼字符串。
// 用 window.escapeHtml 转义动态内容。

/* eslint-disable */
(function(){
  var PRIORITY_LABEL = { focus: '🔴 重点讲', watch: '🟡 关注', skip: '⚪ 可略过' };

  function esc(s){ return window.escapeHtml(s == null ? '' : s); }

  function uploadPanelHtml(exams) {
    exams = exams || [];
    var opts = exams.map(function(e){
      return '<option value="' + esc(e.examId) + '">' + esc(e.label) + '</option>';
    }).join('');
    return ''
      + '<div style="background:#fff;border:1px solid #eee;border-radius:14px;padding:20px;margin-bottom:16px;">'
      +   '<div style="font-weight:600;margin-bottom:12px;">① 选这套卷　② 传这次成绩（网阅小题分 .xls）</div>'
      +   '<select id="errorProfileExam" style="padding:8px 12px;border:1px solid #ddd;border-radius:8px;margin-right:12px;">'
      +     '<option value="">— 选择套卷 —</option>' + opts
      +   '</select>'
      +   '<input type="file" id="errorProfileFile" accept=".xls,.xlsx" style="margin-top:8px;">'
      +   '<div id="errorProfileMsg" style="color:#c0392b;font-size:13px;margin-top:8px;"></div>'
      + '</div>';
  }

  function barHtml(rate) {
    var pct = rate == null ? 0 : rate;
    var color = pct < 60 ? '#e74c3c' : (pct < 85 ? '#f39c12' : '#27ae60');
    return '<span style="display:inline-block;width:120px;height:10px;background:#eee;border-radius:5px;vertical-align:middle;overflow:hidden;">'
      + '<span style="display:block;width:' + pct + '%;height:100%;background:' + color + ';"></span></span>';
  }

  function catRankingHtml(catRanking) {
    if (!catRanking.length) return '';
    var rows = catRanking.map(function(c){
      var rateText = c.rate == null ? '—' : (c.rate + '%');
      return '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f4f4f4;">'
        + '<span style="width:84px;font-weight:600;">' + esc(c.categoryName) + '</span>'
        + barHtml(c.rate)
        + '<span style="width:48px;text-align:right;">' + rateText + '</span>'
        + '<span style="color:#888;font-size:12px;">对' + c.right + ' / 错' + c.wrong + '</span>'
        + '<span style="margin-left:auto;font-size:12px;">' + (PRIORITY_LABEL[c.priority] || '') + '</span>'
        + '</div>';
    }).join('');
    return '<div style="background:#fff;border:1px solid #eee;border-radius:14px;padding:16px 20px;margin-bottom:16px;">'
      + '<div style="font-weight:600;margin-bottom:8px;">考点画像 · 正确率排行（低的该重点讲）</div>' + rows + '</div>';
  }

  function noListHtml(noList) {
    if (!noList.length) return '';
    var cells = noList.map(function(n){
      return '<span style="display:inline-block;min-width:120px;padding:6px 10px;margin:4px;border:1px solid #eee;border-radius:8px;font-size:13px;">'
        + '第' + n.no + '题　对' + n.right + ' 错' + n.wrong + (n.blank ? ' 缺考' + n.blank : '') + '</span>';
    }).join('');
    return '<div style="background:#fff;border:1px solid #eee;border-radius:14px;padding:16px 20px;margin-bottom:16px;">'
      + '<div style="font-weight:600;margin-bottom:8px;">每题对错</div>' + cells + '</div>';
  }

  function studentsHtml(students) {
    if (!students.length) return '';
    var rows = students.map(function(s){
      var wq = (s.wrongQuestions || []).map(function(q){ return '第' + q.no + '题(' + esc(q.category) + ')'; }).join('、');
      return '<div style="padding:8px 0;border-bottom:1px solid #f4f4f4;font-size:13px;">'
        + '<span style="font-weight:600;">' + esc(s.studentNo) + '</span>'
        + '<span style="color:#888;margin-left:10px;">对' + s.rightCount + ' 错' + s.wrongCount + (s.blankCount ? ' 缺考' + s.blankCount : '') + '</span>'
        + (wq ? '<span style="margin-left:10px;color:#c0392b;">错题：' + wq + '</span>' : '')
        + '</div>';
    }).join('');
    return '<div style="background:#fff;border:1px solid #eee;border-radius:14px;padding:16px 20px;">'
      + '<div style="font-weight:600;margin-bottom:8px;">学生（错最多在前）</div>' + rows + '</div>';
  }

  function profilePageHtml(vm) {
    vm = vm || {};
    var s = vm.summary || {};
    var head = '<div style="color:#666;font-size:13px;margin-bottom:12px;">'
      + '共 ' + (s.studentCount || 0) + ' 名学生 · ' + (s.questionCount || 0) + ' 道语法填空 · '
      + '<b style="color:#e74c3c;">' + (s.focusCount || 0) + '</b> 个考点需重点讲</div>';
    return head + catRankingHtml(vm.catRanking || []) + noListHtml(vm.noList || []) + studentsHtml(vm.students || []);
  }

  window.GrammarErrorProfileRender = {
    uploadPanelHtml: uploadPanelHtml,
    profilePageHtml: profilePageHtml
  };
})();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/error-profile-render.test.js`
Expected: PASS（2 tests）。

- [ ] **Step 5: Commit**

```bash
git add docs/grammar-fill/modules/error-profile-render.js test/error-profile-render.test.js
git commit -m "feat(error-profile-render): 视图模型→画像页 HTML（排行/优先级/题表/学生）"
```

---

### Task 3: `error-profile-controller.js` —— 文件→SheetJS→引擎→渲染

**Files:**
- Create: `docs/grammar-fill/modules/error-profile-controller.js`

> 控制器碰 DOM/文件/SheetJS，不做 node 单测；正确性由 Task 6 的 Playwright smoke + 手测真实成绩单覆盖。命名空间用 `GrammarErrorProfileController`（**勿用 `GrammarErrorProfile`，那是引擎**）。

- [ ] **Step 1: Write the controller**

创建 `docs/grammar-fill/modules/error-profile-controller.js`：

```js
// grammar-fill/modules/error-profile-controller.js
//
// 控制器：错题画像页。从 app.js 注入 deps。
// 流程：选套卷 + 传成绩 .xls → SheetJS 解析行 → 引擎 extract+build → view-model → render → 塞 DOM。
// deps:
//   getExamList()                 → [{examId, label}]   题库里有语法填空的套卷
//   getExamGrammarQuestions(id)   → [{no, category, fine_category, answer}]  该卷语填题
//   catNames                      → {category: 中文名}
//   （SheetJS 为 window.XLSX 全局；引擎/视图/渲染为 window.Grammar* 全局）

/* eslint-disable */
(function(){
  var _d = null;

  function setMsg(text) {
    var el = document.getElementById('errorProfileMsg');
    if (el) el.textContent = text || '';
  }

  function showProfileHtml(html) {
    var host = document.getElementById('errorProfileResult');
    if (host) host.innerHTML = html;
  }

  function onFile(file) {
    setMsg('');
    var examId = (document.getElementById('errorProfileExam') || {}).value || '';
    if (!examId) { setMsg('请先选择这套卷。'); return; }
    if (!file) return;
    if (!window.XLSX) { setMsg('Excel 解析库未加载，请刷新重试。'); return; }

    var examQuestions = _d.getExamGrammarQuestions(examId) || [];
    if (!examQuestions.length) { setMsg('题库里这套卷没有语法填空题，换一套或先导入试题。'); return; }
    var grammarNos = examQuestions.map(function(q){ return q.no; });

    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var wb = window.XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
        var sheetName = wb.SheetNames.find(function(n){ return n.indexOf('小题分') !== -1; }) || wb.SheetNames[0];
        var rows = window.XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, raw: true, defval: '' });
        var results = window.GrammarErrorProfile.extractGrammarResults(rows, grammarNos);
        if (!results.students.length) { setMsg('没读到学生行——确认这是网阅「学生小题分」导出。'); return; }
        var profile = window.GrammarErrorProfile.buildErrorProfile(results, examQuestions);
        var vmodel = window.GrammarErrorProfileView.buildProfileViewModel(profile, _d.catNames || {});
        showProfileHtml(window.GrammarErrorProfileRender.profilePageHtml(vmodel));
        setMsg('');
      } catch (err) {
        setMsg('解析失败：' + (err && err.message ? err.message : '未知错误') + '。请确认文件是网阅导出的 .xls。');
      }
    };
    reader.onerror = function(){ setMsg('读取文件失败，请重试。'); };
    reader.readAsArrayBuffer(file);
  }

  function render(deps) {
    _d = deps || _d;
    var el = document.getElementById('errorProfileContent');
    if (!el) return;
    var exams = (_d.getExamList && _d.getExamList()) || [];
    el.innerHTML = window.GrammarErrorProfileRender.uploadPanelHtml(exams) + '<div id="errorProfileResult"></div>';
    var fileInput = document.getElementById('errorProfileFile');
    if (fileInput) fileInput.addEventListener('change', function(ev){ onFile(ev.target.files && ev.target.files[0]); });
  }

  window.GrammarErrorProfileController = { render: render };
})();
```

- [ ] **Step 2: Commit**

```bash
git add docs/grammar-fill/modules/error-profile-controller.js
git commit -m "feat(error-profile-controller): 选卷+传成绩→SheetJS→引擎→渲染画像"
```

---

### Task 4: 接进 app —— index.html / app.js / app-state / 主页卡片

**Files:**
- Modify: `docs/grammar-fill/index.html`
- Modify: `docs/grammar-fill/app.js`
- Modify: `docs/grammar-fill/modules/app-state.js`
- Modify: `docs/grammar-fill/modules/home-dashboard-model.js`

> 本任务是接线，没有独立单测；Task 6 的 smoke 验证整条链路。按下面精确片段改。

- [ ] **Step 1: index.html —— SheetJS CDN + 页面 div + 脚本标签**

在 `<head>` 区现有 CDN（`mammoth...` 那行之后）加：
```html
<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
```

在最后一个 `<div class="page" id="page-lesson-prep">…</div>` 之后加新页面：
```html
<div class="page" id="page-error-profile">
  <h1 class="page-title">成绩 · 考点画像</h1>
  <p class="page-desc">选题库已有套卷 + 传网阅成绩，自动算出班级考点画像</p>
  <div id="errorProfileContent">加载中…</div>
</div>
```

在脚本加载区，`home-render.js` 之后、`home-dashboard.js`（控制器）之前，加两个纯模块：
```html
<script src="./modules/error-profile.js"></script>
<script src="./modules/error-profile-view.js"></script>
<script src="./modules/error-profile-render.js"></script>
```
在 `lesson-prep-controller.js` 那行之后加控制器：
```html
<script src="./modules/error-profile-controller.js"></script>
```

- [ ] **Step 2: app-state.js —— 注册页面 key（否则 switchPage 回落 home）**

在 `normalizePageKey` 的判断里，`|| page === 'lesson-prep'` 之后加一行：
```js
    || page === 'error-profile'
```
在 `isProtectedPage` 里（页面含学生数据，需登录）：
```js
  function isProtectedPage(page) {
    return page === 'error-book' || page === 'lesson-prep' || page === 'admin' || page === 'error-profile';
  }
```

- [ ] **Step 3: app.js —— deps + render 包装 + switchPage 派发**

在 app.js 顶部初始化区（已有 `const BANK`、`ALL_QUESTIONS`、`EXAMS_BY_ID`）附近，加包装函数（放在其他 `function xxxDeps()` 旁）：
```js
function errorProfileDeps() {
  return {
    getExamList: function() {
      return window.GrammarQuestionModel.getOrderedExams(Object.values(EXAMS_BY_ID))
        .map(function(ex){ return { examId: ex.exam_id, label: ex.exam_id }; })
        .filter(function(e){ return ALL_QUESTIONS.some(function(q){ return q.exam_id === e.examId && q.no >= 36 && q.no <= 45; }); });
    },
    getExamGrammarQuestions: function(examId) {
      return ALL_QUESTIONS
        .filter(function(q){ return q.exam_id === examId && q.no >= 36 && q.no <= 45; })
        .map(function(q){ return { no: q.no, category: q.category, fine_category: q.fine_category, answer: q.answer }; });
    },
    catNames: (window.GrammarCategoryRules && window.GrammarCategoryRules.DEFAULT_CATEGORY_NAMES) || {}
  };
}
function renderErrorProfilePage() {
  return window.GrammarErrorProfileController.render(errorProfileDeps());
}
```

在 `switchPage(page)` 里，给页面加 `.active` 之后（其他 `if (renderPlan.renderAction === ...)` 派发行附近）加一行直接派发：
```js
  if (page === 'error-profile') renderErrorProfilePage();
```

- [ ] **Step 4: home-dashboard-model.js —— 主页 featured 卡片**

在 `getDashboardActions()` 返回的数组**最前面**（让它显眼）插入：
```js
    {
      key: 'error-profile',
      icon: '📥',
      label: '导入成绩 · 算考点画像',
      subtitleText: '传网阅成绩 → 班级考点画像',
      tone: 'primary',
      count: null,
      action: buildAction('switch-page', 'error-profile')
    },
```

- [ ] **Step 5: 验证页面能进能渲染（手动 + 下一步 smoke）**

Run: `python3 -m http.server 8000 -d docs`（或现有本地服务方式），浏览器开 `localhost:8000/grammar-fill/`，登录后主页点新卡片 → 应进入「成绩·考点画像」页，看到套卷下拉 + 文件输入。
Expected: 页面切换成功、上传面板渲染（暂不必真传文件，Task 6 smoke 兜底）。

- [ ] **Step 6: Commit**

```bash
git add docs/grammar-fill/index.html docs/grammar-fill/app.js docs/grammar-fill/modules/app-state.js docs/grammar-fill/modules/home-dashboard-model.js
git commit -m "feat(error-profile): 接进 SPA——主页卡片+页面+SheetJS CDN+派发+页面注册"
```

---

### Task 5: 门禁登记（3 纯模块 + 1 控制器）

**Files:**
- Modify: `scripts/check_grammar_modules.py`

- [ ] **Step 1: 登记进 EXPECTED_MODULES / CONTROLLER_MODULES**

在 `EXPECTED_MODULES` 列表里加 3 个纯模块（位置对应 index.html 脚本顺序：`error-profile.js`、`error-profile-view.js`、`error-profile-render.js` 放在 `home-render.js` 项之后）：
```python
    {
        "path": "error-profile.js",
        "namespace": "GrammarErrorProfile",
        "exports": ["extractGrammarResults", "buildErrorProfile"],
    },
    {
        "path": "error-profile-view.js",
        "namespace": "GrammarErrorProfileView",
        "exports": ["teachPriority", "buildProfileViewModel"],
    },
    {
        "path": "error-profile-render.js",
        "namespace": "GrammarErrorProfileRender",
        "exports": ["uploadPanelHtml", "profilePageHtml"],
    },
```
在 `CONTROLLER_MODULES` 加控制器：
```python
    "error-profile-controller.js",
```

- [ ] **Step 2: 跑门禁**

Run: `python3 scripts/check_grammar_modules.py`
Expected: `OK: grammar-fill module contracts valid (N modules)`。
若报 `pure module order mismatch`，按报错把 EXPECTED_MODULES 里 3 项的相对顺序调成与 index.html 脚本顺序一致。

- [ ] **Step 3: Commit**

```bash
git add scripts/check_grammar_modules.py
git commit -m "chore(gate): 登记 error-profile 引擎/视图/渲染纯模块 + 控制器"
```

---

### Task 6: 页面 smoke + 全量校验

**Files:**
- Modify: `tests/smoke.spec.js`

- [ ] **Step 1: 加一条 smoke——主页卡片进画像页、上传面板出现**

在 `tests/smoke.spec.js` 末尾追加（沿用文件现有的 page/goto 模式；若现有用例已封装登录/导航 helper，复用之）：
```js
test('错题画像页：主页卡片进入，渲染套卷下拉+文件输入', async ({ page }) => {
  await page.goto('/grammar-fill/');
  // 若 smoke 环境免登录见首页，直接切页；否则复用文件里既有的登录 helper。
  await page.evaluate(() => window.switchPage && window.switchPage('error-profile'));
  await page.waitForSelector('#page-error-profile.active', { timeout: 5000 });
  await page.waitForFunction(() => {
    const el = document.getElementById('errorProfileExam');
    const file = document.getElementById('errorProfileFile');
    return !!el && !!file;
  }, { timeout: 5000 });
});
```

> 若 smoke 受登录门禁挡住（`error-profile` 是 protected 页），改为断言「未登录时 switchPage 回落、登录后可进」，或在该用例里走文件既有的登录流程。以文件现有 helper 为准。

- [ ] **Step 2: 跑 smoke**

Run: `npm run test:smoke`
Expected: 新用例 PASS（连同既有 smoke 全绿）。

- [ ] **Step 3: 全量校验**

Run: `npm run test:unit`
Expected: 全绿（含 error-profile / view / render 三套）。

Run: `npm run check`
Expected: `OK: all engineering checks passed`。

- [ ] **Step 4: Commit**

```bash
git add tests/smoke.spec.js
git commit -m "test(smoke): 错题画像页可进入并渲染上传面板"
```

---

## 本片完成定义

- 主页有「📥 导入成绩 · 算考点画像」卡片 → 进入新页 → 选题库套卷（如 2026广州一模）+ 传成绩 .xls → 看到考点正确率排行 + 讲评优先级 + 每题对错 + 学生错题集。
- 3 纯模块 node 单测全绿；控制器/页面 smoke 绿；`npm run check` 绿；门禁已登记。
- 化名化：页面只显示学号（成绩不入云端，纯客户端解析）。

## 不含（留下一片）

- 新卷 Word 导入 + 「我的卷子」store 累积（§11 切片 3）
- 跨历次趋势（§11 切片 4）
- 从画像弱项一键拉同考点真题迁移（§11 切片 5）
- 点学生展开为独立大卡 / 导出（增强）

## 手测真实数据（不进自动化，含学生隐私）

用 `/Users/zhenliu/Downloads/成绩单.xls`（真实 2026广州一模）：选 2026广州一模 + 传该文件 → 核对画像与切片① PoC 一致（介词高错、词性名词高错…）。该文件**不提交仓库**。
