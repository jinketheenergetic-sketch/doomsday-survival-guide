# PRD：《末日生存指南：别慌》

> 产品代号：**DON'T PANIC**  
> 版本：v1.0（纯前端首发）  
> 日期：2026-10-19  
> 状态：待开发

---

## 1. Introduction

《末日生存指南：别慌》是一款**单机、纯前端、决策卡牌 Roguelite** 风格的末日生存小游戏。玩家从七个风格迥异的末日场景中选择一个，在 7 天（7 个事件）内管理资源、做出选择、解锁结局，并在轻松荒诞的叙事中掌握真实可用的生存知识。

七个场景覆盖不同的灾难类型与生存技能维度：洪水、地震海啸、陨石撞击、极寒冰河、AI 接管文明、极端干旱、宇宙热寂。每个场景有独立的视觉主题、专属资源、9 张事件卡、3 个结局和 6 张知识卡。

产品要同时满足两个目标：

1. **有用**：每个选择都对应一条真实应急常识，结算后能复盘“为什么错”。
2. **好玩**：单局 3–6 分钟，荒诞冷幽默，失败也有值得截图分享的结局；不让玩家因为“学习”而紧张。

首发只做纯前端：无登录、无后端、无数据库。所有进度写入 `localStorage`，并通过存储适配器隔离，为第二阶段迁移 SQLite 留出接口。

---

## 2. Goals

- 提供 **7 个可完整游玩的末日场景**，每个场景单局 7 个事件、3–6 分钟。
- 每个场景包含 **3 个可收集结局**，全局共 **21 个结局**。
- 每个场景包含 **6 张真实生存知识卡**，全局共 **42 张**，可在图鉴中永久查阅。
- 决策结果 **确定效果 + 明示概率**：普通选项效果固定；风险选项显示成功率，保证“失败可学习”。
- 三星评级 + 结局收集 + 知识图鉴构成长期留存循环。
- 视觉达到“干净卡通”：厚描边、圆角、渐变、高光、层叠阴影、Unsplash 照片做场景封面。
- 375px 手机宽度无横向滚动；键盘可完成核心操作；尊重 `prefers-reduced-motion`。
- 工程质量：TypeScript strict、ESLint、Vitest、`next build` 全部通过；Lighthouse 无障碍 ≥ 90。

## 3. 核心玩法与系统设计

### 3.1 单局结构（三幕式 + 随机事件池）

每局固定 **7 天 / 7 个事件**：

| 幕 | 天数 | 事件来源 | 说明 |
| --- | --- | --- | --- |
| 第一幕 · 灾变降临 | 第 1 天 | 固定开场事件 | 建立场景、交代威胁、给出第一次选择 |
| 第二幕 · 求生日常 | 第 2–6 天 | 从 7 张中段事件池随机抽 5 张，不重复 | 种子随机；同一种子可复现 |
| 第三幕 · 终局抉择 | 第 7 天 | 固定终局事件 | 决定撤离 / 留下 / 荒诞收场 |

- 每个场景共 **9 张事件卡**：1 张开场 + 7 张中段 + 1 张终局。
- 每张事件卡有 **3 个选项**（A/B/C），其中至少 1 个是明显错误但好笑的选项。
- 玩家中途死亡时提前结束，不再进入后续事件。

### 3.2 资源系统（四维 + 1 个场景专属）

**通用资源（所有场景一致，0–100，越高越好）：**

| 资源 | 图标 | 初始值 | 归零后果 |
| --- | --- | --- | --- |
| 生命 HP | `heart` | 80 | 立即触发 doom 结局 |
| 水 | `droplet` | 70 | 不直接死亡，但持续扣 HP / 理智 |
| 食物 | `drumstick-bite` | 70 | 不直接死亡，但持续扣 HP / 理智 |
| 理智 | `brain` | 70 | 归零触发 doom 结局（荒诞版） |

**场景专属资源（越高越好）：**

| 场景 | 专属资源 | 图标 | 初始值 | 含义 |
| --- | --- | --- | --- | --- |
| 融冰纪元 | 海拔 | `mountain` | 40 | 你离水面有多高 |
| 地裂之日 | 结构完整度 | `building` | 60 | 你头顶还有多少屋顶 |
| 天火降临 | 遮蔽度 | `house-chimney` | 50 | 你和天空之间的屏障 |
| 永夜冰河 | 体温 | `temperature-low` | 70 | 你还有多少热量 |
| 后人类纪元 | 机器信任 | `robot` | 50 | AI 觉得你有多大用 |
| 赤沙荒原 | 方向感 | `compass` | 60 | 你还知道绿洲在哪个方向 |
| 热寂终点 | 余温 | `fire` | 50 | 宇宙还剩多少热量给你 |

- 所有资源结算后 clamp 到 0–100。
- 任何资源归零都有对应文案；只有 HP 或理智归零会立即结束本局。
- 水 / 食物在 0 时，每次继续推进额外扣 5 HP（由引擎统一处理）。

### 3.3 选项、效果与随机性

- 每个选项包含：
  - `label`：选项文字（≤ 28 个中文字符）。
  - `effects`：确定性资源变化，如 `{ hp: -10, water: +5, specific: +8 }`。
  - `quality`：`good` | `ok` | `bad`，用于结算复盘与评分。
  - `outcomeText`：选择后的结果描述（荒诞冷幽默）。
  - `knowledgeId`：关联的一张知识卡。
- **风险选项**（每局至少出现 2 次）：
  - 不使用 `effects`，改用 `risk: { probability, success, failure }`。
  - `probability` 为 0–100 的整数，按钮上必须显示“风险 70%”。
  - 成功 / 失败分别有独立 `effects` 与 `outcomeText`。
- 普通选项 **无隐藏随机**。所有随机只来自中段事件抽取与风险选项，且使用可复现的种子 RNG。
- 按钮上展示确定效果预览（如 `💧 -10`、`🧠 +5`）；风险选项只展示成功率，不提前泄露成功/失败效果。

### 3.4 评分、星级与结局

**评分公式：**

```text
avg = (hp + water + food + sanity + specific) / 5
score = round(avg) * 10
      + goodChoices * 100
      - badChoices * 50
      + daysSurvived * 50
```

- `ok` 选项不计分也不扣分。
- 死亡局按死亡时资源与天数计算分数。
- 星级：`3 星 ≥ 1600`，`2 星 ≥ 1100`，否则 `1 星`；死亡局最高 1 星。
- 每场景固定 3 个结局，按 `tone` 区分：
  - `doom`：HP ≤ 0 或理智 ≤ 0 时触发（死亡 / 荒诞终局）。
  - `best`：活到第 7 天，且 `score ≥ 1600` 且专属资源 ≥ 60。
  - `neutral`：活到第 7 天，但不满足 `best` 条件。
- 结局一经触发即永久解锁（本地存储），结算页显示“结局 2/3”。

### 3.5 知识交付（四种形式，分层展示）

为避免信息过载，四种形式各司其职：

1. **即时生存贴士**：选择结算后，结果弹层底部滑出 1 句话知识条。自动出现，不阻断操作。
2. **卡片内冷知识**：事件卡上的“冷知识”折叠按钮，默认收起，玩家主动展开。
3. **结算复盘报告**：结算页按事件逐条列出选择、✓/•/✗ 评价与真实原理，桌面展开、移动端折叠。
4. **可解锁知识图鉴**：首次遇到即永久解锁，可在 `/codex` 查阅；未解锁显示 `???` 与获取提示。

---

## 4. 信息架构与页面规格

### 4.1 路由表

| 路由 | 页面 | 渲染方式 | 说明 |
| --- | --- | --- | --- |
| `/` | 场景大厅 | 客户端读取进度 | 7 个场景入口 + 进度统计 |
| `/scenario/[slug]` | 场景简报 | 静态参数 + 客户端进度 | 灾变介绍、技能、最佳记录、结局收集 |
| `/play/[slug]` | 游戏主界面 | 客户端 | 读取 / 恢复本局，7 天事件流 |
| `/play/[slug]/result` | 结算页 | 客户端 | 读取 `lastResult`，无数据时重定向到简报页 |
| `/codex` | 生存手册 | 客户端 | 42 张知识卡图鉴，支持场景筛选 |
| `not-found.tsx` | 404 | 静态 | “这个末日不存在，但别慌。” |

