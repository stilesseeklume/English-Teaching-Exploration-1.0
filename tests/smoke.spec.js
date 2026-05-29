import { expect, test } from '@playwright/test';

const SUPABASE_STUB = `
  (function(){
    function ok(data) { return Promise.resolve({ data: data || null, error: null }); }
    window.__supabaseInserts = window.__supabaseInserts || [];
    window.__supabaseRows = window.__supabaseRows || {};
    window.__supabaseAuthListeners = window.__supabaseAuthListeners || [];
    window.__downloads = window.__downloads || [];
    URL.createObjectURL = function(blob) {
      window.__lastDownloadBlob = blob;
      return 'blob:smoke-download';
    };
    URL.revokeObjectURL = function(){};
    HTMLAnchorElement.prototype.click = function() {
      window.__downloads.push({ href: this.href, download: this.download });
    };
    function authUser(email, username, id) {
      return {
        id: id || 'smoke-login-user',
        email: email || 'smoke.teacher@example.com',
        user_metadata: { username: username || 'login-teacher' }
      };
    }
    function notifyAuth(event, user) {
      var session = user ? { user: user } : null;
      window.__supabaseAuthListeners.forEach(function(cb) {
        try { cb(event, session); } catch(e) {}
      });
    }
    function createQuery(tableName) {
      var filters = {};
      var pendingUpdate = null;
      var pendingDelete = false;
      function tableRows() {
        var rows = window.__supabaseRows[tableName] || [];
        if (filters.user_id && window.__supabaseRowsByUser && window.__supabaseRowsByUser[filters.user_id]) {
          rows = window.__supabaseRowsByUser[filters.user_id][tableName] || [];
        }
        return rows;
      }
      var query = {
        select: function(){ return query; },
        eq: function(column, value){ filters[column] = value; return query; },
        order: function(){ return query; },
        limit: function(){ return ok(tableRows()); },
        upsert: function(row){
          window.__supabaseInserts.push({ table: tableName, rows: row, operation: 'upsert' });
          return ok(null);
        },
        update: function(row){ pendingUpdate = row; return query; },
        delete: function(){ pendingDelete = true; return query; },
        insert: function(rows){
          window.__supabaseInserts.push({ table: tableName, rows: rows });
          return { select: function(){ return { single: function(){ return ok({ id: 'mock-id' }); } }; } };
        },
        single: function(){ return ok({ id: 'mock-id' }); }
      };
      query.then = function(resolve, reject){
        if (pendingDelete) {
          window.__supabaseDeletes = window.__supabaseDeletes || [];
          window.__supabaseDeletes.push({ table: tableName, filters: Object.assign({}, filters) });
          var rows = window.__supabaseRows[tableName] || [];
          window.__supabaseRows[tableName] = rows.filter(function(row) {
            return Object.keys(filters).some(function(column) {
              return row[column] !== filters[column];
            });
          });
          pendingDelete = false;
          return ok(null).then(resolve, reject);
        }
        return ok(tableRows()).then(resolve, reject);
      };
      var originalEq = query.eq;
      query.eq = function(column, value){
        originalEq(column, value);
        if (pendingUpdate) {
          window.__supabaseUpdates = window.__supabaseUpdates || [];
          window.__supabaseUpdates.push({ table: tableName, rows: pendingUpdate, filters: Object.assign({}, filters) });
          var rows = window.__supabaseRows[tableName] || [];
          rows.forEach(function(row) {
            if (row[column] === value) Object.assign(row, pendingUpdate);
          });
          pendingUpdate = null;
          return ok(null);
        }
        return query;
      };
      return query;
    }
    window.supabase = {
      createClient: function(){
        return {
          auth: {
            getSession: function(){
              var user = window.__mockSupabaseUser || null;
              return ok({ session: user ? { user: user } : null });
            },
            onAuthStateChange: function(cb){
              window.__supabaseAuthListeners.push(cb);
              return { data: { subscription: { unsubscribe: function(){} } } };
            },
            signUp: function(payload){
              var user = authUser(payload.email, payload.options && payload.options.data && payload.options.data.username, 'smoke-signup-user');
              window.__mockSupabaseUser = user;
              setTimeout(function(){ notifyAuth('SIGNED_IN', user); }, 0);
              return ok({ user: user, session: { user: user } });
            },
            signInWithPassword: function(payload){
              var user = authUser(payload.email, 'login-teacher', 'smoke-login-user');
              window.__mockSupabaseUser = user;
              setTimeout(function(){ notifyAuth('SIGNED_IN', user); }, 0);
              return ok({ user: user, session: { user: user } });
            },
            updateUser: function(){ return ok(null); },
            signOut: function(){
              window.__mockSupabaseUser = null;
              setTimeout(function(){ notifyAuth('SIGNED_OUT', null); }, 0);
              return ok(null);
            },
            refreshSession: function(){ return ok(null); }
          },
          rpc: function(name, args){
            if (name === 'username_taken') return ok(false);
            if (name === 'get_email_by_username') return ok((args && args.uname ? args.uname : 'login-teacher') + '@example.com');
            if (name === 'admin_list_users') {
              return window.__mockIsAdmin
                ? ok(window.__mockAdminUsers || [])
                : Promise.resolve({ data: null, error: { message: 'not admin' } });
            }
            if (name === 'admin_approve_user' || name === 'admin_reject_user'
              || name === 'admin_approve_username_change' || name === 'admin_reject_username_change') return ok(null);
            return ok(null);
          },
          from: function(tableName){ return createQuery(tableName); }
        };
      }
    };
  })();
`;

const MAMMOTH_STUB = `
  window.mammoth = {
    convertToHtml: function(){ return Promise.resolve({ value: '', messages: [] }); },
    extractRawText: function(){
      return Promise.resolve({ value: window.__mockDocxRawText || '', messages: [] });
    }
  };
`;

async function installBrowserStubs(page) {
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = function() { return Promise.resolve(); };
    document.exitFullscreen = function() { return Promise.resolve(); };
  });
  await page.route('**/npm/@supabase/supabase-js@2', route => {
    route.fulfill({ contentType: 'application/javascript', body: SUPABASE_STUB });
  });
  await page.route('**/npm/mammoth@1.8.0/mammoth.browser.min.js', route => {
    route.fulfill({ contentType: 'application/javascript', body: MAMMOTH_STUB });
  });
}

function collectFatalBrowserErrors(page) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

test.beforeEach(async ({ page }) => {
  await installBrowserStubs(page);
});

async function mockSignedInTeacher(page) {
  await page.addInitScript(() => {
    window.__mockSupabaseUser = {
      id: 'smoke-user-1',
      email: 'smoke.teacher@example.com',
      user_metadata: { username: 'smoke-teacher' }
    };
    window.__supabaseRows = {
      error_book: [{
        user_id: 'smoke-user-1',
        client_id: 'err_smoke_1',
        question: {
          no: 1,
          passage: 'The teacher ___1___(prepare) a lesson before class.',
          answer: 'prepared',
          category: 'predicate',
          category_name: '谓语动词',
          fine_category: 'pred-tense-past-future',
          analysis: '根据 before class 的过去语境，谓语动词用一般过去时 prepared。',
          exam: '错题本',
          exam_id: '错题本'
        }
      }],
      lesson_prep: [{
        user_id: 'smoke-user-1',
        client_id: 'prep_smoke_1',
        passage: {
          title: 'Smoke Test Lesson',
          passage: 'Students ___1___(learn) grammar through guided questions.',
          blanks: [{
            no: 1,
            answer: 'learn',
            category: 'predicate',
            fine_category: 'pred-tense-present',
            analysis: '主语 Students 为复数，描述一般事实，用 learn。'
          }]
        }
      }]
    };
  });
}

async function fillAuthCredentials(page, email, password) {
  await page.locator('#authEmail').click();
  await page.locator('#authEmail').fill(email);
  await page.locator('#authPassword').click();
  await page.locator('#authPassword').fill(password);
  await expect(page.locator('#authEmail')).toHaveValue(email);
  await expect(page.locator('#authPassword')).toHaveValue(password);
}

test('landing and privacy pages load', async ({ page }) => {
  const errors = collectFatalBrowserErrors(page);

  await page.goto('/docs/');
  await expect(page).toHaveTitle(/Seeklume/);
  await expect(page.getByText('Seeklume', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /进入语法填空/ }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /隐私说明/ })).toBeVisible();

  await page.goto('/docs/privacy.html');
  await expect(page).toHaveTitle(/隐私说明/);
  await expect(page.getByRole('heading', { name: /隐私说明/ })).toBeVisible();
  await expect(page.getByText(/我们收集什么/)).toBeVisible();

  expect(errors).toEqual([]);
});

