import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Code2, Copy, Monitor, Pencil, Play, Plus, Smartphone, Square } from "lucide-react";
import type { Case, Version } from "./types";
import { newCase } from "./samples";
import { buildDocument } from "./preview";
import { copyText, randomId } from "./browser";
import Cover from "./Cover";
import pelicanHtml from "../examples/pelican-bicycle.html?raw";
import pelicanIndexHtml from "../examples/pelican-bicycle-workspace.html?raw";
import pelicanMimoHtml from "../examples/pelican-bicycle-mimo.html?raw";
import "./test-zone.css";

const prompt = "创建一个html，内容是svg绘制一个鹈鹕骑自行车的2D动画，你不需要测试，不要用任何 skill";
const generatedAt = "2026-09-22T16:00:00.000Z";

function pelicanCase(): Case {
  const item = newCase();
  item.title = "鹈鹕测试";
  item.tags = ["测试专区", "SVG", "2D 动画", "自行车"];
  const first: Version = {
    ...item.versions[0],
    name: "首次生成",
    prompt,
    provider: "OpenAI Codex",
    model: "GPT-6",
    notes: "当前会话未提供更细的模型版本标识。代码是本次对话生成的原始作品。",
    html: pelicanHtml,
    css: "",
    js: "",
    createdAt: generatedAt,
  };
  item.versions = [first, {
    ...first,
    id: randomId(),
    name: "工作区实现",
    notes: "来自工作区保存的另一份完整 SVG 动画实现。",
    html: pelicanIndexHtml,
    createdAt: "2026-09-23T02:13:56.000Z",
  }, {
    ...first,
    id: randomId(),
    name: "MiMo V2.6 Pro 实现",
    provider: "MiMo",
    model: "MiMo V2.6 Pro",
    notes: "来自工作区的 HTML、CSS 和 JavaScript 实现；已合并为独立 HTML，便于预览和导出。",
    html: pelicanMimoHtml,
    createdAt: "2026-09-23T02:50:26.000Z",
  }];
  return item;
}

const builtIn = pelicanCase();
type Entry = { item: Case; version: Version; builtIn: boolean };
type PromptRecord = { key: string; prompt: string; title: string; entries: Entry[] };

