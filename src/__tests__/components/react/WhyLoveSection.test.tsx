import { render, screen } from "@testing-library/react";
import WhyLoveSection from "@components/react/WhyLoveSection";

describe("WhyLoveSection", () => {
  it("renders all key product benefits", () => {
    render(<WhyLoveSection />);

    expect(
      screen.getByRole("heading", { name: /why love easy flags/i }),
    ).toBeInTheDocument();

    expect(screen.getByText("Instant Rollback")).toBeInTheDocument();
    expect(screen.getByText("Targeted Rollout")).toBeInTheDocument();
    expect(screen.getByText("Real-time Analytics")).toBeInTheDocument();
    expect(screen.getByText("Enterprise Security")).toBeInTheDocument();
    expect(screen.getByText("High Performance")).toBeInTheDocument();
    expect(screen.getByText("Easy Integration")).toBeInTheDocument();
  });
});
