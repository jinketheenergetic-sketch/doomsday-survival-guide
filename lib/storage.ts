/**
 * 本地存储适配器。
 *
 * 页面与组件只能通过 `StorageAdapter` 读写存档，不直接接触 localStorage。
 * 所有数据以 `{ version: 1, data }` 信封写入；解析失败、版本不符或字段缺失时
 * 静默回退到默认值，任何读写异常都不会向上抛出。
 */

import {
  RESOURCE_KEYS,
  SCENARIO_IDS,
  type ChoiceQuality,
  type ChoiceResult,
  type LastResult,
  type Progress,
  type RunState,
  type ScenarioId,
  type ScenarioProgress,
  type Settings,
} from "@/lib/types";

export const STORAGE_PREFIX = "dpsg:v1:";

export const STORAGE_KEYS = {
  progress: `${STORAGE_PREFIX}progress`,
  settings: `${STORAGE_PREFIX}settings`,
  activeRun: `${STORAGE_PREFIX}active-run`,
  lastResult: `${STORAGE_PREFIX}last-result`,
} as const;

export const STORAGE_VERSION = 1;

export interface StorageAdapter {
  getProgress(): Progress;
  saveProgress(progress: Progress): void;

  getSettings(): Settings;
  saveSettings(settings: Settings): void;

  getActiveRun(): RunState | null;
  saveActiveRun(run: RunState): void;
  clearActiveRun(): void;

  getLastResult(): LastResult | null;
  saveLastResult(result: LastResult): void;
  clearLastResult(): void;

  /** 只清除 `dpsg:v1:*` 前缀的数据，不影响同源其他 key。 */
  resetAll(): void;
}

/**
 * 适配器实际依赖的最小存储接口。
 * localStorage 天然满足；未来的 SQLite 实现只需提供同样的方法。
 */
export interface StorageBackend {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  key(index: number): string | null;
  readonly length: number;
}

export function createDefaultProgress(): Progress {
  const scenarios = {} as Record<ScenarioId, ScenarioProgress>;
  for (const id of SCENARIO_IDS) {
    scenarios[id] = { bestScore: 0, bestStars: 0, endingIds: [], runs: 0 };
  }

  return {
    scenarios,
    unlockedKnowledgeIds: [],
    unlockedEndingIds: [],
    totalRuns: 0,
    totalSurvivedDays: 0,
    bestScore: 0,
  };
}

export function createDefaultSettings(): Settings {
  return { soundEnabled: false, reducedMotion: false };
}

/* ------------------------------- 校验工具 ------------------------------- */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function toNonNegative(value: unknown, fallback: number): number {
  return isFiniteNumber(value) && value >= 0 ? value : fallback;
}

function toStars(value: unknown): number {
  if (!isFiniteNumber(value)) return 0;
  return Math.min(3, Math.max(0, Math.trunc(value)));
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const strings = value.filter(
    (item): item is string => typeof item === "string" && item.length > 0,
  );
  return [...new Set(strings)];
}

function isScenarioId(value: unknown): value is ScenarioId {
  return (
    typeof value === "string" &&
    (SCENARIO_IDS as readonly string[]).includes(value)
  );
}

function isChoiceQuality(value: unknown): value is ChoiceQuality {
  return value === "good" || value === "ok" || value === "bad";
}

function isRunStatus(value: unknown): value is RunState["status"] {
  return value === "playing" || value === "dead" || value === "completed";
}

function toResources(value: unknown): RunState["resources"] | null {
  if (!isRecord(value)) return null;
  const resources = {} as RunState["resources"];
  for (const key of RESOURCE_KEYS) {
    const amount = value[key];
    if (!isFiniteNumber(amount)) return null;
    resources[key] = amount;
  }
  return resources;
}

function toHistory(value: unknown): ChoiceResult[] | null {
  if (!Array.isArray(value)) return null;
  const history: ChoiceResult[] = [];
  for (const item of value) {
    if (!isRecord(item)) return null;
    if (
      !isFiniteNumber(item.day) ||
      typeof item.eventId !== "string" ||
      typeof item.choiceId !== "string" ||
      !isChoiceQuality(item.quality) ||
      !isFiniteNumber(item.specificDelta) ||
      typeof item.text !== "string"
    ) {
      return null;
    }
    history.push(item as unknown as ChoiceResult);
  }
  return history;
}

function toProgress(value: unknown): Progress {
  const progress = createDefaultProgress();
  if (!isRecord(value)) return progress;

  const storedScenarios = isRecord(value.scenarios) ? value.scenarios : {};
  for (const id of SCENARIO_IDS) {
    const stored = storedScenarios[id];
    if (!isRecord(stored)) continue;
    progress.scenarios[id] = {
      bestScore: toNonNegative(stored.bestScore, 0),
      bestStars: toStars(stored.bestStars),
      endingIds: toStringArray(stored.endingIds),
      runs: toNonNegative(stored.runs, 0),
    };
  }

  progress.unlockedKnowledgeIds = toStringArray(value.unlockedKnowledgeIds);
  progress.unlockedEndingIds = toStringArray(value.unlockedEndingIds);
  progress.totalRuns = toNonNegative(value.totalRuns, 0);
  progress.totalSurvivedDays = toNonNegative(value.totalSurvivedDays, 0);
  progress.bestScore = toNonNegative(value.bestScore, 0);

  return progress;
}

function toSettings(value: unknown): Settings {
  const settings = createDefaultSettings();
  if (!isRecord(value)) return settings;
  if (typeof value.soundEnabled === "boolean") {
    settings.soundEnabled = value.soundEnabled;
  }
  if (typeof value.reducedMotion === "boolean") {
    settings.reducedMotion = value.reducedMotion;
  }
  return settings;
}

