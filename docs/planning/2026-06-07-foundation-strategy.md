# Seeklume 地基策略 · L1 分阶段（活文档）

> 状态：v0.1（2026-06-07）。本文把 Seeklume 从「单题型可运行原型」推进到「可持续生长的多模块教学平台」的**地基决策**与**迁移路线**写定。
> 上游：[AGENTS.md](../../AGENTS.md) · [engineering-process.md](engineering-process.md) · [ARCHITECTURE.md](../grammar-fill/ARCHITECTURE.md) · [architecture-extraction-backlog.md](architecture-extraction-backlog.md)
> 决策人：项目负责人（一线英语教师）。每完成一个阶段回来更新本文。

## 0. 一句话

现在用**浏览器原生 ES module + 共享外壳 + 数据归一**把地基做稳（**L1**）；是否上 Vite（L2）留到**真正开始做第 2 个模块**时再拍。小步、可回滚、可上线，**不引入框架**。

## 1. 为什么现在做（问题）

- **形态是「单题型巨石」**：`docs/grammar-fill/index.html` ~5135 行，**48 个 `<script>` 手动按序加载**，模块靠 `window.Grammar*` 全局「黑板」互相通信。
- **数据即代码**：题库以全局变量 `.js` 整库注入；**199 处 `html +=`** 手工拼 HTML（掺 AI/用户内容时是 XSS 面）。
- **产品方向可能扩到多模块**（更多题型 / 教学设计 / 资源开发……，尚未钉死）。当前形态下，加第 2 个模块的成本接近「再复制一份巨石」。
- **「引擎搬迁 backlog」已到边际收益递减**：剩下的是手工维护模块边界——而这正是语言原生能力（ESM）本该免费提供的。

## 2. 判断标尺（这套地基要满足什么）

1. **真正可持续**：加新模块便宜、互不污染。
2. **仍然属于你**：一个非程序员能看懂、能讲述、能靠 AI 维护——这是**底线**，不是加分项。（原型是「门槛」，可持续、能长大的地基才是「纵深」——这才是真正难、也真正有价值的部分。）
3. **不过度工程**：守住「小步可逆、不大重写」，当前不引入框架 / Vite。
4. **每一步都能单独上线、单独回滚**。

## 3. 工具档位决策

| 档 | 是什么 | 取舍 | 决策 |
|---|---|---|---|
| **L1** | 纯 vanilla，但用浏览器**原生 ES module**（`import`/`export`）+ 抽共享外壳 | 零新工具、守章程、风险最低；无类型/打包 | ✅ **现在做** |
| **L2** | 极薄打包器 **Vite**（仅打包 + dev server，**不引入 React**） | 消灭手动加载顺序 + 全局；多一个 build 步骤 | ⏸ **揣兜里**，决策点见下 |
| **L3** | 轻量组件框架（Svelte/Preact） | 多模块最省力、告别 `html+=`；章程改动最大，最像「工程师的产品」 | ❌ 暂不 |

**L2 决策点** = 真正开始做第 2 个模块那一刻。**判据**：到那时「没有打包器 / 没有组件」的痛是否已**具体**到值得加 Vite。凭现在想象去拍 L2/L3，违背「简单优先」。

**与现有章程的关系（重要）**：
- L1 **不**引入 React/Vue/Vite/TypeScript，**仍在 [AGENTS.md](../../AGENTS.md) 的技术方向之内**——ESM 是浏览器自带的语言特性，不是框架、不是构建工具。
- 但 L1 **会更新 [ARCHITECTURE.md](../grammar-fill/ARCHITECTURE.md) 铁律 3**（「沿用 `window.Grammar*` 全局命名约定」）：模块通信从全局黑板逐步改为 `import`/`export`。这条在阶段 ② 落地时同步改写。

## 4. 目标架构（终态长什么样）

```
index.html  =  HTML 骨架 + 一个 <script type="module"> 入口
                     │
                     ▼
               app 入口（boot）
                     │  import
        ┌────────────┼─────────────────────────┐
        ▼            ▼                          ▼
   共享外壳 shell   共享服务                  教学模块（按契约注册）
   登录/顶栏/      auth · cloud ·            ┌─ grammar-fill（模块 #1）
   侧栏/导航       word-import ·             ├─ （未来）完形 / 阅读 / …
        │          observability             └─ （未来）教学设计 / 资源…
        ▼
   共享组件套件（按钮/卡片/题目展示…）
                     ▲
                     │  按需取
                数据层：JSON / Supabase（单一真源）
```

