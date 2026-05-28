// grammar-fill/modules/question-model.js
//
// Pure question model helpers. No DOM access.

/* eslint-disable */
(function(){
  function buildAllQuestions(bank, categoryTips) {
    bank = bank || { questions: [] };
    categoryTips = categoryTips || {};
    return (bank.questions || []).map(function(q) {
      return {
        no: q.no,
        year: q.year,
        exam: q.exam_id,
        exam_id: q.exam_id,
        type: q.type,
        answer: q.answer,
        category: q.category,
        category_name: q.category_name,
        grammar_point: q.grammar_point,
        fine_category: q.fine_category,
        nonp_function: q.nonp_function,
        nonp_function_label: q.nonp_function_label,
        nonp_form: q.nonp_form,
        nonp_form_label: q.nonp_form_label,
        nonp_rule: q.nonp_rule,
        nonp_needs_review: q.nonp_needs_review,
        passage: q.passage,
        sentence: '',
        analysis: q.explanation || ('答案：' + q.answer + '。'),
        technique: '考点：' + (q.category_name || q.grammar_point || '语法填空') +
          '。' + (categoryTips[q.category] || '先判空格成分，再确定词形。')
      };
    });
  }

  function buildExamsById(bank) {
    bank = bank || { exams: [] };
    var result = {};
    (bank.exams || []).forEach(function(exam) {
      result[exam.exam_id] = exam;
    });
    return result;
  }

  function getOrderedExams(exams) {
    return (exams || []).slice().sort(function(a, b) {
      var yearDelta = Number(b.year || 0) - Number(a.year || 0);
      if (yearDelta) return yearDelta;
      return String(a.exam_id || '').localeCompare(String(b.exam_id || ''), 'zh-Hans-CN');
    });
  }

  function getFineTagInfo(fineCategory, fineTags) {
    fineTags = fineTags || {};
    if (!fineCategory) return null;
    var tagsById = fineTags.tags_by_id || {};
    var categories = fineTags.categories || {};
    var tagToUnits = fineTags.tag_to_units || {};
    var tag = tagsById[fineCategory];
    if (!tag) return null;
    var category = categories[tag.category];
    return {
      id: fineCategory,
      name: tag.name,
      category_id: tag.category,
      category_name: category ? category.name : tag.category,
      textbook_units: tagToUnits[fineCategory] || []
    };
  }

  function createExamQuestionFromRaw(raw, exam, categoryTips) {
    raw = raw || {};
    exam = exam || {};
    categoryTips = categoryTips || {};
    return {
      no: raw.no,
      answer: raw.answer,
      category: raw.category,
      category_name: raw.category_name,
      grammar_point: raw.grammar_point,
      fine_category: raw.fine_category,
      nonp_function: raw.nonp_function,
      nonp_function_label: raw.nonp_function_label,
      nonp_form: raw.nonp_form,
      nonp_form_label: raw.nonp_form_label,
      nonp_rule: raw.nonp_rule,
      nonp_needs_review: raw.nonp_needs_review,
      exam: exam.exam_id || raw.exam_id || raw.exam,
      exam_id: exam.exam_id || raw.exam_id || raw.exam,
      year: exam.year || raw.year || '',
      type: exam.type || raw.type || '',
      passage: exam.passage || raw.passage || '',
      sentence: raw.sentence || '',
      analysis: raw.explanation || raw.analysis || ('答案：' + (raw.answer || '') + '。'),
      technique: '考点：' + (raw.category_name || raw.grammar_point || '语法填空') +
        '。' + (categoryTips[raw.category] || '先判空格成分，再确定词形。')
    };
  }

  function buildExamQuestions(exam, categoryTips) {
    if (!exam || !Array.isArray(exam.questions)) return [];
    return exam.questions.map(function(q) {
      return createExamQuestionFromRaw(q, exam, categoryTips);
    });
  }

  function createExamStateFromId(examId, examsById, categoryTips) {
    examsById = examsById || {};
    var exam = examsById[examId];
    if (!exam) return null;
    var questions = buildExamQuestions(exam, categoryTips);
    return {
      currentExam: {
        source: exam.exam_id + ' · ' + exam.type,
        examId: exam.exam_id,
        questions: questions,
        mode: 'exam',
        passage: exam.passage,
        chinese_translation: exam.chinese_translation || ''
      },
      currentQuestions: questions
    };
  }

  function createErrorStateForQuestion(q, categoryMap) {
    categoryMap = categoryMap || {};
    if (!q) return null;
    return {
      currentExam: {
        source: '错题本 · ' + (categoryMap[q.category] || q.category),
        questions: [q],
        mode: 'error'
      },
      currentQuestions: [q]
    };
  }

  function countByFineTag(fineCategory, bankQuestions, errorQuestions) {
    bankQuestions = Array.isArray(bankQuestions) ? bankQuestions : [];
    errorQuestions = Array.isArray(errorQuestions) ? errorQuestions : [];
    var bankCount = bankQuestions.filter(function(q) { return q.fine_category === fineCategory; }).length;
    var errorCount = errorQuestions.filter(function(q) { return q.fine_category === fineCategory; }).length;
    return { bank: bankCount, error: errorCount, total: bankCount + errorCount };
  }

  function getFrequencyStyle(total) {
    if (total >= 10) return { bg: 'var(--red-bg)', color: 'var(--red)', label: '高频' };
    if (total >= 3) return { bg: 'var(--orange-bg)', color: 'var(--orange)', label: '中频' };
    if (total >= 1) return { bg: 'var(--accent-bg)', color: 'var(--accent)', label: '低频' };
    return { bg: 'var(--surface-3)', color: 'var(--text-3)', label: '储备' };
  }

  window.GrammarQuestionModel = {
    buildAllQuestions: buildAllQuestions,
    buildExamsById: buildExamsById,
    getOrderedExams: getOrderedExams,
    getFineTagInfo: getFineTagInfo,
    createExamQuestionFromRaw: createExamQuestionFromRaw,
    buildExamQuestions: buildExamQuestions,
    createExamStateFromId: createExamStateFromId,
    createErrorStateForQuestion: createErrorStateForQuestion,
    countByFineTag: countByFineTag,
    getFrequencyStyle: getFrequencyStyle
  };
})();
