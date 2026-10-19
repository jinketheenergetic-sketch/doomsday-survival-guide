import { describe, expect, it } from "vitest";

import { meteorEndings } from "@/data/scenarios/meteor/endings";
import { meteorEvents } from "@/data/scenarios/meteor/events";
import { meteorKnowledge } from "@/data/scenarios/meteor/knowledge";
import type { GameEvent } from "@/lib/types";

/** content-brief 6.3 要求的 6 张陨石知识卡。 */
const EXPECTED_KNOWLEDGE_IDS = [
  "meteor-blast-shelter",
  "meteor-no-look",
  "meteor-wet-mask",
  "meteor-impact-winter",
  "meteor-decontaminate-entry",
  "meteor-generator-outdoors",
];

function referencedKnowledgeIds(events: readonly GameEvent[]): string[] {
  return events.flatMap((event) => [
    ...(event.knowledgeId ? [event.knowledgeId] : []),
    ...event.choices.flatMap((choice) =>
      choice.knowledgeId ? [choice.knowledgeId] : [],
    ),
  ]);
}

describe("天火降临结局", () => {
  it("导出 3 个结局，tone 分别为 best / neutral / doom", () => {
    expect(meteorEndings).toHaveLength(3);
    expect(meteorEndings.map((ending) => ending.tone).sort()).toEqual([
      "best",
      "doom",
      "neutral",
    ]);
  });

  it("结局 id 唯一、属于 meteor 且 id 与基调对应", () => {
    const ids = meteorEndings.map((ending) => ending.id);
    expect(new Set(ids).size).toBe(meteorEndings.length);

    for (const ending of meteorEndings) {
      expect(ending.scenarioId).toBe("meteor");
      expect(ending.id).toBe(`meteor-${ending.tone}`);
      expect(ending.title.trim().length).toBeGreaterThan(0);
      expect(ending.description.trim().length).toBeGreaterThan(0);
    }
  });

  it("结局标题符合 content-brief 6.3", () => {
    const titleByTone = Object.fromEntries(
      meteorEndings.map((ending) => [ending.tone, ending.title]),
    );

    expect(titleByTone).toEqual({
      best: "地下城管理员",
      neutral: "南迁队伍的第 7 人",
      doom: "被火山灰做成雕塑",
    });
  });
});

describe("天火降临知识卡", () => {
  it("导出 6 张知识卡，字段含 id / scenarioId / title / content / icon", () => {
    expect(meteorKnowledge).toHaveLength(6);

    for (const card of meteorKnowledge) {
      expect(card.id.trim().length).toBeGreaterThan(0);
      expect(card.scenarioId).toBe("meteor");
      expect(card.title.trim().length).toBeGreaterThan(0);
      expect(card.content.trim().length).toBeGreaterThan(0);
      expect(card.icon.trim().length).toBeGreaterThan(0);
    }
  });

  it("知识卡 id 唯一且与事件引用的 6 个 id 一致", () => {
    const ids = meteorKnowledge.map((card) => card.id);
    expect(new Set(ids).size).toBe(meteorKnowledge.length);
    expect([...ids].sort()).toEqual([...EXPECTED_KNOWLEDGE_IDS].sort());
  });

  it("所有事件与选项引用的 knowledgeId 均可解析", () => {
    const knownIds = new Set(meteorKnowledge.map((card) => card.id));
    const references = referencedKnowledgeIds(meteorEvents);

    expect(references.length).toBeGreaterThan(0);
    for (const id of references) {
      expect(knownIds.has(id)).toBe(true);
    }
  });

  it("每张知识卡至少被一个事件或选项引用", () => {
    const references = new Set(referencedKnowledgeIds(meteorEvents));

    for (const card of meteorKnowledge) {
      expect(references.has(card.id)).toBe(true);
    }
  });
});
