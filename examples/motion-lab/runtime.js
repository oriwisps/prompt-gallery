// Shared by the exported standalone examples; no network or third-party runtime.
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const animations = new Set();
function spring(initial, render, { stiffness = 260, damping = 25, epsilon = .002 } = {}) {
  let value = initial, velocity = 0, target = initial, frame = 0, last = 0, done;
  const api = {
    get value() { return value; },
    get velocity() { return velocity; },
    to(next, onDone) {
      target = next; done = onDone;
      if (motionPreference.matches) { api.jump(next); onDone?.(); return; }
      if (!frame) { last = performance.now(); frame = requestAnimationFrame(tick); }
    },
    jump(next) { cancelAnimationFrame(frame); frame = 0; value = target = next; velocity = 0; done = undefined; render(value, velocity); },
    stop() { cancelAnimationFrame(frame); frame = 0; done = undefined; },
    finish() { const callback = done; api.jump(target); callback?.(); },
    destroy() { api.stop(); animations.delete(api); },
  };
  function tick(now) {
    const dt = Math.min((now - last) / 1000, .032); last = now;
    for (let i = 0; i < 4; i++) {
      velocity += ((target - value) * stiffness - velocity * damping) * dt / 4;
      value += velocity * dt / 4;
    }
    if (Math.abs(value - target) < epsilon && Math.abs(velocity) < epsilon) {
      frame = 0; value = target; velocity = 0; render(value, velocity);
      const callback = done; done = undefined; callback?.();
    } else { render(value, velocity); frame = requestAnimationFrame(tick); }
  }
  animations.add(api); render(value, velocity); return api;
}
motionPreference.addEventListener('change', () => {
  if (motionPreference.matches) [...animations].forEach(animation => animation.finish());
});
window.addEventListener('pagehide', () => animations.forEach(animation => animation.stop()));
function metric(name, value) { const element = document.querySelector('[data-metric="' + name + '"]'); if (element) element.textContent = value; }
const history = [];
let traceTime = 0;
function trace(value) {
  const now = performance.now();
  if (now - traceTime < 28) return; traceTime = now;
  history.push(clamp(value, 0, 1)); if (history.length > 90) history.shift();
  const path = $('.trace path');
  if (path) path.setAttribute('d', history.map((point, i) => (i ? 'L' : 'M') + (i * 220 / 89).toFixed(1) + ',' + (80 - point * 65).toFixed(1)).join(' '));
}
function drag(element, { start, move, end }) {
  let pointer = null;
  element.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || pointer !== null) return;
    pointer = event.pointerId; element.setPointerCapture(pointer); start?.(event);
  });
  element.addEventListener('pointermove', event => { if (event.pointerId === pointer) move?.(event); });
  function finish(event, cancelled = false) {
    if (pointer === null || (event && event.pointerId !== pointer)) return;
    const id = pointer; pointer = null;
    if (element.hasPointerCapture(id)) element.releasePointerCapture(id);
    end?.(event, cancelled);
  }
  element.addEventListener('pointerup', event => finish(event));
  element.addEventListener('pointercancel', event => finish(event, true));
  element.addEventListener('lostpointercapture', event => finish(event, true));
  window.addEventListener('blur', () => finish(null, true));
  document.addEventListener('visibilitychange', () => { if (document.hidden) finish(null, true); });
}
