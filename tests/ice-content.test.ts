import { describe, expect, it } from "vitest";

import { iceEndings } from "@/data/scenarios/ice/endings";
import { iceEvents } from "@/data/scenarios/ice/events";
import { iceKnowledge } from "@/data/scenarios/ice/knowledge";
import type { GameEvent } from "@/lib/types";

/** content-brief 6.4 要求的 6 张极寒知识卡。 */
const EXPECTED_KNOWLEDGE_IDS = [
  "ice-layers",
  "ice-no-indoor-charcoal",
  "ice-boil-snow",
  "ice-frostbite-warm-water",
  "ice-shared-room",
  "ice-hypothermia-slow-rewarm",
];

function referencedKnowledgeIds(events: readonly GameEvent[]): string[] {
  return events.flatMap((event) => [
    ...(event.knowledgeId ? [event.knowledgeId] : []),
    ...event.choices.flatMap((choice) =>
      choice.knowledgeId ? [choice.knowledgeId] : [],
    ),
  ]);
}

describe("永夜冰河结局", () => {
  it("导出 3 个结局，tone 分别为 best / neutral / doom", () => {
    expect(iceEndings).toHaveLength(3);
    expect(iceEndings.map((ending) => ending.tone).sort()).toEqual([
      "best",
      "doom",
      "neutral",
    ]);
  });

  it("结局 id 唯一、属于 ice 且 id 与基调对应", () => {
    const ids = iceEndings.map((ending) => ending.id);
    expect(new Set(ids).size).toBe(iceEndings.length);

    for (const ending of iceEndings) {
      expect(ending.scenarioId).toBe("ice");
      expect(ending.id).toBe(`ice-${ending.tone}`);
      expect(ending.title.trim().length).toBeGreaterThan(0);
      expect(ending.description.trim().length).toBeGreaterThan(0);
    }
  });

  it("结局标题符合 content-brief 6.4", () => {
    const titleByTone = Object.fromEntries(
      iceEndings.map((ending) => [ending.tone, ending.title]),
    );

    expect(titleByTone).toEqual({
      best: "南方来的信",
      neutral: "冰河公社主任",
      doom: "一尊很有艺术感的冰雕",
    });
  });
});

describe("永夜冰河知识卡", () => {
  it("导出 6 张知识卡，字段含 id / scenarioId / title / content / icon", () => {
    expect(iceKnowledge).toHaveLength(6);

    for (const card of iceKnowledge) {
      expect(card.id.trim().length).toBeGreaterThan(0);
      expect(card.scenarioId).toBe("ice");
      expect(card.title.trim().length).toBeGreaterThan(0);
      expect(card.content.trim().length).toBeGreaterThan(0);
      expect(card.icon.trim().length).toBeGreaterThan(0);
    }
  });

  it("知识卡 id 唯一且与事件引用的 6 个 id 一致", () => {
    const ids = iceKnowledge.map((card) => card.id);
    expect(new Set(ids).size).toBe(iceKnowledge.length);
    expect([...ids].sort()).toEqual([...EXPECTED_KNOWLEDGE_IDS].sort());
  });

  it("所有事件与选项引用的 knowledgeId 均可解析", () => {
    const knownIds = new Set(iceKnowledge.map((card) => card.id));
    const references = referencedKnowledgeIds(iceEvents);

    expect(references.length).toBeGreaterThan(0);
    for (const id of references) {
      expect(knownIds.has(id)).toBe(true);
    }
  });

  it("每张知识卡至少被一个事件或选项引用", () => {
    const references = new Set(referencedKnowledgeIds(iceEvents));

    for (const card of iceKnowledge) {
      expect(references.has(card.id)).toBe(true);
    }
  });
});
