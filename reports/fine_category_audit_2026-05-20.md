# fine_category 静态启发式审计报告

**生成时间**：2026/5/20 11:12:31

**扫描范围**：19 套卷 × 190 道题

**规则数量**：7 条启发式规则

**发现警告**：4 条
  - 🔴 高（硬矛盾，几乎必错）：0 条
  - 🟡 中（形态不匹配，多数为真）：2 条
  - 🟢 低（关键词不一致，可能是命名差异）：2 条
  - 🔵 信息（已知分类系统性差异，非 AI 打错）：0 条

---

## 规则说明

| 规则 ID | 严重度 | 说明 |
|---|---|---|
| A-category-mismatch | 🔴 高 | fine_category 的 category 字段与题的 category 不一致 |
| B-unknown-fine-category | 🔴 高 | fine_category 缺失或不在 FINE_TAGS 注册表 |
| C-answer-form-vs-category | 🟡 中 | 答案形态（-ing/-ly/to do 等）与 fine_category 大类不匹配（多义词 that/which/for/as 等已排除） |
| D-grammar-point-name-mismatch | 🟢 低 | grammar_point 字段语义与 fine_category 名称语义不一致 |
| E-ing-adverbial-vs-explanation | 🟡 中 | -ing/-ed 形式标"作状语"但 explanation 无状语语义关键词（可能是同位/宾补/定语） |
| F-todo-form-check | 🟡 中 | to-do 答案但 fine_category 大类不是 nonpredicate |
| G-known-classification-conflict | 🔵 信息 | 系统性归类冲突（如名词复数：题 category=word vs fine_tag 在 number 大类），需统一决策 |

---

## 🟡 中严重度（形态不匹配，多数为真）（2 条）

### 1. 2024浙江首考 第 65 题 · 答案 "ones"

- **规则**：`C-answer-form-vs-category`
- **grammar_point**：
- **fine_category**：`special-substitution-ellipsis` → 「替代与省略」
- **怀疑原因**：答案 "ones" 形态判定为 "pronoun"，期望 fine_category 大类 ∈ [pronoun]，实际是 "special"
- **explanation 摘录**：

### 2. 2024深圳一模 第 38 题 · 答案 "using"

- **规则**：`E-ing-adverbial-vs-explanation`
- **grammar_point**：非谓语动词
- **fine_category**：`nonp-adverbial-2` → 「非谓语作状语（二）」
- **怀疑原因**：答案 "using" 标为非谓语作状语，但 explanation 未提及"伴随/原因/时间/方式/结果/状语"等语义关键词；可能是同位语/宾补/定语等误归类
- **explanation 摘录**：考查非谓语动词。句意：毽子是一种可以追溯到汉代的游戏，非常简单：玩家必须使用身体的任何部位，除了手和手臂，将毽子保持在空中。句中谓语是must keep，空格处用非谓语动词，players和use之间是主谓关系，因此空格处用现在分词表主动，故填using。

---

## 🟢 低严重度（关键词不一致，可能是命名差异）（2 条）

### 1. 2024全国二卷 第 42 题 · 答案 "visibility"

- **规则**：`D-grammar-point-name-mismatch`
- **grammar_point**：形容词
- **fine_category**：`word-noun-derivation` → 「名词派生（动→名 / 形→名 等）」
- **怀疑原因**：grammar_point="形容词" 但 fine_category 名称="名词派生（动→名 / 形→名 等）" 不含期望关键词 [形容词/形/副/adj/比较/最高]
- **explanation 摘录**：名词。international是形容词,应修饰名词。visible的名词形式为visibility,表示"知名度"。此处表示这些文化元素提高了斯特拉特福的国际知名度。

### 2. 2024广州二模 第 40 题 · 答案 "so"

- **规则**：`D-grammar-point-name-mismatch`
- **grammar_point**：连词
- **fine_category**：`logic-compound` → 「并列句」
- **怀疑原因**：grammar_point="连词" 但 fine_category 名称="并列句" 不含期望关键词 [连词/从句/关联词]
- **explanation 摘录**：考查连词。句意参考上题。“Visiting hilltop or cliff-top pagodas, or those hidden in deep forests, ___4___(require) great determination, physical strength and even luck”和“few people get to see t…

---


*报告由 scripts/audit_fine_category.js 生成*
