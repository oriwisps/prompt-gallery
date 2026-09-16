import { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import {
  ArrowLeft,
  Save,
  Play,
  Copy,
  Plus,
  Crown,
  Download,
  Trash2,
  ImagePlus,
  Square,
  Columns2,
  Monitor,
  Smartphone,
} from "lucide-react";
import type { Case, Version } from "./types";
import { buildDocument } from "./preview";
import { download } from "./api";
import Cover from "./Cover";

export default function Editor({
  initial,
  items,
  onSave,
  onClose,
  onDelete,
  notify,
  onDirty,
}: {
  initial: Case;
  items: Case[];
  onSave: (c: Case) => Promise<Case>;
  onClose: () => void;
  onDelete: (c: Case) => Promise<void>;
  notify: (s: string) => void;
  onDirty: (b: boolean) => void;
}) {
  const [item, setItem] = useState<Case>(() => structuredClone(initial)),
    [tagInput, setTagInput] = useState(initial.tags.join("，")),
    [saved, setSaved] = useState(JSON.stringify(initial)),
    [versionId, setVersionId] = useState(initial.bestVersionId),
    [tab, setTab] = useState<"html" | "css" | "js">("html"),
    [running, setRunning] = useState<{
      document: string;
      compare: string;
    } | null>(null),
    [compare, setCompare] = useState(""),
    [mobile, setMobile] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const v = item.versions.find((v) => v.id === versionId)!,
    dirty = JSON.stringify(item) !== saved || tagInput !== item.tags.join("，");
  useEffect(() => {
    onDirty(dirty);
    const unload = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", unload);
    return () => window.removeEventListener("beforeunload", unload);
  }, [dirty, onDirty]);
  const update = (patch: Partial<Case>) => setItem((c) => ({ ...c, ...patch }));
  const updateVersion = (patch: Partial<Version>) =>
    setItem((c) => ({
      ...c,
      versions: c.versions.map((x) =>
        x.id === versionId ? { ...x, ...patch } : x,
      ),
    }));
  const save = async () => {
    setError("");
    if (
      !item.title.trim() ||
      item.versions.some(
        (v) =>
          !v.name.trim() ||
          !v.prompt.trim() ||
          !v.provider.trim() ||
          !v.model.trim(),
      )
    ) {
      setError("请填写标题，以及每个版本的名称、提示词、供应商和模型。");
      return;
    }
    setBusy(true);
    try {
      const submitted = JSON.stringify(item);
      const result = await onSave(item);
      setItem((current) =>
        JSON.stringify(current) === submitted
          ? result
          : {
              ...current,
              revision: result.revision,
              updatedAt: result.updatedAt,
            },
      );
      setTagInput((current) =>
        current === tagInput ? result.tags.join("，") : current,
      );
      setSaved(JSON.stringify(result));
      notify("案例已保存");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notify("已复制");
    } catch {
      notify("复制失败，请手动选择文字复制");
    }
  };
  const providers = [
    ...new Set(items.flatMap((c) => c.versions.map((v) => v.provider))),
  ];
  const models = [
    ...new Set(
      items.flatMap((c) =>
        c.versions.filter((x) => x.provider === v.provider).map((x) => x.model),
      ),
    ),
  ];
  return (
    <section className="editor">
      <header className="editor-heading">
        <button onClick={onClose}>
          <ArrowLeft size={16} />
          返回案例库
        </button>
        <div>
          <h1>{item.title || "新建案例"}</h1>
          <small>
            {dirty ? "有未保存的修改" : item.revision ? "已保存" : "尚未保存"}
          </small>
        </div>
        <button className="primary" disabled={busy} onClick={save}>
          <Save size={16} />
          {busy ? "保存中…" : "保存"}
        </button>
      </header>
      {error && (
        <div className="error banner" role="alert">
          {error}
        </div>
      )}
      <div className="editor-layout">
        <div className="details-panel">
          <label>
            标题 <em>*</em>
            <input
              maxLength={120}
              placeholder="给这个效果起个名字"
              value={item.title}
              onChange={(e) => update({ title: e.target.value })}
            />
          </label>
          <label>
            标签
            <input
              placeholder="用逗号分隔，例如：按钮，交互"
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value);
                update({
                  tags: [
                    ...new Set(
                      e.target.value
                        .split(/[,，]/)
                        .map((s) => s.trim())
                        .filter(Boolean),
                    ),
                  ].slice(0, 20),
                });
              }}
            />
          </label>
          <div className="version-heading">
            <label htmlFor="version-select">版本</label>
            <button
              onClick={() => {
                const next = {
                  ...v,
                  id: crypto.randomUUID(),
                  name: "尝试 " + (item.versions.length + 1),
                  createdAt: new Date().toISOString(),
                };
                update({ versions: [...item.versions, next] });
                setVersionId(next.id);
                setRunning(null);
                setCompare("");
              }}
              disabled={item.versions.length >= 100}
            >
              <Plus size={14} />
              新版本
            </button>
          </div>
          <select
            id="version-select"
            value={versionId}
            onChange={(e) => {
              setVersionId(e.target.value);
              setRunning(null);
              setCompare("");
            }}
          >
            {item.versions.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
                {x.id === item.bestVersionId ? " · 最佳" : ""}
              </option>
            ))}
          </select>
          <div className="version-actions">
            <button
              className={item.bestVersionId === v.id ? "mint" : ""}
              onClick={() => update({ bestVersionId: v.id })}
            >
              <Crown size={14} />
              {item.bestVersionId === v.id ? "当前最佳版本" : "设为最佳版本"}
            </button>
            {item.versions.length > 1 && (
              <button
                aria-label="删除当前版本"
                onClick={() => {
                  if (confirm("删除当前版本？此操作在保存后生效。")) {
                    const rest = item.versions.filter((x) => x.id !== v.id);
                    update({
                      versions: rest,
                      bestVersionId:
                        item.bestVersionId === v.id
                          ? rest[0].id
                          : item.bestVersionId,
                    });
                    setVersionId(rest[0].id);
                    setRunning(null);
                    setCompare("");
                  }
                }}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <label>
            版本名称 <em>*</em>
            <input
              maxLength={80}
              value={v.name}
              onChange={(e) => updateVersion({ name: e.target.value })}
            />
          </label>
          <label>
            <span className="label-row">
              提示词 <em>*</em>
              <button aria-label="复制提示词" onClick={() => copy(v.prompt)}>
                <Copy size={13} />
              </button>
            </span>
            <textarea
              className="prompt-input"
              placeholder="记录生成这个效果时使用的提示词…"
              value={v.prompt}
              onChange={(e) => updateVersion({ prompt: e.target.value })}
            />
          </label>
          <div className="field-pair">
            <label>
              供应商 <em>*</em>
              <input
                list="providers"
                placeholder="如 OpenAI"
                maxLength={80}
                value={v.provider}
                onChange={(e) => updateVersion({ provider: e.target.value })}
              />
              <datalist id="providers">
                {providers.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </datalist>
            </label>
            <label>
              模型 <em>*</em>
              <input
                list="models"
                placeholder="输入模型名称"
                maxLength={120}
                value={v.model}
                onChange={(e) => updateVersion({ model: e.target.value })}
              />
              <datalist id="models">
                {models.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </datalist>
            </label>
          </div>
          <label>
            参数备注
            <textarea
              placeholder="例如 temperature、推理强度等（可选）"
              value={v.parameters}
              onChange={(e) => updateVersion({ parameters: e.target.value })}
            />
          </label>
          <label>
            效果笔记
            <textarea
              placeholder="哪里做得好？还有什么可以改进？"
              value={v.notes}
              onChange={(e) => updateVersion({ notes: e.target.value })}
            />
          </label>
          <div className="cover-control">
            <span>案例封面</span>
            <Cover item={item} />
            <label className="upload-button">
              <ImagePlus size={15} />
              上传封面
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 2 * 1024 * 1024) {
                    setError("封面请小于 2 MB");
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () =>
                    update({ cover: reader.result as string });
                  reader.readAsDataURL(file);
                }}
              />
            </label>
            {item.cover && (
              <button onClick={() => update({ cover: "" })}>移除封面</button>
            )}
            <small>PNG / JPG / WebP / GIF · 最大 2 MB</small>
          </div>
          <div className="editor-exports">
            <button
              onClick={() =>
                download(
                  item.title + ".json",
                  JSON.stringify(
                    { format: "prompt-gallery", version: 1, cases: [item] },
                    null,
                    2,
                  ),
                )
              }
            >
              <Download size={14} />
              导出案例
            </button>
            <button
              onClick={() =>
                download(
                  (item.title || "effect") + ".html",
                  buildDocument(v, false),
                  "text/html",
                )
              }
            >
              <Download size={14} />
              导出代码
            </button>
          </div>
          {item.revision > 0 && (
            <button
              className="danger delete-case"
              onClick={async () => {
                if (confirm("确定删除整个案例及其所有版本？此操作无法撤销。")) {
                  try {
                    await onDelete(item);
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }
              }}
            >
              <Trash2 size={14} />
              删除案例
            </button>
          )}
        </div>
        <div className="workspace">
          <div className="code-panel">
            <div className="code-toolbar">
              <div className="code-tabs" role="tablist">
                {(["html", "css", "js"] as const).map((t) => (
                  <button
                    role="tab"
                    aria-selected={tab === t}
                    className={tab === t ? "active" : ""}
                    key={t}
                    onClick={() => setTab(t)}
                  >
                    {t === "js" ? "JavaScript" : t.toUpperCase()}
                  </button>
                ))}
              </div>
              <button aria-label="复制当前代码" onClick={() => copy(v[tab])}>
                <Copy size={15} />
              </button>
              <button
                className="primary"
                onClick={() => {
                  setRunning({
                    document: buildDocument(v),
                    compare: compare
                      ? buildDocument(
                          item.versions.find((x) => x.id === compare)!,
                        )
                      : "",
                  });
                }}
              >
                <Play size={14} />
                运行
              </button>
            </div>
            <CodeMirror
              aria-label={tab + "代码编辑器"}
              value={v[tab]}
              height="340px"
              theme="dark"
              extensions={[
                tab === "html" ? html() : tab === "css" ? css() : javascript(),
              ]}
              onChange={(value) => updateVersion({ [tab]: value })}
            />
            <div className="code-footnote">
              {tab === "html"
                ? "支持 HTML 片段或完整 HTML 文档"
                : "修改后点击运行，预览才会更新"}
              <span>{v[tab].split("\n").length} 行</span>
            </div>
          </div>
          <div className="preview-panel">
            <div className="preview-toolbar">
              <span>效果预览</span>
              <div>
                <button
                  className={!mobile ? "mint" : ""}
                  aria-label="桌面预览"
                  onClick={() => setMobile(false)}
                >
                  <Monitor size={16} />
                </button>
                <button
                  className={mobile ? "mint" : ""}
                  aria-label="手机预览"
                  onClick={() => setMobile(true)}
                >
                  <Smartphone size={16} />
                </button>
                <button
                  aria-label="停止预览"
                  disabled={!running}
                  onClick={() => setRunning(null)}
                >
                  <Square size={14} />
                </button>
              </div>
            </div>
            <div className="compare-toolbar">
              <Columns2 size={15} />
              <select
                aria-label="对比版本"
                value={compare}
                onChange={(e) => {
                  setCompare(e.target.value);
                  setRunning(null);
                }}
              >
                <option value="">单版本预览</option>
                {item.versions
                  .filter((x) => x.id !== v.id)
                  .map((x) => (
                    <option key={x.id} value={x.id}>
                      对比：{x.name}
                    </option>
                  ))}
              </select>
              <small>修改对比项后点击运行</small>
            </div>
            <div
              className={"preview-stage " + (running?.compare ? "split" : "")}
            >
              {running ? (
                <>
                  <div className={mobile ? "phone-frame" : "frame"}>
                    <iframe
                      title="当前版本效果预览"
                      sandbox="allow-scripts"
                      referrerPolicy="no-referrer"
                      srcDoc={running.document}
                    />
                  </div>
                  {running.compare && (
                    <div className={mobile ? "phone-frame" : "frame"}>
                      <iframe
                        title="对比版本效果预览"
                        sandbox="allow-scripts"
                        referrerPolicy="no-referrer"
                        srcDoc={running.compare}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="preview-idle">
                  <Play size={30} />
                  <h3>让你的想法动起来</h3>
                  <p>点击「运行」，查看当前代码的实际效果</p>
                </div>
              )}
            </div>
            <div className="preview-note">
              <span className="status-dot" />
              隔离运行 · 支持 HTTPS 外部资源
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
