-- RLS 自查 · 2026-06-08_ai_rate_limit
-- ai_usage 仅服务端访问；consume_ai_quota 仅 service_role 可调。

-- [anonymous / 匿名] 未登录：无法过 Edge Function 鉴权（401），也无 RPC execute 权限。

-- [ordinary / 普通用户 authenticated] 直接调用应被拒：
--   select public.consume_ai_quota('00000000-0000-0000-0000-000000000000', 100);
--                                                  -- 期望 permission denied for function
--   select * from public.ai_usage;                 -- 期望 0 行（无 policy = 拒绝）
--   功能回归：正常上传 Word / 翻译 / 问 AI 仍可用；连续刷到第 201 次当日返回 429。

-- [admin / 管理员] 同上——ai_usage 不对任何客户端开放，管理员走客户端也读不到。

-- [cleanup / 清理] 无需特殊清理；ai_usage 跨天自动重置。测试账号的行可手动 delete。
