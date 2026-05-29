# 题库知识性校对清单（线 C）

> 2026-05-29 · 全量 190 题（19 卷）逐题核对 answer / explanation / category / fine_category / grammar_point + fine tag 抽样。
> 自动检查（`check_grammar_bank.py`）只验结构，不验对错；本清单是人工 + AI 语义校对结果。
> **结论先行：190 道题的「答案」全部正确**（抽查 ~15 道较难题均为真题/模拟标准答案）。**所有问题都在「标签/考点字段」，源于早期批量打 tag**，不影响答案本身，但影响"按考点练习"分类和讲题台考点徽标。
> 处置原则：用户逐条/逐簇确认后再改。Finding 1–3 高/中高置信、成簇、可安全批量改；Finding 4 为可选打磨。

---

## Finding 1 · 名词复数被误归到「词性转换(word)」，应归「名词/数词(number)」　【高置信 · 14 题】

这些题都是"括号给单数名词 → 填复数"（如 interview→interviews），属 **名词的数**，按 taxonomy 应是 `category=number` + `fine=num-plural`。但批量打 tag 时被放进了 `category=word`（词性转换）。`fine=num-plural` 本身已属 number 家族，与 `category=word` 自相矛盾；各题自己的 `grammar_point` 也写的是"名词复数/名词的数"。

| # | 卷 | 题 | 答案 | 现 category | 现 fine | 应改为 |
|---|---|---|---|---|---|---|
| 1 | 2023全国二卷 | 61 | interviews | word | num-plural | category=**number** |
| 2 | 2024全国一卷 | 62 | favourites | word | num-plural | category=**number** |
| 3 | 2024全国二卷 | 37 | themes | word | num-plural | category=**number** |
| 4 | 2024广州一模 | 45 | wonders | word | num-plural | category=**number** |
| 5 | 2024广州二模 | 43 | photos | word | num-plural | category=**number** |
| 6 | 2024深圳一模 | 44 | benefits | word | num-plural | category=**number** |
| 7 | 2024深圳二模 | 44 | links | word | num-plural | category=**number** |
| 8 | 2025全国二卷 | 44 | afternoons | word | num-plural | category=**number** |
| 9 | 2025广州一模 | 39 | entries | word | num-plural | category=**number** |
| 10 | 2025广州二模 | 57 | cities | word | num-plural | category=**number** |
| 11 | 2025浙江首考 | 57 | times | word | num-plural | category=**number** |
| 12 | 2026广州一模 | 37 | gestures | word | num-plural | category=**number** |
| 13 | 2026深圳一模 | 42 | illustrations | word | num-plural | category=**number** |
| 14 | 2023浙江首考 | 64 | events | word | **word-adj-adv-other** | category=**number** + fine=**num-plural** |

说明：第 1–13 题只改 `category`（word→number），`fine=num-plural` 不动；第 14 题（events）额外把 `fine` 由 word-adj-adv-other 改为 num-plural。
注：经核 4 份待演示真卷的 56–65，未发现新增同类未入库错误；本簇即库内全部名词复数题。

---

## Finding 2 · 名词所有格被误归到「代词(pronoun)」，应归「名词/数词(number)」　【中高置信 · 1 题】

| 卷 | 题 | 答案 | 现 category/fine | 应改为 | 依据 |
|---|---|---|---|---|---|
| 2025浙江首考 | 64 | people's | pronoun / pron-personal-possessive | category=**number** + fine=**num-possessive** | 该题 grammar_point 自己写的是"名词所有格"；taxonomy 里 num-possessive = 名词所有格。people's 是名词 people 的所有格，不是代词。 |

---

## Finding 3 · 派生名词的 fine/考点写错（应为 word-noun-derivation）　【中高置信 · 3 题】

答案是"动/形 → 名词"的派生词（属 word 词性转换，没问题），但 fine 被写成 word-adj-adv-choice/other，部分 grammar_point 也写错。

| 卷 | 题 | 答案 | 现 fine / gp | 应改为 | 依据 |
|---|---|---|---|---|---|
| 2024全国二卷 | 42 | visibility | word-adj-adv-choice / **形容词** | fine=**word-noun-derivation**, gp=**名词** | 该题解析自己写"名词。visible 的名词形式为 visibility"。答案是名词，gp 写成形容词是错的。 |
| 2025深圳一模 | 39 | recovery | word-adj-adv-choice / 名词 | fine=**word-noun-derivation** | recover→recovery，名词派生；fine 选错。gp(名词)对。 |
| 2024浙江首考 | 60 | criticism | word-adj-adv-other / 名词 | fine=**word-noun-derivation** | criticize→criticism，名词派生；word-adj-adv-other 是兜底类，不够准。 |

---

## Finding 4 · 可选打磨（低置信 / 不影响演示）

- **fine 精度**：`2025广州二模 #60 impressively` 的 grammar_point 写"词性转换"（应为"副词"，fine 已对）；`2024浙江首考 #65 ones`（指代 supermarkets 的替代代词）tag 为 pron-personal-possessive，更准是不定/替代代词类。
- **tag 与解析不一致**：`2026广州一模 #41 when`，tag=定语从句(attrib-adverb)，但解析文字写"引导时间状语从句…连词 when"。答案 when 无误；属定从/状从分析口径之争，可统一口径。
- **grammar_point 留空**：`2024全国二卷 #43、#44`、`2025深圳二模 #37/#38/#39/#40/#42` 等若干题 grammar_point 为空（不影响显示，属补全项）。

---

## 处置建议

1. **Finding 1 + 2 + 3（共 18 题）**：成簇、依据充分、可安全批量改。改 `docs/data/grammar_bank.js`（页面读取的 canonical 库）对应题的 category/fine_category/grammar_point；改完跑 `python3 scripts/check_grammar_bank.py` + `npm run check`。
   - 注：`data/grammar_bank.json` 与 `data/grammar_bank.js`（生成源）的逐题字段可同步更新以免漂移；当前发布检查只校验三处的"套卷清单"一致，不校验逐题 category，故只改 canonical 即可让线上正确，但建议一并同步源文件保持整洁。
2. **Finding 4**：演示后再统一打磨，不进本轮。
3. 演示选定题目后，对该题再做一次重点复核。

*待用户确认后执行。*