test('grammar-fill core path renders and opens teaching stage', async ({ page }) => {
  const errors = collectFatalBrowserErrors(page);

  await page.goto('/docs/grammar-fill/');
  await expect(page.locator('html')).toHaveClass(/ready/);
  await expect(page.locator('#page-home')).toHaveClass(/active/);
  await expect(page.locator('#homeDashboardContent')).toContainText(/语法填空/);
  await expect(await page.evaluate(() => {
    window.toggleCompact();
    return document.body.classList.contains('compact')
      && localStorage.getItem('grammar-compact') === '1'
      && window.GrammarAppState
      && window.GrammarAppState.state.compactMode === true;
  })).toBe(true);
  await page.evaluate(() => window.toggleCompact());
  await expect(page.locator('body')).not.toHaveClass(/compact/);
  await expect(await page.evaluate(() => {
    if (!window.setDrawerReturnTo || !window.getDrawerReturnSnapshot) return false;
    window.setDrawerReturnTo({ type: 'smoke-return', label: '返回教材', fromProjection: true });
    var snapshot = window.getDrawerReturnSnapshot();
    var setOk = !!(snapshot
      && snapshot.drawerReturnTo
      && snapshot.drawerReturnTo.label === '返回教材'
      && window.GrammarAppState
      && window.GrammarAppState.state.drawerReturnTo
      && window.GrammarAppState.state.drawerReturnTo.fromProjection === true);
    window.setDrawerReturnTo(null);
    var clearedSnapshot = window.getDrawerReturnSnapshot();
    return !!(setOk
      && clearedSnapshot
      && clearedSnapshot.drawerReturnTo === null
      && window.GrammarAppState.state.drawerReturnTo === null);
  })).toBe(true);
  await expect(await page.evaluate(() => {
    if (!window.requestSavedMaterialsSync || !window.finishSavedMaterialsSync || !window.getSavedMaterialsSyncQueue) return false;
    var firstShouldRun = window.requestSavedMaterialsSync('error');
    var firstQueue = window.getSavedMaterialsSyncQueue('error');
    var secondShouldRun = window.requestSavedMaterialsSync('error');
    var coalescedQueue = window.getSavedMaterialsSyncQueue('error');
    var shouldRunAgain = window.finishSavedMaterialsSync('error');
    var clearedQueue = window.getSavedMaterialsSyncQueue('error');
    return !!(firstShouldRun === true
      && firstQueue.pending === true
      && firstQueue.rerunRequested === false
      && secondShouldRun === false
      && coalescedQueue.pending === true
      && coalescedQueue.rerunRequested === true
      && shouldRunAgain === true
      && clearedQueue.pending === false
      && clearedQueue.rerunRequested === false
      && window.GrammarAppState
      && window.GrammarAppState.state.errorSyncQueue
      && window.GrammarAppState.state.errorSyncQueue.pending === false);
  })).toBe(true);
  await expect(await page.evaluate(() => {
    if (!window.setPreviousView || !window.getPreviousViewSnapshot) return false;
    window.setPreviousView({ page: 'home', view: 'exams' });
    var snapshot = window.getPreviousViewSnapshot();
    var setOk = !!(snapshot
      && snapshot.previousView
      && snapshot.previousView.page === 'home'
      && snapshot.previousView.view === 'exams'
      && window.GrammarAppState
      && window.GrammarAppState.state.previousView
      && window.GrammarAppState.state.previousView.view === 'exams');
    window.setPreviousView(null);
    var cleared = window.getPreviousViewSnapshot();
    return !!(setOk
      && cleared
      && cleared.previousView === null
      && window.GrammarAppState.state.previousView === null);
  })).toBe(true);
  await expect(await page.evaluate(() => {
    var module = window.GrammarTeachingAxes;
    var viewModel = window.GrammarTeachingViewModel;
    var guideModel = window.GrammarTeachingGuide;
    var focusModel = window.GrammarFocusRules;
    var questionModel = window.GrammarQuestionModel;
    var stateModel = window.GrammarAppState;
    var passageModel = window.GrammarPassageUtils;
    var question = (window.GRAMMAR_BANK.questions || []).find(function(item) {
      return item.category === 'nonpredicate';
    });
    var exam = (window.GRAMMAR_BANK.exams || [])[0];
    var orderedExams = questionModel && questionModel.getOrderedExams(window.GRAMMAR_BANK.exams || []);
    var examQuestion = questionModel && questionModel.createExamQuestionFromRaw(exam.questions[0], exam, window.CATEGORY_TIPS || {});
    var examState = questionModel && questionModel.createExamStateFromId(exam.exam_id, questionModel.buildExamsById(window.GRAMMAR_BANK), window.CATEGORY_TIPS || {});
    var missingExamMessage = questionModel && questionModel.getMissingExamMessage('missing-exam-smoke');
    var fineInfo = questionModel && questionModel.getFineTagInfo(question.fine_category, window.GRAMMAR_FINE_TAGS || {});
    var fineStats = questionModel && questionModel.countByFineTag(question.fine_category, window.GRAMMAR_BANK.questions || [], []);
    var frequencyStyle = questionModel && questionModel.getFrequencyStyle(fineStats.total);
    var sentence = passageModel && passageModel.getQuestionSentenceFallback(question);
    var blankPrefix = passageModel && passageModel.getBlankPrefix(sentence, question.no);
    var chineseSentence = passageModel && passageModel.getQuestionChineseSentence(question, {
      getQuestionTranslationText: function(item) {
        var ex = (window.GRAMMAR_BANK.exams || []).find(function(row) {
          return row.exam_id === (item.exam_id || item.exam);
        });
        return ex && ex.chinese_translation || '';
      }
    });
    var appSnapshot = stateModel && stateModel.createTeachingContextSnapshot({
      currentExam: { mode: 'exam', examId: exam.exam_id },
      currentQuestions: examState.currentQuestions,
      selectedQuestion: examState.currentQuestions[0],
      idx: 1,
      teachingSession: { tab: 'migration', showAnswer: true },
      showAnswers: false,
      showChinese: true
    });
    var sameExamContext = stateModel && stateModel.isSameTeachingExamContext(
      { mode: 'exam', examId: exam.exam_id },
      { mode: 'exam', examId: exam.exam_id },
      {}
    );
    var wrappedIdx = stateModel && stateModel.getWrappedQuestionIndex(1, true, 9, 10);
    var clampedIdx = stateModel && stateModel.clampQuestionIndex(99, 10);
    var currentIdxFromSelection = stateModel && stateModel.getCurrentQuestionIndex({
      currentQuestions: examState.currentQuestions,
      selectedQuestion: examState.currentQuestions[3],
      teachingSession: null
    }, {
      findSelectedIndex: function(selected, questions) { return questions.indexOf(selected); }
    });
    var currentIdxFromSession = stateModel && stateModel.getCurrentQuestionIndex({
      currentQuestions: examState.currentQuestions,
      selectedQuestion: examState.currentQuestions[0],
      teachingSession: { idx: 5 }
    });
    var selectedQuestionState = stateModel && stateModel.buildSelectedQuestionState(examState.currentQuestions, 99);
    var selectedQuestionSnapshotState = stateModel && stateModel.buildSelectedQuestionSnapshotState(examState.currentQuestions[1], examState.currentQuestions);
    var selectedFromContext = stateModel && stateModel.buildSelectedQuestionFromContext(examState.currentQuestions, { idx: 2 });
    var selectedIndexByNo = stateModel && stateModel.findSelectedQuestionIndex(
      { no: examState.currentQuestions[4].no },
      examState.currentQuestions
    );
    var clearedSelected = stateModel && stateModel.clearSelectedQuestionState();
    var practiceContextState = stateModel && stateModel.buildPracticeContextState(examState);
    var practiceContextSnapshot = stateModel && stateModel.buildPracticeContextSnapshotState(examState);
    var practiceContextFromExam = stateModel && stateModel.buildPracticeContextState({
      currentExam: examState.currentExam
    });
    var clearedPracticeContext = stateModel && stateModel.clearPracticeContextState();
    var normalizedPreviousHome = stateModel && stateModel.normalizePreviousView({ page: 'home', view: 'bad-view' });
    var normalizedPreviousError = stateModel && stateModel.normalizePreviousView({ page: 'error-book', view: 'ignored' });
    var previousViewState = stateModel && stateModel.buildPreviousViewState({ page: 'lesson-prep' });
    var categoryEntryPrevious = stateModel && stateModel.getPracticeEntryPreviousView('category');
    var examEntryPrevious = stateModel && stateModel.getPracticeEntryPreviousView('exam');
    var errorEntryPrevious = stateModel && stateModel.getPracticeEntryPreviousView('error');
    var prepEntryPrevious = stateModel && stateModel.getPracticeEntryPreviousView('prep');
    var blankNavigationInitialForward = stateModel && stateModel.getBlankNavigationIndex({
      delta: 1,
      total: 10,
      hasSelectedQuestion: false
    });
    var blankNavigationInitialBackward = stateModel && stateModel.getBlankNavigationIndex({
      delta: -1,
      total: 10,
      hasSelectedQuestion: false
    });
    var blankNavigationWrapForward = stateModel && stateModel.getBlankNavigationIndex({
      delta: 1,
      currentIdx: 9,
      total: 10,
      hasSelectedQuestion: true
    });
    var blankNavigationWrapBackward = stateModel && stateModel.getBlankNavigationIndex({
      delta: -1,
      currentIdx: 0,
      total: 10,
      hasSelectedQuestion: true
    });
    var blankNavigationInvalid = stateModel && stateModel.getBlankNavigationIndex({
      delta: 1,
      currentIdx: -1,
      total: 10,
      hasSelectedQuestion: true
    });
    var normalizedPageKey = stateModel && stateModel.normalizePageKey('bad-page');
    var protectedPageState = stateModel && stateModel.isProtectedPage('lesson-prep');
    var publicPageAuthGuard = stateModel && stateModel.buildPageAuthGuard('knowledge', false);
    var protectedPageAuthGuard = stateModel && stateModel.buildPageAuthGuard('admin', false);
    var authenticatedPageAuthGuard = stateModel && stateModel.buildPageAuthGuard('error-book', true);
    var welcomeShellState = stateModel && stateModel.buildPageShellState('welcome');
    var modulesShellState = stateModel && stateModel.buildPageShellState('modules');
    var homeShellState = stateModel && stateModel.buildPageShellState('home');
    var normalizedDockKey = stateModel && stateModel.normalizeDockKey('practice');
    var knowledgePageState = stateModel && stateModel.buildActivePageState('knowledge');
    var practicePageState = stateModel && stateModel.buildActivePageState('practice');
    var categoryDockState = stateModel && stateModel.buildDockActivationState('categories');
    var homeRenderPlan = stateModel && stateModel.buildPageRenderPlan('home');
    var adminRenderPlan = stateModel && stateModel.buildPageRenderPlan('admin');
    var knowledgeRenderPlan = stateModel && stateModel.buildPageRenderPlan('knowledge');
    var blockedPageSwitchPlan = stateModel && stateModel.buildPageSwitchPlan('lesson-prep', {
      isAuthenticated: false,
      teachingSession: { idx: 0 },
      keepTeachingOnPageSwitch: false
    });
    var allowedPageSwitchPlan = stateModel && stateModel.buildPageSwitchPlan('knowledge', {
      isAuthenticated: false,
      teachingSession: null,
      keepTeachingOnPageSwitch: false
    });
    var grammarEntryPlan = stateModel && stateModel.buildModuleEntryPlan('grammar');
    var unknownEntryPlan = stateModel && stateModel.buildModuleEntryPlan('writing');
    var goHomePlan = stateModel && stateModel.buildGoHomePlan();
    var keepTeachingState = stateModel && stateModel.buildTeachingPageSwitchRetentionState(true);
    var releaseTeachingState = stateModel && stateModel.buildTeachingPageSwitchRetentionState(false);
    var keepTeachingSnapshot = stateModel && stateModel.buildTeachingPageSwitchRetentionSnapshotState(keepTeachingState);
    var shouldCloseTeaching = stateModel && stateModel.shouldCloseTeachingOnPageSwitch({
      teachingSession: { idx: 0 },
      keepTeachingOnPageSwitch: false
    });
    var shouldKeepTeaching = stateModel && stateModel.shouldCloseTeachingOnPageSwitch({
      teachingSession: { idx: 0 },
      keepTeachingOnPageSwitch: true
    });
    var previousViewLabel = stateModel && stateModel.getPreviousViewLabel({ page: 'home', view: 'exams' });
    var dockPracticeLabel = stateModel && stateModel.getDockBackLabel({
      activePage: 'practice',
      previousView: { page: 'lesson-prep' },
      currentHomeView: 'cards',
      currentKnowledgeView: ''
    });
    var dockKnowledgeLabel = stateModel && stateModel.getDockBackLabel({
      activePage: 'knowledge',
      currentHomeView: 'cards',
      currentKnowledgeView: 'system-node'
    });
    var drawerBackAction = stateModel && stateModel.getDockBackAction({
      drawerReturnTo: { label: '返回教材' },
      activePage: 'practice',
      currentHomeView: 'cards',
      currentKnowledgeView: ''
    });
    var homeBackAction = stateModel && stateModel.getDockBackAction({
      activePage: 'home',
      currentHomeView: 'exams'
    });
    var practiceBackAction = stateModel && stateModel.getDockBackAction({
      activePage: 'practice',
      currentHomeView: 'cards',
      previousView: { page: 'lesson-prep' }
    });
    var mapBackAction = stateModel && stateModel.getDockBackAction({
      activePage: 'knowledge',
      currentKnowledgeView: 'map-node'
    });
    var systemBackAction = stateModel && stateModel.getDockBackAction({
      activePage: 'knowledge',
      currentKnowledgeView: 'system-node'
    });
    var previousHomeReturn = stateModel && stateModel.buildPreviousViewReturn({ page: 'home', view: 'categories' });
    var previousPageReturn = stateModel && stateModel.buildPreviousViewReturn({ page: 'error-book' });
    var emptyPreviousReturn = stateModel && stateModel.buildPreviousViewReturn(null);
    var drawerReturnState = stateModel && stateModel.buildDrawerReturnState({ type: 'unit-question-list', label: '返回教材' });
    var consumedDrawerReturn = stateModel && stateModel.consumeDrawerReturn(drawerReturnState.drawerReturnTo);
    var drawerClosePlan = stateModel && stateModel.buildDrawerClosePlan(false);
    var drawerClosePreservePlan = stateModel && stateModel.buildDrawerClosePlan(true);
    var normalizedDrawerTab = stateModel && stateModel.normalizeDrawerTab('bad-tab');
    var drawerTabPlan = stateModel && stateModel.buildDrawerTabSwitchPlan('theory', {
      teachingSession: null,
      selectedQuestion: { no: 1 }
    });
    var drawerTeachingTabPlan = stateModel && stateModel.buildDrawerTabSwitchPlan('migration', {
      teachingSession: { tab: 'guide' },
      selectedQuestion: { no: 1 }
    });
    var normalizedMigrationSource = stateModel && stateModel.normalizeMigrationSource('bad-source');
    var migrationSourceState = stateModel && stateModel.buildMigrationSourceState('errors');
    var migrationSourceChangePlan = stateModel && stateModel.buildMigrationSourceChangePlan('all', {
      question: { no: 4, category: 'predicate', fine_category: 'pred-tense' },
      hasTeachingSession: false,
      hasSelectedQuestion: true
    });
    var migrationTeachingSourceChangePlan = stateModel && stateModel.buildMigrationSourceChangePlan('errors', {
      question: { no: 5, category: 'word', fine_category: 'word-adj-adv' },
      hasTeachingSession: true,
      hasSelectedQuestion: true
    });
    var compactOnState = stateModel && stateModel.buildCompactModeState(false);
    var compactOffState = stateModel && stateModel.buildCompactModeState(true, false);
    var projectionStartState = stateModel && stateModel.buildProjectionStartState({
      hasFullscreenElement: false,
      canRequestFullscreen: true
    });
    var projectionBlockedGuard = stateModel && stateModel.buildProjectionEntryGuard({ practiceActive: false });
    var projectionAllowedGuard = stateModel && stateModel.buildProjectionEntryGuard({ practiceActive: true });
    var projectionNoApiState = stateModel && stateModel.buildProjectionStartState({
      hasFullscreenElement: false,
      canRequestFullscreen: false
    });
    var projectionExitState = stateModel && stateModel.buildProjectionExitState({
      hasFullscreenElement: true
    });
    var fullscreenClearedState = stateModel && stateModel.buildProjectionFullscreenChangeState(false);
    var drawerProjectionState = stateModel && stateModel.buildDrawerProjectionSizeState('full');
    var drawerProjectionFallbackState = stateModel && stateModel.buildDrawerProjectionSizeState('bad-size');
    var normalizedDrawerHeight = stateModel && stateModel.normalizeDrawerHeight('360px');
    var invalidDrawerHeight = stateModel && stateModel.normalizeDrawerHeight('bad-height');
    var clampedDrawerHeightLow = stateModel && stateModel.clampDrawerHeight(100, 800);
    var clampedDrawerHeightHigh = stateModel && stateModel.clampDrawerHeight(900, 800);
    var drawerHeightState = stateModel && stateModel.buildDrawerHeightState(500, 800);
    var drawerResizeState = stateModel && stateModel.buildDrawerResizeState(400, 500, 300, 800);
    var normalizedSyncStatus = stateModel && stateModel.normalizeSyncStatus('bad-status');
    var syncHiddenModel = stateModel && stateModel.buildSyncStatusViewModel(null);
    var syncWorkingModel = stateModel && stateModel.buildSyncStatusViewModel('syncing');
    var syncOkModel = stateModel && stateModel.buildSyncStatusViewModel('ok');
    var syncErrorModel = stateModel && stateModel.buildSyncStatusViewModel('error', 'network down');
    var syncBeginState = stateModel && stateModel.buildSyncBeginState(1);
    var syncPendingEndState = stateModel && stateModel.buildSyncEndState(2, null);
    var syncErrorEndState = stateModel && stateModel.buildSyncEndState(1, { message: 'network down' });
    var normalizedSyncQueue = stateModel && stateModel.normalizeSyncQueueState({ pending: 1, queuedAgain: true });
    var syncQueueStartState = stateModel && stateModel.buildSyncQueueRequestState({ pending: false });
    var syncQueueCoalescedState = stateModel && stateModel.buildSyncQueueRequestState({ pending: true });
    var syncQueueEndRerunState = stateModel && stateModel.buildSyncQueueEndState(syncQueueCoalescedState.queue);
    var syncQueueEndIdleState = stateModel && stateModel.buildSyncQueueEndState(syncQueueStartState.queue);
    var errorSyncQueueKey = stateModel && stateModel.getSavedMaterialsSyncQueueKey('error');
    var prepSyncQueueKey = stateModel && stateModel.getSavedMaterialsSyncQueueKey('lessonPrep');
    var cloudUserKey = stateModel && stateModel.getCloudUserKey({ user: { id: 'user-a' }, viewingUserId: 'view-b' });
    var normalizedCloudLifecycle = stateModel && stateModel.normalizeCloudLifecycleState({
      cloudLastUserKey: 'user-a|',
      cloudMigrationPromptShown: 1,
      cloudAdminParamChecked: '',
      cloudLoggingOut: 'yes'
    });
    var patchedCloudLifecycle = stateModel && stateModel.buildCloudLifecycleState({
      cloudLastUserKey: 'user-a|',
      cloudMigrationPromptShown: false,
      cloudAdminParamChecked: true,
      cloudLoggingOut: false
    }, {
      cloudMigrationPromptShown: true,
      cloudLoggingOut: true
    });
    var cloudArrivalFirst = stateModel && stateModel.buildCloudArrivalState({
      cloudLastUserKey: ''
    }, {
      user: { id: 'user-a' },
      viewingUserId: ''
    });
    var cloudArrivalRepeat = stateModel && stateModel.buildCloudArrivalState({
      cloudLastUserKey: 'user-a|'
    }, {
      user: { id: 'user-a' },
      viewingUserId: ''
    });
    var cloudAdminEntry = stateModel && stateModel.buildCloudAdminEntryState({
      firstAuthForThisUser: true,
      viewingUserId: '',
      cloudAdminParamChecked: false,
      isAdmin: true,
      hasAdminParam: true
    });
    var cloudAdminSkipped = stateModel && stateModel.buildCloudAdminEntryState({
      firstAuthForThisUser: true,
      viewingUserId: 'view-b',
      cloudAdminParamChecked: false,
      isAdmin: true,
      hasAdminParam: true
    });
    var cloudMigrationPromptState = stateModel && stateModel.buildLocalCloudMigrationPromptState({
      viewingUserId: '',
      cloudMigrationPromptShown: false,
      cloudErrorCount: 0,
      cloudPrepCount: 0,
      localErrorCount: 2,
      localPrepCount: 0
    });
    var cloudMigrationSkippedState = stateModel && stateModel.buildLocalCloudMigrationPromptState({
      viewingUserId: '',
      cloudMigrationPromptShown: true,
      cloudErrorCount: 0,
      cloudPrepCount: 0,
      localErrorCount: 2,
      localPrepCount: 0
    });
    var clearedCloudLifecycle = stateModel && stateModel.clearCloudLifecycleState();
    var canWriteOwnCloudData = stateModel && stateModel.canWriteCloudLearningData({ user: { id: 'user-a' }, viewingUserId: '' });
    var blocksViewAsCloudWrite = stateModel && stateModel.canWriteCloudLearningData({ user: { id: 'admin' }, viewingUserId: 'user-a' });
    var ownErrorSaveCloudPlan = stateModel && stateModel.buildSavedMaterialsSaveCloudPlan('error', { user: { id: 'user-a' }, viewingUserId: '' });
    var viewAsPrepSaveCloudPlan = stateModel && stateModel.buildSavedMaterialsSaveCloudPlan('lessonPrep', { user: { id: 'admin' }, viewingUserId: 'user-a' });
    var guestSaveCloudPlan = stateModel && stateModel.buildSavedMaterialsSaveCloudPlan('prep', { user: null });
    var cloudLoggingOutState = stateModel && stateModel.buildCloudLoggingOutState(true);
    var normalizedReturnStack = stateModel && stateModel.normalizeTeachingReturnStack({ bad: 'stack' });
    var returnStackState = stateModel && stateModel.buildTeachingReturnStackState([{ type: 'migration', label: '返回原题' }]);
    var pushedReturn = stateModel && stateModel.pushTeachingReturnContext([], { type: 'migration', label: '返回原题' });
    var returnStackSnapshot = stateModel && stateModel.buildTeachingReturnStackSnapshotState(pushedReturn.teachingReturnStack);
    var returnDockState = stateModel && stateModel.buildTeachingReturnDockState(pushedReturn.teachingReturnStack);
    var teachingDockModel = stateModel && stateModel.buildTeachingDockModel(
      { source: 'practice', idx: 1, tab: 'knowledge', showAnswer: false },
      [{ no: 1 }, { no: 2 }],
      pushedReturn.teachingReturnStack,
      { normalizeTab: viewModel.normalizeTab }
    );
    var emptyTeachingDockModel = stateModel && stateModel.buildTeachingDockModel(null, [{ no: 1 }], [], {
      normalizeTab: viewModel.normalizeTab
    });
    var teachingStageOpenPlan = stateModel && stateModel.buildTeachingStageOpenPlan(
      [{ no: 1 }, { no: 2, category: 'predicate', fine_category: 'pred-smoke' }],
      1,
      { source: 'practice', tab: 'knowledge', showAnswer: true },
      null,
      { normalizeTab: viewModel.normalizeTab }
    );
    var retainedTeachingStageOpenPlan = stateModel && stateModel.buildTeachingStageOpenPlan(
      [{ no: 1 }, { no: 2 }],
      0,
      {},
      { source: 'migration', idx: 1, tab: 'migration', showAnswer: true },
      { normalizeTab: viewModel.normalizeTab }
    );
    var emptyTeachingStageOpenPlan = stateModel && stateModel.buildTeachingStageOpenPlan(
      [],
      0,
      {},
      null,
      { normalizeTab: viewModel.normalizeTab }
    );
    var teachingQuestionJumpPlan = stateModel && stateModel.buildTeachingQuestionJumpPlan(
      { source: 'practice', idx: 1, tab: 'knowledge', showAnswer: true },
      [{ no: 1 }, { no: 2 }, { no: 3 }],
      1,
      true
    );
    var teachingQuestionWrapJumpPlan = stateModel && stateModel.buildTeachingQuestionJumpPlan(
      { source: 'practice', idx: 0, tab: 'guide', showAnswer: false },
      [{ no: 1 }, { no: 2 }],
      -1,
      true
    );
    var emptyTeachingQuestionJumpPlan = stateModel && stateModel.buildTeachingQuestionJumpPlan(
      null,
      [{ no: 1 }],
      0,
      false
    );
    var teachingBlankRevealPlan = stateModel && stateModel.buildTeachingBlankRevealPlan(false, 'learn', '___1___');
    var teachingBlankHidePlan = stateModel && stateModel.buildTeachingBlankRevealPlan(true, 'learn', '___1___');
    var unitReturnLabel = stateModel && stateModel.getTeachingReturnLabel({ type: 'unit-question-list' });
    var poppedReturn = stateModel && stateModel.popTeachingReturnContext(pushedReturn.teachingReturnStack);
    var clearedReturn = stateModel && stateModel.clearTeachingReturnStack();
    var emptyReturnAction = stateModel && stateModel.buildTeachingReturnAction(null);
    var drawerReturnAction = stateModel && stateModel.buildTeachingReturnAction({
      type: 'unit-question-list',
      label: '返回教材'
    });
    var teachingReturnAction = stateModel && stateModel.buildTeachingReturnAction({
      type: 'migration',
      idx: 4,
      tab: 'knowledge',
      showAnswer: true
    });
    var teachingBaseState = stateModel && stateModel.buildTeachingBaseContextState(appSnapshot, {
      idx: 3,
      selectedQuestion: examState.currentQuestions[3]
    });
    var teachingBaseSnapshot = stateModel && stateModel.buildTeachingBaseContextSnapshotState(teachingBaseState.teachingBaseContext);
    var clearedBaseState = stateModel && stateModel.clearTeachingBaseContextState();
    var migrationRegistrySource = { tm_1: { answer: 'learn' } };
    var normalizedMigrationRegistry = stateModel && stateModel.normalizeTeachingMigrationRegistry(migrationRegistrySource);
    var registeredMigrationItem = stateModel && stateModel.registerTeachingMigrationItemState(
      normalizedMigrationRegistry,
      1,
      { answer: 'teaches' }
    );
    var fetchedMigrationItem = stateModel && stateModel.getTeachingMigrationRegistryItem(
      registeredMigrationItem.teachingMigrationRegistry,
      registeredMigrationItem.id
    );
    var clearedMigrationRegistry = stateModel && stateModel.clearTeachingMigrationRegistryState(registeredMigrationItem.teachingMigrationCounter);
    var shouldRestoreBase = stateModel && stateModel.shouldRestoreTeachingBaseContext({
      currentExam: { mode: 'exam', examId: 'different-exam' },
      teachingBaseContext: { currentExam: { mode: 'exam', examId: exam.exam_id } }
    }, {
      isSameTeachingExamContext: function(a, b) {
        return stateModel.isSameTeachingExamContext(a, b, {});
      }
    });
    var shouldSkipRestoreBase = stateModel && stateModel.shouldRestoreTeachingBaseContext({
      skipRestore: true,
      currentExam: { mode: 'exam', examId: 'different-exam' },
      teachingBaseContext: { currentExam: { mode: 'exam', examId: exam.exam_id } }
    }, {
      isSameTeachingExamContext: function(a, b) {
        return stateModel.isSameTeachingExamContext(a, b, {});
      }
    });
    var restoreTeardownPlan = stateModel && stateModel.buildTeachingStageTeardownPlan({
      currentExam: { mode: 'exam', examId: 'different-exam' },
      teachingBaseContext: {
        currentExam: { mode: 'exam', examId: exam.exam_id },
        idx: 6
      },
      teachingSession: { idx: 2 },
      currentQuestionIndex: 1
    }, {
      isSameTeachingExamContext: function(a, b) {
        return stateModel.isSameTeachingExamContext(a, b, {});
      }
    });
    var keepTeardownPlan = stateModel && stateModel.buildTeachingStageTeardownPlan({
      currentExam: { mode: 'exam', examId: exam.exam_id },
      teachingBaseContext: {
        currentExam: { mode: 'exam', examId: exam.exam_id },
        idx: 6
      },
      teachingSession: null,
      currentQuestionIndex: 5
    }, {
      isSameTeachingExamContext: function(a, b) {
        return stateModel.isSameTeachingExamContext(a, b, {});
      }
    });
    var nextSession = stateModel && stateModel.createTeachingSession(2, { tab: 'analysis' }, null, {
      normalizeTab: viewModel.normalizeTab
    });
    var teachingSessionSnapshot = stateModel && stateModel.buildTeachingSessionState(nextSession);
    var teachingTabState = stateModel && stateModel.buildTeachingTabState(nextSession, 'migration', {
      normalizeTab: viewModel.normalizeTab
    });
    var teachingAnswerToggled = stateModel && stateModel.buildTeachingAnswerState(nextSession);
    var teachingAnswerForced = stateModel && stateModel.buildTeachingAnswerState(nextSession, true);
    var clearedTeachingSession = stateModel && stateModel.clearTeachingSessionState();
    var resetDisplay = stateModel && stateModel.resetPracticeDisplayState();
    var displaySnapshot = stateModel && stateModel.buildPracticeDisplayState({ showAnswers: 1, showChinese: '' });
    var toggledAnswers = stateModel && stateModel.togglePracticeAnswers({ showAnswers: false, showChinese: true });
    var toggledChineseOn = stateModel && stateModel.togglePracticeChinese({ showAnswers: true, showChinese: false });
    var toggledChineseOff = stateModel && stateModel.togglePracticeChinese({ showAnswers: false, showChinese: true });
    var clampedFontLow = stateModel && stateModel.clampFontSize(4);
    var clampedFontHigh = stateModel && stateModel.clampFontSize(72);
    var adjustedFont = stateModel && stateModel.adjustFontSize(24, 2);
    var fontScaleSnapshot = stateModel && stateModel.buildFontScaleSnapshotState({ passageFontSize: 4, drawerFontSize: 72 });
    var fontScalePassage = stateModel && stateModel.buildFontScaleState({ passageFontSize: 24, drawerFontSize: 24 }, 'passage', -20);
    var fontScaleDrawer = stateModel && stateModel.buildFontScaleState({ passageFontSize: 24, drawerFontSize: 24 }, 'drawer', 30);
    var fontCssVars = stateModel && stateModel.buildFontCssVarMap({ passageFontSize: 25, drawerFontSize: 26 });
    var fontPassageViewModel = stateModel && stateModel.buildFontScaleViewModel({ passageFontSize: 25, drawerFontSize: 26 }, 'passage');
    var fontDrawerViewModel = stateModel && stateModel.buildFontScaleViewModel({ passageFontSize: 25, drawerFontSize: 26 }, 'drawer');
    var normalizedHomeView = stateModel && stateModel.normalizeHomeView('unknown-view');
    var examHomeState = stateModel && stateModel.buildHomeViewState('exams');
    var categoryDockKey = stateModel && stateModel.getHomeDockKey('categories');
    var normalizedKnowledgeView = stateModel && stateModel.normalizeKnowledgeView('unknown-view');
    var knowledgeNodeState = stateModel && stateModel.buildKnowledgeViewState({
      currentKnowledgeView: 'system-node',
      currentKnowledgeKey: 'predicate',
      currentKnowledgeNodeId: 'teach_start',
      currentIsPattern: true
    });
    var knowledgeSearchStateSource = [{ catKey: 'smoke-node' }];
    var normalizedKnowledgeSearchIndex = stateModel && stateModel.normalizeKnowledgeSearchIndex(knowledgeSearchStateSource);
    var knowledgeSearchIndexState = stateModel && stateModel.buildKnowledgeSearchIndexState(knowledgeSearchStateSource);
    var unitMiniContextSource = { unitLabel: 'Unit Smoke', tagIds: ['tag-a'], source: 'bank' };
    var unitMiniContextState = stateModel && stateModel.buildUnitMiniContextState(unitMiniContextSource);
    var unitMiniFilterState = stateModel && stateModel.buildUnitMiniFilterState(unitMiniContextState.unitMiniContext, '模拟');
    var errorUnitMiniContext = stateModel && stateModel.normalizeUnitMiniContext({ unitLabel: 'Errors', tagIds: ['tag-b'], source: 'errors', filter: '真题' });
    var clearedUnitMiniContext = stateModel && stateModel.clearUnitMiniContextState();
    var globalGraphFocusSource = ['node-a'];
    var normalizedGlobalGraphState = stateModel && stateModel.normalizeGlobalGraphState({ scale: 'bad', tx: 10, selectedId: 'node-a', focusIds: globalGraphFocusSource });
    var pannedGlobalGraphState = stateModel && stateModel.buildGlobalGraphPanState({ scale: 1, tx: 10, ty: 20 }, 5, -8);
    var zoomedGlobalGraphState = stateModel && stateModel.buildGlobalGraphZoomState({ scale: 1, tx: 10, ty: 20 }, 2, 50, 60);
    var fittedGlobalGraphState = stateModel && stateModel.buildGlobalGraphFitBoundsState(
      { scale: 1, tx: 0, ty: 0 },
      { x: 100, y: 50, w: 200, h: 100 },
      { width: 1000, height: 700 }
    );
    var centeredGlobalGraphState = stateModel && stateModel.buildGlobalGraphCenterNodeState(
      { scale: 1, tx: 0, ty: 0 },
      { x: 100, y: 50 },
      { w: 120, h: 80 },
      { width: 1000, height: 700 }
    );
    var focusedGlobalGraphState = stateModel && stateModel.buildGlobalGraphFocusState(
      { scale: 1, tx: 0, ty: 0 },
      'node-b',
      ['node-b', 'node-c'],
      'predicate'
    );
    var normalizedTextbookViewMode = stateModel && stateModel.normalizeTextbookViewMode('bad-mode');
    var textbookListModeState = stateModel && stateModel.buildTextbookViewModeState('list');
    var axis = module && module.getNonpAxis(question);
    var focusFromModule = focusModel && focusModel.getQuestionFocus(question, {
      extractSentence: window.GrammarPassageUtils && window.GrammarPassageUtils.extractSentence,
      trapData: window.GRAMMAR_KNOWLEDGE_TRAPS || {},
      categoryMap: window.CATEGORY_MAP || {},
      categoryTips: window.CATEGORY_TIPS || {}
    });
    var trapIdFromModule = focusModel && focusModel.inferQuestionTrapId(question, {
      extractSentence: window.GrammarPassageUtils && window.GrammarPassageUtils.extractSentence,
      trapData: window.GRAMMAR_KNOWLEDGE_TRAPS || {}
    });
    var tab = viewModel && viewModel.normalizeTab('analysis');
    var stageShellModel = viewModel && viewModel.buildTeachingStageShellModel(question, {
      source: 'Smoke Source'
    }, {
      tab: 'knowledge'
    }, {
      categoryMap: window.CATEGORY_MAP || {},
      safeQuestionFocus: function(){ return focusFromModule; },
      safeQuestionTrapId: function(){ return trapIdFromModule; },
      getNonpAxis: function(){ return axis; },
      getQuestionChineseSentence: function(){ return '中文句子。'; },
      getQuestionPracticalGuide: function(item, focus, nonpAxis) {
        return guideModel.getQuestionPracticalGuide(item, {
          focus: focus,
          nonpAxis: nonpAxis,
          categoryMap: window.CATEGORY_MAP || {},
          categoryTips: window.CATEGORY_TIPS || {}
        });
      },
      getFineTagInfo: function(id) {
        return questionModel.getFineTagInfo(id, window.GRAMMAR_FINE_TAGS || {});
      }
    });
    var guide = guideModel && guideModel.getQuestionPracticalGuide(question, {
      nonpAxis: axis,
      focus: { key: question.category, label: question.category_name, note: '' },
      categoryMap: window.CATEGORY_MAP || {},
      categoryTips: window.CATEGORY_TIPS || {}
    });
    var guideCardModel = guideModel && guideModel.buildPracticalGuideCardModel({
      title: '考点：谓语动词',
      trigger: '抓主语和时间线索。',
      steps: ['第一步', '', '第二步', '第三步', '第四步'],
      commonMistake: '常错：只看最近名词。'
    });
    var emptyGuideCardModel = guideModel && guideModel.buildPracticalGuideCardModel(null);
    var guidePanelModel = guideModel && guideModel.buildGuidePanelModel({
      headline: 'Smoke Guide',
      subline: 'Smoke Subline',
      practicalGuide: guide
    });
    var analysisPanelModel = guideModel && guideModel.buildAnalysisPanelModel({
      answer: 'learn',
      analysis: 'Smoke analysis.'
    }, {
      zhSentence: '中文句子。',
      practicalGuide: guide,
      teachingSession: null,
      migrationCount: 4
    });
    var teachingAnalysisPanelModel = guideModel && guideModel.buildAnalysisPanelModel({
      answer: 'learn'
    }, {
      teachingSession: { tab: 'guide' },
      migrationCount: 2
    });
    var solutionPanelModel = guideModel && guideModel.buildSolutionPanelModel({ answer: 'learn' });
    var solveDualModel = guideModel && guideModel.buildSolutionPanelModel({ answer: 'x', solve: '先看括号再下手', explanation: '考查动词' });
    var analysisFloatClosePlan = guideModel && guideModel.buildAnalysisFloatClosePlan();
    var analysisFloatOpenPlan = guideModel && guideModel.buildAnalysisFloatTogglePlan('guide', false);
    var analysisFloatCloseOnlyPlan = guideModel && guideModel.buildAnalysisFloatTogglePlan('solution', true);
    var invalidAnalysisFloatPlan = guideModel && guideModel.buildAnalysisFloatTogglePlan('bad-kind', false);
    var theoryCategory = Object.keys(window.KNOWLEDGE_DATA || {})[0] || question.category;
    var theoryPanelModel = guideModel && guideModel.buildTheoryPanelModel({
      category: theoryCategory,
      fine_category: '',
      answer: 'learn'
    }, {
      knowledgeData: window.KNOWLEDGE_DATA || {},
      categoryMap: window.CATEGORY_MAP || {},
      safeQuestionFocus: function() {
        return {
          key: theoryCategory,
          label: (window.CATEGORY_MAP || {})[theoryCategory] || theoryCategory,
          note: ''
        };
      },
      getFineTagInfo: function() { return null; }
    });
    var emptyTheoryPanelModel = guideModel && guideModel.buildTheoryPanelModel({ category: 'missing-smoke' }, {
      knowledgeData: {},
      categoryMap: { 'missing-smoke': '缺失考点' }
    });
    var teachingCard = guideModel && guideModel.getQuestionTeachingGuide(question, {
      focus: focusFromModule,
      trap: null
    });
    var lessonPath = guideModel && guideModel.getQuestionLessonPath(question, focusFromModule, null, {
      categoryMap: window.CATEGORY_MAP || {}
    });
    var teachingQuestionGraphNodeId = viewModel && viewModel.getGraphNodeIdForQuestion(question, {
      knowledgeCore: window.GRAMMAR_KNOWLEDGE_CORE || {},
      safeQuestionTrapId: function(){ return ''; }
    });
    var mindmap = viewModel && viewModel.getMindmapDefinition(question);
    var mindmapActive = viewModel && viewModel.getMindmapActiveKeys(question, {
      safeQuestionFocus: function(){ return focusFromModule; },
      safeQuestionTrapId: function(){ return trapIdFromModule; },
      getNonpAxis: function(){ return axis; },
      getQuestionPracticalGuide: function(){ return guide; }
    });
    var knowledgePanelModel = viewModel && viewModel.buildTeachingKnowledgePanelModel(question, {
      categoryMap: window.CATEGORY_MAP || {},
      knowledgeCore: window.GRAMMAR_KNOWLEDGE_CORE || {},
      graphNodeIndex: viewModel.buildGraphNodeIndex(
        (window.GRAMMAR_KNOWLEDGE_CORE && window.GRAMMAR_KNOWLEDGE_CORE.teaching_graph) || {},
        (window.GRAMMAR_KNOWLEDGE_CORE && window.GRAMMAR_KNOWLEDGE_CORE.nodes) || {}
      ),
      safeQuestionFocus: function(){ return focusFromModule; },
      safeQuestionTrapId: function(){ return trapIdFromModule; },
      getNonpAxis: function(){ return axis; },
      getQuestionPracticalGuide: function(){ return guide; },
      getFineTagInfo: function(id) {
        return questionModel.getFineTagInfo(id, window.GRAMMAR_FINE_TAGS || {});
      }
    });
    var teachingGlobalGraphOpenPlan = viewModel && viewModel.buildTeachingGlobalGraphOpenPlan(question, {
      knowledgeCore: window.GRAMMAR_KNOWLEDGE_CORE || {},
      safeQuestionTrapId: function(){ return trapIdFromModule; }
    });
    var emptyTeachingGlobalGraphOpenPlan = viewModel && viewModel.buildTeachingGlobalGraphOpenPlan(null, {
      knowledgeCore: window.GRAMMAR_KNOWLEDGE_CORE || {}
    });
    var migrationModel = window.GrammarMigrationTraining;
    var categoryRules = window.GrammarCategoryRules;
    var homeModel = window.GrammarHomeDashboardModel;
    var examGridModel = window.GrammarExamGridModel;
    var classroomSwitcherModel = window.GrammarClassroomSwitcherModel;
    var practiceViewModel = window.GrammarPracticeViewModel;
    var sidebarModel = window.GrammarSidebarViewModel;
    var knowledgeModel = window.GrammarKnowledgeViewModel;
    var savedModel = window.GrammarSavedMaterialsModel;
    var wordImportModel = window.GrammarWordImportModel;
    var migrationKeys = migrationModel && migrationModel.getTeachingMigrationKeys(question, {
      focus: focusFromModule,
      nonpAxis: axis,
      getQuestionPracticalGuide: function(){ return guide; }
    });
    var migrationOverlap = migrationModel && migrationModel.hasTeachingMigrationOverlap(
      { exam: 'smoke', no: 999, id: 'smoke-overlap' },
      question,
      ['smoke-key'],
      { getQuestionPracticalGuide: function(){ return { migrationKeys: ['smoke-key'] }; } }
    );
    var migrationData = migrationModel && migrationModel.buildMigrationData(question, {
      source: 'bank',
      bankQuestions: window.GRAMMAR_BANK.questions || [],
      errorQuestions: [question],
      categoryMap: window.CATEGORY_MAP || {},
      safeQuestionFocus: function(item) {
        return focusModel.getQuestionFocus(item, {
          extractSentence: window.GrammarPassageUtils && window.GrammarPassageUtils.extractSentence,
          trapData: window.GRAMMAR_KNOWLEDGE_TRAPS || {},
          categoryMap: window.CATEGORY_MAP || {},
          categoryTips: window.CATEGORY_TIPS || {}
        });
      },
      safeQuestionFocusKey: function(item) {
        return focusModel.getQuestionFocusKey(item, {
          extractSentence: window.GrammarPassageUtils && window.GrammarPassageUtils.extractSentence,
          trapData: window.GRAMMAR_KNOWLEDGE_TRAPS || {},
          categoryMap: window.CATEGORY_MAP || {},
          categoryTips: window.CATEGORY_TIPS || {}
        });
      },
      safeQuestionTrap: function(item) {
        return focusModel.getQuestionTrap(item, {
          extractSentence: window.GrammarPassageUtils && window.GrammarPassageUtils.extractSentence,
          trapData: window.GRAMMAR_KNOWLEDGE_TRAPS || {},
          categoryMap: window.CATEGORY_MAP || {},
          categoryTips: window.CATEGORY_TIPS || {}
        });
      },
      safeQuestionTrapId: function(item) {
        return focusModel.getQuestionTrapId(item, {
          extractSentence: window.GrammarPassageUtils && window.GrammarPassageUtils.extractSentence,
          trapData: window.GRAMMAR_KNOWLEDGE_TRAPS || {},
          categoryMap: window.CATEGORY_MAP || {},
          categoryTips: window.CATEGORY_TIPS || {}
        });
      },
      getFineTagInfo: function(id) {
        return questionModel.getFineTagInfo(id, window.GRAMMAR_FINE_TAGS || {});
      },
      getNonpAxis: function(item) { return module.getNonpAxis(item); },
      getQuestionPracticalGuide: function(item, focus, nonpAxis) {
        return guideModel.getQuestionPracticalGuide(item, {
          focus: focus,
          nonpAxis: nonpAxis,
          categoryMap: window.CATEGORY_MAP || {},
          categoryTips: window.CATEGORY_TIPS || {}
        });
      },
      limit: 6
    });
    var migrationPanelModel = migrationModel && migrationModel.buildMigrationPanelViewModel(migrationData, 'bank');
    var migrationContentData = migrationData && Object.assign({}, migrationData, {
      migration: migrationData.migration.map(function(entry, index) {
        return Object.assign({}, entry, {
          id: 'smoke-migration-' + index,
          sentenceHtml: '<span>smoke sentence</span>'
        });
      })
    });
    var migrationContentModel = migrationModel && migrationModel.buildMigrationContentViewModel(migrationContentData, 'bank');
    var migrationEmptyHintModel = migrationModel && migrationModel.buildMigrationEmptyHintModel({
      source: 'errors',
      focusLabel: 'Smoke Focus',
      fallbackCount: 2,
      fallbackCategoryLabel: 'Smoke Category'
    });
    var analysisMigrationCount = migrationModel && migrationModel.countAnalysisMigrationCandidates({
      exam: 'Smoke',
      no: 1,
      category: 'nonpredicate',
      nonp_form: 'doing',
      nonp_function: 'adverbial'
    }, {
      bankQuestions: [
        { exam: 'Smoke', no: 1, category: 'nonpredicate', nonp_form: 'doing', nonp_function: 'adverbial' },
        { exam: 'Smoke', no: 2, category: 'nonpredicate', nonp_form: 'doing', nonp_function: 'adverbial' },
        { exam: 'Smoke', no: 3, category: 'nonpredicate', nonp_form: 'doing', nonp_function: 'attribute' },
        { exam: 'Smoke', no: 4, category: 'predicate' }
      ],
      nonpAxis: true
    });
    var migrationEntryModel = migrationModel && migrationModel.buildMigrationEntryViewModel({
      item: { no: 3, type: '模拟题' },
      srcLabel: 'Smoke Exam',
      tagLabel: 'Smoke Tag',
      teachingLine: 'Smoke teaching line',
      isError: false
    }, 1);
    var migrationCardModel = migrationModel && migrationModel.buildMigrationCardViewModel({
      item: { no: 3, type: '真题' },
      srcLabel: 'Smoke Exam',
      tagLabel: 'Smoke Tag',
      teachingLine: 'Smoke teaching line',
      isError: false
    });
    var migrationErrorEntryModel = migrationModel && migrationModel.buildMigrationEntryViewModel({
      item: { no: 4 },
      srcLabel: '📝 我的错题',
      isError: true
    }, 0);
    var migrationErrorCardModel = migrationModel && migrationModel.buildMigrationCardViewModel({
      item: { no: 4 },
      srcLabel: '📝 我的错题',
      isError: true
    });
    var teachingGraph = (window.GRAMMAR_KNOWLEDGE_CORE && window.GRAMMAR_KNOWLEDGE_CORE.teaching_graph) || {};
    var graphIndex = viewModel && viewModel.buildGraphNodeIndex(teachingGraph, (window.GRAMMAR_KNOWLEDGE_CORE && window.GRAMMAR_KNOWLEDGE_CORE.nodes) || {});
    var relevantGraphIds = viewModel && viewModel.getGraphRelevantIds('teach_start', teachingGraph, graphIndex);
    var graphBounds = viewModel && viewModel.getGraphBoundsForNodes(relevantGraphIds, graphIndex);
    var graphTextLines = viewModel && viewModel.renderGraphTextLines('This is a long graph node label for smoke testing', 12, 2);
    var graphPreset = viewModel && viewModel.getGlobalGraphFocusPreset('verb');
    var graphPresetFocusPlan = viewModel && viewModel.buildGlobalGraphPresetFocusPlan('verb', teachingGraph, graphIndex);
    var graphNode = graphIndex && graphIndex.predicate_core;
    var graphNodeSelectionPlan = viewModel && viewModel.buildGlobalGraphNodeSelectionPlan('predicate_core', teachingGraph, graphIndex);
    var graphLabels = viewModel && viewModel.getGraphNodeLabelGroups(graphNode, {
      categoryMap: window.CATEGORY_MAP || {},
      knowledgeData: window.KNOWLEDGE_DATA || {},
      fineTags: window.GRAMMAR_FINE_TAGS || {},
      getTrapById: function(){ return { name: 'smoke trap' }; }
    });
    var graphPath = viewModel && viewModel.getGraphNodePath(graphNode, graphIndex);
    var graphQuestionMatch = viewModel && viewModel.graphNodeMatchesQuestion(
      { category_refs: [question.category], fine_refs: [question.fine_category], trap_refs: [] },
      question,
      { safeQuestionTrapId: function(){ return trapIdFromModule; } }
    );
    var graphQuestionPools = viewModel && viewModel.getGlobalGraphQuestionMatches(
      { category_refs: [question.category], fine_refs: [question.fine_category], trap_refs: [] },
      window.GRAMMAR_BANK.questions || [],
      [question],
      { safeQuestionTrapId: function(){ return trapIdFromModule; } }
    );
    var graphSearch = viewModel && viewModel.searchGraphNodes('谓语', graphIndex, {
      categoryMap: window.CATEGORY_MAP || {},
      knowledgeData: window.KNOWLEDGE_DATA || {},
      fineTags: window.GRAMMAR_FINE_TAGS || {},
      getTrapById: function(){ return null; }
    }, 12);
    var nodeCategoryLabels = viewModel && viewModel.getNodeCategoryLabels(
      { category_refs: [question.category] },
      window.CATEGORY_MAP || {},
      window.KNOWLEDGE_DATA || {}
    );
    var knowledgeModelDeps = {
      categoryMap: window.CATEGORY_MAP || {},
      knowledgeData: window.KNOWLEDGE_DATA || {},
      fineTags: window.GRAMMAR_FINE_TAGS || {},
      nodes: graphIndex,
      getTrapById: function(){ return { name: 'smoke trap' }; },
      getGraphNodeLabelGroups: viewModel && viewModel.getGraphNodeLabelGroups,
      getGraphNodePath: viewModel && viewModel.getGraphNodePath,
      getGraphNodeTypeLabel: viewModel && viewModel.getGraphNodeTypeLabel,
      getGraphTypeColor: viewModel && viewModel.getGraphTypeColor,
      getGraphNodeSize: viewModel && viewModel.getGraphNodeSize,
      graphHasFocus: viewModel && viewModel.graphHasFocus,
      graphEdgeActive: viewModel && viewModel.graphEdgeActive,
      renderGraphTextLines: viewModel && viewModel.renderGraphTextLines,
      searchGraphNodes: viewModel && viewModel.searchGraphNodes
    };
    var knowledgeMapModel = knowledgeModel && knowledgeModel.buildKnowledgeMapModel(
      window.GRAMMAR_KNOWLEDGE_CORE || {},
      knowledgeModelDeps
    );
    var firstKnowledgeMapNode = knowledgeMapModel && knowledgeMapModel.roots
      && knowledgeMapModel.roots.reduce(function(found, root) {
        return found || (root.children && root.children[0]);
      }, null);
    var knowledgeNodeDetail = knowledgeModel && knowledgeModel.buildKnowledgeNodeDetailModel({
      id: 'smoke-node',
      title: 'Smoke Node',
      desc: 'Smoke desc',
      student_goal: 'Smoke goal',
      teacher_use: 'Smoke use',
      category_refs: [question.category]
    }, knowledgeModelDeps);
    var globalGraphPageModel = knowledgeModel && knowledgeModel.buildGlobalGraphPageModel(
      teachingGraph,
      viewModel.getGlobalGraphFocusPresets(),
      { focusMode: 'verb' }
    );
    var globalGraphInspectorModel = knowledgeModel && knowledgeModel.buildGlobalGraphInspectorModel(
      graphNode,
      knowledgeModelDeps
    );
    var emptyGlobalGraphInspectorModel = knowledgeModel && knowledgeModel.buildGlobalGraphInspectorModel(null, knowledgeModelDeps);
    var dmNodes = [
      { id: 'root', type: 'diagnosis', title: '入口', decision_tip: '先看空格' },
      { id: 'a', parent: 'root', title: '有提示词', decision_tip: '看词性', category_refs: ['word'] },
      { id: 'b', parent: 'root', title: '无提示词' },
      { id: 'a1', parent: 'a', title: '动词' }
    ];
    var dmTree = knowledgeModel && knowledgeModel.buildDecisionTree(dmNodes);
    var dmStep = dmTree && knowledgeModel.buildGuidedStepModel(dmTree, 'a');
    var dmLeaf = dmTree && knowledgeModel.buildGuidedStepModel(dmTree, 'a1');
    var dmOutline = dmTree && knowledgeModel.buildDecisionOutlineModel(dmTree, ['root', 'a']);
    var dmLayout = dmTree && knowledgeModel.layoutDecisionTree(dmTree);
    var globalGraphSearchModel = knowledgeModel && knowledgeModel.buildGlobalGraphSearchModel(
      '谓语',
      graphIndex,
      knowledgeModelDeps,
      { limit: 12 }
    );
    var emptyGlobalGraphSearchModel = knowledgeModel && knowledgeModel.buildGlobalGraphSearchModel(
      'not-a-real-global-graph-node',
      graphIndex,
      knowledgeModelDeps,
      { limit: 12 }
    );
    var globalGraphSvgModel = knowledgeModel && knowledgeModel.buildGlobalGraphSvgModel(
      teachingGraph,
      graphIndex,
      {
        scale: 1,
        tx: 10,
        ty: 20,
        selectedId: 'teach_start',
        focusIds: relevantGraphIds
      },
      knowledgeModelDeps
    );
    var sidebarExamGroups = sidebarModel && sidebarModel.groupExamsByYear(window.GRAMMAR_BANK.exams || [], exam.exam_id);
    var examGrid = examGridModel && examGridModel.buildExamGridModel([
      { exam_id: '2025-smoke', year: 2025, type: '真题', blank_count: 10 },
      { exam_id: '2026-smoke', year: 2026, type: '模拟卷', questions: [{}, {}] },
      { exam_id: 'unknown-smoke', type: '模拟题', questions: [{}] }
    ]);
    var examYearCollapsePlan = examGridModel && examGridModel.buildExamYearTogglePlan('');
    var examYearExpandPlan = examGridModel && examGridModel.buildExamYearTogglePlan('none');
    var classroomSwitcher = classroomSwitcherModel && classroomSwitcherModel.buildClassroomSwitcherModel({
      currentExam: { mode: 'exam', examId: exam.exam_id, source: exam.exam_id },
      currentQuestions: examState.currentQuestions,
      currentQuestionIndex: 2,
      orderedExams: [exam],
      categoryMap: window.CATEGORY_MAP || {},
      showAnswers: true
    });
    var classroomExamIndex = classroomSwitcherModel && classroomSwitcherModel.getCurrentExamIndex(
      { mode: 'exam', examId: 'smoke-b' },
      [{ exam_id: 'smoke-a' }, { exam_id: 'smoke-b' }]
    );
    var classroomExamNavPlan = classroomSwitcherModel && classroomSwitcherModel.buildExamNavigationPlan(
      { mode: 'exam', examId: 'smoke-b' },
      [{ exam_id: 'smoke-a' }, { exam_id: 'smoke-b' }],
      1
    );
    var classroomExamNavBlocked = classroomSwitcherModel && classroomSwitcherModel.buildExamNavigationPlan(
      { mode: 'prep', source: 'Smoke Prep' },
      [{ exam_id: 'smoke-a' }],
      1
    );
    var classroomExamSelectPlan = classroomSwitcherModel && classroomSwitcherModel.buildExamSelectPlan(
      { mode: 'exam', examId: 'smoke-a' },
      'smoke-b'
    );
    var classroomExamSelectNoop = classroomSwitcherModel && classroomSwitcherModel.buildExamSelectPlan(
      { mode: 'exam', examId: 'smoke-a' },
      'smoke-a'
    );
    var classroomQuestionSelectPlan = classroomSwitcherModel && classroomSwitcherModel.buildQuestionSelectPlan(
      [{ no: 1 }, { no: 2 }],
      '1'
    );
    var classroomQuestionSelectInvalid = classroomSwitcherModel && classroomSwitcherModel.buildQuestionSelectPlan(
      [{ no: 1 }],
      '99'
    );
    var classroomQuestionNavPlan = classroomSwitcherModel && classroomSwitcherModel.buildQuestionNavigationPlan(
      [{ no: 1 }, { no: 2 }],
      1,
      1
    );
    var classroomQuestionNavInitial = classroomSwitcherModel && classroomSwitcherModel.buildQuestionNavigationPlan(
      [{ no: 1 }, { no: 2 }],
      -1,
      -1
    );
    var localClassroomSwitcher = classroomSwitcherModel && classroomSwitcherModel.buildClassroomSwitcherModel({
      currentExam: { mode: 'prep', source: 'Smoke Prep' },
      currentQuestions: [question],
      currentQuestionIndex: 0,
      orderedExams: [exam],
      categoryMap: window.CATEGORY_MAP || {},
      showAnswers: false
    });
    var practiceHeader = practiceViewModel && practiceViewModel.buildPracticeHeaderModel(
      { source: 'Smoke Source' },
      examState.currentQuestions
    );
    var toggleChineseModel = practiceViewModel && practiceViewModel.buildToggleModel(true, true);
    var practiceShell = practiceViewModel && practiceViewModel.buildPracticeShellModel(
      { source: 'Smoke Source', mode: 'exam' },
      examState.currentQuestions,
      false,
      false
    );
    var chinesePracticeShell = practiceViewModel && practiceViewModel.buildPracticeShellModel(
      { source: 'Smoke Source', mode: 'exam' },
      examState.currentQuestions,
      true,
      true
    );
    var storedChinese = practiceViewModel && practiceViewModel.buildChinesePassageModel(
      { mode: 'exam', chinese_translation: '第一段。\n\n第二段。' },
      examState.currentQuestions,
      {}
    );
    var categoryChinese = practiceViewModel && practiceViewModel.getStoredChineseText(
      { mode: 'category' },
      [{ exam_id: exam.exam_id }],
      questionModel.buildExamsById(window.GRAMMAR_BANK)
    );
    var filledPassage = practiceViewModel && practiceViewModel.getPracticePassageText(
      { mode: 'exam', passage: 'Students ___1___ grammar.' },
      [{ no: 1, answer: 'learn' }],
      true
    );
    var categoryGroups = practiceViewModel && practiceViewModel.groupCategoryQuestionsByExam([
      { exam: 'Smoke A', no: 1 },
      { exam: 'Smoke B', no: 2 },
      { exam: 'Smoke A', no: 3 }
    ]);
    var categoryHint = practiceViewModel && practiceViewModel.getCategoryPracticeHint([{ no: 1 }, { no: 2 }]);
    var passageSource = practiceViewModel && practiceViewModel.getPassageSource(
      { mode: 'exam', passage: 'Main passage.' },
      [{ passage: 'Fallback passage.' }]
    );
    var passageParagraphs = practiceViewModel && practiceViewModel.splitPassageParagraphs('A paragraph.\n\nB paragraph.');
    var sequentialModel = practiceViewModel && practiceViewModel.buildSequentialPassageModel(
      { mode: 'exam', passage: 'Students ___1___ grammar.' },
      [{ no: 1 }, { no: 2 }, { no: 3 }],
      1
    );
    var practiceBodyKindChinese = practiceViewModel && practiceViewModel.getPracticeBodyKind({ mode: 'exam' }, true);
    var practiceBodyKindError = practiceViewModel && practiceViewModel.getPracticeBodyKind({ mode: 'error' }, false);
    var practiceBodyKindSequential = practiceViewModel && practiceViewModel.getPracticeBodyKind({ mode: 'prep' }, false);
    var answerSlotModel = practiceViewModel && practiceViewModel.buildBlankSlotModel({ no: 1, answer: 'learn' }, 0, '1', true);
    var blankSlotModel = practiceViewModel && practiceViewModel.buildBlankSlotModel({ no: 2, answer: 'prepare' }, 3, '55', false);
    var unmatchedWarningModel = practiceViewModel && practiceViewModel.buildUnmatchedBlankWarningModel([
      { question: { no: 2 }, index: 1 },
      { question: { no: 3 }, index: 2 }
    ]);
    var questionNoNavPlan = practiceViewModel && practiceViewModel.buildQuestionNoNavigationPlan([
      { no: 1 },
      { no: 2 }
    ], '2');
    var missingQuestionNoNavPlan = practiceViewModel && practiceViewModel.buildQuestionNoNavigationPlan([
      { no: 1 }
    ], '9');
    var categoryJumpPlan = practiceViewModel && practiceViewModel.buildCategoryJumpPlan([
      { category: 'predicate' },
      { category: 'logic' }
    ], 'logic');
    var missingCategoryJumpPlan = practiceViewModel && practiceViewModel.buildCategoryJumpPlan([
      { category: 'predicate' }
    ], 'logic');
    var replacedBlank = practiceViewModel && practiceViewModel.replaceBlankMarker(
      'Students ___2___ grammar.',
      2,
      '<span>learn</span>'
    );
    var categoryPractice = practiceViewModel && practiceViewModel.buildCategoryPracticeModel([
      { exam: 'Smoke A', no: 1, answer: 'learn', passage: 'Students ___1___ grammar.' }
    ], {
      extractSentence: function(text) { return text; }
    });
    var sequentialReplacement = practiceViewModel && practiceViewModel.applySequentialBlankReplacements(
      { mode: 'exam', passage: 'Students ___1___ grammar. Teachers ___2___ lessons.' },
      [{ no: 1, answer: 'learn' }, { no: 2, answer: 'prepare' }, { no: 3, answer: 'review' }],
      function(question, index) { return '[' + index + ':' + question.answer + ']'; }
    );
    var sidebarCategoryItems = sidebarModel && sidebarModel.buildCategoryItems(
      window.CATEGORY_MAP || {},
      window.GRAMMAR_BANK.questions || [],
      question.category
    );
    var sidebarErrorGroups = sidebarModel && sidebarModel.buildErrorCategoryGroups([question], window.CATEGORY_MAP || {}, question.id);
    var sidebarPrepItems = sidebarModel && sidebarModel.buildPrepItems([{ id: 'prep-smoke', title: 'Smoke Prep', blanks: [question] }], 'prep-smoke');
    var homeCategoryModel = categoryRules && categoryRules.buildHomeCategoryModel(window.GRAMMAR_BANK.questions || []);
    var homeCategoryCounts = categoryRules && categoryRules.countQuestionsByCategory(window.GRAMMAR_BANK.questions || []);
    var categoryEntryModel = categoryRules && categoryRules.buildCategoryPracticeEntryModel(
      question.category,
      [question],
      window.CATEGORY_MAP || {}
    );
    var selectedCategoryQuestions = categoryRules && categoryRules.selectCategoryQuestions([
      { category: 'predicate', no: 1 },
      { category: 'logic', no: 2 },
      { category: 'predicate', no: 3 }
    ], 'predicate');
    var categoryPracticePlan = categoryRules && categoryRules.buildCategoryPracticePlan('predicate', [
      { category: 'predicate', no: 1 },
      { category: 'logic', no: 2 }
    ], window.CATEGORY_MAP || {});
    var emptyCategoryEntryModel = categoryRules && categoryRules.buildCategoryPracticeEntryModel(
      'missing-category',
      [],
      window.CATEGORY_MAP || {}
    );
    var pageSidebarModel = sidebarModel && sidebarModel.buildPageSidebarModel('home', {
      homeView: 'categories',
      categoryMap: window.CATEGORY_MAP || {},
      allQuestions: window.GRAMMAR_BANK.questions || []
    });
    var hiddenHomeSidebar = sidebarModel && sidebarModel.buildPageSidebarModel('home', {
      homeView: 'cards',
      dashboardVisible: true
    });
    var contextSidebarModel = sidebarModel && sidebarModel.buildContextSidebarModel({
      currentExam: { mode: 'exam', examId: exam.exam_id },
      exams: window.GRAMMAR_BANK.exams || {}
    });
    var newUserDashboard = homeModel && homeModel.buildDashboardModel({
      prepCount: 0,
      errorCount: 0,
      hour: 9,
      textbookUnits: window.GRAMMAR_FINE_TAGS && window.GRAMMAR_FINE_TAGS.textbook_units
    });
    var activeDashboard = homeModel && homeModel.buildDashboardModel({
      prepCount: 2,
      errorCount: 3,
      hour: 19,
      textbookUnits: window.GRAMMAR_FINE_TAGS && window.GRAMMAR_FINE_TAGS.textbook_units
    });
    var modulesGreetingLate = homeModel && homeModel.getModulesGreeting(23);
    var modulesGreetingWithName = homeModel && homeModel.buildModulesGreetingText('Smoke Teacher', 10);
    var modulesGreetingNoName = homeModel && homeModel.buildModulesGreetingText('', 14);
    var homeSummary = homeModel && homeModel.buildHomeSummaryModel({
      examCount: 2,
      questionCount: 20,
      errorCount: 3,
      prepCount: 4
    });
    var uploadActionPlan = homeModel && homeModel.buildDashboardActionExecutionPlan({
      type: 'upload-word',
      value: 'lesson-prep'
    });
    var switchActionPlan = homeModel && homeModel.buildDashboardActionExecutionPlan({
      type: 'switch-page',
      value: 'knowledge'
    });
    var textbookActionPlan = homeModel && homeModel.buildDashboardActionExecutionPlan({
      type: 'open-textbook',
      value: '必修一'
    });
    var unknownActionPlan = homeModel && homeModel.buildDashboardActionExecutionPlan({
      type: 'unknown',
      value: 'x'
    });
    var categoryStatsModel = knowledgeModel && knowledgeModel.buildCategoryStatsModel(
      { mode: 'exam' },
      examState.currentQuestions,
      window.CATEGORY_MAP || {}
    );
    var knowledgeSearchIndex = knowledgeModel && knowledgeModel.buildSearchIndex(
      window.KNOWLEDGE_DATA || {},
      window.PATTERN_DATA || {}
    );
    var knowledgeSearch = knowledgeModel && knowledgeModel.searchKnowledgeIndex(knowledgeSearchIndex, '谓语', { limit: 5 });
    var knowledgeSearchPanel = knowledgeModel && knowledgeModel.buildKnowledgeSearchPanelModel(knowledgeSearchIndex, '谓语', { limit: 5 });
    var emptyKnowledgeSearchPanel = knowledgeModel && knowledgeModel.buildKnowledgeSearchPanelModel(knowledgeSearchIndex, 'not-a-real-grammar-key', { limit: 5 });
    var inactiveKnowledgeSearchPanel = knowledgeModel && knowledgeModel.buildKnowledgeSearchPanelModel(knowledgeSearchIndex, '   ', { limit: 5 });
    var overflowKnowledgeSearchPanel = knowledgeModel && knowledgeModel.buildKnowledgeSearchPanelModel([
      { cat: '谓语一', catKey: 'a', subKey: '', subTitle: '', text: '谓语', searchText: '谓语', isPattern: false },
      { cat: '谓语二', catKey: 'b', subKey: 'sub-b', subTitle: '子项', text: '谓语', searchText: '谓语', isPattern: true }
    ], '谓语', { limit: 1 });
    var knowledgeSearchReset = knowledgeModel && knowledgeModel.buildKnowledgeSearchResetModel();
    var knowledgeSubsectionPlan = knowledgeModel && knowledgeModel.buildKnowledgeSubsectionFocusPlan('smoke-sub');
    var knowledgeSubsectionToggleOpen = knowledgeModel && knowledgeModel.buildKnowledgeSubsectionTogglePlan('smoke-sub', true);
    var knowledgeSubsectionToggleClose = knowledgeModel && knowledgeModel.buildKnowledgeSubsectionTogglePlan('smoke-sub', false);
    var emptyKnowledgeSubsectionPlan = knowledgeModel && knowledgeModel.buildKnowledgeSubsectionFocusPlan('');
    var emptyKnowledgeSubsectionToggle = knowledgeModel && knowledgeModel.buildKnowledgeSubsectionTogglePlan('', true);
    var knowledgeNavigationPlan = knowledgeModel && knowledgeModel.buildKnowledgeNavigationPlan('predicate', 'verb-tense', true);
    var globalGraphSearchReset = knowledgeModel && knowledgeModel.buildGlobalGraphSearchResetModel();
    var knowledgeSidebarModel = knowledgeModel && knowledgeModel.buildKnowledgeSidebarModel(
      window.KNOWLEDGE_DATA || {},
      window.PATTERN_DATA || {}
    );
    var firstKnowledgeKey = Object.keys(window.KNOWLEDGE_DATA || {})[0];
    var firstPatternKey = Object.keys(window.PATTERN_DATA || {})[0];
    var knowledgeBookContentModel = knowledgeModel && knowledgeModel.buildKnowledgeBookContentModel(
      firstKnowledgeKey,
      false,
      window.KNOWLEDGE_DATA || {},
      window.PATTERN_DATA || {}
    );
    var knowledgePatternContentModel = knowledgeModel && knowledgeModel.buildKnowledgeBookContentModel(
      firstPatternKey,
      true,
      window.KNOWLEDGE_DATA || {},
      window.PATTERN_DATA || {}
    );
    var knowledgeViewChrome = knowledgeModel && knowledgeModel.buildKnowledgeViewChromeModel('book', {
      currentKey: firstKnowledgeKey,
      knowledgeData: window.KNOWLEDGE_DATA || {}
    });
    var fallbackKnowledgeViewChrome = knowledgeModel && knowledgeModel.buildKnowledgeViewChromeModel('unknown-view', {
      knowledgeData: window.KNOWLEDGE_DATA || {}
    });
    var fineCategoryModel = knowledgeModel && knowledgeModel.buildFineCategoryModel(
      window.GRAMMAR_FINE_TAGS || {},
      window.GRAMMAR_BANK.questions || [],
      [question]
    );
    var fineCategoryViewModel = knowledgeModel && knowledgeModel.buildFineCategoryViewModel(
      window.GRAMMAR_FINE_TAGS || {},
      window.GRAMMAR_BANK.questions || [],
      [question]
    );
    var fineCategoryLegend = knowledgeModel && knowledgeModel.buildFineCategoryLegendModel();
    var fineCategoryTagMessage = knowledgeModel && knowledgeModel.buildFineCategoryTagMessage({
      name: '主谓一致',
      source: '语法通霸 15',
      counts: { bank: 2, error: 1 }
    });
    var textbookModel = knowledgeModel && knowledgeModel.buildTextbookModel(
      window.GRAMMAR_FINE_TAGS || {},
      window.GRAMMAR_BANK.questions || [],
      [question]
    );
    var textbookViewModel = knowledgeModel && knowledgeModel.buildTextbookViewModel(
      window.GRAMMAR_FINE_TAGS || {},
      window.GRAMMAR_BANK.questions || [],
      [question],
      'list'
    );
    var textbookModeToggle = knowledgeModel && knowledgeModel.buildTextbookModeToggleModel('list');
    var textbookModalModel = textbookModel && textbookModel.books && knowledgeModel && knowledgeModel.buildTextbookModalModel(textbookModel.books[0]);
    var textbookModalViewModel = textbookModel && textbookModel.books && knowledgeModel && knowledgeModel.buildTextbookModalViewModel(textbookModel.books[0]);
    var textbookModalOpenGalleryPlan = textbookModel && textbookModel.books && knowledgeModel && knowledgeModel.buildTextbookModalOpenPlan(
      textbookModel.books[0].book,
      'gallery',
      textbookModel.booksById
    );
    var textbookModalOpenListPlan = textbookModel && textbookModel.books && knowledgeModel && knowledgeModel.buildTextbookModalOpenPlan(
      textbookModel.books[0].book,
      'list',
      textbookModel.booksById
    );
    var firstTextbookUnit = textbookModel && textbookModel.books
      && textbookModel.books.reduce(function(found, book) {
        return found || (book.units && book.units.find(function(unit) { return unit.tagIds && unit.tagIds.length; }));
      }, null);
    var unitQuestionList = knowledgeModel && knowledgeModel.buildUnitQuestionListModel(
      { unitLabel: firstTextbookUnit && firstTextbookUnit.unitLabel, tagIds: firstTextbookUnit && firstTextbookUnit.tagIds, source: 'bank', filter: 'all' },
      window.GRAMMAR_BANK.questions || [],
      [question],
      { limit: 3 }
    );
    var unitQuestionModalModel = knowledgeModel && knowledgeModel.buildUnitQuestionModalViewModel(
      { unitLabel: firstTextbookUnit && firstTextbookUnit.unitLabel, tagIds: firstTextbookUnit && firstTextbookUnit.tagIds, source: 'bank', filter: 'all' },
      window.GRAMMAR_BANK.questions || [],
      [question],
      { limit: 3 }
    );
    var unitQuestionListOpenPlan = knowledgeModel && knowledgeModel.buildUnitQuestionListOpenPlan(
      'Smoke Unit',
      [question.fine_category],
      'bank'
    );
    var unitErrorListOpenPlan = knowledgeModel && knowledgeModel.buildUnitQuestionListOpenPlan(
      'Smoke Error Unit',
      [question.fine_category],
      'errors'
    );
    var unitQuestionFilterChangePlan = knowledgeModel && knowledgeModel.buildUnitQuestionFilterChangePlan(
      unitQuestionListOpenPlan && unitQuestionListOpenPlan.context,
      '模拟'
    );
    var emptyUnitQuestionFilterChangePlan = knowledgeModel && knowledgeModel.buildUnitQuestionFilterChangePlan(null, '模拟');
    var unitQuestionBankNavigationPlan = knowledgeModel && knowledgeModel.buildUnitQuestionNavigationPlan({
      examId: exam && exam.exam_id,
      no: question.no,
      source: 'bank',
      autoProjection: true
    }, { unitLabel: 'Smoke Unit', tagIds: [question.fine_category], source: 'bank', filter: '模拟' });
    var unitQuestionErrorNavigationPlan = knowledgeModel && knowledgeModel.buildUnitQuestionNavigationPlan({
      examId: '',
      no: question.no,
      source: 'errors',
      autoProjection: false
    }, { unitLabel: 'Smoke Error Unit', tagIds: [question.fine_category], source: 'errors', filter: '真题' });
    var unitDrawerReturnPlan = knowledgeModel && knowledgeModel.buildUnitQuestionDrawerReturnPlan({
      type: 'unit-question-list',
      context: { unitLabel: firstTextbookUnit && firstTextbookUnit.unitLabel, tagIds: firstTextbookUnit && firstTextbookUnit.tagIds, source: 'bank', filter: 'all' }
    }, (window.GRAMMAR_FINE_TAGS && window.GRAMMAR_FINE_TAGS.textbook_units) || []);
    var missingUnitDrawerReturnPlan = knowledgeModel && knowledgeModel.buildUnitQuestionDrawerReturnPlan({
      type: 'unit-question-list',
      context: { unitLabel: 'Missing Unit', tagIds: [question.fine_category], source: 'bank' }
    }, (window.GRAMMAR_FINE_TAGS && window.GRAMMAR_FINE_TAGS.textbook_units) || []);
    var emptyDrawerReturnPlan = knowledgeModel && knowledgeModel.buildUnitQuestionDrawerReturnPlan({
      type: 'other',
      context: null
    }, (window.GRAMMAR_FINE_TAGS && window.GRAMMAR_FINE_TAGS.textbook_units) || []);
    var unitFilterChips = knowledgeModel && knowledgeModel.buildUnitFilterChips('bank', '模拟', {
      real: 2,
      mock: 1,
      all: 3
    });
    var unitQuestionItemModel = knowledgeModel && knowledgeModel.buildUnitQuestionItemModel({
      id: 'err_smoke',
      exam: '错题本',
      no: 1,
      answer: 'learn',
      type: '真题',
      analysis: 'a'.repeat(120)
    }, 'errors');
    var parsedErrorBatchJson = savedModel && savedModel.parseBatchImportJson('[{"answer":"learn"}]', 'error');
    var parsedEmptyBatchJson = savedModel && savedModel.parseBatchImportJson('[]', 'prep');
    var parsedErrorBadJson = savedModel && savedModel.parseBatchImportJson('{bad', 'error');
    var parsedPrepBadJson = savedModel && savedModel.parseBatchImportJson('{bad', 'prep');
    var errorImport = savedModel && savedModel.importErrorItems([
      {
        passage: 'Students ___1___(learn) grammar.',
        no: 1,
        answer: 'learn',
        category: 'predicate',
        analysis: '主语 Students 为复数。'
      },
      {
        passage: 'Students ___1___(learn) grammar.',
        no: 1,
        answer: 'learn',
        category: 'predicate'
      },
      { answer: 'bad', category: 'predicate' }
    ], [], {
      categoryMap: window.CATEGORY_MAP || {},
      categoryTips: window.CATEGORY_TIPS || {},
      extractSentence: function(text) { return text; },
      now: 1,
      createdAt: '2026-05-28T00:00:00.000Z'
    });
    var errorListModel = savedModel && savedModel.buildErrorListModel(errorImport.imported, window.CATEGORY_MAP || {}, {
      bulkMode: true
    });
    var emptyErrorListModel = savedModel && savedModel.buildErrorListModel([], window.CATEGORY_MAP || {});
    var errorImportMessage = savedModel && savedModel.buildImportResultMessage(errorImport, 'error');
    var errorBatchFormConfig = savedModel && savedModel.getBatchImportFormConfig('error');
    var errorBatchFormOpenPlan = savedModel && savedModel.buildBatchImportFormTogglePlan('error', false);
    var prepBatchFormClosePlan = savedModel && savedModel.buildBatchImportFormTogglePlan('prep', true, false);
    var errorPracticeEntryPlan = savedModel && savedModel.buildSavedMaterialPracticeEntryPlan('error', errorImport.imported[0], {
      preserveDrawerReturn: true
    });
    var missingPracticeEntryPlan = savedModel && savedModel.buildSavedMaterialPracticeEntryPlan('prep', null);
    var errorBulkDomConfig = savedModel && savedModel.getBulkSelectionDomConfig('error');
    var prepBulkInfoPlan = savedModel && savedModel.buildBulkSelectionInfoPlan('prep', 3);
    var errorSelectAllPlan = savedModel && savedModel.buildBulkSelectAllPlan('error', true);
    var bulkModeToggled = savedModel && savedModel.buildBulkModeState(false);
    var bulkModeForced = savedModel && savedModel.buildBulkModeState(true, false);
    var errorBulkInfo = savedModel && savedModel.buildBulkSelectionInfo(2, 'error');
    var prepBulkInfo = savedModel && savedModel.buildBulkSelectionInfo(3, 'prep');
    var bulkDeletePlan = savedModel && savedModel.buildBulkDeletePlan([
      { id: 'a' }, { id: 'b' }, { id: 'c' }
    ], ['b', 'c', 'c']);
    var singleDeletePlan = savedModel && savedModel.buildSingleDeletePlan([
      { id: 'a' }, { id: 'b' }
    ], 'b');
    var savedDeletePlan = savedModel && savedModel.buildSavedMaterialDeletePlan('prep', [
      { id: 'a' }, { id: 'b' }, { id: 'c' }
    ], ['b', 'c', 'c'], { bulk: true });
    var emptySavedDeletePlan = savedModel && savedModel.buildSavedMaterialDeletePlan('error', [
      { id: 'a' }
    ], [], { bulk: true });
    var cloudDeleteFailure = savedModel && savedModel.buildCloudDeleteFailure('b', { message: 'network down' }, 'prep');
    var cloudDeleteFailureSummary = savedModel && savedModel.buildCloudDeleteFailureSummary('prep', [
      cloudDeleteFailure,
      { id: 'c', message: 'timeout' }
    ]);
    var emptyCloudDeleteFailureSummary = savedModel && savedModel.buildCloudDeleteFailureSummary('error', []);
    var cloudSyncDiffPlan = savedModel && savedModel.buildCloudSyncDiffPlan([
      { id: 'a' }, { id: 'b' }
    ], [
      { id: 'a' }, { id: 'stale' }
    ]);
    var savedCloudSyncPlan = savedModel && savedModel.buildSavedMaterialsCloudSyncPlan('error', [
      { id: 'a' }, { id: 'b' }
    ], [
      { id: 'a' }, { id: 'stale' }
    ]);
    var savedCloudSyncRunPlan = savedModel && savedModel.buildSavedMaterialsCloudSyncRunPlan('lesson-prep', [
      { id: 'prep-a' }
    ]);
    var savedCloudSyncCleanupPlan = savedModel && savedModel.buildSavedMaterialsCloudSyncCleanupPlan('error', [
      { id: 'a' }
    ], [
      { id: 'a' }, { id: 'stale' }
    ]);
    var savedCloudSyncFailurePlan = savedModel && savedModel.buildSavedMaterialsCloudSyncFailurePlan('prep', { message: 'write down' });
    var savedSingleDeleteFailurePlan = savedModel && savedModel.buildSavedMaterialCloudDeleteFailurePlan('error', 'id-1', { message: 'disk full' });
    var localCloudUploadPlan = savedModel && savedModel.buildLocalCloudUploadPlan([
      { id: 'err-a' }
    ], [
      { id: 'prep-a' }, { id: 'prep-b' }
    ]);
    var localCloudUploadFailurePlan = savedModel && savedModel.buildLocalCloudUploadFailurePlan({ message: 'write down' });
    var localCloudUploadPullResultPlan = savedModel && savedModel.buildLocalCloudUploadPullResultPlan(
      [{ id: 'err-cloud' }],
      null,
      [{ id: 'err-local' }],
      [{ id: 'prep-local' }],
      localCloudUploadPlan
    );
    var cloudPullResultPlan = savedModel && savedModel.buildCloudPullResultPlan([
      { id: 'err-a' }
    ], [
      { id: 'prep-a' }, { id: 'prep-b' }
    ]);
    var emptyCloudPullResultPlan = savedModel && savedModel.buildCloudPullResultPlan(null, null);
    var cloudPullFailurePlan = savedModel && savedModel.buildCloudPullFailurePlan({ message: 'read down' });
    var emptyErrorSelectionMessage = savedModel && savedModel.getEmptySelectionMessage('error');
    var singlePrepDeleteConfirm = savedModel && savedModel.getSingleDeleteConfirmMessage('prep');
    var bulkPrepDeleteConfirm = savedModel && savedModel.getBulkDeleteConfirmMessage(2, 'prep');
    var cloudDeleteFailedMessage = savedModel && savedModel.getCloudDeleteFailedMessage({ message: 'network down' }, 'error');
    var localCloudMigrationPrompt = savedModel && savedModel.buildLocalCloudMigrationConfirmMessage(2, 3);
    var localCloudUploadSuccess = savedModel && savedModel.buildLocalCloudUploadSuccessMessage(2, 3);
    var cloudPullFailedAlert = savedModel && savedModel.buildCloudPullFailedAlertMessage({ message: 'read down' });
    var cloudUploadFailedAlert = savedModel && savedModel.buildCloudUploadFailedAlertMessage({ message: 'write down' });
    var prepImport = savedModel && savedModel.importPrepItems([
      {
        title: 'Smoke Prep Import',
        passage: 'Students ___1___(learn) grammar.',
        blanks: [{ no: 1, answer: 'learn', category: 'predicate', analysis: '一般现在时。' }]
      },
      {
        title: 'Smoke Prep Import',
        passage: 'Students ___1___(learn) grammar.',
        blanks: [{ no: 1, answer: 'learn', category: 'predicate' }]
      },
      { title: 'Bad prep' }
    ], [], {
      now: 2,
      createdAt: '2026-05-28T00:00:00.000Z'
    });
    var prepImportMessage = savedModel && savedModel.buildImportResultMessage(prepImport, 'prep');
    var prepListModel = savedModel && savedModel.buildPrepListModel(prepImport.imported, window.CATEGORY_MAP || {}, {
      bulkMode: true
    });
    var emptyPrepListModel = savedModel && savedModel.buildPrepListModel([], window.CATEGORY_MAP || {});
    var prepState = savedModel && savedModel.createPrepStateForPassage(prepImport.imported[0], window.CATEGORY_MAP || {}, window.CATEGORY_TIPS || {});
    var unifiedSamplePassages = [{
      title: 'Smoke Unified Lesson',
      passage: 'Students ___1___(learn) grammar.',
      blanks: [{ no: 1, answer: 'learn', category: 'predicate', analysis: 'a'.repeat(80) }]
    }];
    var unifiedCollectionPassages = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function(i) {
      return {
        title: 'Smoke Collection ' + i,
        passage: 'Students ___1___(learn) grammar.',
        blanks: [{ no: 1, answer: 'learn', category: 'predicate' }]
      };
    });
    var unifiedPrepPanel = savedModel && savedModel.buildUnifiedImportPanelModel(unifiedSamplePassages, 'prep', window.CATEGORY_MAP || {});
    var unifiedErrorPanel = savedModel && savedModel.buildUnifiedImportPanelModel(unifiedSamplePassages, 'error', window.CATEGORY_MAP || {});
    var unifiedSummaryText = savedModel && savedModel.buildUnifiedImportSummaryText(unifiedSamplePassages);
    var unifiedSelectedText = savedModel && savedModel.buildUnifiedSelectedCountText(2);
    var unifiedLongPanel = savedModel && savedModel.buildUnifiedImportPanelModel(unifiedCollectionPassages, 'prep', window.CATEGORY_MAP || {});
    var unifiedCompletePrepMessage = savedModel && savedModel.buildUnifiedImportCompleteMessage({
      prepCount: 1,
      prepSkip: 1,
      errorCount: 2,
      errorSkip: 1
    }, 'prep');
    var unifiedCompleteErrorMessage = savedModel && savedModel.buildUnifiedImportCompleteMessage({
      errorCount: 2,
      errorSkip: 1
    }, 'error');
    var unifiedConfirmPrepPlan = savedModel && savedModel.buildUnifiedImportConfirmPlan(unifiedSamplePassages, 'prep', [
      { passageIndex: 0, blankIndex: 0 },
      { passageIndex: 9, blankIndex: 0 }
    ]);
    var unifiedConfirmErrorPlan = savedModel && savedModel.buildUnifiedImportConfirmPlan(unifiedSamplePassages, 'error', [
      { passage: '0', blank: '0' }
    ]);
    var deepSeekPrepPlan = savedModel && savedModel.buildDeepSeekPrepImportPlan({
      title: 'Smoke DeepSeek Prep',
      passage: 'Students ___1___(learn) grammar.',
      blanks: [{ no: 1, answer: 'learn', category: 'predicate', analysis: '主谓一致。' }]
    }, [], {
      createdAt: '2026-05-28T00:00:00.000Z'
    });
    var deepSeekPrepDuplicatePlan = savedModel && savedModel.buildDeepSeekPrepImportPlan({
      title: 'Smoke DeepSeek Prep',
      passage: 'Students ___1___(learn) grammar.',
      blanks: [{ no: 1, answer: 'learn', category: 'predicate', analysis: '主谓一致。' }]
    }, deepSeekPrepPlan ? deepSeekPrepPlan.imported : [], {
      createdAt: '2026-05-28T00:00:00.000Z'
    });
    var deepSeekErrorPlan = savedModel && savedModel.buildDeepSeekErrorImportPlan({
      title: 'Smoke DeepSeek Error',
      passage: 'Students ___1___(learn) grammar. They ___2___(use) it.',
      blanks: [
        { no: 1, answer: 'learn', category: 'predicate', analysis: '重复。' },
        { no: 2, answer: 'use', category: 'predicate', analysis: '新增。' }
      ]
    }, [{
      id: 'existing_err',
      no: 1,
      answer: 'learn',
      category: 'predicate'
    }], {
      categoryMap: window.CATEGORY_MAP || {},
      categoryTips: window.CATEGORY_TIPS || {},
      extractSentence: function(text, no) { return 'sentence ' + no + ' from ' + text; },
      createdAt: '2026-05-28T00:00:00.000Z'
    });
    var wordInitialProgress = savedModel && savedModel.buildWordImportInitialProgressModel();
    var wordLargeConfirm = savedModel && savedModel.buildWordImportLargeFileConfirmMessage(26000);
    var wordSplitProgress = savedModel && savedModel.buildWordImportSplitProgressModel(26000, 3, true);
    var wordChunkProgress = savedModel && savedModel.buildWordImportChunkProgressModel(26000, 3, 2);
    var wordCompleteProgress = savedModel && savedModel.buildWordImportCompletionProgressModel(26000, 3, unifiedSamplePassages);
    var wordFailedAlert = savedModel && savedModel.buildWordImportFailedAlertMessage({ message: 'bad docx' });
    var importModuleMissing = savedModel && savedModel.getImportModuleMissingMessage();
    var wordModuleMissing = savedModel && savedModel.getWordImportModuleMissingMessage();
    var wordTooShortMessage = savedModel && savedModel.getWordImportTooShortMessage();
    var wordNoSegmentsMessage = savedModel && savedModel.getWordImportNoSegmentsMessage();
    var aiLoginRequiredMessage = savedModel && savedModel.getAiParseLoginRequiredMessage();
    var aiNoPassagesMessage = savedModel && savedModel.getAiParseNoPassagesMessage();
    var rawTextFallbackInserted = savedModel && savedModel.getRawTextFallbackInsertedMessage();
    var docxOnlyMessage = savedModel && savedModel.getDocxOnlyMessage();
    var aiFallbackConfirm = savedModel && savedModel.buildAiParseFailedFallbackConfirmMessage({ message: 'bad ai' });
    var aiNetworkTimeout = savedModel && savedModel.buildAiParseNetworkErrorMessage({ name: 'AbortError', message: 'timeout' });
    var aiNetworkFailed = savedModel && savedModel.buildAiParseNetworkErrorMessage({ message: 'offline' });
    var aiHttpJsonError = savedModel && savedModel.buildAiParseHttpErrorModel({ error: 'AI 返回的内容无法解析为 JSON。' }, 502);
    var aiHttpFormatError = savedModel && savedModel.buildAiParseHttpErrorModel({ error: 'AI 返回的数据格式不正确。' }, 422);
    var aiHttpFallbackError = savedModel && savedModel.buildAiParseHttpErrorModel({}, 503);
    var normalizedWordText = wordImportModel && wordImportModel.normalizeImportText(
      'A' + String.fromCharCode(13, 10) + 'B' + String.fromCharCode(160)
    );
    var titleRecognized = wordImportModel && wordImportModel.isPassageTitle('01 浙江省语法填空');
    var normalizedMarker = wordImportModel && wordImportModel.normalizeBlankMarkers('Students __ 1 __ learn.');
    var extractedNos = wordImportModel && wordImportModel.extractBlankNos('___1___ ___2___ ___1___');
    var extractedAnswers = wordImportModel && wordImportModel.extractAnswersFromChunk('【答案】1. learn 2. using【解析】');
    var fallbackBlanks = wordImportModel && wordImportModel.buildFallbackBlanks('Students ___1___ grammar.', { 1: 'learn' });
    var docxBatchPlan = wordImportModel && wordImportModel.buildDocxBatchPlan(
      '01 浙江省语法填空\\n' + 'Students ___1___ grammar. '.repeat(20) + '\\n【答案】1. learn\\n【解析】',
      { maxBatchChunks: 5 }
    );
    var fullPaperFixture = [
      '2026 高三模拟英语试题',
      '第三部分 语言运用（共两节，满分30分）',
      '第一节（完形填空）阅读下面短文，从A、B、C、D四个选项中选出最佳选项。',
      'My friend ___41___ a teacher. ' + 'cloze filler text '.repeat(20),
      '41. A. is    B. was    C. are    D. were',
      '第二节（共10小题；每小题1.5分，满分15分）',
      '阅读下面短文，在空白处填入1个适当的单词或括号内单词的正确形式。',
      'Tea ___56___ (be) popular in China. ' + 'grammar passage filler '.repeat(20),
      '【答案】56. is    57. to learn',
      '【解析】',
      '【56题详解】考查动词时态。',
      '第四部分 写作（共两节，满分40分）',
      '第一节 假定你是李华，' + 'writing prompt filler '.repeat(10)
    ].join('\n');
    var grammarSections = wordImportModel && wordImportModel.isolateGrammarSections(fullPaperFixture);
    var grammarSectionText = grammarSections && grammarSections.length ? grammarSections[0].lines.join('\n') : '';
    var grammarPlanFull = wordImportModel && wordImportModel.buildDocxBatchPlan(fullPaperFixture, { maxBatchChunks: 80 });
    var examInfoFromName = wordImportModel && wordImportModel.extractExamInfoFromFilename('精品解析：山东枣庄市2026届高三下学期5月模拟考试英语试题（解析版）.docx');
    var composedTitle = wordImportModel && wordImportModel.composePassageTitle('2026 山东枣庄市 模拟', '俄罗斯男孩与普洱茶');
    var composedNoExam = wordImportModel && wordImportModel.composePassageTitle('', '只有主题');
    var parsedPassages = wordImportModel && wordImportModel.normalizeParsedPassages({
      passage: 'Students __1__ grammar.',
      blanks: [{ no: '1', answer: '?', category: 'predicate' }]
    }, 'Parsed Fallback', { 1: 'learn' });
    var finalizedPassages = wordImportModel && wordImportModel.finalizePassages([
      { title: 'Same', passage: 'Students learn grammar.', blanks: [{ no: 1, answer: 'learn' }] },
      { title: 'Same', passage: 'Teachers use grammar.', blanks: [{ no: 2, answer: 'use' }] },
      { title: 'Duplicate', passage: 'Students ___1___ grammar.', blanks: [{ no: 1, answer: 'learn' }] }
    ]);
    return !!(axis && axis.title && axis.formLabel && tab === 'guide'
      && stageShellModel && stageShellModel.sourceLabel === 'Smoke Source'
      && stageShellModel.questionLabel.indexOf('第') === 0
      && stageShellModel.focusContent === true
      && stageShellModel.zhSentence === '中文句子。'
      && teachingQuestionGraphNodeId
      && focusFromModule && focusFromModule.key && trapIdFromModule
      && teachingCard && teachingCard.headline && lessonPath && lessonPath.length
      && mindmap && mindmap.center && mindmapActive && Object.keys(mindmapActive).length
      && knowledgePanelModel && knowledgePanelModel.heading
      && knowledgePanelModel.path && knowledgePanelModel.path.length === 3
      && knowledgePanelModel.locatorLabel && knowledgePanelModel.locatorLabel.indexOf('全图定位：') === 0
      && knowledgePanelModel.branches && knowledgePanelModel.branches.length
      && knowledgePanelModel.branches.some(function(branch) { return branch.active; })
      && teachingGlobalGraphOpenPlan && teachingGlobalGraphOpenPlan.action === 'open-global-graph'
      && teachingGlobalGraphOpenPlan.active === true
      && teachingGlobalGraphOpenPlan.nodeId === teachingQuestionGraphNodeId
      && teachingGlobalGraphOpenPlan.page === 'knowledge'
      && teachingGlobalGraphOpenPlan.knowledgeView === 'system'
      && teachingGlobalGraphOpenPlan.shouldCloseTeachingStage === true
      && teachingGlobalGraphOpenPlan.selectDelayMs === 80
      && emptyTeachingGlobalGraphOpenPlan && emptyTeachingGlobalGraphOpenPlan.action === 'none'
      && emptyTeachingGlobalGraphOpenPlan.active === false
      && migrationKeys && migrationKeys.length && migrationOverlap === true
      && migrationData && migrationData.tabs && migrationData.tabs.length === 3
      && migrationData.headerLabel && migrationData.poolCount >= migrationData.migration.length
      && migrationData.migration && migrationData.migration.length
      && migrationData.migration[0].tagLabel && typeof migrationData.migration[0].teachingLine === 'string'
      && migrationPanelModel && migrationPanelModel.heading === migrationData.headerLabel
      && migrationPanelModel.tabs && migrationPanelModel.tabs.some(function(tab) { return tab.key === 'bank' && tab.active; })
      && migrationPanelModel.countText.indexOf('共 ') === 0
      && migrationContentModel && migrationContentModel.heading === migrationData.headerLabel
      && migrationContentModel.tabs && migrationContentModel.tabs.length === 3
      && migrationContentModel.countText.indexOf('共 ') === 0
      && migrationContentModel.entries.length === migrationData.migration.length
      && migrationContentModel.entries[0].id
      && migrationContentModel.entries[0].sentenceHtml.indexOf('smoke sentence') !== -1
      && migrationContentModel.entries[0].item
      && migrationContentModel.entries[0].row && migrationContentModel.entries[0].row.indexText
      && migrationContentModel.entries[0].card && migrationContentModel.entries[0].card.ctaText === '点击进入完整讲解'
      && migrationEmptyHintModel && migrationEmptyHintModel.primaryText.indexOf('错题本里还没有') === 0
      && migrationEmptyHintModel.secondaryText.indexOf('高频错题') !== -1
      && migrationEmptyHintModel.fallbackText.indexOf('Smoke Category') !== -1
      && analysisMigrationCount === 2
      && migrationEntryModel && migrationEntryModel.indexText === '02'
      && migrationEntryModel.typeLabel === '模拟'
      && migrationEntryModel.typeClass === ' is-mock'
      && migrationEntryModel.sourceText === 'Smoke Exam · 第3题'
      && migrationCardModel && migrationCardModel.typeTag && migrationCardModel.typeTag.label === '真题'
      && migrationCardModel.sourceLabel === 'Smoke Exam'
      && migrationCardModel.questionNo === 3
      && migrationCardModel.ctaText === '点击进入完整讲解'
      && migrationErrorEntryModel && migrationErrorEntryModel.rowClass === ' is-error'
      && migrationErrorEntryModel.typeLabel === '错题'
      && migrationErrorCardModel && migrationErrorCardModel.sourceAccent === true
      && migrationErrorCardModel.typeTag === null
      && graphIndex && graphIndex.teach_start
      && relevantGraphIds && relevantGraphIds.indexOf('teach_start') !== -1
      && graphBounds && graphBounds.w > 0 && graphBounds.h > 0
      && graphTextLines && graphTextLines.length === 2
      && graphPreset && graphPreset.nodeId === 'verb_identity_gate'
      && graphPresetFocusPlan && graphPresetFocusPlan.action === 'focus-preset'
      && graphPresetFocusPlan.nodeId === 'verb_identity_gate'
      && graphPresetFocusPlan.graphFocusState.focusMode === 'verb'
      && graphPresetFocusPlan.shouldFitBounds === true
      && graphNodeSelectionPlan && graphNodeSelectionPlan.action === 'select-node'
      && graphNodeSelectionPlan.nodeId === 'predicate_core'
      && graphNodeSelectionPlan.graphFocusState.selectedId === 'predicate_core'
      && graphNodeSelectionPlan.shouldCenterNode === true
      && viewModel.getGraphNodeTypeLabel('trap') === '易错陷阱'
      && viewModel.getGraphTypeColor('route') === '#34c759'
      && viewModel.graphHasFocus('teach_start', []) === true
      && viewModel.graphEdgeActive({ from: 'a', to: 'b' }, ['a', 'b']) === true
      && graphLabels && graphLabels.all && graphLabels.all.length
      && graphPath && graphPath.length
      && graphQuestionMatch === true
      && graphQuestionPools && graphQuestionPools.bank && graphQuestionPools.bank.length
      && graphQuestionPools.errors && graphQuestionPools.errors.length === 1
      && graphSearch && graphSearch.length
      && nodeCategoryLabels && nodeCategoryLabels.length
      && viewModel.getRootColorStyle({ color: 'green' }) === '#34c759'
      && knowledgeMapModel && knowledgeMapModel.hero && knowledgeMapModel.hero.titleText
      && knowledgeMapModel.pathPanelTitleText === '推荐学习路径'
      && knowledgeMapModel.roots && knowledgeMapModel.roots.length
      && firstKnowledgeMapNode && firstKnowledgeMapNode.action && firstKnowledgeMapNode.action.fn === 'showKnowledgeNode'
      && firstKnowledgeMapNode.tagTexts && firstKnowledgeMapNode.tagTexts.length <= 3
      && knowledgeNodeDetail && knowledgeNodeDetail.layerText === '知识节点'
      && knowledgeNodeDetail.categoryButtons && knowledgeNodeDetail.categoryButtons[0].labelText.indexOf('打开书本：') === 0
      && knowledgeModel.getKnowledgeRootColorStyle({ color: 'green' }) === '#34c759'
      && knowledgeModel.getKnowledgeCategoryLabel(question.category, knowledgeModelDeps)
      && globalGraphPageModel && globalGraphPageModel.titleText
      && globalGraphPageModel.actionButtons.length === 3
      && globalGraphPageModel.focusButtons.some(function(item) { return item.id === 'verb' && item.active; })
      && globalGraphInspectorModel && globalGraphInspectorModel.titleText
      && globalGraphInspectorModel.resourceSection && globalGraphInspectorModel.resourceSection.viewButtons.length === 2
      && dmTree && dmTree.rootId === 'root' && dmTree.childrenOf['root'].length === 2
      && dmStep && dmStep.title === '有提示词' && dmStep.options.length === 1 && dmStep.options[0].id === 'a1'
      && dmStep.breadcrumb.length === 2 && dmStep.breadcrumb[0].id === 'root' && dmStep.isLeaf === false
      && dmStep.categoryRefs.length === 1 && dmStep.categoryRefs[0] === 'word'
      && dmLeaf && dmLeaf.isLeaf === true && dmLeaf.options.length === 0
      && dmOutline && dmOutline.rows.length === 4 && dmOutline.rows.some(function(r) { return r.id === 'a' && r.onPath; })
      && dmLayout && dmLayout.pos.root && dmLayout.pos.a1 && dmLayout.width > 0 && dmLayout.height > 0
      && dmLayout.pos.root.y < dmLayout.pos.a.y && dmLayout.pos.a.y < dmLayout.pos.a1.y
      && dmLayout.pos.root.x > dmLayout.pos.a.x && dmLayout.pos.root.x < dmLayout.pos.b.x
      && emptyGlobalGraphInspectorModel && emptyGlobalGraphInspectorModel.empty === true
      && globalGraphSearchModel && globalGraphSearchModel.results && globalGraphSearchModel.results.length
      && globalGraphSearchModel.results[0].subtitleText.indexOf(' · ') !== -1
      && emptyGlobalGraphSearchModel && emptyGlobalGraphSearchModel.empty === true
      && emptyGlobalGraphSearchModel.emptyText === '无匹配节点'
      && globalGraphSvgModel && globalGraphSvgModel.viewBox
      && globalGraphSvgModel.viewportTransform === 'translate(10 20) scale(1)'
      && globalGraphSvgModel.edges && globalGraphSvgModel.edges.length
      && globalGraphSvgModel.nodes && globalGraphSvgModel.nodes.some(function(item) { return item.id === 'teach_start' && item.active; })
      && globalGraphSvgModel.nodes.some(function(item) { return item.titleLines && item.titleLines.length; })
      && guide && guide.title && guide.migrationKeys && guide.migrationKeys.length
      && guideCardModel && guideCardModel.visible === true
      && guideCardModel.titleLine === '考点：谓语动词'
      && guideCardModel.steps.length === 3
      && guideCardModel.mistake === '只看最近名词。'
      && guidePanelModel && guidePanelModel.kicker === '讲题'
      && guidePanelModel.heading === 'Smoke Guide'
      && guidePanelModel.subline === 'Smoke Subline'
      && guidePanelModel.practicalGuide === guide
      && analysisPanelModel && analysisPanelModel.answer === 'learn'
      && analysisPanelModel.zhSentence === '中文句子。'
      && analysisPanelModel.showNavigation === true
      && analysisPanelModel.migrationCount === 4
      && analysisPanelModel.floatButtons.length === 2
      && analysisPanelModel.solution.text === 'Smoke analysis.'
      && teachingAnalysisPanelModel && teachingAnalysisPanelModel.showNavigation === false
      && emptyGuideCardModel && emptyGuideCardModel.visible === false
      && solutionPanelModel && solutionPanelModel.text === '答案：learn。'
      && solutionPanelModel.hasSolve === false
      && solveDualModel && solveDualModel.hasSolve === true
      && solveDualModel.solveText === '先看括号再下手' && solveDualModel.pointText === '考查动词'
      && analysisFloatClosePlan && analysisFloatClosePlan.panelSelector.indexOf('.analysis-float-panel') === 0
      && analysisFloatOpenPlan && analysisFloatOpenPlan.active === true
      && analysisFloatOpenPlan.panelSelector === '[data-analysis-float="guide"]'
      && analysisFloatOpenPlan.shouldOpen === true
      && analysisFloatCloseOnlyPlan && analysisFloatCloseOnlyPlan.shouldOpen === false
      && invalidAnalysisFloatPlan && invalidAnalysisFloatPlan.active === false
      && theoryPanelModel && theoryPanelModel.hasTheory === true
      && theoryPanelModel.title
      && theoryPanelModel.path && theoryPanelModel.path.length
      && (theoryPanelModel.overviewHtml || theoryPanelModel.sections.length)
      && emptyTheoryPanelModel && emptyTheoryPanelModel.hasTheory === false
      && emptyTheoryPanelModel.emptyText === '「缺失考点」考点理论资料整理中，敬请期待。'
      && examQuestion && examQuestion.exam_id === exam.exam_id
      && examState && examState.currentQuestions && examState.currentQuestions.length === 10
      && missingExamMessage === '未找到该套卷：missing-exam-smoke'
      && orderedExams && orderedExams.length === (window.GRAMMAR_BANK.exams || []).length
      && Number(orderedExams[0].year || 0) >= Number(orderedExams[orderedExams.length - 1].year || 0)
      && fineInfo && fineInfo.id === question.fine_category
      && fineStats && fineStats.total >= 1
      && frequencyStyle && frequencyStyle.label
      && sentence && sentence.indexOf('___' + question.no + '___') !== -1
      && typeof blankPrefix === 'string'
      && chineseSentence && chineseSentence.length > 0
      && appSnapshot && appSnapshot.currentQuestions.length === 10
      && appSnapshot.tab === 'migration'
      && appSnapshot.showAnswer === true
      && sameExamContext
      && wrappedIdx === 0
      && clampedIdx === 9
      && currentIdxFromSelection === 3
      && currentIdxFromSession === 5
      && selectedQuestionState && selectedQuestionState.selectedQuestionIndex === 9
      && selectedQuestionState.selectedQuestion === examState.currentQuestions[9]
      && selectedQuestionSnapshotState && selectedQuestionSnapshotState.selectedQuestionIndex === 1
      && selectedQuestionSnapshotState.selectedQuestion === examState.currentQuestions[1]
      && selectedFromContext && selectedFromContext.selectedQuestion === examState.currentQuestions[2]
      && selectedIndexByNo === 4
      && clearedSelected && clearedSelected.selectedQuestion === null && clearedSelected.selectedQuestionIndex === -1
      && practiceContextState && practiceContextState.currentExam === examState.currentExam
      && practiceContextState.currentQuestions.length === examState.currentQuestions.length
      && practiceContextSnapshot && practiceContextSnapshot.currentQuestions.length === examState.currentQuestions.length
      && practiceContextFromExam && practiceContextFromExam.currentQuestions.length === examState.currentQuestions.length
      && clearedPracticeContext && clearedPracticeContext.currentExam === null && clearedPracticeContext.currentQuestions.length === 0
      && normalizedPreviousHome && normalizedPreviousHome.page === 'home' && normalizedPreviousHome.view === 'cards'
      && normalizedPreviousError && normalizedPreviousError.page === 'error-book' && !normalizedPreviousError.view
      && previousViewState && previousViewState.previousView && previousViewState.previousView.page === 'lesson-prep'
      && previousViewState.label === '返回备课资料'
      && categoryEntryPrevious && categoryEntryPrevious.view === 'categories'
      && examEntryPrevious && examEntryPrevious.view === 'exams'
      && errorEntryPrevious && errorEntryPrevious.page === 'error-book'
      && prepEntryPrevious && prepEntryPrevious.page === 'lesson-prep'
      && blankNavigationInitialForward === 0
      && blankNavigationInitialBackward === 9
      && blankNavigationWrapForward === 0
      && blankNavigationWrapBackward === 9
      && blankNavigationInvalid === -1
      && normalizedPageKey === 'home'
      && protectedPageState === true
      && publicPageAuthGuard && publicPageAuthGuard.shouldRequireAuth === false && publicPageAuthGuard.canEnter === true
      && protectedPageAuthGuard && protectedPageAuthGuard.shouldRequireAuth === true && protectedPageAuthGuard.canEnter === false
      && authenticatedPageAuthGuard && authenticatedPageAuthGuard.shouldRequireAuth === false && authenticatedPageAuthGuard.canEnter === true
      && welcomeShellState && welcomeShellState.guestMode === true && welcomeShellState.modulesMode === false
      && modulesShellState && modulesShellState.modulesMode === true && modulesShellState.shouldRefreshModulesGreeting === true
      && homeShellState && homeShellState.guestMode === false && homeShellState.modulesMode === false
      && normalizedDockKey === ''
      && knowledgePageState && knowledgePageState.activePage === 'knowledge' && knowledgePageState.activeDock === 'knowledge'
      && practicePageState && practicePageState.activePage === 'practice' && practicePageState.activeDock === ''
      && categoryDockState && categoryDockState.activeDock === 'categories'
      && homeRenderPlan && homeRenderPlan.renderAction === 'navigate-home-cards' && homeRenderPlan.homeView === 'cards'
      && adminRenderPlan && adminRenderPlan.renderAction === 'render-admin'
      && knowledgeRenderPlan && knowledgeRenderPlan.renderAction === '' && knowledgeRenderPlan.trackModule === true
      && blockedPageSwitchPlan && blockedPageSwitchPlan.page === 'lesson-prep' && blockedPageSwitchPlan.shouldRequireAuth === true
      && blockedPageSwitchPlan.shouldCloseTeaching === true && blockedPageSwitchPlan.canEnter === false
      && allowedPageSwitchPlan && allowedPageSwitchPlan.page === 'knowledge' && allowedPageSwitchPlan.canEnter === true
      && allowedPageSwitchPlan.pageState && allowedPageSwitchPlan.pageState.activeDock === 'knowledge'
      && allowedPageSwitchPlan.renderPlan && allowedPageSwitchPlan.renderPlan.trackModule === true
      && grammarEntryPlan && grammarEntryPlan.supported === true && grammarEntryPlan.page === 'home'
      && unknownEntryPlan && unknownEntryPlan.supported === false && unknownEntryPlan.shouldSwitchPage === false
      && goHomePlan && goHomePlan.shouldSwitchPage === true && goHomePlan.homeView === 'cards'
      && keepTeachingState && keepTeachingState.keepTeachingOnPageSwitch === true
      && releaseTeachingState && releaseTeachingState.keepTeachingOnPageSwitch === false
      && keepTeachingSnapshot && keepTeachingSnapshot.keepTeachingOnPageSwitch === true
      && shouldCloseTeaching === true
      && shouldKeepTeaching === false
      && previousViewLabel === '返回套卷列表'
      && dockPracticeLabel === '返回备课资料'
      && dockKnowledgeLabel === '返回全局图谱'
      && drawerBackAction && drawerBackAction.type === 'drawer-return'
      && homeBackAction && homeBackAction.type === 'home-view' && homeBackAction.view === 'cards'
      && practiceBackAction && practiceBackAction.type === 'previous-view'
      && mapBackAction && mapBackAction.type === 'knowledge-map'
      && systemBackAction && systemBackAction.type === 'knowledge-system'
      && previousHomeReturn && previousHomeReturn.type === 'home' && previousHomeReturn.homeView === 'categories'
      && previousPageReturn && previousPageReturn.type === 'page' && previousPageReturn.page === 'error-book'
      && emptyPreviousReturn && emptyPreviousReturn.type === 'home' && emptyPreviousReturn.homeView === 'cards'
      && drawerReturnState && drawerReturnState.drawerReturnTo && drawerReturnState.drawerReturnTo.label === '返回教材'
      && consumedDrawerReturn && consumedDrawerReturn.returnInfo && consumedDrawerReturn.drawerReturnTo === null
      && drawerClosePlan && drawerClosePlan.action === 'close-drawer'
      && drawerClosePlan.shouldCloseDrawer === true
      && drawerClosePlan.selectedState.selectedQuestion === null
      && drawerClosePlan.shouldClearDrawerReturn === true
      && drawerClosePreservePlan && drawerClosePreservePlan.shouldClearDrawerReturn === false
      && normalizedDrawerTab === 'analysis'
      && drawerTabPlan && drawerTabPlan.action === 'switch-drawer-tab'
      && drawerTabPlan.tab === 'theory'
      && drawerTabPlan.shouldUpdateTabChrome === true
      && drawerTabPlan.shouldRenderContent === true
      && drawerTabPlan.contentType === 'theory'
      && drawerTeachingTabPlan && drawerTeachingTabPlan.shouldUseTeachingTab === true
      && drawerTeachingTabPlan.shouldUpdateTabChrome === false
      && normalizedMigrationSource === 'bank'
      && migrationSourceState && migrationSourceState.migrationSource === 'errors'
      && migrationSourceChangePlan && migrationSourceChangePlan.migrationSource === 'all'
      && migrationSourceChangePlan.renderTarget === 'drawer'
      && migrationSourceChangePlan.eventContext.question_no === 4
      && migrationTeachingSourceChangePlan && migrationTeachingSourceChangePlan.renderTarget === 'teaching-stage'
      && migrationTeachingSourceChangePlan.shouldCloseTeachingExamMenu === true
      && compactOnState && compactOnState.compactMode === true && compactOnState.storageValue === '1'
      && compactOffState && compactOffState.compactMode === false && compactOffState.buttonTitle === '紧凑模式：稍稍放大'
      && projectionStartState && projectionStartState.projectionMode === true
      && projectionStartState.teachingFullscreenRequested === true
      && projectionStartState.shouldRequestFullscreen === true
      && projectionBlockedGuard && projectionBlockedGuard.allowed === false
      && projectionBlockedGuard.message.indexOf('请先进入答题') === 0
      && projectionAllowedGuard && projectionAllowedGuard.allowed === true && projectionAllowedGuard.message === ''
      && projectionNoApiState && projectionNoApiState.projectionMode === true
      && projectionNoApiState.teachingFullscreenRequested === false
      && projectionExitState && projectionExitState.projectionMode === false
      && projectionExitState.shouldExitFullscreen === true
      && projectionExitState.drawerProjectionSize === 'half'
      && fullscreenClearedState && fullscreenClearedState.projectionMode === false
      && fullscreenClearedState.teachingFullscreenRequested === false
      && drawerProjectionState && drawerProjectionState.drawerProjectionSize === 'full'
      && drawerProjectionState.className === 'drawer-state-full'
      && drawerProjectionFallbackState && drawerProjectionFallbackState.drawerProjectionSize === 'half'
      && normalizedDrawerHeight === 360
      && invalidDrawerHeight === null
      && clampedDrawerHeightLow === 200
      && clampedDrawerHeightHigh === 748
      && drawerHeightState && drawerHeightState.drawerHeight === 500
      && drawerHeightState.styleHeight === '500px'
      && drawerResizeState && drawerResizeState.drawerHeight === 600
      && normalizedSyncStatus === null
      && syncHiddenModel && syncHiddenModel.visible === false && syncHiddenModel.display === 'none'
      && syncWorkingModel && syncWorkingModel.status === 'syncing' && syncWorkingModel.html.indexOf('同步中') !== -1
      && syncOkModel && syncOkModel.status === 'ok' && syncOkModel.autoHideMs === 2500
      && syncErrorModel && syncErrorModel.status === 'error' && syncErrorModel.cursor === 'pointer'
      && syncErrorModel.alertMessage.indexOf('network down') !== -1
      && syncBeginState && syncBeginState.syncInflight === 2 && syncBeginState.syncStatus === 'syncing'
      && syncPendingEndState && syncPendingEndState.syncInflight === 1 && syncPendingEndState.shouldUpdateStatus === false
      && syncErrorEndState && syncErrorEndState.syncInflight === 0 && syncErrorEndState.syncStatus === 'error'
      && syncErrorEndState.syncStatusMessage === 'network down'
      && normalizedSyncQueue && normalizedSyncQueue.pending === true && normalizedSyncQueue.rerunRequested === true
      && syncQueueStartState && syncQueueStartState.shouldRun === true && syncQueueStartState.queue.pending === true
      && syncQueueStartState.queue.rerunRequested === false
      && syncQueueCoalescedState && syncQueueCoalescedState.shouldRun === false
      && syncQueueCoalescedState.queue.pending === true && syncQueueCoalescedState.queue.rerunRequested === true
      && syncQueueEndRerunState && syncQueueEndRerunState.shouldRunAgain === true
      && syncQueueEndRerunState.queue.pending === false && syncQueueEndRerunState.queue.rerunRequested === false
      && syncQueueEndIdleState && syncQueueEndIdleState.shouldRunAgain === false
      && errorSyncQueueKey === 'errorSyncQueue'
      && prepSyncQueueKey === 'prepSyncQueue'
      && cloudUserKey === 'user-a|view-b'
      && normalizedCloudLifecycle && normalizedCloudLifecycle.cloudLastUserKey === 'user-a|'
      && normalizedCloudLifecycle.cloudMigrationPromptShown === true
      && normalizedCloudLifecycle.cloudAdminParamChecked === false
      && normalizedCloudLifecycle.cloudLoggingOut === true
      && patchedCloudLifecycle && patchedCloudLifecycle.cloudLastUserKey === 'user-a|'
      && patchedCloudLifecycle.cloudMigrationPromptShown === true
      && patchedCloudLifecycle.cloudAdminParamChecked === true
      && patchedCloudLifecycle.cloudLoggingOut === true
      && cloudArrivalFirst && cloudArrivalFirst.firstAuthForThisUser === true
      && cloudArrivalFirst.cloudLastUserKey === 'user-a|'
      && cloudArrivalRepeat && cloudArrivalRepeat.firstAuthForThisUser === false
      && cloudAdminEntry && cloudAdminEntry.shouldOpenAdmin === true && cloudAdminEntry.cloudAdminParamChecked === true
      && cloudAdminSkipped && cloudAdminSkipped.shouldOpenAdmin === false && cloudAdminSkipped.cloudAdminParamChecked === false
      && cloudMigrationPromptState && cloudMigrationPromptState.shouldPrompt === true
      && cloudMigrationPromptState.cloudMigrationPromptShown === true
      && cloudMigrationPromptState.localErrorCount === 2
      && cloudMigrationSkippedState && cloudMigrationSkippedState.shouldPrompt === false
      && clearedCloudLifecycle && clearedCloudLifecycle.cloudLastUserKey === ''
      && clearedCloudLifecycle.cloudMigrationPromptShown === false
      && clearedCloudLifecycle.cloudAdminParamChecked === false
      && clearedCloudLifecycle.cloudLoggingOut === false
      && canWriteOwnCloudData === true
      && blocksViewAsCloudWrite === false
      && ownErrorSaveCloudPlan && ownErrorSaveCloudPlan.kind === 'error'
      && ownErrorSaveCloudPlan.shouldSyncCloud === true
      && ownErrorSaveCloudPlan.syncQueueKey === 'errorSyncQueue'
      && viewAsPrepSaveCloudPlan && viewAsPrepSaveCloudPlan.kind === 'prep'
      && viewAsPrepSaveCloudPlan.shouldSyncCloud === false
      && viewAsPrepSaveCloudPlan.blockedByViewAs === true
      && guestSaveCloudPlan && guestSaveCloudPlan.shouldSyncCloud === false
      && guestSaveCloudPlan.blockedByMissingUser === true
      && cloudLoggingOutState && cloudLoggingOutState.cloudLoggingOut === true
      && normalizedReturnStack && normalizedReturnStack.length === 0
      && returnStackState && returnStackState.hasReturn === true && returnStackState.returnContext.type === 'migration'
      && pushedReturn && pushedReturn.teachingReturnStack.length === 1
      && returnDockState && returnDockState.hasReturn === true && returnDockState.returnLabel === '返回原题'
      && teachingDockModel && teachingDockModel.visible === true
      && teachingDockModel.navButtons[0].delta === -1
      && teachingDockModel.questionButtons[1].active === true
      && teachingDockModel.tabButtons.some(function(item) { return item.key === 'knowledge' && item.active; })
      && teachingDockModel.returnButton && teachingDockModel.returnButton.label === '返回原题'
      && teachingDockModel.exitButton && teachingDockModel.exitButton.label === '退出'
      && emptyTeachingDockModel && emptyTeachingDockModel.visible === false
      && teachingStageOpenPlan && teachingStageOpenPlan.action === 'open-teaching-stage'
      && teachingStageOpenPlan.active === true
      && teachingStageOpenPlan.selectedState.selectedQuestionIndex === 1
      && teachingStageOpenPlan.sessionState.teachingSession.tab === 'knowledge'
      && teachingStageOpenPlan.sessionState.teachingSession.showAnswer === true
      && teachingStageOpenPlan.shouldCaptureBaseContext === true
      && teachingStageOpenPlan.shouldRequestFullscreen === true
      && teachingStageOpenPlan.shouldCloseDrawer === true
      && teachingStageOpenPlan.usageEvent.payload.question_no === 2
      && retainedTeachingStageOpenPlan && retainedTeachingStageOpenPlan.shouldCaptureBaseContext === false
      && retainedTeachingStageOpenPlan.sessionState.teachingSession.source === 'migration'
      && retainedTeachingStageOpenPlan.sessionState.teachingSession.tab === 'migration'
      && retainedTeachingStageOpenPlan.sessionState.teachingSession.showAnswer === true
      && emptyTeachingStageOpenPlan && emptyTeachingStageOpenPlan.action === 'none'
      && emptyTeachingStageOpenPlan.active === false
      && teachingQuestionJumpPlan && teachingQuestionJumpPlan.action === 'jump-teaching-question'
      && teachingQuestionJumpPlan.targetIndex === 2
      && teachingQuestionJumpPlan.teachingOptions.tab === 'knowledge'
      && teachingQuestionJumpPlan.teachingOptions.showAnswer === true
      && teachingQuestionJumpPlan.shouldCloseTeachingExamMenu === true
      && teachingQuestionWrapJumpPlan && teachingQuestionWrapJumpPlan.targetIndex === 1
      && emptyTeachingQuestionJumpPlan && emptyTeachingQuestionJumpPlan.action === 'none'
      && emptyTeachingQuestionJumpPlan.active === false
      && teachingBlankRevealPlan && teachingBlankRevealPlan.revealed === true
      && teachingBlankRevealPlan.text === 'learn'
      && teachingBlankRevealPlan.showAnswer === true
      && teachingBlankHidePlan && teachingBlankHidePlan.revealed === false
      && teachingBlankHidePlan.text === '___1___'
      && teachingBlankHidePlan.showAnswer === false
      && unitReturnLabel === '返回教材'
      && poppedReturn && poppedReturn.returnContext && poppedReturn.teachingReturnStack.length === 0
      && clearedReturn && clearedReturn.teachingReturnStack.length === 0 && clearedReturn.hasReturn === false
      && returnStackSnapshot && returnStackSnapshot.teachingReturnStack.length === 1 && returnStackSnapshot.hasReturn === true
      && emptyReturnAction && emptyReturnAction.action === 'none'
      && drawerReturnAction && drawerReturnAction.action === 'drawer-return'
      && drawerReturnAction.shouldSetDrawerReturn === true
      && drawerReturnAction.teardownOptions && drawerReturnAction.teardownOptions.skipRestore === true
      && teachingReturnAction && teachingReturnAction.action === 'teaching-context'
      && teachingReturnAction.targetIndex === 4
      && teachingReturnAction.tab === 'knowledge'
      && teachingReturnAction.showAnswer === true
      && teachingBaseState && teachingBaseState.teachingBaseContext.idx === 3
      && teachingBaseState.teachingBaseContext.selectedQuestion === examState.currentQuestions[3]
      && teachingBaseState.teachingBaseContext !== appSnapshot
      && teachingBaseSnapshot && teachingBaseSnapshot.teachingBaseContext === teachingBaseState.teachingBaseContext
      && clearedBaseState && clearedBaseState.teachingBaseContext === null
      && normalizedMigrationRegistry && normalizedMigrationRegistry !== migrationRegistrySource
      && registeredMigrationItem && registeredMigrationItem.id === 'tm_2'
      && registeredMigrationItem.teachingMigrationCounter === 2
      && fetchedMigrationItem && fetchedMigrationItem.answer === 'teaches'
      && clearedMigrationRegistry && Object.keys(clearedMigrationRegistry.teachingMigrationRegistry).length === 0
      && clearedMigrationRegistry.teachingMigrationCounter === 2
      && shouldRestoreBase === true
      && shouldSkipRestoreBase === false
      && restoreTeardownPlan && restoreTeardownPlan.shouldRestoreBase === true
      && restoreTeardownPlan.restoreContext.idx === 6
      && restoreTeardownPlan.selectedIndex === 6
      && keepTeardownPlan && keepTeardownPlan.shouldRestoreBase === false
      && keepTeardownPlan.selectedIndex === 5
      && nextSession && nextSession.idx === 2 && nextSession.tab === 'guide'
      && teachingSessionSnapshot && teachingSessionSnapshot.teachingSession && teachingSessionSnapshot.teachingSession.idx === 2
      && teachingSessionSnapshot.teachingSession.tab === 'guide'
      && teachingTabState && teachingTabState.teachingSession && teachingTabState.teachingSession.tab === 'migration'
      && teachingAnswerToggled && teachingAnswerToggled.teachingSession && teachingAnswerToggled.teachingSession.showAnswer === true
      && teachingAnswerForced && teachingAnswerForced.teachingSession && teachingAnswerForced.teachingSession.showAnswer === true
      && clearedTeachingSession && clearedTeachingSession.teachingSession === null
      && resetDisplay && resetDisplay.showAnswers === false && resetDisplay.showChinese === false
      && displaySnapshot && displaySnapshot.showAnswers === true && displaySnapshot.showChinese === false
      && toggledAnswers && toggledAnswers.showAnswers === true && toggledAnswers.showChinese === false
      && toggledChineseOn && toggledChineseOn.showAnswers === false && toggledChineseOn.showChinese === true
      && toggledChineseOff && toggledChineseOff.showAnswers === false && toggledChineseOff.showChinese === false
      && clampedFontLow === 12
      && clampedFontHigh === 48
      && adjustedFont === 26
      && fontScaleSnapshot && fontScaleSnapshot.passageFontSize === 12 && fontScaleSnapshot.drawerFontSize === 48
      && fontScalePassage && fontScalePassage.passageFontSize === 12 && fontScalePassage.drawerFontSize === 24
      && fontScaleDrawer && fontScaleDrawer.passageFontSize === 24 && fontScaleDrawer.drawerFontSize === 48
      && fontCssVars && fontCssVars['--passage-font-size'] === '25px' && fontCssVars['--drawer-font-size-sm'] === '25px'
      && fontPassageViewModel && fontPassageViewModel.passageDisplayText === '25px' && !fontPassageViewModel.cssVars['--drawer-font-size']
      && fontDrawerViewModel && fontDrawerViewModel.drawerDisplayText === '26px' && !fontDrawerViewModel.cssVars['--passage-font-size']
      && normalizedHomeView === 'cards'
      && examHomeState && examHomeState.currentHomeView === 'exams' && examHomeState.dockKey === 'exams'
      && categoryDockKey === 'categories'
      && normalizedKnowledgeView === 'map'
      && knowledgeNodeState && knowledgeNodeState.currentKnowledgeView === 'system-node'
      && knowledgeNodeState.currentKnowledgeKey === 'predicate'
      && knowledgeNodeState.currentKnowledgeNodeId === 'teach_start'
      && knowledgeNodeState.currentIsPattern === true
      && normalizedKnowledgeSearchIndex && normalizedKnowledgeSearchIndex.length === 1
      && normalizedKnowledgeSearchIndex !== knowledgeSearchStateSource
      && knowledgeSearchIndexState && knowledgeSearchIndexState.knowledgeSearchIndex.length === 1
      && knowledgeSearchIndexState.knowledgeSearchIndex !== knowledgeSearchStateSource
      && unitMiniContextState && unitMiniContextState.unitMiniContext.filter === '真题'
      && unitMiniContextState.unitMiniContext.tagIds !== unitMiniContextSource.tagIds
      && unitMiniFilterState && unitMiniFilterState.unitMiniContext.filter === '模拟'
      && errorUnitMiniContext && errorUnitMiniContext.source === 'errors' && errorUnitMiniContext.filter === 'all'
      && clearedUnitMiniContext && clearedUnitMiniContext.unitMiniContext === null
      && normalizedGlobalGraphState && normalizedGlobalGraphState.scale === 0.72
      && normalizedGlobalGraphState.tx === 10
      && normalizedGlobalGraphState.focusIds !== globalGraphFocusSource
      && pannedGlobalGraphState && pannedGlobalGraphState.globalGraphState.tx === 15
      && pannedGlobalGraphState.globalGraphState.ty === 12
      && zoomedGlobalGraphState && zoomedGlobalGraphState.globalGraphState.scale === 1.55
      && fittedGlobalGraphState && fittedGlobalGraphState.globalGraphState.scale > 0
      && typeof fittedGlobalGraphState.globalGraphState.tx === 'number'
      && centeredGlobalGraphState && centeredGlobalGraphState.globalGraphState.tx === 340
      && centeredGlobalGraphState.globalGraphState.ty === 260
      && focusedGlobalGraphState && focusedGlobalGraphState.globalGraphState.selectedId === 'node-b'
      && focusedGlobalGraphState.globalGraphState.focusIds.length === 2
      && focusedGlobalGraphState.globalGraphState.focusMode === 'predicate'
      && normalizedTextbookViewMode === 'gallery'
      && textbookListModeState && textbookListModeState.textbookViewMode === 'list'
      && examGrid && examGrid.groups && examGrid.groups.length === 3
      && examGrid.groups[0].year === '2026'
      && examGrid.groups[0].titleText === '2026 年 · 1 套'
      && examGrid.groups[0].items[0].tagClass === 'green'
      && examGrid.groups[0].items[0].blankCount === 2
      && examGrid.groups[0].items[0].descriptionText === '语法填空 · 2 题'
      && examGrid.groups[0].items[0].action && examGrid.groups[0].items[0].action.fn === 'startByExam'
      && examGrid.groups[2].year === '未知'
      && examYearCollapsePlan && examYearCollapsePlan.expanded === false
      && examYearCollapsePlan.bodyDisplay === 'none'
      && examYearCollapsePlan.arrowTransform === 'rotate(-90deg)'
      && examYearExpandPlan && examYearExpandPlan.expanded === true
      && examYearExpandPlan.bodyDisplay === 'block'
      && examYearExpandPlan.arrowTransform === 'rotate(0deg)'
      && examGridModel.getExamTagClass('真题') === ''
      && examGridModel.getExamTagClass('模拟题') === 'green'
      && classroomSwitcher && classroomSwitcher.visible === true
      && classroomSwitcher.examSelect.disabled === false
      && classroomSwitcher.examSelect.options[0].selected === true
      && classroomSwitcher.questionSelect.options[2].selected === true
      && classroomSwitcher.answerButton.label === '隐藏答案'
      && classroomSwitcher.answerButton.primary === true
      && classroomSwitcher.progressText.indexOf('3/10') === 0
      && classroomExamIndex === 1
      && classroomExamNavPlan && classroomExamNavPlan.action === 'start-exam'
      && classroomExamNavPlan.examId === 'smoke-a'
      && classroomExamNavPlan.index === 0
      && classroomExamNavBlocked && classroomExamNavBlocked.action === 'none'
      && classroomExamSelectPlan && classroomExamSelectPlan.action === 'start-exam'
      && classroomExamSelectPlan.examId === 'smoke-b'
      && classroomExamSelectNoop && classroomExamSelectNoop.action === 'none'
      && classroomQuestionSelectPlan && classroomQuestionSelectPlan.action === 'show-analysis'
      && classroomQuestionSelectPlan.index === 1
      && classroomQuestionSelectInvalid && classroomQuestionSelectInvalid.action === 'none'
      && classroomQuestionNavPlan && classroomQuestionNavPlan.index === 0
      && classroomQuestionNavInitial && classroomQuestionNavInitial.index === 1
      && localClassroomSwitcher && localClassroomSwitcher.examSelect.disabled === true
      && localClassroomSwitcher.examSelect.options[0].label === 'Smoke Prep'
      && localClassroomSwitcher.answerButton.label === '显示答案'
      && practiceHeader && practiceHeader.sourceName === 'Smoke Source'
      && practiceHeader.sourceCountText === '共10题'
      && toggleChineseModel && toggleChineseModel.answerVisible === false
      && toggleChineseModel.chineseText === '英/中'
      && practiceShell && practiceShell.bodyKind === 'sequential'
      && practiceShell.header.sourceName === 'Smoke Source'
      && practiceShell.answerToggleVisible === true
      && practiceShell.hintText.indexOf('点击文中空白处') !== -1
      && chinesePracticeShell && chinesePracticeShell.bodyKind === 'chinese'
      && chinesePracticeShell.answerToggleVisible === false
      && storedChinese && storedChinese.hasText === true && storedChinese.paragraphs.length === 2
      && categoryChinese && categoryChinese.length > 0
      && filledPassage === 'Students learn grammar.'
      && categoryGroups && categoryGroups.length === 2
      && categoryGroups[0].examId === 'Smoke A'
      && categoryGroups[0].items[1].index === 2
      && categoryHint && categoryHint.prefix.indexOf('同类训练共 2 题') !== -1
      && categoryHint.actionLabel === '空格序号'
      && passageSource === 'Main passage.'
      && passageParagraphs && passageParagraphs.length === 2
      && sequentialModel && sequentialModel.unmatchedItems.length === 2
      && sequentialModel.unmatchedItems[0].index === 1
      && practiceBodyKindChinese === 'chinese'
      && practiceBodyKindError === 'error'
      && practiceBodyKindSequential === 'sequential'
      && answerSlotModel && answerSlotModel.kind === 'answer' && answerSlotModel.text === 'learn' && answerSlotModel.clickable === false
      && blankSlotModel && blankSlotModel.kind === 'blank' && blankSlotModel.index === 3 && blankSlotModel.text === '55' && blankSlotModel.clickable === true
      && unmatchedWarningModel && unmatchedWarningModel.visible === true
      && unmatchedWarningModel.title.indexOf('未找到位置标记') !== -1
      && unmatchedWarningModel.items.length === 2
      && unmatchedWarningModel.items[0].no === '2'
      && questionNoNavPlan && questionNoNavPlan.action === 'show-analysis'
      && questionNoNavPlan.index === 1
      && missingQuestionNoNavPlan && missingQuestionNoNavPlan.action === 'none'
      && missingQuestionNoNavPlan.index === -1
      && categoryJumpPlan && categoryJumpPlan.action === 'show-analysis'
      && categoryJumpPlan.index === 1
      && missingCategoryJumpPlan && missingCategoryJumpPlan.action === 'none'
      && replacedBlank === 'Students <span>learn</span> grammar.'
      && categoryPractice && categoryPractice.groups.length === 1
      && categoryPractice.groups[0].items[0].index === 0
      && categoryPractice.groups[0].items[0].sentence.indexOf('___1___') !== -1
      && sequentialReplacement && sequentialReplacement.matchedCount === 2
      && sequentialReplacement.unmatchedItems.length === 1
      && sequentialReplacement.passage.indexOf('[0:learn]') !== -1
      && sidebarExamGroups && sidebarExamGroups.length
      && sidebarExamGroups[0].items && sidebarExamGroups[0].items.length
      && sidebarExamGroups.some(function(group) { return group.items.some(function(item) { return item.active; }); })
      && sidebarExamGroups[0].items[0].action && sidebarExamGroups[0].items[0].action.fn === 'startByExam'
      && sidebarExamGroups[0].items[0].countText.indexOf('题') !== -1
      && sidebarCategoryItems && sidebarCategoryItems.some(function(item) { return item.category === question.category && item.active; })
      && sidebarCategoryItems.some(function(item) { return item.action && item.action.fn === 'startByCategory' && item.countText.indexOf('题') !== -1; })
      && sidebarErrorGroups && sidebarErrorGroups.length === 1 && sidebarErrorGroups[0].items.length === 1
      && sidebarErrorGroups[0].items[0].action && sidebarErrorGroups[0].items[0].action.fn === 'viewErrorQuestion'
      && sidebarErrorGroups[0].items[0].noText.indexOf('第') === 0
      && sidebarPrepItems && sidebarPrepItems.length === 1 && sidebarPrepItems[0].active
      && sidebarPrepItems[0].action && sidebarPrepItems[0].action.fn === 'viewPrepPassage'
      && sidebarPrepItems[0].countText === '1题'
      && sidebarModel.getExamTagClass('模拟卷') === ' green'
      && sidebarModel.buildAction('smokeAction', 3).value === '3'
      && homeCategoryModel && homeCategoryModel.sections && homeCategoryModel.sections.length === 4
      && homeCategoryModel.sections[0].titleText.indexOf('谓语动词') !== -1
      && homeCategoryModel.sections[0].items[0].action && homeCategoryModel.sections[0].items[0].action.fn === 'startByCategory'
      && homeCategoryModel.sections[0].items[0].countText.indexOf('题库：') === 0
      && homeCategoryCounts && homeCategoryCounts[question.category] > 0
      && categoryRules.getCategoryCountText(0) === '暂无'
      && categoryEntryModel && categoryEntryModel.hasQuestions === true
      && categoryEntryModel.currentExam.mode === 'category'
      && categoryEntryModel.currentExam.source.indexOf('按考点 · ') === 0
      && selectedCategoryQuestions && selectedCategoryQuestions.length === 2
      && selectedCategoryQuestions[1].no === 3
      && categoryPracticePlan && categoryPracticePlan.hasQuestions === true
      && categoryPracticePlan.questions.length === 1
      && categoryPracticePlan.currentExam.category === 'predicate'
      && emptyCategoryEntryModel && emptyCategoryEntryModel.hasQuestions === false
      && emptyCategoryEntryModel.emptyMessage === '该考点暂无题目'
      && pageSidebarModel && pageSidebarModel.kind === 'categories'
      && hiddenHomeSidebar && hiddenHomeSidebar.hidden === true
      && contextSidebarModel && contextSidebarModel.kind === 'exam-groups'
      && newUserDashboard && newUserDashboard.activity.isNewUser === true
      && newUserDashboard.activity.greeting === '早上好'
      && newUserDashboard.hero && newUserDashboard.hero.titleText.indexOf('语法填空讲评工作台') !== -1
      && newUserDashboard.actions[0].action && newUserDashboard.actions[0].action.type === 'upload-word'
      && newUserDashboard.actions[0].subtitleText.indexOf('AI 自动解析') !== -1
      && newUserDashboard.actions[0].chrome && newUserDashboard.actions[0].chrome.style.indexOf('box-shadow') !== -1
      && newUserDashboard.actions[0].subtitleStyle.indexOf('opacity') !== -1
      && newUserDashboard.books && newUserDashboard.books.length === 7
      && newUserDashboard.books[0].cover.indexOf('bixiu-1.jpg') !== -1
      && newUserDashboard.books[0].action && newUserDashboard.books[0].action.type === 'open-textbook'
      && newUserDashboard.textbookSection && newUserDashboard.textbookSection.actionLabel === '展开全部 →'
      && activeDashboard && activeDashboard.activity.isNewUser === false
      && activeDashboard.activity.greeting === '晚上好'
      && activeDashboard.activity.statusText === '2 份备课 · 3 道错题'
      && modulesGreetingLate === '今天也辛苦了'
      && modulesGreetingWithName === '上午好，Smoke Teacher'
      && modulesGreetingNoName === '下午好'
      && activeDashboard.actions && activeDashboard.actions.length === 4
      && activeDashboard.hero.bodyParts.some(function(part) { return part.strong && part.text === '2 份备课 · 3 道错题'; })
      && activeDashboard.actions[1].subtitleText === '2 份备课资料'
      && activeDashboard.actions[2].action && activeDashboard.actions[2].action.value === 'error-book'
      && activeDashboard.actions[2].chrome.mouseover.indexOf('var(--red)') !== -1
      && homeSummary && homeSummary.bankStatText.indexOf('2 套卷 · 20 题') !== -1
      && homeSummary.errorCountText === '3 道错题'
      && homeSummary.prepCountText === '4 份资料'
      && uploadActionPlan && uploadActionPlan.immediateSteps[0].page === 'lesson-prep'
      && uploadActionPlan.delayedSteps[0].kind === 'click-upload-button'
      && uploadActionPlan.delayedSteps[0].delayMs === 120
      && switchActionPlan && switchActionPlan.immediateSteps[0].page === 'knowledge'
      && switchActionPlan.delayedSteps.length === 0
      && textbookActionPlan && textbookActionPlan.immediateSteps[0].page === 'knowledge'
      && textbookActionPlan.delayedSteps[0].kind === 'set-knowledge-view'
      && textbookActionPlan.delayedSteps[1].book === '必修一'
      && unknownActionPlan && unknownActionPlan.immediateSteps.length === 0
      && unknownActionPlan.delayedSteps.length === 0
      && categoryStatsModel && categoryStatsModel.items && categoryStatsModel.items.length
      && categoryStatsModel.label === '考点分布'
      && categoryStatsModel.items[0].text.indexOf('×') !== -1
      && categoryStatsModel.items.reduce(function(sum, item) { return sum + item.count; }, 0) === 10
      && knowledgeModel.normalizeTagId('aux:smoke-tag') === 'smoke-tag'
      && knowledgeModel.stripHtml('<b>谓语</b>动词').indexOf('谓语') !== -1
      && knowledgeSearchIndex && knowledgeSearchIndex.length
      && knowledgeSearch && knowledgeSearch.results && knowledgeSearch.results.length
      && knowledgeSearch.results[0].snippetParts && knowledgeSearch.results[0].snippetParts.some(function(part) { return part.match; })
      && knowledgeSearchPanel && knowledgeSearchPanel.active === true
      && knowledgeSearchPanel.categoryNavVisible === false
      && knowledgeSearchPanel.results[0].label
      && knowledgeSearchPanel.results[0].action
      && emptyKnowledgeSearchPanel && emptyKnowledgeSearchPanel.empty === true
      && emptyKnowledgeSearchPanel.emptyText === '无匹配结果'
      && inactiveKnowledgeSearchPanel && inactiveKnowledgeSearchPanel.active === false
      && inactiveKnowledgeSearchPanel.categoryNavVisible === true
      && overflowKnowledgeSearchPanel && overflowKnowledgeSearchPanel.overflowText.indexOf('还有 1 条结果') === 0
      && overflowKnowledgeSearchPanel.results[0].label === '谓语一'
      && knowledgeSearchReset && knowledgeSearchReset.inputValue === ''
      && knowledgeSearchReset.resultsContent === ''
      && knowledgeSearchReset.categoryNavVisible === true
      && knowledgeSearchReset.patternNavVisible === true
      && knowledgeSubsectionPlan && knowledgeSubsectionPlan.active === true
      && knowledgeSubsectionPlan.elementId === 'sub-smoke-sub'
      && knowledgeSubsectionPlan.shouldExpand === true
      && knowledgeSubsectionPlan.highlightMs === 1600
      && knowledgeSubsectionToggleOpen && knowledgeSubsectionToggleOpen.elementId === 'sub-smoke-sub'
      && knowledgeSubsectionToggleOpen.nextCollapsed === false
      && knowledgeSubsectionToggleClose && knowledgeSubsectionToggleClose.nextCollapsed === true
      && emptyKnowledgeSubsectionPlan && emptyKnowledgeSubsectionPlan.active === false
      && emptyKnowledgeSubsectionPlan.elementId === ''
      && emptyKnowledgeSubsectionToggle && emptyKnowledgeSubsectionToggle.active === false
      && knowledgeNavigationPlan && knowledgeNavigationPlan.shouldClearSearch === true
      && knowledgeNavigationPlan.selectAction.catKey === 'predicate'
      && knowledgeNavigationPlan.selectAction.isPattern === true
      && knowledgeNavigationPlan.subsection.elementId === 'sub-verb-tense'
      && globalGraphSearchReset && globalGraphSearchReset.inputValue === ''
      && globalGraphSearchReset.resultsContent === ''
      && globalGraphSearchReset.showResults === false
      && globalGraphSearchReset.visibleClass === 'show'
      && knowledgeSidebarModel && knowledgeSidebarModel.categoryItems && knowledgeSidebarModel.categoryItems.length
      && knowledgeSidebarModel.categoryItems[0].action && knowledgeSidebarModel.categoryItems[0].action.fn === 'selectKnowledgeCategory'
      && typeof knowledgeSidebarModel.patternVisible === 'boolean'
      && knowledgeBookContentModel && knowledgeBookContentModel.found === true
      && knowledgeBookContentModel.titleText
      && Array.isArray(knowledgeBookContentModel.sections)
      && knowledgePatternContentModel && knowledgePatternContentModel.found === true
      && knowledgePatternContentModel.isPattern === true
      && typeof knowledgePatternContentModel.bodyHtml === 'string'
      && knowledgeViewChrome && knowledgeViewChrome.routeView === 'book'
      && knowledgeViewChrome.sidebarVisible === true
      && knowledgeViewChrome.buttons.some(function(button) { return button.elementId === 'knowledgeBookBtn' && button.active; })
      && fallbackKnowledgeViewChrome && fallbackKnowledgeViewChrome.routeView === 'book'
      && fallbackKnowledgeViewChrome.bookKey
      && fineCategoryModel && fineCategoryModel.categories && fineCategoryModel.categories.length
      && fineCategoryModel.header && fineCategoryModel.header.titleText.indexOf('考点视图') !== -1
      && fineCategoryModel.legend && fineCategoryModel.legend.items.length === 4
      && fineCategoryModel.categories[0].titleText
      && typeof fineCategoryModel.categories[0].countText === 'string'
      && fineCategoryModel.categories.some(function(group) { return group.tags.some(function(tag) { return tag.alertMessage && tag.countText !== undefined; }); })
      && fineCategoryViewModel && fineCategoryViewModel.empty === false
      && fineCategoryViewModel.totalTags > 0
      && fineCategoryViewModel.categories.some(function(group) {
        return typeof group.cardBadgeText === 'string'
          && typeof group.showExtendedLabel === 'boolean'
          && group.tags.some(function(tag) { return tag.action && tag.action.type === 'alert' && typeof tag.badgeText === 'string'; });
      })
      && fineCategoryLegend && fineCategoryLegend.items[0].text.indexOf('高频') === 0
      && fineCategoryTagMessage.indexOf('考点：主谓一致') === 0
      && fineCategoryTagMessage.indexOf('错题本：1 道') !== -1
      && fineCategoryModel.categories.some(function(group) { return group.stats && group.stats.tagCount > 0; })
      && textbookModel && textbookModel.books && textbookModel.books.length === 7
      && textbookModel.booksById['必修一'] && textbookModel.booksById['必修一'].cover.indexOf('bixiu-1.jpg') !== -1
      && textbookModel.booksById['必修一'].metaText.indexOf('单元') !== -1
      && textbookViewModel && textbookViewModel.empty === false
      && textbookViewModel.showList === true
      && textbookViewModel.toggle && textbookViewModel.toggle.activeMode === 'list'
      && textbookViewModel.books.length === 7
      && textbookModeToggle && textbookModeToggle.activeMode === 'list'
      && textbookModeToggle.options.some(function(option) { return option.mode === 'list' && option.active; })
      && textbookModalModel && textbookModalModel.titleText.indexOf('人教版 · 英语') === 0
      && textbookModalModel.subtitleText.indexOf('Grammar 单元') !== -1
      && textbookModalViewModel && textbookModalViewModel.closeTitle.indexOf('Esc') !== -1
      && textbookModalViewModel.cover
      && textbookModalOpenGalleryPlan && textbookModalOpenGalleryPlan.action === 'open-modal'
      && textbookModalOpenGalleryPlan.shouldRenderModal === true
      && textbookModalOpenGalleryPlan.modalModel.titleText === textbookModalViewModel.titleText
      && textbookModalOpenListPlan && textbookModalOpenListPlan.action === 'scroll-to-book'
      && textbookModalOpenListPlan.elementId.indexOf('book-') === 0
      && textbookModalOpenListPlan.shouldRenderModal === false
      && firstTextbookUnit && firstTextbookUnit.tagIds.length && firstTextbookUnit.totalQuestions >= 0
      && firstTextbookUnit.titleText
      && firstTextbookUnit.questionActionText.indexOf('看 ') !== -1
      && firstTextbookUnit.showQuestionAction === true
      && unitQuestionList && unitQuestionList.counts && unitQuestionList.counts.all >= unitQuestionList.visibleItems.length
      && unitQuestionList.countText.indexOf('道') !== -1
      && unitQuestionList.filterChips.length === 3
      && unitQuestionList.visibleItemModels.length === unitQuestionList.visibleItems.length
      && unitQuestionList.visibleItemModels.every(function(item) { return item.lectureActionText && item.projectionActionText; })
      && unitQuestionModalModel && unitQuestionModalModel.header.titleText === unitQuestionList.title
      && unitQuestionModalModel.filterVisible === true
      && unitQuestionModalModel.itemCards.length === unitQuestionModalModel.visibleItemModels.length
      && unitQuestionModalModel.itemCards.every(function(item) {
        return item.actions && item.actions.length === 2 && item.actions[1].autoProjection === true;
      })
      && unitQuestionListOpenPlan && unitQuestionListOpenPlan.source === 'bank'
      && unitQuestionListOpenPlan.context.filter === '真题'
      && unitQuestionListOpenPlan.shouldShowModal === true
      && unitErrorListOpenPlan && unitErrorListOpenPlan.source === 'errors'
      && unitErrorListOpenPlan.context.filter === 'all'
      && unitQuestionFilterChangePlan && unitQuestionFilterChangePlan.context.filter === '模拟'
      && unitQuestionFilterChangePlan.shouldCloseModal === true
      && unitQuestionFilterChangePlan.reopenDelayMs >= 200
      && emptyUnitQuestionFilterChangePlan && emptyUnitQuestionFilterChangePlan.action === 'none'
      && unitQuestionBankNavigationPlan && unitQuestionBankNavigationPlan.source === 'bank'
      && unitQuestionBankNavigationPlan.previousViewSource === 'exam'
      && unitQuestionBankNavigationPlan.teachingOptions.showAnswer === true
      && unitQuestionBankNavigationPlan.returnContext && unitQuestionBankNavigationPlan.returnContext.context.filter === '模拟'
      && unitQuestionErrorNavigationPlan && unitQuestionErrorNavigationPlan.source === 'errors'
      && unitQuestionErrorNavigationPlan.fallbackPage === 'error-book'
      && unitQuestionErrorNavigationPlan.returnContext && unitQuestionErrorNavigationPlan.returnContext.context.filter === 'all'
      && unitQuestionErrorNavigationPlan.teachingOptions.showAnswer === false
      && unitDrawerReturnPlan && unitDrawerReturnPlan.action === 'unit-question-list'
      && unitDrawerReturnPlan.shouldSwitchPage === true
      && unitDrawerReturnPlan.knowledgeView === 'textbook'
      && unitDrawerReturnPlan.shouldOpenTextbookModal === true
      && unitDrawerReturnPlan.book
      && missingUnitDrawerReturnPlan && missingUnitDrawerReturnPlan.shouldSwitchPage === true
      && missingUnitDrawerReturnPlan.shouldOpenTextbookModal === false
      && emptyDrawerReturnPlan && emptyDrawerReturnPlan.action === 'none'
      && emptyDrawerReturnPlan.shouldSwitchPage === false
      && unitFilterChips && unitFilterChips[1].active === true
      && unitFilterChips[2].text === '全部 3'
      && unitQuestionItemModel && unitQuestionItemModel.sourceText === '📝 我的错题'
      && unitQuestionItemModel.typeTag && unitQuestionItemModel.typeTag.label === '真题'
      && unitQuestionItemModel.analysisTruncated === true
      && parsedErrorBatchJson && parsedErrorBatchJson.ok === true
      && parsedErrorBatchJson.count === 1
      && parsedEmptyBatchJson && parsedEmptyBatchJson.errorMessage === '请输入一个非空 JSON 数组'
      && parsedErrorBadJson && parsedErrorBadJson.errorMessage.indexOf('JSON 格式错误，请检查：') === 0
      && parsedPrepBadJson && parsedPrepBadJson.errorMessage.indexOf('JSON 格式错误：') === 0
      && errorImport && errorImport.imported.length === 1
      && errorImport.skippedDuplicate === 1
      && errorImport.skippedInvalid === 1
      && errorListModel && errorListModel.groups.length === 1
      && errorListModel.statText === '共 1 道'
      && errorListModel.groups[0].titleText.indexOf('1 题') !== -1
      && errorListModel.groups[0].items[0].showBulkCheck === true
      && errorListModel.groups[0].items[0].blankMarker === '___1___'
      && errorListModel.groups[0].items[0].analysisPreview === '主语 Students 为复数。'
      && emptyErrorListModel && emptyErrorListModel.empty === true
      && emptyErrorListModel.emptyText.indexOf('还没有错题') === 0
      && errorImportMessage === '成功导入 1 道错题\n跳过 1 道重复题\n忽略 1 条格式不完整的数据'
      && errorBatchFormConfig && errorBatchFormConfig.formId === 'batchImportForm'
      && errorBatchFormOpenPlan && errorBatchFormOpenPlan.action === 'toggle-batch-import-form'
      && errorBatchFormOpenPlan.formId === 'batchImportForm'
      && errorBatchFormOpenPlan.shouldShow === true
      && prepBatchFormClosePlan && prepBatchFormClosePlan.formId === 'prepBatchForm'
      && prepBatchFormClosePlan.shouldShow === false
      && errorPracticeEntryPlan && errorPracticeEntryPlan.action === 'enter-saved-material-practice'
      && errorPracticeEntryPlan.previousViewSource === 'error'
      && errorPracticeEntryPlan.preserveDrawerReturn === true
      && errorPracticeEntryPlan.shouldSwitchPage === true
      && errorPracticeEntryPlan.page === 'practice'
      && missingPracticeEntryPlan && missingPracticeEntryPlan.action === 'none'
      && missingPracticeEntryPlan.shouldSwitchPage === false
      && errorBulkDomConfig && errorBulkDomConfig.checkboxSelector === '.error-bulk-check'
      && errorBulkDomConfig.infoId === 'errorBulkInfo'
      && prepBulkInfoPlan && prepBulkInfoPlan.infoId === 'prepBulkInfo'
      && prepBulkInfoPlan.text === '已选择 3 份资料'
      && errorSelectAllPlan && errorSelectAllPlan.checkboxSelector === '.error-bulk-check'
      && errorSelectAllPlan.checked === true
      && bulkModeToggled && bulkModeToggled.bulkMode === true
      && bulkModeForced && bulkModeForced.bulkMode === false
      && errorBulkInfo === '已选择 2 道错题'
      && prepBulkInfo === '已选择 3 份资料'
      && bulkDeletePlan && bulkDeletePlan.count === 2 && bulkDeletePlan.nextItems.length === 1 && bulkDeletePlan.nextItems[0].id === 'a'
      && singleDeletePlan && singleDeletePlan.count === 1 && singleDeletePlan.nextItems.length === 1 && singleDeletePlan.nextItems[0].id === 'a'
      && savedDeletePlan && savedDeletePlan.kind === 'prep'
      && savedDeletePlan.mode === 'bulk'
      && savedDeletePlan.cloudDeleteMethod === 'deletePrepItem'
      && savedDeletePlan.confirmMessage === '确定删除所选 2 份备课资料吗？'
      && savedDeletePlan.nextItems.length === 1 && savedDeletePlan.nextItems[0].id === 'a'
      && emptySavedDeletePlan && emptySavedDeletePlan.action === 'none'
      && emptySavedDeletePlan.emptySelectionMessage === '先勾选要删除的错题。'
      && cloudDeleteFailure && cloudDeleteFailure.kind === 'prep' && cloudDeleteFailure.message === 'network down'
      && cloudDeleteFailureSummary && cloudDeleteFailureSummary.hasFailures === true
      && cloudDeleteFailureSummary.count === 2
      && cloudDeleteFailureSummary.message === '云端删除失败 2 份资料，刷新后可能重新出现。'
      && cloudDeleteFailureSummary.observabilityEvent === 'lesson_prep_bulk_delete_cloud_failed'
      && cloudDeleteFailureSummary.observabilityPayload.module === 'lesson-prep'
      && emptyCloudDeleteFailureSummary && emptyCloudDeleteFailureSummary.hasFailures === false
      && cloudSyncDiffPlan && cloudSyncDiffPlan.upsertCount === 2
      && cloudSyncDiffPlan.deleteCount === 1
      && cloudSyncDiffPlan.deleteIds[0] === 'stale'
      && savedCloudSyncPlan && savedCloudSyncPlan.kind === 'error'
      && savedCloudSyncPlan.cloudUpsertMethod === 'upsertErrorItem'
      && savedCloudSyncPlan.cloudPullMethod === 'pullErrorBook'
      && savedCloudSyncPlan.cloudDeleteMethod === 'deleteErrorItem'
      && savedCloudSyncPlan.syncFailureEvent === 'error_book_sync_failed'
      && savedCloudSyncPlan.syncFailureModule === 'error-book'
      && savedCloudSyncRunPlan && savedCloudSyncRunPlan.kind === 'prep'
      && savedCloudSyncRunPlan.upsertPhase.method === 'upsertPrepItem'
      && savedCloudSyncRunPlan.upsertPhase.items.length === 1
      && savedCloudSyncRunPlan.pullPhase.method === 'pullLessonPrep'
      && savedCloudSyncRunPlan.cleanupPhase.shouldRun === false
      && savedCloudSyncCleanupPlan && savedCloudSyncCleanupPlan.kind === 'error'
      && savedCloudSyncCleanupPlan.cleanupPhase.method === 'deleteErrorItem'
      && savedCloudSyncCleanupPlan.cleanupPhase.ids[0] === 'stale'
      && savedCloudSyncCleanupPlan.cleanupPhase.shouldRun === true
      && savedCloudSyncFailurePlan && savedCloudSyncFailurePlan.syncFailureEvent === 'lesson_prep_sync_failed'
      && savedCloudSyncFailurePlan.message === 'write down'
      && savedCloudSyncFailurePlan.observabilityPayload.module === 'lesson-prep'
      && savedSingleDeleteFailurePlan && savedSingleDeleteFailurePlan.kind === 'error'
      && savedSingleDeleteFailurePlan.id === 'id-1'
      && savedSingleDeleteFailurePlan.message === 'disk full'
      && savedSingleDeleteFailurePlan.alertMessage === '云端删除失败：disk full\n刷新后该错题可能重新出现。'
      && savedSingleDeleteFailurePlan.consoleMessage === '云端删除错题失败'
      && savedSingleDeleteFailurePlan.observabilityEvent === 'error_book_delete_cloud_failed'
      && savedSingleDeleteFailurePlan.observabilityPayload.module === 'error-book'
      && localCloudUploadPlan && localCloudUploadPlan.syncPlans.length === 2
      && localCloudUploadPlan.errorPlan.cloudUpsertMethod === 'upsertErrorItem'
      && localCloudUploadPlan.prepPlan.cloudUpsertMethod === 'upsertPrepItem'
      && localCloudUploadPlan.errorPullMethod === 'pullErrorBook'
      && localCloudUploadPlan.prepPullMethod === 'pullLessonPrep'
      && localCloudUploadPlan.successMessage === '已上传：1 道错题 + 2 份备课资料'
      && localCloudUploadPlan.failureEvent === 'cloud_upload_failed'
      && localCloudUploadFailurePlan && localCloudUploadFailurePlan.failureEvent === 'cloud_upload_failed'
      && localCloudUploadFailurePlan.failureModule === 'cloud-sync'
      && localCloudUploadFailurePlan.message === 'write down'
      && localCloudUploadFailurePlan.alertMessage === '上传失败：write down'
      && localCloudUploadFailurePlan.observabilityPayload.module === 'cloud-sync'
      && localCloudUploadPullResultPlan && localCloudUploadPullResultPlan.nextErrorItems[0].id === 'err-cloud'
      && localCloudUploadPullResultPlan.nextPrepItems[0].id === 'prep-local'
      && localCloudUploadPullResultPlan.usedPrepFallback === true
      && localCloudUploadPullResultPlan.shouldSaveErrorBook === true
      && localCloudUploadPullResultPlan.shouldRenderBankStat === true
      && cloudPullResultPlan && cloudPullResultPlan.hasCloudPayload === true
      && cloudPullResultPlan.cloudErrorCount === 1
      && cloudPullResultPlan.cloudPrepCount === 2
      && cloudPullResultPlan.shouldCheckLocalCloudMigration === true
      && cloudPullResultPlan.shouldApplyCloudData === true
      && cloudPullResultPlan.shouldRenderBankStat === true
      && cloudPullResultPlan.syncStatus === 'ok'
      && emptyCloudPullResultPlan && emptyCloudPullResultPlan.hasCloudPayload === false
      && emptyCloudPullResultPlan.shouldApplyCloudData === false
      && emptyCloudPullResultPlan.syncStatus === null
      && cloudPullFailurePlan && cloudPullFailurePlan.failureEvent === 'cloud_pull_failed'
      && cloudPullFailurePlan.failureModule === 'cloud-sync'
      && cloudPullFailurePlan.syncStatus === 'error'
      && cloudPullFailurePlan.syncMessage === 'read down'
      && cloudPullFailurePlan.alertMessage === '云端读取失败：read down'
      && emptyErrorSelectionMessage === '先勾选要删除的错题。'
      && singlePrepDeleteConfirm === '确定要删除这份备课资料吗？'
      && bulkPrepDeleteConfirm === '确定删除所选 2 份备课资料吗？'
      && cloudDeleteFailedMessage === '云端删除失败：network down\n刷新后该错题可能重新出现。'
      && localCloudMigrationPrompt === '检测到本地有 2 道错题、3 份备课资料，是否上传到云端？'
      && localCloudUploadSuccess === '已上传：2 道错题 + 3 份备课资料'
      && cloudPullFailedAlert === '云端读取失败：read down'
      && cloudUploadFailedAlert === '上传失败：write down'
      && prepImport && prepImport.imported.length === 1
      && prepImport.skippedDuplicate === 1
      && prepImport.skippedInvalid === 1
      && prepImportMessage === '成功导入 1 份备课资料\n跳过 1 份重复资料\n忽略 1 条格式不完整的数据'
      && prepListModel && prepListModel.items.length === 1 && prepListModel.items[0].blankCount === 1
      && prepListModel.statText === '共 1 份'
      && prepListModel.items[0].showBulkCheck === true
      && prepListModel.items[0].metaText.indexOf('1 空') === 0
      && prepListModel.items[0].preview.indexOf('______') !== -1
      && emptyPrepListModel && emptyPrepListModel.empty === true
      && emptyPrepListModel.emptyText.indexOf('还没有备课资料') === 0
      && prepState && prepState.currentExam.mode === 'prep' && prepState.currentQuestions.length === 1
      && prepState.currentQuestions[0].technique.indexOf('考点：') === 0
      && unifiedPrepPanel && unifiedPrepPanel.titleText === 'Smoke Unified Lesson · 进备课资料（可选挑题）'
      && unifiedPrepPanel.modeHintText.indexOf('备课资料') !== -1
      && unifiedErrorPanel && unifiedErrorPanel.titleText === 'Smoke Unified Lesson · 挑题进错题本'
      && unifiedSummaryText === '1 篇 · 共 1 题'
      && unifiedSelectedText === '已勾选 2 题进错题本'
      && unifiedPrepPanel.passages[0].blanks[0].answerText === 'learn'
      && unifiedPrepPanel.passages[0].blanks[0].categoryLabel
      && unifiedPrepPanel.passages[0].blanks[0].analysisTruncated === true
      && unifiedLongPanel && unifiedLongPanel.collectionWarning.visible === true
      && unifiedLongPanel.collectionWarning.count === 9
      && unifiedCompletePrepMessage === '已导入备课资料 1 篇（跳过 1 篇重复）；错题本 +2 道'
      && unifiedCompleteErrorMessage === '已加入错题本 2 道（跳过 1 道重复）'
      && unifiedConfirmPrepPlan && unifiedConfirmPrepPlan.prepPassages.length === 1
      && unifiedConfirmPrepPlan.errorPassages.length === 1
      && unifiedConfirmPrepPlan.invalidSelectionCount === 1
      && unifiedConfirmPrepPlan.errorPassages[0].blanks[0].answer === 'learn'
      && unifiedConfirmErrorPlan && unifiedConfirmErrorPlan.isErrorMode === true
      && unifiedConfirmErrorPlan.prepPassages.length === 0
      && unifiedConfirmErrorPlan.errorPassages.length === 1
      && deepSeekPrepPlan && deepSeekPrepPlan.imported.length === 1
      && deepSeekPrepPlan.nextItems[0].id.indexOf('prep_') === 0
      && deepSeekPrepPlan.nextItems[0].blanks[0].answer === 'learn'
      && deepSeekPrepPlan.successMessage === '成功导入：Smoke DeepSeek Prep\n共 1 个空格'
      && deepSeekPrepDuplicatePlan && deepSeekPrepDuplicatePlan.skippedDuplicate === 1
      && deepSeekPrepDuplicatePlan.duplicateMessage.indexOf('这篇备课资料已存在') === 0
      && deepSeekErrorPlan && deepSeekErrorPlan.count === 1
      && deepSeekErrorPlan.skipCount === 1
      && deepSeekErrorPlan.nextItems[0].id.indexOf('err_') === 0
      && deepSeekErrorPlan.nextItems[0].no === 2
      && deepSeekErrorPlan.nextItems[0].technique.indexOf('考点：') === 0
      && deepSeekErrorPlan.successMessage === '成功导入 1 道错题到错题本\n跳过 1 道重复题'
      && wordInitialProgress && wordInitialProgress.progress === 5
      && wordInitialProgress.stages[0].status === 'doing'
      && wordLargeConfirm.indexOf('26,000 字符') !== -1
      && wordLargeConfirm.indexOf('点确定继续') !== -1
      && wordSplitProgress && wordSplitProgress.progress === 15
      && wordSplitProgress.stages[1].label.indexOf('启发式') !== -1
      && wordSplitProgress.titleText === 'AI 正在解析…'
      && wordSplitProgress.descriptionText.indexOf('请耐心等待') !== -1
      && wordChunkProgress && wordChunkProgress.stages[2].label === 'AI 分批解析（2/3）'
      && wordCompleteProgress && wordCompleteProgress.progress === 100
      && wordCompleteProgress.hideDelayMs === 400
      && wordCompleteProgress.stages[3].label === '整理结果（共 1 篇 · 1 题）'
      && wordFailedAlert === 'Word 解析失败：bad docx'
      && importModuleMissing === '导入模块尚未加载，请刷新后重试。'
      && wordModuleMissing === 'Word 导入模块尚未加载，请刷新后重试。'
      && wordTooShortMessage.indexOf('内容太短') !== -1
      && wordNoSegmentsMessage === '没有识别到可解析的题目段落。'
      && aiLoginRequiredMessage === '请先登录后再使用 AI 解析功能。'
      && aiNoPassagesMessage === 'AI 没有识别出任何题目'
      && rawTextFallbackInserted.indexOf('原始文本已放入批量导入框') === 0
      && docxOnlyMessage === '请上传 .docx 格式的 Word 文档。'
      && aiFallbackConfirm.indexOf('AI 解析失败：bad ai') === 0
      && aiFallbackConfirm.indexOf('批量导入框') !== -1
      && aiNetworkTimeout.indexOf('AI 解析超时') === 0
      && aiNetworkFailed === '网络请求失败：offline'
      && aiHttpJsonError.message === 'AI 输出被截断，已尝试降级处理。'
      && aiHttpFormatError.message === 'AI 没识别出题目。'
      && aiHttpFallbackError.message === '服务端错误 HTTP 503'
      && wordImportModel
      && normalizedWordText === 'A\nB'
      && titleRecognized === true
      && normalizedMarker === 'Students ___1___ learn.'
      && extractedNos.length === 2 && extractedNos[0] === 1 && extractedNos[1] === 2
      && extractedAnswers[1] === 'learn' && extractedAnswers[2] === 'using'
      && fallbackBlanks[0].analysis.indexOf('答案：learn') === 0
      && docxBatchPlan && docxBatchPlan.chunks.length === 1
      && docxBatchPlan.chunks[0].fallback.blanks[0].answer === 'learn'
      && grammarSections && grammarSections.length === 1
      && grammarSectionText.indexOf('在空白处填入') !== -1
      && grammarSectionText.indexOf('从A、B、C、D') === -1
      && grammarPlanFull && grammarPlanFull.chunks.length === 1
      && grammarPlanFull.chunks[0].text.indexOf('Tea') !== -1
      && grammarPlanFull.chunks[0].text.indexOf('My friend') === -1
      && grammarPlanFull.chunks[0].answers && grammarPlanFull.chunks[0].answers[56] === 'is'
      && examInfoFromName === '2026 山东枣庄市 模拟'
      && composedTitle === '2026 山东枣庄市 模拟 · 俄罗斯男孩与普洱茶'
      && composedNoExam === '只有主题'
      && parsedPassages && parsedPassages[0].title === 'Parsed Fallback'
      && parsedPassages[0].passage.indexOf('___1___') !== -1
      && parsedPassages[0].blanks[0].answer === 'learn'
      && finalizedPassages && finalizedPassages.length === 2
      && finalizedPassages[0].title === 'Same · 第1篇'
      && finalizedPassages[0].passage.indexOf('___1___') !== -1
      && finalizedPassages[1].title === 'Same · 第2篇');
  })).toBe(true);

  await page.locator('[data-dock-key="exams"]').click();
  await expect(page.locator('#homeExams')).toHaveClass(/active/);
  await expect(await page.evaluate(() => {
    var state = window.GrammarAppState && window.GrammarAppState.state;
    var activeDock = document.querySelector('.dock-item.active');
    var snapshot = window.getPageNavigationSnapshot && window.getPageNavigationSnapshot();
    return !!(state
      && state.activePage === 'home'
      && state.activeDock === 'exams'
      && state.currentHomeView === 'exams'
      && snapshot
      && snapshot.activePage === state.activePage
      && snapshot.activeDock === state.activeDock
      && snapshot.currentHomeView === state.currentHomeView
      && activeDock
      && activeDock.dataset.dockKey === 'exams');
  })).toBe(true);
  await expect(page.locator('#examGrid .card').first()).toBeVisible();
  await expect(page.locator('#contextSidebar')).toBeVisible();
  await expect(page.locator('#contextSidebarContent')).toContainText('全部套卷');

  await page.locator('#examGrid .card').first().click();
  await expect(page.locator('#page-practice')).toHaveClass(/active/);
  await expect(await page.evaluate(() => {
    var state = window.GrammarAppState && window.GrammarAppState.state;
    var activeDock = document.querySelector('.dock-item.active');
    return !!(state && state.activePage === 'practice' && state.activeDock === '' && !activeDock);
  })).toBe(true);
  await expect(page.locator('#sourceCount')).toContainText('共10题');
  await expect(page.locator('#passageBox .blank-inline')).toHaveCount(10);
  await expect(page.locator('#contextSidebarContent')).toContainText('全部套卷');
  await expect(page.locator('#contextSidebarContent .context-sidebar-item.active').first()).toBeVisible();
  await expect(page.locator('#categoryStats')).toContainText('考点分布');
  await page.locator('#btnToggleAnswers').click();
  await expect(page.locator('#passageBox .answer-filled')).toHaveCount(10);
  await expect(page.locator('#btnToggleAnswers')).toContainText('显示空格');
  await expect(await page.evaluate(() => {
    var state = window.GrammarAppState && window.GrammarAppState.state;
    return !!(state && state.showAnswers === true && state.showChinese === false);
  })).toBe(true);
  await expect(await page.evaluate(() => {
    var snapshot = window.getPracticeDisplaySnapshot && window.getPracticeDisplaySnapshot();
    return !!(snapshot && snapshot.showAnswers === true && snapshot.showChinese === false);
  })).toBe(true);
  await page.locator('#btnToggleChinese').click();
  await expect(page.locator('#btnToggleAnswers')).not.toBeVisible();
  await expect(await page.evaluate(() => {
    var state = window.GrammarAppState && window.GrammarAppState.state;
    return !!(state && state.showAnswers === false && state.showChinese === true);
  })).toBe(true);
  await page.locator('#btnToggleChinese').click();
  await expect(page.locator('#btnToggleAnswers')).toBeVisible();
  await expect(page.locator('#passageBox .blank-inline')).toHaveCount(10);
  await expect(await page.evaluate(() => {
    var state = window.GrammarAppState && window.GrammarAppState.state;
    return !!(state && state.showAnswers === false && state.showChinese === false);
  })).toBe(true);
  await page.locator('.header-font-ctrl .font-ctrl-btn').last().click();
  await expect(page.locator('#passageFontVal')).toContainText('25px');
  await expect(await page.evaluate(() => {
    var state = window.GrammarAppState && window.GrammarAppState.state;
    var css = getComputedStyle(document.documentElement).getPropertyValue('--passage-font-size').trim();
    return !!(state && state.passageFontSize === 25 && css === '25px');
  })).toBe(true);
  await expect(await page.evaluate(() => {
    var snapshot = window.getFontScaleSnapshot && window.getFontScaleSnapshot();
    return !!(snapshot && snapshot.passageFontSize === 25 && snapshot.drawerFontSize === 24);
  })).toBe(true);
  await page.locator('[data-dock-key="knowledge"]').click();
  await expect(page.locator('#page-knowledge')).toHaveClass(/active/);
  await expect(await page.evaluate(() => {
    var state = window.GrammarAppState && window.GrammarAppState.state;
    var activeDock = document.querySelector('.dock-item.active');
    return !!(state
      && state.activePage === 'knowledge'
      && state.activeDock === 'knowledge'
      && activeDock
      && activeDock.dataset.dockKey === 'knowledge');
  })).toBe(true);
  await page.locator('#knowledgeTextbookBtn').click();
  await expect(page.locator('#knowledgeTextbookBtn')).toHaveClass(/active/);
  await expect(await page.evaluate(() => {
    var snapshot = window.getKnowledgeViewSnapshot && window.getKnowledgeViewSnapshot();
    return window.GrammarAppState
      && window.GrammarAppState.state.currentKnowledgeView === 'textbook'
      && window.GrammarAppState.state.currentKnowledgeNodeId === ''
      && window.GrammarAppState.state.textbookViewMode === 'gallery'
      && snapshot
      && snapshot.currentKnowledgeView === window.GrammarAppState.state.currentKnowledgeView
      && snapshot.currentKnowledgeNodeId === window.GrammarAppState.state.currentKnowledgeNodeId;
  })).toBe(true);
  await expect(page.locator('#knowledgeContent')).toContainText(/必修一/);
  await page.locator('button', { hasText: '列表' }).click();
  await expect(await page.evaluate(() => {
    return window.GrammarAppState
      && window.GrammarAppState.state.textbookViewMode === 'list'
      && window.getTextbookViewModeSnapshot
      && window.getTextbookViewModeSnapshot().textbookViewMode === 'list';
  })).toBe(true);
  await expect(page.locator('#knowledgeContent')).toContainText(/必修二|必修三/);
  await expect(await page.evaluate(() => {
    var textbookModel = window._textbookModel || (window.GrammarKnowledgeViewModel && window.GrammarKnowledgeViewModel.buildTextbookModel(
      window.GRAMMAR_FINE_TAGS || {},
      window.GRAMMAR_BANK.questions || [],
      []
    ));
    var unit = textbookModel && textbookModel.books && textbookModel.books.reduce(function(found, book) {
      return found || (book.units && book.units.find(function(item) {
        return item && item.tagIds && item.tagIds.length;
      }));
    }, null);
    if (!unit || !window.openUnitQuestionList) return false;
    window.openUnitQuestionList(unit.unitLabel, unit.tagIds);
    var state = window.GrammarAppState && window.GrammarAppState.state;
    return !!(state
      && state.unitMiniContext
      && state.unitMiniContext.source === 'bank'
      && state.unitMiniContext.filter === '真题'
      && state.unitMiniContext.tagIds
      && state.unitMiniContext.tagIds.length);
  })).toBe(true);
  await page.evaluate(() => window.setUnitMiniFilter && window.setUnitMiniFilter('模拟'));
  await expect.poll(async () => page.evaluate(() => {
    var state = window.GrammarAppState && window.GrammarAppState.state;
    var snapshot = window.getUnitMiniContextSnapshot && window.getUnitMiniContextSnapshot();
    return !!(state
      && state.unitMiniContext
      && state.unitMiniContext.filter === '模拟'
      && snapshot
      && snapshot.filter === '模拟');
  })).toBe(true);
  await page.evaluate(() => window._closeUnitMiniModal && window._closeUnitMiniModal());
  await expect(page.locator('#unitQuestionsModalWrap')).toHaveCount(0);
  await page.locator('#knowledgeFineCatBtn').click();
  await expect(page.locator('#knowledgeContent')).toContainText(/考点视图/);
  await expect(await page.evaluate(() => {
    return window.GrammarAppState
      && window.GrammarAppState.state.currentKnowledgeView === 'fine-cat'
      && window.GrammarAppState.state.currentKnowledgeNodeId === '';
  })).toBe(true);
  await page.locator('#knowledgeBookBtn').click();
  await expect(page.locator('#knowledgeSidebar')).toBeVisible();
  await expect(await page.evaluate(() => {
    var snapshot = window.getKnowledgeViewSnapshot && window.getKnowledgeViewSnapshot();
    return !!(window.GrammarAppState
      && window.GrammarAppState.state.currentKnowledgeView === 'book'
      && window.GrammarAppState.state.currentKnowledgeKey
      && snapshot
      && snapshot.currentKnowledgeView === 'book'
      && snapshot.currentKnowledgeKey === window.GrammarAppState.state.currentKnowledgeKey);
  })).toBe(true);
  await page.locator('#knowledgeSearch').fill('谓语');
  await expect(page.locator('#searchResults .search-result-item').first()).toBeVisible();
  await expect(await page.evaluate(() => {
    var state = window.GrammarAppState && window.GrammarAppState.state;
    var snapshot = window.getKnowledgeSearchIndexSnapshot && window.getKnowledgeSearchIndexSnapshot();
    return !!(state
      && state.knowledgeSearchIndex
      && state.knowledgeSearchIndex.length
      && snapshot
      && snapshot.knowledgeSearchIndex
      && snapshot.knowledgeSearchIndex.length === state.knowledgeSearchIndex.length);
  })).toBe(true);
  await page.locator('#knowledgeSystemBtn').click();
  await expect(page.locator('.decision-map')).toBeVisible();
  await expect(page.locator('.dm-card')).toBeVisible();
  await expect(await page.evaluate(() => window.GrammarAppState && window.GrammarAppState.state && window.GrammarAppState.state.currentKnowledgeView === 'system')).toBe(true);
  // 引导走一步：点第一个选项 → 面包屑长出第二级
  await page.locator('.dm-option').first().click();
  await expect(page.locator('.dm-crumbs .dm-crumb')).toHaveCount(2);
  // 切到全貌 → 缩进大纲出现，状态切到 overview
  await page.locator('.dm-mode', { hasText: '全貌' }).click();
  await expect(page.locator('.dm-outline .dm-row').first()).toBeVisible();
  await expect(await page.evaluate(() => window.decisionMapState && window.decisionMapState.mode)).toBe('overview');

  await page.locator('[data-dock-key="categories"]').click();
  await expect(page.locator('#homeCategories')).toHaveClass(/active/);
  await expect(await page.evaluate(() => {
    var state = window.GrammarAppState && window.GrammarAppState.state;
    var activeDock = document.querySelector('.dock-item.active');
    var snapshot = window.getPageNavigationSnapshot && window.getPageNavigationSnapshot();
    return !!(state
      && state.activePage === 'home'
      && state.activeDock === 'categories'
      && state.currentHomeView === 'categories'
      && snapshot
      && snapshot.activePage === state.activePage
      && snapshot.activeDock === state.activeDock
      && snapshot.currentHomeView === state.currentHomeView
      && activeDock
      && activeDock.dataset.dockKey === 'categories');
  })).toBe(true);
  await page.locator('#homeCategories .card').first().click();
  await expect(page.locator('#page-practice')).toHaveClass(/active/);
  await expect(page.locator('#passageBox .cat-hint')).toContainText(/同类训练共/);
  await page.locator('#passageBox .blank-inline').first().click();
  await expect(page.locator('#teachingStage')).toHaveClass(/open/);
  await expect(page.locator('#teachingStageMain')).toContainText(/讲题|第/);
  await page.evaluate(() => window.closeTeachingStage && window.closeTeachingStage());

  await page.locator('[data-dock-key="exams"]').click();
  await expect(page.locator('#homeExams')).toHaveClass(/active/);
  await page.locator('#examGrid .card').first().click();
  await expect(page.locator('#page-practice')).toHaveClass(/active/);
  await expect(await page.evaluate(() => {
    var state = window.GrammarAppState && window.GrammarAppState.state;
    var practiceSnapshot = window.getPracticeContextSnapshot && window.getPracticeContextSnapshot();
    return !!(state
      && state.currentExam
      && state.currentExam.mode === 'exam'
      && state.currentQuestions
      && state.currentQuestions.length === 10
      && practiceSnapshot
      && practiceSnapshot.currentExam === state.currentExam
      && practiceSnapshot.currentQuestions.length === state.currentQuestions.length
      && state.showAnswers === false
      && state.showChinese === false);
  })).toBe(true);

  await page.locator('#passageBox .blank-inline').first().click();
  await expect(page.locator('#teachingStage')).toHaveClass(/open/);
  await expect(page.locator('#teachingStageMain')).toContainText(/讲题|第/);
  await expect(await page.evaluate(() => {
    var state = window.GrammarAppState && window.GrammarAppState.state;
    var selectedSnapshot = window.getSelectedQuestionSnapshot && window.getSelectedQuestionSnapshot();
    var sessionSnapshot = window.getTeachingSessionSnapshot && window.getTeachingSessionSnapshot();
    var returnSnapshot = window.getTeachingReturnStackSnapshot && window.getTeachingReturnStackSnapshot();
    var baseSnapshot = window.getTeachingBaseContextSnapshot && window.getTeachingBaseContextSnapshot();
    var retentionSnapshot = window.getTeachingPageSwitchRetentionSnapshot && window.getTeachingPageSwitchRetentionSnapshot();
    return !!(state
      && state.selectedQuestion
      && state.teachingSession
      && state.teachingSession.tab === 'guide'
      && state.teachingSession.idx === 0
      && selectedSnapshot
      && selectedSnapshot.selectedQuestion === state.selectedQuestion
      && selectedSnapshot.selectedQuestionIndex === 0
      && sessionSnapshot
      && sessionSnapshot.teachingSession
      && sessionSnapshot.teachingSession.tab === state.teachingSession.tab
      && sessionSnapshot.teachingSession.idx === state.teachingSession.idx
      && returnSnapshot
      && returnSnapshot.teachingReturnStack.length === state.teachingReturnStack.length
      && baseSnapshot
      && baseSnapshot.teachingBaseContext === state.teachingBaseContext
      && retentionSnapshot
      && retentionSnapshot.keepTeachingOnPageSwitch === state.keepTeachingOnPageSwitch);
  })).toBe(true);

  await page.locator('#teachingDock button', { hasText: '迁移' }).click();
  await expect(page.locator('#teachingStageMain')).toContainText(/迁移训练/);
  await expect(page.locator('.teaching-migration-source-tabs')).toBeVisible();
  await expect(page.locator('#teachingStageMain')).toContainText(/真题库/);
  await expect(await page.evaluate(() => {
    var snapshot = window.getTeachingSessionSnapshot && window.getTeachingSessionSnapshot();
    return window.GrammarAppState
      && window.GrammarAppState.state.teachingSession
      && window.GrammarAppState.state.teachingSession.tab === 'migration'
      && snapshot
      && snapshot.teachingSession
      && snapshot.teachingSession.tab === 'migration';
  })).toBe(true);
  await page.locator('.teaching-migration-source-tabs button', { hasText: '全部' }).click();
  await expect(page.locator('.teaching-migration-source-tabs button.active')).toContainText('全部');
  await expect(await page.evaluate(() => localStorage.getItem('grammar-migration-source'))).toBe('all');
  await expect(await page.evaluate(() => {
    return window.GrammarAppState
      && window.GrammarAppState.state.migrationSource === 'all';
  })).toBe(true);
  await expect(await page.evaluate(() => {
    var snapshot = window.getMigrationSourceSnapshot && window.getMigrationSourceSnapshot();
    return !!(snapshot
      && snapshot.migrationSource === 'all'
      && window.GrammarAppState
      && window.GrammarAppState.state.migrationSource === snapshot.migrationSource);
  })).toBe(true);
  await expect.poll(async () => page.evaluate(() => {
    return (window.__supabaseInserts || []).some(function(item) {
      return item.table === 'app_events'
        && item.rows
        && item.rows.event_type === 'migration_source_selected'
        && item.rows.module === 'migration-training'
        && item.rows.context
        && item.rows.context.source === 'all';
    });
  })).toBe(true);
  await expect.poll(async () => page.evaluate(() => {
    return (window.__supabaseInserts || []).some(function(item) {
      return item.table === 'app_events'
        && item.rows
        && item.rows.event_type === 'teaching_tab_selected'
        && item.rows.module === 'teaching-stage'
        && item.rows.context
        && item.rows.context.tab === 'migration';
    });
  })).toBe(true);
  await expect.poll(async () => page.evaluate(() => {
    return (window.__supabaseInserts || []).some(function(item) {
      return item.table === 'app_events'
        && item.rows
        && item.rows.event_type === 'migration_training_viewed'
        && item.rows.module === 'migration-training'
        && item.rows.context
        && item.rows.context.source === 'all'
        && item.rows.context.shown_count >= 0;
    });
  })).toBe(true);

  await page.evaluate(() => window.closeTeachingStage && window.closeTeachingStage());
  await expect(page.locator('#teachingStage')).not.toHaveClass(/open/);
  await expect(await page.evaluate(() => {
    var state = window.GrammarAppState && window.GrammarAppState.state;
    return !!(state && state.teachingSession === null && state.selectedQuestion);
  })).toBe(true);

  await page.evaluate(() => {
    window.seeklumeObservability.recordError('smoke_error', 'synthetic failure', {
      detail: {
        step: 'feedback-context',
        token: 'nested-token-must-not-leak',
        auth: 'authorization=Bearer eyJabc.def.ghi'
      },
      password: 'must-not-leak'
    });
  });
  await expect.poll(async () => page.evaluate(() => {
    var item = (window.__supabaseInserts || []).find(function(entry) {
      return entry.table === 'app_events'
        && entry.rows
        && entry.rows.event_type === 'smoke_error';
    });
    if (!item) return false;
    var text = JSON.stringify(item.rows.context || {});
    return text.indexOf('feedback-context') !== -1
      && text.indexOf('must-not-leak') === -1
      && text.indexOf('nested-token') === -1
      && text.indexOf('password') === -1
      && text.indexOf('token') === -1
      && text.indexOf('authorization') === -1
      && text.indexOf('eyJ') === -1;
  })).toBe(true);
  await page.locator('.feedback-fab').click();
  await expect(page.locator('#feedbackOverlay')).toBeVisible();
  await page.locator('#feedbackReproducible').selectOption('yes');
  await page.locator('#feedbackAffectedUsers').fill('2');
  await page.locator('#feedbackMessage').fill('自动化测试：反馈提交链路可以写入。');
  await page.locator('#feedbackSubmitBtn').click();
  await expect(page.locator('#feedbackStatus')).toContainText(/已收到/);
  await expect(page.locator('#feedbackOverlay')).not.toBeVisible();
  await expect(await page.evaluate(() => {
    return (window.__supabaseInserts || []).some(function(item) {
      var contextText = JSON.stringify((item.rows && item.rows.context) || {});
      return item.table === 'feedback_reports'
        && item.rows
        && item.rows.category === 'ux'
        && item.rows.reproducible === 'yes'
        && item.rows.affected_users_count === 2
        && item.rows.source === 'user'
        && item.rows.message.indexOf('反馈提交链路') !== -1
        && contextText.indexOf('smoke_error') !== -1
        && contextText.indexOf('password') === -1;
    });
  })).toBe(true);

  expect(errors).toEqual([]);
});

