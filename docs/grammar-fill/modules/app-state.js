// grammar-fill/modules/app-state.js
//
// Small state container used while the legacy page is gradually de-globalized.

/* eslint-disable */
(function(){
  var state = {
    currentExam: null,
    currentQuestions: [],
    selectedQuestion: null,
    teachingSession: null,
    teachingReturnStack: [],
    teachingBaseContext: null,
    teachingFullscreenRequested: false,
    teachingMigrationRegistry: {},
    teachingMigrationCounter: 0,
    keepTeachingOnPageSwitch: false,
    passageFontSize: 24,
    drawerFontSize: 24,
    showAnswers: false,
    showChinese: false,
    previousView: null,
    activePage: 'home',
    activeDock: 'home',
    currentHomeView: 'cards',
    currentKnowledgeView: 'map',
    currentKnowledgeKey: '',
    currentKnowledgeNodeId: '',
    currentIsPattern: false,
    knowledgeSearchIndex: [],
    unitMiniContext: null,
    globalGraphState: {
      scale: 0.72,
      tx: 40,
      ty: 48,
      selectedId: '',
      focusIds: [],
      focusMode: 'overview',
      ready: false
    },
    textbookViewMode: 'gallery',
    errorBulkMode: false,
    prepBulkMode: false,
    drawerReturnTo: null,
    migrationSource: 'bank',
    compactMode: false,
    projectionMode: false,
    drawerProjectionSize: 'half',
    drawerHeight: null,
    errorSyncQueue: {
      pending: false,
      rerunRequested: false
    },
    prepSyncQueue: {
      pending: false,
      rerunRequested: false
    },
    cloudLastUserKey: '',
    cloudMigrationPromptShown: false,
    cloudAdminParamChecked: false,
    cloudLoggingOut: false,
    syncInflight: 0,
    syncStatus: null,
    syncStatusMessage: ''
  };

  function get(key) { return state[key]; }
  function set(key, value) {
    state[key] = value;
    return value;
  }
  function patch(values) {
    Object.keys(values || {}).forEach(function(key) {
      state[key] = values[key];
    });
    return state;
  }

  function createTeachingContextSnapshot(values) {
    values = values || {};
    var session = values.teachingSession || null;
    var questions = Array.isArray(values.currentQuestions) ? values.currentQuestions.slice() : [];
    return {
      currentExam: values.currentExam || null,
      currentQuestions: questions,
      selectedQuestion: values.selectedQuestion || null,
      idx: typeof values.idx === 'number' ? values.idx : 0,
      tab: session ? session.tab : 'guide',
      showAnswer: session ? !!session.showAnswer : false,
      previousView: values.previousView || null,
      showAnswers: !!values.showAnswers,
      showChinese: !!values.showChinese
    };
  }

  function isSameTeachingExamContext(a, b, deps) {
    a = a || {};
    b = b || {};
    deps = deps || {};
    var sameQuestion = deps.sameQuestion || function(x, y) { return x === y; };
    if (!a.mode || !b.mode || a.mode !== b.mode) return false;
    if (a.mode === 'exam') return a.examId === b.examId;
    if (a.mode === 'prep') return a.prepId === b.prepId;
    if (a.mode === 'category') return a.category === b.category;
    if (a.mode === 'error') {
      var aQ = a.questions && a.questions[0];
      var bQ = b.questions && b.questions[0];
      return sameQuestion(aQ, bQ);
    }
    return a.source === b.source;
  }

  function clampQuestionIndex(idx, total) {
    total = Number(total) || 0;
    if (total <= 0) return -1;
    idx = Number(idx) || 0;
    if (idx < 0) return 0;
    if (idx >= total) return total - 1;
    return idx;
  }

  function getWrappedQuestionIndex(deltaOrIdx, isDelta, currentIdx, total) {
    total = Number(total) || 0;
    if (total <= 0) return -1;
    var nextIdx = isDelta ? (Number(currentIdx) || 0) + (Number(deltaOrIdx) || 0) : (Number(deltaOrIdx) || 0);
    if (nextIdx < 0) return total - 1;
    if (nextIdx >= total) return 0;
    return nextIdx;
  }

  function getCurrentQuestionIndex(values, deps) {
    values = values || {};
    deps = deps || {};
    var questions = Array.isArray(values.currentQuestions) ? values.currentQuestions : [];
    if (!questions.length) return -1;
    var session = values.teachingSession || null;
    if (session && typeof session.idx === 'number') return session.idx;
    if (values.selectedQuestion && deps.findSelectedIndex) {
      var selectedIdx = deps.findSelectedIndex(values.selectedQuestion, questions);
      if (selectedIdx !== -1) return selectedIdx;
    }
    return 0;
  }

  function findSelectedQuestionIndex(selectedQuestion, questions) {
    questions = Array.isArray(questions) ? questions : [];
    if (!selectedQuestion) return -1;
    return questions.findIndex(function(item) {
      return item === selectedQuestion || String(item && item.no) === String(selectedQuestion && selectedQuestion.no);
    });
  }

  function buildSelectedQuestionState(questions, idx) {
    questions = Array.isArray(questions) ? questions : [];
    idx = clampQuestionIndex(idx, questions.length);
    return {
      selectedQuestion: idx < 0 ? null : questions[idx],
      selectedQuestionIndex: idx
    };
  }

  function buildSelectedQuestionSnapshotState(selectedQuestion, questions) {
    return {
      selectedQuestion: selectedQuestion || null,
      selectedQuestionIndex: findSelectedQuestionIndex(selectedQuestion, questions)
    };
  }

  function buildSelectedQuestionFromContext(questions, context) {
    questions = Array.isArray(questions) ? questions : [];
    context = context || {};
    var selectedQuestion = context.selectedQuestion || null;
    if (!selectedQuestion && typeof context.idx === 'number') {
      selectedQuestion = buildSelectedQuestionState(questions, context.idx).selectedQuestion;
    }
    var selectedQuestionIndex = findSelectedQuestionIndex(selectedQuestion, questions);
    if (selectedQuestionIndex === -1 && selectedQuestion && typeof context.idx === 'number') {
      selectedQuestionIndex = clampQuestionIndex(context.idx, questions.length);
    }
    return {
      selectedQuestion: selectedQuestion || null,
      selectedQuestionIndex: selectedQuestion ? selectedQuestionIndex : -1
    };
  }

  function clearSelectedQuestionState() {
    return {
      selectedQuestion: null,
      selectedQuestionIndex: -1
    };
  }

  function buildPracticeContextState(values) {
    values = values || {};
    var currentExam = values.currentExam || null;
    var currentQuestions = Array.isArray(values.currentQuestions)
      ? values.currentQuestions
      : Array.isArray(values.questions)
        ? values.questions
        : (currentExam && Array.isArray(currentExam.questions) ? currentExam.questions : []);
    return {
      currentExam: currentExam,
      currentQuestions: currentQuestions
    };
  }

  function buildPracticeContextSnapshotState(values) {
    return buildPracticeContextState(values);
  }

  function clearPracticeContextState() {
    return {
      currentExam: null,
      currentQuestions: []
    };
  }

  function normalizePreviousView(previousView) {
    if (!previousView || typeof previousView !== 'object') return null;
    var page = previousView.page || '';
    if (!page) return null;
    if (page === 'home') {
      return {
        page: 'home',
        view: normalizeHomeView(previousView.view || 'cards')
      };
    }
    if (page === 'error-book' || page === 'lesson-prep') {
      return { page: page };
    }
    return { page: page };
  }

  function buildPreviousViewState(previousView) {
    var normalized = normalizePreviousView(previousView);
    return {
      previousView: normalized,
      label: getPreviousViewLabel(normalized)
    };
  }

  function getPracticeEntryPreviousView(source) {
    var key = typeof source === 'string'
      ? source
      : (source && (source.source || source.entry || source.mode || source.page)) || '';
    if (key === 'category' || key === 'categories' || key === 'points-training') return { page: 'points-training' };
    if (key === 'exam' || key === 'exams' || key === 'bank') return { page: 'home', view: 'exams' };
    if (key === 'error' || key === 'errors' || key === 'error-book') return { page: 'error-book' };
    if (key === 'prep' || key === 'lesson-prep') return { page: 'lesson-prep' };
    return null;
  }

  function normalizePageKey(page) {
    if (
      page === 'welcome'
      || page === 'modules'
      || page === 'home'
      || page === 'practice'
      || page === 'knowledge'
      || page === 'points-training'
      || page === 'error-book'
      || page === 'lesson-prep'
      || page === 'admin'
    ) {
      return page;
    }
    return 'home';
  }

  function isProtectedPage(page) {
    return page === 'error-book' || page === 'lesson-prep' || page === 'admin';
  }

  function buildPageAuthGuard(page, isAuthenticated) {
    var needsAuth = isProtectedPage(page);
    return {
      page: normalizePageKey(page),
      needsAuth: needsAuth,
      isAuthenticated: !!isAuthenticated,
      shouldRequireAuth: needsAuth && !isAuthenticated,
      canEnter: !needsAuth || !!isAuthenticated
    };
  }

  function buildPageShellState(page) {
    page = normalizePageKey(page);
    return {
      page: page,
      guestMode: page === 'welcome',
      modulesMode: page === 'modules',
      shouldRefreshModulesGreeting: page === 'modules'
    };
  }

  function normalizeDockKey(dockKey) {
    if (
      dockKey === 'home'
      || dockKey === 'exams'
      || dockKey === 'categories'
      || dockKey === 'points-training'
      || dockKey === 'knowledge'
      || dockKey === 'error-book'
      || dockKey === 'lesson-prep'
      || dockKey === 'ai'
    ) {
      return dockKey;
    }
    return '';
  }

  function getDockKeyForPage(page) {
    page = normalizePageKey(page);
    if (page === 'home' || page === 'knowledge' || page === 'error-book' || page === 'lesson-prep' || page === 'points-training') {
      return page;
    }
    return '';
  }

  function buildActivePageState(page) {
    var activePage = normalizePageKey(page);
    return {
      activePage: activePage,
      activeDock: getDockKeyForPage(activePage)
    };
  }

  function buildDockActivationState(dockKey) {
    return {
      activeDock: normalizeDockKey(dockKey)
    };
  }

  function buildPageRenderPlan(page) {
    page = normalizePageKey(page);
    var renderAction = '';
    if (page === 'home') renderAction = 'navigate-home-cards';
    if (page === 'error-book') renderAction = 'render-error-book';
    if (page === 'lesson-prep') renderAction = 'render-lesson-prep';
    if (page === 'admin') renderAction = 'render-admin';
    if (page === 'points-training') renderAction = 'render-points-training';
    return {
      page: page,
      renderAction: renderAction,
      homeView: renderAction === 'navigate-home-cards' ? 'cards' : '',
      trackModule: true,
      renderSidebar: true,
      updateDockBackButton: true
    };
  }

  function buildPageSwitchPlan(page, values) {
    values = values || {};
    var authGuard = buildPageAuthGuard(page, !!values.isAuthenticated);
    var pageState = buildActivePageState(authGuard.page);
    var canEnter = !!authGuard.canEnter;
    return {
      requestedPage: String(page || ''),
      page: pageState.activePage,
      canEnter: canEnter,
      shouldRequireAuth: !!authGuard.shouldRequireAuth,
      shouldCloseTeaching: shouldCloseTeachingOnPageSwitch(values),
      authGuard: authGuard,
      pageState: pageState,
      shellState: canEnter ? buildPageShellState(pageState.activePage) : null,
      renderPlan: canEnter ? buildPageRenderPlan(pageState.activePage) : null
    };
  }

  function buildModuleEntryPlan(moduleId) {
    var normalizedModuleId = String(moduleId || '');
    var supported = normalizedModuleId === 'grammar';
    return {
      moduleId: normalizedModuleId,
      supported: supported,
      shouldSwitchPage: supported,
      page: supported ? 'home' : '',
      homeView: supported ? 'cards' : ''
    };
  }

  function buildGoHomePlan() {
    return {
      shouldSwitchPage: true,
      shouldNavigateHome: true,
      page: 'home',
      homeView: 'cards'
    };
  }

  function buildTeachingPageSwitchRetentionState(force) {
    return {
      keepTeachingOnPageSwitch: !!force
    };
  }

  function buildTeachingPageSwitchRetentionSnapshotState(values) {
    values = values || {};
    return {
      keepTeachingOnPageSwitch: !!values.keepTeachingOnPageSwitch
    };
  }

  function shouldCloseTeachingOnPageSwitch(values) {
    values = values || {};
    return !!values.teachingSession && !values.keepTeachingOnPageSwitch;
  }

  function getBlankNavigationIndex(values) {
    values = values || {};
    var total = Number(values.total) || 0;
    if (total <= 0) return -1;
    var delta = Number(values.delta) || 0;
    if (!values.hasSelectedQuestion) return delta < 0 ? total - 1 : 0;
    var currentIdx = Number(values.currentIdx);
    if (!isFinite(currentIdx) || currentIdx < 0) return -1;
    return getWrappedQuestionIndex(delta, true, currentIdx, total);
  }

  function getPreviousViewLabel(previousView) {
    previousView = normalizePreviousView(previousView);
    if (!previousView) return '返回主页';
    if (previousView.page === 'home') {
      if (previousView.view === 'exams') return '返回套卷列表';
      if (previousView.view === 'categories') return '返回考点列表';
      return '返回主页';
    }
    if (previousView.page === 'error-book') return '返回错题本';
    if (previousView.page === 'lesson-prep') return '返回备课资料';
    if (previousView.page === 'points-training') return '返回考点训练';
    return '返回上一页';
  }

  function normalizeHomeView(view) {
    if (view === 'exams' || view === 'categories') return view;
    return 'cards';
  }

  function getHomeDockKey(view) {
    view = normalizeHomeView(view);
    if (view === 'exams') return 'exams';
    if (view === 'categories') return 'categories';
    return 'home';
  }

  function buildHomeViewState(view) {
    var currentHomeView = normalizeHomeView(view);
    return {
      currentHomeView: currentHomeView,
      dockKey: getHomeDockKey(currentHomeView)
    };
  }

  function normalizeKnowledgeView(view) {
    if (
      view === 'map'
      || view === 'book'
      || view === 'fine-cat'
      || view === 'textbook'
      || view === 'system'
      || view === 'map-node'
      || view === 'system-node'
    ) {
      return view;
    }
    return 'map';
  }

  function buildKnowledgeViewState(values) {
    if (typeof values === 'string') values = { currentKnowledgeView: values };
    values = values || {};
    return {
      currentKnowledgeView: normalizeKnowledgeView(values.currentKnowledgeView || values.view),
      currentKnowledgeKey: values.currentKnowledgeKey || values.key || '',
      currentKnowledgeNodeId: values.currentKnowledgeNodeId || values.nodeId || '',
      currentIsPattern: typeof values.currentIsPattern === 'boolean' ? values.currentIsPattern : !!values.isPattern
    };
  }

  function normalizeKnowledgeSearchIndex(index) {
    return Array.isArray(index) ? index.slice() : [];
  }

  function buildKnowledgeSearchIndexState(index) {
    return {
      knowledgeSearchIndex: normalizeKnowledgeSearchIndex(index)
    };
  }

  function normalizeUnitMiniSource(source) {
    return source === 'errors' ? 'errors' : 'bank';
  }

  function normalizeUnitMiniFilter(filter, source) {
    source = normalizeUnitMiniSource(source);
    if (source === 'errors') return 'all';
    if (filter === '模拟' || filter === 'all') return filter;
    return '真题';
  }

  function normalizeUnitMiniContext(context) {
    if (!context || typeof context !== 'object') return null;
    var source = normalizeUnitMiniSource(context.source);
    return {
      unitLabel: context.unitLabel || '',
      tagIds: Array.isArray(context.tagIds) ? context.tagIds.slice() : [],
      source: source,
      filter: normalizeUnitMiniFilter(context.filter, source)
    };
  }

  function buildUnitMiniContextState(context) {
    return {
      unitMiniContext: normalizeUnitMiniContext(context)
    };
  }

  function buildUnitMiniFilterState(context, filter) {
    var nextContext = normalizeUnitMiniContext(context);
    if (!nextContext) return { unitMiniContext: null };
    nextContext.filter = normalizeUnitMiniFilter(filter, nextContext.source);
    return {
      unitMiniContext: nextContext
    };
  }

  function clearUnitMiniContextState() {
    return {
      unitMiniContext: null
    };
  }

  function normalizeGlobalGraphState(values) {
    values = values || {};
    var scale = Number(values.scale);
    var tx = Number(values.tx);
    var ty = Number(values.ty);
    return {
      scale: isFinite(scale) && scale > 0 ? scale : 0.72,
      tx: isFinite(tx) ? tx : 40,
      ty: isFinite(ty) ? ty : 48,
      selectedId: values.selectedId || '',
      focusIds: Array.isArray(values.focusIds) ? values.focusIds.slice() : [],
      focusMode: values.focusMode || 'overview',
      ready: !!values.ready
    };
  }

  function buildGlobalGraphState(values) {
    return {
      globalGraphState: normalizeGlobalGraphState(values)
    };
  }

  function buildGlobalGraphPanState(values, deltaX, deltaY) {
    var next = normalizeGlobalGraphState(values);
    next.tx += Number(deltaX) || 0;
    next.ty += Number(deltaY) || 0;
    return {
      globalGraphState: next
    };
  }

  function buildGlobalGraphZoomState(values, factor, originX, originY, options) {
    var next = normalizeGlobalGraphState(values);
    options = options || {};
    var minScale = Number(options.minScale) || 0.28;
    var maxScale = Number(options.maxScale) || 1.55;
    var ox = typeof originX === 'number' ? originX : (Number(options.width) || 1000) / 2;
    var oy = typeof originY === 'number' ? originY : (Number(options.height) || 700) / 2;
    var prev = next.scale;
    var rawNext = prev * (Number(factor) || 1);
    var nextScale = Math.max(minScale, Math.min(maxScale, rawNext));
    if (nextScale === prev) {
      return {
        globalGraphState: next
      };
    }
    next.tx = ox - (ox - next.tx) * (nextScale / prev);
    next.ty = oy - (oy - next.ty) * (nextScale / prev);
    next.scale = nextScale;
    return {
      globalGraphState: next
    };
  }

  function buildGlobalGraphFitBoundsState(values, bounds, viewport, options) {
    var next = normalizeGlobalGraphState(values);
    if (!bounds) return { globalGraphState: next };
    viewport = viewport || {};
    options = options || {};
    var width = Number(viewport.width) || 1000;
    var height = Number(viewport.height) || 700;
    var pad = typeof options.pad === 'number' ? options.pad : (width < 700 ? 34 : 72);
    var minScale = Number(options.minScale) || 0.34;
    var maxScale = Number(options.maxScale) || 1.18;
    var boundsWidth = Math.max(1, Number(bounds.w) || 1);
    var boundsHeight = Math.max(1, Number(bounds.h) || 1);
    next.scale = Math.max(minScale, Math.min(maxScale, Math.min(
      (width - pad * 2) / boundsWidth,
      (height - pad * 2) / boundsHeight
    )));
    next.tx = width / 2 - ((Number(bounds.x) || 0) + boundsWidth / 2) * next.scale;
    next.ty = height / 2 - ((Number(bounds.y) || 0) + boundsHeight / 2) * next.scale;
    return {
      globalGraphState: next
    };
  }

  function buildGlobalGraphCenterNodeState(values, node, nodeSize, viewport) {
    var next = normalizeGlobalGraphState(values);
    if (!node) return { globalGraphState: next };
    nodeSize = nodeSize || {};
    viewport = viewport || {};
    var width = Number(viewport.width) || 1000;
    var height = Number(viewport.height) || 700;
    var nodeWidth = Number(nodeSize.w) || 0;
    var nodeHeight = Number(nodeSize.h) || 0;
    next.tx = width / 2 - ((Number(node.x) || 0) + nodeWidth / 2) * next.scale;
    next.ty = height / 2 - ((Number(node.y) || 0) + nodeHeight / 2) * next.scale;
    return {
      globalGraphState: next
    };
  }

  function buildGlobalGraphFocusState(values, nodeId, focusIds, focusMode) {
    var next = normalizeGlobalGraphState(values);
    next.selectedId = nodeId || '';
    next.focusIds = Array.isArray(focusIds) ? focusIds.slice() : [];
    next.focusMode = focusMode || 'overview';
    return {
      globalGraphState: next
    };
  }

  function normalizeTextbookViewMode(mode) {
    if (mode === 'list') return 'list';
    return 'gallery';
  }

  function buildTextbookViewModeState(mode) {
    return {
      textbookViewMode: normalizeTextbookViewMode(mode)
    };
  }

  function getDockBackLabel(values) {
    values = values || {};
    if (values.drawerReturnTo) return values.drawerReturnTo.label || '返回上一步';
    if (values.activePage === 'home' && values.currentHomeView !== 'cards') return '返回主页';
    if (values.activePage === 'practice') return getPreviousViewLabel(values.previousView);
    if (values.activePage === 'knowledge' && values.currentKnowledgeView === 'map-node') return '返回知识地图';
    if (values.activePage === 'knowledge' && values.currentKnowledgeView === 'system-node') return '返回全局图谱';
    return '';
  }

  function getDockBackAction(values) {
    values = values || {};
    if (values.drawerReturnTo) return { type: 'drawer-return' };
    if (values.activePage === 'home' && normalizeHomeView(values.currentHomeView) !== 'cards') {
      return { type: 'home-view', view: 'cards' };
    }
    if (values.activePage === 'practice') return { type: 'previous-view' };
    if (values.activePage === 'knowledge' && values.currentKnowledgeView === 'map-node') {
      return { type: 'knowledge-map' };
    }
    if (values.activePage === 'knowledge' && values.currentKnowledgeView === 'system-node') {
      return { type: 'knowledge-system' };
    }
    return { type: 'none' };
  }

  function buildPreviousViewReturn(previousView) {
    previousView = normalizePreviousView(previousView);
    if (!previousView) {
      return {
        type: 'home',
        page: 'home',
        homeView: 'cards',
        nextPreviousView: null
      };
    }
    if (previousView.page === 'home') {
      return {
        type: 'home',
        page: 'home',
        homeView: normalizeHomeView(previousView.view || 'cards'),
        nextPreviousView: null
      };
    }
    return {
      type: 'page',
      page: previousView.page || 'home',
      homeView: '',
      nextPreviousView: null
    };
  }

  function buildDrawerReturnState(info) {
    return {
      drawerReturnTo: info || null
    };
  }

  function consumeDrawerReturn(drawerReturnTo) {
    return {
      returnInfo: drawerReturnTo || null,
      drawerReturnTo: null
    };
  }

  function buildDrawerClosePlan(preserveDrawerReturn) {
    return {
      action: 'close-drawer',
      active: true,
      shouldCloseDrawer: true,
      shouldCloseOverlay: true,
      selectedState: clearSelectedQuestionState(),
      shouldSyncAppState: true,
      shouldCloseAnalysisFloat: true,
      shouldClearBlankHighlight: true,
      shouldRenderClassroomSwitcher: true,
      shouldClearDrawerReturn: !preserveDrawerReturn
    };
  }

  function normalizeDrawerTab(tab) {
    if (tab === 'migration' || tab === 'theory') return tab;
    return 'analysis';
  }

  function buildDrawerTabSwitchPlan(tab, values) {
    values = values || {};
    var normalizedTab = normalizeDrawerTab(tab);
    var hasTeachingSession = !!values.teachingSession;
    var hasSelectedQuestion = !!values.selectedQuestion;
    return {
      action: 'switch-drawer-tab',
      tab: normalizedTab,
      shouldUseTeachingTab: hasTeachingSession,
      shouldUpdateTabChrome: !hasTeachingSession,
      shouldRenderContent: !hasTeachingSession && hasSelectedQuestion,
      contentType: normalizedTab,
      contentElementId: 'drawerContent',
      activeTabSelector: '.drawer-tab[data-tab="' + normalizedTab + '"]',
      tabSelector: '.drawer-tab',
      tabActiveClass: 'active',
      errorHtml: '<div class="empty-hint">这一栏内容加载失败，但题目抽屉已经打开。请刷新后再试。</div>'
    };
  }

  function normalizeMigrationSource(source) {
    if (source === 'errors' || source === 'mock') return source;
    return 'bank';
  }

  function buildMigrationSourceState(source) {
    return {
      migrationSource: normalizeMigrationSource(source)
    };
  }

  function buildMigrationSourceChangePlan(source, context) {
    context = context || {};
    var migrationSource = normalizeMigrationSource(source);
    var question = context.question || null;
    var hasTeachingSession = !!context.hasTeachingSession;
    var hasSelectedQuestion = !!context.hasSelectedQuestion;
    return {
      migrationSource: migrationSource,
      storageValue: migrationSource,
      eventName: 'migration_source_selected',
      eventModule: 'migration-training',
      eventContext: {
        source: migrationSource,
        question_no: question ? (question.no || null) : null,
        category: question ? (question.category || '') : '',
        fine_category: question ? (question.fine_category || '') : ''
      },
      shouldCloseTeachingExamMenu: hasTeachingSession,
      renderTarget: hasTeachingSession ? 'teaching-stage' : (hasSelectedQuestion ? 'drawer' : 'none'),
      drawerErrorHtml: '<div class="empty-hint">迁移训练暂时加载失败，但当前题解析不受影响。请回到“解析”页签继续讲题。</div>'
    };
  }

  function buildCompactModeState(currentMode, force) {
    var compactMode = (typeof force === 'boolean') ? force : !currentMode;
    return {
      compactMode: !!compactMode,
      storageValue: compactMode ? '1' : '0',
      buttonText: compactMode ? '⊞' : '⊟',
      buttonTitle: compactMode ? '标准模式' : '紧凑模式：稍稍放大'
    };
  }

  function buildProjectionStartState(values) {
    values = values || {};
    var hasFullscreenElement = !!values.hasFullscreenElement;
    var canRequestFullscreen = !!values.canRequestFullscreen;
    return {
      projectionMode: true,
      teachingFullscreenRequested: hasFullscreenElement || canRequestFullscreen,
      shouldRequestFullscreen: !hasFullscreenElement && canRequestFullscreen,
      shouldBindFullscreenEvents: !hasFullscreenElement && canRequestFullscreen
    };
  }

  function buildProjectionEntryGuard(values) {
    values = values || {};
    var allowed = !!values.practiceActive;
    return {
      allowed: allowed,
      message: allowed ? '' : '请先进入答题/讲题页面再开投影模式。'
    };
  }

  function buildProjectionExitState(values) {
    values = values || {};
    return {
      projectionMode: false,
      teachingFullscreenRequested: false,
      shouldExitFullscreen: !!values.hasFullscreenElement,
      drawerProjectionSize: 'half'
    };
  }

  function buildProjectionFullscreenChangeState(hasFullscreenElement) {
    return {
      projectionMode: !!hasFullscreenElement,
      teachingFullscreenRequested: !!hasFullscreenElement
    };
  }

  function normalizeDrawerProjectionSize(size) {
    if (size === 'mini' || size === 'full') return size;
    return 'half';
  }

  function buildDrawerProjectionSizeState(size) {
    var drawerProjectionSize = normalizeDrawerProjectionSize(size);
    return {
      drawerProjectionSize: drawerProjectionSize,
      className: 'drawer-state-' + drawerProjectionSize
    };
  }

  function normalizeDrawerHeight(value) {
    var height = parseInt(value, 10);
    return height > 0 ? height : null;
  }

  function clampDrawerHeight(height, viewportHeight, minHeight, chromeOffset) {
    height = normalizeDrawerHeight(height);
    if (!height) return null;
    viewportHeight = Number(viewportHeight) || 0;
    minHeight = Number(minHeight) || 200;
    chromeOffset = Number(chromeOffset) || 52;
    var maxHeight = viewportHeight > chromeOffset ? viewportHeight - chromeOffset : minHeight;
    if (maxHeight < minHeight) maxHeight = minHeight;
    if (height < minHeight) return minHeight;
    if (height > maxHeight) return maxHeight;
    return height;
  }

  function buildDrawerHeightState(height, viewportHeight, options) {
    options = options || {};
    var drawerHeight = clampDrawerHeight(
      height,
      viewportHeight,
      options.minHeight,
      options.chromeOffset
    );
    return {
      drawerHeight: drawerHeight,
      styleHeight: drawerHeight ? drawerHeight + 'px' : ''
    };
  }

  function buildDrawerResizeState(startHeight, startY, currentY, viewportHeight, options) {
    var rawHeight = (Number(startHeight) || 0) + ((Number(startY) || 0) - (Number(currentY) || 0));
    return buildDrawerHeightState(rawHeight, viewportHeight, options);
  }

  function normalizeSyncStatus(status) {
    if (status === 'syncing' || status === 'ok' || status === 'error') return status;
    return null;
  }

  function getSyncErrorMessage(error) {
    return (error && error.message) || (error === null || error === undefined ? '' : String(error));
  }

  function buildSyncStatusState(status, message) {
    var normalized = normalizeSyncStatus(status);
    return {
      syncStatus: normalized,
      syncStatusMessage: normalized === 'error' ? (message || '') : ''
    };
  }

  function buildSyncStatusViewModel(status, message) {
    var state = buildSyncStatusState(status, message);
    if (!state.syncStatus) {
      return {
        status: null,
        message: '',
        visible: false,
        display: 'none',
        background: '',
        color: '',
        title: '',
        cursor: '',
        html: '',
        alertMessage: '',
        autoHideMs: 0
      };
    }
    if (state.syncStatus === 'syncing') {
      return {
        status: 'syncing',
        message: '',
        visible: true,
        display: 'inline-flex',
        background: 'var(--accent-bg)',
        color: 'var(--accent)',
        title: '',
        cursor: '',
        html: '<span style="display:inline-block;animation:spin 1s linear infinite;">⟳</span> 同步中…',
        alertMessage: '',
        autoHideMs: 0
      };
    }
    if (state.syncStatus === 'ok') {
      return {
        status: 'ok',
        message: '',
        visible: true,
        display: 'inline-flex',
        background: 'var(--green-bg)',
        color: 'var(--green)',
        title: '',
        cursor: '',
        html: '✓ 已同步',
        alertMessage: '',
        autoHideMs: 2500
      };
    }
    var errorMessage = state.syncStatusMessage || '未知错误';
    return {
      status: 'error',
      message: errorMessage,
      visible: true,
      display: 'inline-flex',
      background: 'var(--red-bg)',
      color: 'var(--red)',
      title: errorMessage || '同步失败',
      cursor: 'pointer',
      html: '⚠ 同步失败',
      alertMessage: '同步失败：' + errorMessage
        + '\n\n你的数据已存在本地，刷新后会重试。如果反复失败，检查网络或 Console。',
      autoHideMs: 0
    };
  }

  function buildSyncBeginState(inflight) {
    var nextInflight = Math.max(0, Number(inflight) || 0) + 1;
    return {
      syncInflight: nextInflight,
      syncStatus: 'syncing',
      syncStatusMessage: '',
      shouldUpdateStatus: true
    };
  }

  function buildSyncEndState(inflight, error) {
    var nextInflight = Math.max(0, (Number(inflight) || 0) - 1);
    var message = getSyncErrorMessage(error);
    return {
      syncInflight: nextInflight,
      syncStatus: nextInflight === 0 ? (message ? 'error' : 'ok') : 'syncing',
      syncStatusMessage: nextInflight === 0 ? message : '',
      shouldUpdateStatus: nextInflight === 0
    };
  }

  function normalizeSyncQueueState(queue) {
    queue = queue || {};
    return {
      pending: !!queue.pending,
      rerunRequested: !!(queue.rerunRequested || queue.queuedAgain)
    };
  }

  function buildSyncQueueRequestState(queue) {
    var current = normalizeSyncQueueState(queue);
    if (current.pending) {
      return {
        queue: {
          pending: true,
          rerunRequested: true
        },
        shouldRun: false
      };
    }
    return {
      queue: {
        pending: true,
        rerunRequested: false
      },
      shouldRun: true
    };
  }

  function buildSyncQueueEndState(queue) {
    var current = normalizeSyncQueueState(queue);
    return {
      queue: {
        pending: false,
        rerunRequested: false
      },
      shouldRunAgain: !!current.rerunRequested
    };
  }

  function getSavedMaterialsSyncQueueKey(kind) {
    return kind === 'prep' || kind === 'lessonPrep' ? 'prepSyncQueue' : 'errorSyncQueue';
  }

  function getCloudUserKey(cloudState) {
    cloudState = cloudState || {};
    var user = cloudState.user || null;
    if (!user) return '';
    return (user.id || '') + '|' + (cloudState.viewingUserId || '');
  }

  function normalizeCloudLifecycleState(values) {
    values = values || {};
    return {
      cloudLastUserKey: values.cloudLastUserKey || '',
      cloudMigrationPromptShown: !!values.cloudMigrationPromptShown,
      cloudAdminParamChecked: !!values.cloudAdminParamChecked,
      cloudLoggingOut: !!values.cloudLoggingOut
    };
  }

  function buildCloudLifecycleState(current, patchValues) {
    var next = normalizeCloudLifecycleState(current);
    patchValues = patchValues || {};
    if (Object.prototype.hasOwnProperty.call(patchValues, 'cloudLastUserKey')) {
      next.cloudLastUserKey = patchValues.cloudLastUserKey || '';
    }
    if (Object.prototype.hasOwnProperty.call(patchValues, 'cloudMigrationPromptShown')) {
      next.cloudMigrationPromptShown = !!patchValues.cloudMigrationPromptShown;
    }
    if (Object.prototype.hasOwnProperty.call(patchValues, 'cloudAdminParamChecked')) {
      next.cloudAdminParamChecked = !!patchValues.cloudAdminParamChecked;
    }
    if (Object.prototype.hasOwnProperty.call(patchValues, 'cloudLoggingOut')) {
      next.cloudLoggingOut = !!patchValues.cloudLoggingOut;
    }
    return next;
  }

  function buildCloudArrivalState(values, cloudState) {
    values = normalizeCloudLifecycleState(values);
    cloudState = cloudState || {};
    var userKey = getCloudUserKey(cloudState);
    var hasUser = !!cloudState.user;
    var firstAuthForThisUser = !!(hasUser && userKey !== (values.cloudLastUserKey || ''));
    return {
      cloudLastUserKey: firstAuthForThisUser ? userKey : (values.cloudLastUserKey || ''),
      firstAuthForThisUser: firstAuthForThisUser,
      hasUser: hasUser,
      isViewingUser: !!cloudState.viewingUserId
    };
  }

  function buildCloudAdminEntryState(values) {
    values = values || {};
    var lifecycleState = normalizeCloudLifecycleState(values);
    var shouldOpenAdmin = !!(
      values.firstAuthForThisUser
      && !values.viewingUserId
      && !lifecycleState.cloudAdminParamChecked
      && values.isAdmin
      && values.hasAdminParam
    );
    return {
      cloudAdminParamChecked: shouldOpenAdmin ? true : lifecycleState.cloudAdminParamChecked,
      shouldOpenAdmin: shouldOpenAdmin
    };
  }

  function buildLocalCloudMigrationPromptState(values) {
    values = values || {};
    var lifecycleState = normalizeCloudLifecycleState(values);
    var localErrorCount = Number(values.localErrorCount) || 0;
    var localPrepCount = Number(values.localPrepCount) || 0;
    var cloudErrorCount = Number(values.cloudErrorCount) || 0;
    var cloudPrepCount = Number(values.cloudPrepCount) || 0;
    var shouldPrompt = !!(
      !values.viewingUserId
      && !lifecycleState.cloudMigrationPromptShown
      && cloudErrorCount === 0
      && cloudPrepCount === 0
      && (localErrorCount > 0 || localPrepCount > 0)
    );
    return {
      cloudMigrationPromptShown: shouldPrompt ? true : lifecycleState.cloudMigrationPromptShown,
      shouldPrompt: shouldPrompt,
      localErrorCount: localErrorCount,
      localPrepCount: localPrepCount
    };
  }

  function clearCloudLifecycleState() {
    return normalizeCloudLifecycleState();
  }

  function canWriteCloudLearningData(cloudState) {
    cloudState = cloudState || {};
    return !!(cloudState.user && !cloudState.viewingUserId);
  }

  function buildSavedMaterialsSaveCloudPlan(kind, cloudState) {
    var normalizedKind = (kind === 'prep' || kind === 'lessonPrep') ? 'prep' : 'error';
    var canWrite = canWriteCloudLearningData(cloudState);
    return {
      kind: normalizedKind,
      syncQueueKey: getSavedMaterialsSyncQueueKey(normalizedKind),
      shouldSyncCloud: canWrite,
      syncTarget: canWrite ? normalizedKind : '',
      blockedByViewAs: !!(cloudState && cloudState.user && cloudState.viewingUserId),
      blockedByMissingUser: !(cloudState && cloudState.user)
    };
  }

  function buildCloudLoggingOutState(loggingOut) {
    return {
      cloudLoggingOut: !!loggingOut
    };
  }

  function normalizeTeachingReturnStack(stack) {
    stack = Array.isArray(stack) ? stack : [];
    return stack.slice();
  }

  function getTeachingReturnContext(stack) {
    stack = normalizeTeachingReturnStack(stack);
    return stack.length ? stack[stack.length - 1] : null;
  }

  function getTeachingReturnLabel(returnContext) {
    if (!returnContext) return '';
    if (returnContext.type === 'unit-question-list') return '返回教材';
    return '返回原题';
  }

  function buildTeachingReturnDockState(stack) {
    var state = buildTeachingReturnStackState(stack);
    var returnContext = state.returnContext;
    return {
      returnContext: returnContext,
      returnLabel: getTeachingReturnLabel(returnContext),
      hasReturn: !!returnContext
    };
  }

  function buildTeachingDockModel(session, questions, stack, deps) {
    deps = deps || {};
    questions = Array.isArray(questions) ? questions : [];
    var normalizeTab = deps.normalizeTab || function(tab) { return tab || 'guide'; };
    if (!session) {
      return {
        visible: false,
        currentIndex: -1,
        questionButtons: [],
        tabButtons: [],
        returnButton: null,
        exitButton: { label: '退出' }
      };
    }
    var idx = clampQuestionIndex(session.idx, questions.length);
    var activeTab = normalizeTab(session.tab || 'guide');
    var returnState = buildTeachingReturnDockState(stack);
    return {
      visible: true,
      currentIndex: idx,
      navButtons: [
        { action: 'prev', label: '‹', title: '上一题', delta: -1 },
        { action: 'next', label: '›', title: '下一题', delta: 1 }
      ],
      questionButtons: questions.map(function(q, i) {
        return {
          index: i,
          no: q && q.no ? q.no : '',
          title: '第' + (q && q.no ? q.no : '') + '题',
          active: i === idx
        };
      }),
      tabButtons: [
        { key: 'guide', label: '讲题', active: activeTab === 'guide' },
        { key: 'migration', label: '迁移', active: activeTab === 'migration' }
      ],
      returnButton: returnState.hasReturn
        ? { label: returnState.returnLabel, context: returnState.returnContext }
        : null,
      exitButton: { label: '退出' }
    };
  }

  function buildTeachingStageOpenPlan(questions, idx, options, previousSession, deps) {
    options = options || {};
    deps = deps || {};
    var selectedState = buildSelectedQuestionState(questions, idx);
    var selectedIndex = selectedState.selectedQuestionIndex;
    var q = selectedState.selectedQuestion || null;
    if (selectedIndex < 0 || !q) {
      return {
        action: 'none',
        active: false,
        selectedState: selectedState,
        question: null,
        sessionState: { teachingSession: previousSession || null },
        shouldCaptureBaseContext: false,
        baseContextValues: null,
        shouldCloseAnalysisFloat: false,
        shouldAddTeachingMode: false,
        shouldOpenStage: false,
        shouldRequestFullscreen: false,
        shouldCloseDrawer: false,
        shouldRenderTeachingStage: false,
        usageEvent: null
      };
    }
    var session = createTeachingSession(selectedIndex, options, previousSession, deps);
    return {
      action: 'open-teaching-stage',
      active: true,
      selectedState: selectedState,
      question: q,
      sessionState: { teachingSession: session },
      shouldCaptureBaseContext: !previousSession,
      baseContextValues: {
        idx: selectedIndex,
        selectedQuestion: q
      },
      shouldCloseAnalysisFloat: true,
      shouldAddTeachingMode: true,
      shouldOpenStage: true,
      shouldRequestFullscreen: options.fullscreen !== false,
      shouldCloseDrawer: true,
      shouldRenderTeachingStage: true,
      usageEvent: {
        type: 'teaching_stage_opened',
        module: 'teaching-stage',
        payload: {
          source: session.source,
          tab: session.tab,
          question_no: q.no || null,
          category: q.category || '',
          fine_category: q.fine_category || ''
        }
      }
    };
  }

  function buildTeachingQuestionJumpPlan(session, questions, deltaOrIdx, isDelta) {
    questions = Array.isArray(questions) ? questions : [];
    if (!session || questions.length === 0) {
      return {
        action: 'none',
        active: false,
        targetIndex: -1,
        shouldCloseTeachingExamMenu: false,
        shouldCloseAnalysisFloat: false,
        teachingOptions: null
      };
    }
    var targetIndex = getWrappedQuestionIndex(deltaOrIdx, isDelta, session.idx, questions.length);
    if (targetIndex < 0) {
      return {
        action: 'none',
        active: false,
        targetIndex: -1,
        shouldCloseTeachingExamMenu: true,
        shouldCloseAnalysisFloat: true,
        teachingOptions: null
      };
    }
    return {
      action: 'jump-teaching-question',
      active: true,
      targetIndex: targetIndex,
      shouldCloseTeachingExamMenu: true,
      shouldCloseAnalysisFloat: true,
      teachingOptions: {
        tab: session.tab || 'guide',
        showAnswer: !!session.showAnswer,
        source: session.source || 'practice'
      }
    };
  }

  function buildTeachingBlankRevealPlan(isCurrentlyRevealed, answer, blankLabel) {
    var revealed = !isCurrentlyRevealed;
    return {
      action: 'toggle-teaching-blank',
      active: true,
      revealed: revealed,
      text: revealed ? String(answer || '') : String(blankLabel || '___ ___'),
      showAnswer: revealed
    };
  }

  function buildTeachingReturnStackState(stack) {
    var nextStack = normalizeTeachingReturnStack(stack);
    var returnContext = getTeachingReturnContext(nextStack);
    return {
      teachingReturnStack: nextStack,
      returnContext: returnContext,
      hasReturn: !!returnContext
    };
  }

  function buildTeachingReturnStackSnapshotState(stack) {
    return buildTeachingReturnStackState(stack);
  }

  function pushTeachingReturnContext(stack, context) {
    var nextStack = normalizeTeachingReturnStack(stack);
    if (context) nextStack.push(context);
    return buildTeachingReturnStackState(nextStack);
  }

  function popTeachingReturnContext(stack) {
    var nextStack = normalizeTeachingReturnStack(stack);
    var returnContext = nextStack.length ? nextStack.pop() : null;
    return {
      teachingReturnStack: nextStack,
      returnContext: returnContext,
      hasReturn: !!getTeachingReturnContext(nextStack)
    };
  }

  function clearTeachingReturnStack() {
    return buildTeachingReturnStackState([]);
  }

  function buildTeachingReturnAction(returnContext) {
    if (!returnContext) {
      return {
        action: 'none',
        returnContext: null,
        shouldRestoreTeachingContext: false,
        shouldSetDrawerReturn: false,
        shouldExecuteDrawerReturn: false,
        teardownOptions: null,
        targetIndex: -1,
        tab: 'guide',
        showAnswer: false,
        source: ''
      };
    }
    if (returnContext.type === 'unit-question-list') {
      return {
        action: 'drawer-return',
        returnContext: returnContext,
        shouldRestoreTeachingContext: false,
        shouldSetDrawerReturn: true,
        shouldExecuteDrawerReturn: true,
        teardownOptions: { skipRestore: true },
        targetIndex: -1,
        tab: 'guide',
        showAnswer: false,
        source: ''
      };
    }
    return {
      action: 'teaching-context',
      returnContext: returnContext,
      shouldRestoreTeachingContext: true,
      shouldSetDrawerReturn: false,
      shouldExecuteDrawerReturn: false,
      teardownOptions: null,
      targetIndex: typeof returnContext.idx === 'number' ? returnContext.idx : 0,
      tab: returnContext.tab || 'guide',
      showAnswer: !!returnContext.showAnswer,
      source: 'return'
    };
  }

  function buildTeachingBaseContextState(context, values) {
    values = values || {};
    if (!context) return { teachingBaseContext: null };
    var nextContext = {};
    Object.keys(context).forEach(function(key) {
      nextContext[key] = context[key];
    });
    if (typeof values.idx === 'number') nextContext.idx = values.idx;
    if (Object.prototype.hasOwnProperty.call(values, 'selectedQuestion')) {
      nextContext.selectedQuestion = values.selectedQuestion || null;
    }
    return {
      teachingBaseContext: nextContext
    };
  }

  function buildTeachingBaseContextSnapshotState(context) {
    return {
      teachingBaseContext: context || null
    };
  }

  function clearTeachingBaseContextState() {
    return {
      teachingBaseContext: null
    };
  }

  function normalizeTeachingMigrationRegistry(registry) {
    var next = {};
    registry = registry && typeof registry === 'object' ? registry : {};
    Object.keys(registry).forEach(function(key) {
      next[key] = registry[key];
    });
    return next;
  }

  function clearTeachingMigrationRegistryState(counter) {
    return {
      teachingMigrationRegistry: {},
      teachingMigrationCounter: Number(counter) || 0
    };
  }

  function registerTeachingMigrationItemState(registry, counter, item) {
    var nextCounter = (Number(counter) || 0) + 1;
    var id = 'tm_' + nextCounter;
    var nextRegistry = normalizeTeachingMigrationRegistry(registry);
    nextRegistry[id] = item;
    return {
      id: id,
      teachingMigrationRegistry: nextRegistry,
      teachingMigrationCounter: nextCounter
    };
  }

  function getTeachingMigrationRegistryItem(registry, id) {
    registry = registry && typeof registry === 'object' ? registry : {};
    return registry[id] || null;
  }

  function shouldRestoreTeachingBaseContext(values, deps) {
    values = values || {};
    deps = deps || {};
    if (values.skipRestore) return false;
    var context = values.teachingBaseContext || null;
    if (!context || !context.currentExam) return false;
    var compare = deps.isSameTeachingExamContext || function(a, b) { return a === b; };
    return !compare(values.currentExam || null, context.currentExam);
  }

  function buildTeachingStageTeardownPlan(values, deps) {
    values = values || {};
    var session = values.teachingSession || null;
    var currentQuestionIndex = typeof values.currentQuestionIndex === 'number' ? values.currentQuestionIndex : -1;
    var initialIndex = session && typeof session.idx === 'number' ? session.idx : currentQuestionIndex;
    var baseContext = values.teachingBaseContext || null;
    var shouldRestoreBase = shouldRestoreTeachingBaseContext({
      skipRestore: !!values.skipRestore,
      currentExam: values.currentExam || null,
      teachingBaseContext: baseContext
    }, deps);
    var restoreIndex = baseContext && typeof baseContext.idx === 'number' ? baseContext.idx : 0;
    var selectedIndex = shouldRestoreBase ? restoreIndex : initialIndex;
    return {
      shouldRestoreBase: shouldRestoreBase,
      restoreContext: shouldRestoreBase ? baseContext : null,
      initialIndex: initialIndex,
      selectedIndex: selectedIndex,
      shouldSelectQuestion: selectedIndex >= 0
    };
  }

  function createTeachingSession(idx, options, previousSession, deps) {
    options = options || {};
    previousSession = previousSession || null;
    deps = deps || {};
    var normalizeTab = deps.normalizeTab || function(tab) { return tab || 'guide'; };
    var prevTab = previousSession && previousSession.tab;
    var prevAnswer = previousSession && previousSession.showAnswer;
    return {
      source: options.source || (previousSession && previousSession.source) || 'practice',
      idx: idx,
      tab: normalizeTab(options.tab || prevTab || 'guide'),
      showAnswer: typeof options.showAnswer === 'boolean' ? options.showAnswer : !!prevAnswer
    };
  }

  function buildTeachingSessionState(session) {
    if (!session) return { teachingSession: null };
    return {
      teachingSession: {
        source: session.source || 'practice',
        idx: typeof session.idx === 'number' ? session.idx : 0,
        tab: session.tab || 'guide',
        showAnswer: !!session.showAnswer
      }
    };
  }

  function buildTeachingTabState(session, tab, deps) {
    if (!session) return { teachingSession: null };
    deps = deps || {};
    var normalizeTab = deps.normalizeTab || function(value) { return value || 'guide'; };
    return {
      teachingSession: {
        source: session.source || 'practice',
        idx: typeof session.idx === 'number' ? session.idx : 0,
        tab: normalizeTab(tab || session.tab || 'guide'),
        showAnswer: !!session.showAnswer
      }
    };
  }

  function buildTeachingAnswerState(session, forceShowAnswer) {
    if (!session) return { teachingSession: null };
    return {
      teachingSession: {
        source: session.source || 'practice',
        idx: typeof session.idx === 'number' ? session.idx : 0,
        tab: session.tab || 'guide',
        showAnswer: typeof forceShowAnswer === 'boolean' ? forceShowAnswer : !session.showAnswer
      }
    };
  }

  function clearTeachingSessionState() {
    return {
      teachingSession: null
    };
  }

  function resetPracticeDisplayState() {
    return {
      showAnswers: false,
      showChinese: false
    };
  }

  function buildPracticeDisplayState(values) {
    values = values || {};
    return {
      showAnswers: !!values.showAnswers,
      showChinese: !!values.showChinese
    };
  }

  function togglePracticeAnswers(values) {
    values = buildPracticeDisplayState(values);
    return {
      showAnswers: !values.showAnswers,
      showChinese: false
    };
  }

  function togglePracticeChinese(values) {
    values = buildPracticeDisplayState(values);
    var nextChinese = !values.showChinese;
    return {
      showAnswers: nextChinese ? false : !!values.showAnswers,
      showChinese: nextChinese
    };
  }

  function clampFontSize(value) {
    value = Number(value) || 24;
    if (value < 12) return 12;
    if (value > 48) return 48;
    return value;
  }

  function adjustFontSize(currentSize, delta) {
    return clampFontSize((Number(currentSize) || 24) + (Number(delta) || 0));
  }

  function buildFontScaleState(values, target, delta) {
    values = values || {};
    var next = {
      passageFontSize: clampFontSize(values.passageFontSize),
      drawerFontSize: clampFontSize(values.drawerFontSize)
    };
    if (target === 'drawer') {
      next.drawerFontSize = adjustFontSize(next.drawerFontSize, delta);
    } else {
      next.passageFontSize = adjustFontSize(next.passageFontSize, delta);
    }
    return next;
  }

  function buildFontScaleSnapshotState(values) {
    return buildFontScaleState(values, 'snapshot', 0);
  }

  function buildFontCssVarMap(values, target) {
    values = values || {};
    var passage = clampFontSize(values.passageFontSize);
    var drawer = clampFontSize(values.drawerFontSize);
    var scope = target === 'passage' || target === 'drawer' ? target : 'all';
    var vars = {};
    if (scope === 'all' || scope === 'passage') {
      vars['--passage-font-size'] = passage + 'px';
      vars['--font-base'] = passage + 'px';
      vars['--font-lg'] = (passage + 1) + 'px';
      vars['--font-sm'] = (passage - 3) + 'px';
      vars['--k-font-lg'] = Math.round(passage * 0.92) + 'px';
      vars['--k-font-base'] = Math.round(passage * 0.67) + 'px';
      vars['--k-font-sm'] = Math.round(passage * 0.54) + 'px';
    }
    if (scope === 'all' || scope === 'drawer') {
      vars['--drawer-font-size'] = drawer + 'px';
      vars['--drawer-font-size-lg'] = (drawer + 1) + 'px';
      vars['--drawer-font-size-sm'] = (drawer - 1) + 'px';
    }
    return vars;
  }

  function buildFontScaleViewModel(values, target) {
    values = values || {};
    var passage = clampFontSize(values.passageFontSize);
    var drawer = clampFontSize(values.drawerFontSize);
    return {
      passageFontSize: passage,
      drawerFontSize: drawer,
      passageDisplayText: passage + 'px',
      drawerDisplayText: drawer + 'px',
      cssVars: buildFontCssVarMap({
        passageFontSize: passage,
        drawerFontSize: drawer
      }, target)
    };
  }

  window.GrammarAppState = {
    state: state,
    get: get,
    set: set,
    patch: patch,
    createTeachingContextSnapshot: createTeachingContextSnapshot,
    isSameTeachingExamContext: isSameTeachingExamContext,
    clampQuestionIndex: clampQuestionIndex,
    getWrappedQuestionIndex: getWrappedQuestionIndex,
    getCurrentQuestionIndex: getCurrentQuestionIndex,
    findSelectedQuestionIndex: findSelectedQuestionIndex,
    buildSelectedQuestionState: buildSelectedQuestionState,
    buildSelectedQuestionSnapshotState: buildSelectedQuestionSnapshotState,
    buildSelectedQuestionFromContext: buildSelectedQuestionFromContext,
    clearSelectedQuestionState: clearSelectedQuestionState,
    buildPracticeContextState: buildPracticeContextState,
    buildPracticeContextSnapshotState: buildPracticeContextSnapshotState,
    clearPracticeContextState: clearPracticeContextState,
    normalizePreviousView: normalizePreviousView,
    buildPreviousViewState: buildPreviousViewState,
    getPracticeEntryPreviousView: getPracticeEntryPreviousView,
    normalizePageKey: normalizePageKey,
    isProtectedPage: isProtectedPage,
    buildPageAuthGuard: buildPageAuthGuard,
    buildPageShellState: buildPageShellState,
    normalizeDockKey: normalizeDockKey,
    getDockKeyForPage: getDockKeyForPage,
    buildActivePageState: buildActivePageState,
    buildDockActivationState: buildDockActivationState,
    buildPageRenderPlan: buildPageRenderPlan,
    buildPageSwitchPlan: buildPageSwitchPlan,
    buildModuleEntryPlan: buildModuleEntryPlan,
    buildGoHomePlan: buildGoHomePlan,
    buildTeachingPageSwitchRetentionState: buildTeachingPageSwitchRetentionState,
    buildTeachingPageSwitchRetentionSnapshotState: buildTeachingPageSwitchRetentionSnapshotState,
    shouldCloseTeachingOnPageSwitch: shouldCloseTeachingOnPageSwitch,
    getBlankNavigationIndex: getBlankNavigationIndex,
    getPreviousViewLabel: getPreviousViewLabel,
    normalizeHomeView: normalizeHomeView,
    getHomeDockKey: getHomeDockKey,
    buildHomeViewState: buildHomeViewState,
    normalizeKnowledgeView: normalizeKnowledgeView,
    buildKnowledgeViewState: buildKnowledgeViewState,
    normalizeKnowledgeSearchIndex: normalizeKnowledgeSearchIndex,
    buildKnowledgeSearchIndexState: buildKnowledgeSearchIndexState,
    normalizeUnitMiniSource: normalizeUnitMiniSource,
    normalizeUnitMiniFilter: normalizeUnitMiniFilter,
    normalizeUnitMiniContext: normalizeUnitMiniContext,
    buildUnitMiniContextState: buildUnitMiniContextState,
    buildUnitMiniFilterState: buildUnitMiniFilterState,
    clearUnitMiniContextState: clearUnitMiniContextState,
    normalizeGlobalGraphState: normalizeGlobalGraphState,
    buildGlobalGraphState: buildGlobalGraphState,
    buildGlobalGraphPanState: buildGlobalGraphPanState,
    buildGlobalGraphZoomState: buildGlobalGraphZoomState,
    buildGlobalGraphFitBoundsState: buildGlobalGraphFitBoundsState,
    buildGlobalGraphCenterNodeState: buildGlobalGraphCenterNodeState,
    buildGlobalGraphFocusState: buildGlobalGraphFocusState,
    normalizeTextbookViewMode: normalizeTextbookViewMode,
    buildTextbookViewModeState: buildTextbookViewModeState,
    getDockBackLabel: getDockBackLabel,
    getDockBackAction: getDockBackAction,
    buildPreviousViewReturn: buildPreviousViewReturn,
    buildDrawerReturnState: buildDrawerReturnState,
    consumeDrawerReturn: consumeDrawerReturn,
    buildDrawerClosePlan: buildDrawerClosePlan,
    normalizeDrawerTab: normalizeDrawerTab,
    buildDrawerTabSwitchPlan: buildDrawerTabSwitchPlan,
    normalizeMigrationSource: normalizeMigrationSource,
    buildMigrationSourceState: buildMigrationSourceState,
    buildMigrationSourceChangePlan: buildMigrationSourceChangePlan,
    buildCompactModeState: buildCompactModeState,
    buildProjectionStartState: buildProjectionStartState,
    buildProjectionEntryGuard: buildProjectionEntryGuard,
    buildProjectionExitState: buildProjectionExitState,
    buildProjectionFullscreenChangeState: buildProjectionFullscreenChangeState,
    normalizeDrawerProjectionSize: normalizeDrawerProjectionSize,
    buildDrawerProjectionSizeState: buildDrawerProjectionSizeState,
    normalizeDrawerHeight: normalizeDrawerHeight,
    clampDrawerHeight: clampDrawerHeight,
    buildDrawerHeightState: buildDrawerHeightState,
    buildDrawerResizeState: buildDrawerResizeState,
    normalizeSyncStatus: normalizeSyncStatus,
    buildSyncStatusState: buildSyncStatusState,
    buildSyncStatusViewModel: buildSyncStatusViewModel,
    buildSyncBeginState: buildSyncBeginState,
    buildSyncEndState: buildSyncEndState,
    normalizeSyncQueueState: normalizeSyncQueueState,
    buildSyncQueueRequestState: buildSyncQueueRequestState,
    buildSyncQueueEndState: buildSyncQueueEndState,
    getSavedMaterialsSyncQueueKey: getSavedMaterialsSyncQueueKey,
    getCloudUserKey: getCloudUserKey,
    normalizeCloudLifecycleState: normalizeCloudLifecycleState,
    buildCloudLifecycleState: buildCloudLifecycleState,
    buildCloudArrivalState: buildCloudArrivalState,
    buildCloudAdminEntryState: buildCloudAdminEntryState,
    buildLocalCloudMigrationPromptState: buildLocalCloudMigrationPromptState,
    clearCloudLifecycleState: clearCloudLifecycleState,
    canWriteCloudLearningData: canWriteCloudLearningData,
    buildSavedMaterialsSaveCloudPlan: buildSavedMaterialsSaveCloudPlan,
    buildCloudLoggingOutState: buildCloudLoggingOutState,
    getTeachingReturnContext: getTeachingReturnContext,
    getTeachingReturnLabel: getTeachingReturnLabel,
    buildTeachingReturnDockState: buildTeachingReturnDockState,
    buildTeachingDockModel: buildTeachingDockModel,
    buildTeachingStageOpenPlan: buildTeachingStageOpenPlan,
    buildTeachingQuestionJumpPlan: buildTeachingQuestionJumpPlan,
    buildTeachingBlankRevealPlan: buildTeachingBlankRevealPlan,
    normalizeTeachingReturnStack: normalizeTeachingReturnStack,
    buildTeachingReturnStackState: buildTeachingReturnStackState,
    buildTeachingReturnStackSnapshotState: buildTeachingReturnStackSnapshotState,
    pushTeachingReturnContext: pushTeachingReturnContext,
    popTeachingReturnContext: popTeachingReturnContext,
    clearTeachingReturnStack: clearTeachingReturnStack,
    buildTeachingReturnAction: buildTeachingReturnAction,
    buildTeachingBaseContextState: buildTeachingBaseContextState,
    buildTeachingBaseContextSnapshotState: buildTeachingBaseContextSnapshotState,
    clearTeachingBaseContextState: clearTeachingBaseContextState,
    normalizeTeachingMigrationRegistry: normalizeTeachingMigrationRegistry,
    clearTeachingMigrationRegistryState: clearTeachingMigrationRegistryState,
    registerTeachingMigrationItemState: registerTeachingMigrationItemState,
    getTeachingMigrationRegistryItem: getTeachingMigrationRegistryItem,
    shouldRestoreTeachingBaseContext: shouldRestoreTeachingBaseContext,
    buildTeachingStageTeardownPlan: buildTeachingStageTeardownPlan,
    createTeachingSession: createTeachingSession,
    buildTeachingSessionState: buildTeachingSessionState,
    buildTeachingTabState: buildTeachingTabState,
    buildTeachingAnswerState: buildTeachingAnswerState,
    clearTeachingSessionState: clearTeachingSessionState,
    resetPracticeDisplayState: resetPracticeDisplayState,
    buildPracticeDisplayState: buildPracticeDisplayState,
    togglePracticeAnswers: togglePracticeAnswers,
    togglePracticeChinese: togglePracticeChinese,
    clampFontSize: clampFontSize,
    adjustFontSize: adjustFontSize,
    buildFontScaleState: buildFontScaleState,
    buildFontScaleSnapshotState: buildFontScaleSnapshotState,
    buildFontCssVarMap: buildFontCssVarMap,
    buildFontScaleViewModel: buildFontScaleViewModel
  };
})();
