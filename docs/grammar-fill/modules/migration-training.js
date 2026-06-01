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

  function sameQuestion(a, b) {
    return a && b && (
      (a.exam === b.exam && String(a.no) === String(b.no)) ||
      (a.exam_id && b.exam_id && a.exam_id === b.exam_id && String(a.no) === String(b.no)) ||
      (a.id && b.id && a.id === b.id)
    );
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
    var unitLabel = formatTextbookUnitLabel(fineInfo);
    if (unitLabel) label += (label ? '　·　' : '') + unitLabel;
    return label;
  }

  // 仅教材单元部分（面包屑表头已含粗类，副标题不再重复粗类名）
  function formatTextbookUnitLabel(fineInfo) {
    if (!fineInfo || !fineInfo.textbook_units || !fineInfo.textbook_units.length) return '';
    var unit = fineInfo.textbook_units[0];
    var label = '对应' + unit.book + ' ' + unit.unit;
    if (fineInfo.textbook_units.length > 1) {
      label += ' 等 ' + fineInfo.textbook_units.length + ' 个单元';
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
        card: buildMigrationCardViewModel(entry)
      };
    });
    return {
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

  // "同类迁移 N 题"计数：与迁移抽屉同口径——有 fine_category 数同 fine，否则数同 category。
  function countAnalysisMigrationCandidates(q, options) {
    q = q || {};
    options = options || {};
    var bankQuestions = options.bankQuestions || [];
    return bankQuestions.filter(function(item) {
      return !sameQuestion(item, q) && questionsSharePoint(q, item);
    }).length;
  }

  // 取题的考点清单：优先 item.points；回退 fine_category / category。
  function questionPoints(item) {
    if (item && Array.isArray(item.points) && item.points.length) return item.points;
    // 回退：有 fine_category 用之；否则用 category 级伪 tag(同大类可匹配)
    if (item && item.fine_category) return [{ tag: item.fine_category }];
    return [{ tag: 'cat:' + ((item && item.category) || '') }];
  }

  // 两题是否共享至少一个考点：同 tag 且(同 key，或任一方无 key=整 tag 通配)。多标签题任一轴命中即算。
  // keyless 通配让"无 points 回退到 [{tag:fine_category}]"的题按 tag 级匹配；而 which/that 都带 key 时精确区分。
  function questionsSharePoint(a, b) {
    var ap = questionPoints(a), bp = questionPoints(b);
    for (var i = 0; i < ap.length; i++) {
      for (var j = 0; j < bp.length; j++) {
        if (!ap[i].tag || ap[i].tag !== bp[j].tag) continue;
        var ak = String(ap[i].key == null ? '' : ap[i].key);
        var bk = String(bp[j].key == null ? '' : bp[j].key);
        if (ak === bk || ak === '' || bk === '') return true;
      }
    }
    return false;
  }

  // item 是否带有与 point 同 tag 的考点，且(同 key，或任一方 keyless 通配)。单点匹配版。
  function questionMatchesPoint(item, point) {
    if (!point) return false;
    var ip = questionPoints(item);
    var pk = String(point.key == null ? '' : point.key);
    for (var i = 0; i < ip.length; i++) {
      if (ip[i].tag !== point.tag) continue;
      var ik = String(ip[i].key == null ? '' : ip[i].key);
      if (ik === pk || ik === '' || pk === '') return true;
    }
    return false;
  }

  // 标题是否可精确到这个 point 的 key：仅当池内每道携带该 tag 的题都带相同 key 时才行。
  // 池里有 keyless 题(如未派生 points 的错题，按 tag 级通配命中)或别的 key → 标题该退回 tag 级，
  // 否则会出现"标题写 from、却展示 to"的错位。多标签题里经别的 tag 命中的题不影响本轴。
  function poolHomogeneousOnKey(pool, point) {
    if (point.key == null || point.key === '') return false;
    for (var i = 0; i < (pool || []).length; i++) {
      var tagPts = questionPoints(pool[i]).filter(function(p) { return p.tag === point.tag; });
      if (!tagPts.length) continue;
      var sameKey = tagPts.some(function(p) {
        return p.key != null && String(p.key) === String(point.key);
      });
      if (!sameKey) return false;
    }
    return true;
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

    // 同大类底池（排除自身）——仅 fallbackCount 用
    var fallbackBankPool = bankQuestions.filter(function(item) {
      return item.category === q.category && !sameQuestion(item, q);
    });
    var fallbackErrorPool = errorQuestions.filter(function(item) {
      return item.category === q.category && !sameQuestion(item, q);
    });

    // 当前题考点清单(谓语已按 时态→被动→主谓一致 顺序派生)；选中一个考点(默认时态)，只按它建纯池。
    var points = questionPoints(q);
    var pointIdx = (typeof options.pointIdx === 'number' && options.pointIdx >= 0 && options.pointIdx < points.length)
      ? options.pointIdx : 0;
    var selectedPoint = points[pointIdx];

    // 显示池=只与选中考点匹配的题(去并集)，排除自身。
    var pointBankPool = bankQuestions.filter(function(item) {
      return !sameQuestion(item, q) && questionMatchesPoint(item, selectedPoint);
    });
    var pointErrorPool = errorQuestions.filter(function(item) {
      return !sameQuestion(item, q) && questionMatchesPoint(item, selectedPoint);
    });

    var bankDisplayPool = dedupe(pointBankPool);
    var errorDisplayPool = dedupe(pointErrorPool);
    var pool = selectSourcePool(source, bankDisplayPool, errorDisplayPool);
    var tabs = buildTabs(bankDisplayPool, errorDisplayPool);

    var resolvedFineInfo = fineInfo || firstFineTagFromPool(pool, getFineTagInfo);
    // 表头优先用考点面包屑(精确到 where/a/一般现在，与考点训练同口径)；解析不出再回退 fine 粗名。
    // 标题里的具体词只在当前来源池对该 key 同质时保留，否则退回 tag 级(避免"标题 from / 展示 to")。
    var titlePoints = [ poolHomogeneousOnKey(pool, selectedPoint) ? selectedPoint : { tag: selectedPoint.tag } ];
    var pointTitle = (typeof options.getPointTitle === 'function')
      ? (options.getPointTitle(titlePoints) || '')
      : '';
    var headerLabel = pointTitle
      ? pointTitle
      : (resolvedFineInfo
          ? ('同考点：' + resolvedFineInfo.name)
          : ('同类型：' + (categoryMap[q.category] || q.category || '语法填空')));
    var headerSubLabel = pointTitle
      ? formatTextbookUnitLabel(resolvedFineInfo)
      : (resolvedFineInfo ? formatFineHeaderSubLabel(resolvedFineInfo) : '');

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

    var catLabel = categoryMap[q.category] || q.category || '';
    function chipLabel(fullTitle) {
      var s = String(fullTitle || '').replace(/^按考点\s*·?\s*/, '');
      if (catLabel && s.indexOf(catLabel + ' · ') === 0) s = s.slice((catLabel + ' · ').length);
      return s.split(' · ').join('·');
    }
    var getPointTitleFn = (typeof options.getPointTitle === 'function') ? options.getPointTitle : function() { return ''; };
    var pointChips = points.map(function(p, i) {
      return { idx: i, label: chipLabel(getPointTitleFn([p])), active: i === pointIdx };
    });

    return {
      q: q,
      fineInfo: fineInfo,
      headerLabel: headerLabel,
      headerSubLabel: headerSubLabel,
      poolCount: pool.length,
      tabs: tabs,
      categoryName: categoryMap[q.category] || q.category || '',
      emptyState: emptyState,
      migration: migration,
      pointChips: pointChips
    };
  }

  window.GrammarMigrationTraining = {
    questionKey: questionKey,
    isErrorQuestionItem: isErrorQuestionItem,
    isMockQuestion: isMockQuestion,
    isRealQuestion: isRealQuestion,
    asArray: asArray,
    sameQuestion: sameQuestion,
    dedupe: dedupe,
    onePerExam: onePerExam,
    selectMigrationItems: selectMigrationItems,
    selectSourcePool: selectSourcePool,
    buildTabs: buildTabs,
    getMigrationEntryTypeMeta: getMigrationEntryTypeMeta,
    buildMigrationEntryViewModel: buildMigrationEntryViewModel,
    buildMigrationCardViewModel: buildMigrationCardViewModel,
    buildMigrationEmptyHintModel: buildMigrationEmptyHintModel,
    buildMigrationPanelViewModel: buildMigrationPanelViewModel,
    buildMigrationContentViewModel: buildMigrationContentViewModel,
    countAnalysisMigrationCandidates: countAnalysisMigrationCandidates,
    questionMatchesPoint: questionMatchesPoint,
    buildMigrationData: buildMigrationData
  };
})();
