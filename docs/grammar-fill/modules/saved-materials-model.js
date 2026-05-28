// grammar-fill/modules/saved-materials-model.js
//
// Pure data helpers for saved teacher materials: error-book items and lesson
// prep passages. Rendering, persistence, cloud sync, and dialogs stay outside.

/* eslint-disable */
(function(){
  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function getCategoryLabel(category, categoryMap) {
    categoryMap = categoryMap || {};
    return categoryMap[category] || category || '其他';
  }

  function getCategoryTip(category, categoryTips) {
    categoryTips = categoryTips || {};
    return categoryTips[category] || '先判空格成分，再确定词形。';
  }

  function getErrorFingerprint(q) {
    q = q || {};
    var answer = (q.answer || '').trim();
    var category = (q.category || '').trim();
    var no = q.no || '';
    return answer + '|||' + category + '|||' + no;
  }

  function getPrepFingerprint(p) {
    p = p || {};
    var passage = (p.passage || '').replace(/_{2,}\s*\d+\s*_{2,}/g, '').replace(/\s+/g, ' ').trim();
    var passageKey = passage.substring(0, 200);
    var blanksKey = asArray(p.blanks).map(function(b) {
      return (b.answer || '').trim();
    }).join('|');
    return passageKey + '|||' + asArray(p.blanks).length + '|||' + blanksKey;
  }

  function buildExistingFingerprintSet(items, fingerprintFn) {
    var existing = {};
    asArray(items).forEach(function(item) {
      existing[fingerprintFn(item)] = true;
    });
    return existing;
  }

  function normalizeErrorImportItem(item, options) {
    options = options || {};
    item = item || {};
    var no = item.no || 1;
    var passage = item.passage || '';
    var marker = '___' + no + '___';
    if (!passage || !item.answer || !item.category) return null;
    if (passage.indexOf(marker) === -1) return null;
    var extractSentence = options.extractSentence || function(text) { return text; };
    var sentence = extractSentence(passage, no) || passage;
    var categoryLabel = getCategoryLabel(item.category, options.categoryMap);
    return {
      id: (options.idPrefix || 'err_') + (options.now || Date.now()) + '_' + (options.index || 0),
      passage: sentence,
      answer: item.answer,
      category: item.category,
      fine_category: item.fine_category || '',
      category_name: categoryLabel,
      grammar_point: '',
      analysis: item.analysis || ('答案：' + item.answer + '。'),
      nonp_function: item.nonp_function || '',
      nonp_function_label: item.nonp_function_label || '',
      nonp_form: item.nonp_form || '',
      nonp_form_label: item.nonp_form_label || '',
      nonp_rule: item.nonp_rule || '',
      nonp_needs_review: !!item.nonp_needs_review,
      technique: '考点：' + categoryLabel + '。' + getCategoryTip(item.category, options.categoryTips),
      exam: '错题本',
      exam_id: '错题本',
      no: no,
      created_at: options.createdAt || new Date().toISOString()
    };
  }

  function importErrorItems(list, existingItems, options) {
    options = options || {};
    var existing = buildExistingFingerprintSet(existingItems, getErrorFingerprint);
    var imported = [];
    var skippedDuplicate = 0;
    var skippedInvalid = 0;
    asArray(list).forEach(function(item) {
      var q = normalizeErrorImportItem(item, Object.assign({}, options, { index: imported.length }));
      if (!q) { skippedInvalid++; return; }
      var fp = getErrorFingerprint(q);
      if (existing[fp]) { skippedDuplicate++; return; }
      existing[fp] = true;
      imported.push(q);
    });
    return {
      imported: imported,
      skippedDuplicate: skippedDuplicate,
      skippedInvalid: skippedInvalid,
      nextItems: imported.concat(asArray(existingItems))
    };
  }

  function groupErrorsByCategory(errorQuestions, categoryMap) {
    var byCategory = {};
    var order = [];
    asArray(errorQuestions).forEach(function(question) {
      var category = (question && question.category) || 'other';
      if (!byCategory[category]) {
        byCategory[category] = [];
        order.push(category);
      }
      byCategory[category].push(question);
    });
    return order.map(function(category) {
      return {
        category: category,
        label: getCategoryLabel(category, categoryMap),
        items: byCategory[category]
      };
    });
  }

  function buildErrorListModel(errorQuestions, categoryMap) {
    var items = asArray(errorQuestions);
    return {
      count: items.length,
      empty: items.length === 0,
      groups: groupErrorsByCategory(items, categoryMap)
    };
  }

  function normalizePrepImportItem(item, options) {
    options = options || {};
    item = item || {};
    if (!item.title || !item.passage || !Array.isArray(item.blanks)) return null;
    return {
      id: (options.idPrefix || 'prep_') + (options.now || Date.now()) + '_' + (options.index || 0),
      title: item.title,
      passage: item.passage,
      blanks: item.blanks.map(function(blank) {
        blank = blank || {};
        return {
          no: blank.no,
          answer: blank.answer,
          category: blank.category,
          fine_category: blank.fine_category || '',
          analysis: blank.analysis || '',
          nonp_function: blank.nonp_function || '',
          nonp_function_label: blank.nonp_function_label || '',
          nonp_form: blank.nonp_form || '',
          nonp_form_label: blank.nonp_form_label || '',
          nonp_rule: blank.nonp_rule || '',
          nonp_needs_review: !!blank.nonp_needs_review
        };
      }),
      created_at: options.createdAt || new Date().toISOString()
    };
  }

  function importPrepItems(list, existingItems, options) {
    options = options || {};
    var existing = buildExistingFingerprintSet(existingItems, getPrepFingerprint);
    var imported = [];
    var skippedDuplicate = 0;
    var skippedInvalid = 0;
    asArray(list).forEach(function(item) {
      var prep = normalizePrepImportItem(item, Object.assign({}, options, { index: imported.length }));
      if (!prep) { skippedInvalid++; return; }
      var fp = getPrepFingerprint(prep);
      if (existing[fp]) { skippedDuplicate++; return; }
      existing[fp] = true;
      imported.push(prep);
    });
    return {
      imported: imported,
      skippedDuplicate: skippedDuplicate,
      skippedInvalid: skippedInvalid,
      nextItems: imported.concat(asArray(existingItems))
    };
  }

  function buildPrepListModel(prepPassages, categoryMap) {
    var items = asArray(prepPassages).map(function(passage) {
      passage = passage || {};
      var categoryCounts = {};
      var categoryOrder = [];
      asArray(passage.blanks).forEach(function(blank) {
        var category = (blank && blank.category) || 'other';
        if (!categoryCounts[category]) categoryOrder.push(category);
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
      return {
        id: passage.id || '',
        title: passage.title || '未命名备课',
        passage: passage.passage || '',
        blanks: asArray(passage.blanks),
        blankCount: asArray(passage.blanks).length,
        preview: (passage.passage || '').replace(/___\d+___/g, '______').substring(0, 120),
        categoryCounts: categoryCounts,
        categoryTags: categoryOrder.map(function(category) {
          return getCategoryLabel(category, categoryMap);
        }).join(' · ')
      };
    });
    return {
      count: items.length,
      empty: items.length === 0,
      items: items
    };
  }

  function buildPrepQuestions(passage, categoryMap, categoryTips) {
    passage = passage || {};
    return asArray(passage.blanks).map(function(blank) {
      blank = blank || {};
      var categoryLabel = getCategoryLabel(blank.category, categoryMap);
      return {
        no: blank.no,
        answer: blank.answer,
        category: blank.category,
        category_name: categoryLabel,
        grammar_point: '',
        fine_category: blank.fine_category || '',
        nonp_function: blank.nonp_function || '',
        nonp_function_label: blank.nonp_function_label || '',
        nonp_form: blank.nonp_form || '',
        nonp_form_label: blank.nonp_form_label || '',
        nonp_rule: blank.nonp_rule || '',
        nonp_needs_review: !!blank.nonp_needs_review,
        exam: passage.title,
        exam_id: passage.title,
        year: '',
        type: '',
        passage: passage.passage,
        sentence: '',
        analysis: blank.analysis || ('答案：' + blank.answer + '。'),
        technique: '考点：' + categoryLabel + '。' + getCategoryTip(blank.category, categoryTips)
      };
    });
  }

  function createPrepStateForPassage(passage, categoryMap, categoryTips) {
    if (!passage) return null;
    var questions = buildPrepQuestions(passage, categoryMap, categoryTips);
    return {
      currentExam: {
        source: passage.title,
        prepId: passage.id,
        questions: questions,
        mode: 'prep',
        passage: passage.passage
      },
      currentQuestions: questions
    };
  }

  window.GrammarSavedMaterialsModel = {
    asArray: asArray,
    getCategoryLabel: getCategoryLabel,
    getErrorFingerprint: getErrorFingerprint,
    getPrepFingerprint: getPrepFingerprint,
    normalizeErrorImportItem: normalizeErrorImportItem,
    importErrorItems: importErrorItems,
    groupErrorsByCategory: groupErrorsByCategory,
    buildErrorListModel: buildErrorListModel,
    normalizePrepImportItem: normalizePrepImportItem,
    importPrepItems: importPrepItems,
    buildPrepListModel: buildPrepListModel,
    buildPrepQuestions: buildPrepQuestions,
    createPrepStateForPassage: createPrepStateForPassage
  };
})();
