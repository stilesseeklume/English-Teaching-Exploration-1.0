---
name: 功能 / 改动需求
about: 用于新增功能、重构、数据修正、UI 调整
title: "[Feature] "
labels: feature
assignees: ""
---

## 目标

解决哪个老师场景或工程风险？

## 用户场景

谁在什么情况下会用到？现在为什么不顺？

## 影响范围

- 页面：
- 数据：
- Supabase / RLS / Edge Function：
- AI / prompt：
- 部署：

## 验收标准

- [ ] 用户能完成的具体动作：
- [ ] 数据结果：
- [ ] 错误提示：
- [ ] 回归检查：`npm run check`

## 回滚方式

如果上线后失败，怎么退回？

## 安全与隐私

- [ ] 不提交私钥、token、service role key。
- [ ] 不提交学生姓名、班级、成绩等隐私数据。
- [ ] 若改 Supabase，已准备 migration / rollback。
- [ ] 若记录日志或反馈，只记录最小必要信息。
