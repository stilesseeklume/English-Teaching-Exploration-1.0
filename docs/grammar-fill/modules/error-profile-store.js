// grammar-fill/modules/error-profile-store.js
//
// 纯逻辑：「我的卷子」画像 + 「我的班级」的数组增删/排序。不碰本机存储（I/O 在 app.js），不碰 DOM。

/* eslint-disable */
(function(){
  // ---- 画像条目（按 id 唯一；调用方把 id 设为 班id__卷id，所以同卷不同班互不覆盖）----
  function upsertEntry(list, entry) {
    list = (list || []).filter(function(e){ return e.id !== entry.id; });
    list.push(entry);
    return list;
  }
  function removeEntry(list, id) {
    return (list || []).filter(function(e){ return e.id !== id; });
  }
  function getEntry(list, id) {
    var hit = (list || []).filter(function(e){ return e.id === id; });
    return hit.length ? hit[0] : null;
  }
  // classId 给定则只取该班的条目；不给（null/undefined）取全部。
  function buildBoardModel(list, classId) {
    return (list || []).filter(function(e){ return classId == null || e.classId === classId; })
      .slice().sort(function(a, z){ return (z.savedAt || 0) - (a.savedAt || 0); })
      .map(function(e){
        var s = e.summary || {};
        return {
          id: e.id, classId: e.classId, examId: e.examId, examLabel: e.examLabel, savedAtText: e.savedAtText || '',
          studentCount: s.studentCount || 0, focusCount: s.focusCount || 0
        };
      });
  }

  // ---- 班级列表（cls = {id, name}，id 由调用方生成）----
  function addClass(classes, cls) {
    return (classes || []).concat([cls]);
  }
  function removeClass(classes, id) {
    return (classes || []).filter(function(c){ return c.id !== id; });
  }
  function renameClass(classes, id, name) {
    // 只改名，保留 students 等其它字段（早期版本会把 {id,name} 重建掉名单，已修）
    return (classes || []).map(function(c){ return c.id === id ? Object.assign({}, c, { name: name }) : c; });
  }
  // 往某班名单追加学号（去重、保留先来后到顺序）；只动学号清单，不碰姓名
  function addStudentsToClass(classes, id, studentNos) {
    return (classes || []).map(function(c){
      if (c.id !== id) return c;
      var order = (c.students || []).slice();
      var set = {}; order.forEach(function(n){ set[n] = 1; });
      (studentNos || []).forEach(function(n){ if (n && !set[n]) { set[n] = 1; order.push(n); } });
      return Object.assign({}, c, { students: order });
    });
  }
  // 从某班名单移除一个学号（其它字段不动）
  function removeStudentFromClass(classes, id, studentNo) {
    return (classes || []).map(function(c){
      if (c.id !== id) return c;
      return Object.assign({}, c, { students: (c.students || []).filter(function(n){ return n !== studentNo; }) });
    });
  }
  // 班级列表（云端成绩 ∪ 本地名单），人数口径唯一：工作台两视角共用，杜绝同班 0 vs 40。
  function buildClassList(allRows, localClasses) {
    var clsMap = {};
    (allRows || []).forEach(function(r){
      if (!r.class_id) return;
      if (!clsMap[r.class_id]) clsMap[r.class_id] = { id: r.class_id, name: r.class_name || r.class_id, stu: {} };
      clsMap[r.class_id].stu[r.student_no] = 1;
    });
    (localClasses || []).forEach(function(c){
      if (!clsMap[c.id]) clsMap[c.id] = { id: c.id, name: c.name, stu: {} };
      (c.students || []).forEach(function(n){ if (n) clsMap[c.id].stu[n] = 1; });
    });
    return Object.keys(clsMap).map(function(k){
      return { id: clsMap[k].id, name: clsMap[k].name, count: Object.keys(clsMap[k].stu).length };
    });
  }
  // 每个班 + 它名下有几张画像
  function buildClassListModel(classes, profiles) {
    profiles = profiles || [];
    return (classes || []).map(function(c){
      var count = profiles.filter(function(p){ return p.classId === c.id; }).length;
      return { id: c.id, name: c.name, count: count };
    });
  }

  window.GrammarErrorProfileStore = {
    upsertEntry: upsertEntry, removeEntry: removeEntry, getEntry: getEntry, buildBoardModel: buildBoardModel,
    addClass: addClass, removeClass: removeClass, renameClass: renameClass, buildClassListModel: buildClassListModel,
    addStudentsToClass: addStudentsToClass, removeStudentFromClass: removeStudentFromClass, buildClassList: buildClassList
  };
})();
