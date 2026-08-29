/* hall-seating.js — 礼堂排座纯逻辑模块（无 DOM 依赖）
   场地数据来源：大礼堂1-2楼.pdf 矢量提取（2026-08 校准）
   每排 segs = [x起点, x终点, 座位数]，坐标为座位中心（PDF 单位）
   排内座位号：从左到右 01 起连续编号
   区块：每层按过道分左/中/右三区，排座以区块为单位（v2 区块连座） */

export const HALL = {
  f1: {
    name: '一楼',
    rows: [
      { y: 3290.6, segs: [[3589.0, 5909.1, 13]] },
      { y: 3486.2, segs: [[808.0, 2161.4, 8], [3491.2, 6007.0, 14], [7317.2, 8670.5, 8]] },
      { y: 3681.0, segs: [[808.0, 2161.4, 8], [3393.7, 6104.4, 15], [7317.2, 8670.5, 8]] },
      { y: 3877.4, segs: [[614.7, 2161.4, 9], [3297.8, 6200.3, 16], [7317.2, 8863.8, 9]] },
      { y: 4073.0, segs: [[513.0, 2059.6, 9], [3200.2, 6297.9, 17], [7418.9, 8965.6, 9]] },
      { y: 4272.0, segs: [[411.2, 1959.1, 9], [3104.2, 6400.1, 18], [7525.9, 9073.9, 9]] },
      { y: 4467.8, segs: [[309.4, 1857.3, 9], [3007.3, 6497.1, 19], [7627.8, 9175.7, 9]] },
      { y: 4663.5, segs: [[411.2, 1765.6, 8], [2910.4, 6594.0, 20], [7719.4, 9073.9, 8]] },
      { y: 4859.3, segs: [[314.5, 1668.9, 8], [2813.5, 6690.9, 21], [7816.2, 9170.6, 8]] },
      { y: 5374.8, segs: [[2716.3, 6792.7, 22]] },
      { y: 5568.6, segs: [[101.8, 1657.3, 9], [2716.3, 6792.7, 22], [7827.8, 9383.3, 9]] },
      { y: 5762.8, segs: [[101.8, 1657.3, 9], [2716.3, 6792.7, 22], [7827.8, 9383.3, 9]] },
      { y: 5957.0, segs: [[101.8, 1657.3, 9], [2716.3, 6792.7, 22], [7827.8, 9383.3, 9]] },
      { y: 6151.2, segs: [[101.8, 1657.3, 9], [2716.3, 6792.7, 22], [7827.8, 9383.3, 9]] },
      { y: 6345.4, segs: [[101.8, 1657.3, 9], [2716.3, 6792.7, 22], [7827.8, 9383.3, 9]] },
      { y: 6539.6, segs: [[101.8, 1657.3, 9], [2716.3, 6792.7, 22], [7827.8, 9383.3, 9]] },
      { y: 6733.7, segs: [[101.8, 1657.3, 9], [2716.3, 6792.7, 22], [7827.8, 9383.3, 9]] },
      { y: 6927.9, segs: [[101.8, 1657.3, 9], [2716.3, 6792.7, 22], [7827.8, 9383.3, 9]] },
      { y: 7122.1, segs: [[101.8, 1657.3, 9], [2716.3, 6792.7, 22], [7827.8, 9383.3, 9]] },
      { y: 7316.3, segs: [[101.8, 1657.3, 9], [2716.3, 6792.7, 22], [7827.8, 9383.3, 9]] },
      { y: 7510.5, segs: [[101.8, 1657.3, 9], [2716.3, 6792.7, 22], [7827.8, 9383.3, 9]] },
      { y: 7700.1, segs: [[101.8, 1657.3, 9], [2716.3, 6792.7, 22], [7827.8, 9383.3, 9]] },
      { y: 7894.3, segs: [[295.6, 1657.3, 8], [2716.3, 6792.7, 22], [7827.8, 9189.4, 8]] },
      { y: 8088.5, segs: [[295.6, 1657.3, 8], [2716.3, 6792.7, 22], [7827.8, 9189.4, 8]] },
      { y: 8282.7, segs: [[295.6, 1657.3, 8], [2716.3, 6792.7, 22], [7827.8, 9189.4, 8]] },
      { y: 8477.7, segs: [[489.5, 1657.3, 7], [7827.8, 8995.6, 7]] },
      { y: 8671.7, segs: [[489.5, 1657.3, 7], [7827.8, 8995.6, 7]] }
    ]
  },
  f2: {
    name: '二楼',
    rows: [
      { y: 5491.0, segs: [[1015.8, 2356.5, 8], [3212.5, 7035.9, 21], [8156.9, 9499.6, 8]] },
      { y: 5682.5, segs: [[1015.8, 2356.5, 8], [3212.5, 7035.9, 21], [8156.9, 9499.6, 8]] },
      { y: 5873.9, segs: [[1015.8, 2356.5, 8], [3212.5, 7035.9, 21], [8156.9, 9499.6, 8]] },
      { y: 6065.4, segs: [[1015.8, 2356.5, 8], [3212.5, 7035.9, 21], [8156.9, 9499.6, 8]] },
      { y: 6256.9, segs: [[1207.0, 2356.5, 7], [3212.5, 7035.9, 21], [8156.9, 9308.4, 7]] },
      { y: 6448.4, segs: [[1398.1, 2356.5, 6], [3212.5, 7035.9, 21], [8156.9, 9117.3, 6]] },
      { y: 6639.9, segs: [[1782.3, 2356.5, 4], [3212.5, 7035.9, 21], [8156.9, 8924.3, 5]] }
    ]
  }
};

