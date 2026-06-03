// grammar-fill/modules/home-dashboard.js
//
// 职责：智能 Dashboard 主页（Sprint 1.6）+ 课堂切换器 + 真题网格 控制器。
//       按用户数据状态自适应渲染主页行动入口；渲染/驱动讲题界面顶部的课堂切换器
//       （切换套卷 / 切换题目 / 上下题导航 / 答案显隐）；渲染套卷网格。
// 用法：从 index.html 的同名薄壳调用，公开入口需传入 deps（依赖注入对象）。
//       模块内保存最近一次 deps（_d），函数间互调走模块内部直接调用。
// 依赖（deps）：
//   escapeHtml(s)                      HTML 转义（= window.escapeHtml）
//   switchPage(page)                   切换页面
//   navigateHome(view)                 切换 home 子视图
//   setKnowledgeView(view)             切换知识库视图
//   openTextbookModal(book)            打开教材弹窗
//   getCurrentQuestionIndex()          当前题序号（共享访问器，留在 index.html 顶层）
//   getPracticeContextSnapshot()       读练习上下文快照
//   getSelectedQuestionSnapshot()      读选中题快照
//   getTeachingSessionSnapshot()       读教学会话快照
//   getPracticeDisplaySnapshot()       读练习显示快照（showAnswers 等）
//   findBlankIndex()                   当前空格序号
//   startByExam(examId)                按套卷开练
//   showAnalysisByIdx(idx)             跳到指定题解析
//   inlineSidebarAction(...)           侧边栏 onclick 帮手（renderExamGrid 用）
//   getPrepPassages()                  getter：备课资料数组（可变引用，必须用 getter）
//   getErrorBookQuestions()            getter：错题本数组（可变引用，必须用 getter）
//   BANK                               题库常量
//   CATEGORY_MAP                       考点映射常量
// 全局依赖（window.Grammar*，直接调用）：
//   GrammarHomeDashboardModel / GrammarHomeRender / GrammarQuestionModel /
//   GrammarClassroomSwitcherModel / GrammarExamGridModel
//   window.GRAMMAR_FINE_TAGS（教材单元数据）

