import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// 加载浏览器 IIFE 数据/纯模块（挂在 window 上），供 node:test 验证。
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

const w = loadWindow(['docs/grammar-fill/modules/question-points.js']);
const { buildQuestionPoints } = w.GrammarQuestionPoints;

// vm 沙箱里的对象原型与本 realm 不同，deepStrictEqual 会因原型不等而误报；按 JSON 比较。
const json = (v) => JSON.stringify(v);

test('word-comparative 题派生 points 带 subtype key（让比较级/最高级可分）', () => {
  const pts = buildQuestionPoints({
    category: 'word',
    fine_category: 'word-comparative',
    facets: { subtype: 'comparative' },
    answer: 'simpler',
  });
  assert.equal(json(pts), json([{ tag: 'word-comparative', key: 'comparative' }]));
});

test('subtype 缺省时 word-comparative 兜底为 comparative', () => {
  const pts = buildQuestionPoints({
    category: 'word',
    fine_category: 'word-comparative',
    facets: {},
    answer: 'better',
  });
  assert.equal(json(pts), json([{ tag: 'word-comparative', key: 'comparative' }]));
});

test('其余 word 派生题（形容词/副词/名词）仍是单标签无 key', () => {
  const adj = buildQuestionPoints({
    category: 'word',
    fine_category: 'word-adj',
    facets: { subtype: 'derivation' },
    answer: 'tired',
  });
  assert.equal(json(adj), json([{ tag: 'word-adj' }]));
});
