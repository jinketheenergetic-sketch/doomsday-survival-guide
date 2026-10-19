/**
 * 领域模型：场景、事件、知识卡、结局与本局/存档状态。
 * 该文件只放类型与常量，不依赖 React 或浏览器 API，可被数据文件、引擎与页面共同引用。
 */

/** 七个末日场景的 slug，同时也是场景的唯一 id。 */
export const SCENARIO_IDS = [
  "flood",
  "quake",
  "meteor",
  "ice",
  "ai",
  "drought",
  "heatdeath",
] as const;

export type ScenarioId = (typeof SCENARIO_IDS)[number];

/** 所有场景共用的 5 项资源。 */
export const RESOURCE_KEYS = [
  "hp",
  "sanity",
  "water",
  "food",
  "energy",
] as const;

export type ResourceKey = (typeof RESOURCE_KEYS)[number];

export type Resources = Record<ResourceKey, number>;

/** 资源变化量，允许只声明本次实际变化的项。 */
export type ResourceDelta = Partial<Resources>;

export type ThreatLevel = 1 | 2 | 3 | 4 | 5;

/** 场景专属资源，例如融冰纪元的「海拔」。 */
export interface SpecificResource {
  /** 在资源对象/引擎中使用的稳定键名。 */
  key: string;
  /** 界面展示名称。 */
  label: string;
  /** 一句话解释这个资源代表什么。 */
  description: string;
  /** 开局初始值。 */
  initial: number;
}

/** 场景元数据。7 个场景共享同一结构。 */
export interface Scenario {
  id: ScenarioId;
  title: string;
  tagline: string;
  /** FontAwesome 6 Free 图标名，例如 "water"。 */
  icon: string;
  /** Unsplash 封面图 URL（域名已由 next.config.ts 放行）。 */
  cover: string;
  /** 场景强调色，用于界面点缀。 */
  accent: string;
  threatLevel: ThreatLevel;
  /** 3 个可用技能。 */
  skills: readonly string[];
  specificResource: SpecificResource;
}

export type EventPhase = "opening" | "middle" | "finale";

export type ChoiceQuality = "good" | "ok" | "bad";

/** 风险选项的成功/失败分支。 */
export interface RiskBranch {
  /** 成功率，1–99 的整数。 */
  probability: number;
  successEffects: ResourceDelta;
  failureEffects: ResourceDelta;
  successSpecificEffect?: number;
  failureSpecificEffect?: number;
  successText: string;
  failureText: string;
}

/** 事件卡上的一个选项。 */
export interface Choice {
  id: string;
  /** 选项文案。 */
  label: string;
  quality: ChoiceQuality;
  /** 确定型选项的资源变化；风险选项使用 risk 中的效果。 */
  effects?: ResourceDelta;
  specificEffect?: number;
  /** 有该字段时按种子随机判定成功/失败。 */
  risk?: RiskBranch;
  /** 确定型选项的结果文案。 */
  resultText?: string;
  /** 选择后展示的知识贴士对应的知识卡 id。 */
  knowledgeId?: string;
}

/** 一张事件卡。每张卡固定 3 个选项。 */
export interface GameEvent {
  id: string;
  scenarioId: ScenarioId;
  phase: EventPhase;
  /** 幕名，用于事件卡顶部展示。 */
  act: string;
  title: string;
  body: string;
  /** 事件卡「冷知识」对应的知识卡 id。 */
  knowledgeId?: string;
  choices: readonly [Choice, Choice, Choice];
}

/** 生存手册中的知识卡。 */
export interface KnowledgeCard {
  id: string;
  scenarioId: ScenarioId;
  title: string;
  content: string;
  /** FontAwesome 6 Free 图标名。 */
  icon: string;
}

export type EndingTone = "best" | "neutral" | "doom";

/** 场景结局。每个场景固定 best / neutral / doom 各一个。 */
export interface Ending {
  id: string;
  scenarioId: ScenarioId;
  tone: EndingTone;
  title: string;
  description: string;
}

/** 一次选择的结算记录。 */
export interface ChoiceResult {
  day: number;
  eventId: string;
  choiceId: string;
  quality: ChoiceQuality;
  /** 风险选项是否成功；确定型选项为 undefined。 */
  riskSucceeded?: boolean;
  resourceDelta: ResourceDelta;
  specificDelta: number;
  /** 展示给玩家的结果文案。 */
  text: string;
  knowledgeId?: string;
}

export type RunStatus = "playing" | "dead" | "completed";

/** 一局游戏的完整状态（同时用于 activeRun 持久化）。 */
export interface RunState {
  scenarioId: ScenarioId;
  seed: number;
  /** 当前天数 1–7。 */
  day: number;
  /** 7 个回合的事件 id：固定开场 + 5 个中段 + 固定终局。 */
  deck: readonly string[];
  /** 当前事件在 deck 中的下标。 */
  eventIndex: number;
  resources: Resources;
  specificResource: number;
  status: RunStatus;
  history: readonly ChoiceResult[];
  /** 本局首次解锁的知识卡 id（相对玩家已有进度），结算时写入 `LastResult`。 */
  newKnowledgeIds?: readonly string[];
  goodCount: number;
  badCount: number;
  startedAt: string;
  finishedAt?: string;
}

/** 单个场景的完整内容：元数据、事件牌组、结局与知识卡。 */
export interface ScenarioContent {
  scenario: Scenario;
  events: readonly GameEvent[];
  endings: readonly Ending[];
  knowledge: readonly KnowledgeCard[];
}

/** 单场景的累计进度。 */
export interface ScenarioProgress {
  bestScore: number;
  /** 0–3，0 表示尚未通关。 */
  bestStars: number;
  /** 已解锁的结局 id。 */
  endingIds: readonly string[];
  runs: number;
}

/** 跨场景的玩家进度。 */
export interface Progress {
  scenarios: Record<ScenarioId, ScenarioProgress>;
  /** 已解锁的知识卡 id，按 id 去重。 */
  unlockedKnowledgeIds: readonly string[];
  /** 已解锁的结局 id，按 id 去重。 */
  unlockedEndingIds: readonly string[];
  totalRuns: number;
  totalSurvivedDays: number;
  bestScore: number;
}

/** 上一次结算结果，供结算页读取并写回进度。 */
export interface LastResult {
  scenarioId: ScenarioId;
  seed: number;
  endingId: string;
  score: number;
  stars: 1 | 2 | 3;
  daysSurvived: number;
  goodCount: number;
  badCount: number;
  resources: Resources;
  specificResource: number;
  history: readonly ChoiceResult[];
  newKnowledgeIds: readonly string[];
  finishedAt: string;
}

/** 玩家设置。 */
export interface Settings {
  soundEnabled: boolean;
  reducedMotion: boolean;
}
