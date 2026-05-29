// grammar-fill/modules/saved-materials-model.js
//
// Pure data helpers for saved teacher materials: error-book items and lesson
// prep passages. Rendering, persistence, cloud sync, and dialogs stay outside.

/* eslint-disable */
(function(){
  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function asText(value, fallback) {
    if (value === null || value === undefined) return fallback || '';
    return String(value);
  }

  function textOrFallback(value, fallback) {
    var text = asText(value);
    return text ? text : (fallback || '');
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

  function hashId(prefix, text) {
    var hash = 0;
    text = asText(text);
    for (var i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }
    return prefix + Math.abs(hash).toString(36);
  }

  function buildExistingFingerprintSet(items, fingerprintFn) {
    var existing = {};
    asArray(items).forEach(function(item) {
      existing[fingerprintFn(item)] = true;
    });
    return existing;
  }

  function getBatchImportJsonErrorMessage(error, kind) {
    var message = error && error.message ? error.message : asText(error);
    var normalizedKind = kind === 'prep' ? 'prep' : 'error';
    return (normalizedKind === 'prep' ? 'JSON 格式错误：' : 'JSON 格式错误，请检查：') + message;
  }

  function getBatchImportEmptyArrayMessage() {
    return '请输入一个非空 JSON 数组';
  }

  function parseBatchImportJson(raw, kind) {
    var text = asText(raw).trim();
    if (!text) {
      return {
        ok: false,
        empty: true,
        list: [],
        errorMessage: ''
      };
    }
    var list;
    try {
      list = JSON.parse(text);
    } catch (error) {
      return {
        ok: false,
        empty: false,
        parseError: true,
        list: [],
        errorMessage: getBatchImportJsonErrorMessage(error, kind)
      };
    }
    if (!Array.isArray(list) || list.length === 0) {
      return {
        ok: false,
        empty: false,
        list: [],
        errorMessage: getBatchImportEmptyArrayMessage()
      };
    }
    return {
      ok: true,
      empty: false,
      list: list,
      count: list.length,
      errorMessage: ''
    };
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

  function buildErrorListItemModel(question, options) {
    options = options || {};
    question = question || {};
    var passage = asText(question.passage);
    var no = asText(question.no);
    return {
      id: asText(question.id),
      question: question,
      no: no,
      passage: passage,
      blankMarker: '___' + no + '___',
      answer: asText(question.answer),
      analysisPreview: asText(question.analysis).substring(0, 40),
      sentenceTruncated: passage.length > 160,
      showBulkCheck: !!options.bulkMode
    };
  }

  function buildErrorListModel(errorQuestions, categoryMap, options) {
    options = options || {};
    var items = asArray(errorQuestions);
    return {
      count: items.length,
      statText: '共 ' + items.length + ' 道',
      empty: items.length === 0,
      emptyText: '还没有错题，点击上方按钮导入第一道题目。',
      bulkMode: !!options.bulkMode,
      groups: groupErrorsByCategory(items, categoryMap).map(function(group) {
        var list = asArray(group.items);
        return {
          category: group.category,
          label: group.label,
          count: list.length,
          titleText: group.label + ' · ' + list.length + ' 题',
          items: list.map(function(question) {
            return buildErrorListItemModel(question, options);
          })
        };
      })
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

  function buildPrepListModel(prepPassages, categoryMap, options) {
    options = options || {};
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
        }).join(' · '),
        blankCountText: asArray(passage.blanks).length + ' 空',
        metaText: asArray(passage.blanks).length + ' 空 · ' + categoryOrder.map(function(category) {
          return getCategoryLabel(category, categoryMap);
        }).join(' · '),
        showBulkCheck: !!options.bulkMode
      };
    });
    return {
      count: items.length,
      statText: '共 ' + items.length + ' 份',
      empty: items.length === 0,
      emptyText: '还没有备课资料，点击上方按钮导入第一篇语法填空篇章。',
      bulkMode: !!options.bulkMode,
      items: items
    };
  }

  function normalizeUnifiedImportMode(mode) {
    return mode === 'error' ? 'error' : 'prep';
  }

  function getUnifiedImportModeConfig(mode) {
    if (normalizeUnifiedImportMode(mode) === 'error') {
      return {
        titleSuffix: '挑题进错题本',
        hintText: '勾选要加入错题本的题'
      };
    }
    return {
      titleSuffix: '进备课资料（可选挑题）',
      hintText: '整篇进备课资料；可选勾几道题进错题本'
    };
  }

  function getUnifiedPassageTitle(passage) {
    return textOrFallback(passage && passage.title, '无标题');
  }

  function getUnifiedImportCategoryLabel(category, categoryMap) {
    categoryMap = categoryMap || {};
    return categoryMap[category] || category || '未分类';
  }

  function buildUnifiedImportTitle(passages, mode) {
    var items = asArray(passages);
    var titleBase = items.length === 1 ? getUnifiedPassageTitle(items[0]) : (items.length + ' 篇');
    return titleBase + ' · ' + getUnifiedImportModeConfig(mode).titleSuffix;
  }

  function countUnifiedImportBlanks(passages) {
    return asArray(passages).reduce(function(sum, passage) {
      return sum + asArray(passage && passage.blanks).length;
    }, 0);
  }

  function buildUnifiedImportSummaryText(passages) {
    var items = asArray(passages);
    return items.length + ' 篇 · 共 ' + countUnifiedImportBlanks(items) + ' 题';
  }

  function buildUnifiedSelectedCountText(count) {
    return '已勾选 ' + (Number(count) || 0) + ' 题进错题本';
  }

  function buildUnifiedImportCollectionWarning(passages, options) {
    options = options || {};
    var count = asArray(passages).length;
    var threshold = typeof options.collectionWarningThreshold === 'number'
      ? options.collectionWarningThreshold
      : 8;
    return {
      visible: count > threshold,
      count: count,
      leadText: '识别到 ',
      countText: String(count),
      tailText: ' 篇。合集文档因格式各异可能有少量漏识别，单套试卷上传识别最准确。'
    };
  }

  function buildUnifiedImportBlankModel(blank, passageIndex, blankIndex, categoryMap, options) {
    options = options || {};
    blank = blank || {};
    var analysis = asText(blank.analysis);
    var no = blank.no || (blankIndex + 1);
    return {
      passageIndex: passageIndex,
      blankIndex: blankIndex,
      no: no,
      noText: '第 ' + no + ' 题',
      answerText: textOrFallback(blank.answer, '?'),
      category: blank.category || '',
      categoryLabel: getUnifiedImportCategoryLabel(blank.category, categoryMap),
      analysisPreview: analysis.substring(0, 60),
      analysisTruncated: analysis.length > 60,
      checked: !!options.defaultChecked
    };
  }

  function buildUnifiedImportPanelModel(passages, mode, categoryMap, options) {
    options = options || {};
    var items = asArray(passages);
    var normalizedMode = normalizeUnifiedImportMode(mode);
    var modeConfig = getUnifiedImportModeConfig(normalizedMode);
    return {
      mode: normalizedMode,
      isErrorMode: normalizedMode === 'error',
      titleText: buildUnifiedImportTitle(items, normalizedMode),
      modeHintText: modeConfig.hintText,
      collectionWarning: buildUnifiedImportCollectionWarning(items, options),
      summaryText: buildUnifiedImportSummaryText(items),
      selectedCountText: buildUnifiedSelectedCountText(options.defaultChecked ? countUnifiedImportBlanks(items) : 0),
      passageCount: items.length,
      totalBlankCount: countUnifiedImportBlanks(items),
      passages: items.map(function(passage, passageIndex) {
        passage = passage || {};
        return {
          passageIndex: passageIndex,
          titleText: getUnifiedPassageTitle(passage),
          showTitle: items.length > 1,
          isLast: passageIndex === items.length - 1,
          blanks: asArray(passage.blanks).map(function(blank, blankIndex) {
            return buildUnifiedImportBlankModel(blank, passageIndex, blankIndex, categoryMap, options);
          })
        };
      })
    };
  }

  function buildUnifiedImportCompleteMessage(stats, mode) {
    stats = stats || {};
    var isErrorMode = normalizeUnifiedImportMode(mode) === 'error';
    var prepCount = Number(stats.prepCount) || 0;
    var prepSkip = Number(stats.prepSkip) || 0;
    var errorCount = Number(stats.errorCount) || 0;
    var errorSkip = Number(stats.errorSkip) || 0;
    var msg;
    if (isErrorMode) {
      msg = '已加入错题本 ' + errorCount + ' 道';
      if (errorSkip > 0) msg += '（跳过 ' + errorSkip + ' 道重复）';
      return msg;
    }
    msg = '已导入备课资料 ' + prepCount + ' 篇';
    if (prepSkip > 0) msg += '（跳过 ' + prepSkip + ' 篇重复）';
    if (errorCount > 0) msg += '；错题本 +' + errorCount + ' 道';
    return msg;
  }

  function normalizeUnifiedImportSelection(selection) {
    selection = selection || {};
    var rawPassage = selection.passageIndex !== undefined ? selection.passageIndex : selection.passage;
    var rawBlank = selection.blankIndex !== undefined ? selection.blankIndex : selection.blank;
    var passageIndex = parseInt(rawPassage, 10);
    var blankIndex = parseInt(rawBlank, 10);
    return {
      passageIndex: isNaN(passageIndex) ? -1 : passageIndex,
      blankIndex: isNaN(blankIndex) ? -1 : blankIndex
    };
  }

  function buildUnifiedImportConfirmPlan(passages, mode, selections) {
    var items = asArray(passages);
    var normalizedMode = normalizeUnifiedImportMode(mode);
    var errorPassages = [];
    var invalidSelectionCount = 0;
    asArray(selections).forEach(function(selection) {
      var normalized = normalizeUnifiedImportSelection(selection);
      var passage = items[normalized.passageIndex];
      var blank = passage && asArray(passage.blanks)[normalized.blankIndex];
      if (!passage || !blank) {
        invalidSelectionCount++;
        return;
      }
      errorPassages.push({
        title: passage.title,
        passage: passage.passage,
        blanks: [blank],
        passageIndex: normalized.passageIndex,
        blankIndex: normalized.blankIndex
      });
    });
    return {
      mode: normalizedMode,
      isErrorMode: normalizedMode === 'error',
      prepPassages: normalizedMode === 'error' ? [] : items.slice(),
      errorPassages: errorPassages,
      selectedCount: errorPassages.length,
      invalidSelectionCount: invalidSelectionCount
    };
  }

  function normalizeDeepSeekBlank(blank) {
    blank = blank || {};
    return {
      no: blank.no,
      answer: blank.answer || '?',
      category: blank.category || 'word',
      fine_category: blank.fine_category || '',
      analysis: blank.analysis || '',
      nonp_function: blank.nonp_function || '',
      nonp_function_label: blank.nonp_function_label || '',
      nonp_form: blank.nonp_form || '',
      nonp_form_label: blank.nonp_form_label || '',
      nonp_rule: blank.nonp_rule || '',
      nonp_needs_review: !!blank.nonp_needs_review
    };
  }

  function normalizeDeepSeekPrepPassage(result, options) {
    options = options || {};
    result = result || {};
    var blanks = asArray(result.blanks).map(normalizeDeepSeekBlank);
    var passage = {
      title: result.title || '无标题',
      passage: result.passage || '',
      blanks: blanks
    };
    var fp = getPrepFingerprint(passage);
    return {
      id: hashId(options.idPrefix || 'prep_', fp),
      title: passage.title,
      passage: passage.passage,
      blanks: blanks,
      created_at: options.createdAt || new Date().toISOString()
    };
  }

  function buildDeepSeekPrepImportPlan(result, existingItems, options) {
    options = options || {};
    var item = normalizeDeepSeekPrepPassage(result, options);
    var fp = getPrepFingerprint(item);
    var existing = buildExistingFingerprintSet(existingItems, getPrepFingerprint);
    var isDuplicate = !!existing[fp];
    return {
      imported: isDuplicate ? [] : [item],
      skippedDuplicate: isDuplicate ? 1 : 0,
      nextItems: isDuplicate ? asArray(existingItems).slice() : [item].concat(asArray(existingItems)),
      duplicateMessage: '这篇备课资料已存在，跳过：' + item.title,
      successMessage: '成功导入：' + item.title + '\n共 ' + asArray(result && result.blanks).length + ' 个空格'
    };
  }

  function normalizeDeepSeekErrorQuestion(result, blank, options) {
    options = options || {};
    result = result || {};
    blank = normalizeDeepSeekBlank(blank);
    var no = blank.no || ((Number(options.importedCount) || 0) + 1);
    var extractSentence = options.extractSentence || function() { return ''; };
    var extractContextWindow = options.extractContextWindow || function() { return ''; };
    var passage = result.passage || '';
    var sentence = extractSentence(passage, no) || extractContextWindow(passage, no) || passage;
    var categoryLabel = getCategoryLabel(blank.category, options.categoryMap);
    var fingerprint = (blank.answer || '').trim() + '|||' + (blank.category || '').trim() + '|||' + no;
    return {
      id: hashId(options.idPrefix || 'err_', fingerprint),
      passage: sentence,
      answer: blank.answer || '?',
      category: blank.category || 'word',
      fine_category: blank.fine_category || '',
      nonp_function: blank.nonp_function || '',
      nonp_function_label: blank.nonp_function_label || '',
      nonp_form: blank.nonp_form || '',
      nonp_form_label: blank.nonp_form_label || '',
      nonp_rule: blank.nonp_rule || '',
      nonp_needs_review: !!blank.nonp_needs_review,
      category_name: categoryLabel,
      grammar_point: '',
      analysis: blank.analysis || ('答案：' + (blank.answer || '?') + '。'),
      technique: '考点：' + categoryLabel + '。' + getCategoryTip(blank.category, options.categoryTips),
      exam: '错题本',
      exam_id: '错题本',
      no: no,
      created_at: options.createdAt || new Date().toISOString()
    };
  }

  function buildDeepSeekErrorImportPlan(result, existingItems, options) {
    options = options || {};
    var existing = buildExistingFingerprintSet(existingItems, getErrorFingerprint);
    var imported = [];
    var skippedDuplicate = 0;
    asArray(result && result.blanks).forEach(function(blank) {
      var question = normalizeDeepSeekErrorQuestion(result, blank, Object.assign({}, options, {
        importedCount: imported.length
      }));
      var fp = getErrorFingerprint(question);
      if (existing[fp]) {
        skippedDuplicate++;
        return;
      }
      existing[fp] = true;
      imported.push(question);
    });
    var msg = '成功导入 ' + imported.length + ' 道错题到错题本';
    if (skippedDuplicate > 0) msg += '\n跳过 ' + skippedDuplicate + ' 道重复题';
    return {
      imported: imported,
      count: imported.length,
      skippedDuplicate: skippedDuplicate,
      skipCount: skippedDuplicate,
      nextItems: imported.slice().reverse().concat(asArray(existingItems)),
      successMessage: msg
    };
  }

  function buildWordImportInitialProgressModel() {
    return {
      titleText: '正在提取 Word 文本…',
      descriptionText: '',
      progress: 5,
      stages: [
        { label: '提取 Word 文本', status: 'doing' },
        { label: '自动拆分篇章', status: 'todo' },
        { label: 'AI 分批解析', status: 'todo' },
        { label: '整理结果并入库', status: 'todo' }
      ]
    };
  }

  function buildWordImportLargeFileConfirmMessage(textLength) {
    return '这份 Word 比较大（' + (Number(textLength) || 0).toLocaleString() + ' 字符）。\n\n'
      + '系统会自动拆篇分批解析，不需要先手动裁剪。\n'
      + '如果文档里混有答案区、解析区或多套卷，解析会慢一些，但不会一篇失败就整份失败。\n\n'
      + '点确定继续；点取消稍后再传。';
  }

  function buildWordImportSplitProgressModel(textLength, batchCount, usedFallback) {
    return {
      progress: 15,
      stages: [
        { label: '提取 Word 文本（' + (Number(textLength) || 0) + ' 字）', status: 'done' },
        { label: '自动拆分篇章（' + (Number(batchCount) || 0) + ' 篇' + (usedFallback ? '，启发式' : '') + '）', status: 'done' },
        { label: 'AI 分批解析', status: 'doing' },
        { label: '整理结果并入库', status: 'todo' }
      ]
    };
  }

  function buildWordImportChunkProgressModel(originalLength, batchCount, completed) {
    return {
      stages: [
        { label: '提取 Word 文本（' + (Number(originalLength) || 0) + ' 字）', status: 'done' },
        { label: '自动拆分篇章（' + (Number(batchCount) || 0) + ' 篇）', status: 'done' },
        { label: 'AI 分批解析（' + (Number(completed) || 0) + '/' + (Number(batchCount) || 0) + '）', status: 'doing' },
        { label: '整理结果并入库', status: 'todo' }
      ]
    };
  }

  function buildWordImportCompletionProgressModel(originalLength, batchCount, passages) {
    passages = asArray(passages);
    return {
      progress: 100,
      hideDelayMs: 400,
      openPanelDelayMs: 200,
      stages: [
        { label: '提取 Word 文本（' + (Number(originalLength) || 0) + ' 字）', status: 'done' },
        { label: '自动拆分篇章（' + (Number(batchCount) || 0) + ' 篇）', status: 'done' },
        { label: 'AI 分批解析完成', status: 'done' },
        { label: '整理结果（共 ' + passages.length + ' 篇 · ' + countUnifiedImportBlanks(passages) + ' 题）', status: 'done' }
      ]
    };
  }

  function buildWordImportFailedAlertMessage(error) {
    var message = error && error.message ? error.message : error;
    return 'Word 解析失败：' + (message || '');
  }

  function getImportModuleMissingMessage() {
    return '导入模块尚未加载，请刷新后重试。';
  }

  function getWordImportModuleMissingMessage() {
    return 'Word 导入模块尚未加载，请刷新后重试。';
  }

  function getWordImportTooShortMessage() {
    return 'Word 文档内容太短或无法识别（仅支持 .docx 格式）。\n请确保文档包含完整的英文段落。';
  }

  function getWordImportNoSegmentsMessage() {
    return '没有识别到可解析的题目段落。';
  }

  function getAiParseLoginRequiredMessage() {
    return '请先登录后再使用 AI 解析功能。';
  }

  function getAiParseNoPassagesMessage() {
    return 'AI 没有识别出任何题目';
  }

  function getRawTextFallbackInsertedMessage() {
    return '原始文本已放入批量导入框（备课资料页），请手动整理后导入。';
  }

  function getDocxOnlyMessage() {
    return '请上传 .docx 格式的 Word 文档。';
  }

  function buildAiParseFailedFallbackConfirmMessage(error) {
    var message = error && error.message ? error.message : error;
    return 'AI 解析失败：' + (message || '') + '\n\n'
      + '是否将提取的原始文本放入批量导入框，方便手动整理？';
  }

  function buildAiParseNetworkErrorMessage(error) {
    if (error && error.name === 'AbortError') {
      return 'AI 解析超时（超过 90 秒）。\nDeepSeek 服务可能繁忙，请稍后重试，或将文档拆小后重传。';
    }
    return '网络请求失败：' + ((error && error.message) || asText(error));
  }

  function buildAiParseHttpErrorModel(errorData, status) {
    errorData = errorData || {};
    var rawError = errorData.error || '';
    var message;
    if (rawError && /无法解析为 JSON|JSON\s*parse|JSON\.parse/i.test(rawError)) {
      message = 'AI 输出被截断，已尝试降级处理。';
    } else if (rawError && /AI 返回的数据格式不正确|格式不正确/i.test(rawError)) {
      message = 'AI 没识别出题目。';
    } else {
      message = rawError || ('服务端错误 HTTP ' + (Number(status) || 0));
    }
    return {
      message: message,
      rawData: errorData
    };
  }

  function normalizeMaterialKind(kind) {
    var key = asText(kind);
    return key === 'prep' || key === 'lessonPrep' || key === 'lesson-prep' ? 'prep' : 'error';
  }

  function getMaterialKindConfig(kind) {
    if (normalizeMaterialKind(kind) === 'prep') {
      return {
        kind: 'prep',
        itemLabel: '资料',
        importUnit: '份备课资料',
        duplicateUnit: '份重复资料',
        invalidUnit: '条格式不完整的数据',
        selectedUnit: '份资料',
        emptySelectionMessage: '先勾选要删除的资料。',
        singleDeleteConfirm: '确定要删除这份备课资料吗？',
        bulkDeleteConfirmPrefix: '确定删除所选 ',
        bulkDeleteConfirmSuffix: ' 份备课资料吗？',
        cloudUpsertMethod: 'upsertPrepItem',
        cloudPullMethod: 'pullLessonPrep',
        cloudDeleteMethod: 'deletePrepItem',
        cloudSingleFailureEvent: 'lesson_prep_delete_cloud_failed',
        cloudSingleFailureConsoleMessage: '云端删除资料失败',
        cloudFailureEvent: 'lesson_prep_bulk_delete_cloud_failed',
        cloudFailureModule: 'lesson-prep',
        cloudFailureConsolePrefix: '云端删除资料失败：',
        cloudSyncFailureEvent: 'lesson_prep_sync_failed',
        cloudSyncFailureModule: 'lesson-prep',
        cloudSyncFailureConsoleMessage: 'syncPrep failed',
        cloudDeleteFailedPrefix: '云端删除失败：',
        cloudDeleteFailedSuffix: '\n刷新后该资料可能重新出现。'
      };
    }
    return {
      kind: 'error',
      itemLabel: '错题',
      importUnit: '道错题',
      duplicateUnit: '道重复题',
      invalidUnit: '条格式不完整的数据',
      selectedUnit: '道错题',
      emptySelectionMessage: '先勾选要删除的错题。',
      singleDeleteConfirm: '确定要删除这道错题吗？',
      bulkDeleteConfirmPrefix: '确定删除所选 ',
      bulkDeleteConfirmSuffix: ' 道错题吗？',
      cloudUpsertMethod: 'upsertErrorItem',
      cloudPullMethod: 'pullErrorBook',
      cloudDeleteMethod: 'deleteErrorItem',
      cloudSingleFailureEvent: 'error_book_delete_cloud_failed',
      cloudSingleFailureConsoleMessage: '云端删除错题失败',
      cloudFailureEvent: 'error_book_bulk_delete_cloud_failed',
      cloudFailureModule: 'error-book',
      cloudFailureConsolePrefix: '云端删除错题失败：',
      cloudSyncFailureEvent: 'error_book_sync_failed',
      cloudSyncFailureModule: 'error-book',
      cloudSyncFailureConsoleMessage: 'syncErrorBook failed',
      cloudDeleteFailedPrefix: '云端删除失败：',
      cloudDeleteFailedSuffix: '\n刷新后该错题可能重新出现。'
    };
  }

  function getBatchImportFormConfig(kind) {
    return kind === 'prep'
      ? { kind: 'prep', formId: 'prepBatchForm' }
      : { kind: 'error', formId: 'batchImportForm' };
  }

  function buildBatchImportFormTogglePlan(kind, isCurrentlyShown, force) {
    var config = getBatchImportFormConfig(kind);
    var nextShown = (typeof force === 'boolean') ? force : !isCurrentlyShown;
    return {
      action: 'toggle-batch-import-form',
      kind: config.kind,
      formId: config.formId,
      showClass: 'show',
      shouldShow: !!nextShown
    };
  }

  function buildSavedMaterialPracticeEntryPlan(kind, item, options) {
    options = options || {};
    var config = kind === 'prep'
      ? { kind: 'prep', previousViewSource: 'prep' }
      : { kind: 'error', previousViewSource: 'error' };
    return {
      action: item ? 'enter-saved-material-practice' : 'none',
      kind: config.kind,
      item: item || null,
      shouldCloseDrawer: !!item,
      preserveDrawerReturn: !!options.preserveDrawerReturn,
      shouldResetPracticeDisplay: !!item,
      shouldApplyPracticeContext: !!item,
      previousViewSource: config.previousViewSource,
      shouldSyncAppState: !!item,
      page: item ? 'practice' : '',
      shouldSwitchPage: !!item,
      shouldRenderExam: !!item
    };
  }

  function getBulkSelectionDomConfig(kind) {
    return kind === 'prep'
      ? {
          kind: 'prep',
          checkboxSelector: '.prep-bulk-check',
          infoId: 'prepBulkInfo'
        }
      : {
          kind: 'error',
          checkboxSelector: '.error-bulk-check',
          infoId: 'errorBulkInfo'
        };
  }

  function buildBulkSelectionInfoPlan(kind, selectedCount) {
    var config = getBulkSelectionDomConfig(kind);
    return {
      kind: config.kind,
      infoId: config.infoId,
      selectedCount: Number(selectedCount) || 0,
      text: buildBulkSelectionInfo(selectedCount, kind)
    };
  }

  function buildBulkSelectAllPlan(kind, checked) {
    var config = getBulkSelectionDomConfig(kind);
    return {
      kind: config.kind,
      checkboxSelector: config.checkboxSelector,
      checked: !!checked
    };
  }

  function buildImportResultMessage(result, kind) {
    result = result || {};
    var config = getMaterialKindConfig(kind);
    var importedCount = asArray(result.imported).length;
    var msg = '成功导入 ' + importedCount + ' ' + config.importUnit;
    if (result.skippedDuplicate > 0) msg += '\n跳过 ' + result.skippedDuplicate + ' ' + config.duplicateUnit;
    if (result.skippedInvalid > 0) msg += '\n忽略 ' + result.skippedInvalid + ' ' + config.invalidUnit;
    return msg;
  }

  function buildBulkModeState(currentMode, force) {
    return {
      bulkMode: (typeof force === 'boolean') ? force : !currentMode
    };
  }

  function buildBulkSelectionInfo(selectedCount, kind) {
    return '已选择 ' + (Number(selectedCount) || 0) + ' ' + getMaterialKindConfig(kind).selectedUnit;
  }

  function buildBulkDeletePlan(items, selectedIds) {
    var selectedSet = {};
    asArray(selectedIds).forEach(function(id) {
      selectedSet[String(id)] = true;
    });
    var ids = Object.keys(selectedSet);
    return {
      ids: ids,
      count: ids.length,
      nextItems: asArray(items).filter(function(item) {
        return !selectedSet[String(item && item.id)];
      })
    };
  }

  function buildSingleDeletePlan(items, id) {
    return buildBulkDeletePlan(items, [id]);
  }

  function normalizeDeleteIds(selectedIds) {
    var rawIds = Array.isArray(selectedIds)
      ? selectedIds
      : (selectedIds === null || selectedIds === undefined ? [] : [selectedIds]);
    var seen = {};
    var ids = [];
    rawIds.forEach(function(id) {
      var key = asText(id).trim();
      if (!key || seen[key]) return;
      seen[key] = true;
      ids.push(key);
    });
    return ids;
  }

  function buildSavedMaterialDeletePlan(kind, items, selectedIds, options) {
    options = options || {};
    var config = getMaterialKindConfig(kind);
    var ids = normalizeDeleteIds(selectedIds);
    var isBulk = options.bulk === true || options.mode === 'bulk';
    var deletePlan = buildBulkDeletePlan(items, ids);
    var count = deletePlan.count;
    return {
      action: count > 0 ? 'delete-saved-materials' : 'none',
      kind: config.kind,
      mode: isBulk ? 'bulk' : 'single',
      ids: deletePlan.ids,
      count: count,
      nextItems: deletePlan.nextItems,
      hasSelection: count > 0,
      emptySelectionMessage: config.emptySelectionMessage,
      confirmMessage: isBulk ? getBulkDeleteConfirmMessage(count, config.kind) : config.singleDeleteConfirm,
      shouldConfirm: count > 0,
      shouldDelete: count > 0,
      cloudDeleteMethod: config.cloudDeleteMethod,
      cloudFailureEvent: config.cloudFailureEvent,
      cloudFailureModule: config.cloudFailureModule,
      cloudFailureConsolePrefix: config.cloudFailureConsolePrefix
    };
  }

  function buildCloudDeleteFailure(id, error, kind) {
    return {
      kind: getMaterialKindConfig(kind).kind,
      id: asText(id),
      message: getCloudErrorMessage(error)
    };
  }

  function buildSavedMaterialCloudDeleteFailurePlan(kind, id, error) {
    var config = getMaterialKindConfig(kind);
    var failure = buildCloudDeleteFailure(id, error, config.kind);
    return {
      action: 'report-saved-material-cloud-delete-failure',
      kind: config.kind,
      id: failure.id,
      message: failure.message,
      alertMessage: getCloudDeleteFailedMessage(error, config.kind),
      consoleMessage: config.cloudSingleFailureConsoleMessage,
      observabilityEvent: config.cloudSingleFailureEvent,
      observabilityPayload: {
        module: config.cloudFailureModule,
        id: failure.id,
        firstMessage: failure.message
      }
    };
  }

	  function buildCloudDeleteFailureSummary(kind, failures) {
    var config = getMaterialKindConfig(kind);
    var items = asArray(failures).filter(function(item) {
      return item && (item.id || item.message);
    }).map(function(item) {
      return {
        kind: config.kind,
        id: asText(item.id),
        message: asText(item.message, '未知错误')
      };
    });
    var count = items.length;
    var ids = items.map(function(item) { return item.id; }).filter(Boolean);
    var firstMessage = count > 0 ? items[0].message : '';
    return {
      kind: config.kind,
      failures: items,
      count: count,
      hasFailures: count > 0,
      message: count > 0
        ? '云端删除失败 ' + count + ' ' + config.selectedUnit + '，刷新后可能重新出现。'
        : '',
      consoleMessage: count > 0 ? '云端批量删除' + config.itemLabel + '失败' : '',
      observabilityEvent: config.cloudFailureEvent,
      observabilityPayload: {
        module: config.cloudFailureModule,
        count: count,
        ids: ids.slice(0, 20),
        firstMessage: firstMessage
      }
    };
  }

  function buildCloudSyncDiffPlan(localItems, cloudItems) {
    var localIds = {};
    var upsertItems = asArray(localItems).slice();
    upsertItems.forEach(function(item) {
      if (item && item.id !== undefined && item.id !== null) {
        localIds[String(item.id)] = true;
      }
    });
    var deleteIds = [];
    asArray(cloudItems).forEach(function(item) {
      var id = item && item.id;
      if (id === undefined || id === null) return;
      id = String(id);
      if (!localIds[id]) deleteIds.push(id);
    });
    return {
      upsertItems: upsertItems,
      upsertCount: upsertItems.length,
      localIds: Object.keys(localIds),
      deleteIds: deleteIds,
      deleteCount: deleteIds.length
    };
  }

  function buildSavedMaterialsCloudSyncPlan(kind, localItems, cloudItems) {
    var config = getMaterialKindConfig(kind);
    var diff = buildCloudSyncDiffPlan(localItems, cloudItems);
    return {
      kind: config.kind,
      upsertItems: diff.upsertItems,
      upsertCount: diff.upsertCount,
      localIds: diff.localIds,
      deleteIds: diff.deleteIds,
      deleteCount: diff.deleteCount,
      cloudUpsertMethod: config.cloudUpsertMethod,
      cloudPullMethod: config.cloudPullMethod,
      cloudDeleteMethod: config.cloudDeleteMethod,
      syncFailureEvent: config.cloudSyncFailureEvent,
      syncFailureModule: config.cloudSyncFailureModule,
      syncFailureConsoleMessage: config.cloudSyncFailureConsoleMessage
    };
  }

  function buildSavedMaterialsCloudSyncRunPlan(kind, localItems) {
    var plan = buildSavedMaterialsCloudSyncPlan(kind, localItems, []);
    return {
      action: 'run-saved-materials-cloud-sync',
      kind: plan.kind,
      upsertPhase: {
        action: 'upsert-local-saved-materials',
        method: plan.cloudUpsertMethod,
        items: plan.upsertItems,
        count: plan.upsertCount,
        shouldRun: plan.upsertCount > 0
      },
      pullPhase: {
        action: 'pull-cloud-saved-materials',
        method: plan.cloudPullMethod,
        shouldRun: true
      },
      cleanupPhase: {
        action: 'delete-stale-cloud-saved-materials',
        method: plan.cloudDeleteMethod,
        ids: [],
        count: 0,
        shouldRun: false
      },
      cloudUpsertMethod: plan.cloudUpsertMethod,
      cloudPullMethod: plan.cloudPullMethod,
      cloudDeleteMethod: plan.cloudDeleteMethod,
      syncFailureEvent: plan.syncFailureEvent,
      syncFailureModule: plan.syncFailureModule,
      syncFailureConsoleMessage: plan.syncFailureConsoleMessage
    };
  }

  function buildSavedMaterialsCloudSyncCleanupPlan(kind, localItems, cloudItems) {
    var plan = buildSavedMaterialsCloudSyncPlan(kind, localItems, cloudItems);
    return {
      action: 'cleanup-saved-materials-cloud-sync',
      kind: plan.kind,
      cleanupPhase: {
        action: 'delete-stale-cloud-saved-materials',
        method: plan.cloudDeleteMethod,
        ids: plan.deleteIds,
        count: plan.deleteCount,
        shouldRun: plan.deleteCount > 0
      },
      deleteIds: plan.deleteIds,
      deleteCount: plan.deleteCount,
      cloudDeleteMethod: plan.cloudDeleteMethod,
      syncFailureEvent: plan.syncFailureEvent,
      syncFailureModule: plan.syncFailureModule,
      syncFailureConsoleMessage: plan.syncFailureConsoleMessage
    };
  }

  function buildSavedMaterialsCloudSyncFailurePlan(kind, error) {
    var config = getMaterialKindConfig(kind);
    var message = getCloudErrorMessage(error);
    return {
      action: 'report-saved-materials-cloud-sync-failure',
      kind: config.kind,
      message: message,
      syncFailureEvent: config.cloudSyncFailureEvent,
      syncFailureModule: config.cloudSyncFailureModule,
      syncFailureConsoleMessage: config.cloudSyncFailureConsoleMessage,
      observabilityPayload: {
        module: config.cloudSyncFailureModule
      }
    };
  }

  function buildLocalCloudUploadPlan(errorItems, prepItems) {
    var errorPlan = buildSavedMaterialsCloudSyncPlan('error', errorItems, []);
    var prepPlan = buildSavedMaterialsCloudSyncPlan('prep', prepItems, []);
    return {
      errorPlan: errorPlan,
      prepPlan: prepPlan,
      syncPlans: [errorPlan, prepPlan],
      successMessage: buildLocalCloudUploadSuccessMessage(errorPlan.upsertCount, prepPlan.upsertCount),
      errorPullMethod: errorPlan.cloudPullMethod,
      prepPullMethod: prepPlan.cloudPullMethod,
      shouldPullAfterUpload: true,
      shouldSaveAfterPull: true,
      shouldRenderAfterPull: true,
      failureEvent: 'cloud_upload_failed',
      failureModule: 'cloud-sync'
    };
  }

  function buildLocalCloudUploadFailurePlan(error) {
    var message = getCloudErrorMessage(error);
    return {
      failureEvent: 'cloud_upload_failed',
      failureModule: 'cloud-sync',
      message: message,
      alertMessage: buildCloudUploadFailedAlertMessage(error),
      observabilityPayload: {
        module: 'cloud-sync'
      }
    };
  }

  function buildLocalCloudUploadPullResultPlan(errorPullResult, prepPullResult, currentErrorItems, currentPrepItems, uploadPlan) {
    uploadPlan = uploadPlan || {};
    var hasErrorPullResult = !!errorPullResult;
    var hasPrepPullResult = !!prepPullResult;
    var shouldSaveAfterPull = uploadPlan.shouldSaveAfterPull !== false;
    var shouldRenderAfterPull = uploadPlan.shouldRenderAfterPull !== false;
    return {
      hasErrorPullResult: hasErrorPullResult,
      hasPrepPullResult: hasPrepPullResult,
      usedErrorFallback: !hasErrorPullResult,
      usedPrepFallback: !hasPrepPullResult,
      nextErrorItems: hasErrorPullResult ? asArray(errorPullResult) : asArray(currentErrorItems),
      nextPrepItems: hasPrepPullResult ? asArray(prepPullResult) : asArray(currentPrepItems),
      shouldSaveAfterPull: shouldSaveAfterPull,
      shouldSaveErrorBook: shouldSaveAfterPull,
      shouldSavePrepPassages: shouldSaveAfterPull,
      shouldRenderAfterPull: shouldRenderAfterPull,
      shouldRenderErrorBook: shouldRenderAfterPull,
      shouldRenderPrepList: shouldRenderAfterPull,
      shouldRenderBankStat: shouldRenderAfterPull
    };
  }

  function buildCloudPullResultPlan(errors, preps) {
    var hasCloudPayload = errors !== null && errors !== undefined;
    var nextErrorItems = hasCloudPayload ? asArray(errors) : [];
    var nextPrepItems = hasCloudPayload ? asArray(preps) : [];
    return {
      hasCloudPayload: hasCloudPayload,
      hasAnyCloudItems: nextErrorItems.length > 0 || nextPrepItems.length > 0,
      shouldApplyCloudData: hasCloudPayload,
      nextErrorItems: nextErrorItems,
      nextPrepItems: nextPrepItems,
      cloudErrorCount: nextErrorItems.length,
      cloudPrepCount: nextPrepItems.length,
      shouldCheckLocalCloudMigration: hasCloudPayload,
      shouldRenderErrorBook: hasCloudPayload,
      shouldRenderPrepList: hasCloudPayload,
      shouldRenderBankStat: hasCloudPayload,
      syncStatus: hasCloudPayload ? 'ok' : null,
      syncMessage: ''
    };
  }

  function buildCloudPullFailurePlan(error) {
    var message = getCloudErrorMessage(error);
    return {
      failureEvent: 'cloud_pull_failed',
      failureModule: 'cloud-sync',
      consoleMessage: 'cloud pull failed',
      syncStatus: 'error',
      syncMessage: message,
      alertMessage: buildCloudPullFailedAlertMessage(error)
    };
  }

  function getEmptySelectionMessage(kind) {
    return getMaterialKindConfig(kind).emptySelectionMessage;
  }

  function getSingleDeleteConfirmMessage(kind) {
    return getMaterialKindConfig(kind).singleDeleteConfirm;
  }

  function getBulkDeleteConfirmMessage(count, kind) {
    var config = getMaterialKindConfig(kind);
    return config.bulkDeleteConfirmPrefix + (Number(count) || 0) + config.bulkDeleteConfirmSuffix;
  }

  function getCloudDeleteFailedMessage(error, kind) {
    var message = error && error.message ? error.message : error;
    var config = getMaterialKindConfig(kind);
    return config.cloudDeleteFailedPrefix + (message || '') + config.cloudDeleteFailedSuffix;
  }

  function getCloudErrorMessage(error) {
    return (error && error.message) || asText(error) || '未知错误';
  }

  function buildLocalCloudMigrationConfirmMessage(errorCount, prepCount) {
    return '检测到本地有 ' + (Number(errorCount) || 0) + ' 道错题、'
      + (Number(prepCount) || 0) + ' 份备课资料，是否上传到云端？';
  }

  function buildLocalCloudUploadSuccessMessage(errorCount, prepCount) {
    return '已上传：' + (Number(errorCount) || 0) + ' 道错题 + '
      + (Number(prepCount) || 0) + ' 份备课资料';
  }

  function buildCloudPullFailedAlertMessage(error) {
    return '云端读取失败：' + getCloudErrorMessage(error);
  }

  function buildCloudUploadFailedAlertMessage(error) {
    return '上传失败：' + getCloudErrorMessage(error);
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
    hashId: hashId,
    getBatchImportJsonErrorMessage: getBatchImportJsonErrorMessage,
    getBatchImportEmptyArrayMessage: getBatchImportEmptyArrayMessage,
    parseBatchImportJson: parseBatchImportJson,
    normalizeErrorImportItem: normalizeErrorImportItem,
    importErrorItems: importErrorItems,
    groupErrorsByCategory: groupErrorsByCategory,
    buildErrorListModel: buildErrorListModel,
    normalizePrepImportItem: normalizePrepImportItem,
    importPrepItems: importPrepItems,
    buildPrepListModel: buildPrepListModel,
    buildUnifiedImportTitle: buildUnifiedImportTitle,
    buildUnifiedImportSummaryText: buildUnifiedImportSummaryText,
    buildUnifiedSelectedCountText: buildUnifiedSelectedCountText,
    buildUnifiedImportPanelModel: buildUnifiedImportPanelModel,
    buildUnifiedImportCompleteMessage: buildUnifiedImportCompleteMessage,
    normalizeUnifiedImportSelection: normalizeUnifiedImportSelection,
    buildUnifiedImportConfirmPlan: buildUnifiedImportConfirmPlan,
    normalizeDeepSeekBlank: normalizeDeepSeekBlank,
    normalizeDeepSeekPrepPassage: normalizeDeepSeekPrepPassage,
    buildDeepSeekPrepImportPlan: buildDeepSeekPrepImportPlan,
    normalizeDeepSeekErrorQuestion: normalizeDeepSeekErrorQuestion,
    buildDeepSeekErrorImportPlan: buildDeepSeekErrorImportPlan,
    buildWordImportInitialProgressModel: buildWordImportInitialProgressModel,
    buildWordImportLargeFileConfirmMessage: buildWordImportLargeFileConfirmMessage,
    buildWordImportSplitProgressModel: buildWordImportSplitProgressModel,
    buildWordImportChunkProgressModel: buildWordImportChunkProgressModel,
    buildWordImportCompletionProgressModel: buildWordImportCompletionProgressModel,
    buildWordImportFailedAlertMessage: buildWordImportFailedAlertMessage,
    getImportModuleMissingMessage: getImportModuleMissingMessage,
    getWordImportModuleMissingMessage: getWordImportModuleMissingMessage,
    getWordImportTooShortMessage: getWordImportTooShortMessage,
    getWordImportNoSegmentsMessage: getWordImportNoSegmentsMessage,
    getAiParseLoginRequiredMessage: getAiParseLoginRequiredMessage,
    getAiParseNoPassagesMessage: getAiParseNoPassagesMessage,
    getRawTextFallbackInsertedMessage: getRawTextFallbackInsertedMessage,
    getDocxOnlyMessage: getDocxOnlyMessage,
    buildAiParseFailedFallbackConfirmMessage: buildAiParseFailedFallbackConfirmMessage,
    buildAiParseNetworkErrorMessage: buildAiParseNetworkErrorMessage,
    buildAiParseHttpErrorModel: buildAiParseHttpErrorModel,
    getBatchImportFormConfig: getBatchImportFormConfig,
    buildBatchImportFormTogglePlan: buildBatchImportFormTogglePlan,
    buildSavedMaterialPracticeEntryPlan: buildSavedMaterialPracticeEntryPlan,
    getBulkSelectionDomConfig: getBulkSelectionDomConfig,
    buildBulkSelectionInfoPlan: buildBulkSelectionInfoPlan,
    buildBulkSelectAllPlan: buildBulkSelectAllPlan,
    buildImportResultMessage: buildImportResultMessage,
    buildBulkModeState: buildBulkModeState,
    buildBulkSelectionInfo: buildBulkSelectionInfo,
	    buildBulkDeletePlan: buildBulkDeletePlan,
	    buildSingleDeletePlan: buildSingleDeletePlan,
	    buildSavedMaterialDeletePlan: buildSavedMaterialDeletePlan,
	    buildCloudDeleteFailure: buildCloudDeleteFailure,
	    buildSavedMaterialCloudDeleteFailurePlan: buildSavedMaterialCloudDeleteFailurePlan,
	    buildCloudDeleteFailureSummary: buildCloudDeleteFailureSummary,
	    buildCloudSyncDiffPlan: buildCloudSyncDiffPlan,
	    buildSavedMaterialsCloudSyncPlan: buildSavedMaterialsCloudSyncPlan,
	    buildSavedMaterialsCloudSyncRunPlan: buildSavedMaterialsCloudSyncRunPlan,
	    buildSavedMaterialsCloudSyncCleanupPlan: buildSavedMaterialsCloudSyncCleanupPlan,
	    buildSavedMaterialsCloudSyncFailurePlan: buildSavedMaterialsCloudSyncFailurePlan,
	    buildLocalCloudUploadPlan: buildLocalCloudUploadPlan,
	    buildLocalCloudUploadFailurePlan: buildLocalCloudUploadFailurePlan,
	    buildLocalCloudUploadPullResultPlan: buildLocalCloudUploadPullResultPlan,
    buildCloudPullResultPlan: buildCloudPullResultPlan,
    buildCloudPullFailurePlan: buildCloudPullFailurePlan,
    getEmptySelectionMessage: getEmptySelectionMessage,
    getSingleDeleteConfirmMessage: getSingleDeleteConfirmMessage,
    getBulkDeleteConfirmMessage: getBulkDeleteConfirmMessage,
    getCloudDeleteFailedMessage: getCloudDeleteFailedMessage,
    buildLocalCloudMigrationConfirmMessage: buildLocalCloudMigrationConfirmMessage,
    buildLocalCloudUploadSuccessMessage: buildLocalCloudUploadSuccessMessage,
    buildCloudPullFailedAlertMessage: buildCloudPullFailedAlertMessage,
    buildCloudUploadFailedAlertMessage: buildCloudUploadFailedAlertMessage,
    buildPrepQuestions: buildPrepQuestions,
    createPrepStateForPassage: createPrepStateForPassage
  };
})();
