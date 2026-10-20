// docs/reading/mindmap.js
//
// 阅读课 · 思维导图渲染（纯函数）
//
// 输入数据层 textbook_reading_notes.js 里的 mindmap / whole 结构：
//   { center, branches:[{ title, icon, points:[...] }] }
// 输出一段可缩放的 SVG（viewBox 自适应容器宽度）。
//
// 布局：中心节点在左，分支自上而下排列，分支下挂要点条。
// 纯计算 + 字符串拼接，不碰 DOM、不碰网络，可在 node 下直接跑测试。

(function () {
  'use strict';

  var FS = 13.5;          // 要点字号
  var TITLE_FS = 15;      // 分支标题字号
  var CENTER_FS = 16;     // 中心字号
  var POINT_PADX = 14;
  var POINT_PADY = 9;
  var POINT_W = 290;
  var POINT_GAP = 8;
  var BRANCH_W = 200;
  var BRANCH_H = 46;
  var INNER_GAP = 14;
  var BLOCK_GAP = 26;
  var CENTER_W = 168;
  var CENTER_H = 64;
  var GAP_X = 68;         // 中心 → 分支
  var INDENT = 28;        // 分支 → 要点
  var PAD = 26;
  var LINE_H = FS * 1.42;

  var BRANCH_ACCENTS = ['#0a84ff', '#30c39e', '#ff9f0a', '#af52de', '#ff6b5e', '#5ac8fa'];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // 粗略字宽：中日韩全角算 1 em，其余算 0.53 em
  function measureUnits(str) {
    var units = 0;
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      if (
        (c >= 0x2e80 && c <= 0x9fff) ||
        (c >= 0xf900 && c <= 0xfaff) ||
        (c >= 0xff00 && c <= 0xffef) ||
        (c >= 0x3000 && c <= 0x303f)
      ) units += 1;
      else units += 0.53;
    }
    return units;
  }

  // 按最大 em 宽度换行；CJK 无空格也能断，英文按词断
  function wrapText(text, maxUnits) {
    text = String(text == null ? '' : text);
    if (maxUnits <= 0) return [text];
    var tokens = [];
    // 把 CJK 逐字拆开，其余按空格分词
    var buf = '';
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      var code = text.charCodeAt(i);
      var isCJK =
        (code >= 0x2e80 && code <= 0x9fff) ||
        (code >= 0xf900 && code <= 0xfaff) ||
        (code >= 0xff00 && code <= 0xffef) ||
        (code >= 0x3000 && code <= 0x303f);
      if (isCJK) {
        if (buf) { tokens.push(buf); buf = ''; }
        tokens.push(c);
      } else if (c === ' ') {
        if (buf) { tokens.push(buf); buf = ''; }
        tokens.push(' ');
      } else {
        buf += c;
      }
    }
    if (buf) tokens.push(buf);

    var lines = [];
    var line = '';
    for (var t = 0; t < tokens.length; t++) {
      var piece = tokens[t];
      var test = line + piece;
      if (measureUnits(test.replace(/^\s+/, '')) > maxUnits && line.replace(/\s+$/, '')) {
        lines.push(line.replace(/\s+$/, ''));
        line = piece === ' ' ? '' : piece;
      } else {
        line = test;
      }
    }
    if (line.replace(/\s+$/, '')) lines.push(line.replace(/\s+$/, ''));
    return lines.length ? lines : [''];
  }

  function pointMaxUnits() {
    return (POINT_W - POINT_PADX * 2) / FS;
  }

  // 计算整张图的尺寸与每个节点的位置
  function layout(model) {
    model = model || {};
    var branches = Array.isArray(model.branches) ? model.branches : [];

    var blocks = branches.map(function (b) {
      var rawPoints = Array.isArray(b.points) ? b.points : [];
      var points = rawPoints.map(function (p) {
        var lines = wrapText(p, pointMaxUnits());
        var h = lines.length * LINE_H + POINT_PADY * 2;
        return { text: p, lines: lines, h: h };
      });
      var ph = points.reduce(function (s, p) { return s + p.h; }, 0) +
        Math.max(0, points.length - 1) * POINT_GAP;
      var h = BRANCH_H + (points.length ? INNER_GAP + ph : 0);
      return { branch: b, points: points, h: h };
    });

    var contentW = Math.max(BRANCH_W, INDENT + POINT_W);
    var width = PAD + CENTER_W + GAP_X + contentW + PAD;
    var height = PAD * 2 + blocks.reduce(function (s, b) { return s + b.h; }, 0) +
      Math.max(0, blocks.length - 1) * BLOCK_GAP;

    var branchX = PAD + CENTER_W + GAP_X;
    var y = PAD;
    blocks.forEach(function (block) {
      block.y = y;
      block.branchX = branchX;
      block.pointX = branchX + INDENT;
      y += block.h + BLOCK_GAP;
    });

    return {
      width: width,
      height: Math.max(height, CENTER_H + PAD * 2),
      center: { x: PAD, y: Math.max(PAD, height / 2 - CENTER_H / 2), w: CENTER_W, h: CENTER_H },
      branchX: branchX,
      blocks: blocks
    };
  }

  function roundedRect(x, y, w, h, r, fill, stroke) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
      '" rx="' + r + '" ry="' + r + '" fill="' + fill + '"' +
      (stroke ? ' stroke="' + stroke + '"' : '') + '/>';
  }

  function textLines(lines, x, y, fs, fill, weight) {
    var out = '';
    for (var i = 0; i < lines.length; i++) {
      out += '<text x="' + x + '" y="' + (y + i * LINE_H + fs * 0.98) +
        '" font-size="' + fs + '" fill="' + fill + '"' +
        (weight ? ' font-weight="' + weight + '"' : '') +
        ' font-family="-apple-system,BlinkMacSystemFont,\'Segoe UI\',\'PingFang SC\',\'Microsoft YaHei\',sans-serif">' +
        esc(lines[i]) + '</text>';
    }
    return out;
  }

  // 生成完整 SVG 字符串
  function buildSvg(model, palette) {
    palette = palette || {};
    var P = {
      center: palette.center || '#1d1d1f',
      centerText: palette.centerText || '#ffffff',
      centerSub: palette.centerSub || 'rgba(255,255,255,.82)',
      pointFill: palette.pointFill || '#ffffff',
      pointStroke: palette.pointStroke || 'rgba(0,0,0,.08)',
      pointText: palette.pointText || '#3a3a3c',
      line: palette.line || 'rgba(0,0,0,.16)'
    };

    var L = layout(model);
    var s = [];
    s.push('<svg viewBox="0 0 ' + L.width + ' ' + L.height +
      '" width="100%" preserveAspectRatio="xMidYMid meet" ' +
      'style="display:block;height:auto;overflow:visible" ' +
      'xmlns="http://www.w3.org/2000/svg" role="img">');

    // 中心节点的连接曲线（先画线，压在节点下面）
    var cMidY = L.center.y + L.center.h / 2;
    L.blocks.forEach(function (block) {
      var bMidY = block.y + BRANCH_H / 2;
      var x1 = L.center.x + CENTER_W;
      var x2 = block.branchX;
      var cx = (x1 + x2) / 2;
      s.push('<path d="M ' + x1 + ' ' + cMidY + ' C ' + cx + ' ' + cMidY + ', ' +
        cx + ' ' + bMidY + ', ' + x2 + ' ' + bMidY +
        '" fill="none" stroke="' + P.line + '" stroke-width="1.6" stroke-linecap="round"/>');
    });

    // 分支块
    L.blocks.forEach(function (block, bi) {
      var accent = block.branch.accent || BRANCH_ACCENTS[bi % BRANCH_ACCENTS.length];
      var bx = block.branchX;
      var by = block.y;

      // 分支标题卡
      s.push(roundedRect(bx, by, BRANCH_W, BRANCH_H, 12, accent, null));
      s.push('<text x="' + (bx + 16) + '" y="' + (by + BRANCH_H / 2 + TITLE_FS * 0.36) +
        '" font-size="' + TITLE_FS + '" font-weight="700" fill="#ffffff" ' +
        'font-family="-apple-system,BlinkMacSystemFont,\'Segoe UI\',\'PingFang SC\',sans-serif">' +
        esc((block.branch.icon ? block.branch.icon + ' ' : '') + block.branch.title) + '</text>');

      // 要点：左侧树枝 + 圆角条
      if (block.points.length) {
        var spineX = bx + 13;
        var firstChipY = by + BRANCH_H + INNER_GAP;
        var lastChip = block.points[block.points.length - 1];
        var lastChipMid = 0;
        var py = firstChipY;
        block.points.forEach(function (p, pi) {
          p._y = py;
          p._mid = py + p.h / 2;
          if (pi === block.points.length - 1) lastChipMid = p._mid;
          py += p.h + POINT_GAP;
        });
        s.push('<path d="M ' + spineX + ' ' + (by + BRANCH_H) + ' L ' + spineX + ' ' + lastChipMid +
          '" stroke="' + accent + '" stroke-width="1.6" opacity="0.5" stroke-linecap="round"/>');
        block.points.forEach(function (p) {
          s.push('<path d="M ' + spineX + ' ' + p._mid + ' L ' + block.pointX + ' ' + p._mid +
            '" stroke="' + accent + '" stroke-width="1.6" opacity="0.5"/>');
          s.push('<circle cx="' + spineX + '" cy="' + p._mid + '" r="2.6" fill="' + accent + '"/>');
          s.push(roundedRect(block.pointX, p._y, POINT_W, p.h, 10, P.pointFill, P.pointStroke));
          s.push(textLines(p.lines, block.pointX + POINT_PADX, p._y + POINT_PADY, FS, P.pointText, null));
        });
      }
    });

    // 中心节点（最后画，浮在最上）
    var c = L.center;
    s.push('<rect x="' + c.x + '" y="' + c.y + '" width="' + c.w + '" height="' + c.h +
      '" rx="18" ry="18" fill="' + P.center + '"/>');
    var parts = String(model.center == null ? '' : model.center).split('\n');
    var lineY = c.y + c.h / 2 - (parts.length - 1) * (CENTER_FS * 0.62) - CENTER_FS * 0.32;
    for (var i = 0; i < parts.length; i++) {
      s.push('<text x="' + (c.x + c.w / 2) + '" y="' + (lineY + i * CENTER_FS * 1.2) +
        '" font-size="' + CENTER_FS + '" font-weight="700" fill="' + P.centerText +
        '" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,\'PingFang SC\',sans-serif">' +
        esc(parts[i]) + '</text>');
    }

    s.push('</svg>');
    return s.join('');
  }

  function render(container, model, palette) {
    if (!container) return;
    container.innerHTML = buildSvg(model, palette);
  }

  window.ReadingMindmap = {
    measureUnits: measureUnits,
    wrapText: wrapText,
    layout: layout,
    buildSvg: buildSvg,
    render: render,
    BRANCH_ACCENTS: BRANCH_ACCENTS
  };
})();
