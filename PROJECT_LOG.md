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
- Playwright smoke 已断言 `GrammarHomeDashboardModel` 能生成首页题库/错题/备课统计文案、新/活跃用户状态、hero 文案、教材封面画廊的装饰状态、行动入口副文案和 action 元数据，防止主页 Dashboard 规则从 HTML 迁出后静默失效。
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
- 发布状态：`codex/engineering-hardening` 已 fast-forward 合并到 `main`，并推送到 `origin/main`；当前线上发布源能拿到提交 `2f93b98 Refactor grammar fill state modules`。
- 同步顶层文档：重写 `README.md` 为当前 GitHub 入口说明，修正 `PROJECT_CHARTER.md` 的题库数量、当前工程焦点、验证边界和 agent 入口，并在 `CLAUDE.md` 顶部标注工程协作以 `AGENTS.md`、`PROJECT_LOG.md`、`docs/planning/*.md` 为准。

### 风险与下一步

- 基础工程收尾已合并到 `main`：纯模块拆分、状态快照桥、契约脚本、smoke 覆盖和 `npm run check` 均已同步；新 agent 可从 `AGENTS.md`、`PROJECT_LOG.md` 和 `docs/planning/*.md` 接手。
- `feedback_reports` / `app_events` 需要在生产 Supabase 执行 migration 后才会真正落库；执行前不影响主功能，执行生产 migration 仍需用户明确授权。
- `app-state.js` 仍保留兼容桥和旧全局缓存，这是渐进收敛的过渡状态，不是本地门禁阻塞；下一轮如继续工程化，可再拆剩余 DOM/浏览器副作用状态。
- Playwright 当前仍是 smoke 级别；已覆盖模拟 Supabase 登录/退出、错题本/备课资料/投影、本地跨账号隔离、管理员只读边界，以及 Word 上传的模拟 AI 成功导入和 AI 解析失败降级路径，但还没覆盖真实 Supabase 账号、真实 Word 样本成功率、真实 AI/Edge Function 运行路径和真实管理员后端。

## 2026-05-29 · 教研会前 Sprint（线 A：整卷上传硬化）

> 起因：教研会下周二，现场要演示"上传整套卷 Word → AI 解析语法填空"。核实发现整卷上传是当前最脆弱路径。

### 产出（线 A · 整卷精确抽取语法填空节）

- 根因：`docs/grammar-fill/modules/word-import-model.js` 的 `buildDocxBatchPlan` 对单份整卷找不到 `isPassageTitle` 标题，落到段落启发式 `splitByParagraph`，把整卷（阅读+完形+写作范文+详解）碎切成十几个 chunk 逐个送 AI → 慢（串行、每 chunk 90s 超时）、乱、且可能把完形填空误当语法填空。
- 新增纯函数 `isolateGrammarSections(text)`：用全国卷高度统一的语法填空指令行锚点 `在空白处填[入写]…单词` 定位该节，向后取到下一主区块（第四部分/写作/读后续写/下一篇语法填空）；完形（"从 A/B/C/D 选出"）天然被排除。命中即在 `buildDocxBatchPlan` 顶部只产出该节（单篇/合集），未命中回退原 `splitByTitle`/`splitByParagraph`，向后兼容。
- 解析版【答案】优先：`mergeAnswersIntoPassage` 改为"原文自带答案权威，优先于 AI 自解；无官方答案才保留 AI 答案"（无答案卷如福州仍由 AI 自解）。
- 导出 `isolateGrammarSections`；`scripts/check_grammar_modules.py` 加契约；`tests/smoke.spec.js` 加整卷 fixture 断言（完形+语法+写作合一 → 只出 1 个语法填空 chunk、排除完形、官方答案透传）。

### 验证

- 离线实测用户提供的 4 份真卷（福州无解析 19k / 宁波·枣庄·精诚解析版 33–37k）：每份均从整卷精确抽出 1 个语法填空 chunk（约 1.5k 字符），含 56–65，排除完形/阅读/写作；解析版 10 个官方答案全部正确提取，福州无答案卷交 AI 自解。
- `python3 scripts/check_grammar_modules.py` 通过（17 模块契约，含 isolateGrammarSections）。
- `npx playwright test tests/smoke.spec.js --project=chromium`：9 条 smoke 全过，含 grammar-fill core path 的整卷隔离断言。
- `npm run check` 全绿（题库/模块/密钥/migration/Edge 合同/静态站/smoke）。
- 线 A-3 实测（测试账号 + 已部署 `deepseek-parse`）：4 份卷各 1 次调用、9–11s、均 HTTP 200，返回 1 篇 / 10 空 / 含 `___N___` 标记。3 份解析版 AI 自解答案与官方【答案】**100% 一致（30/30）**；福州无答案卷 AI 自解 10 空语法合理。自动标题干净（如"24节气与农业"）。附带发现个别 category/fine_category 配对不一致（如枣庄 61 category=nonpredicate 但 fine=word-ed-ing）→ 归入线 C 校对。

### 下一步

- ✅ 线 A-3 已完成（见上"验证"）。线 A 全链路（隔离 + 真实 AI + 官方答案优先）验证通过。
- 线 B：解析"可切换双视图"（考点式 + 做题思路），含 bank `solve` 字段 + 批量生成 + prompt + UI 切换。改 Edge Function 需用户授权重部署。
- ✅ 线 C 已完成（见下）。线 D：演示卷/题/脚本/录屏 + 课前预导入保底。
- 注：本轮改动尚未提交；按 AGENTS.md，commit/push 与生产部署需用户授权。

### 线 C · 全量 190 题知识性校对 + 修复

- 逐题核对 190 题（19 卷）answer/explanation/category/fine_category/grammar_point + fine tag 抽样。**答案全部正确**（抽查 ~15 道较难真题/模拟标准答案无误）；所有问题在标签字段，源于早期批量打 tag。清单见 `docs/planning/bank-correctness-audit.md`。
- 已修 18 处（用户确认 Finding 1+2+3 后批量改 `docs/data/grammar_bank.js`）：
  - Finding 1（14 题）：名词复数（interview→interviews 等）category 由 word 改为 number；其中 events 额外把 fine 由 word-adj-adv-other 改为 num-plural。
  - Finding 2（1 题）：people's 由 pronoun/pron-personal-possessive 改为 number/num-possessive（名词所有格）。
  - Finding 3（3 题）：visibility/recovery/criticism 的 fine 改为 word-noun-derivation；visibility 的 grammar_point 由"形容词"改为"名词"。
- 同步对齐 number 类显示名为"名词/数词"（与 `grammar_fine_tags.js` 规范一致，该类含名词复数/所有格/可数性 + 数词）：改 `grammar_bank.js` category_names + `category-rules.js` 的 DEFAULT_CATEGORY_NAMES / CATEGORY_TIPS / 首页按考点入口卡片。修复前该类 0 题（名词题全被误归 word），现含 15 题。讲题台徽标本就优先 fine 名称（num-plural→"名词复数形式"），显示正确。
- Finding 4（个别 fine 精度、tag 与解析口径、grammar_point 留空）留待会后。
- 验证：`check_grammar_bank.py`（19/190）+ `check_grammar_modules.py`（17 模块）+ `npm run check`（9/9 smoke）全绿；git diff 仅 18 题字段 + number 标签。
- 补充修复（另一会话发现并修复）：`docs/data/grammar_bank.js` 把数据存成 `exams[]` 与扁平 `questions[]` 两份拷贝；上述 18 处只改了 `exams`，而 `buildAllQuestions`（按考点练习/统计）读的是扁平拷贝 → 修复会漏一半。已从修正后的 `exams` 重建扁平 `questions[]`（镜像全部字段含 `nonp_*`，0 字段丢失、desync 0），并在 `check_grammar_bank.py` 新增 `check_flat_questions_mirror` 门禁防再发生（已单元测试：好数据过、坏数据报错）。`npm run check` 全绿。
- 新增新用户手册：`docs/help/new-user-manual.md`，面向首次试用老师，覆盖打开网站、注册登录、10 分钟上手路线、Word 上传、AI 解析、备课资料、错题本、课堂投影、知识库、反馈、账号数据和常见问题；对应 `PROJECT_CHARTER.md` 中“老师不需要找你才能学会用（有手册）”的 v1 补强项。
- 下线练习页 header 的手动投影按钮：当前点击空格/题号打开讲题台会自动请求全屏，旧投影按钮与主流程重复，容易让新老师困惑；保留底层 `projection-mode` / fullscreen 状态逻辑供讲题台自动全屏、退出和尺寸状态复用。同步更新 Playwright smoke，从点击 `#btnProjection` 改为断言按钮不存在，并验证点击空格后自动进入讲题台与全屏状态。
- 重写新用户手册为“试用老师快速上手”短版，并新增 Word 版 `docs/help/Seeklume试用老师快速上手手册.docx`，用于提前发给 1-2 位老师做小范围真实试用；手册从完整说明改为 15 分钟试用路线 + 具体反馈页，降低首次试用门槛。

## 2026-05-30 · 讲题台渲染抽离 batch 3

- `renderTeachingStage` 讲题台外壳、`renderTeachingDock` 的 dock 纯 HTML 装配抽入 `docs/grammar-fill/modules/teaching-render.js`（新增 `teachingStageHtml(model, parts)` / `teachingDockHtml(model)`，导出 9→11）；`index.html` 两函数改为 inline 副作用编排 + 调模块，埋点/快照/DOM 写入原位保留。
- 删除零调用死代码 `renderMigrationEmptyHint`（batch 1/2 把 empty-hint 搬进模块内部 helper 后的残留）。
- `scripts/check_grammar_modules.py` 加 2 个 `GrammarTeachingRender` export 契约；`tests/smoke.spec.js` 加 4 条 render 断言（讲题台外壳含内容、空内容不出 content-panel、dock 含按钮、dock 不可见返回空串）。
- 验证：`python3 scripts/check_grammar_modules.py`（18 模块）+ `npm run check`（全绿，含 grammar-fill core path 真实渲染讲题台/dock）。主文件再瘦约 40-50 行。

## 2026-05-31 · 首页教材封面降级为装饰

- 教材视图功能已暂停，首页 Dashboard 的教材封面区从“教材速览入口”改为“教材覆盖范围”装饰区：保留 7 本教材封面，右侧显示“教材映射重做中”状态标签，并补充当前仅作封面展示的说明。
- 首页教材封面和右侧状态不再生成点击入口，封面下方册名条也移除，仅保留封面图，避免老师误以为教材视图仍可用；原知识库入口仍保留在首页行动按钮中，继续指向可用的知识库页面。
- 同步更新 Playwright smoke：断言首页教材封面模型不再带 `open-textbook` action，渲染输出只保留封面和状态标签，不再输出“展开全部/更多”类入口。

*此日志随项目推进持续更新。最后更新：2026-05-31*

## 2026-06-01 决策地图叶子下钻 Task F 查证结论

真题/模拟/错题筛选一致性：**预期行为，非 bug**。
- 3 处 isMockQuestion（knowledge-view-model / migration-training / saved-materials-model）均认全「模拟卷」+「模拟题」双写法，模拟计数无遗漏。
- buildUnitFilterChips 在 source !== bank 时返回空 → 错题本不出真/模筛选片，是设计预期（错题本不区分真题/模拟）。
无需改代码。

## 2026-06-14 · 考点画像板块可视化升级 + 学生画像搜索驱动（用户反馈）

起因：组长反馈两点——①画像板块里"选套卷"后，结果被夹在中间的一大段"考点趋势"挡住，看不见变化；②学生那么多/考试那么多，不该全平铺，要可选择 + 个人画像也要可视化。设计原则收敛为「选择器驱动 + 结果紧跟 + 渐进披露，不全平铺」（过 `frontend-design`：减法、一个焦点、按需展开）。

- **考点画像板块重排**（`error-profile-controller.js renderBoardPage`）：顺序改为 班级chips → 选套卷chips → **选中套卷画像（紧跟，立即可见）** → 全考点跨卷趋势（折叠沉底，默认收起）→ "查看单个学生的画像"入口。原来夹在 chips 与画像之间的整段趋势不再挡路。
- **跨卷趋势融进考点排行**（`error-profile-render.js`）：`catRankingHtml(catRanking, trendByCat?)` 每行内嵌迷你趋势线（`miniSparkSvg`）+ 升降箭头（`deltaHtml`）；`profilePageHtml(vm, trendByCat?)` 透传（不传则与原样一致，向后兼容）。全考点完整趋势降级为 `catTrendDetailsHtml`（`<details>` 折叠）。
- **学生板块改搜索驱动 + 可视化个人画像**（`renderTimelinePage` 重写末段 + 新 `wireStudentSearch`）：搜索框（姓名/学号即时筛）→ 命中列表（`studentMatchListHtml`，空查询默认列"最需要关注的几个"）→ 选中渲染 `studentProfileHtml`：正确率折线图（`rateTrendBlock`，红黄绿点 + 数值 + 60分线 + 首尾卷名）+ 弱项考点条形 + 各卷明细。不再把全班平铺成卡片墙。
- **新增纯函数**：view 加 `buildStudentProfileVM`；render 加 `miniSparkSvg`/`deltaHtml`/`rateTrendBlock`/`catTrendDetailsHtml`/`studentSearchBoxHtml`/`studentMatchListHtml`/`studentProfileHtml`。隐私红线不变（姓名仍只在本机解析，云端只存学号）。
- 契约同步：`scripts/check_grammar_modules.py` 登记 `GrammarErrorProfileView`(+buildCatTrends,+buildStudentProfileVM) 与 `GrammarErrorProfileRender`(+4 个新导出)。`studentTimelineHtml`（旧扁平卡片）保留导出 + 单测，暂作兼容/回退，不再被控制器调用。
- 在哪试：登录 →「考点画像」选套卷即见画像 + 行内趋势，底部可展开全考点趋势；「学生时间线」搜姓名/学号选一个学生看折线画像。
- 验证：`node --test`（64/64，新增 11 条）+ `python3 scripts/check_grammar_modules.py`（27 模块）全绿；本地预览注入模拟数据截图核对三块可视化与折线图标签防重叠（含高分起点压力用例），无 console error。`npm run check` 全量门禁 35/35 全绿。
- 已 commit + push 到 origin/main（用户授权）：84b83c0。

