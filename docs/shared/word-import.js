// shared/word-import.js
//
// Word 文档上传 → Mammoth 提取文本 → DeepSeek AI 解析 → 统一导入对话框
// → 写入错题本 / 备课资料。
//
// 这一整套是 v1 最复杂的功能，集中放在一个文件以便未来升级（换 LLM、改 prompt、
// 加图片识别、加 PDF 等）只动一处。
//
// 依赖（必须先加载）：
//   - shared/cloud.js          window._sb / window.SUPABASE_URL
//   - shared/error-book.js     window.errorBookQuestions / saveErrorBook / getErrorFingerprint
//   - shared/lesson-prep.js    window.prepPassages / savePrepPassages / getPrepFingerprint
//   - 外部 CDN：mammoth.browser.min.js
//
// 题型侧（grammar-fill/index.html）必须提供（通过 window）：
//   - CATEGORY_MAP / CATEGORY_TIPS（语法填空考点映射，固定到 window）
//   - extractSentence(passage, no) / extractContextWindow(passage, no)（提取空格所在句子）
//   - renderPrepList() / renderErrorBook() / renderBankStat()（重渲染列表）
//   - uploadLocalToCloud()（导入后异步推云，可选）
//   - HTML 元素：
//       #docxFileInput（type=file，change 事件由 processDocxFile 处理）
//       #aiOverlay, #aiOverlayTitle, #aiOverlayDesc, #aiProgressBar, #aiStageList
//       #importDemoPopover（可选，hover 演示）
//       #unifiedImportOverlay, #unifiedImportTitle, #unifiedImportBody,
//         #unifiedImportSummary, #unifiedSelectedCount
//       #prepBatchJson, #prepBatchForm（fallback 文本回填）
//
// 未来 v2 完形/阅读复用时：
//   - 提供自己的 CATEGORY_MAP 等结构
//   - 或者改造 word-import.js 接受"题型适配器"参数（更彻底的清理，留待 v2 启动前再做）

