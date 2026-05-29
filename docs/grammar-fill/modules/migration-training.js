// grammar-fill/modules/migration-training.js
//
// Pure migration-training pool helpers. No DOM access.

/* eslint-disable */
(function(){
  function questionKey(item) {
    item = item || {};
    return [item.exam || item.exam_id || '', item.no || '', item.id || ''].join('|');
  }

  function isErrorQuestionItem(item) {
    return !!(item && (item.exam === '错题本' || (item.id && String(item.id).indexOf('err_') === 0)));
  }

  function asArray(value) {
    if (Array.isArray(value)) return value;
    if (value === null || typeof value === 'undefined') return [];
    return [value];
  }

  function sameQuestion(a, b) {
    return a && b && (
      (a.exam === b.exam && String(a.no) === String(b.no)) ||
      (a.exam_id && b.exam_id && a.exam_id === b.exam_id && String(a.no) === String(b.no)) ||
      (a.id && b.id && a.id === b.id)
    );
  }

  function nonpAxisExactMatch(item, q) {
    return item && q && item.category === 'nonpredicate' && q.category === 'nonpredicate'
      && item.nonp_form && q.nonp_form
      && item.nonp_function && q.nonp_function
      && item.nonp_form === q.nonp_form
      && item.nonp_function === q.nonp_function;
  }

  function nonpAxisFormMatch(item, q) {
    return item && q && item.category === 'nonpredicate' && q.category === 'nonpredicate'
      && item.nonp_form && q.nonp_form
      && item.nonp_form === q.nonp_form
      && !nonpAxisExactMatch(item, q);
  }

  function dedupe(items) {
    var seen = {};
    return (items || []).filter(function(item) {
      var key = questionKey(item);
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function onePerExam(items) {
    var byExam = {};
    (items || []).forEach(function(item) {
      var key = item && (item.exam || item.exam_id || item.id || '');
      if (!byExam[key]) byExam[key] = item;
    });
    return Object.keys(byExam).map(function(key) { return byExam[key]; });
  }

  function selectMigrationItems(pool, source, limit) {
    pool = pool || [];
    limit = limit || 6;
    if (source === 'errors') return pool.slice(0, limit);
    if (source === 'all') {
      var bankItems = pool.filter(function(item) { return !isErrorQuestionItem(item); });
      var errorItems = pool.filter(isErrorQuestionItem);
      return onePerExam(bankItems).concat(errorItems).slice(0, limit);
    }
    return onePerExam(pool).slice(0, limit);
  }

  function selectSourcePool(source, bankDisplayPool, errorDisplayPool) {
    var allDisplayPool = dedupe((bankDisplayPool || []).concat(errorDisplayPool || []));
    if (source === 'errors') return errorDisplayPool || [];
    if (source === 'all') return allDisplayPool;
    return bankDisplayPool || [];
  }

  function buildTabs(bankDisplayPool, errorDisplayPool) {
    var allDisplayPool = dedupe((bankDisplayPool || []).concat(errorDisplayPool || []));
    return [
      { key: 'bank', label: '真题库', count: (bankDisplayPool || []).length },
      { key: 'errors', label: '我的错题', count: (errorDisplayPool || []).length },
      { key: 'all', label: '全部', count: allDisplayPool.length }
    ];
  }

  function buildDisplayPools(options) {
    options = options || {};
    var nonpAxis = !!options.nonpAxis;
    var focusFirst = !!options.focusFirst;
    var bankDisplayPool = nonpAxis
      ? dedupe([].concat(
          options.nonpExactBankPool || [],
          options.nonpFormBankPool || [],
          options.teachingBankPool || [],
          options.fineBankPool || [],
          options.trapBankPool || [],
          options.bankPool || []
        ))
      : (focusFirst
          ? dedupe([].concat(options.teachingBankPool || [], options.bankPool || [], options.trapBankPool || [], options.fineBankPool || []))
          : dedupe([].concat(options.teachingBankPool || [], options.fineBankPool || [], options.trapBankPool || [], options.bankPool || [])));

    var errorDisplayPool = nonpAxis
      ? dedupe([].concat(
          options.nonpExactErrorPool || [],
          options.nonpFormErrorPool || [],
          options.teachingErrorPool || [],
          options.fineErrorPool || [],
          options.trapErrorPool || [],
          options.errorPool || []
        ))
      : (focusFirst
          ? dedupe([].concat(options.teachingErrorPool || [], options.errorPool || [], options.trapErrorPool || [], options.fineErrorPool || []))
          : dedupe([].concat(options.teachingErrorPool || [], options.fineErrorPool || [], options.trapErrorPool || [], options.errorPool || [])));

    return {
      bankDisplayPool: bankDisplayPool,
      errorDisplayPool: errorDisplayPool,
      allDisplayPool: dedupe(bankDisplayPool.concat(errorDisplayPool))
    };
  }

  function getTeachingMigrationKeys(q, deps) {
    deps = deps || {};
    var focus = deps.focus || (deps.safeQuestionFocus ? deps.safeQuestionFocus(q) : null);
    var nonpAxis = deps.nonpAxis || (deps.getNonpAxis ? deps.getNonpAxis(q) : null);
    var guide = deps.getQuestionPracticalGuide ? deps.getQuestionPracticalGuide(q, focus, nonpAxis) : null;
    return guide ? asArray(guide.migrationKeys) : [];
  }

  function hasTeachingMigrationOverlap(item, q, qKeys, deps) {
    if (!item || !q || sameQuestion(item, q)) return false;
    qKeys = asArray(qKeys);
    if (!qKeys.length) return false;
    var itemKeys = getTeachingMigrationKeys(item, deps);
    return itemKeys.some(function(key) { return qKeys.indexOf(key) !== -1; });
  }

  function fallbackFocus(q) {
    q = q || {};
    return {
      key: q.category || 'other',
      label: q.category_name || q.category || '语法填空',
      note: ''
    };
  }

  function firstFineTagFromPool(pool, getFineTagInfo) {
    var fineCounts = {};
    (pool || []).forEach(function(item) {
      if (item && item.fine_category) {
        fineCounts[item.fine_category] = (fineCounts[item.fine_category] || 0) + 1;
      }
    });
    var topId = Object.keys(fineCounts).sort(function(a, b) {
      return fineCounts[b] - fineCounts[a];
    })[0];
    if (topId && fineCounts[topId] >= 2) return getFineTagInfo(topId);
    return null;
  }

  function formatFineHeaderSubLabel(fineInfo) {
    if (!fineInfo) return '';
    var label = fineInfo.category_name || '';
    if (fineInfo.textbook_units && fineInfo.textbook_units.length > 0) {
      var unit = fineInfo.textbook_units[0];
      label += (label ? '　·　' : '') + '对应' + unit.book + ' ' + unit.unit;
      if (fineInfo.textbook_units.length > 1) {
        label += ' 等 ' + fineInfo.textbook_units.length + ' 个单元';
      }
    }
    return label;
  }

  function getMigrationEntryTypeMeta(entry) {
    entry = entry || {};
    var item = entry.item || {};
    if (entry.isError) {
      return {
        typeLabel: '错题',
        typeClass: '',
        rowClass: ' is-error'
      };
    }
    if (item.type === '真题') {
      return {
        typeLabel: '真题',
        typeClass: ' is-real',
        rowClass: ''
      };
    }
    if (item.type === '模拟卷' || item.type === '模拟题') {
      return {
        typeLabel: '模拟',
        typeClass: ' is-mock',
        rowClass: ''
      };
    }
    return {
      typeLabel: '题库',
      typeClass: '',
      rowClass: ''
    };
  }

  function buildMigrationEntryViewModel(entry, index) {
    entry = entry || {};
    var item = entry.item || {};
    var typeMeta = getMigrationEntryTypeMeta(entry);
    return {
      indexText: String((Number(index) || 0) + 1).padStart(2, '0'),
      rowClass: typeMeta.rowClass,
      typeLabel: typeMeta.typeLabel,
      typeClass: typeMeta.typeClass,
      sourceText: (entry.srcLabel || '题库') + ' · 第' + (item.no || '') + '题',
      tagLabel: entry.tagLabel || '同类迁移',
      teachingLine: entry.teachingLine || ''
    };
  }

  function buildMigrationCardViewModel(entry) {
    entry = entry || {};
    var item = entry.item || {};
    var typeMeta = getMigrationEntryTypeMeta(entry);
    var typeTag = null;
    if (!entry.isError && typeMeta.typeLabel === '真题') {
      typeTag = {
        label: '真题',
        bg: 'var(--green-bg)',
        color: 'var(--green)'
      };
    } else if (!entry.isError && typeMeta.typeLabel === '模拟') {
      typeTag = {
        label: '模拟',
        bg: 'var(--orange-bg)',
        color: 'var(--orange)'
      };
    }
    return {
      sourceLabel: entry.srcLabel || '题库',
      sourceAccent: !!entry.isError,
      questionNo: item.no || '',
      typeTag: typeTag,
      tagLabel: entry.tagLabel || '',
      teachingLine: entry.teachingLine || '',
      ctaText: '点击进入完整讲解'
    };
  }

  function buildMigrationEmptyHintModel(emptyState) {
    if (!emptyState) return null;
    var focusLabel = emptyState.focusLabel || '当前考点';
    var primaryText = '';
    var secondaryText = '';
    if (emptyState.source === 'errors') {
      primaryText = '错题本里还没有同类判断「' + focusLabel + '」的题。';
      secondaryText = '上传 Word 文档时勾选"高频错题"，多积累几道再来。';
    } else if (emptyState.source === 'all') {
      primaryText = '题库和错题本里都没有同类判断「' + focusLabel + '」的题。';
    } else {
      primaryText = '真题库里暂无同类判断「' + focusLabel + '」的其他题目。';
    }
    return {
      primaryText: primaryText,
      secondaryText: secondaryText,
      fallbackText: emptyState.fallbackCount > 0
        ? '可切回粗分类「' + (emptyState.fallbackCategoryLabel || '语法填空') + '」，但课堂复习会更泛。'
        : ''
    };
  }

  function buildMigrationPanelViewModel(data, source) {
    data = data || {};
    source = source || 'bank';
    var migration = asArray(data.migration);
    var poolCount = Number(data.poolCount) || 0;
    var shownCount = migration.length;
    return {
      tabs: asArray(data.tabs).map(function(item) {
        item = item || {};
        return {
          key: item.key || '',
          label: item.label || '',
          count: Number(item.count) || 0,
          active: item.key === source
        };
      }),
      heading: data.headerLabel || '同类迁移',
      subline: data.headerSubLabel || '',
      poolCount: poolCount,
      shownCount: shownCount,
      countText: '共 ' + poolCount + ' 题，展示 ' + shownCount + ' 题。',
      emptyHint: buildMigrationEmptyHintModel(data.emptyState),
      hasItems: shownCount > 0
    };
  }

  function buildMigrationContentViewModel(data, source) {
    data = data || {};
    var panel = buildMigrationPanelViewModel(data, source);
    return {
      tabs: panel.tabs,
      heading: panel.heading,
      subline: panel.subline,
      poolCount: panel.poolCount,
      shownCount: panel.shownCount,
      countText: panel.countText,
      emptyHint: panel.emptyHint,
      hasItems: panel.hasItems,
      entries: asArray(data.migration).map(function(entry, index) {
        entry = entry || {};
        return {
          id: entry.id || '',
          index: index,
          entry: entry,
          item: entry.item || {},
          sentenceHtml: entry.sentenceHtml || '',
          row: buildMigrationEntryViewModel(entry, index),
          card: buildMigrationCardViewModel(entry)
        };
      })
    };
  }

  function countAnalysisMigrationCandidates(q, options) {
    q = q || {};
    options = options || {};
    var bankQuestions = options.bankQuestions || [];
    var nonpAxis = options.nonpAxis || (options.getNonpAxis ? options.getNonpAxis(q) : null);
    if (nonpAxis) {
      var exactCount = bankQuestions.filter(function(item) {
        return nonpAxisExactMatch(item, q) && !sameQuestion(item, q);
      }).length;
      var formCount = bankQuestions.filter(function(item) {
        return nonpAxisFormMatch(item, q) && !sameQuestion(item, q);
      }).length;
      return exactCount + formCount;
    }

    var focus = options.focus || (options.safeQuestionFocus ? options.safeQuestionFocus(q) : fallbackFocus(q));
    var safeQuestionFocusKey = options.safeQuestionFocusKey || function(item) {
      var itemFocus = options.safeQuestionFocus ? options.safeQuestionFocus(item) : fallbackFocus(item);
      return itemFocus ? itemFocus.key : '';
    };
    var deps = {
      safeQuestionFocus: options.safeQuestionFocus || fallbackFocus,
      getNonpAxis: options.getNonpAxis || function() { return null; },
      getQuestionPracticalGuide: options.getQuestionPracticalGuide || function() { return null; }
    };
    var practicalGuide = options.practicalGuide || (options.getQuestionPracticalGuide
      ? options.getQuestionPracticalGuide(q, focus, nonpAxis)
      : null);
    var qMigrationKeys = practicalGuide ? asArray(practicalGuide.migrationKeys) : [];
    var guideCount = qMigrationKeys.length ? bankQuestions.filter(function(item) {
      return hasTeachingMigrationOverlap(item, q, qMigrationKeys, deps);
    }).length : 0;
    if (guideCount) return guideCount;
    return bankQuestions.filter(function(item) {
      if (sameQuestion(item, q)) return false;
      return q.fine_category
        ? item.fine_category === q.fine_category
        : safeQuestionFocusKey(item) === (focus && focus.key);
    }).length;
  }

  function buildMigrationData(q, options) {
    q = q || {};
    options = options || {};
    var source = options.source || 'bank';
    var bankQuestions = options.bankQuestions || [];
    var errorQuestions = options.errorQuestions || [];
    var categoryMap = options.categoryMap || {};
    var safeQuestionFocus = options.safeQuestionFocus || fallbackFocus;
    var safeQuestionTrap = options.safeQuestionTrap || function() { return null; };
    var safeQuestionTrapId = options.safeQuestionTrapId || function(item) {
      var trap = safeQuestionTrap(item);
      return trap ? trap.id : '';
    };
    var safeQuestionFocusKey = options.safeQuestionFocusKey || function(item) {
      var focus = safeQuestionFocus(item);
      return focus ? focus.key : '';
    };
    var getFineTagInfo = options.getFineTagInfo || function() { return null; };
    var getNonpAxis = options.getNonpAxis || function() { return null; };
    var getQuestionPracticalGuide = options.getQuestionPracticalGuide || function() { return null; };
    var deps = {
      safeQuestionFocus: safeQuestionFocus,
      getNonpAxis: getNonpAxis,
      getQuestionPracticalGuide: getQuestionPracticalGuide
    };

    var focus = safeQuestionFocus(q) || fallbackFocus(q);
    var trap = safeQuestionTrap(q);
    var trapId = trap ? trap.id : '';
    var fineCat = q.fine_category;
    var fineInfo = getFineTagInfo(fineCat);
    var nonpAxis = getNonpAxis(q);
    var practicalGuide = getQuestionPracticalGuide(q, focus, nonpAxis);
    var teachingKeys = practicalGuide ? asArray(practicalGuide.migrationKeys) : [];
    var focusFirst = q.category === 'word' && fineCat === 'word-adj-adv-choice';

    var teachingBankPool = teachingKeys.length ? bankQuestions.filter(function(item) {
      return hasTeachingMigrationOverlap(item, q, teachingKeys, deps);
    }) : [];
    var teachingErrorPool = teachingKeys.length ? errorQuestions.filter(function(item) {
      return hasTeachingMigrationOverlap(item, q, teachingKeys, deps);
    }) : [];

    var nonpExactBankPool = nonpAxis ? bankQuestions.filter(function(item) {
      return nonpAxisExactMatch(item, q) && !sameQuestion(item, q);
    }) : [];
    var nonpExactErrorPool = nonpAxis ? errorQuestions.filter(function(item) {
      return nonpAxisExactMatch(item, q) && !sameQuestion(item, q);
    }) : [];
    var nonpFormBankPool = nonpAxis ? bankQuestions.filter(function(item) {
      return nonpAxisFormMatch(item, q) && !sameQuestion(item, q);
    }) : [];
    var nonpFormErrorPool = nonpAxis ? errorQuestions.filter(function(item) {
      return nonpAxisFormMatch(item, q) && !sameQuestion(item, q);
    }) : [];

    var fineBankPool = fineCat ? bankQuestions.filter(function(item) {
      return item.fine_category === fineCat && !sameQuestion(item, q);
    }) : [];
    var fineErrorPool = fineCat ? errorQuestions.filter(function(item) {
      return item.fine_category === fineCat && !sameQuestion(item, q);
    }) : [];

    var trapBankPool = trapId ? bankQuestions.filter(function(item) {
      return safeQuestionTrapId(item) === trapId && !sameQuestion(item, q);
    }) : [];
    var trapErrorPool = trapId ? errorQuestions.filter(function(item) {
      return safeQuestionTrapId(item) === trapId && !sameQuestion(item, q);
    }) : [];

    var bankPool = bankQuestions.filter(function(item) {
      return item.category === q.category && safeQuestionFocusKey(item) === focus.key && !sameQuestion(item, q);
    });
    var errorPool = errorQuestions.filter(function(item) {
      return item.category === q.category && safeQuestionFocusKey(item) === focus.key && !sameQuestion(item, q);
    });

    var fallbackBankPool = bankQuestions.filter(function(item) {
      return item.category === q.category && !sameQuestion(item, q);
    });
    var fallbackErrorPool = errorQuestions.filter(function(item) {
      return item.category === q.category && !sameQuestion(item, q);
    });

    var displayPools = buildDisplayPools({
      nonpAxis: nonpAxis,
      focusFirst: focusFirst,
      teachingBankPool: teachingBankPool,
      teachingErrorPool: teachingErrorPool,
      nonpExactBankPool: nonpExactBankPool,
      nonpExactErrorPool: nonpExactErrorPool,
      nonpFormBankPool: nonpFormBankPool,
      nonpFormErrorPool: nonpFormErrorPool,
      fineBankPool: fineBankPool,
      fineErrorPool: fineErrorPool,
      trapBankPool: trapBankPool,
      trapErrorPool: trapErrorPool,
      bankPool: bankPool,
      errorPool: errorPool
    });
    var bankDisplayPool = displayPools.bankDisplayPool;
    var errorDisplayPool = displayPools.errorDisplayPool;
    var pool = selectSourcePool(source, bankDisplayPool, errorDisplayPool);
    var tabs = buildTabs(bankDisplayPool, errorDisplayPool);

    var resolvedFineInfo = fineInfo || firstFineTagFromPool(pool, getFineTagInfo);
    var headerLabel = '';
    var headerSubLabel = '';
    if (practicalGuide && practicalGuide.title) {
      headerLabel = '同类迁移：' + practicalGuide.title;
      headerSubLabel = practicalGuide.trigger || '';
    } else if (resolvedFineInfo) {
      headerLabel = '同考点：' + resolvedFineInfo.name;
      headerSubLabel = formatFineHeaderSubLabel(resolvedFineInfo);
    } else {
      headerLabel = '同类型：' + focus.label;
    }

    var fallbackCount = source === 'errors'
      ? fallbackErrorPool.length
      : (source === 'all' ? fallbackBankPool.length + fallbackErrorPool.length : fallbackBankPool.length);
    var focusLabel = practicalGuide && practicalGuide.title
      ? practicalGuide.title
      : (nonpAxis ? nonpAxis.title : (fineInfo ? fineInfo.name : (trap ? trap.name : focus.label)));
    var emptyState = pool.length ? null : {
      source: source,
      focusLabel: focusLabel,
      fallbackCount: fallbackCount,
      fallbackCategoryLabel: categoryMap[q.category] || q.category || '语法填空'
    };

    var migration = selectMigrationItems(pool, source, options.limit || 6).map(function(item) {
      var isError = isErrorQuestionItem(item);
      var itemFineInfo = getFineTagInfo(item.fine_category);
      var itemFocus = safeQuestionFocus(item) || fallbackFocus(item);
      var itemAxis = getNonpAxis(item);
      var itemGuide = getQuestionPracticalGuide(item, itemFocus, itemAxis);
      return {
        item: item,
        isError: isError,
        srcLabel: isError ? '📝 我的错题' : item.exam,
        tagLabel: itemGuide && itemGuide.title
          ? itemGuide.title
          : (itemAxis
            ? (itemAxis.formLabel + ' · ' + itemAxis.functionLabel)
            : ((itemFineInfo && itemFineInfo.name) || itemFocus.label)),
        teachingLine: itemGuide && itemGuide.trigger
          ? itemGuide.trigger
          : (itemAxis && itemAxis.rule ? itemAxis.rule : '')
      };
    });

    return {
      q: q,
      focus: focus,
      trap: trap,
      fineInfo: fineInfo,
      nonpAxis: nonpAxis,
      practicalGuide: practicalGuide,
      headerLabel: headerLabel,
      headerSubLabel: headerSubLabel,
      poolCount: pool.length,
      tabs: tabs,
      emptyState: emptyState,
      migration: migration
    };
  }

  window.GrammarMigrationTraining = {
    questionKey: questionKey,
    isErrorQuestionItem: isErrorQuestionItem,
    asArray: asArray,
    sameQuestion: sameQuestion,
    nonpAxisExactMatch: nonpAxisExactMatch,
    nonpAxisFormMatch: nonpAxisFormMatch,
    dedupe: dedupe,
    onePerExam: onePerExam,
    selectMigrationItems: selectMigrationItems,
    selectSourcePool: selectSourcePool,
    buildTabs: buildTabs,
    buildDisplayPools: buildDisplayPools,
    getTeachingMigrationKeys: getTeachingMigrationKeys,
    hasTeachingMigrationOverlap: hasTeachingMigrationOverlap,
    getMigrationEntryTypeMeta: getMigrationEntryTypeMeta,
    buildMigrationEntryViewModel: buildMigrationEntryViewModel,
    buildMigrationCardViewModel: buildMigrationCardViewModel,
    buildMigrationEmptyHintModel: buildMigrationEmptyHintModel,
    buildMigrationPanelViewModel: buildMigrationPanelViewModel,
    buildMigrationContentViewModel: buildMigrationContentViewModel,
    countAnalysisMigrationCandidates: countAnalysisMigrationCandidates,
    buildMigrationData: buildMigrationData
  };
})();
