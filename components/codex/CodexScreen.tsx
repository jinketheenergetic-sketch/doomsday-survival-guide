"use client";

import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { faLock, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { KnowledgeDetailDialog } from "@/components/codex/KnowledgeDetailDialog";
import { knowledgeCards } from "@/data/knowledge";
import { scenarioById, scenarios } from "@/data/scenarios";
import { getIconByName } from "@/lib/icons";
import {
  SCENARIO_IDS,
  type KnowledgeCard,
  type Scenario,
  type ScenarioId,
  type ThreatLevel,
} from "@/lib/types";
import { useProgress } from "@/lib/use-progress";

type ScenarioFilter = ScenarioId | "all";

const RING_SIZE = 88;
const RING_STROKE = 10;

/** 只接受 7 个真实 slug，其余（含 null）一律回落到全部。 */
function resolveFilter(value: string | null): ScenarioFilter {
  return value !== null && (SCENARIO_IDS as readonly string[]).includes(value)
    ? (value as ScenarioId)
    : "all";
}

function ProgressRing({
  unlocked,
  total,
}: {
  unlocked: number;
  total: number;
}) {
  const radius = (RING_SIZE - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = total > 0 ? unlocked / total : 0;

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-24 w-24 shrink-0">
        <svg
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          role="img"
          aria-label={`知识卡收集进度 ${unlocked}/${total}`}
          className="h-full w-full -rotate-90"
        >
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={radius}
            fill="none"
            stroke="var(--ink)"
            strokeOpacity={0.12}
            strokeWidth={RING_STROKE}
          />
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={radius}
            fill="none"
            stroke="var(--teal)"
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - ratio)}
            className="transition-[stroke-dashoffset] duration-[var(--duration-slow)] ease-[var(--ease-cartoon)]"
          />
        </svg>
        <span
          aria-hidden
          className="absolute inset-0 flex flex-col items-center justify-center font-numeric leading-none"
        >
          <span className="text-2xl font-bold text-ink">{unlocked}</span>
          <span className="mt-1 text-xs font-bold text-ink-soft">/ {total}</span>
        </span>
      </div>

      <div className="hidden sm:block">
        <p className="font-display text-lg text-ink">收集进度</p>
        <p className="text-sm text-ink-soft">还差 {total - unlocked} 张集齐。</p>
      </div>
    </div>
  );
}

function DifficultyStars({ level }: { level: ThreatLevel }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      <span className="sr-only">难度 {level}，共 5 级</span>
      {[1, 2, 3, 4, 5].map((slot) => (
        <FontAwesomeIcon
          key={slot}
          icon={slot <= level ? faStar : faStarRegular}
          aria-hidden
          className={`h-3 w-3 ${slot <= level ? "text-sun" : "text-ink/20"}`}
        />
      ))}
    </span>
  );
}

function ScenarioChip({
  scenario,
  muted = false,
}: {
  scenario: Scenario;
  muted?: boolean;
}) {
  return (
    <span
      className={`inline-flex min-h-7 max-w-full items-center gap-1.5 rounded-chip border px-2.5 text-xs font-semibold ${
        muted
          ? "border-ink/10 bg-surface text-ink-soft/60"
          : "border-ink/15 bg-paper text-ink-soft"
      }`}
    >
      <span
        aria-hidden
        className="h-2 w-2 shrink-0 rounded-chip"
        style={{ background: scenario.accent }}
      />
      <span className="truncate">{scenario.title}</span>
    </span>
  );
}

