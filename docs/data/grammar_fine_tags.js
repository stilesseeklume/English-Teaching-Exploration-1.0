// docs/data/grammar_fine_tags.js
//
// Seeklume 精细 tag 体系（Sprint 1 · Task 4 交付）
// 决策依据：docs/planning/knowledge-taxonomy.md §8
//
// 主考点 tag：101 个，按 13 个主类别组织
// 教学辅助 tag：5 个（句子结构基础，不参与迁移训练检索，仅做教学提示）
// 合计：106 个 tag
//
// 数据来源：语法通霸 22 大类 116 子节点 = 116 − 7（17 长难句，不属语法填空）
//          − 3（附录，参考资料）− 5（01 句子结构基础，归入 aux）= 101 主考点
//          + 8（09 情态动词，扩展类 12.modal）− 已含
//          + 12（10 虚拟 + 13 强调 + 14 倒装 + 16 特殊句式，合并到扩展类 13.special）− 已含
//
// 使用：window.GRAMMAR_FINE_TAGS.tags_by_id[id] 或 tags_by_category[cat]

(function () {
  var DATA = {
    version: '0.1.0',
    updated_at: '2026-05-17',
    source: '语法通霸 22 大类 116 子节点 + 13 主类决策（§8.1）',

    // ─── 13 主类别（11 原 + 2 扩展）+ 1 教学辅助类 ──────
    categories: {
      predicate:    { name: '谓语动词',     source: '语法通霸 11+12+15' },
      nonpredicate: { name: '非谓语动词',   source: '语法通霸 04' },
      word:         { name: '词性转换',     source: '语法通霸 02+03+22' },
      number:       { name: '名词/数词',    source: '语法通霸 18' },
      article:      { name: '冠词',         source: '语法通霸 19' },
      pronoun:      { name: '代词',         source: '语法通霸 20' },
      preposition:  { name: '介词',         source: '语法通霸 21' },
      logic:        { name: '逻辑连词',     source: '语法通霸 08' },
      attrib:       { name: '定语从句',     source: '语法通霸 05' },
      nounclause:   { name: '名词性从句',   source: '语法通霸 06' },
      advclause:    { name: '状语从句',     source: '语法通霸 07' },
      modal:        { name: '情态动词',     source: '语法通霸 09', extended: true },
      special:      { name: '其他特殊句式', source: '语法通霸 10+13+14+16', extended: true }
    },

    aux_categories: {
      structure: { name: '句子结构基础', source: '语法通霸 01', purpose: '教学辅助，不打考点 tag' }
    },

    // ─── 主考点 tag（101 个）──────────────────────
    tags: [
      // ───── predicate 谓语动词（12 个）─────
      // 语法通霸 11 动词的时态
      { id: 'pred-tense-present',          category: 'predicate', source: '语法通霸 11.01', name: '一般现在时' },
      { id: 'pred-tense-past-future',      category: 'predicate', source: '语法通霸 11.02', name: '一般过去时 / 将来时 / 过去将来时' },
      { id: 'pred-tense-continuous',       category: 'predicate', source: '语法通霸 11.03', name: '现在 / 过去 / 将来进行时' },
      { id: 'pred-tense-perfect',          category: 'predicate', source: '语法通霸 11.04', name: '现在完成时 / 现在完成进行时' },
      { id: 'pred-tense-past-perfect',     category: 'predicate', source: '语法通霸 11.05', name: '过去完成 / 过去完成进行 / 将来完成' },
      { id: 'pred-tense-other',            category: 'predicate', source: '语法通霸 11.06', name: '时态其他考点' },
      // 语法通霸 12 被动语态
      { id: 'pred-passive-form',           category: 'predicate', source: '语法通霸 12.01', name: '被动语态的构成' },
      { id: 'pred-passive-implicit',       category: 'predicate', source: '语法通霸 12.02', name: '主动形式表示被动意义' },
      // 语法通霸 15 主谓一致
      { id: 'pred-sva-form',               category: 'predicate', source: '语法通霸 15.01', name: '主谓一致 · 语法形式一致' },
      { id: 'pred-sva-meaning',            category: 'predicate', source: '语法通霸 15.02', name: '主谓一致 · 意义 / 就近一致' },
      { id: 'pred-sva-collective',         category: 'predicate', source: '语法通霸 15.03', name: '主谓一致 · 集合 / 复数 / -s 结尾名词作主语' },
      { id: 'pred-sva-quantity',           category: 'predicate', source: '语法通霸 15.04', name: '主谓一致 · 表数量的短语' },

      // ───── nonpredicate 非谓语动词（14 个）─────
      { id: 'nonp-basic',                  category: 'nonpredicate', source: '语法通霸 04.01', name: '非谓语 · 基础知识' },
      { id: 'nonp-subject-predicative',    category: 'nonpredicate', source: '语法通霸 04.02', name: '非谓语作主语 / 表语' },
      { id: 'nonp-object',                 category: 'nonpredicate', source: '语法通霸 04.03', name: '非谓语作宾语' },
      { id: 'nonp-attribute',              category: 'nonpredicate', source: '语法通霸 04.04', name: '非谓语作定语' },
      { id: 'nonp-adverbial-1',            category: 'nonpredicate', source: '语法通霸 04.05', name: '非谓语作状语（一）' },
      { id: 'nonp-adverbial-2',            category: 'nonpredicate', source: '语法通霸 04.06', name: '非谓语作状语（二）' },
      { id: 'nonp-conj-elision',           category: 'nonpredicate', source: '语法通霸 04.07', name: '连词 + 非谓语 / 省略句' },
      { id: 'nonp-complement',             category: 'nonpredicate', source: '语法通霸 04.08', name: '非谓语作补语' },
      { id: 'nonp-perfect-passive-neg',    category: 'nonpredicate', source: '语法通霸 04.09', name: '非谓语的完成式 / 进行式 / 被动式 / 否定式' },
      { id: 'nonp-said-to-do',             category: 'nonpredicate', source: '语法通霸 04.10', name: 'somebody is said to do 句式' },
      { id: 'nonp-compound-structure',     category: 'nonpredicate', source: '语法通霸 04.11', name: '动词不定式 / 动名词的复合结构' },
      { id: 'nonp-absolute-with',          category: 'nonpredicate', source: '语法通霸 04.12', name: '独立主格 / with 的复合结构' },
      { id: 'nonp-therebe',                category: 'nonpredicate', source: '语法通霸 04.13', name: 'there be 句型与非谓语' },
      { id: 'nonp-other',                  category: 'nonpredicate', source: '语法通霸 04.14', name: '非谓语其他考点' },

      // ───── word 词性转换（14 个）─────
      // 语法通霸 02 形容词和副词
      { id: 'word-adj-adv-choice',         category: 'word', source: '语法通霸 02.01', name: '形容词和副词的选用' },
      { id: 'word-ed-ing',                 category: 'word', source: '语法通霸 02.02', name: '-ed 形容词 vs -ing 形容词' },
      { id: 'word-adj-adv-other',          category: 'word', source: '语法通霸 02.03', name: '形/副其他相关考点' },
      { id: 'word-common-adj-adv',         category: 'word', source: '语法通霸 02.04', name: '几个常用形/副的用法' },
      { id: 'word-adj-adv-distinguish',    category: 'word', source: '语法通霸 02.05', name: '几组常考形/副的区别' },
      { id: 'word-adj-adv-phrase',         category: 'word', source: '语法通霸 02.06', name: '几组常考形/副词组的区别' },
      // 语法通霸 03 比较等级
      { id: 'word-cmp-rules',              category: 'word', source: '语法通霸 03.01', name: '比较级 / 最高级构成规则及 than/as 词性' },
      { id: 'word-cmp-comparative',        category: 'word', source: '语法通霸 03.02', name: '比较级' },
      { id: 'word-cmp-superlative',        category: 'word', source: '语法通霸 03.03', name: '最高级' },
      { id: 'word-cmp-multiple',           category: 'word', source: '语法通霸 03.04', name: '倍数表达法 / 类比' },
      // 语法通霸 22 动词和短语动词
      { id: 'word-phrasal-1',              category: 'word', source: '语法通霸 22.01', name: '常用短语动词（一）' },
      { id: 'word-phrasal-2',              category: 'word', source: '语法通霸 22.02', name: '常用短语动词（二）' },
      { id: 'word-phrasal-other',          category: 'word', source: '语法通霸 22.03', name: '其他常考短语动词和惯用表达' },
      { id: 'word-verb-usage',             category: 'word', source: '语法通霸 22.04', name: '常考动词的用法' },

      // ───── number 名词/数词（4 个）─────
      // 注：sup 语法通霸 18 在我们 Seeklume "number" 类里扩展含义为"名词 + 数词形态变化"
      { id: 'num-countable',               category: 'number', source: '语法通霸 18.01', name: '可数名词 vs 不可数名词' },
      { id: 'num-plural',                  category: 'number', source: '语法通霸 18.02', name: '名词复数形式' },
      { id: 'num-quantity',                category: 'number', source: '语法通霸 18.03', name: '名词的量的表示方法 / 数词' },
      { id: 'num-possessive',              category: 'number', source: '语法通霸 18.04', name: '名词所有格' },

      // ───── article 冠词（5 个）─────
      { id: 'art-specific-indefinite',     category: 'article', source: '语法通霸 19.01', name: '冠词的特指 / 独指 / 类指' },
      { id: 'art-a-an',                    category: 'article', source: '语法通霸 19.02', name: '不定冠词 a / an 的基本用法' },
      { id: 'art-the',                     category: 'article', source: '语法通霸 19.03', name: '定冠词 the 的基本用法' },
      { id: 'art-zero',                    category: 'article', source: '语法通霸 19.04', name: '不用冠词的情况' },
      { id: 'art-other',                   category: 'article', source: '语法通霸 19.05', name: '冠词其他考点' },

      // ───── pronoun 代词（4 个）─────
      { id: 'pron-personal-possessive',    category: 'pronoun', source: '语法通霸 20.01', name: '人称 / 物主 / 反身 / 指示代词' },
      { id: 'pron-indefinite-1',           category: 'pronoun', source: '语法通霸 20.02', name: '不定代词（一）' },
      { id: 'pron-indefinite-2',           category: 'pronoun', source: '语法通霸 20.03', name: '不定代词（二）' },
      { id: 'pron-it',                     category: 'pronoun', source: '语法通霸 20.04', name: '代词 it 的常考点' },

      // ───── preposition 介词（6 个）─────
      { id: 'prep-overview',               category: 'preposition', source: '语法通霸 21.01', name: '介词概述' },
      { id: 'prep-common',                 category: 'preposition', source: '语法通霸 21.02', name: '常见介词的常见用法' },
      { id: 'prep-time',                   category: 'preposition', source: '语法通霸 21.03', name: '介词辨析 · 时间' },
      { id: 'prep-location',               category: 'preposition', source: '语法通霸 21.04', name: '介词辨析 · 地点位置' },
      { id: 'prep-verb',                   category: 'preposition', source: '语法通霸 21.05', name: '介词辨析 · 动介搭配' },
      { id: 'prep-other',                  category: 'preposition', source: '语法通霸 21.06', name: '介词辨析 · 其他' },

      // ───── logic 逻辑连词（2 个）─────
      { id: 'logic-conj-phrase',           category: 'logic', source: '语法通霸 08.01', name: '连接词或短语的并列连词' },
      { id: 'logic-compound',              category: 'logic', source: '语法通霸 08.02', name: '并列句' },

      // ───── attrib 定语从句（10 个）─────
      { id: 'attrib-choice',               category: 'attrib', source: '语法通霸 05.01', name: '关系词的选择技巧' },
      { id: 'attrib-adverb',               category: 'attrib', source: '语法通霸 05.02', name: '关系副词' },
      { id: 'attrib-prep-relative',        category: 'attrib', source: '语法通霸 05.03', name: '介词 + 关系代词' },
      { id: 'attrib-only-that',            category: 'attrib', source: '语法通霸 05.04', name: '只能用 that 不能用 which 的情况' },
      { id: 'attrib-other-rules',          category: 'attrib', source: '语法通霸 05.05', name: '其他关系代词选择规则' },
      { id: 'attrib-as-but-than',          category: 'attrib', source: '语法通霸 05.06', name: 'as / but / than 用作关系代词' },
      { id: 'attrib-restrictive-non',      category: 'attrib', source: '语法通霸 05.07', name: '限制性 vs 非限制性定语从句' },
      { id: 'attrib-vs-appositive',        category: 'attrib', source: '语法通霸 05.08', name: '同位语从句 vs 定语从句' },
      { id: 'attrib-confusing',            category: 'attrib', source: '语法通霸 05.09', name: '定语从句与易混句型' },
      { id: 'attrib-other',                category: 'attrib', source: '语法通霸 05.10', name: '定语从句其他常见考点' },

      // ───── nounclause 名词性从句（5 个）─────
      { id: 'nounc-connectors',            category: 'nounclause', source: '语法通霸 06.01', name: '引导名词性从句的连接词' },
      { id: 'nounc-vs-appositive',         category: 'nounclause', source: '语法通霸 06.02', name: '同位语从句 vs 定语从句（区别）' },
      { id: 'nounc-wh-words',              category: 'nounclause', source: '语法通霸 06.03', name: 'what / when / where / how / why 引导' },
      { id: 'nounc-ever-words',            category: 'nounclause', source: '语法通霸 06.04', name: 'whatever / whoever / whichever / whenever / wherever / however' },
      { id: 'nounc-reported',              category: 'nounclause', source: '语法通霸 06.05', name: '间直引语（宾语从句）' },

      // ───── advclause 状语从句（5 个）─────
      { id: 'advc-time',                   category: 'advclause', source: '语法通霸 07.01', name: '时间状语从句' },
      { id: 'advc-reason-place',           category: 'advclause', source: '语法通霸 07.02', name: '原因 / 地点状语从句' },
      { id: 'advc-condition-manner',       category: 'advclause', source: '语法通霸 07.03', name: '条件 / 方式状语从句' },
      { id: 'advc-purpose-result',         category: 'advclause', source: '语法通霸 07.04', name: '目的 / 结果状语从句' },
      { id: 'advc-concession-comparison',  category: 'advclause', source: '语法通霸 07.05', name: '让步 / 比较状语从句' },

      // ───── modal 情态动词（8 个，扩展类）─────
      { id: 'modal-features',              category: 'modal', source: '语法通霸 09.01', name: '情态动词的语法特征' },
      { id: 'modal-speculation-overview',  category: 'modal', source: '语法通霸 09.02', name: '情态动词推测性用法概述' },
      { id: 'modal-bare-infinitive',       category: 'modal', source: '语法通霸 09.03', name: '情态 + 动词原形（推测现在/将来）' },
      { id: 'modal-have-done',             category: 'modal', source: '语法通霸 09.04', name: '情态 + have done（推测过去）' },
      { id: 'modal-subjunctive',           category: 'modal', source: '语法通霸 09.05', name: '情态动词用于虚拟语气' },
      { id: 'modal-can-other',             category: 'modal', source: '语法通霸 09.06', name: 'can 的其他用法' },
      { id: 'modal-may-must',              category: 'modal', source: '语法通霸 09.07', name: 'may / must 的其他用法' },
      { id: 'modal-will-shall-would-should', category: 'modal', source: '语法通霸 09.08', name: 'will / shall / would / should / used to 的用法' },

      // ───── special 其他特殊句式（12 个，扩展类）─────
      // 虚拟语气（5 from 语法通霸 10）
      { id: 'special-subj-wish',           category: 'special', source: '语法通霸 10.01', name: '虚拟 · 用过去时态表愿望' },
      { id: 'special-subj-if',             category: 'special', source: '语法通霸 10.02', name: '虚拟 · 条件句表假设' },
      { id: 'special-subj-implicit',       category: 'special', source: '语法通霸 10.03', name: '虚拟 · 含蓄条件句' },
      { id: 'special-subj-should-bare',    category: 'special', source: '语法通霸 10.04', name: '虚拟 · should + 原形表建议/命令' },
      { id: 'special-subj-should-surprise',category: 'special', source: '语法通霸 10.05', name: '虚拟 · should 表意外/吃惊' },
      // 强调（2 from 语法通霸 13）
      { id: 'special-emph-basic',          category: 'special', source: '语法通霸 13.01', name: '强调句基础知识' },
      { id: 'special-emph-common',         category: 'special', source: '语法通霸 13.02', name: '强调句常见考点' },
      // 倒装（2 from 语法通霸 14）
      { id: 'special-inv-full',            category: 'special', source: '语法通霸 14.01', name: '完全倒装' },
      { id: 'special-inv-partial',         category: 'special', source: '语法通霸 14.02', name: '部分倒装' },
      // 特殊句式（3 from 语法通霸 16）
      { id: 'special-tag-question',        category: 'special', source: '语法通霸 16.01', name: '反意疑问句' },
      { id: 'special-negation-exclam',     category: 'special', source: '语法通霸 16.02', name: '否定转移 / 感叹句' },
      { id: 'special-substitution-ellipsis', category: 'special', source: '语法通霸 16.03', name: '替代与省略' }
    ],

    // ─── 教学辅助 tag（5 个，不参与迁移训练，仅做教学提示）─────
    aux_tags: [
      { id: 'struct-concepts',             category: 'structure', source: '语法通霸 01.01', name: '句子结构 · 相关概念' },
      { id: 'struct-five-patterns',        category: 'structure', source: '语法通霸 01.02', name: '简单句的五种基本结构' },
      { id: 'struct-components-1',         category: 'structure', source: '语法通霸 01.03', name: '句子成分（一）' },
      { id: 'struct-components-2',         category: 'structure', source: '语法通霸 01.04', name: '句子成分（二）' },
      { id: 'struct-simple-compound-complex', category: 'structure', source: '语法通霸 01.05', name: '简单句 / 并列句 / 复合句' }
    ],

    // ─── 教材进度对照（视图 B，35 unit）─────
    // 来源：人教版 7 册 grammar 教学点 + knowledge-taxonomy.md §3
    textbook_units: [
      { book: '必修一', unit: 'Welcome', grammar_en: 'Basic sentence structures', grammar_zh: '基本句子结构', maps_to: ['aux:struct-five-patterns', 'aux:struct-simple-compound-complex'] },
      { book: '必修一', unit: 'U1', topic: 'Teenage Life', grammar_en: 'Noun/adjective/adverb phrases', grammar_zh: '名词/形容词/副词短语', maps_to: ['aux:struct-components-1', 'word-adj-adv-other'] },
      { book: '必修一', unit: 'U2', topic: 'Travelling Around', grammar_en: 'Present continuous (future plans)', grammar_zh: '现在进行时表将来', maps_to: ['pred-tense-continuous'] },
      { book: '必修一', unit: 'U3', topic: 'Sports and Fitness', grammar_en: 'Tag questions', grammar_zh: '反意疑问句', maps_to: ['special-tag-question'] },
      { book: '必修一', unit: 'U4', topic: 'Natural Disasters', grammar_en: 'Restrictive relative clauses (1)', grammar_zh: '限制性定语从句（1）', maps_to: ['attrib-choice', 'attrib-only-that'] },
      { book: '必修一', unit: 'U5', topic: 'Languages Around the World', grammar_en: 'Restrictive relative clauses (2)', grammar_zh: '限制性定语从句（2）', maps_to: ['attrib-adverb', 'attrib-prep-relative'] },
      { book: '必修二', unit: 'U1', topic: 'Cultural Heritage', grammar_en: 'Restrictive relative clauses (3)', grammar_zh: '限制性定语从句（3）', maps_to: ['attrib-other-rules', 'attrib-other'] },
      { book: '必修二', unit: 'U2', topic: 'Wildlife Protection', grammar_en: 'Present continuous passive voice', grammar_zh: '现在进行时被动语态', maps_to: ['pred-tense-continuous', 'pred-passive-form'] },
      { book: '必修二', unit: 'U3', topic: 'The Internet', grammar_en: 'Present perfect passive voice', grammar_zh: '现在完成时被动语态', maps_to: ['pred-tense-perfect', 'pred-passive-form'] },
      { book: '必修二', unit: 'U4', topic: 'History and Traditions', grammar_en: 'Past participles (1) attribute/object complement', grammar_zh: '过去分词作定语和宾补', maps_to: ['nonp-attribute', 'nonp-complement'] },
      { book: '必修二', unit: 'U5', topic: 'Music', grammar_en: 'Past participles (2) predicative/adverbial', grammar_zh: '过去分词作表语和状语', maps_to: ['nonp-subject-predicative', 'nonp-adverbial-1'] },
      { book: '必修三', unit: 'U1', topic: 'Festivals and Celebrations', grammar_en: '-ing form (1) attribute/predicative', grammar_zh: '-ing 作定语和表语', maps_to: ['nonp-attribute', 'nonp-subject-predicative'] },
      { book: '必修三', unit: 'U2', topic: 'Morals and Virtues', grammar_en: '-ing form (2) object complement/adverbial', grammar_zh: '-ing 作宾补和状语', maps_to: ['nonp-complement', 'nonp-adverbial-1'] },
      { book: '必修三', unit: 'U3', topic: 'Diverse Cultures', grammar_en: 'Ellipsis', grammar_zh: '省略', maps_to: ['special-substitution-ellipsis'] },
      { book: '必修三', unit: 'U4', topic: 'Space Exploration', grammar_en: 'Infinitives (1) attribute/adverbial', grammar_zh: '不定式作定语和状语', maps_to: ['nonp-attribute', 'nonp-adverbial-1'] },
      { book: '必修三', unit: 'U5', topic: 'The Value of Money', grammar_en: 'Review of modal verbs / Past future tense', grammar_zh: '情态动词复习 / 过去将来时', maps_to: ['modal-features', 'pred-tense-past-future'] },
      { book: '选必一', unit: 'U1', topic: 'People of Achievement', grammar_en: 'Non-restrictive relative clauses', grammar_zh: '非限制性定语从句', maps_to: ['attrib-restrictive-non'] },
      { book: '选必一', unit: 'U2', topic: 'Looking into the Future', grammar_en: 'Future progressive tense', grammar_zh: '将来进行时', maps_to: ['pred-tense-continuous'] },
      { book: '选必一', unit: 'U3', topic: 'Fascinating Parks', grammar_en: '-ing form (3) as subject', grammar_zh: '-ing 作主语', maps_to: ['nonp-subject-predicative'] },
      { book: '选必一', unit: 'U4', topic: 'Body Language', grammar_en: '-ing form (4) as object/predicative', grammar_zh: '-ing 作宾语/表语', maps_to: ['nonp-object', 'nonp-subject-predicative'] },
      { book: '选必一', unit: 'U5', topic: 'Working the Land', grammar_en: 'Subject clauses', grammar_zh: '主语从句', maps_to: ['nounc-connectors', 'nounc-wh-words'] },
      { book: '选必二', unit: 'U1', topic: 'Science and Scientists', grammar_en: 'Predicative clauses', grammar_zh: '表语从句', maps_to: ['nounc-connectors'] },
      { book: '选必二', unit: 'U2', topic: 'Bridging Cultures', grammar_en: 'Review of noun clauses', grammar_zh: '名词性从句复习', maps_to: ['nounc-connectors', 'nounc-wh-words', 'nounc-reported'] },
      { book: '选必二', unit: 'U3', topic: 'Food and Culture', grammar_en: 'Past perfect tense / Past perfect passive', grammar_zh: '过去完成时及其被动', maps_to: ['pred-tense-past-perfect', 'pred-passive-form'] },
      { book: '选必二', unit: 'U4', topic: 'Journey Across a Vast Land', grammar_en: 'Past participles vs -ing form', grammar_zh: '过去分词 vs -ing', maps_to: ['nonp-attribute', 'nonp-adverbial-1'] },
      { book: '选必二', unit: 'U5', topic: 'First Aid', grammar_en: 'Review of -ing form', grammar_zh: '-ing 复习', maps_to: ['nonp-basic'] },
      { book: '选必三', unit: 'U1', topic: 'Art', grammar_en: 'Infinitives (2) as predicative', grammar_zh: '不定式作表语', maps_to: ['nonp-subject-predicative'] },
      { book: '选必三', unit: 'U2', topic: 'Healthy Lifestyle', grammar_en: 'Infinitives (3) as subject', grammar_zh: '不定式作主语', maps_to: ['nonp-subject-predicative'] },
      { book: '选必三', unit: 'U3', topic: 'Environmental Protection', grammar_en: 'Direct/indirect speech', grammar_zh: '直接/间接引语', maps_to: ['nounc-reported'] },
      { book: '选必三', unit: 'U4', topic: 'Adversity and Courage', grammar_en: 'Present perfect continuous / Review of tenses', grammar_zh: '现在完成进行 / 时态复习', maps_to: ['pred-tense-perfect', 'pred-tense-other'] },
      { book: '选必三', unit: 'U5', topic: 'Poems', grammar_en: 'Review of relative clauses', grammar_zh: '定语从句复习', maps_to: ['attrib-other'] },
      { book: '选必四', unit: 'U1', topic: 'Science Fiction', grammar_en: 'Review of passive voice', grammar_zh: '被动语态复习', maps_to: ['pred-passive-form', 'pred-passive-implicit'] },
      { book: '选必四', unit: 'U2', topic: 'Iconic Attractions', grammar_en: 'Review of past participles', grammar_zh: '过去分词复习', maps_to: ['nonp-attribute', 'nonp-subject-predicative'] },
      { book: '选必四', unit: 'U3', topic: 'Sea Exploration', grammar_en: 'Review of infinitive', grammar_zh: '不定式复习', maps_to: ['nonp-basic'] },
      { book: '选必四', unit: 'U4', topic: 'Sharing', grammar_en: 'Review of phrases', grammar_zh: '短语复习', maps_to: ['word-phrasal-1', 'word-phrasal-2'] },
      { book: '选必四', unit: 'U5', topic: 'Launching Your Career', grammar_en: 'Review of long sentences', grammar_zh: '长难句复习', maps_to: ['attrib-other', 'advc-time'] }
    ]
  };

  // ─── 启动时建立索引 ─────
  DATA.tags_by_id = {};
  DATA.tags_by_category = {};
  DATA.tags.forEach(function (t) {
    DATA.tags_by_id[t.id] = t;
    if (!DATA.tags_by_category[t.category]) DATA.tags_by_category[t.category] = [];
    DATA.tags_by_category[t.category].push(t);
  });
  DATA.aux_tags.forEach(function (t) {
    DATA.tags_by_id[t.id] = t;
  });

  // 反向索引：tag → 教材 unit
  DATA.tag_to_units = {};
  DATA.textbook_units.forEach(function (u) {
    (u.maps_to || []).forEach(function (tagId) {
      if (!DATA.tag_to_units[tagId]) DATA.tag_to_units[tagId] = [];
      DATA.tag_to_units[tagId].push({ book: u.book, unit: u.unit, topic: u.topic });
    });
  });

  // ─── 统计 ─────
  DATA.stats = {
    main_categories: Object.keys(DATA.categories).length,        // 13
    aux_categories: Object.keys(DATA.aux_categories).length,     // 1
    main_tags: DATA.tags.length,                                 // 101
    aux_tags: DATA.aux_tags.length,                              // 5
    textbook_units: DATA.textbook_units.length                   // 36
  };

  window.GRAMMAR_FINE_TAGS = DATA;
})();
