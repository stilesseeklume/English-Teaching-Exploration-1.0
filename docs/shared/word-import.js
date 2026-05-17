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
    _docxImportTarget = 'prep';
    document.getElementById('docxFileInput').click();
  }
  function handleDocxUploadForError() {
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

  // ─── 核心流程 ─────────────────────────────────
  async function processDocxFile(input) {
    var file = input.files[0];
    if (!file) { input.value = ''; return; }

    showAiOverlay('正在提取 Word 文本…', '');
    renderAiStages([
      { label: '提取 Word 文本', status: 'doing' },
      { label: '上传到云端 AI', status: 'todo' },
      { label: 'AI 正在解析（10–30 秒）', status: 'todo' },
      { label: '整理结果并入库', status: 'todo' },
    ]);
    setAiProgress(5);

    try {
      var arrayBuffer = await file.arrayBuffer();
      var result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
      var text = (result.value || '').trim();

      if (!text || text.length < 20) {
        throw new Error('Word 文档内容太短或无法识别（仅支持 .docx 格式）。\n请确保文档包含完整的英文段落。');
      }

      setAiProgress(15);
      renderAiStages([
        { label: '提取 Word 文本（' + text.length + ' 字）', status: 'done' },
        { label: '上传到云端 AI', status: 'doing' },
        { label: 'AI 正在解析（10–30 秒）', status: 'todo' },
        { label: '整理结果并入库', status: 'todo' },
      ]);

      await parseWithDeepSeek(text);

    } catch (err) {
      hideAiOverlay();
      alert('Word 解析失败：' + (err.message || String(err)));
    } finally {
      input.value = '';
    }
  }

  async function parseWithDeepSeek(text) {
    _abortAiParse = false;

    try {
      var session = window._sb ? await window._sb.auth.getSession() : null;
      if (!session || !session.data.session) {
        hideAiOverlay();
        alert('请先登录后再使用 AI 解析功能。');
        return;
      }
      var token = session.data.session.access_token;

      setAiProgress(30);
      renderAiStages([
        { label: '提取 Word 文本（' + text.length + ' 字）', status: 'done' },
        { label: '上传到云端 AI', status: 'done' },
        { label: 'AI 正在解析（10–30 秒）', status: 'doing' },
        { label: '整理结果并入库', status: 'todo' },
      ]);
      startAiDrift(30, 85, 25000);

      var res = await fetch(
        window.SUPABASE_URL + '/functions/v1/deepseek-parse',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text: text })
        }
      );

      stopAiDrift();
      if (_abortAiParse) { hideAiOverlay(); return; }

      if (!res.ok) {
        var errData;
        try { errData = await res.json(); } catch (e) { errData = {}; }
        var msg = errData.error || ('服务端错误 HTTP ' + res.status);
        if (errData.rawContent) msg += '\n\nAI 原始返回：\n' + errData.rawContent.substring(0, 300);
        throw new Error(msg);
      }

      setAiProgress(90);
      renderAiStages([
        { label: '提取 Word 文本（' + text.length + ' 字）', status: 'done' },
        { label: '上传到云端 AI', status: 'done' },
        { label: 'AI 正在解析（10–30 秒）', status: 'done' },
        { label: '整理结果并入库', status: 'doing' },
      ]);

      var parsed = await res.json();

      // 兼容多种返回格式
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

      passagesArr = passagesArr.filter(function(p) {
        return p && (p.passage || (Array.isArray(p.blanks) && p.blanks.length));
      }).map(function(p, i) {
        return {
          title: (p.title && String(p.title).trim()) || ('未命名 ' + (i + 1)),
          passage: p.passage || '',
          blanks: Array.isArray(p.blanks) ? p.blanks : []
        };
      });

      // 去重：AI 可能把同一篇拆成多篇
      var seenSigs = {};
      passagesArr = passagesArr.filter(function(p) {
        var sig = (p.blanks || []).map(function(b) {
          return (b.no || '') + '=' + (b.answer || '').trim();
        }).sort(function(a, b) { return a < b ? -1 : a > b ? 1 : 0; }).join('|');
        if (!sig) return true;
        if (seenSigs[sig]) {
          if (p.blanks.length > seenSigs[sig].blanks.length) {
            seenSigs[sig] = p;
          }
          return false;
        }
        seenSigs[sig] = p;
        return true;
      });

      // 校验空格标记数与 blanks 数量一致
      for (var pi = 0; pi < passagesArr.length; pi++) {
        var markerMatch = passagesArr[pi].passage.match(/_{2,}\s*\d+\s*_{2,}/g);
        var markerCount = markerMatch ? markerMatch.length : 0;
        if (markerCount !== passagesArr[pi].blanks.length) {
          throw new Error(
            '解析结果不一致：原文有 ' + markerCount + ' 个空格标记，' +
            '但解析出 ' + passagesArr[pi].blanks.length + ' 道题。\n' +
            '请手动核对 Word 文档中的空格格式是否清晰。'
          );
        }
      }

      if (passagesArr.length === 0) {
        throw new Error('AI 没有识别出任何题目');
      }

      setAiProgress(100);
      renderAiStages([
        { label: '提取 Word 文本（' + text.length + ' 字）', status: 'done' },
        { label: '上传到云端 AI', status: 'done' },
        { label: 'AI 正在解析', status: 'done' },
        { label: '整理结果（共 ' + passagesArr.length + ' 篇 · ' + passagesArr.reduce(function(s,p){return s + p.blanks.length;},0) + ' 题）', status: 'done' },
      ]);
      setTimeout(hideAiOverlay, 400);

      setTimeout(function(){ openUnifiedImportPanel(passagesArr); }, 200);

    } catch (err) {
      stopAiDrift();
      hideAiOverlay();
      console.error('AI 解析失败：', err);

      if (_abortAiParse) return;

      if (confirm(
        'AI 解析失败：' + (err.message || String(err)) + '\n\n' +
        '是否将提取的原始文本放入批量导入框，方便手动整理？'
      )) {
        showRawTextFallback(text);
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
        analysis: b.analysis || ''
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
      var errFp = answer.trim() + '|||' + cat.trim() + '|||' + no;
      var errHash = 0;
      for (var hi = 0; hi < errFp.length; hi++) { errHash = ((errHash << 5) - errHash) + errFp.charCodeAt(hi); errHash |= 0; }
      var q = {
        id: 'err_' + Math.abs(errHash).toString(36),
        passage: sent,
        answer: answer,
        category: cat,
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
