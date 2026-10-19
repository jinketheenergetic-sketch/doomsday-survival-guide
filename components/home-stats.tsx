"use client";

import { useProgress } from "@/lib/use-progress";

const TOTAL_KNOWLEDGE = 42;
const TOTAL_ENDINGS = 21;

interface StatBlock {
  label: string;
  value: number;
  suffix?: string;
  max?: number;
  gradient?: string;
}

function clampRatio(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, value / max));
}

/** 收集进度条带：知识、结局、总存活天数与最佳评分。 */
export function HomeStats() {
  const progress = useProgress();

  const stats: StatBlock[] = [
    {
      label: "知识",
      value: Math.min(progress.unlockedKnowledgeIds.length, TOTAL_KNOWLEDGE),
      suffix: `/${TOTAL_KNOWLEDGE}`,
      max: TOTAL_KNOWLEDGE,
      gradient: "var(--gradient-flood)",
    },
    {
      label: "结局",
      value: Math.min(progress.unlockedEndingIds.length, TOTAL_ENDINGS),
      suffix: `/${TOTAL_ENDINGS}`,
      max: TOTAL_ENDINGS,
      gradient: "var(--gradient-quake)",
    },
    {
      label: "总存活",
      value: progress.totalSurvivedDays,
      suffix: " 天",
    },
    {
      label: "最佳评分",
      value: progress.bestScore,
    },
  ];

  return (
    <section
      aria-label="收集进度"
      className="mx-auto w-full max-w-6xl px-4 sm:px-6"
    >
      <dl className="grid grid-cols-2 gap-3 rounded-card border-2 border-ink bg-surface p-4 shadow-card sm:grid-cols-4 sm:gap-4 sm:p-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-small border-2 border-ink/10 bg-paper/70 px-4 py-3"
          >
            <dt className="text-xs font-semibold tracking-[0.16em] text-ink-soft">
              {stat.label}
            </dt>
            <dd className="mt-1 flex items-baseline gap-1 font-numeric text-3xl font-bold leading-none text-ink">
              {stat.value}
              {stat.suffix ? (
                <span className="text-base font-semibold text-ink-soft">
                  {stat.suffix}
                </span>
              ) : null}
            </dd>
            {stat.max ? (
              <div
                aria-hidden
                className="mt-3 h-1.5 overflow-hidden rounded-chip bg-ink/10"
              >
                <div
                  className="h-full rounded-chip transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-cartoon)]"
                  style={{
                    width: `${clampRatio(stat.value, stat.max) * 100}%`,
                    background: stat.gradient,
                  }}
                />
              </div>
            ) : null}
          </div>
        ))}
      </dl>
    </section>
  );
}
