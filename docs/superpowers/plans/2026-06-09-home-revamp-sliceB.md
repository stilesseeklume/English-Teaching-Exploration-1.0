# 首屏重排 · 片B：核心三步 + 工具组

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把主页 8 个平铺等大卡，重排成 **核心 3 卡（导入成绩 → 考点画像 → 去练）显眼** + **「工具」组（套卷/导入试题/我做过的题/错题本/知识库）降为次要**。功能全保留，只动主页层级与标签。

**Architecture:** 改 `home-dashboard-model.js`（`getDashboardActions` 拆成 `getCoreActions`+`getToolActions`、改标签；`buildDashboardModel` 返回 `coreActions`+`toolActions` 两组，去掉扁平 `actions`）+ `home-render.js`（`homeDashboardHtml` 渲染核心 grid + 「工具」分区）。两者都是纯模块。消费方（home-render、smoke、home-dashboard 控制器若有）同步改。

**Tech Stack:** vanilla JS（IIFE 纯模块）· Playwright smoke · `check_grammar_modules.py` 门禁。

**设计依据：** [docs/planning/2026-06-08-错题精准训练-v1-design.md](../../planning/2026-06-08-错题精准训练-v1-design.md) §12（精简 IA：1 闭环 + 2 工具；考点训练→去练、备课→导入试题、其余降工具）。**本片只重排主页卡片层级与标签**；错题本/考点训练/备课的功能**不动**（仍可达），dock 不动（持久快捷栏，留作后续）。AI 已在前一步删除。

**新结构**：
- **核心 3**（保留在 hero 大格）：`error-import`「📥 导入成绩」· `error-profile`「📊 考点画像」· `points-training`「🎯 去练」
- **工具 5**（降到 hero 下方「工具」分区，次要样式）：`pick-bank`「📚 精选题库」· `upload-word`「📤 导入试题」· `my-papers`「📁 我做过的题」· `error-book`「📕 错题本」· `knowledge`「📖 知识库」

---

### Task 1: `home-dashboard-model.js` —— 拆核心/工具 + 改标签

**Files:**
- Modify: `docs/grammar-fill/modules/home-dashboard-model.js`

> 先 grep 全仓 `buildDashboardModel(`、`\.actions` 的消费方（应只有 `home-render.js` 与 `tests/smoke.spec.js`，可能还有 `modules/home-dashboard.js` 控制器）。Task 2/3 会同步它们。

- [ ] **Step 1: 拆 `getDashboardActions` 为两个内部函数 + 改标签**

把 `getDashboardActions(activity)`（现 `return [ …8 张… ]`）整体替换为下面两个函数：

```js
  function getCoreActions(activity) {
    activity = activity || getUserActivityState({});
    return [
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
      {
        key: 'points-training', icon: '🎯', label: '去练',
        subtitleText: '挑弱考点集中练', tone: 'primary', count: null,
        action: buildAction('switch-page', 'points-training')
      }
    ];
  }

  function getToolActions(activity) {
    activity = activity || getUserActivityState({});
    return [
      {
        key: 'pick-bank', icon: '📚', label: '精选题库',
        subtitleText: '真题 + 模拟 · 直接开讲', tone: 'accent', count: null,
        action: buildAction('navigate-home', 'exams')
      },
      {
        key: 'upload-word', icon: '📤', label: '导入试题',
        subtitleText: 'Word → AI 解析入库', tone: 'accent', count: null,
        action: buildAction('upload-word', 'lesson-prep')
      },
      {
        key: 'my-papers', icon: '📁', label: '我做过的题',
        subtitleText: activity.prepCount + ' 套已入库', tone: 'accent', count: activity.prepCount,
        action: buildAction('switch-page', 'lesson-prep')
      },
      {
        key: 'error-book', icon: '📕', label: '错题本',
        subtitleText: activity.errorCount + ' 道待复习', tone: 'red', count: activity.errorCount,
        action: buildAction('switch-page', 'error-book')
      },
      {
        key: 'knowledge', icon: '📖', label: '知识库',
        subtitleText: '教材 · 按考点分类', tone: 'purple', count: null,
        action: buildAction('switch-page', 'knowledge')
      }
    ];
  }
```

- [ ] **Step 2: `buildDashboardModel` 返回两组**

把 `buildDashboardModel` 里的：
```js
      actions: getDashboardActions(activity).map(buildDashboardActionButtonModel)
```
改成：
```js
      coreActions: getCoreActions(activity).map(buildDashboardActionButtonModel),
      toolActions: getToolActions(activity).map(buildDashboardActionButtonModel)
```

- [ ] **Step 3: 语法自检**

Run: `node --check docs/grammar-fill/modules/home-dashboard-model.js`
Expected: exit 0。

- [ ] **Step 4: Commit**

```bash
git add docs/grammar-fill/modules/home-dashboard-model.js
git commit -m "feat(home): dashboard 拆核心3+工具5，考点训练→去练、上传卷子→导入试题"
```

