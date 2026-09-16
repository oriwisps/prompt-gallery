import express from "express";
import { DatabaseSync } from "node:sqlite";
import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { caseSchema, backupSchema } from "./schema.js";

const digest = (s) => createHash("sha256").update(s).digest("hex");
const credentials = z.object({
  username: z.string().trim().min(3).max(50),
  password: z.string().min(12).max(200),
});
export function createApp({
  dataDir = process.env.DATA_DIR || "data",
  secure = process.env.COOKIE_SECURE === "true",
} = {}) {
  mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(path.join(dataDir, "gallery.sqlite"));
  db.exec(
    "PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS admin (id INTEGER PRIMARY KEY CHECK(id=1), username TEXT NOT NULL, salt TEXT NOT NULL, hash TEXT NOT NULL); CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, expires INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS cases (id TEXT PRIMARY KEY, body TEXT NOT NULL, revision INTEGER NOT NULL);",
  );
  const app = express();
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.set({
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "X-Frame-Options": "DENY",
      "Cross-Origin-Resource-Policy": "same-origin",
    });
    if (req.path.startsWith("/api")) res.set("Cache-Control", "no-store");
    next();
  });
  app.use("/api", (req, res, next) => {
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      if (req.get("X-PG-Request") !== "1")
        return res.status(403).json({ error: "请求来源无效" });
      const origin = req.get("origin");
      try {
        if (origin && new URL(origin).host !== req.get("host"))
          return res.status(403).json({ error: "请求来源无效" });
      } catch {
        return res.status(403).json({ error: "请求来源无效" });
      }
    }
    next();
  });
  app.use(express.json({ limit: "40mb" }));
  const admin = () => db.prepare("SELECT * FROM admin WHERE id=1").get();
  const token = (req) => {
    const raw = (req.headers.cookie || "")
      .split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith("pg_session="));
    return raw?.slice(11) || "";
  };
  const isAuth = (req) =>
    !!db
      .prepare("SELECT token FROM sessions WHERE token=? AND expires>?")
      .get(digest(token(req)), Date.now());
  const cookie = (res, value, age) =>
    res.setHeader(
      "Set-Cookie",
      `pg_session=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${secure ? "; Secure" : ""}`,
    );
  const login = (res) => {
    db.prepare("DELETE FROM sessions WHERE expires<=?").run(Date.now());
    const value = randomBytes(32).toString("hex");
    db.prepare("INSERT INTO sessions VALUES (?,?)").run(
      digest(value),
      Date.now() + 7 * 86400000,
    );
    cookie(res, value, 7 * 86400);
  };
  const attempts = new Map();
  const limited = (req, res, next) => {
    const key = req.socket.remoteAddress;
    const now = Date.now();
    for (const [k, v] of attempts) if (v.until < now) attempts.delete(k);
    const a = attempts.get(key) || { count: 0, until: now + 900000 };
    a.count++;
    attempts.set(key, a);
    if (a.count > 15)
      return res.status(429).json({ error: "尝试次数过多，请 15 分钟后重试" });
    next();
  };
  app.get("/api/auth", (req, res) =>
    res.json({
      initialized: !!admin(),
      authenticated: isAuth(req),
      username: isAuth(req) ? admin()?.username : undefined,
    }),
  );
  app.post("/api/setup", limited, (req, res) => {
    if (admin()) return res.status(409).json({ error: "管理员已创建，请登录" });
    const address = req.socket.remoteAddress || "";
    if (!["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(address))
      return res.status(403).json({ error: "请先在服务器本机创建管理员账号" });
    const { username, password } = credentials.parse(req.body);
    const salt = randomBytes(16).toString("hex");
    db.prepare("INSERT INTO admin VALUES (1,?,?,?)").run(
      username,
      salt,
      scryptSync(password, salt, 64).toString("hex"),
    );
    login(res);
    res.json({ ok: true });
  });
  app.post("/api/login", limited, (req, res) => {
    const parsed = credentials.safeParse(req.body);
    const a = admin();
    const hash = scryptSync(
      parsed.success ? parsed.data.password : "invalid",
      a?.salt || "dummy",
      64,
    );
    if (
      !parsed.success ||
      !a ||
      a.username !== parsed.data.username ||
      !timingSafeEqual(Buffer.from(a.hash, "hex"), hash)
    )
      return res.status(401).json({ error: "账号或密码不正确" });
    login(res);
    res.json({ ok: true });
  });
  app.post("/api/logout", (req, res) => {
    db.prepare("DELETE FROM sessions WHERE token=?").run(digest(token(req)));
    cookie(res, "", 0);
    res.json({ ok: true });
  });
  app.use("/api", (req, res, next) =>
    isAuth(req) ? next() : res.status(401).json({ error: "请先登录" }),
  );
  const all = () =>
    db
      .prepare("SELECT body,revision FROM cases ORDER BY rowid DESC")
      .all()
      .map((r) => ({ ...JSON.parse(r.body), revision: r.revision }));
  app.get("/api/cases", (req, res) => res.json(all()));
  app.put("/api/cases/:id", (req, res) => {
    const c = caseSchema.parse(req.body);
    if (c.id !== req.params.id)
      return res.status(400).json({ error: "案例标识不匹配" });
    const old = db.prepare("SELECT revision FROM cases WHERE id=?").get(c.id);
    if ((old && old.revision !== c.revision) || (!old && c.revision !== 0))
      return res
        .status(409)
        .json({ error: "此案例已被其他设备修改或删除，请重新打开后再编辑" });
    c.revision = (old?.revision || 0) + 1;
    c.updatedAt = new Date().toISOString();
    db.prepare(
      "INSERT INTO cases VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body,revision=excluded.revision",
    ).run(c.id, JSON.stringify(c), c.revision);
    res.json(c);
  });
  app.delete("/api/cases/:id", (req, res) => {
    const result = db
      .prepare("DELETE FROM cases WHERE id=? AND revision=?")
      .run(req.params.id, Number(req.query.revision));
    if (!result.changes)
      return res.status(409).json({ error: "案例已变更，请刷新后重试" });
    res.json({ ok: true });
  });
  app.get("/api/backup", (req, res) => {
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="prompt-gallery-backup.json"',
    );
    res.json({
      format: "prompt-gallery",
      version: 1,
      exportedAt: new Date().toISOString(),
      cases: all(),
    });
  });
  app.post("/api/import", (req, res) => {
    const backup = backupSchema.parse(req.body);
    db.exec("BEGIN IMMEDIATE");
    try {
      const put = db.prepare(
        "INSERT INTO cases VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body,revision=excluded.revision",
      );
      for (const c of backup.cases) {
        const old = db
          .prepare("SELECT revision FROM cases WHERE id=?")
          .get(c.id);
        c.revision = (old?.revision || 0) + 1;
        put.run(c.id, JSON.stringify(c), c.revision);
      }
      db.exec("COMMIT");
      res.json({ count: backup.cases.length });
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
  });
  app.use("/api", (req, res) => res.status(404).json({ error: "接口不存在" }));
  app.use(express.static(path.resolve("dist")));
  app.get("/{*path}", (req, res) =>
    res.sendFile(path.resolve("dist/index.html")),
  );
  app.use((err, req, res, next) => {
    if (err instanceof z.ZodError)
      return res
        .status(400)
        .json({ error: "数据格式不正确：" + err.issues[0].message });
    if (err.type === "entity.too.large")
      return res.status(413).json({ error: "文件过大，请限制在 40 MB 以内" });
    if (err instanceof SyntaxError)
      return res.status(400).json({ error: "JSON 格式无效" });
    console.error(err);
    res.status(500).json({ error: "服务器保存失败，请重试" });
  });
  return { app, db };
}
