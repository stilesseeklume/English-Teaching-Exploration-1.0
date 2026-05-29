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

## 2026-05-28

### 产出

- 建立工程化分支 `codex/engineering-hardening`，以 `261b693` 作为当前回滚基线。
- 新增发布前检查：
  - `scripts/check_grammar_bank.py`：检查题库结构、分类、题号、解析、fine tag。
  - `scripts/check_grammar_modules.py`：检查语法填空模块加载顺序、导出 API 和纯逻辑模块边界。
  - `scripts/check_public_secrets.py`：检查公开仓库密钥泄露。
  - `scripts/check_static_site.sh` / `scripts/check_all.sh`：静态站发布门禁。
  - `scripts/check_supabase_migrations.py`：检查数据库 migration 是否有 rollback，RLS 变更是否有自查脚本。
  - `scripts/check_edge_functions.py`：检查 Edge Function 的接口合同、鉴权、错误返回和 AI key 配置。
  - `tests/smoke.spec.js` + Playwright：自动打开首页、隐私页、语法填空页，验证套卷、讲题台、迁移训练、反馈提交、模拟登录/退出、登录态错题本、备课资料、本地跨账号隔离、投影模式、管理员查看边界，以及 Word 上传的 AI 成功导入、AI/Edge Function 错误降级导入和错误记录。
- 修复安全问题：`scripts/translate_bank.py` 不再硬编码 DeepSeek key，只从 `DEEPSEEK_API_KEY` 环境变量读取。
- 补齐工程文档：
  - `docs/planning/engineering-process.md`
  - `docs/planning/data-lineage.md`
  - `docs/planning/security-privacy.md`
  - `docs/planning/feedback-observability.md`
  - `docs/planning/regression-checks.md`
- 新增 GitHub issue / PR 模板，把目标、影响范围、验收、回滚、安全隐私检查固定到协作流程。
- 新增 Supabase migration：`feedback_reports` 与 `app_events`，用于用户反馈和最小化运行事件记录；同时补对应 rollback SQL 和 RLS 自查脚本。
- 强化 Supabase migration 门禁：`scripts/check_supabase_migrations.py` 现在会检查 rollback 是否覆盖新建 public 表和新建 policy，并要求 RLS 自查脚本覆盖匿名/普通用户/管理员/清理步骤。
- 调整 Playwright smoke 端口：默认从 `8787` 改为 `8797`，并支持 `SEEKLUME_SMOKE_PORT` 覆盖，避免和本机其他服务端口冲突导致误报。
- 新增前端反馈与报错底座：`docs/shared/observability.js`，并在语法填空页接入反馈按钮、反馈弹窗、云同步失败记录。
- 强化反馈和事件上下文脱敏：前端收集和 Supabase 写入前都会递归过滤嵌套的 password/token/key/secret/authorization/cookie 类字段，并替换常见 AI key、JWT 和敏感赋值片段。
- 调整错误观测模块：允许业务模块覆盖当前页面模块，避免 Word/AI 报错只显示为 `lesson-prep`，方便后续定位。
- 补齐反馈问题池字段：`reproducible`、`affected_users_count`、`source`，用于后续分诊、排序和复盘；前端反馈弹窗同步增加“能否复现”和“影响人数”。
- 管理员页新增最小反馈问题池：可查看最近反馈，并将状态从 `new` 推进到 `triaged` / `in_progress` / `released` / `closed`。
- 接入非隐私使用事件：模块打开、讲题台打开、讲题 tab 切换、迁移训练查看/来源切换、投影模式进入/退出，便于判断真实功能使用情况。
- 调整事件去重规则：短时间重复事件仍去重，但 `source` / `tab` / `status` 不同的事件会保留，避免漏掉迁移来源切换和反馈状态推进。
- 拆出第一批纯逻辑/状态模块：
  - `docs/grammar-fill/modules/category-rules.js`
  - `docs/grammar-fill/modules/teaching-axes.js`
  - `docs/grammar-fill/modules/migration-training.js`
  - `docs/grammar-fill/modules/question-model.js`
  - `docs/grammar-fill/modules/passage-utils.js`
  - `docs/grammar-fill/modules/app-state.js`
