import type { KnowledgeCard } from "@/lib/types";

/**
 * 全局知识卡注册表。
 *
 * 各场景的 `data/scenarios/<slug>/knowledge.ts` 落地后，将卡片汇总到这里，
 * 供首页知识小贴士、生存手册等跨场景界面按 id 查询。
 * 内容尚未接入时允许为空数组，调用方必须处理查不到卡片的情况。
 */
export const knowledgeCards: readonly KnowledgeCard[] = [];

export const knowledgeById: ReadonlyMap<string, KnowledgeCard> = new Map(
  knowledgeCards.map((card) => [card.id, card]),
);

/** 按 id 查询知识卡；未知 id 返回 undefined。 */
export function getKnowledgeCard(
  id: string,
): KnowledgeCard | undefined {
  return knowledgeById.get(id);
}
