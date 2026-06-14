// grammar-fill/modules/error-profile-controller.js
//
// 控制器：错题画像。两个页面——
//   renderImportPage(deps)：选卷 + 传成绩 → SheetJS → 引擎 → 算画像 → 存本机 → 跳工作台。
//   renderWorkbenchPage(deps)：班级工作台 = 顶部统一选班+班级管理 + 分段切换「考点视角(renderBoardBody) / 学生视角(renderTimelineBody)」。
//     一次 fetchExamResults 两视角共用；班级列表用 buildClassList(名单∪成绩)统一人数口径。
//     兼容别名 renderBoardPage / renderTimelinePage 均指向 renderWorkbenchPage。
// deps（import）: getExamList, getExamGrammarQuestions, catNames, loadProfiles, saveProfiles, gotoBoard, now, nowText
// deps（workbench）: catNames, getClasses, createClass, deleteClass, renameClass, addStudents, removeStudent,
//                    importRoster, classRoster, loadStudentNames, fetchExamResults,
//                    deleteExamResultsClass, deleteExamResultsExam, addExamQuestionToErrorBook

/* eslint-disable */
(function(){
  var _imp = null;
  var _wb = null, _wbClassId = null, _wbTab = 'board', _wbClasses = [];   // 班级工作台：deps / 选中班 / 当前视角 / 班级列表缓存
  var _brdExams = {}, _boardExamId = null, _brdTrendByCat = {};
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
    if (!classId) { setMsg('两个文件都好了——请在上方选个班级（没有班级就先去「学生管理」新建）。'); return; }
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

  // ---------- 班级工作台 · 考点视角 ----------
  function boardViewProfile(examId) {
    var g = _brdExams[examId];
    var detail = document.getElementById('epBoardDetail');
    if (!g || !detail) return;
    var profile = window.GrammarErrorProfile.buildProfileFromExamRows(g.rows);
    var vmodel = window.GrammarErrorProfileView.buildProfileViewModel(profile, _wb.catNames || {});
    detail.innerHTML = '<div style="margin-bottom:10px;"><b>' + (window.escapeHtml ? window.escapeHtml(g.examLabel) : g.examLabel) + '</b> · 本卷画像'
      + '<button id="epDelExam" style="margin-left:10px;padding:3px 10px;border-radius:8px;border:1px solid #f3c0c0;background:#fff;color:#c0392b;cursor:pointer;font-size:12px;">删这套</button></div>'
      + window.GrammarErrorProfileRender.profilePageHtml(vmodel, _brdTrendByCat);
    var del = document.getElementById('epDelExam');
    if (del) del.addEventListener('click', function(){ boardDelProfile(examId); });
    detail.querySelectorAll('.ep-add-error').forEach(function(btn){
      btn.addEventListener('click', function(){
        if (!_wb.addExamQuestionToErrorBook) return;
        var r = _wb.addExamQuestionToErrorBook(examId, btn.getAttribute('data-no'));
        btn.textContent = (r && r.ok) ? (r.added ? '已加✓' : '已在本') : '题库无';
        btn.disabled = true; btn.style.opacity = '0.6';
      });
    });
  }
  function boardDelProfile(examId) {
    if (window.confirm && !window.confirm('删除这套卷的画像？(会从云端移除该卷成绩)')) return;
    if (!_wb.deleteExamResultsExam) return;
    _wb.deleteExamResultsExam(_wbClassId, examId).then(function(){ renderWorkbenchPage(_wb); }).catch(function(){ if (window.alert) window.alert('删除失败，稍后重试。'); });
  }
  // 考点视角 body：按 classId 过滤已取的 allRows → 组卷 → examChips + 本卷画像 + 跨卷趋势。不自取数据、不画班级 chips。
  function renderBoardBody(body, allRows, classId) {
    if (!body) return;
    _brdExams = {};
    (allRows || []).filter(function(r){ return r.class_id === classId; }).forEach(function(r){
      if (!_brdExams[r.exam_id]) _brdExams[r.exam_id] = { examId: r.exam_id, examLabel: r.exam_label || r.exam_id, examDate: r.exam_date || '', rows: [] };
      _brdExams[r.exam_id].rows.push(r);
    });
    var catNames = _wb.catNames || {};
    var orderedExams = Object.keys(_brdExams).map(function(eid){
      var g = _brdExams[eid];
      var profile = window.GrammarErrorProfile.buildProfileFromExamRows(g.rows);
      var vm = window.GrammarErrorProfileView.buildProfileViewModel(profile, catNames);
      return { id: eid, examLabel: g.examLabel, examDate: g.examDate, byCat: profile.byCat, focusCount: vm.summary.focusCount };
    }).sort(function(a, z){ return String(a.examDate).localeCompare(String(z.examDate)); });   // 升序：左早右近
    if ((!_boardExamId || !_brdExams[_boardExamId]) && orderedExams.length) _boardExamId = orderedExams[orderedExams.length - 1].id;   // 默认最新一套
    var trends = window.GrammarErrorProfileView.buildCatTrends(orderedExams);
    _brdTrendByCat = {};
    trends.forEach(function(t){ _brdTrendByCat[t.category] = t; });   // 考点→趋势，喂给排行行内迷你趋势线
    body.innerHTML = window.GrammarErrorProfileRender.examChipsHtml(orderedExams, _boardExamId)
      + '<div id="epBoardDetail" style="margin-top:4px;"></div>'                     // 选中套卷的画像——紧跟 chips，立即可见
      + window.GrammarErrorProfileRender.catTrendDetailsHtml(trends, catNames)        // 全考点跨卷趋势——折叠沉底，默认收起
      + '<div style="margin-top:8px;"><button id="epToStudents" style="padding:8px 16px;border-radius:999px;border:1px solid #cfe3ff;background:#f0f7ff;color:#0071e3;cursor:pointer;font-size:13px;">查看单个学生的画像 →</button></div>';
    var toStu = document.getElementById('epToStudents');
    if (toStu) toStu.addEventListener('click', function(){ _wbTab = 'students'; renderWorkbenchPage(_wb); });   // 同页切到学生视角
    body.querySelectorAll('.ep-exam-chip').forEach(function(btn){
      btn.addEventListener('click', function(){
        _boardExamId = btn.getAttribute('data-id');
        body.querySelectorAll('.ep-exam-chip').forEach(function(b){
          var on = b.getAttribute('data-id') === _boardExamId;
          b.style.background = on ? '#0071e3' : '#f7f7f7'; b.style.color = on ? '#fff' : '#333'; b.style.border = '1px solid ' + (on ? '#0071e3' : '#e5e5e5');
        });
        boardViewProfile(_boardExamId);
      });
    });
    if (_boardExamId) boardViewProfile(_boardExamId);
  }

  // ---------- 班级工作台 · 学生视角 + 班级管理动作 ----------
  function stImportRoster(file) {
    if (!file || !_wbClassId) return;
    if (!window.XLSX) { if (window.alert) window.alert('Excel 解析库未加载，请刷新重试。'); return; }
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var wb = window.XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
        var rows = window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: '' });
        if (_wb.importRoster) _wb.importRoster(_wbClassId, rows);
        renderWorkbenchPage(_wb);
      } catch (err) { if (window.alert) window.alert('名单解析失败：' + (err && err.message ? err.message : '未知错误') + '。确认是含「学号」「姓名」列的 Excel。'); }
    };
    reader.readAsArrayBuffer(file);
  }
  // 删除当前选中的班：本地班级+名单，并删云端该班全部成绩（不可逆，强确认）。云端失败则不动本地。
  function tlDeleteClass() {
    if (!_wbClassId) return;
    var c = _wbClasses.filter(function(x){ return x.id === _wbClassId; })[0];
    var name = (c && c.name) || _wbClassId;
    if (window.confirm && !window.confirm('删除班级「' + name + '」？\n这会移除该班的本地名单，并删除云端该班的全部成绩记录，不可恢复。')) return;
    var delBtn = document.getElementById('stDeleteClass');
    if (delBtn) { delBtn.disabled = true; delBtn.style.opacity = '0.5'; delBtn.style.cursor = 'default'; delBtn.textContent = '删除中…'; }
    var cloudDel = _wb.deleteExamResultsClass ? _wb.deleteExamResultsClass(_wbClassId) : Promise.resolve();
    cloudDel.then(function(){
      if (_wb.deleteClass) _wb.deleteClass(_wbClassId);
      _wbClassId = null;
      renderWorkbenchPage(_wb);
    }).catch(function(){
      if (delBtn) { delBtn.disabled = false; delBtn.style.opacity = '1'; delBtn.style.cursor = 'pointer'; delBtn.textContent = '🗑 删除该班'; }
      if (window.alert) window.alert('云端删除失败，未删除该班。请检查网络/登录后重试。');
    });
  }
  // 班级改名：本地改名（保留名单），并把云端该班成绩行的 class_name 一并改掉（有云端数据时名字以云端为准）。
  function tlRenameClass() {
    if (!_wbClassId || !_wb.renameClass) return;
    var c = _wbClasses.filter(function(x){ return x.id === _wbClassId; })[0];
    var cur = (c && c.name) || '';
    var name = window.prompt && window.prompt('班级改名（如 高三①班）：', cur);
    if (name == null) return;                       // 点了取消
    name = String(name).trim();
    if (!name || name === cur) return;
    var p = _wb.renameClass(_wbClassId, name);
    (p && p.then ? p : Promise.resolve()).then(function(){ renderWorkbenchPage(_wb); })
      .catch(function(){ renderWorkbenchPage(_wb); });   // 本地已改名，云端失败也照常刷新
  }
  // 添加学生：解析多行文本 → 进本班名单（同步，姓名只存本地）。空白则提示，不重渲染。
  function tlAddStudents() {
    if (!_wbClassId || !_wb.addStudents) return;
    var ta = document.getElementById('stAddInput');
    var msg = document.getElementById('stAddMsg');
    var parsed = window.GrammarStudentTracking.parseRosterText(ta ? ta.value : '');
    if (!parsed.length) { if (msg) msg.textContent = '没识别到学生——每行写一个姓名，或「学号 姓名」。'; return; }
    _wb.addStudents(_wbClassId, parsed);
    renderWorkbenchPage(_wb);                         // 重渲染：班级人数 chip + 搜索即时含新生
  }
  // 删除单个学生：本地名单移除 + 删云端该班该生成绩（不可逆，强确认）。失败则不动、提示重试。
  function tlRemoveStudent(studentNo, nameMap) {
    if (!studentNo || !_wbClassId || !_wb.removeStudent) return;
    var nm = (nameMap && nameMap[studentNo]) || studentNo;
    if (window.confirm && !window.confirm('从本班移除「' + nm + '」？\n会删掉本地名单里的这名学生，以及云端该班下这名学生的成绩记录，不可恢复。')) return;
    var p = _wb.removeStudent(_wbClassId, studentNo);
    (p && p.then ? p : Promise.resolve()).then(function(){ renderWorkbenchPage(_wb); })
      .catch(function(){ if (window.alert) window.alert('删除失败，请检查网络/登录后重试。'); });
  }
  function studentTotalWrong(st) {
    return ((st && st.weakCats) || []).reduce(function(s, x){ return s + (x.wrong || 0); }, 0);
  }
  // 搜索驱动：输入姓名/学号即时筛 → 点一个 → 在下方渲染他的可视化个人画像。默认空查询只列"最需要关注的几个"。
  function wireStudentSearch(timeline, nameMap, catNames) {
    timeline = timeline || []; nameMap = nameMap || {}; catNames = catNames || {};
    var R = window.GrammarErrorProfileRender;
    var resolve = window.GrammarStudentTracking.resolveStudentName;
    var input = document.getElementById('stSearch');
    var selectedNo = null;
    var rows = timeline.map(function(st){
      return { studentNo: st.studentNo, name: resolve(nameMap, st.studentNo), totalWrong: studentTotalWrong(st), missedCount: st.missedCount || 0, st: st };
    });
    function showDetail(no) {
      selectedNo = no;
      var hit = null;
      for (var i = 0; i < rows.length; i++) { if (rows[i].studentNo === no) { hit = rows[i]; break; } }
      var detail = document.getElementById('stStudentDetail');
      if (!detail) return;
      if (!hit) { detail.innerHTML = ''; return; }
      var vm = window.GrammarErrorProfileView.buildStudentProfileVM(hit.st, catNames);
      detail.innerHTML = R.studentProfileHtml(vm, hit.name);
    }
    function showMatches(query) {
      var q = (query || '').trim().toLowerCase();
      var matched, opt;
      if (!q) {
        matched = rows.slice(0, 6);   // buildStudentTimeline 默认按"弱"降序，取前几个即"最需要关注"
        opt = matched.length
          ? { title: '最需要关注的学生（错最多在前，点开看画像）', selectedNo: selectedNo }
          : { emptyText: '这个班还没有学生成绩——导一次成绩或名单就有了。', selectedNo: selectedNo };
      } else {
        matched = rows.filter(function(m){
          return String(m.name).toLowerCase().indexOf(q) !== -1 || String(m.studentNo).indexOf(q) !== -1;
        }).slice(0, 20);
        opt = { emptyText: '没找到「' + query + '」——换个姓名或学号试试。', selectedNo: selectedNo };
      }
      var box = document.getElementById('stMatchList');
      if (!box) return;
      box.innerHTML = R.studentMatchListHtml(matched, nameMap, opt);
      box.querySelectorAll('.st-pick').forEach(function(btn){
        btn.addEventListener('click', function(){
          showDetail(btn.getAttribute('data-no'));
          showMatches(input ? input.value : '');   // 重渲染列表以高亮选中项
        });
      });
      box.querySelectorAll('.st-del').forEach(function(btn){
        btn.addEventListener('click', function(){ tlRemoveStudent(btn.getAttribute('data-no'), nameMap); });
      });
    }
    if (input) input.addEventListener('input', function(){ showMatches(input.value); });
    showMatches('');   // 初始：默认列出最需要关注的几个
  }
  // 学生视角 body：按 classId 过滤已取的 allRows → rosterSet(成绩∪本地名单) → 时间线 → 搜索框。不自取数据、不画班级 chips/管理行。
  function renderTimelineBody(body, allRows, classId) {
    if (!body) return;
    var rows = (allRows || []).filter(function(r){ return r.class_id === classId; });
    var rosterSet = {};
    rows.forEach(function(r){ rosterSet[r.student_no] = 1; });
    ((_wb.classRoster && _wb.classRoster(classId)) || []).forEach(function(n){ rosterSet[n] = 1; });
    var timeline = window.GrammarStudentTracking.buildStudentTimeline(rows, Object.keys(rosterSet));
    var names = (_wb.loadStudentNames && _wb.loadStudentNames()) || {};
    body.innerHTML = window.GrammarErrorProfileRender.studentSearchBoxHtml(timeline.length);
    wireStudentSearch(timeline, names, (_wb.catNames) || {});
  }

  // ---------- 班级工作台 · 壳（统一选班 + 班级管理 + 分段切换 + 委派 body）----------
  // 顶部管理行（导名单/改名/删班/加学生）的事件绑定——两视角共用，每次重渲染后调一次。
  function wireManageRow() {
    var delClassBtn = document.getElementById('stDeleteClass');
    if (delClassBtn) delClassBtn.addEventListener('click', tlDeleteClass);
    var renameBtn = document.getElementById('stRenameClass');
    if (renameBtn) renameBtn.addEventListener('click', tlRenameClass);
    var addBtn = document.getElementById('stAddBtn');
    if (addBtn) addBtn.addEventListener('click', tlAddStudents);
    var rosterDrop = document.getElementById('stRosterDrop');
    var rosterFile = document.getElementById('stRosterFile');
    if (rosterDrop && rosterFile) {
      rosterDrop.addEventListener('click', function(){ if (!_wbClassId) { if (window.alert) window.alert('先选个班级'); return; } rosterFile.click(); });
      rosterFile.addEventListener('change', function(ev){ stImportRoster(ev.target.files && ev.target.files[0]); });
    }
  }
  function renderWorkbenchPage(deps) {
    _wb = deps || _wb;
    var el = document.getElementById('studentTimelineContent');
    if (!el) return;
    el.innerHTML = '<div style="color:#888;padding:18px 4px;">加载云端数据…</div>';
    (_wb.fetchExamResults ? _wb.fetchExamResults() : Promise.resolve({ rows: [] })).then(function(res){
      var allRows = (res && res.rows) || [];
      // 班级列表（名单∪成绩）只算一次，两视角共用——人数口径统一，杜绝同班 0 vs 40。
      var classList = window.GrammarErrorProfileStore.buildClassList(allRows, (_wb.getClasses && _wb.getClasses()) || []);
      if ((!_wbClassId || !classList.some(function(c){ return c.id === _wbClassId; })) && classList.length) _wbClassId = classList[0].id;
      _wbClasses = classList;
      var R = window.GrammarErrorProfileRender;
      var manageRow = _wbClassId
        ? '<div style="margin:6px 0 4px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">'
            + '<span id="stRosterDrop" style="display:inline-block;padding:7px 14px;border-radius:999px;border:1px dashed #cfe3ff;background:#f7fbff;color:#0071e3;cursor:pointer;font-size:13px;">＋ 导入名单（学号+姓名 Excel）</span>'
            + '<button type="button" id="stRenameClass" style="padding:7px 14px;border-radius:999px;border:1px solid #cfe3ff;background:#f7fbff;color:#0071e3;cursor:pointer;font-size:13px;">✎ 班级改名</button>'
            + '<button type="button" id="stDeleteClass" style="padding:7px 14px;border-radius:999px;border:1px solid #f3c0c0;background:#fff;color:#c0392b;cursor:pointer;font-size:13px;">🗑 删除该班</button>'
            + '<input type="file" id="stRosterFile" accept=".xls,.xlsx" style="display:none;"></div>'
        : '<div style="margin:6px 0 4px;color:#888;font-size:13px;">先「＋ 新建班级」，再导名单/导成绩或加学生。</div>';
      el.innerHTML = R.classChipsHtml(classList, _wbClassId)
        + manageRow
        + (_wbClassId ? R.studentAddBoxHtml() : '')
        + (_wbClassId ? R.workbenchTabsHtml(_wbTab) : '')
        + '<div id="wbContent"></div>';
      el.querySelectorAll('.ep-class-chip').forEach(function(btn){
        btn.addEventListener('click', function(){ _wbClassId = btn.getAttribute('data-id'); _boardExamId = null; renderWorkbenchPage(_wb); });
      });
      var newChip = el.querySelector('.ep-class-new');
      if (newChip) newChip.addEventListener('click', function(){
        var name = window.prompt && window.prompt('新建班级名（如 高三①班）：');
        if (name && _wb.createClass) { var c = _wb.createClass(name); if (c) _wbClassId = c.id; renderWorkbenchPage(_wb); }
      });
      wireManageRow();
      el.querySelectorAll('.wb-tab').forEach(function(btn){
        btn.addEventListener('click', function(){ _wbTab = btn.getAttribute('data-tab'); renderWorkbenchPage(_wb); });
      });
      var body = document.getElementById('wbContent');
      if (!_wbClassId) { if (body) body.innerHTML = '<div style="color:#888;padding:18px 4px;">先「＋ 新建班级」，再导成绩/名单或加学生，这里就有内容了。</div>'; return; }
      if (_wbTab === 'students') renderTimelineBody(body, allRows, _wbClassId);
      else renderBoardBody(body, allRows, _wbClassId);
    }).catch(function(){ el.innerHTML = '<div style="color:#888;padding:18px 4px;">加载失败，稍后重试（请确认已登录）。</div>'; });
  }

  window.GrammarErrorProfileController = {
    renderImportPage: renderImportPage,
    renderWorkbenchPage: renderWorkbenchPage,
    renderBoardPage: renderWorkbenchPage,      // 兼容别名（旧调用 → 工作台）
    renderTimelinePage: renderWorkbenchPage     // 兼容别名（旧调用 → 工作台）
  };
})();
