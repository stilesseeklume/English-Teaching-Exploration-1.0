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

  function teachingKnowledgeHtml(q, deps) {
    deps = deps || {};
    var vmDeps = deps.teachingViewModelDeps();
    vmDeps.graphNodeIndex = deps.getGraphNodeIndex();
    var model = window.GrammarTeachingViewModel.buildTeachingKnowledgePanelModel(q, vmDeps);
    var html = '<div class="teaching-tab-title">'
      + '<div class="teaching-tab-kicker">' + window.escapeHtml(model.kicker) + '</div>'
      + '<div class="teaching-tab-heading">' + window.escapeHtml(model.heading) + '</div>'
      + '<div class="teaching-tab-sub">' + window.escapeHtml(model.subline) + '</div>'
      + '</div>';
    html += '<div class="teaching-global-locator">'
      + '<button class="node-link-chip" onclick="openGlobalGraphForTeachingQuestion()">' + window.escapeHtml(model.locatorLabel) + '</button>'
      + '</div>';
    html += '<div class="teaching-mindmap">';
    html += '<div class="teaching-mindmap-path">';
    model.path.forEach(function(item, idx) {
      if (idx > 0) html += '<span class="arrow">›</span>';
      html += '<span' + (item.current ? ' class="current"' : '') + '>' + window.escapeHtml(item.label) + '</span>';
    });
    html += '</div>';
    html += '<div class="teaching-mindmap-board">';
    html += '<div class="teaching-mindmap-column">';
    html += '<div class="mindmap-label">上级</div>';
    html += '<div class="mindmap-up-node"><b>' + window.escapeHtml(model.parent.title) + '</b><span>' + window.escapeHtml(model.parent.note) + '</span></div>';
    if (model.siblings && model.siblings.length) {
      html += '<div class="mindmap-label">同级分支</div><div class="mindmap-siblings">';
      model.siblings.forEach(function(label) {
        html += '<div class="mindmap-sibling">' + window.escapeHtml(label) + '</div>';
      });
      html += '</div>';
    }
    html += '</div>';
    html += '<div class="teaching-mindmap-center">';
    html += '<div class="mindmap-label">当前考点</div>';
    html += '<div class="mindmap-center-node"><b>' + window.escapeHtml(model.center.title) + '</b><span>' + window.escapeHtml(model.center.note) + '</span></div>';
    html += '<div class="mindmap-current-focus">' + window.escapeHtml(model.center.focusText) + '</div>';
    html += '</div>';
    html += '<div class="teaching-mindmap-branches">';
    model.branches.forEach(function(branch) {
      html += '<div class="mindmap-branch' + (branch.active ? ' active' : '') + '">';
      html += '<div class="mindmap-branch-node"><b>' + window.escapeHtml(branch.title || '') + '</b><span>' + window.escapeHtml(branch.note || '') + '</span></div>';
      html += '<div class="mindmap-leaves">';
      (branch.leaves || []).forEach(function(leaf) {
        html += '<div class="mindmap-leaf' + (branch.active ? ' active' : '') + '">' + window.escapeHtml(leaf) + '</div>';
      });
      html += '</div></div>';
    });
    html += '</div></div>';
    if (model.rules && model.rules.length) {
      html += '<div class="teaching-mindmap-rules">';
      model.rules.forEach(function(rule) {
        html += '<div class="mindmap-rule"><span>' + rule.no + '</span><div>' + window.escapeHtml(rule.text) + '</div></div>';
      });
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  window.GrammarTeachingRender = {
    practicalGuideHtml: practicalGuideHtml,
    solutionCard: solutionCard,
    solutionPanelHtml: solutionPanelHtml,
    theoryContent: theoryContent,
    teachingGuideHtml: teachingGuideHtml,
    teachingKnowledgeHtml: teachingKnowledgeHtml
  };
})();
