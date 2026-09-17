# Finesse 设计资源

这是产品内容包，不是开发助手 skill 安装目录。不要将上游 SKILL.md 或 AGENTS.md 覆盖到本项目根目录。

- `upstream/`：固定提交的原始字节，包含六个 HTML、示例索引、主 skill、八份相关参考资料和 MIT 许可。并非上游完整 skill 分发。
- `source.json`：来源 URL、提交、获取日期、许可和文件 SHA-256。原始内容不直接作为同源 HTML 发布。
- `catalog.ts`：本项目整理的中文说明、分类、相关指南和模板默认字段。
- `content.ts`：按需加载原文，适配运行副本，组合提示词并创建独立案例；完整示例不打入首页包。
- `preview.ts`：沿用应用 CSP 和 `allow-scripts` sandbox，通过限定消息来源与运行标识接收加载失败状态。
- `../../public/design-resources/`（仓库根目录下的 public）：实际渲染六个示例的静态截图，1280 × 800。仅用于资源封面，不伪装成用户生成结果。

## 运行适配

| 原始引用 | 运行副本引用 |
| --- | --- |
| `lib/gsap.min.js` | `https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js` |
| `./lib/anime.esm.min.js` | `https://cdn.jsdelivr.net/npm/animejs@4.2.2/dist/bundles/anime.esm.min.js` |
| `text.split(...)`（CALIBRE） | `text.splitText(...)`（4.2.2 中的兼容名称，避免弃用警告） |

上游示例说明与实际源码的依赖存在差异，不能以说明中的“零依赖”作为验证依据。CALIBRE 的相对 Anime.js 模块在该上游快照中缺失；这里选用兼容其导出 API 的 4.2.2，未声称还原了原作者使用的确切版本。运行副本附带 MIT 许可，个人案例笔记也保留来源、提交及许可。GSAP 使用 [GSAP Standard License](https://gsap.com/standard-license/)，字体与其他库遵循各自许可。

## 更新

1. 先选定上游完整提交 SHA；所有文件从同一提交下载，不混用 main 分支的浮动内容。
2. 保留上游文件的原始字节。替换快照后更新 source.json 的 revision、retrievedAt、licenseText 和每个文件的 SHA-256。
3. 对照实际 HTML 修订中文标题、依赖、交互说明与关联指南。提示词始终标注为本项目整理，不补造模型履历。
4. 必要适配只改 content.ts，记录路径或 API 转换。每个示例都在应用的隔离预览中验证实际脚本和主要交互，包含减少动态、手机宽度与依赖失败状态。
5. 用浏览器实际渲染更新六张封面；等待字体与首屏效果完成，不用空白截图或占位图代替效果。
6. 运行 `npm test`、`npm run build` 和 `npx playwright test`；确认创建的案例可保存、再次打开、备份及导出。

中文精选指南是摘要，原文保留其上下文、限制和作者措辞。预览业务控件并不保证接入真实服务，素材也可能是上游占位符；详情中须明确这一点。