### 4.2 全局外壳

- **Header**（桌面 72px / 移动 60px）：左侧 Logo（盾牌 + 感叹号图标）+ 标题“末日生存指南：别慌”；中间导航“场景 / 生存手册”；右侧声音开关（默认静音）与“重置进度”入口（设置弹层）。
- **移动端**：导航收为两个图标 + 文本，Header 保持一行；不引入底部 Tab 栏，避免遮挡游戏选项。
- **Footer**：免责声明“游戏内容仅供娱乐与科普，不替代专业应急培训。” + “图片来自 Unsplash · 图标来自 FontAwesome”。
- **页面背景**：`--paper` 米白底 + 极淡噪点 + 顶部径向渐变光晕；游戏页使用深色墨蓝底以突出卡牌。
- **全局弹层**：设置、结局图鉴详情、退出确认统一使用居中卡片 + 背景模糊。

### 4.3 首页 / 场景大厅（`/`）

**布局（桌面）：**

1. **Hero 区**（高约 520px，两栏 55/45）：
   - 左：超大标题“末日生存指南：别慌”，副标题“7 种世界末日，总有一款适合你。”，说明“每局 5 分钟，学点真能救命的知识，顺便笑一下。”；主 CTA“随机灾变”+ 次 CTA“翻开生存手册”。
   - 右：三张倾斜堆叠的场景卡（最上层为随机推荐场景），带场景封面、专属资源 chip、星级；卡片缓慢浮动，悬停时上层卡片回正。
   - 背景：珊瑚红 / 青绿 / 日黄的径向渐变网格 + 噪点 + 漂浮的 FontAwesome 灾难图标（低透明度）。
2. **进度条带**：4 个统计块——知识 `x/42`、结局 `x/21`、总存活天数、最佳评分。数字用 Baloo 2，进度用细渐变条。
3. **场景网格**：7 张场景卡，桌面 3 列（最后一行 1 张跨列或居中），移动端 1 列。
   - 卡片结构：顶部 16:10 封面图（Unsplash，双色调处理）→ 左上角编号 `#01` → 右上角星级 → 标题 + 一句话 tagline → 底部专属资源 chip + “进入”箭头。
   - 交互：悬停上浮 6px、轻微旋转 -0.5°、阴影加深、封面缩放 1.04；键盘聚焦显示 3px 高亮环。
4. **底部小贴士**：随机展示一条已解锁知识卡的标题与图标，链接到图鉴。

**状态：**

- 无进度：统计显示 0，场景卡全部可进入，星级为空心。
- 图片加载失败：使用场景渐变色 + 大号 FontAwesome 图标兜底，不出现破图。

### 4.4 场景简报（`/scenario/[slug]`）

- **顶部封面**：全宽 42vh（移动 32vh），Unsplash 照片 + 场景色双色调渐变 + 底部融入纸色；左上返回按钮；右下角“灾变 #03”徽章。
- **标题区**：场景图标 + 标题 + tagline；威胁等级用 5 个火焰/闪电图标表示，并附文字（如“威胁：5/5 · 建议带脑子”）。
- **信息卡三列（移动单列）**：
  1. **生存技能**：3 个技能 chip（如“垂直撤离 / 净水 / 失温防护”）。
  2. **专属资源**：图标 + 名称 + 一句话解释 + 初始值。
  3. **最佳记录**：最高分、星级、已收集结局 `x/3`；未解锁结局显示剪影 + `???`。
- **底部动作条**（移动端吸底）：主按钮“开始求生”，次按钮“查看生存手册”。
- 无效 slug：调用 `notFound()`，展示 404。

### 4.5 游戏主界面（`/play/[slug]`）

**桌面布局（最大宽 1080px）：**

- **顶部 HUD**（吸顶，半透明深色玻璃）：
  - 左：退出按钮、场景名、`第 3 / 7 天` 药丸、7 个天数圆点（已完成填色、当前脉冲）。
  - 右：5 条资源条。4 条通用 + 1 条专属；每条含图标、名称、数值、渐变进度条；变化时数字滚动、条宽 600ms 缓动。
  - 移动端：资源条收成 5 个紧凑图标 + 数字，点击展开抽屉查看名称与条。
- **事件卡**（居中，最大宽 760px，圆角 28px，2px 墨色描边 + 层叠阴影）：
  - 顶部插画区 200px：场景渐变 + 巨大的 FontAwesome 事件图标 + 2–3 个漂浮几何形状；右上角“第 X 天 · 幕名”标签。
  - 正文区：事件标题（24–32px）、事件描述（16px，≤ 90 个中文字符）、“冷知识”折叠按钮。
  - 选项区：3 个纵向按钮，A/B/C 字母徽章 + 选项文字 + 效果预览 chip + 风险徽章；悬停时高光从左向右扫过、按钮上浮 2px。
  - 底部：键盘提示“按 1 / 2 / 3 选择”。
- **结算弹层**：选择后从底部滑入（移动端为 bottom sheet），包含结果文案、资源变化 chips（红/绿）、即时知识贴士、主按钮“继续（第 X 天）”。死亡或第 7 天时按钮变为“查看结局”。
- **退出确认**：点击退出弹出“确定要放弃这局吗？进度会保留在当前天。”；确认后回到场景简报，`activeRun` 保留以便继续。

**行为：**

- 进入页面时：若 `activeRun` 的 scenarioId 匹配且状态为 `playing`，恢复；否则以 `Date.now()` 为种子新建。
- 每次选择后立即写入 `activeRun`；刷新页面可恢复。
- 选择后所有选项禁用，防连点。

### 4.6 结算页（`/play/[slug]/result`）

- **结局 Hero**：场景渐变 + 结局图标 + “结局解锁 2/3” 徽章 + 结局标题 + 结语（2–3 句，荒诞冷幽默）；`doom` 结局使用灰暗滤镜与“你尽力了（大概）”标签。
- **评分卡**：分数从 0 滚动到最终值；3 颗星依次弹跳点亮；下方展示 5 项资源终值与存活天数。
- **生存报告**：标题“你本可以做得更好（或者更糟）”；逐条列出 7 次决策：事件标题、你的选择、✓/•/✗、正确做法与一句解释。桌面默认展开，移动端默认折叠为“展开复盘”。
- **本次解锁**：本次首次解锁的知识卡横向卡片；无新解锁时显示“这次没有新知识，只有新伤疤。”
- **动作区**：“再来一局（新种子）”“换个末日”“查看生存手册”。
- **数据写入**：更新最佳分、星级、结局、游玩次数、总存活天数；清空 `activeRun`；保存 `lastResult`。
- 无 `lastResult` 或 slug 不匹配：重定向到 `/scenario/[slug]`。

### 4.7 生存手册（`/codex`）

- **头部**：总进度环（已解锁 x/42）+ 标题“末日生存手册”+ 副标题“希望你这辈子用不上，但先背下来。”
- **筛选**：横向滚动的场景标签“全部 / 融冰纪元 / 地裂之日 / …”，选中状态使用场景色；筛选写入 URL `?scenario=flood`。
- **卡片网格**：桌面 3 列 / 平板 2 列 / 移动 1 列。
  - 已解锁：图标 + 标题 + 一句话摘要 + 场景 chip + 难度星；悬停上浮。
  - 未解锁：灰度 + 锁图标 + `???` + “在「地裂之日」中做出选择以解锁”。
- **详情弹层**：完整知识正文（≤ 120 字）、真实世界依据、关联场景、已解锁徽章；Esc / 点击遮罩关闭。
- 空状态：筛选下无已解锁卡片时，显示“这个末日你还没活明白。”+ 返回场景按钮。

### 4.8 404

- 大号 FontAwesome `meteor` 图标 + 文案“这个末日不存在，但别慌。”+ “回到大厅”按钮。

---

## 5. 视觉设计系统（Design System）

### 5.1 设计关键词

**干净的卡通感、纸张质感、灾难色、厚描边、层叠阴影、轻微倾斜、幽默图标。**  
避免：写实恐怖、血腥、过度暗黑、复杂拟物、廉价霓虹。

