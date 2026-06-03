// grammar-fill/modules/cloud-sync.js
//
// 职责：云同步 UI + 数据层。管理云端登录生命周期状态（首次到达本用户、迁移提示、
//       管理员 ?admin 入口）、拉取/上传错题本与备课资料、同步状态指示条、
//       带引用计数与重入队列的全量同步（错题本 / 备课资料）。
//       并在模块加载时对 window.saveErrorBook / window.savePrepPassages 打猴补丁，
//       使得每次本地保存后异步把全量推到云端。
// 用法：从 index.html 的同名薄壳调用，公开入口需传入 deps（依赖注入对象）。
//       模块内保存最近一次 deps（_d），函数间互调走模块内部直接调用。
//       猴补丁在 IIFE 体内顶层、定义完同步函数之后立即执行（不依赖 deps）。
// 装配顺序要求：本脚本必须加载在 shared/error-book.js、shared/lesson-prep.js、
//       shared/cloud.js 之后（保证 window.saveErrorBook / window.savePrepPassages
//       已定义，猴补丁才能正确捕获并重写）。
// 依赖（deps，运行时注入）：
//   renderUserPill(state)        渲染用户信息条（来自 shared/auth-ui.js）
//   switchPage(page)             切换页面
//   renderErrorBook()            渲染错题本
//   renderPrepList()             渲染备课资料列表
//   renderBankStat()             刷新题库统计
// 全局依赖（window.*，直接调用）：
//   window.cloud                 云端 API（pull/upsert/delete/state）
//   window.GrammarAppState       app state 模型（生命周期 / 同步状态 / 队列计算）
//   window.GrammarSavedMaterialsModel  保存资料同步计划计算
//   window.seeklumeObservability 可观测性上报（可选）
//   window.errorBookQuestions    错题数组（读写 window 全局）
//   window.prepPassages          备课资料数组（读写 window 全局）
//   window.saveErrorBook / window.savePrepPassages  原始本地保存（被猴补丁包裹）

