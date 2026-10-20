// shared/gate.js
//
// 全站统一登录门禁（登录墙）。
//
// 职责：
//   - 功能页强制登录：未登录 → 全屏登录/注册表单（用户名或邮箱均可登录）
//   - 注册审批制：已登录但管理员尚未审批 → “等待审批”屏（含退出登录/刷新状态）
//   - 已审批 → 移除遮罩放行，并向 document 派发 seeklume-gate-open 事件
//   - 放行后用户在页面内退出登录 → 门禁自动重新落下
//
// 状态机：loading → auth(登录/注册) → pending(等待审批) → open
//
// 审批判断：调用 Supabase RPC check_approved()（supabase/setup.sql 已定义）：
//   - 返回 false → 待审批屏
//   - 返回 true / 无记录 / RPC 不可用 → 放行（老用户与异常场景不锁死）
//   管理员审批入口：语法填空页 ?admin 面板（shared/admin-ui.js）。
//
// 依赖（必须先加载，均为同步 <script>）：
//   - https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2
//   - ../config.js        ← 提供 SUPABASE_URL / SUPABASE_ANON_KEY
//   - ../shared/cloud.js  ← 提供 window.cloud / window._sb
//
// 用法：功能页在 </body> 前引入本文件即可，页面无需提供任何 HTML/CSS。
//   首页（门厅）不引入本文件。本地模式（未配置 Supabase）自动跳过门禁。
//
// 页面变量兼容：颜色全部走 var(--x, fallback)，read-along / grammar-fill /
//   index 三套页面主题变量名一致，深色模式由页面自身切换变量值。

