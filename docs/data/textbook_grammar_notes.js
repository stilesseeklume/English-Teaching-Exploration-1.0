// docs/data/textbook_grammar_notes.js
//
// 课本语法 · 单元讲解层（高一教材口径）
// 与「书本速查」(高三应试口径, KNOWLEDGE_DATA) 刻意分离：本文件只服务「课本单元」视图。
//
// key = 册 + '|' + 单元
// 字段：
//   book / unit / topic / grammar_zh / grammar_en
//   source : { print:印刷页, pdf:PDF页, task:课本板块任务名 }
//   lead   : 一句话定位
//   sections : [ ... ]   按课本板块顺序排布，每个板块一张卡：
//       title   : 板块标题（课本的说法）
//       shots   : [{ src, kind:'page'|'zoom', print, title, note }]  课本原书图（先整页、再关键句放大）
//       book    : []  这个板块课本怎么说
//       compare : [{ en, zh, aid }]  逐条对照：左=课本原句，右=教辅批注
//       aid     : { title, items:[{ title, points:[] }] }  教辅深化（贴在本板块后面）
//   drills  : { title, caveat, shots:[], lines:[] }  课本练习 + 参考答案
//
// 数据来源：人教版必修一正文 p37 / p40 + 语法附录 p109 + 语法通霸 16.01「反意疑问句」

