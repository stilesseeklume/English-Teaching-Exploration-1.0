-- ============================================================
-- 2026-10-20 · 封堵「删号后对方仍能继续用站」的缺口
-- ------------------------------------------------------------
-- 问题（教师实测）：管理员在站内删除某个账号后，该账号从列表里消失了，
--   但对方仍能继续打开功能页使用本站。
--
-- 根因：check_approved() 对「查不到 profiles 记录」一律 return true
--   （本意是放行审批系统上线前、没有档案的老用户）。而删号走的是
--   delete from auth.users，profiles 行会被外键级联删掉 —— 于是
--   「被删号」与「老用户」在函数里长得一模一样，被一并放行。
--   对方浏览器里尚未过期的 access token 仍可通过 RLS，门禁又不断放行，
--   表现为「账号消失了但人还在站内」。
--
-- 修法：check_approved() 改成 fail-closed —— 查不到档案就返回 false，
--   由前端门禁落到「等待审批」屏（带「退出登录」按钮）。为不误伤真正的
--   老用户，先把「有 auth.users 但没有 profiles 行」的存量账号补齐并把
--   approved 置为 true（当前线上没有这类账号，此步为空操作，仅作兜底）。
--
-- 回滚：2026-10-20_lock_out_deleted_users.rollback.sql
-- 用法：Supabase 控制台 → SQL Editor → 粘贴全文 → Run
-- ============================================================

-- 1) 兜底：给任何「有账号却没档案」的存量用户补一条已通过的档案
insert into public.profiles (user_id, username, approved)
select u.id,
       coalesce(nullif(split_part(u.email::text, '@', 1), ''), 'user') || '_' || substr(u.id::text, 1, 4),
       true
from auth.users u
left join public.profiles p on p.user_id = u.id
where p.user_id is null
on conflict (user_id) do nothing;

-- 2) 门禁判定改为 fail-closed
create or replace function public.check_approved()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  result boolean;
begin
  select p.approved into result
  from public.profiles p
  where p.user_id = auth.uid();
  -- 查不到档案 = 档案已被删除（账号被管理员删掉）→ 一律拒绝
  if not found then return false; end if;
  return result;
end;
$$;
grant execute on function public.check_approved() to authenticated;

-- 3) 只读验证：应为 0（没有「有账号没档案」的用户）
select count(*) as users_without_profile
from auth.users u
left join public.profiles p on p.user_id = u.id
where p.user_id is null;