export const PALETTE = [
  '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc948',
  '#b07aa1', '#ff9da7', '#9c755f', '#8cd17d', '#b6992d', '#d37295'
];
export const COLOR_LEADER = '#6e7175';
export const COLOR_AWARD = '#d9a62e';

export const ZONE_NAMES = { L: '左区', M: '中区', R: '右区' };
const ZONE_ORDER_MID = ['M', 'L', 'R'];
const ZONE_ORDER_LTR = ['L', 'M', 'R'];

const pad2 = n => String(n).padStart(2, '0');
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function floorBounds(f) {
  let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
  f.rows.forEach(r => {
    yMin = Math.min(yMin, r.y); yMax = Math.max(yMax, r.y);
    r.segs.forEach(s => { xMin = Math.min(xMin, s[0]); xMax = Math.max(xMax, s[1]); });
  });
  return { xMin, xMax, yMin, yMax };
}

// 按段中心 x 归区：含楼层中心 → 中区；在其左 → 左区；在其右 → 右区
function zoneOfSeg(seg, cx) {
  return (seg[0] <= cx && seg[1] >= cx) ? 'M' : (seg[1] < cx ? 'L' : 'R');
}

function textColorFor(bg) {
  const c = bg.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16), g = parseInt(c.slice(2, 4), 16), b = parseInt(c.slice(4, 6), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 150 ? '#1d1d1f' : '#ffffff';
}

/* ---------- 排座 ---------- */