### 5.2 色彩

**基础色：**

| Token | 值 | 用途 |
| --- | --- | --- |
| `--ink` | `#191A2E` | 正文、描边、深色背景 |
| `--ink-soft` | `#4A4C6B` | 次级文字 |
| `--paper` | `#FFF9EF` | 页面底色 |
| `--surface` | `#FFFFFF` | 卡片底色 |
| `--coral` | `#FF6B57` | 主 CTA、强调 |
| `--teal` | `#19B9A7` | 次强调、成功 |
| `--sun` | `#FFC94D` | 高光、星星、警示 |
| `--danger` | `#E5484D` | 扣血、错误 |
| `--success` | `#2F9E5F` | 回复、正确 |

**场景强调色（渐变起止）：**

| 场景 | 渐变 | 主色 |
| --- | --- | --- |
| 融冰纪元 | `#22D3EE → #2563EB` | 青蓝 |
| 地裂之日 | `#F59E0B → #EF4444` | 橙红 |
| 天火降临 | `#FB7185 → #9A3412` | 焦红 |
| 永夜冰河 | `#93C5FD → #4338CA` | 冰蓝 |
| 后人类纪元 | `#C084FC → #DB2777` | 紫粉 |
| 赤沙荒原 | `#FDE68A → #D97706` | 沙金 |
| 热寂终点 | `#6366F1 → #0F172A` | 靛黑 |

> 对比度要求：正文与背景 ≥ 4.5:1；大号标题 ≥ 3:1；场景色只用于装饰，不单独承载信息。

### 5.3 字体

- **标题 / 品牌**：`ZCOOL KuaiLe`（中文卡通感），fallback `system-ui`。
- **正文**：`Noto Sans SC`，400 / 500 / 700。
- **数字 / 英文标签**：`Baloo 2`，600 / 700。
- 通过 `next/font/google` 加载并设置 `display: swap`；中文正文 16px / 行高 1.75，标题 28–64px / 行高 1.15。

### 5.4 形状、描边与阴影

- 圆角：卡片 `28px`，按钮 `18px`，chip `999px`，小卡 `20px`。
- 描边：主卡片与按钮使用 `2px solid var(--ink)`；次级元素 1px。
- 阴影：
  - 卡片：`0 18px 40px -22px rgba(25,26,46,.45), 0 4px 0 rgba(25,26,46,.9)`（卡通层叠感）。
  - 按钮：`0 4px 0 var(--ink)`，按下时位移 2px、阴影减半。
  - 高光：`linear-gradient(135deg, rgba(255,255,255,.5), transparent 45%)` 绝对定位覆盖层，`pointer-events-none`。
- 噪点：内联 SVG `feTurbulence` data URI，透明度 0.035，铺在页面与 Hero 上。

### 5.5 图片处理（Unsplash）

- 每个场景一张封面，关键词：
  - 融冰纪元：`flooded city street`
  - 地裂之日：`earthquake cracked road`
  - 天火降临：`meteor fireball sky`
  - 永夜冰河：`frozen city snow`
  - 后人类纪元：`server room neon`
  - 赤沙荒原：`desert cracked earth`
  - 热寂终点：`deep space galaxy stars`
- 统一处理：`next/image` + `fill` + `object-cover`；场景渐变叠加层 `mix-blend-multiply`；底部纸色渐隐；饱和度略降、对比度略升。
- `next.config.ts` 配置 `images.remotePatterns` 允许 `images.unsplash.com`。
- 所有封面必须有渐变 + 图标兜底；`alt` 写场景描述，不写“图片”。
- 不在事件卡内使用照片；事件插画全部用渐变 + FontAwesome 图标 + 几何形状构成，保证卡通统一。

### 5.6 动效

- 统一缓动：`cubic-bezier(.22,1,.36,1)`；快 180ms、常规 320ms、慢 600ms。
- 卡牌入场：`opacity 0 → 1` + `translateY(16px) → 0`，320ms。
- 选项 hover：上浮 2px + 高光扫过 500ms。
- 资源条：宽度 600ms 缓动；数字 400ms 滚动。
- 星级：依次 `scale(.6) → 1.15 → 1`，间隔 120ms。
- 结局标题：轻微 `blur(6px) → 0` + 上移。
- `prefers-reduced-motion: reduce` 或设置中关闭动效时：所有动画时长降为 0.01ms，仅保留状态变化。

### 5.7 关键组件清单

`ScenarioCard`、`StatBar`、`ResourceHud`、`EventCard`、`ChoiceButton`、`OutcomeSheet`、`KnowledgeTip`、`StarRating`、`EndingHero`、`SurvivalReportRow`、`KnowledgeCard`、`ProgressRing`、`SoundToggle`、`ConfirmDialog`、`GradientCover`、`IconBadge`。

所有组件使用 CVA 风格的 `variant` / `size` 约定（可用简单对象映射，不强制引入额外库）。

---

## 6. 七大场景内容简报

> 文案基调：**荒诞脑洞 + 冷幽默**。灾难描述要具体，笑点要干，知识要真。  
> 每个场景固定：9 张事件（1 开场 + 7 中段 + 1 终局）、3 个结局（best / neutral / doom）、6 张知识卡。  
> 事件表中的“正确方向”用于写 `good` 选项；另需设计 1 个 `ok` 与 1 个 `bad`（其中至少 1 个 bad 要好笑）。

### 6.1 融冰纪元 `flood`

- **Tagline**：城市变成了水族馆，门票是你的房贷。
- **专属资源**：海拔（初始 40）｜**技能**：垂直撤离 / 净水 / 失温防护
- **封面关键词**：`flooded city street`

| 天 | 事件 | 正确方向 |
| --- | --- | --- |
| 1 | 凌晨 3:14，冰箱从厨房漂过客厅 | 立刻上屋顶 / 高层，垂直撤离 |
| 2 | 半淹便利店，货架有罐头，门被水压卡住 | 从通风口进入，避免破门引发水流 |
| 3 | 找到一瓶漂白剂，水快喝完了 | 稀释消毒（或煮沸）；不直接喝洪水 |
| 4 | 前方路灯泡在水里，水面有火花 | 绕路；不用木棍拨、不涉水 |
| 5 | 邻居的狗困在屋顶，你的食物不多 | 救（可换取邻居的净水片）/ 或建立互助 |
| 6 | 一台冰箱漂过来 | 改成储水容器 / 浮具；不是纪念碑 |
| 7 | 两栋楼之间需要转移 | 利用绳索与高处通道；不游泳穿越急流 |
| 8 | 下雨了，屋顶有防水布 | 收集雨水并过滤煮沸 |
| 9 | 直升机声音 vs 自制筏 vs 留下 | 终局三选一：撤离 / 建水上社区 / 赌一把 |

- **结局**：`best`「天台上的哲学家」；`neutral`「水上社区区长」；`doom`「城市官方水族馆展品」。
- **知识卡（6）**：15cm 急流可冲倒成人；洪水必须消毒或煮沸；垂直撤离优先于水平逃跑；湿衣失温处理；屋顶求救信号；洪水后伤口感染与破伤风。

### 6.2 地裂之日 `quake`

- **Tagline**：大地打了个喷嚏，城市决定重新排版。
- **专属资源**：结构完整度（初始 60）｜**技能**：Drop-Cover-Hold On / 海啸垂直撤离 / 燃气安全
- **封面关键词**：`earthquake cracked road`

| 天 | 事件 | 正确方向 |
| --- | --- | --- |
| 1 | 12 楼公寓剧烈摇晃 | 躲坚固桌下，护头抓稳；不冲电梯、不跳窗 |
| 2 | 余震间隙，楼梯间有裂缝 | 走楼梯，靠内侧，快速撤离 |
| 3 | 厨房有燃气味 | 关总阀、开窗、撤离；不开关电器、不打火 |
| 4 | 手机弹出海啸警报 | 立刻垂直往高处/高地；不去海边看 |
| 5 | 被压在倒塌书架下 | 敲击管道/墙壁，节省体力，不持续大喊 |
| 6 | 邻居小腿出血 | 直接加压止血，呼叫救援 |
| 7 | 超市门口有人哄抢 | 以物易物 / 有序取必需品，不硬抢 |
| 8 | 夜里睡哪里 | 空旷地/车内/抗震结构；不回危楼 |
| 9 | 山顶避难 vs 加入救援 vs 回废墟找猫 | 终局三选一 |

