/* eslint-disable */
/*
 * 语法填空看板 · 闭环追踪（本地）
 * 老师对某弱考点「一键出题/重点讲」→ 记一笔(当时累计得分率)；下次考完看该考点起没起色。
 * 按 classId 分区存（classId 随机、跨账号不撞）；本地 localStorage，低敏感不上云。
 */
(function(){
  var KEY = 'grammar-dashboard-loop';
  function load(){ try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(o){ try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function now(){ return (new Date()).getTime(); }
  function record(classId, cat, examId, rate){
    if (!classId || !cat) return;
    var o = load(), arr = o[classId] = o[classId] || [], hit = null;
    for (var i = 0; i < arr.length; i++) { if (arr[i].cat === cat) { hit = arr[i]; break; } }
    if (hit) { hit.examId = examId; hit.rate = rate; hit.ts = now(); }   // 重复标记 = 刷新基线
    else arr.push({ cat: cat, examId: examId, rate: rate, ts: now() });
    save(o);
  }
  function list(classId){ return (load()[classId]) || []; }
  function clear(classId, cat){
    var o = load();
    if (o[classId]) { o[classId] = o[classId].filter(function(x){ return x.cat !== cat; }); save(o); }
  }
  window.GrammarDashboardLoop = { record: record, list: list, clear: clear };
})();
