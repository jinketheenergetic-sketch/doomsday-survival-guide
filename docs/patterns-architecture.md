# 架构规范

<!-- baseline:start -->
<!-- 以下由人类在项目启动时定义，PM Agent 只读。与 PM 沉淀条目冲突时以此为准。 -->
- **使用 Next.js App Router + TypeScript strict** — 页面放在 `app/`，可复用组件放在 `components/`
- **首发为纯前端** — 不创建 API Routes、不做服务端持久化、不接入 SQLite/登录/账号
- **所有游戏状态在客户端** — 用 React `useReducer` + Context，不引入 Redux/Zustand
- **存储必须经过 `lib/storage.ts` 的 `StorageAdapter`** — 页面与组件不得直接访问 `localStorage`
- **引擎逻辑必须是纯函数** — `lib/engine/` 中的抽牌、结算、评分、结局不依赖 React 或浏览器
- **不引入 Framer Motion 等动画库** — 动效用 CSS transitions/keyframes 实现
- **开发服务器使用端口 5343** — 这是本工程专属端口，禁止使用 3000/5173/8000/8080
<!-- baseline:end -->

<!-- 以下由 PM Agent 从实际开发中沉淀 -->
