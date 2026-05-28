// grammar-fill/modules/teaching-axes.js
//
// Pure classroom judgement axes for grammar-fill questions. No DOM access.

/* eslint-disable */
(function(){
  var NONP_FUNCTION_LABELS = {
    subject_predicative: '作主语 / 表语',
    object: '作宾语',
    attribute: '作定语',
    adverbial: '作状语',
    complement: '作补语',
    with_absolute: 'with 复合结构',
    other: '其他'
  };

  var NONP_FORM_LABELS = {
    to_do: 'to do',
    doing: 'doing',
    done: 'done',
    to_be_done: 'to be done',
    being_done: 'being done',
    having_done: 'having done',
    having_been_done: 'having been done',
    bare_do: 'bare do',
    other: 'other'
  };

  var NONP_FORM_NOTES = {
    to_do: '目的 / 将来 / 特定搭配',
    doing: '主动 / 进行 / 动名词',
    done: '被动 / 完成 / 状态',
    to_be_done: '将来 / 目的中的被动',
    being_done: '正在被进行',
    having_done: '主动且先于谓语',
    having_been_done: '被动且先于谓语',
    bare_do: '省 to 原形',
    other: '特殊非谓语形式'
  };

  function getNonpAxis(q) {
    if (!q || q.category !== 'nonpredicate') return null;
    var formKey = q.nonp_form || '';
    var fnKey = q.nonp_function || '';
    if (!formKey && !fnKey && !q.nonp_rule) return null;
    var formLabel = q.nonp_form_label || NONP_FORM_LABELS[formKey] || formKey;
    var fnLabel = q.nonp_function_label || NONP_FUNCTION_LABELS[fnKey] || fnKey;
    var note = NONP_FORM_NOTES[formKey] || '';
    var title = '非谓语';
    if (formLabel) title += '：' + formLabel;
    if (fnLabel) title += ' · ' + fnLabel;
    return {
      formKey: formKey,
      functionKey: fnKey,
      formLabel: formLabel,
      functionLabel: fnLabel,
      note: note,
      rule: q.nonp_rule || '',
      title: title
    };
  }

  window.GrammarTeachingAxes = {
    NONP_FUNCTION_LABELS: NONP_FUNCTION_LABELS,
    NONP_FORM_LABELS: NONP_FORM_LABELS,
    NONP_FORM_NOTES: NONP_FORM_NOTES,
    getNonpAxis: getNonpAxis
  };
})();
