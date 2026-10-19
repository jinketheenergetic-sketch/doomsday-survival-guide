import { describe, expect, it } from "vitest";

import { heatdeathEvents } from "@/data/scenarios/heatdeath/events";
import { scenarioById } from "@/data/scenarios";
import { splitEventPool } from "@/lib/engine/deck";
import { MIDDLE_EVENT_DRAW_COUNT } from "@/lib/engine/constants";
import type { Choice, GameEvent } from "@/lib/types";

/** 热寂终点后续将落地的 6 张知识卡 id；事件里不得出现拼写漂移。 */
const HEATDEATH_KNOWLEDGE_IDS = new Set([
  "heatdeath-hypothesis",
  "heatdeath-energy-conservation",
  "heatdeath-geothermal",
  "heatdeath-cold-protection",
  "heatdeath-resilience",
  "heatdeath-humor",
]);

function allChoices(events: readonly GameEvent[]): Choice[] {
  return events.flatMap((event) => [...event.choices]);
}

describe("热寂终点事件牌组", () => {
  it("导出 9 个事件：1 开场 + 7 中段 + 1 终局", () => {
    expect(heatdeathEvents).toHaveLength(9);

    const phases = heatdeathEvents.map((event) => event.phase);
    expect(phases.filter((phase) => phase === "opening")).toHaveLength(1);
    expect(phases.filter((phase) => phase === "middle")).toHaveLength(7);
    expect(phases.filter((phase) => phase === "finale")).toHaveLength(1);
  });

  it("事件 id 唯一、属于 heatdeath 且文案字段完整", () => {
    const ids = heatdeathEvents.map((event) => event.id);
    expect(new Set(ids).size).toBe(heatdeathEvents.length);

    const choiceIds = allChoices(heatdeathEvents).map((choice) => choice.id);
    expect(new Set(choiceIds).size).toBe(choiceIds.length);

    for (const event of heatdeathEvents) {
      expect(event.scenarioId).toBe("heatdeath");
      expect(event.act.trim().length).toBeGreaterThan(0);
      expect(event.title.trim().length).toBeGreaterThan(0);
      expect(event.body.trim().length).toBeGreaterThan(0);
    }
  });

  it("每个事件恰好 3 个选项，字段含 label / resultText / quality / knowledgeId", () => {
    for (const event of heatdeathEvents) {
      expect(event.choices).toHaveLength(3);

      for (const choice of event.choices) {
        expect(choice.label.trim().length).toBeGreaterThan(0);
        expect(choice.resultText?.trim().length ?? 0).toBeGreaterThan(0);
        expect(["good", "ok", "bad"]).toContain(choice.quality);
        expect(choice.knowledgeId).toBeTruthy();
        expect(HEATDEATH_KNOWLEDGE_IDS.has(choice.knowledgeId ?? "")).toBe(true);
      }
    }
  });

  it("每个事件同时提供 good / ok / bad 三种取向", () => {
    for (const event of heatdeathEvents) {
      const qualities = event.choices.map((choice) => choice.quality).sort();
      expect(qualities).toEqual(["bad", "good", "ok"]);
    }
  });

  it("至少 2 个风险选项，且风险分支字段完整、概率在 1–99", () => {
    const riskChoices = allChoices(heatdeathEvents).filter(
      (choice) => choice.risk !== undefined,
    );
    expect(riskChoices.length).toBeGreaterThanOrEqual(2);

    for (const choice of riskChoices) {
      const risk = choice.risk;
      if (!risk) throw new Error(`选项 ${choice.id} 缺少风险分支`);

      expect(Number.isInteger(risk.probability)).toBe(true);
      expect(risk.probability).toBeGreaterThanOrEqual(1);
      expect(risk.probability).toBeLessThanOrEqual(99);
      expect(risk.successText.trim().length).toBeGreaterThan(0);
      expect(risk.failureText.trim().length).toBeGreaterThan(0);

      const successKeys = Object.keys(risk.successEffects);
      const failureKeys = Object.keys(risk.failureEffects);
      expect(successKeys.length + failureKeys.length).toBeGreaterThan(0);
    }
  });

  it("任意 5 张中段事件都至少包含 2 个风险选项", () => {
    const middle = heatdeathEvents.filter((event) => event.phase === "middle");
    expect(middle).toHaveLength(7);

    for (let first = 0; first < middle.length; first += 1) {
      for (let second = first + 1; second < middle.length; second += 1) {
        const drawn = middle.filter(
          (_, index) => index !== first && index !== second,
        );
        expect(drawn).toHaveLength(MIDDLE_EVENT_DRAW_COUNT);

        const riskCount = drawn.reduce(
          (count, event) =>
            count + event.choices.filter((choice) => choice.risk).length,
          0,
        );
        expect(riskCount).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("事件卡与选项引用的 knowledgeId 都属于热寂知识卡", () => {
    for (const event of heatdeathEvents) {
      if (event.knowledgeId !== undefined) {
        expect(HEATDEATH_KNOWLEDGE_IDS.has(event.knowledgeId)).toBe(true);
      }
    }
  });

  it("能被引擎按 1 开场 + 5 中段 + 1 终局拆分", () => {
    const pool = splitEventPool("heatdeath", heatdeathEvents);
    expect(pool.opening.phase).toBe("opening");
    expect(pool.finale.phase).toBe("finale");
    expect(pool.middle).toHaveLength(7);
    expect(scenarioById.heatdeath.id).toBe("heatdeath");
  });
});
