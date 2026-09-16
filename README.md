# Prompt Gallery · 提示词效果库

个人私有的前端效果案例库：记录提示词、供应商、模型、版本和 HTML/CSS/JavaScript，并在隔离预览中运行。

## 本地启动

需要 Node.js 22.13 或更高版本（推荐 Node 22 LTS）。

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
- 点击运行预览；桌面/手机宽度切换；停止预览。
- 上传图片封面（PNG/JPEG/WebP/GIF，最大 2 MB）；首页不执行案例代码。
- 案例 JSON、可独立运行 HTML 导出；全库 JSON 备份和合并恢复。同 ID 案例在确认后覆盖。
- 首次空库可选导入六个手工演示案例，未冒充真实模型输出。
- SQLite 持久化、密码 scrypt 哈希、HttpOnly 会话、登录限流、请求来源校验、多设备编辑冲突检测。

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

## 预览边界

iframe 仅启用 `allow-scripts`，不授予同源、弹窗、表单或顶层导航权限。CSP 允许 HTTPS 脚本、样式、字体、图片和请求，禁止子 iframe。预览代码可能向外部 HTTPS 服务请求数据；不要在示例代码中放入密钥。无限循环可能卡住浏览器页面，因此只运行可信或自己审阅过的代码。导出的 HTML 是独立代码文件，不包含应用内隔离限制。暂不支持安装 npm 依赖、React/Vue 工程构建、自动调用模型或自动截取封面。

## 项目结构

`src/` 为 React 界面与预览组装逻辑；`server/` 为认证、SQLite 存储与数据校验；`tests/` 为 API 回归测试；`docs/concept.png` 为视觉概念。

忘记管理员密码时，保留数据目录备份后，可通过受控的服务器运维手段重置 admin 表和 sessions 表；应用不提供公开密码重置接口。
