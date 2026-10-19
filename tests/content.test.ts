import { describe, expect, it } from "vitest";

import { knowledgeCards } from "@/data/knowledge";
import { MIDDLE_EVENT_DRAW_COUNT } from "@/lib/engine/constants";
import { getScenarioContent } from "@/lib/scenarios";
import {
  SCENARIO_IDS,
  type Choice,
  type GameEvent,
  type ScenarioContent,
  type ScenarioId,
} from "@/lib/types";

/** 每个场景的中段事件数：从 7 张中段池中抽 5 张。 */
const MIDDLE_EVENT_COUNT = 7;

/** 取场景内容；缺失时直接失败，避免后续断言在 undefined 上静默通过。 */
function contentOf(id: ScenarioId): ScenarioContent {
  const content = getScenarioContent(id);
  if (!content) {
    throw new Error(`场景 ${id} 缺少内容`);
  }
  return content;
}

function allChoices(events: readonly GameEvent[]): Choice[] {
  return events.flatMap((event) => [...event.choices]);
}

function riskChoiceCount(events: readonly GameEvent[]): number {
  return allChoices(events).filter((choice) => choice.risk !== undefined).length;
}

/** 枚举 `items` 中所有长度为 `size` 的组合，用于覆盖任意抽牌结果。 */
function combinations<T>(items: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  const current: T[] = [];

  function walk(start: number): void {
    if (current.length === size) {
      result.push([...current]);
      return;
    }

    const remaining = size - current.length;
    for (let index = start; index <= items.length - remaining; index += 1) {
      current.push(items[index]);
      walk(index + 1);
      current.pop();
    }
  }

  walk(0);
  return result;
}

describe("全局内容完整性", () => {
  it("7 个场景各有 9 个事件：1 开场 + 7 中段 + 1 终局", () => {
    expect(SCENARIO_IDS).toHaveLength(7);

    for (const id of SCENARIO_IDS) {
      const { events } = contentOf(id);

      expect(events).toHaveLength(9);
      expect(events.filter((event) => event.phase === "opening")).toHaveLength(
        1,
      );
      expect(events.filter((event) => event.phase === "middle")).toHaveLength(
        MIDDLE_EVENT_COUNT,
      );
      expect(events.filter((event) => event.phase === "finale")).toHaveLength(1);
    }
  });

  it("每个事件恰好 3 个选项", () => {
    for (const id of SCENARIO_IDS) {
      for (const event of contentOf(id).events) {
        expect(event.choices, `事件 ${event.id} 的选项数`).toHaveLength(3);
      }
    }
  });

  it("每个场景有 3 个结局与 6 张知识卡", () => {
    for (const id of SCENARIO_IDS) {
      const content = contentOf(id);

      expect(content.endings, `场景 ${id} 的结局数`).toHaveLength(3);
      expect(content.knowledge, `场景 ${id} 的知识卡数`).toHaveLength(6);
    }
  });

  it("知识卡 id 全局唯一", () => {
    const ids = knowledgeCards.map((card) => card.id);

    expect(ids).toHaveLength(42);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("所有事件引用的 knowledgeId 均可解析", () => {
    const knownIds = new Set(knowledgeCards.map((card) => card.id));

    for (const id of SCENARIO_IDS) {
      for (const event of contentOf(id).events) {
        const references = [
          ...(event.knowledgeId ? [event.knowledgeId] : []),
          ...event.choices.flatMap((choice) =>
            choice.knowledgeId ? [choice.knowledgeId] : [],
          ),
        ];

        for (const reference of references) {
          expect(
            knownIds.has(reference),
            `事件 ${event.id} 引用了未知知识卡 ${reference}`,
          ).toBe(true);
        }
      }
    }
  });

  it("每个场景的 best / neutral / doom 结局齐全且各 1 个", () => {
    for (const id of SCENARIO_IDS) {
      const endings = contentOf(id).endings;

      for (const tone of ["best", "neutral", "doom"] as const) {
        expect(
          endings.filter((ending) => ending.tone === tone),
          `场景 ${id} 的 ${tone} 结局数`,
        ).toHaveLength(1);
      }
    }
  });

  it("所有风险选项概率在 1–99", () => {
    for (const id of SCENARIO_IDS) {
      for (const choice of allChoices(contentOf(id).events)) {
        if (!choice.risk) {
          continue;
        }

        expect(Number.isInteger(choice.risk.probability)).toBe(true);
        expect(choice.risk.probability).toBeGreaterThanOrEqual(1);
        expect(choice.risk.probability).toBeLessThanOrEqual(99);
      }
    }
  });

  it("固定首尾加任意 5 张中段组成的牌组都至少包含 2 个风险选项", () => {
    for (const id of SCENARIO_IDS) {
      const { events } = contentOf(id);
      const opening = events.find((event) => event.phase === "opening");
      const finale = events.find((event) => event.phase === "finale");
      const middle = events.filter((event) => event.phase === "middle");

      if (!opening || !finale) {
        throw new Error(`场景 ${id} 缺少固定的开场或终局事件`);
      }

      const decks = combinations(middle, MIDDLE_EVENT_DRAW_COUNT).map(
        (drawn) => [opening, ...drawn, finale],
      );

      expect(decks, `场景 ${id} 的中段组合数`).toHaveLength(21);
      for (const deck of decks) {
        expect(
          riskChoiceCount(deck),
          `场景 ${id} 的牌组 ${deck.map((event) => event.id).join(",")}`,
        ).toBeGreaterThanOrEqual(2);
      }
    }
  });
});
