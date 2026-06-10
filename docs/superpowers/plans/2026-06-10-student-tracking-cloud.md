# 学生追踪（云端）实施计划 — 单老师 / 一学期

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use `- [ ]` checkboxes.

**Goal:** 让老师按学生纵向看一学期的考点弱项，数据持久存 Supabase；云端只存学号，姓名只留本地。

**Architecture:** 加法式——现有班级画像板块(localStorage)不动。新增：① Supabase `exam_results` 表(每生一卷一行, RLS 只看自己) ② 纯模块 `student-tracking.js`(抽花名册/拆每生行/聚时间线/解析名) ③ cloud.js 三件套同步 ④ app.js 本地名字层 ⑤ 导入流程额外写本地名+推云 ⑥ 新「学生时间线」页。

**Tech Stack:** vanilla JS(IIFE 纯模块 + 控制器) · Supabase(supabase-js, 沿用 error_book 模式) · node:test · Playwright smoke · 门禁 check_*。

**Spec:** `docs/superpowers/specs/2026-06-10-student-tracking-cloud-design.md`

**前置：** 分支 `feat/student-tracking-cloud`（已建，spec 已提交）。错题画像双文件导入已在 main。

---

### Task 1: 迁移 —— `exam_results` 表 + RLS + 回滚

**Files:** Create `supabase/migrations/2026-06-10_exam_results.sql`、`supabase/migrations/2026-06-10_exam_results.rollback.sql`

- [ ] **Step 1: 写 migration**

`2026-06-10_exam_results.sql`：
```sql
create table if not exists public.exam_results (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  client_id   text not null,
  class_id    text not null,
  class_name  text,
  exam_id     text not null,
  exam_label  text,
  exam_date   date,
  student_no  text not null,
  result      jsonb not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, client_id)
);

alter table public.exam_results enable row level security;

create policy exam_results_all_own on public.exam_results
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create index if not exists exam_results_class_student
  on public.exam_results (user_id, class_id, student_no);
create index if not exists exam_results_class_exam
  on public.exam_results (user_id, class_id, exam_id);
```

`2026-06-10_exam_results.rollback.sql`：
```sql
drop index if exists public.exam_results_class_exam;
drop index if exists public.exam_results_class_student;
drop policy if exists exam_results_all_own on public.exam_results;
drop table if exists public.exam_results;
```

- [ ] **Step 2: 过 migration 门禁**

Run: `python3 scripts/check_supabase_migrations.py`
Expected: OK（有 rollback + RLS）。先读现有 `2026-05-28_feedback_events.sql` 确认风格一致（policy 命名、enable RLS 写法）。

- [ ] **Step 3: Commit**
```bash
git add supabase/migrations/2026-06-10_exam_results.sql supabase/migrations/2026-06-10_exam_results.rollback.sql
git commit -m "feat(db): exam_results 表(每生一卷一行)+RLS只看自己+回滚"
```

> 注：迁移只入库本仓库；实际 apply 到 Supabase 由负责人在控制台/CI 执行（与现有迁移流程一致，不在本计划内自动 apply）。

---

### Task 2: 纯模块 `student-tracking.js` + 单测 + 门禁登记

**Files:** Create `docs/grammar-fill/modules/student-tracking.js`、`test/student-tracking.test.js`；Modify `scripts/check_grammar_modules.py`

纯 IIFE 模块（无 DOM/网络/SheetJS；注释里也别出现 document/localStorage/fetch 字样——门禁扫注释）。

- [ ] **Step 1: 写失败测试** `test/student-tracking.test.js`

