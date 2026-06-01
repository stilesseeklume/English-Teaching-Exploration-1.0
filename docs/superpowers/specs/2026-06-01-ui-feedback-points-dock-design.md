# 设计：考点导航去重 + 迁移可读性优化（用户反馈 5 点）

> 日期：2026-06-01
> 分支：`feat/ui-feedback-points-dock`（off `main`@daa9014）
> 起因：组长线上试用语法填空，反馈"迁移逻辑好很多、真的可以用了"，同时提 5 点改进。

## 背景

语法填空已上线 seeklume.work，迁移训练刚从粗 `fine_category` 升级到新 `points` 体系（which→which）。
本轮是上线后的可读性 / 信息架构优化，不动迁移引擎本身。

涉及"考点浏览"的入口现在有**三代叠加**，互相重复：

| 入口 | 数据口径 | 粒度 | 能点进题 |
|---|---|---|---|
| 考点分类训练 (dock) | `q.category` | 粗 · 11 类 | ✅ |
| 知识库 · 考点视图 | `q.fine_category` | 细 · 102 tag（网格/文字） | ✅ |
| 知识库 · 全局图谱(决策地图) | `q.points`(新) | 最细 · 按做题导向 + 迁移 | ✅ |

决策地图（`renderSystemView`，🌐 全局图谱按钮）是最新、唯一基于 `points`、且和迁移口径一致的入口。考点视图是同一份内容的**文字网格呈现**。两者只是"图 vs 文字"两种皮，内容等价。

## 五点改动

### 1. 决策地图徽章显示"模拟"计数

**现状**：[index.html:5324](../../grammar-fill/index.html) 徽章 `(c.real < qn) ? (qn + ' 题 · 真题' + c.real) : (qn + ' 题')`，只印 `真题N`，模拟题被静默并入总数。

**改动**：`c` 由 `countByPoint`/`countByFineTag` 返回 `{bank, error, real, total}`，其中 `total = bank + error`，`real` = bank 中 `type==='真题'` 数。
- 模拟数 = `bank - real`（bank 中非真题即模拟卷）
- 错题数 = `error`
- 徽章格式：`12 题 · 真题5 · 模拟7`；若有错题再补 `· 错题N`；全部为真题时维持 `N 题`。

**同口径修一处**：知识库考点视图（`buildFineCategoryViewModel`，[knowledge-view-model.js:395+](../../grammar-fill/modules/knowledge-view-model.js)）的 `countText` 现在也是 `total · 真题real`，同样补 `模拟`。

### 2. 迁移页标题改面包屑（显示具体考点）

**根因**：从决策地图叶子点「迁移训练」→ `startByPointFromMap(tag,keys)` → `startByPoint` → `buildPointPracticePlan`（[category-rules.js:201](../../grammar-fill/modules/category-rules.js)）把页面 `currentExam.source` 写死成**粗类** `getCategorySourceText` → "按考点 · 谓语动词"。所以无论点哪个叶子，标题都只显示粗类。

**改动**：让迁移入口携带"考点层级标签"，页面标题显示完整面包屑：

```
按考点 · 谓语动词 · 时态 · 一般现在时
```

- 决策地图叶子已知自己的 `title`（如"一般现在时"）+ 祖先链（时态 ← 谓语动词）。`startByPointFromMap` 增加一个 `breadcrumb`（或 label）参数，向下传到 `buildPointPracticePlan`，由它写入 `currentExam.source`。
- 词 chip 进入（`startByPointFromMap(tag,[word])`）时，面包屑末段用具体词（如"冠词 · a/an · a"）。
- 文字视图（考点视图）点 fine tag 进入（`startByFineTag`）时，面包屑用「粗类 · fine tag 名」。
- 兜底：拿不到层级时退回现有粗类标题，不报错。

**范围**：本点只改"页面标题"。每题旁挂 chip 是更大改动，本轮不做（设计讨论时已排除）。

### 3. 删讲题舞台的"图谱" tab（局部图谱）

**现状**：讲题舞台底部 tab 为 讲题/迁移/图谱（[app-state.js:1197-1201](../../grammar-fill/modules/app-state.js)），"图谱"渲染 per-question 知识思维导图（`teachingKnowledgeHtml`，[teaching-render.js:93](../../grammar-fill/modules/teaching-render.js)；view-model 在 teaching-view-model.js）。

**改动**：删掉"图谱" tab，讲题舞台只剩 讲题/迁移。
- `app-state.js` tabButtons 去掉 `{key:'knowledge', label:'图谱'}`。
- 删 `teachingKnowledgeHtml` 及其在 index.html 的调用 `buildTeachingKnowledgeHtml`、`setTeachingTab('knowledge')` 分支、相关 view-model（teaching-view-model.js 里 `kicker:'知识思维导图'` 那套 `center/locatorLabel/上级/同级分支` 构建）。
- 清理 CSS（mindmap-* 类若仅此处用）与无用导出。

