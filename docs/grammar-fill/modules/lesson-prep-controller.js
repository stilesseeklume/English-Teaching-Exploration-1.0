// grammar-fill/modules/lesson-prep-controller.js
//
// 职责：备课资料（lesson-prep）控制器。管理备课资料的批量导入表单开关、
//       文件/拖拽导入、JSON 批量导入、删除、查看（进练习）、列表渲染、改名。
// 用法：从 index.html 的同名薄壳调用，公开入口需传入 deps（依赖注入对象）。
//       模块内保存最近一次 deps（_d），函数间互调走模块内部直接调用。
// 依赖（deps）：
//   getPrepPassages()                  getter：备课资料数组（可变引用，必须用 getter）
//   setPrepPassages(v)                 setter：写回备课资料数组（写回全局）
//   savePrepPassages()                 持久化备课资料
//   renderBankStat()                   刷新题库统计
//   closeDrawer(preserveDrawerReturn)  关闭抽屉
//   resetPracticeDisplayState()        重置练习显示状态
//   applyPracticeContextState(state)   套用练习上下文状态
//   setPreviousView(view)              记录上一视图
//   getPracticeEntryPreviousView(src)  推导练习入口的上一视图
//   syncAppState()                     同步全局 app state
//   switchPage(page)                   切换页面
//   renderExam()                       渲染练习卷面
//   getSavedMaterialBulkModeSnapshot(kind)  读批量模式快照
//   renderPageSidebar(page)            渲染页面侧边栏
//   syncPrepBulkInfo()                 同步批量选择信息
//   deleteSavedMaterialItem(kind,id,items,applyLocalDelete)  删除资料项（含云端）
//   applyBatchImportFormTogglePlan(plan)  执行批量导入表单开关计划
//   escapeHtml(s)                      HTML 转义
//   CATEGORY_MAP                       考点映射常量
//   CATEGORY_TIPS                      考点提示常量
// 全局依赖（window.Grammar*，直接调用）：
//   GrammarSavedMaterialsModel

