// scripts/batch_fix_fine_category.js
//
// 批量修改 docs/data/grammar_bank.js 中题目的 fine_category 字段。
// 用 (exam_id, no, answer) 三元组定位，文本替换不破坏格式。
//
// 修改清单：编辑下面 FIXES 数组。
// 用法：node scripts/batch_fix_fine_category.js [--dry-run]

const fs = require('fs');
const path = require('path');

const BANK_PATH = path.join(__dirname, '..', 'docs/data/grammar_bank.js');

// ─── 修改清单（来自 reports/final_remediation_2026-05-19.md 的错配模式聚合） ─────
// 仅 fine_category 改动；如需同时改 category/category_name/grammar_point，请用 'fullFields' 字段。
const FIXES = [
  // ── P1.1: art-the → art-a-an（6 道） ──
  { exam: '2024深圳一模', no: 37, answer: 'a',  newFine: 'art-a-an' },
  { exam: '2025广州一模', no: 36, answer: 'an', newFine: 'art-a-an' },
  { exam: '2025深圳一模', no: 44, answer: 'a',  newFine: 'art-a-an' },
  { exam: '2025深圳二模', no: 36, answer: 'a',  newFine: 'art-a-an' },
  { exam: '2026广州一模', no: 45, answer: 'an', newFine: 'art-a-an' },
  { exam: '2026深圳一模', no: 45, answer: 'a',  newFine: 'art-a-an' },

  // ── P1.2: word-adj-adv-choice → word-ed-ing（4 道） ──
  { exam: '2023全国二卷',  no: 60, answer: 'visiting',  newFine: 'word-ed-ing' },
  { exam: '2024广州二模',  no: 37, answer: 'existing',  newFine: 'word-ed-ing' },
  { exam: '2024广州二模',  no: 45, answer: 'lost',      newFine: 'word-ed-ing' },
  { exam: '2025深圳一模',  no: 43, answer: 'emotional', newFine: 'word-ed-ing' },

  // ── P1.3: pred-sva-form → pred-tense-present（4 道） ──
  { exam: '2024全国一卷',  no: 60, answer: 'walks',    newFine: 'pred-tense-present' },
  { exam: '2024深圳一模',  no: 39, answer: 'requires', newFine: 'pred-tense-present' },
  { exam: '2024深圳二模',  no: 39, answer: 'houses',   newFine: 'pred-tense-present' },
  { exam: '2025全国二卷',  no: 41, answer: 'is',       newFine: 'pred-tense-present' },

  // ── P1.4: logic-conj-phrase → logic-compound（3 道） ──
  { exam: '2023浙江首考',  no: 56, answer: 'and', newFine: 'logic-compound' },
  { exam: '2024广州二模',  no: 40, answer: 'so',  newFine: 'logic-compound' },
  { exam: '2024浙江首考',  no: 57, answer: 'or',  newFine: 'logic-compound' },

  // ── P1.5: word-adj-adv-choice → word-adj-adv-other（3 道） ──
  { exam: '2023浙江首考',  no: 61, answer: 'spacious',    newFine: 'word-adj-adv-other' },
  { exam: '2024全国一卷',  no: 59, answer: 'closed',      newFine: 'word-adj-adv-other' },
  { exam: '2024广州一模',  no: 43, answer: 'comfortable', newFine: 'word-adj-adv-other' },

  // ── P1.6: pred-sva-form → pred-tense-past-future（3 道） ──
  { exam: '2024全国二卷',  no: 38, answer: 'were',         newFine: 'pred-tense-past-future' },
  { exam: '2024广州二模',  no: 44, answer: 'was released', newFine: 'pred-tense-past-future' },
  { exam: '2024深圳二模',  no: 43, answer: 'was recognized', newFine: 'pred-tense-past-future' },

  // ── P2: AI 独有发现 · 高置信度（21 道） ──
  // 名词派生 / 名词复数 / 名词所有格 / 替代词 / 关系词归位 等
  { exam: '2023全国一卷',  no: 61, answer: 'to be lifted',   newFine: 'nonp-complement' },           // 不定式作宾补
  { exam: '2023浙江首考',  no: 63, answer: 'as',             newFine: 'prep-other' },                 // as"作为"特殊用法
  { exam: '2023浙江首考',  no: 64, answer: 'events',         newFine: 'num-plural' },                 // 名词复数
  { exam: '2024全国二卷',  no: 42, answer: 'visibility',     newFine: 'word-noun-derivation' },       // 形→名派生
  { exam: '2024浙江首考',  no: 58, answer: 'that',           newFine: 'nounc-connectors' },           // 同位语从句，不是定语从句
  { exam: '2024浙江首考',  no: 60, answer: 'criticism',      newFine: 'word-noun-derivation' },       // 动→名派生
  { exam: '2024浙江首考',  no: 61, answer: 'be offered',     newFine: 'pred-passive-form' },          // 被动语态构成
  { exam: '2024浙江首考',  no: 62, answer: 'have started',   newFine: 'pred-tense-perfect' },         // 现在完成时
  { exam: '2024浙江首考',  no: 65, answer: 'ones',           newFine: 'special-substitution-ellipsis' }, // 替代词
  { exam: '2024深圳一模',  no: 40, answer: 'is described',   newFine: 'pred-passive-form' },          // 被动语态构成
  { exam: '2024深圳一模',  no: 42, answer: 'drawn',          newFine: 'nonp-attribute' },             // 过去分词作定语
  { exam: '2025全国二卷',  no: 36, answer: 'where',          newFine: 'attrib-adverb' },              // 关系副词 where
  { exam: '2025广州一模',  no: 37, answer: 'were selected',  newFine: 'pred-tense-past-future' },     // 一般过去时
  { exam: '2025广州一模',  no: 45, answer: 'to reconnect',   newFine: 'nonp-complement' },            // 不定式作宾补
  { exam: '2025广州二模',  no: 65, answer: 'telling',        newFine: 'nonp-absolute-with' },         // with 复合结构
  { exam: '2025浙江首考',  no: 57, answer: 'times',          newFine: 'num-plural' },                 // 名词复数
  { exam: '2025浙江首考',  no: 61, answer: 'solution',       newFine: 'word-noun-derivation' },       // 动→名派生
  { exam: '2025浙江首考',  no: 62, answer: 'is',             newFine: 'pred-sva-form' },              // be 动词主谓一致
  { exam: '2025浙江首考',  no: 64, answer: "people's",       newFine: 'num-possessive' },             // 名词所有格
  { exam: '2025深圳一模',  no: 39, answer: 'recovery',       newFine: 'word-noun-derivation' },       // 动→名派生
  { exam: '2025深圳二模',  no: 41, answer: 'whose',          newFine: 'attrib-choice' },              // 关系词 whose 选择
];

