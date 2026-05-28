// grammar-fill/modules/practice-view-model.js
//
// Pure view-state builders for the practice page. The legacy page still renders
// markup and handles clicks; this module decides labels, counts, and text data.

/* eslint-disable */
(function(){
  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function asText(value, fallback) {
    if (value === null || value === undefined) return fallback || '';
    return String(value);
  }

  function escapeRegExpText(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function buildPracticeHeaderModel(currentExam, questions) {
    currentExam = currentExam || {};
    questions = asArray(questions);
    return {
      sourceName: currentExam.source || '',
      sourceCountText: '共' + questions.length + '题'
    };
  }

  function buildToggleModel(showAnswers, showChinese) {
    return {
      answerText: showAnswers ? '👁 显示空格' : '👁 显示答案',
      answerVisible: !showChinese,
      chineseText: showChinese ? '英/中' : '中/英'
    };
  }

  function getStoredChineseText(currentExam, questions, examsById) {
    currentExam = currentExam || {};
    questions = asArray(questions);
    examsById = examsById || {};
    if (currentExam.mode === 'exam' || currentExam.mode === 'prep') {
      return asText(currentExam.chinese_translation);
    }
    if (currentExam.mode === 'category') {
      var firstQuestion = questions[0];
      var exam = firstQuestion && firstQuestion.exam_id ? examsById[firstQuestion.exam_id] : null;
      return asText(exam && exam.chinese_translation);
    }
    return '';
  }

  function splitTranslationParagraphs(text) {
    return asText(text).split(/\n\n|\n/).map(function(part) {
      return part.trim();
    }).filter(Boolean);
  }

  function buildChinesePassageModel(currentExam, questions, examsById) {
    var text = getStoredChineseText(currentExam, questions, examsById);
    return {
      hasText: !!text,
      text: text,
      paragraphs: splitTranslationParagraphs(text),
      placeholderText: '翻译中…'
    };
  }

  function getPracticePassageText(currentExam, questions, fillAnswers) {
    currentExam = currentExam || {};
    questions = asArray(questions);
    var text;
    if (currentExam.mode === 'category') {
      text = questions[0] ? asText(questions[0].passage) : '';
    } else {
      text = asText(currentExam.passage) || (questions[0] ? asText(questions[0].passage) : '');
    }
    if (fillAnswers) {
      questions.forEach(function(question) {
        question = question || {};
        text = text.replace('___' + question.no + '___', asText(question.answer));
      });
    }
    return text;
  }

  function groupCategoryQuestionsByExam(questions) {
    var groupsById = {};
    asArray(questions).forEach(function(question, index) {
      question = question || {};
      var examId = question.exam || question.exam_id || '未知套卷';
      if (!groupsById[examId]) {
        groupsById[examId] = { examId: examId, items: [] };
      }
      groupsById[examId].items.push({
        question: question,
        index: index
      });
    });
    return Object.keys(groupsById).map(function(examId) {
      return groupsById[examId];
    });
  }

  function getCategoryPracticeHint(questions) {
    return {
      prefix: '同类训练共 ' + asArray(questions).length + ' 题，按套卷顺序排列。点击 ',
      actionLabel: '空格序号',
      suffix: ' 查看解析。'
    };
  }

  function replaceBlankMarker(text, no, replacement) {
    text = asText(text);
    no = asText(no);
    replacement = asText(replacement);
    if (!text || !no) return text;

    var exactRe = new RegExp('_{2,}\\s*' + escapeRegExpText(no) + '\\s*_{2,}', 'g');
    if (exactRe.test(text)) {
      exactRe.lastIndex = 0;
      return text.replace(exactRe, replacement);
    }
    return text.replace(/_{2,}\s*\d+\s*_{2,}/, replacement);
  }

  function buildCategoryPracticeModel(questions, deps) {
    deps = deps || {};
    var extractSentence = deps.extractSentence || function() { return ''; };
    return {
      hint: getCategoryPracticeHint(questions),
      groups: groupCategoryQuestionsByExam(questions).map(function(group) {
        return {
          examId: group.examId,
          items: group.items.map(function(item) {
            var question = item.question || {};
            var no = asText(question.no);
            return {
              question: question,
              index: item.index,
              no: no,
              answer: asText(question.answer),
              sentence: asText(extractSentence(question.passage, question.no)) || ('___' + no + '___')
            };
          })
        };
      })
    };
  }

  function getPassageSource(currentExam, questions) {
    currentExam = currentExam || {};
    questions = asArray(questions);
    return asText(currentExam.passage) || (questions[0] ? asText(questions[0].passage) : '');
  }

  function splitPassageParagraphs(text) {
    return asText(text).split('\n\n').map(function(part) {
      return part.trim();
    }).filter(Boolean);
  }

  function getUnmatchedQuestions(questions, startIndex) {
    questions = asArray(questions);
    startIndex = Number(startIndex) || 0;
    if (startIndex < 0) startIndex = 0;
    return questions.slice(startIndex).map(function(question, offset) {
      return {
        question: question || {},
        index: startIndex + offset
      };
    });
  }

  function buildSequentialPassageModel(currentExam, questions, matchedCount) {
    var passage = getPassageSource(currentExam, questions);
    var count = Number(matchedCount) || 0;
    return {
      passage: passage,
      paragraphs: splitPassageParagraphs(passage),
      matchedCount: count,
      unmatchedItems: getUnmatchedQuestions(questions, count)
    };
  }

  function applySequentialBlankReplacements(currentExam, questions, replacer) {
    questions = asArray(questions);
    replacer = replacer || function() { return ''; };
    var qi = 0;
    var passage = getPassageSource(currentExam, questions).replace(/_{2,}\s*(\d+)\s*_{2,}/g, function(fullMatch, numStr) {
      if (qi >= questions.length) return fullMatch;
      var index = qi;
      var question = questions[qi] || {};
      qi++;
      return asText(replacer(question, index, numStr, fullMatch), fullMatch);
    });
    return {
      passage: passage,
      matchedCount: qi,
      paragraphs: splitPassageParagraphs(passage),
      unmatchedItems: getUnmatchedQuestions(questions, qi)
    };
  }

  window.GrammarPracticeViewModel = {
    asArray: asArray,
    asText: asText,
    escapeRegExpText: escapeRegExpText,
    buildPracticeHeaderModel: buildPracticeHeaderModel,
    buildToggleModel: buildToggleModel,
    getStoredChineseText: getStoredChineseText,
    splitTranslationParagraphs: splitTranslationParagraphs,
    buildChinesePassageModel: buildChinesePassageModel,
    getPracticePassageText: getPracticePassageText,
    groupCategoryQuestionsByExam: groupCategoryQuestionsByExam,
    getCategoryPracticeHint: getCategoryPracticeHint,
    replaceBlankMarker: replaceBlankMarker,
    buildCategoryPracticeModel: buildCategoryPracticeModel,
    getPassageSource: getPassageSource,
    splitPassageParagraphs: splitPassageParagraphs,
    getUnmatchedQuestions: getUnmatchedQuestions,
    buildSequentialPassageModel: buildSequentialPassageModel,
    applySequentialBlankReplacements: applySequentialBlankReplacements
  };
})();
