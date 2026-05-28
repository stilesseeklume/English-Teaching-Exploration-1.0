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
    passageFontSize: 24,
    drawerFontSize: 24,
    showAnswers: false,
    showChinese: false,
    previousView: null,
    currentHomeView: 'cards',
    currentKnowledgeView: 'map',
    currentKnowledgeKey: '',
    currentKnowledgeNodeId: '',
    currentIsPattern: false
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

  function getPreviousViewLabel(previousView) {
    if (!previousView) return '返回主页';
    if (previousView.page === 'home') {
      if (previousView.view === 'exams') return '返回套卷列表';
      if (previousView.view === 'categories') return '返回考点列表';
      return '返回主页';
    }
    if (previousView.page === 'error-book') return '返回错题本';
    if (previousView.page === 'lesson-prep') return '返回备课资料';
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

  function getDockBackLabel(values) {
    values = values || {};
    if (values.drawerReturnTo) return values.drawerReturnTo.label || '返回上一步';
    if (values.activePage === 'home' && values.currentHomeView !== 'cards') return '返回主页';
    if (values.activePage === 'practice') return getPreviousViewLabel(values.previousView);
    if (values.activePage === 'knowledge' && values.currentKnowledgeView === 'map-node') return '返回知识地图';
    if (values.activePage === 'knowledge' && values.currentKnowledgeView === 'system-node') return '返回全局图谱';
    return '';
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

  function resetPracticeDisplayState() {
    return {
      showAnswers: false,
      showChinese: false
    };
  }

  function togglePracticeAnswers(values) {
    values = values || {};
    return {
      showAnswers: !values.showAnswers,
      showChinese: false
    };
  }

  function togglePracticeChinese(values) {
    values = values || {};
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
    getPreviousViewLabel: getPreviousViewLabel,
    normalizeHomeView: normalizeHomeView,
    getHomeDockKey: getHomeDockKey,
    buildHomeViewState: buildHomeViewState,
    normalizeKnowledgeView: normalizeKnowledgeView,
    buildKnowledgeViewState: buildKnowledgeViewState,
    getDockBackLabel: getDockBackLabel,
    createTeachingSession: createTeachingSession,
    resetPracticeDisplayState: resetPracticeDisplayState,
    togglePracticeAnswers: togglePracticeAnswers,
    togglePracticeChinese: togglePracticeChinese,
    clampFontSize: clampFontSize,
    adjustFontSize: adjustFontSize,
    buildFontScaleState: buildFontScaleState
  };
})();
