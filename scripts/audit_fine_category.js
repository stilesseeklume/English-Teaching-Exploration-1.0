// scripts/audit_fine_category.js
//
// 静态启发式审计：扫 docs/data/grammar_bank.js 全部题目，用规则比对
// 答案形态 / grammar_point / fine_category 三者一致性，输出 Markdown 嫌疑题报告。
//
// 不依赖外部 API，不写回数据源，只生成 reports/fine_category_audit_<日期>.md。
//
// 运行：node scripts/audit_fine_category.js

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const BANK_PATH = path.join(ROOT, 'docs/data/grammar_bank.js');
const TAGS_PATH = path.join(ROOT, 'docs/data/grammar_fine_tags.js');
const REPORTS_DIR = path.join(ROOT, 'reports');

// ─── 1. 沙盒加载两个 js 文件，提取 window.GRAMMAR_BANK / GRAMMAR_FINE_TAGS ───
function loadData() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(BANK_PATH, 'utf8'), sandbox);
  vm.runInContext(fs.readFileSync(TAGS_PATH, 'utf8'), sandbox);
  return {
    BANK: sandbox.window.GRAMMAR_BANK,
    FINE_TAGS: sandbox.window.GRAMMAR_FINE_TAGS,
  };
}

// ─── 2. 启发式规则 ──────────────────────────────────────
//
// 每条规则返回 { hit: boolean, reason: string, severity: 'high'|'med'|'low' }
// hit=true 表示触发警告，需人工复核。
//
// 设计原则：
//   - high：硬矛盾，几乎必错（如 fine_category 的 category 字段 ≠ 题的 category）
//   - med：答案形态与 fine_category 大类不匹配
//   - low：grammar_point 与 fine_category 名称语义不一致

function getFineInfo(fineCat, FINE_TAGS) {
  return FINE_TAGS.tags_by_id[fineCat] || null;
}

// 答案形态分类
//
// 严格区分"单一词性词"和"多义词"：
//   - 单一词性词（and/but/in/on 等）才用于强期望匹配
//   - 多义词（that/which/who/for/as/before 等）归入 'multi-pos'，不触发 C 规则误报
function classifyAnswerForm(answer) {
  if (!answer) return 'unknown';
  const a = String(answer).trim().toLowerCase();
  if (!a) return 'unknown';

  // 含空格 → 多词答案
  if (a.includes(' ')) {
    if (a.startsWith('to ')) return 'to-do';
    if (a.startsWith('having ')) return 'having-done';
    if (a.startsWith('being ')) return 'being-done';
    return 'multi-word';
  }

  // 多义词（既可作代词/关系词/疑问词/介词/连词等，看上下文）—— 不强制期望
  const MULTI_POS = ['that','which','who','whom','whose','what','when','where','why','how',
                     'for','as','since','before','after','until','while','though'];
  if (MULTI_POS.includes(a)) return 'multi-pos';

  // 单词形态
  if (a === 'a' || a === 'an' || a === 'the') return 'article';
  // 纯代词（不含 that/which/who/what 这些多义词）
  if (['i','you','he','she','it','we','they','me','him','her','us','them',
       'my','your','his','its','our','their',
       'mine','yours','hers','ours','theirs',
       'myself','yourself','himself','herself','itself','ourselves','yourselves','themselves',
       'this','these','those','one','ones'].includes(a)) return 'pronoun';
  // 纯并列连词（不含 for——主要是介词）
  if (['and','but','or','so','yet','nor'].includes(a)) return 'coord-conj';
  // 纯从属连词（不含 as/since/before/after/until/while/when——多义）
  if (['because','although','if','unless','whereas'].includes(a)) return 'sub-conj';
  // 纯介词（不含 for/as/before/after/since/until——多义）
  if (['in','on','at','by','with','of','to','from','about','into','onto','through','during','among','between','under','over','against','beyond','within','without','despite'].includes(a)) return 'prep';

  // 词尾形态（粗判）
  if (/(tion|sion|ment|ness|ity|ance|ence|ship|hood|dom|ist|ism|er|or|ar|ee)$/.test(a)) return 'noun-derivation-candidate';
  if (/ly$/.test(a) && a.length > 3) return 'adv-candidate';  // happily, easily, recently
  if (/(ful|less|ous|able|ible|ive|al|ic|ish|ary|ory|en)$/.test(a)) return 'adj-candidate';
  if (/ing$/.test(a) && a.length > 4) return 'ing-form';   // 动名词或现在分词
  if (/ed$/.test(a) && a.length > 3) return 'ed-form';     // 过去分词或过去式
  if (/(s|es|ies)$/.test(a) && a.length > 2) return 'plural-or-3sg';
  if (/(est|er)$/.test(a) && a.length > 4) return 'comp-or-super-candidate';

  return 'base-form-or-other';
}

