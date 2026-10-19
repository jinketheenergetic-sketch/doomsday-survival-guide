/**
 * 场景内容查询。
 *
 * 页面与引擎通过 `getScenarioContent(slug)` 一次拿到场景元数据与内容；
 * 未知 slug 返回 `undefined`，由页面转换为 404。
 * 事件、结局与知识卡在内容 story 落地后由 `data/scenarios/index.ts` 汇总，
 * 在此之前保持空数组，游戏页使用占位牌组保证新开局可用。
 */

import { getScenario } from "@/data/scenarios";
import type { ScenarioContent } from "@/lib/types";

/** 按 slug 取场景完整内容；未知 slug 返回 `undefined`。 */
export function getScenarioContent(
  slug: string,
): ScenarioContent | undefined {
  const scenario = getScenario(slug);
  if (!scenario) return undefined;

  return {
    scenario,
    events: [],
    endings: [],
    knowledge: [],
  };
}
