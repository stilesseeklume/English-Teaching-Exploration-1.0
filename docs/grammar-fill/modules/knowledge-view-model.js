// grammar-fill/modules/knowledge-view-model.js
//
// Pure data builders for the knowledge page. The legacy page keeps rendering,
// modal behavior, and navigation side effects.

/* eslint-disable */
(function(){
  var BOOK_ORDER = ['必修一', '必修二', '必修三', '选必一', '选必二', '选必三', '选必四'];
  var COVER_MAP = {
    '必修一': 'images/textbook-covers/bixiu-1.jpg',
    '必修二': 'images/textbook-covers/bixiu-2.jpg',
    '必修三': 'images/textbook-covers/bixiu-3.jpg',
    '选必一': 'images/textbook-covers/xuanbi-1.jpg',
    '选必二': 'images/textbook-covers/xuanbi-2.jpg',
    '选必三': 'images/textbook-covers/xuanbi-3.jpg',
    '选必四': 'images/textbook-covers/xuanbi-4.jpg'
  };
  var CATEGORY_STAT_COLORS = {
    predicate: { bg: '#ffd60a', color: '#947000' },
    nonpredicate: { bg: 'var(--green-bg)', color: 'var(--green)' },
    word: { bg: 'var(--blue-bg)', color: 'var(--blue)' },
    number: { bg: 'var(--purple-bg)', color: 'var(--purple)' },
    article: { bg: 'var(--orange-bg)', color: 'var(--orange)' },
    pronoun: { bg: 'var(--red-bg)', color: 'var(--red)' },
    preposition: { bg: 'var(--teal-bg)', color: 'var(--teal)' },
    logic: { bg: '#f6edfb', color: '#af52de' },
    attrib: { bg: '#fee8e7', color: 'var(--red)' },
    nounclause: { bg: '#e6f7fd', color: 'var(--teal)' },
    advclause: { bg: '#e8f8ed', color: 'var(--green)' }
  };
  var FALLBACK_COLOR = { bg: 'var(--surface-3)', color: 'var(--text-2)' };

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function stripHtml(value) {
    return String(value || '').replace(/<[^>]+>/g, ' ');
  }

  function normalizeSpaces(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function normalizeTagId(tagRef) {
    tagRef = String(tagRef || '');
    return tagRef.indexOf('aux:') === 0 ? tagRef.slice(4) : tagRef;
  }

  function countByFineTag(fineCategory, bankQuestions, errorQuestions) {
    var bankItems = asArray(bankQuestions).filter(function(q) { return q && q.fine_category === fineCategory; });
    var errorCount = asArray(errorQuestions).filter(function(q) { return q && q.fine_category === fineCategory; }).length;
    var realCount = bankItems.filter(function(q) { return q && q.type === '真题'; }).length;
    return { bank: bankItems.length, error: errorCount, real: realCount, total: bankItems.length + errorCount };
  }

  // 按 points 精数：q.points 中存在 {tag 相同 且 (keys 空=只认tag，或 key∈keys)} 即命中。
  // 口径对齐 countByFineTag：total=bank+error，real=bank 中真题数。
  function countByPoint(tag, keys, bankQuestions, errorQuestions) {
    keys = asArray(keys);
    function matches(q) {
      if (!q || !Array.isArray(q.points)) return false;
      return q.points.some(function(p) {
        if (!p || p.tag !== tag) return false;
        return keys.length === 0 || keys.indexOf(p.key) !== -1;
      });
    }
    var bankItems = asArray(bankQuestions).filter(matches);
    var errorCount = asArray(errorQuestions).filter(matches).length;
    var realCount = bankItems.filter(function(q) { return q && q.type === '真题'; }).length;
    return { bank: bankItems.length, error: errorCount, real: realCount, total: bankItems.length + errorCount };
  }

  // 计数徽章：total 题 · 真题R · 模拟M · 错题E。全真题(无模拟无错题)时只显示「N 题」。
  // mock = bank - real（bank 中非真题即模拟卷）；error = 错题本命中数。
  function formatCountBadge(counts) {
    counts = counts || {};
    var total = Number(counts.total) || 0;
    var real = Number(counts.real) || 0;
    var error = Number(counts.error) || 0;
    var mock = Math.max(0, (Number(counts.bank) || 0) - real);
    if (mock === 0 && error === 0) return total + ' 题';
    var segs = [];
    if (real > 0) segs.push('真题' + real);
    if (mock > 0) segs.push('模拟' + mock);
    if (error > 0) segs.push('错题' + error);
    return total + ' 题 · ' + segs.join(' · ');
  }

  // 取题在某 tag 下的迁移细分值：优先 points 里同 tag 的 key（与迁移口径一致，如冠词 a/an），回退 facets.word。
  function pointKeyForTag(q, tag) {
    if (q && Array.isArray(q.points)) {
      for (var i = 0; i < q.points.length; i++) {
        var p = q.points[i];
        if (p && p.tag === tag && p.key) return String(p.key);
      }
    }
    return (q && q.facets && q.facets.word) || '';
  }

  // 取某 fine tag 的"具体词"分布。闭合类(tag.words)列全标0；介词(category.core_words)核心打底+题库追加；
  // 其余大类返回空(不下钻)。每词 {word,total,real}，有题在前(total降序)，0题词按预定义顺序排后。
  // 词取 points.key（与迁移筛选同口径，回退 facets.word）——冠词 a/an 因此正确分开而非合并 'a-an'。
  function buildLeafWordBreakdown(fineId, fineTags, bankQuestions, errorQuestions) {
    fineTags = fineTags || {};
    var tag = (fineTags.tags_by_id || {})[fineId];
    if (!tag) return [];
    var counts = {};
    function tally(pool, isBank) {
      asArray(pool).forEach(function(q) {
        if (!q || q.fine_category !== fineId) return;
        var w = pointKeyForTag(q, fineId);
        if (!w) return;
        if (!counts[w]) counts[w] = { total: 0, real: 0 };
        counts[w].total++;
        if (isBank && q.type === '真题') counts[w].real++;
      });
    }
    tally(bankQuestions, true);
    tally(errorQuestions, false);

    var predefined = [];
    if (tag.words && tag.words.length) predefined = tag.words.slice();
    else if (tag.category === 'preposition') {
      var cat = (fineTags.categories || {}).preposition || {};
      predefined = (cat.core_words || []).slice();
    } else {
      return []; // 非下钻大类
    }

    var seen = {}, list = [];
    predefined.forEach(function(w) {
      if (seen[w]) return; seen[w] = true;
      var c = counts[w] || { total: 0, real: 0 };
      list.push({ word: w, total: c.total, real: c.real });
    });
    Object.keys(counts).forEach(function(w) {
      if (seen[w]) return; seen[w] = true;
      list.push({ word: w, total: counts[w].total, real: counts[w].real });
    });
    list.sort(function(a, b) { return b.total - a.total; });
    return list;
  }

  function getFrequencyStyle(total) {
    total = Number(total || 0) || 0;
    if (total >= 10) return { bg: 'var(--red-bg)', color: 'var(--red)', label: '高频' };
    if (total >= 3) return { bg: 'var(--orange-bg)', color: 'var(--orange)', label: '中频' };
    if (total >= 1) return { bg: 'var(--accent-bg)', color: 'var(--accent)', label: '低频' };
    return { bg: 'var(--surface-3)', color: 'var(--text-3)', label: '储备' };
  }

  function buildCategoryStatsModel(currentExam, currentQuestions, categoryMap) {
    currentExam = currentExam || {};
    categoryMap = categoryMap || {};
    if (currentExam.mode !== 'exam' && currentExam.mode !== 'prep') return { hidden: true, items: [] };
    var counts = {};
    var order = [];
    asArray(currentQuestions).forEach(function(q) {
      if (!q) return;
      var category = q.category || 'other';
      if (!counts[category]) order.push(category);
      counts[category] = (counts[category] || 0) + 1;
    });
    return {
      hidden: false,
      label: '考点分布',
      items: order.map(function(category) {
        var label = categoryMap[category] || category;
        var count = counts[category];
        return {
          category: category,
          label: label,
          count: count,
          text: label + ' ×' + count,
          style: CATEGORY_STAT_COLORS[category] || FALLBACK_COLOR
        };
      })
    };
  }

  function buildSearchIndex(knowledgeData, patternData) {
    var index = [];
    knowledgeData = knowledgeData || {};
    Object.keys(knowledgeData).forEach(function(key) {
      var item = knowledgeData[key] || {};
      var text = normalizeSpaces(item.title + ' ' + item.desc + ' ' + stripHtml(item.overview));
      index.push({
        cat: item.title || key,
        catKey: key,
        subKey: '',
        subTitle: '',
        text: text,
        searchText: text.toLowerCase(),
        isPattern: false
      });
      if (item.sub) {
        Object.keys(item.sub).forEach(function(subKey) {
          var sub = item.sub[subKey] || {};
          var subText = normalizeSpaces(item.title + ' ' + item.desc + ' ' + sub.title + ' ' + sub.desc + ' ' + stripHtml(sub.content));
          index.push({
            cat: item.title || key,
            catKey: key,
            subKey: subKey,
            subTitle: sub.title || subKey,
            text: subText,
            searchText: subText.toLowerCase(),
            isPattern: false
          });
        });
      }
    });

    patternData = patternData || {};
    Object.keys(patternData).forEach(function(key) {
      var pattern = patternData[key] || {};
      var text = normalizeSpaces(pattern.title + ' ' + pattern.desc + ' ' + stripHtml(pattern.content));
      index.push({
        cat: pattern.title || key,
        catKey: key,
        subKey: '',
        subTitle: '',
        text: text,
        searchText: text.toLowerCase(),
        isPattern: true
      });
    });
    return index;
  }

  function buildSnippetParts(text, matchIndex, queryLength) {
    var start = Math.max(0, matchIndex - 15);
    var end = Math.min(text.length, matchIndex + queryLength + 30);
    var parts = [];
    if (start > 0) parts.push({ text: '...', match: false });
    if (start < matchIndex) parts.push({ text: text.substring(start, matchIndex), match: false });
    parts.push({ text: text.substring(matchIndex, matchIndex + queryLength), match: true });
    if (matchIndex + queryLength < end) parts.push({ text: text.substring(matchIndex + queryLength, end), match: false });
    if (end < text.length) parts.push({ text: '...', match: false });
    return parts;
  }

  function searchKnowledgeIndex(index, query, options) {
    options = options || {};
    var limit = Number(options.limit || 20) || 20;
    var q = String(query || '').trim().toLowerCase();
    if (!q) return { query: q, results: [], overflowCount: 0 };
    var matches = [];
    asArray(index).forEach(function(item) {
      var searchText = String(item.searchText || '');
      var idx = searchText.indexOf(q);
      if (idx === -1) return;
      matches.push({
        cat: item.cat,
        catKey: item.catKey,
        subKey: item.subKey,
        subTitle: item.subTitle,
        isPattern: !!item.isPattern,
        snippetParts: buildSnippetParts(String(item.text || ''), idx, q.length)
      });
    });
    return {
      query: q,
      results: matches.slice(0, limit),
      total: matches.length,
      overflowCount: Math.max(0, matches.length - limit)
    };
  }

  function buildSearchResultLabel(result) {
    result = result || {};
    return String(result.cat || '') + (result.subTitle ? ' › ' + result.subTitle : '');
  }

  function buildKnowledgeSearchPanelModel(index, query, options) {
    var rawQuery = String(query || '');
    var active = rawQuery.trim().length > 0;
    var chrome = {
      categoryNavVisible: !active,
      patternNavVisible: !active,
      dividerVisible: !active,
      patternTitleVisible: !active
    };
    if (!active) {
      return Object.assign({
        active: false,
        query: '',
        total: 0,
        overflowCount: 0,
        results: [],
        empty: false,
        emptyText: '',
        overflowText: ''
      }, chrome);
    }
    var search = searchKnowledgeIndex(index, rawQuery, options);
    var results = asArray(search.results).map(function(result) {
      return Object.assign({}, result, {
        label: buildSearchResultLabel(result),
        action: {
          catKey: result.catKey || '',
          subKey: result.subKey || '',
          isPattern: !!result.isPattern
        }
      });
    });
    return Object.assign({
      active: true,
      query: search.query,
      total: search.total || results.length,
      overflowCount: search.overflowCount || 0,
      results: results,
      empty: results.length === 0,
      emptyText: '无匹配结果',
      overflowText: search.overflowCount > 0
        ? '还有 ' + search.overflowCount + ' 条结果，请缩小搜索范围'
        : ''
    }, chrome);
  }

  function buildKnowledgeSearchResetModel() {
    return {
      inputValue: '',
      resultsContent: '',
      categoryNavVisible: true,
      patternNavVisible: true,
      dividerVisible: true,
      patternTitleVisible: true
    };
  }

  function buildKnowledgeSubsectionFocusPlan(subKey) {
    var normalizedSubKey = String(subKey || '');
    var active = !!normalizedSubKey;
    return {
      active: active,
      subKey: normalizedSubKey,
      elementId: active ? 'sub-' + normalizedSubKey : '',
      collapsedClass: 'collapsed',
      highlightClass: 'subsection-highlight',
      shouldExpand: active,
      shouldScroll: active,
      delayMs: active ? 100 : 0,
      highlightMs: active ? 1600 : 0,
      scrollOptions: {
        behavior: 'smooth',
        block: 'start'
      }
    };
  }

  function buildKnowledgeSubsectionTogglePlan(subKey, isCollapsed) {
    var normalizedSubKey = String(subKey || '');
    var active = !!normalizedSubKey;
    return {
      active: active,
      subKey: normalizedSubKey,
      elementId: active ? 'sub-' + normalizedSubKey : '',
      collapsedClass: 'collapsed',
      nextCollapsed: active ? !isCollapsed : false
    };
  }

  function buildKnowledgeNavigationPlan(catKey, subKey, isPattern) {
    return {
      shouldClearSearch: true,
      searchReset: buildKnowledgeSearchResetModel(),
      selectAction: {
        fn: 'selectKnowledgeCategory',
        catKey: String(catKey || ''),
        isPattern: !!isPattern
      },
      subsection: buildKnowledgeSubsectionFocusPlan(subKey)
    };
  }

  function buildGlobalGraphSearchResetModel() {
    return {
      inputValue: '',
      resultsContent: '',
      showResults: false,
      visibleClass: 'show'
    };
  }

  function buildFineCategoryLegendModel() {
    return {
      labelText: '颜色说明：',
      items: [
        { text: '高频 ≥10 题', style: getFrequencyStyle(10) },
        { text: '中频 3-9 题', style: getFrequencyStyle(3) },
        { text: '低频 1-2 题', style: getFrequencyStyle(1) },
        { text: '储备 0 题', style: getFrequencyStyle(0) }
      ],
      noteText: '「储备」tag 暂无真题，等老师上传更多卷子自然激活。'
    };
  }

  var POINTS_LEAF_CAT_ORDER = ['predicate','nonpredicate','word','number','article','pronoun','preposition','logic','attrib','nounclause','advclause'];

  // 决策地图叶子拍平成"考点清单"：按大类分组，每叶子带计数(points/fine 同图口径)+面包屑+点击动作。
  function buildPointsLeafListModel(decisionNodes, fineTags, bankQuestions, errorQuestions, categoryMap) {
    categoryMap = categoryMap || {};
    var tree = buildDecisionTree(decisionNodes);
    var byId = tree.byId, childrenOf = tree.childrenOf;
    var groupsMap = {};
    Object.keys(byId).forEach(function(id) {
      if ((childrenOf[id] || []).length !== 0) return;
      var n = byId[id] || {};
      if (!n.cat) return;
      var counts = n.point
        ? countByPoint(n.point.tag, n.point.keys, bankQuestions, errorQuestions)
        : (n.fine ? countByFineTag(n.fine, bankQuestions, errorQuestions) : { bank: 0, error: 0, real: 0, total: 0 });
      var leaf = {
        id: id,
        title: n.title || id,
        breadcrumb: buildPointBreadcrumb(tree, id, categoryMap),
        counts: counts,
        badge: formatCountBadge(counts),
        frequencyStyle: getFrequencyStyle(counts.total),
        clickable: counts.total > 0,
        action: n.point
          ? { kind: 'point', tag: n.point.tag, keys: asArray(n.point.keys) }
          : { kind: 'fine', fine: n.fine || '' }
      };
      (groupsMap[n.cat] = groupsMap[n.cat] || []).push(leaf);
    });
    var groups = POINTS_LEAF_CAT_ORDER
      .filter(function(cat) { return groupsMap[cat] && groupsMap[cat].length; })
      .map(function(cat) {
        var leaves = groupsMap[cat];
        var total = leaves.reduce(function(s, l) { return s + (l.counts.total || 0); }, 0);
        return { id: cat, titleText: categoryMap[cat] || cat, leaves: leaves, total: total, leafCount: leaves.length, frequencyStyle: getFrequencyStyle(total) };
      });
    return {
      empty: groups.length === 0,
      emptyText: '决策地图数据未加载。',
      header: {
        titleText: '🏷️ 考点视图 · 点任一考点直接进同类训练',
        descriptionText: '决策地图叶子拍平成考点清单。颜色 = 当前题库题量频次；灰色 = 暂无真题（传新卷自然激活）。'
      },
      legend: buildFineCategoryLegendModel(),
      groups: groups
    };
  }

  function buildTextbookUnitModel(unit, fineTags, bankQuestions, errorQuestions) {
    fineTags = fineTags || {};
    unit = unit || {};
    var mapsTo = asArray(unit.maps_to);
    var tagIds = mapsTo.map(normalizeTagId).filter(function(id) {
      return !!((fineTags.tags_by_id || {})[id]);
    });
    var tags = tagIds.map(function(id) {
      var tag = fineTags.tags_by_id[id] || {};
      var counts = countByFineTag(id, bankQuestions, errorQuestions);
      return {
        id: id,
        name: tag.name || id,
        counts: counts
      };
    });
    var totalQuestions = tags.reduce(function(sum, tag) { return sum + tag.counts.total; }, 0);
    var errorCount = asArray(errorQuestions).filter(function(q) {
      return q && tagIds.indexOf(q.fine_category) !== -1;
    }).length;
    return {
      book: unit.book || '',
      unit: unit.unit || '',
      topic: unit.topic || '',
      grammar_zh: unit.grammar_zh || '',
      grammar_en: unit.grammar_en || '',
      mapsTo: mapsTo,
      tagIds: tagIds,
      tags: tags,
      totalQuestions: totalQuestions,
      errorCount: errorCount,
      frequencyStyle: getFrequencyStyle(totalQuestions),
      unitLabel: (unit.unit || '') + (unit.topic ? ' · ' + unit.topic : '')
    };
  }

  function groupTextbookUnitsByBook(textbookUnits) {
    var byBook = {};
    asArray(textbookUnits).forEach(function(unit) {
      var book = (unit && unit.book) || '';
      if (!book) return;
      (byBook[book] = byBook[book] || []).push(unit);
    });
    return byBook;
  }

  function buildTextbookModeToggleModel(mode) {
    var activeMode = mode === 'list' ? 'list' : 'gallery';
    return {
      activeMode: activeMode,
      options: [
        { mode: 'gallery', label: '🎨 画廊', active: activeMode === 'gallery' },
        { mode: 'list', label: '📋 列表', active: activeMode === 'list' }
      ]
    };
  }

  function buildTextbookModalModel(bookModel) {
    bookModel = bookModel || {};
    return {
      book: bookModel.book || '',
      cover: bookModel.cover || '',
      titleText: '人教版 · 英语 · ' + (bookModel.book || ''),
      subtitleText: (Number(bookModel.unitCount || 0) || 0) + ' 个 Grammar 单元 · '
        + (Number(bookModel.totalQuestions || 0) || 0) + ' 道关联真题'
    };
  }

  function buildTextbookModalViewModel(bookModel) {
    var modal = buildTextbookModalModel(bookModel);
    return Object.assign({}, modal, {
      closeLabel: '×',
      closeTitle: '关闭 (Esc)'
    });
  }

  function buildTextbookModalOpenPlan(book, mode, booksById) {
    book = String(book || '');
    var activeMode = mode === 'list' ? 'list' : 'gallery';
    if (activeMode === 'list') {
      return {
        action: 'scroll-to-book',
        book: book,
        elementId: 'book-' + book,
        scrollOptions: { behavior: 'smooth', block: 'start' },
        shouldRenderModal: false
      };
    }
    var bookModel = booksById && booksById[book] ? booksById[book] : {
      book: book,
      cover: '',
      units: [],
      unitCount: 0,
      totalQuestions: 0
    };
    return {
      action: 'open-modal',
      book: book,
      bookModel: bookModel,
      modalModel: buildTextbookModalViewModel(bookModel),
      shouldRenderModal: true,
      shouldBindEsc: true
    };
  }

  function buildTextbookModel(fineTags, bankQuestions, errorQuestions) {
    fineTags = fineTags || {};
    var rawByBook = groupTextbookUnitsByBook(fineTags.textbook_units || []);
    var books = BOOK_ORDER.map(function(book, idx) {
      var units = asArray(rawByBook[book]).map(function(unit) {
        var unitModel = buildTextbookUnitModel(unit, fineTags, bankQuestions, errorQuestions);
        return Object.assign({}, unitModel, {
          titleText: unitModel.unit + (unitModel.topic ? ' · ' + unitModel.topic : ''),
          questionActionText: '📋 看 ' + unitModel.totalQuestions + ' 道真题',
          errorActionText: '📝 错题 ' + unitModel.errorCount + ' 道',
          showQuestionAction: unitModel.tagIds.length > 0,
          showErrorAction: unitModel.errorCount > 0
        });
      });
      var totalQuestions = units.reduce(function(sum, unit) { return sum + unit.totalQuestions; }, 0);
      var bookModel = {
        book: book,
        cover: COVER_MAP[book],
        units: units,
        unitCount: units.length,
        totalQuestions: totalQuestions,
        labelText: book,
        metaText: units.length + ' 单元 · ' + totalQuestions + ' 题',
        animationDelayMs: idx * 60
      };
      var modal = buildTextbookModalModel(bookModel);
      return {
        book: bookModel.book,
        cover: bookModel.cover,
        units: bookModel.units,
        unitCount: bookModel.unitCount,
        totalQuestions: bookModel.totalQuestions,
        labelText: bookModel.labelText,
        metaText: bookModel.metaText,
        modalTitleText: modal.titleText,
        modalSubtitleText: modal.subtitleText,
        animationDelayMs: bookModel.animationDelayMs
      };
    });
    var booksById = {};
    books.forEach(function(book) { booksById[book.book] = book; });
    return {
      bookOrder: BOOK_ORDER.slice(),
      coverMap: Object.assign({}, COVER_MAP),
      books: books,
      booksById: booksById
    };
  }

  function buildTextbookViewModel(fineTags, bankQuestions, errorQuestions, mode) {
    fineTags = fineTags || {};
    var model = buildTextbookModel(fineTags, bankQuestions, errorQuestions);
    var toggle = buildTextbookModeToggleModel(mode);
    return {
      empty: !asArray(fineTags.textbook_units).length,
      emptyText: '教材数据未加载。',
      activeMode: toggle.activeMode,
      showList: toggle.activeMode === 'list',
      toggle: toggle,
      books: model.books,
      booksById: model.booksById,
      coverMap: model.coverMap,
      bookOrder: model.bookOrder
    };
  }

  function isMockQuestion(q) {
    q = q || {};
    return q.type === '模拟卷' || q.type === '模拟题';
  }

  function isRealQuestion(q) {
    return (q || {}).type === '真题';
  }

  function getUnitQuestionSourceText(q) {
    q = q || {};
    if (q.exam === '错题本' || (q.id && String(q.id).indexOf('err_') === 0)) return '📝 我的错题';
    return q.exam || q.exam_id || '';
  }

  function getUnitQuestionTypeTag(q) {
    q = q || {};
    if (isRealQuestion(q)) {
      return {
        visible: true,
        label: '真题',
        style: { bg: 'var(--green-bg)', color: 'var(--green)' }
      };
    }
    if (isMockQuestion(q)) {
      return {
        visible: true,
        label: '模拟',
        style: { bg: 'var(--orange-bg)', color: 'var(--orange)' }
      };
    }
    return { visible: false, label: '', style: {} };
  }

  function buildUnitFilterChips(source, filter, counts) {
    if (source !== 'bank') return [];
    counts = counts || {};
    return [
      { key: '真题', label: '真题', count: Number(counts.real || 0) || 0, active: filter === '真题' },
      { key: '模拟', label: '模拟', count: Number(counts.mock || 0) || 0, active: filter === '模拟' },
      { key: 'all', label: '全部', count: Number(counts.all || 0) || 0, active: filter === 'all' }
    ].map(function(chip) {
      return Object.assign({}, chip, {
        text: chip.label + ' ' + chip.count
      });
    });
  }

  function buildUnitQuestionItemModel(q, source) {
    q = q || {};
    var analysis = String(q.analysis || '');
    return {
      source: source || 'bank',
      examId: q.exam_id || q.exam || '',
      no: String(q.no || ''),
      noText: '第 ' + (q.no || '') + ' 题',
      sourceText: getUnitQuestionSourceText(q),
      typeTag: getUnitQuestionTypeTag(q),
      answerText: q.answer || '',
      analysisPreview: analysis ? analysis.slice(0, 100) : '',
      analysisTruncated: analysis.length > 100,
      lectureActionText: '▶ 讲题',
      projectionActionText: '📺 投影讲'
    };
  }

  function buildUnitQuestionListModel(context, bankQuestions, errorQuestions, options) {
    context = context || {};
    options = options || {};
    var source = context.source || 'bank';
    var tagIds = asArray(context.tagIds);
    var rawItems = source === 'errors'
      ? asArray(errorQuestions).filter(function(q) { return q && tagIds.indexOf(q.fine_category) !== -1; })
      : asArray(bankQuestions).filter(function(q) { return q && tagIds.indexOf(q.fine_category) !== -1; });

    var filter = context.filter || (source === 'errors' ? 'all' : '真题');
    var items;
    if (filter === '真题') items = rawItems.filter(function(q) { return q.type === '真题'; });
    else if (filter === '模拟') items = rawItems.filter(function(q) { return q.type === '模拟卷' || q.type === '模拟题'; });
    else items = rawItems.slice();

    var limit = Number(options.limit || 50) || 50;
    var visibleItems = items.slice(0, limit);
    var counts = {
      real: rawItems.filter(isRealQuestion).length,
      mock: rawItems.filter(isMockQuestion).length,
      all: rawItems.length
    };
    var hiddenCount = Math.max(0, items.length - limit);
    return {
      source: source,
      filter: filter,
      title: (source === 'errors' ? '📝 ' : '📋 ') + (context.unitLabel || '') + (source === 'errors' ? ' · 我的错题' : ' · 关联真题'),
      countText: items.length + ' 道',
      counts: counts,
      showFilterChips: source === 'bank',
      filterChips: buildUnitFilterChips(source, filter, counts),
      items: items,
      visibleItems: visibleItems,
      visibleItemModels: visibleItems.map(function(q) { return buildUnitQuestionItemModel(q, source); }),
      hiddenCount: hiddenCount,
      hiddenText: hiddenCount > 0 ? '仅显示前 ' + limit + ' 道（共 ' + items.length + ' 道）' : '',
      emptyText: source === 'errors'
        ? '该单元对应考点你还没有错题。'
        : '该单元对应考点暂无真题。',
      emptyHelpText: source === 'errors' ? '上传 Word 时勾选错题可加入。' : ''
    };
  }

  function buildUnitQuestionModalViewModel(context, bankQuestions, errorQuestions, options) {
    var list = buildUnitQuestionListModel(context, bankQuestions, errorQuestions, options);
    var itemCards = asArray(list.visibleItemModels).map(function(item) {
      item = item || {};
      return Object.assign({}, item, {
        typeTagVisible: !!(item.typeTag && item.typeTag.visible),
        actions: [
          {
            kind: 'lecture',
            labelText: item.lectureActionText || '▶ 讲题',
            examId: item.examId || '',
            no: item.no || '',
            source: list.source,
            autoProjection: false
          },
          {
            kind: 'projection',
            labelText: item.projectionActionText || '📺 投影讲',
            examId: item.examId || '',
            no: item.no || '',
            source: list.source,
            autoProjection: true
          }
        ]
      });
    });
    return Object.assign({}, list, {
      closeLabel: '×',
      closeTitle: '关闭',
      header: {
        titleText: list.title || '',
        countText: list.countText || ''
      },
      filterVisible: !!list.showFilterChips,
      empty: itemCards.length === 0,
      showEmptyHelp: !!list.emptyHelpText,
      itemCards: itemCards,
      hasHiddenItems: !!list.hiddenText
    });
  }

  function normalizeUnitQuestionNavigationSource(source) {
    return source === 'errors' ? 'errors' : 'bank';
  }

  function normalizeUnitQuestionNavigationFilter(filter, source) {
    source = normalizeUnitQuestionNavigationSource(source);
    if (source === 'errors') return 'all';
    if (filter === '模拟' || filter === 'all') return filter;
    return '真题';
  }

  function normalizeUnitQuestionReturnContext(context) {
    if (!context || typeof context !== 'object') return null;
    var source = normalizeUnitQuestionNavigationSource(context.source);
    return {
      unitLabel: context.unitLabel || '',
      tagIds: asArray(context.tagIds).slice(),
      source: source,
      filter: normalizeUnitQuestionNavigationFilter(context.filter, source)
    };
  }

  function buildUnitQuestionListOpenPlan(unitLabel, tagIds, source) {
    source = normalizeUnitQuestionNavigationSource(source);
    return {
      action: 'open-unit-question-list',
      source: source,
      shouldShowModal: true,
      context: normalizeUnitQuestionReturnContext({
        unitLabel: unitLabel,
        tagIds: tagIds,
        source: source,
        filter: source === 'errors' ? 'all' : '真题'
      })
    };
  }

  function buildUnitQuestionFilterChangePlan(context, filter, options) {
    options = options || {};
    var reopenDelayMs = Number(options.reopenDelayMs || 220) || 220;
    var currentContext = normalizeUnitQuestionReturnContext(context);
    if (!currentContext) {
      return {
        action: 'none',
        context: null,
        shouldCloseModal: false,
        shouldShowModal: false,
        reopenDelayMs: reopenDelayMs
      };
    }
    var nextContext = normalizeUnitQuestionReturnContext(Object.assign({}, currentContext, {
      filter: filter
    }));
    return {
      action: 'change-unit-question-filter',
      context: nextContext,
      shouldCloseModal: true,
      shouldShowModal: true,
      reopenDelayMs: reopenDelayMs
    };
  }

  function buildUnitQuestionNavigationPlan(action, context) {
    action = action || {};
    var source = normalizeUnitQuestionNavigationSource(action.source);
    var autoProjection = !!action.autoProjection;
    var returnContext = normalizeUnitQuestionReturnContext(context);
    return {
      action: 'unit-question-navigation',
      source: source,
      examId: action.examId == null ? '' : String(action.examId),
      no: action.no == null ? '' : String(action.no),
      autoProjection: autoProjection,
      isErrorSource: source === 'errors',
      previousViewSource: source === 'errors' ? 'error' : 'exam',
      fallbackPage: source === 'errors' ? 'error-book' : '',
      practicePage: 'practice',
      shouldRequestTeachingFullscreen: true,
      shouldCloseUnitModal: true,
      shouldCloseTextbookModal: true,
      shouldKeepTeachingOnPageSwitch: true,
      delayMs: Number(action.delayMs || 250) || 250,
      teachingOptions: {
        tab: 'guide',
        source: 'knowledge',
        showAnswer: autoProjection
      },
      returnContext: returnContext ? {
        type: 'unit-question-list',
        label: '返回「' + (returnContext.unitLabel || '') + '」',
        context: returnContext,
        tab: 'guide',
        showAnswer: autoProjection
      } : null,
      shouldPushReturnContext: !!returnContext,
      shouldRenderTeachingDock: !!returnContext
    };
  }

  function getTextbookUnitLabel(unit) {
    unit = unit || {};
    return (unit.unit || '') + (unit.topic ? ' · ' + unit.topic : '');
  }

  function buildUnitQuestionDrawerReturnPlan(returnInfo, textbookUnits, options) {
    returnInfo = returnInfo || {};
    options = options || {};
    var context = normalizeUnitQuestionReturnContext(returnInfo.context);
    var isUnitReturn = returnInfo.type === 'unit-question-list' && !!context;
    var matchUnit = null;
    if (isUnitReturn) {
      matchUnit = asArray(textbookUnits).find(function(unit) {
        return getTextbookUnitLabel(unit) === context.unitLabel;
      }) || null;
    }
    return {
      action: isUnitReturn ? 'unit-question-list' : 'none',
      shouldCloseDrawer: true,
      shouldSwitchPage: isUnitReturn,
      page: isUnitReturn ? 'knowledge' : '',
      knowledgeView: isUnitReturn ? 'textbook' : '',
      unitLabel: context ? context.unitLabel : '',
      unitContext: context,
      matchUnit: matchUnit,
      book: matchUnit ? (matchUnit.book || '') : '',
      shouldOpenTextbookModal: !!matchUnit,
      shouldRestoreUnitContext: !!matchUnit,
      shouldShowUnitModal: !!matchUnit,
      actionDelayMs: Number(options.actionDelayMs || 180) || 180,
      textbookModalDelayMs: Number(options.textbookModalDelayMs || 350) || 350,
      maskFadeOutDelayMs: Number(options.maskFadeOutDelayMs || 100) || 100,
      maskRemoveMs: Number(options.maskRemoveMs || 200) || 200
    };
  }

  function getKnowledgeRootColorStyle(root) {
    root = root || {};
    var map = {
      blue: '#0071e3',
      green: '#34c759',
      purple: '#af52de',
      orange: '#ff9500',
      red: '#ff3b30'
    };
    return map[root.color] || 'var(--accent)';
  }

  function getKnowledgeCategoryLabel(category, deps, preferKnowledgeTitle) {
    deps = deps || {};
    var categoryMap = deps.categoryMap || {};
    var knowledgeData = deps.knowledgeData || {};
    if (preferKnowledgeTitle) {
      return (knowledgeData[category] && knowledgeData[category].title) || categoryMap[category] || category;
    }
    return categoryMap[category] || (knowledgeData[category] && knowledgeData[category].title) || category;
  }

  function getKnowledgeNodeCategoryLabels(node, deps) {
    node = node || {};
    return asArray(node.category_refs).map(function(category) {
      return getKnowledgeCategoryLabel(category, deps, false);
    });
  }

  function buildKnowledgeMapNodeCardModel(node, deps) {
    node = node || {};
    return {
      id: node.id || '',
      titleText: node.title || node.id || '',
      descText: node.desc || '',
      tagTexts: getKnowledgeNodeCategoryLabels(node, deps).slice(0, 3),
      action: {
        fn: 'showKnowledgeNode',
        nodeId: node.id || ''
      }
    };
  }

  function buildKnowledgeMapPathModel(path, nodes) {
    path = path || {};
    nodes = nodes || {};
    return {
      titleText: path.title || '',
      descText: path.desc || '',
      nodeButtons: asArray(path.nodes).slice(0, 5).map(function(nodeId) {
        var node = nodes[nodeId];
        if (!node) return null;
        return {
          nodeId: nodeId,
          labelText: node.title || nodeId,
          action: {
            fn: 'showKnowledgeNode',
            nodeId: nodeId
          }
        };
      }).filter(function(item) { return !!item; })
    };
  }

  function buildKnowledgeMapModel(knowledgeCore, deps) {
    knowledgeCore = knowledgeCore || {};
    deps = deps || {};
    var nodes = knowledgeCore.nodes || {};
    var roots = asArray(knowledgeCore.roots);
    return {
      empty: roots.length === 0,
      emptyText: '知识地图整理中。当前可以切换到“书本速查”。',
      hero: {
        titleText: knowledgeCore.title || '高中英语语法知识地图',
        descText: knowledgeCore.desc || '',
        principles: asArray(knowledgeCore.design_principles).slice(0, 4).map(function(text, idx) {
          return {
            no: idx + 1,
            text: text || ''
          };
        })
      },
      pathPanelTitleText: '推荐学习路径',
      learningPaths: asArray(knowledgeCore.learning_paths).map(function(path) {
        return buildKnowledgeMapPathModel(path, nodes);
      }),
      roots: roots.map(function(root) {
        root = root || {};
        return {
          titleText: root.title || '',
          subtitleText: root.subtitle || '',
          color: getKnowledgeRootColorStyle(root),
          children: asArray(root.children).map(function(nodeId) {
            var node = nodes[nodeId];
            if (!node) return null;
            return buildKnowledgeMapNodeCardModel(Object.assign({}, node, { id: nodeId }), deps);
          }).filter(function(item) { return !!item; })
        };
      })
    };
  }

  function buildKnowledgeNodeDetailModel(node, deps) {
    node = node || {};
    deps = deps || {};
    return {
      titleText: node.title || node.id || '',
      layerText: node.layer || '知识节点',
      descText: node.desc || '',
      studentGoalText: node.student_goal || '',
      teacherUseText: node.teacher_use || '',
      categoryButtons: asArray(node.category_refs).map(function(category) {
        return {
          category: category,
          labelText: '打开书本：' + getKnowledgeCategoryLabel(category, deps, true),
          action: {
            fn: 'selectKnowledgeCategory',
            category: category,
            isPattern: false
          }
        };
      })
    };
  }

  function buildGlobalGraphPageModel(graph, focusPresets, graphState) {
    graph = graph || {};
    graphState = graphState || {};
    return {
      empty: !asArray(graph.nodes).length,
      emptyText: '全局图谱整理中。当前可以切换到“知识地图”或“书本速查”。',
      titleText: graph.title || '语法填空讲题路径图谱',
      descText: graph.desc || '把知识可视化成一张可拖动的大图谱。',
      actionButtons: [
        { labelText: '教材进度', view: 'textbook' },
        { labelText: '考点视图', view: 'fine-cat' },
        { labelText: '书本速查', view: 'book' }
      ],
      searchPlaceholderText: '搜索考点、判断规则、易错点…',
      focusButtons: asArray(focusPresets).map(function(preset) {
        preset = preset || {};
        return {
          id: preset.id || '',
          labelText: preset.label || preset.id || '',
          active: graphState.focusMode === preset.id
        };
      }),
      controlButtons: [
        { labelText: '放大', action: 'zoom', factor: 1.18 },
        { labelText: '缩小', action: 'zoom', factor: 0.84 },
        { labelText: '重置', action: 'reset' }
      ]
    };
  }

  function buildGlobalGraphInspectorModel(node, deps) {
    deps = deps || {};
    if (!node) {
      return {
        empty: true,
        emptyText: '点击图谱中的任一节点，查看判断方法、下一级知识和书本速查。'
      };
    }
    var nodes = deps.nodes || {};
    var labels = deps.getGraphNodeLabelGroups
      ? deps.getGraphNodeLabelGroups(node, deps)
      : { categories: [], fineTags: [], traps: [], all: [] };
    var path = deps.getGraphNodePath ? deps.getGraphNodePath(node, nodes) : [];
    var typeLabel = deps.getGraphNodeTypeLabel
      ? deps.getGraphNodeTypeLabel(node.type)
      : '图谱节点';
    var decisionText = node.decision_tip || node.teacher_move || '';
    var trapLabels = asArray(labels.traps);
    return {
      empty: false,
      typeLabel: typeLabel,
      titleText: node.title || node.id || '',
      descText: node.desc || node.subtitle || '这是语法填空知识框架中的一个定位节点。',
      pathTexts: path.length > 1 ? path.slice(-5) : [],
      decisionSection: {
        visible: !!decisionText,
        titleText: '这个知识点怎么判断',
        bodyText: decisionText
      },
      nextStepsSection: {
        visible: asArray(node.next_steps).length > 0,
        titleText: '下一级看什么',
        chips: asArray(node.next_steps)
      },
      commonWrongSection: {
        visible: !!node.common_wrong || trapLabels.length > 0,
        titleText: '常错混淆',
        bodyText: node.common_wrong || '',
        chips: node.common_wrong ? [] : trapLabels.slice(0, 8)
      },
      tagSection: {
        visible: asArray(labels.all).length > 0,
        titleText: '关联标签',
        chips: asArray(labels.all).slice(0, 18)
      },
      resourceSection: {
        titleText: '书本速查',
        categoryButtons: asArray(node.category_refs).map(function(category) {
          return {
            category: category,
            labelText: '书本：' + getKnowledgeCategoryLabel(category, deps, true),
            action: {
              fn: 'selectKnowledgeCategory',
              category: category,
              isPattern: false
            }
          };
        }),
        viewButtons: [
          { labelText: '考点视图', view: 'fine-cat' },
          { labelText: '教材视图', view: 'textbook' }
        ]
      }
    };
  }

  function buildGlobalGraphSearchModel(query, nodes, deps, options) {
    deps = deps || {};
    options = options || {};
    var q = String(query || '').trim().toLowerCase();
    if (!q) {
      return {
        active: false,
        query: '',
        results: [],
        empty: false,
        emptyText: ''
      };
    }
    var limit = Number(options.limit || 12) || 12;
    var rawResults = deps.searchGraphNodes ? deps.searchGraphNodes(q, nodes, deps, limit) : [];
    return {
      active: true,
      query: q,
      results: asArray(rawResults).map(function(node) {
        node = node || {};
        var typeLabel = deps.getGraphNodeTypeLabel
          ? deps.getGraphNodeTypeLabel(node.type)
          : '图谱节点';
        return {
          id: node.id || '',
          titleText: node.title || node.id || '',
          subtitleText: typeLabel + ' · ' + (node.subtitle || node.layer || '')
        };
      }),
      empty: rawResults.length === 0,
      emptyText: '无匹配节点'
    };
  }

  function getSvgGraphNodeSize(node, deps) {
    if (deps && deps.getGraphNodeSize) return deps.getGraphNodeSize(node);
    return { w: 250, h: 110 };
  }

  function buildGlobalGraphSvgModel(graph, nodes, graphState, deps) {
    graph = graph || {};
    nodes = nodes || {};
    graphState = graphState || {};
    deps = deps || {};
    var focusIds = asArray(graphState.focusIds);
    var scale = typeof graphState.scale === 'number' ? graphState.scale : 1;
    var tx = typeof graphState.tx === 'number' ? graphState.tx : 0;
    var ty = typeof graphState.ty === 'number' ? graphState.ty : 0;

    var clusters = asArray(graph.clusters).map(function(cluster) {
      cluster = cluster || {};
      return {
        id: cluster.id || '',
        titleText: cluster.title || cluster.id || '',
        x: Number(cluster.x || 0) || 0,
        y: Number(cluster.y || 0) || 0,
        w: Number(cluster.w || 0) || 0,
        h: Number(cluster.h || 0) || 0,
        color: cluster.color || '#409cff'
      };
    });

    var edges = asArray(graph.edges).map(function(edge) {
      edge = edge || {};
      var from = nodes[edge.from];
      var to = nodes[edge.to];
      if (!from || !to) return null;
      var fs = getSvgGraphNodeSize(from, deps);
      var ts = getSvgGraphNodeSize(to, deps);
      var x1 = from.x + fs.w;
      var y1 = from.y + fs.h / 2;
      var x2 = to.x;
      var y2 = to.y + ts.h / 2;
      var d;
      if (x2 >= x1) {
        var mid = Math.max(70, Math.min(190, (x2 - x1) * 0.45));
        d = 'M ' + x1 + ' ' + y1 + ' C ' + (x1 + mid) + ' ' + y1 + ', ' + (x2 - mid) + ' ' + y2 + ', ' + x2 + ' ' + y2;
      } else {
        var down = edge.type === 'trap' ? 70 : 52;
        d = 'M ' + x1 + ' ' + y1 + ' C ' + (x1 + 90) + ' ' + (y1 + down) + ', ' + (x2 - 90) + ' ' + (y2 - down) + ', ' + x2 + ' ' + y2;
      }
      var active = deps.graphEdgeActive
        ? deps.graphEdgeActive(edge, focusIds)
        : (focusIds.indexOf(edge.from) !== -1 && focusIds.indexOf(edge.to) !== -1);
      return {
        from: edge.from || '',
        to: edge.to || '',
        labelText: edge.label || '',
        path: d,
        labelX: (x1 + x2) / 2,
        labelY: (y1 + y2) / 2 - 6,
        active: active,
        dim: focusIds.length > 0 && !active
      };
    }).filter(function(item) { return !!item; });

    var nodeModels = asArray(graph.nodes).map(function(rawNode) {
      rawNode = rawNode || {};
      var node = nodes[rawNode.id] || rawNode;
      var size = getSvgGraphNodeSize(node, deps);
      var typeLabel = deps.getGraphNodeTypeLabel
        ? deps.getGraphNodeTypeLabel(node.type)
        : '图谱节点';
      var color = deps.getGraphTypeColor
        ? deps.getGraphTypeColor(node.type)
        : '#409cff';
      var titleLines = deps.renderGraphTextLines
        ? deps.renderGraphTextLines(node.title || node.id, 10, 2)
        : [node.title || node.id || ''];
      var hasFocus = deps.graphHasFocus
        ? deps.graphHasFocus(node.id, focusIds)
        : (!focusIds.length || focusIds.indexOf(node.id) !== -1);
      return {
        id: node.id || rawNode.id || '',
        type: node.type || '',
        x: Number(node.x || 0) || 0,
        y: Number(node.y || 0) || 0,
        size: size,
        color: color,
        active: node.id === graphState.selectedId,
        dim: focusIds.length > 0 && !hasFocus,
        typeLabel: typeLabel,
        titleLines: titleLines,
        subtitleText: (node.subtitle || node.layer || typeLabel || '').slice(0, 18)
      };
    });

    return {
      viewBox: graph.viewBox || '0 0 2500 1880',
      ariaLabel: '语法填空知识框架图谱',
      viewportTransform: 'translate(' + tx + ' ' + ty + ') scale(' + scale + ')',
      clusters: clusters,
      edges: edges,
      nodes: nodeModels
    };
  }

  function buildKnowledgeSidebarModel(knowledgeData, patternData) {
    knowledgeData = knowledgeData || {};
    patternData = patternData || {};
    var categoryItems = Object.keys(knowledgeData).map(function(key) {
      var item = knowledgeData[key] || {};
      return {
        key: key,
        titleText: item.title || key,
        descText: item.desc || '',
        isPattern: false,
        className: 'knowledge-nav-item',
        action: {
          fn: 'selectKnowledgeCategory',
          key: key,
          isPattern: false
        }
      };
    });
    var patternItems = Object.keys(patternData).map(function(key) {
      var item = patternData[key] || {};
      return {
        key: key,
        titleText: item.title || key,
        descText: item.desc || '',
        isPattern: true,
        className: 'knowledge-nav-item pattern-item',
        action: {
          fn: 'selectKnowledgeCategory',
          key: key,
          isPattern: true
        }
      };
    });
    return {
      categoryItems: categoryItems,
      patternItems: patternItems,
      patternVisible: patternItems.length > 0,
      dividerVisible: patternItems.length > 0,
      patternTitleVisible: patternItems.length > 0
    };
  }

  function buildKnowledgeBookContentModel(key, isPattern, knowledgeData, patternData) {
    knowledgeData = knowledgeData || {};
    patternData = patternData || {};
    key = String(key || '');
    if (isPattern) {
      var pattern = patternData[key];
      if (!pattern) {
        return {
          found: false,
          isPattern: true,
          titleText: '',
          descText: '',
          bodyHtml: '',
          sections: []
        };
      }
      return {
        found: true,
        isPattern: true,
        titleText: pattern.title || key,
        descText: pattern.desc || '',
        bodyHtml: pattern.content || '',
        sections: []
      };
    }

    var item = knowledgeData[key];
    if (!item) {
      return {
        found: false,
        isPattern: false,
        titleText: '',
        descText: '',
        overviewHtml: '',
        sections: []
      };
    }
    return {
      found: true,
      isPattern: false,
      titleText: item.title || key,
      descText: item.desc || '',
      overviewHtml: item.overview || '',
      sections: Object.keys(item.sub || {}).map(function(subKey) {
        var sub = item.sub[subKey] || {};
        return {
          key: subKey,
          titleText: sub.title || subKey,
          descText: sub.desc || '',
          bodyHtml: sub.content || '',
          collapsed: true
        };
      })
    };
  }

  function buildKnowledgeViewChromeModel(view, options) {
    options = options || {};
    var routeView = view;
    if (routeView === 'map-node') routeView = 'map';
    if (routeView === 'system-node') routeView = 'system';
    if (
      routeView !== 'map'
      && routeView !== 'book'
      && routeView !== 'fine-cat'
      && routeView !== 'textbook'
      && routeView !== 'system'
    ) {
      routeView = 'book';
    }
    var buttons = [
      { view: 'map', elementId: 'knowledgeMapBtn' },
      { view: 'book', elementId: 'knowledgeBookBtn' },
      { view: 'fine-cat', elementId: 'knowledgeFineCatBtn' },
      { view: 'textbook', elementId: 'knowledgeTextbookBtn' },
      { view: 'system', elementId: 'knowledgeSystemBtn' }
    ].map(function(button) {
      return Object.assign({}, button, {
        active: button.view === routeView
      });
    });
    var knowledgeData = options.knowledgeData || {};
    var fallbackKey = Object.keys(knowledgeData)[0] || '';
    return {
      view: view || '',
      routeView: routeView,
      buttons: buttons,
      sidebarVisible: routeView === 'book',
      renderAction: routeView,
      bookKey: options.currentKey || fallbackKey,
      isPattern: !!options.currentIsPattern
    };
  }

  // ── 做题决策地图（重做版：引导 + 全貌；复用 teaching_graph 节点 + parent + decision_tip，丢弃手写 x/y）──
  function buildDecisionTree(coreNodes) {
    var list = Array.isArray(coreNodes) ? coreNodes : [];
    var byId = {}, childrenOf = {}, rootId = '';
    list.forEach(function(n) { if (n && n.id) { byId[n.id] = n; childrenOf[n.id] = []; } });
    list.forEach(function(n) {
      if (!n || !n.id) return;
      if (n.parent && byId[n.parent]) childrenOf[n.parent].push(n.id);
      else if (!rootId) rootId = n.id;
    });
    return { rootId: rootId, byId: byId, childrenOf: childrenOf };
  }

  // 叶子→「按考点 · 粗类 · 父分组(≠粗类时) · 叶子标题」。图的 dmBreadcrumb 与考点视图共用。
  function buildPointBreadcrumb(tree, nodeId, categoryMap) {
    tree = tree || { byId: {} };
    categoryMap = categoryMap || {};
    var node = (tree.byId || {})[nodeId];
    if (!node) return '';
    var catName = node.cat ? (categoryMap[node.cat] || node.cat) : '';
    var parent = (node.parent && tree.byId[node.parent]) ? tree.byId[node.parent] : null;
    var parts = [];
    if (catName) parts.push(catName);
    if (parent && parent.title && parent.title !== catName) parts.push(parent.title);
    if (node.title) parts.push(node.title);
    return '按考点' + (parts.length ? ' · ' + parts.join(' · ') : '');
  }

  // 把题的 points 解析成迁移标题面包屑（与考点训练同口径）。
  // 单 point：命中决策地图叶子 → buildPointBreadcrumb。叶子按词再分(时态)时 key 已体现在叶标题("一般现在")，
  // 叶子不按词分但 point 带 key(关系副词 where / 不定冠词 a)时，去掉叶标题里的词枚举再补「· 词」。
  // 多 point(谓语 时态+语态…)：合并共享前缀，余下叶子用「＋」连。无法解析 → ''（调用方回退粗名）。
  function buildMigrationPointTitle(decisionNodes, fineTags, categoryMap, points) {
    points = asArray(points);
    if (!points.length) return '';
    categoryMap = categoryMap || {};
    var tree = buildDecisionTree(decisionNodes);
    var byId = tree.byId, childrenOf = tree.childrenOf;
    var tagsById = (fineTags && fineTags.tags_by_id) || {};
    var leaves = Object.keys(byId)
      .filter(function(id) { return (childrenOf[id] || []).length === 0; })
      .map(function(id) { return byId[id]; });

    // point → {node, keyShown}：keyShown=叶子已按该 key 再分(无需补词)
    function resolveLeaf(point) {
      var tag = point.tag, key = point.key;
      var cands = leaves.filter(function(n) {
        return n && ((n.point && n.point.tag === tag) || n.fine === tag);
      });
      if (!cands.length) return null;
      if (key != null && key !== '') {
        var hit = cands.filter(function(n) {
          return n.point && asArray(n.point.keys).indexOf(key) !== -1;
        })[0];
        if (hit) return { node: hit, keyShown: true };
      }
      var generic = cands.filter(function(n) {
        return !n.point || !asArray(n.point.keys).length;
      })[0];
      return { node: generic || cands[0], keyShown: false };
    }

    function stripEnum(label, words) {
      label = String(label || '');
      label = label.replace(/[（(][^（()）]*[）)]\s*$/, '').replace(/\s+$/, '');
      if (words && words.length) {
        var esc = words.map(function(w) {
          return String(w).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }).join('|');
        var re = new RegExp('(?:^|\\s)(?:' + esc + ')(?:\\s*[/／、,，]\\s*(?:' + esc + '))*\\s*$', 'i');
        label = label.replace(re, '').replace(/\s+$/, '');
      }
      return label;
    }

    function titleForPoint(point) {
      var res = resolveLeaf(point);
      if (!res) return '';
      var bc = buildPointBreadcrumb(tree, res.node.id, categoryMap);
      if (point.key == null || point.key === '' || res.keyShown) return bc;
      var parts = bc.split(' · ');
      var words = (tagsById[point.tag] && tagsById[point.tag].words) || [];
      parts[parts.length - 1] = stripEnum(parts[parts.length - 1], words);
      parts.push(String(point.key));
      return parts.join(' · ');
    }

    var titles = points.map(titleForPoint).filter(Boolean);
    if (!titles.length) return '';
    if (titles.length === 1) return titles[0];
    var split = titles.map(function(t) { return t.split(' · '); });
    var prefixLen = 0;
    while (true) {
      var seg = split[0][prefixLen];
      if (seg == null) break;
      var allMatch = split.every(function(s) { return s[prefixLen] === seg; });
      if (!allMatch) break;
      prefixLen++;
    }
    var prefix = split[0].slice(0, prefixLen);
    var seen = {}, tails = [];
    split.forEach(function(s) {
      var tail = s.slice(prefixLen).join(' · ');
      if (tail && !seen[tail]) { seen[tail] = 1; tails.push(tail); }
    });
    return prefix.join(' · ') + (tails.length ? ' · ' + tails.join(' ＋ ') : '');
  }

  function searchDecisionNodes(query, byId, limit) {
    var q = String(query || '').trim().toLowerCase().replace(/\s+/g, '');
    if (!q) return [];
    limit = limit || 12;
    var out = [];
    Object.keys(byId || {}).forEach(function(id) {
      var n = byId[id] || {};
      var title = String(n.title || '').toLowerCase().replace(/\s+/g, '');
      var sub = String(n.sub || '').toLowerCase().replace(/\s+/g, '');
      if (title.indexOf(q) !== -1 || sub.indexOf(q) !== -1) {
        out.push({ id: id, title: n.title || '', isLeaf: !!(n.fine || n.cat) });
      }
    });
    return out.slice(0, limit);
  }

  function collectDecisionAncestors(id, byId) {
    var out = [], n = (byId || {})[id], guard = 0;
    while (n && n.parent && byId[n.parent] && guard++ < 100) {
      out.push(n.parent);
      n = byId[n.parent];
    }
    return out;
  }

  function collectExpandableIds(childrenOf) {
    return Object.keys(childrenOf || {}).filter(function(id) {
      return (childrenOf[id] || []).length > 0;
    });
  }

  function buildGuidedStepModel(tree, currentId) {
    tree = tree || { byId: {}, childrenOf: {}, rootId: '' };
    var cur = tree.byId[currentId] || tree.byId[tree.rootId] || null;
    var id = cur ? cur.id : '';
    var childIds = (tree.childrenOf[id]) || [];
    var options = childIds.map(function(cid) {
      var c = tree.byId[cid] || {};
      return { id: cid, title: c.title || cid, subtitle: c.subtitle || '', tip: c.decision_tip || '' };
    });
    var path = [], p = cur, guard = 0;
    while (p && guard++ < 50) {
      path.unshift({ id: p.id, title: p.title || p.id });
      p = (p.parent && tree.byId[p.parent]) ? tree.byId[p.parent] : null;
    }
    return {
      id: id,
      title: cur ? (cur.title || '') : '',
      subtitle: cur ? (cur.subtitle || '') : '',
      tip: cur ? (cur.decision_tip || '') : '',
      desc: cur ? (cur.desc || '') : '',
      teacherMove: cur ? (cur.teacher_move || '') : '',
      isLeaf: options.length === 0,
      options: options,
      breadcrumb: path,
      parentId: (cur && cur.parent) ? cur.parent : '',
      categoryRefs: (cur && Array.isArray(cur.category_refs)) ? cur.category_refs : [],
      fineRefs: (cur && Array.isArray(cur.fine_refs)) ? cur.fine_refs : []
    };
  }

  function buildDecisionOutlineModel(tree, currentPathIds) {
    tree = tree || { byId: {}, childrenOf: {}, rootId: '' };
    var onPath = {};
    (Array.isArray(currentPathIds) ? currentPathIds : []).forEach(function(i) { onPath[i] = true; });
    var rows = [];
    function walk(id, depth) {
      var n = tree.byId[id];
      if (!n) return;
      var kids = (tree.childrenOf[id]) || [];
      rows.push({ id: id, depth: depth, title: n.title || id, subtitle: n.subtitle || '', onPath: !!onPath[id], isLeaf: kids.length === 0 });
      kids.forEach(function(c) { walk(c, depth + 1); });
    }
    if (tree.rootId) walk(tree.rootId, 0);
    return { rows: rows };
  }

  // 自动算坐标（叶子横向铺开、父节点居中、深度决定纵向），供"图片缩放定位"画布用——不再手摆 x/y
  function layoutDecisionTree(tree, opts) {
    tree = tree || { byId: {}, childrenOf: {}, rootId: '' };
    opts = opts || {};
    var horiz = !!opts.horizontal;
    var mainStep = horiz ? (opts.colW || 250) : (opts.rowH || 150);   // 按深度推进：竖版=行高，横版=列宽
    var crossStep = horiz ? (opts.rowH || 94) : (opts.colW || 180);   // 叶子在交叉轴铺开
    var padMain = horiz ? (opts.padX || 130) : (opts.padY || 70);
    var padCross = horiz ? (opts.padY || 70) : (opts.padX || 110);
    var pos = {}, leaf = 0;
    function depthOf(id) { var d = 0, n = tree.byId[id]; while (n && n.parent && tree.byId[n.parent]) { d++; n = tree.byId[n.parent]; } return d; }
    function setPos(id, mainV, crossV) { pos[id] = horiz ? { x: mainV, y: crossV } : { x: crossV, y: mainV }; }
    function crossOf(id) { return horiz ? pos[id].y : pos[id].x; }
    function place(id) {
      var ks = tree.childrenOf[id] || [];
      var mainV = depthOf(id) * mainStep + padMain;
      if (!ks.length) { setPos(id, mainV, leaf * crossStep + padCross); leaf++; return; }
      ks.forEach(place);
      setPos(id, mainV, (crossOf(ks[0]) + crossOf(ks[ks.length - 1])) / 2);
    }
    if (tree.rootId && tree.byId[tree.rootId]) place(tree.rootId);
    var maxX = 0, maxY = 0;
    Object.keys(pos).forEach(function (k) { if (pos[k].x > maxX) maxX = pos[k].x; if (pos[k].y > maxY) maxY = pos[k].y; });
    return { pos: pos, width: maxX + 140, height: maxY + 100 };
  }

  window.GrammarKnowledgeViewModel = {
    buildDecisionTree: buildDecisionTree,
    buildPointBreadcrumb: buildPointBreadcrumb,
    buildPointsLeafListModel: buildPointsLeafListModel,
    buildMigrationPointTitle: buildMigrationPointTitle,
    buildGuidedStepModel: buildGuidedStepModel,
    buildDecisionOutlineModel: buildDecisionOutlineModel,
    layoutDecisionTree: layoutDecisionTree,
    BOOK_ORDER: BOOK_ORDER,
    COVER_MAP: COVER_MAP,
    CATEGORY_STAT_COLORS: CATEGORY_STAT_COLORS,
    stripHtml: stripHtml,
    normalizeTagId: normalizeTagId,
    countByFineTag: countByFineTag,
    countByPoint: countByPoint,
    formatCountBadge: formatCountBadge,
    buildLeafWordBreakdown: buildLeafWordBreakdown,
    getFrequencyStyle: getFrequencyStyle,
    buildCategoryStatsModel: buildCategoryStatsModel,
    buildSearchIndex: buildSearchIndex,
    searchKnowledgeIndex: searchKnowledgeIndex,
    buildSearchResultLabel: buildSearchResultLabel,
    buildKnowledgeSearchPanelModel: buildKnowledgeSearchPanelModel,
    buildKnowledgeSearchResetModel: buildKnowledgeSearchResetModel,
    buildKnowledgeSubsectionFocusPlan: buildKnowledgeSubsectionFocusPlan,
    buildKnowledgeSubsectionTogglePlan: buildKnowledgeSubsectionTogglePlan,
    buildKnowledgeNavigationPlan: buildKnowledgeNavigationPlan,
    buildGlobalGraphSearchResetModel: buildGlobalGraphSearchResetModel,
    buildFineCategoryLegendModel: buildFineCategoryLegendModel,
    groupTextbookUnitsByBook: groupTextbookUnitsByBook,
    buildTextbookUnitModel: buildTextbookUnitModel,
    buildTextbookModeToggleModel: buildTextbookModeToggleModel,
    buildTextbookModalModel: buildTextbookModalModel,
    buildTextbookModalViewModel: buildTextbookModalViewModel,
    buildTextbookModalOpenPlan: buildTextbookModalOpenPlan,
    buildTextbookModel: buildTextbookModel,
    buildTextbookViewModel: buildTextbookViewModel,
    isMockQuestion: isMockQuestion,
    isRealQuestion: isRealQuestion,
    getUnitQuestionSourceText: getUnitQuestionSourceText,
    getUnitQuestionTypeTag: getUnitQuestionTypeTag,
    buildUnitFilterChips: buildUnitFilterChips,
    buildUnitQuestionItemModel: buildUnitQuestionItemModel,
    buildUnitQuestionListModel: buildUnitQuestionListModel,
    buildUnitQuestionModalViewModel: buildUnitQuestionModalViewModel,
    buildUnitQuestionListOpenPlan: buildUnitQuestionListOpenPlan,
    buildUnitQuestionFilterChangePlan: buildUnitQuestionFilterChangePlan,
    buildUnitQuestionNavigationPlan: buildUnitQuestionNavigationPlan,
    buildUnitQuestionDrawerReturnPlan: buildUnitQuestionDrawerReturnPlan,
    getKnowledgeRootColorStyle: getKnowledgeRootColorStyle,
    getKnowledgeCategoryLabel: getKnowledgeCategoryLabel,
    getKnowledgeNodeCategoryLabels: getKnowledgeNodeCategoryLabels,
    buildKnowledgeMapNodeCardModel: buildKnowledgeMapNodeCardModel,
    buildKnowledgeMapPathModel: buildKnowledgeMapPathModel,
    buildKnowledgeMapModel: buildKnowledgeMapModel,
    buildKnowledgeNodeDetailModel: buildKnowledgeNodeDetailModel,
    buildGlobalGraphPageModel: buildGlobalGraphPageModel,
    buildGlobalGraphInspectorModel: buildGlobalGraphInspectorModel,
    buildGlobalGraphSearchModel: buildGlobalGraphSearchModel,
    buildGlobalGraphSvgModel: buildGlobalGraphSvgModel,
    buildKnowledgeSidebarModel: buildKnowledgeSidebarModel,
    buildKnowledgeBookContentModel: buildKnowledgeBookContentModel,
    buildKnowledgeViewChromeModel: buildKnowledgeViewChromeModel,
    searchDecisionNodes: searchDecisionNodes,
    collectDecisionAncestors: collectDecisionAncestors,
    collectExpandableIds: collectExpandableIds
  };
})();
