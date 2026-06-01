# grammar-fill 引擎待搬清单（地图）

> CSS 抽离后，引擎为 index.html 内联 `<script>` 块（行号区间：**435–6001**，文件共 6187 行）。
> 该块是最后一个无 `src` 的 `<script>`（开标签行 435，闭标签行 6001）。本表为逐块搬迁的依据。
> 生成日期：2026-06-01

| 块名 | 行号区间 | 包含的函数 | 引用的内联全局（需 deps 传入） | 触碰的 DOM id | 已委托的模块 | 孤立度 | 建议搬迁顺序 |
|------|----------|------------|-------------------------------|---------------|--------------|--------|--------------|
| 投影模式 | 4028–4188（不含 4189–4217 的全局 keydown 监听；renderCategoryStats/jumpToCategory 4163–4187 物理在此但概念归三视图，见下） | getFullscreenElement, applyProjectionState, requestTeachingFullscreen, exitTeachingFullscreen, _onTeachingFullscreenChange, enterProjectionMode, exitProjectionMode, _onProjectionFullscreenChange, setDrawerProjectionSize | teachingFullscreenRequested（写）；间接经 snapshot 访问 practiceContext / teachingSession / drawerReturnTo | drawer, page-practice, projectionControls, teachingStage（`.drawer-projection-size-btns button` 选择器） | window.GrammarAppState（buildProjection* / buildDrawerProjectionSizeState）；调用 getPracticeContextSnapshot / getCurrentQuestionIndex / openTeachingStageByIdx / closeTeachingStage / exitTeachingFullscreen / executeDrawerReturn / recordUsageEvent | 中 | 3 |
| 管理员页 | 2159–2161（仅注释，实体已抽到 shared/admin-ui.js） | 无（本段无函数；renderBankStat 起始于 2162 属 Dashboard 块） | 无 | 无 | shared/admin-ui.js（renderAdminPage 等外部，非本引擎定义） | 高 | 1 |
| 云同步 UI | 1711（init 内启动注释）+ 1734–2158 | getCloudLifecycleSnapshot, setCloudLoggingOutState, applyCloudLifecycleState, clearCloudLifecycleState, onCloudStateChange, uploadLocalToCloud, saveErrorBook/savePrepPassages 包装(1965-1985), setSyncStatus, syncBegin, syncEnd, getSavedMaterialsSyncQueueKey, getSavedMaterialsSyncQueue, applySavedMaterialsSyncQueue, requestSavedMaterialsSync, finishSavedMaterialsSync, runSavedMaterialsCloudSync 及 error/prep 两个 sync 入口 | _lastCloudUser, _migrationPromptShown, _adminParamChecked, _loggingOut, _origSaveError, _origSavePrep, _syncOkTimer, _syncInflight, _syncQueueFallbacks；外部 shared 全局：errorBookQuestions, prepPassages, saveErrorBook, savePrepPassages | adminBanner, adminViewingEmail, syncStatus | window.GrammarAppState（normalize/buildCloudLifecycleState, buildCloudArrivalState, buildCloudAdminEntryState, buildLocalCloudMigrationPromptState），window.GrammarSavedMaterialsModel（buildCloudPullResultPlan, buildLocalCloudUploadPlan 等）；外部 window.cloud / renderUserPill / requireAuth / switchPage | 低 | 6 |
| Dashboard 主页 | 2162–2362 | renderBankStat, inlineHomeDashboardAction, runHomeDashboardAction, renderHomeDashboard, getOrderedExams, getCurrentQuestionIndex, renderClassroomSwitcher, navigateExam, jumpToExamFromSwitcher, jumpToQuestionFromSwitcher, jumpQuestionFromSwitcher, renderExamGrid, renderHomeCategories, getSidebarModelDeps, inlineSidebarCall, inlineSidebarAction | BANK, ALL_QUESTIONS, CATEGORY_MAP；外部 shared：errorBookQuestions, prepPassages | bankStat, homeErrorCount, homePrepCount, homeDashboardContent, classroomSwitcher, classroomExamSelect, classroomQuestionSelect, classroomAnswerBtn, classroomProgress, examGrid, homeCategories | window.GrammarHomeDashboardModel, window.GrammarHomeRender, window.GrammarQuestionModel, window.GrammarClassroomSwitcherModel, window.GrammarExamGridModel, window.GrammarCategoryRules, window.GrammarAppState（getCurrentQuestionIndex）；调用 switchPage / setKnowledgeView / openTextbookModal / startByExam / showAnalysisByIdx | 中 | 4 |
| 侧边栏（页面 + Dock） | 2363–3277 | renderPageSidebar, renderContextSidebar, setActiveDock, getPreviousViewLabel, getDockBackLabel, updateDockBackButton, handleDockBack, switchPage, recordUsageEvent, logoClick, enterModule, refreshModulesGreeting, updateBackButton, getUserDisplayName, goHome, goBack, navigateHome, adjustFont, toggleExamYear, updateCounts, startByCategory, startByFineTag, startByExam, renderPracticeBlankSlot, renderUnmatchedBlankWarning, toggleCatItemAnswer, renderExam, getTranslationCache/setTranslationCache/hashPassage, getPassageText, showAnalysisByIdx, closeDrawer, switchDrawerTab（注：2363–2415 为 sidebar 渲染，2417 之后混入 Dock 导航 + 练习渲染，边界不纯） | BANK, ALL_QUESTIONS, CATEGORY_MAP；经 snapshot：practiceContext, previousView, activePage/activeDock, currentHomeView, knowledgeView, drawerReturnTo, teachingSession；外部 shared：errorBookQuestions, prepPassages | contextSidebar, contextSidebarContent, dockBackBtn, dockBackDivider, drawer, drawerContent, drawerOverlay, homeCards, homeCategories, homeDashboard, homeExams, modulesGreeting, page-home, passageBox, practiceHintText, sourceCount, sourceName, stageZhBody, btnToggleAnswers, btnToggleChinese | window.GrammarSidebarViewModel, window.GrammarSidebarRender, window.GrammarAppState（buildPageSwitchPlan, getDockBackLabel/Action, getPreviousViewLabel），window.seeklumeObservability；外部 requireAuth / renderAdminPage | 高（与页面导航深度纠缠） | 5 |
| 迁移训练数据源 | 3278–3387 | getMigrationSourceSnapshot, applyMigrationSourceState, setMigrationSource, toggleMigrationShowAll, filterMigrationCards（顶层 IIFE 初始化 _migrationSource 于 3280；3313 调 applyMigrationSourceState） | MIGRATION_SOURCE_KEY, _migrationSource；**跨段引用** _migrationShowAll / _migrationScope（实际声明在 3888–3889 teaching 块，靠 var 提升才可用）；经 snapshot：practiceContext, teachingSession, selectedQuestion | drawerContent | window.GrammarAppState（normalizeMigrationSource, buildMigrationSourceState, buildMigrationSourceChangePlan）；调用 closeTeachingExamMenu / renderTeachingStage / buildMigrationContent / recordUsageEvent | 低 | 2 |
| 三视图可视化 | 4163–4187（renderCategoryStats/jumpToCategory，物理在投影块尾）+ 4219–4380（考点速查/搜索）+ 4381–6001（视图 A/B/C + 教材 modal + unit mini-modal + 抽屉返回 + 全局图谱 + 知识页/地图） | renderCategoryStats, jumpToCategory；getKnowledgeSearchIndexSnapshot, applyKnowledgeSearchIndexState, buildSearchIndex, renderSearchSnippet, onKnowledgeSearch, navigateToKnowledge, toggleSubsection, setKnowledgeView, _countByFineTag, _freqColor, renderFineCategoryView, getTextbookViewModeSnapshot/apply, renderTextbookView, renderBookDetail, setTextbookViewMode, openTextbookModal, closeTextbookModal, _onTextbookModalKey, getUnitMiniContextSnapshot/apply, openUnitQuestionList, openUnitErrorList, setUnitMiniFilter, _showUnitQuestionsMiniModal, _closeUnitMiniModal, _onUnitMiniKey, _gotoUnitQuestion, getDrawerReturnSnapshot/apply, setDrawerReturnTo, executeDrawerReturn, fadeOutMask, getGlobalGraphStateSnapshot/apply, getTeachingGraph, getGraphNodeIndex, getGraphNodeTypeLabel/Color/Size, getGraphRelevantIds, graphHasFocus, graphEdgeActive, getGlobalGraphFocusPresets/Preset, getGraphBoundsForNodes, graphEscapeAttr, renderGraphTextLines, graphLabelDeps, graphModelDeps, getGraphNodeLabelGroups, getGraphNodePath, buildGraphSvg, applyDmCamera, dmPaintFocus, dmFit, dmHome, dmFocus, dmZoom, dmToggleExpand, dmNodeTap, dmResetView, dmExpandAll, dmRevealNode, dmSearch, openKnowledgePoint, startMigrationFromMap, ensureDmWindowListeners, renderSystemView, _legacyRenderGlobalGraphSvg, applyGlobalGraphTransform, repaintGlobalGraph, initGlobalGraphInteractions, zoomGlobalGraph, fitGlobalGraphBounds, resetGlobalGraphView, centerGlobalGraphOnNode, focusGlobalGraphPreset, selectGlobalGraphNode, showGlobalKnowledgeNode, getGlobalGraphQuestionMatches, renderGlobalGraphInspector, searchGlobalGraph, clearGlobalGraphSearch, renderKnowledgePage, renderKnowledgeMap, showKnowledgeNode, selectKnowledgeCategory | ALL_QUESTIONS, CATEGORY_MAP, KNOWLEDGE_DATA, PATTERN_DATA, KNOWLEDGE_CORE, FINE_TAGS；knowledgeSearchIndex, currentKnowledgeView, currentKnowledgeNodeId, currentKnowledgeKey, currentIsPattern, _textbookViewMode, _unitMiniContext, _unitMiniModalTimer, _drawerReturnTo, globalGraphState, dmCam, dmCtx, dmDrag, dmWindowWired, dmExpanded, dmExpandable, dmHoriz；外部 shared：errorBookQuestions（_countByFineTag、视图 A 题数）；**globalGraphState 被 1143 行 syncAppState() 读取**（跨段） | categoryStats, knowledgeContent, knowledgeSearch, knowledgeSidebar, categoryNav, patternNav, searchResults, knowledgeMapBtn, knowledgeBookBtn, textbookModalWrap, dmCanvas, dmSearch, dmSearchResults, dmViewport, globalGraphCanvas, globalGraphInspector, globalGraphSearch, globalGraphSearchResults, globalGraphViewport | window.GrammarKnowledgeViewModel（buildCategoryStatsModel, countByFineTag, getFrequencyStyle, buildFineCategoryViewModel, buildSearchIndex, buildKnowledgeSidebarModel, buildKnowledgeMapModel, buildKnowledgeNodeDetailModel, buildKnowledgeBookContentModel 等），window.GrammarPracticeViewModel（buildCategoryJumpPlan），window.GrammarAppState（normalizeGlobalGraphState, buildKnowledgeSearchIndexState, knowledge/unitMini/textbook/drawerReturn 状态构造），window.GRAMMAR_FINE_TAGS | 中（图谱子块 dm*/globalGraph* 较孤立，知识页/视图与导航有耦合） | 7 |

