import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function loadWindow(relPaths) {
  const window = {};
  const sandbox = { window, console };
  vm.createContext(sandbox);
  for (const p of relPaths) {
    const code = readFileSync(new URL('../' + p, import.meta.url), 'utf8');
    vm.runInContext(code, sandbox, { filename: p });
  }
  return window;
}

const w = loadWindow([
  'docs/data/decision_map.js',
  'docs/data/grammar_fine_tags.js',
]);

// Array.from 把 vm 沙箱数组重建到本 realm，否则派生数组带沙箱原型，deepEqual 会误报。
const NODES = Array.from(w.GRAMMAR_DECISION_MAP.nodes);
const TAG_IDS = new Set(w.GRAMMAR_FINE_TAGS.tags.map((t) => t.id));

const childCount = {};
NODES.forEach((n) => { if (n.parent) childCount[n.parent] = (childCount[n.parent] || 0) + 1; });
const leaves = NODES.filter((n) => !childCount[n.id]); // 无子节点 = 叶子
const leavesWithCat = leaves.filter((n) => n.cat); // 只有挂 cat 的叶子参与考点视图

// 取叶子在考点视图里实际用的 fine（point.tag 优先，否则 fine）
const leafFine = (n) => (n.point ? n.point.tag : n.fine);
const leafKeys = (n) => (n.point && n.point.keys ? n.point.keys.slice().sort() : null);

test('契约：每个叶子的 fine / point.tag 都存在于 grammar_fine_tags（杜绝死 tag）', () => {
  const bad = leavesWithCat.filter((n) => !TAG_IDS.has(leafFine(n)));
  assert.deepEqual(bad.map((n) => `${n.id}->${leafFine(n)}`), [], '存在指向不存在 tag 的叶子');
});

test('死 tag word-adj-vs-adv 不再被任何叶子引用', () => {
  assert.equal(leavesWithCat.some((n) => n.fine === 'word-adj-vs-adv'), false);
});

test('无假重复：共享同一 fine 的叶子最多一个 keyless 通配，其余 keys 互不相交', () => {
  const byFine = {};
  leavesWithCat.forEach((n) => {
    const f = leafFine(n);
    (byFine[f] = byFine[f] || []).push(n);
  });
  const offenders = [];
  Object.entries(byFine).forEach(([fine, ns]) => {
    if (ns.length < 2) return;
    const seen = new Set();
    let keyless = 0;
    ns.forEach((n) => {
      const keys = leafKeys(n);
      if (!keys || keys.length === 0) { keyless++; return; }  // 一个 keyless 通配合法（如被动语态的构成计全部被动）
      keys.forEach((k) => {
        if (seen.has(k)) offenders.push(`${fine}:${n.id}(key重复 ${k})`);
        seen.add(k);
      });
    });
    if (keyless > 1) offenders.push(`${fine}(多个无keys叶=假重复)`);  // 多个 keyless 才是真重复（原 4 叶比较级 bug）
  });
  assert.deepEqual(offenders, [], '共享 fine 的叶子存在假重复');
});

function leafKeyedBy(tag) {
  return leavesWithCat.filter((n) => leafFine(n) === tag && n.point).flatMap((n) => n.point.keys || []);
}
function leafCountByFine(tag) {
  return leavesWithCat.filter((n) => leafFine(n) === tag).length;
}

test('主谓一致并成一叶（pred-agreement 只剩 1 个叶子）', () => {
  assert.equal(leafCountByFine('pred-agreement'), 1);
});

test('派生副词 / 派生形容词 各并成一叶', () => {
  assert.equal(leafCountByFine('word-adv'), 1);
  assert.equal(leafCountByFine('word-adj'), 1);
});

test('比较级 / 最高级按 subtype 拆两叶', () => {
  assert.deepEqual(leafKeyedBy('word-comparative').sort(), ['comparative', 'superlative']);
});

test('关系代词 / 关系副词 / 并列连词 各并成一叶（词级区分交给 buildLeafWordBreakdown，不再假拆叶）', () => {
  assert.equal(leafCountByFine('attrib-pronoun'), 1);
  assert.equal(leafCountByFine('attrib-adverb'), 1);
  assert.equal(leafCountByFine('logic-coordinating'), 1);
});

test('语法填空不考的 tag 不建叶子（派生动词/情态/特殊句式/零冠词/as关系词）', () => {
  const banned = ['word-verb', 'art-zero', 'attrib-as',
    'modal-speculation', 'modal-ability-permission', 'modal-advice-obligation', 'modal-other',
    'special-subjunctive', 'special-emphasis', 'special-inversion', 'special-tag-question', 'special-ellipsis'];
  const present = banned.filter((t) => leavesWithCat.some((n) => leafFine(n) === t));
  assert.deepEqual(present, []);
});