test('signed-in saved materials and auto fullscreen paths render', async ({ page }) => {
  const errors = collectFatalBrowserErrors(page);
  await mockSignedInTeacher(page);

  await page.goto('/docs/grammar-fill/');
  await expect(page.locator('html')).toHaveClass(/ready/);

  await page.locator('[data-dock-key="error-book"]').click();
  await expect(page.locator('#page-error-book')).toHaveClass(/active/);
  await expect(page.locator('#errorBookStat')).toContainText('共 1 道');
  await expect(page.locator('#errorBookList')).toContainText('prepared');
  await page.locator('#page-error-book button', { hasText: '批量删除' }).click();
  await expect(page.locator('#errorBulkBar')).toHaveClass(/show/);
  await expect(await page.evaluate(() => {
    var state = window.GrammarAppState && window.GrammarAppState.state;
    return !!(state
      && state.errorBulkMode === true
      && window.getSavedMaterialBulkModeSnapshot
      && window.getSavedMaterialBulkModeSnapshot('error') === true);
  })).toBe(true);
  await page.locator('.error-bulk-check').check();
  await expect(page.locator('#errorBulkInfo')).toContainText('已选择 1 道错题');
  await page.locator('#errorBulkBar button', { hasText: '取消' }).click();
  await expect(page.locator('#errorBulkBar')).not.toHaveClass(/show/);
  await expect(await page.evaluate(() => {
    var state = window.GrammarAppState && window.GrammarAppState.state;
    return !!(state
      && state.errorBulkMode === false
      && window.getSavedMaterialBulkModeSnapshot
      && window.getSavedMaterialBulkModeSnapshot('error') === false);
  })).toBe(true);
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#errorBookList .error-list-delete').first().click();
  await expect(page.locator('#errorBookStat')).toContainText('共 0 道');
  await expect.poll(async () => page.evaluate(() => {
    return (window.__supabaseDeletes || []).some(function(item) {
      return item.table === 'error_book'
        && item.filters.user_id === 'smoke-user-1'
        && item.filters.client_id === 'err_smoke_1';
    });
  })).toBe(true);

  await page.locator('[data-dock-key="lesson-prep"]').click();
  await expect(page.locator('#page-lesson-prep')).toHaveClass(/active/);
  await expect(page.locator('#prepStat')).toContainText('共 1 份');
  await expect(page.locator('#prepList')).toContainText('Smoke Test Lesson');
  await page.locator('#page-lesson-prep button', { hasText: '批量删除' }).click();
  await expect(page.locator('#prepBulkBar')).toHaveClass(/show/);
  await expect(await page.evaluate(() => {
    var state = window.GrammarAppState && window.GrammarAppState.state;
    return !!(state
      && state.prepBulkMode === true
      && window.getSavedMaterialBulkModeSnapshot
      && window.getSavedMaterialBulkModeSnapshot('prep') === true);
  })).toBe(true);
  await page.locator('.prep-bulk-check').check();
  await expect(page.locator('#prepBulkInfo')).toContainText('已选择 1 份资料');
  await page.locator('#prepBulkBar button', { hasText: '取消' }).click();
  await expect(page.locator('#prepBulkBar')).not.toHaveClass(/show/);
  await expect(await page.evaluate(() => {
    var state = window.GrammarAppState && window.GrammarAppState.state;
    return !!(state
      && state.prepBulkMode === false
      && window.getSavedMaterialBulkModeSnapshot
      && window.getSavedMaterialBulkModeSnapshot('prep') === false);
  })).toBe(true);

  await page.locator('#prepList .prep-list-item').first().click();
  await expect(page.locator('#page-practice')).toHaveClass(/active/);
  await expect(page.locator('#sourceName')).toContainText('Smoke Test Lesson');
  await expect(page.locator('#passageBox .blank-inline')).toHaveCount(1);

  await expect(page.locator('#btnProjection')).toHaveCount(0);
  await page.locator('#passageBox .blank-inline').first().click();
  await expect(page.locator('body')).toHaveClass(/projection-mode/);
  await expect(await page.evaluate(() => {
    var state = window.GrammarAppState && window.GrammarAppState.state;
    return !!(state && state.projectionMode === true && state.teachingFullscreenRequested === true);
  })).toBe(true);
  await expect(page.locator('#teachingStage')).toHaveClass(/open/);
  await expect(page.locator('#teachingStageMain')).toContainText(/讲题|第/);
  await page.evaluate(() => window.setDrawerProjectionSize && window.setDrawerProjectionSize('full'));
  await expect(page.locator('#drawer')).toHaveClass(/drawer-state-full/);
  await expect(await page.evaluate(() => {
    var state = window.GrammarAppState && window.GrammarAppState.state;
    return !!(state && state.drawerProjectionSize === 'full');
  })).toBe(true);
  await expect.poll(async () => page.evaluate(() => {
    return (window.__supabaseInserts || []).some(function(item) {
      return item.table === 'app_events'
        && item.rows
        && item.rows.event_type === 'teaching_stage_opened'
        && item.rows.module === 'teaching-stage';
    });
  })).toBe(true);

  await page.evaluate(() => window.exitProjectionMode && window.exitProjectionMode());
  await expect(page.locator('body')).not.toHaveClass(/projection-mode/);
  await expect(await page.evaluate(() => {
    var state = window.GrammarAppState && window.GrammarAppState.state;
    return !!(state
      && state.projectionMode === false
      && state.teachingFullscreenRequested === false
      && state.drawerProjectionSize === 'half');
  })).toBe(true);
  await expect.poll(async () => page.evaluate(() => {
    return (window.__supabaseInserts || []).some(function(item) {
      return item.table === 'app_events'
        && item.rows
        && item.rows.event_type === 'projection_mode_exited'
        && item.rows.module === 'projection';
    });
  })).toBe(true);

  await page.locator('[data-dock-key="lesson-prep"]').click();
  await expect(page.locator('#page-lesson-prep')).toHaveClass(/active/);
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#prepList .prep-list-delete').first().click();
  await expect(page.locator('#prepStat')).toContainText('共 0 份');
  await expect.poll(async () => page.evaluate(() => {
    return (window.__supabaseDeletes || []).some(function(item) {
      return item.table === 'lesson_prep'
        && item.filters.user_id === 'smoke-user-1'
        && item.filters.client_id === 'prep_smoke_1';
    });
  })).toBe(true);

  expect(errors).toEqual([]);
});

