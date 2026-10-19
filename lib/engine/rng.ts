/**
 * 确定性伪随机数生成器。
 * 引擎的抽牌、风险判定都从这里取随机数，保证同一种子可复现同一局游戏。
 * 该模块是纯函数，不依赖 React 或浏览器 API。
 */

/** 返回 [0, 1) 浮点数的随机源。 */
export type Rng = () => number;

/**
 * mulberry32：32 位种子的小型确定性 PRNG。
 * 同一种子总是产生同一序列；不同种子通常产生不同序列。
 * 种子会先按无符号 32 位处理，因此负数与小数也能接受。
 */
export function mulberry32(seed: number): Rng {
  let state = seed >>> 0;

  return function next(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 取 [min, max] 闭区间内的随机整数（两端都可取到）。
 * min / max 会先按整数边界收敛：min 向上取整、max 向下取整。
 * 区间无效（取整后 max < min）时抛出 RangeError。
 */
export function randomInt(rng: Rng, min: number, max: number): number {
  const low = Math.ceil(min);
  const high = Math.floor(max);

  if (!Number.isFinite(low) || !Number.isFinite(high)) {
    throw new RangeError("randomInt 的区间必须为有限数值");
  }
  if (high < low) {
    throw new RangeError(`randomInt 的区间无效：${min} – ${max}`);
  }

  // rng() 约定返回 [0, 1)，此处再钳一次以兼容返回 1 的自定义随机源。
  const ratio = Math.min(Math.max(rng(), 0), 0.9999999999);
  return low + Math.floor(ratio * (high - low + 1));
}
