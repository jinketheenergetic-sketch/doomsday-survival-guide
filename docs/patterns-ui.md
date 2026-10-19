# UI 规范

<!-- baseline:start -->
<!-- 以下由人类在项目启动时定义，PM Agent 只读。与 PM 沉淀条目冲突时以此为准。 -->
- **视觉风格为干净卡通** — 厚描边、圆角、渐变、高光、层叠阴影；避免写实恐怖、血腥与廉价霓虹
- **使用 Tailwind CSS + `globals.css` 设计令牌** — 不引入 UI 组件库；颜色、圆角、阴影用 CSS 变量
- **图标统一使用 FontAwesome 6 Free** — 装饰性图标必须 `aria-hidden`
- **场景封面使用 Unsplash 照片并做双色调处理** — 事件卡插画只用渐变 + 图标 + CSS 形状，不用照片
- **所有 Unsplash 图片必须有渐变 + 图标兜底** — 禁止出现破图
- **可点击元素最小 44x44px，聚焦有 3px 可见环** — 正文对比度达到 WCAG AA
- **必须尊重 `prefers-reduced-motion`** — 并提供“减少动效”设置
- **音效默认关闭** — 音效只使用 Web Audio API 合成，不引入音频文件
<!-- baseline:end -->

<!-- 以下由 PM Agent 从实际开发中沉淀 -->
- **读 localStorage 的客户端组件用 `useSyncExternalStore`** — `react-hooks/set-state-in-effect` 会拦截 `useEffect` + `setState` 的写法（来自 [US-004]）
- **全局 Header/Footer 已挂在 `app/layout.tsx`** — 页面容器用 `flex-1` 占满剩余高度，不要再写 `min-h-dvh`，否则叠加出滚动条（来自 [US-004]）
- **`next/font` 的 CSS 变量不要与 `@theme inline` 里声明的变量同名** — 同名会自我引用；next/font 用 `--font-zcool` 等，再由 `@theme inline` 映射到 `--font-display`（来自 [US-001]）
- **新增路由要归入「场景」导航高亮时同步 `components/site-header.tsx`** — 现有约定：`/`、`/scenario/*`、`/play/*` 归场景，`/codex*` 归手册（来自 [US-004]）
