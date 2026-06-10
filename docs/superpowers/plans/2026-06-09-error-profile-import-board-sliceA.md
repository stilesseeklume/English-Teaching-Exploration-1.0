# 错题画像 · 片 A：导入页 + 画像板块 + 本机存储

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把现有「上传+画像」合并页拆成两块——**导入页**（选卷+传成绩→算→存进本机）和 **画像板块**（列出历次导入的卷子→点开看完整画像→可删），画像数据按账号隔离存 localStorage 累积。

**Architecture:** 复用片②已建的引擎 `error-profile.js`、view-model `error-profile-view.js`、render `error-profile-render.js`（保留 `uploadPanelHtml`/`profilePageHtml`，新增 `boardListHtml`）。新增纯模块 `error-profile-store.js`（数组增删/排序，无 I/O，可测）。控制器拆成 `renderImportPage` + `renderBoardPage`。localStorage 读写在 app.js（按 `_owner` 隔离，仿现有备课 store）。

**Tech Stack:** vanilla JS（IIFE 纯模块 + 控制器）· SheetJS（已接）· localStorage（owner 隔离）· `node --test` · Playwright smoke · `check_grammar_modules.py` 门禁。

**设计依据：** [docs/planning/2026-06-08-错题精准训练-v1-design.md](../../planning/2026-06-08-错题精准训练-v1-design.md) §11（累积）+ §12（精简 IA：导入 + 画像板块）。**本片只做导入页 + 画像板块 + 存储**；首屏重排、删 AI、折叠错题本/考点训练/备课 = 片 B。

**存储数据形状**：每套 = `{ id, examId, examLabel, savedAt, savedAtText, summary:{studentCount,questionCount,focusCount}, profile:{byCat,byNo,students} }`。`id` 用 `examId`（重传同卷→更新）。localStorage key `grammar-error-profiles`，值 `{ _owner, items:[...] }`，跨账号读到别人的→返回 `[]`。学生逐题数据只留本机（§7）。

---

## 文件结构

| 文件 | 角色 | 改动 |
|---|---|---|
| `docs/grammar-fill/modules/error-profile-store.js` | 纯（新） | `GrammarErrorProfileStore`：upsert/remove/get/buildBoardModel |
| `docs/grammar-fill/modules/error-profile-render.js` | 纯（改） | 加 `boardListHtml` |
| `docs/grammar-fill/modules/error-profile-controller.js` | 控制器（重做） | `renderImportPage` + `renderBoardPage`（替换原 `render`） |
| `docs/grammar-fill/app.js` | 改 | `loadProfiles/saveProfiles` + 两 deps + 两 render + 派发 |
| `docs/grammar-fill/index.html` | 改 | 加 `#page-error-import`；`#page-error-profile` 改作板块；加 store 脚本 |
| `docs/grammar-fill/modules/app-state.js` | 改 | 注册 `error-import` 页面 key（protected）|
| `docs/grammar-fill/modules/home-dashboard-model.js` | 改 | 1 张卡 → 2 张（导入成绩 / 考点画像）|
| `scripts/check_grammar_modules.py` | 改 | 登记 store；render 加 `boardListHtml` 导出 |
| `test/error-profile-store.test.js` | 测（新） | store node:test |
| `test/error-profile-render.test.js` | 测（改） | 加 boardListHtml 用例 |
| `tests/smoke.spec.js` | 测（改） | 导入→存→板块 smoke |

---

### Task 1: `error-profile-store.js` —— 本机卷子存储（纯数组逻辑）

**Files:**
- Create: `docs/grammar-fill/modules/error-profile-store.js`
- Test: `test/error-profile-store.test.js`

- [ ] **Step 1: Write the failing test**

创建 `test/error-profile-store.test.js`：

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/error-profile-store.test.js`
Expected: FAIL（`GrammarErrorProfileStore` undefined / 文件不存在）。

- [ ] **Step 3: Write minimal implementation**

创建 `docs/grammar-fill/modules/error-profile-store.js`：

```js
// grammar-fill/modules/error-profile-store.js
//
// 纯逻辑：「我的卷子」画像存储的数组增删/排序。无 localStorage（I/O 在 app.js），无 DOM。

