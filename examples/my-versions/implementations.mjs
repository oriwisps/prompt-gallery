// 仅根据案例提示词独立编写的第二版本实现。
// 不参考 motion-lab / prismatic-card 已有代码与视觉主题。

export const myVersions = [
  {
    match: "流体胶囊形变",
    name: "MiMo · 提示词独立实现",
    prompt:
      "实现胶囊按钮向弹窗面板的流体形态变换，尺寸与圆角采用高阻尼流体曲线（Fluid Morph）无缝过渡。",
    provider: "Xiaomi",
    model: "MiMo",
    parameters: "纯 HTML / CSS / JavaScript；高阻尼流体插值；无外部依赖",
    notes:
      "仅依据提示词独立实现：胶囊按钮展开为温控面板，宽高与圆角用高阻尼曲线同步过渡。未参考库中已有版本。支持指针、键盘与减少动态效果偏好。",
    theme: "glass",
    html: `<div class="scene">
  <div class="meta">
    <span class="tag">CLIMATE</span>
    <h1>Ambient<br>Control</h1>
    <p>轻触胶囊，展开完整温控面板。</p>
  </div>
  <div class="fluid" id="fluid" data-open="false">
    <button class="capsule" id="capsule" aria-expanded="false" aria-controls="panel" aria-label="展开温控面板">
      <span class="dot"></span>
      <span class="temp">22°</span>
      <span class="chev" aria-hidden="true">↗</span>
    </button>
    <section class="panel" id="panel" role="dialog" aria-label="温控面板" inert>
      <header class="panel-head">
        <div>
          <small>客厅 · 自动</small>
          <h2>温度</h2>
        </div>
        <button class="close control" type="button" aria-label="关闭">×</button>
      </header>
      <div class="dial" aria-hidden="true">
        <div class="ring"></div>
        <div class="core"><b id="dial-num">22</b><span>°C</span></div>
      </div>
      <div class="steps" role="group" aria-label="调节温度">
        <button class="step" type="button" data-delta="-1" aria-label="降低温度">−</button>
        <button class="step" type="button" data-delta="1" aria-label="升高温度">+</button>
      </div>
      <ul class="facts">
        <li><span>湿度</span><b>48%</b></li>
        <li><span>模式</span><b>静音</b></li>
        <li><span>能耗</span><b>低</b></li>
      </ul>
      <button class="apply close" type="button">应用设定</button>
      <p class="status" id="status" aria-live="polite"></p>
    </section>
  </div>
</div>`,
    css: `*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#10131a;color:#eef2ff;font-family:Inter,"Segoe UI","Microsoft YaHei",sans-serif;background-image:
  radial-gradient(ellipse at 20% 0,#3d5cff22,transparent 55%),
  radial-gradient(ellipse at 80% 100%,#7ef0c518,transparent 50%)}
.scene{width:min(420px,92vw);display:grid;gap:28px}
.meta .tag{display:inline-block;font:11px ui-monospace,monospace;letter-spacing:3px;color:#8fa4ff}
.meta h1{font-size:clamp(34px,8vw,48px);line-height:.98;letter-spacing:-1.5px;margin:12px 0 10px;font-weight:600}
.meta p{margin:0;color:#93a0b8;font-size:13px}
.fluid{position:relative;height:372px}
.capsule,.panel{position:absolute;left:0;top:0;will-change:width,height,border-radius}
.capsule{display:flex;align-items:center;gap:12px;width:168px;height:56px;padding:0 18px;border:0;border-radius:28px;background:linear-gradient(135deg,#6d8cff,#9a7bff);color:#fff;font:inherit;font-size:17px;font-weight:600;box-shadow:0 12px 40px #5b7cff55;cursor:pointer;z-index:2}
.capsule .dot{width:10px;height:10px;border-radius:50%;background:#c8ffe8;box-shadow:0 0 12px #9dffd4}
.capsule .temp{flex:1;text-align:left}
.capsule .chev{opacity:.75;font-size:15px}
.capsule[aria-expanded="true"]{pointer-events:none;opacity:0}
.panel{width:168px;height:56px;border-radius:28px;background:linear-gradient(160deg,#1b2233,#151a27 55%,#1a2438);border:1px solid #ffffff18;box-shadow:0 24px 60px #0007,inset 0 1px #ffffff14;overflow:hidden;padding:22px 22px 20px;display:flex;flex-direction:column;gap:14px;z-index:1}
.panel-head{display:flex;justify-content:space-between;align-items:flex-start;opacity:0;transform:translateY(10px)}
.panel-head small{font-size:11px;color:#8b9bb8;letter-spacing:1px}
.panel-head h2{margin:4px 0 0;font-size:22px;font-weight:600;letter-spacing:-.4px}
.close{border:0;background:#ffffff14;color:#e8eeff;width:34px;height:34px;border-radius:50%;font-size:20px;line-height:1;cursor:pointer}
.dial{position:relative;width:128px;height:128px;margin:2px auto 0;opacity:0;transform:scale(.7)}
.ring{position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 210deg,#6d8cff 0 40%,#7ef0c544 55%,#ffffff10 70%);mask:radial-gradient(farthest-side,transparent calc(100% - 10px),#000 0);-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 10px),#000 0)}
.core{position:absolute;inset:18px;border-radius:50%;background:#101522;display:grid;place-content:center;text-align:center;border:1px solid #ffffff10}
.core b{font-size:36px;font-weight:600;letter-spacing:-1px;line-height:1}
.core span{font-size:12px;color:#8fa0c0}
.steps{display:flex;gap:10px;justify-content:center;opacity:0}
.step{width:48px;height:48px;border-radius:16px;border:1px solid #ffffff1a;background:#ffffff08;color:#dfe7ff;font-size:22px;cursor:pointer}
.step:hover{background:#6d8cff33}
.facts{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;opacity:0}
.facts li{background:#ffffff08;border:1px solid #ffffff10;border-radius:12px;padding:10px 8px;text-align:center}
.facts span{display:block;font-size:10px;color:#8b9bb8;margin-bottom:4px}
.facts b{font-size:13px;font-weight:600}
.apply{width:100%;height:44px;border-radius:14px;background:linear-gradient(135deg,#6d8cff,#8f7bff);color:#fff;font:inherit;font-weight:600;font-size:14px;cursor:pointer;opacity:0}
.status{margin:0;min-height:16px;font-size:11px;color:#7ef0c5;text-align:center}
.control:focus-visible,.capsule:focus-visible,.step:focus-visible,.apply:focus-visible{outline:2px solid #7ef0c5;outline-offset:3px}
.fluid[data-open="true"] .panel{pointer-events:auto}`,
    js: `(() => {
const fluid = document.getElementById('fluid');
const capsule = document.getElementById('capsule');
const panel = document.getElementById('panel');
const dialNum = document.getElementById('dial-num');
const status = document.getElementById('status');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
let open = false;
let temp = 22;

// 高阻尼流体：三通道（宽/高/圆角）同一进度驱动，临界阻尼收敛。
const PILL = { w: 168, h: 56, r: 28 };
const BOARD = { w: 0, h: 0, r: 26 };

function measure() {
  const maxW = Math.min(fluid.clientWidth, 420);
  BOARD.w = maxW;
  BOARD.h = 348;
  paint(morph.value);
}

function paint(progress) {
  const w = PILL.w + (BOARD.w - PILL.w) * progress;
  const h = PILL.h + (BOARD.h - PILL.h) * progress;
  const r = PILL.r + (BOARD.r - PILL.r) * progress;
  fluid.style.setProperty('--w', w + 'px');
  Object.assign(panel.style, { width: w + 'px', height: h + 'px', borderRadius: r + 'px' });
  // 内容按进度分段显现
  const fade = (start, end) => clamp((progress - start) / (end - start), 0, 1);
  const head = panel.querySelector('.panel-head');
  const dial = panel.querySelector('.dial');
  const steps = panel.querySelector('.steps');
  const facts = panel.querySelector('.facts');
  const apply = panel.querySelector('.apply');
  head.style.opacity = fade(0.15, 0.45);
  head.style.transform = 'translateY(' + (1 - fade(0.15, 0.45)) * 10 + 'px)';
  dial.style.opacity = fade(0.25, 0.6);
  dial.style.transform = 'scale(' + (0.7 + 0.3 * fade(0.25, 0.6)) + ')';
  steps.style.opacity = fade(0.4, 0.7);
  facts.style.opacity = fade(0.5, 0.85);
  apply.style.opacity = fade(0.55, 0.95);
}

// 阻尼弹簧（stiffness 高、damping 大 → 流体感）
function makeSpring(initial) {
  let value = initial, target = initial, vel = 0, raf = 0, last = 0;
  const stiffness = 260, damping = 32, eps = 0.0015;
  function tick(now) {
    const dt = Math.min((now - last) / 1000, 0.033);
    last = now;
    const steps = 4, h = dt / steps;
    for (let i = 0; i < steps; i++) {
      vel += ((target - value) * stiffness - vel * damping) * h;
      value += vel * h;
    }
    if (Math.abs(value - target) < eps && Math.abs(vel) < eps) {
      value = target; vel = 0; raf = 0; paint(value); return;
    }
    paint(value);
    raf = requestAnimationFrame(tick);
  }
  return {
    get value() { return value; },
    to(next) {
      if (reduced.matches) { value = target = next; vel = 0; paint(value); return; }
      target = next;
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
    },
    jump(next) { cancelAnimationFrame(raf); raf = 0; value = target = next; vel = 0; paint(value); },
    stop() { cancelAnimationFrame(raf); raf = 0; },
  };
}

const morph = makeSpring(0);

function setExpanded(next) {
  open = next;
  fluid.dataset.open = String(open);
  capsule.setAttribute('aria-expanded', String(open));
  panel.inert = !open;
  morph.to(open ? 1 : 0);
  if (!open) {
    status.textContent = '';
    capsule.focus({ preventScroll: true });
  } else {
    status.textContent = '';
    panel.querySelector('.close').focus({ preventScroll: true });
  }
}

capsule.addEventListener('click', () => setExpanded(true));
panel.querySelectorAll('.close').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.classList.contains('apply')) status.textContent = '已应用 ' + temp + '°C';
    setExpanded(false);
  });
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && open) setExpanded(false);
});
panel.querySelectorAll('.step').forEach((btn) => {
  btn.addEventListener('click', () => {
    temp = clamp(temp + Number(btn.dataset.delta), 16, 30);
    dialNum.textContent = String(temp);
  });
});
reduced.addEventListener('change', () => morph.jump(open ? 1 : 0));
new ResizeObserver(() => measure()).observe(fluid);
measure();
morph.jump(0);
})();`,
  },
  {
    match: "共享元素无缝展开",
    name: "MiMo · 提示词独立实现",
    prompt:
      "实现Card到详情页的共享元素转场（Shared Element Transition），背景与Card容器做连续平滑缩放。",
    provider: "Xiaomi",
    model: "MiMo",
    parameters: "纯 HTML / CSS / JavaScript；共享元素布局测量；无外部依赖",
    notes:
      "仅依据提示词独立实现：专辑卡片点击后作为共享元素放大为详情页封面，列表背景同步缩放淡出。未参考库中已有版本。支持键盘与减少动态效果偏好。",
    theme: "plain",
    html: `<div class="app" id="app">
  <header class="top">
    <h1>Collection</h1>
    <p>4 张唱片，点选封面进入详情。</p>
  </header>
  <div class="grid" id="grid">
    <button class="card" data-id="0" data-title="Night Drive" data-artist="Lumen" data-year="2024" aria-expanded="false">
      <div class="art art-0"></div><span>Night Drive<small>Lumen</small></span>
    </button>
    <button class="card" data-id="1" data-title="Copper Rain" data-artist="Iris Vale" data-year="2023" aria-expanded="false">
      <div class="art art-1"></div><span>Copper Rain<small>Iris Vale</small></span>
    </button>
    <button class="card" data-id="2" data-title="Glass Harbor" data-artist="North Line" data-year="2025" aria-expanded="false">
      <div class="art art-2"></div><span>Glass Harbor<small>North Line</small></span>
    </button>
    <button class="card" data-id="3" data-title="Soft Static" data-artist="Field Notes" data-year="2022" aria-expanded="false">
      <div class="art art-3"></div><span>Soft Static<small>Field Notes</small></span>
    </button>
  </div>
  <section class="detail" id="detail" hidden aria-modal="true" role="dialog" aria-label="专辑详情">
    <button class="back control" type="button">← 返回</button>
    <div class="hero" id="hero" aria-hidden="true"></div>
    <div class="copy">
      <small class="year" id="d-year"></small>
      <h2 id="d-title"></h2>
      <p class="artist" id="d-artist"></p>
      <p class="blurb">连续平滑的共享元素转场：同一张封面从列表位飞入详情顶部，列表容器同步缩放淡出。</p>
      <button class="save" type="button">加入歌单</button>
      <p class="tip" id="tip" aria-live="polite"></p>
    </div>
  </section>
</div>`,
    css: `*{box-sizing:border-box}
body{margin:0;min-height:100vh;background:#12141a;color:#f2f4f8;font-family:Inter,"Segoe UI","Microsoft YaHei",sans-serif}
.app{position:relative;width:min(440px,100%);margin:0 auto;min-height:100vh;padding:28px 18px 40px;overflow:hidden}
.top h1{margin:0 0 6px;font-size:28px;letter-spacing:-.6px}
.top p{margin:0 0 22px;color:#8b93a5;font-size:12px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;transform-origin:50% 30%;will-change:transform,opacity}
.card{border:0;padding:0;background:#1c2030;border-radius:16px;overflow:hidden;text-align:left;color:inherit;font:inherit;cursor:pointer;display:block;transform-origin:0 0}
.art{aspect-ratio:1;border-radius:0}
.art-0{background:linear-gradient(145deg,#2b3a67,#7eb8da 45%,#f0e6d3)}
.art-1{background:linear-gradient(160deg,#5c2a2a,#d4a373 50%,#faedcd)}
.art-2{background:linear-gradient(135deg,#1b4332,#95d5b2 55%,#d8f3dc)}
.art-3{background:linear-gradient(150deg,#3d2c5e,#c77dff 50%,#e0aaff)}
.card span{display:block;padding:10px 12px 12px;font-size:12px;font-weight:600}
.card small{display:block;margin-top:3px;color:#8b93a5;font-weight:400;font-size:11px}
.card.focus-ring:focus-visible,.control:focus-visible,.save:focus-visible{outline:2px solid #7eb8da;outline-offset:3px}
.detail{position:absolute;inset:0;z-index:5;pointer-events:none;display:flex;flex-direction:column}
.detail:not([hidden]){pointer-events:none}
.hero{position:absolute;left:0;right:0;top:0;height:240px;border-radius:0;will-change:transform,width,height,border-radius;background:#2b3a67;z-index:2}
.copy{position:absolute;left:0;right:0;top:220px;padding:0 22px 30px;opacity:0;z-index:3;pointer-events:none}
.detail.ready .copy{pointer-events:auto}
.year{font-size:11px;letter-spacing:2px;color:#7eb8da}
.copy h2{margin:8px 0 4px;font-size:30px;letter-spacing:-.8px}
.artist{margin:0 0 14px;color:#a0a8ba;font-size:14px}
.blurb{margin:0 0 22px;color:#8b93a5;font-size:12px;line-height:1.7}
.save{border:0;border-radius:999px;padding:12px 22px;background:#f2f4f8;color:#12141a;font:inherit;font-weight:600;font-size:13px;cursor:pointer}
.tip{min-height:16px;margin:12px 0 0;font-size:11px;color:#95d5b2}
.back{position:absolute;top:18px;left:16px;z-index:4;background:#0009;border:0;color:#fff;border-radius:999px;padding:10px 14px;font-size:12px;cursor:pointer;opacity:0;pointer-events:none}
.detail.open .back{opacity:1;pointer-events:auto}
.detail.open .copy{opacity:1;transition:opacity .25s ease,transform .45s ease}
.detail:not(.open) .copy{transform:translateY(18px)}
.detail.open .copy{transform:translateY(0)}`,
    js: `(() => {
const app = document.getElementById('app');
const grid = document.getElementById('grid');
const detail = document.getElementById('detail');
const hero = document.getElementById('hero');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const cards = [...grid.querySelectorAll('.card')];
let active = null;
let raf = 0;

function clamp(v,a,b){return Math.min(b,Math.max(a,v));}

function springTo(from, to, ms, fn) {
  return new Promise((resolve) => {
    if (reduced.matches) { fn(to); resolve(); return; }
    const start = performance.now();
    cancelAnimationFrame(raf);
    function frame(now) {
      const t = clamp((now - start) / ms, 0, 1);
      // smoothstep ease for continuous shared-element feel
      const e = t * t * (3 - 2 * t);
      fn(from + (to - from) * e);
      if (t < 1) raf = requestAnimationFrame(frame);
      else resolve();
    }
    raf = requestAnimationFrame(frame);
  });
}

function artClass(card) {
  return card.querySelector('.art').className;
}

async function openCard(card) {
  if (active) return;
  active = card;
  const appRect = app.getBoundingClientRect();
  const art = card.querySelector('.art');
  const artRect = art.getBoundingClientRect();

  // 将卡片提升为共享元素，并记录归位锚点（下一兄弟）
  card.__next = card.nextElementSibling;
  card.disabled = true;
  card.setAttribute('aria-expanded', 'true');
  card.classList.add('flying');
  card.style.cssText = [
    'position:absolute',
    'left:' + (artRect.left - appRect.left) + 'px',
    'top:' + (artRect.top - appRect.top) + 'px',
    'width:' + artRect.width + 'px',
    'height:' + artRect.height + 'px',
    'margin:0',
    'z-index:6',
    'border-radius:16px',
    'overflow:hidden',
  ].join(';');
  app.appendChild(card);
  art.style.borderRadius = '0';

  document.getElementById('d-title').textContent = card.dataset.title;
  document.getElementById('d-artist').textContent = card.dataset.artist;
  document.getElementById('d-year').textContent = card.dataset.year;
  document.getElementById('tip').textContent = '';
  hero.style.background = getComputedStyle(art).backgroundImage;
  hero.style.opacity = '0';

  detail.hidden = false;
  grid.inert = true;
  detail.querySelector('.back').focus({ preventScroll: true });

  const target = { x: 0, y: 0, w: app.clientWidth, h: 240 };
  const start = {
    x: artRect.left - appRect.left,
    y: artRect.top - appRect.top,
    w: artRect.width,
    h: artRect.height,
  };

  detail.classList.add('open');
  await springTo(0, 1, 520, (p) => {
    const x = start.x + (target.x - start.x) * p;
    const y = start.y + (target.y - start.y) * p;
    const w = start.w + (target.w - start.w) * p;
    const h = start.h + (target.h - start.h) * p;
    const r = 16 * (1 - p);
    Object.assign(card.style, {
      left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px',
      borderRadius: r + 'px',
    });
    card.querySelector('span').style.opacity = String(clamp(1 - p * 3, 0, 1));
    const scale = 1 - 0.04 * p;
    grid.style.transform = 'scale(' + scale + ')';
    grid.style.opacity = String(1 - p * 0.55);
  });
  detail.classList.add('ready');
}

async function closeDetail() {
  if (!active) return;
  detail.classList.remove('ready', 'open');
  const card = active;
  const rectHost = card.__originRect;

  await springTo(1, 0, 420, (p) => {
    const inv = 1 - p;
    const x = rectHost.x * inv;
    const y = rectHost.y * inv;
    const w = rectHost.w + (app.clientWidth - rectHost.w) * p;
    const h = rectHost.h + (240 - rectHost.h) * p;
    const r = 16 * inv;
    Object.assign(card.style, {
      left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px',
      borderRadius: r + 'px',
    });
    card.querySelector('span').style.opacity = String(clamp((p - 0.6) * 2.5, 0, 1));
    grid.style.transform = 'scale(' + (0.96 + 0.04 * p) + ')';
    grid.style.opacity = String(0.45 + 0.55 * p);
  });

  // 按记录的兄弟锚点归位，保持列表顺序
  if (card.__next && card.__next.parentElement === grid) grid.insertBefore(card, card.__next);
  else grid.appendChild(card);
  card.style.cssText = '';
  card.disabled = false;
  card.setAttribute('aria-expanded', 'false');
  card.querySelector('.art').style.borderRadius = '';
  card.querySelector('span').style.opacity = '';
  grid.style.cssText = '';
  detail.hidden = true;
  grid.inert = false;
  card.focus({ preventScroll: true });
  active = null;
}

cards.forEach((card) => {
  card.addEventListener('click', () => {
    const appRect = app.getBoundingClientRect();
    const artR = card.querySelector('.art').getBoundingClientRect();
    card.__originRect = {
      x: artR.left - appRect.left,
      y: artR.top - appRect.top,
      w: artR.width,
      h: artR.height,
    };
    openCard(card);
  });
});
detail.querySelector('.back').addEventListener('click', closeDetail);
detail.querySelector('.save').addEventListener('click', () => {
  document.getElementById('tip').textContent = '已加入歌单';
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && active) closeDetail();
});
})();`,
  },
  {
    match: "磁吸游标与滚动码表",
    name: "MiMo · 提示词独立实现",
    prompt:
      "折线图横向滑动带数据点磁吸吸附，顶部数值使用滚动计数器（Odometer / Ticker）实时平滑联动。",
    provider: "Xiaomi",
    model: "MiMo",
    parameters: "纯 HTML / CSS / JavaScript；磁吸阈值 0.22；弹簧码表；无外部依赖",
    notes:
      "仅依据提示词独立实现：横向拖动折线图游标，靠近数据点时磁吸吸附，顶部码表滚轮联动。未参考库中已有版本。支持键盘与减少动态效果偏好。",
    theme: "plain",
    html: `<div class="panel">
  <p class="micro">WEEKLY FOCUS · 专注时长</p>
  <div class="readout">
    <div class="odometer" id="odo" aria-hidden="true"></div>
    <span class="unit">h</span>
  </div>
  <output class="sr-only" id="label">专注时长 3.2 小时</output>
  <div class="chart" id="chart" role="slider" tabindex="0" aria-label="每日专注数据点" aria-valuemin="1" aria-valuemax="8" aria-valuenow="1">
    <svg viewBox="0 0 360 200" id="svg">
      <g class="grid"></g>
      <path class="area"></path>
      <path class="line"></path>
      <g class="dots"></g>
      <line class="cursor" y1="12" y2="180"></line>
      <circle class="halo" r="12"></circle>
      <circle class="knob" r="5"></circle>
    </svg>
    <div class="ticks"><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span><span>今</span></div>
  </div>
  <p class="caption">第 <b id="idx">1</b> 个采样点 <span>靠近数据点将磁吸吸附</span></p>
</div>`,
    css: `*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#14161c;color:#f0f2f7;font-family:Inter,"Segoe UI","Microsoft YaHei",sans-serif}
.panel{width:min(420px,92vw);padding:8px}
.micro{font:10px ui-monospace,monospace;letter-spacing:2px;color:#7d8699;margin:0 0 14px}
.readout{display:flex;align-items:baseline;gap:10px;margin-bottom:18px}
.odometer{display:flex;height:64px;overflow:hidden;font:600 56px/64px ui-monospace,monospace;letter-spacing:-3px}
.digit{width:36px;height:64px;overflow:hidden}
.strip{will-change:transform}
.strip span{display:block;height:64px;text-align:center}
.point{width:14px;text-align:center}
.unit{font-size:18px;color:#7d8699}
.chart{touch-action:none;cursor:ew-resize;border-radius:16px;outline-offset:6px}
.chart:focus-visible{outline:2px solid #ffb454}
svg{width:100%;display:block;overflow:visible}
.grid path{stroke:#ffffff0d;fill:none;stroke-width:1}
.line{fill:none;stroke:#e8ecf5;stroke-width:2;stroke-linejoin:round}
.area{fill:#5b8def18}
.dots circle{fill:#6e9ef0}
.cursor{stroke:#ffb45470;stroke-width:1}
.halo{fill:#ffb45422}
.knob{fill:#ffb454;stroke:#ffd9a0;stroke-width:2}
.ticks{display:flex;justify-content:space-between;font-size:10px;color:#5c657a;padding:8px 6px 0}
.caption{border-top:1px solid #ffffff12;margin:16px 0 0;padding-top:14px;font-size:12px;color:#9aa3b5}
.caption b{color:#ffb454}
.caption span{float:right;font-size:10px;color:#5c657a}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`,
    js: `(() => {
const values = [3.2, 4.8, 2.6, 5.9, 4.1, 6.4, 5.2, 7.1];
const svg = document.getElementById('svg');
const chart = document.getElementById('chart');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (v,a,b)=>Math.min(b,Math.max(a,v));
const X = (i) => 24 + i * 312 / (values.length - 1);
const Y = (v) => 180 - (v - 1) / 7 * 150;

// 绘制
const pts = values.map((v,i)=>X(i)+','+Y(v)).join(' L');
svg.querySelector('.line').setAttribute('d','M'+pts);
svg.querySelector('.area').setAttribute('d','M'+X(0)+',180 L'+pts+' L'+X(values.length-1)+',180Z');
svg.querySelector('.dots').innerHTML = values.map((v,i)=>'<circle cx="'+X(i)+'" cy="'+Y(v)+'" r="3.5"/>').join('');
svg.querySelector('.grid').innerHTML = [40,80,120,160,180].map(y=>'<path d="M16 '+y+'H344"/>').join('');

// 码表滚轮
const odo = document.getElementById('odo');
function buildOdometer(){
  odo.innerHTML = '';
  const strips = [];
  for (let d = 0; d < 2; d++) {
    const digit = document.createElement('div');
    digit.className = 'digit';
    const strip = document.createElement('div');
    strip.className = 'strip';
    strip.innerHTML = Array.from({length:40},(_,n)=>'<span>'+(n%10)+'</span>').join('');
    // 初始停在 0（index 10）
    strip.style.transform = 'translateY(' + (-10 * 64) + 'px)';
    digit.appendChild(strip);
    odo.appendChild(digit);
    strips.push({ strip, target: 10, last: 0, vel: 0, value: 10 });
  }
  const point = document.createElement('span');
  point.className = 'point';
  point.textContent = '.';
  odo.appendChild(point);
  for (let d = 0; d < 1; d++) {
    const digit = document.createElement('div');
    digit.className = 'digit';
    const strip = document.createElement('div');
    strip.className = 'strip';
    strip.innerHTML = Array.from({length:40},(_,n)=>'<span>'+(n%10)+'</span>').join('');
    strip.style.transform = 'translateY(' + (-2 * 64) + 'px)';
    digit.appendChild(strip);
    odo.appendChild(digit);
    strips.push({ strip, target: 12, last: 2, vel: 0, value: 12 });
  }
  return strips;
}
const digits = buildOdometer();
// 初始化显示 3.2 → digits 3,1,2 with offset 10
digits[0].value = digits[0].target = 13; digits[0].last = 3;
digits[1].value = digits[1].target = 11; digits[1].last = 1;
digits[2].value = digits[2].target = 12; digits[2].last = 2;
digits.forEach(d=>{ d.strip.style.transform='translateY('+(-d.value*64)+'px)'; });

function rollNumber(value){
  const chars = value.toFixed(1).replace('.','').padStart(3,'0');
  digits.forEach((digit,i)=>{
    const next = Number(chars[i]);
    if (next === digit.last) return;
    let delta = next - digit.last;
    if (delta > 5) delta -= 10;
    if (delta < -5) delta += 10;
    digit.target += delta;
    digit.last = next;
    if (digit.target < 5) { digit.value += 10; digit.target += 10; }
    if (digit.target > 34) { digit.value -= 10; digit.target -= 10; }
  });
  animateDigits();
}

let digitRaf = 0;
function animateDigits(){
  if (reduced.matches) {
    digits.forEach(d=>{ d.value = d.target; d.vel = 0; d.strip.style.transform='translateY('+(-d.value*64)+'px)'; });
    return;
  }
  cancelAnimationFrame(digitRaf);
  function frame(){
    let moving = false;
    digits.forEach(d=>{
      const force = (d.target - d.value) * 280 - d.vel * 28;
      d.vel += force * (1/60);
      d.value += d.vel * (1/60);
      if (Math.abs(d.target - d.value) > 0.001 || Math.abs(d.vel) > 0.01) moving = true;
      else { d.value = d.target; d.vel = 0; }
      d.strip.style.transform = 'translateY(' + (-d.value * 64) + 'px)';
    });
    if (moving) digitRaf = requestAnimationFrame(frame);
  }
  digitRaf = requestAnimationFrame(frame);
}

// 游标磁吸
let selected = 0;
let cursorPos = 0; // 连续 index
let cursorTarget = 0;
let cursorRaf = 0;
let cursorVel = 0;

function paintCursor(index){
  const i = clamp(index, 0, values.length - 1);
  const lo = Math.floor(i), hi = Math.min(lo + 1, values.length - 1);
  const t = i - lo;
  const v = values[lo] + (values[hi] - values[lo]) * t;
  const cx = X(i), cy = Y(v);
  const cur = svg.querySelector('.cursor');
  cur.setAttribute('x1', cx); cur.setAttribute('x2', cx);
  ['.halo','.knob'].forEach(sel=>{
    const el = svg.querySelector(sel);
    el.setAttribute('cx', cx); el.setAttribute('cy', cy);
  });
  rollNumber(v);
  document.getElementById('label').textContent = '专注时长 ' + v.toFixed(1) + ' 小时';
}

function animateCursor(){
  if (reduced.matches) {
    cursorPos = cursorTarget; paintCursor(cursorPos); return;
  }
  cancelAnimationFrame(cursorRaf);
  function frame(){
    const force = (cursorTarget - cursorPos) * 320 - cursorVel * 30;
    cursorVel += force * (1/60);
    cursorPos += cursorVel * (1/60);
    if (Math.abs(cursorTarget - cursorPos) < 0.0005 && Math.abs(cursorVel) < 0.01) {
      cursorPos = cursorTarget; cursorVel = 0;
      paintCursor(cursorPos);
      return;
    }
    paintCursor(cursorPos);
    cursorRaf = requestAnimationFrame(frame);
  }
  cursorRaf = requestAnimationFrame(frame);
}

function setIndex(index, snap){
  selected = clamp(index, 0, values.length - 1);
  cursorTarget = selected;
  animateCursor();
  document.getElementById('idx').textContent = String(Math.round(selected) + 1);
  chart.setAttribute('aria-valuenow', Math.round(selected) + 1);
  chart.setAttribute('aria-valuetext', values[Math.round(selected)] + ' 小时');
  chart.dataset.snap = snap ? 'on' : 'off';
}

function follow(e){
  const r = svg.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width * 360;
  let idx = clamp((px - 24) / 312 * (values.length - 1), 0, values.length - 1);
  const nearest = Math.round(idx);
  const snapped = Math.abs(idx - nearest) < 0.22;
  if (snapped) idx = nearest;
  setIndex(idx, snapped);
}

// Pointer drag
let dragging = false;
chart.addEventListener('pointerdown', (e) => {
  dragging = true;
  chart.setPointerCapture(e.pointerId);
  chart.focus({ preventScroll: true });
  follow(e);
});
chart.addEventListener('pointermove', (e) => { if (dragging) follow(e); });
function endDrag(e){
  if (!dragging) return;
  dragging = false;
  try { chart.releasePointerCapture(e.pointerId); } catch {}
  setIndex(Math.round(selected), true);
}
chart.addEventListener('pointerup', endDrag);
chart.addEventListener('pointercancel', endDrag);
chart.addEventListener('keydown', (e) => {
  let t;
  if (e.key === 'ArrowRight' || e.key === 'ArrowUp') t = Math.round(selected) + 1;
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') t = Math.round(selected) - 1;
  else if (e.key === 'Home') t = 0;
  else if (e.key === 'End') t = values.length - 1;
  else return;
  e.preventDefault();
  setIndex(t, true);
});

setIndex(0, true);
})();`,
  },
  {
    match: "阻尼弹性抽屉",
    name: "MiMo · 提示词独立实现",
    prompt:
      "实现支持阻尼橡皮筋回弹的底部抽屉（Bottom Sheet），松手根据手势滑动速度（Velocity）自动计算吸附锚点。",
    provider: "Xiaomi",
    model: "MiMo",
    parameters: "纯 HTML / CSS / JavaScript；速度投影吸附；橡皮筋 0.25 阻尼；无外部依赖",
    notes:
      "仅依据提示词独立实现：底部抽屉支持三档锚点，拖动越界呈橡皮筋阻力，松手按速度投影选择吸附点。未参考库中已有版本。支持键盘与减少动态效果偏好。",
    theme: "plain",
    html: `<div class="phone">
  <div class="bg">
    <span class="badge">NOW PLAYING</span>
    <h2>Deep Work<br>Playlist</h2>
    <p>12 首专注曲目</p>
    <div class="cover" aria-hidden="true"></div>
  </div>
  <div class="shade" id="shade"></div>
  <section class="sheet" id="sheet" aria-label="播放列表抽屉">
    <div class="handle" id="handle" role="slider" tabindex="0" aria-label="抽屉高度" aria-valuemin="0" aria-valuemax="2" aria-valuenow="1">
      <i></i>
      <span>Up Next</span>
    </div>
    <div class="body" id="body">
      <ul class="tracks">
        <li><b>01</b><div><p>Focus Flow</p><small>4:12</small></div></li>
        <li><b>02</b><div><p>Glass Keys</p><small>3:48</small></div></li>
        <li><b>03</b><div><p>Night Study</p><small>5:01</small></div></li>
        <li><b>04</b><div><p>Soft Grid</p><small>4:33</small></div></li>
        <li><b>05</b><div><p>Calm Protocol</p><small>6:10</small></div></li>
      </ul>
      <button class="play" type="button">播放队列</button>
      <p class="hint">拖动手柄 · 快速甩动可跨锚点 · 超出边界有橡皮筋阻力</p>
    </div>
  </section>
</div>
<div class="toolbar">
  <button class="ctl" data-a="2" type="button">低</button>
  <button class="ctl on" data-a="1" type="button">中</button>
  <button class="ctl" data-a="0" type="button">全</button>
</div>`,
    css: `*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:#101318;color:#eef1f6;font-family:Inter,"Segoe UI","Microsoft YaHei",sans-serif;padding:20px}
.phone{position:relative;width:min(340px,92vw);height:520px;border-radius:28px;overflow:hidden;background:#181c24;border:1px solid #ffffff14;box-shadow:0 30px 80px #0008}
.bg{position:absolute;inset:0;padding:28px 22px}
.badge{font:10px ui-monospace,monospace;letter-spacing:2px;color:#8b93a5}
.bg h2{font-size:32px;line-height:1.05;letter-spacing:-1px;margin:14px 0 8px}
.bg p{margin:0;color:#8b93a5;font-size:12px}
.cover{margin-top:28px;height:160px;border-radius:18px;background:
  radial-gradient(circle at 30% 30%,#5b8def55,transparent 50%),
  radial-gradient(circle at 70% 70%,#c084fc44,transparent 45%),
  linear-gradient(145deg,#1e2433,#252c3d)}
.shade{position:absolute;inset:0;background:#000;opacity:.25;pointer-events:none}
.sheet{position:absolute;left:0;right:0;top:0;height:480px;border-radius:24px 24px 0 0;background:#f3f4f0;color:#15181f;box-shadow:0 -12px 40px #0004;will-change:transform;display:flex;flex-direction:column}
.handle{height:78px;display:flex;flex-direction:column;align-items:center;gap:14px;padding:12px 18px 0;touch-action:none;cursor:ns-resize;flex-shrink:0}
.handle i{width:36px;height:4px;border-radius:4px;background:#c5c9c0}
.handle span{align-self:flex-start;font-size:18px;font-weight:650}
.body{padding:4px 18px 22px;overflow:auto;overscroll-behavior:contain;flex:1;min-height:0}
.tracks{list-style:none;margin:0 0 18px;padding:0;display:grid;gap:8px}
.tracks li{display:flex;gap:12px;align-items:center;padding:12px;border-radius:14px;background:#00000008}
.tracks b{font:12px ui-monospace,monospace;color:#8a9184;width:22px}
.tracks p{margin:0;font-size:13px;font-weight:600}
.tracks small{color:#8a9184;font-size:11px}
.play{width:100%;border:0;border-radius:999px;background:#15181f;color:#f5f7f2;padding:14px;font:inherit;font-weight:600;font-size:13px;cursor:pointer}
.hint{margin:12px 0 0;text-align:center;font-size:10px;color:#8a9184;line-height:1.5}
.toolbar{display:flex;gap:8px}
.ctl{border:1px solid #ffffff22;background:#ffffff08;color:#c5cddd;border-radius:999px;padding:8px 16px;font:inherit;font-size:12px;cursor:pointer}
.ctl.on{background:#5b8def33;border-color:#5b8def;color:#9ec2ff}
.handle:focus-visible,.ctl:focus-visible,.play:focus-visible{outline:2px solid #5b8def;outline-offset:3px}`,
    js: `(() => {
const anchors = [48, 210, 400]; // top 位移：全/中/低
const sheet = document.getElementById('sheet');
const handle = document.getElementById('handle');
const shade = document.getElementById('shade');
const body = document.getElementById('body');
const phone = document.querySelector('.phone');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (v,a,b)=>Math.min(b,Math.max(a,v));
const LOW = 400, HIGH = 48, RUBBER = 0.25;

let anchor = 1;
let y = anchors[1];
let vel = 0;
let startY = 0, startV = 0, lastY = 0, lastT = 0;
let dragging = false;
let raf = 0;
let velSmooth = 0;

function paint(value){
  sheet.style.transform = 'translateY(' + value + 'px)';
  shade.style.opacity = String(clamp((420 - value) / 500, 0, .7));
  body.style.maxHeight = Math.max(0, phone.clientHeight - value - 78) + 'px';
  const over = Math.max(HIGH - value, value - LOW, 0);
  handle.dataset.over = over > 0 ? '1' : '0';
}

function rubber(value){
  if (value < HIGH) return HIGH - (HIGH - value) * RUBBER;
  if (value > LOW) return LOW + (value - LOW) * RUBBER;
  return value;
}

function springTo(target){
  cancelAnimationFrame(raf);
  if (reduced.matches) {
    y = target; vel = 0; paint(y); return;
  }
  const stiffness = 320, damping = 28, eps = 0.05;
  let last = performance.now();
  function frame(now){
    const dt = Math.min((now - last) / 1000, 0.033);
    last = now;
    const steps = 4, h = dt / steps;
    for (let i = 0; i < steps; i++) {
      vel += ((target - y) * stiffness - vel * damping) * h;
      y += vel * h;
    }
    if (Math.abs(target - y) < eps && Math.abs(vel) < eps) {
      y = target; vel = 0; paint(y);
      return;
    }
    paint(y);
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
}

function snap(index){
  anchor = clamp(index, 0, 2);
  handle.setAttribute('aria-valuenow', String(2 - anchor));
  handle.setAttribute('aria-valuetext', ['全屏','半屏','低位'][anchor]);
  document.querySelectorAll('.ctl').forEach(b => b.classList.toggle('on', Number(b.dataset.a) === anchor));
  springTo(anchors[anchor]);
}

handle.addEventListener('pointerdown', (e) => {
  dragging = true;
  cancelAnimationFrame(raf);
  handle.setPointerCapture(e.pointerId);
  startY = lastY = e.clientY;
  startV = y;
  lastT = performance.now();
  velSmooth = 0;
  vel = 0;
});
handle.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const now = performance.now();
  const dt = Math.max(now - lastT, 1);
  const inst = (e.clientY - lastY) / dt * 1000;
  velSmooth = 0.65 * velSmooth + 0.35 * inst;
  vel = velSmooth;
  lastY = e.clientY;
  lastT = now;
  const raw = startV + (e.clientY - startY);
  y = rubber(raw);
  paint(y);
});
function release(e){
  if (!dragging) return;
  dragging = false;
  try { handle.releasePointerCapture(e.pointerId); } catch {}
  if (performance.now() - lastT > 100) vel = 0;
  const projected = y + clamp(vel, -2400, 2400) * 0.16;
  let best = 0, dist = Infinity;
  anchors.forEach((a, i) => {
    const d = Math.abs(a - projected);
    if (d < dist) { dist = d; best = i; }
  });
  snap(best);
}
handle.addEventListener('pointerup', release);
handle.addEventListener('pointercancel', release);
handle.addEventListener('keydown', (e) => {
  if (!['ArrowUp','ArrowDown','Home','End'].includes(e.key)) return;
  e.preventDefault();
  if (e.key === 'Home') snap(0);
  else if (e.key === 'End') snap(2);
  else snap(anchor + (e.key === 'ArrowUp' ? -1 : 1));
});
document.querySelectorAll('.ctl').forEach(b => b.addEventListener('click', () => snap(Number(b.dataset.a))));
document.querySelector('.play').addEventListener('click', () => {
  document.querySelector('.hint').textContent = '队列已开始播放';
});
snap(1);
})();`,
  },
  {
    match: "动态弥散光晕边框",
    name: "MiMo · 提示词独立实现",
    prompt:
      "为Card添加旋转渐变描边（Conic Gradient Border），底部附带动态模糊的呼吸弥散背光。",
    provider: "Xiaomi",
    model: "MiMo",
    parameters: "纯 HTML / CSS / JavaScript；conic-gradient 描边；呼吸 blur；无外部依赖",
    notes:
      "仅依据提示词独立实现：卡片边框为旋转 conic 渐变描边，底部有随呼吸缩放的弥散背光。未参考库中已有版本。可暂停/调速，尊重减少动态效果偏好。",
    theme: "glow",
    html: `<div class="wrap" id="wrap">
  <div class="card">
    <div class="head"><span>ORBIT · 轨道勋章</span><i></i></div>
    <div class="art" aria-hidden="true">
      <span class="orbit"></span>
      <span class="planet"></span>
      <span class="moon"></span>
    </div>
    <div class="foot">
      <div>
        <small>BADGE</small>
        <b>Nova Run</b>
      </div>
      <div class="rank">
        <small>RANK</small>
        <b>#07</b>
      </div>
    </div>
  </div>
</div>
<div class="bar">
  <button class="ctl pause" type="button">暂停动画</button>
  <label class="speed">流速 <input type="range" min="0.3" max="2.2" step="0.1" value="1" aria-label="流光速度"></label>
</div>`,
    css: `*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;background:#0c0e14;color:#eef1f8;font-family:Inter,"Segoe UI","Microsoft YaHei",sans-serif;padding:24px}
.wrap{--angle:0deg;--glow:.5;--blur:28px;position:relative;width:min(320px,90vw);height:380px;margin-bottom:10px}
.wrap:before{content:"";position:absolute;left:8%;right:8%;bottom:-8%;height:42%;background:conic-gradient(from var(--angle),transparent 20%,#7cf0c8aa 42%,#6aa8ff88 52%,transparent 72%);filter:blur(var(--blur));opacity:var(--glow);z-index:0}
.card{position:relative;z-index:1;height:100%;border-radius:26px;border:1.5px solid transparent;background:
  linear-gradient(#141926,#101522) padding-box,
  conic-gradient(from var(--angle),#2a3550 0%,#7cf0c8 22%,#e8f7ff 35%,#6aa8ff 50%,#2a3550 70%,#7cf0c8 100%) border-box;
  overflow:hidden;padding:20px;display:flex;flex-direction:column}
.head{display:flex;justify-content:space-between;align-items:center;font:11px ui-monospace,monospace;letter-spacing:2px;color:#7cf0c8}
.head i{width:8px;height:8px;border-radius:50%;background:#7cf0c8;box-shadow:0 0 12px #7cf0c8}
.art{flex:1;position:relative;margin:18px 0}
.orbit{position:absolute;inset:18% 10%;border:1px solid #ffffff18;border-radius:50%;transform:rotate(-18deg)}
.orbit:after{content:"";position:absolute;inset:22% 18%;border:1px dashed #ffffff12;border-radius:50%}
.planet{position:absolute;left:50%;top:50%;width:54px;height:54px;margin:-27px 0 0 -27px;border-radius:50%;background:radial-gradient(circle at 32% 28%,#e7fff6,#7cf0c8 40%,#1a4a3c 75%,#0d2220);box-shadow:0 0 30px #7cf0c855}
.moon{position:absolute;left:72%;top:30%;width:12px;height:12px;border-radius:50%;background:#cfe4ff;box-shadow:0 0 10px #6aa8ff}
.foot{display:flex;justify-content:space-between;align-items:flex-end}
.foot small{display:block;font-size:9px;letter-spacing:2px;color:#6a7590;margin-bottom:4px}
.foot b{font-size:22px;font-weight:600;letter-spacing:-.4px}
.rank{text-align:right}
.bar{display:flex;gap:14px;align-items:center;flex-wrap:wrap;justify-content:center}
.ctl{border:1px solid #ffffff22;background:#ffffff08;color:#c9d4ea;border-radius:999px;padding:9px 18px;font:inherit;font-size:12px;cursor:pointer}
.speed{display:flex;align-items:center;gap:8px;font-size:12px;color:#8b95ad}
.speed input{accent-color:#7cf0c8;width:120px}
.ctl:focus-visible,.speed input:focus-visible{outline:2px solid #7cf0c8;outline-offset:3px}`,
    js: `(() => {
const wrap = document.getElementById('wrap');
const pauseBtn = document.querySelector('.pause');
const speedInput = document.querySelector('.speed input');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let angle = 120;
let phase = 0;
let speed = 1;
let paused = false;
let raf = 0;
let last = 0;

function paint(){
  const glow = 0.42 + 0.28 * Math.sin(phase);
  const blur = 24 + 10 * Math.sin(phase + 0.6);
  wrap.style.setProperty('--angle', angle + 'deg');
  wrap.style.setProperty('--glow', String(glow));
  wrap.style.setProperty('--blur', blur + 'px');
}

function tick(now){
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  angle = (angle + dt * 48 * speed) % 360;
  phase += dt * 1.5;
  paint();
  raf = requestAnimationFrame(tick);
}

function sync(){
  cancelAnimationFrame(raf);
  raf = 0;
  const still = paused || reduced.matches;
  pauseBtn.textContent = reduced.matches ? '已遵循减少动态效果' : paused ? '继续动画' : '暂停动画';
  pauseBtn.disabled = reduced.matches;
  if (!still && !document.hidden) {
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }
  paint();
}

pauseBtn.addEventListener('click', () => { paused = !paused; sync(); });
speedInput.addEventListener('input', () => { speed = Number(speedInput.value); });
document.addEventListener('visibilitychange', sync);
reduced.addEventListener('change', () => { paused = reduced.matches; sync(); });
window.addEventListener('pagehide', () => cancelAnimationFrame(raf));
sync();
})();`,
  },
  {
    match: "物理弹簧交错流",
    name: "MiMo · 提示词独立实现",
    prompt:
      "列表元素入场使用交错动画（Stagger Delay），每个子项带微弱弹性向上滑入（Spring Cascade）。",
    provider: "Xiaomi",
    model: "MiMo",
    parameters: "纯 HTML / CSS / JavaScript；交错延迟可调；临界阻尼弹簧；无外部依赖",
    notes:
      "仅依据提示词独立实现：任务卡片列表交错弹入，间隔可调，尊重减少动态效果偏好。未参考库中已有版本。",
    theme: "orbit",
    html: `<div class="phone">
  <header>
    <h2>Today</h2>
    <p>6 项任务，依次抵达</p>
  </header>
  <ul class="list" id="list">
    <li class="item"><i>1</i><div><b>Review design tokens</b><span>09:00</span></div></li>
    <li class="item"><i>2</i><div><b>Ship motion lab notes</b><span>10:30</span></div></li>
    <li class="item"><i>3</i><div><b>Sync with studio</b><span>13:00</span></div></li>
    <li class="item"><i>4</i><div><b>Prototype press feel</b><span>15:20</span></div></li>
    <li class="item"><i>5</i><div><b>Write changelog</b><span>16:45</span></div></li>
    <li class="item"><i>6</i><div><b>Evening stretch</b><span>18:00</span></div></li>
  </ul>
</div>
<div class="bar">
  <button class="ctl replay" type="button">重播入场</button>
  <label class="delay">间隔 <input type="range" min="40" max="200" step="10" value="90" aria-label="交错间隔"></label>
  <span class="stat" id="stat">0 / 6</span>
</div>`,
    css: `*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:#12151c;color:#edf1f7;font-family:Inter,"Segoe UI","Microsoft YaHei",sans-serif;padding:20px}
.phone{width:min(360px,92vw);background:#1a1f2a;border:1px solid #ffffff12;border-radius:24px;padding:22px 18px 14px;box-shadow:0 24px 60px #0006}
header h2{margin:0 0 4px;font-size:26px;letter-spacing:-.6px}
header p{margin:0 0 16px;font-size:12px;color:#8b95ab}
.list{list-style:none;margin:0;padding:0 0 8px;display:grid;gap:10px;max-height:360px;overflow:auto;scrollbar-width:thin}
.item{display:flex;gap:12px;align-items:center;padding:14px;border-radius:16px;background:#222936;border:1px solid #ffffff10;will-change:transform,opacity;transform-origin:50% 100%}
.item i{width:28px;height:28px;border-radius:10px;display:grid;place-content:center;font:12px ui-monospace,monospace;font-style:normal;background:#5b8def33;color:#9ec2ff}
.item b{display:block;font-size:13px;font-weight:600}
.item span{font-size:11px;color:#8b95ab}
.bar{display:flex;gap:12px;align-items:center;flex-wrap:wrap;justify-content:center}
.ctl{border:1px solid #ffffff22;background:#ffffff08;color:#c9d4ea;border-radius:999px;padding:9px 18px;font:inherit;font-size:12px;cursor:pointer}
.delay{display:flex;align-items:center;gap:8px;font-size:12px;color:#8b95ab}
.delay input{accent-color:#5b8def;width:110px}
.stat{font:12px ui-monospace,monospace;color:#5b8def;min-width:42px}
.ctl:focus-visible,.delay input:focus-visible{outline:2px solid #5b8def;outline-offset:3px}`,
    js: `(() => {
const items = [...document.querySelectorAll('.item')];
const replayBtn = document.querySelector('.replay');
const delayInput = document.querySelector('.delay input');
const stat = document.getElementById('stat');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let delay = 90;
let timers = [];
let springs = [];
let gen = 0;

function makeSpring(){
  let value = 0, target = 0, vel = 0, raf = 0, last = 0, done;
  const k = 260, c = 22, eps = 0.0015;
  function tick(now){
    const dt = Math.min((now - last) / 1000, 0.033);
    last = now;
    const steps = 4, h = dt / steps;
    for (let i = 0; i < steps; i++) {
      vel += ((target - value) * k - vel * c) * h;
      value += vel * h;
    }
    if (Math.abs(value - target) < eps && Math.abs(vel) < eps) {
      value = target; vel = 0; raf = 0;
      const cb = done; done = undefined; cb && cb();
      return;
    }
    raf = requestAnimationFrame(tick);
  }
  return {
    to(next, cb){
      if (reduced.matches) { value = target = next; cb && cb(); return; }
      target = next; done = cb;
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
    },
    stop(){ cancelAnimationFrame(raf); raf = 0; },
  };
}

function paint(item, p){
  const t = clamp(p, 0, 1);
  item.style.opacity = String(t);
  item.style.transform = 'translateY(' + (1 - t) * 40 + 'px) scale(' + (1 - (1 - t) * 0.04) + ')';
}
function clamp(v,a,b){return Math.min(b,Math.max(a,v));}

function replay(){
  gen++;
  const g = gen;
  timers.forEach(clearTimeout); timers = [];
  springs.forEach(s => s.stop()); springs = [];
  let finished = 0;
  document.getElementById('list').scrollTop = 0;
  stat.textContent = '0 / ' + items.length;
  items.forEach((item, i) => {
    const s = makeSpring();
    springs.push(s);
    paint(item, 0);
    function enter(){
      if (g !== gen) return;
      s.to(1, () => {
        finished++;
        stat.textContent = finished + ' / ' + items.length;
      });
    }
    if (reduced.matches) enter();
    else timers.push(setTimeout(enter, i * delay));
  });
}

replayBtn.addEventListener('click', replay);
delayInput.addEventListener('input', () => { delay = Number(delayInput.value); });
reduced.addEventListener('change', replay);
window.addEventListener('pagehide', () => {
  timers.forEach(clearTimeout);
  springs.forEach(s => s.stop());
});
replay();
})();`,
  },
  {
    match: "弹性微缩触觉反馈",
    name: "MiMo · 提示词独立实现",
    prompt:
      "按钮按压添加scale(0.96)物理弹性压缩与深度内阴影，释放时触发轻微超调回弹（Spring Overshoot）。",
    provider: "Xiaomi",
    model: "MiMo",
    parameters: "纯 HTML / CSS / JavaScript；压缩至 0.96；超调回弹；无外部依赖",
    notes:
      "仅依据提示词独立实现：按压压缩至 scale(0.96) 并加深内阴影，释放时弹簧超调回弹。未参考库中已有版本。支持空格/回车与减少动态效果偏好。",
    theme: "plain",
    html: `<div class="stage">
  <p class="eyebrow">HAPTIC PREVIEW</p>
  <h1>Feel the press.</h1>
  <button class="btn" id="btn" type="button">
    <span class="label">Launch</span>
    <span class="arrow" aria-hidden="true">→</span>
  </button>
  <p class="status" id="status" aria-live="polite">按住按钮感受压缩与回弹</p>
  <div class="meter" aria-hidden="true">
    <div class="bar" id="bar"></div>
  </div>
</div>`,
    css: `*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#101218;color:#f0f2f7;font-family:Inter,"Segoe UI","Microsoft YaHei",sans-serif}
.stage{width:min(400px,92vw);text-align:center;padding:20px}
.eyebrow{font:11px ui-monospace,monospace;letter-spacing:3px;color:#7d8699;margin:0 0 10px}
h1{font-size:clamp(28px,6vw,36px);letter-spacing:-1px;margin:0 0 36px;font-weight:600}
.btn{width:100%;display:flex;align-items:center;justify-content:center;gap:16px;border:0;border-radius:999px;padding:26px 18px;background:linear-gradient(180deg,#2f3545,#1c2130);color:#f4f6fb;font:inherit;font-size:24px;font-weight:600;cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none;will-change:transform;box-shadow:0 10px 28px #0006, inset 0 1px #ffffff22}
.btn .arrow{font-size:20px;opacity:.8}
.status{min-height:22px;margin:22px 0 18px;font-size:13px;color:#8b93a5}
.meter{height:6px;border-radius:99px;background:#ffffff10;overflow:hidden}
.bar{height:100%;width:0%;border-radius:99px;background:linear-gradient(90deg,#5b8def,#7cf0c8);transition:width .05s linear}
.btn:focus-visible{outline:2px solid #7cf0c8;outline-offset:4px}`,
    js: `(() => {
const btn = document.getElementById('btn');
const status = document.getElementById('status');
const bar = document.getElementById('bar');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (v,a,b)=>Math.min(b,Math.max(a,v));
let pressed = false;
let launches = 0;
let peak = 0;

// 弹簧：压缩轻阻尼 → 释放允许超调
let value = 1, vel = 0, target = 1, raf = 0, last = 0;
const k = 420, c = 18, eps = 0.00008;

function paint(v){
  btn.style.transform = 'scale(' + v + ')';
  const depth = clamp((1 - v) / 0.04, 0, 1);
  btn.style.boxShadow =
    'inset 0 ' + (depth * 8) + 'px ' + (depth * 18) + 'px rgba(0,0,0,.55), ' +
    '0 ' + (10 - depth * 8) + 'px ' + (28 - depth * 14) + 'px rgba(0,0,0,.45), ' +
    'inset 0 1px rgba(255,255,255,.14)';
  peak = Math.max(peak, (v - 1) * 100);
  bar.style.width = clamp((v - 0.94) / 0.08 * 100, 0, 100) + '%';
}

function tick(now){
  const dt = Math.min((now - last) / 1000, 0.033);
  last = now;
  const steps = 4, h = dt / steps;
  for (let i = 0; i < steps; i++) {
    vel += ((target - value) * k - vel * c) * h;
    value += vel * h;
  }
  if (Math.abs(value - target) < eps && Math.abs(vel) < eps) {
    value = target; vel = 0; raf = 0; paint(value); return;
  }
  paint(value);
  raf = requestAnimationFrame(tick);
}

function to(next){
  if (reduced.matches) { value = target = next; vel = 0; paint(value); return; }
  target = next;
  if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
}

function down(){
  if (pressed) return;
  pressed = true;
  peak = 0;
  to(0.96);
}
function up(){
  if (!pressed) return;
  pressed = false;
  to(1);
}

btn.addEventListener('pointerdown', (e) => {
  btn.setPointerCapture(e.pointerId);
  down();
});
btn.addEventListener('pointerup', up);
btn.addEventListener('pointercancel', up);
btn.addEventListener('keydown', (e) => {
  if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); down(); }
});
btn.addEventListener('keyup', (e) => {
  if (e.key === ' ' || e.key === 'Enter') up();
});
btn.addEventListener('blur', up);
window.addEventListener('blur', up);
btn.addEventListener('click', () => {
  launches++;
  status.textContent = '已发射 · 第 ' + launches + ' 次 · 超调 +' + peak.toFixed(1) + '%';
});
paint(1);
})();`,
  },
  {
    match: "流光触感卡片",
    name: "MiMo · 提示词独立实现",
    prompt:
      "为card添加跟随触摸位置的3D透视倾斜与径向反射流光，松手带Spring阻尼回正。",
    provider: "Xiaomi",
    model: "MiMo",
    parameters: "纯 HTML / CSS / JavaScript；倾角 X±10° Y±14°；弹簧 220/20；无外部依赖",
    notes:
      "仅依据提示词独立实现：卡片跟随指针 3D 倾斜与径向反光，松手弹簧回正。未参考库中已有版本。支持方向键与减少动态效果偏好。",
    theme: "glass",
    html: `<main>
  <header>
    <h1>Light, under your thumb.</h1>
    <p>Perspective card · radial sheen · spring return</p>
  </header>
  <div class="stage" id="stage" tabindex="0" role="img"
    aria-label="流光卡片。移动指针或按住拖动体验倾斜与反光，松手弹性回正；方向键也可控制。">
    <article class="card" id="card">
      <div class="sheen" aria-hidden="true"></div>
      <div class="content">
        <div class="row">
          <span>AETHER</span>
          <span class="chip">∞</span>
        </div>
        <div class="mid">
          <b>Prism</b>
          <p>触感流光系列</p>
        </div>
        <div class="row bottom">
          <span>•••• 2048</span>
          <span>12/28</span>
        </div>
      </div>
    </article>
  </div>
  <p class="hint">移动或拖动卡片<span>倾斜 · 径向流光 · 弹簧回正</span></p>
</main>`,
    css: `*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0d13;color:#eef2ff;font-family:Inter,"Segoe UI","Microsoft YaHei",sans-serif;background-image:radial-gradient(ellipse at 50% 40%,#1a224044,transparent 60%)}
main{width:min(360px,92vw);padding:36px 12px;display:grid;justify-items:center;gap:28px}
header{text-align:center}
header h1{margin:0 0 8px;font-size:22px;font-weight:550;letter-spacing:.5px}
header p{margin:0;font-size:11px;color:#8b95ad;letter-spacing:1px}
.stage{width:min(300px,100%);aspect-ratio:.7;perspective:900px;touch-action:none;cursor:grab;outline:none}
.stage:active{cursor:grabbing}
.stage:focus-visible{outline:2px solid #8ab4ff;outline-offset:14px;border-radius:24px}
.card{--px:50%;--py:50%;--sheen:0;position:relative;width:100%;height:100%;border-radius:26px;transform-style:preserve-3d;will-change:transform;pointer-events:none;border:1px solid #b7d0f540;background:linear-gradient(155deg,#243654,#121a2c 50%,#2a2440);box-shadow:0 28px 60px #0008,inset 0 1px #fff2}
.sheen{position:absolute;inset:0;border-radius:inherit;overflow:hidden}
.sheen:before{content:"";position:absolute;inset:-30%;background:radial-gradient(circle at var(--px) var(--py),#ffffffaa 0%,#9ec9ff55 18%,#c9b0ff33 34%,transparent 62%);mix-blend-mode:screen;opacity:calc(.15 + var(--sheen)*.85)}
.sheen:after{content:"";position:absolute;inset:0;background:linear-gradient(125deg,transparent 30%,#ffffff10 48%,transparent 62%)}
.content{position:absolute;inset:26px;display:flex;flex-direction:column;justify-content:space-between;transform:translateZ(36px)}
.row{display:flex;justify-content:space-between;align-items:center;font-size:11px;letter-spacing:2px;color:#c5d4ef}
.chip{width:34px;height:34px;border-radius:12px;display:grid;place-content:center;background:#ffffff14;font-size:16px}
.mid b{display:block;font-size:34px;font-weight:550;letter-spacing:-1px}
.mid p{margin:6px 0 0;font-size:12px;color:#9aabc8}
.bottom{font-family:ui-monospace,monospace;font-size:11px;letter-spacing:1px}
.hint{text-align:center;font-size:12px;color:#8b95ad;margin:0}
.hint span{display:block;margin-top:6px;font-size:10px;color:#5c677e;letter-spacing:1px}`,
    js: `(() => {
const stage = document.getElementById('stage');
const card = document.getElementById('card');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (v,a,b)=>Math.min(b,Math.max(a,v));
const state = { x:0, y:0, vx:0, vy:0, tx:0, ty:0, sheen:0, tSheen:0 };
let raf = 0, last = 0, pointer = null;

function paint(){
  card.style.transform = 'rotateX(' + state.x + 'deg) rotateY(' + state.y + 'deg)';
  card.style.setProperty('--sheen', state.sheen.toFixed(4));
}

function animate(now){
  const dt = Math.min((now - last) / 1000 || 1/60, 1/30);
  last = now;
  const steps = 4, h = dt / steps;
  for (let i = 0; i < steps; i++) {
    state.vx += ((state.tx - state.x) * 220 - state.vx * 20) * h;
    state.vy += ((state.ty - state.y) * 220 - state.vy * 20) * h;
    state.x += state.vx * h;
    state.y += state.vy * h;
  }
  state.sheen += (state.tSheen - state.sheen) * (1 - Math.exp(-11 * dt));
  if (reduced.matches) {
    state.x = state.y = state.vx = state.vy = 0;
    state.sheen = state.tSheen;
  }
  const settled =
    Math.abs(state.x - state.tx) + Math.abs(state.y - state.ty) +
    Math.abs(state.vx) + Math.abs(state.vy) < 0.012 &&
    Math.abs(state.sheen - state.tSheen) < 0.001;
  if (settled || reduced.matches) {
    state.x = reduced.matches ? 0 : state.tx;
    state.y = reduced.matches ? 0 : state.ty;
    state.vx = state.vy = 0;
    state.sheen = state.tSheen;
    raf = 0;
    paint();
    return;
  }
  paint();
  raf = requestAnimationFrame(animate);
}

function wake(){
  if (!raf) { last = performance.now(); raf = requestAnimationFrame(animate); }
}

function follow(e){
  if (pointer !== null && e.pointerId !== pointer) return;
  if (e.pointerType !== 'mouse' && pointer === null) return;
  const b = stage.getBoundingClientRect();
  const x = clamp((e.clientX - b.left) / b.width, 0, 1);
  const y = clamp((e.clientY - b.top) / b.height, 0, 1);
  state.tx = (0.5 - y) * 20;   // ±10°
  state.ty = (x - 0.5) * 28;   // ±14°
  state.tSheen = 1;
  card.style.setProperty('--px', (x * 100) + '%');
  card.style.setProperty('--py', (y * 100) + '%');
  wake();
}

function release(){
  pointer = null;
  state.tx = state.ty = 0;
  state.tSheen = 0;
  wake();
}

stage.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') follow(e); });
stage.addEventListener('pointermove', (e) => {
  if (pointer !== null && e.pointerId !== pointer) return;
  follow(e);
});
stage.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && pointer === null) release(); });
stage.addEventListener('pointerdown', (e) => {
  pointer = e.pointerId;
  stage.setPointerCapture(e.pointerId);
  follow(e);
});
stage.addEventListener('pointerup', (e) => {
  if (pointer === e.pointerId) release();
});
stage.addEventListener('pointercancel', release);
stage.addEventListener('blur', release);
window.addEventListener('blur', release);

stage.addEventListener('keydown', (e) => {
  const map = { ArrowLeft:[0,-4], ArrowRight:[0,4], ArrowUp:[-3,0], ArrowDown:[3,0] };
  if (e.key === 'Escape') { release(); return; }
  const d = map[e.key];
  if (!d) return;
  e.preventDefault();
  state.tx = clamp(state.tx + d[0], -10, 10);
  state.ty = clamp(state.ty + d[1], -14, 14);
  state.tSheen = 1;
  wake();
});
stage.addEventListener('keyup', (e) => {
  if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) release();
});

paint();
})();`,
  },
];