export function allocate(input) {
  const use2 = (input.floor2Count | 0) > 0;
  const seats = [];
  const floors = {};
  ['f1', 'f2'].forEach(fk => {
    const f = HALL[fk];
    const fb = floorBounds(f);
    const cx = (fb.xMin + fb.xMax) / 2;
    const rows = f.rows.map((r, ri) => {
      let n = 0;
      const rowSeats = [];
      r.segs.forEach(seg => {
        const [x0, x1, cnt] = seg;
        const zk = zoneOfSeg(seg, cx);
        for (let k = 0; k < cnt; k++) {
          const x = cnt === 1 ? x0 : x0 + k * (x1 - x0) / (cnt - 1);
          rowSeats.push({
            f: fk, fName: f.name, row: ri + 1, n: ++n, x, y: r.y, zone: zk,
            kind: (fk === 'f2' && !use2) ? 'unused' : 'empty',
            classId: null, className: '', student: null, color: null
          });
        }
      });
      return rowSeats;
    });
    floors[fk] = { key: fk, name: f.name, rows };
    rows.forEach(rs => seats.push(...rs));
  });

  // 领导席：一楼从最前排左侧占起
  let lead = input.leader && input.leader.enabled ? Math.max(0, input.leader.count | 0) : 0;
  if (lead > 0) {
    outer1:
    for (const rowSeats of floors.f1.rows) {
      for (const s of rowSeats) {
        if (s.kind !== 'empty') continue;
        s.kind = 'leader'; s.color = COLOR_LEADER;
        if (--lead <= 0) break outer1;
      }
    }
  }

  // 颁奖席：一楼从前排、主席台右侧（每排最右号往左）占起
  let aw = input.award && input.award.enabled ? Math.max(0, input.award.count | 0) : 0;
  const awardSeats = [];
  if (aw > 0) {
    outer2:
    for (const rowSeats of floors.f1.rows) {
      for (let i = rowSeats.length - 1; i >= 0; i--) {
        const s = rowSeats[i];
        if (s.kind !== 'empty') continue;
        s.kind = 'award'; s.color = COLOR_AWARD;
        awardSeats.push(s);
        if (--aw <= 0) break outer2;
      }
    }
  }
  if (input.award && Array.isArray(input.award.names)) {
    input.award.names.forEach((nm, i) => { if (awardSeats[i]) awardSeats[i].student = nm; });
  }

  // 班级：顺序即列表顺序（抽签在 UI 层完成）
  const classes = (input.classes || []).map(c => ({ ...c }));
  classes.forEach(c => {
    c.count = Math.max(0, c.count | 0);
    if (input.granularity === 'student' && Array.isArray(c.names) && c.names.length) c.count = c.names.length;
  });
  const active = classes.filter(c => c.count > 0);

  let n2 = Math.min(Math.max(input.floor2Count | 0, 0), Math.max(active.length - 1, 0));
  if (!active.length) n2 = 0;
  const f1c = active.slice(0, active.length - n2);
  const f2c = n2 > 0 ? active.slice(active.length - n2) : [];

  const colorOf = {};
  classes.forEach((c, i) => { colorOf[c.id] = PALETTE[i % PALETTE.length]; });

  function assignFloor(fk, cls) {
    const floorRows = floors[fk].rows;
    const zOrder = input.zoneOrder === 'ltr' ? ZONE_ORDER_LTR : ZONE_ORDER_MID;
    const back = input.direction === 'back';
    // 区块 = 左/中/右三区；整班原子落单区，绝不跨左右过道（横过道属同区自然延伸，不算拆散）
    const zones = zOrder
      .map(zk => {
        let rows = floorRows.map(rs => rs.filter(s => s.zone === zk && s.kind === 'empty')).filter(rs => rs.length);
        if (back) rows = rows.slice().reverse();
        return { zk, rows };
      })
      .filter(z => z.rows.length);

    // 每区独立指针
    const cursors = zones.map(() => ({ ri: 0, si: 0 }));
    const zoneRemain = i => {
      const z = zones[i], p = cursors[i];
      let rem = 0;
      for (let r = p.ri; r < z.rows.length; r++) rem += r === p.ri ? z.rows[r].length - p.si : z.rows[r].length;
      return rem;
    };
    // 在区 i 内从指针连续放 upTo 个座位（不跨出该区），并分配班内序号
    const fillZone = (c, i, upTo) => {
      const z = zones[i], p = cursors[i];
      let left = upTo, placed = 0;
      while (left > 0 && p.ri < z.rows.length) {
        const row = z.rows[p.ri];
        if (p.si >= row.length) { p.ri++; p.si = 0; continue; }
        const take = Math.min(left, row.length - p.si);
        const seg = row.slice(p.si, p.si + take);
        c.parts.push({ zone: z.zk, row: seg[0].row, from: seg[0].n, to: seg[seg.length - 1].n, count: take });
        seg.forEach(s => { s.kind = 'class'; s.classId = c.id; s.className = c.name; s.color = colorOf[c.id]; s.seq = ++c.seqNo; });
        left -= take; placed += take; p.si += take;
        if (p.si >= row.length) { p.ri++; p.si = 0; }
      }
      return placed;
    };

    cls.forEach(c => {
      const need = c.count;
      c.floor = fk;
      c.parts = [];
      c.seated = 0;
      c.unseated = need;
      c.seqNo = 0;
      if (need <= 0) { c.unseated = 0; return; }

      // 聚集第一：找第一个能整班装下的区，整班连续坐进去（绝不跨左右过道）
      for (let i = 0; i < zones.length; i++) {
        if (zoneRemain(i) < need) continue;
        c.seated += fillZone(c, i, need);
        c.unseated = 0;
        break;
      }
    });

    // 例外兜底（仅 compact 开启时）：牺牲聚集换坐满，把"整班未排"的班散填进剩余碎片位
    const stillEmpty = [];
    zones.forEach(z => z.rows.forEach(rs => rs.forEach(s => { if (s.kind === 'empty') stillEmpty.push(s); })));
    if (input.compact && stillEmpty.length) {
      let k = 0;
      cls.forEach(c => {
        if (c.unseated <= 0) return;
        let seqNo = c.seqNo;
        let cur = null;
        while (c.unseated > 0 && k < stillEmpty.length) {
          const s = stillEmpty[k];
          s.kind = 'class'; s.classId = c.id; s.className = c.name; s.color = colorOf[c.id]; s.seq = ++seqNo;
          if (!cur || cur.row !== s.row || cur.zone !== s.zone || cur.to !== s.n - 1) {
            cur = { zone: s.zone, row: s.row, from: s.n, to: s.n, count: 1 };
            c.parts.push(cur);
          } else { cur.to = s.n; cur.count++; }
          k++; c.unseated--; c.seated++;
        }
      });
    }

    // 学生级：按 parts 顺序逐人对号（含回填新增的 parts）
    if (input.granularity === 'student') {
      cls.forEach(c => {
        if (!Array.isArray(c.names) || !c.names.length) return;
        let k2 = 0;
        c.parts.forEach(p => {
          const rowSeats = floorRows.find(rs => rs[0].row === p.row);
          rowSeats.forEach(s => {
            if (s.kind === 'class' && s.classId === c.id && s.n >= p.from && s.n <= p.to) {
              s.student = c.names[k2++] || null;
            }
          });
        });
      });
    }
  }
  assignFloor('f2', f2c);
  // 二楼装不下的班整班挪回一楼（聚集第一：不拆散，只整体迁移到有空位的一楼大区）
  assignFloor('f1', f1c.concat(f2c.filter(c => c.unseated > 0)));

  const leaderCount = seats.filter(s => s.kind === 'leader').length;
  const awardCount = seats.filter(s => s.kind === 'award').length;
  const capacity = use2 ? 1179 : 933;
  const available = capacity - leaderCount - awardCount;
  const seated = active.reduce((a, c) => a + c.seated, 0);
  const totalPeople = active.reduce((a, c) => a + c.count, 0);

  return {
    seats, classes: active, colorOf,
    awardSeats,
    stats: {
      classCount: active.length, totalPeople, capacity, available,
      seated, empty: available - seated, unseated: totalPeople - seated,
      leaderCount, awardCount, use2
    }
  };
}