## 2026-06-14 · 班级管理：导入页加「删除班级」+「加班后导入名单」（用户反馈）

用户准备整理项目（功能混杂、页面混乱），顺手要两个班级管理功能。落点统一在「导入成绩」页的班级栏（`importClassBarHtml`），做成班级管理小中枢：选/建班 → 导入名单 → 删除该班。

- **删除班级**（完整语义，强确认兜底）：`importClassBarHtml` 加「🗑 删除该班」（选班后启用）。删除 = 移除本地班级+名单（`GrammarErrorProfileStore.removeClass`）+ 删云端该班全部成绩（复用 cloud.js 已有的 `deleteExamResults(classId)`，**无后端改动**）。confirm 明确告知"云端成绩不可恢复"；先删云成功再删本地，云端失败则不动本地并提示。注：必须连云端一起删，否则板块/时间线会从 exam_results 把该班重新拼出来。
- **加班后导入名单**：`importClassBarHtml` 加「导入名单」（选班后启用）+ 隐藏 .xls 输入；解析 学号+姓名 Excel → `mergeStudentNames`（仅本机）+ `mergeClassRoster`（学号清单）。新建班级后自动选中该班，方便接着导名单（即"加入班级后导入名单"流）。选班后 meta 行显示本地名单人数 + 隐私说明。
- 控制器（`renderImportPage`）新增 `updateImportClassButtons`/`impImportRoster`/`impDeleteClass` + `_impSelClass`（重渲染保持选中）；app.js 导入页依赖加 `deleteClass`/`deleteExamResultsClass`/`importRoster`/`classRoster`。
- 隐私红线不变：姓名只存本机（grammar-student-names，owner 隔离），云端永不存姓名。
- 在哪试：登录 →「导入成绩」→ 选班/新建 →「导入名单」传 学号+姓名 Excel；或「删除该班」（会二次确认并清云端成绩）。
- 验证：render 单测（importClassBarHtml 含新按钮、默认禁用）；smoke「班级管理」（新建→按钮启用→删除走云端 deleteExamResults + 本地移除）；`npm run check` 全量 36/36 全绿。
- 已 commit + push origin/main：f6b54d8。

## 2026-06-14 · 班级管理移出导入页 → 独立「学生管理」入口（IA 收敛，用户反馈）

用户反馈：班级的新建/删除不该塞在「导入成绩」里，应是一个独立的「学生管理」板块（"按用途聚合"，对齐 [[seeklume-ia-reorg-pending]] 的整理方向）。选了"三合一·升级现有页"。

- **导入成绩页回退为只「选班」**：`importClassBarHtml` 去掉 新建/导名单/删除/meta/file，只剩班级下拉 + 一行"新建/删除班级、导入名单都在「学生管理」里"。无班级时提示去学生管理建班。控制器 `renderImportPage` 去掉相关 wiring（删 `updateImportClassButtons`/`impImportRoster`/`impDeleteClass`），app.js 导入页依赖去掉 createClass/deleteClass/deleteExamResultsClass/importRoster/classRoster。
- **「学生时间线」升级为「学生管理」+ 独立 dock 入口（👥）**：它本就有班级 chips + 导名单 + 学生画像；这次补齐——① 接上之前漏接的 `.ep-class-new`（新建班级，时间线页原来点了没反应）；② 选中班下方加「🗑 删除该班」（`tlDeleteClass`：confirm → 云端 `deleteExamResults(classId)` 成功后删本地，失败不动本地）；③ 加 `_tlClasses` 存当前班列表供删班取名。index.html 加 dock 项 + 页标题改「学生管理」；app-state.js 的 `normalizeDockKey`/`getDockKeyForPage` 收录 student-timeline（不再高亮成考点画像，改高亮自己）。app.js 学生页依赖加 createClass/deleteClass/deleteExamResultsClass。
- 净结果：班级 CRUD + 名单 + 学生画像集中在「学生管理」；「考点画像」仍可点"查看单个学生画像"跳过去。隐私不变。
- 在哪试：dock「学生管理」→ 新建/删除班级、导名单、搜学生看画像；「导入成绩」只选班。
- 验证：单测 66/66（importClassBarHtml 改为断言只选班/无 CRUD）；smoke「班级管理(学生管理页)」改测学生页新建→删除走云端 + 导入页无 CRUD；`npm run check` 全量 36/36 全绿。

## 2026-06-14 · 班级管理补全：班级改名 + 添加学生 + 删除单个学生（用户反馈）

用户要在「学生管理」页把班级管理做全：导入名单后还能手动增删学生、给班级改名（"演示班级"造数据由用户自己导入名单，本次只做功能）。落点仍在「学生管理」页（`renderTimelinePage`），延续"选择器/搜索驱动、不平铺"（对齐 [[ui-selector-driven-no-flat-walls]]）。

- **班级改名**：管理行加「✎ 班级改名」（`stRenameClass`）→ prompt 预填当前名 → 本地改名 + 云端该班 `class_name` 一并改。修了一个隐患：`GrammarErrorProfileStore.renameClass` 旧实现把班级重建成 `{id,name}`，会**抹掉 `students` 名单**；改为 `Object.assign({}, c, {name})` 保留其它字段（加单测）。云端合并里有成绩的班名以 `class_name` 为准，故必须同步云端才看得到新名 → 新增 cloud.js `renameExamResultsClass(classId, newName)`（`update class_name`，复用 RLS，**无迁移**）。
- **添加学生**（手动/插班）：管理行下加折叠框（默认收起，不占主视图）`studentAddBoxHtml` —— 多行文本，每行「学号 姓名」或只写姓名。新纯函数 `GrammarStudentTracking.parseRosterText(text)`（≥4 位数字开头识别为学号，支持 空格/逗号/Tab 分隔，跳空行）。app.js `addStudents` 依赖：缺学号则补"本地合成键"（`m`+时间戳，永不上云、避免与真实学号撞键），`mergeStudentNames`（仅本机）+ 新纯函数 `GrammarErrorProfileStore.addStudentsToClass`（去重保序）。
- **删除单个学生**：搜索结果每行加「删」按钮（`st-del`，搜索驱动删除，不另铺名单墙；`studentMatchListHtml` 行结构由单 button 改为 `st-row` 容器内 `st-pick`+`st-del`，`.st-pick[data-no]` 不变）。app.js `removeStudent` 依赖：`GrammarErrorProfileStore.removeStudentFromClass` 移除本地名单 → 该学号无任何班再引用时连本机姓名也清掉 → 删云端该班该生成绩（新增 cloud.js `deleteExamResultsStudent(classId, studentNo)`，复用 RLS，**无迁移**）。强 confirm 兜底。
- 隐私红线不变：姓名只存本机（owner 隔离），云端只存学号；新增云端函数只动 `class_name`/按 `student_no` 删行，不写姓名。
- 在哪试：dock「学生管理」→ 选班 → 「✎ 班级改名」；展开「＋ 添加学生」粘贴名单（一行一个）；搜到某生点行尾「删」。导入页不受影响。
- 验证：`node --test` 单测全绿（store +4：rename 保名单 / add 去重保序 / add 空班建起 / remove；student-tracking +3：parseRosterText 三组）；`python3 scripts/check_grammar_modules.py`（27 模块，登记 +parseRosterText/+studentAddBoxHtml/+renameClass/+addStudentsToClass/+removeStudentFromClass）；新增 smoke「班级管理…改名+添加+删除」用可变云端 stub 跑通三动作并校验云端被调用；**`npm run check` 全量门禁 37/37 全绿**。
- 未跑：`renameExamResultsClass`/`deleteExamResultsStudent` 的真实 Supabase 执行（需真账号环境，按 AGENTS.md 留待真环境/用户授权）；二者是已有 delete/update 模式的 3 行镜像。
- 待办：未 commit/push（等用户授权）。已于本日 commit b91336c 并经用户授权 push 到 main 上线。

## 2026-06-14 · 考点画像 + 学生管理 合并为「班级工作台」（修数据不同步 + 去功能重复，用户反馈）

用户反馈「考点画像 与 学生管理 两页数据不同步、且功能重复」。经 brainstorming → writing-plans（spec/plan 见 `docs/planning/2026-06-14-班级工作台-{design,plan}.md`）。

- **根因（已核实）**：两页是同一份云端 `exam_results` 的两种切法（按考点 / 按学生），却各自挂班级管理。**人数口径不一致**——考点画像只数「云端有成绩的学生」，学生管理数「成绩 ∪ 本地名单」；纯名单班（如演示班级 40 人无成绩）→ 考点画像显 0、学生管理显 40。
- **合并为一页「班级工作台」**（宿主复用 `student-timeline`，分段切换）：顶部统一「选班 + 班级管理（改名/导名单/加/删）」；下面 `workbenchTabsHtml` 切「考点视角 / 学生视角」，默认考点视角。控制器 `renderTimelinePage`/`renderBoardPage` 合为 `renderWorkbenchPage`：一次 `fetchExamResults` 两视角共用，body 拆 `renderBoardBody`/`renderTimelineBody`（无自取数据、无班级 chips）。
- **同步修复（核心）**：新增纯函数 `GrammarErrorProfileStore.buildClassList(allRows, localClasses)`（名单 ∪ 成绩，人数口径唯一），工作台两视角共用 → 同班人数恒一致（单测 + smoke 各一条兜住 0→40）。
- **导航收敛**：dock 两个入口（考点画像 📊 / 学生管理 👥）收成一个「班级工作台」👥；`switchPage('error-profile')` 入口重定向到工作台（考点视角），原「查看单个学生画像」按钮改为同页切学生视角；`app-state` 的 `normalizeDockKey`/`getDockKeyForPage` 把 `error-profile` 归一到 `student-timeline`；index 删 `page-error-profile` 容器、改页标题、导入页文案指向「班级工作台」。
- **导入成绩页保持独立**（数据入口，不在本次范围）。隐私红线不变。
- 在哪试：dock「班级工作台」→ 选班 → 默认看考点视角（选套卷出排行/趋势），切「学生视角」搜学生看个人画像/管名单；旧「考点画像」链接自动落到工作台。
- 验证：`node --test`（store +1 `buildClassList`）；`check_grammar_modules.py`（27 模块，+`buildClassList`/+`workbenchTabsHtml`）；smoke 改造为 5 条「班级工作台」用例（考点视角默认出画像 + 旧入口重定向 / 学生视角搜+画像 / 新建删班 / 改名加删生 / 两视角人数一致）；**`npm run check` 全量门禁 38/38 全绿**。
- 待办：未 commit/push（等用户授权）。

## 2026-08-29 · 新增「礼堂排座」工具：按班级人数自动排礼堂座位（年级会议用，用户需求）

用户是年级主任，常在礼堂开年级会议：每次班级数量、每班人数都不同，有时第一排留领导席，有时要在前排颁奖席区留座。需要一个可复用的排座工具，落在网站首页新卡片。经 brainstorming → 设计文档（`docs/superpowers/specs/2026-08-29-hall-seating-design.md`）。纯静态模块，零后端、零框架，对齐现有技术方向。

- **礼堂底图数据**：从礼堂座位平面图 PDF 的矢量矩形提取每排座位坐标（`extract_rows.py` → `hall_data.json`，按 y 聚簇成排、x 分段成区），人工核对排号/区号后固化进 `docs/hall-seating/hall-seating.js`。核定容量：**两层 34 排 1179 座**（一层 27 排 933 座，9/10 排间横向走道；二层 7 排 246 座，逐排收窄）。
- **排座算法**：按班级顺序从前排往后排满；某班超过本排剩余时，比较「本排续排+溢出」与「整班跳下排」两种方案的碎片数，取碎片少者，尽量保证**班级连座**；可切换后往前方向、紧凑压排、第一排整排留领导席、前排右侧按人数预留**颁奖席**。
- **三个视图**：彩色 SVG 平面图（每班一色 + 班名图例，未用座虚线淡显）、汇总表（每班排数/座位区间/是否跨排）、班级指引单（每班一卡，写明第几排第几座到第几座，供发到班主任）。
- **导出与留存**：SheetJS（jsdelivr CDN）本地生成 Excel——汇总、预留席位、逐人明细（填了姓名才有）三个 sheet；当前配置 + 历史方案存 localStorage，下次开会改人数即可重排。座位数据全程本地，不上传（对齐隐私红线）。
- 在哪试：首页「礼堂排座」卡片 → 填班级/人数（可抽签排序）→ 开始排座 → 切视图/打印/导出。
- 验证：`node --check` 语法；本地 HTTP 服务器 + Playwright 走查（默认班级渲染与统计、抽签重排、领导席/颁奖席预留、Excel 导出产物校验、localStorage 恢复、1179 座全量：矩形 1180 = 座位 1179 + 舞台 1）；门禁相关项全绿（语法库 / 公共密钥 / Supabase 迁移 / Edge Function / 浏览器冒烟套件 exit 0）。
- **门禁存量问题（非本次引入，留待单独主题修）**：`npm run check` 在 HEAD（PR #4，2026-06-15 班级工作台/错题本 v2 合并）即有两处失败——① `check_grammar_modules.py` 未登记 `dashboard-model/render/loop.js`、`error-book-v2.js`；② `check_static_site.sh` 引用的 `docs/shared/error-book.js` 从未入库。本次未顺手修（AGENTS.md 分主题原则）。

