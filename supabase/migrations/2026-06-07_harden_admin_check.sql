-- 收紧管理员判定（安全修复 · 2026-06-07 安全审计 P0-1）
--
-- 漏洞：旧 is_admin() 把 user_metadata.username == 'liuzhen' 也当管理员条件。
-- user_metadata 映射 auth.users.raw_user_meta_data，任何登录用户可经
--   await supabase.auth.updateUser({ data: { username: 'liuzhen' } })
-- 自行写入，刷新会话后服务端 is_admin() 即返回 true，进而：
--   · 读取所有用户的 error_book / lesson_prep
--   · 读取全部 feedback（含 PII）
--   · admin_reject_user → delete from auth.users 删除任意账号及其数据
--
-- 修复：仅以「已验证邮箱」判定管理员（邮箱不可由客户端自改）。
-- 与 supabase/setup.sql 中 is_admin 的定义保持一致。

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() ->> 'email') in (
      'liuzhenlzstiles@icloud.com'
    ),
    false
  );
$$;