/* eslint-disable */
(function(){
  var _d = null; // 最近一次注入的 deps

  // ─── 云生命周期状态（仅本模块内部使用）───
  var _lastCloudUser = null;
  var _migrationPromptShown = false;
  var _adminParamChecked = false;
  var _loggingOut = false; // doLogout 经由 setCloudLoggingOutState() 写入

  function getCloudLifecycleSnapshot() {
    if (window.GrammarAppState && window.GrammarAppState.normalizeCloudLifecycleState) {
      return window.GrammarAppState.normalizeCloudLifecycleState({
        cloudLastUserKey: _lastCloudUser || '',
        cloudMigrationPromptShown: _migrationPromptShown,
        cloudAdminParamChecked: _adminParamChecked,
        cloudLoggingOut: _loggingOut
      });
    }
    return {
      cloudLastUserKey: _lastCloudUser || '',
      cloudMigrationPromptShown: !!_migrationPromptShown,
      cloudAdminParamChecked: !!_adminParamChecked,
      cloudLoggingOut: !!_loggingOut
    };
  }

  function setCloudLoggingOutState(loggingOut) {
    var nextState = window.GrammarAppState
      ? window.GrammarAppState.buildCloudLifecycleState(getCloudLifecycleSnapshot(), { cloudLoggingOut: loggingOut })
      : Object.assign(getCloudLifecycleSnapshot(), { cloudLoggingOut: !!loggingOut });
    _lastCloudUser = nextState.cloudLastUserKey || '';
    _migrationPromptShown = !!nextState.cloudMigrationPromptShown;
    _adminParamChecked = !!nextState.cloudAdminParamChecked;
    _loggingOut = !!nextState.cloudLoggingOut;
    if (window.GrammarAppState) {
      window.GrammarAppState.patch(nextState);
    }
    return _loggingOut;
  }

  function applyCloudLifecycleState(nextState) {
    nextState = window.GrammarAppState
      ? window.GrammarAppState.buildCloudLifecycleState(getCloudLifecycleSnapshot(), nextState)
      : Object.assign(getCloudLifecycleSnapshot(), nextState || {});
    _lastCloudUser = nextState.cloudLastUserKey || '';
    _migrationPromptShown = !!nextState.cloudMigrationPromptShown;
    _adminParamChecked = !!nextState.cloudAdminParamChecked;
    _loggingOut = !!nextState.cloudLoggingOut;
    if (window.GrammarAppState) {
      window.GrammarAppState.patch(nextState);
    }
    return {
      cloudLastUserKey: _lastCloudUser || '',
      cloudMigrationPromptShown: !!_migrationPromptShown,
      cloudAdminParamChecked: !!_adminParamChecked,
      cloudLoggingOut: !!_loggingOut
    };
  }

  function clearCloudLifecycleState() {
    return applyCloudLifecycleState(window.GrammarAppState
      ? window.GrammarAppState.clearCloudLifecycleState()
      : {
          cloudLastUserKey: '',
          cloudMigrationPromptShown: false,
          cloudAdminParamChecked: false,
          cloudLoggingOut: false
        });
  }

  async function onCloudStateChange(state, deps) {
    _d = deps || _d;
    _d.renderUserPill(state);
    document.getElementById('adminBanner').style.display = state.viewingUserId ? '' : 'none';
    if (state.viewingUserId) {
      document.getElementById('adminViewingEmail').textContent = state.viewingEmail || '';
    }

    // 1. 未登录 → 访客模式（可浏览首页/考点面板/套卷列表/考点速查）
    if (!state.user) {
      var isLoggingOut = !!getCloudLifecycleSnapshot().cloudLoggingOut;
      if (isLoggingOut) return; // 正在退出登录，跳过页面切换（由 doLogout 处理跳转）
      document.documentElement.classList.remove('has-session');
      document.body.classList.remove('pending');
      return;
    }
    document.documentElement.classList.add('has-session');
    document.body.classList.remove('pending');

    var lifecycleSnapshot = getCloudLifecycleSnapshot();
    var arrivalState = window.GrammarAppState
      ? window.GrammarAppState.buildCloudArrivalState({
          cloudLastUserKey: lifecycleSnapshot.cloudLastUserKey
        }, state)
      : (function() {
          var newUserKey = (state.user ? state.user.id : '') + '|' + (state.viewingUserId || '');
          var first = newUserKey !== (lifecycleSnapshot.cloudLastUserKey || '');
          return {
            cloudLastUserKey: first ? newUserKey : (lifecycleSnapshot.cloudLastUserKey || ''),
            firstAuthForThisUser: first,
            hasUser: !!state.user,
            isViewingUser: !!state.viewingUserId
          };
        })();
    applyCloudLifecycleState(arrivalState);

    // 2. 已登录：第一次到达本用户的状态
    if (arrivalState.firstAuthForThisUser && !state.viewingUserId) {
      // URL ?admin 参数：管理员直接从首页进入管理后台
      var adminEntryState = window.GrammarAppState
        ? window.GrammarAppState.buildCloudAdminEntryState({
            firstAuthForThisUser: arrivalState.firstAuthForThisUser,
            viewingUserId: state.viewingUserId,
            cloudAdminParamChecked: getCloudLifecycleSnapshot().cloudAdminParamChecked,
            isAdmin: state.isAdmin,
            hasAdminParam: /[?&]admin/.test(location.search)
          })
        : {
            cloudAdminParamChecked: true,
            shouldOpenAdmin: !getCloudLifecycleSnapshot().cloudAdminParamChecked && state.isAdmin && /[?&]admin/.test(location.search)
          };
      applyCloudLifecycleState(adminEntryState);
      if (adminEntryState.shouldOpenAdmin) {
        _d.switchPage('admin');
      }
    }

    if (!arrivalState.firstAuthForThisUser) return;

    // 拉云端数据
    setSyncStatus('syncing');
    try {
      var [errors, preps] = await Promise.all([
        window.cloud.pullErrorBook(),
        window.cloud.pullLessonPrep()
      ]);
      var pullPlan = window.GrammarSavedMaterialsModel.buildCloudPullResultPlan(errors, preps);
      if (pullPlan.shouldCheckLocalCloudMigration) {
        // 第一次登录的迁移提示：云端空 + 本地非空
        var migrationPromptState = window.GrammarAppState
          ? window.GrammarAppState.buildLocalCloudMigrationPromptState({
              viewingUserId: state.viewingUserId,
              cloudMigrationPromptShown: getCloudLifecycleSnapshot().cloudMigrationPromptShown,
              cloudErrorCount: pullPlan.cloudErrorCount,
              cloudPrepCount: pullPlan.cloudPrepCount,
              localErrorCount: window.errorBookQuestions.length,
              localPrepCount: window.prepPassages.length
            })
          : {
              cloudMigrationPromptShown: true,
              shouldPrompt: !state.viewingUserId && !getCloudLifecycleSnapshot().cloudMigrationPromptShown
                && pullPlan.cloudErrorCount === 0 && pullPlan.cloudPrepCount === 0
                && (window.errorBookQuestions.length > 0 || window.prepPassages.length > 0),
              localErrorCount: window.errorBookQuestions.length,
              localPrepCount: window.prepPassages.length
            };
        applyCloudLifecycleState(migrationPromptState);
        if (migrationPromptState.shouldPrompt) {
          if (confirm(window.GrammarSavedMaterialsModel.buildLocalCloudMigrationConfirmMessage(
            migrationPromptState.localErrorCount,
            migrationPromptState.localPrepCount
          ))) {
            setSyncStatus(null);
            await uploadLocalToCloud();
            return; // uploadLocalToCloud 会重新拉取并 render
          }
        }
      }
      if (pullPlan.shouldApplyCloudData) {
        window.errorBookQuestions = pullPlan.nextErrorItems;
        window.prepPassages = pullPlan.nextPrepItems;
        if (pullPlan.shouldRenderErrorBook) _d.renderErrorBook();
        if (pullPlan.shouldRenderPrepList) _d.renderPrepList();
        if (pullPlan.shouldRenderBankStat) _d.renderBankStat();
        setSyncStatus(pullPlan.syncStatus, pullPlan.syncMessage);
      } else {
        setSyncStatus(pullPlan.syncStatus, pullPlan.syncMessage);
      }
    } catch (e) {
      var failurePlan = window.GrammarSavedMaterialsModel.buildCloudPullFailurePlan(e);
      console.error(failurePlan.consoleMessage, e);
      if (window.seeklumeObservability) window.seeklumeObservability.recordError(failurePlan.failureEvent, failurePlan.syncMessage || e, { module: failurePlan.failureModule });
      setSyncStatus(failurePlan.syncStatus, failurePlan.syncMessage);
      alert(failurePlan.alertMessage);
    }
  }

  async function uploadLocalToCloud(deps) {
    _d = deps || _d;
    try {
      var plan = window.GrammarSavedMaterialsModel.buildLocalCloudUploadPlan(window.errorBookQuestions, window.prepPassages);
      for (var p = 0; p < plan.syncPlans.length; p++) {
        var syncPlan = plan.syncPlans[p];
        for (var i = 0; i < syncPlan.upsertItems.length; i++) {
          await window.cloud[syncPlan.cloudUpsertMethod](syncPlan.upsertItems[i]);
        }
      }
      alert(plan.successMessage);
      // 重新拉一次，状态以云端为准
      var pulledErrors = await window.cloud[plan.errorPullMethod]();
      var pulledPreps = await window.cloud[plan.prepPullMethod]();
      var pullResultPlan = window.GrammarSavedMaterialsModel.buildLocalCloudUploadPullResultPlan(
        pulledErrors,
        pulledPreps,
        window.errorBookQuestions,
        window.prepPassages,
        plan
      );
      window.errorBookQuestions = pullResultPlan.nextErrorItems;
      window.prepPassages = pullResultPlan.nextPrepItems;
      if (pullResultPlan.shouldSaveErrorBook) {
        window.saveErrorBook();
      }
      if (pullResultPlan.shouldSavePrepPassages) {
        window.savePrepPassages();
      }
      if (pullResultPlan.shouldRenderErrorBook) {
        _d.renderErrorBook();
      }
      if (pullResultPlan.shouldRenderPrepList) {
        _d.renderPrepList();
      }
      if (pullResultPlan.shouldRenderBankStat) {
        _d.renderBankStat();
      }
    } catch (e) {
      var errorPlan = window.GrammarSavedMaterialsModel.buildLocalCloudUploadFailurePlan(e);
      if (window.seeklumeObservability) window.seeklumeObservability.recordError(errorPlan.failureEvent, errorPlan.message || e, errorPlan.observabilityPayload);
      alert(errorPlan.alertMessage);
    }
  }

  // ─── 同步状态指示 ───
  var _syncOkTimer = null;
  function setSyncStatus(state, msg) {
    var el = document.getElementById('syncStatus');
    var model = window.GrammarAppState
      ? window.GrammarAppState.buildSyncStatusViewModel(state, msg)
      : {
          status: state || null,
          message: msg || '',
          visible: false,
          display: 'none',
          background: '',
          color: '',
          title: '',
          cursor: '',
          html: '',
          alertMessage: '',
          autoHideMs: 0
        };
    if (window.GrammarAppState) {
      window.GrammarAppState.patch({
        syncStatus: model.status,
        syncStatusMessage: model.message || ''
      });
    }
    if (!el) return;
    if (_syncOkTimer) { clearTimeout(_syncOkTimer); _syncOkTimer = null; }
    el.style.display = model.display;
    el.style.background = model.background;
    el.style.color = model.color;
    el.title = model.title;
    el.style.cursor = model.cursor;
    el.onclick = model.alertMessage ? function(){ alert(model.alertMessage); } : null;
    el.innerHTML = model.html;
    if (model.autoHideMs) _syncOkTimer = setTimeout(function(){ el.style.display = 'none'; }, model.autoHideMs);
  }

  // 计数同步引用计数，让两个同步函数共用一个状态
  var _syncInflight = 0;
  function syncBegin() {
    var state = window.GrammarAppState
      ? window.GrammarAppState.buildSyncBeginState(_syncInflight)
      : { syncInflight: _syncInflight + 1, syncStatus: 'syncing', syncStatusMessage: '', shouldUpdateStatus: true };
    _syncInflight = state.syncInflight;
    if (window.GrammarAppState) window.GrammarAppState.patch({
      syncInflight: state.syncInflight,
      syncStatus: state.syncStatus,
      syncStatusMessage: state.syncStatusMessage
    });
    if (state.shouldUpdateStatus) setSyncStatus(state.syncStatus, state.syncStatusMessage);
  }
  function syncEnd(err) {
    var state = window.GrammarAppState
      ? window.GrammarAppState.buildSyncEndState(_syncInflight, err)
      : {
          syncInflight: Math.max(0, _syncInflight - 1),
          syncStatus: Math.max(0, _syncInflight - 1) === 0 ? (err ? 'error' : 'ok') : 'syncing',
          syncStatusMessage: err ? (err.message || String(err)) : '',
          shouldUpdateStatus: Math.max(0, _syncInflight - 1) === 0
        };
    _syncInflight = state.syncInflight;
    if (window.GrammarAppState) window.GrammarAppState.patch({
      syncInflight: state.syncInflight,
      syncStatus: state.syncStatus,
      syncStatusMessage: state.syncStatusMessage
    });
    if (state.shouldUpdateStatus) setSyncStatus(state.syncStatus, state.syncStatusMessage);
  }

  var _syncQueueFallbacks = {
    errorSyncQueue: { pending: false, rerunRequested: false },
    prepSyncQueue: { pending: false, rerunRequested: false }
  };

  function getSavedMaterialsSyncQueueKey(kind) {
    return window.GrammarAppState
      ? window.GrammarAppState.getSavedMaterialsSyncQueueKey(kind)
      : (kind === 'prep' || kind === 'lessonPrep' ? 'prepSyncQueue' : 'errorSyncQueue');
  }

  function getSavedMaterialsSyncQueue(kind) {
    var key = getSavedMaterialsSyncQueueKey(kind);
    var queue = window.GrammarAppState && window.GrammarAppState.state
      ? window.GrammarAppState.state[key]
      : _syncQueueFallbacks[key];
    return window.GrammarAppState
      ? window.GrammarAppState.normalizeSyncQueueState(queue)
      : {
          pending: !!(queue && queue.pending),
          rerunRequested: !!(queue && queue.rerunRequested)
        };
  }

  function applySavedMaterialsSyncQueue(kind, queue) {
    var key = getSavedMaterialsSyncQueueKey(kind);
    var normalized = window.GrammarAppState
      ? window.GrammarAppState.normalizeSyncQueueState(queue)
      : {
          pending: !!(queue && queue.pending),
          rerunRequested: !!(queue && queue.rerunRequested)
        };
    _syncQueueFallbacks[key] = normalized;
    if (window.GrammarAppState) {
      var patch = {};
      patch[key] = normalized;
      window.GrammarAppState.patch(patch);
    }
    return normalized;
  }

  function requestSavedMaterialsSync(kind) {
    var state = window.GrammarAppState
      ? window.GrammarAppState.buildSyncQueueRequestState(getSavedMaterialsSyncQueue(kind))
      : (function(queue) {
          return queue.pending
            ? { queue: { pending: true, rerunRequested: true }, shouldRun: false }
            : { queue: { pending: true, rerunRequested: false }, shouldRun: true };
        })(getSavedMaterialsSyncQueue(kind));
    applySavedMaterialsSyncQueue(kind, state.queue);
    return !!state.shouldRun;
  }

  function finishSavedMaterialsSync(kind) {
    var state = window.GrammarAppState
      ? window.GrammarAppState.buildSyncQueueEndState(getSavedMaterialsSyncQueue(kind))
      : (function(queue) {
          return {
            queue: { pending: false, rerunRequested: false },
            shouldRunAgain: !!queue.rerunRequested
          };
        })(getSavedMaterialsSyncQueue(kind));
    applySavedMaterialsSyncQueue(kind, state.queue);
    return !!state.shouldRunAgain;
  }

  async function runSavedMaterialsCloudSync(kind, getLocalItems, rerun) {
    if (!requestSavedMaterialsSync(kind)) return;
    syncBegin();
    var caught = null;
    try {
      var runPlan = window.GrammarSavedMaterialsModel.buildSavedMaterialsCloudSyncRunPlan(kind, getLocalItems());
      var upsertPhase = runPlan.upsertPhase || {};
      for (var i = 0; i < (upsertPhase.items || []).length; i++) {
        await window.cloud[upsertPhase.method](upsertPhase.items[i]);
      }
      var cloudItems = await window.cloud[runPlan.pullPhase.method]();
      var cleanupPlan = window.GrammarSavedMaterialsModel.buildSavedMaterialsCloudSyncCleanupPlan(kind, getLocalItems(), cloudItems || []);
      var cleanupPhase = cleanupPlan.cleanupPhase || {};
      for (var j = 0; j < (cleanupPhase.ids || []).length; j++) {
        await window.cloud[cleanupPhase.method](cleanupPhase.ids[j]);
      }
    } catch (e) {
      var errorPlan = window.GrammarSavedMaterialsModel.buildSavedMaterialsCloudSyncFailurePlan(kind, e);
      console.error(errorPlan.syncFailureConsoleMessage, e);
      if (window.seeklumeObservability) window.seeklumeObservability.recordError(errorPlan.syncFailureEvent, errorPlan.message || e, errorPlan.observabilityPayload);
      caught = e;
    }
    finally {
      var shouldRunAgain = finishSavedMaterialsSync(kind);
      syncEnd(caught);
      if (shouldRunAgain) rerun();
    }
  }

  async function syncErrorBookToCloud() {
    return runSavedMaterialsCloudSync('error', function() { return window.errorBookQuestions; }, syncErrorBookToCloud);
  }

  async function syncPrepToCloud() {
    return runSavedMaterialsCloudSync('prep', function() { return window.prepPassages; }, syncPrepToCloud);
  }

  // ─── 猴补丁：拦截原始 save 函数，写本地后异步推到云 ───
  // 在模块加载时立即执行。捕获/重写均针对 window.*（saveErrorBook / savePrepPassages
  // 由 shared/error-book.js、shared/lesson-prep.js 定义为 window 全局，本脚本加载在其后）。
  var _origSaveError = window.saveErrorBook;
  window.saveErrorBook = function() {
    _origSaveError.apply(this, arguments);
    var plan = window.GrammarAppState
      ? window.GrammarAppState.buildSavedMaterialsSaveCloudPlan('error', window.cloud && window.cloud.state)
      : { shouldSyncCloud: !!(window.cloud && window.cloud.state && window.cloud.state.user && !window.cloud.state.viewingUserId) };
    if (plan.shouldSyncCloud) {
      // 全量同步：每次保存都把本地全量推一遍（小数据量场景没问题）
      syncErrorBookToCloud();
    }
  };
  var _origSavePrep = window.savePrepPassages;
  window.savePrepPassages = function() {
    _origSavePrep.apply(this, arguments);
    var plan = window.GrammarAppState
      ? window.GrammarAppState.buildSavedMaterialsSaveCloudPlan('prep', window.cloud && window.cloud.state)
      : { shouldSyncCloud: !!(window.cloud && window.cloud.state && window.cloud.state.user && !window.cloud.state.viewingUserId) };
    if (plan.shouldSyncCloud) {
      syncPrepToCloud();
    }
  };

  window.GrammarCloudSync = {
    getCloudLifecycleSnapshot: getCloudLifecycleSnapshot,
    setCloudLoggingOutState: setCloudLoggingOutState,
    applyCloudLifecycleState: applyCloudLifecycleState,
    clearCloudLifecycleState: clearCloudLifecycleState,
    onCloudStateChange: onCloudStateChange,
    uploadLocalToCloud: uploadLocalToCloud,
    setSyncStatus: setSyncStatus,
    syncBegin: syncBegin,
    syncEnd: syncEnd,
    getSavedMaterialsSyncQueueKey: getSavedMaterialsSyncQueueKey,
    getSavedMaterialsSyncQueue: getSavedMaterialsSyncQueue,
    applySavedMaterialsSyncQueue: applySavedMaterialsSyncQueue,
    requestSavedMaterialsSync: requestSavedMaterialsSync,
    finishSavedMaterialsSync: finishSavedMaterialsSync,
    runSavedMaterialsCloudSync: runSavedMaterialsCloudSync,
    syncErrorBookToCloud: syncErrorBookToCloud,
    syncPrepToCloud: syncPrepToCloud
  };
})();
