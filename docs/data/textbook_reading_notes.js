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