test('account settings export, clear data, and account deletion request are tracked', async ({ page }) => {
  const errors = collectFatalBrowserErrors(page);
  await mockSignedInTeacher(page);

  await page.goto('/docs/grammar-fill/');
  await expect(page.locator('html')).toHaveClass(/ready/);
  await expect(page.locator('#userPill')).toContainText('smoke-teacher');

  await page.locator('#userPill button[title="账户设置"]').click();
  await expect(page.locator('#settingsModal')).toBeVisible();

  await page.locator('#settingsExportDataBtn').click();
  await expect.poll(async () => page.evaluate(() => (window.__downloads || []).length)).toBe(1);
  const exported = await page.evaluate(async () => {
    return JSON.parse(await window.__lastDownloadBlob.text());
  });
  expect(exported.app).toBe('seeklume');
  expect(exported.user.id).toBe('smoke-user-1');
  expect(exported.data.error_book).toHaveLength(1);
  expect(exported.data.lesson_prep).toHaveLength(1);
  expect(JSON.stringify(exported)).not.toContain('password');
  await expect.poll(async () => page.evaluate(() => {
    return (window.__supabaseInserts || []).some(function(item) {
      return item.table === 'app_events'
        && item.rows
        && item.rows.event_type === 'learning_data_exported'
        && item.rows.module === 'account-settings';
    });
  })).toBe(true);

  page.once('dialog', dialog => dialog.accept());
  await page.locator('#settingsClearDataBtn').click();
  await expect(page.locator('#settingsDataMsg')).toContainText('已清空');
  await expect(await page.evaluate(() => {
    return window.errorBookQuestions.length === 0 && window.prepPassages.length === 0;
  })).toBe(true);
  await expect.poll(async () => page.evaluate(() => {
    var deletes = window.__supabaseDeletes || [];
    return deletes.some(function(item) {
      return item.table === 'error_book' && item.filters.user_id === 'smoke-user-1' && !item.filters.client_id;
    }) && deletes.some(function(item) {
      return item.table === 'lesson_prep' && item.filters.user_id === 'smoke-user-1' && !item.filters.client_id;
    });
  })).toBe(true);

  page.once('dialog', dialog => dialog.accept());
  await page.locator('#settingsAccountDeleteBtn').click();
  await expect(page.locator('#settingsDataMsg')).toContainText('删除申请已提交');
  await expect(await page.evaluate(() => {
    return (window.__supabaseInserts || []).some(function(item) {
      return item.table === 'feedback_reports'
        && item.rows
        && item.rows.module === 'account-settings'
        && item.rows.category === 'feature'
        && item.rows.severity === 'P1'
        && item.rows.message.indexOf('删除账号') !== -1
        && item.rows.context
        && item.rows.context.request_type === 'account_deletion';
    });
  })).toBe(true);

  expect(errors).toEqual([]);
});

