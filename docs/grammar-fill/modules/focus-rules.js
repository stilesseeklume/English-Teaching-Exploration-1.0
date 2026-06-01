// grammar-fill/modules/focus-rules.js
//
// Pure question focus and trap decision rules. No DOM access.

/* eslint-disable */
(function(){
  function getQuestionTextBlob(q, deps) {
    q = q || {};
    deps = deps || {};
    var extractSentence = deps.extractSentence || function(){ return ''; };
    return [
      q.answer,
      q.grammar_point,
      q.category_name,
      q.analysis,
      q.explanation,
      q.sentence,
      q.passage && q.no ? extractSentence(q.passage, q.no) : ''
    ].filter(Boolean).join(' ').toLowerCase();
  }

  function hasExplicitWordCue(text, keyword) {
    return String(text || '').indexOf(keyword) >= 0;
  }

  function hasAdverbCue(answer, blob, grammarPoint) {
    return hasExplicitWordCue(grammarPoint, '副词')
      || /副词|作状语|修饰(?:动词|谓语|形容词|副词)|修饰(?:整个句子|全句|句子整体)/.test(blob)
      || /ly$/i.test(answer);
  }

  function hasAdjectiveCue(answer, blob, grammarPoint) {
    return hasExplicitWordCue(grammarPoint, '形容词')
      || /形容词|作定语|作表语|作宾补|定语|表语|宾补|修饰(?:名词|代词)/.test(blob);
  }

  function getWordExplanationLead(q) {
    return String(((q && (q.explanation || q.analysis)) || ''))
      .replace(/\s+/g, '')
      .slice(0, 100);
  }

  function detectWordFormTarget(q, answer, blob, grammarPoint) {
    q = q || {};
    answer = String(answer || '').trim().toLowerCase();
    blob = String(blob || '');
    grammarPoint = String(grammarPoint || '');
    var fine = String(q.fine_category || '');
    var lead = getWordExplanationLead(q);
    var text = [grammarPoint, blob].filter(Boolean).join(' ');
    if (/^num-plural/.test(fine) || /名词复数|名词的数/.test(grammarPoint)) return 'plural';
    if (/^word-cmp-/.test(fine) || /比较级|最高级/.test(grammarPoint)) return 'comparative';
    var explicitLead = /^(?:[a-z]+\s*)?(?:考查)?名词(?:的数|复数)|^(?:[a-z]+\s*)?名词复数|^(?:[a-z]+\s*)?(?:考查)?名词的数/.test(lead)
      ? 'plural'
      : (/^(?:[a-z]+\s*)?(?:考查)?(?:比较级|最高级)|^(?:[a-z]+\s*)?(?:考查)?形容词比较级|^比较级|^最高级/.test(lead)
        ? 'comparative'
        : (/^(?:[a-z]+\s*)?(?:考查)?副词|^副词[。．]/.test(lead)
          ? 'adverb'
          : (/^(?:[a-z]+\s*)?(?:考查)?形容词|^形容词[。．]/.test(lead)
            ? 'adjective'
            : (/^(?:[a-z]+\s*)?(?:考查|查)?名词[。．]|^(?:[a-z]+\s*)?(?:考查|查)?名词$/.test(lead) ? 'noun' : ''))));
    if (explicitLead) return explicitLead;

    if (fine === 'word-noun-derivation') return 'noun';

    if (hasAdverbCue(answer, blob, grammarPoint)) return 'adverb';
    if (hasAdjectiveCue(answer, blob, grammarPoint)) return 'adjective';
    if (hasExplicitWordCue(grammarPoint, '名词')) return 'noun';

    if (/名词复数|名词的数|复数|these|there are|favourites|themes|interviews|events|wonders/.test(text)) return 'plural';
    if (/比较级|最高级|than|fewer|simpler|further|tougher|broader/.test(text)) return 'comparative';
    if (/需用副词|用副词|应用副词|副词作状语|修饰(?:动词|谓语|形容词|副词|整个句子|全句|句子整体)/.test(text)) return 'adverb';
    if (/需用形容词|用形容词|应用形容词|形容词作(?:定语|表语|宾补)|空(?:格|处)?(?:作|为)?(?:并列)?(?:定语|表语|宾补)|修饰(?:后面的)?名词/.test(text)) return 'adjective';
    if (/空(?:格|处)?(?:应|需|应用|要)?填名词|应填名词|填名词|用名词|应用名词|名词形式|名词作(?:主语|宾语|介词宾语)|作(?:直接)?宾语|介词(?:后|of后|before的宾语|to的宾语)|[a-z]+的名词(?:形式|是|为)/i.test(text)) return 'noun';

    if (/ly$/i.test(answer) && answer.length > 3) return 'adverb';
    if (/(tion|sion|ment|ness|ity|ence|ance|ship|hood|ism|age|ure|dom)$/.test(answer)) return 'noun';
    if (/[a-z]s$/.test(answer) && !/(ous|ss|ess|ness|ious|us)$/.test(answer) && answer.length > 3) return 'plural';
    if (/(ful|less|ous|ive|able|ible|al|ic|ish|ant|ent|y|ary|ory|ical)$/.test(answer)) return 'adjective';
    return 'general';
  }

  function hasBeDoneAnswer(answer) {
    var ans = String(answer || '').trim().toLowerCase();
    var irregularDone = 'built|caught|made|put|set|shown|seen|known|done|drawn|given|taken|written|spoken|chosen|found|left|lost|sent|held|led|told|taught|brought|bought|thought|kept|paid|sold|read|cut';
    return new RegExp('\\b(?:am|is|are|was|were|be|been|being)\\s+(?:[a-z]+(?:ed|en)|' + irregularDone + ')\\b', 'i').test(ans);
  }

  function hasPredicatePassiveCue(q, answer, blob, grammarPoint) {
    var fine = String((q && q.fine_category) || '');
    if (/^pred-passive/.test(fine)) return true;
    if (hasBeDoneAnswer(answer)) return true;
    return /被动语态|被动关系|被动式|构成被动|动宾关系|承受.*动作|\bbe\s*\+\s*done\b|\bbe done\b/.test([grammarPoint, blob].filter(Boolean).join(' '));
  }

  function hasPredicateAgreementCue(q, blob, grammarPoint) {
    var fine = String((q && q.fine_category) || '');
    if (/^pred-sva/.test(fine)) return true;
    return /主谓一致|主语中心词|主语为动名词|主语是不定式|动名词短语|不定式.*主语|第三人称单数|谓语应用单数|谓语用复数|be动词应用/.test([grammarPoint, blob].filter(Boolean).join(' '));
  }

  function hasPredicatePerfectCue(q, blob) {
    var fine = String((q && q.fine_category) || '');
    return /^pred-tense-(?:past-)?perfect/.test(fine)
      || /完成时|现在完成|过去完成|\b(?:since|so far|over the past|ever since)\b|\b(?:has|have|had)\s+been\b/.test(blob);
  }

  function hasPredicatePastCue(q, blob) {
    var fine = String((q && q.fine_category) || '');
    return /^pred-tense-past/.test(fine)
      || /过去|一般过去|\bin 20\d\d\b|\b(?:last|ago|wished)\b|as a little girl|recent ceremony|明清|dynasties/.test(blob);
  }

  function getTrapById(id, deps) {
    var trapData = (deps && deps.trapData) || {};
    return id ? (trapData.trap_index && trapData.trap_index[id]) : null;
  }

  function inferQuestionTrapId(q, deps) {
    deps = deps || {};
    if (!q) return '';
    if (q.trap_id && getTrapById(q.trap_id, deps)) return q.trap_id;
    var answer = String(q.answer || '').trim().toLowerCase();
    var blob = getQuestionTextBlob(q, deps);
    var grammarPoint = String(q.grammar_point || '');
    var category = q.category || '';

    if (category === 'nonpredicate') {
      if (/^to\s+be\b/.test(answer)) return 'nonp-todo-passive-complement';
      if (/^to\b/.test(answer)) {
        if (/\b(?:whether|how|what|where|when|which)\b|疑问词/.test(blob)) return 'nonp-question-word-todo';
        if (/目的|为了|\bin order to\b|\bso as to\b|以便|\bto (?:give|save|benefit)\b/.test(blob)) return 'nonp-purpose-todo';
        if (/\b(?:first|last|only|best)\b|序数词|最高级/.test(blob)) return 'nonp-first-last-only-todo';
        return 'nonp-verb-object-todo';
      }
      if (/ing$/.test(answer)) {
        if (/介词|动名词|作宾语|\b(?:beyond|after|before|by|without)\b|to doing/.test(blob)) return 'nonp-gerund-after-prep';
        if (/定语|修饰|后置定语|被修饰词/.test(blob)) return 'nonp-ing-postmodifier-active';
        if (/宾补|补足语|leave|find|keep|see|hear/.test(blob)) return 'nonp-object-complement-active';
        return 'nonp-ing-adverbial-active';
      }
      if (/过去分词|被动|动宾关系|逻辑上的动宾|逻辑动宾/.test(blob) || /(ed|en|wn)$/.test(answer)) {
        if (/状语|句首|原因|条件|时间/.test(blob)) return 'nonp-done-adverbial-passive';
        return 'nonp-done-postmodifier-passive';
      }
      return 'nonp-finite-or-nonfinite';
    }

    if (category === 'predicate') {
      if (hasPredicatePassiveCue(q, answer, blob, grammarPoint)) return 'pred-passive-subject-receives';
      if (/动名词短语|不定式.*主语|主语为动名词|主语是不定式/.test(blob)) return 'pred-gerund-subject-singular';
      if (hasPredicatePerfectCue(q, blob)) return 'pred-present-perfect-since';
      if (hasPredicatePastCue(q, blob)) return 'pred-past-time-marker';
      if (hasPredicateAgreementCue(q, blob, grammarPoint)) return 'pred-subject-core-not-modifier';
      return 'pred-objective-present';
    }

    if (category === 'word') {
      var wordTarget = detectWordFormTarget(q, answer, blob, grammarPoint);
      if (wordTarget === 'plural') return 'word-countable-plural-context';
      if (wordTarget === 'adverb') return 'word-adv-modifies-adj-verb-sentence';
      if (wordTarget === 'adjective') return 'word-adj-before-noun';
      if (/比较级|最高级|than|simpler|further/.test(blob)) return 'word-comparative-superlative-trigger';
      if (wordTarget === 'comparative') return 'word-comparative-superlative-trigger';
      if (wordTarget === 'noun') return 'word-verb-to-noun-branch';
      return 'word-word-family-spelling';
    }

    if (category === 'article') {
      if (/\b(?:first|earliest|last|only)\b|最高级|序数词/.test(blob)) return 'article-superlative-the';
      if (/touch of|for the first time|固定/.test(blob)) return 'article-fixed-phrase';
      if (/特指|中心|heart|language used/.test(blob) || answer === 'the') return 'article-specific-the';
      if (/元音|辅音|a\/an|\ban\b/.test(blob) || answer === 'a' || answer === 'an') return 'article-a-an-sound';
      return 'article-generic-single-countable';
    }

    if (category === 'pronoun') {
      if (/myself|itself|反身/.test(blob) || /self$/.test(answer)) return 'pron-reflexive-same-subject';
      if (answer === 'it') return 'pron-it-reference';
      if (/^(one|ones)$/.test(answer)) return 'pron-one-ones-substitution';
      if (/people's|所有格/.test(blob)) return 'pron-possessive-noun-peoples';
      return 'pron-possessive-before-noun';
    }

    if (category === 'preposition') {
      if (answer === 'by') return 'prep-by-means-or-difference';
      if (answer === 'as') return 'prep-as-role';
      if (answer === 'for') return 'prep-for-purpose-suitability';
      if (answer === 'to' || answer === 'into') return 'prep-to-direction-relation';
      if (answer === 'with') return 'prep-with-tool-or-accompaniment';
      return 'prep-fixed-collocation';
    }

    if (category === 'logic') {
      if (/\b(?:whether|either)\b/.test(blob) || answer === 'or') return 'logic-whether-or';
      if (/\bnot (?:just|only)\b/.test(blob) || answer === 'but') return 'logic-not-only-but-also';
      if (answer === 'so') return 'logic-cause-result-so';
      if (answer === 'and') return 'logic-parallel-and';
      return 'logic-contrast-but';
    }

    if (category === 'attrib') {
      if (answer === 'whose') return 'attrib-whose-possessive';
      if (/^(where|when|why)$/.test(answer)) return 'attrib-where-when-why-complete-clause';
      if (/非限制|逗号/.test(blob)) return 'attrib-nonrestrictive-no-that';
      if (answer === 'what') return 'attrib-what-not-relative-pronoun';
      return 'attrib-which-that-for-things';
    }

    if (category === 'nounclause') {
      if (answer === 'what') return 'nounclause-what-missing-subject-object';
      if (answer === 'why') return 'nounclause-why-predicative-reason';
      if (answer === 'how') return 'nounclause-how-degree-or-manner';
      if (/^(whether|if)$/.test(answer)) return 'nounclause-whether-if';
      return 'nounclause-connector-role';
    }

    if (category === 'advclause') {
      if (answer === 'when') return 'advclause-when-vs-attrib-when';
      if (/^(although|though)$/.test(answer)) return 'advclause-although-no-but';
      if (/^(because|since|as)$/.test(answer)) return 'advclause-because-since-as';
      return 'advclause-time-main-future-sub-present';
    }

    return '';
  }

  function getQuestionTrap(q, deps) {
    return getTrapById(inferQuestionTrapId(q, deps), deps);
  }

  function getQuestionTrapId(q, deps) {
    var trap = getQuestionTrap(q, deps);
    return trap ? trap.id : '';
  }

  function getQuestionFocus(q, deps) {
    deps = deps || {};
    q = q || {};
    var answer = String(q.answer || '').trim().toLowerCase();
    var blob = getQuestionTextBlob(q, deps);
    var category = q.category || '';
    var grammarPoint = String(q.grammar_point || '');
    var inferredTrapId = inferQuestionTrapId(q, deps);
    var categoryMap = deps.categoryMap || {};
    var categoryTips = deps.categoryTips || {};

    if (category === 'nonpredicate') {
      if (/^to\s+be\b/.test(answer)) return { key: 'nonpredicate-inf-passive', label: '非谓语 · to be done（不定式被动）', note: '先按不定式处理，再判断宾语/主语与动作是否为被动关系。' };
      if (/^to\b/.test(answer)) return { key: 'nonpredicate-infinitive', label: '非谓语 · to do（动词不定式）', note: '聚焦不定式：目的、固定搭配、疑问词 + to do、形容词后 to do。' };
      if (/ing$/.test(answer)) {
        if (/介词|动名词|作宾语|宾语/.test(blob)) return { key: 'nonpredicate-gerund', label: '非谓语 · doing（动名词/介词宾语）', note: '看它是不是在介词后或作名词性成分。' };
        return { key: 'nonpredicate-ing', label: '非谓语 · doing（现在分词）', note: '看逻辑主语与动作是否主动，或是否表示伴随/进行。' };
      }
      if (/过去分词|被动|动宾关系|逻辑上的动宾/.test(blob) || /(ed|en|wn)$/.test(answer)) return { key: 'nonpredicate-done', label: '非谓语 · done（过去分词）', note: '看被修饰词/逻辑主语与动作是否构成被动或完成关系。' };
      return { key: 'nonpredicate-general', label: '非谓语 · 综合判断', note: '先分清谓语/非谓语，再找逻辑主语。' };
    }

    if (category === 'predicate') {
      // 优先信任题库 fine_category（权威主考点）；缺失才回退关键词启发式
      var pf = q.fine_category || '';
      var pfac = q.facets || {};
      if (pf === 'pred-agreement') return { key: 'predicate-agreement', label: '谓语 · 主谓一致', note: '找主语中心词，不要被修饰语带跑。' };
      if (pf === 'pred-passive') return { key: 'predicate-passive', label: '谓语 · 被动语态', note: '先问主语是执行动作，还是承受动作。' };
      if (pf === 'pred-tense') {
        if (pfac.tense === 'perfect' || pfac.tense === 'perfect-progressive') return { key: 'predicate-perfect', label: '谓语 · 完成时', note: '看动作是否从过去延续/影响到现在，或发生在过去的过去。' };
        if (pfac.tense === 'past') return { key: 'predicate-past', label: '谓语 · 过去时间', note: '时间背景落在过去，先定过去时。' };
        if (pfac.tense === 'present') return { key: 'predicate-present', label: '谓语 · 一般现在', note: '语境是客观事实或常态，谓语多用一般现在。' };
        return { key: 'predicate-tense', label: '谓语 · 时态判断', note: '先找时间锚点，再看语境。' };
      }
      if (hasPredicatePassiveCue(q, answer, blob, grammarPoint)) return { key: 'predicate-passive', label: '谓语 · 被动语态', note: '先问主语是执行动作，还是承受动作。' };
      if (hasPredicatePerfectCue(q, blob)) return { key: 'predicate-perfect', label: '谓语 · 完成时', note: '看动作是否从过去延续/影响到现在，或发生在过去的过去。' };
      if (hasPredicateAgreementCue(q, blob, grammarPoint)) return { key: 'predicate-agreement', label: '谓语 · 主谓一致', note: '找主语中心词，不要被修饰语带跑。' };
      return { key: 'predicate-tense', label: '谓语 · 时态判断', note: '先找时间锚点，再看语境。' };
    }

    if (category === 'word') {
      var wordTarget = detectWordFormTarget(q, answer, blob, grammarPoint);
      if (wordTarget === 'plural') return { key: 'word-noun-plural', label: '词性转换 · 名词复数', note: '先判断是否可数，再找数量和上下文提示。' };
      if (wordTarget === 'adverb') return { key: 'word-adverb', label: '词性转换 · 副词', note: '副词修饰动作、形容词、其他副词或整句话。' };
      if (wordTarget === 'adjective') return { key: 'word-adjective', label: '词性转换 · 形容词', note: '形容词常作定语、表语、宾补。' };
      if (wordTarget === 'comparative') return { key: 'word-comparative', label: '词性转换 · 比较级/最高级', note: '先找比较信号，再处理比较级或最高级形式。' };
      if (wordTarget === 'noun') return { key: 'word-noun-form', label: '词性转换 · 名词形式', note: '看空格是否作主语、宾语或介词宾语。' };
      return { key: 'word-general', label: '词性转换 · 词类判断', note: '先看句子成分，再定词性。' };
    }

    if (category === 'attrib') {
      if (/whose/.test(answer)) return { key: 'attrib-whose', label: '定语从句 · whose 所属关系', note: '空后有名词且表示“谁的/其……”。' };
      if (/^(where|when|why)$/.test(answer)) return { key: 'attrib-relative-adverb', label: '定语从句 · 关系副词', note: '从句主谓宾完整，空格作时间/地点/原因状语。' };
      return { key: 'attrib-relative-pronoun', label: '定语从句 · 关系代词', note: '从句缺主语或宾语，关系词要补成分。' };
    }

    if (category === 'article') {
      if (inferredTrapId === 'article-superlative-the' || /\b(?:first|earliest|last|only)\b|最高级|序数词/.test(blob)) return { key: 'article-superlative', label: '冠词 · 序数词/最高级前 the', note: 'first、earliest、most 等前面常用 the。' };
      if (inferredTrapId === 'article-fixed-phrase' || /固定|touch of|for the first time/.test(blob)) return { key: 'article-fixed', label: '冠词 · 固定短语', note: '固定表达先整体识别，再解释冠词。' };
      if (inferredTrapId === 'article-specific-the' || answer === 'the' || /特指|上文|中心|heart|language used/.test(blob)) return { key: 'article-specific', label: '冠词 · the 表特指', note: '能指向上下文明确对象时用 the。' };
      return { key: 'article-indefinite', label: '冠词 · a/an 泛指单数', note: '单数可数名词第一次出现或泛指一类，用 a/an。' };
    }

    if (category === 'logic') {
      if (/whether|either/.test(blob) || answer === 'or') return { key: 'logic-choice', label: '逻辑连词 · 选择/是否', note: 'whether...or... 和 either...or... 都要看选择关系。' };
      if (/not just|not only/.test(blob) || answer === 'but') return { key: 'logic-progression', label: '逻辑连词 · 递进结构', note: 'not only/not just 常与 but also/but 搭配。' };
      if (answer === 'and') return { key: 'logic-parallel', label: '逻辑连词 · and 并列', note: 'and 连接同层级、同功能、同方向信息。' };
      if (answer === 'so') return { key: 'logic-result', label: '逻辑连词 · 因果结果', note: '后句是前句自然结果时用 so。' };
      return { key: 'logic-contrast', label: '逻辑连词 · 转折对比', note: '前后语义方向相反或让步转折。' };
    }

    if (category === 'preposition') {
      if (answer === 'by') return { key: 'prep-by', label: '介词 · by 表方式/差额', note: 'by 可表“通过……方式”或“相差……”。' };
      if (answer === 'as') return { key: 'prep-as', label: '介词 · as 表身份/作为', note: 'as 后接身份、角色、功能。' };
      if (answer === 'for') return { key: 'prep-for', label: '介词 · for 表目的/对象', note: 'for 常回答“为了谁/为了什么/适合什么”。' };
      if (answer === 'to' || answer === 'into') return { key: 'prep-to', label: '介词 · to/into 表方向关系', note: 'to/into 常表示方向、转化或对应关系。' };
      if (answer === 'with') return { key: 'prep-with', label: '介词 · with 表工具/伴随', note: 'with 常表示“带着/用……/伴随”。' };
      return { key: 'prep-fixed', label: '介词 · 固定搭配', note: '介词题多数要把前后词块一起读。' };
    }

    if (category === 'pronoun') {
      if (/myself|itself|反身/.test(blob) || /self$/.test(answer)) return { key: 'pron-reflexive', label: '代词 · 反身代词', note: '主宾同一对象或强调“亲自/本身”时用反身代词。' };
      if (answer === 'it') return { key: 'pron-it', label: '代词 · it 指代/形式主语', note: 'it 可回指前文事物，也可作形式主语/宾语。' };
      if (/^(one|ones)$/.test(answer)) return { key: 'pron-one', label: '代词 · one/ones 替代', note: 'one/ones 替代同类名词，避免重复。' };
      return { key: 'pron-possessive', label: '代词 · 形容词性物主代词', note: '空后有名词时，常先考虑“谁的”。' };
    }

    if (category === 'nounclause') {
      if (answer === 'what') return { key: 'nounclause-what', label: '名词性从句 · what 补成分', note: '从句缺主语/宾语/表语且表示“……的东西/事情”。' };
      if (/^(whether|if)$/.test(answer)) return { key: 'nounclause-whether', label: '名词性从句 · whether/if 是否', note: '表示“是否”，且不在从句中作成分。' };
      if (answer === 'why') return { key: 'nounclause-why', label: '名词性从句 · why 表原因', note: 'why 在从句中作原因状语。' };
      if (answer === 'how') return { key: 'nounclause-how', label: '名词性从句 · how 表方式/程度', note: 'how 在从句中作方式或程度状语。' };
      return { key: 'nounclause-that', label: '名词性从句 · that 不作成分', note: '从句完整、只需连接，常用 that。' };
    }

    if (category === 'advclause') {
      if (/^(although|though)$/.test(answer)) return { key: 'advclause-concession', label: '状语从句 · although/though 让步', note: 'although/though 不和 but 连用。' };
      if (/^(because|since|as)$/.test(answer)) return { key: 'advclause-cause', label: '状语从句 · 原因', note: '后句解释原因或背景。' };
      if (answer === 'when') return { key: 'advclause-time', label: '状语从句 · when 时间', note: 'when 引导时间状语从句，不修饰名词。' };
      return { key: 'advclause-relation', label: '状语从句 · 主从句逻辑关系', note: '先判断主从句之间是时间、原因、条件、让步还是结果。' };
    }

    return { key: category || 'other', label: categoryMap[category] || category || '语法填空', note: categoryTips[category] || '先判空格成分，再确定答案方向。' };
  }

  function getQuestionFocusKey(q, deps) {
    return getQuestionFocus(q, deps).key;
  }

  window.GrammarFocusRules = {
    getQuestionTextBlob: getQuestionTextBlob,
    hasExplicitWordCue: hasExplicitWordCue,
    hasAdverbCue: hasAdverbCue,
    hasAdjectiveCue: hasAdjectiveCue,
    getWordExplanationLead: getWordExplanationLead,
    detectWordFormTarget: detectWordFormTarget,
    hasBeDoneAnswer: hasBeDoneAnswer,
    hasPredicatePassiveCue: hasPredicatePassiveCue,
    hasPredicateAgreementCue: hasPredicateAgreementCue,
    hasPredicatePerfectCue: hasPredicatePerfectCue,
    hasPredicatePastCue: hasPredicatePastCue,
    getTrapById: getTrapById,
    inferQuestionTrapId: inferQuestionTrapId,
    getQuestionTrap: getQuestionTrap,
    getQuestionTrapId: getQuestionTrapId,
    getQuestionFocus: getQuestionFocus,
    getQuestionFocusKey: getQuestionFocusKey
  };
})();
