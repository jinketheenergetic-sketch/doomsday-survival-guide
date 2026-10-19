/**
 * 融冰纪元（flood）事件牌组。
 *
 * 固定 9 张：1 个开场 + 7 个中段 + 1 个终局。每张卡 3 个选项（good / ok / bad），
 * 其中 7 张带风险分支，保证任意 5 张中段组成的牌组都至少有 2 个风险选项。
 *
 * 知识卡 id 对应 US-015 将要落地的 6 张洪水知识卡：
 * - flood-current：15cm 急流可冲倒成人
 * - flood-boil-water：洪水必须消毒或煮沸
 * - flood-vertical-evacuation：垂直撤离优先于水平逃跑
 * - flood-hypothermia：湿衣失温处理
 * - flood-roof-signal：屋顶求救信号
 * - flood-wound-tetanus：洪水后伤口感染与破伤风
 */

import type { GameEvent } from "@/lib/types";

export const floodEvents: readonly GameEvent[] = [
  {
    id: "flood-opening-fridge",
    scenarioId: "flood",
    phase: "opening",
    act: "开场",
    title: "凌晨 3:14，冰箱漂过客厅",
    body: "你是被一声闷响吵醒的。睁眼时，那台贴满外卖磁贴的冰箱正慢悠悠漂过客厅，像在巡视自己的新领地。水已经漫到床沿，而手机推送还在认真提醒你：今日有雨。",
    knowledgeId: "flood-vertical-evacuation",
    choices: [
      {
        id: "flood-opening-fridge-a",
        label: "抓上应急包，立刻往楼上撤",
        quality: "good",
        effects: { energy: -8, sanity: 4 },
        specificEffect: 10,
        resultText: "你踩着楼梯往上走，水在身后一级一级地追，但没追上。",
        knowledgeId: "flood-vertical-evacuation",
      },
      {
        id: "flood-opening-fridge-b",
        label: "先把冰箱里的东西捞出来再走",
        quality: "ok",
        risk: {
          probability: 55,
          successEffects: { food: 12, energy: -10 },
          failureEffects: { hp: -10, sanity: -8, energy: -12 },
          successSpecificEffect: 2,
          failureSpecificEffect: -8,
          successText:
            "你捞出了三盒酸奶和半只烧鸡，并且赶在水漫上楼梯前撤了上去。",
          failureText:
            "酸奶没捞着，你还在湿滑的地板上摔了一跤。冰箱倒是漂得很稳。",
        },
        resultText: "你决定先抢救物资，再抢救自己。",
        knowledgeId: "flood-vertical-evacuation",
      },
      {
        id: "flood-opening-fridge-c",
        label: "从窗户跳下去，游到对面楼",
        quality: "bad",
        effects: { hp: -18, sanity: -10, energy: -15 },
        specificEffect: -15,
        resultText: "你跳进水里才发现，洪水不是游泳池。它不消毒，也不分泳道。",
        knowledgeId: "flood-current",
      },
    ],
  },
  {
    id: "flood-middle-store",
    scenarioId: "flood",
    phase: "middle",
    act: "拾荒",
    title: "半淹的便利店",
    body: "便利店只剩上半截货架露在水面，罐头排得整整齐齐，像在等一场迟到很久的结账。门被水压顶死了，玻璃后面是一整排你最爱的午餐肉。",
    knowledgeId: "flood-current",
    choices: [
      {
        id: "flood-middle-store-a",
        label: "从侧面通风口爬进去，只拿罐头",
        quality: "good",
        effects: { food: 18, water: 8, energy: -10, hp: -2 },
        specificEffect: 4,
        resultText:
          "你从通风口钻了进去，像一只很有原则的浣熊。罐头到手，门也没被水压冲开。",
        knowledgeId: "flood-current",
      },
      {
        id: "flood-middle-store-b",
        label: "直接踹门，赌水流不会把货架冲倒",
        quality: "ok",
        risk: {
          probability: 45,
          successEffects: { food: 25, water: 10, energy: -12 },
          failureEffects: { hp: -18, food: 5, energy: -16 },
          successSpecificEffect: 2,
          failureSpecificEffect: -10,
          successText:
            "门开了，货架晃了两下居然站住了。你抱着一堆罐头，像刚赢了场不太光彩的比赛。",
          failureText:
            "门开的瞬间，水流把货架连同你一起推倒。你抢到了两罐午餐肉，也抢到了一身淤青。",
        },
        resultText: "你抬脚对准门锁，便利店开始重新考虑自己的布局。",
        knowledgeId: "flood-current",
      },
      {
        id: "flood-middle-store-c",
        label: "游进货架最深处，把整箱饮料搬出来",
        quality: "bad",
        effects: { water: 10, hp: -15, energy: -18, sanity: -5 },
        specificEffect: -8,
        resultText:
          "你确实搬回了一箱饮料。代价是腿上多了一道铁皮划的口子，而破伤风不需要预约。",
        knowledgeId: "flood-wound-tetanus",
      },
    ],
  },
  {
    id: "flood-middle-bleach",
    scenarioId: "flood",
    phase: "middle",
    act: "饮水",
    title: "一瓶漂白剂和最后半瓶水",
    body: "你在邻居家找到一瓶漂白剂，标签上写着「不可饮用」，像一句针对你此刻处境的温馨提示。水壶里只剩半瓶水，颜色令人不敢细想。",
    knowledgeId: "flood-boil-water",
    choices: [
      {
        id: "flood-middle-bleach-a",
        label: "按说明稀释漂白剂，或者干脆煮沸",
        quality: "good",
        effects: { water: 15, sanity: 5, energy: -5 },
        specificEffect: 3,
        resultText: "你按比例稀释、静置，水终于从「可疑」变成了「可喝」。",
        knowledgeId: "flood-boil-water",
      },
      {
        id: "flood-middle-bleach-b",
        label: "用衣服过滤一遍再喝",
        quality: "ok",
        effects: { water: 8, hp: -5, sanity: -3 },
        resultText:
          "衣服滤掉了肉眼可见的部分。剩下的部分肉眼看不见，但显然还在。",
        knowledgeId: "flood-boil-water",
      },
      {
        id: "flood-middle-bleach-c",
        label: "直接喝，反正已经末日了",
        quality: "bad",
        effects: { water: 12, hp: -15, sanity: -8 },
        specificEffect: -4,
        resultText: "你喝下去了。两小时后，你开始和马桶讨论人生。",
        knowledgeId: "flood-boil-water",
      },
    ],
  },
  {
    id: "flood-middle-streetlight",
    scenarioId: "flood",
    phase: "middle",
    act: "街区",
    title: "水面下的路灯光",
    body: "前方路口，一盏路灯半沉在水里，水面每隔几秒闪一下火花，像在给路过的鱼打光。绕路要多走二十分钟，而天快黑了。",
    knowledgeId: "flood-current",
    choices: [
      {
        id: "flood-middle-streetlight-a",
        label: "绕路，离带电水面越远越好",
        quality: "good",
        effects: { energy: -12, sanity: 3 },
        specificEffect: 6,
        resultText: "你多走了二十分钟，但保住了继续走路的资格。",
        knowledgeId: "flood-current",
      },
      {
        id: "flood-middle-streetlight-b",
        label: "先用木棍探一探，赌它已经断电",
        quality: "ok",
        risk: {
          probability: 40,
          successEffects: { energy: 6, sanity: 2 },
          failureEffects: { hp: -25, sanity: -10 },
          successSpecificEffect: 2,
          failureSpecificEffect: -12,
          successText:
            "木棍探下去，水面安静了。你赌赢了，但赌场不喜欢你这种客人。",
          failureText: "木棍刚碰到水面，你的手臂就替路灯完成了导电工作。",
        },
        resultText: "你决定用一根木棍和物理定律谈判。",
        knowledgeId: "flood-current",
      },
      {
        id: "flood-middle-streetlight-c",
        label: "快速跑过去，跑得够快就电不到",
        quality: "bad",
        effects: { energy: -10, hp: -20, sanity: -8 },
        specificEffect: -6,
        resultText: "你确实跑得很快。电流也很快。",
        knowledgeId: "flood-current",
      },
    ],
  },
  {
    id: "flood-middle-dog",
    scenarioId: "flood",
    phase: "middle",
    act: "邻里",
    title: "屋顶上的狗和你的最后一包饼干",
    body: "隔壁楼顶传来狗叫。那只柴犬站在空调外机上，表情比你镇定。你数了数食物：够自己吃三天，够一人一狗吃一天半。",
    knowledgeId: "flood-wound-tetanus",
    choices: [
      {
        id: "flood-middle-dog-a",
        label: "搭块木板把它接过来，顺便和邻居换净水片",
        quality: "good",
        effects: { sanity: 10, food: -6, energy: -8 },
        specificEffect: 5,
        resultText:
          "狗过来了，邻居也过来了，还带来半板净水片。末日里的硬通货原来是狗缘。",
        knowledgeId: "flood-boil-water",
      },
      {
        id: "flood-middle-dog-b",
        label: "游过去把它抱回来，赌水流和狗都配合",
        quality: "ok",
        risk: {
          probability: 50,
          successEffects: { sanity: 16, food: -4, hp: -5 },
          failureEffects: { hp: -16, sanity: -8, food: -4 },
          successSpecificEffect: 8,
          failureSpecificEffect: -6,
          successText:
            "你游到了对面，狗居然很配合。你们一起湿漉漉地爬回屋顶，像两个刚下班的潜水员。",
          failureText:
            "狗被你吓到了，在你手背上留下牙印后自己跳回了屋顶。你成了它今天唯一的战利品。",
        },
        resultText: "你决定当一次英雄，至少是狗眼里的英雄。",
        knowledgeId: "flood-wound-tetanus",
      },
      {
        id: "flood-middle-dog-c",
        label: "直接翻过去抱狗，手套和绳子都省了",
        quality: "bad",
        effects: { hp: -12, sanity: -5, energy: -10 },
        specificEffect: -6,
        resultText:
          "狗没事，你有事。它在你小臂上留下了一道需要认真冲洗的纪念。",
        knowledgeId: "flood-wound-tetanus",
      },
    ],
  },
  {
    id: "flood-middle-fridge",
    scenarioId: "flood",
    phase: "middle",
    act: "再利用",
    title: "又一台冰箱漂过来",
    body: "一台双开门冰箱顺流而下，姿态从容，像在参加一场没有终点的漂流比赛。你突然意识到，末日里最不缺的就是冰箱。",
    knowledgeId: "flood-boil-water",
    choices: [
      {
        id: "flood-middle-fridge-a",
        label: "把它拖上来，改成储水容器和浮具",
        quality: "good",
        effects: { water: 20, energy: -15 },
        specificEffect: 8,
        resultText:
          "你给冰箱做了第二次职业规划：从保鲜食物，改行保鲜你。",
        knowledgeId: "flood-boil-water",
      },
      {
        id: "flood-middle-fridge-b",
        label: "爬上去，把冰箱当筏子去下游探路",
        quality: "ok",
        risk: {
          probability: 55,
          successEffects: { food: 15, energy: -8 },
          failureEffects: { hp: -18, water: -10, sanity: -8 },
          successSpecificEffect: 5,
          failureSpecificEffect: -10,
          successText:
            "冰箱载着你漂了半条街，你甚至找到了一箱漂来的压缩饼干。",
          failureText:
            "冰箱在第一个弯道就完成了翻面动作，你被迫提前上岸。",
        },
        resultText: "你决定让家电承担交通工具的职责。",
        knowledgeId: "flood-current",
      },
      {
        id: "flood-middle-fridge-c",
        label: "把它擦干净供起来，纪念逝去的现代生活",
        quality: "bad",
        effects: { sanity: 5, energy: -10, water: -5 },
        specificEffect: -5,
        resultText: "你对着冰箱鞠了一躬。冰箱没有回应，但你的水少了一截。",
        knowledgeId: "flood-boil-water",
      },
    ],
  },
  {
    id: "flood-middle-transfer",
    scenarioId: "flood",
    phase: "middle",
    act: "转移",
    title: "两栋楼之间",
    body: "这一栋的水位在涨，隔壁那栋高了三层。中间隔着四米，水流急得能听见它在发脾气。",
    knowledgeId: "flood-current",
    choices: [
      {
        id: "flood-middle-transfer-a",
        label: "用绳索固定两端，从高处通道转移",
        quality: "good",
        effects: { energy: -14, hp: -2 },
        specificEffect: 10,
        resultText:
          "绳子绷紧的那一刻，你短暂地成了一名工程师。高度比勇气可靠。",
        knowledgeId: "flood-vertical-evacuation",
      },
      {
        id: "flood-middle-transfer-b",
        label: "把木板搭过去，快速冲过去",
        quality: "ok",
        risk: {
          probability: 50,
          successEffects: { energy: -10 },
          failureEffects: { hp: -22, sanity: -10, energy: -15 },
          successSpecificEffect: 8,
          failureSpecificEffect: -12,
          successText:
            "木板居然撑住了。你冲过去时甚至听见了自己心跳的回声。",
          failureText:
            "木板在你跑到一半时决定退休。你落水的位置离对岸只差半米，离后悔只差一秒。",
        },
        resultText: "你决定用一块木板测试自己的平衡感。",
        knowledgeId: "flood-current",
      },
      {
        id: "flood-middle-transfer-c",
        label: "直接跳进水里游过去，距离又不长",
        quality: "bad",
        effects: { hp: -25, sanity: -12, energy: -18 },
        specificEffect: -15,
        resultText: "四米在游泳池里很短，在洪水里足够写完一份遗嘱。",
        knowledgeId: "flood-current",
      },
    ],
  },
  {
    id: "flood-middle-rain",
    scenarioId: "flood",
    phase: "middle",
    act: "天气",
    title: "下雨了",
    body: "雨点砸在屋顶的防水布上，声音像有人在天上倒豆子。这是三天来第一次看到干净的水从天上掉下来。",
    knowledgeId: "flood-boil-water",
    choices: [
      {
        id: "flood-middle-rain-a",
        label: "铺开防水布接雨水，过滤后煮沸",
        quality: "good",
        effects: { water: 22, energy: -8, sanity: 4 },
        specificEffect: 5,
        resultText:
          "你接满了两桶雨。煮沸之后，它们从「天上来的」变成了「能喝的」。",
        knowledgeId: "flood-boil-water",
      },
      {
        id: "flood-middle-rain-b",
        label: "张开嘴直接接，省一个杯子",
        quality: "ok",
        effects: { water: 6, hp: -6, sanity: -4 },
        specificEffect: 2,
        resultText: "你喝到了一些雨水，也喝到了一些屋顶。",
        knowledgeId: "flood-boil-water",
      },
      {
        id: "flood-middle-rain-c",
        label: "把湿衣服晾在雨里，等它自己干",
        quality: "bad",
        effects: { sanity: -6, energy: -6, hp: -8 },
        specificEffect: -5,
        resultText:
          "衣服没干，你也没有。湿衣服贴在身上，体温开始认真下降。",
        knowledgeId: "flood-hypothermia",
      },
    ],
  },
  {
    id: "flood-finale-helicopter",
    scenarioId: "flood",
    phase: "finale",
    act: "终局",
    title: "直升机的轰鸣",
    body: "第七天，远处传来直升机的轰鸣。它可能看见了你，也可能只是路过。屋顶边是你绑好的自制筏，背后还有半桶攒了三天的水。",
    knowledgeId: "flood-roof-signal",
    choices: [
      {
        id: "flood-finale-helicopter-a",
        label: "上天台用镜子和亮色布打信号，等救援",
        quality: "good",
        effects: { hp: 10, sanity: 12, energy: -8, food: -8, water: -8 },
        specificEffect: 12,
        resultText:
          "你把最后一点体力用来挥布。直升机掉头了。你成了那个被写进救援报告的人。",
        knowledgeId: "flood-roof-signal",
      },
      {
        id: "flood-finale-helicopter-b",
        label: "划自制筏去下游的救援点",
        quality: "ok",
        risk: {
          probability: 55,
          successEffects: {
            hp: 6,
            sanity: 8,
            energy: -15,
            food: -10,
            water: -10,
          },
          failureEffects: {
            hp: -25,
            sanity: -15,
            energy: -20,
            food: -10,
            water: -10,
          },
          successSpecificEffect: 5,
          failureSpecificEffect: -20,
          successText:
            "你划到了救援点。救援人员看着你的冰箱牌筏子，沉默了三秒，然后递来一条毯子。",
          failureText:
            "筏子在下游散了架，你抱着一块泡沫板漂到天黑。救援点还在，只是不在这个方向。",
        },
        resultText: "你把绳子解开，决定亲自去确认救援点还在不在。",
        knowledgeId: "flood-current",
      },
      {
        id: "flood-finale-helicopter-c",
        label: "哪儿也不去，守着半桶水和屋顶等奇迹",
        quality: "bad",
        effects: { hp: -15, sanity: -12, food: -12, water: -12 },
        specificEffect: -10,
        resultText:
          "直升机的声音远去了。你和半桶水互相凝视，谁也没先开口。",
        knowledgeId: "flood-roof-signal",
      },
    ],
  },
];
