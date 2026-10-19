/**
 * 牌组与回合引擎。
 *
 * 一局固定 7 个回合：1 张开场 → 从中段池中不重复抽 5 张 → 1 张终局。
 * 抽牌只使用 mulberry32 种子随机数，因此同一种子总能复现同一副牌组与顺序。
 * 该模块是纯函数，不依赖 React 或浏览器 API；事件内容由调用方传入。
 */

import type {
  GameEvent,
  RunState,
  Scenario,
  ScenarioId,
} from "@/lib/types";

import {
  INITIAL_RESOURCES,
  MIDDLE_EVENT_DRAW_COUNT,
  RUN_DAYS,
} from "./constants";
import { mulberry32, randomInt, type Rng } from "./rng";

/** 按幕拆分后的事件池。 */
export interface EventPool {
  opening: GameEvent;
  middle: readonly GameEvent[];
  finale: GameEvent;
}

/**
 * 把场景事件按幕拆分并做结构校验。
 * 要求恰好 1 个开场、至少 `MIDDLE_EVENT_DRAW_COUNT` 个中段、恰好 1 个终局，
 * 且所有事件属于同一场景、id 不重复。
 */
export function splitEventPool(
  scenarioId: ScenarioId,
  events: readonly GameEvent[],
): EventPool {
  if (events.length === 0) {
    throw new RangeError(`场景 ${scenarioId} 没有可用事件`);
  }

  const seen = new Set<string>();
  for (const event of events) {
    if (event.scenarioId !== scenarioId) {
      throw new RangeError(
        `事件 ${event.id} 属于场景 ${event.scenarioId}，与 ${scenarioId} 不匹配`,
      );
    }
    if (seen.has(event.id)) {
      throw new RangeError(`事件 id 重复：${event.id}`);
    }
    seen.add(event.id);
  }

  const openings = events.filter((event) => event.phase === "opening");
  const middle = events.filter((event) => event.phase === "middle");
  const finales = events.filter((event) => event.phase === "finale");

  if (openings.length !== 1) {
    throw new RangeError(
      `场景 ${scenarioId} 需要恰好 1 个开场事件，实际 ${openings.length} 个`,
    );
  }
  if (middle.length < MIDDLE_EVENT_DRAW_COUNT) {
    throw new RangeError(
      `场景 ${scenarioId} 至少需要 ${MIDDLE_EVENT_DRAW_COUNT} 个中段事件，实际 ${middle.length} 个`,
    );
  }
  if (finales.length !== 1) {
    throw new RangeError(
      `场景 ${scenarioId} 需要恰好 1 个终局事件，实际 ${finales.length} 个`,
    );
  }

  return { opening: openings[0], middle, finale: finales[0] };
}

/**
 * 对中段池做 Fisher–Yates 洗牌，返回前 `MIDDLE_EVENT_DRAW_COUNT` 张。
 * 不修改传入的数组；同一随机源序列得到同一结果。
 */
export function drawMiddleEvents(
  middle: readonly GameEvent[],
  rng: Rng,
): GameEvent[] {
  if (middle.length < MIDDLE_EVENT_DRAW_COUNT) {
    throw new RangeError(
      `中段事件不足：需要 ${MIDDLE_EVENT_DRAW_COUNT} 张，实际 ${middle.length} 张`,
    );
  }

  const pool = [...middle];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(rng, 0, index);
    const current = pool[index];
    pool[index] = pool[swapIndex];
    pool[swapIndex] = current;
  }

  return pool.slice(0, MIDDLE_EVENT_DRAW_COUNT);
}

/**
 * 生成一局的 7 个事件 id：固定开场 + 5 个不重复中段 + 固定终局。
 */
export function buildDeck(
  scenario: Scenario,
  seed: number,
  events: readonly GameEvent[],
): string[] {
  const { opening, middle, finale } = splitEventPool(scenario.id, events);
  const drawn = drawMiddleEvents(middle, mulberry32(seed));

  const deck = [opening.id, ...drawn.map((event) => event.id), finale.id];
  if (deck.length !== RUN_DAYS) {
    throw new RangeError(`牌组长度应为 ${RUN_DAYS}，实际 ${deck.length}`);
  }

  return deck;
}

/**
 * 新建一局游戏状态。
 *
 * @param scenario 场景元数据，提供专属资源的初始值。
 * @param seed 本局种子；同一种子生成同一牌组与顺序。
 * @param events 该场景的全部事件（1 开场 + 至少 5 中段 + 1 终局）。
 *   内容由 `data/scenarios/<slug>/events.ts` 提供，引擎本身不读取数据文件。
 * @param startedAt 开局时间，默认取当前时间；测试可传入固定值以保持确定性。
 */
export function buildRun(
  scenario: Scenario,
  seed: number,
  events: readonly GameEvent[],
  startedAt: string = new Date().toISOString(),
): RunState {
  return {
    scenarioId: scenario.id,
    seed,
    day: 1,
    deck: buildDeck(scenario, seed, events),
    eventIndex: 0,
    resources: { ...INITIAL_RESOURCES },
    specificResource: scenario.specificResource.initial,
    status: "playing",
    history: [],
    goodCount: 0,
    badCount: 0,
    startedAt,
  };
}
