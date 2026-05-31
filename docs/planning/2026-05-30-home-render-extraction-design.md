# 首页渲染抽离(home-render)设计

> 状态:设计已审。下一步 → writing-plans。
> 上游:teaching-render / sidebar-render(样板);backlog `docs/planning/architecture-extraction-backlog.md`(本批 = 优先级 2)。分支 `feature/teaching-render`。

## Goal

把 `index.html` 首页三个渲染函数的纯 HTML 装配迁入新模块 `home-render.js`:`renderHomeDashboard`(Dashboard)、`renderExamGrid`(套卷网格)、`renderHomeCategories`(考点网格)。行为零差异。

## 核心原则(沿用 teaching/sidebar-render)

模块函数纯拼字符串;DOM 取元素、读全局(`prepPassages`/`errorBookQuestions`)、`innerHTML=` 等副作用与编排留 index.html。共享 onclick 帮手经 deps 注入。

## 范围(已审)

- **抽**:`homeDashboardHtml`、`examGridHtml`、`homeCategoriesHtml` 三个纯函数;`renderHomeDashboardTextParts`/`renderHomeDashboardActionButton` 作模块内部 helper 随 dashboard 迁入(已确认二者仅 dashboard 用)。
- **不抽**:`renderClassroomSwitcher`(更新 4 个独立 DOM 元素的编排,非 model→HTML;留 inline)。`runHomeDashboardAction`/`inlineHomeDashboardAction`/`inlineSidebarAction`/`inlineSidebarCall`(onclick/动作帮手,留 inline)。
- **非目标**:不动 classroomSwitcher 及其导航函数、不提取共享 onclick util(注入即可)、不改任何 class/style/onclick 文本/CSS。

## 共享 onclick 帮手(已审:注入)

- `inlineSidebarAction`(现 3 处用:sidebar 模块注入 + examGrid + homeCategories)→ 注入给 `examGridHtml` / `homeCategoriesHtml`,留 inline。
- `inlineHomeDashboardAction`(仅 dashboard 用)→ 注入给 `homeDashboardHtml`,留 inline。
- 不提取到公共 util(YAGNI;帮手 2-3 行,提取需回改 sidebar-render + 新模块)。

## 组件设计(新模块 `home-render.js`)

### `homeDashboardHtml(model, deps)`
- 搬入 `renderHomeDashboard` 的 `html += ...` 段(hero + 行动按钮 + 教材封面画廊)。
- `model` = `GrammarHomeDashboardModel.buildDashboardModel` 产物(`hero`/`actions`/`textbookSection`/`books`);`deps = { inlineHomeDashboardAction }`。
- 内部 helper:`textPartsHtml`(原 `renderHomeDashboardTextParts`)、`actionButtonHtml`(原 `renderHomeDashboardActionButton`,内部用 `deps.inlineHomeDashboardAction` + `item.chrome || window.GrammarHomeDashboardModel.getActionButtonChrome(item.tone)`)。
- 机械替换:`escapeHtml(` → `window.escapeHtml(`;`inlineHomeDashboardAction(` → `deps.inlineHomeDashboardAction(`;`renderHomeDashboardTextParts(`/`renderHomeDashboardActionButton(` → 内部 `textPartsHtml(`/`actionButtonHtml(`(后者需把 deps 透传)。

### `examGridHtml(model, deps)`
- 搬入 `renderExamGrid` 的 `html += ...` 段(category-section + card 网格,含 `toggleExamYear` onclick)。
- `model` = `GrammarExamGridModel.buildExamGridModel` 产物;`deps = { inlineSidebarAction }`。
- 机械替换:`escapeHtml(`→`window.escapeHtml(`;`inlineSidebarAction(`→`deps.inlineSidebarAction(`。

### `homeCategoriesHtml(model, deps)`
- 搬入 `renderHomeCategories` 的 `html += ...` 段(category-section + card,含 `count-` id)。
- `model` = `GrammarCategoryRules.buildHomeCategoryModel` 产物;`deps = { inlineSidebarAction }`。
- 机械替换同上。

### inline 改桥(3 函数)
各保留 DOM 取元素、读全局、build*Model、`if (!el) return`、`el.innerHTML =` 写入;只把 HTML 字符串来源改为调模块,并删除内联拼装段。`renderClassroomSwitcher` 不动。

## 落地

| 文件 | 动作 |
|---|---|
| `docs/grammar-fill/modules/home-render.js` | **新建**,导出 `homeDashboardHtml`/`examGridHtml`/`homeCategoriesHtml` |
| `docs/grammar-fill/index.html` | 加 `<script>`(teaching/sidebar-render 后);3 处改桥;删 `renderHomeDashboardTextParts`/`renderHomeDashboardActionButton` 及 3 函数内联 HTML 段 |
| `scripts/check_grammar_modules.py` | 加 `GrammarHomeRender` 模块条目(19→20),script 顺序对齐 |
| `tests/smoke.spec.js` | 加 `home-render pure html output` 断言(3 函数各 1) |

## Checkpoints(3)

1. `homeDashboardHtml`(+ 内部 helper)+ 新模块 + script 标签 + 契约条目 + dashboard 改桥 + 删 2 helper。
2. `examGridHtml` + 导出/契约 +1 + examGrid 改桥。
3. `homeCategoriesHtml` + 导出/契约 +1 + homeCategories 改桥。

每 checkpoint:`python3 scripts/check_grammar_modules.py` + `npm run check` 全绿后 commit。**前置**:执行前 index.html 工作区干净(决策地图 WIP 已提交)。

## 完成定义

- [ ] 3 函数迁入新 `home-render.js`,2 helper 作内部 helper;index.html 3 函数 = DOM 编排 + 调模块
- [ ] 帮手 `inlineSidebarAction`/`inlineHomeDashboardAction` 原位保留并注入;`renderClassroomSwitcher` 不动
- [ ] `check_grammar_modules.py` 20 模块通过、script 顺序一致
- [ ] smoke +3 断言全绿
- [ ] 每 checkpoint `npm run check` 全绿后 commit

## 行为不变保证

① 副作用留 inline(DOM 写入、读全局、build*Model 不变) ② `npm run check` core-path smoke 真实渲染首页 ③ render 单测断言模块输出含关键 class + 注入 onclick。
