import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { backupSchema } from '../../server/schema.js';
import { demos } from './demos.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const sharedCSS = readFileSync(path.join(root, 'shared.css'), 'utf8');
const runtime = readFileSync(path.join(root, 'runtime.js'), 'utf8');
const escape = text => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function stableId(key) {
  const hash = createHash('sha256').update('prompt-gallery/motion-lab/' + key).digest('hex');
  return `${hash.slice(0,8)}-${hash.slice(8,12)}-4${hash.slice(13,16)}-a${hash.slice(17,20)}-${hash.slice(20,32)}`;
}
const now = new Date().toISOString();
const cases = demos.map(demo => {
  const html = `<main><header class="heading"><span class="number">${demo.number}</span><div><h1>${demo.title}</h1><div class="english">${demo.english}</div></div></header><section class="lab"><div class="demo">${demo.html}<p class="instruction">${demo.hint}</p></div><aside class="readout" aria-label="实时参数"><div class="live">LIVE READOUT</div>${demo.metrics.map(([key,label])=>`<div class="metric"><small>${label}</small><output data-metric="${key}" aria-live="off">—</output></div>`).join('')}<svg class="trace" viewBox="0 0 220 90" aria-hidden="true"><path/></svg><span class="trace-label">MOTION HISTORY / 动态轨迹</span></aside></section><section class="prompt"><h2>AI 提示词 / 原文提取</h2><p>${escape(demo.prompt)}</p></section></main>`;
  const css = sharedCSS + '\n' + demo.css;
  const js = '(() => {\n' + runtime + '\n(' + demo.run.toString() + ')();\n})();';
  const standalone = `<!doctype html>\n<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${demo.number} ${demo.title} · Motion Lab</title><style>\n${css}\n</style></head><body>\n${html}\n<script>\n${js}\n</script></body></html>\n`;
  mkdirSync(path.join(root,demo.slug),{recursive:true});
  writeFileSync(path.join(root,demo.slug,'index.html'),standalone);
  const versionId=stableId(demo.slug+'/v1');
  return {
    id:stableId(demo.slug),title:demo.number+' · '+demo.title,tags:['截图提示词',...demo.tags],theme:demo.theme,favorite:false,cover:'',bestVersionId:versionId,createdAt:now,updatedAt:now,revision:0,
    versions:[{id:versionId,name:'截图提示词 · 初始实现',prompt:demo.prompt,provider:'OpenAI',model:'Codex（当前会话）',parameters:'纯 HTML / CSS / JavaScript；内置阻尼弹簧；无外部依赖',notes:'根据用户截图中 AI 描述词生成。保留原编号；原创 SVG 雪山插画代替参考照片。支持鼠标、触摸、键盘及减少动态效果偏好。',html,css,js,createdAt:now}],
  };
});
const backup=backupSchema.parse({format:'prompt-gallery',version:1,cases});
writeFileSync(path.join(root,'cases.json'),JSON.stringify(backup,null,2)+'\n');
const hub=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Motion Lab · 七个交互动效案例</title><style>
*{box-sizing:border-box}body{margin:0;background:#111817;color:#edf0ed;font-family:Inter,"Segoe UI","Microsoft YaHei",sans-serif}header{padding:20px 28px;border-bottom:1px solid #ffffff15;display:flex;gap:15px;justify-content:space-between;align-items:center}h1{font-size:18px;margin:0;letter-spacing:-.3px}header span{font-size:11px;color:#8fa095}header a{color:#ff931e;font-size:12px;text-decoration:none}.workspace{display:grid;grid-template-columns:220px 1fr;height:calc(100svh - 66px);min-height:0}nav{border-right:1px solid #ffffff15;padding:22px 12px}nav small{display:block;padding:0 14px 18px;color:#788c7f;font-size:10px;letter-spacing:2px}nav button{display:flex;gap:12px;align-items:center;width:100%;background:none;border:0;color:#9cac9f;text-align:left;padding:16px 12px;border-radius:10px;cursor:pointer;font:inherit;font-size:12px;margin-bottom:5px}nav button b{font:11px ui-monospace,monospace;color:#597463}nav button[aria-pressed=true]{background:#ff931e17;color:#ffab4e}nav button[aria-pressed=true] b{color:#ff931e}button:focus-visible,a:focus-visible{outline:2px solid #ff931e;outline-offset:3px}iframe{display:block;width:100%;height:100%;border:0}nav p{color:#526e5c;font-size:10px;padding:18px 14px;line-height:1.8}@media(max-width:780px){header{padding:16px}header span{display:none}.workspace{display:flex;flex-direction:column;height:calc(100svh - 55px);min-height:0}nav{display:flex;gap:7px;overflow:auto;flex-shrink:0;padding:10px;border-right:0;border-bottom:1px solid #ffffff15}nav button{width:auto;white-space:nowrap;margin:0;padding:12px;font-size:11px}nav small,nav p{display:none}iframe{flex:1;min-height:0}}
</style></head><body><header><h1>Motion Lab <span> / 交互的七种细节</span></h1><a href="cases.json" download>下载全部案例 JSON ↓</a></header><div class="workspace"><nav aria-label="选择交互案例"><small>INTERACTION STUDIES</small>${demos.map((demo,i)=>`<button data-slug="${demo.slug}" aria-pressed="${i===0}"><b>${demo.number}</b>${demo.title}</button>`).join('')}<p>从提示词到可触摸的细节。<br>7 个独立案例 · 无外部依赖</p></nav><iframe src="fluid-morph/index.html" title="02 流体胶囊形变" sandbox="allow-scripts"></iframe></div><script>const buttons=[...document.querySelectorAll('nav button')],frame=document.querySelector('iframe');buttons.forEach(button=>button.addEventListener('click',()=>{buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));frame.src=button.dataset.slug+'/index.html';frame.title=button.textContent;}));</script></body></html>`;
writeFileSync(path.join(root,'index.html'),hub);
console.log(`Generated ${cases.length} standalone demos, index.html and cases.json.`);
if(process.argv.includes('--install')) {
  const db=new DatabaseSync(fileURLToPath(new URL('../../data/gallery.sqlite',import.meta.url)));
  db.exec('PRAGMA busy_timeout=5000; BEGIN IMMEDIATE');
  let inserted=0;
  try {
    const insert=db.prepare('INSERT OR IGNORE INTO cases (id,body,revision) VALUES (?,?,?)');
    for(const item of cases){const saved={...item,revision:1};inserted+=Number(insert.run(saved.id,JSON.stringify(saved),1).changes);}
    db.exec('COMMIT');console.log(`Saved ${inserted} new cases; existing IDs left unchanged.`);
  } catch(error){db.exec('ROLLBACK');throw error;} finally{db.close();}
}
