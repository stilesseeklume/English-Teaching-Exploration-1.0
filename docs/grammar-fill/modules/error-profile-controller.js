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
  var _tl = null, _tlClassId = null;
  var _brdExams = {};
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
      // 额外①：学号→姓名 写本地（名字永不上云）
      if (_imp.mergeStudentNames) {
        _imp.mergeStudentNames(window.GrammarStudentTracking.extractStudentRoster(_scoreRows));
      }
      // 额外②：每生一行 upsert 上云（非阻塞，失败不影响本地画像）
      if (_imp.uploadExamResults) {
        var stuRows = window.GrammarStudentTracking.buildExamResultRows(profile, examForBuild, {
          classId: classId, className: _imp.classNameOf ? _imp.classNameOf(classId) : '',
          examId: examId, examLabel: examLabel, examDate: _imp.today ? _imp.today() : null
        });
        _imp.uploadExamResults(stuRows).catch(function(){ /* 本地画像已存，静默 */ });
      }
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
  function boardViewProfile(examId) {
    var g = _brdExams[examId];
    var detail = document.getElementById('epBoardDetail');
    if (!g || !detail) return;
    var profile = window.GrammarErrorProfile.buildProfileFromExamRows(g.rows);
    var vmodel = window.GrammarErrorProfileView.buildProfileViewModel(profile, _brd.catNames || {});
    detail.innerHTML = window.GrammarErrorProfileRender.profilePageHtml(vmodel);
    detail.querySelectorAll('.ep-add-error').forEach(function(btn){
      btn.addEventListener('click', function(){
        if (!_brd.addExamQuestionToErrorBook) return;
        var r = _brd.addExamQuestionToErrorBook(examId, btn.getAttribute('data-no'));
        btn.textContent = (r && r.ok) ? (r.added ? '已加✓' : '已在本') : '题库无';
        btn.disabled = true; btn.style.opacity = '0.6';
      });
    });
  }
  function boardDelProfile(examId) {
    if (window.confirm && !window.confirm('删除这套卷的画像？(会从云端移除该卷成绩)')) return;
    if (!_brd.deleteExamResultsExam) return;
    _brd.deleteExamResultsExam(_boardClassId, examId).then(function(){ renderBoardPage(_brd); }).catch(function(){ if (window.alert) window.alert('删除失败，稍后重试。'); });
  }
  function renderBoardPage(deps) {
    _brd = deps || _brd;
    var el = document.getElementById('errorProfileContent');
    if (!el) return;
    el.innerHTML = '<div style="color:#888;padding:18px 4px;">加载云端数据…</div>';
    (_brd.fetchExamResults ? _brd.fetchExamResults() : Promise.resolve({ rows: [] })).then(function(res){
      var allRows = (res && res.rows) || [];
      var clsMap = {};
      allRows.forEach(function(r){
        if (!r.class_id) return;
        if (!clsMap[r.class_id]) clsMap[r.class_id] = { id: r.class_id, name: r.class_name || r.class_id, stu: {} };
        clsMap[r.class_id].stu[r.student_no] = 1;
      });
      ((_brd.getClasses && _brd.getClasses()) || []).forEach(function(c){
        if (!clsMap[c.id]) clsMap[c.id] = { id: c.id, name: c.name, stu: {} };
      });
      var classList = Object.keys(clsMap).map(function(k){ return { id: clsMap[k].id, name: clsMap[k].name, count: Object.keys(clsMap[k].stu).length }; });
      if ((!_boardClassId || !clsMap[_boardClassId]) && classList.length) _boardClassId = classList[0].id;
      _brdExams = {};
      allRows.filter(function(r){ return r.class_id === _boardClassId; }).forEach(function(r){
        if (!_brdExams[r.exam_id]) _brdExams[r.exam_id] = { examId: r.exam_id, examLabel: r.exam_label || r.exam_id, examDate: r.exam_date || '', rows: [] };
        _brdExams[r.exam_id].rows.push(r);
      });
      var catNames = _brd.catNames || {};
      var boardModel = Object.keys(_brdExams).map(function(eid){
        var g = _brdExams[eid];
        var vm = window.GrammarErrorProfileView.buildProfileViewModel(window.GrammarErrorProfile.buildProfileFromExamRows(g.rows), catNames);
        return { id: eid, examLabel: g.examLabel, savedAtText: (g.examDate || '').replace(/-/g, '.'), examDate: g.examDate, studentCount: vm.summary.studentCount, focusCount: vm.summary.focusCount };
      }).sort(function(a, z){ return String(z.examDate).localeCompare(String(a.examDate)); });
      el.innerHTML = window.GrammarErrorProfileRender.classChipsHtml(classList, _boardClassId)
        + '<button id="epToTimeline" style="margin:0 0 12px;padding:6px 14px;border-radius:999px;border:1px solid #cfe3ff;background:#f0f7ff;color:#0071e3;cursor:pointer;font-size:13px;">📈 学生时间线</button>'
        + '<div id="epBoardList">' + window.GrammarErrorProfileRender.boardListHtml(boardModel) + '</div>'
        + '<div id="epBoardDetail" style="margin-top:16px;"></div>';
      el.querySelectorAll('.ep-class-chip').forEach(function(btn){
        btn.addEventListener('click', function(){ _boardClassId = btn.getAttribute('data-id'); renderBoardPage(_brd); });
      });
      var toTl = document.getElementById('epToTimeline');
      if (toTl) toTl.addEventListener('click', function(){ if (_brd.gotoTimeline) _brd.gotoTimeline(); });
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
      if (boardModel.length) boardViewProfile(boardModel[0].id);
    }).catch(function(){ el.innerHTML = '<div style="color:#888;padding:18px 4px;">加载失败，稍后重试（请确认已登录）。</div>'; });
  }

  // ---------- 学生时间线（云端读，本地显名）----------
  function stImportRoster(file) {
    if (!file || !_tlClassId) return;
    if (!window.XLSX) { if (window.alert) window.alert('Excel 解析库未加载，请刷新重试。'); return; }
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var wb = window.XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
        var rows = window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: '' });
        if (_tl.importRoster) _tl.importRoster(_tlClassId, rows);
        renderTimelinePage(_tl);
      } catch (err) { if (window.alert) window.alert('名单解析失败：' + (err && err.message ? err.message : '未知错误') + '。确认是含「学号」「姓名」列的 Excel。'); }
    };
    reader.readAsArrayBuffer(file);
  }
  function renderTimelinePage(deps) {
    _tl = deps || _tl;
    var el = document.getElementById('studentTimelineContent');
    if (!el) return;
    el.innerHTML = '<div style="color:#888;padding:18px 4px;">加载云端数据…</div>';
    var fetchAll = _tl.fetchExamResults ? _tl.fetchExamResults() : Promise.resolve({ rows: [] });
    fetchAll.then(function(res){
      var allRows = (res && res.rows) || [];
      // 班级列表：云端 exam_results 的 class_id/class_name + 本地班级，合并（这样换设备登录也看得到）
      var clsMap = {};
      allRows.forEach(function(r){
        if (!r.class_id) return;
        if (!clsMap[r.class_id]) clsMap[r.class_id] = { id: r.class_id, name: r.class_name || r.class_id, stu: {} };
        clsMap[r.class_id].stu[r.student_no] = 1;
      });
      ((_tl.getClasses && _tl.getClasses()) || []).forEach(function(c){
        if (!clsMap[c.id]) clsMap[c.id] = { id: c.id, name: c.name, stu: {} };
        (c.students || []).forEach(function(n){ clsMap[c.id].stu[n] = 1; });
      });
      var classList = Object.keys(clsMap).map(function(k){ return { id: clsMap[k].id, name: clsMap[k].name, count: Object.keys(clsMap[k].stu).length }; });
      if ((!_tlClassId || !clsMap[_tlClassId]) && classList.length) _tlClassId = classList[0].id;
      el.innerHTML = window.GrammarErrorProfileRender.classChipsHtml(classList, _tlClassId)
        + '<div style="margin:6px 0 4px;"><span id="stRosterDrop" style="display:inline-block;padding:6px 14px;border-radius:999px;border:1px dashed #cfe3ff;background:#f7fbff;color:#0071e3;cursor:pointer;font-size:13px;">＋ 导入名单（学号+姓名 Excel）</span><input type="file" id="stRosterFile" accept=".xls,.xlsx" style="display:none;"></div>'
        + '<div id="stTimelineList" style="margin-top:14px;color:#888;"></div>';
      el.querySelectorAll('.ep-class-chip').forEach(function(btn){
        btn.addEventListener('click', function(){ _tlClassId = btn.getAttribute('data-id'); renderTimelinePage(_tl); });
      });
      var rosterDrop = document.getElementById('stRosterDrop');
      var rosterFile = document.getElementById('stRosterFile');
      if (rosterDrop && rosterFile) {
        rosterDrop.addEventListener('click', function(){ if (!_tlClassId) { if (window.alert) window.alert('先选个班级'); return; } rosterFile.click(); });
        rosterFile.addEventListener('change', function(ev){ stImportRoster(ev.target.files && ev.target.files[0]); });
      }
      var listEl = document.getElementById('stTimelineList');
      if (!_tlClassId) { if (listEl) listEl.textContent = '先建个班、导名单或导成绩，这里就有学生了。'; return; }
      var rows = allRows.filter(function(r){ return r.class_id === _tlClassId; });
      var rosterSet = {};
      rows.forEach(function(r){ rosterSet[r.student_no] = 1; });
      ((_tl.classRoster && _tl.classRoster(_tlClassId)) || []).forEach(function(n){ rosterSet[n] = 1; });
      var timeline = window.GrammarStudentTracking.buildStudentTimeline(rows, Object.keys(rosterSet));
      var names = (_tl.loadStudentNames && _tl.loadStudentNames()) || {};
      if (listEl) listEl.innerHTML = window.GrammarErrorProfileRender.studentTimelineHtml(timeline, names, (_tl.catNames) || {});
    }).catch(function(){ el.innerHTML = '<div style="color:#888;padding:18px 4px;">加载失败，稍后重试（请确认已登录）。</div>'; });
  }

  window.GrammarErrorProfileController = {
    renderImportPage: renderImportPage,
    renderBoardPage: renderBoardPage,
    renderTimelinePage: renderTimelinePage
  };
})();
