"use client";

import { faBolt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useMemo } from "react";

import { GameHud } from "@/components/game/GameHud";
import { GameProvider, useGame } from "@/components/game/GameProvider";
import { createSkeletonEvents } from "@/data/scenarios/skeleton";
import { buildRun } from "@/lib/engine/deck";
import type { RunState, ScenarioContent } from "@/lib/types";

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
      <GameRoom content={content} />
    </GameProvider>
  );
}

function GameRoom({ content }: { content: ScenarioContent }) {
  const { state } = useGame();
  const run = state.run;

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

        <section
          aria-labelledby="briefing-title"
          className="mt-4 rounded-card border-2 border-ink bg-surface p-5 shadow-card sm:p-6"
        >
          <p className="font-numeric text-xs font-bold tracking-[0.22em] text-ink-soft">
            SURVIVAL BRIEF · DAY {run.day}
          </p>
          <h2
            id="briefing-title"
            className="mt-1 font-display text-2xl text-ink"
          >
            今日简报
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-base">
            {scenario.tagline}
          </p>

          <ul
            aria-label="可用技能"
            className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-ink sm:text-sm"
          >
            {scenario.skills.map((skill) => (
              <li
                key={skill}
                className="inline-flex min-h-8 items-center gap-1.5 rounded-chip border-2 border-ink/15 bg-paper px-3"
              >
                <FontAwesomeIcon
                  icon={faBolt}
                  aria-hidden
                  className="h-3 w-3 text-coral"
                />
                {skill}
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs font-semibold text-ink-soft">
            已做出 {run.history.length} 个决定
          </p>
        </section>
      </div>
    </main>
  );
}