## 2026-08-30 · 礼堂排座手动调整重做：任意座位格可换（无需名单）

用户实测旧版手动换座难以操作且存在多处逻辑冲突，进一步明确核心需求是“任意调整每一个座位格到另一个位置”，姓名名单不应成为操作前提。

- **操作改为明确两步**：开启手动调整后，第一步直接点一个或多个有班级颜色的座位格；第二步点“下一步：选择目标座位”，再点任意可用目标。选择来源与选择目标不再共用同一次点击，也不再要求按住 Shift/Command/Ctrl。
- **完全解除名单限制**：无姓名的班级座位格也可单格选择、批量移动或两格互换；名单只用于显示姓名。左侧“选”仍用于快速选整班，点击时会自动开启手动模式。
- **局部交换、严格人数守恒**：单格/多格落位只交换来源块和目标块，目标原有格回填到来源位置；修复旧级联算法向后移动时可能把尾部人员挤出、以及把目标之后全场座位洗牌的问题。
- **整班安全约束**：同人数班级可整班换位；移到空白区时必须在同楼层、同区容纳完整班级；人数不同的班拒绝直接整班互换，避免 seated/count 错乱和拆班跨楼。
- **可撤销**：新增“撤销上一步”，保留最近 20 次手动结果快照；排座规则发生重新计算时清空手动撤销栈。
- **缓存修复**：模块 import 加 `?v=2026083006`，避免 HTML 已更新但浏览器仍运行旧手动算法。
- **验证**：新增 `test/hall-seating-manual.test.js` 3 条单测（无名单两格互换、向后移动人数守恒、整班等人数约束）全过；浏览器实测无名单单格跨班交换、自动进入手动模式、同人数整班跨楼换位及撤销均通过。
- **发布状态**：用户已明确授权 commit/push；随本次提交发布，推送后继续做 Pages 与线上交互复验。

*此日志随项目推进持续更新。最后更新：2026-08-30*

## 2026-09-08 · Echo Reading Windows 首词吞音修复

用户反馈班级 Windows 电脑在 Echo Reading 逐句播放时，经常听不到每句开头几个单词。

- **根因与处理**：逐句 MP3 之间有较长跟读空档，Windows 声卡/功放可能进入省电；旧实现换 `src` 后立即 `play()`，设备唤醒期间的语音会被物理截掉。现在每句正式语音前先用同一 `audio` 通道播放 700ms PCM 无声 WAV，再等 MP3 `canplay`后从 `currentTime = 0` 开始播放。
- **不再悄悄漏句**：旧实现在 `audio.play()` 失败时直接跳到下一句；现在原句重试一次，仍失败则暂停并明确提示点击 Resume。
- **并发保护**：播放 token 会废弃切换句子、音色或暂停后残留的异步 `canplay`/定时回调，避免旧音频抢播。
- **影响范围**：仅 `docs/read-along/index.html`，不改 MP3 资源、教学文本或其它模块。
- **验证**：新增 `tests/read-along-audio.spec.js` 两条 Chromium 回归，覆盖「预热 → 原 MP3 从 0 秒播放 → Echo」顺序和「暂停废弃待命回调」；2/2 通过。内联脚本语法和 `git diff --check` 通过。

*此日志随项目推进持续更新。最后更新：2026-09-08*

## 2026-09-08 · 产品转向学生英语学习 + Shadow Reading 首版

用户明确项目不再以教师端语法填空为中心，转为面向自有班级高中生的英语学习网站，并要求小步推进、暂不做视频与教师工具。

- **学生化首页**：站点名称改为“英语学习系统”，主 CTA 改为 Shadow Reading，英文副标从 English Teaching 改为 English Learning；语法填空降为“语法专项练习”次级入口，管理员入口不再出现在学生首页。
- **Shadow Reading 改名**：页面标题、书架标题、跟读倒计时和学习文案从 Echo Reading 统一改为 Shadow Reading。
- **录音回听**：新增麦克风录音、停止、回听和重录；录音仅作当前页面的 Blob URL，不上传、不入库，结束后立即释放麦克风 track。
- **本机进度**：学生可标记文章完成；读完全文也会自动完成。状态保存在 `seeklume-shadow-progress-v1` localStorage，目录会显示 Completed。
- **方向文档**：`PROJECT_CHARTER.md` 旧的“v1 只做语法/只服务老师”标为历史方向；新增 `docs/planning/2026-09-08-student-learning-direction.md`，固化当前范围、版权原则和小步演进顺序。
- **验证**：学生首页 + Shadow Reading Chromium 回归 5/5 通过（学生首页主次入口、Windows 音频预热链路、暂停并发保护、完成记录持久化、录音回听/释放麦克风）；完成 1440×900 桌面端和 390×844 手机端截图检查，首页 CTA、播放控件、正文与录音区无遮挡。

*此日志随项目推进持续更新。最后更新：2026-09-08*

## 2026-09-15 · Shadow Reading 希沃白板播放加固

班级希沃白板仍出现课文开头吞音，说明原有 700ms 的全零静音预热会被部分设备的静音抑制或在切换到 MP3 时失效。

- **双层课堂音频保护**：将每句前导改为 1200ms 的极低电平、非零 PCM 引导音；在学生点击播放后，用同一浏览器音频输出维持一个不可察觉的 Web Audio 信号，避免 Windows/白板功放在逐句跟读空档进入休眠。
- **稳定起播**：正式 MP3 的 `canplay` 后再等待 220ms 才从 0 秒播放，避免设备切换音源的瞬间截断开头发音。
- **验证范围**：更新 Shadow Reading Playwright 回归，覆盖“引导音 → 正式 MP3”的顺序及稳定起播等待。真实希沃硬件仍需下一节课现场确认。

## 2026-09-15 · 学生首页公开联系入口下线

- 移除学生首页页脚的公开联系引导、个人邮箱和 GitHub Issues 链接，避免将个人身份及公开讨论入口暴露在学生访问页面；隐私说明链接保留。


## 2026-09-16 · 必修一全册内容上线（10 篇课文 + 5 单元词表）

- **15 门新课程**：人教 2019 必修一 Units 1–5 的 Reading and Thinking 与 Reading for Writing 共 10 篇课文（标题句 + 分段标签 + 逐句中文翻译），加 5 个单元单词表（共 298 词，含短语与实义地名，跳过纯听力地名），数据插入 `docs/read-along/index.html` 的 LESSONS。
- **音频 3012 个（约 55MB）**：6 口音（英/美/澳 × 男女）全覆盖；课文按 title_XX/sent_XX、单词按 word_XX 存放于 `audio/{lessonId}/{accent}/`；沿用 24kHz/mono/48k + 前置 300ms 静音的希沃防吞字链路；特殊文本（邮箱、比例 5:2、朝代年份区间等 6 处）用 TTS 读法覆写。
- **三级路由**：BOOKS 升级为 书 → 单元 → 课（`#/bixiu1/u1_rt`），单词音频按课程分目录；早读计划随数据自动生成（18 门课，约 58 分钟）。
- **生成工具**：`gen_b1_content.py`（--js 生成数据 / --insert 原子插入 / --audio 并发生成 / --check 校验），edge-tts + ffmpeg 后处理，失败重试 + `--only-missing` 断点续跑（首轮 6 个失败已全部补齐）。
- **验证**：Chromium 全量回归 36 通过（7 个失败均为 main 历史遗留：2 个 read-along 在 HEAD 复现一致、5 个位于本次未触碰页面）；浏览器抽查 u1_words 实际播放正常（readyState=4、MP3 全 200、零 console 错误）；3012 个文件完整性核对通过（0 缺失、0 空文件）。

## 2026-09-16 · 跟读页单元侧栏 + 早读计划自选顺序

- **跟读页左侧单元目录（默认显示）**：播放页新增固定侧栏，列出全书 6 个单元 18 门课（已完成 ✓ / 词表 🔤 / 课文 🎧），当前课高亮、自动滚动到可视区，点击直达；`☰ Lessons` 悬浮按钮可收起/展开，状态记入 localStorage（宽屏 ≥1100px 默认展开）。沉浸播放（focus-mode）与播放中（playing）自动隐藏侧栏，保证全屏无干扰；桌面宽屏展开时主内容列右移让位，避免遮挡。
- **早读计划按单元分组**：计划页以单元为分组标题展示全部课程，跨单元自由勾选。
- **默认不勾选**：取消旧的「默认全选 + 词表 2 遍」逻辑，改为默认全不选、教师自选；存储迁移到 `morningPlan2`（含 items + order），不受旧数据影响。
- **自选播放顺序**：新增 Reading Order 队列面板，勾选即入队（按勾选顺序），每行 ↑↓ 调整先后、显示序号/单元/遍数，取消勾选自动出队；顺序与遍数持久化，Start 严格按队列顺序播放。
- **验证**：Playwright 脚本 24 项断言全过（侧栏默认显示/跳转/焦点隐藏/收起展开、计划默认 0 勾选、跨单元勾选、↑↓ 调序、取消出队、刷新持久化、按自选顺序开播）；read-along + smoke 回归无新增失败。

## 2026-09-16 · 跟读时长改为「录音时长 + 2 秒」

- **echo 公式重写**：跟读停顿不再按词数估算（原 `(词数×0.45+1.5)×Gap倍率`），改为直接取本句音频 `audio.duration + 2s`，每句都按自己录音的真实长度留跟读时间。
- **移除 Gap 控件**：echo 固定后 Short/Mid/Long 失效，删除控件组及 `setGap`/`calcEcho`/`gapMul` 死代码；速度（0.8×/1.0×/1.2×）不受影响。
- **单词模式不变**：仍是连读两遍、零间隔衔接（echo 只作用于课文句子）。
- **验证**：Playwright 实测第一句 1.76s 音频 → echo 4s、第二句 4.67s → 7s（=时长+2s）；read-along 回归仍为 2 个已知历史遗留失败，零新增。

## 2026-09-17 · 单词音标 + 全屏置顶 + Times New Roman

- **单词全加英式音标**：6 个词表共 283 个单词注入 `ipa` 字段（UK 音标，保留重音/弱读音节）。单词卡片显示为「英文 + 音标 + 中文」，全屏舞台单词下也展示大号音标；句子/词组项不配音标。
- **全屏文字置顶**：focus-mode 下 `.stage-box` 由垂直居中改为顶部对齐（`justify-content:flex-start`），`.stage` 顶部留 7vh 空隙，课堂学生平视即可看到当前词/句。
- **全站 Times New Roman**：`--font-display` 与 `--font-body` 均改为 `'Times New Roman'` 衬线家族，中文回退宋体。
- **验证**：Playwright 断言单词卡音标数量/格式、body font-family、focus 置顶 y<120px；read-along 回归零新增失败。

## 2026-10-14 · 修复 main 分支基线检查三处历史遗留

按 2026-06-15 日志记录的「门禁存量问题」清单逐一修复，目标 `npm run check` 全绿：

- **模块注册**：`check_grammar_modules.py` 补登记 4 个未注册模块——`dashboard-model.js` 按纯模块契约登记进 EXPECTED_MODULES（12 个导出，零 DOM/storage，`window.GRAMMAR_FINE_TAGS` 读取不违反纯度规则）；`dashboard-render.js`、`dashboard-loop.js`、`error-book-v2.js` 使用 DOM/localStorage，登记进 CONTROLLER_MODULES。登记顺序与 `docs/grammar-fill/index.html` 实际脚本顺序一致。
- **静态站检查**：删除 `check_static_site.sh` 中对 `docs/shared/error-book.js` 的语法检查——该文件从未入库（错题本 v2 逻辑在 `modules/error-book-v2.js`），属死引用。
- **landing 冒烟测试**：`tests/smoke.spec.js` 的首页断言从旧版「进入语法填空」按钮更新为学生版首页实际入口「开始 Shadow Reading」+「语法专项练习」，与 2026-09-08 产品转向一致。
- **验证**：`check_grammar_modules.py`（28 modules）、`check_static_site.sh` 单项通过；landing 冒烟测试单跑通过；完整 `npm run check` 见本次提交后状态。

## 2026-10-14 · 全站登录门禁（gate.js）：功能页强制登录 + 注册审批制

教材资源库/课文内容上线前的版权风控基建（详见 2026-10-14 访问控制方案讨论）：首页保持公开当门厅，所有功能页强制登录；新注册用户需管理员审批。**审批判定依赖的 `handle_new_user()` 回滚 SQL（恢复新用户默认 `approved=false`）需在 Supabase 控制台执行 `supabase/migrations/2026-05-17_open_signup.rollback.sql`，执行前新注册用户默认直接可用。**

