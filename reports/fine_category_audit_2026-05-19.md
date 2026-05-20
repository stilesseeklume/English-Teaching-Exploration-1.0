# fine_category 静态启发式审计报告

**生成时间**：2026/5/19 22:36:02

**扫描范围**：19 套卷 × 190 道题

**规则数量**：7 条启发式规则

**发现警告**：13 条
  - 🔴 高（硬矛盾，几乎必错）：0 条
  - 🟡 中（形态不匹配，多数为真）：1 条
  - 🟢 低（关键词不一致，可能是命名差异）：0 条
  - 🔵 信息（已知分类系统性差异，非 AI 打错）：12 条

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

## 🟡 中严重度（形态不匹配，多数为真）（1 条）

### 1. 2024深圳一模 第 38 题 · 答案 "using"

- **规则**：`E-ing-adverbial-vs-explanation`
- **grammar_point**：非谓语动词
- **fine_category**：`nonp-adverbial-2` → 「非谓语作状语（二）」
- **怀疑原因**：答案 "using" 标为非谓语作状语，但 explanation 未提及"伴随/原因/时间/方式/结果/状语"等语义关键词；可能是同位语/宾补/定语等误归类
- **explanation 摘录**：考查非谓语动词。句意：毽子是一种可以追溯到汉代的游戏，非常简单：玩家必须使用身体的任何部位，除了手和手臂，将毽子保持在空中。句中谓语是must keep，空格处用非谓语动词，players和use之间是主谓关系，因此空格处用现在分词表主动，故填using。

---

## 🔵 信息级（已知分类系统性差异，需统一决策而非逐题修）（12 条）

### 1. 2023全国二卷 第 61 题 · 答案 "interviews"

- **规则**：`G-known-classification-conflict`
- **grammar_point**：名词的数
- **fine_category**：`num-plural` → 「名词复数形式」
- **怀疑原因**：系统性归类冲突：题打 category="word"（词性转换），但 fine_tag "num-plural" 归入 number 大类。需统一分类决策。
- **explanation 摘录**：考查名词的数。句意：他们还需要准备好用英语接受国际记者的采访。分析句子结构可知，空前是动词，所以空处应填名词作宾语，interview意为"采访"为可数名词，不止一段采访，应用复数形式。故填interviews。

### 2. 2024全国一卷 第 62 题 · 答案 "favourites"

- **规则**：`G-known-classification-conflict`
- **grammar_point**：名词复数
- **fine_category**：`num-plural` → 「名词复数形式」
- **怀疑原因**：系统性归类冲突：题打 category="word"（词性转换），但 fine_tag "num-plural" 归入 number 大类。需统一分类决策。
- **explanation 摘录**：名词复数。分析句子结构可知，空处作动词included的宾语，前面的modern Western为定语，所以此处应填名词；根据空后的举例“such as rosemary, lavender and fennel”可知，空处表示复数概念。故填favourites。favourite在此处为可数名词，表示“特别喜爱的事物”。

### 3. 2024全国二卷 第 37 题 · 答案 "themes"

- **规则**：`G-known-classification-conflict`
- **grammar_point**：名词复数
- **fine_category**：`num-plural` → 「名词复数形式」
- **怀疑原因**：系统性归类冲突：题打 category="word"（词性转换），但 fine_tag "num-plural" 归入 number 大类。需统一分类决策。
- **explanation 摘录**：名词复数。根据"there are"可知,此处应用名词复数themes。句意:虽然他们可能从未见过面,但是他们的作品中有共同的主题。

### 4. 2024广州一模 第 45 题 · 答案 "wonders"

- **规则**：`G-known-classification-conflict`
- **grammar_point**：名词的数
- **fine_category**：`num-plural` → 「名词复数形式」
- **怀疑原因**：系统性归类冲突：题打 category="word"（词性转换），但 fine_tag "num-plural" 归入 number 大类。需统一分类决策。
- **explanation 摘录**：考查名词的数。句意：这些永恒的建筑奇迹继续激励着建筑师们努力寻找绿色解决方案来为房屋和建筑物降温。根据上文these可知wonder应用复数形式。故填wonders。

### 5. 2024广州二模 第 43 题 · 答案 "photos"

- **规则**：`G-known-classification-conflict`
- **grammar_point**：名词的数
- **fine_category**：`num-plural` → 「名词复数形式」
- **怀疑原因**：系统性归类冲突：题打 category="word"（词性转换），但 fine_tag "num-plural" 归入 number 大类。需统一分类决策。
- **explanation 摘录**：考查名词的数。句意参考上题。photo意为“照片”，为可数名词，其前没有表示数量的限定词，应用名词复数。故填photos。

