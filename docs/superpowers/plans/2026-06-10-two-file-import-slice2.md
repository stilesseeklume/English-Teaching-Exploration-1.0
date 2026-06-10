# 双文件导入 · slice2：套卷(Word/题库) + 成绩 拖拽 + 1.5 自动认语填

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use `- [ ]` checkboxes.

**Goal:** 导入页改成两个拖拽框——**套卷**（拖 Word → AI 解析考点，或从题库选）+ **成绩**（拖网阅 .xls）——两个都拖好后，按「**成绩单里满分 1.5/题的列 = 语法填空**」自动认列、按顺序和套卷考点配对，出画像存进所选班级。**不写死题号 36–45。**

**设计依据（负责人确认）：** 语填题号不固定；成绩单中每题满分 1.5 的列即语法填空，按此自动识别，再按题号升序与套卷语填题逐一配对。套卷优先题库选（老卷不重传），新卷拖 Word 走现有 `deepseek-parse`。复用备课的 Word 上传/解析（`shared/word-import.js` + `deepseek-parse`）。

**Tech Stack:** vanilla JS（纯模块 + 控制器）· SheetJS · 备课现成的 word-import + deepseek-parse(AI) · node:test · smoke · 门禁。前置：slice1 的班级 + error-profile 模块已上线（main）。

---

### Task 1: 引擎 —— 按 1.5 分自动认语填 + 按序对齐套卷（纯，TDD）

**Files:** Modify `docs/grammar-fill/modules/error-profile.js`；Test `test/error-profile.test.js`（追加用例）

加两个纯函数（不改现有 extract/build）：

- `detectGrammarNos(rows)` → 返回语法填空题号数组（按列/题号升序）。判定：表头是题号（数字 1–200）的列，且该列**非空学生得分全部 ∈ {0, 1.5}**（满分 1.5 的客观题=语填；其它题型满分不是 1.5）。**不要求出现过 1.5**（全班都错那题也要算进来）。
- `alignExamQuestions(examQuestions, detectedNos)` → 把套卷语填题（按题号升序）的 `no` **按位置重映射**成 `detectedNos[i]`，返回新数组。用途：套卷 Word 的语填编号可能和成绩单不一致（如 Word 标 1–10、成绩单 36–45），按序对齐后，现有 `extractGrammarResults(rows, detectedNos)` + `buildErrorProfile(results, alignedExam)` 直接能跑。

测试要点（synthetic）：
- detectGrammarNos：一个含「序号/姓名/学号 + 题号列（含 1.5/0 的语填列 + 2.5/0 的非语填列 + 全 0 的语填列）」的 rows → 只返回语填列题号（含全 0 那列），不含 2.5 那列；非题号表头列跳过。
- alignExamQuestions：examQuestions 题号 [1,2,3] + detectedNos [36,40,44] → 返回 no 变成 [36,40,44]、category/answer 不变。

**验收：** `node --test test/error-profile.test.js` 全绿。Commit。

---

### Task 2: 套卷 Word 解析 → 语填题（控制器接备课现成 AI）

**Files:** Modify `error-profile-controller.js`、`app.js`（deps）

- 先**探明备课的 Word 上传/解析链路**：`shared/word-import.js` 怎么把 Word File → 文本 → 调 `deepseek-parse` → 得到 blanks（`{no, answer, category, fine_category}`）。在 `app.js` 里包一个 `parseExamWord(file) → Promise<[{no,category,answer}...]>`（语填题，按题号升序），复用备课同一套解析；只取语法填空那些 blank。
- 控制器 import deps 增加 `parseExamWord`。**这步是异步 + 走 DeepSeek**（解析中要给「解析中…」反馈）。
- 注意：deepseek-parse 受 `verify_jwt` + 限流保护（要登录）。

**验收：** `node --check`；真实 Word 手测解析出语填题（含 passage/答案/考点）。Commit。

---

### Task 3: UI —— 两个拖拽框（render）

**Files:** Modify `error-profile-render.js`；Test `test/error-profile-render.test.js`

- 改 `uploadPanelHtml`（或新 `importPanelHtml(exams)`）为：
  - **套卷**：题库下拉（已有）+ 「或拖 Word 卷子进来」拖拽区（dashed，仿备课那个：`把 Word 卷子拖进来，或点击上传`），id `errorExamDrop` + 隐藏 `<input type=file id=errorExamFile accept=".docx">`。
  - **成绩**：拖拽区（dashed）`把网阅成绩 .xls 拖进来，或点击上传`，id `errorScoreDrop` + 隐藏 `<input type=file id=errorProfileFile accept=".xls,.xlsx">`。
- 纯字符串渲染，esc 转义。测试：含两个拖拽区文案 + 两个 input id。

**验收：** `node --test`。Commit。

---

### Task 4: 控制器编排 —— 套卷 + 成绩 → 自动认语填 → 对齐 → 画像进班

**Files:** Modify `error-profile-controller.js`

- 导入页状态：`_examQuestions`（语填题，来自题库选 OR Word 解析）、`_scoreRows`（成绩 rows）。
- 套卷就绪（题库选了 / Word 解析完）→ 存 `_examQuestions`（按题号升序）。
- 成绩拖入 → SheetJS → `_scoreRows`。
- 两者都就绪 + 选了班级 → 跑：
  ```
  detectedNos = detectGrammarNos(_scoreRows)
  aligned = alignExamQuestions(_examQuestions, detectedNos)
  results = extractGrammarResults(_scoreRows, detectedNos)
  profile = buildErrorProfile(results, aligned)
  → 存 entry(classId, examLabel, profile) → 跳板块
  ```
- 拖拽事件（dragover/drop/click→input）接两个区；Word 区 → `parseExamWord`（异步，转圈）。
- 数量不一致（detectedNos.length ≠ examQuestions.length）→ 友好提示，别硬配。

**验收：** smoke（注入 rows + exam 走一遍）；真实 Word+成绩 手测。Commit。

---

### Task 5: 门禁登记 + smoke + 全量校验

- 门禁：error-profile.js exports 加 `detectGrammarNos`/`alignExamQuestions`；render exports 同步。
- smoke：导入页两个拖拽区在；注入 rows+exam → detect→align→build 出画像。
- `npm run test:unit` + `npm run check` 全绿。Commit。

---

## 完成定义
- 导入页两个拖拽框（套卷 Word/题库 + 成绩 .xls），拖好 → 自动认语填(1.5)→ 按序对齐 → 画像进所选班级。题号不写死。门禁+smoke 全绿。

## 不含 / 风险
- Word 解析走 DeepSeek（异步、要登录、花钱）——沿用现有限流。
- 自动认语填靠「满分 1.5」启发式；若某卷有别的 1.5/题题型会误判（负责人确认语填独占 1.5）。数量不符时提示、不硬配。
- 多班自动拆（成绩单班级列）仍不做——一份成绩单当一个班（slice1 既定）。
