import "reflect-metadata";
import { PushSubscriptionService } from "../push-subscription.service.impl";
import {
  IPushSubscriptionRepository,
  WebPushSubscription,
} from "../../repositories/interfaces/push-subscription.repository.interface";
import { PushSubscription } from "@/lib/infrastructure/db/schema";

class MockPushSubscriptionRepository implements IPushSubscriptionRepository {
  private subscriptions: Map<number, PushSubscription> = new Map();

  async save(
    userId: number,
    subscription: WebPushSubscription
  ): Promise<PushSubscription> {
    const newSubscription: PushSubscription = {
      id: this.subscriptions.size + 1,
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.subscriptions.set(userId, newSubscription);
    return newSubscription;
  }

  async delete(userId: number): Promise<void> {
    this.subscriptions.delete(userId);
  }

  async findByUserId(userId: number): Promise<PushSubscription | null> {
    return this.subscriptions.get(userId) || null;
  }

  async findAll(): Promise<PushSubscription[]> {
    return Array.from(this.subscriptions.values());
  }
}

describe("PushSubscriptionService", () => {
  let service: PushSubscriptionService;
  let repository: MockPushSubscriptionRepository;

  const mockUserId = 1;
  const mockSubscription: WebPushSubscription = {
    endpoint: "https://example.com/push-endpoint",
    keys: {
      p256dh: "test-p256dh-key",
      auth: "test-auth-key",
    },
  };

  beforeEach(() => {
    repository = new MockPushSubscriptionRepository();
    service = new PushSubscriptionService(repository);

    // SpyをdependencyのメソッドにセットアップしてMockCallの追跡を可能にします
    jest.spyOn(repository, "save");
    jest.spyOn(repository, "delete");
    jest.spyOn(repository, "findByUserId");
    jest.spyOn(repository, "findAll");
  });

  describe("saveSubscription", () => {
    it("should save a subscription successfully", async () => {
      const result = await service.saveSubscription(
        mockUserId,
        mockSubscription
      );

      expect(repository.save).toHaveBeenCalledWith(
        mockUserId,
        mockSubscription
      );
      expect(result).toEqual(
        expect.objectContaining({
          userId: mockUserId,
          endpoint: mockSubscription.endpoint,
          p256dh: mockSubscription.keys.p256dh,
          auth: mockSubscription.keys.auth,
        })
      );
    });
  });

  describe("deleteSubscription", () => {
    it("should delete a subscription successfully", async () => {
      // First save a subscription
      await service.saveSubscription(mockUserId, mockSubscription);

      // Then delete it
      await service.deleteSubscription(mockUserId);

      expect(repository.delete).toHaveBeenCalledWith(mockUserId);

      // Verify it was deleted
      const subscription = await service.getSubscription(mockUserId);
      expect(subscription).toBeNull();
    });
  });

  describe("getSubscription", () => {
    it("should return subscription when found", async () => {
      // First save a subscription
      await service.saveSubscription(mockUserId, mockSubscription);

      // Then get it
      const result = await service.getSubscription(mockUserId);

      expect(repository.findByUserId).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(
        expect.objectContaining({
          userId: mockUserId,
          endpoint: mockSubscription.endpoint,
          p256dh: mockSubscription.keys.p256dh,
          auth: mockSubscription.keys.auth,
        })
      );
    });

    it("should return null when subscription is not found", async () => {
      const result = await service.getSubscription(999); // Non-existent user ID

      expect(repository.findByUserId).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });

  describe("getAllSubscriptions", () => {
    it("should return all saved subscriptions", async () => {
      // Save multiple subscriptions
      await service.saveSubscription(mockUserId, mockSubscription);
      await service.saveSubscription(2, {
        endpoint: "https://example.com/another-endpoint",
        keys: {
          p256dh: "another-p256dh-key",
          auth: "another-auth-key",
        },
      });

      const results = await service.getAllSubscriptions();

      expect(repository.findAll).toHaveBeenCalled();
      expect(results).toHaveLength(2);
      expect(results[0]).toEqual(
        expect.objectContaining({
          userId: mockUserId,
          endpoint: mockSubscription.endpoint,
        })
      );
      expect(results[1]).toEqual(
        expect.objectContaining({
          userId: 2,
          endpoint: "https://example.com/another-endpoint",
        })
      );
    });

    it("should return empty array when no subscriptions exist", async () => {
      const results = await service.getAllSubscriptions();

      expect(repository.findAll).toHaveBeenCalled();
      expect(results).toHaveLength(0);
    });
  });
});
