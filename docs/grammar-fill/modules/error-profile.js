// grammar-fill/modules/error-profile.js
//
// 纯逻辑：网阅「学生小题分」行数据 → 每生语法填空错题；再 → 班级/个人考点画像。
// 无 DOM / 无网络 / 无 SheetJS。.xls 的解析由调用方（页面用 SheetJS）做，把行数组传进来。

/* eslint-disable */
(function(){
  function colIndexOf(header, label) {
    var i = header.indexOf(label);
    if (i === -1) i = header.indexOf(Number(label));   // 表头可能是数字而非字符串
    return i;
  }

  // rows: 数组的数组（含表头/子表头）；grammarNos: 该套卷语法填空题号，如 [36..45]
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
      var wrong = [];
      grammarNos.forEach(function(no){
        var c = noCol[no];
        if (c == null || c < 0) return;
        var v = row[c];
        var score = (v === '' || v == null) ? null : Number(v);
        if (score === 0) wrong.push(no);
      });
      students.push({ studentNo: sid, wrong: wrong });
    }
    return { students: students };
  }

  // studentResults: extractGrammarResults 的产物（{students:[{studentNo,wrong:[题号]}]}）
  // examQuestions: 该套卷语法填空题 [{no,category,fine_category,answer}]
  function buildErrorProfile(studentResults, examQuestions) {
    examQuestions = examQuestions || [];
    var list = (studentResults && studentResults.students) || studentResults || [];
    var qByNo = {};
    examQuestions.forEach(function(q){ qByNo[String(q.no)] = q; });

    var classByCat = {};
    var classByNo = {};
    var students = list.map(function(s){
      var wrongCats = [];
      var wrongQuestions = [];
      (s.wrong || []).forEach(function(no){
        var q = qByNo[String(no)];
        if (!q) return;
        wrongCats.push(q.category);
        wrongQuestions.push({ no: q.no, category: q.category, fine_category: q.fine_category, answer: q.answer });
        classByCat[q.category] = (classByCat[q.category] || 0) + 1;
        classByNo[no] = (classByNo[no] || 0) + 1;
      });
      return { studentNo: s.studentNo, wrongCats: wrongCats, wrongQuestions: wrongQuestions };
    });
    return { classByCat: classByCat, classByNo: classByNo, students: students };
  }

  window.GrammarErrorProfile = {
    extractGrammarResults: extractGrammarResults,
    buildErrorProfile: buildErrorProfile
  };
})();
