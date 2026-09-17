import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Copy, ExternalLink, LayoutGrid, Monitor, Play, Plus, Search, Smartphone, Square } from "lucide-react";
import type { Case } from "./types";
import { categories, guides, resources, searchResources } from "./resources/catalog";
import type { DesignResource } from "./resources/catalog";
import { composePrompt, createResourceCase, loadExample, loadReference, originalUrl, source, sourceUrl } from "./resources/content";
import type { PromptFields } from "./resources/content";
import { resourceDocument } from "./resources/preview";
import { randomId, copyText } from "./browser";
import "./resources.css";

const Terms = lazy(() => import("./Terms"));
type Draft = { fields: PromptFields; prompt: string | null };
type Props = { notify: (message: string) => void; onCreate: (item: Case) => void; onDirty: (dirty: boolean) => void };

function RawDocument({ file }: { file: string }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    let active = true;
    loadReference(file).then((value) => { if (active) setText(value); }).catch(() => { if (active) setError("原文加载失败，请关闭后重试或打开上游来源。"); });
    return () => { active = false; };
  }, [file, open]);
  return <details className="resource-original" onToggle={(e) => { setOpen(e.currentTarget.open); setError(""); }}>
    <summary>查看原文快照 · {file}</summary>
    {open && <pre>{error || text || "正在加载原文…"}</pre>}
  </details>;
}

function ResourcePreview({ resource, html }: { resource: DesignResource; html: string }) {
  const iframe = useRef<HTMLIFrameElement>(null);
  const [mobile, setMobile] = useState(resource.category === "h5");
  const [run, setRun] = useState<string>(() => randomId());
  const [warning, setWarning] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [document, setDocument] = useState(() => resourceDocument(html, run));
  useEffect(() => {
    if (!run) return;
    const receive = (event: MessageEvent) => {
      if (event.source !== iframe.current?.contentWindow || event.data?.type !== "finesse-preview-error" || event.data?.token !== run) return;
      if (typeof event.data.detail === "string") setWarning(event.data.detail.slice(0, 160));
    };
    window.addEventListener("message", receive);
    const timer = setTimeout(() => {
      if (!loaded) setWarning("外部资源加载较慢。可以先查看页面，或检查网络后重新运行。");
    }, 15000);
    return () => { window.removeEventListener("message", receive); clearTimeout(timer); };
  }, [run, loaded]);
  const restart = () => {
    const token = randomId();
    setWarning(""); setLoaded(false); setRun(token); setDocument(resourceDocument(html, token));
  };
  return <section className="resource-preview" aria-label="示例预览">
    <div className="resource-preview-toolbar">
      <strong>交互预览</strong>
      <div>
        <button aria-label="桌面预览" aria-pressed={!mobile} onClick={() => setMobile(false)}><Monitor size={15} /></button>
        <button aria-label="手机预览" aria-pressed={mobile} onClick={() => setMobile(true)}><Smartphone size={15} /></button>
        <button onClick={restart}><Play size={14} />重新运行</button>
        <button disabled={!run} onClick={() => setRun("")}><Square size={13} />停止</button>
      </div>
    </div>
    <div className={"resource-preview-stage" + (mobile ? " is-phone" : "")}>
      {run ? <iframe ref={iframe} key={run} title={`${resource.title} 交互预览`} sandbox="allow-scripts" referrerPolicy="no-referrer" srcDoc={document} onLoad={() => setLoaded(true)} /> : <div className="resource-preview-stopped"><p>预览已停止</p><button onClick={restart}><Play size={16} />运行示例</button></div>}
    </div>
    {run && warning && <p className="resource-warning" role="alert">{warning}</p>}
    <p className="resource-preview-caption">{!run ? "已停止执行示例代码。" : loaded ? "已载入示例。" : "正在加载示例与外部资源…"} {resource.interactions}</p>
  </section>;
}

