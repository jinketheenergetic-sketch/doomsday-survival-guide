import { describe, expect, it } from "vitest";

import {
  applyRunResult,
  getOverallStats,
  unlockKnowledge,
} from "@/lib/progress";
import { createDefaultProgress } from "@/lib/storage";
import type { LastResult, Progress } from "@/lib/types";

function makeResult(overrides: Partial<LastResult> = {}): LastResult {
  return {
    scenarioId: "flood",
    seed: 42,
    endingId: "flood-best",
    score: 1200,
    stars: 2,
    daysSurvived: 6,
    goodCount: 4,
    badCount: 1,
    resources: { hp: 60, sanity: 70, water: 50, food: 40, energy: 30 },
    specificResource: 55,
    history: [],
    newKnowledgeIds: ["flood-k1"],
    finishedAt: "2026-10-19T00:00:00.000Z",
    ...overrides,
  };
}

function progressWithFlood(): Progress {
  const progress = createDefaultProgress();
  return {
    ...progress,
    scenarios: {
      ...progress.scenarios,
      flood: {
        bestScore: 900,
        bestStars: 2,
        endingIds: ["flood-neutral"],
        runs: 3,
      },
    },
    unlockedKnowledgeIds: ["flood-k0"],
    unlockedEndingIds: ["flood-neutral"],
    totalRuns: 3,
    totalSurvivedDays: 12,
    bestScore: 900,
  };
}

describe("applyRunResult", () => {
  it("首次结算写入场景记录与全局统计", () => {
    const progress = applyRunResult(createDefaultProgress(), makeResult());

    expect(progress.scenarios.flood).toEqual({
      bestScore: 1200,
      bestStars: 2,
      endingIds: ["flood-best"],
      runs: 1,
    });
    expect(progress.unlockedEndingIds).toEqual(["flood-best"]);
    expect(progress.unlockedKnowledgeIds).toEqual(["flood-k1"]);
    expect(progress.totalRuns).toBe(1);
    expect(progress.totalSurvivedDays).toBe(6);
    expect(progress.bestScore).toBe(1200);
  });

  it("只更新本次场景，其他场景记录保持不变", () => {
    const before = createDefaultProgress();
    const progress = applyRunResult(
      before,
      makeResult({ scenarioId: "quake", endingId: "quake-doom", score: 300 }),
    );

    expect(progress.scenarios.quake.runs).toBe(1);
    expect(progress.scenarios.flood).toEqual(before.scenarios.flood);
  });

  it("较低分的重复结算不覆盖最佳分/星级，但结局、次数与存活天数累加", () => {
    const progress = applyRunResult(
      progressWithFlood(),
      makeResult({
        endingId: "flood-best",
        score: 800,
        stars: 1,
        daysSurvived: 4,
      }),
    );

    expect(progress.scenarios.flood).toEqual({
      bestScore: 900,
      bestStars: 2,
      endingIds: ["flood-neutral", "flood-best"],
      runs: 4,
    });
    expect(progress.unlockedEndingIds).toEqual([
      "flood-neutral",
      "flood-best",
    ]);
    expect(progress.totalRuns).toBe(4);
    expect(progress.totalSurvivedDays).toBe(16);
    expect(progress.bestScore).toBe(900);
  });

  it("同一结局重复结算不会重复写入 id", () => {
    const once = applyRunResult(
      createDefaultProgress(),
      makeResult({ endingId: "flood-best" }),
    );
    const twice = applyRunResult(once, makeResult({ endingId: "flood-best" }));

    expect(twice.scenarios.flood.endingIds).toEqual(["flood-best"]);
    expect(twice.unlockedEndingIds).toEqual(["flood-best"]);
    expect(twice.scenarios.flood.runs).toBe(2);
  });

  it("更高分与更高星级会刷新最佳记录", () => {
    const progress = applyRunResult(
      progressWithFlood(),
      makeResult({ endingId: "flood-best", score: 1700, stars: 3 }),
    );

    expect(progress.scenarios.flood.bestScore).toBe(1700);
    expect(progress.scenarios.flood.bestStars).toBe(3);
    expect(progress.bestScore).toBe(1700);
  });

  it("newKnowledgeIds 去重后合入，已解锁的知识不会重复计数", () => {
    const progress = applyRunResult(
      progressWithFlood(),
      makeResult({
        newKnowledgeIds: ["flood-k0", "flood-k1", "flood-k1", "flood-k2"],
      }),
    );

    expect(progress.unlockedKnowledgeIds).toEqual([
      "flood-k0",
      "flood-k1",
      "flood-k2",
    ]);
  });

  it("不修改传入的进度对象", () => {
    const before = progressWithFlood();
    const snapshot = structuredClone(before);

    applyRunResult(before, makeResult());

    expect(before).toEqual(snapshot);
  });
});

describe("unlockKnowledge", () => {
  it("首次解锁按顺序追加新知识卡", () => {
    const progress = unlockKnowledge(createDefaultProgress(), [
      "flood-k1",
      "flood-k2",
    ]);

    expect(progress.unlockedKnowledgeIds).toEqual(["flood-k1", "flood-k2"]);
  });

  it("已解锁与 ids 内重复的条目都不会增加数量", () => {
    const before = progressWithFlood();
    const progress = unlockKnowledge(before, [
      "flood-k0",
      "flood-k1",
      "flood-k1",
      "flood-k2",
    ]);

    expect(progress.unlockedKnowledgeIds).toEqual([
      "flood-k0",
      "flood-k1",
      "flood-k2",
    ]);
  });

  it("不修改其余进度字段与传入对象", () => {
    const before = progressWithFlood();
    const snapshot = structuredClone(before);

    const progress = unlockKnowledge(before, ["flood-k1"]);

    expect(progress.scenarios).toBe(before.scenarios);
    expect(progress.totalRuns).toBe(before.totalRuns);
    expect(before).toEqual(snapshot);
  });
});

describe("getOverallStats", () => {
  it("空进度返回全 0 默认值", () => {
    expect(getOverallStats(createDefaultProgress())).toEqual({
      unlockedKnowledgeCount: 0,
      unlockedEndingCount: 0,
      totalSurvivedDays: 0,
      bestScore: 0,
    });
  });

  it("返回已解锁知识数、结局数、总存活天数与最高分", () => {
    const progress = applyRunResult(
      progressWithFlood(),
      makeResult({ newKnowledgeIds: ["flood-k1", "flood-k2"] }),
    );

    expect(getOverallStats(progress)).toEqual({
      unlockedKnowledgeCount: 3,
      unlockedEndingCount: 2,
      totalSurvivedDays: 18,
      bestScore: 1200,
    });
  });
});
