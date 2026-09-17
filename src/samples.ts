import type { Case, Theme, Version } from "./types";
import { randomId } from "./browser";
export function newVersion(): Version {
  return {
    id: randomId(),
    name: "初始版本",
    prompt: "",
    provider: "",
    model: "",
    parameters: "",
    notes: "",
    html: '<button class="button">Hello, idea.</button>',
    css: "body {\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  background: #111315;\n  color: #b5f3cf;\n  font-family: system-ui;\n}\n.button {\n  background: #b5f3cf;\n  color: #111315;\n  padding: 16px 32px;\n  border: 0;\n  border-radius: 12px;\n  font: inherit;\n  cursor: pointer;\n}",
    js: "",
    createdAt: new Date().toISOString(),
  };
}
export function newCase(): Case {
  const v = newVersion(),
    now = new Date().toISOString();
  return {
    id: randomId(),
    title: "",
    tags: [],
    favorite: false,
    cover: "",
    theme: "plain",
    versions: [v],
    bestVersionId: v.id,
    createdAt: now,
    updatedAt: now,
    revision: 0,
  };
}
const demos: {
  title: string;
  theme: Theme;
  tags: string[];
  html: string;
  css: string;
  js?: string;
  prompt: string;
}[] = [
  {
    title: "发光悬停按钮",
    theme: "glow",
    tags: ["按钮", "交互", "发光"],
    html: "<button>Hover me <span>↗</span></button>",
    css: "button{background:#9df5d2;color:#102c22;padding:22px 54px;border:1px solid #d3ffee;border-radius:18px;font-size:22px;font-weight:600;box-shadow:0 0 25px #66f6be66,inset 0 0 14px #ffffff88;transition:transform .3s,box-shadow .3s;cursor:pointer}button:hover{transform:translateY(-5px);box-shadow:0 0 65px #66f6be99}span{margin-left:28px}",
    js: "document.querySelector('button').onclick = e => { e.currentTarget.textContent = 'Nice click ✓'; };",
    prompt:
      "创建一个薄荷绿色的发光按钮。鼠标悬停时轻微上浮并增强光晕，点击后展示确认反馈。使用纯 HTML、CSS 和 JavaScript，深色背景，过渡自然。",
  },
  {
    title: "行星轨道动效",
    theme: "orbit",
    tags: ["动效", "3D", "宇宙"],
    html: '<div class="system"><i></i><i></i><i></i><b></b></div>',
    css: '.system{position:relative;width:280px;height:280px;transform:rotateX(55deg) rotate(-20deg)}i{position:absolute;inset:0;border:1px solid #9b5cec;border-radius:50%;animation:orbit 9s linear infinite}i:nth-child(2){inset:30px;animation-duration:6s}i:nth-child(3){inset:65px;animation-duration:4s}i:after{content:"";position:absolute;top:50%;left:-7px;width:14px;height:14px;background:#c29aff;border-radius:50%;box-shadow:0 0 18px #a566ff}b{position:absolute;inset:108px;border-radius:50%;background:radial-gradient(circle at 30% 25%,#e1c5ff,#7931db 60%,#280f43);box-shadow:0 0 45px #a366ee66}@keyframes orbit{to{transform:rotate(360deg)}}',
    prompt:
      "使用纯 CSS 实现紫色行星轨道动画。三层椭圆轨道各有一颗不同速度公转的卫星，中间有具有立体光影的紫色星球。",
  },
  {
    title: "玻璃拟态卡片",
    theme: "glass",
    tags: ["卡片", "玻璃", "毛玻璃"],
    html: '<div class="orb"></div><article><small>LESS, BUT BETTER</small><h1>Glass Card</h1><p>A clear and modern<br>blur effect.</p><button aria-label="切换文字">↗</button></article>',
    css: ".orb{position:absolute;width:180px;height:180px;background:#9dbada;border-radius:50%;filter:blur(20px);transform:translate(80px,-20px)}article{z-index:1;position:relative;padding:32px 40px;width:245px;background:#c3d6ef22;border:1px solid #ffffff66;backdrop-filter:blur(28px);border-radius:20px;box-shadow:inset 0 1px #ffffff88;color:white}small{font-size:9px;letter-spacing:2px}h1{font-size:28px;margin:20px 0 12px}p{color:#d0d8e0;line-height:1.8}button{position:absolute;right:25px;bottom:25px;border:0;border-radius:50%;width:38px;height:38px;font-size:24px;background:#ffffff66;cursor:pointer}",
    js: "document.querySelector('button').onclick=()=>document.querySelector('h1').textContent='Stay curious.';",
    prompt:
      "制作深色背景的玻璃拟态卡片，有朦胧光球、半透明边框、清晰文字和圆形交互按钮。使用 backdrop-filter 制作真实毛玻璃效果。",
  },
  {
    title: "动态渐变文字",
    theme: "type",
    tags: ["文字", "渐变", "动效"],
    html: "<div><h1>Make<br>Ideas Real.</h1><p>Small prompts. Big possibilities.</p></div>",
    css: "h1{font-size:clamp(40px,10vw,84px);line-height:1.02;letter-spacing:-4px;margin:0;background:linear-gradient(110deg,#ffcf70,#ff805f,#ffcb6c);background-size:200%;color:transparent;background-clip:text;animation:flow 4s ease infinite alternate}p{color:#dcb197;margin-top:24px}@keyframes flow{to{background-position:100%}}",
    prompt:
      "制作大字号英文标题 Make Ideas Real.，文字用温暖的橙色和金色渐变填充，渐变缓慢流动，下面增加一行小字。",
  },
  {
    title: "粒子流动背景",
    theme: "particles",
    tags: ["背景", "粒子", "动效"],
    html: "<canvas></canvas>",
    css: "canvas{position:fixed;inset:0;width:100%;height:100%}",
    js: "const c=document.querySelector('canvas'),ctx=c.getContext('2d');let w,h,t=0;function resize(){w=c.width=innerWidth;h=c.height=innerHeight}addEventListener('resize',resize);resize();const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;function draw(){ctx.clearRect(0,0,w,h);for(let i=0;i<650;i++){const x=((i*37)%1000)/1000*w;const y=h/2+Math.sin(x/w*8+t+i*.012)*h*.16+Math.cos(i*8)*h*.18;ctx.fillStyle=`rgba(70,170,255,${.2+(i%8)/10})`;ctx.beginPath();ctx.arc(x,y,1+(i%3)*.4,0,7);ctx.fill()}t+=.012;if(!reduced)requestAnimationFrame(draw)}draw();",
    prompt:
      "使用 Canvas 绘制蓝色粒子波浪背景，粒子大小和透明度略有差异，随着正弦曲线缓慢流动，并自适应窗口大小。",
  },
  {
    title: "几何图形加载器",
    theme: "loader",
    tags: ["加载", "几何", "简约"],
    html: '<div class="loader"></div><p>Making something good.</p>',
    css: ".loader{width:85px;height:85px;border:9px solid #ffffff15;border-top-color:#acffe0;border-bottom-color:#71d5b7;clip-path:polygon(25% 0,75% 0,100% 25%,100% 75%,75% 100%,25% 100%,0 75%,0 25%);animation:spin 3s linear infinite;box-shadow:0 0 35px #aaffe022}p{position:absolute;top:70%;font-size:12px;color:#8d9e97;letter-spacing:2px}@keyframes spin{to{transform:rotate(360deg)}}",
    prompt:
      "创建薄荷绿几何加载动画，用八边形环的不同边段表现明暗变化，匀速旋转，深色背景，底部显示轻量提示文字。",
  },
];
export function sampleCases(): Case[] {
  return demos.map((d, index) => {
    const c = newCase();
    return {
      ...c,
      updatedAt: new Date(Date.now() - index * 1000).toISOString(),
      title: d.title,
      tags: d.tags,
      theme: d.theme,
      versions: [
        {
          ...c.versions[0],
          name: "示例版本",
          provider: "内置示例",
          model: "手工演示",
          notes: "用于演示记录流程的示例代码，不代表某个模型的生成结果。",
          prompt: d.prompt,
          html: d.html,
          css:
            "body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0c1012;color:#ecf0f3;font-family:system-ui;overflow:hidden}\n" +
            d.css +
            "\n@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}",
          js: d.js || "",
        },
      ],
    };
  });
}