/* eslint-disable */
(function(){
  if (window.SeeklumeGate) return; // 防止重复初始化

  // ── 本地模式（未配置 Supabase）：不设门禁 ─────────────────────
  if (!window.cloud || !window.cloud.isConfigured || !window.cloud.isConfigured()) {
    window.SeeklumeGate = { state: 'bypassed' };
    return;
  }

  var _root = null;          // 遮罩根节点（open 后移除）
  var _view = 'loading';     // loading | auth | pending | open
  var _formMode = 'signin';  // signin | signup
  var _approvedCache = {};   // uid -> boolean（审批结果缓存，刷新按钮/轮询会清除）
  var _pendingTimer = null;  // pending 态 30s 轮询
  var _busy = false;         // 表单提交中

  var POLL_MS = 30000;
  var INIT_FALLBACK_MS = 5000; // cloud.init 通知迟迟不到时的兜底

  function el(id) { return document.getElementById(id); }

  // ─── 样式（一次性注入 <head>）──────────────────────────────
  function injectStyle() {
    if (document.getElementById('seeklume-gate-style')) return;
    var s = document.createElement('style');
    s.id = 'seeklume-gate-style';
    s.textContent = ''
      + 'body.gate-locked{overflow:hidden;}'
      + '#seeklume-gate{position:fixed;inset:0;z-index:2147483000;display:flex;overflow-y:auto;'
      +   'background:var(--bg,#f5f5f7);padding:24px 20px;'
      +   'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;}'
      + '#seeklume-gate .gate-card{margin:auto;width:100%;max-width:380px;background:var(--surface,#ffffff);'
      +   'border:1px solid var(--border,#e5e5ea);border-radius:16px;padding:34px 30px 26px;'
      +   'box-shadow:0 10px 40px rgba(0,0,0,.10);}'
      + '#seeklume-gate .gate-brand{font-family:Georgia,"Times New Roman",serif;font-size:22px;letter-spacing:.04em;'
      +   'color:var(--text,#1d1d1f);text-align:center;margin-bottom:22px;}'
      + '#seeklume-gate .gate-view{display:none;}'
      + '#seeklume-gate[data-view="loading"] .gate-view[data-gv="loading"]{display:block;}'
      + '#seeklume-gate[data-view="auth"] .gate-view[data-gv="auth"]{display:block;}'
      + '#seeklume-gate[data-view="pending"] .gate-view[data-gv="pending"]{display:block;}'
      + '#seeklume-gate .gate-title{font-size:20px;font-weight:600;color:var(--text,#1d1d1f);margin:0 0 6px;text-align:center;}'
      + '#seeklume-gate .gate-sub{font-size:13px;color:var(--text-2,#6e6e73);margin:0 0 22px;text-align:center;line-height:1.6;}'
      + '#seeklume-gate .gate-field{margin-bottom:14px;}'
      + '#seeklume-gate .gate-field label{display:block;font-size:13px;color:var(--text-2,#6e6e73);margin-bottom:6px;}'
      + '#seeklume-gate .gate-field input{width:100%;padding:10px 12px;border:1px solid var(--border,#e5e5ea);'
      +   'border-radius:9px;background:var(--surface-2,#fafafa);color:var(--text,#1d1d1f);font-size:14px;'
      +   'outline:none;transition:border-color .15s;}'
      + '#seeklume-gate .gate-field input:focus{border-color:var(--accent,#0071e3);}'
      + '#seeklume-gate .gate-msg{border-radius:8px;padding:9px 12px;font-size:13px;line-height:1.5;margin-bottom:14px;}'
      + '#seeklume-gate .gate-error{background:rgba(255,59,48,.10);color:#d70015;}'
      + '#seeklume-gate .gate-info{background:rgba(52,199,89,.12);color:#1d8a3e;}'
      + '#seeklume-gate .gate-btn{display:block;width:100%;padding:11px;border:none;border-radius:9px;'
      +   'font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:opacity .15s;}'
      + '#seeklume-gate .gate-btn.primary{background:var(--accent,#0071e3);color:#ffffff;}'
      + '#seeklume-gate .gate-btn.ghost{background:transparent;color:var(--text-2,#6e6e73);'
      +   'border:1px solid var(--border,#e5e5ea);margin-top:10px;}'
      + '#seeklume-gate .gate-btn:hover:not(:disabled){opacity:.85;}'
      + '#seeklume-gate .gate-btn:disabled{opacity:.55;cursor:default;}'
      + '#seeklume-gate .gate-switch{text-align:center;font-size:13px;color:var(--text-2,#6e6e73);margin-top:16px;}'
      + '#seeklume-gate .gate-switch a{color:var(--accent,#0071e3);cursor:pointer;text-decoration:none;font-weight:600;}'
      + '#seeklume-gate .gate-approve-note{text-align:center;font-size:12px;color:var(--text-3,#aeaeb2);'
      +   'margin:14px 0 0;line-height:1.6;}'
      + '#seeklume-gate .gate-loading-text{text-align:center;font-size:14px;color:var(--text-2,#6e6e73);margin:18px 0 0;}'
      + '#seeklume-gate .gate-spinner{width:34px;height:34px;margin:26px auto 0;border-radius:50%;'
      +   'border:3px solid var(--border,#e5e5ea);border-top-color:var(--accent,#0071e3);'
      +   'animation:seeklume-gate-spin .8s linear infinite;}'
      + '@keyframes seeklume-gate-spin{to{transform:rotate(360deg);}}'
      + '#seeklume-gate .gate-pending-icon{text-align:center;font-size:44px;margin:6px 0 10px;}'
      + '#seeklume-gate .gate-pending-desc{font-size:13px;color:var(--text-2,#6e6e73);line-height:1.7;'
      +   'margin:0 0 22px;text-align:center;}'
      + '#seeklume-gate .gate-home-link{display:block;text-align:center;font-size:13px;'
      +   'color:var(--text-3,#aeaeb2);text-decoration:none;margin-top:22px;}'
      + '#seeklume-gate .gate-home-link:hover{color:var(--text-2,#6e6e73);}';
    document.head.appendChild(s);
  }

  // ─── 构建 DOM ─────────────────────────────────────────────
  function build() {
    if (_root) return;
    injectStyle();
    _root = document.createElement('div');
    _root.id = 'seeklume-gate';
    _root.setAttribute('data-view', 'loading');
    _root.innerHTML = ''
      + '<div class="gate-card" role="dialog" aria-label="登录">'
      +   '<div class="gate-brand">Seeklume</div>'

      +   '<div class="gate-view" data-gv="loading">'
      +     '<div class="gate-spinner" aria-hidden="true"></div>'
      +     '<p class="gate-loading-text">正在验证登录状态…</p>'
      +   '</div>'

      +   '<div class="gate-view" data-gv="auth">'
      +     '<h2 class="gate-title" id="gateTitle">欢迎回来</h2>'
      +     '<p class="gate-sub">教学功能需登录后使用</p>'
      +     '<form id="gateForm" novalidate>'
      +       '<div class="gate-field" id="gateFieldLogin">'
      +         '<label for="gateLogin">用户名或邮箱</label>'
      +         '<input id="gateLogin" type="text" autocomplete="username" placeholder="用户名 或 邮箱">'
      +       '</div>'
      +       '<div class="gate-field" id="gateFieldUsername">'
      +         '<label for="gateUsername">用户名</label>'
      +         '<input id="gateUsername" type="text" autocomplete="username" placeholder="2 个字符以上，不含 @">'
      +       '</div>'
      +       '<div class="gate-field" id="gateFieldEmail">'
      +         '<label for="gateEmail">邮箱</label>'
      +         '<input id="gateEmail" type="email" autocomplete="email" placeholder="you@example.com">'
      +       '</div>'
      +       '<div class="gate-field">'
      +         '<label for="gatePassword">密码</label>'
      +         '<input id="gatePassword" type="password" autocomplete="current-password" placeholder="至少 6 位">'
      +       '</div>'
      +       '<div class="gate-msg gate-error" id="gateError" hidden></div>'
      +       '<div class="gate-msg gate-info" id="gateInfo" hidden></div>'
      +       '<button type="submit" class="gate-btn primary" id="gateSubmit">登录</button>'
      +     '</form>'
      +     '<div class="gate-switch">'
      +       '<span id="gateSwitchText">还没有账号？</span>'
      +       '<a id="gateSwitchLink">注册新账号</a>'
      +     '</div>'
      +     '<p class="gate-approve-note">注册后需管理员审批，通过后即可使用全部功能</p>'
      +   '</div>'

      +   '<div class="gate-view" data-gv="pending">'
      +     '<div class="gate-pending-icon" aria-hidden="true">⏳</div>'
      +     '<h2 class="gate-title">等待管理员审批</h2>'
      +     '<p class="gate-sub">你好，<b id="gatePendingName"></b></p>'
      +     '<p class="gate-pending-desc">账号已注册成功。管理员审批通过后即可使用本站功能，'
      +       '本页每 30 秒自动检查一次审批状态，无需重新登录。</p>'
      +     '<button class="gate-btn primary" id="gateRefreshBtn">刷新审批状态</button>'
      +     '<button class="gate-btn ghost" id="gateLogoutBtn">退出登录</button>'
      +   '</div>'

      +   '<a class="gate-home-link" href="../index.html">← 返回首页</a>'
      + '</div>';
    document.body.appendChild(_root);
    document.body.classList.add('gate-locked');

    // 事件绑定（无内联 handler）
    el('gateForm').addEventListener('submit', function(ev){ ev.preventDefault(); submit(); });
    el('gateSwitchLink').addEventListener('click', function(){ toggleMode(); });
    el('gateRefreshBtn').addEventListener('click', function(){ refreshApproval(); });
    el('gateLogoutBtn').addEventListener('click', function(){
      setBusyText('gateLogoutBtn', '退出中…');
      window.cloud.signOut(); // 状态回调会自动落回登录表单
    });
    applyMode();
  }

  // ─── 视图切换 ─────────────────────────────────────────────
  function setView(name) {
    if (name !== 'open') build();
    _view = name;
    if (!_root) return;
    _root.setAttribute('data-view', name);
    if (name === 'auth') {
      applyMode();
      setTimeout(function(){
        var f = _formMode === 'signin' ? el('gateLogin') : el('gateUsername');
        if (f) f.focus();
      }, 60);
    }
    if (name === 'pending') {
      var user = window.cloud.state && window.cloud.state.user;
      var nameEl = el('gatePendingName');
      if (nameEl && user) nameEl.textContent = displayName(user);
      startPendingPoll();
    } else {
      stopPendingPoll();
    }
  }

  function open() {
    stopPendingPoll();
    _view = 'open';
    if (_root && _root.parentNode) _root.parentNode.removeChild(_root);
    _root = null;
    document.body.classList.remove('gate-locked');
    window.SeeklumeGate = { state: 'open' };
    try { document.dispatchEvent(new CustomEvent('seeklume-gate-open')); } catch(e) {}
  }

  // ─── 表单模式（登录 / 注册）──────────────────────────────
  function applyMode() {
    if (!_root) return;
    var isSignin = _formMode === 'signin';
    el('gateFieldLogin').style.display = isSignin ? '' : 'none';
    el('gateFieldUsername').style.display = isSignin ? 'none' : '';
    el('gateFieldEmail').style.display = isSignin ? 'none' : '';
    el('gateTitle').textContent = isSignin ? '欢迎回来' : '创建账号';
    el('gateSubmit').textContent = isSignin ? '登录' : '注册';
    el('gateSwitchText').textContent = isSignin ? '还没有账号？' : '已有账号？';
    el('gateSwitchLink').textContent = isSignin ? '注册新账号' : '去登录';
    el('gatePassword').setAttribute('autocomplete', isSignin ? 'current-password' : 'new-password');
  }

  function toggleMode() {
    _formMode = (_formMode === 'signin') ? 'signup' : 'signin';
    hideMsg();
    el('gatePassword').value = '';
    applyMode();
  }

  function showError(msg) {
    var e = el('gateError');
    e.textContent = msg;
    e.hidden = false;
    var i = el('gateInfo'); if (i) i.hidden = true;
  }
  function showInfo(msg) {
    var i = el('gateInfo');
    i.textContent = msg;
    i.hidden = false;
    var e = el('gateError'); if (e) e.hidden = true;
  }
  function hideMsg() {
    if (!_root) return;
    el('gateError').hidden = true;
    el('gateInfo').hidden = true;
  }

  function setBusyText(id, text) {
    var b = el(id);
    if (b) { b.disabled = true; b.textContent = text; }
  }

  function friendlyError(e) {
    var msg = (e && e.message) ? e.message : String(e);
    if (/Invalid login credentials/i.test(msg)) return '用户名/邮箱或密码不正确';
    if (/email not confirmed/i.test(msg)) return '邮箱还没验证，请检查邮箱并点击验证链接';
    if (/already registered|already exists/i.test(msg)) return '该邮箱已注册，请直接登录';
    if (/password should be|at least 6/i.test(msg)) return '密码至少 6 位';
    return msg;
  }

  function displayName(user) {
    if (!user) return '';
    return (user.user_metadata && user.user_metadata.username)
        || (user.email || '').split('@')[0]
        || '同学';
  }

  // ─── 提交（登录 / 注册）─────────────────────────────────
  async function submit() {
    if (_busy) return;
    hideMsg();
    var login = el('gateLogin').value.trim();
    var username = el('gateUsername').value.trim();
    var email = el('gateEmail').value.trim();
    var pwd = el('gatePassword').value;

    if (_formMode === 'signin') {
      if (!login) return showError('请输入用户名或邮箱');
      if (!pwd) return showError('请输入密码');
    } else {
      if (!username || username.length < 2) return showError('用户名至少 2 个字符');
      if (username.indexOf('@') !== -1) return showError('用户名不能包含 @ 符号');
      if (!email || email.indexOf('@') === -1) return showError('请输入有效的邮箱地址');
      if (pwd.length < 6) return showError('密码至少 6 位');
    }

    _busy = true;
    var btn = el('gateSubmit');
    var oldText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '处理中…';
    try {
      if (_formMode === 'signup') {
        try {
          if (window.cloud.usernameTaken && await window.cloud.usernameTaken(username)) {
            return showError('该用户名已被占用，请换一个');
          }
        } catch(_) { /* RPC 不可用时放行，交给注册接口兜底 */ }
        var r = await window.cloud.signUp(email, username, pwd);
        if (!(r && r.session)) {
          // 未自动登录（如需邮箱验证）：引导去登录
          _formMode = 'signin';
          applyMode();
          el('gateLogin').value = email;
          el('gatePassword').value = '';
          showInfo('注册成功！请使用邮箱或用户名登录。');
          return;
        }
        // 已自动登录：等待 onAuthStateChange → handleState 接管（先转 loading）
        setView('loading');
      } else {
        await window.cloud.signIn(login, pwd);
        setView('loading'); // 等待 onAuthStateChange → handleState
      }
    } catch (e) {
      showError(friendlyError(e));
    } finally {
      _busy = false;
      btn.disabled = false;
      btn.textContent = oldText;
    }
  }

  // ─── 审批检查 ─────────────────────────────────────────────
  function ensureApproved(user) {
    var uid = user.id;
    if (Object.prototype.hasOwnProperty.call(_approvedCache, uid)) {
      return Promise.resolve(_approvedCache[uid]);
    }
    if (!window._sb) return Promise.resolve(true);
    return window._sb.rpc('check_approved').then(function(r) {
      // RPC 报错（如尚未建函数）→ 放行，避免把老用户锁死
      var ok = (r && r.error) ? true : (r ? r.data !== false : true);
      _approvedCache[uid] = ok;
      return ok;
    }).catch(function() {
      return true; // 网络异常时放行；下次状态变化会重新检查（不写缓存）
    });
  }

  function recheckApproval(user) {
    delete _approvedCache[user.id];
    return ensureApproved(user);
  }

  function refreshApproval() {
    var user = window.cloud.state && window.cloud.state.user;
    if (!user) return;
    setBusyText('gateRefreshBtn', '查询中…');
    recheckApproval(user).then(function(ok) {
      var nowUser = window.cloud.state && window.cloud.state.user;
      if (!nowUser || nowUser.id !== user.id) return;
      if (ok) { open(); return; }
      var b = el('gateRefreshBtn');
      if (b) { b.disabled = false; b.textContent = '刷新审批状态'; }
    });
  }

  function startPendingPoll() {
    stopPendingPoll();
    _pendingTimer = setInterval(function() {
      var user = window.cloud.state && window.cloud.state.user;
      if (!user) return;
      recheckApproval(user).then(function(ok) {
        var nowUser = window.cloud.state && window.cloud.state.user;
        if (!nowUser || nowUser.id !== user.id) return;
        if (ok) open();
      });
    }, POLL_MS);
  }
  function stopPendingPoll() {
    if (_pendingTimer) { clearInterval(_pendingTimer); _pendingTimer = null; }
  }

  // ─── cloud 状态 → 门禁状态机 ─────────────────────────────
  function handleState(state) {
    var user = state && state.user;
    if (!user) {
      _formMode = 'signin';
      setView('auth');
      if (_root) {
        el('gatePassword').value = '';
        hideMsg();
      }
      return;
    }
    // 已登录：先转 loading，再查审批
    setView('loading');
    ensureApproved(user).then(function(ok) {
      // 防竞态：结果回来时用户可能已切换/退出
      var nowUser = window.cloud.state && window.cloud.state.user;
      if (!nowUser || nowUser.id !== user.id) return;
      if (ok) open(); else setView('pending');
    });
  }

  // ─── 启动 ─────────────────────────────────────────────────
  window.SeeklumeGate = { state: 'loading' };
  build(); // 先以 loading 落地，避免页面内容闪现

  // onChange 注册时会同步回调一次（state 尚未就绪），跳过之；
  // 真实状态由 cloud.init() 完成后的 notify 驱动。
  var _skipSyncCallback = true;
  window.cloud.onChange(function() {
    if (_skipSyncCallback) { _skipSyncCallback = false; return; }
    handleState(window.cloud.state);
  });

  // 兜底：若 INIT_FALLBACK_MS 内没有任何异步通知（如 init 已被先调用过），
  // 按当前已知状态处理，避免卡在 loading。
  setTimeout(function() {
    if (_view === 'loading') handleState(window.cloud.state);
  }, INIT_FALLBACK_MS);

  window.cloud.init();
})();
