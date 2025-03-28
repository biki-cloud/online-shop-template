import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EmailTestForm } from "../email-test-form";
import { toast } from "sonner";
import { testEmail } from "@/app/actions/settings";

// アクションのモック
jest.mock("@/app/actions/settings", () => ({
  testEmail: jest.fn(),
}));

// sonnerトーストをモック
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// UIコンポーネントのモック
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, type, disabled, onClick }: any) => (
    <button
      data-testid="button"
      type={type}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: any) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: any) => (
    <h3 data-testid="card-title">{children}</h3>
  ),
  CardDescription: ({ children }: any) => (
    <p data-testid="card-description">{children}</p>
  ),
  CardContent: ({ children }: any) => (
    <div data-testid="card-content">{children}</div>
  ),
}));

jest.mock("@/components/ui/form", () => ({
  Form: ({ children }: any) => <div data-testid="form">{children}</div>,
  FormField: ({ children, control, name, render }: any) => {
    const Component = render({
      field: { value: "", onChange: jest.fn(), name },
    });
    return <div data-testid={`form-field-${name}`}>{Component}</div>;
  },
  FormItem: ({ children }: any) => (
    <div data-testid="form-item">{children}</div>
  ),
  FormLabel: ({ children }: any) => (
    <label data-testid="form-label">{children}</label>
  ),
  FormControl: ({ children }: any) => (
    <div data-testid="form-control">{children}</div>
  ),
  FormMessage: ({ children }: any) => (
    <div data-testid="form-message">{children || null}</div>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({ placeholder, ...props }: any) => (
    <input data-testid="input" placeholder={placeholder} {...props} />
  ),
}));

describe("EmailTestForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("フォームが正しくレンダリングされる", () => {
    render(<EmailTestForm />);

    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByText("メール送信テスト")).toBeInTheDocument();
    expect(
      screen.getByText(
        "メール設定が正しく機能しているか確認するために、テストメールを送信できます。"
      )
    ).toBeInTheDocument();
    expect(screen.getByText("送信先メールアドレス")).toBeInTheDocument();
    expect(screen.getByTestId("input")).toBeInTheDocument();
    expect(screen.getByTestId("input")).toHaveAttribute(
      "placeholder",
      "test@example.com"
    );
    expect(screen.getByTestId("button")).toHaveTextContent(
      "テストメールを送信"
    );
  });

  it("送信中はボタンが無効化され、テキストが変更される", async () => {
    // useState mockを使用してロード中状態を再現
    jest
      .spyOn(React, "useState")
      .mockImplementationOnce(() => [true, jest.fn()]);

    render(<EmailTestForm />);

    const button = screen.getByTestId("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("送信中...");
  });

  it("有効なメールアドレスで送信すると、testEmailアクションが呼ばれる", async () => {
    (testEmail as jest.Mock).mockResolvedValue(undefined);

    render(<EmailTestForm />);

    // この部分ではReact Hook Formの実装の詳細に依存しないよう、
    // フォームのonSubmitイベントを直接トリガーする
    const form = screen.getByTestId("form").querySelector("form");

    // 送信ボタンをクリック
    const button = screen.getByTestId("button");
    const input = screen.getByTestId("input");

    // 入力値を変更
    fireEvent.change(input, { target: { value: "test@example.com" } });

    // フォームを送信
    form && fireEvent.submit(form);

    await waitFor(() => {
      expect(testEmail).toHaveBeenCalled();
      // 成功トーストが表示されることを確認
      expect(toast.success).toHaveBeenCalledWith("テストメールを送信しました", {
        description: "メールが届くまでしばらくお待ちください",
      });
    });
  });

  it("送信が失敗した場合、エラートーストが表示される", async () => {
    // アクションがエラーをスローするようモック
    (testEmail as jest.Mock).mockRejectedValue(new Error("送信エラー"));

    render(<EmailTestForm />);

    const form = screen.getByTestId("form").querySelector("form");
    const input = screen.getByTestId("input");

    // 入力値を変更
    fireEvent.change(input, { target: { value: "test@example.com" } });

    // フォームを送信
    form && fireEvent.submit(form);

    await waitFor(() => {
      // エラートーストが表示されることを確認
      expect(toast.error).toHaveBeenCalledWith("エラーが発生しました", {
        description: "メール送信に失敗しました。設定を確認してください。",
      });
    });
  });
});
