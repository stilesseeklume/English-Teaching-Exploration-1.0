# 讲题台渲染抽离(第三批·讲题台外壳 + dock)设计

> 状态:设计已审。下一步 → writing-plans 产出实现计划。
> 上游:batch 1 `dfc7633`;batch 2 `51d955e`/`d0a2c3b`/`9139875`(plan `docs/planning/2026-05-30-teaching-render-extraction-batch2-plan.md`)。分支 `feature/teaching-render`。

## Goal

把 teaching 域最后两块仍内联在 `index.html` 的成块 HTML 装配——`renderTeachingStage` 的讲题台外壳、`renderTeachingDock` 的 dock——的**纯渲染部分**迁入 `teaching-render.js`,并删掉一处已确认零调用的死代码 `renderMigrationEmptyHint`。行为零差异。

## 核心原则(沿用 batch 1/2,不变)

模块函数**只接收「数据 model + 已生成的 HTML 片段」,纯拼字符串输出**;取数、副作用(快照读写、`syncAppState`、`recordUsageEvent` 埋点、DOM 写入、`scrollIntoView`)、片段生成,**全留 index.html 的 inline 编排**。副作用原位不变 = 行为零差异最强保证。

## 范围(已确认)

- 抽 `teachingStageHtml(model, parts)` 与 `teachingDockHtml(model)` 两个纯函数。
- 删死代码 `renderMigrationEmptyHint`(index.html 当前 7528-7539,全文件零调用,batch 1/2 把 empty-hint 搬进模块内部 `migrationEmptyHint` 后的残留)。
- **非目标**:不碰交互函数(`setTeachingTab`/`jumpTeachingQuestion`/`teardownTeachingStage`/`toggleTeaching*` 等)、不碰片段函数(`renderTeachingQuestionSentence`/`renderTeachingMigrationSentence`/`renderSentenceWithBlank`)、不改任何 class/onclick 文本/CSS、不引入构建工具。其余仍内联的 render 函数(home/sidebar/knowledge/practice/decision-map)属其他主题,不在本批。

## 组件设计

### 1. `teachingStageHtml(model, parts)` — 讲题台外壳

- **搬入**:`renderTeachingStage` 中 `main.innerHTML = '<div class="teaching-stage-shell">' ... '</div>'` 整段字符串装配(当前 7213-7230)。
- **入参**:
  - `model` = `window.GrammarTeachingViewModel.buildTeachingStageShellModel(...)` 产物,用到 `sourceLabel` / `questionLabel` / `categoryLabel` / `focusContent` / `zhSentence`。
  - `parts = { questionSentenceHtml, contentHtml }`:
    - `questionSentenceHtml` = `renderTeachingQuestionSentence(q)`(inline 预建,片段函数留原位)。
    - `contentHtml` = try/catch 按 `tab` 派发出的 `buildTeachingGuideHtml` / `buildTeachingMigrationHtml`(含 `recordUsageEvent` 埋点)/ `buildTeachingKnowledgeHtml` 结果(inline 预建,副作用留原位)。
- **机械替换**:`escapeHtml(` → `window.escapeHtml(`;`stageModel.` → `model.`;`renderTeachingQuestionSentence(q)` → `parts.questionSentenceHtml`;`contentHtml`(变量)→ `parts.contentHtml`。拼装结构、class、`<details>`/`<section>` 条件分支一律不动。
- **inline `renderTeachingStage` 改桥**:保留全部副作用(7178-7212 取数/快照/`buildTeachingStageShellModel`/try-catch 派发,7231-7238 `scrollTop`/`renderTeachingDock()`/rAF 滚动),仅把赋值改为:
  ```js
  main.innerHTML = window.GrammarTeachingRender.teachingStageHtml(stageModel, {
    questionSentenceHtml: renderTeachingQuestionSentence(q),
    contentHtml: contentHtml
  });
  ```