- **shared/gate.js（新建）**：全站统一门禁组件。状态机 loading → auth（全屏登录/注册表单，用户名或邮箱均可登录，样式内联注入、CSS 变量 + fallback 兼容三页与深色模式）→ pending（等待审批屏：显示用户名、30 秒轮询审批状态、手动刷新、退出登录）→ open（移除遮罩放行，派发 `seeklume-gate-open` 事件）。审批判定走 RPC `check_approved()`：false → 待审批屏；true / 无记录 / RPC 不可用 → 放行（老用户与异常场景不锁死）。本地模式（未配置 Supabase）自动跳过门禁。页面内退出登录时门禁自动重新落下。
- **shared/cloud.js**：`init()` 改幂等（gate.js 与题型页都可能调用）；导出补漏 `usernameTaken`（gate.js 注册查重用）。
- **read-along/index.html**：引入 config.js + supabase-js + cloud.js + gate.js（该页原先完全无认证）。
- **grammar-fill/index.html**：在既有认证栈（cloud/auth-ui/admin-ui）之后挂 gate.js，可选登录改强制；原有 `?admin` 管理面板入口、viewAs、云同步逻辑不受影响。
- **index.html（首页）**：登录用户头部新增"审批管理"按钮，仅 `state.isAdmin` 时渲染，直达 `./grammar-fill/?admin`（用户注册审批 / 管理面板继续暂住语法填空页，不搬走）。
- **测试**：`tests/smoke.spec.js` 桩新增 `check_approved` RPC（默认放行、`__mockApproved` 可模拟待审批）；"auth sign-in/sign-out" 测试改走门禁表单登录流程；两个访客路径测试补登录会话 mock（`mockGateSession`）；新增 3 条门禁专项测试（read-along 游客见登录墙、待审批屏 + 审批通过放行、首页管理员按钮可见性）。`scripts/check_static_site.sh` 纳入 gate.js 存在性 + 语法检查。
- **验证**：完整 `npm run check` 全绿（41 条冒烟测试 0 failed，个别负载相关 flaky 重试即过）；真实浏览器实测三页：跟读页/语法填空页游客见全屏登录墙（含注册切换）、首页公开无墙。

## 2026-10-19 · 知识库新增「教材进度」视图（高一入口）

起因：知识库现有视图（书本速查/知识地图）都是高三语法填空口径，高一「跟随教材单元进度」没有入口——源库《语法通霸》里有的内容（如"表将来的五种结构"）在站内被按考点重组、拆散在各小节，按教学主题查不到。本次先做低成本方案 A：复用已有教材单位数据，新增视图。

- **教材进度视图**：`app.js` 新增 `renderTextbookMap()`，按 必修一→选必四 分册横条排布单元卡片（单元号 · topic · 中文语法点），点语法点直达对应知识。
- **落点映射**：`maps_to` → `tags_by_id[id].category`；有书本速查内容的落 `selectKnowledgeCategory`；句子结构类（structure）落知识地图的 `sentence_elements` / `sentence_types` 节点；情态、特殊句式等暂无速查内容的只展示不跳转（半透明 + "暂无速查内容"）。
- **入口接线**：`index.html` 增 `knowledgeTextbookBtn`；`knowledge-view-model.js` 的 `buildKnowledgeViewChromeModel` 放行 `textbook` 并加按钮；`app.js` / `app-state.js` 的视图白名单加 `textbook`。
- **不新增模块导出**，沿用 `textbook_units`（7 册 35 单元）现有数据，无新数据文件。
- **验证**：`check_grammar_modules.py`（28 modules）通过、`node --check` 三个改动文件通过、Playwright smoke 见本次提交后状态。`npm run test:unit` 2 个失败为历史遗留（`test/score-convert.test.js`、`test/hall-seating-manual.test.js` 引用了未入库的 `docs/score-analysis/score-convert.js`、`docs/hall-seating/hall-seating.js`），与本次改动无关。
- **遗留**：必修一 Welcome/U1（句子结构/短语）与情态、特殊句式目前没有书本速查内容可落，后续按 unit 补「概念讲解层」（方案 B）。

---

## 2026-10-19 · 语法板块改版：从「语法填空」到「课本语法」（分队改，以必修一 U3 纵向切片验证）

起因：教师反馈所引用的教辅内容与人教版课本实际进度并不吻合。核对后确认：`textbook_units` 的 `maps_to` 不仅存在非谓语三类（to-do / doing / done）大面积错绑，还有多处 tag 重复。据此把语法板块的定位从「高三应试口径的语法填空」改为「跟随人教版课本、结合教辅的综合语法学习体系」，采用分层改版（先验证）策略。

### 层 1 · 用户可见命名（已完成）

- `docs/grammar-fill/index.html`：`<title>`、header logo、欢迎文案、模块卡标题/描述由「语法填空 / 语法讲评」改为「课本语法」；tab「📚 教材进度」改为「📚 课本单元」；引入新数据脚本 `textbook_grammar_notes.js`。
- `docs/index.html`（落地页）、`docs/privacy.html`、`docs/grammar-fill/modules/home-dashboard-model.js` 同步文案。
- `tests/smoke.spec.js` 对应断言同步更新。
- 技术路径 `docs/grammar-fill/`（目录 / URL / deploy / 测试 / localStorage key）按计划**不动**（层 3 后置）。

### 数据底座修正：`docs/data/grammar_fine_tags.js`

- `version 0.3.0 → 0.3.1`，`updated_at → 2026-10-19`，source 追加修正说明。
- 修正 14 处 `maps_to` 错绑/重复：必修二 U1/U4/U5、必修三 U1/U2/U4、选必一 U3/U4、选必二 U2/U5、选必三 U4、选必四 U1/U2/U4。
- 权威口径来源：人教版 7 册 PDF 文字层逐单元定位语法板块（印刷页 + PDF 页 + 板块任务名）；必修一 U3「反意疑问句」= 印刷 p39 / PDF p47。

### 层 2 · 第一个纵向切片：必修一 U3 讲解层（已完成）

- **新增数据** `docs/data/textbook_grammar_notes.js`：`window.TEXTBOOK_GRAMMAR_NOTES = { '必修一|U3': {...} }`，含课本口径的 概念 / 组成 / 功能 / 回答 / 读法 + 6 条课本原句 + 教辅深化（语法通霸 16.01 五组考点）+ 课本练习参考答案（标注「非官方答案册」）。刻意与高三应试口径的 `KNOWLEDGE_DATA`（书本速查）分离，不污染。
- **渲染** `app.js`：新增模块级 `_expandedTextbookUnit` + `toggleTextbookNote(key)` + `_textbookNoteHtml(note)`，在 `renderTextbookMap()` 中可**就地展开**（不新增视图、不动视图白名单 / chrome model / back 机制）。单元卡片标签过滤掉与正文重复项（如 U3 的「反意疑问句」）。
- **样式** `styles.css`：追加 `.tb-note-btn` / `.tb-note-panel` / `.tb-note-head` / `.tb-note-block` / `.tb-note-ex` / `.tb-note-caveat` 等。
- **测试** `tests/smoke.spec.js`：新增「必修一U3 讲解面板可就地展开，标签不与正文重复」断言。

### 验证

- `python3 scripts/check_grammar_modules.py` → `OK: grammar-fill module contracts valid (28 modules)`
- `node --check`：`app.js` / `grammar_fine_tags.js` / `textbook_grammar_notes.js` 通过
- `npm run test:smoke` → **41 passed**（1 条 flaky 为「班级工作台」测试抖动，与本改动无关）

### 遗留 / 下一步

- 层 2 信息架构骨架：tab 精简为「课本单元」（主线）+「考点速查」（应试），待 U3 验证通过后再做。
- 按 U3 模板铺开其余单元讲解层（Welcome/U1 句子结构、情态、特殊句式等目前仍无讲解数据）。

*此日志随项目推进持续更新。最后更新：2026-10-19*

---

## 2026-10-20 · U3 讲解层改版：就地展开 → 独立讲解页 + 大量课本原书截图

起因：教师本地预览后提出两点。①讲解以「就地展开的下拉面板」呈现很违和，应改为点整张单元卡片进入独立讲解页；②讲解应**大量使用课本原书截图**。截图版权经教师当面确认无问题（仅课堂使用、不对外售卖），据此按「大量截图」执行。

### 移除「就地展开」

- `docs/grammar-fill/app.js`：删除模块级 `_expandedTextbookUnit`、`toggleTextbookNote(key)`、`_textbookNoteHtml(note)`，以及 `renderTextbookMap()` 内的 `.tb-note-btn` / `.tb-note-panel` 渲染与 `bandNote` 拼装。
- `docs/grammar-fill/styles.css`：删除 `.tb-note-*` 样式段，替换为独立讲解页样式（见下）。

### 新增视图 `textbook-node`（点整卡进入）

- `docs/grammar-fill/modules/app-state.js`：`normalizeKnowledgeView` 白名单加入 `textbook-node`；`getDockBackLabel` 加「返回课本单元」；`getDockBackAction` 加 `{ type: 'knowledge-textbook' }`。
- `docs/grammar-fill/modules/knowledge-view-model.js`：`buildKnowledgeViewChromeModel` 支持 `textbook-node` —— `routeView` 归一为 `textbook`（保证「课本单元」tab 高亮、侧栏收起），但 `renderAction` 保留 `textbook-node` 以分派到新渲染函数。
- `docs/grammar-fill/app.js`：把 `setKnowledgeView()` 内的按钮/侧栏/分派逻辑抽成 `_renderKnowledgeRoute(view)`，新增 `openTextbookNote(key)` 与 `renderTextbookNode(key)`；`_renderKnowledgeRoute` 增加 `renderAction === 'textbook-node'` 分支；`handleDockBack()` 增加 `knowledge-textbook` 分支（回到课本单元列表）。
- 整卡可点：`renderTextbookMap()` 对**有讲解数据**的卡片挂 `tb-card-link` + `onclick` + `role="button" tabindex="0" onkeydown`；卡片内语法点标签加 `event.stopPropagation()` 避免误触；卡片底部加 `.tb-card-cta`（「📖 点卡片 · 看课本讲解 →」）作可见affordance。

### 课本原书截图（6 张局部图）

- 从 `private/教材/人教版·英语必修 第一册.pdf` 以 `pdftoppm -r 150` 裁切，输出到 `docs/assets/textbook/bx1/`：
  - `u3-tag-appendix-1.png` / `u3-tag-appendix-2.png` —— 课本语法附录 **印刷 p109**「III Tag Questions 附加疑问句」：组成四类对照表 / 回答与读法。
  - `u3-tag-conversations.png` / `u3-tag-drill.png` / `u3-tag-scene.png` —— 课本正文 **印刷 p40** Discovering Useful Structures 的任务 1 / 2 / 3。
  - `u3-tag-intonation.png` —— 课本正文 **印刷 p37** Pronunciation 的升调/降调对话。
- 单张 80–350KB，合计约 960KB；均只裁切语法相关板块，不含整页搬运。
- `docs/data/textbook_grammar_notes.js`：新增 `shots: [{ src, title, note }]` 字段；同时修正 `source.print` 由 39 → 40（语法板块实际落在印刷 p40，39 为前一页）。
- `docs/grammar-fill/app.js`：新增 `_textbookShotsHtml(note)`，在讲解页顶部渲染「课本原书 · 原题截图」区（`figure` + `figcaption` + `img[loading=lazy]`）。

### 样式

- `docs/grammar-fill/styles.css`：新增 `.tb-card-link`（hover/focus-visible）、`.tb-card-cta`、`.tb-page` / `.tb-page-head` / `.tb-page-en` / `.tb-page-meta` / `.tb-page-lead`、`.tb-sec` / `.tb-sec-title` / `.tb-sec-hint`、`.tb-shots` / `.tb-shot` / `.tb-shot-cap` / `.tb-shot-img`、`.tb-sub`、`.tb-ex` / `.tb-ex-en` / `.tb-ex-zh`、`.tb-caveat`。

### 测试

- `tests/smoke.spec.js`：原「必修一U3 讲解面板可就地展开」用例改写为「点整卡进入 U3 独立讲解页，含课本原书截图，可返回」——断言 `.tb-page` 可见且含关键文案、`.tb-shot-img` 共 6 张、首图 `src` 指向 `assets/textbook/bx1/u3-tag-appendix-1.png`、`#dockBackBtn` 的 `data-label` 为「返回课本单元」且点击后回到课本单元列表。

### 验证

- `python3 scripts/check_grammar_modules.py` → `OK: grammar-fill module contracts valid (28 modules)`
- `bash scripts/check_static_site.sh` → `OK: static site release checks passed`
- `node --check`：`app.js` / `modules/app-state.js` / `modules/knowledge-view-model.js` / `textbook_grammar_notes.js` 通过
- `npm run test:smoke` → **42 passed**

### 遗留 / 下一步

- 按 U3 模板铺开其余单元讲解层与对应课本截图（Welcome/U1 句子结构、情态、特殊句式等仍无讲解数据）。
- 层 2 信息架构骨架：tab 精简为「课本单元」（主线）+「考点速查」（应试）。
- 本轮改动**未提交 / 未推送**，等教师本地验收。

*此日志随项目推进持续更新。最后更新：2026-10-20*

---

## 2026-10-20 · 首页改版（骨架）：语法填空主页 → 语法主阵地

