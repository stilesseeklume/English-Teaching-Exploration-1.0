-- Rollback for 2026-06-10_exam_results.sql.
-- 删除 exam_results 表及其触发器/策略/索引。会丢失已上云的学生成绩数据，谨慎使用。

drop trigger if exists exam_results_touch on public.exam_results;
drop policy if exists exam_results_all_own on public.exam_results;
drop index if exists public.exam_results_class_exam_idx;
drop index if exists public.exam_results_class_student_idx;
drop table if exists public.exam_results;
