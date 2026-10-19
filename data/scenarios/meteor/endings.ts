/**
 * 天火降临（meteor）结局。
 *
 * 固定 3 个：best / neutral / doom 各一个。id 采用 `<scenarioId>-<tone>`，
 * 与 `resolveEnding` 返回的基调一一对应，结算时按 `scenarioId + tone` 取用。
 */

import type { Ending } from "@/lib/types";

export const meteorEndings: readonly Ending[] = [
  {
    id: "meteor-best",
    scenarioId: "meteor",
    tone: "best",
    title: "地下城管理员",
    description:
      "地下城的登记册原本只有三页。你接手之后，它变成了一本很厚的册子：谁在几号铺位、谁的药快吃完了、哪一层的通风口需要修。灯是暖黄色的，走廊里永远有人在排队，也永远有人在说谢谢。广播里偶尔还会提到地面上的灰，但在这里，名字比灰落得慢，也留得久。",
  },
  {
    id: "meteor-neutral",
    scenarioId: "meteor",
    tone: "neutral",
    title: "南迁队伍的第 7 人",
    description:
      "车队出发时有六个人，你在第七个路口加入了他们。没人问你从哪来，只递给你一瓶水和一张写着集合时间的纸。你们一路向南，油表起起落落，灰云一直跟在车后。后来你学会了在副驾上睡觉，也学会在别人沉默时不去追问。太阳还没出现，但车一直在开。",
  },
  {
    id: "meteor-doom",
    scenarioId: "meteor",
    tone: "doom",
    title: "被火山灰做成雕塑",
    description:
      "你坚持爬上屋顶看星星，因为末日总该留一点浪漫。星星没有出现，灰倒是来了很多。第二天，救援队在屋顶发现了一个轮廓完整的人形，姿势像一个正在许愿的人，灰把它保存得非常好。后来地下城的登记册上多了一行备注：他最后看的方向，是南边。",
  },
];
