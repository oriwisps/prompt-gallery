import { test, after, before } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createApp } from "../server/app.js";
const dir = mkdtempSync(path.join(tmpdir(), "pg-tests-"));
let server, db, base, cookie;
const request = async (url, method = "GET", body, extra = {}) => {
  const r = await fetch(base + url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-PG-Request": "1",
      ...(cookie ? { Cookie: cookie } : {}),
      ...extra,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return {
    status: r.status,
    body: await r.json(),
    cookie: r.headers.get("set-cookie"),
  };
};
before(async () => {
  const app = createApp({ dataDir: dir });
  db = app.db;
  server = app.app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  base = "http://127.0.0.1:" + server.address().port;
});
after(async () => {
  await new Promise((r) => server.close(r));
  db.close();
  rmSync(dir, { recursive: true, force: true });
});
const sample = () => {
  const id = randomUUID(),
    v = randomUUID(),
    now = new Date().toISOString();
  return {
    id,
    title: "交互按钮",
    tags: ["按钮"],
    favorite: false,
    cover: "",
    theme: "plain",
    versions: [
      {
        id: v,
        name: "v1",
        prompt: "创建按钮",
        provider: "测试供应商",
        model: "模型 A",
        parameters: "",
        notes: "",
        html: "<button>OK</button>",
        css: "",
        js: "",
        createdAt: now,
      },
    ],
    bestVersionId: v,
    createdAt: now,
    updatedAt: now,
    revision: 0,
  };
};
test("authentication, validation, optimistic locking and backup restore", async () => {
  assert.equal((await request("/api/cases")).status, 401);
  assert.deepEqual((await request("/api/auth")).body, {
    initialized: false,
    authenticated: false,
  });
  assert.equal(
    (
      await request("/api/setup", "POST", {
        username: "admin",
        password: "short",
      })
    ).status,
    400,
  );
  const setup = await request("/api/setup", "POST", {
    username: "admin",
    password: "long-test-password-123",
  });
  assert.equal(setup.status, 200);
  cookie = setup.cookie.split(";")[0];
  assert.match(setup.cookie, /HttpOnly/);
  assert.match(setup.cookie, /SameSite=Strict/);
  assert.equal((await request("/api/setup", "POST", {})).status, 409);
  assert.equal((await request("/api/cases")).status, 200);
  const c = sample();
  assert.equal(
    (await request("/api/cases/" + c.id, "PUT", c, { Origin: "null" })).status,
    403,
  );
  const first = await request("/api/cases/" + c.id, "PUT", c);
  assert.equal(first.status, 200);
  assert.equal(first.body.revision, 1);
  assert.equal((await request("/api/cases/" + c.id, "PUT", c)).status, 409);
  const updated = await request("/api/cases/" + c.id, "PUT", {
    ...first.body,
    title: "更新后的按钮",
  });
  assert.equal(updated.body.revision, 2);
  assert.equal(
    (
      await request("/api/cases/" + c.id, "PUT", {
        ...updated.body,
        bestVersionId: randomUUID(),
      })
    ).status,
    400,
  );
  const backup = await request("/api/backup");
  assert.equal(backup.body.cases.length, 1);
  assert.equal(backup.body.cases[0].title, "更新后的按钮");
  assert.ok(!JSON.stringify(backup.body).includes("long-test-password"));
  assert.equal(
    (
      await request("/api/import", "POST", {
        ...backup.body,
        cases: [{ ...c, cover: "data:image/svg+xml;base64,PHN2Zz4=" }],
      })
    ).status,
    400,
  );
  assert.equal((await request("/api/cases")).body[0].revision, 2);
  assert.equal((await request("/api/import", "POST", backup.body)).status, 200);
  assert.equal(
    (await request("/api/cases/" + c.id + "?revision=2", "DELETE")).status,
    409,
  );
  assert.equal(
    (await request("/api/cases/" + c.id + "?revision=3", "DELETE")).status,
    200,
  );
  assert.equal((await request("/api/cases")).body.length, 0);
  assert.equal((await request("/api/import", "POST", backup.body)).status, 200);
  await request("/api/logout", "POST");
  assert.equal((await request("/api/cases")).status, 401);
  assert.equal(
    (
      await request("/api/login", "POST", {
        username: "admin",
        password: "wrong-password-123",
      })
    ).status,
    401,
  );
  const login = await request("/api/login", "POST", {
    username: "admin",
    password: "long-test-password-123",
  });
  assert.equal(login.status, 200);
  cookie = login.cookie.split(";")[0];
  assert.equal((await request("/api/cases")).body.length, 1);
});
