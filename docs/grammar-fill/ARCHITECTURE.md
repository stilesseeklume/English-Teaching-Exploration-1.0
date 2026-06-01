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

## 模块抽取手法（每块搬迁遵循）
1. 在 modules/ 新建文件，写三件套文件头。
2. IIFE 包裹，入口挂 window.GrammarXxx（参照 app-state.js / teaching-render.js）。
3. 外部依赖通过 deps 对象在调用时传入（参照 focusRuleDeps() / teachingViewModelDeps()），不在模块内直接抓散落全局。
4. 在 index.html 装配清单按正确加载顺序加入 `<script>` 引用。
5. 删除 index.html 对应内联代码，替换为对模块入口的调用。
6. 单独 commit，单独跑 `npm run test:smoke` 验证。