```js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const vm = require('node:vm');

const w = {};
const code = fs.readFileSync(require('node:path').join(__dirname, '../docs/grammar-fill/modules/student-tracking.js'), 'utf8');
vm.runInNewContext(code, { window: w });
const { extractStudentRoster, buildExamResultRows, buildStudentTimeline, resolveStudentName } = w.GrammarStudentTracking;

test('extractStudentRoster: 读学号+姓名列，跳过非学生行', () => {
  const rows = [
    ['序号','姓名','学号','36'],
    ['','','',''],
    ['1','张三','2023531001','1.5'],
    ['2','李四','2023531002','0'],
  ];
  assert.equal(JSON.stringify(extractStudentRoster(rows)), JSON.stringify([
    { studentNo: '2023531001', name: '张三' },
    { studentNo: '2023531002', name: '李四' },
  ]));
});

test('buildExamResultRows: 每生一行；byCat 错用 wrongQuestions、对用 examForBuild', () => {
  const profile = { students: [
    { studentNo: '2023531001', right: [37], wrong: [36], blank: [],
      wrongQuestions: [{ no: 36, category: 'preposition', fine_category: null, answer: 'from' }] },
  ] };
  const examForBuild = [
    { no: 36, category: 'preposition', answer: 'from' },
    { no: 37, category: 'tense', answer: 'has gone' },
  ];
  const rows = buildExamResultRows(profile, examForBuild, { classId: 'cls_1', className: '高三①班', examId: 'e1', examLabel: '一模', examDate: '2026-03-01' });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].client_id, 'cls_1__e1__2023531001');
  assert.equal(rows[0].class_id, 'cls_1');
  assert.equal(rows[0].student_no, '2023531001');
  assert.equal(JSON.stringify(rows[0].result.byCat), JSON.stringify({ preposition: { right: 0, wrong: 1 }, tense: { right: 1, wrong: 0 } }));
});

test('buildStudentTimeline: 同一学号跨卷聚合，weakCats 按错次降序、exams 按日期升序', () => {
  const rows = [
    { student_no: 'S1', exam_id: 'e2', exam_label: '二模', exam_date: '2026-04-01',
      result: { right: [], wrong: [36], blank: [], wrongQuestions: [{ no: 36, category: 'tense' }], byCat: { tense: { right: 0, wrong: 1 } } } },
    { student_no: 'S1', exam_id: 'e1', exam_label: '一模', exam_date: '2026-03-01',
      result: { right: [], wrong: [38], blank: [], wrongQuestions: [], byCat: { tense: { right: 1, wrong: 1 }, preposition: { right: 0, wrong: 1 } } } },
  ];
  const tl = buildStudentTimeline(rows);
  assert.equal(tl.length, 1);
  assert.equal(tl[0].studentNo, 'S1');
  assert.equal(JSON.stringify(tl[0].exams.map(e => e.examLabel)), JSON.stringify(['一模', '二模']));
  assert.equal(JSON.stringify(tl[0].weakCats), JSON.stringify([
    { category: 'tense', right: 1, wrong: 2 },
    { category: 'preposition', right: 0, wrong: 1 },
  ]));
});

test('resolveStudentName: 本地有则名、无则回退学号', () => {
  assert.equal(resolveStudentName({ '2023531001': '张三' }, '2023531001'), '张三');
  assert.equal(resolveStudentName({}, '2023531002'), '2023531002');
});

test('buildExamResultRows: 行里绝不含姓名（隐私红线）', () => {
  const profile = { students: [{ studentNo: 'S1', right: [], wrong: [36], blank: [], wrongQuestions: [{ no: 36, category: 'tense' }] }] };
  const rows = buildExamResultRows(profile, [], { classId: 'c', examId: 'e' });
  const allowed = ['client_id','class_id','class_name','exam_id','exam_label','exam_date','student_no','result'];
  Object.keys(rows[0]).forEach((k) => assert.ok(allowed.includes(k), '意外字段(疑似姓名): ' + k));
  assert.ok(!JSON.stringify(rows).includes('name'), '行 JSON 不应出现 name');
});
```

- [ ] **Step 2: 跑测试看它失败**

Run: `node --test test/student-tracking.test.js`
Expected: FAIL（模块不存在 / `w.GrammarStudentTracking` undefined）。

- [ ] **Step 3: 写实现** `docs/grammar-fill/modules/student-tracking.js`

