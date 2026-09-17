# Prompt Gallery · 提示词效果库

个人私有的前端效果案例库：记录提示词、供应商、模型、版本和 HTML/CSS/JavaScript，并在隔离预览中运行。

## 本地启动

需要 Node.js 22.13 或更高版本（推荐 Node 22 LTS）。

Windows 用户可直接双击项目根目录的 `start.bat`：脚本自动检查 Node.js 版本、安装或更新依赖，并启动前后端。首次运行需要联网下载依赖；看到 Vite 就绪后打开 http://localhost:5173 。运行期间保持窗口开启，按 `Ctrl+C` 停止服务。启动失败时窗口会保留错误信息。

也可以手动启动：

```powershell
npm install
npm run dev
```

打开 http://localhost:5173 ，首次使用创建管理员账号（密码至少 12 个字符）。没有预置账号或密码。管理员初始化接口只接受本机连接，部署前应先在本机完成初始化。

## 功能

- 案例画廊、标题/提示词/标签搜索、标签和模型筛选、收藏、排序。
- HTML / CSS / JavaScript 编辑器；完整 HTML 也可直接粘贴至 HTML 区。
- 显式保存，未保存离开提醒，版本复制、最佳版本、双版本预览。
- 模型手动录入，已有模型自动提供输入建议，历史版本保存独立快照。
- 进入案例或切换版本时自动运行顶部大尺寸预览；支持放大查看、桌面/手机宽度切换与停止预览，修改代码后点击运行更新。
- 上传图片封面（PNG/JPEG/WebP/GIF，最大 2 MB）；首页不执行案例代码。
- 案例 JSON、可独立运行 HTML 导出；全库 JSON 备份和合并恢复。同 ID 案例在确认后覆盖。
- 首次空库可选导入六个手工演示案例，未冒充真实模型输出。
- SQLite 持久化、密码 scrypt 哈希、HttpOnly 会话、登录限流、请求来源校验、多设备编辑冲突检测。

## 术语库

侧栏「术语库」内置 128 条前端术语，按通用 Web、移动端 H5、动效与质感、小程序、前端基础分类。可用中英文名称、别名、口语描述和说明进行本地关键词搜索，查看及复制完整解释、标准需求表达、常见误区与关联术语。

案例编辑器的「查阅术语」打开侧边面板；「插入提示词」将标准需求表达插入当前版本的光标处（选中文字时替换选区，未定位时追加），之后按原流程保存案例。内置词条只读，不进入案例备份；插入后的文字随案例正常保存、导出。

