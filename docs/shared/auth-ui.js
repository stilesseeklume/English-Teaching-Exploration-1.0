// shared/auth-ui.js
//
// 账户系统 UI 层（题型无关）：用户信息条 + 登录/注册弹窗 + 设置弹窗 + 退出。
//
// 职责：
//   - renderUserPill(state)：右上角用户信息条渲染（登录前/登录后/管理员标签）
//   - requireAuth(label)：业务操作前的"需要登录"守卫
//   - openAuthModal / closeAuthModal / applyAuthMode / toggleAuthMode / authBackToSignin / submitAuth
//   - openSettingsModal / closeSettingsModal / changeMyPassword / requestMyUsernameChange
//   - doLogout
//
// 不负责：
//   - 弹窗 HTML 结构（仍在 index.html，未来可抽出为 mount 函数动态注入）
//   - onCloudStateChange / setSyncStatus（与具体题型的渲染绑定，留在 index.html）
//
// 依赖（必须在 auth-ui.js 之前加载）：
//   - shared/cloud.js     提供 window.cloud / window._sb
//   - shared/lesson-prep.js 提供 window.prepPassages / savePrepPassages（doLogout 清理用）
//
// 题型侧（index.html）必须提供的全局符号：
//   - switchPage(name)
//   - getUserDisplayName(user)
//   - 状态变量/桥：setCloudLoggingOutState()，clearCloudLifecycleState()