function KnowledgeCardTile({
  card,
  unlocked,
  onOpen,
}: {
  card: KnowledgeCard;
  unlocked: boolean;
  onOpen: (card: KnowledgeCard) => void;
}) {
  const scenario = scenarioById[card.scenarioId];

  if (!unlocked) {
    return (
      <div className="flex h-full min-h-44 flex-col gap-3 rounded-card border-2 border-dashed border-ink/20 bg-paper/70 p-4">
        <div className="flex items-start justify-between gap-2">
          <span
            aria-hidden
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-chip border-2 border-ink/20 bg-surface text-ink/35"
          >
            <FontAwesomeIcon icon={faLock} className="h-4 w-4" />
          </span>
          <ScenarioChip scenario={scenario} muted />
        </div>

        <p className="font-display text-lg text-ink/50">???</p>
        <p className="mt-auto text-xs leading-relaxed text-ink-soft">
          在「{scenario.title}」里做对选择，才能翻到这一页。
        </p>
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={() => onOpen(card)}
      className="group flex h-full min-h-44 w-full flex-col gap-3 rounded-card border-2 border-ink bg-surface p-4 text-left shadow-card transition-[transform,box-shadow] duration-[var(--duration-normal)] ease-[var(--ease-cartoon)] hover:-translate-y-1 hover:shadow-[0_24px_50px_-20px_rgba(25,26,46,0.55),0_6px_0_rgba(25,26,46,0.9)]"
    >
      <div className="flex items-start justify-between gap-2">
        <span
          aria-hidden
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-chip border-2 border-ink text-paper shadow-button"
          style={{ background: `var(--gradient-${scenario.id})` }}
        >
          <FontAwesomeIcon
            icon={getIconByName(card.icon)}
            className="h-4 w-4"
          />
        </span>
        <DifficultyStars level={scenario.threatLevel} />
      </div>

      <h3 className="font-display text-lg leading-snug text-ink">
        {card.title}
      </h3>
      <p className="line-clamp-2 text-sm leading-relaxed text-ink-soft">
        {card.content}
      </p>

      <div className="mt-auto pt-1">
        <ScenarioChip scenario={scenario} />
      </div>
    </button>
  );
}

/** 生存手册图鉴：进度环、按场景筛选（写入 URL）与 42 张知识卡网格。 */
export function CodexScreen() {
  const searchParams = useSearchParams();
  const activeFilter = resolveFilter(searchParams.get("scenario"));
  const progress = useProgress();
  const [selectedCard, setSelectedCard] = useState<KnowledgeCard | null>(null);

  const unlockedIds = useMemo(
    () => new Set(progress.unlockedKnowledgeIds),
    [progress.unlockedKnowledgeIds],
  );

  const unlockedCount = useMemo(
    () =>
      knowledgeCards.reduce(
        (count, card) => count + (unlockedIds.has(card.id) ? 1 : 0),
        0,
      ),
    [unlockedIds],
  );

  const visibleCards = useMemo(
    () =>
      activeFilter === "all"
        ? knowledgeCards
        : knowledgeCards.filter((card) => card.scenarioId === activeFilter),
    [activeFilter],
  );

  const visibleUnlockedCount = visibleCards.reduce(
    (count, card) => count + (unlockedIds.has(card.id) ? 1 : 0),
    0,
  );
  const showEmptyState =
    activeFilter !== "all" && visibleUnlockedCount === 0;

  const filters: Array<{ id: ScenarioFilter; label: string }> = [
    { id: "all", label: "全部" },
    ...scenarios.map((scenario) => ({
      id: scenario.id,
      label: scenario.title,
    })),
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <section className="relative overflow-hidden rounded-card border-2 border-ink bg-surface p-5 shadow-card sm:p-7">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1.5"
          style={{
            background:
              "linear-gradient(90deg, var(--coral), var(--sun), var(--teal))",
          }}
        />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-numeric text-xs font-bold tracking-[0.22em] text-ink-soft">
              CODEX / 生存手册
            </p>
            <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">
              末日求生图鉴
            </h1>
            <p className="mt-2 max-w-xl text-sm text-ink-soft sm:text-base">
              每一条都是真能救命的知识。活过更多末日，就能翻到更多页。
            </p>
          </div>

          <ProgressRing
            unlocked={unlockedCount}
            total={knowledgeCards.length}
          />
        </div>

        <nav aria-label="按场景筛选" className="mt-5 flex flex-wrap gap-2">
          {filters.map((filter) => {
            const active = filter.id === activeFilter;
            return (
              <Link
                key={filter.id}
                href={
                  filter.id === "all"
                    ? "/codex"
                    : `/codex?scenario=${filter.id}`
                }
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-chip border-2 px-4 text-sm font-semibold transition-colors duration-[var(--duration-fast)] ${
                  active
                    ? "border-ink bg-sun text-ink shadow-button"
                    : "border-ink/15 bg-paper text-ink-soft hover:border-ink/40 hover:text-ink"
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </nav>
      </section>

      {showEmptyState ? (
        <p
          role="status"
          className="mt-6 rounded-card border-2 border-dashed border-ink/25 bg-surface/70 px-5 py-6 text-center font-display text-xl text-ink-soft"
        >
          这个末日你还没活明白。
        </p>
      ) : null}

      <section aria-labelledby="codex-grid-title" className="mt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="codex-grid-title" className="font-display text-xl text-ink">
            {activeFilter === "all"
              ? "全部知识卡"
              : `${scenarioById[activeFilter].title} · 知识卡`}
          </h2>
          <p className="font-numeric text-sm font-bold text-ink-soft">
            {visibleUnlockedCount} / {visibleCards.length} 已解锁
          </p>
        </div>

        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleCards.map((card) => (
            <li key={card.id} className="flex">
              <KnowledgeCardTile
                card={card}
                unlocked={unlockedIds.has(card.id)}
                onOpen={setSelectedCard}
              />
            </li>
          ))}
        </ul>
      </section>

      {selectedCard ? (
        <KnowledgeDetailDialog
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      ) : null}
    </div>
  );
}
