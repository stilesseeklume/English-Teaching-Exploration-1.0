# 删除教材视图（textbook）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 外科手术式删除"📚 教材视图（`textbook`）"这一个知识库视图及其专属 UI/视图模型/状态/暗线，知识库默认仍为 🗺 知识地图，其余功能（考点训练页、书本速查、知识地图、首页教材墙装饰、textbook_units 数据、迁移教材标签）全部不变。

**Architecture:** 纯删除，无新增。顺序铁律：**先删调用方/入口（按钮、dispatch 分支、暗线自动打开），再删被调函数（render/modal/unit 操作），最后删无人再用的视图模型构造器/状态/CSS。** 每步靠 `npm run test:smoke`（保持 33 passed）+ grep 零残留双重验证。行号会随删除漂移，**一律用 grep 按符号名定位，不依赖固定行号**。

**Tech Stack:** 原生 HTML/CSS/JS，`window.Grammar*` 全局约定，Playwright smoke。

参考设计：`docs/superpowers/specs/2026-06-03-remove-textbook-view-design.md`

---

## 删除目标符号总表（贯穿全程，删完应 grep 零残留）

- 入口/暗线：`knowledgeTextbookBtn`、`setKnowledgeView('textbook')`、`renderAction === 'textbook'`、home-dashboard-model 的 `open-textbook-modal`/`view:'textbook'` 动作步、home-dashboard.js 的 `open-textbook-modal` runStep、`shouldOpenTextbookModal`
- 渲染/modal：`renderTextbookView`、`renderBookDetail`、`openTextbookModal`、`closeTextbookModal`、`_onTextbookModalKey`、`setTextbookViewMode`、`getTextbookViewModeSnapshot`、`applyTextbookViewModeState`
- unit 操作：`openUnitQuestionList`、`openUnitErrorList`、`setUnitMiniFilter`、`_showUnitQuestionsMiniModal`、`_closeUnitMiniModal`、`_onUnitMiniKey`、`_gotoUnitQuestion`、`_unitMiniContext`、`_unitMiniModalTimer`
- 视图模型：`buildTextbookModel`、`buildTextbookUnitModel`、`groupTextbookUnitsByBook`、`buildTextbookModalModel`、`buildTextbookModalViewModel`、`buildTextbookModalOpenPlan`、`buildTextbookModeToggleModel`、knowledge-view-model 内的封面图映射
- 状态：`_textbookViewMode`、`buildTextbookViewModeState`

**绝不删（删错即破坏其它功能）**：`renderSystemView`、`renderFineCategoryView`、`setPointsTrainingView`、`renderKnowledgeMap`、`selectKnowledgeCategory`、`getTextbookGallery`、`getTextbookSectionModel`、`COVER_MAP`(home-dashboard-model)、`BOOK_ORDER`、`formatTextbookUnitLabel`、`textbook_units`(数据)。

---

## Task 1: 基线确认

**Files:** 无修改

- [ ] **Step 1: 确认 smoke 基线绿**

Run: `npm run test:smoke`
Expected: `33 passed`。若不绿，停止并汇报 BLOCKED。

- [ ] **Step 2: 记录基线 grep 计数（删完用于对比归零）**

Run: `grep -rcE 'renderTextbookView|openTextbookModal|knowledgeTextbookBtn|buildTextbookModal' docs/grammar-fill | grep -v ':0'`
记录输出，作为后续"归零"的对照。

---

## Task 2: 删入口与暗线（先断调用方）

**Files:**
- Modify: `docs/grammar-fill/index.html`（按钮 + dispatch 分支 + 抽屉返回）
- Modify: `docs/grammar-fill/modules/knowledge-view-model.js`（按钮配置 + shouldOpenTextbookModal + textbook 回跳 + 列表项）
- Modify: `docs/grammar-fill/modules/home-dashboard-model.js`（动作步）
- Modify: `docs/grammar-fill/modules/home-dashboard.js`（runStep）

