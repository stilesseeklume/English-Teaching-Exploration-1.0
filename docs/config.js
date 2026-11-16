// =============================================================
// Seeklume · 公开配置
// =============================================================
// 这个文件可以安全公开。publishable key 是 Supabase 设计上专门给前端用的密钥，
// 真正的权限由数据库的 RLS（行级安全策略）决定 —— 见 supabase/setup.sql
//
// 注意：旧的 anon JWT key 已在项目迁移中失效（调用会返回 Invalid API key），
// 这里改用新的 publishable key，两者在 RLS 下等价，都是 anon 角色。
//
// 切换环境（测试 / 生产）只需要改这一个文件，无需重新部署各个 HTML。
// =============================================================

window.SEEKLUME_CONFIG = {
  SUPABASE_URL: 'https://zwbvcqkfbndgmyfxtkyl.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_7EFtsF3vpoaDwR0ZNTltpA_WnmaWVXK',
};

// 向后兼容：现有代码读的是 window.SUPABASE_URL / window.SUPABASE_ANON_KEY
window.SUPABASE_URL = window.SEEKLUME_CONFIG.SUPABASE_URL;
window.SUPABASE_ANON_KEY = window.SEEKLUME_CONFIG.SUPABASE_ANON_KEY;
