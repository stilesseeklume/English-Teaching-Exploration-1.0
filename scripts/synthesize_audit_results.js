// scripts/synthesize_audit_results.js
//
// 交叉对比静态审计 + AI 复审，生成最终待修清单：
//   - 双重命中（最高置信度）
//   - AI 独有发现
//   - 按错配类型聚合（同一种错的题放一起，便于批量修）
//
// 用法：node scripts/synthesize_audit_results.js

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const BANK_PATH = path.join(ROOT, 'docs/data/grammar_bank.js');
const TAGS_PATH = path.join(ROOT, 'docs/data/grammar_fine_tags.js');
const REPORTS_DIR = path.join(ROOT, 'reports');

function loadData() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(BANK_PATH, 'utf8'), sandbox);
  vm.runInContext(fs.readFileSync(TAGS_PATH, 'utf8'), sandbox);
  return { BANK: sandbox.window.GRAMMAR_BANK, FINE_TAGS: sandbox.window.GRAMMAR_FINE_TAGS };
}

// ─── 解析 AI 报告中所有 incorrect 题 ─────
function parseAiIncorrect(reportPath) {
  const text = fs.readFileSync(reportPath, 'utf8');
  const incorrectSection = text.split('## ❌')[1] || '';
  const stopAt = incorrectSection.indexOf('## ⚠️');
  const block = stopAt >= 0 ? incorrectSection.slice(0, stopAt) : incorrectSection.split('## ✅')[0];

  const items = [];
  const re = /### \d+\.\s+(.+?) 第 (\d+) 题 · 答案 "(.+?)"\n+- \*\*当前 fine_category\*\*：`([^`]+)`[\s\S]+?- \*\*AI 建议改为\*\*：`([^`]+)`[\s\S]+?- \*\*AI 判断依据\*\*：(.+?)\n/g;
  let m;
  while ((m = re.exec(block)) !== null) {
    items.push({
      exam: m[1].trim(),
      no: parseInt(m[2], 10),
      answer: m[3],
      currentTag: m[4],
      suggestedTag: m[5],
      reason: m[6].trim(),
    });
  }
  return items;
}

// ─── 解析静态审计中所有可疑题（不含 G 信息级） ─────
function parseStaticSuspicious(reportPath) {
  const text = fs.readFileSync(reportPath, 'utf8');
  // 提取所有 ### N. 题号 这种条目（仅 high/med/low，不含 info G）
  const items = [];
  // 切掉 info 段
  const main = text.split('## 🔵')[0];
  const re = /### \d+\.\s+(.+?) 第 (\d+) 题 · 答案 "(.+?)"\n+- \*\*规则\*\*：`([^`]+)`/g;
  let m;
  while ((m = re.exec(main)) !== null) {
    items.push({
      exam: m[1].trim(),
      no: parseInt(m[2], 10),
      answer: m[3],
      staticRule: m[4],
    });
  }
  return items;
}

function key(item) { return item.exam + '#' + item.no; }