- [ ] **Step 1: 删知识库教材按钮**

`grep -n 'knowledgeTextbookBtn' docs/grammar-fill/index.html` 定位，删除整行 `<button ... id="knowledgeTextbookBtn" onclick="setKnowledgeView('textbook')">📚 教材视图</button>`。

- [ ] **Step 2: 删 setKnowledgeView 的 textbook dispatch 分支**

在 `function setKnowledgeView` 内，删除：
```js
  } else if (chromeModel.renderAction === 'textbook') {
    renderTextbookView();
```
保留前后的 `map` / `fine-cat` / `system` / 末尾 `else selectKnowledgeCategory(...)` 分支（合并相邻 `} else if` 结构，确保语法完整）。

- [ ] **Step 3: 删抽屉返回的自动开教材 modal**

`grep -n 'shouldOpenTextbookModal' docs/grammar-fill/index.html` 定位，删除：
```js
      if (returnPlan.shouldOpenTextbookModal) {
        openTextbookModal(returnPlan.book);
      }
```

- [ ] **Step 4: knowledge-view-model.js 去 textbook 按钮配置与暗线字段**

- 删按钮配置项 `{ view: 'textbook', elementId: 'knowledgeTextbookBtn' }`（保留 map/book/fine-cat/system 其它项）。
- `shouldOpenTextbookModal: !!matchUnit` → 改为 `shouldOpenTextbookModal: false`。
- `knowledgeView: isUnitReturn ? 'textbook' : ''` → 改为 `knowledgeView: ''`。
- 删导航列表里 `view: 'textbook'` 的项（如"教材进度""教材视图"），保留同列表其它项（如"书本速查"`view:'book'`）。用 `grep -n "view: 'textbook'\|view:'textbook'" docs/grammar-fill/modules/knowledge-view-model.js` 逐一处理。

- [ ] **Step 5: home-dashboard-model.js 删教材动作步**

`grep -n "open-textbook-modal\|view: 'textbook'\|view:'textbook'" docs/grammar-fill/modules/home-dashboard-model.js` 定位，删除动作步：
```js
          { kind: 'set-knowledge-view', view: 'textbook', delayMs: 80 },
          { kind: 'open-textbook-modal', book: action.value || '', delayMs: 130 }
```
若它们是某个 action 的全部步骤导致该 action 变空，则连该 action 条目一并删除（确认该 action 无其它用途）。**不要碰** getTextbookGallery/getTextbookSectionModel/COVER_MAP/BOOK_ORDER。

- [ ] **Step 6: home-dashboard.js 删 open-textbook-modal 的 runStep**

`grep -n "open-textbook-modal\|openTextbookModal\|set-knowledge-view" docs/grammar-fill/modules/home-dashboard.js` 定位。删除 `step.kind === 'open-textbook-modal'` 分支（调 openTextbookModal）。`set-knowledge-view` 分支若仅服务教材则删，若通用（被别的 view 用）则保留。

- [ ] **Step 7: smoke + 提交**

Run: `npm run test:smoke`
Expected: `33 passed`（此时教材视图已无法触达，但函数体仍在，应不影响其它路径）。
若失败排查（多为分支合并语法错/漏删消费端）。

```bash
git add docs/grammar-fill/index.html docs/grammar-fill/modules/knowledge-view-model.js docs/grammar-fill/modules/home-dashboard-model.js docs/grammar-fill/modules/home-dashboard.js
git commit -m "refactor(grammar-fill): 删教材视图入口与暗线（按钮/dispatch/抽屉返回/首页动作）"
```

---

## Task 3: 删 index.html 中教材视图渲染与 modal 函数

**Files:**
- Modify: `docs/grammar-fill/index.html`

此时这些函数应已无调用方（Task 2 已断）。逐个删除函数定义、薄壳、window 导出。

- [ ] **Step 1: 删教材视图渲染/modal/视图模式函数**

