# 语法填空二级陷阱标签层

> 更新时间：2026-05-15  
> 数据文件：`data/grammar_knowledge_traps.js`

## 为什么加这一层

现有 `category` 解决的是“这题大概属于哪类语法”：谓语、非谓语、词性、冠词、从句等。它适合自动分类和统计，但讲题时仍然偏粗。

二级 `trap_id` 解决的是“学生具体卡在哪里”：

- `nonp-logical-subject-not-sentence-subject`：逻辑主语不一定是句子主语
- `attrib-pronoun-vs-adverb`：关系代词还是关系副词
- `word-parallel-same-form`：并列结构形态一致
- `pred-gerund-subject-singular`：动名词 / 不定式短语作主语看单数

这层不替换 `category`，而是叠加在 category 下面。没有 `trap_id` 的旧题仍按 category 展示。

## 资源分工

| 资源 | 角色 | 用法 |
|---|---|---|
| 语法通霸 | 承重墙 | 语法事实、易混规则、细则出处 |
| 人教版教材语法附录 | 承重墙 | 与学生熟悉的话术对齐 |
| 课程标准 | 指南针 | 控制讲解深度，不把偏怪知识前置 |
| 真题题库 | 校准器 | 验证哪些陷阱值得优先讲 |
| 六大题型方法论 | 脚手架 | 保留为导读，不作为最终知识依据 |

## 数据结构

每个 trap 条目包含：

- `id`：稳定二级标签，可写入题目 `trap_id`
- `category`：现有 11 类粗标签之一
- `name`：给老师/学生看的陷阱名
- `frequency`：高频 / 中频 / 低频 / 储备
- `one_liner`：讲题时先点破的一句话
- `micro_rule`：可操作的小规则
- `common_wrong_answers`：常见误填/误判
- `teaching_move`：课堂点拨动作
- `examples`：当前题库真题反链
- `compare_with`：易混 trap
- `sources`：语法通霸 / 教材附录出处

## 当前版本

`v0.1.0` 共 83 条：

| category | 数量 |
|---|---:|
| predicate | 10 |
| nonpredicate | 16 |
| word | 11 |
| number | 4 |
| article | 6 |
| pronoun | 6 |
| preposition | 6 |
| logic | 5 |
| attrib | 8 |
| nounclause | 6 |
| advclause | 5 |

## 下一步接入建议

1. 先给 `data/grammar_bank.js` 中 190 道题批量补 `trap_id`，保留人工复核空间。
2. drawer 的解析页优先显示具体 trap：`考点：非谓语动词 · 逻辑主语不一定是句子主语`。
3. 迁移训练优先按 `trap_id` 关联；没有 `trap_id` 时回退到 `category`。
4. AI 助手 prompt 要求引用 trap 的 `one_liner`、`micro_rule`、`teaching_move`，避免泛泛讲“非谓语三步法”。
5. 错题热图先按 trap 聚合，再按 category 汇总。
