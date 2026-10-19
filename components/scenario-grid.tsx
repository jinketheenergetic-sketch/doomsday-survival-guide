"use client";

import { ScenarioCard } from "@/components/scenario-card";
import type { Scenario } from "@/lib/types";
import { useProgress } from "@/lib/use-progress";

/** 七个场景的入口网格；星级来自本地存档。 */
export function ScenarioGrid({
  scenarios,
}: {
  scenarios: readonly Scenario[];
}) {
  const progress = useProgress();

  return (
    <section
      aria-labelledby="scenario-grid-heading"
      className="mx-auto w-full max-w-6xl px-4 sm:px-6"
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2
            id="scenario-grid-heading"
            className="font-display text-2xl text-ink sm:text-3xl"
          >
            选择你的末日
          </h2>
          <p className="text-sm text-ink-soft">
            七个剧本，七种死法，七次学会怎么活。
          </p>
        </div>
        <p className="font-numeric text-sm font-semibold text-ink-soft">
          7 个场景
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((scenario, index) => (
          <div
            key={scenario.id}
            className={
              index === scenarios.length - 1 ? "lg:col-start-2" : undefined
            }
          >
            <ScenarioCard
              scenario={scenario}
              index={index}
              bestStars={progress.scenarios[scenario.id]?.bestStars ?? 0}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
