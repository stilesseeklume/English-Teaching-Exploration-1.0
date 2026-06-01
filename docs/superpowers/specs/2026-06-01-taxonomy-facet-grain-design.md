# 考点体系地基重订 · 设计 spec

> 日期：2026-06-01　状态：**设计完成，待用户审**
> 起因：组长反馈迁移"太泛泛"；用户实测：时态 6 节点迁移数雷同、点 which 跳非 which、范围筛选器点不动、连词/从句词表不全。深挖发现根子在**考点体系数据本身**（既太粗又有完整性 bug）。

---

## 一、背景与根因（已证实）

1. 当前是**两层模型**：`fine_category`（考点类，53 个，2026-05-31 刻意按"引导词/形式"收缩）+ `facets`（具体引导词/形式，380/380 全覆盖主轴）。
2. 上一轮迁移重构把迁移**只认 fine_category、丢了 facets** → 同 tag 内 and/but、present/past、which/who 不分了（回退）。
3. 视图（脑图）节点比 taxonomy 细、与考点没对齐 → 6 个时态节点查同一粗池、计数雷同。
4. `setMigrationScope` 从未实现 → 范围筛选器点不动（死控件）。
5. taxonomy 完整性 bug：计数注释写 51，实际 53；`textbook_units.maps_to` 全引用已存档旧 id → 教材视图（视图 B）断。

## 二、方向决策

- **不把 fine_category 炸成 100+**（会推翻 2026-05-31 简化、重蹈"迁移给的题不对"）。
- **统一"标签清单"模型（A）**：每题挂一个考点清单 `points`，taxonomy / 视图 / 迁移三者都读它，单一数据源。
- **粒度标准 = 对做题有用**，不强行对齐语法通霸（其分类不一定适合做题）；每大类切法由用户拍板（已逐类敲定，见四）。
- **迁移抽屉去掉范围筛选器**；迁移粒度由考点本身决定，同考点无题则空态。
- **排序**：本设计（地基）先做；P0 的 UI 小修（叶子跳转、冠词显示、空态）随地基一起落地。

## 三、地基原则

- **谓语 → 多标签**：`was built` = 过去 + 被动，时态/语态/一致是**真正独立**的选择，按轴建、一题可在多轴出现、按轴迁移。
- **非谓语 / 引导词类 / 词性类 → 单标签**：非谓语形式已基本决定语态（done≈被动），再多标签是重复干扰；引导词/词性一空一考点。**多标签只有谓语真正需要。**
- **`frequency` 标注留在数据层**（零冠词"几乎不考"、but/than"基本不考"）：体系完整 + 诚实；UI 灰显/降权功能留后，字段现在就建。

## 四、考点粒度决议（最终，逐类）

| 大类 | 标签模型 | 考点切法 / 迁移粒度 |
|------|---------|------------------|
| **谓语 predicate** | **多标签** | 轴①时态(12 个/6 组显示) 轴②语态(含拆"主动表被动"为独立考点) 轴③主谓一致(语法形式/意义/就近 三原则)。一题挂它真正考的那些轴 |
| **非谓语 nonpredicate** | 单 | 形式：to-do / doing / done（不动；复合式 having been done 当 done 变体） |
| **连词 logic** | 单 | 逻辑关系组：并列(and) / 转折(but·yet) / 选择(or) / 因果(so·for) / 否定并列(nor) / 关联结构(both…and·either…or·neither…nor·not only…but also·as well as·not…but) |
| **定从 attrib** | 单 | 关系代词(who/whom/which/that/whose) / 关系副词(when/where/why) / 介词+关系词 / as(留 but/than 标低频) / **only-that(新增)**。迁移按 word。限制/非限制删 |
| **名词从句 nounclause** | 单 | that / whether·if / 连接代词(what/which/who/whom/whose) / 连接副词(when/where/how/why) / wh-ever(whatever/whoever/whichever)。迁移按 word。whenever/wherever/however 归状从 |
| **介词 preposition** | 单 | 按 word（碎就碎）：prep-common / time / place / collocation / other 下各介词 |
| **冠词 article** | 单 | **a · an · the · 零冠词** 四考点（a/an 分开——学生易错点）；零冠词标 `frequency:几乎不考`。迁移按 word |
| **代词 pronoun** | 单 | 6 类：人称 / 物主 / 反身 / 指示 / 不定(内按 word) / it |
| **名数 number** | 单 | 复数 / 所有格 / 数词(含倍数·分数) 3 类 |
| **词性 word** | 单 | 名词 / 形容词(含-ed/-ing) / 副词 / 动词 / 比较级 **5 类**（删 adj-vs-adv，与 adj/adv 重叠；hard/hardly 等易混词对塞进 adv 作标注） |
| **状从 / 情态 / 特殊句式** | 单 | 0 题，保持现有 tag、不细分，低优先 |

## 五、数据模型 A：`points` 标签清单

