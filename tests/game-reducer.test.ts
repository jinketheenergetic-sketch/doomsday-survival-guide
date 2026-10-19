import { describe, expect, it } from "vitest";

import { scenarioById } from "@/data/scenarios";
import { buildRun } from "@/lib/engine/deck";
import { resolveChoice } from "@/lib/engine/resolve";
import {
  gameReducer,
  initialGameState,
  type GameState,
} from "@/lib/gameReducer";
import type {
  Choice,
  ChoiceResult,
  GameEvent,
  Resources,
  RunState,
} from "@/lib/types";

const scenario = scenarioById.flood;
const STARTED_AT = "2026-10-19T00:00:00.000Z";
const FINISHED_AT = "2026-10-19T12:00:00.000Z";

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

function makeRun(overrides: Partial<RunState> = {}): RunState {
  const run = buildRun(scenario, 20261019, makeEvents(), STARTED_AT);
  return { ...run, ...overrides };
}

function makeState(run: RunState | null): GameState {
  return { run, lastResult: null };
}

/** 始终返回 0 的随机源 → 风险判定必成功。 */
const alwaysSuccess = () => 0;

const goodChoice: Choice = {
  id: "test-good",
  label: "测试选项",
  quality: "good",
  effects: { water: 10, food: 5 },
  specificEffect: 5,
  resultText: "测试结果",
};

function commit(run: RunState, choice: Choice): ReturnType<typeof resolveChoice> {
  return resolveChoice(run, choice, alwaysSuccess);
}

describe("游戏 reducer：新建与恢复", () => {
  it("新建对局写入 state 并清空上一次结算", () => {
    const run = makeRun();
    const previous: ChoiceResult = commit(run, goodChoice).result;

    const state = gameReducer(
      { run: null, lastResult: previous },
      { type: "create", run },
    );

    expect(state.run).toBe(run);
    expect(state.lastResult).toBeNull();
  });

  it("恢复存档中的对局", () => {
    const run = makeRun({ day: 4, eventIndex: 3 });

    const state = gameReducer(initialGameState, { type: "restore", run });

    expect(state.run).toBe(run);
    expect(state.lastResult).toBeNull();
  });

  it("恢复 null 会清空当前对局", () => {
    const run = makeRun();
    const previous = commit(run, goodChoice).result;

    const state = gameReducer(
      { run, lastResult: previous },
      { type: "restore", run: null },
    );

    expect(state).toEqual({ run: null, lastResult: null });
  });
});

describe("游戏 reducer：提交选择", () => {
  it("应用结算结果并记录 lastResult，但不推进 day / eventIndex", () => {
    const run = makeRun();
    const resolution = commit(run, goodChoice);

    const state = gameReducer(makeState(run), {
      type: "commitChoice",
      resolution,
    });

    expect(state.run).toBe(resolution.state);
    expect(state.run?.day).toBe(run.day);
    expect(state.run?.eventIndex).toBe(run.eventIndex);
    expect(state.run?.resources.water).toBe(run.resources.water + 10);
    expect(state.run?.specificResource).toBe(run.specificResource + 5);
    expect(state.run?.goodCount).toBe(run.goodCount + 1);
    expect(state.run?.history).toEqual([resolution.result]);
    expect(state.lastResult).toBe(resolution.result);
    expect(state.run?.status).toBe("playing");
  });

  it("结算导致 HP 归零时把状态置为死亡并记录结束时间", () => {
    const run = makeRun({ resources: { ...makeRun().resources, hp: 5 } });
    const lethalChoice: Choice = {
      id: "test-lethal",
      label: "致命选项",
      quality: "bad",
      effects: { hp: -100 },
      resultText: "你倒下了",
    };
    const resolution = commit(run, lethalChoice);
    expect(resolution.state.status).toBe("dead");

    const state = gameReducer(makeState(run), {
      type: "commitChoice",
      resolution,
      at: FINISHED_AT,
    });

    expect(state.run?.status).toBe("dead");
    expect(state.run?.finishedAt).toBe(FINISHED_AT);
    expect(state.run?.day).toBe(run.day);
    expect(state.run?.eventIndex).toBe(run.eventIndex);
    expect(state.run?.badCount).toBe(run.badCount + 1);
  });

  it("记录本局首次解锁的知识卡，重复 id 不重复记录", () => {
    const run = makeRun();
    const first = gameReducer(makeState(run), {
      type: "commitChoice",
      resolution: commit(run, goodChoice),
      newKnowledgeId: "flood-k1",
    });

    expect(first.run?.newKnowledgeIds).toEqual(["flood-k1"]);

    const second = gameReducer(first, {
      type: "commitChoice",
      resolution: commit(first.run!, goodChoice),
      newKnowledgeId: "flood-k1",
    });

    expect(second.run?.newKnowledgeIds).toEqual(["flood-k1"]);
  });

  it("没有对局时不改变 state", () => {
    const resolution = commit(makeRun(), goodChoice);

    const state = gameReducer(initialGameState, {
      type: "commitChoice",
      resolution,
    });

    expect(state).toBe(initialGameState);
  });

  it("已结束的对局不再接受选择", () => {
    const run = makeRun({ status: "dead" });
    const resolution = commit(makeRun(), goodChoice);
    const previous: GameState = { run, lastResult: null };

    const state = gameReducer(previous, {
      type: "commitChoice",
      resolution,
    });

    expect(state).toBe(previous);
  });
});

