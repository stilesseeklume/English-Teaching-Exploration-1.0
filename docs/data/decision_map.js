// docs/data/decision_map.js
//
// 语法填空「做题决策树」—— 按【做题判断】组织（不是语法分类）。
// 每层 = 解题时脑子里的判断；落点是考点；叶子是细考点，带 知识点/迁移/真题 三个链接。
// 独立于 KNOWLEDGE_CORE.teaching_graph（讲题台焦点图谱仍用那份），互不影响。
//
// 节点字段：
//   id        唯一 id
//   parent    父节点 id（根省略）
//   title     节点标题（做题判断 / 考点名）
//   sub       副标题（一句话提示，可空）
//   cat       叶子/考点对应的粗类（startByCategory 看真题用）
//   fine      叶子对应的细考点 tag id（知识点讲解 / 迁移训练用，对齐 grammar_fine_tags）
//
// 叶子 = 没有子节点的节点；有 fine 即可链接知识点+迁移，有 cat 即可看真题。

(function () {
  var NODES = [
    { id: 'root', title: '题目入口', sub: '先看空格：有没有括号提示词？' },

    // ───────── 有提示词 · 考词形 ─────────
    { id: 'clue', parent: 'root', title: '有提示词', sub: '括号给了词 → 判断这个词在句中作什么' },

    //   作动词 → 缺不缺谓语
    { id: 'verb', parent: 'clue', title: '作动词', sub: '判断：句子缺不缺谓语？' },

    { id: 'pred', parent: 'verb', title: '谓语动词', sub: '缺谓语 → 定 时态 / 语态 / 主谓一致', cat: 'predicate' },
    // 时态：新体系合并为单一 pred-tense（时态细分进 facets.tense）；保留细叶子方便按解题思路导航
    { id: 'pred_tense', parent: 'pred', title: '时态', sub: '找时间标志和上下文', kd: 'predicate-tense' },
    { id: 'l_tense_present', parent: 'pred_tense', title: '一般现在时', cat: 'predicate', fine: 'pred-tense' },
    { id: 'l_tense_past', parent: 'pred_tense', title: '一般过去 / 将来 / 过去将来', cat: 'predicate', fine: 'pred-tense' },
    { id: 'l_tense_cont', parent: 'pred_tense', title: '进行时', cat: 'predicate', fine: 'pred-tense' },
    { id: 'l_tense_perfect', parent: 'pred_tense', title: '完成时 / 完成进行', cat: 'predicate', fine: 'pred-tense' },
    { id: 'l_tense_pastperfect', parent: 'pred_tense', title: '过去完成 / 将来完成', cat: 'predicate', fine: 'pred-tense' },
    { id: 'l_tense_other', parent: 'pred_tense', title: '时态其他', cat: 'predicate', fine: 'pred-tense' },
    { id: 'pred_voice', parent: 'pred', title: '语态', sub: '主语是否承受动作？', kd: 'predicate-voice' },
    { id: 'l_voice_form', parent: 'pred_voice', title: '被动语态的构成', cat: 'predicate', fine: 'pred-passive' },
    { id: 'l_voice_implicit', parent: 'pred_voice', title: '主动形式表被动', cat: 'predicate', fine: 'pred-passive' },
    { id: 'pred_sva', parent: 'pred', title: '主谓一致', sub: '回到主语中心词', kd: 'predicate-agreement' },
    { id: 'l_sva_form', parent: 'pred_sva', title: '语法形式一致', cat: 'predicate', fine: 'pred-agreement' },
    { id: 'l_sva_meaning', parent: 'pred_sva', title: '意义 / 就近一致', cat: 'predicate', fine: 'pred-agreement' },
    { id: 'l_sva_collective', parent: 'pred_sva', title: '集合 / 复数名词作主语', cat: 'predicate', fine: 'pred-agreement' },
    { id: 'l_sva_quantity', parent: 'pred_sva', title: '数量短语作主语', cat: 'predicate', fine: 'pred-agreement' },

    // 非谓语：节点标签=形式，tag=形式（按引导词/形式一把尺子）
    { id: 'nonp', parent: 'verb', title: '非谓语', sub: '已有谓语 → 选形式（具体成分到题里判断）', cat: 'nonpredicate' },
    { id: 'l_nonp_todo', parent: 'nonp', title: 'to do', cat: 'nonpredicate', fine: 'nonpred-to-do' },
    { id: 'l_nonp_doing', parent: 'nonp', title: 'doing', cat: 'nonpredicate', fine: 'nonpred-doing' },
    { id: 'l_nonp_done', parent: 'nonp', title: 'done', cat: 'nonpredicate', fine: 'nonpred-done' },

    //   不作动词 → 变什么词（打散：名词/数词/形容词/副词/比较级 各自独立）
    { id: 'word', parent: 'clue', title: '不作动词', sub: '判断：要变成什么词、作什么成分？' },

    { id: 'noun', parent: 'word', title: '名词', sub: '名词位 → 看可数性、数、格', cat: 'number' },
    { id: 'l_noun_count', parent: 'noun', title: '可数 / 不可数', cat: 'number', fine: 'num-plural' },
    { id: 'l_noun_plural', parent: 'noun', title: '名词复数形式', cat: 'number', fine: 'num-plural' },
    { id: 'l_noun_poss', parent: 'noun', title: '名词所有格', cat: 'number', fine: 'num-possessive' },
    { id: 'l_noun_deriv', parent: 'noun', title: '派生成名词（动→名 / 形→名）', cat: 'word', fine: 'word-noun' },

    { id: 'numw', parent: 'word', title: '数词', sub: '数量 / 序数表达', cat: 'number' },
    { id: 'l_num_quantity', parent: 'numw', title: '数量的表示方法 / 数词', cat: 'number', fine: 'num-numeral' },

    { id: 'adj', parent: 'word', title: '形容词', sub: '修饰名词 / 作表语', cat: 'word', kd: 'word-adj-adv' },
    { id: 'l_adj_choice', parent: 'adj', title: '形容词的选用', cat: 'word', fine: 'word-adj-vs-adv' },
    { id: 'l_adj_eding', parent: 'adj', title: '-ed vs -ing 形容词', cat: 'word', fine: 'word-adj' },
    { id: 'l_adj_distinguish', parent: 'adj', title: '常考形容词辨析', cat: 'word', fine: 'word-adj' },

    { id: 'adv', parent: 'word', title: '副词', sub: '修饰动作 / 形容词 / 句子', cat: 'word', kd: 'word-adj-adv' },
    { id: 'l_adv_other', parent: 'adv', title: '副词用法', cat: 'word', fine: 'word-adv' },
    { id: 'l_adv_common', parent: 'adv', title: '几个常用副词', cat: 'word', fine: 'word-adv' },
    { id: 'l_adv_phrase', parent: 'adv', title: '常考副词词组辨析', cat: 'word', fine: 'word-adv' },

    { id: 'cmp', parent: 'word', title: '比较级 / 最高级', sub: 'than / much / the most 等信号触发', cat: 'word', kd: 'word-compare' },
    { id: 'l_cmp_comparative', parent: 'cmp', title: '比较级', cat: 'word', fine: 'word-comparative' },
    { id: 'l_cmp_superlative', parent: 'cmp', title: '最高级', cat: 'word', fine: 'word-comparative' },
    { id: 'l_cmp_rules', parent: 'cmp', title: '构成规则 / than·as 词性', cat: 'word', fine: 'word-comparative' },
    { id: 'l_cmp_multiple', parent: 'cmp', title: '倍数表达', cat: 'word', fine: 'word-comparative' },

    // ───────── 无提示词 · 考关系（四类：介词 / 冠词 / 代词 / 连词）─────────
    { id: 'noclue', parent: 'root', title: '无提示词', sub: '没给词 → 判断缺什么关系' },

    { id: 'prep', parent: 'noclue', title: '介词', sub: '词块搭配 / 时间地点等关系', cat: 'preposition' },
    { id: 'l_prep_common', parent: 'prep', title: '常见介词的用法', cat: 'preposition', fine: 'prep-common' },
    { id: 'l_prep_time', parent: 'prep', title: '时间介词辨析', cat: 'preposition', fine: 'prep-time' },
    { id: 'l_prep_loc', parent: 'prep', title: '地点 / 位置介词辨析', cat: 'preposition', fine: 'prep-place' },
    { id: 'l_prep_verb', parent: 'prep', title: '动介搭配', cat: 'preposition', fine: 'prep-collocation' },
    { id: 'l_prep_other', parent: 'prep', title: '其他介词辨析', cat: 'preposition', fine: 'prep-other' },

    { id: 'art', parent: 'noclue', title: '冠词', sub: '限定名词：可数性 / 特指泛指', cat: 'article' },
    { id: 'l_art_spec', parent: 'art', title: '特指 / 独指 / 类指', cat: 'article', fine: 'art-the' },
    { id: 'l_art_aan', parent: 'art', title: '不定冠词 a / an', cat: 'article', fine: 'art-a-an' },
    { id: 'l_art_the', parent: 'art', title: '定冠词 the', cat: 'article', fine: 'art-the' },
    // l_art_zero（不用冠词）已删除：新体系零冠词高考不考（spec §一之5）

    { id: 'pron', parent: 'noclue', title: '代词', sub: '指代上下文 / 格 / 替代', cat: 'pronoun' },
    { id: 'l_pron_personal', parent: 'pron', title: '人称 / 物主 / 反身 / 指示', cat: 'pronoun', fine: 'pron-personal' },
    { id: 'l_pron_indef1', parent: 'pron', title: '不定代词（一）', cat: 'pronoun', fine: 'pron-indefinite' },
    { id: 'l_pron_indef2', parent: 'pron', title: '不定代词（二）', cat: 'pronoun', fine: 'pron-indefinite' },
    { id: 'l_pron_it', parent: 'pron', title: '代词 it', cat: 'pronoun', fine: 'pron-it' },

    { id: 'conj', parent: 'noclue', title: '连词', sub: '判断：连同层成分，还是引出从句？' },
    { id: 'coord', parent: 'conj', title: '并列连词', sub: '连接同层词 / 短语 / 句子', cat: 'logic', kd: 'logic-coord' },
    { id: 'l_coord_phrase', parent: 'coord', title: '连接词或短语的并列', cat: 'logic', fine: 'logic-coordinating' },
    { id: 'l_coord_compound', parent: 'coord', title: '并列句', cat: 'logic', fine: 'logic-coordinating' },

    { id: 'rel', parent: 'conj', title: '关系词', sub: '引出从句 → 判断这是哪种从句' },
    { id: 'attrib', parent: 'rel', title: '定语从句', sub: '修饰名词：先行词 + 从句缺什么', cat: 'attrib' },
    { id: 'l_attrib_choice', parent: 'attrib', title: '关系词的选择', cat: 'attrib', fine: 'attrib-pronoun' },
    { id: 'l_attrib_adverb', parent: 'attrib', title: '关系副词', cat: 'attrib', fine: 'attrib-adverb' },
    { id: 'l_attrib_prep', parent: 'attrib', title: '介词 + 关系代词', cat: 'attrib', fine: 'attrib-prep-relative' },
    { id: 'l_attrib_restr', parent: 'attrib', title: '限制性 vs 非限制性', cat: 'attrib', fine: 'attrib-pronoun' },
    { id: 'l_attrib_only_that', parent: 'attrib', title: '只能用 that', cat: 'attrib', fine: 'attrib-pronoun' },

    // 名词性从句：从「成分（主/宾/表/同位）」改为「引导词」（spec §3.2），与 nounc-* tag 1:1
    { id: 'nounc', parent: 'rel', title: '名词性从句', sub: '整体作名词成分 → 判断用哪个引导词', cat: 'nounclause' },
    { id: 'l_nounc_that', parent: 'nounc', title: 'that 引导', cat: 'nounclause', fine: 'nounc-that' },
    { id: 'l_nounc_whetherif', parent: 'nounc', title: 'whether / if 引导', cat: 'nounclause', fine: 'nounc-whether-if' },
    { id: 'l_nounc_whpron', parent: 'nounc', title: '连接代词（what / who / which）', cat: 'nounclause', fine: 'nounc-wh-pronoun' },
    { id: 'l_nounc_whadv', parent: 'nounc', title: '连接副词（when / where / how / why）', cat: 'nounclause', fine: 'nounc-wh-adverb' },
    { id: 'l_nounc_ever', parent: 'nounc', title: 'wh-ever 类（whatever / whoever…）', cat: 'nounclause', fine: 'nounc-ever' },

    // 状语从句：配对叶子拆为 9 个独立语义类别（spec §11），与 advc-* tag 1:1
    { id: 'advc', parent: 'rel', title: '状语从句', sub: '表逻辑关系 → 先说清中文逻辑', cat: 'advclause' },
    { id: 'l_advc_time', parent: 'advc', title: '时间', cat: 'advclause', fine: 'advc-time' },
    { id: 'l_advc_cause', parent: 'advc', title: '原因', cat: 'advclause', fine: 'advc-cause' },
    { id: 'l_advc_place', parent: 'advc', title: '地点', cat: 'advclause', fine: 'advc-place' },
    { id: 'l_advc_condition', parent: 'advc', title: '条件', cat: 'advclause', fine: 'advc-condition' },
    { id: 'l_advc_manner', parent: 'advc', title: '方式', cat: 'advclause', fine: 'advc-manner' },
    { id: 'l_advc_concession', parent: 'advc', title: '让步', cat: 'advclause', fine: 'advc-concession' },
    { id: 'l_advc_comparison', parent: 'advc', title: '比较', cat: 'advclause', fine: 'advc-comparison' },
    { id: 'l_advc_purpose', parent: 'advc', title: '目的', cat: 'advclause', fine: 'advc-purpose' },
    { id: 'l_advc_result', parent: 'advc', title: '结果', cat: 'advclause', fine: 'advc-result' }
  ];

  window.GRAMMAR_DECISION_MAP = { rootId: 'root', nodes: NODES };
})();
