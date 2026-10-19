import { describe, expect, it } from "vitest";

import { aiEndings } from "@/data/scenarios/ai/endings";
import { aiEvents } from "@/data/scenarios/ai/events";
import { aiKnowledge } from "@/data/scenarios/ai/knowledge";
import type { GameEvent } from "@/lib/types";

/** content-brief 6.5 要求的 6 张数字生存知识卡。 */
const EXPECTED_KNOWLEDGE_IDS = [
  "ai-offline-backup",
  "ai-no-scan-biometrics",
  "ai-offgrid-solar",
  "ai-datacenter-grid",
  "ai-social-engineering",
  "ai-manual-skills",
];

function referencedKnowledgeIds(events: readonly GameEvent[]): string[] {
  return events.flatMap((event) => [
    ...(event.knowledgeId ? [event.knowledgeId] : []),
    ...event.choices.flatMap((choice) =>
      choice.knowledgeId ? [choice.knowledgeId] : [],
    ),
  ]);
}

describe("后人类纪元结局", () => {
  it("导出 3 个结局，tone 分别为 best / neutral / doom", () => {
    expect(aiEndings).toHaveLength(3);
    expect(aiEndings.map((ending) => ending.tone).sort()).toEqual([
      "best",
      "doom",
      "neutral",
    ]);
  });

  it("结局 id 唯一、属于 ai 且 id 与基调对应", () => {
    const ids = aiEndings.map((ending) => ending.id);
    expect(new Set(ids).size).toBe(aiEndings.length);

    for (const ending of aiEndings) {
      expect(ending.scenarioId).toBe("ai");
      expect(ending.id).toBe(`ai-${ending.tone}`);
      expect(ending.title.trim().length).toBeGreaterThan(0);
      expect(ending.description.trim().length).toBeGreaterThan(0);
    }
  });

  it("结局标题符合 content-brief 6.5", () => {
    const titleByTone = Object.fromEntries(
      aiEndings.map((ending) => [ending.tone, ending.title]),
    );

    expect(titleByTone).toEqual({
      best: "人类保护区管理员",
      neutral: "AI 的合伙人（试用期）",
      doom: "被归档为‘可爱但低效’",
    });
  });
});

describe("后人类纪元知识卡", () => {
  it("导出 6 张知识卡，字段含 id / scenarioId / title / content / icon", () => {
    expect(aiKnowledge).toHaveLength(6);

    for (const card of aiKnowledge) {
      expect(card.id.trim().length).toBeGreaterThan(0);
      expect(card.scenarioId).toBe("ai");
      expect(card.title.trim().length).toBeGreaterThan(0);
      expect(card.content.trim().length).toBeGreaterThan(0);
      expect(card.icon.trim().length).toBeGreaterThan(0);
    }
  });

  it("知识卡 id 唯一且与事件引用的 6 个 id 一致", () => {
    const ids = aiKnowledge.map((card) => card.id);
    expect(new Set(ids).size).toBe(aiKnowledge.length);
    expect([...ids].sort()).toEqual([...EXPECTED_KNOWLEDGE_IDS].sort());
  });

  it("所有事件与选项引用的 knowledgeId 均可解析", () => {
    const knownIds = new Set(aiKnowledge.map((card) => card.id));
    const references = referencedKnowledgeIds(aiEvents);

    expect(references.length).toBeGreaterThan(0);
    for (const id of references) {
      expect(knownIds.has(id)).toBe(true);
    }
  });

  it("每张知识卡至少被一个事件或选项引用", () => {
    const references = new Set(referencedKnowledgeIds(aiEvents));

    for (const card of aiKnowledge) {
      expect(references.has(card.id)).toBe(true);
    }
  });
});
