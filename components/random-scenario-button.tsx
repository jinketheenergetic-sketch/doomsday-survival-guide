"use client";

import { faShuffle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";

import { SCENARIO_IDS } from "@/lib/types";

/** Hero 主 CTA：每次点击随机挑一个场景进入简报页。 */
export function RandomScenarioButton() {
  const router = useRouter();

  function startRandomScenario() {
    const index = Math.floor(Math.random() * SCENARIO_IDS.length);
    router.push(`/scenario/${SCENARIO_IDS[index]}`);
  }

  return (
    <button
      type="button"
      onClick={startRandomScenario}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-button border-2 border-ink bg-coral px-6 font-semibold text-ink shadow-button transition-transform duration-[var(--duration-fast)] ease-[var(--ease-cartoon)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_var(--ink)]"
    >
      <FontAwesomeIcon icon={faShuffle} aria-hidden />
      随机灾变
    </button>
  );
}
