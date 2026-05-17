// shared/admin-ui.js
//
// 管理员界面（题型无关）：用户列表 / 审批注册 / 改名审批 / 删除用户 /
// 「以用户身份查看」（viewAs）。
//
// 设计假设：v2 加完形/阅读后，管理员仍然在同一个页面看所有题型的数据，
// 所以本模块作为 shared/ 一员，不绑定具体题型。
//
// 依赖（必须先加载）：
//   - shared/cloud.js（listUsers / approveUser / rejectUser /
//                      approveUsernameChange / rejectUsernameChange /
//                      viewAs / clearViewAs / state）
//
// 题型侧（index.html）必须提供：
//   - window._lastCloudUser（var 声明，让 viewAs 切换强制重拉数据）
//   - window.onCloudStateChange(state)（拉取/渲染钩子）
//   - window.switchPage(name)（页面切换）
//   - HTML 元素：#adminUserList, #adminStat
//   - CSS 类：prep-list-item, prep-list-title, prep-list-meta, error-empty

/* eslint-disable */
(function(){
  async function renderAdminPage() {
    if (!window.cloud || !window.cloud.state.isAdmin) {
      document.getElementById('adminUserList').innerHTML =
        '<div class="error-empty">需要管理员权限</div>';
      return;
    }
    var list;
    try { list = await window.cloud.listUsers(); }
    catch (e) {
      document.getElementById('adminUserList').innerHTML =
        '<div class="error-empty">加载失败：' + (e.message || e) + '</div>';
      return;
    }
    document.getElementById('adminStat').textContent = '共 ' + list.length + ' 个用户。';
    if (list.length === 0) {
      document.getElementById('adminUserList').innerHTML =
        '<div class="error-empty">还没有用户注册</div>';
      return;
    }
    var html = '<div style="display:grid;grid-template-columns:1fr;gap:8px;">';
    list.forEach(function(u) {
      var signin = u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString('zh-CN') : '从未';
      var created = u.created_at ? new Date(u.created_at).toLocaleDateString('zh-CN') : '';
      var approvedBadge = u.approved
        ? '<span style="color:var(--green);font-weight:600;font-size:12px;">✅ 已通过</span>'
        : '<span style="color:var(--orange);font-weight:600;font-size:12px;">⏳ 待审批</span>';
      var displayName = u.username || (u.email || '').split('@')[0] || '(无用户名)';
      var isSelf = window.cloud && window.cloud.state && window.cloud.state.user && window.cloud.state.user.id === u.id;
      var actionBtns = '';
      if (!u.approved) {
        actionBtns = '<div style="margin-top:8px;display:flex;gap:8px;">'
          + '<button onclick="event.stopPropagation();adminApproveUser(\'' + u.id + '\',\'' + displayName.replace(/'/g, "\\'") + '\')" style="padding:4px 12px;background:var(--green);color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px;">✓ 通过</button>'
          + '<button onclick="event.stopPropagation();adminRejectUser(\'' + u.id + '\',\'' + displayName.replace(/'/g, "\\'") + '\')" style="padding:4px 12px;background:var(--red);color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px;">✕ 拒绝</button>'
          + '</div>';
      } else if (!isSelf) {
        actionBtns = '<div style="margin-top:8px;">'
          + '<button onclick="event.stopPropagation();adminDeleteUser(\'' + u.id + '\',\'' + displayName.replace(/'/g, "\\'") + '\')" style="padding:3px 10px;background:var(--red);color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:11px;">删除用户</button>'
          + '</div>';
      }
      var unameChange = '';
      if (u.pending_username) {
        unameChange = '<div style="margin-top:8px;background:var(--accent-bg);border-radius:6px;padding:6px 10px;font-size:12px;">'
          + '✏️ 申请改名为 <b>' + u.pending_username + '</b>'
          + '<button onclick="event.stopPropagation();adminApproveUsernameChange(\'' + u.id + '\',\'' + u.pending_username.replace(/'/g, "\\'") + '\')" style="margin-left:8px;padding:2px 8px;background:var(--green);color:#fff;border:none;border-radius:3px;cursor:pointer;font-size:11px;">✓ 通过</button>'
          + '<button onclick="event.stopPropagation();adminRejectUsernameChange(\'' + u.id + '\',\'' + u.pending_username.replace(/'/g, "\\'") + '\')" style="margin-left:4px;padding:2px 8px;background:var(--red);color:#fff;border:none;border-radius:3px;cursor:pointer;font-size:11px;">✕ 拒绝</button>'
          + '</div>';
      }
      html += '<div class="prep-list-item" onclick="adminViewUser(\'' + u.id + '\',\'' + displayName.replace(/'/g, "\\'") + '\')">'
            + '<div class="prep-list-title">' + displayName + ' ' + approvedBadge + '</div>'
            + '<div class="prep-list-meta">'
            + '<span>注册：' + created + '</span>'
            + '<span>最近登录：' + signin + '</span>'
            + '<span style="color:var(--accent);">📝 ' + u.error_count + ' 错题 · 📋 ' + u.prep_count + ' 备课</span>'
            + '</div>'
            + unameChange
            + actionBtns
            + '</div>';
    });
    html += '</div>';
    document.getElementById('adminUserList').innerHTML = html;
  }

  async function adminViewUser(userId, email) {
    await window.cloud.viewAs(userId, email);
    window._lastCloudUser = null;     // 强制刷新数据加载
    await window.onCloudStateChange(window.cloud.state);
    window.switchPage('error-book');  // 跳到错题本查看
  }

  async function adminApproveUser(userId, email) {
    if (!confirm('确认通过 ' + email + ' 的注册申请？')) return;
    try {
      await window.cloud.approveUser(userId);
      alert(email + ' 已通过审批');
      renderAdminPage();
    } catch (e) {
      alert('操作失败：' + (e.message || e));
    }
  }

  async function adminRejectUser(userId, email) {
    if (!confirm('确认拒绝并删除 ' + email + '？\n此操作不可恢复。')) return;
    try {
      await window.cloud.rejectUser(userId);
      alert(email + ' 已被拒绝');
      renderAdminPage();
    } catch (e) {
      alert('操作失败：' + (e.message || e));
    }
  }

  async function adminDeleteUser(userId, name) {
    if (!confirm('确认永久删除用户 ' + name + ' 及其所有数据？\n此操作不可恢复。')) return;
    try {
      await window.cloud.rejectUser(userId);
      alert(name + ' 已被删除');
      renderAdminPage();
    } catch (e) {
      alert('操作失败：' + (e.message || e));
    }
  }

  async function adminApproveUsernameChange(userId, newName) {
    if (!confirm('确认批准用户改名为 ' + newName + '？')) return;
    try {
      await window.cloud.approveUsernameChange(userId);
      alert('已批准改名为 ' + newName);
      renderAdminPage();
    } catch (e) {
      alert('操作失败：' + (e.message || e));
    }
  }

  async function adminRejectUsernameChange(userId, newName) {
    if (!confirm('确认拒绝用户改名为 ' + newName + '？')) return;
    try {
      await window.cloud.rejectUsernameChange(userId);
      alert('已拒绝改名申请');
      renderAdminPage();
    } catch (e) {
      alert('操作失败：' + (e.message || e));
    }
  }

  async function exitViewAs() {
    window.cloud.clearViewAs();
    window._lastCloudUser = null;
    await window.onCloudStateChange(window.cloud.state);
    window.switchPage('admin');
  }

  // 暴露到 window
  window.renderAdminPage = renderAdminPage;
  window.adminViewUser = adminViewUser;
  window.adminApproveUser = adminApproveUser;
  window.adminRejectUser = adminRejectUser;
  window.adminDeleteUser = adminDeleteUser;
  window.adminApproveUsernameChange = adminApproveUsernameChange;
  window.adminRejectUsernameChange = adminRejectUsernameChange;
  window.exitViewAs = exitViewAs;
})();
