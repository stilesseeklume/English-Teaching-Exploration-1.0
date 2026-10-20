// docs/reading/lesson.js
//
// 阅读课 · 上课模式（一堂课，一屏一个画面，线性推进）
//
// 与装饰墙（app.js）并存：装饰墙是「门厅」，本文件是「讲台」。
// 动线：0 开场 → 1 读前 → 2 认门 → 3 逐段×4（问 / 构 / 词 / 说）→ 拼回去 → 作业
// 硬约束：一屏一主视觉、页面静止（关动画，供白板批注）、键盘可全程驱动、左侧常驻路线图。
//
// 依「装饰墙风格」的约定：内容默认折起，按课堂节奏逐层掀开；掀开过的层可回看。

(function () {
  'use strict';

  var PAGE_IMG = '../assets/textbook/bx1/u3-rt-p38-page.webp';
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
    note: null, steps: [], stops: [], idx: 0,
    focus: true, rec: 'map', deck: null, stage: null
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function el(id) { return document.getElementById(id); }
  function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }

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
      return '<div class="ls-cards">' + ws.map(function (cd, i) {
        return cardHtml(cd, i);
      }).join('') + '</div>';
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

  // ───────────────────────── 画面 ─────────────────────────
  function viewOpening() {
    return '' +
      '<section class="ls-v ls-v-opening">' +
        '<div class="ls-opening-cap">' +
          '<span class="ls-cap-k">必修一 · Unit 3 · Reading and Thinking</span>' +
          '<span class="ls-cap-t">Living Legends</span>' +
          '<span class="ls-cap-h">先看这一页，什么都不用解释。按空格继续。</span>' +
        '</div>' +
        '<div class="ls-figwrap"><div class="ls-figure" id="lsFigure">' +
          '<img class="ls-page" src="' + PAGE_IMG + '" alt="课本原文整页">' +
        '</div></div>' +
      '</section>';
  }

  function viewPre() {
    var q = (st.note.inquiry && st.note.inquiry.pre) || [];
    return '' +
      '<section class="ls-v">' +
        '<header class="ls-vhead">' +
          '<span class="ls-kicker">1 · 读前</span>' +
          '<h2>带着这三个问题去读</h2>' +
          '<p class="ls-lead">' + esc(st.note.lead || '') + '</p>' +
        '</header>' +
        '<div class="ls-qgrid">' + q.map(function (it) {
          return '<button class="ls-q" type="button">' +
            '<span class="ls-q-q">' + esc(it.q) + '</span>' +
            '<span class="ls-q-a">' + esc(it.a) + '</span>' +
            '<span class="ls-q-hint">先让学生答，点一下再对</span></button>';
        }).join('') + '</div>' +
      '</section>';
  }

  function viewGenre() {
    var parts = st.note.genreParts || [];
    return '' +
      '<section class="ls-v">' +
        '<header class="ls-vhead">' +
          '<span class="ls-kicker">2 · 认门</span>' +
          '<h2>先认门：这类文章的五部件</h2>' +
          '<p class="ls-lead">这不是散文，是一篇<b>杂志征稿</b>。读之前先认门——五个部件对上号，全文就没有意外。</p>' +
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
      '</section>';
  }

  function viewSection(sec, layer) {
    var n = st.note;
    var s = n.sections[sec];
    var h = s.hot || { x: 0, y: 0, w: 0, h: 0 };
    var hotbox = '<span class="ls-hotbox" data-mark="' + (MARKS[sec] || (sec + 1)) + '" style="left:' +
      (h.x * 100) + '%;top:' + (h.y * 100) + '%;width:' + (h.w * 100) + '%;height:' + (h.h * 100) + '%"></span>';

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

    return '' +
      '<section class="ls-v ls-v-sec">' +
        '<header class="ls-sec-head">' +
          '<span class="ls-sec-mark">' + (MARKS[sec] || (sec + 1)) + '</span>' +
          '<span class="ls-sec-name">' + esc(s.label) + '</span>' +
          '<span class="ls-sec-role">' + esc(s.role) + '</span>' +
          '<button class="ls-fig-toggle" type="button" data-act="figtoggle">' +
            (st.focus ? '看整页' : '聚焦本段') + '</button>' +
        '</header>' +
        '<div class="ls-sec-body">' +
          '<div class="ls-figwrap"><div class="ls-figure" id="lsFigure">' +
            '<div class="ls-figstage" id="lsFigStage">' +
              '<img class="ls-page" src="' + PAGE_IMG + '" alt="课本原文">' +
              hotbox +
            '</div>' +
          '</div></div>' +
          '<div class="ls-layers" id="lsLayers">' + layers + '</div>' +
        '</div>' +
      '</section>';
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
    return '' +
      '<section class="ls-v">' +
        '<header class="ls-vhead">' +
          '<span class="ls-kicker">拼回去</span>' +
          '<h2>把整篇合起来看</h2>' +
        '</header>' +
        '<div class="ls-tabs">' + REC_VIEWS.map(function (r) {
          return '<button class="' + (st.rec === r.key ? 'on' : '') + '" data-rec="' + r.key + '" type="button">' + esc(r.name) + '</button>';
        }).join('') + '</div>' +
        '<div class="ls-rec-body" id="lsRecBody">' + recBody() + '</div>' +
      '</section>';
  }

  function viewHomework() {
    var hw = st.note.homework || {};
    return '' +
      '<section class="ls-v">' +
        '<header class="ls-vhead">' +
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
      '</section>';
  }

  // ───────────────────────── 渲染与绑定 ─────────────────────────
  function current() { return st.steps[st.idx] || st.steps[0]; }

  function render() {
    var step = current();
    var html = '';
    if (step.kind === 'opening') html = viewOpening();
    else if (step.kind === 'pre') html = viewPre();
    else if (step.kind === 'genre') html = viewGenre();
    else if (step.kind === 'section') html = viewSection(step.sec, step.layer);
    else if (step.kind === 'recap') html = viewRecap();
    else if (step.kind === 'homework') html = viewHomework();

    st.stage.innerHTML = html;
    bind(step);

    if (step.kind === 'section') fitFigure(step.sec, st.focus);
    if (step.kind === 'opening') fitFigure(null, false);
    if (step.kind === 'recap') mountRecap();
    if (step.kind === 'section' && step.layer === 1) mountShape(step.sec);

    updateChrome();
  }

  // 让原书图在给定格子里「尽可能地大」，并保持真实页面比例 —— 热区百分比才落得准
  function fitFigure(sec, focus) {
    var wrap = st.stage.querySelector('.ls-figwrap');
    var fig = st.stage.querySelector('#lsFigure');
    if (!wrap || !fig) return;
    var W = wrap.clientWidth, H = wrap.clientHeight;
    if (!W || !H) return;
    var ratio = 1241 / 1754;
    var w = W, h = w / ratio;
    if (h > H) { h = H; w = h * ratio; }
    fig.style.width = w + 'px';
    fig.style.height = h + 'px';

    var inner = fig.querySelector('#lsFigStage');
    if (!inner) return;
    if (!focus || !sec || sec < 0) { inner.style.transform = 'none'; return; }
    var hot = (st.note.sections[sec] || {}).hot;
    if (!hot || !hot.w) { inner.style.transform = 'none'; return; }
    var s = Math.min(4, Math.max(1.5, 0.8 / hot.w));
    var tx = w / 2 - s * (hot.x + hot.w / 2) * w;
    var ty = h / 2 - s * (hot.y + hot.h / 2) * h;
    tx = Math.min(0, Math.max(w - s * w, tx));
    ty = Math.min(0, Math.max(h - s * h, ty));
    inner.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + s + ')';
    inner.style.transformOrigin = '0 0';
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
    var stage = st.stage;

    // 问题卡：点一下对答案
    stage.querySelectorAll('.ls-q').forEach(function (b) {
      b.addEventListener('click', function () { b.classList.toggle('on'); });
    });

    // 四层：点标题条就掀到那一层
    stage.querySelectorAll('.ls-layer-head').forEach(function (b) {
      b.addEventListener('click', function () {
        var L = parseInt(b.getAttribute('data-layer'), 10);
        gotoLayer(step.sec, L);
      });
    });

    // 词卡：点一下翻面
    stage.querySelectorAll('.ls-card').forEach(function (b) {
      b.addEventListener('click', function () { b.classList.toggle('flip'); });
    });

    var figT = stage.querySelector('[data-act="figtoggle"]');
    if (figT) {
      figT.addEventListener('click', function () {
        st.focus = !st.focus;
        render();
      });
    }

    stage.querySelectorAll('[data-rec]').forEach(function (b) {
      b.addEventListener('click', function () {
        st.rec = b.getAttribute('data-rec');
        render();
      });
    });

    var grid = stage.querySelector('#lsCardGrid');
    if (grid) {
      grid.querySelectorAll('.ls-card').forEach(function (b) {
        b.addEventListener('click', function () { b.classList.toggle('flip'); });
      });
    }
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
    if (cnt) cnt.textContent = (st.idx + 1) + ' / ' + st.steps.length + '　' + step.label;

    var prev = st.deck.querySelector('[data-act="prev"]');
    var next = st.deck.querySelector('[data-act="next"]');
    if (prev) prev.disabled = st.idx === 0;
    if (next) next.disabled = st.idx === st.steps.length - 1;

    // 路线图高亮：最后一个「起点 ≤ 当前」的停靠点
    var activeIdx = 0;
    st.stops.forEach(function (p) { if (p.idx <= st.idx) activeIdx = p.idx; });
    st.deck.querySelectorAll('.ls-rail-item').forEach(function (b) {
      b.classList.toggle('active', parseInt(b.getAttribute('data-idx'), 10) === activeIdx);
    });
  }

  // ───────────────────────── 骨架 ─────────────────────────
  function buildRail() {
    var rail = st.deck.querySelector('#lsRail');
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
          '<span class="ls-keys">← → 步进 · 1-4 跳段 · 空格 继续 · Esc 退出</span>' +
          '<button class="ls-exit" type="button" data-act="exit">退出上课模式</button>' +
        '</footer>' +
      '</div>';
    document.body.appendChild(deck);
    st.deck = deck;
    st.stage = deck.querySelector('#lsStage');

    deck.querySelector('[data-act="prev"]').addEventListener('click', prev);
    deck.querySelector('[data-act="next"]').addEventListener('click', next);
    deck.querySelector('[data-act="exit"]').addEventListener('click', close);
    buildRail();
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
    if (/^[1-9]$/.test(e.key)) { jumpSection(parseInt(e.key, 10) - 1); e.preventDefault(); }
  }

  // ───────────────────────── 进 / 出 ─────────────────────────
  function open(note) {
    note = note || resolveNote();
    if (!note) return;
    st.note = note;
    st.steps = buildSteps(note);
    st.idx = 0;
    st.focus = true;
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
    if (start) {
      start.addEventListener('click', function () { open(); });
    }
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', function () {
      if (st.deck && !st.deck.hidden) {
        var step = current();
        if (step.kind === 'section') fitFigure(step.sec, st.focus);
        else if (step.kind === 'opening') fitFigure(null, false);
      }
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
