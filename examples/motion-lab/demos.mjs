// The source of truth for the seven independently runnable examples.
export function mountain(index = 0) {
  const palettes = [['#467b86','#d8eeea','#809caa'],['#916f80','#fae5dd','#adacbe'],['#567084','#e6f3f5','#8da6b8'],['#4c8071','#e4eee4','#90a69b']];
  const [sky, snow, shade] = palettes[index % palettes.length];
  return `<svg class="landscape" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="400" height="260" fill="${sky}"/><circle cx="${290-index*9}" cy="60" r="30" fill="${snow}" opacity=".65"/><path d="M0 210 90 98 142 146 235 34 400 210V260H0Z" fill="${snow}"/><path d="m235 34 20 116 38 24-23 14 69 72h61v-50Z M90 98l20 93 52 69H0V210Z" fill="${shade}"/><path d="m235 34-64 128 35-18 10 23 21-56 18 39Z" fill="#fff" opacity=".7"/><path d="M0 244q94-41 203-17t197-2v35H0" fill="${snow}"/><path d="m275 196-53 30 7 9-46 22" stroke="${sky}" stroke-width="2" fill="none" opacity=".4"/></svg>`;
}

export const demos = [
  {
    number:'02', slug:'fluid-morph', title:'流体胶囊形变', english:'FLUID MORPH', theme:'glass',
    prompt:'实现胶囊按钮向弹窗面板的流体形态变换，尺寸与圆角采用高阻尼流体曲线（Fluid Morph）无缝过渡。',
    tags:['流体形变','弹窗','高阻尼'], metrics:[['width','WIDTH'],['height','HEIGHT'],['radius','RADIUS']],
    hint:'点击橙色胶囊展开面板 · 关闭后沿原路径收回',
    html:`<div class="morph-scene"><div class="board"><div><h2>My<br>Board</h2><p>Carve Custom</p><small>156 cm · All mountain</small></div><div class="snowboard"><i></i><i></i></div></div><div class="resort">Nordkette<span>46 <small>cm</small></span><p>FRESH SNOW / 新雪</p></div><div class="morph" id="morph-panel"><button class="pill" aria-expanded="false" aria-controls="morph-content">✳ 46 cm</button><section class="morph-content" id="morph-content" role="dialog" aria-modal="false" aria-label="雪况详情" inert><div class="panel-top"><span>山间新雪</span><button class="close control" aria-label="关闭雪况详情">×</button></div><h3>明天，去山里。</h3><p>Nordkette · 北山雪场<br>积雪充足，适合开启新一轮滑行。</p><div class="snow-stats"><b>46<small>厘米新雪</small></b><b>−8°<small>山顶气温</small></b></div><button class="primary close">收起雪况</button></section></div></div>`,
    css:`.morph-scene{position:relative;width:min(360px,100%);height:395px;padding-top:80px}.board{height:154px;border-radius:22px;background:#e6e9e3;color:#151e18;padding:19px;display:flex;justify-content:space-between;overflow:hidden}.board h2{font-size:28px;line-height:.95;margin:0 0 20px}.board p{font-size:12px;margin:0 0 3px}.board small{font-size:9px;color:#67726a}.snowboard{width:62px;height:165px;background:#151d17;border-radius:35px;transform:rotate(55deg) translate(-15px,-26px);display:flex;flex-direction:column;align-items:center;justify-content:space-evenly}.snowboard i{width:44px;height:30px;border:2px solid #9da79e;border-radius:7px}.resort{height:142px;margin-top:12px;padding:20px;background:#222e24;border-radius:22px;font-size:20px}.resort span{float:right;color:var(--orange);font-size:50px;font-weight:600}.resort span small{font-size:15px}.resort p{font-size:9px;letter-spacing:2px;margin-top:45px;color:#8b9b8c}.morph{position:absolute;right:0;top:0;width:156px;height:52px;border-radius:26px;background:#ff931e;color:#192119;overflow:hidden;box-shadow:0 14px 45px #0003;z-index:2}.pill{position:absolute;inset:0;border:0;background:none;color:inherit;font-weight:650;white-space:nowrap;font-size:17px;width:100%;height:100%}.morph-content{position:absolute;inset:0;padding:24px;opacity:0;display:flex;flex-direction:column;gap:16px}.panel-top{display:flex;align-items:center;justify-content:space-between;font-size:12px}.panel-top .close{border-color:#17271a44;padding:0;width:28px;height:28px;font-size:22px}.morph-content h3{font-size:28px;margin:0}.morph-content p{font-size:12px;line-height:1.8;margin:0;color:#344725}.snow-stats{display:flex;gap:38px}.snow-stats b{font-size:36px;font-weight:600}.snow-stats small{display:block;font-size:10px;font-weight:400}.morph-content .primary{background:#17251a;color:#edf2e5;margin-top:auto}`,
    run:function(){
      const panel=$('.morph'), pill=$('.pill'), content=$('.morph-content'); let open=false;
      const size=()=>Math.min($('.morph-scene').clientWidth,360);
      const morph=spring(0,value=>{
        const width=156+(size()-156)*value,height=52+316*value,radius=26-4*value;
        Object.assign(panel.style,{width:width+'px',height:height+'px',borderRadius:radius+'px'});
        pill.style.opacity=String(1-clamp(value*5,0,1));
        content.style.opacity=String(clamp((value-.45)/.55,0,1));
        content.style.transform='translateY('+(1-value)*12+'px)';
        metric('width',Math.round(width)+' px');metric('height',Math.round(height)+' px');metric('radius',radius.toFixed(1)+' px');trace(value);
      },{stiffness:220,damping:31});
      function toggle(next){
        open=next;pill.setAttribute('aria-expanded',String(open));pill.inert=open;content.inert=!open;
        if(!open)pill.focus({preventScroll:true});
        morph.to(open?1:0,()=>{if(open)$('.close').focus({preventScroll:true});});
      }
      pill.addEventListener('click',()=>toggle(true));$$('.close').forEach(button=>button.addEventListener('click',()=>toggle(false)));
      document.addEventListener('keydown',event=>{if(event.key==='Escape'&&open)toggle(false);});
      new ResizeObserver(()=>morph.jump(morph.value)).observe($('.morph-scene'));
    }
  },
  {
    number:'03',slug:'shared-element',title:'共享元素无缝展开',english:'SHARED ELEMENT',theme:'glass',
    prompt:'实现Card到详情页的共享元素转场（Shared Element Transition），背景与Card容器做连续平滑缩放。',
    tags:['共享元素','转场','卡片'],metrics:[['scale','SCALE'],['crop','CROP W × H'],['stage','STAGE']],hint:'点击任意雪道卡片展开 · 返回时同一张卡片连续归位',
    html:`<div class="phone shared-phone"><div class="trail-list"><div class="phone-header"><h2>Trails</h2><p>3 条雪道，等你探索</p></div>${['Aurora Bowl','Nordkette Ridge','Pine Line'].map((name,i)=>`<div class="trail-slot"><button class="trail" data-index="${i}" aria-label="探索 ${name}" aria-expanded="false">${mountain(i)}<span>${name} <small>↗</small></span></button></div>`).join('')}</div><section class="trail-detail" role="dialog" aria-modal="true" aria-label="雪道详情" hidden><button class="back control">← 返回雪道</button><div class="detail-copy"><small>你的下一段旅程</small><h3></h3><p>沿山脊滑行，穿过松林，<br>在雪线之上寻找自由。</p><div>2,326 m <span>海拔</span>　 /　 3.8 km <span>长度</span></div><button class="primary choose">收藏这条雪道</button><p class="status" aria-live="polite"></p></div></section></div>`,
    css:`.trail-list{height:100%;transform-origin:50% 50%}.trail-slot{height:112px;margin:0 12px 12px}.trail{position:relative;width:100%;height:100%;padding:0;border:0;border-radius:17px;overflow:hidden;background:#496d70;display:block;text-align:left;transform-origin:0 0}.trail span{position:absolute;bottom:10px;left:10px;right:10px;border-radius:8px;background:#091912a6;padding:7px 10px;font-size:11px;color:white}.trail span small{float:right}.trail-detail{position:absolute;inset:0;background:linear-gradient(transparent 244px,#15231c 244px);z-index:5;pointer-events:none}.back{position:absolute;top:14px;left:13px;z-index:6;background:#0b160cca;min-height:36px;pointer-events:auto}.detail-copy{position:absolute;top:265px;left:20px;right:20px;pointer-events:auto}.detail-copy>small{color:var(--orange);font-size:9px;letter-spacing:2px}.detail-copy h3{font-size:25px;margin:10px 0}.detail-copy p{font-size:12px;line-height:1.7;color:#adbdaf}.detail-copy div{font-size:12px;margin:15px 0}.detail-copy div span{font-size:9px;color:#899e8e}.detail-copy .primary{font-size:12px;padding:10px 20px}.detail-copy .status{font-size:10px;text-align:left;margin-top:8px}.trail.shared-active{position:absolute;z-index:4;margin:0;opacity:1}.trail.shared-active span{opacity:0}.shared-phone .trail-detail[hidden]{display:none}`,
    run:function(){
      const phone=$('.shared-phone'),list=$('.trail-list'),detail=$('.trail-detail');
      let active=null,slot=null,origin=null,progress=0,returning=false,animation=null;
      const saved=new Set();
      function render(value){
        progress=value;if(!active)return;
        const w=phone.clientWidth,h=244;
        active.style.left=origin.x*(1-value)+'px';active.style.top=origin.y*(1-value)+'px';
        active.style.width=origin.width+(w-origin.width)*value+'px';active.style.height=origin.height+(h-origin.height)*value+'px';
        active.style.borderRadius=17*(1-value)+'px';
        list.style.transform='scale('+(1-.055*value)+')';list.style.opacity=String(1-value*.7);
        detail.style.opacity=String(value);$('.detail-copy').style.transform='translateY('+(1-value)*24+'px)';
        metric('scale','×'+(1+(w/origin.width-1)*value).toFixed(2));metric('crop',Math.round(origin.width+(w-origin.width)*value)+' × '+Math.round(origin.height+(h-origin.height)*value));trace(value);
      }
      function close(){
        if(!active||returning)return;returning=true;detail.inert=true;metric('stage','RETURN');
        animation.to(0,()=>{
          const card=active;slot.append(card);card.classList.remove('shared-active');card.style.cssText='';card.disabled=false;card.setAttribute('aria-expanded','false');
          detail.hidden=true;detail.inert=false;list.inert=false;list.style.cssText='';active=null;returning=false;animation.destroy();card.focus({preventScroll:true});metric('stage','LIST');
        });
      }
      $$('.trail').forEach(card=>card.addEventListener('click',()=>{
        if(active)return;active=card;slot=card.parentElement;
        const r=slot.getBoundingClientRect(),p=phone.getBoundingClientRect();
        origin={x:r.left-p.left-phone.clientLeft,y:r.top-p.top-phone.clientTop,width:r.width,height:r.height};
        $('.detail-copy h3').textContent=card.textContent.replace('↗','').trim();$('.status').textContent='';
        $('.choose').textContent=saved.has(card.dataset.index)?'已收藏 ✓':'收藏这条雪道';
        card.setAttribute('aria-expanded','true');card.disabled=true;phone.append(card);card.classList.add('shared-active');
        detail.hidden=false;detail.inert=false;list.inert=true;$('.back').focus({preventScroll:true});metric('stage','EXPAND');
        animation=spring(0,render,{stiffness:240,damping:30});animation.to(1,()=>metric('stage','DETAIL'));
      }));
      $('.back').addEventListener('click',close);
      $('.choose').addEventListener('click',()=>{if(!active)return;saved.add(active.dataset.index);$('.choose').textContent='已收藏 ✓';$('.status').textContent='已加入本次演示的收藏清单';});
      detail.addEventListener('keydown',event=>{
        if(event.key==='Escape'){event.preventDefault();close();}
        if(event.key==='Tab'){const buttons=[$('.back'),$('.choose')];const next=event.shiftKey?buttons[0]:buttons[1];if(document.activeElement===next){event.preventDefault();buttons[event.shiftKey?1:0].focus();}}
      });
      new ResizeObserver(()=>{
        if(!active)return;
        // Untransformed slot offsets remain stable even while the background scales.
        origin={x:slot.offsetLeft,y:slot.offsetTop,width:slot.offsetWidth,height:slot.offsetHeight};render(progress);
      }).observe(phone);
      metric('scale','×1.00');metric('crop','—');metric('stage','LIST');
    }
  },
  {
    number:'04',slug:'snap-odometer',title:'磁吸游标与滚动码表',english:'SNAP ODOMETER',theme:'plain',
    prompt:'折线图横向滑动带数据点磁吸吸附，顶部数值使用滚动计数器（Odometer / Ticker）实时平滑联动。',
    tags:['折线图','磁吸','滚动计数器'],metrics:[['cursor','CURSOR X'],['snap','SNAP'],['value','VALUE']],hint:'拖动图表游标靠近数据点吸附 · 松手锁定最近点 · 支持方向键',
    html:`<div class="chart-panel"><p class="micro">TOP SPEED / 滑行速度</p><div class="speed"><div class="odometer" aria-hidden="true">${[0,1,2].map((n)=>`${n===2?'<span class="decimal">.</span>':''}<div class="digit"><div class="strip">${Array.from({length:30},(_,i)=>`<span>${i%10}</span>`).join('')}</div></div>`).join('')}</div><span class="unit">km/h</span></div><output class="sr-only" id="speed-label">速度 31.2 km/h</output><div class="chart-touch" role="slider" tabindex="0" aria-label="滑行数据点" aria-valuemin="1" aria-valuemax="12" aria-valuenow="1"><svg class="chart" viewBox="0 0 420 260"><g class="grid"><path d="M20 40H400 M20 90H400 M20 140H400 M20 190H400 M20 240H400"/></g><path class="area"/><path class="line"/><g class="dots"></g><line class="cursor-line" y1="20" y2="245"/><circle class="cursor-halo" r="16"/><circle class="cursor-dot" r="5"/></svg><div class="chart-times"><span>09:00</span><span>09:30</span><span>10:00</span></div></div><p class="chart-caption">第 <b id="point-number">1</b> 个采样点 <span>12 个采样 · 演示数据</span></p></div>`,
    css:`.chart-panel{width:min(440px,100%)}.micro{font:10px ui-monospace,monospace;letter-spacing:2px;color:#91a398}.speed{display:flex;align-items:baseline;gap:10px;margin:15px 0 20px}.odometer{display:flex;height:76px;overflow:hidden;font:600 68px/76px ui-monospace,monospace;letter-spacing:-5px}.digit{width:42px;height:76px;overflow:hidden}.strip span{display:block;height:76px;text-align:center}.decimal{width:22px;text-align:center}.unit{font-size:20px;color:#809287}.chart-touch{touch-action:none;cursor:ew-resize;outline-offset:8px}.chart{width:100%;display:block;overflow:visible}.grid path{stroke:#ffffff0b;fill:none}.line{fill:none;stroke:#e7eee9;stroke-width:2;stroke-linejoin:round}.area{fill:#8cae960c}.dots circle{fill:#98b4a1}.cursor-line{stroke:#ff931e80;stroke-width:1}.cursor-halo{fill:#ff931e18}.cursor-dot{fill:var(--orange);stroke:#ffba62;stroke-width:2}.chart-times{display:flex;justify-content:space-between;font:9px ui-monospace,monospace;color:#637b6b;padding:10px 0}.chart-caption{border-top:1px solid var(--line);padding-top:20px;font-size:12px;color:#a0b2a5}.chart-caption b{color:var(--orange)}.chart-caption span{float:right;font-size:10px;color:#617e6b}.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`,
    run:function(){
      const values=[31.2,43.6,37.8,58.4,52.1,67.8,76.2,64.5,49.3,71.6,80.4,55.8];
      const touch=$('.chart-touch'),svg=$('.chart');const x=i=>20+i*380/(values.length-1),y=v=>240-(v-25)/60*200;
      const points=values.map((v,i)=>x(i)+','+y(v)).join(' L');$('.line').setAttribute('d','M'+points);$('.area').setAttribute('d','M20,240 L'+points+' L400,240Z');
      $('.dots').innerHTML=values.map((v,i)=>'<circle cx="'+x(i)+'" cy="'+y(v)+'" r="3"/>').join('');
      const digits=$$('.strip').map((strip,i)=>{const initial=[3,1,2][i];const roller=spring(10+initial,value=>strip.style.transform='translateY('+(-value*76)+'px)',{stiffness:300,damping:29});return {roller,target:10+initial,last:initial};});
      function roll(value){
        const chars=value.toFixed(1).replace('.','').padStart(3,'0');
        digits.forEach((digit,i)=>{
          const next=Number(chars[i]);if(next===digit.last)return;
          let delta=next-digit.last;if(delta>5)delta-=10;if(delta< -5)delta+=10;
          digit.target+=delta;digit.last=next;
          // Normalize only offscreen, preserving the current displacement and target.
          if(digit.target<5){digit.roller.jump(digit.roller.value+10);digit.target+=10;}
          if(digit.target>24){digit.roller.jump(digit.roller.value-10);digit.target-=10;}
          digit.roller.to(digit.target);
        });
      }
      let selected=0;
      const cursor=spring(0,index=>{
        index=clamp(index,0,values.length-1);const lo=Math.floor(index),hi=Math.min(lo+1,values.length-1),value=values[lo]+(values[hi]-values[lo])*(index-lo);
        const cx=x(index),cy=y(value);$('.cursor-line').setAttribute('x1',cx);$('.cursor-line').setAttribute('x2',cx);
        ['.cursor-dot','.cursor-halo'].forEach(selector=>{$(selector).setAttribute('cx',cx);$(selector).setAttribute('cy',cy);});
        roll(value);metric('cursor',Math.round(cx));metric('value',value.toFixed(1));trace((value-25)/60);$('#speed-label').textContent='速度 '+value.toFixed(1)+' km/h';
      },{stiffness:350,damping:32});
      function set(index,snap){selected=clamp(index,0,11);cursor.to(selected);metric('snap',snap?'POINT '+(Math.round(selected)+1):'FREE');$('#point-number').textContent=String(Math.round(selected)+1);touch.setAttribute('aria-valuenow',Math.round(selected)+1);touch.setAttribute('aria-valuetext',values[Math.round(selected)]+' km/h');}
      function follow(event){const r=svg.getBoundingClientRect();let index=clamp(((event.clientX-r.left)/r.width*420-20)/380*11,0,11);const nearest=Math.round(index),snapped=Math.abs(index-nearest)<.22;if(snapped)index=nearest;set(index,snapped);}
      drag(touch,{start:event=>{touch.focus({preventScroll:true});follow(event);},move:follow,end:()=>set(Math.round(selected),true)});
      touch.addEventListener('keydown',event=>{let target;if(event.key==='ArrowRight'||event.key==='ArrowUp')target=Math.round(selected)+1;else if(event.key==='ArrowLeft'||event.key==='ArrowDown')target=Math.round(selected)-1;else if(event.key==='Home')target=0;else if(event.key==='End')target=11;else return;event.preventDefault();set(target,true);});set(0,true);
    }
  },
  {
    number:'05',slug:'bottom-sheet',title:'阻尼弹性抽屉',english:'BOTTOM SHEET',theme:'plain',
    prompt:'实现支持阻尼橡皮筋回弹的底部抽屉（Bottom Sheet），松手根据手势滑动速度（Velocity）自动计算吸附锚点。',
    tags:['抽屉','手势速度','橡皮筋回弹'],metrics:[['position','SHEET Y'],['stretch','STRETCH'],['velocity','VELOCITY']],hint:'拖动抽屉顶部 · 快速甩动跨越锚点 · 超出边界会有橡皮筋阻力',
    html:`<div class="phone sheet-phone"><div class="sheet-background"><h2>My<br>Board</h2><p>为下一次出发做好准备。</p>${mountain(3)}<span>CARVE / 156</span></div><div class="shade"></div><section class="sheet" aria-label="滑雪板配置"><div class="sheet-handle" role="slider" tabindex="0" aria-label="抽屉展开程度" aria-valuemin="0" aria-valuemax="2" aria-valuenow="1"><i></i><span>Choose Your Setup</span></div><div class="sheet-body"><small>BOARD LENGTH / 板长</small><div class="lengths">${[148,152,156,160].map(n=>`<button class="length${n===156?' selected':''}" aria-pressed="${n===156}">${n}</button>`).join('')}</div><label>STANCE ANGLE / 站姿角度<input class="angle-input" type="range" min="0" max="30" value="18" aria-label="站姿角度"></label><p class="angle-value">18°</p><button class="save">保存配置</button><p class="save-status" aria-live="polite"></p></div></section></div><div class="toolbar sheet-controls"><button class="control" data-anchor="2">低位</button><button class="control active" data-anchor="1">半屏</button><button class="control" data-anchor="0">全屏</button></div>`,
    css:`.sheet-background{padding:30px 20px;position:absolute;inset:0}.sheet-background h2{font-size:42px;line-height:.9;margin:0 0 18px}.sheet-background p{font-size:11px;color:#829a8b}.sheet-background svg{height:200px;border-radius:20px;margin-top:20px}.sheet-background>span{font:10px ui-monospace,monospace;letter-spacing:3px;color:var(--orange);display:block;margin-top:22px}.shade{position:absolute;inset:0;background:#000;opacity:.25;pointer-events:none}.sheet{position:absolute;top:0;left:0;right:0;height:500px;border-radius:26px 26px 0 0;background:#f1f2ed;color:#18231a;box-shadow:0 -10px 35px #0003;will-change:transform}.sheet-handle{height:82px;touch-action:none;cursor:ns-resize;display:flex;flex-direction:column;align-items:center;padding:10px 16px 0;gap:16px}.sheet-handle i{width:36px;height:4px;border-radius:4px;background:#a7ada3}.sheet-handle span{font-size:21px;font-weight:600;align-self:flex-start}.sheet-body{padding:0 18px 20px;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;color-scheme:light}.sheet-body small,.sheet-body label{font:9px ui-monospace,monospace;letter-spacing:1px;color:#718071;display:block}.lengths{display:flex;gap:8px;justify-content:space-between;margin:20px 0 28px}.length{width:44px;height:44px;border:1px solid #c8d1c6;border-radius:50%;background:transparent;color:#4d604c;font-size:12px}.length.selected{background:var(--orange);color:#152312;border-color:var(--orange);font-weight:700}.angle-input{display:block;width:100%;accent-color:#ff931e;margin:20px 0 6px}.angle-value{font-size:12px;margin:5px 0 18px;text-align:right}.save{width:100%;background:#16241a;color:#f6fff6;border:0;border-radius:100px;padding:13px;font-size:12px}.save-status{font-size:11px;text-align:center;color:#4a6c49;line-height:1.6}`,
    run:function(){
      const anchors=[65,230,386],sheet=$('.sheet'),handle=$('.sheet-handle');let startY=0,startPosition=0,lastY=0,lastTime=0,velocity=0,anchor=1;
      const movement=spring(230,(value,v)=>{sheet.style.transform='translateY('+value+'px)';$('.sheet-body').style.maxHeight=Math.max(0,$('.sheet-phone').clientHeight-value-82)+'px';$('.shade').style.opacity=String(clamp((400-value)/450,0,.7));metric('position',Math.round(value)+' px');metric('stretch',Math.round(Math.max(65-value,value-386,0))+' px');metric('velocity',Math.round(v)+' px/s');trace(1-value/440);},{stiffness:310,damping:27,epsilon:.025});
      function snap(index){anchor=index;movement.to(anchors[index]);handle.setAttribute('aria-valuenow',2-index);handle.setAttribute('aria-valuetext',['全屏','半屏','低位'][index]);$$('[data-anchor]').forEach(button=>button.classList.toggle('active',Number(button.dataset.anchor)===index));}
      drag(handle,{
        start:event=>{movement.stop();startY=lastY=event.clientY;startPosition=movement.value;lastTime=performance.now();velocity=0;},
        move:event=>{const now=performance.now(),dt=Math.max(now-lastTime,1);velocity=.65*velocity+.35*(event.clientY-lastY)/dt*1000;lastY=event.clientY;lastTime=now;let value=startPosition+event.clientY-startY;if(value<65)value=65-(65-value)*.25;if(value>386)value=386+(value-386)*.25;movement.jump(value);metric('velocity',Math.round(velocity)+' px/s');},
        end:(event,cancelled)=>{if(cancelled||performance.now()-lastTime>100)velocity=0;const projected=movement.value+clamp(velocity,-2200,2200)*.18;const index=anchors.reduce((best,value,i)=>Math.abs(value-projected)<Math.abs(anchors[best]-projected)?i:best,0);snap(index);}
      });
      $$('[data-anchor]').forEach(button=>button.addEventListener('click',()=>snap(Number(button.dataset.anchor))));
      handle.addEventListener('keydown',event=>{if(!['ArrowUp','ArrowDown','Home','End'].includes(event.key))return;event.preventDefault();snap(event.key==='Home'?0:event.key==='End'?2:clamp(anchor+(event.key==='ArrowUp'?-1:1),0,2));});
      $$('.length').forEach(button=>button.addEventListener('click',()=>{$$('.length').forEach(other=>{other.classList.toggle('selected',other===button);other.setAttribute('aria-pressed',String(other===button));});}));
      $('.angle-input').addEventListener('input',event=>$('.angle-value').textContent=event.target.value+'°');
      $('.save').addEventListener('click',()=>{$('.save-status').textContent='本次配置已保存：'+$('.length.selected').textContent+' cm / '+$('.angle-input').value+'°';});snap(1);
    }
  },
  {
    number:'06',slug:'conic-glow',title:'动态弥散光晕边框',english:'CONIC GLOW',theme:'glow',
    prompt:'为Card添加旋转渐变描边（Conic Gradient Border），底部附带动态模糊的呼吸弥散背光。',
    tags:['旋转渐变','光晕','呼吸背光'],metrics:[['angle','ANGLE'],['glow','GLOW'],['state','STATE']],hint:'旋转光沿边框流动，背光缓慢呼吸 · 可暂停或调整流速',
    html:`<div class="glow-wrap"><div class="glow-card"><div class="coach-title">● AI LINE COACH</div><svg viewBox="0 0 340 190" aria-hidden="true"><path d="M135 160Q190 45 250 90T320 40 M135 160Q200 100 255 72T320 40 M135 160Q205 35 255 60T320 40" fill="none" stroke="#91a58422"/><path d="M135 160C190 110 190 75 235 68S302 50 320 25" fill="none" stroke="#ff931e" stroke-width="2.5"/><circle cx="320" cy="25" r="4" fill="#ff931e"/></svg><div class="best-line"><span>Best line</span><b>1.4<small> min</small></b></div></div></div><div class="toolbar"><button class="control pause">暂停动画</button><label class="range-row">流速 <input class="glow-speed" type="range" min="0.3" max="2" step="0.1" value="1" aria-label="流光速度"></label></div>`,
    css:`.glow-wrap{position:relative;isolation:isolate;width:min(380px,100%);height:238px;--angle:0deg;--glow:.5;--blur:26px;margin:35px 0}.glow-wrap:before{content:"";position:absolute;inset:35% -5% -9%;background:conic-gradient(from var(--angle),transparent 15%,#ff951e99 40%,#efb56699 50%,transparent 70%);filter:blur(var(--blur));opacity:var(--glow);z-index:-1;transform:scale(1.05)}.glow-card{position:relative;height:100%;border:1.5px solid transparent;border-radius:24px;background:linear-gradient(#14201b,#121c18) padding-box,conic-gradient(from var(--angle),#68847822 5%,#ff951e22 25%,#ff951e 45%,#ffdfaa 50%,#68847822 65%) border-box;overflow:hidden}.coach-title{position:absolute;top:24px;left:23px;font:11px ui-monospace,monospace;letter-spacing:2px;color:var(--orange)}.glow-card svg{position:absolute;inset:42px 12px 0;width:calc(100% - 24px);height:calc(100% - 42px)}.best-line{position:absolute;bottom:26px;left:23px;display:flex;flex-direction:column;gap:5px}.best-line span{font-size:12px;color:#94a396}.best-line b{font-size:42px;font-weight:500}.best-line small{font-size:17px;color:#9caf9f;font-weight:400}`,
    run:function(){
      const wrap=$('.glow-wrap'),pause=$('.pause');let angle=230,phase=0,speed=1,frame=0,last=0,paused=motionPreference.matches;
      function paint(){const glow=.45+.25*Math.sin(phase);wrap.style.setProperty('--angle',angle+'deg');wrap.style.setProperty('--glow',glow);wrap.style.setProperty('--blur',(24+8*Math.sin(phase))+'px');metric('angle',Math.round(angle)+'°');metric('glow',Math.round(glow*100)+'%');trace(glow);}
      function tick(now){const dt=Math.min((now-last)/1000,.05);last=now;angle=(angle+dt*55*speed)%360;phase+=dt*1.6;paint();frame=requestAnimationFrame(tick);}
      function sync(){cancelAnimationFrame(frame);frame=0;const still=paused||motionPreference.matches;pause.textContent=motionPreference.matches?'已遵循减少动态效果':paused?'继续动画':'暂停动画';pause.disabled=motionPreference.matches;metric('state',still?'PAUSED':'LIVE');if(!still&&!document.hidden){last=performance.now();frame=requestAnimationFrame(tick);}paint();}
      pause.addEventListener('click',()=>{paused=!paused;sync();});$('.glow-speed').addEventListener('input',event=>speed=Number(event.target.value));
      document.addEventListener('visibilitychange',sync);motionPreference.addEventListener('change',()=>{paused=motionPreference.matches;sync();});window.addEventListener('pagehide',()=>cancelAnimationFrame(frame));sync();
    }
  },
  {
    number:'07',slug:'stagger-cascade',title:'物理弹簧交错流',english:'STAGGER CASCADE',theme:'orbit',
    prompt:'列表元素入场使用交错动画（Stagger Delay），每个子项带微弱弹性向上滑入（Spring Cascade）。',
    tags:['列表入场','交错动画','弹簧'],metrics:[['stagger','STAGGER'],['cards','CARDS IN'],['state','STATE']],hint:'点击重播观察十张卡片依次入场 · 调整间隔体验不同节奏',
    html:`<div class="phone cascade-phone"><div class="phone-header"><h2>Spots</h2><p>10 个目的地，10 种心动</p></div><div class="spots">${Array.from({length:10},(_,i)=>`<div class="spot">${mountain(i)}<span>${['Aurora','Nordkette','Pine Line','Alpine','Summit','Frost','Ridge','Glacier','Snowfall','Solstice'][i]}<small>${String(i+1).padStart(2,'0')}</small></span></div>`).join('')}</div></div><div class="toolbar"><button class="control replay">重播入场</button><label class="range-row">间隔 <input class="stagger-delay" type="range" min="40" max="180" step="10" value="100" aria-label="交错间隔"></label></div>`,
    css:`.cascade-phone{height:540px}.cascade-phone .phone-header{padding-top:20px;padding-bottom:13px}.spots{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 12px 16px;max-height:445px;overflow:auto;scrollbar-width:thin;scrollbar-color:#3d5545 transparent}.spot{position:relative;aspect-ratio:1.35;overflow:hidden;border-radius:12px;transform-origin:50% 100%;background:#587b78}.spot svg{position:absolute;inset:0}.spot span{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,#10281fbb);padding:22px 9px 8px;font-size:9px}.spot small{float:right;font:8px ui-monospace,monospace;color:#d0e1d6}`,
    run:function(){
      const cards=$$('.spot');let timers=[],motions=[],generation=0,delay=100;
      function replay(){
        generation++;const current=generation;timers.forEach(clearTimeout);timers=[];motions.forEach(animation=>animation.destroy());motions=[];let finished=0;
        $('.spots').scrollTop=0;metric('cards','0 / 10');metric('stagger',(motionPreference.matches?0:delay/1000).toFixed(2)+' s');metric('state','ENTERING');
        cards.forEach((card,index)=>{
          const animation=spring(0,value=>{card.style.opacity=clamp(value,0,1);card.style.transform='translateY('+(1-value)*35+'px) scale('+(1-(1-value)*.035)+')';},{stiffness:300,damping:23});motions.push(animation);
          function enter(){if(current!==generation)return;animation.to(1,()=>{finished++;metric('cards',finished+' / 10');trace(finished/10);if(finished===10)metric('state','SETTLED');});}
          if(motionPreference.matches)enter();else timers.push(setTimeout(enter,index*delay));
        });
      }
      $('.replay').addEventListener('click',replay);$('.stagger-delay').addEventListener('input',event=>{delay=Number(event.target.value);metric('stagger',(delay/1000).toFixed(2)+' s');});
      motionPreference.addEventListener('change',replay);window.addEventListener('pagehide',()=>{timers.forEach(clearTimeout);motions.forEach(animation=>animation.stop());});replay();
    }
  },
  {
    number:'08',slug:'press-scale',title:'弹性微缩触觉反馈',english:'PRESS SCALE',theme:'plain',
    prompt:'按钮按压添加scale(0.96)物理弹性压缩与深度内阴影，释放时触发轻微超调回弹（Spring Overshoot）。',
    tags:['按钮','按压反馈','超调回弹'],metrics:[['scale','SCALE'],['shadow','SHADOW'],['overshoot','OVERSHOOT']],hint:'按住按钮感受压缩 · 松手轻微超调回弹 · 支持空格及回车',
    html:`<div class="press-stage"><p>READY TO RIDE</p><h2>Nordkette · 46 cm</h2><button class="run-button">Start Run <span>→</span></button><div class="tracks"><i></i><i></i></div><p class="run-status" aria-live="polite">你的下一次滑行，从这里开始。</p></div>`,
    css:`.press-stage{background:#e5e9e1;color:#19251a;border-radius:24px;width:min(420px,100%);padding:44px 25px 30px;text-align:center}.press-stage>p:first-child{font:10px ui-monospace,monospace;letter-spacing:3px;color:#768471;margin:0 0 14px}.press-stage h2{font-size:23px;font-weight:550;margin:0 0 52px}.run-button{width:100%;border:0;border-radius:100px;background:#263d28;color:#eff9e9;padding:25px 12px;font-size:29px;font-weight:600;touch-action:none;will-change:transform;user-select:none;-webkit-user-select:none}.run-button span{display:inline-block;font-size:24px;margin-left:12px}.tracks{display:grid;justify-items:center;gap:7px;margin-top:28px}.tracks i{height:5px;border-radius:9px;background:#c6cec0;width:75%}.tracks i:nth-child(2){width:55%}.press-stage .run-status{font-size:11px;color:#637a5d;margin:27px 0 0;min-height:18px;line-height:1.6}`,
    run:function(){
      const button=$('.run-button');let pressed=false,runs=0,peak=0;
      const scale=spring(1,value=>{
        button.style.transform='scale('+value+')';const depth=clamp((1-value)/.04,0,1);
        button.style.boxShadow='inset 0 '+(depth*7)+'px '+(depth*16)+'px #0008, 0 '+(4-depth*4)+'px '+(12-depth*8)+'px #172c1820';
        peak=Math.max(peak,(value-1)*100);metric('scale',value.toFixed(3));metric('shadow',Math.round(depth*100)+'%');metric('overshoot','+'+peak.toFixed(1)+'%');trace((value-.95)/.075);
      },{stiffness:420,damping:19,epsilon:.0001});
      function down(){if(pressed)return;pressed=true;peak=0;scale.to(.96);}
      function up(){if(!pressed)return;pressed=false;scale.to(1);}
      drag(button,{start:down,end:up});
      button.addEventListener('keydown',event=>{if((event.key===' '||event.key==='Enter')&&!event.repeat)down();});
      button.addEventListener('keyup',event=>{if(event.key===' '||event.key==='Enter')up();});
      button.addEventListener('blur',up);window.addEventListener('blur',up);
      button.addEventListener('click',()=>{runs++;$('.run-status').textContent='滑行已开始 · 第 '+runs+' 次出发';});
    }
  }
];
