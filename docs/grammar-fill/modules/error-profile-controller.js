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
  var _examQuestions = null, _scoreRows = null, _examLabel = '', _examId = '';
  function setMsg(text) { var el = document.getElementById('errorProfileMsg'); if (el) el.textContent = text || ''; }
  function classIdNow() { var s = document.getElementById('errorImportClass'); return (s || {}).value || ''; }

  // ---------- 导入页：套卷(题库 / 拖 Word 走 AI) + 成绩(.xls) 两个都好 → 认列对齐 → 画像进班 ----------
  function setExamReady(qs, label, examId) {
    _examQuestions = (qs && qs.length) ? qs.slice() : null;
    _examLabel = label || ''; _examId = examId || '';
    var lab = document.getElementById('errorExamLabel');
    if (lab) {
      if (_examQuestions) lab.textContent = '✅ 套卷已就绪：' + _examLabel + '（' + _examQuestions.length + ' 题语法填空）';
      else if (label) lab.textContent = '① 这套卷没识别到语法填空题，换一个';
    }
    if (_examQuestions) tryRunProfile();
  }
  function onExamWord(file) {
    if (!file) return;
    setMsg('');
    var lab = document.getElementById('errorExamLabel');
    if (lab) lab.textContent = '① 套卷解析中…（AI 识别考点，约 10–60 秒）';
    if (!_imp.parseExamWord) { setMsg('上传组件未加载，请刷新重试。'); return; }
    _imp.parseExamWord(file).then(function(qs){
      setExamReady(qs, String(file.name || '套卷').replace(/\.docx$/i, ''), 'word:' + (file.name || ''));
    }).catch(function(err){
      if (lab) lab.textContent = '① 套卷解析失败，重试或换文件';
      setMsg('套卷解析失败：' + (err && err.message ? err.message : '未知错误'));
    });
  }
  function onScore(file) {
    if (!file) return;
    setMsg('');
    if (!window.XLSX) { setMsg('Excel 解析库未加载，请刷新重试。'); return; }
    var lab = document.getElementById('errorScoreLabel');
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var wb = window.XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
        var sheet = wb.SheetNames.find(function(n){ return n.indexOf('小题分') !== -1; }) || wb.SheetNames[0];
        _scoreRows = window.XLSX.utils.sheet_to_json(wb.Sheets[sheet], { header: 1, raw: true, defval: '' });
        if (lab) lab.textContent = '✅ 成绩已就绪（' + Math.max(0, _scoreRows.length - 1) + ' 行）';
        tryRunProfile();
      } catch (err) {
        setMsg('成绩解析失败：' + (err && err.message ? err.message : '未知错误') + '。请确认是网阅导出的 .xls。');
      }
    };
    reader.onerror = function(){ setMsg('读取成绩文件失败，请重试。'); };
    reader.readAsArrayBuffer(file);
  }
  function tryRunProfile() {
    if (!_examQuestions || !_scoreRows) return;            // 等两个都拖好
    var classId = classIdNow();
    if (!classId) { setMsg('两个文件都好了——请在上方选个班级（或新建）。'); return; }
    try {
      var EP = window.GrammarErrorProfile;
      var sortedExam = _examQuestions.slice().sort(function(a, z){ return a.no - z.no; });
      var detectedNos = EP.detectGrammarNos(_scoreRows);
      var grammarNos, examForBuild;
      if (detectedNos.length === sortedExam.length && detectedNos.length > 0) {
        grammarNos = detectedNos;                           // 按 1.5 认列 + 按序对齐（题号不一致也纠偏）
        examForBuild = EP.alignExamQuestions(sortedExam, detectedNos);
      } else {
        grammarNos = sortedExam.map(function(q){ return q.no; });   // 列数对不上 → 退回题库题号直配
        examForBuild = sortedExam;
      }
      var results = EP.extractGrammarResults(_scoreRows, grammarNos);
      if (!results.students.length) { setMsg('没读到学生行——确认成绩是网阅「学生小题分」导出。'); return; }
      var profile = EP.buildErrorProfile(results, examForBuild);
      var vmodel = window.GrammarErrorProfileView.buildProfileViewModel(profile, _imp.catNames || {});
      var examLabel = _examLabel || '套卷', examId = _examId || ('exam:' + examLabel);
      var entry = {
        id: classId + '__' + examId, classId: classId, examId: examId, examLabel: examLabel,
        savedAt: _imp.now ? _imp.now() : 0, savedAtText: _imp.nowText ? _imp.nowText() : '',
        summary: vmodel.summary, profile: profile
      };
      var list = window.GrammarErrorProfileStore.upsertEntry((_imp.loadProfiles && _imp.loadProfiles()) || [], entry);
      if (_imp.saveProfiles) _imp.saveProfiles(list);
      _examQuestions = null; _scoreRows = null;             // 重置，避免重复触发
      if (_imp.gotoBoard) _imp.gotoBoard();
    } catch (err) {
      setMsg('匹配失败：' + (err && err.message ? err.message : '未知错误') + '。');
    }
  }
  function wireDrop(dropId, fileId, handler) {
    var drop = document.getElementById(dropId), file = document.getElementById(fileId);
    if (!drop || !file) return;
    drop.addEventListener('click', function(){ file.click(); });
    file.addEventListener('change', function(ev){ handler(ev.target.files && ev.target.files[0]); });
    drop.addEventListener('dragover', function(ev){ ev.preventDefault(); drop.classList.add('dragover'); });
    drop.addEventListener('dragleave', function(){ drop.classList.remove('dragover'); });
    drop.addEventListener('drop', function(ev){
      ev.preventDefault(); drop.classList.remove('dragover');
      var f = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
      if (f) handler(f);
    });
  }
  function renderImportPage(deps) {
    _imp = deps || _imp;
    _examQuestions = null; _scoreRows = null; _examLabel = ''; _examId = '';   // 进页面重置
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
    var examSel = document.getElementById('errorProfileExam');
    if (examSel) examSel.addEventListener('change', function(){
      var id = examSel.value;
      if (!id) { setExamReady(null, '', ''); return; }
      var qs = (_imp.getExamGrammarQuestions && _imp.getExamGrammarQuestions(id)) || [];
      var label = (examSel.options[examSel.selectedIndex] || {}).text || id;
      setExamReady(qs, label, id);
    });
    wireDrop('errorExamDrop', 'errorExamFile', onExamWord);
    wireDrop('errorScoreDrop', 'errorProfileFile', onScore);
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