// 规则集合
const RULES = [
  // ─── 规则 A：fine_category 的 category 字段 vs 题 category ───
  // 注意：(word, number) 配对是已知的"分类系统性不一致"——
  //       fine_tags 把"名词复数 num-plural"归入 number 大类，
  //       而 grammar_bank 把这类题的 category 字段填为 word（词性转换）。
  //       这不是 AI 打错 tag，是分类设计冲突，单独用规则 G 列出。
  //       此处仅报告其他真正不兼容的硬矛盾。
  {
    id: 'A-category-mismatch',
    severity: 'high',
    check: (q, finfo) => {
      if (!finfo) return null;
      if (!q.category || !finfo.category) return null;
      if (q.category === finfo.category) return null;
      // 已知兼容对：word ↔ number（名词复数归类系统性差异）
      const compatPairs = [['word','number'], ['number','word']];
      if (compatPairs.some(p => p[0] === q.category && p[1] === finfo.category)) return null;
      return { reason: `题的 category="${q.category}" 但 fine_category 隶属于 "${finfo.category}"，硬矛盾` };
    },
  },

  // ─── 规则 G：已知分类系统性差异（信息性，非错误） ───
  // 名词复数这类题，category="word" + fine_category 在 "number" 大类——
  // 这是设计冲突，需要决策："名词复数"归词性转换还是归数词大类？
  {
    id: 'G-known-classification-conflict',
    severity: 'info',
    check: (q, finfo) => {
      if (!finfo) return null;
      if (q.category === 'word' && finfo.category === 'number') {
        return { reason: '系统性归类冲突：题打 category="word"（词性转换），但 fine_tag "num-plural" 归入 number 大类。需统一分类决策。' };
      }
      return null;
    },
  },

  // ─── 规则 B：fine_category id 不在 FINE_TAGS 注册表 ───
  {
    id: 'B-unknown-fine-category',
    severity: 'high',
    check: (q, finfo) => {
      if (!q.fine_category) return { reason: '题缺 fine_category 字段' };
      if (!finfo) return { reason: `fine_category="${q.fine_category}" 不在 FINE_TAGS 注册表中` };
      return null;
    },
  },

  // ─── 规则 C：答案形态 vs fine_category 大类 ───
  {
    id: 'C-answer-form-vs-category',
    severity: 'med',
    check: (q, finfo) => {
      if (!finfo) return null;
      const form = classifyAnswerForm(q.answer);
      const cat = finfo.category;

      const expected = {
        'article': ['article'],
        'pronoun': ['pronoun'],
        'coord-conj': ['logic'],
        'sub-conj': ['logic', 'advclause', 'attrib', 'nounclause'],
        'prep': ['preposition'],
        'to-do': ['nonpredicate', 'predicate'],
        'having-done': ['nonpredicate'],
        'being-done': ['nonpredicate'],
        'ing-form': ['nonpredicate', 'predicate', 'word'],  // 也可能是 -ing 形容词
        'ed-form': ['nonpredicate', 'predicate', 'word'],   // 也可能是 -ed 形容词
        'noun-derivation-candidate': ['word', 'number'],
        'adv-candidate': ['word'],
        'adj-candidate': ['word'],
        'comp-or-super-candidate': ['word'],
      };

      if (expected[form] && !expected[form].includes(cat)) {
        return {
          reason: `答案 "${q.answer}" 形态判定为 "${form}"，期望 fine_category 大类 ∈ [${expected[form].join(', ')}]，实际是 "${cat}"`,
        };
      }
      return null;
    },
  },

  // ─── 规则 D：grammar_point 文本 vs fine_category 名称语义 ───
  {
    id: 'D-grammar-point-name-mismatch',
    severity: 'low',
    check: (q, finfo, FINE_TAGS) => {
      if (!finfo || !q.grammar_point) return null;
      const gp = q.grammar_point;
      const fname = finfo.name || '';

      // 关键词组对照表（grammar_point → fine_category.name 必含其一）
      const keywordMap = [
        { gp: ['形容词'], expect: ['形容词', '形/副', 'adj', '比较', '最高'] },
        { gp: ['副词'],   expect: ['副词', '形/副', 'adv'] },
        { gp: ['冠词'],   expect: ['冠词'] },
        { gp: ['代词'],   expect: ['代词'] },
        { gp: ['介词'],   expect: ['介词', 'prep'] },
        { gp: ['连词'],   expect: ['连词', '从句', '关联词'] },
        { gp: ['名词的数', '名词复数'], expect: ['名词', '复数', '可数'] },
      ];

      for (const m of keywordMap) {
        if (m.gp.some(k => gp.includes(k))) {
          if (!m.expect.some(k => fname.includes(k))) {
            return {
              reason: `grammar_point="${gp}" 但 fine_category 名称="${fname}" 不含期望关键词 [${m.expect.join('/')}]`,
            };
          }
        }
      }
      return null;
    },
  },

  // ─── 规则 E：动名词作"作状语"的存疑识别（valuing 这类） ───
  // 非谓语作状语理论上要求伴随/原因/时间等语义；
  // 如果答案是 -ing 形式 + fine_category 是 nonp-adverbial-*，
  // 但 explanation 没有伴随/原因/时间/方式/结果等关键词，则怀疑可能是同位语/宾补
  {
    id: 'E-ing-adverbial-vs-explanation',
    severity: 'med',
    check: (q, finfo) => {
      if (!finfo) return null;
      const isIngOrEd = /(ing|ed)$/.test(String(q.answer || '').toLowerCase());
      const isAdvNonp = /nonp-adverbial-/.test(q.fine_category || '');
      if (!isIngOrEd || !isAdvNonp) return null;
      const exp = q.explanation || '';
      const advKeywords = ['伴随', '原因', '时间', '方式', '结果', '让步', '条件', '状语', '同时'];
      const hasAdvKeyword = advKeywords.some(k => exp.includes(k));
      if (!hasAdvKeyword) {
        return {
          reason: `答案 "${q.answer}" 标为非谓语作状语，但 explanation 未提及"伴随/原因/时间/方式/结果/状语"等语义关键词；可能是同位语/宾补/定语等误归类`,
        };
      }
      return null;
    },
  },

  // ─── 规则 F：to-do 答案 vs fine_category 不是 nonp / 谓语 ───
  {
    id: 'F-todo-form-check',
    severity: 'med',
    check: (q, finfo) => {
      if (!finfo) return null;
      const a = String(q.answer || '').toLowerCase().trim();
      if (!a.startsWith('to ')) return null;
      // to do 几乎一定是非谓语
      if (finfo.category !== 'nonpredicate') {
        return { reason: `答案 "${q.answer}" 是 to-do 形式，但 fine_category 大类是 "${finfo.category}"，期望 nonpredicate` };
      }
      return null;
    },
  },
];