const DRY_RUN = process.argv.includes('--dry-run');

// ─── 名词复数题：14 道 category 从 word → number（决策：名词单复数归名词大类） ─────
const CATEGORY_FIXES = [
  { exam: '2023全国二卷',  no: 61, answer: 'interviews',    newCategory: 'number', newCategoryName: '数词' },
  { exam: '2023浙江首考',  no: 64, answer: 'events',        newCategory: 'number', newCategoryName: '数词' },
  { exam: '2024全国一卷',  no: 62, answer: 'favourites',    newCategory: 'number', newCategoryName: '数词' },
  { exam: '2024全国二卷',  no: 37, answer: 'themes',        newCategory: 'number', newCategoryName: '数词' },
  { exam: '2024广州一模',  no: 45, answer: 'wonders',       newCategory: 'number', newCategoryName: '数词' },
  { exam: '2024广州二模',  no: 43, answer: 'photos',        newCategory: 'number', newCategoryName: '数词' },
  { exam: '2024深圳一模',  no: 44, answer: 'benefits',      newCategory: 'number', newCategoryName: '数词' },
  { exam: '2024深圳二模',  no: 44, answer: 'links',         newCategory: 'number', newCategoryName: '数词' },
  { exam: '2025全国二卷',  no: 44, answer: 'afternoons',    newCategory: 'number', newCategoryName: '数词' },
  { exam: '2025广州一模',  no: 39, answer: 'entries',       newCategory: 'number', newCategoryName: '数词' },
  { exam: '2025广州二模',  no: 57, answer: 'cities',        newCategory: 'number', newCategoryName: '数词' },
  { exam: '2025浙江首考',  no: 57, answer: 'times',         newCategory: 'number', newCategoryName: '数词' },
  { exam: '2026广州一模',  no: 37, answer: 'gestures',      newCategory: 'number', newCategoryName: '数词' },
  { exam: '2026深圳一模',  no: 42, answer: 'illustrations', newCategory: 'number', newCategoryName: '数词' },
];

