// scripts/ai_review_fine_category.js
//
// AI 复审：用 DeepSeek 逐题复核 fine_category 是否合理。
// 不写回数据源，只生成 reports/ai_review_<日期>.md。
//
// 用法：
//   node scripts/ai_review_fine_category.js                     # 默认：只复审静态审计标记可疑的题
//   node scripts/ai_review_fine_category.js --full              # 全量复审 190 道
//   node scripts/ai_review_fine_category.js --limit 20          # 抽样前 20 道
//   node scripts/ai_review_fine_category.js --only "no=39 40"   # 只复审指定题号
//
// API key：优先 process.env.DEEPSEEK_API_KEY；否则用 scripts/translate_bank.py 中的硬编码。

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const BANK_PATH = path.join(ROOT, 'docs/data/grammar_bank.js');
const TAGS_PATH = path.join(ROOT, 'docs/data/grammar_fine_tags.js');
const REPORTS_DIR = path.join(ROOT, 'reports');

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-90494f47bb6b46a3acbcb2b0e183ae23';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// ─── 沙盒加载数据 ─────
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

// ─── 解析命令行 ─────
function parseArgs(argv) {
  const opts = { full: false, limit: 0, only: [], suspiciousOnly: true };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--full') opts.full = true;
    else if (a === '--limit') opts.limit = parseInt(argv[++i], 10);
    else if (a === '--only') {
      const v = argv[++i] || '';
      opts.only = v.replace(/^no=/, '').trim().split(/\s+/).map(Number).filter(n => !isNaN(n));
    }
  }
  if (opts.full || opts.limit > 0 || opts.only.length) opts.suspiciousOnly = false;
  return opts;
}

// ─── 静态审计可疑题（与 audit_fine_category.js 同步） ─────
//
// 这里用一份精简版静态规则，只挑出真正可疑的题（不含 G 信息级和已知误报）
function findSuspicious(allQuestions, FINE_TAGS) {
  const suspicious = [];
  allQuestions.forEach(q => {
    const finfo = FINE_TAGS.tags_by_id[q.fine_category];
    if (!finfo) return;

    // 规则 E：-ing/-ed 标"作状语"但 explanation 无状语关键词
    const a = String(q.answer || '').toLowerCase();
    if (/(ing|ed)$/.test(a) && /nonp-adverbial-/.test(q.fine_category)) {
      const advKeywords = ['伴随', '原因', '时间', '方式', '结果', '让步', '条件', '状语', '同时'];
      const hasAdvKeyword = advKeywords.some(k => (q.explanation || '').includes(k));
      if (!hasAdvKeyword) {
        suspicious.push({ ...q, _suspicious_reason: '静态规则 E：-ing/-ed 形式标作状语但 explanation 无状语关键词' });
        return;
      }
    }
  });
  return suspicious;
}

// ─── 构造 AI prompt ─────
function buildTagList(FINE_TAGS) {
  return Object.values(FINE_TAGS.tags_by_id).map(t => `- \`${t.id}\` (${FINE_TAGS.categories[t.category]?.name || t.category}): ${t.name}`).join('\n');
}

const SYSTEM_PROMPT = `你是高考英语语法填空题考点审校专家。你的任务：对一道题给定的 fine_category 标签做独立复核，判断标签是否合理。

判断原则：
1. 只看题面、答案、解析，结合英语语法常识做判断
2. 标签判断要严格——如果标签和实际考点有偏差（即使在同一大类内），也应指出
3. 例如：动名词作介词宾语 ≠ 非谓语作状语；同位语 ≠ 状语；过去分词作定语 ≠ 过去分词作状语
4. 输出严格 JSON 格式，不要任何 Markdown 包裹

输出 JSON 结构：
{
  "verdict": "correct" | "incorrect" | "ambiguous",
  "suggested_fine_category": "tag_id" | null,
  "reason": "一句话说明判断依据"
}

- correct：当前标签准确
- incorrect：当前标签明显错误，应改为 suggested_fine_category（必须从给定 tag 清单选）
- ambiguous：可能合理也可能不合理，给出更精确的建议或保持不变`;