// ─── 3. 主流程 ──────────────────────────────────────
function audit() {
  const { BANK, FINE_TAGS } = loadData();
  const exams = BANK.exams || [];

  // 扁平化所有题
  const allQuestions = [];
  exams.forEach(exam => {
    (exam.questions || []).forEach(q => {
      allQuestions.push({ ...q, exam_id: exam.exam_id, year: exam.year });
    });
  });

  console.log(`扫描 ${exams.length} 套卷，共 ${allQuestions.length} 道题。`);

  const findings = [];
  allQuestions.forEach(q => {
    const finfo = getFineInfo(q.fine_category, FINE_TAGS);
    RULES.forEach(rule => {
      const hit = rule.check(q, finfo, FINE_TAGS);
      if (hit) {
        findings.push({
          rule: rule.id,
          severity: rule.severity,
          exam: q.exam_id,
          no: q.no,
          answer: q.answer,
          grammar_point: q.grammar_point,
          category: q.category,
          fine_category: q.fine_category,
          fine_name: finfo ? finfo.name : '(无效)',
          reason: hit.reason,
          explanation: q.explanation,
        });
      }
    });
  });

  console.log(`发现 ${findings.length} 条嫌疑警告。`);

  // ─── 4. 渲染 Markdown 报告 ───
  const today = new Date().toISOString().slice(0, 10);
  const reportPath = path.join(REPORTS_DIR, `fine_category_audit_${today}.md`);

  const byRule = {};
  findings.forEach(f => {
    if (!byRule[f.rule]) byRule[f.rule] = [];
    byRule[f.rule].push(f);
  });

  const bySeverity = { high: [], med: [], low: [], info: [] };
  findings.forEach(f => bySeverity[f.severity].push(f));

  let md = `# fine_category 静态启发式审计报告\n\n`;
  md += `**生成时间**：${new Date().toLocaleString('zh-CN')}\n\n`;
  md += `**扫描范围**：${exams.length} 套卷 × ${allQuestions.length} 道题\n\n`;
  md += `**规则数量**：${RULES.length} 条启发式规则\n\n`;
  md += `**发现警告**：${findings.length} 条\n`;
  md += `  - 🔴 高（硬矛盾，几乎必错）：${bySeverity.high.length} 条\n`;
  md += `  - 🟡 中（形态不匹配，多数为真）：${bySeverity.med.length} 条\n`;
  md += `  - 🟢 低（关键词不一致，可能是命名差异）：${bySeverity.low.length} 条\n`;
  md += `  - 🔵 信息（已知分类系统性差异，非 AI 打错）：${bySeverity.info.length} 条\n\n`;
  md += `---\n\n`;

  md += `## 规则说明\n\n`;
  md += `| 规则 ID | 严重度 | 说明 |\n|---|---|---|\n`;
  md += `| A-category-mismatch | 🔴 高 | fine_category 的 category 字段与题的 category 不一致 |\n`;
  md += `| B-unknown-fine-category | 🔴 高 | fine_category 缺失或不在 FINE_TAGS 注册表 |\n`;
  md += `| C-answer-form-vs-category | 🟡 中 | 答案形态（-ing/-ly/to do 等）与 fine_category 大类不匹配（多义词 that/which/for/as 等已排除） |\n`;
  md += `| D-grammar-point-name-mismatch | 🟢 低 | grammar_point 字段语义与 fine_category 名称语义不一致 |\n`;
  md += `| E-ing-adverbial-vs-explanation | 🟡 中 | -ing/-ed 形式标"作状语"但 explanation 无状语语义关键词（可能是同位/宾补/定语） |\n`;
  md += `| F-todo-form-check | 🟡 中 | to-do 答案但 fine_category 大类不是 nonpredicate |\n`;
  md += `| G-known-classification-conflict | 🔵 信息 | 系统性归类冲突（如名词复数：题 category=word vs fine_tag 在 number 大类），需统一决策 |\n`;
  md += `\n---\n\n`;

  // 按严重度分块输出
  ['high', 'med', 'low', 'info'].forEach(sev => {
    const items = bySeverity[sev];
    if (!items.length) return;
    const icon = sev === 'high' ? '🔴' : sev === 'med' ? '🟡' : sev === 'low' ? '🟢' : '🔵';
    const label = sev === 'high' ? '高严重度（硬矛盾，几乎必错）' :
                  sev === 'med'  ? '中严重度（形态不匹配，多数为真）' :
                  sev === 'low'  ? '低严重度（关键词不一致，可能是命名差异）' :
                                   '信息级（已知分类系统性差异，需统一决策而非逐题修）';
    md += `## ${icon} ${label}（${items.length} 条）\n\n`;

    items.forEach((f, i) => {
      md += `### ${i + 1}. ${f.exam} 第 ${f.no} 题 · 答案 "${f.answer}"\n\n`;
      md += `- **规则**：\`${f.rule}\`\n`;
      md += `- **grammar_point**：${f.grammar_point}\n`;
      md += `- **fine_category**：\`${f.fine_category}\` → 「${f.fine_name}」\n`;
      md += `- **怀疑原因**：${f.reason}\n`;
      md += `- **explanation 摘录**：${(f.explanation || '').slice(0, 180)}${(f.explanation || '').length > 180 ? '…' : ''}\n\n`;
    });
    md += `---\n\n`;
  });

  if (!findings.length) {
    md += `## ✅ 全部通过\n\n所有 ${allQuestions.length} 道题未触发任何启发式警告。\n`;
  }

  md += `\n*报告由 scripts/audit_fine_category.js 生成*\n`;

  fs.writeFileSync(reportPath, md, 'utf8');
  console.log(`报告已写入：${reportPath}`);
  return { reportPath, findings, total: allQuestions.length };
}

const result = audit();
console.log(`\n概要：扫描 ${result.total} 题，警告 ${result.findings.length} 条`);
