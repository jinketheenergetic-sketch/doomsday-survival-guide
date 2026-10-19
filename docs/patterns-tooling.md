# 工程与工具规范

<!-- baseline:start -->
<!-- 以下由人类在项目启动时定义，PM Agent 只读。与 PM 沉淀条目冲突时以此为准。 -->
- **提供 `typecheck`、`lint`、`test`、`build` 四个 npm scripts** — 提交前四项全部通过
- **字体通过 `next/font/google` 加载** — 不在 CSS 中使用远程 `@import`
- **Unsplash 远程图在 `next.config.ts` 的 `images.remotePatterns` 中声明** — 只允许 `images.unsplash.com`
- **不使用默认端口 3000** — 开发服务器固定使用 5343
<!-- baseline:end -->

<!-- 以下由 PM Agent 从实际开发中沉淀 -->
