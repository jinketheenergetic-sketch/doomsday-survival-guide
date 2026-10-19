import { describe, expect, it } from "vitest";

import { mulberry32, randomInt, type Rng } from "@/lib/engine/rng";

function sequence(rng: Rng, count: number): number[] {
  return Array.from({ length: count }, () => rng());
}

describe("mulberry32", () => {
  it("同一种子产生完全相同的序列", () => {
    const first = sequence(mulberry32(20261019), 50);
    const second = sequence(mulberry32(20261019), 50);

    expect(second).toEqual(first);
  });

  it("不同种子产生不同的序列", () => {
    const first = sequence(mulberry32(1), 20);
    const second = sequence(mulberry32(2), 20);

    expect(second).not.toEqual(first);
  });

  it("输出始终落在 [0, 1) 区间", () => {
    const rng = mulberry32(42);

    for (let i = 0; i < 1000; i += 1) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("支持 0 与负数种子", () => {
    expect(sequence(mulberry32(0), 5)).toEqual(sequence(mulberry32(0), 5));
    expect(sequence(mulberry32(-7), 5)).toEqual(sequence(mulberry32(-7), 5));
  });
});

describe("randomInt", () => {
  it("结果始终落在闭区间 [min, max] 内", () => {
    const rng = mulberry32(99);

    for (let i = 0; i < 1000; i += 1) {
      const value = randomInt(rng, 0, 6);
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(6);
    }
  });

  it("随机源为 0 时取到下界", () => {
    expect(randomInt(() => 0, 3, 9)).toBe(3);
  });

  it("随机源接近 1 时取到上界", () => {
    expect(randomInt(() => 0.9999999999, 3, 9)).toBe(9);
  });

  it("随机源恰好返回 1 时仍不越界", () => {
    expect(randomInt(() => 1, 3, 9)).toBe(9);
  });

  it("区间上下界相等时返回该值", () => {
    const rng = mulberry32(5);
    expect(randomInt(rng, 4, 4)).toBe(4);
  });

  it("对小数边界做整数收敛", () => {
    expect(randomInt(() => 0, 2.3, 5.8)).toBe(3);
    expect(randomInt(() => 0.9999999999, 2.3, 5.8)).toBe(5);
  });

  it("区间无效时抛出 RangeError", () => {
    const rng = mulberry32(1);
    expect(() => randomInt(rng, 5, 4)).toThrow(RangeError);
    expect(() => randomInt(rng, Number.NaN, 4)).toThrow(RangeError);
  });
});
