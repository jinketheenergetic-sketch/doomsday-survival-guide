import { beforeEach, describe, expect, it } from "vitest";

import {
  createDefaultProgress,
  createDefaultSettings,
  createStorageAdapter,
  storageAdapter,
  STORAGE_KEYS,
  STORAGE_PREFIX,
  STORAGE_VERSION,
  type StorageBackend,
} from "@/lib/storage";
import type { LastResult, Progress, RunState } from "@/lib/types";

const progressFixture: Progress = {
  ...createDefaultProgress(),
  scenarios: {
    ...createDefaultProgress().scenarios,
    flood: { bestScore: 820, bestStars: 3, endingIds: ["flood-best"], runs: 4 },
  },
  unlockedKnowledgeIds: ["flood-k1", "flood-k2"],
  unlockedEndingIds: ["flood-best"],
  totalRuns: 9,
  totalSurvivedDays: 41,
  bestScore: 940,
};

const runFixture: RunState = {
  scenarioId: "flood",
  seed: 20261019,
  day: 3,
  deck: ["e1", "e2", "e3", "e4", "e5", "e6", "e7"],
  eventIndex: 2,
  resources: { hp: 80, sanity: 70, water: 60, food: 50, energy: 40 },
  specificResource: 55,
  status: "playing",
  history: [],
  goodCount: 1,
  badCount: 1,
  startedAt: "2026-10-19T00:00:00.000Z",
};

const lastResultFixture: LastResult = {
  scenarioId: "flood",
  seed: 20261019,
  endingId: "flood-best",
  score: 830,
  stars: 3,
  daysSurvived: 7,
  goodCount: 5,
  badCount: 2,
  resources: { hp: 55, sanity: 60, water: 45, food: 40, energy: 35 },
  specificResource: 48,
  history: [],
  newKnowledgeIds: ["flood-k3"],
  finishedAt: "2026-10-19T01:00:00.000Z",
};

beforeEach(() => {
  window.localStorage.clear();
});

describe("StorageAdapter 默认值", () => {
  it("没有存档时返回默认进度、默认设置与空结果", () => {
    expect(storageAdapter.getProgress()).toEqual(createDefaultProgress());
    expect(storageAdapter.getSettings()).toEqual(createDefaultSettings());
    expect(storageAdapter.getActiveRun()).toBeNull();
    expect(storageAdapter.getLastResult()).toBeNull();
  });

  it("默认设置关闭音效、不减少动效", () => {
    expect(createDefaultSettings()).toEqual({
      soundEnabled: false,
      reducedMotion: false,
    });
  });
});

describe("StorageAdapter 读写", () => {
  it("进度可写入并原样读回", () => {
    storageAdapter.saveProgress(progressFixture);
    expect(storageAdapter.getProgress()).toEqual(progressFixture);
  });

  it("设置可写入并原样读回", () => {
    const settings = { soundEnabled: true, reducedMotion: true };
    storageAdapter.saveSettings(settings);
    expect(storageAdapter.getSettings()).toEqual(settings);
  });

  it("当前局可写入、读回并清除", () => {
    storageAdapter.saveActiveRun(runFixture);
    expect(storageAdapter.getActiveRun()).toEqual(runFixture);

    storageAdapter.clearActiveRun();
    expect(storageAdapter.getActiveRun()).toBeNull();
  });

  it("上一局结果可写入、读回并清除", () => {
    storageAdapter.saveLastResult(lastResultFixture);
    expect(storageAdapter.getLastResult()).toEqual(lastResultFixture);

    storageAdapter.clearLastResult();
    expect(storageAdapter.getLastResult()).toBeNull();
  });

  it("写入的数据带版本信封并落在约定的 key 上", () => {
    storageAdapter.saveProgress(progressFixture);
    storageAdapter.saveSettings(createDefaultSettings());
    storageAdapter.saveActiveRun(runFixture);
    storageAdapter.saveLastResult(lastResultFixture);

    for (const key of Object.values(STORAGE_KEYS)) {
      const raw = window.localStorage.getItem(key);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw ?? "null") as {
        version?: number;
        data?: unknown;
      };
      expect(parsed.version).toBe(STORAGE_VERSION);
      expect(parsed.data).toBeTruthy();
    }
  });
});

