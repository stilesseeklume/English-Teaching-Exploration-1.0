// docs/data/interpreting_notes_method.js
//
// 口译笔记法（跨单元方法，背课文用的速记法）· 数据层
//
// 和 textbook_reading_notes.js（逐篇阅读笔记）平行的另一层：
//   那一层回答「这篇课文怎么读、怎么记」；这一层回答「笔记这套方法本身怎么写」。
//
// 用途：一页小版块，把方法讲给老师与学生——
//   原理（笔记不是记录，是线索）→ 分叉原则 / 中英选择 / 锚句 → 符号表
//   → U2《Travel Peru》示范（可交互课本 + 逐块笔记 + 原文锚句）→ U3《Living Legends》迁移
//
// 样例选择：U2 RT 学生已背过，拿它做「适应期」示范；U3 RT 做「迁移期」，让学生自己写。
// U3 的成品笔记不在这里复制一份，直接从 textbook_reading_notes.js 取，保证单一来源。

(function () {
  window.INTERPRETING_NOTES_METHOD = {

    kicker: '跨单元 · 方法',
    title: '口译笔记法',
    sub: '笔记不是记录，是线索',
    lead: '先不看规则，直接从课本 U2 走一遍：一段原文、一张原书截图、一份笔记，边做边说为什么这么切。' +
      '「原理 / 怎么切 / 符号表」放在后面当附录，走到需要时再点开查。',

    // ── 一句话立场（页面上要单独放大）──
    stance: {
      big: '笔记越少越好。写得多，说明你记的是词，不是意。',
      small: '遮住原文，只看笔记，能不能把原话说回来？——这是唯一判据。'
    },

    // ── 三条铁律 ──
    rules: [
      {
        no: '1', name: '竖排', en: 'Vertical',
        d: '一行一个意群，眼睛只往前，不回扫。',
        bad: '横着抄句子——抄成一条长线，眼一回来就找不到位置。'
      },
      {
        no: '2', name: '缩进', en: 'Indent',
        d: '缩进表示从属：谁是谁的下级，用缩进加树形符号说清楚，不用连接词。',
        bad: '用「然后」「所以」把内容串成一句——那是句子，不是结构。'
      },
      {
        no: '3', name: '符号', en: 'Symbols',
        d: '专名缩写、逻辑上符号：郎平 → LP，因为 → ∵。',
        bad: '把 because、so 一字不差写下来——这些词占了位置，却带不回任何内容。'
      }
    ],

    // ── 分叉原则（怎么切层级）──
    branch: {
      title: '分叉怎么切：四条原则',
      items: [
        {
          no: '①', name: '按「问题」切，不按句子切',
          d: '一个分支 = 回答一个问题。切分之前先问自己：这一层我在回答什么问题？',
          bad: '按原文句子一句一行——那是誊抄，不是笔记。'
        },
        {
          no: '②', name: '同级必须同质',
          d: '同一层的分支，答的必须是同一个问题：都答「怎么去」，不能一半答「怎么去」、一半答「吃什么」。',
          bad: '一层里混着身份、考验、结果——看着热闹，其实没有结构。'
        },
        {
          no: '③', name: '一个分支 = 一个动作',
          d: '要挂第二件事，就往下沉一级，不要在同一行里塞两件事。',
          bad: '把「因为」和「结果」并排写在一行，缩进就白留了。'
        },
        {
          no: '④', name: '同级不超过 3–5 个',
          d: '超了，说明这一层的问题没选对——把问题再问细一点，就能拆出下一级。',
          bad: '一层挂 6 个分支，自己都看不出重点在哪。'
        }
      ],
      counter: {
        title: '反过来：不是每段都要分叉',
        d: '一级只有一个「问题」时，就一行到底。U2 的结尾号召、U3 的投稿段，都是这种。' +
          '硬要给它分叉，是拿结构凑热闹。'
      }
    },

    // ── 中英怎么选 ──
    lang: {
      title: '什么时候写英文，什么时候写中文',
      items: [
        { k: '英文', d: '会出现在你要背的英文原句里的词——照原文的拼写写下来。', ex: 'accommodation · dry stone · perfect fit · water plants' },
        { k: '中文', d: '只是给你定位用的结构词、话题词——写中文更快，也不影响背诵。', ex: '地位 · 三大地区 · 殖民 · 帝王 · 号召' },
        { k: '符号', d: '逻辑关系不写字，直接上符号：因为、所以、上升、不是、等于。', ex: '∵ ∴ ↑ ↓ ≠ =' }
      ],
      tip: '判断标准只有一条：这个词是不是我背原句时要吐出来的？是，就写英文；不是，就写中文。'
    },

    // ── 锚句 ──
    anchor: {
      title: '锚句：「这一段只背一句，背哪句」',
      items: [
        { k: '怎么挑', d: '跟着笔记层级走：每一层，取原文里最先出现、最能代表这一层的那一句。' },
        { k: '多少句', d: '一段 1–2 句封顶。超过两句，说明这一段有两个重心，那应该拆成两段看。' },
        { k: '两个依据', d: '结构担当（这一段的骨架靠它撑）+ 题眼担当（老师会问、考试会挖的那句）。' }
      ],
      vs: {
        title: '锚句 ≠ 重点句型',
        rows: [
          { k: '锚句', d: '从「背下来」里选，服务背诵与复述——挂在笔记右边，帮你把整句补齐。' },
          { k: '重点句型', d: '从「学会用」里选，服务语法与仿写——写在语法层（课本语法讲解）。' },
          { k: '关系', d: '两者不可互推：锚句可能语法很普通，重点句型可能并不需要背。偶尔重合是巧合——郎平段三个 As 排比就既是要背的锚句，也是要学的句型。' }
        ]
      }
    },

    // ── 符号表 ──
    symbols: {
      title: '符号表',
      cols: ['符号', '含义', '例'],
      rows: [
        { sym: '●', mean: '主题 / 顶格（一段的顶）', ex: '● LP 郎平' },
        { sym: '├ └', mean: '分支 / 末分支', ex: '挂在 ● 下面' },
        { sym: '→', mean: '导致、指向、结果是', ex: 'as player → honour' },
        { sym: '∵', mean: '因为', ex: 'captain 走 ∵ heart' },
        { sym: '∴', mean: '所以', ex: '∴ 2wk → 世界冠军' },
        { sym: '↑', mean: '增加、上升（伤、多）', ex: '↑injured' },
        { sym: '↓', mean: '减少、损失', ex: '2 ↓（两名主力缺阵）' },
        { sym: '≠', mean: '不等于、不是', ex: 'accept 败 ≠ accept 不 try' },
        { sym: '=', mean: '是、即', ex: 'mental strength = unique' },
        { sym: '↳', mean: '换句话说、进一步说', ex: 'skills impressive ↳ mental strength' },
        { sym: '：', mean: '展开、解释', ex: '2015 WCup：best player ↑injured' },
        { sym: '+', mean: '并列', ex: 'honour + glory' },
        { sym: '!', mean: '强调', ex: '世界冠军 !' },
        { sym: '@', mean: '在（地点或时间）', ex: '@Chicago 1996' },
        { sym: '/', mean: '一段结束', ex: '行末用' }
      ],
      abbr: {
        title: '缩写规则',
        items: [
          '专有名词取首字母：Lang Ping → LP，Michael Jordan → MJ，Machu Picchu → MP',
          '常见数量词去元音：week → wk，month → mth，day → d',
          '只在第一次出现时可以稍写全，之后一律用缩写',
          '同一篇里自己定，定了就不改——你自己看得懂就行'
        ]
      }
    },

    // ── 自检 ──
    check: {
      title: '一条自检判据',
      rule: '遮住原文，只看笔记，能不能把原话说回来？',
      rows: [
        { r: '能', d: '合格。' },
        { r: '不能', d: '要么意群切错了，要么缩进乱了，要么记的是词不是意。' }
      ],
      tip: '这条判据学生自己就能用，比他写完你看一眼有效得多。'
    },

    // ── 学生手上的框架（双栏）──
    template: {
      title: '学生手上拿什么：一张双栏纸',
      left: '口译笔记（自己填）',
      right: '原文锚句（背点）',
      howto: '用法：先默写左栏，再对照右栏把整句补齐。这一步就是从「记意」到「背原文」的桥。',
      hint: '先默写左栏，再对照右栏补整句'
    },

    // ── U2 示范 ──
    demoU2: {
      book: '必修一', unit: 'U2', type: 'RT',
      unitTopic: 'Travelling Around',
      title: 'Travel Peru',
      sub: 'Explore the Inca Empire',
      task: 'Explore Peru',
      source: { print: '26–27', pdf: '33–34' },
      genre: '旅游手册（百科背景 + 四条线路 + 结尾号召）',
      lead: '为什么先拿 U2：学生已经背过这篇，不用分心去理解内容，全部注意力可以放在「怎么记」上；' +
        '记完立刻能拿自己的记忆做验证——照着笔记，能不能把背过的原话调出来。' +
        '而且它的骨架最简单：开篇一段百科背景，中间四条线路并列，结尾一句号召。',

      pages: [
        { key: 'p26', print: 26, src: '../assets/textbook/bx1/u2-rt-p26-page.webp', note: 'Reading and Thinking · Explore Peru · Travel Peru 开篇' },
        { key: 'p27', print: 27, src: '../assets/textbook/bx1/u2-rt-p27-page.webp', note: 'Travel Peru 续 · Cusco / Titicaca / 结尾号召' }
      ],

      skeleton: {
        title: '先立骨架，再看细节',
        lines: [
          { lv: 0, tree: '●', txt: 'Travel Peru（旅游手册）', gloss: '一篇文章 = 一个 ●' },
          { lv: 1, tree: '├', txt: '① 概况 · Peru', gloss: '百科背景' },
          { lv: 1, tree: '├', txt: '② Amazon 雨林', gloss: '线路一' },
          { lv: 1, tree: '├', txt: '③ Machu Picchu', gloss: '线路二' },
          { lv: 1, tree: '├', txt: '④ Cusco', gloss: '线路三' },
          { lv: 1, tree: '├', txt: '⑤ Lake Titicaca', gloss: '线路四' },
          { lv: 1, tree: '└', txt: '⑥ 号召 · Come to Peru', gloss: '结尾' }
        ],
        note: '五块并列，一条线拉到底——这是最容易的骨架，适合第一课。'
      },

      // 热区 = 该段在「整页原书图」上的点击区（相对整页 0~1 比例坐标）
      sections: [
        {
          label: '概况 · Peru',
          role: '百科背景 · 交代国家底色',
          short: '概况',
          page: 0,
          hot: { x: 0.122, y: 0.242, w: 0.330, h: 0.240 },
          shot: '../assets/textbook/bx1/u2-rt-p26-s1.webp',
          tip: '切分从「这段在回答什么问题」开始：这一段回答「Peru 是什么」，所以主干只留 位置 / 三区 / 历史 / 语言，其余全丢。',
          gist: '先说秘鲁在哪、分哪三块、历史上有过什么，最后用一句话解释为什么秘鲁说西班牙语。',
          notes: [
            { lv: 0, tree: '●', txt: 'Peru 概况 · 太平洋岸', gloss: '顶格：这一段讲什么' },
            { lv: 1, tree: '├', txt: '位置：Pacific coast @S.America', gloss: '在哪' },
            { lv: 1, tree: '├', txt: '3 区：coast（窄·干·平）+ Andes + Amazon', gloss: '三大地区' },
            { lv: 1, tree: '├', txt: '1400–1500s = 古 Inca 帝国中心', gloss: '历史高光' },
            { lv: 2, tree: '└', txt: 'Machu Picchu ← Inca emperor 住', gloss: '往下沉一级：帝王的城' },
            { lv: 1, tree: '├', txt: '16c Spain 控 → 1821', gloss: '殖民与独立' },
            { lv: 1, tree: '└', txt: '∴ 官方语 = Spanish', gloss: '用逻辑符号收尾，不写 so' }
          ],
          anchors: [
            'Peru is a country on the Pacific coast of South America with three main areas: narrow, dry, flat land running along the coast, the Andes Mountains, and the Amazon rainforest.',
            'It is for this reason that Spanish is the main official language of Peru.'
          ],
          en: 'Peru is a country on the Pacific coast of South America with three main areas: narrow, dry, flat land running along the coast, the Andes Mountains, and the Amazon rainforest. ' +
            'In the 1400s and 1500s, Peru was the centre of the powerful ancient Inca Empire. ' +
            'The Inca emperor lived in the now-famous site Machu Picchu. ' +
            'Spain took control of Peru in the 16th century and ruled until 1821. ' +
            'It is for this reason that Spanish is the main official language of Peru.',
          zh: '秘鲁是南美洲太平洋沿岸的一个国家，主要有三大地区：沿海狭窄干旱的平地、安第斯山脉和亚马孙雨林。' +
            '15 至 16 世纪，秘鲁是强大的古印加帝国的中心。印加帝王曾住在如今闻名于世的马丘比丘遗址。' +
            '西班牙在 16 世纪控制了秘鲁，一直统治到 1821 年。正是由于这个原因，西班牙语是秘鲁的主要官方语言。'
        },
        {
          label: 'Amazon 雨林',
          role: '线路一 · 雨林',
          short: 'Amazon',
          page: 0,
          hot: { x: 0.166, y: 0.585, w: 0.340, h: 0.345 },
          shot: '../assets/textbook/bx1/u2-rt-p26-s2.webp',
          tip: '同级同质：这一段三件事都是「怎么去 / 住哪 / 干什么」，同一层只放同一类信息，不要把路线细节塞进时间分支。',
          gist: '从库斯科飞一小段到雨林，再乘船一天进到森林中央住下，然后用三天跟向导探索雨林特有的动植物。',
          notes: [
            { lv: 0, tree: '●', txt: 'Amazon 雨林 · 4 天', gloss: '去哪 + 待几天' },
            { lv: 1, tree: '├', txt: '✈ 短途飞行 Cusco → Andes → Amazon', gloss: '怎么去' },
            { lv: 1, tree: '├', txt: '🚤 1d 船 → 林中 accommodation', gloss: '再转船，住雨林中央' },
            { lv: 1, tree: '└', txt: '3d：local guide + plants / animals（unique）', gloss: '干什么' }
          ],
          anchors: [
            'A short flight from Cusco takes you from the Andes into the Amazon rainforest.'
          ],
          en: 'A short flight from Cusco takes you from the Andes into the Amazon rainforest. ' +
            'From there, you\'ll spend one day travelling by boat to your accommodation in the middle of the forest. ' +
            'You can then spend three days exploring the rainforest with a local guide and enjoying the plants and animals unique to the rainforest.',
          zh: '从库斯科起飞，短短一段航程就能把你从安第斯山脉带进亚马孙雨林。' +
            '从那里出发，你将乘船花一天时间前往森林中央的住处。' +
            '之后，你可以在当地向导的陪同下，用三天时间探索雨林，欣赏雨林特有的动植物。'
        },
        {
          label: 'Machu Picchu',
          role: '线路二 · 古城遗址',
          short: 'Machu Picchu',
          page: 0,
          hot: { x: 0.512, y: 0.585, w: 0.390, h: 0.345 },
          shot: '../assets/textbook/bx1/u2-rt-p26-s3.webp',
          tip: '一分支一动作：先「到达」再「探索」，再往下才讲干砌石——一层只做一件事，学生照着能一步步说回去。',
          gist: '四天徒步穿越安第斯山脉走到马丘比丘，到了之后用一天探索古城；这一段的重心是印加人的干砌石建筑法。',
          notes: [
            { lv: 0, tree: '●', txt: 'Machu Picchu · 4d 徒步', gloss: '去哪 + 待几天' },
            { lv: 1, tree: '├', txt: '徒步 → Andes paths → 古城', gloss: '怎么去：走进去' },
            { lv: 1, tree: '├', txt: '到达 → 1d explore + amazed', gloss: '到了干什么' },
            { lv: 1, tree: '└', txt: '尤其 amazing = Inca dry stone', gloss: '这一段的重心，单独一层' },
            { lv: 2, tree: '└', txt: '切石 exact size → 墙靠 perfect fit（≠ 加固）', gloss: '再沉一级：解释干砌石' }
          ],
          anchors: [
            'This four-day walking tour will take you on amazing paths through the Andes Mountains on the way to the city of Machu Picchu.',
            'Especially amazing is the Incas\' dry stone method of building.'
          ],
          en: 'This four-day walking tour will take you on amazing paths through the Andes Mountains on the way to the city of Machu Picchu. ' +
            'After reaching your destination, you will have a day to explore and be amazed by this ancient city. ' +
            'Especially amazing is the Incas\' dry stone method of building. ' +
            'Inca builders cut stones to exact sizes so that nothing was needed to hold walls together other than the perfect fit of the stones.',
          zh: '这次为期四天的徒步之旅，将带你沿着通往马丘比丘古城的奇妙路径穿越安第斯山脉。' +
            '到达目的地后，你将有一天时间探索这座古城，并为它惊叹不已。' +
            '尤其令人惊叹的是印加人的干砌石建筑法。' +
            '印加建筑工人把石头切割得尺寸精确，除了石块之间的完美契合之外，砌墙不需要任何其他东西来加固。'
        },
        {
          label: 'Cusco',
          role: '线路三 · 高原古城',
          short: 'Cusco',
          page: 1,
          hot: { x: 0.062, y: 0.556, w: 0.404, h: 0.338 },
          shot: '../assets/textbook/bx1/u2-rt-p27-s4.webp',
          tip: '五个并列动词（stay / visit / admire / enjoy / go shopping）只记名词：hotel、museum、architecture、food、market，动词让学生自己补。',
          gist: '在安第斯高地上的库斯科待四天，感受西班牙与当地印第安两种文化；它是 13 到 16 世纪印加帝国的首都。',
          notes: [
            { lv: 0, tree: '●', txt: 'Cusco · 4d', gloss: '去哪 + 待几天' },
            { lv: 1, tree: '├', txt: '高地 Andes：Spanish + local Indian 文化', gloss: '特色是什么' },
            { lv: 1, tree: '├', txt: '= Inca 首都（13c–16c）', gloss: '为什么是它' },
            { lv: 1, tree: '└', txt: '活动：hotel + museum + architecture + food + market', gloss: '五个并列动词，只记名词' }
          ],
          anchors: [
            'Spend four days enjoying the unique Spanish and local Indian culture high in the Andes at Cusco, the capital of the Inca Empire from the 13th until the 16th century.'
          ],
          en: 'Spend four days enjoying the unique Spanish and local Indian culture high in the Andes at Cusco, the capital of the Inca Empire from the 13th until the 16th century. ' +
            'Stay in a local hotel, visit the museums, admire the architecture, enjoy the excellent local food, and go shopping at the local markets.',
          zh: '在库斯科花上四天，尽情享受安第斯高地上独特的西班牙与当地印第安文化；' +
            '库斯科是 13 至 16 世纪印加帝国的首都。' +
            '入住当地旅馆，参观博物馆，欣赏建筑，品尝美味的当地美食，还可以逛逛当地的市场。'
        },
        {
          label: 'Lake Titicaca',
          role: '线路四 · 高原湖泊',
          short: 'Titicaca',
          page: 1,
          hot: { x: 0.476, y: 0.556, w: 0.426, h: 0.338 },
          shot: '../assets/textbook/bx1/u2-rt-p27-s5.webp',
          tip: '同级 3–5 个就够：这一段只留「怎么去 → 住哪 → 特色」三条，不要为了工整硬拆成四条。',
          gist: '沿新公路驱车一天从库斯科到的的喀喀湖，再乘船到岛上，与当地乌鲁斯人家同住三天；岛和房子都用湖里的水草造。',
          notes: [
            { lv: 0, tree: '●', txt: 'Titicaca · 3d 住岛', gloss: '去哪 + 待几天' },
            { lv: 1, tree: '├', txt: '🚗 1d 新公路 Cusco → Titicaca', gloss: '怎么去：陆路' },
            { lv: 1, tree: '├', txt: '🚤 → island + Uros family', gloss: '再转船，住当地人家' },
            { lv: 1, tree: '└', txt: '岛 & 房 = 湖中 water plants', gloss: '特色：都用湖草造' }
          ],
          anchors: [
            'Both the island and the Uros homes are made of water plants from the lake.'
          ],
          en: 'Enjoy the beautiful countryside as you spend a day driving along the new highway connecting Cusco to Lake Titicaca. ' +
            'There, a boat will take you to stay with a local Uros family on an island for three days. ' +
            'Both the island and the Uros homes are made of water plants from the lake.',
          zh: '沿着连接库斯科和的的喀喀湖的新公路驱车一天，欣赏沿途美丽的乡村风光。' +
            '在那里，一艘小船将载你前往一座岛屿，与当地的乌鲁斯人家同住三天。' +
            '无论是小岛还是乌鲁斯人的住房，都是用湖里的水生植物建造的。'
        },
        {
          label: 'Come to Peru!',
          role: '结尾号召 · 收束全文',
          short: '号召',
          page: 1,
          hot: { x: 0.045, y: 0.890, w: 0.910, h: 0.034 },
          shot: '../assets/textbook/bx1/u2-rt-p27-s6.webp',
          tip: '不是每段都要分叉：结尾一句号召，一个分支收住，展开反而拖慢背诵。',
          gist: '一句号召收尾：来体验秘鲁的一切——从印加文化、西班牙村庄，到雨林、高山和海岸。',
          notes: [
            { lv: 0, tree: '●', txt: '号召 · Come to Peru', gloss: '结尾' },
            { lv: 1, tree: '└', txt: '体验：Inca 文化 + Spanish 村庄 + 雨林 + 高山 + 海岸', gloss: '一长串并列，只记名词' }
          ],
          anchors: [
            'So come and experience what Peru has to offer: everything from the ancient Inca culture and centuries-old Spanish villages to deep rainforests, high mountains, and a beautiful coastline.'
          ],
          en: 'So come and experience what Peru has to offer: everything from the ancient Inca culture and centuries-old Spanish villages to deep rainforests, high mountains, and a beautiful coastline.',
          zh: '所以，来体验秘鲁的魅力吧：从古老的印加文化、有几百年历史的西班牙村庄，到幽深的雨林、高耸的山脉和美丽的海岸线，应有尽有。'
        }
      ],

      mold: {
        title: '关键发现：四条线路共用一副模具',
        lead: '把中间四块横着比一比，会发现它们其实是同一副模具。抓住模具，四段就是一段，背起来量小了一半。',
        cols: ['线路', '去哪', '怎么去', '待几天', '干什么'],
        rows: [
          { cells: ['Amazon', '雨林', '✈ + 🚤 1d', '3d', '探索动植物'] },
          { cells: ['Machu Picchu', '古城', '徒步', '4d', '探索古城 + 惊叹干砌石'] },
          { cells: ['Cusco', '库斯科', '—', '4d', '博物馆 / 建筑 / 美食 / 市场'] },
          { cells: ['Titicaca', '的的喀喀湖', '🚗 1d', '3d', '与 Uros 家庭住岛'] }
        ],
        found: '课文自己也有这张表：第 27 页任务 4 让你填的，正是「去哪 → 待几天 → 怎么去 → 住哪 → 干什么」。' +
          '编课本的人和我们记的是同一副骨头。',
        ask: '要教给学生的就这一句：手册类文章，四条线路共用一副模具——去哪 → 怎么去 → 待几天 → 干什么。'
      },

      class: {
        title: '课堂动作（适应期）',
        steps: [
          '把 ①②③ 的笔记示范在黑板上——边写边讲为什么这么缩进、为什么用这个符号。',
          '放手让全班一起做 ④⑤——合上书，凭记忆和模板写。',
          '收上来，只用一条判据检查：遮住原文，能不能说回来。',
          '最后亮出「四条线路共用一副模具」那张表，让学生自己发现：四段其实是同一段。'
        ]
      }
    },

    // ── U3 迁移 ──
    demoU3: {
      book: '必修一', unit: 'U3', type: 'RT',
      unitTopic: 'Sports and Fitness',
      title: 'Living Legends',
      sub: 'Masters of Their Sports',
      source: { print: 38, pdf: 45 },
      readingKey: '必修一|U3|RT',
      lead: '和 U2 反过来：这次不给示范，学生自己写。只给全文骨架和符号表，让学生自己记每一段；' +
        '同桌互查——遮住原文，看对方笔记能不能说回来。全班对齐时你会发现：同一个意群，不同学生切法不同，' +
        '这个差异本身就是最好的教学素材。最后把成品笔记亮出来，作为标准答案对照。',

      upgrade: {
        title: '结构升级：从「并列」到「嵌套」',
        rows: [
          { k: 'U2', d: '并列的五块——四条线路夹在背景与号召之间。' },
          { k: 'U3', d: '征稿 + 两个例证，例证内部各有自己的小线：郎平「三重身份 → 一次考验 → 结果」，乔丹「球技 → 精神 → 回馈」。' },
          { k: '难度', d: '嵌套骨架比并列难一级，正好接着练；但三条铁律没变。' }
        ]
      },

      skeleton: {
        title: '全文骨架',
        lines: [
          { lv: 0, tree: '●', txt: 'Living Legends（征稿）', gloss: '一篇文章 = 一个 ●' },
          { lv: 1, tree: '├', txt: '① 开篇：选谁？标准 = masters + good examples', gloss: '导语' },
          { lv: 1, tree: '├', txt: '② 郎平：3 身份 → 考验 → 夺冠', gloss: '例证一' },
          { lv: 1, tree: '├', txt: '③ 乔丹：球技 → 精神 → 回馈', gloss: '例证二' },
          { lv: 1, tree: '└', txt: '④ 号召：投稿', gloss: '结尾' }
        ],
        note: '先给这张骨架，再让学生往下填——骨架是老师给的，笔记是学生自己写的。'
      },

      // 一处真实的非同级缺陷：拿来当教学素材
      flaw: {
        title: '一个真实的缺陷：一层挂了 6 个分支',
        desc: '「郎平」那一段最初的笔记，一层里挂了 6 行：前 3 行讲她是谁（身份），后 3 行讲她遇到什么（考验）。' +
          '按第 ② 条原则——同级必须同质——这 6 行答的根本不是同一个问题，该下沉一级，分成两组。',
        beforeTitle: '改前（6 行同层，看着热闹，看不出重点）',
        before: [
          '● LP 郎平',
          '├ as player → honour + glory',
          '├ as coach → 中女排 → medals',
          '├ as person → fans 爱 home + abroad',
          '├ 2015 WCup：best player ↑injured + captain 走',
          '├ 2 ↓ ≠ lose heart',
          '└ ∴ 2wk → 世界冠军 !'
        ],
        afterTitle: '改后（两组各答一个问题：她是谁 / 她遇到什么）',
        after: [
          '● LP 郎平',
          '├ 三重身份',
          '│ ├ as player → honour + glory',
          '│ ├ as coach → 中女排 → medals',
          '│ └ as person → fans 爱 home + abroad',
          '└ 一次考验：2015 WCup',
          '  ├ best player ↑injured + captain 走',
          '  ├ 2 ↓ ≠ lose heart',
          '  └ ∴ 2wk → 世界冠军 !'
        ],
        tip: '这就是第 ④ 条原则的用处：一层超过 3–5 个分支，别硬背，回头把问题再问细一点。'
      },

      class: {
        title: '课堂动作（迁移期）',
        steps: [
          '只给全文骨架和符号表，让学生自己写每一段的笔记。',
          '同桌互查：遮住原文，看对方笔记能不能说回来。',
          '全班对齐——同一个意群，不同学生切法不同，这个差异本身就是最好的教学素材。',
          '最后把成品笔记亮出来，作为标准答案对照。'
        ]
      }
    }
  };
})();