test('auth sign-in and sign-out update protected access', async ({ page }) => {
  const errors = collectFatalBrowserErrors(page);

  await page.goto('/docs/grammar-fill/');
  await expect(page.locator('html')).toHaveClass(/ready/);

  await page.locator('[data-dock-key="error-book"]').click();
  await expect(page.locator('#authModal')).toBeVisible();
  await fillAuthCredentials(page, 'login.teacher@example.com', 'correct-password');
  await page.locator('#authPrimaryBtn').click();

  await expect(page.locator('#authModal')).not.toBeVisible();
  await expect(page.locator('#userPill')).toContainText('login-teacher');

  await page.locator('[data-dock-key="error-book"]').click();
  await expect(page.locator('#page-error-book')).toHaveClass(/active/);
  await expect(page.locator('#errorBookStat')).toContainText('共 0 道');

  await page.evaluate(() => window.switchPage('admin'));
  await expect(page.locator('#page-admin')).toHaveClass(/active/);
  await expect(page.locator('#adminUserList')).toContainText('需要管理员权限');
  await expect(page.locator('#adminUserList')).not.toContainText('@example.com');

  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: '退出' }).click();
  await page.waitForURL('**/');

  expect(errors).toEqual([]);
});

test('local saved materials are isolated by account owner', async ({ page }) => {
  const errors = collectFatalBrowserErrors(page);
  await page.addInitScript(() => {
    window.__mockSupabaseUser = {
      id: 'current-owner',
      email: 'current.owner@example.com',
      user_metadata: { username: 'current-owner' }
    };
    window.__supabaseRows = {
      error_book: [],
      lesson_prep: []
    };
    localStorage.setItem('grammar-error-book', JSON.stringify({
      _owner: 'other-owner',
      items: [{
        id: 'err_other_1',
        no: 1,
        passage: 'Other user ___1___ data.',
        answer: 'private',
        category: 'word',
        analysis: 'Should not be visible.'
      }]
    }));
    localStorage.setItem('grammar-lesson-prep', JSON.stringify({
      _owner: 'other-owner',
      items: [{
        id: 'prep_other_1',
        title: 'Other User Lesson',
        passage: 'Other user ___1___ lesson.',
        blanks: [{ no: 1, answer: 'private', category: 'word', analysis: 'Should not be visible.' }]
      }]
    }));
  });

  await page.goto('/docs/grammar-fill/');
  await expect(page.locator('html')).toHaveClass(/ready/);

  await page.locator('[data-dock-key="error-book"]').click();
  await expect(page.locator('#page-error-book')).toHaveClass(/active/);
  await expect(page.locator('#errorBookStat')).toContainText('共 0 道');
  await expect(page.locator('#errorBookList')).not.toContainText('private');

  await page.locator('[data-dock-key="lesson-prep"]').click();
  await expect(page.locator('#page-lesson-prep')).toHaveClass(/active/);
  await expect(page.locator('#prepStat')).toContainText('共 0 份');
  await expect(page.locator('#prepList')).not.toContainText('Other User Lesson');

  await expect(await page.evaluate(() => {
    return !localStorage.getItem('grammar-error-book')
      && !localStorage.getItem('grammar-lesson-prep')
      && window.errorBookQuestions.length === 0
      && window.prepPassages.length === 0;
  })).toBe(true);

  expect(errors).toEqual([]);
});

