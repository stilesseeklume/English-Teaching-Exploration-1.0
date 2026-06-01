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
    // 时态：做题导向 6 叶——一般时按时间拆(靠时间标志)、进行/完成按体归(靠体的信号词)。point.keys 对齐 facets.tense。
    { id: 'pred_tense', parent: 'pred', title: '时态', sub: '先抓信号再定时态', kd: 'predicate-tense' },
    { id: 'l_tense_present',     parent: 'pred_tense', title: '一般现在',        cat: 'predicate', fine: 'pred-tense', point: { tag: 'pred-tense', keys: ['present'] } },
    { id: 'l_tense_past',        parent: 'pred_tense', title: '一般过去',        cat: 'predicate', fine: 'pred-tense', point: { tag: 'pred-tense', keys: ['past'] } },
    { id: 'l_tense_future',      parent: 'pred_tense', title: '一般将来·过去将来', cat: 'predicate', fine: 'pred-tense', point: { tag: 'pred-tense', keys: ['future', 'past-future'] } },
    { id: 'l_tense_progressive', parent: 'pred_tense', title: '进行体',          cat: 'predicate', fine: 'pred-tense', point: { tag: 'pred-tense', keys: ['progressive', 'present-progressive', 'past-progressive'] } },
    { id: 'l_tense_perfect',     parent: 'pred_tense', title: '完成体',          cat: 'predicate', fine: 'pred-tense', point: { tag: 'pred-tense', keys: ['perfect', 'past-perfect', 'future-perfect'] } },
    { id: 'l_tense_perfectprog', parent: 'pred_tense', title: '完成进行',        cat: 'predicate', fine: 'pred-tense', point: { tag: 'pred-tense', keys: ['perfect-progressive', 'past-perfect-progressive'] } },
    { id: 'pred_voice', parent: 'pred', title: '语态', sub: '主语是否承受动作？', kd: 'predicate-voice' },
    // l_voice_form 无 keys = keyless 通配，countByPoint 计全部被动；l_voice_implicit 用占位 key 故意计 0（主动表被动暂无数据信号，留后）
    { id: 'l_voice_form',     parent: 'pred_voice', title: '被动语态的构成', cat: 'predicate', fine: 'pred-passive', point: { tag: 'pred-passive' } },
    { id: 'l_voice_implicit', parent: 'pred_voice', title: '主动形式表被动', cat: 'predicate', fine: 'pred-passive', point: { tag: 'pred-passive', keys: ['__implicit__'] } },
    // 主谓一致并成一叶（语法形式/就近/集合/数量 题库无字段区分，原 4 叶重复计数）
    { id: 'pred_sva', parent: 'pred', title: '主谓一致', sub: '回到主语中心词', cat: 'predicate', fine: 'pred-agreement', kd: 'predicate-agreement' },

    // 非谓语：节点标签=形式，tag=形式（按引导词/形式一把尺子）
    { id: 'nonp', parent: 'verb', title: '非谓语', sub: '已有谓语 → 选形式（具体成分到题里判断）', cat: 'nonpredicate' },
    { id: 'l_nonp_todo', parent: 'nonp', title: 'to do', cat: 'nonpredicate', fine: 'nonpred-to-do' },
    { id: 'l_nonp_doing', parent: 'nonp', title: 'doing', cat: 'nonpredicate', fine: 'nonpred-doing' },
    { id: 'l_nonp_done', parent: 'nonp', title: 'done', cat: 'nonpredicate', fine: 'nonpred-done' },

    //   不作动词 → 变什么词（打散：名词/数词/形容词/副词/比较级 各自独立）
    { id: 'word', parent: 'clue', title: '不作动词', sub: '判断：要变成什么词、作什么成分？' },

    { id: 'noun', parent: 'word', title: '名词', sub: '名词位 → 看可数性、数、格', cat: 'number' },
    { id: 'l_noun_plural', parent: 'noun', title: '名词复数', cat: 'number', fine: 'num-plural' },
    { id: 'l_noun_poss', parent: 'noun', title: '名词所有格', cat: 'number', fine: 'num-possessive' },
    { id: 'l_noun_deriv', parent: 'noun', title: '派生成名词（动→名 / 形→名）', cat: 'word', fine: 'word-noun' },

    { id: 'numw', parent: 'word', title: '数词', sub: '数量 / 序数表达', cat: 'number' },
    { id: 'l_num_quantity', parent: 'numw', title: '数量的表示方法 / 数词', cat: 'number', fine: 'num-numeral' },

    // 派生形容词并成一叶（-ed/-ing + 常考辨析；删死 tag「形容词的选用 word-adj-vs-adv」，已与 adj/adv 重叠被官方删）
    { id: 'adj', parent: 'word', title: '派生形容词', sub: '-ed/-ing 形容词 · 常考辨析', cat: 'word', fine: 'word-adj', kd: 'word-adj-adv' },

    // 派生副词并成一叶（用法 · 常用副词 · 词组辨析）
    { id: 'adv', parent: 'word', title: '派生副词', sub: '副词用法 · 常用副词 · 词组辨析', cat: 'word', fine: 'word-adv', kd: 'word-adj-adv' },

    // 比较级/最高级按 facets.subtype 拆两叶（最高级暂无真题→灰，传新卷自动激活；删构成规则/倍数叶，无数据信号）
    { id: 'cmp', parent: 'word', title: '比较级 / 最高级', sub: 'than / much / the most 等信号触发', cat: 'word', kd: 'word-compare' },
    { id: 'l_cmp_comparative', parent: 'cmp', title: '比较级', cat: 'word', fine: 'word-comparative', point: { tag: 'word-comparative', keys: ['comparative'] } },
    { id: 'l_cmp_superlative', parent: 'cmp', title: '最高级', cat: 'word', fine: 'word-comparative', point: { tag: 'word-comparative', keys: ['superlative'] } },

    // ───────── 无提示词 · 考关系（四类：介词 / 冠词 / 代词 / 连词）─────────
    { id: 'noclue', parent: 'root', title: '无提示词', sub: '没给词 → 判断缺什么关系' },

    { id: 'prep', parent: 'noclue', title: '介词', sub: '词块搭配 / 时间地点等关系', cat: 'preposition' },
    { id: 'l_prep_common', parent: 'prep', title: '常见介词的用法', cat: 'preposition', fine: 'prep-common' },
    { id: 'l_prep_time', parent: 'prep', title: '时间介词辨析', cat: 'preposition', fine: 'prep-time' },
    { id: 'l_prep_loc', parent: 'prep', title: '地点 / 位置介词辨析', cat: 'preposition', fine: 'prep-place' },
    { id: 'l_prep_verb', parent: 'prep', title: '动介搭配', cat: 'preposition', fine: 'prep-collocation' },
    { id: 'l_prep_other', parent: 'prep', title: '其他介词辨析', cat: 'preposition', fine: 'prep-other' },

    { id: 'art', parent: 'noclue', title: '冠词', sub: '限定名词：可数性 / 特指泛指', cat: 'article' },
    { id: 'l_art_aan', parent: 'art', title: '不定冠词 a / an', cat: 'article', fine: 'art-a-an' },
    { id: 'l_art_the', parent: 'art', title: '定冠词 the', cat: 'article', fine: 'art-the' },
    // l_art_zero（不用冠词）已删除：新体系零冠词高考不考（spec §一之5）

    // 代词拆回标准 tag（原「人称/物主/反身/指示」并成一叶会让物主/指示题成孤儿；不定代词一/二并成一叶）
    { id: 'pron', parent: 'noclue', title: '代词', sub: '指代上下文 / 格 / 替代', cat: 'pronoun' },
    { id: 'l_pron_personal', parent: 'pron', title: '人称代词', cat: 'pronoun', fine: 'pron-personal' },
    { id: 'l_pron_possessive', parent: 'pron', title: '物主代词', cat: 'pronoun', fine: 'pron-possessive' },
    { id: 'l_pron_reflexive', parent: 'pron', title: '反身代词', cat: 'pronoun', fine: 'pron-reflexive' },
    { id: 'l_pron_demonstrative', parent: 'pron', title: '指示代词', cat: 'pronoun', fine: 'pron-demonstrative' },
    { id: 'l_pron_indefinite', parent: 'pron', title: '不定代词', cat: 'pronoun', fine: 'pron-indefinite' },
    { id: 'l_pron_it', parent: 'pron', title: '代词 it', cat: 'pronoun', fine: 'pron-it' },

    { id: 'conj', parent: 'noclue', title: '连词', sub: '判断：连同层成分，还是引出从句？' },
    // 并列连词并成一叶（原「短语并列/并列句」按句法切分、题库无字段区分、重复计数）；and/or/but/so 词级区分由 buildLeafWordBreakdown 在视图里展开
    { id: 'coord', parent: 'conj', title: '并列连词', sub: '连接同层词 / 短语 / 句子', cat: 'logic', fine: 'logic-coordinating', kd: 'logic-coord' },

    { id: 'rel', parent: 'conj', title: '关系词', sub: '引出从句 → 判断这是哪种从句' },
    { id: 'attrib', parent: 'rel', title: '定语从句', sub: '修饰名词：先行词 + 从句缺什么', cat: 'attrib' },
    // 关系代词并成一叶（原「选择/限制非限制/只能that」按教学概念切分、题库无字段区分、重复计数）；which/that/who/whose 词级区分由 buildLeafWordBreakdown 展开
    { id: 'l_attrib_choice', parent: 'attrib', title: '关系代词', cat: 'attrib', fine: 'attrib-pronoun' },
    { id: 'l_attrib_adverb', parent: 'attrib', title: '关系副词', cat: 'attrib', fine: 'attrib-adverb' },
    { id: 'l_attrib_prep',   parent: 'attrib', title: '介词 + 关系词', cat: 'attrib', fine: 'attrib-prep-relative' },

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
