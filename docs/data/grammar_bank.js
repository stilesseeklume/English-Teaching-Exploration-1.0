// 当前 canonical · 可手工编辑（历史过渡期）
// 页面实际读取：docs/data/grammar_bank.js
// 修改后必须运行：bash scripts/check_all.sh
window.GRAMMAR_BANK = {
  "version": "1.0",
  "generated_from": "data/语法填空库",
  "category_names": {
    "predicate": "谓语动词",
    "nonpredicate": "非谓语动词",
    "word": "词性转换",
    "number": "名词/数词",
    "article": "冠词",
    "pronoun": "代词",
    "preposition": "介词",
    "logic": "逻辑连词",
    "attrib": "定语从句",
    "nounclause": "名词性从句",
    "advclause": "状语从句"
  },
  "exams": [
    {
      "exam_id": "2023全国一卷",
      "year": 2023,
      "type": "真题",
      "question_id": "56-65",
      "passage": "Xiao long bao (soup dumplings), those amazing constructions of delicate dumpling wrappers, encasing hot, ___56___ (taste) soup and sweet, fresh meat, are far and away my favorite Chinese street food. The dumplings arrive steaming and dangerously hot. To eat one, you have to decide whether ___57___ (bite) a small hole in it first, releasing the stream and risking a spill (溢出), ___58___ to put the whole dumpling in your mouth, letting the hot soup explode on your tongue. Shanghai may be the ___59___ (recognize) home of the soup dumplings but food historians will actually point you to the neighboring canal town of Nanxiang as Xiao long bao's birthplace. There you will find them prepared differently --- more dumpling and less soup, and the wrappers are pressed ___60___ hand rather than rolled. Nanxiang aside, the best Xiao long bao have a fine skin, allowing them ___61___ (lift) out of the steamer basket without tearing or spilling any of ___62___ (they) contents. The meat should be fresh with ___63___ touch of sweetness and the soup hot, clear and delicious.\n\nNo matter where I buy them, one steamer is ___64___ (rare) enough, yet two seems greedy, so I am always left ___65___ (want) more next time.",
      "blank_count": 10,
      "questions": [
        {
          "no": 56,
          "answer": "tasty",
          "explanation": "考查形容词。句意：小笼包(汤包)，那些精致的饺子皮，包裹着热腾腾的美味汤和甜甜的鲜肉，是我最喜欢的中国街头小吃。形容词需修饰后面的名词soup(汤)，故空格需用tasty\"美味的\"作定语，故填tasty。",
          "grammar_point": "形容词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-adj",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 57,
          "answer": "to bite",
          "explanation": "考查非谓语动词。句意：吃小笼包的时候，你必须要决定是先咬一个小口流出汤汁，还是把整个小笼包放进嘴里，让热汤在舌头上爆炸。decide to do sth.\"决定做某事\"，用不定式作宾语，空处与后面to put并列作宾语，故填to bite。",
          "grammar_point": "非谓语动词",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-to-do",
          "nonp_function": "object",
          "nonp_function_label": "作宾语",
          "nonp_form": "to_do",
          "nonp_form_label": "to do",
          "nonp_rule": "特定动词 decide 后接 to do 作宾语，空格与后面的 to put 并列。",
          "nonp_needs_review": false,
          "facets": {
            "form": "to-do"
          }
        },
        {
          "no": 58,
          "answer": "or",
          "explanation": "考查连词。句意：吃小笼包的时候，你必须要决定是先咬一个小口流出汤汁，还是把整个小笼包放进嘴里，让热汤在舌头上爆炸。whether...or... \"是......还是......\"，固定搭配，根据句意，故填or。",
          "grammar_point": "连词",
          "category": "logic",
          "category_name": "逻辑连词",
          "fine_category": "logic-coordinating",
          "facets": {
            "word": "or",
            "kind": "correlative"
          }
        },
        {
          "no": 59,
          "answer": "recognized",
          "explanation": "考查非谓语动词。句意：上海可能是公认的小笼包之乡，但美食历史学家会告诉你，邻近的运河小镇南翔才是小笼包的发源地。空格在名词home前面作定语，recognize与home是逻辑上动宾关系，需填过去分词recognized作定语，recognized\"被公认的\"也可以看作是形容词作定语，故填recognized。",
          "grammar_point": "非谓语动词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-adj",
          "nonp_function": "attribute",
          "nonp_function_label": "作定语",
          "nonp_form": "done",
          "nonp_form_label": "done",
          "nonp_rule": "recognized 修饰 home，home 与 recognize 是动宾关系，用 done 作前置定语。",
          "nonp_needs_review": false,
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 60,
          "answer": "by",
          "explanation": "考查介词。句意：在那里，你会发现它们的制作方式不同------更多汤包，更少的汤，包子皮是用手压的，而不是擀出来的。by hand\"用手\"是固定搭配，根据句意，故填by。",
          "grammar_point": "介词",
          "category": "preposition",
          "category_name": "介词",
          "fine_category": "prep-other",
          "facets": {
            "word": "by"
          }
        },
        {
          "no": 61,
          "answer": "to be lifted",
          "explanation": "考查非谓语动词。句意：除了南翔，最好的小笼包有一个精致的，可以让它们从蒸笼篮中拿出来，而不会撕裂或溢出里面的东西。根据搭配allow sb. to do sth.\"允许某人做某事\"可知，空格需用动词不定式作宾语补足语，补足语lift out与宾语them（指代小笼包）是逻辑上的动宾关系，空格需填动词不定式的被动式to be lifted，故填to be lifted。",
          "grammar_point": "非谓语动词",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-done",
          "nonp_function": "complement",
          "nonp_function_label": "作补语",
          "nonp_form": "to_be_done",
          "nonp_form_label": "to be done",
          "nonp_rule": "allow 后接宾语补足语；them 与 lift out 是动宾关系，所以用 to be done。",
          "nonp_needs_review": false,
          "facets": {
            "form": "done"
          }
        },
        {
          "no": 62,
          "answer": "their",
          "explanation": "考查代词。句意：除了南翔，最好的小笼包有一个精致的外皮，可以让它们从蒸笼篮中拿出来，而不会撕裂或溢出里面的东西。修饰后面的名词contents(东西)需用形容词性物主代词their，故填their。",
          "grammar_point": "代词",
          "category": "pronoun",
          "category_name": "代词",
          "fine_category": "pron-personal",
          "facets": {
            "type": "personal"
          }
        },
        {
          "no": 63,
          "answer": "a",
          "explanation": "考查冠词。句意：肉应该是新鲜的，有一点甜味，汤应该是热的，清澈的，美味的。a touch of \"一点点；稍许\"，常用搭配，touch\"轻微；稍许\"常用作单数，故填a。",
          "grammar_point": "冠词",
          "category": "article",
          "category_name": "冠词",
          "fine_category": "art-a-an",
          "facets": {
            "word": "a-an"
          }
        },
        {
          "no": 64,
          "answer": "rarely",
          "explanation": "考查副词。句意：无论我在哪里买，一蒸笼都不够，而两蒸笼又显得太贪心了，所以我总是想下次再买。修饰形容词用副词作状语，rarely\"少有\"，故填rarely。",
          "grammar_point": "副词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-adv",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 65,
          "answer": "wanting",
          "explanation": "考查非谓语动词。句意：无论我在哪里买，一蒸笼都不够，而两蒸笼又显得太贪心了，所以我总是想下次再买。分析句子可知，此处考查\"leave sb.+宾语补足语\"，本句是被动语态，want是主语补足语，根据句意，I与want之间是主动的逻辑关系，用现在分词wanting，故填wanting。",
          "grammar_point": "非谓语动词",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-doing",
          "nonp_function": "complement",
          "nonp_function_label": "作补语",
          "nonp_form": "doing",
          "nonp_form_label": "doing",
          "nonp_rule": "be left 后接主语补足语，I 与 want 是主谓关系，用 doing 表主动状态。",
          "nonp_needs_review": false,
          "facets": {
            "form": "doing"
          }
        }
      ],
      "chinese_translation": "小笼包，这些由精致面皮包裹着滚烫鲜美汤汁和甜嫩肉馅的精妙构造，无疑是我最爱的中国街头美食。蒸笼端上时热气腾腾，烫得令人心惊。吃小笼包时，你得决定是先咬开一个小口让汤汁流出（冒着溢出的风险），还是将整只包子送入口中，让热汤在舌尖迸溅。上海虽被公认为小笼包的故乡，但美食史学家会告诉你，真正发源地其实是邻近的水乡古镇南翔。在那里，你会尝到不同做法——皮更厚、汤更少，面皮是手工按压而非擀制而成。撇开南翔不谈，最棒的小笼包皮薄如蝉翼，能直接从蒸笼里夹起而不破皮漏汤。肉馅需鲜嫩带甜，汤汁滚烫清澈，滋味鲜美。\n\n无论在哪里买，一笼总嫌不够，两笼又显贪心，于是每次吃完都盼着下次再多来些。"
    },
    {
      "exam_id": "2023全国二卷",
      "year": 2023,
      "type": "真题",
      "question_id": "56-65",
      "passage": "Whenever I tell people that I teach English at the Berlin Zoo, I almost always get a questioning look. Behind it, the person is trying to figure out who exactly I teach...the animals?\n\nSince June 2017, right before the ___56___ (arrive) of the two new pandas, Meng Meng and Jiao Qing, I have been helping the panda keepers at the zoo to feel more comfortable and ___57___ (confidence) speaking English. And who do they speak English ___58___?\n\nNot the pandas, even though ___59___ language used for the medical training instructions is actually English. They talk to the flood of international tourists and to ___60___ (visit) Chinese zookeepers who often come to check on the pandas, which are on loan from China. They also need to be ready to give ___61___ (interview) in English with international journalists. This is ___62___ they need an English trainer.\n\nSo, what are they learning? ___63___ (basic), how to describe a panda's life. It's been an honor to watch the panda programme develop ___64___ to see the pandas settle into their new home. As a little girl, I ___65___ (wish) to be a zookeeper when I grew up. Now, I'm living out that dream indirectly by helping the panda keepers do their job in English.",
      "blank_count": 10,
      "questions": [
        {
          "no": 56,
          "answer": "arrival",
          "explanation": "考查名词。句意：从2017年6月开始，就在两只新大熊猫\"萌萌\"和\"娇青\"到来之前，我一直在帮助动物园的熊猫饲养员更舒服、更自信地说英语。分析句子结构可知，空前是冠词，空后是介词，所以空处应填名词作介词before的宾语，arrive的名词形式是arrival，不可数名词。故填arrival。",
          "grammar_point": "名词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-noun",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 57,
          "answer": "confident",
          "explanation": "考查形容词。句意：从2017年6月开始，就在两只新大熊猫\"萌萌\"和\"娇青\"到来之前，我一直在帮助动物园的熊猫饲养员更舒服、更自信地说英语。分析句子结构可知，空处和前文的comfortable并列，作并列表语，应用形容词形式，confidence的形容词形式是confident。故填confident。",
          "grammar_point": "形容词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-adj",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 58,
          "answer": "with",
          "explanation": "考查介词。句意：他们和谁说英语？分析句子结构可知，这道题的语序可以看成they speak English [ ]{.underline} who，句子中有主语they，speak后有宾语，而who缺少一个介词，who做介词的宾语，又根据句意可推知，此处强调\"与某人交流\"，应用固定搭配：speak with sb.。故填with。",
          "grammar_point": "介词",
          "category": "preposition",
          "category_name": "介词",
          "fine_category": "prep-common",
          "facets": {
            "word": "with"
          }
        },
        {
          "no": 59,
          "answer": "the",
          "explanation": "考查冠词。句意：不是熊猫，尽管医学训练指导使用的语言实际上是英语。分析句子结构可知，此处特指用于医学训练指导使用的语言，表特指，应用定冠词修饰。故填the。",
          "grammar_point": "冠词",
          "category": "article",
          "category_name": "冠词",
          "fine_category": "art-the",
          "facets": {
            "word": "the"
          }
        },
        {
          "no": 60,
          "answer": "visiting",
          "explanation": "考查形容词。句意：他们与蜂拥而至的国际游客和来访的中国动物园管理员交谈，这些管理员经常来检查从中国租借来的大熊猫。分析句子结构可知，空后是名词，所以空处应填形容词作定语；visit对应的形容词为visiting\"来访的\"。故填visiting。",
          "grammar_point": "形容词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-adj",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 61,
          "answer": "interviews",
          "explanation": "考查名词的数。句意：他们还需要准备好用英语接受国际记者的采访。分析句子结构可知，空前是动词，所以空处应填名词作宾语，interview意为\"采访\"为可数名词，不止一段采访，应用复数形式。故填interviews。",
          "grammar_point": "名词的数",
          "category": "number",
          "category_name": "名词/数词",
          "fine_category": "num-plural",
          "facets": {
            "type": "plural"
          }
        },
        {
          "no": 62,
          "answer": "why",
          "explanation": "考查表语从句。句意：这就是他们需要英语培训师的原因。分析句子结构可知，空处引导表语从句，从句中结构完整，应该用连接副词连接，前文提到需要培训师的原因，此处是表达\"这就是他们需要英语培训师的原因\"之意，应用why引导表语从句。故填why。",
          "grammar_point": "表语从句",
          "category": "nounclause",
          "category_name": "名词性从句",
          "fine_category": "nounc-wh-adverb",
          "facets": {
            "type": "wh-adverb",
            "word": "why"
          }
        },
        {
          "no": 63,
          "answer": "Basically",
          "explanation": "考查副词。句意：基本上，如何描述熊猫的生活。分析句子结构可知，空处修饰空后整个句子，应该用副词修饰，basic的副词形式是basically位于句首，首字母应大写。故填Basically。",
          "grammar_point": "副词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-adv",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 64,
          "answer": "and",
          "explanation": "考查连词。句意：我很荣幸能看到熊猫项目的发展，看到熊猫们在新家安顿下来。分析句子结构可知，\"to watch the panda programme develop\"和\"to see the pandas settle into their new home\"两者是并列关系，应该用and连接。故填and。",
          "grammar_point": "连词",
          "category": "logic",
          "category_name": "逻辑连词",
          "fine_category": "logic-coordinating",
          "facets": {
            "word": "and",
            "kind": "coordinating"
          }
        },
        {
          "no": 65,
          "answer": "wished",
          "explanation": "考查动词时态。句意：作为一个小女孩，我希望长大后成为一名动物园管理员。分析句子结构可知，本句缺少谓语动词，所以wish作本句谓语，和主语I之间是主动关系，根据后文的grew可知用一般过去时。故填wished。",
          "grammar_point": "动词时态",
          "category": "predicate",
          "category_name": "谓语动词",
          "fine_category": "pred-tense-past-future"
        }
      ],
      "chinese_translation": "每当我在柏林动物园教英语时，几乎总会收获一个充满疑问的眼神。对方心里一定在琢磨：我到底在教谁……动物吗？\n\n自2017年6月起，就在两只新大熊猫\"梦梦\"和\"娇庆\"抵达之前，我一直在帮助动物园的熊猫饲养员们更自如、更自信地使用英语交流。那么他们究竟在和谁说英语呢？\n\n虽然医疗训练指令确实使用英语，但他们的对话对象并非熊猫。他们需要与络绎不绝的国际游客交流，还要接待定期前来探视这些从中国租借而来的熊猫的中方饲养员。此外，他们还需随时准备用英语接受国际媒体的采访。正因如此，他们才需要一位英语培训师。\n\n那么他们具体在学什么呢？简单来说，就是如何描述大熊猫的生活。能够见证熊猫保护项目的发展，看着这些熊猫逐渐适应新家园，我深感荣幸。小时候我曾梦想长大后当一名动物园管理员，如今通过帮助饲养员用英语完成工作，我正以间接的方式实现着那个童年愿望。"
    },
    {
      "exam_id": "2023浙江首考",
      "year": 2023,
      "type": "真题",
      "question_id": "56-65",
      "passage": "During China's dynastic period, emperors planned the city of Beijing ___56___ arranged the residential areas according to social classes. The term \"hutong\", ___57___ (original) meaning \"water well\" in Mongolian, appeared first during the Yuan Dynasty.\n\nIn the Ming Dynasty, the center was the Forbidden City, ___58___ (surround) in concentric (同心的) circles by the Inner City and Outer City. Citizens of higher social classes ___59___ (permit) to live closer to the center of the circles. The large siheyuan of these high-ranking officials and wealthy businessmen often ___60___ (feature) beautifully carved and painted roof beams and pillars (柱子). The hutongs they formed were orderly, lined by ___61___ (space) homes and walled gardens. Farther from the center lived the commoners and laborers. Their siheyuan were far smaller in scale and ___62___ (simple) in design and decoration, and the hutongs were narrower.\n\nHutongs represent an important cultural element of the city of Beijing. Thanks to Beijing's long history ___63___ capital of China, almost every hutong has its stories, and some are even associated with historic ___64___ (event). In contrast to the court life and upper-class culture represented by the Forbidden City, the Summer Palace, and the Temple of Heaven, the hutongs reflect ___65___ culture of grassroots Beijingers.",
      "blank_count": 10,
      "questions": [
        {
          "no": 56,
          "answer": "and",
          "explanation": "考查并列连词。空格连接 planned the city of Beijing 和 arranged the residential areas 两个并列谓语动作，表示顺承关系，应用 and。",
          "grammar_point": "连词",
          "category": "logic",
          "category_name": "逻辑连词",
          "fine_category": "logic-coordinating",
          "facets": {
            "word": "and",
            "kind": "coordinating"
          }
        },
        {
          "no": 57,
          "answer": "originally",
          "explanation": "考查副词。originally 修饰 meaning，表示“最初意为”，应用副词形式 originally。",
          "grammar_point": "副词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-adv",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 58,
          "answer": "surrounded",
          "explanation": "考查非谓语动词。Forbidden City 与 surround 构成逻辑上的动宾关系，空格作后置定语，应用过去分词 surrounded。",
          "grammar_point": "非谓语动词",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-done",
          "nonp_function": "adverbial",
          "nonp_function_label": "作状语",
          "nonp_form": "done",
          "nonp_form_label": "done",
          "nonp_rule": "主句已有谓语，the Forbidden City 与 surround 是动宾关系，用 done 表被环绕的状态。",
          "nonp_needs_review": false,
          "facets": {
            "form": "done"
          }
        },
        {
          "no": 59,
          "answer": "were permitted",
          "explanation": "考查谓语动词。主语 Citizens 与 permit 为被动关系，结合历史叙述语境用一般过去时被动语态 were permitted。",
          "grammar_point": "谓语动词",
          "category": "predicate",
          "category_name": "谓语动词",
          "fine_category": "pred-passive-form"
        },
        {
          "no": 60,
          "answer": "featured",
          "explanation": "考查谓语动词。句中缺少谓语，主语 The large siheyuan of these high-ranking officials and wealthy businessmen 与 feature 是主动关系；结合上文 dynastic period、Ming Dynasty 等历史语境，用一般过去时 featured。",
          "grammar_point": "谓语动词",
          "category": "predicate",
          "category_name": "谓语动词",
          "fine_category": "pred-tense-past-future"
        },
        {
          "no": 61,
          "answer": "spacious",
          "explanation": "考查形容词。空格修饰 homes，space 变为形容词 spacious，表示“宽敞的”。",
          "grammar_point": "形容词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-adj",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 62,
          "answer": "simpler",
          "explanation": "考查形容词比较级。空格与 far smaller 并列，比较普通百姓住宅与高阶层住宅的设计装饰，应用 simpler 或 more simple。",
          "grammar_point": "形容词比较级",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-comparative",
          "facets": {
            "subtype": "comparative"
          }
        },
        {
          "no": 63,
          "answer": "as",
          "explanation": "考查介词。history as capital of China 表示“作为中国首都的历史”，应用介词 as。",
          "grammar_point": "介词",
          "category": "preposition",
          "category_name": "介词",
          "fine_category": "prep-common",
          "facets": {
            "word": "as"
          }
        },
        {
          "no": 64,
          "answer": "events",
          "explanation": "考查名词复数。event 为可数名词，前有 historic 修饰且语境表示多个历史事件，应用复数 events。",
          "grammar_point": "名词复数",
          "category": "number",
          "category_name": "名词/数词",
          "fine_category": "num-plural",
          "facets": {
            "type": "plural"
          }
        },
        {
          "no": 65,
          "answer": "the",
          "explanation": "考查定冠词。culture 后有 of grassroots Beijingers 限定，表示特定文化，应用 the。",
          "grammar_point": "冠词",
          "category": "article",
          "category_name": "冠词",
          "fine_category": "art-the",
          "facets": {
            "word": "the"
          }
        }
      ],
      "chinese_translation": "在中国王朝时期，皇帝规划了北京城，并根据社会阶层划分居住区域。\"胡同\"一词最初在蒙古语中意为\"水井\"，最早出现于元朝。\n\n明朝时期，城市中心是紫禁城，内城和外城呈同心圆状环绕其外。社会地位较高的市民被允许居住在更靠近圆心的区域。高官富商们的大型四合院通常以雕刻精美、彩绘绚丽的房梁和柱子为特色。由这些宅院形成的胡同排列整齐，两侧是宽敞的住宅和带围墙的花园。远离中心区域居住的是平民和劳工，他们的四合院规模小得多，设计和装饰也更为简朴，胡同则更为狭窄。\n\n胡同是北京城重要的文化元素。得益于北京作为中国首都的悠久历史，几乎每条胡同都有其故事，有些甚至与历史事件相关联。与紫禁城、颐和园和天坛所代表的宫廷生活和上层文化形成对比，胡同反映了北京平民百姓的文化。"
    },
    {
      "exam_id": "2024全国一卷",
      "year": 2024,
      "type": "真题",
      "question_id": "56-65",
      "passage": "Heatherwick Studio recently built a greenhouse at the edge of the National Trust's Woolbeding Gardens. This beautiful structure, named Glasshouse, is at the centre of a new garden that shows how the Silk Road influences English gardens even in modern times.\n\nThe latest ___56___ (engineer) techniques are applied to create this protective ___57___ (function) structure that is also beautiful. The design features ten steel “sepals (萼片)” made of glass and aluminium (铝). These sepals open on warm days ___58___ (give) the inside plants sunshine and fresh air. In cold weather, the structure stays ___59___ (close) to protect the plants.\n\nFurther, the Silk Route Garden around the greenhouse ___60___ (walk) visitors through a journey influenced by the ancient Silk Road, by which silk as well as many plant species came to Britain for ___61___ first time. These plants included modern Western ___62___ (favourite) such as rosemary, lavender and fennel. The garden also contains a winding path that guides visitors through the twelve regions of the Silk Road. The path offers over 300 plant species for visitors to see, too.\n\nThe Glasshouse stands ___63___ a great achievement in contemporary design, to house the plants of the southwestern part of China at the end of a path retracing (追溯) the steps along the Silk Route ___64___ brought the plants from their native habitat in Asia to come to define much of the ___65___ (rich) of gardening in England.",
      "blank_count": 10,
      "questions": [
        {
          "no": 56,
          "answer": "engineering",
          "explanation": "词性转换。括号内 engineer 是名词/动词，空处修饰名词 techniques 作定语，应用其名词形式 engineering（动名词的名词用法，意为“工程/工程技术”），故填 engineering。",
          "grammar_point": "词性转换",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-noun",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 57,
          "answer": "functional",
          "explanation": "形容词。空处与protective并列，修饰空后的名词structure，应用形容词形式，故填functional“实用的”。句意：最新的工程技术被应用于创建这种兼具保护性和功能性且还美观的结构。",
          "grammar_point": "形容词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-adj",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 58,
          "answer": "to give",
          "explanation": "非谓语动词。空处所在句的谓语动词是open，空处应用非谓语动词。根据语境可知此处表示目的，故填不定式to give。句意：在温暖的日子里，这些萼片会打开以给内部植物（提供）阳光和新鲜空气。",
          "grammar_point": "非谓语动词",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-to-do",
          "nonp_function": "adverbial",
          "nonp_function_label": "作状语",
          "nonp_form": "to_do",
          "nonp_form_label": "to do",
          "nonp_rule": "主句已有谓语 open，to give 表目的，说明萼片打开是为了提供阳光和空气。",
          "nonp_needs_review": false,
          "facets": {
            "form": "to-do"
          }
        },
        {
          "no": 59,
          "answer": "closed",
          "explanation": "形容词。空前的stays作系动词，表示“保持”，空处作表语，表示“关闭的”，故应用形容词closed。",
          "grammar_point": "形容词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-adj",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 60,
          "answer": "walks",
          "explanation": "动词的时态、语态和主谓一致。分析句子结构可知，空处在句中作谓语。本句描述了the Silk Route Garden的客观情况，时态用一般现在时；此处时态也可以根据下文中的“contains... guides... offers”判断；walk在此作动词，表示“（循序渐进地）教，逐步引导”，与主语the Silk Route Garden之间为主动关系；主语表示第三人称单数。所以填walks。",
          "grammar_point": "动词的时态",
          "category": "predicate",
          "category_name": "谓语动词",
          "fine_category": "pred-sva-form"
        },
        {
          "no": 61,
          "answer": "the",
          "explanation": "冠词。此处考查固定表达for the first time，意为“第一次”，所以填the。",
          "grammar_point": "固定表达for the first ti",
          "category": "article",
          "category_name": "冠词",
          "fine_category": "art-the",
          "facets": {
            "word": "the"
          }
        },
        {
          "no": 62,
          "answer": "favourites",
          "explanation": "名词复数。分析句子结构可知，空处作动词included的宾语，前面的modern Western为定语，所以此处应填名词；根据空后的举例“such as rosemary, lavender and fennel”可知，空处表示复数概念。故填favourites。favourite在此处为可数名词，表示“特别喜爱的事物”。",
          "grammar_point": "名词复数",
          "category": "number",
          "category_name": "名词/数词",
          "fine_category": "num-plural",
          "facets": {
            "type": "plural"
          }
        },
        {
          "no": 63,
          "answer": "as",
          "explanation": "介词。结合语境“该玻璃温室作为当代设计的伟大成就而存在”可知，空处需要填as。",
          "grammar_point": "介词",
          "category": "preposition",
          "category_name": "介词",
          "fine_category": "prep-common",
          "facets": {
            "word": "as"
          }
        },
        {
          "no": 64,
          "answer": "that",
          "explanation": "定语从句。分析句子结构可知，空处引导定语从句，先行词为表示物的名词短语the Silk Route，关系词在从句中作主语，所以填that/which。",
          "grammar_point": "定语从句",
          "category": "attrib",
          "category_name": "定语从句",
          "fine_category": "attrib-pronoun",
          "facets": {
            "type": "relative-pronoun",
            "word": "that",
            "restrictive": true
          }
        },
        {
          "no": 65,
          "answer": "richness",
          "explanation": "名词。空处跟在定冠词the之后，且空后的of gardening对空处进行限定，因此应填名词richness。",
          "grammar_point": "名词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-noun",
          "facets": {
            "subtype": "derivation"
          }
        }
      ],
      "chinese_translation": "赫斯维克工作室最近在英国国民信托的伍尔贝丁花园边缘建造了一座温室。这座名为\"玻璃屋\"的优美建筑坐落于一座新花园的中心，展现了丝绸之路即使在现代依然影响着英式园林。\n\n最新工程技术被应用于打造这座兼具防护功能与美感的建筑。其设计特色是十个由玻璃和铝制成的钢制\"萼片\"。在温暖的日子里，这些萼片会张开，让内部植物沐浴阳光和新鲜空气；寒冷天气时，结构则保持闭合以保护植物。\n\n此外，温室周围的\"丝绸之路花园\"带领游客踏上一段受古代丝绸之路启发的旅程——正是通过这条路线，丝绸以及众多植物物种首次传入英国。这些植物包括迷迭香、薰衣草和茴香等现代西方人喜爱的品种。花园中还设有一条蜿蜒小径，引导游客穿越丝绸之路的十二个区域，沿途可观赏300多种植物。\n\n这座玻璃屋堪称当代设计的杰出成就，它位于一条追溯丝绸之路足迹的小径尽头，专门培育中国西南部的植物——正是沿着这条路线，这些植物从亚洲原生地来到英国，最终定义了英式园艺的丰富内涵。"
    },
    {
      "exam_id": "2024全国二卷",
      "year": 2024,
      "type": "真题",
      "question_id": "56-65",
      "passage": "Chinese cultural elements commemorating (纪念) Tang Xianzu, ___36___ is known as \"the Shakespeare of Asia,\" add an international character to Stratford-upon-Avon, William Shakespeare's hometown.\n\nTang and Shakespeare were contemporaries and both died in 1616. Although they could never have met, there are common ___37___ (theme)in their works, said Paul Edmondson, head of research for the Shakespeare Birthplace Trust. \"Some of the things that Tang was writing about ___38___ (be)also Shakespeare's concerns. I happen to know that Tang's play The Peony Pavilion (《牡丹亭》) is similar in some ways ___39___ Romeo and Juliet.\"\n\nA statue commemorating Shakespeare and Tang was put up at Shakespeare's Birthplace Garden in 2017. Two years later, a six-meter-tall pavilion, ___40___ (inspire)by The Peony Pavilion, ___41___ (build)at the Firs Garden, just ten minutes' walk from Shakespeare's birthplace.\n\nThose cultural elements have increased Stratford's international ___42___ (visible), said Edmondson, adding that visitors walking through the Birthplace Garden were often amazed ___43___ (find)the connection between the two great writers.\n\n___44___ (recall)watching a Chinese opera version of Shakespeare's play Richard III in Shanghai and meeting Chinese actors who came to Stratford a few years ago to perform parts of The Peony Pavilion, Edmondson said, \"It was very exciting to hear the Chinese language ___45___ see how Tang's play was being performed.\"\n\n为纪念素有\"东方莎士比亚\"之称的汤显祖,一座凉亭在莎士比亚的故乡建立,此举提高了莎士比亚故乡的国际知名度。来此地的游客惊奇地发现东西方的这两位伟大作家的作品有一些共性。\n\n36.",
      "blank_count": 10,
      "questions": [
        {
          "no": 36,
          "answer": "who",
          "explanation": "定语从句。先行词是Tang Xianzu,从句中缺少主语,且空前有逗号,故应用who引导非限制性定语从句。",
          "grammar_point": "定语从句",
          "category": "attrib",
          "category_name": "定语从句",
          "fine_category": "attrib-pronoun",
          "facets": {
            "type": "relative-pronoun",
            "word": "who",
            "restrictive": false
          }
        },
        {
          "no": 37,
          "answer": "themes",
          "explanation": "名词复数。根据\"there are\"可知,此处应用名词复数themes。句意:虽然他们可能从未见过面,但是他们的作品中有共同的主题。",
          "grammar_point": "名词复数",
          "category": "number",
          "category_name": "名词/数词",
          "fine_category": "num-plural",
          "facets": {
            "type": "plural"
          }
        },
        {
          "no": 38,
          "answer": "were",
          "explanation": "动词的时态和主谓一致。主语是Some of the things,且此处描述过去的事,故填were。句意:汤显祖所写的一些内容也是莎士比亚所关心的事。",
          "grammar_point": "动词的时态",
          "category": "predicate",
          "category_name": "谓语动词",
          "fine_category": "pred-sva-form"
        },
        {
          "no": 39,
          "answer": "to",
          "explanation": "介词。be similar to是固定短语,意为\"与......相似\"。句意:我恰好发现汤显祖的戏剧《牡丹亭》和《罗密欧与朱丽叶》在一些方面相似。",
          "grammar_point": "介词",
          "category": "preposition",
          "category_name": "介词",
          "fine_category": "prep-other",
          "facets": {
            "word": "to"
          }
        },
        {
          "no": 40,
          "answer": "inspired",
          "explanation": "过去分词。根据句意并分析句子结构可知,此空应用非谓语动词; inspire与a six-meter-tall pavilion之间为动宾关系,应用过去分词作定语,故填inspired。句意:两年后,受《牡丹亭》的启发,一座六米高的凉亭被建在离莎士比亚出生地仅有十分钟的步行路程的杉园。",
          "grammar_point": "非谓语动词",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-done",
          "nonp_function": "adverbial",
          "nonp_function_label": "作状语",
          "nonp_form": "done",
          "nonp_form_label": "done",
          "nonp_rule": "主句已有谓语，a pavilion 与 inspire 是动宾关系，用 done 作原因状语。",
          "nonp_needs_review": false,
          "facets": {
            "form": "done"
          }
        },
        {
          "no": 41,
          "answer": "was built",
          "explanation": "动词的时态和语态。空处在句中作谓语,主语是a six-meter-tall pavilion,与build之间是被动关系,此处描述过去的事,应用一般过去时的被动语态。故填was built。",
          "grammar_point": "时态和语态",
          "category": "predicate",
          "category_name": "谓语动词",
          "fine_category": "pred-passive-form"
        },
        {
          "no": 42,
          "answer": "visibility",
          "explanation": "名词。international是形容词,应修饰名词。visible的名词形式为visibility,表示\"知名度\"。此处表示这些文化元素提高了斯特拉特福的国际知名度。",
          "grammar_point": "名词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-noun",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 43,
          "answer": "to find",
          "explanation": "动词不定式。be amazed to do sth.是固定搭配,意为\"对做某事感到惊讶\"。此处表示游客惊讶地发现这两位伟大的作家之间的联系。",
          "grammar_point": "",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-to-do",
          "nonp_function": "object",
          "nonp_function_label": "作宾语",
          "nonp_form": "to_do",
          "nonp_form_label": "to do",
          "nonp_rule": "be amazed 后接 to do，说明“惊讶地发现”，不定式作形容词补足成分。",
          "nonp_needs_review": false,
          "facets": {
            "form": "to-do"
          }
        },
        {
          "no": 44,
          "answer": "Recalling",
          "explanation": "现在分词。此句已有谓语动词said, recall与主语Edmondson之间是主谓关系,应用现在分词作状语,故填Recalling。句意:Edmondson回忆起在上海观看莎士比亚的戏剧《理查三世》的中文版,以及见到几年前来到斯特拉特福表演《牡丹亭》片段的中国演员,他说:\"听到中文以及看到汤显祖的戏剧如何被表演是非常令人兴奋的。\"",
          "grammar_point": "",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-doing",
          "nonp_function": "adverbial",
          "nonp_function_label": "作状语",
          "nonp_form": "doing",
          "nonp_form_label": "doing",
          "nonp_rule": "句中已有谓语 said，Edmondson 与 recall 是主谓关系，用 doing 作伴随状语。",
          "nonp_needs_review": false,
          "facets": {
            "form": "doing"
          }
        },
        {
          "no": 45,
          "answer": "and",
          "explanation": "连词。hear the Chinese language和see how Tang's play was being performed是并列关系,故此处应用and连接两个不定式短语,and后承前省略不定式符号to。 ---",
          "grammar_point": "连词",
          "category": "logic",
          "category_name": "逻辑连词",
          "fine_category": "logic-coordinating",
          "facets": {
            "word": "and",
            "kind": "coordinating"
          }
        }
      ],
      "chinese_translation": "纪念被誉为\"东方莎士比亚\"的汤显祖的中国文化元素，为威廉·莎士比亚的故乡斯特拉特福增添了国际色彩。\n\n汤显祖与莎士比亚是同时代人，均于1616年去世。莎士比亚出生地信托基金会研究主管保罗·埃德蒙森表示，尽管他们从未谋面，但两人的作品有着共同的主题。\"汤显祖所写的一些内容也是莎士比亚所关注的。我碰巧知道汤显祖的戏剧《牡丹亭》在某些方面与《罗密欧与朱丽叶》相似。\"\n\n2017年，一座纪念莎士比亚和汤显祖的雕像在莎士比亚出生地花园落成。两年后，一座受《牡丹亭》启发的六米高凉亭在距离莎士比亚出生地仅十分钟步行路程的弗斯花园建成。\n\n埃德蒙森表示，这些文化元素提升了斯特拉特福的国际知名度。他补充说，游客们穿过出生地花园时，常常惊讶地发现这两位伟大作家之间的联系。\n\n回忆起在上海观看中国戏曲版莎士比亚戏剧《理查三世》，以及几年前见到前来斯特拉特福演出《牡丹亭》片段的中国演员，埃德蒙森说：\"听到中文，看到汤显祖的戏剧如何被演绎，真是令人激动。\""
    },
    {
      "exam_id": "2024广州一模",
      "year": 2024,
      "type": "模拟卷",
      "question_id": "56-65",
      "passage": "A skywell, or “tian jing” in Chinese, is a typical feature of a traditional home in Southern and Eastern China. They are commonly seen in homes ___36___ (date) to the Ming and Qing dynasties, which ___37___ (design) to house different generations of relatives. Despite their varied sizes and designs, these skywells are typically square and located in ___38___ heart of the house. They serve to allow in light, enhance airflow, and harvest rainwater.\n\nSince decades ago, the government ___39___ (advocate) green buildings, promoting environmentally-friendly practice. The increased interest towards traditional Chinese architecture is leading to the restoration of historic buildings with skywells ___40___ modern use. Architects are also looking towards the principles behind skywells while designing new buildings ___41___ (save) energy. The Dongguan TBA Tower in Guangdong Province, for example, brings natural airflows into every floor with internal “windpipes”___42___ function in a similar way to skywells. The aim is to keep the building's temperature ___43___ (comfort) in all seasons, using only natural airflow.\n\nThe fact that skywells still exist today shows ___44___ clever ancient builders were in using nature's elements to create energy-sufficient and sustainable living spaces. These timeless architectural ___45___ (wonder) continue to inspire architects in their efforts to find green solutions for cooling homes and buildings.",
      "blank_count": 10,
      "questions": [
        {
          "no": 36,
          "answer": "dating",
          "explanation": "考查非谓语动词。句意：它们在明清时期的房屋中很常见，这些房屋是为不同世代的亲戚设计的。分析句子结构可知date与逻辑主语homes构成主动关系，故用现在分词作定语。故填dating。",
          "grammar_point": "非谓语动词",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-doing",
          "nonp_function": "attribute",
          "nonp_function_label": "作定语",
          "nonp_form": "doing",
          "nonp_form_label": "doing",
          "nonp_rule": "dating 修饰 homes，homes 与 date from 是主谓关系，用 doing 作后置定语。",
          "nonp_needs_review": false,
          "facets": {
            "form": "doing"
          }
        },
        {
          "no": 37,
          "answer": "were designed",
          "explanation": "考查时态语态。句意：它们在明清时期房屋中很常见，这些房屋是为不同世代的亲戚设计的。此处非限制性定语从句修饰先行词homes，在从句作主语，与谓语构成被动关系，根据上文the Ming and Qing dynasties可知为一般过去时的被动语态，谓语用复数。故填were designed。",
          "grammar_point": "时态语态",
          "category": "predicate",
          "category_name": "谓语动词",
          "fine_category": "pred-passive-form"
        },
        {
          "no": 38,
          "answer": "the",
          "explanation": "考查冠词。句意：尽管它们的大小和设计各不相同，但这些天井通常是方形的，位于房屋的中心。此处heart特指房屋的中心，前面应用定冠词。故填the。",
          "grammar_point": "冠词",
          "category": "article",
          "category_name": "冠词",
          "fine_category": "art-the",
          "facets": {
            "word": "the"
          }
        },
        {
          "no": 39,
          "answer": "has been advocating",
          "explanation": "考查时态。句意：从几十年前开始，政府就一直提倡绿色建筑，提倡环保的做法。根据上文Since decades ago可知应用现在完成时或现在完成进行时，主语为the government，助动词用has。故填has been advocating/has advocated。",
          "grammar_point": "时态",
          "category": "predicate",
          "category_name": "谓语动词",
          "fine_category": "pred-tense-perfect"
        },
        {
          "no": 40,
          "answer": "for",
          "explanation": "考查介词。句意：人们对中国传统建筑的兴趣日益浓厚，这导致了对带有天井的历史建筑进行修复，以供现代使用。短语for/in modern use表示“供……使用”。故填for/in。",
          "grammar_point": "介词",
          "category": "preposition",
          "category_name": "介词",
          "fine_category": "prep-common",
          "facets": {
            "word": "for"
          }
        },
        {
          "no": 41,
          "answer": "to save",
          "explanation": "考查非谓语动词。句意：建筑师们在设计新建筑时也在关注天井背后的原则，以节省能源。分析句子结构可知save在句中作目的状语，应用不定式。故填to save。",
          "grammar_point": "非谓语动词",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-to-do",
          "nonp_function": "adverbial",
          "nonp_function_label": "作状语",
          "nonp_form": "to_do",
          "nonp_form_label": "to do",
          "nonp_rule": "主句已有谓语 are looking，to save 表目的，说明关注天井原则的目的。",
          "nonp_needs_review": false,
          "facets": {
            "form": "to-do"
          }
        },
        {
          "no": 42,
          "answer": "which",
          "explanation": "考查定语从句。句意：例如，广东省东莞TBA大厦通过内部“气管”将自然气流引入每层，其功能与天井类似。定语从句修饰先行词windpipes，关系词在从句作主语，指物，故填which/that。",
          "grammar_point": "定语从句",
          "category": "attrib",
          "category_name": "定语从句",
          "fine_category": "attrib-pronoun",
          "facets": {
            "type": "relative-pronoun",
            "word": "which",
            "restrictive": true
          }
        },
        {
          "no": 43,
          "answer": "comfortable",
          "explanation": "考查形容词。句意：其目的是在所有季节保持建筑的温度舒适，只使用自然气流。此处作宾补，表示“舒适的”应用形容词comfortable。故填comfortable。",
          "grammar_point": "形容词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-adj",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 44,
          "answer": "how",
          "explanation": "考查宾语从句。句意：事实上，今天仍然存在的天井表明，古代的建筑者是多么聪明，他们利用自然的元素来创造能源充足和可持续的生活空间。引导宾语从句，表示“多么聪明”应用how。故填how。",
          "grammar_point": "宾语从句",
          "category": "nounclause",
          "category_name": "名词性从句",
          "fine_category": "nounc-wh-adverb",
          "facets": {
            "type": "wh-adverb",
            "word": "how"
          }
        },
        {
          "no": 45,
          "answer": "wonders",
          "explanation": "考查名词的数。句意：这些永恒的建筑奇迹继续激励着建筑师们努力寻找绿色解决方案来为房屋和建筑物降温。根据上文these可知wonder应用复数形式。故填wonders。",
          "grammar_point": "名词的数",
          "category": "number",
          "category_name": "名词/数词",
          "fine_category": "num-plural",
          "facets": {
            "type": "plural"
          }
        }
      ],
      "chinese_translation": "天井是中国南方和东方传统民居的典型特征。常见于明清时期的住宅中，这些房屋的设计旨在容纳不同代际的亲属。尽管尺寸和设计各异，天井通常呈方形，位于房屋的核心位置。它们的作用是引入光线、增强通风并收集雨水。\n\n数十年来，政府一直倡导绿色建筑，推广环保实践。对中国传统建筑日益增长的兴趣，促使带有天井的历史建筑被修复并用于现代用途。建筑师在设计新建筑时，也在借鉴天井背后的原理来节约能源。例如，广东东莞的TBA大厦通过内部\"风管\"将自然气流引入每一层，其运作方式与天井相似。目标是在仅利用自然气流的情况下，使建筑全年保持舒适的温度。\n\n天井至今依然存在，这充分展现了古代工匠在利用自然元素创造能源自足、可持续居住空间方面的智慧。这些跨越时空的建筑杰作，持续启发着建筑师们寻找冷却房屋和建筑的绿色解决方案。"
    },
    {
      "exam_id": "2024广州二模",
      "year": 2024,
      "type": "模拟卷",
      "question_id": "56-65",
      "passage": "Over a decade ago, Wu Kai, an enthusiast of ancient pagodas (塔), was looking for a book ___36___ comprehensively detailed the total number and locations of pagodas with quality introductions and images.\n\n“I read extensively but found the books available had limited information and few good pictures,” he explains. Dissatisfied with the ___37___ (exist) options, Wu decided to create his own. Despite an estimated 10,000 ancient pagodas nationwide, many remain unaccounted for due to___38___ (they) remote locations and poor conditions.\n\nVisiting hilltop or cliff-top pagodas, or those hidden in deep forests, ___39___ (require) great determination, physical strength and even luck, ___40___ few people get to see them in person. For those who do, there’s the added challenge of taking good pictures, especially those suitable___41___ print.\n\n___42___ (fortunate), Wu’s plan was applauded by like-minded enthusiasts, who generously contributed great ___43___ (photo). In 2019, Wu published a 500-page book introducing over 300 ancient pagodas in Beijing. He then continued to work with Wang Xuebin, one of the enthusiasts. In 2023, their weighty 960-page book ___44___ (release), entitled The l,001 Chinese Ancient Pagodas You Must See Before You Die.\n\n“In each pagoda, I see the beauty of our heritage and the ___45___ (lose) values of simplicity, perfection, and respect for nature in modern life,” Wu writes in the introduction. “Across the vast land of China, no two pagodas are completely identical.”",
      "blank_count": 10,
      "questions": [
        {
          "no": 36,
          "answer": "which",
          "explanation": "考查定语从句。句意：十多年前，古塔爱好者吴锴正在寻找一本书，这本书用优质的介绍和图像全面详细地介绍古塔的总数和位置。空处引导一个定语从句，先行词为指物的a book，且空处在从句中作主语，所以应用which或that引导。故填which/that。",
          "grammar_point": "定语从句",
          "category": "attrib",
          "category_name": "定语从句",
          "fine_category": "attrib-pronoun",
          "facets": {
            "type": "relative-pronoun",
            "word": "which",
            "restrictive": true
          }
        },
        {
          "no": 37,
          "answer": "existing",
          "explanation": "考查形容词。句意：吴对现有的书籍选择感到不满意，决定创造自己的书。空处作定语修饰options，应用形容词。existing意为“现存的”，和existent(现有的)意思一致。故填existing/existent。",
          "grammar_point": "形容词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-adj",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 38,
          "answer": "their",
          "explanation": "考查代词。句意：尽管全国估计有10000座古塔，但由于位置偏远和条件恶劣，许多古塔仍下落不明。空处作定语修饰其后的remote locations and poor conditions，应用形容词性物主代词their。故填their。",
          "grammar_point": "代词",
          "category": "pronoun",
          "category_name": "代词",
          "fine_category": "pron-personal",
          "facets": {
            "type": "personal"
          }
        },
        {
          "no": 39,
          "answer": "requires",
          "explanation": "考查时态和主谓一致。句意：参观山顶或悬崖顶的宝塔，或那些隐藏在深林中的宝塔，需要极大的决心、体力甚至运气，所以很少有人能亲自看到它们。本句陈述的是客观事实，应用一般现在时。空处作句子的谓语，主语为动名词短语Visiting...，所以谓语应用单数。故填requires。",
          "grammar_point": "时态和主谓一致",
          "category": "predicate",
          "category_name": "谓语动词",
          "fine_category": "pred-sva-form"
        },
        {
          "no": 40,
          "answer": "so",
          "explanation": "考查连词。句意参考上题。“Visiting hilltop or cliff-top pagodas, or those hidden in deep forests, ___4___(require) great determination, physical strength and even luck”和“few people get to see them in person”之间是因果关系，前为因，后为果，所以应用so连接。故填so。",
          "grammar_point": "连词",
          "category": "logic",
          "category_name": "逻辑连词",
          "fine_category": "logic-coordinating",
          "facets": {
            "word": "so",
            "kind": "coordinating"
          }
        },
        {
          "no": 41,
          "answer": "for",
          "explanation": "考查介词。句意：对于那些这样做的人来说，拍摄好照片是一个额外的挑战，尤其是那些适合印刷的照片。suitable for...意为“适合……”，为固定搭配。故填for。",
          "grammar_point": "介词",
          "category": "preposition",
          "category_name": "介词",
          "fine_category": "prep-other",
          "facets": {
            "word": "for"
          }
        },
        {
          "no": 42,
          "answer": "Fortunately",
          "explanation": "考查副词。句意：幸运的是，吴的计划得到了志同道合的爱好者的赞赏，他们慷慨地贡献了很棒的照片。根据“Wu’s plan was applauded by like-minded enthusiasts, who generously contributed great ___8___(photo)”可知，吴锴的计划得到了志同道合的爱好者的赞赏，这些人给他提供了许多照片，这是一件幸事。空处修饰整个句子，应用副词fortunately，意为“幸运地”。故填Fortunately。",
          "grammar_point": "副词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-adv",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 43,
          "answer": "photos",
          "explanation": "考查名词的数。句意参考上题。photo意为“照片”，为可数名词，其前没有表示数量的限定词，应用名词复数。故填photos。",
          "grammar_point": "名词的数",
          "category": "number",
          "category_name": "名词/数词",
          "fine_category": "num-plural",
          "facets": {
            "type": "plural"
          }
        },
        {
          "no": 44,
          "answer": "was released",
          "explanation": "考查时态、语态和主谓一致。句意：2023年，他们出版了960页厚的书，书名为《有生之年一定要看的1001座中国古塔》。根据“In 2023”可知，这里表示过去发生的事情，应用一般过去时。主语their weighty 960-page book和release之间是动宾关系，应用被动语态，且be动词应用was。故填was released。",
          "grammar_point": "时态、语态和主谓一致",
          "category": "predicate",
          "category_name": "谓语动词",
          "fine_category": "pred-passive-form"
        },
        {
          "no": 45,
          "answer": "lost",
          "explanation": "考查形容词。句意：吴在引言中写道：“在每一座塔中，我都看到了我们遗产的美丽，以及现代生活中失去的简单、完美和尊重自然的价值观。”空处作定语修饰values，应用形容词。lost意为“失去的”。故填lost。",
          "grammar_point": "形容词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-adj",
          "facets": {
            "subtype": "derivation"
          }
        }
      ],
      "chinese_translation": "十多年前，古塔爱好者吴凯想找一本全面介绍古塔数量、位置，并配有优质图文的书。\n\n\"我翻阅了大量资料，但发现市面上的书籍信息有限，好图片也不多，\"他解释道。对现有选择感到不满，吴凯决定自己动手。尽管全国估计有上万座古塔，但许多因地处偏远、保存状况不佳而未被记录在册。\n\n探访山顶或悬崖之巅的古塔，或是隐匿于密林深处的塔，需要极大的决心、体力甚至运气，因此很少有人能亲眼目睹。即便有人成功抵达，拍摄出好照片——尤其是适合印刷的作品——也是一项额外挑战。\n\n幸运的是，吴凯的计划得到了志同道合爱好者的支持，他们慷慨贡献了精美的照片。2019年，吴凯出版了一本500页的书，介绍了北京300多座古塔。随后，他与其中一位爱好者王学斌继续合作。2023年，他们厚达960页的巨著《一生必看的1001座中国古塔》问世。\n\n\"每座塔中，我都能看到文化遗产之美，以及现代生活中所缺失的质朴、完美与敬畏自然的价值观，\"吴凯在序言中写道，\"在广袤的中国大地上，没有两座古塔是完全相同的。\""
    },
    {
      "exam_id": "2024浙江首考",
      "year": 2024,
      "type": "真题",
      "question_id": "56-65",
      "passage": "The shelves in most supermarkets are full of family-size this and multi-buy that. However, if you're shopping for one, buying extra ___56___ (benefit) from price reductions doesn't make sense. Either your shopping is then too heavy to carry home, ___57___ you can't use what you've bought while it's still fresh. Of course, shops are not charities—they price goods in the way ___58___ will make them the most money. If most of their customers are happy to buy larger quantities, that's ___59___ they'll promote. But that leaves the solo (单独) customers out of pocket and disappointed.\n\nMany supermarkets are no longer doing \"buy one get one free\" promotions because of the ___60___ (criticize) that they lead to waste. Consumers prefer money off individual items. However, though it's nice to get a few cents off a pack of sausages, it would help even more if they could sometimes ___61___ (offer) in smaller packs. Even the biggest sausage fan doesn't want to eat them every day.\n\nIf your supermarket sells loose produce, then buying smaller quantities is easier. Over the last two years, some supermarkets ___62___ (start) selling chicken or salad in packs ___63___ (design) with two halves containing separate portions (份). Then, when you use one section, ___64___ other stays fresh.\n\nWho knows, perhaps some of the more forward looking ___65___ (one) may yet come out with a whole range of \"just for you\" pack sizes with special offers as well.",
      "blank_count": 10,
      "questions": [
        {
          "no": 56,
          "answer": "to benefit",
          "explanation": "考查非谓语动词。buying extra 的目的或结果是 benefit from price reductions，此处用不定式作目的状语，填 to benefit。",
          "grammar_point": "非谓语动词",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-to-do",
          "nonp_function": "adverbial",
          "nonp_function_label": "作状语",
          "nonp_form": "to_do",
          "nonp_form_label": "to do",
          "nonp_rule": "buying extra 后接 to benefit from price reductions，to do 表目的。",
          "nonp_needs_review": false,
          "facets": {
            "form": "to-do"
          }
        },
        {
          "no": 57,
          "answer": "or",
          "explanation": "考查连词。Either...or... 为固定搭配，表示“要么……要么……”，应用 or。",
          "grammar_point": "连词",
          "category": "logic",
          "category_name": "逻辑连词",
          "fine_category": "logic-coordinating",
          "facets": {
            "word": "or",
            "kind": "correlative"
          }
        },
        {
          "no": 58,
          "answer": "that",
          "explanation": "考查定语从句。先行词为 the way，关系词在从句中作主语，且 way 前有 the 限定，此处用 that。",
          "grammar_point": "定语从句",
          "category": "attrib",
          "category_name": "定语从句",
          "fine_category": "attrib-pronoun",
          "facets": {
            "type": "relative-pronoun",
            "word": "that",
            "restrictive": true
          }
        },
        {
          "no": 59,
          "answer": "what",
          "explanation": "考查表语从句。空格引导表语从句，并在从句中作 promote 的宾语，表示“他们会推广的东西”，用 what。",
          "grammar_point": "名词性从句",
          "category": "nounclause",
          "category_name": "名词性从句",
          "fine_category": "nounc-wh-pronoun",
          "facets": {
            "type": "wh-pronoun",
            "word": "what"
          }
        },
        {
          "no": 60,
          "answer": "criticism",
          "explanation": "考查名词。空格前有定冠词 the，后接同位语从句 that they lead to waste，应用名词 criticism。",
          "grammar_point": "名词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-noun",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 61,
          "answer": "be offered",
          "explanation": "考查被动语态。they 指商品，与 offer 是被动关系，且位于 could 后，应用 be offered。",
          "grammar_point": "谓语动词",
          "category": "predicate",
          "category_name": "谓语动词",
          "fine_category": "pred-passive-form"
        },
        {
          "no": 62,
          "answer": "have started",
          "explanation": "考查谓语动词。时间状语 Over the last two years 常与现在完成时连用，主语 some supermarkets 为复数，填 have started。",
          "grammar_point": "谓语动词",
          "category": "predicate",
          "category_name": "谓语动词",
          "fine_category": "pred-tense-perfect"
        },
        {
          "no": 63,
          "answer": "designed",
          "explanation": "考查非谓语动词。packs 与 design 为被动关系，空格作后置定语，应用过去分词 designed。",
          "grammar_point": "非谓语动词",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-done",
          "nonp_function": "attribute",
          "nonp_function_label": "作定语",
          "nonp_form": "done",
          "nonp_form_label": "done",
          "nonp_rule": "designed 修饰 packs，packs 与 design 是动宾关系，用 done 作后置定语。",
          "nonp_needs_review": false,
          "facets": {
            "form": "done"
          }
        },
        {
          "no": 64,
          "answer": "the",
          "explanation": "考查定冠词。one section 与 the other 构成“一者……另一者……”的对应关系，应用 the。",
          "grammar_point": "冠词",
          "category": "article",
          "category_name": "冠词",
          "fine_category": "art-the",
          "facets": {
            "word": "the"
          }
        },
        {
          "no": 65,
          "answer": "ones",
          "explanation": "考查代词。one 代指前文 some supermarkets 中的个体，前有 some of the more forward looking 修饰，应用复数 ones。",
          "grammar_point": "代词",
          "category": "pronoun",
          "category_name": "代词",
          "fine_category": "pron-indefinite",
          "facets": {
            "type": "indefinite"
          }
        }
      ],
      "chinese_translation": "大多数超市的货架上摆满了家庭装和多件优惠装。然而，如果你只为自己购物，为了享受折扣而多买并不划算。要么买的东西太重拎不回家，要么还没等吃完就不新鲜了。当然，超市并非慈善机构——他们定价的方式是为了实现利润最大化。如果大多数顾客乐意购买大包装，他们就会主推这类商品。但这让独自购物的顾客多花了钱，还感到失望。\n\n许多超市已不再推行\"买一送一\"促销活动，因为批评声音认为这会导致浪费。消费者更倾向于单品直接降价。不过，虽然香肠便宜几美分是好事，但如果能推出小包装就更好了。即便是最狂热的香肠爱好者，也不想天天吃香肠。\n\n如果超市出售散装农产品，那么少量购买就更容易了。过去两年里，一些超市开始销售分成两半的独立包装的鸡肉或沙拉。这样，当你吃完一半时，另一半仍能保持新鲜。\n\n谁知道呢，也许一些更具前瞻性的超市未来会推出一系列\"专为你设计\"的包装规格，并附赠特别优惠。"
    },
    {
      "exam_id": "2024深圳一模",
      "year": 2024,
      "type": "模拟卷",
      "question_id": "56-65",
      "passage": "Despite being 75 years old, Chai Tixia’s expertise in Jianzi is truly impressive. With quick kicks, he effortlessly sends the Jianzi into the air and gracefully guides it to land___36___ (gentle) on his head.\n\n_Jianzi,___37___ game that dates back to the Han Dynasty, is surprisingly simple: players must keep the Jianzi in the air,___38___ (use) any part of their body except their hands and arms. However, to master this game___39___ (require) a lot of practice.\n\nWhile enjoyed throughout China, _Jianzi_ ___40___ (describe) by Chai as an important aspect of hutong culture. The narrow alleyways, situated within Beijing’s inner city, provide the setting for the game’s___41___ (popular). Each morning, Chai and his fellow hutong residents gather for their shared passion for _Jianzi_.\n\nChai’s spirited matches with his neighbors have a big audience ___42___ (draw) to the artistry and excitement of the game. The onlookers who watch them playing with great athleticism are amazed at ___43___ Chai and his fellow players can achieve.\n\nHaving practiced Jianzi for over 30 years, Chai cherishes the physical and social ___44___ (benefit) the game brings. Engaging in lively matches with his neighbors energizes his body, enhances his flexibility, ___45___ promotes unity within the community. Through Jianzi, Chai harvests not only health but a sense of belonging and friendship.",
      "blank_count": 10,
      "questions": [
        {
          "no": 36,
          "answer": "gently",
          "explanation": "考查副词。句意：随着快速的踢腿，他毫不费力地将毽子抛向空中，并轻柔地引导它轻轻地落在他的头上。空格处用副词修饰动词land，gentle的副词是gently，意为“轻柔地”，故填gently。",
          "grammar_point": "副词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-adv",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 37,
          "answer": "a",
          "explanation": "考查冠词。句意：毽子是一种可以追溯到汉代的游戏，非常简单：玩家必须使用身体的任何部位，除了手和手臂，将毽子保持在空中。game是可数名词，表泛指，前面要加不定冠词，game是辅音音素开头，因此不定冠词用a，故填a。",
          "grammar_point": "冠词",
          "category": "article",
          "category_name": "冠词",
          "fine_category": "art-a-an",
          "facets": {
            "word": "a-an"
          }
        },
        {
          "no": 38,
          "answer": "using",
          "explanation": "考查非谓语动词。句意：毽子是一种可以追溯到汉代的游戏，非常简单：玩家必须使用身体的任何部位，除了手和手臂，将毽子保持在空中。句中谓语是must keep，空格处用非谓语动词，players和use之间是主谓关系，因此空格处用现在分词表主动，故填using。",
          "grammar_point": "非谓语动词",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-doing",
          "nonp_function": "adverbial",
          "nonp_function_label": "作状语",
          "nonp_form": "doing",
          "nonp_form_label": "doing",
          "nonp_rule": "句中已有谓语 must keep，players 与 use 是主谓关系，用 doing 作方式状语。",
          "nonp_needs_review": false,
          "facets": {
            "form": "doing"
          }
        },
        {
          "no": 39,
          "answer": "requires",
          "explanation": "考查时态和主谓一致。句意：然而，要掌握这个游戏需要大量的练习。句子描述客观事实，时态用一般现在时，主语是不定式to master，因此空格处用第三人称单数，故填requires。",
          "grammar_point": "时态和主谓一致",
          "category": "predicate",
          "category_name": "谓语动词",
          "fine_category": "pred-sva-form"
        },
        {
          "no": 40,
          "answer": "is described",
          "explanation": "考查时态，语态和主谓一致。句意：虽然在中国各地都很受欢迎，但毽子被Chai形容为胡同文化的一个重要方面。毽子被Chai形容，且句子描述客观事实，时态是一般现在时，因此空格处是一般现在时的被动语态，主语Jianzi是不可数名词，因此空格处是is described。故填is described。",
          "grammar_point": "时态",
          "category": "predicate",
          "category_name": "谓语动词",
          "fine_category": "pred-passive-form"
        },
        {
          "no": 41,
          "answer": "popularity",
          "explanation": "考查名词。句意：位于北京内城的狭窄小巷为这项运动的流行提供了场地。game’s后跟名词作介词for的宾语，popular的名词是popularity，是不可数名词，意为“流行，普及，受欢迎”，故填popularity。",
          "grammar_point": "名词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-noun",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 42,
          "answer": "drawn",
          "explanation": "考查非谓语动词。句意：Chai和邻居们的激烈比赛吸引了大批观众，他们被这项运动的艺术性和刺激感所吸引。句中谓语是have，空格处用非谓语动词，audience和draw之间是逻辑动宾关系，因此空格处用过去分词表被动，故填drawn。",
          "grammar_point": "非谓语动词",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-done",
          "nonp_function": "adverbial",
          "nonp_function_label": "作状语",
          "nonp_form": "done",
          "nonp_form_label": "done",
          "nonp_rule": "句中已有谓语 have，audience 与 draw 是动宾关系，用 done 表被吸引的状态。",
          "nonp_needs_review": false,
          "facets": {
            "form": "done"
          }
        },
        {
          "no": 43,
          "answer": "what",
          "explanation": "考查宾语从句。句意：观看他们出色的运动能力的旁观者对Chai和他的同伴们所取得的成就感到惊讶。空格处引导的是宾语从句，从句中缺少宾语，句子表示“观看他们出色的运动能力的旁观者对Chai和他的同伴们所取得的成就感到惊讶”，因此空格处用what引导宾语从句，故填what。",
          "grammar_point": "宾语从句",
          "category": "nounclause",
          "category_name": "名词性从句",
          "fine_category": "nounc-wh-pronoun",
          "facets": {
            "type": "wh-pronoun",
            "word": "what"
          }
        },
        {
          "no": 44,
          "answer": "benefits",
          "explanation": "考查名词的复数。句意：练了30多年的毽子，Chai很珍惜这项运动给身体和社会带来的好处。benefit是可数名词，不止一个，因此空格处用复数，故填benefits。",
          "grammar_point": "名词的复数",
          "category": "number",
          "category_name": "名词/数词",
          "fine_category": "num-plural",
          "facets": {
            "type": "plural"
          }
        },
        {
          "no": 45,
          "answer": "and",
          "explanation": "考查连词。句意：与邻居进行激烈的比赛可以使他的身体充满活力，增强他的灵活性，并促进社区的团结。energizes，enhances和promotes这三个动作是并列的，句子是肯定句，因此空格处用and表并列，故填and。",
          "grammar_point": "连词",
          "category": "logic",
          "category_name": "逻辑连词",
          "fine_category": "logic-coordinating",
          "facets": {
            "word": "and",
            "kind": "coordinating"
          }
        }
      ],
      "chinese_translation": "尽管已75岁高龄，柴体霞的踢毽子技艺仍令人叹为观止。他轻快地抬脚，毽子便腾空而起，又优雅地落在他头顶。\n\n踢毽子这项可追溯至汉代的游戏，规则出奇简单：玩家需用除手和手臂外的身体部位保持毽子不落地。然而要精通此道，却需要大量练习。\n\n虽然这项运动风靡全中国，但柴体霞认为它是胡同文化的重要组成。位于北京内城的狭窄巷弄，为这项运动的盛行提供了舞台。每天清晨，柴体霞与胡同邻居们都会因对毽子的共同热爱而相聚。\n\n柴体霞与邻居们充满活力的比赛总能吸引大批观众，人们为这项运动的艺术性与激情所倾倒。围观者看着他们展现高超运动技巧，无不惊叹于柴体霞与同伴们的精湛技艺。\n\n练习毽子三十余载，柴体霞珍视这项运动带来的身心益处与社会价值。与邻居们酣畅淋漓的对战让他活力充沛、身体柔韧，更促进了社区团结。通过踢毽子，柴体霞收获的不仅是健康，更是归属感与友谊。"
    },
    {
      "exam_id": "2024深圳二模",
      "year": 2024,
      "type": "模拟卷",
      "question_id": "56-65",
      "passage": "In the center of Reykjavik, Iceland, stands a museum ___36___ (create) by Lillian Hopps, which symbolizes the friendship between Icelandic and Chinese people. A passionate admirer of Chinese heritage, Lillian began her journey to learn about China in the 1990s, a time ___37___ she deeply engaged herself in exploring China’s rich culture. Her passion transformed her home into a place filled with Chinese artifacts, which ___38___ (eventual) led to the establishment of a museum in Reykjavik.\n\nThe museum ___39___ (house) an extensive collection of cultural relics, from ancient clothing ___40___ contemporary art, displaying thousands of years of Chinese civilization. Lillian’s work goes beyond just ___41___ (exhibit) these items; she brings the culture alive through highly ___42___ (interact) activities like tea performances, calligraphy classes, and traditional medicine talks, promoting the Icelandic understanding of China’s rich traditions.\n\nLilian’s museum, attracting thousands of visitors annually from around the world, ___43___ (recognize) by the Icelandic government in 2021 for its impact. As Marta Jonsdottir, a director at Iceland’s Ministry of Foreign Affairs, put it in an interview, “Lillian, with her enthusiasm and expertise, has developed diverse cultural ___44___ (link) between Iceland and China. Her museum has not just enabled both peoples to better understand each other ___45___ strengthened our relations.”",
      "blank_count": 10,
      "questions": [
        {
          "no": 36,
          "answer": "created",
          "explanation": "考查非谓语动词。句意：在冰岛雷克雅未克市中心，矗立着一座由Lillian Hopps创建的博物馆，象征着冰岛和中国人民之间的友谊。本句的谓语是stands，所以空处应用非谓语动词。逻辑主语a museum和create之间是动宾关系，应用过去分词作后置定语。故填created。",
          "grammar_point": "非谓语动词",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-done",
          "nonp_function": "attribute",
          "nonp_function_label": "作定语",
          "nonp_form": "done",
          "nonp_form_label": "done",
          "nonp_rule": "created 修饰 a museum，museum 与 create 是动宾关系，用 done 作后置定语。",
          "nonp_needs_review": false,
          "facets": {
            "form": "done"
          }
        },
        {
          "no": 37,
          "answer": "when",
          "explanation": "考查定语从句。句意：Lillian是中国传统的狂热崇拜者，她在20世纪90年代开始了她了解中国的旅程，当时她正深入探索中国丰富的文化。空处引导一个定语从句，先行词为a time，且空处在从句中作时间状语，所以应用when引导。故填when。",
          "grammar_point": "定语从句",
          "category": "attrib",
          "category_name": "定语从句",
          "fine_category": "attrib-adverb",
          "facets": {
            "type": "relative-adverb",
            "word": "when",
            "restrictive": true
          }
        },
        {
          "no": 38,
          "answer": "eventually",
          "explanation": "考查副词。句意：她的热情使她的家变成了一个充满中国文物的地方，最终促使一个博物馆在雷克雅未克建立。空处应用副词修饰动词led，eventually意为“最后，终于”。故填eventually。",
          "grammar_point": "副词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-adv",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 39,
          "answer": "houses",
          "explanation": "考查时态和主谓一致。句意：该博物馆收藏了大量文物，从古代服装到当代艺术，展示了数千年的中华文明。空处作句子的谓语。这里陈述的是客观事实，应用一般现在时。主语The museum为单数，谓语应用单数。故填houses。",
          "grammar_point": "时态和主谓一致",
          "category": "predicate",
          "category_name": "谓语动词",
          "fine_category": "pred-sva-form"
        },
        {
          "no": 40,
          "answer": "to",
          "explanation": "考查介词。句意：同上。from...to...意为“从……到……”，为固定搭配。故填to。",
          "grammar_point": "介词",
          "category": "preposition",
          "category_name": "介词",
          "fine_category": "prep-common",
          "facets": {
            "word": "to"
          }
        },
        {
          "no": 41,
          "answer": "exhibiting",
          "explanation": "考查非谓语动词。句意：Lillian的作品不仅仅是展示这些物品；她通过茶艺表演、书法课和传统医学讲座等高度互动的活动，使文化鲜活起来，促进冰岛人对中国丰富传统的理解。空处应用动名词，作介词beyond的宾语。故填exhibiting。",
          "grammar_point": "非谓语动词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-noun",
          "nonp_function": "object",
          "nonp_function_label": "作宾语",
          "nonp_form": "doing",
          "nonp_form_label": "doing",
          "nonp_rule": "beyond 是介词，后面接 doing，exhibiting 作介词宾语。",
          "nonp_needs_review": false,
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 42,
          "answer": "interactive",
          "explanation": "考查形容词。句意：同上。空处应用形容词，作定语修饰activities。interactive意为“互动的，交互的”符合句意。故填interactive。",
          "grammar_point": "形容词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-adj",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 43,
          "answer": "was recognized",
          "explanation": "考查时态、语态和主谓一致。句意：Lillian的博物馆每年吸引来自世界各地的数千名游客，2021年因其影响力而获得冰岛政府的认可。空处作句子的谓语。根据句中的“in 2021”可知，这里是过去发生的事情，应用一般过去时。主语Lilian’s museum和recognize之间是动宾关系，应用被动语态，且主语为单数，be动词应用was。故填was recognized。",
          "grammar_point": "时态、语态和主谓一致",
          "category": "predicate",
          "category_name": "谓语动词",
          "fine_category": "pred-passive-form"
        },
        {
          "no": 44,
          "answer": "links",
          "explanation": "考查名词的数。句意：Lillian凭借她的热情和专业知识，在冰岛和中国之间建立了多样化的文化联系。link意为“联系”，为可数名词。前面有diverse修饰，这里应用名词复数。故填links。",
          "grammar_point": "名词的数",
          "category": "number",
          "category_name": "名词/数词",
          "fine_category": "num-plural",
          "facets": {
            "type": "plural"
          }
        },
        {
          "no": 45,
          "answer": "but",
          "explanation": "考查连词。句意：她的博物馆不仅使两国人民更好地了解彼此，还加强了我们的关系。not just...but...意为“不仅……而且……”，为固定搭配。故填but。",
          "grammar_point": "连词",
          "category": "logic",
          "category_name": "逻辑连词",
          "fine_category": "logic-coordinating",
          "facets": {
            "word": "but",
            "kind": "correlative"
          }
        }
      ],
      "chinese_translation": "在冰岛雷克雅未克市中心，矗立着一座由莉莉安·霍普斯创建的博物馆，象征着冰中两国人民的友谊。作为中国文化遗产的热忱爱好者，莉莉安从上世纪90年代开始踏上了解中国的旅程，那时她全身心投入探索中国丰富的文化。她的热情将她的家变成了一个充满中国文物的地方，最终促成了雷克雅未克这座博物馆的建立。\n\n博物馆收藏了大量文物，从古代服饰到当代艺术，展现了中国数千年的文明。莉莉安的工作不仅限于展示这些物品；她通过茶艺表演、书法课程和传统医学讲座等高度互动的活动，让文化鲜活起来，促进了冰岛人对中国丰富传统的理解。\n\n莉莉安的博物馆每年吸引来自世界各地的数千名游客，并于2021年因其影响力获得冰岛政府的认可。正如冰岛外交部司长玛尔塔·约恩斯多蒂尔在接受采访时所说：“莉莉安凭借她的热情和专业知识，在冰岛和中国之间建立了多元的文化联系。她的博物馆不仅让两国人民更好地相互了解，也加强了我们的关系。”"
    },
    {
      "exam_id": "2025全国一卷",
      "year": 2025,
      "type": "真题",
      "question_id": "56-65",
      "passage": "An exhibition at the Jiushi Art Museum in Shanghai is featuring artwork inspired by Go, or weiqi in Chinese, ___56___ originated in China more than 4,000 years ago.\n\nGo is one of ___57___ earliest binary-based (基于二元的) games. The movements of the black and white pieces reflect the basic ideas of Eastern philosophy, according to Tu Ningning, who is in charge of the exhibition.\n\n\"The exhibition brings together Go culture, cutting-edge technology and contemporary art,\" says Tu. \"We hope ___58___ (present) the rather abstract Go game and AI in a visual context, and initiate dialogues with minimalist art, conceptual art and expressionism.\"\n\n\"In a Go game, each move should serve a long-term goal. You try to lead the opponent into your trap and force them to follow your '___59___ (guide)' till they lose,\" explains Wang Wei, a Go player among the visitors to the exhibition.\n\n\"The players' personalities ___60___ (reveal) during the game, and one's weaknesses are exposed to the opponent,\" she adds. \"A decent winner always ___61___ (try) to beat the opponent ___62___ no more than one or two points as a gesture (姿态) of respect for the other side.\"\n\nTu says that the balance between the black and white pieces, the beauty in the ___63___ (strategy) placement of the pieces, ___64___ the energy flow following each move inspired artists to create oil paintings, sculptures, ___65___ (digital) generated pictures and silk-screen prints for the exhibition.",
      "blank_count": 10,
      "questions": [
        {
          "no": 56,
          "answer": "which",
          "explanation": "考查定语从句。句意：上海久事美术馆正在举办一场展览，展出的艺术品灵感来自围棋（中文称为\"围棋\"），它起源4000多年前的中国。本空引导非限制性定语从句，修饰先行词为Go, or weiqi in Chinese，指物，且关系词代替先行词在从句中作主语，所以用关系代词which引导。故填which。",
          "grammar_point": "定语从句",
          "category": "attrib",
          "category_name": "定语从句",
          "fine_category": "attrib-pronoun",
          "facets": {
            "type": "relative-pronoun",
            "word": "which",
            "restrictive": false
          }
        },
        {
          "no": 57,
          "answer": "the",
          "explanation": "考查冠词。句意：围棋是最早的基于二元的棋类游戏之一。形容词最高级前用定冠词the。故填the。",
          "grammar_point": "冠词",
          "category": "article",
          "category_name": "冠词",
          "fine_category": "art-the",
          "facets": {
            "word": "the"
          }
        },
        {
          "no": 58,
          "answer": "to present",
          "explanation": "考查非谓语动词。句意：我们希望在一个视觉语境中呈现相当抽象的围棋游戏和人工智能，并与极简主义艺术、观念艺术和表现主义展开对话。本句谓语为hope，此处为非谓语动词，hope to do sth.\"希望做某事\"，所以此处需用动词present\"呈现\"的不定式，作宾语。故填to present。",
          "grammar_point": "非谓语动词",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-to-do",
          "nonp_function": "object",
          "nonp_function_label": "作宾语",
          "nonp_form": "to_do",
          "nonp_form_label": "to do",
          "nonp_rule": "hope 后接 to do 作宾语，表示“希望呈现”。",
          "nonp_needs_review": false,
          "facets": {
            "form": "to-do"
          }
        },
        {
          "no": 59,
          "answer": "guidance",
          "explanation": "考查名词。句意：你试图引导对手进入你的陷阱，迫使他们跟随你的\"引导\"直到他们输掉。此处作follow的宾语，用名词guidance\"引导\"，不可数名词。故填guidance。",
          "grammar_point": "名词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-noun",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 60,
          "answer": "are revealed",
          "explanation": "考查动词语态。句意：她补充说：\"玩家的个性在游戏中显露出来，一个人的弱点会暴露给对手。\"本句描述一般事实，时态用一般现在时，且主语The players' personalities与动词reveal\"揭示，显示\"为被动关系，所以空处需用一般现在时态的被动语态，主语为复数，be动词用are。故填are revealed。",
          "grammar_point": "动词语态",
          "category": "predicate",
          "category_name": "谓语动词",
          "fine_category": "pred-passive-form"
        },
        {
          "no": 61,
          "answer": "tries",
          "explanation": "考查时态和主谓一致。句意：一个不错的赢家总是尽力以仅仅一两分的优势击败对手，以表示对对方的尊重。根据always可知，本句描述一般事实，时态用一般现在时，主语a decent winner为第三人称单数，所以谓语需用try\"尽力\"的第三人称单数tries。故填tries。",
          "grammar_point": "时态和主谓一致",
          "category": "predicate",
          "category_name": "谓语动词",
          "fine_category": "pred-sva-form"
        },
        {
          "no": 62,
          "answer": "by",
          "explanation": "考查介词。句意同上。\"by+具体数值\"表示\"以（某一差值）\"，此处指\"以一到两分的优势\"，符合语境。故填by。",
          "grammar_point": "介词",
          "category": "preposition",
          "category_name": "介词",
          "fine_category": "prep-common",
          "facets": {
            "word": "by"
          }
        },
        {
          "no": 63,
          "answer": "strategic",
          "explanation": "考查形容词。句意：屠宁宁说，黑白棋子之间的平衡，棋子在策略布局上的美感，以及每一步棋所蕴含的能量流动，都激发了艺术家们为展览创作油画、雕塑、数字生成的图片和丝网版画。此处修饰名词placement，需用形容词strategic\"战略性的，策略的\"，作定语。故填strategic。",
          "grammar_point": "形容词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-adj",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 64,
          "answer": "and",
          "explanation": "考查连词。句意同上。the balance between the black and white pieces, the beauty in the strategic placement of the pieces, the energy flow following each move三者为并列关系，作并列主语，所以空处需用连词and。故填and。",
          "grammar_point": "连词",
          "category": "logic",
          "category_name": "逻辑连词",
          "fine_category": "logic-coordinating",
          "facets": {
            "word": "and",
            "kind": "coordinating"
          }
        },
        {
          "no": 65,
          "answer": "digitally",
          "explanation": "考查副词。句意同上。此处修饰形容词generated，需用副词digitally\"数字地\"，作状语。故填digitally。",
          "grammar_point": "副词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-adv",
          "facets": {
            "subtype": "derivation"
          }
        }
      ],
      "chinese_translation": "上海久事美术馆正在举办一场以围棋为主题的展览。围棋起源于4000多年前的中国，是世界上最古老的棋类游戏之一。\n\n围棋是最早的二元制游戏之一。展览负责人涂宁宁表示，黑白棋子的移动体现了东方哲学的基本思想。\n\n涂宁宁说：\"本次展览将围棋文化、前沿科技与当代艺术融为一体。我们希望在视觉语境中呈现较为抽象的围棋和人工智能，并与极简主义艺术、观念艺术和表现主义展开对话。\"\n\n参观展览的围棋选手王伟解释道：\"在围棋对弈中，每一步棋都要服务于长远目标。你要设法引导对手落入陷阱，迫使他们跟随你的'引导'直至落败。\"\n\n她补充道：\"棋手的性格会在对弈中显露无遗，自身的弱点也会暴露在对手面前。一位体面的赢家总是试图以不超过一两目的优势取胜，以此作为对对手的尊重姿态。\"\n\n涂宁宁表示，黑白棋子之间的平衡、棋子布局的策略之美，以及每步棋后的能量流动，激发了艺术家们为本次展览创作油画、雕塑、数字生成图像和丝网版画。"
    },
    {
      "exam_id": "2025全国二卷",
      "year": 2025,
      "type": "真题",
      "question_id": "56-65",
      "passage": "I was born and raised in Cleveland, Ohio in the United States. Yet now, I live in the countryside of Zhejiang, China with my Chinese husband and his family, ___36___ bamboo and tea bushes (灌木) grow wild in the mountains, chickens are always free-range, and ___37___ (center) heating doesn't exist.\n\nNothing in my life before prepared me ___38___ this one-and to be sure, the first time I came here I never imagined I would ever feel comfortable in this area. But it's amazing how you can adapt ___39___ learn in a new environment. Over time, I've found ___40___ (I) feeling extremely at home here. And in the process, I've experienced things that really surprise me at times. The \"sunshine scent (香味)\" of freshly sunned clothes ___41___ (be) one of them.\n\nGrowing up, my family and our neighbors never used clotheslines to dry clothing, denying me the chance ___42___ (discover) one of the great wonders of sunshine --- the sweet \"sunshine scent\" after sunning clothes for an entire day. The sun-dried clothes smell especially pleasant where I live, thanks to the ___43___ (absent) of smog and plenty of blue sky ___44___ (afternoon) with lots of fresh air.\n\nIf you've never experienced the \"sunshine scent\" from a sheet or shirt ___45___ (leave) to sun for a day, well, you're missing out on one of life's wonders.",
      "blank_count": 10,
      "questions": [
        {
          "no": 36,
          "answer": "where",
          "explanation": "考查定语从句。句意：然而现在，我和我的中国丈夫和他的家人住在中国浙江的农村，在那里山上野生竹子和茶树丛生，鸡总是自由放养的，而且没有集中供暖。本空引导非限制性定语从句，修饰先行词the countryside of Zhejiang，China，关系词代替先行词在从句中作地点状语，应用关系副词where引导。故填where。",
          "grammar_point": "定语从句",
          "category": "attrib",
          "category_name": "定语从句",
          "fine_category": "attrib-adverb",
          "facets": {
            "type": "relative-adverb",
            "word": "where",
            "restrictive": false
          }
        },
        {
          "no": 37,
          "answer": "central",
          "explanation": "考查形容词。句意同上。本空修饰名词heating，应用形容词central\"中央的，中心的\"，作定语。故填central。",
          "grammar_point": "形容词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-adj",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 38,
          "answer": "for",
          "explanation": "考查介词。句意：我生命中没有任何事情能让我为这一切做好准备------可以肯定的是，我第一次来到这里时，从未想过我会在这个地方感到舒适。prepare sb. for\\...\"使某人为......做好准备\"，固定搭配。故填for。",
          "grammar_point": "介词",
          "category": "preposition",
          "category_name": "介词",
          "fine_category": "prep-collocation",
          "facets": {
            "word": "for"
          }
        },
        {
          "no": 39,
          "answer": "and",
          "explanation": "考查连词。句意：但令人惊讶的是，你是如何适应并在新环境中学习的。adapt和learn是并列关系，应用连词and连接。故填and。",
          "grammar_point": "连词",
          "category": "logic",
          "category_name": "逻辑连词",
          "fine_category": "logic-coordinating",
          "facets": {
            "word": "and",
            "kind": "coordinating"
          }
        },
        {
          "no": 40,
          "answer": "myself",
          "explanation": "考查反身代词。句意：随着时间的推移，我发现自己在这里有了宾至如归的感觉。本空指代主语I，表示\"我自己\"，应用反身代词myself。故填myself。",
          "grammar_point": "反身代词",
          "category": "pronoun",
          "category_name": "代词",
          "fine_category": "pron-personal",
          "facets": {
            "type": "personal"
          }
        },
        {
          "no": 41,
          "answer": "is",
          "explanation": "考查时态和主谓一致。句意：晒过的衣服的\"阳光的味道\"就是其中之一。本句描述的是一般事实，时态用一般现在时，且主语The \"sunshine scent (香味)\" of freshly sunned clothes为第三人称单数，be动词用is。故填is。",
          "grammar_point": "时态和主谓一致",
          "category": "predicate",
          "category_name": "谓语动词",
          "fine_category": "pred-sva-form"
        },
        {
          "no": 42,
          "answer": "to discover",
          "explanation": "考查非谓语动词。句意：在我的成长过程中，我的家人和邻居从不使用晾衣绳晾晒衣物，这让我没有机会发现阳光的奇妙之处之一------将衣服晒了一整天后散发的甜美的\"阳光的味道\"。本句已有谓语used，此处应用非谓语动词， chance to do sth.\"做某事的机会\",本空用discover的不定式，作定语。故填to discover。",
          "grammar_point": "非谓语动词",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-to-do",
          "nonp_function": "attribute",
          "nonp_function_label": "作定语",
          "nonp_form": "to_do",
          "nonp_form_label": "to do",
          "nonp_rule": "chance 后常接 to do 作后置定语，表示“发现……的机会”。",
          "nonp_needs_review": false,
          "facets": {
            "form": "to-do"
          }
        },
        {
          "no": 43,
          "answer": "absence",
          "explanation": "查名词。句意：我住的地方，晒干的衣服闻起来特别香，这要归功于没有烟雾，而且下午的天很蓝天、空气新鲜。本空作thanks to的宾语，应用名词absence\"缺乏，没有\"，不可数名词。故填absence。",
          "grammar_point": "名词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-noun",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 44,
          "answer": "afternoons",
          "explanation": "考查名词的数。句意：我住的地方，晒干的衣服闻起来特别香，这要归功于没有烟雾，而且下午有很多蓝天和新鲜空气。afternoon\"下午\"是可数名词，此处指不止一个下午，应用复数形式afternoons。故填afternoons。",
          "grammar_point": "名词的数",
          "category": "number",
          "category_name": "名词/数词",
          "fine_category": "num-plural",
          "facets": {
            "type": "plural"
          }
        },
        {
          "no": 45,
          "answer": "left",
          "explanation": "考查非谓语动词。句意：如果你从未体验过在阳光下晾晒了一整天的床单或衬衫散发的\"阳光的味道\"，那么你就错过了生活中的一大奇观。本句已有谓语have experienced，此处应用非谓语动词，a sheet or shirt和leave\"使处于某种状态\"之间是逻辑动宾关系，应用过去分词，作后置定语。故填left。",
          "grammar_point": "非谓语动词",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-done",
          "nonp_function": "attribute",
          "nonp_function_label": "作定语",
          "nonp_form": "done",
          "nonp_form_label": "done",
          "nonp_rule": "left 修饰 a sheet or shirt，二者与 leave 是动宾关系，用 done 作后置定语。",
          "nonp_needs_review": false,
          "facets": {
            "form": "done"
          }
        }
      ],
      "chinese_translation": "我出生并成长于美国俄亥俄州的克利夫兰。然而现在，我和我的中国丈夫及其家人一起生活在中国浙江的乡村，这里山间竹林丛生、茶树遍野，鸡群自由放养，也没有集中供暖。\n\n过去的生活从未让我为这样的环境做好准备——说实话，第一次来到这里时，我从未想过自己会在这里感到自在。但令人惊叹的是，人竟能在新环境中如此迅速地适应和学习。随着时间的推移，我发现自己在这里感到无比自在。在这个过程中，我时常经历一些真正令我惊喜的事物。其中一件便是刚晒过衣服的\"阳光香味\"。\n\n从小到大，我家和邻居们从不用晾衣绳晾晒衣物，这让我无缘发现阳光的一大奇迹——经过一整天晾晒后衣物散发的甜美\"阳光香味\"。在我居住的地方，由于没有雾霾，加上午后常有蓝天白云和清新空气，阳光晒过的衣物闻起来格外宜人。\n\n如果你从未体验过被单或衬衫在阳光下晾晒一天后散发的\"阳光香味\"，那么你正在错过人生的一大奇迹。"
    },
    {
      "exam_id": "2025广州一模",
      "year": 2025,
      "type": "模拟卷",
      "question_id": "56-65",
      "passage": "The China Wildlife Image and Video Competition, hosted by the Chinese National Geography, has long been ___36___ event of great significance in the field of wildlife documentation. At an awards ceremony recently held in Beijing, 17 remarkable images and videos, which ___37___ (select) from over 37,600 submissions globally, deeply attracted the audience.\n\nThe competition, ___38___ (theme) “Spirituality of Mountains and Seas” this year, aims to enhance public awareness of wildlife and ecological conservation. Among the award-winning ___39___ (entry), the work of Jia Haining’s team on Oriental storks (东方白鹳) in the Yellow River Delta stood out ___40___ (noticeable). Their delicate piece of art beautifully demonstrated the region’s ecological harmony and species ___41___ (diverse).\n\nTo film the dynamic moment ___42___ the birds left their nests, they arrived at the filming site as early as 4:30 am. And they waited patiently for almost two months ___43___ the young storks’ first flight! The judges praised their work as a breathtaking symphony of life.\n\nAdditionally, special awards for mobile photography and social media engagement were introduced to encourage ___44___ (broad) public participation. The competition, as Dr. Jane Goodall noted, has the power to inspire people, especially those who rarely have the opportunity to experience nature firsthand, ___45___ (reconnect) with the natural world.",
      "blank_count": 10,
      "questions": [
        {
          "no": 36,
          "answer": "an",
          "explanation": "考查冠词。句意：由《中国国家地理》主办的“中国野生动物影像录像大赛”一直是野生动物文献记录领域具有重要意义的活动。event是可数名词的单数形式，表泛指，前面要加不定冠词，event是元音音素开头，因此不定冠词用an，故填an。",
          "grammar_point": "冠词",
          "category": "article",
          "category_name": "冠词",
          "fine_category": "art-a-an",
          "facets": {
            "word": "a-an"
          }
        },
        {
          "no": 37,
          "answer": "were selected",
          "explanation": "考查时态，被动语态和主谓一致。句意：最近在北京举行的颁奖典礼上，从全球超过37,600份参赛作品中选出了17张出色的图片和视频，深深吸引了观众。图片和视频是被选择，由attracted可知句子时态是一般过去时，因此空格处用一般过去时的被动语态，which指代的先行词17 remarkable images and videos是复数，因此空格处是were selected。故填were selected。",
          "grammar_point": "时态",
          "category": "predicate",
          "category_name": "谓语动词",
          "fine_category": "pred-passive-form"
        },
        {
          "no": 38,
          "answer": "themed",
          "explanation": "考查非谓语动词。句意：今年的比赛主题为“Spirituality of Mountains and Seas”，旨在提高公众对野生动物和生态保护的意识。句中谓语是aims，空格处用非谓语动词，competition和theme之间是逻辑动宾关系，因此空格处用过去分词表被动，作后置定语，故填themed。",
          "grammar_point": "非谓语动词",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-done",
          "nonp_function": "attribute",
          "nonp_function_label": "作定语",
          "nonp_form": "done",
          "nonp_form_label": "done",
          "nonp_rule": "themed 修饰 competition，competition 与 theme 是动宾关系，用 done 作后置定语。",
          "nonp_needs_review": false,
          "facets": {
            "form": "done"
          }
        },
        {
          "no": 39,
          "answer": "entries",
          "explanation": "考查名词的复数。句意：在获奖作品中，Jia Haining团队关于黄河三角洲东方鹳的作品引人注目。entry是可数名词，不止一个，因此空格处用复数，故填entries。",
          "grammar_point": "名词的复数",
          "category": "number",
          "category_name": "名词/数词",
          "fine_category": "num-plural",
          "facets": {
            "type": "plural"
          }
        },
        {
          "no": 40,
          "answer": "noticeably",
          "explanation": "考查副词。句意：在获奖作品中，Jia Haining团队关于黄河三角洲东方鹳的作品引人注目。空格处用副词修饰动词短语stood out，noticeable的副词是noticeably，意为“显著地，引人注目地”，故填noticeably。",
          "grammar_point": "副词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-adv",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 41,
          "answer": "diversity",
          "explanation": "考查名词。句意：他们精致的艺术品精美地展示了该地区的生态和谐和物种多样性。空格处用名词作宾语，diverse的名词是diversity，是不可数名词，意为“多样性”。故填diversity。",
          "grammar_point": "名词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-noun",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 42,
          "answer": "when",
          "explanation": "考查定语从句。句意：为了拍摄这些鸟离开巢穴的动态瞬间，他们早在凌晨4:30就到达了拍摄地点。空格处引导的是限制性定语从句，从句中不缺主语或宾语，先行词moment是时间，因此用关系副词when，故填when。",
          "grammar_point": "定语从句",
          "category": "attrib",
          "category_name": "定语从句",
          "fine_category": "attrib-adverb",
          "facets": {
            "type": "relative-adverb",
            "word": "when",
            "restrictive": true
          }
        },
        {
          "no": 43,
          "answer": "for",
          "explanation": "考查介词。句意：他们耐心地等待了近两个月，等待小鹳的第一次飞行！wait for是固定短语，意为“等待”，因此空格处用介词for，故填for。",
          "grammar_point": "介词",
          "category": "preposition",
          "category_name": "介词",
          "fine_category": "prep-collocation",
          "facets": {
            "word": "for"
          }
        },
        {
          "no": 44,
          "answer": "broader",
          "explanation": "考查比较级。句意：此外，还设立了手机摄影和社交媒体参与特别奖，以鼓励更广泛的公众参与。根据语境可知，句子表示“以鼓励更广泛的公众参与”，空格处用比较级broader，表示“更广泛的”。故填broader。",
          "grammar_point": "比较级",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-comparative",
          "facets": {
            "subtype": "comparative"
          }
        },
        {
          "no": 45,
          "answer": "to reconnect",
          "explanation": "考查不定式。句意：正如Jane Goodall博士所指出的那样，这项竞赛具有激励人们，尤其是那些很少有机会亲身体验大自然的人，重新与自然世界建立联系的力量。inspire sb. to do sth.是固定短语，意为“激励某人做某事”，因此空格处是不定式to reconnect，故填to reconnect。",
          "grammar_point": "不定式",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-to-do",
          "nonp_function": "complement",
          "nonp_function_label": "作补语",
          "nonp_form": "to_do",
          "nonp_form_label": "to do",
          "nonp_rule": "inspire sb. to do sth. 中 to reconnect 作宾语补足语，说明激励对象去做什么。",
          "nonp_needs_review": false,
          "facets": {
            "form": "to-do"
          }
        }
      ],
      "chinese_translation": "由中国国家地理主办的\"中国野生生物影像年赛\"，长期以来一直是野生动物记录领域极具影响力的盛事。近日在北京举行的颁奖典礼上，从全球超过37600份投稿中精选出的17件震撼人心的影像作品，深深吸引了在场观众。\n\n本届赛事以\"山海有灵\"为主题，旨在提升公众对野生动物及生态保护的认知。在获奖作品中，贾海宁团队拍摄的黄河三角洲东方白鹳作品尤为引人注目。这部精致的影像作品完美展现了该区域的生态和谐与物种多样性。\n\n为了捕捉雏鸟离巢的动人瞬间，他们凌晨4点半便抵达拍摄地点，耐心等待了近两个月，只为记录幼鹳的首次振翅高飞！评委盛赞这部作品是一曲令人叹为观止的生命交响乐。\n\n此外，赛事新增设的手机摄影奖和社交媒体互动奖，旨在鼓励更广泛的公众参与。正如珍·古道尔博士所言，这项赛事能够激发人们——特别是那些鲜有机会亲身体验自然的人们——重新与自然世界建立联结。"
    },
    {
      "exam_id": "2025广州二模",
      "year": 2025,
      "type": "模拟卷",
      "question_id": "56-65",
      "passage": "Once a little-known dish from China's northwest,Lanzhou beef noodle soup is now winning hearts globally.A recent article describes ___56___ this surprisingly simple meal has become popular in ___57___ (city)like New York,London,and Sydney.\n\nAppealing online photos and videos of the dish stimulate local people's appetite and arouse their curiosity,driving them to give ___58___ a try.Diners appreciate both its taste and the experience it offers.In a Manhattan eatery,cooks stretch dough(面团)into noodles right ___59___ customers' eyes.\"It's like magic,\"said one diner.Diners are also amazed by the unique and ___60___ (impressive) chewy texture of Lanzhou noodles,which offers a distinct mouthfeel unlike any other.\n\nThe soup, ___61___ (cook)for hours with beef bones and spices,has a rich flavor.In Queens, a restaurant prepares a version ___62___ respects the dishes' cultural roots and combines 20 spices to produce a hearty soup.The owner even video-calls her grandparents in China for recipes.In Flushing,the owner of a noodle shop adapts the soup based on customer feedback,making it thicker and spicier ___63___ (suit)local preferences.As food expert C.Doyle notes,\"There's no single 'correct' version—it keeps evolving.\"\n\nFrom street food to global star,Lanzhou beef noodle soup shows that sharing food. ___64___(bridge) cultural differences,with each bowl ___65___ (tell)a story of tradition,creativity,and the delight of flavor discovery.",
      "blank_count": 10,
      "questions": [
        {
          "no": 56,
          "answer": "how",
          "explanation": "how /why考查宾语从句。空格后为完整句子，且描述“这一简单餐食如何变得流行”，需用连接副词how引导宾语从句，作describes的宾语。",
          "grammar_point": "宾语从句",
          "category": "nounclause",
          "category_name": "名词性从句",
          "fine_category": "nounc-wh-adverb",
          "facets": {
            "type": "wh-adverb",
            "word": "how"
          }
        },
        {
          "no": 57,
          "answer": "cities",
          "explanation": "cities 考查名词复数。介词like后列举多个城市名称，表示泛指“纽约、伦敦、悉尼等城市”，故用复数形式cities。",
          "grammar_point": "名词复数",
          "category": "number",
          "category_name": "名词/数词",
          "fine_category": "num-plural",
          "facets": {
            "type": "plural"
          }
        },
        {
          "no": 58,
          "answer": "it",
          "explanation": "it 考查代词。指代前文提到的“兰州牛肉面”，用代词it作give的宾语，构成短语give it a try（尝试一下）。",
          "grammar_point": "代词",
          "category": "pronoun",
          "category_name": "代词",
          "fine_category": "pron-personal",
          "facets": {
            "type": "personal"
          }
        },
        {
          "no": 59,
          "answer": "before",
          "explanation": "before 考查介词。根据句意“厨师在顾客眼前将面团拉成面条”，强调“在……面前”，用介词before。",
          "grammar_point": "介词",
          "category": "preposition",
          "category_name": "介词",
          "fine_category": "prep-common",
          "facets": {
            "word": "before"
          }
        },
        {
          "no": 60,
          "answer": "impressively",
          "explanation": "impressively 考查词性转换。修饰形容词chewy需用副词，表示“令人印象深刻的有嚼劲的口感”，故填impressively。",
          "grammar_point": "词性转换",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-adv",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 61,
          "answer": "cooked",
          "explanation": "cooked 考查非谓语动词。动词cook与主语the soup构成被动关系，且作后置定语，表示“用牛骨和香料熬煮数小时的汤”，用过去分词cooked。",
          "grammar_point": "非谓语动词",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-done",
          "nonp_function": "attribute",
          "nonp_function_label": "作定语",
          "nonp_form": "done",
          "nonp_form_label": "done",
          "nonp_rule": "cooked 修饰 the soup，soup 与 cook 是动宾关系，用 done 作后置定语。",
          "nonp_needs_review": false,
          "facets": {
            "form": "done"
          }
        },
        {
          "no": 62,
          "answer": "that",
          "explanation": "that/which 考查定语从句。引导定语从句修饰先行词a version，且在从句中作主语，指物，用关系代词that或which。",
          "grammar_point": "定语从句",
          "category": "attrib",
          "category_name": "定语从句",
          "fine_category": "attrib-pronoun",
          "facets": {
            "type": "relative-pronoun",
            "word": "that",
            "restrictive": true
          }
        },
        {
          "no": 63,
          "answer": "to suit",
          "explanation": "to suit 考查非谓语动词。动词不定式作目的状语，表示“为了使汤更浓更辣以适应本地口味”，故填to suit。",
          "grammar_point": "非谓语动词",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-to-do",
          "nonp_function": "adverbial",
          "nonp_function_label": "作状语",
          "nonp_form": "to_do",
          "nonp_form_label": "to do",
          "nonp_rule": "to suit 表目的，说明调整汤味是为了适应本地口味。",
          "nonp_needs_review": false,
          "facets": {
            "form": "to-do"
          }
        },
        {
          "no": 64,
          "answer": "bridges",
          "explanation": "bridges 考查动词时态。主语sharing food为单数概念，且陈述客观事实，用一般现在时，故填bridges。",
          "grammar_point": "动词时态",
          "category": "predicate",
          "category_name": "谓语动词",
          "fine_category": "pred-tense-present"
        },
        {
          "no": 65,
          "answer": "telling",
          "explanation": "telling 考查非谓语动词。with复合结构中，each bowl与tell为主动关系，用现在分词telling作宾语补足语，表示“每一碗面都在讲述一个故事”。",
          "grammar_point": "非谓语动词",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-doing",
          "nonp_function": "with_absolute",
          "nonp_function_label": "with 复合结构",
          "nonp_form": "doing",
          "nonp_form_label": "doing",
          "nonp_rule": "with 复合结构中 each bowl 与 tell 是主谓关系，用 doing 作宾语补足语。",
          "nonp_needs_review": false,
          "facets": {
            "form": "doing"
          }
        }
      ],
      "chinese_translation": "曾经只是中国西北一道鲜为人知的小吃，兰州牛肉面如今正赢得全球食客的青睐。近日一篇报道讲述了这道看似简单的面食如何在纽约、伦敦、悉尼等城市走红。\n\n诱人的美食图片和视频在网络上传播，激发了当地人的食欲和好奇心，促使他们前来一探究竟。食客们不仅欣赏其味道，更享受整个用餐体验。在曼哈顿的一家餐馆里，厨师当着顾客的面将面团拉成面条。\"就像变魔术一样，\"一位食客感叹道。兰州面条独特而令人难忘的嚼劲也让食客们惊叹不已，这种与众不同的口感别具一格。\n\n用牛骨和香料熬制数小时的汤底味道浓郁。在皇后区，一家餐馆在尊重这道菜文化根源的基础上，融合了20种香料熬制出醇厚的汤底。店主甚至通过视频通话向远在中国的祖父母请教配方。在法拉盛，一家面馆的老板根据顾客反馈调整汤底，使其更浓更辣，以适应当地人的口味。正如美食专家C·多伊尔所言：\"没有所谓的'正宗'版本——它一直在演变。\"\n\n从街头小吃到全球明星，兰州牛肉面证明了美食能够跨越文化差异，每一碗面都在讲述着传统、创新和发现美味之乐的故事。"
    },
    {
      "exam_id": "2025浙江首考",
      "year": 2025,
      "type": "真题",
      "question_id": "56-65",
      "passage": "The price of fashion — economically and environmentally — has led to the rise of ___56___ new way of dressing, and it's beginning to take off in Australia, too. As people now choose to wear more clothes fewer ___57___ (time), clothing rental services have become increasingly popular.\n\n\"I think it's an amazing idea,\" says Tanya Perilli, who owns a clothing rental shop. \"Customers today look past the fact that something is secondhand and focus instead ___58___ the fact that they have something unique to wear ___59___ are not overstuffing their own wardrobes (衣柜) or contributing to landfill.\"\n\nTanya's shop offers fashion clothes for women ___60___ (rent) rather than purchase them outright, providing a less expensive ___61___ (solve) to one-time event dressing. The concept ___62___ (be) certainly not new — men have been renting good suits for decades — but for female shoppers, it is just taking off. This clothing-as-service model follows the broader societal movement towards shared economies.\n\nTanya is also looking beyond special-occasion dresses to less formal clothing, ___63___ she plans to package as capsule wardrobes and offer to travellers, such as those headed to weddings abroad, with a longer-term rental period. \"I really want to make this work for ___64___ (people) lives today, and I know that doesn't always mean ___65___ (return) a dress on the Monday after a special weekend,\" she says.",
      "blank_count": 10,
      "questions": [
        {
          "no": 56,
          "answer": "a",
          "explanation": "考查冠词。way 为可数名词单数，此处表示“一种新的穿衣方式”，new 以辅音音素开头，应用 a。",
          "grammar_point": "冠词",
          "category": "article",
          "category_name": "冠词",
          "fine_category": "art-a-an",
          "facets": {
            "word": "a-an"
          }
        },
        {
          "no": 57,
          "answer": "times",
          "explanation": "考查名词复数。time 表“次数”时为可数名词，前有 fewer 修饰，应用复数形式 times。",
          "grammar_point": "名词复数",
          "category": "number",
          "category_name": "名词/数词",
          "fine_category": "num-plural",
          "facets": {
            "type": "plural"
          }
        },
        {
          "no": 58,
          "answer": "on",
          "explanation": "考查介词。focus on 为固定搭配，表示“关注”，应用 on。",
          "grammar_point": "介词",
          "category": "preposition",
          "category_name": "介词",
          "fine_category": "prep-collocation",
          "facets": {
            "word": "on"
          }
        },
        {
          "no": 59,
          "answer": "and",
          "explanation": "考查并列连词。have something unique to wear 与 are not overstuffing... 构成并列关系，应用 and。",
          "grammar_point": "连词",
          "category": "logic",
          "category_name": "逻辑连词",
          "fine_category": "logic-coordinating",
          "facets": {
            "word": "and",
            "kind": "coordinating"
          }
        },
        {
          "no": 60,
          "answer": "to rent",
          "explanation": "考查非谓语动词。fashion clothes for women to rent 表示“供女性租用的时装”，用不定式作后置定语。",
          "grammar_point": "非谓语动词",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-to-do",
          "nonp_function": "attribute",
          "nonp_function_label": "作定语",
          "nonp_form": "to_do",
          "nonp_form_label": "to do",
          "nonp_rule": "clothes for women to rent 中 to rent 作后置定语，说明衣服的用途。",
          "nonp_needs_review": false,
          "facets": {
            "form": "to-do"
          }
        },
        {
          "no": 61,
          "answer": "solution",
          "explanation": "考查名词。空前有形容词 less expensive 修饰，且空格作 providing 的宾语，solve 应变为名词 solution。",
          "grammar_point": "名词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-noun",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 62,
          "answer": "is",
          "explanation": "考查谓语动词。主语 The concept 为单数，句子陈述一般事实，应用一般现在时 is。",
          "grammar_point": "谓语动词",
          "category": "predicate",
          "category_name": "谓语动词",
          "fine_category": "pred-tense-present"
        },
        {
          "no": 63,
          "answer": "which",
          "explanation": "考查非限制性定语从句。先行词为 less formal clothing，关系词在从句中作 package 的宾语，应用 which。",
          "grammar_point": "定语从句",
          "category": "attrib",
          "category_name": "定语从句",
          "fine_category": "attrib-pronoun",
          "facets": {
            "type": "relative-pronoun",
            "word": "which",
            "restrictive": false
          }
        },
        {
          "no": 64,
          "answer": "people's",
          "explanation": "考查名词所有格。空格修饰 lives，表示“人们的生活”，应用 people 的所有格 people's。",
          "grammar_point": "名词所有格",
          "category": "number",
          "category_name": "名词/数词",
          "fine_category": "num-possessive",
          "facets": {
            "type": "possessive"
          }
        },
        {
          "no": 65,
          "answer": "returning",
          "explanation": "考查非谓语动词。mean 表示“意味着”时后接动名词作宾语，应用 returning。",
          "grammar_point": "非谓语动词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-noun",
          "nonp_function": "object",
          "nonp_function_label": "作宾语",
          "nonp_form": "doing",
          "nonp_form_label": "doing",
          "nonp_rule": "mean 表“意味着”时后接 doing，returning 作宾语。",
          "nonp_needs_review": false,
          "facets": {
            "subtype": "derivation"
          }
        }
      ],
      "chinese_translation": "时尚的经济与环境代价催生了一种新的穿衣方式，这种趋势在澳大利亚也开始兴起。如今人们选择减少单件衣物的穿着次数，服装租赁服务因此日益流行。\n\n\"我认为这是个绝妙的主意，\"服装租赁店店主坦尼娅·佩里利表示，\"现在的顾客不再介意衣物是二手的，反而更看重能穿到独特款式，既不会塞爆自家衣柜，也不会给垃圾填埋场增加负担。\"\n\n坦尼娅的店铺提供女装租赁而非直接购买，为一次性活动着装提供了更经济的解决方案。这种概念本身并不新鲜——男士租赁正装已有数十年历史——但对女性消费者而言才刚刚兴起。这种\"服装即服务\"模式顺应了共享经济的社会大趋势。\n\n坦尼娅还将目光投向非正式服装领域，计划将其打包成\"胶囊衣橱\"向旅客提供，例如前往海外参加婚礼的客人，租期可更长。\"我真心希望这种模式能适应当代人的生活节奏，\"她说，\"毕竟不是所有人都能在特殊周末后的周一就归还裙子。\""
    },
    {
      "exam_id": "2025深圳一模",
      "year": 2025,
      "type": "模拟卷",
      "question_id": "56-65",
      "passage": "On August 5, 2024, Chinese badminton player He Bingjiao won a silver medal at the Paris Olympics. However, ___36___ truly stood out was a touching moment on the podium (领奖台). As she received her medal, He Bingjiao held a badge (徽章) ___37___ (feature) the Spanish flag, which aroused widespread curiosity online.\n\nThis gesture was to express respect and care for her semifinal opponent, Spain’s Carolina Marin, who ___38___ (retire) from the match due to injury. He Bingjiao explained, “I brought the Spanish badge because Marin’s suffering broke my heart. I hope she sees this and wish her a speedy ___39___ (recover).”\n\nDuring their semifinal match, Marin performed well but ___40___ (force) to stop after getting injured. He Bingjiao immediately reached out, offering support and checking on Marin, who was ___41___ (visible) upset.\n\nThe act rapidly made headlines around the world. The International Olympic Committee praised He Bingjiao ___42___ showing the Olympic values of respect and friendship. Spanish media also highlighted the ___43___ (emotion) moment, with many fans applauding her sportsmanship. Pau Gasol, the legendary Spanish basketball player, called it ___44___ beautiful display of Olympic spirit.\n\nHe Bingjiao’s action not only demonstrated her respect for her opponent but also reflected the true spirit of the Olympics — competition, ___45___ (pair) with unity and mutual (相互的) respect.",
      "blank_count": 10,
      "questions": [
        {
          "no": 36,
          "answer": "what",
          "explanation": "考查主语从句。句意：然而，真正引人注目的是领奖台上的一个感人时刻。分析句子可知，句子为主语从句，空格处单词引导从句，从句中缺少主语，指事物，没有选择范围，故应用“what”引导从句。故填what。",
          "grammar_point": "主语从句",
          "category": "nounclause",
          "category_name": "名词性从句",
          "fine_category": "nounc-wh-pronoun",
          "facets": {
            "type": "wh-pronoun",
            "word": "what"
          }
        },
        {
          "no": 37,
          "answer": "featuring",
          "explanation": "考查非谓语动词。句意：何冰娇在领奖时，手持西班牙国旗徽章，在网上引起了广泛的好奇。分析句子可知，句中有谓语动词“held”，故空格处应用非谓语动词，“badge”和“feature”为逻辑上的主谓关系，故应用“feature”的现在分词“featuring”作后置定语。故填featuring。",
          "grammar_point": "非谓语动词",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-doing",
          "nonp_function": "attribute",
          "nonp_function_label": "作定语",
          "nonp_form": "doing",
          "nonp_form_label": "doing",
          "nonp_rule": "featuring 修饰 badge，badge 与 feature 是主谓关系，用 doing 作后置定语。",
          "nonp_needs_review": false,
          "facets": {
            "form": "doing"
          }
        },
        {
          "no": 38,
          "answer": "retired",
          "explanation": "考查时态。句意：这一姿态是为了表达对她的半决赛对手、西班牙选手卡罗琳娜·马林的尊重和关心，马林因伤退出了比赛。根据句意和句中“was”可知，句子应用一般过去时，表示过去发生的事，故空格处应用“retire”的过去式“retired”；当强调“退出比赛”的动作发生在“表达尊重和关心”之前时，即过去的过去，可用过去完成时，空格处应用“had retired”。故填retired/had retired。",
          "grammar_point": "时态",
          "category": "predicate",
          "category_name": "谓语动词",
          "fine_category": "pred-tense-past-future"
        },
        {
          "no": 39,
          "answer": "recovery",
          "explanation": "考查名词。句意：何冰娇解释说：“我带来西班牙徽章是因为马林的痛苦让我伤心。我希望她能看到这一刻，并祝愿她早日康复。”分析句子可知，“speedy”为形容词，空格处应用名词，作直接宾语，“recovery”意为“康复”，为可数名词，“a”后接可数名词单数。故填recovery。",
          "grammar_point": "名词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-noun",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 40,
          "answer": "was forced",
          "explanation": "考查时态和语态。句意：在半决赛中，马林表现不错，但受伤后被迫停赛。根据句意和句中“performed”可知，句子陈述的是过去发生的事，“Marin”和“force”为被动关系，故句子应用一般过去时的被动语态，“Marin”和“was”连用，“force”的过去分词为“forced”，故空格处应填“was forced”。故填was forced。",
          "grammar_point": "时态和语态",
          "category": "predicate",
          "category_name": "谓语动词",
          "fine_category": "pred-passive-form"
        },
        {
          "no": 41,
          "answer": "visibly",
          "explanation": "考查副词。句意：何冰娇立刻伸出手来，表示支持并查看马林的情况，马林显然很沮丧。分析句子可知，“upset”为形容词，空格处应用副词，作状语，“visibly”意为“明显地”，副词词性。故填visibly。",
          "grammar_point": "副词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-adv",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 42,
          "answer": "for",
          "explanation": "考查固定短语。句意：国际奥委会赞扬何冰娇体现了尊重和友谊的奥林匹克价值观。分析句子可知，句中涉及固定短语“praise sb. for doing sth.”，意为“因为做某事而赞扬某人”，故空格处应用介词“for”。故填for。",
          "grammar_point": "固定短语",
          "category": "preposition",
          "category_name": "介词",
          "fine_category": "prep-collocation",
          "facets": {
            "word": "for"
          }
        },
        {
          "no": 43,
          "answer": "emotional",
          "explanation": "考查形容词。句意：西班牙媒体也强调了这一激动人心的时刻，许多球迷称赞她的体育精神。分析句子可知，“moment”为名词，空格处应用形容词，作定语，“emotional”意为“激动人心的”，形容词词性。故填emotional。",
          "grammar_point": "形容词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-adj",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 44,
          "answer": "a",
          "explanation": "考查冠词。句意：西班牙传奇篮球运动员保罗·加索尔称之为奥林匹克精神的一次美丽展示。分析句子可知，句中泛指一次美丽展示，故空格处应用不定冠词，表示泛指，“beautiful”音标的第一个音素为辅音音素，故应用不定冠词“a”。故填a。",
          "grammar_point": "冠词",
          "category": "article",
          "category_name": "冠词",
          "fine_category": "art-a-an",
          "facets": {
            "word": "a-an"
          }
        },
        {
          "no": 45,
          "answer": "paired",
          "explanation": "考查非谓语动词。句意：何冰娇的行为不仅体现了她对对手的尊重，也反映了奥运会的真正精神——竞争，团结，相互尊重。分析句子可知，句中有谓语动词“reflected”，故空格处应用非谓语动词，“competition”和“pair”为逻辑上的动宾关系，故应用“pair”的过去分词“paired”。故填paired。",
          "grammar_point": "非谓语动词",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-done",
          "nonp_function": "attribute",
          "nonp_function_label": "作定语",
          "nonp_form": "done",
          "nonp_form_label": "done",
          "nonp_rule": "paired 修饰 competition, unity, and mutual respect，与 pair 是动宾关系，用 done 作后置定语。",
          "nonp_needs_review": false,
          "facets": {
            "form": "done"
          }
        }
      ],
      "chinese_translation": "2024年8月5日，中国羽毛球运动员何冰娇在巴黎奥运会上获得银牌。然而，真正引人注目的是领奖台上一个感人的瞬间。在领取奖牌时，何冰娇手持一枚印有西班牙国旗的徽章，这引发了网友们的广泛好奇。\n\n这一举动是为了向半决赛对手、因伤退赛的西班牙选手卡罗琳娜·马林表达尊重与关怀。何冰娇解释道：\"我带上西班牙徽章，是因为马林的受伤让我心碎。我希望她能看见这枚徽章，并祝愿她早日康复。\"\n\n在半决赛中，马林表现出色，但受伤后被迫停止比赛。何冰娇立即上前，给予支持并查看马林的情况，当时马林明显情绪低落。\n\n这一举动迅速成为全球头条新闻。国际奥委会称赞何冰娇展现了尊重与友谊的奥林匹克价值观。西班牙媒体也强调了这一感人时刻，许多球迷为她的体育精神喝彩。西班牙传奇篮球运动员保罗·加索尔称这是奥林匹克精神的美丽展现。\n\n何冰娇的行为不仅体现了对对手的尊重，更反映了奥运会的真正精神——在竞争中融入团结与相互尊重。"
    },
    {
      "exam_id": "2025深圳二模",
      "year": 2025,
      "type": "模拟题",
      "question_id": "56-65",
      "passage": "For many, cycling to Lhasa is a romantic dream. But for Li Shuangsheng and his son, Li Xuyao, it was ___36___ 36-day, 2298-kilometer journey of growth --- crossing 14 mountains over 4,000 meters and ___37___ (battle) altitude (海拔) sickness. This was the father's special gift to his son's 16th birthday.\n\nSetting off ___38___ Chongqing, they rode in a “father in front, son behind” formation, determined to bike up one mountain each day. One day, they so ___39___ (catch) in a heavy rainstorm on Kazila Mountain's slopes (山坡). Li Shuangsheng led the way downhill and stopped by the roadside to wait for his son. Ten minutes later, Li Xuyao appeared, ___40___ (cover) in mud. His bike, ___41___ chain had slipped off, caused him to lose balance and fall to the ground.\n\nDuring the day, the mountain roads, burning sun, and rainstorms exhausted the father and the son. At night, they either sheltered with Tibetan families ___42___ camped alone. Several times, the father jokingly suggested giving up, but Li Xuyao always replied ___43___ (firm), “No way. I'll do whatever it takes to get there.”\n\nAfter wearing down six sets of brake pads (刹车片), they finally arrived in Lhasa. For Li Xuyao's mother, it was a moment of ___44___ (relieve) and pride. “I prayed for their safe return every night,” she said. “My son has grown into a ___45___ (tough) and more mature young man.”",
      "blank_count": 10,
      "questions": [
        {
          "no": 36,
          "answer": "a",
          "explanation": "不定冠词，表示“一段36天的旅程”，且36-day以辅音音素开头。故填a。",
          "grammar_point": "冠词",
          "category": "article",
          "category_name": "冠词",
          "fine_category": "art-a-an",
          "facets": {
            "word": "a-an"
          }
        },
        {
          "no": 37,
          "answer": "battling",
          "explanation": "与crossing并列，作伴随状语，表示“与高原反应作斗争”。故填battling。",
          "grammar_point": "",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-doing",
          "nonp_function": "adverbial",
          "nonp_function_label": "作状语",
          "nonp_form": "doing",
          "nonp_form_label": "doing",
          "nonp_rule": "battling 与 crossing 并列，主语与 battle 是主谓关系，用 doing 作伴随状语。",
          "nonp_needs_review": false,
          "facets": {
            "form": "doing"
          }
        },
        {
          "no": 38,
          "answer": "from",
          "explanation": "set off from... 从……出发。故填from。",
          "grammar_point": "",
          "category": "preposition",
          "category_name": "介词",
          "fine_category": "prep-collocation",
          "facets": {
            "word": "from"
          }
        },
        {
          "no": 39,
          "answer": "were caught",
          "explanation": "描述过去事件，主语they与catch构成被动关系，用一般过去时被动语态。故填were caught。",
          "grammar_point": "",
          "category": "predicate",
          "category_name": "谓语动词",
          "fine_category": "pred-passive-form"
        },
        {
          "no": 40,
          "answer": "covered",
          "explanation": "Li Xuyao与cover构成被动关系，用过去分词作状语。故填covered。",
          "grammar_point": "",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-done",
          "nonp_function": "adverbial",
          "nonp_function_label": "作状语",
          "nonp_form": "done",
          "nonp_form_label": "done",
          "nonp_rule": "Li Xuyao 与 cover 是动宾关系，用 done 作状语，表示被积雪覆盖的状态。",
          "nonp_needs_review": false,
          "facets": {
            "form": "done"
          }
        },
        {
          "no": 41,
          "answer": "whose",
          "explanation": "引导非限制性定语从句，修饰先行词his bike，在从句中作定语。故填whose。",
          "grammar_point": "定语从句",
          "category": "attrib",
          "category_name": "定语从句",
          "fine_category": "attrib-pronoun",
          "facets": {
            "type": "relative-pronoun",
            "word": "whose",
            "restrictive": false
          }
        },
        {
          "no": 42,
          "answer": "or",
          "explanation": "either...or... 要么……要么……。故填or。",
          "grammar_point": "",
          "category": "logic",
          "category_name": "逻辑连词",
          "fine_category": "logic-coordinating",
          "facets": {
            "word": "or",
            "kind": "correlative"
          }
        },
        {
          "no": 43,
          "answer": "firmly",
          "explanation": "修饰动词replied，用副词。故填firmly。",
          "grammar_point": "副词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-adv",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 44,
          "answer": "relief",
          "explanation": "介词of后接名词，a moment of relief 意为“一个如释重负的时刻”。故填relief。",
          "grammar_point": "名词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-noun",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 45,
          "answer": "tougher",
          "explanation": "与more mature并列，用比较级。故填tougher。",
          "grammar_point": "比较级",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-comparative",
          "facets": {
            "subtype": "comparative"
          }
        }
      ],
      "chinese_translation": "对许多人来说，骑车去拉萨是一个浪漫的梦想。但对李双胜和他的儿子李旭尧而言，这是一段历时36天、长达2298公里的成长之旅——翻越14座海拔4000米以上的高山，与高原反应作斗争。这是父亲送给儿子16岁生日的特殊礼物。\n\n从重庆出发，他们以\"父亲在前、儿子在后\"的队形骑行，决心每天征服一座山。一天，他们在卡子拉山的山坡上遭遇了暴雨。李双胜率先下山，在路边停车等待儿子。十分钟后，李旭尧满身泥泞地出现了。他的自行车链条脱落，导致他失去平衡摔倒在地。\n\n白天，山路、烈日和暴雨让父子俩筋疲力尽。夜晚，他们要么借宿藏族人家，要么独自露营。好几次，父亲开玩笑地提议放弃，但李旭尧总是坚定地回答：\"不行。无论如何我都要到达那里。\"\n\n在磨损了六套刹车片后，他们终于抵达拉萨。对李旭尧的母亲来说，那一刻既如释重负又充满自豪。\"我每晚都祈祷他们平安归来，\"她说，\"我的儿子已经成长为一个更坚强、更成熟的年轻人了。\""
    },
    {
      "exam_id": "2026广州一模",
      "year": 2026,
      "type": "模拟卷",
      "question_id": "56-65",
      "passage": "Distant pleasant music floated above the Sydney Opera House stage. Soft light gradually revealed motionless figures at work, as if lifted ___36___ the pages of a Ming-dynasty book. Slowly they began to move. Accompanied by the soft sound of page turning and the gentle flow of water, their graceful ___37___ (gesture) formed a living picture of labour.\n\nThis breathtaking opening of the dance drama _Tiangong Kaiwu_ pulled me ___38___ (instant) into that world of ancient creation. Through ___39___ (express) movement, the performance conveyed the book’s core message — ___40___ (value) the skills passed down by countless unknown labourers and the power of practical tools. The beautiful scenes of golden fields and shiny silk made me feel the deep bond between humanity and nature.\n\nThe most moving moment came ___41___ Song Yingxing took off his official robe (官袍) and stepped into a “field” formed by the other dancers. All motion ceased; only his figure remained, arms stretched upward, silent yet full of strength. At that instant, history ___42___ (it) seemed to hold its breath.\n\nAs I left the theatre I overheard a visitor say “This is beauty that ___43___ (go) beyond borders.” His words deepened my belief: art ___44___ (root) in a culture’s finest traditions possesses a timeless power to move anyone. This was more than ___45___ ancient book brought to life — it was a celebration of Chinese wisdom and its spirit of sharing with the world.",
      "blank_count": 10,
      "questions": [
        {
          "no": 36,
          "answer": "from",
          "explanation": "考查介词。句意：柔和的灯光逐渐照亮了舞台上静止的人物，他们仿佛从一本明代书籍的书页中被抬了出来。结合句意，此处表示“从……中”，应用介词from，lifted from意为“从……被抬起”，符合语境。故填from。",
          "grammar_point": "介词",
          "category": "preposition",
          "category_name": "介词",
          "fine_category": "prep-common",
          "facets": {
            "word": "from"
          }
        },
        {
          "no": 37,
          "answer": "gestures",
          "explanation": "考查名词复数。句意：在轻柔的翻页声和流水声的陪伴下，他们优雅的姿态构成了一幅生动的劳动画卷。gesture为可数名词，结合句中their（他们的）可知，此处应用复数形式，指代多名舞者的姿态。故填gestures。",
          "grammar_point": "名词复数",
          "category": "number",
          "category_name": "名词/数词",
          "fine_category": "num-plural",
          "facets": {
            "type": "plural"
          }
        },
        {
          "no": 38,
          "answer": "instantly",
          "explanation": "考查副词。句意：舞蹈剧《天工开物》这令人惊叹的开场瞬间就把我带入了那个古老的创造世界。此处修饰动词pulled（带入），应用副词形式，instant的副词为instantly，意为“立刻、瞬间”。故填instantly。",
          "grammar_point": "副词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-adv",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 39,
          "answer": "expressive",
          "explanation": "考查形容词。句意：通过富有表现力的动作，这场演出传递了这本书的核心思想——珍视无数无名劳动者传承下来的技艺和实用工具的力量。此处修饰名词movement（动作），应用形容词形式，express的形容词为expressive，意为“富有表现力的”。故填expressive。",
          "grammar_point": "形容词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-adj",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 40,
          "answer": "valuing",
          "explanation": "考查非谓语动词。句意：通过富有表现力的动作，这场演出传递了这本书的核心思想——珍视无数无名劳动者传承下来的技艺和实用工具的力量。此处为名词短语core message的同位语，用动名词形式。故填valuing。",
          "grammar_point": "非谓语动词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-noun",
          "nonp_function": "subject_predicative",
          "nonp_function_label": "作主语 / 表语",
          "nonp_form": "doing",
          "nonp_form_label": "doing",
          "nonp_rule": "valuing 是动名词短语，解释 core message 的内容，具有名词性。",
          "nonp_needs_review": false,
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 41,
          "answer": "when",
          "explanation": "考查定语从句/连词。句意：最感人的时刻出现在宋应星脱下官袍，走进由其他舞者组成的“田野”时。此处引导时间状语从句，意为“当……时”，应用连词when。故填when。",
          "grammar_point": "定语从句/连词",
          "category": "attrib",
          "category_name": "定语从句",
          "fine_category": "attrib-adverb",
          "facets": {
            "type": "relative-adverb",
            "word": "when",
            "restrictive": true
          }
        },
        {
          "no": 42,
          "answer": "itself",
          "explanation": "考查反身代词。句意：在那一刻，历史本身仿佛也屏住了呼吸。此处指代主语history（历史）本身，应用反身代词itself，起强调作用。故填itself。",
          "grammar_point": "反身代词",
          "category": "pronoun",
          "category_name": "代词",
          "fine_category": "pron-personal",
          "facets": {
            "type": "personal"
          }
        },
        {
          "no": 43,
          "answer": "goes",
          "explanation": "考查动词时态和主谓一致。句意：当我离开剧院时，我无意中听到一位观众说“这是一种超越国界的美”。此处为定语从句，先行词为beauty（美），为不可数名词，定语从句的谓语动词应用第三人称单数形式，且句子描述的是观看演出时的感受，用一般现在时即可，故填goes。",
          "grammar_point": "动词时态和主谓一致",
          "category": "predicate",
          "category_name": "谓语动词",
          "fine_category": "pred-sva-form"
        },
        {
          "no": 44,
          "answer": "rooted",
          "explanation": "考查非谓语动词。句意：他的话加深了我的信念：植根于一种文化最优秀传统的艺术，具有打动任何人的永恒力量。分析句子结构可知，此处为非谓语动词作后置定语，be rooted in意为“植根于”，此处省略be动词，用过去分词短语作定语。故填rooted。",
          "grammar_point": "非谓语动词",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-done",
          "nonp_function": "attribute",
          "nonp_function_label": "作定语",
          "nonp_form": "done",
          "nonp_form_label": "done",
          "nonp_rule": "rooted 修饰 art，art 与 root in 是动宾关系，用 done 作后置定语。",
          "nonp_needs_review": false,
          "facets": {
            "form": "done"
          }
        },
        {
          "no": 45,
          "answer": "an",
          "explanation": "考查冠词。句意：这不仅仅是一本被赋予生命的古书——这是对中国智慧及其与世界分享精神的赞颂。ancient book为可数名词单数，空前无限定词，此处表示“一本古书”，为泛指，且ancient是以元音音素开头的单词，所以用不定冠词an。故填an。",
          "grammar_point": "冠词",
          "category": "article",
          "category_name": "冠词",
          "fine_category": "art-a-an",
          "facets": {
            "word": "a-an"
          }
        }
      ],
      "chinese_translation": "悉尼歌剧院的舞台上空飘荡着悠扬悦耳的音乐。柔和的灯光渐渐照亮了静止的劳动身影，仿佛从明代书卷中跃然而出。他们缓缓开始动作，伴随着轻柔的翻书声和潺潺流水声，优雅的姿态构成了一幅生动的劳动画卷。\n\n舞剧《天工开物》这令人屏息的开场，瞬间将我带入那个古老创造的世界。通过富有表现力的肢体语言，表演传达了这部著作的核心思想——珍视无数无名劳动者传承的技艺，以及实用工具的力量。金色田野与闪亮丝绸的美丽场景，让我感受到人与自然之间深厚的纽带。\n\n最动人的时刻是宋应星脱下官袍，踏入其他舞者构成的\"田野\"中。所有动作戛然而止，只留下他的身影，双臂向上伸展，沉默却充满力量。那一刻，连历史本身似乎都屏住了呼吸。\n\n离开剧院时，我听到一位观众说：\"这是超越国界的美。\"他的话加深了我的信念：植根于文化最优秀传统的艺术，拥有感动任何人的永恒力量。这不仅仅是一部古籍的活化呈现，更是对中国智慧及其与世界分享精神的礼赞。"
    },
    {
      "exam_id": "2026深圳一模",
      "year": 2026,
      "type": "模拟卷",
      "question_id": "56-65",
      "passage": "When I first opened _Where the Deer Hide in the Woods_, I felt as if I were stepping into a world ___36___ the author’s words flow like gentle music. The Tang poems, ___37___ (translate) with the master touch of Xu Yuanchong, speak softly in two voices — one Chinese, one English — each echoing (回响) with calm, beauty, and quiet ___38___ (deep).\n\nThe book ___39___ (divide) into six chapters, each unfolding a distinct landscape of emotion— sorrow, peace, love, longing, solitude, and reflection. I was ___40___ (genuine) moved when I read “The monkeys on both banks are still calling; my light boat has sailed past a thousand hills.” I fully ___41___ (sense) Li Bai’s liberated soul — his joy at being pardoned by the emperor — flowing through the lines.\n\nEach page of the book is enriched with thoughtful notes vivid background stories, and traditional Chinese brush-style ___42___ (illustration). Xu’s artful work transforms the rhythm (节奏) of Chinese poems ___43___ English music, a recreation that honors both the original and its new form.\n\n___44___ (read) this book feels like a journey through hearts and landscapes. For anyone who treasures poetry, painting, or the meeting of two cultures in perfect harmony, _Where the Deer Hide in the Woods_ is ___45___ must-read that beautifully serves as the bridge.",
      "blank_count": 10,
      "questions": [
        {
          "no": 36,
          "answer": "where",
          "explanation": "考查定语从句。句意：当我第一次翻开《林间鹿隐》时，仿佛踏入了一个作者文字如轻音乐般流淌的世界。空处引导限制性定语从句，先行词是world，在从句中作地点状语，故用关系副词where引导。故填where。",
          "grammar_point": "定语从句",
          "category": "attrib",
          "category_name": "定语从句",
          "fine_category": "attrib-adverb",
          "facets": {
            "type": "relative-adverb",
            "word": "where",
            "restrictive": true
          }
        },
        {
          "no": 37,
          "answer": "translated",
          "explanation": "考查非谓语动词。句意：这些唐诗，在许渊冲大师的笔触下被翻译出来，用两种声音轻声诉说——中文与英文——每一种都回荡着宁静、美感与深沉的底蕴。空处为非谓语动词作后置定语，修饰名词Tang poems，且Tang poems与translate之间是被动关系，故用过去分词。故填translated。",
          "grammar_point": "非谓语动词",
          "category": "nonpredicate",
          "category_name": "非谓语动词",
          "fine_category": "nonpred-done",
          "nonp_function": "attribute",
          "nonp_function_label": "作定语",
          "nonp_form": "done",
          "nonp_form_label": "done",
          "nonp_rule": "translated 修饰 Tang poems，poems 与 translate 是动宾关系，用 done 作后置定语。",
          "nonp_needs_review": false,
          "facets": {
            "form": "done"
          }
        },
        {
          "no": 38,
          "answer": "depth",
          "explanation": "考查名词。句意同上。空处为名词作宾语，deep的名词是depth，意为“深度”，不可数名词。故填depth。",
          "grammar_point": "名词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-noun",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 39,
          "answer": "is divided",
          "explanation": "考查时态和语态。句意：这本书被分为六个章节，每一章展现一种独特的情感意境：悲伤、安宁、爱、思念、孤独与沉思。空处作谓语，此处是对客观事实的描述，应用一般现在时，且主语the book与divide之间是被动关系，应用被动语态，又因主语是单数，be动词用is。故填is divided。",
          "grammar_point": "时态和语态",
          "category": "predicate",
          "category_name": "谓语动词",
          "fine_category": "pred-passive-form"
        },
        {
          "no": 40,
          "answer": "genuinely",
          "explanation": "考查副词。句意：当我读到“两岸猿声啼不住，轻舟已过万重山”时，我由衷地被打动。空处修饰动词moved，应填为副词作状语，genuine的副词是genuinely，意为“真正地”。故填genuinely。",
          "grammar_point": "副词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-adv",
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 41,
          "answer": "sensed",
          "explanation": "考查时态。句意：我真切地感受到了李白那自由豁达的灵魂——他被皇帝赦免后的喜悦——流淌在字里行间。空处作谓语，根据I was可知，此处应用一般过去时。故填sensed。",
          "grammar_point": "时态",
          "category": "predicate",
          "category_name": "谓语动词",
          "fine_category": "pred-tense-past-future"
        },
        {
          "no": 42,
          "answer": "illustrations",
          "explanation": "考查名词。句意：书中每一页都配有精心的注释、生动的背景故事与中国传统国画风格的插图。空处为名词作宾语，illustration意为“插图”，是可数名词，此处表示泛指，且没有冠词限定，应用复数形式。故填illustrations。",
          "grammar_point": "名词",
          "category": "number",
          "category_name": "名词/数词",
          "fine_category": "num-plural",
          "facets": {
            "type": "plural"
          }
        },
        {
          "no": 43,
          "answer": "into",
          "explanation": "考查介词。句意：许渊冲巧妙地将中国诗歌的韵律转化为英文的音乐美，这种再创作既尊重原作，又赋予其新的形式。transform…into…是固定短语，意为“把……转化为……”。故填into。",
          "grammar_point": "介词",
          "category": "preposition",
          "category_name": "介词",
          "fine_category": "prep-collocation",
          "facets": {
            "word": "into"
          }
        },
        {
          "no": 44,
          "answer": "Reading",
          "explanation": "考查非谓语动词。句意：阅读这本书，就像一场穿越心灵与山水的旅程。空处为非谓语动词作主语，应用动名词形式，句首首字母应大写。故填Reading。",
          "grammar_point": "非谓语动词",
          "category": "word",
          "category_name": "词性转换",
          "fine_category": "word-noun",
          "nonp_function": "subject_predicative",
          "nonp_function_label": "作主语 / 表语",
          "nonp_form": "doing",
          "nonp_form_label": "doing",
          "nonp_rule": "Reading 是动名词作主语，表示“阅读这本书”这一动作整体。",
          "nonp_needs_review": false,
          "facets": {
            "subtype": "derivation"
          }
        },
        {
          "no": 45,
          "answer": "a",
          "explanation": "考查冠词。句意：对于任何珍爱诗歌、绘画，或是珍视两种文化完美交融的人来说，《林间鹿隐》都是一本必读之作，它优美地担当起了桥梁的作用。must-read是可数名词，意为“必读书目”，此处表示泛指，且must-read是以辅音音素开头，应用不定冠词a修饰。故填a。",
          "grammar_point": "冠词",
          "category": "article",
          "category_name": "冠词",
          "fine_category": "art-a-an",
          "facets": {
            "word": "a-an"
          }
        }
      ],
      "chinese_translation": "初次翻开《林深见鹿》时，我仿佛踏入了一个作者文字如轻柔音乐般流淌的世界。许渊冲先生以大师手笔翻译的唐诗，用中英双语轻声低语，两种语言相互呼应，洋溢着宁静、优美与深邃。\n\n全书分为六个章节，每个章节展开独特的情感画卷——悲伤、平和、爱恋、渴望、孤独与沉思。读到\"两岸猿声啼不住，轻舟已过万重山\"时，我深受感动，真切感受到李白获得赦免后那解放的灵魂在字里行间流淌。\n\n书中每一页都配有精心撰写的注释、生动的背景故事以及传统水墨风格的插图。许先生的艺术创作将中文诗歌的韵律转化为英文的音乐，这种再创作既尊重了原作，也赋予了新形式以生命。\n\n阅读这本书就像一场穿越心灵与风景的旅程。对于珍视诗歌、绘画或两种文化完美交融的读者而言，《林深见鹿》是一本必读之作，它优美地架起了沟通的桥梁。"
    }
  ],
  "questions": [
    {
      "id": "2023全国一卷-56",
      "exam_id": "2023全国一卷",
      "year": 2023,
      "type": "真题",
      "no": 56,
      "answer": "tasty",
      "explanation": "考查形容词。句意：小笼包(汤包)，那些精致的饺子皮，包裹着热腾腾的美味汤和甜甜的鲜肉，是我最喜欢的中国街头小吃。形容词需修饰后面的名词soup(汤)，故空格需用tasty\"美味的\"作定语，故填tasty。",
      "grammar_point": "形容词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "Xiao long bao (soup dumplings), those amazing constructions of delicate dumpling wrappers, encasing hot, ___56___ (taste) soup and sweet, fresh meat, are far and away my favorite Chinese street food. The dumplings arrive steaming and dangerously hot. To eat one, you have to decide whether ___57___ (bite) a small hole in it first, releasing the stream and risking a spill (溢出), ___58___ to put the whole dumpling in your mouth, letting the hot soup explode on your tongue. Shanghai may be the ___59___ (recognize) home of the soup dumplings but food historians will actually point you to the neighboring canal town of Nanxiang as Xiao long bao's birthplace. There you will find them prepared differently --- more dumpling and less soup, and the wrappers are pressed ___60___ hand rather than rolled. Nanxiang aside, the best Xiao long bao have a fine skin, allowing them ___61___ (lift) out of the steamer basket without tearing or spilling any of ___62___ (they) contents. The meat should be fresh with ___63___ touch of sweetness and the soup hot, clear and delicious.\n\nNo matter where I buy them, one steamer is ___64___ (rare) enough, yet two seems greedy, so I am always left ___65___ (want) more next time.",
      "fine_category": "word-adj",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2023全国一卷-57",
      "exam_id": "2023全国一卷",
      "year": 2023,
      "type": "真题",
      "no": 57,
      "answer": "to bite",
      "explanation": "考查非谓语动词。句意：吃小笼包的时候，你必须要决定是先咬一个小口流出汤汁，还是把整个小笼包放进嘴里，让热汤在舌头上爆炸。decide to do sth.\"决定做某事\"，用不定式作宾语，空处与后面to put并列作宾语，故填to bite。",
      "grammar_point": "非谓语动词",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "Xiao long bao (soup dumplings), those amazing constructions of delicate dumpling wrappers, encasing hot, ___56___ (taste) soup and sweet, fresh meat, are far and away my favorite Chinese street food. The dumplings arrive steaming and dangerously hot. To eat one, you have to decide whether ___57___ (bite) a small hole in it first, releasing the stream and risking a spill (溢出), ___58___ to put the whole dumpling in your mouth, letting the hot soup explode on your tongue. Shanghai may be the ___59___ (recognize) home of the soup dumplings but food historians will actually point you to the neighboring canal town of Nanxiang as Xiao long bao's birthplace. There you will find them prepared differently --- more dumpling and less soup, and the wrappers are pressed ___60___ hand rather than rolled. Nanxiang aside, the best Xiao long bao have a fine skin, allowing them ___61___ (lift) out of the steamer basket without tearing or spilling any of ___62___ (they) contents. The meat should be fresh with ___63___ touch of sweetness and the soup hot, clear and delicious.\n\nNo matter where I buy them, one steamer is ___64___ (rare) enough, yet two seems greedy, so I am always left ___65___ (want) more next time.",
      "fine_category": "nonpred-to-do",
      "nonp_function": "object",
      "nonp_function_label": "作宾语",
      "nonp_form": "to_do",
      "nonp_form_label": "to do",
      "nonp_rule": "特定动词 decide 后接 to do 作宾语，空格与后面的 to put 并列。",
      "nonp_needs_review": false,
      "facets": {
        "form": "to-do"
      }
    },
    {
      "id": "2023全国一卷-58",
      "exam_id": "2023全国一卷",
      "year": 2023,
      "type": "真题",
      "no": 58,
      "answer": "or",
      "explanation": "考查连词。句意：吃小笼包的时候，你必须要决定是先咬一个小口流出汤汁，还是把整个小笼包放进嘴里，让热汤在舌头上爆炸。whether...or... \"是......还是......\"，固定搭配，根据句意，故填or。",
      "grammar_point": "连词",
      "category": "logic",
      "category_name": "逻辑连词",
      "passage": "Xiao long bao (soup dumplings), those amazing constructions of delicate dumpling wrappers, encasing hot, ___56___ (taste) soup and sweet, fresh meat, are far and away my favorite Chinese street food. The dumplings arrive steaming and dangerously hot. To eat one, you have to decide whether ___57___ (bite) a small hole in it first, releasing the stream and risking a spill (溢出), ___58___ to put the whole dumpling in your mouth, letting the hot soup explode on your tongue. Shanghai may be the ___59___ (recognize) home of the soup dumplings but food historians will actually point you to the neighboring canal town of Nanxiang as Xiao long bao's birthplace. There you will find them prepared differently --- more dumpling and less soup, and the wrappers are pressed ___60___ hand rather than rolled. Nanxiang aside, the best Xiao long bao have a fine skin, allowing them ___61___ (lift) out of the steamer basket without tearing or spilling any of ___62___ (they) contents. The meat should be fresh with ___63___ touch of sweetness and the soup hot, clear and delicious.\n\nNo matter where I buy them, one steamer is ___64___ (rare) enough, yet two seems greedy, so I am always left ___65___ (want) more next time.",
      "fine_category": "logic-coordinating",
      "facets": {
        "word": "or",
        "kind": "correlative"
      }
    },
    {
      "id": "2023全国一卷-59",
      "exam_id": "2023全国一卷",
      "year": 2023,
      "type": "真题",
      "no": 59,
      "answer": "recognized",
      "explanation": "考查非谓语动词。句意：上海可能是公认的小笼包之乡，但美食历史学家会告诉你，邻近的运河小镇南翔才是小笼包的发源地。空格在名词home前面作定语，recognize与home是逻辑上动宾关系，需填过去分词recognized作定语，recognized\"被公认的\"也可以看作是形容词作定语，故填recognized。",
      "grammar_point": "非谓语动词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "Xiao long bao (soup dumplings), those amazing constructions of delicate dumpling wrappers, encasing hot, ___56___ (taste) soup and sweet, fresh meat, are far and away my favorite Chinese street food. The dumplings arrive steaming and dangerously hot. To eat one, you have to decide whether ___57___ (bite) a small hole in it first, releasing the stream and risking a spill (溢出), ___58___ to put the whole dumpling in your mouth, letting the hot soup explode on your tongue. Shanghai may be the ___59___ (recognize) home of the soup dumplings but food historians will actually point you to the neighboring canal town of Nanxiang as Xiao long bao's birthplace. There you will find them prepared differently --- more dumpling and less soup, and the wrappers are pressed ___60___ hand rather than rolled. Nanxiang aside, the best Xiao long bao have a fine skin, allowing them ___61___ (lift) out of the steamer basket without tearing or spilling any of ___62___ (they) contents. The meat should be fresh with ___63___ touch of sweetness and the soup hot, clear and delicious.\n\nNo matter where I buy them, one steamer is ___64___ (rare) enough, yet two seems greedy, so I am always left ___65___ (want) more next time.",
      "fine_category": "word-adj",
      "nonp_function": "attribute",
      "nonp_function_label": "作定语",
      "nonp_form": "done",
      "nonp_form_label": "done",
      "nonp_rule": "recognized 修饰 home，home 与 recognize 是动宾关系，用 done 作前置定语。",
      "nonp_needs_review": false,
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2023全国一卷-60",
      "exam_id": "2023全国一卷",
      "year": 2023,
      "type": "真题",
      "no": 60,
      "answer": "by",
      "explanation": "考查介词。句意：在那里，你会发现它们的制作方式不同------更多汤包，更少的汤，包子皮是用手压的，而不是擀出来的。by hand\"用手\"是固定搭配，根据句意，故填by。",
      "grammar_point": "介词",
      "category": "preposition",
      "category_name": "介词",
      "passage": "Xiao long bao (soup dumplings), those amazing constructions of delicate dumpling wrappers, encasing hot, ___56___ (taste) soup and sweet, fresh meat, are far and away my favorite Chinese street food. The dumplings arrive steaming and dangerously hot. To eat one, you have to decide whether ___57___ (bite) a small hole in it first, releasing the stream and risking a spill (溢出), ___58___ to put the whole dumpling in your mouth, letting the hot soup explode on your tongue. Shanghai may be the ___59___ (recognize) home of the soup dumplings but food historians will actually point you to the neighboring canal town of Nanxiang as Xiao long bao's birthplace. There you will find them prepared differently --- more dumpling and less soup, and the wrappers are pressed ___60___ hand rather than rolled. Nanxiang aside, the best Xiao long bao have a fine skin, allowing them ___61___ (lift) out of the steamer basket without tearing or spilling any of ___62___ (they) contents. The meat should be fresh with ___63___ touch of sweetness and the soup hot, clear and delicious.\n\nNo matter where I buy them, one steamer is ___64___ (rare) enough, yet two seems greedy, so I am always left ___65___ (want) more next time.",
      "fine_category": "prep-other",
      "facets": {
        "word": "by"
      }
    },
    {
      "id": "2023全国一卷-61",
      "exam_id": "2023全国一卷",
      "year": 2023,
      "type": "真题",
      "no": 61,
      "answer": "to be lifted",
      "explanation": "考查非谓语动词。句意：除了南翔，最好的小笼包有一个精致的，可以让它们从蒸笼篮中拿出来，而不会撕裂或溢出里面的东西。根据搭配allow sb. to do sth.\"允许某人做某事\"可知，空格需用动词不定式作宾语补足语，补足语lift out与宾语them（指代小笼包）是逻辑上的动宾关系，空格需填动词不定式的被动式to be lifted，故填to be lifted。",
      "grammar_point": "非谓语动词",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "Xiao long bao (soup dumplings), those amazing constructions of delicate dumpling wrappers, encasing hot, ___56___ (taste) soup and sweet, fresh meat, are far and away my favorite Chinese street food. The dumplings arrive steaming and dangerously hot. To eat one, you have to decide whether ___57___ (bite) a small hole in it first, releasing the stream and risking a spill (溢出), ___58___ to put the whole dumpling in your mouth, letting the hot soup explode on your tongue. Shanghai may be the ___59___ (recognize) home of the soup dumplings but food historians will actually point you to the neighboring canal town of Nanxiang as Xiao long bao's birthplace. There you will find them prepared differently --- more dumpling and less soup, and the wrappers are pressed ___60___ hand rather than rolled. Nanxiang aside, the best Xiao long bao have a fine skin, allowing them ___61___ (lift) out of the steamer basket without tearing or spilling any of ___62___ (they) contents. The meat should be fresh with ___63___ touch of sweetness and the soup hot, clear and delicious.\n\nNo matter where I buy them, one steamer is ___64___ (rare) enough, yet two seems greedy, so I am always left ___65___ (want) more next time.",
      "fine_category": "nonpred-done",
      "nonp_function": "complement",
      "nonp_function_label": "作补语",
      "nonp_form": "to_be_done",
      "nonp_form_label": "to be done",
      "nonp_rule": "allow 后接宾语补足语；them 与 lift out 是动宾关系，所以用 to be done。",
      "nonp_needs_review": false,
      "facets": {
        "form": "done"
      }
    },
    {
      "id": "2023全国一卷-62",
      "exam_id": "2023全国一卷",
      "year": 2023,
      "type": "真题",
      "no": 62,
      "answer": "their",
      "explanation": "考查代词。句意：除了南翔，最好的小笼包有一个精致的外皮，可以让它们从蒸笼篮中拿出来，而不会撕裂或溢出里面的东西。修饰后面的名词contents(东西)需用形容词性物主代词their，故填their。",
      "grammar_point": "代词",
      "category": "pronoun",
      "category_name": "代词",
      "passage": "Xiao long bao (soup dumplings), those amazing constructions of delicate dumpling wrappers, encasing hot, ___56___ (taste) soup and sweet, fresh meat, are far and away my favorite Chinese street food. The dumplings arrive steaming and dangerously hot. To eat one, you have to decide whether ___57___ (bite) a small hole in it first, releasing the stream and risking a spill (溢出), ___58___ to put the whole dumpling in your mouth, letting the hot soup explode on your tongue. Shanghai may be the ___59___ (recognize) home of the soup dumplings but food historians will actually point you to the neighboring canal town of Nanxiang as Xiao long bao's birthplace. There you will find them prepared differently --- more dumpling and less soup, and the wrappers are pressed ___60___ hand rather than rolled. Nanxiang aside, the best Xiao long bao have a fine skin, allowing them ___61___ (lift) out of the steamer basket without tearing or spilling any of ___62___ (they) contents. The meat should be fresh with ___63___ touch of sweetness and the soup hot, clear and delicious.\n\nNo matter where I buy them, one steamer is ___64___ (rare) enough, yet two seems greedy, so I am always left ___65___ (want) more next time.",
      "fine_category": "pron-personal",
      "facets": {
        "type": "personal"
      }
    },
    {
      "id": "2023全国一卷-63",
      "exam_id": "2023全国一卷",
      "year": 2023,
      "type": "真题",
      "no": 63,
      "answer": "a",
      "explanation": "考查冠词。句意：肉应该是新鲜的，有一点甜味，汤应该是热的，清澈的，美味的。a touch of \"一点点；稍许\"，常用搭配，touch\"轻微；稍许\"常用作单数，故填a。",
      "grammar_point": "冠词",
      "category": "article",
      "category_name": "冠词",
      "passage": "Xiao long bao (soup dumplings), those amazing constructions of delicate dumpling wrappers, encasing hot, ___56___ (taste) soup and sweet, fresh meat, are far and away my favorite Chinese street food. The dumplings arrive steaming and dangerously hot. To eat one, you have to decide whether ___57___ (bite) a small hole in it first, releasing the stream and risking a spill (溢出), ___58___ to put the whole dumpling in your mouth, letting the hot soup explode on your tongue. Shanghai may be the ___59___ (recognize) home of the soup dumplings but food historians will actually point you to the neighboring canal town of Nanxiang as Xiao long bao's birthplace. There you will find them prepared differently --- more dumpling and less soup, and the wrappers are pressed ___60___ hand rather than rolled. Nanxiang aside, the best Xiao long bao have a fine skin, allowing them ___61___ (lift) out of the steamer basket without tearing or spilling any of ___62___ (they) contents. The meat should be fresh with ___63___ touch of sweetness and the soup hot, clear and delicious.\n\nNo matter where I buy them, one steamer is ___64___ (rare) enough, yet two seems greedy, so I am always left ___65___ (want) more next time.",
      "fine_category": "art-a-an",
      "facets": {
        "word": "a-an"
      }
    },
    {
      "id": "2023全国一卷-64",
      "exam_id": "2023全国一卷",
      "year": 2023,
      "type": "真题",
      "no": 64,
      "answer": "rarely",
      "explanation": "考查副词。句意：无论我在哪里买，一蒸笼都不够，而两蒸笼又显得太贪心了，所以我总是想下次再买。修饰形容词用副词作状语，rarely\"少有\"，故填rarely。",
      "grammar_point": "副词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "Xiao long bao (soup dumplings), those amazing constructions of delicate dumpling wrappers, encasing hot, ___56___ (taste) soup and sweet, fresh meat, are far and away my favorite Chinese street food. The dumplings arrive steaming and dangerously hot. To eat one, you have to decide whether ___57___ (bite) a small hole in it first, releasing the stream and risking a spill (溢出), ___58___ to put the whole dumpling in your mouth, letting the hot soup explode on your tongue. Shanghai may be the ___59___ (recognize) home of the soup dumplings but food historians will actually point you to the neighboring canal town of Nanxiang as Xiao long bao's birthplace. There you will find them prepared differently --- more dumpling and less soup, and the wrappers are pressed ___60___ hand rather than rolled. Nanxiang aside, the best Xiao long bao have a fine skin, allowing them ___61___ (lift) out of the steamer basket without tearing or spilling any of ___62___ (they) contents. The meat should be fresh with ___63___ touch of sweetness and the soup hot, clear and delicious.\n\nNo matter where I buy them, one steamer is ___64___ (rare) enough, yet two seems greedy, so I am always left ___65___ (want) more next time.",
      "fine_category": "word-adv",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2023全国一卷-65",
      "exam_id": "2023全国一卷",
      "year": 2023,
      "type": "真题",
      "no": 65,
      "answer": "wanting",
      "explanation": "考查非谓语动词。句意：无论我在哪里买，一蒸笼都不够，而两蒸笼又显得太贪心了，所以我总是想下次再买。分析句子可知，此处考查\"leave sb.+宾语补足语\"，本句是被动语态，want是主语补足语，根据句意，I与want之间是主动的逻辑关系，用现在分词wanting，故填wanting。",
      "grammar_point": "非谓语动词",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "Xiao long bao (soup dumplings), those amazing constructions of delicate dumpling wrappers, encasing hot, ___56___ (taste) soup and sweet, fresh meat, are far and away my favorite Chinese street food. The dumplings arrive steaming and dangerously hot. To eat one, you have to decide whether ___57___ (bite) a small hole in it first, releasing the stream and risking a spill (溢出), ___58___ to put the whole dumpling in your mouth, letting the hot soup explode on your tongue. Shanghai may be the ___59___ (recognize) home of the soup dumplings but food historians will actually point you to the neighboring canal town of Nanxiang as Xiao long bao's birthplace. There you will find them prepared differently --- more dumpling and less soup, and the wrappers are pressed ___60___ hand rather than rolled. Nanxiang aside, the best Xiao long bao have a fine skin, allowing them ___61___ (lift) out of the steamer basket without tearing or spilling any of ___62___ (they) contents. The meat should be fresh with ___63___ touch of sweetness and the soup hot, clear and delicious.\n\nNo matter where I buy them, one steamer is ___64___ (rare) enough, yet two seems greedy, so I am always left ___65___ (want) more next time.",
      "fine_category": "nonpred-doing",
      "nonp_function": "complement",
      "nonp_function_label": "作补语",
      "nonp_form": "doing",
      "nonp_form_label": "doing",
      "nonp_rule": "be left 后接主语补足语，I 与 want 是主谓关系，用 doing 表主动状态。",
      "nonp_needs_review": false,
      "facets": {
        "form": "doing"
      }
    },
    {
      "id": "2023全国二卷-56",
      "exam_id": "2023全国二卷",
      "year": 2023,
      "type": "真题",
      "no": 56,
      "answer": "arrival",
      "explanation": "考查名词。句意：从2017年6月开始，就在两只新大熊猫\"萌萌\"和\"娇青\"到来之前，我一直在帮助动物园的熊猫饲养员更舒服、更自信地说英语。分析句子结构可知，空前是冠词，空后是介词，所以空处应填名词作介词before的宾语，arrive的名词形式是arrival，不可数名词。故填arrival。",
      "grammar_point": "名词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "Whenever I tell people that I teach English at the Berlin Zoo, I almost always get a questioning look. Behind it, the person is trying to figure out who exactly I teach...the animals?\n\nSince June 2017, right before the ___56___ (arrive) of the two new pandas, Meng Meng and Jiao Qing, I have been helping the panda keepers at the zoo to feel more comfortable and ___57___ (confidence) speaking English. And who do they speak English ___58___?\n\nNot the pandas, even though ___59___ language used for the medical training instructions is actually English. They talk to the flood of international tourists and to ___60___ (visit) Chinese zookeepers who often come to check on the pandas, which are on loan from China. They also need to be ready to give ___61___ (interview) in English with international journalists. This is ___62___ they need an English trainer.\n\nSo, what are they learning? ___63___ (basic), how to describe a panda's life. It's been an honor to watch the panda programme develop ___64___ to see the pandas settle into their new home. As a little girl, I ___65___ (wish) to be a zookeeper when I grew up. Now, I'm living out that dream indirectly by helping the panda keepers do their job in English.",
      "fine_category": "word-noun",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2023全国二卷-57",
      "exam_id": "2023全国二卷",
      "year": 2023,
      "type": "真题",
      "no": 57,
      "answer": "confident",
      "explanation": "考查形容词。句意：从2017年6月开始，就在两只新大熊猫\"萌萌\"和\"娇青\"到来之前，我一直在帮助动物园的熊猫饲养员更舒服、更自信地说英语。分析句子结构可知，空处和前文的comfortable并列，作并列表语，应用形容词形式，confidence的形容词形式是confident。故填confident。",
      "grammar_point": "形容词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "Whenever I tell people that I teach English at the Berlin Zoo, I almost always get a questioning look. Behind it, the person is trying to figure out who exactly I teach...the animals?\n\nSince June 2017, right before the ___56___ (arrive) of the two new pandas, Meng Meng and Jiao Qing, I have been helping the panda keepers at the zoo to feel more comfortable and ___57___ (confidence) speaking English. And who do they speak English ___58___?\n\nNot the pandas, even though ___59___ language used for the medical training instructions is actually English. They talk to the flood of international tourists and to ___60___ (visit) Chinese zookeepers who often come to check on the pandas, which are on loan from China. They also need to be ready to give ___61___ (interview) in English with international journalists. This is ___62___ they need an English trainer.\n\nSo, what are they learning? ___63___ (basic), how to describe a panda's life. It's been an honor to watch the panda programme develop ___64___ to see the pandas settle into their new home. As a little girl, I ___65___ (wish) to be a zookeeper when I grew up. Now, I'm living out that dream indirectly by helping the panda keepers do their job in English.",
      "fine_category": "word-adj",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2023全国二卷-58",
      "exam_id": "2023全国二卷",
      "year": 2023,
      "type": "真题",
      "no": 58,
      "answer": "with",
      "explanation": "考查介词。句意：他们和谁说英语？分析句子结构可知，这道题的语序可以看成they speak English [ ]{.underline} who，句子中有主语they，speak后有宾语，而who缺少一个介词，who做介词的宾语，又根据句意可推知，此处强调\"与某人交流\"，应用固定搭配：speak with sb.。故填with。",
      "grammar_point": "介词",
      "category": "preposition",
      "category_name": "介词",
      "passage": "Whenever I tell people that I teach English at the Berlin Zoo, I almost always get a questioning look. Behind it, the person is trying to figure out who exactly I teach...the animals?\n\nSince June 2017, right before the ___56___ (arrive) of the two new pandas, Meng Meng and Jiao Qing, I have been helping the panda keepers at the zoo to feel more comfortable and ___57___ (confidence) speaking English. And who do they speak English ___58___?\n\nNot the pandas, even though ___59___ language used for the medical training instructions is actually English. They talk to the flood of international tourists and to ___60___ (visit) Chinese zookeepers who often come to check on the pandas, which are on loan from China. They also need to be ready to give ___61___ (interview) in English with international journalists. This is ___62___ they need an English trainer.\n\nSo, what are they learning? ___63___ (basic), how to describe a panda's life. It's been an honor to watch the panda programme develop ___64___ to see the pandas settle into their new home. As a little girl, I ___65___ (wish) to be a zookeeper when I grew up. Now, I'm living out that dream indirectly by helping the panda keepers do their job in English.",
      "fine_category": "prep-common",
      "facets": {
        "word": "with"
      }
    },
    {
      "id": "2023全国二卷-59",
      "exam_id": "2023全国二卷",
      "year": 2023,
      "type": "真题",
      "no": 59,
      "answer": "the",
      "explanation": "考查冠词。句意：不是熊猫，尽管医学训练指导使用的语言实际上是英语。分析句子结构可知，此处特指用于医学训练指导使用的语言，表特指，应用定冠词修饰。故填the。",
      "grammar_point": "冠词",
      "category": "article",
      "category_name": "冠词",
      "passage": "Whenever I tell people that I teach English at the Berlin Zoo, I almost always get a questioning look. Behind it, the person is trying to figure out who exactly I teach...the animals?\n\nSince June 2017, right before the ___56___ (arrive) of the two new pandas, Meng Meng and Jiao Qing, I have been helping the panda keepers at the zoo to feel more comfortable and ___57___ (confidence) speaking English. And who do they speak English ___58___?\n\nNot the pandas, even though ___59___ language used for the medical training instructions is actually English. They talk to the flood of international tourists and to ___60___ (visit) Chinese zookeepers who often come to check on the pandas, which are on loan from China. They also need to be ready to give ___61___ (interview) in English with international journalists. This is ___62___ they need an English trainer.\n\nSo, what are they learning? ___63___ (basic), how to describe a panda's life. It's been an honor to watch the panda programme develop ___64___ to see the pandas settle into their new home. As a little girl, I ___65___ (wish) to be a zookeeper when I grew up. Now, I'm living out that dream indirectly by helping the panda keepers do their job in English.",
      "fine_category": "art-the",
      "facets": {
        "word": "the"
      }
    },
    {
      "id": "2023全国二卷-60",
      "exam_id": "2023全国二卷",
      "year": 2023,
      "type": "真题",
      "no": 60,
      "answer": "visiting",
      "explanation": "考查形容词。句意：他们与蜂拥而至的国际游客和来访的中国动物园管理员交谈，这些管理员经常来检查从中国租借来的大熊猫。分析句子结构可知，空后是名词，所以空处应填形容词作定语；visit对应的形容词为visiting\"来访的\"。故填visiting。",
      "grammar_point": "形容词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "Whenever I tell people that I teach English at the Berlin Zoo, I almost always get a questioning look. Behind it, the person is trying to figure out who exactly I teach...the animals?\n\nSince June 2017, right before the ___56___ (arrive) of the two new pandas, Meng Meng and Jiao Qing, I have been helping the panda keepers at the zoo to feel more comfortable and ___57___ (confidence) speaking English. And who do they speak English ___58___?\n\nNot the pandas, even though ___59___ language used for the medical training instructions is actually English. They talk to the flood of international tourists and to ___60___ (visit) Chinese zookeepers who often come to check on the pandas, which are on loan from China. They also need to be ready to give ___61___ (interview) in English with international journalists. This is ___62___ they need an English trainer.\n\nSo, what are they learning? ___63___ (basic), how to describe a panda's life. It's been an honor to watch the panda programme develop ___64___ to see the pandas settle into their new home. As a little girl, I ___65___ (wish) to be a zookeeper when I grew up. Now, I'm living out that dream indirectly by helping the panda keepers do their job in English.",
      "fine_category": "word-adj",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2023全国二卷-61",
      "exam_id": "2023全国二卷",
      "year": 2023,
      "type": "真题",
      "no": 61,
      "answer": "interviews",
      "explanation": "考查名词的数。句意：他们还需要准备好用英语接受国际记者的采访。分析句子结构可知，空前是动词，所以空处应填名词作宾语，interview意为\"采访\"为可数名词，不止一段采访，应用复数形式。故填interviews。",
      "grammar_point": "名词的数",
      "category": "number",
      "category_name": "名词/数词",
      "passage": "Whenever I tell people that I teach English at the Berlin Zoo, I almost always get a questioning look. Behind it, the person is trying to figure out who exactly I teach...the animals?\n\nSince June 2017, right before the ___56___ (arrive) of the two new pandas, Meng Meng and Jiao Qing, I have been helping the panda keepers at the zoo to feel more comfortable and ___57___ (confidence) speaking English. And who do they speak English ___58___?\n\nNot the pandas, even though ___59___ language used for the medical training instructions is actually English. They talk to the flood of international tourists and to ___60___ (visit) Chinese zookeepers who often come to check on the pandas, which are on loan from China. They also need to be ready to give ___61___ (interview) in English with international journalists. This is ___62___ they need an English trainer.\n\nSo, what are they learning? ___63___ (basic), how to describe a panda's life. It's been an honor to watch the panda programme develop ___64___ to see the pandas settle into their new home. As a little girl, I ___65___ (wish) to be a zookeeper when I grew up. Now, I'm living out that dream indirectly by helping the panda keepers do their job in English.",
      "fine_category": "num-plural",
      "facets": {
        "type": "plural"
      }
    },
    {
      "id": "2023全国二卷-62",
      "exam_id": "2023全国二卷",
      "year": 2023,
      "type": "真题",
      "no": 62,
      "answer": "why",
      "explanation": "考查表语从句。句意：这就是他们需要英语培训师的原因。分析句子结构可知，空处引导表语从句，从句中结构完整，应该用连接副词连接，前文提到需要培训师的原因，此处是表达\"这就是他们需要英语培训师的原因\"之意，应用why引导表语从句。故填why。",
      "grammar_point": "表语从句",
      "category": "nounclause",
      "category_name": "名词性从句",
      "passage": "Whenever I tell people that I teach English at the Berlin Zoo, I almost always get a questioning look. Behind it, the person is trying to figure out who exactly I teach...the animals?\n\nSince June 2017, right before the ___56___ (arrive) of the two new pandas, Meng Meng and Jiao Qing, I have been helping the panda keepers at the zoo to feel more comfortable and ___57___ (confidence) speaking English. And who do they speak English ___58___?\n\nNot the pandas, even though ___59___ language used for the medical training instructions is actually English. They talk to the flood of international tourists and to ___60___ (visit) Chinese zookeepers who often come to check on the pandas, which are on loan from China. They also need to be ready to give ___61___ (interview) in English with international journalists. This is ___62___ they need an English trainer.\n\nSo, what are they learning? ___63___ (basic), how to describe a panda's life. It's been an honor to watch the panda programme develop ___64___ to see the pandas settle into their new home. As a little girl, I ___65___ (wish) to be a zookeeper when I grew up. Now, I'm living out that dream indirectly by helping the panda keepers do their job in English.",
      "fine_category": "nounc-wh-adverb",
      "facets": {
        "type": "wh-adverb",
        "word": "why"
      }
    },
    {
      "id": "2023全国二卷-63",
      "exam_id": "2023全国二卷",
      "year": 2023,
      "type": "真题",
      "no": 63,
      "answer": "Basically",
      "explanation": "考查副词。句意：基本上，如何描述熊猫的生活。分析句子结构可知，空处修饰空后整个句子，应该用副词修饰，basic的副词形式是basically位于句首，首字母应大写。故填Basically。",
      "grammar_point": "副词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "Whenever I tell people that I teach English at the Berlin Zoo, I almost always get a questioning look. Behind it, the person is trying to figure out who exactly I teach...the animals?\n\nSince June 2017, right before the ___56___ (arrive) of the two new pandas, Meng Meng and Jiao Qing, I have been helping the panda keepers at the zoo to feel more comfortable and ___57___ (confidence) speaking English. And who do they speak English ___58___?\n\nNot the pandas, even though ___59___ language used for the medical training instructions is actually English. They talk to the flood of international tourists and to ___60___ (visit) Chinese zookeepers who often come to check on the pandas, which are on loan from China. They also need to be ready to give ___61___ (interview) in English with international journalists. This is ___62___ they need an English trainer.\n\nSo, what are they learning? ___63___ (basic), how to describe a panda's life. It's been an honor to watch the panda programme develop ___64___ to see the pandas settle into their new home. As a little girl, I ___65___ (wish) to be a zookeeper when I grew up. Now, I'm living out that dream indirectly by helping the panda keepers do their job in English.",
      "fine_category": "word-adv",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2023全国二卷-64",
      "exam_id": "2023全国二卷",
      "year": 2023,
      "type": "真题",
      "no": 64,
      "answer": "and",
      "explanation": "考查连词。句意：我很荣幸能看到熊猫项目的发展，看到熊猫们在新家安顿下来。分析句子结构可知，\"to watch the panda programme develop\"和\"to see the pandas settle into their new home\"两者是并列关系，应该用and连接。故填and。",
      "grammar_point": "连词",
      "category": "logic",
      "category_name": "逻辑连词",
      "passage": "Whenever I tell people that I teach English at the Berlin Zoo, I almost always get a questioning look. Behind it, the person is trying to figure out who exactly I teach...the animals?\n\nSince June 2017, right before the ___56___ (arrive) of the two new pandas, Meng Meng and Jiao Qing, I have been helping the panda keepers at the zoo to feel more comfortable and ___57___ (confidence) speaking English. And who do they speak English ___58___?\n\nNot the pandas, even though ___59___ language used for the medical training instructions is actually English. They talk to the flood of international tourists and to ___60___ (visit) Chinese zookeepers who often come to check on the pandas, which are on loan from China. They also need to be ready to give ___61___ (interview) in English with international journalists. This is ___62___ they need an English trainer.\n\nSo, what are they learning? ___63___ (basic), how to describe a panda's life. It's been an honor to watch the panda programme develop ___64___ to see the pandas settle into their new home. As a little girl, I ___65___ (wish) to be a zookeeper when I grew up. Now, I'm living out that dream indirectly by helping the panda keepers do their job in English.",
      "fine_category": "logic-coordinating",
      "facets": {
        "word": "and",
        "kind": "coordinating"
      }
    },
    {
      "id": "2023全国二卷-65",
      "exam_id": "2023全国二卷",
      "year": 2023,
      "type": "真题",
      "no": 65,
      "answer": "wished",
      "explanation": "考查动词时态。句意：作为一个小女孩，我希望长大后成为一名动物园管理员。分析句子结构可知，本句缺少谓语动词，所以wish作本句谓语，和主语I之间是主动关系，根据后文的grew可知用一般过去时。故填wished。",
      "grammar_point": "动词时态",
      "category": "predicate",
      "category_name": "谓语动词",
      "passage": "Whenever I tell people that I teach English at the Berlin Zoo, I almost always get a questioning look. Behind it, the person is trying to figure out who exactly I teach...the animals?\n\nSince June 2017, right before the ___56___ (arrive) of the two new pandas, Meng Meng and Jiao Qing, I have been helping the panda keepers at the zoo to feel more comfortable and ___57___ (confidence) speaking English. And who do they speak English ___58___?\n\nNot the pandas, even though ___59___ language used for the medical training instructions is actually English. They talk to the flood of international tourists and to ___60___ (visit) Chinese zookeepers who often come to check on the pandas, which are on loan from China. They also need to be ready to give ___61___ (interview) in English with international journalists. This is ___62___ they need an English trainer.\n\nSo, what are they learning? ___63___ (basic), how to describe a panda's life. It's been an honor to watch the panda programme develop ___64___ to see the pandas settle into their new home. As a little girl, I ___65___ (wish) to be a zookeeper when I grew up. Now, I'm living out that dream indirectly by helping the panda keepers do their job in English.",
      "fine_category": "pred-tense-past-future"
    },
    {
      "id": "2023浙江首考-56",
      "exam_id": "2023浙江首考",
      "year": 2023,
      "type": "真题",
      "no": 56,
      "answer": "and",
      "explanation": "考查并列连词。空格连接 planned the city of Beijing 和 arranged the residential areas 两个并列谓语动作，表示顺承关系，应用 and。",
      "grammar_point": "连词",
      "category": "logic",
      "category_name": "逻辑连词",
      "passage": "During China's dynastic period, emperors planned the city of Beijing ___56___ arranged the residential areas according to social classes. The term \"hutong\", ___57___ (original) meaning \"water well\" in Mongolian, appeared first during the Yuan Dynasty.\n\nIn the Ming Dynasty, the center was the Forbidden City, ___58___ (surround) in concentric (同心的) circles by the Inner City and Outer City. Citizens of higher social classes ___59___ (permit) to live closer to the center of the circles. The large siheyuan of these high-ranking officials and wealthy businessmen often ___60___ (feature) beautifully carved and painted roof beams and pillars (柱子). The hutongs they formed were orderly, lined by ___61___ (space) homes and walled gardens. Farther from the center lived the commoners and laborers. Their siheyuan were far smaller in scale and ___62___ (simple) in design and decoration, and the hutongs were narrower.\n\nHutongs represent an important cultural element of the city of Beijing. Thanks to Beijing's long history ___63___ capital of China, almost every hutong has its stories, and some are even associated with historic ___64___ (event). In contrast to the court life and upper-class culture represented by the Forbidden City, the Summer Palace, and the Temple of Heaven, the hutongs reflect ___65___ culture of grassroots Beijingers.",
      "fine_category": "logic-coordinating",
      "facets": {
        "word": "and",
        "kind": "coordinating"
      }
    },
    {
      "id": "2023浙江首考-57",
      "exam_id": "2023浙江首考",
      "year": 2023,
      "type": "真题",
      "no": 57,
      "answer": "originally",
      "explanation": "考查副词。originally 修饰 meaning，表示“最初意为”，应用副词形式 originally。",
      "grammar_point": "副词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "During China's dynastic period, emperors planned the city of Beijing ___56___ arranged the residential areas according to social classes. The term \"hutong\", ___57___ (original) meaning \"water well\" in Mongolian, appeared first during the Yuan Dynasty.\n\nIn the Ming Dynasty, the center was the Forbidden City, ___58___ (surround) in concentric (同心的) circles by the Inner City and Outer City. Citizens of higher social classes ___59___ (permit) to live closer to the center of the circles. The large siheyuan of these high-ranking officials and wealthy businessmen often ___60___ (feature) beautifully carved and painted roof beams and pillars (柱子). The hutongs they formed were orderly, lined by ___61___ (space) homes and walled gardens. Farther from the center lived the commoners and laborers. Their siheyuan were far smaller in scale and ___62___ (simple) in design and decoration, and the hutongs were narrower.\n\nHutongs represent an important cultural element of the city of Beijing. Thanks to Beijing's long history ___63___ capital of China, almost every hutong has its stories, and some are even associated with historic ___64___ (event). In contrast to the court life and upper-class culture represented by the Forbidden City, the Summer Palace, and the Temple of Heaven, the hutongs reflect ___65___ culture of grassroots Beijingers.",
      "fine_category": "word-adv",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2023浙江首考-58",
      "exam_id": "2023浙江首考",
      "year": 2023,
      "type": "真题",
      "no": 58,
      "answer": "surrounded",
      "explanation": "考查非谓语动词。Forbidden City 与 surround 构成逻辑上的动宾关系，空格作后置定语，应用过去分词 surrounded。",
      "grammar_point": "非谓语动词",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "During China's dynastic period, emperors planned the city of Beijing ___56___ arranged the residential areas according to social classes. The term \"hutong\", ___57___ (original) meaning \"water well\" in Mongolian, appeared first during the Yuan Dynasty.\n\nIn the Ming Dynasty, the center was the Forbidden City, ___58___ (surround) in concentric (同心的) circles by the Inner City and Outer City. Citizens of higher social classes ___59___ (permit) to live closer to the center of the circles. The large siheyuan of these high-ranking officials and wealthy businessmen often ___60___ (feature) beautifully carved and painted roof beams and pillars (柱子). The hutongs they formed were orderly, lined by ___61___ (space) homes and walled gardens. Farther from the center lived the commoners and laborers. Their siheyuan were far smaller in scale and ___62___ (simple) in design and decoration, and the hutongs were narrower.\n\nHutongs represent an important cultural element of the city of Beijing. Thanks to Beijing's long history ___63___ capital of China, almost every hutong has its stories, and some are even associated with historic ___64___ (event). In contrast to the court life and upper-class culture represented by the Forbidden City, the Summer Palace, and the Temple of Heaven, the hutongs reflect ___65___ culture of grassroots Beijingers.",
      "fine_category": "nonpred-done",
      "nonp_function": "adverbial",
      "nonp_function_label": "作状语",
      "nonp_form": "done",
      "nonp_form_label": "done",
      "nonp_rule": "主句已有谓语，the Forbidden City 与 surround 是动宾关系，用 done 表被环绕的状态。",
      "nonp_needs_review": false,
      "facets": {
        "form": "done"
      }
    },
    {
      "id": "2023浙江首考-59",
      "exam_id": "2023浙江首考",
      "year": 2023,
      "type": "真题",
      "no": 59,
      "answer": "were permitted",
      "explanation": "考查谓语动词。主语 Citizens 与 permit 为被动关系，结合历史叙述语境用一般过去时被动语态 were permitted。",
      "grammar_point": "谓语动词",
      "category": "predicate",
      "category_name": "谓语动词",
      "passage": "During China's dynastic period, emperors planned the city of Beijing ___56___ arranged the residential areas according to social classes. The term \"hutong\", ___57___ (original) meaning \"water well\" in Mongolian, appeared first during the Yuan Dynasty.\n\nIn the Ming Dynasty, the center was the Forbidden City, ___58___ (surround) in concentric (同心的) circles by the Inner City and Outer City. Citizens of higher social classes ___59___ (permit) to live closer to the center of the circles. The large siheyuan of these high-ranking officials and wealthy businessmen often ___60___ (feature) beautifully carved and painted roof beams and pillars (柱子). The hutongs they formed were orderly, lined by ___61___ (space) homes and walled gardens. Farther from the center lived the commoners and laborers. Their siheyuan were far smaller in scale and ___62___ (simple) in design and decoration, and the hutongs were narrower.\n\nHutongs represent an important cultural element of the city of Beijing. Thanks to Beijing's long history ___63___ capital of China, almost every hutong has its stories, and some are even associated with historic ___64___ (event). In contrast to the court life and upper-class culture represented by the Forbidden City, the Summer Palace, and the Temple of Heaven, the hutongs reflect ___65___ culture of grassroots Beijingers.",
      "fine_category": "pred-passive-form"
    },
    {
      "id": "2023浙江首考-60",
      "exam_id": "2023浙江首考",
      "year": 2023,
      "type": "真题",
      "no": 60,
      "answer": "featured",
      "explanation": "考查谓语动词。句中缺少谓语，主语 The large siheyuan of these high-ranking officials and wealthy businessmen 与 feature 是主动关系；结合上文 dynastic period、Ming Dynasty 等历史语境，用一般过去时 featured。",
      "grammar_point": "谓语动词",
      "category": "predicate",
      "category_name": "谓语动词",
      "passage": "During China's dynastic period, emperors planned the city of Beijing ___56___ arranged the residential areas according to social classes. The term \"hutong\", ___57___ (original) meaning \"water well\" in Mongolian, appeared first during the Yuan Dynasty.\n\nIn the Ming Dynasty, the center was the Forbidden City, ___58___ (surround) in concentric (同心的) circles by the Inner City and Outer City. Citizens of higher social classes ___59___ (permit) to live closer to the center of the circles. The large siheyuan of these high-ranking officials and wealthy businessmen often ___60___ (feature) beautifully carved and painted roof beams and pillars (柱子). The hutongs they formed were orderly, lined by ___61___ (space) homes and walled gardens. Farther from the center lived the commoners and laborers. Their siheyuan were far smaller in scale and ___62___ (simple) in design and decoration, and the hutongs were narrower.\n\nHutongs represent an important cultural element of the city of Beijing. Thanks to Beijing's long history ___63___ capital of China, almost every hutong has its stories, and some are even associated with historic ___64___ (event). In contrast to the court life and upper-class culture represented by the Forbidden City, the Summer Palace, and the Temple of Heaven, the hutongs reflect ___65___ culture of grassroots Beijingers.",
      "fine_category": "pred-tense-past-future"
    },
    {
      "id": "2023浙江首考-61",
      "exam_id": "2023浙江首考",
      "year": 2023,
      "type": "真题",
      "no": 61,
      "answer": "spacious",
      "explanation": "考查形容词。空格修饰 homes，space 变为形容词 spacious，表示“宽敞的”。",
      "grammar_point": "形容词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "During China's dynastic period, emperors planned the city of Beijing ___56___ arranged the residential areas according to social classes. The term \"hutong\", ___57___ (original) meaning \"water well\" in Mongolian, appeared first during the Yuan Dynasty.\n\nIn the Ming Dynasty, the center was the Forbidden City, ___58___ (surround) in concentric (同心的) circles by the Inner City and Outer City. Citizens of higher social classes ___59___ (permit) to live closer to the center of the circles. The large siheyuan of these high-ranking officials and wealthy businessmen often ___60___ (feature) beautifully carved and painted roof beams and pillars (柱子). The hutongs they formed were orderly, lined by ___61___ (space) homes and walled gardens. Farther from the center lived the commoners and laborers. Their siheyuan were far smaller in scale and ___62___ (simple) in design and decoration, and the hutongs were narrower.\n\nHutongs represent an important cultural element of the city of Beijing. Thanks to Beijing's long history ___63___ capital of China, almost every hutong has its stories, and some are even associated with historic ___64___ (event). In contrast to the court life and upper-class culture represented by the Forbidden City, the Summer Palace, and the Temple of Heaven, the hutongs reflect ___65___ culture of grassroots Beijingers.",
      "fine_category": "word-adj",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2023浙江首考-62",
      "exam_id": "2023浙江首考",
      "year": 2023,
      "type": "真题",
      "no": 62,
      "answer": "simpler",
      "explanation": "考查形容词比较级。空格与 far smaller 并列，比较普通百姓住宅与高阶层住宅的设计装饰，应用 simpler 或 more simple。",
      "grammar_point": "形容词比较级",
      "category": "word",
      "category_name": "词性转换",
      "passage": "During China's dynastic period, emperors planned the city of Beijing ___56___ arranged the residential areas according to social classes. The term \"hutong\", ___57___ (original) meaning \"water well\" in Mongolian, appeared first during the Yuan Dynasty.\n\nIn the Ming Dynasty, the center was the Forbidden City, ___58___ (surround) in concentric (同心的) circles by the Inner City and Outer City. Citizens of higher social classes ___59___ (permit) to live closer to the center of the circles. The large siheyuan of these high-ranking officials and wealthy businessmen often ___60___ (feature) beautifully carved and painted roof beams and pillars (柱子). The hutongs they formed were orderly, lined by ___61___ (space) homes and walled gardens. Farther from the center lived the commoners and laborers. Their siheyuan were far smaller in scale and ___62___ (simple) in design and decoration, and the hutongs were narrower.\n\nHutongs represent an important cultural element of the city of Beijing. Thanks to Beijing's long history ___63___ capital of China, almost every hutong has its stories, and some are even associated with historic ___64___ (event). In contrast to the court life and upper-class culture represented by the Forbidden City, the Summer Palace, and the Temple of Heaven, the hutongs reflect ___65___ culture of grassroots Beijingers.",
      "fine_category": "word-comparative",
      "facets": {
        "subtype": "comparative"
      }
    },
    {
      "id": "2023浙江首考-63",
      "exam_id": "2023浙江首考",
      "year": 2023,
      "type": "真题",
      "no": 63,
      "answer": "as",
      "explanation": "考查介词。history as capital of China 表示“作为中国首都的历史”，应用介词 as。",
      "grammar_point": "介词",
      "category": "preposition",
      "category_name": "介词",
      "passage": "During China's dynastic period, emperors planned the city of Beijing ___56___ arranged the residential areas according to social classes. The term \"hutong\", ___57___ (original) meaning \"water well\" in Mongolian, appeared first during the Yuan Dynasty.\n\nIn the Ming Dynasty, the center was the Forbidden City, ___58___ (surround) in concentric (同心的) circles by the Inner City and Outer City. Citizens of higher social classes ___59___ (permit) to live closer to the center of the circles. The large siheyuan of these high-ranking officials and wealthy businessmen often ___60___ (feature) beautifully carved and painted roof beams and pillars (柱子). The hutongs they formed were orderly, lined by ___61___ (space) homes and walled gardens. Farther from the center lived the commoners and laborers. Their siheyuan were far smaller in scale and ___62___ (simple) in design and decoration, and the hutongs were narrower.\n\nHutongs represent an important cultural element of the city of Beijing. Thanks to Beijing's long history ___63___ capital of China, almost every hutong has its stories, and some are even associated with historic ___64___ (event). In contrast to the court life and upper-class culture represented by the Forbidden City, the Summer Palace, and the Temple of Heaven, the hutongs reflect ___65___ culture of grassroots Beijingers.",
      "fine_category": "prep-common",
      "facets": {
        "word": "as"
      }
    },
    {
      "id": "2023浙江首考-64",
      "exam_id": "2023浙江首考",
      "year": 2023,
      "type": "真题",
      "no": 64,
      "answer": "events",
      "explanation": "考查名词复数。event 为可数名词，前有 historic 修饰且语境表示多个历史事件，应用复数 events。",
      "grammar_point": "名词复数",
      "category": "number",
      "category_name": "名词/数词",
      "passage": "During China's dynastic period, emperors planned the city of Beijing ___56___ arranged the residential areas according to social classes. The term \"hutong\", ___57___ (original) meaning \"water well\" in Mongolian, appeared first during the Yuan Dynasty.\n\nIn the Ming Dynasty, the center was the Forbidden City, ___58___ (surround) in concentric (同心的) circles by the Inner City and Outer City. Citizens of higher social classes ___59___ (permit) to live closer to the center of the circles. The large siheyuan of these high-ranking officials and wealthy businessmen often ___60___ (feature) beautifully carved and painted roof beams and pillars (柱子). The hutongs they formed were orderly, lined by ___61___ (space) homes and walled gardens. Farther from the center lived the commoners and laborers. Their siheyuan were far smaller in scale and ___62___ (simple) in design and decoration, and the hutongs were narrower.\n\nHutongs represent an important cultural element of the city of Beijing. Thanks to Beijing's long history ___63___ capital of China, almost every hutong has its stories, and some are even associated with historic ___64___ (event). In contrast to the court life and upper-class culture represented by the Forbidden City, the Summer Palace, and the Temple of Heaven, the hutongs reflect ___65___ culture of grassroots Beijingers.",
      "fine_category": "num-plural",
      "facets": {
        "type": "plural"
      }
    },
    {
      "id": "2023浙江首考-65",
      "exam_id": "2023浙江首考",
      "year": 2023,
      "type": "真题",
      "no": 65,
      "answer": "the",
      "explanation": "考查定冠词。culture 后有 of grassroots Beijingers 限定，表示特定文化，应用 the。",
      "grammar_point": "冠词",
      "category": "article",
      "category_name": "冠词",
      "passage": "During China's dynastic period, emperors planned the city of Beijing ___56___ arranged the residential areas according to social classes. The term \"hutong\", ___57___ (original) meaning \"water well\" in Mongolian, appeared first during the Yuan Dynasty.\n\nIn the Ming Dynasty, the center was the Forbidden City, ___58___ (surround) in concentric (同心的) circles by the Inner City and Outer City. Citizens of higher social classes ___59___ (permit) to live closer to the center of the circles. The large siheyuan of these high-ranking officials and wealthy businessmen often ___60___ (feature) beautifully carved and painted roof beams and pillars (柱子). The hutongs they formed were orderly, lined by ___61___ (space) homes and walled gardens. Farther from the center lived the commoners and laborers. Their siheyuan were far smaller in scale and ___62___ (simple) in design and decoration, and the hutongs were narrower.\n\nHutongs represent an important cultural element of the city of Beijing. Thanks to Beijing's long history ___63___ capital of China, almost every hutong has its stories, and some are even associated with historic ___64___ (event). In contrast to the court life and upper-class culture represented by the Forbidden City, the Summer Palace, and the Temple of Heaven, the hutongs reflect ___65___ culture of grassroots Beijingers.",
      "fine_category": "art-the",
      "facets": {
        "word": "the"
      }
    },
    {
      "id": "2024全国一卷-56",
      "exam_id": "2024全国一卷",
      "year": 2024,
      "type": "真题",
      "no": 56,
      "answer": "engineering",
      "explanation": "词性转换。括号内 engineer 是名词/动词，空处修饰名词 techniques 作定语，应用其名词形式 engineering（动名词的名词用法，意为“工程/工程技术”），故填 engineering。",
      "grammar_point": "词性转换",
      "category": "word",
      "category_name": "词性转换",
      "passage": "Heatherwick Studio recently built a greenhouse at the edge of the National Trust's Woolbeding Gardens. This beautiful structure, named Glasshouse, is at the centre of a new garden that shows how the Silk Road influences English gardens even in modern times.\n\nThe latest ___56___ (engineer) techniques are applied to create this protective ___57___ (function) structure that is also beautiful. The design features ten steel “sepals (萼片)” made of glass and aluminium (铝). These sepals open on warm days ___58___ (give) the inside plants sunshine and fresh air. In cold weather, the structure stays ___59___ (close) to protect the plants.\n\nFurther, the Silk Route Garden around the greenhouse ___60___ (walk) visitors through a journey influenced by the ancient Silk Road, by which silk as well as many plant species came to Britain for ___61___ first time. These plants included modern Western ___62___ (favourite) such as rosemary, lavender and fennel. The garden also contains a winding path that guides visitors through the twelve regions of the Silk Road. The path offers over 300 plant species for visitors to see, too.\n\nThe Glasshouse stands ___63___ a great achievement in contemporary design, to house the plants of the southwestern part of China at the end of a path retracing (追溯) the steps along the Silk Route ___64___ brought the plants from their native habitat in Asia to come to define much of the ___65___ (rich) of gardening in England.",
      "fine_category": "word-noun",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2024全国一卷-57",
      "exam_id": "2024全国一卷",
      "year": 2024,
      "type": "真题",
      "no": 57,
      "answer": "functional",
      "explanation": "形容词。空处与protective并列，修饰空后的名词structure，应用形容词形式，故填functional“实用的”。句意：最新的工程技术被应用于创建这种兼具保护性和功能性且还美观的结构。",
      "grammar_point": "形容词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "Heatherwick Studio recently built a greenhouse at the edge of the National Trust's Woolbeding Gardens. This beautiful structure, named Glasshouse, is at the centre of a new garden that shows how the Silk Road influences English gardens even in modern times.\n\nThe latest ___56___ (engineer) techniques are applied to create this protective ___57___ (function) structure that is also beautiful. The design features ten steel “sepals (萼片)” made of glass and aluminium (铝). These sepals open on warm days ___58___ (give) the inside plants sunshine and fresh air. In cold weather, the structure stays ___59___ (close) to protect the plants.\n\nFurther, the Silk Route Garden around the greenhouse ___60___ (walk) visitors through a journey influenced by the ancient Silk Road, by which silk as well as many plant species came to Britain for ___61___ first time. These plants included modern Western ___62___ (favourite) such as rosemary, lavender and fennel. The garden also contains a winding path that guides visitors through the twelve regions of the Silk Road. The path offers over 300 plant species for visitors to see, too.\n\nThe Glasshouse stands ___63___ a great achievement in contemporary design, to house the plants of the southwestern part of China at the end of a path retracing (追溯) the steps along the Silk Route ___64___ brought the plants from their native habitat in Asia to come to define much of the ___65___ (rich) of gardening in England.",
      "fine_category": "word-adj",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2024全国一卷-58",
      "exam_id": "2024全国一卷",
      "year": 2024,
      "type": "真题",
      "no": 58,
      "answer": "to give",
      "explanation": "非谓语动词。空处所在句的谓语动词是open，空处应用非谓语动词。根据语境可知此处表示目的，故填不定式to give。句意：在温暖的日子里，这些萼片会打开以给内部植物（提供）阳光和新鲜空气。",
      "grammar_point": "非谓语动词",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "Heatherwick Studio recently built a greenhouse at the edge of the National Trust's Woolbeding Gardens. This beautiful structure, named Glasshouse, is at the centre of a new garden that shows how the Silk Road influences English gardens even in modern times.\n\nThe latest ___56___ (engineer) techniques are applied to create this protective ___57___ (function) structure that is also beautiful. The design features ten steel “sepals (萼片)” made of glass and aluminium (铝). These sepals open on warm days ___58___ (give) the inside plants sunshine and fresh air. In cold weather, the structure stays ___59___ (close) to protect the plants.\n\nFurther, the Silk Route Garden around the greenhouse ___60___ (walk) visitors through a journey influenced by the ancient Silk Road, by which silk as well as many plant species came to Britain for ___61___ first time. These plants included modern Western ___62___ (favourite) such as rosemary, lavender and fennel. The garden also contains a winding path that guides visitors through the twelve regions of the Silk Road. The path offers over 300 plant species for visitors to see, too.\n\nThe Glasshouse stands ___63___ a great achievement in contemporary design, to house the plants of the southwestern part of China at the end of a path retracing (追溯) the steps along the Silk Route ___64___ brought the plants from their native habitat in Asia to come to define much of the ___65___ (rich) of gardening in England.",
      "fine_category": "nonpred-to-do",
      "nonp_function": "adverbial",
      "nonp_function_label": "作状语",
      "nonp_form": "to_do",
      "nonp_form_label": "to do",
      "nonp_rule": "主句已有谓语 open，to give 表目的，说明萼片打开是为了提供阳光和空气。",
      "nonp_needs_review": false,
      "facets": {
        "form": "to-do"
      }
    },
    {
      "id": "2024全国一卷-59",
      "exam_id": "2024全国一卷",
      "year": 2024,
      "type": "真题",
      "no": 59,
      "answer": "closed",
      "explanation": "形容词。空前的stays作系动词，表示“保持”，空处作表语，表示“关闭的”，故应用形容词closed。",
      "grammar_point": "形容词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "Heatherwick Studio recently built a greenhouse at the edge of the National Trust's Woolbeding Gardens. This beautiful structure, named Glasshouse, is at the centre of a new garden that shows how the Silk Road influences English gardens even in modern times.\n\nThe latest ___56___ (engineer) techniques are applied to create this protective ___57___ (function) structure that is also beautiful. The design features ten steel “sepals (萼片)” made of glass and aluminium (铝). These sepals open on warm days ___58___ (give) the inside plants sunshine and fresh air. In cold weather, the structure stays ___59___ (close) to protect the plants.\n\nFurther, the Silk Route Garden around the greenhouse ___60___ (walk) visitors through a journey influenced by the ancient Silk Road, by which silk as well as many plant species came to Britain for ___61___ first time. These plants included modern Western ___62___ (favourite) such as rosemary, lavender and fennel. The garden also contains a winding path that guides visitors through the twelve regions of the Silk Road. The path offers over 300 plant species for visitors to see, too.\n\nThe Glasshouse stands ___63___ a great achievement in contemporary design, to house the plants of the southwestern part of China at the end of a path retracing (追溯) the steps along the Silk Route ___64___ brought the plants from their native habitat in Asia to come to define much of the ___65___ (rich) of gardening in England.",
      "fine_category": "word-adj",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2024全国一卷-60",
      "exam_id": "2024全国一卷",
      "year": 2024,
      "type": "真题",
      "no": 60,
      "answer": "walks",
      "explanation": "动词的时态、语态和主谓一致。分析句子结构可知，空处在句中作谓语。本句描述了the Silk Route Garden的客观情况，时态用一般现在时；此处时态也可以根据下文中的“contains... guides... offers”判断；walk在此作动词，表示“（循序渐进地）教，逐步引导”，与主语the Silk Route Garden之间为主动关系；主语表示第三人称单数。所以填walks。",
      "grammar_point": "动词的时态",
      "category": "predicate",
      "category_name": "谓语动词",
      "passage": "Heatherwick Studio recently built a greenhouse at the edge of the National Trust's Woolbeding Gardens. This beautiful structure, named Glasshouse, is at the centre of a new garden that shows how the Silk Road influences English gardens even in modern times.\n\nThe latest ___56___ (engineer) techniques are applied to create this protective ___57___ (function) structure that is also beautiful. The design features ten steel “sepals (萼片)” made of glass and aluminium (铝). These sepals open on warm days ___58___ (give) the inside plants sunshine and fresh air. In cold weather, the structure stays ___59___ (close) to protect the plants.\n\nFurther, the Silk Route Garden around the greenhouse ___60___ (walk) visitors through a journey influenced by the ancient Silk Road, by which silk as well as many plant species came to Britain for ___61___ first time. These plants included modern Western ___62___ (favourite) such as rosemary, lavender and fennel. The garden also contains a winding path that guides visitors through the twelve regions of the Silk Road. The path offers over 300 plant species for visitors to see, too.\n\nThe Glasshouse stands ___63___ a great achievement in contemporary design, to house the plants of the southwestern part of China at the end of a path retracing (追溯) the steps along the Silk Route ___64___ brought the plants from their native habitat in Asia to come to define much of the ___65___ (rich) of gardening in England.",
      "fine_category": "pred-sva-form"
    },
    {
      "id": "2024全国一卷-61",
      "exam_id": "2024全国一卷",
      "year": 2024,
      "type": "真题",
      "no": 61,
      "answer": "the",
      "explanation": "冠词。此处考查固定表达for the first time，意为“第一次”，所以填the。",
      "grammar_point": "固定表达for the first ti",
      "category": "article",
      "category_name": "冠词",
      "passage": "Heatherwick Studio recently built a greenhouse at the edge of the National Trust's Woolbeding Gardens. This beautiful structure, named Glasshouse, is at the centre of a new garden that shows how the Silk Road influences English gardens even in modern times.\n\nThe latest ___56___ (engineer) techniques are applied to create this protective ___57___ (function) structure that is also beautiful. The design features ten steel “sepals (萼片)” made of glass and aluminium (铝). These sepals open on warm days ___58___ (give) the inside plants sunshine and fresh air. In cold weather, the structure stays ___59___ (close) to protect the plants.\n\nFurther, the Silk Route Garden around the greenhouse ___60___ (walk) visitors through a journey influenced by the ancient Silk Road, by which silk as well as many plant species came to Britain for ___61___ first time. These plants included modern Western ___62___ (favourite) such as rosemary, lavender and fennel. The garden also contains a winding path that guides visitors through the twelve regions of the Silk Road. The path offers over 300 plant species for visitors to see, too.\n\nThe Glasshouse stands ___63___ a great achievement in contemporary design, to house the plants of the southwestern part of China at the end of a path retracing (追溯) the steps along the Silk Route ___64___ brought the plants from their native habitat in Asia to come to define much of the ___65___ (rich) of gardening in England.",
      "fine_category": "art-the",
      "facets": {
        "word": "the"
      }
    },
    {
      "id": "2024全国一卷-62",
      "exam_id": "2024全国一卷",
      "year": 2024,
      "type": "真题",
      "no": 62,
      "answer": "favourites",
      "explanation": "名词复数。分析句子结构可知，空处作动词included的宾语，前面的modern Western为定语，所以此处应填名词；根据空后的举例“such as rosemary, lavender and fennel”可知，空处表示复数概念。故填favourites。favourite在此处为可数名词，表示“特别喜爱的事物”。",
      "grammar_point": "名词复数",
      "category": "number",
      "category_name": "名词/数词",
      "passage": "Heatherwick Studio recently built a greenhouse at the edge of the National Trust's Woolbeding Gardens. This beautiful structure, named Glasshouse, is at the centre of a new garden that shows how the Silk Road influences English gardens even in modern times.\n\nThe latest ___56___ (engineer) techniques are applied to create this protective ___57___ (function) structure that is also beautiful. The design features ten steel “sepals (萼片)” made of glass and aluminium (铝). These sepals open on warm days ___58___ (give) the inside plants sunshine and fresh air. In cold weather, the structure stays ___59___ (close) to protect the plants.\n\nFurther, the Silk Route Garden around the greenhouse ___60___ (walk) visitors through a journey influenced by the ancient Silk Road, by which silk as well as many plant species came to Britain for ___61___ first time. These plants included modern Western ___62___ (favourite) such as rosemary, lavender and fennel. The garden also contains a winding path that guides visitors through the twelve regions of the Silk Road. The path offers over 300 plant species for visitors to see, too.\n\nThe Glasshouse stands ___63___ a great achievement in contemporary design, to house the plants of the southwestern part of China at the end of a path retracing (追溯) the steps along the Silk Route ___64___ brought the plants from their native habitat in Asia to come to define much of the ___65___ (rich) of gardening in England.",
      "fine_category": "num-plural",
      "facets": {
        "type": "plural"
      }
    },
    {
      "id": "2024全国一卷-63",
      "exam_id": "2024全国一卷",
      "year": 2024,
      "type": "真题",
      "no": 63,
      "answer": "as",
      "explanation": "介词。结合语境“该玻璃温室作为当代设计的伟大成就而存在”可知，空处需要填as。",
      "grammar_point": "介词",
      "category": "preposition",
      "category_name": "介词",
      "passage": "Heatherwick Studio recently built a greenhouse at the edge of the National Trust's Woolbeding Gardens. This beautiful structure, named Glasshouse, is at the centre of a new garden that shows how the Silk Road influences English gardens even in modern times.\n\nThe latest ___56___ (engineer) techniques are applied to create this protective ___57___ (function) structure that is also beautiful. The design features ten steel “sepals (萼片)” made of glass and aluminium (铝). These sepals open on warm days ___58___ (give) the inside plants sunshine and fresh air. In cold weather, the structure stays ___59___ (close) to protect the plants.\n\nFurther, the Silk Route Garden around the greenhouse ___60___ (walk) visitors through a journey influenced by the ancient Silk Road, by which silk as well as many plant species came to Britain for ___61___ first time. These plants included modern Western ___62___ (favourite) such as rosemary, lavender and fennel. The garden also contains a winding path that guides visitors through the twelve regions of the Silk Road. The path offers over 300 plant species for visitors to see, too.\n\nThe Glasshouse stands ___63___ a great achievement in contemporary design, to house the plants of the southwestern part of China at the end of a path retracing (追溯) the steps along the Silk Route ___64___ brought the plants from their native habitat in Asia to come to define much of the ___65___ (rich) of gardening in England.",
      "fine_category": "prep-common",
      "facets": {
        "word": "as"
      }
    },
    {
      "id": "2024全国一卷-64",
      "exam_id": "2024全国一卷",
      "year": 2024,
      "type": "真题",
      "no": 64,
      "answer": "that",
      "explanation": "定语从句。分析句子结构可知，空处引导定语从句，先行词为表示物的名词短语the Silk Route，关系词在从句中作主语，所以填that/which。",
      "grammar_point": "定语从句",
      "category": "attrib",
      "category_name": "定语从句",
      "passage": "Heatherwick Studio recently built a greenhouse at the edge of the National Trust's Woolbeding Gardens. This beautiful structure, named Glasshouse, is at the centre of a new garden that shows how the Silk Road influences English gardens even in modern times.\n\nThe latest ___56___ (engineer) techniques are applied to create this protective ___57___ (function) structure that is also beautiful. The design features ten steel “sepals (萼片)” made of glass and aluminium (铝). These sepals open on warm days ___58___ (give) the inside plants sunshine and fresh air. In cold weather, the structure stays ___59___ (close) to protect the plants.\n\nFurther, the Silk Route Garden around the greenhouse ___60___ (walk) visitors through a journey influenced by the ancient Silk Road, by which silk as well as many plant species came to Britain for ___61___ first time. These plants included modern Western ___62___ (favourite) such as rosemary, lavender and fennel. The garden also contains a winding path that guides visitors through the twelve regions of the Silk Road. The path offers over 300 plant species for visitors to see, too.\n\nThe Glasshouse stands ___63___ a great achievement in contemporary design, to house the plants of the southwestern part of China at the end of a path retracing (追溯) the steps along the Silk Route ___64___ brought the plants from their native habitat in Asia to come to define much of the ___65___ (rich) of gardening in England.",
      "fine_category": "attrib-pronoun",
      "facets": {
        "type": "relative-pronoun",
        "word": "that",
        "restrictive": true
      }
    },
    {
      "id": "2024全国一卷-65",
      "exam_id": "2024全国一卷",
      "year": 2024,
      "type": "真题",
      "no": 65,
      "answer": "richness",
      "explanation": "名词。空处跟在定冠词the之后，且空后的of gardening对空处进行限定，因此应填名词richness。",
      "grammar_point": "名词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "Heatherwick Studio recently built a greenhouse at the edge of the National Trust's Woolbeding Gardens. This beautiful structure, named Glasshouse, is at the centre of a new garden that shows how the Silk Road influences English gardens even in modern times.\n\nThe latest ___56___ (engineer) techniques are applied to create this protective ___57___ (function) structure that is also beautiful. The design features ten steel “sepals (萼片)” made of glass and aluminium (铝). These sepals open on warm days ___58___ (give) the inside plants sunshine and fresh air. In cold weather, the structure stays ___59___ (close) to protect the plants.\n\nFurther, the Silk Route Garden around the greenhouse ___60___ (walk) visitors through a journey influenced by the ancient Silk Road, by which silk as well as many plant species came to Britain for ___61___ first time. These plants included modern Western ___62___ (favourite) such as rosemary, lavender and fennel. The garden also contains a winding path that guides visitors through the twelve regions of the Silk Road. The path offers over 300 plant species for visitors to see, too.\n\nThe Glasshouse stands ___63___ a great achievement in contemporary design, to house the plants of the southwestern part of China at the end of a path retracing (追溯) the steps along the Silk Route ___64___ brought the plants from their native habitat in Asia to come to define much of the ___65___ (rich) of gardening in England.",
      "fine_category": "word-noun",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2024全国二卷-36",
      "exam_id": "2024全国二卷",
      "year": 2024,
      "type": "真题",
      "no": 36,
      "answer": "who",
      "explanation": "定语从句。先行词是Tang Xianzu,从句中缺少主语,且空前有逗号,故应用who引导非限制性定语从句。",
      "grammar_point": "定语从句",
      "category": "attrib",
      "category_name": "定语从句",
      "passage": "Chinese cultural elements commemorating (纪念) Tang Xianzu, ___36___ is known as \"the Shakespeare of Asia,\" add an international character to Stratford-upon-Avon, William Shakespeare's hometown.\n\nTang and Shakespeare were contemporaries and both died in 1616. Although they could never have met, there are common ___37___ (theme)in their works, said Paul Edmondson, head of research for the Shakespeare Birthplace Trust. \"Some of the things that Tang was writing about ___38___ (be)also Shakespeare's concerns. I happen to know that Tang's play The Peony Pavilion (《牡丹亭》) is similar in some ways ___39___ Romeo and Juliet.\"\n\nA statue commemorating Shakespeare and Tang was put up at Shakespeare's Birthplace Garden in 2017. Two years later, a six-meter-tall pavilion, ___40___ (inspire)by The Peony Pavilion, ___41___ (build)at the Firs Garden, just ten minutes' walk from Shakespeare's birthplace.\n\nThose cultural elements have increased Stratford's international ___42___ (visible), said Edmondson, adding that visitors walking through the Birthplace Garden were often amazed ___43___ (find)the connection between the two great writers.\n\n___44___ (recall)watching a Chinese opera version of Shakespeare's play Richard III in Shanghai and meeting Chinese actors who came to Stratford a few years ago to perform parts of The Peony Pavilion, Edmondson said, \"It was very exciting to hear the Chinese language ___45___ see how Tang's play was being performed.\"\n\n为纪念素有\"东方莎士比亚\"之称的汤显祖,一座凉亭在莎士比亚的故乡建立,此举提高了莎士比亚故乡的国际知名度。来此地的游客惊奇地发现东西方的这两位伟大作家的作品有一些共性。\n\n36.",
      "fine_category": "attrib-pronoun",
      "facets": {
        "type": "relative-pronoun",
        "word": "who",
        "restrictive": false
      }
    },
    {
      "id": "2024全国二卷-37",
      "exam_id": "2024全国二卷",
      "year": 2024,
      "type": "真题",
      "no": 37,
      "answer": "themes",
      "explanation": "名词复数。根据\"there are\"可知,此处应用名词复数themes。句意:虽然他们可能从未见过面,但是他们的作品中有共同的主题。",
      "grammar_point": "名词复数",
      "category": "number",
      "category_name": "名词/数词",
      "passage": "Chinese cultural elements commemorating (纪念) Tang Xianzu, ___36___ is known as \"the Shakespeare of Asia,\" add an international character to Stratford-upon-Avon, William Shakespeare's hometown.\n\nTang and Shakespeare were contemporaries and both died in 1616. Although they could never have met, there are common ___37___ (theme)in their works, said Paul Edmondson, head of research for the Shakespeare Birthplace Trust. \"Some of the things that Tang was writing about ___38___ (be)also Shakespeare's concerns. I happen to know that Tang's play The Peony Pavilion (《牡丹亭》) is similar in some ways ___39___ Romeo and Juliet.\"\n\nA statue commemorating Shakespeare and Tang was put up at Shakespeare's Birthplace Garden in 2017. Two years later, a six-meter-tall pavilion, ___40___ (inspire)by The Peony Pavilion, ___41___ (build)at the Firs Garden, just ten minutes' walk from Shakespeare's birthplace.\n\nThose cultural elements have increased Stratford's international ___42___ (visible), said Edmondson, adding that visitors walking through the Birthplace Garden were often amazed ___43___ (find)the connection between the two great writers.\n\n___44___ (recall)watching a Chinese opera version of Shakespeare's play Richard III in Shanghai and meeting Chinese actors who came to Stratford a few years ago to perform parts of The Peony Pavilion, Edmondson said, \"It was very exciting to hear the Chinese language ___45___ see how Tang's play was being performed.\"\n\n为纪念素有\"东方莎士比亚\"之称的汤显祖,一座凉亭在莎士比亚的故乡建立,此举提高了莎士比亚故乡的国际知名度。来此地的游客惊奇地发现东西方的这两位伟大作家的作品有一些共性。\n\n36.",
      "fine_category": "num-plural",
      "facets": {
        "type": "plural"
      }
    },
    {
      "id": "2024全国二卷-38",
      "exam_id": "2024全国二卷",
      "year": 2024,
      "type": "真题",
      "no": 38,
      "answer": "were",
      "explanation": "动词的时态和主谓一致。主语是Some of the things,且此处描述过去的事,故填were。句意:汤显祖所写的一些内容也是莎士比亚所关心的事。",
      "grammar_point": "动词的时态",
      "category": "predicate",
      "category_name": "谓语动词",
      "passage": "Chinese cultural elements commemorating (纪念) Tang Xianzu, ___36___ is known as \"the Shakespeare of Asia,\" add an international character to Stratford-upon-Avon, William Shakespeare's hometown.\n\nTang and Shakespeare were contemporaries and both died in 1616. Although they could never have met, there are common ___37___ (theme)in their works, said Paul Edmondson, head of research for the Shakespeare Birthplace Trust. \"Some of the things that Tang was writing about ___38___ (be)also Shakespeare's concerns. I happen to know that Tang's play The Peony Pavilion (《牡丹亭》) is similar in some ways ___39___ Romeo and Juliet.\"\n\nA statue commemorating Shakespeare and Tang was put up at Shakespeare's Birthplace Garden in 2017. Two years later, a six-meter-tall pavilion, ___40___ (inspire)by The Peony Pavilion, ___41___ (build)at the Firs Garden, just ten minutes' walk from Shakespeare's birthplace.\n\nThose cultural elements have increased Stratford's international ___42___ (visible), said Edmondson, adding that visitors walking through the Birthplace Garden were often amazed ___43___ (find)the connection between the two great writers.\n\n___44___ (recall)watching a Chinese opera version of Shakespeare's play Richard III in Shanghai and meeting Chinese actors who came to Stratford a few years ago to perform parts of The Peony Pavilion, Edmondson said, \"It was very exciting to hear the Chinese language ___45___ see how Tang's play was being performed.\"\n\n为纪念素有\"东方莎士比亚\"之称的汤显祖,一座凉亭在莎士比亚的故乡建立,此举提高了莎士比亚故乡的国际知名度。来此地的游客惊奇地发现东西方的这两位伟大作家的作品有一些共性。\n\n36.",
      "fine_category": "pred-sva-form"
    },
    {
      "id": "2024全国二卷-39",
      "exam_id": "2024全国二卷",
      "year": 2024,
      "type": "真题",
      "no": 39,
      "answer": "to",
      "explanation": "介词。be similar to是固定短语,意为\"与......相似\"。句意:我恰好发现汤显祖的戏剧《牡丹亭》和《罗密欧与朱丽叶》在一些方面相似。",
      "grammar_point": "介词",
      "category": "preposition",
      "category_name": "介词",
      "passage": "Chinese cultural elements commemorating (纪念) Tang Xianzu, ___36___ is known as \"the Shakespeare of Asia,\" add an international character to Stratford-upon-Avon, William Shakespeare's hometown.\n\nTang and Shakespeare were contemporaries and both died in 1616. Although they could never have met, there are common ___37___ (theme)in their works, said Paul Edmondson, head of research for the Shakespeare Birthplace Trust. \"Some of the things that Tang was writing about ___38___ (be)also Shakespeare's concerns. I happen to know that Tang's play The Peony Pavilion (《牡丹亭》) is similar in some ways ___39___ Romeo and Juliet.\"\n\nA statue commemorating Shakespeare and Tang was put up at Shakespeare's Birthplace Garden in 2017. Two years later, a six-meter-tall pavilion, ___40___ (inspire)by The Peony Pavilion, ___41___ (build)at the Firs Garden, just ten minutes' walk from Shakespeare's birthplace.\n\nThose cultural elements have increased Stratford's international ___42___ (visible), said Edmondson, adding that visitors walking through the Birthplace Garden were often amazed ___43___ (find)the connection between the two great writers.\n\n___44___ (recall)watching a Chinese opera version of Shakespeare's play Richard III in Shanghai and meeting Chinese actors who came to Stratford a few years ago to perform parts of The Peony Pavilion, Edmondson said, \"It was very exciting to hear the Chinese language ___45___ see how Tang's play was being performed.\"\n\n为纪念素有\"东方莎士比亚\"之称的汤显祖,一座凉亭在莎士比亚的故乡建立,此举提高了莎士比亚故乡的国际知名度。来此地的游客惊奇地发现东西方的这两位伟大作家的作品有一些共性。\n\n36.",
      "fine_category": "prep-other",
      "facets": {
        "word": "to"
      }
    },
    {
      "id": "2024全国二卷-40",
      "exam_id": "2024全国二卷",
      "year": 2024,
      "type": "真题",
      "no": 40,
      "answer": "inspired",
      "explanation": "过去分词。根据句意并分析句子结构可知,此空应用非谓语动词; inspire与a six-meter-tall pavilion之间为动宾关系,应用过去分词作定语,故填inspired。句意:两年后,受《牡丹亭》的启发,一座六米高的凉亭被建在离莎士比亚出生地仅有十分钟的步行路程的杉园。",
      "grammar_point": "非谓语动词",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "Chinese cultural elements commemorating (纪念) Tang Xianzu, ___36___ is known as \"the Shakespeare of Asia,\" add an international character to Stratford-upon-Avon, William Shakespeare's hometown.\n\nTang and Shakespeare were contemporaries and both died in 1616. Although they could never have met, there are common ___37___ (theme)in their works, said Paul Edmondson, head of research for the Shakespeare Birthplace Trust. \"Some of the things that Tang was writing about ___38___ (be)also Shakespeare's concerns. I happen to know that Tang's play The Peony Pavilion (《牡丹亭》) is similar in some ways ___39___ Romeo and Juliet.\"\n\nA statue commemorating Shakespeare and Tang was put up at Shakespeare's Birthplace Garden in 2017. Two years later, a six-meter-tall pavilion, ___40___ (inspire)by The Peony Pavilion, ___41___ (build)at the Firs Garden, just ten minutes' walk from Shakespeare's birthplace.\n\nThose cultural elements have increased Stratford's international ___42___ (visible), said Edmondson, adding that visitors walking through the Birthplace Garden were often amazed ___43___ (find)the connection between the two great writers.\n\n___44___ (recall)watching a Chinese opera version of Shakespeare's play Richard III in Shanghai and meeting Chinese actors who came to Stratford a few years ago to perform parts of The Peony Pavilion, Edmondson said, \"It was very exciting to hear the Chinese language ___45___ see how Tang's play was being performed.\"\n\n为纪念素有\"东方莎士比亚\"之称的汤显祖,一座凉亭在莎士比亚的故乡建立,此举提高了莎士比亚故乡的国际知名度。来此地的游客惊奇地发现东西方的这两位伟大作家的作品有一些共性。\n\n36.",
      "fine_category": "nonpred-done",
      "nonp_function": "adverbial",
      "nonp_function_label": "作状语",
      "nonp_form": "done",
      "nonp_form_label": "done",
      "nonp_rule": "主句已有谓语，a pavilion 与 inspire 是动宾关系，用 done 作原因状语。",
      "nonp_needs_review": false,
      "facets": {
        "form": "done"
      }
    },
    {
      "id": "2024全国二卷-41",
      "exam_id": "2024全国二卷",
      "year": 2024,
      "type": "真题",
      "no": 41,
      "answer": "was built",
      "explanation": "动词的时态和语态。空处在句中作谓语,主语是a six-meter-tall pavilion,与build之间是被动关系,此处描述过去的事,应用一般过去时的被动语态。故填was built。",
      "grammar_point": "时态和语态",
      "category": "predicate",
      "category_name": "谓语动词",
      "passage": "Chinese cultural elements commemorating (纪念) Tang Xianzu, ___36___ is known as \"the Shakespeare of Asia,\" add an international character to Stratford-upon-Avon, William Shakespeare's hometown.\n\nTang and Shakespeare were contemporaries and both died in 1616. Although they could never have met, there are common ___37___ (theme)in their works, said Paul Edmondson, head of research for the Shakespeare Birthplace Trust. \"Some of the things that Tang was writing about ___38___ (be)also Shakespeare's concerns. I happen to know that Tang's play The Peony Pavilion (《牡丹亭》) is similar in some ways ___39___ Romeo and Juliet.\"\n\nA statue commemorating Shakespeare and Tang was put up at Shakespeare's Birthplace Garden in 2017. Two years later, a six-meter-tall pavilion, ___40___ (inspire)by The Peony Pavilion, ___41___ (build)at the Firs Garden, just ten minutes' walk from Shakespeare's birthplace.\n\nThose cultural elements have increased Stratford's international ___42___ (visible), said Edmondson, adding that visitors walking through the Birthplace Garden were often amazed ___43___ (find)the connection between the two great writers.\n\n___44___ (recall)watching a Chinese opera version of Shakespeare's play Richard III in Shanghai and meeting Chinese actors who came to Stratford a few years ago to perform parts of The Peony Pavilion, Edmondson said, \"It was very exciting to hear the Chinese language ___45___ see how Tang's play was being performed.\"\n\n为纪念素有\"东方莎士比亚\"之称的汤显祖,一座凉亭在莎士比亚的故乡建立,此举提高了莎士比亚故乡的国际知名度。来此地的游客惊奇地发现东西方的这两位伟大作家的作品有一些共性。\n\n36.",
      "fine_category": "pred-passive-form"
    },
    {
      "id": "2024全国二卷-42",
      "exam_id": "2024全国二卷",
      "year": 2024,
      "type": "真题",
      "no": 42,
      "answer": "visibility",
      "explanation": "名词。international是形容词,应修饰名词。visible的名词形式为visibility,表示\"知名度\"。此处表示这些文化元素提高了斯特拉特福的国际知名度。",
      "grammar_point": "名词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "Chinese cultural elements commemorating (纪念) Tang Xianzu, ___36___ is known as \"the Shakespeare of Asia,\" add an international character to Stratford-upon-Avon, William Shakespeare's hometown.\n\nTang and Shakespeare were contemporaries and both died in 1616. Although they could never have met, there are common ___37___ (theme)in their works, said Paul Edmondson, head of research for the Shakespeare Birthplace Trust. \"Some of the things that Tang was writing about ___38___ (be)also Shakespeare's concerns. I happen to know that Tang's play The Peony Pavilion (《牡丹亭》) is similar in some ways ___39___ Romeo and Juliet.\"\n\nA statue commemorating Shakespeare and Tang was put up at Shakespeare's Birthplace Garden in 2017. Two years later, a six-meter-tall pavilion, ___40___ (inspire)by The Peony Pavilion, ___41___ (build)at the Firs Garden, just ten minutes' walk from Shakespeare's birthplace.\n\nThose cultural elements have increased Stratford's international ___42___ (visible), said Edmondson, adding that visitors walking through the Birthplace Garden were often amazed ___43___ (find)the connection between the two great writers.\n\n___44___ (recall)watching a Chinese opera version of Shakespeare's play Richard III in Shanghai and meeting Chinese actors who came to Stratford a few years ago to perform parts of The Peony Pavilion, Edmondson said, \"It was very exciting to hear the Chinese language ___45___ see how Tang's play was being performed.\"\n\n为纪念素有\"东方莎士比亚\"之称的汤显祖,一座凉亭在莎士比亚的故乡建立,此举提高了莎士比亚故乡的国际知名度。来此地的游客惊奇地发现东西方的这两位伟大作家的作品有一些共性。\n\n36.",
      "fine_category": "word-noun",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2024全国二卷-43",
      "exam_id": "2024全国二卷",
      "year": 2024,
      "type": "真题",
      "no": 43,
      "answer": "to find",
      "explanation": "动词不定式。be amazed to do sth.是固定搭配,意为\"对做某事感到惊讶\"。此处表示游客惊讶地发现这两位伟大的作家之间的联系。",
      "grammar_point": "",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "Chinese cultural elements commemorating (纪念) Tang Xianzu, ___36___ is known as \"the Shakespeare of Asia,\" add an international character to Stratford-upon-Avon, William Shakespeare's hometown.\n\nTang and Shakespeare were contemporaries and both died in 1616. Although they could never have met, there are common ___37___ (theme)in their works, said Paul Edmondson, head of research for the Shakespeare Birthplace Trust. \"Some of the things that Tang was writing about ___38___ (be)also Shakespeare's concerns. I happen to know that Tang's play The Peony Pavilion (《牡丹亭》) is similar in some ways ___39___ Romeo and Juliet.\"\n\nA statue commemorating Shakespeare and Tang was put up at Shakespeare's Birthplace Garden in 2017. Two years later, a six-meter-tall pavilion, ___40___ (inspire)by The Peony Pavilion, ___41___ (build)at the Firs Garden, just ten minutes' walk from Shakespeare's birthplace.\n\nThose cultural elements have increased Stratford's international ___42___ (visible), said Edmondson, adding that visitors walking through the Birthplace Garden were often amazed ___43___ (find)the connection between the two great writers.\n\n___44___ (recall)watching a Chinese opera version of Shakespeare's play Richard III in Shanghai and meeting Chinese actors who came to Stratford a few years ago to perform parts of The Peony Pavilion, Edmondson said, \"It was very exciting to hear the Chinese language ___45___ see how Tang's play was being performed.\"\n\n为纪念素有\"东方莎士比亚\"之称的汤显祖,一座凉亭在莎士比亚的故乡建立,此举提高了莎士比亚故乡的国际知名度。来此地的游客惊奇地发现东西方的这两位伟大作家的作品有一些共性。\n\n36.",
      "fine_category": "nonpred-to-do",
      "nonp_function": "object",
      "nonp_function_label": "作宾语",
      "nonp_form": "to_do",
      "nonp_form_label": "to do",
      "nonp_rule": "be amazed 后接 to do，说明“惊讶地发现”，不定式作形容词补足成分。",
      "nonp_needs_review": false,
      "facets": {
        "form": "to-do"
      }
    },
    {
      "id": "2024全国二卷-44",
      "exam_id": "2024全国二卷",
      "year": 2024,
      "type": "真题",
      "no": 44,
      "answer": "Recalling",
      "explanation": "现在分词。此句已有谓语动词said, recall与主语Edmondson之间是主谓关系,应用现在分词作状语,故填Recalling。句意:Edmondson回忆起在上海观看莎士比亚的戏剧《理查三世》的中文版,以及见到几年前来到斯特拉特福表演《牡丹亭》片段的中国演员,他说:\"听到中文以及看到汤显祖的戏剧如何被表演是非常令人兴奋的。\"",
      "grammar_point": "",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "Chinese cultural elements commemorating (纪念) Tang Xianzu, ___36___ is known as \"the Shakespeare of Asia,\" add an international character to Stratford-upon-Avon, William Shakespeare's hometown.\n\nTang and Shakespeare were contemporaries and both died in 1616. Although they could never have met, there are common ___37___ (theme)in their works, said Paul Edmondson, head of research for the Shakespeare Birthplace Trust. \"Some of the things that Tang was writing about ___38___ (be)also Shakespeare's concerns. I happen to know that Tang's play The Peony Pavilion (《牡丹亭》) is similar in some ways ___39___ Romeo and Juliet.\"\n\nA statue commemorating Shakespeare and Tang was put up at Shakespeare's Birthplace Garden in 2017. Two years later, a six-meter-tall pavilion, ___40___ (inspire)by The Peony Pavilion, ___41___ (build)at the Firs Garden, just ten minutes' walk from Shakespeare's birthplace.\n\nThose cultural elements have increased Stratford's international ___42___ (visible), said Edmondson, adding that visitors walking through the Birthplace Garden were often amazed ___43___ (find)the connection between the two great writers.\n\n___44___ (recall)watching a Chinese opera version of Shakespeare's play Richard III in Shanghai and meeting Chinese actors who came to Stratford a few years ago to perform parts of The Peony Pavilion, Edmondson said, \"It was very exciting to hear the Chinese language ___45___ see how Tang's play was being performed.\"\n\n为纪念素有\"东方莎士比亚\"之称的汤显祖,一座凉亭在莎士比亚的故乡建立,此举提高了莎士比亚故乡的国际知名度。来此地的游客惊奇地发现东西方的这两位伟大作家的作品有一些共性。\n\n36.",
      "fine_category": "nonpred-doing",
      "nonp_function": "adverbial",
      "nonp_function_label": "作状语",
      "nonp_form": "doing",
      "nonp_form_label": "doing",
      "nonp_rule": "句中已有谓语 said，Edmondson 与 recall 是主谓关系，用 doing 作伴随状语。",
      "nonp_needs_review": false,
      "facets": {
        "form": "doing"
      }
    },
    {
      "id": "2024全国二卷-45",
      "exam_id": "2024全国二卷",
      "year": 2024,
      "type": "真题",
      "no": 45,
      "answer": "and",
      "explanation": "连词。hear the Chinese language和see how Tang's play was being performed是并列关系,故此处应用and连接两个不定式短语,and后承前省略不定式符号to。 ---",
      "grammar_point": "连词",
      "category": "logic",
      "category_name": "逻辑连词",
      "passage": "Chinese cultural elements commemorating (纪念) Tang Xianzu, ___36___ is known as \"the Shakespeare of Asia,\" add an international character to Stratford-upon-Avon, William Shakespeare's hometown.\n\nTang and Shakespeare were contemporaries and both died in 1616. Although they could never have met, there are common ___37___ (theme)in their works, said Paul Edmondson, head of research for the Shakespeare Birthplace Trust. \"Some of the things that Tang was writing about ___38___ (be)also Shakespeare's concerns. I happen to know that Tang's play The Peony Pavilion (《牡丹亭》) is similar in some ways ___39___ Romeo and Juliet.\"\n\nA statue commemorating Shakespeare and Tang was put up at Shakespeare's Birthplace Garden in 2017. Two years later, a six-meter-tall pavilion, ___40___ (inspire)by The Peony Pavilion, ___41___ (build)at the Firs Garden, just ten minutes' walk from Shakespeare's birthplace.\n\nThose cultural elements have increased Stratford's international ___42___ (visible), said Edmondson, adding that visitors walking through the Birthplace Garden were often amazed ___43___ (find)the connection between the two great writers.\n\n___44___ (recall)watching a Chinese opera version of Shakespeare's play Richard III in Shanghai and meeting Chinese actors who came to Stratford a few years ago to perform parts of The Peony Pavilion, Edmondson said, \"It was very exciting to hear the Chinese language ___45___ see how Tang's play was being performed.\"\n\n为纪念素有\"东方莎士比亚\"之称的汤显祖,一座凉亭在莎士比亚的故乡建立,此举提高了莎士比亚故乡的国际知名度。来此地的游客惊奇地发现东西方的这两位伟大作家的作品有一些共性。\n\n36.",
      "fine_category": "logic-coordinating",
      "facets": {
        "word": "and",
        "kind": "coordinating"
      }
    },
    {
      "id": "2024广州一模-36",
      "exam_id": "2024广州一模",
      "year": 2024,
      "type": "模拟卷",
      "no": 36,
      "answer": "dating",
      "explanation": "考查非谓语动词。句意：它们在明清时期的房屋中很常见，这些房屋是为不同世代的亲戚设计的。分析句子结构可知date与逻辑主语homes构成主动关系，故用现在分词作定语。故填dating。",
      "grammar_point": "非谓语动词",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "A skywell, or “tian jing” in Chinese, is a typical feature of a traditional home in Southern and Eastern China. They are commonly seen in homes ___36___ (date) to the Ming and Qing dynasties, which ___37___ (design) to house different generations of relatives. Despite their varied sizes and designs, these skywells are typically square and located in ___38___ heart of the house. They serve to allow in light, enhance airflow, and harvest rainwater.\n\nSince decades ago, the government ___39___ (advocate) green buildings, promoting environmentally-friendly practice. The increased interest towards traditional Chinese architecture is leading to the restoration of historic buildings with skywells ___40___ modern use. Architects are also looking towards the principles behind skywells while designing new buildings ___41___ (save) energy. The Dongguan TBA Tower in Guangdong Province, for example, brings natural airflows into every floor with internal “windpipes”___42___ function in a similar way to skywells. The aim is to keep the building's temperature ___43___ (comfort) in all seasons, using only natural airflow.\n\nThe fact that skywells still exist today shows ___44___ clever ancient builders were in using nature's elements to create energy-sufficient and sustainable living spaces. These timeless architectural ___45___ (wonder) continue to inspire architects in their efforts to find green solutions for cooling homes and buildings.",
      "fine_category": "nonpred-doing",
      "nonp_function": "attribute",
      "nonp_function_label": "作定语",
      "nonp_form": "doing",
      "nonp_form_label": "doing",
      "nonp_rule": "dating 修饰 homes，homes 与 date from 是主谓关系，用 doing 作后置定语。",
      "nonp_needs_review": false,
      "facets": {
        "form": "doing"
      }
    },
    {
      "id": "2024广州一模-37",
      "exam_id": "2024广州一模",
      "year": 2024,
      "type": "模拟卷",
      "no": 37,
      "answer": "were designed",
      "explanation": "考查时态语态。句意：它们在明清时期房屋中很常见，这些房屋是为不同世代的亲戚设计的。此处非限制性定语从句修饰先行词homes，在从句作主语，与谓语构成被动关系，根据上文the Ming and Qing dynasties可知为一般过去时的被动语态，谓语用复数。故填were designed。",
      "grammar_point": "时态语态",
      "category": "predicate",
      "category_name": "谓语动词",
      "passage": "A skywell, or “tian jing” in Chinese, is a typical feature of a traditional home in Southern and Eastern China. They are commonly seen in homes ___36___ (date) to the Ming and Qing dynasties, which ___37___ (design) to house different generations of relatives. Despite their varied sizes and designs, these skywells are typically square and located in ___38___ heart of the house. They serve to allow in light, enhance airflow, and harvest rainwater.\n\nSince decades ago, the government ___39___ (advocate) green buildings, promoting environmentally-friendly practice. The increased interest towards traditional Chinese architecture is leading to the restoration of historic buildings with skywells ___40___ modern use. Architects are also looking towards the principles behind skywells while designing new buildings ___41___ (save) energy. The Dongguan TBA Tower in Guangdong Province, for example, brings natural airflows into every floor with internal “windpipes”___42___ function in a similar way to skywells. The aim is to keep the building's temperature ___43___ (comfort) in all seasons, using only natural airflow.\n\nThe fact that skywells still exist today shows ___44___ clever ancient builders were in using nature's elements to create energy-sufficient and sustainable living spaces. These timeless architectural ___45___ (wonder) continue to inspire architects in their efforts to find green solutions for cooling homes and buildings.",
      "fine_category": "pred-passive-form"
    },
    {
      "id": "2024广州一模-38",
      "exam_id": "2024广州一模",
      "year": 2024,
      "type": "模拟卷",
      "no": 38,
      "answer": "the",
      "explanation": "考查冠词。句意：尽管它们的大小和设计各不相同，但这些天井通常是方形的，位于房屋的中心。此处heart特指房屋的中心，前面应用定冠词。故填the。",
      "grammar_point": "冠词",
      "category": "article",
      "category_name": "冠词",
      "passage": "A skywell, or “tian jing” in Chinese, is a typical feature of a traditional home in Southern and Eastern China. They are commonly seen in homes ___36___ (date) to the Ming and Qing dynasties, which ___37___ (design) to house different generations of relatives. Despite their varied sizes and designs, these skywells are typically square and located in ___38___ heart of the house. They serve to allow in light, enhance airflow, and harvest rainwater.\n\nSince decades ago, the government ___39___ (advocate) green buildings, promoting environmentally-friendly practice. The increased interest towards traditional Chinese architecture is leading to the restoration of historic buildings with skywells ___40___ modern use. Architects are also looking towards the principles behind skywells while designing new buildings ___41___ (save) energy. The Dongguan TBA Tower in Guangdong Province, for example, brings natural airflows into every floor with internal “windpipes”___42___ function in a similar way to skywells. The aim is to keep the building's temperature ___43___ (comfort) in all seasons, using only natural airflow.\n\nThe fact that skywells still exist today shows ___44___ clever ancient builders were in using nature's elements to create energy-sufficient and sustainable living spaces. These timeless architectural ___45___ (wonder) continue to inspire architects in their efforts to find green solutions for cooling homes and buildings.",
      "fine_category": "art-the",
      "facets": {
        "word": "the"
      }
    },
    {
      "id": "2024广州一模-39",
      "exam_id": "2024广州一模",
      "year": 2024,
      "type": "模拟卷",
      "no": 39,
      "answer": "has been advocating",
      "explanation": "考查时态。句意：从几十年前开始，政府就一直提倡绿色建筑，提倡环保的做法。根据上文Since decades ago可知应用现在完成时或现在完成进行时，主语为the government，助动词用has。故填has been advocating/has advocated。",
      "grammar_point": "时态",
      "category": "predicate",
      "category_name": "谓语动词",
      "passage": "A skywell, or “tian jing” in Chinese, is a typical feature of a traditional home in Southern and Eastern China. They are commonly seen in homes ___36___ (date) to the Ming and Qing dynasties, which ___37___ (design) to house different generations of relatives. Despite their varied sizes and designs, these skywells are typically square and located in ___38___ heart of the house. They serve to allow in light, enhance airflow, and harvest rainwater.\n\nSince decades ago, the government ___39___ (advocate) green buildings, promoting environmentally-friendly practice. The increased interest towards traditional Chinese architecture is leading to the restoration of historic buildings with skywells ___40___ modern use. Architects are also looking towards the principles behind skywells while designing new buildings ___41___ (save) energy. The Dongguan TBA Tower in Guangdong Province, for example, brings natural airflows into every floor with internal “windpipes”___42___ function in a similar way to skywells. The aim is to keep the building's temperature ___43___ (comfort) in all seasons, using only natural airflow.\n\nThe fact that skywells still exist today shows ___44___ clever ancient builders were in using nature's elements to create energy-sufficient and sustainable living spaces. These timeless architectural ___45___ (wonder) continue to inspire architects in their efforts to find green solutions for cooling homes and buildings.",
      "fine_category": "pred-tense-perfect"
    },
    {
      "id": "2024广州一模-40",
      "exam_id": "2024广州一模",
      "year": 2024,
      "type": "模拟卷",
      "no": 40,
      "answer": "for",
      "explanation": "考查介词。句意：人们对中国传统建筑的兴趣日益浓厚，这导致了对带有天井的历史建筑进行修复，以供现代使用。短语for/in modern use表示“供……使用”。故填for/in。",
      "grammar_point": "介词",
      "category": "preposition",
      "category_name": "介词",
      "passage": "A skywell, or “tian jing” in Chinese, is a typical feature of a traditional home in Southern and Eastern China. They are commonly seen in homes ___36___ (date) to the Ming and Qing dynasties, which ___37___ (design) to house different generations of relatives. Despite their varied sizes and designs, these skywells are typically square and located in ___38___ heart of the house. They serve to allow in light, enhance airflow, and harvest rainwater.\n\nSince decades ago, the government ___39___ (advocate) green buildings, promoting environmentally-friendly practice. The increased interest towards traditional Chinese architecture is leading to the restoration of historic buildings with skywells ___40___ modern use. Architects are also looking towards the principles behind skywells while designing new buildings ___41___ (save) energy. The Dongguan TBA Tower in Guangdong Province, for example, brings natural airflows into every floor with internal “windpipes”___42___ function in a similar way to skywells. The aim is to keep the building's temperature ___43___ (comfort) in all seasons, using only natural airflow.\n\nThe fact that skywells still exist today shows ___44___ clever ancient builders were in using nature's elements to create energy-sufficient and sustainable living spaces. These timeless architectural ___45___ (wonder) continue to inspire architects in their efforts to find green solutions for cooling homes and buildings.",
      "fine_category": "prep-common",
      "facets": {
        "word": "for"
      }
    },
    {
      "id": "2024广州一模-41",
      "exam_id": "2024广州一模",
      "year": 2024,
      "type": "模拟卷",
      "no": 41,
      "answer": "to save",
      "explanation": "考查非谓语动词。句意：建筑师们在设计新建筑时也在关注天井背后的原则，以节省能源。分析句子结构可知save在句中作目的状语，应用不定式。故填to save。",
      "grammar_point": "非谓语动词",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "A skywell, or “tian jing” in Chinese, is a typical feature of a traditional home in Southern and Eastern China. They are commonly seen in homes ___36___ (date) to the Ming and Qing dynasties, which ___37___ (design) to house different generations of relatives. Despite their varied sizes and designs, these skywells are typically square and located in ___38___ heart of the house. They serve to allow in light, enhance airflow, and harvest rainwater.\n\nSince decades ago, the government ___39___ (advocate) green buildings, promoting environmentally-friendly practice. The increased interest towards traditional Chinese architecture is leading to the restoration of historic buildings with skywells ___40___ modern use. Architects are also looking towards the principles behind skywells while designing new buildings ___41___ (save) energy. The Dongguan TBA Tower in Guangdong Province, for example, brings natural airflows into every floor with internal “windpipes”___42___ function in a similar way to skywells. The aim is to keep the building's temperature ___43___ (comfort) in all seasons, using only natural airflow.\n\nThe fact that skywells still exist today shows ___44___ clever ancient builders were in using nature's elements to create energy-sufficient and sustainable living spaces. These timeless architectural ___45___ (wonder) continue to inspire architects in their efforts to find green solutions for cooling homes and buildings.",
      "fine_category": "nonpred-to-do",
      "nonp_function": "adverbial",
      "nonp_function_label": "作状语",
      "nonp_form": "to_do",
      "nonp_form_label": "to do",
      "nonp_rule": "主句已有谓语 are looking，to save 表目的，说明关注天井原则的目的。",
      "nonp_needs_review": false,
      "facets": {
        "form": "to-do"
      }
    },
    {
      "id": "2024广州一模-42",
      "exam_id": "2024广州一模",
      "year": 2024,
      "type": "模拟卷",
      "no": 42,
      "answer": "which",
      "explanation": "考查定语从句。句意：例如，广东省东莞TBA大厦通过内部“气管”将自然气流引入每层，其功能与天井类似。定语从句修饰先行词windpipes，关系词在从句作主语，指物，故填which/that。",
      "grammar_point": "定语从句",
      "category": "attrib",
      "category_name": "定语从句",
      "passage": "A skywell, or “tian jing” in Chinese, is a typical feature of a traditional home in Southern and Eastern China. They are commonly seen in homes ___36___ (date) to the Ming and Qing dynasties, which ___37___ (design) to house different generations of relatives. Despite their varied sizes and designs, these skywells are typically square and located in ___38___ heart of the house. They serve to allow in light, enhance airflow, and harvest rainwater.\n\nSince decades ago, the government ___39___ (advocate) green buildings, promoting environmentally-friendly practice. The increased interest towards traditional Chinese architecture is leading to the restoration of historic buildings with skywells ___40___ modern use. Architects are also looking towards the principles behind skywells while designing new buildings ___41___ (save) energy. The Dongguan TBA Tower in Guangdong Province, for example, brings natural airflows into every floor with internal “windpipes”___42___ function in a similar way to skywells. The aim is to keep the building's temperature ___43___ (comfort) in all seasons, using only natural airflow.\n\nThe fact that skywells still exist today shows ___44___ clever ancient builders were in using nature's elements to create energy-sufficient and sustainable living spaces. These timeless architectural ___45___ (wonder) continue to inspire architects in their efforts to find green solutions for cooling homes and buildings.",
      "fine_category": "attrib-pronoun",
      "facets": {
        "type": "relative-pronoun",
        "word": "which",
        "restrictive": true
      }
    },
    {
      "id": "2024广州一模-43",
      "exam_id": "2024广州一模",
      "year": 2024,
      "type": "模拟卷",
      "no": 43,
      "answer": "comfortable",
      "explanation": "考查形容词。句意：其目的是在所有季节保持建筑的温度舒适，只使用自然气流。此处作宾补，表示“舒适的”应用形容词comfortable。故填comfortable。",
      "grammar_point": "形容词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "A skywell, or “tian jing” in Chinese, is a typical feature of a traditional home in Southern and Eastern China. They are commonly seen in homes ___36___ (date) to the Ming and Qing dynasties, which ___37___ (design) to house different generations of relatives. Despite their varied sizes and designs, these skywells are typically square and located in ___38___ heart of the house. They serve to allow in light, enhance airflow, and harvest rainwater.\n\nSince decades ago, the government ___39___ (advocate) green buildings, promoting environmentally-friendly practice. The increased interest towards traditional Chinese architecture is leading to the restoration of historic buildings with skywells ___40___ modern use. Architects are also looking towards the principles behind skywells while designing new buildings ___41___ (save) energy. The Dongguan TBA Tower in Guangdong Province, for example, brings natural airflows into every floor with internal “windpipes”___42___ function in a similar way to skywells. The aim is to keep the building's temperature ___43___ (comfort) in all seasons, using only natural airflow.\n\nThe fact that skywells still exist today shows ___44___ clever ancient builders were in using nature's elements to create energy-sufficient and sustainable living spaces. These timeless architectural ___45___ (wonder) continue to inspire architects in their efforts to find green solutions for cooling homes and buildings.",
      "fine_category": "word-adj",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2024广州一模-44",
      "exam_id": "2024广州一模",
      "year": 2024,
      "type": "模拟卷",
      "no": 44,
      "answer": "how",
      "explanation": "考查宾语从句。句意：事实上，今天仍然存在的天井表明，古代的建筑者是多么聪明，他们利用自然的元素来创造能源充足和可持续的生活空间。引导宾语从句，表示“多么聪明”应用how。故填how。",
      "grammar_point": "宾语从句",
      "category": "nounclause",
      "category_name": "名词性从句",
      "passage": "A skywell, or “tian jing” in Chinese, is a typical feature of a traditional home in Southern and Eastern China. They are commonly seen in homes ___36___ (date) to the Ming and Qing dynasties, which ___37___ (design) to house different generations of relatives. Despite their varied sizes and designs, these skywells are typically square and located in ___38___ heart of the house. They serve to allow in light, enhance airflow, and harvest rainwater.\n\nSince decades ago, the government ___39___ (advocate) green buildings, promoting environmentally-friendly practice. The increased interest towards traditional Chinese architecture is leading to the restoration of historic buildings with skywells ___40___ modern use. Architects are also looking towards the principles behind skywells while designing new buildings ___41___ (save) energy. The Dongguan TBA Tower in Guangdong Province, for example, brings natural airflows into every floor with internal “windpipes”___42___ function in a similar way to skywells. The aim is to keep the building's temperature ___43___ (comfort) in all seasons, using only natural airflow.\n\nThe fact that skywells still exist today shows ___44___ clever ancient builders were in using nature's elements to create energy-sufficient and sustainable living spaces. These timeless architectural ___45___ (wonder) continue to inspire architects in their efforts to find green solutions for cooling homes and buildings.",
      "fine_category": "nounc-wh-adverb",
      "facets": {
        "type": "wh-adverb",
        "word": "how"
      }
    },
    {
      "id": "2024广州一模-45",
      "exam_id": "2024广州一模",
      "year": 2024,
      "type": "模拟卷",
      "no": 45,
      "answer": "wonders",
      "explanation": "考查名词的数。句意：这些永恒的建筑奇迹继续激励着建筑师们努力寻找绿色解决方案来为房屋和建筑物降温。根据上文these可知wonder应用复数形式。故填wonders。",
      "grammar_point": "名词的数",
      "category": "number",
      "category_name": "名词/数词",
      "passage": "A skywell, or “tian jing” in Chinese, is a typical feature of a traditional home in Southern and Eastern China. They are commonly seen in homes ___36___ (date) to the Ming and Qing dynasties, which ___37___ (design) to house different generations of relatives. Despite their varied sizes and designs, these skywells are typically square and located in ___38___ heart of the house. They serve to allow in light, enhance airflow, and harvest rainwater.\n\nSince decades ago, the government ___39___ (advocate) green buildings, promoting environmentally-friendly practice. The increased interest towards traditional Chinese architecture is leading to the restoration of historic buildings with skywells ___40___ modern use. Architects are also looking towards the principles behind skywells while designing new buildings ___41___ (save) energy. The Dongguan TBA Tower in Guangdong Province, for example, brings natural airflows into every floor with internal “windpipes”___42___ function in a similar way to skywells. The aim is to keep the building's temperature ___43___ (comfort) in all seasons, using only natural airflow.\n\nThe fact that skywells still exist today shows ___44___ clever ancient builders were in using nature's elements to create energy-sufficient and sustainable living spaces. These timeless architectural ___45___ (wonder) continue to inspire architects in their efforts to find green solutions for cooling homes and buildings.",
      "fine_category": "num-plural",
      "facets": {
        "type": "plural"
      }
    },
    {
      "id": "2024广州二模-36",
      "exam_id": "2024广州二模",
      "year": 2024,
      "type": "模拟卷",
      "no": 36,
      "answer": "which",
      "explanation": "考查定语从句。句意：十多年前，古塔爱好者吴锴正在寻找一本书，这本书用优质的介绍和图像全面详细地介绍古塔的总数和位置。空处引导一个定语从句，先行词为指物的a book，且空处在从句中作主语，所以应用which或that引导。故填which/that。",
      "grammar_point": "定语从句",
      "category": "attrib",
      "category_name": "定语从句",
      "passage": "Over a decade ago, Wu Kai, an enthusiast of ancient pagodas (塔), was looking for a book ___36___ comprehensively detailed the total number and locations of pagodas with quality introductions and images.\n\n“I read extensively but found the books available had limited information and few good pictures,” he explains. Dissatisfied with the ___37___ (exist) options, Wu decided to create his own. Despite an estimated 10,000 ancient pagodas nationwide, many remain unaccounted for due to___38___ (they) remote locations and poor conditions.\n\nVisiting hilltop or cliff-top pagodas, or those hidden in deep forests, ___39___ (require) great determination, physical strength and even luck, ___40___ few people get to see them in person. For those who do, there’s the added challenge of taking good pictures, especially those suitable___41___ print.\n\n___42___ (fortunate), Wu’s plan was applauded by like-minded enthusiasts, who generously contributed great ___43___ (photo). In 2019, Wu published a 500-page book introducing over 300 ancient pagodas in Beijing. He then continued to work with Wang Xuebin, one of the enthusiasts. In 2023, their weighty 960-page book ___44___ (release), entitled The l,001 Chinese Ancient Pagodas You Must See Before You Die.\n\n“In each pagoda, I see the beauty of our heritage and the ___45___ (lose) values of simplicity, perfection, and respect for nature in modern life,” Wu writes in the introduction. “Across the vast land of China, no two pagodas are completely identical.”",
      "fine_category": "attrib-pronoun",
      "facets": {
        "type": "relative-pronoun",
        "word": "which",
        "restrictive": true
      }
    },
    {
      "id": "2024广州二模-37",
      "exam_id": "2024广州二模",
      "year": 2024,
      "type": "模拟卷",
      "no": 37,
      "answer": "existing",
      "explanation": "考查形容词。句意：吴对现有的书籍选择感到不满意，决定创造自己的书。空处作定语修饰options，应用形容词。existing意为“现存的”，和existent(现有的)意思一致。故填existing/existent。",
      "grammar_point": "形容词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "Over a decade ago, Wu Kai, an enthusiast of ancient pagodas (塔), was looking for a book ___36___ comprehensively detailed the total number and locations of pagodas with quality introductions and images.\n\n“I read extensively but found the books available had limited information and few good pictures,” he explains. Dissatisfied with the ___37___ (exist) options, Wu decided to create his own. Despite an estimated 10,000 ancient pagodas nationwide, many remain unaccounted for due to___38___ (they) remote locations and poor conditions.\n\nVisiting hilltop or cliff-top pagodas, or those hidden in deep forests, ___39___ (require) great determination, physical strength and even luck, ___40___ few people get to see them in person. For those who do, there’s the added challenge of taking good pictures, especially those suitable___41___ print.\n\n___42___ (fortunate), Wu’s plan was applauded by like-minded enthusiasts, who generously contributed great ___43___ (photo). In 2019, Wu published a 500-page book introducing over 300 ancient pagodas in Beijing. He then continued to work with Wang Xuebin, one of the enthusiasts. In 2023, their weighty 960-page book ___44___ (release), entitled The l,001 Chinese Ancient Pagodas You Must See Before You Die.\n\n“In each pagoda, I see the beauty of our heritage and the ___45___ (lose) values of simplicity, perfection, and respect for nature in modern life,” Wu writes in the introduction. “Across the vast land of China, no two pagodas are completely identical.”",
      "fine_category": "word-adj",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2024广州二模-38",
      "exam_id": "2024广州二模",
      "year": 2024,
      "type": "模拟卷",
      "no": 38,
      "answer": "their",
      "explanation": "考查代词。句意：尽管全国估计有10000座古塔，但由于位置偏远和条件恶劣，许多古塔仍下落不明。空处作定语修饰其后的remote locations and poor conditions，应用形容词性物主代词their。故填their。",
      "grammar_point": "代词",
      "category": "pronoun",
      "category_name": "代词",
      "passage": "Over a decade ago, Wu Kai, an enthusiast of ancient pagodas (塔), was looking for a book ___36___ comprehensively detailed the total number and locations of pagodas with quality introductions and images.\n\n“I read extensively but found the books available had limited information and few good pictures,” he explains. Dissatisfied with the ___37___ (exist) options, Wu decided to create his own. Despite an estimated 10,000 ancient pagodas nationwide, many remain unaccounted for due to___38___ (they) remote locations and poor conditions.\n\nVisiting hilltop or cliff-top pagodas, or those hidden in deep forests, ___39___ (require) great determination, physical strength and even luck, ___40___ few people get to see them in person. For those who do, there’s the added challenge of taking good pictures, especially those suitable___41___ print.\n\n___42___ (fortunate), Wu’s plan was applauded by like-minded enthusiasts, who generously contributed great ___43___ (photo). In 2019, Wu published a 500-page book introducing over 300 ancient pagodas in Beijing. He then continued to work with Wang Xuebin, one of the enthusiasts. In 2023, their weighty 960-page book ___44___ (release), entitled The l,001 Chinese Ancient Pagodas You Must See Before You Die.\n\n“In each pagoda, I see the beauty of our heritage and the ___45___ (lose) values of simplicity, perfection, and respect for nature in modern life,” Wu writes in the introduction. “Across the vast land of China, no two pagodas are completely identical.”",
      "fine_category": "pron-personal",
      "facets": {
        "type": "personal"
      }
    },
    {
      "id": "2024广州二模-39",
      "exam_id": "2024广州二模",
      "year": 2024,
      "type": "模拟卷",
      "no": 39,
      "answer": "requires",
      "explanation": "考查时态和主谓一致。句意：参观山顶或悬崖顶的宝塔，或那些隐藏在深林中的宝塔，需要极大的决心、体力甚至运气，所以很少有人能亲自看到它们。本句陈述的是客观事实，应用一般现在时。空处作句子的谓语，主语为动名词短语Visiting...，所以谓语应用单数。故填requires。",
      "grammar_point": "时态和主谓一致",
      "category": "predicate",
      "category_name": "谓语动词",
      "passage": "Over a decade ago, Wu Kai, an enthusiast of ancient pagodas (塔), was looking for a book ___36___ comprehensively detailed the total number and locations of pagodas with quality introductions and images.\n\n“I read extensively but found the books available had limited information and few good pictures,” he explains. Dissatisfied with the ___37___ (exist) options, Wu decided to create his own. Despite an estimated 10,000 ancient pagodas nationwide, many remain unaccounted for due to___38___ (they) remote locations and poor conditions.\n\nVisiting hilltop or cliff-top pagodas, or those hidden in deep forests, ___39___ (require) great determination, physical strength and even luck, ___40___ few people get to see them in person. For those who do, there’s the added challenge of taking good pictures, especially those suitable___41___ print.\n\n___42___ (fortunate), Wu’s plan was applauded by like-minded enthusiasts, who generously contributed great ___43___ (photo). In 2019, Wu published a 500-page book introducing over 300 ancient pagodas in Beijing. He then continued to work with Wang Xuebin, one of the enthusiasts. In 2023, their weighty 960-page book ___44___ (release), entitled The l,001 Chinese Ancient Pagodas You Must See Before You Die.\n\n“In each pagoda, I see the beauty of our heritage and the ___45___ (lose) values of simplicity, perfection, and respect for nature in modern life,” Wu writes in the introduction. “Across the vast land of China, no two pagodas are completely identical.”",
      "fine_category": "pred-sva-form"
    },
    {
      "id": "2024广州二模-40",
      "exam_id": "2024广州二模",
      "year": 2024,
      "type": "模拟卷",
      "no": 40,
      "answer": "so",
      "explanation": "考查连词。句意参考上题。“Visiting hilltop or cliff-top pagodas, or those hidden in deep forests, ___4___(require) great determination, physical strength and even luck”和“few people get to see them in person”之间是因果关系，前为因，后为果，所以应用so连接。故填so。",
      "grammar_point": "连词",
      "category": "logic",
      "category_name": "逻辑连词",
      "passage": "Over a decade ago, Wu Kai, an enthusiast of ancient pagodas (塔), was looking for a book ___36___ comprehensively detailed the total number and locations of pagodas with quality introductions and images.\n\n“I read extensively but found the books available had limited information and few good pictures,” he explains. Dissatisfied with the ___37___ (exist) options, Wu decided to create his own. Despite an estimated 10,000 ancient pagodas nationwide, many remain unaccounted for due to___38___ (they) remote locations and poor conditions.\n\nVisiting hilltop or cliff-top pagodas, or those hidden in deep forests, ___39___ (require) great determination, physical strength and even luck, ___40___ few people get to see them in person. For those who do, there’s the added challenge of taking good pictures, especially those suitable___41___ print.\n\n___42___ (fortunate), Wu’s plan was applauded by like-minded enthusiasts, who generously contributed great ___43___ (photo). In 2019, Wu published a 500-page book introducing over 300 ancient pagodas in Beijing. He then continued to work with Wang Xuebin, one of the enthusiasts. In 2023, their weighty 960-page book ___44___ (release), entitled The l,001 Chinese Ancient Pagodas You Must See Before You Die.\n\n“In each pagoda, I see the beauty of our heritage and the ___45___ (lose) values of simplicity, perfection, and respect for nature in modern life,” Wu writes in the introduction. “Across the vast land of China, no two pagodas are completely identical.”",
      "fine_category": "logic-coordinating",
      "facets": {
        "word": "so",
        "kind": "coordinating"
      }
    },
    {
      "id": "2024广州二模-41",
      "exam_id": "2024广州二模",
      "year": 2024,
      "type": "模拟卷",
      "no": 41,
      "answer": "for",
      "explanation": "考查介词。句意：对于那些这样做的人来说，拍摄好照片是一个额外的挑战，尤其是那些适合印刷的照片。suitable for...意为“适合……”，为固定搭配。故填for。",
      "grammar_point": "介词",
      "category": "preposition",
      "category_name": "介词",
      "passage": "Over a decade ago, Wu Kai, an enthusiast of ancient pagodas (塔), was looking for a book ___36___ comprehensively detailed the total number and locations of pagodas with quality introductions and images.\n\n“I read extensively but found the books available had limited information and few good pictures,” he explains. Dissatisfied with the ___37___ (exist) options, Wu decided to create his own. Despite an estimated 10,000 ancient pagodas nationwide, many remain unaccounted for due to___38___ (they) remote locations and poor conditions.\n\nVisiting hilltop or cliff-top pagodas, or those hidden in deep forests, ___39___ (require) great determination, physical strength and even luck, ___40___ few people get to see them in person. For those who do, there’s the added challenge of taking good pictures, especially those suitable___41___ print.\n\n___42___ (fortunate), Wu’s plan was applauded by like-minded enthusiasts, who generously contributed great ___43___ (photo). In 2019, Wu published a 500-page book introducing over 300 ancient pagodas in Beijing. He then continued to work with Wang Xuebin, one of the enthusiasts. In 2023, their weighty 960-page book ___44___ (release), entitled The l,001 Chinese Ancient Pagodas You Must See Before You Die.\n\n“In each pagoda, I see the beauty of our heritage and the ___45___ (lose) values of simplicity, perfection, and respect for nature in modern life,” Wu writes in the introduction. “Across the vast land of China, no two pagodas are completely identical.”",
      "fine_category": "prep-other",
      "facets": {
        "word": "for"
      }
    },
    {
      "id": "2024广州二模-42",
      "exam_id": "2024广州二模",
      "year": 2024,
      "type": "模拟卷",
      "no": 42,
      "answer": "Fortunately",
      "explanation": "考查副词。句意：幸运的是，吴的计划得到了志同道合的爱好者的赞赏，他们慷慨地贡献了很棒的照片。根据“Wu’s plan was applauded by like-minded enthusiasts, who generously contributed great ___8___(photo)”可知，吴锴的计划得到了志同道合的爱好者的赞赏，这些人给他提供了许多照片，这是一件幸事。空处修饰整个句子，应用副词fortunately，意为“幸运地”。故填Fortunately。",
      "grammar_point": "副词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "Over a decade ago, Wu Kai, an enthusiast of ancient pagodas (塔), was looking for a book ___36___ comprehensively detailed the total number and locations of pagodas with quality introductions and images.\n\n“I read extensively but found the books available had limited information and few good pictures,” he explains. Dissatisfied with the ___37___ (exist) options, Wu decided to create his own. Despite an estimated 10,000 ancient pagodas nationwide, many remain unaccounted for due to___38___ (they) remote locations and poor conditions.\n\nVisiting hilltop or cliff-top pagodas, or those hidden in deep forests, ___39___ (require) great determination, physical strength and even luck, ___40___ few people get to see them in person. For those who do, there’s the added challenge of taking good pictures, especially those suitable___41___ print.\n\n___42___ (fortunate), Wu’s plan was applauded by like-minded enthusiasts, who generously contributed great ___43___ (photo). In 2019, Wu published a 500-page book introducing over 300 ancient pagodas in Beijing. He then continued to work with Wang Xuebin, one of the enthusiasts. In 2023, their weighty 960-page book ___44___ (release), entitled The l,001 Chinese Ancient Pagodas You Must See Before You Die.\n\n“In each pagoda, I see the beauty of our heritage and the ___45___ (lose) values of simplicity, perfection, and respect for nature in modern life,” Wu writes in the introduction. “Across the vast land of China, no two pagodas are completely identical.”",
      "fine_category": "word-adv",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2024广州二模-43",
      "exam_id": "2024广州二模",
      "year": 2024,
      "type": "模拟卷",
      "no": 43,
      "answer": "photos",
      "explanation": "考查名词的数。句意参考上题。photo意为“照片”，为可数名词，其前没有表示数量的限定词，应用名词复数。故填photos。",
      "grammar_point": "名词的数",
      "category": "number",
      "category_name": "名词/数词",
      "passage": "Over a decade ago, Wu Kai, an enthusiast of ancient pagodas (塔), was looking for a book ___36___ comprehensively detailed the total number and locations of pagodas with quality introductions and images.\n\n“I read extensively but found the books available had limited information and few good pictures,” he explains. Dissatisfied with the ___37___ (exist) options, Wu decided to create his own. Despite an estimated 10,000 ancient pagodas nationwide, many remain unaccounted for due to___38___ (they) remote locations and poor conditions.\n\nVisiting hilltop or cliff-top pagodas, or those hidden in deep forests, ___39___ (require) great determination, physical strength and even luck, ___40___ few people get to see them in person. For those who do, there’s the added challenge of taking good pictures, especially those suitable___41___ print.\n\n___42___ (fortunate), Wu’s plan was applauded by like-minded enthusiasts, who generously contributed great ___43___ (photo). In 2019, Wu published a 500-page book introducing over 300 ancient pagodas in Beijing. He then continued to work with Wang Xuebin, one of the enthusiasts. In 2023, their weighty 960-page book ___44___ (release), entitled The l,001 Chinese Ancient Pagodas You Must See Before You Die.\n\n“In each pagoda, I see the beauty of our heritage and the ___45___ (lose) values of simplicity, perfection, and respect for nature in modern life,” Wu writes in the introduction. “Across the vast land of China, no two pagodas are completely identical.”",
      "fine_category": "num-plural",
      "facets": {
        "type": "plural"
      }
    },
    {
      "id": "2024广州二模-44",
      "exam_id": "2024广州二模",
      "year": 2024,
      "type": "模拟卷",
      "no": 44,
      "answer": "was released",
      "explanation": "考查时态、语态和主谓一致。句意：2023年，他们出版了960页厚的书，书名为《有生之年一定要看的1001座中国古塔》。根据“In 2023”可知，这里表示过去发生的事情，应用一般过去时。主语their weighty 960-page book和release之间是动宾关系，应用被动语态，且be动词应用was。故填was released。",
      "grammar_point": "时态、语态和主谓一致",
      "category": "predicate",
      "category_name": "谓语动词",
      "passage": "Over a decade ago, Wu Kai, an enthusiast of ancient pagodas (塔), was looking for a book ___36___ comprehensively detailed the total number and locations of pagodas with quality introductions and images.\n\n“I read extensively but found the books available had limited information and few good pictures,” he explains. Dissatisfied with the ___37___ (exist) options, Wu decided to create his own. Despite an estimated 10,000 ancient pagodas nationwide, many remain unaccounted for due to___38___ (they) remote locations and poor conditions.\n\nVisiting hilltop or cliff-top pagodas, or those hidden in deep forests, ___39___ (require) great determination, physical strength and even luck, ___40___ few people get to see them in person. For those who do, there’s the added challenge of taking good pictures, especially those suitable___41___ print.\n\n___42___ (fortunate), Wu’s plan was applauded by like-minded enthusiasts, who generously contributed great ___43___ (photo). In 2019, Wu published a 500-page book introducing over 300 ancient pagodas in Beijing. He then continued to work with Wang Xuebin, one of the enthusiasts. In 2023, their weighty 960-page book ___44___ (release), entitled The l,001 Chinese Ancient Pagodas You Must See Before You Die.\n\n“In each pagoda, I see the beauty of our heritage and the ___45___ (lose) values of simplicity, perfection, and respect for nature in modern life,” Wu writes in the introduction. “Across the vast land of China, no two pagodas are completely identical.”",
      "fine_category": "pred-passive-form"
    },
    {
      "id": "2024广州二模-45",
      "exam_id": "2024广州二模",
      "year": 2024,
      "type": "模拟卷",
      "no": 45,
      "answer": "lost",
      "explanation": "考查形容词。句意：吴在引言中写道：“在每一座塔中，我都看到了我们遗产的美丽，以及现代生活中失去的简单、完美和尊重自然的价值观。”空处作定语修饰values，应用形容词。lost意为“失去的”。故填lost。",
      "grammar_point": "形容词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "Over a decade ago, Wu Kai, an enthusiast of ancient pagodas (塔), was looking for a book ___36___ comprehensively detailed the total number and locations of pagodas with quality introductions and images.\n\n“I read extensively but found the books available had limited information and few good pictures,” he explains. Dissatisfied with the ___37___ (exist) options, Wu decided to create his own. Despite an estimated 10,000 ancient pagodas nationwide, many remain unaccounted for due to___38___ (they) remote locations and poor conditions.\n\nVisiting hilltop or cliff-top pagodas, or those hidden in deep forests, ___39___ (require) great determination, physical strength and even luck, ___40___ few people get to see them in person. For those who do, there’s the added challenge of taking good pictures, especially those suitable___41___ print.\n\n___42___ (fortunate), Wu’s plan was applauded by like-minded enthusiasts, who generously contributed great ___43___ (photo). In 2019, Wu published a 500-page book introducing over 300 ancient pagodas in Beijing. He then continued to work with Wang Xuebin, one of the enthusiasts. In 2023, their weighty 960-page book ___44___ (release), entitled The l,001 Chinese Ancient Pagodas You Must See Before You Die.\n\n“In each pagoda, I see the beauty of our heritage and the ___45___ (lose) values of simplicity, perfection, and respect for nature in modern life,” Wu writes in the introduction. “Across the vast land of China, no two pagodas are completely identical.”",
      "fine_category": "word-adj",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2024浙江首考-56",
      "exam_id": "2024浙江首考",
      "year": 2024,
      "type": "真题",
      "no": 56,
      "answer": "to benefit",
      "explanation": "考查非谓语动词。buying extra 的目的或结果是 benefit from price reductions，此处用不定式作目的状语，填 to benefit。",
      "grammar_point": "非谓语动词",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "The shelves in most supermarkets are full of family-size this and multi-buy that. However, if you're shopping for one, buying extra ___56___ (benefit) from price reductions doesn't make sense. Either your shopping is then too heavy to carry home, ___57___ you can't use what you've bought while it's still fresh. Of course, shops are not charities—they price goods in the way ___58___ will make them the most money. If most of their customers are happy to buy larger quantities, that's ___59___ they'll promote. But that leaves the solo (单独) customers out of pocket and disappointed.\n\nMany supermarkets are no longer doing \"buy one get one free\" promotions because of the ___60___ (criticize) that they lead to waste. Consumers prefer money off individual items. However, though it's nice to get a few cents off a pack of sausages, it would help even more if they could sometimes ___61___ (offer) in smaller packs. Even the biggest sausage fan doesn't want to eat them every day.\n\nIf your supermarket sells loose produce, then buying smaller quantities is easier. Over the last two years, some supermarkets ___62___ (start) selling chicken or salad in packs ___63___ (design) with two halves containing separate portions (份). Then, when you use one section, ___64___ other stays fresh.\n\nWho knows, perhaps some of the more forward looking ___65___ (one) may yet come out with a whole range of \"just for you\" pack sizes with special offers as well.",
      "fine_category": "nonpred-to-do",
      "nonp_function": "adverbial",
      "nonp_function_label": "作状语",
      "nonp_form": "to_do",
      "nonp_form_label": "to do",
      "nonp_rule": "buying extra 后接 to benefit from price reductions，to do 表目的。",
      "nonp_needs_review": false,
      "facets": {
        "form": "to-do"
      }
    },
    {
      "id": "2024浙江首考-57",
      "exam_id": "2024浙江首考",
      "year": 2024,
      "type": "真题",
      "no": 57,
      "answer": "or",
      "explanation": "考查连词。Either...or... 为固定搭配，表示“要么……要么……”，应用 or。",
      "grammar_point": "连词",
      "category": "logic",
      "category_name": "逻辑连词",
      "passage": "The shelves in most supermarkets are full of family-size this and multi-buy that. However, if you're shopping for one, buying extra ___56___ (benefit) from price reductions doesn't make sense. Either your shopping is then too heavy to carry home, ___57___ you can't use what you've bought while it's still fresh. Of course, shops are not charities—they price goods in the way ___58___ will make them the most money. If most of their customers are happy to buy larger quantities, that's ___59___ they'll promote. But that leaves the solo (单独) customers out of pocket and disappointed.\n\nMany supermarkets are no longer doing \"buy one get one free\" promotions because of the ___60___ (criticize) that they lead to waste. Consumers prefer money off individual items. However, though it's nice to get a few cents off a pack of sausages, it would help even more if they could sometimes ___61___ (offer) in smaller packs. Even the biggest sausage fan doesn't want to eat them every day.\n\nIf your supermarket sells loose produce, then buying smaller quantities is easier. Over the last two years, some supermarkets ___62___ (start) selling chicken or salad in packs ___63___ (design) with two halves containing separate portions (份). Then, when you use one section, ___64___ other stays fresh.\n\nWho knows, perhaps some of the more forward looking ___65___ (one) may yet come out with a whole range of \"just for you\" pack sizes with special offers as well.",
      "fine_category": "logic-coordinating",
      "facets": {
        "word": "or",
        "kind": "correlative"
      }
    },
    {
      "id": "2024浙江首考-58",
      "exam_id": "2024浙江首考",
      "year": 2024,
      "type": "真题",
      "no": 58,
      "answer": "that",
      "explanation": "考查定语从句。先行词为 the way，关系词在从句中作主语，且 way 前有 the 限定，此处用 that。",
      "grammar_point": "定语从句",
      "category": "attrib",
      "category_name": "定语从句",
      "passage": "The shelves in most supermarkets are full of family-size this and multi-buy that. However, if you're shopping for one, buying extra ___56___ (benefit) from price reductions doesn't make sense. Either your shopping is then too heavy to carry home, ___57___ you can't use what you've bought while it's still fresh. Of course, shops are not charities—they price goods in the way ___58___ will make them the most money. If most of their customers are happy to buy larger quantities, that's ___59___ they'll promote. But that leaves the solo (单独) customers out of pocket and disappointed.\n\nMany supermarkets are no longer doing \"buy one get one free\" promotions because of the ___60___ (criticize) that they lead to waste. Consumers prefer money off individual items. However, though it's nice to get a few cents off a pack of sausages, it would help even more if they could sometimes ___61___ (offer) in smaller packs. Even the biggest sausage fan doesn't want to eat them every day.\n\nIf your supermarket sells loose produce, then buying smaller quantities is easier. Over the last two years, some supermarkets ___62___ (start) selling chicken or salad in packs ___63___ (design) with two halves containing separate portions (份). Then, when you use one section, ___64___ other stays fresh.\n\nWho knows, perhaps some of the more forward looking ___65___ (one) may yet come out with a whole range of \"just for you\" pack sizes with special offers as well.",
      "fine_category": "attrib-pronoun",
      "facets": {
        "type": "relative-pronoun",
        "word": "that",
        "restrictive": true
      }
    },
    {
      "id": "2024浙江首考-59",
      "exam_id": "2024浙江首考",
      "year": 2024,
      "type": "真题",
      "no": 59,
      "answer": "what",
      "explanation": "考查表语从句。空格引导表语从句，并在从句中作 promote 的宾语，表示“他们会推广的东西”，用 what。",
      "grammar_point": "名词性从句",
      "category": "nounclause",
      "category_name": "名词性从句",
      "passage": "The shelves in most supermarkets are full of family-size this and multi-buy that. However, if you're shopping for one, buying extra ___56___ (benefit) from price reductions doesn't make sense. Either your shopping is then too heavy to carry home, ___57___ you can't use what you've bought while it's still fresh. Of course, shops are not charities—they price goods in the way ___58___ will make them the most money. If most of their customers are happy to buy larger quantities, that's ___59___ they'll promote. But that leaves the solo (单独) customers out of pocket and disappointed.\n\nMany supermarkets are no longer doing \"buy one get one free\" promotions because of the ___60___ (criticize) that they lead to waste. Consumers prefer money off individual items. However, though it's nice to get a few cents off a pack of sausages, it would help even more if they could sometimes ___61___ (offer) in smaller packs. Even the biggest sausage fan doesn't want to eat them every day.\n\nIf your supermarket sells loose produce, then buying smaller quantities is easier. Over the last two years, some supermarkets ___62___ (start) selling chicken or salad in packs ___63___ (design) with two halves containing separate portions (份). Then, when you use one section, ___64___ other stays fresh.\n\nWho knows, perhaps some of the more forward looking ___65___ (one) may yet come out with a whole range of \"just for you\" pack sizes with special offers as well.",
      "fine_category": "nounc-wh-pronoun",
      "facets": {
        "type": "wh-pronoun",
        "word": "what"
      }
    },
    {
      "id": "2024浙江首考-60",
      "exam_id": "2024浙江首考",
      "year": 2024,
      "type": "真题",
      "no": 60,
      "answer": "criticism",
      "explanation": "考查名词。空格前有定冠词 the，后接同位语从句 that they lead to waste，应用名词 criticism。",
      "grammar_point": "名词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "The shelves in most supermarkets are full of family-size this and multi-buy that. However, if you're shopping for one, buying extra ___56___ (benefit) from price reductions doesn't make sense. Either your shopping is then too heavy to carry home, ___57___ you can't use what you've bought while it's still fresh. Of course, shops are not charities—they price goods in the way ___58___ will make them the most money. If most of their customers are happy to buy larger quantities, that's ___59___ they'll promote. But that leaves the solo (单独) customers out of pocket and disappointed.\n\nMany supermarkets are no longer doing \"buy one get one free\" promotions because of the ___60___ (criticize) that they lead to waste. Consumers prefer money off individual items. However, though it's nice to get a few cents off a pack of sausages, it would help even more if they could sometimes ___61___ (offer) in smaller packs. Even the biggest sausage fan doesn't want to eat them every day.\n\nIf your supermarket sells loose produce, then buying smaller quantities is easier. Over the last two years, some supermarkets ___62___ (start) selling chicken or salad in packs ___63___ (design) with two halves containing separate portions (份). Then, when you use one section, ___64___ other stays fresh.\n\nWho knows, perhaps some of the more forward looking ___65___ (one) may yet come out with a whole range of \"just for you\" pack sizes with special offers as well.",
      "fine_category": "word-noun",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2024浙江首考-61",
      "exam_id": "2024浙江首考",
      "year": 2024,
      "type": "真题",
      "no": 61,
      "answer": "be offered",
      "explanation": "考查被动语态。they 指商品，与 offer 是被动关系，且位于 could 后，应用 be offered。",
      "grammar_point": "谓语动词",
      "category": "predicate",
      "category_name": "谓语动词",
      "passage": "The shelves in most supermarkets are full of family-size this and multi-buy that. However, if you're shopping for one, buying extra ___56___ (benefit) from price reductions doesn't make sense. Either your shopping is then too heavy to carry home, ___57___ you can't use what you've bought while it's still fresh. Of course, shops are not charities—they price goods in the way ___58___ will make them the most money. If most of their customers are happy to buy larger quantities, that's ___59___ they'll promote. But that leaves the solo (单独) customers out of pocket and disappointed.\n\nMany supermarkets are no longer doing \"buy one get one free\" promotions because of the ___60___ (criticize) that they lead to waste. Consumers prefer money off individual items. However, though it's nice to get a few cents off a pack of sausages, it would help even more if they could sometimes ___61___ (offer) in smaller packs. Even the biggest sausage fan doesn't want to eat them every day.\n\nIf your supermarket sells loose produce, then buying smaller quantities is easier. Over the last two years, some supermarkets ___62___ (start) selling chicken or salad in packs ___63___ (design) with two halves containing separate portions (份). Then, when you use one section, ___64___ other stays fresh.\n\nWho knows, perhaps some of the more forward looking ___65___ (one) may yet come out with a whole range of \"just for you\" pack sizes with special offers as well.",
      "fine_category": "pred-passive-form"
    },
    {
      "id": "2024浙江首考-62",
      "exam_id": "2024浙江首考",
      "year": 2024,
      "type": "真题",
      "no": 62,
      "answer": "have started",
      "explanation": "考查谓语动词。时间状语 Over the last two years 常与现在完成时连用，主语 some supermarkets 为复数，填 have started。",
      "grammar_point": "谓语动词",
      "category": "predicate",
      "category_name": "谓语动词",
      "passage": "The shelves in most supermarkets are full of family-size this and multi-buy that. However, if you're shopping for one, buying extra ___56___ (benefit) from price reductions doesn't make sense. Either your shopping is then too heavy to carry home, ___57___ you can't use what you've bought while it's still fresh. Of course, shops are not charities—they price goods in the way ___58___ will make them the most money. If most of their customers are happy to buy larger quantities, that's ___59___ they'll promote. But that leaves the solo (单独) customers out of pocket and disappointed.\n\nMany supermarkets are no longer doing \"buy one get one free\" promotions because of the ___60___ (criticize) that they lead to waste. Consumers prefer money off individual items. However, though it's nice to get a few cents off a pack of sausages, it would help even more if they could sometimes ___61___ (offer) in smaller packs. Even the biggest sausage fan doesn't want to eat them every day.\n\nIf your supermarket sells loose produce, then buying smaller quantities is easier. Over the last two years, some supermarkets ___62___ (start) selling chicken or salad in packs ___63___ (design) with two halves containing separate portions (份). Then, when you use one section, ___64___ other stays fresh.\n\nWho knows, perhaps some of the more forward looking ___65___ (one) may yet come out with a whole range of \"just for you\" pack sizes with special offers as well.",
      "fine_category": "pred-tense-perfect"
    },
    {
      "id": "2024浙江首考-63",
      "exam_id": "2024浙江首考",
      "year": 2024,
      "type": "真题",
      "no": 63,
      "answer": "designed",
      "explanation": "考查非谓语动词。packs 与 design 为被动关系，空格作后置定语，应用过去分词 designed。",
      "grammar_point": "非谓语动词",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "The shelves in most supermarkets are full of family-size this and multi-buy that. However, if you're shopping for one, buying extra ___56___ (benefit) from price reductions doesn't make sense. Either your shopping is then too heavy to carry home, ___57___ you can't use what you've bought while it's still fresh. Of course, shops are not charities—they price goods in the way ___58___ will make them the most money. If most of their customers are happy to buy larger quantities, that's ___59___ they'll promote. But that leaves the solo (单独) customers out of pocket and disappointed.\n\nMany supermarkets are no longer doing \"buy one get one free\" promotions because of the ___60___ (criticize) that they lead to waste. Consumers prefer money off individual items. However, though it's nice to get a few cents off a pack of sausages, it would help even more if they could sometimes ___61___ (offer) in smaller packs. Even the biggest sausage fan doesn't want to eat them every day.\n\nIf your supermarket sells loose produce, then buying smaller quantities is easier. Over the last two years, some supermarkets ___62___ (start) selling chicken or salad in packs ___63___ (design) with two halves containing separate portions (份). Then, when you use one section, ___64___ other stays fresh.\n\nWho knows, perhaps some of the more forward looking ___65___ (one) may yet come out with a whole range of \"just for you\" pack sizes with special offers as well.",
      "fine_category": "nonpred-done",
      "nonp_function": "attribute",
      "nonp_function_label": "作定语",
      "nonp_form": "done",
      "nonp_form_label": "done",
      "nonp_rule": "designed 修饰 packs，packs 与 design 是动宾关系，用 done 作后置定语。",
      "nonp_needs_review": false,
      "facets": {
        "form": "done"
      }
    },
    {
      "id": "2024浙江首考-64",
      "exam_id": "2024浙江首考",
      "year": 2024,
      "type": "真题",
      "no": 64,
      "answer": "the",
      "explanation": "考查定冠词。one section 与 the other 构成“一者……另一者……”的对应关系，应用 the。",
      "grammar_point": "冠词",
      "category": "article",
      "category_name": "冠词",
      "passage": "The shelves in most supermarkets are full of family-size this and multi-buy that. However, if you're shopping for one, buying extra ___56___ (benefit) from price reductions doesn't make sense. Either your shopping is then too heavy to carry home, ___57___ you can't use what you've bought while it's still fresh. Of course, shops are not charities—they price goods in the way ___58___ will make them the most money. If most of their customers are happy to buy larger quantities, that's ___59___ they'll promote. But that leaves the solo (单独) customers out of pocket and disappointed.\n\nMany supermarkets are no longer doing \"buy one get one free\" promotions because of the ___60___ (criticize) that they lead to waste. Consumers prefer money off individual items. However, though it's nice to get a few cents off a pack of sausages, it would help even more if they could sometimes ___61___ (offer) in smaller packs. Even the biggest sausage fan doesn't want to eat them every day.\n\nIf your supermarket sells loose produce, then buying smaller quantities is easier. Over the last two years, some supermarkets ___62___ (start) selling chicken or salad in packs ___63___ (design) with two halves containing separate portions (份). Then, when you use one section, ___64___ other stays fresh.\n\nWho knows, perhaps some of the more forward looking ___65___ (one) may yet come out with a whole range of \"just for you\" pack sizes with special offers as well.",
      "fine_category": "art-the",
      "facets": {
        "word": "the"
      }
    },
    {
      "id": "2024浙江首考-65",
      "exam_id": "2024浙江首考",
      "year": 2024,
      "type": "真题",
      "no": 65,
      "answer": "ones",
      "explanation": "考查代词。one 代指前文 some supermarkets 中的个体，前有 some of the more forward looking 修饰，应用复数 ones。",
      "grammar_point": "代词",
      "category": "pronoun",
      "category_name": "代词",
      "passage": "The shelves in most supermarkets are full of family-size this and multi-buy that. However, if you're shopping for one, buying extra ___56___ (benefit) from price reductions doesn't make sense. Either your shopping is then too heavy to carry home, ___57___ you can't use what you've bought while it's still fresh. Of course, shops are not charities—they price goods in the way ___58___ will make them the most money. If most of their customers are happy to buy larger quantities, that's ___59___ they'll promote. But that leaves the solo (单独) customers out of pocket and disappointed.\n\nMany supermarkets are no longer doing \"buy one get one free\" promotions because of the ___60___ (criticize) that they lead to waste. Consumers prefer money off individual items. However, though it's nice to get a few cents off a pack of sausages, it would help even more if they could sometimes ___61___ (offer) in smaller packs. Even the biggest sausage fan doesn't want to eat them every day.\n\nIf your supermarket sells loose produce, then buying smaller quantities is easier. Over the last two years, some supermarkets ___62___ (start) selling chicken or salad in packs ___63___ (design) with two halves containing separate portions (份). Then, when you use one section, ___64___ other stays fresh.\n\nWho knows, perhaps some of the more forward looking ___65___ (one) may yet come out with a whole range of \"just for you\" pack sizes with special offers as well.",
      "fine_category": "pron-indefinite",
      "facets": {
        "type": "indefinite"
      }
    },
    {
      "id": "2024深圳一模-36",
      "exam_id": "2024深圳一模",
      "year": 2024,
      "type": "模拟卷",
      "no": 36,
      "answer": "gently",
      "explanation": "考查副词。句意：随着快速的踢腿，他毫不费力地将毽子抛向空中，并轻柔地引导它轻轻地落在他的头上。空格处用副词修饰动词land，gentle的副词是gently，意为“轻柔地”，故填gently。",
      "grammar_point": "副词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "Despite being 75 years old, Chai Tixia’s expertise in Jianzi is truly impressive. With quick kicks, he effortlessly sends the Jianzi into the air and gracefully guides it to land___36___ (gentle) on his head.\n\n_Jianzi,___37___ game that dates back to the Han Dynasty, is surprisingly simple: players must keep the Jianzi in the air,___38___ (use) any part of their body except their hands and arms. However, to master this game___39___ (require) a lot of practice.\n\nWhile enjoyed throughout China, _Jianzi_ ___40___ (describe) by Chai as an important aspect of hutong culture. The narrow alleyways, situated within Beijing’s inner city, provide the setting for the game’s___41___ (popular). Each morning, Chai and his fellow hutong residents gather for their shared passion for _Jianzi_.\n\nChai’s spirited matches with his neighbors have a big audience ___42___ (draw) to the artistry and excitement of the game. The onlookers who watch them playing with great athleticism are amazed at ___43___ Chai and his fellow players can achieve.\n\nHaving practiced Jianzi for over 30 years, Chai cherishes the physical and social ___44___ (benefit) the game brings. Engaging in lively matches with his neighbors energizes his body, enhances his flexibility, ___45___ promotes unity within the community. Through Jianzi, Chai harvests not only health but a sense of belonging and friendship.",
      "fine_category": "word-adv",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2024深圳一模-37",
      "exam_id": "2024深圳一模",
      "year": 2024,
      "type": "模拟卷",
      "no": 37,
      "answer": "a",
      "explanation": "考查冠词。句意：毽子是一种可以追溯到汉代的游戏，非常简单：玩家必须使用身体的任何部位，除了手和手臂，将毽子保持在空中。game是可数名词，表泛指，前面要加不定冠词，game是辅音音素开头，因此不定冠词用a，故填a。",
      "grammar_point": "冠词",
      "category": "article",
      "category_name": "冠词",
      "passage": "Despite being 75 years old, Chai Tixia’s expertise in Jianzi is truly impressive. With quick kicks, he effortlessly sends the Jianzi into the air and gracefully guides it to land___36___ (gentle) on his head.\n\n_Jianzi,___37___ game that dates back to the Han Dynasty, is surprisingly simple: players must keep the Jianzi in the air,___38___ (use) any part of their body except their hands and arms. However, to master this game___39___ (require) a lot of practice.\n\nWhile enjoyed throughout China, _Jianzi_ ___40___ (describe) by Chai as an important aspect of hutong culture. The narrow alleyways, situated within Beijing’s inner city, provide the setting for the game’s___41___ (popular). Each morning, Chai and his fellow hutong residents gather for their shared passion for _Jianzi_.\n\nChai’s spirited matches with his neighbors have a big audience ___42___ (draw) to the artistry and excitement of the game. The onlookers who watch them playing with great athleticism are amazed at ___43___ Chai and his fellow players can achieve.\n\nHaving practiced Jianzi for over 30 years, Chai cherishes the physical and social ___44___ (benefit) the game brings. Engaging in lively matches with his neighbors energizes his body, enhances his flexibility, ___45___ promotes unity within the community. Through Jianzi, Chai harvests not only health but a sense of belonging and friendship.",
      "fine_category": "art-a-an",
      "facets": {
        "word": "a-an"
      }
    },
    {
      "id": "2024深圳一模-38",
      "exam_id": "2024深圳一模",
      "year": 2024,
      "type": "模拟卷",
      "no": 38,
      "answer": "using",
      "explanation": "考查非谓语动词。句意：毽子是一种可以追溯到汉代的游戏，非常简单：玩家必须使用身体的任何部位，除了手和手臂，将毽子保持在空中。句中谓语是must keep，空格处用非谓语动词，players和use之间是主谓关系，因此空格处用现在分词表主动，故填using。",
      "grammar_point": "非谓语动词",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "Despite being 75 years old, Chai Tixia’s expertise in Jianzi is truly impressive. With quick kicks, he effortlessly sends the Jianzi into the air and gracefully guides it to land___36___ (gentle) on his head.\n\n_Jianzi,___37___ game that dates back to the Han Dynasty, is surprisingly simple: players must keep the Jianzi in the air,___38___ (use) any part of their body except their hands and arms. However, to master this game___39___ (require) a lot of practice.\n\nWhile enjoyed throughout China, _Jianzi_ ___40___ (describe) by Chai as an important aspect of hutong culture. The narrow alleyways, situated within Beijing’s inner city, provide the setting for the game’s___41___ (popular). Each morning, Chai and his fellow hutong residents gather for their shared passion for _Jianzi_.\n\nChai’s spirited matches with his neighbors have a big audience ___42___ (draw) to the artistry and excitement of the game. The onlookers who watch them playing with great athleticism are amazed at ___43___ Chai and his fellow players can achieve.\n\nHaving practiced Jianzi for over 30 years, Chai cherishes the physical and social ___44___ (benefit) the game brings. Engaging in lively matches with his neighbors energizes his body, enhances his flexibility, ___45___ promotes unity within the community. Through Jianzi, Chai harvests not only health but a sense of belonging and friendship.",
      "fine_category": "nonpred-doing",
      "nonp_function": "adverbial",
      "nonp_function_label": "作状语",
      "nonp_form": "doing",
      "nonp_form_label": "doing",
      "nonp_rule": "句中已有谓语 must keep，players 与 use 是主谓关系，用 doing 作方式状语。",
      "nonp_needs_review": false,
      "facets": {
        "form": "doing"
      }
    },
    {
      "id": "2024深圳一模-39",
      "exam_id": "2024深圳一模",
      "year": 2024,
      "type": "模拟卷",
      "no": 39,
      "answer": "requires",
      "explanation": "考查时态和主谓一致。句意：然而，要掌握这个游戏需要大量的练习。句子描述客观事实，时态用一般现在时，主语是不定式to master，因此空格处用第三人称单数，故填requires。",
      "grammar_point": "时态和主谓一致",
      "category": "predicate",
      "category_name": "谓语动词",
      "passage": "Despite being 75 years old, Chai Tixia’s expertise in Jianzi is truly impressive. With quick kicks, he effortlessly sends the Jianzi into the air and gracefully guides it to land___36___ (gentle) on his head.\n\n_Jianzi,___37___ game that dates back to the Han Dynasty, is surprisingly simple: players must keep the Jianzi in the air,___38___ (use) any part of their body except their hands and arms. However, to master this game___39___ (require) a lot of practice.\n\nWhile enjoyed throughout China, _Jianzi_ ___40___ (describe) by Chai as an important aspect of hutong culture. The narrow alleyways, situated within Beijing’s inner city, provide the setting for the game’s___41___ (popular). Each morning, Chai and his fellow hutong residents gather for their shared passion for _Jianzi_.\n\nChai’s spirited matches with his neighbors have a big audience ___42___ (draw) to the artistry and excitement of the game. The onlookers who watch them playing with great athleticism are amazed at ___43___ Chai and his fellow players can achieve.\n\nHaving practiced Jianzi for over 30 years, Chai cherishes the physical and social ___44___ (benefit) the game brings. Engaging in lively matches with his neighbors energizes his body, enhances his flexibility, ___45___ promotes unity within the community. Through Jianzi, Chai harvests not only health but a sense of belonging and friendship.",
      "fine_category": "pred-sva-form"
    },
    {
      "id": "2024深圳一模-40",
      "exam_id": "2024深圳一模",
      "year": 2024,
      "type": "模拟卷",
      "no": 40,
      "answer": "is described",
      "explanation": "考查时态，语态和主谓一致。句意：虽然在中国各地都很受欢迎，但毽子被Chai形容为胡同文化的一个重要方面。毽子被Chai形容，且句子描述客观事实，时态是一般现在时，因此空格处是一般现在时的被动语态，主语Jianzi是不可数名词，因此空格处是is described。故填is described。",
      "grammar_point": "时态",
      "category": "predicate",
      "category_name": "谓语动词",
      "passage": "Despite being 75 years old, Chai Tixia’s expertise in Jianzi is truly impressive. With quick kicks, he effortlessly sends the Jianzi into the air and gracefully guides it to land___36___ (gentle) on his head.\n\n_Jianzi,___37___ game that dates back to the Han Dynasty, is surprisingly simple: players must keep the Jianzi in the air,___38___ (use) any part of their body except their hands and arms. However, to master this game___39___ (require) a lot of practice.\n\nWhile enjoyed throughout China, _Jianzi_ ___40___ (describe) by Chai as an important aspect of hutong culture. The narrow alleyways, situated within Beijing’s inner city, provide the setting for the game’s___41___ (popular). Each morning, Chai and his fellow hutong residents gather for their shared passion for _Jianzi_.\n\nChai’s spirited matches with his neighbors have a big audience ___42___ (draw) to the artistry and excitement of the game. The onlookers who watch them playing with great athleticism are amazed at ___43___ Chai and his fellow players can achieve.\n\nHaving practiced Jianzi for over 30 years, Chai cherishes the physical and social ___44___ (benefit) the game brings. Engaging in lively matches with his neighbors energizes his body, enhances his flexibility, ___45___ promotes unity within the community. Through Jianzi, Chai harvests not only health but a sense of belonging and friendship.",
      "fine_category": "pred-passive-form"
    },
    {
      "id": "2024深圳一模-41",
      "exam_id": "2024深圳一模",
      "year": 2024,
      "type": "模拟卷",
      "no": 41,
      "answer": "popularity",
      "explanation": "考查名词。句意：位于北京内城的狭窄小巷为这项运动的流行提供了场地。game’s后跟名词作介词for的宾语，popular的名词是popularity，是不可数名词，意为“流行，普及，受欢迎”，故填popularity。",
      "grammar_point": "名词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "Despite being 75 years old, Chai Tixia’s expertise in Jianzi is truly impressive. With quick kicks, he effortlessly sends the Jianzi into the air and gracefully guides it to land___36___ (gentle) on his head.\n\n_Jianzi,___37___ game that dates back to the Han Dynasty, is surprisingly simple: players must keep the Jianzi in the air,___38___ (use) any part of their body except their hands and arms. However, to master this game___39___ (require) a lot of practice.\n\nWhile enjoyed throughout China, _Jianzi_ ___40___ (describe) by Chai as an important aspect of hutong culture. The narrow alleyways, situated within Beijing’s inner city, provide the setting for the game’s___41___ (popular). Each morning, Chai and his fellow hutong residents gather for their shared passion for _Jianzi_.\n\nChai’s spirited matches with his neighbors have a big audience ___42___ (draw) to the artistry and excitement of the game. The onlookers who watch them playing with great athleticism are amazed at ___43___ Chai and his fellow players can achieve.\n\nHaving practiced Jianzi for over 30 years, Chai cherishes the physical and social ___44___ (benefit) the game brings. Engaging in lively matches with his neighbors energizes his body, enhances his flexibility, ___45___ promotes unity within the community. Through Jianzi, Chai harvests not only health but a sense of belonging and friendship.",
      "fine_category": "word-noun",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2024深圳一模-42",
      "exam_id": "2024深圳一模",
      "year": 2024,
      "type": "模拟卷",
      "no": 42,
      "answer": "drawn",
      "explanation": "考查非谓语动词。句意：Chai和邻居们的激烈比赛吸引了大批观众，他们被这项运动的艺术性和刺激感所吸引。句中谓语是have，空格处用非谓语动词，audience和draw之间是逻辑动宾关系，因此空格处用过去分词表被动，故填drawn。",
      "grammar_point": "非谓语动词",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "Despite being 75 years old, Chai Tixia’s expertise in Jianzi is truly impressive. With quick kicks, he effortlessly sends the Jianzi into the air and gracefully guides it to land___36___ (gentle) on his head.\n\n_Jianzi,___37___ game that dates back to the Han Dynasty, is surprisingly simple: players must keep the Jianzi in the air,___38___ (use) any part of their body except their hands and arms. However, to master this game___39___ (require) a lot of practice.\n\nWhile enjoyed throughout China, _Jianzi_ ___40___ (describe) by Chai as an important aspect of hutong culture. The narrow alleyways, situated within Beijing’s inner city, provide the setting for the game’s___41___ (popular). Each morning, Chai and his fellow hutong residents gather for their shared passion for _Jianzi_.\n\nChai’s spirited matches with his neighbors have a big audience ___42___ (draw) to the artistry and excitement of the game. The onlookers who watch them playing with great athleticism are amazed at ___43___ Chai and his fellow players can achieve.\n\nHaving practiced Jianzi for over 30 years, Chai cherishes the physical and social ___44___ (benefit) the game brings. Engaging in lively matches with his neighbors energizes his body, enhances his flexibility, ___45___ promotes unity within the community. Through Jianzi, Chai harvests not only health but a sense of belonging and friendship.",
      "fine_category": "nonpred-done",
      "nonp_function": "adverbial",
      "nonp_function_label": "作状语",
      "nonp_form": "done",
      "nonp_form_label": "done",
      "nonp_rule": "句中已有谓语 have，audience 与 draw 是动宾关系，用 done 表被吸引的状态。",
      "nonp_needs_review": false,
      "facets": {
        "form": "done"
      }
    },
    {
      "id": "2024深圳一模-43",
      "exam_id": "2024深圳一模",
      "year": 2024,
      "type": "模拟卷",
      "no": 43,
      "answer": "what",
      "explanation": "考查宾语从句。句意：观看他们出色的运动能力的旁观者对Chai和他的同伴们所取得的成就感到惊讶。空格处引导的是宾语从句，从句中缺少宾语，句子表示“观看他们出色的运动能力的旁观者对Chai和他的同伴们所取得的成就感到惊讶”，因此空格处用what引导宾语从句，故填what。",
      "grammar_point": "宾语从句",
      "category": "nounclause",
      "category_name": "名词性从句",
      "passage": "Despite being 75 years old, Chai Tixia’s expertise in Jianzi is truly impressive. With quick kicks, he effortlessly sends the Jianzi into the air and gracefully guides it to land___36___ (gentle) on his head.\n\n_Jianzi,___37___ game that dates back to the Han Dynasty, is surprisingly simple: players must keep the Jianzi in the air,___38___ (use) any part of their body except their hands and arms. However, to master this game___39___ (require) a lot of practice.\n\nWhile enjoyed throughout China, _Jianzi_ ___40___ (describe) by Chai as an important aspect of hutong culture. The narrow alleyways, situated within Beijing’s inner city, provide the setting for the game’s___41___ (popular). Each morning, Chai and his fellow hutong residents gather for their shared passion for _Jianzi_.\n\nChai’s spirited matches with his neighbors have a big audience ___42___ (draw) to the artistry and excitement of the game. The onlookers who watch them playing with great athleticism are amazed at ___43___ Chai and his fellow players can achieve.\n\nHaving practiced Jianzi for over 30 years, Chai cherishes the physical and social ___44___ (benefit) the game brings. Engaging in lively matches with his neighbors energizes his body, enhances his flexibility, ___45___ promotes unity within the community. Through Jianzi, Chai harvests not only health but a sense of belonging and friendship.",
      "fine_category": "nounc-wh-pronoun",
      "facets": {
        "type": "wh-pronoun",
        "word": "what"
      }
    },
    {
      "id": "2024深圳一模-44",
      "exam_id": "2024深圳一模",
      "year": 2024,
      "type": "模拟卷",
      "no": 44,
      "answer": "benefits",
      "explanation": "考查名词的复数。句意：练了30多年的毽子，Chai很珍惜这项运动给身体和社会带来的好处。benefit是可数名词，不止一个，因此空格处用复数，故填benefits。",
      "grammar_point": "名词的复数",
      "category": "number",
      "category_name": "名词/数词",
      "passage": "Despite being 75 years old, Chai Tixia’s expertise in Jianzi is truly impressive. With quick kicks, he effortlessly sends the Jianzi into the air and gracefully guides it to land___36___ (gentle) on his head.\n\n_Jianzi,___37___ game that dates back to the Han Dynasty, is surprisingly simple: players must keep the Jianzi in the air,___38___ (use) any part of their body except their hands and arms. However, to master this game___39___ (require) a lot of practice.\n\nWhile enjoyed throughout China, _Jianzi_ ___40___ (describe) by Chai as an important aspect of hutong culture. The narrow alleyways, situated within Beijing’s inner city, provide the setting for the game’s___41___ (popular). Each morning, Chai and his fellow hutong residents gather for their shared passion for _Jianzi_.\n\nChai’s spirited matches with his neighbors have a big audience ___42___ (draw) to the artistry and excitement of the game. The onlookers who watch them playing with great athleticism are amazed at ___43___ Chai and his fellow players can achieve.\n\nHaving practiced Jianzi for over 30 years, Chai cherishes the physical and social ___44___ (benefit) the game brings. Engaging in lively matches with his neighbors energizes his body, enhances his flexibility, ___45___ promotes unity within the community. Through Jianzi, Chai harvests not only health but a sense of belonging and friendship.",
      "fine_category": "num-plural",
      "facets": {
        "type": "plural"
      }
    },
    {
      "id": "2024深圳一模-45",
      "exam_id": "2024深圳一模",
      "year": 2024,
      "type": "模拟卷",
      "no": 45,
      "answer": "and",
      "explanation": "考查连词。句意：与邻居进行激烈的比赛可以使他的身体充满活力，增强他的灵活性，并促进社区的团结。energizes，enhances和promotes这三个动作是并列的，句子是肯定句，因此空格处用and表并列，故填and。",
      "grammar_point": "连词",
      "category": "logic",
      "category_name": "逻辑连词",
      "passage": "Despite being 75 years old, Chai Tixia’s expertise in Jianzi is truly impressive. With quick kicks, he effortlessly sends the Jianzi into the air and gracefully guides it to land___36___ (gentle) on his head.\n\n_Jianzi,___37___ game that dates back to the Han Dynasty, is surprisingly simple: players must keep the Jianzi in the air,___38___ (use) any part of their body except their hands and arms. However, to master this game___39___ (require) a lot of practice.\n\nWhile enjoyed throughout China, _Jianzi_ ___40___ (describe) by Chai as an important aspect of hutong culture. The narrow alleyways, situated within Beijing’s inner city, provide the setting for the game’s___41___ (popular). Each morning, Chai and his fellow hutong residents gather for their shared passion for _Jianzi_.\n\nChai’s spirited matches with his neighbors have a big audience ___42___ (draw) to the artistry and excitement of the game. The onlookers who watch them playing with great athleticism are amazed at ___43___ Chai and his fellow players can achieve.\n\nHaving practiced Jianzi for over 30 years, Chai cherishes the physical and social ___44___ (benefit) the game brings. Engaging in lively matches with his neighbors energizes his body, enhances his flexibility, ___45___ promotes unity within the community. Through Jianzi, Chai harvests not only health but a sense of belonging and friendship.",
      "fine_category": "logic-coordinating",
      "facets": {
        "word": "and",
        "kind": "coordinating"
      }
    },
    {
      "id": "2024深圳二模-36",
      "exam_id": "2024深圳二模",
      "year": 2024,
      "type": "模拟卷",
      "no": 36,
      "answer": "created",
      "explanation": "考查非谓语动词。句意：在冰岛雷克雅未克市中心，矗立着一座由Lillian Hopps创建的博物馆，象征着冰岛和中国人民之间的友谊。本句的谓语是stands，所以空处应用非谓语动词。逻辑主语a museum和create之间是动宾关系，应用过去分词作后置定语。故填created。",
      "grammar_point": "非谓语动词",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "In the center of Reykjavik, Iceland, stands a museum ___36___ (create) by Lillian Hopps, which symbolizes the friendship between Icelandic and Chinese people. A passionate admirer of Chinese heritage, Lillian began her journey to learn about China in the 1990s, a time ___37___ she deeply engaged herself in exploring China’s rich culture. Her passion transformed her home into a place filled with Chinese artifacts, which ___38___ (eventual) led to the establishment of a museum in Reykjavik.\n\nThe museum ___39___ (house) an extensive collection of cultural relics, from ancient clothing ___40___ contemporary art, displaying thousands of years of Chinese civilization. Lillian’s work goes beyond just ___41___ (exhibit) these items; she brings the culture alive through highly ___42___ (interact) activities like tea performances, calligraphy classes, and traditional medicine talks, promoting the Icelandic understanding of China’s rich traditions.\n\nLilian’s museum, attracting thousands of visitors annually from around the world, ___43___ (recognize) by the Icelandic government in 2021 for its impact. As Marta Jonsdottir, a director at Iceland’s Ministry of Foreign Affairs, put it in an interview, “Lillian, with her enthusiasm and expertise, has developed diverse cultural ___44___ (link) between Iceland and China. Her museum has not just enabled both peoples to better understand each other ___45___ strengthened our relations.”",
      "fine_category": "nonpred-done",
      "nonp_function": "attribute",
      "nonp_function_label": "作定语",
      "nonp_form": "done",
      "nonp_form_label": "done",
      "nonp_rule": "created 修饰 a museum，museum 与 create 是动宾关系，用 done 作后置定语。",
      "nonp_needs_review": false,
      "facets": {
        "form": "done"
      }
    },
    {
      "id": "2024深圳二模-37",
      "exam_id": "2024深圳二模",
      "year": 2024,
      "type": "模拟卷",
      "no": 37,
      "answer": "when",
      "explanation": "考查定语从句。句意：Lillian是中国传统的狂热崇拜者，她在20世纪90年代开始了她了解中国的旅程，当时她正深入探索中国丰富的文化。空处引导一个定语从句，先行词为a time，且空处在从句中作时间状语，所以应用when引导。故填when。",
      "grammar_point": "定语从句",
      "category": "attrib",
      "category_name": "定语从句",
      "passage": "In the center of Reykjavik, Iceland, stands a museum ___36___ (create) by Lillian Hopps, which symbolizes the friendship between Icelandic and Chinese people. A passionate admirer of Chinese heritage, Lillian began her journey to learn about China in the 1990s, a time ___37___ she deeply engaged herself in exploring China’s rich culture. Her passion transformed her home into a place filled with Chinese artifacts, which ___38___ (eventual) led to the establishment of a museum in Reykjavik.\n\nThe museum ___39___ (house) an extensive collection of cultural relics, from ancient clothing ___40___ contemporary art, displaying thousands of years of Chinese civilization. Lillian’s work goes beyond just ___41___ (exhibit) these items; she brings the culture alive through highly ___42___ (interact) activities like tea performances, calligraphy classes, and traditional medicine talks, promoting the Icelandic understanding of China’s rich traditions.\n\nLilian’s museum, attracting thousands of visitors annually from around the world, ___43___ (recognize) by the Icelandic government in 2021 for its impact. As Marta Jonsdottir, a director at Iceland’s Ministry of Foreign Affairs, put it in an interview, “Lillian, with her enthusiasm and expertise, has developed diverse cultural ___44___ (link) between Iceland and China. Her museum has not just enabled both peoples to better understand each other ___45___ strengthened our relations.”",
      "fine_category": "attrib-adverb",
      "facets": {
        "type": "relative-adverb",
        "word": "when",
        "restrictive": true
      }
    },
    {
      "id": "2024深圳二模-38",
      "exam_id": "2024深圳二模",
      "year": 2024,
      "type": "模拟卷",
      "no": 38,
      "answer": "eventually",
      "explanation": "考查副词。句意：她的热情使她的家变成了一个充满中国文物的地方，最终促使一个博物馆在雷克雅未克建立。空处应用副词修饰动词led，eventually意为“最后，终于”。故填eventually。",
      "grammar_point": "副词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "In the center of Reykjavik, Iceland, stands a museum ___36___ (create) by Lillian Hopps, which symbolizes the friendship between Icelandic and Chinese people. A passionate admirer of Chinese heritage, Lillian began her journey to learn about China in the 1990s, a time ___37___ she deeply engaged herself in exploring China’s rich culture. Her passion transformed her home into a place filled with Chinese artifacts, which ___38___ (eventual) led to the establishment of a museum in Reykjavik.\n\nThe museum ___39___ (house) an extensive collection of cultural relics, from ancient clothing ___40___ contemporary art, displaying thousands of years of Chinese civilization. Lillian’s work goes beyond just ___41___ (exhibit) these items; she brings the culture alive through highly ___42___ (interact) activities like tea performances, calligraphy classes, and traditional medicine talks, promoting the Icelandic understanding of China’s rich traditions.\n\nLilian’s museum, attracting thousands of visitors annually from around the world, ___43___ (recognize) by the Icelandic government in 2021 for its impact. As Marta Jonsdottir, a director at Iceland’s Ministry of Foreign Affairs, put it in an interview, “Lillian, with her enthusiasm and expertise, has developed diverse cultural ___44___ (link) between Iceland and China. Her museum has not just enabled both peoples to better understand each other ___45___ strengthened our relations.”",
      "fine_category": "word-adv",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2024深圳二模-39",
      "exam_id": "2024深圳二模",
      "year": 2024,
      "type": "模拟卷",
      "no": 39,
      "answer": "houses",
      "explanation": "考查时态和主谓一致。句意：该博物馆收藏了大量文物，从古代服装到当代艺术，展示了数千年的中华文明。空处作句子的谓语。这里陈述的是客观事实，应用一般现在时。主语The museum为单数，谓语应用单数。故填houses。",
      "grammar_point": "时态和主谓一致",
      "category": "predicate",
      "category_name": "谓语动词",
      "passage": "In the center of Reykjavik, Iceland, stands a museum ___36___ (create) by Lillian Hopps, which symbolizes the friendship between Icelandic and Chinese people. A passionate admirer of Chinese heritage, Lillian began her journey to learn about China in the 1990s, a time ___37___ she deeply engaged herself in exploring China’s rich culture. Her passion transformed her home into a place filled with Chinese artifacts, which ___38___ (eventual) led to the establishment of a museum in Reykjavik.\n\nThe museum ___39___ (house) an extensive collection of cultural relics, from ancient clothing ___40___ contemporary art, displaying thousands of years of Chinese civilization. Lillian’s work goes beyond just ___41___ (exhibit) these items; she brings the culture alive through highly ___42___ (interact) activities like tea performances, calligraphy classes, and traditional medicine talks, promoting the Icelandic understanding of China’s rich traditions.\n\nLilian’s museum, attracting thousands of visitors annually from around the world, ___43___ (recognize) by the Icelandic government in 2021 for its impact. As Marta Jonsdottir, a director at Iceland’s Ministry of Foreign Affairs, put it in an interview, “Lillian, with her enthusiasm and expertise, has developed diverse cultural ___44___ (link) between Iceland and China. Her museum has not just enabled both peoples to better understand each other ___45___ strengthened our relations.”",
      "fine_category": "pred-sva-form"
    },
    {
      "id": "2024深圳二模-40",
      "exam_id": "2024深圳二模",
      "year": 2024,
      "type": "模拟卷",
      "no": 40,
      "answer": "to",
      "explanation": "考查介词。句意：同上。from...to...意为“从……到……”，为固定搭配。故填to。",
      "grammar_point": "介词",
      "category": "preposition",
      "category_name": "介词",
      "passage": "In the center of Reykjavik, Iceland, stands a museum ___36___ (create) by Lillian Hopps, which symbolizes the friendship between Icelandic and Chinese people. A passionate admirer of Chinese heritage, Lillian began her journey to learn about China in the 1990s, a time ___37___ she deeply engaged herself in exploring China’s rich culture. Her passion transformed her home into a place filled with Chinese artifacts, which ___38___ (eventual) led to the establishment of a museum in Reykjavik.\n\nThe museum ___39___ (house) an extensive collection of cultural relics, from ancient clothing ___40___ contemporary art, displaying thousands of years of Chinese civilization. Lillian’s work goes beyond just ___41___ (exhibit) these items; she brings the culture alive through highly ___42___ (interact) activities like tea performances, calligraphy classes, and traditional medicine talks, promoting the Icelandic understanding of China’s rich traditions.\n\nLilian’s museum, attracting thousands of visitors annually from around the world, ___43___ (recognize) by the Icelandic government in 2021 for its impact. As Marta Jonsdottir, a director at Iceland’s Ministry of Foreign Affairs, put it in an interview, “Lillian, with her enthusiasm and expertise, has developed diverse cultural ___44___ (link) between Iceland and China. Her museum has not just enabled both peoples to better understand each other ___45___ strengthened our relations.”",
      "fine_category": "prep-common",
      "facets": {
        "word": "to"
      }
    },
    {
      "id": "2024深圳二模-41",
      "exam_id": "2024深圳二模",
      "year": 2024,
      "type": "模拟卷",
      "no": 41,
      "answer": "exhibiting",
      "explanation": "考查非谓语动词。句意：Lillian的作品不仅仅是展示这些物品；她通过茶艺表演、书法课和传统医学讲座等高度互动的活动，使文化鲜活起来，促进冰岛人对中国丰富传统的理解。空处应用动名词，作介词beyond的宾语。故填exhibiting。",
      "grammar_point": "非谓语动词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "In the center of Reykjavik, Iceland, stands a museum ___36___ (create) by Lillian Hopps, which symbolizes the friendship between Icelandic and Chinese people. A passionate admirer of Chinese heritage, Lillian began her journey to learn about China in the 1990s, a time ___37___ she deeply engaged herself in exploring China’s rich culture. Her passion transformed her home into a place filled with Chinese artifacts, which ___38___ (eventual) led to the establishment of a museum in Reykjavik.\n\nThe museum ___39___ (house) an extensive collection of cultural relics, from ancient clothing ___40___ contemporary art, displaying thousands of years of Chinese civilization. Lillian’s work goes beyond just ___41___ (exhibit) these items; she brings the culture alive through highly ___42___ (interact) activities like tea performances, calligraphy classes, and traditional medicine talks, promoting the Icelandic understanding of China’s rich traditions.\n\nLilian’s museum, attracting thousands of visitors annually from around the world, ___43___ (recognize) by the Icelandic government in 2021 for its impact. As Marta Jonsdottir, a director at Iceland’s Ministry of Foreign Affairs, put it in an interview, “Lillian, with her enthusiasm and expertise, has developed diverse cultural ___44___ (link) between Iceland and China. Her museum has not just enabled both peoples to better understand each other ___45___ strengthened our relations.”",
      "fine_category": "word-noun",
      "nonp_function": "object",
      "nonp_function_label": "作宾语",
      "nonp_form": "doing",
      "nonp_form_label": "doing",
      "nonp_rule": "beyond 是介词，后面接 doing，exhibiting 作介词宾语。",
      "nonp_needs_review": false,
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2024深圳二模-42",
      "exam_id": "2024深圳二模",
      "year": 2024,
      "type": "模拟卷",
      "no": 42,
      "answer": "interactive",
      "explanation": "考查形容词。句意：同上。空处应用形容词，作定语修饰activities。interactive意为“互动的，交互的”符合句意。故填interactive。",
      "grammar_point": "形容词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "In the center of Reykjavik, Iceland, stands a museum ___36___ (create) by Lillian Hopps, which symbolizes the friendship between Icelandic and Chinese people. A passionate admirer of Chinese heritage, Lillian began her journey to learn about China in the 1990s, a time ___37___ she deeply engaged herself in exploring China’s rich culture. Her passion transformed her home into a place filled with Chinese artifacts, which ___38___ (eventual) led to the establishment of a museum in Reykjavik.\n\nThe museum ___39___ (house) an extensive collection of cultural relics, from ancient clothing ___40___ contemporary art, displaying thousands of years of Chinese civilization. Lillian’s work goes beyond just ___41___ (exhibit) these items; she brings the culture alive through highly ___42___ (interact) activities like tea performances, calligraphy classes, and traditional medicine talks, promoting the Icelandic understanding of China’s rich traditions.\n\nLilian’s museum, attracting thousands of visitors annually from around the world, ___43___ (recognize) by the Icelandic government in 2021 for its impact. As Marta Jonsdottir, a director at Iceland’s Ministry of Foreign Affairs, put it in an interview, “Lillian, with her enthusiasm and expertise, has developed diverse cultural ___44___ (link) between Iceland and China. Her museum has not just enabled both peoples to better understand each other ___45___ strengthened our relations.”",
      "fine_category": "word-adj",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2024深圳二模-43",
      "exam_id": "2024深圳二模",
      "year": 2024,
      "type": "模拟卷",
      "no": 43,
      "answer": "was recognized",
      "explanation": "考查时态、语态和主谓一致。句意：Lillian的博物馆每年吸引来自世界各地的数千名游客，2021年因其影响力而获得冰岛政府的认可。空处作句子的谓语。根据句中的“in 2021”可知，这里是过去发生的事情，应用一般过去时。主语Lilian’s museum和recognize之间是动宾关系，应用被动语态，且主语为单数，be动词应用was。故填was recognized。",
      "grammar_point": "时态、语态和主谓一致",
      "category": "predicate",
      "category_name": "谓语动词",
      "passage": "In the center of Reykjavik, Iceland, stands a museum ___36___ (create) by Lillian Hopps, which symbolizes the friendship between Icelandic and Chinese people. A passionate admirer of Chinese heritage, Lillian began her journey to learn about China in the 1990s, a time ___37___ she deeply engaged herself in exploring China’s rich culture. Her passion transformed her home into a place filled with Chinese artifacts, which ___38___ (eventual) led to the establishment of a museum in Reykjavik.\n\nThe museum ___39___ (house) an extensive collection of cultural relics, from ancient clothing ___40___ contemporary art, displaying thousands of years of Chinese civilization. Lillian’s work goes beyond just ___41___ (exhibit) these items; she brings the culture alive through highly ___42___ (interact) activities like tea performances, calligraphy classes, and traditional medicine talks, promoting the Icelandic understanding of China’s rich traditions.\n\nLilian’s museum, attracting thousands of visitors annually from around the world, ___43___ (recognize) by the Icelandic government in 2021 for its impact. As Marta Jonsdottir, a director at Iceland’s Ministry of Foreign Affairs, put it in an interview, “Lillian, with her enthusiasm and expertise, has developed diverse cultural ___44___ (link) between Iceland and China. Her museum has not just enabled both peoples to better understand each other ___45___ strengthened our relations.”",
      "fine_category": "pred-passive-form"
    },
    {
      "id": "2024深圳二模-44",
      "exam_id": "2024深圳二模",
      "year": 2024,
      "type": "模拟卷",
      "no": 44,
      "answer": "links",
      "explanation": "考查名词的数。句意：Lillian凭借她的热情和专业知识，在冰岛和中国之间建立了多样化的文化联系。link意为“联系”，为可数名词。前面有diverse修饰，这里应用名词复数。故填links。",
      "grammar_point": "名词的数",
      "category": "number",
      "category_name": "名词/数词",
      "passage": "In the center of Reykjavik, Iceland, stands a museum ___36___ (create) by Lillian Hopps, which symbolizes the friendship between Icelandic and Chinese people. A passionate admirer of Chinese heritage, Lillian began her journey to learn about China in the 1990s, a time ___37___ she deeply engaged herself in exploring China’s rich culture. Her passion transformed her home into a place filled with Chinese artifacts, which ___38___ (eventual) led to the establishment of a museum in Reykjavik.\n\nThe museum ___39___ (house) an extensive collection of cultural relics, from ancient clothing ___40___ contemporary art, displaying thousands of years of Chinese civilization. Lillian’s work goes beyond just ___41___ (exhibit) these items; she brings the culture alive through highly ___42___ (interact) activities like tea performances, calligraphy classes, and traditional medicine talks, promoting the Icelandic understanding of China’s rich traditions.\n\nLilian’s museum, attracting thousands of visitors annually from around the world, ___43___ (recognize) by the Icelandic government in 2021 for its impact. As Marta Jonsdottir, a director at Iceland’s Ministry of Foreign Affairs, put it in an interview, “Lillian, with her enthusiasm and expertise, has developed diverse cultural ___44___ (link) between Iceland and China. Her museum has not just enabled both peoples to better understand each other ___45___ strengthened our relations.”",
      "fine_category": "num-plural",
      "facets": {
        "type": "plural"
      }
    },
    {
      "id": "2024深圳二模-45",
      "exam_id": "2024深圳二模",
      "year": 2024,
      "type": "模拟卷",
      "no": 45,
      "answer": "but",
      "explanation": "考查连词。句意：她的博物馆不仅使两国人民更好地了解彼此，还加强了我们的关系。not just...but...意为“不仅……而且……”，为固定搭配。故填but。",
      "grammar_point": "连词",
      "category": "logic",
      "category_name": "逻辑连词",
      "passage": "In the center of Reykjavik, Iceland, stands a museum ___36___ (create) by Lillian Hopps, which symbolizes the friendship between Icelandic and Chinese people. A passionate admirer of Chinese heritage, Lillian began her journey to learn about China in the 1990s, a time ___37___ she deeply engaged herself in exploring China’s rich culture. Her passion transformed her home into a place filled with Chinese artifacts, which ___38___ (eventual) led to the establishment of a museum in Reykjavik.\n\nThe museum ___39___ (house) an extensive collection of cultural relics, from ancient clothing ___40___ contemporary art, displaying thousands of years of Chinese civilization. Lillian’s work goes beyond just ___41___ (exhibit) these items; she brings the culture alive through highly ___42___ (interact) activities like tea performances, calligraphy classes, and traditional medicine talks, promoting the Icelandic understanding of China’s rich traditions.\n\nLilian’s museum, attracting thousands of visitors annually from around the world, ___43___ (recognize) by the Icelandic government in 2021 for its impact. As Marta Jonsdottir, a director at Iceland’s Ministry of Foreign Affairs, put it in an interview, “Lillian, with her enthusiasm and expertise, has developed diverse cultural ___44___ (link) between Iceland and China. Her museum has not just enabled both peoples to better understand each other ___45___ strengthened our relations.”",
      "fine_category": "logic-coordinating",
      "facets": {
        "word": "but",
        "kind": "correlative"
      }
    },
    {
      "id": "2025全国一卷-56",
      "exam_id": "2025全国一卷",
      "year": 2025,
      "type": "真题",
      "no": 56,
      "answer": "which",
      "explanation": "考查定语从句。句意：上海久事美术馆正在举办一场展览，展出的艺术品灵感来自围棋（中文称为\"围棋\"），它起源4000多年前的中国。本空引导非限制性定语从句，修饰先行词为Go, or weiqi in Chinese，指物，且关系词代替先行词在从句中作主语，所以用关系代词which引导。故填which。",
      "grammar_point": "定语从句",
      "category": "attrib",
      "category_name": "定语从句",
      "passage": "An exhibition at the Jiushi Art Museum in Shanghai is featuring artwork inspired by Go, or weiqi in Chinese, ___56___ originated in China more than 4,000 years ago.\n\nGo is one of ___57___ earliest binary-based (基于二元的) games. The movements of the black and white pieces reflect the basic ideas of Eastern philosophy, according to Tu Ningning, who is in charge of the exhibition.\n\n\"The exhibition brings together Go culture, cutting-edge technology and contemporary art,\" says Tu. \"We hope ___58___ (present) the rather abstract Go game and AI in a visual context, and initiate dialogues with minimalist art, conceptual art and expressionism.\"\n\n\"In a Go game, each move should serve a long-term goal. You try to lead the opponent into your trap and force them to follow your '___59___ (guide)' till they lose,\" explains Wang Wei, a Go player among the visitors to the exhibition.\n\n\"The players' personalities ___60___ (reveal) during the game, and one's weaknesses are exposed to the opponent,\" she adds. \"A decent winner always ___61___ (try) to beat the opponent ___62___ no more than one or two points as a gesture (姿态) of respect for the other side.\"\n\nTu says that the balance between the black and white pieces, the beauty in the ___63___ (strategy) placement of the pieces, ___64___ the energy flow following each move inspired artists to create oil paintings, sculptures, ___65___ (digital) generated pictures and silk-screen prints for the exhibition.",
      "fine_category": "attrib-pronoun",
      "facets": {
        "type": "relative-pronoun",
        "word": "which",
        "restrictive": false
      }
    },
    {
      "id": "2025全国一卷-57",
      "exam_id": "2025全国一卷",
      "year": 2025,
      "type": "真题",
      "no": 57,
      "answer": "the",
      "explanation": "考查冠词。句意：围棋是最早的基于二元的棋类游戏之一。形容词最高级前用定冠词the。故填the。",
      "grammar_point": "冠词",
      "category": "article",
      "category_name": "冠词",
      "passage": "An exhibition at the Jiushi Art Museum in Shanghai is featuring artwork inspired by Go, or weiqi in Chinese, ___56___ originated in China more than 4,000 years ago.\n\nGo is one of ___57___ earliest binary-based (基于二元的) games. The movements of the black and white pieces reflect the basic ideas of Eastern philosophy, according to Tu Ningning, who is in charge of the exhibition.\n\n\"The exhibition brings together Go culture, cutting-edge technology and contemporary art,\" says Tu. \"We hope ___58___ (present) the rather abstract Go game and AI in a visual context, and initiate dialogues with minimalist art, conceptual art and expressionism.\"\n\n\"In a Go game, each move should serve a long-term goal. You try to lead the opponent into your trap and force them to follow your '___59___ (guide)' till they lose,\" explains Wang Wei, a Go player among the visitors to the exhibition.\n\n\"The players' personalities ___60___ (reveal) during the game, and one's weaknesses are exposed to the opponent,\" she adds. \"A decent winner always ___61___ (try) to beat the opponent ___62___ no more than one or two points as a gesture (姿态) of respect for the other side.\"\n\nTu says that the balance between the black and white pieces, the beauty in the ___63___ (strategy) placement of the pieces, ___64___ the energy flow following each move inspired artists to create oil paintings, sculptures, ___65___ (digital) generated pictures and silk-screen prints for the exhibition.",
      "fine_category": "art-the",
      "facets": {
        "word": "the"
      }
    },
    {
      "id": "2025全国一卷-58",
      "exam_id": "2025全国一卷",
      "year": 2025,
      "type": "真题",
      "no": 58,
      "answer": "to present",
      "explanation": "考查非谓语动词。句意：我们希望在一个视觉语境中呈现相当抽象的围棋游戏和人工智能，并与极简主义艺术、观念艺术和表现主义展开对话。本句谓语为hope，此处为非谓语动词，hope to do sth.\"希望做某事\"，所以此处需用动词present\"呈现\"的不定式，作宾语。故填to present。",
      "grammar_point": "非谓语动词",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "An exhibition at the Jiushi Art Museum in Shanghai is featuring artwork inspired by Go, or weiqi in Chinese, ___56___ originated in China more than 4,000 years ago.\n\nGo is one of ___57___ earliest binary-based (基于二元的) games. The movements of the black and white pieces reflect the basic ideas of Eastern philosophy, according to Tu Ningning, who is in charge of the exhibition.\n\n\"The exhibition brings together Go culture, cutting-edge technology and contemporary art,\" says Tu. \"We hope ___58___ (present) the rather abstract Go game and AI in a visual context, and initiate dialogues with minimalist art, conceptual art and expressionism.\"\n\n\"In a Go game, each move should serve a long-term goal. You try to lead the opponent into your trap and force them to follow your '___59___ (guide)' till they lose,\" explains Wang Wei, a Go player among the visitors to the exhibition.\n\n\"The players' personalities ___60___ (reveal) during the game, and one's weaknesses are exposed to the opponent,\" she adds. \"A decent winner always ___61___ (try) to beat the opponent ___62___ no more than one or two points as a gesture (姿态) of respect for the other side.\"\n\nTu says that the balance between the black and white pieces, the beauty in the ___63___ (strategy) placement of the pieces, ___64___ the energy flow following each move inspired artists to create oil paintings, sculptures, ___65___ (digital) generated pictures and silk-screen prints for the exhibition.",
      "fine_category": "nonpred-to-do",
      "nonp_function": "object",
      "nonp_function_label": "作宾语",
      "nonp_form": "to_do",
      "nonp_form_label": "to do",
      "nonp_rule": "hope 后接 to do 作宾语，表示“希望呈现”。",
      "nonp_needs_review": false,
      "facets": {
        "form": "to-do"
      }
    },
    {
      "id": "2025全国一卷-59",
      "exam_id": "2025全国一卷",
      "year": 2025,
      "type": "真题",
      "no": 59,
      "answer": "guidance",
      "explanation": "考查名词。句意：你试图引导对手进入你的陷阱，迫使他们跟随你的\"引导\"直到他们输掉。此处作follow的宾语，用名词guidance\"引导\"，不可数名词。故填guidance。",
      "grammar_point": "名词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "An exhibition at the Jiushi Art Museum in Shanghai is featuring artwork inspired by Go, or weiqi in Chinese, ___56___ originated in China more than 4,000 years ago.\n\nGo is one of ___57___ earliest binary-based (基于二元的) games. The movements of the black and white pieces reflect the basic ideas of Eastern philosophy, according to Tu Ningning, who is in charge of the exhibition.\n\n\"The exhibition brings together Go culture, cutting-edge technology and contemporary art,\" says Tu. \"We hope ___58___ (present) the rather abstract Go game and AI in a visual context, and initiate dialogues with minimalist art, conceptual art and expressionism.\"\n\n\"In a Go game, each move should serve a long-term goal. You try to lead the opponent into your trap and force them to follow your '___59___ (guide)' till they lose,\" explains Wang Wei, a Go player among the visitors to the exhibition.\n\n\"The players' personalities ___60___ (reveal) during the game, and one's weaknesses are exposed to the opponent,\" she adds. \"A decent winner always ___61___ (try) to beat the opponent ___62___ no more than one or two points as a gesture (姿态) of respect for the other side.\"\n\nTu says that the balance between the black and white pieces, the beauty in the ___63___ (strategy) placement of the pieces, ___64___ the energy flow following each move inspired artists to create oil paintings, sculptures, ___65___ (digital) generated pictures and silk-screen prints for the exhibition.",
      "fine_category": "word-noun",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2025全国一卷-60",
      "exam_id": "2025全国一卷",
      "year": 2025,
      "type": "真题",
      "no": 60,
      "answer": "are revealed",
      "explanation": "考查动词语态。句意：她补充说：\"玩家的个性在游戏中显露出来，一个人的弱点会暴露给对手。\"本句描述一般事实，时态用一般现在时，且主语The players' personalities与动词reveal\"揭示，显示\"为被动关系，所以空处需用一般现在时态的被动语态，主语为复数，be动词用are。故填are revealed。",
      "grammar_point": "动词语态",
      "category": "predicate",
      "category_name": "谓语动词",
      "passage": "An exhibition at the Jiushi Art Museum in Shanghai is featuring artwork inspired by Go, or weiqi in Chinese, ___56___ originated in China more than 4,000 years ago.\n\nGo is one of ___57___ earliest binary-based (基于二元的) games. The movements of the black and white pieces reflect the basic ideas of Eastern philosophy, according to Tu Ningning, who is in charge of the exhibition.\n\n\"The exhibition brings together Go culture, cutting-edge technology and contemporary art,\" says Tu. \"We hope ___58___ (present) the rather abstract Go game and AI in a visual context, and initiate dialogues with minimalist art, conceptual art and expressionism.\"\n\n\"In a Go game, each move should serve a long-term goal. You try to lead the opponent into your trap and force them to follow your '___59___ (guide)' till they lose,\" explains Wang Wei, a Go player among the visitors to the exhibition.\n\n\"The players' personalities ___60___ (reveal) during the game, and one's weaknesses are exposed to the opponent,\" she adds. \"A decent winner always ___61___ (try) to beat the opponent ___62___ no more than one or two points as a gesture (姿态) of respect for the other side.\"\n\nTu says that the balance between the black and white pieces, the beauty in the ___63___ (strategy) placement of the pieces, ___64___ the energy flow following each move inspired artists to create oil paintings, sculptures, ___65___ (digital) generated pictures and silk-screen prints for the exhibition.",
      "fine_category": "pred-passive-form"
    },
    {
      "id": "2025全国一卷-61",
      "exam_id": "2025全国一卷",
      "year": 2025,
      "type": "真题",
      "no": 61,
      "answer": "tries",
      "explanation": "考查时态和主谓一致。句意：一个不错的赢家总是尽力以仅仅一两分的优势击败对手，以表示对对方的尊重。根据always可知，本句描述一般事实，时态用一般现在时，主语a decent winner为第三人称单数，所以谓语需用try\"尽力\"的第三人称单数tries。故填tries。",
      "grammar_point": "时态和主谓一致",
      "category": "predicate",
      "category_name": "谓语动词",
      "passage": "An exhibition at the Jiushi Art Museum in Shanghai is featuring artwork inspired by Go, or weiqi in Chinese, ___56___ originated in China more than 4,000 years ago.\n\nGo is one of ___57___ earliest binary-based (基于二元的) games. The movements of the black and white pieces reflect the basic ideas of Eastern philosophy, according to Tu Ningning, who is in charge of the exhibition.\n\n\"The exhibition brings together Go culture, cutting-edge technology and contemporary art,\" says Tu. \"We hope ___58___ (present) the rather abstract Go game and AI in a visual context, and initiate dialogues with minimalist art, conceptual art and expressionism.\"\n\n\"In a Go game, each move should serve a long-term goal. You try to lead the opponent into your trap and force them to follow your '___59___ (guide)' till they lose,\" explains Wang Wei, a Go player among the visitors to the exhibition.\n\n\"The players' personalities ___60___ (reveal) during the game, and one's weaknesses are exposed to the opponent,\" she adds. \"A decent winner always ___61___ (try) to beat the opponent ___62___ no more than one or two points as a gesture (姿态) of respect for the other side.\"\n\nTu says that the balance between the black and white pieces, the beauty in the ___63___ (strategy) placement of the pieces, ___64___ the energy flow following each move inspired artists to create oil paintings, sculptures, ___65___ (digital) generated pictures and silk-screen prints for the exhibition.",
      "fine_category": "pred-sva-form"
    },
    {
      "id": "2025全国一卷-62",
      "exam_id": "2025全国一卷",
      "year": 2025,
      "type": "真题",
      "no": 62,
      "answer": "by",
      "explanation": "考查介词。句意同上。\"by+具体数值\"表示\"以（某一差值）\"，此处指\"以一到两分的优势\"，符合语境。故填by。",
      "grammar_point": "介词",
      "category": "preposition",
      "category_name": "介词",
      "passage": "An exhibition at the Jiushi Art Museum in Shanghai is featuring artwork inspired by Go, or weiqi in Chinese, ___56___ originated in China more than 4,000 years ago.\n\nGo is one of ___57___ earliest binary-based (基于二元的) games. The movements of the black and white pieces reflect the basic ideas of Eastern philosophy, according to Tu Ningning, who is in charge of the exhibition.\n\n\"The exhibition brings together Go culture, cutting-edge technology and contemporary art,\" says Tu. \"We hope ___58___ (present) the rather abstract Go game and AI in a visual context, and initiate dialogues with minimalist art, conceptual art and expressionism.\"\n\n\"In a Go game, each move should serve a long-term goal. You try to lead the opponent into your trap and force them to follow your '___59___ (guide)' till they lose,\" explains Wang Wei, a Go player among the visitors to the exhibition.\n\n\"The players' personalities ___60___ (reveal) during the game, and one's weaknesses are exposed to the opponent,\" she adds. \"A decent winner always ___61___ (try) to beat the opponent ___62___ no more than one or two points as a gesture (姿态) of respect for the other side.\"\n\nTu says that the balance between the black and white pieces, the beauty in the ___63___ (strategy) placement of the pieces, ___64___ the energy flow following each move inspired artists to create oil paintings, sculptures, ___65___ (digital) generated pictures and silk-screen prints for the exhibition.",
      "fine_category": "prep-common",
      "facets": {
        "word": "by"
      }
    },
    {
      "id": "2025全国一卷-63",
      "exam_id": "2025全国一卷",
      "year": 2025,
      "type": "真题",
      "no": 63,
      "answer": "strategic",
      "explanation": "考查形容词。句意：屠宁宁说，黑白棋子之间的平衡，棋子在策略布局上的美感，以及每一步棋所蕴含的能量流动，都激发了艺术家们为展览创作油画、雕塑、数字生成的图片和丝网版画。此处修饰名词placement，需用形容词strategic\"战略性的，策略的\"，作定语。故填strategic。",
      "grammar_point": "形容词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "An exhibition at the Jiushi Art Museum in Shanghai is featuring artwork inspired by Go, or weiqi in Chinese, ___56___ originated in China more than 4,000 years ago.\n\nGo is one of ___57___ earliest binary-based (基于二元的) games. The movements of the black and white pieces reflect the basic ideas of Eastern philosophy, according to Tu Ningning, who is in charge of the exhibition.\n\n\"The exhibition brings together Go culture, cutting-edge technology and contemporary art,\" says Tu. \"We hope ___58___ (present) the rather abstract Go game and AI in a visual context, and initiate dialogues with minimalist art, conceptual art and expressionism.\"\n\n\"In a Go game, each move should serve a long-term goal. You try to lead the opponent into your trap and force them to follow your '___59___ (guide)' till they lose,\" explains Wang Wei, a Go player among the visitors to the exhibition.\n\n\"The players' personalities ___60___ (reveal) during the game, and one's weaknesses are exposed to the opponent,\" she adds. \"A decent winner always ___61___ (try) to beat the opponent ___62___ no more than one or two points as a gesture (姿态) of respect for the other side.\"\n\nTu says that the balance between the black and white pieces, the beauty in the ___63___ (strategy) placement of the pieces, ___64___ the energy flow following each move inspired artists to create oil paintings, sculptures, ___65___ (digital) generated pictures and silk-screen prints for the exhibition.",
      "fine_category": "word-adj",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2025全国一卷-64",
      "exam_id": "2025全国一卷",
      "year": 2025,
      "type": "真题",
      "no": 64,
      "answer": "and",
      "explanation": "考查连词。句意同上。the balance between the black and white pieces, the beauty in the strategic placement of the pieces, the energy flow following each move三者为并列关系，作并列主语，所以空处需用连词and。故填and。",
      "grammar_point": "连词",
      "category": "logic",
      "category_name": "逻辑连词",
      "passage": "An exhibition at the Jiushi Art Museum in Shanghai is featuring artwork inspired by Go, or weiqi in Chinese, ___56___ originated in China more than 4,000 years ago.\n\nGo is one of ___57___ earliest binary-based (基于二元的) games. The movements of the black and white pieces reflect the basic ideas of Eastern philosophy, according to Tu Ningning, who is in charge of the exhibition.\n\n\"The exhibition brings together Go culture, cutting-edge technology and contemporary art,\" says Tu. \"We hope ___58___ (present) the rather abstract Go game and AI in a visual context, and initiate dialogues with minimalist art, conceptual art and expressionism.\"\n\n\"In a Go game, each move should serve a long-term goal. You try to lead the opponent into your trap and force them to follow your '___59___ (guide)' till they lose,\" explains Wang Wei, a Go player among the visitors to the exhibition.\n\n\"The players' personalities ___60___ (reveal) during the game, and one's weaknesses are exposed to the opponent,\" she adds. \"A decent winner always ___61___ (try) to beat the opponent ___62___ no more than one or two points as a gesture (姿态) of respect for the other side.\"\n\nTu says that the balance between the black and white pieces, the beauty in the ___63___ (strategy) placement of the pieces, ___64___ the energy flow following each move inspired artists to create oil paintings, sculptures, ___65___ (digital) generated pictures and silk-screen prints for the exhibition.",
      "fine_category": "logic-coordinating",
      "facets": {
        "word": "and",
        "kind": "coordinating"
      }
    },
    {
      "id": "2025全国一卷-65",
      "exam_id": "2025全国一卷",
      "year": 2025,
      "type": "真题",
      "no": 65,
      "answer": "digitally",
      "explanation": "考查副词。句意同上。此处修饰形容词generated，需用副词digitally\"数字地\"，作状语。故填digitally。",
      "grammar_point": "副词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "An exhibition at the Jiushi Art Museum in Shanghai is featuring artwork inspired by Go, or weiqi in Chinese, ___56___ originated in China more than 4,000 years ago.\n\nGo is one of ___57___ earliest binary-based (基于二元的) games. The movements of the black and white pieces reflect the basic ideas of Eastern philosophy, according to Tu Ningning, who is in charge of the exhibition.\n\n\"The exhibition brings together Go culture, cutting-edge technology and contemporary art,\" says Tu. \"We hope ___58___ (present) the rather abstract Go game and AI in a visual context, and initiate dialogues with minimalist art, conceptual art and expressionism.\"\n\n\"In a Go game, each move should serve a long-term goal. You try to lead the opponent into your trap and force them to follow your '___59___ (guide)' till they lose,\" explains Wang Wei, a Go player among the visitors to the exhibition.\n\n\"The players' personalities ___60___ (reveal) during the game, and one's weaknesses are exposed to the opponent,\" she adds. \"A decent winner always ___61___ (try) to beat the opponent ___62___ no more than one or two points as a gesture (姿态) of respect for the other side.\"\n\nTu says that the balance between the black and white pieces, the beauty in the ___63___ (strategy) placement of the pieces, ___64___ the energy flow following each move inspired artists to create oil paintings, sculptures, ___65___ (digital) generated pictures and silk-screen prints for the exhibition.",
      "fine_category": "word-adv",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2025全国二卷-36",
      "exam_id": "2025全国二卷",
      "year": 2025,
      "type": "真题",
      "no": 36,
      "answer": "where",
      "explanation": "考查定语从句。句意：然而现在，我和我的中国丈夫和他的家人住在中国浙江的农村，在那里山上野生竹子和茶树丛生，鸡总是自由放养的，而且没有集中供暖。本空引导非限制性定语从句，修饰先行词the countryside of Zhejiang，China，关系词代替先行词在从句中作地点状语，应用关系副词where引导。故填where。",
      "grammar_point": "定语从句",
      "category": "attrib",
      "category_name": "定语从句",
      "passage": "I was born and raised in Cleveland, Ohio in the United States. Yet now, I live in the countryside of Zhejiang, China with my Chinese husband and his family, ___36___ bamboo and tea bushes (灌木) grow wild in the mountains, chickens are always free-range, and ___37___ (center) heating doesn't exist.\n\nNothing in my life before prepared me ___38___ this one-and to be sure, the first time I came here I never imagined I would ever feel comfortable in this area. But it's amazing how you can adapt ___39___ learn in a new environment. Over time, I've found ___40___ (I) feeling extremely at home here. And in the process, I've experienced things that really surprise me at times. The \"sunshine scent (香味)\" of freshly sunned clothes ___41___ (be) one of them.\n\nGrowing up, my family and our neighbors never used clotheslines to dry clothing, denying me the chance ___42___ (discover) one of the great wonders of sunshine --- the sweet \"sunshine scent\" after sunning clothes for an entire day. The sun-dried clothes smell especially pleasant where I live, thanks to the ___43___ (absent) of smog and plenty of blue sky ___44___ (afternoon) with lots of fresh air.\n\nIf you've never experienced the \"sunshine scent\" from a sheet or shirt ___45___ (leave) to sun for a day, well, you're missing out on one of life's wonders.",
      "fine_category": "attrib-adverb",
      "facets": {
        "type": "relative-adverb",
        "word": "where",
        "restrictive": false
      }
    },
    {
      "id": "2025全国二卷-37",
      "exam_id": "2025全国二卷",
      "year": 2025,
      "type": "真题",
      "no": 37,
      "answer": "central",
      "explanation": "考查形容词。句意同上。本空修饰名词heating，应用形容词central\"中央的，中心的\"，作定语。故填central。",
      "grammar_point": "形容词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "I was born and raised in Cleveland, Ohio in the United States. Yet now, I live in the countryside of Zhejiang, China with my Chinese husband and his family, ___36___ bamboo and tea bushes (灌木) grow wild in the mountains, chickens are always free-range, and ___37___ (center) heating doesn't exist.\n\nNothing in my life before prepared me ___38___ this one-and to be sure, the first time I came here I never imagined I would ever feel comfortable in this area. But it's amazing how you can adapt ___39___ learn in a new environment. Over time, I've found ___40___ (I) feeling extremely at home here. And in the process, I've experienced things that really surprise me at times. The \"sunshine scent (香味)\" of freshly sunned clothes ___41___ (be) one of them.\n\nGrowing up, my family and our neighbors never used clotheslines to dry clothing, denying me the chance ___42___ (discover) one of the great wonders of sunshine --- the sweet \"sunshine scent\" after sunning clothes for an entire day. The sun-dried clothes smell especially pleasant where I live, thanks to the ___43___ (absent) of smog and plenty of blue sky ___44___ (afternoon) with lots of fresh air.\n\nIf you've never experienced the \"sunshine scent\" from a sheet or shirt ___45___ (leave) to sun for a day, well, you're missing out on one of life's wonders.",
      "fine_category": "word-adj",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2025全国二卷-38",
      "exam_id": "2025全国二卷",
      "year": 2025,
      "type": "真题",
      "no": 38,
      "answer": "for",
      "explanation": "考查介词。句意：我生命中没有任何事情能让我为这一切做好准备------可以肯定的是，我第一次来到这里时，从未想过我会在这个地方感到舒适。prepare sb. for\\...\"使某人为......做好准备\"，固定搭配。故填for。",
      "grammar_point": "介词",
      "category": "preposition",
      "category_name": "介词",
      "passage": "I was born and raised in Cleveland, Ohio in the United States. Yet now, I live in the countryside of Zhejiang, China with my Chinese husband and his family, ___36___ bamboo and tea bushes (灌木) grow wild in the mountains, chickens are always free-range, and ___37___ (center) heating doesn't exist.\n\nNothing in my life before prepared me ___38___ this one-and to be sure, the first time I came here I never imagined I would ever feel comfortable in this area. But it's amazing how you can adapt ___39___ learn in a new environment. Over time, I've found ___40___ (I) feeling extremely at home here. And in the process, I've experienced things that really surprise me at times. The \"sunshine scent (香味)\" of freshly sunned clothes ___41___ (be) one of them.\n\nGrowing up, my family and our neighbors never used clotheslines to dry clothing, denying me the chance ___42___ (discover) one of the great wonders of sunshine --- the sweet \"sunshine scent\" after sunning clothes for an entire day. The sun-dried clothes smell especially pleasant where I live, thanks to the ___43___ (absent) of smog and plenty of blue sky ___44___ (afternoon) with lots of fresh air.\n\nIf you've never experienced the \"sunshine scent\" from a sheet or shirt ___45___ (leave) to sun for a day, well, you're missing out on one of life's wonders.",
      "fine_category": "prep-collocation",
      "facets": {
        "word": "for"
      }
    },
    {
      "id": "2025全国二卷-39",
      "exam_id": "2025全国二卷",
      "year": 2025,
      "type": "真题",
      "no": 39,
      "answer": "and",
      "explanation": "考查连词。句意：但令人惊讶的是，你是如何适应并在新环境中学习的。adapt和learn是并列关系，应用连词and连接。故填and。",
      "grammar_point": "连词",
      "category": "logic",
      "category_name": "逻辑连词",
      "passage": "I was born and raised in Cleveland, Ohio in the United States. Yet now, I live in the countryside of Zhejiang, China with my Chinese husband and his family, ___36___ bamboo and tea bushes (灌木) grow wild in the mountains, chickens are always free-range, and ___37___ (center) heating doesn't exist.\n\nNothing in my life before prepared me ___38___ this one-and to be sure, the first time I came here I never imagined I would ever feel comfortable in this area. But it's amazing how you can adapt ___39___ learn in a new environment. Over time, I've found ___40___ (I) feeling extremely at home here. And in the process, I've experienced things that really surprise me at times. The \"sunshine scent (香味)\" of freshly sunned clothes ___41___ (be) one of them.\n\nGrowing up, my family and our neighbors never used clotheslines to dry clothing, denying me the chance ___42___ (discover) one of the great wonders of sunshine --- the sweet \"sunshine scent\" after sunning clothes for an entire day. The sun-dried clothes smell especially pleasant where I live, thanks to the ___43___ (absent) of smog and plenty of blue sky ___44___ (afternoon) with lots of fresh air.\n\nIf you've never experienced the \"sunshine scent\" from a sheet or shirt ___45___ (leave) to sun for a day, well, you're missing out on one of life's wonders.",
      "fine_category": "logic-coordinating",
      "facets": {
        "word": "and",
        "kind": "coordinating"
      }
    },
    {
      "id": "2025全国二卷-40",
      "exam_id": "2025全国二卷",
      "year": 2025,
      "type": "真题",
      "no": 40,
      "answer": "myself",
      "explanation": "考查反身代词。句意：随着时间的推移，我发现自己在这里有了宾至如归的感觉。本空指代主语I，表示\"我自己\"，应用反身代词myself。故填myself。",
      "grammar_point": "反身代词",
      "category": "pronoun",
      "category_name": "代词",
      "passage": "I was born and raised in Cleveland, Ohio in the United States. Yet now, I live in the countryside of Zhejiang, China with my Chinese husband and his family, ___36___ bamboo and tea bushes (灌木) grow wild in the mountains, chickens are always free-range, and ___37___ (center) heating doesn't exist.\n\nNothing in my life before prepared me ___38___ this one-and to be sure, the first time I came here I never imagined I would ever feel comfortable in this area. But it's amazing how you can adapt ___39___ learn in a new environment. Over time, I've found ___40___ (I) feeling extremely at home here. And in the process, I've experienced things that really surprise me at times. The \"sunshine scent (香味)\" of freshly sunned clothes ___41___ (be) one of them.\n\nGrowing up, my family and our neighbors never used clotheslines to dry clothing, denying me the chance ___42___ (discover) one of the great wonders of sunshine --- the sweet \"sunshine scent\" after sunning clothes for an entire day. The sun-dried clothes smell especially pleasant where I live, thanks to the ___43___ (absent) of smog and plenty of blue sky ___44___ (afternoon) with lots of fresh air.\n\nIf you've never experienced the \"sunshine scent\" from a sheet or shirt ___45___ (leave) to sun for a day, well, you're missing out on one of life's wonders.",
      "fine_category": "pron-personal",
      "facets": {
        "type": "personal"
      }
    },
    {
      "id": "2025全国二卷-41",
      "exam_id": "2025全国二卷",
      "year": 2025,
      "type": "真题",
      "no": 41,
      "answer": "is",
      "explanation": "考查时态和主谓一致。句意：晒过的衣服的\"阳光的味道\"就是其中之一。本句描述的是一般事实，时态用一般现在时，且主语The \"sunshine scent (香味)\" of freshly sunned clothes为第三人称单数，be动词用is。故填is。",
      "grammar_point": "时态和主谓一致",
      "category": "predicate",
      "category_name": "谓语动词",
      "passage": "I was born and raised in Cleveland, Ohio in the United States. Yet now, I live in the countryside of Zhejiang, China with my Chinese husband and his family, ___36___ bamboo and tea bushes (灌木) grow wild in the mountains, chickens are always free-range, and ___37___ (center) heating doesn't exist.\n\nNothing in my life before prepared me ___38___ this one-and to be sure, the first time I came here I never imagined I would ever feel comfortable in this area. But it's amazing how you can adapt ___39___ learn in a new environment. Over time, I've found ___40___ (I) feeling extremely at home here. And in the process, I've experienced things that really surprise me at times. The \"sunshine scent (香味)\" of freshly sunned clothes ___41___ (be) one of them.\n\nGrowing up, my family and our neighbors never used clotheslines to dry clothing, denying me the chance ___42___ (discover) one of the great wonders of sunshine --- the sweet \"sunshine scent\" after sunning clothes for an entire day. The sun-dried clothes smell especially pleasant where I live, thanks to the ___43___ (absent) of smog and plenty of blue sky ___44___ (afternoon) with lots of fresh air.\n\nIf you've never experienced the \"sunshine scent\" from a sheet or shirt ___45___ (leave) to sun for a day, well, you're missing out on one of life's wonders.",
      "fine_category": "pred-sva-form"
    },
    {
      "id": "2025全国二卷-42",
      "exam_id": "2025全国二卷",
      "year": 2025,
      "type": "真题",
      "no": 42,
      "answer": "to discover",
      "explanation": "考查非谓语动词。句意：在我的成长过程中，我的家人和邻居从不使用晾衣绳晾晒衣物，这让我没有机会发现阳光的奇妙之处之一------将衣服晒了一整天后散发的甜美的\"阳光的味道\"。本句已有谓语used，此处应用非谓语动词， chance to do sth.\"做某事的机会\",本空用discover的不定式，作定语。故填to discover。",
      "grammar_point": "非谓语动词",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "I was born and raised in Cleveland, Ohio in the United States. Yet now, I live in the countryside of Zhejiang, China with my Chinese husband and his family, ___36___ bamboo and tea bushes (灌木) grow wild in the mountains, chickens are always free-range, and ___37___ (center) heating doesn't exist.\n\nNothing in my life before prepared me ___38___ this one-and to be sure, the first time I came here I never imagined I would ever feel comfortable in this area. But it's amazing how you can adapt ___39___ learn in a new environment. Over time, I've found ___40___ (I) feeling extremely at home here. And in the process, I've experienced things that really surprise me at times. The \"sunshine scent (香味)\" of freshly sunned clothes ___41___ (be) one of them.\n\nGrowing up, my family and our neighbors never used clotheslines to dry clothing, denying me the chance ___42___ (discover) one of the great wonders of sunshine --- the sweet \"sunshine scent\" after sunning clothes for an entire day. The sun-dried clothes smell especially pleasant where I live, thanks to the ___43___ (absent) of smog and plenty of blue sky ___44___ (afternoon) with lots of fresh air.\n\nIf you've never experienced the \"sunshine scent\" from a sheet or shirt ___45___ (leave) to sun for a day, well, you're missing out on one of life's wonders.",
      "fine_category": "nonpred-to-do",
      "nonp_function": "attribute",
      "nonp_function_label": "作定语",
      "nonp_form": "to_do",
      "nonp_form_label": "to do",
      "nonp_rule": "chance 后常接 to do 作后置定语，表示“发现……的机会”。",
      "nonp_needs_review": false,
      "facets": {
        "form": "to-do"
      }
    },
    {
      "id": "2025全国二卷-43",
      "exam_id": "2025全国二卷",
      "year": 2025,
      "type": "真题",
      "no": 43,
      "answer": "absence",
      "explanation": "查名词。句意：我住的地方，晒干的衣服闻起来特别香，这要归功于没有烟雾，而且下午的天很蓝天、空气新鲜。本空作thanks to的宾语，应用名词absence\"缺乏，没有\"，不可数名词。故填absence。",
      "grammar_point": "名词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "I was born and raised in Cleveland, Ohio in the United States. Yet now, I live in the countryside of Zhejiang, China with my Chinese husband and his family, ___36___ bamboo and tea bushes (灌木) grow wild in the mountains, chickens are always free-range, and ___37___ (center) heating doesn't exist.\n\nNothing in my life before prepared me ___38___ this one-and to be sure, the first time I came here I never imagined I would ever feel comfortable in this area. But it's amazing how you can adapt ___39___ learn in a new environment. Over time, I've found ___40___ (I) feeling extremely at home here. And in the process, I've experienced things that really surprise me at times. The \"sunshine scent (香味)\" of freshly sunned clothes ___41___ (be) one of them.\n\nGrowing up, my family and our neighbors never used clotheslines to dry clothing, denying me the chance ___42___ (discover) one of the great wonders of sunshine --- the sweet \"sunshine scent\" after sunning clothes for an entire day. The sun-dried clothes smell especially pleasant where I live, thanks to the ___43___ (absent) of smog and plenty of blue sky ___44___ (afternoon) with lots of fresh air.\n\nIf you've never experienced the \"sunshine scent\" from a sheet or shirt ___45___ (leave) to sun for a day, well, you're missing out on one of life's wonders.",
      "fine_category": "word-noun",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2025全国二卷-44",
      "exam_id": "2025全国二卷",
      "year": 2025,
      "type": "真题",
      "no": 44,
      "answer": "afternoons",
      "explanation": "考查名词的数。句意：我住的地方，晒干的衣服闻起来特别香，这要归功于没有烟雾，而且下午有很多蓝天和新鲜空气。afternoon\"下午\"是可数名词，此处指不止一个下午，应用复数形式afternoons。故填afternoons。",
      "grammar_point": "名词的数",
      "category": "number",
      "category_name": "名词/数词",
      "passage": "I was born and raised in Cleveland, Ohio in the United States. Yet now, I live in the countryside of Zhejiang, China with my Chinese husband and his family, ___36___ bamboo and tea bushes (灌木) grow wild in the mountains, chickens are always free-range, and ___37___ (center) heating doesn't exist.\n\nNothing in my life before prepared me ___38___ this one-and to be sure, the first time I came here I never imagined I would ever feel comfortable in this area. But it's amazing how you can adapt ___39___ learn in a new environment. Over time, I've found ___40___ (I) feeling extremely at home here. And in the process, I've experienced things that really surprise me at times. The \"sunshine scent (香味)\" of freshly sunned clothes ___41___ (be) one of them.\n\nGrowing up, my family and our neighbors never used clotheslines to dry clothing, denying me the chance ___42___ (discover) one of the great wonders of sunshine --- the sweet \"sunshine scent\" after sunning clothes for an entire day. The sun-dried clothes smell especially pleasant where I live, thanks to the ___43___ (absent) of smog and plenty of blue sky ___44___ (afternoon) with lots of fresh air.\n\nIf you've never experienced the \"sunshine scent\" from a sheet or shirt ___45___ (leave) to sun for a day, well, you're missing out on one of life's wonders.",
      "fine_category": "num-plural",
      "facets": {
        "type": "plural"
      }
    },
    {
      "id": "2025全国二卷-45",
      "exam_id": "2025全国二卷",
      "year": 2025,
      "type": "真题",
      "no": 45,
      "answer": "left",
      "explanation": "考查非谓语动词。句意：如果你从未体验过在阳光下晾晒了一整天的床单或衬衫散发的\"阳光的味道\"，那么你就错过了生活中的一大奇观。本句已有谓语have experienced，此处应用非谓语动词，a sheet or shirt和leave\"使处于某种状态\"之间是逻辑动宾关系，应用过去分词，作后置定语。故填left。",
      "grammar_point": "非谓语动词",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "I was born and raised in Cleveland, Ohio in the United States. Yet now, I live in the countryside of Zhejiang, China with my Chinese husband and his family, ___36___ bamboo and tea bushes (灌木) grow wild in the mountains, chickens are always free-range, and ___37___ (center) heating doesn't exist.\n\nNothing in my life before prepared me ___38___ this one-and to be sure, the first time I came here I never imagined I would ever feel comfortable in this area. But it's amazing how you can adapt ___39___ learn in a new environment. Over time, I've found ___40___ (I) feeling extremely at home here. And in the process, I've experienced things that really surprise me at times. The \"sunshine scent (香味)\" of freshly sunned clothes ___41___ (be) one of them.\n\nGrowing up, my family and our neighbors never used clotheslines to dry clothing, denying me the chance ___42___ (discover) one of the great wonders of sunshine --- the sweet \"sunshine scent\" after sunning clothes for an entire day. The sun-dried clothes smell especially pleasant where I live, thanks to the ___43___ (absent) of smog and plenty of blue sky ___44___ (afternoon) with lots of fresh air.\n\nIf you've never experienced the \"sunshine scent\" from a sheet or shirt ___45___ (leave) to sun for a day, well, you're missing out on one of life's wonders.",
      "fine_category": "nonpred-done",
      "nonp_function": "attribute",
      "nonp_function_label": "作定语",
      "nonp_form": "done",
      "nonp_form_label": "done",
      "nonp_rule": "left 修饰 a sheet or shirt，二者与 leave 是动宾关系，用 done 作后置定语。",
      "nonp_needs_review": false,
      "facets": {
        "form": "done"
      }
    },
    {
      "id": "2025广州一模-36",
      "exam_id": "2025广州一模",
      "year": 2025,
      "type": "模拟卷",
      "no": 36,
      "answer": "an",
      "explanation": "考查冠词。句意：由《中国国家地理》主办的“中国野生动物影像录像大赛”一直是野生动物文献记录领域具有重要意义的活动。event是可数名词的单数形式，表泛指，前面要加不定冠词，event是元音音素开头，因此不定冠词用an，故填an。",
      "grammar_point": "冠词",
      "category": "article",
      "category_name": "冠词",
      "passage": "The China Wildlife Image and Video Competition, hosted by the Chinese National Geography, has long been ___36___ event of great significance in the field of wildlife documentation. At an awards ceremony recently held in Beijing, 17 remarkable images and videos, which ___37___ (select) from over 37,600 submissions globally, deeply attracted the audience.\n\nThe competition, ___38___ (theme) “Spirituality of Mountains and Seas” this year, aims to enhance public awareness of wildlife and ecological conservation. Among the award-winning ___39___ (entry), the work of Jia Haining’s team on Oriental storks (东方白鹳) in the Yellow River Delta stood out ___40___ (noticeable). Their delicate piece of art beautifully demonstrated the region’s ecological harmony and species ___41___ (diverse).\n\nTo film the dynamic moment ___42___ the birds left their nests, they arrived at the filming site as early as 4:30 am. And they waited patiently for almost two months ___43___ the young storks’ first flight! The judges praised their work as a breathtaking symphony of life.\n\nAdditionally, special awards for mobile photography and social media engagement were introduced to encourage ___44___ (broad) public participation. The competition, as Dr. Jane Goodall noted, has the power to inspire people, especially those who rarely have the opportunity to experience nature firsthand, ___45___ (reconnect) with the natural world.",
      "fine_category": "art-a-an",
      "facets": {
        "word": "a-an"
      }
    },
    {
      "id": "2025广州一模-37",
      "exam_id": "2025广州一模",
      "year": 2025,
      "type": "模拟卷",
      "no": 37,
      "answer": "were selected",
      "explanation": "考查时态，被动语态和主谓一致。句意：最近在北京举行的颁奖典礼上，从全球超过37,600份参赛作品中选出了17张出色的图片和视频，深深吸引了观众。图片和视频是被选择，由attracted可知句子时态是一般过去时，因此空格处用一般过去时的被动语态，which指代的先行词17 remarkable images and videos是复数，因此空格处是were selected。故填were selected。",
      "grammar_point": "时态",
      "category": "predicate",
      "category_name": "谓语动词",
      "passage": "The China Wildlife Image and Video Competition, hosted by the Chinese National Geography, has long been ___36___ event of great significance in the field of wildlife documentation. At an awards ceremony recently held in Beijing, 17 remarkable images and videos, which ___37___ (select) from over 37,600 submissions globally, deeply attracted the audience.\n\nThe competition, ___38___ (theme) “Spirituality of Mountains and Seas” this year, aims to enhance public awareness of wildlife and ecological conservation. Among the award-winning ___39___ (entry), the work of Jia Haining’s team on Oriental storks (东方白鹳) in the Yellow River Delta stood out ___40___ (noticeable). Their delicate piece of art beautifully demonstrated the region’s ecological harmony and species ___41___ (diverse).\n\nTo film the dynamic moment ___42___ the birds left their nests, they arrived at the filming site as early as 4:30 am. And they waited patiently for almost two months ___43___ the young storks’ first flight! The judges praised their work as a breathtaking symphony of life.\n\nAdditionally, special awards for mobile photography and social media engagement were introduced to encourage ___44___ (broad) public participation. The competition, as Dr. Jane Goodall noted, has the power to inspire people, especially those who rarely have the opportunity to experience nature firsthand, ___45___ (reconnect) with the natural world.",
      "fine_category": "pred-passive-form"
    },
    {
      "id": "2025广州一模-38",
      "exam_id": "2025广州一模",
      "year": 2025,
      "type": "模拟卷",
      "no": 38,
      "answer": "themed",
      "explanation": "考查非谓语动词。句意：今年的比赛主题为“Spirituality of Mountains and Seas”，旨在提高公众对野生动物和生态保护的意识。句中谓语是aims，空格处用非谓语动词，competition和theme之间是逻辑动宾关系，因此空格处用过去分词表被动，作后置定语，故填themed。",
      "grammar_point": "非谓语动词",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "The China Wildlife Image and Video Competition, hosted by the Chinese National Geography, has long been ___36___ event of great significance in the field of wildlife documentation. At an awards ceremony recently held in Beijing, 17 remarkable images and videos, which ___37___ (select) from over 37,600 submissions globally, deeply attracted the audience.\n\nThe competition, ___38___ (theme) “Spirituality of Mountains and Seas” this year, aims to enhance public awareness of wildlife and ecological conservation. Among the award-winning ___39___ (entry), the work of Jia Haining’s team on Oriental storks (东方白鹳) in the Yellow River Delta stood out ___40___ (noticeable). Their delicate piece of art beautifully demonstrated the region’s ecological harmony and species ___41___ (diverse).\n\nTo film the dynamic moment ___42___ the birds left their nests, they arrived at the filming site as early as 4:30 am. And they waited patiently for almost two months ___43___ the young storks’ first flight! The judges praised their work as a breathtaking symphony of life.\n\nAdditionally, special awards for mobile photography and social media engagement were introduced to encourage ___44___ (broad) public participation. The competition, as Dr. Jane Goodall noted, has the power to inspire people, especially those who rarely have the opportunity to experience nature firsthand, ___45___ (reconnect) with the natural world.",
      "fine_category": "nonpred-done",
      "nonp_function": "attribute",
      "nonp_function_label": "作定语",
      "nonp_form": "done",
      "nonp_form_label": "done",
      "nonp_rule": "themed 修饰 competition，competition 与 theme 是动宾关系，用 done 作后置定语。",
      "nonp_needs_review": false,
      "facets": {
        "form": "done"
      }
    },
    {
      "id": "2025广州一模-39",
      "exam_id": "2025广州一模",
      "year": 2025,
      "type": "模拟卷",
      "no": 39,
      "answer": "entries",
      "explanation": "考查名词的复数。句意：在获奖作品中，Jia Haining团队关于黄河三角洲东方鹳的作品引人注目。entry是可数名词，不止一个，因此空格处用复数，故填entries。",
      "grammar_point": "名词的复数",
      "category": "number",
      "category_name": "名词/数词",
      "passage": "The China Wildlife Image and Video Competition, hosted by the Chinese National Geography, has long been ___36___ event of great significance in the field of wildlife documentation. At an awards ceremony recently held in Beijing, 17 remarkable images and videos, which ___37___ (select) from over 37,600 submissions globally, deeply attracted the audience.\n\nThe competition, ___38___ (theme) “Spirituality of Mountains and Seas” this year, aims to enhance public awareness of wildlife and ecological conservation. Among the award-winning ___39___ (entry), the work of Jia Haining’s team on Oriental storks (东方白鹳) in the Yellow River Delta stood out ___40___ (noticeable). Their delicate piece of art beautifully demonstrated the region’s ecological harmony and species ___41___ (diverse).\n\nTo film the dynamic moment ___42___ the birds left their nests, they arrived at the filming site as early as 4:30 am. And they waited patiently for almost two months ___43___ the young storks’ first flight! The judges praised their work as a breathtaking symphony of life.\n\nAdditionally, special awards for mobile photography and social media engagement were introduced to encourage ___44___ (broad) public participation. The competition, as Dr. Jane Goodall noted, has the power to inspire people, especially those who rarely have the opportunity to experience nature firsthand, ___45___ (reconnect) with the natural world.",
      "fine_category": "num-plural",
      "facets": {
        "type": "plural"
      }
    },
    {
      "id": "2025广州一模-40",
      "exam_id": "2025广州一模",
      "year": 2025,
      "type": "模拟卷",
      "no": 40,
      "answer": "noticeably",
      "explanation": "考查副词。句意：在获奖作品中，Jia Haining团队关于黄河三角洲东方鹳的作品引人注目。空格处用副词修饰动词短语stood out，noticeable的副词是noticeably，意为“显著地，引人注目地”，故填noticeably。",
      "grammar_point": "副词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "The China Wildlife Image and Video Competition, hosted by the Chinese National Geography, has long been ___36___ event of great significance in the field of wildlife documentation. At an awards ceremony recently held in Beijing, 17 remarkable images and videos, which ___37___ (select) from over 37,600 submissions globally, deeply attracted the audience.\n\nThe competition, ___38___ (theme) “Spirituality of Mountains and Seas” this year, aims to enhance public awareness of wildlife and ecological conservation. Among the award-winning ___39___ (entry), the work of Jia Haining’s team on Oriental storks (东方白鹳) in the Yellow River Delta stood out ___40___ (noticeable). Their delicate piece of art beautifully demonstrated the region’s ecological harmony and species ___41___ (diverse).\n\nTo film the dynamic moment ___42___ the birds left their nests, they arrived at the filming site as early as 4:30 am. And they waited patiently for almost two months ___43___ the young storks’ first flight! The judges praised their work as a breathtaking symphony of life.\n\nAdditionally, special awards for mobile photography and social media engagement were introduced to encourage ___44___ (broad) public participation. The competition, as Dr. Jane Goodall noted, has the power to inspire people, especially those who rarely have the opportunity to experience nature firsthand, ___45___ (reconnect) with the natural world.",
      "fine_category": "word-adv",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2025广州一模-41",
      "exam_id": "2025广州一模",
      "year": 2025,
      "type": "模拟卷",
      "no": 41,
      "answer": "diversity",
      "explanation": "考查名词。句意：他们精致的艺术品精美地展示了该地区的生态和谐和物种多样性。空格处用名词作宾语，diverse的名词是diversity，是不可数名词，意为“多样性”。故填diversity。",
      "grammar_point": "名词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "The China Wildlife Image and Video Competition, hosted by the Chinese National Geography, has long been ___36___ event of great significance in the field of wildlife documentation. At an awards ceremony recently held in Beijing, 17 remarkable images and videos, which ___37___ (select) from over 37,600 submissions globally, deeply attracted the audience.\n\nThe competition, ___38___ (theme) “Spirituality of Mountains and Seas” this year, aims to enhance public awareness of wildlife and ecological conservation. Among the award-winning ___39___ (entry), the work of Jia Haining’s team on Oriental storks (东方白鹳) in the Yellow River Delta stood out ___40___ (noticeable). Their delicate piece of art beautifully demonstrated the region’s ecological harmony and species ___41___ (diverse).\n\nTo film the dynamic moment ___42___ the birds left their nests, they arrived at the filming site as early as 4:30 am. And they waited patiently for almost two months ___43___ the young storks’ first flight! The judges praised their work as a breathtaking symphony of life.\n\nAdditionally, special awards for mobile photography and social media engagement were introduced to encourage ___44___ (broad) public participation. The competition, as Dr. Jane Goodall noted, has the power to inspire people, especially those who rarely have the opportunity to experience nature firsthand, ___45___ (reconnect) with the natural world.",
      "fine_category": "word-noun",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2025广州一模-42",
      "exam_id": "2025广州一模",
      "year": 2025,
      "type": "模拟卷",
      "no": 42,
      "answer": "when",
      "explanation": "考查定语从句。句意：为了拍摄这些鸟离开巢穴的动态瞬间，他们早在凌晨4:30就到达了拍摄地点。空格处引导的是限制性定语从句，从句中不缺主语或宾语，先行词moment是时间，因此用关系副词when，故填when。",
      "grammar_point": "定语从句",
      "category": "attrib",
      "category_name": "定语从句",
      "passage": "The China Wildlife Image and Video Competition, hosted by the Chinese National Geography, has long been ___36___ event of great significance in the field of wildlife documentation. At an awards ceremony recently held in Beijing, 17 remarkable images and videos, which ___37___ (select) from over 37,600 submissions globally, deeply attracted the audience.\n\nThe competition, ___38___ (theme) “Spirituality of Mountains and Seas” this year, aims to enhance public awareness of wildlife and ecological conservation. Among the award-winning ___39___ (entry), the work of Jia Haining’s team on Oriental storks (东方白鹳) in the Yellow River Delta stood out ___40___ (noticeable). Their delicate piece of art beautifully demonstrated the region’s ecological harmony and species ___41___ (diverse).\n\nTo film the dynamic moment ___42___ the birds left their nests, they arrived at the filming site as early as 4:30 am. And they waited patiently for almost two months ___43___ the young storks’ first flight! The judges praised their work as a breathtaking symphony of life.\n\nAdditionally, special awards for mobile photography and social media engagement were introduced to encourage ___44___ (broad) public participation. The competition, as Dr. Jane Goodall noted, has the power to inspire people, especially those who rarely have the opportunity to experience nature firsthand, ___45___ (reconnect) with the natural world.",
      "fine_category": "attrib-adverb",
      "facets": {
        "type": "relative-adverb",
        "word": "when",
        "restrictive": true
      }
    },
    {
      "id": "2025广州一模-43",
      "exam_id": "2025广州一模",
      "year": 2025,
      "type": "模拟卷",
      "no": 43,
      "answer": "for",
      "explanation": "考查介词。句意：他们耐心地等待了近两个月，等待小鹳的第一次飞行！wait for是固定短语，意为“等待”，因此空格处用介词for，故填for。",
      "grammar_point": "介词",
      "category": "preposition",
      "category_name": "介词",
      "passage": "The China Wildlife Image and Video Competition, hosted by the Chinese National Geography, has long been ___36___ event of great significance in the field of wildlife documentation. At an awards ceremony recently held in Beijing, 17 remarkable images and videos, which ___37___ (select) from over 37,600 submissions globally, deeply attracted the audience.\n\nThe competition, ___38___ (theme) “Spirituality of Mountains and Seas” this year, aims to enhance public awareness of wildlife and ecological conservation. Among the award-winning ___39___ (entry), the work of Jia Haining’s team on Oriental storks (东方白鹳) in the Yellow River Delta stood out ___40___ (noticeable). Their delicate piece of art beautifully demonstrated the region’s ecological harmony and species ___41___ (diverse).\n\nTo film the dynamic moment ___42___ the birds left their nests, they arrived at the filming site as early as 4:30 am. And they waited patiently for almost two months ___43___ the young storks’ first flight! The judges praised their work as a breathtaking symphony of life.\n\nAdditionally, special awards for mobile photography and social media engagement were introduced to encourage ___44___ (broad) public participation. The competition, as Dr. Jane Goodall noted, has the power to inspire people, especially those who rarely have the opportunity to experience nature firsthand, ___45___ (reconnect) with the natural world.",
      "fine_category": "prep-collocation",
      "facets": {
        "word": "for"
      }
    },
    {
      "id": "2025广州一模-44",
      "exam_id": "2025广州一模",
      "year": 2025,
      "type": "模拟卷",
      "no": 44,
      "answer": "broader",
      "explanation": "考查比较级。句意：此外，还设立了手机摄影和社交媒体参与特别奖，以鼓励更广泛的公众参与。根据语境可知，句子表示“以鼓励更广泛的公众参与”，空格处用比较级broader，表示“更广泛的”。故填broader。",
      "grammar_point": "比较级",
      "category": "word",
      "category_name": "词性转换",
      "passage": "The China Wildlife Image and Video Competition, hosted by the Chinese National Geography, has long been ___36___ event of great significance in the field of wildlife documentation. At an awards ceremony recently held in Beijing, 17 remarkable images and videos, which ___37___ (select) from over 37,600 submissions globally, deeply attracted the audience.\n\nThe competition, ___38___ (theme) “Spirituality of Mountains and Seas” this year, aims to enhance public awareness of wildlife and ecological conservation. Among the award-winning ___39___ (entry), the work of Jia Haining’s team on Oriental storks (东方白鹳) in the Yellow River Delta stood out ___40___ (noticeable). Their delicate piece of art beautifully demonstrated the region’s ecological harmony and species ___41___ (diverse).\n\nTo film the dynamic moment ___42___ the birds left their nests, they arrived at the filming site as early as 4:30 am. And they waited patiently for almost two months ___43___ the young storks’ first flight! The judges praised their work as a breathtaking symphony of life.\n\nAdditionally, special awards for mobile photography and social media engagement were introduced to encourage ___44___ (broad) public participation. The competition, as Dr. Jane Goodall noted, has the power to inspire people, especially those who rarely have the opportunity to experience nature firsthand, ___45___ (reconnect) with the natural world.",
      "fine_category": "word-comparative",
      "facets": {
        "subtype": "comparative"
      }
    },
    {
      "id": "2025广州一模-45",
      "exam_id": "2025广州一模",
      "year": 2025,
      "type": "模拟卷",
      "no": 45,
      "answer": "to reconnect",
      "explanation": "考查不定式。句意：正如Jane Goodall博士所指出的那样，这项竞赛具有激励人们，尤其是那些很少有机会亲身体验大自然的人，重新与自然世界建立联系的力量。inspire sb. to do sth.是固定短语，意为“激励某人做某事”，因此空格处是不定式to reconnect，故填to reconnect。",
      "grammar_point": "不定式",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "The China Wildlife Image and Video Competition, hosted by the Chinese National Geography, has long been ___36___ event of great significance in the field of wildlife documentation. At an awards ceremony recently held in Beijing, 17 remarkable images and videos, which ___37___ (select) from over 37,600 submissions globally, deeply attracted the audience.\n\nThe competition, ___38___ (theme) “Spirituality of Mountains and Seas” this year, aims to enhance public awareness of wildlife and ecological conservation. Among the award-winning ___39___ (entry), the work of Jia Haining’s team on Oriental storks (东方白鹳) in the Yellow River Delta stood out ___40___ (noticeable). Their delicate piece of art beautifully demonstrated the region’s ecological harmony and species ___41___ (diverse).\n\nTo film the dynamic moment ___42___ the birds left their nests, they arrived at the filming site as early as 4:30 am. And they waited patiently for almost two months ___43___ the young storks’ first flight! The judges praised their work as a breathtaking symphony of life.\n\nAdditionally, special awards for mobile photography and social media engagement were introduced to encourage ___44___ (broad) public participation. The competition, as Dr. Jane Goodall noted, has the power to inspire people, especially those who rarely have the opportunity to experience nature firsthand, ___45___ (reconnect) with the natural world.",
      "fine_category": "nonpred-to-do",
      "nonp_function": "complement",
      "nonp_function_label": "作补语",
      "nonp_form": "to_do",
      "nonp_form_label": "to do",
      "nonp_rule": "inspire sb. to do sth. 中 to reconnect 作宾语补足语，说明激励对象去做什么。",
      "nonp_needs_review": false,
      "facets": {
        "form": "to-do"
      }
    },
    {
      "id": "2025广州二模-56",
      "exam_id": "2025广州二模",
      "year": 2025,
      "type": "模拟卷",
      "no": 56,
      "answer": "how",
      "explanation": "how /why考查宾语从句。空格后为完整句子，且描述“这一简单餐食如何变得流行”，需用连接副词how引导宾语从句，作describes的宾语。",
      "grammar_point": "宾语从句",
      "category": "nounclause",
      "category_name": "名词性从句",
      "passage": "Once a little-known dish from China's northwest,Lanzhou beef noodle soup is now winning hearts globally.A recent article describes ___56___ this surprisingly simple meal has become popular in ___57___ (city)like New York,London,and Sydney.\n\nAppealing online photos and videos of the dish stimulate local people's appetite and arouse their curiosity,driving them to give ___58___ a try.Diners appreciate both its taste and the experience it offers.In a Manhattan eatery,cooks stretch dough(面团)into noodles right ___59___ customers' eyes.\"It's like magic,\"said one diner.Diners are also amazed by the unique and ___60___ (impressive) chewy texture of Lanzhou noodles,which offers a distinct mouthfeel unlike any other.\n\nThe soup, ___61___ (cook)for hours with beef bones and spices,has a rich flavor.In Queens, a restaurant prepares a version ___62___ respects the dishes' cultural roots and combines 20 spices to produce a hearty soup.The owner even video-calls her grandparents in China for recipes.In Flushing,the owner of a noodle shop adapts the soup based on customer feedback,making it thicker and spicier ___63___ (suit)local preferences.As food expert C.Doyle notes,\"There's no single 'correct' version—it keeps evolving.\"\n\nFrom street food to global star,Lanzhou beef noodle soup shows that sharing food. ___64___(bridge) cultural differences,with each bowl ___65___ (tell)a story of tradition,creativity,and the delight of flavor discovery.",
      "fine_category": "nounc-wh-adverb",
      "facets": {
        "type": "wh-adverb",
        "word": "how"
      }
    },
    {
      "id": "2025广州二模-57",
      "exam_id": "2025广州二模",
      "year": 2025,
      "type": "模拟卷",
      "no": 57,
      "answer": "cities",
      "explanation": "cities 考查名词复数。介词like后列举多个城市名称，表示泛指“纽约、伦敦、悉尼等城市”，故用复数形式cities。",
      "grammar_point": "名词复数",
      "category": "number",
      "category_name": "名词/数词",
      "passage": "Once a little-known dish from China's northwest,Lanzhou beef noodle soup is now winning hearts globally.A recent article describes ___56___ this surprisingly simple meal has become popular in ___57___ (city)like New York,London,and Sydney.\n\nAppealing online photos and videos of the dish stimulate local people's appetite and arouse their curiosity,driving them to give ___58___ a try.Diners appreciate both its taste and the experience it offers.In a Manhattan eatery,cooks stretch dough(面团)into noodles right ___59___ customers' eyes.\"It's like magic,\"said one diner.Diners are also amazed by the unique and ___60___ (impressive) chewy texture of Lanzhou noodles,which offers a distinct mouthfeel unlike any other.\n\nThe soup, ___61___ (cook)for hours with beef bones and spices,has a rich flavor.In Queens, a restaurant prepares a version ___62___ respects the dishes' cultural roots and combines 20 spices to produce a hearty soup.The owner even video-calls her grandparents in China for recipes.In Flushing,the owner of a noodle shop adapts the soup based on customer feedback,making it thicker and spicier ___63___ (suit)local preferences.As food expert C.Doyle notes,\"There's no single 'correct' version—it keeps evolving.\"\n\nFrom street food to global star,Lanzhou beef noodle soup shows that sharing food. ___64___(bridge) cultural differences,with each bowl ___65___ (tell)a story of tradition,creativity,and the delight of flavor discovery.",
      "fine_category": "num-plural",
      "facets": {
        "type": "plural"
      }
    },
    {
      "id": "2025广州二模-58",
      "exam_id": "2025广州二模",
      "year": 2025,
      "type": "模拟卷",
      "no": 58,
      "answer": "it",
      "explanation": "it 考查代词。指代前文提到的“兰州牛肉面”，用代词it作give的宾语，构成短语give it a try（尝试一下）。",
      "grammar_point": "代词",
      "category": "pronoun",
      "category_name": "代词",
      "passage": "Once a little-known dish from China's northwest,Lanzhou beef noodle soup is now winning hearts globally.A recent article describes ___56___ this surprisingly simple meal has become popular in ___57___ (city)like New York,London,and Sydney.\n\nAppealing online photos and videos of the dish stimulate local people's appetite and arouse their curiosity,driving them to give ___58___ a try.Diners appreciate both its taste and the experience it offers.In a Manhattan eatery,cooks stretch dough(面团)into noodles right ___59___ customers' eyes.\"It's like magic,\"said one diner.Diners are also amazed by the unique and ___60___ (impressive) chewy texture of Lanzhou noodles,which offers a distinct mouthfeel unlike any other.\n\nThe soup, ___61___ (cook)for hours with beef bones and spices,has a rich flavor.In Queens, a restaurant prepares a version ___62___ respects the dishes' cultural roots and combines 20 spices to produce a hearty soup.The owner even video-calls her grandparents in China for recipes.In Flushing,the owner of a noodle shop adapts the soup based on customer feedback,making it thicker and spicier ___63___ (suit)local preferences.As food expert C.Doyle notes,\"There's no single 'correct' version—it keeps evolving.\"\n\nFrom street food to global star,Lanzhou beef noodle soup shows that sharing food. ___64___(bridge) cultural differences,with each bowl ___65___ (tell)a story of tradition,creativity,and the delight of flavor discovery.",
      "fine_category": "pron-personal",
      "facets": {
        "type": "personal"
      }
    },
    {
      "id": "2025广州二模-59",
      "exam_id": "2025广州二模",
      "year": 2025,
      "type": "模拟卷",
      "no": 59,
      "answer": "before",
      "explanation": "before 考查介词。根据句意“厨师在顾客眼前将面团拉成面条”，强调“在……面前”，用介词before。",
      "grammar_point": "介词",
      "category": "preposition",
      "category_name": "介词",
      "passage": "Once a little-known dish from China's northwest,Lanzhou beef noodle soup is now winning hearts globally.A recent article describes ___56___ this surprisingly simple meal has become popular in ___57___ (city)like New York,London,and Sydney.\n\nAppealing online photos and videos of the dish stimulate local people's appetite and arouse their curiosity,driving them to give ___58___ a try.Diners appreciate both its taste and the experience it offers.In a Manhattan eatery,cooks stretch dough(面团)into noodles right ___59___ customers' eyes.\"It's like magic,\"said one diner.Diners are also amazed by the unique and ___60___ (impressive) chewy texture of Lanzhou noodles,which offers a distinct mouthfeel unlike any other.\n\nThe soup, ___61___ (cook)for hours with beef bones and spices,has a rich flavor.In Queens, a restaurant prepares a version ___62___ respects the dishes' cultural roots and combines 20 spices to produce a hearty soup.The owner even video-calls her grandparents in China for recipes.In Flushing,the owner of a noodle shop adapts the soup based on customer feedback,making it thicker and spicier ___63___ (suit)local preferences.As food expert C.Doyle notes,\"There's no single 'correct' version—it keeps evolving.\"\n\nFrom street food to global star,Lanzhou beef noodle soup shows that sharing food. ___64___(bridge) cultural differences,with each bowl ___65___ (tell)a story of tradition,creativity,and the delight of flavor discovery.",
      "fine_category": "prep-common",
      "facets": {
        "word": "before"
      }
    },
    {
      "id": "2025广州二模-60",
      "exam_id": "2025广州二模",
      "year": 2025,
      "type": "模拟卷",
      "no": 60,
      "answer": "impressively",
      "explanation": "impressively 考查词性转换。修饰形容词chewy需用副词，表示“令人印象深刻的有嚼劲的口感”，故填impressively。",
      "grammar_point": "词性转换",
      "category": "word",
      "category_name": "词性转换",
      "passage": "Once a little-known dish from China's northwest,Lanzhou beef noodle soup is now winning hearts globally.A recent article describes ___56___ this surprisingly simple meal has become popular in ___57___ (city)like New York,London,and Sydney.\n\nAppealing online photos and videos of the dish stimulate local people's appetite and arouse their curiosity,driving them to give ___58___ a try.Diners appreciate both its taste and the experience it offers.In a Manhattan eatery,cooks stretch dough(面团)into noodles right ___59___ customers' eyes.\"It's like magic,\"said one diner.Diners are also amazed by the unique and ___60___ (impressive) chewy texture of Lanzhou noodles,which offers a distinct mouthfeel unlike any other.\n\nThe soup, ___61___ (cook)for hours with beef bones and spices,has a rich flavor.In Queens, a restaurant prepares a version ___62___ respects the dishes' cultural roots and combines 20 spices to produce a hearty soup.The owner even video-calls her grandparents in China for recipes.In Flushing,the owner of a noodle shop adapts the soup based on customer feedback,making it thicker and spicier ___63___ (suit)local preferences.As food expert C.Doyle notes,\"There's no single 'correct' version—it keeps evolving.\"\n\nFrom street food to global star,Lanzhou beef noodle soup shows that sharing food. ___64___(bridge) cultural differences,with each bowl ___65___ (tell)a story of tradition,creativity,and the delight of flavor discovery.",
      "fine_category": "word-adv",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2025广州二模-61",
      "exam_id": "2025广州二模",
      "year": 2025,
      "type": "模拟卷",
      "no": 61,
      "answer": "cooked",
      "explanation": "cooked 考查非谓语动词。动词cook与主语the soup构成被动关系，且作后置定语，表示“用牛骨和香料熬煮数小时的汤”，用过去分词cooked。",
      "grammar_point": "非谓语动词",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "Once a little-known dish from China's northwest,Lanzhou beef noodle soup is now winning hearts globally.A recent article describes ___56___ this surprisingly simple meal has become popular in ___57___ (city)like New York,London,and Sydney.\n\nAppealing online photos and videos of the dish stimulate local people's appetite and arouse their curiosity,driving them to give ___58___ a try.Diners appreciate both its taste and the experience it offers.In a Manhattan eatery,cooks stretch dough(面团)into noodles right ___59___ customers' eyes.\"It's like magic,\"said one diner.Diners are also amazed by the unique and ___60___ (impressive) chewy texture of Lanzhou noodles,which offers a distinct mouthfeel unlike any other.\n\nThe soup, ___61___ (cook)for hours with beef bones and spices,has a rich flavor.In Queens, a restaurant prepares a version ___62___ respects the dishes' cultural roots and combines 20 spices to produce a hearty soup.The owner even video-calls her grandparents in China for recipes.In Flushing,the owner of a noodle shop adapts the soup based on customer feedback,making it thicker and spicier ___63___ (suit)local preferences.As food expert C.Doyle notes,\"There's no single 'correct' version—it keeps evolving.\"\n\nFrom street food to global star,Lanzhou beef noodle soup shows that sharing food. ___64___(bridge) cultural differences,with each bowl ___65___ (tell)a story of tradition,creativity,and the delight of flavor discovery.",
      "fine_category": "nonpred-done",
      "nonp_function": "attribute",
      "nonp_function_label": "作定语",
      "nonp_form": "done",
      "nonp_form_label": "done",
      "nonp_rule": "cooked 修饰 the soup，soup 与 cook 是动宾关系，用 done 作后置定语。",
      "nonp_needs_review": false,
      "facets": {
        "form": "done"
      }
    },
    {
      "id": "2025广州二模-62",
      "exam_id": "2025广州二模",
      "year": 2025,
      "type": "模拟卷",
      "no": 62,
      "answer": "that",
      "explanation": "that/which 考查定语从句。引导定语从句修饰先行词a version，且在从句中作主语，指物，用关系代词that或which。",
      "grammar_point": "定语从句",
      "category": "attrib",
      "category_name": "定语从句",
      "passage": "Once a little-known dish from China's northwest,Lanzhou beef noodle soup is now winning hearts globally.A recent article describes ___56___ this surprisingly simple meal has become popular in ___57___ (city)like New York,London,and Sydney.\n\nAppealing online photos and videos of the dish stimulate local people's appetite and arouse their curiosity,driving them to give ___58___ a try.Diners appreciate both its taste and the experience it offers.In a Manhattan eatery,cooks stretch dough(面团)into noodles right ___59___ customers' eyes.\"It's like magic,\"said one diner.Diners are also amazed by the unique and ___60___ (impressive) chewy texture of Lanzhou noodles,which offers a distinct mouthfeel unlike any other.\n\nThe soup, ___61___ (cook)for hours with beef bones and spices,has a rich flavor.In Queens, a restaurant prepares a version ___62___ respects the dishes' cultural roots and combines 20 spices to produce a hearty soup.The owner even video-calls her grandparents in China for recipes.In Flushing,the owner of a noodle shop adapts the soup based on customer feedback,making it thicker and spicier ___63___ (suit)local preferences.As food expert C.Doyle notes,\"There's no single 'correct' version—it keeps evolving.\"\n\nFrom street food to global star,Lanzhou beef noodle soup shows that sharing food. ___64___(bridge) cultural differences,with each bowl ___65___ (tell)a story of tradition,creativity,and the delight of flavor discovery.",
      "fine_category": "attrib-pronoun",
      "facets": {
        "type": "relative-pronoun",
        "word": "that",
        "restrictive": true
      }
    },
    {
      "id": "2025广州二模-63",
      "exam_id": "2025广州二模",
      "year": 2025,
      "type": "模拟卷",
      "no": 63,
      "answer": "to suit",
      "explanation": "to suit 考查非谓语动词。动词不定式作目的状语，表示“为了使汤更浓更辣以适应本地口味”，故填to suit。",
      "grammar_point": "非谓语动词",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "Once a little-known dish from China's northwest,Lanzhou beef noodle soup is now winning hearts globally.A recent article describes ___56___ this surprisingly simple meal has become popular in ___57___ (city)like New York,London,and Sydney.\n\nAppealing online photos and videos of the dish stimulate local people's appetite and arouse their curiosity,driving them to give ___58___ a try.Diners appreciate both its taste and the experience it offers.In a Manhattan eatery,cooks stretch dough(面团)into noodles right ___59___ customers' eyes.\"It's like magic,\"said one diner.Diners are also amazed by the unique and ___60___ (impressive) chewy texture of Lanzhou noodles,which offers a distinct mouthfeel unlike any other.\n\nThe soup, ___61___ (cook)for hours with beef bones and spices,has a rich flavor.In Queens, a restaurant prepares a version ___62___ respects the dishes' cultural roots and combines 20 spices to produce a hearty soup.The owner even video-calls her grandparents in China for recipes.In Flushing,the owner of a noodle shop adapts the soup based on customer feedback,making it thicker and spicier ___63___ (suit)local preferences.As food expert C.Doyle notes,\"There's no single 'correct' version—it keeps evolving.\"\n\nFrom street food to global star,Lanzhou beef noodle soup shows that sharing food. ___64___(bridge) cultural differences,with each bowl ___65___ (tell)a story of tradition,creativity,and the delight of flavor discovery.",
      "fine_category": "nonpred-to-do",
      "nonp_function": "adverbial",
      "nonp_function_label": "作状语",
      "nonp_form": "to_do",
      "nonp_form_label": "to do",
      "nonp_rule": "to suit 表目的，说明调整汤味是为了适应本地口味。",
      "nonp_needs_review": false,
      "facets": {
        "form": "to-do"
      }
    },
    {
      "id": "2025广州二模-64",
      "exam_id": "2025广州二模",
      "year": 2025,
      "type": "模拟卷",
      "no": 64,
      "answer": "bridges",
      "explanation": "bridges 考查动词时态。主语sharing food为单数概念，且陈述客观事实，用一般现在时，故填bridges。",
      "grammar_point": "动词时态",
      "category": "predicate",
      "category_name": "谓语动词",
      "passage": "Once a little-known dish from China's northwest,Lanzhou beef noodle soup is now winning hearts globally.A recent article describes ___56___ this surprisingly simple meal has become popular in ___57___ (city)like New York,London,and Sydney.\n\nAppealing online photos and videos of the dish stimulate local people's appetite and arouse their curiosity,driving them to give ___58___ a try.Diners appreciate both its taste and the experience it offers.In a Manhattan eatery,cooks stretch dough(面团)into noodles right ___59___ customers' eyes.\"It's like magic,\"said one diner.Diners are also amazed by the unique and ___60___ (impressive) chewy texture of Lanzhou noodles,which offers a distinct mouthfeel unlike any other.\n\nThe soup, ___61___ (cook)for hours with beef bones and spices,has a rich flavor.In Queens, a restaurant prepares a version ___62___ respects the dishes' cultural roots and combines 20 spices to produce a hearty soup.The owner even video-calls her grandparents in China for recipes.In Flushing,the owner of a noodle shop adapts the soup based on customer feedback,making it thicker and spicier ___63___ (suit)local preferences.As food expert C.Doyle notes,\"There's no single 'correct' version—it keeps evolving.\"\n\nFrom street food to global star,Lanzhou beef noodle soup shows that sharing food. ___64___(bridge) cultural differences,with each bowl ___65___ (tell)a story of tradition,creativity,and the delight of flavor discovery.",
      "fine_category": "pred-tense-present"
    },
    {
      "id": "2025广州二模-65",
      "exam_id": "2025广州二模",
      "year": 2025,
      "type": "模拟卷",
      "no": 65,
      "answer": "telling",
      "explanation": "telling 考查非谓语动词。with复合结构中，each bowl与tell为主动关系，用现在分词telling作宾语补足语，表示“每一碗面都在讲述一个故事”。",
      "grammar_point": "非谓语动词",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "Once a little-known dish from China's northwest,Lanzhou beef noodle soup is now winning hearts globally.A recent article describes ___56___ this surprisingly simple meal has become popular in ___57___ (city)like New York,London,and Sydney.\n\nAppealing online photos and videos of the dish stimulate local people's appetite and arouse their curiosity,driving them to give ___58___ a try.Diners appreciate both its taste and the experience it offers.In a Manhattan eatery,cooks stretch dough(面团)into noodles right ___59___ customers' eyes.\"It's like magic,\"said one diner.Diners are also amazed by the unique and ___60___ (impressive) chewy texture of Lanzhou noodles,which offers a distinct mouthfeel unlike any other.\n\nThe soup, ___61___ (cook)for hours with beef bones and spices,has a rich flavor.In Queens, a restaurant prepares a version ___62___ respects the dishes' cultural roots and combines 20 spices to produce a hearty soup.The owner even video-calls her grandparents in China for recipes.In Flushing,the owner of a noodle shop adapts the soup based on customer feedback,making it thicker and spicier ___63___ (suit)local preferences.As food expert C.Doyle notes,\"There's no single 'correct' version—it keeps evolving.\"\n\nFrom street food to global star,Lanzhou beef noodle soup shows that sharing food. ___64___(bridge) cultural differences,with each bowl ___65___ (tell)a story of tradition,creativity,and the delight of flavor discovery.",
      "fine_category": "nonpred-doing",
      "nonp_function": "with_absolute",
      "nonp_function_label": "with 复合结构",
      "nonp_form": "doing",
      "nonp_form_label": "doing",
      "nonp_rule": "with 复合结构中 each bowl 与 tell 是主谓关系，用 doing 作宾语补足语。",
      "nonp_needs_review": false,
      "facets": {
        "form": "doing"
      }
    },
    {
      "id": "2025浙江首考-56",
      "exam_id": "2025浙江首考",
      "year": 2025,
      "type": "真题",
      "no": 56,
      "answer": "a",
      "explanation": "考查冠词。way 为可数名词单数，此处表示“一种新的穿衣方式”，new 以辅音音素开头，应用 a。",
      "grammar_point": "冠词",
      "category": "article",
      "category_name": "冠词",
      "passage": "The price of fashion — economically and environmentally — has led to the rise of ___56___ new way of dressing, and it's beginning to take off in Australia, too. As people now choose to wear more clothes fewer ___57___ (time), clothing rental services have become increasingly popular.\n\n\"I think it's an amazing idea,\" says Tanya Perilli, who owns a clothing rental shop. \"Customers today look past the fact that something is secondhand and focus instead ___58___ the fact that they have something unique to wear ___59___ are not overstuffing their own wardrobes (衣柜) or contributing to landfill.\"\n\nTanya's shop offers fashion clothes for women ___60___ (rent) rather than purchase them outright, providing a less expensive ___61___ (solve) to one-time event dressing. The concept ___62___ (be) certainly not new — men have been renting good suits for decades — but for female shoppers, it is just taking off. This clothing-as-service model follows the broader societal movement towards shared economies.\n\nTanya is also looking beyond special-occasion dresses to less formal clothing, ___63___ she plans to package as capsule wardrobes and offer to travellers, such as those headed to weddings abroad, with a longer-term rental period. \"I really want to make this work for ___64___ (people) lives today, and I know that doesn't always mean ___65___ (return) a dress on the Monday after a special weekend,\" she says.",
      "fine_category": "art-a-an",
      "facets": {
        "word": "a-an"
      }
    },
    {
      "id": "2025浙江首考-57",
      "exam_id": "2025浙江首考",
      "year": 2025,
      "type": "真题",
      "no": 57,
      "answer": "times",
      "explanation": "考查名词复数。time 表“次数”时为可数名词，前有 fewer 修饰，应用复数形式 times。",
      "grammar_point": "名词复数",
      "category": "number",
      "category_name": "名词/数词",
      "passage": "The price of fashion — economically and environmentally — has led to the rise of ___56___ new way of dressing, and it's beginning to take off in Australia, too. As people now choose to wear more clothes fewer ___57___ (time), clothing rental services have become increasingly popular.\n\n\"I think it's an amazing idea,\" says Tanya Perilli, who owns a clothing rental shop. \"Customers today look past the fact that something is secondhand and focus instead ___58___ the fact that they have something unique to wear ___59___ are not overstuffing their own wardrobes (衣柜) or contributing to landfill.\"\n\nTanya's shop offers fashion clothes for women ___60___ (rent) rather than purchase them outright, providing a less expensive ___61___ (solve) to one-time event dressing. The concept ___62___ (be) certainly not new — men have been renting good suits for decades — but for female shoppers, it is just taking off. This clothing-as-service model follows the broader societal movement towards shared economies.\n\nTanya is also looking beyond special-occasion dresses to less formal clothing, ___63___ she plans to package as capsule wardrobes and offer to travellers, such as those headed to weddings abroad, with a longer-term rental period. \"I really want to make this work for ___64___ (people) lives today, and I know that doesn't always mean ___65___ (return) a dress on the Monday after a special weekend,\" she says.",
      "fine_category": "num-plural",
      "facets": {
        "type": "plural"
      }
    },
    {
      "id": "2025浙江首考-58",
      "exam_id": "2025浙江首考",
      "year": 2025,
      "type": "真题",
      "no": 58,
      "answer": "on",
      "explanation": "考查介词。focus on 为固定搭配，表示“关注”，应用 on。",
      "grammar_point": "介词",
      "category": "preposition",
      "category_name": "介词",
      "passage": "The price of fashion — economically and environmentally — has led to the rise of ___56___ new way of dressing, and it's beginning to take off in Australia, too. As people now choose to wear more clothes fewer ___57___ (time), clothing rental services have become increasingly popular.\n\n\"I think it's an amazing idea,\" says Tanya Perilli, who owns a clothing rental shop. \"Customers today look past the fact that something is secondhand and focus instead ___58___ the fact that they have something unique to wear ___59___ are not overstuffing their own wardrobes (衣柜) or contributing to landfill.\"\n\nTanya's shop offers fashion clothes for women ___60___ (rent) rather than purchase them outright, providing a less expensive ___61___ (solve) to one-time event dressing. The concept ___62___ (be) certainly not new — men have been renting good suits for decades — but for female shoppers, it is just taking off. This clothing-as-service model follows the broader societal movement towards shared economies.\n\nTanya is also looking beyond special-occasion dresses to less formal clothing, ___63___ she plans to package as capsule wardrobes and offer to travellers, such as those headed to weddings abroad, with a longer-term rental period. \"I really want to make this work for ___64___ (people) lives today, and I know that doesn't always mean ___65___ (return) a dress on the Monday after a special weekend,\" she says.",
      "fine_category": "prep-collocation",
      "facets": {
        "word": "on"
      }
    },
    {
      "id": "2025浙江首考-59",
      "exam_id": "2025浙江首考",
      "year": 2025,
      "type": "真题",
      "no": 59,
      "answer": "and",
      "explanation": "考查并列连词。have something unique to wear 与 are not overstuffing... 构成并列关系，应用 and。",
      "grammar_point": "连词",
      "category": "logic",
      "category_name": "逻辑连词",
      "passage": "The price of fashion — economically and environmentally — has led to the rise of ___56___ new way of dressing, and it's beginning to take off in Australia, too. As people now choose to wear more clothes fewer ___57___ (time), clothing rental services have become increasingly popular.\n\n\"I think it's an amazing idea,\" says Tanya Perilli, who owns a clothing rental shop. \"Customers today look past the fact that something is secondhand and focus instead ___58___ the fact that they have something unique to wear ___59___ are not overstuffing their own wardrobes (衣柜) or contributing to landfill.\"\n\nTanya's shop offers fashion clothes for women ___60___ (rent) rather than purchase them outright, providing a less expensive ___61___ (solve) to one-time event dressing. The concept ___62___ (be) certainly not new — men have been renting good suits for decades — but for female shoppers, it is just taking off. This clothing-as-service model follows the broader societal movement towards shared economies.\n\nTanya is also looking beyond special-occasion dresses to less formal clothing, ___63___ she plans to package as capsule wardrobes and offer to travellers, such as those headed to weddings abroad, with a longer-term rental period. \"I really want to make this work for ___64___ (people) lives today, and I know that doesn't always mean ___65___ (return) a dress on the Monday after a special weekend,\" she says.",
      "fine_category": "logic-coordinating",
      "facets": {
        "word": "and",
        "kind": "coordinating"
      }
    },
    {
      "id": "2025浙江首考-60",
      "exam_id": "2025浙江首考",
      "year": 2025,
      "type": "真题",
      "no": 60,
      "answer": "to rent",
      "explanation": "考查非谓语动词。fashion clothes for women to rent 表示“供女性租用的时装”，用不定式作后置定语。",
      "grammar_point": "非谓语动词",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "The price of fashion — economically and environmentally — has led to the rise of ___56___ new way of dressing, and it's beginning to take off in Australia, too. As people now choose to wear more clothes fewer ___57___ (time), clothing rental services have become increasingly popular.\n\n\"I think it's an amazing idea,\" says Tanya Perilli, who owns a clothing rental shop. \"Customers today look past the fact that something is secondhand and focus instead ___58___ the fact that they have something unique to wear ___59___ are not overstuffing their own wardrobes (衣柜) or contributing to landfill.\"\n\nTanya's shop offers fashion clothes for women ___60___ (rent) rather than purchase them outright, providing a less expensive ___61___ (solve) to one-time event dressing. The concept ___62___ (be) certainly not new — men have been renting good suits for decades — but for female shoppers, it is just taking off. This clothing-as-service model follows the broader societal movement towards shared economies.\n\nTanya is also looking beyond special-occasion dresses to less formal clothing, ___63___ she plans to package as capsule wardrobes and offer to travellers, such as those headed to weddings abroad, with a longer-term rental period. \"I really want to make this work for ___64___ (people) lives today, and I know that doesn't always mean ___65___ (return) a dress on the Monday after a special weekend,\" she says.",
      "fine_category": "nonpred-to-do",
      "nonp_function": "attribute",
      "nonp_function_label": "作定语",
      "nonp_form": "to_do",
      "nonp_form_label": "to do",
      "nonp_rule": "clothes for women to rent 中 to rent 作后置定语，说明衣服的用途。",
      "nonp_needs_review": false,
      "facets": {
        "form": "to-do"
      }
    },
    {
      "id": "2025浙江首考-61",
      "exam_id": "2025浙江首考",
      "year": 2025,
      "type": "真题",
      "no": 61,
      "answer": "solution",
      "explanation": "考查名词。空前有形容词 less expensive 修饰，且空格作 providing 的宾语，solve 应变为名词 solution。",
      "grammar_point": "名词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "The price of fashion — economically and environmentally — has led to the rise of ___56___ new way of dressing, and it's beginning to take off in Australia, too. As people now choose to wear more clothes fewer ___57___ (time), clothing rental services have become increasingly popular.\n\n\"I think it's an amazing idea,\" says Tanya Perilli, who owns a clothing rental shop. \"Customers today look past the fact that something is secondhand and focus instead ___58___ the fact that they have something unique to wear ___59___ are not overstuffing their own wardrobes (衣柜) or contributing to landfill.\"\n\nTanya's shop offers fashion clothes for women ___60___ (rent) rather than purchase them outright, providing a less expensive ___61___ (solve) to one-time event dressing. The concept ___62___ (be) certainly not new — men have been renting good suits for decades — but for female shoppers, it is just taking off. This clothing-as-service model follows the broader societal movement towards shared economies.\n\nTanya is also looking beyond special-occasion dresses to less formal clothing, ___63___ she plans to package as capsule wardrobes and offer to travellers, such as those headed to weddings abroad, with a longer-term rental period. \"I really want to make this work for ___64___ (people) lives today, and I know that doesn't always mean ___65___ (return) a dress on the Monday after a special weekend,\" she says.",
      "fine_category": "word-noun",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2025浙江首考-62",
      "exam_id": "2025浙江首考",
      "year": 2025,
      "type": "真题",
      "no": 62,
      "answer": "is",
      "explanation": "考查谓语动词。主语 The concept 为单数，句子陈述一般事实，应用一般现在时 is。",
      "grammar_point": "谓语动词",
      "category": "predicate",
      "category_name": "谓语动词",
      "passage": "The price of fashion — economically and environmentally — has led to the rise of ___56___ new way of dressing, and it's beginning to take off in Australia, too. As people now choose to wear more clothes fewer ___57___ (time), clothing rental services have become increasingly popular.\n\n\"I think it's an amazing idea,\" says Tanya Perilli, who owns a clothing rental shop. \"Customers today look past the fact that something is secondhand and focus instead ___58___ the fact that they have something unique to wear ___59___ are not overstuffing their own wardrobes (衣柜) or contributing to landfill.\"\n\nTanya's shop offers fashion clothes for women ___60___ (rent) rather than purchase them outright, providing a less expensive ___61___ (solve) to one-time event dressing. The concept ___62___ (be) certainly not new — men have been renting good suits for decades — but for female shoppers, it is just taking off. This clothing-as-service model follows the broader societal movement towards shared economies.\n\nTanya is also looking beyond special-occasion dresses to less formal clothing, ___63___ she plans to package as capsule wardrobes and offer to travellers, such as those headed to weddings abroad, with a longer-term rental period. \"I really want to make this work for ___64___ (people) lives today, and I know that doesn't always mean ___65___ (return) a dress on the Monday after a special weekend,\" she says.",
      "fine_category": "pred-tense-present"
    },
    {
      "id": "2025浙江首考-63",
      "exam_id": "2025浙江首考",
      "year": 2025,
      "type": "真题",
      "no": 63,
      "answer": "which",
      "explanation": "考查非限制性定语从句。先行词为 less formal clothing，关系词在从句中作 package 的宾语，应用 which。",
      "grammar_point": "定语从句",
      "category": "attrib",
      "category_name": "定语从句",
      "passage": "The price of fashion — economically and environmentally — has led to the rise of ___56___ new way of dressing, and it's beginning to take off in Australia, too. As people now choose to wear more clothes fewer ___57___ (time), clothing rental services have become increasingly popular.\n\n\"I think it's an amazing idea,\" says Tanya Perilli, who owns a clothing rental shop. \"Customers today look past the fact that something is secondhand and focus instead ___58___ the fact that they have something unique to wear ___59___ are not overstuffing their own wardrobes (衣柜) or contributing to landfill.\"\n\nTanya's shop offers fashion clothes for women ___60___ (rent) rather than purchase them outright, providing a less expensive ___61___ (solve) to one-time event dressing. The concept ___62___ (be) certainly not new — men have been renting good suits for decades — but for female shoppers, it is just taking off. This clothing-as-service model follows the broader societal movement towards shared economies.\n\nTanya is also looking beyond special-occasion dresses to less formal clothing, ___63___ she plans to package as capsule wardrobes and offer to travellers, such as those headed to weddings abroad, with a longer-term rental period. \"I really want to make this work for ___64___ (people) lives today, and I know that doesn't always mean ___65___ (return) a dress on the Monday after a special weekend,\" she says.",
      "fine_category": "attrib-pronoun",
      "facets": {
        "type": "relative-pronoun",
        "word": "which",
        "restrictive": false
      }
    },
    {
      "id": "2025浙江首考-64",
      "exam_id": "2025浙江首考",
      "year": 2025,
      "type": "真题",
      "no": 64,
      "answer": "people's",
      "explanation": "考查名词所有格。空格修饰 lives，表示“人们的生活”，应用 people 的所有格 people's。",
      "grammar_point": "名词所有格",
      "category": "number",
      "category_name": "名词/数词",
      "passage": "The price of fashion — economically and environmentally — has led to the rise of ___56___ new way of dressing, and it's beginning to take off in Australia, too. As people now choose to wear more clothes fewer ___57___ (time), clothing rental services have become increasingly popular.\n\n\"I think it's an amazing idea,\" says Tanya Perilli, who owns a clothing rental shop. \"Customers today look past the fact that something is secondhand and focus instead ___58___ the fact that they have something unique to wear ___59___ are not overstuffing their own wardrobes (衣柜) or contributing to landfill.\"\n\nTanya's shop offers fashion clothes for women ___60___ (rent) rather than purchase them outright, providing a less expensive ___61___ (solve) to one-time event dressing. The concept ___62___ (be) certainly not new — men have been renting good suits for decades — but for female shoppers, it is just taking off. This clothing-as-service model follows the broader societal movement towards shared economies.\n\nTanya is also looking beyond special-occasion dresses to less formal clothing, ___63___ she plans to package as capsule wardrobes and offer to travellers, such as those headed to weddings abroad, with a longer-term rental period. \"I really want to make this work for ___64___ (people) lives today, and I know that doesn't always mean ___65___ (return) a dress on the Monday after a special weekend,\" she says.",
      "fine_category": "num-possessive",
      "facets": {
        "type": "possessive"
      }
    },
    {
      "id": "2025浙江首考-65",
      "exam_id": "2025浙江首考",
      "year": 2025,
      "type": "真题",
      "no": 65,
      "answer": "returning",
      "explanation": "考查非谓语动词。mean 表示“意味着”时后接动名词作宾语，应用 returning。",
      "grammar_point": "非谓语动词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "The price of fashion — economically and environmentally — has led to the rise of ___56___ new way of dressing, and it's beginning to take off in Australia, too. As people now choose to wear more clothes fewer ___57___ (time), clothing rental services have become increasingly popular.\n\n\"I think it's an amazing idea,\" says Tanya Perilli, who owns a clothing rental shop. \"Customers today look past the fact that something is secondhand and focus instead ___58___ the fact that they have something unique to wear ___59___ are not overstuffing their own wardrobes (衣柜) or contributing to landfill.\"\n\nTanya's shop offers fashion clothes for women ___60___ (rent) rather than purchase them outright, providing a less expensive ___61___ (solve) to one-time event dressing. The concept ___62___ (be) certainly not new — men have been renting good suits for decades — but for female shoppers, it is just taking off. This clothing-as-service model follows the broader societal movement towards shared economies.\n\nTanya is also looking beyond special-occasion dresses to less formal clothing, ___63___ she plans to package as capsule wardrobes and offer to travellers, such as those headed to weddings abroad, with a longer-term rental period. \"I really want to make this work for ___64___ (people) lives today, and I know that doesn't always mean ___65___ (return) a dress on the Monday after a special weekend,\" she says.",
      "fine_category": "word-noun",
      "nonp_function": "object",
      "nonp_function_label": "作宾语",
      "nonp_form": "doing",
      "nonp_form_label": "doing",
      "nonp_rule": "mean 表“意味着”时后接 doing，returning 作宾语。",
      "nonp_needs_review": false,
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2025深圳一模-36",
      "exam_id": "2025深圳一模",
      "year": 2025,
      "type": "模拟卷",
      "no": 36,
      "answer": "what",
      "explanation": "考查主语从句。句意：然而，真正引人注目的是领奖台上的一个感人时刻。分析句子可知，句子为主语从句，空格处单词引导从句，从句中缺少主语，指事物，没有选择范围，故应用“what”引导从句。故填what。",
      "grammar_point": "主语从句",
      "category": "nounclause",
      "category_name": "名词性从句",
      "passage": "On August 5, 2024, Chinese badminton player He Bingjiao won a silver medal at the Paris Olympics. However, ___36___ truly stood out was a touching moment on the podium (领奖台). As she received her medal, He Bingjiao held a badge (徽章) ___37___ (feature) the Spanish flag, which aroused widespread curiosity online.\n\nThis gesture was to express respect and care for her semifinal opponent, Spain’s Carolina Marin, who ___38___ (retire) from the match due to injury. He Bingjiao explained, “I brought the Spanish badge because Marin’s suffering broke my heart. I hope she sees this and wish her a speedy ___39___ (recover).”\n\nDuring their semifinal match, Marin performed well but ___40___ (force) to stop after getting injured. He Bingjiao immediately reached out, offering support and checking on Marin, who was ___41___ (visible) upset.\n\nThe act rapidly made headlines around the world. The International Olympic Committee praised He Bingjiao ___42___ showing the Olympic values of respect and friendship. Spanish media also highlighted the ___43___ (emotion) moment, with many fans applauding her sportsmanship. Pau Gasol, the legendary Spanish basketball player, called it ___44___ beautiful display of Olympic spirit.\n\nHe Bingjiao’s action not only demonstrated her respect for her opponent but also reflected the true spirit of the Olympics — competition, ___45___ (pair) with unity and mutual (相互的) respect.",
      "fine_category": "nounc-wh-pronoun",
      "facets": {
        "type": "wh-pronoun",
        "word": "what"
      }
    },
    {
      "id": "2025深圳一模-37",
      "exam_id": "2025深圳一模",
      "year": 2025,
      "type": "模拟卷",
      "no": 37,
      "answer": "featuring",
      "explanation": "考查非谓语动词。句意：何冰娇在领奖时，手持西班牙国旗徽章，在网上引起了广泛的好奇。分析句子可知，句中有谓语动词“held”，故空格处应用非谓语动词，“badge”和“feature”为逻辑上的主谓关系，故应用“feature”的现在分词“featuring”作后置定语。故填featuring。",
      "grammar_point": "非谓语动词",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "On August 5, 2024, Chinese badminton player He Bingjiao won a silver medal at the Paris Olympics. However, ___36___ truly stood out was a touching moment on the podium (领奖台). As she received her medal, He Bingjiao held a badge (徽章) ___37___ (feature) the Spanish flag, which aroused widespread curiosity online.\n\nThis gesture was to express respect and care for her semifinal opponent, Spain’s Carolina Marin, who ___38___ (retire) from the match due to injury. He Bingjiao explained, “I brought the Spanish badge because Marin’s suffering broke my heart. I hope she sees this and wish her a speedy ___39___ (recover).”\n\nDuring their semifinal match, Marin performed well but ___40___ (force) to stop after getting injured. He Bingjiao immediately reached out, offering support and checking on Marin, who was ___41___ (visible) upset.\n\nThe act rapidly made headlines around the world. The International Olympic Committee praised He Bingjiao ___42___ showing the Olympic values of respect and friendship. Spanish media also highlighted the ___43___ (emotion) moment, with many fans applauding her sportsmanship. Pau Gasol, the legendary Spanish basketball player, called it ___44___ beautiful display of Olympic spirit.\n\nHe Bingjiao’s action not only demonstrated her respect for her opponent but also reflected the true spirit of the Olympics — competition, ___45___ (pair) with unity and mutual (相互的) respect.",
      "fine_category": "nonpred-doing",
      "nonp_function": "attribute",
      "nonp_function_label": "作定语",
      "nonp_form": "doing",
      "nonp_form_label": "doing",
      "nonp_rule": "featuring 修饰 badge，badge 与 feature 是主谓关系，用 doing 作后置定语。",
      "nonp_needs_review": false,
      "facets": {
        "form": "doing"
      }
    },
    {
      "id": "2025深圳一模-38",
      "exam_id": "2025深圳一模",
      "year": 2025,
      "type": "模拟卷",
      "no": 38,
      "answer": "retired",
      "explanation": "考查时态。句意：这一姿态是为了表达对她的半决赛对手、西班牙选手卡罗琳娜·马林的尊重和关心，马林因伤退出了比赛。根据句意和句中“was”可知，句子应用一般过去时，表示过去发生的事，故空格处应用“retire”的过去式“retired”；当强调“退出比赛”的动作发生在“表达尊重和关心”之前时，即过去的过去，可用过去完成时，空格处应用“had retired”。故填retired/had retired。",
      "grammar_point": "时态",
      "category": "predicate",
      "category_name": "谓语动词",
      "passage": "On August 5, 2024, Chinese badminton player He Bingjiao won a silver medal at the Paris Olympics. However, ___36___ truly stood out was a touching moment on the podium (领奖台). As she received her medal, He Bingjiao held a badge (徽章) ___37___ (feature) the Spanish flag, which aroused widespread curiosity online.\n\nThis gesture was to express respect and care for her semifinal opponent, Spain’s Carolina Marin, who ___38___ (retire) from the match due to injury. He Bingjiao explained, “I brought the Spanish badge because Marin’s suffering broke my heart. I hope she sees this and wish her a speedy ___39___ (recover).”\n\nDuring their semifinal match, Marin performed well but ___40___ (force) to stop after getting injured. He Bingjiao immediately reached out, offering support and checking on Marin, who was ___41___ (visible) upset.\n\nThe act rapidly made headlines around the world. The International Olympic Committee praised He Bingjiao ___42___ showing the Olympic values of respect and friendship. Spanish media also highlighted the ___43___ (emotion) moment, with many fans applauding her sportsmanship. Pau Gasol, the legendary Spanish basketball player, called it ___44___ beautiful display of Olympic spirit.\n\nHe Bingjiao’s action not only demonstrated her respect for her opponent but also reflected the true spirit of the Olympics — competition, ___45___ (pair) with unity and mutual (相互的) respect.",
      "fine_category": "pred-tense-past-future"
    },
    {
      "id": "2025深圳一模-39",
      "exam_id": "2025深圳一模",
      "year": 2025,
      "type": "模拟卷",
      "no": 39,
      "answer": "recovery",
      "explanation": "考查名词。句意：何冰娇解释说：“我带来西班牙徽章是因为马林的痛苦让我伤心。我希望她能看到这一刻，并祝愿她早日康复。”分析句子可知，“speedy”为形容词，空格处应用名词，作直接宾语，“recovery”意为“康复”，为可数名词，“a”后接可数名词单数。故填recovery。",
      "grammar_point": "名词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "On August 5, 2024, Chinese badminton player He Bingjiao won a silver medal at the Paris Olympics. However, ___36___ truly stood out was a touching moment on the podium (领奖台). As she received her medal, He Bingjiao held a badge (徽章) ___37___ (feature) the Spanish flag, which aroused widespread curiosity online.\n\nThis gesture was to express respect and care for her semifinal opponent, Spain’s Carolina Marin, who ___38___ (retire) from the match due to injury. He Bingjiao explained, “I brought the Spanish badge because Marin’s suffering broke my heart. I hope she sees this and wish her a speedy ___39___ (recover).”\n\nDuring their semifinal match, Marin performed well but ___40___ (force) to stop after getting injured. He Bingjiao immediately reached out, offering support and checking on Marin, who was ___41___ (visible) upset.\n\nThe act rapidly made headlines around the world. The International Olympic Committee praised He Bingjiao ___42___ showing the Olympic values of respect and friendship. Spanish media also highlighted the ___43___ (emotion) moment, with many fans applauding her sportsmanship. Pau Gasol, the legendary Spanish basketball player, called it ___44___ beautiful display of Olympic spirit.\n\nHe Bingjiao’s action not only demonstrated her respect for her opponent but also reflected the true spirit of the Olympics — competition, ___45___ (pair) with unity and mutual (相互的) respect.",
      "fine_category": "word-noun",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2025深圳一模-40",
      "exam_id": "2025深圳一模",
      "year": 2025,
      "type": "模拟卷",
      "no": 40,
      "answer": "was forced",
      "explanation": "考查时态和语态。句意：在半决赛中，马林表现不错，但受伤后被迫停赛。根据句意和句中“performed”可知，句子陈述的是过去发生的事，“Marin”和“force”为被动关系，故句子应用一般过去时的被动语态，“Marin”和“was”连用，“force”的过去分词为“forced”，故空格处应填“was forced”。故填was forced。",
      "grammar_point": "时态和语态",
      "category": "predicate",
      "category_name": "谓语动词",
      "passage": "On August 5, 2024, Chinese badminton player He Bingjiao won a silver medal at the Paris Olympics. However, ___36___ truly stood out was a touching moment on the podium (领奖台). As she received her medal, He Bingjiao held a badge (徽章) ___37___ (feature) the Spanish flag, which aroused widespread curiosity online.\n\nThis gesture was to express respect and care for her semifinal opponent, Spain’s Carolina Marin, who ___38___ (retire) from the match due to injury. He Bingjiao explained, “I brought the Spanish badge because Marin’s suffering broke my heart. I hope she sees this and wish her a speedy ___39___ (recover).”\n\nDuring their semifinal match, Marin performed well but ___40___ (force) to stop after getting injured. He Bingjiao immediately reached out, offering support and checking on Marin, who was ___41___ (visible) upset.\n\nThe act rapidly made headlines around the world. The International Olympic Committee praised He Bingjiao ___42___ showing the Olympic values of respect and friendship. Spanish media also highlighted the ___43___ (emotion) moment, with many fans applauding her sportsmanship. Pau Gasol, the legendary Spanish basketball player, called it ___44___ beautiful display of Olympic spirit.\n\nHe Bingjiao’s action not only demonstrated her respect for her opponent but also reflected the true spirit of the Olympics — competition, ___45___ (pair) with unity and mutual (相互的) respect.",
      "fine_category": "pred-passive-form"
    },
    {
      "id": "2025深圳一模-41",
      "exam_id": "2025深圳一模",
      "year": 2025,
      "type": "模拟卷",
      "no": 41,
      "answer": "visibly",
      "explanation": "考查副词。句意：何冰娇立刻伸出手来，表示支持并查看马林的情况，马林显然很沮丧。分析句子可知，“upset”为形容词，空格处应用副词，作状语，“visibly”意为“明显地”，副词词性。故填visibly。",
      "grammar_point": "副词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "On August 5, 2024, Chinese badminton player He Bingjiao won a silver medal at the Paris Olympics. However, ___36___ truly stood out was a touching moment on the podium (领奖台). As she received her medal, He Bingjiao held a badge (徽章) ___37___ (feature) the Spanish flag, which aroused widespread curiosity online.\n\nThis gesture was to express respect and care for her semifinal opponent, Spain’s Carolina Marin, who ___38___ (retire) from the match due to injury. He Bingjiao explained, “I brought the Spanish badge because Marin’s suffering broke my heart. I hope she sees this and wish her a speedy ___39___ (recover).”\n\nDuring their semifinal match, Marin performed well but ___40___ (force) to stop after getting injured. He Bingjiao immediately reached out, offering support and checking on Marin, who was ___41___ (visible) upset.\n\nThe act rapidly made headlines around the world. The International Olympic Committee praised He Bingjiao ___42___ showing the Olympic values of respect and friendship. Spanish media also highlighted the ___43___ (emotion) moment, with many fans applauding her sportsmanship. Pau Gasol, the legendary Spanish basketball player, called it ___44___ beautiful display of Olympic spirit.\n\nHe Bingjiao’s action not only demonstrated her respect for her opponent but also reflected the true spirit of the Olympics — competition, ___45___ (pair) with unity and mutual (相互的) respect.",
      "fine_category": "word-adv",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2025深圳一模-42",
      "exam_id": "2025深圳一模",
      "year": 2025,
      "type": "模拟卷",
      "no": 42,
      "answer": "for",
      "explanation": "考查固定短语。句意：国际奥委会赞扬何冰娇体现了尊重和友谊的奥林匹克价值观。分析句子可知，句中涉及固定短语“praise sb. for doing sth.”，意为“因为做某事而赞扬某人”，故空格处应用介词“for”。故填for。",
      "grammar_point": "固定短语",
      "category": "preposition",
      "category_name": "介词",
      "passage": "On August 5, 2024, Chinese badminton player He Bingjiao won a silver medal at the Paris Olympics. However, ___36___ truly stood out was a touching moment on the podium (领奖台). As she received her medal, He Bingjiao held a badge (徽章) ___37___ (feature) the Spanish flag, which aroused widespread curiosity online.\n\nThis gesture was to express respect and care for her semifinal opponent, Spain’s Carolina Marin, who ___38___ (retire) from the match due to injury. He Bingjiao explained, “I brought the Spanish badge because Marin’s suffering broke my heart. I hope she sees this and wish her a speedy ___39___ (recover).”\n\nDuring their semifinal match, Marin performed well but ___40___ (force) to stop after getting injured. He Bingjiao immediately reached out, offering support and checking on Marin, who was ___41___ (visible) upset.\n\nThe act rapidly made headlines around the world. The International Olympic Committee praised He Bingjiao ___42___ showing the Olympic values of respect and friendship. Spanish media also highlighted the ___43___ (emotion) moment, with many fans applauding her sportsmanship. Pau Gasol, the legendary Spanish basketball player, called it ___44___ beautiful display of Olympic spirit.\n\nHe Bingjiao’s action not only demonstrated her respect for her opponent but also reflected the true spirit of the Olympics — competition, ___45___ (pair) with unity and mutual (相互的) respect.",
      "fine_category": "prep-collocation",
      "facets": {
        "word": "for"
      }
    },
    {
      "id": "2025深圳一模-43",
      "exam_id": "2025深圳一模",
      "year": 2025,
      "type": "模拟卷",
      "no": 43,
      "answer": "emotional",
      "explanation": "考查形容词。句意：西班牙媒体也强调了这一激动人心的时刻，许多球迷称赞她的体育精神。分析句子可知，“moment”为名词，空格处应用形容词，作定语，“emotional”意为“激动人心的”，形容词词性。故填emotional。",
      "grammar_point": "形容词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "On August 5, 2024, Chinese badminton player He Bingjiao won a silver medal at the Paris Olympics. However, ___36___ truly stood out was a touching moment on the podium (领奖台). As she received her medal, He Bingjiao held a badge (徽章) ___37___ (feature) the Spanish flag, which aroused widespread curiosity online.\n\nThis gesture was to express respect and care for her semifinal opponent, Spain’s Carolina Marin, who ___38___ (retire) from the match due to injury. He Bingjiao explained, “I brought the Spanish badge because Marin’s suffering broke my heart. I hope she sees this and wish her a speedy ___39___ (recover).”\n\nDuring their semifinal match, Marin performed well but ___40___ (force) to stop after getting injured. He Bingjiao immediately reached out, offering support and checking on Marin, who was ___41___ (visible) upset.\n\nThe act rapidly made headlines around the world. The International Olympic Committee praised He Bingjiao ___42___ showing the Olympic values of respect and friendship. Spanish media also highlighted the ___43___ (emotion) moment, with many fans applauding her sportsmanship. Pau Gasol, the legendary Spanish basketball player, called it ___44___ beautiful display of Olympic spirit.\n\nHe Bingjiao’s action not only demonstrated her respect for her opponent but also reflected the true spirit of the Olympics — competition, ___45___ (pair) with unity and mutual (相互的) respect.",
      "fine_category": "word-adj",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2025深圳一模-44",
      "exam_id": "2025深圳一模",
      "year": 2025,
      "type": "模拟卷",
      "no": 44,
      "answer": "a",
      "explanation": "考查冠词。句意：西班牙传奇篮球运动员保罗·加索尔称之为奥林匹克精神的一次美丽展示。分析句子可知，句中泛指一次美丽展示，故空格处应用不定冠词，表示泛指，“beautiful”音标的第一个音素为辅音音素，故应用不定冠词“a”。故填a。",
      "grammar_point": "冠词",
      "category": "article",
      "category_name": "冠词",
      "passage": "On August 5, 2024, Chinese badminton player He Bingjiao won a silver medal at the Paris Olympics. However, ___36___ truly stood out was a touching moment on the podium (领奖台). As she received her medal, He Bingjiao held a badge (徽章) ___37___ (feature) the Spanish flag, which aroused widespread curiosity online.\n\nThis gesture was to express respect and care for her semifinal opponent, Spain’s Carolina Marin, who ___38___ (retire) from the match due to injury. He Bingjiao explained, “I brought the Spanish badge because Marin’s suffering broke my heart. I hope she sees this and wish her a speedy ___39___ (recover).”\n\nDuring their semifinal match, Marin performed well but ___40___ (force) to stop after getting injured. He Bingjiao immediately reached out, offering support and checking on Marin, who was ___41___ (visible) upset.\n\nThe act rapidly made headlines around the world. The International Olympic Committee praised He Bingjiao ___42___ showing the Olympic values of respect and friendship. Spanish media also highlighted the ___43___ (emotion) moment, with many fans applauding her sportsmanship. Pau Gasol, the legendary Spanish basketball player, called it ___44___ beautiful display of Olympic spirit.\n\nHe Bingjiao’s action not only demonstrated her respect for her opponent but also reflected the true spirit of the Olympics — competition, ___45___ (pair) with unity and mutual (相互的) respect.",
      "fine_category": "art-a-an",
      "facets": {
        "word": "a-an"
      }
    },
    {
      "id": "2025深圳一模-45",
      "exam_id": "2025深圳一模",
      "year": 2025,
      "type": "模拟卷",
      "no": 45,
      "answer": "paired",
      "explanation": "考查非谓语动词。句意：何冰娇的行为不仅体现了她对对手的尊重，也反映了奥运会的真正精神——竞争，团结，相互尊重。分析句子可知，句中有谓语动词“reflected”，故空格处应用非谓语动词，“competition”和“pair”为逻辑上的动宾关系，故应用“pair”的过去分词“paired”。故填paired。",
      "grammar_point": "非谓语动词",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "On August 5, 2024, Chinese badminton player He Bingjiao won a silver medal at the Paris Olympics. However, ___36___ truly stood out was a touching moment on the podium (领奖台). As she received her medal, He Bingjiao held a badge (徽章) ___37___ (feature) the Spanish flag, which aroused widespread curiosity online.\n\nThis gesture was to express respect and care for her semifinal opponent, Spain’s Carolina Marin, who ___38___ (retire) from the match due to injury. He Bingjiao explained, “I brought the Spanish badge because Marin’s suffering broke my heart. I hope she sees this and wish her a speedy ___39___ (recover).”\n\nDuring their semifinal match, Marin performed well but ___40___ (force) to stop after getting injured. He Bingjiao immediately reached out, offering support and checking on Marin, who was ___41___ (visible) upset.\n\nThe act rapidly made headlines around the world. The International Olympic Committee praised He Bingjiao ___42___ showing the Olympic values of respect and friendship. Spanish media also highlighted the ___43___ (emotion) moment, with many fans applauding her sportsmanship. Pau Gasol, the legendary Spanish basketball player, called it ___44___ beautiful display of Olympic spirit.\n\nHe Bingjiao’s action not only demonstrated her respect for her opponent but also reflected the true spirit of the Olympics — competition, ___45___ (pair) with unity and mutual (相互的) respect.",
      "fine_category": "nonpred-done",
      "nonp_function": "attribute",
      "nonp_function_label": "作定语",
      "nonp_form": "done",
      "nonp_form_label": "done",
      "nonp_rule": "paired 修饰 competition, unity, and mutual respect，与 pair 是动宾关系，用 done 作后置定语。",
      "nonp_needs_review": false,
      "facets": {
        "form": "done"
      }
    },
    {
      "id": "2025深圳二模-36",
      "exam_id": "2025深圳二模",
      "year": 2025,
      "type": "模拟题",
      "no": 36,
      "answer": "a",
      "explanation": "不定冠词，表示“一段36天的旅程”，且36-day以辅音音素开头。故填a。",
      "grammar_point": "冠词",
      "category": "article",
      "category_name": "冠词",
      "passage": "For many, cycling to Lhasa is a romantic dream. But for Li Shuangsheng and his son, Li Xuyao, it was ___36___ 36-day, 2298-kilometer journey of growth --- crossing 14 mountains over 4,000 meters and ___37___ (battle) altitude (海拔) sickness. This was the father's special gift to his son's 16th birthday.\n\nSetting off ___38___ Chongqing, they rode in a “father in front, son behind” formation, determined to bike up one mountain each day. One day, they so ___39___ (catch) in a heavy rainstorm on Kazila Mountain's slopes (山坡). Li Shuangsheng led the way downhill and stopped by the roadside to wait for his son. Ten minutes later, Li Xuyao appeared, ___40___ (cover) in mud. His bike, ___41___ chain had slipped off, caused him to lose balance and fall to the ground.\n\nDuring the day, the mountain roads, burning sun, and rainstorms exhausted the father and the son. At night, they either sheltered with Tibetan families ___42___ camped alone. Several times, the father jokingly suggested giving up, but Li Xuyao always replied ___43___ (firm), “No way. I'll do whatever it takes to get there.”\n\nAfter wearing down six sets of brake pads (刹车片), they finally arrived in Lhasa. For Li Xuyao's mother, it was a moment of ___44___ (relieve) and pride. “I prayed for their safe return every night,” she said. “My son has grown into a ___45___ (tough) and more mature young man.”",
      "fine_category": "art-a-an",
      "facets": {
        "word": "a-an"
      }
    },
    {
      "id": "2025深圳二模-37",
      "exam_id": "2025深圳二模",
      "year": 2025,
      "type": "模拟题",
      "no": 37,
      "answer": "battling",
      "explanation": "与crossing并列，作伴随状语，表示“与高原反应作斗争”。故填battling。",
      "grammar_point": "",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "For many, cycling to Lhasa is a romantic dream. But for Li Shuangsheng and his son, Li Xuyao, it was ___36___ 36-day, 2298-kilometer journey of growth --- crossing 14 mountains over 4,000 meters and ___37___ (battle) altitude (海拔) sickness. This was the father's special gift to his son's 16th birthday.\n\nSetting off ___38___ Chongqing, they rode in a “father in front, son behind” formation, determined to bike up one mountain each day. One day, they so ___39___ (catch) in a heavy rainstorm on Kazila Mountain's slopes (山坡). Li Shuangsheng led the way downhill and stopped by the roadside to wait for his son. Ten minutes later, Li Xuyao appeared, ___40___ (cover) in mud. His bike, ___41___ chain had slipped off, caused him to lose balance and fall to the ground.\n\nDuring the day, the mountain roads, burning sun, and rainstorms exhausted the father and the son. At night, they either sheltered with Tibetan families ___42___ camped alone. Several times, the father jokingly suggested giving up, but Li Xuyao always replied ___43___ (firm), “No way. I'll do whatever it takes to get there.”\n\nAfter wearing down six sets of brake pads (刹车片), they finally arrived in Lhasa. For Li Xuyao's mother, it was a moment of ___44___ (relieve) and pride. “I prayed for their safe return every night,” she said. “My son has grown into a ___45___ (tough) and more mature young man.”",
      "fine_category": "nonpred-doing",
      "nonp_function": "adverbial",
      "nonp_function_label": "作状语",
      "nonp_form": "doing",
      "nonp_form_label": "doing",
      "nonp_rule": "battling 与 crossing 并列，主语与 battle 是主谓关系，用 doing 作伴随状语。",
      "nonp_needs_review": false,
      "facets": {
        "form": "doing"
      }
    },
    {
      "id": "2025深圳二模-38",
      "exam_id": "2025深圳二模",
      "year": 2025,
      "type": "模拟题",
      "no": 38,
      "answer": "from",
      "explanation": "set off from... 从……出发。故填from。",
      "grammar_point": "",
      "category": "preposition",
      "category_name": "介词",
      "passage": "For many, cycling to Lhasa is a romantic dream. But for Li Shuangsheng and his son, Li Xuyao, it was ___36___ 36-day, 2298-kilometer journey of growth --- crossing 14 mountains over 4,000 meters and ___37___ (battle) altitude (海拔) sickness. This was the father's special gift to his son's 16th birthday.\n\nSetting off ___38___ Chongqing, they rode in a “father in front, son behind” formation, determined to bike up one mountain each day. One day, they so ___39___ (catch) in a heavy rainstorm on Kazila Mountain's slopes (山坡). Li Shuangsheng led the way downhill and stopped by the roadside to wait for his son. Ten minutes later, Li Xuyao appeared, ___40___ (cover) in mud. His bike, ___41___ chain had slipped off, caused him to lose balance and fall to the ground.\n\nDuring the day, the mountain roads, burning sun, and rainstorms exhausted the father and the son. At night, they either sheltered with Tibetan families ___42___ camped alone. Several times, the father jokingly suggested giving up, but Li Xuyao always replied ___43___ (firm), “No way. I'll do whatever it takes to get there.”\n\nAfter wearing down six sets of brake pads (刹车片), they finally arrived in Lhasa. For Li Xuyao's mother, it was a moment of ___44___ (relieve) and pride. “I prayed for their safe return every night,” she said. “My son has grown into a ___45___ (tough) and more mature young man.”",
      "fine_category": "prep-collocation",
      "facets": {
        "word": "from"
      }
    },
    {
      "id": "2025深圳二模-39",
      "exam_id": "2025深圳二模",
      "year": 2025,
      "type": "模拟题",
      "no": 39,
      "answer": "were caught",
      "explanation": "描述过去事件，主语they与catch构成被动关系，用一般过去时被动语态。故填were caught。",
      "grammar_point": "",
      "category": "predicate",
      "category_name": "谓语动词",
      "passage": "For many, cycling to Lhasa is a romantic dream. But for Li Shuangsheng and his son, Li Xuyao, it was ___36___ 36-day, 2298-kilometer journey of growth --- crossing 14 mountains over 4,000 meters and ___37___ (battle) altitude (海拔) sickness. This was the father's special gift to his son's 16th birthday.\n\nSetting off ___38___ Chongqing, they rode in a “father in front, son behind” formation, determined to bike up one mountain each day. One day, they so ___39___ (catch) in a heavy rainstorm on Kazila Mountain's slopes (山坡). Li Shuangsheng led the way downhill and stopped by the roadside to wait for his son. Ten minutes later, Li Xuyao appeared, ___40___ (cover) in mud. His bike, ___41___ chain had slipped off, caused him to lose balance and fall to the ground.\n\nDuring the day, the mountain roads, burning sun, and rainstorms exhausted the father and the son. At night, they either sheltered with Tibetan families ___42___ camped alone. Several times, the father jokingly suggested giving up, but Li Xuyao always replied ___43___ (firm), “No way. I'll do whatever it takes to get there.”\n\nAfter wearing down six sets of brake pads (刹车片), they finally arrived in Lhasa. For Li Xuyao's mother, it was a moment of ___44___ (relieve) and pride. “I prayed for their safe return every night,” she said. “My son has grown into a ___45___ (tough) and more mature young man.”",
      "fine_category": "pred-passive-form"
    },
    {
      "id": "2025深圳二模-40",
      "exam_id": "2025深圳二模",
      "year": 2025,
      "type": "模拟题",
      "no": 40,
      "answer": "covered",
      "explanation": "Li Xuyao与cover构成被动关系，用过去分词作状语。故填covered。",
      "grammar_point": "",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "For many, cycling to Lhasa is a romantic dream. But for Li Shuangsheng and his son, Li Xuyao, it was ___36___ 36-day, 2298-kilometer journey of growth --- crossing 14 mountains over 4,000 meters and ___37___ (battle) altitude (海拔) sickness. This was the father's special gift to his son's 16th birthday.\n\nSetting off ___38___ Chongqing, they rode in a “father in front, son behind” formation, determined to bike up one mountain each day. One day, they so ___39___ (catch) in a heavy rainstorm on Kazila Mountain's slopes (山坡). Li Shuangsheng led the way downhill and stopped by the roadside to wait for his son. Ten minutes later, Li Xuyao appeared, ___40___ (cover) in mud. His bike, ___41___ chain had slipped off, caused him to lose balance and fall to the ground.\n\nDuring the day, the mountain roads, burning sun, and rainstorms exhausted the father and the son. At night, they either sheltered with Tibetan families ___42___ camped alone. Several times, the father jokingly suggested giving up, but Li Xuyao always replied ___43___ (firm), “No way. I'll do whatever it takes to get there.”\n\nAfter wearing down six sets of brake pads (刹车片), they finally arrived in Lhasa. For Li Xuyao's mother, it was a moment of ___44___ (relieve) and pride. “I prayed for their safe return every night,” she said. “My son has grown into a ___45___ (tough) and more mature young man.”",
      "fine_category": "nonpred-done",
      "nonp_function": "adverbial",
      "nonp_function_label": "作状语",
      "nonp_form": "done",
      "nonp_form_label": "done",
      "nonp_rule": "Li Xuyao 与 cover 是动宾关系，用 done 作状语，表示被积雪覆盖的状态。",
      "nonp_needs_review": false,
      "facets": {
        "form": "done"
      }
    },
    {
      "id": "2025深圳二模-41",
      "exam_id": "2025深圳二模",
      "year": 2025,
      "type": "模拟题",
      "no": 41,
      "answer": "whose",
      "explanation": "引导非限制性定语从句，修饰先行词his bike，在从句中作定语。故填whose。",
      "grammar_point": "定语从句",
      "category": "attrib",
      "category_name": "定语从句",
      "passage": "For many, cycling to Lhasa is a romantic dream. But for Li Shuangsheng and his son, Li Xuyao, it was ___36___ 36-day, 2298-kilometer journey of growth --- crossing 14 mountains over 4,000 meters and ___37___ (battle) altitude (海拔) sickness. This was the father's special gift to his son's 16th birthday.\n\nSetting off ___38___ Chongqing, they rode in a “father in front, son behind” formation, determined to bike up one mountain each day. One day, they so ___39___ (catch) in a heavy rainstorm on Kazila Mountain's slopes (山坡). Li Shuangsheng led the way downhill and stopped by the roadside to wait for his son. Ten minutes later, Li Xuyao appeared, ___40___ (cover) in mud. His bike, ___41___ chain had slipped off, caused him to lose balance and fall to the ground.\n\nDuring the day, the mountain roads, burning sun, and rainstorms exhausted the father and the son. At night, they either sheltered with Tibetan families ___42___ camped alone. Several times, the father jokingly suggested giving up, but Li Xuyao always replied ___43___ (firm), “No way. I'll do whatever it takes to get there.”\n\nAfter wearing down six sets of brake pads (刹车片), they finally arrived in Lhasa. For Li Xuyao's mother, it was a moment of ___44___ (relieve) and pride. “I prayed for their safe return every night,” she said. “My son has grown into a ___45___ (tough) and more mature young man.”",
      "fine_category": "attrib-pronoun",
      "facets": {
        "type": "relative-pronoun",
        "word": "whose",
        "restrictive": false
      }
    },
    {
      "id": "2025深圳二模-42",
      "exam_id": "2025深圳二模",
      "year": 2025,
      "type": "模拟题",
      "no": 42,
      "answer": "or",
      "explanation": "either...or... 要么……要么……。故填or。",
      "grammar_point": "",
      "category": "logic",
      "category_name": "逻辑连词",
      "passage": "For many, cycling to Lhasa is a romantic dream. But for Li Shuangsheng and his son, Li Xuyao, it was ___36___ 36-day, 2298-kilometer journey of growth --- crossing 14 mountains over 4,000 meters and ___37___ (battle) altitude (海拔) sickness. This was the father's special gift to his son's 16th birthday.\n\nSetting off ___38___ Chongqing, they rode in a “father in front, son behind” formation, determined to bike up one mountain each day. One day, they so ___39___ (catch) in a heavy rainstorm on Kazila Mountain's slopes (山坡). Li Shuangsheng led the way downhill and stopped by the roadside to wait for his son. Ten minutes later, Li Xuyao appeared, ___40___ (cover) in mud. His bike, ___41___ chain had slipped off, caused him to lose balance and fall to the ground.\n\nDuring the day, the mountain roads, burning sun, and rainstorms exhausted the father and the son. At night, they either sheltered with Tibetan families ___42___ camped alone. Several times, the father jokingly suggested giving up, but Li Xuyao always replied ___43___ (firm), “No way. I'll do whatever it takes to get there.”\n\nAfter wearing down six sets of brake pads (刹车片), they finally arrived in Lhasa. For Li Xuyao's mother, it was a moment of ___44___ (relieve) and pride. “I prayed for their safe return every night,” she said. “My son has grown into a ___45___ (tough) and more mature young man.”",
      "fine_category": "logic-coordinating",
      "facets": {
        "word": "or",
        "kind": "correlative"
      }
    },
    {
      "id": "2025深圳二模-43",
      "exam_id": "2025深圳二模",
      "year": 2025,
      "type": "模拟题",
      "no": 43,
      "answer": "firmly",
      "explanation": "修饰动词replied，用副词。故填firmly。",
      "grammar_point": "副词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "For many, cycling to Lhasa is a romantic dream. But for Li Shuangsheng and his son, Li Xuyao, it was ___36___ 36-day, 2298-kilometer journey of growth --- crossing 14 mountains over 4,000 meters and ___37___ (battle) altitude (海拔) sickness. This was the father's special gift to his son's 16th birthday.\n\nSetting off ___38___ Chongqing, they rode in a “father in front, son behind” formation, determined to bike up one mountain each day. One day, they so ___39___ (catch) in a heavy rainstorm on Kazila Mountain's slopes (山坡). Li Shuangsheng led the way downhill and stopped by the roadside to wait for his son. Ten minutes later, Li Xuyao appeared, ___40___ (cover) in mud. His bike, ___41___ chain had slipped off, caused him to lose balance and fall to the ground.\n\nDuring the day, the mountain roads, burning sun, and rainstorms exhausted the father and the son. At night, they either sheltered with Tibetan families ___42___ camped alone. Several times, the father jokingly suggested giving up, but Li Xuyao always replied ___43___ (firm), “No way. I'll do whatever it takes to get there.”\n\nAfter wearing down six sets of brake pads (刹车片), they finally arrived in Lhasa. For Li Xuyao's mother, it was a moment of ___44___ (relieve) and pride. “I prayed for their safe return every night,” she said. “My son has grown into a ___45___ (tough) and more mature young man.”",
      "fine_category": "word-adv",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2025深圳二模-44",
      "exam_id": "2025深圳二模",
      "year": 2025,
      "type": "模拟题",
      "no": 44,
      "answer": "relief",
      "explanation": "介词of后接名词，a moment of relief 意为“一个如释重负的时刻”。故填relief。",
      "grammar_point": "名词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "For many, cycling to Lhasa is a romantic dream. But for Li Shuangsheng and his son, Li Xuyao, it was ___36___ 36-day, 2298-kilometer journey of growth --- crossing 14 mountains over 4,000 meters and ___37___ (battle) altitude (海拔) sickness. This was the father's special gift to his son's 16th birthday.\n\nSetting off ___38___ Chongqing, they rode in a “father in front, son behind” formation, determined to bike up one mountain each day. One day, they so ___39___ (catch) in a heavy rainstorm on Kazila Mountain's slopes (山坡). Li Shuangsheng led the way downhill and stopped by the roadside to wait for his son. Ten minutes later, Li Xuyao appeared, ___40___ (cover) in mud. His bike, ___41___ chain had slipped off, caused him to lose balance and fall to the ground.\n\nDuring the day, the mountain roads, burning sun, and rainstorms exhausted the father and the son. At night, they either sheltered with Tibetan families ___42___ camped alone. Several times, the father jokingly suggested giving up, but Li Xuyao always replied ___43___ (firm), “No way. I'll do whatever it takes to get there.”\n\nAfter wearing down six sets of brake pads (刹车片), they finally arrived in Lhasa. For Li Xuyao's mother, it was a moment of ___44___ (relieve) and pride. “I prayed for their safe return every night,” she said. “My son has grown into a ___45___ (tough) and more mature young man.”",
      "fine_category": "word-noun",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2025深圳二模-45",
      "exam_id": "2025深圳二模",
      "year": 2025,
      "type": "模拟题",
      "no": 45,
      "answer": "tougher",
      "explanation": "与more mature并列，用比较级。故填tougher。",
      "grammar_point": "比较级",
      "category": "word",
      "category_name": "词性转换",
      "passage": "For many, cycling to Lhasa is a romantic dream. But for Li Shuangsheng and his son, Li Xuyao, it was ___36___ 36-day, 2298-kilometer journey of growth --- crossing 14 mountains over 4,000 meters and ___37___ (battle) altitude (海拔) sickness. This was the father's special gift to his son's 16th birthday.\n\nSetting off ___38___ Chongqing, they rode in a “father in front, son behind” formation, determined to bike up one mountain each day. One day, they so ___39___ (catch) in a heavy rainstorm on Kazila Mountain's slopes (山坡). Li Shuangsheng led the way downhill and stopped by the roadside to wait for his son. Ten minutes later, Li Xuyao appeared, ___40___ (cover) in mud. His bike, ___41___ chain had slipped off, caused him to lose balance and fall to the ground.\n\nDuring the day, the mountain roads, burning sun, and rainstorms exhausted the father and the son. At night, they either sheltered with Tibetan families ___42___ camped alone. Several times, the father jokingly suggested giving up, but Li Xuyao always replied ___43___ (firm), “No way. I'll do whatever it takes to get there.”\n\nAfter wearing down six sets of brake pads (刹车片), they finally arrived in Lhasa. For Li Xuyao's mother, it was a moment of ___44___ (relieve) and pride. “I prayed for their safe return every night,” she said. “My son has grown into a ___45___ (tough) and more mature young man.”",
      "fine_category": "word-comparative",
      "facets": {
        "subtype": "comparative"
      }
    },
    {
      "id": "2026广州一模-36",
      "exam_id": "2026广州一模",
      "year": 2026,
      "type": "模拟卷",
      "no": 36,
      "answer": "from",
      "explanation": "考查介词。句意：柔和的灯光逐渐照亮了舞台上静止的人物，他们仿佛从一本明代书籍的书页中被抬了出来。结合句意，此处表示“从……中”，应用介词from，lifted from意为“从……被抬起”，符合语境。故填from。",
      "grammar_point": "介词",
      "category": "preposition",
      "category_name": "介词",
      "passage": "Distant pleasant music floated above the Sydney Opera House stage. Soft light gradually revealed motionless figures at work, as if lifted ___36___ the pages of a Ming-dynasty book. Slowly they began to move. Accompanied by the soft sound of page turning and the gentle flow of water, their graceful ___37___ (gesture) formed a living picture of labour.\n\nThis breathtaking opening of the dance drama _Tiangong Kaiwu_ pulled me ___38___ (instant) into that world of ancient creation. Through ___39___ (express) movement, the performance conveyed the book’s core message — ___40___ (value) the skills passed down by countless unknown labourers and the power of practical tools. The beautiful scenes of golden fields and shiny silk made me feel the deep bond between humanity and nature.\n\nThe most moving moment came ___41___ Song Yingxing took off his official robe (官袍) and stepped into a “field” formed by the other dancers. All motion ceased; only his figure remained, arms stretched upward, silent yet full of strength. At that instant, history ___42___ (it) seemed to hold its breath.\n\nAs I left the theatre I overheard a visitor say “This is beauty that ___43___ (go) beyond borders.” His words deepened my belief: art ___44___ (root) in a culture’s finest traditions possesses a timeless power to move anyone. This was more than ___45___ ancient book brought to life — it was a celebration of Chinese wisdom and its spirit of sharing with the world.",
      "fine_category": "prep-common",
      "facets": {
        "word": "from"
      }
    },
    {
      "id": "2026广州一模-37",
      "exam_id": "2026广州一模",
      "year": 2026,
      "type": "模拟卷",
      "no": 37,
      "answer": "gestures",
      "explanation": "考查名词复数。句意：在轻柔的翻页声和流水声的陪伴下，他们优雅的姿态构成了一幅生动的劳动画卷。gesture为可数名词，结合句中their（他们的）可知，此处应用复数形式，指代多名舞者的姿态。故填gestures。",
      "grammar_point": "名词复数",
      "category": "number",
      "category_name": "名词/数词",
      "passage": "Distant pleasant music floated above the Sydney Opera House stage. Soft light gradually revealed motionless figures at work, as if lifted ___36___ the pages of a Ming-dynasty book. Slowly they began to move. Accompanied by the soft sound of page turning and the gentle flow of water, their graceful ___37___ (gesture) formed a living picture of labour.\n\nThis breathtaking opening of the dance drama _Tiangong Kaiwu_ pulled me ___38___ (instant) into that world of ancient creation. Through ___39___ (express) movement, the performance conveyed the book’s core message — ___40___ (value) the skills passed down by countless unknown labourers and the power of practical tools. The beautiful scenes of golden fields and shiny silk made me feel the deep bond between humanity and nature.\n\nThe most moving moment came ___41___ Song Yingxing took off his official robe (官袍) and stepped into a “field” formed by the other dancers. All motion ceased; only his figure remained, arms stretched upward, silent yet full of strength. At that instant, history ___42___ (it) seemed to hold its breath.\n\nAs I left the theatre I overheard a visitor say “This is beauty that ___43___ (go) beyond borders.” His words deepened my belief: art ___44___ (root) in a culture’s finest traditions possesses a timeless power to move anyone. This was more than ___45___ ancient book brought to life — it was a celebration of Chinese wisdom and its spirit of sharing with the world.",
      "fine_category": "num-plural",
      "facets": {
        "type": "plural"
      }
    },
    {
      "id": "2026广州一模-38",
      "exam_id": "2026广州一模",
      "year": 2026,
      "type": "模拟卷",
      "no": 38,
      "answer": "instantly",
      "explanation": "考查副词。句意：舞蹈剧《天工开物》这令人惊叹的开场瞬间就把我带入了那个古老的创造世界。此处修饰动词pulled（带入），应用副词形式，instant的副词为instantly，意为“立刻、瞬间”。故填instantly。",
      "grammar_point": "副词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "Distant pleasant music floated above the Sydney Opera House stage. Soft light gradually revealed motionless figures at work, as if lifted ___36___ the pages of a Ming-dynasty book. Slowly they began to move. Accompanied by the soft sound of page turning and the gentle flow of water, their graceful ___37___ (gesture) formed a living picture of labour.\n\nThis breathtaking opening of the dance drama _Tiangong Kaiwu_ pulled me ___38___ (instant) into that world of ancient creation. Through ___39___ (express) movement, the performance conveyed the book’s core message — ___40___ (value) the skills passed down by countless unknown labourers and the power of practical tools. The beautiful scenes of golden fields and shiny silk made me feel the deep bond between humanity and nature.\n\nThe most moving moment came ___41___ Song Yingxing took off his official robe (官袍) and stepped into a “field” formed by the other dancers. All motion ceased; only his figure remained, arms stretched upward, silent yet full of strength. At that instant, history ___42___ (it) seemed to hold its breath.\n\nAs I left the theatre I overheard a visitor say “This is beauty that ___43___ (go) beyond borders.” His words deepened my belief: art ___44___ (root) in a culture’s finest traditions possesses a timeless power to move anyone. This was more than ___45___ ancient book brought to life — it was a celebration of Chinese wisdom and its spirit of sharing with the world.",
      "fine_category": "word-adv",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2026广州一模-39",
      "exam_id": "2026广州一模",
      "year": 2026,
      "type": "模拟卷",
      "no": 39,
      "answer": "expressive",
      "explanation": "考查形容词。句意：通过富有表现力的动作，这场演出传递了这本书的核心思想——珍视无数无名劳动者传承下来的技艺和实用工具的力量。此处修饰名词movement（动作），应用形容词形式，express的形容词为expressive，意为“富有表现力的”。故填expressive。",
      "grammar_point": "形容词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "Distant pleasant music floated above the Sydney Opera House stage. Soft light gradually revealed motionless figures at work, as if lifted ___36___ the pages of a Ming-dynasty book. Slowly they began to move. Accompanied by the soft sound of page turning and the gentle flow of water, their graceful ___37___ (gesture) formed a living picture of labour.\n\nThis breathtaking opening of the dance drama _Tiangong Kaiwu_ pulled me ___38___ (instant) into that world of ancient creation. Through ___39___ (express) movement, the performance conveyed the book’s core message — ___40___ (value) the skills passed down by countless unknown labourers and the power of practical tools. The beautiful scenes of golden fields and shiny silk made me feel the deep bond between humanity and nature.\n\nThe most moving moment came ___41___ Song Yingxing took off his official robe (官袍) and stepped into a “field” formed by the other dancers. All motion ceased; only his figure remained, arms stretched upward, silent yet full of strength. At that instant, history ___42___ (it) seemed to hold its breath.\n\nAs I left the theatre I overheard a visitor say “This is beauty that ___43___ (go) beyond borders.” His words deepened my belief: art ___44___ (root) in a culture’s finest traditions possesses a timeless power to move anyone. This was more than ___45___ ancient book brought to life — it was a celebration of Chinese wisdom and its spirit of sharing with the world.",
      "fine_category": "word-adj",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2026广州一模-40",
      "exam_id": "2026广州一模",
      "year": 2026,
      "type": "模拟卷",
      "no": 40,
      "answer": "valuing",
      "explanation": "考查非谓语动词。句意：通过富有表现力的动作，这场演出传递了这本书的核心思想——珍视无数无名劳动者传承下来的技艺和实用工具的力量。此处为名词短语core message的同位语，用动名词形式。故填valuing。",
      "grammar_point": "非谓语动词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "Distant pleasant music floated above the Sydney Opera House stage. Soft light gradually revealed motionless figures at work, as if lifted ___36___ the pages of a Ming-dynasty book. Slowly they began to move. Accompanied by the soft sound of page turning and the gentle flow of water, their graceful ___37___ (gesture) formed a living picture of labour.\n\nThis breathtaking opening of the dance drama _Tiangong Kaiwu_ pulled me ___38___ (instant) into that world of ancient creation. Through ___39___ (express) movement, the performance conveyed the book’s core message — ___40___ (value) the skills passed down by countless unknown labourers and the power of practical tools. The beautiful scenes of golden fields and shiny silk made me feel the deep bond between humanity and nature.\n\nThe most moving moment came ___41___ Song Yingxing took off his official robe (官袍) and stepped into a “field” formed by the other dancers. All motion ceased; only his figure remained, arms stretched upward, silent yet full of strength. At that instant, history ___42___ (it) seemed to hold its breath.\n\nAs I left the theatre I overheard a visitor say “This is beauty that ___43___ (go) beyond borders.” His words deepened my belief: art ___44___ (root) in a culture’s finest traditions possesses a timeless power to move anyone. This was more than ___45___ ancient book brought to life — it was a celebration of Chinese wisdom and its spirit of sharing with the world.",
      "fine_category": "word-noun",
      "nonp_function": "subject_predicative",
      "nonp_function_label": "作主语 / 表语",
      "nonp_form": "doing",
      "nonp_form_label": "doing",
      "nonp_rule": "valuing 是动名词短语，解释 core message 的内容，具有名词性。",
      "nonp_needs_review": false,
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2026广州一模-41",
      "exam_id": "2026广州一模",
      "year": 2026,
      "type": "模拟卷",
      "no": 41,
      "answer": "when",
      "explanation": "考查定语从句/连词。句意：最感人的时刻出现在宋应星脱下官袍，走进由其他舞者组成的“田野”时。此处引导时间状语从句，意为“当……时”，应用连词when。故填when。",
      "grammar_point": "定语从句/连词",
      "category": "attrib",
      "category_name": "定语从句",
      "passage": "Distant pleasant music floated above the Sydney Opera House stage. Soft light gradually revealed motionless figures at work, as if lifted ___36___ the pages of a Ming-dynasty book. Slowly they began to move. Accompanied by the soft sound of page turning and the gentle flow of water, their graceful ___37___ (gesture) formed a living picture of labour.\n\nThis breathtaking opening of the dance drama _Tiangong Kaiwu_ pulled me ___38___ (instant) into that world of ancient creation. Through ___39___ (express) movement, the performance conveyed the book’s core message — ___40___ (value) the skills passed down by countless unknown labourers and the power of practical tools. The beautiful scenes of golden fields and shiny silk made me feel the deep bond between humanity and nature.\n\nThe most moving moment came ___41___ Song Yingxing took off his official robe (官袍) and stepped into a “field” formed by the other dancers. All motion ceased; only his figure remained, arms stretched upward, silent yet full of strength. At that instant, history ___42___ (it) seemed to hold its breath.\n\nAs I left the theatre I overheard a visitor say “This is beauty that ___43___ (go) beyond borders.” His words deepened my belief: art ___44___ (root) in a culture’s finest traditions possesses a timeless power to move anyone. This was more than ___45___ ancient book brought to life — it was a celebration of Chinese wisdom and its spirit of sharing with the world.",
      "fine_category": "attrib-adverb",
      "facets": {
        "type": "relative-adverb",
        "word": "when",
        "restrictive": true
      }
    },
    {
      "id": "2026广州一模-42",
      "exam_id": "2026广州一模",
      "year": 2026,
      "type": "模拟卷",
      "no": 42,
      "answer": "itself",
      "explanation": "考查反身代词。句意：在那一刻，历史本身仿佛也屏住了呼吸。此处指代主语history（历史）本身，应用反身代词itself，起强调作用。故填itself。",
      "grammar_point": "反身代词",
      "category": "pronoun",
      "category_name": "代词",
      "passage": "Distant pleasant music floated above the Sydney Opera House stage. Soft light gradually revealed motionless figures at work, as if lifted ___36___ the pages of a Ming-dynasty book. Slowly they began to move. Accompanied by the soft sound of page turning and the gentle flow of water, their graceful ___37___ (gesture) formed a living picture of labour.\n\nThis breathtaking opening of the dance drama _Tiangong Kaiwu_ pulled me ___38___ (instant) into that world of ancient creation. Through ___39___ (express) movement, the performance conveyed the book’s core message — ___40___ (value) the skills passed down by countless unknown labourers and the power of practical tools. The beautiful scenes of golden fields and shiny silk made me feel the deep bond between humanity and nature.\n\nThe most moving moment came ___41___ Song Yingxing took off his official robe (官袍) and stepped into a “field” formed by the other dancers. All motion ceased; only his figure remained, arms stretched upward, silent yet full of strength. At that instant, history ___42___ (it) seemed to hold its breath.\n\nAs I left the theatre I overheard a visitor say “This is beauty that ___43___ (go) beyond borders.” His words deepened my belief: art ___44___ (root) in a culture’s finest traditions possesses a timeless power to move anyone. This was more than ___45___ ancient book brought to life — it was a celebration of Chinese wisdom and its spirit of sharing with the world.",
      "fine_category": "pron-personal",
      "facets": {
        "type": "personal"
      }
    },
    {
      "id": "2026广州一模-43",
      "exam_id": "2026广州一模",
      "year": 2026,
      "type": "模拟卷",
      "no": 43,
      "answer": "goes",
      "explanation": "考查动词时态和主谓一致。句意：当我离开剧院时，我无意中听到一位观众说“这是一种超越国界的美”。此处为定语从句，先行词为beauty（美），为不可数名词，定语从句的谓语动词应用第三人称单数形式，且句子描述的是观看演出时的感受，用一般现在时即可，故填goes。",
      "grammar_point": "动词时态和主谓一致",
      "category": "predicate",
      "category_name": "谓语动词",
      "passage": "Distant pleasant music floated above the Sydney Opera House stage. Soft light gradually revealed motionless figures at work, as if lifted ___36___ the pages of a Ming-dynasty book. Slowly they began to move. Accompanied by the soft sound of page turning and the gentle flow of water, their graceful ___37___ (gesture) formed a living picture of labour.\n\nThis breathtaking opening of the dance drama _Tiangong Kaiwu_ pulled me ___38___ (instant) into that world of ancient creation. Through ___39___ (express) movement, the performance conveyed the book’s core message — ___40___ (value) the skills passed down by countless unknown labourers and the power of practical tools. The beautiful scenes of golden fields and shiny silk made me feel the deep bond between humanity and nature.\n\nThe most moving moment came ___41___ Song Yingxing took off his official robe (官袍) and stepped into a “field” formed by the other dancers. All motion ceased; only his figure remained, arms stretched upward, silent yet full of strength. At that instant, history ___42___ (it) seemed to hold its breath.\n\nAs I left the theatre I overheard a visitor say “This is beauty that ___43___ (go) beyond borders.” His words deepened my belief: art ___44___ (root) in a culture’s finest traditions possesses a timeless power to move anyone. This was more than ___45___ ancient book brought to life — it was a celebration of Chinese wisdom and its spirit of sharing with the world.",
      "fine_category": "pred-sva-form"
    },
    {
      "id": "2026广州一模-44",
      "exam_id": "2026广州一模",
      "year": 2026,
      "type": "模拟卷",
      "no": 44,
      "answer": "rooted",
      "explanation": "考查非谓语动词。句意：他的话加深了我的信念：植根于一种文化最优秀传统的艺术，具有打动任何人的永恒力量。分析句子结构可知，此处为非谓语动词作后置定语，be rooted in意为“植根于”，此处省略be动词，用过去分词短语作定语。故填rooted。",
      "grammar_point": "非谓语动词",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "Distant pleasant music floated above the Sydney Opera House stage. Soft light gradually revealed motionless figures at work, as if lifted ___36___ the pages of a Ming-dynasty book. Slowly they began to move. Accompanied by the soft sound of page turning and the gentle flow of water, their graceful ___37___ (gesture) formed a living picture of labour.\n\nThis breathtaking opening of the dance drama _Tiangong Kaiwu_ pulled me ___38___ (instant) into that world of ancient creation. Through ___39___ (express) movement, the performance conveyed the book’s core message — ___40___ (value) the skills passed down by countless unknown labourers and the power of practical tools. The beautiful scenes of golden fields and shiny silk made me feel the deep bond between humanity and nature.\n\nThe most moving moment came ___41___ Song Yingxing took off his official robe (官袍) and stepped into a “field” formed by the other dancers. All motion ceased; only his figure remained, arms stretched upward, silent yet full of strength. At that instant, history ___42___ (it) seemed to hold its breath.\n\nAs I left the theatre I overheard a visitor say “This is beauty that ___43___ (go) beyond borders.” His words deepened my belief: art ___44___ (root) in a culture’s finest traditions possesses a timeless power to move anyone. This was more than ___45___ ancient book brought to life — it was a celebration of Chinese wisdom and its spirit of sharing with the world.",
      "fine_category": "nonpred-done",
      "nonp_function": "attribute",
      "nonp_function_label": "作定语",
      "nonp_form": "done",
      "nonp_form_label": "done",
      "nonp_rule": "rooted 修饰 art，art 与 root in 是动宾关系，用 done 作后置定语。",
      "nonp_needs_review": false,
      "facets": {
        "form": "done"
      }
    },
    {
      "id": "2026广州一模-45",
      "exam_id": "2026广州一模",
      "year": 2026,
      "type": "模拟卷",
      "no": 45,
      "answer": "an",
      "explanation": "考查冠词。句意：这不仅仅是一本被赋予生命的古书——这是对中国智慧及其与世界分享精神的赞颂。ancient book为可数名词单数，空前无限定词，此处表示“一本古书”，为泛指，且ancient是以元音音素开头的单词，所以用不定冠词an。故填an。",
      "grammar_point": "冠词",
      "category": "article",
      "category_name": "冠词",
      "passage": "Distant pleasant music floated above the Sydney Opera House stage. Soft light gradually revealed motionless figures at work, as if lifted ___36___ the pages of a Ming-dynasty book. Slowly they began to move. Accompanied by the soft sound of page turning and the gentle flow of water, their graceful ___37___ (gesture) formed a living picture of labour.\n\nThis breathtaking opening of the dance drama _Tiangong Kaiwu_ pulled me ___38___ (instant) into that world of ancient creation. Through ___39___ (express) movement, the performance conveyed the book’s core message — ___40___ (value) the skills passed down by countless unknown labourers and the power of practical tools. The beautiful scenes of golden fields and shiny silk made me feel the deep bond between humanity and nature.\n\nThe most moving moment came ___41___ Song Yingxing took off his official robe (官袍) and stepped into a “field” formed by the other dancers. All motion ceased; only his figure remained, arms stretched upward, silent yet full of strength. At that instant, history ___42___ (it) seemed to hold its breath.\n\nAs I left the theatre I overheard a visitor say “This is beauty that ___43___ (go) beyond borders.” His words deepened my belief: art ___44___ (root) in a culture’s finest traditions possesses a timeless power to move anyone. This was more than ___45___ ancient book brought to life — it was a celebration of Chinese wisdom and its spirit of sharing with the world.",
      "fine_category": "art-a-an",
      "facets": {
        "word": "a-an"
      }
    },
    {
      "id": "2026深圳一模-36",
      "exam_id": "2026深圳一模",
      "year": 2026,
      "type": "模拟卷",
      "no": 36,
      "answer": "where",
      "explanation": "考查定语从句。句意：当我第一次翻开《林间鹿隐》时，仿佛踏入了一个作者文字如轻音乐般流淌的世界。空处引导限制性定语从句，先行词是world，在从句中作地点状语，故用关系副词where引导。故填where。",
      "grammar_point": "定语从句",
      "category": "attrib",
      "category_name": "定语从句",
      "passage": "When I first opened _Where the Deer Hide in the Woods_, I felt as if I were stepping into a world ___36___ the author’s words flow like gentle music. The Tang poems, ___37___ (translate) with the master touch of Xu Yuanchong, speak softly in two voices — one Chinese, one English — each echoing (回响) with calm, beauty, and quiet ___38___ (deep).\n\nThe book ___39___ (divide) into six chapters, each unfolding a distinct landscape of emotion— sorrow, peace, love, longing, solitude, and reflection. I was ___40___ (genuine) moved when I read “The monkeys on both banks are still calling; my light boat has sailed past a thousand hills.” I fully ___41___ (sense) Li Bai’s liberated soul — his joy at being pardoned by the emperor — flowing through the lines.\n\nEach page of the book is enriched with thoughtful notes vivid background stories, and traditional Chinese brush-style ___42___ (illustration). Xu’s artful work transforms the rhythm (节奏) of Chinese poems ___43___ English music, a recreation that honors both the original and its new form.\n\n___44___ (read) this book feels like a journey through hearts and landscapes. For anyone who treasures poetry, painting, or the meeting of two cultures in perfect harmony, _Where the Deer Hide in the Woods_ is ___45___ must-read that beautifully serves as the bridge.",
      "fine_category": "attrib-adverb",
      "facets": {
        "type": "relative-adverb",
        "word": "where",
        "restrictive": true
      }
    },
    {
      "id": "2026深圳一模-37",
      "exam_id": "2026深圳一模",
      "year": 2026,
      "type": "模拟卷",
      "no": 37,
      "answer": "translated",
      "explanation": "考查非谓语动词。句意：这些唐诗，在许渊冲大师的笔触下被翻译出来，用两种声音轻声诉说——中文与英文——每一种都回荡着宁静、美感与深沉的底蕴。空处为非谓语动词作后置定语，修饰名词Tang poems，且Tang poems与translate之间是被动关系，故用过去分词。故填translated。",
      "grammar_point": "非谓语动词",
      "category": "nonpredicate",
      "category_name": "非谓语动词",
      "passage": "When I first opened _Where the Deer Hide in the Woods_, I felt as if I were stepping into a world ___36___ the author’s words flow like gentle music. The Tang poems, ___37___ (translate) with the master touch of Xu Yuanchong, speak softly in two voices — one Chinese, one English — each echoing (回响) with calm, beauty, and quiet ___38___ (deep).\n\nThe book ___39___ (divide) into six chapters, each unfolding a distinct landscape of emotion— sorrow, peace, love, longing, solitude, and reflection. I was ___40___ (genuine) moved when I read “The monkeys on both banks are still calling; my light boat has sailed past a thousand hills.” I fully ___41___ (sense) Li Bai’s liberated soul — his joy at being pardoned by the emperor — flowing through the lines.\n\nEach page of the book is enriched with thoughtful notes vivid background stories, and traditional Chinese brush-style ___42___ (illustration). Xu’s artful work transforms the rhythm (节奏) of Chinese poems ___43___ English music, a recreation that honors both the original and its new form.\n\n___44___ (read) this book feels like a journey through hearts and landscapes. For anyone who treasures poetry, painting, or the meeting of two cultures in perfect harmony, _Where the Deer Hide in the Woods_ is ___45___ must-read that beautifully serves as the bridge.",
      "fine_category": "nonpred-done",
      "nonp_function": "attribute",
      "nonp_function_label": "作定语",
      "nonp_form": "done",
      "nonp_form_label": "done",
      "nonp_rule": "translated 修饰 Tang poems，poems 与 translate 是动宾关系，用 done 作后置定语。",
      "nonp_needs_review": false,
      "facets": {
        "form": "done"
      }
    },
    {
      "id": "2026深圳一模-38",
      "exam_id": "2026深圳一模",
      "year": 2026,
      "type": "模拟卷",
      "no": 38,
      "answer": "depth",
      "explanation": "考查名词。句意同上。空处为名词作宾语，deep的名词是depth，意为“深度”，不可数名词。故填depth。",
      "grammar_point": "名词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "When I first opened _Where the Deer Hide in the Woods_, I felt as if I were stepping into a world ___36___ the author’s words flow like gentle music. The Tang poems, ___37___ (translate) with the master touch of Xu Yuanchong, speak softly in two voices — one Chinese, one English — each echoing (回响) with calm, beauty, and quiet ___38___ (deep).\n\nThe book ___39___ (divide) into six chapters, each unfolding a distinct landscape of emotion— sorrow, peace, love, longing, solitude, and reflection. I was ___40___ (genuine) moved when I read “The monkeys on both banks are still calling; my light boat has sailed past a thousand hills.” I fully ___41___ (sense) Li Bai’s liberated soul — his joy at being pardoned by the emperor — flowing through the lines.\n\nEach page of the book is enriched with thoughtful notes vivid background stories, and traditional Chinese brush-style ___42___ (illustration). Xu’s artful work transforms the rhythm (节奏) of Chinese poems ___43___ English music, a recreation that honors both the original and its new form.\n\n___44___ (read) this book feels like a journey through hearts and landscapes. For anyone who treasures poetry, painting, or the meeting of two cultures in perfect harmony, _Where the Deer Hide in the Woods_ is ___45___ must-read that beautifully serves as the bridge.",
      "fine_category": "word-noun",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2026深圳一模-39",
      "exam_id": "2026深圳一模",
      "year": 2026,
      "type": "模拟卷",
      "no": 39,
      "answer": "is divided",
      "explanation": "考查时态和语态。句意：这本书被分为六个章节，每一章展现一种独特的情感意境：悲伤、安宁、爱、思念、孤独与沉思。空处作谓语，此处是对客观事实的描述，应用一般现在时，且主语the book与divide之间是被动关系，应用被动语态，又因主语是单数，be动词用is。故填is divided。",
      "grammar_point": "时态和语态",
      "category": "predicate",
      "category_name": "谓语动词",
      "passage": "When I first opened _Where the Deer Hide in the Woods_, I felt as if I were stepping into a world ___36___ the author’s words flow like gentle music. The Tang poems, ___37___ (translate) with the master touch of Xu Yuanchong, speak softly in two voices — one Chinese, one English — each echoing (回响) with calm, beauty, and quiet ___38___ (deep).\n\nThe book ___39___ (divide) into six chapters, each unfolding a distinct landscape of emotion— sorrow, peace, love, longing, solitude, and reflection. I was ___40___ (genuine) moved when I read “The monkeys on both banks are still calling; my light boat has sailed past a thousand hills.” I fully ___41___ (sense) Li Bai’s liberated soul — his joy at being pardoned by the emperor — flowing through the lines.\n\nEach page of the book is enriched with thoughtful notes vivid background stories, and traditional Chinese brush-style ___42___ (illustration). Xu’s artful work transforms the rhythm (节奏) of Chinese poems ___43___ English music, a recreation that honors both the original and its new form.\n\n___44___ (read) this book feels like a journey through hearts and landscapes. For anyone who treasures poetry, painting, or the meeting of two cultures in perfect harmony, _Where the Deer Hide in the Woods_ is ___45___ must-read that beautifully serves as the bridge.",
      "fine_category": "pred-passive-form"
    },
    {
      "id": "2026深圳一模-40",
      "exam_id": "2026深圳一模",
      "year": 2026,
      "type": "模拟卷",
      "no": 40,
      "answer": "genuinely",
      "explanation": "考查副词。句意：当我读到“两岸猿声啼不住，轻舟已过万重山”时，我由衷地被打动。空处修饰动词moved，应填为副词作状语，genuine的副词是genuinely，意为“真正地”。故填genuinely。",
      "grammar_point": "副词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "When I first opened _Where the Deer Hide in the Woods_, I felt as if I were stepping into a world ___36___ the author’s words flow like gentle music. The Tang poems, ___37___ (translate) with the master touch of Xu Yuanchong, speak softly in two voices — one Chinese, one English — each echoing (回响) with calm, beauty, and quiet ___38___ (deep).\n\nThe book ___39___ (divide) into six chapters, each unfolding a distinct landscape of emotion— sorrow, peace, love, longing, solitude, and reflection. I was ___40___ (genuine) moved when I read “The monkeys on both banks are still calling; my light boat has sailed past a thousand hills.” I fully ___41___ (sense) Li Bai’s liberated soul — his joy at being pardoned by the emperor — flowing through the lines.\n\nEach page of the book is enriched with thoughtful notes vivid background stories, and traditional Chinese brush-style ___42___ (illustration). Xu’s artful work transforms the rhythm (节奏) of Chinese poems ___43___ English music, a recreation that honors both the original and its new form.\n\n___44___ (read) this book feels like a journey through hearts and landscapes. For anyone who treasures poetry, painting, or the meeting of two cultures in perfect harmony, _Where the Deer Hide in the Woods_ is ___45___ must-read that beautifully serves as the bridge.",
      "fine_category": "word-adv",
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2026深圳一模-41",
      "exam_id": "2026深圳一模",
      "year": 2026,
      "type": "模拟卷",
      "no": 41,
      "answer": "sensed",
      "explanation": "考查时态。句意：我真切地感受到了李白那自由豁达的灵魂——他被皇帝赦免后的喜悦——流淌在字里行间。空处作谓语，根据I was可知，此处应用一般过去时。故填sensed。",
      "grammar_point": "时态",
      "category": "predicate",
      "category_name": "谓语动词",
      "passage": "When I first opened _Where the Deer Hide in the Woods_, I felt as if I were stepping into a world ___36___ the author’s words flow like gentle music. The Tang poems, ___37___ (translate) with the master touch of Xu Yuanchong, speak softly in two voices — one Chinese, one English — each echoing (回响) with calm, beauty, and quiet ___38___ (deep).\n\nThe book ___39___ (divide) into six chapters, each unfolding a distinct landscape of emotion— sorrow, peace, love, longing, solitude, and reflection. I was ___40___ (genuine) moved when I read “The monkeys on both banks are still calling; my light boat has sailed past a thousand hills.” I fully ___41___ (sense) Li Bai’s liberated soul — his joy at being pardoned by the emperor — flowing through the lines.\n\nEach page of the book is enriched with thoughtful notes vivid background stories, and traditional Chinese brush-style ___42___ (illustration). Xu’s artful work transforms the rhythm (节奏) of Chinese poems ___43___ English music, a recreation that honors both the original and its new form.\n\n___44___ (read) this book feels like a journey through hearts and landscapes. For anyone who treasures poetry, painting, or the meeting of two cultures in perfect harmony, _Where the Deer Hide in the Woods_ is ___45___ must-read that beautifully serves as the bridge.",
      "fine_category": "pred-tense-past-future"
    },
    {
      "id": "2026深圳一模-42",
      "exam_id": "2026深圳一模",
      "year": 2026,
      "type": "模拟卷",
      "no": 42,
      "answer": "illustrations",
      "explanation": "考查名词。句意：书中每一页都配有精心的注释、生动的背景故事与中国传统国画风格的插图。空处为名词作宾语，illustration意为“插图”，是可数名词，此处表示泛指，且没有冠词限定，应用复数形式。故填illustrations。",
      "grammar_point": "名词",
      "category": "number",
      "category_name": "名词/数词",
      "passage": "When I first opened _Where the Deer Hide in the Woods_, I felt as if I were stepping into a world ___36___ the author’s words flow like gentle music. The Tang poems, ___37___ (translate) with the master touch of Xu Yuanchong, speak softly in two voices — one Chinese, one English — each echoing (回响) with calm, beauty, and quiet ___38___ (deep).\n\nThe book ___39___ (divide) into six chapters, each unfolding a distinct landscape of emotion— sorrow, peace, love, longing, solitude, and reflection. I was ___40___ (genuine) moved when I read “The monkeys on both banks are still calling; my light boat has sailed past a thousand hills.” I fully ___41___ (sense) Li Bai’s liberated soul — his joy at being pardoned by the emperor — flowing through the lines.\n\nEach page of the book is enriched with thoughtful notes vivid background stories, and traditional Chinese brush-style ___42___ (illustration). Xu’s artful work transforms the rhythm (节奏) of Chinese poems ___43___ English music, a recreation that honors both the original and its new form.\n\n___44___ (read) this book feels like a journey through hearts and landscapes. For anyone who treasures poetry, painting, or the meeting of two cultures in perfect harmony, _Where the Deer Hide in the Woods_ is ___45___ must-read that beautifully serves as the bridge.",
      "fine_category": "num-plural",
      "facets": {
        "type": "plural"
      }
    },
    {
      "id": "2026深圳一模-43",
      "exam_id": "2026深圳一模",
      "year": 2026,
      "type": "模拟卷",
      "no": 43,
      "answer": "into",
      "explanation": "考查介词。句意：许渊冲巧妙地将中国诗歌的韵律转化为英文的音乐美，这种再创作既尊重原作，又赋予其新的形式。transform…into…是固定短语，意为“把……转化为……”。故填into。",
      "grammar_point": "介词",
      "category": "preposition",
      "category_name": "介词",
      "passage": "When I first opened _Where the Deer Hide in the Woods_, I felt as if I were stepping into a world ___36___ the author’s words flow like gentle music. The Tang poems, ___37___ (translate) with the master touch of Xu Yuanchong, speak softly in two voices — one Chinese, one English — each echoing (回响) with calm, beauty, and quiet ___38___ (deep).\n\nThe book ___39___ (divide) into six chapters, each unfolding a distinct landscape of emotion— sorrow, peace, love, longing, solitude, and reflection. I was ___40___ (genuine) moved when I read “The monkeys on both banks are still calling; my light boat has sailed past a thousand hills.” I fully ___41___ (sense) Li Bai’s liberated soul — his joy at being pardoned by the emperor — flowing through the lines.\n\nEach page of the book is enriched with thoughtful notes vivid background stories, and traditional Chinese brush-style ___42___ (illustration). Xu’s artful work transforms the rhythm (节奏) of Chinese poems ___43___ English music, a recreation that honors both the original and its new form.\n\n___44___ (read) this book feels like a journey through hearts and landscapes. For anyone who treasures poetry, painting, or the meeting of two cultures in perfect harmony, _Where the Deer Hide in the Woods_ is ___45___ must-read that beautifully serves as the bridge.",
      "fine_category": "prep-collocation",
      "facets": {
        "word": "into"
      }
    },
    {
      "id": "2026深圳一模-44",
      "exam_id": "2026深圳一模",
      "year": 2026,
      "type": "模拟卷",
      "no": 44,
      "answer": "Reading",
      "explanation": "考查非谓语动词。句意：阅读这本书，就像一场穿越心灵与山水的旅程。空处为非谓语动词作主语，应用动名词形式，句首首字母应大写。故填Reading。",
      "grammar_point": "非谓语动词",
      "category": "word",
      "category_name": "词性转换",
      "passage": "When I first opened _Where the Deer Hide in the Woods_, I felt as if I were stepping into a world ___36___ the author’s words flow like gentle music. The Tang poems, ___37___ (translate) with the master touch of Xu Yuanchong, speak softly in two voices — one Chinese, one English — each echoing (回响) with calm, beauty, and quiet ___38___ (deep).\n\nThe book ___39___ (divide) into six chapters, each unfolding a distinct landscape of emotion— sorrow, peace, love, longing, solitude, and reflection. I was ___40___ (genuine) moved when I read “The monkeys on both banks are still calling; my light boat has sailed past a thousand hills.” I fully ___41___ (sense) Li Bai’s liberated soul — his joy at being pardoned by the emperor — flowing through the lines.\n\nEach page of the book is enriched with thoughtful notes vivid background stories, and traditional Chinese brush-style ___42___ (illustration). Xu’s artful work transforms the rhythm (节奏) of Chinese poems ___43___ English music, a recreation that honors both the original and its new form.\n\n___44___ (read) this book feels like a journey through hearts and landscapes. For anyone who treasures poetry, painting, or the meeting of two cultures in perfect harmony, _Where the Deer Hide in the Woods_ is ___45___ must-read that beautifully serves as the bridge.",
      "fine_category": "word-noun",
      "nonp_function": "subject_predicative",
      "nonp_function_label": "作主语 / 表语",
      "nonp_form": "doing",
      "nonp_form_label": "doing",
      "nonp_rule": "Reading 是动名词作主语，表示“阅读这本书”这一动作整体。",
      "nonp_needs_review": false,
      "facets": {
        "subtype": "derivation"
      }
    },
    {
      "id": "2026深圳一模-45",
      "exam_id": "2026深圳一模",
      "year": 2026,
      "type": "模拟卷",
      "no": 45,
      "answer": "a",
      "explanation": "考查冠词。句意：对于任何珍爱诗歌、绘画，或是珍视两种文化完美交融的人来说，《林间鹿隐》都是一本必读之作，它优美地担当起了桥梁的作用。must-read是可数名词，意为“必读书目”，此处表示泛指，且must-read是以辅音音素开头，应用不定冠词a修饰。故填a。",
      "grammar_point": "冠词",
      "category": "article",
      "category_name": "冠词",
      "passage": "When I first opened _Where the Deer Hide in the Woods_, I felt as if I were stepping into a world ___36___ the author’s words flow like gentle music. The Tang poems, ___37___ (translate) with the master touch of Xu Yuanchong, speak softly in two voices — one Chinese, one English — each echoing (回响) with calm, beauty, and quiet ___38___ (deep).\n\nThe book ___39___ (divide) into six chapters, each unfolding a distinct landscape of emotion— sorrow, peace, love, longing, solitude, and reflection. I was ___40___ (genuine) moved when I read “The monkeys on both banks are still calling; my light boat has sailed past a thousand hills.” I fully ___41___ (sense) Li Bai’s liberated soul — his joy at being pardoned by the emperor — flowing through the lines.\n\nEach page of the book is enriched with thoughtful notes vivid background stories, and traditional Chinese brush-style ___42___ (illustration). Xu’s artful work transforms the rhythm (节奏) of Chinese poems ___43___ English music, a recreation that honors both the original and its new form.\n\n___44___ (read) this book feels like a journey through hearts and landscapes. For anyone who treasures poetry, painting, or the meeting of two cultures in perfect harmony, _Where the Deer Hide in the Woods_ is ___45___ must-read that beautifully serves as the bridge.",
      "fine_category": "art-a-an",
      "facets": {
        "word": "a-an"
      }
    }
  ]
};
