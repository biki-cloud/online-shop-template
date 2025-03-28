/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { toast } from "sonner";
import { ReactNode } from "react";

// NotificationSettingsPanelを直接インポート
import { NotificationSettingsPanel } from "../NotificationSettingsPanel";

// useNotificationをモック
jest.mock("@/components/pwa/hooks/useNotification", () => ({
  useNotification: jest.fn(),
}));

// next/cacheをモック
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Suspenseをモック
jest.mock("react", () => {
  const originalReact = jest.requireActual("react");
  return {
    ...originalReact,
    Suspense: ({ children }: { children: ReactNode }) => children,
  };
});

// sonnerトーストをモック
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Lucide iconsをモック
jest.mock("lucide-react", () => ({
  Bell: () => <span data-testid="bell-icon" />,
  BellOff: () => <span data-testid="bell-off-icon" />,
  Send: () => <span data-testid="send-icon" />,
}));

// UIコンポーネントをモック
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
  }: {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
  }) => (
    <button
      data-testid="button"
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
    >
      {children}
    </button>
  ),
}));

interface CardProps {
  children: ReactNode;
  className?: string;
}

jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: CardProps) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children }: { children: ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children, className }: CardProps) => (
    <h3 data-testid="card-title" className={className}>
      {children}
    </h3>
  ),
  CardDescription: ({ children, className }: CardProps) => (
    <p data-testid="card-description" className={className}>
      {children}
    </p>
  ),
  CardContent: ({ children, className }: CardProps) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
}));

// モックフックの関数を作成
const mockSubscribe = jest.fn();
const mockUnsubscribe = jest.fn();
const mockSendNotification = jest.fn();

// useNotificationのモック実装
const mockUseNotification = () => {
  return {
    isSubscribed: false,
    isLoading: false,
    isSending: false,
    handleSubscribe: mockSubscribe,
    handleUnsubscribe: mockUnsubscribe,
    handleSendNotification: mockSendNotification,
  };
};

interface UseNotificationModule {
  useNotification: jest.Mock;
}

