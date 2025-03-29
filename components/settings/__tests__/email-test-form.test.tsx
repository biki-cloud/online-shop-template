import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EmailTestForm } from "../email-test-form";
import { toast } from "sonner";
import { testEmail } from "@/app/actions/settings";
import { ReactNode } from "react";

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

// React Hook Formをモック
jest.mock("react-hook-form", () => {
  return {
    useForm: () => ({
      register: () => ({}),
      handleSubmit:
        (onSubmit: (data: { email: string }) => Promise<void>) => async () => {
          await onSubmit({ email: "test@example.com" });
        },
      formState: {
        errors: {},
        isSubmitting: false,
      },
    }),
  };
});

// UIコンポーネントのモック
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    type,
    disabled,
    onClick,
  }: {
    children: ReactNode;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    onClick?: () => void;
  }) => (
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
  Card: ({ children }: { children: ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  CardHeader: ({ children }: { children: ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: ReactNode }) => (
    <h3 data-testid="card-title">{children}</h3>
  ),
  CardDescription: ({ children }: { children: ReactNode }) => (
    <p data-testid="card-description">{children}</p>
  ),
  CardContent: ({ children }: { children: ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
}));

jest.mock("@/components/ui/form", () => ({
  Form: ({ children }: { children: ReactNode }) => (
    <div data-testid="form">{children}</div>
  ),
  FormField: ({
    name,
    render,
  }: {
    name: string;
    render: (props: {
      field: { value: string; onChange: () => void; name: string };
    }) => ReactNode;
  }) => {
    const Component = render({
      field: { value: "", onChange: jest.fn(), name },
    });
    return <div data-testid={`form-field-${name}`}>{Component}</div>;
  },
  FormItem: ({ children }: { children: ReactNode }) => (
    <div data-testid="form-item">{children}</div>
  ),
  FormLabel: ({ children }: { children: ReactNode }) => (
    <label data-testid="form-label">{children}</label>
  ),
  FormControl: ({ children }: { children: ReactNode }) => (
    <div data-testid="form-control">{children}</div>
  ),
  FormMessage: ({ children }: { children?: ReactNode }) => (
    <div data-testid="form-message">{children || null}</div>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({
    placeholder,
    ...props
  }: {
    placeholder?: string;
    [key: string]: any;
  }) => <input data-testid="input" placeholder={placeholder} {...props} />,
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
    render(<EmailTestForm />);

    // メールアドレスを入力
    const emailInput = screen.getByTestId("input");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    // フォームを送信
    const submitButton = screen.getByTestId("button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(testEmail).toHaveBeenCalledWith({ email: "test@example.com" });
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

    // フォームを送信
    const button = screen.getByTestId("button");
    fireEvent.click(button);

    await waitFor(() => {
      // エラートーストが表示されることを確認
      expect(toast.error).toHaveBeenCalledWith("エラーが発生しました", {
        description: "メール送信に失敗しました。設定を確認してください。",
      });
    });
  });
});