function ResourceDetail({ resource, draft, onDraft, onBack, onGuide, onCreate, notify }: {
  resource: DesignResource; draft: Draft; onDraft: (draft: Draft) => void; onBack: () => void; onGuide: (id: string) => void;
  onCreate: (item: Case) => void; notify: Props["notify"];
}) {
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const prompt = draft.prompt ?? composePrompt(resource, draft.fields);
  useEffect(() => {
    let active = true;
    loadExample(resource).then((text) => { if (active) { setHtml(text); setError(""); } }).catch(() => { if (active) setError("示例源码加载失败，请重试。"); });
    return () => { active = false; };
  }, [resource, attempt]);
  const updateField = (key: keyof PromptFields, value: string) => {
    onDraft({ fields: { ...draft.fields, [key]: value }, prompt: null });
  };
  const copy = async () => {
    try { await copyText(prompt); notify("提示词已复制"); }
    catch { notify("复制失败，请在完整提示词中手动选择文字复制"); }
  };
  return <article className="resource-detail">
    <button className="resource-back" onClick={onBack}><ArrowLeft size={15} />返回精选示例</button>
    <header className="resource-detail-heading"><div><h2>{resource.title}<span>{resource.subtitle}</span></h2><p>{resource.description}</p></div><span className="resource-category">{categories[resource.category]}</span></header>
    {error ? <div className="error" role="alert">{error} <button onClick={() => { setError(""); setAttempt((value) => value + 1); }}>重试加载</button></div> : html ? <ResourcePreview resource={resource} html={html} /> : <div className="resource-loading" role="status">正在加载示例源码…</div>}
    <div className="resource-detail-columns">
      <div className="resource-notes">
        <section><h3>值得借鉴的设计</h3><ul>{resource.highlights.map((text) => <li key={text}>{text}</li>)}</ul></section>
        <section><h3>相关设计指南</h3><div className="resource-guide-links">{resource.guides.map((id) => <button key={id} onClick={() => onGuide(id)}><BookOpen size={15} />{guides.find((guide) => guide.id === id)?.title}<ArrowRight size={14} /></button>)}</div></section>
        <section><h3>来源与运行说明</h3><p>示例来自 Finesse，提示词由本项目根据示例与指南整理，并非原始生成记录。</p><ul>{resource.dependencies.map((text) => <li key={text}>{text}</li>)}</ul><p>联网资源不可用时，部分字体或动效可能缺失。示例代码仅用于前端演示。</p><a href={originalUrl(`examples/${resource.file}`)} target="_blank" rel="noreferrer">查看上游源码 <ExternalLink size={13} /></a><small>快照 {source.revision.slice(0, 12)} · 上游 MIT；第三方依赖使用各自许可</small></section>
      </div>
      <section className="resource-template" aria-label="提示词模板">
        <h3>改成你的需求</h3><p>修改下面的字段，组合自己的提示词。</p>
        <label>页面用途<input maxLength={300} value={draft.fields.purpose} onChange={(e) => updateField("purpose", e.target.value)} /></label>
        <label>主要内容<textarea rows={3} maxLength={3000} value={draft.fields.content} onChange={(e) => updateField("content", e.target.value)} /></label>
        <label>配色方向<input maxLength={300} value={draft.fields.palette} onChange={(e) => updateField("palette", e.target.value)} /></label>
        <label>完整提示词<textarea className="resource-prompt" rows={12} maxLength={50000} value={prompt} onChange={(e) => onDraft({ ...draft, prompt: e.target.value })} /></label>
        <p className="resource-template-note">可直接编辑完整提示词；再次修改上方字段会重新组合全文。修改提示词不会自动改写示例代码，也不保证复现相同效果。</p>
        <div className="resource-template-actions"><button className="primary" disabled={!html || !prompt.trim()} onClick={() => onCreate(createResourceCase(resource, html, prompt))}><Plus size={15} />创建我的案例</button><button disabled={!prompt.trim()} onClick={() => void copy()}><Copy size={15} />复制提示词</button></div>
        <small>创建后进入编辑器，点击“保存”加入个人案例库。模板编辑在本次资源浏览中临时保留。</small>
      </section>
    </div>
  </article>;
}