```js
// grammar-fill/modules/student-tracking.js
// 纯逻辑：学生级数据——抽花名册(学号→姓名)、把班级画像拆每生一行(含byCat)、跨卷聚成时间线、按本地表解析名。
// 无浏览器宿主对象 / 无网络 / 无 SheetJS。
/* eslint-disable */
(function(){
  function colIndexOf(header, label) {
    var i = header.indexOf(label);
    if (i === -1) i = header.indexOf(Number(label));
    return i;
  }

  function extractStudentRoster(rows) {
    rows = rows || [];
    var header = rows[0] || [];
    var idCol = colIndexOf(header, '学号');
    var nameCol = header.indexOf('姓名');
    var out = [];
    if (idCol < 0) return out;
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r] || [];
      var sid = String(row[idCol] == null ? '' : row[idCol]).replace(/\.0$/, '').trim();
      if (!/^\d{6,}$/.test(sid)) continue;
      var name = nameCol >= 0 ? String(row[nameCol] == null ? '' : row[nameCol]).trim() : '';
      out.push({ studentNo: sid, name: name });
    }
    return out;
  }

  function buildExamResultRows(profile, examForBuild, meta) {
    profile = profile || {}; examForBuild = examForBuild || []; meta = meta || {};
    var catByNo = {};
    examForBuild.forEach(function(q){ catByNo[q.no] = q.category; });
    return (profile.students || []).map(function(s){
      var byCat = {};
      function bump(cat, key){ if (!cat) return; byCat[cat] = byCat[cat] || { right: 0, wrong: 0 }; byCat[cat][key]++; }
      var wq = s.wrongQuestions || [];
      if (wq.length) wq.forEach(function(q){ bump(q.category, 'wrong'); });
      else (s.wrong || []).forEach(function(no){ bump(catByNo[no], 'wrong'); });
      (s.right || []).forEach(function(no){ bump(catByNo[no], 'right'); });
      return {
        client_id: meta.classId + '__' + meta.examId + '__' + s.studentNo,
        class_id: meta.classId, class_name: meta.className || '',
        exam_id: meta.examId, exam_label: meta.examLabel || '', exam_date: meta.examDate || null,
        student_no: s.studentNo,
        result: { right: s.right || [], wrong: s.wrong || [], blank: s.blank || [], wrongQuestions: wq, byCat: byCat }
      };
    });
  }

  function buildStudentTimeline(rows) {
    rows = rows || [];
    var byStu = {};
    rows.forEach(function(row){
      var sn = row.student_no; if (!sn) return;
      if (!byStu[sn]) byStu[sn] = { studentNo: sn, exams: [], cat: {} };
      var st = byStu[sn];
      var res = row.result || {};
      st.exams.push({
        examId: row.exam_id, examLabel: row.exam_label || row.exam_id, examDate: row.exam_date || '',
        rightCount: (res.right || []).length, wrongCount: (res.wrong || []).length, blankCount: (res.blank || []).length,
        wrongQuestions: res.wrongQuestions || []
      });
      var bc = res.byCat || {};
      Object.keys(bc).forEach(function(c){
        st.cat[c] = st.cat[c] || { category: c, right: 0, wrong: 0 };
        st.cat[c].right += bc[c].right || 0;
        st.cat[c].wrong += bc[c].wrong || 0;
      });
    });
    return Object.keys(byStu).map(function(sn){
      var st = byStu[sn];
      st.exams.sort(function(a, z){ return String(a.examDate).localeCompare(String(z.examDate)); });
      st.weakCats = Object.keys(st.cat).map(function(c){ return st.cat[c]; })
        .filter(function(x){ return x.wrong > 0; })
        .sort(function(a, z){ return z.wrong - a.wrong; });
      delete st.cat;
      return st;
    }).sort(function(a, z){
      var aw = a.weakCats.reduce(function(s, x){ return s + x.wrong; }, 0);
      var zw = z.weakCats.reduce(function(s, x){ return s + x.wrong; }, 0);
      return zw - aw;
    });
  }

  function resolveStudentName(nameMap, studentNo) {
    nameMap = nameMap || {};
    return nameMap[studentNo] || studentNo;
  }

  window.GrammarStudentTracking = {
    extractStudentRoster: extractStudentRoster,
    buildExamResultRows: buildExamResultRows,
    buildStudentTimeline: buildStudentTimeline,
    resolveStudentName: resolveStudentName
  };
})();
```