### 6. 2024深圳一模 第 44 题 · 答案 "benefits"

- **规则**：`G-known-classification-conflict`
- **grammar_point**：名词的复数
- **fine_category**：`num-plural` → 「名词复数形式」
- **怀疑原因**：系统性归类冲突：题打 category="word"（词性转换），但 fine_tag "num-plural" 归入 number 大类。需统一分类决策。
- **explanation 摘录**：考查名词的复数。句意：练了30多年的毽子，Chai很珍惜这项运动给身体和社会带来的好处。benefit是可数名词，不止一个，因此空格处用复数，故填benefits。

### 7. 2024深圳二模 第 44 题 · 答案 "links"

- **规则**：`G-known-classification-conflict`
- **grammar_point**：名词的数
- **fine_category**：`num-plural` → 「名词复数形式」
- **怀疑原因**：系统性归类冲突：题打 category="word"（词性转换），但 fine_tag "num-plural" 归入 number 大类。需统一分类决策。
- **explanation 摘录**：考查名词的数。句意：Lillian凭借她的热情和专业知识，在冰岛和中国之间建立了多样化的文化联系。link意为“联系”，为可数名词。前面有diverse修饰，这里应用名词复数。故填links。

### 8. 2025全国二卷 第 44 题 · 答案 "afternoons"

- **规则**：`G-known-classification-conflict`
- **grammar_point**：名词的数
- **fine_category**：`num-plural` → 「名词复数形式」
- **怀疑原因**：系统性归类冲突：题打 category="word"（词性转换），但 fine_tag "num-plural" 归入 number 大类。需统一分类决策。
- **explanation 摘录**：考查名词的数。句意：我住的地方，晒干的衣服闻起来特别香，这要归功于没有烟雾，而且下午有很多蓝天和新鲜空气。afternoon"下午"是可数名词，此处指不止一个下午，应用复数形式afternoons。故填afternoons。

### 9. 2025广州一模 第 39 题 · 答案 "entries"

- **规则**：`G-known-classification-conflict`
- **grammar_point**：名词的复数
- **fine_category**：`num-plural` → 「名词复数形式」
- **怀疑原因**：系统性归类冲突：题打 category="word"（词性转换），但 fine_tag "num-plural" 归入 number 大类。需统一分类决策。
- **explanation 摘录**：考查名词的复数。句意：在获奖作品中，Jia Haining团队关于黄河三角洲东方鹳的作品引人注目。entry是可数名词，不止一个，因此空格处用复数，故填entries。

### 10. 2025广州二模 第 57 题 · 答案 "cities"

- **规则**：`G-known-classification-conflict`
- **grammar_point**：名词复数
- **fine_category**：`num-plural` → 「名词复数形式」
- **怀疑原因**：系统性归类冲突：题打 category="word"（词性转换），但 fine_tag "num-plural" 归入 number 大类。需统一分类决策。
- **explanation 摘录**：cities 考查名词复数。介词like后列举多个城市名称，表示泛指“纽约、伦敦、悉尼等城市”，故用复数形式cities。

### 11. 2026广州一模 第 37 题 · 答案 "gestures"

- **规则**：`G-known-classification-conflict`
- **grammar_point**：名词复数
- **fine_category**：`num-plural` → 「名词复数形式」
- **怀疑原因**：系统性归类冲突：题打 category="word"（词性转换），但 fine_tag "num-plural" 归入 number 大类。需统一分类决策。
- **explanation 摘录**：考查名词复数。句意：在轻柔的翻页声和流水声的陪伴下，他们优雅的姿态构成了一幅生动的劳动画卷。gesture为可数名词，结合句中their（他们的）可知，此处应用复数形式，指代多名舞者的姿态。故填gestures。

### 12. 2026深圳一模 第 42 题 · 答案 "illustrations"

- **规则**：`G-known-classification-conflict`
- **grammar_point**：名词
- **fine_category**：`num-plural` → 「名词复数形式」
- **怀疑原因**：系统性归类冲突：题打 category="word"（词性转换），但 fine_tag "num-plural" 归入 number 大类。需统一分类决策。
- **explanation 摘录**：考查名词。句意：书中每一页都配有精心的注释、生动的背景故事与中国传统国画风格的插图。空处为名词作宾语，illustration意为“插图”，是可数名词，此处表示泛指，且没有冠词限定，应用复数形式。故填illustrations。

---


*报告由 scripts/audit_fine_category.js 生成*
