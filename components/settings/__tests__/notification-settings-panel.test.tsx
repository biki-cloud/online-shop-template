import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NotificationSettingsPanel } from "../NotificationSettingsPanel";
import { useNotification } from "@/components/pwa/hooks/useNotification";
import { toast } from "sonner";

// useNotificationフックをモック
jest.mock("@/components/pwa/hooks/useNotification");

// sonnerトーストをモック
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Lucide Reactのアイコンモック
jest.mock("lucide-react", () => ({
  Bell: () => <div data-testid="bell-icon">Bell</div>,
  BellOff: () => <div data-testid="bell-off-icon">BellOff</div>,
  Send: () => <div data-testid="send-icon">Send</div>,
}));

// UIコンポーネントのモック
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, disabled, onClick, variant }: any) => (
    <button
      data-testid="button"
      data-variant={variant}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children }: any) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children, className }: any) => (
    <h3 data-testid="card-title" className={className}>
      {children}
    </h3>
  ),
  CardDescription: ({ children, className }: any) => (
    <p data-testid="card-description" className={className}>
      {children}
    </p>
  ),
  CardContent: ({ children, className }: any) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
}));

describe("NotificationSettingsPanel", () => {
  const mockHandleSubscribe = jest.fn();
  const mockHandleUnsubscribe = jest.fn();
  const mockHandleSendNotification = jest.fn();

  // 各テスト前にモックをリセット
  beforeEach(() => {
    jest.clearAllMocks();
    // useEffectのisMountedステートをテストするため、useStateモックを初期化
    jest
      .spyOn(React, "useState")
      .mockImplementationOnce(() => [true, jest.fn()]);
  });

  it("初期ロード時にLoadingCardが表示される", () => {
    // isMountedがfalseの状態を再現
    jest
      .spyOn(React, "useState")
      .mockImplementationOnce(() => [false, jest.fn()]);

    render(<NotificationSettingsPanel />);

    // LoadingCardコンポーネントが表示されていることを確認
    expect(screen.getByText("プッシュ通知設定")).toBeInTheDocument();
    expect(
      screen.getByText("ブラウザのプッシュ通知を設定できます")
    ).toBeInTheDocument();

    // ローディング表示が存在することを確認
    const loadingElement = screen
      .getByTestId("card-content")
      .querySelector(".animate-pulse");
    expect(loadingElement).toBeInTheDocument();
  });

  it("通知が未登録の場合、「通知を設定する」ボタンが表示される", () => {
    // 未登録状態のモックを設定
    (useNotification as jest.Mock).mockReturnValue({
      isSubscribed: false,
      isLoading: false,
      isSending: false,
      handleSubscribe: mockHandleSubscribe,
      handleUnsubscribe: mockHandleUnsubscribe,
      handleSendNotification: mockHandleSendNotification,
    });

    render(<NotificationSettingsPanel />);

    // 「通知を設定する」ボタンが表示されていることを確認
    const subscribeButton = screen.getByText(/通知を設定する/);
    expect(subscribeButton).toBeInTheDocument();
    expect(screen.getByTestId("bell-icon")).toBeInTheDocument();

    // テスト通知ボタンが表示されていないことを確認
    const testButton = screen.queryByText(/テスト通知を送信/);
    expect(testButton).not.toBeInTheDocument();
  });

  it("通知が登録済みの場合、「通知をオフにする」とテスト通知ボタンが表示される", () => {
    // 登録済み状態のモックを設定
    (useNotification as jest.Mock).mockReturnValue({
      isSubscribed: true,
      isLoading: false,
      isSending: false,
      handleSubscribe: mockHandleSubscribe,
      handleUnsubscribe: mockHandleUnsubscribe,
      handleSendNotification: mockHandleSendNotification,
    });

    render(<NotificationSettingsPanel />);

    // 「通知をオフにする」ボタンが表示されていることを確認
    const unsubscribeButton = screen.getByText(/通知をオフにする/);
    expect(unsubscribeButton).toBeInTheDocument();
    expect(screen.getByTestId("bell-off-icon")).toBeInTheDocument();

    // テスト通知ボタンが表示されていることを確認
    const testButton = screen.getByText(/テスト通知を送信/);
    expect(testButton).toBeInTheDocument();
    expect(screen.getByTestId("send-icon")).toBeInTheDocument();
  });

  it("ロード中の場合、ボタンが無効化される", () => {
    // ロード中状態のモックを設定
    (useNotification as jest.Mock).mockReturnValue({
      isSubscribed: false,
      isLoading: true,
      isSending: false,
      handleSubscribe: mockHandleSubscribe,
      handleUnsubscribe: mockHandleUnsubscribe,
      handleSendNotification: mockHandleSendNotification,
    });

    render(<NotificationSettingsPanel />);

    // ボタンが無効化されていることを確認
    const button = screen.getByText(/通知を設定する/).closest("button");
    expect(button).toBeDisabled();
  });

  it("「通知を設定する」ボタンをクリックするとhandleSubscribeが呼ばれる", () => {
    // 未登録状態のモックを設定
    (useNotification as jest.Mock).mockReturnValue({
      isSubscribed: false,
      isLoading: false,
      isSending: false,
      handleSubscribe: mockHandleSubscribe,
      handleUnsubscribe: mockHandleUnsubscribe,
      handleSendNotification: mockHandleSendNotification,
    });

    render(<NotificationSettingsPanel />);

    // 「通知を設定する」ボタンをクリック
    const subscribeButton = screen
      .getByText(/通知を設定する/)
      .closest("button");
    fireEvent.click(subscribeButton!);

    // handleSubscribeが呼ばれたことを確認
    expect(mockHandleSubscribe).toHaveBeenCalled();
  });

  it("「通知をオフにする」ボタンをクリックするとhandleUnsubscribeが呼ばれる", () => {
    // 登録済み状態のモックを設定
    (useNotification as jest.Mock).mockReturnValue({
      isSubscribed: true,
      isLoading: false,
      isSending: false,
      handleSubscribe: mockHandleSubscribe,
      handleUnsubscribe: mockHandleUnsubscribe,
      handleSendNotification: mockHandleSendNotification,
    });

    render(<NotificationSettingsPanel />);

    // 「通知をオフにする」ボタンをクリック
    const unsubscribeButton = screen
      .getByText(/通知をオフにする/)
      .closest("button");
    fireEvent.click(unsubscribeButton!);

    // handleUnsubscribeが呼ばれたことを確認
    expect(mockHandleUnsubscribe).toHaveBeenCalled();
  });

  it("「テスト通知を送信」ボタンをクリックするとhandleSendNotificationが呼ばれる", () => {
    // 登録済み状態のモックを設定
    (useNotification as jest.Mock).mockReturnValue({
      isSubscribed: true,
      isLoading: false,
      isSending: false,
      handleSubscribe: mockHandleSubscribe,
      handleUnsubscribe: mockHandleUnsubscribe,
      handleSendNotification: mockHandleSendNotification,
    });

    render(<NotificationSettingsPanel />);

    // 「テスト通知を送信」ボタンをクリック
    const testButton = screen.getByText(/テスト通知を送信/).closest("button");
    fireEvent.click(testButton!);

    // handleSendNotificationが適切なペイロードで呼ばれたことを確認
    expect(mockHandleSendNotification).toHaveBeenCalledWith({
      title: "テスト通知",
      body: "プッシュ通知のテストです",
      url: "/",
    });
  });

  it("送信中の場合、テスト通知ボタンが無効化される", () => {
    // 送信中状態のモックを設定
    (useNotification as jest.Mock).mockReturnValue({
      isSubscribed: true,
      isLoading: false,
      isSending: true,
      handleSubscribe: mockHandleSubscribe,
      handleUnsubscribe: mockHandleUnsubscribe,
      handleSendNotification: mockHandleSendNotification,
    });

    render(<NotificationSettingsPanel />);

    // テスト通知ボタンが無効化されていることを確認
    const testButton = screen.getByText(/テスト通知を送信/).closest("button");
    expect(testButton).toBeDisabled();
  });
});