用 grep 定位并删除以下函数的完整定义（含薄壳，若已抽过模块则薄壳形态）：
`renderTextbookView`、`renderBookDetail`、`openTextbookModal`、`closeTextbookModal`、`_onTextbookModalKey`、`setTextbookViewMode`、`getTextbookViewModeSnapshot`、`applyTextbookViewModeState`。
并删除 `grep -n 'openTextbookModal:' docs/grammar-fill/index.html` 找到的 window 导出行（如 `openTextbookModal: openTextbookModal,`）。

- [ ] **Step 2: 删教材 unit 操作函数**

删除 `openUnitQuestionList`、`openUnitErrorList`、`setUnitMiniFilter`、`_showUnitQuestionsMiniModal`、`_closeUnitMiniModal`、`_onUnitMiniKey`、`_gotoUnitQuestion` 的定义，及状态变量 `_unitMiniContext`、`_unitMiniModalTimer` 的声明。先 grep 确认它们只被彼此或已删的教材代码调用（无外部消费者）。

- [ ] **Step 3: 删教材相关 HTML 容器/modal 标记**

`grep -n 'textbook-modal\|unit-mini-modal\|id="textbook' docs/grammar-fill/index.html` 定位，删除教材视图专属的 HTML 容器/modal 结构（不要误删知识地图/书本速查容器）。

- [ ] **Step 4: grep 确认无悬空调用**

Run: `grep -nE 'renderTextbookView|openTextbookModal|closeTextbookModal|openUnitQuestionList|_onTextbookModalKey|_showUnitQuestionsMiniModal' docs/grammar-fill/index.html`
Expected: 无输出（全部已删，无残留调用或定义）。

- [ ] **Step 5: smoke + 提交**

Run: `npm run test:smoke`
Expected: `33 passed`。

```bash
git add docs/grammar-fill/index.html
git commit -m "refactor(grammar-fill): 删教材视图渲染/modal/unit 操作函数与 HTML 容器"
```

---

## Task 4: 删 knowledge-view-model.js 教材视图模型构造器

**Files:**
- Modify: `docs/grammar-fill/modules/knowledge-view-model.js`

- [ ] **Step 1: 删教材专属构造器与封面图映射**

grep 定位并删除：`buildTextbookModel`、`buildTextbookUnitModel`、`groupTextbookUnitsByBook`、`buildTextbookModalModel`、`buildTextbookModalViewModel`、`buildTextbookModalOpenPlan`、`buildTextbookModeToggleModel` 的定义，以及第 10–16 行附近的教材封面图映射对象（`'必修一': 'images/textbook-covers/...'` 这份，**knowledge-view-model 内的**）。
同步删除模块 `window.GrammarKnowledgeViewModel = { ... }` 导出对象里这些函数的导出项。

- [ ] **Step 2: grep 确认无悬空引用**

Run: `grep -nE 'buildTextbookModel|buildTextbookUnitModel|groupTextbookUnitsByBook|buildTextbookModal|buildTextbookModeToggleModel' docs/grammar-fill`
Expected: 无输出。

- [ ] **Step 3: smoke + 提交**

Run: `npm run test:smoke`
Expected: `33 passed`。

```bash
git add docs/grammar-fill/modules/knowledge-view-model.js
git commit -m "refactor(grammar-fill): 删 knowledge-view-model 中教材视图模型构造器与封面映射"
```

---

## Task 5: 删 app-state 教材视图模式状态

**Files:**
- Modify: `docs/grammar-fill/modules/app-state.js`

- [ ] **Step 1: 确认 _textbookViewMode 仅教材用**

Run: `grep -rnE '_textbookViewMode|TextbookViewMode|buildTextbookViewModeState' docs/grammar-fill`
确认剩余引用都已随前序任务删除/或仅在 app-state 内。

- [ ] **Step 2: 删状态字段与构造器**

删除 app-state.js 里 `_textbookViewMode` / `textbookViewMode` 状态字段、`buildTextbookViewModeState` 等仅教材视图用的构造器，及其在 state 初始对象/导出里的项。