/* eslint-disable */
(function(){
  function upsertEntry(list, entry) {
    list = (list || []).filter(function(e){ return e.examId !== entry.examId; });
    list.push(entry);
    return list;
  }
  function removeEntry(list, id) {
    return (list || []).filter(function(e){ return e.id !== id; });
  }
  function getEntry(list, id) {
    var hit = (list || []).filter(function(e){ return e.id === id; });
    return hit.length ? hit[0] : null;
  }
  function buildBoardModel(list) {
    return (list || []).slice().sort(function(a, z){ return (z.savedAt || 0) - (a.savedAt || 0); })
      .map(function(e){
        var s = e.summary || {};
        return {
          id: e.id, examId: e.examId, examLabel: e.examLabel, savedAtText: e.savedAtText || '',
          studentCount: s.studentCount || 0, focusCount: s.focusCount || 0
        };
      });
  }
  window.GrammarErrorProfileStore = {
    upsertEntry: upsertEntry, removeEntry: removeEntry, getEntry: getEntry, buildBoardModel: buildBoardModel
  };
})();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/error-profile-store.test.js`
Expected: PASS（3 tests）。

- [ ] **Step 5: Commit**

```bash
git add docs/grammar-fill/modules/error-profile-store.js test/error-profile-store.test.js
git commit -m "feat(error-profile-store): 我的卷子本机存储（upsert/remove/get/buildBoardModel）"
```

---

### Task 2: `boardListHtml` —— 卷子列表渲染（加进 render 纯模块）

**Files:**
- Modify: `docs/grammar-fill/modules/error-profile-render.js`（加 `boardListHtml`，加进导出）
- Test: `test/error-profile-render.test.js`（追加用例 + 解构加 `boardListHtml`）

- [ ] **Step 1: Write the failing test**

在 `test/error-profile-render.test.js` 顶部解构加 `boardListHtml`：
```js
const { profilePageHtml, uploadPanelHtml, boardListHtml } = w.GrammarErrorProfileRender;
```
追加用例：
```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/error-profile-render.test.js`
Expected: FAIL — `boardListHtml is not a function`。

- [ ] **Step 3: Write minimal implementation**

在 `error-profile-render.js` 内、`profilePageHtml` 之后、`window.GrammarErrorProfileRender = {...}` 之前，加：

```js
  function boardListHtml(boardModel) {
    boardModel = boardModel || [];
    if (!boardModel.length) {
      return '<div style="background:#fff;border:1px solid #eee;border-radius:14px;padding:24px;color:#888;text-align:center;">还没有导入的卷子。去「导入成绩」传一套吧。</div>';
    }
    return boardModel.map(function(e){
      return '<div class="ep-board-item" data-id="' + esc(e.id) + '" style="display:flex;align-items:center;gap:12px;background:#fff;border:1px solid #eee;border-radius:12px;padding:14px 18px;margin-bottom:10px;">'
        + '<div style="flex:1;">'
        +   '<div style="font-weight:600;">' + esc(e.examLabel) + '</div>'
        +   '<div style="color:#888;font-size:12px;">' + esc(e.savedAtText) + ' · ' + e.studentCount + ' 生 · 重点讲 ' + e.focusCount + ' 个考点</div>'
        + '</div>'
        + '<button type="button" class="ep-board-view" data-id="' + esc(e.id) + '" style="padding:6px 14px;border-radius:8px;border:1px solid #ddd;background:#f7f7f7;cursor:pointer;">看画像</button>'
        + '<button type="button" class="ep-board-del" data-id="' + esc(e.id) + '" style="padding:6px 12px;border-radius:8px;border:1px solid #f3c0c0;background:#fff;color:#c0392b;cursor:pointer;">删</button>'
        + '</div>';
    }).join('');
  }
```

并把导出对象改成：
```js
  window.GrammarErrorProfileRender = {
    uploadPanelHtml: uploadPanelHtml,
    profilePageHtml: profilePageHtml,
    boardListHtml: boardListHtml
  };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/error-profile-render.test.js`
Expected: PASS（3 tests：原 2 + 新 1）。

- [ ] **Step 5: Commit**

```bash
git add docs/grammar-fill/modules/error-profile-render.js test/error-profile-render.test.js
git commit -m "feat(error-profile-render): boardListHtml 卷子列表（看/删按钮带 data-id）"
```

---

### Task 3: 控制器重做 —— `renderImportPage` + `renderBoardPage`

**Files:**
- Modify (rewrite): `docs/grammar-fill/modules/error-profile-controller.js`

> 控制器碰 DOM/文件/SheetJS，不做 node 单测；Task 5 的 smoke 验证。命名空间仍 `GrammarErrorProfileController`。整文件替换为下面内容。

- [ ] **Step 1: Rewrite the controller**

把 `docs/grammar-fill/modules/error-profile-controller.js` 整个替换为：

```js
// grammar-fill/modules/error-profile-controller.js
//
// 控制器：错题画像。两个页面——
//   renderImportPage(deps)：选卷 + 传成绩 → SheetJS → 引擎 → 算画像 → 存本机 → 跳画像板块。
//   renderBoardPage(deps)：读本机存储 → 列出卷子 → 点开看完整画像 / 删。
// deps（import）: getExamList, getExamGrammarQuestions, catNames, loadProfiles, saveProfiles, gotoBoard, now, nowText
// deps（board）:  loadProfiles, saveProfiles, catNames

