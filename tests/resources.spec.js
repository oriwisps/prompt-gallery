import { test, expect } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import { createApp } from "../server/app.js";

let server, db, base, dir;
test.beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "pg-resources-"));
  const result = createApp({ dataDir: dir });
  db = result.db;
  server = result.app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = "http://127.0.0.1:" + server.address().port;
});
test.afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  db.close();
  // Only this test's mkdtemp directory is removed.
  if (dir.startsWith(path.join(tmpdir(), "pg-resources-"))) rmSync(dir, { recursive: true, force: true });
});

test("browse resources, edit/copy template, save an independent case and retain provenance", async ({ page, context }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(base);
  await page.getByLabel("账号", { exact: true }).fill("resources-admin");
  await page.getByLabel("密码", { exact: true }).fill("resources-test-password-123");
  await page.getByRole("button", { name: "创建并进入" }).click();
  await page.getByRole("button", { name: "设计资源", exact: true }).click();
  await expect(page.locator(".resource-card")).toHaveCount(6);
  await expect(page.locator("iframe")).toHaveCount(0);
  for (const img of await page.locator(".resource-cover img").all()) {
    await expect(img).toBeVisible();
    await expect.poll(() => img.evaluate((el) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
  await page.getByRole("button", { name: "移动端 H5", exact: true }).click();
  await expect(page.locator(".resource-card")).toHaveCount(2);
  await page.getByLabel("搜索设计资源").fill("not-found");
  await expect(page.getByText("没有找到匹配的示例")).toBeVisible();
  await page.getByRole("button", { name: "重置筛选" }).click();
  await page.getByLabel("搜索设计资源").fill("MORPH");
  await page.getByRole("button", { name: "查看 MORPH 可变字体实验页" }).click();
  await expect(page.getByRole("heading", { name: "MORPH 可变字体实验页" })).toBeVisible();
  await expect(page.locator("iframe")).toHaveAttribute("sandbox", "allow-scripts");
  const title = page.getByLabel("页面用途", { exact: true });
  await title.fill("为独立书店制作字体体验页");
  await expect(page.getByLabel("完整提示词")).toHaveValue(/独立书店/);
  const prompt = await page.getByLabel("完整提示词").inputValue();
  await page.getByRole("button", { name: "复制提示词", exact: true }).click();
  await expect.poll(async () => (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, "\n")).toBe(prompt);
  await page.getByRole("button", { name: /品牌页：让一个视觉主题贯穿全页/ }).click();
  await page.getByText("查看原文快照 · design-dna.md", { exact: true }).click();
  await expect(page.locator(".resource-original pre")).toContainText("Design DNA");
  await page.getByRole("button", { name: /MORPH · 可变字体实验页/ }).click();
  await expect(title).toHaveValue("为独立书店制作字体体验页");
  await page.getByRole("button", { name: "创建我的案例", exact: true }).click();
  await expect(page.getByText("有未保存的修改", { exact: true })).toBeVisible();
  await expect(page.getByPlaceholder("记录生成这个效果时使用的提示词…")).toHaveValue(prompt);
  await expect(page.getByPlaceholder("输入模型名称")).toHaveValue("未记录（非模型生成记录）");
  let prevented = false;
  page.once("dialog", async (dialog) => { prevented = true; await dialog.dismiss(); });
  await page.getByRole("button", { name: "返回案例库", exact: true }).click();
  expect(prevented).toBe(true);
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await expect(page.getByText("已保存", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "返回案例库", exact: true }).click();
  await page.getByRole("button", { name: "打开MORPH · 我的版本", exact: true }).click();
  await expect(page.getByPlaceholder("记录生成这个效果时使用的提示词…")).toHaveValue(prompt);
  const records = await page.evaluate(async () => (await fetch("/api/cases")).json());
  expect(records).toHaveLength(1);
  expect(records[0].versions[0].notes).toContain("5050b6c71e27b829d1b3087d2be889d29c60db00");
  expect(records[0].versions[0].html).toContain("MIT License");
  await page.getByRole("button", { name: "设计资源", exact: true }).click();
  await page.getByRole("button", { name: "术语查阅", exact: true }).click();
  await expect(page.getByText("找到 128 条术语", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /精选示例/ }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".resource-card")).toHaveCount(6);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "查看 PEACH DESK 日常记录工作台" }).click();
  await expect(page.getByLabel("页面用途", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "停止", exact: true }).click();
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.getByRole("button", { name: "运行示例", exact: true }).click();
  await expect(page.locator("iframe")).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("failed external script is explained and preview can be stopped or retried", async ({ page }) => {
  await page.goto(base);
  await page.getByLabel("账号", { exact: true }).fill("resources-admin");
  await page.getByLabel("密码", { exact: true }).fill("resources-test-password-123");
  await page.getByRole("button", { name: /^(登录效果库|创建并进入)$/ }).click();
  await page.getByRole("button", { name: "设计资源", exact: true }).click();
  await page.getByRole("button", { name: "查看 ACRU 团队效率仪表盘" }).click();
  // Edge's opaque srcdoc frame bypasses Playwright request routing. Substitute a
  // reserved invalid hostname in the actual frame to exercise real load errors.
  await page.locator("iframe").evaluate((frame) => {
    frame.srcdoc = frame.srcdoc.replace("https://cdn.jsdelivr.net/", "https://finesse-preview.invalid/");
  });
  await expect(page.locator(".resource-warning")).toBeVisible();
  await page.getByRole("button", { name: "停止", exact: true }).click();
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.getByRole("button", { name: "重新运行", exact: true }).click();
  await expect(page.locator("iframe")).toHaveCount(1);
  await expect(page.locator(".resource-warning")).toHaveCount(0);
  await expect(page.locator("iframe")).not.toHaveAttribute("srcdoc", /finesse-preview\.invalid/);
});
