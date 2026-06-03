// grammar-fill/modules/projection.js
//
// 职责：投影模式控制器。全屏 + 适度放大 + 隐藏 chrome，适合教室大屏讲题。
//       管理教学全屏的进入/退出、fullscreenchange 事件绑定、投影模式开关、
//       以及投影下抽屉的三档尺寸（mini / half / full）。
// 用法：从 index.html 的同名薄壳调用，公开入口需传入 deps（依赖注入对象）。
//       事件回调（_onTeachingFullscreenChange / _onProjectionFullscreenChange）
//       使用模块内保存的最近一次 deps。
// 依赖（deps）：
//   setTeachingFullscreenRequested(v)  写回 index.html 顶层 var
//   getPracticeContextSnapshot()       读练习上下文快照
//   getCurrentQuestionIndex()          当前题序号
//   recordUsageEvent(name, area, meta) 埋点
//   openTeachingStageByIdx(idx, opts)  打开讲题台
//   getTeachingSessionSnapshot()       读教学会话快照
//   closeTeachingStage()               关闭讲题台
//   getDrawerReturnSnapshot()          读抽屉返回快照
//   executeDrawerReturn()              执行抽屉返回
// 全局依赖：window.GrammarAppState（全局模块，直接调用）。

/* eslint-disable */
(function(){
  var _d = null; // 最近一次注入的 deps，供事件监听回调使用

  function getFullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || null;
  }

  function applyProjectionState(state, deps) {
    _d = deps || _d;
    state = state || {};
    _d.setTeachingFullscreenRequested(!!state.teachingFullscreenRequested);
    document.body.classList.toggle('projection-mode', !!state.projectionMode);
    if (window.GrammarAppState) {
      var patch = {
        projectionMode: !!state.projectionMode,
        teachingFullscreenRequested: !!state.teachingFullscreenRequested
      };
      if (Object.prototype.hasOwnProperty.call(state, 'drawerProjectionSize')) {
        patch.drawerProjectionSize = state.drawerProjectionSize;
      }
      window.GrammarAppState.patch(patch);
    }
    return state;
  }

  function requestTeachingFullscreen(deps) {
    _d = deps || _d;
    var stage = document.getElementById('teachingStage');
    var target = stage && stage.classList.contains('open') ? stage : document.documentElement;
    var request = target.requestFullscreen || target.webkitRequestFullscreen || target.mozRequestFullScreen || target.msRequestFullscreen;
    var state = window.GrammarAppState.buildProjectionStartState({
      hasFullscreenElement: !!getFullscreenElement(),
      canRequestFullscreen: !!request
    });
    applyProjectionState(state);
    if (state.shouldBindFullscreenEvents) {
      document.removeEventListener('fullscreenchange', _onTeachingFullscreenChange);
      document.addEventListener('fullscreenchange', _onTeachingFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', _onTeachingFullscreenChange);
      document.addEventListener('webkitfullscreenchange', _onTeachingFullscreenChange);
    }
    if (state.shouldRequestFullscreen) {
      try {
        var result = request.call(target);
        if (result && result.catch) result.catch(function() {});
      } catch(e) {}
    }
  }

  function exitTeachingFullscreen(deps) {
    _d = deps || _d;
    var state = window.GrammarAppState.buildProjectionExitState({
      hasFullscreenElement: !!getFullscreenElement()
    });
    document.removeEventListener('fullscreenchange', _onTeachingFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', _onTeachingFullscreenChange);
    var shouldExit = state.shouldExitFullscreen;
    applyProjectionState(state);
    if (!shouldExit) return;
    try {
      var exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
      if (getFullscreenElement() && exit) {
        var result = exit.call(document);
        if (result && result.catch) result.catch(function() {});
      }
    } catch(e) {}
  }

  function _onTeachingFullscreenChange() {
    var state = window.GrammarAppState.buildProjectionFullscreenChangeState(!!getFullscreenElement());
    applyProjectionState(state);
    if (!state.projectionMode) {
      document.removeEventListener('fullscreenchange', _onTeachingFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', _onTeachingFullscreenChange);
    }
  }

  function enterProjectionMode(deps) {
    _d = deps || _d;
    var practiceContext = _d.getPracticeContextSnapshot();
    var practicePage = document.getElementById('page-practice');
    var guard = window.GrammarAppState.buildProjectionEntryGuard({
      practiceActive: !!(practicePage && practicePage.classList.contains('active'))
    });
    if (!guard.allowed) {
      alert(guard.message);
      return;
    }
    var idx = _d.getCurrentQuestionIndex();
    if (idx < 0) idx = 0;
    var q = practiceContext.currentQuestions && practiceContext.currentQuestions[idx];
    _d.recordUsageEvent('projection_mode_entered', 'projection', {
      source: practiceContext.currentExam ? (practiceContext.currentExam.mode || practiceContext.currentExam.source || '') : '',
      question_no: q ? (q.no || null) : null,
      category: q ? (q.category || '') : '',
      fine_category: q ? (q.fine_category || '') : ''
    });
    _d.openTeachingStageByIdx(idx, { tab: 'guide', source: 'projection', fullscreen: true });
  }

  function exitProjectionMode(deps) {
    _d = deps || _d;
    var session = _d.getTeachingSessionSnapshot().teachingSession;
    _d.recordUsageEvent('projection_mode_exited', 'projection', {
      had_teaching_session: !!session
    });
    // 清抽屉的投影 size 状态
    var drawer = document.getElementById('drawer');
    if (drawer) {
      drawer.classList.remove('drawer-state-mini', 'drawer-state-half', 'drawer-state-full');
      drawer.style.height = '';
    }
    var bar = document.getElementById('projectionControls');
    if (bar) bar.remove();
    if (session) _d.closeTeachingStage();
    exitTeachingFullscreen();
    // 如果是从教材视图进的投影 → 退出投影后自动返回教材视图原位
    var drawerReturnState = _d.getDrawerReturnSnapshot();
    if (drawerReturnState.drawerReturnTo && drawerReturnState.drawerReturnTo.fromProjection) {
      setTimeout(_d.executeDrawerReturn, 100);
    }
  }

  function _onProjectionFullscreenChange() {
    _onTeachingFullscreenChange();
  }

  // 投影模式下抽屉的三档尺寸：mini / half / full
  function setDrawerProjectionSize(size, deps) {
    _d = deps || _d;
    var drawer = document.getElementById('drawer');
    if (!drawer) return;
    var state = window.GrammarAppState.buildDrawerProjectionSizeState(size);
    drawer.classList.remove('drawer-state-mini', 'drawer-state-half', 'drawer-state-full');
    drawer.classList.add(state.className);
    if (window.GrammarAppState) window.GrammarAppState.patch({ drawerProjectionSize: state.drawerProjectionSize });
    // 同步 active 状态到按钮
    document.querySelectorAll('.drawer-projection-size-btns button').forEach(function(b) {
      b.classList.toggle('active', b.dataset.size === state.drawerProjectionSize);
    });
  }

  window.GrammarProjection = {
    getFullscreenElement: getFullscreenElement,
    applyProjectionState: applyProjectionState,
    requestTeachingFullscreen: requestTeachingFullscreen,
    exitTeachingFullscreen: exitTeachingFullscreen,
    enterProjectionMode: enterProjectionMode,
    exitProjectionMode: exitProjectionMode,
    _onProjectionFullscreenChange: _onProjectionFullscreenChange,
    setDrawerProjectionSize: setDrawerProjectionSize
  };
})();
