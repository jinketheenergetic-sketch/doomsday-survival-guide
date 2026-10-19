import { describe, expect, it } from "vitest";

import { scenarioById } from "@/data/scenarios";
import { INITIAL_RESOURCES } from "@/lib/engine/constants";
import { buildRun } from "@/lib/engine/deck";
import { createChoiceRng, resolveChoice } from "@/lib/engine/resolve";
import { mulberry32 } from "@/lib/engine/rng";
import type { Choice, GameEvent, Resources, RunState } from "@/lib/types";

const scenario = scenarioById.flood;

function makeEvents(): GameEvent[] {
  const makeEvent = (
    id: string,
    phase: "opening" | "middle" | "finale",
  ): GameEvent => ({
    id,
    scenarioId: "flood",
    phase,
    act: "测试幕",
    title: id,
    body: "",
    choices: [
      { id: `${id}-a`, label: "A", quality: "ok" },
      { id: `${id}-b`, label: "B", quality: "ok" },
      { id: `${id}-c`, label: "C", quality: "ok" },
    ],
  });

  return [
    makeEvent("flood-opening", "opening"),
    ...Array.from({ length: 5 }, (_, index) =>
      makeEvent(`flood-middle-${index + 1}`, "middle"),
    ),
    makeEvent("flood-finale", "finale"),
  ];
}

function makeRun(
  resources: Partial<Resources> = {},
  overrides: Partial<RunState> = {},
): RunState {
  const run = buildRun(
    scenario,
    20261019,
    makeEvents(),
    "2026-10-19T00:00:00.000Z",
  );

  return {
    ...run,
    resources: { ...INITIAL_RESOURCES, ...resources },
    ...overrides,
  };
}

/** 始终返回 0 的随机源 → randomInt(1, 100) = 1，风险判定必成功。 */
const alwaysSuccess = () => 0;
/** 始终返回接近 1 的随机源 → randomInt(1, 100) = 100，风险判定必失败。 */
const alwaysFailure = () => 0.999999;

describe("resolveChoice 确定效果与钳制", () => {
  it("应用确定型效果并记录选项、品质与文案", () => {
    const choice: Choice = {
      id: "choice-water",
      label: "烧水",
      quality: "good",
      effects: { water: 20, energy: -10 },
      resultText: "水烧开了，但你被烟呛得直流泪。",
      knowledgeId: "flood-water",
    };

    const { state, result } = resolveChoice(makeRun(), choice, alwaysSuccess);

    expect(state.resources.water).toBe(INITIAL_RESOURCES.water + 20);
    expect(state.resources.energy).toBe(INITIAL_RESOURCES.energy - 10);
    expect(result).toMatchObject({
      day: 1,
      eventId: "flood-opening",
      choiceId: "choice-water",
      quality: "good",
      text: "水烧开了，但你被烟呛得直流泪。",
      knowledgeId: "flood-water",
    });
    expect(result.riskSucceeded).toBeUndefined();
    expect(result.resourceDelta).toEqual({ water: 20, energy: -10 });
    expect(result.specificDelta).toBe(0);
  });

  it("资源上限钳制到 100，并记录实际变化量", () => {
    const choice: Choice = {
      id: "choice-full",
      label: "囤水",
      quality: "ok",
      effects: { water: 30, food: 30 },
      resultText: "水桶已经满了。",
    };

    const { state, result } = resolveChoice(
      makeRun({ water: 90, food: 100 }),
      choice,
      alwaysSuccess,
    );

    expect(state.resources.water).toBe(100);
    expect(state.resources.food).toBe(100);
    expect(result.resourceDelta).toEqual({ water: 10 });
    expect(state.status).toBe("playing");
  });

  it("资源下限钳制到 0", () => {
    const choice: Choice = {
      id: "choice-drain",
      label: "断电",
      quality: "bad",
      effects: { energy: -120 },
      resultText: "手电筒灭了。",
    };

    const { state, result } = resolveChoice(
      makeRun({ energy: 4 }),
      choice,
      alwaysSuccess,
    );

    expect(state.resources.energy).toBe(0);
    expect(result.resourceDelta).toEqual({ energy: -4 });
  });

  it("应用专属资源变化并记录 specificDelta", () => {
    const choice: Choice = {
      id: "choice-specific",
      label: "登高",
      quality: "ok",
      specificEffect: 15,
      resultText: "你爬上了楼顶。",
    };

    const { state, result } = resolveChoice(makeRun(), choice, alwaysSuccess);

    expect(state.specificResource).toBe(
      scenario.specificResource.initial + 15,
    );
    expect(result.specificDelta).toBe(15);
  });

  it("累加 good / bad 计数并追加历史记录", () => {
    const run = makeRun();
    const good: Choice = {
      id: "good",
      label: "A",
      quality: "good",
      resultText: "做对了。",
    };
    const bad: Choice = {
      id: "bad",
      label: "B",
      quality: "bad",
      resultText: "做错了。",
    };

    const first = resolveChoice(run, good, alwaysSuccess);
    const second = resolveChoice(first.state, bad, alwaysSuccess);

    expect(first.state.goodCount).toBe(1);
    expect(first.state.badCount).toBe(0);
    expect(second.state.goodCount).toBe(1);
    expect(second.state.badCount).toBe(1);
    expect(second.state.history).toHaveLength(2);
    expect(second.state.history[0]).toEqual(first.result);
    expect(second.state.history[1]).toEqual(second.result);
  });

  it("不修改传入的 run 与资源对象", () => {
    const run = makeRun();
    const snapshot = {
      resources: { ...run.resources },
      historyLength: run.history.length,
      goodCount: run.goodCount,
      badCount: run.badCount,
      status: run.status,
      day: run.day,
      eventIndex: run.eventIndex,
    };
    const choice: Choice = {
      id: "immutable",
      label: "A",
      quality: "good",
      effects: { hp: -10 },
      resultText: "擦伤。",
    };

    resolveChoice(run, choice, alwaysSuccess);

    expect(run.resources).toEqual(snapshot.resources);
    expect(run.history).toHaveLength(snapshot.historyLength);
    expect(run.goodCount).toBe(snapshot.goodCount);
    expect(run.badCount).toBe(snapshot.badCount);
    expect(run.status).toBe(snapshot.status);
    expect(run.day).toBe(snapshot.day);
    expect(run.eventIndex).toBe(snapshot.eventIndex);
  });

  it("结算不推进 day 与 eventIndex", () => {
    const run = makeRun();

    const { state } = resolveChoice(
      run,
      { id: "calm", label: "A", quality: "ok", resultText: "无事发生。" },
      alwaysSuccess,
    );

    expect(state.day).toBe(run.day);
    expect(state.eventIndex).toBe(run.eventIndex);
  });
});

