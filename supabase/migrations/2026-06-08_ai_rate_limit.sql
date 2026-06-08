-- AI 调用限流（安全修复 · 2026-06-07 审计 P0-2）
--
-- 背景：3 个 DeepSeek Edge Function 此前无频次/额度限制，且注册开放、自动通过——
-- 一个账号即可循环刷爆付费 API（烧钱 / DoS）。
-- 方案：每用户每日「调用次数 + 字符额度」上限。Edge Function 鉴权后原子地消费配额，
-- 超额返回 429。表仅服务端访问（无 client policy），RPC 仅 service_role 可调。

create table if not exists public.ai_usage (
  user_id    uuid        primary key references auth.users(id) on delete cascade,
  day        date        not null default current_date,
  calls      int         not null default 0,
  est_chars  bigint      not null default 0,
  updated_at timestamptz not null default now()
);

-- 只允许服务端（SECURITY DEFINER RPC / service_role）访问；客户端不可直接读写。
alter table public.ai_usage enable row level security;

-- 原子消费配额：对该用户行加锁（串行化并发调用），跨天自动重置，超额返回 allowed=false。
create or replace function public.consume_ai_quota(p_user_id uuid, p_est_chars int default 0)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_call_limit int    := 200;       -- 每人每日最多 200 次 AI 调用
  v_char_limit bigint := 6000000;   -- 每人每日字符额度（≈ 200 万 token）
  v_calls      int;
  v_chars      bigint;
  v_day        date;
  v_add        bigint := greatest(coalesce(p_est_chars, 0), 0);
begin
  if p_user_id is null then
    return jsonb_build_object('allowed', false, 'reason', 'no_user');
  end if;

  insert into public.ai_usage(user_id) values (p_user_id)
    on conflict (user_id) do nothing;

  select calls, est_chars, day into v_calls, v_chars, v_day
    from public.ai_usage where user_id = p_user_id for update;

  if v_day is distinct from current_date then
    v_calls := 0;
    v_chars := 0;
  end if;

  if v_calls >= v_call_limit or (v_chars + v_add) > v_char_limit then
    update public.ai_usage
      set day = current_date, calls = v_calls, est_chars = v_chars, updated_at = now()
      where user_id = p_user_id;
    return jsonb_build_object('allowed', false, 'calls', v_calls, 'call_limit', v_call_limit);
  end if;

  update public.ai_usage
    set day = current_date, calls = v_calls + 1, est_chars = v_chars + v_add, updated_at = now()
    where user_id = p_user_id;

  return jsonb_build_object('allowed', true, 'calls', v_calls + 1);
end;
$$;

-- 仅 service_role（Edge Function）可调；不暴露给匿名 / 普通用户。
revoke all on function public.consume_ai_quota(uuid, int) from public;
revoke all on function public.consume_ai_quota(uuid, int) from anon, authenticated;
grant execute on function public.consume_ai_quota(uuid, int) to service_role;
