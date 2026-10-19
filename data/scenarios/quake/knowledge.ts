/**
 * 地裂之日（quake）知识卡。
 *
 * 6 张卡对应 content-brief 6.2 列出的地震生存要点。
 * id 必须与 `data/scenarios/quake/events.ts` 中的 knowledgeId 引用保持一致。
 */

import type { KnowledgeCard } from "@/lib/types";

export const quakeKnowledge: readonly KnowledgeCard[] = [
  {
    id: "quake-drop-cover-hold-on",
    scenarioId: "quake",
    title: "趴下、掩护、抓稳",
    content:
      "地震开始时应立刻趴下（Drop），钻到坚固的桌子或书桌下（Cover），护住头颈并抓住桌腿（Hold On）。如果附近没有桌子，就蹲在承重墙内侧，远离窗户、玻璃、吊灯和高柜。不要冲向电梯，不要跳窗，也不要在晃动中跑到室外——大多数受伤发生在移动或坠物时。晃动停止后再有序撤离。",
    icon: "house-crack",
  },
  {
    id: "quake-no-elevator",
    scenarioId: "quake",
    title: "地震时，电梯是最差的捷径",
    content:
      "地震后电梯可能停电、卡层、门体变形，甚至因配重失衡而坠落，因此永远不要乘电梯逃生。应走楼梯，靠内侧、扶稳扶手，注意脱落的墙皮和照明缺失。若你已经在电梯里，按下所有楼层按钮，在最近停靠的楼层尽快离开；被困时使用紧急呼叫按钮，保存体力等待救援。",
    icon: "elevator",
  },
  {
    id: "quake-gas-leak",
    scenarioId: "quake",
    title: "闻到燃气味，连开关都别碰",
    content:
      "地震后闻到燃气味，先不要开灯、关灯、按任何电器开关，也不要使用打火机、火柴或燃气灶——一个电火花就可能点燃积聚的燃气。若安全且阀门可接近，关闭燃气总阀、打开门窗通风，然后立刻撤离，到室外再联系燃气公司或报警。不要用手机在泄漏区域内打电话。任何情况下都不要独自返回检查。",
    icon: "fire",
  },
  {
    id: "quake-tsunami-vertical",
    scenarioId: "quake",
    title: "海啸从来不止一波",
    content:
      "沿海发生强震后，海啸可能在几分钟内抵达，且第一波往往不是最大的，后续波浪会持续数小时。听到警报或看到海水异常退去，立刻向内陆高地或高层建筑的上层垂直撤离，不要开车沿海岸线跑，更不要到海边围观。除非官方宣布解除，否则不要返回低处——海啸的波列可能有数十分钟的间隔。",
    icon: "water",
  },
  {
    id: "quake-rubble-tapping",
    scenarioId: "quake",
    title: "在废墟里，敲比喊更管用",
    content:
      "被埋压时，持续大喊会迅速消耗体力和水分，也可能吸入大量粉尘。应敲击管道、墙壁或金属构件，有节奏地敲三下、停一停，让救援人员辨认方向。用手或衣物护住口鼻，减少灰尘吸入；尽量保存体力，间歇性求救。不要点火、不要随意搬动压住身体的构件，以免引发二次坍塌。",
    icon: "tower-broadcast",
  },
  {
    id: "quake-pressure-bleeding",
    scenarioId: "quake",
    title: "止血第一步永远是直接加压",
    content:
      "外伤出血时，用干净布料或纱布直接压住伤口，持续用力 10–15 分钟，不要频繁掀开查看。敷料被血浸透就在上面再加一层，不要抽掉原来的。四肢大出血且加压无效时，才考虑在伤口近心端使用止血带，并记录时间。止血的同时呼叫救援，注意伤者是否面色苍白、发冷、意识模糊等休克表现。",
    icon: "kit-medical",
  },
];