describe("resolveChoice 风险分支", () => {
  const riskChoice: Choice = {
    id: "risk-crossing",
    label: "冒险涉水",
    quality: "ok",
    risk: {
      probability: 60,
      successEffects: { water: 20 },
      failureEffects: { water: -20 },
      successSpecificEffect: 5,
      failureSpecificEffect: -5,
      successText: "你活着到达了对岸。",
      failureText: "水流比你想象的急。",
    },
  };

  it("成功时使用 success 分支的效果与文案", () => {
    const { state, result } = resolveChoice(
      makeRun(),
      riskChoice,
      alwaysSuccess,
    );

    expect(result.riskSucceeded).toBe(true);
    expect(result.text).toBe("你活着到达了对岸。");
    expect(result.resourceDelta).toEqual({ water: 20 });
    expect(result.specificDelta).toBe(5);
    expect(state.resources.water).toBe(INITIAL_RESOURCES.water + 20);
  });

  it("失败时使用 failure 分支的效果与文案", () => {
    const { state, result } = resolveChoice(
      makeRun(),
      riskChoice,
      alwaysFailure,
    );

    expect(result.riskSucceeded).toBe(false);
    expect(result.text).toBe("水流比你想象的急。");
    expect(result.resourceDelta).toEqual({ water: -20 });
    expect(result.specificDelta).toBe(-5);
    expect(state.resources.water).toBe(INITIAL_RESOURCES.water - 20);
  });

  it("同一种子与同一选择得到相同判定", () => {
    const first = resolveChoice(makeRun(), riskChoice, mulberry32(987654));
    const second = resolveChoice(makeRun(), riskChoice, mulberry32(987654));

    expect(second.result).toEqual(first.result);
    expect(second.state).toEqual(first.state);
  });

  it("概率边界：1% 仍可能成功，99% 仍可能失败", () => {
    const lowProbability: Choice = {
      ...riskChoice,
      id: "risk-low",
      risk: { ...riskChoice.risk!, probability: 1 },
    };
    const highProbability: Choice = {
      ...riskChoice,
      id: "risk-high",
      risk: { ...riskChoice.risk!, probability: 99 },
    };

    expect(
      resolveChoice(makeRun(), lowProbability, alwaysSuccess).result
        .riskSucceeded,
    ).toBe(true);
    expect(
      resolveChoice(makeRun(), highProbability, alwaysFailure).result
        .riskSucceeded,
    ).toBe(false);
  });
});

describe("resolveChoice 死亡判定", () => {
  it("HP 归零时状态置为 dead 并停止推进", () => {
    const choice: Choice = {
      id: "fatal-hp",
      label: "硬扛",
      quality: "bad",
      effects: { hp: -100 },
      resultText: "你倒下了。",
    };

    const { state, result } = resolveChoice(
      makeRun({ hp: 40 }),
      choice,
      alwaysSuccess,
    );

    expect(state.resources.hp).toBe(0);
    expect(state.status).toBe("dead");
    expect(state.day).toBe(1);
    expect(state.eventIndex).toBe(0);
    expect(state.history).toHaveLength(1);
    expect(result.resourceDelta).toEqual({ hp: -40 });
  });

  it("理智归零时状态置为 dead", () => {
    const choice: Choice = {
      id: "fatal-sanity",
      label: "凝视深渊",
      quality: "bad",
      effects: { sanity: -100 },
      resultText: "你听见了不该听见的声音。",
    };

    const { state } = resolveChoice(
      makeRun({ sanity: 30 }),
      choice,
      alwaysSuccess,
    );

    expect(state.resources.sanity).toBe(0);
    expect(state.status).toBe("dead");
  });

  it("HP 与理智都大于 0 时保持 playing", () => {
    const { state } = resolveChoice(
      makeRun(),
      { id: "safe", label: "A", quality: "ok", effects: { hp: -10 } },
      alwaysSuccess,
    );

    expect(state.resources.hp).toBe(INITIAL_RESOURCES.hp - 10);
    expect(state.status).toBe("playing");
  });

  it("已结束的对局不能继续结算", () => {
    expect(() =>
      resolveChoice(
        makeRun({}, { status: "dead" }),
        { id: "late", label: "A", quality: "ok" },
        alwaysSuccess,
      ),
    ).toThrow(RangeError);
  });
});

