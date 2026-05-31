# 知识库导航精细化 · 设计文档

> 日期：2026-05-31
> 模块：`docs/grammar-fill/`
> 起因：组长 / 用户反馈五条 —— 图谱迁移训练不按分支、图谱缺全展开与搜索、书本速查跳转不精准、tab 顺序、迁移训练题量固定 6。

## 背景与现状

知识库（语法填空）有五个视图，tab 定义在 `index.html:3843-3847`：
教材视图(`textbook`) / 考点视图(`fine-cat`) / 知识地图(`map`) / 全局图谱(`system`) / 书本速查(`book`)。

- **全局图谱** = 做题决策地图，`renderSystemView()`（index.html:8831），数据源 `window.GRAMMAR_DECISION_MAP`（`data/decision_map.js`）。逐层 `dmExpanded` 下钻；叶子节点带 `cat`（粗类别）和 `fine`（细考点 tag）。
- **书本速查** = `selectKnowledgeCategory(key)`（index.html:9375），按 `KNOWLEDGE_DATA[cat]` 渲染讲解，section 默认 `collapsed`，有 `toggleSubsection(key)`。
- **迁移训练**（讲题抽屉）= `getMigrationData()`（index.html:7463）写死 `limit:6`，`selectMigrationItems()`（migration-training.js:64）截断。
- 细 tag 体系 `data/grammar_fine_tags.js`：题目 `q.fine_category` 对齐 tag id。

## 五项改造

### 1. 图谱叶子按细分支精准迁移

**根因**：叶子题数用 `_countByFineTag(fine)` 计（细 tag），但「迁移训练」按钮 `startMigrationFromMap(cat)` 传粗类别 → `startByCategory` → `buildCategoryPracticePlan` 取整个粗类别全部题。维度不一致。

**改法**：
- `category-rules.js` 新增 `buildFineTagPracticePlan(fine, allQuestions, categoryMap)`：按 `q.fine_category === fine` 筛题构建练习计划。复用 `buildCategoryPracticeEntryModel` 的输出结构。
- `index.html` 新增 `startByFineTag(fine)`，与 `startByCategory` 同构（resetPracticeDisplayState → applyPracticeContextState → switchPage('practice') → renderExam）。
- `startMigrationFromMap` 改签名为 `startMigrationFromMap(fine)`，调用 `startByFineTag(fine)`。
- 叶子渲染（index.html:8893）按钮改为传 `n.fine`。**0 题的细分支沿用现有 `qn>0` 判断，不显示迁移按钮（灰掉不可点），无需粗类别回退。**

`decision_map.js` 数据无需改（每个叶子已有 `fine`）。

**地基现状（2026-05-31 体检）**：`grammar_bank.js` 共约 190 题 / 380 个空，`fine_category` 无空值、无格式错；但 107 个定义的细 tag 中**只有 28 个真有题**，其余 79 个细分支为空，4 个 ≤2 题。

**预期行为（非 bug）**：精准化后，全局图谱里大多数细分支叶子会**正确地不显示迁移按钮**（107 中仅 28 个有题）。这是"准 > 多"的必然代价，符合"迁移不能出问题"的优先级；随题库增长覆盖自然变厚。有题的 28 个分支平均 ~7 题，迁移结果可信。

**上线前地基校对任务**：grep 只能验"非空 + 格式对"，验不了"标得对不对"。上线精准迁移前，对这 28 个 populated fine tag 做一次标注抽查——逐题核对 `句子 ↔ fine_category` 是否吻合，列出可疑项给用户确认后修正。参考 `docs/planning/bank-correctness-audit.md`。误标（非空但标错）是精准迁移的最后一道风险关。

### 2. 全局图谱：一键全展开 + 搜索定位 + 触控板优化

**2a 一键全展开/全收起**：HUD 加按钮。全展开 = 遍历 `full.childrenOf` 把所有有子节点的 id 写入 `dmExpanded` 后 `renderSystemView()` + `dmFit()`；按钮 toggle 成「全收起」= `dmResetView()`。

**2b 搜索定位**（自动展开 + 聚焦）：
- 地图顶部加搜索框 `<input id="dmSearch" oninput="dmSearch(this.value)">` + 结果列表容器。
- `dmSearch(q)`：对 `full.byId` 全部节点按 `title` 模糊匹配（不分大小写、忽略空格），输出前若干条结果列表。
- 点结果（或唯一命中）→ `dmRevealNode(id)`：沿 `parent` 链把祖先全部写入 `dmExpanded` → `renderSystemView(id)` → `dmFocus(id, true)` 平移聚焦 + 高亮。

