// grammar-fill/modules/home-render.js
//
// Pure home-page render helpers. Model + injected deps in, HTML string out.
// No DOM access, no side effects. onclick 帮手(inlineHomeDashboardAction / inlineSidebarAction)经 deps 注入。

/* eslint-disable */
(function(){
  function textPartsHtml(parts) {
    if (!Array.isArray(parts)) return '';
    return parts.map(function(part) {
      var text = window.escapeHtml(part && part.text || '');
      if (part && part.strong) return '<b style="color:var(--text);">' + text + '</b>';
      return text;
    }).join('');
  }

  function actionButtonHtml(item, inlineHomeDashboardAction) {
    item = item || {};
    var chrome = item.chrome || window.GrammarHomeDashboardModel.getActionButtonChrome(item.tone || '');
    return '<button onclick="' + inlineHomeDashboardAction(item.action) + '" '
         + 'style="' + chrome.style + '" '
         + 'onmouseover="' + chrome.mouseover + '" '
         + 'onmouseout="' + chrome.mouseout + '">'
         + '<span style="font-size:20px;">' + window.escapeHtml(item.icon || '') + '</span>'
         + '<span>' + window.escapeHtml(item.label || '') + '</span>'
         + '<span style="font-size:11px;' + (item.subtitleStyle || '') + 'font-weight:400;">' + window.escapeHtml(item.subtitleText || '') + '</span>'
         + '</button>';
  }

  function homeDashboardHtml(model, deps) {
    deps = deps || {};
    var inlineHomeDashboardAction = deps.inlineHomeDashboardAction;
    model = model || {};
    var hero = model.hero || {};
    var html = '';
    html += '<section style="background:linear-gradient(135deg, var(--accent-bg) 0%, var(--surface) 80%);border-radius:18px;padding:32px 30px;margin-bottom:22px;position:relative;overflow:hidden;">';
    html += '<div style="font-size:14px;color:var(--accent);margin-bottom:6px;font-weight:600;">' + window.escapeHtml(hero.kickerText || '') + '</div>';
    html += '<h2 style="margin:0 0 8px 0;font-size:26px;color:var(--text);line-height:1.4;">' + window.escapeHtml(hero.titleText || '') + '</h2>';
    html += '<p style="margin:0 0 18px;color:var(--text-2);line-height:1.7;font-size:15px;">' + textPartsHtml(hero.bodyParts) + '</p>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;">';
    (model.actions || []).forEach(function(item) {
      html += actionButtonHtml(item, inlineHomeDashboardAction);
    });
    html += '</div>';
    html += '</section>';
    var textbookSection = model.textbookSection || {};
    if (textbookSection.visible) {
      html += '<section>';
      html += '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px;">';
      html += '<h3 style="margin:0;font-size:16px;color:var(--text);">' + window.escapeHtml(textbookSection.titleText || '') + '</h3>';
      html += '<a onclick="' + inlineHomeDashboardAction(textbookSection.action) + '" style="font-size:13px;color:var(--accent);cursor:pointer;">' + window.escapeHtml(textbookSection.actionLabel || '') + '</a>';
      html += '</div>';
      html += '<div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:10px;">';
      (model.books || []).forEach(function(item) {
        html += '<div onclick="' + inlineHomeDashboardAction(item.action) + '" '
             + 'style="cursor:pointer;border-radius:8px;overflow:hidden;background:var(--surface);box-shadow:0 1px 4px rgba(0,0,0,0.06);transition:all .2s;animation:fadeInUp .4s ease-out ' + (Number(item.animationDelayMs) || 0) + 'ms both;" '
             + 'onmouseover="this.style.transform=\'translateY(-3px)\';this.style.boxShadow=\'0 8px 20px rgba(0,0,0,0.15)\'" '
             + 'onmouseout="this.style.transform=\'\';this.style.boxShadow=\'0 1px 4px rgba(0,0,0,0.06)\'">';
        html += '<div style="width:100%;aspect-ratio:140/190;background:#eee url(\'' + window.escapeHtml(item.cover || '') + '\') no-repeat center/cover;"></div>';
        html += '<div style="padding:5px;text-align:center;font-size:11px;font-weight:600;color:var(--text-2);">' + window.escapeHtml(item.labelText || item.book || '') + '</div>';
        html += '</div>';
      });
      html += '</div>';
      html += '</section>';
    }
    return html;
  }

  window.GrammarHomeRender = {
    homeDashboardHtml: homeDashboardHtml
  };
})();
