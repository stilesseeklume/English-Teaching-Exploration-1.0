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
    buildClassroomSwitcherModel: buildClassroomSwitcherModel
  };
})();
