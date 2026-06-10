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
    return (classes || []).map(function(c){ return c.id === id ? { id: c.id, name: name } : c; });
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
    addClass: addClass, removeClass: removeClass, renameClass: renameClass, buildClassListModel: buildClassListModel
  };
})();
