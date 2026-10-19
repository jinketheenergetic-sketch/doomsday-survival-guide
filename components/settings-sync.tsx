"use client";

import { useEffect } from "react";

import { useSettings } from "@/lib/settings-store";

/**
 * 把「减少动效」设置映射到根元素的 `data-reduced-motion` 属性，
 * 让 `globals.css` 与系统 `prefers-reduced-motion` 用同一套规则关闭动画。
 */
export function SettingsSync() {
  const { reducedMotion } = useSettings();

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = reducedMotion
      ? "true"
      : "false";
  }, [reducedMotion]);

  return null;
}
