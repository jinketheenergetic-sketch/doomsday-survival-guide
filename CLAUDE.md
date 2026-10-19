# 末日生存指南：别慌

一款纯前端决策卡牌 Roguelite 末日生存小游戏：7 个末日场景、每局 7 天、四维资源 + 1 个场景专属资源、三星评级、21 个结局与 42 张真实生存知识卡。

## 技术栈

- 框架：Next.js（App Router）+ React + TypeScript strict
- 样式：Tailwind CSS + `globals.css` 设计令牌；不引入 UI 组件库
- 图标：FontAwesome 6 Free
- 图片：Unsplash 远程图，`next/image`
- 存储：`localStorage`（通过 `StorageAdapter` 隔离，第二期迁移 SQLite）
- 测试：Vitest + jsdom + Testing Library
- 开发端口：**5343**（本工程专属，禁止使用 3000/5173/8000/8080）

## 项目规范

详见 `docs/patterns-*.md`。其中 `<!-- baseline -->` 标记内的条目是项目启动时定义的规范基线，不可违背；标记外的条目由 PM Agent 从实际开发中沉淀。

<!-- dev-managed:start -->
## 项目结构
单体 Next.js App Router 前端，无 `src/`；Tailwind v4 走 PostCSS（`postcss.config.mjs`，无 `tailwind.config`）。

- 入口：`app/layout.tsx`（字体 + 全局 Header/Footer）、`app/page.tsx`（场景大厅）、`app/scenario/[slug]/page.tsx`（场景简报）、`app/play/[slug]/page.tsx`（游戏页）、`app/play/[slug]/result/page.tsx`（结算页：结局、评分、复盘与进度写回）、`app/not-found.tsx`（404）；通用组件在 `components/`，游戏页组件在 `components/game/`
- 设计令牌：`app/globals.css`（颜色 + 7 组场景渐变）
- 领域模型：`lib/types.ts`；存储适配器：`lib/storage.ts`；进度合并与统计：`lib/progress.ts`；本局 reducer：`lib/gameReducer.ts`、`components/game/GameProvider.tsx`（useReducer + Context）；游戏引擎：`lib/engine/`（RNG、数值常量、牌组构建、选项结算、评分与结局，纯函数）；场景查询与元数据：`lib/scenarios.ts`、`data/scenarios/index.ts`、场景内容 `data/scenarios/<slug>/`（`events.ts` 事件牌组、`endings.ts` 结局、`knowledge.ts` 知识卡；未就绪时用 `data/scenarios/skeleton.ts` 占位）；知识卡注册表：`data/knowledge/index.ts`
- 图片：`next.config.ts` 仅允许 `images.unsplash.com`
- 测试：`tests/`（Vitest + jsdom + Testing Library）

## 关键命令

- 开发服务：`npm run dev`（固定 5343）
- 构建 / 生产启动：`npm run build` / `npm run start`（5343）
- 类型检查 / Lint：`npm run typecheck` / `npm run lint`
- 测试：`npm test`

## 项目规范（按需选读）

- docs/patterns-architecture.md
- docs/patterns-ui.md
- docs/patterns-database.md
- docs/patterns-testing.md
- docs/patterns-tooling.md

## 内容简报与现状文档（按需选读）

- docs/content-brief.md
- 现状：docs/project-state-modules.md、docs/project-state-database.md
<!-- dev-managed:end -->

<!-- pm-managed:start -->
## 项目定位（PM Agent 维护）

面向中文玩家的纯前端末日生存决策卡牌 Roguelite：7 个灾变场景、每局 7 天、5 项通用资源 + 1 项场景专属资源、21 个结局与 42 张真实生存知识卡，进度存于本地。

## 当前阶段重点

游戏页主链路（HUD → 事件卡 → 结算 → 结果页）已完成，当前在补 7 个场景的真实内容。US-035 聚合落地前，内容 story 的「Verify in browser」按「应用可加载、可交互、无本轮引入的运行时错误」验收，内容正确性由单测覆盖。内容字段以 `lib/types.ts` 为准：选项文案用 `resultText`，风险分支写进 `risk`，知识卡用 `content`；知识卡 id 以本场景 `events.ts` 的引用为准。
<!-- pm-managed:end -->
