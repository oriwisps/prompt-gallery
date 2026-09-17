import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import {
  Aperture,
  Grid2X2,
  Heart,
  Database,
  LogOut,
  Menu,
  Check,
  X,
  RefreshCw,
  BookOpen,
  Library,
} from "lucide-react";
import type { Auth, Case } from "./types";
import { api } from "./api";
import { newCase, sampleCases } from "./samples";
import AuthScreen from "./Auth";
import Gallery from "./Gallery";
const Editor = lazy(() => import("./Editor"));
const Terms = lazy(() => import("./Terms"));
const Resources = lazy(() => import("./Resources"));
import Backup from "./Backup";
export default function App() {
  const [auth, setAuth] = useState<Auth | null>(null),
    [items, setItems] = useState<Case[]>([]),
    [page, setPage] = useState("gallery"),
    [selected, setSelected] = useState<Case | null>(null),
    [tag, setTag] = useState(""),
    [dirty, setDirty] = useState(false),
    [toast, setToast] = useState(""),
    [error, setError] = useState(""),
    [menu, setMenu] = useState(false),
    [busy, setBusy] = useState(false);
  const notify = useCallback((s: string) => setToast(s), []);
  const reload = useCallback(async () => {
    setItems(await api<Case[]>("/cases"));
  }, []);
  const init = useCallback(async () => {
    setError("");
    try {
      const a = await api<Auth>("/auth");
      setAuth(a);
      if (a.authenticated) await reload();
    } catch (e) {
      setError((e as Error).message);
    }
  }, [reload]);
  useEffect(() => {
    void init();
  }, [init]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  const navigate = (next: string) => {
    if (dirty && !confirm("有未保存的修改，确定放弃并离开？")) return;
    setDirty(false);
    setSelected(null);
    setPage(next);
    setMenu(false);
  };
  const save = async (c: Case) => {
    const result = await api<Case>("/cases/" + c.id, "PUT", c);
    setItems((list) => [result, ...list.filter((x) => x.id !== c.id)]);
    return result;
  };
  if (!auth)
    return (
      <div className="loading">
        <Aperture size={32} />
        <p>{error || "正在打开你的效果库…"}</p>
        {error && <button onClick={init}>重试</button>}
      </div>
    );
  if (!auth.authenticated)
    return <AuthScreen initialized={auth.initialized} onLogin={init} />;
  return (
    <div className="app-shell">
      <button
        className="mobile-menu"
        aria-label="展开导航"
        onClick={() => setMenu(!menu)}
      >
        <Menu size={20} />
      </button>
      {menu && (
        <button
          className="scrim"
          aria-label="关闭导航"
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={"sidebar " + (menu ? "open" : "")}>
        <div className="brand">
          <Aperture size={29} />
          <div>
            <strong>Prompt Gallery</strong>
            <small>个人 AI 前端提示词库</small>
          </div>
        </div>
        <nav>
          <button
            className={page === "gallery" ? "active" : ""}
            onClick={() => navigate("gallery")}
          >
            <Grid2X2 size={17} />
            全部案例<span>{items.length}</span>
          </button>
          <button
            className={page === "favorites" ? "active" : ""}
            onClick={() => navigate("favorites")}
          >
            <Heart size={17} />
            我的收藏<span>{items.filter((c) => c.favorite).length}</span>
          </button>
          <button
            className={page === "resources" ? "active" : ""}
            onClick={() => navigate("resources")}
          >
            <Library size={17} />设计资源
          </button>
          <button
            className={page === "terms" ? "active" : ""}
            onClick={() => navigate("terms")}
          >
            <BookOpen size={17} />术语库
          </button>
          <button
            className={page === "backup" ? "active" : ""}
            onClick={() => navigate("backup")}
          >
            <Database size={17} />
            数据备份
          </button>
        </nav>
        <div className="sidebar-tags">
          <small>标签</small>
          <button
            className={!tag ? "active" : ""}
            onClick={() => {
              if (dirty && !confirm("放弃未保存的修改？")) return;
              setTag("");
              setDirty(false);
              setSelected(null);
              setPage("gallery");
              setMenu(false);
            }}
          >
            全部<span>{items.length}</span>
          </button>
          {[...new Set(items.flatMap((c) => c.tags))].map((t) => (
            <button
              className={tag === t ? "active" : ""}
              key={t}
              onClick={() => {
                if (dirty && !confirm("放弃未保存的修改？")) return;
                setTag(t);
                setDirty(false);
                setSelected(null);
                setPage("gallery");
                setMenu(false);
              }}
            >
              {t}
              <span>{items.filter((c) => c.tags.includes(t)).length}</span>
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <p>用提示词，创造更好的界面</p>
          <div>
            <span className="avatar">
              {auth.username?.slice(0, 1).toUpperCase()}
            </span>
            <span>{auth.username}</span>
            <button
              aria-label="刷新案例"
              onClick={async () => {
                try {
                  await reload();
                  notify("案例列表已刷新");
                } catch (e) {
                  notify((e as Error).message);
                }
              }}
            >
              <RefreshCw size={14} />
            </button>
            <button
              aria-label="退出登录"
              onClick={async () => {
                if (dirty && !confirm("放弃未保存的修改并退出？")) return;
                try {
                  await api("/logout", "POST");
                  setDirty(false);
                  setSelected(null);
                  setItems([]);
                  await init();
                } catch (e) {
                  notify((e as Error).message);
                }
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <main className="main-content">
        {error && (
          <div className="error banner">
            {error}
            <button onClick={init}>重试</button>
          </div>
        )}
        {selected ? (
          <Suspense fallback={<div className="loading">正在加载编辑器…</div>}>
            <Editor
              key={selected.id}
              initial={selected}
              items={items}
              onSave={save}
              notify={notify}
              onDirty={setDirty}
              onClose={() => navigate(page)}
              onDelete={async (c) => {
                await api(
                  "/cases/" + c.id + "?revision=" + c.revision,
                  "DELETE",
                );
                setItems((list) => list.filter((x) => x.id !== c.id));
                setSelected(null);
                setDirty(false);
                notify("案例已删除");
              }}
            />
          </Suspense>
        ) : page === "resources" ? (
          <Suspense fallback={<div className="loading">正在加载设计资源…</div>}>
            <Resources notify={notify} onDirty={setDirty} onCreate={(item) => {
              setDirty(false);
              setPage("gallery");
              setSelected(item);
              notify("已创建示例副本，点击保存加入案例库");
            }} />
          </Suspense>
        ) : page === "terms" ? (
          <Suspense fallback={<div className="loading">正在加载术语库…</div>}>
            <Terms notify={notify} />
          </Suspense>
        ) : page === "backup" ? (
          <Backup count={items.length} onImported={reload} notify={notify} />
        ) : (
          <Gallery
            items={items}
            favorites={page === "favorites"}
            tag={tag}
            setTag={setTag}
            onNew={() => setSelected(newCase())}
            onOpen={setSelected}
            busy={busy}
            onFavorite={async (c) => {
              try {
                await save({ ...c, favorite: !c.favorite });
              } catch (e) {
                notify((e as Error).message);
              }
            }}
            onSamples={async () => {
              setBusy(true);
              try {
                await api("/import", "POST", {
                  format: "prompt-gallery",
                  version: 1,
                  cases: sampleCases(),
                });
                await reload();
                notify("6 个演示案例已导入");
              } catch (e) {
                notify((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          />
        )}
      </main>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
          <button aria-label="关闭提示" onClick={() => setToast("")}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
