import { test, expect } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import { createApp } from "../server/app.js";
let server, db, base, dir;
test.beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "pg-browser-"));
  const result = createApp({ dataDir: dir });
  db = result.db;
  server = result.app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  base = "http://127.0.0.1:" + server.address().port;
});
test.afterAll(async () => {
  await new Promise((r) => server.close(r));
  db.close();
  rmSync(dir, { recursive: true, force: true });
});
test("create, run, compare, persist, backup and mobile", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (d) => d.accept());
  await page.goto(base);
  await expect(page).toHaveTitle(/Prompt Gallery/);
  await page.getByLabel("账号", { exact: true }).fill("qa-admin");
  await page.getByLabel("密码", { exact: true }).fill("qa-test-password-123");
  await page.getByRole("button", { name: "创建并进入" }).click();
  await page.getByRole("button", { name: "导入 6 个演示案例" }).click();
  await expect(page.locator(".case-card")).toHaveCount(6);
  await page
    .getByRole("textbox", { name: "搜索案例", exact: true })
    .fill("行星");
  await expect(page.locator(".case-card")).toHaveCount(1);
  await page.getByRole("button", { name: "清空搜索" }).click();
  await page
    .getByRole("button", { name: "收藏发光悬停按钮", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "取消收藏发光悬停按钮", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "打开发光悬停按钮" }).click();
  await expect(page.locator("iframe")).toHaveCount(1);
  const previewBounds = await page.locator(".preview-panel").boundingBox();
  const codeBounds = await page.locator(".code-panel").boundingBox();
  expect(previewBounds.y).toBeLessThan(200);
  expect(previewBounds.height).toBeGreaterThan(600);
  expect(previewBounds.y).toBeLessThan(codeBounds.y);
  await page.getByRole("button", { name: "放大预览", exact: true }).click();
  await expect(page.locator(".preview-panel")).toHaveClass(/is-expanded/);
  await page.getByRole("button", { name: "退出放大预览", exact: true }).click();
  await expect(page.locator(".preview-panel")).not.toHaveClass(/is-expanded/);
  await page
    .frameLocator("iframe")
    .getByRole("button", { name: "Hover me" })
    .click();
  await expect(
    page.frameLocator("iframe").getByRole("button", { name: "Nice click ✓" }),
  ).toBeVisible();
  const frame = page.frames().find((f) => f !== page.mainFrame());
  expect(
    await frame.evaluate(() => {
      try {
        void parent.document.body;
        return false;
      } catch {
        return true;
      }
    }),
  ).toBe(true);
  await page.getByRole("button", { name: "新版本", exact: true }).click();
  await page.getByLabel("版本名称").fill("对比版");
  await page.getByRole("button", { name: "设为最佳版本" }).click();
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await expect(page.getByText("已保存", { exact: true })).toBeVisible();
  await page
    .getByRole("combobox", { name: "对比版本" })
    .selectOption({ label: "对比：示例版本" });
  await page.getByRole("button", { name: "运行", exact: true }).click();
  for (const title of ["当前版本效果预览", "对比版本效果预览"])
    await expect(
      page
        .frameLocator(`iframe[title="${title}"]`)
        .getByRole("button", { name: "Hover me" }),
    ).toBeVisible();
  await page.getByRole("button", { name: "停止预览" }).click();
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.getByRole("button", { name: "返回案例库" }).click();
  await page.getByRole("button", { name: "新建案例", exact: true }).click();
  await page.getByPlaceholder("给这个效果起个名字").fill("完整 HTML 验证");
  await page.getByLabel("标签", { exact: true }).fill("测试,测试,交互");
  await page
    .getByPlaceholder("记录生成这个效果时使用的提示词…")
    .fill("测试完整 HTML 中的代码与额外 JavaScript 一起执行");
  await page.getByPlaceholder("如 OpenAI").fill("测试供应商");
  await page.getByPlaceholder("输入模型名称").fill("测试模型");
  await page
    .locator(".cm-content")
    .fill(
      '<!doctype html><html><head><title>Preview</title></head><body><button id="click">Before</button></body></html>',
    );
  await page.getByRole("tab", { name: "JavaScript", exact: true }).click();
  await expect(page.locator(".cm-content")).toHaveText("");
  await page
    .locator(".cm-content")
    .pressSequentially(
      'document.querySelector("button").onclick = () => { document.querySelector("button").textContent = "$& after"; };',
    );
  await page.getByRole("button", { name: "运行", exact: true }).click();
  await expect(page.locator("iframe")).toHaveAttribute("srcdoc", /\$& after/);
  await page
    .frameLocator("iframe")
    .getByRole("button", { name: "Before" })
    .click();
  await expect(
    page.frameLocator("iframe").getByRole("button", { name: "$& after" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await expect(page.getByText("已保存", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "返回案例库" }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "打开完整 HTML 验证" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "数据备份", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出备份", exact: true }).click();
  const backup = await downloadPromise;
  await page.locator("input[type=file]").setInputFiles(await backup.path());
  await expect(
    page.getByText("已恢复 7 个案例", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /全部案例/ }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".sidebar")).not.toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "打开完整 HTML 验证" }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "展开导航" }).click();
  await page.getByRole("button", { name: "退出登录" }).click();
  await expect(page.getByRole("heading", { name: "欢迎回来" })).toBeVisible();
  expect(errors).toEqual([]);
});
