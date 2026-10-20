// docs/methods/notes-method.js
//
// 口译笔记法（跨单元方法模块）· 页面逻辑
//
// 页面(index.html)只给外壳与样式；本文件负责：
//   · 渲染装饰墙入口 + 展开式面板（原理 / 怎么切 / 符号表 / U2 示范 / U3 迁移）
//   · U2 示范里的「可交互课本」：双页切换 + 滚轮缩放 + 拖动平移 + 点热区定位
//   · 点段落 → 右栏同时给「口译笔记」与「原文锚句」两栏
//
// 数据来源：docs/data/interpreting_notes_method.js（方法层）
//           docs/data/textbook_reading_notes.js（U3 成品笔记，单一来源，不复制）

(function () {
  'use strict';

  var M = window.INTERPRETING_NOTES_METHOD || {};
  var U2 = M.demoU2 || {};
  var MARKS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'];

  var state = {
    open: 'u2', // 默认直接进示范：先看怎么记，规则后置为附录
    page: 0,    // 课本页签（0 = 第一页）
    sec: 0      // 默认就停在 ①，一进页面就有原截图和示范
  };

  var dockApi = null;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function el(id) { return document.getElementById(id); }

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

  function kvRows(list) {
    return '<div class="nm-kv">' + (list || []).map(function (r) {
      return '<div class="nm-kv-row"><span class="nm-kv-k">' + esc(r.k != null ? r.k : r.r) + '</span>' +
        '<span class="nm-kv-v">' + esc(r.d) +
        (r.ex ? '<span class="nm-kv-ex">' + esc(r.ex) + '</span>' : '') +
        '</span></div>';
    }).join('') + '</div>';
  }

  function h3(t) { return '<h3 class="nm-h3">' + esc(t) + '</h3>'; }

  function panelOpen(icon, title, kicker) {
    return '<div class="nm-panel-head"><h2>' + esc(icon + ' ' + title) + '</h2>' +
      '<span class="nm-kicker">' + esc(kicker || '') + '</span></div>';
  }

  // ───────────────────────── 装饰墙 ─────────────────────────
  function tiles() {
    return [
      { key: 'u2', icon: '📖', label: 'U2 示范', sub: '从课本原页开始 · 六段一段一段写给你看', tone: 'green' },
      { key: 'u3', icon: '↗️', label: 'U3 迁移', sub: '学生自己写 · 一处真缺陷当教材', tone: 'coral' },
      { key: 'why', icon: '🧭', label: '原理', sub: '附录 · 三条铁律（走到再看）', tone: 'ink' },
      { key: 'how', icon: '✂️', label: '怎么切', sub: '附录 · 分叉四原则 · 中英选择 · 锚句', tone: 'blue' },
      { key: 'symbols', icon: '⌨️', label: '符号表', sub: '附录 · 符号与缩写（抄到笔记本第一页）', tone: 'purple' }
    ];
  }

  function renderWall() {
    var wall = el('nmWall');
    if (!wall) return;
    wall.innerHTML = tiles().map(function (t) {
      return '<button class="nm-tile tone-' + t.tone + (state.open === t.key ? ' active' : '') +
        '" data-panel="' + t.key + '">' +
        '<span class="nm-tile-ico">' + t.icon + '</span>' +
        '<span class="nm-tile-label">' + esc(t.label) + '</span>' +
        '<span class="nm-tile-sub">' + esc(t.sub) + '</span>' +
        '<span class="nm-tile-arrow">→</span>' +
        '</button>';
    }).join('');
    wall.querySelectorAll('.nm-tile').forEach(function (btn) {
      btn.addEventListener('click', function () { togglePanel(btn.getAttribute('data-panel')); });
    });
  }

  function resetReader() {
    state.page = 0;
    state.sec = -1;
  }

  function togglePanel(key) {
    state.open = (state.open === key) ? '' : key;
    resetReader();
    renderWall();
    renderPanels();
    syncDock();
  }

  function openFromDock(key) {
    state.open = (state.open === key) ? '' : key;
    resetReader();
    renderWall();
    renderPanels();
    syncDock();
    var host = el('nmPanels');
    if (host && state.open) host.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function syncDock() { if (dockApi) dockApi.setActive(state.open); }

  function buildDock() {
    if (!window.SeeklumeDock) return;
    dockApi = window.SeeklumeDock.mount({
      back: {
        label: '返回首页',
        onClick: function () {
          if (state.open) { togglePanel(state.open); return; }
          location.href = '../index.html';
        }
      },
      home: '../index.html',
      items: tiles().map(function (t) {
        return {
          key: t.key, icon: t.icon, label: t.label,
          onSelect: function () { openFromDock(t.key); }
        };
      }),
      active: state.open
    });
  }

  // ───────────────────────── 面板渲染 ─────────────────────────
  function renderPanels() {
    var host = el('nmPanels');
    if (!host) return;
    if (!state.open) {
      host.innerHTML = '<div class="nm-hint">↑ 点上面的入口，展开要看的内容。这是「装饰墙」——入口都在墙上，点开才铺开。</div>';
      return;
    }
    var html = {
      why: panelWhy,
      how: panelHow,
      symbols: panelSymbols,
      u2: panelU2,
      u3: panelU3
    }[state.open];
    host.innerHTML = html ? html() : '';
    if (state.open === 'u2') mountReader();
  }

  // ===== 1 原理 =====
  function panelWhy() {
    return '<section class="nm-panel">' +
      panelOpen('🧭', '原理', '为什么这套笔记能帮学生背下课文') +

      '<div class="nm-stance">' +
        '<p class="nm-stance-big">' + esc((M.stance || {}).big || '') + '</p>' +
        '<p class="nm-stance-small">' + esc((M.stance || {}).small || '') + '</p>' +
      '</div>' +

      h3('三条铁律（写笔记时的硬规矩）') +
      '<div class="nm-cards">' + (M.rules || []).map(function (r) {
        return '<div class="nm-card">' +
          '<span class="nm-card-no">' + esc(r.no) + '</span>' +
          '<span class="nm-card-name">' + esc(r.name) + '</span>' +
          '<span class="nm-card-en">' + esc(r.en) + '</span>' +
          '<span class="nm-card-d">' + esc(r.d) + '</span>' +
          (r.bad ? '<span class="nm-card-bad"><b>反面：</b>' + esc(r.bad) + '</span>' : '') +
          '</div>';
      }).join('') + '</div>' +

      h3('一条自检判据（检查学生笔记的唯一标准）') +
      '<div class="nm-callout green"><b>' + esc((M.check || {}).rule || '') + '</b></div>' +
      '<div style="margin-top:12px">' + kvRows(M.check && M.check.rows) + '</div>' +
      '<p class="nm-note">' + esc((M.check || {}).tip || '') + '</p>' +
      '</section>';
  }

  // ===== 2 怎么切 =====
  function panelHow() {
    var b = M.branch || {};
    var lang = M.lang || {};
    var an = M.anchor || {};
    var tp = M.template || {};

    return '<section class="nm-panel">' +
      panelOpen('✂️', '怎么切', '分叉 · 中英选择 · 锚句') +

      h3((b.title || '') + '') +
      '<div class="nm-cards">' + (b.items || []).map(function (it) {
        return '<div class="nm-card">' +
          '<span class="nm-card-no">' + esc(it.no) + '</span>' +
          '<span class="nm-card-name">' + esc(it.name) + '</span>' +
          '<span class="nm-card-d">' + esc(it.d) + '</span>' +
          (it.bad ? '<span class="nm-card-bad"><b>反面：</b>' + esc(it.bad) + '</span>' : '') +
          '</div>';
      }).join('') + '</div>' +
      ((b.counter)
        ? '<div class="nm-callout" style="margin-top:14px"><b>' + esc(b.counter.title) + '</b><br>' + esc(b.counter.d) + '</div>'
        : '') +

      h3(lang.title || '') +
      kvRows(lang.items) +
      (lang.tip ? '<p class="nm-note">' + esc(lang.tip) + '</p>' : '') +

      h3(an.title || '') +
      kvRows(an.items) +
      ((an.vs)
        ? '<div class="nm-vs" style="margin-top:14px">' +
          '<div class="nm-flaw-cap">' + esc(an.vs.title) + '</div>' +
          '<div class="nm-table-wrap"><table class="nm-table"><tbody>' +
          an.vs.rows.map(function (r) {
            return '<tr><th style="width:96px">' + esc(r.k) + '</th><td>' + esc(r.d) + '</td></tr>';
          }).join('') +
          '</tbody></table></div></div>'
        : '') +

      h3(tp.title || '') +
      '<div class="nm-pair">' +
        '<div class="nm-pair-body">' +
          '<div class="nm-pair-col">' +
            '<div class="nm-pair-cap">' + esc(tp.left || '') + '</div>' +
            '<pre class="nm-code">● ' + esc('段名 · 骨架') + '\n├ …（→ ∵ ∴ ≠ ↑ ↓）\n└ …</pre>' +
          '</div>' +
          '<div class="nm-pair-col">' +
            '<div class="nm-pair-cap">' + esc(tp.right || '') + '</div>' +
            '<pre class="nm-code">' + esc('…（原文里那句要背的）') + '\n' + esc('…') + '</pre>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<p class="nm-note">' + esc(tp.howto || '') + '</p>' +
      '</section>';
  }

  // ===== 3 符号表 =====
  function panelSymbols() {
    var s = M.symbols || {};
    var ab = s.abbr || {};
    return '<section class="nm-panel">' +
      panelOpen('⌨️', '符号表', '抄到笔记本第一页，之后每次记笔记都只用这一套') +
      '<div class="nm-table-wrap"><table class="nm-table">' +
      '<thead><tr>' + (s.cols || []).map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead>' +
      '<tbody>' + (s.rows || []).map(function (r) {
        return '<tr><td class="nm-sym">' + esc(r.sym) + '</td><td>' + esc(r.mean) + '</td>' +
          '<td class="nm-exm">' + esc(r.ex) + '</td></tr>';
      }).join('') + '</tbody></table></div>' +

      h3(ab.title || '缩写规则') +
      '<ul class="nm-steps">' + (ab.items || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +

      '<div class="nm-callout" style="margin-top:16px">' +
        '同一篇里自己定、定了就不改。<b>符号的价值不在于标准，在于「看到就想起」</b>——学生自己定的符号，往往比老师给的记得牢。' +
      '</div>' +
      '</section>';
  }

  // ===== 4 U2 示范（可交互课本）=====
  function panelU2() {
    var u = U2;
    var pages = u.pages || [];
    var secsOnPage = [];
    (u.sections || []).forEach(function (s, i) { if (s.page === state.page) secsOnPage.push(i); });

    var pageTabs = pages.map(function (p, i) {
      return '<button type="button" class="' + (state.page === i ? 'on' : '') + '" data-page="' + i + '">课本 p' + p.print + '</button>';
    }).join('');

    var cur = pages[state.page] || {};
    var hots = secsOnPage.map(function (i) {
      var s = u.sections[i];
      var h = s.hot || { x: 0, y: 0, w: 0, h: 0 };
      return '<button class="nm-hot" type="button" data-sec="' + i + '" title="' + esc(s.label) + '" ' +
        'style="left:' + (h.x * 100) + '%;top:' + (h.y * 100) + '%;width:' + (h.w * 100) + '%;height:' + (h.h * 100) + '%">' +
        '<span class="nm-hot-no">' + (MARKS[i] || (i + 1)) + '</span></button>';
    }).join('');

    var list = (u.sections || []).map(function (s, i) {
      return '<button class="nm-sec-btn' + (state.sec === i ? ' active' : '') + '" type="button" data-sec="' + i + '">' +
        '<span class="nm-sec-no">' + (MARKS[i] || (i + 1)) + '</span>' +
        '<span class="nm-sec-txt"><span class="nm-sec-name">' + esc(s.label) + '</span>' +
        '<span class="nm-sec-role">' + esc(s.role) + '</span></span>' +
        '<span class="nm-sec-pg">p' + esc((u.pages[s.page] || {}).print || '') + '</span>' +
        '</button>';
    }).join('');

    return '<section class="nm-panel">' +
      panelOpen('📖', 'U2 示范 · ' + (u.title || ''), '必修一 · U2 Reading and Thinking · 课本 p' + ((u.source || {}).print || '')) +
      '<p class="nm-lead">' + esc(u.lead || '') + '</p>' +

      h3((u.skeleton || {}).title || '全文骨架') +
      notesBox((u.skeleton || {}).lines) +
      '<p class="nm-note">' + esc((u.skeleton || {}).note || '') + '</p>' +

      h3('第一步 · 看整页，再点开一段') +
      '<p class="nm-note" style="margin-top:0;margin-bottom:12px">左边是课本原页。点图上 ①–⑥ 的色块（或右侧条目），图会自动放大到那一段，右边同时给出这一段的本段原截图 + 这份笔记。滚轮缩放、拖动平移。</p>' +
      '<div class="nm-tabs">' + pageTabs + '</div>' +
      '<div class="nm-reader">' +
        '<div class="nm-viewer" id="nmViewer">' +
          '<div class="nm-stage" id="nmStage">' +
            '<img class="nm-page" src="' + esc(cur.src || '') + '" alt="课本原文整页 p' + esc(cur.print || '') + '" draggable="false">' +
            hots +
          '</div>' +
          '<div class="nm-tools">' +
            '<button type="button" data-act="out" title="缩小">−</button>' +
            '<button type="button" data-act="in" title="放大">＋</button>' +
            '<button type="button" data-act="reset" title="复位">⟲</button>' +
          '</div>' +
        '</div>' +
        '<aside class="nm-side">' +
          '<div class="nm-seclist">' + list + '</div>' +
          '<div class="nm-detail" id="nmDetail">' + detailHtml() + '</div>' +
        '</aside>' +
      '</div>' +

      h3('逐块对照 · 一屏看全（左：笔记 / 右：课本原截图 + 锚句）') +
      '<p class="nm-note" style="margin-top:0;margin-bottom:12px">学生手上拿的就是这两栏：先默写左栏，再对着右边的原截图把整句补齐——这一步就是从「记意」到「背原文」的桥。</p>' +
      pairHtml() +

      h3(((u.mold || {}).title) || '') +
      '<p class="nm-lead">' + esc((u.mold || {}).lead || '') + '</p>' +
      '<div class="nm-table-wrap"><table class="nm-table">' +
      '<thead><tr>' + ((u.mold || {}).cols || []).map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead>' +
      '<tbody>' + (((u.mold || {}).rows) || []).map(function (r) {
        return '<tr>' + r.cells.map(function (c, i) {
          return i === 0 ? '<td style="font-weight:700">' + esc(c) + '</td>' : '<td>' + esc(c) + '</td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody></table></div>' +
      ((u.mold || {}).found ? '<div class="nm-callout" style="margin-top:14px">' + esc(u.mold.found) + '</div>' : '') +
      ((u.mold || {}).ask ? '<div class="nm-callout green" style="margin-top:12px">' + esc(u.mold.ask) + '</div>' : '') +

      h3(((u.class || {}).title) || '课堂动作') +
      '<ol class="nm-steps">' + (((u.class || {}).steps) || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ol>' +
      '</section>';
  }

  function detailHtml() {
    var u = U2;
    if (state.sec < 0 || !(u.sections || [])[state.sec]) {
      return '<div class="nm-note" style="margin:0">↑ 还没选段。点图上彩色区块，或点上面的条目。</div>';
    }
    var s = u.sections[state.sec];
    var anchors = (s.anchors || []).map(function (a) {
      return '<div class="nm-detail-anchor"><p class="nm-anchor">' + esc(a) + '</p></div>';
    }).join('');
    var shot = s.shot
      ? '<img class="nm-shot" src="' + esc(s.shot) + '" alt="' + esc(s.label) + ' 课本原截图" loading="lazy">'
      : '';

    return '' +
      '<div class="nm-detail-name">' + esc((MARKS[state.sec] || '') + ' ' + s.label) + '</div>' +
      '<div class="nm-detail-role">' + esc(s.role || '') + '</div>' +
      shot +
      (s.tip ? '<div class="nm-tip"><b>边做边说</b>' + esc(s.tip) + '</div>' : '') +
      '<p class="nm-detail-gist">' + esc(s.gist || '') + '</p>' +
      anchors +
      '<details class="nm-more"><summary>对不上时，展开整段原文</summary>' +
        '<p class="en">' + esc(s.en || '') + '</p></details>' +
      '<details class="nm-more"><summary>展开译文对照</summary>' +
        '<p>' + esc(s.zh || '') + '</p></details>';
  }

  // 「口译笔记 / 原文锚句」双栏（挂在图下方，供课堂讲解）
  function pairHtml() {
    var u = U2;
    return '<div class="nm-pairs">' + (u.sections || []).map(function (s, i) {
      var anchors = (s.anchors || []).map(function (a) {
        return '<p class="nm-anchor">' + esc(a) + '</p>';
      }).join('');
      return '<div class="nm-pair">' +
        '<div class="nm-pair-head">' +
          '<span class="nm-pair-no">' + (MARKS[i] || (i + 1)) + '</span>' +
          '<span class="nm-pair-name">' + esc(s.label) + '</span>' +
          '<span class="nm-pair-role">' + esc(s.role || '') + '</span>' +
        '</div>' +
        '<div class="nm-pair-body">' +
          '<div class="nm-pair-col">' +
            '<div class="nm-pair-cap">口译笔记（学生要会自己写出来的）</div>' +
            '<div class="nm-notes" style="background:transparent;border:0;padding:0">' + noteLines(s.notes) + '</div>' +
          '</div>' +
          '<div class="nm-pair-col">' +
            '<div class="nm-pair-cap">课本原截图（学生对着找锚句）</div>' +
            (s.shot ? '<img class="nm-shot" src="' + esc(s.shot) + '" alt="' + esc(s.label) + ' 课本原截图" loading="lazy">' : '') +
            anchors +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('') + '</div>';
  }

  // ===== 5 U3 迁移 =====
  function u3Note() {
    var all = window.TEXTBOOK_READING_NOTES || {};
    var key = (M.demoU3 || {}).readingKey || '必修一|U3|RT';
    return all[key] || null;
  }

  function panelU3() {
    var u = M.demoU3 || {};
    var up = u.upgrade || {};
    var fl = u.flaw || {};
    var note = u3Note();

    var ready;
    if (note && note.sections) {
      ready = '<div class="nm-pairs">' + note.sections.map(function (s, i) {
        return '<div class="nm-pair">' +
          '<div class="nm-pair-head">' +
            '<span class="nm-pair-no">' + (MARKS[i] || (i + 1)) + '</span>' +
            '<span class="nm-pair-name">' + esc(s.label) + '</span>' +
            '<span class="nm-pair-role">' + esc(s.role || '') + '</span>' +
          '</div>' +
          '<div class="nm-pair-body" style="grid-template-columns:1fr">' +
            '<div class="nm-pair-col">' + notesBox(s.notes) + '</div>' +
          '</div>' +
        '</div>';
      }).join('') + '</div>' +
      '<p class="nm-note">这份成品笔记与「阅读课 → 结构」面板同源，学生写完后来这里对答案。</p>';
    } else {
      ready = '<div class="nm-empty">还没有 U3 的成品笔记数据。</div>';
    }

    return '<section class="nm-panel">' +
      panelOpen('↗️', 'U3 迁移 · ' + (u.title || ''), '必修一 · U3 Reading and Thinking · 课本 p' + ((u.source || {}).print || '')) +
      '<p class="nm-lead">' + esc(u.lead || '') + '</p>' +

      h3(up.title || '结构升级') +
      kvRows(up.rows) +

      h3((u.skeleton || {}).title || '全文骨架') +
      notesBox((u.skeleton || {}).lines) +
      '<p class="nm-note">' + esc((u.skeleton || {}).note || '') + '</p>' +

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

  // ───────────────────────── 可交互课本 · 装配 ─────────────────────────
  function mountReader() {
    var u = U2;
    var viewer = el('nmViewer');
    var stage = el('nmStage');
    if (!viewer || !stage) return;

    var vw = 0, vh = 0, s = 1, tx = 0, ty = 0;
    var minS = 1, maxS = 4;

    function measure() { var r = viewer.getBoundingClientRect(); vw = r.width; vh = r.height; }
    function clampT() {
      tx = Math.min(0, Math.max(vw - s * vw, tx));
      ty = Math.min(0, Math.max(vh - s * vh, ty));
    }
    function apply() {
      clampT();
      stage.style.transformOrigin = '0 0';
      stage.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + s + ')';
    }
    function reset(animate) {
      measure();
      s = 1; tx = 0; ty = 0;
      stage.style.transition = animate ? 'transform .35s ease' : 'none';
      apply();
    }
    function focusSec(i, animate) {
      measure();
      var sec = (u.sections || [])[i];
      var h = sec && sec.hot;
      if (!h || !vw) return;
      s = Math.min(maxS, Math.max(1.25, 0.72 / h.w));
      var cx = (h.x + h.w / 2) * vw;
      var cy = (h.y + h.h / 2) * vh;
      tx = vw / 2 - s * cx;
      ty = vh / 2 - s * cy;
      stage.style.transition = animate ? 'transform .45s cubic-bezier(.16,1,.3,1)' : 'none';
      apply();
    }
    function paintSelection() {
      viewer.querySelectorAll('.nm-hot').forEach(function (b) {
        b.classList.toggle('active', +b.getAttribute('data-sec') === state.sec);
      });
      document.querySelectorAll('.nm-sec-btn').forEach(function (b) {
        b.classList.toggle('active', +b.getAttribute('data-sec') === state.sec);
      });
      var detail = el('nmDetail');
      if (detail) detail.innerHTML = detailHtml();
    }

    window.addEventListener('nm-theme-change', function () {
      if (state.open === 'u2') { measure(); apply(); }
    });

    var dragging = false, lx = 0, ly = 0;
    viewer.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.nm-hot') || e.target.closest('.nm-tools')) return;
      dragging = true; lx = e.clientX; ly = e.clientY;
      viewer.classList.add('grabbing');
    });
    viewer.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      tx += e.clientX - lx; ty += e.clientY - ly;
      lx = e.clientX; ly = e.clientY;
      stage.style.transition = 'none';
      apply();
      e.preventDefault();
    });
    viewer.addEventListener('pointerup', function () {
      dragging = false;
      viewer.classList.remove('grabbing');
    });
    viewer.addEventListener('pointercancel', function () {
      dragging = false;
      viewer.classList.remove('grabbing');
    });

    viewer.addEventListener('wheel', function (e) {
      e.preventDefault();
      measure();
      var r = viewer.getBoundingClientRect();
      var px = e.clientX - r.left, py = e.clientY - r.top;
      var prev = s;
      s = Math.min(maxS, Math.max(minS, s * (e.deltaY < 0 ? 1.12 : 0.893)));
      if (s === prev) return;
      tx = px - (px - tx) * (s / prev);
      ty = py - (py - ty) * (s / prev);
      stage.style.transition = 'none';
      apply();
    }, { passive: false });

    // 图上的热区
    viewer.querySelectorAll('.nm-hot').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        pickSec(+b.getAttribute('data-sec'));
      });
    });
    // 右侧条目
    document.querySelectorAll('.nm-sec-btn').forEach(function (b) {
      b.addEventListener('click', function () { pickSec(+b.getAttribute('data-sec')); });
    });
    // 页签
    document.querySelectorAll('.nm-tabs button').forEach(function (b) {
      b.addEventListener('click', function () { setPage(+b.getAttribute('data-page')); });
    });
    // 工具
    viewer.querySelectorAll('.nm-tools button').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        var act = b.getAttribute('data-act');
        measure();
        if (act === 'in') s = Math.min(maxS, s * 1.35);
        else if (act === 'out') s = Math.max(minS, s / 1.35);
        else { reset(true); return; }
        stage.style.transition = 'transform .2s ease';
        apply();
      });
    });

    // 供 pickSec 复用：选中后把图放大到该段
    window.__nmReader = {
      focus: function (i) { focusSec(i, true); },
      reset: reset
    };

    // 初始：按当前选中段落定位；没选就复位
    if (state.sec >= 0 && (u.sections[state.sec] || {}).page === state.page) focusSec(state.sec, false);
    else reset(false);
  }

  // 选中某一段：跨页时先换页并整块重绘，再定位
  function pickSec(i) {
    var u = U2;
    var sec = (u.sections || [])[i];
    if (!sec) return;
    if (sec.page !== state.page) {
      state.page = sec.page;
      state.sec = i;
      renderPanels();
      mountReader();
      return;
    }
    state.sec = i;
    var viewer = el('nmViewer');
    if (viewer) {
      viewer.querySelectorAll('.nm-hot').forEach(function (b) {
        b.classList.toggle('active', +b.getAttribute('data-sec') === i);
      });
      document.querySelectorAll('.nm-sec-btn').forEach(function (b) {
        b.classList.toggle('active', +b.getAttribute('data-sec') === i);
      });
      var detail = el('nmDetail');
      if (detail) detail.innerHTML = detailHtml();
    }
    // 缩放交给 mountReader 里的闭包
    var api = window.__nmReader;
    if (api) api.focus(i);
  }

  function setPage(p) {
    var u = U2;
    if (p === state.page) return;
    var keep = (state.sec >= 0 && (u.sections[state.sec] || {}).page === p) ? state.sec : -1;
    state.page = p;
    state.sec = keep;
    renderPanels();
    mountReader();
  }

  // ───────────────────────── 启动 ─────────────────────────
  function renderHero() {
    var k = el('nmKicker'), t = el('nmTitle'), sub = el('nmSub'), lead = el('nmLead');
    if (k) k.textContent = M.kicker || '';
    if (t) t.textContent = M.title || '';
    if (sub) sub.textContent = M.sub || '';
    if (lead) lead.textContent = M.lead || '';
  }

  function init() {
    renderHero();
    renderWall();
    renderPanels();
    buildDock();

    // 供页面内其它按钮跳段使用（也便于控制台调试）
    window.NotesMethod = {
      state: state,
      open: function (key) { if (state.open !== key) togglePanel(key); },
      pick: pickSec,
      getNote: u3Note
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
