import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthForm } from "../auth-form";
import { signIn, signUp } from "@/app/actions/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState } from "react";

// モック
jest.mock("@/app/actions/auth", () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock("react", () => {
  const originalReact = jest.requireActual("react");
  return {
    ...originalReact,
    useActionState: jest.fn(),
  };
});

// Lucide Reactのモック
jest.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader-icon">Loading</div>,
}));

// UIコンポーネントのモック
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, type, className, disabled, onClick }: any) => (
    <button
      type={type}
      className={className}
      disabled={disabled}
      onClick={onClick}
      data-testid="button"
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({
    id,
    name,
    type,
    autoComplete,
    required,
    defaultValue,
    className,
    placeholder,
    ...props
  }: any) => (
    <input
      id={id}
      name={name}
      type={type}
      autoComplete={autoComplete}
      required={required}
      defaultValue={defaultValue}
      className={className}
      placeholder={placeholder}
      data-testid={`input-${name}`}
      {...props}
    />
  ),
}));

jest.mock("@/components/ui/label", () => ({
  Label: ({ htmlFor, className, children }: any) => (
    <label
      htmlFor={htmlFor}
      className={className}
      data-testid={`label-${htmlFor}`}
    >
      {children}
    </label>
  ),
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
  CardFooter: ({ children, className }: any) => (
    <div data-testid="card-footer" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children }: any) => (
    <div data-testid="card-header">{children}</div>
  ),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, className }: any) => (
    <a href={href} className={className} data-testid="next-link">
      {children}
    </a>
  ),
}));

describe("AuthForm Implementation", () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockSearchParams = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    (useActionState as jest.Mock).mockReturnValue([
      { error: "" },
      jest.fn(),
      false,
    ]);
  });

  it("サインインモードで正しくレンダリングされる", () => {
    render(<AuthForm mode="signin" />);

    // フォームコンテンツが存在することを確認（form要素ではなく、その親要素）
    expect(screen.getByTestId("card-content")).toBeInTheDocument();

    // メールアドレス入力フィールドが存在することを確認
    expect(screen.getByTestId("input-email")).toBeInTheDocument();
    expect(screen.getByTestId("label-email")).toHaveTextContent(
      "メールアドレス"
    );

    // パスワード入力フィールドが存在することを確認
    expect(screen.getByTestId("input-password")).toBeInTheDocument();
    expect(screen.getByTestId("label-password")).toHaveTextContent(
      "パスワード"
    );

    // 名前入力フィールドは存在しないことを確認
    expect(screen.queryByTestId("input-name")).not.toBeInTheDocument();

    // サインインボタンが存在することを確認
    expect(screen.getByTestId("button")).toHaveTextContent("サインイン");

    // 新規アカウント作成へのリンクが存在することを確認
    expect(screen.getByTestId("next-link")).toHaveTextContent(
      "新規アカウントを作成"
    );
    expect(screen.getByTestId("next-link")).toHaveAttribute("href", "/sign-up");
  });

  it("サインアップモードで正しくレンダリングされる", () => {
    render(<AuthForm mode="signup" />);

    // フォームコンテンツが存在することを確認（form要素ではなく、その親要素）
    expect(screen.getByTestId("card-content")).toBeInTheDocument();

    // 名前入力フィールドが存在することを確認
    expect(screen.getByTestId("input-name")).toBeInTheDocument();
    expect(screen.getByTestId("label-name")).toHaveTextContent("お名前");

    // メールアドレス入力フィールドが存在することを確認
    expect(screen.getByTestId("input-email")).toBeInTheDocument();
    expect(screen.getByTestId("label-email")).toHaveTextContent(
      "メールアドレス"
    );

    // パスワード入力フィールドが存在することを確認
    expect(screen.getByTestId("input-password")).toBeInTheDocument();
    expect(screen.getByTestId("label-password")).toHaveTextContent(
      "パスワード"
    );

    // パスワード要件が表示されていることを確認
    expect(
      screen.getByText("パスワードは以下の要件を満たす必要があります：")
    ).toBeInTheDocument();
    expect(screen.getByText("8文字以上")).toBeInTheDocument();
    expect(screen.getByText("少なくとも1つの数字")).toBeInTheDocument();

    // アカウント作成ボタンが存在することを確認
    expect(screen.getByTestId("button")).toHaveTextContent("アカウント作成");

    // サインインへのリンクが存在することを確認
    expect(screen.getByTestId("next-link")).toHaveTextContent(
      "既存のアカウントでサインイン"
    );
    expect(screen.getByTestId("next-link")).toHaveAttribute("href", "/sign-in");
  });

  it("リダイレクトパラメータが正しく処理される", () => {
    mockSearchParams.get.mockImplementation((key) => {
      if (key === "redirect") return "/dashboard";
      if (key === "priceId") return "price_123";
      return null;
    });

    render(<AuthForm mode="signin" />);

    // リダイレクト用の隠しフィールドが存在し、値が正しいことを確認
    const redirectInput = screen.getByDisplayValue("/dashboard");
    expect(redirectInput).toBeInTheDocument();
    expect(redirectInput).toHaveAttribute("type", "hidden");
    expect(redirectInput).toHaveAttribute("name", "redirect");

    // priceId用の隠しフィールドが存在し、値が正しいことを確認
    const priceIdInput = screen.getByDisplayValue("price_123");
    expect(priceIdInput).toBeInTheDocument();
    expect(priceIdInput).toHaveAttribute("type", "hidden");
    expect(priceIdInput).toHaveAttribute("name", "priceId");

    // サインアップリンクにもパラメータが含まれていることを確認
    expect(screen.getByTestId("next-link")).toHaveAttribute(
      "href",
      "/sign-up?redirect=/dashboard&priceId=price_123"
    );
  });

  it("ローディング状態が正しく表示される", () => {
    // ローディング状態のモック
    (useActionState as jest.Mock).mockReturnValue([
      { error: "" },
      jest.fn(),
      true,
    ]);

    render(<AuthForm mode="signin" />);

    // ローディングアイコンが表示されていることを確認
    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
    expect(screen.getByTestId("button")).toBeDisabled();
  });

  it("エラーメッセージが正しく表示される", () => {
    // エラー状態のモック
    (useActionState as jest.Mock).mockReturnValue([
      { error: "メールアドレスまたはパスワードが正しくありません" },
      jest.fn(),
      false,
    ]);

    render(<AuthForm mode="signin" />);

    // エラーメッセージが表示されていることを確認
    expect(
      screen.getByText("メールアドレスまたはパスワードが正しくありません")
    ).toBeInTheDocument();
  });

  it("リダイレクト指示を受け取ると正しくリダイレクトされる", () => {
    // リダイレクト状態のモック
    (useActionState as jest.Mock).mockReturnValue([
      { error: "", redirect: "/dashboard" },
      jest.fn(),
      false,
    ]);

    render(<AuthForm mode="signin" />);

    // リダイレクトが行われたことを確認
    expect(mockRouter.push).toHaveBeenCalledWith("/dashboard");
  });
});
