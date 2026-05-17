#!/usr/bin/env node
// scripts/tag_bank_with_fine_category.js
//
// Sprint 1 · Task 5：给 grammar_bank.js 的 190 道真题打 fine_category tag
//
// 输入：docs/data/grammar_bank.js（现有，每题有 category/grammar_point/explanation）
// 输出：docs/data/grammar_bank.js（覆盖，每题加上 fine_category 字段）
// 备份：docs/data/grammar_bank.js.bak.YYYYMMDD
//
// 规则：基于 category + grammar_point + explanation 关键词的启发式映射。
// 不确定的会标 fine_category: 'UNCERTAIN' + 输出 review.json 让人工校对。
//
// 运行：node scripts/tag_bank_with_fine_category.js
//      node scripts/tag_bank_with_fine_category.js --dry-run    （不写文件，只打印统计）

const fs = require('fs');
const path = require('path');

const BANK_PATH = path.join(__dirname, '..', 'docs', 'data', 'grammar_bank.js');
const TAGS_PATH = path.join(__dirname, '..', 'docs', 'data', 'grammar_fine_tags.js');
const REVIEW_OUT = path.join(__dirname, 'tag_review.json');

const DRY = process.argv.includes('--dry-run');

// 加载数据
global.window = {};
require(BANK_PATH);
require(TAGS_PATH);
const BANK = global.window.GRAMMAR_BANK;
const TAGS = global.window.GRAMMAR_FINE_TAGS;

// ─── 关键词匹配工具 ──────────────────────
function has(text, ...keywords) {
  if (!text) return false;
  return keywords.some(k => text.includes(k));
}

