/**
 * 进度合并与统计的纯函数。
 *
 * 结算页写回（`applyRunResult`）、选择后解锁知识（`unlockKnowledge`）与首页统计
 * （`getOverallStats`）都走这里，避免各页面各自维护一份去重/取最大值逻辑。
 * 所有函数都不修改入参，返回新的 `Progress`。
 */

import type {
  LastResult,
  Progress,
  ScenarioProgress,
} from "@/lib/types";

/** 跨场景的汇总统计，供首页进度条带使用。 */
export interface OverallStats {
  /** 已解锁知识卡数量。 */
  unlockedKnowledgeCount: number;
  /** 已解锁结局数量。 */
  unlockedEndingCount: number;
  /** 所有对局累计存活天数。 */
  totalSurvivedDays: number;
  /** 跨场景最高分。 */
  bestScore: number;
}

function emptyScenarioProgress(): ScenarioProgress {
  return { bestScore: 0, bestStars: 0, endingIds: [], runs: 0 };
}

/** 按顺序追加 additions 中尚未出现过的 id，保持原顺序并去重。 */
function appendUnique(
  existing: readonly string[],
  additions: readonly string[],
): string[] {
  const merged = [...existing];
  const seen = new Set(existing);
  for (const id of additions) {
    if (!seen.has(id)) {
      seen.add(id);
      merged.push(id);
    }
  }
  return merged;
}

/**
 * 把一局结算结果写回进度。
 *
 * - 场景最佳分与星级取较大值，结局 id 去重追加，局数 +1
 * - 全局结局 id 去重追加，总对局数 +1，总存活天数累加，最高分取较大值
 * - `newKnowledgeIds` 一并去重写入，重复解锁不会增加数量
 */
export function applyRunResult(
  progress: Progress,
  result: LastResult,
): Progress {
  const current = progress.scenarios[result.scenarioId] ?? emptyScenarioProgress();

  const scenario: ScenarioProgress = {
    bestScore: Math.max(current.bestScore, result.score),
    bestStars: Math.max(current.bestStars, result.stars),
    endingIds: appendUnique(current.endingIds, [result.endingId]),
    runs: current.runs + 1,
  };

  return {
    scenarios: { ...progress.scenarios, [result.scenarioId]: scenario },
    unlockedKnowledgeIds: appendUnique(
      progress.unlockedKnowledgeIds,
      result.newKnowledgeIds,
    ),
    unlockedEndingIds: appendUnique(progress.unlockedEndingIds, [
      result.endingId,
    ]),
    totalRuns: progress.totalRuns + 1,
    totalSurvivedDays: progress.totalSurvivedDays + result.daysSurvived,
    bestScore: Math.max(progress.bestScore, result.score),
  };
}

/** 解锁知识卡：按 id 去重，已解锁或 ids 内重复的条目不会增加数量。 */
export function unlockKnowledge(
  progress: Progress,
  ids: readonly string[],
): Progress {
  return {
    ...progress,
    unlockedKnowledgeIds: appendUnique(progress.unlockedKnowledgeIds, ids),
  };
}

/** 汇总首页展示用的收集进度与最佳成绩。 */
export function getOverallStats(progress: Progress): OverallStats {
  return {
    unlockedKnowledgeCount: progress.unlockedKnowledgeIds.length,
    unlockedEndingCount: progress.unlockedEndingIds.length,
    totalSurvivedDays: progress.totalSurvivedDays,
    bestScore: progress.bestScore,
  };
}