/* eslint-disable */
(function(){
  var _imp = null, _brd = null;
  function setMsg(text) { var el = document.getElementById('errorProfileMsg'); if (el) el.textContent = text || ''; }

  // ---------- 导入页 ----------
  function importOnFile(file) {
    setMsg('');
    var sel = document.getElementById('errorProfileExam');
    var examId = (sel || {}).value || '';
    var examLabel = (sel && sel.selectedIndex >= 0) ? sel.options[sel.selectedIndex].text : examId;
    if (!examId) { setMsg('请先选择这套卷。'); return; }
    if (!file) return;
    if (!window.XLSX) { setMsg('Excel 解析库未加载，请刷新重试。'); return; }
    var examQuestions = _imp.getExamGrammarQuestions(examId) || [];
    if (!examQuestions.length) { setMsg('题库里这套卷没有语法填空题。'); return; }
    var grammarNos = examQuestions.map(function(q){ return q.no; });
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var wb = window.XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
        var sheet = wb.SheetNames.find(function(n){ return n.indexOf('小题分') !== -1; }) || wb.SheetNames[0];
        var rows = window.XLSX.utils.sheet_to_json(wb.Sheets[sheet], { header: 1, raw: true, defval: '' });
        var results = window.GrammarErrorProfile.extractGrammarResults(rows, grammarNos);
        if (!results.students.length) { setMsg('没读到学生行——确认这是网阅「学生小题分」导出。'); return; }
        var profile = window.GrammarErrorProfile.buildErrorProfile(results, examQuestions);
        var vmodel = window.GrammarErrorProfileView.buildProfileViewModel(profile, _imp.catNames || {});
        var entry = {
          id: examId, examId: examId, examLabel: examLabel,
          savedAt: _imp.now ? _imp.now() : 0, savedAtText: _imp.nowText ? _imp.nowText() : '',
          summary: vmodel.summary, profile: profile
        };
        var list = window.GrammarErrorProfileStore.upsertEntry((_imp.loadProfiles && _imp.loadProfiles()) || [], entry);
        if (_imp.saveProfiles) _imp.saveProfiles(list);
        if (_imp.gotoBoard) _imp.gotoBoard();
      } catch (err) {
        setMsg('解析失败：' + (err && err.message ? err.message : '未知错误') + '。请确认是网阅导出的 .xls。');
      }
    };
    reader.onerror = function(){ setMsg('读取文件失败，请重试。'); };
    reader.readAsArrayBuffer(file);
  }
  function renderImportPage(deps) {
    _imp = deps || _imp;
    var el = document.getElementById('errorImportContent');
    if (!el) return;
    var exams = (_imp.getExamList && _imp.getExamList()) || [];
    el.innerHTML = window.GrammarErrorProfileRender.uploadPanelHtml(exams);
    var fileInput = document.getElementById('errorProfileFile');
    if (fileInput) fileInput.addEventListener('change', function(ev){ importOnFile(ev.target.files && ev.target.files[0]); });
  }

  // ---------- 画像板块 ----------
  function boardViewProfile(id) {
    var list = (_brd.loadProfiles && _brd.loadProfiles()) || [];
    var entry = window.GrammarErrorProfileStore.getEntry(list, id);
    var detail = document.getElementById('epBoardDetail');
    if (!entry || !detail) return;
    var vmodel = window.GrammarErrorProfileView.buildProfileViewModel(entry.profile, _brd.catNames || {});
    detail.innerHTML = window.GrammarErrorProfileRender.profilePageHtml(vmodel);
  }
  function boardDelProfile(id) {
    if (window.confirm && !window.confirm('删除这套卷的画像？')) return;
    var list = (_brd.loadProfiles && _brd.loadProfiles()) || [];
    var next = window.GrammarErrorProfileStore.removeEntry(list, id);
    if (_brd.saveProfiles) _brd.saveProfiles(next);
    renderBoardPage(_brd);
  }
  function renderBoardPage(deps) {
    _brd = deps || _brd;
    var el = document.getElementById('errorProfileContent');
    if (!el) return;
    var list = (_brd.loadProfiles && _brd.loadProfiles()) || [];
    var boardModel = window.GrammarErrorProfileStore.buildBoardModel(list);
    el.innerHTML = '<div id="epBoardList">' + window.GrammarErrorProfileRender.boardListHtml(boardModel) + '</div>'
      + '<div id="epBoardDetail" style="margin-top:16px;"></div>';
    el.querySelectorAll('.ep-board-view').forEach(function(btn){
      btn.addEventListener('click', function(){ boardViewProfile(btn.getAttribute('data-id')); });
    });
    el.querySelectorAll('.ep-board-del').forEach(function(btn){
      btn.addEventListener('click', function(){ boardDelProfile(btn.getAttribute('data-id')); });
    });
    if (boardModel.length) boardViewProfile(boardModel[0].id);   // 默认展开最新一套
  }

  window.GrammarErrorProfileController = {
    renderImportPage: renderImportPage,
    renderBoardPage: renderBoardPage
  };
})();
```

- [ ] **Step 2: Sanity-check syntax**

Run: `node --check docs/grammar-fill/modules/error-profile-controller.js`
Expected: exit 0, no output.

- [ ] **Step 3: Commit**

```bash
git add docs/grammar-fill/modules/error-profile-controller.js
git commit -m "feat(error-profile-controller): 拆成 导入页(算+存) + 画像板块(列表+看+删)"
```

---

### Task 4: 接进 app —— 存储 I/O + 两页 + 两卡

**Files:**
- Modify: `docs/grammar-fill/app.js`、`docs/grammar-fill/index.html`、`docs/grammar-fill/modules/app-state.js`、`docs/grammar-fill/modules/home-dashboard-model.js`

> 改大文件，读后按锚点插入；本任务靠 Task 5 的 smoke 兜底。

- [ ] **Step 1: app.js —— 存储 I/O + deps + render + 派发**

读 app.js。在原 `errorProfileDeps()` / `renderErrorProfilePage()`（片②加的）附近，**替换/补充**为：

```js
function errorProfilesKey() { return 'grammar-error-profiles'; }
function currentProfileOwnerId() {
  return (window.cloud && window.cloud.state && window.cloud.state.user && window.cloud.state.user.id) || 'anon';
}
function loadErrorProfiles() {
  try {
    var raw = localStorage.getItem(errorProfilesKey());
    if (!raw) return [];
    var data = JSON.parse(raw);
    if (!data || data._owner !== currentProfileOwnerId()) return [];   // 跨账号不串
    return data.items || [];
  } catch (e) { return []; }
}
function saveErrorProfiles(items) {
  try { localStorage.setItem(errorProfilesKey(), JSON.stringify({ _owner: currentProfileOwnerId(), items: items || [] })); } catch (e) {}
}
function errorProfileExamList() {
  return window.GrammarQuestionModel.getOrderedExams(Object.values(EXAMS_BY_ID))
    .map(function(ex){ return { examId: ex.exam_id, label: ex.exam_id }; })
    .filter(function(e){ return ALL_QUESTIONS.some(function(q){ return q.exam_id === e.examId && q.no >= 36 && q.no <= 45; }); });
}
function errorProfileExamQuestions(examId) {
  return ALL_QUESTIONS
    .filter(function(q){ return q.exam_id === examId && q.no >= 36 && q.no <= 45; })
    .map(function(q){ return { no: q.no, category: q.category, fine_category: q.fine_category, answer: q.answer }; });
}
function errorProfileCatNames() {
  return (window.GrammarCategoryRules && window.GrammarCategoryRules.DEFAULT_CATEGORY_NAMES) || {};
}
function renderErrorImportPage() {
  return window.GrammarErrorProfileController.renderImportPage({
    getExamList: errorProfileExamList,
    getExamGrammarQuestions: errorProfileExamQuestions,
    catNames: errorProfileCatNames(),
    loadProfiles: loadErrorProfiles,
    saveProfiles: saveErrorProfiles,
    gotoBoard: function(){ switchPage('error-profile'); },
    now: function(){ return Date.now(); },
    nowText: function(){ return new Date().toLocaleString('zh-CN'); }
  });
}
function renderErrorProfilePage() {
  return window.GrammarErrorProfileController.renderBoardPage({
    loadProfiles: loadErrorProfiles,
    saveProfiles: saveErrorProfiles,
    catNames: errorProfileCatNames()
  });
}
```
**验证别瞎编**：确认 `EXAMS_BY_ID`、`ALL_QUESTIONS`、`window.GrammarQuestionModel.getOrderedExams`、`window.cloud.state.user` 的真实用法（读 app.js 现有用法），不符就按真实 API 改 `errorProfileExamList`/`currentProfileOwnerId`，保持契约：exam 列表 `[{examId,label}]`、问题 `[{no,category,fine_category,answer}]`、owner id 是当前登录用户。

在 `switchPage(page)` 里，片②已加了 `if (page === 'error-profile') renderErrorProfilePage();`——在它旁边补一行：
```js
  if (page === 'error-import') renderErrorImportPage();
