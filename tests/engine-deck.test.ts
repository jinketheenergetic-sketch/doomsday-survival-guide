import { describe, expect, it } from "vitest";

import { scenarioById } from "@/data/scenarios";
import {
  INITIAL_RESOURCES,
  MIDDLE_EVENT_DRAW_COUNT,
  RUN_DAYS,
} from "@/lib/engine/constants";
import {
  buildDeck,
  buildRun,
  drawMiddleEvents,
  splitEventPool,
} from "@/lib/engine/deck";
import { mulberry32 } from "@/lib/engine/rng";
import type { EventPhase, GameEvent, ScenarioId } from "@/lib/types";

const scenario = scenarioById.flood;

function makeEvent(
  id: string,
  phase: EventPhase,
  scenarioId: ScenarioId = "flood",
): GameEvent {
  return {
    id,
    scenarioId,
    phase,
    act: "测试幕",
    title: id,
    body: "",
    choices: [
      { id: `${id}-a`, label: "A", quality: "ok" },
      { id: `${id}-b`, label: "B", quality: "ok" },
      { id: `${id}-c`, label: "C", quality: "ok" },
    ],
  };
}

function makeEvents(): GameEvent[] {
  return [
    makeEvent("flood-opening", "opening"),
    ...Array.from({ length: 7 }, (_, index) =>
      makeEvent(`flood-middle-${index + 1}`, "middle"),
    ),
    makeEvent("flood-finale", "finale"),
  ];
}

describe("buildRun 牌组结构", () => {
  it("固定生成 7 个回合", () => {
    const run = buildRun(scenario, 20261019, makeEvents());

    expect(run.deck).toHaveLength(RUN_DAYS);
    expect(run.deck).toHaveLength(7);
  });

  it("首尾固定为开场与终局事件", () => {
    const run = buildRun(scenario, 20261019, makeEvents());

    expect(run.deck[0]).toBe("flood-opening");
    expect(run.deck[run.deck.length - 1]).toBe("flood-finale");
  });

  it("中段抽取 5 张且不重复", () => {
    const run = buildRun(scenario, 7, makeEvents());
    const middle = run.deck.slice(1, -1);

    expect(middle).toHaveLength(MIDDLE_EVENT_DRAW_COUNT);
    expect(new Set(middle).size).toBe(MIDDLE_EVENT_DRAW_COUNT);
    expect(new Set(run.deck).size).toBe(RUN_DAYS);
    for (const id of middle) {
      expect(id).toMatch(/^flood-middle-/);
    }
  });

  it("中段事件全部来自传入的事件池", () => {
    const events = makeEvents();
    const poolIds = new Set(events.map((event) => event.id));
    const run = buildRun(scenario, 42, events);

    for (const id of run.deck) {
      expect(poolIds.has(id)).toBe(true);
    }
  });
});

describe("种子可复现", () => {
  it("同一种子生成相同牌组与顺序", () => {
    const first = buildDeck(scenario, 123456, makeEvents());
    const second = buildDeck(scenario, 123456, makeEvents());

    expect(second).toEqual(first);
  });

  it("不同种子可以产生不同的牌组顺序", () => {
    const decks = Array.from({ length: 20 }, (_, index) =>
      buildDeck(scenario, index + 1, makeEvents()).join(","),
    );

    expect(new Set(decks).size).toBeGreaterThan(1);
  });

  it("直接复用 mulberry32 的序列得到同一结果", () => {
    const expected = drawMiddleEvents(
      makeEvents().filter((event) => event.phase === "middle"),
      mulberry32(99),
    ).map((event) => event.id);

    expect(buildDeck(scenario, 99, makeEvents()).slice(1, -1)).toEqual(expected);
  });
});

describe("buildRun 初始状态", () => {
  it("记录第 1 天、当前回合、资源与专属资源", () => {
    const run = buildRun(scenario, 1, makeEvents(), "2026-10-19T00:00:00.000Z");

    expect(run.scenarioId).toBe("flood");
    expect(run.seed).toBe(1);
    expect(run.day).toBe(1);
    expect(run.eventIndex).toBe(0);
    expect(run.status).toBe("playing");
    expect(run.history).toEqual([]);
    expect(run.goodCount).toBe(0);
    expect(run.badCount).toBe(0);
    expect(run.startedAt).toBe("2026-10-19T00:00:00.000Z");
    expect(run.resources).toEqual(INITIAL_RESOURCES);
    expect(run.specificResource).toBe(scenario.specificResource.initial);
  });

  it("资源是独立副本，修改本局状态不会污染初始常量", () => {
    const run = buildRun(scenario, 1, makeEvents());

    run.resources.hp = 1;

    expect(INITIAL_RESOURCES.hp).not.toBe(1);
  });

  it("默认开始时间是合法时间字符串", () => {
    const run = buildRun(scenario, 1, makeEvents());

    expect(typeof run.startedAt).toBe("string");
    expect(Number.isNaN(Date.parse(run.startedAt))).toBe(false);
  });
});

describe("事件池校验", () => {
  it("缺少开场或多于一个开场时抛出 RangeError", () => {
    const noOpening = makeEvents().filter((event) => event.phase !== "opening");
    expect(() => splitEventPool("flood", noOpening)).toThrow(RangeError);

    const twoOpenings = [...makeEvents(), makeEvent("extra-opening", "opening")];
    expect(() => splitEventPool("flood", twoOpenings)).toThrow(RangeError);
  });

  it("缺少终局或终局不唯一时抛出 RangeError", () => {
    const noFinale = makeEvents().filter((event) => event.phase !== "finale");
    expect(() => splitEventPool("flood", noFinale)).toThrow(RangeError);

    const twoFinales = [...makeEvents(), makeEvent("extra-finale", "finale")];
    expect(() => splitEventPool("flood", twoFinales)).toThrow(RangeError);
  });

  it("中段不足 5 张时抛出 RangeError", () => {
    const events = [
      makeEvent("flood-opening", "opening"),
      ...Array.from({ length: 4 }, (_, index) =>
        makeEvent(`flood-middle-${index + 1}`, "middle"),
      ),
      makeEvent("flood-finale", "finale"),
    ];

    expect(() => splitEventPool("flood", events)).toThrow(RangeError);
  });

  it("事件 id 重复时抛出 RangeError", () => {
    const events = [
      ...makeEvents(),
      makeEvent("flood-middle-1", "middle"),
    ];

    expect(() => splitEventPool("flood", events)).toThrow(RangeError);
  });

  it("事件属于其他场景时抛出 RangeError", () => {
    const events = [
      ...makeEvents(),
      makeEvent("quake-opening", "opening", "quake"),
    ];

    expect(() => splitEventPool("flood", events)).toThrow(RangeError);
  });

  it("空事件池抛出 RangeError", () => {
    expect(() => splitEventPool("flood", [])).toThrow(RangeError);
  });
});
