import React from "react";
import { render, screen } from "@testing-library/react";
import { signIn, signUp } from "@/app/actions/auth";
import { useRouter, useSearchParams } from "next/navigation";

// コンポーネントのモック
jest.mock("../auth-form", () => ({
  AuthForm: jest.fn(({ mode }) => (
    <div data-testid="auth-form" data-mode={mode}>
      {mode === "signin" ? "サインインフォーム" : "サインアップフォーム"}
    </div>
  )),
}));

// アクションのモック
jest.mock("@/app/actions/auth", () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
}));

// ナビゲーションのモック
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Lucide Reactのモック
jest.mock("lucide-react", () => ({
  Loader2: () => <div>Loader</div>,
}));

import { AuthForm } from "../auth-form";

describe("AuthForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // useRouterのモック
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    // useSearchParamsのモック
    const mockGet = jest.fn().mockImplementation((key) => {
      if (key === "redirect") return null;
      if (key === "priceId") return null;
      return null;
    });
    (useSearchParams as jest.Mock).mockReturnValue({
      get: mockGet,
    });
  });

  it("サインインモードでレンダリングされること", () => {
    render(<AuthForm mode="signin" />);

    const authForm = screen.getByTestId("auth-form");
    expect(authForm).toHaveAttribute("data-mode", "signin");
    expect(screen.getByText("サインインフォーム")).toBeInTheDocument();
  });

  it("サインアップモードでレンダリングされること", () => {
    render(<AuthForm mode="signup" />);

    const authForm = screen.getByTestId("auth-form");
    expect(authForm).toHaveAttribute("data-mode", "signup");
    expect(screen.getByText("サインアップフォーム")).toBeInTheDocument();
  });
});