test('admin view-as is readable but does not write viewed user data', async ({ page }) => {
  const errors = collectFatalBrowserErrors(page);
  await page.addInitScript(() => {
    window.__mockSupabaseUser = {
      id: 'admin-user',
      email: 'admin@example.com',
      user_metadata: { username: 'admin-teacher' }
    };
    window.__mockIsAdmin = true;
    window.__mockAdminUsers = [{
      id: 'target-teacher',
      email: 'target.teacher@example.com',
      username: 'target-teacher',
      approved: true,
      created_at: '2026-05-01T00:00:00Z',
      last_sign_in_at: '2026-05-20T08:00:00Z',
      error_count: 1,
      prep_count: 1
    }];
    window.__supabaseRows = {
      error_book: [],
      lesson_prep: [],
      feedback_reports: [{
        id: 'feedback-smoke-1',
        user_id: 'target-teacher',
        category: 'bug',
        severity: 'P1',
        status: 'new',
        reproducible: 'yes',
        affected_users_count: 2,
        source: 'user',
        module: 'lesson-prep',
        message: 'AI 解析按钮点击后没有反应',
        context: { browser: 'smoke' },
        created_at: '2026-05-28T01:00:00Z'
      }]
    };
    window.__supabaseRowsByUser = {
      'target-teacher': {
        error_book: [{
          client_id: 'err_target_1',
          question: {
            no: 1,
            passage: 'Target teacher ___1___(save) this question.',
            answer: 'saved',
            category: 'predicate',
            analysis: 'Target teacher data should be readable by admin only.'
          }
        }],
        lesson_prep: [{
          client_id: 'prep_target_1',
          passage: {
            title: 'Target Teacher Lesson',
            passage: 'Target teacher ___1___ lesson.',
            blanks: [{ no: 1, answer: 'saved', category: 'predicate', analysis: 'readonly' }]
          }
        }]
      }
    };
  });

  await page.goto('/docs/grammar-fill/?admin');
  await expect(page.locator('html')).toHaveClass(/ready/);
  await expect(page.locator('#userPill')).toContainText('管理员');
  await expect(page.locator('#page-admin')).toHaveClass(/active/);
  await expect(page.locator('#adminStat')).toContainText('共 1 个用户');
  await expect(page.locator('#adminUserList')).toContainText('target-teacher');
  await expect(page.locator('#adminFeedbackStat')).toContainText('最近 1 条反馈');
  await expect(page.locator('#adminFeedbackList')).toContainText('AI 解析按钮点击后没有反应');
  await expect(page.locator('#adminFeedbackList')).toContainText('新反馈');
  await page.locator('#adminFeedbackList button', { hasText: '已分诊' }).click();
  await expect(page.locator('#adminFeedbackList')).toContainText('已分诊');
  await expect(await page.evaluate(() => {
    return (window.__supabaseUpdates || []).some(function(item) {
      return item.table === 'feedback_reports'
        && item.filters.id === 'feedback-smoke-1'
        && item.rows.status === 'triaged';
    });
  })).toBe(true);

  await page.locator('#adminUserList .prep-list-item').first().click();
  await expect(page.locator('#adminBanner')).toBeVisible();
  await expect(page.locator('#adminViewingEmail')).toContainText('target-teacher');
  await expect(page.locator('#page-error-book')).toHaveClass(/active/);
  await expect(page.locator('#errorBookList')).toContainText('saved');

  await page.evaluate(() => window.cloud.upsertErrorItem({
    id: 'err_should_not_write',
    no: 2,
    passage: 'Admin attempted write.',
    answer: 'blocked',
    category: 'predicate'
  }));
  await expect(await page.evaluate(() => {
    return !(window.__supabaseInserts || []).some(function(item) {
      return item.table === 'error_book' && item.operation === 'upsert';
    });
  })).toBe(true);

  await page.evaluate(() => window.exitViewAs());
  await expect(page.locator('#adminBanner')).not.toBeVisible();
  await expect(page.locator('#page-admin')).toHaveClass(/active/);

  expect(errors).toEqual([]);
});

