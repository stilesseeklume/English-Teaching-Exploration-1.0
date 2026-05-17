// shared/error-book.js
//
// 错题本数据层（题型无关）。
//
// 职责：
//   - 维护 window.errorBookQuestions 数组（一切题型的错题统一存这里）
//   - 提供 load/save 到 localStorage，带 _owner 标记防止跨账号串数据
//   - 提供 getErrorFingerprint 用于去重
//   - 提供 runErrorBookCleanup 处理历史数据迁移
//
// 不负责：
//   - 错题渲染 UI（每个题型自己写，因为题型形态不同）
//   - 添加/删除单个错题的业务逻辑（也在题型侧）
//   - 与云端的同步（同步钩子由 cloud.js 提供，调用方在自己的 saveErrorBook 后触发）
//
// _owner 跨账号隔离机制：
//   localStorage 中的数据格式为 { _owner: userId | 'guest', items: [...] }。
//   加载时 _owner 不匹配当前会话用户 → 直接丢弃并清空，避免上一位老师的本地
//   数据被新登录的老师"误上传"到自己云端。
//
//   兼容性：识别旧格式（裸数组）为 'guest' 数据，登录后会被云端拉取覆盖。
//
// 引入顺序：必须在 cloud.js 之后（如果 cloud.js 已加载会更准确取 owner，但即使
//   未加载也可以 fallback 到读 localStorage 中的 supabase token）。

/* eslint-disable */
(function(){
  var ERROR_BOOK_KEY = 'grammar-error-book';

  // 同步取当前 owner：优先用 cloud.state.user.id（如果 cloud.js 已 init），
  // 否则 peek localStorage 中的 supabase session token。再不行就 'guest'。
  // 暴露到 window 给 lesson-prep.js 等其它带 _owner 标记的模块复用。
  window.__getCurrentOwnerSync = getCurrentOwnerSync;
  function getCurrentOwnerSync() {
    try {
      if (window.cloud && window.cloud.state && window.cloud.state.user && window.cloud.state.user.id) {
        return window.cloud.state.user.id;
      }
    } catch(e) {}
    try {
      var raw = localStorage.getItem('sb-zwbvcqkfbndgmyfxtkyl-auth-token');
      if (raw) {
        var d = JSON.parse(raw);
        var user = d && (d.user || (d.currentSession && d.currentSession.user));
        if (user && user.id) return user.id;
      }
    } catch(e) {}
    return 'guest';
  }

  window.errorBookQuestions = [];

  window.loadErrorBook = function() {
    try {
      var raw = localStorage.getItem(ERROR_BOOK_KEY);
      if (!raw) { window.errorBookQuestions = []; return; }
      var parsed = JSON.parse(raw);
      var owner, items;
      if (Array.isArray(parsed)) {
        // legacy 格式：视为 guest 数据
        owner = 'guest';
        items = parsed;
      } else {
        owner = parsed._owner || 'guest';
        items = Array.isArray(parsed.items) ? parsed.items : [];
      }
      var currentOwner = getCurrentOwnerSync();
      // 允许：自己的数据；或 guest 数据（任何用户都可继承用作访客缓冲）
      if (owner === currentOwner || owner === 'guest') {
        window.errorBookQuestions = items;
      } else {
        // 别人的数据 → 丢弃 + 清空 localStorage
        window.errorBookQuestions = [];
        localStorage.removeItem(ERROR_BOOK_KEY);
      }
    } catch(e) {
      window.errorBookQuestions = [];
    }
  };

  window.saveErrorBook = function() {
    var payload = {
      _owner: getCurrentOwnerSync(),
      items: window.errorBookQuestions
    };
    localStorage.setItem(ERROR_BOOK_KEY, JSON.stringify(payload));
  };

  // 一次性清理：早期错误导入的 60 道错题
  window.runErrorBookCleanup = function() {
    var cleaned = localStorage.getItem('grammar-error-book-cleaned');
    if (!cleaned && window.errorBookQuestions.length > 0) {
      window.errorBookQuestions = [];
      window.saveErrorBook();
      localStorage.setItem('grammar-error-book-cleaned', '1');
    }
    // Phase 2: 整段 passage 存成单句
    var cleanedV2 = localStorage.getItem('grammar-error-book-cleaned-v2');
    if (!cleanedV2 && window.errorBookQuestions.length > 0) {
      var fixed = 0;
      window.errorBookQuestions.forEach(function(q) {
        if (q.passage && q.passage.length > 300 && typeof window.extractSentence === 'function') {
          var sent = window.extractSentence(q.passage, q.no) || window.extractContextWindow(q.passage, q.no);
          if (sent && sent.length < q.passage.length) {
            q.passage = sent;
            fixed++;
          }
        }
      });
      if (fixed > 0) window.saveErrorBook();
      localStorage.setItem('grammar-error-book-cleaned-v2', '1');
    }
  };

  window.getErrorFingerprint = function(q) {
    var answer = (q.answer || '').trim();
    var category = (q.category || '').trim();
    var no = q.no || '';
    return answer + '|||' + category + '|||' + no;
  };
})();