// ─── 主流程 ─────
function main() {
  let text = fs.readFileSync(BANK_PATH, 'utf8');
  let successCount = 0;
  let failCount = 0;
  const failures = [];

  // 第二阶段：处理 CATEGORY_FIXES（改 category + category_name 字段）
  CATEGORY_FIXES.forEach((fix) => {
    const examMarker = `"exam_id": "${fix.exam}"`;
    const examIdx = text.indexOf(examMarker);
    if (examIdx < 0) {
      failures.push(`[category] ${fix.exam} 第${fix.no}题 ${fix.answer}：找不到 exam_id`);
      failCount++;
      return;
    }
    const nextExamIdx = text.indexOf(`"exam_id":`, examIdx + examMarker.length);
    const examEnd = nextExamIdx > 0 ? nextExamIdx : text.length;
    const examBlock = text.slice(examIdx, examEnd);
    const noMarker = `"no": ${fix.no},`;
    const ansMarker = `"answer": "${fix.answer}"`;
    let pos = 0;
    let qStart = -1;
    while (pos < examBlock.length) {
      const noIdx = examBlock.indexOf(noMarker, pos);
      if (noIdx < 0) break;
      const ansIdx = examBlock.indexOf(ansMarker, noIdx);
      if (ansIdx > 0 && ansIdx - noIdx < 80) { qStart = noIdx; break; }
      pos = noIdx + noMarker.length;
    }
    if (qStart < 0) {
      failures.push(`[category] ${fix.exam} 第${fix.no}题 ${fix.answer}：找不到题块`);
      failCount++;
      return;
    }
    // 找到 category 字段（在题块的 200 字符内）
    const catIdx = examBlock.indexOf('"category":', qStart);
    const catNameIdx = examBlock.indexOf('"category_name":', qStart);
    if (catIdx < 0 || catNameIdx < 0 || catIdx - qStart > 1500) {
      failures.push(`[category] ${fix.exam} 第${fix.no}题 ${fix.answer}：找不到 category/category_name 字段`);
      failCount++;
      return;
    }
    const catLineEnd = examBlock.indexOf('\n', catIdx);
    const catLine = examBlock.slice(catIdx, catLineEnd);
    const catNameLineEnd = examBlock.indexOf('\n', catNameIdx);
    const catNameLine = examBlock.slice(catNameIdx, catNameLineEnd);
    const oldCatMatch = catLine.match(/"category":\s*"([^"]+)"/);
    const oldCatNameMatch = catNameLine.match(/"category_name":\s*"([^"]+)"/);
    if (!oldCatMatch || !oldCatNameMatch) {
      failures.push(`[category] ${fix.exam} 第${fix.no}题 ${fix.answer}：字段格式异常`);
      failCount++;
      return;
    }
    const oldCat = oldCatMatch[1];
    const oldCatName = oldCatNameMatch[1];
    if (oldCat === fix.newCategory && oldCatName === fix.newCategoryName) {
      console.log(`  [跳过][category] ${fix.exam} 第${fix.no}题 ${fix.answer}：已是 ${fix.newCategory}/${fix.newCategoryName}`);
      successCount++;
      return;
    }
    // 替换两个字段
    const oldCatText = `"category": "${oldCat}"`;
    const newCatText = `"category": "${fix.newCategory}"`;
    const oldCatNameText = `"category_name": "${oldCatName}"`;
    const newCatNameText = `"category_name": "${fix.newCategoryName}"`;
    const absCatIdx = examIdx + catIdx;
    const absCatNameIdx = examIdx + catNameIdx;
    // 安全检查再替换
    if (text.slice(absCatIdx, absCatIdx + oldCatText.length) !== oldCatText ||
        text.slice(absCatNameIdx, absCatNameIdx + oldCatNameText.length) !== oldCatNameText) {
      failures.push(`[category] ${fix.exam} 第${fix.no}题 ${fix.answer}：定位偏差`);
      failCount++;
      return;
    }
    // 先改靠后的（避免位置偏移）
    if (absCatNameIdx > absCatIdx) {
      text = text.slice(0, absCatNameIdx) + newCatNameText + text.slice(absCatNameIdx + oldCatNameText.length);
      text = text.slice(0, absCatIdx) + newCatText + text.slice(absCatIdx + oldCatText.length);
    } else {
      text = text.slice(0, absCatIdx) + newCatText + text.slice(absCatIdx + oldCatText.length);
      text = text.slice(0, absCatNameIdx) + newCatNameText + text.slice(absCatNameIdx + oldCatNameText.length);
    }
    console.log(`  ✓ [category] ${fix.exam} 第${fix.no}题 ${fix.answer}：${oldCat}/${oldCatName} → ${fix.newCategory}/${fix.newCategoryName}`);
    successCount++;
  });

  FIXES.forEach((fix) => {
    // 定位策略：
    // 1) 找到 "exam_id": "<fix.exam>" 的位置（每个 exam_id 唯一）
    // 2) 在其后找到下一个 "exam_id":"..." 之前的范围内
    // 3) 在该范围内找到 "no": <fix.no>, 然后下面 "answer": "<fix.answer>"
    // 4) 替换该题块内的 "fine_category": "<旧值>" 为新值

    const examMarker = `"exam_id": "${fix.exam}"`;
    const examIdx = text.indexOf(examMarker);
    if (examIdx < 0) {
      failures.push(`${fix.exam} 第${fix.no}题 ${fix.answer}：找不到 exam_id`);
      failCount++;
      return;
    }
    // 找下一个 exam_id 的起点（如果没有则用文件末尾）
    const nextExamIdx = text.indexOf(`"exam_id":`, examIdx + examMarker.length);
    const examEnd = nextExamIdx > 0 ? nextExamIdx : text.length;
    const examBlock = text.slice(examIdx, examEnd);

    // 在 examBlock 内找题块：用 "no": <no>, + "answer": "<answer>" 双重锚定
    const noMarker = `"no": ${fix.no},`;
    const ansMarker = `"answer": "${fix.answer}"`;
    let pos = 0;
    let questionStart = -1;
    while (pos < examBlock.length) {
      const noIdx = examBlock.indexOf(noMarker, pos);
      if (noIdx < 0) break;
      // 检查紧跟着是不是 answer
      const ansIdx = examBlock.indexOf(ansMarker, noIdx);
      // 验证 answer 在 no 之后 80 字符内（同一题块内）
      if (ansIdx > 0 && ansIdx - noIdx < 80) {
        questionStart = noIdx;
        break;
      }
      pos = noIdx + noMarker.length;
    }
    if (questionStart < 0) {
      failures.push(`${fix.exam} 第${fix.no}题 ${fix.answer}：找不到题块`);
      failCount++;
      return;
    }
    // 在题块向后找 fine_category 字段（应该在 200 字符内）
    const fineIdx = examBlock.indexOf('"fine_category":', questionStart);
    if (fineIdx < 0 || fineIdx - questionStart > 1500) {
      failures.push(`${fix.exam} 第${fix.no}题 ${fix.answer}：找不到 fine_category 字段`);
      failCount++;
      return;
    }
    // 提取当前 fine_category 值
    const fineLineEnd = examBlock.indexOf('\n', fineIdx);
    const fineLine = examBlock.slice(fineIdx, fineLineEnd);
    const valMatch = fineLine.match(/"fine_category":\s*"([^"]+)"/);
    if (!valMatch) {
      failures.push(`${fix.exam} 第${fix.no}题 ${fix.answer}：fine_category 行格式异常：${fineLine}`);
      failCount++;
      return;
    }
    const oldFine = valMatch[1];
    if (oldFine === fix.newFine) {
      console.log(`  [跳过] ${fix.exam} 第${fix.no}题 ${fix.answer}：已是 ${fix.newFine}`);
      successCount++;
      return;
    }

    // 拼回全文：替换 examBlock 中的这一行
    const oldText = `"fine_category": "${oldFine}"`;
    const newText = `"fine_category": "${fix.newFine}"`;
    const absFineIdx = examIdx + fineIdx;
    const absOldEnd = absFineIdx + oldText.length;
    // 确认前后内容
    if (text.slice(absFineIdx, absOldEnd) !== oldText) {
      failures.push(`${fix.exam} 第${fix.no}题 ${fix.answer}：定位偏差，预期"${oldText}"，实际"${text.slice(absFineIdx, absOldEnd)}"`);
      failCount++;
      return;
    }
    text = text.slice(0, absFineIdx) + newText + text.slice(absOldEnd);
    console.log(`  ✓ ${fix.exam} 第${fix.no}题 ${fix.answer}：${oldFine} → ${fix.newFine}`);
    successCount++;
  });

  console.log(`\n汇总：成功 ${successCount}，失败 ${failCount}`);
  if (failures.length) {
    console.log('\n失败详情：');
    failures.forEach(f => console.log('  ✗ ' + f));
  }
  if (DRY_RUN) {
    console.log('\n[DRY RUN] 未写文件。去掉 --dry-run 实际执行。');
  } else if (successCount > 0 && failCount === 0) {
    fs.writeFileSync(BANK_PATH, text, 'utf8');
    console.log(`\n已写回：${BANK_PATH}`);
  } else if (failCount > 0) {
    console.log(`\n⚠️ 有 ${failCount} 处失败，未写文件以避免部分修改。请人工排查后重跑。`);
  }
}

main();
