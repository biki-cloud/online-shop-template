import {
  savePushSubscription,
  deletePushSubscription,
  getPushSubscription,
} from "../push-subscription";
import { getCurrentUser } from "../user";
import {
  serverNotificationContainer,
  initializeServerNotificationContainer,
} from "@/lib/di/server-notification-container";
import { NOTIFICATION_TOKENS } from "@/lib/core/constants/notification";
import type { WebPushSubscription } from "@/lib/core/repositories/interfaces/push-subscription.repository.interface";
import { revalidatePath } from "next/cache";

// モックの設定
jest.mock("../user", () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/di/server-notification-container", () => ({
  serverNotificationContainer: {
    resolve: jest.fn(),
  },
  initializeServerNotificationContainer: jest.fn(),
}));

describe("プッシュ通知サブスクリプションのアクション", () => {
  // モックサービス
  const mockPushSubscriptionService = {
    saveSubscription: jest.fn(),
    deleteSubscription: jest.fn(),
    getSubscription: jest.fn(),
  };

  // モックサブスクリプション
  const mockSubscription: WebPushSubscription = {
    endpoint: "https://example.com/push-endpoint",
    keys: {
      p256dh: "test-p256dh-key",
      auth: "test-auth-key",
    },
  };

  // 各テスト前のセットアップ
  beforeEach(() => {
    jest.clearAllMocks();

    // モックの戻り値を設定
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: 1,
      email: "test@example.com",
    });
    (serverNotificationContainer.resolve as jest.Mock).mockReturnValue(
      mockPushSubscriptionService
    );
  });

  describe("savePushSubscription", () => {
    it("認証済みユーザーの場合、サブスクリプションを保存し成功を返すこと", async () => {
      mockPushSubscriptionService.saveSubscription.mockResolvedValue({
        id: 1,
        userId: 1,
        endpoint: mockSubscription.endpoint,
        p256dh: mockSubscription.keys.p256dh,
        auth: mockSubscription.keys.auth,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await savePushSubscription(mockSubscription);

      expect(getCurrentUser).toHaveBeenCalled();
      expect(initializeServerNotificationContainer).toHaveBeenCalled();
      expect(serverNotificationContainer.resolve).toHaveBeenCalledWith(
        NOTIFICATION_TOKENS.PUSH_SUBSCRIPTION_SERVICE
      );
      expect(mockPushSubscriptionService.saveSubscription).toHaveBeenCalledWith(
        1,
        mockSubscription
      );
      expect(revalidatePath).toHaveBeenCalledWith("/");
      expect(result).toEqual({ success: true });
    });

    it("未認証の場合、エラーを返すこと", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      const result = await savePushSubscription(mockSubscription);

      expect(getCurrentUser).toHaveBeenCalled();
      expect(initializeServerNotificationContainer).not.toHaveBeenCalled();
      expect(
        mockPushSubscriptionService.saveSubscription
      ).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: "プッシュ通知の設定に失敗しました",
      });
    });

    it("サービスがエラーを投げた場合、エラーを返すこと", async () => {
      mockPushSubscriptionService.saveSubscription.mockRejectedValue(
        new Error("サービスエラー")
      );

      const result = await savePushSubscription(mockSubscription);

      expect(getCurrentUser).toHaveBeenCalled();
      expect(initializeServerNotificationContainer).toHaveBeenCalled();
      expect(mockPushSubscriptionService.saveSubscription).toHaveBeenCalledWith(
        1,
        mockSubscription
      );
      expect(result).toEqual({
        success: false,
        error: "プッシュ通知の設定に失敗しました",
      });
    });
  });

  describe("deletePushSubscription", () => {
    it("認証済みユーザーの場合、サブスクリプションを削除し成功を返すこと", async () => {
      mockPushSubscriptionService.deleteSubscription.mockResolvedValue(
        undefined
      );

      const result = await deletePushSubscription();

      expect(getCurrentUser).toHaveBeenCalled();
      expect(initializeServerNotificationContainer).toHaveBeenCalled();
      expect(serverNotificationContainer.resolve).toHaveBeenCalledWith(
        NOTIFICATION_TOKENS.PUSH_SUBSCRIPTION_SERVICE
      );
      expect(
        mockPushSubscriptionService.deleteSubscription
      ).toHaveBeenCalledWith(1);
      expect(revalidatePath).toHaveBeenCalledWith("/");
      expect(result).toEqual({ success: true });
    });

    it("未認証の場合、エラーを返すこと", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      const result = await deletePushSubscription();

      expect(getCurrentUser).toHaveBeenCalled();
      expect(initializeServerNotificationContainer).not.toHaveBeenCalled();
      expect(
        mockPushSubscriptionService.deleteSubscription
      ).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: "プッシュ通知の解除に失敗しました",
      });
    });

    it("サービスがエラーを投げた場合、エラーを返すこと", async () => {
      mockPushSubscriptionService.deleteSubscription.mockRejectedValue(
        new Error("サービスエラー")
      );

      const result = await deletePushSubscription();

      expect(getCurrentUser).toHaveBeenCalled();
      expect(initializeServerNotificationContainer).toHaveBeenCalled();
      expect(
        mockPushSubscriptionService.deleteSubscription
      ).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        success: false,
        error: "プッシュ通知の解除に失敗しました",
      });
    });
  });

  describe("getPushSubscription", () => {
    it("認証済みユーザーの場合、サブスクリプションを取得し成功を返すこと", async () => {
      const storedSubscription = {
        id: 1,
        userId: 1,
        endpoint: mockSubscription.endpoint,
        p256dh: mockSubscription.keys.p256dh,
        auth: mockSubscription.keys.auth,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPushSubscriptionService.getSubscription.mockResolvedValue(
        storedSubscription
      );

      const result = await getPushSubscription();

      expect(getCurrentUser).toHaveBeenCalled();
      expect(initializeServerNotificationContainer).toHaveBeenCalled();
      expect(serverNotificationContainer.resolve).toHaveBeenCalledWith(
        NOTIFICATION_TOKENS.PUSH_SUBSCRIPTION_SERVICE
      );
      expect(mockPushSubscriptionService.getSubscription).toHaveBeenCalledWith(
        1
      );
      expect(result).toEqual({
        success: true,
        subscription: storedSubscription,
      });
    });

    it("未認証の場合、エラーを返すこと", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      const result = await getPushSubscription();

      expect(getCurrentUser).toHaveBeenCalled();
      expect(initializeServerNotificationContainer).not.toHaveBeenCalled();
      expect(
        mockPushSubscriptionService.getSubscription
      ).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: "プッシュ通知の情報取得に失敗しました",
      });
    });

    it("サービスがエラーを投げた場合、エラーを返すこと", async () => {
      mockPushSubscriptionService.getSubscription.mockRejectedValue(
        new Error("サービスエラー")
      );

      const result = await getPushSubscription();

      expect(getCurrentUser).toHaveBeenCalled();
      expect(initializeServerNotificationContainer).toHaveBeenCalled();
      expect(mockPushSubscriptionService.getSubscription).toHaveBeenCalledWith(
        1
      );
      expect(result).toEqual({
        success: false,
        error: "プッシュ通知の情報取得に失敗しました",
      });
    });
  });
});
