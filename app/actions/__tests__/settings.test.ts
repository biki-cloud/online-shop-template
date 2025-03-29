import { testEmail } from "../settings";
import { getContainer } from "@/lib/di/container";
import { EmailTemplates } from "@/lib/core/domain/email.domain";

// モックの設定
jest.mock("@/lib/di/container", () => ({
  getContainer: jest.fn(),
}));

describe("設定アクション", () => {
  // モックサービス
  const mockEmailService = {
    send: jest.fn(),
  };

  // 各テスト前のセットアップ
  beforeEach(() => {
    jest.clearAllMocks();

    // DIコンテナのモック
    const mockContainer = {
      resolve: jest.fn().mockReturnValue(mockEmailService),
    };
    (getContainer as jest.Mock).mockReturnValue(mockContainer);
  });

  describe("testEmail", () => {
    it("通常のテストメールとテンプレートメールを送信すること", async () => {
      const testData = {
        email: "test@example.com",
      };

      await testEmail(testData);

      // 普通のテストメールが送信されたか確認
      expect(mockEmailService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "test@example.com",
          subject: "テストメール",
          text: expect.stringContaining("これはテストメールです"),
        })
      );

      // テンプレートメールが送信されたか確認
      expect(mockEmailService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "test@example.com",
          template: {
            name: EmailTemplates.WELCOME,
            data: {
              name: "テストユーザー",
              verificationUrl: "https://example.com/verify",
            },
          },
        })
      );
    });

    it("無効なメールアドレスでエラーをスローすること", async () => {
      const invalidData = {
        email: "invalid-email",
      };

      await expect(testEmail(invalidData)).rejects.toThrow();
    });
  });
});
