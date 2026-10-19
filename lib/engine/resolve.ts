/**
 * 选项结算引擎。
 *
 * 把一次选择的效果应用到本局状态：确定型选项直接使用 `effects`，
 * 风险选项用种子随机数判定成功/失败后取对应分支；5 项共用资源统一钳制到 0–100。
 * 水或食物为 0 时会额外扣 HP（断水断食惩罚），这部分变化同样记入结算结果。
 * 该模块是纯函数：不修改传入的 `run`，也不推进 `day` / `eventIndex`（推进由 reducer 负责）。
 */

import { RESOURCE_KEYS } from "@/lib/types";
import type {
  Choice,
  ChoiceResult,
  ResourceDelta,
  Resources,
  RunState,
} from "@/lib/types";

import {
  DEPRIVATION_HP_PENALTY,
  RESOURCE_MAX,
  RESOURCE_MIN,
} from "./constants";
import { randomInt, type Rng } from "./rng";

/** 一次选项结算的返回值。 */
export interface ChoiceResolution {
  /** 结算后的本局状态；`day` 与 `eventIndex` 保持不变，死亡时 `status` 为 `dead`。 */
  state: RunState;
  /** 本次结算记录，已追加到 `state.history` 末尾。 */
  result: ChoiceResult;
}

function clampResource(value: number): number {
  return Math.min(Math.max(value, RESOURCE_MIN), RESOURCE_MAX);
}

/**
 * 结算一次选择并返回新的本局状态。
 *
 * - 风险选项：`randomInt(rng, 1, 100) <= probability` 判定成功，使用 success / failure 分支
 *   的效果与文案；确定型选项使用 `effects`、`specificEffect` 与 `resultText`。
 * - 5 项共用资源先应用效果，再整体钳制到 `RESOURCE_MIN`–`RESOURCE_MAX`。
 * - 钳制后若水或食物为 0，再扣 `DEPRIVATION_HP_PENALTY` 点 HP（两者同时为 0 也只扣一次）。
 * - HP 或理智归零时把 `status` 置为 `dead`，调用方据此停止推进。
 * - `resourceDelta` 记录**实际生效**的变化量（钳制后的差值），只包含发生变化的项。
 *
 * 对局已结束（`status !== "playing"`）或牌组下标越界时抛出 `RangeError`。
 */
export function resolveChoice(
  run: RunState,
  choice: Choice,
  rng: Rng,
): ChoiceResolution {
  if (run.status !== "playing") {
    throw new RangeError(`对局状态为 ${run.status}，不能继续结算`);
  }

  const eventId = run.deck[run.eventIndex];
  if (eventId === undefined) {
    throw new RangeError(`eventIndex ${run.eventIndex} 已超出牌组范围`);
  }

  let riskSucceeded: boolean | undefined;
  let effects: ResourceDelta;
  let specificEffect: number;
  let text: string;

  if (choice.risk) {
    riskSucceeded = randomInt(rng, 1, 100) <= choice.risk.probability;
    if (riskSucceeded) {
      effects = choice.risk.successEffects;
      specificEffect = choice.risk.successSpecificEffect ?? 0;
      text = choice.risk.successText;
    } else {
      effects = choice.risk.failureEffects;
      specificEffect = choice.risk.failureSpecificEffect ?? 0;
      text = choice.risk.failureText;
    }
  } else {
    effects = choice.effects ?? {};
    specificEffect = choice.specificEffect ?? 0;
    text = choice.resultText ?? "";
  }

  const resources: Resources = { ...run.resources };
  for (const key of RESOURCE_KEYS) {
    resources[key] = clampResource(resources[key] + (effects[key] ?? 0));
  }

  const deprived = resources.water === 0 || resources.food === 0;
  if (deprived) {
    resources.hp = clampResource(resources.hp - DEPRIVATION_HP_PENALTY);
  }

  const resourceDelta: ResourceDelta = {};
  for (const key of RESOURCE_KEYS) {
    const delta = resources[key] - run.resources[key];
    if (delta !== 0) {
      resourceDelta[key] = delta;
    }
  }

  const specificResource = run.specificResource + specificEffect;
  const specificDelta = specificResource - run.specificResource;

  const result: ChoiceResult = {
    day: run.day,
    eventId,
    choiceId: choice.id,
    quality: choice.quality,
    riskSucceeded,
    resourceDelta,
    specificDelta,
    text,
    knowledgeId: choice.knowledgeId,
  };

  const dead = resources.hp <= 0 || resources.sanity <= 0;

  const state: RunState = {
    ...run,
    resources,
    specificResource,
    status: dead ? "dead" : run.status,
    history: [...run.history, result],
    goodCount: run.goodCount + (choice.quality === "good" ? 1 : 0),
    badCount: run.badCount + (choice.quality === "bad" ? 1 : 0),
  };

  return { state, result };
}
