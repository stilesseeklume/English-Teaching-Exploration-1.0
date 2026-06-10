// grammar-fill/modules/error-profile-controller.js
//
// 控制器：错题画像。两个页面——
//   renderImportPage(deps)：选卷 + 传成绩 → SheetJS → 引擎 → 算画像 → 存本机 → 跳画像板块。
//   renderBoardPage(deps)：读本机存储 → 列出卷子 → 点开看完整画像 / 删。
// deps（import）: getExamList, getExamGrammarQuestions, catNames, loadProfiles, saveProfiles, gotoBoard, now, nowText
// deps（board）:  loadProfiles, saveProfiles, catNames

/* eslint-disable */
(function(){
  var _imp = null, _brd = null, _boardClassId = null;
  function setMsg(text) { var el = document.getElementById('errorProfileMsg'); if (el) el.textContent = text || ''; }

  // ---------- 导入页 ----------
  function importOnFile(file) {
    setMsg('');
    var clsSel = document.getElementById('errorImportClass');
    var classId = (clsSel || {}).value || '';
    if (!classId) { setMsg('请先选班级（或新建一个）。'); return; }
    var sel = document.getElementById('errorProfileExam');
    var examId = (sel || {}).value || '';
    var examLabel = (sel && sel.selectedIndex >= 0) ? sel.options[sel.selectedIndex].text : examId;
    if (!examId) { setMsg('请先选择这套卷。'); return; }
    if (!file) return;
    if (!window.XLSX) { setMsg('Excel 解析库未加载，请刷新重试。'); return; }
    var examQuestions = _imp.getExamGrammarQuestions(examId) || [];
    if (!examQuestions.length) { setMsg('题库里这套卷没有语法填空题。'); return; }
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var wb = window.XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
        var sheet = wb.SheetNames.find(function(n){ return n.indexOf('小题分') !== -1; }) || wb.SheetNames[0];
        var rows = window.XLSX.utils.sheet_to_json(wb.Sheets[sheet], { header: 1, raw: true, defval: '' });
        var EP = window.GrammarErrorProfile;
        var sortedExam = examQuestions.slice().sort(function(a, z){ return a.no - z.no; });
        var detectedNos = EP.detectGrammarNos(rows);
        var grammarNos, examForBuild;
        if (detectedNos.length === sortedExam.length && detectedNos.length > 0) {
          // 按 1.5 认出的语填列数与题库套卷语填题数一致 → 用检出列 + 按序对齐（题号一致即恒等，不一致自动纠偏）
          grammarNos = detectedNos;
          examForBuild = EP.alignExamQuestions(sortedExam, detectedNos);
        } else {
          // 列数对不上 → 退回按题库题号直配
          grammarNos = sortedExam.map(function(q){ return q.no; });
          examForBuild = sortedExam;
        }
        var results = EP.extractGrammarResults(rows, grammarNos);
        if (!results.students.length) { setMsg('没读到学生行——确认这是网阅「学生小题分」导出。'); return; }
        var profile = EP.buildErrorProfile(results, examForBuild);
        var vmodel = window.GrammarErrorProfileView.buildProfileViewModel(profile, _imp.catNames || {});
        var entry = {
          id: classId + '__' + examId, classId: classId, examId: examId, examLabel: examLabel,
          savedAt: _imp.now ? _imp.now() : 0, savedAtText: _imp.nowText ? _imp.nowText() : '',
          summary: vmodel.summary, profile: profile
        };
        var list = window.GrammarErrorProfileStore.upsertEntry((_imp.loadProfiles && _imp.loadProfiles()) || [], entry);
        if (_imp.saveProfiles) _imp.saveProfiles(list);
        if (_imp.gotoBoard) _imp.gotoBoard();
      } catch (err) {
        setMsg('解析失败：' + (err && err.message ? err.message : '未知错误') + '。请确认是网阅导出的 .xls。');
      }
    };
    reader.onerror = function(){ setMsg('读取文件失败，请重试。'); };
    reader.readAsArrayBuffer(file);
  }
  function renderImportPage(deps) {
    _imp = deps || _imp;
    var el = document.getElementById('errorImportContent');
    if (!el) return;
    var exams = (_imp.getExamList && _imp.getExamList()) || [];
    var classes = (_imp.getClasses && _imp.getClasses()) || [];
    el.innerHTML = window.GrammarErrorProfileRender.importClassBarHtml(classes)
      + window.GrammarErrorProfileRender.uploadPanelHtml(exams);
    var newBtn = document.getElementById('errorImportNewClass');
    if (newBtn) newBtn.addEventListener('click', function(){
      var name = window.prompt && window.prompt('新建班级名（如 高三①班）：');
      if (name && _imp.createClass) { _imp.createClass(name); renderImportPage(_imp); }
    });
    var fileInput = document.getElementById('errorProfileFile');
    if (fileInput) fileInput.addEventListener('change', function(ev){ importOnFile(ev.target.files && ev.target.files[0]); });
    var drop = document.getElementById('errorScoreDrop');
    if (drop && fileInput) {
      drop.addEventListener('click', function(){ fileInput.click(); });
      drop.addEventListener('dragover', function(ev){ ev.preventDefault(); drop.style.background = '#eaf4ff'; });
      drop.addEventListener('dragleave', function(){ drop.style.background = '#f7fbff'; });
      drop.addEventListener('drop', function(ev){
        ev.preventDefault(); drop.style.background = '#f7fbff';
        var f = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
        if (f) importOnFile(f);
      });
    }
  }

  // ---------- 画像板块 ----------
  function boardViewProfile(id) {
    var list = (_brd.loadProfiles && _brd.loadProfiles()) || [];
    var entry = window.GrammarErrorProfileStore.getEntry(list, id);
    var detail = document.getElementById('epBoardDetail');
    if (!entry || !detail) return;
    var vmodel = window.GrammarErrorProfileView.buildProfileViewModel(entry.profile, _brd.catNames || {});
    detail.innerHTML = window.GrammarErrorProfileRender.profilePageHtml(vmodel);
    detail.querySelectorAll('.ep-add-error').forEach(function(btn){
      btn.addEventListener('click', function(){
        if (!_brd.addExamQuestionToErrorBook) return;
        var r = _brd.addExamQuestionToErrorBook(entry.examId, btn.getAttribute('data-no'));
        btn.textContent = (r && r.ok) ? (r.added ? '已加✓' : '已在本') : '题库无';
        btn.disabled = true; btn.style.opacity = '0.6';
      });
    });
  }
  function boardDelProfile(id) {
    if (window.confirm && !window.confirm('删除这套卷的画像？')) return;
    var list = (_brd.loadProfiles && _brd.loadProfiles()) || [];
    var next = window.GrammarErrorProfileStore.removeEntry(list, id);
    if (_brd.saveProfiles) _brd.saveProfiles(next);
    renderBoardPage(_brd);
  }
  function renderBoardPage(deps) {
    _brd = deps || _brd;
    var el = document.getElementById('errorProfileContent');
    if (!el) return;
    var profiles = (_brd.loadProfiles && _brd.loadProfiles()) || [];
    var classes = (_brd.getClasses && _brd.getClasses()) || [];
    var classListModel = window.GrammarErrorProfileStore.buildClassListModel(classes, profiles);
    if (!_boardClassId && classListModel.length) _boardClassId = classListModel[0].id;   // 默认第一个班
    var boardModel = window.GrammarErrorProfileStore.buildBoardModel(profiles, _boardClassId);
    el.innerHTML = window.GrammarErrorProfileRender.classChipsHtml(classListModel, _boardClassId)
      + '<div id="epBoardList">' + window.GrammarErrorProfileRender.boardListHtml(boardModel) + '</div>'
      + '<div id="epBoardDetail" style="margin-top:16px;"></div>';
    el.querySelectorAll('.ep-class-chip').forEach(function(btn){
      btn.addEventListener('click', function(){ _boardClassId = btn.getAttribute('data-id'); renderBoardPage(_brd); });
    });
    var newChip = el.querySelector('.ep-class-new');
    if (newChip) newChip.addEventListener('click', function(){
      var name = window.prompt && window.prompt('新建班级名（如 高三①班）：');
      if (name && _brd.createClass) { var c = _brd.createClass(name); if (c) _boardClassId = c.id; renderBoardPage(_brd); }
    });
    el.querySelectorAll('.ep-board-view').forEach(function(btn){
      btn.addEventListener('click', function(){ boardViewProfile(btn.getAttribute('data-id')); });
    });
    el.querySelectorAll('.ep-board-del').forEach(function(btn){
      btn.addEventListener('click', function(){ boardDelProfile(btn.getAttribute('data-id')); });
    });
    if (boardModel.length) boardViewProfile(boardModel[0].id);   // 默认展开该班最新一套
  }

  window.GrammarErrorProfileController = {
    renderImportPage: renderImportPage,
    renderBoardPage: renderBoardPage
  };
})();
