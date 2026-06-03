# 设计：删除"教材视图（视图B / 书本速查）"功能

> 日期：2026-06-03
> 性质：产品精简（从源头删臃肿功能），非代码搬迁
> 状态：待用户复核

## 背景与动机

知识库当前用三种视图展示同一批语法知识：视图A 考点视图、视图B 教材视图（书本速查）、视图C 全局图谱。用户判断"整个三视图臃肿"，决定**砍掉视图B 教材视图**，保留考点视图(A) + 全局图谱(C)。

与其把臃肿的视图代码搬进模块，不如从源头删除——少 ~500 行、且考点视图/图谱不受影响。

## 目标

- 删除教材视图（书本速查）这一知识视图及其所有 UI、视图模型、状态、入口、暗线导航。
- 知识页默认视图从"书本速查"改为**"考点视图"**。
- 严格保护：首页教材墙装饰、`textbook_units` 数据、迁移训练的教材单元标签。
- smoke 全绿（更新任何点教材视图的用例）。

## 删除清单（仅视图B 专属）

### index.html
- `视图 B · 教材视图` 段：renderTextbookView, renderBookDetail, setTextbookViewMode, getTextbookViewModeSnapshot/apply, openTextbookModal, closeTextbookModal, _onTextbookModalKey 及其薄壳/导出（含 1735 行 `openTextbookModal:` 导出）。
- `教材 unit 操作` 段：openUnitQuestionList, openUnitErrorList, setUnitMiniFilter, _showUnitQuestionsMiniModal, _closeUnitMiniModal, _onUnitMiniKey, _gotoUnitQuestion 及相关状态（_unitMiniContext/_unitMiniModalTimer）。
- 知识切换按钮：第 307 行 `<button id="knowledgeBookBtn" onclick="setKnowledgeView('book')">📖 书本速查</button>` 删除。
- `setKnowledgeView` 内 `'book'` 分支删除；默认视图改为 `'category'`（考点视图）。第 5160/5187 行对 knowledgeBookBtn 的 class 操作删除。
- 抽屉返回暗线：第 4221–4222 行 `if (returnPlan.shouldOpenTextbookModal) openTextbookModal(returnPlan.book);` 删除。
- 教材视图/modal 的 HTML 容器标记（textbook 容器、textbook-modal 等）。

### modules/knowledge-view-model.js
- 教材专属构造器：buildTextbookModel, buildTextbookUnitModel, groupTextbookUnitsByBook, buildTextbookModalModel, buildTextbookModalViewModel, buildTextbookModalOpenPlan, buildTextbookModeToggleModel，及封面图映射（第 10–16 行 textbook-covers 映射，**仅此视图用的那份**）。
- 第 893 行 `shouldOpenTextbookModal: !!matchUnit` 改为恒 false 或删除该字段（连同 index.html 4221 消费端）。
- 第 1375 行视图切换配置去掉 `{ view: 'book', elementId: 'knowledgeBookBtn' }`；确认默认/回退视图为 category。

### modules/home-dashboard-model.js
- 第 132–133 行动作步骤 `{ kind:'set-knowledge-view', view:'textbook' }` + `{ kind:'open-textbook-modal' }` 删除（其所属的 dashboard action 若整条仅为打开教材视图，则整条删除；若该 action 还有别的用途，仅删这两步）。
- **不要碰** getTextbookGallery / getTextbookSectionModel / COVER_MAP / BOOK_ORDER（这些是首页装饰墙，见保护清单）。

### modules/home-dashboard.js
- runHomeDashboardAction 内 `set-knowledge-view` / `open-textbook-modal` 两个 runStep 分支删除（删视图后无触发者）。

### modules/app-state.js
- 教材视图模式状态：_textbookViewMode 及 buildTextbookViewModeState 等（仅视图B 用）。逐一确认无其他消费者后删除。

### styles.css
- 教材视图、教材画廊、textbook-modal、unit-mini-modal 相关样式块。

### tests/
- 任何打开/断言教材视图（书本速查、textbook modal、unit mini modal）的 smoke 用例：删除或改为断言"考点视图为默认"。

## 保护清单（绝不修改）

- 🛡️ **首页教材墙装饰**：`home-dashboard-model.js` 的 getTextbookGallery / getTextbookSectionModel / COVER_MAP / BOOK_ORDER；`home-render.js` 的 textbookSection 渲染段（纯装饰、不可点、其 descriptionText 已声明"仅作封面展示"）。它与视图B 各有一份封面图，物理独立。
- 🛡️ **textbook_units 数据**：`data/grammar_fine_tags.js` 的 textbook_units；`question-model.js` 第 75 行 `textbook_units: tagToUnits[fineCategory]`。
- 🛡️ **迁移训练教材标签**：`migration-training.js` 的 formatTextbookUnitLabel 及其调用——老师仍能看到"考点出自 必修X Unit Y"。

## 关键设计决策

1. **新默认知识视图 = 考点视图（category）**。原默认是书本速查；删除后知识页首次进入展示考点视图。（若用户更想默认图谱，改为 'map'/'graph'。）
2. **数据与视图分离**：删的是"展示教材的 UI"，留的是"题目/考点带教材单元标签的数据"。判定依据：migration 的 formatTextbookUnitLabel 读 textbook_units 与视图无关。
3. **暗线导航就地中和**：所有"自动跳去教材 modal"的路径（首页动作、抽屉返回）随视图一并移除，不留断头点击。

## 验证策略

- 每删一处跑 `npm run test:smoke`，必须保持全绿（当前 33）。
- 重点人工/截图核对：
  - 知识页默认进入 = 考点视图，三个切换按钮里**没有**"书本速查"，剩考点 + 图谱两个且能正常切换。
  - 首页教材墙装饰**照常显示**（封面图在、布局不变）。
  - 迁移训练里"教材单元标签"照常显示。
  - 考点视图、全局图谱功能不受影响。
- 走既定流程：feature 分支 → main → push → GitHub Pages。

## 风险与缓解

| 风险 | 缓解 |
|------|------|
| 误删首页装饰墙 | 保护清单显式列出 home-dashboard-model/home-render 的装饰函数；删除时不碰这些文件的装饰段 |
| 删后知识页默认视图为空/报错 | 改默认为 category，并核对 setKnowledgeView 回退逻辑、初始 active 按钮 |
| textbook_units 被连带删致迁移标签断 | 保护清单显式保留数据 + formatTextbookUnitLabel；smoke + 人工核对迁移标签 |
| 残留断头：暗线仍调已删函数 | 删除时同步清理 893/4221/132-133 等所有 open-textbook 调用点；grep 复查 openTextbookModal 零残留 |
| smoke 用例点教材视图致失败 | 同步更新/删除相关用例，改断言默认考点视图 |

## 净效果

index.html 减 ~400 行 + knowledge-view-model 减 ~130 行 + 各处清理；知识库简化为 考点视图 + 图谱两视图；首页装饰、教材数据标签、考点/图谱功能全部不受影响。
