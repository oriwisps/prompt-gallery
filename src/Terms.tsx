import { useState } from "react";
import { BookOpen, Copy, Plus, Search } from "lucide-react";
import { categories, searchTerms, sourceUrl, terms, termsById } from "./terms/index";
import "./terms.css";
import { copyText } from "./browser";

export default function Terms({ notify, onInsert }: {
  notify: (message: string) => void;
  onInsert?: (text: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const results = searchTerms(query, category);
  const selected = results.find((term) => term.id === selectedId) ?? results[0];
  const copy = async (text: string) => {
    try {
      await copyText(text);
      notify("已复制");
    } catch {
      notify("复制失败，请手动选择文字复制");
    }
  };
  const field = (title: string, text: string, className = "") => (
    <section className={"term-field " + className}>
      <div className="term-field-heading">
        <h3>{title}</h3>
        <button aria-label={`复制${title}`} onClick={() => void copy(text)}><Copy size={14} /></button>
      </div>
      <p>{text}</p>
    </section>
  );
  return (
    <section className={"terms-browser" + (onInsert ? " terms-compact" : "")} aria-label="术语查阅">
      {!onInsert && <header className="terms-heading">
        <div><small>FRONTEND LEXICON</small><h1><BookOpen size={26} />术语库</h1></div>
        <p>把口语描述，变成准确的前端需求。</p>
      </header>}
      <div className="terms-search">
        <Search size={17} />
        <input aria-label="搜索术语" placeholder="搜索术语、英文名，或试试「按钮被挡住」" value={query} onChange={(e) => setQuery(e.target.value)} />
        {query && <button onClick={() => setQuery("")} aria-label="清空术语搜索">清空</button>}
      </div>
      <div className="term-categories" aria-label="术语分类">
        <button aria-pressed={!category} onClick={() => setCategory("")}>全部 {terms.length}</button>
        {categories.map((item) => <button key={item.id} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.title} {item.data.terms.length}</button>)}
      </div>
      <div className="terms-meta"><span role="status">找到 {results.length} 条术语</span><a href={sourceUrl} target="_blank" rel="noreferrer">来源 finesse-term · MIT</a></div>
      {selected ? <div className="terms-layout">
        <div className="term-results" aria-label="术语结果">
          {results.map((term) => <button key={term.id} aria-pressed={selected.id === term.id} onClick={() => setSelectedId(term.id)}>
            <strong>{term.title}</strong><span>{term.en}</span><small>{term.categoryTitle}</small>
          </button>)}
        </div>
        <article className="term-detail" aria-label="术语详情" key={selected.id}>
          <small>{selected.categoryTitle}</small>
          <h2>{selected.title}</h2><p className="term-english">{selected.en}</p>
          {field("通俗说明", selected.plain)}
          {field("标准需求表达", selected.say, "term-say")}
          {onInsert && <button className="primary term-insert" onClick={() => onInsert(selected.say)}><Plus size={15} />插入提示词</button>}
          {field("常见误区", selected.trap, "term-trap")}
          <details className="term-extra">
            <summary>别名与口语描述</summary>
            {field("别名", selected.aliases.join("、"))}
            {field("常见口语描述", selected.trigger.join("\n"))}
            {field("词条标识", selected.id)}
            {field("技术分类", selected.layer)}
          </details>
          <section className="term-related"><h3>关联术语</h3><div>
            {selected.pairs.map((id) => <button key={id} onClick={() => { setQuery(""); setCategory(""); setSelectedId(id); }}>{termsById.get(id)?.title ?? id}</button>)}
          </div></section>
        </article>
      </div> : <div className="terms-empty"><BookOpen size={28} /><h2>没有找到匹配的术语</h2><p>试试更短的关键词，或切换到全部分类。</p><button onClick={() => { setQuery(""); setCategory(""); }}>重置筛选</button></div>}
    </section>
  );
}
