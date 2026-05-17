// shared/lesson-prep.js
//
// 备课资料数据层（题型无关）。
//
// 与 error-book.js 对称：维护 window.prepPassages 数组、提供 load/save、
// 用 _owner 标记防止跨账号 localStorage 残留。
//
// 不负责：备课资料列表 UI 渲染、导入流程（题型侧处理）。
//
// 引入顺序：必须在 error-book.js 之后（依赖其暴露的 window.__getCurrentOwnerSync）。

/* eslint-disable */
(function(){
  var PREP_KEY = 'grammar-lesson-prep';

  function getOwner() {
    return (typeof window.__getCurrentOwnerSync === 'function')
      ? window.__getCurrentOwnerSync()
      : 'guest';
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
