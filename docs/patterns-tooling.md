# 工程与工具规范

<!-- baseline:start -->
<!-- 以下由人类在项目启动时定义，PM Agent 只读。与 PM 沉淀条目冲突时以此为准。 -->
- **提供 `typecheck`、`lint`、`test`、`build` 四个 npm scripts** — 提交前四项全部通过
- **字体通过 `next/font/google` 加载** — 不在 CSS 中使用远程 `@import`
- **Unsplash 远程图在 `next.config.ts` 的 `images.remotePatterns` 中声明** — 只允许 `images.unsplash.com`
- **不使用默认端口 3000** — 开发服务器固定使用 5343
<!-- baseline:end -->

<!-- 以下由 PM Agent 从实际开发中沉淀 -->
- **Tailwind v4 走 `@tailwindcss/postcss` + `postcss.config.mjs`** — 不要用 `@tailwindcss/turbopack` loader：它会 spawn 子进程绑端口，沙箱内构建报 `Operation not permitted`（来自 [US-001]）
- **本机 `npm run build` 可能因 Turbopack + PostCSS worker 绑端口失败** — 属环境限制，验证改动用 `typecheck`/`lint`/`test`，不要为此改构建配置（来自 [US-034]）
- **ESLint 9 会扫描整个仓库** — `.claude/**`、`scripts/**`、`.cdp-browser/**`、`screenshots/**` 必须进 globalIgnores，否则第三方脚本让 lint 直接失败（来自 [US-001]/[US-034]）
- **FontAwesome 依赖锁 6.x** — npm latest 已是 7.x，`react-fontawesome@3` peer 兼容 `~6 || ~7`，装错违反 baseline（来自 [US-001]）
- **`next/font/google` 在 build 时联网拉字体** — 离线或代理环境构建会失败，属环境问题而非代码错误（来自 [US-001]）
- **Vitest 5 需 `@types/node >=22`** — 配置文件用 `vitest.config.ts` 时在 `package.json` 设 `"type": "module"`，可消除 CJS 加载警告（来自 [US-034]）
