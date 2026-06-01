# 考点视图对齐 + 错题本讲评体验 · 设计文档

> 日期：2026-06-02 · 分支：`feat/points-view-align`（Part A）/ `feat/errorbook-teaching-ux`（Part B，后开）
> 状态：待用户审阅

## 背景

组长/老师在用语法填空讲评工具时反馈了四个体验问题，归为两个独立子系统：

- **Part A · 考点视图**：文字版与图谱里，同一批题在多个兄弟叶子下重复显示（如「比较级 / 最高级 / 构成规则 / 倍数表达」都显示「3题·真题1·模拟2」），点进迁移训练后「感觉怪怪的」。
- **Part B · 错题本讲评**：①考点分组不能折叠；②点一道题先落到练习页、要再点一次才进全局讲题（多一层多余页）；③想直接做题时答案总是显示着，没有「先藏后揭」。

## 根因：为什么打了那么仔细的地基还会漂移

「打地基」打的是**两样东西**——方法论，和 `grammar_fine_tags.js`（57 个标准考点 tag 的权威目录）。但**驱动考点视图叶子的是另一份文件 `decision_map.js`**，它的文件头自述「独立于 teaching_graph，互不影响」，是按「做题时脑子里的判断」手工搭的决策树，叶子的 `fine` tag 是**手工挂上去的**。

漂移由三件事叠加：

1. **两套 taxonomy 并行、且没有强制对齐校验**。`fine_tags` 是标准，`decision_map` 手工引用，没有任何测试断言「每个叶子的 fine 都存在于 fine_tags」「每个 fine 恰好一个叶子或有正当的 point+keys 细分」。
2. **`fine_tags` 后来重订过（体系重订 2026-05-31 / 06-01：删 `word-adj-vs-adv`、拆代词、加 only-that…），`decision_map` 没同步**。于是出现：引用死 tag（形容词的选用→已删的 adj-vs-adv，永远计 0）、漏 tag、把标准里分开的（人称/物主/反身/指示）乱并成一叶（导致物主/不定的题成了孤儿不显示）。
3. **决策树按「教材理想」拆，题库按「真题实际」标，两者粒度天生不一致**。教材会把比较级细分成 比较级/最高级/构成/倍数，但每道题只带一个 `fine_category`（都是 `word-comparative`），`facets.subtype` 也只有 `comparative` 一种值——理想叶子比数据细，于是空叶被填成「重复显示同一批题」。

**教训 → 本次顺手加一道防线**：新增一个一致性测试，断言 `decision_map` 与 `fine_tags` 对齐，让它**不能再悄悄漂移**。

---

## Part A · 考点视图对齐标准 tag 表

### 原则（一句话）

> **一个叶子 = 做题时真正要区分、且题库里确实有多种取值的那个轴。**
> 轴存在（时态、关系词、逻辑关系）→ 按它 `point + keys` 拆；轴不存在（比较级 subtype 单一、主谓一致只是不同动词）→ 并成一叶。

好处：`buildQuestionPoints` 早已算好这些 key（关系词 `key:word`、并列 `key:关系`、时态 `key:tense`），所以**派生逻辑基本不动，主要改 `decision_map.js`**。

### 数据现状（2026-06-02 实测 `grammar_bank.js`）

```
关系代词 attrib-pronoun (18):  which 8 · that 6 · who 2 · whose 2     → 分得开
关系副词 attrib-adverb (10):   when 6 · where 4 · (why 0)             → 分得开
并列连词 logic-coordinating(24): and 14 · or 6 · but 2 · so 2          → 分得开
比较级   word-comparative (6):  subtype 全是 comparative              → 暂分不开（最高级=0）
主谓一致 pred-agreement (16):   只是不同动词，无考点轴                → 分不开
副词/形容词 word-adv/adj:        subtype 全是 derivation               → 分不开
不定代词 pron-indefinite (2):   全是 ones                            → 太薄
```

### 目标叶子表（请逐条核对）

「拆」= 用 `point:{tag,keys}` 按轴拆；「并」= 单叶按 `fine` 计数；灰 = 0 题置灰（传新卷激活）。