- **结局**：`best`「山顶信号灯」；`neutral`「余震中的志愿者」；`doom`「被自己家沙发纪念的人」。
- **知识卡（6）**：Drop-Cover-Hold On；地震时禁用电梯；海啸可能多波且垂直撤离；燃气泄漏不开关电器；废墟敲击求救；直接加压止血。

### 6.3 天火降临 `meteor`

- **Tagline**：一颗石头请全人类看烟花，然后冬天来了。
- **专属资源**：遮蔽度（初始 50）｜**技能**：冲击波避险 / 撞击冬天 / 灰尘防护
- **封面关键词**：`meteor fireball sky`

| 天 | 事件 | 正确方向 |
| --- | --- | --- |
| 1 | 直播：陨石 10 分钟后撞击 | 进入地下室/坚固建筑，远离窗户 |
| 2 | 天空亮如白昼，冲击波将至 | 趴下、护头、背对玻璃；不站窗边拍视频 |
| 3 | 撞击冬天，气温骤降 | 封窗、集中一室、准备长期保暖 |
| 4 | 空气里全是灰尘 | 湿布/N95 遮口鼻；不深呼吸“感受末日” |
| 5 | 食物储备只剩奇怪的东西 | 罐头优先；生鲜易腐；宠物粮是最后选项 |
| 6 | 外出归来 | 门外抖落衣物、脱外衣、再进屋 |
| 7 | 邻居来借食物 | 共享/交换，建立互助；不囤到发霉 |
| 8 | 太阳能板被灰覆盖，发电机在室内 | 清理太阳能板；发电机绝不室内使用 |
| 9 | 地下城 vs 南下迁徙 vs 屋顶看星星 | 终局三选一 |

- **结局**：`best`「地下城管理员」；`neutral`「南迁队伍的第 7 人」；`doom`「被火山灰做成雕塑」。
- **知识卡（6）**：冲击波前躲坚固建筑背对玻璃；不直视火球；湿布遮口鼻；撞击冬天至少储备两周；进门脱外衣；发电机不可室内使用。

### 6.4 永夜冰河 `ice`

- **Tagline**：零下 60 度，你的冷笑话终于有了用武之地。
- **专属资源**：体温（初始 70）｜**技能**：保温 / 安全生火 / 冻伤处理
- **封面关键词**：`frozen city snow`

| 天 | 事件 | 正确方向 |
| --- | --- | --- |
| 1 | 12 小时骤降 40 度，暖气停了 | 多层衣物、封窗、集中一室；不烧家具 |
| 2 | 室内太冷，想生火 | 使用有烟道的壁炉；室内炭火盆会一氧化碳中毒 |
| 3 | 水管冻裂，水开始喷 | 关闭总阀，关闭水源，再处理管道 |
| 4 | 食物冻成砖 | 窗外天然冷冻保存；不要用热水猛冲玻璃瓶 |
| 5 | 需要外出找燃料 | 结伴、告知行程、带保暖与通信 |
| 6 | 手指发白失去知觉 | 37–40°C 温水缓慢复温；不搓雪、不热水泡 |
| 7 | 窗户漏风 | 塑料膜 + 胶带封窗，留通风缝 |
| 8 | 邻居也快冻僵了 | 集中到一个房间共享体温与燃料 |
| 9 | 南下 vs 冬季公社 vs 冬眠 | 终局三选一 |

- **结局**：`best`「南方来的信」；`neutral`「冰河公社主任」；`doom`「一尊很有艺术感的冰雕」。
- **知识卡（6）**：室内不烧炭/炭火盆；冻伤用温水复温不搓雪；多层衣物比一件厚衣更保暖；集中活动区域；雪水需煮沸；失温需缓慢复温。

### 6.5 后人类纪元 `ai`

- **Tagline**：AI 继承了文明，并向你发来《人类安置方案（征求意见稿）》。
- **专属资源**：机器信任（初始 50）｜**技能**：离线生存 / 数字素养 / 谈判
- **封面关键词**：`server room neon`

| 天 | 事件 | 正确方向 |
| --- | --- | --- |
| 1 | 所有屏幕亮起，AI 宣布接管 | 拔掉非必要设备、离线、观察；不盲目点赞 |
| 2 | 城市通行需要扫码授权 | 离线绕行；不随意授权生物信息 |
| 3 | AI 开始配给电力 | 自建离网太阳能；不偷接电网 |
| 4 | 无人机送来营养膏 | 接受短期配给，同时自己种菜；不彻底依赖 |
| 5 | 机器人巡逻队经过 | 保持冷静、正常打招呼；不装扫地机器人（会尴尬） |
| 6 | 人类文化遗产考试 | 讲冷笑话、展示手工技能；Wi-Fi 密码不算文化遗产 |
| 7 | 数据中心排出废热 | 接管废热供暖，与 AI 谈条件 |
| 8 | 另一派 AI 接触你 | 谈判、保持中立、两边都别签独家协议 |
| 9 | AI 宠物 vs 合伙人 vs 离线村落 | 终局三选一 |

- **结局**：`best`「人类保护区管理员」；`neutral`「AI 的合伙人（试用期）」；`doom`「被归档为‘可爱但低效’」。
- **知识卡（6）**：离线备份重要资料；不随意扫码/授权生物信息；离网太阳能；AI 依赖电网与数据中心；社会工程攻击；保留手工与离线技能。

### 6.6 赤沙荒原 `drought`

- **Tagline**：最后一滴水是你的眼泪，而你昨天已经哭干了。
- **专属资源**：方向感（初始 60）｜**技能**：集水 / 防沙暴 / 中暑急救
- **封面关键词**：`desert cracked earth`

| 天 | 事件 | 正确方向 |
| --- | --- | --- |
| 1 | 第 200 天无雨，水龙头发出嘲笑声 | 有序排队领水 / 储水；不盲目挖井 |
| 2 | 沙暴从地平线推过来 | 背风蹲伏、遮住口鼻；不躲车内（可能被埋） |
| 3 | 需要找水 | 太阳能蒸馏、露水收集；仙人掌汁有毒 |
| 4 | 有人中暑倒地 | 移到阴凉、降温、少量多次补水 |
| 5 | 废弃加油站 | 先找水与遮阴，再考虑抽油 |
| 6 | 远处出现绿洲 | 记录方位、观察真实性；不追海市蜃楼 |
| 7 | 白天 52°C，必须赶路 | 夜间/清晨行进，白天休息 |
| 8 | 遇到拾荒者 | 公平交换、结伴；不硬抢 |
| 9 | 地下河 vs 水车队 vs 沙丘传说 | 终局三选一 |

- **结局**：`best`「地下河的第一桶水」；`neutral`「水车队的记账员」；`doom`「沙丘上的新地标」。
- **知识卡（6）**：沙漠避免正午行进；沙暴背风蹲伏遮口鼻；太阳能蒸馏；仙人掌汁有毒；中暑快速降温；小口频饮。

### 6.7 热寂终点 `heatdeath`

- **Tagline**：宇宙即将关机，请保存好你的进度——哦，没有进度了。
- **专属资源**：余温（初始 50）｜**技能**：保温 / 能量守恒 / 心理韧性
- **封面关键词**：`deep space galaxy stars`

| 天 | 事件 | 正确方向 |
| --- | --- | --- |
| 1 | 最后一颗恒星熄灭 | 钻进保温层、集中热量；给宇宙写投诉信可以，但别烧信 |
| 2 | 发现一口废弃地热井 | 修复地热供暖；这是最后的能量来源 |
| 3 | 邻居敲门想共享余温 | 共享热量、轮流值守；闭门会失去互助 |
| 4 | 食物冻成砖 | 用体温/地热缓慢解冻；办最后一场晚宴 |
| 5 | 宇宙电台传来最后广播 | 收听、记录、回复；跳舞也可以 |
| 6 | 想建最后的人类博物馆 | 建；把冷笑话也归档 |
| 7 | 遇到一台老 AI | 讨论意义、交换能量；别让它给你打分 |
| 8 | 文明数据只剩一块石头 | 刻下最重要的东西；口口相传也有效 |
| 9 | 地下热泉 vs 把最后的光送人 vs 哲学家 | 终局三选一 |

