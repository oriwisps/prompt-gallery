import type { DesignResource } from "./catalog";
import source from "./source.json";
import { newCase } from "../samples";

export const sourceUrl = `https://github.com/mouse-lin/finesse-skill/tree/${source.revision}`;
export const originalUrl = (path: string) => `https://github.com/mouse-lin/finesse-skill/blob/${source.revision}/skills/finesse-ui/${path}`;
export { source };

const examples: Record<string, () => Promise<{ default: string }>> = {
  "caliber-precision-horology.html": () => import("./upstream/examples/caliber-precision-horology.html?raw"),
  "morph-variable-type.html": () => import("./upstream/examples/morph-variable-type.html?raw"),
  "acru-financial-dashboard.html": () => import("./upstream/examples/acru-financial-dashboard.html?raw"),
  "ledgerio-treasury-console.html": () => import("./upstream/examples/ledgerio-treasury-console.html?raw"),
  "h5-peach-daily-desk.html": () => import("./upstream/examples/h5-peach-daily-desk.html?raw"),
  "h5-brew-mobile-pdp.html": () => import("./upstream/examples/h5-brew-mobile-pdp.html?raw"),
};
const references: Record<string, () => Promise<{ default: string }>> = {
  "design-dna.md": () => import("./upstream/references/design-dna.md?raw"),
  "product-ui.md": () => import("./upstream/references/product-ui.md?raw"),
  "chart-crafting.md": () => import("./upstream/references/chart-crafting.md?raw"),
  "h5-mobile.md": () => import("./upstream/references/h5-mobile.md?raw"),
  "commerce-ui.md": () => import("./upstream/references/commerce-ui.md?raw"),
  "preflight.md": () => import("./upstream/references/preflight.md?raw"),
  "SKILL.md": () => import("./upstream/SKILL.md?raw"),
  "LICENSE": () => import("./upstream/LICENSE?raw"),
};

// Keep upstream bytes intact; adapt only the copy used by the sandbox/editor/export.
export function adaptExample(html: string) {
  let adapted = html.replace(/(["'])(?:\.\/)?lib\/gsap\.min\.js\1/g,
    '"https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"')
    .replace(/(["'])\.\/lib\/anime\.esm\.min\.js\1/g,
      '"https://cdn.jsdelivr.net/npm/animejs@4.2.2/dist/bundles/anime.esm.min.js"');
  if (html.includes("./lib/anime.esm.min.js")) {
    adapted = adapted.replace(/\btext\.split\(/g, "text.splitText(");
  }
  return `<!-- Finesse source snapshot: ${source.revision}\n${source.repository}\n${source.licenseText}\nThird-party dependencies retain their own licenses. -->\n${adapted}`;
}
export async function loadExample(resource: DesignResource) {
  return adaptExample((await examples[resource.file]()).default);
}
export async function loadReference(file: string) {
  if (!references[file]) throw new Error("未收录这份原文");
  return (await references[file]()).default;
}
export type PromptFields = DesignResource["defaults"];
export function composePrompt(resource: DesignResource, fields: PromptFields) {
  return `请根据下面的需求制作前端页面：

用途：${fields.purpose.trim()}
内容：${fields.content.trim()}
配色方向：${fields.palette.trim()}

设计参考：${resource.title} · ${resource.subtitle}
${resource.highlights.map((text) => `- ${text}`).join("\n")}

实现要求：
- 输出可独立运行的完整 HTML，包含 CSS 和 JavaScript；无需 npm 构建。
- ${resource.category === "h5" ? "以手机为主要使用环境，处理安全区、内部滚动、底部操作与触摸反馈。" : "适配桌面与手机，确保窄屏没有横向溢出，信息层级保持清晰。"}
- 使用演示数据时明确标注；按钮有真实的前端反馈，不伪装成已连接后端。
- 提供可见键盘焦点、清晰的文本对比与 prefers-reduced-motion 降级。
- 根据新需求调整内容与结构，借鉴设计方法，不照搬品牌文案；依赖使用固定版本 HTTPS 地址。

来源：${originalUrl(`examples/${resource.file}`)}
提示词由本项目根据示例与指南整理，并非上游原始生成记录；不保证逐像素复现。`;
}
export function createResourceCase(resource: DesignResource, html: string, prompt: string) {
  const item = newCase();
  item.title = `${resource.title} · 我的版本`;
  item.tags = ["Finesse", resource.category, ...resource.tags];
  item.versions[0] = {
    ...item.versions[0], name: "示例改编起点", prompt, html, css: "", js: "",
    provider: "开源示例 · Finesse", model: "未记录（非模型生成记录）",
    notes: `从 Finesse 示例创建的个人副本。模板修改只影响提示词，示例代码不会自动重写。\n来源：${originalUrl(`examples/${resource.file}`)}\n快照：${source.revision}\n提示词由本项目整理；未提供原始模型与生成过程。\n上游示例许可：MIT；Google Fonts 与 GSAP 等第三方依赖遵循各自许可。\n外部依赖：${resource.dependencies.join("；")}\n${source.licenseText}`,
  };
  return item;
}
