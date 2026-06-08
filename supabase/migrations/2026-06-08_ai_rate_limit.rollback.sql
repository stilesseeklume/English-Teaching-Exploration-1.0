-- 回滚 2026-06-08_ai_rate_limit
-- ⚠️ 回滚后 AI 函数将再次无限流（恢复烧钱/DoS 暴露面），仅用于紧急退回。

drop function if exists public.consume_ai_quota(uuid, int);
drop table if exists public.ai_usage;
