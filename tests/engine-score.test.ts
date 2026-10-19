import { describe, expect, it } from "vitest";

import {
  computeScore,
  computeStars,
  evaluateRun,
  isDead,
  resolveEnding,
} from "@/lib/engine/score";
import type { Resources, RunState } from "@/lib/types";

/** 默认资源：5 项均为 80，总和 400 → 资源分 800。 */
function makeResources(overrides: Partial<Resources> = {}): Resources {
  return {
    hp: 80,
    sanity: 80,
    water: 80,
    food: 80,
    energy: 80,
    ...overrides,
  };
}

/**
 * 默认状态恰好落在 best 结局与 3 星的边界上：
 * 800 + 5 * 100 - 1 * 50 + 7 * 50 = 1600，专属资源 60。
 */
function makeRun(overrides: Partial<RunState> = {}): RunState {
  return {
    scenarioId: "flood",
    seed: 42,
    day: 7,
    deck: ["opening", "middle-1"],
    eventIndex: 1,
    resources: makeResources(),
    specificResource: 60,
    status: "completed",
    history: [],
    goodCount: 5,
    badCount: 1,
    startedAt: "2026-10-19T00:00:00.000Z",
    ...overrides,
  };
}

describe("computeScore", () => {
  it("按 avg(资源)*10 + good*100 - bad*50 + days*50 计算", () => {
    expect(computeScore(makeRun())).toBe(1600);
  });

  it("满分场景：资源全 100、7 个 good、0 个 bad、第 7 天", () => {
    const run = makeRun({
      resources: { hp: 100, sanity: 100, water: 100, food: 100, energy: 100 },
      goodCount: 7,
      badCount: 0,
    });

    expect(computeScore(run)).toBe(1000 + 700 + 350);
  });

  it("资源平均值不是整数时仍得到整数分", () => {
    const run = makeRun({
      resources: { hp: 100, sanity: 100, water: 100, food: 100, energy: 1 },
      goodCount: 0,
      badCount: 0,
      day: 1,
    });

    // 总和 401 → avg 80.2 → 802；再加第 1 天的 50。
    expect(computeScore(run)).toBe(852);
  });

  it("bad 选项按每个 50 分扣减", () => {
    const run = makeRun({
      resources: { hp: 60, sanity: 60, water: 60, food: 60, energy: 60 },
      goodCount: 0,
      badCount: 3,
    });

    expect(computeScore(run)).toBe(600 - 150 + 350);
  });

  it("存活天数取自 run.day", () => {
    const run = makeRun({
      resources: { hp: 80, sanity: 80, water: 80, food: 80, energy: 80 },
      goodCount: 0,
      badCount: 0,
      day: 3,
    });

    expect(computeScore(run)).toBe(800 + 150);
  });

  it("不修改传入的本局状态", () => {
    const run = makeRun();
    const snapshot = structuredClone(run);

    computeScore(run);

    expect(run).toEqual(snapshot);
  });
});

describe("computeStars", () => {
  it("1600 分及以上为 3 星", () => {
    expect(computeStars(1600, false)).toBe(3);
    expect(computeStars(2050, false)).toBe(3);
  });

  it("1599 分落到 2 星", () => {
    expect(computeStars(1599, false)).toBe(2);
  });

  it("1100 分刚好为 2 星", () => {
    expect(computeStars(1100, false)).toBe(2);
  });

  it("1099 分落到 1 星", () => {
    expect(computeStars(1099, false)).toBe(1);
    expect(computeStars(0, false)).toBe(1);
  });

  it("死亡局无论分数多高都最高 1 星", () => {
    expect(computeStars(2050, true)).toBe(1);
    expect(computeStars(1600, true)).toBe(1);
  });
});

describe("resolveEnding", () => {
  it("HP 归零为 doom，即使其他条件都满足 best", () => {
    const run = makeRun({
      resources: { hp: 0, sanity: 100, water: 100, food: 100, energy: 100 },
      goodCount: 7,
      badCount: 0,
      specificResource: 100,
    });

    expect(resolveEnding(run)).toBe("doom");
  });

  it("HP 小于 0 也为 doom", () => {
    expect(resolveEnding(makeRun({ resources: makeResources({ hp: -1 }) }))).toBe(
      "doom",
    );
  });

  it("理智归零为 doom", () => {
    const run = makeRun({
      resources: makeResources({ sanity: 0 }),
      specificResource: 100,
    });

    expect(resolveEnding(run)).toBe("doom");
  });

  it("status 为 dead 时即使资源正常也判为 doom", () => {
    expect(resolveEnding(makeRun({ status: "dead" }))).toBe("doom");
  });

  it("第 7 天、分数 1600、专属资源 60 恰好为 best", () => {
    expect(resolveEnding(makeRun())).toBe("best");
  });

  it("专属资源 59 时退化为 neutral", () => {
    expect(resolveEnding(makeRun({ specificResource: 59 }))).toBe("neutral");
  });

  it("分数低于 1600 时退化为 neutral", () => {
    const run = makeRun({
      resources: makeResources({ water: 79 }),
      specificResource: 100,
    });

    // 总和 399 → 798 + 500 - 50 + 350 = 1598
    expect(computeScore(run)).toBe(1598);
    expect(resolveEnding(run)).toBe("neutral");
  });

  it("未到第 7 天时即使高分也不能 best", () => {
    const run = makeRun({
      day: 6,
      resources: { hp: 100, sanity: 100, water: 100, food: 100, energy: 100 },
      goodCount: 7,
      badCount: 0,
      specificResource: 100,
    });

    expect(computeScore(run)).toBeGreaterThanOrEqual(1600);
    expect(resolveEnding(run)).toBe("neutral");
  });

  it("存活但分数与专属资源都不足的完成为 neutral", () => {
    const run = makeRun({
      specificResource: 10,
      resources: { hp: 40, sanity: 40, water: 40, food: 40, energy: 40 },
      goodCount: 1,
      badCount: 4,
    });

    expect(resolveEnding(run)).toBe("neutral");
  });
});

describe("isDead", () => {
  it("HP 或理智归零、或状态为 dead 时返回 true", () => {
    expect(isDead(makeRun())).toBe(false);
    expect(isDead(makeRun({ resources: makeResources({ hp: 0 }) }))).toBe(true);
    expect(isDead(makeRun({ resources: makeResources({ sanity: 0 }) }))).toBe(
      true,
    );
    expect(isDead(makeRun({ status: "dead" }))).toBe(true);
  });
});

describe("evaluateRun", () => {
  it("把分数、星级、结局与存活天数一次返回", () => {
    expect(evaluateRun(makeRun())).toEqual({
      score: 1600,
      stars: 3,
      ending: "best",
      days: 7,
    });
  });

  it("死亡局最高 1 星且结局为 doom", () => {
    const run = makeRun({
      day: 4,
      status: "dead",
      resources: { hp: 0, sanity: 100, water: 100, food: 100, energy: 100 },
      goodCount: 7,
      badCount: 0,
      specificResource: 100,
    });
    const evaluation = evaluateRun(run);

    expect(evaluation.stars).toBe(1);
    expect(evaluation.ending).toBe("doom");
    expect(evaluation.days).toBe(4);
    // HP 为 0，其余 4 项 100：总和 400 → 800；7 个 good + 第 4 天。
    expect(evaluation.score).toBe(800 + 700 + 200);
  });

  it("3 星但 neutral 结局可以并存", () => {
    expect(evaluateRun(makeRun({ specificResource: 59 }))).toEqual({
      score: 1600,
      stars: 3,
      ending: "neutral",
      days: 7,
    });
  });
});
