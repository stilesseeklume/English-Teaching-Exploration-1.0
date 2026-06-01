// grammar-fill/modules/teaching-render.js
//
// Pure teaching/drawer render helpers. Data/model in, HTML string out.
// No DOM access, no side effects (no telemetry, no storage, no network).

/* eslint-disable */
(function(){
  function practicalGuideHtml(guide) {
    var model = window.GrammarTeachingGuide.buildPracticalGuideCardModel(guide);
    if (!model.visible) return '';
    var steps = model.steps.map(function(step, idx) {
      return '<div class="teacher-quick-step">'
        + '<span class="teacher-quick-step-no">' + (idx + 1) + '</span>'
        + '<span>' + window.escapeHtml(step) + '</span>'
        + '</div>';
    }).join('');
    return '<section class="teacher-quick-card">'
      + '<div class="teacher-quick-head">'
      + '<div class="teacher-quick-kicker">' + window.escapeHtml(model.kicker) + '</div>'
      + '<div class="teacher-quick-title-line">' + window.escapeHtml(model.titleLine) + '</div>'
      + '</div>'
      + (model.trigger ? '<div class="teacher-quick-lead">' + window.escapeHtml(model.trigger) + '</div>' : '')
      + (steps ? '<div class="teacher-quick-steps">' + steps + '</div>' : '')
      + (model.mistake ? '<div class="teacher-quick-warn">常错：' + window.escapeHtml(model.mistake) + '</div>' : '')
      + '</section>';
  }

  function solutionCard(model) {
    model = model || {};
    if (model.hasSolve) {
      return '<div class="analysis-solution-card sol-dual">'
        + '<div class="sol-toggle">'
        +   '<button type="button" class="sol-chip sol-chip-solve" onclick="setSolutionView(\'solve\')">做题思路</button>'
        +   '<button type="button" class="sol-chip sol-chip-point" onclick="setSolutionView(\'point\')">考点</button>'
        + '</div>'
        + '<div class="sol-text sol-solve"><strong>做题思路：</strong>' + window.escapeHtml(model.solveText) + '</div>'
        + '<div class="sol-text sol-point"><strong>考点：</strong>' + window.escapeHtml(model.pointText) + '</div>'
        + '</div>';
    }
    return '<div class="analysis-solution-card"><strong>解题：</strong>' + window.escapeHtml(model.pointText || model.text || '') + '</div>';
  }

  function solutionPanelHtml(q) {
    return solutionCard(window.GrammarTeachingGuide.buildSolutionPanelModel(q));
  }

  function theoryContent(q, deps) {
    deps = deps || {};
    var model = window.GrammarTeachingGuide.buildTheoryPanelModel(q, {
      knowledgeData: deps.knowledgeData,
      categoryMap: deps.categoryMap,
      safeQuestionFocus: deps.safeQuestionFocus,
      getFineTagInfo: deps.getFineTagInfo
    });
    if (!model.hasTheory) {
      return '<div class="empty-hint">' + window.escapeHtml(model.emptyText) + '</div>';
    }
    var html = '<div class="theory-now-card">'
      + '<div class="lesson-card-kicker">当前考点</div>'
      + '<div class="theory-now-title">' + window.escapeHtml(model.title) + '</div>'
      + '<div class="lesson-path">'
      + model.path.map(function(item, idx) { return '<span class="lesson-path-chip' + (idx === model.path.length - 1 ? ' current' : '') + '">' + window.escapeHtml(item) + '</span>'; }).join('')
      + '</div>'
      + '</div>';
    if (model.overviewHtml) {
      html += '<div style="margin-bottom:16px;">' + model.overviewHtml + '</div>';
    }
    if (model.sections.length) {
      html += '<div class="drawer-fold-list">';
      model.sections.forEach(function(section) {
        html += '<details class="drawer-fold">';
        html += '<summary class="drawer-fold-summary">' + window.escapeHtml(section.title) + ' · ' + window.escapeHtml(section.desc) + '</summary>';
        html += '<div class="drawer-fold-body">' + section.contentHtml + '</div>';
        html += '</details>';
      });
      html += '</div>';
    }
    return html;
  }

  function teachingGuideHtml(q, practicalGuide, deps) {
    deps = deps || {};
    var header = deps.getTeachingHeaderInfo(q);
    var model = window.GrammarTeachingGuide.buildGuidePanelModel(header, practicalGuide);
    return '<div class="teaching-tab-title">'
      + '<div class="teaching-tab-kicker">' + window.escapeHtml(model.kicker) + '</div>'
      + '<div class="teaching-tab-heading">' + window.escapeHtml(model.heading) + '</div>'
      + (model.subline ? '<div class="teaching-tab-sub">' + window.escapeHtml(model.subline) + '</div>' : '')
      + '</div>'
      + practicalGuideHtml(model.practicalGuide);
  }


  function migrationEmptyHint(hint) {
    if (!hint) return '';
    var html = '<div class="empty-hint">' + window.escapeHtml(hint.primaryText || '');
    if (hint.secondaryText) html += '<br><span style="color:var(--text-3);">' + window.escapeHtml(hint.secondaryText) + '</span>';
    if (hint.fallbackText) html += '<br><span style="color:var(--text-3);">' + window.escapeHtml(hint.fallbackText) + '</span>';
    html += '</div>';
    return html;
  }

  function migrationDrawerHtml(contentModel) {
    function tab(item) {
      return '<button onclick="setMigrationSource(\'' + item.key + '\')" '
        + 'style="flex:1;padding:7px 10px;border:none;background:' + (item.active ? 'var(--surface)' : 'transparent')
        + ';color:' + (item.active ? 'var(--text)' : 'var(--text-2)')
        + ';font-size:calc(var(--drawer-font-size-sm,23px) - 5px);font-weight:' + (item.active ? '700' : '600')
        + ';border-radius:6px;cursor:pointer;transition:all .15s;font-family:inherit;'
        + (item.active ? 'box-shadow:0 1px 3px rgba(0,0,0,0.08);' : '')
        + '">'
        + window.escapeHtml(item.label) + ' <span style="color:var(--text-3);font-weight:400;">' + item.count + '</span>'
        + '</button>';
    }
    var tabsHtml = '<div style="display:flex;gap:4px;padding:4px;background:var(--surface-3);border-radius:8px;margin-bottom:12px;">'
      + contentModel.tabs.map(tab).join('')
      + '</div>';
    if (contentModel.emptyHint) {
      return tabsHtml + migrationEmptyHint(contentModel.emptyHint);
    }
    var html = tabsHtml
      + '<div class="teacher-quick-card" style="margin-top:0;">'
      + '<div class="teacher-quick-head" style="margin-bottom:6px;">'
      + '<div class="teacher-quick-kicker">迁移练习</div>'
      + '<div class="teacher-quick-title-line">'
      + window.escapeHtml(contentModel.heading)
      + '</div>'
      + '</div>'
      + (contentModel.subline ? '<div style="font-size:var(--drawer-font-size-sm,23px);color:var(--text-2);line-height:1.5;">' + window.escapeHtml(contentModel.subline) + '</div>' : '')
      + '<div style="font-size:calc(var(--drawer-font-size-sm,23px) - 2px);color:var(--text-3);line-height:1.5;margin-top:4px;">'
      + window.escapeHtml(contentModel.countText)
      + '</div>'
      + '</div>'
      + '<div class="migration-list">';
    contentModel.entries.forEach(function(entryModel) {
      var cardModel = entryModel.card;
      var typeTagHtml = '';
      if (cardModel.typeTag) {
        typeTagHtml = '<span style="background:' + cardModel.typeTag.bg + ';color:' + cardModel.typeTag.color + ';padding:1px 7px;border-radius:8px;font-size:10px;font-weight:600;margin-left:4px;vertical-align:1px;">'
          + window.escapeHtml(cardModel.typeTag.label)
          + '</span>';
      }
      html += '<div class="migration-card" onclick="jumpToMigrationQuestionById(\'' + entryModel.id + '\')">'
        + '<div class="migration-card-head">'
        + '<span class="migration-card-source"' + (cardModel.sourceAccent ? ' style="color:var(--accent);"' : '') + '>'
        +    window.escapeHtml(cardModel.sourceLabel) + typeTagHtml + ' · 第' + window.escapeHtml(cardModel.questionNo) + '题</span>'
        + '<span class="migration-card-tag">' + window.escapeHtml(cardModel.tagLabel) + '</span>'
        + '</div>'
        + '<div class="migration-card-sentence">' + entryModel.sentenceHtml + '</div>'
        + '<div class="migration-card-body" style="display:block;">'
        + (cardModel.teachingLine ? '<p><strong>讲法：</strong>' + window.escapeHtml(cardModel.teachingLine) + '</p>' : '')
        + '<p style="font-weight:700;color:var(--accent);margin-bottom:0;">' + window.escapeHtml(cardModel.ctaText) + '</p>'
        + '</div>'
        + '</div>';
    });
    html += '</div>';
    if (contentModel.showAllButton && contentModel.showAllButton.visible) {
      html += '<button type="button" class="migration-show-all" onclick="toggleMigrationShowAll()" '
        + 'style="display:block;width:100%;margin-top:10px;padding:9px 12px;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--accent);font-weight:600;font-family:inherit;cursor:pointer;font-size:calc(var(--drawer-font-size-sm,23px) - 4px);">'
        + window.escapeHtml(contentModel.showAllButton.label) + '</button>';
    }
    return html;
  }

  function migrationStageHtml(contentModel) {
    function sourceTab(item) {
      return '<button class="' + (item.active ? 'active' : '') + '" onclick="setMigrationSource(\'' + item.key + '\')">'
        + window.escapeHtml(item.label)
        + '<span class="count">' + item.count + '</span>'
        + '</button>';
    }
    var html = '<div class="teaching-migration-source-tabs">'
      + contentModel.tabs.map(sourceTab).join('')
      + '</div>'
      + '<div class="teaching-tab-title">'
      + '<div class="teaching-tab-kicker">迁移训练</div>'
      + '<div class="teaching-tab-heading">' + window.escapeHtml(contentModel.heading) + '</div>'
      + (contentModel.subline ? '<div class="teaching-tab-sub">' + window.escapeHtml(contentModel.subline) + '</div>' : '')
      + '<div class="teaching-tab-sub">' + window.escapeHtml(contentModel.countText) + '</div>'
      + '</div>';
    if (contentModel.emptyHint) {
      return html + migrationEmptyHint(contentModel.emptyHint);
    }
    html += '<div class="teaching-migration-scroll">';
    contentModel.entries.forEach(function(entryModel) {
      var rowModel = entryModel.row;
      html += '<div class="teaching-migration-row' + rowModel.rowClass + '">'
        + '<div class="teaching-migration-index">'
        + '<strong>' + window.escapeHtml(rowModel.indexText) + '</strong>'
        + '<span class="teaching-migration-type' + rowModel.typeClass + '">' + window.escapeHtml(rowModel.typeLabel) + '</span>'
        + '<span class="teaching-migration-source">' + window.escapeHtml(rowModel.sourceText) + '</span>'
        + '</div>'
        + '<div class="teaching-migration-main">'
        + '<div class="teaching-migration-sentence">' + entryModel.stageSentenceHtml + '</div>'
        + '<div class="teaching-migration-note">'
        + '<strong>' + window.escapeHtml(rowModel.tagLabel) + '</strong>'
        + (rowModel.teachingLine ? ' · ' + window.escapeHtml(rowModel.teachingLine) : '')
        + '</div>'
        + '</div>'
        + '</div>';
    });
    html += '</div>';
    if (contentModel.showAllButton && contentModel.showAllButton.visible) {
      html += '<button type="button" class="teaching-migration-show-all" onclick="toggleMigrationShowAll()">'
        + window.escapeHtml(contentModel.showAllButton.label) + '</button>';
    }
    return html;
  }

  function analysisHtml(model, parts) {
    parts = parts || {};
    var navHtml = !model.showNavigation ? '' : ('<div style="display:flex;align-items:center;gap:10px;margin-top:20px;flex-wrap:wrap;">'
      + '<button onclick="navigateBlank(-1)" style="flex:0;padding:8px 18px;border:1px solid var(--border);background:var(--surface-2);color:var(--text-2);border-radius:20px;cursor:pointer;font-size:var(--drawer-font-size-sm,23px);">◀ 上一题</button>'
      + '<button onclick="navigateBlank(1)"  style="flex:0;padding:8px 18px;border:1px solid var(--border);background:var(--surface-2);color:var(--text-2);border-radius:20px;cursor:pointer;font-size:var(--drawer-font-size-sm,23px);">下一题 ▶</button>'
      + (model.migrationCount > 0
          ? '<button onclick="switchDrawerTab(\'migration\')" style="flex:0;padding:8px 18px;border:1px solid var(--accent);background:var(--accent-bg);color:var(--accent);border-radius:20px;cursor:pointer;font-size:var(--drawer-font-size-sm,23px);font-weight:700;">'
            + '迁移 ' + model.migrationCount + ' 题 →</button>'
          : '')
      + '</div>');
    return '<div class="analysis-answer-row-lg">'
      + '<div class="analysis-answer-lg">' + window.escapeHtml(model.answer) + '</div>'
      + '<div class="analysis-answer-tools">'
      + model.floatButtons.map(function(btn) {
        return '<button type="button" class="analysis-tool-btn" onclick="toggleAnalysisFloat(\'' + btn.key + '\', this)">' + window.escapeHtml(btn.label) + '</button>';
      }).join('')
      + '</div>'
      + '<div class="analysis-float-panel" data-analysis-float="guide">'
      + '<div class="analysis-float-head"><div class="analysis-float-title">讲题卡</div><button type="button" class="analysis-float-close" onclick="closeAnalysisFloat()">×</button></div>'
      + parts.guideHtml
      + '</div>'
      + '<div class="analysis-float-panel" data-analysis-float="solution">'
      + '<div class="analysis-float-head"><div class="analysis-float-title">解题</div><button type="button" class="analysis-float-close" onclick="closeAnalysisFloat()">×</button></div>'
      + parts.solutionHtml
      + '</div>'
      + '</div>'
      + '<div class="analysis-sentence-lg">' + parts.sentHtml + '</div>'
      + (model.zhSentence ? '<div class="analysis-sentence-zh">' + window.escapeHtml(model.zhSentence) + '</div>' : '')
      + navHtml;
  }

  function teachingStageHtml(model, parts) {
    parts = parts || {};
    return '<div class="teaching-stage-shell">'
      + '<div class="teaching-stage-topbar">'
      + '<div class="teaching-stage-meta">'
      + '<span class="source">' + window.escapeHtml(model.sourceLabel) + '</span>'
      + '<span>' + window.escapeHtml(model.questionLabel) + '</span>'
      + '<span>' + window.escapeHtml(model.categoryLabel) + '</span>'
      + '</div>'
      + '</div>'
      + '<div class="teaching-stage-grid' + (model.focusContent ? ' focus-content' : '') + '">'
      + '<section class="teaching-question-panel">'
      + '<div class="teaching-question-line">' + parts.questionSentenceHtml + '</div>'
      + '<div class="teaching-question-folds">'
      + '<details class="teaching-fold"><summary>中文翻译</summary><div class="teaching-fold-body" id="stageZhBody">'
      + (model.zhSentence ? window.escapeHtml(model.zhSentence) : '<button type="button" onclick="translateStageSentence()" style="font-size:13px;border:1px solid var(--border);background:var(--surface-2);color:var(--accent);border-radius:12px;padding:4px 12px;cursor:pointer;font-family:inherit;">AI 翻译这句 →</button>')
      + '</div></details>'
      + '</div>'
      + '</section>'
      + (parts.contentHtml ? '<section class="teaching-content-panel">' + parts.contentHtml + '</section>' : '')
      + '</div>'
      + '</div>';
  }

  function teachingDockHtml(model) {
    if (!model || !model.visible) return '';
    var qBtns = model.questionButtons.map(function(item) {
      return '<button class="teaching-q-btn' + (item.active ? ' active' : '') + '" onclick="jumpTeachingQuestion(' + item.index + ')" title="' + window.escapeHtml(item.title) + '">'
        + window.escapeHtml(item.no)
        + '</button>';
    }).join('');
    var tabBtns = model.tabButtons.map(function(item) {
      return '<button class="' + (item.active ? 'active' : '') + '" onclick="setTeachingTab(\'' + item.key + '\')">' + window.escapeHtml(item.label) + '</button>';
    }).join('');
    var returnBtn = model.returnButton
      ? '<button class="return" onclick="returnTeachingQuestion()" title="' + window.escapeHtml(model.returnButton.label) + '" aria-label="' + window.escapeHtml(model.returnButton.label) + '">↩</button>'
      : '';
    return ''
      + '<div class="teaching-dock-group">'
      + '<button onclick="jumpTeachingQuestion(-1, true)" title="' + window.escapeHtml(model.navButtons[0].title) + '">' + window.escapeHtml(model.navButtons[0].label) + '</button>'
      + '<button onclick="jumpTeachingQuestion(1, true)" title="' + window.escapeHtml(model.navButtons[1].title) + '">' + window.escapeHtml(model.navButtons[1].label) + '</button>'
      + '</div>'
      + '<div class="teaching-question-rail"><div class="teaching-dock-group">' + qBtns + '</div></div>'
      + '<div class="teaching-dock-group">'
      + tabBtns
      + returnBtn
      + '<button class="danger" onclick="closeTeachingStage()">' + window.escapeHtml(model.exitButton.label) + '</button>'
      + '</div>';
  }

  window.GrammarTeachingRender = {
    practicalGuideHtml: practicalGuideHtml,
    solutionCard: solutionCard,
    solutionPanelHtml: solutionPanelHtml,
    theoryContent: theoryContent,
    teachingGuideHtml: teachingGuideHtml,

    migrationDrawerHtml: migrationDrawerHtml,
    migrationStageHtml: migrationStageHtml,
    analysisHtml: analysisHtml,
    teachingStageHtml: teachingStageHtml,
    teachingDockHtml: teachingDockHtml
  };
})();