**2c 触控板/鼠标体验**（双指滑=平移、捏合=缩放）：
- 改 `wheel` 监听：`e.ctrlKey`（触控板捏合手势浏览器带 ctrlKey）→ `dmZoom`（以光标为锚点）；否则 → 平移 `dmCam.tx -= e.deltaX; dmCam.ty -= e.deltaY`。
- 鼠标滚轮（无 ctrlKey、deltaX≈0）默认走平移；为保留鼠标缩放，可在 HUD ＋/－ 已有。**取舍**：纯滚轮用户失去滚轮缩放，但有 ＋/－ 按钮兜底，且捏合仍缩放——符合「双指滑=平移」的明确选择。

### 3. 书本速查跳转更精准（两者都要）

**改法**：
- `decision_map.js`：在中间父节点（如 `pred_tense`、`pred_voice`、`pred_sva`）补 `kd` 字段，指向 `KNOWLEDGE_DATA` 的 section key（如 `predicate-tense`）。细 tag 比讲解 section 更细，按父节点映射最稳定。
- `openKnowledgePoint(cat, section)` 接收可选 `section` → `selectKnowledgeCategory(cat)` 渲染后，若有 section 则 `toggleSubsection(section)` 展开 + 该元素 `scrollIntoView({block:'start',behavior:'smooth'})`。
- 叶子从 `n` 取 `kd`（叶子自身无则向上找父节点的 `kd`）传给「📖 看讲解」。
- 叶子同时保留「🔁 迁移训练」（看题）+「📖 看讲解」（跳讲解定位）两个入口。

### 4. tab 顺序调整

`index.html:3843-3847` 改为：
🌐 全局图谱 → 📖 书本速查 → 📚 教材视图 → 🏷️ 考点视图 → 🗺 知识地图。
默认视图保持全局图谱（`setKnowledgeView('system')` 默认逻辑不动，index.html:9280）。

### 5. 迁移训练不局限 6 道（默认 6 + 显示全部）

**改法**：
- 新增状态 `migrationShowAll`（默认 false）。
- `getMigrationData`：`limit` = `migrationShowAll ? <池子全长> : 6`（全长可传一个足够大的数，或 `selectMigrationItems` 支持 `limit` 为 0/Infinity 表示不截断）。
- `migration-training.js` 的 `buildMigrationContentViewModel`（或 `migrationDrawerHtml` 输入模型）暴露 `totalCount`，当 `totalCount > 6` 时渲染底部按钮：未展开「显示全部 N 题」/ 已展开「收起，只看 6 题」。
- 点按钮 → toggle `migrationShowAll` → 重渲染抽屉。

## 影响文件清单

| 文件 | 改动 |
|------|------|
| `index.html` | tab 顺序、`startByFineTag`、`startMigrationFromMap`、`openKnowledgePoint`、`renderSystemView`（HUD/搜索/wheel）、`dmSearch`/`dmRevealNode`/全展开、迁移抽屉按钮接线、`migrationShowAll` 状态 |
| `modules/category-rules.js` | `buildFineTagPracticePlan` |
| `modules/migration-training.js` | `selectMigrationItems` 支持不截断、视图模型暴露 totalCount + 显示全部按钮模型 |
| `modules/teaching-render.js`（迁移抽屉 HTML 所在） | 渲染「显示全部 / 收起」按钮 |
| `data/decision_map.js` | 父节点补 `kd` section 映射 |

## 不做（YAGNI）

- 不改 `decision_map.js` 叶子的 `fine`（已存在）。
- 不改默认进入视图。
- 不对 0 题细分支做粗类别回退（直接不显示按钮）。
- 不重构 legacy `_legacyRenderGlobalGraphSvg`（已废弃路径，不动）。
- **不做题目向量化 / 语义迁移**（embedding）。结论：句向量会按"话题"聚类而非"语法点"，对语法填空是错误的相似性轴；且题库随上传增长，embedding 非一次性投入。tag 是地基，向量最多是未来 Sprint 2/3 的"排序补充"而非替换。本批坚持确定性的 tag 精准过滤。

## 验证

- 需求1：点「谓语动词→主谓一致→语法形式一致」叶子的迁移训练，练习题应只含 `fine_category==='pred-sva-form'` 的题，数量 = 叶子显示的题数。
- 需求2：全展开后所有叶子可见；搜索「定语从句」聚焦高亮对应节点并展开路径；Mac 触控板双指滑动平移、捏合缩放。
- 需求3：从叶子点「看讲解」，书本速查打开对应 section 且自动展开 + 滚动到位。
- 需求4：tab 第一二位为全局图谱、书本速查。
- 需求5：迁移抽屉池子 >6 时出现「显示全部」，点开列出全部、可收起。
- 地基校对：28 个 populated fine tag 抽查报告产出，可疑项已确认/修正，再上线精准迁移。
