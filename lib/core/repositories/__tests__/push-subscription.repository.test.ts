import "reflect-metadata";
import { PushSubscriptionRepository } from "../push-subscription.repository.impl";
import { pushSubscriptions } from "@/lib/infrastructure/db/schema";
import { eq } from "drizzle-orm";

// モックの設定
jest.mock("@/lib/infrastructure/db/schema", () => ({
  pushSubscriptions: {
    userId: "userId",
  },
}));

describe("PushSubscriptionRepository", () => {
  // モックデータベース
  let mockDb: any;
  let repository: PushSubscriptionRepository;

  // モック通知サブスクリプション
  const mockSubscription = {
    endpoint: "https://example.com/push-endpoint",
    keys: {
      p256dh: "test-p256dh-key",
      auth: "test-auth-key",
    },
  };

  // 保存されたサブスクリプションのモック
  const savedSubscription = {
    id: 1,
    userId: 123,
    endpoint: "https://example.com/push-endpoint",
    p256dh: "test-p256dh-key",
    auth: "test-auth-key",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // 各テスト前にモックを再作成
    mockDb = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn(),
      delete: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    };

    repository = new PushSubscriptionRepository(mockDb);
  });

  describe("save", () => {
    it("既存のサブスクリプションを削除し、新しいサブスクリプションを保存すること", async () => {
      mockDb.returning.mockResolvedValue([savedSubscription]);

      const result = await repository.save(123, mockSubscription);

      // 既存のサブスクリプションを削除する呼び出しを確認
      expect(mockDb.delete).toHaveBeenCalledWith(pushSubscriptions);
      expect(mockDb.where).toHaveBeenCalled();

      // 新しいサブスクリプションの保存を確認
      expect(mockDb.insert).toHaveBeenCalledWith(pushSubscriptions);
      expect(mockDb.values).toHaveBeenCalledWith({
        userId: 123,
        endpoint: mockSubscription.endpoint,
        p256dh: mockSubscription.keys.p256dh,
        auth: mockSubscription.keys.auth,
      });
      expect(mockDb.returning).toHaveBeenCalled();

      // 結果を確認
      expect(result).toEqual(savedSubscription);
    });

    it("データベースエラーが発生した場合、例外をスローすること", async () => {
      // データベースエラーをシミュレート
      const dbError = new Error("Database error");
      mockDb.delete.mockImplementation(() => {
        throw dbError;
      });

      await expect(repository.save(123, mockSubscription)).rejects.toThrow(
        dbError
      );
    });
  });

  describe("delete", () => {
    it("ユーザーIDに基づいてサブスクリプションを削除すること", async () => {
      await repository.delete(123);

      expect(mockDb.delete).toHaveBeenCalledWith(pushSubscriptions);
      expect(mockDb.where).toHaveBeenCalled();
    });

    it("データベースエラーが発生した場合、例外をスローすること", async () => {
      // データベースエラーをシミュレート
      const dbError = new Error("Database error");
      mockDb.delete.mockImplementation(() => {
        throw dbError;
      });

      await expect(repository.delete(123)).rejects.toThrow(dbError);
    });
  });

  describe("findByUserId", () => {
    it("ユーザーIDに基づいてサブスクリプションを見つけること", async () => {
      mockDb.limit.mockResolvedValue([savedSubscription]);

      const result = await repository.findByUserId(123);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(pushSubscriptions);
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalledWith(1);
      expect(result).toEqual(savedSubscription);
    });

    it("サブスクリプションが存在しない場合にnullを返すこと", async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await repository.findByUserId(123);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(pushSubscriptions);
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalledWith(1);
      expect(result).toBeNull();
    });

    it("データベースエラーが発生した場合、例外をスローすること", async () => {
      // データベースエラーをシミュレート
      const dbError = new Error("Database error");
      mockDb.select.mockImplementation(() => {
        throw dbError;
      });

      await expect(repository.findByUserId(123)).rejects.toThrow(dbError);
    });
  });

  describe("findAll", () => {
    it("すべてのサブスクリプションを取得すること", async () => {
      const allSubscriptions = [
        savedSubscription,
        { ...savedSubscription, id: 2, userId: 456 },
      ];
      mockDb.from.mockResolvedValue(allSubscriptions);

      const result = await repository.findAll();

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(pushSubscriptions);
      expect(result).toEqual(allSubscriptions);
    });

    it("サブスクリプションが存在しない場合に空の配列を返すこと", async () => {
      mockDb.from.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(pushSubscriptions);
      expect(result).toEqual([]);
    });

    it("データベースエラーが発生した場合、例外をスローすること", async () => {
      // データベースエラーをシミュレート
      const dbError = new Error("Database error");
      mockDb.select.mockImplementation(() => {
        throw dbError;
      });

      await expect(repository.findAll()).rejects.toThrow(dbError);
    });
  });
});
