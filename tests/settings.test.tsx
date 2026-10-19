import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SettingsDialog } from "@/components/settings-dialog";
import { SettingsSync } from "@/components/settings-sync";
import { resetAllData } from "@/lib/settings-store";
import { playSound, SOUND_NAMES } from "@/lib/sound";
import {
  createDefaultProgress,
  storageAdapter,
  STORAGE_KEYS,
} from "@/lib/storage";

beforeEach(() => {
  window.localStorage.clear();
  resetAllData();
});

afterEach(() => {
  delete document.documentElement.dataset.reducedMotion;
});

describe("SettingsDialog", () => {
  it("默认关闭音效，切换后立即持久化", () => {
    render(<SettingsDialog onClose={vi.fn()} />);

    const sound = screen.getByRole("switch", { name: "音效" });
    expect(sound).toHaveAttribute("aria-checked", "false");

    fireEvent.click(sound);

    expect(sound).toHaveAttribute("aria-checked", "true");
    expect(storageAdapter.getSettings().soundEnabled).toBe(true);
  });

  it("减少动效开关写入设置并同步到根元素", () => {
    render(
      <>
        <SettingsSync />
        <SettingsDialog onClose={vi.fn()} />
      </>,
    );

    fireEvent.click(screen.getByRole("switch", { name: "减少动效" }));

    expect(storageAdapter.getSettings().reducedMotion).toBe(true);
    expect(document.documentElement.dataset.reducedMotion).toBe("true");
  });

  it("重置全部进度需要二次确认，且不触碰其他前缀的数据", () => {
    storageAdapter.saveProgress(createDefaultProgress());
    window.localStorage.setItem("other-app:key", "keep");

    render(<SettingsDialog onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "重置全部进度" }));

    expect(screen.getByText("确定要清除全部进度吗？")).toBeInTheDocument();
    expect(window.localStorage.getItem(STORAGE_KEYS.progress)).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "确认重置" }));

    expect(window.localStorage.getItem(STORAGE_KEYS.progress)).toBeNull();
    expect(window.localStorage.getItem("other-app:key")).toBe("keep");
    expect(screen.getByRole("status")).toHaveTextContent("已清除全部本地进度。");
  });

  it("Esc 关闭弹层", () => {
    const onClose = vi.fn();
    render(<SettingsDialog onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("合成音效", () => {
  it("提供六种具名短音，默认关闭且无 AudioContext 时静默跳过", () => {
    expect(SOUND_NAMES).toEqual([
      "click",
      "good",
      "bad",
      "unlock",
      "star",
      "ending",
    ]);

    expect(() => playSound("click")).not.toThrow();

    storageAdapter.saveSettings({ soundEnabled: true, reducedMotion: false });
    for (const name of SOUND_NAMES) {
      expect(() => playSound(name)).not.toThrow();
    }
  });
});
