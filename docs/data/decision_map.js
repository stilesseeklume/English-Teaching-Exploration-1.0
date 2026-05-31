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
    { id: 'pred_tense', parent: 'pred', title: '时态', sub: '找时间标志和上下文', kd: 'predicate-tense' },
    { id: 'l_tense_present', parent: 'pred_tense', title: '一般现在时', cat: 'predicate', fine: 'pred-tense-present' },
    { id: 'l_tense_past', parent: 'pred_tense', title: '一般过去 / 将来 / 过去将来', cat: 'predicate', fine: 'pred-tense-past-future' },
    { id: 'l_tense_cont', parent: 'pred_tense', title: '进行时', cat: 'predicate', fine: 'pred-tense-continuous' },
    { id: 'l_tense_perfect', parent: 'pred_tense', title: '完成时 / 完成进行', cat: 'predicate', fine: 'pred-tense-perfect' },
    { id: 'l_tense_pastperfect', parent: 'pred_tense', title: '过去完成 / 将来完成', cat: 'predicate', fine: 'pred-tense-past-perfect' },
    { id: 'l_tense_other', parent: 'pred_tense', title: '时态其他', cat: 'predicate', fine: 'pred-tense-other' },
    { id: 'pred_voice', parent: 'pred', title: '语态', sub: '主语是否承受动作？', kd: 'predicate-voice' },
    { id: 'l_voice_form', parent: 'pred_voice', title: '被动语态的构成', cat: 'predicate', fine: 'pred-passive-form' },
    { id: 'l_voice_implicit', parent: 'pred_voice', title: '主动形式表被动', cat: 'predicate', fine: 'pred-passive-implicit' },
    { id: 'pred_sva', parent: 'pred', title: '主谓一致', sub: '回到主语中心词', kd: 'predicate-agreement' },
    { id: 'l_sva_form', parent: 'pred_sva', title: '语法形式一致', cat: 'predicate', fine: 'pred-sva-form' },
    { id: 'l_sva_meaning', parent: 'pred_sva', title: '意义 / 就近一致', cat: 'predicate', fine: 'pred-sva-meaning' },
    { id: 'l_sva_collective', parent: 'pred_sva', title: '集合 / 复数名词作主语', cat: 'predicate', fine: 'pred-sva-collective' },
    { id: 'l_sva_quantity', parent: 'pred_sva', title: '数量短语作主语', cat: 'predicate', fine: 'pred-sva-quantity' },

    { id: 'nonp', parent: 'verb', title: '非谓语', sub: '已有谓语 → 选形式（具体成分到题里判断）', cat: 'nonpredicate' },  // kd: 待补（nonpredicate/preposition/article/pronoun/attrib/nounclause/advclause 等父节点的 KNOWLEDGE_DATA section key 待核对；缺失时看讲解退到类别顶部）
    { id: 'l_nonp_todo', parent: 'nonp', title: 'to do', cat: 'nonpredicate', fine: 'nonp-basic' },
    { id: 'l_nonp_doing', parent: 'nonp', title: 'doing', cat: 'nonpredicate', fine: 'nonp-attribute' },
    { id: 'l_nonp_done', parent: 'nonp', title: 'done', cat: 'nonpredicate', fine: 'nonp-perfect-passive-neg' },

    //   不作动词 → 变什么词（打散：名词/数词/形容词/副词/比较级 各自独立）
    { id: 'word', parent: 'clue', title: '不作动词', sub: '判断：要变成什么词、作什么成分？' },

    { id: 'noun', parent: 'word', title: '名词', sub: '名词位 → 看可数性、数、格', cat: 'number' },
    { id: 'l_noun_count', parent: 'noun', title: '可数 / 不可数', cat: 'number', fine: 'num-countable' },
    { id: 'l_noun_plural', parent: 'noun', title: '名词复数形式', cat: 'number', fine: 'num-plural' },
    { id: 'l_noun_poss', parent: 'noun', title: '名词所有格', cat: 'number', fine: 'num-possessive' },
    { id: 'l_noun_deriv', parent: 'noun', title: '派生成名词（动→名 / 形→名）', cat: 'word', fine: 'word-noun-derivation' },

    { id: 'numw', parent: 'word', title: '数词', sub: '数量 / 序数表达', cat: 'number' },
    { id: 'l_num_quantity', parent: 'numw', title: '数量的表示方法 / 数词', cat: 'number', fine: 'num-quantity' },

    { id: 'adj', parent: 'word', title: '形容词', sub: '修饰名词 / 作表语', cat: 'word', kd: 'word-adj-adv' },
    { id: 'l_adj_choice', parent: 'adj', title: '形容词的选用', cat: 'word', fine: 'word-adj-adv-choice' },
    { id: 'l_adj_eding', parent: 'adj', title: '-ed vs -ing 形容词', cat: 'word', fine: 'word-ed-ing' },
    { id: 'l_adj_distinguish', parent: 'adj', title: '常考形容词辨析', cat: 'word', fine: 'word-adj-adv-distinguish' },

    { id: 'adv', parent: 'word', title: '副词', sub: '修饰动作 / 形容词 / 句子', cat: 'word', kd: 'word-adj-adv' },
    { id: 'l_adv_other', parent: 'adv', title: '副词用法', cat: 'word', fine: 'word-adj-adv-other' },
    { id: 'l_adv_common', parent: 'adv', title: '几个常用副词', cat: 'word', fine: 'word-common-adj-adv' },
    { id: 'l_adv_phrase', parent: 'adv', title: '常考副词词组辨析', cat: 'word', fine: 'word-adj-adv-phrase' },

    { id: 'cmp', parent: 'word', title: '比较级 / 最高级', sub: 'than / much / the most 等信号触发', cat: 'word', kd: 'word-compare' },
    { id: 'l_cmp_comparative', parent: 'cmp', title: '比较级', cat: 'word', fine: 'word-cmp-comparative' },
    { id: 'l_cmp_superlative', parent: 'cmp', title: '最高级', cat: 'word', fine: 'word-cmp-superlative' },
    { id: 'l_cmp_rules', parent: 'cmp', title: '构成规则 / than·as 词性', cat: 'word', fine: 'word-cmp-rules' },
    { id: 'l_cmp_multiple', parent: 'cmp', title: '倍数表达', cat: 'word', fine: 'word-cmp-multiple' },

    // ───────── 无提示词 · 考关系（四类：介词 / 冠词 / 代词 / 连词）─────────
    { id: 'noclue', parent: 'root', title: '无提示词', sub: '没给词 → 判断缺什么关系' },

    { id: 'prep', parent: 'noclue', title: '介词', sub: '词块搭配 / 时间地点等关系', cat: 'preposition' },
    { id: 'l_prep_common', parent: 'prep', title: '常见介词的用法', cat: 'preposition', fine: 'prep-common' },
    { id: 'l_prep_time', parent: 'prep', title: '时间介词辨析', cat: 'preposition', fine: 'prep-time' },
    { id: 'l_prep_loc', parent: 'prep', title: '地点 / 位置介词辨析', cat: 'preposition', fine: 'prep-location' },
    { id: 'l_prep_verb', parent: 'prep', title: '动介搭配', cat: 'preposition', fine: 'prep-verb' },
    { id: 'l_prep_other', parent: 'prep', title: '其他介词辨析', cat: 'preposition', fine: 'prep-other' },

    { id: 'art', parent: 'noclue', title: '冠词', sub: '限定名词：可数性 / 特指泛指', cat: 'article' },
    { id: 'l_art_spec', parent: 'art', title: '特指 / 独指 / 类指', cat: 'article', fine: 'art-specific-indefinite' },
    { id: 'l_art_aan', parent: 'art', title: '不定冠词 a / an', cat: 'article', fine: 'art-a-an' },
    { id: 'l_art_the', parent: 'art', title: '定冠词 the', cat: 'article', fine: 'art-the' },
    { id: 'l_art_zero', parent: 'art', title: '不用冠词', cat: 'article', fine: 'art-zero' },

    { id: 'pron', parent: 'noclue', title: '代词', sub: '指代上下文 / 格 / 替代', cat: 'pronoun' },
    { id: 'l_pron_personal', parent: 'pron', title: '人称 / 物主 / 反身 / 指示', cat: 'pronoun', fine: 'pron-personal-possessive' },
    { id: 'l_pron_indef1', parent: 'pron', title: '不定代词（一）', cat: 'pronoun', fine: 'pron-indefinite-1' },
    { id: 'l_pron_indef2', parent: 'pron', title: '不定代词（二）', cat: 'pronoun', fine: 'pron-indefinite-2' },
    { id: 'l_pron_it', parent: 'pron', title: '代词 it', cat: 'pronoun', fine: 'pron-it' },

    { id: 'conj', parent: 'noclue', title: '连词', sub: '判断：连同层成分，还是引出从句？' },
    { id: 'coord', parent: 'conj', title: '并列连词', sub: '连接同层词 / 短语 / 句子', cat: 'logic', kd: 'logic-coord' },
    { id: 'l_coord_phrase', parent: 'coord', title: '连接词或短语的并列', cat: 'logic', fine: 'logic-conj-phrase' },
    { id: 'l_coord_compound', parent: 'coord', title: '并列句', cat: 'logic', fine: 'logic-compound' },

    { id: 'rel', parent: 'conj', title: '关系词', sub: '引出从句 → 判断这是哪种从句' },
    { id: 'attrib', parent: 'rel', title: '定语从句', sub: '修饰名词：先行词 + 从句缺什么', cat: 'attrib' },
    { id: 'l_attrib_choice', parent: 'attrib', title: '关系词的选择', cat: 'attrib', fine: 'attrib-choice' },
    { id: 'l_attrib_adverb', parent: 'attrib', title: '关系副词', cat: 'attrib', fine: 'attrib-adverb' },
    { id: 'l_attrib_prep', parent: 'attrib', title: '介词 + 关系代词', cat: 'attrib', fine: 'attrib-prep-relative' },
    { id: 'l_attrib_restr', parent: 'attrib', title: '限制性 vs 非限制性', cat: 'attrib', fine: 'attrib-restrictive-non' },
    { id: 'l_attrib_only_that', parent: 'attrib', title: '只能用 that', cat: 'attrib', fine: 'attrib-only-that' },

    { id: 'nounc', parent: 'rel', title: '名词性从句', sub: '整体作名词成分 → 判断作什么', cat: 'nounclause' },
    { id: 'l_nounc_subject', parent: 'nounc', title: '主语从句', cat: 'nounclause', fine: 'nounc-connectors' },
    { id: 'l_nounc_object', parent: 'nounc', title: '宾语从句', cat: 'nounclause', fine: 'nounc-reported' },
    { id: 'l_nounc_predicative', parent: 'nounc', title: '表语从句', cat: 'nounclause', fine: 'nounc-wh-words' },
    { id: 'l_nounc_appositive', parent: 'nounc', title: '同位语从句', cat: 'nounclause', fine: 'nounc-vs-appositive' },

    { id: 'advc', parent: 'rel', title: '状语从句', sub: '表逻辑关系 → 先说清中文逻辑', cat: 'advclause' },
    { id: 'l_advc_time', parent: 'advc', title: '时间', cat: 'advclause', fine: 'advc-time' },
    { id: 'l_advc_reason', parent: 'advc', title: '原因 / 地点', cat: 'advclause', fine: 'advc-reason-place' },
    { id: 'l_advc_cond', parent: 'advc', title: '条件 / 方式', cat: 'advclause', fine: 'advc-condition-manner' },
    { id: 'l_advc_purpose', parent: 'advc', title: '目的 / 结果', cat: 'advclause', fine: 'advc-purpose-result' },
    { id: 'l_advc_concession', parent: 'advc', title: '让步 / 比较', cat: 'advclause', fine: 'advc-concession-comparison' }
  ];

  window.GRAMMAR_DECISION_MAP = { rootId: 'root', nodes: NODES };
})();
