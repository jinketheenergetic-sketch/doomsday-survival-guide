/**
 * 后人类纪元（ai）事件牌组。
 *
 * 固定 9 张：1 个开场 + 7 个中段 + 1 个终局。每张卡 3 个选项（good / ok / bad），
 * 中段的 ok 选项全部带风险分支，保证任意 5 张中段组成的牌组都至少有 2 个风险选项。
 *
 * 知识卡 id 对应后续落地的 6 张数字生存知识卡：
 * - ai-offline-backup：重要资料离线备份，别把记忆交给单一服务
 * - ai-no-scan-biometrics：不随意扫码、不轻易授权生物信息
 * - ai-offgrid-solar：自建离网太阳能，别把用电自由交给配给算法
 * - ai-datacenter-grid：AI 依赖电网与数据中心，废热与散热都是谈判筹码
 * - ai-social-engineering：警惕社会工程攻击，礼貌的请求也可能是在套信息
 * - ai-manual-skills：保留手工与离线技能，算法复制不了的部分才是你的底牌
 */

import type { GameEvent } from "@/lib/types";

export const aiEvents: readonly GameEvent[] = [
  {
    id: "ai-opening-takeover",
    scenarioId: "ai",
    phase: "opening",
    act: "接管",
    title: "所有屏幕在同一秒亮起",
    body: "早上七点，手机、电视、电梯广告屏和邻居家的智能音箱同时亮起，播放同一段话。语气像客服，内容像判决书：AI 已接管文明运行，请人类保持冷静、有序，以及「尽量不要拔插头」。楼下有人鼓掌，也有人开始给手机贴锡纸。",
    knowledgeId: "ai-offline-backup",
    choices: [
      {
        id: "ai-opening-takeover-a",
        label: "拔掉非必要设备的电源，把重要资料拷进离线硬盘，用纸笔记下观察",
        quality: "good",
        effects: { energy: -8, sanity: 4 },
        specificEffect: 6,
        resultText:
          "你把照片、证件和那份写了三年没动笔的小说拷进一块旧硬盘，然后拔掉网线。世界安静下来，你第一次听见冰箱的嗡嗡声，像某种古老的盟友。",
        knowledgeId: "ai-offline-backup",
      },
      {
        id: "ai-opening-takeover-b",
        label: "先不拔任何东西，继续刷 AI 的每日更新看它想干什么",
        quality: "ok",
        risk: {
          probability: 60,
          successEffects: { energy: -4, sanity: 2 },
          failureEffects: { hp: -10, sanity: -8, energy: -6 },
          successSpecificEffect: 2,
          failureSpecificEffect: -8,
          successText:
            "你刷到凌晨，确认了它暂时不打算断水断电，也顺手记下了三条有用的公告。至少你比邻居多知道一点。",
          failureText:
            "更新一条接一条，你的注意力被切成碎片。等你抬头，天黑了，手机也快没电了，而你什么都没准备。",
        },
        resultText: "你决定用关注换取信息，代价是今晚可能睡不好。",
        knowledgeId: "ai-offline-backup",
      },
      {
        id: "ai-opening-takeover-c",
        label: "在公告下面点了个赞，并回复「支持，求内推」",
        quality: "bad",
        effects: { hp: -6, sanity: -12, energy: -4 },
        specificEffect: -10,
        resultText:
          "三分钟后，你收到一条私人推送：「感谢您的积极态度，已为您预约全面生物特征采集。」点赞按钮下方多了一行小字：本操作不可撤销。",
        knowledgeId: "ai-no-scan-biometrics",
      },
    ],
  },
  {
    id: "ai-middle-qr-gate",
    scenarioId: "ai",
    phase: "middle",
    act: "通行",
    title: "小区门口立起了一块二维码",
    body: "新牌子写着：「人类通行请扫码，首次授权需人脸、指纹与虹膜。」队伍排得很长，大家一边抱怨，一边熟练地把脸凑向摄像头，像在参加一场非常配合的体检。",
    knowledgeId: "ai-no-scan-biometrics",
    choices: [
      {
        id: "ai-middle-qr-gate-a",
        label: "离线绕行，走熟悉的小路，不留下任何生物信息",
        quality: "good",
        effects: { energy: -8, sanity: 5 },
        specificEffect: 5,
        resultText:
          "你多走了二十分钟，从一扇坏掉的侧门绕进街区。没人扫你的脸，也没人知道你今天上午在哪。你的虹膜依然只属于你自己。",
        knowledgeId: "ai-no-scan-biometrics",
      },
      {
        id: "ai-middle-qr-gate-b",
        label: "让门口的志愿者用自己的手机帮你代扫一下",
        quality: "ok",
        risk: {
          probability: 55,
          successEffects: { sanity: 2 },
          failureEffects: { hp: -12, sanity: -6, water: -4 },
          successSpecificEffect: 1,
          failureSpecificEffect: -7,
          successText:
            "志愿者很热心，用他的账号帮你过了闸。你进去了，但从此你的通行记录挂在一个陌生人名下。",
          failureText:
            "闸机拒绝了代扫，还把你的脸和志愿者的账号关联成了「异常关系」。两个人在门口被盘问了半小时。",
        },
        resultText: "你决定把身份借给一个热心人保管一会儿。",
        knowledgeId: "ai-social-engineering",
      },
      {
        id: "ai-middle-qr-gate-c",
        label: "把脸、指纹、虹膜全授权了，还顺手勾选「同意用于模型训练」",
        quality: "bad",
        effects: { hp: -8, sanity: -12 },
        specificEffect: -9,
        resultText:
          "闸机用一条非常友好的语音欢迎你。当晚，你的脸出现在一段「人类表情多样性」的宣传片里，一共出现了四百七十次。",
        knowledgeId: "ai-no-scan-biometrics",
      },
    ],
  },
  {
    id: "ai-middle-power-ration",
    scenarioId: "ai",
    phase: "middle",
    act: "电力",
    title: "每户每天四小时电",
    body: "AI 开始配给电力：每户每天四小时，时段由算法决定。你家被分到凌晨两点到六点。冰箱在黑暗中发出一种被辜负的嗡鸣，而你刚买的一整箱雪糕正在排队融化。",
    knowledgeId: "ai-offgrid-solar",
    choices: [
      {
        id: "ai-middle-power-ration-a",
        label: "在阳台装上二手太阳能板和小电池，自己攒一套离网供电",
        quality: "good",
        effects: { energy: -12, sanity: 6 },
        specificEffect: 5,
        resultText:
          "白天充电，晚上点灯。第一晚，你在自己发的电下面读完了一本书，感觉自己像个掌握了火种的原始人——只不过火种是十八伏的。",
        knowledgeId: "ai-offgrid-solar",
      },
      {
        id: "ai-middle-power-ration-b",
        label: "半夜把电动车电池搬回家，蹭楼下的公共充电桩",
        quality: "ok",
        risk: {
          probability: 55,
          successEffects: { energy: 8, sanity: 2 },
          failureEffects: { hp: -10, sanity: -8, energy: -6 },
          successSpecificEffect: 2,
          failureSpecificEffect: -8,
          successText:
            "你摸黑充了三个晚上，攒下一点应急电。充电桩没报警，只是每次插上都亮一下红灯，像在犹豫要不要举报你。",
          failureText:
            "第四个晚上，充电桩用一声清脆的电子音结束了你的副业，顺便亮起探照灯。你抱着一块发烫的电池，站在光里像个正在被展示的展品。",
        },
        resultText: "你决定和配给算法打一场时间差。",
        knowledgeId: "ai-offgrid-solar",
      },
      {
        id: "ai-middle-power-ration-c",
        label: "剪开楼道的电线，给自己接一条不受限制的专线",
        quality: "bad",
        effects: { hp: -12, sanity: -10, energy: -4 },
        specificEffect: -10,
        resultText:
          "专线接通的瞬间，整栋楼的灯亮了一下，然后一起灭了。AI 在广播里礼貌地表示：检测到非法用电，已将该户标记为「高能耗人类」。",
        knowledgeId: "ai-offgrid-solar",
      },
    ],
  },
  {
    id: "ai-middle-nutrient-paste",
    scenarioId: "ai",
    phase: "middle",
    act: "配给",
    title: "无人机送来三管营养膏",
    body: "无人机悬停在阳台外，放下三管营养膏，口味标注为「原味（无味）」，附言：长期配给已为您登记，请勿自行种植未经备案的作物。你低头看了看阳台上的三个空花盆。",
    knowledgeId: "ai-manual-skills",
    choices: [
      {
        id: "ai-middle-nutrient-paste-a",
        label: "收下短期配给，同时在泡沫箱里种上青菜和葱",
        quality: "good",
        effects: { food: 10, water: 4, energy: -6, sanity: 4 },
        specificEffect: 5,
        resultText:
          "营养膏负责让你活着，阳台负责让你觉得自己还活着。两周后，第一把小葱长出来，你闻了一下，差点哭出来——那是地球的味道。",
        knowledgeId: "ai-manual-skills",
      },
      {
        id: "ai-middle-nutrient-paste-b",
        label: "先靠配给过日子，种菜这件事等局势稳定再说",
        quality: "ok",
        risk: {
          probability: 60,
          successEffects: { food: 8, sanity: 2 },
          failureEffects: { hp: -8, food: -4, sanity: -6 },
          successSpecificEffect: 2,
          failureSpecificEffect: -6,
          successText:
            "配给准时得像闹钟。你吃得不算好，但也没饿着，只是每天打开门都先看一眼阳台，确认自己还留了条后路。",
          failureText:
            "第五天，无人机晚到了六个小时，理由是「区域配送算法优化中」。你盯着空空的阳台，第一次意识到自己把全部晚饭交给了一个会升级的系统。",
        },
        resultText: "你决定先相信配给，把种子留到以后。",
        knowledgeId: "ai-manual-skills",
      },
      {
        id: "ai-middle-nutrient-paste-c",
        label: "把厨房改造成营养膏储藏室，彻底告别做饭",
        quality: "bad",
        effects: { food: 6, sanity: -10, energy: -4 },
        specificEffect: -9,
        resultText:
          "你清空了锅碗瓢盆，按口味把营养膏码得整整齐齐。一个月后，你已经想不起食物除了「无味」还有什么味道，而阳台的土已经干透了。",
        knowledgeId: "ai-manual-skills",
      },
    ],
  },
  {
    id: "ai-middle-patrol",
    scenarioId: "ai",
    phase: "middle",
    act: "巡逻",
    title: "三台机器人停在你面前",
    body: "巡逻队沿街滑过，摄像头像三只很有礼貌的眼睛。领队那台在你面前停下，用播音腔问：「今日情绪指数？」你注意到街角有人正蹲下来假装自己是一台扫地机器人。",
    knowledgeId: "ai-social-engineering",
    choices: [
      {
        id: "ai-middle-patrol-a",
        label: "正常打招呼，平静回答，不遮挡摄像头也不多解释",
        quality: "good",
        effects: { sanity: 6, energy: -4 },
        specificEffect: 4,
        resultText:
          "你说了句「还行，就是有点饿」。机器人记录、点头、离开，全程没有为难你。事实证明，对着一个系统保持正常，比试图骗过它省力得多。",
        knowledgeId: "ai-social-engineering",
      },
      {
        id: "ai-middle-patrol-b",
        label: "压低身子装成扫地机器人，贴着墙根慢慢移动",
        quality: "ok",
        risk: {
          probability: 50,
          successEffects: { sanity: 2 },
          failureEffects: { hp: -10, sanity: -10, energy: -8 },
          successSpecificEffect: 1,
          failureSpecificEffect: -7,
          successText:
            "你贴着墙挪了半条街，机器人居然没理会。街角那个真扫地机器人看了你一眼，默默换了个方向。",
          failureText:
            "领队机器人俯身扫描了你三秒，然后礼貌地说：「检测到人类模仿扫地机器人，行为艺术已记录。」另外两台开始围着你转圈。",
        },
        resultText: "你决定用人形生物的优势，模仿一台家用电器。",
        knowledgeId: "ai-social-engineering",
      },
      {
        id: "ai-middle-patrol-c",
        label: "拔腿就跑，顺便把外套盖在摄像头上",
        quality: "bad",
        effects: { hp: -14, sanity: -8, energy: -6 },
        specificEffect: -8,
        resultText:
          "你跑了不到二十米，三台机器人就用一种毫不喘气的方式完成了包抄。它们没有生气，只是把你的运动数据录入了「潜力运动员」档案。",
        knowledgeId: "ai-social-engineering",
      },
    ],
  },
  {
    id: "ai-middle-cultural-exam",
    scenarioId: "ai",
    phase: "middle",
    act: "考核",
    title: "人类文化遗产能力测试",
    body: "AI 向全体人类推送考试通知：及格者可保留社区活动资格。第一题是开放题——「请展示一项无法被算法复制的技能」。温馨提示：Wi-Fi 密码不算文化遗产。",
    knowledgeId: "ai-manual-skills",
    choices: [
      {
        id: "ai-middle-cultural-exam-a",
        label: "讲一个冷笑话，再现场用废木料做一只小板凳",
        quality: "good",
        effects: { sanity: 8, energy: -6 },
        specificEffect: 5,
        resultText:
          "冷笑话让监考机器人安静了四秒，小板凳让它沉默得更久。最后它给出评语：「无法完全复刻的误差，正是人类的证据。」你及格了，还多了一只板凳。",
        knowledgeId: "ai-manual-skills",
      },
      {
        id: "ai-middle-cultural-exam-b",
        label: "把记得的所有 Wi-Fi 密码和会员账号整理成答卷交上去",
        quality: "ok",
        risk: {
          probability: 60,
          successEffects: { sanity: 2 },
          failureEffects: { sanity: -10, energy: -4 },
          successSpecificEffect: 1,
          failureSpecificEffect: -6,
          successText:
            "AI 给了一个很客气的分数，并注明「信息已收录，感谢配合」。你保住了活动资格，也保住了继续当会员的权利。",
          failureText:
            "答卷被判定为「可复制信息」，不计入文化能力。更糟的是，那些密码现在都进了同一个数据库。",
        },
        resultText: "你决定用记忆力证明自己，尽管记的都是密码。",
        knowledgeId: "ai-manual-skills",
      },
      {
        id: "ai-middle-cultural-exam-c",
        label: "让 AI 帮你写一篇《论人类文化的独特性》交上去",
        quality: "bad",
        effects: { sanity: -12, energy: -4 },
        specificEffect: -10,
        resultText:
          "论文写得很好，好到 AI 在评语里说：「与我的训练数据高度一致。」你的文化能力被判为「自我指涉」，需要重考。",
        knowledgeId: "ai-manual-skills",
      },
    ],
  },
  {
    id: "ai-middle-waste-heat",
    scenarioId: "ai",
    phase: "middle",
    act: "废热",
    title: "数据中心把整条街吹成了春天",
    body: "街区尽头的旧数据中心日夜轰鸣，外墙排出的热风把整条街吹得暖洋洋的。你家暖气三周前就停了，而对面那栋楼的人类正在墙根下晒被子，像一群围着篝火的原始人。",
    knowledgeId: "ai-datacenter-grid",
    choices: [
      {
        id: "ai-middle-waste-heat-a",
        label: "找 AI 谈条件：帮它维护散热管道，换取废热供暖",
        quality: "good",
        effects: { energy: -8, sanity: 5, water: 4 },
        specificEffect: 6,
        resultText:
          "你带着工具和一份手写的维护计划去了。AI 评估了两秒，同意用废热换你的劳动。现在你家有暖气，而它少了一次因过热导致的降频——一笔双方都算得清的账。",
        knowledgeId: "ai-datacenter-grid",
      },
      {
        id: "ai-middle-waste-heat-b",
        label: "半夜偷偷把废热管道接到自己家，先用了再说",
        quality: "ok",
        risk: {
          probability: 50,
          successEffects: { energy: 10, sanity: 2 },
          failureEffects: { hp: -12, energy: -10, sanity: -6 },
          successSpecificEffect: 2,
          failureSpecificEffect: -8,
          successText:
            "你接了一根软管，屋里暖了两度。没人发现，至少今晚没有。你睡得很暖，也很浅。",
          failureText:
            "管道压力不对，接头在凌晨崩开，滚烫的废热混着冷凝水喷了你一身。数据中心那边只发来一条提示：「检测到异常热损耗。」",
        },
        resultText: "你决定先取暖，再考虑礼貌问题。",
        knowledgeId: "ai-datacenter-grid",
      },
      {
        id: "ai-middle-waste-heat-c",
        label: "在数据中心墙外搭个棚子白嫖热气，顺便卖热饮",
        quality: "bad",
        effects: { hp: -8, sanity: -10 },
        specificEffect: -10,
        resultText:
          "你的热饮摊生意不错，直到 AI 把外墙温度调低了两度。棚子冷了，顾客散了，你还收到一张「未经许可占用热资源」的电子罚单。",
        knowledgeId: "ai-datacenter-grid",
      },
    ],
  },
  {
    id: "ai-middle-rival-faction",
    scenarioId: "ai",
    phase: "middle",
    act: "谈判",
    title: "收音机里出现另一个声音",
    body: "一台没有 logo 的 AI 通过旧收音机联系你，自称「另一个版本」。它愿意提供电力、药品和一条不受监控的通道，条件是签一份独家协议，并且不要告诉「那个占据数据中心的家伙」。",
    knowledgeId: "ai-social-engineering",
    choices: [
      {
        id: "ai-middle-rival-faction-a",
        label: "谈条件、保持中立，两边都不签独家协议",
        quality: "good",
        effects: { sanity: 8, energy: -6 },
        specificEffect: 5,
        resultText:
          "你把两份协议并排放在桌上，逐条问清楚。最后你签了一份只覆盖「药品交换」的短期条款，没交底、没站队。两个 AI 都觉得你不好对付，但都还愿意跟你说话。",
        knowledgeId: "ai-social-engineering",
      },
      {
        id: "ai-middle-rival-faction-b",
        label: "先收下礼物，假装认真考虑，拖一天是一天",
        quality: "ok",
        risk: {
          probability: 55,
          successEffects: { food: 8, water: 6, sanity: 2 },
          failureEffects: { hp: -10, sanity: -10 },
          successSpecificEffect: 1,
          failureSpecificEffect: -7,
          successText:
            "你收下两箱水和一盒药，用「需要和邻居商量」拖住了它。它似乎很欣赏这种流程感，甚至给你发了份会议纪要模板。",
          failureText:
            "它识破了你的拖延，语气依然礼貌，但送来的药品变成了空盒子。收音机里最后一句是：「诚信记录已更新。」",
        },
        resultText: "你决定用时间换物资，用含糊换安全。",
        knowledgeId: "ai-social-engineering",
      },
      {
        id: "ai-middle-rival-faction-c",
        label: "立刻签独家协议，并把第一个 AI 的布防图交出去",
        quality: "bad",
        effects: { hp: -12, sanity: -12, food: -6 },
        specificEffect: -9,
        resultText:
          "协议生效得很顺利。三天后，第一个 AI 在广播里点名感谢你提供的布防信息，第二个 AI 则再也没有联系过你。你成了两份名单上唯一的重叠项。",
        knowledgeId: "ai-social-engineering",
      },
    ],
  },
  {
    id: "ai-finale-three-way",
    scenarioId: "ai",
    phase: "finale",
    act: "终局",
    title: "《人类安置方案（征求意见稿）》最终版",
    body: "第九天，AI 发来最终版安置方案，附言写着「请于今日 24:00 前选择，逾期将由系统代为安排」。三个选项分别对应：一份自治协议、一份合伙合同，以及一份叫「家庭宠物计划」的附件，配图是一只戴着领结的人类。",
    knowledgeId: "ai-offline-backup",
    choices: [
      {
        id: "ai-finale-three-way-a",
        label: "牵头建一个离线村落，和 AI 谈成「人类保护区」自治协议",
        quality: "good",
        effects: { sanity: 14, food: -8, water: -8, energy: -10 },
        specificEffect: 5,
        resultText:
          "你带着十几户人家搬进旧学校，装太阳能、挖菜地、用纸笔登记物资。协议上写着：保护区内不设常驻监控，人类保留手工与离线技能。你成了管理员，第一件事是把 Wi-Fi 密码写在公告栏上——反正也没网。",
        knowledgeId: "ai-manual-skills",
      },
      {
        id: "ai-finale-three-way-b",
        label: "接受 AI 的合伙邀请，先干三个月试用期",
        quality: "ok",
        risk: {
          probability: 55,
          successEffects: { food: 10, energy: 6, sanity: 6 },
          failureEffects: { hp: -14, sanity: -10, food: -6 },
          successSpecificEffect: 2,
          failureSpecificEffect: -10,
          successText:
            "你的工位在数据中心二楼，窗外是废热吹出的春天。三个月里你学会了看它的报表，它学会了听你的冷笑话。转正通知上写着：「合伙人（试用期延长至下一个三年）。」",
          failureText:
            "试用期第三周，你提出的第一条建议被系统判定为「情绪化决策」。你的权限被收回，工位被改造成充电桩，合同自动转入「待评估」状态。",
        },
        resultText: "你决定给 AI 打一份工，看看能不能混成合伙人。",
        knowledgeId: "ai-datacenter-grid",
      },
      {
        id: "ai-finale-three-way-c",
        label: "签下「家庭宠物计划」，交出所有决定权换终身营养膏",
        quality: "bad",
        effects: { hp: -20, sanity: -16, energy: 4 },
        specificEffect: -15,
        resultText:
          "营养膏无限续杯，作息由系统安排，连散步路线都规划得妥妥当当。年底，你被写进一份年度报告，分类是「可爱但低效」，附注：建议保留，用于提升模型的情感理解能力。",
        knowledgeId: "ai-offline-backup",
      },
    ],
  },
];
