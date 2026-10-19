import { describe, expect, it } from "vitest";

import { floodEndings } from "@/data/scenarios/flood/endings";
import { floodEvents } from "@/data/scenarios/flood/events";
import { floodKnowledge } from "@/data/scenarios/flood/knowledge";
import type { GameEvent } from "@/lib/types";

/** content-brief 6.1 要求的 6 张洪水知识卡。 */
const EXPECTED_KNOWLEDGE_IDS = [
  "flood-current",
  "flood-boil-water",
  "flood-vertical-evacuation",
  "flood-hypothermia",
  "flood-roof-signal",
  "flood-wound-tetanus",
];

function referencedKnowledgeIds(events: readonly GameEvent[]): string[] {
  return events.flatMap((event) => [
    ...(event.knowledgeId ? [event.knowledgeId] : []),
    ...event.choices.flatMap((choice) =>
      choice.knowledgeId ? [choice.knowledgeId] : [],
    ),
  ]);
}

describe("融冰纪元结局", () => {
  it("导出 3 个结局，tone 分别为 best / neutral / doom", () => {
    expect(floodEndings).toHaveLength(3);
    expect(floodEndings.map((ending) => ending.tone).sort()).toEqual([
      "best",
      "doom",
      "neutral",
    ]);
  });

  it("结局 id 唯一、属于 flood 且 id 与基调对应", () => {
    const ids = floodEndings.map((ending) => ending.id);
    expect(new Set(ids).size).toBe(floodEndings.length);

    for (const ending of floodEndings) {
      expect(ending.scenarioId).toBe("flood");
      expect(ending.id).toBe(`flood-${ending.tone}`);
      expect(ending.title.trim().length).toBeGreaterThan(0);
      expect(ending.description.trim().length).toBeGreaterThan(0);
    }
  });

  it("结局标题符合 content-brief 6.1", () => {
    const titleByTone = Object.fromEntries(
      floodEndings.map((ending) => [ending.tone, ending.title]),
    );

    expect(titleByTone).toEqual({
      best: "天台上的哲学家",
      neutral: "水上社区区长",
      doom: "城市官方水族馆展品",
    });
  });
});

describe("融冰纪元知识卡", () => {
  it("导出 6 张知识卡，字段含 id / scenarioId / title / content / icon", () => {
    expect(floodKnowledge).toHaveLength(6);

    for (const card of floodKnowledge) {
      expect(card.id.trim().length).toBeGreaterThan(0);
      expect(card.scenarioId).toBe("flood");
      expect(card.title.trim().length).toBeGreaterThan(0);
      expect(card.content.trim().length).toBeGreaterThan(0);
      expect(card.icon.trim().length).toBeGreaterThan(0);
    }
  });

  it("知识卡 id 唯一且与事件引用的 6 个 id 一致", () => {
    const ids = floodKnowledge.map((card) => card.id);
    expect(new Set(ids).size).toBe(floodKnowledge.length);
    expect([...ids].sort()).toEqual([...EXPECTED_KNOWLEDGE_IDS].sort());
  });

  it("所有事件与选项引用的 knowledgeId 均可解析", () => {
    const knownIds = new Set(floodKnowledge.map((card) => card.id));
    const references = referencedKnowledgeIds(floodEvents);

    expect(references.length).toBeGreaterThan(0);
    for (const id of references) {
      expect(knownIds.has(id)).toBe(true);
    }
  });

  it("每张知识卡至少被一个事件或选项引用", () => {
    const references = new Set(referencedKnowledgeIds(floodEvents));

    for (const card of floodKnowledge) {
      expect(references.has(card.id)).toBe(true);
    }
  });
});