每题一个 `points` 数组，元素 = 一个考点：

```js
{ tag: '<考点id>', key?: '<迁移细分值>', frequency?: '<高频|低频|几乎不考>' }
```

- `tag`：考点节点 id（知识图里显示的节点，如 `attrib-pronoun`、`pred-tense`、`art-an`）。
- `key`：该考点内的迁移细分值（引导词/形式/逻辑关系/时态/一致原则）。无 key 时迁移按 tag。
- **单标签题** = 1 个元素；**谓语题** = 1~3 个元素。

示例：

```js
// 引导词类（单）：定从 which
points: [ { tag:'attrib-pronoun', key:'which' } ]
// 冠词（单）：an —— a/an 各自独立考点
points: [ { tag:'art-an' } ]            // 或 { tag:'art-indefinite', key:'an' }，二选一，实现期定
// 连词（单）：or → 逻辑关系"选择"
points: [ { tag:'logic-coordinating', key:'选择' } ]
// 谓语（多）：was built = 过去 + 被动
points: [ { tag:'pred-tense', key:'past' }, { tag:'pred-passive' } ]
// 非谓语（单）：to bite
points: [ { tag:'nonpred-to-do' } ]
```

**迁移规则**：题 B 进入题 A 的迁移池 ⟺ B 与 A **至少共享一个 point**（`tag` 相同且 `key` 相同/皆无）。
- 单标签题：就是"同考点 + 同细分值"。
- 谓语多标签题：从"过去时"节点进入时按 `{pred-tense,past}` 这一 point 取池；从"被动"节点进入时按 `{pred-passive}` 取池——**同一道题在不同轴下迁移到不同的同伴**。
- 池空 → 空态（不回退粗类）。

## 六、改动三个面（C）

### ① 数据层 `docs/data/grammar_fine_tags.js` + `grammar_bank.js`

- **重订 tag 体系**（按四）：
  - article：a/an 拆开 + 加 `art-zero`(零冠词, frequency=几乎不考)；
  - pronoun：3 → 6（人称/物主/反身/指示/不定/it）；
  - word：删 `word-adj-vs-adv` → 5；
  - attrib：加 `attrib-only-that`；as 的 but/than 标 frequency；
  - logic：定义 6 个逻辑关系组（key 词表）；
  - predicate：时态 12 值/6 组、语态拆"主动表被动"、一致三原则（作 key 词表）。
- **给每题生成 `points`**：多数可由现有 `fine_category + facets` **规则派生**；需人工复核的：①冠词 a vs an（按答案实际词）②谓语多轴（判定每题真正考哪几轴）③连词 word→逻辑关系映射。
- **完整性修复**：计数注释/stats 改 53；`textbook_units.maps_to` 重映射到现行 tag id（断了的视图 B 修通）。

### ② 引擎 `docs/grammar-fill/modules/migration-training.js`（+ index.html 调用）

- `buildMigrationData`：池 = 与当前题**共享 point** 的题（替换现"只认 fine_category"）；按进入轴取对应 point 的池；空则空态。
- **删除范围筛选器整套**：`buildMigrationScopes`/`migrationMatchesScope`/`buildMigrationScopeSelectorModel`/`migrationScopeSelectorHtml`/`_migrationScope`/坏的 `setMigrationScope` + 相关 smoke。
- `countAnalysisMigrationCandidates`：按 points 计数。

### ③ 视图 `teaching-view-model.js` / `knowledge-view-model.js` + render

- 知识图节点由 `points` 生成（tag=节点、key=叶子），计数取真实 points 命中数 → **6 时态节点不再雷同**。
- **叶子点击跳转**按 (tag,key) 取题 → 修"点 which 跳非 which"；该叶子无题则空态。
- 冠词显示 a/an/the/零；代词 6 类；词性 5 类（无 adj-vs-adv）；定从加 only-that。

## 七、验证（D）

- 单元/ smoke 断言：
  - which 题迁移只含 which；a 与 an 分开；
  - 谓语 `was built` 同时出现在 过去时 与 被动 两节点；从两节点迁移到不同同伴；
  - 同考点无题 → 空态；
  - 知识图各时态节点计数互不相同；点叶子跳到该词的题。
- `npm run check` 全绿（含修正后的计数）。
- 浏览器验收：真题进讲题台 → 迁移/知识图三处一致。

## 八、分期（实现时拆 plan）

1. **数据层**：tag 重订 + points 生成 + 完整性修复（地基，先行）。
2. **引擎**：迁移按 points + 删筛选器 + 空态。
3. **视图**：知识图按 points + 叶子跳转修复。

## 九、砍掉 / 留后

- **砍**：frequency 的 UI 功能（字段留）、限制/非限制维度、word-adj-vs-adv。
- **留后**：派生词**词缀 `affix` 维度**（最高频，重投入；地基已带 subtype:derivation，加 facet 即可）、介词按功能拆、多标签扩到更多类、0 题三类细分。