起因：教师预览 `page-home` 后指出「这还是语法填空主导，语法填空要退到其中一个功能，这里是语法主阵地，核心是书本语法以及教辅的语法」。确认三件事：①直接改造现有首页（不新建独立页）；②语法填空只留一个「练习」入口，讲卷工具（精选题库/导入试题/考点画像/导入成绩）收进「教学工具」分组；③本轮**先只改首页骨架、不填内容**。与本仓库既有方向一致（`docs/planning/2026-09-08-...md`：「语法填空保留为专项练习，不再是产品主线」）。

### 首页三段骨架

- `docs/grammar-fill/modules/home-dashboard-model.js`：
  - `getHeroModel` 去掉「今天讲哪份卷子？」与「导入成绩/考点画像」的主导叙述，改为定位句「课本语法 + 教辅语法」。
  - 删除 `getCoreActions` / `getToolActions` / `getTextbookGallery` / `getTextbookSectionModel`（旧的封面装饰墙与「教材映射重做中」）。
  - 新增 `buildTextbookGrammarSectionModel(textbookUnits, noteIndex)`：按 7 册分组、36 单元，逐单元给 `unitLabelText / topicText / grammarText / ready / statusText`，册封面走既有 `COVER_MAP`；新增 `buildGrammarIndexSectionModel(fineTags)`：`GRAMMAR_FINE_TAGS.categories` 13 类 / 57 考点，带《语法通霸》章节来源；新增 `getToolGroups(activity)`：练习（唯一练习入口「语法填空 · 练习」）+ 速查（知识库）+ 教学工具（导入试题 / 我做过的题 / 导入成绩 / 考点画像）。
  - `buildDashboardModel` 返回结构改为 `hero / textbookSection / indexSection / toolSection`。
- `docs/grammar-fill/modules/home-render.js`：`homeDashboardHtml` 输出 hero → ①课本语法（每册一条 book band：封面缩略图 + 单元卡片网格，卡片显示单元/话题/语法点 + 「已有讲解｜整理中」）→ ②教辅语法（13 张类目卡）→ ③工具（分组标题 + 按钮）。新增 `sectionHeaderHtml` / `unitCardHtml` / `categoryCardHtml`。
- `docs/grammar-fill/modules/home-dashboard.js`：`renderHomeDashboard` 传入 `textbookNotes: window.TEXTBOOK_GRAMMAR_NOTES` 与 `fineTags: window.GRAMMAR_FINE_TAGS`；`runHomeDashboardAction` 增加 `open-textbook-note` / `select-knowledge-category` 两个 step。

### 新动作：点卡片进独立页

- 模型新增 action：`open-textbook-unit`（立即 `switch-page knowledge`，延迟 `open-textbook-note`）与 `open-knowledge-category`（立即 `switch-page knowledge` + `set-knowledge-view book`，延迟 `select-knowledge-category`）。
- 顺序原因：`switchPage('knowledge')` 内部会把视图重置成 `map`，所以必须「先切页、再设视图/选中」。
- `docs/grammar-fill/app.js`：`homeDashboardDeps()` 补 `openTextbookNote` / `selectKnowledgeCategory`。

### 无讲解单元不再死路

- `app.js`：`openTextbookNote` 去掉「无讲解直接 return」的守卫；新增 `_textbookUnitFor(key)` 与 `_textbookPendingHtml(unit)`；`renderTextbookNode` 在无讲解时渲染占位页（单元语法点 + 考点入口 chips + 回到课本进度）；`renderTextbookMap` 让 36 张卡片**全部可点**（CTA 文案按有无讲解区分）。

### 文案 / 门面

- `docs/grammar-fill/index.html`：dock 第 1 项 `data-label` 由「语法填空主页」改为「语法主页」。

### 测试

- `scripts/check_grammar_modules.py`：`home-dashboard-model` 契约改为 `buildTextbookGrammarSectionModel / buildGrammarIndexSectionModel / getToolGroups`（移除 `getTextbookGallery`）。
- `tests/smoke.spec.js`：dashboard 模型断言改写为三段结构（36 单元 / 13 类 57 考点 / 工具 3 组，共 6 个工具按钮）、新增两个新 action 的 plan 断言；`home-render pure html output` 用例改为断言三段骨架与 3 个 `DASH:` 动作。
- `docs/planning/knowledge-taxonomy.md`：补「首页落点：两条轴并列为语法主阵地」一节，把首页三段对齐到既有「教材单元轴 / 语法通霸考点轴」。

### 验证

- `python3 scripts/check_grammar_modules.py` → `OK: grammar-fill module contracts valid (28 modules)`
- `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path renders|home-render pure html output"` → **2 passed**
- 本地 8787 预览逐项核对 13 项全通过：36 张单元卡 / 13 张类目卡 / 点 U3 进独立讲解页 / 点未整理单元进占位页 / 点类目进「书本速查」并高亮 / 练习入口进套卷网格 / dock 文案已是「语法主页」。
- 注意：两处 emoji（📖 / 📥）在写入 `home-dashboard-model.js` 时被工具写成替换字符，已按码位修复（现值 U+1F4D6 / U+1F4E5）。

### 遗留 / 下一步

- 本轮只做骨架，未填内容；其余 34 单元的讲解层与课本原书截图待铺开。
- 待教师验收后再定：教辅类目卡是否改成更聚焦的类目页、课本语法是否加册级 tab。
- 本轮改动**未提交 / 未推送**，等教师本地验收。

## 2026-10-20 · U3 讲解页重构：课本板块骨架 + 课本↔教辅逐条对照 + 整页/放大双图

起因：教师看独立讲解页后追问「怎么展示更能让学生理解？课本怎么展示，教辅呢，能结合吗」，并指出课本单元列表里「必修一和 U3 卡片分开了，应该是包含关系」。经两轮确认，方案锁定：**以课本板块顺序为骨架**；每个板块开头先给**整页原书图**，板块内部做「**左课本原句 ↔ 右教辅批注**」逐条对照，教辅深化贴在**对应板块之后**，最后放课本练习 + 参考答案；截图粒度 = **整页 + 关键句放大**；使用场景 **投影 + 手机都要**（响应式）。

### 数据层：平铺 → 板块化

- `docs/data/textbook_grammar_notes.js`：U3 由 `blocks / examples / deeper`（平铺）改为 `sections`（6 个板块，按课本顺序标号 ①–⑥）+ `drills`。每板块 = `{ title, shots, book, compare, aid }`：
  - `shots` 里用 `kind: 'page' | 'zoom'` 区分整页图与关键句放大图。
  - `compare` 逐条 = `{ en, zh, aid }`（左课本原句 / 右教辅批注）。
  - `aid` = 教辅深化（语法通霸 16.01 的三组规则贴到 ②组成；I/we think 宾语从句、need/dare/used to 贴到 ⑥）。
- 截图扩到 **9 张**（`docs/assets/textbook/bx1/`，共约 2.5MB）：新增 3 张整页 `u3-p109-page.png` / `u3-p40-page.png` / `u3-p37-page.png`，加原有 6 张局部图。

### 渲染层重写

- `docs/grammar-fill/app.js`：`renderTextbookNode()` 改为消费 `note.sections` —— 页头（标题 + meta + 一句话定位 + **板块 TOC chips**）→ 引导语 → 逐板块 `.tb-block`（板块标题 → `.tb-shots` → 「课本怎么说」→ 「课本原句 ↔ 教辅批注」→ 教辅深化）→ 练习板块（题图 + 参考答案）。新增 `_tbShotHtml` / `_tbCompareHtml` / `_tbAidHtml` / `_tbSectionHtml`；整页图外层包 `<a target="_blank">`，点开看原图。
- **踩坑**：页面有全局 `header { display:flex; height:52px; position:sticky }` 顶栏样式，讲解页里用 `<header class="tb-page-head">` 会被当成 flex 顶栏，四个子元素被排成一行。已把 `.tb-page-head` / `.tb-block-head` 全部改成 `<div>`。
- `docs/grammar-fill/styles.css`：替换旧 `.tb-sec/.tb-ex` 段，新增 `.tb-toc` / `.tb-block` / `.tb-shot-badge` / `.tb-compare-row` / `.tb-aid` 等；`.tb-compare-row` 宽屏 `grid-template-columns: 1fr 1fr`，`@media (max-width:720px)` 塌成上下堆叠。
- `renderTextbookMap()`：册改成明显的**父容器** —— `.tb-book-band` + 封面缩略图（`TB_BOOK_COVER`）+ 册名 + 「N 个单元 · 点卡片看课本原书讲解与截图」，`必修一 ⊃ U3` 不再看起来像并列。

### 测试

- `tests/smoke.spec.js`：课本语法用例改为按新结构断言 —— 必修一 band 含封面、卡片嵌在 band 内；点卡后 `.tb-block` 7 个（6 板块 + 1 练习）、`.tb-compare-row` 13 条、`.tb-aid` 2 个、`.tb-shot--page` 3 张、`.tb-shot-img` 9 张、首图 = `u3-p109-page.png`、整页图 `target="_blank"`；返回仍回课本单元列表。

### 验证

- `python3 scripts/check_grammar_modules.py` → `OK: grammar-fill module contracts valid (28 modules)`
- `bash scripts/check_static_site.sh` → `OK: static site release checks passed`
- `npm run test:smoke` → **42 passed**
- 本地截图目视核对：1440px 下页头/板块/对照两栏正常，390px 下对照行正确堆叠；必修一 ⊃ U3 包含关系清晰。

### 遗留 / 下一步

- 本轮只做必修一 U3 一个切片；其余 34 单元的 `sections` 与截图待铺开。
- 本轮改动**未提交 / 未推送**，等教师本地验收。

## 2026-10-20 · 反转「无讲解单元不再死路」：只开放 B1U3，其余标「待开放」

教师反馈「目前课本仅开放 B1U3 的语法，其余的都显示待开放」，撤回上一轮的「36 张卡片全部可点 + 占位页」做法。

- `app.js`：删掉 `_textbookUnitFor` 与 `_textbookPendingHtml`（占位页），`renderTextbookNode` 无讲解时直接回列表；`openTextbookNote` 恢复无讲解守卫。`renderTextbookMap` 改为 —— 有讲解的卡 = `.tb-card-link`（可点，CTA「📖 点卡片 · 看课本讲解 →」）；无讲解的卡 = `.tb-card-locked`（置灰虚线框、不可点、内部语法点标签也不可点），只挂 `.tb-card-locked-badge`「🔒 待开放」。
- 册标题条文案改为「N 个单元 · 已开放 M 个」；页头说明改为「目前 **必修一 U3** 已开放…其余陆续开放」。
- `styles.css`：新增 `.knowledge-node-card.tb-card-locked`（`cursor:default` / `opacity:.62` / `border-style:dashed`）与 `.tb-card-locked-badge`。
- `tests/smoke.spec.js`：新增断言 —— 必修一里 `.tb-card-link` 1 张、其余 `.tb-card-locked` 且含「待开放」；点待开放卡不跳转，仍停在课本单元列表。

## 2026-10-20 · 课本单元入口改成「7 册封面墙」门厅

教师反馈上一版（每册一条 band + 册名条 + 单元卡网格）「有点丑」，经确认选定：**入口形态 = 7 册大封面一面墙（封面当主角、文字很小）**，交互 = **点封面 → 上下展开该册单元 → 点单元 → 跳独立讲解页**（不回到就地展开）。

- `app.js`：`renderTextbookMap()` 重写为「封面墙 + 展开面板」两段式。
  - 新模块级状态 `_tbOpenBook`（当前展开的册，空串=全收起，默认收起）+ `toggleTextbookBook(book)`（点封面展开/再点收起）。
  - 抽出 `_tbUnitCardHtml(unit)`（单元卡，含 `.tb-card-link` / `.tb-card-locked` 两态）与 `_tbOpenedCount(units)`。
  - `.tb-wall` = 7 个 `.tb-cover-card`（大封面 `.tb-cover-img` + 册名 + 「已开放 N 个 / 待开放」）；选中册加 `.is-open` 高亮。下方 `.tb-book-panel` 展开该册单元卡网格。
- `styles.css`：删掉上一版的 `.tb-book-band`，新增 `.tb-wall-head` / `.tb-wall` / `.tb-cover-card`（hover 上浮 + focus-visible）/ `.tb-cover-img`（`aspect-ratio:3/4`）/ `.tb-cover-name` / `.tb-cover-count` / `.tb-book-panel`；保留 `.tb-book-head` / `.tb-book-cover` 给面板用。
- `tests/smoke.spec.js`：断言改为 —— 7 张 `.tb-cover-card`、默认无 `.tb-book-panel`；点必修一封面 → 面板展开、1 张可点 + 其余待开放；再点收起；点待开放卡不跳转；从讲解页返回仍是 7 张封面墙。

验证：`npm run test:smoke` **42 passed**、`check_grammar_modules` 28 modules OK、`check_static_site` OK。1440px 下 7 封面一排、390px 下 2×N 折行，均正常。

## 2026-10-20 · 课本这条线整体归首页，知识库不再管课本

教师发现「课本语法」在首页与知识库各有一份渲染，重复了；经确认选择「整体归首页」。

