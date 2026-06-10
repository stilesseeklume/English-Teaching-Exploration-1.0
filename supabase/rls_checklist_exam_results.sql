-- RLS 自查 · 2026-06-10_exam_results
-- exam_results：每生一卷一行，云端只存学号（无姓名）。每个老师只看自己导入的数据。
-- apply 后在 Supabase SQL Editor 按所选账号/会话分段跑。勿提交真实师生内容。

-- [anonymous / 匿名] 未登录：auth.uid() 为空，all-own 策略的 using/with check 都不成立 →
--   select / insert / update / delete 全部 0 行或被拒。

-- [ordinary / 普通用户 authenticated] 登录老师：
--   insert（user_id = auth.uid()）应成功；
--   select 只见自己 user_id 的行，看不到别的老师的；
--   update / delete 只能动自己的行。
--   核对：upsert 同一 (user_id, client_id) 是更新不是新增（重导同一张成绩单不会重复）。

-- [admin / 管理员] 这版 exam_results 不给管理员/科组长任何跨人策略 →
--   管理员走客户端也只看到自己 user_id 的行（与普通用户一致）。跨人查看留待组织层（下一版）。

-- [cleanup / 清理] 测试行可手动：delete from public.exam_results where class_name = 'rls-check';
--   整表回滚用 supabase/migrations/2026-06-10_exam_results.rollback.sql。

-- 1. 表与 RLS 存在：
select c.relname, c.relrowsecurity as rls_enabled
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'exam_results';

-- 2. 策略存在：
select tablename, policyname, cmd from pg_policies
where schemaname = 'public' and tablename = 'exam_results';
