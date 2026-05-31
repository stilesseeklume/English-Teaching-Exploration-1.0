# 决策地图增强：叶子实用化 + 智能下钻具体词 + 标0/标真题数 · 设计文档

> 日期：2026-06-01（重写：先前版本误判渲染文件，已纠正）
> 起因（用户原话整理）：
> 1. 迁移里的叶子小分类，即使题库没有，也要显示标 0。
> 2. 全局图谱（截图）点「介词」展开的子节点只是文字标签，要"实用而非展示"——能看题数、能点进去练。
> 3. 介词节点应展示"具体有哪些介词"（in/for/by…），不只是分类口径。
> 4. 排查所有大类：哪些值得下钻到具体词。
> 5. 题数：总数都算，但顺便标"单独真题多少道"；考点视图同样。
> 6. 真题有筛选、模拟/错题没有——查清没做还是没题。

---

## 关键纠正（先前 spec 的错误）

先前版本断定问题在 `teaching_graph`（grammar_knowledge_core.js）旧 tag。**查证后否定**：
- 界面"🌐 全局图谱" tab 实际由 `renderSystemView`（index.html:8838）渲染 **`GRAMMAR_DECISION_MAP`**（decision_map.js，**T8 已对齐新 51-tag，fine 字段全对**）。
- `teaching_graph` 那套 SVG（`buildGraphSvg`）当前**没有界面入口，是死代码**——不碰它。
- 所以"介词分类"本身没错（截图 5 个子节点都是介词分类）。真正问题见下。

---

## 现状（已查证）

### 决策地图结构（decision_map.js）
介词节点 `prep`（cat=preposition）有 5 个叶子：
`l_prep_common`(fine=prep-common) / `l_prep_time`(prep-time) / `l_prep_loc`(prep-place) / `l_prep_verb`(prep-collocation) / `l_prep_other`(prep-other)。fine 全合法。

### 叶子渲染逻辑（index.html:8895-8905）
叶子（无子节点）本应渲染 `dm-see` 内的按钮：题数>0 出"🔁 迁移训练·N题"，无条件出"📖 看讲解"。但**截图里这些按钮没显示**。两个候选根因（plan 第一步用 systematic-debugging 定位）：
- (a) 按钮在 `dm-tip`/`dm-see` 内，CSS 可能默认隐藏、hover 才现 → 老师看不到 = "只展示不实用"。
- (b) `_countByFineTag` 未定义/返回 0 → 迁移按钮不出（但看讲解应仍在；若连它都没 → 偏向 a）。

### 题库各大类"具体词层"普查（facets.word/form/type/subtype）
**只有 4 类的具体词是真实英文词、值得下钻：**
| 大类 | 分类层(fine) → 具体词 |
|---|---|
| 介词 | prep-common: as×2 with for to by before from / prep-collocation: for×3 on from into / prep-other: by to for |
| 逻辑连词 | logic-coordinating: and×7 or×3 so but |
| 定语从句 | attrib-pronoun: which×4 that×3 who whose / attrib-adverb: when×3 where×2 |
| 名词性从句 | nounc-wh-pronoun: what×3 / nounc-wh-adverb: how×2 why |

**其余大类具体词 = 分类本身**（无下钻价值）：谓语（facets 无单值词）、非谓语（done/to-do/doing = 分类）、词性（全 derivation）、名词/冠词/代词（plural/a-an/the/personal = 分类）。

---

## 需求与方案

### A. 决策地图叶子"实用化"（修截图按钮缺失）
systematic-debugging 定位按钮为何不显示，修复使每个叶子可见：题数 badge + "🔁 迁移训练·N题"（N>0）+ "📖 看讲解"。0 题叶子也显示（题数标 0，迁移按钮可灰/隐，看讲解保留）。

### B. 叶子标 0（没题的分类叶子也在）
decision_map 叶子是固定全集，本就全部 walk 渲染——确认 0 题叶子不被跳过（8886 `if(!p)return` 是缺坐标才跳，与题数无关，预期已显示）。重点是 A 让 0 题叶子也有 badge/状态，不是空白文字。

### C. 下钻第二层（具体词）——闭合类列全标0 / 开放类随题

叶子（fine_category）下再展开一层"具体词"子节点，每个词标题数（总数+真题数），点词→`startMigrationFromMap` 按该词筛迁移题。**两种口径**：

**闭合类（引导词有限，预定义词表，列全 + 没题标 0）**：
- `nounc-that`: [that]
- `nounc-whether-if`: [whether, if]
- `nounc-wh-pronoun`: [what, who, which, whom, whose]
- `nounc-wh-adverb`: [when, where, how, why]
- `nounc-ever`: [whatever, whoever, whichever, whomever, whenever, wherever, however]
- `attrib-pronoun`: [who, whom, which, that, whose]
- `attrib-adverb`: [when, where, why]
- `attrib-as`: [as]
- `attrib-prep-relative`: [介词+which, 介词+whom]（模式化，作 1-2 项展示）
- `art-a-an`: [a, an]；`art-the`: [the]
- `logic-coordinating`: [and, but, or, so, for, nor, yet]（关联结构 both…and 等由 facets.kind 另计，暂不进词层）

