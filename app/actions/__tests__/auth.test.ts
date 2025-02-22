import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { User } from "@/lib/infrastructure/db/schema";
import { getContainer } from "@/lib/di/container";
import { IUserService } from "@/lib/core/services/interfaces/user.service";
import { createCheckoutSession } from "@/lib/infrastructure/payments/stripe";
import { setSession, hashPassword } from "@/lib/infrastructure/auth/session";
import {
  signIn,
  signUp,
  signOut,
  updatePassword,
  deleteAccount,
  updateAccount,
} from "../auth";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/lib/di/container", () => ({
  getContainer: jest.fn(),
}));

jest.mock("@/lib/infrastructure/payments/stripe", () => ({
  createCheckoutSession: jest.fn(),
}));

jest.mock("@/lib/infrastructure/auth/session", () => ({
  setSession: jest.fn(),
  hashPassword: jest.fn().mockResolvedValue("hashedPassword123"),
  getSession: jest.fn().mockResolvedValue({
    user: {
      id: 1,
      role: "user",
    },
  }),
}));

jest.mock("@/app/actions/user", () => ({
  getCurrentUser: jest.fn().mockResolvedValue({
    id: 1,
    email: "test@example.com",
    name: "Test User",
    role: "user",
    passwordHash: "hashedPassword123",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }),
}));

describe("Auth Actions", () => {
  const mockUser: User = {
    id: 1,
    email: "test@example.com",
    name: "Test User",
    role: "user",
    passwordHash: "hashedPassword123",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockUserService = {
    validatePassword: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getContainer as jest.Mock).mockReturnValue({
      resolve: jest.fn().mockReturnValue(mockUserService),
    });
  });

  describe("signIn", () => {
    const validFormData = new FormData();
    validFormData.append("email", "test@example.com");
    validFormData.append("password", "password123");

    it("should sign in user successfully", async () => {
      mockUserService.validatePassword.mockResolvedValue(mockUser);

      const result = await signIn({}, validFormData);

      expect(mockUserService.validatePassword).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
      expect(setSession).toHaveBeenCalledWith(mockUser);
      expect(redirect).toHaveBeenCalledWith("/home");
    });

    it("should return error for invalid credentials", async () => {
      mockUserService.validatePassword.mockResolvedValue(null);

      const result = await signIn({}, validFormData);

      expect(result).toEqual({
        error: "メールアドレスまたはパスワードが正しくありません。",
        email: "test@example.com",
        password: "password123",
      });
    });

    it("should redirect to checkout if redirect parameter is set", async () => {
      mockUserService.validatePassword.mockResolvedValue(mockUser);
      const checkoutFormData = new FormData();
      checkoutFormData.append("email", "test@example.com");
      checkoutFormData.append("password", "password123");
      checkoutFormData.append("redirect", "checkout");

      await signIn({}, checkoutFormData);

      expect(createCheckoutSession).toHaveBeenCalledWith({
        userId: mockUser.id,
        cart: null,
        cartItems: [],
      });
    });
  });

  describe("signUp", () => {
    const validFormData = new FormData();
    validFormData.append("email", "test@example.com");
    validFormData.append("password", "password123");
    validFormData.append("name", "Test User");

    it("should create new user successfully", async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.create.mockResolvedValue(mockUser);

      await signUp({}, validFormData);

      expect(mockUserService.create).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        role: "user",
      });
      expect(setSession).toHaveBeenCalledWith(mockUser);
      expect(redirect).toHaveBeenCalledWith("/home");
    });

    it("should return error for existing email", async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);

      const result = await signUp({}, validFormData);

      expect(result).toEqual({
        error: "このメールアドレスは既に登録されています。",
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });
    });
  });

  describe("signOut", () => {
    it("should delete session cookie and redirect to sign-in", async () => {
      const mockDelete = jest.fn();
      (cookies as jest.Mock).mockReturnValue({
        delete: mockDelete,
      });

      await signOut();

      expect(mockDelete).toHaveBeenCalledWith("session");
      expect(redirect).toHaveBeenCalledWith("/sign-in");
    });
  });

  describe("updatePassword", () => {
    const validFormData = new FormData();
    validFormData.append("currentPassword", "oldPassword123");
    validFormData.append("newPassword", "newPassword123");
    validFormData.append("confirmPassword", "newPassword123");

    it("should update password successfully", async () => {
      mockUserService.validatePassword.mockResolvedValue(true);

      const result = await updatePassword({}, validFormData);

      expect(mockUserService.update).toHaveBeenCalled();
      expect(result).toEqual({ success: "パスワードを更新しました。" });
    });

    it("should return error for invalid current password", async () => {
      mockUserService.validatePassword.mockResolvedValue(false);

      const result = await updatePassword({}, validFormData);

      expect(result).toEqual({ error: "現在のパスワードが正しくありません。" });
    });

    it("should return error when new password is same as current", async () => {
      mockUserService.validatePassword.mockResolvedValue(true);
      const samePasswordFormData = new FormData();
      samePasswordFormData.append("currentPassword", "password123");
      samePasswordFormData.append("newPassword", "password123");
      samePasswordFormData.append("confirmPassword", "password123");

      const result = await updatePassword({}, samePasswordFormData);

      expect(result).toEqual({
        error: "新しいパスワードは現在のパスワードと異なる必要があります。",
      });
    });
  });

  describe("deleteAccount", () => {
    const validFormData = new FormData();
    validFormData.append("password", "password123");

    it("should delete account successfully", async () => {
      mockUserService.validatePassword.mockResolvedValue(true);
      const mockDelete = jest.fn();
      (cookies as jest.Mock).mockReturnValue({
        delete: mockDelete,
      });

      await deleteAccount({}, validFormData);

      expect(mockUserService.delete).toHaveBeenCalledWith(mockUser.id);
      expect(mockDelete).toHaveBeenCalledWith("session");
      expect(redirect).toHaveBeenCalledWith("/sign-in");
    });

    it("should return error for invalid password", async () => {
      mockUserService.validatePassword.mockResolvedValue(false);

      const result = await deleteAccount({}, validFormData);

      expect(result).toEqual({ error: "パスワードが正しくありません。" });
      expect(mockUserService.delete).not.toHaveBeenCalled();
    });
  });

  describe("updateAccount", () => {
    const validFormData = new FormData();
    validFormData.append("name", "New Name");
    validFormData.append("email", "newemail@example.com");

    it("should update account successfully", async () => {
      const result = await updateAccount({}, validFormData);

      expect(mockUserService.update).toHaveBeenCalledWith(mockUser.id, {
        name: "New Name",
        email: "newemail@example.com",
      });
      expect(result).toEqual({ success: "アカウント情報を更新しました。" });
    });
  });
});
