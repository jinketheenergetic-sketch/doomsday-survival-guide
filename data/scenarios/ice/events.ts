/**
 * 永夜冰河（ice）事件牌组。
 *
 * 固定 9 张：1 个开场 + 7 个中段 + 1 个终局。每张卡 3 个选项（good / ok / bad），
 * 其中 5 张中段事件带风险分支，保证任意 5 张中段组成的牌组都至少有 2 个风险选项。
 *
 * 知识卡 id 对应后续落地的 6 张极寒知识卡：
 * - ice-layers：多层衣物比一件厚衣更保暖
 * - ice-no-indoor-charcoal：室内不烧炭火盆，防一氧化碳中毒
 * - ice-boil-snow：雪水必须煮沸后饮用
 * - ice-frostbite-warm-water：冻伤用 37–40°C 温水复温，不搓雪、不热水泡
 * - ice-shared-room：集中到一个房间共享体温与燃料
 * - ice-hypothermia-slow-rewarm：失温需要缓慢复温
 */

import type { GameEvent } from "@/lib/types";

export const iceEvents: readonly GameEvent[] = [
  {
    id: "ice-opening-drop",
    scenarioId: "ice",
    phase: "opening",
    act: "开场",
    title: "十二小时，四十度",
    body: "气象台最后一次更新是昨晚十一点，之后信号就断了。今天早上，窗玻璃内侧结了霜，暖气片凉得像一块墓碑，手机上的温度显示 -41°C，并且还在往下掉。楼下的车已经开始表演集体罢工。",
    knowledgeId: "ice-layers",
    choices: [
      {
        id: "ice-opening-drop-a",
        label: "把所有能穿的都套上，封好窗，全家人集中到一间屋",
        quality: "good",
        effects: { energy: -8, sanity: 4 },
        specificEffect: 6,
        resultText:
          "你把自己穿成了一个人形洋葱，三层袜子、两件毛衣、一件羽绒服。全家挤在朝南的小屋里，呼吸把窗子蒙出一小块白雾，像地图上最后一个有人烟的地方。",
        knowledgeId: "ice-layers",
      },
      {
        id: "ice-opening-drop-b",
        label: "翻出家里最厚的那件大衣，再灌两个热水袋",
        quality: "ok",
        risk: {
          probability: 60,
          successEffects: { energy: -6, sanity: 2 },
          failureEffects: { hp: -10, energy: -10, sanity: -6 },
          successSpecificEffect: 2,
          failureSpecificEffect: -8,
          successText:
            "大衣很厚，热水袋很烫。你撑过了第一个白天，只是脚趾还没收到任何知觉方面的通知。",
          failureText:
            "热水袋在半夜凉了，大衣下面的你才发现，一件厚衣挡不住零下四十度的耐心。",
        },
        resultText: "你决定用一件大衣解决所有问题，像对待所有生活难题一样。",
        knowledgeId: "ice-layers",
      },
      {
        id: "ice-opening-drop-c",
        label: "把椅子、书架和旧衣柜劈了，在客厅点一堆火",
        quality: "bad",
        effects: { hp: -14, sanity: -8, energy: -10 },
        specificEffect: -10,
        resultText:
          "客厅确实暖和了十分钟。烟没有烟道可去，于是它决定留在你家里，顺便留在你的肺里。",
        knowledgeId: "ice-no-indoor-charcoal",
      },
    ],
  },
  {
    id: "ice-middle-fire",
    scenarioId: "ice",
    phase: "middle",
    act: "生火",
    title: "屋里冷得能看见呼吸的标点符号",
    body: "第二晚，温度计已经不肯显示具体数字，只显示一条向下的斜线。你在储物间找到一个铸铁炭火盆，还有半箱烧烤炭。它的广告词曾经是「让家更温暖」。",
    knowledgeId: "ice-no-indoor-charcoal",
    choices: [
      {
        id: "ice-middle-fire-a",
        label: "检查壁炉烟道，确认通畅后在壁炉里生火",
        quality: "good",
        effects: { energy: -10, sanity: 6 },
        specificEffect: 4,
        resultText:
          "烟顺着烟道往外走，热气留在屋里。你坐在壁炉前烤手，第一次觉得「有烟道的壁炉」这五个字这么性感。",
        knowledgeId: "ice-no-indoor-charcoal",
      },
      {
        id: "ice-middle-fire-b",
        label: "把炭火盆搬进客厅，开一点窗缝意思一下",
        quality: "ok",
        risk: {
          probability: 50,
          successEffects: { energy: 4, sanity: 2 },
          failureEffects: { hp: -22, sanity: -10, energy: -6 },
          successSpecificEffect: -2,
          failureSpecificEffect: -12,
          successText:
            "窗缝救了你一命。炭盆散出的热气勉强够暖手，而你整晚都在和睡意谈判。",
          failureText:
            "你记得开窗，却忘了炭火不需要你的同意。半夜的头痛像有人在你脑子里慢慢拧一条湿毛巾。",
        },
        resultText: "你决定让「开一点窗」承担全部的安全责任。",
        knowledgeId: "ice-no-indoor-charcoal",
      },
      {
        id: "ice-middle-fire-c",
        label: "关紧所有门窗，把炭火盆烧到最旺，睡个暖和觉",
        quality: "bad",
        effects: { hp: -30, sanity: -12, energy: 8 },
        specificEffect: -14,
        resultText:
          "你确实睡了一个很暖的觉。醒来时是邻居在砸门，因为你的门铃已经叫不醒你了。",
        knowledgeId: "ice-no-indoor-charcoal",
      },
    ],
  },
  {
    id: "ice-middle-pipes",
    scenarioId: "ice",
    phase: "middle",
    act: "水管",
    title: "墙里传来一声脆响",
    body: "凌晨，厨房墙里发出一声像骨头折断的脆响，接着是哗哗的水声。水管冻裂了，水正从橱柜后面往外喷，在冰冷的空气里冒着白气，像一场非常不合时宜的喷泉。",
    knowledgeId: "ice-boil-snow",
    choices: [
      {
        id: "ice-middle-pipes-a",
        label: "先关总阀，再断电、清空管道，最后处理裂缝",
        quality: "good",
        effects: { water: 6, energy: -10, sanity: 4 },
        specificEffect: 4,
        resultText:
          "你摸着黑找到总阀，拧到底。喷泉停了，地板保住了。之后你出门铲了一锅干净的雪，煮沸后灌进保温壶——从现在起，每一口水都得先过火。",
        knowledgeId: "ice-boil-snow",
      },
      {
        id: "ice-middle-pipes-b",
        label: "先拿盆接水，接满再去找总阀",
        quality: "ok",
        risk: {
          probability: 55,
          successEffects: { water: 14, energy: -12 },
          failureEffects: { water: 4, hp: -8, energy: -16, sanity: -5 },
          successSpecificEffect: 1,
          failureSpecificEffect: -7,
          successText:
            "你接满了三个盆和一口锅，水龙头还在滴。至少今晚的饮用水有了着落。",
          failureText:
            "盆满了，地板也满了。你滑了一跤，总阀在冰水下面等着你清醒过来。",
        },
        resultText: "你决定先抢救水，再抢救房子。",
        knowledgeId: "ice-boil-snow",
      },
      {
        id: "ice-middle-pipes-c",
        label: "用热水壶浇裂口，希望管子自己热胀回去",
        quality: "bad",
        effects: { hp: -12, water: -10, energy: -8 },
        specificEffect: -9,
        resultText:
          "裂缝在热水下发出了第二声脆响，比第一声更干脆。水管不同意你的物理学。",
        knowledgeId: "ice-boil-snow",
      },
    ],
  },
  {
    id: "ice-middle-frozen-food",
    scenarioId: "ice",
    phase: "middle",
    act: "口粮",
    title: "食物冻成了砖",
    body: "储物间的米袋冻成了一块方形石头，鸡蛋裂了壳，玻璃瓶装的酱油则用一种很危险的方式保持完整。窗外是一个天然的大冰柜，但你拧不开一瓶冻住的矿泉水。",
    knowledgeId: "ice-boil-snow",
    choices: [
      {
        id: "ice-middle-frozen-food-a",
        label: "把食物挪到窗外冷冻保存，瓶装液体挪进室内慢慢化",
        quality: "good",
        effects: { food: 12, water: 4, energy: -4 },
        specificEffect: 4,
        resultText:
          "窗外成了你的第二台冰箱，阳台就是冷冻层。玻璃瓶在室内慢慢解冻，没有爆，也没有把酱油变成艺术品。",
        knowledgeId: "ice-boil-snow",
      },
      {
        id: "ice-middle-frozen-food-b",
        label: "用热水猛冲冻住的玻璃瓶，赶紧化开做饭",
        quality: "ok",
        risk: {
          probability: 50,
          successEffects: { food: 8, sanity: 2 },
          failureEffects: { hp: -8, food: -4, sanity: -6 },
          successSpecificEffect: -1,
          failureSpecificEffect: -8,
          successText:
            "瓶子只是裂了一道缝，酱油还算争气。你把这算作一次成功，尽管手上多了个口子。",
          failureText:
            "冷热交替的玻璃决定当场退休。酱油、碎片和你的晚餐一起完成了自由落体。",
        },
        resultText: "你决定用热水和玻璃瓶讲道理。",
        knowledgeId: "ice-boil-snow",
      },
      {
        id: "ice-middle-frozen-food-c",
        label: "把雪装进锅里直接煮开，省点瓶装水",
        quality: "bad",
        effects: { water: -6, hp: -8, energy: -6 },
        specificEffect: -7,
        resultText:
          "雪化得很快，锅底沉下一层灰黑色的东西。你喝了两口，决定还是把它留给拖地。",
        knowledgeId: "ice-boil-snow",
      },
    ],
  },
  {
    id: "ice-middle-fuel",
    scenarioId: "ice",
    phase: "middle",
    act: "燃料",
    title: "最后一块木头烧完了",
    body: "壁炉里的火苗缩成了打火机大小。你需要出门找燃料，而室外是 -47°C，风把楼道门吹得像有人在敲门。楼道里贴着一张手写告示：「结伴出行，别一个人去当冰雕。」",
    knowledgeId: "ice-shared-room",
    choices: [
      {
        id: "ice-middle-fuel-a",
        label: "叫上邻居，说清路线和时间，带上保暖与通信再出发",
        quality: "good",
        effects: { food: -4, energy: -14, sanity: 6 },
        specificEffect: 5,
        resultText:
          "你们两个人、一根绳、一部充好电的对讲机，沿着街道去拆废弃工地的木托盘。回来时天黑了，但两个人都回来了。",
        knowledgeId: "ice-shared-room",
      },
      {
        id: "ice-middle-fuel-b",
        label: "自己快去快回，不耽误别人的时间",
        quality: "ok",
        risk: {
          probability: 55,
          successEffects: { energy: -12, sanity: 2 },
          failureEffects: { hp: -18, energy: -18, sanity: -8 },
          successSpecificEffect: 2,
          failureSpecificEffect: -10,
          successText:
            "你抱着一捆木条冲回楼道，手指冻得发白发硬，但火保住了。",
          failureText:
            "你在拐角踩到暗冰，摔进雪堆里，起身时已经分不清方向。是邻居出来倒水时把你捞了回去。",
        },
        resultText: "你决定一个人去，理由是「不想麻烦别人」。",
        knowledgeId: "ice-shared-room",
      },
      {
        id: "ice-middle-fuel-c",
        label: "把楼道里的应急消防斧和木门拆了当柴烧",
        quality: "bad",
        effects: { food: -2, energy: -6, sanity: -14 },
        specificEffect: -8,
        resultText:
          "门烧得很旺，代价是整栋楼失去了一道防火门。火是热的，邻居看你的眼神是冷的。",
        knowledgeId: "ice-shared-room",
      },
    ],
  },
  {
    id: "ice-middle-frostbite",
    scenarioId: "ice",
    phase: "middle",
    act: "冻伤",
    title: "手指不疼了，这不是好消息",
    body: "你从阳台收完衣服回来，发现右手食指和中指白得像蜡，摸上去硬邦邦的，而且已经不疼了。你想起网上说「冻伤不能搓」，也想起奶奶说「用雪搓搓就好了」。",
    knowledgeId: "ice-frostbite-warm-water",
    choices: [
      {
        id: "ice-middle-frostbite-a",
        label: "用 37–40°C 的温水缓慢浸泡，直到皮肤恢复感觉",
        quality: "good",
        effects: { hp: 4, energy: -6, sanity: 4 },
        specificEffect: 6,
        resultText:
          "水温不高，复温很慢，疼得你想骂人——这是个好迹象。手指从蜡白变回粉红，像三个终于恢复营业的指示灯。",
        knowledgeId: "ice-frostbite-warm-water",
      },
      {
        id: "ice-middle-frostbite-b",
        label: "把手揣进怀里，用体温慢慢暖回来",
        quality: "ok",
        effects: { hp: -2, energy: -4, sanity: 2 },
        specificEffect: 2,
        resultText:
          "手指在腋下慢慢有了知觉，但冻伤的深层组织不打算靠体温就妥协。你把这只手当成了易碎品。",
        knowledgeId: "ice-frostbite-warm-water",
      },
      {
        id: "ice-middle-frostbite-c",
        label: "抓一把雪用力搓手，再用热水泡一泡",
        quality: "bad",
        effects: { hp: -20, sanity: -10, energy: -8 },
        specificEffect: -12,
        resultText:
          "雪搓掉了表皮，热水又给了它一次冲击。手指从蜡白变成了紫黑，像在展示一种很昂贵的指甲油。",
        knowledgeId: "ice-frostbite-warm-water",
      },
    ],
  },
  {
    id: "ice-middle-draft",
    scenarioId: "ice",
    phase: "middle",
    act: "封窗",
    title: "窗户在漏风，也在漏命",
    body: "客厅的旧窗框变形了，冷风从一条看不见的缝里钻进来，在窗帘下摆吹出一个小小的鼓包。你把手掌贴上去，感觉自己摸到了一台正在工作的冷风机。",
    knowledgeId: "ice-shared-room",
    choices: [
      {
        id: "ice-middle-draft-a",
        label: "用塑料膜和胶带封住窗框，留一条小通风缝",
        quality: "good",
        effects: { energy: -8, sanity: 4 },
        specificEffect: 5,
        resultText:
          "塑料膜鼓起来又瘪下去，像窗户在呼吸。屋里明显暖了，而你依然留着一条缝，防止自己把家封成真空包装。",
        knowledgeId: "ice-shared-room",
      },
      {
        id: "ice-middle-draft-b",
        label: "把所有厚衣服塞进窗缝，能挡住多少算多少",
        quality: "ok",
        risk: {
          probability: 60,
          successEffects: { energy: -4, sanity: 1 },
          failureEffects: { hp: -8, sanity: -4, energy: -6 },
          successSpecificEffect: 0,
          failureSpecificEffect: -6,
          successText:
            "衣服挡住了大部分风。你少了一件毛衣，但多了一扇勉强像样的窗。",
          failureText:
            "风找到了衣服之间的空隙，顺便把你最后一件干外套吹成了冰壳。",
        },
        resultText: "你决定用衣服和寒风打一场消耗战。",
        knowledgeId: "ice-shared-room",
      },
      {
        id: "ice-middle-draft-c",
        label: "用胶带把窗子从里面封死，一点缝都不留",
        quality: "bad",
        effects: { hp: -10, sanity: -8, energy: -2 },
        specificEffect: -6,
        resultText:
          "风确实进不来了。第二天早上，屋里的空气和你的脑袋一起变得又闷又沉。",
        knowledgeId: "ice-shared-room",
      },
    ],
  },
  {
    id: "ice-middle-neighbor",
    scenarioId: "ice",
    phase: "middle",
    act: "互助",
    title: "对门的老先生敲了三次门",
    body: "第三次敲门声很轻，像怕打扰你。对门的老先生裹着两层毛毯，嘴唇发白，说他家的暖气管道冻住了，问能不能在你家客厅坐一会儿。他的手指在抖，但还在努力保持礼貌。",
    knowledgeId: "ice-hypothermia-slow-rewarm",
    choices: [
      {
        id: "ice-middle-neighbor-a",
        label: "把他请进来，换下湿衣，用毯子和热饮缓慢复温",
        quality: "good",
        effects: { food: -4, water: -4, sanity: 12, energy: -6 },
        specificEffect: 6,
        resultText:
          "你给他换了干袜子，递上一杯温糖水。半小时后，他的嘴唇有了颜色，开始讲他年轻时在东北当兵的事。屋里多了一个人，也多了两度。",
        knowledgeId: "ice-hypothermia-slow-rewarm",
      },
      {
        id: "ice-middle-neighbor-b",
        label: "让他进来，但只分给他一条毯子和一个角落",
        quality: "ok",
        effects: { sanity: 3, energy: -2 },
        specificEffect: 1,
        resultText:
          "他道了谢，缩在角落里，尽量不占地方。你时不时看他一眼，确认他还在呼吸。",
        knowledgeId: "ice-hypothermia-slow-rewarm",
      },
      {
        id: "ice-middle-neighbor-c",
        label: "让他先喝口白酒暖暖身子，再自己想办法",
        quality: "bad",
        effects: { hp: -14, sanity: -12 },
        specificEffect: -8,
        resultText:
          "酒让他觉得暖和，也让他的血管放松了警惕。半小时后，他比刚才抖得更厉害，你才意识到「暖」和「热」不是一回事。",
        knowledgeId: "ice-hypothermia-slow-rewarm",
      },
    ],
  },
  {
    id: "ice-finale-three-way",
    scenarioId: "ice",
    phase: "finale",
    act: "终局",
    title: "第九天，三个方向",
    body: "第九天，风停了。广播里说南方还有没结冰的港口，社区中心有人组织「冬季公社」，而你家的地下室，安静、黑暗、恒温，像一个已经替你做好决定的房间。",
    knowledgeId: "ice-shared-room",
    choices: [
      {
        id: "ice-finale-three-way-a",
        label: "加入南下的车队，去有港口和信的地方",
        quality: "good",
        effects: { hp: 4, sanity: 14, energy: -14, food: -8, water: -8 },
        specificEffect: 5,
        resultText:
          "车队在第九天出发，你坐在卡车后斗里，风把每个人的脸都吹成同一个表情。三天后，你看见港口没有结冰，还收到了一封从南方寄来的信。",
        knowledgeId: "ice-hypothermia-slow-rewarm",
      },
      {
        id: "ice-finale-three-way-b",
        label: "留下来，和邻居们一起办一个冬季公社",
        quality: "ok",
        risk: {
          probability: 55,
          successEffects: { sanity: 10, energy: -10, food: -6, water: -6 },
          failureEffects: { hp: -18, sanity: -8, energy: -12, food: -6, water: -6 },
          successSpecificEffect: 2,
          failureSpecificEffect: -10,
          successText:
            "你们把三户人家的燃料和食物集中起来，排了值班表。公社第一次会议开得很长，但没有一个人冻着。",
          failureText:
            "公社在分燃料的问题上开了第二次会议，第二次会议变成了第三次。等大家吵完，最冷的那几天已经过去了——也带走了两个人。",
        },
        resultText: "你决定把命运交给邻居和一张值班表。",
        knowledgeId: "ice-shared-room",
      },
      {
        id: "ice-finale-three-way-c",
        label: "钻进地下室冬眠，等春天来叫醒你",
        quality: "bad",
        effects: { hp: -26, sanity: -12, energy: -8 },
        specificEffect: -15,
        resultText:
          "地下室确实恒温，恒在零下。春天来的时候，人们发现了你——轮廓完整，表情安详，一尊很有艺术感的冰雕。",
        knowledgeId: "ice-hypothermia-slow-rewarm",
      },
    ],
  },
];
