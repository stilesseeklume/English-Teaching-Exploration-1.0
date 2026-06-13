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
      +   '<div style="font-weight:600;margin-bottom:4px;">把套卷和成绩拖进来 —— 自动 AI 识考点 + 匹配成画像</div>'
      +   '<div style="color:#888;font-size:12px;margin-bottom:12px;">两个都拖好就自动出画像，存进上面选的班级。</div>'
      +   '<div style="display:flex;gap:12px;flex-wrap:wrap;">'
      +     '<div class="docx-dropzone" id="errorExamDrop"><span class="docx-dropzone-icon">📄</span><span id="errorExamLabel">① 把套卷 Word 拖进来，或<b>点击上传</b></span></div>'
      +     '<div class="docx-dropzone" id="errorScoreDrop"><span class="docx-dropzone-icon">📊</span><span id="errorScoreLabel">② 把网阅成绩 .xls 拖进来，或<b>点击上传</b></span></div>'
      +   '</div>'
      +   '<div style="color:#888;font-size:12px;margin-top:10px;">套卷也可以 '
      +     '<select id="errorProfileExam" style="padding:4px 8px;border:1px solid #ddd;border-radius:6px;font-size:12px;">'
      +       '<option value="">从题库选已传过的</option>' + opts
      +     '</select></div>'
      +   '<input type="file" id="errorExamFile" accept=".docx" style="display:none;">'
      +   '<input type="file" id="errorProfileFile" accept=".xls,.xlsx" style="display:none;">'
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

  function importClassBarHtml(classes) {
    classes = classes || [];
    var opts = classes.map(function(c){ return '<option value="' + esc(c.id) + '">' + esc(c.name) + '</option>'; }).join('');
    return '<div style="background:#fff;border:1px solid #eee;border-radius:14px;padding:16px 20px;margin-bottom:16px;">'
      + '<div style="font-weight:600;margin-bottom:10px;">这是哪个班的成绩？</div>'
      + '<select id="errorImportClass" style="padding:8px 12px;border:1px solid #ddd;border-radius:8px;margin-right:10px;">'
      + '<option value="">— 选班级 —</option>' + opts + '</select>'
      + '<button type="button" id="errorImportNewClass" style="padding:8px 12px;border-radius:8px;border:1px solid #cfe3ff;background:#f0f7ff;color:#0071e3;cursor:pointer;">＋ 新建班级</button>'
      + '</div>';
  }

  function classChipsHtml(classList, selectedId) {
    classList = classList || [];
    var chips = classList.map(function(c){
      var active = c.id === selectedId;
      return '<button type="button" class="ep-class-chip" data-id="' + esc(c.id) + '" style="padding:6px 14px;border-radius:999px;cursor:pointer;font-size:13px;margin:0 8px 8px 0;'
        + (active ? 'background:#0071e3;color:#fff;border:1px solid #0071e3;' : 'background:#f7f7f7;color:#333;border:1px solid #e5e5e5;') + '">'
        + esc(c.name) + ' <span style="opacity:0.7;">' + (c.count || 0) + '</span></button>';
    }).join('');
    var newChip = '<button type="button" class="ep-class-new" style="padding:6px 14px;border-radius:999px;cursor:pointer;font-size:13px;margin:0 8px 8px 0;background:#fff;color:#0071e3;border:1px dashed #cfe3ff;">＋ 新建班级</button>';
    return '<div style="margin-bottom:14px;">'
      + (classList.length ? '<div style="font-weight:600;margin-bottom:8px;">我的班级</div>' : '<div style="color:#888;font-size:13px;margin-bottom:8px;">还没有班级——新建一个，导入成绩时选它。</div>')
      + chips + newChip + '</div>';
  }

  function studentTimelineHtml(timeline, nameMap, catNames) {
    timeline = timeline || []; catNames = catNames || {};
    var resolve = (window.GrammarStudentTracking && window.GrammarStudentTracking.resolveStudentName) || function(m, s){ return (m && m[s]) || s; };
    if (!timeline.length) {
      return '<div style="background:#fff;border:1px solid #eee;border-radius:14px;padding:24px;color:#888;text-align:center;">这个班还没有上过云的成绩。导一次成绩就有了。</div>';
    }
    return timeline.map(function(st){
      var name = esc(resolve(nameMap || {}, st.studentNo));
      var weak = (st.weakCats || []).slice(0, 5).map(function(c){
        return '<span style="display:inline-block;margin:2px 6px 2px 0;padding:2px 8px;border-radius:10px;background:#fff0f0;color:#c0392b;font-size:12px;">' + esc(catNames[c.category] || c.category) + ' 错' + c.wrong + '</span>';
      }).join('');
      var exams = (st.exams || []).map(function(e){
        return '<span style="display:inline-block;min-width:96px;margin:3px 6px 3px 0;padding:4px 8px;border:1px solid #eee;border-radius:8px;font-size:12px;">'
          + esc(e.examLabel) + '：对' + e.rightCount + ' 错' + e.wrongCount + (e.blankCount ? ' 缺' + e.blankCount : '') + '</span>';
      }).join('');
      var missedBadge = (st.missedCount > 0)
        ? ' <span style="font-weight:400;font-size:12px;color:#e67e22;background:#fff5ec;border-radius:10px;padding:1px 8px;margin-left:6px;">缺考 ' + st.missedCount + '</span>'
        : '';
      var examsLine = (st.exams && st.exams.length) ? exams : '<span style="color:#aaa;font-size:12px;">暂无成绩</span>';
      return '<div style="background:#fff;border:1px solid #eee;border-radius:14px;padding:16px 20px;margin-bottom:12px;">'
        + '<div style="font-weight:600;margin-bottom:6px;">' + name + missedBadge + '</div>'
        + (weak ? '<div style="margin-bottom:8px;">高频弱项：' + weak + '</div>' : '')
        + '<div>' + examsLine + '</div>'
        + '</div>';
    }).join('');
  }

  function examChipsHtml(exams, selectedId) {
    exams = exams || [];
    if (!exams.length) return '<div style="background:#fff;border:1px solid #eee;border-radius:14px;padding:20px;color:#888;text-align:center;margin-bottom:14px;">还没有导入的卷子。去「导入成绩」传一套吧。</div>';
    var chips = exams.map(function(e){
      var active = e.id === selectedId;
      var dot = (e.focusCount > 0) ? '<span style="margin-left:5px;font-size:11px;color:' + (active ? '#fff' : '#e74c3c') + ';">●' + e.focusCount + '</span>' : '';
      return '<button type="button" class="ep-exam-chip" data-id="' + esc(e.id) + '" style="flex:0 0 auto;padding:6px 12px;border-radius:10px;cursor:pointer;font-size:13px;margin:0 8px 0 0;white-space:nowrap;'
        + (active ? 'background:#0071e3;color:#fff;border:1px solid #0071e3;' : 'background:#f7f7f7;color:#333;border:1px solid #e5e5e5;') + '">'
        + esc(e.examLabel) + dot + '</button>';
    }).join('');
    return '<div style="margin-bottom:14px;">'
      + '<div style="font-weight:600;margin-bottom:8px;">选一套卷看画像 <span style="font-weight:400;color:#888;font-size:12px;">· 按时间排，' + exams.length + ' 套，左早右近</span></div>'
      + '<div style="display:flex;overflow-x:auto;padding-bottom:4px;">' + chips + '</div></div>';
  }

  function sparklineSvg(rates) {
    rates = rates || [];
    if (rates.filter(function(r){ return r != null; }).length < 2) return '<span style="color:#bbb;font-size:11px;">数据不足</span>';
    var W = 130, H = 26, n = rates.length, coords = [];
    rates.forEach(function(r, i){
      if (r == null) return;
      var x = n > 1 ? (i / (n - 1)) * (W - 4) + 2 : 2;
      var y = H - 2 - (r / 100) * (H - 4);
      coords.push(x.toFixed(1) + ',' + y.toFixed(1));
    });
    return '<svg width="' + W + '" height="' + H + '" style="vertical-align:middle;">'
      + '<polyline points="' + coords.join(' ') + '" fill="none" stroke="#0071e3" stroke-width="1.8" stroke-linejoin="round"/></svg>';
  }

  function catTrendHtml(trends, catNames) {
    trends = trends || []; catNames = catNames || {};
    if (!trends.length) return '';
    var rows = trends.map(function(t){
      var rate = t.latestRate == null ? '—' : (t.latestRate + '%');
      var color = t.latestRate == null ? '#888' : (t.latestRate < 60 ? '#e74c3c' : (t.latestRate < 85 ? '#f39c12' : '#27ae60'));
      var arrow = t.delta > 3 ? '<span style="color:#27ae60;">↑' + t.delta + '</span>' : (t.delta < -3 ? '<span style="color:#e74c3c;">↓' + (-t.delta) + '</span>' : '<span style="color:#aaa;">→</span>');
      return '<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid #f4f4f4;">'
        + '<span style="width:84px;font-weight:600;font-size:13px;">' + esc(catNames[t.category] || t.category) + '</span>'
        + sparklineSvg((t.series || []).map(function(p){ return p.rate; }))
        + '<span style="width:46px;text-align:right;font-weight:600;color:' + color + ';">' + rate + '</span>'
        + '<span style="width:50px;text-align:right;font-size:12px;">' + arrow + '</span>'
        + '</div>';
    }).join('');
    return '<div style="background:#fff;border:1px solid #eee;border-radius:14px;padding:16px 20px;margin-bottom:16px;">'
      + '<div style="font-weight:600;margin-bottom:8px;">📈 考点趋势 · 正确率随卷变化 <span style="font-weight:400;color:#888;font-size:12px;">· 左早右近，越靠上越该补</span></div>' + rows + '</div>';
  }

  window.GrammarErrorProfileRender = {
    uploadPanelHtml: uploadPanelHtml,
    profilePageHtml: profilePageHtml,
    boardListHtml: boardListHtml,
    importClassBarHtml: importClassBarHtml,
    classChipsHtml: classChipsHtml,
    studentTimelineHtml: studentTimelineHtml,
    examChipsHtml: examChipsHtml,
    catTrendHtml: catTrendHtml
  };
})();