### 2. `teachingDockHtml(model)` — 讲题 dock

- **搬入**:`renderTeachingDock` 中 `qBtns`/`tabBtns`/`returnBtn` map + `dock.innerHTML = ...` 装配(当前 7275-7296),**并把** `if (!model.visible) { dock.innerHTML=''; return; }` 的空态收进模块——`model.visible` 为假时函数返回 `''`。
- **入参**:`model` = `window.GrammarAppState.buildTeachingDockModel(...)` 产物(`visible` / `questionButtons[]` / `tabButtons[]` / `returnButton` / `navButtons[]` / `exitButton`)。
- **机械替换**:`escapeHtml(` → `window.escapeHtml(`。onclick 文本(`jumpTeachingQuestion(...)` / `setTeachingTab('...')` / `returnTeachingQuestion()` / `closeTeachingStage()`)**原样保留**。
- **inline `renderTeachingDock` 改桥**:保留快照 + `getElementById('teachingDock')` + `buildTeachingDockModel`,改为 `dock.innerHTML = window.GrammarTeachingRender.teachingDockHtml(model);`(空态由模块返回 `''` 兜底,语义等价于原 early-return)。

### 3. 删死代码

- 删除 index.html 的 `function renderMigrationEmptyHint(hint){...}`(7528-7539)。已 grep 确认零调用点。

## 落地四处(同 batch 2 约定)

| 文件 | 动作 |
|---|---|
| `docs/grammar-fill/modules/teaching-render.js` | 加 `teachingStageHtml` / `teachingDockHtml`,导出 9 → 11 |
| `docs/grammar-fill/index.html` | 2 函数改桥 + 删 `renderMigrationEmptyHint` |
| `scripts/check_grammar_modules.py` | `GrammarTeachingRender` exports +2 |
| `tests/smoke.spec.js` | render 单测 +4 断言 |
| `PROJECT_LOG.md` | +1 batch 3 记录 |

### 新增单测断言(render pure html output 块内)

- `teachingStageHtml(model, parts)`:断言输出含 `teaching-stage-shell` 且含传入的 `contentHtml` 标记片段。
- `teachingStageHtml`(无 contentHtml):断言不抛、含 question line。
- `teachingDockHtml(model)`(visible):断言含 `teaching-q-btn` 与 `teaching-question-rail`。
- `teachingDockHtml({ visible:false })`:断言返回 `''`。

## 验证 & 提交

- 每 checkpoint:`python3 scripts/check_grammar_modules.py` + `npx playwright test tests/smoke.spec.js --project=chromium -g "teaching-render pure html output|grammar-fill core path"` + `npm run check`(其 core-path smoke 真实渲染讲题台/dock,是行为不变兜底)。绿后才 commit。
- **3 个 checkpoint commit**:① `extract teachingStageHtml` ② `extract teachingDockHtml` ③ `remove dead renderMigrationEmptyHint`。
- **前置条件**:用户先把工作区决策地图/手册 WIP 自行提交,使 index.html 干净;之后我在干净 index.html 上做 per-checkpoint commit(`git add` 仅限本批 5 文件)。

## 完成定义

- [ ] `teachingStageHtml` / `teachingDockHtml` 迁入,index.html 两函数 = inline 副作用编排 + 调模块,埋点/快照/DOM 写入原位保留
- [ ] 死代码 `renderMigrationEmptyHint` 删除
- [ ] `check_grammar_modules.py` exports +2(18 modules 仍通过)
- [ ] render 单测 +4 断言,全绿
- [ ] 每 checkpoint `npm run check` 全绿后才 commit
- [ ] 主文件再瘦 ~40-50 行

## 行为不变保证(三层兜底)

① 副作用留原位(埋点次数、快照时机、DOM 写入顺序不变) ② `npm run check` 的 core-path smoke 真实渲染讲题台 + dock ③ render 单测断言模块输出含关键 class/片段。
