import "reflect-metadata";
import { NotificationService } from "../server-notification.service.impl";
import { NOTIFICATION_TOKENS } from "@/lib/core/constants/notification";
import webPush from "web-push";
import type { Product, PushSubscription } from "@/lib/infrastructure/db/schema";
import type { INotificationRepository } from "../../repositories/interfaces/notification.repository.interface";
import type { IPushSubscriptionService } from "../interfaces/push-subscription.service.interface";
import type { NotificationPayload } from "../../domain/notification.domain";

// webPushのモック
jest.mock("web-push", () => ({
  setVapidDetails: jest.fn(),
  sendNotification: jest.fn().mockResolvedValue(undefined),
}));

// 元のprocess.envを保存
const originalEnv = process.env;

describe("NotificationService", () => {
  let notificationService: NotificationService;
  let mockNotificationRepository: jest.Mocked<INotificationRepository>;
  let mockPushSubscriptionService: jest.Mocked<IPushSubscriptionService>;

  // テスト用のモックデータ
  const mockProduct: Product = {
    id: 1,
    name: "テスト商品",
    description: "テスト商品の説明",
    price: "1000", // 文字列として設定
    stock: 10,
    currency: "JPY",
    imageUrl: "https://example.com/image.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockSubscriptions: PushSubscription[] = [
    {
      id: 1,
      userId: 1,
      endpoint: "https://example.com/endpoint1",
      p256dh: "p256dh_key_1",
      auth: "auth_key_1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      userId: 2,
      endpoint: "https://example.com/endpoint2",
      p256dh: "p256dh_key_2",
      auth: "auth_key_2",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    // process.envをテスト用に設定
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_VAPID_PUBLIC_KEY: "test_public_key",
      VAPID_PRIVATE_KEY: "test_private_key",
      NEXT_PUBLIC_CONTACT_EMAIL: "test@example.com",
    };

    // モックリポジトリを設定
    mockNotificationRepository = {
      checkSupport: jest.fn(),
      requestPermission: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      sendNotification: jest.fn(),
      saveSubscription: jest.fn(),
      clearSubscription: jest.fn(),
      getStoredSubscription: jest.fn(),
    };

    // モックPushSubscriptionServiceを設定
    mockPushSubscriptionService = {
      saveSubscription: jest.fn(),
      deleteSubscription: jest.fn().mockResolvedValue(undefined),
      getSubscription: jest.fn(),
      getAllSubscriptions: jest.fn().mockResolvedValue(mockSubscriptions),
    };

    // モックをリセット
    jest.clearAllMocks();

    // NotificationServiceのインスタンスを作成
    notificationService = new NotificationService(
      mockNotificationRepository,
      mockPushSubscriptionService
    );
  });

  afterEach(() => {
    // process.envを元に戻す
    process.env = originalEnv;
  });

  describe("constructor", () => {
    it("should initialize VAPID details correctly", () => {
      expect(webPush.setVapidDetails).toHaveBeenCalledWith(
        "mailto:test@example.com",
        "test_public_key",
        "test_private_key"
      );
    });

    it("should warn if VAPID keys are not set", () => {
      // console.warnをモック
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

      // VAPID keysをリセット
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = undefined;
      process.env.VAPID_PRIVATE_KEY = undefined;

      // 新しいインスタンスを作成
      new NotificationService(
        mockNotificationRepository,
        mockPushSubscriptionService
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "⚠️ VAPID keysが正しく設定されていません"
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe("client side methods stubs", () => {
    it("checkSupport should return true", async () => {
      const result = await notificationService.checkSupport();
      expect(result).toBe(true);
    });

    it("requestPermission should return true", async () => {
      const result = await notificationService.requestPermission();
      expect(result).toBe(true);
    });

    it("subscribe should return null", async () => {
      const result = await notificationService.subscribe();
      expect(result).toBeNull();
    });

    it("unsubscribe should return true", async () => {
      // サーバー側の実装では引数は使用されていないためテスト
      const result = await notificationService.unsubscribe();
      expect(result).toBe(true);
    });

    it("sendNotification should return true", async () => {
      // Web APIのPushSubscriptionをモック
      const mockWebPushSub = {} as globalThis.PushSubscription;
      const payload: NotificationPayload = {
        title: "Test",
        body: "Test body",
        url: "/test",
      };
      const result = await notificationService.sendNotification(
        mockWebPushSub,
        payload
      );
      expect(result).toBe(true);
    });

    it("getStoredSubscription should return null", async () => {
      const result = await notificationService.getStoredSubscription();
      expect(result).toBeNull();
    });
  });

  describe("notifyNewProduct", () => {
    it("should send notifications to all subscriptions", async () => {
      await notificationService.notifyNewProduct(mockProduct);

      // 全てのサブスクリプションを取得していることを確認
      expect(
        mockPushSubscriptionService.getAllSubscriptions
      ).toHaveBeenCalled();

      // 各サブスクリプションに通知を送信していることを確認
      expect(webPush.sendNotification).toHaveBeenCalledTimes(2);

      // 正しいペイロードで通知が送られていることを確認
      const expectedPayload = JSON.stringify({
        title: "新商品が登録されました！",
        body: `${mockProduct.name}が新しく追加されました。`,
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        data: {
          url: `/products/${mockProduct.id}`,
          productId: mockProduct.id,
        },
        actions: [
          {
            action: "open",
            title: "商品を見る",
          },
        ],
      });

      expect(webPush.sendNotification).toHaveBeenCalledWith(
        {
          endpoint: mockSubscriptions[0].endpoint,
          keys: {
            p256dh: mockSubscriptions[0].p256dh,
            auth: mockSubscriptions[0].auth,
          },
        },
        expectedPayload
      );
    });

    it("should not send notifications if no subscriptions exist", async () => {
      // サブスクリプションがない場合をモック
      mockPushSubscriptionService.getAllSubscriptions.mockResolvedValueOnce([]);

      await notificationService.notifyNewProduct(mockProduct);

      // 通知が送信されていないことを確認
      expect(webPush.sendNotification).not.toHaveBeenCalled();
    });

    it("should not send notifications if vapid details are not set", async () => {
      // VAPID設定をリセット
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = undefined;
      process.env.VAPID_PRIVATE_KEY = undefined;

      // console.errorをモック
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      // 新しいインスタンスを作成
      const service = new NotificationService(
        mockNotificationRepository,
        mockPushSubscriptionService
      );

      await service.notifyNewProduct(mockProduct);

      // エラーログが出力されていることを確認
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "❌ VAPID設定が見つかりません"
      );

      // 通知が送信されていないことを確認
      expect(webPush.sendNotification).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it("should handle errors when sending notifications", async () => {
      // 最初の通知送信でエラーが発生するようにモック
      (webPush.sendNotification as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Failed to send notification");
      });

      // console.errorをモック
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

      await notificationService.notifyNewProduct(mockProduct);

      // エラーが発生した場合に削除が呼ばれていることを確認
      expect(
        mockPushSubscriptionService.deleteSubscription
      ).toHaveBeenCalledWith(mockSubscriptions[0].userId);

      // エラーログが出力されていることを確認
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "❌ 通知の送信に失敗しました",
        expect.objectContaining({
          endpoint: mockSubscriptions[0].endpoint,
          userId: mockSubscriptions[0].userId,
          error: "Failed to send notification",
        })
      );

      // 最終結果のログが出力されていることを確認
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "❌ 通知送信の最終結果",
        expect.objectContaining({
          totalSubscriptions: 2,
          failedCount: 1,
          successCount: 1,
          errors: ["Failed to send notification"],
        })
      );

      consoleErrorSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it("should log success message when all notifications are sent", async () => {
      // console.logをモック
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

      await notificationService.notifyNewProduct(mockProduct);

      // 成功メッセージが出力されていることを確認
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "✅ すべての通知を送信しました",
        expect.objectContaining({
          totalSubscriptions: 2,
        })
      );

      consoleLogSpy.mockRestore();
    });
  });
});
