# 错题画像 · 切片① 实施计划（导入解析 + 题库匹配 + 算画像）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 一个纯模块，把网阅「学生小题分」的行数据 + 题库某套卷的考点，算成「班级考点画像 + 每生弱考点 + 每生题级错题集」。

**Architecture:** 纯逻辑模块 `docs/grammar-fill/modules/error-profile.js`（IIFE 挂 `window.GrammarErrorProfile`，无 DOM / 无网络 / 无 SheetJS——只「数据进、数据出」），由 `node:test` 单测验证（用 `vm` 把模块加载到 `window`，沿用 `test/grammar-points.test.js` 写法）。.xls→行数据的解析（浏览器里用 SheetJS，沿用 `docs/score-analysis` 的做法）属后续 UI 切片，不在本片。

**Tech Stack:** vanilla JS（IIFE 纯模块）· `node --test` · 既有题库 `window.GRAMMAR_BANK`（question 字段：`no` / `category` / `fine_category` / `answer` / `exam_id`）。

**设计依据：** [docs/planning/2026-06-08-错题精准训练-v1-design.md](../../planning/2026-06-08-错题精准训练-v1-design.md) §5（数据与匹配，已用真实成绩单 PoC 验证）。

**数据形状（实测自真实成绩单）：**
- 行数据 = 数组的数组（SheetJS `sheet_to_json {header:1}`）：row0 = 表头（`序号/姓名/班级/学号/考号/…/36/37/…/45`），row1 = 子表头（`得分/作答`），row2+ = 学生。语法填空 = 题号 36–45，每题一列「得分」，**1.5=对 / 0.0=错**。
- 题库 exam 的语法填空题：`{ no:36, category:'preposition', fine_category:'prep-common', answer:'from' }` …

---

### Task 1: `extractGrammarResults` —— 按表头定位学号与 36–45 列，得分 0 = 错

**Files:**
- Create: `docs/grammar-fill/modules/error-profile.js`
- Test: `test/error-profile.test.js`

- [ ] **Step 1: Write the failing test**

写 `test/error-profile.test.js`：

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
const w = loadWindow(['docs/grammar-fill/modules/error-profile.js']);
const { extractGrammarResults } = w.GrammarErrorProfile;
const json = (v) => JSON.stringify(v);

