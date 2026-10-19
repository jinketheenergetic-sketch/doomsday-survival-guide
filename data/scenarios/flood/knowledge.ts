/**
 * 融冰纪元（flood）知识卡。
 *
 * 6 张卡对应 content-brief 6.1 列出的洪水生存要点。
 * id 必须与 `data/scenarios/flood/events.ts` 中的 knowledgeId 引用保持一致。
 */

import type { KnowledgeCard } from "@/lib/types";

export const floodKnowledge: readonly KnowledgeCard[] = [
  {
    id: "flood-current",
    scenarioId: "flood",
    title: "15 厘米的急流也能冲倒你",
    content:
      "流动的洪水比静水危险得多：约 15 厘米深的急流就能让成年人站不稳，30 厘米可能冲走汽车。真正致命的往往不是水深，而是流速、水下缺口和漂浮杂物。不要用身体试探水流，绕路或往高处走；必须涉水时，用绳索固定在坚固锚点上，并结伴行动。",
    icon: "water",
  },
  {
    id: "flood-boil-water",
    scenarioId: "flood",
    title: "洪水不是水，是汤底",
    content:
      "洪水混着污水、粪便、燃油和化学物，绝不能直接饮用。先静置或用布过滤掉泥沙，再煮沸至少 1 分钟（高海拔地区 3 分钟）；也可按说明用无香漂白剂消毒，通常每升清水加 2 滴 5% 漂白剂、静置 30 分钟，或用净水片。过滤只能去掉杂质，不能杀菌。",
    icon: "fire",
  },
  {
    id: "flood-vertical-evacuation",
    scenarioId: "flood",
    title: "往上走，别跟水赛跑",
    content:
      "洪水上涨时，垂直撤离优先于水平逃跑：先往楼上、屋顶等高处转移，比开车或游泳穿越积水可靠得多。不要进入地下室和地下车库，水位上涨会让你来不及出来。被困高处时保存体力、等待救援，同时准备显眼的求救信号，不要为了拿财物折返低处。",
    icon: "stairs",
  },
  {
    id: "flood-hypothermia",
    scenarioId: "flood",
    title: "湿衣服正在偷走你的体温",
    content:
      "淋湿或泡过洪水后，尽快脱下湿衣物、擦干身体，换上干燥衣物并裹上毯子，重点保暖头颈和躯干。失温时不要喝酒、不要剧烈运动，也不要直接烤火或泡热水。持续发抖、说话含糊、意识模糊都是危险信号，应缓慢复温并尽快求助。",
    icon: "temperature-low",
  },
  {
    id: "flood-roof-signal",
    scenarioId: "flood",
    title: "让直升机看见你",
    content:
      "在屋顶等待救援时，白天用镜子反光、亮色布条或大号文字向空中发信号，夜间用手电有节奏地闪烁。信号要持续、醒目，别为了挥手把体力耗光，更不要冒险下水。注意直升机旋翼气流会吹落松散物品，提前固定好屋顶上的东西并护住眼睛。",
    icon: "tower-broadcast",
  },
  {
    id: "flood-wound-tetanus",
    scenarioId: "flood",
    title: "洪水里的伤口不是小事",
    content:
      "洪水携带大量细菌，任何划伤、擦伤都要立即用干净水冲洗至少 15 分钟，再用碘伏消毒并覆盖干净敷料。被生锈金属、钉子或动物咬伤后，尽快就医评估破伤风疫苗；伤口出现红肿、发热、流脓或异味，说明可能已经感染，不要硬扛。",
    icon: "kit-medical",
  },
];
