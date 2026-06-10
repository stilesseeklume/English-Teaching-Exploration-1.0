// grammar-fill/modules/error-profile.js
//
// 纯逻辑：网阅「学生小题分」行数据 → 每生语法填空对/错/缺考；再 → 班级完整画像（含正确率）+ 个人错题集。
// 无 DOM / 无网络 / 无 SheetJS。.xls 的解析由调用方（页面用 SheetJS）做，把行数组传进来。

/* eslint-disable */
(function(){
  function colIndexOf(header, label) {
    var i = header.indexOf(label);
    if (i === -1) i = header.indexOf(Number(label));   // 表头可能是数字而非字符串
    return i;
  }

  // rows: 数组的数组（含表头/子表头）；grammarNos: 该套卷语法填空题号，如 [36..45]
  // 每生每题分三类：得分>0=对(right)、得分===0=错(wrong)、空/无法解析=缺考(blank)。
  function extractGrammarResults(rows, grammarNos) {
    rows = rows || [];
    grammarNos = grammarNos || [];
    var header = rows[0] || [];
    var idCol = colIndexOf(header, '学号');
    var noCol = {};
    grammarNos.forEach(function(no){ noCol[no] = colIndexOf(header, String(no)); });

    var students = [];
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r] || [];
      var sid = idCol >= 0 ? String(row[idCol] == null ? '' : row[idCol]) : '';
      sid = sid.replace(/\.0$/, '').trim();
      if (!/^\d{6,}$/.test(sid)) continue;             // 跳过表头/子表头/统计等非学生行
      var right = [], wrong = [], blank = [];
      grammarNos.forEach(function(no){
        var c = noCol[no];
        if (c == null || c < 0) return;                // 该题无列 → 无数据，不计
        var v = row[c];
        if (v === '' || v == null) { blank.push(no); return; }   // 空 → 缺考
        var score = Number(v);
        if (score === 0) wrong.push(no);               // 0 分 → 错
        else if (score > 0) right.push(no);            // 有分 → 对
        else blank.push(no);                           // NaN/负 等异常 → 当无数据
      });
      students.push({ studentNo: sid, right: right, wrong: wrong, blank: blank });
    }
    return { students: students };
  }

  // studentResults: extractGrammarResults 的产物（{students:[{studentNo,right,wrong,blank}]}）
  // examQuestions: 该套卷语法填空题 [{no,category,fine_category,answer}]
  // 产出完整画像：
  //   byCat[考点]   = { right, wrong, rate }   正确率 = 对/(对+错)*100 取整，缺考不进分母；无应答=null
  //   byNo[题号]    = { right, wrong, blank }
  //   students[i]   = { studentNo, right, wrong, blank, wrongQuestions }
  function buildErrorProfile(studentResults, examQuestions) {
    examQuestions = examQuestions || [];
    var list = (studentResults && studentResults.students) || studentResults || [];
    var qByNo = {};
    examQuestions.forEach(function(q){ qByNo[String(q.no)] = q; });

    var byCat = {};
    var byNo = {};
    function ensureCat(c){ if (!byCat[c]) byCat[c] = { right: 0, wrong: 0, rate: null }; return byCat[c]; }
    function ensureNo(n){ if (!byNo[n]) byNo[n] = { right: 0, wrong: 0, blank: 0 }; return byNo[n]; }

    var students = list.map(function(s){
      var right = s.right || [], wrong = s.wrong || [], blank = s.blank || [];
      var wrongQuestions = [];
      right.forEach(function(no){
        ensureNo(no).right++;
        var q = qByNo[String(no)];
        if (q) ensureCat(q.category).right++;
      });
      wrong.forEach(function(no){
        ensureNo(no).wrong++;
        var q = qByNo[String(no)];
        if (q) {
          ensureCat(q.category).wrong++;
          wrongQuestions.push({ no: q.no, category: q.category, fine_category: q.fine_category, answer: q.answer });
        }
      });
      blank.forEach(function(no){ ensureNo(no).blank++; });
      return { studentNo: s.studentNo, right: right, wrong: wrong, blank: blank, wrongQuestions: wrongQuestions };
    });

    Object.keys(byCat).forEach(function(c){
      var b = byCat[c];
      var answered = b.right + b.wrong;
      b.rate = answered > 0 ? Math.round(b.right / answered * 100) : null;
    });

    return { byCat: byCat, byNo: byNo, students: students };
  }

  // detectGrammarNos: from network-scoring rows, identify grammar-fill question numbers.
  // Rule: a column whose header is a number 1-200, and every non-empty student score is in {0, 1.5}
  // (the 1.5-per-question scoring signal), is treated as a grammar-fill column.
  // Columns where every student scored 0 (all wrong) are also included.
  // Returns question numbers in ascending order.
  function detectGrammarNos(rows) {
    rows = rows || [];
    var header = rows[0] || [];
    var out = [];
    for (var c = 0; c < header.length; c++) {
      var no = Number(header[c]);
      if (!(no >= 1 && no <= 200)) continue;
      var allOk = true, seen = false;
      for (var r = 1; r < rows.length; r++) {
        var v = (rows[r] || [])[c];
        if (v === '' || v == null) continue;
        var s = Number(v);
        if (isNaN(s)) continue;
        seen = true;
        if (s !== 0 && s !== 1.5) { allOk = false; break; }
      }
      if (seen && allOk) out.push(no);
    }
    return out;
  }

  // alignExamQuestions: remap exam question numbers by position to match the detected numbers.
  // Sorts exam questions by their original no, then replaces each no with detectedNos[i].
  // This allows question sets numbered 1-10 in the exam bank to align with 36-45 in score sheets.
  // category, fine_category, and answer are preserved as-is.
  function alignExamQuestions(examQuestions, detectedNos) {
    examQuestions = examQuestions || [];
    detectedNos = detectedNos || [];
    var sorted = examQuestions.slice().sort(function(a, z){ return a.no - z.no; });
    return sorted.map(function(q, i){
      return { no: detectedNos[i], category: q.category, fine_category: q.fine_category, answer: q.answer };
    });
  }

  // extractGrammarBlanks: 把 AI 解析出的 passages 拍平成语法填空题列表。
  // passage.blanks 形状 {no, answer, category, fine_category?, analysis}；
  // 输出 [{no, category, answer, fine_category}] 按题号升序、按题号去重（先出现者保留）。
  function extractGrammarBlanks(passagesArr) {
    passagesArr = passagesArr || [];
    var seen = {}, out = [];
    passagesArr.forEach(function(p){
      (((p && p.blanks) || [])).forEach(function(b){
        var no = parseInt(b && b.no, 10);
        if (!(no >= 1)) return;
        if (seen[no]) return;
        seen[no] = true;
        out.push({ no: no, category: b.category, answer: b.answer, fine_category: b.fine_category });
      });
    });
    return out.sort(function(a, z){ return a.no - z.no; });
  }

  window.GrammarErrorProfile = {
    extractGrammarResults: extractGrammarResults,
    buildErrorProfile: buildErrorProfile,
    detectGrammarNos: detectGrammarNos,
    alignExamQuestions: alignExamQuestions,
    extractGrammarBlanks: extractGrammarBlanks
  };
})();
