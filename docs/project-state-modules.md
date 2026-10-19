# 模块现状

> 记录项目当前真实存在的模块与目录。仅写已落地的事实。

## 目录结构

| 路径 | 职责 | 对外暴露 |
| --- | --- | --- |
| `app/` | Next.js App Router 页面与布局 | `layout.tsx`（根布局、字体变量、全局 Header/Footer）、`page.tsx`（首页场景大厅：Hero、进度统计、7 场景网格、知识小贴士）、`scenario/[slug]/page.tsx`（场景简报页：双色调封面、威胁等级、技能、专属资源、我的记录、吸底动作条；无效 slug 调用 `notFound()`）、`not-found.tsx`（404 页面：大号 meteor 图标 +「这个末日不存在，但别慌。」+ 回到大厅按钮，沿用全局 Header/Footer 与纸色背景） |
| `components/site-header.tsx` | 全局导航（客户端组件）：Logo、场景/生存手册导航、当前路由高亮、音效开关 | `SiteHeader` |
| `components/site-footer.tsx` | 全局页脚：科普免责声明与 Unsplash / Font Awesome 署名 | `SiteFooter` |
| `components/home-stats.tsx` | 首页进度条带（客户端组件）：知识 x/42、结局 x/21、总存活天数、最佳评分 | `HomeStats` |
| `components/scenario-grid.tsx` | 首页场景网格（客户端组件）：渲染 7 张场景卡并按存档传入星级 | `ScenarioGrid` |
| `components/scenario-card.tsx` | 场景卡（客户端组件）：双色调封面 + 图标兜底、编号、星级、专属资源 chip、进入箭头 | `ScenarioCard` |
| `components/scenario-cover.tsx` | 场景双色调封面（客户端组件）：渐变 + 图标兜底，照片加载失败时卸载图片 | `ScenarioCover` |
| `components/scenario-record.tsx` | 简报页「我的记录」（客户端组件）：最佳分、最佳星级、3 个结局槽位（未解锁显示 `???`）、局数 | `ScenarioRecord` |
| `components/random-scenario-button.tsx` | Hero「随机灾变」按钮（客户端组件）：随机跳转 `/scenario/[slug]` | `RandomScenarioButton` |
| `components/knowledge-tip.tsx` | 首页知识小贴士（客户端组件）：从已解锁知识卡中选一条链接到 `/codex`，无卡片时显示解锁提示 | `KnowledgeTip` |
| `components/game/GameProvider.tsx` | 本局状态 Provider（客户端组件）：`useReducer` + Context 暴露 `state` / `dispatch`；挂载后经 `StorageAdapter` 从 `activeRun` 恢复，run 变化时写回；不直接访问 `localStorage` | `GameProvider`（可注入 `adapter`）、`useGame()`、`GameContextValue`、`GameProviderProps` |
| `app/globals.css` | Tailwind v4 入口 + 设计令牌（颜色、圆角、阴影、动效、7 组场景渐变） | CSS 变量与 `@theme inline` 映射出的 Tailwind 工具类 |
| `lib/types.ts` | 领域模型类型与常量（场景、事件、选项、知识卡、结局、本局状态、进度、设置、结算结果） | `Scenario`、`GameEvent`、`Choice`、`RiskBranch`、`KnowledgeCard`、`Ending`、`RunState`、`Progress`、`Settings`、`LastResult` 等类型；`SCENARIO_IDS`、`RESOURCE_KEYS` |
| `lib/storage.ts` | 存档适配器：版本信封、默认值、损坏数据回退、前缀重置 | `StorageAdapter`、`StorageBackend`、`createStorageAdapter(backend?)`、`storageAdapter`、`STORAGE_KEYS`、`STORAGE_PREFIX`、`STORAGE_VERSION`、`createDefaultProgress()`、`createDefaultSettings()` |
| `lib/use-progress.ts` | 客户端读取进度的 `useSyncExternalStore` hook；服务端快照为空进度，内容不变时复用同一引用 | `useProgress()` |
| `lib/progress.ts` | 进度合并与统计纯函数：结算写回（最佳分/星级取较大值、结局与知识去重、次数与存活天数累加）、知识解锁、首页汇总统计；不修改入参 | `OverallStats`、`applyRunResult(progress, result)`、`unlockKnowledge(progress, ids)`、`getOverallStats(progress)` |
| `lib/gameReducer.ts` | 本局状态 reducer（纯函数）：新建 / 恢复 / 提交选择 / 推进 / 结束五类 action；接收 `resolveChoice` 的结算结果，推进 `day` / `eventIndex` 并在末回合或死亡时更新 `status`；时间戳由 action 传入 | `GameState`、`GameAction`、`initialGameState`、`gameReducer(state, action)` |
| `lib/icons.ts` | 数据文件中的 FontAwesome 图标名 → 图标对象映射，未知名回退到手册图标 | `getIconByName(name)` |
| `lib/engine/rng.ts` | 确定性随机数：mulberry32 PRNG 与整数取值辅助，供抽牌/风险判定复现同一局 | `Rng` 类型、`mulberry32(seed)`、`randomInt(rng, min, max)`（闭区间） |
| `lib/engine/constants.ts` | 引擎集中数值：初始资源、资源上下限、天数、抽牌数、评分系数与星级阈值、best 结局阈值、断水断食扣血 | `INITIAL_RESOURCES`、`RESOURCE_MIN/MAX`、`RUN_DAYS`、`MIDDLE_EVENT_DRAW_COUNT`、`SCORE_*`、`THREE_STAR_MIN_SCORE`、`TWO_STAR_MIN_SCORE`、`BEST_ENDING_MIN_SCORE`、`BEST_ENDING_MIN_SPECIFIC`、`DEPRIVATION_HP_PENALTY` |
| `lib/engine/deck.ts` | 牌组与回合引擎：按幕校验事件池、Fisher–Yates 抽 5 张中段、生成固定 7 回合牌组与初始 `RunState` | `EventPool`、`splitEventPool(scenarioId, events)`、`drawMiddleEvents(middle, rng)`、`buildDeck(scenario, seed, events)`、`buildRun(scenario, seed, events, startedAt?)` |
| `lib/engine/resolve.ts` | 选项结算引擎：应用确定/风险分支效果、5 项资源钳制 0–100、断水断食扣 HP、HP/理智归零判定死亡；不推进 day/eventIndex | `ChoiceResolution`、`resolveChoice(run, choice, rng)` → `{ state, result }` |
| `lib/engine/score.ts` | 评分、星级与结局引擎：按最终本局状态计算分数与星级、判定 best/neutral/doom，死亡局最高 1 星 | `RunEvaluation`、`isDead(run)`、`computeScore(run)`、`computeStars(score, dead)`、`resolveEnding(run)`、`evaluateRun(run)` → `{ score, stars, ending, days }` |
| `data/scenarios/index.ts` | 7 个场景的元数据注册表 | `scenarios`（7 项数组）、`scenarioById`、`getScenario(id)` |
| `data/knowledge/index.ts` | 全局知识卡注册表（当前为空数组，待各场景 knowledge 内容汇总） | `knowledgeCards`、`knowledgeById`、`getKnowledgeCard(id)` |
| `tests/` | Vitest + jsdom + Testing Library 测试 | `setup.ts`（jest-dom 匹配器）、`home.test.tsx`（mock 了 `next/navigation` 的 `useRouter`）、`scenarios.test.ts`、`storage.test.ts`、`engine-rng.test.ts`、`engine-constants.test.ts`、`engine-deck.test.ts`、`engine-resolve.test.ts`、`engine-score.test.ts`、`progress.test.ts`、`game-reducer.test.ts`、`game-provider.test.tsx`（内存 `StorageBackend` 注入适配器） |
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
