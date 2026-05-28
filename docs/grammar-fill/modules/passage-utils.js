// grammar-fill/modules/passage-utils.js
//
// Pure passage/text helpers. No DOM access and no page state.

/* eslint-disable */
(function(){
  function asText(value, fallback) {
    if (value === null || value === undefined) return fallback || '';
    return String(value);
  }

  function escapeRegExpText(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function findBlankMatch(passage, no) {
    passage = asText(passage);
    no = asText(no);
    if (!passage || !no) return null;
    var re = new RegExp('_{2,}\\s*' + escapeRegExpText(no) + '\\s*_{2,}');
    return re.exec(passage);
  }

  function safeQuestionNo(q) {
    return asText(q && q.no, '');
  }

  function getQuestionSentence(q) {
    q = q || {};
    var no = safeQuestionNo(q);
    var passage = asText(q.passage);
    return extractSentence(passage, no) || asText(q.sentence) || extractContextWindow(passage, no);
  }

  function getQuestionSentenceFallback(q) {
    q = q || {};
    var no = safeQuestionNo(q);
    return getQuestionSentence(q) || (no ? ('___' + no + '___') : '空格上下文不可用');
  }

  function getBlankPrefix(raw, no) {
    raw = asText(raw);
    no = asText(no);
    if (!raw || !no) return '';
    var match = findBlankMatch(raw, no);
    if (match && match.index > 0) {
      var prevChar = raw.charAt(match.index - 1);
      if (/[A-Za-z0-9]/.test(prevChar)) return ' ';
    }
    return '';
  }

  function extractSentence(passage, no) {
    passage = asText(passage);
    no = asText(no);
    var match = findBlankMatch(passage, no);
    var pattern = match ? match[0] : ('___' + no + '___');
    var idx = match ? match.index : passage.indexOf(pattern);
    if (idx === -1) return '';

    var start = 0;
    for (var i = idx - 1; i >= 0; i--) {
      var ch = passage[i];
      if (ch === '.' || ch === '。') { start = i + 1; break; }
    }

    var end = passage.length;
    for (var j = idx + pattern.length; j < passage.length; j++) {
      var next = passage[j];
      if (next === '.' || next === '。') { end = j + 1; break; }
      if (next === '\n' && j + 1 < passage.length && passage[j + 1] === '\n') { end = j; break; }
    }

    return passage.substring(start, end).trim();
  }

  function extractContextWindow(passage, no) {
    passage = asText(passage);
    no = asText(no);
    var match = findBlankMatch(passage, no);
    var pattern = match ? match[0] : ('___' + no + '___');
    var idx = match ? match.index : passage.indexOf(pattern);
    if (idx === -1) return '';
    var start = Math.max(0, idx - 120);
    while (start > 0 && passage[start] !== '.' && passage[start] !== '\n') start--;
    if (passage[start] === '.' || passage[start] === '\n') start++;
    var end = Math.min(passage.length, idx + pattern.length + 120);
    while (end < passage.length && passage[end] !== '.' && passage[end] !== '\n') end++;
    if (passage[end] === '.') end++;
    return passage.substring(start, end).trim();
  }

  function splitTextParagraphs(text) {
    return String(text || '').split(/\n\s*\n/).map(function(p) {
      return p.trim();
    }).filter(Boolean);
  }

  function findParagraphIndexAtOffset(text, offset) {
    var paragraphs = splitTextParagraphs(text);
    var cursor = 0;
    for (var i = 0; i < paragraphs.length; i++) {
      var start = String(text || '').indexOf(paragraphs[i], cursor);
      if (start === -1) continue;
      var end = start + paragraphs[i].length;
      if (offset >= start && offset <= end) return i;
      cursor = end;
    }
    return -1;
  }

  function splitEnglishSentences(paragraph) {
    var text = String(paragraph || '').trim();
    if (!text) return [];
    var parts = [];
    var start = 0;
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      if (ch === '.' || ch === '!' || ch === '?') {
        var end = i + 1;
        while (end < text.length && /["')\]]/.test(text.charAt(end))) end++;
        var sentence = text.substring(start, end).trim();
        if (sentence) parts.push({ text: sentence, start: start, end: end });
        start = end;
        while (start < text.length && /\s/.test(text.charAt(start))) start++;
        i = start - 1;
      }
    }
    if (start < text.length) {
      var tail = text.substring(start).trim();
      if (tail) parts.push({ text: tail, start: start, end: text.length });
    }
    return parts;
  }

  function splitChineseSentences(paragraph) {
    return (String(paragraph || '').match(/[^。！？!?]+[。！？!?]+|[^。！？!?]+$/g) || [])
      .map(function(s) { return s.trim(); })
      .filter(Boolean);
  }

  function getQuestionChineseSentence(q, deps) {
    q = q || {};
    deps = deps || {};
    var zhText = deps.getQuestionTranslationText ? deps.getQuestionTranslationText(q) : (q.chinese_translation || '');
    if (!zhText) return '';

    var passage = asText(q.passage) || asText(deps.currentPassage);
    var match = findBlankMatch(passage, safeQuestionNo(q));
    if (!passage || !match) return '';

    var paragraphIndex = findParagraphIndexAtOffset(passage, match.index);
    var enParagraphs = splitTextParagraphs(passage);
    var zhParagraphs = splitTextParagraphs(zhText);
    if (paragraphIndex < 0 || !zhParagraphs[paragraphIndex]) return '';

    var enParagraph = enParagraphs[paragraphIndex] || '';
    var paragraphStart = passage.indexOf(enParagraph);
    var relativeOffset = paragraphStart >= 0 ? match.index - paragraphStart : -1;
    var enSentences = splitEnglishSentences(enParagraph);
    var sentenceIndex = enSentences.findIndex(function(item) {
      return relativeOffset >= item.start && relativeOffset <= item.end;
    });
    var zhSentences = splitChineseSentences(zhParagraphs[paragraphIndex]);
    if (sentenceIndex >= 0 && zhSentences[sentenceIndex]) return zhSentences[sentenceIndex];
    return zhParagraphs[paragraphIndex] || '';
  }

  window.GrammarPassageUtils = {
    asText: asText,
    escapeRegExpText: escapeRegExpText,
    findBlankMatch: findBlankMatch,
    safeQuestionNo: safeQuestionNo,
    getQuestionSentence: getQuestionSentence,
    getQuestionSentenceFallback: getQuestionSentenceFallback,
    getBlankPrefix: getBlankPrefix,
    extractSentence: extractSentence,
    extractContextWindow: extractContextWindow,
    splitTextParagraphs: splitTextParagraphs,
    findParagraphIndexAtOffset: findParagraphIndexAtOffset,
    splitEnglishSentences: splitEnglishSentences,
    splitChineseSentences: splitChineseSentences,
    getQuestionChineseSentence: getQuestionChineseSentence
  };

  window.extractSentence = extractSentence;
  window.extractContextWindow = extractContextWindow;
})();
