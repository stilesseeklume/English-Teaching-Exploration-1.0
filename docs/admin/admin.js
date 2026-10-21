// docs/admin/admin.js
//
// 独立管理后台逻辑：用户列表（含邮箱）/ 搜索筛选 / 审批 / 删除 /
// 改名审批 / 发送重置密码邮件 / 以用户身份查看数据 / 用户反馈处理。
//
// 依赖（顺序不可变）：
//   - Supabase JS CDN
//   - ../config.js
//   - ../shared/cloud.js   （window.cloud）
//   - ../shared/gate.js    （登录墙 + 审批门禁）
//
// 数据来自 cloud.listUsers() → RPC admin_list_users，
// 返回字段：id / email / username / created_at / last_sign_in_at /
//           approved / pending_username / error_count / prep_count

/* eslint-disable */
(function () {
  var state = {
    users: [],
    feedback: [],
    filter: 'all',
    query: '',
    loading: false
  };

  var FEEDBACK_STATUS = {
    new: '新反馈',
    triaged: '已分诊',
    in_progress: '处理中',
    released: '已发布',
    closed: '已关闭'
  };

  var FEEDBACK_CATEGORY = {
    bug: 'Bug',
    data: '内容',
    ux: '体验',
    ai: 'AI',
    feature: '功能'
  };

  function $(id) { return document.getElementById(id); }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function fmtDate(value) {
    if (!value) return '从未';
    var d = new Date(value);
    if (isNaN(d.getTime())) return '未知';
    return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  function displayName(user) {
    return user.username || (user.email || '').split('@')[0] || '(无用户名)';
  }

  function initial(name) {
    var text = String(name || '?').trim();
    return text ? text.slice(0, 1).toUpperCase() : '?';
  }

  var toastTimer = null;
  function toast(message) {
    var el = $('toast');
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 1800);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var box = document.createElement('textarea');
        box.value = text;
        box.style.position = 'fixed';
        box.style.opacity = '0';
        document.body.appendChild(box);
        box.select();
        document.execCommand('copy');
        document.body.removeChild(box);
        resolve();
      } catch (e) { reject(e); }
    });
  }

  // ── 权限与初始状态 ────────────────────────────────
  function showPanel(name) {
    $('verifyPanel').hidden = name !== 'verify';
    $('denyPanel').hidden = name !== 'deny';
    $('consolePanel').hidden = name !== 'console';
  }

  function onCloudState() {
    if (!window.cloud || !window.cloud.isConfigured || !window.cloud.isConfigured()) {
      showPanel('deny');
      var deny = $('denyPanel');
      if (deny) deny.querySelector('p').textContent = '当前为本地模式，未配置 Supabase，管理后台不可用。';
      return;
    }
    var st = window.cloud.state;
    if (!st.user) {
      // 未登录时 gate.js 会盖住页面，这里保持验证态即可
      showPanel('verify');
      return;
    }
    if (!st.isAdmin) {
      showPanel('deny');
      return;
    }
    showPanel('console');
    loadAll();
  }

  // ── 数据加载 ─────────────────────────────────────
  var loadToken = 0;
  async function loadAll() {
    var token = ++loadToken;
    state.loading = true;
    $('userHint').textContent = '正在加载用户…';
    try {
      var users = await window.cloud.listUsers();
      if (token !== loadToken) return;
      state.users = users || [];
      renderStats();
      renderUsers();
    } catch (e) {
      if (token !== loadToken) return;
      state.users = [];
      $('userHint').textContent = '用户加载失败：' + (e.message || e);
      $('userList').innerHTML = '<div class="empty">无法加载用户列表</div>';
    }
    await loadFeedback(token);
    state.loading = false;
  }

  async function loadFeedback(token) {
    var stat = $('feedbackHint');
    try {
      var list = await window.cloud.listFeedbackReports(20);
      if (token !== loadToken) return;
      state.feedback = list || [];
      renderFeedback();
    } catch (e) {
      if (token !== loadToken) return;
      stat.textContent = '反馈加载失败：' + (e.message || e);
      $('feedbackList').innerHTML = '<div class="empty">无法加载反馈</div>';
    }
  }

  // ── 概览 ─────────────────────────────────────────
  function renderStats() {
    var total = state.users.length;
    var pending = state.users.filter(function (u) { return !u.approved; }).length;
    var approved = total - pending;
    var since = Date.now() - 7 * 24 * 60 * 60 * 1000;
    var active = state.users.filter(function (u) {
      if (!u.last_sign_in_at) return false;
      var t = new Date(u.last_sign_in_at).getTime();
      return !isNaN(t) && t >= since;
    }).length;

    $('statTotal').textContent = total;
    $('statPending').textContent = pending;
    $('statApproved').textContent = approved;
    $('statActive').textContent = active;
  }

  // ── 用户列表 ─────────────────────────────────────
  function visibleUsers() {
    var query = state.query.trim().toLowerCase();
    return state.users.filter(function (u) {
      if (state.filter === 'pending' && u.approved) return false;
      if (state.filter === 'approved' && !u.approved) return false;
      if (!query) return true;
      return String(u.username || '').toLowerCase().indexOf(query) !== -1
        || String(u.email || '').toLowerCase().indexOf(query) !== -1;
    });
  }

  function userRowHtml(u) {
    var name = displayName(u);
    var email = u.email || '（无邮箱）';
    var approved = !!u.approved;
    var isSelf = !!(window.cloud.state.user && window.cloud.state.user.id === u.id);

    var actionHtml = '';
    if (!approved) {
      actionHtml = ''
        + '<button class="btn approve small" type="button" data-action="approve" data-id="' + esc(u.id) + '">通过</button>'
        + '<button class="btn danger small" type="button" data-action="reject" data-id="' + esc(u.id) + '">拒绝并删除</button>';
    } else if (!isSelf) {
      actionHtml = ''
        + '<button class="btn soft small" type="button" data-action="view" data-id="' + esc(u.id) + '">查看数据</button>'
        + '<button class="btn soft small" type="button" data-action="reset" data-id="' + esc(u.id) + '">发送重置密码邮件</button>'
        + '<button class="btn danger small" type="button" data-action="delete" data-id="' + esc(u.id) + '">删除用户</button>';
    } else {
      actionHtml = '<span class="panel-hint" style="margin:0;">当前登录账号</span>';
    }

    var renameHtml = '';
    if (u.pending_username) {
      renameHtml = '<div class="rename-row">'
        + '<span>申请改名为 <b>' + esc(u.pending_username) + '</b></span>'
        + '<button class="btn approve small" type="button" data-action="approve-name" data-id="' + esc(u.id) + '">通过改名</button>'
        + '<button class="btn danger small" type="button" data-action="reject-name" data-id="' + esc(u.id) + '">拒绝改名</button>'
        + '</div>';
    }

    return '<article class="user-row" data-user-id="' + esc(u.id) + '">'
      + '<div class="avatar">' + esc(initial(name)) + '</div>'
      + '<div class="user-main">'
      +   '<div class="user-name">' + esc(name)
      +     '<span class="badge ' + (approved ? 'approved' : 'pending') + '">' + (approved ? '已通过' : '待审批') + '</span>'
      +   '</div>'
      +   '<div class="email-line"><span>邮箱</span><b>' + esc(email) + '</b>'
      +     (u.email ? '<button class="copy-btn" type="button" data-action="copy" data-id="' + esc(u.id) + '">复制</button>' : '')
      +   '</div>'
      +   '<div class="user-meta">'
      +     '<span>注册 ' + esc(fmtDate(u.created_at)) + '</span>'
      +     '<span>最近登录 ' + esc(fmtDate(u.last_sign_in_at)) + '</span>'
      +     '<span class="count">错题 ' + esc(u.error_count || 0) + '</span>'
      +     '<span class="count">备课 ' + esc(u.prep_count || 0) + '</span>'
      +   '</div>'
      +   renameHtml
      + '</div>'
      + '<div class="user-actions">' + actionHtml + '</div>'
      + '</article>';
  }

  function renderUsers() {
    var list = visibleUsers();
    var pendingCount = state.users.filter(function (u) { return !u.approved; }).length;
    var hint = '共 ' + state.users.length + ' 个用户';
    if (pendingCount) hint += '，其中 ' + pendingCount + ' 个待审批';
    if (state.query.trim()) hint += '；当前搜索「' + state.query.trim() + '」命中 ' + list.length + ' 个';
    $('userHint').textContent = hint;

    if (!list.length) {
      $('userList').innerHTML = '<div class="empty">'
        + (state.query.trim() ? '没有匹配的用户' : (state.filter === 'pending' ? '没有待审批的用户' : '还没有用户注册'))
        + '</div>';
      return;
    }
    $('userList').innerHTML = list.map(userRowHtml).join('');
  }

  // ── 反馈列表 ─────────────────────────────────────
  function feedbackCardHtml(r) {
    var status = FEEDBACK_STATUS[r.status] || r.status || '新反馈';
    var category = FEEDBACK_CATEGORY[r.category] || r.category || '反馈';
    var created = r.created_at ? new Date(r.created_at).toLocaleString('zh-CN') : '';
    var next = r.status === 'new' ? 'triaged'
      : r.status === 'triaged' ? 'in_progress'
      : r.status === 'in_progress' ? 'released'
      : r.status === 'released' ? 'closed'
      : '';

    var actions = '';
    if (next) {
      actions += '<button class="btn soft small" type="button" data-feedback-status="' + next + '" data-id="' + esc(r.id) + '">标记为' + (FEEDBACK_STATUS[next] || next) + '</button>';
    }
    if (r.status !== 'closed') {
      actions += '<button class="btn ghost small" type="button" data-feedback-status="closed" data-id="' + esc(r.id) + '">关闭</button>';
    }

    return '<article class="feedback-card">'
      + '<div class="feedback-top">'
      +   '<span class="tag">' + esc(category) + '</span>'
      +   '<span>' + esc(r.severity || 'P2') + '</span>'
      +   '<span class="status">' + esc(status) + '</span>'
      +   '<span>' + esc(created) + '</span>'
      + '</div>'
      + '<p class="feedback-msg">' + esc(r.message || '') + '</p>'
      + '<div class="feedback-meta">'
      +   '<span>模块 ' + esc(r.module || 'unknown') + '</span>'
      +   '<span>复现 ' + esc(r.reproducible || 'unknown') + '</span>'
      +   '<span>影响 ' + esc(r.affected_users_count || 0) + ' 人</span>'
      + '</div>'
      + (actions ? '<div class="feedback-actions">' + actions + '</div>' : '')
      + '</article>';
  }

  function renderFeedback() {
    var list = state.feedback;
    $('feedbackHint').textContent = list.length ? '最近 ' + list.length + ' 条反馈' : '还没有反馈';
    if (!list.length) {
      $('feedbackList').innerHTML = '<div class="empty">还没有反馈</div>';
      return;
    }
    $('feedbackList').innerHTML = list.map(feedbackCardHtml).join('');
  }

  // ── 操作 ─────────────────────────────────────────
  function findUser(id) {
    for (var i = 0; i < state.users.length; i++) {
      if (state.users[i].id === id) return state.users[i];
    }
    return null;
  }

  async function approveUser(user) {
    var name = displayName(user);
    if (!confirm('确认通过「' + name + '」的注册申请？\n邮箱：' + (user.email || '（无邮箱）'))) return;
    try {
      await window.cloud.approveUser(user.id);
      toast(name + ' 已通过审批');
      await loadAll();
    } catch (e) {
      alert('操作失败：' + (e.message || e));
    }
  }

  async function rejectUser(user, isDelete) {
    var name = displayName(user);
    var verb = isDelete ? '删除' : '拒绝并永久删除';
    if (!confirm('确认' + verb + '「' + name + '」？\n邮箱：' + (user.email || '（无邮箱）') + '\n此操作不可恢复。')) return;
    try {
      await window.cloud.rejectUser(user.id);
      toast(name + (isDelete ? ' 已删除' : ' 已被拒绝并删除'));
      await loadAll();
    } catch (e) {
      alert('操作失败：' + (e.message || e));
    }
  }

  async function resetPassword(user) {
    if (!user.email) return alert('该账号没有邮箱，无法发送重置邮件。');
    if (!confirm('向 ' + user.email + ' 发送重置密码邮件？\n学生点击邮件里的链接即可重设密码。')) return;
    try {
      await window.cloud.sendPasswordReset(user.email);
      toast('重置密码邮件已发送到 ' + user.email);
    } catch (e) {
      alert('发送失败：' + (e.message || e));
    }
  }

  function viewUser(user) {
    try {
      sessionStorage.setItem('seeklume_view_as', JSON.stringify({
        id: user.id,
        label: displayName(user)
      }));
    } catch (e) {
      return alert('无法保存查看状态，请检查浏览器存储设置。');
    }
    location.href = '../grammar-fill/?viewAs=1';
  }

  async function approveUsernameChange(user) {
    if (!confirm('确认批准「' + displayName(user) + '」改名为 ' + user.pending_username + '？')) return;
    try {
      await window.cloud.approveUsernameChange(user.id);
      toast('已批准改名');
      await loadAll();
    } catch (e) {
      alert('操作失败：' + (e.message || e));
    }
  }

  async function rejectUsernameChange(user) {
    if (!confirm('确认拒绝「' + displayName(user) + '」的改名申请？')) return;
    try {
      await window.cloud.rejectUsernameChange(user.id);
      toast('已拒绝改名申请');
      await loadAll();
    } catch (e) {
      alert('操作失败：' + (e.message || e));
    }
  }

  async function updateFeedbackStatus(id, status) {
    try {
      await window.cloud.updateFeedbackStatus(id, status);
      await loadAll();
    } catch (e) {
      alert('反馈状态更新失败：' + (e.message || e));
    }
  }

  // ── 事件绑定 ─────────────────────────────────────
  function bindEvents() {
    $('searchInput').addEventListener('input', function (e) {
      state.query = e.target.value || '';
      renderUsers();
    });

    $('filterBar').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-filter]');
      if (!btn) return;
      state.filter = btn.getAttribute('data-filter');
      Array.prototype.forEach.call($('filterBar').querySelectorAll('.seg'), function (node) {
        node.classList.toggle('active', node === btn);
      });
      renderUsers();
    });

    $('refreshBtn').addEventListener('click', function () {
      loadAll();
      toast('已刷新');
    });

    $('logoutBtn').addEventListener('click', function () {
      if (!confirm('确认退出登录？')) return;
      window.cloud.signOut().then(function () {
        location.href = '../index.html';
      });
    });

    $('themeBtn').addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      var next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });

    document.addEventListener('click', function (e) {
      var copyBtn = e.target.closest('[data-action="copy"]');
      if (copyBtn) {
        var copyUser = findUser(copyBtn.getAttribute('data-id'));
        if (!copyUser || !copyUser.email) return;
        copyText(copyUser.email).then(function () {
          toast('邮箱已复制：' + copyUser.email);
        }).catch(function () {
          alert('复制失败，请手动选择邮箱复制。');
        });
        return;
      }

      var actionBtn = e.target.closest('[data-action]');
      if (actionBtn) {
        var user = findUser(actionBtn.getAttribute('data-id'));
        if (!user) return;
        var action = actionBtn.getAttribute('data-action');
        if (action === 'approve') approveUser(user);
        else if (action === 'reject') rejectUser(user);
        else if (action === 'delete') rejectUser(user, true);
        else if (action === 'reset') resetPassword(user);
        else if (action === 'view') viewUser(user);
        else if (action === 'approve-name') approveUsernameChange(user);
        else if (action === 'reject-name') rejectUsernameChange(user);
        return;
      }

      var feedbackBtn = e.target.closest('[data-feedback-status]');
      if (feedbackBtn) {
        updateFeedbackStatus(feedbackBtn.getAttribute('data-id'), feedbackBtn.getAttribute('data-feedback-status'));
      }
    });
  }

  // ── 启动 ─────────────────────────────────────────
  function boot() {
    bindEvents();
    showPanel('verify');
    if (!window.cloud) {
      showPanel('deny');
      return;
    }
    window.cloud.onChange(onCloudState);
    window.cloud.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
