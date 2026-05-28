# Seeklume 工程化开发流程

> 状态：v0.1。用于把 Seeklume 从“可运行原型”推进到“可持续外部应用”。

## 1. 开发入口

每个功能先写清楚六件事：

- 目标：解决哪个老师场景或工程风险。
- 影响范围：页面、数据、Supabase、AI、部署。
- 数据变化：是否改表、改字段、改题库生成链路。
- 验收标准：怎么证明它完成了。
- 回滚方式：前端、数据库、AI prompt 分别怎么退。
- 记录位置：计划进 `docs/planning/roadmap.md`，实际结果进 `PROJECT_LOG.md`。

GitHub 上新增需求或 bug 时，优先使用 `.github/ISSUE_TEMPLATE/`。合并大改动前，用 `.github/PULL_REQUEST_TEMPLATE.md` 核对影响范围、验证和回滚。

## 2. 分支与提交

- `main` 是稳定线上基线。
- 大改动使用 `codex/*` 或 `feature/*` 分支。
- 一个提交只做一个主题，不混合功能、UI、数据修正和重构。
- 大改动开始前先确认回滚基线：记录 `git rev-parse --short HEAD` 和 `git status --short --branch`。
- 大改动中途如果已经通过 `npm run check`，但后面还要继续拆很多文件，可以做本地 checkpoint commit。checkpoint 是“安全快照”，不是正式发布；默认不 push，不打 tag，不代表功能最终完成。
- 重要版本发布后打 tag，例如 `v0.2.0`。

## 3. 发布前检查

本地发布前必须运行：

```bash
npm run check
```

`npm run check` 实际会调用 `bash scripts/check_all.sh`。保留 shell 脚本是为了 GitHub Actions 和没有 npm 脚本习惯的人也能直接运行。

检查内容：

- 题库结构、分类、精细 tag。
- 语法填空模块边界：HTML 加载顺序、模块导出 API、纯逻辑模块是否避免 DOM/网络副作用。
- 公开仓库密钥和隐私数据。
- Supabase migration：必须有 rollback；改 RLS 时必须有自查脚本。
- Edge Function：必须有 `CONTRACT.md`，并检查 POST/CORS/鉴权/错误 JSON 和 AI key 配置。
- 静态站关键文件、发布数据头部和基础 JS 语法。
- Playwright 浏览器 smoke：打开首页、隐私页、语法填空页，验证套卷、讲题台、迁移来源切换、反馈弹窗、登录/退出、错题本、备课资料、删除同步、跨账号隔离、管理员只读边界、投影模式、Word/AI 成功导入和失败降级路径。

第一次运行会通过 npm 安装测试依赖，并下载 Playwright Chromium。只在本地环境临时缺浏览器、但又必须先跑纯数据/静态检查时，才允许用：

```bash
SKIP_BROWSER_SMOKE=1 bash scripts/check_all.sh
```

这个跳过开关不能作为发布前正式验收结果。

重要发布前还要按 `docs/planning/release-checklist-template.md` 做一次人工核对。自动检查负责证明“旧功能没有明显坏”，人工清单负责记录“为什么发、怎么退、上线后看什么”。

## 4. 开发日志规则

不要求每次 push 都写日志。以下情况必须更新 `PROJECT_LOG.md`：

- 合并到 `main` 且影响线上功能。
- 改 Supabase 表、RLS、Edge Function。
- 拆模块、改数据真源、改登录或同步逻辑。
- 修复线上严重 bug。
- 老师反馈改变产品方向。
- Sprint 开始或结束。

## 5. 回滚规则

- 未提交的本地改动坏了：优先用 `git diff` 找到问题点；如果确认整批改动都不要，才考虑回到上一个 commit。不要在有不明用户改动时直接清空工作区。
- checkpoint 之后的重构坏了：可以回到 checkpoint commit，再重新拆小步。
- 前端问题：回退 Git commit 或重新部署上一个 tag。
- 数据库问题：执行 migration 对应的 rollback SQL，或恢复备份。
- AI 问题：回退 prompt 或 Edge Function 版本。
- 域名问题：检查 Cloudflare DNS、GitHub Pages、`docs/CNAME`。

### checkpoint commit 是什么

checkpoint commit 就是开发过程中的本地安全快照。Git 记录“这一刻项目文件的样子”，后面继续大改时如果失败，可以回到这个点。

它和正式发布 commit 的区别：

- checkpoint 解决“我本地继续改坏了怎么办”。
- 正式发布 commit 解决“线上用户使用哪个版本”。
- checkpoint 可以以后整理、合并或重写；正式发布 commit 要能解释给其他开发者和用户。

## 6. 不做清单

当前不引入 React/Vue/Vite/TypeScript。先补流程、检查、数据、安全和模块边界。
