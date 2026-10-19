/**
 * 永夜冰河（ice）结局。
 *
 * 固定 3 个：best / neutral / doom 各一个。id 采用 `<scenarioId>-<tone>`，
 * 与 `resolveEnding` 返回的基调一一对应，结算时按 `scenarioId + tone` 取用。
 */

import type { Ending } from "@/lib/types";

export const iceEndings: readonly Ending[] = [
  {
    id: "ice-best",
    scenarioId: "ice",
    tone: "best",
    title: "南方来的信",
    description:
      "车队在第九天出发，你是第三辆卡车后斗里的一员。三天后，港口出现在地平线上，海水是黑的，没有结冰，汽笛声哑得像刚学会说话。你在临时邮局排了四十分钟队，寄出一张明信片。半个月后，回信到了——有人还活着，有人记得你，信纸在路上被冻出过一道折痕，但字迹很暖。",
  },
  {
    id: "ice-neutral",
    scenarioId: "ice",
    tone: "neutral",
    title: "冰河公社主任",
    description:
      "三户人家、十七个人、一本写满值班表和燃料配额的笔记本，就是你的全部辖区。你学会了在会议上让每个人都说上话，也学会了在没人看见的时候把最后半块巧克力塞给最小的那个。春天来得比预报晚了六周，但没有一个人再冻着。他们开始叫你主任，你纠正了几次，后来就不纠正了。",
  },
  {
    id: "ice-doom",
    scenarioId: "ice",
    tone: "doom",
    title: "一尊很有艺术感的冰雕",
    description:
      "地下室确实安静、黑暗、恒温，恒在零下四十度。你在睡袋里蜷成一个节省空间的姿势，听着自己的呼吸越来越轻。春天来的时候，搜救队打开门，发现一尊轮廓完整、表情安详的冰雕，保存状况好得可以直接送进展览馆。标签上写着：他最后相信的，是「春天会来叫醒我」。",
  },
];