/* ---------- 手动调整 ---------- */

// 交换两个班的全部座位（身份对调），并重排班内序号与 parts；几何块形状不变，绝不新增拆散
export function swapClasses(res, idA, idB) {
  if (!idA || !idB || idA === idB) return;
  const byId = {};
  res.classes.forEach(c => { byId[c.id] = c; });
  const ca = byId[idA], cb = byId[idB];
  if (!ca || !cb) return;
  res.seats.forEach(s => {
    if (s.kind !== 'class') return;
    if (s.classId === idA) { s.classId = idB; s.className = cb.name; s.color = res.colorOf[idB]; }
    else if (s.classId === idB) { s.classId = idA; s.className = ca.name; s.color = res.colorOf[idA]; }
  });
  reindexRes(res);
}

// 依据当前 seats 的 classId 现状，重建每个班的 parts、班内序号、已坐/未坐
export function reindexRes(res) {
  const byId = {};
  res.classes.forEach(c => {
    byId[c.id] = c;
    c.parts = [];
    c.seated = 0;
    c.unseated = c.count;
    c.seqNo = 0;
    c.floor = null;
  });
  const cur = {};
  res.seats.forEach(s => {
    if (s.kind !== 'class' || !s.classId) return;
    const c = byId[s.classId];
    if (!c) return;
    if (c.floor === null) c.floor = s.f;
    const pc = cur[s.classId];
    if (pc && pc.zone === s.zone && pc.row === s.row && s.n === pc.to + 1) {
      pc.to = s.n; pc.count++;
    } else {
      const np = { zone: s.zone, row: s.row, from: s.n, to: s.n, count: 1 };
      c.parts.push(np);
      cur[s.classId] = np;
    }
    s.seq = ++c.seqNo;
    s.className = c.name;
    c.seated++;
    c.unseated = c.count - c.seated;
  });
}

