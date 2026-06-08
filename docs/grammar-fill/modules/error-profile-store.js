// grammar-fill/modules/error-profile-store.js
//
// 纯逻辑：「我的卷子」画像存储的数组增删/排序。无 localStorage（I/O 在 app.js），无 DOM。

/* eslint-disable */
(function(){
  function upsertEntry(list, entry) {
    list = (list || []).filter(function(e){ return e.examId !== entry.examId; });
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
  function buildBoardModel(list) {
    return (list || []).slice().sort(function(a, z){ return (z.savedAt || 0) - (a.savedAt || 0); })
      .map(function(e){
        var s = e.summary || {};
        return {
          id: e.id, examId: e.examId, examLabel: e.examLabel, savedAtText: e.savedAtText || '',
          studentCount: s.studentCount || 0, focusCount: s.focusCount || 0
        };
      });
  }
  window.GrammarErrorProfileStore = {
    upsertEntry: upsertEntry, removeEntry: removeEntry, getEntry: getEntry, buildBoardModel: buildBoardModel
  };
})();