## 边界注意事项

- **renderCategoryStats / jumpToCategory（4163–4187）**：物理位置在"投影模式"注释段（4028 起）的尾部、`// Keyboard navigation`（4189）之前，**但概念上属于三视图/考点速查**——`renderCategoryStats` 调 `window.GrammarKnowledgeViewModel.buildCategoryStatsModel` 并写 `categoryStats` DOM；`jumpToCategory` 调 `window.GrammarPracticeViewModel.buildCategoryJumpPlan`。两者与投影的 fullscreen 逻辑无任何调用关系，搬迁时应归入三视图块，**不要跟投影一起搬**。

- **4189–4217 的全局 `document.addEventListener('keydown', …)`**：紧跟投影块、夹在 renderCategoryStats 之后，是讲题/抽屉的键盘导航（jumpTeachingQuestion / navigateBlank / closeTeachingStage / closeDrawer），既不属于投影也不属于三视图，属"教学 stage 全局监听"。搬投影或三视图时都要绕开它。

- **migration 数据源块跨段引用 `_migrationShowAll` / `_migrationScope`**：这两个 `var` 实际声明在 3888–3889（teaching/迁移渲染块内），但在 3316–3317（setMigrationSource，迁移数据源块）就被赋值——靠 `var` 提升才不报错。搬迁数据源块时这两个变量必须随之约定归属（建议归 migration 状态），否则会出现"声明在 B 块、写在 A 块"的悬空引用。