// ─── 主流程 ─────
function main() {
  const { BANK, FINE_TAGS } = loadData();
  const auditReports = fs.readdirSync(REPORTS_DIR).filter(f => /^fine_category_audit_/.test(f)).sort().reverse();
  const aiReports = fs.readdirSync(REPORTS_DIR).filter(f => /^ai_review_full_/.test(f)).sort().reverse();

  if (!auditReports.length || !aiReports.length) {
    console.error('需要至少一份 audit 报告和一份 ai_review_full 报告');
    process.exit(1);
  }
  const auditPath = path.join(REPORTS_DIR, auditReports[0]);
  const aiPath = path.join(REPORTS_DIR, aiReports[0]);
  console.log(`静态审计：${auditPath}`);
  console.log(`AI 复审：${aiPath}`);

  const staticSuspicious = parseStaticSuspicious(auditPath);
  const aiIncorrect = parseAiIncorrect(aiPath);
  const staticKeys = new Set(staticSuspicious.map(key));

  console.log(`\n静态审计可疑：${staticSuspicious.length} 道`);
  console.log(`AI 复审 incorrect：${aiIncorrect.length} 道`);

  // 分类：双重命中 vs AI 独有
  const doubleHit = [];
  const aiOnly = [];
  aiIncorrect.forEach(it => {
    if (staticKeys.has(key(it))) doubleHit.push(it);
    else aiOnly.push(it);
  });

  // 按错配类型聚合（current → suggested）
  const byPattern = {};
  aiIncorrect.forEach(it => {
    const pkey = it.currentTag + ' → ' + it.suggestedTag;
    if (!byPattern[pkey]) byPattern[pkey] = [];
    byPattern[pkey].push(it);
  });
  const patternsSorted = Object.entries(byPattern).sort((a, b) => b[1].length - a[1].length);

  // ─── 写最终报告 ─────
  const today = new Date().toISOString().slice(0, 10);
  const outPath = path.join(REPORTS_DIR, `final_remediation_${today}.md`);

  let md = `# fine_category 待修清单（静态审计 + AI 复审 综合）\n\n`;
  md += `**生成时间**：${new Date().toLocaleString('zh-CN')}\n\n`;
  md += `**数据源**：\n- ${auditReports[0]}\n- ${aiReports[0]}\n\n`;
  md += `**汇总**：\n`;
  md += `- AI 复审标记 incorrect 共 ${aiIncorrect.length} 道（占 190 总题数 ${(aiIncorrect.length / 190 * 100).toFixed(1)}%）\n`;
  md += `- 静态审计标记可疑 ${staticSuspicious.length} 道\n`;
  md += `- 🎯 **双重命中**（静态 + AI 都标）：${doubleHit.length} 道 ← 最高置信度，建议立即修\n`;
  md += `- 🔵 AI 独有发现：${aiOnly.length} 道 ← AI 看到了启发式规则覆盖不到的语义问题\n\n`;
  md += `---\n\n`;

  // 双重命中
  if (doubleHit.length) {
    md += `## 🎯 双重命中（静态规则 + AI 都标记，最高置信度）（${doubleHit.length} 道）\n\n`;
    doubleHit.forEach((it, i) => {
      const cur = FINE_TAGS.tags_by_id[it.currentTag];
      const sug = FINE_TAGS.tags_by_id[it.suggestedTag];
      md += `### ${i + 1}. ${it.exam} 第 ${it.no} 题 · 答案 \`${it.answer}\`\n\n`;
      md += `- **当前**：\`${it.currentTag}\` → 「${cur?.name || '?'}」\n`;
      md += `- **AI 建议改为**：\`${it.suggestedTag}\` → 「${sug?.name || '?'}」\n`;
      md += `- **AI 理由**：${it.reason}\n\n`;
    });
    md += `---\n\n`;
  }

  // 按错配模式聚合（top 10 最常见的错配）
  md += `## 📊 错配模式（同一种错的题聚在一起，便于批量修）\n\n`;
  patternsSorted.slice(0, 15).forEach(([pkey, items], i) => {
    const [cur, sug] = pkey.split(' → ');
    const curInfo = FINE_TAGS.tags_by_id[cur];
    const sugInfo = FINE_TAGS.tags_by_id[sug];
    md += `### ${i + 1}. \`${cur}\` 「${curInfo?.name || '?'}」 → \`${sug}\` 「${sugInfo?.name || '?'}」（${items.length} 道）\n\n`;
    items.forEach(it => {
      md += `- ${it.exam} 第 ${it.no} 题 · \`${it.answer}\` —— ${it.reason.slice(0, 80)}${it.reason.length > 80 ? '…' : ''}\n`;
    });
    md += `\n`;
  });
  md += `---\n\n`;

  // AI 独有
  if (aiOnly.length) {
    md += `## 🔵 AI 独有发现（静态规则没标，AI 觉得错）（${aiOnly.length} 道）\n\n`;
    md += `这些是 AI 通过语义理解发现的问题，静态规则做不到。建议作为第二批审阅。\n\n`;
    aiOnly.forEach((it, i) => {
      const cur = FINE_TAGS.tags_by_id[it.currentTag];
      const sug = FINE_TAGS.tags_by_id[it.suggestedTag];
      md += `### ${i + 1}. ${it.exam} 第 ${it.no} 题 · 答案 \`${it.answer}\`\n\n`;
      md += `- **当前**：\`${it.currentTag}\` → 「${cur?.name || '?'}」\n`;
      md += `- **建议**：\`${it.suggestedTag}\` → 「${sug?.name || '?'}」\n`;
      md += `- **理由**：${it.reason}\n\n`;
    });
  }

  md += `\n---\n\n`;
  md += `*报告由 scripts/synthesize_audit_results.js 生成*\n`;
  md += `\n## 建议处理流程\n\n`;
  md += `1. **第一批**：先修双重命中的 ${doubleHit.length} 道（置信度最高）\n`;
  md += `2. **第二批**：审阅按错配模式聚合的 top 5 类（同类问题批量修更高效）\n`;
  md += `3. **第三批**：审阅 AI 独有发现的剩余题（这些需要人工判断 AI 的建议是否合理）\n`;
  md += `4. 修改方式：直接编辑 \`docs/data/grammar_bank.js\` 中对应题的 \`fine_category\` 字段\n`;
  md += `5. 修完重跑 \`node scripts/audit_fine_category.js\` 和 \`node scripts/ai_review_fine_category.js --full\` 验证\n`;

  fs.writeFileSync(outPath, md, 'utf8');
  console.log(`\n最终报告：${outPath}`);
  console.log(`\n核心数字：双重命中=${doubleHit.length}，AI 独有=${aiOnly.length}，共 ${aiIncorrect.length} 道待修`);
}

main();
