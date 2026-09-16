import type { Version } from "./types";
export function buildDocument(
  v: Pick<Version, "html" | "css" | "js">,
  restricted = true,
) {
  const policy = `default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' https:; style-src 'unsafe-inline' https:; img-src https: data: blob:; font-src https: data:; media-src https: data: blob:; connect-src https:; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'`;
  const head = `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${restricted ? `<meta http-equiv="Content-Security-Policy" content="${policy}">` : ""}<style>body{margin:0} ${v.css.replace(/<\/style/gi, "<\\/style")}</style>`;
  const script = `<script>${v.js.replace(/<\/script/gi, "<\\/script")}<\/script>`;
  if (/<html[\s>]|<!doctype/i.test(v.html)) {
    let doc = v.html;
    if (/<head[\s>]/i.test(doc))
      doc = doc.replace(
        /<head([^>]*)>/i,
        (_, attrs) => `<head${attrs}>${head}`,
      );
    else if (/<html[\s>]/i.test(doc))
      doc = doc.replace(
        /<html([^>]*)>/i,
        (_, attrs) => `<html${attrs}><head>${head}</head>`,
      );
    else
      doc = doc.replace(
        /<!doctype[^>]*>/i,
        () => `<!doctype html><head>${head}</head>`,
      );
    return /<\/body>/i.test(doc)
      ? doc.replace(/<\/body>/i, () => script + "</body>")
      : doc + script;
  }
  return `<!doctype html><html><head>${head}</head><body>${v.html}${script}</body></html>`;
}
