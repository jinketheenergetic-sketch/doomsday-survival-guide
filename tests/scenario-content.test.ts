import { describe, expect, it } from "vitest";

import {
  getScenario,
  scenarioContentById,
  scenarios,
} from "@/data/scenarios";
import { getKnowledgeCard, knowledgeCards } from "@/data/knowledge";
import { getScenarioContent } from "@/lib/scenarios";
import { SCENARIO_IDS, type GameEvent, type ScenarioId } from "@/lib/types";

function referencedKnowledgeIds(events: readonly GameEvent[]): string[] {
  return events.flatMap((event) => [
    ...(event.knowledgeId ? [event.knowledgeId] : []),
    ...event.choices.flatMap((choice) =>
      choice.knowledgeId ? [choice.knowledgeId] : [],
    ),
  ]);
}

describe("场景内容聚合", () => {
  it("7 个 slug 均能取到完整内容", () => {
    for (const id of SCENARIO_IDS) {
      const content = getScenarioContent(id);

      expect(content).toBeDefined();
      expect(content?.scenario.id).toBe(id);
      expect(content?.scenario).toBe(getScenario(id));
      expect(content?.events).toHaveLength(9);
      expect(content?.endings).toHaveLength(3);
      expect(content?.knowledge).toHaveLength(6);
    }
  });

  it("未知 slug 返回 undefined", () => {
    expect(getScenarioContent("unknown")).toBeUndefined();
    expect(getScenarioContent("")).toBeUndefined();
  });

  it("索引表覆盖全部 7 个场景且与元数据一致", () => {
    expect(Object.keys(scenarioContentById)).toHaveLength(7);

    for (const scenario of scenarios) {
      const content = scenarioContentById[scenario.id];
      expect(content.scenario).toBe(scenario);
    }
  });

  it("只返回真实内容，不含占位牌组", () => {
    for (const id of SCENARIO_IDS) {
      const content = getScenarioContent(id);

      expect(
        content?.events.some((event) =>
          event.id.startsWith(`${id}-skeleton`),
        ),
      ).toBe(false);
      expect(content?.endings.every((ending) => ending.scenarioId === id)).toBe(
        true,
      );
      expect(
        content?.knowledge.every((card) => card.scenarioId === id),
      ).toBe(true);
    }
  });

  it("每个场景的事件、结局与知识卡按场景归属", () => {
    for (const id of SCENARIO_IDS) {
      const content = getScenarioContent(id);

      expect(content?.events.every((event) => event.scenarioId === id)).toBe(
        true,
      );
      expect(content?.endings.map((ending) => ending.tone).sort()).toEqual([
        "best",
        "doom",
        "neutral",
      ]);

      const knowledgeIds = new Set(
        content?.knowledge.map((card) => card.id),
      );
      for (const reference of referencedKnowledgeIds(content?.events ?? [])) {
        expect(knowledgeIds.has(reference)).toBe(true);
      }
    }
  });
});

describe("全局知识卡注册表", () => {
  it("汇总 7 个场景共 42 张知识卡且 id 唯一", () => {
    expect(knowledgeCards).toHaveLength(42);

    const ids = knowledgeCards.map((card) => card.id);
    expect(new Set(ids).size).toBe(knowledgeCards.length);
  });

  it("每张卡都属于某个场景且可被按 id 查询", () => {
    const scenarioIds = new Set<ScenarioId>(SCENARIO_IDS);

    for (const card of knowledgeCards) {
      expect(scenarioIds.has(card.scenarioId)).toBe(true);
      expect(getKnowledgeCard(card.id)).toBe(card);
    }
  });

  it("每个场景贡献 6 张知识卡", () => {
    for (const id of SCENARIO_IDS) {
      expect(
        knowledgeCards.filter((card) => card.scenarioId === id),
      ).toHaveLength(6);
    }
  });

  it("未知 id 返回 undefined", () => {
    expect(getKnowledgeCard("unknown")).toBeUndefined();
  });
});
