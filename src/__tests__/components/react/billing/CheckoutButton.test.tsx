import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CheckoutButton from "@components/react/billing/CheckoutButton";
import type { PricingPlan } from "@domain/entities";
import { vi } from "vitest";

const basePlan: PricingPlan = {
  id: 1,
  slug: "pro",
  name: "Pro",
  description: "Pro plan",
  price: 2000,
  billing_period: "monthly",
  is_active: true,
  is_recommended: false,
  sort_order: 1,
  stripe_price_id: "price_123",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

describe("CheckoutButton", () => {
  it("renders direct navigation for free plans", () => {
    render(<CheckoutButton plan={{ ...basePlan, name: "Free", price: 0 }} />);

    expect(screen.getByRole("link", { name: /get started/i })).toHaveAttribute(
      "href",
      "/spaces",
    );
  });

  it("checks auth and shows payment-coming-soon alert for paid plans", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<CheckoutButton plan={basePlan} />);

    await user.click(screen.getByRole("button", { name: /get started/i }));

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/me", {
      credentials: "include",
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Pro plan selected. Payment processing coming soon!",
    );
  });
});
