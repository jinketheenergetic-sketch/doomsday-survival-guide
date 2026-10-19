"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ChoiceResultSheet } from "@/components/game/ChoiceResultSheet";
import { EventCard } from "@/components/game/EventCard";
import { GameHud } from "@/components/game/GameHud";
import { GameProvider, useGame } from "@/components/game/GameProvider";
import { createSkeletonEvents } from "@/data/scenarios/skeleton";
import { RUN_DAYS } from "@/lib/engine/constants";
import { buildRun } from "@/lib/engine/deck";
import { createChoiceRng, resolveChoice } from "@/lib/engine/resolve";
import { evaluateRun } from "@/lib/engine/score";
import { unlockKnowledge } from "@/lib/progress";
import { storageAdapter } from "@/lib/storage";
import type {
  Choice,
  GameEvent,
  LastResult,
  RunState,
  ScenarioContent,
} from "@/lib/types";

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
  const router = useRouter();
  const { state, dispatch } = useGame();
  const run = state.run;
  const [continuing, setContinuing] = useState(false);

  // 当前回合的事件 id 由牌组与下标决定。
  const currentEvent = useMemo(() => {
    if (!run) return undefined;
    const eventId = run.deck[run.eventIndex];
    return events.find((event) => event.id === eventId);
  }, [events, run]);

  /**
   * 抽牌阶段消耗的随机步数。风险判定与抽牌共享同一 seed 随机流，
   * 刷新后按历史重建，保证同一选项的判定与刷新前一致。
   */
  const middleEventCount = useMemo(
    () => events.filter((event) => event.phase === "middle").length,
    [events],
  );

  /**
   * 待确认的结算结果。
   *
   * `state.lastResult` 只在本次会话内有效；刷新后用「history 比 eventIndex 多一条」
   * 判断当前事件已结算但尚未推进，从历史中恢复同一条结果，避免重复结算。
   */
  const pending = useMemo(() => {
    if (state.lastResult) return state.lastResult;
    if (!run || run.history.length <= run.eventIndex) return null;
    return run.history[run.eventIndex] ?? null;
  }, [run, state.lastResult]);

  const handleSelect = useCallback(
    (choice: Choice) => {
      if (!run || run.status !== "playing" || pending || continuing) {
        return;
      }

      const resolution = resolveChoice(
        run,
        choice,
        createChoiceRng(run.seed, middleEventCount, run.history),
      );

      // 首次遇到的知识卡立即写入本地进度，并记入本局新解锁列表。
      let newKnowledgeId: string | undefined;
      const knowledgeId = resolution.result.knowledgeId;
      if (knowledgeId) {
        const progress = storageAdapter.getProgress();
        if (!progress.unlockedKnowledgeIds.includes(knowledgeId)) {
          storageAdapter.saveProgress(unlockKnowledge(progress, [knowledgeId]));
          newKnowledgeId = knowledgeId;
        }
      }

      dispatch({
        type: "commitChoice",
        resolution,
        newKnowledgeId,
        at: new Date().toISOString(),
      });
    },
    [continuing, dispatch, middleEventCount, pending, run],
  );

  const handleContinue = useCallback(() => {
    if (!run) return;

    const final = run.status === "dead" || run.day >= RUN_DAYS;
    if (!final) {
      dispatch({ type: "advance" });
      return;
    }

    // 第 7 天或死亡：生成结算结果并进入结算页。
    const evaluation = evaluateRun(run);
    const ending = content.endings.find(
      (item) =>
        item.scenarioId === run.scenarioId && item.tone === evaluation.ending,
    );
    const finishedAt = run.finishedAt ?? new Date().toISOString();

    const lastResult: LastResult = {
      scenarioId: run.scenarioId,
      seed: run.seed,
      // 内容尚未接入时用稳定回退 id，真实结局落地后自动切换。
      endingId: ending?.id ?? `${run.scenarioId}-${evaluation.ending}`,
      score: evaluation.score,
      stars: evaluation.stars,
      daysSurvived: evaluation.days,
      goodCount: run.goodCount,
      badCount: run.badCount,
      resources: run.resources,
      specificResource: run.specificResource,
      history: run.history,
      newKnowledgeIds: run.newKnowledgeIds ?? [],
      finishedAt,
    };

    setContinuing(true);
    storageAdapter.saveLastResult(lastResult);
    dispatch({ type: "end", at: finishedAt });
    router.push(`/play/${run.scenarioId}/result`);
  }, [content.endings, dispatch, router, run]);

  // 键盘 1 / 2 / 3 与点击选项等价；结果弹层打开或对局结束时不再响应。
  useEffect(() => {
    if (!run || run.status !== "playing" || pending || !currentEvent) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const index = ["1", "2", "3"].indexOf(event.key);
      if (index === -1) return;

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const choice = currentEvent?.choices[index];
      if (!choice) return;

      event.preventDefault();
      handleSelect(choice);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentEvent, handleSelect, pending, run]);

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
  const final = run.status === "dead" || run.day >= RUN_DAYS;

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-4xl px-4 py-4 sm:px-6 sm:py-6">
        <GameHud scenario={scenario} run={run} />

        {pending ? (
          currentEvent && (
            <EventCard
              scenario={scenario}
              event={currentEvent}
              knowledge={content.knowledge}
              disabled
            />
          )
        ) : run.status !== "playing" ? (
          <p
            role="status"
            className="mt-4 rounded-card border-2 border-ink/15 bg-surface p-5 text-sm font-semibold text-ink-soft"
          >
            这一局已经结束。{" "}
            <Link
              href={`/play/${scenario.id}/result`}
              className="text-teal underline underline-offset-4"
            >
              查看结算
            </Link>
          </p>
        ) : currentEvent ? (
          <EventCard
            scenario={scenario}
            event={currentEvent}
            knowledge={content.knowledge}
            onSelect={handleSelect}
            disabled={continuing}
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

      {pending && (
        <ChoiceResultSheet
          scenario={scenario}
          result={pending}
          knowledge={content.knowledge}
          final={final}
          onContinue={handleContinue}
        />
      )}
    </main>
  );
}
