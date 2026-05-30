// grammar-fill/modules/sidebar-render.js
//
// Pure sidebar render helper. Model + injected deps in, HTML string out.
// No DOM access, no side effects. onclick 帮手 inlineSidebarAction 经 deps 注入。

/* eslint-disable */
(function(){
  function sidebarHtml(model, deps) {
    deps = deps || {};
    var inlineSidebarAction = deps.inlineSidebarAction;
    if (!model || model.hidden) return '';
    var html = '<div class="context-sidebar-title">' + window.escapeHtml(model.title || '') + '</div>';
    if (model.emptyText) {
      return html + '<div class="context-sidebar-empty">' + window.escapeHtml(model.emptyText) + '</div>';
    }

    if (model.kind === 'exam-groups') {
      (model.groups || []).forEach(function(group) {
        html += '<div class="context-sidebar-year">' + window.escapeHtml(group.year) + ' 年</div>';
        (group.items || []).forEach(function(item) {
          var activeCls = item.active ? ' active' : '';
          html += '<div class="context-sidebar-item' + activeCls + '" onclick="' + inlineSidebarAction(item.action, 'startByExam', item.id) + '">'
                + '<span class="cs-tag' + (item.tagClass || '') + '">' + window.escapeHtml(item.type || '真题') + '</span>'
                + window.escapeHtml(item.id)
                + '<span class="cs-num">' + window.escapeHtml(item.countText || ((item.blankCount || 0) + '题')) + '</span>'
                + '</div>';
        });
      });
    } else if (model.kind === 'categories') {
      (model.items || []).forEach(function(item) {
        var activeCls = item.active ? ' active' : '';
        html += '<div class="context-sidebar-item' + activeCls + '" onclick="' + inlineSidebarAction(item.action, 'startByCategory', item.category) + '">'
              + '<span class="cs-tag">' + window.escapeHtml(item.label || item.category || '') + '</span>'
              + window.escapeHtml(item.countText || ((item.count || 0) + ' 题'))
              + '</div>';
      });
    } else if (model.kind === 'error-groups') {
      (model.groups || []).forEach(function(group) {
        html += '<div class="context-sidebar-year">' + window.escapeHtml(group.label || group.category || '') + '</div>';
        (group.items || []).forEach(function(item) {
          html += '<div class="context-sidebar-item" onclick="' + inlineSidebarAction(item.action, 'viewErrorQuestion', item.id) + '">'
                + '<span class="cs-tag">' + window.escapeHtml(item.answer || '') + '</span>'
                + window.escapeHtml(item.noText || ('第' + (item.no || '') + '题'))
                + '</div>';
        });
      });
    } else if (model.kind === 'error-items') {
      (model.items || []).forEach(function(item) {
        var activeCls = item.active ? ' active' : '';
        html += '<div class="context-sidebar-item' + activeCls + '" onclick="' + inlineSidebarAction(item.action, 'viewErrorQuestion', item.id) + '">'
              + '<span class="cs-tag">' + window.escapeHtml(item.categoryLabel || '') + '</span>'
              + window.escapeHtml(item.noText || ('第' + (item.no || '') + '题'))
              + '<span class="cs-cat">' + window.escapeHtml(item.answer || '') + '</span>'
              + '</div>';
      });
    } else if (model.kind === 'prep-items') {
      (model.items || []).forEach(function(item) {
        var activeCls = item.active ? ' active' : '';
        html += '<div class="context-sidebar-item' + activeCls + '" onclick="' + inlineSidebarAction(item.action, 'viewPrepPassage', item.id) + '">'
              + window.escapeHtml(item.title || '未命名备课')
              + '<span class="cs-num">' + window.escapeHtml(item.countText || ((item.blankCount || 0) + '题')) + '</span>'
              + '</div>';
      });
    }
    return html;
  }

  window.GrammarSidebarRender = {
    sidebarHtml: sidebarHtml
  };
})();
