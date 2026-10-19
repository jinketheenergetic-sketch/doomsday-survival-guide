/**
 * 赤沙荒原（drought）结局。
 *
 * 固定 3 个：best / neutral / doom 各一个。id 采用 `<scenarioId>-<tone>`，
 * 与 `resolveEnding` 返回的基调一一对应，结算时按 `scenarioId + tone` 取用。
 * 三个结局分别呼应终局事件 `drought-finale-three-way` 的 good / ok / bad 分支。
 */

import type { Ending } from "@/lib/types";

export const droughtEndings: readonly Ending[] = [
  {
    id: "drought-best",
    scenarioId: "drought",
    tone: "best",
    title: "地下河的第一桶水",
    description:
      "井口用废木板围了起来，边上立着一块手写牌子：先到先打，留半桶给下一个人。第一桶水浑得像奶茶，沉淀一夜后才敢入口，但所有人都记得它被提上来时，绳子在掌心勒出的那道红印。你们顺着水痕继续往下挖，把低洼地改成了菜畦，用洗过菜的水浇地，再用太阳能蒸馏收回一点。荒原没有变绿，但地图上多了一个会被反复提到的名字。后来有人问你是怎么找到水的，你说不上来，只记得那天没有追着绿洲跑，而是低头看了很久脚下的湿沙。",
  },
  {
    id: "drought-neutral",
    scenarioId: "drought",
    tone: "neutral",
    title: "水车队的记账员",
    description:
      "你成了车队里唯一能把账算平的人：每桶水从哪来、往哪去、谁欠谁半壶，都记在一个用防水布包着的本子上。车队管饭、管水、管遮阴，也管你明天往哪走。车轮碾过盐碱地时，你偶尔会想起那口没挖完的井，和那个本可以留下的方向。夜里车队停下，你借着车灯核对数目，发现账本上自己的名字后面永远写着「随行」——不是队员，也不是外人。你合上本子，听见远处有人在分水，声音很公平，公平得像一种与你无关的天气。",
  },
  {
    id: "drought-doom",
    scenarioId: "drought",
    tone: "doom",
    title: "沙丘上的新地标",
    description:
      "你追着那座会搬家的城走了很久，久到已经分不清是它在移动，还是你在原地打转。水壶空了之后，你开始数沙丘的棱线，一条、两条、三条，数到第七条时决定坐下休息一会儿。后来路过的拾荒者在导航图上标了一个新地标：一座普通的沙丘，顶上插着一只空水壶，旁边压着一张被晒脆的纸条，上面写着「城就在前面」。他们把这个坐标叫作「黄金城入口」，因为每个问起的人都说，再往前走一点就到了。",
  },
];
