"use client";

import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import {
  faArrowRotateRight,
  faBookOpen,
  faGlobe,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  applyResultOnce,
  getResultSnapshot,
  getServerResultSnapshot,
  subscribeResult,
} from "@/components/game/result-store";
import { COMMON_RESOURCES } from "@/components/game/resource-display";
import { ScenarioCover } from "@/components/scenario-cover";
import { getKnowledgeCard } from "@/data/knowledge";
import { getIconByName } from "@/lib/icons";
import { storageAdapter } from "@/lib/storage";
import type {
  ChoiceResult,
  Ending,
  EndingTone,
  GameEvent,
  KnowledgeCard,
  LastResult,
  Scenario,
} from "@/lib/types";

export interface ResultScreenProps {
  scenario: Scenario;
  endings: readonly Ending[];
  knowledge: readonly KnowledgeCard[];
  /** 本局可能用到的事件；内容未接入时与游戏页同样使用占位牌组。 */
  events: readonly GameEvent[];
}

interface EndingView {
  tone: EndingTone;
  title: string;
  description: string;
}

const TONE_LABEL: Record<EndingTone, string> = {
  best: "最佳结局",
  neutral: "普通结局",
  doom: "末日结局",
};

/** 内容尚未接入时的结局兜底文案，真实结局落地后自动被替换。 */
const FALLBACK_ENDINGS: Record<EndingTone, { title: string; description: string }> = {
  best: {
    title: "你赢下了这场末日",
    description: "你不只是活了下来，还把日子过出了点样子。",
  },
  neutral: {
    title: "你活到了最后一页",
    description: "你撑到了最后，代价是再也睡不踏实。",
  },
  doom: {
    title: "故事在这里断了",
    description: "灾变没有给你讨价还价的机会，但你至少认真选过。",
  },
};

const QUALITY_META: Record<
  ChoiceResult["quality"],
  { symbol: string; label: string; className: string }
> = {
  good: {
    symbol: "✓",
    label: "做得好",
    className: "border-success bg-success/15 text-success",
  },
  ok: {
    symbol: "•",
    label: "中规中矩",
    className: "border-ink/20 bg-paper text-ink-soft",
  },
  bad: {
    symbol: "✗",
    label: "失误",
    className: "border-danger bg-danger/15 text-danger",
  },
};

function inferTone(endingId: string): EndingTone {
  if (endingId.endsWith("-best")) return "best";
  if (endingId.endsWith("-doom")) return "doom";
  return "neutral";
}

function resolveEndingView(
  endings: readonly Ending[],
  result: LastResult,
): EndingView {
  const ending = endings.find((item) => item.id === result.endingId);
  const tone = ending?.tone ?? inferTone(result.endingId);
  const fallback = FALLBACK_ENDINGS[tone];

  return {
    tone,
    title: ending?.title ?? fallback.title,
    description: ending?.description ?? fallback.description,
  };
}

