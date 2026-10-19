/**
 * 场景内容查询。
 *
 * 页面与引擎通过 `getScenarioContent(slug)` 一次拿到场景元数据与内容；
 * 未知 slug 返回 `undefined`，由页面转换为 404。
 * 数据来自 `data/scenarios/index.ts` 对 7 个场景 events / endings / knowledge 的聚合，
 * 只包含已落地的真实内容，不回退到占位牌组。
 */

import { getScenarioContent as findScenarioContent } from "@/data/scenarios";
import type { ScenarioContent } from "@/lib/types";

/** 按 slug 取场景完整内容；未知 slug 返回 `undefined`。 */
export function getScenarioContent(
  slug: string,
): ScenarioContent | undefined {
  return findScenarioContent(slug);
}
