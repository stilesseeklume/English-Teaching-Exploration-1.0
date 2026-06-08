// grammar-fill/modules/error-profile-controller.js
//
// 控制器：错题画像页。从 app.js 注入 deps。
// 流程：选套卷 + 传成绩 .xls → SheetJS 解析行 → 引擎 extract+build → view-model → render → 塞 DOM。
// deps:
//   getExamList()                 → [{examId, label}]   题库里有语法填空的套卷
//   getExamGrammarQuestions(id)   → [{no, category, fine_category, answer}]  该卷语填题
//   catNames                      → {category: 中文名}
//   （SheetJS 为 window.XLSX 全局；引擎/视图/渲染为 window.Grammar* 全局）

/* eslint-disable */
(function(){
  var _d = null;

  function setMsg(text) {
    var el = document.getElementById('errorProfileMsg');
    if (el) el.textContent = text || '';
  }

  function showProfileHtml(html) {
    var host = document.getElementById('errorProfileResult');
    if (host) host.innerHTML = html;
  }

  function onFile(file) {
    setMsg('');
    var examId = (document.getElementById('errorProfileExam') || {}).value || '';
    if (!examId) { setMsg('请先选择这套卷。'); return; }
    if (!file) return;
    if (!window.XLSX) { setMsg('Excel 解析库未加载，请刷新重试。'); return; }

    var examQuestions = _d.getExamGrammarQuestions(examId) || [];
    if (!examQuestions.length) { setMsg('题库里这套卷没有语法填空题，换一套或先导入试题。'); return; }
    var grammarNos = examQuestions.map(function(q){ return q.no; });

    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var wb = window.XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
        var sheetName = wb.SheetNames.find(function(n){ return n.indexOf('小题分') !== -1; }) || wb.SheetNames[0];
        var rows = window.XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, raw: true, defval: '' });
        var results = window.GrammarErrorProfile.extractGrammarResults(rows, grammarNos);
        if (!results.students.length) { setMsg('没读到学生行——确认这是网阅「学生小题分」导出。'); return; }
        var profile = window.GrammarErrorProfile.buildErrorProfile(results, examQuestions);
        var vmodel = window.GrammarErrorProfileView.buildProfileViewModel(profile, _d.catNames || {});
        showProfileHtml(window.GrammarErrorProfileRender.profilePageHtml(vmodel));
        setMsg('');
      } catch (err) {
        setMsg('解析失败：' + (err && err.message ? err.message : '未知错误') + '。请确认文件是网阅导出的 .xls。');
      }
    };
    reader.onerror = function(){ setMsg('读取文件失败，请重试。'); };
    reader.readAsArrayBuffer(file);
  }

  function render(deps) {
    _d = deps || _d;
    var el = document.getElementById('errorProfileContent');
    if (!el) return;
    var exams = (_d.getExamList && _d.getExamList()) || [];
    el.innerHTML = window.GrammarErrorProfileRender.uploadPanelHtml(exams) + '<div id="errorProfileResult"></div>';
    var fileInput = document.getElementById('errorProfileFile');
    if (fileInput) fileInput.addEventListener('change', function(ev){ onFile(ev.target.files && ev.target.files[0]); });
  }

  window.GrammarErrorProfileController = { render: render };
})();
