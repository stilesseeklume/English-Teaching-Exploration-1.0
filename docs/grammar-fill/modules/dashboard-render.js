/* eslint-disable */
/*
 * 语法填空 · 班级看板渲染（消费 window.GrammarDashboard 数据层）
 * 头条：成长矩阵 + 处方；下接：指标卡 / 热力图 / 进步轨迹(Chart.js) / 分数分布(Chart.js) / 本次重点。
 * 暗色：文字/强调走 CSS 变量；热力图/矩阵格子用不透明三色带（明暗都可读）。
 */
(function(){
  function D(){ return window.GrammarDashboard; }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function pct(r){ return r == null ? '·' : Math.round(r * 100); }
  function band(rate){
    if (rate == null) return { bg:'rgba(128,128,128,.14)', fg:'var(--text-tertiary,#999)' };
    if (rate < 0.5)  return { bg:'#f0a8a3', fg:'#5c1a14' };   // 弱
    if (rate < 0.7)  return { bg:'#f5d08a', fg:'#5c3d06' };   // 中
    return { bg:'#b6d99a', fg:'#2e4a12' };                    // 强
  }
  function examLabelMap(classRows){
    var m = {};
    classRows.forEach(function(r){ if (!m[r.exam_id]) m[r.exam_id] = r.exam_label || r.exam_id; });
    return m;
  }
  function meansInOrder(classRows){
    var d = D(), order = [], means = {}, seen = {};
    classRows.forEach(function(r){ if (!seen[r.exam_id]) { seen[r.exam_id] = 1; order.push(r.exam_id); means[r.exam_id] = d.classExamMean(classRows, r.exam_id); } });
    return { order: order, means: means };
  }

  /* ---- 指标卡 ---- */
  function metricCardsHtml(classRows, examId){
    var d = D();
    var examRows = classRows.filter(function(r){ return r.exam_id === examId; });
    var n = examRows.length;
    var cur = d.classExamMean(classRows, examId);
    var pass = n ? examRows.filter(function(r){ return d.examScore(r) >= 9; }).length : 0;
    var exc  = n ? examRows.filter(function(r){ return d.examScore(r) >= 12; }).length : 0;
    var mo = meansInOrder(classRows);
    var vals = mo.order.map(function(e){ return mo.means[e]; }).filter(function(v){ return v != null; });
    var hi = vals.length ? Math.max.apply(null, vals) : null;
    var lo = vals.length ? Math.min.apply(null, vals) : null;
    function card(label, val, sub){
      return '<div style="background:var(--surface,#f7f7f7);border-radius:8px;padding:10px 12px;">'
        + '<div style="font-size:12px;color:var(--text-secondary,#888);">' + label + '</div>'
        + '<div style="font-size:22px;font-weight:600;color:var(--text,#111);line-height:1.25;">' + val + '</div>'
        + '<div style="font-size:11px;color:var(--text-tertiary,#aaa);">' + (sub || '&nbsp;') + '</div></div>';
    }
    return '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:6px 0 16px;">'
      + card('本次均分', (cur == null ? '—' : cur.toFixed(1)) + '<span style="font-size:12px;color:var(--text-tertiary,#aaa);font-weight:400;"> /15</span>', n + ' 人')
      + card('及格率 ≥9', n ? Math.round(pass / n * 100) + '%' : '—', pass + '/' + n + ' 人')
      + card('优秀率 ≥12', n ? Math.round(exc / n * 100) + '%' : '—', exc + '/' + n + ' 人')
      + card('历史区间', (lo == null ? '—' : lo.toFixed(1) + '–' + hi.toFixed(1)), vals.length + ' 卷')
      + '</div>';
  }

  /* ---- 成长矩阵（水平 × 趋势 3×3）---- */
  function growthMatrixHtml(matrix){
    var bucket = {}, insufficient = [];
    matrix.forEach(function(m){
      if (!m.level || m.trend.status !== 'ok') { insufficient.push(m.cat); return; }
      var k = m.level + '|' + m.trend.dir;
      (bucket[k] = bucket[k] || []).push(m.cat);
    });
    function cellBg(level, dir){
      var s = D().catState(level, dir);
      if (s.red) return { bg:'#f0a8a3', fg:'#5c1a14' };
      if ((level === '高' && dir === '降') || (level === '中' && dir === '平')) return { bg:'#f5d08a', fg:'#5c3d06' };
      return { bg:'#b6d99a', fg:'#2e4a12' };
    }
    var levels = ['高','中','低'], dirs = ['升','平','降'];
    var head = '<div></div>' + dirs.map(function(dr){
      return '<div style="font-size:12px;color:var(--text-secondary,#888);text-align:center;">' + ({'升':'↑ 在进步','平':'→ 持平','降':'↓ 在退步'})[dr] + '</div>';
    }).join('');
    var body = levels.map(function(lv){
      var lab = '<div style="font-size:12px;color:var(--text-tertiary,#aaa);display:flex;align-items:center;justify-content:center;">' + lv + '</div>';
      var cells = dirs.map(function(dr){
        var c = cellBg(lv, dr), cats = bucket[lv + '|' + dr] || [];
        var txt = cats.length ? cats.map(esc).join(' · ') : '<span style="color:var(--text-tertiary,#bbb);">—</span>';
        return '<div style="background:' + c.bg + ';color:' + c.fg + ';border-radius:6px;padding:10px 8px;font-size:13px;font-weight:500;min-height:20px;display:flex;align-items:center;justify-content:center;text-align:center;">' + txt + '</div>';
      }).join('');
      return lab + cells;
    }).join('');
    var grid = '<div style="display:grid;grid-template-columns:36px repeat(3,1fr);gap:6px;">' + head + body + '</div>';
    var note = insufficient.length ? '<div style="font-size:11px;color:var(--text-tertiary,#aaa);margin-top:6px;">数据不足(暂不判)：' + insufficient.map(esc).join('、') + '</div>' : '';
    var legend = '<div style="font-size:11px;color:var(--text-tertiary,#aaa);margin-top:6px;">红=最该攻坚 · 黄=盯着 · 绿=稳固(免讲)</div>';
    return '<div style="font-size:13px;color:var(--text-secondary,#888);margin-bottom:8px;">考点成长矩阵 · 累计（水平 × 趋势）</div>' + grid + note + legend;
  }

  /* ---- 处方 ---- */
  function prescriptionHtml(rx){
    if (!rx.length) return '<div style="font-size:13px;color:var(--text-secondary,#888);">暂无红区考点——这班整体在线，继续保持。</div>';
    var items = rx.map(function(m, i){
      var why = m.state.state + '，累计 ' + pct(m.rate) + '%';
      return '<div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:9px;">'
        + '<span style="background:#f0a8a3;color:#5c1a14;font-size:12px;font-weight:600;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' + (i + 1) + '</span>'
        + '<div style="font-size:13px;line-height:1.5;color:var(--text,#222);"><span style="font-weight:600;">' + esc(m.cat) + '</span> — ' + why
        + ' <button type="button" class="db-migrate" data-cat="' + esc(m.cat) + '" style="margin-left:4px;padding:1px 8px;border-radius:999px;border:1px solid var(--accent,#0071e3);background:transparent;color:var(--accent,#0071e3);cursor:pointer;font-size:12px;">一键出题 →</button></div></div>';
    }).join('');
    return '<div style="font-size:13px;font-weight:600;margin-bottom:10px;color:var(--text,#222);">📋 班级教学处方 · 攻坚顺序</div>' + items;
  }

  /* ---- 热力图 ---- */
  function heatmapHtml(hm, labelMap){
    if (!hm.exams.length) return '<div style="font-size:13px;color:var(--text-secondary,#888);">还没有成绩——导入这个班的成绩后这里出热力图。</div>';
    var cols = hm.exams.map(function(e){ return '<div style="font-size:11px;color:var(--text-tertiary,#aaa);text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc((labelMap[e] || e)) + '</div>'; }).join('');
    var groups = [{ g:'有提示 · 词形变化', cats:['时态','谓语其他','非谓语','词性转换','名词数词'] }, { g:'无提示 · 功能词', cats:['冠词','介词','代词','连词逻辑','从句'] }];
    var rowsHtml = groups.map(function(grp){
      var ghead = '<div style="grid-column:1/-1;font-size:11px;color:var(--text-secondary,#888);padding:7px 0 1px;">' + grp.g + '</div>';
      var rs = grp.cats.map(function(cat){
        var lab = '<div style="font-size:12px;color:var(--text-secondary,#888);display:flex;align-items:center;">' + cat + '</div>';
        var cells = (hm.cells[cat] || []).map(function(rate){
          var c = band(rate);
          return '<div style="background:' + c.bg + ';color:' + c.fg + ';border-radius:4px;padding:6px 0;text-align:center;font-size:12px;">' + pct(rate) + '</div>';
        }).join('');
        return lab + cells;
      }).join('');
      return ghead + rs;
    }).join('');
    var ncol = hm.exams.length;
    return '<div style="font-size:13px;color:var(--text-secondary,#888);margin-bottom:8px;">考点热力图 · 每卷得分率（红<50 / 黄50-69 / 绿≥70 / 灰=未考）</div>'
      + '<div style="overflow-x:auto;"><div style="display:grid;grid-template-columns:70px repeat(' + ncol + ',minmax(40px,1fr));gap:3px;min-width:' + (70 + ncol * 43) + 'px;">'
      + '<div></div>' + cols + rowsHtml + '</div></div>';
  }

  /* ---- 本次重点 ---- */
  function focusHtml(hm, examId, labelMap){
    var idx = hm.exams.indexOf(examId);
    if (idx < 0) return '';
    var cur = [];
    Object.keys(hm.cells).forEach(function(cat){ var r = hm.cells[cat][idx]; if (r != null) cur.push({ cat: cat, rate: r, prev: idx > 0 ? hm.cells[cat][idx - 1] : null }); });
    cur.sort(function(a, b){ return a.rate - b.rate; });
    var low3 = cur.slice(0, 3);
    if (!low3.length) return '';
    var chips = low3.map(function(x){ var c = band(x.rate); return '<span style="background:' + c.bg + ';color:' + c.fg + ';font-size:12px;padding:4px 11px;border-radius:8px;">' + esc(x.cat) + ' ' + pct(x.rate) + '%</span>'; }).join(' ');
    var moves = cur.filter(function(x){ return x.prev != null; }).map(function(x){ return { cat: x.cat, d: Math.round((x.rate - x.prev) * 100) }; });
    var up = moves.filter(function(x){ return x.d >= 5; }).sort(function(a, b){ return b.d - a.d; })[0];
    var dn = moves.filter(function(x){ return x.d <= -5; }).sort(function(a, b){ return a.d - b.d; })[0];
    var cmp = (up || dn) ? '<div style="font-size:12px;color:var(--text-secondary,#888);margin-top:9px;">对比上次：'
      + (up ? '<span style="color:#3B6D11;">↑ 改善 ' + esc(up.cat) + ' +' + up.d + '</span>' : '')
      + (up && dn ? ' · ' : '')
      + (dn ? '<span style="color:#A32D2D;">↓ 退步 ' + esc(dn.cat) + ' ' + dn.d + '</span>' : '') + '</div>' : '';
    return '<div style="background:var(--surface,#f7f7f7);border-radius:10px;padding:12px 14px;margin-top:4px;">'
      + '<div style="font-size:13px;font-weight:600;margin-bottom:9px;color:var(--text,#222);">🎯 本次重点（' + esc(labelMap[examId] || examId) + ' 最低 3 个）</div>'
      + '<div style="display:flex;gap:8px;flex-wrap:wrap;">' + chips + '</div>' + cmp + '</div>';
  }

  /* ---- 闭环回看：讲过的考点起没起色 ---- */
  function loopHtml(classRows, classId){
    if (!classId || !window.GrammarDashboardLoop) return '';
    var marks = window.GrammarDashboardLoop.list(classId);
    if (!marks.length) return '';
    var gm = {}; D().growthMatrix(classRows).forEach(function(m){ gm[m.cat] = m.rate; });
    var items = marks.slice().sort(function(a, b){ return (b.ts || 0) - (a.ts || 0); }).map(function(mk){
      var nowR = gm[mk.cat], was = mk.rate, delta = (nowR != null && was != null) ? Math.round((nowR - was) * 100) : null;
      var verdict = delta == null ? '<span style="color:var(--text-tertiary,#aaa);">待下次考</span>'
        : (delta >= 5 ? '<span style="color:#3B6D11;">✓ 讲到位了</span>' : (delta <= -5 ? '<span style="color:#A32D2D;">↓ 反而退了，换打法</span>' : '<span style="color:var(--text-secondary,#888);">→ 没怎么动</span>'));
      return '<div style="display:flex;align-items:center;gap:8px;font-size:13px;margin-bottom:5px;"><span style="width:72px;color:var(--text,#222);">' + esc(mk.cat) + '</span><span style="width:150px;color:var(--text-secondary,#888);">' + pct(was) + '% → ' + pct(nowR) + '%' + (delta != null ? ' (' + (delta >= 0 ? '+' : '') + delta + ')' : '') + '</span>' + verdict + '</div>';
    }).join('');
    return '<div style="background:var(--bg,#fff);border:1px solid var(--border,#eee);border-radius:12px;padding:14px 16px;margin-bottom:14px;"><div style="font-size:13px;font-weight:600;margin-bottom:9px;color:var(--text,#222);">📌 讲过的考点 · 效果回看</div>' + items + '</div>';
  }

  /* ---- 组合 ---- */
  function classBoardHtml(classRows, examId, classId){
    if (!classRows.length) return '<div style="color:var(--text-secondary,#888);padding:16px 0;">这个班还没有成绩。去「导入」页传这个班的成绩后，这里出班级看板。</div>';
    var d = D();
    var hm = d.heatmap(classRows);
    var matrix = d.growthMatrix(classRows);
    var rx = d.prescription(classRows);
    var labelMap = examLabelMap(classRows);
    var card = function(inner){ return '<div style="background:var(--bg,#fff);border:1px solid var(--border,#eee);border-radius:12px;padding:14px 16px;margin-bottom:14px;">' + inner + '</div>'; };
    return ''
      + loopHtml(classRows, classId)
      + card(growthMatrixHtml(matrix) + '<div style="height:14px;"></div>' + prescriptionHtml(rx))
      + metricCardsHtml(classRows, examId)
      + card(heatmapHtml(hm, labelMap))
      + card('<div style="font-size:13px;color:var(--text-secondary,#888);margin-bottom:6px;">班级均分 · 进步轨迹（虚线＝趋势）</div><div style="position:relative;height:200px;"><canvas id="dbTrend"></canvas></div>')
      + card('<div style="font-size:13px;color:var(--text-secondary,#888);margin-bottom:6px;">本次分数分布</div><div style="position:relative;height:170px;"><canvas id="dbDist"></canvas></div>')
      + focusHtml(hm, examId, labelMap);
  }

  /* ---- Chart.js（进步轨迹 + 分数分布）；暗色从 CSS 变量读 ---- */
  function cssVar(name, fb){ var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim(); return v || fb; }
  function initClassBoardCharts(classRows, examId){
    if (!window.Chart || !classRows.length) return;
    var d = D();
    var text = cssVar('--text-secondary', '#888'), accent = cssVar('--accent', '#0071e3'), grid = 'rgba(128,128,128,.15)';
    var mo = meansInOrder(classRows);
    var labelMap = examLabelMap(classRows);
    var labels = mo.order.map(function(e){ return labelMap[e] || e; });
    var data = mo.order.map(function(e){ return mo.means[e]; });
    // 趋势线（最小二乘）
    var ys = data.filter(function(v){ return v != null; }), trend = null;
    if (ys.length >= 2) {
      var n = data.length, sx = 0, sy = 0, sxx = 0, sxy = 0, k = 0;
      for (var i = 0; i < n; i++) { if (data[i] == null) continue; sx += i; sy += data[i]; sxx += i * i; sxy += i * data[i]; k++; }
      var dd = k * sxx - sx * sx; var slope = dd ? (k * sxy - sx * sy) / dd : 0; var b = (sy - slope * sx) / k;
      trend = data.map(function(_, i){ return +(slope * i + b).toFixed(2); });
    }
    var tEl = document.getElementById('dbTrend');
    if (tEl) new window.Chart(tEl.getContext('2d'), {
      type: 'line',
      data: { labels: labels, datasets: [
        { data: data, borderColor: accent, backgroundColor: accent, tension: .3, pointRadius: 2, borderWidth: 2, spanGaps: true },
        trend ? { data: trend, borderColor: text, borderDash: [5, 4], pointRadius: 0, borderWidth: 1.5 } : { data: [] }
      ] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
        scales: { y: { min: 0, max: 15, ticks: { stepSize: 3, color: text }, grid: { color: grid } }, x: { ticks: { color: text, autoSkip: true, maxTicksLimit: 10 }, grid: { display: false } } } }
    });
    // 分数分布（当前卷）
    var examRows = classRows.filter(function(r){ return r.exam_id === examId; });
    var bins = [0, 0, 0, 0, 0];   // 0-3 3-6 6-9 9-12 12-15
    examRows.forEach(function(r){ var s = d.examScore(r); var i = s < 3 ? 0 : s < 6 ? 1 : s < 9 ? 2 : s < 12 ? 3 : 4; bins[i]++; });
    var dEl = document.getElementById('dbDist');
    if (dEl) new window.Chart(dEl.getContext('2d'), {
      type: 'bar',
      data: { labels: ['0-3', '3-6', '6-9', '9-12', '12-15'], datasets: [{ data: bins, backgroundColor: accent, borderRadius: 4 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0, color: text }, grid: { color: grid } }, x: { ticks: { color: text }, grid: { display: false } } } }
    });
  }

  /* ---- 学生看板（老师视角）---- */
  function studentRowsOf(classRows, sNo){ return classRows.filter(function(r){ return r.student_no === sNo; }); }
  function examOrder(classRows){ var seen = {}, order = []; classRows.forEach(function(r){ if (!seen[r.exam_id]) { seen[r.exam_id] = 1; order.push(r.exam_id); } }); return order; }
  function diagTagHtml(tags){
    var pal = { green:{bg:'#eaf3de',fg:'#27500a'}, red:{bg:'#fcebeb',fg:'#791f1f'}, blue:{bg:'#e6f1fb',fg:'#0c447c'}, amber:{bg:'#faeeda',fg:'#633806'} };
    return tags.map(function(x){ var c = pal[x.c] || pal.blue; return '<span style="background:' + c.bg + ';color:' + c.fg + ';font-size:12px;padding:5px 11px;border-radius:8px;">' + esc(x.t) + '</span>'; }).join(' ');
  }
  function studentBoardHtml(classRows, sNo, name){
    var d = D(), sRows = studentRowsOf(classRows, sNo);
    if (!sRows.length) return '<div style="color:var(--text-secondary,#888);padding:12px 0;">这名学生暂无成绩。</div>';
    var sMatrix = d.growthMatrix(sRows), cMatrix = d.growthMatrix(classRows), rx = d.prescription(sRows);
    var order = examOrder(classRows), lastEx = order.length ? order[order.length - 1] : null;
    var sLast = sRows.filter(function(r){ return r.exam_id === lastEx; })[0];
    var sScore = sLast ? d.examScore(sLast) : null, cMean = d.classExamMean(classRows, lastEx);
    var examRows = classRows.filter(function(r){ return r.exam_id === lastEx; }).map(function(r){ return { no: r.student_no, sc: d.examScore(r) }; }).sort(function(a, b){ return b.sc - a.sc; });
    var rank = 0; for (var i = 0; i < examRows.length; i++) { if (examRows[i].no === sNo) { rank = i + 1; break; } }
    var card = function(inner){ return '<div style="background:var(--bg,#fff);border:1px solid var(--border,#eee);border-radius:12px;padding:14px 16px;margin-bottom:14px;">' + inner + '</div>'; };
    // 诊断标签
    var diag = [];
    var strong = sMatrix.filter(function(m){ return m.rate != null && m.rate >= 0.8; }).sort(function(a, b){ return b.rate - a.rate; })[0];
    if (strong) diag.push({ t: strong.cat + ' 强项 ' + pct(strong.rate) + '%', c: 'green' });
    sMatrix.filter(function(m){ return m.rate != null && m.rate < 0.5; }).sort(function(a, b){ return a.rate - b.rate; }).slice(0, 2).forEach(function(m){ diag.push({ t: m.cat + ' 反复失分 ' + pct(m.rate) + '%', c: 'red' }); });
    var sBy = {}; sRows.forEach(function(r){ sBy[r.exam_id] = d.examScore(r); });
    var seq = order.map(function(e){ return sBy[e]; }).filter(function(v){ return v != null; });
    if (seq.length >= 3) { var delta = seq[seq.length - 1] - seq[0]; if (delta >= 1.5) diag.unshift({ t: '整体稳步上升', c: 'blue' }); else if (delta <= -1.5) diag.unshift({ t: '近期下滑，需关注', c: 'amber' }); }
    // 对比
    var cBy = {}; cMatrix.forEach(function(m){ cBy[m.cat] = m.rate; });
    var cmp = sMatrix.filter(function(m){ return m.rate != null; }).map(function(m){
      var cv = cBy[m.cat], up = cv != null && m.rate >= cv;
      return '<div style="display:flex;align-items:center;gap:10px;font-size:13px;margin-bottom:5px;"><span style="width:72px;color:var(--text-secondary,#888);">' + esc(m.cat) + '</span><span style="width:120px;">' + pct(m.rate) + '% <span style="color:var(--text-tertiary,#aaa);">vs ' + (cv == null ? '—' : pct(cv) + '%') + '</span></span><span style="color:' + (up ? '#3B6D11' : '#A32D2D') + ';">' + (up ? '✓ 高于均值' : '✗ 低于均值') + '</span></div>';
    }).join('');
    var avatar = esc(String(name || sNo).slice(0, 2));
    return ''
      + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;"><div style="width:40px;height:40px;border-radius:50%;background:var(--surface,#eef);display:flex;align-items:center;justify-content:center;font-weight:600;color:var(--accent,#0071e3);">' + avatar + '</div><div><div style="font-weight:600;color:var(--text,#111);">' + esc(name || sNo) + '</div><div style="font-size:12px;color:var(--text-secondary,#888);">本次 ' + (sScore == null ? '—' : sScore.toFixed(1)) + ' /15' + (rank ? ' · 班级第 ' + rank : '') + (cMean != null && sScore != null ? ' · ' + (sScore >= cMean ? '高于' : '低于') + '均分 ' + Math.abs(sScore - cMean).toFixed(1) : '') + '</div></div></div>'
      + card(growthMatrixHtml(sMatrix) + (rx.length ? '<div style="height:14px;"></div>' + prescriptionHtml(rx) : ''))
      + (diag.length ? card('<div style="font-size:13px;color:var(--text-secondary,#888);margin-bottom:8px;">🩺 自动诊断</div><div style="display:flex;gap:8px;flex-wrap:wrap;">' + diagTagHtml(diag) + '</div>') : '')
      + card('<div style="font-size:13px;color:var(--text-secondary,#888);margin-bottom:6px;">个人成绩 vs 班级均分（虚线）</div><div style="position:relative;height:190px;"><canvas id="sbTrend"></canvas></div>')
      + card('<div style="font-size:13px;color:var(--text-secondary,#888);margin-bottom:6px;">考点雷达 · 个人(实) vs 班级均值(虚)</div><div style="position:relative;height:280px;"><canvas id="sbRadar"></canvas></div>')
      + card('<div style="font-size:13px;color:var(--text-secondary,#888);margin-bottom:8px;">与班级逐考点对比</div>' + (cmp || '<span style="color:var(--text-tertiary,#aaa);font-size:13px;">暂无数据</span>'));
  }
  function initStudentBoardCharts(classRows, sNo){
    if (!window.Chart || !classRows.length) return;
    var d = D(), text = cssVar('--text-secondary', '#888'), accent = cssVar('--accent', '#0071e3'), grid = 'rgba(128,128,128,.15)';
    var labelMap = examLabelMap(classRows), mo = meansInOrder(classRows);
    var labels = mo.order.map(function(e){ return labelMap[e] || e; });
    var classMean = mo.order.map(function(e){ return mo.means[e]; });
    var sBy = {}; studentRowsOf(classRows, sNo).forEach(function(r){ sBy[r.exam_id] = d.examScore(r); });
    var sScores = mo.order.map(function(e){ return sBy[e] == null ? null : sBy[e]; });
    var tEl = document.getElementById('sbTrend');
    if (tEl) new window.Chart(tEl.getContext('2d'), { type: 'line',
      data: { labels: labels, datasets: [
        { data: sScores, borderColor: accent, backgroundColor: accent, tension: .3, pointRadius: 2, borderWidth: 2, spanGaps: true },
        { data: classMean, borderColor: text, borderDash: [5, 4], pointRadius: 0, borderWidth: 1.5 }
      ] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 15, ticks: { stepSize: 3, color: text }, grid: { color: grid } }, x: { ticks: { color: text, autoSkip: true, maxTicksLimit: 10 }, grid: { display: false } } } }
    });
    var cats = d.BOARD_CATS.map(function(c){ return c.name; });
    var sM = {}; d.growthMatrix(studentRowsOf(classRows, sNo)).forEach(function(m){ sM[m.cat] = m.rate; });
    var cM = {}; d.growthMatrix(classRows).forEach(function(m){ cM[m.cat] = m.rate; });
    var rEl = document.getElementById('sbRadar');
    if (rEl) new window.Chart(rEl.getContext('2d'), { type: 'radar',
      data: { labels: cats, datasets: [
        { data: cats.map(function(c){ return sM[c] == null ? 0 : Math.round(sM[c] * 100); }), borderColor: accent, backgroundColor: 'rgba(0,113,227,.15)', borderWidth: 2, pointRadius: 2 },
        { data: cats.map(function(c){ return cM[c] == null ? 0 : Math.round(cM[c] * 100); }), borderColor: text, borderDash: [5, 4], backgroundColor: 'transparent', borderWidth: 1.5, pointRadius: 0 }
      ] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { r: { min: 0, max: 100, ticks: { stepSize: 25, color: text, backdropColor: 'transparent' }, grid: { color: grid }, angleLines: { color: grid }, pointLabels: { color: text, font: { size: 11 } } } } }
    });
  }

  window.GrammarDashboardRender = {
    classBoardHtml: classBoardHtml,
    initClassBoardCharts: initClassBoardCharts,
    studentBoardHtml: studentBoardHtml,
    initStudentBoardCharts: initStudentBoardCharts
  };
})();