```

- [ ] **Step 2: index.html —— 导入页 div + store 脚本 + 板块标题**

读 index.html。
1. 把现有 `<div class="page" id="page-error-profile">` 的标题/描述改成板块语义（内容容器 `#errorProfileContent` 保留）：
```html
<div class="page" id="page-error-profile">
  <h1 class="page-title">考点画像</h1>
  <p class="page-desc">历次导入的卷子 · 点开看班级考点画像</p>
  <div id="errorProfileContent">加载中…</div>
</div>
```
2. 紧随其后加导入页：
```html
<div class="page" id="page-error-import">
  <h1 class="page-title">导入成绩</h1>
  <p class="page-desc">选题库套卷 + 传网阅成绩 .xls，算出考点画像并存入「考点画像」</p>
  <div id="errorImportContent">加载中…</div>
</div>
```
3. 在 `error-profile-render.js` 脚本标签之后加 store：
```html
<script src="./modules/error-profile-store.js"></script>
```

- [ ] **Step 3: app-state.js —— 注册 error-import 页面 key**

`normalizePageKey` 里在 `|| page === 'error-profile'` 之后加：
```js
    || page === 'error-import'
```
`isProtectedPage` 里加 `error-import`（含学生数据，需登录）：
```js
  function isProtectedPage(page) {
    return page === 'error-book' || page === 'lesson-prep' || page === 'admin' || page === 'error-profile' || page === 'error-import';
  }
```

