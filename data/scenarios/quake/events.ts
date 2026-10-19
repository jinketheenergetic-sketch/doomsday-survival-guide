/**
 * 地裂之日（quake）事件牌组。
 *
 * 固定 9 张：1 个开场 + 7 个中段 + 1 个终局。每张卡 3 个选项（good / ok / bad），
 * 其中 5 张中段事件带风险分支，保证任意 5 张中段组成的牌组都至少有 2 个风险选项。
 *
 * 知识卡 id 对应 US-017 将要落地的 6 张地震知识卡：
 * - quake-drop-cover-hold-on：趴下、掩护、抓稳
 * - quake-no-elevator：地震时禁用电梯
 * - quake-gas-leak：燃气泄漏不开关电器
 * - quake-tsunami-vertical：海啸可能多波，优先垂直撤离
 * - quake-rubble-tapping：废墟中敲击求救、节省体力
 * - quake-pressure-bleeding：直接加压止血
 */

import type { GameEvent } from "@/lib/types";

export const quakeEvents: readonly GameEvent[] = [
  {
    id: "quake-opening-shake",
    scenarioId: "quake",
    phase: "opening",
    act: "开场",
    title: "12 楼，上午 9:47",
    body: "公寓开始剧烈摇晃时，你正端着今天的第一杯咖啡。书架上的书像被谁抽走了耐心，一本接一本地往下跳。窗外有人在尖叫，电梯的数字停在 12，然后熄灭了。",
    knowledgeId: "quake-drop-cover-hold-on",
    choices: [
      {
        id: "quake-opening-shake-a",
        label: "钻到坚固餐桌下，护住头颈，抓住桌腿",
        quality: "good",
        effects: { energy: -8, sanity: 4 },
        specificEffect: 6,
        resultText:
          "桌子替你挨了几下。晃动停下时，你发现自己还完整地抱着桌腿，咖啡居然也没洒完。",
        knowledgeId: "quake-drop-cover-hold-on",
      },
      {
        id: "quake-opening-shake-b",
        label: "扶着墙冲向门口，赌晃动马上停",
        quality: "ok",
        risk: {
          probability: 45,
          successEffects: { energy: -6, sanity: -2 },
          failureEffects: { hp: -12, sanity: -8, energy: -10 },
          successSpecificEffect: 2,
          failureSpecificEffect: -8,
          successText:
            "你刚摸到门框，晃动就停了。你决定把这归功于自己的果断，而不是运气。",
          failureText:
            "你在走廊上被甩到墙边，头顶的消防栓箱盖完成了自由落体。",
        },
        resultText: "你觉得门框比桌子更有安全感，虽然你还没跑到。",
        knowledgeId: "quake-drop-cover-hold-on",
      },
      {
        id: "quake-opening-shake-c",
        label: "按电梯下楼，顺便在镜子里整理头发",
        quality: "bad",
        effects: { hp: -15, sanity: -12, energy: -6 },
        specificEffect: -15,
        resultText:
          "电梯没有来。镜子倒是照出了你脸上「我刚才为什么按电梯」的表情。",
        knowledgeId: "quake-no-elevator",
      },
    ],
  },
  {
    id: "quake-middle-stairs",
    scenarioId: "quake",
    phase: "middle",
    act: "撤离",
    title: "楼梯间的那道裂缝",
    body: "主震停了，余震还在排队。楼梯间的墙面上裂开一道缝，像大楼在冲你咧嘴笑。电梯已经停电，应急灯把台阶照成一种临终关怀的暖黄色。",
    knowledgeId: "quake-no-elevator",
    choices: [
      {
        id: "quake-middle-stairs-a",
        label: "走楼梯，靠内侧，扶稳扶手快速往下撤",
        quality: "good",
        effects: { energy: -12, sanity: 3 },
        specificEffect: 4,
        resultText:
          "你贴着内侧一阶一阶往下走。裂缝在头顶张着嘴，但你们一路无话。",
        knowledgeId: "quake-no-elevator",
      },
      {
        id: "quake-middle-stairs-b",
        label: "沿着楼梯外侧一路小跑，能快一秒是一秒",
        quality: "ok",
        risk: {
          probability: 50,
          successEffects: { energy: -8, sanity: 2 },
          failureEffects: { hp: -14, energy: -10, sanity: -4 },
          successSpecificEffect: 2,
          failureSpecificEffect: -8,
          successText:
            "你比平时快了整整两分钟。落地时腿在抖，但人还在，这就算赢了。",
          failureText:
            "一块松动的踏步在你脚下翻了脸。你坐着滑完了最后半层楼。",
        },
        resultText: "你决定用速度换时间，顺便无视了墙上的裂缝。",
        knowledgeId: "quake-no-elevator",
      },
      {
        id: "quake-middle-stairs-c",
        label: "等电梯恢复，12 楼走下去太累了",
        quality: "bad",
        effects: { hp: -10, sanity: -10, energy: -5 },
        specificEffect: -12,
        resultText:
          "电梯始终没恢复。你在楼道里站了十分钟，听完了余震的完整专辑。",
        knowledgeId: "quake-no-elevator",
      },
    ],
  },
  {
    id: "quake-middle-gas",
    scenarioId: "quake",
    phase: "middle",
    act: "燃气",
    title: "厨房里的煤气味",
    body: "厨房飘来一股煤气味，浓得像有人把整个燃气公司请进了你家。你刚想开灯看看阀门在哪，手指停在了开关上。",
    knowledgeId: "quake-gas-leak",
    choices: [
      {
        id: "quake-middle-gas-a",
        label: "不碰任何电器，关掉总阀、开窗，然后立刻撤离",
        quality: "good",
        effects: { energy: -6, sanity: 4 },
        specificEffect: 4,
        resultText:
          "你摸黑关了总阀，开窗，然后出门。整栋楼里只有你没按开关。",
        knowledgeId: "quake-gas-leak",
      },
      {
        id: "quake-middle-gas-b",
        label: "用湿毛巾捂住口鼻，折返厨房把阀门拧上",
        quality: "ok",
        risk: {
          probability: 60,
          successEffects: { energy: -8, sanity: 2 },
          failureEffects: { hp: -10, sanity: -8, energy: -10 },
          successSpecificEffect: 2,
          failureSpecificEffect: -6,
          successText:
            "你屏住呼吸冲进去，阀门拧动了。出门时你吸了一大口新鲜空气，像刚学会呼吸。",
          failureText:
            "你在厨房里多待了三秒，眼前开始出现小星星。阀门关没关，你自己也记不清了。",
        },
        resultText: "你决定和燃气比一次憋气，顺便把阀门关掉。",
        knowledgeId: "quake-gas-leak",
      },
      {
        id: "quake-middle-gas-c",
        label: "开灯找阀门，顺便点根烟冷静一下",
        quality: "bad",
        effects: { hp: -25, sanity: -15, energy: -8 },
        specificEffect: -18,
        resultText:
          "灯没亮，你的打火机亮了。后面的剧情由消防队接手，你只负责当观众。",
        knowledgeId: "quake-gas-leak",
      },
    ],
  },
  {
    id: "quake-middle-tsunami",
    scenarioId: "quake",
    phase: "middle",
    act: "海啸",
    title: "手机弹出的海啸警报",
    body: "手机突然弹出海啸警报：预计 20 分钟后抵达海岸。你住的地方离海八公里，但地图上那八公里现在看起来只有一张纸那么薄。",
    knowledgeId: "quake-tsunami-vertical",
    choices: [
      {
        id: "quake-middle-tsunami-a",
        label: "立刻往高处走，垂直撤离到高地或高层建筑上层",
        quality: "good",
        effects: { energy: -15, sanity: 5 },
        specificEffect: 8,
        resultText:
          "你往高处爬，警报在身后一遍遍重复。海啸不挑观众，它挑高度。",
        knowledgeId: "quake-tsunami-vertical",
      },
      {
        id: "quake-middle-tsunami-b",
        label: "先冲回家拿应急包和证件，再往高处跑",
        quality: "ok",
        risk: {
          probability: 55,
          successEffects: { food: 10, water: 10, energy: -12 },
          failureEffects: { hp: -18, energy: -15, water: -8 },
          successSpecificEffect: 3,
          failureSpecificEffect: -10,
          successText:
            "你抱着应急包冲上坡顶，回头时第一波浪刚好拍上你刚才站的路口。",
          failureText:
            "你在家里多找了三十秒的充电器，出门时水已经漫过脚踝。",
        },
        resultText: "你决定在逃命前先办点正事。时间表不太同意。",
        knowledgeId: "quake-tsunami-vertical",
      },
      {
        id: "quake-middle-tsunami-c",
        label: "去海边看看浪到底有多大",
        quality: "bad",
        effects: { hp: -30, sanity: -20, energy: -12 },
        specificEffect: -15,
        resultText: "你看到了这辈子最大的浪。浪也看到了你。",
        knowledgeId: "quake-tsunami-vertical",
      },
    ],
  },
  {
    id: "quake-middle-rubble",
    scenarioId: "quake",
    phase: "middle",
    act: "废墟",
    title: "压在书架下的下午",
    body: "余震把书架整个放倒，你的腿被压在下面。灰尘里什么都看不清，只听得见自己的呼吸，和远处偶尔传来的敲击声。",
    knowledgeId: "quake-rubble-tapping",
    choices: [
      {
        id: "quake-middle-rubble-a",
        label: "用硬物有节奏地敲击管道或墙壁，保存体力",
        quality: "good",
        effects: { energy: -4, sanity: 6 },
        specificEffect: 2,
        resultText:
          "你敲三下，停一停。二十分钟后，隔壁也敲了三下。你们成了这栋楼里最默契的邻居。",
        knowledgeId: "quake-rubble-tapping",
      },
      {
        id: "quake-middle-rubble-b",
        label: "一边大喊救命一边试图搬开书架",
        quality: "ok",
        effects: { energy: -15, hp: -8, sanity: -4 },
        specificEffect: -2,
        resultText:
          "你喊了很久，也搬了很久。书架纹丝不动，你的嗓子先搬家了。",
        knowledgeId: "quake-rubble-tapping",
      },
      {
        id: "quake-middle-rubble-c",
        label: "继续用尽全力尖叫，直到有人听见",
        quality: "bad",
        effects: { hp: -12, energy: -20, sanity: -10 },
        specificEffect: -8,
        resultText:
          "你的尖叫声很专业，体力消耗也很专业。救援队后来说，他们其实更早听见了管道声。",
        knowledgeId: "quake-rubble-tapping",
      },
    ],
  },
  {
    id: "quake-middle-bleeding",
    scenarioId: "quake",
    phase: "middle",
    act: "急救",
    title: "邻居老陈的小腿",
    body: "邻居老陈的小腿被碎玻璃划开一道口子，血正顺着裤管往地上滴。他坚持说自己没事，只是「有点口渴」。",
    knowledgeId: "quake-pressure-bleeding",
    choices: [
      {
        id: "quake-middle-bleeding-a",
        label: "用干净布料直接压住伤口，持续加压并呼叫救援",
        quality: "good",
        effects: { sanity: 8, energy: -8 },
        specificEffect: 4,
        resultText:
          "你压住伤口，老陈的脸色慢慢从白纸变回人类。他说这比他的医保体验好多了。",
        knowledgeId: "quake-pressure-bleeding",
      },
      {
        id: "quake-middle-bleeding-b",
        label: "找根布条在伤口上方用力扎紧，当止血带用",
        quality: "ok",
        risk: {
          probability: 55,
          successEffects: { sanity: 5, energy: -6 },
          failureEffects: { sanity: -8, energy: -10 },
          successSpecificEffect: 3,
          failureSpecificEffect: -6,
          successText:
            "布条扎住了，血慢慢停了。你松了一口气，老陈也是。",
          failureText:
            "布条太紧，老陈的脚趾开始发紫；松一点又止不住血。你终于理解急救课为什么要考试。",
        },
        resultText: "你决定凭记忆复刻一个止血带。",
        knowledgeId: "quake-pressure-bleeding",
      },
      {
        id: "quake-middle-bleeding-c",
        label: "抓把土按在伤口上，老话说土能止血",
        quality: "bad",
        effects: { sanity: -10, energy: -5 },
        specificEffect: -8,
        resultText:
          "血是止住了一点，伤口也成功升级成了破伤风候选。老陈看你的眼神像在看一位民间科学家。",
        knowledgeId: "quake-pressure-bleeding",
      },
    ],
  },
  {
    id: "quake-middle-looting",
    scenarioId: "quake",
    phase: "middle",
    act: "补给",
    title: "超市门口的哄抢",
    body: "超市门口围了一群人，有人在搬水，有人在搬电视，还有人单纯在搬。卷帘门被撬开一半，足够一个成年人弯腰钻进去。",
    knowledgeId: "quake-pressure-bleeding",
    choices: [
      {
        id: "quake-middle-looting-a",
        label: "用随身物品换取必需品，或者排队有序取用",
        quality: "good",
        effects: { food: 15, water: 12, sanity: 5, energy: -6 },
        specificEffect: 3,
        resultText:
          "你用半包烟换了两瓶水，又帮店主扶正了货架。末日里，体面也是一种硬通货。",
        knowledgeId: "quake-pressure-bleeding",
      },
      {
        id: "quake-middle-looting-b",
        label: "绕到后门，趁乱搬一箱就走",
        quality: "ok",
        risk: {
          probability: 55,
          successEffects: { food: 20, water: 10, energy: -10, sanity: -3 },
          failureEffects: { hp: -15, sanity: -8, food: 2 },
          successSpecificEffect: 4,
          failureSpecificEffect: -8,
          successText:
            "后门没锁，你抱走一箱压缩饼干，没人注意到。至少今天没人。",
          failureText:
            "后门有人守着。你抱着一箱饼干被人群追了两条街，最后只剩两包。",
        },
        resultText: "你决定走后门，走一条比较省事的道德路线。",
        knowledgeId: "quake-pressure-bleeding",
      },
      {
        id: "quake-middle-looting-c",
        label: "硬挤进去抢最显眼的那箱水",
        quality: "bad",
        effects: { water: 8, hp: -18, sanity: -12 },
        specificEffect: -6,
        resultText:
          "你抢到了水，也抢到了三只手和一句「你等着」。水洒了一半，剩下的有股别人的味道。",
        knowledgeId: "quake-pressure-bleeding",
      },
    ],
  },
  {
    id: "quake-middle-night",
    scenarioId: "quake",
    phase: "middle",
    act: "过夜",
    title: "今晚睡哪儿",
    body: "天黑了，余震还没下班。你面前有三个睡觉选项：空旷的广场、自己的车，以及看起来还站着的家。",
    knowledgeId: "quake-drop-cover-hold-on",
    choices: [
      {
        id: "quake-middle-night-a",
        label: "在空旷地或车里过夜，远离受损建筑",
        quality: "good",
        effects: { energy: 10, sanity: 5 },
        specificEffect: 5,
        resultText:
          "你把自己塞进驾驶座，座椅放倒。整夜余震不断，但头顶没有东西会掉下来。",
        knowledgeId: "quake-drop-cover-hold-on",
      },
      {
        id: "quake-middle-night-b",
        label: "回自家楼道里将就一晚，至少熟悉",
        quality: "ok",
        effects: { energy: 4, sanity: -6, hp: -5 },
        specificEffect: -8,
        resultText:
          "楼道很熟悉，裂缝也很熟悉。凌晨三点，一块墙皮落在你旁边，替你做了决定。",
        knowledgeId: "quake-drop-cover-hold-on",
      },
      {
        id: "quake-middle-night-c",
        label: "回 12 楼的家睡，床总比车舒服",
        quality: "bad",
        effects: { hp: -20, sanity: -12, energy: 2 },
        specificEffect: -18,
        resultText:
          "床确实很舒服。天花板也是。凌晨的余震帮你重新定义了「卧室」。",
        knowledgeId: "quake-drop-cover-hold-on",
      },
    ],
  },
  {
    id: "quake-finale-summit",
    scenarioId: "quake",
    phase: "finale",
    act: "终局",
    title: "第七天的三个方向",
    body: "第七天，余震终于稀疏下来。山顶的临时避难点亮着灯，废墟边有人在喊名字，而你听说自家那栋楼的废墟里，还有一只猫在叫。",
    knowledgeId: "quake-rubble-tapping",
    choices: [
      {
        id: "quake-finale-summit-a",
        label: "去山顶避难点报到，然后加入救援队",
        quality: "good",
        effects: { hp: 8, sanity: 12, energy: -10, food: -8, water: -8 },
        specificEffect: 8,
        resultText:
          "你在山顶领到了一瓶水和一件反光背心。后来你从废墟里挖出了三个人和一只猫。",
        knowledgeId: "quake-rubble-tapping",
      },
      {
        id: "quake-finale-summit-b",
        label: "直接加入废墟搜救，顾不上先去避难点了",
        quality: "ok",
        risk: {
          probability: 50,
          successEffects: {
            hp: 5,
            sanity: 15,
            energy: -15,
            food: -10,
            water: -10,
          },
          failureEffects: {
            hp: -22,
            sanity: -10,
            energy: -18,
            food: -10,
            water: -10,
          },
          successSpecificEffect: 8,
          failureSpecificEffect: -15,
          successText:
            "你和陌生人一起抬开预制板，救出一个还在骂人的大爷。他骂得很有中气，说明情况不错。",
          failureText:
            "余震在你钻进缝隙时到来。你被拖出来时，救援队先救了你。",
        },
        resultText: "你决定把专业的事交给热情。",
        knowledgeId: "quake-rubble-tapping",
      },
      {
        id: "quake-finale-summit-c",
        label: "独自回废墟找猫，谁劝都不听",
        quality: "bad",
        effects: { hp: -20, sanity: -12, energy: -15 },
        specificEffect: -18,
        resultText:
          "猫没找到，你被自己的沙发认了出来。第二天，救援队在同一堆废墟里发现了你和一只明显不是猫的玩偶。",
        knowledgeId: "quake-rubble-tapping",
      },
    ],
  },
];
