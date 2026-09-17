import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'preview');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.html'));
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text());
});

for (const f of files) {
  errors.length = 0;
  await page.goto('file:///' + path.resolve(dir, f).replace(/\\/g, '/'));
  await page.waitForTimeout(500);
  // 每页点第一个按钮一次做冒烟
  const btn = page.locator('button').first();
  if ((await btn.count()) > 0) {
    try {
      await btn.click({ timeout: 800 });
      await page.waitForTimeout(300);
    } catch {
      /* 某些按钮可能不可点击 */
    }
  }
  console.log(f, errors.length ? 'ERRORS: ' + errors.join(' | ') : 'OK');
}
await browser.close();
