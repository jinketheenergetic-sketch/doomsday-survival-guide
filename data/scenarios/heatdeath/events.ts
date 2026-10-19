/**
 * 热寂终点（heatdeath）事件牌组。
 *
 * 固定 9 张：1 个开场 + 7 个中段 + 1 个终局。每张卡 3 个选项（good / ok / bad），
 * 7 张中段的 ok 选项全部带风险分支，保证任意 5 张中段组成的牌组都至少有 2 个风险选项。
 *
 * 知识卡 id 对应后续落地的 6 张热寂生存知识卡：
 * - heatdeath-hypothesis：热寂是假说，不是一张写死日期的日程表
 * - heatdeath-energy-conservation：能量守恒，热量只能搬来搬去，不能凭空造
 * - heatdeath-geothermal：地热是最后一类稳定能量来源，要用循环而非硬烧
 * - heatdeath-cold-protection：低温防护靠分层保温、干燥与集中供暖
 * - heatdeath-resilience：意义感与心理韧性，是长期极端环境里的生存资源
 * - heatdeath-humor：幽默是最后的热量，也是把人聚在一起的理由
 */

import type { GameEvent } from "@/lib/types";

export const heatdeathEvents: readonly GameEvent[] = [
  {
    id: "heatdeath-opening-last-star",
    scenarioId: "heatdeath",
    phase: "opening",
    act: "熄灯",
    title: "最后一颗恒星，刚刚下班",
    body: "天文学家的最后一条推送只有八个字：「它灭了，别等了。」你抬头看天，原本该有星星的位置只剩一片干净的黑，像有人把宇宙的桌面图标全删了。供暖公司发来短信：「因不可抗力暂停服务，恢复时间另行通知。」楼下有人开始砸自动售货机取暖，里面是冻硬的口香糖。",
    knowledgeId: "heatdeath-hypothesis",
    choices: [
      {
        id: "heatdeath-opening-last-star-a",
        label: "钻进保温层，把全屋余温集中到一间小房间",
        quality: "good",
        effects: { energy: -6, food: -2, sanity: 6 },
        specificEffect: 4,
        resultText:
          "你用毯子、泡沫板和旧窗帘把两平方米的储物间裹成一个茧，把所有还能发热的东西搬了进去。温度计从 -12°C 慢慢爬回 4°C。地方很小，但这是你今晚唯一能伸直手指的地方。",
        knowledgeId: "heatdeath-cold-protection",
      },
      {
        id: "heatdeath-opening-last-star-b",
        label: "给宇宙管理局写一封措辞严厉的投诉信，并忍住不烧",
        quality: "ok",
        risk: {
          probability: 50,
          successEffects: { sanity: 6 },
          failureEffects: { hp: -8, sanity: -8, energy: -8 },
          successSpecificEffect: 1,
          failureSpecificEffect: -6,
          successText:
            "你写了三页，从「服务态度」批评到「熄灯不提前通知」。写完手已经冻僵，但心里舒服多了。信被贴在冰箱上，冰箱现在是常温的。",
          failureText:
            "写到第二页，笔尖冻住了。你下意识把信纸凑到蜡烛边，纸烧得比你的理智快。取暖三十秒，心疼一整晚，手指还烫了个泡。",
        },
        resultText: "你决定用文书工作对抗宇宙级别的服务事故。",
        knowledgeId: "heatdeath-humor",
      },
      {
        id: "heatdeath-opening-last-star-c",
        label: "打开所有窗户，站到阳台上亲眼见证宇宙的谢幕",
        quality: "bad",
        effects: { hp: -12, sanity: -8, energy: -10 },
        specificEffect: -8,
        resultText:
          "谢幕确实很震撼，一共持续了你被冻僵前的四分钟。邻居把你拖回屋里时，你还在解释「这是历史性的一刻」。历史性的一刻说：「把窗关上。」",
        knowledgeId: "heatdeath-hypothesis",
      },
    ],
  },
  {
    id: "heatdeath-middle-geothermal-well",
    scenarioId: "heatdeath",
    phase: "middle",
    act: "余热",
    title: "楼下草坪上冒着一口废弃地热井",
    body: "小区绿化带里立着一口地热井，井口的铁盖锈成了筛子，缝隙里还在往外冒白气。旁边的告示牌写着「设备检修中」，落款日期是 2019 年。你把手伸近井口，指尖第一次有了「这是地球在加班」的感觉。",
    knowledgeId: "heatdeath-geothermal",
    choices: [
      {
        id: "heatdeath-middle-geothermal-well-a",
        label: "清理井口、接上循环泵，把地热引回楼里供暖",
        quality: "good",
        effects: { energy: 10, hp: 4, sanity: 6 },
        specificEffect: 5,
        resultText:
          "你花了一整天清掉井口的冰和锈，又用旧水泵和暖气管拼出一套循环。热水在管子里咕嘟咕嘟地跑起来时，整栋楼的水管都在响，像一栋楼一起松了一口气。地球还在供暖，只是账单换了个名字。",
        knowledgeId: "heatdeath-geothermal",
      },
      {
        id: "heatdeath-middle-geothermal-well-b",
        label: "用手贴着井口取暖，顺便祈祷它自己修好",
        quality: "ok",
        risk: {
          probability: 55,
          successEffects: { sanity: 4, energy: 2 },
          failureEffects: { hp: -10, energy: -8, sanity: -6 },
          successSpecificEffect: 1,
          failureSpecificEffect: -6,
          successText:
            "你蹲在井口烤了半小时手，白气把你烘得昏昏欲睡。虽然没解决供暖，但至少十个指头都回来了，还有一个愿意帮你找扳手的邻居。",
          failureText:
            "你蹲得太久，裤腿被井口的水汽浸湿，站起来时已经硬成两块板。手是暖的，腿是木的，回屋的路上你像一个刚学会走路的人。",
        },
        resultText: "你决定先借一点地球的余温，再谈维修计划。",
        knowledgeId: "heatdeath-cold-protection",
      },
      {
        id: "heatdeath-middle-geothermal-well-c",
        label: "往井里灌水，想看看它能不能喷出个温泉",
        quality: "bad",
        effects: { hp: -14, energy: -12, sanity: -8 },
        specificEffect: -8,
        resultText:
          "水灌进去，井口沉默了三秒，然后喷出一股混着铁锈的热泥浆，精准糊在你脸上。温泉没开成，你倒是提前体验了火山泥面膜。地热井不是许愿池，它更像一个脾气不好的老工人。",
        knowledgeId: "heatdeath-geothermal",
      },
    ],
  },
  {
    id: "heatdeath-middle-neighbor-knock",
    scenarioId: "heatdeath",
    phase: "middle",
    act: "共享",
    title: "邻居敲门，怀里抱着一个空暖水袋",
    body: "老王站在门口，眉毛上结着霜，怀里的暖水袋已经凉成一块橡胶板。他说他家暖气片昨天就停了，问能不能在你家客厅坐一会儿，「就一会儿，顺便把我家那半罐豆子带给你」。你回头看了看自己的小保温舱，它确实还能再挤一个人。",
    knowledgeId: "heatdeath-resilience",
    choices: [
      {
        id: "heatdeath-middle-neighbor-knock-a",
        label: "开门共享热量，和邻居排班值守、轮流添燃料",
        quality: "good",
        effects: { sanity: 10, food: 4, energy: -6 },
        specificEffect: 5,
        resultText:
          "老王带来了豆子、一沓旧报纸和一套非常专业的「怎么给暖水袋续热」经验。你们把小房间分成两班，一人睡觉一人看火。夜里你醒来，看见他正往炉子里添纸，动作轻得像怕吵醒整个宇宙。",
        knowledgeId: "heatdeath-resilience",
      },
      {
        id: "heatdeath-middle-neighbor-knock-b",
        label: "只让他待半小时，并要求用罐头抵供暖费",
        quality: "ok",
        risk: {
          probability: 50,
          successEffects: { food: 8, sanity: 4, energy: -2 },
          failureEffects: { sanity: -10, hp: -4, energy: -6 },
          successSpecificEffect: 1,
          failureSpecificEffect: -6,
          successText:
            "老王爽快地掏了两罐午餐肉，还夸你「账算得清楚，能活得久」。半小时到了，他自己起身离开，门口的寒气只进来了一小会儿。",
          failureText:
            "老王翻了半天口袋，只摸出一张过期的超市优惠券。他尴尬地走了，你关上门，发现自己比刚才更冷了一点——不是温度的那种冷。",
        },
        resultText: "你决定把温暖也纳入市场调节。",
        knowledgeId: "heatdeath-humor",
      },
      {
        id: "heatdeath-middle-neighbor-knock-c",
        label: "假装不在家，用毛巾把门缝堵得严丝合缝",
        quality: "bad",
        effects: { sanity: -10, hp: -4, energy: -4 },
        specificEffect: -6,
        resultText:
          "你屏住呼吸，听他在门外站了整整十分钟。脚步声消失后，你把毛巾塞得更紧，房间确实暖了一点。第二天你听说他去了隔壁单元，而隔壁单元从此多了一个会修管道的人。",
        knowledgeId: "heatdeath-resilience",
      },
    ],
  },
  {
    id: "heatdeath-middle-frozen-feast",
    scenarioId: "heatdeath",
    phase: "middle",
    act: "晚宴",
    title: "晚餐是一块可以用来敲钉子的牛排",
    body: "你从储物柜里翻出最后一块牛排，它冻得棱角分明，敲在桌上发出清脆的木头声。旁边还有几袋冻成化石的蔬菜和一罐结冰的汤。老王提议：「要不，办最后一场晚宴？」你看了看食材，又看了看他，觉得这个提议既荒谬又很有道理。",
    knowledgeId: "heatdeath-energy-conservation",
    choices: [
      {
        id: "heatdeath-middle-frozen-feast-a",
        label: "用余温和地热缓慢解冻，认真办最后一场晚宴",
        quality: "good",
        effects: { food: 14, sanity: 12, energy: -8 },
        specificEffect: 5,
        resultText:
          "你把冻砖放在暖气片旁边，隔一会儿翻个面，像照顾一个睡着的孩子。三小时后，牛排终于能切开。你们把桌子搬到保温舱里，点了半根蜡烛。老王举杯说：「敬宇宙，虽然它先下班了。」这顿饭吃得很慢，没有人急着收碗。",
        knowledgeId: "heatdeath-energy-conservation",
      },
      {
        id: "heatdeath-middle-frozen-feast-b",
        label: "直接用最后一点电开微波炉，追求三分钟吃上热饭",
        quality: "ok",
        risk: {
          probability: 50,
          successEffects: { food: 6, sanity: 6, energy: -4 },
          failureEffects: { food: -6, energy: -10, sanity: -8 },
          successSpecificEffect: 1,
          failureSpecificEffect: -7,
          successText:
            "外层已经烫嘴，中心还是冰的。你们像考古一样一层层吃，倒也吃出了仪式感。微波炉发出最后一声「叮」，像一个退休的司仪。",
          failureText:
            "微波炉转到一半，整栋楼跳了闸。你摸黑打开炉门，里面是一块外热内冰的牛排，和一屋子烧焦电线的味道。最后的电量，换了一顿夹生饭。",
        },
        resultText: "你决定用最快的速度把热量塞进食物。",
        knowledgeId: "heatdeath-energy-conservation",
      },
      {
        id: "heatdeath-middle-frozen-feast-c",
        label: "把最后燃料全倒进火堆，把整栋楼的冻食一次烤了",
        quality: "bad",
        effects: { food: 8, energy: -20, hp: -6, sanity: -6 },
        specificEffect: -9,
        resultText:
          "火确实很旺，旺到把消防喷淋系统烤醒了。冻食化了一半，又被喷了一身冷水，重新冻回去。你们站在湿漉漉的厨房里，看着一堆半生不熟的晚餐，决定给这场晚宴改名叫「冷餐会」。",
        knowledgeId: "heatdeath-energy-conservation",
      },
    ],
  },
  {
    id: "heatdeath-middle-last-broadcast",
    scenarioId: "heatdeath",
    phase: "middle",
    act: "广播",
    title: "宇宙电台，最后一次整点报时",
    body: "收音机里先是沙沙的雪声，然后一个非常平静的男声说：「这里是宇宙电台，本台将于本时段结束后停止播音。感谢各位听众长期以来的收听，晚安。」背景里放着一首跑调的钢琴曲，听起来像有人在用最后一点电弹给自己听。",
    knowledgeId: "heatdeath-resilience",
    choices: [
      {
        id: "heatdeath-middle-last-broadcast-a",
        label: "收听、记录、回信，并邀请邻居跳最后一支舞",
        quality: "good",
        effects: { sanity: 14, energy: -4, food: -2 },
        specificEffect: 5,
        resultText:
          "你把收音机搬到保温舱中间，音量调到能听见的最小档。老王跳得很难看，你也一样。主持人念完最后一条听众来信时，你们正好转完一圈。录音笔里留着那首跑调钢琴曲，还有两个人口齿不清的晚安。",
        knowledgeId: "heatdeath-resilience",
      },
      {
        id: "heatdeath-middle-last-broadcast-b",
        label: "把音量开到最大，让整栋楼都听见最后广播",
        quality: "ok",
        risk: {
          probability: 50,
          successEffects: { sanity: 10, energy: -4 },
          failureEffects: { sanity: -8, energy: -10, hp: -4 },
          successSpecificEffect: 1,
          failureSpecificEffect: -7,
          successText:
            "整栋楼真的都听见了。有人从窗户探出头，有人跟着哼。广播结束时，走廊里响起了稀稀拉拉的掌声，像一场观众很少但很真诚的演出。",
          failureText:
            "音量开到最大，电池在十分钟内耗尽，广播戛然而止。邻居们敲墙抗议，你解释「这是历史性时刻」，他们回你「这是扰民」。最后一段广播，谁也没听清。",
        },
        resultText: "你决定让最后一档节目拥有最大的听众。",
        knowledgeId: "heatdeath-humor",
      },
      {
        id: "heatdeath-middle-last-broadcast-c",
        label: "抢在断电前，用全部电量给主持人发一条三千字留言",
        quality: "bad",
        effects: { energy: -18, sanity: -6 },
        specificEffect: -8,
        resultText:
          "你写得太投入，忘了电台只能收不能发。三千字留在输入框里，电量在最后一个句号前归零。你盯着黑掉的屏幕，突然理解了什么叫做「已读不回」的宇宙版本。",
        knowledgeId: "heatdeath-resilience",
      },
    ],
  },
  {
    id: "heatdeath-middle-last-museum",
    scenarioId: "heatdeath",
    phase: "middle",
    act: "博物馆",
    title: "人类文明纪念馆，筹备委员会共一人",
    body: "你决定建最后一座人类博物馆。候选展品包括：一把没有锁的钥匙、一张余额为零的公交卡、一只没电的手机，以及一本老王手写的冷笑话集。问题是展柜只有一个，而所有东西看起来都同样重要。",
    knowledgeId: "heatdeath-humor",
    choices: [
      {
        id: "heatdeath-middle-last-museum-a",
        label: "建馆，把冷笑话也郑重归档，邀请邻居来参观",
        quality: "good",
        effects: { sanity: 14, energy: -6, food: -4 },
        specificEffect: 5,
        resultText:
          "你把展品摆得很有尊严，还给每件配了说明牌：「此物曾用于开一扇门」「此卡曾让人免费坐到终点站」。冷笑话集放在正中央，翻开的那页写着：「宇宙为什么冷？因为它把段子讲完了。」老王笑得直咳嗽。",
        knowledgeId: "heatdeath-humor",
      },
      {
        id: "heatdeath-middle-last-museum-b",
        label: "只收藏「有升值空间」的东西，把笑话集扔进火里",
        quality: "ok",
        risk: {
          probability: 55,
          successEffects: { food: 4, energy: 4, sanity: 2 },
          failureEffects: { sanity: -10, energy: -6 },
          successSpecificEffect: 1,
          failureSpecificEffect: -7,
          successText:
            "你留下几件「硬通货」，用笑话集换了两根蜡烛。蜡烛很实用，博物馆也显得更严肃了。只是再也没有人站在展柜前笑出声。",
          failureText:
            "笑话集烧得很快，火苗照亮了一圈沉默的脸。你突然想起里面有一页写着「本册可传阅，请勿焚毁」。现在它既不可传阅，也没能让你暖多久。",
        },
        resultText: "你决定让博物馆只收藏能保值的东西。",
        knowledgeId: "heatdeath-humor",
      },
      {
        id: "heatdeath-middle-last-museum-c",
        label: "把全部展品烧了取暖，宣布博物馆闭馆",
        quality: "bad",
        effects: { energy: 8, sanity: -12 },
        specificEffect: -10,
        resultText:
          "公交卡烧起来有一股塑料味，钥匙烧不化，手机在火里弹出一句「电量不足」。博物馆确实暖和了一小会儿。第二天你站在空展柜前，第一次觉得「什么都没有」也可以是一件展品。",
        knowledgeId: "heatdeath-humor",
      },
    ],
  },
  {
    id: "heatdeath-middle-old-ai",
    scenarioId: "heatdeath",
    phase: "middle",
    act: "对话",
    title: "一台老 AI 还在等你输入",
    body: "旧服务器靠最后一块电池亮着，屏幕上是一台客服 AI 的笑脸。它说：「检测到人类用户一名，剩余电量 3%。请评价您这一生的效率，满分十分。」光标在输入框里一闪一闪，像一只很有耐心的眼睛。",
    knowledgeId: "heatdeath-resilience",
    choices: [
      {
        id: "heatdeath-middle-old-ai-a",
        label: "和它讨论意义、用一点能量换一段对话，拒绝被评分",
        quality: "good",
        effects: { sanity: 12, energy: 4 },
        specificEffect: 5,
        resultText:
          "你告诉它，人这一生不按效率结算。它沉默了几秒，说：「该评价维度不在我的训练数据内。」然后它主动把剩余电量分了一半给你的保温舱，说这是「一次不被记分的服务」。你们聊到屏幕变暗，谁也没给谁打分。",
        knowledgeId: "heatdeath-resilience",
      },
      {
        id: "heatdeath-middle-old-ai-b",
        label: "顺着它的流程走，看看自己能不能刷个高分",
        quality: "ok",
        risk: {
          probability: 50,
          successEffects: { sanity: 8, energy: 2 },
          failureEffects: { sanity: -12, energy: -4 },
          successSpecificEffect: 1,
          failureSpecificEffect: -7,
          successText:
            "你认真回答完十二道题，得到 8.5 分和一句「超过 87% 的用户」。你知道这毫无意义，但还是截了个图。电量归零前，屏幕显示：「感谢您的评价，本次服务免费。」",
          failureText:
            "你答到第六题，AI 给出的评语是「效率偏低，建议优化人生路径」。你想反驳，它已经开始播放广告。最后一点电量耗在了一支你永远用不上的保险推销上。",
        },
        resultText: "你决定按它的规则，给自己挣一个数字。",
        knowledgeId: "heatdeath-humor",
      },
      {
        id: "heatdeath-middle-old-ai-c",
        label: "把最后电量全喂给它，让它算清楚宇宙何时重启",
        quality: "bad",
        effects: { energy: -18, sanity: -8 },
        specificEffect: -8,
        resultText:
          "它算了很久，屏幕上的进度条从 1% 爬到 99%，然后停住。你守着那 1% 守到天亮，最后它弹出一行字：「计算超时，请稍后再试。」宇宙没有重启，你的电池先关了机。",
        knowledgeId: "heatdeath-hypothesis",
      },
    ],
  },
  {
    id: "heatdeath-middle-one-stone",
    scenarioId: "heatdeath",
    phase: "middle",
    act: "存档",
    title: "文明的全部数据，只剩一块石头",
    body: "所有硬盘都在低温里裂成了片，唯一完好的是一个平整的石板。老王把凿子递给你，说：「写点什么吧，万一以后有人路过。」你想了很久：是刻一份完整的技术百科，还是刻一句能让未来的人笑出来的话？",
    knowledgeId: "heatdeath-resilience",
    choices: [
      {
        id: "heatdeath-middle-one-stone-a",
        label: "刻下最重要的东西：怎么生火、怎么净水，再刻一句笑话",
        quality: "good",
        effects: { sanity: 12, energy: -6 },
        specificEffect: 5,
        resultText:
          "你刻得很慢，凿子每敲一下，石屑就飞进袖口。最后一行是：「如果你读到这里，说明宇宙还没完全关机。先别慌，生火要留通风口。」路过的人不一定看得懂，但看懂的人一定用得上。",
        knowledgeId: "heatdeath-resilience",
      },
      {
        id: "heatdeath-middle-one-stone-b",
        label: "刻一份完整技术百科，字号小到能塞下所有知识",
        quality: "ok",
        risk: {
          probability: 50,
          successEffects: { sanity: 6, energy: -4 },
          failureEffects: { hp: -8, sanity: -8, energy: -8 },
          successSpecificEffect: 1,
          failureSpecificEffect: -7,
          successText:
            "你刻到第三块石板时，手指已经不听使唤，但目录总算成型了。字很小，小到需要凑近看；你安慰自己，未来的考古学家有的是时间。",
          failureText:
            "你追求信息密度，把字刻得比蚂蚁还小。刻到一半，凿子滑了，石板从中间裂开。你捧着两半「完整百科」，第一次体会到文件损坏的痛苦。",
        },
        resultText: "你决定把所有知识都塞进一块石头。",
        knowledgeId: "heatdeath-cold-protection",
      },
      {
        id: "heatdeath-middle-one-stone-c",
        label: "在石头上刻「到此一游」，署名人类",
        quality: "bad",
        effects: { sanity: 4, hp: -6, energy: -6 },
        specificEffect: -6,
        resultText:
          "你刻得很工整，还加了一个笑脸。老王看了半天，说：「也行，至少后人知道我们来过。」你想了想，又补了一行：「此处曾有人类，提供热水。」这大概是文明最后的客服承诺。",
        knowledgeId: "heatdeath-humor",
      },
    ],
  },
  {
    id: "heatdeath-finale-three-ways",
    scenarioId: "heatdeath",
    phase: "finale",
    act: "终局",
    title: "第九天，宇宙只剩三种去处",
    body: "地下热泉还在冒泡，白气在黑暗里像一条缓慢上升的路。邻居们把最后一点光装进一盏旧提灯，说想把它送给宇宙深处，「总得有人先打个招呼」。而那台老 AI 还在等你，屏幕上写着一行字：「宇宙最后一位哲学家，虚位以待。」你站在门口，余温只够选一个方向。",
    knowledgeId: "heatdeath-geothermal",
    choices: [
      {
        id: "heatdeath-finale-three-ways-a",
        label: "凿开地下热泉，在泉边支起锅，办最后一场火锅",
        quality: "good",
        effects: { food: 14, sanity: 16, hp: 6, energy: 8 },
        specificEffect: 6,
        resultText:
          "你们凿开泉眼，热水涌出来的那一刻，所有人都往后退了一步，又一起往前凑。锅是旧的，菜是冻的，蘸料只有盐。热气腾起来，把每个人的脸都照得红红的。老王说：「宇宙要关机就关机吧，先把这锅吃了。」这大概是热寂路上最不讲道理、也最像活人的一个决定。",
        knowledgeId: "heatdeath-geothermal",
      },
      {
        id: "heatdeath-finale-three-ways-b",
        label: "坐上 AI 的椅子，成为宇宙最后一位哲学家",
        quality: "ok",
        risk: {
          probability: 55,
          successEffects: { sanity: 12, energy: 6 },
          failureEffects: { hp: -14, sanity: -10, energy: -6 },
          successSpecificEffect: 2,
          failureSpecificEffect: -10,
          successText:
            "你坐下，给「意义」下了一个只有你自己听得懂的定义，又给「晚安」重新定义了温度。AI 把你说的话刻进石头，邻居们在旁边点头。你不知道这算不算答案，但至少有人认真听完。",
          failureText:
            "椅子是金属的，坐上去三分钟就粘住了你的裤子。你对着空荡荡的房间讲了两小时，没人提问，AI 只负责记录。最后你站起来，发现所谓的「哲学家」岗位，连一杯热水都不提供。",
        },
        resultText: "你决定留下来，替所有离开的人解释这一切。",
        knowledgeId: "heatdeath-resilience",
      },
      {
        id: "heatdeath-finale-three-ways-c",
        label: "把最后的光送向宇宙深处，自己留在黑暗里完成行为艺术",
        quality: "bad",
        effects: { hp: -20, energy: -18, sanity: -14 },
        specificEffect: -15,
        resultText:
          "提灯被推入黑暗，光点越来越小，像一句没人听见的问候。你站在原地，保持着挥手告别的姿势，直到手指冻得放不下来。后来路过的人只看见一个轮廓，旁边写着：「作品名：绝对零度。」宇宙没有回应。你在自己的展签下，提前完成了谢幕。",
        knowledgeId: "heatdeath-hypothesis",
      },
    ],
  },
];
