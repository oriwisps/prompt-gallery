// 将 myVersions 中的实现追加为库内案例的新版本（不覆盖已有版本）。
// 用法：node examples/my-versions/install.mjs
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { backupSchema, caseSchema } from '../../server/schema.js';
import { myVersions } from './implementations.mjs';

const dbPath = fileURLToPath(new URL('../../data/gallery.sqlite', import.meta.url));
const db = new DatabaseSync(dbPath);

function allCases() {
  return db.prepare('SELECT id, body, revision FROM cases').all().map((row) => {
    const body = JSON.parse(row.body);
    return { ...body, revision: row.revision };
  });
}

const cases = allCases();
const now = new Date().toISOString();
const plan = [];
const usedVersionIds = new Set();

for (const impl of myVersions) {
  const target = cases.find((c) => c.title.includes(impl.match));
  if (!target) {
    console.error('未找到匹配案例：', impl.match);
    process.exitCode = 1;
    continue;
  }
  const already = target.versions.some((v) => v.name === impl.name && v.provider === impl.provider);
  if (already) {
    console.log('跳过（已存在）：', target.title, '·', impl.name);
    continue;
  }
  const version = {
    id: randomUUID(),
    name: impl.name,
    prompt: impl.prompt,
    provider: impl.provider,
    model: impl.model,
    parameters: impl.parameters,
    notes: impl.notes,
    html: impl.html,
    css: impl.css,
    js: impl.js,
    createdAt: now,
  };
  usedVersionIds.add(version.id);
  plan.push({
    caseId: target.id,
    next: {
      ...target,
      versions: [...target.versions, version],
      updatedAt: now,
    },
  });
}

if (!plan.length) {
  console.log('没有需要写入的新版本。');
  db.close();
  process.exit(0);
}

// 逐个校验后写入
db.exec('BEGIN IMMEDIATE');
try {
  const get = db.prepare('SELECT revision, body FROM cases WHERE id=?');
  const put = db.prepare(
    'INSERT INTO cases VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body,revision=excluded.revision',
  );
  for (const { caseId, next } of plan) {
    const row = get.get(caseId);
    if (!row) throw new Error('案例消失：' + caseId);
    if (row.revision !== next.revision) {
      throw new Error('并发修改冲突：' + caseId + ' expected ' + next.revision + ' got ' + row.revision);
    }
    const parsed = caseSchema.parse(next);
    const revision = row.revision + 1;
    put.run(caseId, JSON.stringify(parsed), revision);
    console.log('已写入：', parsed.title, '版本数', parsed.versions.length, '→ rev', revision);
  }
  db.exec('COMMIT');
} catch (error) {
  db.exec('ROLLBACK');
  throw error;
} finally {
  db.close();
}

console.log(`完成：${plan.length} 个案例新增版本。`);
