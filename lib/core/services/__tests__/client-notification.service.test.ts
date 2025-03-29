"use client";

import "reflect-metadata";
import { ClientNotificationService } from "../client-notification.service.impl";
import type { INotificationRepository } from "../../repositories/interfaces/notification.repository.interface";
import { NOTIFICATION_TOKENS } from "@/lib/core/constants/notification";
import type { NotificationPayload } from "../../domain/notification.domain";

describe("ClientNotificationService", () => {
  let clientNotificationService: ClientNotificationService;
  let mockNotificationRepository: jest.Mocked<INotificationRepository>;

  // テスト用のモックデータ
  const mockPushSubscription = {
    endpoint: "https://example.com/endpoint",
    keys: {
      auth: "auth_key",
      p256dh: "p256dh_key",
    },
    unsubscribe: jest.fn().mockResolvedValue(true),
    toJSON: jest.fn(),
  } as unknown as PushSubscription;

  const mockNotificationPayload: NotificationPayload = {
    title: "テスト通知",
    body: "これはテスト通知です",
    url: "/test",
  };

  beforeEach(() => {
    // モックリポジトリを設定
    mockNotificationRepository = {
      checkSupport: jest.fn().mockResolvedValue(true),
      requestPermission: jest.fn().mockResolvedValue(true),
      subscribe: jest.fn().mockResolvedValue(mockPushSubscription),
      unsubscribe: jest.fn().mockResolvedValue(true),
      sendNotification: jest.fn().mockResolvedValue(true),
      saveSubscription: jest.fn(),
      clearSubscription: jest.fn(),
      getStoredSubscription: jest.fn().mockResolvedValue(mockPushSubscription),
    };

    // モックをリセット
    jest.clearAllMocks();

    // ClientNotificationServiceのインスタンスを作成
    clientNotificationService = new ClientNotificationService(
      mockNotificationRepository
    );
  });

  describe("checkSupport", () => {
    it("should call repository checkSupport", async () => {
      const result = await clientNotificationService.checkSupport();

      expect(mockNotificationRepository.checkSupport).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should handle when support is not available", async () => {
      mockNotificationRepository.checkSupport.mockResolvedValueOnce(false);

      const result = await clientNotificationService.checkSupport();

      expect(result).toBe(false);
    });
  });

  describe("requestPermission", () => {
    it("should call repository requestPermission", async () => {
      const result = await clientNotificationService.requestPermission();

      expect(mockNotificationRepository.requestPermission).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should handle permission denied", async () => {
      mockNotificationRepository.requestPermission.mockResolvedValueOnce(false);

      const result = await clientNotificationService.requestPermission();

      expect(result).toBe(false);
    });
  });

  describe("subscribe", () => {
    it("should call repository subscribe and save subscription if successful", async () => {
      const result = await clientNotificationService.subscribe();

      expect(mockNotificationRepository.subscribe).toHaveBeenCalled();
      expect(mockNotificationRepository.saveSubscription).toHaveBeenCalledWith(
        mockPushSubscription
      );
      expect(result).toBe(mockPushSubscription);
    });

    it("should not save subscription if subscribe returns null", async () => {
      mockNotificationRepository.subscribe.mockResolvedValueOnce(null);

      const result = await clientNotificationService.subscribe();

      expect(mockNotificationRepository.subscribe).toHaveBeenCalled();
      expect(
        mockNotificationRepository.saveSubscription
      ).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("unsubscribe", () => {
    it("should call repository unsubscribe and clear subscription if successful", async () => {
      const result = await clientNotificationService.unsubscribe(
        mockPushSubscription
      );

      expect(mockNotificationRepository.unsubscribe).toHaveBeenCalledWith(
        mockPushSubscription
      );
      expect(mockNotificationRepository.clearSubscription).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should not clear subscription if unsubscribe fails", async () => {
      mockNotificationRepository.unsubscribe.mockResolvedValueOnce(false);

      const result = await clientNotificationService.unsubscribe(
        mockPushSubscription
      );

      expect(mockNotificationRepository.unsubscribe).toHaveBeenCalledWith(
        mockPushSubscription
      );
      expect(
        mockNotificationRepository.clearSubscription
      ).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe("sendNotification", () => {
    it("should call repository sendNotification", async () => {
      const result = await clientNotificationService.sendNotification(
        mockPushSubscription,
        mockNotificationPayload
      );

      expect(mockNotificationRepository.sendNotification).toHaveBeenCalledWith(
        mockPushSubscription,
        mockNotificationPayload
      );
      expect(result).toBe(true);
    });

    it("should handle failed notification", async () => {
      mockNotificationRepository.sendNotification.mockResolvedValueOnce(false);

      const result = await clientNotificationService.sendNotification(
        mockPushSubscription,
        mockNotificationPayload
      );

      expect(result).toBe(false);
    });
  });

  describe("getStoredSubscription", () => {
    it("should call repository getStoredSubscription", async () => {
      const result = await clientNotificationService.getStoredSubscription();

      expect(
        mockNotificationRepository.getStoredSubscription
      ).toHaveBeenCalled();
      expect(result).toBe(mockPushSubscription);
    });

    it("should handle when no subscription is stored", async () => {
      mockNotificationRepository.getStoredSubscription.mockResolvedValueOnce(
        null
      );

      const result = await clientNotificationService.getStoredSubscription();

      expect(result).toBeNull();
    });
  });
});
