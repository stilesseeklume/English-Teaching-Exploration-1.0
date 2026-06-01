# 首页合并：访客引导页 + 登录后模块页 → 单页自适应

> 日期：2026-06-01 · 范围：仅 `docs/index.html`

## 背景与问题

首页 `docs/index.html` 当前有两个互斥视图，由登录态切换：

- `#view-welcome`（未登录）：`Seeklume` 品牌 + 三个按钮（进入语法填空 / 注册系统账号 / 🧪 成绩单转换）。
- `#view-modules`（登录后）：问候 + "选一个模块开始" + 模块卡片网格 + 联系区。

CSS 规则 `html.has-session #view-welcome{display:none} / #view-modules{display:block}`（约 index.html:894-895）实现切换。

**问题**：未登录访客只看到三个按钮，看不到真正的产品（模块网格）。这导致：
1. 网格里的功能（如刚加入的"成绩单转换"工具卡）访客根本到不了，像"废页面"。
2. 品牌/产品展示力弱——访客第一眼信息量太少。

**关键事实**：`grammar-fill` 模块内部已实现"访客直接放行 + 按需注册"——做题/讲评/知识库/考点/套卷/跨卷迁移分析全部免登录可用，仅错题本、备课资料、管理后台触发登录弹窗（`requireAuth`，grammar-fill/index.html:2478）。门控逻辑全在模块内部，**首页不需要再做任何门控**。制造"访客看不到东西"问题的，唯一就是首页这层视图二选一。

## 目标

删掉首页的视图二选一，合并成**单页**：所有人（含未登录访客）都直接看到模块网格。品牌介绍对访客保留，老用户保留熟悉的 dashboard 观感。

不丢任何现有入口与功能。

## 设计

### 1. 删除 `#view-welcome`

整块删除。其三个按钮各有归宿，功能不丢：

| 原欢迎页按钮 | 合并后归宿 |
|---|---|
| 进入语法填空讲评 | 网格卡片 01（语法填空） |
| 注册系统账号 | 右上角 topbar 已有的「登录 / 注册」按钮（对访客也显示） |
| 🧪 成绩单转换（测试） | 网格里的工具卡片（已存在） |

`隐私说明` 链接挪到页脚联系区那一行（index.html:989 附近）。

### 2. 单页头区按登录态自适应（同一块 DOM，CSS 切文案）

靠 `html.has-session` class 切换两套文案，不用 JS 重排：

| 元素 | 访客（无 `has-session`） | 登录后（`has-session`） |
|---|---|---|
| eyebrow | `Pilot · Grammar First` | `晚上好，{用户名}` |
| 标题 h1 | `Seeklume` | `选一个模块开始` |
| 副标题 | `English Teaching web 初步探索 · 选一个模块开始` | `当前可以使用语法填空讲评。其他题型会随着课堂流程和知识框架逐步接入。` |

实现：两套文案各放一个元素，用 `html:not(.has-session) .xxx` / `html.has-session .xxx` 控制显隐；登录用户名沿用现有 `modulesGreeting` 的填充逻辑。

### 3. 卡片行为

- 开放卡（语法填空、成绩单转换工具卡）：访客直接点进，模块内部自行处理"碰到需账号功能再弹注册"。
- Soon 卡：不可点（现状不变）。
- 首页不新增任何门控。

### 4. 文案修正

卡片 01 的 meta `当前主入口 · 登录后使用` 不再准确（访客也能用），改为 `免登录即可讲评 · 错题本/备课需登录`。

### 5. 死代码清理

`#view-welcome` 删除后，以下逻辑成为死代码，一并精简：

- 多场景轮播相关：`sceneDots` / `#sceneDots`、`scenes`、`_currentSceneIdx`、`welcome-mode` body class、场景滚动/圆点 JS。
- `showView()` 的双视图切换——简化为始终展示模块页（或保留函数但只剩单一路径）。
- `html.has-session` 的 CSS：从"切换视图 display"改为"切换头区文案显隐"。
- 仅 `#view-welcome` 作用域内的 CSS（如 `#view-welcome .scene ...`）。

保留：topbar、登录/注册弹窗、主题切换、session 同步检测（index.html:876-890，仍用于切换头区文案 + topbar 账号态）。

## 不做（YAGNI）

- 不改 `grammar-fill` 任何门控逻辑。
- 不改 Supabase / 认证。
- 不给首页卡片加登录拦截。
- 不重做 topbar。

## 风险与验证

- 风险：删除轮播 JS 时误删被其他逻辑引用的符号 → 用 grep 确认每个被删符号无其他引用；删后跑 `tests/smoke.spec.js`。
- 验证：
  1. 未登录访问首页 → 看到品牌头区 + 完整网格；点语法填空能进；点工具卡能进 score-analysis。
  2. 模拟登录态（`has-session`）→ 头区变问候 + "选一个模块开始"，网格不变。
  3. 控制台无报错；`npm test`（smoke + score-analysis spec）通过。
  4. preview 截图：访客态 / 登录态、桌面 / 移动各一张。
