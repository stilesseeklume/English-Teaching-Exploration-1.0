// grammar-fill/modules/student-tracking.js
// 纯逻辑：学生级数据——抽花名册(学号→姓名)、把班级画像拆每生一行(含byCat)、跨卷聚成时间线、按本地表解析名。
// 不碰浏览器宿主对象 / 无网络 / 无 SheetJS。
/* eslint-disable */
(function(){
  function colIndexOf(header, label) {
    var i = header.indexOf(label);
    if (i === -1) i = header.indexOf(Number(label));
    return i;
  }

  // 从网阅 rows 抽 学号→姓名（读学号列+姓名列），跳过非学生行
  function extractStudentRoster(rows) {
    rows = rows || [];
    var header = rows[0] || [];
    var idCol = colIndexOf(header, '学号');
    var nameCol = header.indexOf('姓名');
    var out = [];
    if (idCol < 0) return out;
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r] || [];
      var sid = String(row[idCol] == null ? '' : row[idCol]).replace(/\.0$/, '').trim();
      if (!/^\d{6,}$/.test(sid)) continue;
      var name = nameCol >= 0 ? String(row[nameCol] == null ? '' : row[nameCol]).trim() : '';
      out.push({ studentNo: sid, name: name });
    }
    return out;
  }

  // 把班级画像拆成每生一行；result.byCat：错用 wrongQuestions 的考点（回填也有），对用 examForBuild 的题→考点
  // 考点聚合粒度真源（与 error-profile.js catKeyOf 一致）：优先 fine_category，回退 category。
  function catKeyOf(q){ return (q && (q.fine_category || q.category)) || ''; }

  function buildExamResultRows(profile, examForBuild, meta) {
    profile = profile || {}; examForBuild = examForBuild || []; meta = meta || {};
    var catByNo = {};
    examForBuild.forEach(function(q){ catByNo[q.no] = catKeyOf(q); });
    return (profile.students || []).map(function(s){
      var byCat = {};
      function bump(cat, key){ if (!cat) return; byCat[cat] = byCat[cat] || { right: 0, wrong: 0 }; byCat[cat][key]++; }
      var wq = s.wrongQuestions || [];
      if (wq.length) wq.forEach(function(q){ bump(catKeyOf(q), 'wrong'); });
      else (s.wrong || []).forEach(function(no){ bump(catByNo[no], 'wrong'); });
      (s.right || []).forEach(function(no){ bump(catByNo[no], 'right'); });
      return {
        client_id: meta.classId + '__' + meta.examId + '__' + s.studentNo,
        class_id: meta.classId, class_name: meta.className || '',
        exam_id: meta.examId, exam_label: meta.examLabel || '', exam_date: meta.examDate || null,
        student_no: s.studentNo,
        result: { right: s.right || [], wrong: s.wrong || [], blank: s.blank || [], wrongQuestions: wq, byCat: byCat }
      };
    });
  }

  // 把每生一卷的行跨卷聚合成时间线：每学号 → {studentNo, exams[按日期升序], weakCats[按错次降序]}
  function buildStudentTimeline(rows, rosterNos) {
    rows = rows || []; rosterNos = rosterNos || [];
    var byStu = {};
    var examSet = {};
    rows.forEach(function(row){
      var sn = row.student_no; if (!sn) return;
      if (row.exam_id) examSet[row.exam_id] = 1;
      if (!byStu[sn]) byStu[sn] = { studentNo: sn, exams: [], cat: {} };
      var st = byStu[sn];
      var res = row.result || {};
      st.exams.push({
        examId: row.exam_id, examLabel: row.exam_label || row.exam_id, examDate: row.exam_date || '',
        rightCount: (res.right || []).length, wrongCount: (res.wrong || []).length, blankCount: (res.blank || []).length,
        wrongQuestions: res.wrongQuestions || []
      });
      var bc = res.byCat || {};
      Object.keys(bc).forEach(function(c){
        st.cat[c] = st.cat[c] || { category: c, right: 0, wrong: 0 };
        st.cat[c].right += bc[c].right || 0;
        st.cat[c].wrong += bc[c].wrong || 0;
      });
    });
    rosterNos.forEach(function(sn){ if (sn && !byStu[sn]) byStu[sn] = { studentNo: sn, exams: [], cat: {} }; });
    var totalExams = Object.keys(examSet).length;
    return Object.keys(byStu).map(function(sn){
      var st = byStu[sn];
      st.exams.sort(function(a, z){ return String(a.examDate).localeCompare(String(z.examDate)); });
      st.weakCats = Object.keys(st.cat).map(function(c){ return st.cat[c]; })
        .filter(function(x){ return x.wrong > 0; })
        .sort(function(a, z){ return z.wrong - a.wrong; });
      st.examCount = st.exams.length;
      st.missedCount = Math.max(0, totalExams - st.examCount);
      delete st.cat;
      return st;
    }).sort(function(a, z){
      var aw = a.weakCats.reduce(function(s, x){ return s + x.wrong; }, 0);
      var zw = z.weakCats.reduce(function(s, x){ return s + x.wrong; }, 0);
      return zw - aw;
    });
  }

  function resolveStudentName(nameMap, studentNo) {
    nameMap = nameMap || {};
    return nameMap[studentNo] || studentNo;
  }

  // 手动「添加学生」：把多行文本解析成 [{studentNo, name}]。
  // 每行可写「学号 姓名」（学号≥4位数字开头，分隔可空格/逗号/Tab），也可只写姓名（学号留空，由调用方补本地键）。
  function parseRosterText(text) {
    var lines = String(text == null ? '' : text).split(/\r?\n/);
    var out = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;
      var m = line.match(/^(\d{4,})\s*[,，\t]?\s*(.*)$/);
      if (m) out.push({ studentNo: m[1], name: (m[2] || '').trim() });
      else out.push({ studentNo: '', name: line });
    }
    return out;
  }

  window.GrammarStudentTracking = {
    extractStudentRoster: extractStudentRoster,
    buildExamResultRows: buildExamResultRows,
    buildStudentTimeline: buildStudentTimeline,
    resolveStudentName: resolveStudentName,
    parseRosterText: parseRosterText
  };
})();
