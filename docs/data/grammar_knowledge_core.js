// 语法知识层总架构 v1
// 定位：连接“书本式知识库 grammar_knowledge.js”和“讲题陷阱库 grammar_knowledge_traps.js”的中间骨架。
// 原则：书本负责完整解释；地图负责脉络；trap 负责讲题卡点。
// 更新时间：2026-05-15
(function () {
  const CORE = {
    version: '0.1.0',
    updated_at: '2026-05-15',
    title: '高中英语语法知识地图',
    desc: '从句子地基到语法填空考点，把书本知识、课堂讲题和错题迁移挂到同一套节点上。',
    design_principles: [
      '先建立句子结构意识，再进入具体考点。',
      '动词系统是语法填空的主干：谓语、非谓语、词性转换三分流必须清楚。',
      '从句系统和功能词系统要和句子成分相连，而不是孤立背规则。',
      '书本层保留完整知识，讲题层沉淀高频陷阱，地图层负责把两者连起来。'
    ],
    roots: [
      {
        id: 'sentence_foundation',
        title: '句子地基',
        subtitle: '先看结构，再谈规则',
        color: 'blue',
        children: ['sentence_elements', 'sentence_types', 'main_subordinate_logic']
      },
      {
        id: 'verb_system',
        title: '动词系统',
        subtitle: '语法填空最核心',
        color: 'green',
        children: ['verb_three_way', 'predicate_core', 'nonpredicate_core', 'verb_word_form']
      },
      {
        id: 'clause_system',
        title: '从句系统',
        subtitle: '连接词 = 成分 + 逻辑',
        color: 'purple',
        children: ['attrib_core', 'nounclause_core', 'advclause_core']
      },
      {
        id: 'function_words',
        title: '功能词系统',
        subtitle: '小词决定关系',
        color: 'orange',
        children: ['article_core', 'pronoun_core', 'preposition_core', 'logic_core']
      },
      {
        id: 'form_and_number',
        title: '词形与数量',
        subtitle: '形式变化服务句子功能',
        color: 'red',
        children: ['word_family_core', 'number_core', 'spelling_awareness']
      }
    ],
    nodes: {
      sentence_elements: {
        title: '句子成分',
        layer: '地基',
        desc: '主语、谓语、宾语、表语、定语、状语、补语，是所有语法判断的起点。',
        student_goal: '能先找主干，再判断空格在句中作什么成分。',
        teacher_use: '讲题时先让学生圈主谓宾，不急着报规则。',
        category_refs: ['predicate', 'nonpredicate', 'word'],
        trap_refs: ['pred-find-real-predicate', 'nonp-finite-or-nonfinite', 'word-verb-to-noun-branch']
      },
      sentence_types: {
        title: '简单句 / 并列句 / 复合句',
        layer: '地基',
        desc: '判断一个空格能否作谓语，先看句子里有几个谓语、几个连接结构。',
        student_goal: '能区分一个句子里是并列谓语、从句谓语，还是非谓语。',
        teacher_use: '遇到动词填空，先数谓语和连接词。',
        category_refs: ['predicate', 'nonpredicate', 'logic'],
        trap_refs: ['pred-find-real-predicate', 'nonp-finite-or-nonfinite', 'logic-parallel-and']
      },
      main_subordinate_logic: {
        title: '主从关系与信息层级',
        layer: '地基',
        desc: '从句不是“多一个句子”，而是主句中的某个成分或逻辑补充。',
        student_goal: '能说清楚从句在主句中作什么，或表达什么逻辑关系。',
        teacher_use: '讲从句时先问：这个从句在整句里干什么？',
        category_refs: ['attrib', 'nounclause', 'advclause'],
        trap_refs: ['attrib-which-that-for-things', 'nounclause-connector-role', 'advclause-when-vs-attrib-when']
      },
      verb_three_way: {
        title: '动词填空三分流',
        layer: '主干',
        desc: '动词括号题先分成三条路：谓语、非谓语、词性转换。',
        student_goal: '看到动词括号，不再只想着时态，而是先判断功能。',
        teacher_use: '课堂上用“三分流”统一讲动词题，避免大而泛的“非谓语”。',
        category_refs: ['predicate', 'nonpredicate', 'word'],
        trap_refs: ['pred-find-real-predicate', 'nonp-finite-or-nonfinite', 'word-verb-to-noun-branch']
      },
      predicate_core: {
        title: '谓语动词',
        layer: '主干',
        desc: '谓语题核心是时态、语态、主谓一致；但顺序要从句子结构开始。',
        student_goal: '能判断动作时间、主被动关系和主语中心词。',
        teacher_use: '先判是不是谓语，再按“时态-语态-一致”讲。',
        category_refs: ['predicate'],
        sub_refs: ['predicate-tense', 'predicate-voice', 'predicate-agreement'],
        trap_refs: ['pred-objective-present', 'pred-past-time-marker', 'pred-passive-subject-receives', 'pred-subject-core-not-modifier']
      },
      nonpredicate_core: {
        title: '非谓语动词',
        layer: '主干',
        desc: '非谓语不是一个大框，至少要细分为 to do、doing、done 及其句法功能。',
        student_goal: '能找逻辑主语，判断主动/被动/目的/搭配。',
        teacher_use: '迁移训练优先按 to do、doing、done 等小点聚焦。',
        category_refs: ['nonpredicate'],
        sub_refs: ['nonpredicate-infinitive', 'nonpredicate-gerund', 'nonpredicate-participle', 'nonpredicate-independent'],
        trap_refs: ['nonp-purpose-todo', 'nonp-question-word-todo', 'nonp-logical-subject-not-sentence-subject', 'nonp-done-postmodifier-passive']
      },
      verb_word_form: {
        title: '动词的词性转换',
        layer: '主干',
        desc: '动词填空不一定进入谓语/非谓语，也可能变名词、形容词或副词。',
        student_goal: '能根据空格成分判断 arrival、tasty、visibly 这类词形。',
        teacher_use: '讲动词题时明确提醒：第三条路是词性转换。',
        category_refs: ['word'],
        sub_refs: ['word-noun', 'word-adj', 'word-adv', 'word-verb'],
        trap_refs: ['word-verb-to-noun-branch', 'word-adj-before-noun', 'word-adv-modifies-adj-verb-sentence']
      },
      attrib_core: {
        title: '定语从句',
        layer: '从句',
        desc: '定语从句修饰名词，关键是先行词和从句缺什么成分。',
        student_goal: '能区分 which/that/whose/where/when/why。',
        teacher_use: '固定追问：先行词是谁？从句缺主宾还是状语？',
        category_refs: ['attrib'],
        sub_refs: ['attrib-pronoun', 'attrib-adverb', 'attrib-nonrestrictive', 'attrib-special'],
        trap_refs: ['attrib-whose-possessive', 'attrib-where-when-why-complete-clause', 'attrib-nonrestrictive-no-that']
      },
      nounclause_core: {
        title: '名词性从句',
        layer: '从句',
        desc: '名词性从句整体当名词用，连接词选择取决于从句成分和意义。',
        student_goal: '能区分 what / that / whether / how / why。',
        teacher_use: '讲法从“这个从句作什么名词成分”开始。',
        category_refs: ['nounclause'],
        sub_refs: ['noun-subject', 'noun-object', 'noun-predicative'],
        trap_refs: ['nounclause-what-missing-subject-object', 'nounclause-whether-if', 'nounclause-connector-role']
      },
      advclause_core: {
        title: '状语从句',
        layer: '从句',
        desc: '状语从句表达时间、原因、条件、让步、目的、结果等逻辑关系。',
        student_goal: '能根据主从句关系选择 when / because / although 等连词。',
        teacher_use: '讲题时不先翻译单词，先判断前后句逻辑。',
        category_refs: ['advclause'],
        sub_refs: ['adv-time', 'adv-reason', 'adv-condition-concession'],
        trap_refs: ['advclause-when-vs-attrib-when', 'advclause-although-no-but', 'advclause-because-since-as']
      },
      article_core: {
        title: '冠词',
        layer: '功能词',
        desc: '冠词题本质是名词是否可数、是否特指、是否固定结构。',
        student_goal: '能区分泛指 a/an、特指 the、零冠词和固定搭配。',
        teacher_use: '讲题时把冠词和后面的名词一起读。',
        category_refs: ['article'],
        sub_refs: ['article-a-an', 'article-the', 'article-zero'],
        trap_refs: ['article-specific-the', 'article-a-an-sound', 'article-superlative-the']
      },
      pronoun_core: {
        title: '代词',
        layer: '功能词',
        desc: '代词题考指代对象、格、所有关系和替代。',
        student_goal: '能回到上下文找到代词指代对象。',
        teacher_use: '讲题时让学生说出“它指谁/谁的/替代什么”。',
        category_refs: ['pronoun'],
        sub_refs: ['pronoun-personal', 'pronoun-reflexive', 'pronoun-one'],
        trap_refs: ['pron-reflexive-same-subject', 'pron-it-reference', 'pron-one-ones-substitution']
      },
      preposition_core: {
        title: '介词',
        layer: '功能词',
        desc: '介词题既有固定搭配，也有时间、地点、方式、对象等语义关系。',
        student_goal: '能把介词和前后词块连成整体判断。',
        teacher_use: '讲题时不要孤立翻译介词，要读词块。',
        category_refs: ['preposition'],
        sub_refs: ['prep-time-place', 'prep-collocation', 'prep-phrase'],
        trap_refs: ['prep-fixed-collocation', 'prep-by-means-or-difference', 'prep-as-role']
      },
      logic_core: {
        title: '逻辑连词',
        layer: '功能词',
        desc: '逻辑连词表达并列、转折、因果、选择、递进等关系。',
        student_goal: '能先说清前后信息关系，再选 and/but/or/so。',
        teacher_use: '讲题时让学生用中文说出前后关系。',
        category_refs: ['logic'],
        sub_refs: ['logic-coordinate', 'logic-subordinate', 'logic-correlative'],
        trap_refs: ['logic-whether-or', 'logic-not-only-but-also', 'logic-parallel-and']
      },
      word_family_core: {
        title: '词族变化',
        layer: '词形',
        desc: '词性转换要服务句子成分，不能只靠后缀感觉。',
        student_goal: '能判断空格需要名词、形容词、副词还是动词形式。',
        teacher_use: '讲题时先问空格作什么成分，再谈后缀。',
        category_refs: ['word'],
        sub_refs: ['word-noun', 'word-adj', 'word-adv', 'word-verb'],
        trap_refs: ['word-word-family-spelling', 'word-comparative-superlative-trigger', 'word-countable-plural-context']
      },
      number_core: {
        title: '数词与数量表达',
        layer: '词形',
        desc: '数词题考基数/序数、分数、倍数和固定数量表达。',
        student_goal: '能根据语义判断 first、twice、one third 等形式。',
        teacher_use: '把数词放回“顺序、次数、比例、数量”语境讲。',
        category_refs: ['number'],
        sub_refs: ['number-cardinal-ordinal', 'number-fraction-multiple'],
        trap_refs: ['number-ordinal-the', 'number-fraction-expression']
      },
      spelling_awareness: {
        title: '拼写与形式意识',
        layer: '词形',
        desc: '高考语法填空经常不是不会规则，而是词形拼写和单复数细节出错。',
        student_goal: '能检查 -s、-ed、-ing、-ly、-tion、-ity 等形式。',
        teacher_use: '讲完规则后留 5 秒做形式检查。',
        category_refs: ['word', 'number'],
        trap_refs: ['word-word-family-spelling', 'word-countable-plural-context']
      }
    },
    learning_paths: [
      {
        id: 'grammar_fill_foundation',
        title: '语法填空基础路径',
        desc: '适合学生建立最小可用语法框架。',
        nodes: ['sentence_elements', 'sentence_types', 'verb_three_way', 'predicate_core', 'nonpredicate_core', 'verb_word_form']
      },
      {
        id: 'clause_path',
        title: '从句专题路径',
        desc: '适合讲定语从句、名词性从句、状语从句的区别。',
        nodes: ['main_subordinate_logic', 'attrib_core', 'nounclause_core', 'advclause_core']
      },
      {
        id: 'small_words_path',
        title: '小词专题路径',
        desc: '适合讲冠词、代词、介词、逻辑连词这些看似零散的题。',
        nodes: ['article_core', 'pronoun_core', 'preposition_core', 'logic_core']
      }
    ]
  };

  CORE.node_index = Object.keys(CORE.nodes).reduce(function (acc, key) {
    acc[key] = Object.assign({ id: key }, CORE.nodes[key]);
    return acc;
  }, {});

  CORE.category_to_nodes = Object.keys(CORE.nodes).reduce(function (acc, key) {
    const node = CORE.nodes[key];
    (node.category_refs || []).forEach(function (cat) {
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(key);
    });
    return acc;
  }, {});

  CORE.trap_to_nodes = Object.keys(CORE.nodes).reduce(function (acc, key) {
    const node = CORE.nodes[key];
    (node.trap_refs || []).forEach(function (trapId) {
      if (!acc[trapId]) acc[trapId] = [];
      acc[trapId].push(key);
    });
    return acc;
  }, {});

  window.GRAMMAR_KNOWLEDGE_CORE = CORE;
})();