- **`globalGraphState` 跨段读取**：声明/owner 在三视图块的 4944（`var globalGraphState = window.GrammarAppState.normalizeGlobalGraphState()`），但 `syncAppState()`（1143 行，app-state 同步块）会读它写入快照。搬三视图块时，syncAppState 对 globalGraphState 的读取需改为经 deps/getter 注入。

- **`saveErrorBook` / `savePrepPassages` 的运行时包装（1965–1985）**：云同步块用 `_origSaveError = saveErrorBook; saveErrorBook = function(){…}` 给外部 shared 函数打补丁，触发自动云同步。这是对 **shared/error-book.js、shared/lesson-prep.js 顶层全局**的猴补丁，不是本引擎定义的函数——搬云同步块时这层 wrap 必须保留补丁语义。

- **"管理员页"注释段（2159–2161）名不副实**：实体逻辑早已抽到 `shared/admin-ui.js`，注释下方第一个函数 `renderBankStat`（2162）实际是 Dashboard 块开头。该候选块在引擎里已基本为空，孤立度最高、可最先确认无需搬迁。

- **侧边栏块边界不纯**：`// 套卷侧边栏`（2397）注释之后，从 setActiveDock（2418）起迅速混入 Dock 返回导航（getDockBackLabel/handleDockBack）、switchPage、goHome/goBack/navigateHome、以及练习渲染（renderExam/getPassageText/closeDrawer 等），直到 3277。纯"侧边栏渲染"只有 renderPageSidebar/renderContextSidebar 两函数；其余是页面导航 + 练习引擎，搬迁时需重新切块，别按注释整段搬。

