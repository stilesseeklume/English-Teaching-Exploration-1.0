// grammar-fill/modules/category-rules.js
//
// Category names and default classroom tips for grammar-fill questions.

/* eslint-disable */
(function(){
  var DEFAULT_CATEGORY_NAMES = {
    predicate: '谓语动词',
    nonpredicate: '非谓语动词',
    word: '词性转换',
    number: '数词',
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
    number: '数词：①基数↔序数 ②分数表达 ③固定搭配'
  };

  function buildCategoryMap(bank) {
    var fromBank = bank && bank.category_names;
    return Object.assign({}, DEFAULT_CATEGORY_NAMES, fromBank || {});
  }

  function getCategoryTip(category) {
    return CATEGORY_TIPS[category] || '先判空格成分，再确定答案方向。';
  }

  window.GrammarCategoryRules = {
    DEFAULT_CATEGORY_NAMES: DEFAULT_CATEGORY_NAMES,
    CATEGORY_TIPS: CATEGORY_TIPS,
    buildCategoryMap: buildCategoryMap,
    getCategoryTip: getCategoryTip
  };
})();