describe("resolveChoice 断水断食惩罚", () => {
  const neutralChoice: Choice = {
    id: "neutral",
    label: "继续赶路",
    quality: "ok",
    effects: { energy: -5 },
    resultText: "你继续向前。",
  };

  it("水为 0 时额外扣 5 HP 并记入结果", () => {
    const { state, result } = resolveChoice(
      makeRun({ water: 0 }),
      neutralChoice,
      alwaysSuccess,
    );

    expect(state.resources.hp).toBe(INITIAL_RESOURCES.hp - 5);
    expect(result.resourceDelta.hp).toBe(-5);
    expect(state.status).toBe("playing");
  });

  it("食物为 0 时额外扣 5 HP", () => {
    const { state, result } = resolveChoice(
      makeRun({ food: 0 }),
      neutralChoice,
      alwaysSuccess,
    );

    expect(state.resources.hp).toBe(INITIAL_RESOURCES.hp - 5);
    expect(result.resourceDelta.hp).toBe(-5);
  });

  it("水与食物同时为 0 也只扣一次", () => {
    const { result } = resolveChoice(
      makeRun({ water: 0, food: 0 }),
      neutralChoice,
      alwaysSuccess,
    );

    expect(result.resourceDelta.hp).toBe(-5);
  });

  it("水与食物都大于 0 时不扣 HP", () => {
    const { result } = resolveChoice(makeRun(), neutralChoice, alwaysSuccess);

    expect(result.resourceDelta.hp).toBeUndefined();
  });

  it("选择本身补满水时不触发惩罚", () => {
    const choice: Choice = {
      id: "drink",
      label: "喝雨水",
      quality: "good",
      effects: { water: 10 },
      resultText: "你接住了一些雨水。",
    };

    const { state, result } = resolveChoice(
      makeRun({ water: 0 }),
      choice,
      alwaysSuccess,
    );

    expect(state.resources.water).toBe(10);
    expect(result.resourceDelta).toEqual({ water: 10 });
    expect(state.resources.hp).toBe(INITIAL_RESOURCES.hp);
  });

  it("惩罚后 HP 钳制到 0 并判定死亡", () => {
    const { state } = resolveChoice(
      makeRun({ hp: 3, water: 0 }),
      neutralChoice,
      alwaysSuccess,
    );

    expect(state.resources.hp).toBe(0);
    expect(state.status).toBe("dead");
  });

  it("选择效果与惩罚叠加记录在同一个 hp 变化中", () => {
    const choice: Choice = {
      id: "wound",
      label: "受伤",
      quality: "bad",
      effects: { hp: -10 },
      resultText: "你被划伤了。",
    };

    const { result } = resolveChoice(
      makeRun({ water: 0 }),
      choice,
      alwaysSuccess,
    );

    expect(result.resourceDelta.hp).toBe(-15);
  });
});

describe("createChoiceRng 重建随机流", () => {
  function historyEntry(riskSucceeded?: boolean) {
    return {
      day: 1,
      eventId: "flood-opening",
      choiceId: "choice",
      quality: "ok" as const,
      riskSucceeded,
      resourceDelta: {},
      specificDelta: 0,
      text: "",
    };
  }

  function expectedAfter(draws: number) {
    const rng = mulberry32(20261019);
    for (let index = 0; index < draws; index += 1) rng();
    return rng();
  }

  it("跳过抽牌阶段的消耗", () => {
    expect(createChoiceRng(20261019, 5, [])()).toBe(expectedAfter(4));
  });

  it("每个已结算的风险选项额外跳过一次", () => {
    const history = [
      historyEntry(true),
      historyEntry(false),
      historyEntry(undefined),
    ];

    expect(createChoiceRng(20261019, 5, history)()).toBe(expectedAfter(6));
  });

  it("确定型选项不消耗随机流", () => {
    const history = [historyEntry(undefined), historyEntry(undefined)];

    expect(createChoiceRng(20261019, 5, history)()).toBe(expectedAfter(4));
  });
});

describe("resolveChoice 参数校验", () => {
  it("牌组下标越界时抛错", () => {
    expect(() =>
      resolveChoice(
        makeRun({}, { eventIndex: 99 }),
        { id: "x", label: "A", quality: "ok" },
        alwaysSuccess,
      ),
    ).toThrow(RangeError);
  });
});