**首页（`docs/grammar-fill/`）**
- `modules/home-render.js`：textbook 段从「每册一条 band + 单元卡网格」改成 **7 册封面墙** `.tb-wall`（7 个 `.tb-cover-card`：大封面 + 册名小字 + 「已开放 N 个 / 待开放」），默认全收起；点封面在该册加 `.is-open` 并在墙下渲染 `.tb-book-panel`（小封面 + 册名 + `metaText` + 单元卡网格）。`unitCardHtml` 拆成两态：可点单元走原 `inlineHomeDashboardAction`；不可点单元渲染成 `<div>` + 「🔒 待开放」。
- `modules/home-dashboard.js`：新增模块级 `_homeOpenBook` + 全局 `toggleHomeTextbookBook(book)`（点封面展开/再点收起，同时只展开一册）；`renderHomeDashboard` 在 `_homeNoteKey` 有值时改渲染讲解页。
- `modules/home-dashboard-model.js`：`open-textbook-unit` 的执行计划去掉「先切知识库页」，改为直接 `open-textbook-note`；`buildTextbookGrammarSectionModel` 的说明文案改为「点封面展开这册的单元，点单元进讲解页……目前只有必修一 U3 开放，其余标「待开放」」。
- `app.js`：讲解页宿主从知识库 `#knowledgeContent` 搬到首页 `#homeDashboardContent`；`openTextbookNote(key)` 挂 `_homeNoteKey` → 切首页 → 渲染；`switchPage('home')` 重置回 dashboard（避免从讲解页点 dock 🏠 又看到讲解页）。

**知识库（减法）**
- 去掉「课本单元」tab（`index.html` 的 `#knowledgeTextbookBtn` + `knowledge-view-model.js` 的按钮项）、`textbook`/`textbook-node` 视图路由与 `renderTextbookMap` 及配套（`_tbUnitCardHtml`/`_tbOpenedCount`/`_tbOpenBook`/`toggleTextbookBook`/`TB_BOOK_COVER`/`TEXTBOOK_BOOK_ORDER`/`_textbookUnitTargets`）。
- `app-state.js`：`normalizeKnowledgeView` 去掉两个课本视图，`normalizeHomeView` 接受 `'textbook-note'`；dock 返回标签改为「返回课本墙」（删掉原 `currentKnowledgeView === 'textbook-node'` 的「返回课本单元」/`{type:'knowledge-textbook'}` 与 `handleDockBack` 对应分支）。
- 知识库现在只剩：书本速查 / 知识地图 / 图谱 / 文字。

**验证**：`npm run test:smoke` **42 passed**、`check_grammar_modules` 28 modules OK、`check_static_site` OK。Playwright 端到端实测：首页 7 封面默认收起 → 点必修一展开 1 面板（1 可点 + 5 待开放）→ 点 U3 讲解页渲染在 `#homeDashboardContent`（知识库容器内 0）→ dock 返回标签「返回课本墙」→ 回到封面墙；从讲解页点 dock 🏠 不留讲解页；知识库 tab 栏已无「课本单元」。本轮仍未提交 / 未推送。

## 2026-10-20 · 封面墙交互定为「三级跳页」（否决 inline 展开）

教师试用后否决上一版的「点封面 → 墙下展开面板」（原话：「必修一点不进去」「我希望是点进去跳转而不是下面出现」）。改为整页跳转，三级都无 inline 展开：

- **第 1 级 封面墙**：7 张封面，无展开。点封面 → `openHomeTextbookBook(book)`（`app.js`，全局），设 `_homeBookKey`。
- **第 2 级 册单元页**：`modules/home-render.js` 新增导出 `textbookBookPageHtml(book, units, deps)`（整页：面包屑「← 📚 课本语法 · 人教版 / 必修一」+ 封面缩略图 + 册名 + `metaText` + 单元卡网格），由 `modules/home-dashboard.js` 的 `renderTextbookBookPage(bookKey, deps)` 调度。
- **第 3 级 单元讲解页**：沿用 `openTextbookNote(key)` → `renderTextbookNode()`，渲染进 `#homeDashboardContent`；`openTextbookNote` 保留 `_homeBookKey`，所以返回能落回第 2 级。
- **视图状态**：`app-state.js` 的 `currentHomeView` 现有 `'cards' | 'textbook-book' | 'textbook-note'` 三态；`renderHomeDashboard()` 按 `_homeNoteKey` → `_homeBookKey` → dashboard 三级分派；`switchPage('home')` 离开子视图时清两个 key，保证点 dock 🏠 一定回封面墙。
- **dock 返回**：讲解页 → 「返回课本单元」（`{type:'home-textbook-book'}`）；册单元页 → 「返回课本墙」（`{type:'home-view', view:'cards'}`）。
- **删除**：`_homeOpenBook` / `toggleHomeTextbookBook` / `.tb-book-panel` / `.is-open` 全部清掉（不留兜底）。`styles.css` 新增 `.tb-book-page` / `.tb-book-crumb`。`check_grammar_modules.py` 补 `textbookBookPageHtml` 导出登记。

**验证**：Playwright 端到端实测三级链路 —— 墙(7 封面/0 面板) → 点必修一(墙消失，整页 6 单元卡：1 可点 + 5 待开放，返回「返回课本墙」) → 点 U3(讲解页 1，返回「返回课本单元」) → 返回一次回册单元页 → 返回两次回封面墙 → dock 🏠 回封面墙。`npm run test:smoke` **42 passed**（并行跑时 `formatCountBadge` / 决策地图两条曾超时，单跑 1.6–4.1s 全绿，属 flaky）。`check_grammar_modules` 28 modules OK、`check_static_site` OK。未提交 / 未推送。

## 2026-10-20 · 阅读课首版（新功能线，以必修一 U3 Reading and Thinking 纵向切片）

教师提出新需求：在「语法」「跟读」之后，再做一条**阅读课**线，帮助每天上阅读课。定位是「帮学生直观理解文章 + 用思维导图辅助背诵 Reading and Thinking / Reading for Writing」。经四轮选型对齐后确定：独立页面 `docs/reading/`；3D 用可交互 Three.js（先拿 U3 一篇文章试验）；思维导图 = 每段小导图 + 整篇汇总；第一版做 U3 RT 端到端初稿。

### 产出

- **数据层** `docs/data/textbook_reading_notes.js`：与「课本语法讲解层」平行，key = `册|单元|RT/RW`，按课本段落顺序存 `sections`（段落大意 / 原文 / 原书截图 / 该段小导图）、`whole`（整篇汇总导图）、`recite`（金句+必背短语+记忆抓手）、`scene`（3D 场景配置）。原文与跟读库 `u3_rt` 同源，此处按阅读课视角重组，并留了教案接入位。
- **思维导图渲染** `docs/reading/mindmap.js`：纯函数（`layout` / `buildSvg` / `wrapText`），中心节点在左、分支自上而下、分支下挂要点条，输出可随容器缩放的 SVG；按深浅色主题切换配色。中文按字断行、英文按词断行。
- **3D 场景** `docs/reading/scene3d.js`：Three.js r149（CDN，全局构建），自研轻量轨道控制（拖拽旋转 / 滚轮缩放 / 点击拾取），不依赖 examples/OrbitControls 以免版本坑；文字面片做 billboard 始终朝相机，保证旋转时标题与人物卡可读。环境无 WebGL 时返回 null，页面走静态卡片降级。
- **页面** `docs/reading/index.html` + `docs/reading/app.js`：沿用 read-along 的视觉令牌与主题切换；「装饰墙」交互——顶部 5 个入口（原文 / 文章大意 / 场景 / 思维导图 / 背诵），点开才在下方铺开面板，点击切换、Esc 收起；接入全站登录门禁（与功能页一致，强制登录）。
- **原书素材**：从 `private/教材/人教版·英语必修 第一册.pdf` 第 45 页（印刷页 p38）导出整页 + intro / Lang Ping / Michael Jordan 三处关键放大图，存入 `docs/assets/textbook/bx1/`（`u3-rt-p38-page.png` 等）。
- **入口**：`docs/index.html` 首页 hero 加「阅读课」按钮、模块列表加「阅读课」玻璃卡（`./reading/`）。

### 关键决策

- 3D 只作为「直观理解」这一栏的呈现手段，不是炫技主体；思维导图才是背诵主阵地。
- 复用跟读库原文，避免同一篇课文出现两套对不上的文本；后续可抽公共数据源进一步收敛。
- 阅读页沿用「装饰墙」交互（点入口 → 展开），与教师一贯偏好一致。

### 验证

Playwright 无门禁预览页实测五个面板全部渲染通过，控制台零报错：大意面板（体裁/主旨/4 张段落卡）、导图面板（整篇 1 张 + 分段 4 张，无文字溢出）、场景面板（CDN 加载后出 3D，无黑屏）、背诵/原文面板；真实页 `/reading/` 由门禁正常拦截，首页新入口计数 1。Node 侧对数据层与导图纯函数做了自检（4 段 / 4 分支 / SVG 生成与换行正常）。未提交 / 未推送。

## 2026-10-20 · 恢复注册审批闸门（新账号需管理员审批）

教师实测：新注册账号不经审批即可使用。定位到 `supabase/setup.sql` 的 `handle_new_user()` 里写死 `approved = true`（源自 `2026-05-17_open_signup.sql`「开放注册」），于是 `check_approved()` 对该用户返回 true，门禁的「等待审批」屏被架空。前端侧本身没问题（`docs/shared/gate.js` 状态机、`docs/shared/admin-ui.js` 待审批的 ✓通过 / ✕拒绝 都在）。

修法（只改数据层默认值，不动存量行）：
- 新增 `supabase/migrations/2026-10-20_restore_signup_approval.sql`（+ 同名 `.rollback.sql`）：`handle_new_user()` 恢复 `approved = false`；
- `supabase/setup.sql` 同步改成 `false`，新装环境不再重新开放注册。

存量账号不受影响：`check_approved()` 对「无 profiles 记录」返回 true，而 5 月那次迁移已把存量置为 true；如需把除管理员外的存量账号也退回待审批，在 SQL Editor 另跑一条 `update public.profiles set approved = false where ...`（本轮未执行）。

落地与验证：该迁移已通过 Supabase 控制台 SQL Editor 执行完毕；只读诊断确认库里 `handle_new_user()` 函数体为 `approved = false`、触发器 `on_auth_user_created` 在线，且测试号 `test1020@seeklume.work` 注册后确实写入 `approved = false`。前端实测：该未审批账号访问 `https://seeklume.work/grammar-fill/` 被拦在「等待管理员审批」屏（功能控件不可交互），审批闸门恢复生效；同账号在首页（公开门厅）可正常浏览，符合设计。`check_supabase_migrations.py` / `check_static_site.sh` 均通过。

## 2026-10-20 · 封堵「删号后对方仍能继续用站」

教师实测：在管理员面板删掉某个账号后，该账号从列表消失，但对方仍能继续打开功能页使用本站。

逐层排查（线上只读查询，逐一排除）：`admin_reject_user` 函数体确为 `delete from auth.users where id = target_user;`、owner=`postgres` 且对 `auth.users` 有 DELETE 权限、引用 `auth.users` 的 15 条外键中 14 条 `ON DELETE CASCADE`、`auth.sessions` / `auth.refresh_tokens` 的孤儿行均为 **0** —— 也就是说删号本身、权限、外键、会话回收都没问题。

根因在 `check_approved()`：它把「查不到 profiles 记录」当作「审批系统上线前、没有档案的老用户」直接 `return true`，而删号走 `delete from auth.users` 时 profiles 行会被级联删掉 —— 于是「被删号」与「老用户」在函数里同形，被一并放行；对方浏览器里尚未过期的 access token 仍能通过 RLS，门禁又不断放行，表现为「账号消失了但人还在站内」。此即 2026-10-14 门禁方案中标记过的「无记录一律放行」风险点。

修法：
- 新增 `supabase/migrations/2026-10-20_lock_out_deleted_users.sql`（+ 同名 `.rollback.sql`）：`check_approved()` 改为 fail-closed（查不到档案 → `false`）；并加一步兜底 —— 把「有 `auth.users` 但没有 `profiles` 行」的存量账号补成 `approved = true`，避免改成 fail-closed 后误伤真正的老用户（线上实跑该步影响 0 行，属空操作）；
- `supabase/setup.sql` 同步为 fail-closed，新装环境不再带着这个缺口。

落地与验证：已通过 Supabase 控制台 SQL Editor 执行完毕，验证语句返回 `users_without_profile = 0`；随后只读复查确认线上 `check_approved()` 函数体已是 fail-closed 版本。

遗留说明：被删号者若正处于已登录状态，其 access token 在过期前（Supabase 默认 1 小时）仍能通过 RLS 读写自己名下的数据，但**任何一次页面加载都会落到「等待审批」屏，功能页不再可用**；想进一步压缩这个窗口，可在 Supabase 控制台把 JWT 有效期调短。


## 2026-10-20 · 阅读课首版评审后的调整（下架 3D · 原文改可交互）

教师对首版逐条反馈：3D 场景「没有任何意义，很丑且没有内容」；原文截图希望可交互；思维导图希望融合笔译/口译笔记技巧；背诵一栏不好，想重做成「本文知识卡片」。按「被否掉的方向不再加码」处理，本轮先落地两条确定项，另两条转为讨论。

### 调整

