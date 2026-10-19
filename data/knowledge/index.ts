import { aiKnowledge } from "@/data/scenarios/ai/knowledge";
import { droughtKnowledge } from "@/data/scenarios/drought/knowledge";
import { floodKnowledge } from "@/data/scenarios/flood/knowledge";
import { heatdeathKnowledge } from "@/data/scenarios/heatdeath/knowledge";
import { iceKnowledge } from "@/data/scenarios/ice/knowledge";
import { meteorKnowledge } from "@/data/scenarios/meteor/knowledge";
import { quakeKnowledge } from "@/data/scenarios/quake/knowledge";
import type { KnowledgeCard } from "@/lib/types";

/**
 * 全局知识卡注册表。
 *
 * 汇总 7 个场景各 6 张、共 42 张知识卡，供首页知识小贴士、生存手册等
 * 跨场景界面按 id 查询。
 */
export const knowledgeCards: readonly KnowledgeCard[] = [
  ...floodKnowledge,
  ...quakeKnowledge,
  ...meteorKnowledge,
  ...iceKnowledge,
  ...aiKnowledge,
  ...droughtKnowledge,
  ...heatdeathKnowledge,
];

export const knowledgeById: ReadonlyMap<string, KnowledgeCard> = new Map(
  knowledgeCards.map((card) => [card.id, card]),
);

/** 按 id 查询知识卡；未知 id 返回 undefined。 */
export function getKnowledgeCard(
  id: string,
): KnowledgeCard | undefined {
  return knowledgeById.get(id);
}
