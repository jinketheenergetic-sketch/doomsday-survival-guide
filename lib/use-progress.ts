"use client";

import { useSyncExternalStore } from "react";

import { createDefaultProgress, storageAdapter } from "@/lib/storage";
import type { Progress } from "@/lib/types";

/**
 * 读取本地进度的客户端 hook。
 *
 * 服务端快照固定为空进度，客户端挂载后再切到真实存档，避免 hydration 不一致。
 * `getSnapshot` 会把读到的进度缓存到内容不变为止，保证 useSyncExternalStore
 * 拿到稳定引用（适配器每次都会返回新对象）。
 */

const EMPTY_PROGRESS = createDefaultProgress();

function subscribe(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
}

let cachedJson = JSON.stringify(EMPTY_PROGRESS);
let cachedProgress: Progress = EMPTY_PROGRESS;

function getSnapshot(): Progress {
  const progress = storageAdapter.getProgress();
  const json = JSON.stringify(progress);
  if (json !== cachedJson) {
    cachedJson = json;
    cachedProgress = progress;
  }
  return cachedProgress;
}

function getServerSnapshot(): Progress {
  return EMPTY_PROGRESS;
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
