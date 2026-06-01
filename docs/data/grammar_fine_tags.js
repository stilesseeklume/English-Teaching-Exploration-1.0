// docs/data/grammar_fine_tags.js
//
// Seeklume 精细 tag 体系（体系重订 2026-05-31）
// 决策依据：按引导词/形式一把尺子，不再按功能分类
//
// 主考点 tag：57 个，按 13 个主类别组织（2026-06-01 重订：冠词3+零·代词6·词性5·定从5）
// 教学辅助 tag：5 个（句子结构基础，不参与迁移训练检索，仅做教学提示）
// 合计：62 个 tag（主标 57 + 教学辅助 5）
//
// 旧体系（101 个，按功能分）已存档：见 git 历史 2026-05-31 之前
//
// 使用：window.GRAMMAR_FINE_TAGS.tags_by_id[id] 或 tags_by_category[cat]

(function () {
  var DATA = {
    version: '0.3.0',
    updated_at: '2026-06-01',
    source: '体系重订 2026-05-31：按引导词/形式一把尺子，13 类 57 个主标',

    // ─── 13 主类别（11 原 + 2 扩展）+ 1 教学辅助类 ──────
    categories: {
      predicate:    { name: '谓语动词',     source: '语法通霸 11+12+15' },
      nonpredicate: { name: '非谓语动词',   source: '语法通霸 04' },
      word:         { name: '词性转换',     source: '语法通霸 02+03+22' },
      number:       { name: '名词/数词',    source: '语法通霸 18' },
      article:      { name: '冠词',         source: '语法通霸 19' },
      pronoun:      { name: '代词',         source: '语法通霸 20' },
      preposition:  { name: '介词',         source: '语法通霸 21', core_words: ['in','on','at','for','with','of','by','from','to'] },
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

    // ─── 主考点 tag（57 个，体系重订 2026-06-01）──────────────────────
    tags: [
      // predicate 谓语动词（3）
      { id: 'pred-tense',        category: 'predicate',    source: '体系重订2026-05-31', name: '时态（现在/过去/将来/进行/完成）' },
      { id: 'pred-passive',      category: 'predicate',    source: '体系重订2026-05-31', name: '被动语态' },
      { id: 'pred-agreement',    category: 'predicate',    source: '体系重订2026-05-31', name: '主谓一致' },
      // nonpredicate 非谓语（3）
      { id: 'nonpred-to-do',     category: 'nonpredicate', source: '体系重订2026-05-31', name: '不定式 to do' },
      { id: 'nonpred-doing',     category: 'nonpredicate', source: '体系重订2026-05-31', name: '现在分词 doing' },
      { id: 'nonpred-done',      category: 'nonpredicate', source: '体系重订2026-05-31', name: '过去分词 done' },
      // word 词性转换（5：删 adj-vs-adv，与 adj/adv 重叠）
      { id: 'word-noun',         category: 'word', source: '体系重订2026-05-31', name: '派生名词（含动名词）' },
      { id: 'word-adj',          category: 'word', source: '体系重订2026-05-31', name: '派生形容词（含 -ed/-ing 形容词）' },
      { id: 'word-adv',          category: 'word', source: '体系重订2026-05-31', name: '派生副词（含 hard/hardly 等易混词对）' },
      { id: 'word-verb',         category: 'word', source: '体系重订2026-05-31', name: '派生动词' },
      { id: 'word-comparative',  category: 'word', source: '体系重订2026-05-31', name: '比较级/最高级' },
      // number 名词/数词（3）
      { id: 'num-plural',        category: 'number', source: '体系重订2026-05-31', name: '名词复数' },
      { id: 'num-possessive',    category: 'number', source: '体系重订2026-05-31', name: '名词所有格' },
      { id: 'num-numeral',       category: 'number', source: '体系重订2026-05-31', name: '数词（基数/序数/倍数）' },
      // article 冠词（3 tag：a/an 同 tag 但 points.key 区分(学生易错点)；零冠词几乎不考但保留显完整）
      { id: 'art-a-an',          category: 'article', source: '体系重订2026-05-31', name: '不定冠词 a/an', words: ['a','an'] },
      { id: 'art-the',           category: 'article', source: '体系重订2026-05-31', name: '定冠词 the', words: ['the'] },
      { id: 'art-zero',          category: 'article', source: '体系重订2026-06-01', name: '零冠词', frequency: '几乎不考' },
      // pronoun 代词（6：人称/物主/反身/指示拆开）
      { id: 'pron-personal',      category: 'pronoun', source: '体系重订2026-06-01', name: '人称代词（主格/宾格）' },
      { id: 'pron-possessive',    category: 'pronoun', source: '体系重订2026-06-01', name: '物主代词（形容性/名词性）' },
      { id: 'pron-reflexive',     category: 'pronoun', source: '体系重订2026-06-01', name: '反身代词' },
      { id: 'pron-demonstrative', category: 'pronoun', source: '体系重订2026-06-01', name: '指示代词' },
      { id: 'pron-indefinite',    category: 'pronoun', source: '体系重订2026-05-31', name: '不定代词' },
      { id: 'pron-it',            category: 'pronoun', source: '体系重订2026-05-31', name: '形式 it（形式主宾/强调）' },
      // preposition 介词（5）
      { id: 'prep-common',       category: 'preposition', source: '语法通霸21.02', name: '常见介词的常见用法（as/by/for/in/on…）' },
      { id: 'prep-time',         category: 'preposition', source: '语法通霸21.03', name: '介词辨析·时间' },
      { id: 'prep-place',        category: 'preposition', source: '语法通霸21.04', name: '介词辨析·地点位置' },
      { id: 'prep-collocation',  category: 'preposition', source: '语法通霸21.05', name: '介词辨析·动介搭配（动词+介词）' },
      { id: 'prep-other',        category: 'preposition', source: '语法通霸21.06', name: '介词辨析·其他（穿衣/工具/原因/be+adj+prep）' },
      // logic 逻辑连词（1）
      { id: 'logic-coordinating',category: 'logic', source: '语法通霸08', name: '并列连词（and/but/or/so；含 both…and 等关联结构，由 facets.kind 区分）', words: ['and','but','or','so','for','nor','yet'] },
      // attrib 定语从句（5：加 only-that）
      { id: 'attrib-pronoun',      category: 'attrib', source: '体系重订2026-05-31', name: '关系代词（who/whom/which/that/whose）', words: ['who','whom','which','that','whose'] },
      { id: 'attrib-adverb',       category: 'attrib', source: '体系重订2026-05-31', name: '关系副词（when/where/why）', words: ['when','where','why'] },
      { id: 'attrib-prep-relative',category: 'attrib', source: '体系重订2026-05-31', name: '介词+关系词', words: ['介词+which','介词+whom'] },
      { id: 'attrib-as',           category: 'attrib', source: '体系重订2026-05-31', name: 'as 作关系词（but/than 罕见,基本不考）', words: ['as','but','than'] },
      { id: 'attrib-only-that',    category: 'attrib', source: '体系重订2026-06-01', name: '只能用 that（先行词含 all/最高级/序数/the only、人+物并列…）', words: ['that'] },
      // nounclause 名词性从句（5）
      { id: 'nounc-that',        category: 'nounclause', source: '体系重订2026-05-31', name: 'that 引导', words: ['that'] },
      { id: 'nounc-whether-if',  category: 'nounclause', source: '体系重订2026-05-31', name: 'whether/if 引导', words: ['whether','if'] },
      { id: 'nounc-wh-pronoun',  category: 'nounclause', source: '体系重订2026-05-31', name: '连接代词（what/who/which）', words: ['what','who','which','whom','whose'] },
      { id: 'nounc-wh-adverb',   category: 'nounclause', source: '体系重订2026-05-31', name: '连接副词（when/where/how/why）', words: ['when','where','how','why'] },
      { id: 'nounc-ever',        category: 'nounclause', source: '体系重订2026-05-31', name: 'wh-ever 类（whatever/whoever…）', words: ['whatever','whoever','whichever','whomever','whenever','wherever','however'] },
      // advclause 状语从句（9）
      { id: 'advc-time',        category: 'advclause', source: '体系重订2026-05-31', name: '时间状语从句' },
      { id: 'advc-cause',       category: 'advclause', source: '体系重订2026-05-31', name: '原因状语从句' },
      { id: 'advc-place',       category: 'advclause', source: '体系重订2026-05-31', name: '地点状语从句' },
      { id: 'advc-condition',   category: 'advclause', source: '体系重订2026-05-31', name: '条件状语从句' },
      { id: 'advc-manner',      category: 'advclause', source: '体系重订2026-05-31', name: '方式状语从句' },
      { id: 'advc-concession',  category: 'advclause', source: '体系重订2026-05-31', name: '让步状语从句' },
      { id: 'advc-comparison',  category: 'advclause', source: '体系重订2026-05-31', name: '比较状语从句' },
      { id: 'advc-purpose',     category: 'advclause', source: '体系重订2026-05-31', name: '目的状语从句' },
      { id: 'advc-result',      category: 'advclause', source: '体系重订2026-05-31', name: '结果状语从句' },
      // modal 情态动词（4）
      { id: 'modal-speculation',        category: 'modal', source: '体系重订2026-05-31', name: '推测用法' },
      { id: 'modal-ability-permission', category: 'modal', source: '体系重订2026-05-31', name: '能力/许可' },
      { id: 'modal-advice-obligation',  category: 'modal', source: '体系重订2026-05-31', name: '建议/义务' },
      { id: 'modal-other',              category: 'modal', source: '体系重订2026-05-31', name: '其他情态用法' },
      // special 特殊句式（5）
      { id: 'special-subjunctive',  category: 'special', source: '体系重订2026-05-31', name: '虚拟语气' },
      { id: 'special-emphasis',     category: 'special', source: '体系重订2026-05-31', name: '强调句' },
      { id: 'special-inversion',    category: 'special', source: '体系重订2026-05-31', name: '倒装' },
      { id: 'special-tag-question', category: 'special', source: '体系重订2026-05-31', name: '反意疑问句' },
      { id: 'special-ellipsis',     category: 'special', source: '体系重订2026-05-31', name: '省略与替代' }
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
      { book: '必修一', unit: 'Welcome', grammar_en: 'Basic sentence structures', grammar_zh: '基本句子结构', maps_to: ['struct-five-patterns', 'struct-simple-compound-complex'] },
      { book: '必修一', unit: 'U1', topic: 'Teenage Life', grammar_en: 'Noun/adjective/adverb phrases', grammar_zh: '名词/形容词/副词短语', maps_to: ['struct-components-1', 'word-adj'] },
      { book: '必修一', unit: 'U2', topic: 'Travelling Around', grammar_en: 'Present continuous (future plans)', grammar_zh: '现在进行时表将来', maps_to: ['pred-tense'] },
      { book: '必修一', unit: 'U3', topic: 'Sports and Fitness', grammar_en: 'Tag questions', grammar_zh: '反意疑问句', maps_to: ['special-tag-question'] },
      { book: '必修一', unit: 'U4', topic: 'Natural Disasters', grammar_en: 'Restrictive relative clauses (1)', grammar_zh: '限制性定语从句（1）', maps_to: ['attrib-pronoun', 'attrib-only-that'] },
      { book: '必修一', unit: 'U5', topic: 'Languages Around the World', grammar_en: 'Restrictive relative clauses (2)', grammar_zh: '限制性定语从句（2）', maps_to: ['attrib-adverb', 'attrib-prep-relative'] },
      { book: '必修二', unit: 'U1', topic: 'Cultural Heritage', grammar_en: 'Restrictive relative clauses (3)', grammar_zh: '限制性定语从句（3）', maps_to: ['attrib-pronoun', 'attrib-pronoun'] },
      { book: '必修二', unit: 'U2', topic: 'Wildlife Protection', grammar_en: 'Present continuous passive voice', grammar_zh: '现在进行时被动语态', maps_to: ['pred-tense', 'pred-passive'] },
      { book: '必修二', unit: 'U3', topic: 'The Internet', grammar_en: 'Present perfect passive voice', grammar_zh: '现在完成时被动语态', maps_to: ['pred-tense', 'pred-passive'] },
      { book: '必修二', unit: 'U4', topic: 'History and Traditions', grammar_en: 'Past participles (1) attribute/object complement', grammar_zh: '过去分词作定语和宾补', maps_to: ['nonpred-done', 'nonpred-doing'] },
      { book: '必修二', unit: 'U5', topic: 'Music', grammar_en: 'Past participles (2) predicative/adverbial', grammar_zh: '过去分词作表语和状语', maps_to: ['nonpred-to-do', 'nonpred-doing'] },
      { book: '必修三', unit: 'U1', topic: 'Festivals and Celebrations', grammar_en: '-ing form (1) attribute/predicative', grammar_zh: '-ing 作定语和表语', maps_to: ['nonpred-done', 'nonpred-to-do'] },
      { book: '必修三', unit: 'U2', topic: 'Morals and Virtues', grammar_en: '-ing form (2) object complement/adverbial', grammar_zh: '-ing 作宾补和状语', maps_to: ['nonpred-doing', 'nonpred-doing'] },
      { book: '必修三', unit: 'U3', topic: 'Diverse Cultures', grammar_en: 'Ellipsis', grammar_zh: '省略', maps_to: ['special-ellipsis'] },
      { book: '必修三', unit: 'U4', topic: 'Space Exploration', grammar_en: 'Infinitives (1) attribute/adverbial', grammar_zh: '不定式作定语和状语', maps_to: ['nonpred-done', 'nonpred-doing'] },
      { book: '必修三', unit: 'U5', topic: 'The Value of Money', grammar_en: 'Review of modal verbs / Past future tense', grammar_zh: '情态动词复习 / 过去将来时', maps_to: ['modal-other', 'pred-tense'] },
      { book: '选必一', unit: 'U1', topic: 'People of Achievement', grammar_en: 'Non-restrictive relative clauses', grammar_zh: '非限制性定语从句', maps_to: ['attrib-pronoun'] },
      { book: '选必一', unit: 'U2', topic: 'Looking into the Future', grammar_en: 'Future progressive tense', grammar_zh: '将来进行时', maps_to: ['pred-tense'] },
      { book: '选必一', unit: 'U3', topic: 'Fascinating Parks', grammar_en: '-ing form (3) as subject', grammar_zh: '-ing 作主语', maps_to: ['nonpred-to-do'] },
      { book: '选必一', unit: 'U4', topic: 'Body Language', grammar_en: '-ing form (4) as object/predicative', grammar_zh: '-ing 作宾语/表语', maps_to: ['nonpred-to-do', 'nonpred-to-do'] },
      { book: '选必一', unit: 'U5', topic: 'Working the Land', grammar_en: 'Subject clauses', grammar_zh: '主语从句', maps_to: ['nounc-that', 'nounc-wh-pronoun'] },
      { book: '选必二', unit: 'U1', topic: 'Science and Scientists', grammar_en: 'Predicative clauses', grammar_zh: '表语从句', maps_to: ['nounc-that'] },
      { book: '选必二', unit: 'U2', topic: 'Bridging Cultures', grammar_en: 'Review of noun clauses', grammar_zh: '名词性从句复习', maps_to: ['nounc-that', 'nounc-wh-pronoun', 'nounc-that'] },
      { book: '选必二', unit: 'U3', topic: 'Food and Culture', grammar_en: 'Past perfect tense / Past perfect passive', grammar_zh: '过去完成时及其被动', maps_to: ['pred-tense', 'pred-passive'] },
      { book: '选必二', unit: 'U4', topic: 'Journey Across a Vast Land', grammar_en: 'Past participles vs -ing form', grammar_zh: '过去分词 vs -ing', maps_to: ['nonpred-done', 'nonpred-doing'] },
      { book: '选必二', unit: 'U5', topic: 'First Aid', grammar_en: 'Review of -ing form', grammar_zh: '-ing 复习', maps_to: ['nonpred-to-do'] },
      { book: '选必三', unit: 'U1', topic: 'Art', grammar_en: 'Infinitives (2) as predicative', grammar_zh: '不定式作表语', maps_to: ['nonpred-to-do'] },
      { book: '选必三', unit: 'U2', topic: 'Healthy Lifestyle', grammar_en: 'Infinitives (3) as subject', grammar_zh: '不定式作主语', maps_to: ['nonpred-to-do'] },
      { book: '选必三', unit: 'U3', topic: 'Environmental Protection', grammar_en: 'Direct/indirect speech', grammar_zh: '直接/间接引语', maps_to: ['nounc-that'] },
      { book: '选必三', unit: 'U4', topic: 'Adversity and Courage', grammar_en: 'Present perfect continuous / Review of tenses', grammar_zh: '现在完成进行 / 时态复习', maps_to: ['pred-tense', 'pred-tense'] },
      { book: '选必三', unit: 'U5', topic: 'Poems', grammar_en: 'Review of relative clauses', grammar_zh: '定语从句复习', maps_to: ['attrib-pronoun'] },
      { book: '选必四', unit: 'U1', topic: 'Science Fiction', grammar_en: 'Review of passive voice', grammar_zh: '被动语态复习', maps_to: ['pred-passive', 'pred-passive'] },
      { book: '选必四', unit: 'U2', topic: 'Iconic Attractions', grammar_en: 'Review of past participles', grammar_zh: '过去分词复习', maps_to: ['nonpred-done', 'nonpred-to-do'] },
      { book: '选必四', unit: 'U3', topic: 'Sea Exploration', grammar_en: 'Review of infinitive', grammar_zh: '不定式复习', maps_to: ['nonpred-to-do'] },
      { book: '选必四', unit: 'U4', topic: 'Sharing', grammar_en: 'Review of phrases', grammar_zh: '短语复习', maps_to: ['prep-collocation', 'prep-collocation'] },
      { book: '选必四', unit: 'U5', topic: 'Launching Your Career', grammar_en: 'Review of long sentences', grammar_zh: '长难句复习', maps_to: ['attrib-pronoun', 'advc-time'] }
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
    main_tags: DATA.tags.length,                                 // 57
    aux_tags: DATA.aux_tags.length,                              // 5
    textbook_units: DATA.textbook_units.length                   // 36
  };

  window.GRAMMAR_FINE_TAGS = DATA;
})();