test('Word upload imports AI parse success into lesson prep', async ({ page }) => {
  const errors = collectFatalBrowserErrors(page);
  await mockSignedInTeacher(page);
  await page.addInitScript(() => {
    window.__mockDocxRawText = [
      'Smoke AI Success',
      'Teachers ___1___(use) structured questions in class. Students review the answer carefully.'
    ].join('\\n');
  });

  let parseRequests = 0;
  await page.route('**/functions/v1/deepseek-parse', route => {
    parseRequests += 1;
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        passages: [{
          title: 'Smoke AI Success Lesson',
          passage: 'Teachers ___1___(use) structured questions in class. Students review the answer carefully.',
          blanks: [{
            no: 1,
            answer: 'use',
            category: 'predicate',
            fine_category: 'pred-tense-present',
            analysis: '主语 Teachers 为复数，一般现在时用 use。'
          }]
        }]
      })
    });
  });

  await page.goto('/docs/grammar-fill/');
  await expect(page.locator('html')).toHaveClass(/ready/);
  await page.locator('[data-dock-key="lesson-prep"]').click();
  await expect(page.locator('#page-lesson-prep')).toHaveClass(/active/);
  await expect(page.locator('#prepStat')).toContainText('共 1 份');

  await page.setInputFiles('#docxFileInput', {
    name: 'ai-parse-success-smoke.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    buffer: Buffer.from('smoke docx placeholder')
  });

  await expect(page.locator('#unifiedImportOverlay')).toBeVisible();
  await expect(page.locator('#unifiedImportTitle')).toContainText('Smoke AI Success Lesson');
  await expect(page.locator('#unifiedImportSummary')).toContainText('1 篇 · 共 1 题');
  await expect(page.locator('#unifiedImportBody')).toContainText('use');
  expect(parseRequests).toBeGreaterThan(0);

  let importDialogMessage = '';
  page.once('dialog', async dialog => {
    importDialogMessage = dialog.message();
    await dialog.accept();
  });
  await page.locator('#unifiedImportOverlay button', { hasText: '确认导入' }).click();
  await expect.poll(() => importDialogMessage).toContain('已导入备课资料 1 篇');

  await expect(page.locator('#unifiedImportOverlay')).not.toBeVisible();
  await expect(page.locator('#prepStat')).toContainText('共 2 份');
  await expect(page.locator('#prepList')).toContainText('Smoke AI Success Lesson');
  await expect(await page.evaluate(() => {
    return window.prepPassages.some(function(item) {
      return item.title === 'Smoke AI Success Lesson'
        && item.blanks
        && item.blanks.length === 1
        && item.blanks[0].answer === 'use';
    });
  })).toBe(true);

  await expect.poll(async () => page.evaluate(() => {
    return (window.__supabaseInserts || []).some(function(item) {
      return item.table === 'app_events'
        && item.rows
        && item.rows.event_type === 'ai_parse_chunk_success'
        && item.rows.module === 'word-import';
    });
  })).toBe(true);

  await expect.poll(async () => page.evaluate(() => {
    return (window.__supabaseInserts || []).some(function(item) {
      return item.table === 'app_events'
        && item.rows
        && item.rows.event_type === 'ai_parse_completed'
        && item.rows.severity === 'info'
        && item.rows.context
        && item.rows.context.fallback_count === 0;
    });
  })).toBe(true);

  expect(errors).toEqual([]);
});

