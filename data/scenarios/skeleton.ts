/**
 * 占位事件牌组。
 *
 * 引擎要求每局恰好 7 个回合（1 开场 + 5 中段 + 1 终局），而真实事件内容在
 * US-014 起才逐个场景落地。在 `getScenarioContent(slug).events` 为空时，
 * 游戏页用这组占位事件生成合法牌组，保证新开局与 HUD 可以正常工作；
 * 真实事件就绪后该牌组不再参与游戏。
 */

import { MIDDLE_EVENT_DRAW_COUNT } from "@/lib/engine/constants";
import type { Choice, EventPhase, GameEvent, Scenario } from "@/lib/types";

function makeChoices(eventId: string): readonly [Choice, Choice, Choice] {
  return [
    {
      id: `${eventId}-a`,
      label: "先观察环境，确认没有立刻致命的危险",
      quality: "ok",
      resultText: "你放慢脚步，把周围看清楚了再行动。",
    },
    {
      id: `${eventId}-b`,
      label: "主动出击，抢在情况恶化前行动",
      quality: "ok",
      resultText: "你选择把节奏握在自己手里，至少没有干等。",
    },
    {
      id: `${eventId}-c`,
      label: "原地等待，看看情况会不会好转",
      quality: "ok",
      resultText: "你等了很久，灾变并没有因为你的耐心而客气一点。",
    },
  ];
}

function makeEvent(
  scenario: Scenario,
  id: string,
  phase: EventPhase,
  act: string,
  title: string,
  body: string,
): GameEvent {
  return {
    id,
    scenarioId: scenario.id,
    phase,
    act,
    title,
    body,
    choices: makeChoices(id),
  };
}

/** 为场景生成 1 开场 + 5 中段 + 1 终局的占位事件。 */
export function createSkeletonEvents(scenario: Scenario): GameEvent[] {
  const prefix = `${scenario.id}-skeleton`;

  return [
    makeEvent(
      scenario,
      `${prefix}-opening`,
      "opening",
      "开场",
      "第一天的清晨",
      "灾变发生得毫无预兆。你得先弄清楚自己还剩下什么。",
    ),
    ...Array.from({ length: MIDDLE_EVENT_DRAW_COUNT }, (_, index) =>
      makeEvent(
        scenario,
        `${prefix}-middle-${index + 1}`,
        "middle",
        "中段",
        `第 ${index + 2} 天`,
        "补给在减少，坏消息在增加。你必须做出下一个决定。",
      ),
    ),
    makeEvent(
      scenario,
      `${prefix}-finale`,
      "finale",
      "终局",
      "最后一天",
      "远处传来动静。是救援、是威胁，还是你自己的幻觉？",
    ),
  ];
}
