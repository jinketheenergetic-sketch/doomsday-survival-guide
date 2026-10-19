# 模块现状

> 记录项目当前真实存在的模块与目录。仅写已落地的事实。

## 目录结构

| 路径 | 职责 | 对外暴露 |
| --- | --- | --- |
| `app/` | Next.js App Router 页面与布局 | `layout.tsx`（根布局、字体变量、全局 Header/Footer）、`page.tsx`（首页场景大厅：Hero、进度统计、7 场景网格、知识小贴士）、`scenario/[slug]/page.tsx`（场景简报页：双色调封面、威胁等级、技能、专属资源、我的记录、吸底动作条；`generateStaticParams` 预渲染 7 个 slug；无效 slug 调用 `notFound()`）、`play/[slug]/page.tsx`（游戏页：经 `getScenarioContent(slug)` 取内容，无效 slug `notFound()`，`generateStaticParams` 预渲染 7 个场景，渲染 `GameScreen`）、`play/[slug]/result/page.tsx`（结算页：预渲染 7 个 slug、无效 slug `notFound()`，注入场景结局/知识卡与事件（为空时用占位牌组），渲染 `ResultScreen`）、`not-found.tsx`（404 页面：大号 meteor 图标 +「这个末日不存在，但别慌。」+ 回到大厅按钮，沿用全局 Header/Footer 与纸色背景） |
| `components/site-header.tsx` | 全局导航（客户端组件）：Logo、场景/生存手册导航、当前路由高亮、音效开关；`usePathname()` 拆进 `HeaderNav` 并由 `<Suspense>` 包裹，fallback 复用无状态的 `NavLinks` | `SiteHeader`（内部 `HeaderNav` / `HeaderNavFallback` / `NavLinks` 不对外导出） |
| `components/site-footer.tsx` | 全局页脚：科普免责声明与 Unsplash / Font Awesome 署名 | `SiteFooter` |
| `components/home-stats.tsx` | 首页进度条带（客户端组件）：知识 x/42、结局 x/21、总存活天数、最佳评分 | `HomeStats` |
| `components/scenario-grid.tsx` | 首页场景网格（客户端组件）：渲染 7 张场景卡并按存档传入星级 | `ScenarioGrid` |
| `components/scenario-card.tsx` | 场景卡（客户端组件）：双色调封面 + 图标兜底、编号、星级、专属资源 chip、进入箭头 | `ScenarioCard` |
| `components/scenario-cover.tsx` | 场景双色调封面（客户端组件）：渐变 + 图标兜底，照片加载失败时卸载图片 | `ScenarioCover` |
| `components/scenario-record.tsx` | 简报页「我的记录」（客户端组件）：最佳分、最佳星级、3 个结局槽位（未解锁显示 `???`）、局数 | `ScenarioRecord` |
| `components/random-scenario-button.tsx` | Hero「随机灾变」按钮（客户端组件）：随机跳转 `/scenario/[slug]` | `RandomScenarioButton` |
| `components/knowledge-tip.tsx` | 首页知识小贴士（客户端组件）：从已解锁知识卡中选一条链接到 `/codex`，无卡片时显示解锁提示 | `KnowledgeTip` |
| `components/game/GameProvider.tsx` | 本局状态 Provider（客户端组件）：`useReducer` + Context 暴露 `state` / `dispatch`；挂载后经 `StorageAdapter` 从 `activeRun` 恢复，可用 `resolveRun(stored)` 决定沿用存档还是新建，run 变化时写回；不直接访问 `localStorage` | `GameProvider`（可注入 `adapter` / `resolveRun`）、`useGame()`、`GameContextValue`、`GameProviderProps` |
| `components/game/GameScreen.tsx` | 游戏页客户端外壳与对局交互：用 `Date.now()` 种子与 `getScenarioContent` 的事件新建对局（同场景存档则恢复），包装 `GameProvider`；按 `run.deck[run.eventIndex]` 取当前事件，处理点击 / 键盘 1-3 选择、`resolveChoice` 结算、知识卡首次解锁、`activeRun` 写回、继续推进与第 7 天 / 死亡的 `LastResult` 生成与结算页跳转；刷新后用 history 恢复待确认结果 | `GameScreen({ content })` |
| `components/game/GameHud.tsx` | 游戏页 HUD（客户端组件）：`第 x/7 天`、7 个天数圆点、5 项通用资源 + 场景专属资源的进度条；资源数字变化时播放 `value-pop` 动画，`aria-live="polite"` 播报最近一次结算；移动端收为紧凑图标 + 数字并可展开抽屉；退出按钮弹出确认对话框，确认后返回场景简报且不清除 `activeRun` | `GameHud({ scenario, run })` |
| `components/game/EventCard.tsx` | 当前回合事件卡（客户端组件）：渐变 + 图标 + CSS 形状的插画区、幕名、标题、正文、默认收起的「冷知识」折叠区、3 个 A/B/C 选项按钮（效果预览 chip，风险选项附成功率与成功/失败分支）；支持 `onSelect` 与结算期间的 `disabled` | `EventCard({ scenario, event, knowledge?, onSelect?, disabled? })`、`EventCardProps` |
| `components/game/ChoiceResultSheet.tsx` | 选择结果底部弹层（客户端组件）：结果文案、风险成功 / 失败标记、实际资源变化 chip、关联 `knowledgeId` 的知识贴士与「继续」按钮；最终回合提示进入结算页 | `ChoiceResultSheet({ scenario, result, knowledge?, final, onContinue })`、`ChoiceResultSheetProps` |
| `components/game/resource-chips.tsx` | 资源变化 chip 的共用渲染：把资源变化整理成 chip 数据，正向绿色 / 负向红色，供事件卡预览与结果弹层共用 | `DeltaChipView`、`describeDelta(effects, specificEffect, scenario)`、`DeltaChip({ chip, prefix? })` |
| `components/game/resource-display.ts` | 5 项通用资源的展示元数据（键、名称、FontAwesome 图标、颜色），供 HUD、事件卡与结果弹层共用 | `CommonResourceDisplay`、`COMMON_RESOURCES` |
| `components/game/ResultScreen.tsx` | 结算页主体（客户端组件）：结局插画（doom 灰暗滤镜 +「你尽力了（大概）」标签）、结局标题/结语/「结局 x/3」、分数滚动与星级点亮、终局资源与存活天数、移动端默认折叠的生存报告（✓/•/✗ + 正确做法）、本次解锁知识卡、再来一局/换个末日/查看生存手册入口；无结果或 slug 不匹配时重定向到场景简报 | `ResultScreen({ scenario, endings, knowledge, events })`、`ResultScreenProps` |
| `components/game/result-store.ts` | 结算页的一次性会话：`useSyncExternalStore` 快照读取 `lastResult`，首次渲染后调用 `applyRunResult` 写回进度、清空 `activeRun` 与 `lastResult`，并通知订阅者刷新结局收集数 | `ResultSnapshot`、`getResultSnapshot()`、`getServerResultSnapshot()`、`subscribeResult(listener)`、`applyResultOnce(result)` |
| `app/globals.css` | Tailwind v4 入口 + 设计令牌（颜色、圆角、阴影、动效、7 组场景渐变）+ 结果弹层 `sheet-rise`、资源数字 `value-pop` 与结算星级 `star-pop` 动效类 | CSS 变量与 `@theme inline` 映射出的 Tailwind 工具类、`.sheet-rise`、`.value-pop`、`.star-pop` |
| `lib/types.ts` | 领域模型类型与常量（场景、事件、选项、知识卡、结局、本局状态、进度、设置、结算结果）；`RunState.newKnowledgeIds` 记录本局首次解锁的知识卡 | `Scenario`、`GameEvent`、`Choice`、`RiskBranch`、`KnowledgeCard`、`Ending`、`RunState`、`Progress`、`Settings`、`LastResult` 等类型；`SCENARIO_IDS`、`RESOURCE_KEYS` |
| `lib/storage.ts` | 存档适配器：版本信封、默认值、损坏数据回退、前缀重置；`activeRun` 校验会保留可选的 `newKnowledgeIds` | `StorageAdapter`、`StorageBackend`、`createStorageAdapter(backend?)`、`storageAdapter`、`STORAGE_KEYS`、`STORAGE_PREFIX`、`STORAGE_VERSION`、`createDefaultProgress()`、`createDefaultSettings()` |
| `lib/use-progress.ts` | 客户端读取进度的 `useSyncExternalStore` hook；服务端快照为空进度，内容不变时复用同一引用 | `useProgress()` |
| `lib/progress.ts` | 进度合并与统计纯函数：结算写回（最佳分/星级取较大值、结局与知识去重、次数与存活天数累加）、知识解锁、首页汇总统计；不修改入参 | `OverallStats`、`applyRunResult(progress, result)`、`unlockKnowledge(progress, ids)`、`getOverallStats(progress)` |
| `lib/gameReducer.ts` | 本局状态 reducer（纯函数）：新建 / 恢复 / 提交选择 / 推进 / 结束五类 action；提交选择时接收 `resolveChoice` 结果并可记入首个解锁的知识卡，推进时清空 `lastResult`，末回合或死亡时更新 `status`；时间戳由 action 传入 | `GameState`、`GameAction`、`initialGameState`、`gameReducer(state, action)` |
| `lib/icons.ts` | 数据文件中的 FontAwesome 图标名 → 图标对象映射，未知名回退到手册图标 | `getIconByName(name)` |
| `lib/scenarios.ts` | 场景内容查询：按 slug 返回 `ScenarioContent`（元数据 + 事件 + 结局 + 知识卡）；未知 slug 返回 `undefined`。内容聚合在 US-035 落地前，事件/结局/知识卡为空数组 | `getScenarioContent(slug)` |
| `lib/engine/rng.ts` | 确定性随机数：mulberry32 PRNG 与整数取值辅助，供抽牌/风险判定复现同一局 | `Rng` 类型、`mulberry32(seed)`、`randomInt(rng, min, max)`（闭区间） |
| `lib/engine/constants.ts` | 引擎集中数值：初始资源、资源上下限、天数、抽牌数、评分系数与星级阈值、best 结局阈值、断水断食扣血 | `INITIAL_RESOURCES`、`RESOURCE_MIN/MAX`、`RUN_DAYS`、`MIDDLE_EVENT_DRAW_COUNT`、`SCORE_*`、`THREE_STAR_MIN_SCORE`、`TWO_STAR_MIN_SCORE`、`BEST_ENDING_MIN_SCORE`、`BEST_ENDING_MIN_SPECIFIC`、`DEPRIVATION_HP_PENALTY` |
| `lib/engine/deck.ts` | 牌组与回合引擎：按幕校验事件池、Fisher–Yates 抽 5 张中段、生成固定 7 回合牌组与初始 `RunState` | `EventPool`、`splitEventPool(scenarioId, events)`、`drawMiddleEvents(middle, rng)`、`buildDeck(scenario, seed, events)`、`buildRun(scenario, seed, events, startedAt?)` |
| `lib/engine/resolve.ts` | 选项结算引擎：应用确定/风险分支效果、5 项资源钳制 0–100、断水断食扣 HP、HP/理智归零判定死亡；不推进 day/eventIndex。`createChoiceRng` 按 seed 重放抽牌与历史风险判定，重建刷新后的随机流 | `ChoiceResolution`、`resolveChoice(run, choice, rng)` → `{ state, result }`、`createChoiceRng(seed, middleEventCount, history)` |
| `lib/engine/score.ts` | 评分、星级与结局引擎：按最终本局状态计算分数与星级、判定 best/neutral/doom，死亡局最高 1 星 | `RunEvaluation`、`isDead(run)`、`computeScore(run)`、`computeStars(score, dead)`、`resolveEnding(run)`、`evaluateRun(run)` → `{ score, stars, ending, days }` |
| `data/scenarios/index.ts` | 7 个场景的元数据注册表 | `scenarios`（7 项数组）、`scenarioById`、`getScenario(id)` |
| `data/scenarios/flood/events.ts` | 融冰纪元事件牌组：9 个事件（1 开场 + 7 中段 + 1 终局），每个事件 3 个选项（good / ok / bad）；5 张中段事件带风险分支，保证任意 5 张中段至少含 2 个风险选项；所有 `knowledgeId` 指向 `data/scenarios/flood/knowledge.ts` 中的 6 张洪水知识卡 | `floodEvents`（`readonly GameEvent[]`） |
| `data/scenarios/flood/endings.ts` | 融冰纪元 3 个结局：best / neutral / doom 各一个，id 为 `flood-best` / `flood-neutral` / `flood-doom`，与 `resolveEnding` 的基调对应 | `floodEndings`（`readonly Ending[]`） |
| `data/scenarios/flood/knowledge.ts` | 融冰纪元 6 张知识卡（急流、饮水消毒、垂直撤离、失温、屋顶求救、伤口破伤风），id 与事件引用一致 | `floodKnowledge`（`readonly KnowledgeCard[]`） |
| `data/scenarios/quake/events.ts` | 地裂之日事件牌组：9 个事件（1 开场 + 7 中段 + 1 终局），每个事件 3 个选项（good / ok / bad）；5 张中段事件带风险分支，保证任意 5 张中段至少含 2 个风险选项；所有 `knowledgeId` 指向 `data/scenarios/quake/knowledge.ts` 中的 6 张地震知识卡 | `quakeEvents`（`readonly GameEvent[]`） |
| `data/scenarios/quake/endings.ts` | 地裂之日 3 个结局：best / neutral / doom 各一个，id 为 `quake-best` / `quake-neutral` / `quake-doom`，与 `resolveEnding` 的基调对应 | `quakeEndings`（`readonly Ending[]`） |
| `data/scenarios/quake/knowledge.ts` | 地裂之日 6 张知识卡（趴下掩护抓稳、禁用电梯、燃气泄漏、海啸垂直撤离、废墟敲击求救、直接加压止血），id 与事件引用一致 | `quakeKnowledge`（`readonly KnowledgeCard[]`） |
| `data/scenarios/meteor/events.ts` | 天火降临事件牌组：9 个事件（1 开场 + 7 中段 + 1 终局），每个事件 3 个选项（good / ok / bad）；5 张中段事件带风险分支，保证任意 5 张中段至少含 2 个风险选项；所有 `knowledgeId` 指向 `data/scenarios/meteor/knowledge.ts` 中的 6 张陨石知识卡 | `meteorEvents`（`readonly GameEvent[]`） |
| `data/scenarios/meteor/endings.ts` | 天火降临 3 个结局：best / neutral / doom 各一个，id 为 `meteor-best` / `meteor-neutral` / `meteor-doom`，与 `resolveEnding` 的基调对应 | `meteorEndings`（`readonly Ending[]`） |
| `data/scenarios/meteor/knowledge.ts` | 天火降临 6 张知识卡（冲击波避险、不直视火球、湿布/N95 遮口鼻、撞击冬天储备、进门脱外衣、发电机室外使用），id 与事件引用一致 | `meteorKnowledge`（`readonly KnowledgeCard[]`） |
| `data/scenarios/ice/events.ts` | 永夜冰河事件牌组：9 个事件（1 开场 + 7 中段 + 1 终局），每个事件 3 个选项（good / ok / bad）；5 张中段事件带风险分支，保证任意 5 张中段至少含 2 个风险选项；所有 `knowledgeId` 指向 `data/scenarios/ice/knowledge.ts` 中的 6 张极寒知识卡 | `iceEvents`（`readonly GameEvent[]`） |
| `data/scenarios/ice/endings.ts` | 永夜冰河 3 个结局：best / neutral / doom 各一个，id 为 `ice-best` / `ice-neutral` / `ice-doom`，与 `resolveEnding` 的基调对应 | `iceEndings`（`readonly Ending[]`） |
| `data/scenarios/ice/knowledge.ts` | 永夜冰河 6 张知识卡（多层衣物、室内不烧炭、雪水煮沸、冻伤温水复温、集中一室、失温缓慢复温），id 与事件引用一致 | `iceKnowledge`（`readonly KnowledgeCard[]`） |
| `data/scenarios/ai/events.ts` | 后人类纪元事件牌组：9 个事件（1 开场 + 7 中段 + 1 终局），每个事件 3 个选项（good / ok / bad）；7 张中段的 ok 选项均带风险分支，任意 5 张中段至少含 2 个风险选项；所有 `knowledgeId` 指向 `data/scenarios/ai/knowledge.ts` 中的 6 张数字生存知识卡 | `aiEvents`（`readonly GameEvent[]`） |
| `data/scenarios/ai/endings.ts` | 后人类纪元 3 个结局：best / neutral / doom 各一个，id 为 `ai-best` / `ai-neutral` / `ai-doom`，与 `resolveEnding` 的基调对应 | `aiEndings`（`readonly Ending[]`） |
| `data/scenarios/ai/knowledge.ts` | 后人类纪元 6 张知识卡（离线备份、不随意扫码授权、离网太阳能、数据中心依赖、社会工程、手工与离线技能），id 与事件引用一致 | `aiKnowledge`（`readonly KnowledgeCard[]`） |
| `data/scenarios/drought/events.ts` | 赤沙荒原事件牌组：9 个事件（1 开场 + 7 中段 + 1 终局），每个事件 3 个选项（good / ok / bad）；7 张中段的 ok 选项均带风险分支，任意 5 张中段至少含 2 个风险选项；所有 `knowledgeId` 指向 `data/scenarios/drought/knowledge.ts` 中的 6 张干旱生存知识卡 | `droughtEvents`（`readonly GameEvent[]`） |
| `data/scenarios/drought/endings.ts` | 赤沙荒原 3 个结局：best / neutral / doom 各一个，id 为 `drought-best` / `drought-neutral` / `drought-doom`，与 `resolveEnding` 的基调对应 | `droughtEndings`（`readonly Ending[]`） |
| `data/scenarios/drought/knowledge.ts` | 赤沙荒原 6 张知识卡（避开正午行进、沙暴背风蹲伏、太阳能蒸馏、仙人掌汁有毒、中暑快速降温、小口频饮），id 与事件引用一致 | `droughtKnowledge`（`readonly KnowledgeCard[]`） |
| `data/scenarios/heatdeath/events.ts` | 热寂终点事件牌组：9 个事件（1 开场 + 7 中段 + 1 终局），每个事件 3 个选项（good / ok / bad）；7 张中段的 ok 选项均带风险分支，任意 5 张中段至少含 2 个风险选项；所有 `knowledgeId` 指向后续落地的 6 张热寂知识卡 | `heatdeathEvents`（`readonly GameEvent[]`） |
| `data/scenarios/skeleton.ts` | 内容 story 落地前的占位事件牌组：为任意场景生成 1 开场 + 5 中段 + 1 终局，供游戏页在真实 `events` 为空时生成合法 7 回合对局；选项带示例资源变化与一个风险分支，便于展示效果预览 | `createSkeletonEvents(scenario)` |
| `data/knowledge/index.ts` | 全局知识卡注册表（当前为空数组，待各场景 knowledge 内容汇总） | `knowledgeCards`、`knowledgeById`、`getKnowledgeCard(id)` |
| `tests/` | Vitest + jsdom + Testing Library 测试 | `setup.ts`（jest-dom 匹配器）、`home.test.tsx`（mock 了 `next/navigation` 的 `useRouter`）、`scenarios.test.ts`、`storage.test.ts`、`engine-rng.test.ts`、`engine-constants.test.ts`、`engine-deck.test.ts`、`engine-resolve.test.ts`、`engine-score.test.ts`、`progress.test.ts`、`game-reducer.test.ts`、`game-provider.test.tsx`（内存 `StorageBackend` 注入适配器）、`flood-events.test.ts`（融冰纪元事件牌组结构与风险分支校验）、`flood-content.test.ts`（融冰纪元结局、知识卡与 knowledgeId 可解析性校验）、`quake-events.test.ts`（地裂之日事件牌组结构与风险分支校验）、`quake-content.test.ts`（地裂之日结局、知识卡与 knowledgeId 可解析性校验）、`meteor-events.test.ts`（天火降临事件牌组结构与风险分支校验）、`meteor-content.test.ts`（天火降临结局、知识卡与 knowledgeId 可解析性校验）、`ice-events.test.ts`（永夜冰河事件牌组结构与风险分支校验）、`ice-content.test.ts`（永夜冰河结局、知识卡与 knowledgeId 可解析性校验）、`ai-events.test.ts`（后人类纪元事件牌组结构与风险分支校验）、`ai-content.test.ts`（后人类纪元结局、知识卡与 knowledgeId 可解析性校验）、`drought-events.test.ts`（赤沙荒原事件牌组结构与风险分支校验）、`drought-content.test.ts`（赤沙荒原结局、知识卡与 knowledgeId 可解析性校验）、`heatdeath-events.test.ts`（热寂终点事件牌组结构与风险分支校验） |
| `public/` | 静态资源（脚手架默认图标） | 静态文件 |

## 配置文件

| 文件 | 作用 |
| --- | --- |
| `next.config.ts` | `images.remotePatterns` 仅允许 `images.unsplash.com` |
| `postcss.config.mjs` | Tailwind v4 的 `@tailwindcss/postcss` 插件 |
| `eslint.config.mjs` | `eslint-config-next` (core-web-vitals + typescript)，忽略 `.claude/**`、`.cdp-browser/**`、`scripts/**`、`screenshots/**` |
| `vitest.config.ts` | jsdom 环境、`tests/setup.ts`、`tests/**/*.test.{ts,tsx}`；`resolve.tsconfigPaths` 解析 `@/*` 别名 |
| `tsconfig.json` | TypeScript strict、`@/*` 路径别名 |

## 依赖约定

- FontAwesome 固定为 6.x（`fontawesome-svg-core`、`free-solid-svg-icons`、`free-regular-svg-icons`、`react-fontawesome` 3.x）。
- 字体通过 `next/font/google` 在 `app/layout.tsx` 加载：ZCOOL KuaiLe → `--font-zcool`，Noto Sans SC → `--font-noto`，Baloo 2 → `--font-baloo`。
