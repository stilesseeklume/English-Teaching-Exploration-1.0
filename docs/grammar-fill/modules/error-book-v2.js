/* eslint-disable */
/*
 * 语法填空 · 错题本 v2（成绩驱动 + 手动补）
 * 班级错题本 = 全班正确率<50% 自动收；个人错题本 = 某生做错的题；老师可手动加题。
 * 题面/答案/考点从 window.GRAMMAR_BANK 取；纯分数无题面则标注。手动项存本地(按 classId 分区)。
 */
(function(){
  var MKEY = 'grammar-error-book-manual';
  function mload(){ try { return JSON.parse(localStorage.getItem(MKEY)) || {}; } catch (e) { return {}; } }
  function msave(o){ try { localStorage.setItem(MKEY, JSON.stringify(o)); } catch (e) {} }
  function manualList(classId){ return (mload()[classId]) || []; }
  function manualAdd(classId, examId, no){
    if (!classId || !examId || !no) return;
    var o = mload(), a = o[classId] = o[classId] || [];
    if (!a.some(function(x){ return x.exam_id === examId && x.no === Number(no); })) a.push({ exam_id: examId, no: Number(no) });
    msave(o);
  }
  function manualRemove(classId, examId, no){
    var o = mload();
    if (o[classId]) { o[classId] = o[classId].filter(function(x){ return !(x.exam_id === examId && x.no === Number(no)); }); msave(o); }
  }

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function findBankExam(examId){ var b = window.GRAMMAR_BANK; if (!b || !b.exams) return null; for (var i = 0; i < b.exams.length; i++) { if (b.exams[i].exam_id === examId) return b.exams[i]; } return null; }
  function questionMeta(examId, no){
    var ex = findBankExam(examId);
    if (ex) { var q = null, qs = ex.questions || []; for (var i = 0; i < qs.length; i++) { if (qs[i].no === Number(no)) { q = qs[i]; break; } } return { found: !!q, answer: q && q.answer, category: q && (q.category_name || q.category), passage: ex.passage }; }
    return { found: false };
  }
  function uniqueExams(classRows){ var seen = {}, out = []; (classRows || []).forEach(function(r){ if (!seen[r.exam_id]) { seen[r.exam_id] = 1; out.push({ id: r.exam_id, label: r.exam_label || r.exam_id }); } }); return out; }
  function examLabelOf(classRows, examId){ var e = uniqueExams(classRows).filter(function(x){ return x.id === examId; })[0]; return e ? e.label : examId; }

  function classBook(classRows){
    var D = window.GrammarDashboard; if (!D) return [];
    var out = [];
    uniqueExams(classRows).forEach(function(ex){ D.errorBookClass(classRows, ex.id).forEach(function(q){ out.push({ exam_id: ex.id, examLabel: ex.label, no: q.no, classRate: q.classRate, meta: questionMeta(ex.id, q.no) }); }); });
    out.sort(function(a, b){ return a.classRate - b.classRate; });
    return out;
  }
  function studentBook(classRows, sNo){
    var D = window.GrammarDashboard; if (!D || !sNo) return [];
    var out = [];
    (classRows || []).filter(function(r){ return r.student_no === sNo; }).forEach(function(r){ D.errorBookStudent(r).forEach(function(q){ out.push({ exam_id: r.exam_id, examLabel: r.exam_label || r.exam_id, no: q.no, meta: questionMeta(r.exam_id, q.no) }); }); });
    return out;
  }

  function qRowHtml(item, opts){
    opts = opts || {};
    var m = item.meta || {};
    var cat = m.found && m.category ? ' · ' + esc(m.category) : '';
    var rate = item.classRate != null ? ' · 全班 <span style="color:#A32D2D;">' + Math.round(item.classRate * 100) + '%</span>' : '';
    var ans = m.found ? '答案 <b style="color:var(--text,#222);">' + esc(m.answer || '') + '</b>' : '<span style="color:var(--text-tertiary,#aaa);">该卷未导题面，看不了原题</span>';
    var passage = (m.found && m.passage) ? '<details style="margin-top:5px;"><summary style="font-size:12px;color:var(--accent,#0071e3);cursor:pointer;">看原文</summary><div style="font-size:13px;color:var(--text-secondary,#888);margin-top:5px;line-height:1.6;max-height:160px;overflow:auto;">' + esc(m.passage) + '</div></details>' : '';
    var del = opts.del ? '<button type="button" class="eb-del" data-exam="' + esc(item.exam_id) + '" data-no="' + item.no + '" style="border:none;background:none;color:var(--text-tertiary,#aaa);cursor:pointer;font-size:12px;">移除</button>' : '';
    return '<div style="border:1px solid var(--border,#eee);border-radius:8px;padding:9px 11px;margin-bottom:7px;">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;color:var(--text-secondary,#888);"><span><b style="color:var(--text,#222);">' + esc(item.examLabel) + '</b> · 第 ' + item.no + ' 题' + cat + rate + '</span>' + del + '</div>'
      + '<div style="font-size:13px;margin-top:3px;">' + ans + '</div>' + passage + '</div>';
  }

  // 错题本 tab body：班级错题本(自动+手动) + 手动加题 + 个人错题本(选学生)
  function bodyHtml(classRows, classId, names, selStudent){
    if (!classRows || !classRows.length) return '<div style="color:var(--text-secondary,#888);padding:16px 0;">这个班还没有成绩——导入成绩后，全班正确率&lt;50% 的题会自动进班级错题本。</div>';
    var auto = classBook(classRows);
    var manual = manualList(classId).map(function(x){ return { exam_id: x.exam_id, examLabel: examLabelOf(classRows, x.exam_id), no: x.no, classRate: null, meta: questionMeta(x.exam_id, x.no) }; });
    var autoHtml = auto.length ? auto.map(function(i){ return qRowHtml(i, {}); }).join('') : '<div style="color:var(--text-tertiary,#aaa);font-size:13px;">暂无全班正确率&lt;50% 的题。</div>';
    var manualHtml = manual.length ? '<div style="font-size:12px;color:var(--text-secondary,#888);margin:10px 0 6px;">老师手动加入：</div>' + manual.map(function(i){ return qRowHtml(i, { del: true }); }).join('') : '';
    var resolve = window.GrammarStudentTracking && window.GrammarStudentTracking.resolveStudentName;
    var studs = {}; classRows.forEach(function(r){ studs[r.student_no] = 1; });
    var sOpts = Object.keys(studs).sort().map(function(no){ var nm = resolve ? resolve(names || {}, no) : no; return '<option value="' + esc(no) + '"' + (no === selStudent ? ' selected' : '') + '>' + esc(nm) + '</option>'; }).join('');
    var stuBook = selStudent ? studentBook(classRows, selStudent) : [];
    var stuHtml = selStudent ? (stuBook.length ? stuBook.map(function(i){ return qRowHtml(i, {}); }).join('') : '<div style="color:var(--text-tertiary,#aaa);font-size:13px;">这名学生没有错题。</div>') : '<div style="color:var(--text-tertiary,#aaa);font-size:13px;">选一个学生看他的错题本。</div>';
    var examOpts = uniqueExams(classRows).map(function(e){ return '<option value="' + esc(e.id) + '">' + esc(e.label) + '</option>'; }).join('');
    var card = function(t, inner){ return '<div style="background:var(--bg,#fff);border:1px solid var(--border,#eee);border-radius:12px;padding:14px 16px;margin-bottom:14px;"><div style="font-size:14px;font-weight:600;margin-bottom:10px;color:var(--text,#222);">' + t + '</div>' + inner + '</div>'; };
    return ''
      + card('📕 班级错题本 <span style="font-weight:400;font-size:12px;color:var(--text-secondary,#888);">（全班正确率&lt;50% 自动收）</span>', autoHtml + manualHtml)
      + card('🖊 手动加题', '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:13px;"><select id="ebExam" style="padding:6px;border-radius:6px;border:1px solid var(--border,#ddd);background:var(--bg,#fff);color:var(--text,#222);">' + examOpts + '</select><span>第</span><input id="ebNo" type="number" min="1" placeholder="题号" style="width:72px;padding:6px;border-radius:6px;border:1px solid var(--border,#ddd);background:var(--bg,#fff);color:var(--text,#222);"><span>题</span><button type="button" id="ebAdd" style="padding:6px 14px;border-radius:999px;border:1px solid var(--accent,#0071e3);background:var(--accent,#0071e3);color:#fff;cursor:pointer;">加入班级错题本</button></div>')
      + card('👤 个人错题本', '<select id="ebStudent" style="padding:6px;border-radius:6px;margin-bottom:10px;border:1px solid var(--border,#ddd);background:var(--bg,#fff);color:var(--text,#222);"><option value="">— 选学生 —</option>' + sOpts + '</select><div>' + stuHtml + '</div>');
  }

  window.GrammarErrorBook = {
    classBook: classBook,
    studentBook: studentBook,
    questionMeta: questionMeta,
    bodyHtml: bodyHtml,
    manualAdd: manualAdd,
    manualRemove: manualRemove
  };
})();
