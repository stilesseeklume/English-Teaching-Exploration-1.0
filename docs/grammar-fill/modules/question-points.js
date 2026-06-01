// grammar-fill/modules/question-points.js
//
// 由 fine_category + facets + answer 派生每题的 points 标签清单。
// 谓语 → 多标签（时态/语态/一致各一轴）；其余 → 单标签。纯函数，无 DOM。
// 元素：{ tag, key?, frequency? }

/* eslint-disable */
(function(){
  // 并列连词 word → 逻辑关系组
  var LOGIC_RELATION = {
    and:'并列', both:'并列',
    but:'转折', yet:'转折',
    or:'选择', either:'选择',
    so:'因果', for:'因果',
    nor:'否定并列', neither:'否定并列'
  };

  function lower(v){ return String(v == null ? '' : v).trim().toLowerCase(); }

  function buildQuestionPoints(q){
    q = q || {};
    var cat = q.category || '';
    var fc = q.fine_category || '';
    var fa = q.facets || {};
    var word = fa.word || '';
    var ans = lower(q.answer);

    if (cat === 'logic') {
      var rel = LOGIC_RELATION[lower(word) || ans];
      if (!rel) rel = (fa.kind === 'correlative') ? '关联结构' : '并列';
      return [{ tag: 'logic-coordinating', key: rel }];
    }
    if (cat === 'attrib') {
      return [{ tag: fc || 'attrib-pronoun', key: String(word || ans) }];
    }
    if (cat === 'nounclause' || cat === 'preposition') {
      return [{ tag: fc, key: String(word || ans) }];
    }
    if (cat === 'article') {
      // a/an 同 tag(art-a-an)，用 key 区分（学生易错点）；the / 零 各自成 tag
      if (ans === 'a' || ans === 'an') return [{ tag: 'art-a-an', key: ans }];
      if (ans === 'the') return [{ tag: 'art-the' }];
      return [{ tag: 'art-zero', frequency: '几乎不考' }];
    }
    if (cat === 'pronoun') {
      var ptype = lower(fa.type);
      if (ptype === 'possessive')    return [{ tag: 'pron-possessive' }];
      if (ptype === 'reflexive')     return [{ tag: 'pron-reflexive' }];
      if (ptype === 'demonstrative') return [{ tag: 'pron-demonstrative' }];
      if (ptype === 'indefinite')    return [{ tag: 'pron-indefinite', key: ans }];
      if (ptype === 'it' || fc === 'pron-it') return [{ tag: 'pron-it' }];
      return [{ tag: 'pron-personal' }];
    }
    if (cat === 'predicate') {
      var pts = [];
      if (fa.tense) pts.push({ tag: 'pred-tense', key: String(fa.tense) });
      if (lower(fa.voice) === 'passive') pts.push({ tag: 'pred-passive' });
      if (fa.agreement === true || fa.agreement === 'true') pts.push({ tag: 'pred-agreement' });
      if (!pts.length) pts.push({ tag: fc || 'pred-tense' });
      return pts;
    }
    // nonpredicate / word / number / advclause / modal / special：单标签 = fine_category
    return [{ tag: fc }];
  }

  window.GrammarQuestionPoints = {
    buildQuestionPoints: buildQuestionPoints
  };
})();
