import "reflect-metadata";
import { NotificationRepository } from "../client-notification.repository.impl";
import type { NotificationPayload } from "../../domain/notification.domain";

// グローバルオブジェクトのモック
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

const mockServiceWorkerRegistration = {
  pushManager: {
    subscribe: jest.fn(),
    getSubscription: jest.fn(),
  },
};

const mockServiceWorker = {
  ready: Promise.resolve(mockServiceWorkerRegistration),
};

const mockNotification = {
  requestPermission: jest.fn(),
};

const mockFetch = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  });
});

describe("NotificationRepository", () => {
  let repository: NotificationRepository;
  let originalWindow: any;

  // モックサブスクリプション
  const mockSubscription = {
    endpoint: "https://example.com/push-endpoint",
    unsubscribe: jest.fn(),
    getKey: jest.fn((key) => {
      if (key === "p256dh") return new Uint8Array([1, 2, 3]);
      if (key === "auth") return new Uint8Array([4, 5, 6]);
      return null;
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // グローバルオブジェクトを保存
    originalWindow = { ...global.window };

    // windowオブジェクトのモック
    Object.defineProperty(global, "window", {
      value: {
        Notification: mockNotification,
      },
      writable: true,
    });

    // Notificationオブジェクトのモック
    Object.defineProperty(global, "Notification", {
      value: mockNotification,
      writable: true,
    });

    // navigatorオブジェクトのモック
    Object.defineProperty(global, "navigator", {
      value: {
        serviceWorker: mockServiceWorker,
      },
      writable: true,
    });

    // localStorageのモック
    Object.defineProperty(global, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });

    // fetchのモック
    global.fetch = mockFetch;

    // 環境変数のモック
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "test-public-key";

    repository = new NotificationRepository();
  });

  afterEach(() => {
    // テスト後にグローバルオブジェクトを元に戻す
    Object.defineProperty(global, "window", {
      value: originalWindow,
      writable: true,
    });

    // フェッチのクリーンアップ
    jest.restoreAllMocks();
  });

  describe("checkSupport", () => {
    it("通知機能がサポートされている場合にtrueを返すこと", async () => {
      const result = await repository.checkSupport();
      expect(result).toBe(true);
    });

    it("windowが未定義の場合にfalseを返すこと", async () => {
      // windowをundefinedに設定
      Object.defineProperty(global, "window", {
        value: undefined,
        writable: true,
      });

      const result = await repository.checkSupport();
      expect(result).toBe(false);
    });
  });

  describe("requestPermission", () => {
    it("許可された場合にtrueを返すこと", async () => {
      mockNotification.requestPermission.mockResolvedValueOnce("granted");

      const result = await repository.requestPermission();

      expect(mockNotification.requestPermission).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("許可されなかった場合にfalseを返すこと", async () => {
      mockNotification.requestPermission.mockResolvedValueOnce("denied");

      const result = await repository.requestPermission();

      expect(mockNotification.requestPermission).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it("windowが未定義の場合にfalseを返すこと", async () => {
      Object.defineProperty(global, "window", {
        value: undefined,
        writable: true,
      });

      const result = await repository.requestPermission();
      expect(result).toBe(false);
    });
  });

  describe("subscribe", () => {
    it("サブスクリプションに成功した場合にPushSubscriptionを返すこと", async () => {
      mockServiceWorkerRegistration.pushManager.subscribe.mockResolvedValueOnce(
        mockSubscription
      );

      const result = await repository.subscribe();

      expect(
        mockServiceWorkerRegistration.pushManager.subscribe
      ).toHaveBeenCalledWith({
        userVisibleOnly: true,
        applicationServerKey: "test-public-key",
      });
      expect(result).toBe(mockSubscription);
    });

    it("サブスクリプションに失敗した場合にnullを返すこと", async () => {
      mockServiceWorkerRegistration.pushManager.subscribe.mockRejectedValueOnce(
        new Error("Subscription failed")
      );

      const result = await repository.subscribe();

      expect(
        mockServiceWorkerRegistration.pushManager.subscribe
      ).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("windowが未定義の場合にnullを返すこと", async () => {
      Object.defineProperty(global, "window", {
        value: undefined,
        writable: true,
      });

      const result = await repository.subscribe();
      expect(result).toBeNull();
    });
  });

  describe("unsubscribe", () => {
    it("サブスクリプション解除に成功した場合にtrueを返すこと", async () => {
      mockSubscription.unsubscribe.mockResolvedValueOnce(undefined);

      const result = await repository.unsubscribe(mockSubscription as any);

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("サブスクリプション解除に失敗した場合にfalseを返すこと", async () => {
      mockSubscription.unsubscribe.mockRejectedValueOnce(
        new Error("Unsubscribe failed")
      );

      const result = await repository.unsubscribe(mockSubscription as any);

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it("windowが未定義の場合にfalseを返すこと", async () => {
      Object.defineProperty(global, "window", {
        value: undefined,
        writable: true,
      });

      const result = await repository.unsubscribe(mockSubscription as any);
      expect(result).toBe(false);
    });
  });

  describe("sendNotification", () => {
    it("通知送信に成功した場合にtrueを返すこと", async () => {
      // モック通知ペイロード
      const mockPayload: NotificationPayload = {
        title: "テスト通知",
        body: "これはテスト通知です",
        url: "https://example.com",
      };

      const result = await repository.sendNotification(
        mockSubscription as any,
        mockPayload
      );

      expect(global.fetch).toHaveBeenCalledWith("/api/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: expect.any(String),
      });
      expect(result).toBe(true);
    });

    it("通知送信に失敗した場合にfalseを返すこと", async () => {
      // モック通知ペイロード
      const mockPayload: NotificationPayload = {
        title: "テスト通知",
        body: "これはテスト通知です",
        url: "https://example.com",
      };

      // fetchのレスポンスをエラーに設定
      global.fetch = jest.fn().mockImplementation(() => {
        return Promise.resolve({
          ok: false,
        });
      });

      const result = await repository.sendNotification(
        mockSubscription as any,
        mockPayload
      );

      expect(global.fetch).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it("fetchでエラーが発生した場合にfalseを返すこと", async () => {
      // モック通知ペイロード
      const mockPayload: NotificationPayload = {
        title: "テスト通知",
        body: "これはテスト通知です",
        url: "https://example.com",
      };

      // fetchの実装をエラーに設定
      global.fetch = jest
        .fn()
        .mockRejectedValueOnce(new Error("Network error"));

      const result = await repository.sendNotification(
        mockSubscription as any,
        mockPayload
      );

      expect(global.fetch).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it("windowが未定義の場合にfalseを返すこと", async () => {
      Object.defineProperty(global, "window", {
        value: undefined,
        writable: true,
      });

      const mockPayload: NotificationPayload = {
        title: "テスト通知",
        body: "これはテスト通知です",
        url: "https://example.com",
      };

      const result = await repository.sendNotification(
        mockSubscription as any,
        mockPayload
      );
      expect(result).toBe(false);
    });
  });

  describe("saveSubscription", () => {
    it("サブスクリプションをlocalStorageに保存すること", () => {
      repository.saveSubscription(mockSubscription as any);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "push-notification-status",
        "true"
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "push-subscription",
        expect.any(String)
      );
    });

    it("windowが未定義の場合に何も実行しないこと", () => {
      Object.defineProperty(global, "window", {
        value: undefined,
        writable: true,
      });

      repository.saveSubscription(mockSubscription as any);

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe("clearSubscription", () => {
    it("サブスクリプションをlocalStorageから削除すること", () => {
      repository.clearSubscription();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "push-notification-status"
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "push-subscription"
      );
    });

    it("windowが未定義の場合に何も実行しないこと", () => {
      Object.defineProperty(global, "window", {
        value: undefined,
        writable: true,
      });

      repository.clearSubscription();

      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });
  });

  describe("getStoredSubscription", () => {
    it("保存されたサブスクリプションを正しく取得すること", async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === "push-notification-status") return "true";
        if (key === "push-subscription")
          return JSON.stringify(mockSubscription);
        return null;
      });

      mockServiceWorkerRegistration.pushManager.getSubscription.mockResolvedValueOnce(
        mockSubscription
      );

      const result = await repository.getStoredSubscription();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        "push-notification-status"
      );
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        "push-subscription"
      );
      expect(
        mockServiceWorkerRegistration.pushManager.getSubscription
      ).toHaveBeenCalled();
      expect(result).toBe(mockSubscription);
    });

    it("保存されたサブスクリプションがない場合にnullを返すこと", async () => {
      mockLocalStorage.getItem.mockReturnValueOnce(null);

      const result = await repository.getStoredSubscription();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        "push-notification-status"
      );
      expect(result).toBeNull();
    });

    it("サブスクリプション取得に失敗した場合にnullを返し、ストレージをクリアすること", async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === "push-notification-status") return "true";
        if (key === "push-subscription")
          return JSON.stringify(mockSubscription);
        return null;
      });

      mockServiceWorkerRegistration.pushManager.getSubscription.mockRejectedValueOnce(
        new Error("Failed to get subscription")
      );

      const result = await repository.getStoredSubscription();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        "push-notification-status"
      );
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        "push-subscription"
      );
      expect(
        mockServiceWorkerRegistration.pushManager.getSubscription
      ).toHaveBeenCalled();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "push-notification-status"
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "push-subscription"
      );
      expect(result).toBeNull();
    });

    it("windowが未定義の場合にnullを返すこと", async () => {
      Object.defineProperty(global, "window", {
        value: undefined,
        writable: true,
      });

      const result = await repository.getStoredSubscription();
      expect(result).toBeNull();
    });
  });

  describe("convertSubscriptionToWebPush", () => {
    it("PushSubscriptionをWebPushSubscriptionに正しく変換すること", () => {
      const convertMethod = (repository as any).convertSubscriptionToWebPush;
      const result = convertMethod(mockSubscription);

      expect(result).toEqual({
        endpoint: "https://example.com/push-endpoint",
        keys: {
          p256dh: expect.any(String),
          auth: expect.any(String),
        },
      });
    });
  });
});
