# index.html 模块化抽离 · 架构现状与 backlog

> 活文档。记录把 `docs/grammar-fill/index.html` 单体渐进拆成纯模块的进度与待办。每批做完回来勾一勾。
> 最后更新:2026-05-30(sidebar-render 完成 `dfcce00`;teaching-render batch 1/2/3 已上线)。

## 总览

`index.html`(当前 ~9706 行)按「一次抽一个职责切片」往外迁,产物分两处:
- `docs/grammar-fill/modules/*.js`(18 个,~9979 行)——语法填空专属纯逻辑/渲染。
- `docs/shared/*.js`(9 个,~2329 行)——跨页公共:认证、云同步、Word 导入、观测、管理员等。

**纯模块铁律**(`check_grammar_modules.py` 门禁):不碰 DOM、storage、网络、alert、document。只「数据/片段进,字符串/计划出」。副作用与编排留 index.html。

## 三层模型

| 层 | 职责 | 状态 |
|---|---|---|
| ① 状态层 `app-state.js`(1782) | 所有状态收敛进 `GrammarAppState` 同步桥 | ✅ 基本完成(留兼容桥过渡) |
| ② 数据/规则层(各域 view-model) | 「数据怎么算」 | ✅ 各域均有模块 |
| ③ 渲染层(HTML 字符串拼装) | 「HTML 怎么拼」 | 🔧 **仅 teaching 域完成** |

## 样板:teaching 域(唯一「数据+渲染」都抽净的域)

- 数据/规则:`teaching-view-model`(799)、`teaching-guide`(1037)、`migration-training`(564)、`focus-rules`、`teaching-axes`。
- 渲染:`teaching-render.js`(351)——讲题台外壳/dock/迁移/解析/抽屉的 HTML 全出(batch 1/2/3)。
- index.html 对应函数 = 取数 + 副作用编排 + 调模块。

**所有后续 `-render` 抽离照此模式。**

## 已做 ✅

- **状态层**:`app-state.js` 同步桥覆盖选中题/讲题 session/返回栈/云同步队列/字号/投影/页面导航等。
- **view-model 层**(18 模块):`knowledge-view-model`(1497)、`saved-materials-model`(1386)、`teaching-guide`(1037)、`teaching-view-model`(799)、`migration-training`(564)、`focus-rules`(354)、`practice-view-model`(324)、`home-dashboard-model`(281)、`sidebar-view-model`(253)、`question-model`(171)、`classroom-switcher-model`(190)、`category-rules`(189)、`passage-utils`(188)、`exam-grid-model`(110)、`teaching-axes`(69)、`word-import-model`(434)。
- **render 层**:`teaching-render.js`(teaching 域,batch 1/2/3 完成 + 上线)。

## 待做 🔧(render 抽离 backlog)

各域数据已进 view-model,但 **HTML 字符串拼装仍内联在 index.html**(62 处 `innerHTML=`、199 处 `html+=`)。按域建 `-render`:

| 优先级 | 域 | 仍内联的主函数(毛体量) | 目标模块 | 状态 |
|---|---|---|---|---|
| ✅ | **sidebar** | ~~`renderSidebarModel`~~ → `sidebarHtml` | `sidebar-render` | **完成 `dfcce00`**(注入式;onclick helper 留 inline 共享 home) |
| 2 | **home/首页** | `renderHomeDashboard`(55)、`renderClassroomSwitcher`(49)、`renderExamGrid`、`renderHomeCategories` | `home-render` | 待办 |
| 3 | **practice/exam 正文** | `renderExam`(80)、`renderPracticeBlankSlot` | `practice-render` | 待办 |
| 4 | **错题本/备课** | `renderErrorBook`(51)、`renderPrepList`(34) | 并入 saved-materials render | 待办 |
| 5 | **knowledge/书本速查/教材** | `selectKnowledgeCategory`(327)、`renderTextbookView`(116)、`_showUnitQuestionsMiniModal`(95)、`renderFineCategoryView`(65)、`renderKnowledgeMap`(63)、`renderKnowledgePage`(33) | `knowledge-render` | 待办(最大最杂,放后) |
| — | **决策地图/全局图谱 SVG** | `renderSystemView`(93)、`_legacyRenderGlobalGraphSvg`(82)、`buildGraphSvg`(55)、`renderGlobalGraphInspector`(64) | `graph-render` | ⚠️ **HOLD**——正在重做,定型再抽 |

> 行数为函数毛体量(含编排),真正可抽的纯 HTML 是子集,精确边界每批 brainstorming 时定。

## 该留 inline(不抽)

副作用/编排层,纯模块原则下必须留 index.html:`syncAppState`、`switchPage`、`teardownTeachingStage`、`setupDrawerResize`、`initGlobalGraphInteractions`、各 DOM 事件 wiring、云生命周期、`clearCloudLifecycleState`。

## 推荐顺序

~~`sidebar-render`~~ ✅ → **`home-render`(下一批)** → `practice-render` → 错题本/备课 render → `knowledge-render`(最后)。决策地图相关全程 **HOLD** 到用户那边定型。

## 每批做法(沿用 teaching-render)

1. brainstorming 定纯 HTML 边界 → 2. writing-plans 出 TDD 计划 → 3. 每函数一个 checkpoint(加红断言→模块函数→inline 改桥→契约 +1→`npm run check` 绿→commit)→ 4. 收尾合并/上线。