- **命名一致性**：私有函数/变量统一用 `_` 前缀（`_onTextbookModalKey`、`_unitMiniContext`、`_legacyRenderGlobalGraphSvg` 等）；图谱新旧两套并存——`renderSystemView`（新，dm* 相机体系）与 `_legacyRenderGlobalGraphSvg` + globalGraph* 一系列（旧）共存于三视图块，搬迁时注意是否要一并淘汰 legacy。

## 散落的内联顶层全局清单（去全局化最终要收编的对象）

按声明位置与被引用块列出。这些是未来 `window.GrammarApp`（或现有 `window.GrammarAppState`）命名空间要收编的对象——目前散落为引擎顶层 `var`/`let`/`const`。

**常量类（派生自 window.* 数据，基本只读，多块共享）：**
- `BANK`（440）— Dashboard、侧边栏
- `CATEGORY_MAP`（441）— Dashboard、侧边栏、三视图、saved-materials、投影(renderCategoryStats)
- `EXAMS_BY_ID`（444）、`CATEGORY_TIPS`（448）、`TRAP_DATA`（456）
- `FOCUS_GUIDES`（535）、`TRAP_GUIDES`（536）
- `ALL_QUESTIONS`（556）— Dashboard、侧边栏、三视图
- `KNOWLEDGE_DATA`（582）、`PATTERN_DATA`（583）、`KNOWLEDGE_CORE`（584）、`FINE_TAGS`（586）— 三视图
- `TEACHING_GRAMMAR_MINDMAPS`（588）
- `DRAWER_STORAGE_KEY`（653）、`MIGRATION_SOURCE_KEY`（3279）、`COMPACT_KEY`（4010）— 各自块的 localStorage key