test('Word upload records AI parse failures and opens fallback import', async ({ page }) => {
  const errors = collectFatalBrowserErrors(page);
  await mockSignedInTeacher(page);
  await page.addInitScript(() => {
    window.__mockDocxRawText = [
      'Smoke AI Failure',
      'The teacher ___1___(prepare) a lesson before class. Students listened carefully and wrote notes.'
    ].join('\\n');
  });

  let parseRequests = 0;
  await page.route('**/functions/v1/deepseek-parse', route => {
    parseRequests += 1;
    route.fulfill({
      status: 502,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'AI 返回的内容无法解析为 JSON。' })
    });
  });

  await page.goto('/docs/grammar-fill/');
  await expect(page.locator('html')).toHaveClass(/ready/);
  await page.locator('[data-dock-key="lesson-prep"]').click();
  await expect(page.locator('#page-lesson-prep')).toHaveClass(/active/);

  await page.setInputFiles('#docxFileInput', {
    name: 'ai-parse-failure-smoke.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    buffer: Buffer.from('smoke docx placeholder')
  });

  await expect(page.locator('#unifiedImportOverlay')).toBeVisible();
  await expect(page.locator('#unifiedImportSummary')).toContainText('1 篇 · 共 1 题');
  await expect(page.locator('#unifiedImportBody')).toContainText('第 1 题');
  expect(parseRequests).toBeGreaterThan(0);

  await expect.poll(async () => page.evaluate(() => {
    return (window.__supabaseInserts || []).some(function(item) {
      return item.table === 'app_events'
        && item.rows
        && item.rows.event_type === 'ai_parse_http_failed'
        && item.rows.module === 'word-import'
        && String(item.rows.context || '').indexOf('token') === -1
        && String(item.rows.context || '').indexOf('password') === -1;
    });
  })).toBe(true);

  await expect.poll(async () => page.evaluate(() => {
    return (window.__supabaseInserts || []).some(function(item) {
      return item.table === 'app_events'
        && item.rows
        && item.rows.event_type === 'ai_parse_completed'
        && item.rows.severity === 'warning'
        && item.rows.context
        && item.rows.context.fallback_count === 1;
    });
  })).toBe(true);

  expect(errors.filter(error => !error.includes('502 (Bad Gateway)'))).toEqual([]);
});

test('teaching-render pure html output', async ({ page }) => {
  await page.goto('/docs/grammar-fill/');
  await expect(page.locator('html')).toHaveClass(/ready/);
  await page.waitForFunction(() => !!window.GrammarTeachingGuide);

  const out = await page.evaluate(() => {
    const R = window.GrammarTeachingRender;
    if (!R) return { missing: true };
    const practical = R.practicalGuideHtml({
      title: '考点：谓语动词', trigger: '抓主语和时间线索。',
      steps: ['第一步', '第二步'], commonMistake: '只看最近名词。'
    });
    const solveDual = R.solutionCard({ hasSolve: true, solveText: '先看括号', pointText: '考查动词' });
    const solvePoint = R.solutionCard({ pointText: '考查时态' });
    const solutionPanel = R.solutionPanelHtml({ answer: 'learn', solve: '先看括号', explanation: '考查动词' });
    const theoryCategory = Object.keys(window.KNOWLEDGE_DATA || {})[0] || '谓语动词';
    const theory = R.theoryContent({ category: theoryCategory, fine_category: '', answer: 'learn' }, {
      knowledgeData: window.KNOWLEDGE_DATA || {}, categoryMap: window.CATEGORY_MAP || {},
      safeQuestionFocus: function() { return { key: theoryCategory, label: theoryCategory, note: '' }; },
      getFineTagInfo: function() { return null; }
    });
    const emptyTheory = R.theoryContent({ category: 'missing-smoke' }, {
      knowledgeData: {}, categoryMap: { 'missing-smoke': '缺失考点' },
      safeQuestionFocus: function() { return { key: 'missing-smoke', label: '缺失考点', note: '' }; },
      getFineTagInfo: function() { return null; }
    });
    const guideHtml = R.teachingGuideHtml({ category: '谓语动词', answer: 'learn' }, null, {
      getTeachingHeaderInfo: function() { return { headline: 'G', subline: 'S', practicalGuide: null }; }
    });
    return {
      missing: false,
      practicalHasCard: practical.includes('teacher-quick-card'),
      practicalHasStepNo: practical.includes('teacher-quick-step-no'),
      solveDualHasToggle: solveDual.includes('analysis-solution-card sol-dual') && solveDual.includes('做题思路'),
      solvePointPlain: solvePoint.includes('analysis-solution-card') && !solvePoint.includes('sol-dual'),
      solutionPanelHasCard: solutionPanel.includes('analysis-solution-card'),
      theoryHasNowCard: theory.includes('theory-now-card') && theory.includes('lesson-path-chip'),
      emptyTheoryHint: emptyTheory.includes('empty-hint'),
      guideHasTitle: guideHtml.includes('teaching-tab-heading') && guideHtml.includes('teaching-tab-kicker')
    };
  });

  expect(out.missing).toBe(false);
  expect(out.practicalHasCard).toBe(true);
  expect(out.practicalHasStepNo).toBe(true);
  expect(out.solveDualHasToggle).toBe(true);
  expect(out.solvePointPlain).toBe(true);
  expect(out.solutionPanelHasCard).toBe(true);
  expect(out.theoryHasNowCard).toBe(true);
  expect(out.emptyTheoryHint).toBe(true);
  expect(out.guideHasTitle).toBe(true);
});