/* ---------- 平面图 SVG ---------- */

export function buildPlanSVG(res, opts = {}) {
  const S = 0.15, PAD = 46, SQ = 27.5;
  const b1 = floorBounds(HALL.f1), b2 = floorBounds(HALL.f2);
  const W = Math.round((b1.xMax - b1.xMin) * S) + PAD * 2;
  const c1 = (b1.xMin + b1.xMax) / 2, c2 = (b2.xMin + b2.xMax) / 2;
  const X1 = x => (x - c1) * S + W / 2;
  const X2 = x => (x - c2) * S + W / 2;
  const STAGE_H = 76, GAP = 104;
  const f1Top = STAGE_H + 30;
  const Y1 = y => f1Top + (y - b1.yMin) * S;
  const f1H = (b1.yMax - b1.yMin) * S;
  const f2Top = f1Top + f1H + GAP;
  const Y2 = y => f2Top + (y - b2.yMin) * S;
  const f2H = (b2.yMax - b2.yMin) * S;
  const H = Math.round(f2Top + f2H + PAD);

  let g = '';
  // 舞台
  const sx0 = X1(2716), sx1 = X1(6793);
  g += `<rect x="${(sx0).toFixed(1)}" y="10" width="${(sx1 - sx0).toFixed(1)}" height="${STAGE_H - 16}" rx="12" class="stage-rect"/>`;
  g += `<text x="${(W / 2).toFixed(1)}" y="${(10 + (STAGE_H - 16) / 2 + 6).toFixed(1)}" text-anchor="middle" class="stage-label">主席台</text>`;
  g += `<text x="${PAD - 26}" y="24" class="floor-label">一楼</text>`;

  // 座位
  res.seats.forEach(s => {
    const X = (s.f === 'f1' ? X1 : X2)(s.x);
    const Y = (s.f === 'f1' ? Y1 : Y2)(s.y);
    const x = (X - SQ / 2).toFixed(1), y = (Y - SQ / 2).toFixed(1);
    const tip = `${s.fName}${ZONE_NAMES[s.zone] || ''} ${s.row}排 ${pad2(s.n)}号` +
      (s.kind === 'class' ? ` · ${s.className}${s.seq ? ` · 第${s.seq}号` : ''}` : '') +
      (s.student ? ` · ${s.student}` : '');
    let cls = 'seat', fill = '';
    if (s.kind === 'class') { fill = ` fill="${s.color}"`; }
    else if (s.kind === 'leader') { fill = ` fill="${COLOR_LEADER}"`; }
    else if (s.kind === 'award') { fill = ` fill="${COLOR_AWARD}"`; }
    else if (s.kind === 'unused') { cls = 'seat unused'; }
    else { cls = 'seat empty'; }
    const isSel = opts.highlightClass && s.kind === 'class' && s.classId === opts.highlightClass;
    const dc = s.kind === 'class' && s.classId ? ` data-class="${esc(s.classId)}"` : '';
    const selStyle = isSel ? ' style="stroke:#111111;stroke-width:2.8"' : '';
    g += `<g${dc}><rect x="${x}" y="${y}" width="${SQ}" height="${SQ}" rx="4"${fill} class="${cls}"${selStyle}/><title>${esc(tip)}</title>`;
    let label = '';
    if (s.kind === 'class') {
      if (opts.showNames && s.student) label = s.student;
      else if (opts.showNumbers && s.seq) label = String(s.seq);
    } else if (opts.showNumbers && s.kind !== 'unused') {
      label = pad2(s.n);
    }
    if (label) {
      const tc = s.color ? textColorFor(s.color) : '';
      g += `<text x="${X.toFixed(1)}" y="${(Y + (opts.showNames && label.length > 2 ? 2.5 : 3)).toFixed(1)}" text-anchor="middle" class="seat-txt${opts.showNames && label.length > 2 ? ' seat-name' : ''}"${tc ? ` fill="${tc}"` : ''}>${esc(label)}</text>`;
    }
    g += `</g>`;
  });

  // 班级名标签：直接标在每个班色块左上角（白底小标签），不用只看底部图例
  res.classes.forEach(c => {
    let mnX = Infinity, mnY = Infinity;
    res.seats.forEach(s => {
      if (s.classId !== c.id) return;
      const X = (s.f === 'f1' ? X1 : X2)(s.x);
      const Y = (s.f === 'f1' ? Y1 : Y2)(s.y);
      if (X < mnX) mnX = X;
      if (Y < mnY) mnY = Y;
    });
    if (!isFinite(mnX)) return;
    const fs = 14;
    const tw = [...c.name].reduce((w, ch) => w + (ch.charCodeAt(0) > 255 ? fs : fs * 0.6), 0) + 12;
    const bx = mnX - SQ / 2 + 1;
    const by = mnY - SQ / 2 + 1;
    g += `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${tw.toFixed(1)}" height="17" rx="4" fill="#ffffff" fill-opacity=".95" stroke="${res.colorOf[c.id]}" stroke-width="1.2" pointer-events="none"/>`;
    g += `<text x="${(bx + 6).toFixed(1)}" y="${(by + 13).toFixed(1)}" font-size="${fs}" font-weight="700" fill="#1d1d1f" style="font-family:-apple-system,'PingFang SC',sans-serif" pointer-events="none">${esc(c.name)}</text>`;
  });

  // 排号（双侧）
  ['f1', 'f2'].forEach(fk => {
    const Xf = fk === 'f1' ? X1 : X2, Yf = fk === 'f1' ? Y1 : Y2;
    HALL[fk].rows.forEach((r, ri) => {
      let mn = Infinity, mx = -Infinity;
      r.segs.forEach(s => { mn = Math.min(mn, s[0]); mx = Math.max(mx, s[1]); });
      const y = (Yf(r.y) + 3.5).toFixed(1);
      g += `<text x="${(Xf(mn) - SQ / 2 - 18).toFixed(1)}" y="${y}" text-anchor="middle" class="row-num">${ri + 1}</text>`;
      g += `<text x="${(Xf(mx) + SQ / 2 + 18).toFixed(1)}" y="${y}" text-anchor="middle" class="row-num">${ri + 1}</text>`;
    });
  });

  // 区块标签（左/中/右，画在各层第一排上方）
  ['f1', 'f2'].forEach(fk => {
    const Xf = fk === 'f1' ? X1 : X2, Yf = fk === 'f1' ? Y1 : Y2;
    const b = fk === 'f1' ? b1 : b2;
    const cx = (b.xMin + b.xMax) / 2;
    const zx = { L: [Infinity, -Infinity], M: [Infinity, -Infinity], R: [Infinity, -Infinity] };
    HALL[fk].rows.forEach(r => r.segs.forEach(sg => {
      const z = zoneOfSeg(sg, cx);
      zx[z][0] = Math.min(zx[z][0], sg[0]); zx[z][1] = Math.max(zx[z][1], sg[1]);
    }));
    const labelY = Yf(b.yMin) - 20;
    Object.keys(zx).forEach(z => {
      if (!isFinite(zx[z][0])) return;
      g += `<text x="${Xf((zx[z][0] + zx[z][1]) / 2).toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="middle" class="zone-label">${ZONE_NAMES[z]}</text>`;
    });
  });

  // 二楼分隔与标签
  g += `<line x1="${PAD - 22}" y1="${(f2Top - 44).toFixed(1)}" x2="${W - PAD + 22}" y2="${(f2Top - 44).toFixed(1)}" class="floor-sep"/>`;
  g += `<text x="${PAD - 26}" y="${(f2Top - 56).toFixed(1)}" class="floor-label">二楼 · 楼座</text>`;
  g += `<text x="${(W - PAD + 26).toFixed(1)}" y="${(f2Top - 56).toFixed(1)}" text-anchor="end" class="floor-note">阶梯收窄 · 前排护栏</text>`;

  // 底部图例（内嵌于 SVG，随导出/打印一起带走）
  const lg = [];
  res.classes.forEach(c => lg.push({ color: res.colorOf[c.id], name: c.name, n: c.count }));
  if (res.stats.leaderCount) lg.push({ color: COLOR_LEADER, name: '领导席', n: res.stats.leaderCount });
  if (res.stats.awardCount) lg.push({ color: COLOR_AWARD, name: '颁奖席', n: res.stats.awardCount });
  lg.push({ color: null, name: '空位', n: Math.max(res.stats.empty, 0) });

  const lgPer = 9, lgbx = 16, lgby = 13, lgLine = 20;
  const lgTop = H + 28;
  let lgg = `<line x1="${PAD - 22}" y1="${(H + 14).toFixed(1)}" x2="${W - PAD + 22}" y2="${(H + 14).toFixed(1)}" class="floor-sep"/>`;
  lg.forEach((it, i) => {
    const col = i % lgPer, row = Math.floor(i / lgPer);
    const sx = PAD + col * ((W - PAD * 2) / lgPer);
    const sy = lgTop + row * lgLine;
    lgg += `<rect x="${sx.toFixed(1)}" y="${(sy - lgby).toFixed(1)}" width="${lgbx}" height="${lgbx}" rx="3"${it.color ? ` fill="${it.color}"` : ''} class="lg-swatch${it.color ? '' : ' lg-empty'}"/>`;
    lgg += `<text x="${(sx + lgbx + 6).toFixed(1)}" y="${(sy - lgby + 12).toFixed(1)}" class="lg-text">${esc(it.name)} · ${it.n}</text>`;
  });
  const lgRows = Math.ceil(lg.length / lgPer);
  const H2 = Math.round(lgTop + lgRows * lgLine + 10);

  return `<svg viewBox="0 0 ${W} ${H2}" xmlns="http://www.w3.org/2000/svg" class="plan-svg" role="img" aria-label="礼堂座位平面图">${g}${lgg}</svg>`;
}

