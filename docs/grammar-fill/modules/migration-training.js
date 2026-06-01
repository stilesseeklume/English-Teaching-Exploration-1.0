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

  function isMockQuestion(item) {
    item = item || {};
    return item.type === '模拟卷' || item.type === '模拟题';
  }

  function isRealQuestion(item) {
    return (item || {}).type === '真题';
  }

  function asArray(value) {
    if (Array.isArray(value)) return value;
    if (value === null || typeof value === 'undefined') return [];
    return [value];
  }

  // T4：facets 可缩放范围（由细到粗）。一把尺子：
  //   word     级 ← facets.word || facets.form     （最细：具体引导词/形式，如 which / doing）
  //   type     级 ← facets.type || facets.subtype  （中：结构子类，如 relative-pronoun / derivation）
  //   category 级 ← item.category 大类             （最粗：13 大类，如 attrib / nonpredicate）
  // 谓语 {tense,voice,agreement} 无 word/type 键 → 仅 category 一级（时态轴以后再增强）。
  function facetWordValue(facets) {
    facets = facets || {};
    if (facets.word) return String(facets.word);
    if (facets.form) return String(facets.form);
    return '';
  }

  function facetTypeValue(facets) {
    facets = facets || {};
    if (facets.type) return String(facets.type);
    if (facets.subtype) return String(facets.subtype);
    return '';
  }

  function buildMigrationScopes(facets, fineCategory, category, fineTagsByCategory) {
    facets = facets || {};
    var scopes = [];
    var wordVal = facetWordValue(facets);
    if (wordVal) scopes.push({ level: 'word', value: wordVal });
    // 第②档：该大类全部 fine tag 固定全列（含0题），不再只取当前题 type
    var tags = (fineTagsByCategory && category) ? (fineTagsByCategory[category] || []) : [];
    tags.forEach(function(tag) {
      if (tag && tag.id) scopes.push({ level: 'finetag', value: tag.id, label: tag.name || tag.id });
    });
    if (category) scopes.push({ level: 'category', value: String(category) });
    return scopes;
  }

  function migrationMatchesScope(item, scope) {
    if (!item || !scope) return false;
    var facets = item.facets || {};
    if (scope.level === 'word') return facetWordValue(facets) === scope.value;
    if (scope.level === 'finetag') return String(item.fine_category || '') === scope.value;
    if (scope.level === 'type') return facetTypeValue(facets) === scope.value;
    if (scope.level === 'category') return String(item.category || '') === scope.value;
    return false;
  }

  // 范围选择器友好标签（未覆盖的值回退原串，标签非硬约束，可后续细化）
  var SCOPE_VALUE_LABELS = {
    'to-do': '不定式', 'doing': '分词/动名词', 'done': '过去分词',
    'derivation': '派生词', 'comparative': '比较级', 'superlative': '最高级',
    'gerund': '动名词', 'participle-adj': '分词形容词', 'selection': '形/副选用',
    'personal': '人称代词', 'indefinite': '不定代词', 'it': '形式 it',
    'plural': '名词复数', 'possessive': '名词所有格', 'numeral': '数词',
    'relative-pronoun': '关系代词', 'relative-adverb': '关系副词',
    'prep-relative': '介词+关系词', 'as-relative': 'as 关系词',
    'that': 'that 引导', 'whether-if': 'whether/if', 'wh-pronoun': '连接代词',
    'wh-adverb': '连接副词', 'wh-ever': 'wh-ever',
    'time': '时间', 'cause': '原因', 'place': '地点', 'condition': '条件',
    'manner': '方式', 'concession': '让步', 'comparison': '比较',
    'purpose': '目的', 'result': '结果',
    'coordinating': '并列', 'correlative': '关联'
  };

  function scopeButtonLabel(scope, categoryName) {
    if (!scope) return '';
    if (scope.level === 'category') return '整个' + (categoryName || scope.value);
    if (scope.level === 'finetag') return scope.label || scope.value;
    return SCOPE_VALUE_LABELS[scope.value] || scope.value;
  }

  function sameScope(a, b) {
    return !!(a && b && a.level === b.level && a.value === b.value);
  }

  // 范围选择器视图模型：由细到粗的按钮，标注当前激活档。
  function buildMigrationScopeSelectorModel(scopes, activeScope, categoryName) {
    scopes = asArray(scopes);
    if (scopes.length < 2) return { visible: false, buttons: [] };
    var buttons = scopes.map(function(s) {
      return {
        level: s.level,
        value: s.value,
        count: Number(s.count) || 0,
        label: scopeButtonLabel(s, categoryName),
        active: sameScope(s, activeScope)
      };
    });
    return { visible: true, buttons: buttons };
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
    return onePerExam(pool).slice(0, limit);
  }

  function selectSourcePool(source, bankDisplayPool, errorDisplayPool) {
    if (source === 'errors') return errorDisplayPool || [];
    if (source === 'mock') return (bankDisplayPool || []).filter(isMockQuestion);
    return (bankDisplayPool || []).filter(isRealQuestion);
  }

  function buildTabs(bankDisplayPool, errorDisplayPool) {
    var pool = bankDisplayPool || [];
    return [
      { key: 'bank', label: '真题库', count: pool.filter(isRealQuestion).length },
      { key: 'mock', label: '模拟题', count: pool.filter(isMockQuestion).length },
      { key: 'errors', label: '我的错题', count: (errorDisplayPool || []).length }
    ];
  }

  function buildDisplayPools(options) {
    options = options || {};
    var nonpAxis = !!options.nonpAxis;
    var focusFirst = !!options.focusFirst;
    var bankDisplayPool = nonpAxis
      ? dedupe([].concat(
          options.nonpExactBankPool || [],
          options.nonpFormBankPool || []
        ))   // 非谓语迁移只取同形式(doing/done/to_do)，不灌粗类避免 doing 题混进一堆 todo
      : (focusFirst
          ? dedupe([].concat(options.teachingBankPool || [], options.bankPool || [], options.trapBankPool || [], options.fineBankPool || []))
          : dedupe([].concat(options.teachingBankPool || [], options.fineBankPool || [], options.trapBankPool || [], options.bankPool || [])));

    var errorDisplayPool = nonpAxis
      ? dedupe([].concat(
          options.nonpExactErrorPool || [],
          options.nonpFormErrorPool || []
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
    } else if (emptyState.source === 'mock') {
      primaryText = '模拟题里暂无同类判断「' + focusLabel + '」的其他题目。';
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

  // 迁移内筛选（原型）：tag 内按"具体词/形式"下钻。筛选键优先用非谓语已存的 nonp_form，
  // 其次用单词答案本身；开放类（形容词等每题不同）会产生过多键，由 chip 数量阈值过滤掉。
  function migrationFilterKey(item) {
    item = item || {};
    if (item.nonp_form) return String(item.nonp_form);
    var ans = String(item.answer || '').trim().toLowerCase();
    if (ans && ans.indexOf(' ') === -1 && ans.length <= 12) return ans;
    return '';
  }

  function buildMigrationFilterChips(entries) {
    var counts = {}, order = [];
    asArray(entries).forEach(function(e) {
      var k = e && e.filterKey;
      if (!k) return;
      if (!(k in counts)) { counts[k] = 0; order.push(k); }
      counts[k]++;
    });
    // 只在 2~8 个不同键时显示筛选片：闭合类(doing/what/and)出片，开放类(形容词)不出
    if (order.length < 2 || order.length > 8) return [];
    // 抑制实词噪音：清一色 count=1（每题不同的 verb/形容词）无分组意义，不出片；
    // 至少有一个键重复(count>=2)才说明有真正的"同类"组（如 and:7 / what:3）
    var maxCount = order.reduce(function(m, k) { return counts[k] > m ? counts[k] : m; }, 0);
    if (maxCount < 2) return [];
    return order.map(function(k) { return { key: k, label: k, count: counts[k] }; });
  }

  function buildMigrationContentViewModel(data, source, showAll) {
    data = data || {};
    var panel = buildMigrationPanelViewModel(data, source);
    var entries = asArray(data.migration).map(function(entry, index) {
      entry = entry || {};
      return {
        id: entry.id || '',
        index: index,
        entry: entry,
        item: entry.item || {},
        sentenceHtml: entry.sentenceHtml || '',
        row: buildMigrationEntryViewModel(entry, index),
        card: buildMigrationCardViewModel(entry),
        filterKey: migrationFilterKey(entry.item || {})
      };
    });
    return {
      filterChips: buildMigrationFilterChips(entries),
      scopeSelector: buildMigrationScopeSelectorModel(data.scopes, data.activeScope, data.categoryName),
      tabs: panel.tabs,
      heading: panel.heading,
      subline: panel.subline,
      poolCount: panel.poolCount,
      shownCount: panel.shownCount,
      countText: panel.countText,
      emptyHint: panel.emptyHint,
      hasItems: panel.hasItems,
      showAllButton: (function() {
        var poolCount = Number(data.poolCount) || 0;
        return {
          visible: poolCount > 6,
          showingAll: !!showAll,
          label: showAll ? '收起，只看 6 题' : ('显示全部 ' + poolCount + ' 题')
        };
      })(),
      entries: entries
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
    var getFineTagInfo = options.getFineTagInfo || function() { return null; };

    var fineCat = q.fine_category;
    var fineInfo = getFineTagInfo(fineCat);

    // 同大类底池（排除自身）——范围选择器底座与 fallbackCount 都从这里取
    var fallbackBankPool = bankQuestions.filter(function(item) {
      return item.category === q.category && !sameQuestion(item, q);
    });
    var fallbackErrorPool = errorQuestions.filter(function(item) {
      return item.category === q.category && !sameQuestion(item, q);
    });

    // 默认显示池=同 fine_category（从同大类底池再过滤）；无 fine_category 时退回同大类
    var fineBankPool = fineCat ? fallbackBankPool.filter(function(item) {
      return item.fine_category === fineCat;
    }) : fallbackBankPool;
    var fineErrorPool = fineCat ? fallbackErrorPool.filter(function(item) {
      return item.fine_category === fineCat;
    }) : fallbackErrorPool;

    var bankDisplayPool = dedupe(fineBankPool);
    var errorDisplayPool = dedupe(fineErrorPool);
    var pool = selectSourcePool(source, bankDisplayPool, errorDisplayPool);
    var tabs = buildTabs(bankDisplayPool, errorDisplayPool);

    // T4：facets 可缩放范围。底座=同大类（fallback*Pool 已是同 category 排除自身），
    // 按选中范围（word/type/category）缩放，默认落最细。spec §四之二。
    var qFacets = q.facets || {};
    var hasFacets = !!(qFacets && Object.keys(qFacets).length);
    var scopes = [];
    var activeScope = null;
    if (hasFacets) {
      var fineTagsByCategory = (options.fineTags && options.fineTags.tags_by_category) || {};
      var scopeBasePool = selectSourcePool(source, fallbackBankPool, fallbackErrorPool);
      scopes = buildMigrationScopes(qFacets, fineCat, q.category, fineTagsByCategory).map(function(s) {
        return {
          level: s.level,
          value: s.value,
          label: s.label,
          count: scopeBasePool.filter(function(it) { return migrationMatchesScope(it, s); }).length
        };
      });
      // 默认激活：当前题对应的 finetag 档（没有则落最细 word 档）
      activeScope = options.scope
        || scopes.filter(function(s){ return s.level === 'finetag' && s.value === fineCat; })[0]
        || scopes[0] || null;
      pool = activeScope
        ? scopeBasePool.filter(function(it) { return migrationMatchesScope(it, activeScope); })
        : scopeBasePool;
    }

    var resolvedFineInfo = fineInfo || firstFineTagFromPool(pool, getFineTagInfo);
    var headerLabel = resolvedFineInfo
      ? ('同考点：' + resolvedFineInfo.name)
      : ('同类型：' + (categoryMap[q.category] || q.category || '语法填空'));
    var headerSubLabel = resolvedFineInfo ? formatFineHeaderSubLabel(resolvedFineInfo) : '';

    var fallbackCount = source === 'errors'
      ? fallbackErrorPool.length
      : (source === 'mock'
          ? fallbackBankPool.filter(isMockQuestion).length
          : fallbackBankPool.filter(isRealQuestion).length);
    var focusLabel = resolvedFineInfo ? resolvedFineInfo.name : (categoryMap[q.category] || q.category || '当前考点');
    var emptyState = pool.length ? null : {
      source: source,
      focusLabel: focusLabel,
      fallbackCount: fallbackCount,
      fallbackCategoryLabel: categoryMap[q.category] || q.category || '语法填空'
    };

    var migration = selectMigrationItems(pool, source, options.limit || 6).map(function(item) {
      var isError = isErrorQuestionItem(item);
      var itemFineInfo = getFineTagInfo(item.fine_category);
      return {
        item: item,
        isError: isError,
        srcLabel: isError ? '📝 我的错题' : item.exam,
        tagLabel: (itemFineInfo && itemFineInfo.name) || (categoryMap[item.category] || item.category || '同类迁移'),
        teachingLine: ''
      };
    });

    return {
      q: q,
      fineInfo: fineInfo,
      headerLabel: headerLabel,
      headerSubLabel: headerSubLabel,
      poolCount: pool.length,
      tabs: tabs,
      scopes: scopes,
      activeScope: activeScope,
      categoryName: categoryMap[q.category] || q.category || '',
      emptyState: emptyState,
      migration: migration
    };
  }

  window.GrammarMigrationTraining = {
    questionKey: questionKey,
    isErrorQuestionItem: isErrorQuestionItem,
    isMockQuestion: isMockQuestion,
    isRealQuestion: isRealQuestion,
    buildMigrationScopes: buildMigrationScopes,
    migrationMatchesScope: migrationMatchesScope,
    buildMigrationScopeSelectorModel: buildMigrationScopeSelectorModel,
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
    migrationFilterKey: migrationFilterKey,
    buildMigrationFilterChips: buildMigrationFilterChips,
    countAnalysisMigrationCandidates: countAnalysisMigrationCandidates,
    buildMigrationData: buildMigrationData
  };
})();