数据来自 [mouse-lin/finesse-term](https://github.com/mouse-lin/finesse-term)，保留原始说明，快照版本见 `src/terms/source.json`，原始 MIT 许可见 `src/terms/LICENSE`。更新时应同时替换五份 JSON 并核对词条数量与关联关系。

## 设计资源

侧栏「设计资源」提供 Finesse 精选示例、设计指南与术语查阅。首批六个示例覆盖品牌展示（CALIBRE、MORPH）、工具界面（ACRU、Subhub）、移动端（PEACH DESK、烘豆日记）。列表使用实际页面的静态截图，不执行示例代码；打开详情后在原有隔离 iframe 中运行，支持桌面/手机宽度、停止与重新运行。

在详情中修改用途、内容、配色，可组合并编辑完整提示词，然后「复制提示词」或「创建我的案例」。创建会带入示例 HTML、当前提示词、来源和许可，进入编辑器后需点击保存；提示词编辑不会自动重写示例代码。提示词与中文指南均标为本项目整理，不冒充原始生成记录，供应商/模型字段明确标记为开源示例与未记录。现有术语库入口及编辑器术语插入功能继续保留。

上游 [mouse-lin/finesse-skill](https://github.com/mouse-lin/finesse-skill) 固定快照为 `5050b6c71e27b829d1b3087d2be889d29c60db00`。原文保存在 `src/resources/upstream/`；`source.json` 记录版本、MIT 许可和逐文件 SHA-256；`catalog.ts` 单独维护精选说明。原文仅作为产品资料，不作为本项目开发指令。内置资源不进入案例备份，创建的个人副本则随案例正常保存、备份和导出。

预览需要联网：部分字体来自 Google Fonts，两个工具页的 GSAP 路径适配为 3.13.0 CDN，CALIBRE 缺失的 Anime.js 相对模块适配为 4.2.2 CDN。转换仅发生在使用副本中，保留原始快照；第三方依赖遵循各自许可。外部资源失败会提示效果可能不完整。商品图片是上游 SVG 占位素材，示例中的业务数据、购买等均为演示。

更新流程与适配说明见 [资源维护说明](src/resources/README.md)。

## 构建、测试与部署

```powershell
npm test
npm run build
npm start
```

生产构建由 Node 服务提供，默认 http://127.0.0.1:3001 。数据位于 `data/gallery.sqlite`。数据目录不要提交到 Git。不要把开发服务器直接暴露到公网。

浏览器回归测试运行 `npm run test:ui`。Windows 默认使用已安装的 Microsoft Edge；其他平台使用 Playwright Chromium（先执行 `npx playwright install chromium`）。也可以通过 `PW_CHANNEL` 指定浏览器通道。测试使用临时数据库，不会改动你的正式案例。

可配置环境变量：

| 变量 | 默认 | 用途 |
| --- | --- | --- |
| PORT | 3001 | 服务端端口 |
| HOST | 127.0.0.1 | 监听地址；局域网访问可设为 0.0.0.0 |
| DATA_DIR | data | SQLite 持久化目录 |
| COOKIE_SECURE | false | HTTPS 部署时必须设为 true |

多设备访问需将服务部署到一台可访问的服务器，持久挂载数据目录，使用 HTTPS 反向代理，并设置 COOKIE_SECURE=true。反向代理必须保留原始 Host，并确保 `/api/setup` 不对公网开放；初始化完成后该接口会拒绝再次创建账号。只运行一个 Node 实例。应用备份包含案例与封面，不包含账号；迁移账号需在服务停止后备份整个数据目录。

开发时 Vite 将 /api 代理至 127.0.0.1:3001。对外部署使用 `npm run build` + `npm start`，不要使用 Vite 开发代理。

## 一键发布到当前 ECS

Windows 双击根目录 `publish.bat`，完成依赖安装、测试、构建、上传、服务器备份、切换版本和健康检查。构建在 `.qa/releases/` 的隔离目录进行，不占用或修改开发中的 `node_modules`。使用本机已配置的 Workbench 凭证，默认目标为北京 `i-2zeixnidw1aczwhlgjaj`，地址 `http://60.205.156.192`。Workbench 默认路径为 `D:\software\Workbench CLI\workbench.exe`，找不到时从 PATH 查找。

发布只上传 `dist/`、`server/`、`package.json` 和 `package-lock.json`，**不上传本地账号、案例、密钥或 node_modules**。线上数据保留在 `/var/lib/prompt-gallery`。准备依赖时旧版本保持运行，切换时服务会短暂停止；切换失败自动恢复旧代码，数据库不自动回滚。此脚本用于更新已经部署好的服务器，不负责首次安装 Node、Nginx、安全组和 systemd。

仅测试构建并生成发布包、不修改服务器：

```powershell
.\publish.bat -PackageOnly
```

产物位于 `.qa/releases/`。远端日志为 `/var/tmp/prompt-gallery-publish-发布编号/release.log`，完成状态为同目录 `result`（0 表示成功）。网络中断时远端任务会继续执行，应先检查日志和结果再重试。旧代码保留在 `/opt/prompt-gallery-releases/`，数据库备份保留在 `/var/backups/prompt-gallery/`，均不自动清理。公网页面验证失败不代表代码已回滚，请以远端日志为准。

## 预览边界

iframe 仅启用 `allow-scripts`，不授予同源、弹窗、表单或顶层导航权限。CSP 允许 HTTPS 脚本、样式、字体、图片和请求，禁止子 iframe。预览代码可能向外部 HTTPS 服务请求数据；不要在示例代码中放入密钥。无限循环可能卡住浏览器页面，因此只运行可信或自己审阅过的代码。导出的 HTML 是独立代码文件，不包含应用内隔离限制。暂不支持安装 npm 依赖、React/Vue 工程构建、自动调用模型或自动截取封面。

## 项目结构

`src/` 为 React 界面与预览组装逻辑；`server/` 为认证、SQLite 存储与数据校验；`tests/` 为 API 回归测试。

忘记管理员密码时，保留数据目录备份后，可通过受控的服务器运维手段重置 admin 表和 sessions 表；应用不提供公开密码重置接口。
