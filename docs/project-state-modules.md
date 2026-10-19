# 模块现状

> 记录项目当前真实存在的模块与目录。仅写已落地的事实。

## 目录结构

| 路径 | 职责 | 对外暴露 |
| --- | --- | --- |
| `app/` | Next.js App Router 页面与布局 | `layout.tsx`（根布局、字体变量）、`page.tsx`（首页占位） |
| `app/globals.css` | Tailwind v4 入口 + 设计令牌（颜色、圆角、阴影、动效、7 组场景渐变） | CSS 变量与 `@theme inline` 映射出的 Tailwind 工具类 |
| `tests/` | Vitest + jsdom + Testing Library 测试 | `setup.ts`（jest-dom 匹配器）、`home.test.tsx` |
| `public/` | 静态资源（脚手架默认图标） | 静态文件 |

## 配置文件

| 文件 | 作用 |
| --- | --- |
| `next.config.ts` | `images.remotePatterns` 仅允许 `images.unsplash.com` |
| `postcss.config.mjs` | Tailwind v4 的 `@tailwindcss/postcss` 插件 |
| `eslint.config.mjs` | `eslint-config-next` (core-web-vitals + typescript)，忽略 `.claude/**`、`scripts/**` |
| `vitest.config.mts` | jsdom 环境、`tests/setup.ts`、`tests/**/*.test.{ts,tsx}` |
| `tsconfig.json` | TypeScript strict、`@/*` 路径别名 |

## 依赖约定

- FontAwesome 固定为 6.x（`fontawesome-svg-core`、`free-solid-svg-icons`、`free-regular-svg-icons`、`react-fontawesome` 3.x）。
- 字体通过 `next/font/google` 在 `app/layout.tsx` 加载：ZCOOL KuaiLe → `--font-zcool`，Noto Sans SC → `--font-noto`，Baloo 2 → `--font-baloo`。