function buildUserPrompt(q, finfo, tagList) {
  return `## 当前题信息
- 试卷：${q.exam_id}（${q.year}）
- 题号：第 ${q.no} 题
- 答案：${q.answer}
- 解析：${q.explanation || '(无)'}
- grammar_point 字段：${q.grammar_point || '(无)'}
- 当前 fine_category：\`${q.fine_category}\`（${finfo.name}，属${finfo.category}大类）

## 所有可选 fine_category 标签清单
${tagList}

## 你的任务
请判断当前 fine_category 是否准确。仅输出 JSON。`;
}

// ─── 调用 DeepSeek ─────
async function callDeepSeek(systemPrompt, userPrompt) {
  const body = JSON.stringify({
    model: 'deepseek-chat',
    temperature: 0.1,
    max_tokens: 500,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const resp = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body,
      });
      if (!resp.ok) {
        const errText = await resp.text();
        if (resp.status === 429) {
          const wait = (attempt + 1) * 5000;
          console.error(`  HTTP 429 速率限制，等待 ${wait/1000}s...`);
          await new Promise(r => setTimeout(r, wait));
          continue;
        }
        throw new Error(`HTTP ${resp.status}: ${errText.slice(0, 200)}`);
      }
      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content || '';
      try {
        return JSON.parse(content);
      } catch (e) {
        return { verdict: 'ambiguous', suggested_fine_category: null, reason: `AI 响应解析失败：${content.slice(0, 100)}` };
      }
    } catch (e) {
      if (attempt < 2) {
        await new Promise(r => setTimeout(r, 3000));
      } else {
        return { verdict: 'ambiguous', suggested_fine_category: null, reason: `调用失败：${e.message}` };
      }
    }
  }
  return { verdict: 'ambiguous', suggested_fine_category: null, reason: '调用失败（重试 3 次后）' };
}

