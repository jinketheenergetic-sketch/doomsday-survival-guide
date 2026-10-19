import { describe, expect, it } from "vitest";

import { heatdeathEndings } from "@/data/scenarios/heatdeath/endings";
import { heatdeathEvents } from "@/data/scenarios/heatdeath/events";
import { heatdeathKnowledge } from "@/data/scenarios/heatdeath/knowledge";
import type { GameEvent } from "@/lib/types";

/** content-brief 6.7 要求的 6 张热寂生存知识卡。 */
const EXPECTED_KNOWLEDGE_IDS = [
  "heatdeath-hypothesis",
  "heatdeath-energy-conservation",
  "heatdeath-geothermal",
  "heatdeath-cold-protection",
  "heatdeath-resilience",
  "heatdeath-humor",
];

function referencedKnowledgeIds(events: readonly GameEvent[]): string[] {
  return events.flatMap((event) => [
    ...(event.knowledgeId ? [event.knowledgeId] : []),
    ...event.choices.flatMap((choice) =>
      choice.knowledgeId ? [choice.knowledgeId] : [],
    ),
  ]);
}

describe("热寂终点结局", () => {
  it("导出 3 个结局，tone 分别为 best / neutral / doom", () => {
    expect(heatdeathEndings).toHaveLength(3);
    expect(heatdeathEndings.map((ending) => ending.tone).sort()).toEqual([
      "best",
      "doom",
      "neutral",
    ]);
  });

  it("结局 id 唯一、属于 heatdeath 且 id 与基调对应", () => {
    const ids = heatdeathEndings.map((ending) => ending.id);
    expect(new Set(ids).size).toBe(heatdeathEndings.length);

    for (const ending of heatdeathEndings) {
      expect(ending.scenarioId).toBe("heatdeath");
      expect(ending.id).toBe(`heatdeath-${ending.tone}`);
      expect(ending.title.trim().length).toBeGreaterThan(0);
      expect(ending.description.trim().length).toBeGreaterThan(0);
    }
  });

  it("结局标题符合 content-brief 6.7", () => {
    const titleByTone = Object.fromEntries(
      heatdeathEndings.map((ending) => [ending.tone, ending.title]),
    );

    expect(titleByTone).toEqual({
      best: "热泉边的最后一场火锅",
      neutral: "宇宙最后一位哲学家",
      doom: "绝对零度的行为艺术",
    });
  });
});

describe("热寂终点知识卡", () => {
  it("导出 6 张知识卡，字段含 id / scenarioId / title / content / icon", () => {
    expect(heatdeathKnowledge).toHaveLength(6);

    for (const card of heatdeathKnowledge) {
      expect(card.id.trim().length).toBeGreaterThan(0);
      expect(card.scenarioId).toBe("heatdeath");
      expect(card.title.trim().length).toBeGreaterThan(0);
      expect(card.content.trim().length).toBeGreaterThan(0);
      expect(card.icon.trim().length).toBeGreaterThan(0);
    }
  });

  it("知识卡 id 唯一且与事件引用的 6 个 id 一致", () => {
    const ids = heatdeathKnowledge.map((card) => card.id);
    expect(new Set(ids).size).toBe(heatdeathKnowledge.length);
    expect([...ids].sort()).toEqual([...EXPECTED_KNOWLEDGE_IDS].sort());
  });

  it("所有事件与选项引用的 knowledgeId 均可解析", () => {
    const knownIds = new Set(heatdeathKnowledge.map((card) => card.id));
    const references = referencedKnowledgeIds(heatdeathEvents);

    expect(references.length).toBeGreaterThan(0);
    for (const id of references) {
      expect(knownIds.has(id)).toBe(true);
    }
  });

  it("每张知识卡至少被一个事件或选项引用", () => {
    const references = new Set(referencedKnowledgeIds(heatdeathEvents));

    for (const card of heatdeathKnowledge) {
      expect(references.has(card.id)).toBe(true);
    }
  });
});
