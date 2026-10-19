/**
 * 天火降临（meteor）事件牌组。
 *
 * 固定 9 张：1 个开场 + 7 个中段 + 1 个终局。每张卡 3 个选项（good / ok / bad），
 * 其中 5 张中段事件带风险分支，保证任意 5 张中段组成的牌组都至少有 2 个风险选项。
 *
 * 知识卡 id 对应后续落地的 6 张陨石知识卡：
 * - meteor-blast-shelter：冲击波前躲进坚固建筑、背对玻璃
 * - meteor-no-look：不直视火球
 * - meteor-wet-mask：湿布或 N95 遮口鼻
 * - meteor-impact-winter：撞击冬天至少储备两周
 * - meteor-decontaminate-entry：进门先脱外衣
 * - meteor-generator-outdoors：发电机不可室内使用
 */

import type { GameEvent } from "@/lib/types";

export const meteorEvents: readonly GameEvent[] = [
  {
    id: "meteor-opening-broadcast",
    scenarioId: "meteor",
    phase: "opening",
    act: "开场",
    title: "直播：还有十分钟",
    body: "新闻直播的字幕写着「一颗陨石将在约 10 分钟后进入大气层」，主持人努力保持专业，但手里的稿纸一直在抖。你住在三楼，窗外是下午三点的太阳，和一颗正在变大的亮点。",
    knowledgeId: "meteor-blast-shelter",
    choices: [
      {
        id: "meteor-opening-broadcast-a",
        label: "立刻进地下室，远离所有窗户",
        quality: "good",
        effects: { energy: -6, sanity: 4 },
        specificEffect: 6,
        resultText:
          "你抱着应急包钻进地下室。十分钟后，头顶传来一声闷响，灯管晃了晃，你数了数自己的手指，十根都在。",
        knowledgeId: "meteor-blast-shelter",
      },
      {
        id: "meteor-opening-broadcast-b",
        label: "先冲回卧室拿应急包和充电器，再下楼",
        quality: "ok",
        risk: {
          probability: 60,
          successEffects: { food: 8, water: 8, energy: -8 },
          failureEffects: { hp: -12, energy: -10, sanity: -6 },
          successSpecificEffect: 3,
          failureSpecificEffect: -8,
          successText:
            "你在最后一分钟冲进地下室，怀里抱着应急包和三个充电宝，像个准备充分的末日博主。",
          failureText:
            "你在抽屉里翻充电器时，窗外白光一闪。你蹲在床边，第一次觉得充电器没那么重要。",
        },
        resultText: "你决定在末日来临前，先把数码生活安排明白。",
        knowledgeId: "meteor-blast-shelter",
      },
      {
        id: "meteor-opening-broadcast-c",
        label: "站到阳台上，举着手机拍下这颗「年度火球」",
        quality: "bad",
        effects: { hp: -18, sanity: -12, energy: -4 },
        specificEffect: -10,
        resultText:
          "你拍到了此生最壮观的画面，也拍到了自己的手在抖。视频只上传了 3 秒，因为玻璃先替你按了停止。",
        knowledgeId: "meteor-no-look",
      },
    ],
  },
  {
    id: "meteor-middle-shockwave",
    scenarioId: "meteor",
    phase: "middle",
    act: "冲击波",
    title: "天空亮如白昼",
    body: "整片天空变成一种不该出现在下午的白色。三秒后，冲击波到了。玻璃开始嗡嗡作响，楼下有人还在举着手机喊「快看快看」。",
    knowledgeId: "meteor-blast-shelter",
    choices: [
      {
        id: "meteor-middle-shockwave-a",
        label: "立刻趴下，背对窗户，双手护住头颈",
        quality: "good",
        effects: { hp: 4, energy: -8, sanity: 3 },
        specificEffect: 5,
        resultText:
          "你趴在内墙边，玻璃从背后飞过去，扎进了沙发。沙发替你完成了今天的社交媒体发言。",
        knowledgeId: "meteor-blast-shelter",
      },
      {
        id: "meteor-middle-shockwave-b",
        label: "关窗、拉窗帘，再跑到走廊最里面",
        quality: "ok",
        risk: {
          probability: 55,
          successEffects: { hp: 2, energy: -10 },
          failureEffects: { hp: -16, energy: -10, sanity: -5 },
          successSpecificEffect: 2,
          failureSpecificEffect: -8,
          successText:
            "你刚拉上窗帘，玻璃就在帘子后面碎成了雨。走廊很黑，但你完整。",
          failureText:
            "你伸手关窗的时候，冲击波先一步关上了它。窗帘和窗框一起完成了这次交接。",
        },
        resultText: "你决定先处理窗户，再处理自己。顺序稍微有点问题。",
        knowledgeId: "meteor-blast-shelter",
      },
      {
        id: "meteor-middle-shockwave-c",
        label: "凑到窗前，确认一下火球到底长什么样",
        quality: "bad",
        effects: { hp: -24, sanity: -15, energy: -6 },
        specificEffect: -12,
        resultText:
          "你看到了火球，火球也看到了你。视网膜替你保存了这张照片，持续了整整十分钟。",
        knowledgeId: "meteor-no-look",
      },
    ],
  },
  {
    id: "meteor-middle-winter",
    scenarioId: "meteor",
    phase: "middle",
    act: "撞击冬天",
    title: "气温在十五分钟内掉了二十度",
    body: "灰尘遮住了太阳，窗外的光变成了旧照片的颜色。暖气片发出最后一声叹息，温度计的数字还在往下走。",
    knowledgeId: "meteor-impact-winter",
    choices: [
      {
        id: "meteor-middle-winter-a",
        label: "用胶带和塑料膜封窗，把全家集中到一个房间",
        quality: "good",
        effects: { energy: -12, sanity: 5 },
        specificEffect: 7,
        resultText:
          "你把最后一个房间封成了保温盒。全家人挤在一起，像一罐被认真保存的沙丁鱼，但至少是温的。",
        knowledgeId: "meteor-impact-winter",
      },
      {
        id: "meteor-middle-winter-b",
        label: "趁路还没冻上，开车去超市抢一批保暖物资",
        quality: "ok",
        risk: {
          probability: 50,
          successEffects: { food: 10, water: 8, energy: -14 },
          failureEffects: { hp: -10, energy: -18, sanity: -6 },
          successSpecificEffect: 4,
          failureSpecificEffect: -8,
          successText:
            "你抢在封路前带回两床毯子和一箱热水袋。收银员说你是今天最后一个付钱的人。",
          failureText:
            "路上已经结了薄冰，你的车在路口转了半圈。物资没抢到，你倒是完成了一次免费漂移。",
        },
        resultText: "你决定用轮胎和天气赌一把。",
        knowledgeId: "meteor-impact-winter",
      },
      {
        id: "meteor-middle-winter-c",
        label: "打开窗户，深吸一口「撞击冬天」的新鲜空气",
        quality: "bad",
        effects: { hp: -15, sanity: -8, energy: -6 },
        specificEffect: -10,
        resultText:
          "空气确实很新鲜，新鲜得像刚从液氮罐里倒出来的。你咳了半小时，并成功地把室内也变成了室外。",
        knowledgeId: "meteor-impact-winter",
      },
    ],
  },
  {
    id: "meteor-middle-dust",
    scenarioId: "meteor",
    phase: "middle",
    act: "灰尘",
    title: "空气里全是灰",
    body: "细灰从窗缝里渗进来，在阳光消失之后依然悬浮在空气里。你每呼吸一次，喉咙就多一层砂纸。楼下有人发朋友圈说「末日空气，值得深呼吸」。",
    knowledgeId: "meteor-wet-mask",
    choices: [
      {
        id: "meteor-middle-dust-a",
        label: "用湿布或 N95 遮住口鼻，留在室内并封好窗缝",
        quality: "good",
        effects: { hp: 6, energy: -6, sanity: 3 },
        specificEffect: 5,
        resultText:
          "你戴着湿布做的口罩，像个准备打扫卫生的劫匪。灰还在外面，你的肺里少了一层装修。",
        knowledgeId: "meteor-wet-mask",
      },
      {
        id: "meteor-middle-dust-b",
        label: "出门去药店碰碰运气，看能不能找到 N95",
        quality: "ok",
        risk: {
          probability: 45,
          successEffects: { hp: 2, energy: -12, sanity: -2 },
          failureEffects: { hp: -14, energy: -14, sanity: -6 },
          successSpecificEffect: 3,
          failureSpecificEffect: -7,
          successText:
            "药店卷帘门半开着，你在货架底部翻出半盒 N95。老板不在，你留了钱和一张纸条。",
          failureText:
            "药店早就空了，你在回来的路上吸了太多灰，咳出来的痰颜色很像今天的天空。",
        },
        resultText: "你决定用一次外出，换一副更专业的肺。",
        knowledgeId: "meteor-wet-mask",
      },
      {
        id: "meteor-middle-dust-c",
        label: "拉开窗，站在灰里深呼吸，感受末日的味道",
        quality: "bad",
        effects: { hp: -20, sanity: -10, energy: -4 },
        specificEffect: -8,
        resultText:
          "末日的味道像烧焦的水泥掺了铁锈。你成功地把呼吸道变成了一条正在施工的隧道。",
        knowledgeId: "meteor-wet-mask",
      },
    ],
  },
  {
    id: "meteor-middle-pantry",
    scenarioId: "meteor",
    phase: "middle",
    act: "配给",
    title: "剩下的食物都很奇怪",
    body: "冰箱已经凉了。货架上剩下一排罐头、两包受潮的饼干、半袋猫粮，以及冰箱里那些原本打算这周吃的生鲜。你第一次认真阅读了猫粮背面的营养成分表。",
    knowledgeId: "meteor-impact-winter",
    choices: [
      {
        id: "meteor-middle-pantry-a",
        label: "先吃罐头和耐储存的干粮，生鲜按顺序处理",
        quality: "good",
        effects: { food: 14, sanity: 6, energy: -4 },
        specificEffect: 4,
        resultText:
          "你把罐头按保质期排成一列，像在检阅一支沉默的军队。今天吃临期的那罐，明天也是。",
        knowledgeId: "meteor-impact-winter",
      },
      {
        id: "meteor-middle-pantry-b",
        label: "先把冰箱里的生鲜全做了，做熟就不算坏",
        quality: "ok",
        risk: {
          probability: 55,
          successEffects: { food: 12, sanity: 4, energy: -6 },
          failureEffects: { hp: -12, food: 2, sanity: -6 },
          successSpecificEffect: 2,
          failureSpecificEffect: -6,
          successText:
            "你把所有生鲜炖成了一锅，味道意外地像庆祝。三个人吃得很饱，没人问里面有什么。",
          failureText:
            "那锅东西的味道在半夜开始复盘。你抱着马桶，理解了「做熟」和「没坏」是两门课。",
        },
        resultText: "你决定用一顿大餐，赌冰箱里还没长出自己的生态系统。",
        knowledgeId: "meteor-impact-winter",
      },
      {
        id: "meteor-middle-pantry-c",
        label: "直接打开猫粮，反正都是蛋白质",
        quality: "bad",
        effects: { food: 8, sanity: -12, energy: -4 },
        specificEffect: -5,
        resultText:
          "猫粮的味道比想象中咸。你吃了半袋，猫在旁边看着你，眼神里有一种被冒犯的同情。",
        knowledgeId: "meteor-impact-winter",
      },
    ],
  },
  {
    id: "meteor-middle-entry",
    scenarioId: "meteor",
    phase: "middle",
    act: "归来",
    title: "从外面回来的人",
    body: "你去隔壁楼帮老人搬了两桶水，回来时外套上落满细灰，鞋底像在面粉里走过。门就在眼前，你的手已经放在了门把上。",
    knowledgeId: "meteor-decontaminate-entry",
    choices: [
      {
        id: "meteor-middle-entry-a",
        label: "在门外抖落衣物和鞋上的灰，脱掉外衣再进屋",
        quality: "good",
        effects: { energy: -5, sanity: 4 },
        specificEffect: 4,
        resultText:
          "你在楼道里把自己抖得像一只刚洗完澡的狗。邻居从猫眼里看了你很久，但你家地板保住了。",
        knowledgeId: "meteor-decontaminate-entry",
      },
      {
        id: "meteor-middle-entry-b",
        label: "先进屋关门，想着待会儿再清理",
        quality: "ok",
        risk: {
          probability: 50,
          successEffects: { energy: 2, sanity: 1 },
          failureEffects: { hp: -8, sanity: -5 },
          successSpecificEffect: -2,
          failureSpecificEffect: -8,
          successText:
            "你进屋后就忘了这回事。灰尘也忘了自己该待在哪儿，于是均匀地铺满了客厅。",
          failureText:
            "你在沙发里坐了一会儿，才想起外套上的灰。那天夜里，你的嗓子开始上演砂纸独奏。",
        },
        resultText: "你决定把清洁工作往后放一放，末日也需要一点松弛感。",
        knowledgeId: "meteor-decontaminate-entry",
      },
      {
        id: "meteor-middle-entry-c",
        label: "直接穿着外套躺上床，今天太累了",
        quality: "bad",
        effects: { hp: -10, sanity: -8, energy: 4 },
        specificEffect: -9,
        resultText:
          "床很软，外套很灰。第二天你醒来时，枕头旁边多了一圈灰色的轮廓，像有人给你描了个边。",
        knowledgeId: "meteor-decontaminate-entry",
      },
    ],
  },
  {
    id: "meteor-middle-neighbor",
    scenarioId: "meteor",
    phase: "middle",
    act: "互助",
    title: "邻居来借食物",
    body: "对门的老太太敲了敲门，手里拿着半袋米，问能不能换两罐罐头。她说得很快，像是在承认一件不太体面的事。你身后的储物架上，罐头还剩不少。",
    knowledgeId: "meteor-impact-winter",
    choices: [
      {
        id: "meteor-middle-neighbor-a",
        label: "和她交换食物，顺便约好以后互相照应",
        quality: "good",
        effects: { food: -6, sanity: 12, energy: -3 },
        specificEffect: 4,
        resultText:
          "你用两罐午餐肉换了半袋米，还换来一个会帮你留门的人。这笔交易在末日里利息很高。",
        knowledgeId: "meteor-impact-winter",
      },
      {
        id: "meteor-middle-neighbor-b",
        label: "借她一罐，把剩下的往柜子深处推了推",
        quality: "ok",
        effects: { food: -3, sanity: -3 },
        specificEffect: 0,
        resultText:
          "她接过罐头，道了谢。门关上后，你听见自己的柜子发出了一声很轻的、心虚的响动。",
        knowledgeId: "meteor-impact-winter",
      },
      {
        id: "meteor-middle-neighbor-c",
        label: "告诉她你也没有余粮，然后关上门",
        quality: "bad",
        effects: { sanity: -12, energy: 2 },
        specificEffect: -5,
        resultText:
          "她点点头，没再说什么。你听见她慢慢走回对门，那半袋米在塑料袋里响了一路。",
        knowledgeId: "meteor-impact-winter",
      },
    ],
  },
  {
    id: "meteor-middle-generator",
    scenarioId: "meteor",
    phase: "middle",
    act: "电力",
    title: "太阳能板与发电机",
    body: "屋顶的太阳能板被灰盖成了一块黑板，发电量归零。你在储物间找到了那台小型汽油发电机，它安静地蹲在那里，像一位随时准备帮你一氧化碳中毒的老朋友。",
    knowledgeId: "meteor-generator-outdoors",
    choices: [
      {
        id: "meteor-middle-generator-a",
        label: "先上屋顶清理太阳能板，发电机搬到室外通风处使用",
        quality: "good",
        effects: { energy: -12, sanity: 5 },
        specificEffect: 6,
        resultText:
          "你擦干净最后一块板子时，指示灯重新亮起。发电机在院子里突突作响，屋内只有暖意，没有头晕。",
        knowledgeId: "meteor-generator-outdoors",
      },
      {
        id: "meteor-middle-generator-b",
        label: "把太阳能板擦干净，发电机这次先不用",
        quality: "ok",
        effects: { energy: -8, sanity: 2 },
        specificEffect: 2,
        resultText:
          "电勉强够照明和充电。你裹着毯子坐了一晚，至少手机还有电，可以看别人也在挨冻。",
        knowledgeId: "meteor-generator-outdoors",
      },
      {
        id: "meteor-middle-generator-c",
        label: "把发电机搬进客厅，关上门窗好好取暖",
        quality: "bad",
        effects: { hp: -28, sanity: -12, energy: 4 },
        specificEffect: -12,
        resultText:
          "屋子很快暖和起来，你也很快开始犯困。醒来时你趴在门口，是冷风替你按了重启键。",
        knowledgeId: "meteor-generator-outdoors",
      },
    ],
  },
  {
    id: "meteor-finale-three-way",
    scenarioId: "meteor",
    phase: "finale",
    act: "终局",
    title: "第七天的三个方向",
    body: "第七天，灰终于落得慢了一些。广播里说地下城还有空位，南下的车队在加油站集合，而你家的屋顶，今晚据说是看星星最好的地方。",
    knowledgeId: "meteor-blast-shelter",
    choices: [
      {
        id: "meteor-finale-three-way-a",
        label: "带上物资去地下城报到，登记成为一名管理员",
        quality: "good",
        effects: { hp: 6, sanity: 12, energy: -10, food: -8, water: -8 },
        specificEffect: 8,
        resultText:
          "地下城的灯是暖黄色的。你领到一串钥匙和一本登记册，负责记录每个人进出。第七天之后，你记录了很多人的名字，也记住了他们的名字。",
        knowledgeId: "meteor-blast-shelter",
      },
      {
        id: "meteor-finale-three-way-b",
        label: "跟着南下车队出发，去一个据说还有太阳的地方",
        quality: "ok",
        risk: {
          probability: 50,
          successEffects: { hp: 4, sanity: 15, energy: -16, food: -10, water: -10 },
          failureEffects: { hp: -20, sanity: -10, energy: -18, food: -10, water: -10 },
          successSpecificEffect: 5,
          failureSpecificEffect: -12,
          successText:
            "车队在第七天傍晚穿出灰云，你看见了久违的橘色。车里没人说话，所有人都在看同一个方向。",
          failureText:
            "南下的路被落灰和抛锚的车堵死了。你们在第八个检查站掉头，油表比情绪先见底。",
        },
        resultText: "你决定往有光的地方开，哪怕光在很远的地方。",
        knowledgeId: "meteor-impact-winter",
      },
      {
        id: "meteor-finale-three-way-c",
        label: "爬上屋顶看星星，反正末日也需要一点浪漫",
        quality: "bad",
        effects: { hp: -25, sanity: -12, energy: -8 },
        specificEffect: -15,
        resultText:
          "星星没看到，灰倒是看到了很多。第二天，救援队在屋顶发现了一个轮廓完整的人形，灰把它保存得很好。",
        knowledgeId: "meteor-wet-mask",
      },
    ],
  },
];