// ─── 主流程 ─────
async function main() {
  const opts = parseArgs(process.argv);
  const { BANK, FINE_TAGS } = loadData();
  const exams = BANK.exams || [];
  const allQuestions = [];
  exams.forEach(exam => {
    (exam.questions || []).forEach(q => {
      allQuestions.push({ ...q, exam_id: exam.exam_id, year: exam.year });
    });
  });

  // 选定要复审的题
  let toReview;
  if (opts.only.length) {
    toReview = allQuestions.filter(q => opts.only.includes(q.no));
    console.log(`只复审指定题号：${opts.only.join(', ')}，共 ${toReview.length} 道`);
  } else if (opts.suspiciousOnly) {
    toReview = findSuspicious(allQuestions, FINE_TAGS);
    console.log(`只复审静态规则可疑题：${toReview.length} 道（用 --full 复审全部）`);
  } else if (opts.limit > 0) {
    toReview = allQuestions.slice(0, opts.limit);
    console.log(`抽样前 ${opts.limit} 道`);
  } else {
    toReview = allQuestions;
    console.log(`全量复审 ${toReview.length} 道`);
  }

  if (!toReview.length) {
    console.log('没有题需要复审，退出。');
    return;
  }

  const tagList = buildTagList(FINE_TAGS);
  const results = [];

  for (let i = 0; i < toReview.length; i++) {
    const q = toReview[i];
    const finfo = FINE_TAGS.tags_by_id[q.fine_category];
    if (!finfo) {
      results.push({ q, verdict: 'incorrect', suggested_fine_category: null, reason: 'fine_category 不在注册表' });
      continue;
    }
    process.stdout.write(`[${i + 1}/${toReview.length}] ${q.exam_id} 第${q.no}题（${q.answer}）...`);
    const userPrompt = buildUserPrompt(q, finfo, tagList);
    const verdict = await callDeepSeek(SYSTEM_PROMPT, userPrompt);
    results.push({ q, ...verdict });
    console.log(` → ${verdict.verdict}${verdict.suggested_fine_category ? ` (→ ${verdict.suggested_fine_category})` : ''}`);
  }

  // ─── 渲染报告 ─────
  const today = new Date().toISOString().slice(0, 10);
  const reportName = opts.only.length ? `ai_review_only_${opts.only.join('-')}_${today}.md`
                  : opts.suspiciousOnly ? `ai_review_suspicious_${today}.md`
                  : opts.limit > 0 ? `ai_review_limit${opts.limit}_${today}.md`
                  : `ai_review_full_${today}.md`;
  const reportPath = path.join(REPORTS_DIR, reportName);

  const bucket = { incorrect: [], ambiguous: [], correct: [] };
  results.forEach(r => bucket[r.verdict]?.push(r));

  let md = `# fine_category AI 复审报告\n\n`;
  md += `**生成时间**：${new Date().toLocaleString('zh-CN')}\n\n`;
  md += `**模型**：deepseek-chat\n\n`;
  md += `**复审范围**：${toReview.length} 道题`;
  if (opts.suspiciousOnly) md += `（仅静态规则可疑题）`;
  else if (opts.limit > 0) md += `（前 ${opts.limit} 道抽样）`;
  else if (opts.only.length) md += `（指定题号：${opts.only.join(', ')}）`;
  else md += `（全量 190 道）`;
  md += `\n\n`;

  md += `**AI 判定结果**：\n`;
  md += `- ❌ incorrect（AI 认为标签错，建议修改）：${bucket.incorrect.length} 道\n`;
  md += `- ⚠️ ambiguous（AI 觉得模糊或不确定）：${bucket.ambiguous.length} 道\n`;
  md += `- ✅ correct（AI 认同当前标签）：${bucket.correct.length} 道\n\n`;
  md += `> ⚠️ AI 判断不是金标准，也可能误判。最终决策需要人工复核。\n\n`;
  md += `---\n\n`;

  ['incorrect', 'ambiguous', 'correct'].forEach(v => {
    const items = bucket[v];
    if (!items.length) return;
    const icon = v === 'incorrect' ? '❌' : v === 'ambiguous' ? '⚠️' : '✅';
    const label = v === 'incorrect' ? 'AI 认为标签错误，建议修改' : v === 'ambiguous' ? 'AI 觉得模糊，需要人工判断' : 'AI 认同当前标签';
    md += `## ${icon} ${label}（${items.length} 道）\n\n`;
    items.forEach((r, i) => {
      const q = r.q;
      const currentFine = FINE_TAGS.tags_by_id[q.fine_category];
      const suggestedFine = r.suggested_fine_category ? FINE_TAGS.tags_by_id[r.suggested_fine_category] : null;
      md += `### ${i + 1}. ${q.exam_id} 第 ${q.no} 题 · 答案 "${q.answer}"\n\n`;
      md += `- **当前 fine_category**：\`${q.fine_category}\` → 「${currentFine?.name || '(无效)'}」\n`;
      if (r.suggested_fine_category) {
        md += `- **AI 建议改为**：\`${r.suggested_fine_category}\` → 「${suggestedFine?.name || '(无效 tag)'}」\n`;
      }
      md += `- **AI 判断依据**：${r.reason}\n`;
      md += `- **题面解析摘录**：${(q.explanation || '').slice(0, 200)}${(q.explanation || '').length > 200 ? '…' : ''}\n\n`;
    });
    md += `---\n\n`;
  });

  md += `\n*报告由 scripts/ai_review_fine_category.js 生成*\n`;
  fs.writeFileSync(reportPath, md, 'utf8');
  console.log(`\n报告已写入：${reportPath}`);
  console.log(`incorrect=${bucket.incorrect.length} / ambiguous=${bucket.ambiguous.length} / correct=${bucket.correct.length}`);
}

main().catch(err => {
  console.error('脚本异常：', err);
  process.exit(1);
});