- [ ] **Step 4: 跑测试看它过**

Run: `node --test test/student-tracking.test.js`
Expected: PASS（5 tests）。

- [ ] **Step 5: 门禁登记**

读 `scripts/check_grammar_modules.py`，把 `student-tracking.js` 加进 `EXPECTED_MODULES`（纯模块那组，与 error-profile.js 同列）。
Run: `python3 scripts/check_grammar_modules.py` → Expected: OK。

- [ ] **Step 6: Commit**
```bash
git add docs/grammar-fill/modules/student-tracking.js test/student-tracking.test.js scripts/check_grammar_modules.py
git commit -m "feat(student-tracking): 纯模块 抽花名册/拆每生行(byCat)/聚时间线/解析名 + 单测"
```

---

### Task 3: cloud.js —— exam_results 同步三件套

**Files:** Modify `docs/shared/cloud.js`

- [ ] **Step 1: 照搬 error_book 模式加三个函数**

先读 `docs/shared/cloud.js` 里 `error_book` 的 select/upsert/delete 写法（约 121–138 行）+ 模块如何拿 client 和 `state.user`、如何挂到导出对象。**严格沿用同样的取 client / state.user / 错误返回风格**。新增（命名/结构对齐现有）：

```js
async function uploadExamResults(rows) {
  if (!state.user) return { ok: false };
  var sb = getClient(); if (!sb) return { ok: false };
  var payload = (rows || []).map(function(r){ return Object.assign({ user_id: state.user.id }, r); });
  if (!payload.length) return { ok: true, count: 0 };
  var r = await sb.from('exam_results').upsert(payload, { onConflict: 'user_id,client_id' });
  return { ok: !r.error, error: r.error, count: payload.length };
}
async function fetchExamResults(classId) {
  if (!state.user) return { ok: false, rows: [] };
  var sb = getClient(); if (!sb) return { ok: false, rows: [] };
  var q = sb.from('exam_results').select('*').eq('user_id', state.user.id);
  if (classId) q = q.eq('class_id', classId);
  var r = await q.order('exam_date', { ascending: true });
  return { ok: !r.error, rows: r.data || [], error: r.error };
}
async function deleteExamResults(classId) {
  if (!state.user) return { ok: false };
  var sb = getClient(); if (!sb) return { ok: false };
  var r = await sb.from('exam_results').delete().eq('user_id', state.user.id).eq('class_id', classId);
  return { ok: !r.error, error: r.error };
}
```
> `getClient()` 用 cloud.js 里实际的取-client 方式替换（读文件确认它叫什么；error_book 函数里就有）。把三个函数挂到 cloud.js 对外暴露的对象上（与 error_book 同款导出位置）。

- [ ] **Step 2: 语法检查**

Run: `node --check docs/shared/cloud.js`
Expected: 无错误。（真连云验证留到 smoke mock + 负责人线上。）

- [ ] **Step 3: Commit**
```bash
git add docs/shared/cloud.js
git commit -m "feat(cloud): exam_results upload/fetch/delete(沿用error_book模式)"
```

---

### Task 4: app.js —— 本地名字层（owner-aware）

**Files:** Modify `docs/grammar-fill/app.js`

- [ ] **Step 1: 加三个函数**（紧挨现有 `classesKey/loadClasses` 那段，复用 `currentProfileOwnerId`）

```js
function studentNamesKey() { return 'grammar-student-names'; }
function loadStudentNames() {
  try {
    var raw = localStorage.getItem(studentNamesKey()); if (!raw) return {};
    var data = JSON.parse(raw);
    if (data && data._owner === currentProfileOwnerId()) return data.names || {};
    return {};
  } catch (e) { return {}; }
}
function saveStudentNames(names) {
  try { localStorage.setItem(studentNamesKey(), JSON.stringify({ _owner: currentProfileOwnerId(), names: names || {} })); } catch (e) {}
}
function mergeStudentNames(roster) {
  var names = loadStudentNames();
  (roster || []).forEach(function(s){ if (s && s.studentNo && s.name) names[s.studentNo] = s.name; });
  saveStudentNames(names);
  return names;
}
```

