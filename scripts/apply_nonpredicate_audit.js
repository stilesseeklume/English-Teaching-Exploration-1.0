#!/usr/bin/env node
/*
 * Add the non-finite verb teaching axis to the public grammar bank.
 *
 * This is intentionally a small deterministic data patch: docs/data/grammar_bank.js
 * is the GitHub Pages canonical bank, and the generated audit table gives teachers
 * a readable review surface before the next round of feedback.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const BANK_PATH = path.join(ROOT, 'docs', 'data', 'grammar_bank.js');
const AUDIT_PATH = path.join(ROOT, 'docs', 'planning', 'nonpredicate-audit.md');

const FUNCTION_LABELS = {
  subject_predicative: '作主语 / 表语',
  object: '作宾语',
  attribute: '作定语',
  adverbial: '作状语',
  complement: '作补语',
  with_absolute: 'with 复合结构',
  other: '其他'
};

const FORM_LABELS = {
  to_do: 'to do',
  doing: 'doing',
  done: 'done',
  to_be_done: 'to be done',
  being_done: 'being done',
  having_done: 'having done',
  having_been_done: 'having been done',
  bare_do: 'bare do',
  other: 'other'
};

const NONP_FIELDS = [
  'nonp_function',
  'nonp_function_label',
  'nonp_form',
  'nonp_form_label',
  'nonp_rule',
  'nonp_needs_review'
];

const CORRECTIONS = {
  '2023浙江首考#60': {
    category: 'predicate',
    category_name: '谓语动词',
    fine_category: 'pred-tense-past-future',
    grammar_point: '谓语动词',
    explanation: '考查谓语动词。句中缺少谓语，主语 The large siheyuan of these high-ranking officials and wealthy businessmen 与 feature 是主动关系；结合上文 dynastic period、Ming Dynasty 等历史语境，用一般过去时 featured。'
  }
};

const AUDIT = {
  '2023全国一卷#57': {
    nonp_function: 'object',
    nonp_form: 'to_do',
    nonp_rule: '特定动词 decide 后接 to do 作宾语，空格与后面的 to put 并列。'
  },
  '2023全国一卷#59': {
    nonp_function: 'attribute',
    nonp_form: 'done',
    nonp_rule: 'recognized 修饰 home，home 与 recognize 是动宾关系，用 done 作前置定语。'
  },
  '2023全国一卷#61': {
    nonp_function: 'complement',
    nonp_form: 'to_be_done',
    nonp_rule: 'allow 后接宾语补足语；them 与 lift out 是动宾关系，所以用 to be done。'
  },
  '2023全国一卷#65': {
    nonp_function: 'complement',
    nonp_form: 'doing',
    nonp_rule: 'be left 后接主语补足语，I 与 want 是主谓关系，用 doing 表主动状态。'
  },
  '2023浙江首考#58': {
    nonp_function: 'adverbial',
    nonp_form: 'done',
    nonp_rule: '主句已有谓语，the Forbidden City 与 surround 是动宾关系，用 done 表被环绕的状态。'
  },
  '2024全国一卷#56': {
    nonp_function: 'attribute',
    nonp_form: 'doing',
    nonp_rule: 'engineering 修饰 techniques，是动名词作定语，说明技术用途或类别。'
  },
  '2024全国一卷#58': {
    nonp_function: 'adverbial',
    nonp_form: 'to_do',
    nonp_rule: '主句已有谓语 open，to give 表目的，说明萼片打开是为了提供阳光和空气。'
  },
  '2024全国二卷#40': {
    nonp_function: 'adverbial',
    nonp_form: 'done',
    nonp_rule: '主句已有谓语，a pavilion 与 inspire 是动宾关系，用 done 作原因状语。'
  },
  '2024全国二卷#43': {
    nonp_function: 'object',
    nonp_form: 'to_do',
    nonp_rule: 'be amazed 后接 to do，说明“惊讶地发现”，不定式作形容词补足成分。'
  },
  '2024全国二卷#44': {
    nonp_function: 'adverbial',
    nonp_form: 'doing',
    nonp_rule: '句中已有谓语 said，Edmondson 与 recall 是主谓关系，用 doing 作伴随状语。'
  },
  '2024广州一模#36': {
    nonp_function: 'attribute',
    nonp_form: 'doing',
    nonp_rule: 'dating 修饰 homes，homes 与 date from 是主谓关系，用 doing 作后置定语。'
  },
  '2024广州一模#41': {
    nonp_function: 'adverbial',
    nonp_form: 'to_do',
    nonp_rule: '主句已有谓语 are looking，to save 表目的，说明关注天井原则的目的。'
  },
  '2024浙江首考#56': {
    nonp_function: 'adverbial',
    nonp_form: 'to_do',
    nonp_rule: 'buying extra 后接 to benefit from price reductions，to do 表目的。'
  },
  '2024浙江首考#63': {
    nonp_function: 'attribute',
    nonp_form: 'done',
    nonp_rule: 'designed 修饰 packs，packs 与 design 是动宾关系，用 done 作后置定语。'
  },
  '2024深圳一模#38': {
    nonp_function: 'adverbial',
    nonp_form: 'doing',
    nonp_rule: '句中已有谓语 must keep，players 与 use 是主谓关系，用 doing 作方式状语。'
  },
  '2024深圳一模#42': {
    fine_category: 'nonp-adverbial-1',
    nonp_function: 'adverbial',
    nonp_form: 'done',
    nonp_rule: '句中已有谓语 have，audience 与 draw 是动宾关系，用 done 表被吸引的状态。'
  },
  '2024深圳二模#36': {
    nonp_function: 'attribute',
    nonp_form: 'done',
    nonp_rule: 'created 修饰 a museum，museum 与 create 是动宾关系，用 done 作后置定语。'
  },
  '2024深圳二模#41': {
    fine_category: 'nonp-object',
    nonp_function: 'object',
    nonp_form: 'doing',
    nonp_rule: 'beyond 是介词，后面接 doing，exhibiting 作介词宾语。'
  },
  '2025全国一卷#58': {
    nonp_function: 'object',
    nonp_form: 'to_do',
    nonp_rule: 'hope 后接 to do 作宾语，表示“希望呈现”。'
  },
  '2025全国二卷#42': {
    nonp_function: 'attribute',
    nonp_form: 'to_do',
    nonp_rule: 'chance 后常接 to do 作后置定语，表示“发现……的机会”。'
  },
  '2025全国二卷#45': {
    nonp_function: 'attribute',
    nonp_form: 'done',
    nonp_rule: 'left 修饰 a sheet or shirt，二者与 leave 是动宾关系，用 done 作后置定语。'
  },
  '2025广州一模#38': {
    nonp_function: 'attribute',
    nonp_form: 'done',
    nonp_rule: 'themed 修饰 competition，competition 与 theme 是动宾关系，用 done 作后置定语。'
  },
  '2025广州一模#45': {
    fine_category: 'nonp-complement',
    nonp_function: 'complement',
    nonp_form: 'to_do',
    nonp_rule: 'inspire sb. to do sth. 中 to reconnect 作宾语补足语，说明激励对象去做什么。'
  },
  '2025广州二模#61': {
    nonp_function: 'attribute',
    nonp_form: 'done',
    nonp_rule: 'cooked 修饰 the soup，soup 与 cook 是动宾关系，用 done 作后置定语。'
  },
  '2025广州二模#63': {
    nonp_function: 'adverbial',
    nonp_form: 'to_do',
    nonp_rule: 'to suit 表目的，说明调整汤味是为了适应本地口味。'
  },
  '2025广州二模#65': {
    fine_category: 'nonp-absolute-with',
    nonp_function: 'with_absolute',
    nonp_form: 'doing',
    nonp_rule: 'with 复合结构中 each bowl 与 tell 是主谓关系，用 doing 作宾语补足语。'
  },
  '2025浙江首考#60': {
    nonp_function: 'attribute',
    nonp_form: 'to_do',
    nonp_rule: 'clothes for women to rent 中 to rent 作后置定语，说明衣服的用途。'
  },
  '2025浙江首考#65': {
    fine_category: 'nonp-object',
    nonp_function: 'object',
    nonp_form: 'doing',
    nonp_rule: 'mean 表“意味着”时后接 doing，returning 作宾语。'
  },
  '2025深圳一模#37': {
    nonp_function: 'attribute',
    nonp_form: 'doing',
    nonp_rule: 'featuring 修饰 badge，badge 与 feature 是主谓关系，用 doing 作后置定语。'
  },
  '2025深圳一模#45': {
    nonp_function: 'attribute',
    nonp_form: 'done',
    nonp_rule: 'paired 修饰 competition, unity, and mutual respect，与 pair 是动宾关系，用 done 作后置定语。'
  },
  '2025深圳二模#37': {
    nonp_function: 'adverbial',
    nonp_form: 'doing',
    nonp_rule: 'battling 与 crossing 并列，主语与 battle 是主谓关系，用 doing 作伴随状语。'
  },
  '2025深圳二模#40': {
    nonp_function: 'adverbial',
    nonp_form: 'done',
    nonp_rule: 'Li Xuyao 与 cover 是动宾关系，用 done 作状语，表示被积雪覆盖的状态。'
  },
  '2026广州一模#40': {
    fine_category: 'nonp-subject-predicative',
    nonp_function: 'subject_predicative',
    nonp_form: 'doing',
    nonp_rule: 'valuing 是动名词短语，解释 core message 的内容，具有名词性。'
  },
  '2026广州一模#44': {
    nonp_function: 'attribute',
    nonp_form: 'done',
    nonp_rule: 'rooted 修饰 art，art 与 root in 是动宾关系，用 done 作后置定语。'
  },
  '2026深圳一模#37': {
    nonp_function: 'attribute',
    nonp_form: 'done',
    nonp_rule: 'translated 修饰 Tang poems，poems 与 translate 是动宾关系，用 done 作后置定语。'
  },
  '2026深圳一模#44': {
    nonp_function: 'subject_predicative',
    nonp_form: 'doing',
    nonp_rule: 'Reading 是动名词作主语，表示“阅读这本书”这一动作整体。'
  }
};

function loadBank() {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(BANK_PATH, 'utf8'), context);
  return context.window.GRAMMAR_BANK;
}

function getSentence(passage, no) {
  const text = String(passage || '');
  const re = new RegExp('[^.!?\\n]*_{2,}\\s*' + no + '\\s*_{2,}[^.!?\\n]*(?:[.!?]|$)', 'i');
  const match = text.match(re);
  return (match ? match[0] : text.slice(0, 240)).replace(/\s+/g, ' ').trim();
}

function clearNonpFields(q) {
  for (const field of NONP_FIELDS) delete q[field];
}

function applyCorrection(q, correction) {
  Object.assign(q, correction);
  if (q.category !== 'nonpredicate') clearNonpFields(q);
}

function applyCorrections(bank) {
  for (const exam of bank.exams || []) {
    for (const q of exam.questions || []) {
      const correction = CORRECTIONS[exam.exam_id + '#' + q.no];
      if (correction) applyCorrection(q, correction);
    }
  }

  for (const q of bank.questions || []) {
    const correction = CORRECTIONS[(q.exam_id || '') + '#' + q.no];
    if (correction) applyCorrection(q, correction);
  }
}

function applyAudit(bank) {
  applyCorrections(bank);

  const seen = new Set();
  const rows = [];

  function patchQuestion(q, exam) {
    const key = exam.exam_id + '#' + q.no;
    const entry = AUDIT[key];
    if (!entry) return;

    if (entry.fine_category) q.fine_category = entry.fine_category;
    q.nonp_function = entry.nonp_function;
    q.nonp_function_label = FUNCTION_LABELS[entry.nonp_function] || entry.nonp_function;
    q.nonp_form = entry.nonp_form;
    q.nonp_form_label = FORM_LABELS[entry.nonp_form] || entry.nonp_form;
    q.nonp_rule = entry.nonp_rule;
    q.nonp_needs_review = false;

    if (!seen.has(key)) {
      seen.add(key);
      rows.push({
        exam: exam.exam_id,
        no: q.no,
        answer: q.answer,
        sentence: getSentence(exam.passage, q.no),
        fine: q.fine_category,
        fn: q.nonp_function_label,
        form: q.nonp_form_label,
        rule: q.nonp_rule,
        review: q.nonp_needs_review ? '是' : '否',
        explanation: q.explanation || ''
      });
    }
  }

  for (const exam of bank.exams || []) {
    for (const q of exam.questions || []) patchQuestion(q, exam);
  }

  const nestedIndex = new Map();
  for (const exam of bank.exams || []) {
    for (const q of exam.questions || []) nestedIndex.set(exam.exam_id + '#' + q.no, q);
  }

  for (const q of bank.questions || []) {
    const nested = nestedIndex.get((q.exam_id || '') + '#' + q.no);
    if (!nested || nested.category !== 'nonpredicate') continue;
    q.fine_category = nested.fine_category;
    q.nonp_function = nested.nonp_function;
    q.nonp_function_label = nested.nonp_function_label;
    q.nonp_form = nested.nonp_form;
    q.nonp_form_label = nested.nonp_form_label;
    q.nonp_rule = nested.nonp_rule;
    q.nonp_needs_review = nested.nonp_needs_review;
  }

  const missing = [];
  for (const exam of bank.exams || []) {
    for (const q of exam.questions || []) {
      if (q.category === 'nonpredicate') {
        const key = exam.exam_id + '#' + q.no;
        if (!AUDIT[key]) missing.push(key);
      }
    }
  }
  if (missing.length) {
    throw new Error('Missing nonpredicate audit entries: ' + missing.join(', '));
  }

  return rows.sort((a, b) => String(a.exam).localeCompare(String(b.exam), 'zh-Hans-CN') || a.no - b.no);
}

function escCell(value) {
  return String(value || '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function writeAudit(rows) {
  const lines = [
    '# 非谓语专项审计表',
    '',
    '> 生成来源：`scripts/apply_nonpredicate_audit.js`。本表覆盖公开题库 19 套中的 ' + rows.length + ' 道非谓语题，用于组长和老师快速复核。',
    '',
    '## 口径',
    '',
    '- 功能轴：作主语/表语、作宾语、作定语、作状语、作补语、with 复合结构。',
    '- 形式轴：to do、doing、done、to be done、being done、having done 等。',
    '- 课堂判断顺序：先看句中是否已有谓语，再找逻辑主语判断主被动，最后确定形式和功能。',
    '',
    '## 审计明细',
    '',
    '| 套卷 | 题号 | 答案 | 当前 fine_category | 功能轴 | 形式轴 | 老师讲法 | 需复核 |',
    '|---|---:|---|---|---|---|---|---|'
  ];

  for (const row of rows) {
    lines.push([
      escCell(row.exam),
      row.no,
      escCell(row.answer),
      escCell(row.fine),
      escCell(row.fn),
      escCell(row.form),
      escCell(row.rule),
      row.review
    ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
  }

  lines.push('', '## 代表题课堂句子', '');
  for (const row of rows) {
    lines.push('- **' + row.exam + ' 第' + row.no + '题** `' + escCell(row.answer) + '`：' + escCell(row.sentence));
  }
  lines.push('');

  fs.writeFileSync(AUDIT_PATH, lines.join('\n'), 'utf8');
}

const bank = loadBank();
const rows = applyAudit(bank);
fs.writeFileSync(BANK_PATH, 'window.GRAMMAR_BANK = ' + JSON.stringify(bank, null, 2) + ';\n', 'utf8');
writeAudit(rows);
console.log('Updated nonpredicate audit fields:', rows.length);
console.log('Wrote', path.relative(ROOT, BANK_PATH));
console.log('Wrote', path.relative(ROOT, AUDIT_PATH));
