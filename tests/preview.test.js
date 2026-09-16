import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
const source = readFileSync(
  new URL("../src/preview.ts", import.meta.url),
  "utf8",
);
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
const { buildDocument } = await import(
  "data:text/javascript;base64," + Buffer.from(js).toString("base64")
);
test("full document assembly preserves literal replacement strings and injects policies", () => {
  const v = {
    html: "<!doctype html><html><head></head><body><button>Test</button></body></html>",
    css: 'button:after{content:"$&"}',
    js: 'document.title="$&";',
  };
  const doc = buildDocument(v);
  assert.ok(doc.includes(v.css));
  assert.ok(doc.includes(v.js));
  assert.ok(doc.indexOf("Content-Security-Policy") < doc.indexOf("<button>"));
  assert.ok(doc.includes("form-action"));
  const noHead = buildDocument({
    ...v,
    html: "<!doctype html><button>Test</button>",
  });
  assert.ok(noHead.includes("Content-Security-Policy"));
  assert.ok(noHead.includes(v.css));
  assert.ok(!buildDocument(v, false).includes("Content-Security-Policy"));
});
