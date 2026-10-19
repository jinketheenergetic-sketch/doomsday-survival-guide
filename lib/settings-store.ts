"use client";

import { useSyncExternalStore } from "react";

import { createDefaultSettings, storageAdapter } from "@/lib/storage";
import type { Settings } from "@/lib/types";

/**
 * 玩家设置的客户端存储订阅。
 *
 * 与 `useProgress` 同一套 `useSyncExternalStore` 模式：服务端快照固定为默认值，
 * 客户端读取 `StorageAdapter`。同标签页内的修改通过 `updateSettings` /
 * `resetAllData` 主动通知，跨标签页则依赖 `storage` 事件。
 */

const SERVER_SETTINGS: Settings = createDefaultSettings();

const listeners = new Set<() => void>();

let cachedSettings: Settings = SERVER_SETTINGS;
let cachedJson = JSON.stringify(SERVER_SETTINGS);

function readSettings(): Settings {
  const settings = storageAdapter.getSettings();
  const json = JSON.stringify(settings);
  if (json !== cachedJson) {
    cachedJson = json;
    cachedSettings = settings;
  }
  return cachedSettings;
}

function getServerSettings(): Settings {
  return SERVER_SETTINGS;
}

function notify(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", listener);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", listener);
    }
  };
}

/** 读取当前设置；服务端渲染阶段返回默认值。 */
export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, readSettings, getServerSettings);
}

/** 合并写入设置并通知订阅者。 */
export function updateSettings(patch: Partial<Settings>): Settings {
  const next = { ...storageAdapter.getSettings(), ...patch };
  storageAdapter.saveSettings(next);
  cachedJson = "";
  notify();
  return next;
}

/**
 * 清除所有 `dpsg:v1:*` 数据并通知全部客户端存储订阅者。
 *
 * `storage` 事件不会在同标签页触发，这里主动派发一次，让进度、结算等
 * 订阅方重新读取被清空后的存档。
 */
export function resetAllData(): void {
  storageAdapter.resetAll();
  cachedJson = "";
  notify();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"));
  }
}
