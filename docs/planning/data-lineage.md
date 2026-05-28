# Seeklume 数据链路与真源规则

> 状态：v0.1。目标是避免“改错文件”和“生成产物覆盖源数据”。

## 1. 语法填空题库

| 层级 | 路径 | 角色 | 是否手改 |
|---|---|---|---|
| 原始素材 | `data/语法填空库/*.md` | 每套语法填空原始题面、答案、解析 | 可以 |
| 结构化中间层 | `data/grammar_bank.json` | `build_grammar_bank.py` 生成的 JSON | 原则上不手改 |
| 公开发布数据 | `docs/data/grammar_bank.js` | 页面实际读取的数据，含 fine tag 和课堂判断增强字段 | 当前 canonical，可手改；后续要收敛为生成产物 |

当前历史原因：`docs/data/grammar_bank.js` 已承载 fine tag 和课堂判断层，是页面 canonical。后续重构目标是把增强字段回写到结构化源层，最终让公开 JS 完全由脚本生成。

注意：`data/grammar_bank.json` 和 `data/grammar_bank.js` 是脚本生成的基础产物。除非是在修复历史数据并同步更新生成脚本，否则不要只手改这两个文件。

当前门禁规则：

- `data/grammar_bank.js` 必须保留“自动生成 · 请勿手工编辑”头部。
- `docs/data/grammar_bank.js` 必须保留“当前 canonical · 可手工编辑（历史过渡期）”头部。
- `data/语法填空库/*.md`、`data/grammar_bank.json`、`docs/data/grammar_bank.js` 的套卷清单必须一致。
- 直接改 `docs/data/grammar_bank.js` 后必须运行 `npm run check`。
- 未来一旦 `docs/data/grammar_bank.js` 完全由脚本生成，再把 canonical 头部改成自动生成头部。

## 2. 知识库数据

| 层级 | 路径 | 角色 | 是否手改 |
|---|---|---|---|
| 知识源 | `data/grammar_knowledge*.js` | 语法知识、陷阱、核心骨架源数据 | 可以 |
| 公开发布数据 | `docs/data/grammar_knowledge*.js` | GitHub Pages 读取的数据 | 由 `scripts/deploy.sh` 同步 |
| 精细 tag | `docs/data/grammar_fine_tags.js` | 当前精细 tag canonical | 可以，改后必须跑检查 |

## 3. 生成与发布

```bash
python3 scripts/build_grammar_bank.py
bash scripts/deploy.sh
npm run check
```

发布前必须确认：

- 每套 10 题。
- `category` 在 11 类标准分类中。
- 公开题库每题有 `fine_category`。
- `fine_category` 存在于 `docs/data/grammar_fine_tags.js`。

## 4. 未来收敛方向

- 把 `docs/data/grammar_bank.js` 中的 fine tag、课堂判断层字段回写到源数据。
- 让 `docs/data/grammar_bank.js` 由脚本生成，不再直接编辑。
- 为阅读、完形、写作建立同样的“原始素材 → 结构化 JSON → 发布 JS”链路。
