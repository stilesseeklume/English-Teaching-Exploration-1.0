import test from 'node:test';
import assert from 'node:assert/strict';

import {
  allocate,
  moveClass,
  moveStudents,
  swapStudents
} from '../docs/hall-seating/hall-seating.js';

function makeResult(countA = 4, countB = 4) {
  return allocate({
    classes: [
      { id: 'a', name: '一班', count: countA, names: [] },
      { id: 'b', name: '二班', count: countB, names: [] }
    ],
    direction: 'front',
    zoneOrder: 'mid',
    compact: false,
    floor2Count: 0,
    leader: { enabled: false, count: 0 },
    award: { enabled: false, count: 0, names: [] },
    granularity: 'class'
  });
}

const occupiedCount = res => res.seats.filter(s => s.kind === 'class').length;
const classCount = (res, id) => res.seats.filter(s => s.kind === 'class' && s.classId === id).length;

test('没有姓名名单的两个座位格也能互换', () => {
  const res = makeResult();
  const ia = res.seats.findIndex(s => s.classId === 'a');
  const ib = res.seats.findIndex(s => s.classId === 'b');

  assert.equal(res.seats[ia].student, null);
  assert.equal(res.seats[ib].student, null);
  assert.equal(swapStudents(res, ia, ib), true);
  assert.equal(res.seats[ia].classId, 'b');
  assert.equal(res.seats[ib].classId, 'a');
  assert.equal(classCount(res, 'a'), 4);
  assert.equal(classCount(res, 'b'), 4);
});

test('座位格向后移动不会丢人或洗牌全场', () => {
  const res = makeResult(6, 6);
  const source = res.seats.findIndex(s => s.classId === 'a');
  const target = res.seats.map((s, i) => ({ s, i })).filter(x => x.s.classId === 'b').at(-1).i;
  const before = occupiedCount(res);

  assert.equal(moveStudents(res, [source], target), true);
  assert.equal(occupiedCount(res), before);
  assert.equal(classCount(res, 'a'), 6);
  assert.equal(classCount(res, 'b'), 6);
  assert.equal(res.seats[target].classId, 'a');
  assert.equal(res.seats[source].classId, 'b');
});

test('整班换位只允许人数相同，避免人数错乱', () => {
  const unequal = makeResult(4, 5);
  const unequalTarget = unequal.seats.findIndex(s => s.classId === 'b');
  assert.equal(moveClass(unequal, 'a', unequalTarget), false);
  assert.equal(classCount(unequal, 'a'), 4);
  assert.equal(classCount(unequal, 'b'), 5);

  const equal = makeResult(4, 4);
  const aBefore = equal.seats.filter(s => s.classId === 'a').map(s => `${s.f}-${s.zone}-${s.row}-${s.n}`);
  const bBefore = equal.seats.filter(s => s.classId === 'b').map(s => `${s.f}-${s.zone}-${s.row}-${s.n}`);
  const target = equal.seats.findIndex(s => s.classId === 'b');
  assert.equal(moveClass(equal, 'a', target), true);
  const aAfter = equal.seats.filter(s => s.classId === 'a').map(s => `${s.f}-${s.zone}-${s.row}-${s.n}`);
  const bAfter = equal.seats.filter(s => s.classId === 'b').map(s => `${s.f}-${s.zone}-${s.row}-${s.n}`);
  assert.deepEqual(aAfter, bBefore);
  assert.deepEqual(bAfter, aBefore);
});
