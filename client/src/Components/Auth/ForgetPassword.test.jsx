import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgetPassword from "./ForgetPassword";
import httpAction from "../../utils/httpAction";
import toast from "react-hot-toast";

const navigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => navigate,
}));

jest.mock("../../utils/apis", () => ({
  __esModule: true,
  default: () => ({ forgetPassword: "/user/password/forget" }),
}));

jest.mock("../../utils/httpAction", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));

describe("ForgetPassword", () => {
  beforeEach(() => {
    navigate.mockReset();
    httpAction.mockReset();
    toast.success.mockReset();
    sessionStorage.clear();
  });

  it("renders an empty email field and no error banner", () => {
    render(<ForgetPassword />);

    expect(screen.getByRole("heading", { name: /find your account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/registered email/i)).toHaveValue("");
    expect(screen.getByRole("button", { name: /send otp/i })).toBeEnabled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("submits the trimmed email and stores the reset session", async () => {
    const user = userEvent.setup();
    httpAction.mockResolvedValue({
      status: true,
      message: "OTP sent to your email",
      expiresAt: 1_700_000_000_000,
    });

    render(<ForgetPassword />);
    await user.type(screen.getByLabelText(/registered email/i), "  Ravi@Example.com");
    await user.click(screen.getByRole("button", { name: /send otp/i }));

    await waitFor(() => expect(httpAction).toHaveBeenCalledTimes(1));
    expect(httpAction).toHaveBeenCalledWith({
      url: "/user/password/forget",
      method: "POST",
      body: { email: "ravi@example.com" },
      silent: true,
      surfaceError: true,
    });
    expect(sessionStorage.getItem("passwordResetEmail")).toBe("ravi@example.com");
    expect(sessionStorage.getItem("passwordResetExpiresAt")).toBe("1700000000000");
    expect(toast.success).toHaveBeenCalledWith("OTP sent to your email");
    expect(navigate).toHaveBeenCalledWith("/auth/otp/verify");
  });

  it("blocks submission and skips the API when the email is invalid", async () => {
    const user = userEvent.setup();
    render(<ForgetPassword />);

    await user.type(screen.getByLabelText(/registered email/i), "not-an-email");
    await user.click(screen.getByRole("button", { name: /send otp/i }));

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
    expect(httpAction).not.toHaveBeenCalled();
  });

  it("disables the form and shows progress while the request is in flight", async () => {
    const user = userEvent.setup();
    let resolveRequest;
    httpAction.mockImplementation(
      () => new Promise((resolve) => {
        resolveRequest = resolve;
      })
    );

    render(<ForgetPassword />);
    await user.type(screen.getByLabelText(/registered email/i), "ravi@example.com");
    await user.click(screen.getByRole("button", { name: /send otp/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /send otp/i })).toBeDisabled();
    });
    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    resolveRequest({
      status: true,
      message: "OTP sent to your email",
      expiresAt: Date.now() + 120000,
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /send otp/i })).toBeEnabled();
    });
  });

  it("shows an error banner when the API rejects the request", async () => {
    const user = userEvent.setup();
    httpAction.mockResolvedValue({
      status: false,
      message: "Daily limit reached. Please try again in 3 hour(s)",
    });

    render(<ForgetPassword />);
    await user.type(screen.getByLabelText(/registered email/i), "ravi@example.com");
    await user.click(screen.getByRole("button", { name: /send otp/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/daily limit reached/i);
    expect(navigate).not.toHaveBeenCalled();
    expect(sessionStorage.getItem("passwordResetEmail")).toBeNull();
  });
});
