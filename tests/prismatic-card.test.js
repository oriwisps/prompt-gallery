import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../examples/prismatic-card/index.html', import.meta.url), 'utf8');
function setup(reduce = false) {
  const events = {}, properties = {}, queue = new Map();
  let captured = null, time = 0, sequence = 0;
  const stage = {
    addEventListener: (name, cb) => events[name] = cb,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 330, height: 460 }),
    setPointerCapture: id => captured = id,
    hasPointerCapture: id => captured === id,
    releasePointerCapture: () => { captured = null; },
  };
  const card = { style: { setProperty: (name, value) => properties[name] = value } };
  const context = vm.createContext({
    document: { querySelector: s => s === '.stage' ? stage : card, addEventListener() {} },
    window: { addEventListener() {} },
    matchMedia: () => ({ matches: reduce, addEventListener() {} }),
    performance: { now: () => time },
    requestAnimationFrame: cb => { queue.set(++sequence, cb); return sequence; },
  });
  vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1], context);
  const tick = (count = 240) => {
    for (let i = 0; i < count && queue.size; i++) {
      time += 1000 / 60;
      const callbacks = [...queue.values()]; queue.clear();
      callbacks.forEach(cb => cb(time));
    }
  };
  const event = { pointerId: 1, pointerType: 'touch', isPrimary: true, button: 0, clientX: 330, clientY: 0 };
  return { events, properties, card, tick, event, queue };
}

test('touch follows position, ignores secondary pointers and springs to rest', () => {
  const t = setup();
  t.events.pointerdown(t.event); t.tick();
  assert.equal(t.card.style.transform, 'rotateX(12deg) rotateY(14deg)');
  assert.equal(t.properties['--px'], '100%');
  assert.equal(t.properties['--py'], '0%');
  t.events.pointermove({ ...t.event, pointerId: 2, clientX: 0 }); t.tick();
  assert.equal(t.card.style.transform, 'rotateX(12deg) rotateY(14deg)');
  t.events.pointerup(t.event); t.tick(1);
  assert.notEqual(t.card.style.transform, 'rotateX(0deg) rotateY(0deg)');
  t.tick();
  assert.equal(t.card.style.transform, 'rotateX(0deg) rotateY(0deg)');
  assert.equal(t.properties['--light'], '0.0000');
  assert.equal(t.queue.size, 0);
});

test('pointer cancellation returns to rest', () => {
  const t = setup(); t.events.pointerdown(t.event); t.tick();
  t.events.pointercancel(t.event); t.tick();
  assert.equal(t.card.style.transform, 'rotateX(0deg) rotateY(0deg)');
});

test('reduced motion keeps the card flat while preserving reflection', () => {
  const t = setup(true); t.events.pointerdown(t.event); t.tick();
  assert.equal(t.card.style.transform, 'rotateX(0deg) rotateY(0deg)');
  assert.equal(t.properties['--light'], '1.0000');
  assert.equal(t.queue.size, 0);
  t.events.pointerup(t.event); t.tick();
  assert.equal(t.properties['--light'], '0.0000');
});