- 继续拆文本处理纯逻辑：`docs/grammar-fill/modules/passage-utils.js` 承接题目句定位、空格前缀计算和英文/中文句子对齐；`index.html` 继续负责 HTML 拼接和交互按钮，避免把 UI 副作用塞进纯模块。
- 继续拆讲题台纯逻辑：新增 `docs/grammar-fill/modules/teaching-view-model.js`，承接讲题 tab 标准化、讲题头部信息、知识图谱节点选择和思维导图激活规则；`index.html` 保留包装函数，降低一次性重构风险。
- 继续拆题目判断纯逻辑：新增 `docs/grammar-fill/modules/focus-rules.js`，承接题目文本聚合、词性转换目标识别、谓语线索识别、陷阱 ID 推断和小考点识别；`index.html` 保留旧函数名作为包装，降低对迁移训练、讲题卡和知识图谱的影响。
- 继续拆讲题卡规则：`docs/grammar-fill/modules/teaching-guide.js` 承接 `FOCUS_GUIDES`、`TRAP_GUIDES`、讲题卡生成和课堂路径生成；`index.html` 只保留兼容包装，避免迁移训练、抽屉和投影模式一次性改调用入口。
- 继续拆讲题台思维导图规则：`docs/grammar-fill/modules/teaching-view-model.js` 承接 `TEACHING_GRAMMAR_MINDMAPS` 和思维导图定义选择；`index.html` 保留兼容常量和包装函数，避免 UI 渲染层同步大改。
- 继续拆题目模型纯逻辑：`docs/grammar-fill/modules/question-model.js` 承接套卷题目构造、套卷状态构造、错题状态构造、fine tag 展示信息和知识库频次统计；`index.html` 保留旧函数名作为包装，降低知识库、错题本和讲题台同步改造风险。
- 继续拆迁移训练和知识图谱纯逻辑：`docs/grammar-fill/modules/migration-training.js` 承接课堂迁移 key 生成与重合判断，`docs/grammar-fill/modules/teaching-view-model.js` 承接图谱节点索引、节点类型标签、颜色、尺寸、关联节点、聚焦状态、预设视图、边界计算和文字换行；`index.html` 继续保留兼容包装，避免 UI 层一次性大改。
- 继续拆迁移训练推荐规则：`docs/grammar-fill/modules/migration-training.js` 承接按课堂判断 key、非谓语形式/功能、fine tag、trap、focus、粗分类兜底构建推荐池，并生成 header、tabs、空状态和迁移题卡元数据；`index.html` 只负责注册题卡、生成句子 HTML 和渲染按钮。
- 继续拆知识图谱数据逻辑：`docs/grammar-fill/modules/teaching-view-model.js` 承接节点标签组、节点路径、节点与题目匹配、相关题池筛选、图谱搜索、知识地图分类标签和根节点颜色；`index.html` 只保留渲染面板、按钮和 DOM 事件。
- 推进状态收敛：`GrammarAppState` 由一次性初始化升级为同步桥，覆盖进入套卷/错题/备课、打开讲题台、讲题 tab 切换、迁移题跳转和退出讲题等关键状态变化。
- 继续推进状态收敛：`docs/grammar-fill/modules/app-state.js` 承接当前题号计算、上一视图返回文案和 dock 返回文案；`docs/grammar-fill/modules/question-model.js` 承接套卷排序；`index.html` 只负责读取 DOM 当前页和触发实际导航。
- 继续推进状态收敛：`docs/grammar-fill/modules/app-state.js` 承接讲题上下文快照、题组上下文比较、题号范围规范和讲题 session 构造；`index.html` 保留旧入口和 UI 副作用，避免讲题台、迁移跳题、投影模式一次性大改。
- 继续拆页面数据模型：新增 `docs/grammar-fill/modules/sidebar-view-model.js`，承接侧边栏的套卷按年份分组、考点计数、错题分组、备课列表和激活项判断；`index.html` 继续负责 HTML 拼接和点击事件。
- 继续拆主页 Dashboard 规则：新增 `docs/grammar-fill/modules/home-dashboard-model.js`，承接新/活跃用户判断、按时间欢迎语、教材封面顺序和首页行动入口元数据；`index.html` 保留现有视觉和 DOM 交互。
- 继续拆套卷入口规则：新增 `docs/grammar-fill/modules/exam-grid-model.js`，承接首页套卷列表的年份分组、真题/模拟标签样式、题量统计和卡片数据；`index.html` 只负责生成 HTML 和触发进入套卷。
- 继续拆课堂切换条规则：新增 `docs/grammar-fill/modules/classroom-switcher-model.js`，承接课堂顶部套卷下拉、题号下拉、答案按钮和进度文案的数据模型；`index.html` 继续负责更新 DOM 和触发导航。
- 继续拆练习页视图状态：新增 `docs/grammar-fill/modules/practice-view-model.js`，承接练习页标题/题量、答案/中文切换按钮、中文翻译来源和翻译用原文生成；`index.html` 保留正文 HTML 渲染、AI 翻译请求和点击事件。
- 继续拆练习页正文规则：`docs/grammar-fill/modules/practice-view-model.js` 承接考点模式按套卷分组、考点页提示文案、套卷/备课 passage 来源、段落切分和未定位空格兜底列表；同时修正考点模式点击题目时的索引字段。
- 继续拆知识库页面数据模型：新增 `docs/grammar-fill/modules/knowledge-view-model.js`，承接考点分布统计、书本速查搜索索引、fine category 统计、教材单元分组、教材册题量统计和 unit 题单筛选；`index.html` 继续负责具体 HTML、弹窗和导航副作用。
- 回填浙江首考缺失解析，修复发布检查暴露的数据质量问题。
- 明确题库数据产物边界：`data/grammar_bank.js` 保留“自动生成勿手改”头部，`docs/data/grammar_bank.js` 保留“当前 canonical，可手改但必须跑检查”头部，并把该规则纳入检查脚本。
- 强化题库数据链路门禁：`scripts/check_grammar_bank.py` 现在会检查 `data/grammar_bank.js` 自动生成头部，并核对 `data/语法填空库/*.md`、`data/grammar_bank.json`、`docs/data/grammar_bank.js` 的套卷清单一致。
- 统一发布前命令为 `npm run check`，底层仍调用 `scripts/check_all.sh`；新增 `docs/planning/release-checklist-template.md`，把发布目标、影响范围、验证、回滚和发布后观察固定成模板。
- 补齐用户数据权利最小版本：账户设置支持导出错题本/备课资料 JSON、清空自己的云端学习数据，并可提交账号删除申请到反馈问题池；账号真实删除仍需后续服务端 Edge Function 或管理员处理，避免前端暴露 service role key。
- 补强大改回滚流程：`docs/planning/engineering-process.md` 和 `docs/planning/release-runbook.md` 明确回滚基线、checkpoint commit 和本地大改失败时的处理方式。checkpoint 是本地安全快照，不等同于正式发布。
- 新增 `AGENTS.md` 作为 AI 工作规程：固定要求新对话先读 `PROJECT_LOG.md` 与 `docs/planning/*.md`，明确技术路线、安全边界、编辑规则、验证命令、Supabase/AI 授权边界和收尾汇报格式，降低跨对话交接成本。
- 继续拆练习页正文规则：`docs/grammar-fill/modules/practice-view-model.js` 承接按题号替换空格、考点模式句子模型、套卷/备课正文按位置顺序替换和未匹配空格统计；`index.html` 只负责生成 HTML 标签和点击事件。
- 继续推进状态收敛：`docs/grammar-fill/modules/app-state.js` 承接练习页显示状态的重置、答案切换和中文切换纯规则；`index.html` 保留 `showAnswers` / `showChinese` 兼容变量，但所有练习页显示状态变化统一经由 `GrammarAppState` 同步桥。
- 继续推进状态收敛：`docs/grammar-fill/modules/app-state.js` 承接原文/抽屉字号的夹取和增减规则；`index.html` 保留 `passageFontSize` / `drawerFontSize` 兼容变量，只负责把状态结果写入 CSS 变量和页面数字。
- 继续推进状态收敛：`docs/grammar-fill/modules/app-state.js` 承接主页视图规范化和 dock key 选择；`index.html` 保留 `_currentHomeView` 兼容变量，但主页/套卷/考点分类切换统一经由 `GrammarAppState` 同步桥。
- 继续推进状态收敛：`docs/grammar-fill/modules/app-state.js` 承接知识库视图规范化和节点/key 状态构造；`index.html` 保留 `currentKnowledgeView/currentKnowledgeKey/currentKnowledgeNodeId/currentIsPattern` 兼容变量，但教材/考点/书本速查/知识地图/全局图谱切换统一经由 `GrammarAppState` 同步桥。
- 继续收敛错题本/备课资料状态：`docs/grammar-fill/modules/saved-materials-model.js` 承接导入结果文案、批量模式状态、选择数量文案、单条/批量删除计划、删除确认文案和云端删除失败文案；`docs/grammar-fill/modules/app-state.js` 新增 `errorBulkMode` / `prepBulkMode` 同步桥，`index.html` 继续只负责 DOM、保存、弹窗和云端调用。
- 继续收敛错题本/备课资料批量导入规则：`docs/grammar-fill/modules/saved-materials-model.js` 承接 JSON 文本解析、空数组判断和错题/备课两套错误文案；`index.html` 的批量导入入口继续只负责读取 textarea、调用导入计划、保存、渲染和 alert。
- 继续收敛返回状态：`docs/grammar-fill/modules/app-state.js` 承接 dock 返回动作、上一视图返回目标、抽屉返回状态设置与消费；`index.html` 继续只负责实际切页、关闭抽屉、知识库视图跳转和遮罩动画。
- 继续收敛抽屉关闭动作：`docs/grammar-fill/modules/app-state.js` 承接关抽屉、关 overlay、清选中题、关浮层、清高亮、刷新课堂切换条和是否清返回上下文的动作计划；`index.html` 继续只负责 DOM class、状态同步和真实渲染副作用。
- 继续收敛迁移训练来源偏好：`docs/grammar-fill/modules/app-state.js` 承接迁移训练来源规范化和状态构造；`index.html` 保留 localStorage、使用事件和 DOM 渲染副作用，避免偏好状态继续散落在页面脚本中。
- 继续收敛迁移训练来源切换动作计划：`docs/grammar-fill/modules/app-state.js` 承接来源规范化、localStorage 值、使用事件 payload、讲题台/抽屉重渲染目标和抽屉失败兜底文案；`index.html` 继续只负责真实存储、事件记录和 DOM 重渲染。
- 继续收敛紧凑/投影视图状态：`docs/grammar-fill/modules/app-state.js` 承接紧凑模式、投影全屏请求状态、退出投影状态和投影抽屉尺寸规范化；`index.html` 继续负责 body class、fullscreen API、localStorage 和使用事件。
- 继续收敛抽屉高度状态：`docs/grammar-fill/modules/app-state.js` 承接抽屉高度解析、上下限夹取和拖拽高度计算；`index.html` 继续负责拖拽事件监听、DOM style 写入和 localStorage 保存。
- 继续收敛字号派生状态：`docs/grammar-fill/modules/app-state.js` 承接原文/抽屉字号对应的 CSS 变量和显示文案模型；`index.html` 继续只负责把变量写入 DOM 和更新数字。
- 继续收敛讲题返回栈状态：`docs/grammar-fill/modules/app-state.js` 承接讲题返回上下文 peek、返回文案、push/pop/clear；`index.html` 继续负责真正切页、恢复原题和返回教材视图。
- 继续收敛上一视图和普通题号导航状态：`docs/grammar-fill/modules/app-state.js` 承接上一视图规范化、练习入口返回目标和普通空格上一题/下一题循环规则；`index.html` 只保留 `setPreviousView` 同步桥、实际切页、讲题 session 分支和 DOM 渲染。
- 继续收敛页面/dock 激活状态：`docs/grammar-fill/modules/app-state.js` 承接 page key、dock key、页面切换状态和 dock 激活状态规则；`index.html` 继续负责登录守卫、body class、DOM active class、渲染和使用事件。
- 继续收敛选中题状态：`docs/grammar-fill/modules/app-state.js` 承接按题号下标选择、按上下文恢复、按题号查找和清空选中题规则；`index.html` 只保留 `selectedQuestion` 兼容变量、DOM 高亮、讲题台渲染和同步桥。
- 继续收敛讲题 session 内部状态：`docs/grammar-fill/modules/app-state.js` 承接讲题 tab 标准化、答案显示切换/强制显示和 session 清空规则；`index.html` 继续负责讲题台 DOM、事件记录、全屏和内容渲染。
- 继续拆出讲题抽屉显示模型：`docs/grammar-fill/modules/teaching-guide.js` 承接讲题卡标题、触发句、前三步、常错文案、解题兜底文案和解析/讲题浮层开关计划；`index.html` 继续只负责 HTML 拼接、转义和 DOM class 写入。
- 继续收敛抽屉 tab 切换状态：`docs/grammar-fill/modules/app-state.js` 承接抽屉 tab 归一、教学台转交、普通抽屉 tab chrome、内容类型和错误兜底计划；`index.html` 继续只负责 DOM class、内容渲染函数和异常兜底写入。
- 继续收敛错题本/备课资料导入面板状态：`docs/grammar-fill/modules/saved-materials-model.js` 承接批量导入表单 id、显隐 class 和下一步显隐计划；`index.html` 继续只负责读取当前 DOM 状态并执行 class 切换。
- 继续收敛错题本/备课资料进入练习页动作：`docs/grammar-fill/modules/saved-materials-model.js` 承接入口存在性、关抽屉、重置显示、previousView 来源、同步状态、切练习页和渲染意图；`index.html` 继续负责查找资料、构造练习上下文和真实切页渲染。
- 继续收敛错题本/备课资料批量选择状态：`docs/grammar-fill/modules/saved-materials-model.js` 承接批量选择 checkbox selector、信息节点 id、选中数量显示计划和全选/清空计划；`index.html` 继续只负责读取 DOM 勾选数量和设置 checkbox。
- 继续收敛讲题迁移训练临时 registry：`docs/grammar-fill/modules/app-state.js` 承接迁移题注册、按 id 查回和清空状态构造；`index.html` 保留迁移训练渲染、点击句子跳题和实际导航副作用。
- 继续收敛练习上下文状态：`docs/grammar-fill/modules/app-state.js` 承接 `currentExam/currentQuestions` 练习上下文规范化和清空规则；`index.html` 只保留 `applyPracticeContextState` 同步桥，套卷、考点、错题、备课、迁移题和教材题入口统一经由该桥落状态。
- 继续收敛讲题返回/基准上下文状态：`docs/grammar-fill/modules/app-state.js` 承接讲题返回栈规范化、返回栈状态构造、基准上下文构造/清空和是否恢复判断；`index.html` 只保留 `applyTeachingReturnStackState` / `applyTeachingBaseContextState` 同步桥，迁移题、教材题和退出讲题时不再直接散写返回栈与基准上下文。
- 继续拆统一导入弹窗显示规则：`docs/grammar-fill/modules/saved-materials-model.js` 承接 Word/AI 统一导入面板的标题、模式提示、合集提醒、题数汇总、选中数量、题卡字段和确认导入结果文案；`docs/shared/word-import.js` 继续负责 DOM 渲染、勾选状态、保存、重渲染和弹窗副作用。
- 继续收敛统一导入确认规则：`docs/grammar-fill/modules/saved-materials-model.js` 承接 Word/AI 统一导入的确认计划，统一生成备课整篇导入列表、错题勾选单题列表和无效选择计数；`docs/shared/word-import.js` 继续只负责读取复选框、执行保存、重渲染和弹窗副作用。
- 继续拆 Word/AI 入库计划：`docs/grammar-fill/modules/saved-materials-model.js` 承接 DeepSeek 结果转备课资料/错题本、稳定内容 id、重复判断、nextItems 和导入提示文案；`docs/shared/word-import.js` 保留旧入口函数名，但只负责执行保存、渲染、云同步和 alert。
- 继续拆 Word/AI 导入进度与提示文案：`docs/grammar-fill/modules/saved-materials-model.js` 承接导入初始阶段、长文档确认文案、拆分进度、分批解析进度、完成进度和失败兜底提示；`docs/shared/word-import.js` 继续负责 overlay、confirm、alert、解析请求和计时器。
- 继续收敛 Word/AI 解析错误文案：`docs/grammar-fill/modules/saved-materials-model.js` 承接网络失败、超时、Edge Function HTTP 错误 payload 到教师可读文案的归一化；`docs/shared/word-import.js` 继续负责 fetch、鉴权、事件记录和 fallback 入库。
- 新增 `docs/grammar-fill/modules/word-import-model.js`：承接 Word 文本规范化、标题识别、答案块提取、fallback 空格生成、长文档拆篇、AI 解析结果规范化、空格标记修复和最终篇章去重；`docs/shared/word-import.js` 只保留薄包装和浏览器副作用。
- 继续收敛投影/讲题全屏请求状态：`index.html` 新增 `applyProjectionState` 同步桥，复用 `GrammarAppState` 既有投影状态纯函数，页面层继续只负责 fullscreen API、body class 和事件监听。
- 清理讲题菜单死状态：移除 `index.html` 中已无读取路径的 `_teachingMenuOpen` 兼容变量，避免后续维护时把无效状态误认为菜单状态源。
- 继续收敛讲题跨页保留状态：`docs/grammar-fill/modules/app-state.js` 承接页面切换时是否保留讲题台的状态构造和关闭判断；`index.html` 新增 `switchPageKeepingTeaching` 同步桥，迁移题/教材题/恢复原题跳转不再手写 `_keepTeachingOnPageSwitch` true/false。
- 继续收敛教材视图模式状态：`docs/grammar-fill/modules/app-state.js` 承接教材画廊/列表模式规范化和状态构造；`index.html` 保留 `_textbookViewMode` 兼容变量、教材渲染和弹窗副作用，但切换模式统一经由同步桥落回状态容器。
- 继续收敛知识库搜索索引状态：`docs/grammar-fill/modules/app-state.js` 承接搜索索引缓存规范化和状态构造；`index.html` 保留搜索输入、导航显隐和结果渲染副作用，但索引构建后同步回 `GrammarAppState`。
- 继续收敛教材 unit 题单上下文状态：`docs/grammar-fill/modules/app-state.js` 承接 unit 题单来源、筛选、tag 列表规范化和清空状态构造；`index.html` 保留 `_unitMiniContext` 兼容变量、教材弹窗、题单渲染和讲题跳转副作用。
- 继续收敛全局图谱状态：`docs/grammar-fill/modules/app-state.js` 承接图谱缩放、平移、适配边界、居中节点和聚焦节点状态构造；`index.html` 保留 SVG 渲染、鼠标事件、按钮和 inspector 副作用。
- 继续收敛讲题 dock 显示状态：`docs/grammar-fill/modules/app-state.js` 承接讲题上一题/下一题、题号轨道、tab 激活、返回按钮和退出按钮的数据模型；`index.html` 继续只负责按钮 HTML 和点击事件。
- 继续收敛讲题台打开动作计划：`docs/grammar-fill/modules/app-state.js` 承接选中题、是否捕获基准上下文、讲题 session、全屏请求、关闭抽屉和使用事件 payload；`index.html` 继续只负责 DOM class、fullscreen API、事件记录和真实渲染。
- 继续收敛讲题台题号跳转动作计划：`docs/grammar-fill/modules/app-state.js` 承接上一题/下一题/指定题号跳转的目标下标、讲题选项、关闭菜单和关闭浮层标记；`index.html` 继续只负责关闭 DOM 浮层并执行真实打开讲题台。
- 继续收敛讲题台空格显隐动作计划：`docs/grammar-fill/modules/app-state.js` 承接讲题题干/迁移题空格 revealed 状态、显示文本和答案同步标记；`index.html` 继续只负责 class/text 写入和讲题 session 同步。
- 继续拆迁移训练卡片显示模型：`docs/grammar-fill/modules/migration-training.js` 承接抽屉迁移卡片的题源、真题/模拟标签、错题强调、讲法和 CTA 文案；`index.html` 继续负责句子 HTML、跳题点击和卡片结构。
- 继续拆考点理论抽屉显示模型：`docs/grammar-fill/modules/teaching-guide.js` 承接理论资料空状态、当前考点标题、课堂路径、overview 和折叠 section 数据；`index.html` 继续负责转义、原有内容 HTML 挂载和折叠渲染。
- 继续拆讲题知识面板显示模型：`docs/grammar-fill/modules/teaching-view-model.js` 承接讲题台知识 tab 的导图标题、路径、全图定位、父级/同级/分支 active 和规则编号数据；`index.html` 继续负责 HTML 拼接、转义和全图定位点击副作用。
- 继续收敛讲题台外壳显示模型：`docs/grammar-fill/modules/teaching-view-model.js` 承接讲题台来源、题号文案、分类文案、focus layout 判断和中文句子折叠数据；`index.html` 继续负责题干 HTML、tab 内容渲染、DOM 写入和滚动。
- 继续拆迁移训练面板显示模型：`docs/grammar-fill/modules/migration-training.js` 承接讲题台/抽屉迁移训练 tabs active、标题、副标题、计数文案和空状态提示数据；`index.html` 继续负责两套容器样式、按钮点击、句子 HTML 和注册迁移题副作用。
- 继续拆迁移训练内容显示模型：`docs/grammar-fill/modules/migration-training.js` 承接迁移训练 tabs、标题、副标题、计数、空态和题卡 entry 组合模型；`index.html` 继续负责讲题台/抽屉两套 HTML 结构、句子 HTML、按钮点击和跳题副作用。
- 继续拆讲题 guide 面板显示模型：`docs/grammar-fill/modules/teaching-guide.js` 承接讲题 tab 的 kicker、标题、副标题和实际讲题卡选择；`index.html` 继续负责 HTML 拼接、转义和讲题卡渲染。
- 继续拆解析抽屉显示模型：`docs/grammar-fill/modules/teaching-guide.js` 承接解析抽屉答案、中文句子、浮层按钮、导航显隐、迁移数量和解题模型；`docs/grammar-fill/modules/migration-training.js` 承接解析抽屉迁移候选计数；`index.html` 继续负责题干句子 HTML、按钮样式、浮层开关和抽屉 DOM。
- 继续拆练习页正文显示模型：`docs/grammar-fill/modules/practice-view-model.js` 承接练习页正文类型、空格/答案 slot 和未定位空格提示模型；`index.html` 继续负责 HTML 标签、样式和点击事件。
- 继续拆错题本/备课资料列表显示模型：`docs/grammar-fill/modules/saved-materials-model.js` 承接列表统计文案、空态文案、分组标题、列表项元数据和批量勾选显隐；`index.html` 继续负责 HTML 标签、点击事件和云端同步。
- 继续拆练习页考点分布条显示模型：`docs/grammar-fill/modules/knowledge-view-model.js` 承接标题和 tag 文案；`index.html` 继续负责颜色 style、点击跳题和 DOM 写入。
- 继续拆主页 Dashboard 按钮显示模型：`docs/grammar-fill/modules/home-dashboard-model.js` 承接行动按钮 tone 对应的 style/hover/subtitle chrome；`index.html` 继续负责 onclick 串、HTML 标签和真实跳转副作用。
- 继续拆侧边栏显示/动作模型：`docs/grammar-fill/modules/sidebar-view-model.js` 承接侧边栏 item action、题量文案和题号文案；`index.html` 继续负责 HTML 标签和实际 onclick 字符串生成。
- 继续拆知识库显示模型：`docs/grammar-fill/modules/knowledge-view-model.js` 承接搜索面板显隐、结果标题/action、空态/溢出提示、考点视图 header/图例/tag 弹窗文案、教材画廊/列表切换、教材册统计、modal 副标题、unit 题单筛选 chip 和题卡元数据；`index.html` 继续只负责 DOM、HTML 标签、弹窗和真实导航副作用。
- 继续拆知识库/全局图谱显示模型：`docs/grammar-fill/modules/knowledge-view-model.js` 承接知识侧栏导航、知识地图页、知识节点详情、全局图谱页面按钮、inspector、搜索结果以及 SVG 集群/边/节点显示模型；`index.html` 继续负责 DOM、SVG 标签拼接、拖拽缩放和真实导航副作用。
- 继续拆书本速查正文显示模型：`docs/grammar-fill/modules/knowledge-view-model.js` 承接书本速查/跨考点模式正文 header、overview、折叠 subsection 和原有内容 HTML；`index.html` 继续只负责插入 DOM、折叠切换和滚动定位副作用。
- 继续拆知识库视图切换显示模型：`docs/grammar-fill/modules/knowledge-view-model.js` 承接知识库顶部按钮 active、侧栏显隐、视图渲染动作和书本速查 fallback key；`index.html` 继续只负责 DOM class/style 写入和调用真实渲染函数。
- 继续拆教材弹窗/Unit 题单弹窗显示模型：`docs/grammar-fill/modules/knowledge-view-model.js` 承接教材 modal close 文案、Unit 题单 header/filter/empty/hidden 和讲题/投影动作数据；`index.html` 继续负责 DOM、动画、滚动、关闭和真实跳题副作用。
- 继续收敛 Unit 题单跳题动作计划：`docs/grammar-fill/modules/knowledge-view-model.js` 承接 Unit 题单讲题/投影跳转的来源、上一视图、讲题台参数、返回上下文和延迟执行计划；`index.html` 继续负责全屏请求、弹窗关闭、真实找题、切页和打开讲题台。

