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
      +   '<div style="font-weight:600;margin-bottom:4px;">套卷 + 成绩拖进来 —— 套卷自动存备课资料 + AI 识考点，匹配成画像</div>'
      +   '<div style="color:#888;font-size:12px;margin-bottom:12px;">套卷一份两用（讲题 + 算分）；两个都拖好就自动出画像，存进上面选的班级。</div>'
      +   '<div style="display:flex;gap:12px;flex-wrap:wrap;">'
      +     '<div class="docx-dropzone" id="errorExamDrop"><span class="docx-dropzone-icon">📄</span><span id="errorExamLabel">① 套卷 Word 拖进来（存备课资料 + 抽题算画像），或<b>点击上传</b></span></div>'
      +     '<div class="docx-dropzone" id="errorScoreDrop"><span class="docx-dropzone-icon">📊</span><span id="errorScoreLabel">② 把网阅成绩 .xls 拖进来，或<b>点击上传</b></span></div>'
      +   '</div>'
      +   '<div style="color:#888;font-size:12px;margin-top:10px;">套卷也可以 '
      +     '<select id="errorProfileExam" style="padding:4px 8px;border:1px solid #ddd;border-radius:6px;font-size:12px;">'
      +       '<option value="">从题库或已导套卷里选</option>' + opts
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

  // catRankingHtml(catRanking, trendByCat?)：trendByCat[考点] = { series:[{rate}], delta } 时，
  // 行内嵌一条跨卷迷你趋势线 + 升降箭头（把"考点趋势"融进排行，免去单独一大块）。不传则与原样一致。
  function catRankingHtml(catRanking, trendByCat) {
    if (!catRanking.length) return '';
    trendByCat = trendByCat || {};
    var hasTrend = false; for (var k in trendByCat) { if (trendByCat.hasOwnProperty(k)) { hasTrend = true; break; } }
    var rows = catRanking.map(function(c){
      var rateText = c.rate == null ? '—' : (c.rate + '%');
      var trendCell = '';
      if (hasTrend) {
        var t = trendByCat[c.category];
        trendCell = t
          ? '<span style="display:inline-flex;align-items:center;gap:4px;width:100px;flex:0 0 auto;">'
              + miniSparkSvg((t.series || []).map(function(p){ return p.rate; })) + deltaHtml(t.delta) + '</span>'
          : '<span style="width:100px;flex:0 0 auto;color:#ccc;font-size:11px;">新考点</span>';
      }
      return '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f4f4f4;">'
        + '<span style="width:84px;flex:0 0 auto;font-weight:600;">' + esc(c.categoryName) + '</span>'
        + barHtml(c.rate)
        + '<span style="width:44px;flex:0 0 auto;text-align:right;">' + rateText + '</span>'
        + trendCell
        + '<span style="color:#999;font-size:12px;flex:0 0 auto;">对' + c.right + ' / 错' + c.wrong + '</span>'
        + '<span style="margin-left:auto;font-size:12px;flex:0 0 auto;">' + (PRIORITY_LABEL[c.priority] || '') + '</span>'
        + '<button type="button" class="ep-migrate" data-fine="' + esc(c.category) + '" style="margin-left:10px;padding:2px 10px;border-radius:8px;border:1px solid #cfe3ff;background:#f0f7ff;color:#0071e3;cursor:pointer;font-size:12px;flex:0 0 auto;">🎯 迁移</button>'
        + '</div>';
    }).join('');
    var hint = hasTrend ? ' <span style="font-weight:400;color:#888;font-size:12px;">· 趋势线左早右近</span>' : '';
    return '<div style="background:#fff;border:1px solid #eee;border-radius:14px;padding:16px 20px;margin-bottom:16px;">'
      + '<div style="font-weight:600;margin-bottom:8px;">考点画像 · 正确率排行（低的该重点讲）' + hint + '</div>' + rows + '</div>';
  }

  function noListHtml(noList) {
    if (!noList.length) return '';
    var cells = noList.map(function(n){
      var btn = '';   // 个人错题本已下线；班级错题练习走考点排行的「🎯迁移」
      return '<span style="display:inline-block;min-width:130px;padding:6px 10px;margin:4px;border:1px solid #eee;border-radius:8px;font-size:13px;">'
        + '第' + n.no + '题　对' + n.right + ' 错' + n.wrong + (n.blank ? ' 缺考' + n.blank : '') + btn + '</span>';
    }).join('');
    return '<div style="background:#fff;border:1px solid #eee;border-radius:14px;padding:16px 20px;margin-bottom:16px;">'
      + '<div style="font-weight:600;margin-bottom:8px;">每题对错</div>' + cells + '</div>';
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

  function profilePageHtml(vm, trendByCat) {
    vm = vm || {};
    var s = vm.summary || {};
    var head = '<div style="color:#666;font-size:13px;margin-bottom:12px;">'
      + '共 ' + (s.studentCount || 0) + ' 名学生 · ' + (s.questionCount || 0) + ' 道语法填空 · '
      + '<b style="color:#e74c3c;">' + (s.focusCount || 0) + '</b> 个考点需重点讲</div>';
    return head + catRankingHtml(vm.catRanking || [], trendByCat) + noListHtml(vm.noList || []) + studentsHtml(vm.students || []);
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

  // 导入成绩页只「选班」（成绩归到哪个班）。新建/删除班级、导名单都在「学生管理」里，这里不再混入。
  function importClassBarHtml(classes) {
    classes = classes || [];
    var opts = classes.map(function(c){ return '<option value="' + esc(c.id) + '">' + esc(c.name) + '</option>'; }).join('');
    var head = '<div style="background:#fff;border:1px solid #eee;border-radius:14px;padding:16px 20px;margin-bottom:16px;">'
      + '<div style="font-weight:600;margin-bottom:10px;">这是哪个班的成绩？</div>';
    if (!classes.length) {
      return head
        + '<div style="color:#888;font-size:13px;">还没有班级——先去「班级工作台」新建班级（可顺手导名单），再回来传成绩。</div>'
        + '</div>';
    }
    return head
      + '<select id="errorImportClass" style="padding:8px 12px;border:1px solid #ddd;border-radius:8px;">'
      +   '<option value="">— 选班级 —</option>' + opts + '</select>'
      + '<div style="color:#888;font-size:12px;margin-top:8px;">新建/删除班级、导入名单都在「班级工作台」里。</div>'
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

  // workbenchTabsHtml：班级工作台分段切换（考点视角 / 学生视角）。activeTab ∈ {'board','students'}。
  function workbenchTabsHtml(activeTab) {
    function seg(key, label) {
      var on = activeTab === key;
      return '<button type="button" class="wb-tab" data-tab="' + key + '" '
        + 'style="flex:1;padding:9px 0;border:none;cursor:pointer;font-size:14px;border-radius:9px;'
        + (on ? 'background:#fff;color:#0071e3;font-weight:600;box-shadow:0 1px 3px rgba(0,0,0,.08);' : 'background:transparent;color:#666;') + '">'
        + label + '</button>';
    }
    return '<div style="display:flex;gap:4px;background:#f0f0f2;border-radius:11px;padding:4px;margin:14px 0 12px;max-width:420px;">'
      + seg('board', '考点视角') + seg('students', '学生视角') + '</div>';
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

  // 行内迷你趋势线（融进考点排行那行用）。比 sparklineSvg 更小，末点带圆点。
  function miniSparkSvg(rates) {
    rates = rates || [];
    var W = 64, H = 18;
    if (rates.filter(function(r){ return r != null; }).length < 2) return '<span style="display:inline-block;width:' + W + 'px;color:#ccc;font-size:10px;text-align:center;">—</span>';
    var n = rates.length, coords = [], last = null;
    rates.forEach(function(r, i){
      if (r == null) return;
      var x = n > 1 ? (i / (n - 1)) * (W - 4) + 2 : 2;
      var y = H - 2 - (r / 100) * (H - 4);
      coords.push(x.toFixed(1) + ',' + y.toFixed(1)); last = [x, y];
    });
    var dot = last ? '<circle cx="' + last[0].toFixed(1) + '" cy="' + last[1].toFixed(1) + '" r="1.8" fill="#0071e3"/>' : '';
    return '<svg width="' + W + '" height="' + H + '" style="vertical-align:middle;flex:0 0 auto;">'
      + '<polyline points="' + coords.join(' ') + '" fill="none" stroke="#0071e3" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>' + dot + '</svg>';
  }

  // 升/降/平 箭头（>3 升、<-3 降）
  function deltaHtml(delta) {
    if (delta == null) return '';
    if (delta > 3) return '<span style="color:#27ae60;font-size:12px;">↑' + delta + '</span>';
    if (delta < -3) return '<span style="color:#e74c3c;font-size:12px;">↓' + (-delta) + '</span>';
    return '<span style="color:#bbb;font-size:12px;">→</span>';
  }

  // rateTrendBlock：单生「正确率随卷变化」折线图（红黄绿点 + 数值标注 + 60%参考线 + 首尾卷名）。
  function rateTrendBlock(series) {
    series = series || [];
    var rated = series.filter(function(p){ return p.rate != null; });
    if (rated.length < 2) return '<div style="color:#aaa;font-size:13px;margin-bottom:4px;">数据不足（至少 2 卷才看得出趋势）</div>';
    var W = 320, H = 96, padL = 8, padR = 8, padT = 12, padB = 22;
    var n = series.length, innerW = W - padL - padR, innerH = H - padT - padB, pts = [];
    series.forEach(function(p, i){
      if (p.rate == null) return;
      var x = n > 1 ? padL + (i / (n - 1)) * innerW : padL + innerW / 2;
      var y = padT + (1 - p.rate / 100) * innerH;
      pts.push({ x: x, y: y, rate: p.rate, label: p.examLabel });
    });
    var y60 = padT + (1 - 0.6) * innerH;
    var grid = '<line x1="' + padL + '" y1="' + y60.toFixed(1) + '" x2="' + (W - padR) + '" y2="' + y60.toFixed(1) + '" stroke="#eedede" stroke-width="1" stroke-dasharray="3 3"/>'
      + '<text x="' + padL + '" y="' + (y60 - 3).toFixed(1) + '" text-anchor="start" font-size="9" fill="#d9a0a0">60分线</text>';
    var line = '<polyline points="' + pts.map(function(p){ return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' ') + '" fill="none" stroke="#0071e3" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    var dots = pts.map(function(p){
      var col = p.rate < 60 ? '#e74c3c' : (p.rate < 85 ? '#f39c12' : '#27ae60');
      return '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="3" fill="' + col + '"/>'
        + '<text x="' + p.x.toFixed(1) + '" y="' + (p.y - 7).toFixed(1) + '" text-anchor="middle" font-size="10" fill="#666">' + p.rate + '</text>';
    }).join('');
    var xlabels = pts.map(function(p, idx){
      if (pts.length > 4 && idx !== 0 && idx !== pts.length - 1) return '';
      var lab = (p.label || ''); if (lab.length > 7) lab = lab.slice(0, 7);
      var anchor = idx === 0 ? 'start' : (idx === pts.length - 1 ? 'end' : 'middle');
      return '<text x="' + p.x.toFixed(1) + '" y="' + (H - 6) + '" text-anchor="' + anchor + '" font-size="10" fill="#aaa">' + esc(lab) + '</text>';
    }).join('');
    return '<div style="margin-bottom:4px;"><svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="max-width:440px;display:block;">'
      + grid + line + dots + xlabels + '</svg></div>';
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

  // catTrendDetailsHtml：把全考点跨卷趋势收进一个默认折叠的 <details>，沉到板块底部，永不挡路。
  function catTrendDetailsHtml(trends, catNames) {
    trends = trends || [];
    if (!trends.length) return '';
    return '<details style="margin-bottom:8px;">'
      + '<summary style="cursor:pointer;font-weight:600;color:#0071e3;font-size:14px;padding:10px 0;list-style:none;">📈 展开全部考点的跨卷趋势（' + trends.length + ' 个考点）</summary>'
      + '<div style="margin-top:8px;">' + catTrendHtml(trends, catNames) + '</div></details>';
  }

  // studentSearchBoxHtml：搜索框（姓名/学号即时筛）+ 匹配列表容器 + 个人画像容器。
  function studentSearchBoxHtml(count) {
    return '<div style="margin:10px 0 4px;">'
      + '<input id="stSearch" type="text" autocomplete="off" placeholder="🔍 搜学生：打姓名或学号…（共 ' + (count || 0) + ' 人）" '
      +   'style="width:100%;box-sizing:border-box;padding:11px 14px;border:1px solid #e5e5e5;border-radius:12px;font-size:14px;outline:none;background:#fff;">'
      + '</div>'
      + '<div id="stMatchList"></div>'
      + '<div id="stStudentDetail" style="margin-top:6px;"></div>';
  }

  // studentMatchListHtml：搜索命中（或默认"最需要关注"）的紧凑可点列表。一行一个学生 + 错次/缺考。
  function studentMatchListHtml(matches, nameMap, opt) {
    matches = matches || []; nameMap = nameMap || {}; opt = opt || {};
    var resolve = (window.GrammarStudentTracking && window.GrammarStudentTracking.resolveStudentName) || function(m, s){ return (m && m[s]) || s; };
    if (!matches.length) {
      return opt.emptyText ? '<div style="color:#aaa;font-size:13px;padding:10px 2px;">' + esc(opt.emptyText) + '</div>' : '';
    }
    var rows = matches.map(function(m){
      var nm = esc(resolve(nameMap, m.studentNo));
      var stat = (m.totalWrong != null) ? '<span style="color:#c0392b;font-size:12px;">错 ' + m.totalWrong + '</span>' : '';
      var miss = (m.missedCount > 0) ? '<span style="color:#e67e22;font-size:12px;">缺考 ' + m.missedCount + '</span>' : '';
      var on = (m.studentNo === opt.selectedNo);
      return '<div class="st-row" style="display:flex;align-items:center;border-bottom:1px solid #f4f4f4;' + (on ? 'background:#f0f7ff;' : 'background:#fff;') + '">'
        + '<button type="button" class="st-pick" data-no="' + esc(m.studentNo) + '" '
        +   'style="flex:1;display:flex;align-items:center;gap:12px;text-align:left;padding:10px 14px;border:none;background:transparent;cursor:pointer;font-size:14px;">'
        +   '<span style="font-weight:600;min-width:64px;">' + nm + '</span>' + stat + miss
        +   '<span style="margin-left:auto;color:#bbb;font-size:12px;">看画像 ›</span></button>'
        + '<button type="button" class="st-del" data-no="' + esc(m.studentNo) + '" title="从本班移除该生" '
        +   'style="flex:0 0 auto;margin:0 10px;padding:4px 10px;border-radius:8px;border:1px solid #f3c0c0;background:#fff;color:#c0392b;cursor:pointer;font-size:12px;">删</button>'
        + '</div>';
    }).join('');
    var title = opt.title ? '<div style="font-weight:600;font-size:13px;color:#666;margin:8px 2px 6px;">' + esc(opt.title) + '</div>' : '';
    return title + '<div style="background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden;margin-bottom:12px;">' + rows + '</div>';
  }

  // studentAddBoxHtml：手动「添加学生」折叠框（默认收起，不占主视图）。一行一个：「学号 姓名」或只写姓名。
  function studentAddBoxHtml() {
    return '<details style="margin:6px 0 4px;">'
      + '<summary style="cursor:pointer;font-size:13px;color:#0071e3;padding:6px 0;list-style:none;">＋ 添加学生（手动 / 插班，一行一个）</summary>'
      + '<div style="margin-top:6px;background:#fff;border:1px solid #eee;border-radius:12px;padding:12px 14px;">'
      +   '<textarea id="stAddInput" rows="4" placeholder="每行一个学生，例如：&#10;20230531041 王五&#10;李雷&#10;（写「学号 姓名」最好，方便以后对上成绩；只写姓名也行，系统会自动编号）" '
      +     'style="width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #e5e5e5;border-radius:10px;font-size:13px;line-height:1.6;resize:vertical;outline:none;font-family:inherit;"></textarea>'
      +   '<div style="margin-top:8px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">'
      +     '<button type="button" id="stAddBtn" style="padding:7px 16px;border-radius:999px;border:1px solid #0071e3;background:#0071e3;color:#fff;cursor:pointer;font-size:13px;">添加进本班</button>'
      +     '<span id="stAddMsg" style="color:#888;font-size:12px;"></span>'
      +   '</div>'
      + '</div></details>';
  }

  // studentProfileHtml：单生个人画像（可视化）。vm 来自 buildStudentProfileVM。
  function studentProfileHtml(vm, name) {
    vm = vm || {};
    name = esc(name || vm.studentNo || '');
    var missedBadge = (vm.missedCount > 0)
      ? ' <span style="font-weight:400;font-size:12px;color:#e67e22;background:#fff5ec;border-radius:10px;padding:1px 8px;margin-left:6px;">缺考 ' + vm.missedCount + '</span>' : '';
    var latest = vm.latestRate == null ? '—' : (vm.latestRate + '%');
    var latestColor = vm.latestRate == null ? '#333' : (vm.latestRate < 60 ? '#e74c3c' : (vm.latestRate < 85 ? '#f39c12' : '#27ae60'));
    var weak = (vm.weakCats && vm.weakCats.length)
      ? vm.weakCats.slice(0, 8).map(function(c){
          return '<div style="display:flex;align-items:center;gap:10px;padding:6px 0;">'
            + '<span style="width:84px;flex:0 0 auto;font-weight:600;font-size:13px;">' + esc(c.categoryName) + '</span>'
            + barHtml(c.rate)
            + '<span style="width:44px;flex:0 0 auto;text-align:right;font-size:13px;">' + (c.rate == null ? '—' : c.rate + '%') + '</span>'
            + '<span style="color:#999;font-size:12px;">错 ' + c.wrong + '</span></div>';
        }).join('')
      : '<div style="color:#aaa;font-size:13px;">暂无弱项数据</div>';
    var exams = (vm.exams && vm.exams.length)
      ? vm.exams.map(function(e){
          var ans = (e.rightCount || 0) + (e.wrongCount || 0);
          var rate = ans > 0 ? Math.round((e.rightCount || 0) / ans * 100) : null;
          var col = rate == null ? '#999' : (rate < 60 ? '#e74c3c' : (rate < 85 ? '#f39c12' : '#27ae60'));
          return '<span style="display:inline-block;margin:3px 6px 3px 0;padding:5px 10px;border:1px solid #eee;border-radius:8px;font-size:12px;">'
            + esc(e.examLabel) + ' <b style="color:' + col + ';">' + (rate == null ? '—' : rate + '%') + '</b> '
            + '<span style="color:#999;">对' + (e.rightCount || 0) + ' 错' + (e.wrongCount || 0) + (e.blankCount ? ' 缺' + e.blankCount : '') + '</span></span>';
        }).join('')
      : '<span style="color:#aaa;font-size:12px;">暂无成绩</span>';
    return '<div style="background:#fff;border:1px solid #eee;border-radius:14px;padding:18px 20px;box-shadow:0 2px 8px rgba(0,0,0,.05);">'
      + '<div style="font-size:16px;font-weight:600;">' + name + missedBadge + '</div>'
      + '<div style="color:#888;font-size:13px;margin:2px 0 14px;">最近正确率 <b style="color:' + latestColor + ';">' + latest + '</b> · 共 ' + (vm.examCount || 0) + ' 卷</div>'
      + '<div style="font-weight:600;font-size:13px;color:#555;margin-bottom:6px;">正确率趋势</div>' + rateTrendBlock(vm.rateSeries)
      + '<div style="font-weight:600;font-size:13px;color:#555;margin:16px 0 6px;">高频弱项考点（错最多在前）</div>' + weak
      + '<div style="font-weight:600;font-size:13px;color:#555;margin:16px 0 6px;">各卷明细</div><div>' + exams + '</div>'
      + '</div>';
  }

  window.GrammarErrorProfileRender = {
    uploadPanelHtml: uploadPanelHtml,
    profilePageHtml: profilePageHtml,
    boardListHtml: boardListHtml,
    importClassBarHtml: importClassBarHtml,
    classChipsHtml: classChipsHtml,
    workbenchTabsHtml: workbenchTabsHtml,
    studentTimelineHtml: studentTimelineHtml,
    examChipsHtml: examChipsHtml,
    catTrendHtml: catTrendHtml,
    catTrendDetailsHtml: catTrendDetailsHtml,
    studentSearchBoxHtml: studentSearchBoxHtml,
    studentMatchListHtml: studentMatchListHtml,
    studentAddBoxHtml: studentAddBoxHtml,
    studentProfileHtml: studentProfileHtml
  };
})();
