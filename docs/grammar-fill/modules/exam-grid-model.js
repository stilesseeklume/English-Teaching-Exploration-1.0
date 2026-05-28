// grammar-fill/modules/exam-grid-model.js
//
// Pure model builders for the home exam grid. The page keeps rendering and
// click behavior; this module only decides grouping, labels, and counts.

/* eslint-disable */
(function(){
  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function asCount(value) {
    return Number(value || 0) || 0;
  }

  function isGreenExamType(type) {
    return type === '模拟卷' || type === '模拟题';
  }

  function getExamTagClass(type) {
    return isGreenExamType(type) ? 'green' : '';
  }

  function getExamBlankCount(exam) {
    exam = exam || {};
    return asCount(exam.blank_count) || asArray(exam.questions).length;
  }

  function normalizeYear(year) {
    if (year === null || year === undefined || year === '') return '未知';
    return String(year);
  }

  function compareYearDesc(a, b) {
    var numA = Number(a);
    var numB = Number(b);
    var aIsNumber = !isNaN(numA);
    var bIsNumber = !isNaN(numB);
    if (aIsNumber && bIsNumber) return numB - numA;
    if (aIsNumber) return -1;
    if (bIsNumber) return 1;
    return String(b).localeCompare(String(a), 'zh-Hans-CN');
  }

  function buildExamCardModel(exam) {
    exam = exam || {};
    return {
      id: exam.exam_id || '',
      type: exam.type || '真题',
      tagClass: getExamTagClass(exam.type),
      blankCount: getExamBlankCount(exam)
    };
  }

  function groupExamsByYear(exams) {
    var byYear = {};
    asArray(exams).forEach(function(exam) {
      var year = normalizeYear(exam && exam.year);
      (byYear[year] = byYear[year] || []).push(exam);
    });
    return Object.keys(byYear).sort(compareYearDesc).map(function(year) {
      return {
        year: year,
        count: byYear[year].length,
        items: byYear[year].map(buildExamCardModel)
      };
    });
  }

  function buildExamGridModel(exams) {
    return {
      groups: groupExamsByYear(exams)
    };
  }

  window.GrammarExamGridModel = {
    asArray: asArray,
    isGreenExamType: isGreenExamType,
    getExamTagClass: getExamTagClass,
    getExamBlankCount: getExamBlankCount,
    normalizeYear: normalizeYear,
    compareYearDesc: compareYearDesc,
    buildExamCardModel: buildExamCardModel,
    groupExamsByYear: groupExamsByYear,
    buildExamGridModel: buildExamGridModel
  };
})();
