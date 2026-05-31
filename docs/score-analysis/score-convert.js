// 纯逻辑：输入 SheetJS 解析出的行数组，输出逐生转换表数据。无 DOM、无 SheetJS 依赖。

export const SECTION_ORDER = ['阅读理解', '七选五', '完形填空', '语法填空', '应用文', '续写'];
export const OBJECTIVE = new Set(['阅读理解', '七选五', '完形填空', '语法填空']);
export const SUBJECTIVE = new Set(['应用文', '续写']);

function findCol(header, label) {
  for (let c = 0; c < header.length; c++) {
    if (String(header[c]).trim() === label) return c;
  }
  return -1;
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// header0: 题号表头行；header1: 得分/作答子表头行；dataRows: 学生数据行
export function detectSections(header0, header1, dataRows) {
  if (!dataRows || dataRows.length === 0) {
    throw new Error('detectSections: 数据行为空，无法识别板块');
  }
  const meta = {
    nameCol: findCol(header0, '姓名'),
    clsCol: findCol(header0, '班级'),
    idCol: findCol(header0, '学号'),
    totalCol: findCol(header0, '总分'),
  };
  const start = meta.totalCol >= 0 ? meta.totalCol + 1 : 6;

  // 收集题列
  const qcols = [];
  for (let c = start; c < header0.length; c++) {
    const sub = String(header1[c] || '').trim();
    if (sub === '作答') continue;          // 作答列附属前一个得分列
    if (sub !== '得分') continue;          // 非题列
    const isMC = String(header1[c + 1] || '').trim() === '作答';
    const m = String(header0[c] || '').match(/答案\s*([A-G])/);
    let colMax = 0;
    for (const row of dataRows) {
      const v = Number(row[c]);
      if (Number.isFinite(v) && v > colMax) colMax = v;
    }
    qcols.push({ col: c, isMC, answer: m ? m[1] : '', colMax });
  }

  const sect = {};
  const push = (name, col) => { (sect[name] ||= []).push(col); };

  // 选择题：2.5 段 = 阅读+七选；其余 MC = 完形
  const mc = qcols.filter(q => q.isMC);
  const big = mc.filter(q => q.colMax >= 2);   // 2.5 分组
  const small = mc.filter(q => q.colMax < 2);  // 1.0/1.5 分组 → 完形
  let sevenStart = big.findIndex(q => /[EFG]/.test(q.answer));
  if (sevenStart < 0) sevenStart = Math.max(0, big.length - 5);   // 回退：最后 5 题
  big.forEach((q, i) => push(i >= sevenStart ? '七选五' : '阅读理解', q.col));
  small.forEach(q => push('完形填空', q.col));

  // 非选择题：colMax>5 = 作文（按序 应用文/续写）；否则语法
  const nonMC = qcols.filter(q => !q.isMC);
  const writing = nonMC.filter(q => q.colMax > 5);
  const grammar = nonMC.filter(q => q.colMax <= 5);
  grammar.forEach(q => push('语法填空', q.col));
  if (writing[0]) push('应用文', writing[0].col);
  if (writing[1]) push('续写', writing[1].col);

  const sections = SECTION_ORDER
    .filter(name => sect[name] && sect[name].length)
    .map(name => ({ name, kind: OBJECTIVE.has(name) ? 'objective' : 'subjective', cols: sect[name] }));

  const scope = sections.some(s => s.kind === 'subjective') ? 120 : 80;
  return { scope, meta, sections };
}

// 考生成绩-英语表 → { 学号: {gradeRank, classRank, tier} }
export function parseExamScores(header, rows) {
  if (!header) return {};
  const idCol = findCol(header, '学号');
  const gCol = findCol(header, '年级排名');
  const cCol = findCol(header, '班级排名');
  const tCol = findCol(header, '档次');
  const map = {};
  for (const r of rows || []) {
    const id = String(r[idCol] ?? '').trim();
    if (!id) continue;
    map[id] = {
      gradeRank: gCol >= 0 ? r[gCol] : '',
      classRank: cCol >= 0 ? r[cCol] : '',
      tier: tCol >= 0 ? r[tCol] : '',
    };
  }
  return map;
}

export function buildStudentRows(dataRows, detection, examMap) {
  const { meta, sections, scope } = detection;
  const exam = examMap || {};
  return (dataRows || []).map(row => {
    const sectionScores = {};
    let objective = 0, subjective = 0;
    let hasSubjective = false;
    for (const s of sections) {
      let sum = 0;
      for (const c of s.cols) {
        const v = Number(row[c]);
        if (Number.isFinite(v)) sum += v;
      }
      sum = round2(sum);
      sectionScores[s.name] = sum;
      if (s.kind === 'objective') objective += sum;
      else { subjective += sum; hasSubjective = true; }
    }
    objective = round2(objective);
    subjective = hasSubjective ? round2(subjective) : null;
    const total120 = round2(objective + (subjective || 0));
    const reported = Number(row[meta.totalCol]);
    const warn = Number.isFinite(reported) ? Math.abs(reported - total120) > 0.5 : false;
    const converted130 = scope === 120 ? round2(total120 * 130 / 120) : null;
    const id = String(row[meta.idCol] ?? '').trim();
    const rk = exam[id] || {};
    return {
      id,
      name: String(row[meta.nameCol] ?? '').trim(),
      cls: String(row[meta.clsCol] ?? '').trim(),
      sections: sectionScores,
      objective,
      subjective,
      total120,
      converted130,
      listening: null,
      total150: null,
      gradeRank: rk.gradeRank ?? '',
      classRank: rk.classRank ?? '',
      tier: rk.tier ?? '',
      reportedTotal: Number.isFinite(reported) ? reported : null,
      warn,
    };
  });
}
export function parseSpeakingInput() { throw new Error('not implemented'); }
export function mergeSpeaking() { throw new Error('not implemented'); }
export function toTable() { throw new Error('not implemented'); }
export function toTSV() { throw new Error('not implemented'); }
export function toCSV() { throw new Error('not implemented'); }
