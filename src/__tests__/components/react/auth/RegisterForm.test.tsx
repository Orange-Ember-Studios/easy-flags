import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterForm from "@components/react/auth/RegisterForm";
import { vi } from "vitest";

describe("RegisterForm", () => {
  it("shows error when passwords do not match", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/username/i), "jose");
    await user.type(screen.getByLabelText(/^email$/i), "jose@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password999");

    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("submits registration and shows API error message", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ error: "User already exists" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/username/i), "jose");
    await user.type(screen.getByLabelText(/^email$/i), "jose@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");

    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        username: "jose",
        email: "jose@example.com",
        password: "password123",
      }),
    });

    expect(await screen.findByText("User already exists")).toBeInTheDocument();
  });
});