/* eslint-disable */
(function(){
  var _authMode = 'signin';

  // ─── 用户信息条 ───────────────────────────────
  function renderUserPill(state) {
    var el = document.getElementById('userPill');
    if (!el) return;
    if (!window.cloud || !window.cloud.isConfigured()) {
      el.innerHTML = '<span style="color:var(--text-3);font-size:11px;">本地模式</span>';
      return;
    }
    if (state.user) {
      var name = window.getUserDisplayName(state.user);
      var short = name.length > 20 ? name.slice(0, 18) + '…' : name;
      var adminTag = state.isAdmin ? '<button onclick="switchPage(\'admin\')" title="管理员面板" style="background:var(--accent);color:#fff;padding:3px 8px;border-radius:4px;font-size:10px;font-weight:600;border:none;cursor:pointer;margin-right:6px;font-family:inherit;">管理员</button>' : '';
      el.innerHTML = adminTag + '<span title="' + escapeHtml(name) + '" style="color:var(--text);">' + escapeHtml(short) + '</span>'
        + '<button onclick="openSettingsModal()" title="账户设置" style="border:none;background:var(--surface-3);padding:4px 7px;border-radius:4px;font-size:13px;cursor:pointer;">⚙</button>'
        + '<button onclick="doLogout()" style="border:none;background:var(--surface-3);padding:4px 10px;border-radius:4px;font-size:12px;cursor:pointer;">退出</button>';
    } else {
      el.innerHTML = '<span style="color:var(--text-3);font-size:11px;margin-right:8px;">访客模式</span>'
        + '<button onclick="openAuthModal(\'signin\')" style="border:none;background:var(--accent);color:#fff;padding:6px 14px;border-radius:6px;font-size:13px;cursor:pointer;">登录 / 注册</button>';
    }
  }

  function requireAuth(actionLabel) {
    if (window.cloud && window.cloud.state && window.cloud.state.user) return true;
    // 改默认为 signin：老用户先尝试登录，失败再注册
    openAuthModal('signin');
    return false;
  }

  // ─── 登录 / 注册弹窗 ───────────────────────────
  function openAuthModal(mode) {
    _authMode = mode || 'signin';
    document.getElementById('authFormPanel').style.display = '';
    document.getElementById('authSuccessPanel').style.display = 'none';
    document.getElementById('authError').style.display = 'none';
    document.getElementById('authInfo').style.display = 'none';
    document.getElementById('authEmail').value = '';
    document.getElementById('authUsername').value = '';
    document.getElementById('authPassword').value = '';
    applyAuthMode();
    document.getElementById('authModal').style.display = 'flex';
    setTimeout(function(){ document.getElementById('authEmail').focus(); }, 50);
  }
  function closeAuthModal() { document.getElementById('authModal').style.display = 'none'; }

  function toggleAuthMode() {
    _authMode = (_authMode === 'signin') ? 'signup' : 'signin';
    document.getElementById('authError').style.display = 'none';
    document.getElementById('authInfo').style.display = 'none';
    applyAuthMode();
  }
  function applyAuthMode() {
    var isSignin = _authMode === 'signin';
    document.getElementById('authTitle').textContent = isSignin ? '登录' : '注册';
    document.getElementById('authPrimaryBtn').textContent = isSignin ? '登录' : '创建账号';
    document.getElementById('authSwitchText').textContent = isSignin ? '没有账号？' : '已有账号？';
    document.getElementById('authSwitchLink').textContent = isSignin ? '注册' : '去登录';
    document.getElementById('authPassword').autocomplete = isSignin ? 'current-password' : 'new-password';
    document.getElementById('authSignupHint').style.display = isSignin ? 'none' : 'block';
    document.getElementById('authUsernameRow').style.display = isSignin ? 'none' : 'block';
    document.getElementById('authEmail').autocomplete = isSignin ? 'email' : 'email';
  }
  function authBackToSignin() {
    document.getElementById('authSuccessPanel').style.display = 'none';
    document.getElementById('authFormPanel').style.display = '';
    _authMode = 'signin';
    applyAuthMode();
    document.getElementById('authPassword').value = '';
    setTimeout(function(){ document.getElementById('authPassword').focus(); }, 50);
  }

  async function submitAuth() {
    var email = document.getElementById('authEmail').value.trim();
    var username = document.getElementById('authUsername').value.trim();
    var pwd = document.getElementById('authPassword').value;
    var errEl = document.getElementById('authError');
    var infoEl = document.getElementById('authInfo');
    errEl.style.display = 'none'; infoEl.style.display = 'none';

    if (!pwd) { errEl.innerHTML = '密码不能为空'; errEl.style.display = 'block'; return; }
    if (pwd.length < 6) { errEl.innerHTML = '密码至少 6 位'; errEl.style.display = 'block'; return; }

    if (_authMode === 'signup') {
      if (!email || email.indexOf('@') === -1) { errEl.innerHTML = '请输入有效的邮箱地址'; errEl.style.display = 'block'; return; }
      if (!username) { errEl.innerHTML = '请设置一个用户名'; errEl.style.display = 'block'; return; }
      if (username.indexOf('@') !== -1) { errEl.innerHTML = '用户名不能包含 @ 符号'; errEl.style.display = 'block'; return; }
      if (username.length < 2) { errEl.innerHTML = '用户名至少 2 个字符'; errEl.style.display = 'block'; return; }
    } else {
      if (!email) { errEl.innerHTML = '请输入邮箱或用户名'; errEl.style.display = 'block'; return; }
    }

    var btn = document.getElementById('authPrimaryBtn');
    btn.disabled = true; var oldText = btn.textContent; btn.textContent = '处理中…';
    try {
      if (_authMode === 'signup' && window.cloud) {
        var taken = await window.cloud.usernameTaken(username);
        if (taken) { errEl.innerHTML = '该用户名已被占用，请换一个'; errEl.style.display = 'block'; btn.disabled = false; btn.textContent = oldText; return; }
      }
    } catch(_) { /* RPC 不可用时放行 */ }
    try {
      if (_authMode === 'signin') {
        await window.cloud.signIn(email, pwd);
        closeAuthModal();
      } else {
        var r = await window.cloud.signUp(email, username, pwd);
        if (r && r.session) {
          closeAuthModal();
        } else {
          document.getElementById('authSuccessEmail').textContent = email;
          document.getElementById('authFormPanel').style.display = 'none';
          document.getElementById('authSuccessPanel').style.display = '';
        }
      }
    } catch (e) {
      var msg = (e.message || e) + '';
      if (/email not confirmed/i.test(msg)) {
        errEl.innerHTML = '邮箱还没验证，请检查邮箱并点击验证链接。';
      } else if (/invalid login credentials/i.test(msg)) {
        errEl.innerHTML = '邮箱或密码错误。注册的话请先切到「注册」。';
      } else if (/user already registered/i.test(msg)) {
        errEl.innerHTML = '该邮箱已被注册。如忘记密码请联系管理员。';
      } else if (/password should be at least/i.test(msg)) {
        errEl.innerHTML = '密码太短（至少 6 位）';
      } else if (/rate limit/i.test(msg)) {
        errEl.innerHTML = '请求太频繁，过 1 分钟再试。';
      } else {
        errEl.innerHTML = msg;
      }
      errEl.style.display = 'block';
    } finally {
      btn.disabled = false; btn.textContent = oldText;
    }
  }

  // ─── 账户设置弹窗 ──────────────────────────────
  function openSettingsModal() {
    var s = document.getElementById('settingsModal');
    s.style.display = 'flex';
    document.getElementById('settingsNewPwd').value = '';
    document.getElementById('settingsNewUsername').value = '';
    document.getElementById('settingsPwdMsg').textContent = '';
    document.getElementById('settingsUnameMsg').textContent = '';
    settingsDataMsg('var(--text-2)', '');
    var pu = window.cloud && window.cloud.pendingUsername;
    if (pu) {
      document.getElementById('pendingUsernameInfo').style.display = '';
      document.getElementById('pendingUsernameVal').textContent = pu;
    } else {
      document.getElementById('pendingUsernameInfo').style.display = 'none';
    }
  }
  function closeSettingsModal() {
    document.getElementById('settingsModal').style.display = 'none';
  }
  async function changeMyPassword() {
    var pwd = document.getElementById('settingsNewPwd').value;
    var msg = document.getElementById('settingsPwdMsg');
    msg.style.color = 'var(--text-2)'; msg.textContent = '';
    if (pwd.length < 6) { msg.style.color = 'var(--red)'; msg.textContent = '密码至少 6 位'; return; }
    try {
      await window.cloud.changePassword(pwd);
      msg.style.color = 'var(--green)';
      msg.textContent = '密码已更新';
      document.getElementById('settingsNewPwd').value = '';
    } catch (e) {
      msg.style.color = 'var(--red)';
      msg.textContent = '失败：' + (e.message || e);
    }
  }
  async function requestMyUsernameChange() {
    var uname = document.getElementById('settingsNewUsername').value.trim();
    var msg = document.getElementById('settingsUnameMsg');
    msg.style.color = 'var(--text-2)'; msg.textContent = '';
    if (uname.length < 2) { msg.style.color = 'var(--red)'; msg.textContent = '用户名至少 2 个字符'; return; }
    if (uname.indexOf('@') !== -1) { msg.style.color = 'var(--red)'; msg.textContent = '用户名不能包含 @'; return; }
    try {
      await window.cloud.requestUsernameChange(uname);
      msg.style.color = 'var(--green)';
      msg.textContent = '用户名已更新';
      document.getElementById('settingsNewUsername').value = '';
      document.getElementById('pendingUsernameInfo').style.display = '';
      document.getElementById('pendingUsernameVal').textContent = uname;
      window.cloud.pendingUsername = uname;
      if (window._sb) await window._sb.auth.refreshSession();
    } catch (e) {
      msg.style.color = 'var(--red)';
      msg.textContent = '失败：' + (e.message || e);
    }
  }

  function settingsDataMsg(color, text) {
    var msg = document.getElementById('settingsDataMsg');
    if (msg) {
      msg.style.color = color;
      msg.textContent = text || '';
    }
  }

  function getSafeUserExportInfo() {
    var user = window.cloud && window.cloud.state && window.cloud.state.user;
    if (!user) return null;
    return {
      id: user.id || '',
      email: user.email || '',
      username: user.user_metadata && user.user_metadata.username ? user.user_metadata.username : ''
    };
  }

  function cloneData(value) {
    try { return JSON.parse(JSON.stringify(value || [])); }
    catch(e) { return []; }
  }

  async function exportMyLearningData() {
    if (window.cloud && window.cloud.state && window.cloud.state.viewingUserId) {
      settingsDataMsg('var(--red)', '管理员查看他人数据时不能导出。');
      return;
    }
    var btn = document.getElementById('settingsExportDataBtn');
    if (btn) btn.disabled = true;
    settingsDataMsg('var(--text-2)', '正在准备导出…');
    try {
      var preps = window.prepPassages || [];
      if (window.cloud && window.cloud.state && window.cloud.state.user) {
        var cloudPreps = await window.cloud.pullLessonPrep();
        if (cloudPreps) preps = cloudPreps;
      }
      var payload = {
        app: 'seeklume',
        export_version: 1,
        exported_at: new Date().toISOString(),
        user: getSafeUserExportInfo(),
        data: {
          lesson_prep: cloneData(preps)
        }
      };
      var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'seeklume-learning-data-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
      settingsDataMsg('var(--green)', '已导出备课资料。');
      if (window.cloud && window.cloud.recordEvent) {
        window.cloud.recordEvent({
          event_type: 'learning_data_exported',
          severity: 'info',
          module: 'account-settings',
          message: 'learning data exported',
          context: { prep_count: preps.length }
        }).catch(function(){});
      }
    } catch (e) {
      settingsDataMsg('var(--red)', '导出失败：' + (e.message || e));
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async function clearMyLearningData() {
    if (window.cloud && window.cloud.state && window.cloud.state.viewingUserId) {
      settingsDataMsg('var(--red)', '管理员查看他人数据时不能清空。');
      return;
    }
    if (!confirm('确定清空自己的备课资料吗？\n这会删除云端学习数据，并清空本机缓存。')) return;
    var btn = document.getElementById('settingsClearDataBtn');
    if (btn) btn.disabled = true;
    settingsDataMsg('var(--text-2)', '正在清空…');
    try {
      if (window.cloud && window.cloud.state && window.cloud.state.user && window.cloud.clearLearningData) {
        await window.cloud.clearLearningData();
      }
      window.prepPassages = [];
      if (typeof window.savePrepPassages === 'function') window.savePrepPassages();
      if (typeof window.renderPrepList === 'function') window.renderPrepList();
      if (typeof window.renderBankStat === 'function') window.renderBankStat();
      settingsDataMsg('var(--green)', '备课资料已清空。');
      if (window.cloud && window.cloud.recordEvent) {
        window.cloud.recordEvent({
          event_type: 'learning_data_cleared',
          severity: 'warning',
          module: 'account-settings',
          message: 'learning data cleared',
          context: { scope: 'lesson_prep' }
        }).catch(function(){});
      }
    } catch (e) {
      settingsDataMsg('var(--red)', '清空失败：' + (e.message || e));
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async function requestMyAccountDeletion() {
    if (!confirm('提交账号删除申请？\n管理员处理前账号不会立即删除。')) return;
    var btn = document.getElementById('settingsAccountDeleteBtn');
    if (btn) btn.disabled = true;
    settingsDataMsg('var(--text-2)', '正在提交删除申请…');
    try {
      if (!window.cloud || !window.cloud.submitFeedback) throw new Error('反馈系统未配置');
      var user = getSafeUserExportInfo();
      await window.cloud.submitFeedback({
        category: 'feature',
        severity: 'P1',
        reproducible: 'yes',
        affected_users_count: 1,
        source: 'user',
        module: 'account-settings',
        message: '用户请求删除账号及相关云端数据。',
        context: {
          request_type: 'account_deletion',
          user_id: user ? user.id : '',
          email: user ? user.email : ''
        }
      });
      settingsDataMsg('var(--green)', '账号删除申请已提交，管理员会按隐私说明处理。');
      if (window.cloud && window.cloud.recordEvent) {
        window.cloud.recordEvent({
          event_type: 'account_deletion_requested',
          severity: 'warning',
          module: 'account-settings',
          message: 'account deletion requested',
          context: { request_type: 'account_deletion' }
        }).catch(function(){});
      }
    } catch (e) {
      settingsDataMsg('var(--red)', '提交失败：' + (e.message || e));
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // ─── 退出登录 ─────────────────────────────────
  async function doLogout() {
    if (!confirm('确定要退出登录吗？\n（备课资料会从本地清空，下次登录会自动从云端拉回来）')) return;
    if (window.setCloudLoggingOutState) window.setCloudLoggingOutState(true);
    else window._loggingOut = true;
    try {
      await window.cloud.signOut();
    } catch (e) {
      // 即使服务端退出失败，本地照常清理
    }
    // 清除本地 Supabase session（彻底退出）
    try { localStorage.removeItem('sb-zwbvcqkfbndgmyfxtkyl-auth-token'); } catch(e) {}
    window.prepPassages = [];
    window.savePrepPassages();
    if (window.clearCloudLifecycleState) window.clearCloudLifecycleState();
    else {
      window._lastCloudUser = null;
      window._migrationPromptShown = false;
    }
    document.body.classList.remove('pending');
    document.documentElement.classList.remove('has-session');
    window.cloud.state.user = null;
    window.cloud.state.isAdmin = false;
    // 退出登录后回到顶层欢迎页
    window.location.replace('/');
  }

  // ─── 暴露到 window（为 HTML 内联 onclick 服务）──
  window.renderUserPill = renderUserPill;
  window.requireAuth = requireAuth;
  window.openAuthModal = openAuthModal;
  window.closeAuthModal = closeAuthModal;
  window.toggleAuthMode = toggleAuthMode;
  window.applyAuthMode = applyAuthMode;
  window.authBackToSignin = authBackToSignin;
  window.submitAuth = submitAuth;
  window.openSettingsModal = openSettingsModal;
  window.closeSettingsModal = closeSettingsModal;
  window.changeMyPassword = changeMyPassword;
  window.requestMyUsernameChange = requestMyUsernameChange;
  window.exportMyLearningData = exportMyLearningData;
  window.clearMyLearningData = clearMyLearningData;
  window.requestMyAccountDeletion = requestMyAccountDeletion;
  window.doLogout = doLogout;
})();
