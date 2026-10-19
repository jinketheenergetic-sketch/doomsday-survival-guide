import { applyRunResult } from "@/lib/progress";
import { storageAdapter } from "@/lib/storage";
import type { LastResult } from "@/lib/types";

/**
 * 结算页的一次性会话。
 *
 * 结算结果从 `lastResult` 读取一次后立即写回进度并清空 `activeRun` / `lastResult`，
 * 保证刷新或重新进入结算页时不会把同一局重复计入总对局数与存活天数。
 * 本模块用 `useSyncExternalStore` 暴露快照：服务端固定返回 `loading`，
 * 客户端读取真实结果；写回完成后通知订阅者刷新「结局 x/3」。
 */

export interface ResultSnapshot {
  /** `loading` 用于服务端与客户端首次水合，避免误触发重定向。 */
  status: "loading" | "missing" | "ready";
  result: LastResult | null;
  /** 本局结算后该场景已解锁的结局数量。 */
  endingCount: number;
}

const LOADING_SNAPSHOT: ResultSnapshot = {
  status: "loading",
  result: null,
  endingCount: 0,
};

const MISSING_SNAPSHOT: ResultSnapshot = {
  status: "missing",
  result: null,
  endingCount: 0,
};

let cache: ResultSnapshot | null = null;
let appliedKey: string | null = null;
const listeners = new Set<() => void>();

function countEndings(scenarioId: LastResult["scenarioId"]): number {
  return storageAdapter.getProgress().scenarios[scenarioId].endingIds.length;
}

function resultKey(result: LastResult): string {
  return `${result.scenarioId}:${result.finishedAt}:${result.seed}:${result.score}`;
}

/**
 * 读取当前快照。
 *
 * 每次都会看一眼 `lastResult`：同一局已被消费后返回缓存，新的一局写入后自动替换。
 * 返回的引用在内容不变时保持稳定，满足 `useSyncExternalStore` 的要求。
 */
export function getResultSnapshot(): ResultSnapshot {
  const stored = storageAdapter.getLastResult();

  if (!stored) {
    return cache ?? MISSING_SNAPSHOT;
  }

  if (
    !cache ||
    cache.status !== "ready" ||
    !cache.result ||
    resultKey(cache.result) !== resultKey(stored)
  ) {
    cache = {
      status: "ready",
      result: stored,
      endingCount: countEndings(stored.scenarioId),
    };
  }

  return cache;
}

/** 服务端与水合阶段固定返回 loading，真正的结果在客户端读取。 */
export function getServerResultSnapshot(): ResultSnapshot {
  return LOADING_SNAPSHOT;
}

export function subscribeResult(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit(): void {
  for (const listener of listeners) listener();
}

/**
 * 把本局结果写回进度，只执行一次。
 *
 * - `applyRunResult` 负责最佳分/星级、结局、局数与存活天数
 * - 清空 `activeRun` 与 `lastResult`，让「再来一局」从干净状态开始
 * - 更新缓存中的结局收集数并通知订阅者
 */
export function applyResultOnce(result: LastResult): void {
  const key = resultKey(result);
  if (appliedKey === key) return;

  appliedKey = key;

  const next = applyRunResult(storageAdapter.getProgress(), result);
  storageAdapter.saveProgress(next);
  storageAdapter.clearActiveRun();
  storageAdapter.clearLastResult();

  cache = {
    status: "ready",
    result,
    endingCount: next.scenarios[result.scenarioId].endingIds.length,
  };
  emit();
}