- **下架 3D 场景**：删除 `docs/reading/scene3d.js`；数据层移除 `scene` 字段；装饰墙由 5 格改回 4 格（原文 / 文章大意 / 思维导图 / 背诵）；页面不再加载 Three.js CDN。
- **原文改为可交互原书图**：`docs/reading/app.js` 新增阅读器——滚轮缩放（以指针为中心）、拖动平移、工具条 ＋/−/⟲；整页图上按段落叠加热区，点热区或右侧条目即缩放定位到该段并高亮，右栏同步显示该段英文原文与原书放大图。热区坐标存于数据层 `sections[].hot`（相对整页的 0~1 比例）。
- **结构骨架搬家**：文章结构骨架从「原文」移入「文章大意」面板（更贴主题），原文面板专注交互读图。
- **背诵标记待重做**：`recite` 字段加注释说明「首版不好，将改为本文知识卡片」，UI 保留占位并明示待重做。

### 待讨论（暂不写码，等教师展开）

- 思维导图融合哪些**笔译/口译笔记技巧**（逻辑关系标记？符号缩写？主谓宾意群骨架？）——教师提出「详细分析一篇文章，慢慢来」。
- 「本文知识卡片」的口径与内容（由教案定义的学习点？考点？语块？）。

### 验证

Playwright 实测：装饰墙 4 格；原文面板热区 4 个 / 侧栏条目 4 条，点「Michael Jordan」后 transform 缩放定位生效、热区高亮、详情正确；控制台零报错。`check_all.sh` 通过（37 passed / 5 flaky）。未提交 / 未推送。

## 2026-10-20 · 阅读课「结构」面板收敛（笔记法落地 · 一屏一主视觉）

教师反馈页面「乱七八糟」，追问「分段小导图和复述骨架都要留吗、提纲怎么结合」。诊断：同一副骨架被摆了四遍（分段小导图 / 整篇汇总图 / 骨架条 / 文章大意里的结构清单）。定调做减法——一屏一个主视觉，切换而非堆叠。

### 调整

- 装饰墙第 3 格由「思维导图」改为「**结构**」，副标题「提纲 · 导图 / 笔记两种摆法」。
- 结构面板（新 `panelStruct` / `bindStruct` / `mountStruct`）三件套：
  - **骨架导航条**（就是「全文提纲」）：`整篇骨架` + 4 个分段 chip，短标签取自数据层 `sections[].short`；它同时充当分段切换器。
  - **视图切换**：`导图`（放射状，背课文）/ `笔记`（竖排，听说 Part C 复述）——同一副骨架两种摆法。
  - 默认**只渲染整篇汇总导图**（面板内 svg 恰好 1 个）；点 chip 就地把主视觉换成该段小导图或该段笔记，四张小导图不再一起铺开。
- 「文章大意」面板删除结构骨架清单，只留主旨 + 每段大意，收敛到「读懂」层。
- 数据层：删除 `structure` 字段；每段新增 `short`（骨架 chip 短标签）与 `notes`（竖排笔记行 `{ lv, tree, txt, gloss }`），4 段共 18 行。
- 笔记法口径（与教师共同打磨中）：竖排、只记实词、符号代连接词（`→ ↳ ∵ ∴ ↑ ↓ ≠ w/ b/c e.g. esp. ! ? ×`）、缩进表层级；服务广东高考英语听说 Part C「故事复述」。

### 验证

Playwright 本地实测 13 项全过：装饰墙 4 格、骨架条 5 个 chip、默认仅 1 个 svg（无四图铺开）、点「郎平」切段仍 1 个 svg、笔记视图郎平段 7 行、切「整篇骨架」显示 4 段、控制台零报错。`check_static_site.sh` 与 `check_all.sh` 通过（42 passed）。未提交 / 未推送。

## 2026-10-20 · 阅读课「文章大意」改岗为「理解」（接入教辅问题链）

教师判断「文章大意」的内容（主旨 + 每段一句）已被「结构」面板的骨架/导图/笔记完全覆盖，正在权衡是留一个次要辅助面板还是干脆删掉。结论是**格子留、内容换**：装饰墙四格对应四个动作——读图 / **读懂** / 记住 / 查漏，砍掉「读懂」这一格，学生就只剩记结构和背，「作者为什么这么写」无处落。

### 新增资料（本地库，不进仓库）

- `private/教材/高中英语阅读文本解读与教学指导1.pdf`（148 页扫描件，无文字层）——人教版必修一～三 + 选择性必修一～四「Reading and Thinking」的教师参考案例集，共七册，本册为必修第一册。每单元三节：文本解读 / 通用版教学案例 / 提高版教学案例。
- 已确认 `private/` 与 `*.pdf` 均在 `.gitignore` 内，不会进公开仓库。
- 页码换算：**印刷页 = PDF 页 − 5**。U3（Living Legends）＝印刷 60–82＝PDF 65–87。用 `pdftoppm -r 200 -png` + `tesseract -l chi_sim+eng` 逐页 OCR。

### U3 文本解读（教辅口径，已落进数据层）

- 体裁＝杂志文章，五个部件：标题（`Living Legends` 头韵）、导语、正文两个小标题、插图、末段补充信息（投稿邮箱，作用正是"判断体裁"）。
- 读法两步：先浏览图片/标题/版式预测内容 + 判断体裁；再抓导语关键词 `masters` / `set good examples` 串全文。
- 段落解读是**问题链**，每段 4～5 问，从内容 / 思维 / 语言三维问。
- 两段**讲述方式不同**（修正此前「互为镜像」的笼统说法）：郎平段走 `challenge—solution—result`（含三句 `As` 排比），乔丹段用一个过渡句把「球技」与「精神」两半接起来（题眼 `skills` vs `strength`）。

### 调整

- 装饰墙第 2 格「文章大意」→「**理解**」，副标题「问题链 · 作者为什么这么写」。
- `panelIdea` → `panelUnderstand`：读前 3 问 → 四段各自 4/5/5/1 问 → 读后 3 问（Putting it all together），共 21 问，用原生 `<details>` 承载，**答案默认折起**（先想再对）。底部加一条虚线折叠「读完再看：一句话主旨」，把主旨降级为读完后的定论，而不是开篇剧透。
- 移除「每段在说什么」四卡网格（与结构面板重复），连带清理 `.rc-gist*` / `.rc-mainidea` / `.rc-badge.accent` 等死样式。
- 数据层每段新增 `inquiry: [{ q, a }]`，顶层新增 `inquiry: { pre, post }`。

### 验证

Playwright 本地实测 12 项全过：第 2 格标签为「理解」、21 个折叠问题行 + 1 条主旨虚线行、点「Why is Lang Ping a master in her sport?」答案展开、旧四卡网格已消失、暗色主题可读、控制台零报错。`check_all.sh` 通过（42 passed）。未提交 / 未推送。

## 2026-10-20 · 独立子页共用底部 Dock（阅读课 + 跟读）

教师反馈：独立子页（阅读课、跟读）只有顶部返回，滚到页面深处后想换内容得滚回顶部，希望在底部加一条 Dock 方便随手切换。

### 方案

- **抽共享组件** `docs/shared/ui/dock.css` + `docs/shared/ui/dock.js`：
  - 样式沿用各页既有设计令牌（`--surface / --surface-3 / --border / --text-2 / --accent / --accent-bg`），两页令牌命名一致，故同一份 CSS 直接通用；带 `color-mix` 玻璃底、悬停放大 + 相邻跟随、标签气泡、激活小圆点，暗色主题自动跟随，跟读全屏跟写（`body.focus-mode`）时自动隐藏。
  - `dock.js` 是经典脚本（非 ESM），暴露 `SeeklumeDock.mount({ back, home, items, active })`，只负责渲染与高亮，跳转行为由各页传回调决定 → 同一个组件既能当「页内面板切换器」也能当「跨页导航」。
- **阅读课** `docs/reading/`：Dock = ↩返回 / 🏠首页 / 📖原文 / 💡理解 / 🧠结构 / 🗣️背诵。点面板入口打开并滚到面板位置，激活点跟随当前展开面板；Esc 收起、装饰墙点击、主题切换均同步 Dock 高亮。返回项：有展开面板时先收起，否则回上一页（无历史则回首页）。
- **跟读** `docs/read-along/`：Dock = ↩返回 / 🏠首页 / 📚书架 / ☀晨读 / 🎧跟读。返回项复用页面自己的 `#backLink` 回调；书架/晨读/跟读走 hash 路由（`#/`、`#/{bookId}/plan`、`#/{bookId}/{lessonId}`），激活点跟随当前视图（书架与目录都归「书架」）。

### 验证

`check_static_site.sh` OK；`node --check` 两个新增/改动 JS 通过。Playwright 实测（桩掉 Supabase，越过门禁）：阅读页 Dock 6 项、点「结构」→ 结构面板展开且 Dock 该项高亮、控制台零报错；跟读页 Dock 5 项、书架项默认高亮、点书架落到 `#/` 仍高亮、控制台零报错。未提交 / 未推送。

## 2026-10-20 · 课本原书截图 PNG → WebP（修复讲解页图片加载不出来）

教师反馈：U3 讲解页里「课本正文 p40（整页）」显示为裂图。

### 诊断

- 素材与部署都正常：本地 13 张 PNG 齐全、`src` 与文件名一一对应、均已随 `4cb8cf8` 提交；线上 `content-type: image/png`、`content-length: 562892`、字节与本地完全一致（`etag` `896cc`），PIL 可解码。
- 本地实测讲解页 9 张图全部加载成功；线上同样 9 张，响应也确实 200，但**单张耗时 26~47 秒**，等待 90 秒后 `naturalWidth` 仍为 0。
- 根因是带宽：本机到 GitHub Pages（Fastly）实测下行约 **25~50 KB/s**（对照小文件 9 KB/s）。U3 讲解页要拉 9 张原书截图、合计 **2498 KB**，浏览器等不到就中断 → 图上显示 alt 文字与裂图图标。
- 结论：不是代码问题，是**图太大 + 传输太慢**。

### 调整

- 13 张 PNG 全尺寸转 **WebP q85**（像素尺寸不变，文字一个点不缩），`3585 KB → 1154 KB`（32%）；U3 讲解页实际用到的 9 张 `2498 KB → 791 KB`。
- 同步引用路径：`textbook_grammar_notes.js`（9 处）、`textbook_reading_notes.js`（3 处）、`reading/app.js`（1 处）、`tests/smoke.spec.js` 的首图 `src` 断言（`.png` → `.webp`）。
- 删除原 PNG，不留重复素材。

### 验证

1:1 像素裁切对比过 q90/q85/q80/q70 与原图：q85 肉眼无法区分，q70 才见轻微压缩痕迹。`npm run check` 通过（42 passed）。本地 Playwright 实测讲解页 9 张 WebP 全部 `complete && naturalWidth>0`，尺寸与原图一致。未提交 / 未推送。

### 待办

- 首页封面墙 7 张 `grammar-fill/images/textbook-covers/*.jpg` 合计约 **6.3 MB**（单张 665~1210 KB），比这批截图还大，首屏同样会卡；建议下一轮一并转 WebP。

## 2026-10-20 · 阅读课改为「上课模式」：一屏把这篇上完 + 词根词缀讲解 + 离线副本

教师诉求：明天上课只投阅读课这一页，靠页内交互把 Reading and Thinking 上完；讲解每个段落时要是**精读**（结构 + 知识点 + 复述一并带走）；**词根、词缀必须有讲解**。

### 产出

- **`docs/reading/lesson.js`（新建，讲台逻辑）**：上课模式为 `position:fixed` 全屏覆盖层，`html.ls-on` 时隐藏 header / main / Dock，一屏一幕、`overflow:hidden`、关闭动画（页面静止，方便希沃白板批注）。21 步线性步进：开场 → 读前 3 问 → 认门（体裁五部件）→ 四段 × 四层 → 拼回去 → 作业。键盘 `← / → / 空格 / Enter / PageUp / PageDown` 步进、`1-9` 跳段、`Esc` 退出。`window.ReadingLesson.state` 暴露给测试。
- **逐段四层折叠**：固定顺序 **问（Ask）→ 构（Shape）→ 词（Words）→ 说（Say）**；已掀开的可回看，未到的是半透明 `locked`。
- **主视觉常驻**：左侧原书整页图按 1241/1754 比例 `fitFigure()` 定位，用 `translate + scale` 聚焦本段热区；进入段落后只在四层之间切换、不重算 transform，故白板上写的批注不会错位；另给「看整页 / 聚焦本段」手动切换。
- **词卡三拍（含词根词缀）**：猜（挖空课文原句）→ 翻（词条 + 词根 + 构词 + 词族 + 词块 + 注意 + 造句）→ 用。翻转用纯 CSS `flip` 类，非 3D。U3 共 **23 张词卡**（Intro 5 / Lang Ping 8 / Michael Jordan 8 + 单元增量词 2），分 `core` 与 `simple` 两档，`core` 卡带完整词根拆解（如 `termin-` 界限 → determine → determination）与来源角标（课本 p114 等）。
- **词缀总表**：11 条（`-ure / -ation / -ment / -y / -ed / -ful / -less / -able / -ship / -th / -ing`），每条含含义、例词、更多例词，收在「拼回去」幕作为词根词缀讲解的落点。
- **数据层 `docs/data/textbook_reading_notes.js`（扩充）**：新增 `genreParts`（标题/导语/主体/结尾/落款五部件）、每段 `translation` 中文译文、每段 `words` 词卡、`unitWords`、`affixTable`、`homework`（3 条人人做 + 3 个上位任务 + 四步写作支架）。
- **热区压字修复 `docs/reading/app.js`**：图上不再贴段落文字，只贴 ①②③④ 圆形编号（`translate(-50%,-50%)` 贴左上角外侧），段落名一律移到右侧列表 —— 图上**永不叠字**。
- **`scripts/build_reading_offline.mjs`（新建）**：把 CSS / JS / 图片（base64）全部内联成单个 HTML，产物 `private/课堂副本/阅读课-必修一-U3-RT.html`（`private/` 已 gitignore）。双击即开，不联网、不登录、不依赖 CDN。