- [ ] **Step 3: smoke + 提交**

Run: `npm run test:smoke`
Expected: `33 passed`。

```bash
git add docs/grammar-fill/modules/app-state.js
git commit -m "refactor(grammar-fill): 删 app-state 中教材视图模式状态"
```

---

## Task 6: 删教材视图 CSS

**Files:**
- Modify: `docs/grammar-fill/styles.css`

- [ ] **Step 1: 定位教材视图样式**

Run: `grep -nE 'textbook|unit-mini' docs/grammar-fill/styles.css`
人工辨别哪些选择器**仅**教材视图/教材 modal/unit-mini-modal 用（不要删被知识地图/书本速查/首页装饰墙共用的）。首页装饰墙用的是内联 style（在 home-render.js），一般不在 styles.css，确认即可。

- [ ] **Step 2: 删除这些样式块**

删除仅教材视图专属的 CSS 规则块。

- [ ] **Step 3: smoke + 提交**

Run: `npm run test:smoke`
Expected: `33 passed`。

```bash
git add docs/grammar-fill/styles.css
git commit -m "refactor(grammar-fill): 删教材视图相关 CSS"
```

---

## Task 7: 终验（零残留 + smoke + 人工核对）

**Files:** 无修改（仅验证）；如有 smoke 用例点教材视图则在此修复。

- [ ] **Step 1: 全仓库零残留 grep**

Run:
```bash
grep -rnE 'renderTextbookView|openTextbookModal|closeTextbookModal|knowledgeTextbookBtn|buildTextbookModal|buildTextbookModel|openUnitQuestionList|_textbookViewMode|shouldOpenTextbookModal' docs/grammar-fill
```
Expected: 无输出。若有，回到对应任务清理。

- [ ] **Step 2: 确认保护对象仍在**

Run:
```bash
grep -rcE 'renderSystemView|renderFineCategoryView|setPointsTrainingView|renderKnowledgeMap|selectKnowledgeCategory' docs/grammar-fill/index.html
grep -rcE 'getTextbookGallery|getTextbookSectionModel|BOOK_ORDER|COVER_MAP' docs/grammar-fill/modules/home-dashboard-model.js
grep -rcE 'formatTextbookUnitLabel|textbook_units' docs/grammar-fill/modules/migration-training.js docs/grammar-fill/modules/question-model.js docs/data/grammar_fine_tags.js
```
Expected: 均 > 0（这些必须保留）。

- [ ] **Step 3: smoke 全量**

Run: `npm run test:smoke`
Expected: `33 passed`。若某用例因点教材视图而失败，更新该用例（删教材断言或改断言"知识库默认知识地图、无教材按钮"），再跑至绿，并提交。

- [ ] **Step 4: 人工/截图核对（起本地服务）**

```bash
python3 -m http.server 8931
```
浏览器 `http://localhost:8931/docs/grammar-fill/`，确认：
- 知识库页默认 = 🗺 知识地图；切换条只剩 📖 书本速查 + 🗺 知识地图，互切正常；**无 📚 教材视图按钮**。
- 「考点训练」页：🌐 图谱（决策地图）+ 🏷️ 文字 正常。
- 首页教材墙装饰照常显示。
- 迁移训练里"考点出自 必修X Unit Y"标签照常。
- 无 JS 控制台报错。
停掉本地服务。

- [ ] **Step 5: 收尾提交（若 Step 3 改了用例）**

```bash
git add tests/
git commit -m "test: 更新 smoke——知识库去教材视图后默认知识地图、无教材按钮"
```

---

## 完成判定

- [ ] Task 1–7 全部完成
- [ ] 全仓库 grep 教材视图符号零残留
- [ ] 保护对象（考点训练页/书本速查/知识地图/首页装饰墙/教材数据/迁移标签）grep 仍在
- [ ] `npm run test:smoke` 33 passed
- [ ] 人工核对四项全过
- [ ] index.html 显著变小（预计减 ~400 行）