- [ ] **Step 4: home-dashboard-model.js —— 1 卡 → 2 卡**

`getDashboardActions()` 里把片②加的那张 `key:'error-profile'` 卡，替换成两张（放数组最前，导入在前）：
```js
    {
      key: 'error-import', icon: '📥', label: '导入成绩',
      subtitleText: '传网阅成绩 → 算考点画像', tone: 'primary', count: null,
      action: buildAction('switch-page', 'error-import')
    },
    {
      key: 'error-profile', icon: '📊', label: '考点画像',
      subtitleText: '历次卷子 · 班级考点画像', tone: 'accent', count: null,
      action: buildAction('switch-page', 'error-profile')
    },
```

- [ ] **Step 5: 语法自检**

Run: `node --check docs/grammar-fill/app.js && node --check docs/grammar-fill/modules/app-state.js && node --check docs/grammar-fill/modules/home-dashboard-model.js`
Expected: 全部 exit 0。

- [ ] **Step 6: Commit**

```bash
git add docs/grammar-fill/app.js docs/grammar-fill/index.html docs/grammar-fill/modules/app-state.js docs/grammar-fill/modules/home-dashboard-model.js
git commit -m "feat(error-profile): 导入页+画像板块接进 SPA——本机存储/两卡/两页/派发"
```

---

### Task 5: 门禁登记 + smoke + 全量校验

**Files:**
- Modify: `scripts/check_grammar_modules.py`、`tests/smoke.spec.js`

- [ ] **Step 1: 门禁登记 store + render 新导出**

`check_grammar_modules.py` 的 `EXPECTED_MODULES` 里，在 `error-profile-render.js` 条目之后加 store（顺序对应 index.html 脚本顺序）：
```python
    {
        "path": "error-profile-store.js",
        "namespace": "GrammarErrorProfileStore",
        "exports": [
            "upsertEntry",
            "removeEntry",
            "getEntry",
            "buildBoardModel",
        ],
    },
```
并给 `error-profile-render.js` 条目的 `exports` 加 `"boardListHtml"`。

