import web from "./web.json";
import h5 from "./h5.json";
import motion from "./motion.json";
import mp from "./mp.json";
import base from "./base.json";
import source from "./source.json";

export const categories = [
  { id: "web", title: "通用 Web", data: web },
  { id: "h5", title: "移动端 H5", data: h5 },
  { id: "motion", title: "动效与质感", data: motion },
  { id: "mp", title: "小程序", data: mp },
  { id: "base", title: "前端基础", data: base },
];
export const terms = categories.flatMap(({ id, title, data }) =>
  data.terms.map((term) => ({ ...term, category: id, categoryTitle: title })),
);
export type Term = (typeof terms)[number];
export const termsById = new Map(terms.map((term) => [term.id, term]));
export const sourceUrl = `${source.repository}/tree/${source.commit}/skills/finesse-term/data`;
const searchable = terms.map((term) => ({
  term,
  text: [term.id, term.title, term.en, ...term.aliases, ...term.trigger,
    term.plain, term.say, term.trap].join(" ").toLocaleLowerCase(),
}));
export function searchTerms(query: string, category: string) {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return searchable.filter(({ term, text }) =>
    (!category || term.category === category) && words.every((word) => text.includes(word)),
  ).map(({ term }) => term);
}