---

### Task 2: `home-render.js` —— 渲染核心 grid + 「工具」分区

**Files:**
- Modify: `docs/grammar-fill/modules/home-render.js`

- [ ] **Step 1: 改 `homeDashboardHtml` 的 actions 渲染**

把现有的（hero 内单一 grid 渲染 `model.actions`）：
```js
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;">';
    (model.actions || []).forEach(function(item) {
      html += actionButtonHtml(item, inlineHomeDashboardAction);
    });
    html += '</div>';
    html += '</section>';
```
替换为（hero 内放核心 grid；hero 后加「工具」分区）：
```js
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;">';
    (model.coreActions || []).forEach(function(item) {
      html += actionButtonHtml(item, inlineHomeDashboardAction);
    });
    html += '</div>';
    html += '</section>';
    if ((model.toolActions || []).length) {
      html += '<section style="margin-bottom:22px;">';
      html += '<h3 style="margin:0 0 12px;font-size:14px;color:var(--text-3);font-weight:600;">工具</h3>';
      html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;">';
      (model.toolActions || []).forEach(function(item) {
        html += actionButtonHtml(item, inlineHomeDashboardAction);
      });
      html += '</div>';
      html += '</section>';
    }
```

- [ ] **Step 2: 语法自检**

Run: `node --check docs/grammar-fill/modules/home-render.js`
Expected: exit 0。

- [ ] **Step 3: 检查别的消费方**

Run: `grep -rn "\.actions\b" docs/grammar-fill/modules/home-dashboard.js docs/grammar-fill/app.js | grep -i dashboard`
若有别处读 dashboard model 的 `.actions`（控制器等），同步改成 `coreActions`/`toolActions`（多半没有——home-dashboard 控制器只是把 model 透传给 `homeDashboardHtml`）。读到的每处都处理。

- [ ] **Step 4: Commit**

```bash
git add docs/grammar-fill/modules/home-render.js
git commit -m "feat(home-render): 主页渲染 核心grid + 「工具」分区"
```

---

### Task 3: smoke 断言更新 + 全量校验

**Files:**
- Modify: `tests/smoke.spec.js`

- [ ] **Step 1: 更新 dashboard 断言（`actions` → `coreActions`/`toolActions`）**

`grammar-fill core path` 用例里现有一批硬编码 `newUserDashboard.actions[i]` / `activeDashboard.actions[...]` / `actions.length` 断言（上一片刚改过）。按**新结构**改：
- `coreActions`：长度 **3**，依次 `error-import`(switch-page/error-import) · `error-profile`(switch-page/error-profile) · `points-training`(switch-page/points-training，label `去练`)。
- `toolActions`：长度 **5**，依次 `pick-bank`(navigate-home/exams) · `upload-word`(label `导入试题`) · `my-papers`(subtitleText 含 `套已入库`) · `error-book`(switch-page/error-book) · `knowledge`(switch-page/knowledge)。
- hero 的 box-shadow/opacity 断言改成查 `coreActions[0]`（error-import，tone primary，仍有 box-shadow + opacity）。

具体做法：把每条 `newUserDashboard.actions[n]…` 改成对应的 `newUserDashboard.coreActions[n]…` 或 `newUserDashboard.toolActions[m]…`，并把 `activeDashboard.actions.length === 8` 改成 `coreActions.length === 3 && toolActions.length === 5`。逐条对照新结构跑到绿——若某断言查的实际值对不上，`page.evaluate(()=>window.GrammarHomeDashboardModel.buildDashboardModel({...}))` 打印出来核对索引。

- [ ] **Step 2: 跑 smoke**

Run: `npm run test:smoke`
Expected: 全绿（核心路径用例按新结构通过）。

- [ ] **Step 3: 全量校验**

Run: `npm run test:unit`（应不受影响，全绿）
Run: `npm run check`（结尾 `OK: all engineering checks passed`）

- [ ] **Step 4: Commit**

```bash
git add tests/smoke.spec.js
git commit -m "test(smoke): dashboard 断言改为 核心3+工具5"
```

---

## 本片完成定义

- 主页：hero 大格只放**核心 3**（导入成绩/考点画像/去练），下方「工具」分区放其余 5 个（次要）。
- 标签：考点训练→**去练**、上传我的卷子→**导入试题**。
- 功能全保留可达；`npm run check` + `npm run test:unit` 全绿。

## 不含（后续）

- dock（持久快捷栏）重排/精简。
- 错题本「真并进画像」（本片只降为工具，不删；画像的个人错题集已覆盖自动错题）。
- 备课/考点训练的深度合并（本片只改标签 + 降级）。
- 画像展示形式重做（负责人另议）。

## 手测

登录 → 主页：应一眼看到**三步核心**在最上，其余收在「工具」里。点每张卡仍能进对应功能（去练→考点训练、导入试题→Word 导入、错题本/知识库/精选题库照常）。