### 验证

- `bash scripts/check_all.sh` 通过。
- `npm run check` 通过。
- `python3 scripts/check_grammar_modules.py` 通过，16 个语法填空模块契约有效。
- `python3 scripts/check_grammar_modules.py` 覆盖 `GrammarPracticeViewModel` 的空格替换、考点练习模型和顺序替换 API，防止练习页正文规则回流到大 HTML。
- `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path"` 通过，覆盖语法填空核心路径和本轮新增 PracticeViewModel 断言。
- `python3 scripts/check_grammar_bank.py` 会检查公开题库 canonical 头部，防止数据真源和发布数据角色再次混淆。
- `python3 scripts/check_grammar_bank.py` 会检查原始 markdown、结构化 JSON、公开发布 JS 的套卷清单一致，防止新增题库素材后忘记重新生成或发布。
- `python3 scripts/check_supabase_migrations.py` 会检查 migration、rollback 和 RLS 自查脚本的覆盖关系，防止数据库结构改动缺少回滚和权限验证路径。
- `npm run check` 中的 Playwright smoke 会使用独立本地端口；若本机端口冲突，可通过 `SEEKLUME_SMOKE_PORT=8897 npm run check` 指定。
- `npx playwright test tests/smoke.spec.js --project=chromium` 通过，9 条 smoke 测试全部通过。
- Playwright smoke 已断言 `GrammarTeachingViewModel` 加载，并覆盖讲题台打开、迁移 tab 和图谱节点选择基础逻辑。
- Playwright smoke 已断言 `GrammarPassageUtils` 能生成题目英文句、空格前缀和对应中文句，防止讲题台句子定位规则从 HTML 迁出后静默失效。
- Playwright smoke 已断言 `GrammarFocusRules` 加载，并覆盖小考点识别与陷阱 ID 推断基础逻辑。
- Playwright smoke 已断言 `GrammarTeachingGuide` 能生成讲题卡和课堂路径，防止讲题卡规则从 HTML 迁出后静默失效。
- Playwright smoke 已断言 `GrammarTeachingGuide` 能生成讲题卡显示模型和解题兜底文案，防止讲题抽屉展示规则回流到大 HTML。
- Playwright smoke 已断言 `GrammarTeachingGuide` 能生成解析/讲题浮层开关计划，防止浮层 selector、打开判断和 active class 规则回流到大 HTML。
- Playwright smoke 已断言 `GrammarTeachingViewModel` 能生成思维导图定义和 active keys，防止思维导图规则从 HTML 迁出后静默失效。
- Playwright smoke 已断言 `GrammarMigrationTraining` 能生成课堂迁移 key 并判断 key 重合，防止迁移训练推荐规则从 HTML 迁出后静默失效。
- Playwright smoke 已断言 `GrammarMigrationTraining` 能生成完整迁移训练数据，包括 tabs、header、推荐池数量和迁移题卡元数据，防止迁移训练筛题规则从 HTML 迁出后静默失效。
- Playwright smoke 已断言 `GrammarMigrationTraining` 能生成迁移训练题卡行显示模型，包括序号、题源、真题/模拟/错题标签和行 class，防止迁移训练题卡展示规则回流到大 HTML。
- Playwright smoke 已断言 `GrammarMigrationTraining` 能生成迁移训练内容显示模型，覆盖 tabs、标题、计数、entry 行模型和抽屉卡片模型，防止讲题台/抽屉迁移内容组合规则回流到大 HTML。
- Playwright smoke 已断言 `GrammarTeachingViewModel` 能生成知识图谱节点索引、关联节点、边界、预设视图、节点标签/颜色和文字换行，防止全局图谱计算规则从 HTML 迁出后静默失效。
- Playwright smoke 已断言 `GrammarTeachingViewModel` 能生成节点标签组、节点路径、相关题池、图谱搜索结果、知识地图分类标签和根节点颜色，防止知识图谱 inspector/search 规则从 HTML 迁出后静默失效。
- Playwright smoke 已断言 `GrammarQuestionModel` 能生成套卷题目、套卷状态、fine tag 信息和知识库频次标签，防止题目模型从 HTML 迁出后静默失效。
- Playwright smoke 已覆盖 `GrammarAppState` 同步：进入套卷、打开讲题台、切换讲题 tab、退出讲题后状态容器与页面状态一致。
- Playwright smoke 已断言 `GrammarAppState` 状态工具能生成上下文快照、比较题组上下文、循环题号、夹取题号，并构造讲题 session，防止状态逻辑迁出后静默失效。
- Playwright smoke 已断言 `GrammarAppState` 能重置练习页显示状态、切换答案和切换中文，并覆盖页面按钮点击后 `showAnswers` / `showChinese` 与按钮显示同步。
- Playwright smoke 已断言 `GrammarAppState` 能夹取和增减字号，并覆盖原文字号按钮点击后状态容器、页面显示和 CSS 变量同步。
- Playwright smoke 已断言 `GrammarAppState` 能规范主页视图和 dock key，并覆盖套卷/考点分类 dock 点击后 `currentHomeView` 与当前高亮 dock 同步。
- Playwright smoke 已断言 `GrammarAppState` 能规范知识库视图状态，并覆盖教材视图、考点视图和书本速查切换后状态容器与页面一致。
- Playwright smoke 已断言 `GrammarQuestionModel` 能生成按年份倒序的套卷列表，`GrammarAppState` 能计算当前题号、上一视图返回文案和 dock 返回文案。
- Playwright smoke 已断言 `GrammarSidebarViewModel` 能生成侧边栏套卷分组、考点列表、错题分组、备课列表和当前项高亮数据，防止侧边栏规则从 HTML 迁出后静默失效。
- Playwright smoke 已断言 `GrammarCategoryRules` 能生成首页考点分类分组、卡片标签/标题/描述、题量文案、入口 action 元数据、按考点练习入口状态和空分类提示，防止按考点入口展示规则继续散落在大 HTML 中。
- Playwright smoke 已断言 `GrammarHomeDashboardModel` 能生成首页题库/错题/备课统计文案、新/活跃用户状态、hero 文案、教材封面画廊、教材速览入口、行动入口副文案和 action 元数据，防止主页 Dashboard 规则从 HTML 迁出后静默失效。
- Playwright smoke 已断言 `GrammarHomeDashboardModel` 能生成主页 Dashboard 行动按钮 chrome，覆盖主按钮阴影、红色 hover 和副文案样式，防止按钮显示规则回流到大 HTML。
- Playwright smoke 已断言 `GrammarExamGridModel` 能生成首页套卷卡片分组、分组标题文案、卡片描述文案、入口 action 元数据、模拟卷标签样式、未知年份兜底和题量统计，防止套卷入口规则从 HTML 迁出后静默失效。
- Playwright smoke 已断言 `GrammarClassroomSwitcherModel` 能生成课堂顶部切换条选项、禁用状态、答案按钮文案和进度文案，防止课堂导航规则从 HTML 迁出后静默失效。
- Playwright smoke 已断言 `GrammarPracticeViewModel` 能生成练习页外壳模型、标题/题量、答案/中文按钮状态、底部提示、中文翻译段落和翻译用填空原文，防止练习页状态规则从 HTML 迁出后静默失效。
- Playwright smoke 已断言 `GrammarPracticeViewModel` 能生成考点模式分组、提示文案、正文来源、段落切分和未定位空格兜底列表，并覆盖考点模式点击空格打开讲题台。
- Playwright smoke 已断言 `GrammarSidebarViewModel` 能生成侧边栏 action、题量文案和题号文案，防止侧边栏导航元数据回流到大 HTML。
- Playwright smoke 已断言 `GrammarPracticeViewModel` 能生成正文类型、答案/空格 slot 和未定位空格提示模型，防止练习页正文显示规则回流到大 HTML。
- Playwright smoke 已断言 `GrammarKnowledgeViewModel` 能生成考点分布、知识库搜索结果、fine category 统计、教材册/单元统计和 unit 题单筛选结果，防止知识库数据规则从 HTML 迁出后静默失效。
- Playwright smoke 已断言 `GrammarKnowledgeViewModel` 能生成知识库搜索面板、考点视图 header/图例/tag 弹窗文案、教材视图切换/册统计/modal 文案和 unit 题单筛选/题卡显示模型，防止知识库展示规则回流到大 HTML。
- Playwright smoke 已断言 `GrammarKnowledgeViewModel` 能生成知识侧栏导航、知识地图、节点详情、全局图谱页面、inspector、搜索结果和 SVG 节点/边显示模型，防止全局图谱展示规则继续散落在大 HTML 中。
- Playwright smoke 已断言 `GrammarKnowledgeViewModel` 能生成书本速查/跨考点模式正文模型，防止 `selectKnowledgeCategory` 再次承接正文结构规则。
- Playwright smoke 已断言 `GrammarKnowledgeViewModel` 能生成知识库视图切换 chrome 模型，防止按钮 active、侧栏显隐和 book fallback 规则继续留在 `setKnowledgeView`。
- Playwright smoke 已断言 `GrammarKnowledgeViewModel` 能生成精细考点视图级模型，覆盖空态、总 tag 数、分类 badge、扩展标签显隐和 tag 弹窗 action，防止 `renderFineCategoryView` 继续承接视图规则。
- Playwright smoke 已断言 `GrammarKnowledgeViewModel` 能生成教材视图级模型，覆盖教材空态、画廊/列表模式、切换按钮、书册列表和封面缓存，防止 `renderTextbookView` 继续承接视图状态规则。
- Playwright smoke 已断言 `GrammarKnowledgeViewModel` 能生成练习页考点分布条标题和 tag 文案，防止考点分布显示规则回流到大 HTML。
- Playwright smoke 已断言 `GrammarKnowledgeViewModel` 能生成教材弹窗和 Unit 题单弹窗显示模型，覆盖关闭文案、header、筛选显隐、题卡动作和投影动作元数据，防止弹窗外壳规则继续留在大 HTML。
- Playwright smoke 已断言 `GrammarSavedMaterialsModel` 能生成导入结果文案、批量模式状态、选择数量文案、删除计划、确认文案和云端删除失败文案，并覆盖错题本/备课资料批量模式切换后 `GrammarAppState` 同步。
- Playwright smoke 已断言 `GrammarSavedMaterialsModel` 能生成错题本/备课资料列表统计、空态、分组标题、列表项元数据和批量勾选显隐，防止保存资料列表规则回流到大 HTML。
- Playwright smoke 已断言 `GrammarAppState` 能生成 dock 返回动作、上一视图返回目标，并能设置/消费抽屉返回状态，防止返回规则继续散落在大 HTML 中。
- Playwright smoke 已断言 `GrammarAppState` 能规范迁移训练来源偏好，并覆盖迁移来源切换后 localStorage 与状态容器同步。
- Playwright smoke 已断言 `GrammarAppState` 能生成紧凑/投影/投影抽屉尺寸状态，并覆盖紧凑模式、投影进入/退出和抽屉尺寸切换后状态容器同步。
- Playwright smoke 已断言 `GrammarAppState` 能解析、夹取和计算抽屉高度，防止抽屉拖拽规则回流到大 HTML。
- Playwright smoke 已断言 `GrammarAppState` 能生成字号 CSS 变量和显示文案模型，防止字号比例派生规则继续散落在 `index.html`。
- Playwright smoke 已断言 `GrammarAppState` 能处理讲题返回栈 push/pop/clear 和返回文案，防止迁移题/教材题跳转后的返回状态继续散落在大 HTML 中。
- Playwright smoke 已断言 `GrammarAppState` 能规范上一视图、生成练习入口返回目标，并计算普通空格上一题/下一题循环索引，防止返回和题号导航规则继续散落在大 HTML 中。
- Playwright smoke 已断言 `GrammarAppState` 能规范 page/dock key、生成页面切换状态和 dock 激活状态，并覆盖主页、套卷、练习页、知识库和考点 dock 切换后的状态同步。
- Playwright smoke 已断言 `GrammarAppState` 能生成页面登录守卫状态，防止受保护页面清单继续散落在 `switchPage` 中。
- Playwright smoke 已断言 `GrammarAppState` 能生成页面 shell 状态，防止 `guest` / `in-modules` body class 规则继续散落在 `switchPage` 中。
- Playwright smoke 已断言 `GrammarAppState` 能生成页面切换渲染计划，防止首页、错题本、备课资料和管理员页的渲染动作继续散落在 `switchPage` 中。
- Playwright smoke 已断言 `GrammarAppState` 能按下标选择题目、从讲题上下文恢复选中题、按题号查找当前题和清空选中题，防止选中题状态继续散落在大 HTML 中。
- Playwright smoke 已断言 `GrammarAppState` 能更新讲题 tab、切换/强制答案显示并清空讲题 session，防止讲题 session 内部状态继续散落在大 HTML 中。
- Playwright smoke 已断言 `GrammarAppState` 能注册、查回和清空讲题迁移训练临时 registry，防止迁移训练点击回源状态继续散落在大 HTML 中。
- Playwright smoke 已断言 `GrammarAppState` 能规范练习上下文并从 `currentExam.questions` 回推题组，防止 `currentExam/currentQuestions` 入口状态继续散落在大 HTML 中。
- Playwright smoke 已断言 `GrammarAppState` 能规范讲题返回栈、构造基准上下文、清空基准上下文并判断退出讲题时是否恢复原练习上下文，防止讲题返回/恢复状态继续散落在大 HTML 中。
- 继续收敛讲题返回/退出决策：`GrammarAppState` 承接讲题返回 action 计划和退出讲题 teardown 计划；`index.html` 继续只负责恢复上下文、打开教材抽屉、全屏退出、DOM 清理和渲染。
- 继续收敛课堂切换条导航计划：`GrammarClassroomSwitcherModel` 承接上一套/下一套、套卷选择、题号选择和上一题/下一题的纯跳转计划；`index.html` 继续只负责调用 `startByExam` / `showAnalysisByIdx` 执行真实导航。
- 继续收敛模块页问候规则：`GrammarHomeDashboardModel` 承接模块页时间段问候和带用户名文案；`index.html` 继续只负责读取当前用户显示名并写入 DOM，避免首页/模块页问候规则继续重复散写。
- 继续收敛主页 Dashboard 行动计划：`GrammarHomeDashboardModel` 承接上传 Word、切页和打开教材的执行步骤；`index.html` 继续只负责真实切页、点击上传按钮、切知识库视图和打开教材弹窗。
- 继续收敛考点练习入口计划：`GrammarCategoryRules` 承接按考点筛题和练习上下文构造；`index.html` 继续只负责关闭抽屉、同步状态、切页和渲染。
- 继续收敛练习页内部导航计划：`GrammarPracticeViewModel` 承接按题号打开解析和考点分布条跳到首个同类题的下标计算；`index.html` 继续只负责执行 `showAnalysisByIdx` 的真实讲题副作用。
- 继续收敛知识库搜索跳转规则：`GrammarKnowledgeViewModel` 承接搜索清空、搜索结果跳转、subsection 展开/高亮和全局图谱搜索清空计划；`index.html` 继续只负责输入框、结果容器、DOM 显隐、滚动和高亮定时器副作用。
- 继续收敛教材弹窗打开动作计划：`GrammarKnowledgeViewModel` 承接列表模式滚动、画廊模式开弹窗和 modal 文案选择；`index.html` 继续只负责实际滚动、拼接弹窗 DOM、动画和 Esc 关闭。
- 继续收敛教材 Unit 题单打开与筛选动作计划：`GrammarKnowledgeViewModel` 承接真题/错题来源、默认筛选、筛选切换和 mini modal 重开延迟；`index.html` 继续只负责同步 `GrammarAppState`、关闭/打开弹窗和 DOM 渲染。
- 继续收敛 Unit 题单跳题动作计划：`GrammarKnowledgeViewModel` 承接教材 Unit 题单讲题/投影跳转的来源、上一视图、讲题台参数、返回上下文和延迟执行计划；`index.html` 继续只负责全屏请求、弹窗关闭、真实找题、切页和打开讲题台。
- 继续收敛 Unit 题单抽屉返回动作计划：`GrammarKnowledgeViewModel` 承接返回教材视图、匹配书册、恢复 mini modal 上下文和遮罩延迟字段；`index.html` 继续只负责遮罩 DOM、关抽屉、切页、打开教材弹窗和恢复题单弹窗。
- 继续收敛全局图谱动作计划：`GrammarTeachingViewModel` 承接预设聚焦和节点选中的纯动作计划，包括目标节点、关联节点、focus mode、bounds 和是否居中；`index.html` 继续只负责 SVG 重绘、inspector 渲染、画布适配和居中副作用。
- 继续收敛讲题台全图定位入口：`GrammarTeachingViewModel` 承接从当前讲题进入知识库全局图谱的动作计划，包括目标 page、knowledge view、定位节点、讲题台关闭标记和选中延迟；`index.html` 继续只负责关闭讲题台、切页和执行节点选中副作用。
- 继续收敛折叠交互状态：`GrammarExamGridModel` 承接套卷年份展开/收起的 body 显示和箭头旋转计划，`GrammarKnowledgeViewModel` 承接知识库 subsection 手动折叠计划；`index.html` 继续只负责读取 DOM 当前态并写入 style/class。
- 继续收敛云同步状态：`GrammarSavedMaterialsModel` 承接本地资料上传确认、上传成功、云端读取失败和上传失败文案；`GrammarAppState` 承接同步徽标显示模型与同步 inflight 计数状态；`index.html` 继续只负责真实云端调用、confirm/alert 和 DOM 写入。
- 继续收敛 Word 导入提示规则：`GrammarSavedMaterialsModel` 承接导入模块缺失、Word 模块缺失、内容过短、未识别段落、AI 未登录、AI 未识别题目、原始文本 fallback 和非 docx 文件提示；`docs/shared/word-import.js` 继续只负责文件读取、AI 请求、弹窗触发和 DOM 回填。
- 继续收敛练习入口和投影入口状态：`GrammarQuestionModel` 承接缺失套卷提示，`startByExam` 改用已有 `createExamStateFromId` 生成完整练习上下文；`GrammarAppState` 承接投影入口 guard，`index.html` 继续只负责页面 active 检查、弹窗和真实投影副作用。
- 继续收敛云同步队列状态：`GrammarAppState` 承接错题本/备课资料同步队列的 pending 与 rerunRequested 纯状态机；`index.html` 继续只负责真实云端 upsert/delete/pull、事件记录和同步徽标更新，避免 `_syncErrorPending/_syncPrepPending` 这类散落布尔变量继续扩散。
- 继续收敛云同步队列 key 状态：`GrammarAppState` 承接错题本/备课资料同步队列 key 映射，`index.html` 保留兼容包装但不再直接定义 `errorSyncQueue` / `prepSyncQueue` 选择规则。
- 继续收敛保存资料删除动作：`GrammarSavedMaterialsModel` 承接错题本/备课资料单条与批量删除的统一动作计划、云端删除方法元数据，以及批量云端删除失败汇总和观测 payload；`index.html` 继续只负责 confirm、保存、真实云端删除、console/observability 副作用。
- 继续收敛单条保存资料删除失败处理：`GrammarSavedMaterialsModel` 承接单条云端删除失败的 alert、console、事件名和观测 payload；`index.html` 合并错题本/备课资料单条删除执行器，只负责确认、保存、渲染和真实云端删除。
- 继续收敛保存资料云同步差异：`GrammarSavedMaterialsModel` 承接错题本/备课资料本地 upsert 列表、云端待删除 id、云端方法名和同步失败事件元数据；`index.html` 继续只负责真实 `upsert/pull/delete` 云端调用与错误记录。
- 继续收敛本地资料上传云端动作：`GrammarSavedMaterialsModel` 承接本地错题本/备课资料上传到云端的两类 upsert 计划、回拉方法、成功文案和失败事件元数据；`index.html` 继续只负责真实云端调用、保存和渲染。
- 继续收敛本地资料上传失败处理：`GrammarSavedMaterialsModel` 承接上传失败事件、模块、提示文案和观测 payload；`index.html` 的 catch 分支只负责消费失败计划并弹窗。
- 继续收敛云端首次回拉动作：`GrammarSavedMaterialsModel` 承接登录后错题本/备课资料回拉结果计划和失败计划，生成是否应用云端数据、云端数量、渲染意图、同步状态、失败事件和 alert 文案；`index.html` 继续只负责真实云端拉取、迁移确认、DOM 渲染和错误记录。
- 继续收敛本地资料上传后的回拉动作：`GrammarSavedMaterialsModel` 承接上传后云端回拉结果计划，生成云端数据/fallback 数据选择、保存意图和渲染意图；`index.html` 继续只负责真实 pull、保存和 DOM 渲染。
- 继续收敛错题本/备课资料云同步执行流程：`GrammarSavedMaterialsModel` 承接 upsert、pull、cleanup 和失败事件阶段计划；`index.html` 合并错题本/备课资料同步执行器，只负责真实 Supabase 调用、同步队列和状态徽标。
- 继续收敛页面登录守卫状态：`GrammarAppState` 承接错题本、备课资料和管理员页是否需要登录的纯判断；`index.html` 继续只负责调用 `requireAuth()` 和真实切页。
- 继续收敛页面 shell 状态：`GrammarAppState` 承接页面切换时的 `guest` / `in-modules` body class 和模块问候刷新判断；`index.html` 继续只负责真实 DOM class 写入。
- 继续收敛页面切换渲染计划：`GrammarAppState` 承接首页、错题本、备课资料、管理员页的渲染动作选择，以及模块事件和侧栏刷新开关；`index.html` 继续只负责执行真实渲染、记录事件和刷新侧栏。
- 继续收敛页面入口动作：`GrammarAppState` 承接统一页面切换计划、模块卡入口计划和回主页计划；`index.html` 继续只负责登录弹窗、关闭讲题台、DOM class、真实渲染和 dock 高亮。
- 继续收敛云登录生命周期状态：`GrammarAppState` 承接云用户 key、首次到达用户、`?admin` 入口处理、本地资料上传提示和退出清理状态；`index.html` 与 `auth-ui.js` 继续只负责 DOM、真实云端拉取、confirm/alert 和页面跳转。
- 继续收敛云登录生命周期兼容桥：`GrammarAppState` 新增云生命周期状态规范化和局部 patch 计划，`index.html` 的 `_lastCloudUser` / `_migrationPromptShown` / `_adminParamChecked` / `_loggingOut` 保留兼容但统一经 `getCloudLifecycleSnapshot()` 与 `applyCloudLifecycleState()` 同步。
- 继续收敛退出登录生命周期状态：`GrammarAppState` 承接退出中的 `cloudLoggingOut` 标记，`auth-ui.js` 通过同步桥设置退出状态，避免 `_loggingOut` 裸全局继续扩散。
- 继续收敛云端写入边界：`GrammarAppState` 承接“当前云状态是否允许写入学习数据”的纯判断，错题本/备课资料保存 wrapper 复用该 guard，防止管理员 view-as 场景误触发云端写入。
- 继续收敛保存后云同步动作：`GrammarAppState` 承接错题本/备课资料保存后是否触发云同步、对应队列 key、访客/view-as 阻断原因的动作计划；`index.html` 继续只负责调用真实同步函数。
- Playwright smoke 已覆盖投影进入/退出后 `projectionMode`、`teachingFullscreenRequested` 和抽屉投影尺寸状态同步，防止 fullscreen 请求状态和页面状态脱节。
- Playwright smoke 已断言 `GrammarAppState` 能生成讲题跨页保留状态并判断切页时是否关闭讲题台，防止迁移题/教材题跳转时的临时保留开关继续散写在页面脚本中。
- Playwright smoke 已断言 `GrammarAppState` 能规范教材视图模式，并覆盖教材页从画廊切到列表后状态容器同步。
- Playwright smoke 已断言 `GrammarAppState` 能规范知识库搜索索引，并覆盖知识库搜索后索引缓存同步。
- Playwright smoke 已断言 `GrammarAppState` 能规范教材 unit 题单上下文、更新筛选和清空状态，并覆盖教材 unit 题单打开后状态容器同步。
- 继续收敛教材/Unit 题单兼容桥：`index.html` 新增教材视图模式和 unit 题单上下文快照入口，渲染、modal 打开、筛选切换和跳题计划统一从快照读取；旧 `_textbookViewMode` / `_unitMiniContext` 只作为兼容桥保留。
- 修复 Unit 题单筛选重开时序：`GrammarKnowledgeViewModel.buildUnitQuestionFilterChangePlan` 的默认重开延迟调整到关闭动画之后，`index.html` 增加可取消的重开 timer，并在关闭时清理残留 modal，避免筛选切换后出现重复 `unitQuestionsModalWrap`。
- 继续收敛错题本/备课资料批量模式兼容桥：`index.html` 新增保存资料批量模式快照入口，切换、列表渲染和 `syncAppState()` 统一从快照读取；旧 `_errorBulkMode` / `_prepBulkMode` 只保留为兼容桥。
- 继续收敛迁移训练来源兼容桥：`index.html` 新增迁移来源快照/应用入口，讲题台、抽屉迁移训练渲染、事件记录和 `syncAppState()` 统一从 `GrammarAppState` 规范化状态读取；旧 `_migrationSource` 只保留为 localStorage 兼容缓存。
- 继续收敛抽屉返回兼容桥：`index.html` 新增抽屉返回快照/应用入口，dock 返回标签/动作、投影退出回跳、`executeDrawerReturn()` 和 `syncAppState()` 统一从 `GrammarAppState` 的 `drawerReturnTo` 状态读取；旧 `_drawerReturnTo` 只作为兼容缓存保留。
- 继续收敛知识库搜索索引兼容桥：`index.html` 新增搜索索引快照/应用入口，搜索索引构建、搜索面板查询和 `syncAppState()` 统一从 `GrammarAppState.knowledgeSearchIndex` 的规范化数组读取；旧 `knowledgeSearchIndex` 只作为页面缓存保留。
- 继续收敛全局图谱状态兼容桥：`index.html` 新增全局图谱状态快照入口，图谱渲染、聚焦、缩放、平移、居中和 `syncAppState()` 统一从 `GrammarAppState.globalGraphState` 的规范化状态读取；旧 `globalGraphState` 只作为页面缓存保留。
- 继续收敛页面导航状态兼容桥：`index.html` 新增页面导航快照入口，`syncAppState()`、页面侧边栏和 dock 返回动作统一从规范化的 active page、active dock 和 home view 状态读取；旧 `_activePage/_activeDock/_currentHomeView` 只作为兼容缓存保留。
- 继续收敛知识库视图状态兼容桥：`index.html` 新增知识库视图快照入口，`syncAppState()`、dock 返回、知识库 chrome 和全局图谱 system-node 判断统一从规范化的 knowledge view/key/node 状态读取；旧 `currentKnowledgeView/currentKnowledgeKey/currentKnowledgeNodeId/currentIsPattern` 只作为兼容缓存保留。
- 继续收敛上一视图返回状态兼容桥：`index.html` 新增 previous view 快照入口，`syncAppState()`、dock 返回、`goBack()` 和讲题上下文捕获统一从规范化 previousView 读取；旧 `previousView` 只作为兼容缓存保留。
- 继续收敛练习显示/字号状态兼容桥：`GrammarAppState` 新增练习显示和字号快照构造，`index.html` 的 `syncAppState()`、课堂切换条、练习页渲染、讲题上下文捕获和答案按钮文案统一从规范化快照读取；旧 `showAnswers` / `showChinese` / `passageFontSize` / `drawerFontSize` 只作为兼容缓存保留。
- 继续收敛选中题/讲题 session 兼容桥：`GrammarAppState` 新增选中题快照和讲题 session 快照构造，`index.html` 的 `syncAppState()`、当前题号、页面切换、抽屉 tab、迁移来源、讲题台渲染、讲题 dock、键盘导航和投影退出统一从规范化快照读取；旧 `selectedQuestion` / `teachingSession` 只作为兼容缓存保留。
- 继续收敛讲题返回栈/基准上下文/跨页保留兼容桥：`GrammarAppState` 新增讲题返回栈、基准上下文和跨页保留快照构造，`index.html` 的 `syncAppState()`、页面切换、讲题 dock、迁移题返回、教材 Unit 跳题返回和讲题台 teardown 统一从规范化快照读取；旧 `teachingReturnStack` / `teachingBaseContext` / `_keepTeachingOnPageSwitch` 只作为兼容缓存保留。
- 继续收敛练习上下文兼容桥：`GrammarAppState` 新增练习上下文快照构造，`index.html` 的 `syncAppState()`、选中题快照、课堂切换条、侧栏、练习页渲染、翻译文本、讲题台打开/渲染/跳题、投影进入和教材 Unit 跳题统一从规范化 `currentExam/currentQuestions` 快照读取；旧 `currentExam` / `currentQuestions` 只作为兼容缓存保留。
- Playwright smoke 已覆盖保存资料云同步队列页面桥：同一类资料连续请求同步时会合并为 rerun，完成后清空 pending/rerunRequested，并同步回 `GrammarAppState.errorSyncQueue`。
- Playwright smoke 已断言 `GrammarAppState` 能规范练习显示和字号快照，并覆盖答案切换与原文字号调整后页面快照桥和状态容器保持一致。
- Playwright smoke 已断言 `GrammarAppState` 能规范选中题和讲题 session 快照，并覆盖讲题台打开/切迁移 tab 后页面快照桥和状态容器保持一致。
- Playwright smoke 已断言 `GrammarAppState` 能规范讲题返回栈、基准上下文和跨页保留快照，并覆盖讲题台打开后页面快照桥和状态容器保持一致。
- Playwright smoke 已断言 `GrammarAppState` 能规范练习上下文快照，并覆盖套卷进入练习页后页面快照桥和状态容器保持一致。
- Playwright smoke 已断言 `GrammarAppState` 能规范全局图谱状态、生成平移/缩放/适配/居中/聚焦状态，并覆盖全局图谱打开和缩放后状态容器同步。
- Playwright smoke 已断言 `GrammarAppState` 能生成退出登录状态并在清理云登录生命周期时复位，防止退出流程状态继续散落在页面脚本中。
- Playwright smoke 已断言 `GrammarAppState` 能规范云生命周期状态并合并局部 patch，防止云登录、管理员入口、本地资料上传提示和退出标记继续散落成多套裸变量规则。
- Playwright smoke 已覆盖知识库基础交互：进入知识库、切换教材视图/考点视图/书本速查、执行搜索后再回到套卷练习。
- Playwright smoke 已覆盖非隐私使用事件写入：讲题 tab、迁移训练查看、迁移来源切换、投影模式进入/退出。
- Playwright smoke 已覆盖普通用户不能查看管理员列表、管理员可查看并更新反馈状态、管理员 view-as 可读，以及 view-as 状态下不写入被查看用户数据。
- Playwright smoke 已覆盖反馈提交会写入分类、复现情况、影响人数、来源和递归脱敏错误上下文。
- Playwright smoke 已覆盖账户设置：导出学习数据不含 password/token/key，清空学习数据会调用 `error_book` / `lesson_prep` 云端删除，账号删除申请会写入 `feedback_reports`。
- Playwright smoke 已覆盖错题本单条删除会调用云端 `error_book` 删除，备课资料单条删除会调用云端 `lesson_prep` 删除。
- Playwright smoke 已断言 `GrammarSavedMaterialsModel` 能生成保存资料删除动作计划、云端删除方法元数据、批量云端删除失败汇总和观测 payload，防止删除分支规则继续回流到大 HTML。
- Playwright smoke 已断言 `GrammarSavedMaterialsModel` 能生成单条云端删除失败 alert、事件名和观测 payload，防止错题本/备课资料单条删除失败处理继续重复散写。
- Playwright smoke 已断言 `GrammarSavedMaterialsModel` 能生成保存资料云同步差异计划、云端方法名和同步失败事件元数据，防止同步分支规则继续回流到大 HTML。
- Playwright smoke 已断言 `GrammarSavedMaterialsModel` 能生成保存资料云同步执行阶段计划、cleanup 阶段计划和失败事件 payload，防止 `syncErrorBookToCloud` / `syncPrepToCloud` 继续维护两套重复流程。
- Playwright smoke 已断言 `GrammarSavedMaterialsModel` 能生成本地资料上传云端计划、回拉方法、成功文案和失败事件元数据，防止 `uploadLocalToCloud` 继续散写错题/备课两套分支。
- Playwright smoke 已断言 `GrammarSavedMaterialsModel` 能生成本地资料上传失败计划，包括事件名、模块、alert 文案和观测 payload，防止 `uploadLocalToCloud` 的 catch 分支继续拼元数据。
- Playwright smoke 已断言 `GrammarSavedMaterialsModel` 能生成云端首次回拉结果/失败计划，防止 `onCloudStateChange` 继续手写回拉应用、渲染和失败事件分支。
- Playwright smoke 已断言 `GrammarSavedMaterialsModel` 能生成本地资料上传后的云端回拉结果计划，防止 `uploadLocalToCloud` 继续手写 pull fallback、保存和渲染分支。
- Playwright smoke 已覆盖 Word 上传 AI 解析成功后进入统一导入面板、确认导入备课资料，并记录 `ai_parse_chunk_success` / `ai_parse_completed` 成功事件。
- Playwright smoke 默认端口从 `8797` 调整为 `8931`，继续支持 `SEEKLUME_SMOKE_PORT` 覆盖；`scripts/check_browser_smoke.sh` 现在会自行启动本地静态服务器、等待 `/docs/` 可访问、通过 `SEEKLUME_BASE_URL` 交给 Playwright，并在退出时清理服务器，避免 Playwright 内置 webServer 等待偶发超时。
- 收尾验证：讲题返回/退出决策、课堂切换条导航、模块页问候、主页行动计划、考点练习入口、练习页内部导航、知识库搜索跳转、折叠交互状态规则、云生命周期兼容桥、教材/Unit 题单兼容桥、保存资料批量模式兼容桥、练习显示/字号、选中题/讲题 session、讲题返回栈/基准上下文/跨页保留和练习上下文快照桥收敛后，`python3 scripts/check_grammar_modules.py`、`git diff --check`、`npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path"` 与 `npm run check` 均已通过。
- 本地静态服务器打开 `http://localhost:8787/docs/grammar-fill/`，页面正常加载。
- 浏览器验证反馈按钮唯一，反馈弹窗可打开/关闭，控制台无错误。

### 风险与下一步

- 本地基础工程收尾已到可交接状态：纯模块拆分、状态快照桥、契约脚本、smoke 覆盖和 `npm run check` 均已同步；当前工作区尚未 commit/push。
- `docs/grammar-fill/modules/word-import-model.js` 是本轮新增纯模块，当前仍显示为未跟踪文件；后续如做 checkpoint commit，需要随其它改动一起纳入。
- `feedback_reports` / `app_events` 需要在生产 Supabase 执行 migration 后才会真正落库；执行前不影响主功能，执行生产 migration 仍需用户明确授权。
- `app-state.js` 仍保留兼容桥和旧全局缓存，这是渐进收敛的过渡状态，不是本地门禁阻塞；下一轮如继续工程化，可再拆剩余 DOM/浏览器副作用状态。
- Playwright 当前仍是 smoke 级别；已覆盖模拟 Supabase 登录/退出、错题本/备课资料/投影、本地跨账号隔离、管理员只读边界，以及 Word 上传的模拟 AI 成功导入和 AI 解析失败降级路径，但还没覆盖真实 Supabase 账号、真实 Word 样本成功率、真实 AI/Edge Function 运行路径和真实管理员后端。

*此日志随项目推进持续更新。最后更新：2026-05-29*