- [ ] **Step 2: 语法检查**

Run: `node --check docs/grammar-fill/app.js`
Expected: 无错误。

- [ ] **Step 3: Commit**
```bash
git add docs/grammar-fill/app.js
git commit -m "feat(app): 本地学号→姓名 名字层(owner隔离, 名字永不上云)"
```

---

### Task 5: 导入流程接线 —— 额外①写本地名 ②推云

**Files:** Modify `docs/grammar-fill/modules/error-profile-controller.js`、`docs/grammar-fill/app.js`

控制器 `tryRunProfile()` 里，算出 `profile` 之后、追加：抽花名册→merge 本地名；拆每生行→上云（非阻塞）。**务必插在 `_examQuestions = null; _scoreRows = null;` 重置行之前**——`_scoreRows`/`examForBuild` 这里还要用。

- [ ] **Step 1: 控制器 tryRunProfile 追加（在 `var profile = EP.buildErrorProfile(...)` 之后、`_scoreRows` 重置之前）**

```js
      // 额外①：学号→姓名 写本地（名字不上云）
      if (_imp.mergeStudentNames) {
        var roster = window.GrammarStudentTracking.extractStudentRoster(_scoreRows);
        _imp.mergeStudentNames(roster);
      }
      // 额外②：每生一行 upsert 上云（非阻塞，失败不影响本地画像）
      if (_imp.uploadExamResults) {
        var rows = window.GrammarStudentTracking.buildExamResultRows(profile, examForBuild, {
          classId: classId, className: _imp.classNameOf ? _imp.classNameOf(classId) : '',
          examId: examId, examLabel: examLabel, examDate: _imp.today ? _imp.today() : null
        });
        _imp.uploadExamResults(rows).catch(function(){ /* 静默：本地画像已存 */ });
      }
```
> `examId`/`examLabel` 用 tryRunProfile 里已有的（`_examId`/`_examLabel`）；若变量名不同，对齐当前文件实际名。`classId` 用 `classIdNow()` 的返回（函数里已有）。

- [ ] **Step 2: app.js 给导入页 deps 加这几项**（在 `renderErrorImportPage` 的 deps 对象里）

```js
    mergeStudentNames: mergeStudentNames,
    uploadExamResults: function(rows){ return (window.cloud && window.cloud.uploadExamResults) ? window.cloud.uploadExamResults(rows) : Promise.resolve({ ok: false }); },
    classNameOf: function(id){ var c = (loadClasses() || []).filter(function(x){ return x.id === id; })[0]; return c ? c.name : ''; },
    today: function(){ var d = new Date(); return d.getFullYear() + '-' + ('0'+(d.getMonth()+1)).slice(-2) + '-' + ('0'+d.getDate()).slice(-2); }
```
> 用 cloud.js 实际暴露对象名替换 `window.cloud`（读 app.js 顶部 / cloud-sync.js 确认；error_book 同步就是经它）。`Date` 在浏览器可用（非 workflow 脚本环境）。

- [ ] **Step 3: 验证**

Run: `node --check docs/grammar-fill/modules/error-profile-controller.js && node --check docs/grammar-fill/app.js`
Expected: 无错误。`python3 scripts/check_grammar_modules.py` → OK。

- [ ] **Step 4: Commit**
```bash
git add docs/grammar-fill/modules/error-profile-controller.js docs/grammar-fill/app.js
git commit -m "feat(error-profile): 导入时额外 写本地名 + 每生行推云(非阻塞)"
```

---

### Task 6: 渲染 —— 学生时间线（render）+ 单测

**Files:** Modify `docs/grammar-fill/modules/error-profile-render.js`、`test/error-profile-render.test.js`

