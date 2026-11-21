// =============================================================
// 2026-11-21 起停用云端：全站开放，不设登录、不收集数据。
// 若要恢复登录/数据功能，在这里填回 Supabase 的 URL 与 key。
// =============================================================
// Seeklume · 公开配置
// =============================================================
// 这个文件可以安全公开：publishable key（旧称 anon key）是 Supabase
// 设计上专门给前端用的密钥，真正的权限由数据库的 RLS（行级安全策略）决定
// —— 见 supabase/setup.sql。两个 key 都留空时，shared/gate.js 自动进入
// 「本地模式」：不弹登录、不做云端读写，进度只存在浏览器 localStorage。
//
// 切换环境（测试 / 生产）只需要改这一个文件，无需重新部署各个 HTML。
// =============================================================

window.SEEKLUME_CONFIG = {
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',
};

// 向后兼容：现有代码读的是 window.SUPABASE_URL / window.SUPABASE_ANON_KEY
window.SUPABASE_URL = window.SEEKLUME_CONFIG.SUPABASE_URL;
window.SUPABASE_ANON_KEY = window.SEEKLUME_CONFIG.SUPABASE_ANON_KEY;
