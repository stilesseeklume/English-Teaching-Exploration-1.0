# 项目日志

> 按日期记录关键决策、进度和下一步。论文写作时可回溯引用。

---

## 项目概况

**项目名**：英语教学系统 1.0  
**定位**：一套辅助教师进行英语教学的体系化工具，当前聚焦试卷讲评课  
**技术栈**：纯前端 HTML/CSS/JS + Supabase 后端（用户系统 + 云同步）  
**部署**：GitHub Pages + 自定义域名 `seeklume.work`  
**仓库**：已关联 GitHub，`main` 分支  

### 三个核心目标

1. **讲卷框架** — 固定导问流程，按步骤引导学生
2. **题库积累** — 每道讲过的题存下来，打上考点标签
3. **跨卷联动** — 讲新卷子时自动关联旧卷同考点题

---

## 2026-05-12（启动日）

### 产出

- **语法填空课堂助手 v1.0 上线**：`src/grammar-fill/index.html`
  - 四个模块：按套卷练习、按考点分类练习、错题本、备课资料
  - 11 个考点标签：谓语动词 · 非谓语动词 · 词性转换 · 数词 · 冠词 · 代词 · 介词 · 逻辑连词 · 定语从句 · 名词性从句 · 状语从句
  - 抽屉式解析面板（可拖拽调整高度），支持上下箭头键盘导航
  - 解析面板：答案 + 定位句 + 解题步骤 + 技巧提示 + 考点理论展开
  - 迁移训练 tab：跨卷同考点题目关联，每套卷取 1 题
  - 字号调节：原文和抽屉独立缩放
- **题库生成脚本**：`scripts/build_grammar_bank.py` — 从 `data/语法填空库/*.md` 生成 `data/grammar_bank.js`
- **GitHub Pages 部署**：`docs/` 目录 + `scripts/deploy.sh`
- **自定义域名**：`seeklume.work` 绑定到 GitHub Pages
- **Supabase 后端接入**：
  - 用户注册/登录（用户名 + 密码，无需邮箱）
  - 错题本和备课资料云端同步
  - 管理员视图（`liuzhenlzstiles@icloud.com` 为管理员）
  - 审批注册模式（关掉邮箱验证，管理员手动审批）
- **Word 文档 + AI 解析**：错题本支持上传 Word 文档，DeepSeek AI 自动识别语法填空题目并解析
- **项目首页**：`docs/index.html`，对外展示项目定位

### 关键决策

- 数据源采用 `data/语法填空库/*.md`（markdown 原始文件），通过 Python 脚本构建为 JS
- 前端数据加载方式：`<script src="../../data/grammar_bank.js">`（外部引用，非内联）
- 后端选 Supabase（免费额度足够个人/小团队使用）

### 提交记录

```
8f8a84c 语法填空课堂助手 v1.0
222ad67 更新 README
49166b4 添加 MIT License
3bd7f60 添加访问密码保护（SHA-256 哈希）
4dda1df Initial commit
2dd5ff2 合并远程仓库
ebcad3a 修正密码：progess -> progress
bf9d25b 接入 Supabase 后端 + 管理员视图
1c932c9 加云同步状态指示器
98eb25f 配置自定义域名 seeklume.work
313964c 添加 Word 文档上传 + DeepSeek AI 智能解析功能
11a3e45 错题本也支持 Word 文档上传 + AI 解析
8cad4e7 修复 UX：返回上一页 + 字号统一缩放
64b9821 添加浮动回到顶部按钮
fde8392 浮动按钮改为始终可见
d29c166 注册登录改为用户名+密码
5620456 抽屉解析改为三tab：解析 + 迁移训练 + 考点理论
```

---

## 2026-05-13（今日）

### 产出

