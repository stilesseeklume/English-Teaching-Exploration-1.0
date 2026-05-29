// grammar-fill/modules/teaching-guide.js
//
// Pure teaching-card decision rules. No DOM access.

/* eslint-disable */
(function(){
  function asArray(value) {
    if (Array.isArray(value)) return value;
    if (value === null || typeof value === 'undefined') return [];
    return [value];
  }

  function normalizeTeachingAxes(raw) {
    if (!raw || typeof raw !== 'object') return null;
    return {
      title: raw.title || raw.label || '',
      trigger: raw.trigger || raw.rule || raw.decision || '',
      decisionPath: raw.decision_path || raw.decisionPath || '',
      commonMistake: raw.common_mistake || raw.commonMistake || '',
      teacherAsk: raw.teacher_ask || raw.teacherAsk || '',
      steps: asArray(raw.steps || raw.questions),
      chips: asArray(raw.chips),
      migrationKeys: asArray(raw.migration_keys || raw.migrationKeys)
    };
  }

  function detectPredicateForm(q, blob, answer, deps) {
    q = q || {};
    deps = deps || {};
    var fine = q.fine_category || '';
    var ans = String(answer || '').toLowerCase();
    var grammarPoint = String((q && q.grammar_point) || '');
    if (deps.hasPredicatePassiveCue && deps.hasPredicatePassiveCue(q, ans, blob, grammarPoint)) {
      return { label: '谓语 · 被动语态', key: 'predicate:passive', trigger: '主语承受动作，谓语要体现 be + done。' };
    }
    if (deps.hasPredicateAgreementCue && deps.hasPredicateAgreementCue(q, blob, grammarPoint)) {
      return { label: '谓语 · 主谓一致', key: 'predicate:sva', trigger: '先找主语中心词，再定谓语单复数。' };
    }
    if (deps.hasPredicatePerfectCue && deps.hasPredicatePerfectCue(q, blob)) {
      return { label: '谓语 · 完成时', key: 'predicate:tense:perfect', trigger: '时间线索指向完成时，再看主语和语态。' };
    }
    if (deps.hasPredicatePastCue && deps.hasPredicatePastCue(q, blob)) {
      return { label: '谓语 · 过去时间', key: 'predicate:tense:past', trigger: '时间背景落在过去，先定过去时，再看语态和一致。' };
    }
    if (/^pred-tense-present/.test(fine) || /客观事实|一般现在|\b(?:always|usually)\b|陈述.*事实/.test(blob)) {
      return { label: '谓语 · 一般现在', key: 'predicate:tense:present', trigger: '语境是客观事实或常态，谓语多用一般现在。' };
    }
    return { label: '谓语 · 时态语态一致', key: 'predicate:finite', trigger: '先确认句中缺谓语，再同时处理时态、语态和主谓一致。' };
  }

  function getArticleGuide(q, blob, answer) {
    var ans = String(answer || '').toLowerCase();
    var isAn = ans === 'an';
    var isA = ans === 'a' || isAn;
    if (isA) {
      return {
        title: '冠词：泛指一个',
        trigger: '空后是单数可数名词，语境表示“一个/一次/一段”，用 ' + (isAn ? 'an' : 'a') + '。',
        steps: ['先确认名词是否单数可数。', '再判断是否首次出现或泛指一个。', '最后按发音选择 a / an。'],
        commonMistake: '常错：看到中文“这个/那个”才想冠词，忽略单数可数名词前必须有限定词。',
        teacherAsk: '这里是在说特定的那一个，还是泛指一个？',
        chips: ['a/an', '泛指', '单数可数名词'],
        migrationKeys: ['article:a_an']
      };
    }
    if (/\b(?:first|last|only)\b|最高级|序数词|\bthe first\b|\bfor the first time\b|固定/.test(blob)) {
      return {
        title: '冠词：固定触发 the',
        trigger: '最高级、序数词或固定表达触发 the。',
        steps: ['先看空后结构是否有最高级、序数词或固定短语。', '再判断它是否形成固定表达。'],
        commonMistake: '常错：只按“特指”讲，漏掉固定结构触发。',
        teacherAsk: '这个 the 是特指，还是固定结构本身要求？',
        chips: ['the', '固定结构'],
        migrationKeys: ['article:the:fixed', 'article:the']
      };
    }
    return {
      title: '冠词：特指 / 共知',
      trigger: '上下文已经限定这个名词，或说话双方都知道所指对象，用 the。',
      steps: ['先找空前后有没有限定信息。', '再判断名词是否已经被上下文锁定。'],
      commonMistake: '常错：只看到名词第一次出现就填 a/an，忽略后置限定或语境特指。',
      teacherAsk: '这个名词有没有被后面的修饰语或上下文锁定？',
      chips: ['the', '特指'],
      migrationKeys: ['article:the']
    };
  }

  function getLogicRelation(answer, blob) {
    var ans = String(answer || '').toLowerCase();
    if (/\b(?:whether|either)\b.*\bor\b/.test(blob) || ans === 'or') return { label: '选择关系', key: 'choice' };
    if (/\bnot (?:only|just)\b|\bbut also\b/.test(blob) || ans === 'but') return { label: '转折 / 递进结构', key: 'contrast' };
    if (/\b(?:so|therefore)\b|因此|所以|结果/.test(blob) || ans === 'so') return { label: '结果关系', key: 'result' };
    if (ans === 'and') return { label: '并列 / 顺承关系', key: 'parallel' };
    return { label: '逻辑关系', key: ans || 'general' };
  }

  function getClauseRole(blob, fallback) {
    if (/主语从句/.test(blob)) return '主语从句';
    if (/宾语从句/.test(blob)) return '宾语从句';
    if (/表语从句/.test(blob)) return '表语从句';
    if (/同位语从句/.test(blob)) return '同位语从句';
    if (/非限制性/.test(blob)) return '非限制性定语从句';
    if (/定语从句/.test(blob)) return '定语从句';
    return fallback || '从句';
  }

  function getQuestionTextBlob(q, deps) {
    if (deps && deps.getQuestionTextBlob) return deps.getQuestionTextBlob(q);
    q = q || {};
    return [
      q.answer,
      q.analysis,
      q.explanation,
      q.grammar_point,
      q.fine_category,
      q.sentence,
      q.passage
    ].join(' ');
  }

  function detectWordFormTarget(q, answerLower, blob, grammarPoint, deps) {
    if (deps && deps.detectWordFormTarget) return deps.detectWordFormTarget(q, answerLower, blob, grammarPoint);
    return '';
  }

  function categoryLabel(category, deps) {
    var map = (deps && deps.categoryMap) || {};
    return map[category] || category || '语法填空';
  }

  function categoryTip(category, deps) {
    var tips = (deps && deps.categoryTips) || {};
    return tips[category] || '先判空格成分，再确定答案方向。';
  }

  function getQuestionPracticalGuide(q, deps) {
    q = q || {};
    deps = deps || {};
    var explicit = normalizeTeachingAxes(q.teaching_axes);
    if (explicit && (explicit.title || explicit.trigger || explicit.steps.length)) return explicit;

    var focus = deps.focus || null;
    var nonpAxis = deps.nonpAxis || null;
    var answer = String(q.answer || '').trim();
    var answerLower = answer.toLowerCase();
    var blob = getQuestionTextBlob(q, deps);
    var category = q.category || '';
    var fine = q.fine_category || '';

    if (nonpAxis) {
      return {
        title: '非谓语：' + nonpAxis.formLabel + ' · ' + nonpAxis.functionLabel,
        trigger: nonpAxis.rule || '先找逻辑主语，再看主被动和时间关系。',
        steps: ['句中已有谓语，空格不能再作谓语。', '找逻辑主语：谁做/承受这个动作？', '用形式轴定答案：to do / doing / done。'],
        commonMistake: '常错：只按“作什么成分”讲，忽略 to do / doing / done 的形式差异。',
        teacherAsk: '这个动作是谁发出的？是主动、被动，还是目的/将来？',
        chips: [nonpAxis.formLabel, nonpAxis.functionLabel].filter(Boolean),
        migrationKeys: [
          'nonpredicate:' + (nonpAxis.formKey || 'form') + ':' + (nonpAxis.functionKey || 'function'),
          'nonpredicate:' + (nonpAxis.formKey || 'form')
        ]
      };
    }

    if (category === 'predicate') {
      var pred = detectPredicateForm(q, blob, answer, deps);
      var predSteps = ['先确认空格是句子的谓语。', '看时间线索和上下文语境。', '最后核对时态、语态和主谓一致。'];
      var predMistake = '常错：只盯一个维度，不回到主语和整句时间线核对。';
      var predAsk = '这句话的主语是谁？空格缺的是哪一类谓语信息？';
      if (pred.key === 'predicate:sva') {
        predSteps = ['先确认句中缺谓语。', '抓主语中心词，不看插入修饰语。', '按语境核对单复数和第三人称。'];
        predMistake = '常错：把修饰语、并列成分或就近名词误当成主语中心。';
        predAsk = '真正决定单复数的是哪个主语中心词？';
      } else if (pred.key === 'predicate:passive') {
        predSteps = ['先确认空格作谓语。', '判断主语是动作承受者还是执行者。', '确定 be + done，再核对时态和单复数。'];
        predMistake = '常错：只看到 done 就判被动，没有把 be 的形式一起补全。';
        predAsk = '主语是在做动作，还是在承受动作？';
      } else if (pred.key === 'predicate:tense:perfect') {
        predSteps = ['先确认句中缺谓语。', '抓完成时的时间线索。', '再核对主语和是否需要被动。'];
        predMistake = '常错：看到过去时间就直接用一般过去时，漏掉“已完成/持续到现在”的线索。';
        predAsk = '动作是已经完成并和现在有关，还是只是发生在过去？';
      } else if (pred.key === 'predicate:tense:past') {
        predSteps = ['先确认句中缺谓语。', '看语境是否明确落在过去。', '再核对主动被动和单复数。'];
        predMistake = '常错：只因句子像事实陈述就误填一般现在，忽略过去时间背景。';
        predAsk = '这句时间背景落在哪个时点？';
      } else if (pred.key === 'predicate:tense:present') {
        predSteps = ['先确认句中缺谓语。', '判断是否在陈述常态或客观事实。', '再核对主语单复数。'];
        predMistake = '常错：看到动作词就随手填过去式，没有先判断是不是常态表达。';
        predAsk = '这是一次过去动作，还是一般事实/常态？';
      }
      return {
        title: pred.label,
        trigger: pred.trigger,
        steps: predSteps,
        commonMistake: predMistake,
        teacherAsk: predAsk,
        chips: ['时态', '语态', '主谓一致'],
        migrationKeys: [pred.key]
      };
    }

    if (category === 'word') {
      var wordTitle = '词性转换：先看空格功能';
      var trigger = '先判断空格在句中缺什么成分，再决定变名词、形容词、副词、复数或比较级。';
      var key = 'word:general';
      var chips = ['句子成分', '词形变化'];
      var wordTarget = detectWordFormTarget(q, answerLower, blob, q.grammar_point || '', deps);
      if (wordTarget === 'plural') {
        wordTitle = '词性转换：名词复数';
        trigger = '空格要填名词，且受数量词、these 或上下文复数意义触发。';
        key = 'word:plural';
        chips = ['名词', '复数'];
      } else if (wordTarget === 'adverb') {
        wordTitle = '词性转换：变副词';
        trigger = '空格修饰动词、形容词、副词或整句，用副词形式。';
        key = 'word:adverb';
        chips = ['副词', '修饰关系'];
      } else if (wordTarget === 'comparative') {
        wordTitle = '词性转换：比较级';
        trigger = '比较语境或 than / fewer 等线索触发比较级。';
        key = 'word:comparative';
        chips = ['比较级'];
      } else if (wordTarget === 'adjective') {
        wordTitle = '词性转换：变形容词';
        trigger = '空格修饰名词，或在系动词后作表语/宾补，用形容词。';
        key = 'word:adjective';
        chips = ['形容词', '定表补'];
      } else if (wordTarget === 'noun') {
        wordTitle = '词性转换：变名词';
        trigger = '空格作主语、宾语或介词宾语，需要名词形式。';
        key = 'word:noun';
        chips = ['名词', '句子成分'];
      }
      return {
        title: wordTitle,
        trigger: trigger,
        steps: ['先找空格在句中的位置。', '判断它承担的成分：定语、状语、表语、宾语等。', '再处理拼写和词缀变化。'],
        commonMistake: '常错：看到括号词就直接套词缀，没有先判断句子成分。',
        teacherAsk: '这个空格在句子里是修饰谁，还是自己充当一个名词性成分？',
        chips: chips,
        migrationKeys: [key]
      };
    }

    if (category === 'article') return getArticleGuide(q, blob, answer);

    if (category === 'preposition') {
      var relation = /prep-time|时间/.test(fine + blob) ? '时间关系'
        : new RegExp('prep-location|地点|位置').test(fine + blob) ? '地点位置'
        : /搭配|固定|短语|prep-verb|depend|prepare|wait|suitable|transform|praise|from.*to/.test(fine + blob) ? '固定搭配'
        : '语义关系';
      return {
        title: '介词：' + relation,
        trigger: relation === '固定搭配' ? '空前词与介词形成固定搭配，不能只按中文硬译。' : '介词表示名词/动作之间的关系，要从语义关系判断。',
        steps: ['先看空前核心词是否有固定搭配。', '再判断介词表达时间、地点、方式、对象、来源还是方向。', '最后回到原句验证语义是否通顺。'],
        commonMistake: '常错：按中文“一对一”翻译介词，忽略英语固定搭配。',
        teacherAsk: '这个介词是搭配要求，还是在表达两个词之间的关系？',
        chips: [answer, relation],
        migrationKeys: ['preposition:' + answerLower, 'preposition:' + relation]
      };
    }

    if (category === 'logic') {
      var rel = getLogicRelation(answer, blob);
      return {
        title: '逻辑连词：' + rel.label,
        trigger: '看空格前后两个成分之间的逻辑关系，而不是只背 and/or/but。',
        steps: ['先找被连接的两个成分。', '判断它们是并列、选择、转折、结果还是固定结构。', '检查是否存在 whether/either/not only 等结构提示。'],
        commonMistake: '常错：只看中文顺口填 and，忽略选择、转折或固定搭配。',
        teacherAsk: '空格前后是同向推进，还是二选一/转折/结果？',
        chips: [answer, rel.label],
        migrationKeys: ['logic:' + rel.key, 'logic:' + answerLower]
      };
    }

    if (category === 'attrib') {
      var clauseRole = getClauseRole(blob, '定语从句');
      var gap = /^(where|when|why)$/.test(answerLower) ? '从句缺状语'
        : answerLower === 'whose' ? '从句缺定语'
        : '从句缺主语/宾语';
      return {
        title: clauseRole + '：' + gap,
        trigger: '先找先行词，再看从句里缺什么成分。',
        steps: ['圈出先行词。', '把从句单独读一遍，看缺主宾表还是状语。', '缺状语用 where/when/why 或介词+关系代词，缺主宾多用 who/which/that。'],
        commonMistake: '常错：只看先行词是人还是物，不看关系词在从句中作什么成分。',
        teacherAsk: '从句里真正缺的是名词性成分，还是地点/时间/原因状语？',
        chips: [answer, gap],
        migrationKeys: ['attrib:' + gap, 'attrib:' + answerLower]
      };
    }

    if (category === 'nounclause') {
      var role = getClauseRole(blob, '名词性从句');
      var missing = /what|whatever|whoever|whichever/.test(answerLower) ? '连接词在从句中作成分'
        : '从句结构完整，连接词表达意义';
      return {
        title: role + '：' + answer,
        trigger: '先判断整个从句在主句中充当什么成分，再看从句内部缺不缺成分。',
        steps: ['找出从句边界。', '判断它作主语、宾语、表语还是同位语。', '看从句内部缺主宾表，还是结构完整只缺意义。'],
        commonMistake: '常错：把所有 wh 词都当“意思差不多”，不看它是否在从句里作成分。',
        teacherAsk: '这个连接词在从句里有没有承担主语、宾语或表语？',
        chips: [role, missing],
        migrationKeys: ['nounclause:' + role, 'nounclause:' + answerLower]
      };
    }

    if (category === 'pronoun') {
      var pronType = /^(myself|yourself|himself|herself|itself|ourselves|themselves)$/.test(answerLower) ? '反身代词'
        : /^(their|his|her|its|people's)$/.test(answerLower) ? '物主/所有格'
        : answerLower === 'it' ? 'it 指代' : '代词指代';
      return {
        title: '代词：' + pronType,
        trigger: '先找代词指代对象，再看它在句中作主语、宾语、定语还是强调自身。',
        steps: ['回到前文找指代对象。', '判断空格在句中的功能。', '核对人称、数、格和是否反身。'],
        commonMistake: '常错：只按中文“他/它/他们”翻译，不核对句中功能。',
        teacherAsk: '它指代谁？在这里是作定语、宾语，还是强调主语自身？',
        chips: [pronType],
        migrationKeys: ['pronoun:' + pronType]
      };
    }

    return {
      title: (focus && focus.label) || categoryLabel(category, deps),
      trigger: (focus && focus.note) || categoryTip(category, deps),
      steps: ['先找句子主干。', '判断空格成分。', '结合搭配和上下文确定答案。'],
      commonMistake: '常错：脱离句子结构，只凭局部词义猜答案。',
      teacherAsk: '这个空格在句子里承担什么功能？',
      chips: [categoryLabel(category, deps)].filter(Boolean),
      migrationKeys: [category || 'grammar']
    };
  }

  function buildPracticalGuideCardModel(guide) {
    if (!guide) {
      return {
        visible: false,
        kicker: '讲题卡',
        title: '讲题卡',
        titleLine: '考点：讲题卡',
        trigger: '',
        steps: [],
        mistake: ''
      };
    }
    var title = String(guide.title || '讲题卡');
    return {
      visible: true,
      kicker: '讲题卡',
      title: title,
      titleLine: '考点：' + title.replace(/^考点[:：]\s*/, ''),
      trigger: guide.trigger || '',
      steps: asArray(guide.steps).filter(Boolean).slice(0, 3),
      mistake: String(guide.commonMistake || '').replace(/^常错[:：]\s*/, '')
    };
  }

  function buildGuidePanelModel(header, guide) {
    header = header || {};
    return {
      kicker: '讲题',
      heading: header.headline || '讲题卡',
      subline: header.subline || '',
      practicalGuide: guide || header.practicalGuide || null
    };
  }

  function buildAnalysisPanelModel(q, values) {
    q = q || {};
    values = values || {};
    var practicalGuide = values.practicalGuide || null;
    return {
      answer: q.answer || '',
      zhSentence: values.zhSentence || '',
      practicalGuide: practicalGuide,
      guideCard: buildPracticalGuideCardModel(practicalGuide),
      solution: buildSolutionPanelModel(q),
      showNavigation: !values.teachingSession,
      migrationCount: Number(values.migrationCount || 0) || 0,
      floatButtons: [
        { key: 'guide', label: '讲题卡', title: '讲题卡' },
        { key: 'solution', label: '解题', title: '解题' }
      ]
    };
  }

  function buildSolutionPanelModel(q) {
    q = q || {};
    return {
      text: q.analysis || ('答案：' + (q.answer || '') + '。')
    };
  }

  function normalizeAnalysisFloatKind(kind) {
    kind = String(kind || '');
    return (kind === 'guide' || kind === 'solution') ? kind : '';
  }

  function buildAnalysisFloatClosePlan() {
    return {
      panelSelector: '.analysis-float-panel.show, .teaching-float-panel.show',
      activeButtonSelector: '.analysis-tool-btn.active',
      panelClass: 'show',
      buttonClass: 'active'
    };
  }

  function buildAnalysisFloatTogglePlan(kind, isOpen) {
    var normalizedKind = normalizeAnalysisFloatKind(kind);
    if (!normalizedKind) {
      return {
        active: false,
        kind: '',
        panelSelector: '',
        shouldCloseExisting: false,
        shouldOpen: false,
        panelClass: 'show',
        buttonClass: 'active'
      };
    }
    return {
      active: true,
      kind: normalizedKind,
      panelSelector: '[data-analysis-float="' + normalizedKind + '"]',
      shouldCloseExisting: true,
      shouldOpen: !isOpen,
      panelClass: 'show',
      buttonClass: 'active'
    };
  }

  function buildTheoryPanelModel(q, deps) {
    q = q || {};
    deps = deps || {};
    var categoryMap = deps.categoryMap || {};
    var theory = (deps.knowledgeData || {})[q.category];
    if (!theory) {
      return {
        hasTheory: false,
        emptyText: '「' + (categoryMap[q.category] || q.category || '语法填空') + '」考点理论资料整理中，敬请期待。',
        title: '',
        path: [],
        overviewHtml: '',
        sections: []
      };
    }
    var focus = deps.focus || (deps.safeQuestionFocus ? deps.safeQuestionFocus(q) : null);
    var fineInfo = deps.getFineTagInfo ? deps.getFineTagInfo(q.fine_category) : null;
    var tagLabel = (fineInfo && fineInfo.name) || (focus && focus.label) || categoryMap[q.category] || q.category || '语法填空';
    var sub = theory.sub || {};
    return {
      hasTheory: true,
      emptyText: '',
      title: tagLabel,
      path: getQuestionLessonPath(q, focus, null, { categoryMap: categoryMap }),
      overviewHtml: theory.overview || '',
      sections: Object.keys(sub).map(function(subKey) {
        var item = sub[subKey] || {};
        return {
          key: subKey,
          title: item.title || subKey,
          desc: item.desc || '',
          contentHtml: item.content || ''
        };
      })
    };
  }

  const FOCUS_GUIDES = {
    'nonpredicate-infinitive': {
      headline: '这题先判断：为什么要用 to do？',
      questions: [
        '句子里已经有谓语了吗？如果有，空格先进入非谓语分流。',
        '这里能不能翻成“为了……”？如果能，to do 多半作目的状语。',
        '空前是不是固定搭配或疑问词结构？如 decide/hope/want to do，whether/how/what to do。'
      ],
      wrong: '常错：只看见动词就写 doing，或者漏掉固定搭配里的 to。',
      theory: [
        'to do 常见 4 类：目的、将来/未发生、固定动词后作宾语、形容词后作原因/评价。',
        '课堂复习时可以把同类题串成：whether to do -> hope to do -> to give/to save 表目的 -> to be done 表被动。',
        '如果答案是 to be done，要再追问：宾语/主语是不是承受这个动作。'
      ]
    },
    'nonpredicate-inf-passive': {
      headline: '这题先判断：to do 里面有没有被动？',
      questions: [
        '空格是不是不定式位置？',
        '不定式动作的承受者是谁？',
        '这个承受者是不是句中宾语或被修饰名词？'
      ],
      wrong: '常错：只背 allow sb. to do，却忘了宾语和动作之间可能是被动。',
      theory: [
        'to be done = 不定式 + 被动，常出现在宾补、后置定语、将来被动语境中。',
        '判断顺序：先判 to do，再判主被动。不要一开始就在 doing/done 之间摇摆。'
      ]
    },
    'nonpredicate-ing': {
      headline: '这题先判断：谁主动做这个动作？',
      questions: [
        '空格动词的逻辑主语是谁？',
        '逻辑主语和动作是主动关系吗？',
        '这个 doing 是作定语、状语，还是伴随结果？'
      ],
      wrong: '常错：把句子主语当成唯一逻辑主语，忽略被修饰名词或宾语。',
      theory: [
        'doing 常表主动、进行、伴随或自然结果。',
        '作定语看被修饰词；作状语多看句子主语；作宾补看宾语。'
      ]
    },
    'nonpredicate-done': {
      headline: '这题先判断：谁被做了？',
      questions: [
        '空格前后的名词是谁？',
        '这个名词和动作能不能还原成“被……”？',
        '它是后置定语、状语，还是补语？'
      ],
      wrong: '常错：看到动词就写 doing，没有把名词和动作还原成被动关系。',
      theory: [
        'done 常表被动、完成或状态。',
        '后置定语可以还原成 which/that is/was done。'
      ]
    },
    'word-verb-to-noun': {
      headline: '这题先分流：动词不一定变谓语/非谓语',
      questions: [
        '空前有没有冠词、形容词或介词？',
        '空格在句中是不是作主语、宾语或介词宾语？',
        '如果要名词，这个动词对应的名词形式是什么？'
      ],
      wrong: '常错：看到括号里是动词，就只在谓语和非谓语之间选，忘了第三条路：动词变名词。',
      theory: [
        '动词填空三分流：谓语、非谓语、词性转换。',
        'arrival/recovery/enjoyment/translation 这类题，本质是句子成分要求名词。'
      ]
    },
    'word-adjective': {
      headline: '这题先判断：空格是不是在修饰名词？',
      questions: [
        '空后是不是名词？',
        '空格和别的形容词是不是并列？',
        '这里需要描述“什么样的”吗？'
      ],
      wrong: '常错：看到原词是动词/名词，就忘了空格位置需要形容词。',
      theory: [
        '形容词常作定语、表语、宾补。',
        '判断依据不是中文顺不顺，而是空格在句子里修饰谁。'
      ]
    },
    'word-adverb': {
      headline: '这题先判断：空格修饰动作、形容词，还是整句话？',
      questions: [
        '空格后是不是形容词或整个句子？',
        '空格是不是在说明动作方式/程度？',
        '如果在句首，首字母要不要大写？'
      ],
      wrong: '常错：形容词和副词混用，句首副词忘记大写。',
      theory: [
        '副词修饰动词、形容词、其他副词或整句话。',
        'basically/rarely/visibly/freely 这类题要把修饰对象说清楚。'
      ]
    },
    'word-noun-plural': {
      headline: '这题先判断：这个名词要不要复数？',
      questions: [
        '空前有没有 these、many、several、various 或数词？',
        '空格名词是不是可数名词？',
        '上下文是在说一个，还是一类中的多个？'
      ],
      wrong: '常错：只把原词变成名词，忘了可数名词还要看单复数。',
      theory: [
        '词性转换题不是变出正确词性就结束，还要检查数、大小写和拼写。',
        '可数名词遇到数量提示、并列多个对象、泛指多个类别时，常用复数。'
      ]
    },
    'word-noun-form': {
      headline: '这题先判断：空格是不是名词位置？',
      questions: [
        '空格是不是作主语、宾语或介词宾语？',
        '空前有没有冠词、形容词、所有格或介词？',
        '这个名词形式是否还要考虑单复数？'
      ],
      wrong: '常错：知道要词性转换，但只写出词根附近的形式，没有检查句子成分。',
      theory: [
        '名词位置常由冠词、形容词、介词、及物动词宾语位置提示。',
        '最后一步必须检查拼写和单复数。'
      ]
    },
    'predicate-passive': {
      headline: '这题先判断：主语是做动作，还是被动作？',
      questions: [
        '先找到真正主语，不要被介词短语带跑。',
        '主语能不能自己完成括号里的动作？',
        '如果是被动，be 的时态和单复数由谁决定？'
      ],
      wrong: '常错：只写过去分词，漏掉 be；或者 be 的时态对了，单复数错了。',
      theory: [
        '被动语态 = be + done，be 承担时态、人称、数变化。',
        '课堂上先问主被动，再问时态，顺序不能反。'
      ]
    },
    'predicate-tense': {
      headline: '这题先找时间锚点，再判断叙述视角',
      questions: [
        '句中有没有明确时间状语或上下文时间线？',
        '这是客观事实、过去事件，还是持续到现在？',
        '主语单复数会不会影响谓语形式？'
      ],
      wrong: '常错：只看前一句的时态跟着抄，没有判断本句动作性质。',
      theory: [
        '谓语题至少同时检查：时态、语态、主谓一致。',
        '说明文介绍事实和功能时，常用一般现在时。'
      ]
    },
    'predicate-perfect': {
      headline: '这题先画时间线：过去点到现在',
      questions: [
        '有没有 since、in recent years、over the past years、so far？',
        '动作是否从过去持续到现在，或对现在有影响？',
        '主语是单数还是复数，have/has 怎么选？'
      ],
      wrong: '常错：看到 since 后过去式，就把主句也写成过去式。',
      theory: [
        'since + 过去点常触发现完，主句看“过去到现在”的区间。',
        '现完强调结果、影响或持续，不等于一般过去。'
      ]
    },
    'logic-parallel': {
      headline: '这题先判断：and 连接的是不是同层级信息？',
      questions: [
        'and 前后两个成分在句子里功能是否相同？',
        '语义方向是不是并列、递进或顺承？',
        '并列后面的词形是否要和前面保持一致？'
      ],
      wrong: '常错：只凭中文“和”填 and，却没有检查前后结构是否平行。',
      theory: [
        'and 连接同层级成分，常伴随词形、结构、语义方向的平行。',
        '讲题时可以顺手让学生圈出 and 前后对应块。'
      ]
    },
    'article-indefinite': {
      headline: '这题先判断：是不是单数可数名词第一次出现？',
      questions: [
        '空后名词是不是单数可数？',
        '这里是泛指一个，还是上下文已经明确那个？',
        '后面单词开头发音决定 a 还是 an？'
      ],
      wrong: '常错：按字母选 a/an，忘了真正看的是发音。',
      theory: [
        'a/an 用于泛指单数可数名词；a/an 的选择看发音，不只看字母。',
        '如果对象已经被上下文限定，就转向 the。'
      ]
    },
    'article-specific': {
      headline: '这题先判断：读者是否已经知道是哪一个？',
      questions: [
        '这个名词前文是否出现过？',
        '后面是否有定语把对象限定清楚？',
        '是否指独一无二或语境中特定的对象？'
      ],
      wrong: '常错：只背“第一次 a，第二次 the”，没有看后置定语带来的特指。',
      theory: [
        'the 的核心是特指：说话人和读者都能确定对象。',
        '特指可以来自上文、后置修饰、语境唯一性。'
      ]
    },
    'prep-fixed': {
      headline: '这题不要单看空格，先读前后词块',
      questions: [
        '空前的动词/形容词/名词是否有固定介词搭配？',
        '空后名词和前面动作是什么关系？',
        '如果不是固定搭配，它表达时间、地点、方式、原因还是对象？'
      ],
      wrong: '常错：按中文逐词翻译介词，没有把搭配整体读出来。',
      theory: [
        '介词题常是固定搭配和语义关系混合考。',
        '课堂上先锁搭配，再解释关系。'
      ]
    },
    'pron-possessive': {
      headline: '这题先看空后：有名词就想“谁的”',
      questions: [
        '空后是不是名词？',
        '这个名词属于前文哪个对象？',
        '需要形容词性物主代词，还是名词性物主代词？'
      ],
      wrong: '常错：his/him/he 混用，没有按空格后的名词判断。',
      theory: [
        '形容词性物主代词后必须接名词，名词性物主代词本身相当于名词短语。',
        '先确定指代对象，再确定代词形式。'
      ]
    }
  };
  
  const TRAP_GUIDES = {
    'nonp-question-word-todo': {
      headline: '这题不是普通 to do，而是“是否/怎样/做什么 + to do”',
      questions: [
        '先圈 whether/how/what 等疑问词。',
        '把 whether to do 还原成 whether they should do，看看意思是否完整。',
        '再提醒学生：它整体作宾语，不是普通目的状语。'
      ],
      theory: [
        '疑问词 / whether + to do 在句中整体作名词性成分。',
        '它和普通“动词 + to do”相近，但讲题时要点出前面的疑问词已经锁定结构。'
      ]
    },
    'nonp-purpose-todo': {
      headline: '这题核心是：to do 回答“为了什么”',
      questions: [
        '先问空格动作是不是还没发生、带目的感。',
        '在句中补出 in order to / so as to，看语义是否通顺。',
        '再和 doing 伴随区分：这是目的，不是同时发生。'
      ],
      theory: [
        'to do 作状语高频表示目的，也常带“将要/未发生”的意味。',
        '迁移训练适合串联 to give、to save、to benefit 这类题。'
      ]
    },
    'nonp-verb-object-todo': {
      headline: '这题由空前动词锁定：后面接 to do',
      questions: [
        '先找空前动词，是 decide/hope/want/plan/expect/manage 这一类吗？',
        '判断空格整体是不是作这个动词的宾语。',
        '最后提醒：这是搭配锁定，不要误写 doing。'
      ],
      theory: [
        '部分动词后习惯接 to do 作宾语，课堂上可以积累成“to do 动词名单”。',
        '这类题的迁移重点是搭配，而不是泛泛讲非谓语。'
      ]
    },
    'word-verb-to-noun-branch': {
      headline: '这题要先救回来：动词填空还有第三条路',
      questions: [
        '先问：这道动词填空是不是已经不需要谓语？',
        '再问：空格是不是主语、宾语或介词宾语位置？',
        '最后把原动词变成名词，并检查单复数。'
      ],
      theory: [
        '动词填空三分流：谓语、非谓语、词性转换。',
        'arrival/recovery/translation/appearance 这类题，讲法重点是“句子成分逼出名词”。'
      ]
    },
    'pred-passive-subject-receives': {
      headline: '这题先别急着定时态，先问主语是不是承受动作',
      questions: [
        '先圈主语，划掉中间修饰语。',
        '把主语和动词连起来读：主语能自己做这个动作吗？',
        '如果不能，写 be done，再让 be 跟时态和单复数走。'
      ],
      theory: [
        '被动题讲题顺序：主被动 -> 时态 -> 主谓一致。',
        'be done 里的 be 是变化核心，done 保持过去分词形式。'
      ]
    },
    'nonp-done-postmodifier-passive': {
      headline: '这题是把“被……”的定语从句压缩成 done',
      questions: [
        '先找被修饰名词。',
        '把名词和空格动词还原成 which/that is/was done。',
        '如果还原通顺，就用过去分词作后置定语。'
      ],
      theory: [
        '过去分词作后置定语常表示被动或完成。',
        '它和谓语被动的区别是：句子里已有谓语，done 只是修饰名词。'
      ]
    },
    'word-adv-modifies-adj-verb-sentence': {
      headline: '这题先找修饰对象：副词到底修饰谁？',
      questions: [
        '空格后面是形容词、动词，还是整句话？',
        '能不能翻成“……地/在程度上……”？',
        '如果答案在句首，检查首字母大写。'
      ],
      theory: [
        '副词可修饰动词、形容词、副词或整句。',
        '讲题时不要只说“副词修饰动词”，要让学生指出它具体修饰哪一块。'
      ]
    },
    'word-countable-plural-context': {
      headline: '这题不是只变名词，还要看“几个”',
      questions: [
        '空前有没有数量词或复数提示？',
        '这个名词是否可数？',
        '上下文是在列举多个对象，还是抽象概念？'
      ],
      theory: [
        '词性转换后的最后检查：名词单复数。',
        'these/many/various/不同类别并列，都是复数信号。'
      ]
    },
    'logic-parallel-and': {
      headline: '这题先看 and 前后是不是结构平行',
      questions: [
        '圈出 and 左右两边。',
        '比较它们在句中功能是否一致。',
        '如果是并列，右边的词形要不要跟左边保持同类？'
      ],
      theory: [
        'and 不只是“和”，它常考并列结构与词形一致。',
        '讲题时把左右两边画成两个并排结构，学生更容易看见答案。'
      ]
    },
    'article-a-an-sound': {
      headline: '这题先看名词是否单数可数，再按发音选 a/an',
      questions: [
        '空后是不是单数可数名词？',
        '这里是否泛指一个，而不是特指那个？',
        '后面单词开头是元音音素还是辅音音素？'
      ],
      theory: [
        'a/an 的前提是泛指单数可数名词。',
        'a/an 的选择看音素，不是机械看字母。'
      ]
    },
    'word-adj-before-noun': {
      headline: '这题先看空后名词：这里要“什么样的”',
      questions: [
        '空后是不是名词，空格是否在修饰它？',
        '空格是不是和其他形容词并列？',
        '原词需要变成哪个形容词形式，拼写有没有变化？'
      ],
      theory: [
        '形容词题的核心依据是句子位置：定语、表语、宾补。',
        '讲题时要让学生指出被修饰名词，而不是只说“这里填形容词”。'
      ]
    },
    'word-comparative-superlative-trigger': {
      headline: '这题先找比较信号：than / the / 范围',
      questions: [
        '句中有没有 than、much、even、far 等比较提示？',
        '有没有 in/of 范围或 the 提示最高级？',
        '原词比较级/最高级是否是不规则变化？'
      ],
      theory: [
        '比较级看两者比较，最高级看范围内最……。',
        '比较级和最高级题要同时检查拼写、冠词和语义范围。'
      ]
    },
    'word-word-family-spelling': {
      headline: '这题最后卡在词族拼写：形式对了才算对',
      questions: [
        '先确认空格需要的词性。',
        '再回到这个词族：名词、形容词、副词分别怎么拼？',
        '最后检查大小写、单复数和派生后缀。'
      ],
      theory: [
        '词族题不是“感觉像哪个词”，而是句子成分 + 词族形式 + 拼写检查。',
        '这一类适合作为错题本长期积累，因为错误常来自词形不熟。'
      ]
    },
    'prep-for-purpose-suitability': {
      headline: '这题先问 for 在回答什么：为了谁/为了什么',
      questions: [
        '空后对象是不是动作的目的、受益者或适用对象？',
        '能不能翻成“为了/给/适合”？',
        '它是不是固定搭配的一部分？'
      ],
      theory: [
        'for 高频表示目的、对象、用途、适合性。',
        '介词讲法要把前后词块一起读，不要只翻一个中文。'
      ]
    },
    'prep-to-direction-relation': {
      headline: '这题先看方向和对应关系：to / into 指向哪里',
      questions: [
        '前后有没有方向、转化、连接或对应关系？',
        'to 后面是不是动作/状态指向的对象？',
        'into 是否强调进入或转变成另一种状态？'
      ],
      theory: [
        'to 常表指向、连接、对应；into 常表进入或转化。',
        '这类题要结合动词词块一起讲。'
      ]
    },
    'prep-by-means-or-difference': {
      headline: '这题先判断 by 是“通过”还是“相差”',
      questions: [
        'by 后面是不是方式、工具或手段？',
        '前面是否有 increase/decrease/differ 等差额语境？',
        '如果是被动句，by 后是否引出动作发出者？'
      ],
      theory: [
        'by 可表方式、手段、差额，也可在被动句中引出动作执行者。',
        '讲题时要让学生说清楚这一个 by 的具体功能。'
      ]
    },
    'attrib-which-that-for-things': {
      headline: '这题先看从句缺什么：缺主宾才用关系代词',
      questions: [
        '先找先行词，判断人还是物。',
        '把从句单独读一遍，看缺主语还是宾语。',
        '如果缺成分，再用 which/that 等关系代词补进去。'
      ],
      theory: [
        '定语从句关系代词在从句中要作成分。',
        'which/that 的讲法重点不是中文“哪个”，而是它补了从句里的主语或宾语。'
      ]
    },
    'attrib-where-when-why-complete-clause': {
      headline: '这题先看从句完整不完整：完整才往关系副词走',
      questions: [
        '先找先行词是地点、时间还是原因。',
        '从句主谓宾是否完整？',
        '如果完整，空格作状语，用 where/when/why。'
      ],
      theory: [
        '关系副词不补主宾，它在从句里作状语。',
        '判断 where/when 不能只看先行词，还要看从句是否完整。'
      ]
    },
    'nounclause-what-missing-subject-object': {
      headline: '这题先看从句缺口：what 要补“东西/事情”',
      questions: [
        '从句里缺主语、宾语还是表语？',
        '这个缺口能不能理解成“……的东西/事情”？',
        '如果从句不缺成分，就不能用 what。'
      ],
      theory: [
        'what 在名词性从句中既连接从句，又在从句中作成分。',
        'that 只连接不作成分，what 和 that 的区别要靠从句缺口判断。'
      ]
    },
    'logic-whether-or': {
      headline: '这题先找选择结构：whether...or...',
      questions: [
        '前面有没有 whether 或 either？',
        'or 左右两边是不是两个选择项？',
        '这个结构表达“是否/无论哪一个”，还是普通并列？'
      ],
      theory: [
        'whether...or... 表示是否或两种可能；either...or... 表示二选一。',
        'or 的讲法要从选择关系出发，不只是翻成“或者”。'
      ]
    }
  };
  
  function getFocusGuide(focus) {
    return FOCUS_GUIDES[focus.key] || {
      headline: '这题先问：空格在句子里承担什么功能？',
      questions: [
        '先找句子主干：主语、谓语、宾语在哪里？',
        '再看空格成分：作谓语、非谓语，还是词性转换？',
        '最后结合固定搭配和上下文语义确定答案。'
      ],
      wrong: '常错：先背规则，后看句子；正确顺序应该是先看结构。',
      theory: [focus.note]
    };
  }
  
  function getQuestionTeachingGuide(q, deps) {
    deps = deps || {};
    q = q || {};
    var fallbackFocus = {
      key: q.category || 'other',
      label: q.category_name || q.category || '语法填空',
      note: ''
    };
    var focus = deps.focus
      || (deps.getQuestionFocus ? deps.getQuestionFocus(q) : null)
      || fallbackFocus;
    var base = getFocusGuide(focus);
    var trap = typeof deps.trap !== 'undefined'
      ? deps.trap
      : (deps.getQuestionTrap ? deps.getQuestionTrap(q) : null);
    if (!trap) return base;
    var trapGuide = TRAP_GUIDES[trap.id] || {};
    var wrong = (trap.common_wrong_answers && trap.common_wrong_answers.length)
      ? '常错：' + trap.common_wrong_answers.join('；') + '。'
      : base.wrong;
    return {
      headline: trapGuide.headline || trap.one_liner || base.headline,
      questions: trapGuide.questions || [
        trap.teaching_move || base.questions[0],
        trap.micro_rule || base.questions[1],
        '再判断它和这道题的答案 "' + (q.answer || '') + '" 如何对应。'
      ],
      wrong: trapGuide.wrong || wrong,
      theory: trapGuide.theory || [
        trap.micro_rule || base.theory[0],
        trap.teaching_move || '',
        trap.sources && trap.sources.length ? '来源：' + trap.sources.slice(0, 2).join('；') : ''
      ].filter(Boolean),
      trap: trap,
      focus: focus
    };
  }
  
  function getQuestionLessonPath(q, focus, trap, deps) {
    deps = deps || {};
    q = q || {};
    var categoryMap = deps.categoryMap || {};
    var category = q.category || '';
    var path = [];
    if (category === 'predicate' || category === 'nonpredicate' || category === 'word') {
      path.push('动词填空三分流');
    } else {
      path.push(categoryMap[category] || '语法填空');
    }
  
    if (category === 'predicate') path.push('谓语动词');
    else if (category === 'nonpredicate') path.push('非谓语动词');
    else if (category === 'word') path.push('词性转换');
  
    if (focus && focus.label) {
      var focusPart = focus.label.indexOf('·') >= 0 ? focus.label.split('·').pop().trim() : focus.label;
      if (path.indexOf(focusPart) === -1) path.push(focusPart);
    }
    if (trap && trap.name && path.indexOf(trap.name) === -1) path.push(trap.name);
    return path.slice(0, 4);
  }

  window.GrammarTeachingGuide = {
    FOCUS_GUIDES: FOCUS_GUIDES,
    TRAP_GUIDES: TRAP_GUIDES,
    normalizeTeachingAxes: normalizeTeachingAxes,
    detectPredicateForm: detectPredicateForm,
    getArticleGuide: getArticleGuide,
    getLogicRelation: getLogicRelation,
    getClauseRole: getClauseRole,
    getFocusGuide: getFocusGuide,
    getQuestionTeachingGuide: getQuestionTeachingGuide,
    getQuestionLessonPath: getQuestionLessonPath,
    getQuestionPracticalGuide: getQuestionPracticalGuide,
    buildPracticalGuideCardModel: buildPracticalGuideCardModel,
    buildGuidePanelModel: buildGuidePanelModel,
    buildAnalysisPanelModel: buildAnalysisPanelModel,
    buildSolutionPanelModel: buildSolutionPanelModel,
    normalizeAnalysisFloatKind: normalizeAnalysisFloatKind,
    buildAnalysisFloatClosePlan: buildAnalysisFloatClosePlan,
    buildAnalysisFloatTogglePlan: buildAnalysisFloatTogglePlan,
    buildTheoryPanelModel: buildTheoryPanelModel
  };
})();
