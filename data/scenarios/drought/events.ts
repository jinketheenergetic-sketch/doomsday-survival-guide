/**
 * 赤沙荒原（drought）事件牌组。
 *
 * 固定 9 张：1 个开场 + 7 个中段 + 1 个终局。每张卡 3 个选项（good / ok / bad），
 * 7 张中段的 ok 选项全部带风险分支，保证任意 5 张中段组成的牌组都至少有 2 个风险选项。
 *
 * 知识卡 id 对应后续落地的 6 张干旱生存知识卡：
 * - drought-avoid-noon：沙漠避免正午行进，夜间与清晨赶路
 * - drought-sandstorm-shelter：沙暴时背风蹲伏、遮住口鼻，别躲在车里
 * - drought-solar-still：用太阳能蒸馏与露水收集获取可饮用的水
 * - drought-cactus-toxic：仙人掌汁不能解渴，多数有毒且会加重脱水
 * - drought-heatstroke-cooling：中暑要迅速移到阴凉处并主动降温
 * - drought-sip-water：补水要小口频饮，按计划分配存水
 */

import type { GameEvent } from "@/lib/types";

export const droughtEvents: readonly GameEvent[] = [
  {
    id: "drought-opening-tap",
    scenarioId: "drought",
    phase: "opening",
    act: "断水",
    title: "第 200 天，水龙头笑出了声",
    body: "连续 200 天没有下雨，市政水压在清晨彻底归零。你拧开水龙头，它发出一声干涩的「嗬」，像在嘲笑一个还在期待奇迹的人。楼下贴出通知：今日 9 点开始限量领水，请自带容器，请勿插队，请勿试图和工作人员讲道理。",
    knowledgeId: "drought-sip-water",
    choices: [
      {
        id: "drought-opening-tap-a",
        label: "带上所有容器去排队，按计划领水并分装储存",
        quality: "good",
        effects: { water: 12, energy: -6, sanity: 4 },
        specificEffect: 4,
        resultText:
          "你排了两个小时，领到 15 升水。回家后你把它分装进干净的瓶子，贴上日期，又用记号笔在墙上写了一张用水表。看起来很抠门，但你知道，从今天起抠门就是生存技能。",
        knowledgeId: "drought-sip-water",
      },
      {
        id: "drought-opening-tap-b",
        label: "不去排队，在自家院子里挖井，求人不如求己",
        quality: "ok",
        risk: {
          probability: 55,
          successEffects: { water: 10, energy: -6, sanity: 2 },
          failureEffects: { hp: -10, energy: -10, sanity: -8 },
          successSpecificEffect: 1,
          failureSpecificEffect: -7,
          successText:
            "你挖到两米多深，坑底终于渗出一小汪浑水。过滤、煮沸之后勉强能喝。邻居路过时看了一眼你的井，眼神像在看一个提前交卷的考生。",
          failureText:
            "挖到一半，铲子碰上了地下管线，喷出来的是带着铁锈味的污水。你站在齐膝的泥浆里，听见远处领水点传来最后一桶水被领走的声音。",
        },
        resultText: "你决定把命运交给一把铲子，而不是一条队伍。",
        knowledgeId: "drought-sip-water",
      },
      {
        id: "drought-opening-tap-c",
        label: "把家里最后半桶水浇给阳台上那盆已经枯死的绿萝",
        quality: "bad",
        effects: { water: -8, sanity: -10, hp: -4 },
        specificEffect: -8,
        resultText:
          "绿萝没有活过来，但它在吸水的那一刻看起来非常体面。你盯着空桶想了很久，最后给自己倒了一杯「精神安慰」——空气。",
        knowledgeId: "drought-sip-water",
      },
    ],
  },
  {
    id: "drought-middle-sandstorm",
    scenarioId: "drought",
    phase: "middle",
    act: "沙暴",
    title: "地平线立起一堵黄色的墙",
    body: "远处的地平线正在长高，颜色像一锅煮过头的咖喱。风向变了，空气里全是细沙的味道。街上有人开始奔跑，也有人掏出手机，试图拍下这面墙有多高——他们显然没看过沙暴的差评。",
    knowledgeId: "drought-sandstorm-shelter",
    choices: [
      {
        id: "drought-middle-sandstorm-a",
        label: "躲到背风处蹲下，用湿布遮住口鼻，等沙墙过去",
        quality: "good",
        effects: { hp: 2, energy: -6, water: -3, sanity: 5 },
        specificEffect: 5,
        resultText:
          "你贴着背风的墙根蹲下，把湿布捂在脸上。沙粒打在背上像有人拿砂纸给你做按摩。四十分钟后风停了，你站起来，耳朵里倒出半勺沙，但肺还在正常工作。",
        knowledgeId: "drought-sandstorm-shelter",
      },
      {
        id: "drought-middle-sandstorm-b",
        label: "钻进汽车里关紧门窗，觉得铁皮总比肉结实",
        quality: "ok",
        risk: {
          probability: 50,
          successEffects: { sanity: 2, energy: 4 },
          failureEffects: { hp: -12, energy: -10, sanity: -8 },
          successSpecificEffect: 1,
          failureSpecificEffect: -7,
          successText:
            "你在车里听着沙子敲打车顶，像一场非常密集的冰雹。沙暴过去后，车还能开，只是空调滤芯变成了一个沙雕作品。",
          failureText:
            "风把车埋了半截，车门被沙压得推不开。你从车窗爬出来时，车顶已经和路面一样高，只剩雨刷器在沙里举着两根手指。",
        },
        resultText: "你相信四扇车门能挡住一整片沙漠。",
        knowledgeId: "drought-sandstorm-shelter",
      },
      {
        id: "drought-middle-sandstorm-c",
        label: "迎着沙暴跑回家，顺便录一段「末日第一视角」",
        quality: "bad",
        effects: { hp: -14, sanity: -10, energy: -8 },
        specificEffect: -8,
        resultText:
          "视频开头是你兴奋的解说，结尾是你在急诊帐篷里咳出三粒石子。播放量不错，评论区都在问：「大哥，你还活着吗？」",
        knowledgeId: "drought-sandstorm-shelter",
      },
    ],
  },
  {
    id: "drought-middle-find-water",
    scenarioId: "drought",
    phase: "middle",
    act: "找水",
    title: "水壶见底，太阳还很敬业",
    body: "水壶摇起来已经没有声音。你在地图上找到一个可能的水点，走过去要四个小时。路边长着一丛仙人掌，饱满、翠绿、充满水分——看起来像大自然递过来的一杯饮料。",
    knowledgeId: "drought-solar-still",
    choices: [
      {
        id: "drought-middle-find-water-a",
        label: "挖太阳能蒸馏坑，铺上塑料布收集凝结水，再顺带刮点露水",
        quality: "good",
        effects: { water: 14, energy: -8, sanity: 5 },
        specificEffect: 5,
        resultText:
          "你挖坑、放容器、盖塑料布，在中间压了块石头。太阳把土里的水分逼出来，凝在塑料布上，一滴一滴落进杯子。半天接了小半杯，味道像温过的矿泉水，你喝出了香槟的仪式感。",
        knowledgeId: "drought-solar-still",
      },
      {
        id: "drought-middle-find-water-b",
        label: "切开仙人掌，直接吸它的汁液解渴",
        quality: "ok",
        risk: {
          probability: 45,
          successEffects: { water: 6, sanity: 2 },
          failureEffects: { hp: -12, water: -6, sanity: -8 },
          successSpecificEffect: -2,
          failureSpecificEffect: -8,
          successText:
            "汁液又苦又涩，勉强润了润嘴唇。你没中毒，但胃里翻江倒海，接下来的两个小时都在后悔。",
          failureText:
            "不到半小时，你的嘴开始发麻，胃像被人拧了一把。仙人掌的汁不但没补水，还让你把仅剩的水吐了出来。",
        },
        resultText: "你把一株仙人掌当成了自动售货机。",
        knowledgeId: "drought-cactus-toxic",
      },
      {
        id: "drought-middle-find-water-c",
        label: "看见一个发绿的水坑，趴下去喝了个痛快",
        quality: "bad",
        effects: { water: 4, hp: -16, sanity: -8 },
        specificEffect: -9,
        resultText:
          "水坑味道像泡了三天的抹布，但你还是喝了。两小时后，你开始腹泻，蹲在灌木后面深刻理解了「看起来像水」和「是水」之间的区别。",
        knowledgeId: "drought-solar-still",
      },
    ],
  },
  {
    id: "drought-middle-heatstroke",
    scenarioId: "drought",
    phase: "middle",
    act: "急救",
    title: "有人在你面前慢慢融化",
    body: "一个同行的老人突然停下，脸色通红，皮肤干得像旧报纸，说话开始打结。他旁边的年轻人正准备给他灌一整瓶冰水，并说「多喝点就好了」。太阳在头顶，像一盏没人关得掉的浴霸。",
    knowledgeId: "drought-heatstroke-cooling",
    choices: [
      {
        id: "drought-middle-heatstroke-a",
        label: "移到阴凉处、解开衣物、用湿布擦身降温，再小口补含盐水",
        quality: "good",
        effects: { hp: 8, water: -6, sanity: 6, energy: -4 },
        specificEffect: 5,
        resultText:
          "你们把他抬到背阴的墙下，用湿布擦脖子和腋下，喂了几口淡盐水。二十分钟后，他的眼神重新聚焦，第一句话是：「我是不是又耽误大家赶路了？」你说不是，今天本来就该休息。",
        knowledgeId: "drought-heatstroke-cooling",
      },
      {
        id: "drought-middle-heatstroke-b",
        label: "把一整瓶冰水给他灌下去，快准狠地补充水分",
        quality: "ok",
        risk: {
          probability: 50,
          successEffects: { hp: 4, sanity: 2 },
          failureEffects: { hp: -12, water: -6, sanity: -8 },
          successSpecificEffect: 1,
          failureSpecificEffect: -7,
          successText:
            "他喝得太急，呛了两声，但总算缓过来一点。你决定不告诉他，刚才那口水的温度有 50 度。",
          failureText:
            "大量冰水下去，他开始剧烈腹痛和呕吐，反而把刚补的水吐了个干净。你们手忙脚乱地给他擦身，天已经快黑了。",
        },
        resultText: "你决定用最快的方式把水送进去。",
        knowledgeId: "drought-sip-water",
      },
      {
        id: "drought-middle-heatstroke-c",
        label: "让他继续走，说出汗就是在排毒，走起来就好了",
        quality: "bad",
        effects: { hp: -16, sanity: -10, energy: -6 },
        specificEffect: -9,
        resultText:
          "他走了不到一百米就倒下了。你这才发现，中暑的人不会「走出来」，只会「走过去」。最后是别人把他抬进了阴凉处，而你负责在旁边解释什么叫排毒。",
        knowledgeId: "drought-heatstroke-cooling",
      },
    ],
  },
  {
    id: "drought-middle-gas-station",
    scenarioId: "drought",
    phase: "middle",
    act: "补给",
    title: "一座被太阳烤软的加油站",
    body: "废弃加油站的顶棚在热浪里微微扭曲，油泵像几座生锈的墓碑。卷帘门后也许有水和阴影，也许什么都没有。你看了看油表，又看了看自己裂开的嘴唇，两个都在提醒你：它们需要的东西不一样。",
    knowledgeId: "drought-avoid-noon",
    choices: [
      {
        id: "drought-middle-gas-station-a",
        label: "先进屋找水、确认遮阴处，再考虑抽油的事",
        quality: "good",
        effects: { water: 10, energy: -8, sanity: 5 },
        specificEffect: 5,
        resultText:
          "你在仓库角落找到两箱未开封的矿泉水和一块还算完整的遮阳布。油抽不抽得出来另说，至少今天下午你们有地方躲太阳，也有东西润嗓子。",
        knowledgeId: "drought-avoid-noon",
      },
      {
        id: "drought-middle-gas-station-b",
        label: "先抽油，趁天没黑把能带走的燃料都带走",
        quality: "ok",
        risk: {
          probability: 55,
          successEffects: { energy: 10, sanity: 2 },
          failureEffects: { hp: -12, energy: -8, sanity: -8 },
          successSpecificEffect: -2,
          failureSpecificEffect: -7,
          successText:
            "你折腾出一桶底油，够发电机撑几天。代价是错过了最热的两个小时里唯一的阴凉，头一直嗡嗡响。",
          failureText:
            "油管老化，汽油溅了一手，泵体还烫得能煎蛋。你头晕眼花地退回屋里，发现自己为了几升油，把一下午的水分全蒸发了。",
        },
        resultText: "你认为燃料比阴凉更值钱。",
        knowledgeId: "drought-avoid-noon",
      },
      {
        id: "drought-middle-gas-station-c",
        label: "顶着正午的太阳，把两桶油扛回五公里外的营地",
        quality: "bad",
        effects: { hp: -18, water: -10, sanity: -8, energy: -8 },
        specificEffect: -10,
        resultText:
          "你确实把油带回去了，也顺便把自己带进了中暑名单。两桶油整整齐齐立在帐篷边，而你躺在里面，觉得自己像一台过热关机的机器。",
        knowledgeId: "drought-avoid-noon",
      },
    ],
  },
  {
    id: "drought-middle-oasis",
    scenarioId: "drought",
    phase: "middle",
    act: "幻象",
    title: "远处出现了一片绿洲",
    body: "沙丘尽头有一片摇晃的绿色，中间还闪着一条亮晶晶的水带。同行的人已经开始欢呼，有人扔下背包准备冲刺。你眯起眼睛，发现那片绿色好像在跟着你们的脚步一起移动。",
    knowledgeId: "drought-avoid-noon",
    choices: [
      {
        id: "drought-middle-oasis-a",
        label: "先记录方位，观察它是否随距离移动、有没有真实的植被细节",
        quality: "good",
        effects: { sanity: 8, energy: -6 },
        specificEffect: 6,
        resultText:
          "你们在原地看了十分钟。那片绿洲始终保持在同样的距离，边缘还在轻轻抖动。你在地图上标了方向，决定等太阳低一点再去核实。方向感救的不是面子，是命。",
        knowledgeId: "drought-avoid-noon",
      },
      {
        id: "drought-middle-oasis-b",
        label: "朝绿洲方向走一段，赌它至少有一部分是真的",
        quality: "ok",
        risk: {
          probability: 45,
          successEffects: { water: 8, sanity: 4 },
          failureEffects: { hp: -14, water: -6, energy: -12, sanity: -8 },
          successSpecificEffect: 1,
          failureSpecificEffect: -10,
          successText:
            "走了半小时，你们真的碰到一小片低洼湿地，渗出的水勉强能收集。不是绿洲，但也不是完全的骗局。",
          failureText:
            "你们追着那片绿色走了两个小时，最后站在一片滚烫的沙地上。绿洲退到了更远的地方，还是同样的距离，还是同样的姿势。",
        },
        resultText: "你决定用脚验证眼睛的判断。",
        knowledgeId: "drought-avoid-noon",
      },
      {
        id: "drought-middle-oasis-c",
        label: "扔掉背包全速冲向绿洲，先到先得",
        quality: "bad",
        effects: { hp: -16, water: -10, energy: -16, sanity: -10 },
        specificEffect: -15,
        resultText:
          "你跑得比谁都快，也迷路得比谁都彻底。傍晚，队友在沙丘背面找到你时，你正对着一片空沙地招手，嘴里念叨着「就在前面」。",
        knowledgeId: "drought-avoid-noon",
      },
    ],
  },
  {
    id: "drought-middle-noon-travel",
    scenarioId: "drought",
    phase: "middle",
    act: "赶路",
    title: "52°C，而你必须今天到达",
    body: "温度计停在 52°C，指针看起来想辞职。前方是六小时的无人区，后方是已经干涸的营地。有人主张立刻出发，「趁还有体力」；也有人开始挖坑，准备把自己埋进去降温。",
    knowledgeId: "drought-avoid-noon",
    choices: [
      {
        id: "drought-middle-noon-travel-a",
        label: "等到夜里和清晨再走，白天挖坑遮阴、保存体力",
        quality: "good",
        effects: { energy: -10, water: -6, sanity: 6 },
        specificEffect: 6,
        resultText:
          "你们白天轮流躲在遮阳布下，像一群非常有耐心的地鼠。凌晨三点出发，空气凉得能拧出水汽。天亮前你们走完了六小时的路，而太阳刚上班。",
        knowledgeId: "drought-avoid-noon",
      },
      {
        id: "drought-middle-noon-travel-b",
        label: "白天硬走，定时休息，赌自己能在中暑前赶到",
        quality: "ok",
        risk: {
          probability: 45,
          successEffects: { sanity: 4, water: -6 },
          failureEffects: { hp: -18, water: -10, sanity: -10, energy: -8 },
          successSpecificEffect: 1,
          failureSpecificEffect: -9,
          successText:
            "你们每走二十分钟就躲一次阴影，虽然慢，但真的在天黑前到了。最后一段路，你几乎是靠数自己的脚步挪过去的。",
          failureText:
            "中午一点，队伍里第一个人倒下，接着是第二个。你们在毫无遮挡的沙地上停了三个小时，水消耗得比预计快一倍。",
        },
        resultText: "你决定和太阳拼一下谁更能熬。",
        knowledgeId: "drought-avoid-noon",
      },
      {
        id: "drought-middle-noon-travel-c",
        label: "正午全速前进，用意志力给自己降温",
        quality: "bad",
        effects: { hp: -18, water: -12, sanity: -10, energy: -10 },
        specificEffect: -10,
        resultText:
          "意志力是一种很好的品质，但它不参与体温调节。两小时后你开始幻觉，看见路边有个卖冰棍的摊子。等你清醒过来，已经有人把湿布盖在你脸上了。",
        knowledgeId: "drought-heatstroke-cooling",
      },
    ],
  },
  {
    id: "drought-middle-scavengers",
    scenarioId: "drought",
    phase: "middle",
    act: "交易",
    title: "沙丘背后冒出来三个人",
    body: "他们推着一辆改装过的水车，车上绑着水桶、旧轮胎和一只看起来很凶的鸡。为首的人冲你抬了抬下巴：「换点东西？我们不讲价，只讲公平。」你注意到他们的水桶是满的，而你的背包拉链只拉了一半。",
    knowledgeId: "drought-sip-water",
    choices: [
      {
        id: "drought-middle-scavengers-a",
        label: "拿出多余的食物公平交换，顺便问问能不能结伴走一段",
        quality: "good",
        effects: { water: 10, food: -6, sanity: 8, energy: -4 },
        specificEffect: 5,
        resultText:
          "你用两包压缩饼干换了一桶水和一条路线情报。对方还同意同行半天，条件是帮忙推车。分开时，为首的人说：「在荒原上，讲规矩的人活得久一点。」你觉得这话值一桶水。",
        knowledgeId: "drought-sip-water",
      },
      {
        id: "drought-middle-scavengers-b",
        label: "先把好东西藏起来，只拿最差的去换，能省一点是一点",
        quality: "ok",
        risk: {
          probability: 55,
          successEffects: { water: 8, food: 4, sanity: 2 },
          failureEffects: { hp: -12, water: -6, sanity: -10 },
          successSpecificEffect: 1,
          failureSpecificEffect: -7,
          successText:
            "对方没细看，交易成了。你多留了一罐肉，但整个过程你都在担心他们会不会突然改主意。",
          failureText:
            "对方一眼看穿了你的小算盘，语气冷了下来。交易取消，水没有换到，你还在推搡中丢了半壶存水。",
        },
        resultText: "你决定在公平里给自己留一点小聪明。",
        knowledgeId: "drought-sip-water",
      },
      {
        id: "drought-middle-scavengers-c",
        label: "半夜摸过去把他们的水桶搬走，反正荒原上没有警察",
        quality: "bad",
        effects: { water: 6, hp: -16, sanity: -12, food: -6 },
        specificEffect: -10,
        resultText:
          "你确实搬走了一桶水，也顺便惊动了那只鸡。三个人追了你两公里，收回水桶，还收走了你一半的补给。为首的人临走前说：「荒原上没有警察，但有记性。」",
        knowledgeId: "drought-sip-water",
      },
    ],
  },
  {
    id: "drought-finale-three-way",
    scenarioId: "drought",
    phase: "finale",
    act: "终局",
    title: "第九天，三个方向都有水声",
    body: "第九天清晨，你站在一处高地上，手里只有一张画满标记的地图和最后半壶水。三个方向都有传言：西边的地下河、东边缓慢移动的水车队、南边沙丘深处那座「会自己搬家的黄金城」。太阳升起来了，像在催你选一个。",
    knowledgeId: "drought-sip-water",
    choices: [
      {
        id: "drought-finale-three-way-a",
        label: "跟着地下河的线索挖下去，把第一桶水打上来",
        quality: "good",
        effects: { water: 16, sanity: 14, food: -8, energy: -10 },
        specificEffect: 6,
        resultText:
          "你们按水痕、植被和地势一路找过去，在一处低洼地挖了整整一天。傍晚，坑底渗出了湿沙，接着是一小股浑水。有人先哭了，然后才想起来喝水。你给这口井做了记号，也给自己留了一个不需要再逃的理由。",
        knowledgeId: "drought-sip-water",
      },
      {
        id: "drought-finale-three-way-b",
        label: "加入水车队，当一名负责记账和分水的随行人员",
        quality: "ok",
        risk: {
          probability: 55,
          successEffects: { water: 12, food: 8, sanity: 8, energy: 4 },
          failureEffects: { hp: -14, sanity: -10, water: -8 },
          successSpecificEffect: 2,
          failureSpecificEffect: -10,
          successText:
            "你负责记录每一桶水的去向，顺便学会了怎么在沙漠里讨价还价。车队管饭、管水、管遮阴，代价是你要跟着他们一直走。你成了账本上的一个名字，也成了车轮上的一个零件。",
          failureText:
            "车队在第三天改了路线，把你和另外两个人留在一个补给点，说「明天回来接」。你等了两个明天，最后自己走回了地图上那条细线。",
        },
        resultText: "你决定把方向感交给一支车队，换一份稳定的水。",
        knowledgeId: "drought-sip-water",
      },
      {
        id: "drought-finale-three-way-c",
        label: "追随沙丘传说，去找那座会自己搬家的黄金城",
        quality: "bad",
        effects: { hp: -20, water: -12, sanity: -16, energy: -10 },
        specificEffect: -15,
        resultText:
          "你走了三天，黄金城始终在前方一座沙丘的背面。第四天，你不再走了。后来路过的人在地图上标了一个新地标：一座沙丘，顶上插着一只空水壶，旁边有一行字——「城就在前面」。",
        knowledgeId: "drought-avoid-noon",
      },
    ],
  },
];
