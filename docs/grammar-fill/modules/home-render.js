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

  function sectionHeaderHtml(section) {
    section = section || {};
    var html = '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:8px;">';
    html += '<h3 style="margin:0;font-size:16px;color:var(--text);">' + window.escapeHtml(section.titleText || '') + '</h3>';
    html += '<span style="font-size:12px;color:var(--text-3);background:var(--bg);border:1px solid var(--border);border-radius:999px;padding:3px 9px;white-space:nowrap;">' + window.escapeHtml(section.statusText || '') + '</span>';
    html += '</div>';
    if (section.descriptionText) {
      html += '<div style="font-size:12px;color:var(--text-3);margin:0 0 12px;line-height:1.6;">' + window.escapeHtml(section.descriptionText) + '</div>';
    }
    return html;
  }

  // 课本单元卡：有讲解 = 可点（首页内渲染讲解页）；没有 = 置灰、不可点。
  function unitCardHtml(item, inlineHomeDashboardAction) {
    item = item || {};
    var head = '<h4>' + window.escapeHtml(item.unitLabelText || '')
      + (item.topicText ? ' · ' + window.escapeHtml(item.topicText) : '') + '</h4>';
    var body = '<p>' + window.escapeHtml(item.grammarText || '') + '</p>';
    if (item.ready) {
      var call = inlineHomeDashboardAction(item.action);
      return '<article class="knowledge-node-card tb-card-link" onclick="' + call + '" role="button" tabindex="0"'
        + ' onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();' + call + ';}">'
        + head + body + '<span class="tb-card-cta">📖 点卡片 · 看课本讲解 →</span>'
        + '</article>';
    }
    return '<div class="knowledge-node-card tb-card-locked">'
      + head + body + '<span class="tb-card-locked-badge">🔒 待开放</span>'
      + '</div>';
  }

  function categoryCardHtml(item, inlineHomeDashboardAction) {
    item = item || {};
    var meta = item.countText || '';
    if (item.sourceText) meta += (meta ? ' · ' : '') + item.sourceText;
    return '<button onclick="' + inlineHomeDashboardAction(item.action) + '" '
         + 'style="text-align:left;font-family:inherit;cursor:pointer;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:11px 13px;display:flex;flex-direction:column;gap:4px;transition:all .18s;" '
         + 'onmouseover="this.style.borderColor=\'var(--accent)\';this.style.background=\'var(--accent-bg)\'" '
         + 'onmouseout="this.style.borderColor=\'var(--border)\';this.style.background=\'var(--surface)\'">'
         + '<span style="font-size:14px;font-weight:600;color:var(--text);">' + window.escapeHtml(item.labelText || '') + '</span>'
         + '<span style="font-size:11px;color:var(--text-3);">' + window.escapeHtml(meta) + '</span>'
         + '</button>';
  }

  // 首页骨架：hero（定位）→ ①课本语法 → ②教辅语法 → ③工具（练习 / 速查 / 教学工具）。
  function homeDashboardHtml(model, deps) {
    deps = deps || {};
    var inlineHomeDashboardAction = deps.inlineHomeDashboardAction;
    model = model || {};
    var hero = model.hero || {};
    var html = '';
    html += '<section style="background:linear-gradient(135deg, var(--accent-bg) 0%, var(--surface) 80%);border-radius:18px;padding:32px 30px;margin-bottom:22px;position:relative;overflow:hidden;">';
    html += '<div style="font-size:14px;color:var(--accent);margin-bottom:6px;font-weight:600;">' + window.escapeHtml(hero.kickerText || '') + '</div>';
    html += '<h2 style="margin:0 0 8px 0;font-size:26px;color:var(--text);line-height:1.4;">' + window.escapeHtml(hero.titleText || '') + '</h2>';
    html += '<p style="margin:0;color:var(--text-2);line-height:1.7;font-size:15px;">' + textPartsHtml(hero.bodyParts) + '</p>';
    html += '</section>';

    var textbookSection = model.textbookSection || {};
    if (textbookSection.visible) {
      var books = textbookSection.books || [];
      html += '<section style="margin-bottom:22px;">';
      html += sectionHeaderHtml(textbookSection);
      // 封面墙（第 1 级）：7 册大封面就是门厅，点封面整页跳到该册的单元页
      html += '<div class="tb-wall">';
      books.forEach(function(book) {
        var units = book.units || [];
        var opened = units.filter(function(item) { return item.ready; }).length;
        html += '<button type="button" class="tb-cover-card"'
             + ' onclick="openHomeTextbookBook(\'' + window.escapeHtml(book.book || '') + '\')">';
        if (book.cover) {
          html += '<img class="tb-cover-img" loading="lazy" src="' + window.escapeHtml(book.cover) + '" alt="人教版' + window.escapeHtml(book.labelText || '') + '课本封面">';
        }
        html += '<span class="tb-cover-name">' + window.escapeHtml(book.labelText || '') + '</span>';
        html += '<span class="tb-cover-count">' + (opened ? '已开放 ' + opened + ' 个' : '待开放') + '</span>';
        html += '</button>';
      });
      html += '</div>';
      html += '</section>';
    }

    var indexSection = model.indexSection || {};
    if (indexSection.visible) {
      html += '<section style="margin-bottom:22px;">';
      html += sectionHeaderHtml(indexSection);
      html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;">';
      (indexSection.categories || []).forEach(function(item) {
        html += categoryCardHtml(item, inlineHomeDashboardAction);
      });
      html += '</div>';
      html += '</section>';
    }

    var toolSection = model.toolSection || {};
    if (toolSection.visible) {
      html += '<section>';
      html += '<h3 style="margin:0 0 12px;font-size:16px;color:var(--text);">' + window.escapeHtml(toolSection.titleText || '') + '</h3>';
      (toolSection.groups || []).forEach(function(group) {
        html += '<div style="margin-bottom:14px;">';
        html += '<h4 style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:.5px;color:var(--text-3);">' + window.escapeHtml(group.titleText || '') + '</h4>';
        html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;">';
        (group.items || []).forEach(function(item) {
          html += actionButtonHtml(item, inlineHomeDashboardAction);
        });
        html += '</div>';
        html += '</div>';
      });
      html += '</section>';
    }
    return html;
  }

  // 第 2 级：整页展示一册的单元列表（册封面缩略图 + 册名 + meta + 单元卡网格）。
  // 面包屑自带返回墙入口，不依赖 dock；可点单元卡进讲解页，其余置灰待开放。
  function textbookBookPageHtml(book, units, deps) {
    deps = deps || {};
    var inlineHomeDashboardAction = deps.inlineHomeDashboardAction;
    book = book || {};
    units = Array.isArray(units) ? units : (book.units || []);
    var html = '<article class="tb-book-page">';
    html += '<nav class="tb-book-crumb" aria-label="面包屑">'
         + '<button type="button" class="tb-crumb-root" onclick="navigateHome(\'cards\')">← 📚 课本语法 · 人教版</button>'
         + '<span class="tb-crumb-sep">/</span>'
         + '<span class="tb-crumb-current">' + window.escapeHtml(book.labelText || '') + '</span>'
         + '</nav>';
    html += '<div class="tb-book-head">';
    if (book.cover) {
      html += '<img class="tb-book-cover" loading="lazy" src="' + window.escapeHtml(book.cover) + '" alt="人教版' + window.escapeHtml(book.labelText || '') + '课本封面">';
    }
    html += '<div class="tb-book-meta"><h3 class="tb-book-name">' + window.escapeHtml(book.labelText || '') + '</h3>';
    html += '<p class="tb-book-count">' + window.escapeHtml(book.metaText || '') + '</p></div>';
    html += '</div>';
    html += '<div class="knowledge-node-grid">';
    units.forEach(function(item) {
      html += unitCardHtml(item, inlineHomeDashboardAction);
    });
    html += '</div></article>';
    return html;
  }

  function examGridHtml(model, deps) {
    deps = deps || {};
    var inlineSidebarAction = deps.inlineSidebarAction;
    model = model || {};
    var html = '';
    (model.groups || []).forEach(function(group) {
      html += `<div class="category-section">`
           + `<div class="category-section-title" style="cursor:pointer;display:flex;align-items:center;gap:6px;user-select:none;" onclick="toggleExamYear(this)"><span class="year-arrow" style="display:inline-block;transition:transform .2s;font-size:11px;">▼</span>${window.escapeHtml(group.titleText || ((group.year || '') + ' 年 · ' + (group.count || 0) + ' 套'))}</div>`
           + `<div class="exam-year-body"><div class="grid-11">`;
      (group.items || []).forEach(function(item) {
        var tagCls = item.tagClass ? `card-tag ${item.tagClass}` : 'card-tag';
        html += `<div class="card" onclick="${inlineSidebarAction(item.action, 'startByExam', item.id)}">`
              + `<span class="${tagCls}">${window.escapeHtml(item.type)}</span>`
              + `<div class="card-title">${window.escapeHtml(item.id)}</div>`
              + `<div class="card-desc">${window.escapeHtml(item.descriptionText || ('语法填空 · ' + item.blankCount + ' 题'))}</div>`
              + `</div>`;
      });
      html += `</div></div></div>`;
    });
    return html;
  }

  function homeCategoriesHtml(model, deps) {
    deps = deps || {};
    var inlineSidebarAction = deps.inlineSidebarAction;
    model = model || {};
    var html = '';
    (model.sections || []).forEach(function(section) {
      html += '<div class="category-section">'
        + '<div class="category-section-title">' + window.escapeHtml(section.titleText || '') + '</div>'
        + '<div class="grid-11">';
      (section.items || []).forEach(function(item) {
        var tagClass = item.tagClass ? 'card-tag ' + item.tagClass : 'card-tag';
        html += '<div class="card" onclick="' + inlineSidebarAction(item.action, 'startByCategory', item.category) + '">'
          + '<span class="' + tagClass + '">' + window.escapeHtml(item.tagText || '') + '</span>'
          + '<div class="card-title">' + window.escapeHtml(item.titleText || '') + '</div>'
          + '<div class="card-desc">' + window.escapeHtml(item.descriptionText || '') + '</div>'
          + '<div class="card-count" id="' + window.escapeHtml(item.countElementId || ('count-' + item.category)) + '">' + window.escapeHtml(item.countText || '') + '</div>'
          + '</div>';
      });
      html += '</div></div>';
    });
    return html;
  }

  window.GrammarHomeRender = {
    homeDashboardHtml: homeDashboardHtml,
    textbookBookPageHtml: textbookBookPageHtml,
    examGridHtml: examGridHtml,
    homeCategoriesHtml: homeCategoriesHtml
  };
})();
