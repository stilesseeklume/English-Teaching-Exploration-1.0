// grammar-fill/modules/teaching-view-model.js
//
// Pure view-model helpers for the teaching stage. No DOM access.

/* eslint-disable */
(function(){
  var GRAPH_NODE_PRIORITY = [
    'nonp_todo',
    'nonp_doing',
    'nonp_done',
    'nonp_passive_forms',
    'nonp_attribute',
    'nonp_adverbial',
    'nonp_subject_object',
    'nonp_complement_with',
    'predicate_core',
    'nonpredicate_core',
    'verb_word_form',
    'word_family_core',
    'number_core',
    'adj_adv_degree_core',
    'attrib_core',
    'nounclause_core',
    'advclause_core',
    'article_core',
    'pronoun_core',
    'preposition_core',
    'logic_core',
    'trap_clause_connector',
    'trap_small_word_relation'
  ];

  var CATEGORY_GRAPH_FALLBACK = {
    predicate: 'predicate_core',
    nonpredicate: 'nonpredicate_core',
    word: 'word_family_core',
    attrib: 'attrib_core',
    nounclause: 'nounclause_core',
    advclause: 'advclause_core',
    article: 'article_core',
    pronoun: 'pronoun_core',
    preposition: 'preposition_core',
    logic: 'logic_core',
    number: 'number_core'
  };

  var GRAPH_NODE_TYPE_LABELS = {
    diagnosis: '诊断节点',
    route: '分流节点',
    category: '考点节点',
    rule: '判断规则',
    trap: '易错陷阱',
    resource: '资料入口'
  };

  var GRAPH_TYPE_COLORS = {
    diagnosis: '#409cff',
    route: '#34c759',
    category: '#af52de',
    rule: '#ffcc00',
    trap: '#ff9500',
    resource: '#ff3b30'
  };

  var GLOBAL_GRAPH_FOCUS_PRESETS = [
    { id: 'overview', label: '总览', nodeId: 'teach_start', bounds: { x: 40, y: 540, w: 860, h: 720 } },
    { id: 'clue', label: '有提示词', nodeId: 'clue_route', bounds: { x: 340, y: 60, w: 2050, h: 820 } },
    { id: 'verb', label: '动词', nodeId: 'verb_identity_gate', bounds: { x: 900, y: 105, w: 1240, h: 650 } },
    { id: 'nonpredicate', label: '非谓语', nodeId: 'nonpredicate_core', bounds: { x: 1460, y: 300, w: 850, h: 420 } },
    { id: 'no_clue', label: '无提示词', nodeId: 'no_clue_route', bounds: { x: 340, y: 930, w: 2050, h: 710 } },
    { id: 'connector', label: '连接', nodeId: 'connector_system_route', bounds: { x: 900, y: 770, w: 1380, h: 490 } },
    { id: 'clause', label: '从句', nodeId: 'teach_clause_route', bounds: { x: 1180, y: 720, w: 1000, h: 570 } },
    { id: 'small_word', label: '小词', nodeId: 'noun_phrase_relation_route', bounds: { x: 940, y: 1360, w: 1440, h: 260 } }
  ];

var TEACHING_GRAMMAR_MINDMAPS = {
  predicate: {
    root: '语法体系',
    parent: { title: '动词系统', note: '句子主干由谓语支撑，动词题先判断是不是谓语。' },
    siblings: ['非谓语动词', '动词词形转换'],
    center: { title: '谓语动词', note: '一句话真正发生的动作或状态。' },
    branches: [
      { key: 'predicate-tense', title: '时态', note: '动作发生时间和叙述视角', leaves: ['一般现在', '一般过去', '完成时', '上下文时间线'], focusKeys: ['predicate-tense', 'predicate-perfect', 'predicate:tense:present', 'predicate:tense:past', 'predicate:tense:perfect', 'pred-objective-present', 'pred-past-time-marker', 'pred-present-perfect-since'] },
      { key: 'predicate-voice', title: '语态', note: '主语做动作，还是承受动作', leaves: ['主动', '被动 be done', '被动 + 时态', '被动 + 一致'], focusKeys: ['predicate-passive', 'predicate:passive', 'pred-passive-subject-receives'] },
      { key: 'predicate-agreement', title: '主谓一致', note: '谓语形式跟真正主语中心词走', leaves: ['单复数', '第三人称单数', '动名词主语', '插入语干扰'], focusKeys: ['predicate-agreement', 'predicate:sva', 'pred-subject-core-not-modifier', 'pred-gerund-subject-singular'] }
    ],
    rules: ['先确认句子缺谓语。', '再按时态、语态、主谓一致三条线核对。', '不要被修饰语或前一句时态带跑。']
  },
  nonpredicate: {
    root: '语法体系',
    parent: { title: '动词系统', note: '动词题三分流：谓语、非谓语、词性转换。' },
    siblings: ['谓语动词', '动词词形转换'],
    center: { title: '非谓语动词', note: '句中已有谓语时，动词要降级作成分。' },
    branches: [
      { key: 'to_do', title: 'to do', note: '目的、将来、搭配、疑问词结构', leaves: ['作目的状语', '作宾语', '疑问词 + to do', 'to be done'], focusKeys: ['to_do', 'to_be_done', 'nonpredicate-infinitive', 'nonpredicate-inf-passive', 'nonpredicate:to_do', 'nonpredicate:to_be_done', 'nonp-purpose-todo', 'nonp-question-word-todo', 'nonp-verb-object-todo', 'nonp-todo-passive-complement', 'nonp-first-last-only-todo'] },
      { key: 'doing', title: 'doing', note: '主动、进行、动名词', leaves: ['作主语 / 宾语', '作定语', '作状语', '作补语'], focusKeys: ['doing', 'being_done', 'nonpredicate-ing', 'nonpredicate-gerund', 'nonpredicate:doing', 'nonpredicate:being_done', 'nonp-gerund-after-prep', 'nonp-ing-adverbial-active', 'nonp-ing-postmodifier-active', 'nonp-object-complement-active'] },
      { key: 'done', title: 'done', note: '被动、完成、状态', leaves: ['后置定语', '作状语', '作补语', 'done vs being done'], focusKeys: ['done', 'nonpredicate-done', 'nonpredicate:done', 'nonp-done-postmodifier-passive', 'nonp-done-adverbial-passive'] },
      { key: 'function', title: '句法功能', note: '非谓语在句中充当什么成分', leaves: ['主语 / 表语', '宾语', '定语', '状语', '补语', 'with 复合结构'], focusKeys: ['subject_predicative', 'object', 'attribute', 'adverbial', 'complement', 'with_absolute'] }
    ],
    rules: ['第一步：句中有没有真正谓语。', '第二步：找非谓语的逻辑主语。', '第三步：按主动 / 被动 / 目的 / 完成选形式。']
  },
  word: {
    root: '语法体系',
    parent: { title: '词形与数量', note: '词性变化服务句子成分，不靠后缀感觉。' },
    siblings: ['名词数量', '拼写形式', '动词系统'],
    center: { title: '词性转换', note: '空格缺什么成分，就变成对应词性。' },
    branches: [
      { key: 'word-noun', title: '名词', note: '主语、宾语、介词宾语位置', leaves: ['动词变名词', '形容词变名词', '可数 / 不可数', '单复数'], focusKeys: ['word-noun-form', 'word-verb-to-noun', 'word:noun', 'word-verb-to-noun-branch', 'word-noun-after-article-prep', 'word-noun-derivation'] },
      { key: 'word-adj', title: '形容词', note: '修饰名词，或作表语 / 宾补', leaves: ['定语', '表语', '宾补', '-ed / -ing 形容词'], focusKeys: ['word-adjective', 'word:adjective', 'word-adj-before-noun', 'word-ed-ing'] },
      { key: 'word-adv', title: '副词', note: '修饰动词、形容词、副词或整句', leaves: ['修饰动词', '修饰形容词', '修饰整句', '句首大写'], focusKeys: ['word-adverb', 'word:adverb', 'word-adv-modifies-adj-verb-sentence'] },
      { key: 'word-form-check', title: '形式检查', note: '词性对了以后还要查形式', leaves: ['比较级 / 最高级', '复数', '拼写变化', '大小写'], focusKeys: ['word-noun-plural', 'word:plural', 'word:comparative', 'word-comparative-superlative-trigger', 'word-word-family-spelling', 'word-countable-plural-context'] }
    ],
    rules: ['先说空格作什么成分。', '再决定名词、形容词、副词或比较级。', '最后检查拼写、大小写和单复数。']
  },
  attrib: {
    root: '语法体系',
    parent: { title: '从句系统', note: '从句是主句里的一个成分，不是孤立句子。' },
    siblings: ['名词性从句', '状语从句'],
    center: { title: '定语从句', note: '修饰名词，核心看先行词和从句缺什么。' },
    branches: [
      { key: 'attrib-pronoun', title: '关系代词', note: '从句缺主语或宾语', leaves: ['who', 'which', 'that', 'whom'], focusKeys: ['attrib-relative-pronoun', 'attrib-which-that-for-things'] },
      { key: 'attrib-adverb', title: '关系副词', note: '从句主谓宾完整，缺状语', leaves: ['where', 'when', 'why', '介词 + which'], focusKeys: ['attrib-relative-adverb', 'attrib-where-when-why-complete-clause', 'advclause-when-vs-attrib-when'] },
      { key: 'attrib-whose', title: 'whose 所属', note: '空后有名词，表达所属关系', leaves: ['whose + 名词', '人 / 物都可', '所有关系'], focusKeys: ['attrib-whose', 'attrib-whose-possessive'] },
      { key: 'attrib-nonrestrictive', title: '非限制性', note: '有逗号，不能用 that', leaves: ['which', 'who', 'as', '逗号提示'], focusKeys: ['attrib-nonrestrictive-no-that'] }
    ],
    rules: ['先圈先行词。', '再把从句单独读，看缺主宾表还是状语。', '最后按成分选择关系词。']
  },
  nounclause: {
    root: '语法体系',
    parent: { title: '从句系统', note: '从句整体当名词用，承担名词性成分。' },
    siblings: ['定语从句', '状语从句'],
    center: { title: '名词性从句', note: '整个从句作主语、宾语、表语或同位语。' },
    branches: [
      { key: 'noun-role', title: '从句位置', note: '先判断它在主句中作什么', leaves: ['主语从句', '宾语从句', '表语从句', '同位语从句'], focusKeys: ['noun-subject', 'noun-object', 'noun-predicative'] },
      { key: 'noun-what', title: 'what / who 类', note: '连接词在从句中补成分', leaves: ['缺主语', '缺宾语', '缺表语', '有实际意义'], focusKeys: ['nounclause-what', 'nounclause-what-missing-subject-object'] },
      { key: 'noun-that', title: 'that', note: '从句结构完整，只起连接作用', leaves: ['不作成分', '无实义', '宾语从句可省'], focusKeys: ['nounclause-that', 'nounclause-connector-role'] },
      { key: 'noun-whether', title: 'whether / if', note: '表达是否，不作句子成分', leaves: ['是否', 'whether...or...', '介词后 whether'], focusKeys: ['nounclause-whether', 'nounclause-whether-if'] }
    ],
    rules: ['先判断整个从句作什么名词成分。', '再看从句内部缺不缺成分。', '缺成分用 what / who 类，完整再看 that / whether / how / why。']
  },
  advclause: {
    root: '语法体系',
    parent: { title: '从句系统', note: '状语从句表达主从句之间的逻辑关系。' },
    siblings: ['定语从句', '名词性从句'],
    center: { title: '状语从句', note: '回答时间、原因、条件、让步、目的、结果等关系。' },
    branches: [
      { key: 'adv-time', title: '时间', note: '动作发生的时间关系', leaves: ['when', 'while', 'before', 'after', 'as soon as'], focusKeys: ['advclause-time', 'advclause-when-vs-attrib-when', 'advclause-time-main-future-sub-present'] },
      { key: 'adv-reason', title: '原因', note: '解释为什么', leaves: ['because', 'since', 'as', 'now that'], focusKeys: ['advclause-cause', 'advclause-because-since-as'] },
      { key: 'adv-condition-concession', title: '条件 / 让步', note: '如果、即使、虽然', leaves: ['if', 'unless', 'although', 'though', 'even if'], focusKeys: ['advclause-concession', 'advclause-although-no-but'] },
      { key: 'adv-result-purpose', title: '目的 / 结果', note: '为了什么，导致什么', leaves: ['so that', 'so...that', 'in order that'], focusKeys: ['advclause-relation'] }
    ],
    rules: ['不要先翻译连词，先说前后句逻辑。', '时间 / 原因 / 条件 / 让步 / 结果要分清。', '特别区分 when 定语从句和 when 状语从句。']
  },
  article: {
    root: '语法体系',
    parent: { title: '功能词系统', note: '冠词、代词、介词、连词都在标记名词或句子关系。' },
    siblings: ['代词', '介词', '逻辑连词'],
    center: { title: '冠词', note: '名词前的限定：可数性、泛指 / 特指、固定结构。' },
    branches: [
      { key: 'article-a-an', title: 'a / an', note: '泛指一个单数可数名词', leaves: ['单数可数', '第一次出现', '泛指一个', '按发音选 a / an'], focusKeys: ['article-indefinite', 'article:a_an', 'article-a-an-sound', 'art-a-an'] },
      { key: 'article-the', title: 'the', note: '特指、共知、唯一或结构触发', leaves: ['上文提过', '后置限定', '独一无二', '最高级 / 序数词'], focusKeys: ['article-specific', 'article-superlative', 'article:the', 'article:the:fixed', 'article-specific-the', 'article-superlative-the', 'art-the', 'art-specific-indefinite'] },
      { key: 'article-zero', title: '零冠词', note: '不用冠词也有规则', leaves: ['复数泛指', '不可数泛指', '专有名词', '固定搭配'], focusKeys: ['article-zero', 'art-zero'] },
      { key: 'article-fixed', title: '固定结构', note: '先整体识别，再解释冠词', leaves: ['for the first time', 'in the end', 'a touch of', 'by accident'], focusKeys: ['article-fixed', 'article-fixed-phrase', 'art-other'] }
    ],
    rules: ['冠词必须和后面的名词一起读。', '先判名词可数性，再判泛指 / 特指。', '最后检查固定搭配和 a / an 发音。']
  },
  pronoun: {
    root: '语法体系',
    parent: { title: '功能词系统', note: '代词负责指代、替代和所有关系。' },
    siblings: ['冠词', '介词', '逻辑连词'],
    center: { title: '代词', note: '先找指代对象，再看它在句中作什么。' },
    branches: [
      { key: 'pron-personal', title: '人称 / 物主', note: '人称、数、格、所有关系', leaves: ['主格', '宾格', '形物代', '名物代'], focusKeys: ['pron-possessive', 'pronoun:物主/所有格', 'pron-possessive-before-noun', 'pron-possessive-noun-peoples', 'pron-personal-possessive'] },
      { key: 'pron-reflexive', title: '反身代词', note: '主宾同一或强调自身', leaves: ['myself', 'itself', 'themselves', 'by oneself'], focusKeys: ['pron-reflexive', 'pronoun:反身代词', 'pron-reflexive-same-subject'] },
      { key: 'pron-it', title: 'it', note: '回指、形式主语、形式宾语', leaves: ['回指前文', '形式主语', '形式宾语', '强调句'], focusKeys: ['pron-it', 'pron-it-reference'] },
      { key: 'pron-one', title: 'one / ones', note: '替代同类名词', leaves: ['单数 one', '复数 ones', '避免重复'], focusKeys: ['pron-one', 'pron-one-ones-substitution'] }
    ],
    rules: ['先回到上下文找它指谁。', '再看空格作主语、宾语、定语还是强调。', '最后核对人称、数、格。']
  },
  preposition: {
    root: '语法体系',
    parent: { title: '功能词系统', note: '介词把前后词块连接成关系。' },
    siblings: ['冠词', '代词', '逻辑连词'],
    center: { title: '介词', note: '既考固定搭配，也考时间、地点、方式、对象。' },
    branches: [
      { key: 'prep-collocation', title: '固定搭配', note: '动介、形介、名介搭配', leaves: ['depend on', 'prepare for', 'be suitable for', 'from...to'], focusKeys: ['prep-fixed', 'preposition:固定搭配', 'prep-fixed-collocation', 'prep-verb'] },
      { key: 'prep-time-place', title: '时间 / 地点', note: '定位时间点、区间和空间关系', leaves: ['at / on / in', 'by / until', 'in / on / at 地点', 'through / across'], focusKeys: ['prep-time', 'prep-location'] },
      { key: 'prep-means', title: '方式 / 工具', note: '用什么方式完成动作', leaves: ['by', 'with', 'through', 'without'], focusKeys: ['prep-by', 'prep-with', 'prep-by-means-or-difference', 'prep-with-tool-or-accompaniment'] },
      { key: 'prep-role-direction', title: '对象 / 身份 / 方向', note: '动作指向谁，身份是什么', leaves: ['for', 'to', 'into', 'as'], focusKeys: ['prep-for', 'prep-to', 'prep-as', 'prep-for-purpose-suitability', 'prep-to-direction-relation', 'prep-as-role'] }
    ],
    rules: ['先看空前核心词有没有固定搭配。', '如果不是搭配，再判断时间、地点、方式、对象或方向。', '介词题必须把前后词块一起读。']
  },
  logic: {
    root: '语法体系',
    parent: { title: '功能词系统', note: '连词标记词块、分句或句子之间的关系。' },
    siblings: ['冠词', '代词', '介词'],
    center: { title: '逻辑连词', note: '先判断前后信息关系，再选 and / but / or / so。' },
    branches: [
      { key: 'logic-coordinate', title: '并列 / 顺承', note: '同层级信息并列推进', leaves: ['and', 'as well as', 'both...and', '结构平行'], focusKeys: ['logic-parallel', 'logic:parallel', 'logic:and', 'logic-parallel-and'] },
      { key: 'logic-contrast', title: '转折 / 对比', note: '前后语义方向相反', leaves: ['but', 'yet', 'while', 'however'], focusKeys: ['logic-contrast', 'logic:contrast', 'logic:but', 'logic-not-only-but-also'] },
      { key: 'logic-choice', title: '选择 / 是否', note: '二选一或是否关系', leaves: ['or', 'whether...or', 'either...or'], focusKeys: ['logic-choice', 'logic:choice', 'logic:or', 'logic-whether-or'] },
      { key: 'logic-result', title: '因果 / 结果', note: '后句是前句结果', leaves: ['so', 'therefore', 'because', 'since'], focusKeys: ['logic-result', 'logic:result', 'logic:so', 'logic-cause-result-so'] }
    ],
    rules: ['先圈出被连接的两个成分。', '再说它们是并列、选择、转折还是因果。', '最后检查前后结构是否平行。']
  },
  number: {
    root: '语法体系',
    parent: { title: '词形与数量', note: '名词和数词形式都要服务数量意义。' },
    siblings: ['词性转换', '拼写形式'],
    center: { title: '名词数量 / 数词', note: '判断可数性、单复数、序数和比例表达。' },
    branches: [
      { key: 'num-countable', title: '可数 / 不可数', note: '名词能不能数，决定单复数和限定词', leaves: ['可数名词', '不可数名词', '抽象名词', '量词结构'], focusKeys: ['num-countable'] },
      { key: 'num-plural', title: '名词复数', note: '数量提示触发复数', leaves: ['many / several', 'these / those', '不同类别', '复数拼写'], focusKeys: ['num-plural', 'word-noun-plural', 'word-countable-plural-context'] },
      { key: 'number-cardinal-ordinal', title: '基数 / 序数', note: '数量和顺序不同', leaves: ['one / two', 'first / second', 'the + 序数词'], focusKeys: ['number-ordinal-the', 'num-quantity'] },
      { key: 'number-fraction-multiple', title: '分数 / 倍数', note: '比例和倍数表达', leaves: ['one third', 'twice', '倍数 + as...as', '分子分母'], focusKeys: ['number-fraction-expression'] }
    ],
    rules: ['先判断名词是否可数。', '再看语境是一个、多个、顺序还是比例。', '最后检查复数和序数拼写。']
  }
};

  function asArray(value) {
    if (Array.isArray(value)) return value;
    if (value === null || typeof value === 'undefined') return [];
    return [value];
  }

  function normalizeTab(tab) {
    if (tab === 'migration' || tab === 'knowledge' || tab === 'guide') return tab;
    if (tab === 'analysis' || tab === 'solution') return 'guide';
    return 'guide';
  }

  function getTabLabel(tab) {
    tab = normalizeTab(tab);
    if (tab === 'migration') return '迁移';
    if (tab === 'knowledge') return '图谱';
    return '讲题';
  }

  function buildHeaderInfo(q, deps) {
    q = q || {};
    deps = deps || {};
    var focus = deps.safeQuestionFocus ? deps.safeQuestionFocus(q) : null;
    focus = focus || { key: q.category || 'other', label: q.category || '语法填空', note: '' };
    var nonpAxis = deps.getNonpAxis ? deps.getNonpAxis(q) : null;
    var practicalGuide = deps.getQuestionPracticalGuide ? deps.getQuestionPracticalGuide(q, focus, nonpAxis) : null;
    var fineInfo = deps.getFineTagInfo ? deps.getFineTagInfo(q.fine_category) : null;
    var categoryMap = deps.categoryMap || {};
    return {
      focus: focus,
      nonpAxis: nonpAxis,
      practicalGuide: practicalGuide,
      categoryLabel: categoryMap[q.category] || q.category || '语法填空',
      headline: (practicalGuide && practicalGuide.title) || (fineInfo && fineInfo.name) || focus.label,
      subline: (practicalGuide && practicalGuide.trigger) || (fineInfo && fineInfo.category_name) || (focus && focus.note) || ''
    };
  }

  function uniqueExistingNodeIds(ids, nodes) {
    var seen = {};
    nodes = nodes || {};
    return (ids || []).filter(function(id) {
      if (!id || seen[id] || !nodes[id]) return false;
      seen[id] = true;
      return true;
    });
  }

  function getKnowledgeNodeIds(q, deps) {
    q = q || {};
    deps = deps || {};
    var graph = deps.knowledgeCore || {};
    var ids = [];
    var trapId = deps.safeQuestionTrapId ? deps.safeQuestionTrapId(q) : '';
    if (trapId && graph.trap_to_nodes && graph.trap_to_nodes[trapId]) {
      ids = ids.concat(graph.trap_to_nodes[trapId]);
    }
    if (q.category && graph.category_to_nodes && graph.category_to_nodes[q.category]) {
      ids = ids.concat(graph.category_to_nodes[q.category]);
    }
    return uniqueExistingNodeIds(ids, graph.nodes);
  }

  function getGraphNodeIdForQuestion(q, deps) {
    q = q || {};
    deps = deps || {};
    var graph = deps.knowledgeCore || {};
    var trapId = deps.safeQuestionTrapId ? deps.safeQuestionTrapId(q) : '';
    var fine = q.fine_category || '';
    var category = q.category || '';
    var candidates = [];

    if (fine && graph.graph_fine_to_nodes && graph.graph_fine_to_nodes[fine]) {
      candidates = candidates.concat(graph.graph_fine_to_nodes[fine]);
    }
    if (trapId && graph.graph_trap_to_nodes && graph.graph_trap_to_nodes[trapId]) {
      candidates = candidates.concat(graph.graph_trap_to_nodes[trapId]);
    }
    if (category && graph.graph_category_to_nodes && graph.graph_category_to_nodes[category]) {
      candidates = candidates.concat(graph.graph_category_to_nodes[category]);
    }

    var seen = {};
    candidates = candidates.filter(function(id) {
      if (!id || seen[id]) return false;
      seen[id] = true;
      return true;
    });

    for (var i = 0; i < GRAPH_NODE_PRIORITY.length; i++) {
      if (candidates.indexOf(GRAPH_NODE_PRIORITY[i]) !== -1) return GRAPH_NODE_PRIORITY[i];
    }
    if (candidates.length) return candidates[0];
    return CATEGORY_GRAPH_FALLBACK[category] || 'teach_start';
  }

  function getMindmapActiveKeys(q, deps) {
    q = q || {};
    deps = deps || {};
    var active = {};
    function add(key) {
      if (key) active[String(key)] = true;
    }
    var focus = deps.safeQuestionFocus ? deps.safeQuestionFocus(q) : null;
    var trapId = deps.safeQuestionTrapId ? deps.safeQuestionTrapId(q) : '';
    var nonpAxis = deps.getNonpAxis ? deps.getNonpAxis(q) : null;
    var guide = deps.getQuestionPracticalGuide ? deps.getQuestionPracticalGuide(q, focus, nonpAxis) : null;

    add(q.fine_category);
    add(focus && focus.key);
    add(trapId);
    asArray(guide && guide.migrationKeys).forEach(add);
    if (nonpAxis) {
      add(nonpAxis.formKey);
      add(nonpAxis.functionKey);
      add('nonpredicate:' + nonpAxis.formKey);
      add('nonpredicate:' + nonpAxis.functionKey);
      add('nonpredicate:' + nonpAxis.formKey + ':' + nonpAxis.functionKey);
    }
    return active;
  }

  function mindmapKeyMatches(ref, active) {
    ref = String(ref || '');
    active = active || {};
    if (!ref) return false;
    if (active[ref]) return true;
    return Object.keys(active).some(function(key) {
      if (!key) return false;
      return key.indexOf(ref + ':') === 0 || ref.indexOf(key + ':') === 0;
    });
  }

  function isMindmapBranchActive(branch, active) {
    var refs = [branch && branch.key].concat((branch && branch.focusKeys) || []);
    return refs.some(function(ref) { return mindmapKeyMatches(ref, active); });
  }

  function getMindmapDefinition(q) {
    q = q || {};
    return TEACHING_GRAMMAR_MINDMAPS[q.category] || null;
  }

  function getMindmapFallback(q, deps) {
    q = q || {};
    var header = buildHeaderInfo(q, deps);
    return {
      root: '语法体系',
      parent: { title: '语法填空', note: '所有题都先回到句子结构和空格功能。' },
      siblings: ['谓语 / 非谓语', '词形转换', '从句', '功能词'],
      center: { title: header.categoryLabel || '当前考点', note: header.subline || '先判断空格在句中承担什么功能。' },
      branches: [
        { key: 'structure', title: '句子结构', note: '找主干和修饰成分', leaves: ['主语', '谓语', '宾语', '修饰语'], focusKeys: [] },
        { key: 'function', title: '空格功能', note: '判断空格作什么成分', leaves: ['名词性成分', '修饰成分', '连接关系', '固定搭配'], focusKeys: [] },
        { key: 'form', title: '形式检查', note: '答案形式必须和语境匹配', leaves: ['时态', '单复数', '大小写', '拼写'], focusKeys: [] }
      ],
      rules: ['先找句子主干。', '再判断空格功能。', '最后核对答案形式。']
    };
  }

  function buildGraphNodeIndex(graph, knowledgeNodes) {
    graph = graph || {};
    knowledgeNodes = knowledgeNodes || {};
    var index = {};
    (graph.nodes || []).forEach(function(node) {
      index[node.id] = Object.assign({}, knowledgeNodes[node.id] || {}, node);
    });
    return index;
  }

  function getGraphNodeTypeLabel(type) {
    return GRAPH_NODE_TYPE_LABELS[type] || '图谱节点';
  }

  function getGraphTypeColor(type) {
    return GRAPH_TYPE_COLORS[type] || '#409cff';
  }

  function getGraphNodeSize(node) {
    node = node || {};
    if (node.type === 'diagnosis' && node.id === 'teach_start') return { w: 240, h: 112 };
    if (node.type === 'route') return { w: 250, h: 112 };
    if (node.type === 'rule') return { w: 250, h: 108 };
    if (node.type === 'trap') return { w: 260, h: 112 };
    if (node.type === 'resource') return { w: 230, h: 104 };
    return { w: 250, h: 110 };
  }

  function getGraphRelevantIds(nodeId, graph, nodes) {
    graph = graph || {};
    nodes = nodes || {};
    var selected = nodes[nodeId];
    var ids = {};
    if (nodeId) ids[nodeId] = true;
    if (selected && selected.parent) ids[selected.parent] = true;
    if (selected && selected.focus_group) {
      (graph.nodes || []).forEach(function(node) {
        if (node.focus_group === selected.focus_group && node.type !== 'trap') ids[node.id] = true;
      });
    }
    (graph.edges || []).forEach(function(edge) {
      if (edge.from === nodeId) ids[edge.to] = true;
      if (edge.to === nodeId) ids[edge.from] = true;
      if (selected && selected.parent && edge.from === selected.parent) ids[edge.to] = true;
    });
    (graph.nodes || []).forEach(function(node) {
      if (node.parent === nodeId) ids[node.id] = true;
    });
    return Object.keys(ids);
  }

  function graphHasFocus(id, focusIds) {
    focusIds = focusIds || [];
    return !focusIds.length || focusIds.indexOf(id) !== -1;
  }

  function graphEdgeActive(edge, focusIds) {
    focusIds = focusIds || [];
    edge = edge || {};
    return focusIds.indexOf(edge.from) !== -1 && focusIds.indexOf(edge.to) !== -1;
  }

  function getGlobalGraphFocusPresets() {
    return GLOBAL_GRAPH_FOCUS_PRESETS.slice();
  }

  function getGlobalGraphFocusPreset(id) {
    var presets = getGlobalGraphFocusPresets();
    for (var i = 0; i < presets.length; i++) {
      if (presets[i].id === id) return presets[i];
    }
    return presets[0];
  }

  function getGraphBoundsForNodes(ids, nodes) {
    nodes = nodes || {};
    var minX = Infinity;
    var minY = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;
    (ids || []).forEach(function(id) {
      var node = nodes[id];
      if (!node) return;
      var size = getGraphNodeSize(node);
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + size.w);
      maxY = Math.max(maxY, node.y + size.h);
    });
    if (!isFinite(minX)) return null;
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }

  function renderGraphTextLines(text, maxChars, maxLines) {
    var raw = String(text || '').trim();
    if (!raw) return [];
    var lines = [];
    var rest = raw;
    while (rest && lines.length < maxLines) {
      if (rest.length <= maxChars) {
        lines.push(rest);
        break;
      }
      var cut = rest.lastIndexOf(' ', maxChars);
      if (cut < 8) cut = maxChars;
      lines.push(rest.slice(0, cut));
      rest = rest.slice(cut).trim();
    }
    if (rest && lines.length === maxLines) {
      lines[lines.length - 1] = lines[lines.length - 1].replace(/[，。；、,.!?]*$/, '') + '…';
    }
    return lines;
  }

  function getGraphNodeLabelGroups(node, deps) {
    node = node || {};
    deps = deps || {};
    var categoryMap = deps.categoryMap || {};
    var knowledgeData = deps.knowledgeData || {};
    var fineTags = deps.fineTags || {};
    var getTrapById = deps.getTrapById || function() { return null; };
    var categories = (node.category_refs || []).map(function(cat) {
      return categoryMap[cat] || (knowledgeData[cat] && knowledgeData[cat].title) || cat;
    });
    var fineLabels = (node.fine_refs || []).map(function(id) {
      var tag = fineTags.tags_by_id && fineTags.tags_by_id[id];
      return tag ? tag.name : id;
    });
    var traps = (node.trap_refs || []).map(function(id) {
      var trap = getTrapById(id);
      return trap ? trap.name : id;
    });
    return {
      categories: categories,
      fineTags: fineLabels,
      traps: traps,
      all: categories.concat(fineLabels).concat(traps)
    };
  }

  function getGraphNodePath(node, nodes, maxDepth) {
    node = node || {};
    nodes = nodes || {};
    maxDepth = maxDepth || 6;
    var path = [];
    var cursor = node;
    var guard = 0;
    while (cursor && cursor.parent && guard < maxDepth) {
      var parent = nodes[cursor.parent];
      if (!parent) break;
      path.unshift(parent.title || parent.id);
      cursor = parent;
      guard++;
    }
    if (node.id || node.title) path.push(node.title || node.id);
    return path;
  }

  function graphNodeMatchesQuestion(node, q, deps) {
    node = node || {};
    q = q || {};
    deps = deps || {};
    var cats = node.category_refs || [];
    var fines = node.fine_refs || [];
    var traps = node.trap_refs || [];
    var trapId = deps.safeQuestionTrapId ? deps.safeQuestionTrapId(q) : (q.trap_id || '');
    return (q.category && cats.indexOf(q.category) !== -1)
      || (q.fine_category && fines.indexOf(q.fine_category) !== -1)
      || (trapId && traps.indexOf(trapId) !== -1);
  }

  function getGlobalGraphQuestionMatches(node, bankQuestions, errorQuestions, deps) {
    deps = deps || {};
    return {
      bank: (bankQuestions || []).filter(function(q) { return graphNodeMatchesQuestion(node, q, deps); }),
      errors: (errorQuestions || []).filter(function(q) { return graphNodeMatchesQuestion(node, q, deps); })
    };
  }

  function searchGraphNodes(query, nodes, deps, limit) {
    var q = String(query || '').trim().toLowerCase();
    if (!q) return [];
    nodes = nodes || {};
    deps = deps || {};
    limit = limit || 12;
    return Object.keys(nodes).map(function(id) { return nodes[id]; }).filter(function(node) {
      var labels = getGraphNodeLabelGroups(node, deps);
      var hay = [
        node.title,
        node.subtitle,
        node.desc,
        node.teacher_move,
        node.student_goal,
        node.decision_tip,
        (node.next_steps || []).join(' '),
        labels.all.join(' ')
      ].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    }).slice(0, limit);
  }

  function getNodeCategoryLabels(node, categoryMap, knowledgeData) {
    return getGraphNodeLabelGroups(node, {
      categoryMap: categoryMap,
      knowledgeData: knowledgeData
    }).categories;
  }

  function getRootColorStyle(root) {
    root = root || {};
    var map = {
      blue: '#0071e3',
      green: '#34c759',
      purple: '#af52de',
      orange: '#ff9500',
      red: '#ff3b30'
    };
    return map[root.color] || 'var(--accent)';
  }

  window.GrammarTeachingViewModel = {
    GRAPH_NODE_PRIORITY: GRAPH_NODE_PRIORITY,
    CATEGORY_GRAPH_FALLBACK: CATEGORY_GRAPH_FALLBACK,
    GRAPH_NODE_TYPE_LABELS: GRAPH_NODE_TYPE_LABELS,
    GRAPH_TYPE_COLORS: GRAPH_TYPE_COLORS,
    GLOBAL_GRAPH_FOCUS_PRESETS: GLOBAL_GRAPH_FOCUS_PRESETS,
    TEACHING_GRAMMAR_MINDMAPS: TEACHING_GRAMMAR_MINDMAPS,
    normalizeTab: normalizeTab,
    getTabLabel: getTabLabel,
    buildHeaderInfo: buildHeaderInfo,
    getKnowledgeNodeIds: getKnowledgeNodeIds,
    getGraphNodeIdForQuestion: getGraphNodeIdForQuestion,
    getMindmapActiveKeys: getMindmapActiveKeys,
    mindmapKeyMatches: mindmapKeyMatches,
    isMindmapBranchActive: isMindmapBranchActive,
    getMindmapDefinition: getMindmapDefinition,
    getMindmapFallback: getMindmapFallback,
    buildGraphNodeIndex: buildGraphNodeIndex,
    getGraphNodeTypeLabel: getGraphNodeTypeLabel,
    getGraphTypeColor: getGraphTypeColor,
    getGraphNodeSize: getGraphNodeSize,
    getGraphRelevantIds: getGraphRelevantIds,
    graphHasFocus: graphHasFocus,
    graphEdgeActive: graphEdgeActive,
    getGlobalGraphFocusPresets: getGlobalGraphFocusPresets,
    getGlobalGraphFocusPreset: getGlobalGraphFocusPreset,
    getGraphBoundsForNodes: getGraphBoundsForNodes,
    renderGraphTextLines: renderGraphTextLines,
    getGraphNodeLabelGroups: getGraphNodeLabelGroups,
    getGraphNodePath: getGraphNodePath,
    graphNodeMatchesQuestion: graphNodeMatchesQuestion,
    getGlobalGraphQuestionMatches: getGlobalGraphQuestionMatches,
    searchGraphNodes: searchGraphNodes,
    getNodeCategoryLabels: getNodeCategoryLabels,
    getRootColorStyle: getRootColorStyle
  };
})();
