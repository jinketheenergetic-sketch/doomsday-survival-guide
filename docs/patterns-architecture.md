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
- **内容 story 需要新字段时先改 `lib/types.ts`** — 再同步 storage 校验与各场景内容，避免 7 个内容 story 各自补字段造成结构分裂（来自 [US-002]）
- **`randomInt(rng, min, max)` 是闭区间** — 抽牌下标写 `(rng, 0, pool.length - 1)`，不要按半开区间传参（来自 [US-032]）
- **平衡数值统一放 `lib/engine/constants.ts`** — 初始资源、阈值、惩罚都在 `INITIAL_RESOURCES` 等常量里；`SCORE_BAD_CHOICE` 存正值、公式里做减法（来自 [US-032]）
- **`buildRun(scenario, seed, events)` 的事件池由调用方传入** — 引擎不读 `data/`，调用方先取 `getScenarioContent(slug).events`；US-037 复用 `buildRun` 生成初始状态（来自 [US-007]）
- **客户端读进度统一用 `useProgress()`（`lib/use-progress.ts`）** — 内部用 JSON 比较缓存引用，避免适配器每次返回新对象导致 `useSyncExternalStore` 无限重渲染（来自 [US-005]）
- **动态路由页面的 `params` 是 Promise** — Next 16 下类型写 `{ params: Promise<{ slug: string }> }` 并 `await params`（来自 [US-006]）
- **固定 slug 的动态路由要提供 `generateStaticParams()`** — 只 `await params` 仍会被判为 runtime data，构建报 `blocking-prerender-dynamic`（来自 [US-038]）
- **`resolveChoice` 与 `commitChoice` 都不推进 `day` / `eventIndex`** — 页面展示结果后单独 dispatch `advance`；最后一个事件之后才置 `completed` 且 day 停在 7（来自 [US-008]/[US-037]）
- **同一 seed 的 RNG 流被抽牌与每次风险判定共享** — 刷新恢复时要重建已消耗的随机步数，否则后续风险判定会漂移（来自 [US-008]/[US-037]）
- **`resolveEnding(run)` 返回 `EndingTone`，不是结局 id** — 结算时按 `scenarioId + tone` 从场景结局表取 `Ending.id` 写入 `LastResult.endingId`（来自 [US-009]）
- **存活天数统一取 `run.day`** — 死亡局不额外减 1；结算页与 `applyRunResult` 共用这一口径（来自 [US-009]）
- **`applyRunResult(progress, lastResult)` 已合并 `newKnowledgeIds` 并去重** — 结算页直接传 `lastResult`，不要重复 push history 或另算 `runs` / `totalRuns`（来自 [US-036]）
- **`GameProvider` 只读写 `activeRun`** — `lastResult` 与进度的写回由结算页负责，不要扩展 Provider 的存储职责（来自 [US-037]）
