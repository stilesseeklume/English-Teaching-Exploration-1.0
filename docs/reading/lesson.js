// docs/reading/lesson.js
//
// 阅读课 · 上课模式（一堂课，一屏一个画面，线性推进）
//
// 与装饰墙（app.js）并存：装饰墙是「门厅」，本文件是「讲台」。
// 动线：0 开场 → 1 读前 → 2 认门 → 3 逐段×4（问 / 构 / 词 / 说）→ 拼回去 → 作业
//
// 设计要点（2026-10-20 改版）：
//   1) 原文当舞台 —— 课本整页图铺满整个舞台、每一步都在，永不退场；
//      讲解内容做成右侧玻璃浮层「压」在原文上，图始终露着。
//   2) 镜头会动 —— 段首（问）回到整页做定位，讲到构/词/说时平滑推近本段；
//      整页 / 本段 / 加减缩放 三个手动入口，图上还能直接拖。
//   3) 一屏一主视觉 —— 四层折叠：一屏只掀一层，掀开过的可回看，未到的半透明。
//   4) 页面静止可批注 —— 全程 overflow:hidden、不滚动，方便希沃白板在原文上写。
//
// 依「装饰墙风格」的约定：内容默认折起，按课堂节奏逐层掀开。

(function () {
  'use strict';

  var PAGE_IMG = '../assets/textbook/bx1/u3-rt-p38-page.webp';
  var PAGE_RATIO = 1241 / 1754;   // 原书整页宽高比，热区百分比靠它落准
  var ZOOM_SECTION = 1.5;         // 「本段」档的固定放大倍数
  var ZOOM_MIN = 0.25;
  var ZOOM_MAX = 5;

  var MARKS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'];
  var LAYERS = [
    { key: 'ask', name: '问', en: 'Ask', hint: '问题链 · 先想，再对答案' },
    { key: 'shape', name: '构', en: 'Shape', hint: '段落骨架 · 一张小导图' },
    { key: 'word', name: '词', en: 'Words', hint: '词卡 · 猜 → 翻 → 用' },
    { key: 'say', name: '说', en: 'Say', hint: '复述笔记 · 遮住原文说回来' }
  ];
  var REC_VIEWS = [
    { key: 'map', name: '整篇导图' },
    { key: 'notes', name: '全篇笔记' },
    { key: 'cards', name: '词卡网格' },
    { key: 'affix', name: '词缀总表' }
  ];

  var st = {
    note: null, steps: [], stops: [], idx: 0, rec: 'map', wi: 0, wiSec: -1,
    deck: null, stage: null, rail: null,
    scene: null, figure: null, figstage: null, pagebox: null, hots: null,
    view: null, camZoom: null,
    pageW: 0, pageH: 0,
    zoom: 1, tx: 0, ty: 0,
    camState: 'whole', curSec: null, manual: false, dragged: false
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function el(id) { return document.getElementById(id); }
  function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }
  function clampNum(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function palette() {
    if (isDark()) {
      return { center: '#3a3a3c', centerText: '#ffffff', pointFill: '#2c2c2e',
        pointStroke: 'rgba(255,255,255,.10)', pointText: '#e5e5ea', line: 'rgba(255,255,255,.20)' };
    }
    return { center: '#1d1d1f', centerText: '#ffffff', pointFill: '#ffffff',
      pointStroke: 'rgba(0,0,0,.08)', pointText: '#3a3a3c', line: 'rgba(0,0,0,.16)' };
  }

  function resolveNote() {
    var params = new URLSearchParams(location.search);
    var key = params.get('k') || '必修一|U3|RT';
    var all = window.TEXTBOOK_READING_NOTES || {};
    return all[key] || all['必修一|U3|RT'] || null;
  }

  // ───────────────────────── 步进表 ─────────────────────────
  function buildSteps(n) {
    var steps = [
      { kind: 'opening', label: '开场 · 原书整页' },
      { kind: 'pre', label: '读前 · 三个问题' },
      { kind: 'genre', label: '认门 · 体裁五部件' }
    ];
    var stops = [
      { idx: 0, label: '开场' }, { idx: 1, label: '读前' }, { idx: 2, label: '认门' }
    ];
    (n.sections || []).forEach(function (s, k) {
      stops.push({ idx: steps.length, label: (MARKS[k] || (k + 1)) + ' ' + (s.label || '') });
      for (var L = 0; L < LAYERS.length; L++) {
        steps.push({
          kind: 'section', sec: k, layer: L,
          label: (MARKS[k] || (k + 1)) + ' ' + (s.label || '') + ' · ' + LAYERS[L].name
        });
      }
    });
    stops.push({ idx: steps.length, label: '拼回去' });
    steps.push({ kind: 'recap', label: '拼回去 · 整篇' });
    stops.push({ idx: steps.length, label: '作业' });
    steps.push({ kind: 'homework', label: '作业 · 基础三件套 + 上位任务' });

    st.stops = stops;
    return steps;
  }

  // ───────────────────────── 小零件 ─────────────────────────
  function layerBody(key, s, sec) {
    if (key === 'ask') {
      var qs = s.inquiry || [];
      if (!qs.length) return '<p class="ls-empty">这一段课本没有配问题，直接进「构」。</p>';
      return '<div class="ls-qgrid">' + qs.map(function (it) {
        return '<button class="ls-q" type="button">' +
          '<span class="ls-q-q">' + esc(it.q) + '</span>' +
          '<span class="ls-q-a">' + esc(it.a) + '</span>' +
          '<span class="ls-q-hint">点一下对答案</span></button>';
      }).join('') + '</div>';
    }

    if (key === 'shape') {
      return '' +
        '<div class="ls-shape">' +
          '<p class="ls-shape-role"><b>这一段在全文里干什么：</b>' + esc(s.role || '') + '</p>' +
          '<p class="ls-shape-gist">' + esc(s.gist || '') + '</p>' +
          '<div class="ls-map ls-map-sm" id="lsShapeMap"></div>' +
        '</div>';
    }

    if (key === 'word') {
      var ws = s.words || [];
      if (!ws.length) {
        return '<p class="ls-empty">' + esc(s.wordsNote || '这一段没有需要单独讲的生词。') + '</p>';
      }
      st.wi = clampNum(st.wi, 0, ws.length - 1);
      return wordFocusHtml(ws, st.wi);
    }

    // say · 复述笔记
    return '' +
      '<div class="ls-say">' +
        '<p class="ls-shape-role"><b>遮住原文，只看这副笔记，能不能把这一段说回来？</b></p>' +
        '<div class="ls-notesbox">' + noteLines(s.notes) + '</div>' +
        ((s.translation && s.translation.length)
          ? '<details class="ls-tr"><summary>对不上时，展开译文对照</summary>' +
            '<p>' + esc(s.translation.join(' ')) + '</p></details>'
          : '') +
      '</div>';
  }

  function row(k, v) {
    return '<div class="ls-wrow"><span class="ls-wk">' + k + '</span>' +
      '<span class="ls-wv">' + v + '</span></div>';
  }

  function cardRows(cd) {
    var rows = [];
    if (cd.root) {
      rows.push(row('词根', esc(cd.root.seg || '') + '　' + esc(cd.root.mean || '') +
        ((cd.root.kin && cd.root.kin.length)
          ? '<em class="ls-kin">同源：' + cd.root.kin.map(esc).join(' · ') + '</em>' : '')));
    }
    if (cd.affix && cd.affix.length) {
      rows.push(row('构词', cd.affix.map(function (a) {
        return esc(a.af) + ' ' + esc(a.mean) + '　' + esc(a.ex);
      }).join('<br>')));
    }
    if (cd.family && cd.family.length) rows.push(row('词族', cd.family.map(esc).join('<br>')));
    if (cd.chunks && cd.chunks.length) rows.push(row('词块', cd.chunks.map(esc).join('<br>')));
    if (cd.pitfall) rows.push(row('注意', esc(cd.pitfall)));
    if (cd.use) rows.push(row('用', esc(cd.use)));
    return rows;
  }

  // 讲台上的词卡：一次只讲一个词，正面只有挖空句，翻面才展开词根词缀
  function wordFocusHtml(ws, i) {
    var cd = ws[i];
    var bare = String(cd.w || '').replace(/[^A-Za-z]/g, '');
    var front =
      '<div class="ls-card-front">' +
        '<span class="ls-card-flag">猜</span>' +
        '<div class="ls-card-mid">' +
          (cd.pos ? '<span class="ls-card-pos">' + esc(cd.pos) + '</span>' : '') +
          '<p class="ls-wsent">' + esc(cd.blank || cd.sent || cd.w) + '</p>' +
          (bare
            ? '<p class="ls-whint">首字母 <b>' + esc(bare.charAt(0)) + '</b> · 共 ' + bare.length + ' 个字母</p>'
            : '') +
        '</div>' +
        '<span class="ls-card-tap">点一下 → 词条</span>' +
      '</div>';

    var back =
      '<div class="ls-card-back">' +
        '<span class="ls-card-flag">翻</span>' +
        '<div class="ls-card-head">' +
          '<span class="ls-wbig">' + esc(cd.w) + '</span>' +
          (cd.ipa ? '<span class="ls-ipa">' + esc(cd.ipa) + '</span>' : '') +
        '</div>' +
        '<div class="ls-zh">' + esc(cd.zh || '') + (cd.pos ? '　' + esc(cd.pos) : '') + '</div>' +
        '<div class="ls-wrows">' + cardRows(cd).join('') + '</div>' +
        '<span class="ls-src">' + esc(cd.src || '') + '</span>' +
      '</div>';

    return '' +
      '<div class="ls-word" id="lsWord">' +
        '<div class="ls-wstrip">' + ws.map(function (w, k) {
          return '<button class="ls-wdot' + (k === i ? ' on' : '') + '" type="button" data-w="' + k + '">' +
            (k + 1) + '</button>';
        }).join('') + '</div>' +
        '<button class="ls-wcard' + (cd.tier === 'core' ? ' core' : '') + '" type="button" data-wflip="1">' +
          front + back +
        '</button>' +
        '<div class="ls-wfoot">' +
          '<button class="ls-wnav" type="button" data-wstep="-1"' + (i === 0 ? ' disabled' : '') + '>‹ 上一个词</button>' +
          '<span class="ls-wpos">' + (i + 1) + ' / ' + ws.length + '</span>' +
          '<button class="ls-wnav" type="button" data-wstep="1"' + (i === ws.length - 1 ? ' disabled' : '') + '>下一个词 ›</button>' +
        '</div>' +
      '</div>';
  }

  function cardHtml(cd, i) {
    var front =
      '<div class="ls-card-front">' +
        '<span class="ls-card-flag">猜</span>' +
        (cd.pos ? '<span class="ls-card-pos">' + esc(cd.pos) + '</span>' : '') +
        '<p class="ls-card-sent">' + esc(cd.blank || cd.sent || cd.w) + '</p>' +
        '<span class="ls-card-tap">点一下 → 词条</span>' +
      '</div>';

    var rows = [];
    if (cd.root) {
      rows.push(row('词根', esc(cd.root.seg || '') + '　' + esc(cd.root.mean || '') +
        ((cd.root.kin && cd.root.kin.length)
          ? '<em class="ls-kin">同源：' + cd.root.kin.map(esc).join(' · ') + '</em>' : '')));
    }
    if (cd.affix && cd.affix.length) {
      rows.push(row('构词', cd.affix.map(function (a) {
        return esc(a.af) + ' ' + esc(a.mean) + '　' + esc(a.ex);
      }).join('<br>')));
    }
    if (cd.family && cd.family.length) rows.push(row('词族', cd.family.map(esc).join('<br>')));
    if (cd.chunks && cd.chunks.length) rows.push(row('词块', cd.chunks.map(esc).join('<br>')));
    if (cd.pitfall) rows.push(row('注意', esc(cd.pitfall)));
    if (cd.use) rows.push(row('用', esc(cd.use)));

    var back =
      '<div class="ls-card-back">' +
        '<span class="ls-card-flag">翻</span>' +
        '<div class="ls-card-head">' +
          '<span class="ls-word">' + esc(cd.w) + '</span>' +
          (cd.ipa ? '<span class="ls-ipa">' + esc(cd.ipa) + '</span>' : '') +
        '</div>' +
        '<div class="ls-zh">' + esc(cd.zh || '') + (cd.pos ? '　' + esc(cd.pos) : '') + '</div>' +
        '<div class="ls-wrows">' + rows.join('') + '</div>' +
        '<span class="ls-src">' + esc(cd.src || '') + '</span>' +
      '</div>';

    return '<button class="ls-card' + (cd.tier === 'core' ? ' core' : '') + '" type="button" data-card="' + i + '">' +
      front + back + '</button>';
  }

  function noteLines(list) {
    return (list || []).map(function (it) {
      return '<div class="ls-nline' + (it.lv ? ' lv1' : '') + '">' +
        '<span class="ls-ntree">' + esc(it.tree || '') + '</span>' +
        '<span class="ls-ntxt">' + esc(it.txt) + '</span>' +
        (it.gloss ? '<span class="ls-ngloss">' + esc(it.gloss) + '</span>' : '') +
        '</div>';
    }).join('');
  }

  function camBar() { return ''; }

  // ───────────────────────── 画面 ─────────────────────────
  function viewOpening() {
    return '<div class="ls-v">' +
      '<div class="ls-opening-cap">' +
        '<span class="ls-cap-k">必修一 · Unit 3 · Reading and Thinking</span>' +
        '<span class="ls-cap-t">Living Legends</span>' +
        '<span class="ls-cap-h">先看这一页，什么都不用解释。按空格继续。</span>' +
      '</div>' +
      '</div>';
  }

  function qCard(it, hint) {
    return '<button class="ls-q" type="button">' +
      '<span class="ls-q-q">' + esc(it.q) + '</span>' +
      '<span class="ls-q-a">' + esc(it.a) + '</span>' +
      '<span class="ls-q-hint">' + hint + '</span></button>';
  }

  function viewPre() {
    var q = (st.note.inquiry && st.note.inquiry.pre) || [];
    return '<div class="ls-v">' +
      '<section class="ls-plate float" style="--panel-w:44%">' +
        '<header class="ls-plate-head">' +
          '<span class="ls-kicker">1 · 读前</span>' +
          '<h2>带着这三个问题去读</h2>' +
          '<p class="ls-lead">' + esc(st.note.lead || '') + '</p>' +
        '</header>' +
        '<div class="ls-qgrid">' + q.map(function (it) { return qCard(it, '先让学生答，点一下再对'); }).join('') + '</div>' +
      '</section>' +
      '</div>';
  }

  function viewGenre() {
    var parts = st.note.genreParts || [];
    return '<div class="ls-v">' +
      '<section class="ls-plate float" style="--panel-w:56%">' +
        '<header class="ls-plate-head">' +
          '<span class="ls-kicker">2 · 认门</span>' +
          '<h2>先认门：这类文章的五部件</h2>' +
          '<p class="ls-lead">这不是散文，是一篇<b>杂志征稿</b>。左边就是原文——五个部件对上号，全文就没有意外。</p>' +
        '</header>' +
        '<div class="ls-genre">' + parts.map(function (p) {
          return '<div class="ls-genre-card">' +
            '<span class="ls-genre-no">' + esc(p.no) + '</span>' +
            '<span class="ls-genre-name">' + esc(p.name) + '</span>' +
            '<span class="ls-genre-en">' + esc(p.en) + '</span>' +
            '<span class="ls-genre-role">' + esc(p.role) + '</span>' +
            '<span class="ls-genre-text">' + esc(p.text) + '</span>' +
            '<span class="ls-genre-note">' + esc(p.note) + '</span>' +
            '</div>';
        }).join('') + '</div>' +
      '</section>' +
      '</div>';
  }

  function viewSection(sec, layer) {
    var s = st.note.sections[sec];
    var mark = MARKS[sec] || (sec + 1);

    var layers = LAYERS.map(function (L, i) {
      var open = i === layer;
      var locked = i > layer;
      var stateTxt = open ? '已掀开' : (locked ? '按空格继续' : '已讲 · 可回看');
      return '<section class="ls-layer' + (open ? ' open' : '') + (locked ? ' locked' : '') + '" data-layer="' + i + '">' +
        '<button class="ls-layer-head" type="button" data-layer="' + i + '">' +
          '<span class="ls-layer-no">' + (i + 1) + '</span>' +
          '<span class="ls-layer-name">' + L.name + '</span>' +
          '<span class="ls-layer-en">' + L.en + '</span>' +
          '<span class="ls-layer-hint">' + L.hint + '</span>' +
          '<span class="ls-layer-state">' + stateTxt + '</span>' +
        '</button>' +
        '<div class="ls-layer-body">' + layerBody(L.key, s, sec) + '</div>' +
      '</section>';
    }).join('');

    return '<div class="ls-v">' +
      '<div class="ls-scene-head">' +
        '<span class="ls-sec-mark">' + mark + '</span>' +
        '<span class="ls-sec-txt">' +
          '<span class="ls-sec-name">' + esc(s.label) + '</span>' +
          '<span class="ls-sec-role">' + esc(s.role) + '</span>' +
        '</span>' +
      '</div>' +
      '<aside class="ls-plate">' +
        '<div class="ls-layers" id="lsLayers">' + layers + '</div>' +
      '</aside>' +
      '</div>';
  }

  function recBody() {
    var n = st.note;
    var v = st.rec;

    if (v === 'map') {
      return '<div class="ls-map" id="lsRecMap"></div>';
    }

    if (v === 'notes') {
      return '<div class="ls-recscroll">' + n.sections.map(function (s, i) {
        return '<div class="ls-nsec">' +
          '<div class="ls-nsec-head"><span class="ls-nsec-no">' + (MARKS[i] || (i + 1)) + '</span>' +
          '<span class="ls-nsec-name">' + esc(s.label) + '</span>' +
          '<span class="ls-nsec-role">' + esc(s.role) + '</span></div>' +
          noteLines(s.notes) + '</div>';
      }).join('') + '</div>';
    }

    if (v === 'cards') {
      var groups = n.sections.map(function (s, i) {
        if (!s.words || !s.words.length) return '';
        return '<div class="ls-cardgroup"><div class="ls-cg-head">' + (MARKS[i] || (i + 1)) + ' ' + esc(s.label) + '</div>' +
          '<div class="ls-cards">' + s.words.map(function (cd, k) { return cardHtml(cd, k); }).join('') + '</div></div>';
      }).join('');
      if (n.unitWords && n.unitWords.length) {
        groups += '<div class="ls-cardgroup"><div class="ls-cg-head">单元增量词（正文未出现）</div>' +
          '<div class="ls-cards">' + n.unitWords.map(function (cd, k) { return cardHtml(cd, 900 + k); }).join('') + '</div></div>';
      }
      return '<div class="ls-recscroll" id="lsCardGrid">' + groups + '</div>';
    }

    // affix
    var t = n.affixTable || [];
    return '<div class="ls-recscroll"><table class="ls-affix"><thead><tr>' +
      '<th>词缀</th><th>作用</th><th>本文的例子</th><th>再记三个</th></tr></thead><tbody>' +
      t.map(function (a) {
        return '<tr><td class="ls-af">' + esc(a.af) + '</td><td>' + esc(a.mean) + '</td>' +
          '<td class="ls-ex">' + esc(a.ex) + '</td><td class="ls-more">' + esc(a.more || '') + '</td></tr>';
      }).join('') + '</tbody></table>' +
      '<p class="ls-affix-tip">这一张表可以跨单元复用：以后每见一个生词，先问「它挂在哪个词根上、带的哪个词缀」。</p></div>';
  }

  function viewRecap() {
    return '<div class="ls-v">' +
      '<section class="ls-plate center">' +
        '<header class="ls-plate-head">' +
          '<span class="ls-kicker">拼回去</span>' +
          '<h2>把整篇合起来看</h2>' +
        '</header>' +
        '<div class="ls-tabs">' + REC_VIEWS.map(function (r) {
          return '<button class="' + (st.rec === r.key ? 'on' : '') + '" data-rec="' + r.key + '" type="button">' + esc(r.name) + '</button>';
        }).join('') + '</div>' +
        '<div class="ls-rec-body" id="lsRecBody">' + recBody() + '</div>' +
      '</section>' +
      '</div>';
  }

  function viewHomework() {
    var hw = st.note.homework || {};
    return '<div class="ls-v">' +
      '<section class="ls-plate center">' +
        '<header class="ls-plate-head">' +
          '<span class="ls-kicker">作业</span>' +
          '<h2>基础三件套 + 三个上位任务</h2>' +
        '</header>' +
        '<div class="ls-hw">' +
          '<div class="ls-hw-col">' +
            '<div class="ls-hw-title">基础 · 人人要做</div>' +
            '<ul class="ls-hw-list">' + (hw.base || []).map(function (d) {
              return '<li>' + esc(d) + '</li>';
            }).join('') + '</ul>' +
          '</div>' +
          '<div class="ls-hw-col">' +
            '<div class="ls-hw-title">上位 · 挑一个做深（提高版）</div>' +
            '<div class="ls-hw-ups">' + (hw.up || []).map(function (u) {
              return '<div class="ls-hw-up"><span class="ls-hw-tag">' + esc(u.t) + '</span>' +
                '<span class="ls-hw-d">' + esc(u.d) + '</span></div>';
            }).join('') + '</div>' +
          '</div>' +
          (hw.scaffold
            ? '<div class="ls-hw-col ls-hw-scaf">' +
              '<div class="ls-hw-title">' + esc(hw.scaffold.title) + '</div>' +
              '<div class="ls-hw-lines">' + hw.scaffold.lines.map(function (l) {
                return '<div class="ls-hw-line">' + esc(l) + '</div>';
              }).join('') + '</div>' +
              '<p class="ls-hw-tip">' + esc(hw.scaffold.tip) + '</p>' +
              '</div>'
            : '') +
        '</div>' +
      '</section>' +
      '</div>';
  }

  // ───────────────────────── 舞台与镜头 ─────────────────────────
  function buildScene() {
    var scene = document.createElement('div');
    scene.className = 'ls-scene full';
    scene.innerHTML =
      '<div class="ls-figure" id="lsFigure">' +
        '<div class="ls-figstage" id="lsFigStage">' +
          '<div class="ls-pagebox" id="lsPageBox">' +
            '<img class="ls-page" src="' + PAGE_IMG + '" alt="课本原文整页">' +
            '<div class="ls-hots" id="lsHots"></div>' +
          '</div>' +
        '</div>' +
      '</div>';
    st.scene = scene;
    st.figure = scene.querySelector('#lsFigure');
    st.figstage = scene.querySelector('#lsFigStage');
    st.pagebox = scene.querySelector('#lsPageBox');
    st.hots = scene.querySelector('#lsHots');
    st.stage.appendChild(scene);
    buildHots();
    bindCamera();
  }

  // 原文上每一段都是一个可点热区：点到哪段，镜头就去哪段
  function buildHots() {
    var secs = st.note.sections || [];
    st.hots.innerHTML = secs.map(function (s, k) {
      var h = s.hot || {};
      if (!h.w) return '';
      return '<button class="ls-hotbox" type="button" data-sec="' + k + '"' +
        ' data-mark="' + (MARKS[k] || (k + 1)) + '"' +
        ' style="left:' + (h.x * 100) + '%;top:' + (h.y * 100) + '%;' +
        'width:' + (h.w * 100) + '%;height:' + (h.h * 100) + '%"' +
        ' title="第 ' + (k + 1) + ' 段：' + esc(s.label || '') + '"></button>';
    }).join('');

    st.hots.querySelectorAll('.ls-hotbox').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        if (st.dragged) return;                 // 刚才是拖原文，不是点段
        var k = parseInt(b.getAttribute('data-sec'), 10);
        if (k === st.curSec) { next(); return; }
        jumpSection(k);
      });
    });
  }

  function jumpSection(k) {
    for (var i = 0; i < st.steps.length; i++) {
      var s = st.steps[i];
      if (s.kind === 'section' && s.sec === k && s.layer === 0) {
        st.idx = i; st.wi = 0; render(); return;
      }
    }
  }

  // 让整页图在舞台上「尽可能大」并保持真实比例 —— 热区百分比才落得准
  function layoutPage() {
    var W = st.stage.clientWidth, H = st.stage.clientHeight;
    if (!W || !H) return;
    var w = W, h = w / PAGE_RATIO;
    if (h > H) { h = H; w = h * PAGE_RATIO; }
    st.pageW = w;
    st.pageH = h;
    st.pagebox.style.width = w + 'px';
    st.pagebox.style.height = h + 'px';
  }

  // 右侧浮层遮掉的宽度 —— 原文只在左边这块可见区域里取景
  function freeW() {
    var sw = st.stage.clientWidth;
    var plate = st.view && st.view.querySelector('.ls-plate');
    if (!plate) return sw;
    var pr = plate.getBoundingClientRect();
    var sr = st.stage.getBoundingClientRect();
    var w = pr.left - sr.left - 10;
    return Math.max(180, Math.min(sw, w));
  }

  function clampView(v) {
    var sw = freeW(), sh = st.stage.clientHeight;
    var pw = st.pageW * v.s, ph = st.pageH * v.s;
    var tx, ty;
    if (pw <= sw) tx = (sw - pw) / 2; else tx = Math.min(0, Math.max(sw - pw, v.tx));
    if (ph <= sh) ty = (sh - ph) / 2; else ty = Math.min(0, Math.max(sh - ph, v.ty));
    return { s: v.s, tx: tx, ty: ty };
  }

  function applyView(v) {
    var c = clampView(v);
    st.zoom = c.s; st.tx = c.tx; st.ty = c.ty;
    st.figstage.style.transform = 'translate3d(' + c.tx + 'px,' + c.ty + 'px,0) scale(' + c.s + ')';
    if (st.camZoom) st.camZoom.textContent = '×' + c.s.toFixed(1);
  }

  function fitWhole() {
    layoutPage();
    var sw = freeW(), sh = st.stage.clientHeight;
    var s = Math.min(sw / st.pageW, sh / st.pageH);
    st.camState = 'whole';
    applyView({ s: s, tx: (sw - st.pageW * s) / 2, ty: (sh - st.pageH * s) / 2 });
  }

  function fitSection(sec) {
    layoutPage();
    var hot = (st.note.sections[sec] || {}).hot;
    if (!hot || !hot.w) { fitWhole(); return; }
    var sw = freeW(), sh = st.stage.clientHeight;
    var s = ZOOM_SECTION;
    var cx = (hot.x + hot.w / 2) * st.pageW;
    var cy = (hot.y + hot.h / 2) * st.pageH;
    var visW = sw / s, visH = sh / s;
    var left = clampNum(cx - (sw / 2) / s, 0, Math.max(0, st.pageW - visW));
    var top = clampNum(cy - (sh / 2) / s, 0, Math.max(0, st.pageH - visH));
    st.camState = 'sec';
    applyView({ s: s, tx: -left * s, ty: -top * s });
  }

  function zoomBy(f) {
    var mx = freeW() / 2;                 // 以「原文可见区」的中心为锚，浮层不会吃掉画面
    zoomAt(f, mx, st.stage.clientHeight / 2);
  }

  function zoomAt(f, mx, my) {
    var cxPage = (mx - st.tx) / st.zoom, cyPage = (my - st.ty) / st.zoom;
    var s = clampNum(st.zoom * f, ZOOM_MIN, ZOOM_MAX);
    st.camState = 'free';
    st.manual = true;
    applyView({ s: s, tx: mx - cxPage * s, ty: my - cyPage * s });
  }

  function panBy(dx, dy) {
    st.camState = 'free';
    st.manual = true;
    applyView({ s: st.zoom, tx: st.tx + dx, ty: st.ty + dy });
  }

  function bindCamera() {
    var down = false, sx = 0, sy = 0, ox = 0, oy = 0;
    var SWIPE = 6;   // 小于这个位移算「点击」，不算拖 —— 免得学生点一下就滑走原文

    st.stage.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      if (e.target.closest && e.target.closest('.ls-plate')) return;   // 浮层里的点击不归镜头管
      down = true;
      st.dragged = false;
      sx = e.clientX; sy = e.clientY; ox = st.tx; oy = st.ty;
    });

    st.stage.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) < SWIPE && Math.abs(dy) < SWIPE) return;
      if (!st.dragged) {
        st.dragged = true;
        // 真的开始拖了才捕获指针 —— 否则连「点热区」也会被重定向到舞台
        try { st.stage.setPointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }
      }
      st.figstage.classList.add('dragging');
      st.stage.classList.add('dragging');
      st.camState = 'free';
      st.manual = true;
      syncCamBar();
      var c = clampView({ s: st.zoom, tx: ox + dx, ty: oy + dy });
      st.tx = c.tx; st.ty = c.ty;
      st.figstage.style.transform = 'translate3d(' + c.tx + 'px,' + c.ty + 'px,0) scale(' + st.zoom + ')';
    });

    function up() {
      if (!down) return;
      down = false;
      st.figstage.classList.remove('dragging');
      st.stage.classList.remove('dragging');
    }
    st.stage.addEventListener('pointerup', function (e) {
      if (!down) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      var moved = Math.abs(dx) >= SWIPE || Math.abs(dy) >= SWIPE;
      up();
      // 在原文空白处点一下 = 下一步；点在段落热区上则交给热区自己处理
      if (!moved && !(e.target.closest && e.target.closest('.ls-hotbox'))) next();
      e.preventDefault();
    });
    st.stage.addEventListener('pointercancel', up);

    // 滚轮缩放（以指针为中心）
    st.stage.addEventListener('wheel', function (e) {
      if (!st.deck || st.deck.hidden) return;
      if (e.target.closest && e.target.closest('.ls-plate')) return;
      e.preventDefault();
      var r = st.stage.getBoundingClientRect();
      zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - r.left, e.clientY - r.top);
      syncCamBar();
    }, { passive: false });
  }

  function placeHotbox(sec) {
    if (!st.hots) return;
    st.hots.querySelectorAll('.ls-hotbox').forEach(function (b) {
      b.classList.toggle('on', parseInt(b.getAttribute('data-sec'), 10) === sec);
    });
    st.hots.classList.toggle('lit', sec !== null && sec >= 0);
  }

  // ───────────────────────── 渲染与绑定 ─────────────────────────
  function current() { return st.steps[st.idx] || st.steps[0]; }

  function render() {
    var step = current();
    st.manual = false;

    // 1) 舞台：色调 + 热区（场景节点常驻，所以镜头动画是连续的）
    //    原文永远在：读前压暗当背景、认门与逐段全亮、收束幕压得更狠当肌理
    var tint = 'full';
    if (step.kind === 'pre') tint = 'tint-soft';
    else if (step.kind === 'recap' || step.kind === 'homework') tint = 'tint-hard';
    st.scene.className = 'ls-scene ' + tint;
    st.curSec = (step.kind === 'section') ? step.sec : null;
    if (step.kind === 'section' && step.sec !== st.wiSec) { st.wi = 0; st.wiSec = step.sec; }
    placeHotbox(st.curSec);

    // 2) 浮层：只换内容，不动舞台
    var html = '';
    if (step.kind === 'opening') html = viewOpening();
    else if (step.kind === 'pre') html = viewPre();
    else if (step.kind === 'genre') html = viewGenre();
    else if (step.kind === 'section') html = viewSection(step.sec, step.layer);
    else if (step.kind === 'recap') html = viewRecap();
    else if (step.kind === 'homework') html = viewHomework();

    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    var view = tmp.firstElementChild;
    var old = st.stage.querySelector('.ls-v');
    if (old) st.stage.replaceChild(view, old);
    else st.stage.appendChild(view);
    st.view = view;
    // 词层内容最密，浮层给宽一点，少折几行
    if (step.kind === 'section' && step.layer === 2) {
      var plate = view.querySelector('.ls-plate');
      if (plate) plate.classList.add('wide');
    }

    // 3) 镜头：段首（问）用整页做定位，讲到构 / 词 / 说再平滑推近本段
    layoutPage();
    if (step.kind === 'section' && step.layer > 0) fitSection(step.sec);
    else fitWhole();
    syncCamBar();

    bind(step);
    updateChrome();
    if (step.kind === 'section' && step.layer === 1) mountShape(step.sec);
    if (step.kind === 'recap') mountRecap();
  }

  function mountShape(sec) {
    var host = el('lsShapeMap');
    if (!host || !window.ReadingMindmap) return;
    var s = st.note.sections[sec];
    if (!s || !s.mindmap) return;
    window.ReadingMindmap.render(host, s.mindmap, palette());
  }

  function mountRecap() {
    if (st.rec !== 'map') return;
    var host = el('lsRecMap');
    if (!host || !window.ReadingMindmap) return;
    window.ReadingMindmap.render(host, st.note.whole, palette());
  }

  function bind(step) {
    var root = st.view;

    root.querySelectorAll('.ls-q').forEach(function (b) {
      b.addEventListener('click', function () { b.classList.toggle('on'); b.blur(); });
    });

    root.querySelectorAll('.ls-layer-head').forEach(function (b) {
      b.addEventListener('click', function () {
        gotoLayer(step.sec, parseInt(b.getAttribute('data-layer'), 10));
      });
    });

    root.querySelectorAll('.ls-card').forEach(function (b) {
      b.addEventListener('click', function () { b.classList.toggle('flip'); b.blur(); });
    });

    root.querySelectorAll('[data-rec]').forEach(function (b) {
      b.addEventListener('click', function () {
        st.rec = b.getAttribute('data-rec');
        render();
      });
    });

    var word = root.querySelector('.ls-word');
    if (word) bindWord(word, step.sec);
  }

  function bindWord(wrap, sec) {
    var card = wrap.querySelector('.ls-wcard');
    if (card) {
      card.addEventListener('click', function () {
        card.classList.toggle('flip');
        // 背面的内容比卡片高时，给个渐隐提示，告诉老师下面还有
        var back = card.querySelector('.ls-card-back');
        card.classList.toggle('scrollable', !!back && back.scrollHeight > back.clientHeight + 8);
        card.blur();
      });
    }

    wrap.querySelectorAll('.ls-wdot').forEach(function (b) {
      b.addEventListener('click', function () {
        st.wi = parseInt(b.getAttribute('data-w'), 10);
        swapWord(sec);
        b.blur();
      });
    });
    wrap.querySelectorAll('.ls-wnav').forEach(function (b) {
      b.addEventListener('click', function () {
        st.wi += parseInt(b.getAttribute('data-wstep'), 10);
        swapWord(sec);
        b.blur();
      });
    });
  }

  // 只换词，不动镜头 —— 免得每换一个词画面就重新对焦
  function swapWord(sec) {
    var s = st.note.sections[sec];
    var host = st.view && st.view.querySelector('.ls-layer.open .ls-layer-body');
    if (!s || !s.words || !host) return;
    st.wi = clampNum(st.wi, 0, s.words.length - 1);
    host.innerHTML = wordFocusHtml(s.words, st.wi);
    var wrap = host.querySelector('.ls-word');
    if (wrap) bindWord(wrap, sec);
    updateChrome();
  }

  function camAct(a) {
    if (a === 'whole') { st.manual = true; fitWhole(); syncCamBar(); return; }
    if (a === 'sec') {
      if (st.curSec === null || st.curSec < 0) return;
      st.manual = true; fitSection(st.curSec); syncCamBar(); return;
    }
    if (a === 'in') { zoomBy(1.25); syncCamBar(); return; }
    if (a === 'out') { zoomBy(1 / 1.25); syncCamBar(); }
  }

  function syncCamBar() {
    if (!st.deck) return;
    var hasSec = st.curSec !== null && st.curSec >= 0;
    st.deck.querySelectorAll('[data-cam]').forEach(function (b) {
      var a = b.getAttribute('data-cam');
      if (a === 'whole' || a === 'sec') {
        b.classList.toggle('on', a === st.camState);
        b.disabled = !hasSec;
      }
    });
    if (st.camZoom) st.camZoom.textContent = '×' + st.zoom.toFixed(1);
  }

  function gotoLayer(sec, layer) {
    for (var i = 0; i < st.steps.length; i++) {
      var s = st.steps[i];
      if (s.kind === 'section' && s.sec === sec && s.layer === layer) { st.idx = i; break; }
    }
    render();
  }

  function updateChrome() {
    var step = current();
    var cnt = el('lsCount');
    var lbl = step.label;
    if (step.kind === 'section' && step.layer === 2) {
      var ws = (st.note.sections[step.sec] || {}).words || [];
      if (ws.length) lbl += '　' + (st.wi + 1) + '/' + ws.length;
    }
    if (cnt) cnt.textContent = (st.idx + 1) + ' / ' + st.steps.length + '　' + lbl;

    var prevB = st.deck.querySelector('[data-act="prev"]');
    var nextB = st.deck.querySelector('[data-act="next"]');
    if (prevB) prevB.disabled = st.idx === 0;
    if (nextB) nextB.disabled = st.idx === st.steps.length - 1;

    var activeIdx = 0;
    st.stops.forEach(function (p) { if (p.idx <= st.idx) activeIdx = p.idx; });
    st.rail.querySelectorAll('.ls-rail-item').forEach(function (b) {
      b.classList.toggle('active', parseInt(b.getAttribute('data-idx'), 10) === activeIdx);
    });
    syncCamBar();
  }

  // ───────────────────────── 骨架 ─────────────────────────
  function buildRail() {
    var rail = st.rail;
    if (!rail) return;
    rail.innerHTML = st.stops.map(function (p) {
      return '<button class="ls-rail-item" type="button" data-idx="' + p.idx + '">' +
        '<span class="ls-rail-label">' + esc(p.label) + '</span></button>';
    }).join('');
    rail.querySelectorAll('.ls-rail-item').forEach(function (b) {
      b.addEventListener('click', function () {
        st.idx = parseInt(b.getAttribute('data-idx'), 10);
        st.rec = 'map';
        render();
      });
    });
  }

  function buildDeck() {
    var deck = document.createElement('div');
    deck.className = 'ls-deck';
    deck.id = 'lsDeck';
    deck.hidden = true;
    deck.innerHTML =
      '<aside class="ls-rail" id="lsRail"></aside>' +
      '<div class="ls-main">' +
        '<div class="ls-stage" id="lsStage"></div>' +
        '<footer class="ls-foot">' +
          '<button class="ls-nav" type="button" data-act="prev" title="上一步（←）">←</button>' +
          '<button class="ls-nav" type="button" data-act="next" title="下一步（空格 / →）">→</button>' +
          '<span class="ls-count" id="lsCount"></span>' +
          '<div class="ls-cam">' +
            '<button type="button" data-cam="whole" title="回到整页（0）">整页</button>' +
            '<button type="button" data-cam="sec" title="聚焦本段（F）">本段</button>' +
            '<span class="ls-cam-sep"></span>' +
            '<button type="button" data-cam="out" title="缩小（−）">−</button>' +
            '<span class="ls-cam-z" id="lsZoom">×1.0</span>' +
            '<button type="button" data-cam="in" title="放大（＋）">＋</button>' +
          '</div>' +
          '<span class="ls-keys">← → 步进 · 1-4 跳段 · 图上点一下翻页 · 拖动看原文</span>' +
          '<button class="ls-exit" type="button" data-act="exit">退出上课模式</button>' +
        '</footer>' +
      '</div>';
    document.body.appendChild(deck);
    st.deck = deck;
    st.stage = deck.querySelector('#lsStage');
    st.rail = deck.querySelector('#lsRail');
    st.camZoom = deck.querySelector('#lsZoom');

    deck.querySelector('[data-act="prev"]').addEventListener('click', prev);
    deck.querySelector('[data-act="next"]').addEventListener('click', next);
    deck.querySelector('[data-act="exit"]').addEventListener('click', close);
    deck.querySelectorAll('[data-cam]').forEach(function (b) {
      b.addEventListener('click', function () { camAct(b.getAttribute('data-cam')); });
    });
    buildRail();
    buildScene();
  }

  // ───────────────────────── 步进 ─────────────────────────
  function next() { if (st.idx < st.steps.length - 1) { st.idx++; render(); } }
  function prev() { if (st.idx > 0) { st.idx--; render(); } }

  function jumpSection(k) {
    for (var i = 0; i < st.steps.length; i++) {
      var s = st.steps[i];
      if (s.kind === 'section' && s.sec === k && s.layer === 0) { st.idx = i; st.rec = 'map'; render(); return; }
    }
  }

  function onKey(e) {
    if (!st.deck || st.deck.hidden) return;
    var tag = (e.target && e.target.tagName) || '';
    if ((e.key === ' ' || e.key === 'Enter') && tag === 'BUTTON') return; // 让按钮自己响应

    if (e.key === 'Escape') { close(); e.preventDefault(); return; }
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Enter') { next(); e.preventDefault(); return; }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { prev(); e.preventDefault(); return; }
    if (/^[1-9]$/.test(e.key)) { jumpSection(parseInt(e.key, 10) - 1); e.preventDefault(); return; }

    // 镜头微调：方向键废了（已用于步进），改用 W A S D 拖画面
    if (e.key === 'a' || e.key === 'd' || e.key === 'w' || e.key === 's') {
      var d = 60;
      panBy(e.key === 'a' ? d : e.key === 'd' ? -d : 0, e.key === 'w' ? d : e.key === 's' ? -d : 0);
      syncCamBar();
      e.preventDefault(); return;
    }
    if (e.key === '+' || e.key === '=') { zoomBy(1.2); syncCamBar(); e.preventDefault(); return; }
    if (e.key === '-' || e.key === '_') { zoomBy(1 / 1.2); syncCamBar(); e.preventDefault(); return; }
    if (e.key === '0') { st.manual = true; fitWhole(); syncCamBar(); e.preventDefault(); return; }
    if (e.key === 'f' || e.key === 'F') {
      if (st.curSec !== null && st.curSec >= 0) { st.manual = true; fitSection(st.curSec); syncCamBar(); }
      e.preventDefault();
    }
  }

  // ───────────────────────── 进 / 出 ─────────────────────────
  function open(note) {
    note = note || resolveNote();
    if (!note) return;
    st.note = note;
    st.steps = buildSteps(note);
    st.idx = 0;
    st.rec = 'map';
    if (!st.deck) buildDeck();
    else buildRail();
    document.documentElement.classList.add('ls-on');
    st.deck.hidden = false;
    render();
  }

  function close() {
    document.documentElement.classList.remove('ls-on');
    if (st.deck) st.deck.hidden = true;
  }

  function init() {
    var start = el('lsStart');
    if (start) start.addEventListener('click', function () { open(); });
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', function () {
      if (!st.deck || st.deck.hidden) return;
      layoutPage();
      var step = current();
      if (st.camState === 'sec' && step.kind === 'section') fitSection(step.sec);
      else if (st.camState === 'whole' || st.curSec === null) fitWhole();
      else applyView({ s: st.zoom, tx: st.tx, ty: st.ty });
    });
    window.addEventListener('rc-theme-change', function () {
      if (st.deck && !st.deck.hidden) render();
    });
    window.ReadingLesson = { open: open, close: close, state: st };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
