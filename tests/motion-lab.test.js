import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { backupSchema } from '../server/schema.js';
import { demos } from '../examples/motion-lab/demos.mjs';

const runtime=readFileSync(new URL('../examples/motion-lab/runtime.js',import.meta.url),'utf8');
function engine(reduced=false){
  let now=0,id=0;const queue=new Map(),listeners={};
  const media={matches:reduced,addEventListener:(name,fn)=>listeners['media:'+name]=fn};
  const context=vm.createContext({
    document:{querySelector:()=>null,addEventListener:(name,fn)=>listeners['document:'+name]=fn},
    window:{addEventListener:(name,fn)=>listeners['window:'+name]=fn},
    matchMedia:()=>media,performance:{now:()=>now},
    requestAnimationFrame:fn=>{queue.set(++id,fn);return id;},cancelAnimationFrame:key=>queue.delete(key),
  });
  vm.runInContext(runtime,context);
  return { context,queue,media,listeners,
    run:source=>vm.runInContext(source,context),
    tick(count=600,step=1000/60){for(let i=0;i<count&&queue.size;i++){now+=step;const callbacks=[...queue.values()];queue.clear();callbacks.forEach(fn=>fn(now));}},
  };
}

test('fluid spring expands monotonically and settles without an idle frame loop',()=>{
  const e=engine();e.run('var samples=[];var s=spring(0,v=>samples.push(v),{stiffness:220,damping:31});s.to(1)');e.tick();
  const samples=e.run('samples');assert.equal(samples.at(-1),1);
  assert.ok(samples.every((value,i)=>value>=0&&value<=1&&(i===0||value>=samples[i-1])));
  assert.equal(e.queue.size,0);
});

test('press spring reaches 0.96, overshoots slightly on release, and returns to 1',()=>{
  const e=engine();e.run('var samples=[];var s=spring(1,v=>samples.push(v),{stiffness:420,damping:19,epsilon:.0001});s.to(.96)');e.tick();assert.equal(e.run('s.value'),.96);
  e.run('samples=[];s.to(1)');e.tick();const samples=e.run('samples');
  assert.ok(Math.max(...samples)>1.001);assert.ok(Math.max(...samples)<1.02);assert.equal(samples.at(-1),1);assert.equal(e.queue.size,0);
});

test('interrupted springs reverse smoothly and only complete the newest target',()=>{
  const e=engine();e.run('var completed=[];var s=spring(0,()=>{});s.to(1,()=>completed.push("old"))');e.tick(8);
  const before=e.run('s.value');e.run('s.to(0,()=>completed.push("new"))');assert.equal(e.run('s.value'),before);e.tick();
  assert.equal(e.run('s.value'),0);assert.equal(e.run('completed.join()'),'new');assert.equal(e.queue.size,0);
});

test('reduced-motion changes finish pending motion and cancel scheduled frames',()=>{
  const e=engine();e.run('var completed=0;var s=spring(0,()=>{});s.to(1,()=>completed++)');e.tick(4);
  e.media.matches=true;e.listeners['media:change']();assert.equal(e.run('s.value'),1);assert.equal(e.run('completed'),1);assert.equal(e.queue.size,0);
  e.run('s.to(0,()=>completed++)');assert.equal(e.run('s.value'),0);assert.equal(e.run('completed'),2);assert.equal(e.queue.size,0);
});

test('spring remains finite with long frames and converges at 120 Hz',()=>{
  const e=engine();e.run('var s=spring(386,()=>{},{stiffness:310,damping:27});s.to(65)');e.tick(10,500);assert.ok(Number.isFinite(e.run('s.value')));e.tick(1200,1000/120);assert.equal(e.run('s.value'),65);assert.equal(e.queue.size,0);
});

test('pointer handling isolates primary contact and cleans up on cancel / window blur',()=>{
  const e=engine();const handlers={};let captured=null,moves=0,cancels=0;
  e.context.element={addEventListener:(key,fn)=>handlers[key]=fn,setPointerCapture:id=>captured=id,hasPointerCapture:id=>captured===id,releasePointerCapture:()=>captured=null};
  e.context.onMove=()=>moves++;e.context.onEnd=(event,cancelled)=>{if(cancelled)cancels++;};
  e.run('drag(element,{move:onMove,end:onEnd})');
  const pointer={pointerId:1,isPrimary:true,button:0};handlers.pointerdown(pointer);handlers.pointermove({...pointer,pointerId:2});assert.equal(moves,0);
  handlers.pointermove(pointer);assert.equal(moves,1);handlers.pointercancel(pointer);assert.equal(captured,null);assert.equal(cancels,1);
  handlers.pointerup(pointer);assert.equal(cancels,1);handlers.pointerdown(pointer);e.listeners['window:blur']();assert.equal(captured,null);assert.equal(cancels,2);
});

test('all seven exports validate and retain the extracted prompts and exact generated code',()=>{
  const backup=backupSchema.parse(JSON.parse(readFileSync(new URL('../examples/motion-lab/cases.json',import.meta.url),'utf8')));
  assert.equal(backup.cases.length,7);assert.equal(new Set(backup.cases.map(item=>item.id)).size,7);
  demos.forEach((demo,index)=>{
    const item=backup.cases[index],version=item.versions[0];assert.equal(version.prompt,demo.prompt);
    const standalone=readFileSync(new URL('../examples/motion-lab/'+demo.slug+'/index.html',import.meta.url),'utf8');
    assert.ok(standalone.includes(version.html));assert.ok(standalone.includes(version.css));assert.ok(standalone.includes(version.js));
    assert.doesNotThrow(()=>new vm.Script(version.js));assert.ok(!/https?:\/\//.test(standalone));
  });
});
