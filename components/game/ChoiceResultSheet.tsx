"use client";

import {
  faArrowRight,
  faCheck,
  faLightbulb,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useId } from "react";

import { DeltaChip, describeDelta } from "@/components/game/resource-chips";
import { getKnowledgeCard } from "@/data/knowledge";
import type {
  ChoiceResult,
  KnowledgeCard,
  Scenario,
} from "@/lib/types";

export interface ChoiceResultSheetProps {
  scenario: Scenario;
  /** 本次选择的实际结算记录（钳制后的资源变化）。 */
  result: ChoiceResult;
  /** 场景自带的知识卡；查不到时回退到全局注册表。 */
  knowledge?: readonly KnowledgeCard[];
  /** 最后一个回合或已死亡，点「继续」进入结算页。 */
  final: boolean;
  onContinue: () => void;
}

/**
 * 选择结果底部弹层。
 *
 * 展示结果文案、实际资源变化 chip 与一条知识贴士；弹层期间事件卡的所有选项
 * 由父组件禁用。按钮文案固定为「继续」，最终回合时提示将进入结算页。
 */
export function ChoiceResultSheet({
  scenario,
  result,
  knowledge,
  final,
  onContinue,
}: ChoiceResultSheetProps) {
  const titleId = useId();
  const chips = describeDelta(
    result.resourceDelta,
    result.specificDelta,
    scenario,
  );

  const knowledgeCard = result.knowledgeId
    ? ((knowledge ?? []).find((card) => card.id === result.knowledgeId) ??
      getKnowledgeCard(result.knowledgeId))
    : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 sm:px-4"
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="sheet-rise max-h-[85dvh] w-full max-w-2xl overflow-y-auto rounded-t-card border-2 border-b-0 border-ink bg-surface p-5 shadow-card sm:mb-6 sm:rounded-card sm:border-b-2 sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-ink-soft">
              第 {result.day} 天 · 选择结果
            </p>
            <h2 id={titleId} className="mt-1 font-display text-2xl text-ink">
              {result.text || "你做出了选择。"}
            </h2>
          </div>

          {result.riskSucceeded !== undefined && (
            <span
              className={`inline-flex shrink-0 items-center gap-1 rounded-chip border-2 px-3 py-1 text-xs font-bold ${
                result.riskSucceeded
                  ? "border-success bg-success/15 text-success"
                  : "border-danger bg-danger/15 text-danger"
              }`}
            >
              <FontAwesomeIcon
                icon={result.riskSucceeded ? faCheck : faTriangleExclamation}
                aria-hidden
                className="h-3.5 w-3.5"
              />
              {result.riskSucceeded ? "赌赢了" : "赌输了"}
            </span>
          )}
        </div>

        {chips.length > 0 ? (
          <ul aria-label="资源变化" className="mt-4 flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <li key={chip.key}>
                <DeltaChip chip={chip} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm font-semibold text-ink-soft">
            这次资源没有变化。
          </p>
        )}

        <div className="mt-4 rounded-small border-2 border-ink/10 bg-paper/70 p-3">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.14em] text-ink-soft">
            <FontAwesomeIcon
              icon={faLightbulb}
              aria-hidden
              className="h-4 w-4 text-sun"
            />
            知识贴士
          </p>
          {knowledgeCard ? (
            <>
              <p className="mt-1 text-sm font-semibold text-ink">
                {knowledgeCard.title}
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">
                {knowledgeCard.content}
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              这条生存知识还在收录中，先记住这次的经验。
            </p>
          )}
        </div>

        <button
          type="button"
          autoFocus
          onClick={onContinue}
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-button border-2 border-ink bg-sun px-4 font-semibold text-ink shadow-button transition-transform duration-[var(--duration-fast)] ease-[var(--ease-cartoon)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_var(--ink)]"
        >
          继续
          <FontAwesomeIcon icon={faArrowRight} aria-hidden className="h-3.5 w-3.5" />
        </button>

        {final && (
          <p className="mt-2 text-center text-xs font-semibold text-ink-soft">
            这是本局的最后一步，继续后查看结算。
          </p>
        )}
      </section>
    </div>
  );
}
