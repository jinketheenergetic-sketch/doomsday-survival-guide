"use client";

import { faArrowRight, faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useMemo } from "react";

import { getKnowledgeCard } from "@/data/knowledge";
import { getIconByName } from "@/lib/icons";
import type { KnowledgeCard } from "@/lib/types";
import { useProgress } from "@/lib/use-progress";

/** 用解锁集合的哈希挑一条卡，避免在渲染期间调用 Math.random（React 纯度规则）。 */
function pickIndex(ids: readonly string[], length: number): number {
  let hash = 0;
  for (const id of ids) {
    for (let index = 0; index < id.length; index += 1) {
      hash = (hash * 31 + id.charCodeAt(index)) | 0;
    }
  }
  return Math.abs(hash) % length;
}

/** 首页底部小贴士：从已解锁知识卡中挑一张展示，点击进入生存手册。 */
export function KnowledgeTip() {
  const progress = useProgress();
  const unlockedIds = progress.unlockedKnowledgeIds;

  const card = useMemo<KnowledgeCard | undefined>(() => {
    const available = unlockedIds
      .map((id) => getKnowledgeCard(id))
      .filter((item): item is KnowledgeCard => item !== undefined);
    if (available.length === 0) return undefined;
    return available[pickIndex(unlockedIds, available.length)];
  }, [unlockedIds]);

  return (
    <section
      aria-label="知识小贴士"
      className="mx-auto w-full max-w-6xl px-4 sm:px-6"
    >
      <Link
        href="/codex"
        className="group flex min-h-16 items-center gap-4 rounded-card border-2 border-ink bg-surface px-4 py-3 shadow-card transition-transform duration-[var(--duration-fast)] ease-[var(--ease-cartoon)] hover:-translate-y-1 sm:px-6"
      >
        <span
          aria-hidden
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-chip border-2 border-ink text-paper shadow-button"
          style={{
            background:
              "linear-gradient(135deg, var(--teal) 0%, #2563eb 100%)",
          }}
        >
          <FontAwesomeIcon
            icon={card ? getIconByName(card.icon) : faLightbulb}
            className="h-5 w-5"
          />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold tracking-[0.16em] text-ink-soft">
            生存手册 · 随机一页
          </span>
          <span className="block truncate font-semibold text-ink">
            {card
              ? card.title
              : "还没有解锁知识卡，先去活过第一天"}
          </span>
        </span>

        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-coral">
          翻开手册
          <FontAwesomeIcon
            icon={faArrowRight}
            aria-hidden
            className="transition-transform duration-[var(--duration-fast)] group-hover:translate-x-1"
          />
        </span>
      </Link>
    </section>
  );
}
