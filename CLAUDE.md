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

- 入口：`app/layout.tsx`（字体 + 全局 Header/Footer）、`app/page.tsx`（场景大厅）、`app/scenario/[slug]/page.tsx`（场景简报）、`app/not-found.tsx`（404）；通用组件在 `components/`
- 设计令牌：`app/globals.css`（颜色 + 7 组场景渐变）
- 领域模型：`lib/types.ts`；存储适配器：`lib/storage.ts`；游戏引擎：`lib/engine/`（RNG、数值常量，纯函数）；场景元数据：`data/scenarios/index.ts`；知识卡注册表：`data/knowledge/index.ts`
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

面向中文玩家的纯前端末日生存决策卡牌 Roguelite：7 个灾变场景、每局 7 天、21 个结局与 42 张真实生存知识卡，进度存于本地。

## 当前阶段重点

基础设施（类型、存储、导航、测试）已就绪，进入页面骨架与游戏引擎实现；新内容一律复用 `lib/types.ts` 与 `StorageAdapter`，勿重复初始化既有设施。
<!-- pm-managed:end -->