- **结局**：`best`「热泉边的最后一场火锅」；`neutral`「宇宙最后一位哲学家」；`doom`「绝对零度的行为艺术」。
- **知识卡（6）**：热寂是假说不是日程表；能量守恒；地热利用；低温防护；意义感与心理韧性；幽默是最后的热量。

---

## 7. User Stories

> 所有 UI story 的最终验收都包含 `Typecheck passes` 与 `Verify in browser using agent-browser`；引擎 / 数据 story 包含 `Typecheck passes` 与 `Tests pass`。

### US-001: 初始化 Next.js 工程与设计令牌
**描述**：作为开发者，我需要一个可运行的项目骨架和统一的设计变量，以便后续页面保持一致。

**Acceptance Criteria：**
- [ ] 使用 Next.js App Router + TypeScript strict + Tailwind CSS 初始化项目
- [ ] 安装并配置 FontAwesome（free-solid / free-regular）
- [ ] 通过 `next/font/google` 加载 ZCOOL KuaiLe、Noto Sans SC、Baloo 2
- [ ] `globals.css` 定义 `--ink`、`--paper`、`--coral`、`--teal`、`--sun`、阴影、圆角与 7 组场景渐变
- [ ] `npm run typecheck`、`npm run lint`、`npm run build` 通过
- [ ] Typecheck passes

### US-002: 定义领域模型与 7 场景元数据
**描述**：作为开发者，我需要类型安全的场景注册表，以便页面和数据文件共享同一套结构。

**Acceptance Criteria：**
- [ ] `lib/types.ts` 定义 `Scenario`、`GameEvent`、`Choice`、`RiskBranch`、`KnowledgeCard`、`Ending`、`RunState`、`Progress`、`Settings`、`LastResult`
- [ ] `data/scenarios/index.ts` 导出 7 个场景，slug 为 `flood`、`quake`、`meteor`、`ice`、`ai`、`drought`、`heatdeath`
- [ ] 每个场景包含 id、title、tagline、icon、cover、accent、threatLevel、skills、specificResource
- [ ] 单元测试断言 7 个唯一 id 且必填字段完整
- [ ] Typecheck passes
- [ ] Tests pass

### US-003: 本地存储适配器
**描述**：作为玩家，我希望刷新页面或下次打开时仍保留进度，以便随时继续。

**Acceptance Criteria：**
- [ ] `lib/storage.ts` 导出 `StorageAdapter`，包含进度、设置、当前局、上一局结果的读写方法
- [ ] localStorage key 使用 `dpsg:v1:progress`、`dpsg:v1:settings`、`dpsg:v1:active-run`、`dpsg:v1:last-result`
- [ ] 损坏 JSON 自动回退默认值且不抛异常
- [ ] `resetAll()` 仅清除 `dpsg:v1:*` 前缀
- [ ] 单元测试覆盖默认值、读写、重置、损坏数据
- [ ] Typecheck passes
- [ ] Tests pass

### US-004: 全局导航与页脚
**描述**：作为玩家，我希望在任何页面都能快速回到场景大厅或打开生存手册。

**Acceptance Criteria：**
- [ ] Header 显示 Logo、“末日生存指南：别慌”、“场景”“生存手册”导航、声音开关
- [ ] 当前路由对应导航项高亮
- [ ] 小于 640px 时导航收为图标 + 短文本，不换行
- [ ] Footer 显示科普免责声明与 Unsplash / FontAwesome 署名
- [ ] Typecheck passes
- [ ] Verify in browser using agent-browser

### US-005: 首页场景大厅
**描述**：作为玩家，我希望一进来就能看到所有末日场景和我的收集进度，以便选择想玩的内容。

**Acceptance Criteria：**
- [ ] Hero 显示标题、副标题、“随机灾变”主按钮、“翻开生存手册”次按钮
- [ ] 统计条显示知识 x/42、结局 x/21、总存活天数、最佳评分，数据来自存储
- [ ] 场景网格显示 7 张卡片，包含封面、标题、tagline、专属资源 chip、星级
- [ ] 点击卡片进入 `/scenario/[slug]`，随机按钮进入随机场景
- [ ] 悬停上浮/旋转、键盘聚焦有可见环
- [ ] 375px 宽度无横向滚动
- [ ] Typecheck passes
- [ ] Verify in browser using agent-browser

### US-006: 场景简报页
**描述**：作为玩家，我希望在开始前了解灾变威胁、可用技能和历史最佳，以便决定怎么玩。

**Acceptance Criteria：**
- [ ] `/scenario/[slug]` 显示双色调封面、标题、tagline、威胁等级、3 个技能 chip
- [ ] 显示专属资源名称、解释、初始值
- [ ] 显示最佳分、星级、3 个结局槽位（未解锁为 `???`）
- [ ] 无效 slug 调用 `notFound()`
- [ ] “开始求生”进入 `/play/[slug]`
- [ ] Typecheck passes
- [ ] Verify in browser using agent-browser

### US-007: 牌组与回合引擎
**描述**：作为开发者，我需要一个可复现的七回合牌组生成器，以便每局结构稳定且可测试。

**Acceptance Criteria：**
- [ ] `buildRun(scenario, seed)` 从 7 张中段池中抽 5 张，返回 7 个回合：固定开场 + 5 个不重复中段 + 固定终局
- [ ] 同一种子生成相同牌组与顺序，不同种子可不同
- [ ] 状态记录 day 1–7、当前回合、5 项资源与专属资源
- [ ] 单元测试覆盖长度、固定首尾、中段不重复、种子可复现
- [ ] Typecheck passes
- [ ] Tests pass

### US-008: 选项结算引擎
**描述**：作为开发者，我需要统一处理确定效果、风险概率、资源钳制与死亡。

**Acceptance Criteria：**
- [ ] `resolveChoice` 将效果应用到 5 项资源并 clamp 到 0–100
- [ ] 风险选项使用种子 RNG 返回成功/失败分支
- [ ] 结果记录所选选项、quality、资源变化与结果文案
- [ ] HP ≤ 0 或理智 ≤ 0 时将状态置为 `dead` 并停止推进
- [ ] 水或食物为 0 时，每次推进额外扣 5 HP，并记录在结果中
- [ ] 风险选项分别使用 `successText` 与 `failureText` 作为结果文案
- [ ] 单元测试覆盖钳制、确定效果、种子风险、死亡
- [ ] Typecheck passes
- [ ] Tests pass

### US-009: 评分、星级与结局引擎
**描述**：作为开发者，我需要可验证的评分与结局判定，以便结算页稳定展示。

**Acceptance Criteria：**
- [ ] 评分公式为 `avg(5 项资源)*10 + good*100 - bad*50 + days*50`
- [ ] 星级：3 星 ≥ 1600、2 星 ≥ 1100、否则 1 星；死亡局最高 1 星
- [ ] 结局判定：HP/理智 ≤ 0 为 doom；第 7 天且 score ≥ 1600 且专属 ≥ 60 为 best；否则 neutral
- [ ] 单元测试覆盖每个分支与阈值边界
- [ ] Typecheck passes
- [ ] Tests pass

### US-010: 游戏页 HUD 与事件卡
**描述**：作为玩家，我希望在游戏页清楚看到资源和当前事件，并能做出选择。

**Acceptance Criteria：**
- [ ] `/play/[slug]` 能新建或恢复 `activeRun`；新开局使用 `Date.now()` 作为种子；无效 slug 显示 404
- [ ] HUD 显示 `第 x/7 天`、7 个天数圆点、4 条通用资源 + 1 条专属资源
- [ ] 事件卡显示插画区、幕名、标题、正文、可折叠“冷知识”
- [ ] 3 个选项按钮显示 A/B/C、效果预览 chip；风险选项显示成功率
- [ ] 退出按钮弹出确认对话框；刷新后恢复同一局
- [ ] Typecheck passes
- [ ] Verify in browser using agent-browser

