// 从数据库导出 MiMo 版本为可独立打开的 HTML 预览。
// 用法：node examples/my-versions/preview.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const root = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(root, 'preview');
mkdirSync(outDir, { recursive: true });

const db = new DatabaseSync(fileURLToPath(new URL('../../data/gallery.sqlite', import.meta.url)));
const rows = db.prepare('SELECT body FROM cases').all();
const slugs = {
  '流体胶囊形变': 'fluid-morph',
  '共享元素': 'shared-element',
  '磁吸游标': 'snap-odometer',
  '阻尼弹性抽屉': 'bottom-sheet',
  '动态弥散光晕': 'conic-glow',
  '物理弹簧交错': 'stagger-cascade',
  '弹性微缩触觉': 'press-scale',
  '流光触感卡片': 'prismatic-card',
};

let count = 0;
for (const row of rows) {
  const c = JSON.parse(row.body);
  const v = c.versions.find((x) => x.provider === 'Xiaomi' && x.model === 'MiMo');
  if (!v) continue;
  const key = Object.keys(slugs).find((k) => c.title.includes(k));
  const slug = key ? slugs[key] : 'unknown';
  const file = path.join(outDir, slug + '.html');
  const html = `<!doctype html>
<html lang="zh-CN"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${c.title} · MiMo</title>
<style>${v.css}</style>
</head><body>
${v.html}
<script>${v.js}</script>
</body></html>
`;
  writeFileSync(file, html);
  console.log('预览：', path.relative(process.cwd(), file));
  count++;
}
db.close();
console.log(`导出 ${count} 个预览页 → examples/my-versions/preview/`);