/* ---------- 图例 / 汇总 / 班级指引 ---------- */

export function buildLegendHTML(res) {
  const st = res.stats;
  let h = '';
  res.classes.forEach(c => {
    h += `<span class="lg-item"><i style="background:${res.colorOf[c.id]}"></i>${esc(c.name)}<b>${c.count}</b></span>`;
  });
  if (st.leaderCount) h += `<span class="lg-item"><i style="background:${COLOR_LEADER}"></i>领导席<b>${st.leaderCount}</b></span>`;
  if (st.awardCount) h += `<span class="lg-item"><i style="background:${COLOR_AWARD}"></i>颁奖席<b>${st.awardCount}</b></span>`;
  h += `<span class="lg-item"><i class="lg-empty"></i>空位<b>${st.empty >= 0 ? st.empty : 0}</b></span>`;
  return h;
}

const partText = p => `${p.row}排 ${pad2(p.from)}–${pad2(p.to)}号`;

export function buildSummaryHTML(res) {
  const st = res.stats;
  let rows = '';
  res.classes.forEach(c => {
    const floorName = c.floor === 'f1' ? '一楼' : '二楼';
    const zonesUsed = c.parts.length ? [...new Set(c.parts.map(p => p.zone))] : [];
    const loc = zonesUsed.length === 1 ? `${floorName}·${ZONE_NAMES[zonesUsed[0]]}` : floorName;
    const seatStr = c.parts.length
      ? c.parts.map(p => esc(partText(p))).join('<br>')
      : '<span class="miss">未排到座位</span>';
    const status = c.unseated > 0 ? `<span class="miss">差 ${c.unseated} 座</span>` : '✓';
    rows += `<tr><td>${esc(c.name)}</td><td>${esc(loc)}</td><td>${seatStr}</td><td>${c.seated}</td><td>${status}</td></tr>`;
  });
  rows += `<tr class="total"><td>合计 ${st.classCount} 个班</td><td></td><td>领导席 ${st.leaderCount} · 颁奖席 ${st.awardCount}</td><td>${st.seated}</td><td>${st.unseated > 0 ? `<span class="miss">${st.unseated} 人未排</span>` : '✓'}</td></tr>`;
  return `<table><thead><tr><th>班级</th><th>位置</th><th>座位安排</th><th>人数</th><th>状态</th></tr></thead><tbody>${rows}</tbody></table>`;
}

