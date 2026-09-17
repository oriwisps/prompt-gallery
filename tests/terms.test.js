import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("bundled glossary retains 128 complete entries and valid related terms", () => {
  const files = { web: 44, h5: 30, motion: 34, mp: 10, base: 10 };
  const terms = Object.entries(files).flatMap(([name, count]) => {
    const data = JSON.parse(readFileSync(new URL(`../src/terms/${name}.json`, import.meta.url), "utf8"));
    assert.equal(data.terms.length, count);
    return data.terms;
  });
  const ids = new Set(terms.map((term) => term.id));
  assert.equal(ids.size, 128);
  for (const term of terms) {
    for (const key of ["id", "title", "en", "layer", "plain", "say", "trap"]) {
      assert.ok(typeof term[key] === "string" && term[key].trim(), `${term.id}: ${key}`);
    }
    for (const key of ["aliases", "trigger", "pairs"]) assert.ok(Array.isArray(term[key]) && term[key].length, `${term.id}: ${key}`);
    for (const id of term.pairs) assert.ok(ids.has(id), `${term.id} -> ${id}`);
  }
});