describe("NotificationSettingsPanel", () => {
  let useNotificationModule: UseNotificationModule;

  beforeEach(() => {
    jest.clearAllMocks();
    // useNotificationモジュールを取得
    useNotificationModule =
      require("@/components/pwa/hooks/useNotification") as UseNotificationModule;
    // デフォルトのモック実装を設定
    useNotificationModule.useNotification.mockImplementation(
      mockUseNotification
    );
  });

  it("マウント前はロードカードを表示する", () => {
    // useStateのモックを使用して初期状態を制御
    jest
      .spyOn(React, "useState")
      .mockImplementationOnce(() => [false, jest.fn()]); // isMountedを強制的にfalseに設定

    render(<NotificationSettingsPanel />);

    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByText("プッシュ通知設定")).toBeInTheDocument();
    expect(screen.getByTestId("card-content")).toBeInTheDocument();
    // ローディングアニメーションの要素を確認
    expect(
      screen.getByTestId("card-content").querySelector(".animate-pulse")
    ).toBeInTheDocument();
  });

  it("通知が未登録の場合、登録ボタンを表示する", () => {
    // useStateモックで強制的にマウント済みに設定
    jest
      .spyOn(React, "useState")
      .mockImplementationOnce(() => [true, jest.fn()]);

    // 未登録状態のモックを設定
    useNotificationModule.useNotification.mockImplementation(() => ({
      ...mockUseNotification(),
      isSubscribed: false,
    }));

    render(<NotificationSettingsPanel />);

    const buttons = screen.getAllByTestId("button");
    expect(buttons.length).toBe(1);
    expect(buttons[0]).toHaveTextContent("通知を設定する");
    expect(screen.getByTestId("bell-icon")).toBeInTheDocument();
  });

  it("通知が登録済みの場合、解除ボタンとテスト通知ボタンを表示する", () => {
    // useStateモックで強制的にマウント済みに設定
    jest
      .spyOn(React, "useState")
      .mockImplementationOnce(() => [true, jest.fn()]);

    // 登録済み状態のモックを設定
    useNotificationModule.useNotification.mockImplementation(() => ({
      ...mockUseNotification(),
      isSubscribed: true,
    }));

    render(<NotificationSettingsPanel />);

    const buttons = screen.getAllByTestId("button");
    expect(buttons.length).toBe(2);
    expect(buttons[0]).toHaveTextContent("通知をオフにする");
    expect(buttons[1]).toHaveTextContent("テスト通知を送信");
    expect(screen.getByTestId("bell-off-icon")).toBeInTheDocument();
    expect(screen.getByTestId("send-icon")).toBeInTheDocument();
  });

  it("ロード中は登録ボタンを無効化する", () => {
    // useStateモックで強制的にマウント済みに設定
    jest
      .spyOn(React, "useState")
      .mockImplementationOnce(() => [true, jest.fn()]);

    // ロード中状態のモックを設定
    useNotificationModule.useNotification.mockImplementation(() => ({
      ...mockUseNotification(),
      isLoading: true,
    }));

    render(<NotificationSettingsPanel />);

    const button = screen.getByTestId("button");
    expect(button).toBeDisabled();
  });

  it("テスト通知送信中はテスト通知ボタンを無効化する", () => {
    // useStateモックで強制的にマウント済みに設定
    jest
      .spyOn(React, "useState")
      .mockImplementationOnce(() => [true, jest.fn()]);

    // 送信中状態のモックを設定
    useNotificationModule.useNotification.mockImplementation(() => ({
      ...mockUseNotification(),
      isSubscribed: true,
      isSending: true,
    }));

    render(<NotificationSettingsPanel />);

    const buttons = screen.getAllByTestId("button");
    expect(buttons[1]).toBeDisabled(); // テスト通知ボタンは無効
  });

  it("登録ボタンをクリックするとhandleSubscribeが呼ばれる", async () => {
    // useStateモックで強制的にマウント済みに設定
    jest
      .spyOn(React, "useState")
      .mockImplementationOnce(() => [true, jest.fn()]);

    useNotificationModule.useNotification.mockImplementation(() => ({
      ...mockUseNotification(),
      isSubscribed: false,
    }));

    render(<NotificationSettingsPanel />);

    const button = screen.getByTestId("button");
    fireEvent.click(button);

    expect(mockSubscribe).toHaveBeenCalledTimes(1);
  });

  it("解除ボタンをクリックするとhandleUnsubscribeが呼ばれる", async () => {
    // useStateモックで強制的にマウント済みに設定
    jest
      .spyOn(React, "useState")
      .mockImplementationOnce(() => [true, jest.fn()]);

    useNotificationModule.useNotification.mockImplementation(() => ({
      ...mockUseNotification(),
      isSubscribed: true,
    }));

    render(<NotificationSettingsPanel />);

    const buttons = screen.getAllByTestId("button");
    fireEvent.click(buttons[0]); // 解除ボタン

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it("テスト通知ボタンをクリックするとhandleSendNotificationが呼ばれる", async () => {
    // useStateモックで強制的にマウント済みに設定
    jest
      .spyOn(React, "useState")
      .mockImplementationOnce(() => [true, jest.fn()]);

    useNotificationModule.useNotification.mockImplementation(() => ({
      ...mockUseNotification(),
      isSubscribed: true,
    }));

    render(<NotificationSettingsPanel />);

    const buttons = screen.getAllByTestId("button");
    fireEvent.click(buttons[1]); // テスト通知ボタン

    expect(mockSendNotification).toHaveBeenCalledTimes(1);
    expect(mockSendNotification).toHaveBeenCalledWith({
      title: "テスト通知",
      body: "プッシュ通知のテストです",
      url: "/",
    });
  });

  it("コンポーネントのマウント後にuseEffectが実行される", () => {
    const useEffectSpy = jest.spyOn(React, "useEffect");

    render(<NotificationSettingsPanel />);

    expect(useEffectSpy).toHaveBeenCalled();
  });
});
