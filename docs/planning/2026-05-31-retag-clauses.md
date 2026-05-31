# 从句类重标映射对照表

> 生成日期：2026-05-31  
> 数据来源：`docs/data/grammar_bank.js`  
> 处理范围：旧 `fine_category` 属于 `attrib-*` / `nounc-*` / `advc-*` 的全部题目  
> **注意：仅输出映射，未修改题库，未运行 apply_retag.py**

---

## 统计概览

| 指标 | 数值 |
|------|------|
| 处理总题数 | 20 |
| 有把握映射 | 19 |
| ⚠️ 待用户确认 | 1 |

### 旧标签分布（输入）

| 旧 fine_category | 题数 |
|-----------------|------|
| `attrib-choice` | 6 |
| `attrib-adverb` | 4 |
| `attrib-restrictive-non` | 4 |
| `nounc-wh-words` | 6 |

### 新标签分布（输出，已确认19题）

| 新 fine_category | 题数 |
|----------------|------|
| `attrib-pronoun` | 9 |
| `attrib-adverb` | 4 |
| `nounc-wh-pronoun` | 3 |
| `nounc-wh-adverb` | 3 |

---

## 完整对照表（19 题已确认）

### 定语从句 → attrib-pronoun（关系代词）

| exam_id | no | 答案 | restrictive | 旧标签 | 依据 |
|---------|-----|------|-------------|--------|------|
| 2024全国一卷 | 64 | that | true | attrib-choice | 先行词 the Silk Route（物），从句缺主语，解析明确"that/which"无逗号 |
| 2024广州一模 | 42 | which | true | attrib-choice | 先行词 windpipes（物），从句缺主语，解析"which/that"无逗号 |
| 2024广州二模 | 36 | which | true | attrib-choice | 先行词 a book（物），从句缺主语，解析"which/that"无逗号 |
| 2024浙江首考 | 58 | that | true | attrib-choice | 先行词 the way，从句缺主语，解析明确限制性用 that |
| 2025广州二模 | 62 | that | true | attrib-choice | 先行词 a version（物），从句缺主语，解析"that/which" |
| 2025浙江首考 | 63 | which | false | attrib-choice | 先行词 less formal clothing，解析**明确标注「非限制性定语从句」**，关系词作宾语 |
| 2024全国二卷 | 36 | who | false | attrib-restrictive-non | 先行词 Tang Xianzu（人），逗号前，缺主语，解析明确"非限制性" |
| 2025全国一卷 | 56 | which | false | attrib-restrictive-non | 先行词 Go/weiqi（物），逗号前，缺主语，解析明确"非限制性" |
| 2025深圳二模 | 41 | whose | false | attrib-restrictive-non | 先行词 his bike，作定语（所有格），解析明确"非限制性" |

### 定语从句 → attrib-adverb（关系副词）

| exam_id | no | 答案 | restrictive | 旧标签 | 依据 |
|---------|-----|------|-------------|--------|------|
| 2024深圳二模 | 37 | when | true | attrib-adverb | 先行词 a time（时间），从句结构完整作时间状语；解析明确限制性 |
| 2025全国二卷 | 36 | where | false | attrib-restrictive-non | 先行词 the countryside of Zhejiang（地点），逗号前，解析明确"非限制性" |
| 2025广州一模 | 42 | when | true | attrib-adverb | 先行词 moment（时间），从句结构完整作时间状语；解析明确限制性 |
| 2026深圳一模 | 36 | where | true | attrib-adverb | 先行词 world（地点），从句结构完整作地点状语；解析明确限制性 |

### 名词性从句 → nounc-wh-pronoun（连接代词）

| exam_id | no | 答案 | 从句类型 | 旧标签 | 依据 |
|---------|-----|------|---------|--------|------|
| 2024浙江首考 | 59 | what | 表语从句 | nounc-wh-words | 从句缺宾语（promote 的宾语），what 作连接代词 |
| 2024深圳一模 | 43 | what | 宾语从句 | nounc-wh-words | 从句缺宾语（所取得的成就），what 作连接代词 |
| 2025深圳一模 | 36 | what | 主语从句 | nounc-wh-words | 从句缺主语（what is truly remarkable），what 作连接代词 |

### 名词性从句 → nounc-wh-adverb（连接副词）

| exam_id | no | 答案 | 从句类型 | 旧标签 | 依据 |
|---------|-----|------|---------|--------|------|
| 2023全国二卷 | 62 | why | 表语从句 | nounc-wh-words | 从句结构完整，why 引导原因，作连接副词 |
| 2024广州一模 | 44 | how | 宾语从句 | nounc-wh-words | 从句结构完整（多么聪明），how 作连接副词 |
| 2025广州二模 | 56 | how | 宾语从句 | nounc-wh-words | 从句结构完整（如何变流行），how 作连接副词 |

---

## ⚠️ 待用户确认（1 题）

### 2026广州一模 #41 — when

**原始标注**：`attrib-adverb`  
**答案**：when  
**解析原文**：「考查定语从句/连词。……此处引导时间状语从句，意为"当……时"，应用连词 when。」

**问题**：解析标题写"定语从句/连词"，正文却说"时间状语从句"，存在内部矛盾。

**语境**：
> The most moving moment came ___41___ Song Yingxing took off his official robe and stepped into a "field"...

**两种合法分析**：

| 分析 | 结构 | 新标签 |
|------|------|--------|
| 先行词 moment 的定语从句 | The most moving moment [when S V...] | `attrib-adverb` `{type:"relative-adverb", word:"when", restrictive:true}` |
| 时间状语从句 | The most moving moment came [when S V...] | `advc-time` `{type:"time"}` |

**倾向意见**：从句法角度，"moment came when..." 中 when 更自然地作状语连词（The moment came at the time when → 状语），但高考答案标注的教学重点倾向定语从句（先行词 moment）。建议按**解析标题**归 `attrib-adverb`，但需教师最终确认。

**操作选项**：
- [ ] 确认归 `attrib-adverb`（关系副词，限制性，先行词 moment）
- [ ] 改归 `advc-time`（时间状语从句）

---

## 映射说明

- **`attrib-choice`（旧）→ attrib-pronoun / attrib-adverb**：旧标签仅表示"选填 that/which 类"，未区分关系词性质，现按答案关系词重分类。
- **`attrib-restrictive-non`（旧）→ attrib-pronoun / attrib-adverb**：旧标签仅表示"非限制性"，现按关系词类型重分类，`restrictive:false` 保留该信息。
- **`nounc-wh-words`（旧）→ nounc-wh-pronoun / nounc-wh-adverb**：按答案引导词词性拆分：从句缺成分（主/宾/表）→ wh-pronoun；从句结构完整 → wh-adverb。
- 本次样本中**无** advc-* 类题目，无需处理状语从句。

---

*关联文件：`docs/planning/retag-clauses-mapping.json`*