export default function Resources({ notify, onCreate, onDirty }: Props) {
  const [tab, setTab] = useState("examples");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [guideId, setGuideId] = useState(guides[0].id);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const edited = Object.keys(drafts).length > 0;
  useEffect(() => {
    onDirty(edited);
    const unload = (event: BeforeUnloadEvent) => { if (edited) event.preventDefault(); };
    window.addEventListener("beforeunload", unload);
    return () => window.removeEventListener("beforeunload", unload);
  }, [edited, onDirty]);
  const selected = resources.find((resource) => resource.id === selectedId);
  const guide = guides.find((item) => item.id === guideId)!;
  const results = searchResources(query, category);
  const changeTab = (next: string) => { setTab(next); window.scrollTo(0, 0); };
  return <section className="resources" aria-label="设计资源">
    <header className="page-heading"><div><h1>设计资源</h1><p>先看效果，再把设计方法带进你的下一个案例。</p></div><a className="resource-source-link" href={sourceUrl} target="_blank" rel="noreferrer">Finesse <ExternalLink size={14} /></a></header>
    <div className="resource-tabs" aria-label="资源类型">
      <button aria-pressed={tab === "examples"} onClick={() => changeTab("examples")}><LayoutGrid size={16} />精选示例 <span>{resources.length}</span></button>
      <button aria-pressed={tab === "guides"} onClick={() => changeTab("guides")}><BookOpen size={16} />设计指南</button>
      <button aria-pressed={tab === "terms"} onClick={() => changeTab("terms")}>术语查阅</button>
    </div>
    {tab === "terms" ? <Suspense fallback={<p>正在加载术语库…</p>}><Terms notify={notify} /></Suspense> : tab === "guides" ? <div className="resource-guides">
      <div className="resource-guide-list" aria-label="设计指南列表">{guides.map((item) => <button key={item.id} aria-pressed={guide.id === item.id} onClick={() => setGuideId(item.id)}>{item.title}</button>)}</div>
      <article className="resource-guide-article" key={guide.id}><h2>{guide.title}</h2><p>{guide.summary}</p><small>本项目整理 · 按需参考</small><ul>{guide.points.map((point) => <li key={point}>{point}</li>)}</ul><a href={originalUrl(`references/${guide.file}`)} target="_blank" rel="noreferrer">打开上游原文 <ExternalLink size={13} /></a><RawDocument file={guide.file} /><h3>相关示例</h3><div className="resource-guide-links">{resources.filter((resource) => resource.guides.includes(guide.id)).map((resource) => <button key={resource.id} onClick={() => { setSelectedId(resource.id); changeTab("examples"); }}>{resource.title} · {resource.subtitle}<ArrowRight size={14} /></button>)}</div></article>
    </div> : selected ? <ResourceDetail key={selected.id} resource={selected} draft={drafts[selected.id] ?? { fields: selected.defaults, prompt: null }} onDraft={(draft) => setDrafts((values) => ({ ...values, [selected.id]: draft }))} onBack={() => { setSelectedId(""); window.scrollTo(0, 0); }} onGuide={(id) => { setGuideId(id); changeTab("guides"); }} notify={notify} onCreate={onCreate} /> : <>
      <div className="resource-filters"><label className="resource-search"><Search size={17} /><input aria-label="搜索设计资源" placeholder="搜索风格、场景或交互，例如：滑块" value={query} onChange={(e) => setQuery(e.target.value)} /></label><div className="resource-categories" aria-label="示例分类"><button aria-pressed={!category} onClick={() => setCategory("")}>全部</button>{Object.entries(categories).map(([id, label]) => <button key={id} aria-pressed={category === id} onClick={() => setCategory(id)}>{label}</button>)}</div></div>
      <div className="resource-list-meta"><span role="status">{results.length} 个精选示例</span><span>只读资源 · 选用后创建个人副本</span></div>
      {results.length ? <div className="resource-grid">{results.map((resource) => <button className="resource-card" key={resource.id} onClick={() => { setSelectedId(resource.id); window.scrollTo(0, 0); }} aria-label={`查看 ${resource.title} ${resource.subtitle}`}>
        <div className={"resource-cover resource-cover-" + resource.category}><img src={`/design-resources/${resource.id}.png`} alt={`${resource.title} 页面效果截图`} loading="lazy" /><span>{categories[resource.category]}</span></div>
        <div className="resource-card-body"><div className="resource-card-title"><h2>{resource.title}</h2><ArrowRight size={17} /></div><strong>{resource.subtitle}</strong><p>{resource.description}</p><div className="resource-card-footer"><span>{resource.tags.join(" · ")}</span><div className="resource-swatches" aria-hidden="true">{resource.palette.map((color) => <i key={color} style={{ background: color }} />)}</div></div></div>
      </button>)}</div> : <div className="resource-empty"><Search size={26} /><h2>没有找到匹配的示例</h2><p>换个关键词，或清除分类筛选。</p><button onClick={() => { setQuery(""); setCategory(""); }}>重置筛选</button></div>}
    </>}
    <details className="resource-provenance"><summary>内容来源与许可 · 快照 {source.revision.slice(0, 12)}</summary><p>上游 mouse-lin/finesse-skill · 获取日期 {source.retrievedAt}。保留原始示例、主 skill 与相关指南快照；中文说明和提示词由本项目另行整理。内置资源不进入个人案例备份，创建后的个人副本随案例保存和导出。</p><p>示例用于学习设计方法；部分控件仅展示。GSAP 与 Google Fonts 等第三方依赖遵循各自许可。</p><RawDocument file="LICENSE" /><RawDocument file="SKILL.md" /></details>
  </section>;
}
