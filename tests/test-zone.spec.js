import { test, expect } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import { createApp } from "../server/app.js";

let server, db, base, dir;
test.beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "pg-test-zone-"));
  const result = createApp({ dataDir: dir });
  db = result.db;
  server = result.app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = "http://127.0.0.1:" + server.address().port;
});
test.afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

test("test zone groups implementations by prompt and copies the current prompt", async ({ page }) => {
  await page.goto(base);
  await page.getByLabel("账号", { exact: true }).fill("zone-admin");
  await page.getByLabel("密码", { exact: true }).fill("qa-test-password-123");
  await page.getByRole("button", { name: "创建并进入" }).click();
  await page.getByRole("button", { name: "测试专区" }).click();
  await expect(page.locator(".test-card-grid .case-card")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "鹈鹕测试" })).toBeVisible();
  await page.getByRole("button", { name: "打开测试记录 鹈鹕测试" }).click();
  await expect(page.locator(".test-version-item")).toHaveCount(3);
  await page.locator(".test-version-item").nth(2).locator("button").first().click();
  await expect(page.locator(".test-metadata")).toContainText("MiMo V2.6 Pro");
  await expect.poll(() => page.frameLocator(".test-preview-stage iframe").locator("html").evaluate(() => document.documentElement.style.getPropertyValue("--speed"))).toBe("1");
  await page.frameLocator(".test-preview-stage iframe").locator("#btn-pause").evaluate((button) => button.click());
  await expect(page.frameLocator(".test-preview-stage iframe").getByRole("button", { name: "继续" })).toBeVisible();
  await page.locator(".test-version-item").nth(1).locator("button").first().click();
  await expect(page.locator(".test-preview-toolbar")).toContainText("工作区实现");

  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async (value) => { window.__copiedPrompt = value; } },
    });
  });
  await page.getByRole("button", { name: "复制此版本的提示词" }).click();
  expect(await page.evaluate(() => window.__copiedPrompt)).toBe(await page.locator(".test-prompt").textContent());

  await page.getByRole("button", { name: "编辑版本 工作区实现" }).click();
  await expect(page.getByRole("heading", { name: "鹈鹕测试" })).toBeVisible();
  await expect(page.locator("#version-select")).toHaveValue(/.+/);
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await expect(page.getByText("已保存", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "返回测试专区" }).click();
  await page.getByRole("button", { name: "打开测试记录 鹈鹕测试" }).click();
  await expect(page.locator(".test-version-item")).toHaveCount(3);

  await page.getByRole("button", { name: "记录新版本" }).click();
  await expect(page.locator("#version-select option")).toHaveCount(4);
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await expect(page.getByText("已保存", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "返回测试专区" }).click();
  await expect(page.locator(".test-card-grid .case-card")).toHaveCount(1);
  await page.getByRole("button", { name: "打开测试记录 鹈鹕测试" }).click();
  await expect(page.locator(".test-version-item")).toHaveCount(4);

  await page.getByRole("button", { name: "新建测试记录" }).click();
  await page.getByPlaceholder("给这个效果起个名字").fill("同提示词的另一个案例");
  await page.getByPlaceholder("记录生成这个效果时使用的提示词…").fill(await page.evaluate(() => window.__copiedPrompt));
  await page.getByPlaceholder("如 OpenAI").fill("测试供应商");
  await page.getByPlaceholder("输入模型名称").fill("测试模型");
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await expect(page.getByText("已保存", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "返回测试专区" }).click();
  await expect(page.locator(".test-card-grid .case-card")).toHaveCount(1);
  await page.getByRole("button", { name: "打开测试记录 鹈鹕测试" }).click();
  await expect(page.locator(".test-version-item")).toHaveCount(5);
});