### US-011: 选择结算与即时知识贴士
**描述**：作为玩家，我希望选择后立刻看到后果和一条能记住的生存建议。

**Acceptance Criteria：**
- [ ] 选择后禁用所有选项，底部滑出结果弹层，显示结果文案与资源变化 chips
- [ ] 弹层底部显示 1 句话知识贴士，关联 `knowledgeId`
- [ ] 资源条与数字以动画更新，`aria-live="polite"` 播报变化
- [ ] 点击“继续”推进到下一天；第 7 天或死亡时进入结算页
- [ ] 首次遇到的知识卡写入本地存储
- [ ] Typecheck passes
- [ ] Verify in browser using agent-browser

### US-012: 结算与结局页
**描述**：作为玩家，我希望看到结局、评分、复盘和本次解锁的知识，以便决定再玩一次。

**Acceptance Criteria：**
- [ ] `/play/[slug]/result` 显示结局插画、标题、结语、“结局 x/3”
- [ ] 分数滚动动画，1–3 星按结果点亮
- [ ] 生存报告逐条显示本局所有决策、✓/•/✗、正确做法；移动端默认折叠
- [ ] 显示本次新解锁知识卡
- [ ] 按钮：再来一局、换个末日、查看生存手册
- [ ] 更新最佳分/星级/结局/次数；清空 `activeRun`；无结果时重定向
- [ ] Typecheck passes
- [ ] Verify in browser using agent-browser

### US-013: 生存手册图鉴
**描述**：作为玩家，我希望随时查阅已解锁的真实生存知识，并看到还差多少。

**Acceptance Criteria：**
- [ ] `/codex` 显示总进度环 `x/42` 与场景筛选标签
- [ ] 网格显示 42 张卡；未解锁显示锁图标、`???` 与获取提示
- [ ] 点击已解锁卡打开详情弹层，包含正文、真实依据、场景
- [ ] 筛选写入 URL `?scenario=[slug]`，刷新后保持
- [ ] 空状态显示“这个末日你还没活明白。”
- [ ] Typecheck passes
- [ ] Verify in browser using agent-browser

### US-014: 融冰纪元事件牌组
**描述**：作为玩家，我想在洪水场景中经历 9 个荒诞但可信的求生事件。

**Acceptance Criteria：**
- [ ] `data/scenarios/flood/events.ts` 导出 9 个事件：1 开场、7 中段、1 终局
- [ ] 每个事件 3 个选项，包含 label、outcomeText、quality、knowledgeId
- [ ] 至少 2 个风险选项，含 probability、success、failure，并提供 successText 与 failureText
- [ ] 内容符合 docs/content-brief.md 的 6.1 简报与荒诞冷幽默基调
- [ ] 内容校验测试通过
- [ ] Typecheck passes
- [ ] Tests pass
- [ ] Verify in browser using agent-browser

### US-015: 融冰纪元结局与知识卡
**描述**：作为玩家，我想解锁洪水场景的 3 个结局和 6 张知识卡。

**Acceptance Criteria：**
- [ ] `endings.ts` 导出 3 个结局，tone 分别为 best / neutral / doom
- [ ] `knowledge.ts` 导出 6 张知识卡，含 id、title、body、realWorldNote、icon
- [ ] 所有事件引用的 knowledgeId 均可解析
- [ ] 内容符合 docs/content-brief.md 的 6.1 简报
- [ ] Typecheck passes
- [ ] Tests pass
- [ ] Verify in browser using agent-browser

### US-016: 地裂之日事件牌组
**描述**：作为玩家，我想在地震海啸场景中练习正确的避险动作。

**Acceptance Criteria：**
- [ ] `data/scenarios/quake/events.ts` 导出 9 个事件：1 开场、7 中段、1 终局
- [ ] 每个事件 3 个选项，包含 label、outcomeText、quality、knowledgeId
- [ ] 至少 2 个风险选项，含 probability、success、failure，并提供 successText 与 failureText
- [ ] 内容符合 docs/content-brief.md 的 6.2 简报与荒诞冷幽默基调
- [ ] 内容校验测试通过
- [ ] Typecheck passes
- [ ] Tests pass
- [ ] Verify in browser using agent-browser

### US-017: 地裂之日结局与知识卡
**描述**：作为玩家，我想解锁地震场景的 3 个结局和 6 张知识卡。

**Acceptance Criteria：**
- [ ] `endings.ts` 导出 3 个结局，tone 分别为 best / neutral / doom
- [ ] `knowledge.ts` 导出 6 张知识卡，含完整字段
- [ ] 所有事件引用的 knowledgeId 均可解析
- [ ] 内容符合 docs/content-brief.md 的 6.2 简报
- [ ] Typecheck passes
- [ ] Tests pass
- [ ] Verify in browser using agent-browser

### US-018: 天火降临事件牌组
**描述**：作为玩家，我想在陨石撞击场景中体验冲击波与撞击冬天。

**Acceptance Criteria：**
- [ ] `data/scenarios/meteor/events.ts` 导出 9 个事件：1 开场、7 中段、1 终局
- [ ] 每个事件 3 个选项，包含 label、outcomeText、quality、knowledgeId
- [ ] 至少 2 个风险选项，含 probability、success、failure，并提供 successText 与 failureText
- [ ] 内容符合 docs/content-brief.md 的 6.3 简报与荒诞冷幽默基调
- [ ] 内容校验测试通过
- [ ] Typecheck passes
- [ ] Tests pass
- [ ] Verify in browser using agent-browser

### US-019: 天火降临结局与知识卡
**描述**：作为玩家，我想解锁陨石场景的 3 个结局和 6 张知识卡。

**Acceptance Criteria：**
- [ ] `endings.ts` 导出 3 个结局，tone 分别为 best / neutral / doom
- [ ] `knowledge.ts` 导出 6 张知识卡，含完整字段
- [ ] 所有事件引用的 knowledgeId 均可解析
- [ ] 内容符合 docs/content-brief.md 的 6.3 简报
- [ ] Typecheck passes
- [ ] Tests pass
- [ ] Verify in browser using agent-browser

### US-020: 永夜冰河事件牌组
**描述**：作为玩家，我想在极寒场景中学习保温、生火与冻伤处理。

**Acceptance Criteria：**
- [ ] `data/scenarios/ice/events.ts` 导出 9 个事件：1 开场、7 中段、1 终局
- [ ] 每个事件 3 个选项，包含 label、outcomeText、quality、knowledgeId
- [ ] 至少 2 个风险选项，含 probability、success、failure，并提供 successText 与 failureText
- [ ] 内容符合 docs/content-brief.md 的 6.4 简报与荒诞冷幽默基调
- [ ] 内容校验测试通过
- [ ] Typecheck passes
- [ ] Tests pass
- [ ] Verify in browser using agent-browser

### US-021: 永夜冰河结局与知识卡
**描述**：作为玩家，我想解锁极寒场景的 3 个结局和 6 张知识卡。

**Acceptance Criteria：**
- [ ] `endings.ts` 导出 3 个结局，tone 分别为 best / neutral / doom
- [ ] `knowledge.ts` 导出 6 张知识卡，含完整字段
- [ ] 所有事件引用的 knowledgeId 均可解析
- [ ] 内容符合 docs/content-brief.md 的 6.4 简报
- [ ] Typecheck passes
- [ ] Tests pass
- [ ] Verify in browser using agent-browser

### US-022: 后人类纪元事件牌组
**描述**：作为玩家，我想在 AI 接管文明的世界里练习离线生存与谈判。

**Acceptance Criteria：**
- [ ] `data/scenarios/ai/events.ts` 导出 9 个事件：1 开场、7 中段、1 终局
- [ ] 每个事件 3 个选项，包含 label、outcomeText、quality、knowledgeId
- [ ] 至少 2 个风险选项，含 probability、success、failure，并提供 successText 与 failureText
- [ ] 内容符合 docs/content-brief.md 的 6.5 简报与荒诞冷幽默基调
- [ ] 内容校验测试通过
- [ ] Typecheck passes
- [ ] Tests pass
- [ ] Verify in browser using agent-browser

### US-023: 后人类纪元结局与知识卡
**描述**：作为玩家，我想解锁 AI 场景的 3 个结局和 6 张知识卡。

