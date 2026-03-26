import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContactForm from "@components/react/contact/ContactForm";

describe("ContactForm", () => {
  it("submits successfully, resets form, and hides success notice", async () => {
    const user = userEvent.setup();

    render(<ContactForm />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/^email$/i);
    const subjectInput = screen.getByLabelText(/subject/i);
    const messageInput = screen.getByLabelText(/message/i);

    await user.type(nameInput, "Jose Joya");
    await user.type(emailInput, "jose@example.com");
    await user.type(subjectInput, "Need support");
    await user.type(messageInput, "Please help with onboarding.");

    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(screen.getByRole("button", { name: /sending/i })).toBeDisabled();

    expect(
      await screen.findByText(/thank you for your message/i),
    ).toBeInTheDocument();

    expect(nameInput).toHaveValue("");
    expect(emailInput).toHaveValue("");
    expect(subjectInput).toHaveValue("");
    expect(messageInput).toHaveValue("");

    await waitFor(
      () => {
        expect(
          screen.queryByText(/thank you for your message/i),
        ).not.toBeInTheDocument();
      },
      { timeout: 4500 },
    );
  }, 12000);
});