- **多终端并行开发**：多个终端同时跑项目，推进语法填空工具迭代
- **`src/grammar-fill/index.html` 持续迭代**（当前版本：含解析/迁移训练/考点理论三 tab 抽屉）
- ~~**`src/grammar-fill/standalone.html`** (537KB)：数据内联的自包含版本~~ → 2026-05-17 已删除（不再需要线下版）
- **`docs/grammar-fill/index.html`**：部署版本同步更新
- **今日新增临时文件**：
  - `辅助ai的临时性文件/20250513语法填空_import.json` — 错题导入数据
  - `辅助ai的临时性文件/20250513语法填空_备课资料.json` — 备课资料导入数据
  - `辅助ai的临时性文件/山东二模·课堂讲评讲义.md` — 课堂讲评材料
- **项目日志建立**：本文件，开始记录每日进度
- **论文与分享方向初步确定**（见下方关键决策）
- **后端迁移 Supabase → LeanCloud（进行中）**：
  - `src/grammar-fill/index.html` 已改：`window.SUPABASE_URL` → `window.LC_APP_ID`，`supabase.createClient` → `AV.init`，管理员判断从邮箱改为手机号
  - `docs/grammar-fill/index.html` **尚未同步**——部署版仍硬编码 Supabase 密钥
- **考点知识库大扩充**：
  - `predicate`（谓语动词）从 3 条扩至 5 大块：时间标志、语境并列、时态呼应、语态、主谓一致
  - 新增 `nonpredicate`（非谓语动词）完整分类：4 种考法（状语补语、定语、宾语、主语表语）
  - 新增 `word`（词性转换）开始填充
  - `src/grammar-fill/index.html` 和 `docs/grammar-fill/index.html` 均在同步修改

### 工作状态

- **待提交的修改**（`git status` 显示 modified 但未 commit）：
  - `src/grammar-fill/index.html` — LeanCloud 替换 + 知识库扩充
  - `docs/grammar-fill/index.html` — 知识库扩充（但 Supabase 部分未改）
- **未跟踪文件**：`PROJECT_LOG.md`、`supabase/.temp/`

### 发现的 Bug / 待解决问题

- ~~**HTML 独立部署问题**：standalone.html 用于离线/U 盘版~~ → 2026-05-17 已确认不再需要线下版，全部走 seeklume.work 线上
- ~~**docs/ 部署版落后**：LeanCloud 替换只改了 src/~~ → LeanCloud 迁移已回滚，现仍是 Supabase

### 关键决策

- **论文定位**：技术+教育融合 — AI 辅助教师构建试题知识库，实现跨卷联动。核心问题不是「我做了个系统」，而是解决教学痛点「试卷讲评课缺乏结构化引导」「教师难以横向对比真题发现命题规律」
- **首次分享场合**：校内教研组，十几人规模，小面积尝试
- **分享目标**：让老师觉得有用、想用，重点展示 demo（选一篇真题，走一遍导问流程）
- **Git/GitHub**：本会话中已讲解基础概念（commit = 快照，branch = 平行版本，push/pull = 同步）

### 文献基础（写论文可直接引用）

- 陈康等教育部考试院专家论文 21 篇（含框架论文、年度评析 9 篇、读后续写 8 篇、理论 3 篇）
- 课程标准结构化拆解 8 份 md
- 高考评价体系 + 评价体系说明 + 教育评价改革总体方案
- 方法论综合文档 5 份（应用文写作、读后续写、七选五、阅读理解、完形填空、语法填空）
- 课堂模板 4 份（读后续写双轨提纲、应用文双支架提纲、质量自检清单、设计依据）

---

## 下一步（按优先级）

- [x] ~~确认 `standalone.html` 是否完整可用~~ → 2026-05-17 已删除，不再需要线下版
- [ ] 清理 `辅助ai的临时性文件/` 目录中已使用的中间文件
- [ ] 准备论文写作框架（研究问题 + 文献综述 + 方法论 + 预期贡献）
- [ ] 准备教研组分享 outline（痛点 → Demo → 反馈收集）
- [ ] `git add PROJECT_LOG.md && git commit && git push`

---

*此日志随项目推进持续更新。最后更新：2026-05-13*
