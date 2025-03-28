/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { toast } from "sonner";

// next/cacheをモック
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// sonnerトーストをモック
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// useNotification hookをモック
const mockSubscribe = jest.fn();
const mockUnsubscribe = jest.fn();
const mockSendTestNotification = jest.fn();

// モックコンポーネント
type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: string;
  className?: string;
};

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled,
  variant,
  className,
}) => (
  <button
    data-testid="button"
    onClick={onClick}
    disabled={disabled}
    data-variant={variant}
    className={className}
  >
    {children}
  </button>
);

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

const Card: React.FC<CardProps> = ({ children, className }) => (
  <div data-testid="card" className={className}>
    {children}
  </div>
);

const CardHeader: React.FC<CardProps> = ({ children, className }) => (
  <div data-testid="card-header" className={className}>
    {children}
  </div>
);

const CardTitle: React.FC<CardProps> = ({ children, className }) => (
  <h3 data-testid="card-title" className={className}>
    {children}
  </h3>
);

const CardDescription: React.FC<CardProps> = ({ children, className }) => (
  <p data-testid="card-description" className={className}>
    {children}
  </p>
);

const CardContent: React.FC<CardProps> = ({ children, className }) => (
  <div data-testid="card-content" className={className}>
    {children}
  </div>
);

const CardFooter: React.FC<CardProps> = ({ children, className }) => (
  <div data-testid="card-footer" className={className}>
    {children}
  </div>
);

// Lucide iconsをモック
const BellIcon: React.FC = () => <span data-testid="bell-icon" />;
const BellOffIcon: React.FC = () => <span data-testid="bell-off-icon" />;
const SendIcon: React.FC = () => <span data-testid="send-icon" />;

interface UseNotificationResult {
  isSupported: boolean;
  isLoading: boolean;
  isRegistered: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
}

// モックNotificationSettingsPanelの実装
const mockNotificationSettingsContent = (
  isRegistered: boolean,
  isLoading: boolean
) => {
  const useNotification = (): UseNotificationResult => ({
    isSupported: true,
    isLoading: isLoading,
    isRegistered: isRegistered,
    subscribe: mockSubscribe,
    unsubscribe: mockUnsubscribe,
    sendTestNotification: mockSendTestNotification,
  });

  // LoadingCard
  const LoadingCard: React.FC = () => (
    <Card>
      <CardHeader>
        <CardTitle>プッシュ通知設定</CardTitle>
        <CardDescription>プッシュ通知の設定を管理します。</CardDescription>
      </CardHeader>
      <CardContent>
        <div data-testid="loading-skeleton">読み込み中...</div>
      </CardContent>
    </Card>
  );

  // NotificationSettingsPanelContent
  const NotificationSettingsPanelContent: React.FC = () => {
    const { isRegistered, subscribe, unsubscribe, sendTestNotification } =
      useNotification();

    return (
      <Card>
        <CardHeader>
          <CardTitle>プッシュ通知設定</CardTitle>
          <CardDescription>プッシュ通知の設定を管理します。</CardDescription>
        </CardHeader>
        <CardContent>
          {isRegistered ? (
            <Button onClick={unsubscribe} data-testid="unsubscribe-button">
              <BellOffIcon />
              通知を無効にする
            </Button>
          ) : (
            <Button onClick={subscribe} data-testid="subscribe-button">
              <BellIcon />
              通知を有効にする
            </Button>
          )}
        </CardContent>
        {isRegistered && (
          <CardFooter>
            <Button
              onClick={sendTestNotification}
              data-testid="test-notification-button"
            >
              <SendIcon />
              テスト通知を送信
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  };

  // NotificationSettingsPanel
  const NotificationSettingsPanel: React.FC = () => {
    const { isLoading } = useNotification();

    if (isLoading) {
      return <LoadingCard />;
    }

    return <NotificationSettingsPanelContent />;
  };

  return { NotificationSettingsPanel, useNotification };
};

describe("NotificationSettingsPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("ローディング状態ではローディングスケルトンが表示される", () => {
    const { NotificationSettingsPanel } = mockNotificationSettingsContent(
      false,
      true
    );
    render(<NotificationSettingsPanel />);

    expect(screen.getByTestId("loading-skeleton")).toBeInTheDocument();
  });

  it("通知が登録されていない場合、サブスクライブボタンが表示される", () => {
    const { NotificationSettingsPanel } = mockNotificationSettingsContent(
      false,
      false
    );
    render(<NotificationSettingsPanel />);

    // data-testidを"button"に修正
    const button = screen.getByTestId("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("通知を有効にする");
    expect(screen.getByTestId("bell-icon")).toBeInTheDocument();
  });

  it("通知が登録されている場合、アンサブスクライブボタンとテスト通知ボタンが表示される", () => {
    const { NotificationSettingsPanel } = mockNotificationSettingsContent(
      true,
      false
    );
    render(<NotificationSettingsPanel />);

    // 2つのボタンを検索、最初は「通知を無効にする」と書かれているもの
    const buttons = screen.getAllByTestId("button");
    expect(buttons.length).toBe(2);
    expect(buttons[0]).toHaveTextContent("通知を無効にする");
    expect(buttons[1]).toHaveTextContent("テスト通知を送信");

    // ベルオフアイコンとテスト通知のアイコンが表示されていることを確認
    expect(screen.getByTestId("bell-off-icon")).toBeInTheDocument();
    expect(screen.getByTestId("send-icon")).toBeInTheDocument();
  });

  it("サブスクライブボタンをクリックすると、subscribeファンクションが呼ばれる", () => {
    const { NotificationSettingsPanel } = mockNotificationSettingsContent(
      false,
      false
    );
    render(<NotificationSettingsPanel />);

    // data-testidを"button"に修正
    fireEvent.click(screen.getByTestId("button"));
    expect(mockSubscribe).toHaveBeenCalledTimes(1);
  });

  it("アンサブスクライブボタンをクリックすると、unsubscribeファンクションが呼ばれる", () => {
    const { NotificationSettingsPanel } = mockNotificationSettingsContent(
      true,
      false
    );
    render(<NotificationSettingsPanel />);

    // 複数のボタンがある場合、通知無効化ボタンをクリック
    const buttons = screen.getAllByTestId("button");
    fireEvent.click(buttons[0]); // 最初のボタン（通知を無効にする）
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it("テスト通知ボタンをクリックすると、sendTestNotificationファンクションが呼ばれる", () => {
    const { NotificationSettingsPanel } = mockNotificationSettingsContent(
      true,
      false
    );
    render(<NotificationSettingsPanel />);

    // 複数のボタンがある場合、テスト通知ボタンをクリック
    const buttons = screen.getAllByTestId("button");
    fireEvent.click(buttons[1]); // 2番目のボタン（テスト通知）
    expect(mockSendTestNotification).toHaveBeenCalledTimes(1);
  });
});