- **外壳 shell**：登录 / 顶栏 / 侧栏 / 页面导航，做一次，全模块共用。
- **模块契约**：每个教学模块 = 一个文件夹，对外暴露**标准入口**（如 `mount(shellCtx)` / `meta`）。符合规格就能插进外壳，**不动其他模块**。
- **共享组件套件 + 共享服务**：`docs/shared/` 已是服务层雏形（auth/cloud/word-import/observability）；再补 UI 组件套件。
- **数据层**：题库从「代码全局变量」→「按需取 JSON / 从 Supabase 取」，单一真源。

## 5. 迁移路线（分小步，每步可回滚、可单独上线）

> 手法沿用 teaching-render 那套：一次一切片 → `npm run check` 绿 → checkpoint commit → 即合即推、避开并行热点。

### ① 试点：`teaching-axes.js` 改 ESM（最小风险，证明套路）
- **为什么是它**：69 行、纯叶子、**仅 2 处引用**、单一干净导出。爆炸半径最小。
- **改什么**：

  **前（现在）**
  ```js
  (function(){
    function getNonpAxis(q){ /* … */ }
    window.GrammarTeachingAxes = { NONP_FORM_LABELS, getNonpAxis /* … */ };
  })();
  ```
  ```html
  <script src="./modules/teaching-axes.js"></script>
  ```

  **后（ESM + 迁移期全局桥）**
  ```js
  export const NONP_FORM_LABELS = { /* … */ };
  export function getNonpAxis(q){ /* … */ }
  // 迁移期全局桥：等所有调用方迁完再删
  if (typeof window !== 'undefined') {
    window.GrammarTeachingAxes = { NONP_FORM_LABELS, getNonpAxis };
  }
  ```
  ```js
  // 调用方（迁到 import 后）
  import { getNonpAxis } from './modules/teaching-axes.js';
  ```
- **完成定义**：`npm run check` 绿（含 Playwright smoke），讲题台非谓语轴正常显示。证明 **ESM 在 GitHub Pages 上能跑、且与现有全局代码共存**。
- **回滚**：单 commit revert。
- （`<script type="module">` 的 defer 排序细节在实施计划里处理——现有调用方都是交互时调用，非加载时，故安全。）

### ② 铺开 ESM
逐个把其余模块从「script 全局」迁到 `import`/`export`，全局桥过渡、迁完即删。`passage-utils.js`（17 引用 + 泄漏 `window.extractSentence` 等散装全局）作为**第二个**代表案例。**48 个 `<script>` 收敛成 1 个 module 入口。** 这是「引擎搬迁 backlog」的**更好终点**——原来奔「globals 但整齐」，现在奔「ESM、无公共黑板、无手工排序」。

### ③ 外壳 + 模块契约
把缠在 grammar-fill 里的「登录 / 顶栏 / 侧栏 / 导航」抽成薄外壳，定「插头规格」，让 grammar-fill 成为「插在外壳上的模块 #1」。**这一步才真正打开多模块未来**。设计重，到这儿**单独再 brainstorm 一次**。

### ④ 数据层归一
题库从「代码全局变量」→「按需取 JSON / 从 Supabase 取」，单一真源。可独立成一小步。

### ⑤ 决策点
真要做第 2 个模块时，按 §3 判据决定加不加 Vite（L2）。

## 6. 不做 / 边界（YAGNI）

- 不引入框架（L3）；当前不引入 Vite（L2）——留到第 2 个模块决策点。
- 不大爆炸重写；不为「还没定的模块」预先搭脚手架。
- **可选支线**：把研究库 / 真题移出公开仓库护 IP（与本路线**互不依赖**，想插队随时）。

## 7. 验证与回滚

- 每个切片过 `npm run check`（含 Playwright smoke）才提交。
- 沿用 checkpoint 纪律；每切片独立短分支、即合即推，避开并行会话热点（近期热点见 ARCHITECTURE.md）。
- 出问题单切片回滚，不连累其他。

## 8. 与现有文档的关系

- **取代** `architecture-extraction-backlog.md` 的「终态目标」：从「globals 但整齐」升级为「ESM + 外壳」；手法不变。
- **更新** `ARCHITECTURE.md` 铁律 3：在阶段 ② 落地时，把「沿用 `window.Grammar*` 全局」改写为「ESM 导入；全局桥仅作迁移期兼容」。
- **沿用** `engineering-process.md` 的分支 / 检查 / 回滚 / 日志规则。

---

*下一步：本文档经负责人审阅 → 用 writing-plans 把**阶段 ①试点**拆成带验证的实施计划 → 开工。*
