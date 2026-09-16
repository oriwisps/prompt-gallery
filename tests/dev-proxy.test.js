import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createServer } from 'vite';
import config from '../vite.config.js';
import { createApp } from '../server/app.js';

test('development proxy permits same-origin login while rejecting foreign origins', async t => {
  const dir = mkdtempSync(path.join(tmpdir(), 'pg-proxy-test-'));
  const { app, db } = createApp({ dataDir: dir });
  const backend = app.listen(0, '127.0.0.1');
  await new Promise(resolve => backend.once('listening', resolve));
  const target = 'http://127.0.0.1:' + backend.address().port;
  const configuredProxy = config.server.proxy['/api'];
  const proxy = typeof configuredProxy === 'string' ? target : { ...configuredProxy, target };
  let vite, frontend;
  t.after(async () => {
    if (frontend) await new Promise(resolve => frontend.close(resolve));
    if (vite) await vite.close();
    await new Promise(resolve => backend.close(resolve));
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });
  const credentials = { username: 'proxy-test', password: 'test-only-long-password' };
  const setup = await fetch(target + '/api/setup', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-PG-Request': '1' },
    body: JSON.stringify(credentials),
  });
  assert.equal(setup.status, 200);
  await setup.json();
  vite = await createServer({
    configFile: false,
    root: dir,
    cacheDir: path.join(dir, '.vite'),
    optimizeDeps: { noDiscovery: true, entries: [] },
    server: { middlewareMode: true, hmr: false, proxy: { '/api': proxy } },
  });
  frontend = http.createServer(vite.middlewares).listen(0, '127.0.0.1');
  await new Promise(resolve => frontend.once('listening', resolve));
  const origin = 'http://127.0.0.1:' + frontend.address().port;
  const login = (requestOrigin, marker = '1') => fetch(origin + '/api/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: requestOrigin, 'X-PG-Request': marker },
    body: JSON.stringify(credentials),
  });
  const response = await login(origin);
  assert.equal(response.status, 200, JSON.stringify(await response.json()));
  const cookie = response.headers.get('set-cookie').split(';')[0];
  const cases = await fetch(origin + '/api/cases', { headers: { Cookie: cookie } });
  assert.equal(cases.status, 200);
  assert.deepEqual(await cases.json(), []);
  for (const foreign of ['https://untrusted.example', 'null']) {
    const rejected = await login(foreign);
    assert.equal(rejected.status, 403);
    assert.equal((await rejected.json()).error, '请求来源无效');
  }
  const missingMarker = await login(origin, '');
  assert.equal(missingMarker.status, 403);
  await missingMarker.json();
});
