// 语法知识层总架构 v1
// 定位：连接“书本式知识库 grammar_knowledge.js”和“讲题陷阱库 grammar_knowledge_traps.js”的中间骨架。
// 原则：书本负责完整解释；地图负责脉络；trap 负责讲题卡点。
// 更新时间：2026-05-27
(function () {
  const CORE = {
    version: '0.1.0',
    updated_at: '2026-05-27',
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
    ],
    teaching_graph: {
      version: '0.3.0',
      title: '语法填空判断框架图谱',
      desc: '把“入口判断”和“知识展开”分开：先判断空格类型和句法身份，再进入同级知识系统。谓语/非谓语先在动词身份层判断；定语从句、名词性从句、状语从句在从句系统下并列。',
      viewBox: '0 0 2500 1740',
      default_bounds: { x: 40, y: 540, w: 860, h: 720 },
      clusters: [
        { id: 'clue', title: '有提示词：形式由句法身份决定', x: 330, y: 60, w: 2060, h: 820, color: '#34c759' },
        { id: 'verb', title: '动词提示词：先判身份，再进分支', x: 900, y: 105, w: 1240, h: 650, color: '#30b0c7' },
        { id: 'nonpredicate', title: '非谓语展开：只放确认后的细化', x: 1460, y: 300, w: 850, h: 420, color: '#af52de' },
        { id: 'no_clue', title: '无提示词：补结构关系', x: 330, y: 930, w: 2060, h: 710, color: '#409cff' },
        { id: 'connector', title: '连接系统：并列连词与从句连接词并列', x: 900, y: 770, w: 1380, h: 490, color: '#ff9500' },
        { id: 'clause', title: '从句系统：定从 / 名从 / 状从同级', x: 1180, y: 720, w: 1000, h: 570, color: '#af52de' }
      ],
      nodes: [
        { id: 'teach_start', type: 'diagnosis', title: '题目入口', subtitle: '先看空格', cluster: 'entry', focus_group: 'overview', x: 70, y: 760, desc: '语法填空先不要急着套规则，第一步判断空格有没有括号提示词。', decision_tip: '看空格本身：括号里给了词，通常考词形变化；没有提示词，通常考限定、指代、连接或词块关系。', next_steps: ['有提示词', '无提示词'], teacher_move: '让学生先说“这空有没有提示词”，再进入对应知识系统。', student_goal: '形成做题入口：先分流，再判断细节。' },
        { id: 'clue_route', type: 'route', title: '有提示词', subtitle: '先看提示词词性', cluster: 'clue', parent: 'teach_start', focus_group: 'clue', x: 390, y: 420, desc: '括号给出单词时，重点不是填哪个词，而是把这个词变成句子需要的形式。', decision_tip: '先看提示词词性：动词进入动词身份判断；名词、形容词、副词、数词进入词形和数量判断。', next_steps: ['动词提示词', '非动词提示词'], teacher_move: '不要先问中文意思，先问这个提示词要在句子里承担什么功能。', category_refs: ['predicate', 'nonpredicate', 'word', 'number'] },
        { id: 'content_word_route', type: 'route', title: '实词变化', subtitle: '形式服务成分', cluster: 'clue', parent: 'clue_route', focus_group: 'clue', x: 660, y: 420, desc: '实词题的核心是句子成分决定形式。', decision_tip: '先判断空格作谓语、非谓语成分、名词成分、修饰语还是数量表达。', next_steps: ['动词提示词', '非动词提示词'], category_refs: ['predicate', 'nonpredicate', 'word', 'number'] },
        { id: 'verb_three_way', type: 'route', title: '动词提示词', subtitle: '先判句法身份', cluster: 'verb', parent: 'content_word_route', focus_group: 'verb', x: 950, y: 260, desc: '看到动词提示词，先做身份判断，不直接进入谓语或非谓语结论。', decision_tip: '先数句子结构：这里缺不缺谓语？已有谓语是否有并列连词或从句连接词？空格位置是否要求名词、形容词或副词？', next_steps: ['动词身份判断', '谓语动词', '非谓语', '动词变词性'], category_refs: ['predicate', 'nonpredicate', 'word'], trap_refs: ['pred-find-real-predicate', 'nonp-finite-or-nonfinite', 'word-verb-to-noun-branch'] },
        { id: 'verb_identity_gate', type: 'rule', title: '动词身份判断', subtitle: '谓语 / 非谓语 / 词性转换', cluster: 'verb', parent: 'verb_three_way', focus_group: 'verb', x: 1210, y: 260, desc: '这是动词题的共同入口，不属于非谓语内部。先判断空格里的动词是否有资格作谓语，再决定走哪条分支。', decision_tip: '缺谓语且结构允许，走谓语；已有谓语且无并列/从句谓语位置，走非谓语；空格作名词、定语、表语或状语时，检查词性转换。', next_steps: ['谓语动词', '非谓语', '动词变词性'], category_refs: ['predicate', 'nonpredicate', 'word'], trap_refs: ['pred-find-real-predicate', 'nonp-finite-or-nonfinite', 'word-verb-to-noun-branch'] },
        { id: 'predicate_core', type: 'category', title: '谓语动词', subtitle: '时态 / 语态 / 一致', cluster: 'verb', parent: 'verb_identity_gate', focus_group: 'predicate', x: 1500, y: 120, desc: '谓语动词承担句子主干动作，形式由时间、主被动和主语中心词共同决定。', decision_tip: '确认是谓语以后，再按时态、语态、主谓一致三核检查。', next_steps: ['时间线', '主被动', '主语中心词'], category_refs: ['predicate'], fine_refs: ['pred-tense-present', 'pred-tense-past-future', 'pred-tense-perfect', 'pred-passive-form', 'pred-sva-form'], trap_refs: ['pred-objective-present', 'pred-past-time-marker', 'pred-passive-subject-receives', 'pred-subject-core-not-modifier'], teacher_move: '先判是不是谓语，再按时间线、主被动、主语中心词逐项排查。' },
        { id: 'predicate_form_route', type: 'rule', title: '谓语形式三核', subtitle: '时间 + 语态 + 一致', cluster: 'verb', parent: 'predicate_core', focus_group: 'predicate', x: 1800, y: 120, desc: '谓语判断完成后，具体落点只剩三个核心变量。', decision_tip: '找时间标志和上下文时态，判断主语是否承受动作，再回到主语中心词检查单复数。', next_steps: ['时态', '语态', '主谓一致'], category_refs: ['predicate'], fine_refs: ['pred-tense-present', 'pred-tense-past-future', 'pred-tense-perfect', 'pred-passive-form', 'pred-sva-form'] },
        { id: 'nonpredicate_core', type: 'category', title: '非谓语', subtitle: '确认后再展开', cluster: 'nonpredicate', parent: 'verb_identity_gate', focus_group: 'nonpredicate', x: 1500, y: 360, desc: '非谓语是动词身份判断后的一个结论，不是判断谓语/非谓语的上位层。进入这里以后，只处理逻辑主语、形式和句法功能。', decision_tip: '确认不能作谓语后，先找逻辑主语，再看主动/被动、时间先后和句法功能。', next_steps: ['逻辑主语', '形式判断', '功能判断'], category_refs: ['nonpredicate'], fine_refs: ['nonp-basic', 'nonp-object', 'nonp-attribute', 'nonp-adverbial-1', 'nonp-perfect-passive-neg', 'nonp-complement'], trap_refs: ['nonp-purpose-todo', 'nonp-question-word-todo', 'nonp-logical-subject-not-sentence-subject', 'nonp-done-postmodifier-passive'], teacher_move: '非谓语内部只问：谁发出/承受动作，用什么形式，作什么成分。' },
        { id: 'nonp_logic_subject_rule', type: 'rule', title: '逻辑主语', subtitle: '谁发出/承受动作', cluster: 'nonpredicate', parent: 'nonpredicate_core', focus_group: 'nonpredicate', x: 1800, y: 300, desc: '非谓语的逻辑主语不一定等于句子主语，尤其是定语、宾补和独立结构。', decision_tip: '问“这个动作是谁做的，或谁承受的”，再决定主动还是被动。', category_refs: ['nonpredicate'], trap_refs: ['nonp-logical-subject-not-sentence-subject'] },
        { id: 'nonp_form_route', type: 'route', title: '形式判断', subtitle: 'to do / doing / done', cluster: 'nonpredicate', parent: 'nonpredicate_core', focus_group: 'nonpredicate', x: 1800, y: 470, desc: '非谓语形式由逻辑主语、主被动、时间先后和句法功能共同决定。', decision_tip: '主动常用 doing 或 to do，被动常用 done / being done / to be done；目的常用 to do。', next_steps: ['to do', 'doing', 'done', 'being done / to be done'], category_refs: ['nonpredicate'], fine_refs: ['nonp-perfect-passive-neg'] },
        { id: 'nonp_function_route', type: 'route', title: '功能判断', subtitle: '作什么成分', cluster: 'nonpredicate', parent: 'nonpredicate_core', focus_group: 'nonpredicate', x: 1800, y: 640, desc: '同一种非谓语形式可能作不同成分，讲题时要把形式放回句子位置。', decision_tip: '看空格在句中作主语、宾语、定语、状语、补语，还是 with 复合结构的一部分。', next_steps: ['主语/宾语', '定语', '状语', '补语/with结构'], category_refs: ['nonpredicate'], fine_refs: ['nonp-object', 'nonp-attribute', 'nonp-adverbial-1', 'nonp-complement'] },
        { id: 'verb_word_form', type: 'category', title: '动词变词性', subtitle: '变名 / 形 / 副', cluster: 'verb', parent: 'verb_identity_gate', focus_group: 'word_form', x: 1500, y: 600, desc: '动词提示词不一定填动词形式，也可能根据成分变成名词、形容词或副词。', decision_tip: '看空格是否作主语、宾语、介词宾语、定语、表语或状语。', next_steps: ['动词变名词', '动词变形容词', '动词变副词'], category_refs: ['word'], fine_refs: ['word-noun-derivation', 'word-adj-adv-choice'], trap_refs: ['word-verb-to-noun-branch', 'word-adj-before-noun', 'word-adv-modifies-adj-verb-sentence'] },
        { id: 'nominal_modifier_route', type: 'route', title: '非动词提示词', subtitle: '词性 / 数 / 级', cluster: 'clue', parent: 'content_word_route', focus_group: 'word_form', x: 950, y: 690, desc: '名词、形容词、副词、数词提示词常考词性转换、名词单复数、比较级最高级。', decision_tip: '看空格前后：修饰名词多为形容词，修饰动作/形容词多为副词，名词位置再看单复数。', next_steps: ['词性转换', '名词单复数', '形副比较级'], category_refs: ['word', 'number'] },
        { id: 'word_family_core', type: 'category', title: '词性转换', subtitle: '成分决定词性', cluster: 'clue', parent: 'nominal_modifier_route', focus_group: 'word_form', x: 1210, y: 780, desc: '词性转换不是看后缀感觉，而是让词形匹配空格的句子成分。', decision_tip: '先说空格作什么成分，再决定名词、形容词、副词或动词形式。', next_steps: ['名词', '形容词', '副词'], category_refs: ['word'], fine_refs: ['word-noun-derivation', 'word-adj-adv-choice'], trap_refs: ['word-word-family-spelling', 'word-adj-before-noun', 'word-adv-modifies-adj-verb-sentence'] },
        { id: 'number_core', type: 'category', title: '名词单复数', subtitle: '可数性 / 数量提示', cluster: 'clue', parent: 'nominal_modifier_route', focus_group: 'word_form', x: 1510, y: 780, desc: '名词形式题先判断可数性，再看数量、限定词和上下文。', decision_tip: '遇到名词提示词，检查 many、several、one of、these、冠词和上下文是否要求复数或序数。', next_steps: ['可数名词', '复数形式', '序数/数量表达'], category_refs: ['number', 'word'], fine_refs: ['num-countable', 'num-plural', 'num-quantity'], trap_refs: ['word-countable-plural-context', 'number-ordinal-the'] },
        { id: 'adj_adv_degree_core', type: 'category', title: '形副比较级', subtitle: '修饰对象 / 比较触发', cluster: 'clue', parent: 'nominal_modifier_route', focus_group: 'word_form', x: 1810, y: 780, desc: '形容词、副词要先看修饰对象，再看是否有比较或最高级触发。', decision_tip: 'than、much、even、the most、one of 等信号会改变等级；没有等级信号时先判断形容词还是副词。', next_steps: ['形容词', '副词', '比较级/最高级'], category_refs: ['word'], fine_refs: ['word-adj-adv-choice', 'word-cmp-comparative', 'word-adj-adv-other'], trap_refs: ['word-comparative-superlative-trigger'] },
        { id: 'no_clue_route', type: 'route', title: '无提示词', subtitle: '补结构关系', cluster: 'no_clue', parent: 'teach_start', focus_group: 'no_clue', x: 390, y: 1120, desc: '没有括号提示词时，空格通常在补关系：限定名词、连接句子、指代上下文或补词块关系。', decision_tip: '先看空格前后是不是名词、完整句子、并列结构、从句结构或固定词块。', next_steps: ['连接系统', '限定/指代/词块'], teacher_move: '让学生读空格前后两侧，说明这里缺的是哪一种关系。', category_refs: ['article', 'pronoun', 'preposition', 'logic', 'attrib', 'nounclause', 'advclause'] },
        { id: 'function_word_route', type: 'route', title: '关系判断', subtitle: '不是乱猜小词', cluster: 'no_clue', parent: 'no_clue_route', focus_group: 'no_clue', x: 660, y: 1120, desc: '无提示词不是乱猜小词，而是判断空格补的是哪一种结构关系。', decision_tip: '句子和句子之间先看连接；名词前后看限定和指代；词块内部看介词搭配和方向。', next_steps: ['连接系统', '限定/指代/词块'], category_refs: ['article', 'pronoun', 'preposition', 'logic', 'attrib', 'nounclause', 'advclause'] },
        { id: 'connector_system_route', type: 'route', title: '连接系统', subtitle: '并列连接 / 从句连接', cluster: 'connector', parent: 'function_word_route', focus_group: 'connector', x: 950, y: 980, desc: '连接类空格先区分：连接同层成分，还是引出一个从句。并列连词和从句连接词是同级判断，不应混在冠介代下面。', decision_tip: '被连接的是两个同层词/短语/句子，走并列连词；后面是从句并在主句中承担成分或逻辑关系，走从句系统。', next_steps: ['并列连词', '从句连接词'], category_refs: ['logic', 'attrib', 'nounclause', 'advclause'], trap_refs: ['logic-parallel-and', 'nounclause-connector-role'] },
        { id: 'teach_clause_route', type: 'route', title: '从句连接词', subtitle: '三大从句同级', cluster: 'clause', parent: 'connector_system_route', focus_group: 'clause', x: 1210, y: 920, desc: '从句系统下，定语从句、名词性从句、状语从句是并列类型；区别在于这个从句在整句里干什么。', decision_tip: '修饰名词是定语从句；整体当名词成分是名词性从句；表达时间、原因、条件、让步等关系是状语从句。', next_steps: ['定语从句', '名词性从句', '状语从句'], category_refs: ['attrib', 'nounclause', 'advclause'], trap_refs: ['attrib-where-when-why-complete-clause', 'nounclause-connector-role', 'advclause-when-vs-attrib-when'] },
        { id: 'logic_core', type: 'category', title: '并列连词 / 逻辑连词', subtitle: '连接同层成分', cluster: 'connector', parent: 'connector_system_route', focus_group: 'connector', x: 1210, y: 1160, desc: '逻辑连词连接同层信息，表达并列、选择、转折、因果、递进等关系。', decision_tip: '圈出被连接的两个成分，先确认它们同层，再说清它们是同向、相反、选择还是因果。', next_steps: ['and并列', 'but转折', 'or选择', 'so因果'], category_refs: ['logic'], fine_refs: ['logic-conj-phrase', 'logic-compound'], trap_refs: ['logic-whether-or', 'logic-not-only-but-also', 'logic-parallel-and'] },
        { id: 'attrib_core', type: 'category', title: '定语从句', subtitle: '修饰名词', cluster: 'clause', parent: 'teach_clause_route', focus_group: 'clause', x: 1510, y: 760, desc: '定语从句修饰名词，关键是先行词和从句缺什么成分。', decision_tip: '先找先行词，再看从句缺主语/宾语/表语还是状语。', next_steps: ['关系代词', '关系副词', 'whose/非限制'], category_refs: ['attrib'], fine_refs: ['attrib-choice', 'attrib-adverb', 'attrib-restrictive-non'], trap_refs: ['attrib-which-that-for-things', 'attrib-where-when-why-complete-clause', 'attrib-whose-possessive'] },
        { id: 'nounclause_core', type: 'category', title: '名词性从句', subtitle: '整体当名词', cluster: 'clause', parent: 'teach_clause_route', focus_group: 'clause', x: 1510, y: 950, desc: '名词性从句整体作主语、宾语、表语或同位语。', decision_tip: '先判断整个从句作什么名词成分，再看从句是否缺成分或只缺连接意义。', next_steps: ['what补成分', 'that不作成分', 'whether/if是否'], category_refs: ['nounclause'], fine_refs: ['nounc-connectors', 'nounc-wh-words', 'nounc-ever-words'], trap_refs: ['nounclause-what-missing-subject-object', 'nounclause-whether-if', 'nounclause-connector-role'] },
        { id: 'advclause_core', type: 'category', title: '状语从句', subtitle: '前后逻辑', cluster: 'clause', parent: 'teach_clause_route', focus_group: 'clause', x: 1510, y: 1140, desc: '状语从句表达时间、原因、条件、让步、目的、结果等逻辑关系。', decision_tip: '先说清主从句之间的中文逻辑，再选择连词。', next_steps: ['时间', '原因', '条件/让步', '目的/结果'], category_refs: ['advclause'], fine_refs: ['advc-time', 'advc-reason-place', 'advc-condition-manner', 'advc-purpose-result'], trap_refs: ['advclause-when-vs-attrib-when', 'advclause-although-no-but', 'advclause-because-since-as'] },
        { id: 'trap_clause_connector', type: 'trap', title: '从句缺口检查', subtitle: '类型 + 成分', cluster: 'clause', parent: 'teach_clause_route', focus_group: 'clause', x: 1810, y: 950, desc: '很多从句题错在只翻译连接词，不检查从句类型和从句内部结构。', decision_tip: '先判断从句在主句中作什么，再把从句单独读：缺主宾表用代词类，结构完整再看状语或逻辑。', common_wrong: '常错：看中文像“哪里/什么时候”就选 where/when，却忽略它可能是定语从句、名词性从句或状语从句中的不同角色。', category_refs: ['attrib', 'nounclause', 'advclause'], trap_refs: ['attrib-where-when-why-complete-clause', 'nounclause-what-missing-subject-object', 'advclause-when-vs-attrib-when'] },
        { id: 'noun_phrase_relation_route', type: 'route', title: '限定/指代/词块', subtitle: '冠词 / 代词 / 介词', cluster: 'no_clue', parent: 'function_word_route', focus_group: 'small_word', x: 950, y: 1380, desc: '不承担连接功能的无提示词，主要看名词限定、上下文指代和词块关系。', decision_tip: '把空格和前后词块一起读，判断它是在限定名词、指代对象，还是补介词关系。', next_steps: ['冠词', '代词', '介词'], category_refs: ['article', 'pronoun', 'preposition'] },
        { id: 'article_core', type: 'category', title: '冠词', subtitle: '限定名词', cluster: 'no_clue', parent: 'noun_phrase_relation_route', focus_group: 'small_word', x: 1210, y: 1380, desc: '冠词题本质是名词是否可数、是否特指、是否固定结构。', decision_tip: '冠词必须连着后面的名词讲：可数性、泛指/特指、固定搭配。', next_steps: ['a/an', 'the', '零冠词'], category_refs: ['article'], fine_refs: ['art-specific-indefinite', 'art-a-an', 'art-the', 'art-zero'], trap_refs: ['article-specific-the', 'article-a-an-sound', 'article-superlative-the'] },
        { id: 'pronoun_core', type: 'category', title: '代词', subtitle: '指代 / 替代 / 所有', cluster: 'no_clue', parent: 'noun_phrase_relation_route', focus_group: 'small_word', x: 1510, y: 1380, desc: '代词题考上下文指代、格、所有关系和替代。', decision_tip: '回到上下文找代词指代对象，再看空后是否有名词、是否主宾同一、是否替代同类名词。', next_steps: ['人称/物主', '反身代词', 'it/one'], category_refs: ['pronoun'], fine_refs: ['pron-personal-possessive', 'pron-indefinite-1', 'pron-it'], trap_refs: ['pron-reflexive-same-subject', 'pron-it-reference', 'pron-one-ones-substitution'] },
        { id: 'preposition_core', type: 'category', title: '介词', subtitle: '词块关系', cluster: 'no_clue', parent: 'noun_phrase_relation_route', focus_group: 'small_word', x: 1810, y: 1380, desc: '介词题既有固定搭配，也有时间、地点、方式、对象、方向等关系。', decision_tip: '把介词和前后词块连成整体，不孤立背介词中文意思。', next_steps: ['固定搭配', '时间/地点', '方式/对象/方向'], category_refs: ['preposition'], fine_refs: ['prep-common', 'prep-time', 'prep-location', 'prep-verb'], trap_refs: ['prep-fixed-collocation', 'prep-by-means-or-difference', 'prep-as-role', 'prep-to-direction-relation'] },
        { id: 'trap_small_word_relation', type: 'trap', title: '小词关系检查', subtitle: '别孤立翻译', cluster: 'no_clue', parent: 'noun_phrase_relation_route', focus_group: 'small_word', x: 2110, y: 1380, desc: '小词题的共同难点是学生只背单词意思，不看它标记的结构关系。', decision_tip: '每个小词都要回答：它限定谁，指代谁，或把哪些词块连起来。', common_wrong: '常错：看到熟悉搭配就直接填，不回到上下文检查关系是否成立。', category_refs: ['article', 'pronoun', 'preposition'], trap_refs: ['article-specific-the', 'pron-it-reference', 'prep-fixed-collocation'] }
      ],
      edges: [
        { from: 'teach_start', to: 'clue_route', type: 'route', label: '有提示词' },
        { from: 'teach_start', to: 'no_clue_route', type: 'route', label: '无提示词' },
        { from: 'clue_route', to: 'content_word_route', type: 'belongs', label: '实词' },
        { from: 'content_word_route', to: 'verb_three_way', type: 'belongs', label: '动词' },
        { from: 'content_word_route', to: 'nominal_modifier_route', type: 'belongs', label: '非动词' },
        { from: 'verb_three_way', to: 'verb_identity_gate', type: 'rule', label: '先判身份' },
        { from: 'verb_identity_gate', to: 'predicate_core', type: 'belongs', label: '缺谓语' },
        { from: 'verb_identity_gate', to: 'nonpredicate_core', type: 'belongs', label: '非谓语位置' },
        { from: 'verb_identity_gate', to: 'verb_word_form', type: 'belongs', label: '变词性' },
        { from: 'predicate_core', to: 'predicate_form_route', type: 'rule', label: '定形式' },
        { from: 'nonpredicate_core', to: 'nonp_logic_subject_rule', type: 'rule', label: '找主语' },
        { from: 'nonpredicate_core', to: 'nonp_form_route', type: 'next', label: '看形式' },
        { from: 'nonpredicate_core', to: 'nonp_function_route', type: 'next', label: '看功能' },
        { from: 'nominal_modifier_route', to: 'word_family_core', type: 'belongs', label: '词性' },
        { from: 'nominal_modifier_route', to: 'number_core', type: 'belongs', label: '数' },
        { from: 'nominal_modifier_route', to: 'adj_adv_degree_core', type: 'belongs', label: '级' },
        { from: 'no_clue_route', to: 'function_word_route', type: 'belongs', label: '补关系' },
        { from: 'function_word_route', to: 'connector_system_route', type: 'belongs', label: '连接' },
        { from: 'function_word_route', to: 'noun_phrase_relation_route', type: 'belongs', label: '词块' },
        { from: 'connector_system_route', to: 'logic_core', type: 'belongs', label: '同层连接' },
        { from: 'connector_system_route', to: 'teach_clause_route', type: 'belongs', label: '引出从句' },
        { from: 'teach_clause_route', to: 'attrib_core', type: 'belongs', label: '修饰名词' },
        { from: 'teach_clause_route', to: 'nounclause_core', type: 'belongs', label: '当名词' },
        { from: 'teach_clause_route', to: 'advclause_core', type: 'belongs', label: '表逻辑' },
        { from: 'teach_clause_route', to: 'trap_clause_connector', type: 'trap', label: '缺口检查' },
        { from: 'noun_phrase_relation_route', to: 'article_core', type: 'belongs', label: '限定' },
        { from: 'noun_phrase_relation_route', to: 'pronoun_core', type: 'belongs', label: '指代' },
        { from: 'noun_phrase_relation_route', to: 'preposition_core', type: 'belongs', label: '词块' },
        { from: 'noun_phrase_relation_route', to: 'trap_small_word_relation', type: 'trap', label: '关系检查' }
      ]
    }
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

  const graphNodes = (CORE.teaching_graph && CORE.teaching_graph.nodes) || [];
  CORE.graph_node_index = graphNodes.reduce(function (acc, node) {
    acc[node.id] = Object.assign({ id: node.id }, CORE.nodes[node.id] || {}, node);
    return acc;
  }, {});

  CORE.graph_category_to_nodes = graphNodes.reduce(function (acc, node) {
    (node.category_refs || []).forEach(function (cat) {
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(node.id);
    });
    return acc;
  }, {});

  CORE.graph_trap_to_nodes = graphNodes.reduce(function (acc, node) {
    (node.trap_refs || []).forEach(function (trapId) {
      if (!acc[trapId]) acc[trapId] = [];
      acc[trapId].push(node.id);
    });
    return acc;
  }, {});

  CORE.graph_fine_to_nodes = graphNodes.reduce(function (acc, node) {
    (node.fine_refs || []).forEach(function (fineId) {
      if (!acc[fineId]) acc[fineId] = [];
      acc[fineId].push(node.id);
    });
    return acc;
  }, {});

  window.GRAMMAR_KNOWLEDGE_CORE = CORE;
})();
