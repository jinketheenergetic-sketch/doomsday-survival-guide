import { describe, expect, it } from "vitest";

import {
  BEST_ENDING_MIN_SCORE,
  BEST_ENDING_MIN_SPECIFIC,
  DEPRIVATION_HP_PENALTY,
  INITIAL_RESOURCES,
  MIDDLE_EVENT_DRAW_COUNT,
  RESOURCE_MAX,
  RESOURCE_MIN,
  RUN_DAYS,
  SCORE_BAD_CHOICE,
  SCORE_GOOD_CHOICE,
  SCORE_PER_DAY,
  SCORE_PER_RESOURCE_AVG,
  THREE_STAR_MIN_SCORE,
  TWO_STAR_MIN_SCORE,
} from "@/lib/engine/constants";
import { RESOURCE_KEYS } from "@/lib/types";

describe("引擎常量", () => {
  it("初始资源覆盖全部 5 项资源且都在合法范围内", () => {
    expect(Object.keys(INITIAL_RESOURCES).sort()).toEqual(
      [...RESOURCE_KEYS].sort(),
    );

    for (const value of Object.values(INITIAL_RESOURCES)) {
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(RESOURCE_MIN);
      expect(value).toBeLessThanOrEqual(RESOURCE_MAX);
    }
  });

  it("资源边界有效", () => {
    expect(RESOURCE_MIN).toBe(0);
    expect(RESOURCE_MAX).toBe(100);
    expect(RESOURCE_MIN).toBeLessThan(RESOURCE_MAX);
  });

  it("局内天数与抽牌数与 PRD 一致", () => {
    expect(RUN_DAYS).toBe(7);
    expect(MIDDLE_EVENT_DRAW_COUNT).toBe(5);
  });

  it("评分系数与公式一致", () => {
    expect(SCORE_PER_RESOURCE_AVG).toBe(10);
    expect(SCORE_GOOD_CHOICE).toBe(100);
    expect(SCORE_BAD_CHOICE).toBe(50);
    expect(SCORE_PER_DAY).toBe(50);
  });

  it("星级阈值有序", () => {
    expect(TWO_STAR_MIN_SCORE).toBe(1100);
    expect(THREE_STAR_MIN_SCORE).toBe(1600);
    expect(TWO_STAR_MIN_SCORE).toBeLessThan(THREE_STAR_MIN_SCORE);
  });

  it("best 结局阈值与评分上限自洽", () => {
    // avg(资源) 最多 100 分 → 1000；7 天全 good → 700 + 350，总分可达 2050。
    const maxScore =
      RESOURCE_MAX * SCORE_PER_RESOURCE_AVG +
      RUN_DAYS * SCORE_GOOD_CHOICE +
      RUN_DAYS * SCORE_PER_DAY;

    expect(maxScore).toBeGreaterThanOrEqual(THREE_STAR_MIN_SCORE);
    expect(BEST_ENDING_MIN_SCORE).toBe(THREE_STAR_MIN_SCORE);
    expect(BEST_ENDING_MIN_SPECIFIC).toBeGreaterThan(RESOURCE_MIN);
    expect(BEST_ENDING_MIN_SPECIFIC).toBeLessThanOrEqual(RESOURCE_MAX);
  });

  it("断水断食惩罚为正整数", () => {
    expect(Number.isInteger(DEPRIVATION_HP_PENALTY)).toBe(true);
    expect(DEPRIVATION_HP_PENALTY).toBe(5);
  });
});