加一个纯函数 `studentTimelineHtml(timeline, nameMap)`：传 `buildStudentTimeline` 的结果 + 本地名字表，渲染每个学生卡（本地显名、top 弱考点、各卷对错小条）。用 `window.GrammarStudentTracking.resolveStudentName` 解析名；`esc`=window.escapeHtml 转义。

- [ ] **Step 1: 写失败测试**（追加到 `test/error-profile-render.test.js`，并把 `studentTimelineHtml` 加进该文件顶部对 `GrammarErrorProfileRender` 的解构）

```js
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
  assert.ok(html.includes('tense') || html.includes('时态'), '应显示弱考点');
});
```
> 若考点要显示中文名，render 里用传入的 catNames（与现有 profilePageHtml 一致）；测试断言放宽成 `tense` 或中文都接受。

- [ ] **Step 2: 跑测试看失败**

Run: `node --test test/error-profile-render.test.js`
Expected: FAIL（`studentTimelineHtml` undefined）。

- [ ] **Step 3: 实现 `studentTimelineHtml` 并加进导出**（`error-profile-render.js`）

```js
  function studentTimelineHtml(timeline, nameMap) {
    timeline = timeline || [];
    var resolve = (window.GrammarStudentTracking && window.GrammarStudentTracking.resolveStudentName) || function(m, s){ return (m && m[s]) || s; };
    if (!timeline.length) {
      return '<div style="background:#fff;border:1px solid #eee;border-radius:14px;padding:24px;color:#888;text-align:center;">这个班还没有上过云的成绩。导一次成绩就有了。</div>';
    }
    return timeline.map(function(st){
      var name = esc(resolve(nameMap || {}, st.studentNo));
      var weak = (st.weakCats || []).slice(0, 5).map(function(c){
        return '<span style="display:inline-block;margin:2px 6px 2px 0;padding:2px 8px;border-radius:10px;background:#fff0f0;color:#c0392b;font-size:12px;">' + esc(c.category) + ' 错' + c.wrong + '</span>';
      }).join('');
      var exams = (st.exams || []).map(function(e){
        return '<span style="display:inline-block;min-width:96px;margin:3px 6px 3px 0;padding:4px 8px;border:1px solid #eee;border-radius:8px;font-size:12px;">'
          + esc(e.examLabel) + '：对' + e.rightCount + ' 错' + e.wrongCount + (e.blankCount ? ' 缺' + e.blankCount : '') + '</span>';
      }).join('');
      return '<div style="background:#fff;border:1px solid #eee;border-radius:14px;padding:16px 20px;margin-bottom:12px;">'
        + '<div style="font-weight:600;margin-bottom:6px;">' + name + '</div>'
        + (weak ? '<div style="margin-bottom:8px;">高频弱项：' + weak + '</div>' : '')
        + '<div>' + exams + '</div>'
        + '</div>';
    }).join('');
  }
```
把 `studentTimelineHtml: studentTimelineHtml` 加进 `window.GrammarErrorProfileRender = {...}`。

- [ ] **Step 4: 跑测试看过**

Run: `node --test test/error-profile-render.test.js`
Expected: PASS。

- [ ] **Step 5: Commit**
```bash
git add docs/grammar-fill/modules/error-profile-render.js test/error-profile-render.test.js
git commit -m "feat(error-profile): studentTimelineHtml 学生时间线渲染 + 单测"
```

---

### Task 7: 接进 SPA —— 学生时间线页 + 入口 + 派发

**Files:** Modify `docs/grammar-fill/index.html`、`docs/grammar-fill/modules/app-state.js`、`docs/grammar-fill/modules/error-profile-controller.js`、`docs/grammar-fill/app.js`、`tests/smoke.spec.js`

- [ ] **Step 1: index.html 加页面容器**（仿 `#page-error-profile` 那块）
```html
<div id="page-student-timeline" class="page"><div id="studentTimelineContent" class="dashboard-pad"></div></div>
```
（class/包裹结构对齐现有 `#page-error-profile`，读它照抄。）

