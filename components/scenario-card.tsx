"use client";

import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { faArrowRight, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { getIconByName } from "@/lib/icons";
import type { Scenario } from "@/lib/types";

interface ScenarioCardProps {
  scenario: Scenario;
  index: number;
  bestStars: number;
}

/** 首页场景卡：封面、编号、星级、标题、tagline 与专属资源。 */
export function ScenarioCard({
  scenario,
  index,
  bestStars,
}: ScenarioCardProps) {
  const [coverFailed, setCoverFailed] = useState(false);
  const gradient = `var(--gradient-${scenario.id})`;

  return (
    <Link
      href={`/scenario/${scenario.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-card border-2 border-ink bg-surface shadow-card transition-[transform,box-shadow] duration-[var(--duration-normal)] ease-[var(--ease-cartoon)] hover:-translate-y-1.5 hover:-rotate-[0.5deg] hover:shadow-[0_24px_50px_-20px_rgba(25,26,46,0.55),0_6px_0_rgba(25,26,46,0.9)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b-2 border-ink/10">
        {/* 渐变 + 图标兜底：封面加载失败时也不会出现破图。 */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: gradient }}
        />
        <FontAwesomeIcon
          icon={getIconByName(scenario.icon)}
          aria-hidden
          className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 text-paper/70"
        />

        {!coverFailed ? (
          <Image
            src={scenario.cover}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            onError={() => setCoverFailed(true)}
            className="object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-cartoon)] group-hover:scale-[1.04]"
          />
        ) : null}

        {/* 双色调处理 */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-45 mix-blend-multiply"
          style={{ background: gradient }}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-ink/55 via-transparent to-transparent"
        />

        <span className="absolute left-3 top-3 inline-flex min-h-8 items-center rounded-chip border-2 border-ink bg-paper/95 px-2.5 font-numeric text-xs font-bold text-ink">
          #{String(index + 1).padStart(2, "0")}
        </span>

        <span className="absolute right-3 top-3 inline-flex items-center gap-0.5 rounded-chip border-2 border-ink bg-paper/95 px-2 py-1">
          <span className="sr-only">历史最佳 {bestStars} 星，共 3 星</span>
          {[1, 2, 3].map((slot) => (
            <FontAwesomeIcon
              key={slot}
              icon={slot <= bestStars ? faStar : faStarRegular}
              aria-hidden
              className={`h-3.5 w-3.5 ${
                slot <= bestStars ? "text-sun" : "text-ink/25"
              }`}
            />
          ))}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-display text-xl leading-snug text-ink">
          {scenario.title}
        </h3>
        <p className="text-sm leading-relaxed text-ink-soft">
          {scenario.tagline}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="inline-flex min-w-0 items-center gap-1.5 rounded-chip border border-ink/15 bg-paper px-2.5 py-1 text-xs font-semibold text-ink-soft">
            <span
              aria-hidden
              className="h-2 w-2 shrink-0 rounded-chip"
              style={{ background: scenario.accent }}
            />
            <span className="truncate">
              专属 · {scenario.specificResource.label}
            </span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-coral">
            进入
            <FontAwesomeIcon
              icon={faArrowRight}
              aria-hidden
              className="transition-transform duration-[var(--duration-fast)] group-hover:translate-x-1"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
