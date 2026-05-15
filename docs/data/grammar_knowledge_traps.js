// 语法填空 · 二级陷阱标签库
// 定位：在 11 类 category 之下，给讲题、错题热图、AI 助手共用的细粒度知识抓手。
// 原则：category 是入口；trap 才是讲题时真正要点破的“学生卡点”。
// 更新时间：2026-05-15

(function () {
  const DATA = {
    version: '0.1.0',
    updated_at: '2026-05-15',
    source_roles: {
      grammar_master: '承重墙：语法事实、细则、易混规则的主要依据',
      pep_appendix: '承重墙：与教材话术对齐，尤其是非谓语、从句、时态语态',
      curriculum_standard: '指南针：决定讲解深度，不把偏怪知识前置',
      exam_bank: '校准器：用真题反链验证哪些 trap 值得优先讲'
    },
    schema: {
      id: '稳定的二级标签 id，可写入题目 trap_id',
      category: '现有 11 类粗标签，不替换原分类',
      name: '给老师/学生看的陷阱名',
      frequency: '高频 / 中频 / 低频 / 储备',
      one_liner: '讲题时先抛出的一句话',
      micro_rule: '真正可操作的小规则',
      common_wrong_answers: '学生常见误填或误判',
      teaching_move: '课堂点拨动作',
      examples: '当前题库中可反链的真题',
      compare_with: '容易混淆的其他 trap',
      sources: '承重墙来源，优先语法通霸 + 人教版教材附录'
    },
    categories: {
      predicate: '谓语动词',
      nonpredicate: '非谓语动词',
      word: '词性转换',
      number: '数词',
      article: '冠词',
      pronoun: '代词',
      preposition: '介词',
      logic: '逻辑连词',
      attrib: '定语从句',
      nounclause: '名词性从句',
      advclause: '状语从句'
    },
    traps: [
      {
        id: 'pred-find-real-predicate',
        category: 'predicate',
        name: '先判空格是不是谓语',
        frequency: '高频',
        one_liner: '一看到动词括号，先数句子里有没有真正谓语。',
        micro_rule: '一个简单句或从句通常只能有一个谓语；已有谓语且无连词，空格多半转向非谓语。',
        common_wrong_answers: ['把非谓语误写成谓语', '看到动词就先套时态'],
        teaching_move: '让学生先圈连词和已有谓语，再决定填谓语还是非谓语。',
        examples: [
          { exam: '2024广州二模', no: 39, answer: 'requires' },
          { exam: '2024深圳二模', no: 39, answer: 'houses' }
        ],
        compare_with: ['nonp-finite-or-nonfinite'],
        sources: ['语法通霸/01.句子结构和成分/05.简单句、并列句和复合句.md', '语法通霸/04.动词的非谓语形式/01.基础知识.md']
      },
      {
        id: 'pred-objective-present',
        category: 'predicate',
        name: '客观事实用一般现在时',
        frequency: '高频',
        one_liner: '文章在介绍事实、规律、功能时，不要被上下文过去信息带跑。',
        micro_rule: '说明客观情况、作品内容、场馆功能、习惯性动作时，常用一般现在时；主语单数要加 -s。',
        common_wrong_answers: ['误用一般过去时', '第三人称单数漏 -s'],
        teaching_move: '追问“这是一次过去动作，还是这东西一直如此？”',
        examples: [
          { exam: '2024全国一卷', no: 60, answer: 'walks' },
          { exam: '2025全国一卷', no: 61, answer: 'tries' },
          { exam: '2025广州二模', no: 64, answer: 'bridges' }
        ],
        compare_with: ['pred-past-time-marker'],
        sources: ['语法通霸/11.动词的时态/01.一般现在时.md', '人教版高中英语教材语法附录合集/时态系统.md']
      },
      {
        id: 'pred-past-time-marker',
        category: 'predicate',
        name: '明确过去时间触发一般过去时',
        frequency: '高频',
        one_liner: '看到 in 2021、as a little girl、recent ceremony 这类过去锚点，谓语先往过去看。',
        micro_rule: '明确过去时间点或过去经历叙述，谓语一般用过去式；若主语承受动作，用一般过去时被动。',
        common_wrong_answers: ['误用现在完成时', '被动结构漏 be'],
        teaching_move: '让学生把时间锚点划出来，再问主语是做动作还是被动作。',
        examples: [
          { exam: '2023全国二卷', no: 65, answer: 'wished' },
          { exam: '2024全国二卷', no: 41, answer: 'was built' },
          { exam: '2024深圳二模', no: 43, answer: 'was recognized' }
        ],
        compare_with: ['pred-present-perfect-since'],
        sources: ['语法通霸/11.动词的时态/02.一般过去时，一般将来时，过去将来时.md']
      },
      {
        id: 'pred-present-perfect-since',
        category: 'predicate',
        name: 'since / in recent years 触发现完',
        frequency: '高频',
        one_liner: 'since 不是“过去”，它是在问过去到现在这条线。',
        micro_rule: 'since + 过去点、in/over/during the past years、so far、ever since 常触发现完；强调持续可用现完进行。',
        common_wrong_answers: ['误填一般过去时', '只看 since 后过去式而忽略主句'],
        teaching_move: '把时间线画成“过去点 -> 现在”，让学生定位主句动作覆盖的区间。',
        examples: [
          { exam: '2024广州一模', no: 39, answer: 'has been advocating / has advocated' },
          { exam: '2024浙江首考', no: 62, answer: 'have started' }
        ],
        compare_with: ['pred-past-time-marker'],
        sources: ['语法通霸/11.动词的时态/04.现在完成时，现在完成进行时.md', '人教版高中英语教材语法附录合集/时态系统.md']
      },
      {
        id: 'pred-passive-subject-receives',
        category: 'predicate',
        name: '主语承受动作要被动',
        frequency: '高频',
        one_liner: '谓语题不要先想时态，先问主语能不能自己做这个动作。',
        micro_rule: '主语是动作承受者，谓语用 be done；be 随时态、人称、数变化，done 不变。',
        common_wrong_answers: ['漏 be 只填过去分词', '只填 be 不填 done', '主被动判断反了'],
        teaching_move: '把主语和动词恢复成“主语 + be + done by ...”检查是否通顺。',
        examples: [
          { exam: '2024广州一模', no: 37, answer: 'were designed' },
          { exam: '2025全国一卷', no: 60, answer: 'are revealed' },
          { exam: '2025广州一模', no: 37, answer: 'were selected' }
        ],
        compare_with: ['pred-active-form-passive-meaning', 'nonp-done-postmodifier-passive'],
        sources: ['语法通霸/12.被动语态/01.被动语态的构成.md', '人教版高中英语教材语法附录合集/被动语态.md']
      },
      {
        id: 'pred-active-form-passive-meaning',
        category: 'predicate',
        name: '主动形式表被动意义',
        frequency: '中频',
        one_liner: '不是所有“被……”都能写 be done，有些英语习惯用主动壳。',
        micro_rule: 'sell/read/write/wash well，need/want/require doing，be worth doing，be to blame 等常用主动形式表达被动意义。',
        common_wrong_answers: ['机械改成 be done', 'need 后误填 to do 主动式'],
        teaching_move: '让学生判断这是结构固定，还是普通主被动转换。',
        examples: [],
        compare_with: ['pred-passive-subject-receives', 'nonp-gerund-after-prep'],
        sources: ['语法通霸/12.被动语态/02.主动形式表示被动意义.md']
      },
      {
        id: 'pred-gerund-subject-singular',
        category: 'predicate',
        name: '动名词 / 不定式短语作主语看单数',
        frequency: '高频',
        one_liner: '一整段动作当主语，谓语通常当单数处理。',
        micro_rule: '单个动名词短语、动词不定式短语或主语从句作主语时，谓语多用单数。',
        common_wrong_answers: ['被宾语复数诱导误用复数谓语'],
        teaching_move: '让学生用括号框住整个主语短语，找真正主语中心。',
        examples: [
          { exam: '2024广州二模', no: 39, answer: 'requires' },
          { exam: '2024深圳一模', no: 39, answer: 'requires' },
          { exam: '2025广州二模', no: 64, answer: 'bridges' }
        ],
        compare_with: ['pred-subject-core-not-modifier'],
        sources: ['语法通霸/15.主谓一致/01.语法形式一致原则.md', '语法通霸/04.动词的非谓语形式/02.作主语和表语.md']
      },
      {
        id: 'pred-subject-core-not-modifier',
        category: 'predicate',
        name: '主谓一致看中心词，不看修饰语',
        frequency: '高频',
        one_liner: '离谓语最近的不一定是主语，of 后面的复数常常只是干扰。',
        micro_rule: 'with/as well as/together with/of 短语等修饰成分不决定谓语单复数；先找主语中心词。',
        common_wrong_answers: ['被 of 后复数名词诱导', '被插入语诱导'],
        teaching_move: '划掉介词短语和插入修饰，再读主干。',
        examples: [
          { exam: '2025全国二卷', no: 41, answer: 'is' }
        ],
        compare_with: ['pred-near-agreement'],
        sources: ['语法通霸/15.主谓一致/01.语法形式一致原则.md']
      },
      {
        id: 'pred-near-agreement',
        category: 'predicate',
        name: '就近一致别套中心词规则',
        frequency: '中频',
        one_liner: 'there be、either...or... 这类题要看最近的那个主语。',
        micro_rule: 'there be、either...or、neither...nor、not only...but also 等结构中，谓语常与最近主语一致。',
        common_wrong_answers: ['一律找第一个主语', '忽略 there be 倒装结构'],
        teaching_move: '让学生标出并列主语，再用箭头指向离谓语最近的名词。',
        examples: [],
        compare_with: ['pred-subject-core-not-modifier'],
        sources: ['语法通霸/15.主谓一致/02.意义一致原则，就近一致原则.md']
      },
      {
        id: 'pred-modal-passive-base',
        category: 'predicate',
        name: '情态 / 助动词后动词形态锁死',
        frequency: '中频',
        one_liner: '空前有情态、助动词或 be to，后面形式先被结构锁住。',
        micro_rule: '情态动词后用 do；情态被动为 modal + be done；be to do 表安排、义务、可能。',
        common_wrong_answers: ['情态后误加三单', '被动漏 be'],
        teaching_move: '先读空前结构，再判断主被动，不急着套时态。',
        examples: [
          { exam: '2024浙江首考', no: 61, answer: 'be offered' }
        ],
        compare_with: ['pred-passive-subject-receives'],
        sources: ['语法通霸/09.情态动词/01.情态动词的语法特征.md', '语法通霸/12.被动语态/01.被动语态的构成.md']
      },

      {
        id: 'nonp-finite-or-nonfinite',
        category: 'nonpredicate',
        name: '谓语还是非谓语先分流',
        frequency: '高频',
        one_liner: '非谓语题第一步不是 doing/done/to do，而是确认它没有资格做谓语。',
        micro_rule: '句中已有谓语且没有并列连词或从句引导词时，括号动词通常用非谓语。',
        common_wrong_answers: ['把分词误当第二个谓语', '漏看 and/but/which/when 等连接结构'],
        teaching_move: '圈出全句已有谓语和连接词，让学生解释空格为什么不能再作谓语。',
        examples: [
          { exam: '2024全国二卷', no: 44, answer: 'Recalling' },
          { exam: '2024深圳一模', no: 38, answer: 'using' }
        ],
        compare_with: ['pred-find-real-predicate'],
        sources: ['语法通霸/04.动词的非谓语形式/01.基础知识.md']
      },
      {
        id: 'nonp-logical-subject-not-sentence-subject',
        category: 'nonpredicate',
        name: '逻辑主语不一定是句子主语',
        frequency: '高频',
        one_liner: 'doing/done 前先找“谁做这个动作”，不要只盯句子主语。',
        micro_rule: '作定语看被修饰词，作宾补看宾语，作状语多看句子主语；逻辑主语不同，答案会完全变。',
        common_wrong_answers: ['误把句子主语当逻辑主语', '作定语时没看前面名词'],
        teaching_move: '把空格动词改写成一个小句子：X does/is done by Y。',
        examples: [
          { exam: '2025深圳一模', no: 45, answer: 'paired' },
          { exam: '2024深圳一模', no: 42, answer: 'drawn' },
          { exam: '2023全国一卷', no: 65, answer: 'wanting' }
        ],
        compare_with: ['nonp-done-postmodifier-passive', 'nonp-ing-adverbial-active'],
        sources: ['语法通霸/04.动词的非谓语形式/01.基础知识.md', '人教版高中英语教材语法附录合集/过去分词.md']
      },
      {
        id: 'nonp-done-postmodifier-passive',
        category: 'nonpredicate',
        name: '过去分词作后置定语表被动/完成',
        frequency: '高频',
        one_liner: '名词后面跟 done，常是在压缩一个“被……”的定语从句。',
        micro_rule: '被修饰名词与动词构成动宾关系，用过去分词作定语；可还原为 which/that is/was done。',
        common_wrong_answers: ['误填 doing', '误填谓语被动'],
        teaching_move: '让学生把分词还原成定语从句，看主被动是否成立。',
        examples: [
          { exam: '2023全国一卷', no: 59, answer: 'recognized' },
          { exam: '2024深圳二模', no: 36, answer: 'created' },
          { exam: '2024全国二卷', no: 40, answer: 'inspired' }
        ],
        compare_with: ['attrib-which-that-for-things', 'nonp-being-done-vs-done'],
        sources: ['语法通霸/04.动词的非谓语形式/04.作定语.md', '人教版高中英语教材语法附录合集/过去分词.md']
      },
      {
        id: 'nonp-ing-postmodifier-active',
        category: 'nonpredicate',
        name: '现在分词作后置定语表主动/进行',
        frequency: '高频',
        one_liner: '名词自己发出动作，后面用 doing 去修饰它。',
        micro_rule: '被修饰名词与动词构成主谓关系，用现在分词作定语；可还原为 which/that does/is doing。',
        common_wrong_answers: ['误填 done', '把形容词化分词和动词分词混淆'],
        teaching_move: '追问“这个名词会不会自己做这个动作？”',
        examples: [
          { exam: '2024广州一模', no: 36, answer: 'dating' },
          { exam: '2025深圳一模', no: 37, answer: 'featuring' }
        ],
        compare_with: ['nonp-done-postmodifier-passive', 'word-ing-ed-adjective-feeling'],
        sources: ['语法通霸/04.动词的非谓语形式/04.作定语.md', '人教版高中英语教材语法附录合集/动词-ing形式.md']
      },
      {
        id: 'nonp-purpose-todo',
        category: 'nonpredicate',
        name: 'to do 表目的',
        frequency: '高频',
        one_liner: '如果能问“为了什么”，优先考虑 to do。',
        micro_rule: '不定式作状语常表示目的或将来；in order to / so as to 可帮助验证。',
        common_wrong_answers: ['误填 doing 表伴随', '忽略动作未发生'],
        teaching_move: '让学生在句中补出“为了……”，看语义是否通顺。',
        examples: [
          { exam: '2024全国一卷', no: 58, answer: 'to give' },
          { exam: '2024广州一模', no: 41, answer: 'to save' },
          { exam: '2024浙江首考', no: 56, answer: 'to benefit' }
        ],
        compare_with: ['nonp-ing-adverbial-active'],
        sources: ['语法通霸/04.动词的非谓语形式/05.作状语(一).md', '人教版高中英语教材语法附录合集/动词不定式.md']
      },
      {
        id: 'nonp-verb-object-todo',
        category: 'nonpredicate',
        name: '特定动词后接 to do 作宾语',
        frequency: '高频',
        one_liner: 'hope、decide、want 这类动词后面，答案常被搭配直接锁定。',
        micro_rule: 'decide/hope/want/plan/refuse/promise/agree/expect/manage 等后常接 to do。',
        common_wrong_answers: ['误填 doing', '漏 to'],
        teaching_move: '让学生先识别空前动词是否属于“to do 动词名单”。',
        examples: [
          { exam: '2023全国一卷', no: 57, answer: 'to bite' },
          { exam: '2025全国一卷', no: 58, answer: 'to present' }
        ],
        compare_with: ['nonp-gerund-after-prep', 'nonp-verb-object-meaning-shift'],
        sources: ['语法通霸/04.动词的非谓语形式/03.作宾语.md']
      },
      {
        id: 'nonp-question-word-todo',
        category: 'nonpredicate',
        name: '疑问词 / whether + to do',
        frequency: '高频',
        one_liner: 'whether/how/what 后接 to do，是把“要不要/怎样/做什么”压缩成一个不定式短语。',
        micro_rule: '疑问词或 whether + to do 在句中作名词性成分，常作 decide/know/tell/show 等动词的宾语。',
        common_wrong_answers: ['误填 doing', '漏掉 to', '把 whether 当普通连词后面硬接完整从句'],
        teaching_move: '让学生把它还原成一个完整问题：whether to bite = whether they should bite。',
        examples: [
          { exam: '2023全国一卷', no: 57, answer: 'to bite' }
        ],
        compare_with: ['nonp-verb-object-todo', 'nonp-purpose-todo'],
        sources: ['语法通霸/04.动词的非谓语形式/03.作宾语.md', '人教版高中英语教材语法附录合集/动词不定式.md']
      },
      {
        id: 'nonp-gerund-after-prep',
        category: 'nonpredicate',
        name: '介词后接 doing',
        frequency: '高频',
        one_liner: '介词后面要名词性成分，动词就变 doing。',
        micro_rule: '普通介词和含介词 to 的短语后接动名词，如 beyond doing, look forward to doing, be used to doing。',
        common_wrong_answers: ['把介词 to 误认为不定式 to', '介词后误填原形'],
        teaching_move: '让学生判断 to 是不定式符号还是介词。',
        examples: [
          { exam: '2024深圳二模', no: 41, answer: 'exhibiting' }
        ],
        compare_with: ['nonp-verb-object-todo', 'prep-fixed-collocation'],
        sources: ['语法通霸/04.动词的非谓语形式/03.作宾语.md']
      },
      {
        id: 'nonp-object-complement-active',
        category: 'nonpredicate',
        name: '宾补看宾语的主被动关系',
        frequency: '高频',
        one_liner: '补语不是补主语，是补前面的宾语。',
        micro_rule: 'leave/find/keep/see/hear/make/have + 宾语 + doing/done/to do 时，空格与宾语形成逻辑关系。',
        common_wrong_answers: ['误看句子主语', '被被动句壳干扰'],
        teaching_move: '把宾语和空格动词单独拿出来造小句。',
        examples: [
          { exam: '2023全国一卷', no: 61, answer: 'to be lifted' },
          { exam: '2023全国一卷', no: 65, answer: 'wanting' }
        ],
        compare_with: ['nonp-logical-subject-not-sentence-subject'],
        sources: ['语法通霸/04.动词的非谓语形式/08.作补语.md', '人教版高中英语教材语法附录合集/动词不定式.md']
      },
      {
        id: 'nonp-ing-adverbial-active',
        category: 'nonpredicate',
        name: '现在分词作状语表主动/伴随',
        frequency: '高频',
        one_liner: '主语一边做谓语动作，一边做空格动作，常用 doing。',
        micro_rule: '非谓语作状语且与句子主语为主动关系，可用 doing；表示伴随、时间、原因、结果等。',
        common_wrong_answers: ['误填 to do 表目的', '误填 done'],
        teaching_move: '问“这个动作和谓语动作是同时/顺带发生，还是为了做？”',
        examples: [
          { exam: '2024全国二卷', no: 44, answer: 'Recalling' },
          { exam: '2024深圳一模', no: 38, answer: 'using' }
        ],
        compare_with: ['nonp-purpose-todo', 'nonp-done-adverbial-passive'],
        sources: ['语法通霸/04.动词的非谓语形式/05.作状语(一).md', '人教版高中英语教材语法附录合集/动词-ing形式.md']
      },
      {
        id: 'nonp-done-adverbial-passive',
        category: 'nonpredicate',
        name: '过去分词作状语表被动/状态',
        frequency: '中频',
        one_liner: '句首 done 不一定是谓语，常是在压缩“when/if/because it is done”。',
        micro_rule: '作状语的动词与句子主语为被动关系，用 done；常表示时间、原因、条件、方式。',
        common_wrong_answers: ['看到句首动词就写谓语', '误填 doing'],
        teaching_move: '让学生补出状语从句，检查主语和动作关系。',
        examples: [
          { exam: '2026广州一模', no: 36, answer: 'from' }
        ],
        compare_with: ['nonp-ing-adverbial-active'],
        sources: ['语法通霸/04.动词的非谓语形式/05.作状语(一).md', '人教版高中英语教材语法附录合集/过去分词.md']
      },
      {
        id: 'nonp-being-done-vs-done',
        category: 'nonpredicate',
        name: 'being done 表正在被，done 表已被/状态',
        frequency: '中频',
        one_liner: '同样是被动，being done 多了“正在进行”。',
        micro_rule: '作定语或状语时，done 表被动且多含完成/状态；being done 表正在被进行。',
        common_wrong_answers: ['一切被动都写 done', '不看时间过程'],
        teaching_move: '追问“这个被动动作已经完成，还是正在发生？”',
        examples: [],
        compare_with: ['nonp-done-postmodifier-passive'],
        sources: ['语法通霸/04.动词的非谓语形式/04.作定语.md', '语法通霸/04.动词的非谓语形式/09.非谓语动词的完成式进行式被动式和否定式.md']
      },
      {
        id: 'nonp-todo-passive-complement',
        category: 'nonpredicate',
        name: 'to be done 作补语/定语表将来被动',
        frequency: '高频',
        one_liner: 'to do 不是永远主动；宾语承受动作时要变 to be done。',
        micro_rule: 'allow/enable/require/order 等后的宾补，若宾语与动作是被动关系，用 to be done；表示未来被动也可用 to be done。',
        common_wrong_answers: ['只填 to do', '只看 allow sb. to do 而不看宾语与动作关系'],
        teaching_move: '把宾语放到动作后面问“它是做，还是被做？”',
        examples: [
          { exam: '2023全国一卷', no: 61, answer: 'to be lifted' }
        ],
        compare_with: ['nonp-object-complement-active'],
        sources: ['语法通霸/04.动词的非谓语形式/09.非谓语动词的完成式进行式被动式和否定式.md', '人教版高中英语教材语法附录合集/动词不定式.md']
      },
      {
        id: 'nonp-first-last-only-todo',
        category: 'nonpredicate',
        name: '序数词/最高级/only 后常接 to do',
        frequency: '中频',
        one_liner: '名词前有 first、last、only、最高级，后置定语常用 to do。',
        micro_rule: 'the first/last/only/best + 名词后常用不定式作定语；若与被修饰词构成被动且无执行者，可用 to be done。',
        common_wrong_answers: ['误填 doing', '忽略被动式 to be done'],
        teaching_move: '让学生先圈限定词，再看不定式与名词的逻辑关系。',
        examples: [],
        compare_with: ['nonp-todo-passive-complement'],
        sources: ['语法通霸/04.动词的非谓语形式/04.作定语.md']
      },
      {
        id: 'nonp-verb-object-meaning-shift',
        category: 'nonpredicate',
        name: 'remember/forget/stop/regret 后 doing 与 to do 意义不同',
        frequency: '中频',
        one_liner: '同一个动词后接 doing/to do，不是形式偏好，是意思变了。',
        micro_rule: 'remember/forget/regret + doing 指已做过；+ to do 指未做要做。stop doing 停止做，stop to do 停下来去做。',
        common_wrong_answers: ['只背搭配不看动作先后', '把 doing/to do 当同义替换'],
        teaching_move: '让学生说出空格动作相对于谓语是“已发生”还是“未发生”。',
        examples: [],
        compare_with: ['nonp-verb-object-todo'],
        sources: ['语法通霸/04.动词的非谓语形式/03.作宾语.md']
      },
      {
        id: 'nonp-with-absolute-structure',
        category: 'nonpredicate',
        name: 'with 复合结构看宾语关系',
        frequency: '中频',
        one_liner: 'with 后的小结构有自己的主语，不要拿全句主语判断。',
        micro_rule: 'with + 名词/代词 + doing/done/to do/adj./prep. 中，分词与 with 后宾语形成逻辑关系。',
        common_wrong_answers: ['误看全句主语', 'doing/done 主被动反了'],
        teaching_move: '把 with 后宾语单独拿出来问“谁做/谁被做”。',
        examples: [],
        compare_with: ['nonp-logical-subject-not-sentence-subject'],
        sources: ['语法通霸/04.动词的非谓语形式/12.独立主格结构with的复合结构.md']
      },

      {
        id: 'word-adj-before-noun',
        category: 'word',
        name: '名词前缺形容词',
        frequency: '高频',
        one_liner: '空后是名词，空格常要变成形容词去修饰它。',
        micro_rule: '冠词/限定词 + 空格 + 名词，或并列修饰名词时，优先判断形容词形式。',
        common_wrong_answers: ['名词和形容词混填', '只看中文意思不看句法位置'],
        teaching_move: '让学生说出空格修饰的是哪个名词。',
        examples: [
          { exam: '2023全国一卷', no: 56, answer: 'tasty' },
          { exam: '2024全国一卷', no: 57, answer: 'functional' },
          { exam: '2024广州二模', no: 37, answer: 'existing / existent' }
        ],
        compare_with: ['word-noun-after-article-prep'],
        sources: ['语法通霸/02.形容词和副词/01.形容词和副词的选用.md']
      },
      {
        id: 'word-adv-modifies-adj-verb-sentence',
        category: 'word',
        name: '副词修饰形容词/动词/整句',
        frequency: '高频',
        one_liner: '空格不修饰名词，而是在修饰动作、形容词或整句话，就往副词想。',
        micro_rule: '副词可修饰动词、形容词、其他副词或整个句子；句首评注词多用副词并首字母大写。',
        common_wrong_answers: ['形容词副词混用', '句首副词忘记大写'],
        teaching_move: '追问“这个词在说明谁？名词还是动作/程度/整句？”',
        examples: [
          { exam: '2023全国一卷', no: 64, answer: 'rarely' },
          { exam: '2023全国二卷', no: 63, answer: 'Basically' }
        ],
        compare_with: ['word-adj-before-noun'],
        sources: ['语法通霸/02.形容词和副词/01.形容词和副词的选用.md', '语法通霸/附录/02.词形变化规则.md']
      },
      {
        id: 'word-noun-after-article-prep',
        category: 'word',
        name: '冠词/介词后缺名词',
        frequency: '高频',
        one_liner: '空前有冠词或介词，空格常要提供名词性成分。',
        micro_rule: 'the/a/an/形容词性物主代词/介词后，若空格作主语、宾语或介词宾语，多用名词形式。',
        common_wrong_answers: ['误填动词原形', '名词词形拼写错误'],
        teaching_move: '让学生标出空格在句子中作什么成分。',
        examples: [
          { exam: '2023全国二卷', no: 56, answer: 'arrival' },
          { exam: '2024全国一卷', no: 65, answer: 'richness' },
          { exam: '2024全国二卷', no: 42, answer: 'visibility' }
        ],
        compare_with: ['word-adj-before-noun'],
        sources: ['语法通霸/18.名词和数词/01.可数名词与不可数名词.md']
      },
      {
        id: 'word-verb-to-noun-branch',
        category: 'word',
        name: '动词填空第三分流：动词变名词',
        frequency: '高频',
        one_liner: '括号里给动词，不代表一定填谓语或非谓语；空格要名词时，动词要变名词。',
        micro_rule: '空前有冠词、形容词、介词，或空格作主语/宾语/介词宾语时，优先判断是否需要名词形式。',
        common_wrong_answers: ['误写谓语动词', '误写非谓语', '派生名词拼写错误'],
        teaching_move: '先让学生说出动词填空三条路：谓语、非谓语、词性转换；再用句子成分排除前两条。',
        examples: [
          { exam: '2023全国二卷', no: 56, answer: 'arrival' },
          { exam: '2025深圳一模', no: 39, answer: 'recovery' }
        ],
        compare_with: ['pred-find-real-predicate', 'nonp-finite-or-nonfinite', 'word-noun-after-article-prep'],
        sources: ['语法通霸/18.名词和数词/01.可数名词与不可数名词.md', '语法通霸/附录/02.词形变化规则.md']
      },
      {
        id: 'word-parallel-same-form',
        category: 'word',
        name: '并列结构形态一致',
        frequency: '高频',
        one_liner: 'and/or 连接的两边，词性和语法功能通常要对齐。',
        micro_rule: '空格与并列词共同作表语、定语、宾语或状语时，优先保持同词性、同形式。',
        common_wrong_answers: ['只看空格不看并列项', '并列形容词误填副词'],
        teaching_move: '让学生用横线连出 and/or 前后的平行成分。',
        examples: [
          { exam: '2023全国二卷', no: 57, answer: 'confident' },
          { exam: '2024全国一卷', no: 57, answer: 'functional' }
        ],
        compare_with: ['logic-parallel-and'],
        sources: ['语法通霸/08.并列连词和并列/01.连接词或短语的并列连词.md']
      },
      {
        id: 'word-countable-plural-context',
        category: 'word',
        name: '可数名词按语境变复数',
        frequency: '高频',
        one_liner: '名词题不要只变词性，还要问单数还是复数。',
        micro_rule: 'these/those/many/several/one of/举例列表/谓语 there are 等常提示可数名词复数。',
        common_wrong_answers: ['只写单数名词', '不规则复数漏变'],
        teaching_move: '让学生找数量词、限定词、谓语和上下文中的复数提示。',
        examples: [
          { exam: '2023全国二卷', no: 61, answer: 'interviews' },
          { exam: '2024全国一卷', no: 62, answer: 'favourites' },
          { exam: '2024全国二卷', no: 37, answer: 'themes' }
        ],
        compare_with: ['number-singular-plural-form'],
        sources: ['语法通霸/18.名词和数词/02.名词的复数形式.md']
      },
      {
        id: 'word-ing-ed-adjective-feeling',
        category: 'word',
        name: '-ing / -ed 形容词看对象',
        frequency: '中频',
        one_liner: '令人怎样用 -ing，感到怎样用 -ed。',
        micro_rule: '-ing 形容词多描述事物特征或令人产生的感受；-ed 形容词多描述人的感受或状态。',
        common_wrong_answers: ['看到人就机械填 -ed', '不分主动意味和被动感受'],
        teaching_move: '让学生把中文换成“令人……”或“感到……”。',
        examples: [
          { exam: '2023全国二卷', no: 60, answer: 'visiting' },
          { exam: '2024全国一卷', no: 59, answer: 'closed' }
        ],
        compare_with: ['nonp-ing-postmodifier-active'],
        sources: ['语法通霸/02.形容词和副词/02.-ed 形容词与-ing 形容词.md', '人教版高中英语教材语法附录合集/过去分词.md']
      },
      {
        id: 'word-comparative-superlative-trigger',
        category: 'word',
        name: '比较级/最高级触发词',
        frequency: '中频',
        one_liner: 'than、even、much、one of、范围短语会把形容词副词推向比较等级。',
        micro_rule: 'than 常触发比较级；the/one of/in/of 范围常触发最高级；比较级前可有 much/even/far/a little。',
        common_wrong_answers: ['原级比较级混用', '最高级漏 the'],
        teaching_move: '先找比较对象和范围，再决定级别。',
        examples: [
          { exam: '2023浙江首考', no: 62, answer: 'simpler' }
        ],
        compare_with: ['article-superlative-the'],
        sources: ['语法通霸/03.形容词和副词的比较等级/02.比较级.md', '语法通霸/03.形容词和副词的比较等级/03.最高级.md']
      },
      {
        id: 'word-word-family-spelling',
        category: 'word',
        name: '派生词拼写不是机械加后缀',
        frequency: '高频',
        one_liner: '词性转换的最后一关常常死在拼写，不死在语法。',
        micro_rule: 'possible -> possibility, visible -> visibility, arrive -> arrival, rely -> reliable 等要按词族记忆。',
        common_wrong_answers: ['visiblity', 'arrivement', 'confidence 作形容词'],
        teaching_move: '把高频词族单独沉淀进错题本，不只订正本题答案。',
        examples: [
          { exam: '2024全国二卷', no: 42, answer: 'visibility' },
          { exam: '2023全国二卷', no: 56, answer: 'arrival' },
          { exam: '2023全国二卷', no: 57, answer: 'confident' }
        ],
        compare_with: ['word-noun-after-article-prep'],
        sources: ['语法通霸/附录/02.词形变化规则.md']
      },
      {
        id: 'word-capitalization-sentence-start',
        category: 'word',
        name: '句首答案首字母大写',
        frequency: '中频',
        one_liner: '语法对了，句首大小写也不能丢。',
        micro_rule: '答案位于句首或引号内新句开头，首字母按英文书写规范大写。',
        common_wrong_answers: ['basically 写成 lowercase', 'recalling 句首小写'],
        teaching_move: '订正时让学生把答案放回原句读一遍，检查书写位置。',
        examples: [
          { exam: '2023全国二卷', no: 63, answer: 'Basically' },
          { exam: '2024全国二卷', no: 44, answer: 'Recalling' }
        ],
        compare_with: ['nonp-ing-adverbial-active'],
        sources: ['人教版高中英语教材语法附录合集/长句.md']
      },
      {
        id: 'word-fixed-lexicalized-form',
        category: 'word',
        name: '分词已词汇化为形容词',
        frequency: '中频',
        one_liner: '有些答案表面像非谓语，实际是在考形容词化词汇。',
        micro_rule: 'existing, closed, visiting, recognized 等有时按形容词功能作定语/表语，仍要回到句法位置判断。',
        common_wrong_answers: ['强行按非谓语分析', '忽略词典化含义'],
        teaching_move: '让学生说清它是在表达动作关系，还是固定形容词意义。',
        examples: [
          { exam: '2024广州二模', no: 37, answer: 'existing / existent' },
          { exam: '2024全国一卷', no: 59, answer: 'closed' },
          { exam: '2023全国二卷', no: 60, answer: 'visiting' }
        ],
        compare_with: ['nonp-done-postmodifier-passive'],
        sources: ['语法通霸/02.形容词和副词/02.-ed 形容词与-ing 形容词.md']
      },

      {
        id: 'number-singular-plural-form',
        category: 'number',
        name: '名词数由限定词和语境决定',
        frequency: '中频',
        one_liner: '数词题本质是“这个名词在这里可不可数、单数还是复数”。',
        micro_rule: '可数名词受 these/many/several/具体数量/上下文列举影响常用复数；不可数名词不加 -s。',
        common_wrong_answers: ['可数复数漏 s', '不可数误加 s'],
        teaching_move: '先判断可数不可数，再找数量提示。',
        examples: [
          { exam: '2023全国二卷', no: 61, answer: 'interviews' },
          { exam: '2024广州一模', no: 45, answer: 'wonders' }
        ],
        compare_with: ['word-countable-plural-context'],
        sources: ['语法通霸/18.名词和数词/01.可数名词与不可数名词.md', '语法通霸/18.名词和数词/02.名词的复数形式.md']
      },
      {
        id: 'number-one-of-plural',
        category: 'number',
        name: 'one of 后接复数名词',
        frequency: '中频',
        one_liner: 'one of 是“许多个中的一个”，of 后面必须有一组。',
        micro_rule: 'one of + the/形容词性物主代词 + 复数名词；若后接定语从句，再看先行词决定从句谓语。',
        common_wrong_answers: ['of 后名词写单数', '定语从句谓语误判'],
        teaching_move: '让学生翻译成“……之一”，自然引出复数集合。',
        examples: [
          { exam: '2025广州二模', no: 58, answer: 'it' }
        ],
        compare_with: ['pred-subject-core-not-modifier'],
        sources: ['语法通霸/15.主谓一致/02.意义一致原则，就近一致原则.md', '语法通霸/18.名词和数词/02.名词的复数形式.md']
      },
      {
        id: 'number-ordinal-superlative-form',
        category: 'number',
        name: '序数词/最高级结构常带 the',
        frequency: '中频',
        one_liner: 'first、second、earliest 这类最高序列，常和 the 绑定。',
        micro_rule: '序数词和形容词最高级前通常用定冠词 the；若作副词或有物主代词则另判。',
        common_wrong_answers: ['最高级漏 the', '把 first time 当普通泛指'],
        teaching_move: '问学生这里是在普通描述，还是在一个序列里定位。',
        examples: [
          { exam: '2024全国一卷', no: 61, answer: 'the' },
          { exam: '2025全国一卷', no: 57, answer: 'the' }
        ],
        compare_with: ['article-superlative-the'],
        sources: ['语法通霸/03.形容词和副词的比较等级/03.最高级.md', '语法通霸/19.冠词/03.定冠词the的基本用法.md']
      },
      {
        id: 'number-hyphen-compound-no-plural',
        category: 'number',
        name: '连字符复合定语名词不加复数',
        frequency: '储备',
        one_liner: '36-day 这种放在名词前作定语，day 不加 s。',
        micro_rule: '数词-单数名词-形容词构成复合定语时，中间名词通常用单数形式。',
        common_wrong_answers: ['36-days journey', 'three-years-old boy'],
        teaching_move: '让学生判断该名词是在作定语，还是自己作中心名词。',
        examples: [
          { exam: '2025深圳二模', no: 36, answer: 'a' }
        ],
        compare_with: ['article-a-an-sound'],
        sources: ['语法通霸/02.形容词和副词/03.其他相关考点.md']
      },

      {
        id: 'article-a-an-sound',
        category: 'article',
        name: 'a/an 看发音不看字母',
        frequency: '高频',
        one_liner: 'a/an 不是看首字母，是看第一个音素。',
        micro_rule: '元音音素前用 an，辅音音素前用 a；hour、honest、university 等要按读音判断。',
        common_wrong_answers: ['看到元音字母就填 an', '看到辅音字母就填 a'],
        teaching_move: '让学生把空后第一个词读出来，再决定冠词。',
        examples: [
          { exam: '2025广州一模', no: 36, answer: 'an' },
          { exam: '2026广州一模', no: 45, answer: 'an' },
          { exam: '2026深圳一模', no: 45, answer: 'a' }
        ],
        compare_with: ['article-generic-single-countable'],
        sources: ['语法通霸/19.冠词/02.不定冠词a,an的基本用法.md']
      },
      {
        id: 'article-generic-single-countable',
        category: 'article',
        name: '可数名词单数不能裸奔',
        frequency: '高频',
        one_liner: '单数可数名词前通常需要限定词。',
        micro_rule: '可数名词单数泛指用 a/an；特指用 the；也可由 this/that/my 等限定。',
        common_wrong_answers: ['单数可数名词前漏冠词', '泛指特指混淆'],
        teaching_move: '让学生判断空后名词是否可数单数，再问泛指还是特指。',
        examples: [
          { exam: '2024深圳一模', no: 37, answer: 'a' },
          { exam: '2025深圳一模', no: 44, answer: 'a' },
          { exam: '2025深圳二模', no: 36, answer: 'a' }
        ],
        compare_with: ['article-specific-the'],
        sources: ['语法通霸/19.冠词/05.其他.md', '语法通霸/19.冠词/02.不定冠词a,an的基本用法.md']
      },
      {
        id: 'article-specific-the',
        category: 'article',
        name: '特指用 the',
        frequency: '高频',
        one_liner: '上下文已经锁定了是哪一个，就不是 a/an，而是 the。',
        micro_rule: '上文提到、后置修饰限定、语境唯一或双方共知时，用定冠词 the。',
        common_wrong_answers: ['泛指特指不分', '看到可数单数就机械填 a/an'],
        teaching_move: '问“读者能不能知道具体是哪一个？”',
        examples: [
          { exam: '2023全国二卷', no: 59, answer: 'the' },
          { exam: '2024广州一模', no: 38, answer: 'the' },
          { exam: '2024浙江首考', no: 64, answer: 'the' }
        ],
        compare_with: ['article-generic-single-countable'],
        sources: ['语法通霸/19.冠词/01.冠词的特指、独指和类指.md', '语法通霸/19.冠词/03.定冠词the的基本用法.md']
      },
      {
        id: 'article-superlative-the',
        category: 'article',
        name: '最高级/序数词前用 the',
        frequency: '高频',
        one_liner: '最高级是在范围里定唯一，通常要 the。',
        micro_rule: '形容词最高级、序数词、only/very/same 等限定结构前常用 the。',
        common_wrong_answers: ['最高级漏 the', 'for first time 漏 the'],
        teaching_move: '让学生找范围或序列位置。',
        examples: [
          { exam: '2024全国一卷', no: 61, answer: 'the' },
          { exam: '2025全国一卷', no: 57, answer: 'the' }
        ],
        compare_with: ['number-ordinal-superlative-form'],
        sources: ['语法通霸/19.冠词/03.定冠词the的基本用法.md']
      },
      {
        id: 'article-fixed-phrase',
        category: 'article',
        name: '固定短语中的冠词',
        frequency: '高频',
        one_liner: '有些冠词不是临场推理，是短语整体记忆。',
        micro_rule: 'a touch of, for the first time, in the center/heart of, give it a try 等短语中冠词相对固定。',
        common_wrong_answers: ['只按泛指/特指分析，漏掉固定表达'],
        teaching_move: '把短语作为整块收入词块库。',
        examples: [
          { exam: '2023全国一卷', no: 63, answer: 'a' },
          { exam: '2024全国一卷', no: 61, answer: 'the' }
        ],
        compare_with: ['prep-fixed-collocation'],
        sources: ['语法通霸/19.冠词/05.其他.md']
      },
      {
        id: 'article-zero-article-common-nouns',
        category: 'article',
        name: '零冠词不是漏填',
        frequency: '储备',
        one_liner: '三餐、球类、月份、抽象泛指等位置，本来就可能不用冠词。',
        micro_rule: '季节、月份、星期、三餐、球类、棋类、不可数名词泛指、by + 交通工具等常用零冠词。',
        common_wrong_answers: ['为了填空而硬加冠词', '不可数泛指误加 the'],
        teaching_move: '让学生判断这里是具体一个，还是抽象/类别/习惯表达。',
        examples: [],
        compare_with: ['article-specific-the'],
        sources: ['语法通霸/19.冠词/04.不用冠词的情况.md']
      },

      {
        id: 'pron-possessive-before-noun',
        category: 'pronoun',
        name: '名词前用形容词性物主代词',
        frequency: '高频',
        one_liner: '空后是名词，代词要先变成“修饰名词”的形态。',
        micro_rule: 'my/your/his/her/its/our/their 后接名词；mine/yours 等名词性物主代词后不再接名词。',
        common_wrong_answers: ['their/them 混淆', 'people/people’s 混淆'],
        teaching_move: '让学生读“谁的 + 名词”。',
        examples: [
          { exam: '2023全国一卷', no: 62, answer: 'their' },
          { exam: '2024广州二模', no: 38, answer: 'their' }
        ],
        compare_with: ['pron-it-reference'],
        sources: ['语法通霸/20.代词/01.人称代词、物主代词、反身代词和指示代词.md']
      },
      {
        id: 'pron-reflexive-same-subject',
        category: 'pronoun',
        name: '主宾同指用反身代词',
        frequency: '高频',
        one_liner: '动作回到主语自己身上，就用 myself/itself 这类反身形式。',
        micro_rule: '宾语、同位语或强调成分与主语同指时，用反身代词；也用于 by oneself、enjoy oneself 等结构。',
        common_wrong_answers: ['宾格和反身代词混用', '忽略强调本身'],
        teaching_move: '问“这个代词指的是不是主语自己？”',
        examples: [
          { exam: '2025全国二卷', no: 40, answer: 'myself' },
          { exam: '2026广州一模', no: 42, answer: 'itself' }
        ],
        compare_with: ['pron-it-reference'],
        sources: ['语法通霸/20.代词/01.人称代词、物主代词、反身代词和指示代词.md']
      },
      {
        id: 'pron-it-reference',
        category: 'pronoun',
        name: 'it 指代上文单数事物',
        frequency: '高频',
        one_liner: 'it 常常不是形式主语，而是在接住前面那个单数事物。',
        micro_rule: 'it 可指代前文出现的单数名词、不可数名词、整件事，也可作形式主语/宾语。',
        common_wrong_answers: ['把 it 看成无意义填充', '前后指代对象不清'],
        teaching_move: '让学生用箭头把 it 指回上文具体对象。',
        examples: [
          { exam: '2025广州二模', no: 58, answer: 'it' }
        ],
        compare_with: ['pron-formal-it'],
        sources: ['语法通霸/20.代词/04.代词it的常考点.md']
      },
      {
        id: 'pron-formal-it',
        category: 'pronoun',
        name: 'it 作形式主语/宾语',
        frequency: '中频',
        one_liner: '真正主语太长时，英语常先用 it 占位。',
        micro_rule: 'It is + adj./n. + to do/that...；find/think/make it + adj. + to do/that... 中 it 作形式主语或宾语。',
        common_wrong_answers: ['找不到真正主语', '把 it 误判为上文指代'],
        teaching_move: '让学生把后面的 to do/that 从句搬回主语或宾语位置验证。',
        examples: [],
        compare_with: ['pron-it-reference'],
        sources: ['语法通霸/20.代词/04.代词it的常考点.md']
      },
      {
        id: 'pron-one-ones-substitution',
        category: 'pronoun',
        name: 'one/ones 替代同类名词',
        frequency: '中频',
        one_liner: 'one/ones 不是指同一个，而是指同类中的一个/一些。',
        micro_rule: 'one 替代单数可数名词，ones 替代复数可数名词；it 指同一个事物。',
        common_wrong_answers: ['one/it 混用', 'one/ones 单复数混用'],
        teaching_move: '问“这里是同一个，还是同类另一个？”',
        examples: [
          { exam: '2024浙江首考', no: 65, answer: 'ones' }
        ],
        compare_with: ['pron-it-reference'],
        sources: ['语法通霸/20.代词/02.不定代词(一).md']
      },
      {
        id: 'pron-possessive-noun-peoples',
        category: 'pronoun',
        name: '所有格表示所属关系',
        frequency: '中频',
        one_liner: '空后是名词，前面有时不是代词，而是名词所有格。',
        micro_rule: 'people -> people’s, China -> China’s 等表示“……的”；区别复数 -s 与所有格 ’s。',
        common_wrong_answers: ['people 和 people’s 混淆', '复数和所有格混淆'],
        teaching_move: '让学生翻译成“谁的什么”。',
        examples: [
          { exam: '2025浙江首考', no: 64, answer: "people's" }
        ],
        compare_with: ['pron-possessive-before-noun'],
        sources: ['语法通霸/18.名词和数词/04.名词所有格.md']
      },

      {
        id: 'prep-fixed-collocation',
        category: 'preposition',
        name: '固定搭配锁定介词',
        frequency: '高频',
        one_liner: '介词题很多不是翻译题，是搭配题。',
        micro_rule: 'be similar to, suitable for, wait for, prepare for, praise sb. for, transform into, from...to... 等需整体识别。',
        common_wrong_answers: ['按中文逐字选介词', '只看空后名词不看空前搭配'],
        teaching_move: '把空前核心词和空后名词一起圈成短语。',
        examples: [
          { exam: '2024全国二卷', no: 39, answer: 'to' },
          { exam: '2024广州二模', no: 41, answer: 'for' },
          { exam: '2026深圳一模', no: 43, answer: 'into' }
        ],
        compare_with: ['article-fixed-phrase'],
        sources: ['语法通霸/21.介词/05.介词辨析：动介搭配.md', '语法通霸/21.介词/02.常见介词的常见用法.md']
      },
      {
        id: 'prep-by-means-or-difference',
        category: 'preposition',
        name: 'by 表方式/差额/被动施动者',
        frequency: '高频',
        one_liner: 'by 不只表示“被”，还常表示方式、手段和差值。',
        micro_rule: 'by hand/by bike 表方式；by + 数值表相差；被动句中 by 引出动作执行者。',
        common_wrong_answers: ['把 by 只理解成被动标志', '差额语境误填 with/of'],
        teaching_move: '让学生说出 by 后内容是“方式、差值，还是人”。',
        examples: [
          { exam: '2023全国一卷', no: 60, answer: 'by' },
          { exam: '2025全国一卷', no: 62, answer: 'by' }
        ],
        compare_with: ['prep-with-tool-or-accompaniment'],
        sources: ['语法通霸/21.介词/02.常见介词的常见用法.md', '语法通霸/21.介词/06.介词辨析：其他.md']
      },
      {
        id: 'prep-as-role',
        category: 'preposition',
        name: 'as 表身份/作为',
        frequency: '高频',
        one_liner: 'as 后面常是在说明“以什么身份/作为什么”。',
        micro_rule: 'as 作介词表示“作为、以……身份”；也可用于 regard/describe/serve/function as 等结构。',
        common_wrong_answers: ['as/like 混用', '漏看空后身份名词'],
        teaching_move: '问“这里是不是在给前面事物定身份？”',
        examples: [
          { exam: '2023浙江首考', no: 63, answer: 'as' },
          { exam: '2024全国一卷', no: 63, answer: 'as' }
        ],
        compare_with: ['prep-fixed-collocation'],
        sources: ['语法通霸/21.介词/02.常见介词的常见用法.md']
      },
      {
        id: 'prep-for-purpose-suitability',
        category: 'preposition',
        name: 'for 表对象/用途/原因',
        frequency: '高频',
        one_liner: 'for 常在回答“给谁、为何、适合什么、准备什么”。',
        micro_rule: 'for 可表用途、对象、原因、目的；常见 suitable for, prepare for, wait for, for modern use。',
        common_wrong_answers: ['for/to 混用', '受中文“对”影响误填 to'],
        teaching_move: '把 for 后内容读成“为了/供/对于”，检查语义。',
        examples: [
          { exam: '2024广州一模', no: 40, answer: 'for / in' },
          { exam: '2025全国二卷', no: 38, answer: 'for' },
          { exam: '2025深圳一模', no: 42, answer: 'for' }
        ],
        compare_with: ['prep-to-direction-relation'],
        sources: ['语法通霸/21.介词/02.常见介词的常见用法.md']
      },
      {
        id: 'prep-to-direction-relation',
        category: 'preposition',
        name: 'to 表方向/对应关系',
        frequency: '高频',
        one_liner: 'to 常把 A 指向 B：方向、对象、对应、结果。',
        micro_rule: 'from...to..., similar to, key/answer/access to, transform...into 中 to/into 表方向或关系。',
        common_wrong_answers: ['to/for 混用', '把 to 后动词误判成不定式'],
        teaching_move: '让学生判断 to 是介词还是不定式符号。',
        examples: [
          { exam: '2024全国二卷', no: 39, answer: 'to' },
          { exam: '2024深圳二模', no: 40, answer: 'to' }
        ],
        compare_with: ['nonp-gerund-after-prep'],
        sources: ['语法通霸/21.介词/02.常见介词的常见用法.md']
      },
      {
        id: 'prep-with-tool-or-accompaniment',
        category: 'preposition',
        name: 'with 表伴随/工具/对象',
        frequency: '中频',
        one_liner: 'with 的核心是“带着、和、用、具有”。',
        micro_rule: 'speak with sb., with + 工具/特征/伴随对象；与 by 表方式相比，with 更强调具体工具或伴随物。',
        common_wrong_answers: ['with/by 混用', 'speak to/with 语义差别不清'],
        teaching_move: '让学生说出 with 后内容是人、工具还是附带特征。',
        examples: [
          { exam: '2023全国二卷', no: 58, answer: 'with' }
        ],
        compare_with: ['prep-by-means-or-difference'],
        sources: ['语法通霸/21.介词/02.常见介词的常见用法.md']
      },

      {
        id: 'logic-parallel-and',
        category: 'logic',
        name: 'and 连接并列成分',
        frequency: '高频',
        one_liner: 'and 前后不只是意思并列，结构也要并列。',
        micro_rule: '两个词、短语、非谓语或分句功能相同且语义顺承/并列时，用 and。',
        common_wrong_answers: ['看不出并列范围', '把 and 后省略的 to/do 看漏'],
        teaching_move: '让学生把 and 两边用括号框成同级结构。',
        examples: [
          { exam: '2023全国二卷', no: 64, answer: 'and' },
          { exam: '2024全国二卷', no: 45, answer: 'and' },
          { exam: '2025全国二卷', no: 39, answer: 'and' }
        ],
        compare_with: ['word-parallel-same-form'],
        sources: ['语法通霸/08.并列连词和并列/01.连接词或短语的并列连词.md']
      },
      {
        id: 'logic-whether-or',
        category: 'logic',
        name: 'whether...or... 二选一',
        frequency: '高频',
        one_liner: 'whether 出现时，后面常在等一个 or 来完成选择结构。',
        micro_rule: 'whether A or B 表“是 A 还是 B”；either...or... 表二者择一。',
        common_wrong_answers: ['whether 后漏 or', 'or/and 混用'],
        teaching_move: '让学生找两项选择分别是什么。',
        examples: [
          { exam: '2023全国一卷', no: 58, answer: 'or' },
          { exam: '2025深圳二模', no: 42, answer: 'or' }
        ],
        compare_with: ['logic-parallel-and'],
        sources: ['语法通霸/08.并列连词和并列/01.连接词或短语的并列连词.md']
      },
      {
        id: 'logic-not-only-but-also',
        category: 'logic',
        name: 'not only / not just ... but ...',
        frequency: '高频',
        one_liner: '看到 not only/not just，后面常要找 but also/but。',
        micro_rule: 'not only/not just A but (also) B 表递进并列；A/B 在结构上保持平行。',
        common_wrong_answers: ['漏 but', 'but 后结构不平行'],
        teaching_move: '让学生用括号标出 A 与 B 两个并列项。',
        examples: [
          { exam: '2024深圳二模', no: 45, answer: 'but' }
        ],
        compare_with: ['logic-parallel-and'],
        sources: ['语法通霸/08.并列连词和并列/01.连接词或短语的并列连词.md']
      },
      {
        id: 'logic-cause-result-so',
        category: 'logic',
        name: 'so 表结果推进',
        frequency: '中频',
        one_liner: '前面给原因，后面推出结果，常用 so。',
        micro_rule: 'so 连接结果分句；because 和 so 通常不在同一英语主从结构里重复使用。',
        common_wrong_answers: ['because/so 同时使用', '只看中文“所以”不看句法'],
        teaching_move: '让学生判断空前空后谁是原因，谁是结果。',
        examples: [
          { exam: '2024广州二模', no: 40, answer: 'so' }
        ],
        compare_with: ['advclause-because-since-as'],
        sources: ['语法通霸/08.并列连词和并列/02.并列句.md']
      },
      {
        id: 'logic-contrast-but',
        category: 'logic',
        name: 'but 表转折/递进对照',
        frequency: '中频',
        one_liner: 'but 后面往往不是同向补充，而是转向或加码。',
        micro_rule: 'but 可表转折，也可在 not just...but... 中表递进连接。',
        common_wrong_answers: ['and/but 混用', '忽略前后语义反差'],
        teaching_move: '让学生用中文读出“而是/但是/而且”哪一种最贴。',
        examples: [
          { exam: '2024深圳二模', no: 45, answer: 'but' }
        ],
        compare_with: ['logic-not-only-but-also'],
        sources: ['语法通霸/08.并列连词和并列/01.连接词或短语的并列连词.md']
      },

      {
        id: 'attrib-pronoun-vs-adverb',
        category: 'attrib',
        name: '关系代词还是关系副词',
        frequency: '高频',
        one_liner: '从句缺主宾表，用 which/that/who；不缺主宾，只缺地点时间原因状语，用 where/when/why。',
        micro_rule: '先看从句内部缺不缺成分，再看先行词类型；不要只看先行词是地点/时间。',
        common_wrong_answers: ['地点名词后一律填 where', '时间名词后一律填 when'],
        teaching_move: '遮住关系词，读从句，看句子结构是否完整。',
        examples: [
          { exam: '2025全国二卷', no: 36, answer: 'where' },
          { exam: '2025广州一模', no: 42, answer: 'when' },
          { exam: '2024广州一模', no: 42, answer: 'which / that' }
        ],
        compare_with: ['nounclause-connector-role'],
        sources: ['语法通霸/05.定语从句/01.关系词的选择技巧.md', '人教版高中英语教材语法附录合集/定语从句.md']
      },
      {
        id: 'attrib-which-that-for-things',
        category: 'attrib',
        name: '指物且从句缺主/宾用 which/that',
        frequency: '高频',
        one_liner: '先行词是物，从句又缺主语或宾语，which/that 是第一候选。',
        micro_rule: '限制性定语从句中，指物关系代词作主语或宾语常用 which/that；作宾语时可省略。',
        common_wrong_answers: ['误填 where/when', '把 what 当关系代词'],
        teaching_move: '让学生把关系词放回从句中当主语或宾语读一遍。',
        examples: [
          { exam: '2024全国一卷', no: 64, answer: 'that / which' },
          { exam: '2024广州二模', no: 36, answer: 'which / that' },
          { exam: '2025广州二模', no: 62, answer: 'that / which' }
        ],
        compare_with: ['attrib-where-when-why-complete-clause'],
        sources: ['语法通霸/05.定语从句/01.关系词的选择技巧.md']
      },
      {
        id: 'attrib-nonrestrictive-no-that',
        category: 'attrib',
        name: '非限制性定语从句不用 that',
        frequency: '高频',
        one_liner: '逗号后的补充说明，that 通常不能上场。',
        micro_rule: '非限制性定语从句中，指人用 who/whom，指物或整句用 which，不能用 that。',
        common_wrong_answers: ['逗号后误填 that', 'which/who 混用'],
        teaching_move: '先看关系词前有没有逗号，再判断先行词人/物。',
        examples: [
          { exam: '2024全国二卷', no: 36, answer: 'who' },
          { exam: '2025全国一卷', no: 56, answer: 'which' },
          { exam: '2025全国二卷', no: 36, answer: 'where' }
        ],
        compare_with: ['attrib-which-that-for-things'],
        sources: ['语法通霸/05.定语从句/07.限制性定语从句与非限制性定语从句.md']
      },
      {
        id: 'attrib-where-when-why-complete-clause',
        category: 'attrib',
        name: 'where/when/why 要从句成分完整',
        frequency: '高频',
        one_liner: 'where/when/why 在从句里作状语，不替主语宾语。',
        micro_rule: '先行词表示地点、时间、原因，且从句主谓宾完整时，才考虑 where/when/why。',
        common_wrong_answers: ['world 后无脑 where', 'moment 后无脑 when'],
        teaching_move: '让学生把 where 替换成 in which，when 替换成 at/in which 检查。',
        examples: [
          { exam: '2024深圳二模', no: 37, answer: 'when' },
          { exam: '2026深圳一模', no: 36, answer: 'where' }
        ],
        compare_with: ['attrib-pronoun-vs-adverb'],
        sources: ['语法通霸/05.定语从句/02.关系副词.md']
      },
      {
        id: 'attrib-whose-possessive',
        category: 'attrib',
        name: 'whose 在从句中作定语',
        frequency: '高频',
        one_liner: '空后紧跟名词，且表示“谁的/其……”，常用 whose。',
        micro_rule: 'whose 可指人也可指物，在定语从句中修饰名词；可转化为 of which/of whom。',
        common_wrong_answers: ['whose/which 混用', '看到物就不敢用 whose'],
        teaching_move: '让学生把 whose + 名词翻译成“……的名词”。',
        examples: [
          { exam: '2025深圳二模', no: 41, answer: 'whose' }
        ],
        compare_with: ['pron-possessive-before-noun'],
        sources: ['语法通霸/05.定语从句/05.其他关系代词选择规则.md']
      },
      {
        id: 'attrib-prep-plus-which-whom',
        category: 'attrib',
        name: '介词 + 关系代词不用 that',
        frequency: '中频',
        one_liner: '介词提前后，指物用 which，指人用 whom。',
        micro_rule: 'in/on/to/of + which/whom 引导定语从句；介词后不能用 that，也通常不用 who。',
        common_wrong_answers: ['介词后填 that', '介词选择只凭中文'],
        teaching_move: '先根据从句动词/名词搭配确定介词，再选 which/whom。',
        examples: [],
        compare_with: ['prep-fixed-collocation'],
        sources: ['语法通霸/05.定语从句/03.介词+关系代词.md', '语法通霸/05.定语从句/05.其他关系代词选择规则.md']
      },
      {
        id: 'attrib-what-not-relative-pronoun',
        category: 'attrib',
        name: 'what 不引导定语从句',
        frequency: '中频',
        one_liner: 'what 自带“the thing(s) that”，前面不能再放先行词。',
        micro_rule: '有明确先行词时不用 what；what 引导名词性从句，在从句中充当成分。',
        common_wrong_answers: ['先行词后误填 what', 'what/which 混用'],
        teaching_move: '问“what 前面有没有它修饰的名词？”有则多半错。',
        examples: [],
        compare_with: ['nounclause-what-missing-subject-object'],
        sources: ['语法通霸/05.定语从句/05.其他关系代词选择规则.md']
      },
      {
        id: 'attrib-as-such-same',
        category: 'attrib',
        name: 'such/the same/as...as 中 as 作关系代词',
        frequency: '储备',
        one_liner: 'as 不只作连词和介词，也能在固定结构里引导定语从句。',
        micro_rule: 'such...as, the same...as, as...as 中，as 可在从句中作主语、宾语或表语；区别 such...that 结果从句。',
        common_wrong_answers: ['such...as 与 such...that 混淆', 'as/that 只按中文选'],
        teaching_move: '看后面从句是否缺成分：缺成分偏 as，完整偏 that 结果从句。',
        examples: [],
        compare_with: ['advclause-such-that-result'],
        sources: ['语法通霸/05.定语从句/06.as,but,than用作关系代词.md']
      },

      {
        id: 'nounclause-connector-role',
        category: 'nounclause',
        name: '名词性从句连接词看成分',
        frequency: '高频',
        one_liner: '名词性从句不是先背 what/that/why，而是先看从句缺什么。',
        micro_rule: '从句缺主语/宾语/表语常用 what/who/which；不缺成分但缺意义，用 when/where/why/how；只起连接不作成分用 that。',
        common_wrong_answers: ['结构完整却填 what', '从句缺成分却填 that'],
        teaching_move: '遮住连接词，读从句内部，判断缺成分还是缺语义。',
        examples: [
          { exam: '2024深圳一模', no: 43, answer: 'what' },
          { exam: '2024广州一模', no: 44, answer: 'how' }
        ],
        compare_with: ['attrib-pronoun-vs-adverb'],
        sources: ['语法通霸/06.名词性从句/01.引导名词性从句的连接词.md', '人教版高中英语教材语法附录合集/名词性从句复习.md']
      },
      {
        id: 'nounclause-what-missing-subject-object',
        category: 'nounclause',
        name: 'what 在从句中充当成分',
        frequency: '高频',
        one_liner: 'what 不是“什么”这么简单，它要在从句里顶一个名词位置。',
        micro_rule: 'what 引导名词性从句，相当于 the thing(s) that，可作主语、宾语、表语或定语。',
        common_wrong_answers: ['what/that 混用', '把 what 当定语从句关系词'],
        teaching_move: '让学生把 what 换成 the thing(s) that 检查。',
        examples: [
          { exam: '2024深圳一模', no: 43, answer: 'what' },
          { exam: '2025深圳一模', no: 36, answer: 'what' },
          { exam: '2024浙江首考', no: 59, answer: 'what' }
        ],
        compare_with: ['attrib-what-not-relative-pronoun'],
        sources: ['语法通霸/06.名词性从句/03.what、when、where、how、why等引导的名词性从句.md']
      },
      {
        id: 'nounclause-why-predicative-reason',
        category: 'nounclause',
        name: 'This is why 表结果原因链',
        frequency: '高频',
        one_liner: 'This is why 后面说“所以会这样”。',
        micro_rule: 'This/That is why + 结果；This/That is because + 原因。why 引导表语从句时从句结构完整。',
        common_wrong_answers: ['why/because 混用', '只按中文“因为”判断'],
        teaching_move: '让学生判断前一句是原因还是结果。',
        examples: [
          { exam: '2023全国二卷', no: 62, answer: 'why' }
        ],
        compare_with: ['advclause-because-since-as'],
        sources: ['语法通霸/06.名词性从句/03.what、when、where、how、why等引导的名词性从句.md']
      },
      {
        id: 'nounclause-how-degree-or-manner',
        category: 'nounclause',
        name: 'how 引导方式/程度',
        frequency: '高频',
        one_liner: 'how 后面常在问“怎样”或“多么”。',
        micro_rule: 'how 可引导宾语、主语、表语从句，表示方式或程度；how + adj./adv. 构成感叹式名词性从句。',
        common_wrong_answers: ['how/what 感叹结构混淆', '从句完整却误填 what'],
        teaching_move: '让学生看 how 后面是不是接形容词/副词或完整主谓结构。',
        examples: [
          { exam: '2024广州一模', no: 44, answer: 'how' },
          { exam: '2025广州二模', no: 56, answer: 'how / why' }
        ],
        compare_with: ['nounclause-what-missing-subject-object'],
        sources: ['语法通霸/06.名词性从句/03.what、when、where、how、why等引导的名词性从句.md']
      },
      {
        id: 'nounclause-that-no-component',
        category: 'nounclause',
        name: 'that 只连接不作成分',
        frequency: '中频',
        one_liner: 'that 引导名词性从句时，通常不在从句里担任角色。',
        micro_rule: '从句成分完整、意义明确，只需要连接时可用 that；主语从句、表语从句、同位语从句中 that 常不可省。',
        common_wrong_answers: ['从句缺宾语却填 that', '该保留 that 时省略'],
        teaching_move: '让学生检查 that 在从句里有没有“职位”。没有才合理。',
        examples: [],
        compare_with: ['nounclause-what-missing-subject-object'],
        sources: ['语法通霸/06.名词性从句/01.引导名词性从句的连接词.md']
      },
      {
        id: 'nounclause-whether-if',
        category: 'nounclause',
        name: 'whether/if 表是否',
        frequency: '储备',
        one_liner: '从句不缺成分，只缺“是否”意义，用 whether/if。',
        micro_rule: '宾语从句中 whether/if 多可互换；介词后、主语从句、表语从句、同位语从句和 whether...or not 中常用 whether。',
        common_wrong_answers: ['whether/that 混用', '介词后误用 if'],
        teaching_move: '让学生把从句翻成“是否……”，再看句法位置。',
        examples: [],
        compare_with: ['logic-whether-or'],
        sources: ['语法通霸/06.名词性从句/01.引导名词性从句的连接词.md']
      },

      {
        id: 'advclause-time-main-future-sub-present',
        category: 'advclause',
        name: '时间/条件状从主将从现',
        frequency: '高频',
        one_liner: 'when/if/unless/as soon as 引导将来意义，从句常用现在时。',
        micro_rule: '时间、条件、让步状语从句中，主句表将来/祈使/情态时，从句常用一般现在时代替将来。',
        common_wrong_answers: ['从句误用 will', '只看中文将来就填将来时'],
        teaching_move: '让学生标主句和从句，判断将来意义落在哪一边。',
        examples: [],
        compare_with: ['pred-objective-present'],
        sources: ['语法通霸/11.动词的时态/01.一般现在时.md', '语法通霸/07.状语从句/01.时间状语从句.md']
      },
      {
        id: 'advclause-when-vs-attrib-when',
        category: 'advclause',
        name: 'when：状语从句还是定语从句',
        frequency: '高频',
        one_liner: 'when 不一定修饰前面名词，也可能直接连接时间状语从句。',
        micro_rule: '若 when 引导的从句修饰先行词，是定语从句；若直接说明主句动作发生时间，是时间状语从句。',
        common_wrong_answers: ['所有 when 都当定语从句', '标签和讲法错位'],
        teaching_move: '问 when 从句是在解释哪个名词，还是在回答“什么时候”。',
        examples: [
          { exam: '2026广州一模', no: 41, answer: 'when' }
        ],
        compare_with: ['attrib-where-when-why-complete-clause'],
        sources: ['语法通霸/07.状语从句/01.时间状语从句.md', '语法通霸/05.定语从句/02.关系副词.md']
      },
      {
        id: 'advclause-because-since-as',
        category: 'advclause',
        name: '原因状语从句连接词强弱不同',
        frequency: '中频',
        one_liner: 'because 直接给原因，since/as 常给已知背景。',
        micro_rule: 'because 语气最强，回答 why；since/as 语气较弱，多表示双方已知或附带原因。',
        common_wrong_answers: ['because/since/as 只按中文“因为”混用', 'because 和 so 连用'],
        teaching_move: '让学生判断原因是新信息重点，还是背景铺垫。',
        examples: [],
        compare_with: ['logic-cause-result-so'],
        sources: ['语法通霸/07.状语从句/02.原因状语从句地点状语从句.md']
      },
      {
        id: 'advclause-although-no-but',
        category: 'advclause',
        name: 'although/though 不与 but 同用',
        frequency: '中频',
        one_liner: '英语里 although 和 but 通常不双保险。',
        micro_rule: 'although/though 引导让步从句时，主句通常不用 but，但可用 yet/still 加强转折。',
        common_wrong_answers: ['Although..., but...', '让步和转折重复标记'],
        teaching_move: '让学生保留一个逻辑标记即可。',
        examples: [],
        compare_with: ['logic-contrast-but'],
        sources: ['语法通霸/07.状语从句/05.让步状语从句比较状语从句.md']
      },
      {
        id: 'advclause-such-that-result',
        category: 'advclause',
        name: 'such...that 结果从句 vs such...as 定从',
        frequency: '储备',
        one_liner: 'that 后成分完整是结果，as 后缺成分是定语从句。',
        micro_rule: 'such...that 表“如此……以至于”，that 不作从句成分；such...as 中 as 作关系代词，从句缺成分。',
        common_wrong_answers: ['such...that 与 such...as 混用'],
        teaching_move: '让学生遮住连接词，看后面从句缺不缺主宾表。',
        examples: [],
        compare_with: ['attrib-as-such-same'],
        sources: ['语法通霸/05.定语从句/06.as,but,than用作关系代词.md', '语法通霸/07.状语从句/04.目的状语从句结果状语从句.md']
      }
    ]
  };

  DATA.trap_index = DATA.traps.reduce(function (acc, trap) {
    acc[trap.id] = trap;
    return acc;
  }, {});

  DATA.traps_by_category = DATA.traps.reduce(function (acc, trap) {
    (acc[trap.category] || (acc[trap.category] = [])).push(trap.id);
    return acc;
  }, {});

  window.GRAMMAR_KNOWLEDGE_TRAPS = DATA;
})();
