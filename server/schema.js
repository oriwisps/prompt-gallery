import { z } from "zod";
const text = (max) => z.string().max(max);
export const versionSchema = z.object({
  id: z.string().uuid(),
  name: text(80).min(1),
  prompt: text(100000).min(1),
  provider: text(80).min(1),
  model: text(120).min(1),
  parameters: text(10000),
  notes: text(10000),
  html: text(500000),
  css: text(500000),
  js: text(500000),
  createdAt: z.string().datetime(),
});
export const caseSchema = z
  .object({
    id: z.string().uuid(),
    title: text(120).trim().min(1),
    tags: z.array(text(40).trim().min(1)).max(20),
    favorite: z.boolean(),
    cover: text(3000000).refine(
      (v) =>
        !v ||
        /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(v),
      "封面必须是 PNG、JPEG、WebP 或 GIF 图片",
    ),
    theme: z.enum([
      "glow",
      "orbit",
      "glass",
      "type",
      "particles",
      "loader",
      "plain",
    ]),
    versions: z.array(versionSchema).min(1).max(100),
    bestVersionId: z.string().uuid(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    revision: z.number().int().nonnegative(),
  })
  .superRefine((v, ctx) => {
    if (
      !v.versions.some((x) => x.id === v.bestVersionId) ||
      new Set(v.versions.map((x) => x.id)).size !== v.versions.length
    )
      ctx.addIssue({ code: "custom", message: "版本标识无效" });
  });
export const backupSchema = z
  .object({
    format: z.literal("prompt-gallery"),
    version: z.literal(1),
    cases: z.array(caseSchema).max(1000),
  })
  .superRefine((v, ctx) => {
    if (new Set(v.cases.map((x) => x.id)).size !== v.cases.length)
      ctx.addIssue({ code: "custom", message: "案例标识重复" });
  });
