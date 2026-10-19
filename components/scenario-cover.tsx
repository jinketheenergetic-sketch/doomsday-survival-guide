"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useState } from "react";

import { getIconByName } from "@/lib/icons";
import type { Scenario } from "@/lib/types";

interface ScenarioCoverProps {
  scenario: Scenario;
  /** 首屏封面可传 true 以优先加载。 */
  priority?: boolean;
  className?: string;
}

/**
 * 场景双色调封面。
 * 渐变 + 大图标永远垫在照片下面，照片加载失败时直接卸载，避免出现破图。
 */
export function ScenarioCover({
  scenario,
  priority = false,
  className = "",
}: ScenarioCoverProps) {
  const [coverFailed, setCoverFailed] = useState(false);
  const gradient = `var(--gradient-${scenario.id})`;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: gradient }}
      />
      <FontAwesomeIcon
        icon={getIconByName(scenario.icon)}
        aria-hidden
        className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 text-paper/60"
      />

      {!coverFailed ? (
        <Image
          src={scenario.cover}
          alt={`${scenario.title}场景封面`}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 1024px, 100vw"
          onError={() => setCoverFailed(true)}
          className="object-cover"
        />
      ) : null}

      {/* 双色调处理 */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-50 mix-blend-multiply"
        style={{ background: gradient }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/30 to-transparent"
      />
    </div>
  );
}
