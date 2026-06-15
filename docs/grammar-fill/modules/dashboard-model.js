/* eslint-disable */
/*
 * 语法填空看板 · 数据层（纯函数，零依赖）
 * 把 exam_results 行算成：10 考点得分率、热力图、成长矩阵、处方、错题本选题。
 * 设计：docs/planning/2026-06-15-grammar-dashboard-design.md（§4 考点轴、§9 算法）
 */
(function(){
  var BOARD_CATS = [
    { name: '时态',     group: '有提示' },
    { name: '谓语其他', group: '有提示' },
    { name: '非谓语',   group: '有提示' },
    { name: '词性转换', group: '有提示' },
    { name: '名词数词', group: '有提示' },
    { name: '冠词',     group: '无提示' },
    { name: '介词',     group: '无提示' },
    { name: '代词',     group: '无提示' },
    { name: '连词逻辑', group: '无提示' },
    { name: '从句',     group: '无提示' }
  ];
  // 13 粗 category → 看板考点（modal 并谓语其他，special 归其他）
  var CAT_TO_BOARD = {
    predicate: '谓语其他', nonpredicate: '非谓语', word: '词性转换',
    number: '名词数词', article: '冠词', preposition: '介词',
    pronoun: '代词', logic: '连词逻辑',
    attrib: '从句', nounclause: '从句', advclause: '从句',
    modal: '谓语其他', special: '其他'
  };
  function boardCatOf(key){
    if (!key) return '其他';
    if (key === 'pred-tense') return '时态';            // 仅时态从谓语里拆出
    var tags = (window.GRAMMAR_FINE_TAGS && window.GRAMMAR_FINE_TAGS.tags_by_id) || {};
    var cat = (tags[key] && tags[key].category) || key; // key 可能本身就是粗 category
    return CAT_TO_BOARD[cat] || '其他';
  }

  function examScore(row){
    var r = row && row.result && row.result.right;
    return (r ? r.length : 0) * 1.5;
  }
  function classExamMean(rows, examId){
    var xs = (rows || []).filter(function(r){ return r.exam_id === examId; }).map(examScore);
    if (!xs.length) return null;
    return xs.reduce(function(a,b){ return a + b; }, 0) / xs.length;
  }

  function rateOf(rw){ var t = rw.right + rw.wrong; return t ? rw.right / t : null; }
  function boardCatRates(row){              // 单生单卷：boardCat -> {right,wrong}
    var byCat = (row.result && row.result.byCat) || {};
    var agg = {};
    Object.keys(byCat).forEach(function(k){
      var bc = boardCatOf(k);
      if (!agg[bc]) agg[bc] = { right: 0, wrong: 0 };
      agg[bc].right += byCat[k].right || 0;
      agg[bc].wrong += byCat[k].wrong || 0;
    });
    return agg;
  }
  function examIdsInOrder(rows){            // 去重保序（rows 已按 exam_date 升序）
    var seen = {}, out = [];
    (rows || []).forEach(function(r){ if (!seen[r.exam_id]) { seen[r.exam_id] = 1; out.push(r.exam_id); } });
    return out;
  }
  function aggClassByExamCat(rows){         // {examId: {boardCat: {right,wrong}}}
    var out = {};
    (rows || []).forEach(function(row){
      var ex = row.exam_id;
      if (!out[ex]) out[ex] = {};
      var rates = boardCatRates(row);
      Object.keys(rates).forEach(function(bc){
        if (!out[ex][bc]) out[ex][bc] = { right: 0, wrong: 0 };
        out[ex][bc].right += rates[bc].right;
        out[ex][bc].wrong += rates[bc].wrong;
      });
    });
    return out;
  }
  function heatmap(rows){
    var exams = examIdsInOrder(rows);
    var agg = aggClassByExamCat(rows);
    var cells = {};
    BOARD_CATS.forEach(function(c){
      cells[c.name] = exams.map(function(ex){
        var rw = agg[ex] && agg[ex][c.name];
        return rw ? rateOf(rw) : null;
      });
    });
    return { exams: exams, cells: cells };
  }

  function catLevel(rate){
    if (rate == null) return null;
    return rate >= 0.70 ? '高' : (rate >= 0.50 ? '中' : '低');
  }
  function linregSlope(ys){                 // x = 0..n-1
    var n = ys.length; if (n < 2) return 0;
    var sx=0, sy=0, sxx=0, sxy=0;
    for (var i=0;i<n;i++){ sx+=i; sy+=ys[i]; sxx+=i*i; sxy+=i*ys[i]; }
    var d = n*sxx - sx*sx; if (!d) return 0;
    return (n*sxy - sx*sy) / d;
  }
  function catTrend(seriesRates){
    var ys = (seriesRates || []).filter(function(v){ return v != null; });
    if (ys.length < 3) return { status: 'insufficient', n: ys.length };
    var slope = linregSlope(ys);
    var dir = slope > 0.02 ? '升' : (slope < -0.02 ? '降' : '平');
    return { status: 'ok', slope: slope, dir: dir, n: ys.length };
  }

  function catState(level, dir){
    if (level === '高') return dir === '降' ? { state:'高位回落', red:false } : { state:'稳固', red:false };
    if (level === '中') {
      if (dir === '降') return { state:'滑坡', red:true, priority:3 };
      if (dir === '升') return { state:'良性', red:false };
      return { state:'待突破', red:false };
    }
    if (dir === '升') return { state:'在好转', red:false };
    if (dir === '降') return { state:'恶化', red:true, priority:1 };
    return { state:'顽固盲点', red:true, priority:2 };
  }
  function cumulativeRate(rows, catName){   // 该考点全历次累计 right/wrong → rate
    var agg = aggClassByExamCat(rows);
    var rw = { right:0, wrong:0 };
    Object.keys(agg).forEach(function(ex){
      if (agg[ex][catName]) { rw.right += agg[ex][catName].right; rw.wrong += agg[ex][catName].wrong; }
    });
    return rateOf(rw);
  }
  function growthMatrix(rows){
    var hm = heatmap(rows);
    return BOARD_CATS.map(function(c){
      var rate = cumulativeRate(rows, c.name);
      var level = catLevel(rate);
      var trend = catTrend(hm.cells[c.name]);
      var state = (level && trend.status === 'ok') ? catState(level, trend.dir) : { state:'数据不足', red:false };
      return { cat: c.name, group: c.group, rate: rate, level: level, trend: trend, state: state };
    });
  }
  function prescription(rows){
    return growthMatrix(rows)
      .filter(function(x){ return x.state.red; })
      .sort(function(a,b){
        if (a.state.priority !== b.state.priority) return a.state.priority - b.state.priority;
        return (a.rate == null ? 1 : a.rate) - (b.rate == null ? 1 : b.rate);
      });
  }

  function classQuestionRates(rows, examId){    // {no: {right,wrong,rate}}
    var m = {};
    (rows || []).filter(function(r){ return r.exam_id === examId; }).forEach(function(r){
      (r.result.right || []).forEach(function(no){ (m[no] = m[no] || {right:0,wrong:0}).right++; });
      (r.result.wrong || []).forEach(function(no){ (m[no] = m[no] || {right:0,wrong:0}).wrong++; });
    });
    Object.keys(m).forEach(function(no){ m[no].rate = rateOf(m[no]); });
    return m;
  }
  function errorBookClass(rows, examId){        // 班级正确率 <50% 的题
    var m = classQuestionRates(rows, examId);
    return Object.keys(m)
      .filter(function(no){ return m[no].rate != null && m[no].rate < 0.50; })
      .map(function(no){ return { exam_id: examId, no: Number(no), classRate: m[no].rate }; });
  }
  function errorBookStudent(row){               // 某生该卷做错的题
    return (row.result.wrong || []).map(function(no){
      return { exam_id: row.exam_id, student_no: row.student_no, no: no };
    });
  }

  window.GrammarDashboard = {
    BOARD_CATS: BOARD_CATS,
    boardCatOf: boardCatOf,
    examScore: examScore,
    classExamMean: classExamMean,
    heatmap: heatmap,
    catLevel: catLevel,
    catTrend: catTrend,
    catState: catState,
    growthMatrix: growthMatrix,
    prescription: prescription,
    errorBookClass: errorBookClass,
    errorBookStudent: errorBookStudent
  };
})();
