-- 回滚 2026-06-07_harden_admin_check：恢复旧 is_admin（含 user_metadata.username 分支）。
-- ⚠️ 旧版含已知越权漏洞（任何登录用户可自提升为管理员）。仅用于紧急回退，
--    回退后须尽快用别的方式重新修复，不要长期停留在此状态。

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
    ) or (auth.jwt() -> 'user_metadata' ->> 'username') in (
      'liuzhen'
    ),
    false
  );
$$;
