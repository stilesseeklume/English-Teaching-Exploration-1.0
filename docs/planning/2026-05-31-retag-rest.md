# 剩余类重标对照表（代词 / 名词数词 / 情态 / 特殊）

> 生成日期：2026-05-31  
> 范围：`fine_category` 属于 `pron-*`、`num-*`、`modal-*`、`special-*` 的全部题目  
> 数据源：`docs/data/grammar_bank.js`  
> 说明：mapping JSON 仅含有把握条目；⚠️ 待确认条目单独列于末尾。

---

## 统计摘要

| 原始分类 | 题数 |
|----------|------|
| `pron-personal-possessive` | 5 |
| `pron-it` | 1 |
| `num-plural` | 14 |
| `num-possessive` | 1 |
| **合计** | **21** |

> 注：数据库中本轮无 `modal-*`、`special-*` 类题目，故这两大类无需处理。

| 处置 | 题数 |
|------|------|
| 有把握 → 写入 mapping | 19 |
| ⚠️ 待用户确认 | 2 |

---

## 新 fine_category 分布（有把握部分）

| 新 fine_category | facets.type | 题数 |
|------------------|-------------|------|
| `pron-personal` | personal | 4 |
| `num-plural` | plural | 14 |
| `num-possessive` | possessive | 1 |

---

## 有把握对照表（19 题）

### 代词 pron-personal（4 题）

| key | 考卷 | 题号 | 答案 | 原 fine_category | 新 fine_category | facets | 依据 |
|-----|------|------|------|------------------|------------------|--------|------|
| 2023全国一卷-62 | 2023全国一卷 | 62 | their | pron-personal-possessive | pron-personal | {type:"personal"} | 形容词性物主代词，修饰名词 contents |
| 2024广州二模-38 | 2024广州二模 | 38 | their | pron-personal-possessive | pron-personal | {type:"personal"} | 形容词性物主代词，修饰 locations and conditions |
| 2025全国二卷-40 | 2025全国二卷 | 40 | myself | pron-personal-possessive | pron-personal | {type:"personal"} | 反身代词，指代主语 I |
| 2026广州一模-42 | 2026广州一模 | 42 | itself | pron-personal-possessive | pron-personal | {type:"personal"} | 反身代词，强调主语 history |

> **规则依据**：人称/物主/反身/指示代词（he/him/his/himself/this/that 等）→ `pron-personal`。

---

### 名词数词 num-plural（14 题）

| key | 考卷 | 题号 | 答案 | 原 fine_category | 新 fine_category | facets | 依据 |
|-----|------|------|------|------------------|------------------|--------|------|
| 2023全国二卷-61 | 2023全国二卷 | 61 | interviews | num-plural | num-plural | {type:"plural"} | 可数名词复数，不止一段采访 |
| 2023浙江首考-64 | 2023浙江首考 | 64 | events | num-plural | num-plural | {type:"plural"} | 可数名词复数，多个历史事件 |
| 2024全国一卷-62 | 2024全国一卷 | 62 | favourites | num-plural | num-plural | {type:"plural"} | 可数名词复数，后有 such as 列举 |
| 2024全国二卷-37 | 2024全国二卷 | 37 | themes | num-plural | num-plural | {type:"plural"} | there are 后，复数 |
| 2024广州一模-45 | 2024广州一模 | 45 | wonders | num-plural | num-plural | {type:"plural"} | these 指代，复数 |
| 2024广州二模-43 | 2024广州二模 | 43 | photos | num-plural | num-plural | {type:"plural"} | 可数名词，无限定词，复数 |
| 2024深圳一模-44 | 2024深圳一模 | 44 | benefits | num-plural | num-plural | {type:"plural"} | 可数名词，不止一个好处 |
| 2024深圳二模-44 | 2024深圳二模 | 44 | links | num-plural | num-plural | {type:"plural"} | diverse 修饰，复数 |
| 2025全国二卷-44 | 2025全国二卷 | 44 | afternoons | num-plural | num-plural | {type:"plural"} | 可数名词，表多个下午 |
| 2025广州一模-39 | 2025广州一模 | 39 | entries | num-plural | num-plural | {type:"plural"} | 可数名词，不止一个参赛作品 |
| 2025广州二模-57 | 2025广州二模 | 57 | cities | num-plural | num-plural | {type:"plural"} | 介词 like 后列举多个城市 |
| 2025浙江首考-57 | 2025浙江首考 | 57 | times | num-plural | num-plural | {type:"plural"} | time 表次数，fewer 修饰，复数 |
| 2026广州一模-37 | 2026广州一模 | 37 | gestures | num-plural | num-plural | {type:"plural"} | 可数名词，their 修饰，多名舞者 |
| 2026深圳一模-42 | 2026深圳一模 | 42 | illustrations | num-plural | num-plural | {type:"plural"} | 可数名词，无冠词限定，复数 |

---

### 名词数词 num-possessive（1 题）

| key | 考卷 | 题号 | 答案 | 原 fine_category | 新 fine_category | facets | 依据 |
|-----|------|------|------|------------------|------------------|--------|------|
| 2025浙江首考-64 | 2025浙江首考 | 64 | people's | num-possessive | num-possessive | {type:"possessive"} | 名词所有格，修饰 lives |

---

## ⚠️ 待用户确认（2 题）

### 1. `2024浙江首考-65` — answer: `ones`，原 tag: `pron-personal-possessive`

**解释**：one 代指前文 some supermarkets 中的个体，前有 some of the more forward looking 修饰，应用复数 ones。

**问题**：`ones` 作名词替代词（substitute pronoun）：
- 倾向 `pron-indefinite`：规则表明 `one/ones` 属于不定代词列表（some/any/none/both/either/each/one）
- 倾向 `pron-personal`：此处 `ones` 是强指代（anaphoric）替代具体名词 supermarkets，与人称代词功能类似

**建议**：若重点在"替代/回指"则 `pron-personal`；若重点在"one 是不定代词"则 `pron-indefinite`。  
**待确认新 tag**：`pron-indefinite {type:"indefinite"}` 或 `pron-personal {type:"personal"}`

---

### 2. `2025广州二模-58` — answer: `it`，原 tag: `pron-it`

**解释**：it 指代前文提到的"兰州牛肉面"，作 give 的宾语，构成短语 give it a try。

**问题**：原 tag `pron-it` 按规则专指"形式 it / 强调 it"（如 It is important that…；It was he who…）。此处 `it` 是普通人称代词指代前文具体名词，应属 `pron-personal`，但原 tag 已标为 `pron-it`，存在标注偏差。

**建议**：改为 `pron-personal {type:"personal"}`，纠正原标注错误。  
**待确认新 tag**：`pron-personal {type:"personal"}` 或维持 `pron-it {type:"it"}`

---

*文件路径：`docs/planning/2026-05-31-retag-rest.md`*  
*配套 mapping：`docs/planning/retag-rest-mapping.json`*
