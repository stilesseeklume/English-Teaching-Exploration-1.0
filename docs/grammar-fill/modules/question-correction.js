// grammar-fill/modules/question-correction.js
//
// 用 AI 写对的散文字段(grammar_point/nonp_form)纠正错填的 canonical 字段(fine_category/facets)。
// 纯函数、无 DOM、不改入参、幂等。

/* eslint-disable */
(function(){
  function lower(v){ return String(v == null ? '' : v).trim().toLowerCase(); }

  function shallowCopy(obj){
    var out = {};
    for (var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k]; }
    return out;
  }

  function correctClassification(raw){
    if (!raw || typeof raw !== 'object') return raw;
    var q = shallowCopy(raw);
    var cat = q.category || '';
    var answer = lower(q.answer);
    var prose = String((q.grammar_point || '') + ' ' + (q.explanation || ''));

    // R1 反身代词
    if (cat === 'pronoun' && (/(?:self|selves)$/.test(answer) || /反身/.test(prose))) {
      if (q.fine_category !== 'pron-reflexive') {
        q.fine_category = 'pron-reflexive';
        var fa = shallowCopy(q.facets || {});
        fa.type = 'reflexive';
        q.facets = fa;
      }
    }

    // R2 非谓语形式对齐权威 nonp_form
    if (cat === 'nonpredicate' && q.nonp_form) {
      var nf = q.nonp_form;
      var target = null;
      if (nf === 'to_do' || nf === 'to_be_done') target = { fine: 'nonpred-to-do', form: 'to-do' };
      else if (nf === 'doing') target = { fine: 'nonpred-doing', form: 'doing' };
      else if (nf === 'done') target = { fine: 'nonpred-done', form: 'done' };
      if (target && (q.fine_category !== target.fine || ((q.facets || {}).form !== target.form))) {
        q.fine_category = target.fine;
        var fa2 = shallowCopy(q.facets || {});
        fa2.form = target.form;
        q.facets = fa2;
      }
    }

    return q;
  }

  window.GrammarQuestionCorrection = {
    correctClassification: correctClassification
  };
})();
