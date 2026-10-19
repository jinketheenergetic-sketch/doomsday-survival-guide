import {
  faBookOpen,
  faFire,
  faSnowflake,
  faWater,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

import { HomeStats } from "@/components/home-stats";
import { KnowledgeTip } from "@/components/knowledge-tip";
import { RandomScenarioButton } from "@/components/random-scenario-button";
import { ScenarioGrid } from "@/components/scenario-grid";
import { scenarios } from "@/data/scenarios";
import { getIconByName } from "@/lib/icons";

/** 首页可堆叠展示的三个场景，最上层放第一个场景。 */
const heroStack = [scenarios[2], scenarios[1], scenarios[0]];

const heroStackStyles = [
  "translate-x-14 translate-y-10 rotate-6 opacity-90",
  "-translate-x-10 translate-y-4 -rotate-6 opacity-95",
  "rotate-0",
];

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col overflow-x-hidden pb-16">
      <section className="relative overflow-hidden border-b-2 border-ink/10">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 12% 18%, rgba(255, 107, 87, 0.18), transparent 45%), radial-gradient(circle at 88% 8%, rgba(25, 185, 167, 0.16), transparent 42%), radial-gradient(circle at 70% 85%, rgba(255, 201, 77, 0.22), transparent 46%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "var(--noise)" }}
        />
        {/* 径向渐隐的网格：中间清晰、边缘淡出 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(25, 26, 46, 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(25, 26, 46, 0.07) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage:
              "radial-gradient(ellipse at 50% 35%, black 0%, transparent 72%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 50% 35%, black 0%, transparent 72%)",
          }}
        />
        {/* 漂浮的末日图标：纯装饰，不参与朗读与交互。 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <span className="absolute left-[4%] top-[14%] hidden -rotate-12 text-coral/30 md:block">
            <FontAwesomeIcon
              icon={faFire}
              className="float-drift h-10 w-10"
              style={{ animationDelay: "0s" }}
            />
          </span>
          <span className="absolute right-[6%] top-[18%] hidden rotate-6 text-teal/30 sm:block">
            <FontAwesomeIcon
              icon={faSnowflake}
              className="float-drift h-9 w-9"
              style={{ animationDelay: "1.2s", animationDuration: "7s" }}
            />
          </span>
          <span className="absolute bottom-[12%] left-[46%] hidden -rotate-6 text-sun/50 lg:block">
            <FontAwesomeIcon
              icon={faWater}
              className="float-drift h-11 w-11"
              style={{ animationDelay: "2.4s", animationDuration: "8s" }}
            />
          </span>
        </div>

        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[55fr_45fr] lg:items-center lg:py-20">
          <div className="flex flex-col items-start gap-5">
            <p className="inline-flex items-center gap-2 rounded-chip border-2 border-ink bg-surface px-4 py-1.5 font-numeric text-xs font-bold tracking-[0.22em] text-ink-soft shadow-button sm:text-sm">
              DAY 0 / 7 · 末日生存指南
            </p>

            <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl lg:text-6xl">
              末日生存指南：别慌
            </h1>

            <p className="text-lg font-semibold text-ink sm:text-xl">
              7 种世界末日，总有一款适合你。
            </p>
            <p className="max-w-lg text-base text-ink-soft">
              每局 5 分钟，学点真能救命的知识，顺便笑一下。
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <RandomScenarioButton />
              <Link
                href="/codex"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-button border-2 border-ink bg-sun px-6 font-semibold text-ink shadow-button transition-transform duration-[var(--duration-fast)] ease-[var(--ease-cartoon)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_var(--ink)]"
              >
                <FontAwesomeIcon icon={faBookOpen} aria-hidden />
                翻开生存手册
              </Link>
            </div>
          </div>

          {/* 装饰性场景卡堆叠：纯视觉，不参与交互与朗读。 */}
          <div aria-hidden className="relative hidden h-80 lg:block">
            {heroStack.map((scenario, index) => (
              <div
                key={scenario.id}
                className={`card-sheen absolute left-4 top-4 h-64 w-72 rounded-card border-2 border-ink p-5 shadow-card ${heroStackStyles[index]}`}
                style={{
                  background: `var(--gradient-${scenario.id})`,
                  zIndex: index + 1,
                }}
              >
                <div className="flex h-full flex-col justify-between text-paper">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex min-h-8 items-center rounded-chip border-2 border-paper/60 px-3 font-numeric text-xs font-bold">
                      #{String(scenarios.indexOf(scenario) + 1).padStart(2, "0")}
                    </span>
                    <FontAwesomeIcon
                      icon={getIconByName(scenario.icon)}
                      aria-hidden
                      className="h-7 w-7"
                    />
                  </div>
                  <div>
                    <p className="font-display text-2xl">{scenario.title}</p>
                    <p className="mt-1 text-sm text-paper/85">
                      {scenario.tagline}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1.5 rounded-chip border-2 border-paper/50 px-3 py-1 text-xs font-semibold">
                      <span
                        className="h-2 w-2 rounded-chip"
                        style={{ background: scenario.accent }}
                      />
                      专属 · {scenario.specificResource.label}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="relative flex flex-col gap-10 py-10 sm:gap-12 sm:py-12">
        <HomeStats />
        <ScenarioGrid scenarios={scenarios} />
        <KnowledgeTip />
      </div>
    </main>
  );
}