/** 分数从 0 滚到最终值；减少动效时直接显示结果。 */
function ScoreRoll({ score }: { score: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const prefersReduced =
      storageAdapter.getSettings().reducedMotion ||
      (typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    if (prefersReduced) {
      node.textContent = String(score);
      return;
    }

    node.textContent = "0";
    let frame = 0;
    const startedAt = Date.now();
    const duration = 900;

    const tick = () => {
      const progress = Math.min(1, (Date.now() - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = String(Math.round(score * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <>
      <span
        ref={nodeRef}
        aria-hidden
        className="font-numeric text-5xl font-bold leading-none text-ink sm:text-6xl"
      >
        0
      </span>
      <span className="sr-only">本局得分 {score} 分</span>
    </>
  );
}

function StarRating({ stars }: { stars: LastResult["stars"] }) {
  return (
    <div
      role="img"
      aria-label={`${stars} 星，共 3 星`}
      className="flex items-center gap-1"
    >
      {[1, 2, 3].map((slot) => (
        <FontAwesomeIcon
          key={slot}
          icon={slot <= stars ? faStar : faStarRegular}
          aria-hidden
          className={`h-8 w-8 sm:h-9 sm:w-9 ${
            slot <= stars ? "star-pop text-sun" : "text-ink/20"
          }`}
          style={slot <= stars ? { animationDelay: `${(slot - 1) * 120}ms` } : undefined}
        />
      ))}
    </div>
  );
}

function SurvivalReport({
  result,
  events,
}: {
  result: LastResult;
  events: readonly GameEvent[];
}) {
  const [open, setOpen] = useState(false);
  const listId = useId();

  return (
    <section
      aria-labelledby="result-report-title"
      className="rounded-card border-2 border-ink bg-surface p-5 shadow-card sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          id="result-report-title"
          className="font-display text-xl text-ink"
        >
          生存报告
        </h2>
        <span className="rounded-chip border-2 border-ink/15 bg-paper px-3 py-1 font-numeric text-xs font-bold text-ink-soft">
          {result.history.length} 条决策
        </span>
      </div>

      {/* 移动端默认折叠，桌面端始终展开。 */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-chip border-2 border-ink/15 bg-paper/70 px-3 text-sm font-semibold text-ink sm:hidden"
      >
        {open ? "收起复盘" : "展开复盘"}
      </button>

      {result.history.length === 0 ? (
        <p className="mt-4 text-sm font-semibold text-ink-soft">
          这一局没有留下决策记录。
        </p>
      ) : (
        <ol
          id={listId}
          className={`mt-4 gap-3 ${open ? "grid" : "hidden sm:grid"}`}
        >
          {result.history.map((entry) => {
            const event = events.find((item) => item.id === entry.eventId);
            const chosen = event?.choices.find(
              (choice) => choice.id === entry.choiceId,
            );
            const correct = event?.choices.find(
              (choice) => choice.quality === "good",
            );
            const quality = QUALITY_META[entry.quality];

            return (
              <li
                key={`${entry.day}-${entry.eventId}-${entry.choiceId}`}
                className="rounded-small border-2 border-ink/10 bg-paper/60 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-numeric text-xs font-bold tracking-[0.14em] text-ink-soft">
                    第 {entry.day} 天
                  </span>
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-chip border-2 text-sm font-bold ${quality.className}`}
                  >
                    <span aria-hidden>{quality.symbol}</span>
                    <span className="sr-only">{quality.label}</span>
                  </span>
                  {entry.riskSucceeded !== undefined && (
                    <span
                      className={`rounded-chip border px-2 py-0.5 text-xs font-semibold ${
                        entry.riskSucceeded
                          ? "border-success/35 bg-success/10 text-success"
                          : "border-danger/35 bg-danger/10 text-danger"
                      }`}
                    >
                      风险判定{entry.riskSucceeded ? "成功" : "失败"}
                    </span>
                  )}
                </div>

                <p className="mt-2 font-semibold text-ink">
                  {chosen?.label ?? entry.text}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  {entry.text}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  <span className="font-bold text-ink">正确做法：</span>
                  {correct?.label ?? "这一步没有唯一的正确答案。"}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function KnowledgeUnlocks({
  ids,
  knowledge,
}: {
  ids: readonly string[];
  knowledge: readonly KnowledgeCard[];
}) {
  return (
    <section
      aria-labelledby="result-knowledge-title"
      className="rounded-card border-2 border-ink bg-surface p-5 shadow-card sm:p-6"
    >
      <h2
        id="result-knowledge-title"
        className="font-display text-xl text-ink"
      >
        本次解锁的知识
      </h2>

      {ids.length === 0 ? (
        <p className="mt-3 text-sm font-semibold text-ink-soft">
          这次没有新知识，只有新伤疤。
        </p>
      ) : (
        <ul className="mt-4 grid gap-3">
          {ids.map((id) => {
            const card =
              knowledge.find((item) => item.id === id) ??
              getKnowledgeCard(id);

            return (
              <li
                key={id}
                className="rounded-small border-2 border-ink/10 bg-paper/60 p-4"
              >
                {card ? (
                  <>
                    <p className="flex items-center gap-2 font-semibold text-ink">
                      <FontAwesomeIcon
                        icon={getIconByName(card.icon)}
                        aria-hidden
                        className="h-4 w-4 text-teal"
                      />
                      {card.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                      {card.content}
                    </p>
                  </>
                ) : (
                  <p className="text-sm leading-relaxed text-ink-soft">
                    已解锁一张知识卡，内容还在整理中。
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/** 结算页主体：结局、评分、终局资源、生存报告、知识解锁与下一步入口。 */
export function ResultScreen({
  scenario,
  endings,
  knowledge,
  events,
}: ResultScreenProps) {
  const router = useRouter();
  const snapshot = useSyncExternalStore(
    subscribeResult,
    getResultSnapshot,
    getServerResultSnapshot,
  );

  const result =
    snapshot.status === "ready" &&
    snapshot.result?.scenarioId === scenario.id
      ? snapshot.result
      : null;

  // 没有可用的本局结果，或结果属于其他场景时，回到该场景简报。
  useEffect(() => {
    if (snapshot.status === "loading") return;

    const missing = snapshot.status === "missing" || !snapshot.result;
    const mismatch =
      snapshot.result !== null && snapshot.result.scenarioId !== scenario.id;

    if (missing || mismatch) {
      router.replace(`/scenario/${scenario.id}`);
    }
  }, [router, scenario.id, snapshot]);

  // 结果写回进度只做一次；存储清理与结局计数都在这里完成。
  useEffect(() => {
    if (result) applyResultOnce(result);
  }, [result]);

  if (!result) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <p role="status" className="text-sm font-semibold text-ink-soft">
          正在整理这一局的记录……
        </p>
      </main>
    );
  }

  const ending = resolveEndingView(endings, result);
  const isDoom = ending.tone === "doom";
  const endingCount = Math.min(3, Math.max(1, snapshot.endingCount));

  const resourceViews = [
    ...COMMON_RESOURCES.map((resource) => ({
      key: resource.key,
      label: resource.label,
      icon: resource.icon,
      color: resource.color,
      value: result.resources[resource.key],
    })),
    {
      key: scenario.specificResource.key,
      label: scenario.specificResource.label,
      icon: getIconByName(scenario.icon),
      color: scenario.accent,
      value: result.specificResource,
    },
  ];

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <p className="text-xs font-semibold tracking-[0.18em] text-ink-soft">
          {scenario.title} · 本局结算
        </p>

        {/* 结局插画：doom 结局使用灰暗滤镜与「你尽力了（大概）」标签。 */}
        <section
          aria-labelledby="result-ending-title"
          className="relative mt-3 overflow-hidden rounded-card border-2 border-ink bg-ink shadow-card"
        >
          <div className={isDoom ? "grayscale brightness-75" : ""}>
            <ScenarioCover
              scenario={scenario}
              priority
              className="aspect-[16/10] sm:aspect-[21/9]"
            />
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5 text-paper sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex min-h-8 items-center rounded-chip border-2 border-paper/60 bg-ink/50 px-3 text-xs font-bold backdrop-blur-sm">
                {TONE_LABEL[ending.tone]}
              </span>
              <span className="inline-flex min-h-8 items-center rounded-chip border-2 border-paper/60 bg-ink/50 px-3 font-numeric text-xs font-bold backdrop-blur-sm">
                结局 {endingCount}/3
              </span>
              {isDoom && (
                <span className="inline-flex min-h-8 items-center rounded-chip border-2 border-paper/60 bg-ink/50 px-3 text-xs font-bold backdrop-blur-sm">
                  你尽力了（大概）
                </span>
              )}
            </div>

            <h1
              id="result-ending-title"
              className="mt-3 font-display text-3xl leading-tight sm:text-5xl"
            >
              {ending.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-paper/90 sm:text-base">
              {ending.description}
            </p>
          </div>
        </section>

        {/* 评分卡：分数滚动 + 星级点亮。 */}
        <section
          aria-labelledby="result-score-title"
          className="mt-4 rounded-card border-2 border-ink bg-surface p-5 shadow-card sm:p-6"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2
                id="result-score-title"
                className="text-xs font-semibold tracking-[0.18em] text-ink-soft"
              >
                本局评分
              </h2>
              <p className="mt-1 flex items-baseline gap-1">
                <ScoreRoll score={result.score} />
                <span className="font-numeric text-lg font-bold text-ink-soft">
                  分
                </span>
              </p>
            </div>

            <StarRating stars={result.stars} />
          </div>

          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-ink-soft">
            <span>
              正确选择{" "}
              <span className="font-numeric text-ink">{result.goodCount}</span>{" "}
              次
            </span>
            <span>
              失误{" "}
              <span className="font-numeric text-ink">{result.badCount}</span> 次
            </span>
          </p>
        </section>

        {/* 终局资源与存活天数。 */}
        <section
          aria-labelledby="result-resources-title"
          className="mt-4 rounded-card border-2 border-ink bg-surface p-5 shadow-card sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2
              id="result-resources-title"
              className="font-display text-xl text-ink"
            >
              终局资源
            </h2>
            <p className="rounded-chip border-2 border-ink/15 bg-paper px-3 py-1 text-xs font-semibold text-ink-soft">
              存活{" "}
              <span className="font-numeric text-sm font-bold text-ink">
                {result.daysSurvived}
              </span>{" "}
              天
            </p>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {resourceViews.map((view) => (
              <div
                key={view.key}
                className="flex min-h-14 items-center gap-2.5 rounded-small border-2 border-ink/10 bg-paper/70 px-3 py-2"
              >
                <FontAwesomeIcon
                  icon={view.icon}
                  aria-hidden
                  className="h-4 w-4 shrink-0"
                  style={{ color: view.color }}
                />
                <div>
                  <dt className="text-xs font-semibold text-ink-soft">
                    {view.label}
                  </dt>
                  <dd className="font-numeric text-xl font-bold leading-tight text-ink">
                    {view.value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </section>

        <div className="mt-4 grid gap-4">
          <SurvivalReport result={result} events={events} />
          <KnowledgeUnlocks
            ids={result.newKnowledgeIds}
            knowledge={knowledge}
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link
            href={`/play/${scenario.id}`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-button border-2 border-ink bg-coral px-5 font-semibold text-paper shadow-button transition-transform duration-[var(--duration-fast)] ease-[var(--ease-cartoon)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_var(--ink)]"
          >
            <FontAwesomeIcon icon={faArrowRotateRight} aria-hidden />
            再来一局
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-button border-2 border-ink bg-surface px-5 font-semibold text-ink shadow-button transition-transform duration-[var(--duration-fast)] ease-[var(--ease-cartoon)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_var(--ink)]"
          >
            <FontAwesomeIcon icon={faGlobe} aria-hidden />
            换个末日
          </Link>
          <Link
            href="/codex"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-button border-2 border-ink bg-sun px-5 font-semibold text-ink shadow-button transition-transform duration-[var(--duration-fast)] ease-[var(--ease-cartoon)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_var(--ink)]"
          >
            <FontAwesomeIcon icon={faBookOpen} aria-hidden />
            查看生存手册
          </Link>
        </div>
      </div>
    </main>
  );
}
