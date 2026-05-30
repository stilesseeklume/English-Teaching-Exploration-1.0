# 讲题台渲染抽离(第三批·讲题台外壳 + dock)实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans。Steps 用 `- [ ]` 跟踪。

**Goal:** 把 `renderTeachingStage` 的讲题台外壳、`renderTeachingDock` 的 dock 的**纯渲染部分**迁入 `teaching-render.js`,并删一处零调用死代码 `renderMigrationEmptyHint`,主文件继续瘦身,行为零差异。

**Architecture:** 模块函数只收「数据 model + 已生成 HTML 片段」,纯拼字符串;取数/副作用(快照、`syncAppState`、`recordUsageEvent` 埋点、DOM 写入、`scrollIntoView`)全留 index.html inline。副作用原位不变 = 行为零差异。分 3 个 checkpoint,每个迁/删一项即验证 + commit。

**Tech Stack:** 原生 ES(IIFE + `window.GrammarTeachingRender` 全局)、Playwright(`page.evaluate` 断言)、`check_grammar_modules.py` 契约校验。

**上游:** batch 1 `dfc7633`;batch 2 `51d955e`/`d0a2c3b`/`9139875`。设计 `docs/planning/2026-05-30-teaching-render-extraction-batch3-design.md`。分支 `feature/teaching-render`。

---

## 前置条件(必须先满足)

- [ ] **用户先把工作区决策地图/手册 WIP 自行提交**,使 `docs/grammar-fill/index.html` 工作区干净(无未提交改动)。验证:`git status --short docs/grammar-fill/index.html` 无输出。否则 per-checkpoint commit 会把两个主题混进同一 commit。
- [ ] 本计划 + 设计文档在 Task 3 末次 commit 一并纳入版本(见 Task 3 Step 5),不单独提交。

## File Structure

| 文件 | 动作 |
|---|---|
| `docs/grammar-fill/modules/teaching-render.js` | 加 `teachingStageHtml(model, parts)` / `teachingDockHtml(model)`,导出 9 → 11 |
| `docs/grammar-fill/index.html` | `renderTeachingStage` / `renderTeachingDock` 改桥;删 `renderMigrationEmptyHint` |
| `scripts/check_grammar_modules.py` | `GrammarTeachingRender` exports 增 2 |
| `tests/smoke.spec.js` | `teaching-render pure html output` 测试加 4 断言 |
| `PROJECT_LOG.md` | 加 batch 3 记录 |

**通用提取规则:** 从 index.html 对应函数的拼 HTML 部分原样搬入模块,机械替换:① `escapeHtml(` → `window.escapeHtml(`;② 局部变量改为从 `model.*` / `parts.*` 取。**不改任何拼装结构、class、onclick 文本。**

---

## Task 1: teachingStageHtml(讲题台外壳,checkpoint 1)

**Files:**
- Modify: `docs/grammar-fill/modules/teaching-render.js`(analysisHtml 之后、导出对象之前加函数;导出对象加 1 行)
- Modify: `docs/grammar-fill/index.html:7213-7230`(`renderTeachingStage` 的 `main.innerHTML = ...` 改桥)
- Modify: `scripts/check_grammar_modules.py:637`(exports 加 `teachingStageHtml`)
- Test: `tests/smoke.spec.js`(`teaching-render pure html output` 块)

- [ ] **Step 1: 加失败断言(红)**

在 `tests/smoke.spec.js` 的 evaluate 块内,`const analysis = R.analysisHtml(...)`(当前 3762-3765)之后、`return {`(3766)之前,插入:
```js
    const stage = R.teachingStageHtml(
      { sourceLabel: '2024浙江', questionLabel: '第5题', categoryLabel: '时态', focusContent: false, zhSentence: '中文句' },
      { questionSentenceHtml: '<span>QLINE</span>', contentHtml: '<div>STAGECONTENT</div>' }
    );
    const stageNoContent = R.teachingStageHtml(
      { sourceLabel: 'S', questionLabel: 'Q', categoryLabel: 'C', focusContent: true, zhSentence: '' },
      { questionSentenceHtml: '<span>QLINE2</span>', contentHtml: '' }
    );
```
在 return 对象内,`analysisHasNav: ...`(3781)行后加逗号并追加:
```js
      stageHasShell: stage.includes('teaching-stage-shell') && stage.includes('STAGECONTENT') && stage.includes('QLINE'),
      stageNoContent: !stageNoContent.includes('teaching-content-panel') && stageNoContent.includes('QLINE2'),
```
在末尾 `expect(out.analysisHasNav).toBe(true);`(3799)后加:
```js
  expect(out.stageHasShell).toBe(true);
  expect(out.stageNoContent).toBe(true);
```