- [ ] **Step 2: app-state.js 登记**

读 `app-state.js`，把 `'student-timeline'` 加进 `normalizePageKey`/`isProtectedPage`/`normalizeDockKey`/`getDockKeyForPage`（与 `error-profile` 同处理；它归到画像那个 dock）。

- [ ] **Step 3: 控制器加 renderTimelinePage(deps)**（`error-profile-controller.js`）

```js
  function renderTimelinePage(deps) {
    _tl = deps || _tl;
    var el = document.getElementById('studentTimelineContent');
    if (!el) return;
    var classes = (_tl.getClasses && _tl.getClasses()) || [];
    var classListModel = window.GrammarErrorProfileStore.buildClassListModel(classes, (_tl.loadProfiles && _tl.loadProfiles()) || []);
    if (!_tlClassId && classListModel.length) _tlClassId = classListModel[0].id;
    el.innerHTML = window.GrammarErrorProfileRender.classChipsHtml(classListModel, _tlClassId)
      + '<div id="stTimelineList" style="margin-top:14px;color:#888;">加载中…</div>';
    el.querySelectorAll('.ep-class-chip').forEach(function(btn){
      btn.addEventListener('click', function(){ _tlClassId = btn.getAttribute('data-id'); renderTimelinePage(_tl); });
    });
    var list = document.getElementById('stTimelineList');
    if (!_tlClassId) { if (list) list.textContent = '先建个班、导一次成绩。'; return; }
    if (!_tl.fetchExamResults) { if (list) list.textContent = '云同步未就绪（请登录）。'; return; }
    _tl.fetchExamResults(_tlClassId).then(function(res){
      var rows = (res && res.rows) || [];
      var timeline = window.GrammarStudentTracking.buildStudentTimeline(rows);
      var names = (_tl.loadStudentNames && _tl.loadStudentNames()) || {};
      if (list) list.innerHTML = window.GrammarErrorProfileRender.studentTimelineHtml(timeline, names);
    }).catch(function(){ if (list) list.textContent = '加载失败，稍后重试。'; });
  }
```
模块顶部加 `var _tl = null, _tlClassId = null;`；导出加 `renderTimelinePage: renderTimelinePage`。

- [ ] **Step 4: 班级画像板块加入口按钮**（`error-profile-controller.js` 的 `renderBoardPage`，在 class chips 旁或顶部加一个「📈 学生时间线」按钮）

```js
    // 在 renderBoardPage 渲染后，绑定一个进时间线的按钮（HTML 里加 <button id="epToTimeline">📈 学生时间线</button>，或复用现有顶栏）
    var toTl = document.getElementById('epToTimeline');
    if (toTl) toTl.addEventListener('click', function(){ if (_brd.gotoTimeline) _brd.gotoTimeline(); });
```
按钮 HTML：在 `renderBoardPage` 的 `el.innerHTML = classChipsHtml(...) + ...` 串里，class chips 后追加 `'<button id="epToTimeline" style="margin:0 0 10px;padding:6px 14px;border-radius:999px;border:1px solid #cfe3ff;background:#f0f7ff;color:#0071e3;cursor:pointer;font-size:13px;">📈 学生时间线</button>'`。

- [ ] **Step 5: app.js 接派发 + deps**

```js
function renderStudentTimelinePage() {
  return window.GrammarErrorProfileController.renderTimelinePage({
    getClasses: loadClasses,
    loadProfiles: loadErrorProfiles,
    loadStudentNames: loadStudentNames,
    fetchExamResults: function(classId){ return (window.cloud && window.cloud.fetchExamResults) ? window.cloud.fetchExamResults(classId) : Promise.resolve({ ok: false, rows: [] }); }
  });
}
```
- `renderErrorProfilePage` 的 board deps 里加 `gotoTimeline: function(){ switchPage('student-timeline'); }`。
- `switchPage` 派发里加：`if (page === 'student-timeline') renderStudentTimelinePage();`
- `window.cloud` 用实际对象名替换。

