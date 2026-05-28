// grammar-fill/modules/sidebar-view-model.js
//
// Pure sidebar data builders. Rendering stays in the legacy page while data
// grouping and active-state rules move behind a module boundary.

/* eslint-disable */
(function(){
  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function asCount(value) {
    return Number(value || 0) || 0;
  }

  function getCategoryLabel(category, categoryMap) {
    categoryMap = categoryMap || {};
    return categoryMap[category] || category || '其他';
  }

  function isGreenExamType(type) {
    return type === '模拟卷' || type === '模拟题';
  }

  function getExamTagClass(type) {
    return isGreenExamType(type) ? ' green' : '';
  }

  function groupExamsByYear(exams, activeExamId) {
    var byYear = {};
    asArray(exams).forEach(function(exam) {
      var year = String((exam && exam.year) || '未知');
      (byYear[year] = byYear[year] || []).push(exam);
    });
    return Object.keys(byYear).sort(function(a, b) {
      var delta = asCount(b) - asCount(a);
      if (delta) return delta;
      return String(b).localeCompare(String(a), 'zh-Hans-CN');
    }).map(function(year) {
      return {
        year: year,
        count: byYear[year].length,
        items: byYear[year].map(function(exam) {
          exam = exam || {};
          return {
            id: exam.exam_id || '',
            type: exam.type || '真题',
            tagClass: getExamTagClass(exam.type),
            blankCount: exam.blank_count || ((exam.questions || []).length),
            active: !!activeExamId && activeExamId === exam.exam_id
          };
        })
      };
    });
  }

  function buildCategoryItems(categoryMap, questions, activeCategory) {
    categoryMap = categoryMap || {};
    questions = asArray(questions);
    return Object.keys(categoryMap).map(function(category) {
      return {
        category: category,
        label: getCategoryLabel(category, categoryMap),
        count: questions.filter(function(q) { return q && q.category === category; }).length,
        active: activeCategory === category
      };
    });
  }

  function buildErrorCategoryGroups(errorQuestions, categoryMap, activeQuestionId) {
    categoryMap = categoryMap || {};
    var byCategory = {};
    asArray(errorQuestions).forEach(function(question) {
      var category = (question && question.category) || 'other';
      (byCategory[category] = byCategory[category] || []).push(question);
    });
    return Object.keys(byCategory).map(function(category) {
      return {
        category: category,
        label: getCategoryLabel(category, categoryMap),
        items: byCategory[category].map(function(question) {
          question = question || {};
          return {
            id: question.id || '',
            no: question.no || '',
            answer: question.answer || '',
            categoryLabel: getCategoryLabel(question.category, categoryMap),
            active: !!activeQuestionId && activeQuestionId === question.id
          };
        })
      };
    });
  }

  function buildErrorItems(errorQuestions, categoryMap, activeQuestionId) {
    categoryMap = categoryMap || {};
    return asArray(errorQuestions).map(function(question) {
      question = question || {};
      return {
        id: question.id || '',
        no: question.no || '',
        answer: question.answer || '',
        categoryLabel: getCategoryLabel(question.category, categoryMap),
        active: !!activeQuestionId && activeQuestionId === question.id
      };
    });
  }

  function buildPrepItems(prepPassages, activePrepId) {
    return asArray(prepPassages).map(function(passage) {
      passage = passage || {};
      return {
        id: passage.id || '',
        title: passage.title || '未命名备课',
        blankCount: (passage.blanks || []).length,
        active: !!activePrepId && activePrepId === passage.id
      };
    });
  }

  function shouldHideHomeSidebar(homeView, dashboardVisible) {
    return homeView === 'cards' && !!dashboardVisible;
  }

  function buildPageSidebarModel(page, values) {
    values = values || {};
    if (page === 'home') {
      if (shouldHideHomeSidebar(values.homeView, values.dashboardVisible)) {
        return { hidden: true };
      }
      if (values.homeView === 'categories') {
        return {
          title: '全部考点',
          kind: 'categories',
          items: buildCategoryItems(values.categoryMap, values.allQuestions, values.activeCategory)
        };
      }
      return {
        title: '全部套卷',
        kind: 'exam-groups',
        groups: groupExamsByYear(values.exams, values.activeExamId)
      };
    }

    if (page === 'error-book') {
      var errorGroups = buildErrorCategoryGroups(values.errorQuestions, values.categoryMap, values.activeQuestionId);
      return {
        title: '全部错题',
        kind: 'error-groups',
        groups: errorGroups,
        emptyText: errorGroups.length ? '' : '暂无错题'
      };
    }

    if (page === 'lesson-prep') {
      var prepItems = buildPrepItems(values.prepPassages, values.activePrepId);
      return {
        title: '全部备课',
        kind: 'prep-items',
        items: prepItems,
        emptyText: prepItems.length ? '' : '暂无备课'
      };
    }

    if (page === 'practice') {
      return { delegateToContext: true };
    }

    return { hidden: true };
  }

  function buildContextSidebarModel(values) {
    values = values || {};
    var currentExam = values.currentExam || {};
    if (!currentExam.mode) return { hidden: true };

    if (currentExam.mode === 'exam') {
      return {
        title: '全部套卷',
        kind: 'exam-groups',
        groups: groupExamsByYear(values.exams, currentExam.examId)
      };
    }

    if (currentExam.mode === 'error') {
      return {
        title: '全部错题',
        kind: 'error-items',
        items: buildErrorItems(values.errorQuestions, values.categoryMap, values.activeQuestionId)
      };
    }

    if (currentExam.mode === 'prep') {
      return {
        title: '全部备课',
        kind: 'prep-items',
        items: buildPrepItems(values.prepPassages, currentExam.prepId)
      };
    }

    if (currentExam.mode === 'category') {
      return {
        title: '全部考点',
        kind: 'categories',
        items: buildCategoryItems(values.categoryMap, values.allQuestions, currentExam.category)
      };
    }

    return { hidden: true };
  }

  window.GrammarSidebarViewModel = {
    asArray: asArray,
    getCategoryLabel: getCategoryLabel,
    isGreenExamType: isGreenExamType,
    getExamTagClass: getExamTagClass,
    groupExamsByYear: groupExamsByYear,
    buildCategoryItems: buildCategoryItems,
    buildErrorCategoryGroups: buildErrorCategoryGroups,
    buildErrorItems: buildErrorItems,
    buildPrepItems: buildPrepItems,
    shouldHideHomeSidebar: shouldHideHomeSidebar,
    buildPageSidebarModel: buildPageSidebarModel,
    buildContextSidebarModel: buildContextSidebarModel
  };
})();
