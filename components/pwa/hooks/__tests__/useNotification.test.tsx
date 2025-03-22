import { renderHook, act } from "@testing-library/react";
import { useNotification } from "../useNotification";
import { toast } from "sonner";
import { notificationContainer } from "@/lib/di/client-notification-container";
import { NOTIFICATION_TOKENS } from "@/lib/core/constants/notification";
import {
  savePushSubscription,
  deletePushSubscription,
  getPushSubscription,
} from "@/app/actions/push-subscription";
import { NotificationPayload } from "@/lib/core/domain/notification.domain";

// モック
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/lib/di/client-notification-container", () => ({
  notificationContainer: {
    resolve: jest.fn(),
  },
  initializeNotificationContainer: jest.fn(),
}));

jest.mock("@/app/actions/push-subscription", () => ({
  savePushSubscription: jest.fn(),
  deletePushSubscription: jest.fn(),
  getPushSubscription: jest.fn(),
}));

// グローバルモック
const mockCheckSupport = jest.fn();
const mockRequestPermission = jest.fn();
const mockSubscribe = jest.fn();
const mockUnsubscribe = jest.fn();
const mockSendNotification = jest.fn();

const mockNotificationService = {
  checkSupport: mockCheckSupport,
  requestPermission: mockRequestPermission,
  subscribe: mockSubscribe,
  unsubscribe: mockUnsubscribe,
  sendNotification: mockSendNotification,
};

// PushSubscriptionのモック
const mockSubscription = {
  endpoint: "https://example.com/endpoint",
  getKey: jest.fn((key) => new ArrayBuffer(8)),
  toJSON: jest.fn(),
  unsubscribe: jest.fn(),
};

