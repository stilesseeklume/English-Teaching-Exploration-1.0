// shared/cloud.js
//
// Supabase 云端 API 封装层。
//
// 职责：
//   - 创建 Supabase 客户端（依赖 window.SUPABASE_URL / window.SUPABASE_ANON_KEY）
//   - 提供 auth：signIn / signUp / signOut / changePassword / requestUsernameChange
//   - 提供数据 CRUD：error_book / lesson_prep 表的拉取与增删
//   - 提供管理员 RPC：listUsers / approveUser / rejectUser / viewAs 等
//   - 暴露统一 API：window.cloud  + 原始客户端 window._sb
//
// 加载方式：必须是同步 <script>（不是 type="module"），因为下游业务代码
//   依赖 window.cloud 在解析期就已存在。
//
// 引入顺序（HTML 中）：
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
//   <script src="../config.js"></script>      ← 提供 SUPABASE_URL / ANON_KEY
//   <script src="../shared/cloud.js"></script>
//
// 不依赖 DOM、不依赖任何业务全局变量。可被任何题型页面直接复用。

/* eslint-disable */
(function(){
  var cfgValid = window.SUPABASE_URL && window.SUPABASE_URL.indexOf('YOUR_') === -1
              && window.SUPABASE_ANON_KEY && window.SUPABASE_ANON_KEY.indexOf('YOUR_') === -1;

  var sb = cfgValid ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY) : null;
  window._sb = sb;
  var listeners = [];
  var state = { user: null, isAdmin: false, viewingUserId: null, viewingEmail: null };

  function notify() { listeners.forEach(function(cb){ try { cb(state); } catch(e){} }); }

  async function detectAdmin() {
    if (!sb || !state.user) { state.isAdmin = false; return; }
    try {
      var r = await sb.rpc('admin_list_users');
      state.isAdmin = !r.error;
    } catch(e) { state.isAdmin = false; }
  }

  async function init() {
    if (!sb) return;
    var s = await sb.auth.getSession();
    state.user = s.data && s.data.session ? s.data.session.user : null;
    await detectAdmin();
    notify();
    sb.auth.onAuthStateChange(async function(_evt, session){
      state.user = session ? session.user : null;
      state.viewingUserId = null;
      state.viewingEmail = null;
      await detectAdmin();
      notify();
    });
  }

  function asUserId() {
    return state.viewingUserId || (state.user && state.user.id) || null;
  }

  async function signUp(email, username, password) {
    if (!sb) throw new Error('未配置 Supabase');
    var r = await sb.auth.signUp({
      email: email,
      password: password,
      options: { data: { username: username } }
    });
    if (r.error) throw r.error;
    return r.data;
  }
  async function signIn(login, password) {
    if (!sb) throw new Error('未配置 Supabase');
    var email;
    if (login.indexOf('@') !== -1) {
      email = login;
    } else {
      // 用户名登录：通过 RPC 查找实际邮箱
      try {
        var r2 = await sb.rpc('get_email_by_username', { uname: login });
        email = (r2.data && !r2.error) ? r2.data : null;
      } catch(e) { email = null; }
      if (!email) throw new Error('找不到该用户名对应的邮箱，请使用邮箱登录');
    }
    var r = await sb.auth.signInWithPassword({ email: email, password: password });
    if (r.error) throw r.error;
    return r.data;
  }
  async function changePassword(newPassword) {
    if (!sb) throw new Error('未配置 Supabase');
    var r = await sb.auth.updateUser({ password: newPassword });
    if (r.error) throw r.error;
  }
  async function requestUsernameChange(newUsername) {
    if (!sb) throw new Error('未配置 Supabase');
    var r = await sb.rpc('request_username_change', { new_username: newUsername });
    if (r.error) throw r.error;
  }
  async function approveUsernameChange(userId) {
    if (!sb) throw new Error('未配置 Supabase');
    var r = await sb.rpc('admin_approve_username_change', { target_user: userId });
    if (r.error) throw r.error;
  }
  async function rejectUsernameChange(userId) {
    if (!sb) throw new Error('未配置 Supabase');
    var r = await sb.rpc('admin_reject_username_change', { target_user: userId });
    if (r.error) throw r.error;
  }
  async function usernameTaken(uname) {
    if (!sb) return false;
    var r = await sb.rpc('username_taken', { uname: uname });
    return !r.error && r.data === true;
  }
  async function signOut() {
    if (!sb) return;
    await sb.auth.signOut({ scope: 'local' });
  }

  async function pullErrorBook() {
    if (!sb || !state.user) return null;
    var uid = asUserId();
    var r = await sb.from('error_book').select('*').eq('user_id', uid).order('created_at', { ascending: false });
    if (r.error) throw r.error;
    return r.data.map(function(row){ return Object.assign({}, row.question, { id: row.client_id }); });
  }
  async function upsertErrorItem(q) {
    if (!sb || !state.user) return;
    if (state.viewingUserId) return; // admin 浏览别人的数据，禁止写
    var clean = Object.assign({}, q); delete clean.id;
    var r = await sb.from('error_book').upsert({
      user_id: state.user.id,
      client_id: q.id,
      question: clean
    }, { onConflict: 'user_id,client_id' });
    if (r.error) throw r.error;
  }
  async function deleteErrorItem(clientId) {
    if (!sb || !state.user || state.viewingUserId) return;
    var r = await sb.from('error_book').delete().eq('user_id', state.user.id).eq('client_id', clientId);
    if (r.error) throw r.error;
  }

  async function pullLessonPrep() {
    if (!sb || !state.user) return null;
    var uid = asUserId();
    var r = await sb.from('lesson_prep').select('*').eq('user_id', uid).order('created_at', { ascending: false });
    if (r.error) throw r.error;
    return r.data.map(function(row){ return Object.assign({}, row.passage, { id: row.client_id }); });
  }
  async function upsertPrepItem(p) {
    if (!sb || !state.user || state.viewingUserId) return;
    var clean = Object.assign({}, p); delete clean.id;
    var r = await sb.from('lesson_prep').upsert({
      user_id: state.user.id,
      client_id: p.id,
      passage: clean
    }, { onConflict: 'user_id,client_id' });
    if (r.error) throw r.error;
  }
  async function deletePrepItem(clientId) {
    if (!sb || !state.user || state.viewingUserId) return;
    var r = await sb.from('lesson_prep').delete().eq('user_id', state.user.id).eq('client_id', clientId);
    if (r.error) throw r.error;
  }

  async function listUsers() {
    if (!sb) throw new Error('未配置');
    var r = await sb.rpc('admin_list_users');
    if (r.error) throw r.error;
    return r.data;
  }

  async function approveUser(userId) {
    if (!sb) throw new Error('未配置');
    var r = await sb.rpc('admin_approve_user', { target_user: userId });
    if (r.error) throw r.error;
  }
  async function rejectUser(userId) {
    if (!sb) throw new Error('未配置');
    var r = await sb.rpc('admin_reject_user', { target_user: userId });
    if (r.error) throw r.error;
  }
  async function viewAs(userId, email) {
    state.viewingUserId = userId;
    state.viewingEmail = email;
    notify();
  }
  function clearViewAs() {
    state.viewingUserId = null;
    state.viewingEmail = null;
    notify();
  }

  window.cloud = {
    isConfigured: function(){ return !!sb; },
    state: state,
    onChange: function(cb){ listeners.push(cb); cb(state); },
    init: init,
    signUp: signUp, signIn: signIn, signOut: signOut,
    changePassword: changePassword, requestUsernameChange: requestUsernameChange,
    approveUsernameChange: approveUsernameChange, rejectUsernameChange: rejectUsernameChange,
    pullErrorBook: pullErrorBook, upsertErrorItem: upsertErrorItem, deleteErrorItem: deleteErrorItem,
    pullLessonPrep: pullLessonPrep, upsertPrepItem: upsertPrepItem, deletePrepItem: deletePrepItem,
    listUsers: listUsers, approveUser: approveUser, rejectUser: rejectUser,
    viewAs: viewAs, clearViewAs: clearViewAs
  };
})();
