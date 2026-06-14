// shared/lesson-prep.js
//
// 备课资料数据层（题型无关）。
//
// 维护 window.prepPassages 数组、提供 load/save、用 _owner 标记防止跨账号 localStorage 残留。
//
// 不负责：备课资料列表 UI 渲染、导入流程（题型侧处理）。
//
// owner 同步函数 getCurrentOwnerSync 原在 error-book.js（已删），现内置于此并暴露 window.__getCurrentOwnerSync。

/* eslint-disable */
(function(){
  var PREP_KEY = 'grammar-lesson-prep';

  // 同步取当前 owner：优先 cloud.state.user.id，否则 peek supabase session token，再不行 'guest'。
  // 也暴露 window.__getCurrentOwnerSync 供其它带 _owner 标记的模块复用（原 error-book.js 提供，现已删）。
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
  window.__getCurrentOwnerSync = getCurrentOwnerSync;

  function getOwner() {
    return getCurrentOwnerSync();
  }

  window.prepPassages = [];

  window.loadPrepPassages = function() {
    try {
      var raw = localStorage.getItem(PREP_KEY);
      if (!raw) { window.prepPassages = []; return; }
      var parsed = JSON.parse(raw);
      var owner, items;
      if (Array.isArray(parsed)) {
        owner = 'guest';
        items = parsed;
      } else {
        owner = parsed._owner || 'guest';
        items = Array.isArray(parsed.items) ? parsed.items : [];
      }
      var currentOwner = getOwner();
      if (owner === currentOwner || owner === 'guest') {
        window.prepPassages = items;
      } else {
        window.prepPassages = [];
        localStorage.removeItem(PREP_KEY);
      }
    } catch(e) {
      window.prepPassages = [];
    }
  };

  window.savePrepPassages = function() {
    localStorage.setItem(PREP_KEY, JSON.stringify({
      _owner: getOwner(),
      items: window.prepPassages
    }));
  };

  window.getPrepFingerprint = function(p) {
    // 基于稳定内容（去空白标记的 passage 前 200 字 + 答案序列）
    var passage = (p.passage || '').replace(/_{2,}\s*\d+\s*_{2,}/g, '').replace(/\s+/g, ' ').trim();
    var passageKey = passage.substring(0, 200);
    var blanksKey = (p.blanks || []).map(function(b) {
      return (b.answer || '').trim();
    }).join('|');
    return passageKey + '|||' + (p.blanks || []).length + '|||' + blanksKey;
  };
})();
