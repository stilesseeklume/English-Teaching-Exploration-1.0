// docs/data/interpreting_notes_method.js
//
// 口译笔记法（跨单元方法，背课文用的速记法）· 数据层
//
// 和 textbook_reading_notes.js（逐篇阅读笔记）平行的另一层：
//   那一层回答「这篇课文怎么读、怎么记」；这一层回答「笔记这套方法本身怎么写」。
//
// 用途：一页小版块，把方法讲给老师与学生——
//   原理（笔记不是记录，是线索）→ 四条原则 / 中英选择 / 锚句 → 符号表
//   → U2《Travel Peru》示范（可交互课本 + 逐块笔记 + 原文锚句）→ U3《Living Legends》迁移
//
// 样例选择：U2 RT 学生已背过，拿它做「适应期」示范；U3 RT 做「迁移期」，让学生自己写。
// U3 的成品笔记不在这里复制一份，直接从 textbook_reading_notes.js 取，保证单一来源。

(function () {
  window.INTERPRETING_NOTES_METHOD = {

    kicker: '跨单元 · 方法',
    title: '口译笔记法',
    sub: '笔记不是记录，是线索',
    lead: '从第一段开始，边看原文和页边笔记，边练四件事。每一段只练一件，六段走完，方法就长在笔记上。' +
      '页首那一条不是目录，是这堂课要反复用的四句话；点到哪一段，哪一句就亮。',

    // ── 一句话立场（页面上要单独放大）──
    stance: {
      big: '笔记越少越好。写得多，说明你记的是词，不是意。',
      small: '遮住原文，只看笔记，能不能把原话说回来？——这是唯一判据。'
    },

    // ── 四条原则：每条都能在第一到第四段里直接看见 ──
    // 页首常驻条用它渲染；点一条就跳到对应段落。
    rules: [
      {
        no: '①', name: '先定问题', short: '先定问题', target: 0,
        d: '这一段在回答什么问题？答案写在最左边，其余写在它下面，往右空一格。'
      },
      {
        no: '②', name: '同一类问题', short: '同一类问题', target: 1,
        d: '并排的几行，回答的是同一类问题：怎么去、住哪、干什么。'
      },
      {
        no: '③', name: '一件事一行', short: '一件事一行', target: 2,
        d: '一件事写一行；第二件，往右空一格再写。不用写 because、so。'
      },
      {
        no: '④', name: '只记名词', short: '只记名词', target: 3,
        d: '动词不写，只记名词；说的时候动词自己补。'
      }
    ],

    // ── 变通：第五、六段不再套新原则，只说明什么时候停 ──
    variations: {
      title: '变通',
      items: [
        { k: '够用就停', d: 'Titicaca 写「怎么去、住哪、特色」三行就够，不用硬凑第四行。' },
        { k: '只有一件事就写一行', d: '结尾就一句号召，写一行就够了，不用拆。' }
      ]
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
        { k: '怎么挑', d: '跟着缩进走：每一行，取原文里最先出现、最能代表这一行的那一句。' },
        { k: '多少句', d: '一段 1–2 句封顶。超过两句，说明这一段有两个重心，那应该拆成两段看。' },
        { k: '两种句子', d: '撑住这一段的那句 + 考试会挖的那句。' }
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
        { sym: '缩进', mean: '下一层往右空一格，手写不画树形符', ex: '写在上一行下面' },
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

    // ── 方法依据（页尾折叠，只给老师查证；学生页面上不出现引用）──
    refs: {
      lead: '这套笔记法来自交替传译笔记的通行体系；本页只做了课堂化压缩，没有另创一套。',
      items: [
        {
          id: '1',
          text: 'Rozan, J.-F. (1956). La prise de notes en interprétation consécutive. Genève: Georg. 英译：Note-taking in Consecutive Interpreting, trans. A. Gillies, Cracow: Tertium, 2002.',
          href: 'https://interpretertrainingresources.eu/tag/rozan/'
        },
        {
          id: '2',
          text: 'Gillies, A. (2017). Note-taking for Consecutive Interpreting: A Short Course (2nd ed.). London: Routledge. DOI: 10.4324/9781315648996.',
          href: 'https://doi.org/10.4324/9781315648996'
        },
        {
          id: '3',
          text: '吴钟明 主编（2024）.《英语口译笔记法实战指导》（第四版）. 武汉：武汉大学出版社. ISBN 978-7-307-24587-7.',
          href: 'https://wdp.com.cn/books/2025-02-13/11190.html'
        }
      ],
      map: [
        { k: '① 先定问题', v: 'Rozan 原则 1 [1]；吴钟明 [3]' },
        { k: '② 同一类问题', v: '课本 p27 任务 4 的路线表；Gillies [2]' },
        { k: '③ 一件事一行', v: 'Rozan 原则 6–7（竖排、缩进）[1]' },
        { k: '④ 只记名词', v: '本站课堂规则，文献无此原文' },
        { k: '变通（够用就停、只有一件事就写一行）', v: '本站课堂规则，文献无此原文' }
      ],
      note: '手写时只靠缩进，不画树形符。符号表中除 →、∵、∴ 等通行逻辑符号外，其余为本站约定，不是各教材的统一标准。'
    },

    // ── 自检 ──
    check: {
      title: '一条自检判据',
      rule: '遮住原文，只看笔记，能不能把原话说回来？',
      rows: [
        { r: '能', d: '合格。' },
        { r: '不能', d: '要么意群切错了，要么缩进乱了，要么记的是词不是意。' }
      ]
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
      lead: '先拿 U2：这篇已经背过，不用分心去理解内容，全部注意力可以放在「怎么记」上；' +
        '记完立刻能用自己的记忆做验证——照着笔记，能不能把背过的原话调出来。' +
        '而且它的骨架最简单：开篇一段百科背景，中间四条线路并列，结尾一句号召。',

      pages: [
        { key: 'p26', print: 26, src: '../assets/textbook/bx1/u2-rt-p26-page.webp', note: 'Reading and Thinking · Explore Peru · Travel Peru 开篇' },
        { key: 'p27', print: 27, src: '../assets/textbook/bx1/u2-rt-p27-page.webp', note: 'Travel Peru 续 · Cusco / Titicaca / 结尾号召' }
      ],

      skeleton: {
        title: '先立骨架，再看细节',
        lines: [
          { lv: 0, tree: '●', txt: 'Travel Peru（旅游手册）', gloss: '一篇文章 = 一个顶格标题' },
          { lv: 1, tree: '├', txt: '① 概况 · Peru', gloss: '百科背景' },
          { lv: 1, tree: '├', txt: '② Amazon 雨林', gloss: '线路一' },
          { lv: 1, tree: '├', txt: '③ Machu Picchu', gloss: '线路二' },
          { lv: 1, tree: '├', txt: '④ Cusco', gloss: '线路三' },
          { lv: 1, tree: '├', txt: '⑤ Lake Titicaca', gloss: '线路四' },
          { lv: 1, tree: '└', txt: '⑥ 号召 · Come to Peru', gloss: '结尾' }
        ],
        note: '背景 + 四条线路 + 号召，六块一条线拉到底——这是最容易的骨架。'
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
          drill: '① 先定问题：这段在回答「Peru 是什么」，最左边写「Peru 概况」，其余写在下面，往右空一格。',
          tip: '这一段回答「Peru 是什么」，所以最左边只写 位置 / 三区 / 历史 / 语言，其余全丢。',
          gist: '先说秘鲁在哪、分哪三块、历史上有过什么，最后用一句话解释为什么秘鲁说西班牙语。',
          notes: [
            { lv: 0, tree: '●', txt: 'Peru 概况 · 太平洋岸', gloss: '顶格：这一段讲什么' },
            { lv: 1, tree: '├', txt: '位置：Pacific coast @S.America', gloss: '在哪' },
            { lv: 1, tree: '├', txt: '3 区：coast（窄·干·平）+ Andes + Amazon', gloss: '沿海 · 山地 · 雨林' },
            { lv: 1, tree: '├', txt: '1400s–1500s = 古 Inca 帝国中心', gloss: '历史高光' },
            { lv: 2, tree: '└', txt: 'Machu Picchu ← Inca emperor 住', gloss: '往右空一格：帝王的城' },
            { lv: 1, tree: '├', txt: '16c Spain 控 → 1821', gloss: '殖民与独立' },
            { lv: 1, tree: '└', txt: '∴ 主要官方语 = Spanish', gloss: '用逻辑符号收尾，不写 so' }
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
          hot: { x: 0.172, y: 0.572, w: 0.366, h: 0.372 },
          focus: { x: 0.172, y: 0.752, w: 0.366, h: 0.192 },
          shot: '../assets/textbook/bx1/u2-rt-p26-s2.webp',
          drill: '② 同一类问题：怎么去 / 住哪 / 干什么，三行回答的是同一类问题。',
          tip: '这三件事就是「怎么去、住哪、干什么」三个问题；不要把路线细节塞进时间那一行。',
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
          hot: { x: 0.536, y: 0.572, w: 0.404, h: 0.372 },
          focus: { x: 0.536, y: 0.772, w: 0.404, h: 0.172 },
          shot: '../assets/textbook/bx1/u2-rt-p26-s3.webp',
          drill: '③ 一件事一行：先写「到达」，再写「探索」；干砌石是第三件事，往右空一格再写。',
          tip: '一件事一行：先「到达」再「探索」，再往下才写干砌石——一行只写一件事，照着能一步步说回去。',
          gist: '四天徒步穿越安第斯山脉走到马丘比丘，到了之后用一天探索古城；这一段的重心是印加人的干砌石建筑法。',
          notes: [
            { lv: 0, tree: '●', txt: 'Machu Picchu · 4d 徒步', gloss: '去哪 + 待几天' },
            { lv: 1, tree: '├', txt: '徒步 → Andes paths → 古城', gloss: '怎么去：走进去' },
            { lv: 1, tree: '├', txt: '到达 → 1d explore + amazed', gloss: '到了干什么' },
            { lv: 1, tree: '└', txt: '尤其 amazing = Inca dry stone', gloss: '这一段最想说的，单独写一行' },
            { lv: 2, tree: '└', txt: '切石 exact size → 墙靠 perfect fit（≠ 加固）', gloss: '再往右空一格：解释干砌石' }
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
          hot: { x: 0.044, y: 0.552, w: 0.430, h: 0.344 },
          focus: { x: 0.044, y: 0.753, w: 0.430, h: 0.143 },
          shot: '../assets/textbook/bx1/u2-rt-p27-s4.webp',
          drill: '④ 只记名词：五个动词只留 hotel / museum / architecture / food / market。',
          tip: '五个并列动词（stay / visit / admire / enjoy / go shopping）只记名词：hotel、museum、architecture、food、market，动词自己补。',
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
          hot: { x: 0.472, y: 0.552, w: 0.436, h: 0.344 },
          focus: { x: 0.472, y: 0.754, w: 0.436, h: 0.142 },
          shot: '../assets/textbook/bx1/u2-rt-p27-s5.webp',
          drill: '变通：够用就停——怎么去、住哪、特色，三行就够，不用硬凑第四行。',
          tip: '够用就停：这一段只写「怎么去、住哪、特色」三行，不用为了整齐硬拆第四行。',
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
          hot: { x: 0.030, y: 0.892, w: 0.940, h: 0.074 },
          shot: '../assets/textbook/bx1/u2-rt-p27-s6.webp',
          drill: '变通：只有一件事——写一行就够了，不用拆。',
          tip: '只有一件事：结尾就一句号召，写一行；拆开反而背得慢。',
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
        cols: ['线路', '待几天', '怎么去', '住哪', '干什么'],
        rows: [
          { cells: ['Amazon 雨林', '4d', '✈ + 🚤 1d', '林中', '探索动植物'] },
          { cells: ['Machu Picchu', '4d', '徒步', '—', '探索古城 + 惊叹干砌石'] },
          { cells: ['Cusco', '4d', '—', 'local hotel', '博物馆 / 建筑 / 美食 / 市场'] },
          { cells: ['Titicaca', '3d', '🚗 1d', 'Uros 人家', '住岛 / 湖草'] }
        ],
        found: '课文自己也有这张表：第 27 页任务 4 让你填的，正是 Place → Number of days → Transport → Accommodation → Activity，' +
          '也就是「去哪 → 待几天 → 怎么去 → 住哪 → 干什么」。编课本的人和我们记的是同一副骨头。',
        ask: '要教给学生的就这一句：手册类文章，四条线路共用一副模具——去哪 → 待几天 → 怎么去 → 住哪 → 干什么。'
      },
    },

    // ── U3 迁移 ──
    demoU3: {
      book: '必修一', unit: 'U3', type: 'RT',
      unitTopic: 'Sports and Fitness',
      title: 'Living Legends',
      sub: 'Masters of Their Sports',
      source: { print: 38, pdf: 45 },
      readingKey: '必修一|U3|RT',
      lead: '和 U2 反过来：这次不给示范，自己写。先看全文骨架和符号表，再一段一段记；' +
        '写完遮住原文，看自己的笔记能不能把原话说回来。',

      upgrade: {
        title: '结构升级：从「六块并排」到「块里还有小线」',
        rows: [
          { k: 'U2', d: '并列的六块——四条线路夹在概况与号召之间。' },
          { k: 'U3', d: '征稿 + 两个例证，例证内部各有自己的小线：郎平「三重身份 → 一次考验 → 结果」，乔丹「球技 → 精神 → 回馈」。' },
          { k: '难度', d: '例证里面还有小线，比 U2 的并列难一点，正好接着练；但四条原则没变。' }
        ]
      },

      skeleton: {
        title: '全文骨架',
        lines: [
          { lv: 0, tree: '●', txt: 'Living Legends（征稿）', gloss: '一篇文章 = 一个顶格标题' },
          { lv: 1, tree: '├', txt: '① 开篇：选谁？标准 = masters + good examples', gloss: '导语' },
          { lv: 1, tree: '├', txt: '② 郎平：3 身份 → 考验 → 夺冠', gloss: '例证一' },
          { lv: 1, tree: '├', txt: '③ 乔丹：球技 → 精神 → 回馈', gloss: '例证二' },
          { lv: 1, tree: '└', txt: '④ 号召：投稿', gloss: '结尾' }
        ],
        note: '先看这张骨架，再往下填——骨架在这里，笔记自己写。'
      }
    }
  };
})();
