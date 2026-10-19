"use client";

import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBolt,
  faBrain,
  faChevronDown,
  faChevronUp,
  faDoorOpen,
  faDroplet,
  faHeartPulse,
  faUtensils,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { RESOURCE_MAX, RUN_DAYS } from "@/lib/engine/constants";
import { getIconByName } from "@/lib/icons";
import type { ResourceKey, RunState, Scenario } from "@/lib/types";

interface ResourceView {
  key: string;
  label: string;
  icon: IconDefinition;
  color: string;
  value: number;
  max: number;
}

/** 5 项通用资源的展示信息（顺序与 `RESOURCE_KEYS` 一致）。 */
const COMMON_RESOURCES: readonly {
  key: ResourceKey;
  label: string;
  icon: IconDefinition;
  color: string;
}[] = [
  { key: "hp", label: "生命", icon: faHeartPulse, color: "var(--danger)" },
  { key: "sanity", label: "理智", icon: faBrain, color: "var(--scene-ai-from)" },
  { key: "water", label: "饮水", icon: faDroplet, color: "var(--scene-flood-from)" },
  { key: "food", label: "食物", icon: faUtensils, color: "var(--sun)" },
  { key: "energy", label: "体力", icon: faBolt, color: "var(--coral)" },
];

function buildResourceViews(
  scenario: Scenario,
  run: RunState,
): ResourceView[] {
  return [
    ...COMMON_RESOURCES.map((resource) => ({
      ...resource,
      value: run.resources[resource.key],
      max: RESOURCE_MAX,
    })),
    {
      key: scenario.specificResource.key,
      label: scenario.specificResource.label,
      icon: getIconByName(scenario.icon),
      color: scenario.accent,
      value: run.specificResource,
      max: RESOURCE_MAX,
    },
  ];
}

function clampPercent(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

function ResourceBar({ view }: { view: ResourceView }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-xs font-semibold text-ink-soft">
        <span className="inline-flex items-center gap-1.5">
          <FontAwesomeIcon
            icon={view.icon}
            aria-hidden
            className="h-3.5 w-3.5"
            style={{ color: view.color }}
          />
          {view.label}
        </span>
        <span className="font-numeric text-sm font-bold text-ink">
          {view.value}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`${view.label} ${view.value}，满值 ${view.max}`}
        aria-valuenow={view.value}
        aria-valuemin={0}
        aria-valuemax={view.max}
        className="mt-1.5 h-2.5 overflow-hidden rounded-chip border border-ink/15 bg-paper"
      >
        <span
          className="block h-full rounded-chip transition-[width] duration-[var(--duration-normal)] ease-[var(--ease-cartoon)]"
          style={{
            width: `${clampPercent(view.value, view.max)}%`,
            backgroundColor: view.color,
          }}
        />
      </div>
    </div>
  );
}

function CompactResource({ view }: { view: ResourceView }) {
  return (
    <li className="flex min-h-11 items-center justify-center gap-1.5 rounded-small border-2 border-ink/10 bg-paper/70 px-2">
      <FontAwesomeIcon
        icon={view.icon}
        aria-hidden
        className="h-4 w-4"
        style={{ color: view.color }}
      />
      <span className="font-numeric text-sm font-bold text-ink">
        {view.value}
      </span>
      <span className="sr-only">{view.label}</span>
    </li>
  );
}

function DayDots({ day }: { day: number }) {
  return (
    <ol
      aria-label={`进度：第 ${day} 天，共 ${RUN_DAYS} 天`}
      className="mt-3 flex items-center gap-1.5"
    >
      {Array.from({ length: RUN_DAYS }, (_, index) => {
        const value = index + 1;
        const current = value === day;

        return (
          <li
            key={value}
            aria-current={current ? "step" : undefined}
            className={`flex h-7 w-7 items-center justify-center rounded-full border-2 font-numeric text-xs font-bold ${
              value < day
                ? "border-ink bg-sun text-ink"
                : current
                  ? "border-ink bg-coral text-paper"
                  : "border-ink/20 bg-paper text-ink/35"
            }`}
          >
            <span aria-hidden>{value}</span>
            <span className="sr-only">第 {value} 天</span>
          </li>
        );
      })}
    </ol>
  );
}

