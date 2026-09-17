import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import ts from "typescript";

const root = new URL("../src/resources/", import.meta.url);
const source = JSON.parse(readFileSync(new URL("source.json", root), "utf8"));
const javascript = ts.transpileModule(readFileSync(new URL("catalog.ts", root), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
const { resources, guides, searchResources } = await import("data:text/javascript;base64," + Buffer.from(javascript).toString("base64"));
// Exercise the actual adapter with its real source metadata, without Vite's raw loader.
const contentSource = ts.createSourceFile("content.ts", readFileSync(new URL("content.ts", root), "utf8"), ts.ScriptTarget.Latest, true);
const adapter = contentSource.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "adaptExample");
const adapterJS = ts.transpileModule(`const source = ${JSON.stringify(source)};\n${adapter.getText(contentSource)}`, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
const { adaptExample } = await import("data:text/javascript;base64," + Buffer.from(adapterJS).toString("base64"));

test("upstream snapshot remains byte-for-byte traceable to the recorded revision", () => {
  assert.match(source.revision, /^[a-f0-9]{40}$/);
  assert.match(source.licenseText, /MIT License/);
  for (const file of source.files) {
    const bytes = readFileSync(new URL("upstream/" + file.path, root));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), file.sha256, file.path);
  }
});

test("curated resources resolve to snapshots, covers and guides, with useful search", () => {
  assert.equal(resources.length, 6);
  assert.equal(new Set(resources.map((item) => item.id)).size, resources.length);
  for (const category of ["brand", "product", "h5"]) assert.equal(searchResources("", category).length, 2);
  for (const resource of resources) {
    const html = readFileSync(new URL("upstream/examples/" + resource.file, root), "utf8");
    assert.match(html, /<!doctype html>/i);
    assert.ok(existsSync(new URL(`../public/design-resources/${resource.id}.png`, import.meta.url)));
    for (const id of resource.guides) assert.ok(guides.some((guide) => guide.id === id));
    assert.ok(resource.dependencies.length);
  }
  for (const guide of guides) assert.ok(existsSync(new URL("upstream/references/" + guide.file, root)));
  assert.equal(searchResources("滑块")[0].id, "morph");
  assert.equal(searchResources("  pEaCh ")[0].id, "peach");
  assert.equal(searchResources("MORPH", "product").length, 0);
  assert.equal(searchResources("not-a-resource").length, 0);
});

test("runtime adaptation resolves local libraries without changing ordinary string splitting", () => {
  for (const resource of resources) {
    const original = readFileSync(new URL("upstream/examples/" + resource.file, root), "utf8");
    const adapted = adaptExample(original);
    assert.doesNotMatch(adapted, /(?:src=["']|from\s+["'])(?:\.\/)?lib\//);
    assert.ok(adapted.includes(source.licenseText));
    if (resource.id === "morph") {
      assert.ok(adapted.includes("text.split("));
      assert.ok(!adapted.includes("text.splitText("));
    }
    if (resource.id === "calibre") {
      assert.ok(adapted.includes("animejs@4.2.2"));
      assert.ok(adapted.includes("text.splitText("));
    }
  }
});
