// docs/data/textbook_reading_notes.js
//
// 课本阅读课 · 单元讲解层（高一教材口径）
//
// 和「课本语法讲解层」(textbook_grammar_notes.js) 平行：
//   语法层负责语言点，本层负责「读懂 + 记住」——文章大意、场景、思维导图、背诵。
//
// key = 册 + '|' + 单元 + '|' + 阅读类型（RT = Reading and Thinking，RW = Reading for Writing）
// 字段：
//   book / unit / type / typeLabel / unitTopic
//   title / sub                文章标题与副标题
//   source : { print:印刷页, pdf:PDF页, task:课本板块任务名 }
//   lead                       一句话定位
//   genre                      体裁
//   mainIdea                   文章大意（一段话）
//   sections : [ ... ]          按课本段落顺序排布，每段一张卡：
//       label   段落名（课本的说法）
//       role    这一段在文章里干什么
//       short   骨架导航条上的短标签（结构面板的分段 chip）
//       gist    段落大意（一两句）
//       notes   [{ lv, tree, txt, gloss }]  竖排复述笔记（口译笔记法）
//       paras   [ 英文原文段落 ]
//       shots   [{ src, kind:'page'|'zoom', print, title, note }]
//       mindmap { center, branches:[{ title, icon, points:[...] }] }  这一段的小导图
//   whole     : { center, branches:[...] }   整篇汇总导图
//   recite    : { quotes:[...], phrases:[{ en, zh }], hint }  背诵抓手（待重做成知识卡片）
//
// 结构面板的口径：整篇骨架 = 各段 short 串起来的 chip 条（就是「提纲」），
// 同一副骨架用两种摆法呈现——导图（放射状，背课文）/ 笔记（竖排，听说复述）。
//
// 原文与跟读库 (docs/read-along) 的 u3_rt 同源，此处为阅读课视角的重组。

