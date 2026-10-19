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
- **渲染期间禁止调用 `Math.random`** — `react-hooks/purity` 会报错；需要「随机展示」时用基于数据的确定性哈希，或把随机放进事件回调（来自 [US-005]）
- **场景封面统一复用 `components/scenario-cover.tsx`** — 渐变层 + 大图标永远垫底，`next/image` 的 `onError` 卸载图片；不要重写这套兜底（来自 [US-006]）
- **图标名统一经 `lib/icons.ts` 的 `getIconByName()` 解析** — 新增图标名要在该文件登记，否则会回退成手册图标（来自 [US-005]）
- **资源变化 chip 直接读 `ChoiceResolution.result.resourceDelta`** — 它是钳制后的实际差值，不要用选项声明的效果自行计算（来自 [US-008]）
- **客户端组件里的 `usePathname()` / `useSearchParams()` 必须包在 `<Suspense>` 内** — cacheComponents 下否则构建报 `CLIENT_HOOK_DYNAMIC`；hook 拆到子组件、fallback 复用同一展示组件（来自 [US-038]/[US-013]）
- **需要“只执行一次”的恢复 effect 用 `useRef` 记录阶段而非 `useState`** — 避免 `react-hooks/set-state-in-effect`（来自 [US-037]）
- **资源名称/图标/颜色集中在 `components/game/resource-display.ts`** — 新增资源 chip 直接复用，不要各自维护 label/icon（来自 [US-010b]）
- **`useSyncExternalStore` 的服务端快照用独立 `loading` 哨兵** — 区分「未水合」与「确实无数据」，否则预渲染阶段会误跳转（来自 [US-012]）
- **结算页「结局 x/3」的 x = 写回后该场景已解锁结局数** — 不是本次结局在 3 个槽位中的序号（来自 [US-012]）
- **新增 FontAwesome 图标名先用 `node -e "require('@fortawesome/free-solid-svg-icons')"` 确认导出存在** — 再登记到 `lib/icons.ts`，否则 tsc 报不存在的导出（来自 [US-023]）
- **URL 状态筛选用 `<Link href="?k=v">` 而非 `router.replace`** — URL 持久化天然成立，测试也不必 mock `useRouter`（来自 [US-013]）
