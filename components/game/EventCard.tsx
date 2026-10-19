"use client";

import {
  faChevronDown,
  faChevronUp,
  faDice,
  faLightbulb,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useId, useState } from "react";

import { DeltaChip, describeDelta } from "@/components/game/resource-chips";
import { getKnowledgeCard } from "@/data/knowledge";
import { getIconByName } from "@/lib/icons";
import type { Choice, GameEvent, KnowledgeCard, Scenario } from "@/lib/types";

const CHOICE_LETTERS = ["A", "B", "C"] as const;

/** 选项下方的效果预览：风险选项额外展示成功率与成功 / 失败分支。 */
function ChoicePreview({
  choice,
  scenario,
}: {
  choice: Choice;
  scenario: Scenario;
}) {
  if (choice.risk) {
    const { probability, successEffects, failureEffects } = choice.risk;
    const successChips = describeDelta(
      successEffects,
      choice.risk.successSpecificEffect,
      scenario,
    );
    const failureChips = describeDelta(
      failureEffects,
      choice.risk.failureSpecificEffect,
      scenario,
    );

    return (
      <span className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-chip border border-sun bg-sun/25 px-2 py-0.5 text-xs font-bold text-ink">
          <FontAwesomeIcon icon={faDice} aria-hidden className="h-3 w-3" />
          成功率 {probability}%
        </span>
        {successChips.map((chip) => (
          <DeltaChip key={`success-${chip.key}`} chip={chip} prefix="成功" />
        ))}
        {failureChips.map((chip) => (
          <DeltaChip key={`failure-${chip.key}`} chip={chip} prefix="失败" />
        ))}
      </span>
    );
  }

  const chips = describeDelta(choice.effects, choice.specificEffect, scenario);

  return (
    <span className="mt-2 flex flex-wrap items-center gap-1.5">
      {chips.length > 0 ? (
        chips.map((chip) => <DeltaChip key={chip.key} chip={chip} />)
      ) : (
        <span className="inline-flex items-center rounded-chip border border-ink/15 bg-paper px-2 py-0.5 text-xs font-semibold text-ink-soft">
          无直接资源变化
        </span>
      )}
    </span>
  );
}

export interface EventCardProps {
  scenario: Scenario;
  event: GameEvent;
  /** 场景自带的知识卡；查不到时回退到全局注册表。 */
  knowledge?: readonly KnowledgeCard[];
  /** 点击选项；结算面板打开期间由 `disabled` 拦截重复选择。 */
  onSelect?: (choice: Choice) => void;
  disabled?: boolean;
}

/**
 * 当前回合的事件卡。
 *
 * 插画区只用场景渐变 + 图标 + CSS 形状（不使用照片）；「冷知识」默认收起，
 * 关联的知识卡内容来自场景内容或全局知识卡注册表。
 */
export function EventCard({
  scenario,
  event,
  knowledge,
  onSelect,
  disabled = false,
}: EventCardProps) {
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);
  const titleId = useId();
  const knowledgePanelId = useId();

  const knowledgeCard = event.knowledgeId
    ? ((knowledge ?? []).find((card) => card.id === event.knowledgeId) ??
      getKnowledgeCard(event.knowledgeId))
    : undefined;

  return (
    <article
      aria-labelledby={titleId}
      className="mt-4 overflow-hidden rounded-card border-2 border-ink bg-surface shadow-card"
    >
      {/* 插画区：渐变 + 场景图标 + CSS 形状 */}
      <div
        className="relative h-36 overflow-hidden sm:h-44"
        style={{ background: `var(--gradient-${scenario.id})` }}
      >
        <span
          aria-hidden
          className="absolute -left-10 -top-12 h-36 w-36 rounded-full border-[12px] border-paper/25"
        />
        <span
          aria-hidden
          className="absolute right-6 top-5 h-16 w-16 rotate-12 rounded-small border-8 border-paper/20"
        />
        <span
          aria-hidden
          className="absolute -bottom-8 right-1/4 h-24 w-24 rounded-full bg-paper/10"
        />
        <FontAwesomeIcon
          icon={getIconByName(scenario.icon)}
          aria-hidden
          className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 text-paper/70 sm:h-24 sm:w-24"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-ink/60 via-ink/10 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
          <span className="rounded-chip border-2 border-ink bg-sun px-3 py-1 text-xs font-bold tracking-[0.12em] text-ink">
            {event.act}
          </span>
          <span className="font-numeric text-xs font-bold tracking-[0.22em] text-paper/90">
            {scenario.title}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <h2 id={titleId} className="font-display text-2xl text-ink sm:text-3xl">
          {event.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base">
          {event.body}
        </p>

        {/* 可折叠冷知识，默认收起 */}
        <div className="mt-4 rounded-small border-2 border-ink/10 bg-paper/70">
          <button
            type="button"
            aria-expanded={knowledgeOpen}
            aria-controls={knowledgePanelId}
            onClick={() => setKnowledgeOpen((open) => !open)}
            className="flex min-h-11 w-full items-center gap-2 rounded-small px-3 text-left text-sm font-semibold text-ink"
          >
            <FontAwesomeIcon
              icon={faLightbulb}
              aria-hidden
              className="h-4 w-4 text-sun"
            />
            冷知识
            <FontAwesomeIcon
              icon={knowledgeOpen ? faChevronUp : faChevronDown}
              aria-hidden
              className="ml-auto h-3.5 w-3.5 text-ink-soft"
            />
          </button>
          <div
            id={knowledgePanelId}
            hidden={!knowledgeOpen}
            className="border-t-2 border-ink/10 px-3 py-3 text-sm leading-relaxed text-ink-soft"
          >
            {knowledgeCard ? (
              <>
                <p className="font-semibold text-ink">{knowledgeCard.title}</p>
                <p className="mt-1">{knowledgeCard.content}</p>
              </>
            ) : (
              <p>这张事件卡还没有收录知识词条。</p>
            )}
          </div>
        </div>

        <ol aria-label="可选行动" className="mt-5 grid gap-3">
          {event.choices.map((choice, index) => (
            <li key={choice.id}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect?.(choice)}
                className="flex min-h-11 w-full items-start gap-3 rounded-button border-2 border-ink bg-surface p-3 text-left shadow-button transition-transform duration-[var(--duration-fast)] ease-[var(--ease-cartoon)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_var(--ink)] disabled:pointer-events-none disabled:opacity-55 sm:p-4"
              >
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-chip border-2 border-ink bg-paper font-numeric text-sm font-bold text-ink"
                >
                  {CHOICE_LETTERS[index]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold leading-relaxed text-ink sm:text-base">
                    {choice.label}
                  </span>
                  <ChoicePreview choice={choice} scenario={scenario} />
                </span>
              </button>
            </li>
          ))}
        </ol>

        {!disabled && (
          <p className="mt-4 text-center text-xs font-semibold text-ink-soft">
            按{" "}
            <kbd className="rounded border border-ink/20 bg-paper px-1.5 py-0.5 font-numeric text-ink">
              1
            </kbd>{" "}
            /{" "}
            <kbd className="rounded border border-ink/20 bg-paper px-1.5 py-0.5 font-numeric text-ink">
              2
            </kbd>{" "}
            /{" "}
            <kbd className="rounded border border-ink/20 bg-paper px-1.5 py-0.5 font-numeric text-ink">
              3
            </kbd>{" "}
            选择
          </p>
        )}
      </div>
    </article>
  );
}