export function buildGuideHTML(res, opts = {}) {
  let h = '';
  res.classes.forEach(c => {
    const floorName = c.floor === 'f1' ? '一楼' : '二楼';
    const lines = c.parts.map(p =>
      `<div class="gd-line"><span class="gd-row">${esc(floorName)} · ${esc(ZONE_NAMES[p.zone] || '')} · 第${p.row}排</span><span class="gd-seats">${pad2(p.from)} – ${pad2(p.to)} 号</span><span class="gd-n">${p.count} 人</span></div>`
    ).join('');
    let names = '';
    if (opts.granularity === 'student' && Array.isArray(c.names) && c.names.length) {
      const detail = [];
      c.parts.forEach(p => {
        for (let n = p.from; n <= p.to; n++) {
          const idx = detail.length;
          detail.push(`<tr><td>第${p.row}排</td><td>${pad2(n)}号</td><td>${esc(c.names[idx] || '')}</td></tr>`);
        }
      });
      names = `<table class="gd-table"><thead><tr><th>排</th><th>座号</th><th>姓名</th></tr></thead><tbody>${detail.join('')}</tbody></table>`;
    }
    h += `<div class="gd-card">
      <div class="gd-head"><span class="gd-name">${esc(c.name)}</span><span class="gd-count">${c.count} 人${c.unseated > 0 ? `（差 ${c.unseated} 座）` : ''}</span></div>
      ${lines || '<div class="gd-line"><span class="miss">未排到座位</span></div>'}
      ${names}
      <div class="gd-foot">按座位号从左到右、从前到后入座 · 班主任带队对号</div>
    </div>`;
  });
  return h || '<p class="hint">先在左侧填班级和人数。</p>';
}
