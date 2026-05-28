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
    var nextSession = stateModel && stateModel.createTeachingSession(2, { tab: 'analysis' }, null, {
      normalizeTab: viewModel.normalizeTab
    });
    var resetDisplay = stateModel && stateModel.resetPracticeDisplayState();
    var toggledAnswers = stateModel && stateModel.togglePracticeAnswers({ showAnswers: false, showChinese: true });
    var toggledChineseOn = stateModel && stateModel.togglePracticeChinese({ showAnswers: true, showChinese: false });
    var toggledChineseOff = stateModel && stateModel.togglePracticeChinese({ showAnswers: false, showChinese: true });
    var clampedFontLow = stateModel && stateModel.clampFontSize(4);
    var clampedFontHigh = stateModel && stateModel.clampFontSize(72);
    var adjustedFont = stateModel && stateModel.adjustFontSize(24, 2);
    var fontScalePassage = stateModel && stateModel.buildFontScaleState({ passageFontSize: 24, drawerFontSize: 24 }, 'passage', -20);
    var fontScaleDrawer = stateModel && stateModel.buildFontScaleState({ passageFontSize: 24, drawerFontSize: 24 }, 'drawer', 30);
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
    var guide = guideModel && guideModel.getQuestionPracticalGuide(question, {
      nonpAxis: axis,
      focus: { key: question.category, label: question.category_name, note: '' },
      categoryMap: window.CATEGORY_MAP || {},
      categoryTips: window.CATEGORY_TIPS || {}
    });
    var teachingCard = guideModel && guideModel.getQuestionTeachingGuide(question, {
      focus: focusFromModule,
      trap: null
    });
    var lessonPath = guideModel && guideModel.getQuestionLessonPath(question, focusFromModule, null, {
      categoryMap: window.CATEGORY_MAP || {}
    });
    var graphNode = viewModel && viewModel.getGraphNodeIdForQuestion(question, {
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
    var migrationModel = window.GrammarMigrationTraining;
    var homeModel = window.GrammarHomeDashboardModel;
    var examGridModel = window.GrammarExamGridModel;
    var classroomSwitcherModel = window.GrammarClassroomSwitcherModel;
    var practiceViewModel = window.GrammarPracticeViewModel;
    var sidebarModel = window.GrammarSidebarViewModel;
    var knowledgeModel = window.GrammarKnowledgeViewModel;
    var savedModel = window.GrammarSavedMaterialsModel;
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
    var teachingGraph = (window.GRAMMAR_KNOWLEDGE_CORE && window.GRAMMAR_KNOWLEDGE_CORE.teaching_graph) || {};
    var graphIndex = viewModel && viewModel.buildGraphNodeIndex(teachingGraph, (window.GRAMMAR_KNOWLEDGE_CORE && window.GRAMMAR_KNOWLEDGE_CORE.nodes) || {});
    var relevantGraphIds = viewModel && viewModel.getGraphRelevantIds('teach_start', teachingGraph, graphIndex);
    var graphBounds = viewModel && viewModel.getGraphBoundsForNodes(relevantGraphIds, graphIndex);
    var graphTextLines = viewModel && viewModel.renderGraphTextLines('This is a long graph node label for smoke testing', 12, 2);
    var graphPreset = viewModel && viewModel.getGlobalGraphFocusPreset('verb');
    var graphNode = graphIndex && graphIndex.predicate_core;
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
    var sidebarExamGroups = sidebarModel && sidebarModel.groupExamsByYear(window.GRAMMAR_BANK.exams || [], exam.exam_id);
    var examGrid = examGridModel && examGridModel.buildExamGridModel([
      { exam_id: '2025-smoke', year: 2025, type: '真题', blank_count: 10 },
      { exam_id: '2026-smoke', year: 2026, type: '模拟卷', questions: [{}, {}] },
      { exam_id: 'unknown-smoke', type: '模拟题', questions: [{}] }
    ]);
    var classroomSwitcher = classroomSwitcherModel && classroomSwitcherModel.buildClassroomSwitcherModel({
      currentExam: { mode: 'exam', examId: exam.exam_id, source: exam.exam_id },
      currentQuestions: examState.currentQuestions,
      currentQuestionIndex: 2,
      orderedExams: [exam],
      categoryMap: window.CATEGORY_MAP || {},
      showAnswers: true
    });
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
    var fineCategoryModel = knowledgeModel && knowledgeModel.buildFineCategoryModel(
      window.GRAMMAR_FINE_TAGS || {},
      window.GRAMMAR_BANK.questions || [],
      [question]
    );
    var textbookModel = knowledgeModel && knowledgeModel.buildTextbookModel(
      window.GRAMMAR_FINE_TAGS || {},
      window.GRAMMAR_BANK.questions || [],
      [question]
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
    var errorListModel = savedModel && savedModel.buildErrorListModel(errorImport.imported, window.CATEGORY_MAP || {});
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
    var prepListModel = savedModel && savedModel.buildPrepListModel(prepImport.imported, window.CATEGORY_MAP || {});
    var prepState = savedModel && savedModel.createPrepStateForPassage(prepImport.imported[0], window.CATEGORY_MAP || {}, window.CATEGORY_TIPS || {});
    return !!(axis && axis.title && axis.formLabel && tab === 'guide' && graphNode
      && focusFromModule && focusFromModule.key && trapIdFromModule
      && teachingCard && teachingCard.headline && lessonPath && lessonPath.length
      && mindmap && mindmap.center && mindmapActive && Object.keys(mindmapActive).length
      && migrationKeys && migrationKeys.length && migrationOverlap === true
      && migrationData && migrationData.tabs && migrationData.tabs.length === 3
      && migrationData.headerLabel && migrationData.poolCount >= migrationData.migration.length
      && migrationData.migration && migrationData.migration.length
      && migrationData.migration[0].tagLabel && typeof migrationData.migration[0].teachingLine === 'string'
      && graphIndex && graphIndex.teach_start
      && relevantGraphIds && relevantGraphIds.indexOf('teach_start') !== -1
      && graphBounds && graphBounds.w > 0 && graphBounds.h > 0
      && graphTextLines && graphTextLines.length === 2
      && graphPreset && graphPreset.nodeId === 'verb_identity_gate'
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
      && guide && guide.title && guide.migrationKeys && guide.migrationKeys.length
      && examQuestion && examQuestion.exam_id === exam.exam_id
      && examState && examState.currentQuestions && examState.currentQuestions.length === 10
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
      && previousViewLabel === '返回套卷列表'
      && dockPracticeLabel === '返回备课资料'
      && dockKnowledgeLabel === '返回全局图谱'
      && nextSession && nextSession.idx === 2 && nextSession.tab === 'guide'
      && resetDisplay && resetDisplay.showAnswers === false && resetDisplay.showChinese === false
      && toggledAnswers && toggledAnswers.showAnswers === true && toggledAnswers.showChinese === false
      && toggledChineseOn && toggledChineseOn.showAnswers === false && toggledChineseOn.showChinese === true
      && toggledChineseOff && toggledChineseOff.showAnswers === false && toggledChineseOff.showChinese === false
      && clampedFontLow === 12
      && clampedFontHigh === 48
      && adjustedFont === 26
      && fontScalePassage && fontScalePassage.passageFontSize === 12 && fontScalePassage.drawerFontSize === 24
      && fontScaleDrawer && fontScaleDrawer.passageFontSize === 24 && fontScaleDrawer.drawerFontSize === 48
      && normalizedHomeView === 'cards'
      && examHomeState && examHomeState.currentHomeView === 'exams' && examHomeState.dockKey === 'exams'
      && categoryDockKey === 'categories'
      && normalizedKnowledgeView === 'map'
      && knowledgeNodeState && knowledgeNodeState.currentKnowledgeView === 'system-node'
      && knowledgeNodeState.currentKnowledgeKey === 'predicate'
      && knowledgeNodeState.currentKnowledgeNodeId === 'teach_start'
      && knowledgeNodeState.currentIsPattern === true
      && examGrid && examGrid.groups && examGrid.groups.length === 3
      && examGrid.groups[0].year === '2026'
      && examGrid.groups[0].items[0].tagClass === 'green'
      && examGrid.groups[0].items[0].blankCount === 2
      && examGrid.groups[2].year === '未知'
      && examGridModel.getExamTagClass('真题') === ''
      && examGridModel.getExamTagClass('模拟题') === 'green'
      && classroomSwitcher && classroomSwitcher.visible === true
      && classroomSwitcher.examSelect.disabled === false
      && classroomSwitcher.examSelect.options[0].selected === true
      && classroomSwitcher.questionSelect.options[2].selected === true
      && classroomSwitcher.answerButton.label === '隐藏答案'
      && classroomSwitcher.answerButton.primary === true
      && classroomSwitcher.progressText.indexOf('3/10') === 0
      && localClassroomSwitcher && localClassroomSwitcher.examSelect.disabled === true
      && localClassroomSwitcher.examSelect.options[0].label === 'Smoke Prep'
      && localClassroomSwitcher.answerButton.label === '显示答案'
      && practiceHeader && practiceHeader.sourceName === 'Smoke Source'
      && practiceHeader.sourceCountText === '共10题'
      && toggleChineseModel && toggleChineseModel.answerVisible === false
      && toggleChineseModel.chineseText === '英/中'
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
      && sidebarCategoryItems && sidebarCategoryItems.some(function(item) { return item.category === question.category && item.active; })
      && sidebarErrorGroups && sidebarErrorGroups.length === 1 && sidebarErrorGroups[0].items.length === 1
      && sidebarPrepItems && sidebarPrepItems.length === 1 && sidebarPrepItems[0].active
      && sidebarModel.getExamTagClass('模拟卷') === ' green'
      && pageSidebarModel && pageSidebarModel.kind === 'categories'
      && hiddenHomeSidebar && hiddenHomeSidebar.hidden === true
      && contextSidebarModel && contextSidebarModel.kind === 'exam-groups'
      && newUserDashboard && newUserDashboard.activity.isNewUser === true
      && newUserDashboard.activity.greeting === '早上好'
      && newUserDashboard.books && newUserDashboard.books.length === 7
      && newUserDashboard.books[0].cover.indexOf('bixiu-1.jpg') !== -1
      && activeDashboard && activeDashboard.activity.isNewUser === false
      && activeDashboard.activity.greeting === '晚上好'
      && activeDashboard.activity.statusText === '2 份备课 · 3 道错题'
      && activeDashboard.actions && activeDashboard.actions.length === 4
      && categoryStatsModel && categoryStatsModel.items && categoryStatsModel.items.length
      && categoryStatsModel.items.reduce(function(sum, item) { return sum + item.count; }, 0) === 10
      && knowledgeModel.normalizeTagId('aux:smoke-tag') === 'smoke-tag'
      && knowledgeModel.stripHtml('<b>谓语</b>动词').indexOf('谓语') !== -1
      && knowledgeSearchIndex && knowledgeSearchIndex.length
      && knowledgeSearch && knowledgeSearch.results && knowledgeSearch.results.length
      && knowledgeSearch.results[0].snippetParts && knowledgeSearch.results[0].snippetParts.some(function(part) { return part.match; })
      && fineCategoryModel && fineCategoryModel.categories && fineCategoryModel.categories.length
      && fineCategoryModel.categories.some(function(group) { return group.stats && group.stats.tagCount > 0; })
      && textbookModel && textbookModel.books && textbookModel.books.length === 7
      && textbookModel.booksById['必修一'] && textbookModel.booksById['必修一'].cover.indexOf('bixiu-1.jpg') !== -1
      && firstTextbookUnit && firstTextbookUnit.tagIds.length && firstTextbookUnit.totalQuestions >= 0
      && unitQuestionList && unitQuestionList.counts && unitQuestionList.counts.all >= unitQuestionList.visibleItems.length
      && errorImport && errorImport.imported.length === 1
      && errorImport.skippedDuplicate === 1
      && errorImport.skippedInvalid === 1
      && errorListModel && errorListModel.groups.length === 1
      && prepImport && prepImport.imported.length === 1
      && prepImport.skippedDuplicate === 1
      && prepImport.skippedInvalid === 1
      && prepListModel && prepListModel.items.length === 1 && prepListModel.items[0].blankCount === 1
      && prepState && prepState.currentExam.mode === 'prep' && prepState.currentQuestions.length === 1
      && prepState.currentQuestions[0].technique.indexOf('考点：') === 0);
  })).toBe(true);

  await page.locator('[data-dock-key="exams"]').click();
  await expect(page.locator('#homeExams')).toHaveClass(/active/);
  await expect(await page.evaluate(() => {
    var state = window.GrammarAppState && window.GrammarAppState.state;
    var activeDock = document.querySelector('.dock-item.active');
    return !!(state && state.currentHomeView === 'exams' && activeDock && activeDock.dataset.dockKey === 'exams');
  })).toBe(true);
  await expect(page.locator('#examGrid .card').first()).toBeVisible();
  await expect(page.locator('#contextSidebar')).toBeVisible();
  await expect(page.locator('#contextSidebarContent')).toContainText('全部套卷');

  await page.locator('#examGrid .card').first().click();
  await expect(page.locator('#page-practice')).toHaveClass(/active/);
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
  await page.locator('[data-dock-key="knowledge"]').click();
  await expect(page.locator('#page-knowledge')).toHaveClass(/active/);
  await page.locator('#knowledgeTextbookBtn').click();
  await expect(page.locator('#knowledgeTextbookBtn')).toHaveClass(/active/);
  await expect(await page.evaluate(() => {
    return window.GrammarAppState
      && window.GrammarAppState.state.currentKnowledgeView === 'textbook'
      && window.GrammarAppState.state.currentKnowledgeNodeId === '';
  })).toBe(true);
  await expect(page.locator('#knowledgeContent')).toContainText(/必修一/);
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
    return !!(window.GrammarAppState
      && window.GrammarAppState.state.currentKnowledgeView === 'book'
      && window.GrammarAppState.state.currentKnowledgeKey);
  })).toBe(true);
  await page.locator('#knowledgeSearch').fill('谓语');
  await expect(page.locator('#searchResults .search-result-item').first()).toBeVisible();

  await page.locator('[data-dock-key="categories"]').click();
  await expect(page.locator('#homeCategories')).toHaveClass(/active/);
  await expect(await page.evaluate(() => {
    var state = window.GrammarAppState && window.GrammarAppState.state;
    var activeDock = document.querySelector('.dock-item.active');
    return !!(state && state.currentHomeView === 'categories' && activeDock && activeDock.dataset.dockKey === 'categories');
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
    return !!(state
      && state.currentExam
      && state.currentExam.mode === 'exam'
      && state.currentQuestions
      && state.currentQuestions.length === 10
      && state.showAnswers === false
      && state.showChinese === false);
  })).toBe(true);

  await page.locator('#passageBox .blank-inline').first().click();
  await expect(page.locator('#teachingStage')).toHaveClass(/open/);
  await expect(page.locator('#teachingStageMain')).toContainText(/讲题|第/);
  await expect(await page.evaluate(() => {
    var state = window.GrammarAppState && window.GrammarAppState.state;
    return !!(state
      && state.selectedQuestion
      && state.teachingSession
      && state.teachingSession.tab === 'guide'
      && state.teachingSession.idx === 0);
  })).toBe(true);

  await page.locator('#teachingDock button', { hasText: '迁移' }).click();
  await expect(page.locator('#teachingStageMain')).toContainText(/迁移训练/);
  await expect(page.locator('.teaching-migration-source-tabs')).toBeVisible();
  await expect(page.locator('#teachingStageMain')).toContainText(/真题库/);
  await expect(await page.evaluate(() => {
    return window.GrammarAppState
      && window.GrammarAppState.state.teachingSession
      && window.GrammarAppState.state.teachingSession.tab === 'migration';
  })).toBe(true);
  await page.locator('.teaching-migration-source-tabs button', { hasText: '全部' }).click();
  await expect(page.locator('.teaching-migration-source-tabs button.active')).toContainText('全部');
  await expect(await page.evaluate(() => localStorage.getItem('grammar-migration-source'))).toBe('all');
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

