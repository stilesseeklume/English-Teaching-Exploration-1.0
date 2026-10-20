// docs/reading/app.js
//
// 阅读课 · 页面逻辑
//
// 页面(index.html)只提供外壳与样式；本文件负责：
//   · 从数据层取当前篇目（?k=册|单元|类型，默认 必修一|U3|RT）
//   · 渲染装饰墙入口 + 展开式面板（原文 / 文章大意 / 思维导图 / 背诵）
//   · 复用 ReadingMindmap 画导图
//
// 变更记录：3D 场景（scene3d.js）经教师评估「没有意义」已下架；
//          原文面板改为「可交互原书图」——滚轮缩放 / 拖动平移 / 点热区定位。

(function () {
  'use strict';

  var DEFAULT_KEY = '必修一|U3|RT';

  var state = {
    key: DEFAULT_KEY,
    note: null,
    open: '',        // 当前展开的面板 key
    reader: null,    // 原文阅读器视图状态
    mindView: 'map', // 结构面板：视图（map 导图 / notes 笔记）
    mindSec: -1      // 结构面板：当前钻进的段落（-1 = 整篇）
  };

  var dockApi = null; // 底部 Dock 实例（docs/shared/ui/dock.js）

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function el(id) { return document.getElementById(id); }

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function palette() {
    if (isDark()) {
      return {
        center: '#3a3a3c', centerText: '#ffffff',
        pointFill: '#2c2c2e', pointStroke: 'rgba(255,255,255,.10)',
        pointText: '#e5e5ea', line: 'rgba(255,255,255,.20)'
      };
    }
    return {
      center: '#1d1d1f', centerText: '#ffffff',
      pointFill: '#ffffff', pointStroke: 'rgba(0,0,0,.08)',
      pointText: '#3a3a3c', line: 'rgba(0,0,0,.16)'
    };
  }

  function resolveNote() {
    var params = new URLSearchParams(location.search);
    var key = params.get('k') || DEFAULT_KEY;
    var all = window.TEXTBOOK_READING_NOTES || {};
    return { key: key, note: all[key] || all[DEFAULT_KEY] || null };
  }

  // ───────────────────────── 装饰墙入口 ─────────────────────────
  function wallTiles() {
    return [
      { key: 'article', icon: '📖', label: '原文', sub: '可交互原书图 · 缩放 / 平移 / 点段定位', tone: 'ink' },
      { key: 'idea', icon: '💡', label: '理解', sub: '问题链 · 作者为什么这么写', tone: 'blue' },
      { key: 'mind', icon: '🧠', label: '结构', sub: '提纲 · 导图 / 笔记两种摆法', tone: 'purple' },
      { key: 'recite', icon: '🗣️', label: '背诵', sub: '金句 · 短语 · 记忆抓手', tone: 'green' }
    ];
  }

  function renderWall() {
    var wall = el('rcWall');
    if (!wall) return;
    wall.innerHTML = wallTiles().map(function (t) {
      return '' +
        '<button class="rc-tile tone-' + t.tone + (state.open === t.key ? ' active' : '') +
        '" data-panel="' + t.key + '">' +
        '<span class="rc-tile-ico">' + t.icon + '</span>' +
        '<span class="rc-tile-label">' + esc(t.label) + '</span>' +
        '<span class="rc-tile-sub">' + esc(t.sub) + '</span>' +
        '<span class="rc-tile-arrow">→</span>' +
        '</button>';
    }).join('');
    wall.querySelectorAll('.rc-tile').forEach(function (btn) {
      btn.addEventListener('click', function () { togglePanel(btn.getAttribute('data-panel')); });
    });
  }

  function togglePanel(key) {
    state.open = (state.open === key) ? '' : key;
    state.reader = null;
    state.mindView = 'map';
    state.mindSec = -1;
    renderWall();
    renderPanels();
    syncDock();
  }

  // Dock 点面板入口：打开 / 收起，并滚到面板位置（页内快捷切换）
  function openFromDock(key) {
    state.open = (state.open === key) ? '' : key;
    state.reader = null;
    state.mindView = 'map';
    state.mindSec = -1;
    renderWall();
    renderPanels();
    syncDock();
    var host = el('rcPanels');
    if (host && state.open) host.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function syncDock() {
    if (dockApi) dockApi.setActive(state.open);
  }

  function buildDock() {
    if (!window.SeeklumeDock) return;
    dockApi = window.SeeklumeDock.mount({
      back: {
        label: '返回上一页',
        onClick: function () {
          if (state.open) { togglePanel(state.open); return; }
          if (window.history.length > 1) window.history.back();
          else location.href = '../index.html';
        }
      },
      home: '../index.html',
      items: wallTiles().map(function (t) {
        return {
          key: t.key,
          icon: t.icon,
          label: t.label,
          onSelect: function () { openFromDock(t.key); }
        };
      }),
      active: state.open
    });
  }

  // ───────────────────────── 面板渲染 ─────────────────────────
  function renderPanels() {
    var host = el('rcPanels');
    if (!host) return;
    var note = state.note;
    if (!note) {
      host.innerHTML = '<div class="rc-empty">还没有这篇的阅读数据。</div>';
      return;
    }
    if (!state.open) {
      host.innerHTML = '<div class="rc-hint">↑ 点上面的入口，展开要看的内容。这是「装饰墙」——入口都在墙上，点开才铺开。</div>';
      return;
    }
    var html = {
      article: panelArticle(note),
      idea: panelUnderstand(note),
      mind: panelStruct(note),
      recite: panelRecite(note)
    }[state.open] || '';
    host.innerHTML = html;

    if (state.open === 'mind') { bindStruct(); mountStruct(); }
    if (state.open === 'article') mountReader();
  }

  // ===== 原文（可交互原书图）=====
  function panelArticle(n) {
    var pageImg = '../assets/textbook/bx1/u3-rt-p38-page.webp';
    var hots = n.sections.map(function (s, i) {
      var h = s.hot || { x: 0, y: 0, w: 0, h: 0 };
      return '<button class="rc-hot" data-sec="' + i + '" style="left:' + (h.x * 100) + '%;top:' +
        (h.y * 100) + '%;width:' + (h.w * 100) + '%;height:' + (h.h * 100) + '%">' +
        '<span class="rc-hot-tag">' + esc(s.label) + '</span></button>';
    }).join('');

    var list = n.sections.map(function (s, i) {
      return '<button class="rc-sec-btn" data-sec="' + i + '">' +
        '<span class="rc-sec-no">' + (i + 1) + '</span>' +
        '<span class="rc-sec-txt"><span class="rc-sec-name">' + esc(s.label) + '</span>' +
        '<span class="rc-sec-role">' + esc(s.role) + '</span></span>' +
        '</button>';
    }).join('');

    return '' +
      '<section class="rc-panel">' +
        '<div class="rc-panel-head"><h2>📖 原文</h2>' +
        '<span class="rc-kicker">可交互原书图 · ' + esc(n.typeLabel) + ' · p' + n.source.print + '</span></div>' +
        '<p class="rc-lead">滚轮缩放、拖动平移；点图上彩色区块或右侧条目，都能跳到对应段落。</p>' +

        '<div class="rc-reader">' +
          '<div class="rc-viewer" id="rcViewer">' +
            '<div class="rc-viewer-stage" id="rcStage">' +
              '<img class="rc-page-img" src="' + pageImg + '" alt="课本原文整页" draggable="false">' +
              hots +
            '</div>' +
            '<div class="rc-viewer-tools">' +
              '<button data-act="out" title="缩小">−</button>' +
              '<button data-act="in" title="放大">＋</button>' +
              '<button data-act="reset" title="复位">⟲</button>' +
            '</div>' +
          '</div>' +
          '<aside class="rc-reader-side">' +
            '<div class="rc-sec-list">' + list + '</div>' +
            '<div class="rc-sec-detail" id="rcSecDetail"></div>' +
          '</aside>' +
        '</div>' +
      '</section>';
  }

  function mountReader() {
    var note = state.note;
    var viewer = el('rcViewer');
    var stage = el('rcStage');
    if (!viewer || !stage) return;

    var vw = 0, vh = 0;
    var s = 1, tx = 0, ty = 0;
    var minS = 1, maxS = 4;

    function measure() {
      var r = viewer.getBoundingClientRect();
      vw = r.width; vh = r.height;
    }
    function clampT() {
      tx = Math.min(0, Math.max(vw - s * vw, tx));
      ty = Math.min(0, Math.max(vh - s * vh, ty));
    }
    function apply() {
      clampT();
      stage.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + s + ')';
      stage.style.transformOrigin = '0 0';
    }
    function focusSec(i, animate) {
      measure();
      var h = note.sections[i] && note.sections[i].hot;
      if (!h || !vw) return;
      var targetS = Math.min(maxS, Math.max(1.2, 0.72 / h.w));
      var cx = (h.x + h.w / 2) * vw;
      var cy = (h.y + h.h / 2) * vh;
      s = targetS;
      tx = vw / 2 - s * cx;
      ty = vh / 2 - s * cy;
      stage.style.transition = animate ? 'transform .45s cubic-bezier(.16,1,.3,1)' : 'none';
      apply();
    }
    function reset(animate) {
      measure();
      s = 1; tx = 0; ty = 0;
      stage.style.transition = animate ? 'transform .35s ease' : 'none';
      apply();
    }

    // 选中态
    function select(i) {
      viewer.querySelectorAll('.rc-hot').forEach(function (b) {
        b.classList.toggle('active', +b.getAttribute('data-sec') === i);
      });
      document.querySelectorAll('.rc-sec-btn').forEach(function (b) {
        b.classList.toggle('active', +b.getAttribute('data-sec') === i);
      });
      var sec = note.sections[i];
      var detail = el('rcSecDetail');
      if (detail && sec) {
        var shot = (sec.shots && sec.shots[0]) ? sec.shots[0] : null;
        detail.innerHTML =
          '<div class="rc-detail-head"><span class="rc-detail-no">' + (i + 1) + '</span>' +
          '<span class="rc-detail-name">' + esc(sec.label) + '</span></div>' +
          '<div class="rc-detail-role">' + esc(sec.role) + '</div>' +
          '<p class="rc-detail-para">' + esc(sec.paras.join(' ')) + '</p>' +
          (shot ? '<figure class="rc-detail-shot"><img src="' + esc(shot.src) + '" alt="' + esc(shot.title) + '" loading="lazy">' +
            '<figcaption>' + esc(shot.title) + '</figcaption></figure>' : '');
      }
      focusSec(i, true);
    }

    // 事件
    viewer.querySelectorAll('.rc-hot').forEach(function (b) {
      b.addEventListener('click', function (e) { e.stopPropagation(); select(+b.getAttribute('data-sec')); });
    });
    document.querySelectorAll('.rc-sec-btn').forEach(function (b) {
      b.addEventListener('click', function () { select(+b.getAttribute('data-sec')); });
    });
    viewer.querySelectorAll('.rc-viewer-tools button').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        var act = b.getAttribute('data-act');
        measure();
        if (act === 'in') { s = Math.min(maxS, s * 1.35); }
        else if (act === 'out') { s = Math.max(minS, s / 1.35); }
        else { reset(true); return; }
        stage.style.transition = 'transform .2s ease';
        apply();
      });
    });

    // 拖动平移
    var dragging = false, lx = 0, ly = 0, moved = false;
    viewer.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.rc-hot') || e.target.closest('.rc-viewer-tools')) return;
      dragging = true; moved = false;
      lx = e.clientX; ly = e.clientY;
      viewer.classList.add('grabbing');
    });
    window.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - lx, dy = e.clientY - ly;
      if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
      lx = e.clientX; ly = e.clientY;
      tx += dx; ty += dy;
      stage.style.transition = 'none';
      apply();
    });
    window.addEventListener('pointerup', function () {
      if (!dragging) return;
      dragging = false;
      viewer.classList.remove('grabbing');
    });
    // 滚轮缩放（以指针为中心）
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

    state.reader = { select: select, reset: reset };

    // 初始：适配容器后默认选中第 1 段（不缩放）
    reset(false);
    select(0);
    reset(false);
    window.addEventListener('resize', function () {
      if (state.open === 'article') { measure(); apply(); }
    });
  }

  // ===== 理解（问题链：以问题为导向读懂文章）=====
  //
  // 教辅《高中英语阅读文本解读与教学指导》的口径：读前带着问题读 → 每段一组问题
  // → 读完再合起来想。答案默认折起来——先想，再对。
  function qBlock(list) {
    return (list || []).map(function (it) {
      return '<details class="rc-q">' +
        '<summary>' + esc(it.q) + '</summary>' +
        '<p>' + esc(it.a) + '</p></details>';
    }).join('');
  }

  function panelUnderstand(n) {
    var q = n.inquiry || {};
    return '' +
      '<section class="rc-panel">' +
        '<div class="rc-panel-head"><h2>💡 理解</h2>' +
        '<span class="rc-kicker">问题链 · 先想，再对答案</span></div>' +
        '<div class="rc-idea-top">' +
          '<div class="rc-meta-row"><span class="rc-badge">体裁</span><span>' + esc(n.genre) + '</span></div>' +
          '<p class="rc-lead">' + esc(n.lead) + '</p>' +
        '</div>' +

        '<h3 class="rc-h3"><span class="rc-h3-no">读</span>读前 · 带着问题读</h3>' +
        '<div class="rc-q-list">' + qBlock(q.pre) + '</div>' +

        n.sections.map(function (s, i) {
          return '<h3 class="rc-h3"><span class="rc-h3-no">' + (i + 1) + '</span>' + esc(s.label) +
            '<span class="rc-h3-role">' + esc(s.role) + '</span></h3>' +
            '<div class="rc-q-list">' + qBlock(s.inquiry) + '</div>';
        }).join('') +

        '<h3 class="rc-h3"><span class="rc-h3-no">思</span>读后 · 合起来想</h3>' +
        '<div class="rc-q-list">' + qBlock(q.post) + '</div>' +

        '<details class="rc-q rc-q-main"><summary>读完再看：一句话主旨</summary>' +
        '<p>' + esc(n.mainIdea) + '</p></details>' +
      '</section>';
  }

  // ===== 结构（骨架导航 + 导图 / 笔记两种摆法）=====
  //
  // 面板只出一份主视觉：顶上一条骨架导航条（= 全文提纲，也是分段切换器），
  // 下面用「导图 / 笔记」切换同一副骨架的两种摆法——
  //   导图：放射状，用来背课文；笔记：竖排，用来做听说 Part C 复述。
  function panelStruct(n) {
    var spine = ['<button class="rc-spine-chip active" data-sec="-1">' +
      '<span class="rc-spine-no">全</span>整篇骨架</button>'].concat(
      n.sections.map(function (s, i) {
        return '<button class="rc-spine-chip" data-sec="' + i + '">' +
          '<span class="rc-spine-no">' + (i + 1) + '</span>' + esc(s.short || s.label) + '</button>';
      })).join('');

    return '' +
      '<section class="rc-panel">' +
        '<div class="rc-panel-head"><h2>🧠 结构</h2>' +
        '<span class="rc-kicker">一副骨架 · 两种摆法</span></div>' +
        '<p class="rc-lead">顶上这条就是全文提纲，点一段就钻进去。' +
        '同一副骨架有两种摆法——<b>导图</b>放射状，用来背课文；<b>笔记</b>竖排，用来做听说复述。</p>' +
        '<div class="rc-spine" id="rcSpine">' + spine + '</div>' +
        '<div class="rc-view-switch" id="rcViewSwitch">' +
          '<button data-view="map">导图</button>' +
          '<button data-view="notes">笔记</button>' +
        '</div>' +
        '<div class="rc-struct-head" id="rcStructHead"></div>' +
        '<div class="rc-map" id="rcStructMap"></div>' +
        '<div class="rc-notes" id="rcStructNotes"></div>' +
      '</section>';
  }

  function bindStruct() {
    document.querySelectorAll('#rcSpine .rc-spine-chip').forEach(function (b) {
      b.addEventListener('click', function () {
        state.mindSec = parseInt(b.getAttribute('data-sec'), 10);
        mountStruct();
      });
    });
    document.querySelectorAll('#rcViewSwitch button').forEach(function (b) {
      b.addEventListener('click', function () {
        state.mindView = b.getAttribute('data-view');
        mountStruct();
      });
    });
  }

  function noteLines(list) {
    return (list || []).map(function (it) {
      return '<div class="rc-note-line' + (it.lv ? ' lv1' : '') + '">' +
        '<span class="rc-note-tree">' + esc(it.tree || '') + '</span>' +
        '<span class="rc-note-txt">' + esc(it.txt) + '</span>' +
        (it.gloss ? '<span class="rc-note-gloss">' + esc(it.gloss) + '</span>' : '') +
        '</div>';
    }).join('');
  }

  function mountStruct() {
    var n = state.note;
    var i = state.mindSec;
    var sec = i >= 0 ? n.sections[i] : null;

    document.querySelectorAll('#rcViewSwitch button').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-view') === state.mindView);
    });
    document.querySelectorAll('#rcSpine .rc-spine-chip').forEach(function (b) {
      b.classList.toggle('active', parseInt(b.getAttribute('data-sec'), 10) === i);
    });

    var head = el('rcStructHead');
    if (head) {
      head.innerHTML =
        '<span class="rc-struct-no">' + (i < 0 ? '全' : (i + 1)) + '</span>' +
        '<span class="rc-struct-name">' + esc(sec ? sec.label : '整篇骨架') + '</span>' +
        '<span class="rc-struct-role">' + esc(sec ? sec.role : '征稿 + 两条标准 → 郎平 → 乔丹 → 号召投稿') + '</span>' +
        '<span class="rc-struct-view">' + (state.mindView === 'map' ? '导图' : '笔记') + '</span>';
    }

    var mapHost = el('rcStructMap');
    var notesHost = el('rcStructNotes');
    if (mapHost) mapHost.hidden = state.mindView !== 'map';
    if (notesHost) notesHost.hidden = state.mindView !== 'notes';

    if (state.mindView === 'map' && mapHost) {
      mapHost.innerHTML = '';
      window.ReadingMindmap.render(mapHost, sec ? sec.mindmap : n.whole, palette());
    }
    if (state.mindView === 'notes' && notesHost) {
      var rows = sec ? [{ s: sec, no: i + 1 }] : n.sections.map(function (s, k) { return { s: s, no: k + 1 }; });
      notesHost.innerHTML = rows.map(function (r) {
        return '<div class="rc-notes-sec">' +
          '<div class="rc-notes-sec-head"><span class="rc-notes-no">' + r.no + '</span>' +
          '<span class="rc-notes-name">' + esc(r.s.label) + '</span>' +
          '<span class="rc-notes-role">' + esc(r.s.role) + '</span></div>' +
          noteLines(r.s.notes) +
          '</div>';
      }).join('');
    }
  }

  // ===== 背诵（待重做）=====
  function panelRecite(n) {
    var r = n.recite || { quotes: [], phrases: [], hint: '' };
    return '' +
      '<section class="rc-panel">' +
        '<div class="rc-panel-head"><h2>🗣️ 背诵</h2>' +
        '<span class="rc-kicker">Reading and Thinking 必背</span></div>' +
        '<p class="rc-note">这一栏是第一版占位，你说要重做成「本文知识卡片」——先留着，等你我讨论清口径再改。</p>' +
        '<div class="rc-quote-list">' +
          r.quotes.map(function (q) {
            return '<blockquote class="rc-quote"><p class="rc-quote-en">' + esc(q.en) + '</p>' +
              '<p class="rc-quote-zh">' + esc(q.zh) + '</p></blockquote>';
          }).join('') +
        '</div>' +
        '<h3 class="rc-h3">必背短语</h3>' +
        '<div class="rc-phrase-grid">' +
          r.phrases.map(function (p) {
            return '<div class="rc-phrase"><span class="rc-phrase-en">' + esc(p.en) + '</span>' +
              '<span class="rc-phrase-zh">' + esc(p.zh) + '</span></div>';
          }).join('') +
        '</div>' +
        '<p class="rc-hintline">� ' + esc(r.hint) + '</p>' +
      '</section>';
  }

  // ───────────────────────── 初始化 ─────────────────────────
  function init() {
    var r = resolveNote();
    state.key = r.key;
    state.note = r.note;

    var head = el('rcArticleMeta');
    if (head && state.note) {
      var n = state.note;
      head.innerHTML =
        '<div class="rc-hero-tag">' + esc(n.book) + ' · Unit ' +
        esc(String(n.unit).replace(/^U/, '')) + ' ' + esc(n.unitTopic) + '</div>' +
        '<h1 class="rc-hero-title">' + esc(n.title) + '</h1>' +
        '<div class="rc-hero-sub">' + esc(n.sub) + ' · ' + esc(n.typeLabel) + '</div>';
    }
    renderWall();
    renderPanels();
    buildDock();

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.open) { state.open = ''; renderWall(); renderPanels(); syncDock(); }
    });
    window.addEventListener('rc-theme-change', function () {
      if (state.open === 'mind') mountStruct();
    });
    window.ReadingApp = { state: state, togglePanel: togglePanel, renderPanels: renderPanels };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