// ─── 主映射函数 ──────────────────────
// 输入 question 对象，输出 fine_category id（或 'UNCERTAIN'）
function classify(q) {
  const exp = (q.explanation || '') + ' ' + (q.grammar_point || '');
  const ans = (q.answer || '').toLowerCase();
  const cat = q.category;

  // ============= predicate 谓语动词 =============
  if (cat === 'predicate') {
    if (has(exp, '主谓一致')) {
      if (has(exp, '集合', '复数', '-s', '形状', 'pair')) return 'pred-sva-collective';
      if (has(exp, '数量', '分数', '百分')) return 'pred-sva-quantity';
      if (has(exp, '就近', '意义')) return 'pred-sva-meaning';
      return 'pred-sva-form';
    }
    if (has(exp, '被动语态') || has(ans, ' be ') || /(was|were|been|being|are|am|is)\s+\w+ed/.test(ans)) {
      if (has(exp, '主动形式表') || has(exp, '主动表被动')) return 'pred-passive-implicit';
      return 'pred-passive-form';
    }
    // 时态
    if (has(exp, '过去完成')) return 'pred-tense-past-perfect';
    if (has(exp, '现在完成')) return 'pred-tense-perfect';
    if (has(exp, '完成时')) return 'pred-tense-perfect';
    if (has(exp, '进行时')) return 'pred-tense-continuous';
    if (has(exp, '一般现在')) return 'pred-tense-present';
    if (has(exp, '一般过去') || has(exp, '一般将来') || has(exp, '过去将来')) return 'pred-tense-past-future';
    // 兜底
    return 'pred-tense-other';
  }

  // ============= nonpredicate 非谓语动词 =============
  if (cat === 'nonpredicate') {
    // 复合结构 / with 复合
    if (has(exp, '独立主格') || has(exp, 'with 复合', 'with的复合')) return 'nonp-absolute-with';
    if (has(exp, '复合结构')) return 'nonp-compound-structure';
    // 完成 / 被动 / 否定式（非谓语自身的形态变化）
    if (has(exp, '完成式') || has(exp, '被动式') || has(exp, '进行式') || has(exp, '否定式')) return 'nonp-perfect-passive-neg';
    // somebody is said to do
    if (has(exp, 'is said to') || has(exp, 'be said to')) return 'nonp-said-to-do';
    // there be + 非谓语
    if (has(exp, 'there be') && has(exp, '非谓语')) return 'nonp-therebe';
    // 作主语
    if (has(exp, '作主语') || has(exp, '充当主语')) return 'nonp-subject-predicative';
    // 作表语
    if (has(exp, '作表语') || has(exp, '充当表语')) return 'nonp-subject-predicative';
    // 作宾语
    if (has(exp, '作宾语')) return 'nonp-object';
    // 作宾补 / 主补 / 补语
    if (has(exp, '作宾补') || has(exp, '宾语补足语') || has(exp, '主语补足语') || has(exp, '作补语') || has(exp, '作宾语补')) return 'nonp-complement';
    // 作定语
    if (has(exp, '作定语') || has(exp, '充当定语') || has(exp, '定语')) return 'nonp-attribute';
    // 作状语
    if (has(exp, '作状语') || has(exp, '充当状语') || has(exp, '目的状语') || has(exp, '结果状语') || has(exp, '伴随状语')) return 'nonp-adverbial-1';
    // 连词 + 非谓语 / 省略
    if (has(exp, '省略') && has(exp, '非谓语')) return 'nonp-conj-elision';
    // === 兜底：用 answer 词形启发式 ===
    // to do 形式：默认按"作宾语"或"作状语"判断，多数语法填空 to do 是作状语（目的）或作宾语
    if (/^to\s+\w+/i.test(ans) || /^to\s+be\s+/i.test(ans)) {
      // 'to + 动词' 在高考语法填空里最常见的是作状语（目的状语）或作宾语
      // 如果上下文有"目的"暗示就 adverbial，否则默认 object
      if (has(exp, '目的') || has(exp, '为了')) return 'nonp-adverbial-1';
      return 'nonp-object';
    }
    // 过去分词形式（done）—— 通常作定语
    if (/^[a-z]+ed$/.test(ans) && !ans.includes(' ')) return 'nonp-attribute';
    // 现在分词 / 动名词（doing）—— 默认作状语
    if (/^[a-z]+ing$/.test(ans) && !ans.includes(' ')) return 'nonp-adverbial-1';
    // 被动 / 完成 / 进行的复合形式
    if (/\b(having|being|been)\s/i.test(ans)) return 'nonp-perfect-passive-neg';
    // 兜底
    return 'nonp-basic';
  }

  // ============= word 词性转换 =============
  if (cat === 'word') {
    // 比较级 / 最高级（优先）
    if (has(exp, '最高级')) return 'word-cmp-superlative';
    if (has(exp, '比较级')) return 'word-cmp-comparative';
    if (has(exp, '倍数')) return 'word-cmp-multiple';
    // -ed vs -ing 形容词
    if (has(exp, '-ed', '-ing') && has(exp, '形容词')) return 'word-ed-ing';
    // 短语动词
    if (has(exp, '短语动词') || has(exp, 'phrasal verb')) return 'word-phrasal-1';
    // 名词的数 / 所有格（这里不动到 number 类，标记为 other）
    if (has(exp, '所有格')) return 'word-adj-adv-other';
    if (has(exp, '名词复数') || has(exp, '名词的数') || (has(exp, '复数') && has(exp, '名词'))) return 'word-adj-adv-other';
    // 显式提到形容词 / 副词
    if (has(exp, '形容词') || has(q.grammar_point, '形容词')) return 'word-adj-adv-choice';
    if (has(exp, '副词') || has(q.grammar_point, '副词')) return 'word-adj-adv-choice';
    // 名词派生（动词→名词等）
    if (has(exp, '名词') || has(q.grammar_point, '名词')) return 'word-adj-adv-other';
    // === 兜底：用 answer 词形启发式 ===
    // 优先识别比较级 / 最高级（er/est 结尾）
    if (/[a-z]er$/.test(ans) && !/^(her|other|ever|inner|outer|over|under|further|never|either|either|neither)$/.test(ans)) return 'word-cmp-comparative';
    if (/[a-z]est$/.test(ans)) return 'word-cmp-superlative';
    // -ly 结尾 → 副词
    if (/ly$/.test(ans) && ans.length > 3) return 'word-adj-adv-choice';
    // -ed 结尾 → 过去分词作形容词，归词性转换里的 adj-adv-other 或 ed-ing
    if (/[a-z]ed$/.test(ans)) return 'word-ed-ing';
    // -ing 结尾 → 现在分词作形容词
    if (/[a-z]ing$/.test(ans)) return 'word-ed-ing';
    // -s 结尾且不是 -ous / -ss / -ess → 可能复数名词
    if (/[a-z]s$/.test(ans) && !/(ous|ss|ess|ious|us)$/.test(ans) && ans.length > 3) return 'word-adj-adv-other';
    // 常见形容词后缀
    if (/(ful|less|ous|ive|able|ible|al|ic|ish|ant|ent|y|ary|ory|ical)$/.test(ans)) return 'word-adj-adv-choice';
    // 常见名词后缀
    if (/(tion|sion|ment|ness|ity|ence|ance|ship|hood|er|or|ist|ism|al|age|ure|dom)$/.test(ans)) return 'word-adj-adv-other';
    // 兜底
    return 'word-adj-adv-other';
  }

  // ============= article 冠词 =============
  if (cat === 'article') {
    if (ans === 'the' || has(exp, '定冠词')) return 'art-the';
    if (ans === 'a' || ans === 'an' || has(exp, '不定冠词')) return 'art-a-an';
    if (has(exp, '不用冠词') || has(exp, '零冠词')) return 'art-zero';
    if (has(exp, '特指') || has(exp, '类指')) return 'art-specific-indefinite';
    return 'art-other';
  }

  // ============= pronoun 代词 =============
  if (cat === 'pronoun') {
    if (has(exp, '反身代词') || has(q.grammar_point, '反身代词')) return 'pron-personal-possessive';
    if (has(exp, '物主代词')) return 'pron-personal-possessive';
    if (has(exp, '人称代词')) return 'pron-personal-possessive';
    if (has(exp, '指示代词')) return 'pron-personal-possessive';
    if (ans === 'it' || ans === 'its' || has(exp, 'it') && has(exp, '形式')) return 'pron-it';
    if (has(exp, '不定代词')) return 'pron-indefinite-1';
    return 'pron-personal-possessive';
  }

  // ============= preposition 介词 =============
  if (cat === 'preposition') {
    // 动介搭配
    if (has(exp, '动介搭配') || has(exp, '与...搭配') || has(exp, '搭配')) return 'prep-verb';
    // 时间 / 地点判断
    if (has(exp, '时间')) return 'prep-time';
    if (has(exp, '地点') || has(exp, '位置')) return 'prep-location';
    // 固定搭配
    if (has(exp, '固定') || has(exp, '惯用')) return 'prep-common';
    return 'prep-common';
  }

  // ============= logic 逻辑连词 =============
  if (cat === 'logic') {
    if (has(exp, '并列句') || has(exp, '并列连接两个')) return 'logic-compound';
    return 'logic-conj-phrase';
  }

  // ============= attrib 定语从句 =============
  if (cat === 'attrib') {
    if (has(exp, '非限制性')) return 'attrib-restrictive-non';
    if (has(exp, '介词+关系代词') || has(exp, '介词加关系代词')) return 'attrib-prep-relative';
    if (has(exp, '关系副词') || ans === 'where' || ans === 'when' || ans === 'why') return 'attrib-adverb';
    if (has(exp, 'as') && has(exp, '关系代词')) return 'attrib-as-but-than';
    if (has(exp, '只能用that') || has(exp, '不能用which')) return 'attrib-only-that';
    if (has(exp, '同位语')) return 'attrib-vs-appositive';
    // 默认走"关系词选择"
    return 'attrib-choice';
  }

  // ============= nounclause 名词性从句 =============
  if (cat === 'nounclause') {
    if (has(exp, '间接引语') || has(exp, '直接引语') || has(exp, '间直引语')) return 'nounc-reported';
    // whatever / whoever 等
    if (/whatever|whoever|whichever|whenever|wherever|however/i.test(ans) || has(exp, 'whatever', 'whoever')) {
      return 'nounc-ever-words';
    }
    // wh 引导
    if (/^(what|when|where|how|why|who|which|whose)$/i.test(ans.trim())) return 'nounc-wh-words';
    return 'nounc-connectors';
  }

  // ============= 兜底 =============
  return 'UNCERTAIN';
}

