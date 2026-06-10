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
  var _examProfileCallback = null; // 'exam-profile' 目标：解析完把 passagesArr 交回控制器，不弹备课/错题面板
  var _splitUsedFallback = false; // 标记本次是否用了启发式兜底切割
  var BATCH_PARSE_CHAR_LIMIT = 25000;
  var MAX_BATCH_CHUNKS = 80;
  var PARSE_CONCURRENCY = 3;

  function escapeImportText(value) {
    if (typeof window.escapeHtml === 'function') return window.escapeHtml(value);
    return String(value == null ? '' : value).replace(/[&<>"']/g, function(c) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c];
    });
  }

  function getSavedMaterialsModel() {
    return window.GrammarSavedMaterialsModel || null;
  }

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
  function applyAiProgressModel(model) {
    if (!model) return;
    if (Object.prototype.hasOwnProperty.call(model, 'titleText')) {
      showAiOverlay(model.titleText, model.descriptionText || '');
    }
    if (typeof model.progress === 'number') setAiProgress(model.progress);
    if (Array.isArray(model.stages)) renderAiStages(model.stages);
  }
  function callSavedMaterialsModel(fnName, args) {
    var savedModel = getSavedMaterialsModel();
    if (!savedModel || typeof savedModel[fnName] !== 'function') return null;
    return savedModel[fnName].apply(savedModel, args || []);
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

  function getWordImportModel() {
    if (!window.GrammarWordImportModel) {
      throw new Error(callSavedMaterialsModel('getWordImportModuleMissingMessage')
        || 'Word 导入模块尚未加载，请刷新后重试。');
    }
    return window.GrammarWordImportModel;
  }

  function normalizeImportText(text) {
    return getWordImportModel().normalizeImportText(text);
  }

  function splitDocxText(text) {
    var plan = getWordImportModel().buildDocxBatchPlan(text, {
      maxBatchChunks: MAX_BATCH_CHUNKS
    });
    _splitUsedFallback = !!plan.usedFallback;
    return plan.chunks || [];
  }

  function normalizeParsedPassages(parsed, fallbackTitle, fallbackAnswers) {
    return getWordImportModel().normalizeParsedPassages(parsed, fallbackTitle, fallbackAnswers);
  }

  function finalizePassages(passagesArr) {
    return getWordImportModel().finalizePassages(passagesArr);
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
      throw new Error(callSavedMaterialsModel('buildAiParseNetworkErrorMessage', [fetchErr])
        || ('网络请求失败：' + (fetchErr.message || String(fetchErr))));
    }
    clearTimeout(timeoutId);

    if (!res.ok) {
      var errData;
      try { errData = await res.json(); } catch (e) { errData = {}; }
      var errorModel = callSavedMaterialsModel('buildAiParseHttpErrorModel', [errData, res.status]) || {};
      var msg = errorModel.message || errData.error || ('服务端错误 HTTP ' + res.status);
      var error = new Error(msg);
      error.rawData = errorModel.rawData || errData;
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

    applyAiProgressModel(callSavedMaterialsModel('buildWordImportInitialProgressModel'));

    try {
      var arrayBuffer = await file.arrayBuffer();
      var result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
      var text = normalizeImportText(result.value || '');

      if (!text || text.length < 20) {
        throw new Error(callSavedMaterialsModel('getWordImportTooShortMessage')
          || 'Word 文档内容太短或无法识别（仅支持 .docx 格式）。\n请确保文档包含完整的英文段落。');
      }

      if (text.length > BATCH_PARSE_CHAR_LIMIT) {
        hideAiOverlay();
        var msg = callSavedMaterialsModel('buildWordImportLargeFileConfirmMessage', [text.length])
          || ('这份 Word 比较大（' + text.length.toLocaleString() + ' 字符）。');
        if (!confirm(msg)) return;
        applyAiProgressModel(callSavedMaterialsModel('buildWordImportInitialProgressModel'));
      }

      var batchPlan = splitDocxText(text);
      if (!batchPlan.length) {
        throw new Error(callSavedMaterialsModel('getWordImportNoSegmentsMessage')
          || '没有识别到可解析的题目段落。');
      }

      applyAiProgressModel(callSavedMaterialsModel('buildWordImportSplitProgressModel', [
        text.length,
        batchPlan.length,
        _splitUsedFallback
      ]));

      await parseWithDeepSeek(batchPlan, text.length, getWordImportModel().extractExamInfoFromFilename(file.name));

    } catch (err) {
      hideAiOverlay();
      if (window.seeklumeObservability) {
        window.seeklumeObservability.recordError('word_import_failed', err.message || err, {
          module: 'word-import',
          target: _docxImportTarget
        });
      }
      alert(callSavedMaterialsModel('buildWordImportFailedAlertMessage', [err])
        || ('Word 解析失败：' + (err.message || String(err))));
    } finally {
      input.value = '';
    }
  }

  async function parseWithDeepSeek(batchPlan, originalLength, examInfo) {
    _abortAiParse = false;

    try {
      var session = window._sb ? await window._sb.auth.getSession() : null;
      if (!session || !session.data.session) {
        hideAiOverlay();
        alert(callSavedMaterialsModel('getAiParseLoginRequiredMessage')
          || '请先登录后再使用 AI 解析功能。');
        return;
      }
      var token = session.data.session.access_token;
      var passagesArr = [];
      var fallbackCount = 0;
      var nextIndex = 0;
      var completed = 0;

      setAiProgress(30);
      startAiDrift(30, 90, Math.max(60000, batchPlan.length * 12000));

      async function runOneChunk(i) {
        if (_abortAiParse) return;
        var chunk = batchPlan[i];
        applyAiProgressModel(callSavedMaterialsModel('buildWordImportChunkProgressModel', [
          originalLength,
          batchPlan.length,
          completed
        ]));

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
      if (examInfo) {
        var importModel = getWordImportModel();
        passagesArr.forEach(function(p) { p.title = importModel.composePassageTitle(examInfo, p.title); });
      }
      if (passagesArr.length === 0) {
        throw new Error(callSavedMaterialsModel('getAiParseNoPassagesMessage')
          || 'AI 没有识别出任何题目');
      }

      var completeModel = callSavedMaterialsModel('buildWordImportCompletionProgressModel', [
        originalLength,
        batchPlan.length,
        passagesArr
      ]);
      applyAiProgressModel(completeModel);
      setTimeout(hideAiOverlay, completeModel && completeModel.hideDelayMs || 400);

      if (fallbackCount > 0) {
        console.warn('有 ' + fallbackCount + ' 篇使用了答案/空格降级导入，解析可稍后补全。');
      }
      if (_docxImportTarget === 'exam-profile') {
        var _epCb = _examProfileCallback; _examProfileCallback = null;
        if (_epCb) _epCb(passagesArr);   // 错题画像：解析结果交回控制器，不弹备课/错题面板
      } else {
        setTimeout(function(){ openUnifiedImportPanel(passagesArr); }, completeModel && completeModel.openPanelDelayMs || 200);
      }
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

      alert(callSavedMaterialsModel('buildWordImportFailedAlertMessage', [err])
        || ('AI 没能解析这份文档：' + (err.message || String(err)) + '\n请重试，或把文档拆小后再传。'));
    }
  }

  // ─── 统一导入面板 ─────────────────────────────
  // 行为根据 _docxImportTarget 分流：
  //   'error' = 错题模式：只挑题进错题本，整篇绝不进备课资料
  //   'prep'  = 备课模式：整篇进备课资料，勾选的题额外进错题本（可选）
  function renderUnifiedImportBody(model) {
    var html = '<div style="color:var(--text-3);padding:4px 0 12px;font-size:13px;">'
      + escapeImportText(model.modeHintText)
      + '</div>';
    var warning = model.collectionWarning || {};
    if (warning.visible) {
      html += '<div style="background:var(--accent-bg);border-radius:8px;padding:8px 12px;margin-bottom:12px;font-size:12px;color:var(--accent);line-height:1.6;">'
        + escapeImportText(warning.leadText)
        + '<b>' + escapeImportText(warning.countText) + '</b>'
        + escapeImportText(warning.tailText)
        + '</div>';
    }

    (model.passages || []).forEach(function(p) {
      html += '<div style="margin-bottom:18px;padding-bottom:18px;'
           + (!p.isLast ? 'border-bottom:1px dashed var(--border);' : '')
           + '">';
      if (p.showTitle) {
        html += '<div style="font-size:14px;font-weight:600;color:var(--text);margin-bottom:10px;">📄 '
          + escapeImportText(p.titleText)
          + '</div>';
      }
      (p.blanks || []).forEach(function(b) {
        html += '<label style="display:flex;align-items:flex-start;gap:10px;padding:9px 10px;border-radius:8px;cursor:pointer;transition:background .12s;" '
             +  'onmouseover="this.style.background=\'var(--surface-2)\'" onmouseout="this.style.background=\'\'">'
             +    '<input type="checkbox" class="unified-blank-check" data-passage="' + Number(b.passageIndex || 0) + '" data-blank="' + Number(b.blankIndex || 0) + '"' + (b.checked ? ' checked' : '') + ' '
             +      'onchange="updateUnifiedSelectedCount()" style="margin-top:3px;width:16px;height:16px;cursor:pointer;flex-shrink:0;">'
             +    '<div style="flex:1;font-size:13px;line-height:1.55;">'
             +      '<div><span style="color:var(--accent);font-weight:600;">' + escapeImportText(b.noText) + '</span>'
             +        ' · <b style="color:var(--text);">' + escapeImportText(b.answerText) + '</b>'
             +        ' <span style="font-size:11px;background:var(--accent-bg);color:var(--accent);padding:1px 7px;border-radius:10px;margin-left:4px;">' + escapeImportText(b.categoryLabel) + '</span>'
             +      '</div>'
             + (b.analysisPreview ? '<div style="font-size:12px;color:var(--text-3);margin-top:2px;">' + escapeImportText(b.analysisPreview) + (b.analysisTruncated ? '…' : '') + '</div>' : '')
             +    '</div>'
             +  '</label>';
      });
      html += '</div>';
    });
    return html;
  }

  function openUnifiedImportPanel(passagesArr) {
    passagesArr = Array.isArray(passagesArr) ? passagesArr : [];
    var savedModel = getSavedMaterialsModel();
    if (!savedModel || typeof savedModel.buildUnifiedImportPanelModel !== 'function') {
      alert(callSavedMaterialsModel('getImportModuleMissingMessage')
        || '导入模块尚未加载，请刷新后重试。');
      return;
    }
    var model = savedModel.buildUnifiedImportPanelModel(passagesArr, _docxImportTarget, window.CATEGORY_MAP || {});
    _unifiedImportData = { passages: passagesArr, panelModel: model };

    document.getElementById('unifiedImportTitle').textContent = model.titleText;
    document.getElementById('unifiedImportBody').innerHTML = renderUnifiedImportBody(model);
    document.getElementById('unifiedImportSummary').textContent = model.summaryText;
    document.getElementById('unifiedSelectedCount').textContent = model.selectedCountText;
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
    var savedModel = getSavedMaterialsModel();
    var text = savedModel && typeof savedModel.buildUnifiedSelectedCountText === 'function'
      ? savedModel.buildUnifiedSelectedCountText(n)
      : ('已勾选 ' + n + ' 题进错题本');
    document.getElementById('unifiedSelectedCount').textContent = text;
  }

  function confirmUnifiedImport() {
    if (!_unifiedImportData) return;
    var passages = _unifiedImportData.passages;
    var savedModel = getSavedMaterialsModel();
    if (!savedModel || typeof savedModel.buildUnifiedImportConfirmPlan !== 'function') {
      alert(callSavedMaterialsModel('getImportModuleMissingMessage')
        || '导入模块尚未加载，请刷新后重试。');
      return;
    }

    var selections = [];
    document.querySelectorAll('.unified-blank-check:checked').forEach(function(cb){
      selections.push({
        passageIndex: cb.dataset.passage,
        blankIndex: cb.dataset.blank
      });
    });
    var plan = savedModel.buildUnifiedImportConfirmPlan(passages, _docxImportTarget, selections);

    var prepCount = 0, prepSkip = 0;
    plan.prepPassages.forEach(function(p){
        if (importDeepSeekResult(p, true)) prepCount++; else prepSkip++;
    });

    var errorCount = 0, errorSkip = 0;
    plan.errorPassages.forEach(function(item){
      var r = importDeepSeekResultToErrorBook(item, true);
      if (r && r.count > 0) errorCount += r.count;
      if (r && r.skipCount > 0) errorSkip += r.skipCount;
    });

    if (typeof window.renderPrepList === 'function') window.renderPrepList();
    if (typeof window.renderErrorBook === 'function') window.renderErrorBook();
    if (typeof window.renderBankStat === 'function') window.renderBankStat();

    closeUnifiedImport();

    var msg = savedModel && typeof savedModel.buildUnifiedImportCompleteMessage === 'function'
      ? savedModel.buildUnifiedImportCompleteMessage({
          prepCount: prepCount,
          prepSkip: prepSkip,
          errorCount: errorCount,
          errorSkip: errorSkip
        }, _docxImportTarget)
      : '导入完成';
    alert(msg);
  }

  // ─── 导入数据层（题型 specific 字段写在这里）──
  function importDeepSeekResult(result, silent) {
    var savedModel = getSavedMaterialsModel();
    if (!savedModel || typeof savedModel.buildDeepSeekPrepImportPlan !== 'function') {
      if (!silent) alert(callSavedMaterialsModel('getImportModuleMissingMessage')
        || '导入模块尚未加载，请刷新后重试。');
      return false;
    }
    var plan = savedModel.buildDeepSeekPrepImportPlan(result, window.prepPassages, {
      createdAt: new Date().toISOString()
    });
    if (plan.skippedDuplicate > 0) {
      if (!silent) alert(plan.duplicateMessage);
      return false;
    }

    window.prepPassages = plan.nextItems;
    window.savePrepPassages();
    if (silent) return true;

    if (typeof window.renderPrepList === 'function') window.renderPrepList();
    if (typeof window.renderBankStat === 'function') window.renderBankStat();
    alert(plan.successMessage);

    if (typeof window.uploadLocalToCloud === 'function') {
      window.uploadLocalToCloud().catch(function(e) {
        console.warn('云端同步失败，已保存到本地：', e);
      });
    }
    return true;
  }

  function importDeepSeekResultToErrorBook(result, silent) {
    var savedModel = getSavedMaterialsModel();
    if (!savedModel || typeof savedModel.buildDeepSeekErrorImportPlan !== 'function') {
      if (!silent) alert(callSavedMaterialsModel('getImportModuleMissingMessage')
        || '导入模块尚未加载，请刷新后重试。');
      return { count: 0, skipCount: 0 };
    }
    var plan = savedModel.buildDeepSeekErrorImportPlan(result, window.errorBookQuestions, {
      categoryMap: window.CATEGORY_MAP || {},
      categoryTips: window.CATEGORY_TIPS || {},
      extractSentence: typeof window.extractSentence === 'function' ? window.extractSentence : null,
      extractContextWindow: typeof window.extractContextWindow === 'function' ? window.extractContextWindow : null,
      createdAt: new Date().toISOString()
    });

    window.errorBookQuestions = plan.nextItems;
    window.saveErrorBook();
    if (silent) return { count: plan.count, skipCount: plan.skipCount };

    if (typeof window.renderErrorBook === 'function') window.renderErrorBook();
    if (typeof window.renderBankStat === 'function') window.renderBankStat();
    alert(plan.successMessage);

    if (typeof window.uploadLocalToCloud === 'function') {
      window.uploadLocalToCloud().catch(function(e) {
        console.warn('云端同步失败，已保存到本地：', e);
      });
    }
    return { count: plan.count, skipCount: plan.skipCount };
  }

  function showRawTextFallback() {
    alert('AI 没能解析这份文档。请重试，或把文档拆小后再传。');
  }

  // 把拖入的文件按目标（备课/错题）走统一上传流程
  function handleDroppedFile(file, target) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.docx')) {
      alert(callSavedMaterialsModel('getDocxOnlyMessage') || '请上传 .docx 格式的 Word 文档。');
      return;
    }
    if (typeof window.requireAuth === 'function' && !window.requireAuth('上传 Word')) return;
    _docxImportTarget = target;
    var input = document.getElementById('docxFileInput');
    if (!input) return;
    var dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    processDocxFile(input);
  }

  // 错题画像专用：拖入套卷 Word → 复用上传/AI 全流程 → 解析完把 passagesArr 交给 callback（不弹面板）
  function parseExamWordForProfile(file, callback) {
    _examProfileCallback = callback || null;
    handleDroppedFile(file, 'exam-profile');
  }

  // 拖拽卡片（每页一个，决定进备课还是错题）
  function wireDropZone(id, target) {
    var zone = document.getElementById(id);
    if (!zone) return;
    zone.addEventListener('dragover', function(e) { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', function() { zone.classList.remove('dragover'); });
    zone.addEventListener('drop', function(e) {
      e.preventDefault();
      zone.classList.remove('dragover');
      handleDroppedFile(e.dataTransfer.files[0], target);
    });
  }

  function isUploadPageActive() {
    var prep = document.getElementById('page-lesson-prep');
    var err = document.getElementById('page-error-book');
    return (prep && prep.classList.contains('active')) || (err && err.classList.contains('active'));
  }
  function activeUploadTarget() {
    var err = document.getElementById('page-error-book');
    return (err && err.classList.contains('active')) ? 'error' : 'prep';
  }
  function dragHasFiles(e) {
    var t = e.dataTransfer && e.dataTransfer.types;
    return !!t && Array.prototype.indexOf.call(t, 'Files') !== -1;
  }

  // 整页拖拽浮层（像 Claude：从任何软件拖文件到页面上，松手即传）
  function setupPageDropOverlay() {
    var overlay = document.getElementById('dropOverlay');
    if (!overlay) return;
    var depth = 0;
    document.addEventListener('dragenter', function(e) {
      if (!dragHasFiles(e) || !isUploadPageActive()) return;
      depth++;
      var label = document.getElementById('dropOverlayTarget');
      if (label) label.textContent = activeUploadTarget() === 'error' ? '到错题本' : '到备课资料';
      overlay.classList.add('show');
    });
    document.addEventListener('dragover', function(e) {
      if (overlay.classList.contains('show')) e.preventDefault();
    });
    document.addEventListener('dragleave', function() {
      depth--;
      if (depth <= 0) { depth = 0; overlay.classList.remove('show'); }
    });
    document.addEventListener('drop', function(e) {
      if (!overlay.classList.contains('show')) return;
      e.preventDefault();
      depth = 0;
      overlay.classList.remove('show');
      if (!isUploadPageActive()) return;
      handleDroppedFile(e.dataTransfer.files[0], activeUploadTarget());
    });
  }

  function setupDocxDrop() {
    wireDropZone('prepDropZone', 'prep');
    wireDropZone('errorDropZone', 'error');
    setupPageDropOverlay();
  }

  // ─── 暴露到 window ────────────────────────────
  window.showImportDemo = showImportDemo;
  window.hideImportDemo = hideImportDemo;
  window.hideImportDemoDelayed = hideImportDemoDelayed;
  window.handleDocxUpload = handleDocxUpload;
  window.handleDocxUploadForError = handleDocxUploadForError;
  window.cancelAiParse = cancelAiParse;
  window.processDocxFile = processDocxFile;
  window.parseExamWordForProfile = parseExamWordForProfile;
  window.openUnifiedImportPanel = openUnifiedImportPanel;
  window.closeUnifiedImport = closeUnifiedImport;
  window.unifiedSelectAll = unifiedSelectAll;
  window.updateUnifiedSelectedCount = updateUnifiedSelectedCount;
  window.confirmUnifiedImport = confirmUnifiedImport;
  window.importDeepSeekResult = importDeepSeekResult;
  window.importDeepSeekResultToErrorBook = importDeepSeekResultToErrorBook;
  window.setupDocxDrop = setupDocxDrop;
})();