/* eslint-disable */
(function(){
  var _d = null; // 最近一次注入的 deps

  function inlineHomeDashboardAction(action) {
    action = action || {};
    return _d.escapeHtml('runHomeDashboardAction('
      + JSON.stringify(String(action.type || '')) + ','
      + JSON.stringify(String(action.value == null ? '' : action.value)) + ')');
  }

  function runHomeDashboardAction(type, value, deps) {
    _d = deps || _d;
    var plan = window.GrammarHomeDashboardModel.buildDashboardActionExecutionPlan({ type: type, value: value });
    function runStep(step) {
      step = step || {};
      if (step.kind === 'switch-page') {
        _d.switchPage(step.page);
      } else if (step.kind === 'navigate-home') {
        _d.navigateHome(step.view);
      } else if (step.kind === 'click-upload-button') {
        var btn = document.querySelector(step.selector);
        if (btn) btn.click();
      } else if (step.kind === 'set-knowledge-view') {
        _d.setKnowledgeView(step.view);
      } else if (step.kind === 'open-textbook-modal') {
        _d.openTextbookModal(step.book);
      }
    }
    (plan.immediateSteps || []).forEach(runStep);
    (plan.delayedSteps || []).forEach(function(step) {
      setTimeout(function() {
        runStep(step);
      }, Number(step.delayMs) || 0);
    });
  }

  function renderHomeDashboard(deps) {
    _d = deps || _d;
    var el = document.getElementById('homeDashboardContent');
    if (!el) return;

    var prep = _d.getPrepPassages();
    var err = _d.getErrorBookQuestions();
    var prepCount = prep ? prep.length : 0;
    var errCount  = err ? err.length : 0;
    var dashboardModel = window.GrammarHomeDashboardModel.buildDashboardModel({
      prepCount: prepCount,
      errorCount: errCount,
      textbookUnits: window.GRAMMAR_FINE_TAGS && window.GRAMMAR_FINE_TAGS.textbook_units
    });
    var html = window.GrammarHomeRender.homeDashboardHtml(dashboardModel, { inlineHomeDashboardAction: inlineHomeDashboardAction });
    el.innerHTML = html;
  }

  function getOrderedExams() {
    return window.GrammarQuestionModel.getOrderedExams(_d.BANK.exams);
  }

  function renderClassroomSwitcher(deps) {
    _d = deps || _d;
    var bar = document.getElementById('classroomSwitcher');
    if (!bar) return;
    var practiceContext = _d.getPracticeContextSnapshot();
    var idx = _d.getCurrentQuestionIndex();
    var displayState = _d.getPracticeDisplaySnapshot();
    var model = window.GrammarClassroomSwitcherModel.buildClassroomSwitcherModel({
      currentExam: practiceContext.currentExam,
      currentQuestions: practiceContext.currentQuestions,
      currentQuestionIndex: idx,
      orderedExams: getOrderedExams(),
      categoryMap: _d.CATEGORY_MAP,
      showAnswers: displayState.showAnswers
    });
    if (!model.visible) {
      bar.style.display = 'none';
      return;
    }
    bar.style.display = '';

    var examSelect = document.getElementById('classroomExamSelect');
    if (examSelect) {
      examSelect.innerHTML = model.examSelect.options.map(function(option) {
        return '<option value="' + _d.escapeHtml(option.value) + '"' + (option.selected ? ' selected' : '') + '>' + _d.escapeHtml(option.label) + '</option>';
      }).join('');
      examSelect.disabled = model.examSelect.disabled;
      examSelect.title = model.examSelect.title;
    }

    var questionSelect = document.getElementById('classroomQuestionSelect');
    if (questionSelect) {
      questionSelect.innerHTML = model.questionSelect.options.map(function(option) {
        return '<option value="' + option.value + '"' + (option.selected ? ' selected' : '') + '>' + _d.escapeHtml(option.label) + '</option>';
      }).join('');
      questionSelect.disabled = model.questionSelect.disabled;
    }

    var answerBtn = document.getElementById('classroomAnswerBtn');
    if (answerBtn) {
      answerBtn.textContent = model.answerButton.label;
      answerBtn.classList.toggle('primary', model.answerButton.primary);
    }

    var progress = document.getElementById('classroomProgress');
    if (progress) {
      progress.textContent = model.progressText;
    }
  }

  function navigateExam(delta, deps) {
    _d = deps || _d;
    var practiceContext = _d.getPracticeContextSnapshot();
    var plan = window.GrammarClassroomSwitcherModel.buildExamNavigationPlan(practiceContext.currentExam, getOrderedExams(), delta);
    if (plan.action === 'start-exam' && plan.examId) _d.startByExam(plan.examId);
  }

  function jumpToExamFromSwitcher(examId, deps) {
    _d = deps || _d;
    var practiceContext = _d.getPracticeContextSnapshot();
    var plan = window.GrammarClassroomSwitcherModel.buildExamSelectPlan(practiceContext.currentExam, examId);
    if (plan.action === 'start-exam' && plan.examId) _d.startByExam(plan.examId);
  }

  function jumpToQuestionFromSwitcher(value, deps) {
    _d = deps || _d;
    var practiceContext = _d.getPracticeContextSnapshot();
    var plan = window.GrammarClassroomSwitcherModel.buildQuestionSelectPlan(practiceContext.currentQuestions, value);
    if (plan.action === 'show-analysis') _d.showAnalysisByIdx(plan.index);
  }

  function jumpQuestionFromSwitcher(delta, deps) {
    _d = deps || _d;
    var practiceContext = _d.getPracticeContextSnapshot();
    var plan = window.GrammarClassroomSwitcherModel.buildQuestionNavigationPlan(
      practiceContext.currentQuestions,
      _d.getCurrentQuestionIndex(),
      delta
    );
    if (plan.action === 'show-analysis') _d.showAnalysisByIdx(plan.index);
  }

  function renderExamGrid(deps) {
    _d = deps || _d;
    var grid = document.getElementById('examGrid');
    if (!grid) return;
    var model = window.GrammarExamGridModel.buildExamGridModel(_d.BANK.exams);
    var html = window.GrammarHomeRender.examGridHtml(model, { inlineSidebarAction: _d.inlineSidebarAction });
    grid.innerHTML = html;
  }

  window.GrammarHomeDashboard = {
    inlineHomeDashboardAction: inlineHomeDashboardAction,
    runHomeDashboardAction: runHomeDashboardAction,
    renderHomeDashboard: renderHomeDashboard,
    getOrderedExams: getOrderedExams,
    renderClassroomSwitcher: renderClassroomSwitcher,
    navigateExam: navigateExam,
    jumpToExamFromSwitcher: jumpToExamFromSwitcher,
    jumpToQuestionFromSwitcher: jumpToQuestionFromSwitcher,
    jumpQuestionFromSwitcher: jumpQuestionFromSwitcher,
    renderExamGrid: renderExamGrid
  };
})();
