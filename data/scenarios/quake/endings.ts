/**
 * 地裂之日（quake）结局。
 *
 * 固定 3 个：best / neutral / doom 各一个。id 采用 `<scenarioId>-<tone>`，
 * 与 `resolveEnding` 返回的基调一一对应，结算时按 `scenarioId + tone` 取用。
 */

import type { Ending } from "@/lib/types";

export const quakeEndings: readonly Ending[] = [
  {
    id: "quake-best",
    scenarioId: "quake",
    tone: "best",
    title: "山顶信号灯",
    description:
      "山顶的临时避难点原本只有一盏应急灯。你报到之后，它变成了两盏、三盏，最后成了一整片。后来人们说，那几天夜里最让人安心的不是余震停了，而是山脊上那串一直亮着的灯。你只是负责给其中一盏换电池，顺便救出了三个人和一只猫。",
  },
  {
    id: "quake-neutral",
    scenarioId: "quake",
    tone: "neutral",
    title: "余震中的志愿者",
    description:
      "你没有去山顶，也没有走远，就在废墟边上留了下来。白天分发水和饼干，晚上帮人认领彼此。没有人给你发证件，大家还是一致同意你叫「志愿者」。余震偶尔还会来，但你已经能一边发抖一边把物资表填完。",
  },
  {
    id: "quake-doom",
    scenarioId: "quake",
    tone: "doom",
    title: "被自己家沙发纪念的人",
    description:
      "你执意回废墟找猫。猫没找到，你却被自己家的沙发认了出来。救援队发现你的时候，你正和一只明显不是猫的玩偶并排躺着，姿势相当安详。后来那片废墟被改成了纪念广场，长椅上刻着一行小字：沙发记得每一个坐过它的人。",
  },
];
