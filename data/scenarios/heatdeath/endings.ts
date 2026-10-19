/**
 * 热寂终点（heatdeath）结局。
 *
 * 固定 3 个：best / neutral / doom 各一个。id 采用 `<scenarioId>-<tone>`，
 * 与 `resolveEnding` 返回的基调一一对应，结算时按 `scenarioId + tone` 取用。
 * 三个结局分别呼应终局事件 `heatdeath-finale-three-ways` 的 good / ok / bad 分支。
 */

import type { Ending } from "@/lib/types";

export const heatdeathEndings: readonly Ending[] = [
  {
    id: "heatdeath-best",
    scenarioId: "heatdeath",
    tone: "best",
    title: "热泉边的最后一场火锅",
    description:
      "泉眼凿开的那天，热水涌出来，把周围的冰化成一圈亮晶晶的泥。你们用旧锅、冻菜和仅剩的盐办了一场火锅，白气升到很高的地方，像给宇宙回了一条消息。后来这里成了附近唯一还亮着灯的地方：有人来取暖，有人来换食物，有人只是坐一会儿。你把「先到先得，留一锅给下一个人」写在木板上，钉在泉边。恒星确实灭了，但每个走进来的人都会先被塞一碗热汤。宇宙没有回应你们的招呼，可热气一直在往上飘，像一句说给自己听的、很长很长的晚安。",
  },
  {
    id: "heatdeath-neutral",
    scenarioId: "heatdeath",
    tone: "neutral",
    title: "宇宙最后一位哲学家",
    description:
      "你坐上了那把金属椅子，替所有人回答「这一切有什么意义」。有人来听，有人路过，有人只是需要一个还在说话的声音。AI 负责记录，邻居负责点头，你负责把混乱的九天神化成一套能讲得下去的说法。偶尔你会想起泉眼和火锅的味道，但椅子已经坐热了，提问的人也还在排队。你没有拯救谁，也没有失去谁；你成了一个职位、一个符号、一段被刻在石头上的解释。宇宙关不关机已经不重要了，重要的是明天下午还有一场问答，而你知道自己会准时到场。",
  },
  {
    id: "heatdeath-doom",
    scenarioId: "heatdeath",
    tone: "doom",
    title: "绝对零度的行为艺术",
    description:
      "提灯被推入黑暗，光点缩成一颗很小的星，然后消失。你保持着挥手的姿势，直到手指僵住、膝盖锁死，成了一座面向宇宙深处的雕塑。后来有人找到这里，看见冰层下那个轮廓，和旁边一行凿得很用力的字：「作品名：绝对零度。」他们把坐标记进地图，又把这件事讲给每一个准备把最后一点资源送出去的人听。善意本身没有错，错的是把它当成了不需要取暖的理由。你替全人类完成了一次漂亮的谢幕，只是没有人来得及告诉你：观众其实更想看你活着谢幕。",
  },
];
