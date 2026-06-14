// grammar-fill/modules/error-profile-view.js
//
// 纯逻辑：完整画像（引擎产物）→ 视图模型（考点排行+讲评优先级、题表、学生列表、汇总）。
// 无 DOM / 无网络。

/* eslint-disable */
(function(){
  // 讲评优先级：全对/无应答→skip(可略过)；正确率<60→focus(重点讲)；<85→watch(关注)；否则 skip。
  function teachPriority(rate, wrong) {
    if (!wrong) return 'skip';
    if (rate == null) return 'skip';
    if (rate < 60) return 'focus';
    if (rate < 85) return 'watch';
    return 'skip';
  }

  function buildProfileViewModel(profile, catNames) {
    profile = profile || {};
    catNames = catNames || {};
    var byCat = profile.byCat || {};
    var byNo = profile.byNo || {};
    var students = profile.students || [];

    var catRanking = Object.keys(byCat).map(function(cat){
      var b = byCat[cat];
      return {
        category: cat,
        categoryName: catNames[cat] || cat,
        right: b.right, wrong: b.wrong, rate: b.rate,
        priority: teachPriority(b.rate, b.wrong)
      };
    }).sort(function(a, z){
      var ar = a.rate == null ? 999 : a.rate, zr = z.rate == null ? 999 : z.rate;
      if (ar !== zr) return ar - zr;
      return z.wrong - a.wrong;
    });

    var noList = Object.keys(byNo).map(function(no){
      var b = byNo[no];
      return { no: Number(no), right: b.right, wrong: b.wrong, blank: b.blank };
    }).sort(function(a, z){ return a.no - z.no; });

    var studentList = students.map(function(s){
      return {
        studentNo: s.studentNo,
        rightCount: (s.right || []).length,
        wrongCount: (s.wrong || []).length,
        blankCount: (s.blank || []).length,
        wrongQuestions: s.wrongQuestions || []
      };
    }).sort(function(a, z){ return z.wrongCount - a.wrongCount; });

    var summary = {
      studentCount: students.length,
      questionCount: noList.length,
      focusCount: catRanking.filter(function(c){ return c.priority === 'focus'; }).length
    };

    return { catRanking: catRanking, noList: noList, students: studentList, summary: summary };
  }

  // buildCatTrends: 跨卷考点趋势。exams=[{examLabel, examDate, byCat}]（按时间升序）→
  // 每考点 [{examLabel, rate}] 序列 + 最新/首次正确率 + 变化量；按最新正确率升序（最弱在前）。
  function buildCatTrends(exams) {
    exams = exams || [];
    var catSet = {};
    exams.forEach(function(ex){ Object.keys((ex && ex.byCat) || {}).forEach(function(c){ catSet[c] = 1; }); });
    return Object.keys(catSet).map(function(c){
      var series = exams.map(function(ex){ var b = (ex.byCat || {})[c]; return { examLabel: ex.examLabel, rate: (b && b.rate != null) ? b.rate : null }; });
      var rated = series.filter(function(p){ return p.rate != null; });
      var latestRate = rated.length ? rated[rated.length - 1].rate : null;
      var firstRate = rated.length ? rated[0].rate : null;
      var delta = (latestRate != null && firstRate != null) ? (latestRate - firstRate) : 0;
      return { category: c, series: series, latestRate: latestRate, firstRate: firstRate, delta: delta };
    }).sort(function(a, z){ return (a.latestRate == null ? 999 : a.latestRate) - (z.latestRate == null ? 999 : z.latestRate); });
  }

  // buildStudentProfileVM: 单个学生的时间线 → 个人画像视图模型（供可视化）。
  // in:  { studentNo, exams:[{examLabel,examDate,rightCount,wrongCount,blankCount}], weakCats:[{category,right,wrong}], missedCount }
  // out: { studentNo, rateSeries:[{examLabel,rate}], weakCats:[{category,categoryName,right,wrong,rate}],
  //        exams, examCount, missedCount, latestRate }
  // 每卷正确率 rate = 对/(对+错)*100 取整（无应答=null，缺考不进分母）。
  function buildStudentProfileVM(st, catNames) {
    st = st || {}; catNames = catNames || {};
    var exams = st.exams || [];
    var rateSeries = exams.map(function(e){
      var ans = (e.rightCount || 0) + (e.wrongCount || 0);
      return { examLabel: e.examLabel, rate: ans > 0 ? Math.round((e.rightCount || 0) / ans * 100) : null };
    });
    var weakCats = (st.weakCats || []).map(function(c){
      var ans = (c.right || 0) + (c.wrong || 0);
      return {
        category: c.category, categoryName: catNames[c.category] || c.category,
        right: c.right || 0, wrong: c.wrong || 0,
        rate: ans > 0 ? Math.round((c.right || 0) / ans * 100) : null
      };
    });
    var rated = rateSeries.filter(function(p){ return p.rate != null; });
    return {
      studentNo: st.studentNo,
      rateSeries: rateSeries,
      weakCats: weakCats,
      exams: exams,
      examCount: exams.length,
      missedCount: st.missedCount || 0,
      latestRate: rated.length ? rated[rated.length - 1].rate : null
    };
  }

  window.GrammarErrorProfileView = {
    buildProfileViewModel: buildProfileViewModel,
    teachPriority: teachPriority,
    buildCatTrends: buildCatTrends,
    buildStudentProfileVM: buildStudentProfileVM
  };
})();