| 类别 | 目标叶子 | 计数方式 | 说明 |
|---|---|---|---|
| 谓语·时态 | 一般现在 / 一般过去 / 一般将来·过去将来 / 进行体 / 完成体 / 完成进行 | point+keys（facets.tense） | **不动**，已正确 |
| 谓语·语态 | 被动语态 | point（pred-passive，keyless 通配） | 并掉 implicit 占位叶 |
| 谓语·主谓一致 | 主谓一致 | fine | **并**（4→1，用户确认） |
| 非谓语 | to do / doing / done | fine | 不动，已 1:1 |
| 词性·名词 | 派生名词 | fine（word-noun） | |
| 名词/数词 | 名词复数 / 名词所有格 / 数词 | fine | 不动 |
| 词性·形容词 | 派生形容词 | fine（word-adj） | **并**（-ed/-ing+辨析→1），删死叶「形容词的选用」 |
| 词性·副词 | 派生副词 | fine（word-adv） | **并**（3→1） |
| 词性·比较 | **比较级** / **最高级（灰，0）** | point+keys（facets.subtype: comparative / superlative） | **拆**（用户：总有一天要分开）；删「构成规则/倍数」叶 |
| 介词 | 常见 / 时间 / 地点 / 动介 / 其他 | fine | 不动，已 1:1 |
| 冠词 | a/an / the | fine | 零冠词不建（不考） |
| 代词 | 人称 / 物主 / 反身（灰） / 指示（灰） / 不定代词 / it | fine（各自 tag） | **拆**回标准；并掉不定代词一/二 |
| 并列连词 | 并列(and) / 选择(or) / 转折(but) / 因果(so) | point+keys（key=关系） | **拆** |
| 定从·关系代词 | which / that / who / whose | point+keys（attrib-pronoun, key=词） | **拆**（用户确认） |
| 定从·关系副词 | when / where / why（灰） | point+keys（attrib-adverb, key=词） | **拆**（用户：有 when/where/why） |
| 定从·介词+关系词 | 介词+关系词（灰，0） | fine（attrib-prep-relative） | 保留置灰 |
| 名词性从句 | that / whether·if / 连接代词 / 连接副词 / wh-ever | fine | 不动，已 1:1 |
| 状语从句 | 时间/原因/地点/条件/方式/让步/比较/目的/结果 | fine | 不动，已 1:1 |

**不建（语法填空几乎不考，用户确认）**：派生动词 word-verb、情态动词 modal ×4、特殊句式 special ×5、零冠词 art-zero、as 作关系词 attrib-as。

### 代码改动点

1. **`docs/data/decision_map.js`**（主）：按上表重排 word/pronoun/attrib/logic/sva 叶子；该 point+keys 的挂 point；删死叶/never-tested 叶。
2. **`docs/grammar-fill/modules/question-points.js`**（小）：word 分支为 `word-comparative` 补 `key: facets.subtype`（让比较级/最高级可分），其余 word fine 不变。其余类别的 key 已就绪，不改。
3. **新增一致性测试**（防再漂移）：断言 `decision_map` 每个叶子的 `fine`（及 `point.tag`）都存在于 `grammar_fine_tags`；每个「应被覆盖」的 fine 至少有一个叶子；不建清单之外不出现孤儿 fine。
4. 文字版 + 图谱都读 `decision_map`，自动同步，无需各自改。

### 验证
- 一致性测试绿。
- 考点视图：比较级 3、最高级 0(灰)；关系代词 which/that/who/whose 各显真实数；并列 and/or/but/so 各显真实数；主谓一致单叶。
- 点任一叶子进迁移，只出该叶子的题（标签与内容对得上）。

---

## Part B · 错题本讲评体验（独立分支）

### ① 考点分组折叠成卡片
每个考点（如「谓语动词 · 2 题」）渲染成**默认折叠**的卡片，点卡片头展开列出该考点全部题。顶部筛选 chip 保留。改 `renderErrorBook()`（index.html:1471）+ 样式。

### ② 点题直进全局讲题、退出回错题本
`viewErrorQuestion()`（index.html:1449）改走已有的「直接开讲题台」路径（`switchPageKeepingTeaching` + `openTeachingStageByIdx`，参考 index.html:4783-4788），不再先落练习页。**关键**：确保关闭/返回讲题台时落点是错题本列表（previousView=error-book 已支持「返回错题本」，需确认 `closeTeachingStage` 的落点）。

### ③ 错题卡片答案默认隐藏、可点开
卡片默认只显示题干（带空格 `___57___`），不显示答案行。卡片上加「显示答案」小按钮，点它展开答案+解析预览（`stopPropagation`，不触发进讲题）。三条路分开：想做就做 / 想看答案点一下 / 想精讲点卡片。

---

## 不做（YAGNI）
- 不做「全接通所有 facet」——实测除时态/关系词/逻辑/比较 subtype 外，其余 facet（agreement 布尔、adj/adv subtype 单一）救不了任何重复组，接了也分不出东西。`point+keys` 机制保留，将来补细分数据再加叶，零返工。
- 不补题库细分数据（最高级/倍数/反身/指示的真题）——属于另一项数据活，本次只把叶子结构和置灰准备好。

## 实现与分支策略
- Part A：`feat/points-view-align`（本分支）。
- Part B：`feat/errorbook-teaching-ux`（后从 main 开）。
- 两者独立，各自 path-scoped 提交、各自精确 SHA 推送（仓库常并行多会话，避免互相覆盖）。
- 全程 TDD。
