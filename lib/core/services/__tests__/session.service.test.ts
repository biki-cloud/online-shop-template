import "reflect-metadata";
import { SessionService } from "../session.service.impl";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "@/lib/core/domain/user.domain";

// cookiesのモック
const mockCookieJar: Record<string, string> = {};
const mockCookies = {
  get: jest.fn((name: string) => ({
    value: mockCookieJar[name] || undefined,
  })),
  set: jest.fn((name: string, value: string, options: any) => {
    mockCookieJar[name] = value;
  }),
  delete: jest.fn((name: string) => {
    delete mockCookieJar[name];
  }),
};

jest.mock("next/headers", () => ({
  cookies: jest.fn().mockImplementation(() => Promise.resolve(mockCookies)),
}));

// joseのモック
jest.mock("jose", () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue("mocked-jwt-token"),
  })),
  jwtVerify: jest.fn(),
}));

// 環境変数のモック
const originalEnv = process.env;
beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv, AUTH_SECRET: "test-secret-key" };
  // テスト間でモックの状態をリセット
  Object.keys(mockCookieJar).forEach((key) => delete mockCookieJar[key]);
  jest.clearAllMocks();
});

afterAll(() => {
  process.env = originalEnv;
});

describe("SessionService", () => {
  let sessionService: SessionService;

  const mockUser: User = {
    id: 1,
    email: "test@example.com",
    name: "Test User",
    role: "user",
    passwordHash: "hashedPassword",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockSessionPayload = {
    user: {
      id: 1,
      role: "user",
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  beforeEach(() => {
    sessionService = new SessionService();
  });

  describe("constructor", () => {
    it("AUTH_SECRETが未設定の場合にエラーをスローすること", () => {
      process.env.AUTH_SECRET = undefined;
      expect(() => new SessionService()).toThrow(
        "AUTH_SECRET environment variable is not set"
      );
    });
  });

  describe("set", () => {
    it("ユーザー情報をセッションにセットできること", async () => {
      await sessionService.set(mockUser);

      expect(SignJWT).toHaveBeenCalledWith(
        expect.objectContaining({
          user: { id: 1, role: "user" },
          expires: expect.any(String),
        })
      );
      expect(mockCookies.set).toHaveBeenCalledWith(
        "session",
        "mocked-jwt-token",
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: "lax",
        })
      );
    });
  });

  describe("get", () => {
    it("セッションが存在しない場合にnullを返すこと", async () => {
      const result = await sessionService.get();
      expect(result).toBeNull();
    });

    it("有効なセッションを取得できること", async () => {
      // セッションを設定
      mockCookieJar["session"] = "valid-jwt-token";

      // jwtVerifyのモックレスポンス
      (jwtVerify as jest.Mock).mockResolvedValueOnce({
        payload: mockSessionPayload,
      });

      const result = await sessionService.get();

      // jwtVerifyが呼ばれたことだけを確認
      expect(jwtVerify).toHaveBeenCalled();
      expect(result).toEqual({
        userId: 1,
        role: "user",
      });
    });

    it("無効なJWTトークンの場合にnullを返すこと", async () => {
      // セッションを設定
      mockCookieJar["session"] = "invalid-jwt-token";

      // jwtVerifyのモックがエラーをスロー
      (jwtVerify as jest.Mock).mockRejectedValueOnce(
        new Error("Invalid token")
      );

      const result = await sessionService.get();

      expect(result).toBeNull();
    });

    it("不完全なペイロードの場合にnullを返すこと", async () => {
      // セッションを設定
      mockCookieJar["session"] = "incomplete-jwt-token";

      // jwtVerifyの不完全なペイロード
      (jwtVerify as jest.Mock).mockResolvedValueOnce({
        payload: { user: { id: 1 } }, // roleが欠けている
      });

      const result = await sessionService.get();

      expect(result).toBeNull();
    });
  });

  describe("clear", () => {
    it("セッションを正常にクリアできること", async () => {
      await sessionService.clear();

      expect(mockCookies.delete).toHaveBeenCalledWith("session");
    });
  });

  describe("refresh", () => {
    it("既存のセッションを更新できること", async () => {
      // セッションを設定
      mockCookieJar["session"] = "valid-jwt-token";

      // getメソッドの結果をモック
      (jwtVerify as jest.Mock).mockResolvedValueOnce({
        payload: mockSessionPayload,
      });

      await sessionService.refresh();

      // setメソッドが正しく呼ばれているか
      expect(SignJWT).toHaveBeenCalledWith(
        expect.objectContaining({
          user: { id: 1, role: "user" },
        })
      );
      expect(mockCookies.set).toHaveBeenCalled();
    });

    it("セッションが存在しない場合に何もしないこと", async () => {
      await sessionService.refresh();

      expect(SignJWT).not.toHaveBeenCalled();
      expect(mockCookies.set).not.toHaveBeenCalled();
    });
  });
});
