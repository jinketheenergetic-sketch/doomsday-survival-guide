import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Home from "@/app/page";

// 首页的随机按钮调用 useRouter；测试里没有 App Router 上下文，这里给个最小替身。
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));

describe("Home", () => {
  it("renders the game title", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "末日生存指南：别慌",
      }),
    ).toBeInTheDocument();
  });
});