describe("StorageAdapter 损坏数据", () => {
  it("损坏 JSON 自动回退默认值且不抛异常", () => {
    for (const key of Object.values(STORAGE_KEYS)) {
      window.localStorage.setItem(key, "{not-json");
    }

    expect(() => storageAdapter.getProgress()).not.toThrow();
    expect(storageAdapter.getProgress()).toEqual(createDefaultProgress());
    expect(storageAdapter.getSettings()).toEqual(createDefaultSettings());
    expect(storageAdapter.getActiveRun()).toBeNull();
    expect(storageAdapter.getLastResult()).toBeNull();
  });

  it("版本不符或结构错误时回退默认值", () => {
    window.localStorage.setItem(
      STORAGE_KEYS.progress,
      JSON.stringify({ version: 99, data: progressFixture }),
    );
    window.localStorage.setItem(
      STORAGE_KEYS.settings,
      JSON.stringify({ version: STORAGE_VERSION, data: "wrong-shape" }),
    );
    window.localStorage.setItem(
      STORAGE_KEYS.activeRun,
      JSON.stringify({ version: STORAGE_VERSION, data: { scenarioId: "nope" } }),
    );

    expect(storageAdapter.getProgress()).toEqual(createDefaultProgress());
    expect(storageAdapter.getSettings()).toEqual(createDefaultSettings());
    expect(storageAdapter.getActiveRun()).toBeNull();
  });

  it("字段缺失时用默认值补齐", () => {
    window.localStorage.setItem(
      STORAGE_KEYS.settings,
      JSON.stringify({
        version: STORAGE_VERSION,
        data: { soundEnabled: true },
      }),
    );
    window.localStorage.setItem(
      STORAGE_KEYS.progress,
      JSON.stringify({
        version: STORAGE_VERSION,
        data: { totalRuns: 3, scenarios: { flood: { runs: 2 } } },
      }),
    );

    expect(storageAdapter.getSettings()).toEqual({
      soundEnabled: true,
      reducedMotion: false,
    });

    const progress = storageAdapter.getProgress();
    expect(progress.totalRuns).toBe(3);
    expect(progress.totalSurvivedDays).toBe(0);
    expect(progress.scenarios.flood).toEqual({
      bestScore: 0,
      bestStars: 0,
      endingIds: [],
      runs: 2,
    });
    expect(progress.scenarios.quake).toEqual(
      createDefaultProgress().scenarios.quake,
    );
  });
});

describe("StorageAdapter resetAll", () => {
  it("只清除 dpsg:v1:* 前缀，不影响其他数据", () => {
    storageAdapter.saveProgress(progressFixture);
    storageAdapter.saveSettings(createDefaultSettings());
    storageAdapter.saveActiveRun(runFixture);
    storageAdapter.saveLastResult(lastResultFixture);
    window.localStorage.setItem("dpsg:v2:progress", "future");
    window.localStorage.setItem("other-app:key", "keep-me");

    storageAdapter.resetAll();

    for (const key of Object.values(STORAGE_KEYS)) {
      expect(window.localStorage.getItem(key)).toBeNull();
    }
    expect(window.localStorage.getItem("dpsg:v2:progress")).toBe("future");
    expect(window.localStorage.getItem("other-app:key")).toBe("keep-me");
    expect(STORAGE_PREFIX).toBe("dpsg:v1:");
  });
});

describe("StorageAdapter 后端解耦", () => {
  it("可以通过自定义后端读写，不依赖 localStorage", () => {
    const memory = new Map<string, string>();
    const backend: StorageBackend = {
      getItem: (key) => memory.get(key) ?? null,
      setItem: (key, value) => {
        memory.set(key, value);
      },
      removeItem: (key) => {
        memory.delete(key);
      },
      key: (index) => [...memory.keys()][index] ?? null,
      get length() {
        return memory.size;
      },
    };
    const adapter = createStorageAdapter(backend);

    adapter.saveProgress(progressFixture);
    expect(adapter.getProgress()).toEqual(progressFixture);
    expect(memory.has(STORAGE_KEYS.progress)).toBe(true);

    adapter.resetAll();
    expect(memory.size).toBe(0);
  });
});
