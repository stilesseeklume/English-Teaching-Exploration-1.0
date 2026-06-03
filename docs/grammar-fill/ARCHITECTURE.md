# grammar-fill 架构护栏

## 铁律
1. **index.html 不再新增业务逻辑。** 终态只剩三样：HTML 骨架、`<script>` 装配清单、~10 行启动代码。
   新逻辑一律进 `modules/`，不进 index.html。
2. CSS 进 `styles.css`，不再内联（boot-cloak 关键 CSS 例外，须内联防闪白）。
3. 模块通信沿用现有 `window.Grammar*` 全局命名约定，不发明新机制、不引入构建工具。
4. 不动 `shared/`、不动其他题型，除非任务明确要求。

## 每个 module 文件头必须写"三件套"
```js
// grammar-fill/modules/xxx.js
//
// 职责：这个模块做什么（一句话）
// 用法：怎么调用（入口挂在 window.GrammarXxx 上）
// 依赖：依赖哪些全局 / 模块 / DOM
```

## 引擎搬迁策略：系统逐块搬迁、每块验证（2026-06-01 决策，修订）

第一期（护栏 + CSS 抽离 + 引擎地图）已达成稳定性目标：护栏封顶增长、index.html 瘦身 36%。

复盘发现：**干净的纯逻辑"叶子"早已抽进现有 22 个模块**。引擎（index.html 内联 `<script>`，约 4xx–6001 行）里剩下的是**天然耦合的控制器/编排层**（投影、侧边栏导航、云同步猴补丁、Dashboard 编排等）。把它们搬进模块每块只瘦 ~90 行、要穿一堆 deps + 留同名薄壳防 onclick 断裂，单块收益有限。

**决策（修订）：系统性逐块搬迁，奔"装配清单"终态。** 早先曾因"省力"倾向机会主义，但既然投入时间充足，就把控制器逐块搬净——单块收益虽小，累计后 index.html 退化为纯装配，是真正的终态。**风险靠纪律控住**：
- 一次只搬一块，从最孤立的开始（推荐序：投影 → 迁移数据源 → Dashboard → 云同步 → 侧边栏 → 三视图；管理员页已空可跳过）。
- 每块搬完立刻 `npm run test:smoke`（覆盖讲题/投影/全屏/存档），绿了才提交、才搬下一块。
- 任一块出问题立即回滚，不连累其他块。
- 施工图：引擎地图 `docs/superpowers/specs/2026-06-01-grammar-fill-engine-map.md`。

## 模块抽取手法（每块搬迁遵循）
1. 在 modules/ 新建文件，写三件套文件头。
2. IIFE 包裹，入口挂 window.GrammarXxx（参照 app-state.js / teaching-render.js）。
3. 外部依赖通过 deps 对象在调用时传入（参照 focusRuleDeps() / teachingViewModelDeps()），不在模块内直接抓散落全局。
4. 在 index.html 装配清单按正确加载顺序加入 `<script>` 引用。
5. 删除 index.html 对应内联代码，替换为对模块入口的调用。
6. 单独 commit，单独跑 `npm run test:smoke` 验证。
