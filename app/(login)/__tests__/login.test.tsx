import React from "react";
import { render, screen } from "@testing-library/react";
import { Login } from "../login";

// AuthFormとAuthHeaderをモック
jest.mock("@/components/auth/auth-form", () => ({
  AuthForm: ({ mode }: { mode: "signin" | "signup" }) => (
    <div data-testid="auth-form" data-mode={mode}>
      Auth Form
    </div>
  ),
}));

jest.mock("@/components/auth/auth-header", () => ({
  AuthHeader: ({ mode }: { mode: "signin" | "signup" }) => (
    <div data-testid="auth-header" data-mode={mode}>
      Auth Header
    </div>
  ),
}));

describe("Login", () => {
  it("デフォルトでsigninモードでレンダリングされる", () => {
    render(<Login />);

    const authForm = screen.getByTestId("auth-form");
    const authHeader = screen.getByTestId("auth-header");

    expect(authForm).toBeInTheDocument();
    expect(authHeader).toBeInTheDocument();
    expect(authForm).toHaveAttribute("data-mode", "signin");
    expect(authHeader).toHaveAttribute("data-mode", "signin");
  });

  it("signupモードでレンダリングされる", () => {
    render(<Login mode="signup" />);

    const authForm = screen.getByTestId("auth-form");
    const authHeader = screen.getByTestId("auth-header");

    expect(authForm).toBeInTheDocument();
    expect(authHeader).toBeInTheDocument();
    expect(authForm).toHaveAttribute("data-mode", "signup");
    expect(authHeader).toHaveAttribute("data-mode", "signup");
  });

  it("背景要素とともに正しくレンダリングされる", () => {
    const { container } = render(<Login />);

    // メインのコンテナ要素にクラスがあることを確認
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass("min-h-[100dvh]");

    // 背景要素が存在することを確認
    const backgroundElements = container.querySelectorAll(".absolute.inset-0");
    expect(backgroundElements.length).toBeGreaterThan(0);
  });
});