/* eslint-disable */
(function(){
  var _docxImportTarget = 'prep'; // 'prep' | 'error'
  var _demoTimer = null;
  var _abortAiParse = false;
  var _aiDriftTimer = null;
  var _aiDriftTarget = 0;
  var _unifiedImportData = null;
  var _splitUsedFallback = false; // 标记本次是否用了启发式兜底切割
  var BATCH_PARSE_CHAR_LIMIT = 25000;
  var MAX_BATCH_CHUNKS = 80;
  var PARSE_CONCURRENCY = 3;

  // ─── Hover 演示（可选）─────────────────────────
  function showImportDemo(e) {
    clearTimeout(_demoTimer);
    var popover = document.getElementById('importDemoPopover');
    if (!popover) return;
    var btn = e.currentTarget;
    var rect = btn.getBoundingClientRect();
    popover.style.top = (rect.bottom + 8) + 'px';
    popover.style.left = Math.min(rect.left, window.innerWidth - 620) + 'px';
    popover.classList.add('show');
    popover.onmouseenter = function() { clearTimeout(_demoTimer); };
    popover.onmouseleave = function() { hideImportDemo(); };
  }
  function hideImportDemo() {
    var popover = document.getElementById('importDemoPopover');
    if (popover) popover.classList.remove('show');
  }
  function hideImportDemoDelayed() {
    _demoTimer = setTimeout(hideImportDemo, 200);
  }

  // ─── 上传入口 ─────────────────────────────────
  function handleDocxUpload() {
    if (typeof window.requireAuth === 'function' && !window.requireAuth('上传 Word')) return;
    _docxImportTarget = 'prep';
    document.getElementById('docxFileInput').click();
  }
  function handleDocxUploadForError() {
    if (typeof window.requireAuth === 'function' && !window.requireAuth('上传 Word')) return;
    _docxImportTarget = 'error';
    document.getElementById('docxFileInput').click();
  }

  // ─── AI 进度浮层 ──────────────────────────────
  function showAiOverlay(title, desc) {
    document.getElementById('aiOverlay').style.display = 'flex';
    document.getElementById('aiOverlayTitle').textContent = title || '';
    document.getElementById('aiOverlayDesc').textContent = desc || '';
    setAiProgress(0);
    renderAiStages([]);
  }
  function hideAiOverlay() {
    document.getElementById('aiOverlay').style.display = 'none';
    stopAiDrift();
  }
  function cancelAiParse() {
    _abortAiParse = true;
    if (window.seeklumeObservability) {
      window.seeklumeObservability.recordEvent({
        event_type: 'ai_parse_cancelled',
        severity: 'warning',
        module: 'word-import',
        message: 'user cancelled AI parse'
      });
    }
    hideAiOverlay();
    stopAiDrift();
    var input = document.getElementById('docxFileInput');
    if (input) input.value = '';
  }

  function setAiProgress(pct) {
    var bar = document.getElementById('aiProgressBar');
    if (bar) bar.style.width = Math.max(0, Math.min(100, pct)) + '%';
  }
  function renderAiStages(stages) {
    var el = document.getElementById('aiStageList');
    if (!el) return;
    el.innerHTML = stages.map(function(s) {
      var icon = s.status === 'done' ? '<span style="color:var(--green);">✓</span>'
               : s.status === 'doing' ? '<span style="display:inline-block;width:10px;height:10px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .7s linear infinite;vertical-align:-1px;margin-right:2px;"></span>'
               : '<span style="color:var(--text-3);">○</span>';
      var color = s.status === 'todo' ? 'var(--text-3)' : 'var(--text)';
      return '<div style="color:' + color + ';">' + icon + ' ' + s.label + '</div>';
    }).join('');
  }
  function startAiDrift(from, to, durationMs) {
    stopAiDrift();
    _aiDriftTarget = to;
    var cur = from;
    setAiProgress(cur);
    var step = (to - from) / (durationMs / 200);
    _aiDriftTimer = setInterval(function() {
      cur += step;
      if (cur >= _aiDriftTarget) {
        cur = _aiDriftTarget;
        stopAiDrift();
      }
      setAiProgress(cur);
    }, 200);
  }
  function stopAiDrift() {
    if (_aiDriftTimer) { clearInterval(_aiDriftTimer); _aiDriftTimer = null; }
  }

  // ─── Word 预处理：先把大合集拆成小篇章 ───────────────
  function normalizeImportText(text) {
    return String(text || '')
      .replace(/\u200e|\u200f/g, '')
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
    // 合集序号：（1）（2）... 单独成行（精练系列/专题合集格式）
    if (/^[（(]\d{1,2}[）)]\s*$/.test(s)) return true;
    // 两位数序号 + 省市（39套卷格式：01  浙江省... / 02  广东省...）
    if (/^\d{1,2}\s+.{0,30}[省市区县]/.test(s)) return true;
    // 第N套/篇/段（其他合集格式）
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
      if (!seen[n]) { seen[n] = true; out.push(n); }
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

  // 启发式兜底：按"中文短行+英文内容块"切割，用于 isPassageTitle 完全无法识别格式的文档
  function splitByParagraph(text) {
    var paras = text.split(/\n+/).map(function(l){ return l.trim(); }).filter(Boolean);
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
        // 短中文行可能是篇章分隔标题：先把前一段英文内容 flush 掉
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

  function splitDocxText(text) {
    _splitUsedFallback = false;
    var normalized = normalizeImportText(text);
    var rawChunks = splitByTitle(normalized);

    // 大文档且完全识别不到标题时，启用启发式段落切割兜底
    if (rawChunks.length === 0 && normalized.length > 15000) {
      rawChunks = splitByParagraph(normalized);
      if (rawChunks.length > 0) _splitUsedFallback = true;
    }

    if (rawChunks.length === 0) {
      return [{
        title: '未命名 1',
        text: normalized,
        answers: {},
        fallback: {
          title: '未命名 1',
          passage: normalizeBlankMarkers(normalized),
          blanks: buildFallbackBlanks(normalized, {})
        }
      }];
    }

    var answerByKey = {};
    rawChunks.forEach(function(c) {
      var block = c.lines.join('\n');
      var answers = extractAnswersFromChunk(block);
      if (Object.keys(answers).length > 0) answerByKey[titleKey(c.title)] = answers;
    });

    var out = [];
    rawChunks.forEach(function(c) {
      var block = c.lines.join('\n');
      // 跳过目录行、纯中文标题行（太短 或 没有连续英文字母）
      // 注意：不再用 countBlankMarkers，因为很多文档的空格是"  56  (appear)"格式，不是___N___
      if (block.length < 200 || !/[a-zA-Z]{3,}/.test(block)) return;
      var cut = block;
      var ansPos = cut.indexOf('【答案】');
      if (ansPos !== -1) cut = cut.slice(0, ansPos);
      var parseText = normalizeBlankMarkers(cut);
      var answers = answerByKey[titleKey(c.title)] || extractAnswersFromChunk(block) || {};
      out.push({
        title: c.title.trim(),
        text: parseText,
        answers: answers,
        fallback: {
          title: c.title.trim(),
          passage: parseText,
          blanks: buildFallbackBlanks(parseText, answers)
        }
      });
    });

    if (out.length === 0) {
      out.push({
        title: '未命名 1',
        text: normalized,
        answers: {},
        fallback: {
          title: '未命名 1',
          passage: normalizeBlankMarkers(normalized),
          blanks: buildFallbackBlanks(normalized, {})
        }
      });
    }
    return out.slice(0, MAX_BATCH_CHUNKS);
  }

  function mergeAnswersIntoPassage(passage, answers) {
    if (!answers) return passage;
    passage.blanks = (passage.blanks || []).map(function(b) {
      var no = parseInt(b.no, 10);
      if ((!b.answer || b.answer === '?') && answers[no]) b.answer = answers[no];
      return b;
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

    return passagesArr.filter(function(p) {
      return p && (p.passage || (Array.isArray(p.blanks) && p.blanks.length));
    }).map(function(p, i) {
      var item = {
        title: (p.title && String(p.title).trim()) || fallbackTitle || ('未命名 ' + (i + 1)),
        passage: normalizeBlankMarkers(p.passage || ''),
        blanks: Array.isArray(p.blanks) ? p.blanks : []
      };
      item.blanks = item.blanks.map(function(b, bi) {
        var no = parseInt(b.no, 10);
        return {
          no: isNaN(no) ? (bi + 1) : no,
          answer: (b.answer || '?').toString().trim(),
          category: b.category || 'word',
          fine_category: b.fine_category || '',
          analysis: (b.analysis || '').toString().trim(),
          nonp_function: b.nonp_function || '',
          nonp_function_label: b.nonp_function_label || '',
          nonp_form: b.nonp_form || '',
          nonp_form_label: b.nonp_form_label || '',
          nonp_rule: b.nonp_rule || '',
          nonp_needs_review: b.nonp_needs_review || false
        };
      });
      return mergeAnswersIntoPassage(item, fallbackAnswers);
    });
  }

  function repairPassageMarkers(p) {
    p.passage = normalizeBlankMarkers(p.passage || '');
    var markerNos = extractBlankNos(p.passage);
    var markerSet = {};
    markerNos.forEach(function(no) { markerSet[no] = true; });
    if (markerNos.length === 0 && p.blanks.length > 0) {
      p.passage += '\n\n' + p.blanks.map(function(b) { return '___' + b.no + '___'; }).join(' ');
      return p;
    }
    var missing = (p.blanks || []).filter(function(b) { return !markerSet[parseInt(b.no, 10)]; });
    if (missing.length > 0) {
      p.passage += '\n\n未定位空格：' + missing.map(function(b) { return '___' + b.no + '___'; }).join(' ');
    }
    return p;
  }

  function finalizePassages(passagesArr) {
    passagesArr = passagesArr.map(repairPassageMarkers);
    var seenSigs = {};
    passagesArr = passagesArr.filter(function(p) {
      var sig = (p.blanks || []).map(function(b) {
        return (b.no || '') + '=' + (b.answer || '').trim();
      }).sort(function(a, b) { return a < b ? -1 : a > b ? 1 : 0; }).join('|');
      if (!sig) return true;
      if (seenSigs[sig]) return false;
      seenSigs[sig] = p;
      return true;
    });
    passagesArr = passagesArr.filter(function(p) { return p.blanks && p.blanks.length > 0; });

    // 同名标题去重：加"第N篇"后缀，让同一批导入的多篇可区分
    var titleCount = {};
    passagesArr.forEach(function(p) { titleCount[p.title] = (titleCount[p.title] || 0) + 1; });
    var titleIdx = {};
    passagesArr = passagesArr.map(function(p) {
      if (titleCount[p.title] > 1) {
        titleIdx[p.title] = (titleIdx[p.title] || 0) + 1;
        p.title = p.title + ' · 第' + titleIdx[p.title] + '篇';
      }
      return p;
    });

    return passagesArr;
  }

  async function fetchDeepSeekParse(text, token) {
    var controller = new AbortController();
    var timeoutId = setTimeout(function() { controller.abort(); }, 90000); // 90s 超时
    var startedAt = Date.now();

    var res;
    try {
      res = await fetch(window.SUPABASE_URL + '/functions/v1/deepseek-parse', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: text }),
        signal: controller.signal
      });
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      if (window.seeklumeObservability) {
        window.seeklumeObservability.recordError('ai_parse_network_failed', fetchErr.message || fetchErr, {
          module: 'word-import',
          duration_ms: Date.now() - startedAt,
          text_length: text.length
        });
      }
      if (fetchErr.name === 'AbortError') {
        throw new Error('AI 解析超时（超过 90 秒）。\nDeepSeek 服务可能繁忙，请稍后重试，或将文档拆小后重传。');
      }
      throw new Error('网络请求失败：' + (fetchErr.message || String(fetchErr)));
    }
    clearTimeout(timeoutId);

    if (!res.ok) {
      var errData;
      try { errData = await res.json(); } catch (e) { errData = {}; }
      var msg;
      if (errData.error && /无法解析为 JSON|JSON\s*parse|JSON\.parse/i.test(errData.error)) {
        msg = 'AI 输出被截断，已尝试降级处理。';
      } else if (errData.error && /AI 返回的数据格式不正确|格式不正确/i.test(errData.error)) {
        msg = 'AI 没识别出题目。';
      } else {
        msg = errData.error || ('服务端错误 HTTP ' + res.status);
      }
      var error = new Error(msg);
      error.rawData = errData;
      if (window.seeklumeObservability) {
        window.seeklumeObservability.recordError('ai_parse_http_failed', msg, {
          module: 'word-import',
          status: res.status,
          duration_ms: Date.now() - startedAt,
          text_length: text.length
        });
      }
      throw error;
    }
    if (window.seeklumeObservability) {
      window.seeklumeObservability.recordEvent({
        event_type: 'ai_parse_chunk_success',
        severity: 'info',
        module: 'word-import',
        message: 'AI parse chunk succeeded',
        context: { duration_ms: Date.now() - startedAt, text_length: text.length }
      });
    }
    return res.json();
  }

  // ─── 核心流程 ─────────────────────────────────
  async function processDocxFile(input) {
    var file = input.files[0];
    if (!file) { input.value = ''; return; }
    if (window.seeklumeObservability) {
      window.seeklumeObservability.recordEvent({
        event_type: 'word_upload_started',
        severity: 'info',
        module: 'word-import',
        message: 'Word upload started',
        context: { file_name: file.name, file_size: file.size, target: _docxImportTarget }
      });
    }

    showAiOverlay('正在提取 Word 文本…', '');
    renderAiStages([
      { label: '提取 Word 文本', status: 'doing' },
      { label: '自动拆分篇章', status: 'todo' },
      { label: 'AI 分批解析', status: 'todo' },
      { label: '整理结果并入库', status: 'todo' },
    ]);
    setAiProgress(5);

    try {
      var arrayBuffer = await file.arrayBuffer();
      var result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
      var text = normalizeImportText(result.value || '');

      if (!text || text.length < 20) {
        throw new Error('Word 文档内容太短或无法识别（仅支持 .docx 格式）。\n请确保文档包含完整的英文段落。');
      }

      if (text.length > BATCH_PARSE_CHAR_LIMIT) {
        hideAiOverlay();
        var msg = '这份 Word 比较大（' + text.length.toLocaleString() + ' 字符）。\n\n'
          + '系统会自动拆篇分批解析，不需要先手动裁剪。\n'
          + '如果文档里混有答案区、解析区或多套卷，解析会慢一些，但不会一篇失败就整份失败。\n\n'
          + '点确定继续；点取消稍后再传。';
        if (!confirm(msg)) return;
        showAiOverlay('正在提取 Word 文本…', '');
      }

      var batchPlan = splitDocxText(text);
      if (!batchPlan.length) throw new Error('没有识别到可解析的题目段落。');

      setAiProgress(15);
      var splitLabel = '自动拆分篇章（' + batchPlan.length + ' 篇' + (_splitUsedFallback ? '，启发式' : '') + '）';
      renderAiStages([
        { label: '提取 Word 文本（' + text.length + ' 字）', status: 'done' },
        { label: splitLabel, status: 'done' },
        { label: 'AI 分批解析', status: 'doing' },
        { label: '整理结果并入库', status: 'todo' },
      ]);

      await parseWithDeepSeek(batchPlan, text.length);

    } catch (err) {
      hideAiOverlay();
      if (window.seeklumeObservability) {
        window.seeklumeObservability.recordError('word_import_failed', err.message || err, {
          module: 'word-import',
          target: _docxImportTarget
        });
      }
      alert('Word 解析失败：' + (err.message || String(err)));
    } finally {
      input.value = '';
    }
  }

  async function parseWithDeepSeek(batchPlan, originalLength) {
    _abortAiParse = false;

    try {
      var session = window._sb ? await window._sb.auth.getSession() : null;
      if (!session || !session.data.session) {
        hideAiOverlay();
        alert('请先登录后再使用 AI 解析功能。');
        return;
      }
      var token = session.data.session.access_token;
      var passagesArr = [];
      var fallbackCount = 0;
      var nextIndex = 0;
      var completed = 0;

      setAiProgress(30);
      startAiDrift(30, 85, Math.max(25000, batchPlan.length * 8000));

      async function runOneChunk(i) {
        if (_abortAiParse) return;
        var chunk = batchPlan[i];
        renderAiStages([
          { label: '提取 Word 文本（' + originalLength + ' 字）', status: 'done' },
          { label: '自动拆分篇章（' + batchPlan.length + ' 篇）', status: 'done' },
          { label: 'AI 分批解析（' + completed + '/' + batchPlan.length + '）', status: 'doing' },
          { label: '整理结果并入库', status: 'todo' },
        ]);

        try {
          var parsed = await fetchDeepSeekParse(chunk.text, token);
          var chunkPassages = normalizeParsedPassages(parsed, chunk.title, chunk.answers);
          chunkPassages = finalizePassages(chunkPassages);
          if (chunkPassages.length === 0 && chunk.fallback && chunk.fallback.blanks.length) {
            chunkPassages = [chunk.fallback];
            fallbackCount++;
          }
          passagesArr = passagesArr.concat(chunkPassages);
        } catch (err) {
          console.warn('单篇解析失败，使用降级导入：', chunk.title, err);
          if (chunk.fallback && chunk.fallback.blanks.length) {
            passagesArr.push(chunk.fallback);
            fallbackCount++;
          }
        }
        completed++;
        setAiProgress(30 + Math.round((completed / batchPlan.length) * 55));
      }

      async function worker() {
        while (!_abortAiParse) {
          var i = nextIndex++;
          if (i >= batchPlan.length) return;
          await runOneChunk(i);
        }
      }

      var workerCount = Math.max(1, Math.min(PARSE_CONCURRENCY, batchPlan.length));
      var runners = [];
      for (var w = 0; w < workerCount; w++) runners.push(worker());
      await Promise.all(runners);

      stopAiDrift();
      if (_abortAiParse) { hideAiOverlay(); return; }

      passagesArr = finalizePassages(passagesArr);
      if (passagesArr.length === 0) throw new Error('AI 没有识别出任何题目');

      setAiProgress(100);
      renderAiStages([
        { label: '提取 Word 文本（' + originalLength + ' 字）', status: 'done' },
        { label: '自动拆分篇章（' + batchPlan.length + ' 篇）', status: 'done' },
        { label: 'AI 分批解析完成', status: 'done' },
        { label: '整理结果（共 ' + passagesArr.length + ' 篇 · ' + passagesArr.reduce(function(s,p){return s + p.blanks.length;},0) + ' 题）', status: 'done' },
      ]);
      setTimeout(hideAiOverlay, 400);

      if (fallbackCount > 0) {
        console.warn('有 ' + fallbackCount + ' 篇使用了答案/空格降级导入，解析可稍后补全。');
      }
      setTimeout(function(){ openUnifiedImportPanel(passagesArr); }, 200);
      if (window.seeklumeObservability) {
        window.seeklumeObservability.recordEvent({
          event_type: 'ai_parse_completed',
          severity: fallbackCount > 0 ? 'warning' : 'info',
          module: 'word-import',
          message: 'AI parse completed',
          context: {
            original_length: originalLength,
            chunk_count: batchPlan.length,
            passage_count: passagesArr.length,
            fallback_count: fallbackCount
          }
        });
      }

    } catch (err) {
      stopAiDrift();
      hideAiOverlay();
      console.error('AI 解析失败：', err);
      if (window.seeklumeObservability) {
        window.seeklumeObservability.recordError('ai_parse_failed', err.message || err, {
          module: 'word-import',
          original_length: originalLength,
          chunk_count: batchPlan.length
        });
      }

      if (_abortAiParse) return;

      if (confirm(
        'AI 解析失败：' + (err.message || String(err)) + '\n\n' +
        '是否将提取的原始文本放入批量导入框，方便手动整理？'
      )) {
        var rawText = Array.isArray(batchPlan) ? batchPlan.map(function(item) { return item.text; }).join('\n\n') : '';
        showRawTextFallback(rawText);
      }
    }
  }

  // ─── 统一导入面板 ─────────────────────────────
  // 行为根据 _docxImportTarget 分流：
  //   'error' = 错题模式：只挑题进错题本，整篇绝不进备课资料；默认全选
  //   'prep'  = 备课模式：整篇进备课资料，勾选的题额外进错题本（可选）
  function openUnifiedImportPanel(passagesArr) {
    _unifiedImportData = { passages: passagesArr };
    var isErrorMode = (_docxImportTarget === 'error');

    // 标题：明确告诉老师这次上传去哪
    var titleEl = document.getElementById('unifiedImportTitle');
    if (isErrorMode) {
      titleEl.textContent = (passagesArr.length === 1 ? passagesArr[0].title : passagesArr.length + ' 篇') + ' · 挑题进错题本';
    } else {
      titleEl.textContent = (passagesArr.length === 1 ? passagesArr[0].title : passagesArr.length + ' 篇') + ' · 进备课资料（可选挑题）';
    }

    // 顶部精简提示
    var modeBanner = isErrorMode
      ? '<div style="color:var(--text-3);padding:4px 0 12px;font-size:13px;">勾选要加入错题本的题</div>'
      : '<div style="color:var(--text-3);padding:4px 0 12px;font-size:13px;">整篇进备课资料；可选勾几道题进错题本</div>';

    // 合集文档提示：篇数多时提醒老师可能有漏识别
    if (passagesArr.length > 8) {
      modeBanner += '<div style="background:var(--accent-bg);border-radius:8px;padding:8px 12px;margin-bottom:12px;font-size:12px;color:var(--accent);line-height:1.6;">'
        + '识别到 <b>' + passagesArr.length + ' 篇</b>。合集文档因格式各异可能有少量漏识别，单套试卷上传识别最准确。'
        + '</div>';
    }

    var html = modeBanner;
    passagesArr.forEach(function(p, pi) {
      html += '<div style="margin-bottom:18px;padding-bottom:18px;'
           + (pi < passagesArr.length - 1 ? 'border-bottom:1px dashed var(--border);' : '')
           + '">';
      if (passagesArr.length > 1) {
        html += '<div style="font-size:14px;font-weight:600;color:var(--text);margin-bottom:10px;">📄 ' + p.title + '</div>';
      }
      p.blanks.forEach(function(b, bi) {
        var catName = (window.CATEGORY_MAP && window.CATEGORY_MAP[b.category]) || b.category || '未分类';
        var ans = b.answer || '?';
        var prev = (b.analysis || '').substring(0, 60);
        // 两种模式都默认不选，让老师主动挑题（错题本应该是高频精选）
        var checkedAttr = '';
        html += '<label style="display:flex;align-items:flex-start;gap:10px;padding:9px 10px;border-radius:8px;cursor:pointer;transition:background .12s;" '
             +  'onmouseover="this.style.background=\'var(--surface-2)\'" onmouseout="this.style.background=\'\'">'
             +    '<input type="checkbox" class="unified-blank-check" data-passage="' + pi + '" data-blank="' + bi + '"' + checkedAttr + ' '
             +      'onchange="updateUnifiedSelectedCount()" style="margin-top:3px;width:16px;height:16px;cursor:pointer;flex-shrink:0;">'
             +    '<div style="flex:1;font-size:13px;line-height:1.55;">'
             +      '<div><span style="color:var(--accent);font-weight:600;">第 ' + (b.no || (bi + 1)) + ' 题</span>'
             +        ' · <b style="color:var(--text);">' + ans + '</b>'
             +        ' <span style="font-size:11px;background:var(--accent-bg);color:var(--accent);padding:1px 7px;border-radius:10px;margin-left:4px;">' + catName + '</span>'
             +      '</div>'
             + (prev ? '<div style="font-size:12px;color:var(--text-3);margin-top:2px;">' + prev + (b.analysis && b.analysis.length > 60 ? '…' : '') + '</div>' : '')
             +    '</div>'
             +  '</label>';
      });
      html += '</div>';
    });
    document.getElementById('unifiedImportBody').innerHTML = html;

    var totalBlanks = passagesArr.reduce(function(s, p){ return s + p.blanks.length; }, 0);
    document.getElementById('unifiedImportSummary').textContent =
      passagesArr.length + ' 篇 · 共 ' + totalBlanks + ' 题';
    document.getElementById('unifiedSelectedCount').textContent = '已勾选 0 题进错题本';
    document.getElementById('unifiedImportOverlay').style.display = 'flex';
  }

  function closeUnifiedImport() {
    document.getElementById('unifiedImportOverlay').style.display = 'none';
    _unifiedImportData = null;
  }

  function unifiedSelectAll(checked) {
    document.querySelectorAll('.unified-blank-check').forEach(function(cb){ cb.checked = checked; });
    updateUnifiedSelectedCount();
  }

  function updateUnifiedSelectedCount() {
    var n = document.querySelectorAll('.unified-blank-check:checked').length;
    document.getElementById('unifiedSelectedCount').textContent = '已勾选 ' + n + ' 题进错题本';
  }

  function confirmUnifiedImport() {
    if (!_unifiedImportData) return;
    var passages = _unifiedImportData.passages;
    var isErrorMode = (_docxImportTarget === 'error');

    // 备课模式：整篇进备课资料；错题模式：跳过备课写入
    var prepCount = 0, prepSkip = 0;
    if (!isErrorMode) {
      passages.forEach(function(p){
        if (importDeepSeekResult(p, true)) prepCount++; else prepSkip++;
      });
    }

    // 错题本：勾选的题进（两种模式都执行，但错题模式默认全选了）
    var errorCount = 0, errorSkip = 0;
    var checks = document.querySelectorAll('.unified-blank-check:checked');
    checks.forEach(function(cb){
      var pi = parseInt(cb.dataset.passage, 10);
      var bi = parseInt(cb.dataset.blank, 10);
      var p = passages[pi];
      if (!p) return;
      var b = p.blanks[bi];
      if (!b) return;
      var oneBlank = { title: p.title, passage: p.passage, blanks: [b] };
      var r = importDeepSeekResultToErrorBook(oneBlank, true);
      if (r && r.count > 0) errorCount += r.count;
      if (r && r.skipCount > 0) errorSkip += r.skipCount;
    });

    if (typeof window.renderPrepList === 'function') window.renderPrepList();
    if (typeof window.renderErrorBook === 'function') window.renderErrorBook();
    if (typeof window.renderBankStat === 'function') window.renderBankStat();

    closeUnifiedImport();

    // 反馈消息：简短直接，不暴露开发者思路
    var msg;
    if (isErrorMode) {
      msg = '已加入错题本 ' + errorCount + ' 道';
      if (errorSkip > 0) msg += '（跳过 ' + errorSkip + ' 道重复）';
    } else {
      msg = '已导入备课资料 ' + prepCount + ' 篇';
      if (prepSkip > 0) msg += '（跳过 ' + prepSkip + ' 篇重复）';
      if (errorCount > 0) msg += '；错题本 +' + errorCount + ' 道';
    }
    alert(msg);
  }

  // ─── 导入数据层（题型 specific 字段写在这里）──
  function importDeepSeekResult(result, silent) {
    var blanks = (result.blanks || []).map(function(b) {
      return {
        no: b.no,
        answer: b.answer || '?',
        category: b.category || 'word',
        fine_category: b.fine_category || '',
        analysis: b.analysis || '',
        nonp_function: b.nonp_function || '',
        nonp_function_label: b.nonp_function_label || '',
        nonp_form: b.nonp_form || '',
        nonp_form_label: b.nonp_form_label || '',
        nonp_rule: b.nonp_rule || '',
        nonp_needs_review: b.nonp_needs_review || false
      };
    });

    var temp = {
      title: result.title || '无标题',
      passage: result.passage || '',
      blanks: blanks
    };
    var fp = window.getPrepFingerprint(temp);
    var hash = 0;
    for (var i = 0; i < fp.length; i++) { hash = ((hash << 5) - hash) + fp.charCodeAt(i); hash |= 0; }
    var fpId = 'prep_' + Math.abs(hash).toString(36);

    var isDup = window.prepPassages.some(function(existing) { return window.getPrepFingerprint(existing) === fp; });
    if (isDup) {
      if (!silent) alert('这篇备课资料已存在，跳过：' + (result.title || '无标题'));
      return false;
    }

    var p = {
      id: fpId,
      title: result.title || '无标题',
      passage: result.passage,
      blanks: blanks,
      created_at: new Date().toISOString()
    };

    window.prepPassages.unshift(p);
    window.savePrepPassages();
    if (silent) return true;

    if (typeof window.renderPrepList === 'function') window.renderPrepList();
    if (typeof window.renderBankStat === 'function') window.renderBankStat();
    alert('成功导入：' + result.title + '\n共 ' + (result.blanks || []).length + ' 个空格');

    if (typeof window.uploadLocalToCloud === 'function') {
      window.uploadLocalToCloud().catch(function(e) {
        console.warn('云端同步失败，已保存到本地：', e);
      });
    }
    return true;
  }

  function importDeepSeekResultToErrorBook(result, silent) {
    var CATEGORY_MAP = window.CATEGORY_MAP || {};
    var CATEGORY_TIPS = window.CATEGORY_TIPS || {};
    var existingFps = new Set();
    window.errorBookQuestions.forEach(function(q) { existingFps.add(window.getErrorFingerprint(q)); });
    var count = 0, skipCount = 0;
    (result.blanks || []).forEach(function(b) {
      var no = b.no || (count + 1);
      var sent = (typeof window.extractSentence === 'function' ? window.extractSentence(result.passage, no) : null)
              || (typeof window.extractContextWindow === 'function' ? window.extractContextWindow(result.passage, no) : null)
              || result.passage;
      var answer = b.answer || '?';
      var cat = b.category || 'word';
      var fineCategory = b.fine_category || '';
      var errFp = answer.trim() + '|||' + cat.trim() + '|||' + no;
      var errHash = 0;
      for (var hi = 0; hi < errFp.length; hi++) { errHash = ((errHash << 5) - errHash) + errFp.charCodeAt(hi); errHash |= 0; }
      var q = {
        id: 'err_' + Math.abs(errHash).toString(36),
        passage: sent,
        answer: answer,
        category: cat,
        fine_category: fineCategory,
        nonp_function: b.nonp_function || '',
        nonp_function_label: b.nonp_function_label || '',
        nonp_form: b.nonp_form || '',
        nonp_form_label: b.nonp_form_label || '',
        nonp_rule: b.nonp_rule || '',
        nonp_needs_review: b.nonp_needs_review || false,
        category_name: CATEGORY_MAP[b.category] || b.category,
        grammar_point: '',
        analysis: b.analysis || ('答案：' + answer + '。'),
        technique: '考点：' + (CATEGORY_MAP[b.category] || b.category) +
                   '。' + (CATEGORY_TIPS[b.category] || '先判空格成分，再确定词形。'),
        exam: '错题本',
        exam_id: '错题本',
        no: no,
        created_at: new Date().toISOString()
      };
      var fp = window.getErrorFingerprint(q);
      if (existingFps.has(fp)) { skipCount++; return; }
      existingFps.add(fp);
      window.errorBookQuestions.unshift(q);
      count++;
    });

    window.saveErrorBook();
    if (silent) return { count: count, skipCount: skipCount };

    if (typeof window.renderErrorBook === 'function') window.renderErrorBook();
    if (typeof window.renderBankStat === 'function') window.renderBankStat();
    var msg = '成功导入 ' + count + ' 道错题到错题本';
    if (skipCount > 0) msg += '\n跳过 ' + skipCount + ' 道重复题';
    alert(msg);

    if (typeof window.uploadLocalToCloud === 'function') {
      window.uploadLocalToCloud().catch(function(e) {
        console.warn('云端同步失败，已保存到本地：', e);
      });
    }
    return { count: count, skipCount: skipCount };
  }

  function showRawTextFallback(text) {
    document.getElementById('prepBatchJson').value = JSON.stringify([{
      title: '请修改标题',
      passage: text,
      blanks: []
    }], null, 2);
    document.getElementById('prepBatchForm').classList.add('show');
    alert('原始文本已放入批量导入框（备课资料页），请手动整理后导入。');
  }

  function setupDocxDrop() {
    var form = document.getElementById('prepBatchForm');
    if (!form) return;
    form.addEventListener('dragover', function(e) { e.preventDefault(); e.stopPropagation(); });
    form.addEventListener('drop', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var file = e.dataTransfer.files[0];
      if (!file) return;
      if (!file.name.toLowerCase().endsWith('.docx')) {
        if (file.name.toLowerCase().endsWith('.json')) return;
        alert('请上传 .docx 格式的 Word 文档。');
        return;
      }
      var input = document.getElementById('docxFileInput');
      var dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      processDocxFile(input);
    });
  }

  // ─── 暴露到 window ────────────────────────────
  window.showImportDemo = showImportDemo;
  window.hideImportDemo = hideImportDemo;
  window.hideImportDemoDelayed = hideImportDemoDelayed;
  window.handleDocxUpload = handleDocxUpload;
  window.handleDocxUploadForError = handleDocxUploadForError;
  window.cancelAiParse = cancelAiParse;
  window.processDocxFile = processDocxFile;
  window.openUnifiedImportPanel = openUnifiedImportPanel;
  window.closeUnifiedImport = closeUnifiedImport;
  window.unifiedSelectAll = unifiedSelectAll;
  window.updateUnifiedSelectedCount = updateUnifiedSelectedCount;
  window.confirmUnifiedImport = confirmUnifiedImport;
  window.importDeepSeekResult = importDeepSeekResult;
  window.importDeepSeekResultToErrorBook = importDeepSeekResultToErrorBook;
  window.setupDocxDrop = setupDocxDrop;
})();
