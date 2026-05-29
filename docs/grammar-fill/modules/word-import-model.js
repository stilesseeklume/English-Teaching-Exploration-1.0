// grammar-fill/modules/word-import-model.js
//
// Pure helpers for Word/AI import preprocessing. Browser APIs, network calls,
// storage, dialogs, and DOM rendering stay in shared/word-import.js.

/* eslint-disable */
(function(){
  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function normalizeImportText(text) {
    return String(text || '')
      .replace(/\u200e|\u200f/g, '')
      .replace(/\\r\\n|\\n|\\r/g, '\n')
      .replace(/\r\n?/g, '\n')
      .replace(/\u00a0/g, ' ')
      .trim();
  }

  function isPassageTitle(line) {
    var s = String(line || '').trim();
    if (!s) return false;
    if (/^【/.test(s)) return false;
    if (/^[一二三四五六七八九十]+[、.]/.test(s) && /语法填空|英语试题|英语试卷/.test(s)) return true;
    if (/^\d{1,3}[.、．]\s*\S/.test(s) && /语法填空|英语试题|英语试卷|质量|检测|联考|模拟|期末|月考|一模|二模|高考|届|省|市|区|中学/.test(s)) return true;
    if (/^(Passage|Text|Article)\s*\d+/i.test(s)) return true;
    if (/^[（(]\d{1,2}[）)]\s*$/.test(s)) return true;
    if (/^\d{1,2}\s+.{0,30}[省市区县]/.test(s)) return true;
    if (/^第\s*\d+\s*[套篇段卷]/.test(s)) return true;
    return false;
  }

  function titleKey(title) {
    return String(title || '')
      .replace(/^\s*\d{1,3}[.、．]\s*/, '')
      .replace(/\s+/g, '')
      .replace(/[（）()·\-—_]/g, '')
      .trim();
  }

  function countBlankMarkers(text) {
    var m = String(text || '').match(/_{2,}\s*\d{1,3}\s*_{2,}/g);
    return m ? m.length : 0;
  }

  function normalizeBlankMarkers(text) {
    return String(text || '').replace(/_{2,}\s*(\d{1,3})\s*_{2,}/g, function(_m, no) {
      return '___' + String(parseInt(no, 10)) + '___';
    });
  }

  function extractBlankNos(text) {
    var out = [];
    var seen = {};
    String(text || '').replace(/_{2,}\s*(\d{1,3})\s*_{2,}/g, function(_m, no) {
      var n = parseInt(no, 10);
      if (!seen[n]) {
        seen[n] = true;
        out.push(n);
      }
      return _m;
    });
    return out;
  }

  function splitByTitle(text) {
    var lines = normalizeImportText(text).split('\n');
    var chunks = [];
    var cur = null;
    lines.forEach(function(line) {
      if (isPassageTitle(line)) {
        if (cur) chunks.push(cur);
        cur = { title: line.trim(), lines: [line] };
      } else if (cur) {
        cur.lines.push(line);
      }
    });
    if (cur) chunks.push(cur);
    return chunks;
  }

  function splitByParagraph(text) {
    var paras = String(text || '').split(/\n+/).map(function(line) {
      return line.trim();
    }).filter(Boolean);
    var chunks = [];
    var curLines = [];
    var pendingTitle = null;
    var idx = 0;

    function flushChunk() {
      var content = curLines.join('\n');
      if (content.length >= 300 && /[a-zA-Z]{3,}/.test(content)) {
        idx++;
        chunks.push({ title: pendingTitle || ('篇章 ' + idx), lines: curLines.slice() });
      }
      curLines = [];
      pendingTitle = null;
    }

    paras.forEach(function(para) {
      var hasEnglish = /[a-zA-Z]{3,}/.test(para);
      var isShortChinese = !hasEnglish && para.length < 60 && /[一-鿿]/.test(para);
      if (isShortChinese) {
        if (curLines.join('\n').length > 500) flushChunk();
        pendingTitle = para;
      } else {
        curLines.push(para);
      }
    });
    flushChunk();
    return chunks;
  }

  function extractAnswersFromChunk(text) {
    var s = normalizeImportText(text);
    var ansPos = s.indexOf('【答案】');
    if (ansPos === -1) return {};
    var end = s.indexOf('【解析】', ansPos);
    var block = (end === -1 ? s.slice(ansPos) : s.slice(ansPos, end))
      .replace(/【答案】/g, ' ')
      .replace(/\r?\n/g, ' ');
    var answers = {};
    var re = /(\d{1,3})[.．、]\s*([^\d]+?)(?=\s+\d{1,3}[.．、]|$)/g;
    var m;
    while ((m = re.exec(block))) {
      var no = parseInt(m[1], 10);
      var ans = String(m[2] || '')
        .replace(/^[：:\s]+/, '')
        .replace(/[；;，,。]+$/g, '')
        .trim();
      if (ans) answers[no] = ans;
    }
    return answers;
  }

  function buildFallbackBlanks(passage, answers) {
    var nos = extractBlankNos(passage);
    return nos.map(function(no) {
      var answer = (answers && answers[no]) || '?';
      return {
        no: no,
        answer: answer,
        category: 'word',
        analysis: answer === '?' ? '暂未识别到答案，可在导入后手动修正。' : ('答案：' + answer + '。')
      };
    });
  }

  function buildUnnamedChunk(normalized) {
    return {
      title: '未命名 1',
      text: normalized,
      answers: {},
      fallback: {
        title: '未命名 1',
        passage: normalizeBlankMarkers(normalized),
        blanks: buildFallbackBlanks(normalized, {})
      }
    };
  }

  function buildDocxBatchPlan(text, options) {
    options = options || {};
    var maxBatchChunks = Number(options.maxBatchChunks) || 80;
    var fallbackLengthThreshold = Number(options.fallbackLengthThreshold) || 15000;
    var normalized = normalizeImportText(text);
    var rawChunks = splitByTitle(normalized);
    var usedFallback = false;

    if (rawChunks.length === 0 && normalized.length > fallbackLengthThreshold) {
      rawChunks = splitByParagraph(normalized);
      usedFallback = rawChunks.length > 0;
    }

    if (rawChunks.length === 0) {
      return {
        normalizedText: normalized,
        usedFallback: usedFallback,
        chunks: [buildUnnamedChunk(normalized)]
      };
    }

    var answerByKey = {};
    rawChunks.forEach(function(chunk) {
      var block = chunk.lines.join('\n');
      var answers = extractAnswersFromChunk(block);
      if (Object.keys(answers).length > 0) answerByKey[titleKey(chunk.title)] = answers;
    });

    var chunks = [];
    rawChunks.forEach(function(chunk) {
      var block = chunk.lines.join('\n');
      if (block.length < 200 || !/[a-zA-Z]{3,}/.test(block)) return;
      var cut = block;
      var ansPos = cut.indexOf('【答案】');
      if (ansPos !== -1) cut = cut.slice(0, ansPos);
      var parseText = normalizeBlankMarkers(cut);
      var answers = answerByKey[titleKey(chunk.title)] || extractAnswersFromChunk(block) || {};
      chunks.push({
        title: chunk.title.trim(),
        text: parseText,
        answers: answers,
        fallback: {
          title: chunk.title.trim(),
          passage: parseText,
          blanks: buildFallbackBlanks(parseText, answers)
        }
      });
    });

    if (chunks.length === 0) chunks.push(buildUnnamedChunk(normalized));
    return {
      normalizedText: normalized,
      usedFallback: usedFallback,
      chunks: chunks.slice(0, maxBatchChunks)
    };
  }

  function mergeAnswersIntoPassage(passage, answers) {
    if (!answers) return passage;
    passage.blanks = asArray(passage.blanks).map(function(blank) {
      var no = parseInt(blank.no, 10);
      if ((!blank.answer || blank.answer === '?') && answers[no]) blank.answer = answers[no];
      return blank;
    });
    return passage;
  }

  function normalizeParsedPassages(parsed, fallbackTitle, fallbackAnswers) {
    var passagesArr = [];
    if (Array.isArray(parsed)) {
      passagesArr = parsed;
    } else if (parsed && Array.isArray(parsed.passages)) {
      passagesArr = parsed.passages;
    } else if (parsed && parsed.passage && Array.isArray(parsed.blanks)) {
      passagesArr = [parsed];
    } else {
      throw new Error('AI 返回的数据格式不正确：\n' + JSON.stringify(parsed).substring(0, 300));
    }

    return passagesArr.filter(function(passage) {
      return passage && (passage.passage || (Array.isArray(passage.blanks) && passage.blanks.length));
    }).map(function(passage, idx) {
      var item = {
        title: (passage.title && String(passage.title).trim()) || fallbackTitle || ('未命名 ' + (idx + 1)),
        passage: normalizeBlankMarkers(passage.passage || ''),
        blanks: asArray(passage.blanks)
      };
      item.blanks = item.blanks.map(function(blank, blankIdx) {
        blank = blank || {};
        var no = parseInt(blank.no, 10);
        return {
          no: isNaN(no) ? (blankIdx + 1) : no,
          answer: (blank.answer || '?').toString().trim(),
          category: blank.category || 'word',
          fine_category: blank.fine_category || '',
          analysis: (blank.analysis || '').toString().trim(),
          nonp_function: blank.nonp_function || '',
          nonp_function_label: blank.nonp_function_label || '',
          nonp_form: blank.nonp_form || '',
          nonp_form_label: blank.nonp_form_label || '',
          nonp_rule: blank.nonp_rule || '',
          nonp_needs_review: !!blank.nonp_needs_review
        };
      });
      return mergeAnswersIntoPassage(item, fallbackAnswers);
    });
  }

  function repairPassageMarkers(passage) {
    passage = passage || {};
    passage.passage = normalizeBlankMarkers(passage.passage || '');
    passage.blanks = asArray(passage.blanks);
    var markerNos = extractBlankNos(passage.passage);
    var markerSet = {};
    markerNos.forEach(function(no) { markerSet[no] = true; });
    if (markerNos.length === 0 && passage.blanks.length > 0) {
      passage.passage += '\n\n' + passage.blanks.map(function(blank) {
        return '___' + blank.no + '___';
      }).join(' ');
      return passage;
    }
    var missing = passage.blanks.filter(function(blank) {
      return !markerSet[parseInt(blank.no, 10)];
    });
    if (missing.length > 0) {
      passage.passage += '\n\n未定位空格：' + missing.map(function(blank) {
        return '___' + blank.no + '___';
      }).join(' ');
    }
    return passage;
  }

  function finalizePassages(passagesArr) {
    passagesArr = asArray(passagesArr).map(repairPassageMarkers);
    var seenSigs = {};
    passagesArr = passagesArr.filter(function(passage) {
      var sig = asArray(passage.blanks).map(function(blank) {
        return (blank.no || '') + '=' + (blank.answer || '').trim();
      }).sort(function(a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
      }).join('|');
      if (!sig) return true;
      if (seenSigs[sig]) return false;
      seenSigs[sig] = passage;
      return true;
    });
    passagesArr = passagesArr.filter(function(passage) {
      return passage.blanks && passage.blanks.length > 0;
    });

    var titleCount = {};
    passagesArr.forEach(function(passage) {
      titleCount[passage.title] = (titleCount[passage.title] || 0) + 1;
    });
    var titleIdx = {};
    return passagesArr.map(function(passage) {
      if (titleCount[passage.title] > 1) {
        titleIdx[passage.title] = (titleIdx[passage.title] || 0) + 1;
        passage.title = passage.title + ' · 第' + titleIdx[passage.title] + '篇';
      }
      return passage;
    });
  }

  window.GrammarWordImportModel = {
    asArray: asArray,
    normalizeImportText: normalizeImportText,
    isPassageTitle: isPassageTitle,
    titleKey: titleKey,
    countBlankMarkers: countBlankMarkers,
    normalizeBlankMarkers: normalizeBlankMarkers,
    extractBlankNos: extractBlankNos,
    splitByTitle: splitByTitle,
    splitByParagraph: splitByParagraph,
    extractAnswersFromChunk: extractAnswersFromChunk,
    buildFallbackBlanks: buildFallbackBlanks,
    buildDocxBatchPlan: buildDocxBatchPlan,
    mergeAnswersIntoPassage: mergeAnswersIntoPassage,
    normalizeParsedPassages: normalizeParsedPassages,
    repairPassageMarkers: repairPassageMarkers,
    finalizePassages: finalizePassages
  };
})();