function promptKey(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function groupByPrompt(saved: Case[]): PromptRecord[] {
  const output = new Map<string, PromptRecord>();
  const savedOutputs = new Set(saved.flatMap((item) => item.versions.map((version) =>
    [promptKey(version.prompt), version.html, version.css, version.js].join("\u0000"))));
  for (const item of [builtIn, ...saved]) {
    for (const version of item.versions) {
      const key = promptKey(version.prompt);
      if (!key) continue;
      if (item === builtIn && savedOutputs.has([key, version.html, version.css, version.js].join("\u0000"))) continue;
      if (!output.has(key)) output.set(key, { key, prompt: version.prompt.trim(), title: key === promptKey(prompt) ? "鹈鹕测试" : item.title, entries: [] });
      output.get(key)!.entries.push({ item, version, builtIn: item === builtIn });
    }
  }
  return [...output.values()];
}

export default function TestZone({ items, initialRecordId, initialVersionId, onCreate, onOpen, onAddVersion, notify }: {
  items: Case[];
  initialRecordId: string;
  initialVersionId: string;
  onCreate: (item: Case) => void;
  onOpen: (item: Case, versionId: string) => void;
  onAddVersion: (item: Case, baseVersionId: string) => void;
  notify: (message: string) => void;
}) {
  const records = items.filter((item) => item.tags.includes("测试专区"));
  const groups = groupByPrompt(records);
  const [recordId, setRecordId] = useState(initialRecordId || builtIn.id);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [versionId, setVersionId] = useState(initialVersionId);
  const [mobile, setMobile] = useState(false);
  const [run, setRun] = useState(1);
  const group = groups.find((record) => record.key === recordId || record.entries.some((entry) => entry.item.id === recordId)) ?? groups[0];
  const selected = group.entries.find((entry) => entry.version.id === versionId)
    ?? group.entries.find((entry) => entry.version.id === entry.item.bestVersionId)
    ?? group.entries[0];
  const { item, version } = selected;
  const isBuiltIn = selected.builtIn;
  const document = buildDocument(version);
  const copyPrompt = async () => {
    try { await copyText(version.prompt); notify("提示词已复制"); }
    catch { notify("复制失败，请手动选择提示词复制"); }
  };
  const chooseRecord = (id: string) => {
    setRecordId(id);
    setActiveKey(id);
    setVersionId("");
    setRun((value) => value + 1);
  };
  const chooseVersion = (id: string) => {
    setVersionId(id);
    setRun((value) => value + 1);
  };
  const newRecord = () => {
    const next = newCase();
    next.tags = ["测试专区"];
    onCreate(next);
  };
  const editVersion = (entry: Entry) => {
    if (!entry.builtIn) return onOpen(entry.item, entry.version.id);
    const copy = pelicanCase();
    const index = builtIn.versions.findIndex((version) => version.id === entry.version.id);
    onOpen(copy, copy.versions[index].id);
  };
  const addVersion = (entry: Entry) => {
    if (!entry.builtIn) return onAddVersion(entry.item, entry.version.id);
    const copy = pelicanCase();
    const index = builtIn.versions.findIndex((version) => version.id === entry.version.id);
    onAddVersion(copy, copy.versions[index].id);
  };
  return <section className="test-zone" aria-label="测试专区">
    <header className="page-heading">
      <div><h1>测试专区</h1><p>相同提示词的实现归在一条记录中，可逐版本查看效果与模型。</p></div>
      <button className="primary" onClick={newRecord}><Plus size={16} />新建测试记录</button>
    </header>
    {activeKey === null ? <>
      <div className="test-list-count">{groups.length} 条提示词记录</div>
      <div className="card-grid test-card-grid">{groups.map((record) => <article className="case-card" key={record.key}>
        <button className="card-open" onClick={() => chooseRecord(record.key)} aria-label={`打开测试记录 ${record.title}`}>
          {record.key === promptKey(prompt) ? <div className="cover"><img src="/test-zone/pelican.png" alt="鹈鹕骑自行车动画封面" /></div> : <Cover item={record.entries[0].item} />}
          <div className="card-content"><h2>{record.title}<ArrowUpRight size={16} /></h2><p className="test-card-prompt">{record.prompt}</p><div className="chips"><span>测试记录</span><span>{record.entries.length} 个版本</span></div><footer><span>点击查看版本与源码</span><span>{new Date(record.entries.at(-1)!.version.createdAt).toLocaleDateString("zh-CN")}</span></footer></div>
        </button>
      </article>)}</div>
    </> : <>
    <button className="test-back" onClick={() => setActiveKey(null)}><ArrowLeft size={16} />返回测试记录</button>
    <article className="test-entry">
      <div className="test-entry-heading">
        <div><span className="test-entry-index">按提示词归档 · {new Date(version.createdAt).toLocaleDateString("zh-CN")}</span><h2>{group.title}</h2><p>{group.entries.length} 个实现版本 · {isBuiltIn ? "可基于此记录开始新尝试" : "可在编辑器中继续记录版本"}</p></div>
        <div className="test-entry-actions">
          <button onClick={() => editVersion(selected)}><Pencil size={15} />编辑当前版本</button>
          <button className="primary" disabled={item.versions.length >= 100} onClick={() => addVersion(selected)}><Plus size={16} />记录新版本</button>
        </div>
      </div>
      <div className="test-version-picker" aria-label="版本列表">
        <strong>版本</strong>
        <div>{group.entries.map((entry, index) => <div className="test-version-item" key={entry.version.id}><button aria-pressed={entry.version.id === version.id} onClick={() => chooseVersion(entry.version.id)} title={entry.item.title}>{index + 1}. {entry.version.name}{entry.version.id === entry.item.bestVersionId ? " · 案例最佳" : ""}</button><button aria-label={`编辑版本 ${entry.version.name}`} title={`编辑版本 ${entry.version.name}`} onClick={() => editVersion(entry)}><Pencil size={13} /></button></div>)}</div>
      </div>
      <div className="test-preview-toolbar">
        <strong>实时预览 · {version.name}</strong>
        <div>
          <button aria-label="桌面预览" aria-pressed={!mobile} onClick={() => setMobile(false)}><Monitor size={16} /></button>
          <button aria-label="手机预览" aria-pressed={mobile} onClick={() => setMobile(true)}><Smartphone size={16} /></button>
          <button onClick={() => setRun((value) => value + 1)}><Play size={14} />重新运行</button>
          <button disabled={!run} onClick={() => setRun(0)}><Square size={13} />停止</button>
        </div>
      </div>
      <div className={"test-preview-stage" + (mobile ? " is-phone" : "")}>
        {run ? <iframe key={`${item.id}-${version.id}-${run}`} title={`${item.title} ${version.name} 预览`} sandbox="allow-scripts" referrerPolicy="no-referrer" srcDoc={document} /> : <div className="test-preview-stopped"><p>预览已停止</p><button onClick={() => setRun(1)}><Play size={16} />运行</button></div>}
      </div>
      <div className="test-record">
        <div className="test-record-main"><div className="test-prompt-heading"><h3>此版本的提示词</h3><button onClick={() => void copyPrompt()} aria-label="复制此版本的提示词"><Copy size={14} />复制</button></div><p className="test-prompt">{version.prompt}</p></div>
        <dl className="test-metadata">
          <div><dt>版本名称</dt><dd>{version.name}</dd></div>
          <div><dt>供应商</dt><dd>{version.provider}</dd></div>
          <div><dt>模型版本</dt><dd>{version.model}</dd></div>
          <div><dt>记录日期</dt><dd>{new Date(version.createdAt).toLocaleDateString("zh-CN")}</dd></div>
        </dl>
      </div>
      {version.notes && <p className="test-notes">{version.notes}</p>}
      <details className="test-source" key={`${item.id}-${version.id}`}><summary><Code2 size={16} />查看此版本的 HTML / CSS / JavaScript 源码</summary><pre><code>{version.html}{version.css && `\n\n/* CSS */\n${version.css}`}{version.js && `\n\n// JavaScript\n${version.js}`}</code></pre></details>
    </article></>}
  </section>;
}