- [ ] **Step 6: smoke 加一条**（`tests/smoke.spec.js`，仿现有错题画像那条；mock 云端 fetch）

```js
test('学生时间线：选班 + 渲染(mock 云端)', async ({ page }) => {
  const errors = collectFatalBrowserErrors(page);
  await mockSignedInTeacher(page);
  await page.goto('/docs/grammar-fill/');
  await expect(page.locator('html')).toHaveClass(/ready/);
  await page.evaluate(() => {
    // 建班 + 注入本地名字 + mock 云端返回
    localStorage.setItem('grammar-classes', JSON.stringify({ _owner: 'smoke-user-1', items: [{ id: 'cls_x', name: '高三①班' }] }));
    localStorage.setItem('grammar-student-names', JSON.stringify({ _owner: 'smoke-user-1', names: { 'S1': '张三' } }));
    window.cloud = window.cloud || {};
    window.cloud.fetchExamResults = async () => ({ ok: true, rows: [
      { student_no: 'S1', exam_id: 'e1', exam_label: '一模', exam_date: '2026-03-01',
        result: { right: [], wrong: [36], blank: [], wrongQuestions: [{ no: 36, category: 'tense' }], byCat: { tense: { right: 0, wrong: 1 } } } }
    ] });
  });
  await page.evaluate(() => window.switchPage('student-timeline'));
  await expect(page.locator('#page-student-timeline')).toHaveClass(/active/);
  await expect(page.locator('#studentTimelineContent')).toContainText('张三');
  await expect(page.locator('#studentTimelineContent')).toContainText('一模');
  expect(errors).toEqual([]);
});
```
> mock 的注入时机/`window.cloud` 名以现有 smoke 对 cloud 的处理为准（读现有 smoke 里 mockSignedInTeacher 怎么搭 cloud）。

- [ ] **Step 7: 跑 smoke 这条 + node:test**

Run: `npx playwright test tests/smoke.spec.js -g "学生时间线" --reporter=line`（或 `npm run check` 跑全量）
Expected: PASS。

- [ ] **Step 8: Commit**
```bash
git add docs/grammar-fill/index.html docs/grammar-fill/modules/app-state.js docs/grammar-fill/modules/error-profile-controller.js docs/grammar-fill/app.js tests/smoke.spec.js
git commit -m "feat(student-timeline): 时间线页+入口+派发+smoke"
```

---

### Task 8: 全量门禁 + 收尾

**Files:** —（仅运行）

- [ ] **Step 1: 全量校验**

Run: `npm run test:unit && npm run check`
Expected: 全绿（含 check_supabase_migrations、check_grammar_modules、34+ smoke、新增 smoke）。

- [ ] **Step 2: 修任何红的**（按报错定位；常见：app-state 漏登记某 key → 页面不 active；模块没进 EXPECTED_MODULES）。

- [ ] **Step 3: 最终 commit（若有修）**
```bash
git add -A && git commit -m "chore(student-tracking): 全量门禁绿"
```

---

## 完成定义
- `exam_results` 表 + RLS + 回滚入库，`check_supabase_migrations` 绿。
- 导入成绩 → 每生一行上云（**负载不含姓名**）+ 学号→姓名写本地。
- 学生时间线页：选班 → 看每个学生各卷考点历程，本地显名（无名回退学号）。
- 现有班级画像 / 错题迁移 / 备课 **零回归**；`npm run check` 全绿。

## 不含（推迟）
- **历史 localStorage 画像回填上云** —— 先跑通新导入即可；回填留作小跟进（按 client_id 幂等，遍历现有 profiles 重算 rows 上传）。
- 组织层（科组长/管理员）、永久学号、跨届、班级画像板块上云。
- AI/云真连验证靠负责人线上（migration 需在 Supabase 控制台 apply 后才生效）。

## 风险
- 云写非阻塞、失败静默——本地画像不受影响，但学生时间线在 apply 迁移 + 登录前是空的（属预期）。
- `window.cloud` / `getClient` / `state.user` 等具体符号名以现有 cloud.js 为准，实现时读文件对齐。