Run: `python3 scripts/check_grammar_modules.py`
Expected: `OK: grammar-fill module contracts valid (N modules)`。报 order/export 错就按报错对齐。

- [ ] **Step 2: smoke —— 导入→存→板块**

读 `tests/smoke.spec.js`（用既有 `mockSignedInTeacher` + `window.GRAMMAR_BANK`）。**替换**片②那条 `错题画像页（登录后）...` 用例为下面这条端到端用例（用 evaluate 注入合成 profile 走存储，避免依赖真实 .xls / xlsx CDN）：

```js
test('错题画像：导入存进本机，画像板块列出并能看', async ({ page }) => {
  const errors = collectFatalBrowserErrors(page);
  await mockSignedInTeacher(page);
  await page.goto('/docs/grammar-fill/');
  await expect(page.locator('html')).toHaveClass(/ready/);

  // 导入页可进、上传面板在
  await page.evaluate(() => window.switchPage('error-import'));
  await expect(page.locator('#page-error-import')).toHaveClass(/active/);
  await expect(page.locator('#errorProfileExam')).toBeVisible();
  await expect(page.locator('#errorProfileFile')).toBeVisible();

  // 直接用 store + 合成 entry 存一条（绕开 xlsx），再验板块
  await page.evaluate(() => {
    const entry = { id: 'X卷', examId: 'X卷', examLabel: 'X卷', savedAt: 1, savedAtText: '刚刚',
      summary: { studentCount: 2, questionCount: 1, focusCount: 1 },
      profile: { byCat: { preposition: { right: 1, wrong: 1, rate: 50 } },
                 byNo: { '36': { right: 1, wrong: 1, blank: 0 } },
                 students: [{ studentNo: 'S1', right: [], wrong: [36], blank: [], wrongQuestions: [{ no: 36, category: 'preposition', answer: 'from' }] }] } };
    const list = window.GrammarErrorProfileStore.upsertEntry([], entry);
    localStorage.setItem('grammar-error-profiles', JSON.stringify({ _owner: 'smoke-user-1', items: list }));
  });
  await page.evaluate(() => window.switchPage('error-profile'));
  await expect(page.locator('#page-error-profile')).toHaveClass(/active/);
  await expect(page.locator('#errorProfileContent')).toContainText('X卷');           // 列表有这套卷
  await expect(page.locator('#epBoardDetail')).toContainText('考点画像');             // 默认展开画像
  expect(errors).toEqual([]);
});
```
> `_owner: 'smoke-user-1'` 要和 `mockSignedInTeacher` 设的用户 id 一致（读 helper 确认；不一致就改成它的真实 id），否则 owner 隔离会让 loadProfiles 返回 []。

- [ ] **Step 3: 全量校验**

Run: `npm run test:unit`（含 store + render + view + 引擎，全绿）
Run: `npm run check`（结尾 `OK: all engineering checks passed`）

若 `npm run check` 因 dashboard 断言（actions 数量/顺序变了）失败：那是 home 卡 1→2 导致的——按新布局更新 `tests/smoke.spec.js` 里硬编码的 `actions` 断言（参考片②同类修法），这属本片 smoke 文件、可改。

- [ ] **Step 4: Commit**

```bash
git add scripts/check_grammar_modules.py tests/smoke.spec.js
git commit -m "chore(gate)+test(smoke): 登记 store + 导入→板块端到端 smoke + 更新 dashboard 断言"
```

---

## 本片完成定义

- 主页两张卡：「📥 导入成绩」→ 导入页（选卷+传成绩→算→存）；「📊 考点画像」→ 板块（列历次卷子→点开看完整画像→删）。
- 画像存 localStorage 按账号隔离、累积、刷新不丢。
- store 纯模块 + boardListHtml node 单测全绿；导入→板块 smoke 绿；`npm run check` 绿。

## 不含（片 B）

- 首屏三步化、题库/知识库降工具、折叠错题本/考点训练/备课、删 AI。
- 新卷 Word 导入入「我的卷子」（本片只匹配题库已有卷；备课改造在片 B）。
- 多班分存、跨次趋势、从画像拉真题迁移。

## 手测（真实数据，不入自动化）

登录 → 导入成绩 → 选 2026广州一模 → 传 `成绩单.xls` → 自动跳「考点画像」板块 → 看到该卷画像（介词 0% 等）；刷新页面 → 板块仍在、点开仍能看。
