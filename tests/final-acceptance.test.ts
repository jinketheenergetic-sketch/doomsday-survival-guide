import { describe, expect, it } from "vitest";

import { scenarios } from "@/data/scenarios";
import { RUN_DAYS } from "@/lib/engine/constants";
import { buildRun } from "@/lib/engine/deck";
import { createChoiceRng, resolveChoice } from "@/lib/engine/resolve";
import { evaluateRun } from "@/lib/engine/score";
import { gameReducer, initialGameState } from "@/lib/gameReducer";
import { getScenarioContent } from "@/lib/scenarios";
import type {
  Choice,
  EndingTone,
  GameEvent,
  RunState,
  ScenarioContent,
} from "@/lib/types";

const STARTED_AT = "2026-10-19T00:00:00.000Z";

/** 取场景内容；缺失时直接失败，避免断言在 undefined 上静默通过。 */
function contentOf(id: string): ScenarioContent {
  const content = getScenarioContent(id);
  if (!content) {
    throw new Error(`场景 ${id} 缺少内容`);
  }
  return content;
}

/** 中段池数量，风险判定重建随机流时需要（引擎内部会减去抽牌消耗）。 */
function middleEventCount(content: ScenarioContent): number {
  return content.events.filter((event) => event.phase === "middle").length;
}

/**
 * 用「先保命、再保资源」的策略评估结算后的状态。
 * 先最大化四项生存资源中的最低值（避免任何一项归零），再比较总和。
 */
function survivalScore(run: RunState): number {
  if (run.status === "dead") {
    return Number.NEGATIVE_INFINITY;
  }

  const { hp, sanity, water, food, energy } = run.resources;
  const floor = Math.min(hp, sanity, water, food);
  const total = hp + sanity + water + food + energy + run.specificResource;

  return floor * 1000 + total;
}

/**
 * 从 3 个选项中挑出结算后最优的一个。
 * 优先确定型选项；只有全部为风险选项时才评估风险分支（用同一 seed 重建随机流）。
 */
function pickChoice(content: ScenarioContent, run: RunState, event: GameEvent): Choice {
  const deterministic = event.choices.filter((choice) => !choice.risk);
  const candidates = deterministic.length > 0 ? deterministic : event.choices;

  let best = candidates[0];
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const choice of candidates) {
    const { state } = resolveChoice(
      run,
      choice,
      createChoiceRng(run.seed, middleEventCount(content), run.history),
    );
    const score = survivalScore(state);
    if (score > bestScore) {
      bestScore = score;
      best = choice;
    }
  }

  return best;
}

/** 用真实内容跑一局；返回结束时的状态。 */
function playThrough(content: ScenarioContent, seed: number): RunState {
  let state = gameReducer(initialGameState, {
    type: "create",
    run: buildRun(content.scenario, seed, content.events, STARTED_AT),
  });

  for (let day = 1; day <= RUN_DAYS; day += 1) {
    const run = state.run;
    if (!run || run.status !== "playing") {
      break;
    }

    const eventId = run.deck[run.eventIndex];
    const event = content.events.find((item) => item.id === eventId);
    if (!event) {
      throw new Error(`场景 ${content.scenario.id} 的牌组引用了未知事件 ${eventId}`);
    }

    const resolution = resolveChoice(
      run,
      pickChoice(content, run, event),
      createChoiceRng(run.seed, middleEventCount(content), run.history),
    );
    state = gameReducer(state, { type: "commitChoice", resolution });

    if (state.run?.status === "playing" && day < RUN_DAYS) {
      state = gameReducer(state, { type: "advance" });
    }
  }

  if (state.run?.status === "playing") {
    state = gameReducer(state, { type: "end", at: STARTED_AT });
  }

  return state.run as RunState;
}

describe("跨场景最终验收", () => {
  it("7 个场景都能用真实内容走完 7 天并结算到已有结局", () => {
    // 多个种子覆盖不同的中段抽牌组合，任一组合完成即证明该场景可通关。
    const seeds = [1, 7, 13, 21, 34, 55, 89, 144];

    for (const scenario of scenarios) {
      const content = contentOf(scenario.id);
      const runs = seeds.map((seed) => playThrough(content, seed));
      const completed = runs.filter((run) => run.status === "completed");

      expect(
        completed.length,
        `场景 ${scenario.id} 在 ${seeds.length} 个种子下都没有走完 7 天`,
      ).toBeGreaterThan(0);

      for (const run of completed) {
        const evaluation = evaluateRun(run);

        expect(run.day).toBe(RUN_DAYS);
        expect(run.eventIndex).toBe(run.deck.length - 1);
        expect(run.history).toHaveLength(RUN_DAYS);
        expect(
          content.endings.some(
            (ending) =>
              ending.scenarioId === scenario.id &&
              ending.tone === evaluation.ending,
          ),
          `场景 ${scenario.id} 缺少 ${evaluation.ending} 结局`,
        ).toBe(true);
      }
    }
  });

  it("7 个场景共 21 个结局，id 唯一且每个基调各 7 个", () => {
    const endings = scenarios.flatMap((scenario) => contentOf(scenario.id).endings);

    expect(endings).toHaveLength(21);
    expect(new Set(endings.map((ending) => ending.id)).size).toBe(21);

    for (const tone of ["best", "neutral", "doom"] as EndingTone[]) {
      expect(
        endings.filter((ending) => ending.tone === tone),
        `${tone} 结局数量`,
      ).toHaveLength(7);
    }
  });

  it("42 张知识卡都在所属场景的事件中被引用，可在游戏内解锁", () => {
    const allCards = scenarios.flatMap(
      (scenario) => contentOf(scenario.id).knowledge,
    );

    expect(allCards).toHaveLength(42);
    expect(new Set(allCards.map((card) => card.id)).size).toBe(42);

    for (const scenario of scenarios) {
      const content = contentOf(scenario.id);
      const references = new Set(
        content.events.flatMap((event) => [
          ...(event.knowledgeId ? [event.knowledgeId] : []),
          ...event.choices.flatMap((choice) =>
            choice.knowledgeId ? [choice.knowledgeId] : [],
          ),
        ]),
      );

      const unreferenced = content.knowledge
        .filter((card) => !references.has(card.id))
        .map((card) => card.id);

      expect(
        unreferenced,
        `场景 ${scenario.id} 存在事件中无法解锁的知识卡`,
      ).toEqual([]);
    }
  });
});