// ─── 执行打 tag + 统计 ──────────────────────
const tagCounts = {};
const uncertain = [];
let total = 0;

BANK.exams.forEach(exam => {
  (exam.questions || []).forEach(q => {
    total++;
    const tag = classify(q);
    q.fine_category = tag;
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    if (tag === 'UNCERTAIN' || !TAGS.tags_by_id[tag]) {
      uncertain.push({
        exam: exam.exam_id,
        no: q.no,
        category: q.category,
        grammar_point: q.grammar_point,
        answer: q.answer,
        explanation: (q.explanation || '').slice(0, 200),
        assigned_tag: tag
      });
    }
  });
});

// ─── 打印统计 ──────────────────────
console.log(`\n总题数: ${total}`);
console.log(`成功打 tag: ${total - uncertain.length} (${((1 - uncertain.length/total)*100).toFixed(1)}%)`);
console.log(`UNCERTAIN: ${uncertain.length}\n`);

console.log('精细 tag 分布（前 20）:');
Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 20).forEach(([tag, n]) => {
  const tagInfo = TAGS.tags_by_id[tag];
  const name = tagInfo ? tagInfo.name : '（未在 tag 表中）';
  console.log(`  ${tag.padEnd(40)} ${String(n).padStart(3)}  ${name}`);
});

if (uncertain.length > 0) {
  fs.writeFileSync(REVIEW_OUT, JSON.stringify(uncertain, null, 2), 'utf8');
  console.log(`\nUNCERTAIN 题已写入 ${REVIEW_OUT}，请人工校对`);
}

// ─── 写回 grammar_bank.js（除非 --dry-run）─
if (DRY) {
  console.log('\n[--dry-run] 不写文件，仅打印统计');
  process.exit(0);
}

// 备份
const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const backupPath = `${BANK_PATH}.bak.${stamp}`;
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(BANK_PATH, backupPath);
  console.log(`\n已备份原文件 → ${backupPath}`);
}

// 生成新内容（保持 `window.GRAMMAR_BANK = {...};` 包装格式）
const newContent = 'window.GRAMMAR_BANK = ' + JSON.stringify(BANK, null, 2) + ';\n';
fs.writeFileSync(BANK_PATH, newContent, 'utf8');
console.log(`已写回 ${BANK_PATH}`);
console.log(`新文件大小: ${(fs.statSync(BANK_PATH).size / 1024).toFixed(1)} KB`);
