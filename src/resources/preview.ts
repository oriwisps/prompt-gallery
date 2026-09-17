import { buildDocument } from "../preview";

export function resourceDocument(html: string, token: string) {
  // The opaque sandbox reports only health. The parent checks both source and token.
  const monitor = `<script>(()=>{
    const send=(detail)=>parent.postMessage({type:'finesse-preview-error',token:${JSON.stringify(token)},detail},'*');
    addEventListener('error',(event)=>{
      const target=event.target;
      if(target&&target!==window&&(target.src||target.href)) send('部分外部资源未能加载，效果可能不完整。请检查网络后重试。');
      else send('示例脚本运行异常，效果可能不完整。请重新运行或查看上游源码。');
    },true);
    addEventListener('unhandledrejection',()=>send('示例运行遇到异常，效果可能不完整。'));
    addEventListener('securitypolicyviolation',()=>send('预览隔离策略拦截了部分资源，效果可能不完整。'));
    document.fonts?.addEventListener('loadingerror',()=>send('外部字体未能加载，文字效果可能与封面不同。'));
    addEventListener('load',()=>{
      if(${/fonts\.googleapis\.com/.test(html)} && document.fonts && document.fonts.size===0)
        send('外部字体样式未能加载，文字效果可能与封面不同。');
    });
  })();<\/script>`;
  return buildDocument({ html, css: "", js: "" }).replace(/(<head[^>]*>)/i, (head) => head + monitor);
}
