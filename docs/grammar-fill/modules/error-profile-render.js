// grammar-fill/modules/error-profile-render.js
//
// 纯逻辑：视图模型 → HTML 字符串。无 DOM 操作（不碰浏览器宿主对象），只拼字符串。
// 用 window.escapeHtml 转义动态内容。

/* eslint-disable */
(function(){
  var PRIORITY_LABEL = { focus: '🔴 重点讲', watch: '🟡 关注', skip: '⚪ 可略过' };

  function esc(s){ return window.escapeHtml(s == null ? '' : s); }

  function uploadPanelHtml(exams) {
    exams = exams || [];
    var opts = exams.map(function(e){
      return '<option value="' + esc(e.examId) + '">' + esc(e.label) + '</option>';
    }).join('');
    return ''
      + '<div style="background:#fff;border:1px solid #eee;border-radius:14px;padding:20px;margin-bottom:16px;">'
      +   '<div style="font-weight:600;margin-bottom:12px;">① 选这套卷　② 传这次成绩（网阅小题分 .xls）</div>'
      +   '<select id="errorProfileExam" style="padding:8px 12px;border:1px solid #ddd;border-radius:8px;margin-right:12px;">'
      +     '<option value="">— 选择套卷 —</option>' + opts
      +   '</select>'
      +   '<input type="file" id="errorProfileFile" accept=".xls,.xlsx" style="margin-top:8px;">'
      +   '<div id="errorProfileMsg" style="color:#c0392b;font-size:13px;margin-top:8px;"></div>'
      + '</div>';
  }

  function barHtml(rate) {
    var pct = rate == null ? 0 : rate;
    var color = pct < 60 ? '#e74c3c' : (pct < 85 ? '#f39c12' : '#27ae60');
    return '<span style="display:inline-block;width:120px;height:10px;background:#eee;border-radius:5px;vertical-align:middle;overflow:hidden;">'
      + '<span style="display:block;width:' + pct + '%;height:100%;background:' + color + ';"></span></span>';
  }

  function catRankingHtml(catRanking) {
    if (!catRanking.length) return '';
    var rows = catRanking.map(function(c){
      var rateText = c.rate == null ? '—' : (c.rate + '%');
      return '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f4f4f4;">'
        + '<span style="width:84px;font-weight:600;">' + esc(c.categoryName) + '</span>'
        + barHtml(c.rate)
        + '<span style="width:48px;text-align:right;">' + rateText + '</span>'
        + '<span style="color:#888;font-size:12px;">对' + c.right + ' / 错' + c.wrong + '</span>'
        + '<span style="margin-left:auto;font-size:12px;">' + (PRIORITY_LABEL[c.priority] || '') + '</span>'
        + '</div>';
    }).join('');
    return '<div style="background:#fff;border:1px solid #eee;border-radius:14px;padding:16px 20px;margin-bottom:16px;">'
      + '<div style="font-weight:600;margin-bottom:8px;">考点画像 · 正确率排行（低的该重点讲）</div>' + rows + '</div>';
  }

  function noListHtml(noList) {
    if (!noList.length) return '';
    var cells = noList.map(function(n){
      var btn = n.wrong > 0
        ? '<button type="button" class="ep-add-error" data-no="' + n.no + '" style="margin-left:6px;padding:1px 7px;border-radius:6px;border:1px solid #cfe3ff;background:#f0f7ff;color:#0071e3;cursor:pointer;font-size:11px;">+错题本</button>'
        : '';
      return '<span style="display:inline-block;min-width:130px;padding:6px 10px;margin:4px;border:1px solid #eee;border-radius:8px;font-size:13px;">'
        + '第' + n.no + '题　对' + n.right + ' 错' + n.wrong + (n.blank ? ' 缺考' + n.blank : '') + btn + '</span>';
    }).join('');
    return '<div style="background:#fff;border:1px solid #eee;border-radius:14px;padding:16px 20px;margin-bottom:16px;">'
      + '<div style="font-weight:600;margin-bottom:8px;">每题对错 <span style="font-weight:400;color:#888;font-size:12px;">· 错题可「+错题本」变迁移弹药</span></div>' + cells + '</div>';
  }

  function studentsHtml(students) {
    if (!students.length) return '';
    var rows = students.map(function(s){
      var wq = (s.wrongQuestions || []).map(function(q){ return '第' + q.no + '题(答案 ' + esc(q.answer) + ')'; }).join('、');
      return '<div style="padding:8px 0;border-bottom:1px solid #f4f4f4;font-size:13px;">'
        + '<span style="font-weight:600;">' + esc(s.studentNo) + '</span>'
        + '<span style="color:#888;margin-left:10px;">对' + s.rightCount + ' 错' + s.wrongCount + (s.blankCount ? ' 缺考' + s.blankCount : '') + '</span>'
        + (wq ? '<span style="margin-left:10px;color:#c0392b;">错题：' + wq + '</span>' : '')
        + '</div>';
    }).join('');
    return '<div style="background:#fff;border:1px solid #eee;border-radius:14px;padding:16px 20px;">'
      + '<div style="font-weight:600;margin-bottom:8px;">学生（错最多在前）</div>' + rows + '</div>';
  }

  function profilePageHtml(vm) {
    vm = vm || {};
    var s = vm.summary || {};
    var head = '<div style="color:#666;font-size:13px;margin-bottom:12px;">'
      + '共 ' + (s.studentCount || 0) + ' 名学生 · ' + (s.questionCount || 0) + ' 道语法填空 · '
      + '<b style="color:#e74c3c;">' + (s.focusCount || 0) + '</b> 个考点需重点讲</div>';
    return head + catRankingHtml(vm.catRanking || []) + noListHtml(vm.noList || []) + studentsHtml(vm.students || []);
  }

  function boardListHtml(boardModel) {
    boardModel = boardModel || [];
    if (!boardModel.length) {
      return '<div style="background:#fff;border:1px solid #eee;border-radius:14px;padding:24px;color:#888;text-align:center;">还没有导入的卷子。去「导入成绩」传一套吧。</div>';
    }
    return boardModel.map(function(e){
      return '<div class="ep-board-item" data-id="' + esc(e.id) + '" style="display:flex;align-items:center;gap:12px;background:#fff;border:1px solid #eee;border-radius:12px;padding:14px 18px;margin-bottom:10px;">'
        + '<div style="flex:1;">'
        +   '<div style="font-weight:600;">' + esc(e.examLabel) + '</div>'
        +   '<div style="color:#888;font-size:12px;">' + esc(e.savedAtText) + ' · ' + e.studentCount + ' 生 · 重点讲 ' + e.focusCount + ' 个考点</div>'
        + '</div>'
        + '<button type="button" class="ep-board-view" data-id="' + esc(e.id) + '" style="padding:6px 14px;border-radius:8px;border:1px solid #ddd;background:#f7f7f7;cursor:pointer;">看画像</button>'
        + '<button type="button" class="ep-board-del" data-id="' + esc(e.id) + '" style="padding:6px 12px;border-radius:8px;border:1px solid #f3c0c0;background:#fff;color:#c0392b;cursor:pointer;">删</button>'
        + '</div>';
    }).join('');
  }

  window.GrammarErrorProfileRender = {
    uploadPanelHtml: uploadPanelHtml,
    profilePageHtml: profilePageHtml,
    boardListHtml: boardListHtml
  };
})();
