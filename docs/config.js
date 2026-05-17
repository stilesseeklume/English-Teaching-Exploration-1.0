// =============================================================
// Seeklume · 公开配置
// =============================================================
// 这个文件可以安全公开。anon key 是 Supabase 设计上专门给前端用的密钥，
// 真正的权限由数据库的 RLS（行级安全策略）决定 —— 见 supabase/setup.sql
//
// 切换环境（测试 / 生产）只需要改这一个文件，无需重新部署各个 HTML。
// =============================================================

window.SEEKLUME_CONFIG = {
  SUPABASE_URL: 'https://zwbvcqkfbndgmyfxtkyl.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3YnZjcWtmYm5kZ215Znh0a3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTc4NDksImV4cCI6MjA5NDE5Mzg0OX0.LVb1pM3xYiNRTrujD6YYi__M163ppguMiMy5Xjt8dL4',
};

// 向后兼容：现有代码读的是 window.SUPABASE_URL / window.SUPABASE_ANON_KEY
window.SUPABASE_URL = window.SEEKLUME_CONFIG.SUPABASE_URL;
window.SUPABASE_ANON_KEY = window.SEEKLUME_CONFIG.SUPABASE_ANON_KEY;