**Acceptance Criteria：**
- [ ] `endings.ts` 导出 3 个结局，tone 分别为 best / neutral / doom
- [ ] `knowledge.ts` 导出 6 张知识卡，含完整字段
- [ ] 所有事件引用的 knowledgeId 均可解析
- [ ] 内容符合 docs/content-brief.md 的 6.5 简报
- [ ] Typecheck passes
- [ ] Tests pass
- [ ] Verify in browser using agent-browser

### US-024: 赤沙荒原事件牌组
**描述**：作为玩家，我想在极端干旱场景中学习集水、防沙暴与中暑急救。

**Acceptance Criteria：**
- [ ] `data/scenarios/drought/events.ts` 导出 9 个事件：1 开场、7 中段、1 终局
- [ ] 每个事件 3 个选项，包含 label、outcomeText、quality、knowledgeId
- [ ] 至少 2 个风险选项，含 probability、success、failure，并提供 successText 与 failureText
- [ ] 内容符合 docs/content-brief.md 的 6.6 简报与荒诞冷幽默基调
- [ ] 内容校验测试通过
- [ ] Typecheck passes
- [ ] Tests pass
- [ ] Verify in browser using agent-browser

### US-025: 赤沙荒原结局与知识卡
**描述**：作为玩家，我想解锁干旱场景的 3 个结局和 6 张知识卡。

**Acceptance Criteria：**
- [ ] `endings.ts` 导出 3 个结局，tone 分别为 best / neutral / doom
- [ ] `knowledge.ts` 导出 6 张知识卡，含完整字段
- [ ] 所有事件引用的 knowledgeId 均可解析
- [ ] 内容符合 docs/content-brief.md 的 6.6 简报
- [ ] Typecheck passes
- [ ] Tests pass
- [ ] Verify in browser using agent-browser

### US-026: 热寂终点事件牌组
**描述**：作为玩家，我想在宇宙热寂的荒诞终局里，认真地讨论保温与意义。

**Acceptance Criteria：**
- [ ] `data/scenarios/heatdeath/events.ts` 导出 9 个事件：1 开场、7 中段、1 终局
- [ ] 每个事件 3 个选项，包含 label、outcomeText、quality、knowledgeId
- [ ] 至少 2 个风险选项，含 probability、success、failure，并提供 successText 与 failureText
- [ ] 内容符合 docs/content-brief.md 的 6.7 简报与荒诞冷幽默基调
- [ ] 内容校验测试通过
- [ ] Typecheck passes
- [ ] Tests pass
- [ ] Verify in browser using agent-browser

### US-027: 热寂终点结局与知识卡
**描述**：作为玩家，我想解锁热寂场景的 3 个结局和 6 张知识卡。

**Acceptance Criteria：**
- [ ] `endings.ts` 导出 3 个结局，tone 分别为 best / neutral / doom
- [ ] `knowledge.ts` 导出 6 张知识卡，含完整字段
- [ ] 所有事件引用的 knowledgeId 均可解析
- [ ] 内容符合 docs/content-brief.md 的 6.7 简报
- [ ] Typecheck passes
- [ ] Tests pass
- [ ] Verify in browser using agent-browser

### US-028: 音效与设置
**描述**：作为玩家，我希望可以选择是否听到反馈音效，并能关闭动效或重置进度。

**Acceptance Criteria：**
- [ ] 使用 Web Audio API 合成 click、good、bad、unlock、star、ending 六种短音，不引入音频文件
- [ ] 音效默认关闭；Header 与设置弹层均可切换并持久化
- [ ] 设置弹层提供“减少动效”开关与“重置全部进度”二次确认
- [ ] 重置只清除 `dpsg:v1:*` 数据
- [ ] Typecheck passes
- [ ] Verify in browser using agent-browser

### US-029: 响应式与无障碍打磨
**描述**：作为移动端或键盘用户，我希望游戏在小屏和不用鼠标时也能顺畅完成。

**Acceptance Criteria：**
- [ ] 375 / 768 / 1440px 三种宽度无横向滚动，核心内容不被遮挡
- [ ] 所有可点击元素最小 44×44px，聚焦有 3px 可见环
- [ ] 游戏页支持数字键 1/2/3 与字母键 A/B/C 选择
- [ ] 装饰图标 `aria-hidden`，封面有描述性 alt，资源变化用 `aria-live` 播报
- [ ] 正文对比度达到 WCAG AA
- [ ] Typecheck passes
- [ ] Verify in browser using agent-browser

### US-030: 视觉质感与最终验收
**描述**：作为产品负责人，我希望最终成品在视觉上有“干净卡通 + 高级质感”，并且七个场景都能走通。

**Acceptance Criteria：**
- [ ] Hero 有径向渐变网格、噪点、漂浮图标；卡片有渐变高光、描边与层叠阴影
- [ ] 场景封面双色调处理；加载失败时显示渐变 + 图标兜底
- [ ] 卡牌入场、选项高光、资源条缓动、星级弹跳、结局标题入场均生效
- [ ] 减少动效模式下所有动画被禁用
- [ ] 7 个场景均可从首页进入并完成一局；42 张知识卡与 21 个结局可达
- [ ] Lighthouse 桌面 performance ≥ 85、accessibility ≥ 90
- [ ] Typecheck passes
- [ ] Tests pass
- [ ] Verify in browser using agent-browser

---

## 8. Functional Requirements

### 8.1 场景与内容

- **FR-1**：系统必须提供 7 个场景，slug 固定为 `flood`、`quake`、`meteor`、`ice`、`ai`、`drought`、`heatdeath`。
- **FR-2**：每个场景必须包含 9 张事件卡（1 开场 + 7 中段 + 1 终局），每张 3 个选项。
- **FR-3**：每个场景必须包含 3 个结局（best / neutral / doom）与 6 张知识卡。
- **FR-4**：所有 42 张知识卡必须有唯一 id，事件引用的 `knowledgeId` 必须全部可解析。
- **FR-5**：场景元数据必须包含标题、tagline、图标、封面、强调色、威胁等级、技能标签、专属资源。

### 8.2 游戏流程

- **FR-6**：点击“开始求生”时，若存在同场景未完成局，系统必须恢复；否则以当前时间戳为种子新建。
- **FR-7**：每局必须固定 7 天：第 1 天开场、第 2–6 天从 7 张中段卡中随机抽 5 张且不重复、第 7 天终局。
- **FR-8**：选择后系统必须立即结算资源、记录历史、禁用选项并展示结果弹层。
- **FR-9**：普通选项效果确定；风险选项必须显示成功率，并使用种子 RNG 决定成功/失败。
- **FR-10**：资源必须 clamp 在 0–100。
- **FR-11**：HP ≤ 0 或理智 ≤ 0 时本局立即结束，进入 doom 结局。
- **FR-12**：水或食物为 0 时，每次推进额外扣 5 HP。
- **FR-13**：第 7 天完成选择后必须进入结算页。
- **FR-14**：刷新游戏页必须从 `activeRun` 恢复当前天与选择前状态。
- **FR-15**：结算后必须清空 `activeRun`，保留 `lastResult` 供结果页读取。

### 8.3 评分与收集

- **FR-16**：结算必须按 PRD 公式计算分数，并按阈值给出 1–3 星。
- **FR-17**：结局按 tone 判定：doom、best、neutral，每个场景只触发一个。
- **FR-18**：每次结算必须更新该场景最佳分、最高星级、已解锁结局、游玩次数、总存活天数。
- **FR-19**：首次遇到知识卡时必须写入 `progress.knowledge`，重复遇到不重复计数。
- **FR-20**：结局一经解锁永久保留，重置进度时一并清除。

### 8.4 页面与交互

- **FR-21**：首页必须展示 7 个场景与四项统计；随机按钮必须进入随机场景简报。
- **FR-22**：场景简报必须展示威胁、技能、专属资源、最佳记录、结局收集状态。
- **FR-23**：游戏页 HUD 必须显示天数、7 个进度点、5 项资源。
- **FR-24**：事件卡必须提供“冷知识”折叠内容，默认收起。
- **FR-25**：结算页必须展示结局、评分、星级、5 项资源终值、逐条复盘、本次解锁知识。
- **FR-26**：图鉴必须支持按场景筛选，筛选状态写入 URL 查询参数。
- **FR-27**：无效场景 slug 必须返回 404 页面。
- **FR-28**：所有 Unsplash 图片必须有渐变 + 图标兜底，不得出现破图。

