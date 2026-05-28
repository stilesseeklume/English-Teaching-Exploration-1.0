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
    var bankCount = asArray(bankQuestions).filter(function(q) { return q && q.fine_category === fineCategory; }).length;
    var errorCount = asArray(errorQuestions).filter(function(q) { return q && q.fine_category === fineCategory; }).length;
    return { bank: bankCount, error: errorCount, total: bankCount + errorCount };
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
      items: order.map(function(category) {
        return {
          category: category,
          label: categoryMap[category] || category,
          count: counts[category],
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

  function buildFineCategoryModel(fineTags, bankQuestions, errorQuestions) {
    fineTags = fineTags || {};
    var categories = fineTags.categories || {};
    var tagsByCategory = fineTags.tags_by_category || {};
    return {
      categories: Object.keys(categories).map(function(categoryId) {
        var category = categories[categoryId] || {};
        var tags = asArray(tagsByCategory[categoryId]).map(function(tag) {
          tag = tag || {};
          var counts = countByFineTag(tag.id, bankQuestions, errorQuestions);
          return {
            id: tag.id,
            name: tag.name,
            source: tag.source || '',
            counts: counts,
            frequencyStyle: getFrequencyStyle(counts.total)
          };
        });
        var total = tags.reduce(function(sum, tag) { return sum + tag.counts.total; }, 0);
        return {
          id: categoryId,
          category: category,
          stats: { total: total, tagCount: tags.length },
          frequencyStyle: getFrequencyStyle(total),
          tags: tags
        };
      })
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

  function buildTextbookModel(fineTags, bankQuestions, errorQuestions) {
    fineTags = fineTags || {};
    var rawByBook = groupTextbookUnitsByBook(fineTags.textbook_units || []);
    var books = BOOK_ORDER.map(function(book, idx) {
      var units = asArray(rawByBook[book]).map(function(unit) {
        return buildTextbookUnitModel(unit, fineTags, bankQuestions, errorQuestions);
      });
      var totalQuestions = units.reduce(function(sum, unit) { return sum + unit.totalQuestions; }, 0);
      return {
        book: book,
        cover: COVER_MAP[book],
        units: units,
        unitCount: units.length,
        totalQuestions: totalQuestions,
        animationDelayMs: idx * 60
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
    return {
      source: source,
      filter: filter,
      title: (source === 'errors' ? '📝 ' : '📋 ') + (context.unitLabel || '') + (source === 'errors' ? ' · 我的错题' : ' · 关联真题'),
      counts: {
        real: rawItems.filter(function(q) { return q.type === '真题'; }).length,
        mock: rawItems.filter(function(q) { return q.type === '模拟卷' || q.type === '模拟题'; }).length,
        all: rawItems.length
      },
      items: items,
      visibleItems: items.slice(0, limit),
      hiddenCount: Math.max(0, items.length - limit),
      emptyText: source === 'errors'
        ? '该单元对应考点你还没有错题。'
        : '该单元对应考点暂无真题。'
    };
  }

  window.GrammarKnowledgeViewModel = {
    BOOK_ORDER: BOOK_ORDER,
    COVER_MAP: COVER_MAP,
    CATEGORY_STAT_COLORS: CATEGORY_STAT_COLORS,
    stripHtml: stripHtml,
    normalizeTagId: normalizeTagId,
    countByFineTag: countByFineTag,
    getFrequencyStyle: getFrequencyStyle,
    buildCategoryStatsModel: buildCategoryStatsModel,
    buildSearchIndex: buildSearchIndex,
    searchKnowledgeIndex: searchKnowledgeIndex,
    buildFineCategoryModel: buildFineCategoryModel,
    groupTextbookUnitsByBook: groupTextbookUnitsByBook,
    buildTextbookUnitModel: buildTextbookUnitModel,
    buildTextbookModel: buildTextbookModel,
    buildUnitQuestionListModel: buildUnitQuestionListModel
  };
})();