**介词（核心总表打底 + 随题追加）**：
- 核心总表（来自知识库·赢在微点介词章高频统计）预定义打底、没题标 0：**in, on, at, for, with, of, by, from, to**（9 个）。
- 题库中出现的其余介词（如 before/into/over…）追加显示，随题库增长。
- 这份核心表作为 `preposition` 大类**共享词表**（不按 prep-common/place/collocation 分别建表，避免 in/on/at 重复）；介词各叶子下钻时都基于"核心表 ∪ 该叶子题库出现词"，按题数降序，核心词无题排后标 0。

**词表存放**：`grammar_fine_tags.js` 给闭合类 fine tag 增可选字段 `words: [...]`；介词核心表作为 `preposition` category 级字段（如 `categories.preposition.core_words`）或单独常量。无 `words`/非介词的 fine tag 不下钻。

**下钻触发**：闭合类只要有 `words` 就展开（哪怕全 0）；介词叶子始终展开（核心表打底）；其余大类（谓语/非谓语/词性/名词等，具体词=分类本身）不下钻。

### D. 题数口径：总数 + 单独真题数
`countByFineTag` 增 `real`（type==='真题'）。决策地图叶子 badge、🏷️考点视图 tag badge、C 的具体词节点，三处都显示"总数·真题N"。

### E. 迁移范围选择器第②档 fine tag 全列标 0（独立需求 1）
T4 选择器第②档改为该大类全部 fine tag 固定全列（含 0 题），匹配按 fine_category。第①档（具体词）、第③档（大类）不变。（此项与决策地图独立，可单独成 Task。）

### F. 真题/模拟/错题筛选一致性
查证 `buildUnitFilterChips`（只在 source==='bank' 出 chip）+ `isMockQuestion` 是否认全 `模拟卷`+`模拟题`。按结论决定改不改（不预先承诺）。

---

## 改动点
| 需求 | 文件 |
|------|------|
| C | `docs/data/grammar_fine_tags.js`（闭合类 fine tag 增 `words: [...]` 预定义引导词表） |
| A/B/C | `docs/grammar-fill/index.html`（renderSystemView 叶子渲染 + 下钻；可能动 CSS dm-tip/dm-see） |
| C/D | `docs/grammar-fill/modules/knowledge-view-model.js`（countByFineTag 增 real；新增 `buildLeafWordBreakdown(fine, fineTags, bank, error)`：闭合类读 `words` 列全标0，开放类题库统计≥2才出） |
| E | `docs/grammar-fill/modules/migration-training.js` + `index.html`（同先前 T4 第②档全列） |
| D | 考点视图 badge（knowledge-view-model `buildFineCategoryModel`） |
| F | 查证后定 |
| all | `tests/smoke.spec.js`；`scripts/check_grammar_bank.py`（若校验 fine_tags 结构需容纳新 words 字段） |

## 测试策略（TDD，纯函数为主）
- C 介词：`buildLeafWordBreakdown('prep-common', fineTags, bank, [])` 返回 ≥9 个词（核心表 in/on/at/for/with/of/by/from/to + 题库该叶子出现词），核心词无题标 0，按题数降序。
- C 闭合类：`buildLeafWordBreakdown('attrib-pronoun', fineTags, bank, [])` 返回 5 个词（who/whom/which/that/whose）含 0 题词；`nounc-wh-pronoun` 返回 what/who/which/whom/whose（题库只有 what 有题，其余标 0）。
- D：`countByFineTag` 返回含 `real`，total≥real。
- E：迁移第②档返回该大类全 fine tag（含 0 档）。
- A/B：smoke 断言 decision_map 渲染产物含叶子按钮文案（或纯函数化叶子模型后断言）。
- 回归：`npm run check` 全绿。

## 非目标（YAGNI）
- 不碰 teaching_graph（死代码）、不碰 🗺知识地图（同 decision_map，已对齐）。
- 不预定义"常考介词表"——具体词随题库走。
- 非 4 类大类不强行下钻具体词。
- 不改 facets schema/题库/导入。

## 风险
- A 的根因未最终确认（CSS hover vs 计数），plan 第一步必须先定位再改。
- C 下钻层级加深，decision_map 是逐层 walk + 自动布局，新增"具体词"作为叶子的子层需接入 `dmExpanded`/`childrenOf` 机制或动态注入——plan 需定具体接法（动态生成子节点 vs 叶子内嵌列表）。
- D 动考点视图（已上线），靠 smoke 回归兜底。