**与并行分支**：`refactor/remove-migration-mindmap-tab`@5237474 删过同一处（`TEACHING_GRAMMAR_MINDMAPS`），但和本批改同文件会冲突。决定**在本分支干净重删**，不合并旧分支；旧分支事后废弃。

### 4. 知识库每次进入默认全局图谱

**根因**：`renderKnowledgePage`（[index.html:5705](../../grammar-fill/index.html)）末尾已 `setKnowledgeView('system')`，但该函数只在 init 跑一次（[index.html:1677](../../grammar-fill/index.html)）；默认 state `currentKnowledgeView='map'`（[index.html:632](../../grammar-fill/index.html)）。重进知识库会停在上次视图（如知识地图）。

**改动**：进入知识库页时每次强制 `setKnowledgeView('system')`。在 `switchPage('knowledge')` 流程（[index.html:2469](../../grammar-fill/index.html)）里，切到 knowledge 页时调用强制默认视图，而非依赖一次性的 init。

> 注意：第 5 点会把 全局图谱/考点视图 移出知识库。届时知识库默认视图应改为剩余视图里的合理项（书本速查或教材视图）。第 4 点与第 5 点的"默认视图"需协同——见下方实现顺序。

### 5. dock 合并「考点训练」（图/文字双视图），知识库瘦身

**目标**：消除三代重复入口，把考点训练升为顶层、口径统一到 `points`/决策地图。

**改动**：
- **dock**：把现有 `考点分类训练`（粗 11 类，`navigateHome('categories')` → `renderHomeCategories`）**替换**为 `考点训练`。
- **考点训练页**：带「图 / 文字」切换：
  - **图**（默认）= 决策地图（复用 `renderSystemView`）。叶子→迁移。
  - **文字** = 考点视图（复用 `renderFineCategoryView`）。fine tag→点进题。
- **知识库瘦身**：移除 🌐全局图谱、🏷️考点视图 两个 view 按钮，只留 📖书本速查 / 📚教材视图 / 🗺知识地图（纯"查"类）。知识库默认视图改为 `book`（书本速查）或 `textbook`。
- **退役**：粗 11 类落地页（`renderHomeCategories` + `HOME_CATEGORY_SECTIONS` + `startByCategory` 入口）消失——**已与用户确认可接受**。`buildHomeCategoryModel` 等若无其他引用一并清理；`startByCategory`/`buildCategoryPracticePlan` 若仅此处用则删，保留供文字视图/迁移用的 `buildPointPracticePlan`、`buildFineTagPracticePlan`。

**实现策略（最小 churn）**：
- 复用现有两个渲染函数，不重写。新建一个"考点训练"页壳（可以是新的 page key，如 `points-training`，或复用 knowledge 页壳但只暴露图/文字两个按钮）。
- 倾向：新增独立 page `points-training`，顶部仅 图/文字 两个 toggle 按钮，body 调用 `renderSystemView` / `renderFineCategoryView`。这样知识库页和考点训练页职责清晰、互不污染。
- dock 模型（app-state.js 的 dock 定义 + index.html dock HTML [~5999](../../grammar-fill/index.html)）把 `categories` 项改 `points-training`，label「考点训练」。
- 返回/back 导航、`getPracticeEntryPreviousView`、syncAppState 等需把新 page 纳入。

## 实现顺序（建议）

1. 第 1 点（徽章，独立小改）
2. 第 2 点（面包屑，独立）
3. 第 3 点（删图谱 tab，独立删除）
4. 第 5 点（dock 考点训练页 + 知识库瘦身）—— 改动最大，含 page 新增 + 视图迁移 + 退役粗分类
5. 第 4 点（知识库默认视图）—— 放第 5 点之后，因为第 5 点改变了知识库剩余视图集合，默认视图随之确定

## 验证

- `npm run check`（lint）全绿
- 既有 smoke 全过；为第 1、2 点的新口径补 / 改 smoke（徽章字符串、面包屑标题）
- 手动（preview）：
  - 决策地图叶子徽章显示 真题/模拟
  - 点叶子迁移 → 标题面包屑正确（叶子/词 chip/文字视图三条路径）
  - 讲题舞台只剩 讲题/迁移，无图谱
  - 知识库无 全局图谱/考点视图 按钮，默认落书本速查/教材
  - dock「考点训练」→ 图/文字 切换，图=决策地图、文字=考点视图，二者都能点进题

## 不做（YAGNI）

- 每题旁挂考点 chip（仅改页面标题）
- 重写决策地图/考点视图渲染（复用现有）
- 合并 `refactor/remove-migration-mindmap-tab` 旧分支（重删代替）
- 考点视图文字口径从 `fine_category` 升级到 `points`（本轮保持现状，作为留后）
