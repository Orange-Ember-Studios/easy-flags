import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "@components/react/auth/LoginForm";
import { vi } from "vitest";

describe("LoginForm", () => {
  it("shows validation error when fields are empty", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<LoginForm />);

    // Use whitespace to pass native required validation while still failing trim() checks.
    await user.type(screen.getByLabelText(/username/i), "   ");
    await user.type(screen.getByLabelText(/password/i), "   ");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      screen.getByText("Please enter both username and password"),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("submits credentials and surfaces server errors", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ error: "Invalid credentials" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<LoginForm redirectUrl="/spaces" />);

    await user.type(screen.getByLabelText(/username/i), "jose");
    await user.type(screen.getByLabelText(/password/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        username: "jose",
        password: "wrong-password",
        redirectUrl: "/spaces",
      }),
    });

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });
});
