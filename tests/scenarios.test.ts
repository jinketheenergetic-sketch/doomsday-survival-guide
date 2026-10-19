import { describe, expect, it } from "vitest";

import { getScenario, scenarioById, scenarios } from "@/data/scenarios";
import { SCENARIO_IDS } from "@/lib/types";

describe("场景元数据", () => {
  it("导出 7 个场景且 id 唯一", () => {
    expect(scenarios).toHaveLength(7);

    const ids = scenarios.map((scenario) => scenario.id);
    expect(new Set(ids).size).toBe(7);
    expect([...ids].sort()).toEqual([...SCENARIO_IDS].sort());
  });

  it("每个场景的必填字段完整", () => {
    for (const scenario of scenarios) {
      expect(scenario.id).toBeTruthy();
      expect(scenario.title.trim().length).toBeGreaterThan(0);
      expect(scenario.tagline.trim().length).toBeGreaterThan(0);
      expect(scenario.icon.trim().length).toBeGreaterThan(0);
      expect(scenario.cover).toMatch(/^https:\/\/images\.unsplash\.com\//);
      expect(scenario.accent).toMatch(/^#[0-9a-f]{6}$/i);
      expect(scenario.threatLevel).toBeGreaterThanOrEqual(1);
      expect(scenario.threatLevel).toBeLessThanOrEqual(5);
      expect(scenario.skills).toHaveLength(3);
      expect(scenario.skills.every((skill) => skill.trim().length > 0)).toBe(
        true,
      );
    }
  });

  it("每个场景都有合法的专属资源", () => {
    for (const scenario of scenarios) {
      const resource = scenario.specificResource;
      expect(resource.key.trim().length).toBeGreaterThan(0);
      expect(resource.label.trim().length).toBeGreaterThan(0);
      expect(resource.description.trim().length).toBeGreaterThan(0);
      expect(resource.initial).toBeGreaterThanOrEqual(0);
      expect(resource.initial).toBeLessThanOrEqual(100);
    }

    const keys = scenarios.map(
      (scenario) => scenario.specificResource.key,
    );
    expect(new Set(keys).size).toBe(7);
  });

  it("可以按 slug 查询场景", () => {
    for (const id of SCENARIO_IDS) {
      expect(getScenario(id)?.id).toBe(id);
      expect(scenarioById[id].id).toBe(id);
    }
    expect(getScenario("unknown")).toBeUndefined();
  });
});