/* eslint-disable */
(function(){
  var _d = null; // 最近一次注入的 deps

  function togglePrepBatchImport(force, deps) {
    _d = deps || _d;
    var form = document.getElementById('prepBatchForm');
    var plan = window.GrammarSavedMaterialsModel.buildBatchImportFormTogglePlan(
      'prep',
      form && form.classList.contains('show'),
      force
    );
    _d.applyBatchImportFormTogglePlan(plan);
  }

  function handlePrepFileImport(input, deps) {
    _d = deps || _d;
    var file = input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('prepBatchJson').value = e.target.result;
      batchImportPrepJson();
    };
    reader.readAsText(file);
  }

  function setupPrepDrop(deps) {
    _d = deps || _d;
    var form = document.getElementById('prepBatchForm');
    if (!form) return;
    form.addEventListener('dragover', function(e) { e.preventDefault(); });
    form.addEventListener('drop', function(e) {
      e.preventDefault();
      var file = e.dataTransfer.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(ev) {
        document.getElementById('prepBatchJson').value = ev.target.result;
        batchImportPrepJson();
      };
      reader.readAsText(file);
    });
  }

  function batchImportPrepJson(deps) {
    _d = deps || _d;
    var raw = document.getElementById('prepBatchJson').value.trim();
    var parsed = window.GrammarSavedMaterialsModel.parseBatchImportJson(raw, 'prep');
    if (parsed.empty) return;
    if (!parsed.ok) {
      alert(parsed.errorMessage);
      return;
    }
    var result = window.GrammarSavedMaterialsModel.importPrepItems(parsed.list, _d.getPrepPassages(), {
      now: Date.now(),
      createdAt: new Date().toISOString()
    });
    _d.setPrepPassages(result.nextItems);
    _d.savePrepPassages();
    renderPrepList();
    _d.renderBankStat();
    togglePrepBatchImport();
    document.getElementById('prepBatchJson').value = '';
    alert(window.GrammarSavedMaterialsModel.buildImportResultMessage(result, 'prep'));
  }

  async function deletePrepPassage(id, deps) {
    _d = deps || _d;
    return _d.deleteSavedMaterialItem('prep', id, _d.getPrepPassages(), function(nextItems) {
      _d.setPrepPassages(nextItems);
      _d.savePrepPassages();
      renderPrepList();
    });
  }

  function viewPrepPassage(id, preserveDrawerReturn, deps) {
    _d = deps || _d;
    var p = _d.getPrepPassages().find(function(item) { return item.id === id; });
    var plan = window.GrammarSavedMaterialsModel.buildSavedMaterialPracticeEntryPlan('prep', p, {
      preserveDrawerReturn: preserveDrawerReturn
    });
    if (plan.action === 'none') return;
    if (plan.shouldCloseDrawer) _d.closeDrawer(plan.preserveDrawerReturn);
    if (plan.shouldResetPracticeDisplay) _d.resetPracticeDisplayState();
    var state = window.GrammarSavedMaterialsModel.createPrepStateForPassage(p, _d.CATEGORY_MAP, _d.CATEGORY_TIPS);
    if (plan.shouldApplyPracticeContext) _d.applyPracticeContextState(state);
    _d.setPreviousView(_d.getPracticeEntryPreviousView(plan.previousViewSource));
    if (plan.shouldSyncAppState) _d.syncAppState();
    if (plan.shouldSwitchPage) _d.switchPage(plan.page);
    if (plan.shouldRenderExam) _d.renderExam();
  }

  function renderPrepList(deps) {
    _d = deps || _d;
    var el = document.getElementById('prepList');
    if (!el) return;
    var model = window.GrammarSavedMaterialsModel.buildPrepListModel(_d.getPrepPassages(), _d.CATEGORY_MAP, {
      bulkMode: _d.getSavedMaterialBulkModeSnapshot('prep')
    });

    document.getElementById('prepStat').textContent = model.statText;

    if (model.empty) {
      el.innerHTML = '<div class="error-empty">' + _d.escapeHtml(model.emptyText) + '</div>';
      return;
    }

    var html = '';
    model.items.forEach(function(p) {
      html += '<div class="prep-list-item" onclick="viewPrepPassage(\'' + _d.escapeHtml(p.id) + '\')">'
            + '<div class="prep-list-title">' + _d.escapeHtml(p.title) + '</div>'
            + (p.showBulkCheck ? '<label style="display:block;margin-bottom:8px;"><input type="checkbox" class="bulk-item-check prep-bulk-check" data-id="' + _d.escapeHtml(p.id) + '" onchange="syncPrepBulkInfo()" onclick="event.stopPropagation()"></label>' : '')
            + '<div class="prep-list-preview">' + _d.escapeHtml(p.preview) + '</div>'
            + '<div class="prep-list-meta">'
            + '<span>' + _d.escapeHtml(p.metaText) + '</span>'
            + '<span style="display:flex;gap:6px;">'
            + '<button class="prep-list-rename" onclick="event.stopPropagation();renamePrepPassage(\'' + _d.escapeHtml(p.id) + '\')" title="改名">✎ 改名</button>'
            + '<button class="prep-list-delete" onclick="event.stopPropagation();deletePrepPassage(\'' + _d.escapeHtml(p.id) + '\')">删除</button>'
            + '</span>'
            + '</div>'
            + '</div>';
    });
    el.innerHTML = html;
    _d.renderPageSidebar('lesson-prep');
    _d.syncPrepBulkInfo();
  }

  function renamePrepPassage(id, deps) {
    _d = deps || _d;
    var item = (_d.getPrepPassages() || []).filter(function(p) { return String(p.id) === String(id); })[0];
    if (!item) return;
    var next = prompt('改名（建议：年份+考试名称+主题）：', item.title || '');
    if (next === null) return;
    next = String(next).trim();
    if (!next || next === item.title) return;
    item.title = next;
    _d.savePrepPassages();
    renderPrepList();
  }

  window.GrammarLessonPrep = {
    togglePrepBatchImport: togglePrepBatchImport,
    handlePrepFileImport: handlePrepFileImport,
    setupPrepDrop: setupPrepDrop,
    batchImportPrepJson: batchImportPrepJson,
    deletePrepPassage: deletePrepPassage,
    viewPrepPassage: viewPrepPassage,
    renderPrepList: renderPrepList,
    renamePrepPassage: renamePrepPassage
  };
})();
