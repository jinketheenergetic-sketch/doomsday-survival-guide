/**
 * 评分、星级与结局引擎。
 *
 * 结算页只需要三样结论：分数、星级、结局基调。三者都从本局最终状态推导，
 * 数值统一来自 `constants.ts`，保证与界面文案、进度统计使用同一套阈值。
 * 该模块是纯函数，不修改传入的 `run`。
 */

import { RESOURCE_KEYS } from "@/lib/types";
import type { EndingTone, RunState } from "@/lib/types";

import {
  BEST_ENDING_MIN_SCORE,
  BEST_ENDING_MIN_SPECIFIC,
  RUN_DAYS,
  SCORE_BAD_CHOICE,
  SCORE_GOOD_CHOICE,
  SCORE_PER_DAY,
  SCORE_PER_RESOURCE_AVG,
  THREE_STAR_MIN_SCORE,
  TWO_STAR_MIN_SCORE,
} from "./constants";

/** 一局结束时的完整评价。 */
export interface RunEvaluation {
  /** 评分公式：avg(5 项资源) * 10 + good * 100 - bad * 50 + days * 50。 */
  score: number;
  /** 1–3 星；死亡局最高 1 星。 */
  stars: 1 | 2 | 3;
  /** 结局基调，用于在场景结局表中取对应条目。 */
  ending: EndingTone;
  /** 计入评分的存活天数，等于本局最终所在的天数。 */
  days: number;
}

/** HP 或理智归零（或状态已被标记为死亡）即为死亡局。 */
export function isDead(run: RunState): boolean {
  return run.status === "dead" || run.resources.hp <= 0 || run.resources.sanity <= 0;
}

/**
 * 计算评分。
 * `avg(5 项资源) * 10` 等价于资源总和 * 2，因此整数资源下分数恒为整数。
 */
export function computeScore(run: RunState): number {
  const resourceSum = RESOURCE_KEYS.reduce(
    (sum, key) => sum + run.resources[key],
    0,
  );
  const resourceScore =
    (resourceSum / RESOURCE_KEYS.length) * SCORE_PER_RESOURCE_AVG;

  return (
    resourceScore +
    run.goodCount * SCORE_GOOD_CHOICE -
    run.badCount * SCORE_BAD_CHOICE +
    run.day * SCORE_PER_DAY
  );
}

/**
 * 按分数换算星级。
 * 3 星 ≥ 1600、2 星 ≥ 1100、否则 1 星；死亡局无论分数多高都只给 1 星。
 */
export function computeStars(score: number, dead: boolean): 1 | 2 | 3 {
  if (dead) {
    return 1;
  }
  if (score >= THREE_STAR_MIN_SCORE) {
    return 3;
  }
  if (score >= TWO_STAR_MIN_SCORE) {
    return 2;
  }
  return 1;
}

/**
 * 判定结局基调，按优先级依次检查：
 * 1. HP 或理智 ≤ 0 → `doom`
 * 2. 第 7 天且分数 ≥ 1600 且专属资源 ≥ 60 → `best`
 * 3. 其余 → `neutral`
 */
export function resolveEnding(run: RunState): EndingTone {
  if (isDead(run)) {
    return "doom";
  }
  if (
    run.day === RUN_DAYS &&
    computeScore(run) >= BEST_ENDING_MIN_SCORE &&
    run.specificResource >= BEST_ENDING_MIN_SPECIFIC
  ) {
    return "best";
  }
  return "neutral";
}

/** 一次性得到分数、星级、结局与存活天数，供结算页与进度写回使用。 */
export function evaluateRun(run: RunState): RunEvaluation {
  const score = computeScore(run);

  return {
    score,
    stars: computeStars(score, isDead(run)),
    ending: resolveEnding(run),
    days: run.day,
  };
}
