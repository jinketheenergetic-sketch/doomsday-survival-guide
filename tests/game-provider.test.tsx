import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GameProvider, useGame } from "@/components/game/GameProvider";
import { scenarioById } from "@/data/scenarios";
import { buildRun } from "@/lib/engine/deck";
import { createStorageAdapter, type StorageBackend } from "@/lib/storage";
import type { GameEvent, RunState } from "@/lib/types";

const scenario = scenarioById.flood;
const STARTED_AT = "2026-10-19T00:00:00.000Z";

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

/** 内存 StorageBackend，让测试不依赖 jsdom 的 localStorage。 */
function makeBackend(): StorageBackend {
  const items = new Map<string, string>();
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => {
      items.set(key, value);
    },
    removeItem: (key) => {
      items.delete(key);
    },
    key: (index) => [...items.keys()][index] ?? null,
    get length() {
      return items.size;
    },
  };
}

function Probe() {
  const { state, dispatch } = useGame();

  return (
    <div>
      <span data-testid="day">{state.run?.day ?? 0}</span>
      <span data-testid="status">{state.run?.status ?? "none"}</span>
      <button
        type="button"
        onClick={() => dispatch({ type: "create", run: makeRun() })}
      >
        新建
      </button>
      <button type="button" onClick={() => dispatch({ type: "advance" })}>
        推进
      </button>
    </div>
  );
}

function renderProvider(adapter: ReturnType<typeof createStorageAdapter>) {
  return render(
    <GameProvider adapter={adapter}>
      <Probe />
    </GameProvider>,
  );
}

describe("GameProvider", () => {
  it("挂载后从 activeRun 恢复对局", async () => {
    const adapter = createStorageAdapter(makeBackend());
    adapter.saveActiveRun(makeRun({ day: 4, eventIndex: 3 }));

    renderProvider(adapter);

    await waitFor(() => expect(screen.getByTestId("day")).toHaveTextContent("4"));
  });

  it("dispatch 新建后把对局写回 activeRun", async () => {
    const adapter = createStorageAdapter(makeBackend());
    renderProvider(adapter);

    fireEvent.click(screen.getByRole("button", { name: "新建" }));

    await waitFor(() => expect(screen.getByTestId("day")).toHaveTextContent("1"));
    expect(adapter.getActiveRun()?.day).toBe(1);
    expect(adapter.getActiveRun()?.status).toBe("playing");
  });

  it("推进后同步更新 activeRun", async () => {
    const adapter = createStorageAdapter(makeBackend());
    adapter.saveActiveRun(makeRun());
    renderProvider(adapter);

    await waitFor(() => expect(screen.getByTestId("day")).toHaveTextContent("1"));

    fireEvent.click(screen.getByRole("button", { name: "推进" }));

    await waitFor(() => expect(screen.getByTestId("day")).toHaveTextContent("2"));
    expect(adapter.getActiveRun()?.day).toBe(2);
    expect(adapter.getActiveRun()?.eventIndex).toBe(1);
  });

  it("没有存档时保持空状态", async () => {
    const adapter = createStorageAdapter(makeBackend());
    renderProvider(adapter);

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("none"));
    expect(adapter.getActiveRun()).toBeNull();
  });
});