**可变状态类（搬迁时必须经 deps 注入或收进命名空间）：**
- `currentExam`（632）、`currentQuestions`（633）、`selectedQuestion`（634）— 练习/讲题（多块）
- `teachingSession`（635）、`teachingReturnStack`（636）、`teachingBaseContext`（637）— 讲题
- `teachingFullscreenRequested`（638）— **投影块**写，app-state 同步读
- `_keepTeachingOnPageSwitch`（639）— 侧边栏(switchPage)
- `passageFontSize`（640）、`drawerFontSize`（641）、`showAnswers`（642）、`showChinese`（643）— 练习/字号
- `previousView`（644）— 侧边栏导航/Dock 返回
- `_activePage`（645）、`_activeDock`（646）、`_currentHomeView`（647）— 侧边栏/页面导航
- `_loggingOut`（648）— 云同步
- `currentKnowledgeView`（649）、`currentKnowledgeKey`（650）、`currentKnowledgeNodeId`（651）、`currentIsPattern`（652）— **三视图**/知识页
- `drawerHeight`（654）— 抽屉
- `_errorBulkMode`（1335）、`_prepBulkMode`（1336）、`_errorCatFilter`（1478）— saved-materials
- `_lastCloudUser`（1736）、`_migrationPromptShown`（1737）、`_adminParamChecked`（1738）— **云同步**
- `_origSaveError`（1965）、`_origSavePrep`（1976）— **云同步**（猴补丁存档）
- `_syncOkTimer`（1988）、`_syncInflight`（2025）、`_syncQueueFallbacks`（2056）— **云同步**
- `_migrationSource`（3280）— **迁移数据源**
- `_teachingMigrationRegistry`（3389）、`_teachingMigrationCounter`（3390）— 讲题迁移渲染
- `_migrationShowAll`（3888）、`_migrationScope`（3889）— **声明在讲题块、但被迁移数据源块(3316)提前写**（跨段坑）
- `knowledgeSearchIndex`（4220）— **三视图**考点速查
- `_textbookViewMode`（4457）、`_unitMiniContext`（4652）、`_unitMiniModalTimer`（4653）— **三视图**教材/unit modal
- `_drawerReturnTo`（4860）— **三视图**抽屉返回（投影块也读）
- `globalGraphState`（4944）— **三视图**全局图谱，**app-state syncAppState(1143)跨段读**
- `dmCam`（5120）、`dmCtx`（5121）、`dmDrag`（5122）、`dmWindowWired`（5123）、`dmExpanded`（5124）、`dmExpandable`（5125）、`dmHoriz`（5126）— **三视图**图谱相机/布局（相对孤立，仅图谱块内用）

**外部 shared 顶层全局（非本引擎定义，但被多块引用，搬迁时作为外部依赖）：**
- `errorBookQuestions` / `saveErrorBook` / `loadErrorBook`（shared/error-book.js）
- `prepPassages` / `savePrepPassages` / `loadPrepPassages`（shared/lesson-prep.js）
- `escapeHtml`、`requireAuth`、`renderUserPill`、`renderAdminPage`、`window.cloud`（shared/*.js）

统计：内联顶层可变全局约 **40 个**（不含常量类约 18 个、不含外部 shared 全局）。
