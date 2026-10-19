import { describe, expect, it } from "vitest";

import { quakeEndings } from "@/data/scenarios/quake/endings";
import { quakeEvents } from "@/data/scenarios/quake/events";
import { quakeKnowledge } from "@/data/scenarios/quake/knowledge";
import type { GameEvent } from "@/lib/types";

/** content-brief 6.2 要求的 6 张地震知识卡。 */
const EXPECTED_KNOWLEDGE_IDS = [
  "quake-drop-cover-hold-on",
  "quake-no-elevator",
  "quake-gas-leak",
  "quake-tsunami-vertical",
  "quake-rubble-tapping",
  "quake-pressure-bleeding",
];

function referencedKnowledgeIds(events: readonly GameEvent[]): string[] {
  return events.flatMap((event) => [
    ...(event.knowledgeId ? [event.knowledgeId] : []),
    ...event.choices.flatMap((choice) =>
      choice.knowledgeId ? [choice.knowledgeId] : [],
    ),
  ]);
}

describe("地裂之日结局", () => {
  it("导出 3 个结局，tone 分别为 best / neutral / doom", () => {
    expect(quakeEndings).toHaveLength(3);
    expect(quakeEndings.map((ending) => ending.tone).sort()).toEqual([
      "best",
      "doom",
      "neutral",
    ]);
  });

  it("结局 id 唯一、属于 quake 且 id 与基调对应", () => {
    const ids = quakeEndings.map((ending) => ending.id);
    expect(new Set(ids).size).toBe(quakeEndings.length);

    for (const ending of quakeEndings) {
      expect(ending.scenarioId).toBe("quake");
      expect(ending.id).toBe(`quake-${ending.tone}`);
      expect(ending.title.trim().length).toBeGreaterThan(0);
      expect(ending.description.trim().length).toBeGreaterThan(0);
    }
  });

  it("结局标题符合 content-brief 6.2", () => {
    const titleByTone = Object.fromEntries(
      quakeEndings.map((ending) => [ending.tone, ending.title]),
    );

    expect(titleByTone).toEqual({
      best: "山顶信号灯",
      neutral: "余震中的志愿者",
      doom: "被自己家沙发纪念的人",
    });
  });
});

describe("地裂之日知识卡", () => {
  it("导出 6 张知识卡，字段含 id / scenarioId / title / content / icon", () => {
    expect(quakeKnowledge).toHaveLength(6);

    for (const card of quakeKnowledge) {
      expect(card.id.trim().length).toBeGreaterThan(0);
      expect(card.scenarioId).toBe("quake");
      expect(card.title.trim().length).toBeGreaterThan(0);
      expect(card.content.trim().length).toBeGreaterThan(0);
      expect(card.icon.trim().length).toBeGreaterThan(0);
    }
  });

  it("知识卡 id 唯一且与事件引用的 6 个 id 一致", () => {
    const ids = quakeKnowledge.map((card) => card.id);
    expect(new Set(ids).size).toBe(quakeKnowledge.length);
    expect([...ids].sort()).toEqual([...EXPECTED_KNOWLEDGE_IDS].sort());
  });

  it("所有事件与选项引用的 knowledgeId 均可解析", () => {
    const knownIds = new Set(quakeKnowledge.map((card) => card.id));
    const references = referencedKnowledgeIds(quakeEvents);

    expect(references.length).toBeGreaterThan(0);
    for (const id of references) {
      expect(knownIds.has(id)).toBe(true);
    }
  });

  it("每张知识卡至少被一个事件或选项引用", () => {
    const references = new Set(referencedKnowledgeIds(quakeEvents));

    for (const card of quakeKnowledge) {
      expect(references.has(card.id)).toBe(true);
    }
  });
});
