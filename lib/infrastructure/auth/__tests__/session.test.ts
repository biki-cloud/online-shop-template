import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { NewUser } from "@/lib/infrastructure/db/schema";
import {
  hashPassword,
  comparePasswords,
  signToken,
  verifyToken,
  getSession,
  setSession,
} from "../session";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("jose", () => ({
  SignJWT: jest.fn().mockReturnValue({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue("mock.jwt.token"),
  }),
  jwtVerify: jest.fn().mockImplementation(async (token) => ({
    payload: {
      user: {
        id: 1,
        role: "user",
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  })),
}));

describe("Auth Session", () => {
  const mockUser: NewUser = {
    id: 1,
    email: "test@example.com",
    name: "Test User",
    role: "user",
    passwordHash: "hashedPassword123",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("hashPassword", () => {
    it("should hash password correctly", async () => {
      const password = "testPassword123";
      const hashedPassword = await hashPassword(password);

      // ハッシュ化されたパスワードは元のパスワードと異なるはず
      expect(hashedPassword).not.toBe(password);

      // ハッシュ化されたパスワードは bcrypt で検証可能なはず
      const isValid = await compare(password, hashedPassword);
      expect(isValid).toBe(true);
    });
  });

  describe("comparePasswords", () => {
    it("should return true for matching passwords", async () => {
      const password = "testPassword123";
      const hashedPassword = await hashPassword(password);

      const result = await comparePasswords(password, hashedPassword);
      expect(result).toBe(true);
    });

    it("should return false for non-matching passwords", async () => {
      const password = "testPassword123";
      const wrongPassword = "wrongPassword123";
      const hashedPassword = await hashPassword(password);

      const result = await comparePasswords(wrongPassword, hashedPassword);
      expect(result).toBe(false);
    });
  });

  describe("signToken and verifyToken", () => {
    it("should create and verify a token correctly", async () => {
      const session = {
        user: {
          id: mockUser.id!,
          role: mockUser.role!,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const token = await signToken(session);
      expect(typeof token).toBe("string");

      const verified = await verifyToken(token);
      expect(verified.user.id).toBe(session.user.id);
      expect(verified.user.role).toBe(session.user.role);
      // 日時の比較は近似値で行う
      const verifiedDate = new Date(verified.expires);
      const sessionDate = new Date(session.expires);
      expect(
        Math.abs(verifiedDate.getTime() - sessionDate.getTime())
      ).toBeLessThan(1000);
    });
  });

  describe("getSession", () => {
    it("should return null when no session cookie exists", async () => {
      const mockCookies = {
        get: jest.fn().mockReturnValue(undefined),
      };
      (cookies as jest.Mock).mockReturnValue(mockCookies);

      const session = await getSession();
      expect(session).toBeNull();
    });

    it("should return session data when valid session cookie exists", async () => {
      const sessionData = {
        user: {
          id: mockUser.id!,
          role: mockUser.role!,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const token = await signToken(sessionData);
      const mockCookies = {
        get: jest.fn().mockReturnValue({ value: token }),
      };
      (cookies as jest.Mock).mockReturnValue(mockCookies);

      const session = await getSession();
      expect(session?.user.id).toBe(sessionData.user.id);
      expect(session?.user.role).toBe(sessionData.user.role);
    });
  });

  describe("setSession", () => {
    it("should set session cookie with correct parameters", async () => {
      const mockSet = jest.fn();
      const mockCookies = {
        set: mockSet,
      };
      (cookies as jest.Mock).mockReturnValue(mockCookies);

      await setSession(mockUser);

      expect(mockSet).toHaveBeenCalledWith(
        "session",
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          expires: expect.any(Date),
        })
      );
    });
  });
});