describe("useNotification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 通知サービスのモックをDIコンテナに登録
    (notificationContainer.resolve as jest.Mock).mockReturnValue(
      mockNotificationService
    );

    // ServiceWorkerのモック
    Object.defineProperty(global, "navigator", {
      value: {
        serviceWorker: {
          ready: Promise.resolve({
            pushManager: {
              getSubscription: jest.fn().mockResolvedValue(null),
            },
          }),
        },
      },
      writable: true,
    });

    // getPushSubscriptionのデフォルト返り値
    (getPushSubscription as jest.Mock).mockResolvedValue({
      success: false,
      subscription: null,
    });

    // サポートチェックのデフォルト値
    mockCheckSupport.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("初期状態が正しく設定されること", async () => {
    const { result } = renderHook(() => useNotification());

    // 初期状態ではロード中
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isSubscribed).toBe(false);
    expect(result.current.isSending).toBe(false);

    // 非同期処理が完了するのを待つ
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // ロード完了後
    expect(result.current.isLoading).toBe(false);
  });

  it("通知がサポートされていない場合", async () => {
    mockCheckSupport.mockResolvedValue(false);

    const { result } = renderHook(() => useNotification());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // isLoading がfalseになる
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSubscribed).toBe(false);
  });

  it("既存の購読情報がある場合", async () => {
    // サーバーから購読情報が返される
    (getPushSubscription as jest.Mock).mockResolvedValue({
      success: true,
      subscription: {
        endpoint: "https://example.com/endpoint",
      },
    });

    // ブラウザに購読情報がある
    Object.defineProperty(global, "navigator", {
      value: {
        serviceWorker: {
          ready: Promise.resolve({
            pushManager: {
              getSubscription: jest.fn().mockResolvedValue(mockSubscription),
            },
          }),
        },
      },
      writable: true,
    });

    const { result } = renderHook(() => useNotification());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.isSubscribed).toBe(true);
  });

  describe("handleSubscribe", () => {
    it("通知の購読に成功した場合", async () => {
      mockRequestPermission.mockResolvedValue(true);
      mockSubscribe.mockResolvedValue(mockSubscription);
      (savePushSubscription as jest.Mock).mockResolvedValue({
        success: true,
      });

      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.handleSubscribe();
      });

      expect(mockRequestPermission).toHaveBeenCalled();
      expect(mockSubscribe).toHaveBeenCalled();
      expect(savePushSubscription).toHaveBeenCalled();
      expect(result.current.isSubscribed).toBe(true);
      expect(toast.success).toHaveBeenCalledWith(
        "プッシュ通知を設定しました",
        expect.any(Object)
      );
    });

    it("通知がサポートされていない場合", async () => {
      mockCheckSupport.mockResolvedValue(false);

      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.handleSubscribe();
      });

      expect(toast.error).toHaveBeenCalledWith(
        "このブラウザはプッシュ通知に対応していません"
      );
      expect(result.current.isSubscribed).toBe(false);
    });

    it("通知の許可が与えられなかった場合", async () => {
      mockRequestPermission.mockResolvedValue(false);

      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.handleSubscribe();
      });

      expect(toast.error).toHaveBeenCalledWith("通知の許可が必要です");
      expect(result.current.isSubscribed).toBe(false);
    });

    it("サーバーに購読情報の保存が失敗した場合", async () => {
      mockRequestPermission.mockResolvedValue(true);
      mockSubscribe.mockResolvedValue(mockSubscription);
      (savePushSubscription as jest.Mock).mockResolvedValue({
        success: false,
        error: "Database error",
      });

      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.handleSubscribe();
      });

      expect(toast.error).toHaveBeenCalledWith(
        "通知の設定に失敗しました",
        expect.any(Object)
      );
      expect(result.current.isSubscribed).toBe(false);
    });
  });

  describe("handleUnsubscribe", () => {
    it("通知の購読解除に成功した場合", async () => {
      // 購読中の状態を作る
      mockRequestPermission.mockResolvedValue(true);
      mockSubscribe.mockResolvedValue(mockSubscription);
      (savePushSubscription as jest.Mock).mockResolvedValue({
        success: true,
      });

      mockUnsubscribe.mockResolvedValue(true);
      (deletePushSubscription as jest.Mock).mockResolvedValue({
        success: true,
      });

      const { result } = renderHook(() => useNotification());

      // まず購読する
      await act(async () => {
        await result.current.handleSubscribe();
      });

      expect(result.current.isSubscribed).toBe(true);

      // 購読解除する
      await act(async () => {
        await result.current.handleUnsubscribe();
      });

      expect(mockUnsubscribe).toHaveBeenCalled();
      expect(deletePushSubscription).toHaveBeenCalled();
      expect(result.current.isSubscribed).toBe(false);
      expect(toast.success).toHaveBeenCalledWith(
        "通知をオフにしました",
        expect.any(Object)
      );
    });

    it("サーバーから購読情報の削除が失敗した場合", async () => {
      // 購読中の状態を作る
      mockRequestPermission.mockResolvedValue(true);
      mockSubscribe.mockResolvedValue(mockSubscription);
      (savePushSubscription as jest.Mock).mockResolvedValue({
        success: true,
      });

      mockUnsubscribe.mockResolvedValue(true);
      (deletePushSubscription as jest.Mock).mockResolvedValue({
        success: false,
        error: "Database error",
      });

      const { result } = renderHook(() => useNotification());

      // まず購読する
      await act(async () => {
        await result.current.handleSubscribe();
      });

      // 購読解除する
      await act(async () => {
        await result.current.handleUnsubscribe();
      });

      expect(toast.error).toHaveBeenCalledWith(
        "通知の解除に失敗しました",
        expect.any(Object)
      );
    });
  });

  describe("handleSendNotification", () => {
    it("通知の送信に成功した場合", async () => {
      // 購読中の状態を作る
      mockRequestPermission.mockResolvedValue(true);
      mockSubscribe.mockResolvedValue(mockSubscription);
      (savePushSubscription as jest.Mock).mockResolvedValue({
        success: true,
      });
      mockSendNotification.mockResolvedValue(true);

      const { result } = renderHook(() => useNotification());

      // まず購読する
      await act(async () => {
        await result.current.handleSubscribe();
      });

      const payload: NotificationPayload = {
        title: "テスト通知",
        body: "これはテスト通知です",
        url: "https://example.com/test",
      };

      // 通知を送信
      await act(async () => {
        await result.current.handleSendNotification(payload);
      });

      expect(mockSendNotification).toHaveBeenCalledWith(
        expect.any(Object),
        payload
      );
      expect(toast.success).toHaveBeenCalledWith(
        "通知を送信しました",
        expect.any(Object)
      );
    });

    it("購読していない状態で通知を送信しようとした場合", async () => {
      const { result } = renderHook(() => useNotification());

      const payload: NotificationPayload = {
        title: "テスト通知",
        body: "これはテスト通知です",
        url: "https://example.com/test",
      };

      await act(async () => {
        await result.current.handleSendNotification(payload);
      });

      expect(toast.error).toHaveBeenCalledWith("通知の設定が必要です");
      expect(mockSendNotification).not.toHaveBeenCalled();
    });
  });
});
