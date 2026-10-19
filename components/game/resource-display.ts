import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBolt,
  faBrain,
  faDroplet,
  faHeartPulse,
  faUtensils,
} from "@fortawesome/free-solid-svg-icons";

import type { ResourceKey } from "@/lib/types";

/** 5 项通用资源的展示信息，供 HUD 与事件卡共用（顺序与 `RESOURCE_KEYS` 一致）。 */
export interface CommonResourceDisplay {
  key: ResourceKey;
  label: string;
  icon: IconDefinition;
  color: string;
}

export const COMMON_RESOURCES: readonly CommonResourceDisplay[] = [
  { key: "hp", label: "生命", icon: faHeartPulse, color: "var(--danger)" },
  { key: "sanity", label: "理智", icon: faBrain, color: "var(--scene-ai-from)" },
  { key: "water", label: "饮水", icon: faDroplet, color: "var(--scene-flood-from)" },
  { key: "food", label: "食物", icon: faUtensils, color: "var(--sun)" },
  { key: "energy", label: "体力", icon: faBolt, color: "var(--coral)" },
];
