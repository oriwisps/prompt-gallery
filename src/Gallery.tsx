import { useState } from "react";
import {
  Plus,
  Search,
  Heart,
  ArrowUpRight,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import type { Case } from "./types";
import Cover from "./Cover";
export default function Gallery({
  items,
  favorites,
  tag,
  setTag,
  onNew,
  onOpen,
  onFavorite,
  onSamples,
  busy,
}: {
  items: Case[];
  favorites: boolean;
  tag: string;
  setTag: (s: string) => void;
  onNew: () => void;
  onOpen: (c: Case) => void;
  onFavorite: (c: Case) => void;
  onSamples: () => void;
  busy: boolean;
}) {
  const [query, setQuery] = useState(""),
    [model, setModel] = useState(""),
    [order, setOrder] = useState("recent");
  const tags = [...new Set(items.flatMap((c) => c.tags))];
  const models = [
    ...new Set(
      items.flatMap((c) => c.versions.map((v) => v.provider + " / " + v.model)),
    ),
  ];
  const filtered = items
    .filter(
      (c) =>
        (!favorites || c.favorite) &&
        (!tag || c.tags.includes(tag)) &&
        (!model ||
          c.versions.some((v) => v.provider + " / " + v.model === model)) &&
        [
          c.title,
          ...c.tags,
          ...c.versions.flatMap((v) => [v.prompt, v.model, v.provider]),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      order === "title"
        ? a.title.localeCompare(b.title, "zh-CN")
        : b.updatedAt.localeCompare(a.updatedAt),
    );
  return (
    <section className="gallery">
      <header className="page-heading">
        <div>
          <h1>{favorites ? "我的收藏" : "效果案例库"}</h1>
          <p>收藏灵感，让好效果可以复现</p>
        </div>
        <button className="primary" onClick={onNew}>
          <Plus size={18} />
          新建案例
        </button>
      </header>
      <div className="filters">
        <div className="search">
          <Search size={18} />
          <input
            aria-label="搜索案例"
            placeholder="搜索案例、提示词或标签…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="清空搜索">
              ×
            </button>
          )}
        </div>
        <select
          aria-label="按模型筛选"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          <option value="">全部模型</option>
          {models.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <select
          aria-label="排序"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
        >
          <option value="recent">最近更新</option>
          <option value="title">标题排序</option>
        </select>
      </div>
      <div className="tag-bar">
        <button className={!tag ? "active" : ""} onClick={() => setTag("")}>
          全部
        </button>
        {tags.map((t) => (
          <button
            className={tag === t ? "active" : ""}
            onClick={() => setTag(t)}
            key={t}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="results-line">
        <span>{filtered.length} 个案例</span>
        <SlidersHorizontal size={14} />
      </div>
      {filtered.length ? (
        <div className="card-grid">
          {filtered.map((c) => {
            const v = c.versions.find((v) => v.id === c.bestVersionId)!;
            return (
              <article className="case-card" key={c.id}>
                <button
                  className="card-open"
                  onClick={() => onOpen(c)}
                  aria-label={"打开" + c.title}
                >
                  <Cover item={c} />
                  <div className="card-content">
                    <h2>
                      {c.title}
                      <ArrowUpRight size={16} />
                    </h2>
                    <p>
                      {v.provider} / {v.model}
                    </p>
                    <div className="chips">
                      {c.tags.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                    <footer>
                      <span>{c.versions.length} 个版本</span>
                      <span>
                        {new Date(c.updatedAt).toLocaleDateString("zh-CN")}
                      </span>
                    </footer>
                  </div>
                </button>
                <button
                  className={"favorite " + (c.favorite ? "selected" : "")}
                  aria-label={(c.favorite ? "取消收藏" : "收藏") + c.title}
                  onClick={() => onFavorite(c)}
                >
                  <Heart
                    size={19}
                    fill={c.favorite ? "currentColor" : "none"}
                  />
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <Sparkles size={38} />
          <h2>
            {items.length ? "没有找到符合条件的案例" : "每个好效果，都值得留下"}
          </h2>
          <p>
            {items.length
              ? "试试其他关键词，或调整筛选条件。"
              : "从第一条提示词开始，建立你的前端效果库。"}
          </p>
          <button className="primary" onClick={onNew}>
            <Plus size={16} />
            新建案例
          </button>
          {!items.length && (
            <button disabled={busy} onClick={onSamples}>
              {busy ? "正在导入…" : "导入 6 个演示案例"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
