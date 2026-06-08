-- RLS 自查 · 2026-06-07_harden_admin_check
-- is_admin() 收紧为「仅认已验证邮箱」后，验证：越权已堵、正常管理员仍可用。
-- 在 Supabase SQL Editor 用不同身份登录、或 set local request.jwt.claims 模拟后运行。

-- [anonymous / 匿名] 未登录、无 jwt：
--   select public.is_admin();               -- 期望 false

-- [ordinary / 普通用户] 关键回归 —— 复现原攻击，修复后必须失败：
--   普通账号执行  await supabase.auth.updateUser({ data: { username: 'liuzhen' } })
--   并刷新会话拿到新 JWT 后：
--   select public.is_admin();               -- 修复后期望 false（修复前为 true = 漏洞）
--   select count(*) from public.error_book  where user_id <> auth.uid(); -- 期望 0
--   select count(*) from public.lesson_prep where user_id <> auth.uid(); -- 期望 0

-- [admin / 管理员] 真实管理员（邮箱 liuzhenlzstiles@icloud.com）登录：
--   select public.is_admin();               -- 期望 true
--   select public.admin_list_users();       -- 应正常返回（管理功能未受影响）

-- [cleanup / 清理] 若测试中改过 user_metadata.username，改回原值；删除所有测试账号与数据。
