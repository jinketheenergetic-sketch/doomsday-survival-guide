"use client";

import { useCallback, useMemo } from "react";

import { EventCard } from "@/components/game/EventCard";
import { GameHud } from "@/components/game/GameHud";
import { GameProvider, useGame } from "@/components/game/GameProvider";
import { createSkeletonEvents } from "@/data/scenarios/skeleton";
import { buildRun } from "@/lib/engine/deck";
import type { GameEvent, RunState, ScenarioContent } from "@/lib/types";

/**
 * 游戏页客户端外壳。
 *
 * 本局状态由 `GameProvider` 管理：存储中已有同一场景的对局时恢复，
 * 否则用 `Date.now()` 作为种子新建一局并写回 `activeRun`。
 */
export function GameScreen({ content }: { content: ScenarioContent }) {
  const { scenario, events } = content;

  // 真实事件内容尚未接入时使用占位牌组，保证引擎能生成合法的 7 回合对局。
  const playableEvents = useMemo(
    () => (events.length > 0 ? events : createSkeletonEvents(scenario)),
    [events, scenario],
  );

  const resolveRun = useCallback(
    (stored: RunState | null): RunState | null =>
      stored && stored.scenarioId === scenario.id
        ? stored
        : buildRun(scenario, Date.now(), playableEvents),
    [playableEvents, scenario],
  );

  return (
    <GameProvider resolveRun={resolveRun}>
      <GameRoom content={content} events={playableEvents} />
    </GameProvider>
  );
}

function GameRoom({
  content,
  events,
}: {
  content: ScenarioContent;
  events: readonly GameEvent[];
}) {
  const { state } = useGame();
  const run = state.run;

  // 当前回合的事件 id 由牌组与下标决定。
  const currentEvent = useMemo(() => {
    if (!run) return undefined;
    const eventId = run.deck[run.eventIndex];
    return events.find((event) => event.id === eventId);
  }, [events, run]);

  // 首次挂载先渲染空态，等 Provider 从 activeRun 恢复或新建后再显示 HUD。
  if (!run) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <p role="status" className="text-sm font-semibold text-ink-soft">
          正在重建避难所……
        </p>
      </main>
    );
  }

  const { scenario } = content;

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-4xl px-4 py-4 sm:px-6 sm:py-6">
        <GameHud scenario={scenario} run={run} />

        {currentEvent ? (
          <EventCard
            scenario={scenario}
            event={currentEvent}
            knowledge={content.knowledge}
          />
        ) : (
          <p
            role="status"
            className="mt-4 rounded-card border-2 border-ink/15 bg-surface p-5 text-sm font-semibold text-ink-soft"
          >
            今天的事件还没有准备好。
          </p>
        )}
      </div>
    </main>
  );
}
