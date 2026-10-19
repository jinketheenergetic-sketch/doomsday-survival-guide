import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

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