### 关键决策

- **讲课与学生自学分离**：装饰墙保留为门厅（自学入口），讲台另起一份「上课模式」deck，互不干扰 —— 避免把同一副骨架摆两遍（教师长期偏好：一屏一主视觉、减法优先）。
- **词卡只精讲 `core`**：`simple` 卡只给释义与例句，不铺词根，控制一屏信息量；词根词缀的完整体系收在「词缀总表」一次性讲清，而非每张卡都塞。
- **主图不动、批注不错位**：transform 只在进入段落时算一次；这是为希沃白板批注专门做的取舍。

### 验证

- Playwright 逐幕截图核验：开场（整页原书）、读前 3 问、认门五部件、四段四层（含词卡翻面）、拼回去（整篇导图 / 全篇笔记 / 词卡网格 / 词缀总表）、作业三栏，视觉均正常。
- 一屏不滚动硬约束：逐步测量 `.ls-stage` 的 `scrollHeight - clientHeight` 与 `.ls-layer.open .ls-layer-body` 同名差值，**21 步全部为 0**。
  - **勘误（当日回填）**：该结论有误。量测脚本用 `state.idx = n` 直接跳步，而 `open()` 会把 `idx` 重置为 0，实际每步量的都是「开场」。改用键盘逐步步进后重测，**21 步中有 9 步溢出**（最重的是 Lang Ping 整段，`layer=448`）。已在下一条「原文当舞台 + 镜头推拉」改版中一并修掉。
- `bash scripts/check_all.sh` → `42 passed`、`OK: all engineering checks passed`。
- 离线副本断网验证：拦截所有非 `file://` 请求后打开，门禁未锁页、`steps=21`、主图 `imgIsDataUri=true`、**console 零报错**（本轮补内联 `dock.css` 与去掉 Google Fonts `@import` 后，此前两条 `ERR_FILE_NOT_FOUND` / `ERR_FAILED` 已消除）。
- 未提交 / 未推送。

### 待办

- 其余 34 个单元的讲解内容填充（本轮只做必修一 U3，教师明确「先从这个单元入手，以后再慢慢去调」）。
- 教材单元数量变多后是否需要册级 tab；练习套卷页是否补返回按钮。
- 课堂实测后的字号 / 节奏微调（教师已确认「后面我们再看」）。

## 2026-10-20 · 阅读课改版：原文当舞台 + 镜头推拉（推翻左图右栏）

教师反馈上一版「一下就跳过来，学生又看不到文本」，要求**核心是原文**，在上面做缩放、推拉等动态展示。据此重做舞台层，其余内容（数据、步进表、词卡、作业）沿用。

### 产出

- **舞台换架构（`docs/reading/index.html` + `lesson.js`）**：原书整页图从「左栏 46% 缩略图」改为**铺满整个舞台**，讲解内容变成右侧玻璃浮层（`backdrop-filter: blur(22px)`）**压**在原文上，原文全程不退场。
- **镜头系统**：段首（问）用整页定位 → 讲到构 / 词 / 说平滑推近本段（`ZOOM_SECTION = 1.5`，`.78s cubic-bezier`）；开场 / 读前 / 认门 / 拼回去 / 作业一律整页。手动入口：底栏「整页 / 本段 / − / ×N / ＋」，图上**点一下 = 下一步**、拖动 = 平移、滚轮 = 以指针为中心缩放，键盘 `W/A/S/D` 平移、`+/-` 缩放、`0` 整页、`F` 本段。
- **场景节点常驻**（`.ls-scene / .ls-figure / .ls-figstage / .ls-pagebox`）：`render()` 只替换 `.ls-v` 浮层，不重建图，`transform` 过渡才是连续的 —— 否则每步都是新元素，动画永远不触发。
- **起雾三档**：`full`（开场 / 认门 / 逐段全亮）、`tint-soft`（读前，原文 62%）、`tint-hard`（拼回去 / 作业，原文 28% + 2px 模糊当肌理）。保证「学生永远看得见文本」。
- **原文上每一段都能点**：整页图上给四段各铺一个热区（`hot` 比例坐标按原书重新校准），点到哪段镜头就去哪段的「问」；点当前段等于下一步，拖原文不会误触。这样「原文」不只是背景，而是导航本身。
- **词层改为一屏一个词**：8 张卡塞进浮层必撑破，改为聚焦卡 + 编号条（1–8）+ 上一个 / 下一个词；换词只换卡**不动镜头**，翻面才展开词根 / 构词 / 词族 / 词块 / 注意 / 用。全篇 23 张卡的总览仍在「拼回去 · 词卡网格」。
- **`scripts/build_reading_offline.mjs`**：补充内联本地样式表（`dock.css`）并去掉 Google Fonts `@import`，离线副本断网零报错。

### 关键决策

- **原文地位 = 舞台，不是配图**：教师明确「核心基础是原文」，所以宁可让浮层窄一点、让原文露出来，也不再把原文缩成缩略图。
- **只做「镜头」动画**：段落推拉 + 浮层淡入即可，不做逐元素入场 —— 课堂投屏要稳，动画多了反而干扰批注。
- **词卡逐个讲而不是整屏摊开**：8 张卡在 553px 宽的浮层里既装不下也看不清，逐个讲符合讲台节奏。

### 验证

- 逐幕截图（1366×768）核验：开场整页、读前浮层、认门五部件、段首整页定位、构 / 词 / 说推近本段、拼回去、作业，视觉均正常；`② Lang Ping · 问` 等整页定位屏的本段热区完整落在浮层左侧可见区（`hotVis=true`）。
- 一屏不滚动：21 步逐屏测量 `.ls-plate` / `.ls-layer.open .ls-layer-body` 的溢出与被裁内容，**全部为 0**。
- 交互功能测试 26 项通过：整页 ↔ 本段、± 缩放、`0/F/+/-/A` 快捷键、点段落热区跳段、点当前段/空白处翻页、拖原文不误触、编号跳词、换词不动镜头、`Esc` 退出；console 零报错（`gate.js` / `cloud.js` 为测试主动拦截，属预期）。
- 离线副本断网验证：`steps=21`、主图 `naturalWidth=1241`、零报错。
- `bash scripts/check_all.sh` → `41 passed, 1 flaky`（既有的 admin view-as 用例）+ 全部工程检查 `OK`。

### 修复

- `html.ls-on header{display:none}` 误伤浮层标题（`.ls-plate-head` 也是 `<header>`）→ 收窄为 `body > header`；同时把页面顶栏样式由 `header{}` 限定为 `body > header{}`，避免 `height:48px` 压扁浮层头部。
- `render()` 写入的色调类名为 `soft` / `hard`，与 CSS 的 `.tint-soft` / `.tint-hard` 不匹配 → 三档压暗此前从未生效，已改为带前缀。
- `.ls-layer.open` 用 `flex:1 1 auto` 时，open 层不肯收缩导致 4 条层头挤出浮层 10px → 改 `flex:1 1 0`。
- 词卡正面整城塌在顶部、下半屏全空（教师嫌「干」）→ 正面加 `.ls-card-mid` 垂直居中，句子放大到 21px，补一行「首字母 x · 共 n 个字母」的猜词提示（由 `cd.w` 现算），底部保留「点一下 → 词条」。

### 待办

- 其余 34 个单元的讲解内容填充（本轮只做必修一 U3，教师明确「先从这个单元入手，以后再慢慢去调」）。
- 教材单元数量变多后是否需要册级 tab；练习套卷页是否补返回按钮。
- 课堂实测后的字号 / 节奏微调（教师已确认「后面我们再看」）。

## 2026-10-20 · 新增独立「口译笔记法」方法模块：U2 可交互课本 + 四原则 + 锚句

教师诉求：明天要讲**口译笔记法**（用速记笔记帮学生背课文），要求把 **U2《Travel Peru》课本截图做成可交互**，把已写好的方法草案搬上站，并定一个落点（「具体放哪呢」）。

### 产出

- **`docs/assets/textbook/bx1/u2-rt-p26-page.webp` / `u2-rt-p27-page.webp`（新建）**：从 `private/教材/人教版·英语必修 第一册.pdf` 的 PDF 33–34 页（印刷页 26–27）以 150dpi 渲染，`cwebp -q 80` 压缩（247 / 213 KB），尺寸 1241×1754 与既有 U3 整页图一致。
- **`docs/data/interpreting_notes_method.js`（新建，方法层）**：与 `textbook_reading_notes.js`（逐篇）平行的另一层，讲「笔记这套方法本身怎么写」。含 `rules`（三条铁律）、`branch`（**分叉四原则**：按问题切 / 同级同质 / 一分支一动作 / 同级 3–5 个 + 反面「不是每段都要分叉」）、`lang`（什么时候写英文、什么时候写中文）、`anchor`（**锚句定义·选法·上限·与重点句型不可互推**）、`symbols`（15 个符号 + 缩写规则）、`check`（自检判据）、`template`（学生双栏纸），以及 `demoU2`（六块：label/role/gist/hot/notes/anchors/en/zh + `mold` 四线路模具 + 课堂动作）与 `demoU3`（嵌套升级、骨架、真缺陷、课堂动作）。
- **`docs/methods/notes-method.html` + `notes-method.js`（新建，独立方法页）**：装饰墙 5 个入口（原理 / 怎么切 / 符号表 / U2 示范 / U3 迁移），底栏复用共享 Dock（`../shared/ui/dock.js`），门禁沿用 `../shared/gate.js`。
  - **可交互课本**：p26 / p27 双页签 + 滚轮缩放 + 拖动平移 + 复位；六段热区（`hot` 比例坐标，`align-items:start` 保证整页图比例不被拉伸）；点热区或右侧条目 → **自动换页并放大到该段**，右栏同步给出「口译笔记」与「原文锚句」。
  - **逐块双栏**：左=学生要自己写出的笔记（带 gloss 释义），右=原文锚句；含「对不上时展开整段原文 / 译文对照」。
  - U3 迁移面板的成品笔记**直接读 `TEXTBOOK_READING_NOTES['必修一|U3|RT']`**，不复制一份，保证单一来源。
- **`docs/index.html`（改）**：首页「选择学习方式」新增第 4 个入口 `Method · Across Units / 口译笔记法`，与 Shadow Reading、课本语法、阅读课并列；同时把 `.panel` 由绝对定位改为 `panel-stage` 内的 grid 叠层（`grid-area:1/1`），由内容撑高舞台，避免 4 个入口在矮视口下溢出、压住下方圆点。
- **`docs/reading/index.html`（改）**：入口放在装饰墙下方（不放在「上课模式」按钮下），文案 `🖊 口译笔记法 · 跨单元方法（U2 示范 / U3 迁移）`，指向 `../methods/notes-method.html`，避免被读成 U3 课文的一部分。

### 关键决策

- **落点＝独立的 `methods/` 方法模块（教师纠正后定稿）**：初版放在 `reading/notes-method.html`，被教师指出「这是一个单独的技巧，不应该下属于 U3 课文」。笔记法是跨单元、跨篇目的**方法**，与「阅读课（一篇课文怎么上）」是两层东西，故物理迁到 `docs/methods/`，并在首页占一个并列入口；阅读课页只保留一个「跨单元方法」的指路链接，且放在装饰墙下方而非上课模式按钮下。
- **U2 只进方法页、不进阅读课数据层**：阅读课「上课模式」（`lesson.js`）是单页整页图驱动，U2 跨两页会牵动共享 reader；本轮不动 `textbook_reading_notes.js` 与 `app.js`，避免碰 U3 已验收的链路。
- **教师口头讲的四原则（分叉四条）本轮落进数据层**：此前只存在于对话里，草案未写。
- **缺陷当教材**：U3 郎平段「一层挂 6 个不同质分支」写成 `flaw` 的改前/改后对照，直接对应第 ② ④ 条原则。

### 验证

- 临时 Playwright 实测（脚本用完即删）：5 个装饰墙入口；U2 面板 6 个条目 / 首屏 3 个热区 / 6 组双栏；点热区高亮 + 详情出锚句；点跨页第 4 段自动切到 p27 且热区变 3 个；放大→复位 transform 变化；U3 面板取到 4 段成品笔记；console 与 pageerror 零报错。截图核对两页热区与课本卡片（①②③④⑤⑥）贴合。
- 迁移到 `methods/` 后复测：首页 4 个入口在 1440×768 / 1440×900 / 1366×700 三档视口下均完整显示、不与圆点重叠（`panel-stage` 高 578，末个入口底边落在舞台内）。
- `bash scripts/check_static_site.sh` → `OK: static site release checks passed`；`bash scripts/check_browser_smoke.sh` → `42 passed`。
- 未提交 / 未推送。

### 待办

- 讲义落点（打印给学生）未定；背诵颗粒度（背整段 vs 只背锚句）未定。
- 若日后要 U2 也走阅读课「上课模式」，需把整页图从单张改为按页数组（`app.js` / `lesson.js` 的 `PAGE_IMG` 硬编码）。

*此日志随项目推进持续更新。最后更新：2026-10-20*
