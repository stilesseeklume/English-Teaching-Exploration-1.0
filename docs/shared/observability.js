// shared/observability.js
//
// Minimal feedback + runtime event collection.
// This file must never block the product flow: all writes are best-effort.

/* eslint-disable */
(function(){
  var installed = false;
  var recentErrors = [];
  var EVENT_DEBOUNCE_MS = 3000;
  var lastEventAt = {};

  function isSensitiveContextKey(key) {
    var lower = String(key || '').toLowerCase();
    return lower.indexOf('password') !== -1
      || lower.indexOf('token') !== -1
      || lower.indexOf('key') !== -1
      || lower.indexOf('secret') !== -1
      || lower.indexOf('authorization') !== -1
      || lower.indexOf('cookie') !== -1;
  }

  function redactContextString(value) {
    return String(value || '')
      .replace(/sk-[A-Za-z0-9_-]{12,}/g, '[redacted]')
      .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[redacted]')
      .replace(/\b(password|token|api[_-]?key|authorization)\s*[:=]\s*[^,\s;]+/gi, '[redacted]')
      .slice(0, 800);
  }

  function sanitizeContextValue(value, depth) {
    if (depth <= 0) return '[truncated]';
    if (value === null || typeof value === 'number' || typeof value === 'boolean') return value;
    if (typeof value === 'string') return redactContextString(value);
    if (Array.isArray(value)) {
      return value.slice(0, 20).map(function(item){ return sanitizeContextValue(item, depth - 1); });
    }
    if (typeof value === 'object') {
      var cleanObj = {};
      Object.keys(value).slice(0, 40).forEach(function(key){
        if (isSensitiveContextKey(key)) return;
        cleanObj[key] = sanitizeContextValue(value[key], depth - 1);
      });
      return cleanObj;
    }
    return redactContextString(value);
  }

  function currentModule() {
    var active = document.querySelector('.page.active');
    if (active && active.id) return active.id.replace(/^page-/, '');
    var view = document.querySelector('.view.active');
    if (view && view.id) return view.id.replace(/^view-/, '');
    return '';
  }

  function safeContext(extra) {
    var ctx = {
      module: currentModule(),
      path: location.pathname,
      user_agent: navigator.userAgent,
      viewport: window.innerWidth + 'x' + window.innerHeight
    };
    extra = extra || {};
    Object.keys(extra).forEach(function(key){
      if (isSensitiveContextKey(key)) return;
      ctx[key] = sanitizeContextValue(extra[key], 4);
    });
    return ctx;
  }

  function recordEvent(event) {
    if (!window.cloud || !window.cloud.recordEvent) return;
    event = event || {};
    var ctx = event.context || {};
    var key = [
      event.event_type,
      event.severity,
      event.module,
      event.message,
      ctx.source || '',
      ctx.tab || '',
      ctx.status || ''
    ].join('|');
    var now = Date.now();
    if (lastEventAt[key] && now - lastEventAt[key] < EVENT_DEBOUNCE_MS) return;
    lastEventAt[key] = now;
    try {
      window.cloud.recordEvent(event).catch(function(){});
    } catch(e) {}
  }

  function recordError(type, message, extra) {
    var msg = String(message || 'unknown error').slice(0, 500);
    extra = extra || {};
    recentErrors.push({ type: type, message: msg, at: new Date().toISOString() });
    if (recentErrors.length > 10) recentErrors.shift();
    recordEvent({
      event_type: type,
      severity: 'error',
      module: extra.module || currentModule(),
      message: msg,
      context: safeContext(extra)
    });
  }

  function installGlobalHandlers() {
    if (installed) return;
    installed = true;
    window.addEventListener('error', function(evt){
      recordError('frontend_error', evt.message, {
        file: evt.filename,
        line: evt.lineno,
        column: evt.colno
      });
    });
    window.addEventListener('unhandledrejection', function(evt){
      var reason = evt.reason;
      recordError('unhandled_rejection', reason && (reason.message || reason.stack || reason), {});
    });
  }

  function openFeedbackModal() {
    var overlay = document.getElementById('feedbackOverlay');
    if (!overlay) return;
    var category = document.getElementById('feedbackCategory');
    var severity = document.getElementById('feedbackSeverity');
    var reproducible = document.getElementById('feedbackReproducible');
    var affected = document.getElementById('feedbackAffectedUsers');
    var message = document.getElementById('feedbackMessage');
    var status = document.getElementById('feedbackStatus');
    if (category) category.value = 'ux';
    if (severity) severity.value = 'P2';
    if (reproducible) reproducible.value = 'unknown';
    if (affected) affected.value = '1';
    if (message) message.value = '';
    if (status) status.textContent = '';
    overlay.style.display = 'flex';
    setTimeout(function(){ if (message) message.focus(); }, 50);
  }

  function closeFeedbackModal() {
    var overlay = document.getElementById('feedbackOverlay');
    if (overlay) overlay.style.display = 'none';
  }

  async function submitFeedback() {
    var category = document.getElementById('feedbackCategory');
    var severity = document.getElementById('feedbackSeverity');
    var reproducible = document.getElementById('feedbackReproducible');
    var affected = document.getElementById('feedbackAffectedUsers');
    var message = document.getElementById('feedbackMessage');
    var status = document.getElementById('feedbackStatus');
    var submit = document.getElementById('feedbackSubmitBtn');
    var text = message ? message.value.trim() : '';
    if (!text) {
      if (status) { status.style.color = 'var(--red)'; status.textContent = '请先写下问题或建议。'; }
      return;
    }
    if (!window.cloud || !window.cloud.submitFeedback) {
      if (status) { status.style.color = 'var(--red)'; status.textContent = '反馈系统未配置，请稍后再试。'; }
      return;
    }
    if (submit) { submit.disabled = true; submit.textContent = '提交中…'; }
    try {
      await window.cloud.submitFeedback({
        category: category ? category.value : 'ux',
        severity: severity ? severity.value : 'P2',
        reproducible: reproducible ? reproducible.value : 'unknown',
        affected_users_count: affected ? affected.value : 1,
        source: 'user',
        module: currentModule(),
        message: text,
        context: safeContext({ recent_errors: recentErrors })
      });
      if (status) { status.style.color = 'var(--green)'; status.textContent = '已收到，感谢反馈。'; }
      setTimeout(closeFeedbackModal, 800);
    } catch(e) {
      if (status) { status.style.color = 'var(--red)'; status.textContent = '提交失败：' + (e.message || e); }
    } finally {
      if (submit) { submit.disabled = false; submit.textContent = '提交反馈'; }
    }
  }

  function trackModule(moduleName) {
    recordEvent({
      event_type: 'module_view',
      severity: 'info',
      module: moduleName || currentModule(),
      message: 'module viewed',
      context: safeContext()
    });
  }

  window.seeklumeObservability = {
    installGlobalHandlers: installGlobalHandlers,
    recordEvent: recordEvent,
    recordError: recordError,
    trackModule: trackModule,
    openFeedbackModal: openFeedbackModal,
    closeFeedbackModal: closeFeedbackModal,
    submitFeedback: submitFeedback
  };

  window.openFeedbackModal = openFeedbackModal;
  window.closeFeedbackModal = closeFeedbackModal;
  window.submitFeedback = submitFeedback;

  installGlobalHandlers();
})();