test('signed-in saved materials and projection paths render', async ({ page }) => {
  const errors = collectFatalBrowserErrors(page);
  await mockSignedInTeacher(page);

  await page.goto('/docs/grammar-fill/');
  await expect(page.locator('html')).toHaveClass(/ready/);

  await page.locator('[data-dock-key="error-book"]').click();
  await expect(page.locator('#page-error-book')).toHaveClass(/active/);
  await expect(page.locator('#errorBookStat')).toContainText('共 1 道');
  await expect(page.locator('#errorBookList')).toContainText('prepared');
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

  await page.locator('#prepList .prep-list-item').first().click();
  await expect(page.locator('#page-practice')).toHaveClass(/active/);
  await expect(page.locator('#sourceName')).toContainText('Smoke Test Lesson');
  await expect(page.locator('#passageBox .blank-inline')).toHaveCount(1);

  await page.locator('#btnProjection').click();
  await expect(page.locator('body')).toHaveClass(/projection-mode/);
  await expect(page.locator('#teachingStage')).toHaveClass(/open/);
  await expect(page.locator('#teachingStageMain')).toContainText(/讲题|第/);
  await expect.poll(async () => page.evaluate(() => {
    return (window.__supabaseInserts || []).some(function(item) {
      return item.table === 'app_events'
        && item.rows
        && item.rows.event_type === 'projection_mode_entered'
        && item.rows.module === 'projection';
    });
  })).toBe(true);

  await page.evaluate(() => window.exitProjectionMode && window.exitProjectionMode());
  await expect(page.locator('body')).not.toHaveClass(/projection-mode/);
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