describe("游戏 reducer：推进", () => {
  it("推进到下一天并前移事件下标", () => {
    const run = makeRun();

    const state = gameReducer(makeState(run), { type: "advance" });

    expect(state.run?.day).toBe(run.day + 1);
    expect(state.run?.eventIndex).toBe(run.eventIndex + 1);
    expect(state.run?.status).toBe("playing");
  });

  it("推进时清空上一次结算结果", () => {
    const run = makeRun();
    const previous: GameState = {
      run,
      lastResult: commit(run, goodChoice).result,
    };

    const state = gameReducer(previous, { type: "advance" });

    expect(state.lastResult).toBeNull();
    expect(state.run?.day).toBe(run.day + 1);
  });

  it("连续推进 6 次后到达最后一天", () => {
    let state = makeState(makeRun());
    for (let index = 0; index < 6; index += 1) {
      state = gameReducer(state, { type: "advance" });
    }

    expect(state.run?.day).toBe(7);
    expect(state.run?.eventIndex).toBe(6);
    expect(state.run?.status).toBe("playing");
  });

  it("最后一个事件之后推进即完成，day 停在最后一天", () => {
    const run = makeRun({ day: 7, eventIndex: 6, deck: makeRun().deck });

    const state = gameReducer(makeState(run), {
      type: "advance",
      at: FINISHED_AT,
    });

    expect(state.run?.status).toBe("completed");
    expect(state.run?.day).toBe(7);
    expect(state.run?.eventIndex).toBe(6);
    expect(state.run?.finishedAt).toBe(FINISHED_AT);
  });

  it("死亡或完成的对局不再推进", () => {
    const dead = makeState(makeRun({ status: "dead" }));
    const completed = makeState(makeRun({ status: "completed" }));

    expect(gameReducer(dead, { type: "advance" })).toBe(dead);
    expect(gameReducer(completed, { type: "advance" })).toBe(completed);
  });

  it("没有对局时不改变 state", () => {
    expect(gameReducer(initialGameState, { type: "advance" })).toBe(
      initialGameState,
    );
  });
});

describe("游戏 reducer：结束", () => {
  it("进行中的对局标记为完成并记录结束时间", () => {
    const run = makeRun({ day: 3, eventIndex: 2 });

    const state = gameReducer(makeState(run), {
      type: "end",
      at: FINISHED_AT,
    });

    expect(state.run?.status).toBe("completed");
    expect(state.run?.finishedAt).toBe(FINISHED_AT);
    expect(state.run?.day).toBe(3);
  });

  it("死亡对局保持死亡状态，只补记结束时间", () => {
    const run = makeRun({ status: "dead", day: 4, eventIndex: 3 });

    const state = gameReducer(makeState(run), {
      type: "end",
      at: FINISHED_AT,
    });

    expect(state.run?.status).toBe("dead");
    expect(state.run?.finishedAt).toBe(FINISHED_AT);
  });

  it("已完成的对局再次结束时不产生新引用", () => {
    const run = makeRun({
      status: "completed",
      finishedAt: STARTED_AT,
    });
    const previous = makeState(run);

    expect(gameReducer(previous, { type: "end" })).toBe(previous);
  });
});

describe("游戏 reducer：纯函数", () => {
  it("不修改传入的 state 与 run", () => {
    const run = makeRun();
    const previous: GameState = { run, lastResult: null };
    const before = JSON.stringify(previous);

    gameReducer(previous, { type: "advance", at: FINISHED_AT });
    gameReducer(previous, {
      type: "commitChoice",
      resolution: commit(run, goodChoice),
    });
    gameReducer(previous, { type: "end", at: FINISHED_AT });

    expect(JSON.stringify(previous)).toBe(before);
    expect(run.day).toBe(1);
    expect(run.eventIndex).toBe(0);
  });

  it("资源变化只来自传入的结算结果", () => {
    const run = makeRun({
      resources: { ...makeRun().resources, water: 20 } satisfies Resources,
    });
    const resolution = commit(run, goodChoice);

    const state = gameReducer(makeState(run), {
      type: "commitChoice",
      resolution,
    });

    expect(state.run?.resources.water).toBe(30);
    expect(run.resources.water).toBe(20);
  });
});