(function () {
  window.TEXTBOOK_GRAMMAR_NOTES = {

    '必修一|U3': {
      book: '必修一',
      unit: 'U3',
      topic: 'Sports and Fitness',
      grammar_zh: '反意疑问句',
      grammar_en: 'Tag questions',
      source: { print: 40, pdf: 47, task: 'Make small conversations' },
      lead: '口语里用来「求证、寒暄、拉近距离」的句式：先说一句陈述，再挂一个简短的问句。',

      sections: [
        {
          title: '① 概念 · 它到底在干嘛',
          shots: [
            {
              src: '../assets/textbook/bx1/u3-p109-page.webp',
              kind: 'page',
              print: 109,
              title: '课本语法附录 p109（整页）',
              note: '「III Tag Questions 附加疑问句」整页都在这张上：概念、组成表、回答、读法。'
            }
          ],
          book: [
            '反意疑问句（课本附录里叫「附加疑问句」）主要用于口语：说话人用它向对方验证自己的陈述或判断，也可以用在祈使句里表示请求或建议。',
            '它由两部分组成 —— 陈述部分 + 附加疑问部分。附加疑问部分一般由「助动词 / be 动词 / 情态动词 + 表示主语的代词」构成。'
          ],
          compare: [
            {
              en: 'You often play badminton, don\'t you?',
              zh: '你常打羽毛球吧？',
              aid: '前半句 you often play badminton 是陈述，后半句 don\'t you 才是附加疑问 —— 两部分缺一不可。'
            }
          ]
        },

        {
          title: '② 组成 · 前肯后否，前否后肯',
          shots: [
            {
              src: '../assets/textbook/bx1/u3-tag-appendix-1.webp',
              kind: 'zoom',
              print: 109,
              title: '关键处放大 · 附录「附加疑问句的组成」表',
              note: '四类对照表：肯定句 / 否定句 / 含否定词 / 祈使句，各自配什么附加部分。'
            }
          ],
          book: [
            '肯定陈述 + 否定附加：You often play badminton, don\'t you?',
            '否定陈述 + 肯定附加：It\'s not a real sport, is it?',
            '含否定词的陈述 + 肯定附加：Nobody saw him walk into the room, did they?',
            '祈使句 + 附加：Come along with me, will you?'
          ],
          compare: [
            {
              en: 'You often play badminton, don\'t you?',
              zh: '你常打羽毛球吧？',
              aid: '前肯后否：陈述是肯定的，附加部分就用否定。'
            },
            {
              en: 'It\'s not a real sport, is it?',
              zh: '这不是真正的运动吧？',
              aid: '前否后肯：陈述里有 not，附加部分回到肯定 is it。'
            },
            {
              en: 'Nobody saw him walk into the room, did they?',
              zh: '没人看见他走进房间吧？',
              aid: 'nobody 算否定词 → 附加用肯定 did they；主语不再用 nobody，换成人称代词 they。'
            },
            {
              en: 'Come along with me, will you?',
              zh: '跟我来吧，好吗？',
              aid: '祈使句默认用 will you；只有说「一起去」的 Let\'s… 才用 shall we。'
            }
          ],
          aid: {
            title: '教辅深化 · 语法通霸 16.01',
            items: [
              {
                title: '附加疑问部分的主语只能用人称代词',
                points: [
                  'one → 后面的疑问部分可用 one / he。',
                  'everything / anything / nothing / something → 用 it，不用 they。',
                  'this / that / these / those → 用 it 或 they。',
                  'everyone / everybody / someone / somebody / anyone / nobody → 一般用 he 或 they。',
                  '不定式 / 动名词 / 其他短语作主语 → 一般用 it。',
                  'there be 句型 → 疑问部分用 be / 情态动词 / 助动词 + there。'
                ]
              },
              {
                title: '祈使句的反意疑问句',
                points: [
                  '一般用 will you / won\'t you。',
                  '否定祈使句用 will you / can you：Don\'t make much noise, will/can you?',
                  'Let\'s…（含对方，一起去）→ 用 shall we：Let\'s go to the park, shall we?',
                  'Let us…（不含对方，请求允许）→ 用 will you：Let us know the time of your arrival, will you?'
                ]
              },
              {
                title: '陈述部分含否定意义的词',
                points: [
                  'never / seldom / hardly / few / little / barely / scarcely / nothing / none / rarely / no / not / no one / nobody / neither → 视为否定，疑问部分用肯定。',
                  '· There are few apples in the basket, are there?',
                  '· He can hardly swim, can he?',
                  '反例：unhappy / dislike / unfriendly 等「词缀否定」当作肯定句处理，疑问部分仍用否定。',
                  '· He looks unhappy, doesn\'t he?',
                  'less / fewer 视为肯定词，疑问部分用否定：There will be less pollution, won\'t there?'
                ]
              }
            ]
          }
        },

        {
          title: '③ 功能 · 为什么要说这句',
          shots: [
            {
              src: '../assets/textbook/bx1/u3-p40-page.webp',
              kind: 'page',
              print: 40,
              title: '课本正文 p40（整页）',
              note: '「Discovering Useful Structures」整页：任务 1 的对话、任务 2 的补全练习、任务 3 的情境任务。'
            },
            {
              src: '../assets/textbook/bx1/u3-tag-conversations.webp',
              kind: 'zoom',
              print: 40,
              title: '关键处放大 · 任务 1 的三组小对话',
              note: '课本原题：先让学生圈出每句末尾的附加疑问部分，再讨论它们各自的功能。'
            },
            {
              src: '../assets/textbook/bx1/u3-tag-scene.webp',
              kind: 'zoom',
              print: 40,
              title: '关键处放大 · 任务 3 情境图与示范',
              note: '运动会海报与球场两张情境图；示范对话给出 isn\'t it / don\'t they 两种附加问法。'
            }
          ],
          book: [
            '课本任务 1 的思考题：What functions do the tag questions have?',
            '求证：说话人心里已有判断，想让对方确认。',
            '寒暄 / 开启话题：如 It\'s a beautiful day, isn\'t it? —— 重点不在问天气，而在搭话。',
            '希望对方同意：附加部分用降调时，多为期待对方附和。'
          ],
          compare: [
            {
              en: 'It\'s a beautiful day, isn\'t it?',
              zh: '今天天气真好，不是吗？',
              aid: '典型寒暄：不是真在问天气，是在找话题。'
            },
            {
              en: 'That sounds interesting, doesn\'t it?',
              zh: '那听起来挺有意思，不是吗？',
              aid: '求证：说话人已有判断，等对方点个头。'
            },
            {
              en: 'The Sports Day is coming soon, isn\'t it? — Yes, it is.',
              zh: '运动会快到了，不是吗？—— 是啊。',
              aid: '降调时多为期待附和，学生直接答 Yes, it is. 就对了。'
            }
          ]
        },

        {
          title: '④ 回答 · 本节最大的坑',
          shots: [
            {
              src: '../assets/textbook/bx1/u3-tag-appendix-2.webp',
              kind: 'zoom',
              print: 109,
              title: '关键处放大 · 附录「回答」与「读法」',
              note: '答语按「事实」而非按「对方说法的对错」；附加部分的升调与降调。'
            }
          ],
          book: [
            '答语与一般疑问句类似：按「事实」回答 Yes / No，而不是按「对方说法的对错」。',
            'You can\'t cook, can you? —— 你不会做饭，是吗？（汉语问的是「不会」）',
            'Yes, I can. —— 不，我会。（汉语答的却是「会」，所以中文说「不」）'
          ],
          compare: [
            {
              en: 'You can\'t cook, can you? — Yes, I can.',
              zh: '你不会做饭，是吗？—— 不，我会。',
              aid: '按事实答：会做饭就用 Yes，汉语却说「不」。这是本节最大的坑。'
            },
            {
              en: 'It\'s not a real sport, is it? — Yes, it is.',
              zh: '这不是真正的运动吧？—— 不，它是。',
              aid: '同理：它确实是真运动 → Yes；不要跟着中文答「不」。'
            },
            {
              en: 'Our school soccer team won at last, didn\'t they? — No, they didn\'t.',
              zh: '我们校队终于赢了，不是吗？—— 不，他们没赢。',
              aid: '事实是没赢 → No。答语只看事实，不看问句是肯定还是否定。'
            }
          ]
        },

        {
          title: '⑤ 读法 · 升调还是降调',
          shots: [
            {
              src: '../assets/textbook/bx1/u3-p37-page.webp',
              kind: 'page',
              print: 37,
              title: '课本正文 p37（整页）',
              note: '这一页下半部分是 Pronunciation 板块：专门练附加疑问句的升调与降调。'
            },
            {
              src: '../assets/textbook/bx1/u3-tag-intonation.webp',
              kind: 'zoom',
              print: 37,
              title: '关键处放大 · Pronunciation 语调对话',
              note: 'Dave 与 Jack 的健身房对话，每句后面都是附加疑问句。'
            }
          ],
          book: [
            '陈述部分一般用降调（↘）。',
            '附加疑问部分可升可降，含义不同 ——',
            '升调（↗）：多表示疑问或请求 —— The school team have won the gold medal, ↗haven\'t they?',
            '降调（↘）：多表示求证或希望对方同意 —— The school team have won the gold medal, ↘haven\'t they?'
          ],
          compare: [
            {
              en: '…↗ haven\'t they?',
              zh: '升调：真的在问 / 请求',
              aid: '自己不确定、想从对方那里得到信息时用升调。'
            },
            {
              en: '…↘ haven\'t they?',
              zh: '降调：求证 / 求同',
              aid: '心里已有答案、只要对方附和时用降调。'
            }
          ]
        },

        {
          title: '⑥ 课本没讲、考试会考',
          shots: [],
          book: [
            '课本正文和附录都没有展开这两类，但它们在高一考试里很常见 —— 教辅把它们补上。'
          ],
          compare: [],
          aid: {
            title: '教辅深化 · 语法通霸 16.01',
            items: [
              {
                title: 'I/we think (believe, suppose, expect, imagine…) 后接宾语从句',
                points: [
                  '一般复合句看主句；但主句是 I/we think 类时，疑问部分要和宾语从句保持一致。',
                  '否定转移到主句上时，仍按「否定」处理，疑问部分用肯定：',
                  '· I don\'t believe he likes swimming, does he?',
                  '· I suppose he has gone home, hasn\'t he?',
                  '主句主语不是第一人称（第二、三人称）时，疑问部分跟主句走：主句肯定→用否定，主句否定→用肯定。',
                  '· He thinks his wife doesn\'t love him, doesn\'t he?'
                ]
              },
              {
                title: 'need / dare / used to',
                points: [
                  'need、dare 既可作实义动词也可作情态动词 —— 陈述部分用哪种，疑问部分就要用哪种。',
                  'used to 也有两种变法，陈述部分与疑问部分保持一致。'
                ]
              }
            ]
          }
        }
      ],

      drills: {
        title: '课本练习 · 参考答案',
        caveat: '答案为按课本语境推得的参考答案，非官方答案册。',
        shots: [
          {
            src: '../assets/textbook/bx1/u3-tag-drill.webp',
            kind: 'zoom',
            print: 40,
            title: '课本 p40 · 任务 2 补全对话',
            note: '补出句中缺的附加疑问句，或按「事实」补答语。'
          }
        ],
        lines: [
          '1. ① No, it isn\'t. ② can\'t we? ③ No, we can\'t.',
          '2. ① isn\'t it? ② doesn\'t she? ③ Yes, she does.',
          '3. ① isn\'t he? ② is he? ③ isn\'t he?'
        ]
      }
    }

  };
})();
