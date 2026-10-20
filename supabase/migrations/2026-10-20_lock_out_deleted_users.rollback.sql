-- ============================================================
-- 回滚：2026-10-20_lock_out_deleted_users.sql
-- ------------------------------------------------------------
-- 把 check_approved() 改回「查不到记录 = 老用户 → 放行」。
-- 注意：回滚后「删号后对方仍能继续用站」的缺口会重新出现。
-- 本回滚不撤销「补档案」那一步（补出的 approved=true 档案留着无害）。
-- ============================================================

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
  -- 无记录 = 审批系统上线前的老用户，放行
  if not found then return true; end if;
  return result;
end;
$$;
grant execute on function public.check_approved() to authenticated;
