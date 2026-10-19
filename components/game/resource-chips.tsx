"use client";

import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { COMMON_RESOURCES } from "@/components/game/resource-display";
import { getIconByName } from "@/lib/icons";
import type { ResourceDelta, Scenario } from "@/lib/types";

/** 一枚资源变化 chip 的展示数据。 */
export interface DeltaChipView {
  key: string;
  label: string;
  delta: number;
  icon: IconDefinition;
}

/**
 * 把资源变化整理成 chip（0 值不展示）。
 * 传入选项声明效果用于预览，传入 `ChoiceResolution.result` 则展示实际变化。
 */
export function describeDelta(
  effects: ResourceDelta | undefined,
  specificEffect: number | undefined,
  scenario: Scenario,
): DeltaChipView[] {
  const chips: DeltaChipView[] = [];

  for (const resource of COMMON_RESOURCES) {
    const delta = effects?.[resource.key] ?? 0;
    if (delta !== 0) {
      chips.push({
        key: resource.key,
        label: resource.label,
        delta,
        icon: resource.icon,
      });
    }
  }

  if (specificEffect) {
    chips.push({
      key: scenario.specificResource.key,
      label: scenario.specificResource.label,
      delta: specificEffect,
      icon: getIconByName(scenario.icon),
    });
  }

  return chips;
}

/** 正向变化用绿色、负向用红色；`prefix` 用于风险分支的「成功·/失败·」。 */
export function DeltaChip({
  chip,
  prefix,
}: {
  chip: DeltaChipView;
  prefix?: string;
}) {
  const positive = chip.delta > 0;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-chip border px-2 py-0.5 text-xs font-semibold ${
        positive
          ? "border-success/35 bg-success/10 text-success"
          : "border-danger/35 bg-danger/10 text-danger"
      }`}
    >
      <FontAwesomeIcon icon={chip.icon} aria-hidden className="h-3 w-3" />
      {prefix ? `${prefix}·` : ""}
      {chip.label} {positive ? "+" : ""}
      {chip.delta}
    </span>
  );
}