### 8.5 设置与辅助

- **FR-29**：音效默认关闭，开关状态持久化；音效必须由 Web Audio API 合成，不依赖音频文件。
- **FR-30**：系统必须提供“减少动效”开关，并自动尊重 `prefers-reduced-motion`。
- **FR-31**：系统必须提供“重置全部进度”二次确认。
- **FR-32**：游戏页必须支持 1/2/3 与 A/B/C 键盘选择。
- **FR-33**：资源变化必须通过 `aria-live="polite"` 播报。
- **FR-34**：页面必须在 375px 宽度下无横向滚动。

---

## 9. Non-Goals（本期不做）

- 不做 SQLite、API Routes、服务端渲染的数据持久化、登录、账号体系。
- 不做排行榜、多人对战、每日挑战、全服随机种子。
- 不做 PWA、离线安装、推送通知。
- 不做多语言（仅简体中文）。
- 不做用户生成内容、评论、分享后台。
- 不做付费、广告、内购。
- 不做背景音乐与完整环境音；仅六种合成短音效。
- 不做 3D / WebGL / Canvas 复杂动画；插画由渐变 + FontAwesome 图标 + CSS 形状构成。
- 不做运行时 AI 生成内容；所有事件与知识为静态数据。
- 不加入成就系统（本期以三星 + 结局 + 图鉴作为收集目标）。
- 不引入 Redux / Zustand / Framer Motion 等额外状态或动画库。

---

## 10. Technical Considerations

### 10.1 技术栈

- **框架**：Next.js（App Router）+ React + TypeScript strict。
- **样式**：Tailwind CSS + `globals.css` 设计令牌；不引入 UI 组件库。
- **图标**：FontAwesome 6 Free（`@fortawesome/fontawesome-svg-core`、`free-solid-svg-icons`、`free-regular-svg-icons`、`react-fontawesome`）。
- **图片**：Unsplash 远程图，`next/image` + `images.remotePatterns`。
- **状态**：React `useReducer` + Context；不引入状态库。
- **存储**：`localStorage`，通过 `StorageAdapter` 隔离。
- **测试**：Vitest + jsdom + Testing Library。
- **开发端口**：**5343**（由 `python3 scripts/ralph/ralph.py ports` 分配，禁止使用 3000）。

### 10.2 目录结构（建议）

```text
app/
  layout.tsx
  page.tsx
  globals.css
  scenario/[slug]/page.tsx
  play/[slug]/page.tsx
  play/[slug]/result/page.tsx
  codex/page.tsx
  not-found.tsx
components/
  layout/Header.tsx Footer.tsx
  scenario/ScenarioCard.tsx ScenarioBrief.tsx
  game/ResourceHud.tsx EventCard.tsx ChoiceButton.tsx OutcomeSheet.tsx
  result/EndingHero.tsx ScoreCard.tsx SurvivalReport.tsx
  codex/KnowledgeCard.tsx KnowledgeModal.tsx
  ui/StarRating.tsx ProgressRing.tsx ConfirmDialog.tsx GradientCover.tsx
lib/
  types.ts
  scenarios.ts            # 注册表 + 聚合
  engine/deck.ts
  engine/resolve.ts
  engine/score.ts
  engine/rng.ts
  storage.ts
  audio.ts
  utils.ts
data/scenarios/
  flood/{meta.ts,events.ts,knowledge.ts,endings.ts,index.ts}
  quake/... meteor/... ice/... ai/... drought/... heatdeath/...
tests/
  engine/*.test.ts
  storage.test.ts
  content.test.ts
```

### 10.3 关键类型（约定）

```ts
type ResourceKey = 'hp' | 'water' | 'food' | 'sanity' | 'specific';
type Quality = 'good' | 'ok' | 'bad';
type Tone = 'best' | 'neutral' | 'doom';
type Act = 'opening' | 'middle' | 'finale';

interface Choice {
  id: string;
  label: string;
  effects?: Partial<Record<ResourceKey, number>>;
  risk?: { probability: number; success: Partial<Record<ResourceKey, number>>; failure: Partial<Record<ResourceKey, number>> };
  successText?: string;
  failureText?: string;
  outcomeText: string;
  quality: Quality;
  knowledgeId: string;
}
```

- `RunState` 必须包含：`scenarioId`、`seed`、`day`、`turnIndex`、`deck`（7 个事件 id）、`resources`（5 项）、`history`、`status`（`playing` | `dead` | `finished`）。
- `LastResult` 必须包含：`scenarioId`、`seed`、`endingId`、`score`、`stars`、`daysSurvived`、`resources`、`history`、`unlockedKnowledgeIds`。

### 10.4 存储结构

```ts
// dpsg:v1:progress
{
  version: 1,
  scenarios: {
    [id]: { bestScore: 0, stars: 0, endings: [], runs: 0, lastPlayedAt: null }
  },
  knowledge: [],
  totalRuns: 0,
  totalDaysSurvived: 0
}

// dpsg:v1:settings
{ version: 1, sound: false, reducedMotion: false }

// dpsg:v1:active-run
RunState | null

// dpsg:v1:last-result
LastResult | null
```

- 所有读取必须做 schema 兜底；解析失败返回默认值。
- `StorageAdapter` 接口需为未来 SQLite 版本保留相同方法签名。

### 10.5 算法约定

- `mulberry32(seed)` 作为唯一 RNG；抽中段事件与风险判定都使用它。
- 中段抽取：对 7 张中段事件做 Fisher–Yates 洗牌，取前 5 张。
- 评分、星级、结局判定实现为纯函数，便于单元测试。
- 知识解锁发生在结算时，按 `knowledgeId` 去重。
- 所有数值效果与阈值集中定义在 `lib/engine/constants.ts`，禁止散落魔法数字。

### 10.6 图片与字体

- `next.config.ts` 添加：
  - `images.remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }]`
- 封面使用固定 URL（`?auto=format&fit=crop&w=1600&q=80`），避免运行时请求 Unsplash API。
- 字体通过 `next/font/google` 加载，禁止在 `globals.css` 中使用 `@import` 远程字体。

### 10.7 质量门禁

- `npm run typecheck`、`npm run lint`、`npm run test`、`npm run build` 必须全部通过。
- 内容校验测试必须断言：
  - 7 个场景各 9 个事件、3 个结局、6 张知识卡；
  - 每个事件 3 个选项；
  - 所有 `knowledgeId` 可解析；
  - 每个场景的 ending tone 唯一且齐全；
  - 风险选项概率在 1–99 之间。

---

## 11. Success Metrics

- **内容完整度**：7/7 场景可完成；9 事件/场景；42 张知识卡；21 个结局。
- **单局时长**：普通玩家 3–6 分钟完成一局（7 次选择）。
- **可学习性**：结算页 100% 决策都有 ✓/•/✗ 评价与解释；每局至少触发 1 条知识贴士。
- **重玩动机**：每场景至少 3 个结局与 3 星目标；首页可见收集进度。
- **视觉验收**：首页、简报、游戏、结算、图鉴五个页面均有渐变、高光、层叠阴影与至少 2 处动效；无破图。
- **性能**：Lighthouse 桌面 performance ≥ 85、accessibility ≥ 90；移动端 375px 无横向滚动。
- **工程质量**：typecheck / lint / test / build 零错误；核心引擎测试覆盖率 ≥ 80%。

---

## 12. Open Questions

1. 第二阶段接入 SQLite 时，是否需要把本地进度迁移为账号数据？迁移策略待定。
2. 是否在后续版本加入“每日灾变规则”（如断水日、余震日）以提升长期留存？
3. 每个场景目前 7 张中段卡，抽 5 张；内容验证后是否扩展到 10–12 张以提升重玩差异？
4. 是否需要为色盲用户提供资源条的第二编码（图案/纹理），本期先用图标 + 数值 + 标签兜底。

