import {
  faArrowLeft,
  faBolt,
  faBookOpen,
  faGaugeHigh,
  faPlay,
  faSkull,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ScenarioCover } from "@/components/scenario-cover";
import { ScenarioRecord } from "@/components/scenario-record";
import { getScenario, scenarios } from "@/data/scenarios";

interface ScenarioPageProps {
  params: Promise<{ slug: string }>;
}

/** 七个场景全部在构建时预渲染，避免 `params` 阻塞静态外壳。 */
export function generateStaticParams(): Array<{ slug: string }> {
  return scenarios.map((scenario) => ({ slug: scenario.id }));
}

export async function generateMetadata({
  params,
}: ScenarioPageProps): Promise<Metadata> {
  const { slug } = await params;
  const scenario = getScenario(slug);

  if (!scenario) {
    return { title: "场景不存在 · 末日生存指南：别慌" };
  }

  return {
    title: `${scenario.title} · 末日生存指南：别慌`,
    description: scenario.tagline,
  };
}

export default async function ScenarioPage({ params }: ScenarioPageProps) {
  const { slug } = await params;
  const scenario = getScenario(slug);

  if (!scenario) notFound();

  const scenarioIndex = scenarios.findIndex((item) => item.id === scenario.id);

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-chip px-2 text-sm font-semibold text-ink-soft transition-colors duration-[var(--duration-fast)] hover:text-ink"
          >
            <FontAwesomeIcon icon={faArrowLeft} aria-hidden />
            返回场景大厅
          </Link>
          <span className="font-numeric text-sm font-bold text-ink-soft">
            SCENARIO {String(scenarioIndex + 1).padStart(2, "0")} /{" "}
            {String(scenarios.length).padStart(2, "0")}
          </span>
        </div>

        <section className="relative mt-4 overflow-hidden rounded-card border-2 border-ink shadow-card">
          <ScenarioCover
            scenario={scenario}
            priority
            className="aspect-[16/11] sm:aspect-[21/9]"
          />

          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 text-paper sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex min-h-8 items-center rounded-chip border-2 border-paper/60 bg-ink/40 px-3 font-numeric text-xs font-bold backdrop-blur-sm">
                #{String(scenarioIndex + 1).padStart(2, "0")}
              </span>
              <span className="inline-flex min-h-8 items-center gap-2 rounded-chip border-2 border-paper/60 bg-ink/40 px-3 text-xs font-semibold backdrop-blur-sm">
                <span className="sr-only">
                  威胁等级 {scenario.threatLevel}，共 5 级
                </span>
                <span aria-hidden className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <FontAwesomeIcon
                      key={level}
                      icon={faSkull}
                      className={`h-3.5 w-3.5 ${
                        level <= scenario.threatLevel
                          ? "text-coral"
                          : "text-paper/30"
                      }`}
                    />
                  ))}
                </span>
                <span aria-hidden>
                  威胁 {scenario.threatLevel}/5
                </span>
              </span>
            </div>

            <div>
              <h1 className="font-display text-3xl leading-tight sm:text-5xl">
                {scenario.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-paper/90 sm:text-base">
                {scenario.tagline}
              </p>
            </div>

            <ul
              aria-label="可用技能"
              className="flex flex-wrap gap-2 text-xs font-semibold text-ink sm:text-sm"
            >
              {scenario.skills.map((skill) => (
                <li
                  key={skill}
                  className="inline-flex min-h-8 items-center gap-1.5 rounded-chip border-2 border-ink bg-paper/95 px-3"
                >
                  <FontAwesomeIcon
                    icon={faBolt}
                    aria-hidden
                    className="h-3 w-3 text-coral"
                  />
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="mt-6 grid gap-4 sm:mt-8 lg:grid-cols-[42fr_58fr] lg:items-start">
          <section
            aria-labelledby="specific-resource-title"
            className="rounded-card border-2 border-ink bg-surface p-5 shadow-card sm:p-6"
          >
            <h2
              id="specific-resource-title"
              className="flex items-center gap-2.5 font-display text-xl text-ink"
            >
              <span
                aria-hidden
                className="flex h-9 w-9 items-center justify-center rounded-chip border-2 border-ink text-paper shadow-button"
                style={{ background: scenario.accent }}
              >
                <FontAwesomeIcon icon={faGaugeHigh} className="h-4 w-4" />
              </span>
              专属资源
            </h2>

            <p className="mt-4 font-display text-2xl text-ink">
              {scenario.specificResource.label}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              {scenario.specificResource.description}
            </p>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-small border-2 border-ink/10 bg-paper/70 px-4 py-3">
              <span className="text-xs font-semibold tracking-[0.16em] text-ink-soft">
                初始值
              </span>
              <span className="font-numeric text-3xl font-bold leading-none text-ink">
                {scenario.specificResource.initial}
              </span>
            </div>
          </section>

          <ScenarioRecord scenarioId={scenario.id} />
        </div>
      </div>

      {/* 移动端吸底动作条；桌面端回到正常文档流。 */}
      <div className="sticky bottom-0 z-20 mt-auto border-t-2 border-ink/10 bg-paper/95 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur md:static md:border-0 md:bg-transparent md:pt-0 md:pb-10 md:backdrop-blur-none">
        <div className="mx-auto flex w-full max-w-5xl flex-col-reverse gap-3 px-4 sm:flex-row sm:justify-end sm:px-6">
          <Link
            href="/codex"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-button border-2 border-ink bg-surface px-6 font-semibold text-ink shadow-button transition-transform duration-[var(--duration-fast)] ease-[var(--ease-cartoon)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_var(--ink)]"
          >
            <FontAwesomeIcon icon={faBookOpen} aria-hidden />
            查看生存手册
          </Link>
          <Link
            href={`/play/${scenario.id}`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-button border-2 border-ink bg-coral px-6 font-semibold text-paper shadow-button transition-transform duration-[var(--duration-fast)] ease-[var(--ease-cartoon)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_var(--ink)]"
          >
            <FontAwesomeIcon icon={faPlay} aria-hidden />
            开始求生
          </Link>
        </div>
      </div>
    </main>
  );
}