function toActiveRun(value: unknown): RunState | null {
  if (!isRecord(value)) return null;

  const resources = toResources(value.resources);
  const history = toHistory(value.history);
  if (
    !isScenarioId(value.scenarioId) ||
    !isFiniteNumber(value.seed) ||
    !isFiniteNumber(value.day) ||
    !isFiniteNumber(value.eventIndex) ||
    !isFiniteNumber(value.specificResource) ||
    !isFiniteNumber(value.goodCount) ||
    !isFiniteNumber(value.badCount) ||
    !isRunStatus(value.status) ||
    typeof value.startedAt !== "string" ||
    !Array.isArray(value.deck) ||
    !value.deck.every((id) => typeof id === "string") ||
    !resources ||
    !history
  ) {
    return null;
  }

  return {
    scenarioId: value.scenarioId,
    seed: value.seed,
    day: value.day,
    deck: value.deck as string[],
    eventIndex: value.eventIndex,
    resources,
    specificResource: value.specificResource,
    status: value.status,
    history,
    goodCount: value.goodCount,
    badCount: value.badCount,
    startedAt: value.startedAt,
    ...(typeof value.finishedAt === "string"
      ? { finishedAt: value.finishedAt }
      : {}),
  };
}

function toLastResult(value: unknown): LastResult | null {
  if (!isRecord(value)) return null;

  const resources = toResources(value.resources);
  const history = toHistory(value.history);
  const stars = toStars(value.stars);
  if (
    !isScenarioId(value.scenarioId) ||
    !isFiniteNumber(value.seed) ||
    typeof value.endingId !== "string" ||
    !isFiniteNumber(value.score) ||
    stars < 1 ||
    stars > 3 ||
    !isFiniteNumber(value.daysSurvived) ||
    !isFiniteNumber(value.goodCount) ||
    !isFiniteNumber(value.badCount) ||
    !isFiniteNumber(value.specificResource) ||
    typeof value.finishedAt !== "string" ||
    !resources ||
    !history
  ) {
    return null;
  }

  return {
    scenarioId: value.scenarioId,
    seed: value.seed,
    endingId: value.endingId,
    score: value.score,
    stars: stars as LastResult["stars"],
    daysSurvived: value.daysSurvived,
    goodCount: value.goodCount,
    badCount: value.badCount,
    resources,
    specificResource: value.specificResource,
    history,
    newKnowledgeIds: toStringArray(value.newKnowledgeIds),
    finishedAt: value.finishedAt,
  };
}

/* ------------------------------- 读写实现 ------------------------------- */

interface StorageEnvelope {
  version: number;
  data: unknown;
}

function readEnvelope(
  backend: StorageBackend | null,
  key: string,
): unknown | undefined {
  if (!backend) return undefined;
  try {
    const raw = backend.getItem(key);
    if (raw === null) return undefined;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== STORAGE_VERSION) {
      return undefined;
    }
    return parsed.data;
  } catch {
    return undefined;
  }
}

function writeEnvelope(
  backend: StorageBackend | null,
  key: string,
  data: unknown,
): void {
  if (!backend) return;
  try {
    const envelope: StorageEnvelope = { version: STORAGE_VERSION, data };
    backend.setItem(key, JSON.stringify(envelope));
  } catch {
    // 存储不可用（隐私模式、配额已满）时静默失败，游戏仍可继续。
  }
}

function removeKey(backend: StorageBackend | null, key: string): void {
  if (!backend) return;
  try {
    backend.removeItem(key);
  } catch {
    // 同上：清除失败不应影响调用方。
  }
}

function resolveLocalStorage(): StorageBackend | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function createStorageAdapter(
  explicitBackend?: StorageBackend,
): StorageAdapter {
  const resolve = (): StorageBackend | null =>
    explicitBackend ?? resolveLocalStorage();

  return {
    getProgress: () => toProgress(readEnvelope(resolve(), STORAGE_KEYS.progress)),
    saveProgress: (progress) =>
      writeEnvelope(resolve(), STORAGE_KEYS.progress, progress),

    getSettings: () => toSettings(readEnvelope(resolve(), STORAGE_KEYS.settings)),
    saveSettings: (settings) =>
      writeEnvelope(resolve(), STORAGE_KEYS.settings, settings),

    getActiveRun: () =>
      toActiveRun(readEnvelope(resolve(), STORAGE_KEYS.activeRun)),
    saveActiveRun: (run) =>
      writeEnvelope(resolve(), STORAGE_KEYS.activeRun, run),
    clearActiveRun: () => removeKey(resolve(), STORAGE_KEYS.activeRun),

    getLastResult: () =>
      toLastResult(readEnvelope(resolve(), STORAGE_KEYS.lastResult)),
    saveLastResult: (result) =>
      writeEnvelope(resolve(), STORAGE_KEYS.lastResult, result),
    clearLastResult: () => removeKey(resolve(), STORAGE_KEYS.lastResult),

    resetAll: () => {
      const backend = resolve();
      if (!backend) return;
      try {
        const keys: string[] = [];
        for (let index = 0; index < backend.length; index += 1) {
          const key = backend.key(index);
          if (key !== null && key.startsWith(STORAGE_PREFIX)) keys.push(key);
        }
        for (const key of keys) backend.removeItem(key);
      } catch {
        // 枚举失败时不做任何破坏性操作。
      }
    },
  };
}

/** 应用默认使用的适配器；在 SSR 或存储不可用时自动降级为空实现。 */
export const storageAdapter: StorageAdapter = createStorageAdapter();
