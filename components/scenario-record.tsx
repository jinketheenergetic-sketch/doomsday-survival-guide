"use client";

import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { ScenarioId } from "@/lib/types";
import { useProgress } from "@/lib/use-progress";

/** 每个场景固定三种结局槽位。 */
const ENDING_SLOTS = [
  { tone: "best", label: "最佳结局" },
  { tone: "neutral", label: "普通结局" },
  { tone: "doom", label: "末日结局" },
] as const;

/** 简报页的「我的记录」：历史最佳分、星级与结局收集。 */
export function ScenarioRecord({ scenarioId }: { scenarioId: ScenarioId }) {
  const progress = useProgress();
  const record = progress.scenarios[scenarioId];

  // 结局标题由各场景内容提供；在内容聚合完成前，先按已解锁数量点亮槽位。
  const unlockedCount = Math.min(record.endingIds.length, ENDING_SLOTS.length);

  return (
    <section
      aria-label="我的记录"
      className="rounded-card border-2 border-ink bg-surface p-5 shadow-card sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl text-ink">我的记录</h2>
        <span className="rounded-chip border-2 border-ink/15 bg-paper px-3 py-1 font-numeric text-xs font-bold text-ink-soft">
          已玩 {record.runs} 局
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-small border-2 border-ink/10 bg-paper/70 px-4 py-3">
          <dt className="text-xs font-semibold tracking-[0.16em] text-ink-soft">
            最佳分
          </dt>
          <dd className="mt-1 font-numeric text-3xl font-bold leading-none text-ink">
            {record.bestScore}
          </dd>
        </div>

        <div className="rounded-small border-2 border-ink/10 bg-paper/70 px-4 py-3">
          <dt className="text-xs font-semibold tracking-[0.16em] text-ink-soft">
            最佳星级
          </dt>
          <dd className="mt-1.5 flex items-center gap-1">
            <span className="sr-only">{record.bestStars} 星，共 3 星</span>
            {[1, 2, 3].map((slot) => (
              <FontAwesomeIcon
                key={slot}
                icon={slot <= record.bestStars ? faStar : faStarRegular}
                aria-hidden
                className={`h-6 w-6 ${
                  slot <= record.bestStars ? "text-sun" : "text-ink/25"
                }`}
              />
            ))}
          </dd>
        </div>
      </dl>

      <div className="mt-5">
        <p className="flex items-center justify-between gap-2 text-sm font-semibold text-ink">
          <span>结局收集</span>
          <span className="font-numeric text-xs text-ink-soft">
            {unlockedCount}/{ENDING_SLOTS.length}
          </span>
        </p>

        <ol className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
          {ENDING_SLOTS.map((slot, index) => {
            const unlocked = index < unlockedCount;

            return (
              <li
                key={slot.tone}
                className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-small border-2 px-2 py-3 text-center ${
                  unlocked
                    ? "border-ink bg-paper"
                    : "border-dashed border-ink/25 bg-paper/40"
                }`}
              >
                <span className="text-xs font-semibold text-ink-soft">
                  {slot.label}
                </span>
                <span
                  className={`font-numeric text-lg font-bold leading-none ${
                    unlocked ? "text-coral" : "text-ink/30"
                  }`}
                >
                  {unlocked ? "已解锁" : "???"}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
