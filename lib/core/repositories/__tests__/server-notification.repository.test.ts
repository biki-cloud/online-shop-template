import "reflect-metadata";
import { ServerNotificationRepository } from "../server-notification.repository.impl";
import { NotificationPayload } from "@/lib/core/domain/notification.domain";

describe("ServerNotificationRepository", () => {
  let repository: ServerNotificationRepository;

  beforeEach(() => {
    repository = new ServerNotificationRepository();
  });

  describe("checkSupport", () => {
    it("常にtrueを返すこと", async () => {
      const result = await repository.checkSupport();
      expect(result).toBe(true);
    });
  });

  describe("requestPermission", () => {
    it("常にtrueを返すこと", async () => {
      const result = await repository.requestPermission();
      expect(result).toBe(true);
    });
  });

  describe("subscribe", () => {
    it("常にnullを返すこと", async () => {
      const result = await repository.subscribe();
      expect(result).toBeNull();
    });
  });

  describe("unsubscribe", () => {
    it("常にtrueを返すこと", async () => {
      const result = await repository.unsubscribe();
      expect(result).toBe(true);
    });
  });

  describe("sendNotification", () => {
    it("常にtrueを返すこと", async () => {
      // モック通知ペイロード
      const mockPayload: NotificationPayload = {
        title: "テスト通知",
        body: "これはテスト通知です",
        url: "https://example.com/test",
      };

      // モックサブスクリプション
      const mockSubscription = {} as PushSubscription;

      const result = await repository.sendNotification(
        mockSubscription,
        mockPayload
      );
      expect(result).toBe(true);
    });
  });

  describe("saveSubscription", () => {
    it("何も行わないこと", async () => {
      // モックサブスクリプション
      const mockSubscription = {} as PushSubscription;

      // 例外が発生しないことを確認
      await expect(
        repository.saveSubscription(mockSubscription)
      ).resolves.toBeUndefined();
    });
  });

  describe("clearSubscription", () => {
    it("何も行わないこと", async () => {
      // 例外が発生しないことを確認
      await expect(repository.clearSubscription()).resolves.toBeUndefined();
    });
  });

  describe("getStoredSubscription", () => {
    it("常にnullを返すこと", async () => {
      const result = await repository.getStoredSubscription();
      expect(result).toBeNull();
    });
  });
});
