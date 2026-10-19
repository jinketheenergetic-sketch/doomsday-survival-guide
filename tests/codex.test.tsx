import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CodexScreen } from "@/components/codex/CodexScreen";
import { createDefaultProgress, storageAdapter } from "@/lib/storage";

const search = vi.hoisted(() => ({ current: new URLSearchParams() }));

// 图鉴的筛选条件来自 URL；测试里用一个可替换的 searchParams 替身。
vi.mock("next/navigation", () => ({
  useSearchParams: () => search.current,
}));

beforeEach(() => {
  window.localStorage.clear();
  search.current = new URLSearchParams();
});

describe("CodexScreen", () => {
  it("renders all 42 cards as locked when nothing is unlocked", () => {
    render(<CodexScreen />);

    expect(screen.getAllByText("???")).toHaveLength(42);
    expect(
      screen.getByRole("img", { name: "知识卡收集进度 0/42" }),
    ).toBeInTheDocument();
  });

  it("filters the grid by the scenario query parameter", () => {
    search.current = new URLSearchParams("scenario=flood");
    render(<CodexScreen />);

    expect(screen.getAllByText("???")).toHaveLength(6);
    expect(screen.getByText("这个末日你还没活明白。")).toBeInTheDocument();
  });

  it("opens an unlocked card in a dialog and closes it with Escape", () => {
    storageAdapter.saveProgress({
      ...createDefaultProgress(),
      unlockedKnowledgeIds: ["flood-current"],
    });
    search.current = new URLSearchParams("scenario=flood");
    render(<CodexScreen />);

    fireEvent.click(
      screen.getByRole("button", { name: /15 厘米的急流也能冲倒你/ }),
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("15 厘米的急流也能冲倒你");
    expect(dialog).toHaveTextContent("融冰纪元");
    expect(
      screen.queryByText("这个末日你还没活明白。"),
    ).not.toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
