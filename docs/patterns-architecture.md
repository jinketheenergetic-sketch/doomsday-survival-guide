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
- **同一 seed 的 RNG 流被抽牌与每次风险判定共享** — 刷新恢复用 `createChoiceRng` 重放；新增消耗随机数的引擎逻辑必须同步该函数，否则判定漂移（来自 [US-008]/[US-011]）
- **`resolveEnding(run)` 返回 `EndingTone`，不是结局 id** — 结算时按 `scenarioId + tone` 从场景结局表取 `Ending.id` 写入 `LastResult.endingId`（来自 [US-009]）
- **存活天数统一取 `run.day`** — 死亡局不额外减 1；结算页与 `applyRunResult` 共用这一口径（来自 [US-009]）
- **`applyRunResult(progress, lastResult)` 已合并 `newKnowledgeIds` 并去重** — 结算页直接传 `lastResult`，不要重复 push history 或另算 `runs` / `totalRuns`（来自 [US-036]）
- **`GameProvider` 只读写 `activeRun`** — `lastResult` 与进度的写回由结算页负责，不要扩展 Provider 的存储职责（来自 [US-037]）
- **已结算未推进用 `run.history.length > run.eventIndex` 推导** — `resolveChoice` 不推进 `eventIndex`，`advance` 后两者相等（来自 [US-011]）
- **`advance` 会清空 `lastResult`** — 结果弹层直接读 `state.lastResult`，不要另存一份 pending 副本（来自 [US-011]）
- **结算写回后清空 `activeRun` 与 `lastResult`** — 用模块级缓存让当前页继续渲染；保留 `lastResult` 会让刷新重复计入 `totalRuns`（来自 [US-012]）
- **同一标签页内 `saveProgress` 不触发 `storage` 事件** — 写回进度后需显式通知 `useProgress` 的订阅者（来自 [US-012]）
- **内容未就绪时统一用 `createSkeletonEvents` 兜底** — 游戏页与结算页共用同一份，保证历史 `eventId` 可回查（来自 [US-010a]/[US-012]）
- **`GameEvent.choices` 是 `readonly [Choice, Choice, Choice]`** — 标注为 `readonly GameEvent[]` 时 3 元素字面量自动按元组校验，无需 `as const`（来自 [US-014]）
- **风险选项也要写 `resultText`** — 结算走 `risk.successText`/`failureText`，但内容校验要求每个选项都有该字段（来自 [US-014]）
- **7 张中段里至少 4 张带风险** — 才能保证任意 5 张子集仍含 2 个风险选项（US-033 的牌组约束）（来自 [US-014]）
- **`Ending` 没有插画字段** — 结算页用场景封面叠滤镜表达结局基调，内容 story 不要为结局新增插画字段（来自 [US-012]）
- **场景专属资源初始值与 good 路线总增量之和控制在 100 以内** — `resolveChoice` 不钳制专属资源，HUD 进度条按 100 为上限，超出会显示溢出（来自 [US-014]/[US-019]）
- **结局 id 固定为 `<scenarioId>-<tone>`（如 `flood-best`）** — 与 `resolveEnding` 返回的 `EndingTone` 一一对应，`tests/progress.test.ts` / `tests/storage.test.ts` 按该格式写死样例（来自 [US-015]）
- **知识卡 id 由本场景 `events.ts` 先行定义（格式 `<scenarioId>-<slug>`），内容 story 反向建卡** — 测试同时校验引用可解析与每张卡至少被引用一次，防拼写漂移与死卡（来自 [US-015]/[US-019]）
- **结局文案回扣同场景 `events.ts` 终局 bad 选项的意象** — 两段式内容 story 之间互相呼应，比重新发明细节更连贯（来自 [US-017]/[US-019]）
- **一张知识卡可被多个事件复用** — 建卡内容要覆盖全部引用语境（如正午高温既在加油站也在赶路），不要只对着第一个事件写（来自 [US-024]）