/** 游戏页顶部 HUD：天数、7 个天数圆点、资源条与退出确认。 */
export function GameHud({
  scenario,
  run,
}: {
  scenario: Scenario;
  run: RunState;
}) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const drawerId = useId();
  const dialogTitleId = useId();
  const dialogDescriptionId = useId();

  const views = buildResourceViews(scenario, run);

  function confirmExit() {
    setExitOpen(false);
    // 只返回简报，不清除 activeRun：下次进入可继续这一局。
    router.push(`/scenario/${scenario.id}`);
  }

  return (
    <>
      <header
        aria-label="本局状态"
        className="rounded-card border-2 border-ink bg-surface p-4 shadow-card sm:p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold tracking-[0.18em] text-ink-soft">
              {scenario.title}
            </p>
            <h1 className="mt-0.5 font-display text-2xl text-ink sm:text-3xl">
              第 <span className="font-numeric">{run.day}</span>/{RUN_DAYS} 天
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setExitOpen(true)}
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-button border-2 border-ink bg-surface px-3 text-sm font-semibold text-ink shadow-button transition-transform duration-[var(--duration-fast)] ease-[var(--ease-cartoon)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_var(--ink)] sm:px-4"
          >
            <FontAwesomeIcon icon={faDoorOpen} aria-hidden />
            退出
          </button>
        </div>

        <DayDots day={run.day} />

        {/* 桌面端：直接展开全部资源条。 */}
        <div className="mt-4 hidden gap-x-5 gap-y-3 sm:grid sm:grid-cols-2 lg:grid-cols-3">
          {views.map((view) => (
            <ResourceBar key={view.key} view={view} />
          ))}
        </div>

        {/* 移动端：紧凑图标 + 数字，点击展开抽屉查看名称与进度条。 */}
        <div className="mt-3 sm:hidden">
          <ul aria-label="资源概览" className="grid grid-cols-3 gap-2">
            {views.map((view) => (
              <CompactResource key={view.key} view={view} />
            ))}
          </ul>

          <button
            type="button"
            aria-expanded={drawerOpen}
            aria-controls={drawerId}
            onClick={() => setDrawerOpen((open) => !open)}
            className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-chip px-3 text-xs font-semibold text-ink-soft"
          >
            <FontAwesomeIcon
              icon={drawerOpen ? faChevronUp : faChevronDown}
              aria-hidden
            />
            {drawerOpen ? "收起资源详情" : "展开资源详情"}
          </button>

          <div
            id={drawerId}
            className={`mt-1 gap-3 rounded-small border-2 border-ink/10 bg-paper/60 p-3 ${
              drawerOpen ? "grid" : "hidden"
            }`}
          >
            {views.map((view) => (
              <ResourceBar key={view.key} view={view} />
            ))}
          </div>
        </div>
      </header>

      {exitOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 px-4 backdrop-blur-sm"
          onClick={() => setExitOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            aria-describedby={dialogDescriptionId}
            className="w-full max-w-sm rounded-card border-2 border-ink bg-surface p-6 shadow-card"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === "Escape") setExitOpen(false);
            }}
          >
            <h2
              id={dialogTitleId}
              className="font-display text-xl text-ink"
            >
              要退出这一局吗？
            </h2>
            <p
              id={dialogDescriptionId}
              className="mt-2 text-sm leading-relaxed text-ink-soft"
            >
              当前进度会保留，下次从简报页进入可以接着玩。
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                autoFocus
                onClick={() => setExitOpen(false)}
                className="inline-flex min-h-11 items-center justify-center rounded-button border-2 border-ink bg-surface px-4 font-semibold text-ink shadow-button transition-transform duration-[var(--duration-fast)] ease-[var(--ease-cartoon)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_var(--ink)]"
              >
                继续求生
              </button>
              <button
                type="button"
                onClick={confirmExit}
                className="inline-flex min-h-11 items-center justify-center rounded-button border-2 border-ink bg-coral px-4 font-semibold text-paper shadow-button transition-transform duration-[var(--duration-fast)] ease-[var(--ease-cartoon)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_var(--ink)]"
              >
                退出到简报
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
