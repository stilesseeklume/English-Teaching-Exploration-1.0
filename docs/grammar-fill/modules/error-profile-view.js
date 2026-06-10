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

  window.GrammarErrorProfileView = {
    buildProfileViewModel: buildProfileViewModel,
    teachPriority: teachPriority
  };
})();
