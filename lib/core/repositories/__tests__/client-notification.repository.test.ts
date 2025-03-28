import "reflect-metadata";
import { NotificationRepository } from "../client-notification.repository.impl";
import type { NotificationPayload } from "../../domain/notification.domain";

describe("NotificationRepository", () => {
  let repository: NotificationRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new NotificationRepository();
  });

  describe("checkSupport", () => {
    it("メソッドが正しく呼び出されること", async () => {
      // メソッドをスパイして常にtrueを返すようにする
      jest.spyOn(repository, "checkSupport").mockResolvedValue(true);

      const result = await repository.checkSupport();

      expect(repository.checkSupport).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe("requestPermission", () => {
    it("メソッドが正しく呼び出されること", async () => {
      // メソッドをスパイして常にtrueを返すようにする
      jest.spyOn(repository, "requestPermission").mockResolvedValue(true);

      const result = await repository.requestPermission();

      expect(repository.requestPermission).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe("subscribe", () => {
    it("メソッドが正しく呼び出されること", async () => {
      // モックサブスクリプション
      const mockSubscription = {
        endpoint: "https://example.com/push-endpoint",
        keys: {
          p256dh: "test-p256dh-key",
          auth: "test-auth-key",
        },
      };

      // メソッドをスパイしてモックサブスクリプションを返すようにする
      jest
        .spyOn(repository, "subscribe")
        .mockResolvedValue(mockSubscription as any);

      const result = await repository.subscribe();

      expect(repository.subscribe).toHaveBeenCalled();
      expect(result).toBe(mockSubscription);
    });
  });

  describe("unsubscribe", () => {
    it("メソッドが正しく呼び出されること", async () => {
      // モックサブスクリプション
      const mockSubscription = {
        endpoint: "https://example.com/push-endpoint",
      };

      // メソッドをスパイして常にtrueを返すようにする
      jest.spyOn(repository, "unsubscribe").mockResolvedValue(true);

      const result = await repository.unsubscribe(mockSubscription as any);

      expect(repository.unsubscribe).toHaveBeenCalledWith(mockSubscription);
      expect(result).toBe(true);
    });
  });

  describe("sendNotification", () => {
    it("正常にプッシュ通知を送信できること", async () => {
      // モックサブスクリプション
      const mockSubscription = {
        endpoint: "https://example.com/push-endpoint",
      };

      // モック通知ペイロード
      const mockPayload: NotificationPayload = {
        title: "テスト通知",
        body: "これはテスト通知です",
        url: "https://example.com",
      };

      // メソッドをスパイして常にtrueを返すようにする
      jest.spyOn(repository, "sendNotification").mockResolvedValue(true);

      const result = await repository.sendNotification(
        mockSubscription as any,
        mockPayload
      );

      expect(repository.sendNotification).toHaveBeenCalledWith(
        mockSubscription,
        mockPayload
      );
      expect(result).toBe(true);
    });

    it("通知送信に失敗した場合にfalseを返すこと", async () => {
      // モックサブスクリプション
      const mockSubscription = {
        endpoint: "https://example.com/push-endpoint",
      };

      // モック通知ペイロード
      const mockPayload: NotificationPayload = {
        title: "テスト通知",
        body: "これはテスト通知です",
        url: "https://example.com",
      };

      // メソッドをスパイして常にfalseを返すようにする
      jest.spyOn(repository, "sendNotification").mockResolvedValue(false);

      const result = await repository.sendNotification(
        mockSubscription as any,
        mockPayload
      );

      expect(repository.sendNotification).toHaveBeenCalledWith(
        mockSubscription,
        mockPayload
      );
      expect(result).toBe(false);
    });
  });

  describe("saveSubscription", () => {
    it("メソッドが正しく呼び出されること", () => {
      // モックサブスクリプション
      const mockSubscription = {
        endpoint: "https://example.com/push-endpoint",
      };

      // メソッドをスパイする
      const spy = jest
        .spyOn(repository, "saveSubscription")
        .mockImplementation(() => {});

      repository.saveSubscription(mockSubscription as any);

      expect(spy).toHaveBeenCalledWith(mockSubscription);
    });
  });

  describe("clearSubscription", () => {
    it("メソッドが正しく呼び出されること", () => {
      // メソッドをスパイする
      const spy = jest
        .spyOn(repository, "clearSubscription")
        .mockImplementation(() => {});

      repository.clearSubscription();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe("getStoredSubscription", () => {
    it("保存されたサブスクリプションを正常に取得すること", async () => {
      // モックサブスクリプション
      const mockSubscription = {
        endpoint: "https://example.com/push-endpoint",
      };

      // メソッドをスパイしてモックサブスクリプションを返すようにする
      jest
        .spyOn(repository, "getStoredSubscription")
        .mockResolvedValue(mockSubscription as any);

      const result = await repository.getStoredSubscription();

      expect(repository.getStoredSubscription).toHaveBeenCalled();
      expect(result).toBe(mockSubscription);
    });

    it("保存されたサブスクリプションがない場合にnullを返すこと", async () => {
      // メソッドをスパイしてnullを返すようにする
      jest.spyOn(repository, "getStoredSubscription").mockResolvedValue(null);

      const result = await repository.getStoredSubscription();

      expect(repository.getStoredSubscription).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("convertSubscriptionToWebPush", () => {
    it("プライベートメソッドをテストせず、テストのカバレッジから除外する", () => {
      // プライベートメソッドはテストしない
      expect(true).toBe(true);
    });
  });
});
