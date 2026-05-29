// grammar-fill/modules/classroom-switcher-model.js
//
// Pure model builders for the classroom switcher above the practice view.
// Rendering stays in index.html while option labels and state rules live here.

/* eslint-disable */
(function(){
  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function getExamBlankCount(exam) {
    exam = exam || {};
    return Number(exam.blank_count || 0) || asArray(exam.questions).length;
  }

  function getExamLabel(exam) {
    exam = exam || {};
    return (exam.exam_id || '') +
      (exam.type ? ' · ' + exam.type : '') +
      ' · ' + getExamBlankCount(exam) + '题';
  }

  function buildExamOptions(currentExam, orderedExams) {
    currentExam = currentExam || {};
    if (currentExam.mode !== 'exam') {
      return [{
        value: '',
        label: currentExam.source || '当前资料',
        selected: true
      }];
    }
    return asArray(orderedExams).map(function(exam) {
      exam = exam || {};
      return {
        value: exam.exam_id || '',
        label: getExamLabel(exam),
        selected: currentExam.examId === exam.exam_id
      };
    });
  }

  function buildQuestionOptions(questions, selectedIndex, categoryMap) {
    categoryMap = categoryMap || {};
    selectedIndex = Number(selectedIndex);
    return asArray(questions).map(function(question, index) {
      question = question || {};
      var category = categoryMap[question.category] || question.category || '语法填空';
      var answer = question.answer ? ' · ' + question.answer : '';
      return {
        value: index,
        label: '第' + question.no + '题 · ' + category + answer,
        selected: index === selectedIndex
      };
    });
  }

  function getProgressText(currentExam, questions, selectedIndex) {
    currentExam = currentExam || {};
    questions = asArray(questions);
    if (!questions.length) return '--';
    selectedIndex = Number(selectedIndex);
    var safeIndex = selectedIndex >= 0 ? selectedIndex : 0;
    var source = currentExam.mode === 'exam' ? currentExam.examId : currentExam.source;
    return (safeIndex + 1) + '/' + questions.length + ' · ' + (source || '当前资料');
  }

  function buildAnswerButtonModel(showAnswers) {
    return {
      label: showAnswers ? '隐藏答案' : '显示答案',
      primary: !!showAnswers
    };
  }

  function getCurrentExamIndex(currentExam, orderedExams) {
    currentExam = currentExam || {};
    if (currentExam.mode !== 'exam') return -1;
    var currentExamId = currentExam.examId || currentExam.exam_id || currentExam.exam || '';
    return asArray(orderedExams).findIndex(function(exam) {
      return String(exam && exam.exam_id || '') === String(currentExamId);
    });
  }

  function buildExamNavigationPlan(currentExam, orderedExams, delta) {
    currentExam = currentExam || {};
    var exams = asArray(orderedExams);
    if (currentExam.mode !== 'exam' || !exams.length) {
      return {
        action: 'none',
        examId: '',
        index: -1
      };
    }
    var idx = getCurrentExamIndex(currentExam, exams);
    if (idx === -1) idx = 0;
    var nextIdx = (idx + (Number(delta) || 0) + exams.length) % exams.length;
    return {
      action: 'start-exam',
      examId: exams[nextIdx] && exams[nextIdx].exam_id || '',
      index: nextIdx
    };
  }

  function buildExamSelectPlan(currentExam, examId) {
    currentExam = currentExam || {};
    if (!examId || currentExam.mode !== 'exam' || String(examId) === String(currentExam.examId || '')) {
      return {
        action: 'none',
        examId: ''
      };
    }
    return {
      action: 'start-exam',
      examId: String(examId)
    };
  }

  function buildQuestionSelectPlan(questions, value) {
    questions = asArray(questions);
    var idx = parseInt(value, 10);
    if (isNaN(idx) || idx < 0 || idx >= questions.length) {
      return {
        action: 'none',
        index: -1
      };
    }
    return {
      action: 'show-analysis',
      index: idx
    };
  }

  function buildQuestionNavigationPlan(questions, currentIndex, delta) {
    questions = asArray(questions);
    if (!questions.length) {
      return {
        action: 'none',
        index: -1
      };
    }
    var idx = Number(currentIndex);
    if (!isFinite(idx) || idx < 0) idx = 0;
    var nextIdx = (idx + (Number(delta) || 0) + questions.length) % questions.length;
    return {
      action: 'show-analysis',
      index: nextIdx
    };
  }

  function buildClassroomSwitcherModel(values) {
    values = values || {};
    var currentExam = values.currentExam || null;
    var questions = asArray(values.currentQuestions);
    if (!currentExam || !currentExam.mode || !questions.length) {
      return { visible: false };
    }
    var idx = Number(values.currentQuestionIndex);
    if (isNaN(idx)) idx = 0;
    return {
      visible: true,
      examSelect: {
        options: buildExamOptions(currentExam, values.orderedExams),
        disabled: currentExam.mode !== 'exam',
        title: currentExam.mode === 'exam' ? '快速切换套题' : '当前来源不是公开套卷'
      },
      questionSelect: {
        options: buildQuestionOptions(questions, idx, values.categoryMap),
        disabled: questions.length <= 1
      },
      answerButton: buildAnswerButtonModel(values.showAnswers),
      progressText: getProgressText(currentExam, questions, idx)
    };
  }

  window.GrammarClassroomSwitcherModel = {
    asArray: asArray,
    getExamBlankCount: getExamBlankCount,
    getExamLabel: getExamLabel,
    buildExamOptions: buildExamOptions,
    buildQuestionOptions: buildQuestionOptions,
    getProgressText: getProgressText,
    buildAnswerButtonModel: buildAnswerButtonModel,
    getCurrentExamIndex: getCurrentExamIndex,
    buildExamNavigationPlan: buildExamNavigationPlan,
    buildExamSelectPlan: buildExamSelectPlan,
    buildQuestionSelectPlan: buildQuestionSelectPlan,
    buildQuestionNavigationPlan: buildQuestionNavigationPlan,
    buildClassroomSwitcherModel: buildClassroomSwitcherModel
  };
})();
