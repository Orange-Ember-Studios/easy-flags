import { render, screen } from "@testing-library/react";
import QuickStartSection from "@components/react/QuickStartSection";

describe("QuickStartSection", () => {
  it("renders quick-start resources with expected links", () => {
    render(<QuickStartSection />);

    expect(
      screen.getByRole("heading", { name: /quick start/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /documentation/i }),
    ).toHaveAttribute("href", "/docs");
    expect(
      screen.getByRole("link", { name: /api reference/i }),
    ).toHaveAttribute("href", "/api-reference");
    expect(screen.getByRole("link", { name: /support/i })).toHaveAttribute(
      "href",
      "/contact",
    );
  });
});
