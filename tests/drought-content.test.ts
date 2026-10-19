import { describe, expect, it } from "vitest";

import { droughtEndings } from "@/data/scenarios/drought/endings";
import { droughtEvents } from "@/data/scenarios/drought/events";
import { droughtKnowledge } from "@/data/scenarios/drought/knowledge";
import type { GameEvent } from "@/lib/types";

/** content-brief 6.6 要求的 6 张干旱生存知识卡。 */
const EXPECTED_KNOWLEDGE_IDS = [
  "drought-avoid-noon",
  "drought-sandstorm-shelter",
  "drought-solar-still",
  "drought-cactus-toxic",
  "drought-heatstroke-cooling",
  "drought-sip-water",
];

function referencedKnowledgeIds(events: readonly GameEvent[]): string[] {
  return events.flatMap((event) => [
    ...(event.knowledgeId ? [event.knowledgeId] : []),
    ...event.choices.flatMap((choice) =>
      choice.knowledgeId ? [choice.knowledgeId] : [],
    ),
  ]);
}

describe("赤沙荒原结局", () => {
  it("导出 3 个结局，tone 分别为 best / neutral / doom", () => {
    expect(droughtEndings).toHaveLength(3);
    expect(droughtEndings.map((ending) => ending.tone).sort()).toEqual([
      "best",
      "doom",
      "neutral",
    ]);
  });

  it("结局 id 唯一、属于 drought 且 id 与基调对应", () => {
    const ids = droughtEndings.map((ending) => ending.id);
    expect(new Set(ids).size).toBe(droughtEndings.length);

    for (const ending of droughtEndings) {
      expect(ending.scenarioId).toBe("drought");
      expect(ending.id).toBe(`drought-${ending.tone}`);
      expect(ending.title.trim().length).toBeGreaterThan(0);
      expect(ending.description.trim().length).toBeGreaterThan(0);
    }
  });

  it("结局标题符合 content-brief 6.6", () => {
    const titleByTone = Object.fromEntries(
      droughtEndings.map((ending) => [ending.tone, ending.title]),
    );

    expect(titleByTone).toEqual({
      best: "地下河的第一桶水",
      neutral: "水车队的记账员",
      doom: "沙丘上的新地标",
    });
  });
});

describe("赤沙荒原知识卡", () => {
  it("导出 6 张知识卡，字段含 id / scenarioId / title / content / icon", () => {
    expect(droughtKnowledge).toHaveLength(6);

    for (const card of droughtKnowledge) {
      expect(card.id.trim().length).toBeGreaterThan(0);
      expect(card.scenarioId).toBe("drought");
      expect(card.title.trim().length).toBeGreaterThan(0);
      expect(card.content.trim().length).toBeGreaterThan(0);
      expect(card.icon.trim().length).toBeGreaterThan(0);
    }
  });

  it("知识卡 id 唯一且与事件引用的 6 个 id 一致", () => {
    const ids = droughtKnowledge.map((card) => card.id);
    expect(new Set(ids).size).toBe(droughtKnowledge.length);
    expect([...ids].sort()).toEqual([...EXPECTED_KNOWLEDGE_IDS].sort());
  });

  it("所有事件与选项引用的 knowledgeId 均可解析", () => {
    const knownIds = new Set(droughtKnowledge.map((card) => card.id));
    const references = referencedKnowledgeIds(droughtEvents);

    expect(references.length).toBeGreaterThan(0);
    for (const id of references) {
      expect(knownIds.has(id)).toBe(true);
    }
  });

  it("每张知识卡至少被一个事件或选项引用", () => {
    const references = new Set(referencedKnowledgeIds(droughtEvents));

    for (const card of droughtKnowledge) {
      expect(references.has(card.id)).toBe(true);
    }
  });
});