test('extractGrammarResults: 按表头定位学号与36-45列，得分0=错，跳过非学生行', () => {
  const rows = [
    ['序号','姓名','班级','学号','36','37','38'],          // 表头（简化：语填只放 36-38）
    ['','','','','得分','得分','得分'],                     // 子表头（学号列为空→跳过）
    ['1','张三','17班','2023531001','1.5','0.0','1.5'],     // 张三 错 37
    ['2','李四','17班','2023531002','0.0','0.0','1.5'],     // 李四 错 36,37
    ['','平均','','','1.0','0.5','1.5'],                    // 统计行（无学号）→跳过
  ];
  const res = extractGrammarResults(rows, [36, 37, 38]);
  assert.equal(json(res.students), json([
    { studentNo: '2023531001', wrong: [37] },
    { studentNo: '2023531002', wrong: [36, 37] },
  ]));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/error-profile.test.js`
Expected: FAIL —— `Cannot read properties of undefined (reading 'GrammarErrorProfile')`（模块还没建）。

- [ ] **Step 3: Write minimal implementation**

建 `docs/grammar-fill/modules/error-profile.js`：

```js
// grammar-fill/modules/error-profile.js
//
// 纯逻辑：网阅「学生小题分」行数据 → 每生语法填空错题；再 → 班级/个人考点画像。
// 无 DOM / 无网络 / 无 SheetJS。.xls 的解析由调用方（页面用 SheetJS）做，把行数组传进来。

/* eslint-disable */
(function(){
  function colIndexOf(header, label) {
    var i = header.indexOf(label);
    if (i === -1) i = header.indexOf(Number(label));   // 表头可能是数字而非字符串
    return i;
  }

  // rows: 数组的数组（含表头/子表头）；grammarNos: 该套卷语法填空题号，如 [36..45]
  function extractGrammarResults(rows, grammarNos) {
    rows = rows || [];
    grammarNos = grammarNos || [];
    var header = rows[0] || [];
    var idCol = colIndexOf(header, '学号');
    var noCol = {};
    grammarNos.forEach(function(no){ noCol[no] = colIndexOf(header, String(no)); });

    var students = [];
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r] || [];
      var sid = idCol >= 0 ? String(row[idCol] == null ? '' : row[idCol]) : '';
      sid = sid.replace(/\.0$/, '').trim();
      if (!/^\d{6,}$/.test(sid)) continue;             // 跳过表头/子表头/统计等非学生行
      var wrong = [];
      grammarNos.forEach(function(no){
        var c = noCol[no];
        if (c == null || c < 0) return;
        var v = row[c];
        var score = (v === '' || v == null) ? null : Number(v);
        if (score === 0) wrong.push(no);
      });
      students.push({ studentNo: sid, wrong: wrong });
    }
    return { students: students };
  }

  window.GrammarErrorProfile = {
    extractGrammarResults: extractGrammarResults
  };
})();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/error-profile.test.js`
Expected: PASS（1 test）。

- [ ] **Step 5: Commit**

```bash
git add docs/grammar-fill/modules/error-profile.js test/error-profile.test.js
git commit -m "feat(error-profile): extractGrammarResults 解析网阅小题分→每生语法填空错题"
```

---

### Task 2: `buildErrorProfile` —— 题号匹配考点，出班级画像 + 个人弱项 + 题级错题集

**Files:**
- Modify: `docs/grammar-fill/modules/error-profile.js`（加 `buildErrorProfile`，并加进导出对象）
- Test: `test/error-profile.test.js`（追加用例）

- [ ] **Step 1: Write the failing test**

在 `test/error-profile.test.js` 顶部把解构改成：

```js
const { extractGrammarResults, buildErrorProfile } = w.GrammarErrorProfile;
```

追加用例：

```js
test('buildErrorProfile: 题号→考点匹配，出班级画像+个人弱项+题级错题集', () => {
  const studentResults = { students: [
    { studentNo: '2023531001', wrong: [37] },
    { studentNo: '2023531002', wrong: [36, 37] },
  ]};
  const examQuestions = [
    { no: 36, category: 'preposition', fine_category: 'prep-common', answer: 'from' },
    { no: 37, category: 'number',      fine_category: 'num-plural',  answer: 'gestures' },
    { no: 38, category: 'word',        fine_category: 'word-adv',    answer: 'instantly' },
  ];
  const p = buildErrorProfile(studentResults, examQuestions);
  assert.equal(json(p.classByCat), json({ number: 2, preposition: 1 }));
  assert.equal(json(p.classByNo), json({ '37': 2, '36': 1 }));
  assert.equal(json(p.students[0]), json({
    studentNo: '2023531001',
    wrongCats: ['number'],
    wrongQuestions: [{ no: 37, category: 'number', fine_category: 'num-plural', answer: 'gestures' }],
  }));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/error-profile.test.js`
Expected: FAIL —— `buildErrorProfile is not a function`。

- [ ] **Step 3: Write minimal implementation**

在 `error-profile.js` 的 IIFE 内、`window.GrammarErrorProfile = ...` 之前，加：

```js
  // studentResults: extractGrammarResults 的产物（{students:[{studentNo,wrong:[题号]}]}）
  // examQuestions: 该套卷语法填空题 [{no,category,fine_category,answer}]
  function buildErrorProfile(studentResults, examQuestions) {
    examQuestions = examQuestions || [];
    var list = (studentResults && studentResults.students) || studentResults || [];
    var qByNo = {};
    examQuestions.forEach(function(q){ qByNo[String(q.no)] = q; });

    var classByCat = {};
    var classByNo = {};
    var students = list.map(function(s){
      var wrongCats = [];
      var wrongQuestions = [];
      (s.wrong || []).forEach(function(no){
        var q = qByNo[String(no)];
        if (!q) return;
        wrongCats.push(q.category);
        wrongQuestions.push({ no: q.no, category: q.category, fine_category: q.fine_category, answer: q.answer });
        classByCat[q.category] = (classByCat[q.category] || 0) + 1;
        classByNo[no] = (classByNo[no] || 0) + 1;
      });
      return { studentNo: s.studentNo, wrongCats: wrongCats, wrongQuestions: wrongQuestions };
    });
    return { classByCat: classByCat, classByNo: classByNo, students: students };
  }
```

并把导出对象改成：

```js
  window.GrammarErrorProfile = {
    extractGrammarResults: extractGrammarResults,
    buildErrorProfile: buildErrorProfile
  };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/error-profile.test.js`
Expected: PASS（2 tests）。

- [ ] **Step 5: Commit**

```bash
git add docs/grammar-fill/modules/error-profile.js test/error-profile.test.js
git commit -m "feat(error-profile): buildErrorProfile 匹配考点→班级画像+个人弱项+题级错题集"
```

---

### Task 3: 端到端用例（真实 2026广州一模考点）+ 全量校验

**Files:**
- Test: `test/error-profile.test.js`（追加端到端用例）

- [ ] **Step 1: Write the failing test**

追加（用真实 2026广州一模语法填空考点映射 + 合成学生，验证 extract→build 串起来）：

```js
test('端到端：extract→build 用真实2026广州一模考点跑通', () => {
  // 真实 2026广州一模 语法填空考点（来自题库 data/grammar_bank.json，仅取 36/40/44）。
  // 题库记录只有粗 category（无 fine_category 字段；细标签在 UI 层用 question-points 另算），
  // 故此处只用 no/category/answer 三个真实字段断言。第40题 value→valuing 是动名词同位语＝非谓语。
  const exam = [
    { no: 36, category: 'preposition',  answer: 'from' },
    { no: 40, category: 'nonpredicate', answer: 'valuing' },
    { no: 44, category: 'nonpredicate', answer: 'rooted' },
  ];
  const rows = [
    ['序号','姓名','班级','学号','36','40','44'],
    ['','','','','得分','得分','得分'],
    ['1','甲','17班','2023531001','0.0','0.0','1.5'],   // 错 36,40
    ['2','乙','17班','2023531002','1.5','0.0','0.0'],   // 错 40,44
  ];
  const results = extractGrammarResults(rows, [36, 40, 44]);
  const p = buildErrorProfile(results, exam);
  assert.equal(json(p.classByCat), json({ preposition: 1, nonpredicate: 3 }));
  // 题级错题集：学生1 错了 第36题(介词,from) 与 第40题(非谓语,valuing)
  assert.equal(json(p.students[0].wrongQuestions), json([
    { no: 36, category: 'preposition',  answer: 'from' },
    { no: 40, category: 'nonpredicate', answer: 'valuing' },
  ]));
});
```

并追加一条边界用例（缺考空白行 → `wrong:[]`，blank ≠ 错；保护真实数据里缺考学生不被误判全错）：

```js
test('extractGrammarResults: 整行空白（缺考/未作答）→ wrong 为空，不误判为全错', () => {
  const rows = [
    ['序号','姓名','班级','学号','36','37'],
    ['','','','','得分','得分'],
    ['1','缺考生','17班','2023531009','',''],   // 整行空白 → 缺考，blank ≠ 错
  ];
  const res = extractGrammarResults(rows, [36, 37]);
  assert.equal(json(res.students), json([
    { studentNo: '2023531009', wrong: [] },
  ]));
});
```

- [ ] **Step 2: Run test to verify it fails / passes**

Run: `node --test test/error-profile.test.js`
Expected: PASS（3 tests）——若前两片实现正确，本用例应直接通过（它只是组合验证）。若 FAIL，按报错回到 Task 1/2 修。

- [ ] **Step 3: 全量校验没破坏别的**

Run: `npm run test:unit`
Expected: 所有单测 PASS（含新 `error-profile`；脚本是 glob `test/**/*.test.js`，自动收新文件）。

Run: `npm run check`
Expected: `OK: all engineering checks passed`。新模块未登记进 EXPECTED_MODULES、也未进 index.html，而模块门禁（check_grammar_modules.py）只扫「已登记模块 + index.html 里加载的脚本」，故对它视而不见、不受影响——登记留到接 UI 的切片。

- [ ] **Step 4: Commit**

```bash
git add test/error-profile.test.js
git commit -m "test(error-profile): 真实2026广州一模端到端用例（考点画像+题级错题集）"
```

---

## 本片完成定义

- `error-profile.js` 纯模块导出 `extractGrammarResults` + `buildErrorProfile`，`node --test test/error-profile.test.js` 全绿（3 用例）。
- `npm run test:unit` 全绿、`npm run check` 仍 `OK`（新模块未登记，模块门禁不受影响）。
- **不含**：.xls→行数据的 SheetJS 解析、UI、云端存储、登记进 index.html/门禁——这些在后续切片（切片②班级画像视图起）。

## 下一片预告（不在本计划）

切片②：页面里用 SheetJS 读 .xls → 调本模块 → 渲染班级画像（条形 + 考点排行）。届时把 `error-profile.js` 登记进 `check_grammar_modules.py` 的 EXPECTED_MODULES + index.html 脚本清单 + 更新 PROJECT_LOG（按 AGENTS.md 加模块规矩）。

> **本片暴露的一个真实数据事实（切片② / 题级画像须知）**：题库 `data/grammar_bank.json` 的题目记录**没有 `fine_category` 字段**——只有粗 `category`（如 `preposition`/`nonpredicate`/`word`）+ `category_name` + `grammar_point`（中文，如「非谓语动词」）。`buildErrorProfile` 已能容忍缺 `fine_category`（它只是原样透传，缺则 JSON 省略）。因此**考点级画像现在只能做到粗 category 粒度**；要做 spec §5 想要的「细 fine_category」迁移，切片②须先用既有 `question-points.js` / `getFineTagInfo` 在 UI 层算出细标签再喂给本模块——不能指望题库直接给。
