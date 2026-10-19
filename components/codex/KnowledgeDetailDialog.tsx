"use client";

import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef } from "react";

import { scenarioById } from "@/data/scenarios";
import { getIconByName } from "@/lib/icons";
import type { KnowledgeCard } from "@/lib/types";

interface KnowledgeDetailDialogProps {
  card: KnowledgeCard;
  onClose: () => void;
}

/** 已解锁知识卡的详情弹层；Esc 与点击遮罩都会关闭。 */
export function KnowledgeDetailDialog({
  card,
  onClose,
}: KnowledgeDetailDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const scenario = scenarioById[card.scenarioId];
  const titleId = `knowledge-dialog-title-${card.id}`;

  // 打开后把焦点交给关闭按钮，键盘用户不会继续 tab 到背景网格。
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        tabIndex={-1}
        aria-label="关闭知识卡详情"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/65 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="sheet-rise relative flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-card border-2 border-ink bg-surface shadow-card sm:rounded-card"
      >
        <header
          className="relative p-5 pr-16 sm:p-6 sm:pr-20"
          style={{ background: `var(--gradient-${scenario.id})` }}
        >
          <span className="inline-flex min-h-7 items-center gap-1.5 rounded-chip border-2 border-paper/50 bg-ink/30 px-2.5 text-xs font-semibold text-paper">
            <span
              aria-hidden
              className="h-2 w-2 rounded-chip"
              style={{ background: scenario.accent }}
            />
            {scenario.title}
          </span>

          <div className="mt-3 flex items-center gap-3 text-paper">
            <span
              aria-hidden
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-chip border-2 border-paper/60 bg-paper/15"
            >
              <FontAwesomeIcon
                icon={getIconByName(card.icon)}
                className="h-4 w-4"
              />
            </span>
            <h2
              id={titleId}
              className="font-display text-2xl leading-snug"
            >
              {card.title}
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            aria-label="关闭知识卡详情"
            onClick={onClose}
            className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-chip border-2 border-ink bg-paper text-ink shadow-button transition-transform duration-[var(--duration-fast)] ease-[var(--ease-cartoon)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_var(--ink)]"
          >
            <FontAwesomeIcon icon={faXmark} aria-hidden />
          </button>
        </header>

        <div className="overflow-y-auto p-5 sm:p-6">
          <p className="whitespace-pre-line text-base leading-relaxed text-ink">
            {card.content}
          </p>
          <p className="mt-4 rounded-small border-2 border-ink/10 bg-paper/70 px-4 py-3 text-xs leading-relaxed text-ink-soft">
            知识是真的，灾难不是。现场情况千变万化，生死关头优先听从当地救援与专业指引。
          </p>
        </div>
      </div>
    </div>
  );
}