- [ ] **Step 2: 跑红**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "teaching-render pure html output"`
Expected: FAIL(`R.teachingStageHtml is not a function` → evaluate 抛错)。

- [ ] **Step 3: 模块加 teachingStageHtml**

在 `teaching-render.js` 的 `analysisHtml` 函数闭合 `}`(当前 288 行)之后、`window.GrammarTeachingRender = {`(290)之前,加:
```js
  function teachingStageHtml(model, parts) {
    parts = parts || {};
    return '<div class="teaching-stage-shell">'
      + '<div class="teaching-stage-topbar">'
      + '<div class="teaching-stage-meta">'
      + '<span class="source">' + window.escapeHtml(model.sourceLabel) + '</span>'
      + '<span>' + window.escapeHtml(model.questionLabel) + '</span>'
      + '<span>' + window.escapeHtml(model.categoryLabel) + '</span>'
      + '</div>'
      + '</div>'
      + '<div class="teaching-stage-grid' + (model.focusContent ? ' focus-content' : '') + '">'
      + '<section class="teaching-question-panel">'
      + '<div class="teaching-question-line">' + parts.questionSentenceHtml + '</div>'
      + '<div class="teaching-question-folds">'
      + (model.zhSentence ? '<details class="teaching-fold"><summary>中文翻译</summary><div class="teaching-fold-body">' + window.escapeHtml(model.zhSentence) + '</div></details>' : '')
      + '</div>'
      + '</section>'
      + (parts.contentHtml ? '<section class="teaching-content-panel">' + parts.contentHtml + '</section>' : '')
      + '</div>'
      + '</div>';
  }

```
在导出对象内 `analysisHtml: analysisHtml`(299)行尾加逗号,追加 `teachingStageHtml: teachingStageHtml`。

- [ ] **Step 4: inline renderTeachingStage 改桥**

`docs/grammar-fill/index.html` 中 `renderTeachingStage` 的 `main.innerHTML = '<div class="teaching-stage-shell">' ... + '</div>';`(当前 7213-7230 整段)替换为:
```js
  main.innerHTML = window.GrammarTeachingRender.teachingStageHtml(stageModel, {
    questionSentenceHtml: renderTeachingQuestionSentence(q),
    contentHtml: contentHtml
  });
```
(7178-7212 取数/副作用、7231-7238 `scrollTop`/`renderTeachingDock()`/rAF 一律不动。)

- [ ] **Step 5: check exports 加 teachingStageHtml**

`scripts/check_grammar_modules.py` 的 `GrammarTeachingRender` exports 数组,`"analysisHtml",`(637)后加 `"teachingStageHtml",`。

- [ ] **Step 6: 跑绿 + 全量门禁**

Run: `python3 scripts/check_grammar_modules.py` → `OK: ... (18 modules)`
Run: `npm run check` → 末行 `OK: all engineering checks passed`,smoke 全过(含 `teaching-render pure html output` 新断言 + `grammar-fill core path` 真实渲染讲题台)。

- [ ] **Step 7: checkpoint commit**

```bash
git add docs/grammar-fill/modules/teaching-render.js docs/grammar-fill/index.html scripts/check_grammar_modules.py tests/smoke.spec.js
git commit -m "refactor(grammar-fill): extract teachingStageHtml to teaching-render"
```

---

## Task 2: teachingDockHtml(讲题 dock,checkpoint 2)

**Files:**
- Modify: `docs/grammar-fill/modules/teaching-render.js`(teachingStageHtml 之后加函数;导出对象加 1 行)
- Modify: `docs/grammar-fill/index.html:7271-7296`(`renderTeachingDock` 改桥,空态收进模块)
- Modify: `scripts/check_grammar_modules.py`(exports 加 `teachingDockHtml`)
- Test: `tests/smoke.spec.js`

- [ ] **Step 1: 加失败断言(红)**

evaluate 块内,Task 1 加的 `stageNoContent` 声明之后插入:
```js
    const dock = R.teachingDockHtml({
      visible: true,
      navButtons: [{ title: '上一题', label: '◀' }, { title: '下一题', label: '▶' }],
      questionButtons: [{ index: 0, active: true, no: '1', title: '第1题' }],
      tabButtons: [{ key: 'guide', active: true, label: '讲题' }],
      returnButton: null,
      exitButton: { label: '退出' }
    });
    const dockHidden = R.teachingDockHtml({ visible: false });
```
return 对象内 `stageNoContent: ...` 行后加:
```js
      dockHasBtns: dock.includes('teaching-q-btn') && dock.includes('teaching-question-rail'),
      dockHidden: dockHidden === '',
```
末尾 `expect(out.stageNoContent).toBe(true);` 后加:
```js
  expect(out.dockHasBtns).toBe(true);
  expect(out.dockHidden).toBe(true);
```

- [ ] **Step 2: 跑红**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "teaching-render pure html output"`
Expected: FAIL(`R.teachingDockHtml is not a function`)。

- [ ] **Step 3: 模块加 teachingDockHtml**

`teaching-render.js` 中 `teachingStageHtml` 闭合 `}` 之后、导出对象之前加:
```js
  function teachingDockHtml(model) {
    if (!model || !model.visible) return '';
    var qBtns = model.questionButtons.map(function(item) {
      return '<button class="teaching-q-btn' + (item.active ? ' active' : '') + '" onclick="jumpTeachingQuestion(' + item.index + ')" title="' + window.escapeHtml(item.title) + '">'
        + window.escapeHtml(item.no)
        + '</button>';
    }).join('');
    var tabBtns = model.tabButtons.map(function(item) {
      return '<button class="' + (item.active ? 'active' : '') + '" onclick="setTeachingTab(\'' + item.key + '\')">' + window.escapeHtml(item.label) + '</button>';
    }).join('');
    var returnBtn = model.returnButton
      ? '<button class="return" onclick="returnTeachingQuestion()" title="' + window.escapeHtml(model.returnButton.label) + '" aria-label="' + window.escapeHtml(model.returnButton.label) + '">↩</button>'
      : '';
    return ''
      + '<div class="teaching-dock-group">'
      + '<button onclick="jumpTeachingQuestion(-1, true)" title="' + window.escapeHtml(model.navButtons[0].title) + '">' + window.escapeHtml(model.navButtons[0].label) + '</button>'
      + '<button onclick="jumpTeachingQuestion(1, true)" title="' + window.escapeHtml(model.navButtons[1].title) + '">' + window.escapeHtml(model.navButtons[1].label) + '</button>'
      + '</div>'
      + '<div class="teaching-question-rail"><div class="teaching-dock-group">' + qBtns + '</div></div>'
      + '<div class="teaching-dock-group">'
      + tabBtns
      + returnBtn
      + '<button class="danger" onclick="closeTeachingStage()">' + window.escapeHtml(model.exitButton.label) + '</button>'
      + '</div>';
  }

```
导出对象 `teachingStageHtml: teachingStageHtml` 行尾加逗号,追加 `teachingDockHtml: teachingDockHtml`。

- [ ] **Step 4: inline renderTeachingDock 改桥**

`docs/grammar-fill/index.html` 中 `renderTeachingDock`,把 `if (!model.visible) { dock.innerHTML = ''; return; }`(当前 7271-7274)到函数末尾的 `dock.innerHTML = '' ... '</div>';`(7286-7296)整段——即从 `if (!model.visible)` 起到函数闭合前——替换为单行:
```js
  dock.innerHTML = window.GrammarTeachingRender.teachingDockHtml(model);
```
即改后 `renderTeachingDock` 为:
```js
function renderTeachingDock() {
  var practiceContext = getPracticeContextSnapshot();
  var session = getTeachingSessionSnapshot().teachingSession;
  if (!session) return;
  var dock = document.getElementById('teachingDock');
  if (!dock) return;
  var returnStackState = getTeachingReturnStackSnapshot();
  var model = window.GrammarAppState.buildTeachingDockModel(session, practiceContext.currentQuestions, returnStackState.teachingReturnStack, {
    normalizeTab: normalizeTeachingTab
  });
  dock.innerHTML = window.GrammarTeachingRender.teachingDockHtml(model);
}
```

- [ ] **Step 5: check exports 加 teachingDockHtml**

`scripts/check_grammar_modules.py` exports `"teachingStageHtml",` 后加 `"teachingDockHtml",`。

- [ ] **Step 6: 跑绿 + 全量门禁**

Run: `python3 scripts/check_grammar_modules.py` → 18 modules OK。
Run: `npm run check` → 全绿。

- [ ] **Step 7: checkpoint commit**

```bash
git add docs/grammar-fill/modules/teaching-render.js docs/grammar-fill/index.html scripts/check_grammar_modules.py tests/smoke.spec.js
git commit -m "refactor(grammar-fill): extract teachingDockHtml to teaching-render"
```

---

## Task 3: 删死代码 renderMigrationEmptyHint + 收尾(checkpoint 3)

**Files:**
- Modify: `docs/grammar-fill/index.html`(删 `renderMigrationEmptyHint`,当前 7528-7539)
- Modify: `PROJECT_LOG.md`(加 batch 3 记录)

- [ ] **Step 1: 复核零调用**

Run: `grep -n "renderMigrationEmptyHint" docs/grammar-fill/index.html`
Expected: 仅 1 行(函数定义本身),无其他调用点。若出现调用点则停止,报告并重新评估。

- [ ] **Step 2: 删除函数**

删 `docs/grammar-fill/index.html` 中整个:
```js
function renderMigrationEmptyHint(hint) {
  if (!hint) return '';
  var html = '<div class="empty-hint">' + escapeHtml(hint.primaryText || '');
  if (hint.secondaryText) {
    html += '<br><span style="color:var(--text-3);">' + escapeHtml(hint.secondaryText) + '</span>';
  }
  if (hint.fallbackText) {
    html += '<br><span style="color:var(--text-3);">' + escapeHtml(hint.fallbackText) + '</span>';
  }
  html += '</div>';
  return html;
}
```

- [ ] **Step 3: PROJECT_LOG 加记录**

在 `PROJECT_LOG.md` 末尾的日期戳行 `*此日志随项目推进持续更新。最后更新：2026-05-29*` **之前**,插入以下新段落(段落与日期戳之间留一空行):
```markdown
## 2026-05-30 · 讲题台渲染抽离 batch 3

- `renderTeachingStage` 讲题台外壳、`renderTeachingDock` 的 dock 纯 HTML 装配抽入 `docs/grammar-fill/modules/teaching-render.js`（新增 `teachingStageHtml(model, parts)` / `teachingDockHtml(model)`，导出 9→11）；`index.html` 两函数改为 inline 副作用编排 + 调模块，埋点/快照/DOM 写入原位保留。
- 删除零调用死代码 `renderMigrationEmptyHint`（batch 1/2 把 empty-hint 搬进模块内部 helper 后的残留）。
- `scripts/check_grammar_modules.py` 加 2 个 `GrammarTeachingRender` export 契约；`tests/smoke.spec.js` 加 4 条 render 断言（讲题台外壳含内容、空内容不出 content-panel、dock 含按钮、dock 不可见返回空串）。
- 验证：`python3 scripts/check_grammar_modules.py`（18 模块）+ `npm run check`（全绿，含 grammar-fill core path 真实渲染讲题台/dock）。主文件再瘦约 40-50 行。
```
并把该日期戳行改为 `*此日志随项目推进持续更新。最后更新：2026-05-30*`。

- [ ] **Step 4: 全量门禁**

Run: `npm run check` → 全绿(删死代码不应影响任何路径)。

- [ ] **Step 5: checkpoint commit**

```bash
git add docs/grammar-fill/index.html PROJECT_LOG.md docs/planning/2026-05-30-teaching-render-extraction-batch3-design.md docs/planning/2026-05-30-teaching-render-extraction-batch3-plan.md
git commit -m "refactor(grammar-fill): remove dead renderMigrationEmptyHint"
```

---

## 完成定义

- [ ] `teachingStageHtml` / `teachingDockHtml` 迁入,index.html 两函数 = inline 副作用编排 + 调模块,埋点/快照/DOM 写入原位保留
- [ ] 死代码 `renderMigrationEmptyHint` 删除
- [ ] `check_grammar_modules.py` exports +2(18 modules 仍通过)
- [ ] render 单测 +4 断言,全绿
- [ ] 每 checkpoint `npm run check` 全绿后才 commit
- [ ] 主文件再瘦 ~40-50 行

## 非目标(YAGNI)

- 不改任何拼装结构/class/onclick 文本/CSS —— 纯平移
- 不碰交互函数(`setTeachingTab`/`jumpTeachingQuestion`/`teardownTeachingStage`/`toggleTeaching*`)、片段函数(`renderTeachingQuestionSentence`/`renderTeachingMigrationSentence`)
- 不动其他主题的 render 函数(home/sidebar/knowledge/practice/decision-map)
- 不引入构建工具

## 行为不变保证(三层兜底)

每个 checkpoint:① 副作用留原位(埋点次数、快照时机、DOM 写入顺序不变) ② `npm run check` 的 `grammar-fill core path` smoke 真实渲染讲题台 + dock ③ render 单测断言模块输出含关键 class/片段。
