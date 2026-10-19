/**
 * 融冰纪元（flood）结局。
 *
 * 固定 3 个：best / neutral / doom 各一个。id 采用 `<scenarioId>-<tone>`，
 * 与 `resolveEnding` 返回的基调一一对应，结算时按 `scenarioId + tone` 取用。
 */

import type { Ending } from "@/lib/types";

export const floodEndings: readonly Ending[] = [
  {
    id: "flood-best",
    scenarioId: "flood",
    tone: "best",
    title: "天台上的哲学家",
    description:
      "直升机掉头的那一刻，你还在挥那块从窗帘上撕下来的橙布。后来你活了下来，也成了社区里最爱讲「15 厘米急流能冲倒成年人」的人。孩子们叫你天台哲学家，你纠正说：是幸存者，只是话多一点。",
  },
  {
    id: "flood-neutral",
    scenarioId: "flood",
    tone: "neutral",
    title: "水上社区区长",
    description:
      "水退了又涨，你没有等来救援，索性把几栋楼用绳索和木板连成了一个小小的水上社区。没有剪彩仪式，只有一张手写的值班表。大家管你叫区长，你管自己叫：还活着的人。",
  },
  {
    id: "flood-doom",
    scenarioId: "flood",
    tone: "doom",
    title: "城市官方水族馆展品",
    description:
      "洪水最终没有退。你和你那台贴满外卖磁贴的冰箱一起，成了城市官方水族馆的常设展品。讲解牌上写着：请勿投喂。偶尔有孩子问，这个展品为什么还抱着一桶没喝完的水。",
  },
];
