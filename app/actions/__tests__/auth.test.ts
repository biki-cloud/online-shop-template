import { jest } from "@jest/globals";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getAuthService,
  getSessionService,
  getUserService,
} from "@/lib/di/container";
import { User, UserRole } from "@/lib/core/domain/user";
import { IAuthService } from "@/lib/core/services/interfaces/auth.service";
import { IUserService } from "@/lib/core/services/interfaces/user.service";
import { ISessionService } from "@/lib/core/services/interfaces/session.service";
import { createCheckoutSession } from "@/lib/infrastructure/payments/stripe";
import {
  signIn,
  signUp,
  signOut,
  updatePassword,
  deleteAccount,
  updateAccount,
} from "../auth";
import { ActionState } from "@/lib/infrastructure/auth/middleware";
import { getCurrentUser } from "../user";

// モックの設定
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/lib/infrastructure/payments/stripe", () => ({
  createCheckoutSession: jest.fn(),
}));

jest.mock("../user", () => ({
  getCurrentUser: jest
    .fn<() => Promise<User | null>>()
    .mockImplementation(async () => Promise.resolve(null)),
}));

// モックユーザー
const mockUser: User = {
  id: 1,
  email: "test@example.com",
  name: "Test User",
  role: "user" as UserRole,
  passwordHash: "hashedPassword",
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

// モックサービス
const mockAuthService: jest.Mocked<IAuthService> = {
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  updatePassword: jest.fn(),
  validateSession: jest.fn(),
  refreshSession: jest.fn(),
  getSessionUser: jest.fn(),
  verifyToken: jest.fn(),
  generateToken: jest.fn(),
  hashPassword: jest.fn(),
  comparePasswords: jest.fn(),
};

const mockUserService: jest.Mocked<IUserService> = {
  update: jest.fn(),
  delete: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  validatePassword: jest.fn(),
};

const mockSessionService: jest.Mocked<ISessionService> = {
  get: jest.fn(),
  set: jest.fn(),
  clear: jest.fn(),
  refresh: jest.fn(),
};

// DIコンテナのモック
jest.mock("@/lib/di/container", () => ({
  getAuthService: jest.fn(() => mockAuthService),
  getUserService: jest.fn(() => mockUserService),
  getSessionService: jest.fn(() => mockSessionService),
}));

describe("Auth Actions", () => {
  const defaultState: ActionState = { data: {} };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("signIn", () => {
    it("should sign in user successfully", async () => {
      mockAuthService.signIn.mockResolvedValue(mockUser);
      mockSessionService.set.mockResolvedValue();

      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "password123");

      const result = await signIn(defaultState, formData);
      expect(result).toEqual({ redirect: "/home" });
    });

    it("should redirect to checkout if redirect parameter is set", async () => {
      mockAuthService.signIn.mockResolvedValue(mockUser);

      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "password123");
      formData.append("redirect", "checkout");

      await signIn(defaultState, formData);

      expect(createCheckoutSession).toHaveBeenCalledWith({
        userId: mockUser.id,
        cart: null,
        cartItems: [],
      });
    });

    it("should return error for invalid credentials", async () => {
      mockAuthService.signIn.mockRejectedValue(new Error("無効な認証情報です"));

      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "wrongpassword");

      const result = await signIn(defaultState, formData);

      expect(result).toEqual({
        error: "無効な認証情報です",
        email: "test@example.com",
        password: "wrongpassword",
      });
    });
  });

  describe("signUp", () => {
    it("should create new user successfully", async () => {
      mockAuthService.signUp.mockResolvedValue(mockUser);
      mockSessionService.set.mockResolvedValue();

      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "password123");
      formData.append("name", "Test User");

      const result = await signUp(defaultState, formData);
      expect(result).toEqual({ redirect: "/home" });
    });

    it("should redirect to checkout if redirect parameter is set", async () => {
      mockAuthService.signUp.mockResolvedValue(mockUser);

      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "password123");
      formData.append("name", "Test User");
      formData.append("redirect", "checkout");

      await signUp(defaultState, formData);

      expect(createCheckoutSession).toHaveBeenCalledWith({
        userId: mockUser.id,
        cart: null,
        cartItems: [],
      });
    });

    it("should return error for existing email", async () => {
      mockAuthService.signUp.mockRejectedValue(
        new Error("このメールアドレスは既に登録されています")
      );

      const formData = new FormData();
      formData.append("email", "existing@example.com");
      formData.append("password", "password123");
      formData.append("name", "Test User");

      const result = await signUp(defaultState, formData);

      expect(result).toEqual({
        error: "このメールアドレスは既に登録されています",
        email: "existing@example.com",
        password: "password123",
        name: "Test User",
      });
    });
  });

  describe("signOut", () => {
    it("should sign out user", async () => {
      await signOut();

      expect(mockAuthService.signOut).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith("/sign-in");
    });
  });

  describe("updatePassword", () => {
    it("should update password successfully", async () => {
      jest.mocked(getCurrentUser).mockResolvedValue(mockUser);
      mockAuthService.comparePasswords.mockResolvedValue(true);
      mockAuthService.updatePassword.mockResolvedValue();

      const formData = new FormData();
      formData.append("currentPassword", "oldPassword123");
      formData.append("newPassword", "newPassword123");
      formData.append("confirmPassword", "newPassword123");

      const result = await updatePassword(defaultState, formData);

      expect(mockAuthService.updatePassword).toHaveBeenCalledWith(
        mockUser.id,
        "oldPassword123",
        "newPassword123"
      );
      expect(result).toEqual({ success: "パスワードを更新しました。" });
    });

    it("should return error for invalid current password", async () => {
      jest.mocked(getCurrentUser).mockResolvedValue(mockUser);
      mockAuthService.comparePasswords.mockResolvedValue(false);

      const formData = new FormData();
      formData.append("currentPassword", "wrongPassword");
      formData.append("newPassword", "newPassword123");
      formData.append("confirmPassword", "newPassword123");

      const result = await updatePassword(defaultState, formData);

      expect(result).toEqual({
        error: "現在のパスワードが正しくありません",
      });
    });
  });

  describe("deleteAccount", () => {
    it("should delete account successfully", async () => {
      jest.mocked(getCurrentUser).mockResolvedValue(mockUser);
      mockAuthService.comparePasswords.mockResolvedValue(true);
      mockUserService.delete.mockResolvedValue(true);

      const formData = new FormData();
      formData.append("password", "password123");

      await deleteAccount(defaultState, formData);

      expect(mockUserService.delete).toHaveBeenCalledWith(mockUser.id);
      expect(mockAuthService.signOut).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith("/sign-in");
    });

    it("should return error for invalid password", async () => {
      jest.mocked(getCurrentUser).mockResolvedValue(mockUser);
      mockAuthService.comparePasswords.mockResolvedValue(false);

      const formData = new FormData();
      formData.append("password", "wrongPassword");

      const result = await deleteAccount(defaultState, formData);

      expect(result).toEqual({
        error: "パスワードが正しくありません。",
      });
      expect(mockUserService.delete).not.toHaveBeenCalled();
    });
  });

  describe("updateAccount", () => {
    it("should update account successfully", async () => {
      mockUserService.update.mockResolvedValue({
        ...mockUser,
        name: "Updated User",
        email: "updated@example.com",
      });

      const formData = new FormData();
      formData.append("name", "Updated User");
      formData.append("email", "updated@example.com");

      const result = await updateAccount(defaultState, formData);
      expect(result).toEqual({ success: "アカウント情報を更新しました。" });
    });

    it("should return error when update fails", async () => {
      mockAuthService.getSessionUser.mockResolvedValue(mockUser);
      mockUserService.update.mockRejectedValue(
        new Error("アカウントの更新に失敗しました")
      );

      const formData = new FormData();
      formData.append("name", "Updated Name");
      formData.append("email", "updated@example.com");

      const result = await updateAccount(defaultState, formData);

      expect(result).toEqual({
        error: "アカウントの更新に失敗しました",
      });
    });
  });
});
