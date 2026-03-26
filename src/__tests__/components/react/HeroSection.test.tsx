import { render, screen } from "@testing-library/react";
import HeroSection from "@components/react/HeroSection";

describe("HeroSection", () => {
  it("renders heading, CTAs, and hero illustration", () => {
    render(<HeroSection />);

    expect(
      screen.getByRole("heading", { name: /launch new ideas/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Create account" }),
    ).toHaveAttribute("href", "/create-account");
    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute(
      "href",
      "/login",
    );

    expect(
      screen.getByAltText("Feature rollout illustration"),
    ).toBeInTheDocument();
  });
});
