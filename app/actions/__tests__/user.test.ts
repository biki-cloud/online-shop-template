import "reflect-metadata";
import { container } from "tsyringe";
import {
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  validateUserPassword,
  getCurrentUser,
} from "../user";
import { MockUserRepository } from "@/lib/shared/test-utils/mock-repositories";
import { UserService } from "@/lib/core/services/user.service.impl";
import { IUserService } from "@/lib/core/services/interfaces/user.service";
import { ISessionService } from "@/lib/core/services/interfaces/session.service";
import { UserRole } from "@/lib/core/domain/user";
import { jest } from "@jest/globals";
import { User } from "@/lib/core/domain/user";
import type { IAuthService } from "@/lib/core/services/interfaces/auth.service";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

const mockUser: User = {
  id: 1,
  name: "Test User",
  email: "test@example.com",
  passwordHash: "hashedPassword123",
  role: "user" as UserRole,
  createdAt: new Date("2025-02-27T11:39:29.748Z"),
  updatedAt: new Date("2025-02-27T11:39:29.748Z"),
  deletedAt: null,
};

const mockUserService: jest.Mocked<IUserService> = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  validatePassword: jest.fn(),
};

const mockAuthService: jest.Mocked<IAuthService> = {
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  validateSession: jest.fn(),
  refreshSession: jest.fn(),
  updatePassword: jest.fn(),
  getSessionUser: jest.fn(),
  verifyToken: jest.fn(),
  generateToken: jest.fn(),
  hashPassword: jest.fn(),
  comparePasswords: jest.fn(),
};

const mockSessionService: jest.Mocked<ISessionService> = {
  get: jest.fn(),
  set: jest.fn(),
  clear: jest.fn(),
  refresh: jest.fn(),
};

jest.mock("@/lib/di/container", () => ({
  getSessionService: jest.fn(() => mockSessionService),
  getUserService: jest.fn(() => mockUserService),
  getAuthService: jest.fn(() => mockAuthService),
}));

jest.mock("@/lib/infrastructure/payments/stripe");

describe("User Actions", () => {
  let mockUserRepository: MockUserRepository;

  beforeEach(() => {
    // モックリポジトリの初期化
    mockUserRepository = new MockUserRepository();

    // メソッドのモック化
    jest.spyOn(mockUserRepository, "findById");
    jest.spyOn(mockUserRepository, "findByEmail");
    jest.spyOn(mockUserRepository, "create");
    jest.spyOn(mockUserRepository, "update");
    jest.spyOn(mockUserRepository, "delete");

    // DIコンテナの設定
    container.register("UserRepository", { useValue: mockUserRepository });
    container.register("UserService", { useClass: UserService });

    // モックのリセット
    jest.clearAllMocks();
  });

  describe("getUserById", () => {
    it("should return user when found", async () => {
      mockUserService.findById.mockResolvedValue(mockUser);

      const result = await getUserById(1);

      expect(result).toEqual(mockUser);
      expect(mockUserService.findById).toHaveBeenCalledWith(1);
    });

    it("should return null when user not found", async () => {
      mockUserService.findById.mockResolvedValue(null);

      const result = await getUserById(1);

      expect(result).toBeNull();
      expect(mockUserService.findById).toHaveBeenCalledWith(1);
    });
  });

  describe("getUserByEmail", () => {
    it("should return user when found", async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);

      const result = await getUserByEmail("test@example.com");

      expect(result).toEqual(mockUser);
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(
        "test@example.com"
      );
    });

    it("should return null when user not found", async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      const result = await getUserByEmail("nonexistent@example.com");

      expect(result).toBeNull();
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(
        "nonexistent@example.com"
      );
    });
  });

  describe("createUser", () => {
    it("should create new user", async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.create.mockResolvedValue(mockUser);

      const createInput = {
        email: "test@example.com",
        passwordHash: "hashedPassword123",
        name: "Test User",
        role: "user" as UserRole,
      };

      const result = await createUser(createInput);

      expect(result).toEqual(mockUser);
      expect(mockUserService.create).toHaveBeenCalledWith(createInput);
    });

    it("should throw error when user with email already exists", async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockUserService.create.mockRejectedValue(
        new Error("このメールアドレスは既に登録されています。")
      );

      const createInput = {
        email: "test@example.com",
        passwordHash: "hashedPassword123",
        name: "Test User",
        role: "user" as UserRole,
      };

      await expect(createUser(createInput)).rejects.toThrow(
        "このメールアドレスは既に登録されています。"
      );
    });
  });

  describe("updateUser", () => {
    it("should update user", async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.update.mockResolvedValue({
        ...mockUser,
        name: "Updated User",
        email: "updated@example.com",
      });

      const updateInput = {
        name: "Updated User",
        email: "updated@example.com",
      };

      const result = await updateUser(1, updateInput);

      expect(result).toEqual({
        ...mockUser,
        name: "Updated User",
        email: "updated@example.com",
      });
      expect(mockUserService.update).toHaveBeenCalledWith(1, updateInput);
    });

    it("should throw error when updating email to one that already exists", async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockUserService.update.mockRejectedValue(
        new Error("このメールアドレスは既に使用されています。")
      );

      const updateInput = {
        name: "Updated User",
        email: "existing@example.com",
      };

      await expect(updateUser(1, updateInput)).rejects.toThrow(
        "このメールアドレスは既に使用されています。"
      );
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      mockUserService.delete.mockResolvedValue(true);

      const result = await deleteUser(1);

      expect(result).toBe(true);
      expect(mockUserService.delete).toHaveBeenCalledWith(1);
    });

    it("should return false when user deletion fails", async () => {
      mockUserService.delete.mockResolvedValue(false);

      const result = await deleteUser(1);

      expect(result).toBe(false);
      expect(mockUserService.delete).toHaveBeenCalledWith(1);
    });
  });

  describe("validateUserPassword", () => {
    it("should return user when password is valid", async () => {
      mockAuthService.signIn.mockResolvedValue(mockUser);

      const result = await validateUserPassword(
        "test@example.com",
        "password123"
      );

      expect(result).toEqual(mockUser);
      expect(mockAuthService.signIn).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
    });

    it("should return null when user not found", async () => {
      mockAuthService.signIn.mockRejectedValue(
        new Error("ユーザーが見つかりません。")
      );

      const result = await validateUserPassword(
        "nonexistent@example.com",
        "password123"
      );

      expect(result).toBeNull();
      expect(mockAuthService.signIn).toHaveBeenCalledWith(
        "nonexistent@example.com",
        "password123"
      );
    });

    it("should return null when password is invalid", async () => {
      mockAuthService.signIn.mockRejectedValue(
        new Error("パスワードが正しくありません。")
      );

      const result = await validateUserPassword(
        "test@example.com",
        "wrongpassword"
      );

      expect(result).toBeNull();
      expect(mockAuthService.signIn).toHaveBeenCalledWith(
        "test@example.com",
        "wrongpassword"
      );
    });
  });

  describe("getCurrentUser", () => {
    it("should return current user when session exists", async () => {
      mockAuthService.getSessionUser.mockResolvedValue(mockUser);

      const result = await getCurrentUser();

      expect(result).toEqual(mockUser);
      expect(mockAuthService.getSessionUser).toHaveBeenCalled();
    });

    it("should return null when no session exists", async () => {
      mockAuthService.getSessionUser.mockResolvedValue(null);

      const result = await getCurrentUser();

      expect(result).toBeNull();
      expect(mockAuthService.getSessionUser).toHaveBeenCalled();
    });
  });
});
