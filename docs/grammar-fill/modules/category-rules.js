// grammar-fill/modules/category-rules.js
//
// Category names and default classroom tips for grammar-fill questions.

/* eslint-disable */
(function(){
  var DEFAULT_CATEGORY_NAMES = {
    predicate: '谓语动词',
    nonpredicate: '非谓语动词',
    word: '词性转换',
    number: '名词/数词',
    article: '冠词',
    pronoun: '代词',
    preposition: '介词',
    logic: '逻辑连词',
    attrib: '定语从句',
    nounclause: '名词性从句',
    advclause: '状语从句'
  };

  var CATEGORY_TIPS = {
    predicate: '谓语动词：①判断时态（时间状语+语境）②判断语态（主被动）③主谓一致',
    nonpredicate: '非谓语动词：①找逻辑主语 ②判断关系（主动 doing / 被动 done / 目的 to do）',
    word: '词性转换：①判断空格在句中成分 ②选正确词性（名/形/副/动）',
    article: '冠词：①特指用 the ②泛指用 a/an ③固定搭配',
    preposition: '介词：①固定搭配 ②句意逻辑（时间/地点/方式/原因）',
    pronoun: '代词：①确定指代对象 ②判断格（主格/宾格/所有格）',
    logic: '逻辑连词：①前后句关系（并列/转折/因果/选择/递进）②固定搭配',
    attrib: '定语从句：①找先行词 ②判断从句成分（主/宾/状）③选关系词',
    nounclause: '名词性从句：①判断从句类型（主/宾/表/同位）②缺什么选什么',
    advclause: '状语从句：①判断主从句关系（时间/原因/条件/让步/目的/结果）②选连词',
    number: '名词/数词：①名词复数 ②名词所有格 ③可数性 ④基数↔序数'
  };

  var HOME_CATEGORY_SECTIONS = [
    {
      titleText: '一、谓语动词 · 非谓语动词',
      items: [
        { category: 'predicate', tagText: '谓语', tagClass: '', titleText: '谓语动词', descriptionText: '时态 · 语态 · 主谓一致' },
        { category: 'nonpredicate', tagText: '非谓语', tagClass: 'green', titleText: '非谓语动词', descriptionText: 'doing · done · to do' }
      ]
    },
    {
      titleText: '二、词性转换',
      items: [
        { category: 'word', tagText: '词性', tagClass: 'blue', titleText: '名词 · 形容词 · 副词', descriptionText: '词性转换（给词为名/形/副）' },
        { category: 'number', tagText: '名词/数词', tagClass: 'purple', titleText: '名词 · 数词', descriptionText: '名词复数 / 所有格 · 数词' }
      ]
    },
    {
      titleText: '三、小词',
      items: [
        { category: 'article', tagText: '冠词', tagClass: 'orange', titleText: '冠词', descriptionText: 'a / an / the' },
        { category: 'pronoun', tagText: '代词', tagClass: 'red', titleText: '代词', descriptionText: '人称 · 物主 · 反身 · 不定代词' },
        { category: 'preposition', tagText: '介词', tagClass: 'teal', titleText: '介词', descriptionText: '固定搭配 · 句意判断' }
      ]
    },
    {
      titleText: '四、连词',
      items: [
        { category: 'logic', tagText: '逻辑', tagClass: 'purple', titleText: '逻辑连词', descriptionText: 'and · but · or · so' },
        { category: 'attrib', tagText: '定从', tagClass: 'red', titleText: '定语从句连词', descriptionText: '关系代词 · 关系副词' },
        { category: 'nounclause', tagText: '名从', tagClass: 'teal', titleText: '名词性从句连词', descriptionText: '主语 · 宾语 · 表语 · 同位语' },
        { category: 'advclause', tagText: '状从', tagClass: 'green', titleText: '状语从句连词', descriptionText: '时间 · 条件 · 原因 · 让步等' }
      ]
    }
  ];

  function buildCategoryMap(bank) {
    var fromBank = bank && bank.category_names;
    return Object.assign({}, DEFAULT_CATEGORY_NAMES, fromBank || {});
  }

  function getCategoryTip(category) {
    return CATEGORY_TIPS[category] || '先判空格成分，再确定答案方向。';
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function buildAction(fn, value) {
    return {
      fn: fn || '',
      value: value == null ? '' : String(value)
    };
  }

  function countQuestionsByCategory(questions) {
    return asArray(questions).reduce(function(map, question) {
      var category = question && question.category;
      if (category) map[category] = (map[category] || 0) + 1;
      return map;
    }, {});
  }

  function getCategoryCountText(count) {
    count = Number(count || 0) || 0;
    return count > 0 ? '题库：' + count + '题' : '暂无';
  }

  function cloneCategoryItem(item, counts) {
    item = item || {};
    var category = item.category || '';
    var count = counts && counts[category] || 0;
    return {
      category: category,
      tagText: item.tagText || '',
      tagClass: item.tagClass || '',
      titleText: item.titleText || '',
      descriptionText: item.descriptionText || '',
      count: count,
      countText: getCategoryCountText(count),
      countElementId: 'count-' + category,
      action: buildAction('startByCategory', category)
    };
  }

  function buildHomeCategoryModel(questions) {
    var counts = countQuestionsByCategory(questions);
    return {
      sections: HOME_CATEGORY_SECTIONS.map(function(section) {
        return {
          titleText: section.titleText || '',
          items: asArray(section.items).map(function(item) {
            return cloneCategoryItem(item, counts);
          })
        };
      })
    };
  }

  function getCategorySourceText(category, categoryMap) {
    categoryMap = categoryMap || {};
    return '按考点 · ' + (categoryMap[category] || category || '语法填空');
  }

  function getEmptyCategoryMessage() {
    return '该考点暂无题目';
  }

  function selectCategoryQuestions(questions, category) {
    return asArray(questions).filter(function(question) {
      return question && question.category === category;
    });
  }

  function buildCategoryPracticeEntryModel(category, questions, categoryMap) {
    questions = asArray(questions);
    return {
      category: category || '',
      questions: questions,
      hasQuestions: questions.length > 0,
      emptyMessage: getEmptyCategoryMessage(category),
      currentExam: {
        source: getCategorySourceText(category, categoryMap),
        questions: questions,
        mode: 'category',
        category: category || ''
      }
    };
  }

  function buildCategoryPracticePlan(category, allQuestions, categoryMap) {
    return buildCategoryPracticeEntryModel(
      category,
      selectCategoryQuestions(allQuestions, category),
      categoryMap
    );
  }

  window.GrammarCategoryRules = {
    DEFAULT_CATEGORY_NAMES: DEFAULT_CATEGORY_NAMES,
    CATEGORY_TIPS: CATEGORY_TIPS,
    HOME_CATEGORY_SECTIONS: HOME_CATEGORY_SECTIONS,
    buildCategoryMap: buildCategoryMap,
    getCategoryTip: getCategoryTip,
    asArray: asArray,
    buildAction: buildAction,
    countQuestionsByCategory: countQuestionsByCategory,
    getCategoryCountText: getCategoryCountText,
    buildHomeCategoryModel: buildHomeCategoryModel,
    getCategorySourceText: getCategorySourceText,
    getEmptyCategoryMessage: getEmptyCategoryMessage,
    selectCategoryQuestions: selectCategoryQuestions,
    buildCategoryPracticeEntryModel: buildCategoryPracticeEntryModel,
    buildCategoryPracticePlan: buildCategoryPracticePlan
  };
})();
