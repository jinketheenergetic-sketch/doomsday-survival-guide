import type { Scenario, ScenarioId } from "@/lib/types";

/**
 * 七个末日场景的元数据。
 * 事件牌组、结局与知识卡由各自内容文件提供，这里只放页面与引擎共用的场景信息。
 */
export const scenarios: readonly Scenario[] = [
  {
    id: "flood",
    title: "融冰纪元",
    tagline: "城市变成了水族馆，门票是你的房贷。",
    icon: "water",
    cover:
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80",
    accent: "#22d3ee",
    threatLevel: 3,
    skills: ["垂直撤离", "净水", "失温防护"],
    specificResource: {
      key: "altitude",
      label: "海拔",
      description: "你高出洪水水面的程度，越高越安全。",
      initial: 40,
    },
  },
  {
    id: "quake",
    title: "地裂之日",
    tagline: "大地打了个喷嚏，城市决定重新排版。",
    icon: "house-crack",
    cover:
      "https://images.unsplash.com/photo-1524230572899-a752b3835840?auto=format&fit=crop&w=1200&q=80",
    accent: "#f59e0b",
    threatLevel: 4,
    skills: ["Drop-Cover-Hold On", "海啸垂直撤离", "燃气安全"],
    specificResource: {
      key: "structuralIntegrity",
      label: "结构完整度",
      description: "你所在建筑还能承受多少次余震。",
      initial: 60,
    },
  },
  {
    id: "meteor",
    title: "天火降临",
    tagline: "一颗石头请全人类看烟花，然后冬天来了。",
    icon: "meteor",
    cover:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    accent: "#fb7185",
    threatLevel: 5,
    skills: ["冲击波避险", "撞击冬天", "灰尘防护"],
    specificResource: {
      key: "shelter",
      label: "遮蔽度",
      description: "住所对冲击波、灰尘与寒潮的防护程度。",
      initial: 50,
    },
  },
  {
    id: "ice",
    title: "永夜冰河",
    tagline: "零下 60 度，你的冷笑话终于有了用武之地。",
    icon: "snowflake",
    cover:
      "https://images.unsplash.com/photo-1478265409131-1f65c88f965c?auto=format&fit=crop&w=1200&q=80",
    accent: "#93c5fd",
    threatLevel: 4,
    skills: ["保温", "安全生火", "冻伤处理"],
    specificResource: {
      key: "bodyTemperature",
      label: "体温",
      description: "核心体温，掉光之前得想办法热起来。",
      initial: 70,
    },
  },
  {
    id: "ai",
    title: "后人类纪元",
    tagline: "AI 继承了文明，并向你发来《人类安置方案（征求意见稿）》。",
    icon: "robot",
    cover:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    accent: "#c084fc",
    threatLevel: 3,
    skills: ["离线生存", "数字素养", "谈判"],
    specificResource: {
      key: "machineTrust",
      label: "机器信任",
      description: "AI 对你这类人类的好感与容忍度。",
      initial: 50,
    },
  },
  {
    id: "drought",
    title: "赤沙荒原",
    tagline: "最后一滴水是你的眼泪，而你昨天已经哭干了。",
    icon: "sun",
    cover:
      "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1200&q=80",
    accent: "#fde68a",
    threatLevel: 4,
    skills: ["集水", "防沙暴", "中暑急救"],
    specificResource: {
      key: "senseOfDirection",
      label: "方向感",
      description: "在无地标的荒原里找到水与出路的能力。",
      initial: 60,
    },
  },
  {
    id: "heatdeath",
    title: "热寂终点",
    tagline: "宇宙即将关机，请保存好你的进度——哦，没有进度了。",
    icon: "star",
    cover:
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80",
    accent: "#6366f1",
    threatLevel: 5,
    skills: ["保温", "能量守恒", "心理韧性"],
    specificResource: {
      key: "residualHeat",
      label: "余温",
      description: "你还能保住的热量，宇宙最后的硬通货。",
      initial: 50,
    },
  },
];

/** 按 slug 索引的场景表。 */
export const scenarioById = Object.fromEntries(
  scenarios.map((scenario) => [scenario.id, scenario]),
) as Record<ScenarioId, Scenario>;

/** 按 slug 查询场景；未知 slug 返回 undefined。 */
export function getScenario(
  id: ScenarioId | string,
): Scenario | undefined {
  return scenarioById[id as ScenarioId];
}