(function () {
  window.TEXTBOOK_READING_NOTES = {

    '必修一|U3|RT': {
      book: '必修一',
      unit: 'U3',
      type: 'RT',
      typeLabel: 'Reading and Thinking',
      unitTopic: 'Sports and Fitness',
      title: 'Living Legends',
      sub: 'Masters of Their Sports',
      source: { print: 38, pdf: 45, task: 'Choose your favourite athlete' },
      lead: '一篇杂志征稿：请读者一起评选「体育界的传奇人物」——先说标准，再举郎平、乔丹两例，最后号召投稿。',

      genre: '人物介绍 / 征稿启事（说明 + 记叙）',
      // 认门幕 · 体裁五部件：这一类「杂志人物稿」的通用骨架，先认门，再进门。
      genreParts: [
        { no: '①', name: '标题', en: 'Title', role: '告诉读者写什么', text: 'Living Legends · Masters of Their Sports', note: '正标题点话题，副标题把范围收窄。' },
        { no: '②', name: '导语', en: 'Lead', role: '交代目的 · 给出标准', text: 'Help us choose … Here are our first two choices.', note: '先请读者一起参与，再亮出「入选标准」。' },
        { no: '③', name: '主体', en: 'Body', role: '用例子作答', text: 'Lang Ping · Michael Jordan', note: '两个例证各成一段，段内还各有一条小线。' },
        { no: '④', name: '结尾', en: 'Ending', role: '收束 · 号召', text: 'Send your suggestions … to LLS@sports.net.', note: '回到开头的「投稿」，首尾呼应。' },
        { no: '⑤', name: '落款', en: 'Source', role: '补出信息（杂志口径）', text: 'LLS@sports.net', note: '一个邮箱落款，帮我们锁定「杂志文章」这个体裁。' }
      ],
      mainIdea:
        '文章号召读者一起评选「体育界的传奇人物」，并给出入选标准：既要在自己的项目里技艺精湛，也要为他人树立榜样。' +
        '接着用郎平和乔丹两位运动员作答：郎平以「运动员—教练—个人」三重身份为国争光，在 2015 年世界杯逆境中带队夺冠；' +
        '乔丹则凭球技与「从失败中学习」的精神力量成为传奇，并把成功回馈给社会。',
      sections: [
        {
          label: 'Intro',
          role: '抛出话题 · 给出标准',
          short: '征稿 · 两条标准',
          notes: [
            { lv: 0, tree: '●', txt: 'Living Legends of Sports', gloss: '征稿 · 全文话题' },
            { lv: 1, tree: '├', txt: '选谁 → masters + good examples', gloss: '两条标准：技艺精湛 + 树立榜样' },
            { lv: 1, tree: '└', txt: 'here = first 2 choices', gloss: '先推出两位人选' }
          ],
          inquiry: [
            { q: 'What does "us" refer to?', a: '指的应该是某个刊物／杂志的编辑部——写稿的是编辑，不是作者本人。' },
            { q: 'What is special about this paragraph?', a: '它是全文的导语：交代写作目的，并给出「怎么投稿」的说明。' },
            { q: 'What are the key words in the second sentence?', a: 'masters 和 set good examples——这两个词就是全文的钥匙。' },
            { q: 'From the key words, what can we predict about the main body?', a: '正文应该说清楚两件事：他们凭什么算 masters，又立了什么榜样。' }
          ],
          // hot = 该段在「整页原书图」上的点击热区（相对整页的 0~1 比例坐标）
          hot: { x: 0.024, y: 0.165, w: 0.496, h: 0.140 },
          gist: '面向读者征集「体育界的传奇人物」，并说明入选标准：既要在自己的项目里出类拔萃，也要为他人树立榜样。',
          paras: [
            'Help us choose some "Living Legends of Sports". They must be athletes who are masters in their sports and also set good examples for others. Here are our first two choices.'
          ],
          translation: [
            '请帮我们评选一些“体育界的传奇人物”。他们必须是在各自项目中技艺精湛的运动员，同时也要为他人树立好榜样。以下是我们选出的前两位。'
          ],
          // 词卡：tier=core 全套（猜→翻→用）／simple 简卡；词根词缀写在 root / affix 里
          words: [
            {
              w: 'legend', ipa: '/ˈledʒənd/', pos: 'n.', zh: '传奇人物；传说', tier: 'core', src: '课本 p114',
              sent: 'Help us choose some "Living Legends of Sports".',
              blank: 'Help us choose some "Living ___s of Sports".',
              root: { seg: 'leg-', mean: '读、选（拉丁 legere）', kin: ['legend 本义「该被读的东西」→ 传说 → 传奇人物', 'legible 清晰可读', 'lecture 讲座', 'collect 收集'] },
              family: ['legend n. 传说；传奇人物', 'legendary adj. 传奇的'],
              chunks: ['a living legend', 'become a legend', 'the legend of …'],
              affix: [{ af: '-ary', mean: '名词 → 形容词', ex: 'legend → legendary' }],
              pitfall: '可数名词：a legend / two legends；living legend 指「健在的传奇人物」。',
              use: '用 legend 说一句：说说你心中的 living legend 是谁。'
            },
            {
              w: 'master', ipa: '/ˈmɑːstə(r)/', pos: 'n. & v.', zh: '大师；主人 / 掌握', tier: 'core', src: '课本 p114',
              sent: 'They must be athletes who are masters in their sports.',
              blank: 'They must be athletes who are ___s in their sports.',
              root: { seg: 'master', mean: '拉丁 magister「更优者」（magis 更大）', kin: ['master 高人一等的人 → 大师', 'mastery 精通', 'magistrate 地方法官'] },
              family: ['master n. 大师 / v. 掌握', 'mastery n. 精通', 'masterful adj. 技艺高超的'],
              chunks: ['a master of sth', 'be a master in one\'s sport', 'master a skill'],
              affix: [{ af: '-y', mean: '名词 → 抽象名词', ex: 'master → mastery' }],
              pitfall: 'a master of …（某方面的大师）与 masters in their sports（在各自项目里出类拔萃）注意介词差异。',
              use: '用 master 介绍一位你佩服的人。'
            },
            {
              w: 'set an example', ipa: '', pos: 'phr.', zh: '树立榜样', tier: 'core', src: '课本 p114',
              sent: 'They must be … masters in their sports and also set good examples for others.',
              blank: 'They must be … masters in their sports and also ___ good examples for others.',
              root: { seg: 'exempl-', mean: '取出来（拉丁 exemplum = ex- 出 + emere 取）', kin: ['example 拿出来给人看的东西 → 例子、榜样', 'sample 样品', 'exemplary 典范的'] },
              family: ['example n. 例子；榜样', 'exemplary adj. 典范的', 'exemplify v. 举例说明'],
              chunks: ['set an example for sb', 'follow sb\'s example', 'for example'],
              affix: [{ af: '-ary', mean: '名词 → 形容词', ex: 'example → exemplary' }],
              pitfall: '介词是 for：set an example for others（别用 to）。',
              use: '用 set an example 说一句：谁为你树立了榜样？'
            },
            {
              w: 'athlete', ipa: '/ˈæθliːt/', pos: 'n.', zh: '运动员', tier: 'simple', src: '课本 p114',
              sent: 'They must be athletes who are masters in their sports.',
              blank: 'They must be ___s who are masters in their sports.',
              family: ['athlete n. 运动员', 'athletic adj. 运动的', 'athletics n. 田径运动'],
              chunks: ['a professional athlete', 'a track-and-field athlete']
            },
            {
              w: 'suggestion', ipa: '/səˈdʒestʃən/', pos: 'n.', zh: '建议', tier: 'simple', src: '课本 p114',
              sent: 'Send your suggestions for "Living Legends of Sports" to LLS@sports.net.',
              blank: 'Send your ___s for "Living Legends of Sports" to LLS@sports.net.',
              family: ['suggest v. 建议', 'suggestion n. 建议'],
              chunks: ['a suggestion for sth', 'make a suggestion', 'at sb\'s suggestion']
            }
          ],
          shots: [
            {
              src: '../assets/textbook/bx1/u3-rt-intro.webp',
              kind: 'zoom',
              print: 38,
              title: '关键处放大 · 征稿引子 + Make predictions',
              note: '课本先让学生根据标题和配图预测内容；加粗处 athletes / masters 正是入选标准的关键词。'
            }
          ],
          mindmap: {
            center: '征稿开篇',
            branches: [
              { title: '干什么', icon: '📣', points: ['帮我们评选 Living Legends of Sports'] },
              { title: '选谁', icon: '🎯', points: ['masters in their sports（技艺精湛）', 'set good examples for others（树立榜样）'] },
              { title: '接下来', icon: '➡️', points: ['先介绍我们的前两位人选'] }
            ]
          }
        },

        {
          label: 'Lang Ping',
          role: '例证一 · 三重身份 + 逆境夺冠',
          short: '郎平 · 团队逆境',
          notes: [
            { lv: 0, tree: '●', txt: 'LP 郎平', gloss: '例证一 · 主线顶格' },
            { lv: 1, tree: '├', txt: 'as player → honour + glory → 国', gloss: '球员：为国赢得荣誉' },
            { lv: 1, tree: '├', txt: 'as coach → 中女排 → medals 世锦赛/奥运', gloss: '教练：带队拿奖牌' },
            { lv: 1, tree: '├', txt: 'as person → fans 爱 home + abroad', gloss: '为人：海内外球迷喜爱' },
            { lv: 1, tree: '├', txt: '2015 WCup：best player ↑injured + captain 走 ∵ heart', gloss: '考验：主力受伤 · 队长因心脏病离队' },
            { lv: 1, tree: '├', txt: '2 ↓ ≠ lose heart → faced 难 before', gloss: '连失两员，她没气馁 · 她见过风浪' },
            { lv: 1, tree: '└', txt: '∴ 2wk → 世界冠军 ! / 2016 → 奥运金 @巴西', gloss: '结果：两周后夺冠 · 2016 里约登顶' }
          ],
          inquiry: [
            { q: 'Why is Lang Ping a master in her sport?', a: '三句 As 排比给出答案：As a player / As a coach / As a person——球员、教练、为人三方面都站得住。' },
            { q: 'What example of Lang Ping is given?', a: '2015 世界杯逆境夺冠，以及 2016 年里约奥运会夺金。' },
            { q: 'How many parts can the paragraph be divided into? What are they?', a: '两段：前三句 As 排比是「总述」，后面全部是「例证」。' },
            { q: 'What is the function of using the three "As..." phrases at the beginning?', a: '排比一下把她的「全面伟大」立起来，先声夺人。' },
            { q: 'How is the example clearly presented?', a: '走 introduction — development — conclusion：her determination was tested → 队伍瓦解／队长离队／她没气馁 → world champions, Olympic gold。' }
          ],
          hot: { x: 0.044, y: 0.544, w: 0.439, h: 0.393 },
          gist: '用「运动员、教练、个人」三个身份概括郎平的贡献，再用 2015 年世界杯「主力受伤、队长离队」的逆境，说明她没有气馁，最终带队夺冠。',
          paras: [
            "As a player, Lang Ping brought honour and glory to her country. As a coach, she led the China women's volleyball team to medals at world championships and the Olympics. As a person, Lang Ping is loved by fans at home and abroad. When the Chinese team was preparing for the 2015 World Cup, her determination was tested. The team that Lang Ping had built was falling apart. One of the best players had been injured, and the team captain had to leave because of heart problems. Losing two important players was a big challenge, but Lang Ping did not lose heart. She had faced difficulties before, and she knew that her young players could win if they worked together as a team. Two weeks later, they were world champions! Then in 2016, Lang Ping led her volleyball team to Olympic gold in Brazil."
          ],
          translation: [
            '作为运动员，郎平为祖国赢得了荣誉。作为教练，她带领中国女排在世界锦标赛和奥运会上屡获奖牌。作为个人，郎平深受国内外球迷的喜爱。当中国队备战2015年世界杯时，她的决心经受了考验。郎平一手组建的队伍正濒临瓦解。一名主力队员受伤，队长也因心脏问题不得不离队。失去两名重要队员是个巨大的挑战，但郎平没有气馁。她曾面对过重重困难，她知道只要年轻队员团结一致，就能赢得胜利。两周后，她们成为了世界冠军！接着在2016年，郎平带领她的排球队在巴西赢得奥运金牌。'
          ],
          words: [
            {
              w: 'determination', ipa: '/dɪˌtɜːmɪˈneɪʃn/', pos: 'n.', zh: '决心；果断', tier: 'core', src: '课本 p114',
              sent: 'When the Chinese team was preparing for the 2015 World Cup, her determination was tested.',
              blank: 'When the Chinese team was preparing for the 2015 World Cup, her ___ was tested.',
              root: { seg: 'termin-', mean: '界限、终点（拉丁 terminus）', kin: ['determine = 彻底划定界限 → 决定', 'terminus 终点', 'terminal 终端', 'terminate 终止'] },
              family: ['determine v. 决定；查明', 'determined adj. 坚定的', 'determination n. 决心'],
              chunks: ['with determination', 'the determination to do sth', 'a person of determination'],
              affix: [{ af: '-ation', mean: '动词 → 名词', ex: 'determine → determination' }],
              pitfall: '表「决心」时不可数（不说 a determination）；determine to do sth 不接 doing。',
              use: '用 determination 说一句：你为了什么而坚持过？'
            },
            {
              w: 'injure', ipa: '/ˈɪndʒə(r)/', pos: 'v.', zh: '使受伤', tier: 'core', src: '课本 p114',
              sent: 'One of the best players had been injured, and the team captain had to leave because of heart problems.',
              blank: 'One of the best players had been ___d, and the team captain had to leave because of heart problems.',
              root: { seg: 'jur-', mean: '法律、权利（拉丁 jus / juris）', kin: ['injure 本义「不合法地侵害」→ 伤害', 'injury 伤', 'jury 陪审团', 'justice 公正'] },
              family: ['injure v. 使受伤', 'injured adj. 受伤的', 'injury n. 伤；伤害'],
              chunks: ['be badly injured', 'suffer an injury', 'injure one\'s leg'],
              affix: [{ af: '-ed', mean: '动词 → 形容词', ex: 'injure → injured' }, { af: '-y', mean: '动词 → 名词', ex: 'injure → injury' }],
              pitfall: 'injure 多指意外受伤，wound 多指刀枪造成的伤；the injured 可指「伤员」。',
              use: '用 injure / injured / injury 各说一句。'
            },
            {
              w: 'fall apart', ipa: '', pos: 'phr.', zh: '崩溃；瓦解', tier: 'core', src: '课本 p114',
              sent: 'The team that Lang Ping had built was falling apart.',
              blank: 'The team that Lang Ping had built was falling ___.',
              root: { seg: 'apart', mean: '法语 à part「到一边去」→ 分开', kin: ['take apart 拆开', 'tell apart 分辨', 'come apart 散开'] },
              family: ['fall apart 崩溃；瓦解', 'apart adv. 分开地', 'take sth apart 拆开'],
              chunks: ['fall apart', 'come apart', 'be worlds apart'],
              affix: [],
              pitfall: 'apart 是一个词（不是一个 part）；既可指组织「解体」，也可指情绪「崩溃」。',
              use: '用 fall apart 说一句：什么情况下你会觉得「一切都垮了」？'
            },
            {
              w: 'lose heart', ipa: '', pos: 'phr.', zh: '灰心；气馁', tier: 'core', src: '课本 p114',
              sent: 'Losing two important players was a big challenge, but Lang Ping did not lose heart.',
              blank: 'Losing two important players was a big challenge, but Lang Ping did not lose ___.',
              root: { seg: 'heart', mean: '这里指「勇气、心气」', kin: ['lose heart 丢了心气 → 气馁', 'take heart 振作起来'] },
              family: ['lose heart 灰心；气馁', 'take heart 鼓起勇气'],
              chunks: ['lose heart', 'not lose heart', 'take heart (from sth)'],
              affix: [],
              pitfall: '⚠️ lose heart（气馁）≠ lose one\'s heart to sb（爱上某人）；也说不出 lose hearts。',
              use: '用 lose heart 说一句：遇到什么也别 lose heart？'
            },
            {
              w: 'honour', ipa: '/ˈɒnə(r)/', pos: 'n. & v.', zh: '荣誉；尊敬 / 尊敬', tier: 'simple', src: '课本 p114',
              sent: 'As a player, Lang Ping brought honour and glory to her country.',
              blank: 'As a player, Lang Ping brought ___ and glory to her country.',
              family: ['honour n./v.', 'honourable adj. 值得尊敬的', 'honoured adj. 感到荣幸的'],
              chunks: ['bring honour to', 'in honour of', 'have the honour to do sth']
            },
            {
              w: 'coach', ipa: '/kəʊtʃ/', pos: 'n. & v.', zh: '教练 / 训练', tier: 'simple', src: '课本 p114',
              sent: 'As a coach, she led the China women\'s volleyball team to medals at world championships and the Olympics.',
              blank: 'As a ___, she led the China women\'s volleyball team to medals at world championships and the Olympics.',
              family: ['coach n. 教练', 'coaching n. 教练工作'],
              chunks: ['a head coach', 'coach sb in sth']
            },
            {
              w: 'medal', ipa: '/ˈmedl/', pos: 'n.', zh: '奖牌', tier: 'simple', src: '课本 p114',
              sent: '… she led the China women\'s volleyball team to medals at world championships and the Olympics.',
              blank: '… she led the China women\'s volleyball team to ___s at world championships and the Olympics.',
              family: ['medal n. 奖牌', 'medalist n. 奖牌获得者'],
              chunks: ['win a gold medal', 'an Olympic medal']
            },
            {
              w: 'champion', ipa: '/ˈtʃæmpiən/', pos: 'n.', zh: '冠军', tier: 'simple', src: '课本 p114',
              sent: 'Two weeks later, they were world champions!',
              blank: 'Two weeks later, they were world ___s!',
              family: ['champion n. 冠军', 'championship n. 锦标赛；冠军称号'],
              chunks: ['world champion', 'defend one\'s title as champion']
            }
          ],
          shots: [
            {
              src: '../assets/textbook/bx1/u3-rt-langping.webp',
              kind: 'zoom',
              print: 38,
              title: '关键处放大 · Lang Ping 专栏',
              note: '注意开头三个 As a… 的排比铺出三重身份；中段 determination / falling apart / lose heart 是关键情绪词。'
            }
          ],
          mindmap: {
            center: 'Lang Ping',
            branches: [
              { title: '三个身份', icon: '🎖️', points: ['Player → honour & glory', 'Coach → medals at worlds & Olympics', 'Person → loved at home & abroad'] },
              { title: '一次考验', icon: '💪', points: ['2015 World Cup', 'best player injured', 'captain left (heart problems)', 'did not lose heart'] },
              { title: '结果', icon: '🏆', points: ['Two weeks later → world champions', '2016 → Olympic gold in Brazil'] }
            ]
          }
        },

        {
          label: 'Michael Jordan',
          role: '例证二 · 球技 + 精神 + 回馈',
          short: '乔丹 · 个人精神',
          notes: [
            { lv: 0, tree: '●', txt: 'MJ 乔丹', gloss: '例证二 · 主线顶格' },
            { lv: 1, tree: '├', txt: '"Air Jordan"：graceful moves + jumps → 改篮球', gloss: '球技：飞人用优雅动作改写篮球' },
            { lv: 1, tree: '├', txt: 'skills impressive ↳ mental strength = unique', gloss: '题眼：真正独特的是精神力量' },
            { lv: 1, tree: '├', txt: 'final sec → 总 find a way to win', gloss: '最后几秒总能找到赢的办法' },
            { lv: 1, tree: '├', txt: 'secret = learn ∵ failures：accept 败 ≠ accept 不 try', gloss: '秘诀：从失败中学习，不试不可接受' },
            { lv: 1, tree: '├', txt: '败 → practise harder + never give up', gloss: '失败让他练得更狠 · 绝不放弃' },
            { lv: 1, tree: '└', txt: 'share success + Boys&Girls Club @Chicago 1996', gloss: '回馈：芝加哥青少年俱乐部，1996 起' }
          ],
          inquiry: [
            { q: 'Why is Michael Jordan a master in his sport?', a: 'known as "Air Jordan"，用 graceful moves and jumps 改写了篮球；关键是他 skills 与 strength 两头都强。' },
            { q: 'What example does Jordan set?', a: 'practise hard、never give up、share success——练得狠、不放弃、懂分享。' },
            { q: 'How many parts can the paragraph be divided into?', a: '两段：前半讲篮球生涯，后半讲人生态度；一个过渡句把两半接起来。' },
            { q: 'What are the key words about his career life?', a: 'skills 与 strength。技巧看 time seemed to stand still / "Air Jordan" / graceful moves and jumps；精神看 learning from his failures / never give up 和那句名言。' },
            { q: 'How does the writer convey his message?', a: '三招：比喻（time seemed to stand still）、直接引用名言、用一个具体事例说明他如何 share his success with others。' }
          ],
          hot: { x: 0.480, y: 0.540, w: 0.482, h: 0.343 },
          gist: '先写乔丹「飞人」般的球技，再强调真正让他与众不同的是「精神力量」——他的成功秘诀是从失败中学习；最后落到他创办俱乐部、回馈青少年。',
          paras: [
            "When Michael Jordan's feet left the ground, time seemed to stand still. The player who became known as \"Air Jordan\" changed basketball with his graceful moves and jumps. Jordan's skills were impressive, but the mental strength that he showed made him unique. In the final seconds of a game, Jordan always seemed to find a way to win. Jordan says that the secret to his success is learning from his failures. \"I can accept failure; everyone fails at something. But I can't accept not trying.\" Losing games taught him to practise harder and never give up. In life, Jordan has learnt to share his success with others. The Boys and Girls Club which he started in Chicago has been helping young people since 1996."
          ],
          translation: [
            '当迈克尔·乔丹双脚离地的那一瞬间，时间仿佛静止了。这位后来被称为“飞人乔丹”的球员，用他优雅的动作和跳跃改变了篮球运动。乔丹的球技令人赞叹，而他展现出的精神力量更让他与众不同。在比赛的最后几秒，乔丹似乎总能找到制胜之道。乔丹说，他成功的秘诀在于从失败中学习。“我可以接受失败，每个人都会在某些事上失败。但我不能接受不去尝试。”输掉比赛教会他更加刻苦地训练，永不放弃。在生活中，乔丹学会了与他人分享自己的成功。他1996年在芝加哥创办的男孩女孩俱乐部，一直致力于帮助青少年。'
          ],
          words: [
            {
              w: 'graceful', ipa: '/ˈɡreɪsfl/', pos: 'adj.', zh: '优雅的；优美的', tier: 'core', src: '课本 p114',
              sent: 'The player who became known as "Air Jordan" changed basketball with his graceful moves and jumps.',
              blank: 'The player who became known as "Air Jordan" changed basketball with his ___ moves and jumps.',
              root: { seg: 'grat- / grace-', mean: '喜爱、恩惠（拉丁 gratia）', kin: ['grace 优雅；恩典', 'grateful 感激的', 'gratitude 感激', 'gracious 亲切的'] },
              family: ['grace n. 优雅', 'graceful adj. 优雅的', 'gracefully adv. 优雅地', 'graceless adj. 笨拙的'],
              chunks: ['graceful movements', 'a graceful dancer', 'with grace'],
              affix: [{ af: '-ful', mean: '名词 → 形容词「充满…的」', ex: 'grace → graceful' }, { af: '-less', mean: '反义后缀「没有…的」', ex: 'grace → graceless' }],
              pitfall: 'graceful 形容动作、形态优雅；gracious 形容对人亲切，别混。',
              use: '用 graceful 说一句：谁的动作让你觉得 graceful？'
            },
            {
              w: 'strength', ipa: '/streŋθ/', pos: 'n.', zh: '力量；强项', tier: 'core', src: '课本 p114',
              sent: 'Jordan\'s skills were impressive, but the mental strength that he showed made him unique.',
              blank: 'Jordan\'s skills were impressive, but the mental ___ that he showed made him unique.',
              root: { seg: 'strong + -th', mean: '元音变化 + 名词后缀（同类：long→length, wide→width, deep→depth）', kin: ['strong 强的 → strength 力量', 'strengthen 加强'] },
              family: ['strong adj. 强壮的', 'strength n. 力量；强项', 'strengthen v. 加强'],
              chunks: ['mental strength', 'build up one\'s strength', 'strengths and weaknesses'],
              affix: [{ af: '-th', mean: '形容词 → 名词', ex: 'strong → strength' }, { af: '-en', mean: '形容词 → 动词', ex: 'strength → strengthen' }],
              pitfall: '表「力气」不可数；表「强项」可数（one of his strengths）。',
              use: '用 strength 说一句：你最强的地方是什么？'
            },
            {
              w: 'failure', ipa: '/ˈfeɪljə(r)/', pos: 'n.', zh: '失败；失败者', tier: 'core', src: '课本 p114',
              sent: 'Jordan says that the secret to his success is learning from his failures.',
              blank: 'Jordan says that the secret to his success is learning from his ___s.',
              root: { seg: 'fall-', mean: '拉丁 fallere「欺骗、使失望」', kin: ['fail 使失望 → 失败', 'failure 失败', 'failing 缺点'] },
              family: ['fail v. 失败；不及格', 'failure n. 失败；故障', 'failing n. 缺点'],
              chunks: ['learn from failures', 'end in failure', 'a failure to do sth'],
              affix: [{ af: '-ure', mean: '动词 → 名词', ex: 'fail → failure' }],
              pitfall: '表「失败」不可数；表「一次失败 / 失败的人」可数。',
              use: '用 failure 说一句：你从哪次 failure 里学到了什么？'
            },
            {
              w: 'unique', ipa: '/juˈniːk/', pos: 'adj.', zh: '独特的；唯一的', tier: 'simple', src: '课本 p114',
              sent: '… but the mental strength that he showed made him unique.',
              blank: '… but the mental strength that he showed made him ___.',
              family: ['unique adj. 独特的', 'uniqueness n. 独特性'],
              chunks: ['be unique to sb/sth', 'a unique opportunity']
            },
            {
              w: 'accept', ipa: '/əkˈsept/', pos: 'v.', zh: '接受', tier: 'simple', src: '课本 p114',
              sent: '"I can accept failure; everyone fails at something."',
              blank: '"I can ___ failure; everyone fails at something."',
              family: ['accept v. 接受', 'acceptable adj. 可接受的', 'acceptance n. 接受'],
              chunks: ['accept failure', 'accept responsibility', 'an accepted fact']
            },
            {
              w: 'practise', ipa: '/ˈpræktɪs/', pos: 'v.', zh: '练习', tier: 'simple', src: '课本 p114',
              sent: 'Losing games taught him to practise harder and never give up.',
              blank: 'Losing games taught him to ___ harder and never give up.',
              family: ['practise v. 练习（英式）', 'practice n. 练习', 'practical adj. 实际的'],
              chunks: ['practise doing sth', 'practise hard', 'put … into practice']
            },
            {
              w: 'share', ipa: '/ʃeə(r)/', pos: 'v. & n.', zh: '分享；分担 / 份额', tier: 'simple', src: '课本 p114',
              sent: 'In life, Jordan has learnt to share his success with others.',
              blank: 'In life, Jordan has learnt to ___ his success with others.',
              family: ['share v./n.', 'shared adj. 共有的'],
              chunks: ['share sth with sb', 'share in sth', 'a fair share']
            },
            {
              w: 'never give up', ipa: '', pos: 'phr.', zh: '永不放弃', tier: 'simple', src: '课本 p114',
              sent: 'Losing games taught him to practise harder and never give up.',
              blank: 'Losing games taught him to practise harder and never give ___.',
              family: ['give up 放弃', 'give in 让步；屈服', 'give away 送掉'],
              chunks: ['never give up', 'give up doing sth', 'not give up hope']
            }
          ],
          shots: [
            {
              src: '../assets/textbook/bx1/u3-rt-jordan.webp',
              kind: 'zoom',
              print: 38,
              title: '关键处放大 · Michael Jordan 专栏',
              note: '结构是「球技 → 精神 → 回馈」；mental strength / failures 是本段的题眼。'
            }
          ],
          mindmap: {
            center: 'Michael Jordan',
            branches: [
              { title: '球技', icon: '🏀', points: ['"Air Jordan"', 'graceful moves & jumps', 'find a way to win'] },
              { title: '精神', icon: '🧠', points: ['mental strength → unique', 'secret = learning from failures', '"I can\'t accept not trying."'] },
              { title: '回馈', icon: '🤝', points: ['share success with others', 'Boys and Girls Club, Chicago, since 1996'] }
            ]
          }
        },

        {
          label: 'Your Suggestions',
          role: '结尾 · 行动号召',
          short: '号召投稿',
          notes: [
            { lv: 0, tree: '●', txt: '投稿 → LLS@sports.net', gloss: '首尾呼应 · 关门句' }
          ],
          inquiry: [
            { q: 'What can this additional information tell us?', a: '这条投稿邮箱帮我们锁定体裁——这是一篇典型的杂志文章。' }
          ],
          hot: { x: 0.483, y: 0.895, w: 0.419, h: 0.045 },
          gist: '收束全文，请读者把自己心中的「体育传奇人物」投稿到指定邮箱，呼应开篇的征集。',
          paras: [
            'Send your suggestions for "Living Legends of Sports" to LLS@sports.net.'
          ],
          translation: [
            '请把你心中的“体育传奇人物”建议发送到 LLS@sports.net。'
          ],
          words: [],
          wordsNote: '这一段只有一句话：词都认识，把力气放在结构上——它是全文的「关门句」，也是首尾呼应的那一声回响。',
          shots: [],
          mindmap: {
            center: 'Your Suggestions',
            branches: [
              { title: '做什么', icon: '✉️', points: ['投稿你心中的体育传奇'] },
              { title: '投到哪', icon: '📮', points: ['LLS@sports.net'] }
            ]
          }
        }
      ],

      whole: {
        center: 'Living Legends',
        branches: [
          { title: '① 开篇 · 征集', icon: '📣', points: ['选出体育传奇', '标准：masters + good examples'] },
          { title: '② 郎平 · 三重身份', icon: '🏐', points: ['Player / Coach / Person', '2015 逆境 → 夺冠', '2016 奥运金牌'] },
          { title: '③ 乔丹 · 精神力量', icon: '🏀', points: ['Air Jordan 球技', '从失败中学习', '回馈青少年'] },
          { title: '④ 结尾 · 号召', icon: '✉️', points: ['投稿到 LLS@sports.net'] }
        ]
      },

      // 单元增量词：本单元 Words and Expressions 里另有两条高频核心词，正文没出现，
      // 放到「拼回去」的卡片网格里收尾。
      unitWords: [
        {
          w: 'compete', ipa: '/kəmˈpiːt/', pos: 'v.', zh: '竞争；参赛', tier: 'core', src: '课本 p114（单元词）',
          sent: 'Athletes from all over the world compete in the Olympic Games.',
          blank: 'Athletes from all over the world ___ in the Olympic Games.',
          root: { seg: 'pet-', mean: '寻求、争取（拉丁 petere）', kin: ['compete = com-（一起）+ petere（求）→ 一起争 → 竞争', 'appetite 食欲', 'petition 请愿'] },
          family: ['compete v. 竞争；参赛', 'competition n. 比赛；竞争', 'competitive adj. 有竞争力的', 'competitor n. 竞争者'],
          chunks: ['compete with / against sb', 'compete for sth', 'compete in a race'],
          affix: [{ af: '-ition', mean: '动词 → 名词', ex: 'compete → competition' }, { af: '-or', mean: '动词 → 人', ex: 'compete → competitor' }],
          pitfall: 'compete with / against sb 指对手；compete for sth 指争抢的东西。',
          use: '用 compete 说一句：你参加过什么比赛？'
        },
        {
          w: 'make sense', ipa: '', pos: 'phr.', zh: '讲得通；有意义', tier: 'core', src: '课本 p114（单元词）',
          sent: 'It makes sense to warm up before you exercise.',
          blank: 'It makes ___ to warm up before you exercise.',
          root: { seg: 'sens-', mean: '感觉、知觉（拉丁 sentire / sensus）', kin: ['sense 感觉 → 意义', 'sensible 明智的', 'sensitive 敏感的', 'consent 同意'] },
          family: ['sense n. 意义；感觉', 'sensible adj. 明智的', 'sensitive adj. 敏感的', 'senseless adj. 无意义的'],
          chunks: ['make sense 讲得通', 'make sense of sth 弄懂', 'in a sense 从某种意义上说'],
          affix: [{ af: '-ible', mean: '词根 → 形容词「可…的」', ex: 'sense → sensible' }],
          pitfall: 'make sense（讲得通）与 make sense of sth（弄懂某物）差一个 of，意思差很远。',
          use: '用 make sense 说一句：为什么运动前热身 makes sense？'
        }
      ],

      // 词缀总表 · 本文出现过的构词法，收成一张可跨单元复用的表
      affixTable: [
        { af: '-ure', mean: '动词 → 名词', ex: 'fail → failure', more: 'press → pressure；mix → mixture' },
        { af: '-ation', mean: '动词 → 名词', ex: 'determine → determination', more: 'invite → invitation；educate → education' },
        { af: '-ment', mean: '动词 → 名词', ex: 'achieve → achievement', more: 'develop → development；argue → argument' },
        { af: '-y', mean: '动词 / 名词 → 名词', ex: 'injure → injury', more: 'discover → discovery；difficult → difficulty' },
        { af: '-ed', mean: '动词 → 形容词', ex: 'injure → injured', more: 'excite → excited；interest → interested' },
        { af: '-ful', mean: '名词 → 形容词「充满…的」', ex: 'grace → graceful', more: 'use → useful；care → careful' },
        { af: '-less', mean: '名词 → 形容词「没有…的」', ex: 'grace → graceless', more: 'care → careless；hope → hopeless' },
        { af: '-able', mean: '动词 → 形容词「可…的」', ex: 'honour → honourable', more: 'accept → acceptable；enjoy → enjoyable' },
        { af: '-ship', mean: '名词 → 抽象名词「身份 / 状态」', ex: 'champion → championship', more: 'friend → friendship；hard → hardship' },
        { af: '-th', mean: '形容词 → 名词', ex: 'strong → strength', more: 'long → length；wide → width' },
        { af: '-ing', mean: '动词 → 形容词 / 名词', ex: 'inspire → inspiring', more: 'surprise → surprising；mean → meaning' }
      ],

      // 作业 · 基础三件套 + 三个上位任务（提高版口径）+ 写作支架
      homework: {
        base: [
          '用口译笔记法遮住原文，把 Lang Ping / Michael Jordan 两段各复述一遍（先说给自己听）。',
          '从 12 个核心词里挑 8 个，各写一句完整英文句子（句子里要出现词族或词块）。',
          '背下两段的「锚句」各两句，明天课上抽查。'
        ],
        up: [
          { t: '自选人物', d: '选一位你心中的 living legend，套用「三个身份 / 一次考验 / 结果」的模具，写一段 100 词的人物稿。' },
          { t: '自选手法', d: '模仿本文任一手法写一段：排比（As a…）、过渡句、或直接引语；写完用括号把手法标出来。' },
          { t: '对比两段', d: '比较郎平段与乔丹段的写法差异（结构 + 手法），写成一篇 120 词的短文。' }
        ],
        scaffold: {
          title: '写作支架 · 写之前先搭这副架子',
          lines: [
            '① 他是谁 → 一句定位（"… is a living legend of …"）',
            '② 凭什么 → 一件具体的事（时间 + 地点 + 一个细节）',
            '③ 为什么不一样 → 精神 / 品格那一句（用过渡句接）',
            '④ 留下了什么 → 回馈 / 影响 / 号召'
          ],
          tip: '这副架子与本文两段是同一副：能力 → 精神 → 回馈。照着填，就不容易写成流水账。'
        }
      },

      // 理解面板 · 问题链（教辅「以问题为导向」的口径）
      //   pre  读前：带着问题读   post  读后：合起来想（Putting it all together）
      //   每段自己的问题链放在该段的 inquiry 字段里
      inquiry: {
        pre: [
          { q: 'What does "legend" mean, and what is a "living legend"?',
            a: 'legend 本义是「古老而流传的传说」。称一个人是 living legend，是说他把自己的事做到了极致，并且为他人树立了榜样。' },
          { q: 'In this text, does "legend" refer to a person or a story?',
            a: '看标题下的配图与图注就知道，这里说的是人——郎平和乔丹。' },
          { q: 'Why are Lang Ping and Michael Jordan chosen as "living legends"?',
            a: '回扣导语的两条标准：both are masters in their sports and set good examples for others。' }
        ],
        post: [
          { q: 'Do you agree that Lang Ping and Michael Jordan are living legends? Why?',
            a: '同意：两人都在自己的领域成就卓著，而且至今仍以不同方式参与这项运动。' },
          { q: 'Is the story about Lang Ping told in the same way as that of Michael Jordan?',
            a: '不一样。郎平那段走「challenge — solution — result」；乔丹那段用一个过渡句把「球技」和「精神」两半分。' },
          { q: 'Using the writing skills in the text, how could you write about your favourite sports legend?',
            a: '学两招：用一个完整的小故事证明他有多强；用过渡句把「能力」和「品格」两部分接起来。' }
        ]
      },

      // 背诵：首版教师反馈「不好」，将重做成「本文知识卡片」（利用原材料）。
      // 字段先占位保留，待与教师讨论清口径后再改结构。
      recite: {
        quotes: [
          {
            en: 'The player who became known as "Air Jordan" changed basketball with his graceful moves and jumps.',
            zh: '这位后来被称为「飞人乔丹」的球员，用他优雅的动作和跳跃改变了篮球运动。'
          },
          {
            en: '"I can accept failure; everyone fails at something. But I can\'t accept not trying."',
            zh: '「我可以接受失败，每个人都会在某些事上失败。但我不能接受不去尝试。」'
          }
        ],
        phrases: [
          { en: 'bring honour and glory to', zh: '为……赢得荣誉与荣耀' },
          { en: 'fall apart', zh: '崩溃；瓦解' },
          { en: 'lose heart', zh: '灰心；气馁' },
          { en: 'the secret to one\'s success', zh: '某人成功的秘诀' },
          { en: 'learn from one\'s failures', zh: '从失败中学习' },
          { en: 'never give up', zh: '永不放弃' },
          { en: 'set a good example for', zh: '为……树立好榜样' }
        ],
        hint: '背诵抓手：Lang Ping 段按「三个身份 → 一次考验 → 结果」走；Jordan 段按「球技 → 精神 → 回馈」走。先背两条主线，再补细节。'
      }
    }

  };
})();
