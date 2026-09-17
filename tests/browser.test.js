import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { webcrypto } from "node:crypto";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = ts.transpileModule(readFileSync(new URL("../src/browser.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

test("HTTP context produces distinct valid UUIDs without randomUUID", () => {
  const context = { exports: {}, crypto: { getRandomValues: webcrypto.getRandomValues.bind(webcrypto) } };
  runInNewContext(source, context);
  const ids = Array.from({ length: 1000 }, () => context.exports.randomId());
  for (const id of ids) assert.match(id, /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/);
  assert.equal(new Set(ids).size, ids.length);
});

test("HTTP clipboard fallback copies text and restores focus, including failure", async () => {
  for (const succeeds of [true, false]) {
    const calls = [];
    class Element { focus() { calls.push("focus"); } }
    const field = { style: {}, select() { calls.push("select"); }, remove() { calls.push("remove"); } };
    const context = { exports: {}, navigator: {}, HTMLElement: Element, document: {
      activeElement: new Element(), createElement: () => field,
      body: { append() { calls.push("append"); } },
      execCommand(command) { assert.equal(command, "copy"); assert.equal(field.value, "示例提示词"); return succeeds; },
    } };
    runInNewContext(source, context);
    const result = context.exports.copyText("示例提示词");
    if (succeeds) await result;
    else await assert.rejects(result, /Clipboard unavailable/);
    assert.deepEqual(calls, ["append", "select", "remove", "focus"]);
  }
});
