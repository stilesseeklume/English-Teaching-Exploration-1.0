# 设计：删除"教材视图（📚 textbook）"功能

> 日期：2026-06-03
> 性质：产品精简（从源头删臃肿功能），非代码搬迁
> 状态：待用户复核（已据真实结构勘察修正）

## 背景与真实结构

知识库相关视图实际散在**两个页面**，比"三视图"复杂：

| 页面 | 视图按钮 | view 值 → 渲染 | 默认 |
|------|---------|---------------|------|
| **知识库** | 📖 书本速查 / 📚 教材视图 / 🗺 知识地图 | book→selectKnowledgeCategory(带 sidebar) / textbook→renderTextbookView / map→renderKnowledgeMap | 🗺 知识地图（`renderKnowledgePage` 进来即 `setKnowledgeView('map')`）|
| **考点训练** | 🌐 图谱 / 🏷️ 文字 | graph→renderSystemView(决策地图) / text→renderFineCategoryView | 🌐 图谱 |

> 注：`renderSystemView`、`renderFineCategoryView` 由**考点训练页**驱动，**不是死代码**，绝不能删。知识库页早已默认 🗺 知识地图（静态 HTML 上 book 带 active 是会被渲染覆盖的旧痕）。

## 目标（最小改动）

- 仅删除 **📚 教材视图（`textbook`）** 这一个知识库视图及其专属 UI / 视图模型 / 状态 / 暗线导航。
- **默认视图不变**（知识库页保持默认 🗺 知识地图）。
- 知识库页删后剩 📖 书本速查 + 🗺 知识地图 两个按钮。
- 严格保护：考点训练页（renderSystemView/renderFineCategoryView）、首页教材墙装饰、`textbook_units` 数据、迁移训练教材标签。
- smoke 全绿（更新任何点教材视图的用例）。

## 删除清单（仅 `textbook` 视图专属）

### index.html
- 知识库切换按钮：第 308 行 `<button id="knowledgeTextbookBtn" onclick="setKnowledgeView('textbook')">📚 教材视图</button>` 删除。
- `视图 B · 教材视图` 段函数：renderTextbookView, renderBookDetail, setTextbookViewMode, getTextbookViewModeSnapshot/applyTextbookViewModeState, openTextbookModal, closeTextbookModal, _onTextbookModalKey，及其薄壳与 window 导出（含第 1735 行 `openTextbookModal:` 导出）。
- `教材 unit 操作` 段函数：openUnitQuestionList, openUnitErrorList, setUnitMiniFilter, _showUnitQuestionsMiniModal, _closeUnitMiniModal, _onUnitMiniKey, _gotoUnitQuestion，及相关状态变量 _unitMiniContext / _unitMiniModalTimer。
- `setKnowledgeView` 内 `chromeModel.renderAction === 'textbook'` 分支（第 3676–3677）删除。**保留** map / fine-cat / system / 默认 selectKnowledgeCategory 各分支。
- 抽屉返回暗线：第 4221–4222 `if (returnPlan.shouldOpenTextbookModal) openTextbookModal(returnPlan.book);` 删除。
- 教材视图/教材 modal/unit-mini-modal 的 HTML 容器标记。

### modules/knowledge-view-model.js
- 教材专属构造器：buildTextbookModel, buildTextbookUnitModel, groupTextbookUnitsByBook, buildTextbookModalModel, buildTextbookModalViewModel, buildTextbookModalOpenPlan, buildTextbookModeToggleModel，及第 10–16 行教材封面图映射（**此模块内、仅视图用的那份**）。
- 第 1377 行按钮配置去掉 `{ view: 'textbook', elementId: 'knowledgeTextbookBtn' }`。**保留** map / book / fine-cat / system 各项。
- 第 893 行 `shouldOpenTextbookModal: !!matchUnit` 改为恒 `false`（或删字段，并同步删 index.html 4221 消费端）。第 888 行 `knowledgeView: isUnitReturn ? 'textbook' : ''` 的 textbook 回跳一并中和。
- 第 1037 / 1118 行等"教材进度 / 教材视图"入口项（view:'textbook'）删除，**保留**同列表里的"书本速查"(view:'book') 等其它项。

