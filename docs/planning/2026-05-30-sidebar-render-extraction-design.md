# 侧边栏渲染抽离(sidebar-render)设计

> 状态:设计已审。下一步 → writing-plans。
> 上游:teaching-render batch 1/2/3(样板);架构 backlog `docs/planning/architecture-extraction-backlog.md`(本批 = backlog 优先级 1)。分支 `feature/teaching-render`。

## Goal

把 `index.html` 的 `renderSidebarModel(model)`(已是纯函数:model 进、HTML 字符串出)迁入新模块 `sidebar-render.js`,作为 `sidebarHtml(model, deps)`。行为零差异。

## 核心原则(沿用 teaching-render)

模块函数纯拼字符串;DOM 取元素/`innerHTML=`/快照/显示隐藏等副作用与编排留 index.html。共享 onclick 帮手通过 deps 注入,模块不持有跨域共享逻辑。

## 关键约束:共享 onclick 帮手

`renderSidebarModel` 内调 `inlineSidebarAction(action, fn, val)`,后者调 `inlineSidebarCall`。这两个帮手**纯**,但 **sidebar + home 卡片渲染(index.html 5926/5948)共用**——不能搬进 sidebar 模块(否则 home 断)。

**决策(已审):依赖注入。** `inlineSidebarAction`/`inlineSidebarCall` 留 inline,`sidebarHtml(model, deps)` 通过 `deps.inlineSidebarAction` 调用。home 代码不动。(将来做 home-render 若两边都需自包含,再考虑提到 `shared/` util,本批 YAGNI 不做。)

## 组件设计

### `sidebarHtml(model, deps)` — 新模块 `sidebar-render.js`

- **搬入**:`renderSidebarModel` 的整段拼装(当前 index.html 5983-6039)。涵盖 `hidden`/`emptyText` 兜底 + 5 个 `kind` 分支(`exam-groups`/`categories`/`error-groups`/`error-items`/`prep-items`)。
- **入参**:`model`(`GrammarSidebarViewModel.buildPageSidebarModel` / `buildContextSidebarModel` 产物:`hidden`/`title`/`emptyText`/`kind`/`groups`/`items`);`deps = { inlineSidebarAction }`。
- **机械替换**:`escapeHtml(` → `window.escapeHtml(`;`inlineSidebarAction(` → `deps.inlineSidebarAction(`。拼装结构/class/`onclick=` 文本一律不动。

### 文件结构(已审)

新建独立 `docs/grammar-fill/modules/sidebar-render.js`(数据归 `sidebar-view-model`,HTML 归 `sidebar-render`,与 teaching 一致)。新模块需:① index.html 加 `<script src="modules/sidebar-render.js">`(在 escapeHtml 定义之后即可,无模块间依赖);② `check_grammar_modules.py` 加模块条目(18→19)。

### inline 改桥

`renderPageSidebar`(6042)/`renderContextSidebar`(6076)各有一处 `document.getElementById('contextSidebarContent').innerHTML = renderSidebarModel(model);` → 改为 `... = window.GrammarSidebarRender.sidebarHtml(model, { inlineSidebarAction: inlineSidebarAction });`。两函数其余(DOM 取元素、快照、`delegateToContext`/`hidden` 分支、`el.style.display`)不动。删除 inline `renderSidebarModel`。

## 落地四处

| 文件 | 动作 |
|---|---|
| `docs/grammar-fill/modules/sidebar-render.js` | **新建**,导出 `sidebarHtml` |
| `docs/grammar-fill/index.html` | 加 `<script>` 标签;删 `renderSidebarModel`;改两处桥 |
| `scripts/check_grammar_modules.py` | 加 `GrammarSidebarRender`/`sidebarHtml` 模块条目(18→19) |
| `tests/smoke.spec.js` | 加 sidebar-render 纯输出断言 |

### 新增单测断言

- `sidebarHtml({ kind:'exam-groups', title:'套卷', groups:[{year:'2024', items:[{id:'2024A', type:'真题', active:true, action:{}, blankCount:10}]}] }, { inlineSidebarAction:function(a,fn,v){return fn+':'+v;} })` → 含 `context-sidebar-year`、`context-sidebar-item`、注入的 onclick 片段(`startByExam:2024A`)。
- `sidebarHtml({ hidden:true }, {})` → 返回 `''`。

## 验证 & 提交

- `python3 scripts/check_grammar_modules.py`(19 模块)+ `npm run check` 全绿 → 单 checkpoint commit `refactor(grammar-fill): extract sidebarHtml to sidebar-render`。
- **前置**:执行前 index.html 工作区需干净(用户决策地图 WIP 先提交)。

## 完成定义

- [ ] `sidebarHtml(model, deps)` 迁入新 `sidebar-render.js`,`<script>` 标签 + 契约条目齐
- [ ] index.html 删 `renderSidebarModel`,两处桥改注入式调用,`inlineSidebarAction`/`inlineSidebarCall` 原位保留(home 仍可用)
- [ ] `check_grammar_modules.py` 19 模块通过
- [ ] smoke +2 断言全绿
- [ ] `npm run check` 全绿后 commit

## 非目标(YAGNI)

- 不动 home 卡片渲染、不提取共享 onclick util(留给 home-render 批再议)
- 不碰 `renderPageSidebar`/`renderContextSidebar` 的 DOM 编排逻辑(只改 innerHTML 那一行)
- 不改任何 class/onclick 文本/CSS
