import { render, screen } from "@testing-library/react";
import HeroSection from "@components/react/HeroSection";
import { describe, it, expect } from "vitest";

describe("HeroSection", () => {
  it("renders heading, CTAs, and hero illustration", () => {
    render(<HeroSection />);

    expect(
      screen.getByRole("heading", { name: /launch ideas/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /get started/i }),
    ).toHaveAttribute("href", "/create-account");
    
    expect(
      screen.getByRole("link", { name: /documentation/i }),
    ).toHaveAttribute("href", "/docs");

    expect(screen.getByAltText(/illustration/i)).toBeInTheDocument();
  });
});