### modules/home-dashboard-model.js
- 第 132–133 行动作步骤 `{ kind:'set-knowledge-view', view:'textbook' }` + `{ kind:'open-textbook-modal' }` 删除。若所属 dashboard action 整条仅为打开教材视图，则整条删；否则仅删这两步。
- **不要碰** getTextbookGallery / getTextbookSectionModel / COVER_MAP / BOOK_ORDER（首页装饰墙，见保护清单）。

### modules/home-dashboard.js
- runHomeDashboardAction 内 `open-textbook-modal` 的 runStep 分支删除。`set-knowledge-view` 分支若仅服务教材则删；若通用则保留。

### modules/app-state.js
- 教材视图模式状态 `_textbookViewMode` 及 buildTextbookViewModeState 等（仅教材视图用，逐一确认无其它消费者后删）。

### styles.css
- 教材视图、教材画廊、textbook-modal、unit-mini-modal 相关样式块。

### tests/
- 任何打开/断言教材视图（textbook、教材 modal、unit mini modal）的 smoke 用例：删除或改断言。

## 保护清单（绝不修改）

- 🛡️ **考点训练页**：`renderSystemView`（决策地图/全局图谱）、`renderFineCategoryView`（考点细分）、`setPointsTrainingView`、ptGraphBtn/ptTextBtn——它们与教材视图无关，删除时不得触碰。
- 🛡️ **知识库其余两视图**：📖 书本速查（book / selectKnowledgeCategory / 侧边栏）、🗺 知识地图（map / renderKnowledgeMap），及默认仍为 map。
- 🛡️ **首页教材墙装饰**：home-dashboard-model 的 getTextbookGallery / getTextbookSectionModel / COVER_MAP / BOOK_ORDER；home-render 的 textbookSection 渲染段（纯装饰、不可点）。与教材视图各有一份封面图，物理独立。
- 🛡️ **textbook_units 数据**：data/grammar_fine_tags.js 的 textbook_units；question-model.js 第 75 行。
- 🛡️ **迁移训练教材标签**：migration-training.js 的 formatTextbookUnitLabel 及调用。

## 关键设计决策

1. **删除目标精确为 `textbook` 视图**（📚 教材视图 / knowledgeTextbookBtn / renderTextbookView），**不是** `book`（书本速查）。早先草稿误把 book 当目标，已修正。
2. **默认视图不变**——知识库页仍默认 🗺 知识地图，无需改默认逻辑。
3. **数据与视图分离**：删展示 UI，留 textbook_units 数据标签（迁移仍显示"考点出自 必修X Unit Y"）。
4. **暗线就地中和**：首页动作、抽屉返回等"自动跳教材 modal"路径随视图移除，不留断头。
5. **外科手术**：只切 textbook，复用同片代码的 system/fine-cat（考点训练）、map/book（知识库）一律保留。

## 验证策略

- 每删一处跑 `npm run test:smoke`，保持全绿（当前 33）。
- 重点人工/截图核对：
  - 知识库页默认进入 = 🗺 知识地图；切换按钮只剩 📖 书本速查 + 🗺 知识地图，能正常切。
  - **考点训练页照常**：🌐 图谱（决策地图）+ 🏷️ 文字 都正常。
  - 首页教材墙装饰照常显示。
  - 迁移训练"教材单元标签"照常。
- grep 复查：`openTextbookModal` / `renderTextbookView` / `knowledgeTextbookBtn` 零残留调用。
- 走既定流程：feature 分支 → main → push → GitHub Pages。

## 风险与缓解

| 风险 | 缓解 |
|------|------|
| 误删 system/fine-cat 致考点训练页崩 | 保护清单显式列出；删除范围限定 textbook 专属符号；smoke + 人工核对考点训练页 |
| 误删 book（书本速查） | 已澄清 book≠textbook；删除目标精确为 knowledgeTextbookBtn / renderTextbookView |
| 误删首页装饰墙 | home-dashboard-model 装饰函数列入保护，不碰其装饰段 |
| textbook_units 被连带删致迁移标签断 | 数据 + formatTextbookUnitLabel 列入保护；人工核对迁移标签 |
| 残留断头：暗线仍调已删函数 | 同步清理 893/4221/132-133；grep 复查 openTextbookModal/renderTextbookView 零残留 |
| smoke 用例点教材视图致失败 | 同步更新/删除相关用例 |

## 净效果

index.html 减 ~400 行 + knowledge-view-model 减 ~130 行 + 各处清理；知识库简化为 书本速查 + 知识地图两视图（默认知识地图）；考点训练页、首页装饰、教材数据标签全部不受影响。
