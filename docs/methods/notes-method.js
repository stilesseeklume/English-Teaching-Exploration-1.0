// docs/methods/notes-method.js
//
// 口译笔记法（跨单元方法模块）· 页面逻辑
//
// 结构：一条线读下来，不是一张菜单。
//   ① 示范（读书模式：整屏书页 + 页边笔记。点段落 → 镜头平移，笔记在页边长出来）
//   ② 四原则（走完示范再归纳，每条都能点回示范里的那一段）
//   ③ 符号表（折叠，抄到笔记本第一页）
//   ④ U3 迁移（学生自己写 + 一处真实缺陷）
//
// 数据来源：docs/data/interpreting_notes_method.js（方法层）
//           docs/data/textbook_reading_notes.js（U3 成品笔记，单一来源，不复制）

(function () {
  'use strict';

  var M = window.INTERPRETING_NOTES_METHOD || {};
  var U2 = M.demoU2 || {};
  var IMG_W = 1241, IMG_H = 1754;

  var state = {
    page: 0,
    sec: -1,        // 当前讲的段落；-1 = 还没选
    view: 'map'     // 'map' 整篇骨架 / 'sec' 某一段的笔记 + 原文
  };

  var dockApi = null;
  var pickBook = null; // mountBook 装配好后交给四原则使用

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function el(id) { return document.getElementById(id); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  // ───────────────────────── 通用零件 ─────────────────────────
  function noteLines(list) {
    return (list || []).map(function (it) {
      var lv = it.lv ? ' lv' + it.lv : '';
      return '<div class="nm-nline' + lv + '">' +
        '<span class="nm-ntree">' + esc(it.tree || '') + '</span>' +
        '<span class="nm-ntxt">' + esc(it.txt) + '</span>' +
        (it.gloss ? '<span class="nm-ngloss">' + esc(it.gloss) + '</span>' : '') +
        '</div>';
    }).join('');
  }

  function notesBox(list) {
    return '<div class="nm-notes">' + noteLines(list) + '</div>';
  }

  // 页边笔记：把等宽树形字符换成金色圆点 / 短横线，层级靠缩进和字号拉开。
  function isConnector(t) { return /^[├└│─|]+$/.test(t || ''); }
  function richTxt(txt) {
    var s = esc(txt);
    var m = s.match(/^([^：:]{1,16})([：:])/);
    return m ? '<b>' + m[1] + '</b>' + m[2] + s.slice(m[0].length) : s;
  }
  function treeHtml(list) {
    return '<div class="nm-tree">' + (list || []).map(function (it) {
      var lv = it.lv || 0;
      var t = it.tree || '';
      var mark;
      if (lv === 0) mark = '<span class="nm-t-dot"></span>';
      else if (isConnector(t)) mark = '<span class="nm-t-br">' + esc(t) + '</span>';
      else mark = '<span class="nm-t-sym">' + esc(t) + '</span>';
      return '<div class="nm-t-row lv' + lv + '">' + mark +
        '<div class="nm-t-body"><span class="nm-t-txt">' + richTxt(it.txt) + '</span>' +
        (it.gloss ? '<span class="nm-t-gl">' + esc(it.gloss) + '</span>' : '') +
        '</div></div>';
    }).join('') + '</div>';
  }

  function kvRows(list) {
    return '<div class="nm-kv">' + (list || []).map(function (r) {
      return '<div class="nm-kv-row"><span class="nm-kv-k">' + esc(r.k != null ? r.k : r.r) + '</span>' +
        '<span class="nm-kv-v">' + esc(r.d) +
        (r.ex ? '<span class="nm-kv-ex">' + esc(r.ex) + '</span>' : '') +
        '</span></div>';
    }).join('') + '</div>';
  }

  function h3(t, extra) {
    return '<h3 class="nm-h3"' + (extra ? ' ' + extra : '') + '>' + esc(t) + '</h3>';
  }

  // ───────────────────────── 顶部导航（底部 Dock）─────────────────────────
  var NAV = [
    { key: 'demo', text: '示范', label: '示范' },
    { key: 'rules', text: '四原则', label: '四原则' },
    { key: 'symbols', text: '符号表', label: '符号表' },
    { key: 'u3', text: 'U3 迁移', label: 'U3 迁移' }
  ];

  function buildDock() {
    if (!window.SeeklumeDock) return;
    dockApi = window.SeeklumeDock.mount({
      items: [{ key: 'home', text: '首页', label: '首页',
        onSelect: function () { location.href = '../index.html'; } }]
        .concat(NAV.map(function (n) {
        return {
          key: n.key, text: n.text, label: n.label,
          onSelect: function () {
            if (n.key === 'demo') {
              dockApi.setActive('demo');
              window.scrollTo({ top: 0, behavior: 'smooth' });
              return;
            }
            var t = el('nm-' + n.key);
            if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // 点了哪一项就亮哪一项，滚动后也一眼能确认 Dock 还在工作
            dockApi.setActive(n.key);
          }
        };
      })),
      active: 'demo'
    });
  }

  // ───────────────────────── 渲染 ─────────────────────────
  function renderAll() {
    var host = el('nmPanels');
    if (host) host.innerHTML = sectionRules() + sectionSymbols() + sectionU3();
    bindRules();
    mountBook();
  }

  // ===== ① 示范 · 读书模式 =====
  // 书页按原生像素铺在画布上，镜头只做平移 + 可读倍数缩放：
  // 默认落在当前页第一段，点任意一段只把镜头平移到那一段，不再把整页塞进视口。
  function mountBook() {
    var view = el('nmViewer'), stage = el('nmStage');
    var img = el('nmPageImg'), hots = el('nmHots'), side = el('nmSide');
    if (!view || !stage || !img || !side) return;

    var pagesEl = el('nmPages');
    var aside = side ? side.closest('.nm-margin') : null;

    // 页签
    pagesEl.innerHTML = (U2.pages || []).map(function (p, i) {
      return '<button type="button" data-page="' + i + '">p. ' + esc(p.print) + '</button>';
    }).join('');
    pagesEl.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (b) goPage(+b.getAttribute('data-page'));
    });

    // 页边：骨架里的分支可点、本段的「整篇骨架」可回、热区也能点
    side.addEventListener('click', function (e) {
      if (e.target.closest('[data-map]')) { showMap(); return; }
      var b = e.target.closest('[data-sec]');
      if (b) pickSec(+b.getAttribute('data-sec'));
    });
    side.addEventListener('scroll', function () {
      var rest = side.scrollHeight - side.clientHeight - side.scrollTop;
      side.classList.toggle('more', rest > 6);
    });

    // 段号条：骨架 · 1–6
    var secNav = el('nmSecNav');
    if (secNav) secNav.addEventListener('click', function (e) {
      if (e.target.closest('[data-map]')) { showMap(); return; }
      var b = e.target.closest('[data-sec]');
      if (b) pickSec(+b.getAttribute('data-sec'));
    });
    function paintSecNav() {
      if (!secNav) return;
      var out = '<button type="button" class="sk' + (state.view === 'map' ? ' on' : '') +
        '" data-map="1">骨架</button><span class="r"></span>';
      (U2.sections || []).forEach(function (s, i) {
        out += '<button type="button" data-sec="' + i + '"' +
          (state.view === 'sec' && state.sec === i ? ' class="on"' : '') + '>' + (i + 1) + '</button>';
      });
      secNav.innerHTML = out;
    }

    // ── 镜头 ──
    var cam = { z: 1, tx: 0, ty: 0 };
    var vw = 0, vh = 0;

    function measure() {
      var r = view.getBoundingClientRect();
      vw = r.width; vh = r.height;
    }
    // 一栏正文铺满视口的可读倍数（14 寸约 1.9×，1080p 约 2.2×）
    function baseZ() {
      return Math.max(1.35, Math.min(2.2, vw / 560));
    }
    function apply() {
      stage.style.transform = 'translate(' + cam.tx + 'px,' + cam.ty + 'px) scale(' + cam.z + ')';
    }
    function clamp() {
      var w = IMG_W * cam.z, h = IMG_H * cam.z;
      cam.tx = Math.min(vw * 0.6, Math.max(vw * 0.4 - w, cam.tx));
      cam.ty = Math.min(vh * 0.6, Math.max(vh * 0.12 - h, cam.ty));
    }
    var easeTimer = null;
    function move() {
      clamp(); apply();
      stage.classList.add('ease');
      clearTimeout(easeTimer);
      easeTimer = setTimeout(function () { stage.classList.remove('ease'); }, 680);
    }
    function firstOfPage() {
      var hit = -1;
      (U2.sections || []).forEach(function (s, i) { if (hit < 0 && s.page === state.page) hit = i; });
      return hit;
    }
    // 把镜头对准某一段的正文：优先用 focus（正文矩形，不含照片）。
    // 课堂投影时后排看屏幕上半部分更清楚，所以正文顶部固定在视口上方约 7%，
    // 而不是垂直居中；缩放仍按宽、高都放得下取最大值。
    function aim(f) {
      var fw = f.w * IMG_W, fh = f.h * IMG_H;
      cam.z = Math.max(0.7, Math.min(baseZ(), vw * 0.94 / fw, vh * 0.86 / fh));
      cam.tx = vw * 0.5 - (f.x + f.w / 2) * IMG_W * cam.z;
      cam.ty = vh * 0.07 - f.y * IMG_H * cam.z;
    }
    function home() {
      measure();
      var s = (U2.sections || [])[firstOfPage()];
      var h = s && (s.focus || s.hot);
      if (h) {
        aim(h);
      } else {
        cam.z = baseZ();
        cam.tx = (vw - IMG_W * cam.z) / 2;
        cam.ty = (vh - IMG_H * cam.z) / 2;
      }
      move();
    }
    function focusSec(i) {
      measure();
      var s = (U2.sections || [])[i], h = s && (s.focus || s.hot);
      if (!h) return;
      aim(h);
      move();
    }
    function wholePage() {
      measure();
      cam.z = Math.min(vw / IMG_W, vh / IMG_H) * 0.96;
      cam.tx = (vw - IMG_W * cam.z) / 2;
      cam.ty = (vh - IMG_H * cam.z) / 2;
      move();
    }

    // ── 换页 / 选段 ──
    function paintPage() {
      var p = (U2.pages || [])[state.page] || {};
      img.src = p.src || '';
      img.alt = '课本原文 p' + (p.print || '');
      hots.innerHTML = (U2.sections || []).map(function (s, i) {
        if (s.page !== state.page) return '';
        var h = s.hot || { x: 0, y: 0, w: 0, h: 0 };
        return '<button class="nm-hot" type="button" data-sec="' + i + '" aria-label="' + esc(s.label) + '" ' +
          'style="left:' + (h.x * IMG_W) + 'px;top:' + (h.y * IMG_H) + 'px;width:' + (h.w * IMG_W) + 'px;height:' + (h.h * IMG_H) + 'px"></button>';
      }).join('');
      var pno = el('nmPno'), pno2 = el('nmPno2');
      if (pno) pno.textContent = 'p. ' + (p.print || '');
      if (pno2) pno2.textContent = 'p. ' + (p.print || '');
      pagesEl.querySelectorAll('button').forEach(function (b) {
        b.classList.toggle('on', +b.getAttribute('data-page') === state.page);
      });
    }
    function renderSide() {
      var s = (U2.sections || [])[state.sec];
      if (state.view === 'sec' && s) {
        side.innerHTML = detailHtml();
        if (aside) aside.classList.add('sec-on');
      } else {
        side.innerHTML = mapHtml();
        if (aside) aside.classList.remove('sec-on');
      }
      side.scrollTop = 0;
      side.classList.toggle('more', side.scrollHeight > side.clientHeight + 4);
      paintSecNav();
    }
    function pickSec(i) {
      var s = (U2.sections || [])[i];
      if (!s) return;
      state.view = 'sec';
      if (s.page !== state.page) {
        state.page = s.page;
        state.sec = i;
        paintPage();
        renderSide();
        focusSec(i);
        return;
      }
      state.sec = i;
      renderSide();
      focusSec(i);
    }
    // 回骨架：只换右栏内容，镜头停在刚才讲的那一段，原文不丢
    function showMap() {
      if (state.view === 'map') return;
      state.view = 'map';
      renderSide();
    }
    function goPage(p) {
      if (p === state.page) return;
      state.page = p;
      state.sec = -1;
      state.view = 'map';
      paintPage();
      renderSide();
      home();
    }

    // ── 拖动 / 点段 ──
    // 书页上整片都是文字热区，所以拖动不能在热区上被拦掉：
    // 按下先记下热区，移动超过 3px 就算拖动，松开时没动才算点段。
    var dragging = false, moved = false, downHot = null, lx = 0, ly = 0;
    view.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.nm-tools')) return;
      dragging = true; moved = false; downHot = e.target.closest('.nm-hot');
      lx = e.clientX; ly = e.clientY;
      view.classList.add('dragging');
      try { view.setPointerCapture(e.pointerId); } catch (_) {}
    });
    view.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - lx, dy = e.clientY - ly;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      cam.tx += dx; cam.ty += dy;
      lx = e.clientX; ly = e.clientY;
      stage.classList.remove('ease');
      clamp(); apply();
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      view.classList.remove('dragging');
      try { view.releasePointerCapture(e.pointerId); } catch (_) {}
      if (!moved && downHot) {
        var i = +downHot.getAttribute('data-sec');
        if (!isNaN(i)) pickSec(i);
      }
      downHot = null;
    }
    view.addEventListener('pointerup', endDrag);
    view.addEventListener('pointercancel', endDrag);
    // 键盘 Enter/Space（detail === 0）也能点亮热区
    hots.addEventListener('click', function (e) {
      if (e.detail !== 0) return;
      var b = e.target.closest('[data-sec]');
      if (b) pickSec(+b.getAttribute('data-sec'));
    });

    view.addEventListener('wheel', function (e) {
      e.preventDefault();
      measure();
      var r = view.getBoundingClientRect();
      var px = e.clientX - r.left, py = e.clientY - r.top;
      var prev = cam.z;
      var minZ = Math.min(vw / IMG_W, vh / IMG_H) * 0.9;
      cam.z = Math.min(4, Math.max(minZ, cam.z * (e.deltaY < 0 ? 1.12 : 0.893)));
      if (cam.z === prev) return;
      cam.tx = px - (px - cam.tx) * (cam.z / prev);
      cam.ty = py - (py - cam.ty) * (cam.z / prev);
      stage.classList.remove('ease');
      clamp(); apply();
    }, { passive: false });

    // ── 工具 / 键盘 ──
    document.querySelectorAll('.nm-book [data-act]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        var act = b.getAttribute('data-act');
        if (act === 'whole') { wholePage(); return; }
        measure();
        var prev = cam.z;
        cam.z = Math.min(4, Math.max(0.3, act === 'in' ? cam.z * 1.25 : cam.z / 1.25));
        cam.tx = vw / 2 - (vw / 2 - cam.tx) * (cam.z / prev);
        cam.ty = vh / 2 - (vh / 2 - cam.ty) * (cam.z / prev);
        stage.classList.remove('ease');
        clamp(); apply();
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape') { wholePage(); return; }
      // 只有示范区在当前视野里时，←/→ 和 1–6 才换段，避免在下面读四原则时误切
      var book = document.querySelector('.nm-book');
      if (!book) return;
      var r = book.getBoundingClientRect();
      if (r.bottom < 80 || r.top > innerHeight) return;
      var n = (U2.sections || []).length;
      if (!n) return;
      if (e.key === 'ArrowRight' && state.sec >= 0) { e.preventDefault(); pickSec(Math.min(n - 1, state.sec + 1)); }
      else if (e.key === 'ArrowLeft' && state.sec >= 0) { e.preventDefault(); if (state.sec > 0) pickSec(state.sec - 1); else showMap(); }
      else if (/^[1-6]$/.test(e.key)) { var i = +e.key - 1; if (i < n) pickSec(i); }
    });

    var rt = null;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        if (state.sec >= 0) focusSec(state.sec); else home();
      }, 160);
    });

    // ── 起步 ──
    paintPage();
    renderSide();
    measure();
    home();

    pickBook = pickSec;
    window.__nmBook = { pick: pickSec, whole: wholePage, home: home };
  }

  // 默认视图：整篇骨架（学生第一眼看到的就是骨架本身）
  function mapHtml() {
    var sk = U2.skeleton || {};
    var lines = sk.lines || [];
    var root = lines[0] || {};
    var branches = lines.slice(1);
    return '<div class="nm-n-in">' +
      '<div class="nm-map-cap">整篇骨架<span class="r"></span><span>' + branches.length + ' 段</span></div>' +
      '<div class="nm-map">' +
        '<div class="nm-map-root"><span class="nm-map-dot"></span><div>' +
          '<div class="nm-map-root-txt">' + esc(root.txt || '') + '</div>' +
          (root.gloss ? '<div class="nm-map-root-gl">' + esc(root.gloss) + '</div>' : '') +
        '</div></div>' +
        branches.map(function (l, i) {
          if (!(U2.sections || [])[i]) return '';
          return '<button class="nm-map-branch" type="button" data-sec="' + i + '">' +
            '<span class="nm-map-dash"></span>' +
            '<span class="nm-map-name">' + esc(l.txt) + '</span>' +
            '<span class="nm-map-gl">' + esc(l.gloss || '') + '</span>' +
          '</button>';
        }).join('') +
      '</div>' +
      (sk.note ? '<p class="nm-map-note">' + esc(sk.note) + '</p>' : '') +
      '<p class="nm-map-hint">点任意一段 → 看这一段怎么记</p>' +
      '</div>';
  }

  function detailHtml() {
    var u = U2;
    var s = (u.sections || [])[state.sec];
    if (!s) return mapHtml();
    var pg = (u.pages || [])[s.page] || {};
    return '<div class="nm-n-in">' +
      '<button class="nm-back" type="button" data-map="1">← 整篇骨架</button>' +
      '<div class="nm-n-kicker" style="margin-top:10px"><span>' + pad2(state.sec + 1) + '</span><span class="r"></span>' +
        '<span>p. ' + esc(pg.print || '') + '</span></div>' +
      '<h2 class="nm-n-name">' + esc(s.label) + '</h2>' +
      '<div class="nm-n-role">' + esc(s.role || '') + '</div>' +
      (s.drill ? '<div class="nm-n-drill"><b>这一步在练</b>' + esc(s.drill) + '</div>' : '') +
      '<div class="nm-n-cap">这一段的口译笔记</div>' + treeHtml(s.notes) +
      '<div class="nm-n-cap">为什么这么切</div>' +
      '<p class="nm-n-why">' + esc(s.tip || '') + '</p>' +
      '</div>';
  }

  // ===== ② 四原则 =====
  var RULE_TARGET = [0, 1, 2, 4]; // 原则 → 示范里对应段落下标

  function sectionRules() {
    var b = M.branch || {};
    var items = b.items || [];
    return '<section class="nm-sec" id="nm-rules">' +
      '<div class="nm-sechead">' +
        '<span class="nm-stepno">②</span>' +
        '<div><h2 class="nm-h2">' + esc(b.title || '四原则') + '</h2>' +
        '<p class="nm-sub">刚才六段里用的就是这四条。点任意一条，回到书页上看它长什么样。</p></div>' +
      '</div>' +
      '<div class="nm-rules">' + items.map(function (it, i) {
        var t = RULE_TARGET[i];
        return '<button class="nm-rule" type="button" data-goto="' + t + '">' +
          '<span class="nm-rule-no">' + esc(it.no) + '</span>' +
          '<span class="nm-rule-name">' + esc(it.name) + '</span>' +
          '<span class="nm-rule-d">' + esc(it.d) + '</span>' +
          (it.bad ? '<span class="nm-rule-bad">反面：' + esc(it.bad) + '</span>' : '') +
          '<span class="nm-rule-go">看示范 · ' + esc((U2.sections[t] || {}).short || '') + ' →</span>' +
        '</button>';
      }).join('') + '</div>' +
      ((b.counter) ? '<div class="nm-callout" style="margin-top:14px"><b>' + esc(b.counter.title) + '</b><br>' + esc(b.counter.d) + '</div>' : '') +
      '<details class="nm-more"><summary>中英怎么选 · 锚句怎么挑 · 一条自检</summary>' +
        kvRows((M.lang || {}).items) +
        '<p class="nm-note">' + esc((M.lang || {}).tip || '') + '</p>' +
        kvRows((M.anchor || {}).items) +
        '<div class="nm-callout" style="margin:12px 0"><b>' + esc((M.check || {}).rule || '') + '</b></div>' +
        kvRows((M.check || {}).rows) +
        '<p class="nm-note">' + esc((M.check || {}).tip || '') + '</p>' +
      '</details>' +
      '<details class="nm-more"><summary>四条线路的通用模具</summary>' +
        '<p class="nm-note">' + esc((U2.mold || {}).lead || '') + '</p>' +
        '<div class="nm-table-wrap"><table class="nm-table">' +
        '<thead><tr>' + (((U2.mold || {}).cols) || []).map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead>' +
        '<tbody>' + ((((U2.mold || {}).rows) || []).map(function (r) {
          return '<tr>' + r.cells.map(function (c, i) {
            return i === 0 ? '<td style="font-weight:700">' + esc(c) + '</td>' : '<td>' + esc(c) + '</td>';
          }).join('') + '</tr>';
        }).join('')) + '</tbody></table></div>' +
      '</details>' +
      '</section>';
  }

  function bindRules() {
    document.querySelectorAll('.nm-rule').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (pickBook) pickBook(+btn.getAttribute('data-goto'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  // ===== ③ 符号表 =====
  function sectionSymbols() {
    var s = M.symbols || {};
    var ab = s.abbr || {};
    return '<section class="nm-sec" id="nm-symbols">' +
      '<div class="nm-sechead">' +
        '<span class="nm-stepno">③</span>' +
        '<div><h2 class="nm-h2">符号表</h2>' +
        '<p class="nm-sub">抄到笔记本第一页，之后每篇都只用这一套。</p></div>' +
      '</div>' +
      '<details class="nm-more" open>' +
        '<summary>符号与缩写</summary>' +
        '<div class="nm-table-wrap"><table class="nm-table">' +
        '<thead><tr>' + ((s.cols) || []).map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead>' +
        '<tbody>' + ((s.rows) || []).map(function (r) {
          return '<tr><td class="nm-sym">' + esc(r.sym) + '</td><td>' + esc(r.mean) + '</td>' +
            '<td class="nm-exm">' + esc(r.ex) + '</td></tr>';
        }).join('') + '</tbody></table></div>' +
        h3(ab.title || '缩写规则') +
        '<ul class="nm-steps">' + ((ab.items) || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
        '<div class="nm-callout" style="margin-top:14px">同一篇里自己定、定了就不改。<b>符号的价值不在于标准，在于「看到就想起」</b>。</div>' +
      '</details>' +
      '</section>';
  }

  // ===== ④ U3 迁移 =====
  function u3Note() {
    var all = window.TEXTBOOK_READING_NOTES || {};
    var key = (M.demoU3 || {}).readingKey || '必修一|U3|RT';
    return all[key] || null;
  }

  function sectionU3() {
    var u = M.demoU3 || {};
    var up = u.upgrade || {};
    var fl = u.flaw || {};
    var note = u3Note();

    var ready;
    if (note && note.sections) {
      ready = '<div class="nm-pairs">' + note.sections.map(function (s) {
        return '<div class="nm-pair">' +
          '<div class="nm-pair-head">' +
            '<span class="nm-pair-name">' + esc(s.label) + '</span>' +
            '<span class="nm-pair-role">' + esc(s.role || '') + '</span>' +
          '</div>' +
          '<div class="nm-pair-body" style="grid-template-columns:1fr">' +
            '<div class="nm-pair-col">' + notesBox(s.notes) + '</div>' +
          '</div>' +
        '</div>';
      }).join('') + '</div>';
    } else {
      ready = '<div class="nm-empty">还没有 U3 的成品笔记数据。</div>';
    }

    return '<section class="nm-sec" id="nm-u3">' +
      '<div class="nm-sechead">' +
        '<span class="nm-stepno">④</span>' +
        '<div><h2 class="nm-h2">U3 迁移 · ' + esc(u.title || '') + '</h2>' +
        '<p class="nm-sub">换一篇，学生自己写；写完来这里对答案。</p></div>' +
      '</div>' +
      '<p class="nm-lead">' + esc(u.lead || '') + '</p>' +
      h3(up.title || '结构升级') +
      kvRows(up.rows) +
      '<details class="nm-more"><summary>整篇骨架</summary>' +
        notesBox((u.skeleton || {}).lines) +
        '<p class="nm-note">' + esc((u.skeleton || {}).note || '') + '</p>' +
      '</details>' +
      h3('成品笔记（对照用）') +
      ready +
      h3(fl.title || '一处真实的缺陷') +
      '<p class="nm-lead">' + esc(fl.desc || '') + '</p>' +
      '<div class="nm-flaw">' +
        '<div class="nm-flaw-col bad"><div class="nm-flaw-cap">' + esc(fl.beforeTitle || '') + '</div>' +
          '<pre class="nm-code">' + esc((fl.before || []).join('\n')) + '</pre></div>' +
        '<div class="nm-flaw-col good"><div class="nm-flaw-cap">' + esc(fl.afterTitle || '') + '</div>' +
          '<pre class="nm-code">' + esc((fl.after || []).join('\n')) + '</pre></div>' +
      '</div>' +
      (fl.tip ? '<div class="nm-callout" style="margin-top:14px">' + esc(fl.tip) + '</div>' : '') +
      h3(((u.class || {}).title) || '课堂动作') +
      '<ol class="nm-steps">' + (((u.class || {}).steps) || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ol>' +
      '</section>';
  }

  // ───────────────────────── 启动 ─────────────────────────
  function renderHero() {
    var k = el('nmKicker'), t = el('nmTitle');
    if (k) k.textContent = M.kicker || '跨单元 · 方法';
    if (t) t.textContent = M.title || '口译笔记法';
  }

  function init() {
    renderHero();
    renderAll();
    buildDock();

    window.NotesMethod = {
      state: state,
      pick: function (i) { if (pickBook) pickBook(i); },
      getNote: u3Note
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
