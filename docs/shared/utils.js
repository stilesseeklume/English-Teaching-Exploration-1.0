// shared/utils.js
//
// 跨模块通用小工具。任何"被多处用、跟具体业务无关"的纯函数都丢这里。
// 引入顺序：越早越好（被 ai-assistant.js / 题型渲染都依赖）。

/* eslint-disable */
(function(){
  window.escapeHtml = function(s) {
    return String(s).replace(/[&<>"']/g, function(c) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c];
    });
  };
})();
