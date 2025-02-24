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
import { UserService } from "@/lib/core/services/user.service";
import { getSessionService } from "@/lib/di/container";
import type { User as DbUser } from "@/lib/infrastructure/db/schema";
import * as bcryptjs from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getContainer } from "@/lib/di/container";
import { IUserService } from "@/lib/core/services/interfaces/user.service";
import { createCheckoutSession } from "@/lib/infrastructure/payments/stripe";
import { ISessionService } from "@/lib/core/services/interfaces/session.service";
import type { UserRole } from "@/lib/core/domain/user";

const mockSessionService = {
  get: jest.fn().mockResolvedValue({ userId: 1 }),
  set: jest.fn(),
  clear: jest.fn(),
  refresh: jest.fn(),
};

jest.mock("@/lib/di/container", () => ({
  getSessionService: jest.fn(() => mockSessionService),
}));

jest.mock("@/lib/infrastructure/payments/stripe");

jest.mock("bcryptjs", () => ({
  compare: jest.fn(() => Promise.resolve(true)),
  hash: jest.fn(() => Promise.resolve("hashedPassword")),
}));

describe("User Actions", () => {
  let mockUserRepository: MockUserRepository;
  const mockUser: DbUser = {
    id: 1,
    email: "test@example.com",
    name: "Test User",
    role: "user",
    passwordHash: "hashedPassword123",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

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
      jest.spyOn(mockUserRepository, "findById").mockResolvedValue(mockUser);

      const result = await getUserById(1);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
    });

    it("should return null when user not found", async () => {
      jest.spyOn(mockUserRepository, "findById").mockResolvedValue(null);

      const result = await getUserById(1);

      expect(result).toBeNull();
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
    });
  });

  describe("getUserByEmail", () => {
    it("should return user when found", async () => {
      jest.spyOn(mockUserRepository, "findByEmail").mockResolvedValue(mockUser);

      const result = await getUserByEmail("test@example.com");

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        "test@example.com"
      );
    });

    it("should return null when user not found", async () => {
      jest.spyOn(mockUserRepository, "findByEmail").mockResolvedValue(null);

      const result = await getUserByEmail("nonexistent@example.com");

      expect(result).toBeNull();
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        "nonexistent@example.com"
      );
    });
  });

  describe("createUser", () => {
    it("should create new user", async () => {
      jest.spyOn(mockUserRepository, "findByEmail").mockResolvedValue(null);
      jest.spyOn(mockUserRepository, "create").mockResolvedValue(mockUser);

      const createInput = {
        email: "test@example.com",
        name: "Test User",
        passwordHash: "hashedPassword123",
        role: "user" as UserRole,
      };

      const result = await createUser(createInput);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.create).toHaveBeenCalled();
    });

    it("should throw error when user with email already exists", async () => {
      jest.spyOn(mockUserRepository, "findByEmail").mockResolvedValue(mockUser);

      const createInput = {
        email: "test@example.com",
        name: "Test User",
        passwordHash: "hashedPassword123",
        role: "user" as UserRole,
      };

      await expect(createUser(createInput)).rejects.toThrow(
        "このメールアドレスは既に登録されています。"
      );
    });
  });

  describe("updateUser", () => {
    it("should update user", async () => {
      jest.spyOn(mockUserRepository, "findByEmail").mockResolvedValue(null);
      jest.spyOn(mockUserRepository, "update").mockResolvedValue(mockUser);

      const updateInput = {
        name: "Updated User",
      };

      const result = await updateUser(1, updateInput);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, updateInput);
    });

    it("should throw error when updating email to one that already exists", async () => {
      const existingUser = { ...mockUser, id: 2 };
      jest
        .spyOn(mockUserRepository, "findByEmail")
        .mockResolvedValue(existingUser);

      const updateInput = {
        email: "existing@example.com",
      };

      await expect(updateUser(1, updateInput)).rejects.toThrow(
        "このメールアドレスは既に使用されています。"
      );
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      jest.spyOn(mockUserRepository, "delete").mockResolvedValue(true);

      const result = await deleteUser(1);

      expect(result).toBe(true);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
    });

    it("should return false when user deletion fails", async () => {
      jest.spyOn(mockUserRepository, "delete").mockResolvedValue(false);

      const result = await deleteUser(1);

      expect(result).toBe(false);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe("validateUserPassword", () => {
    it("should return user when password is valid", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        passwordHash: "hashedPassword",
        role: "user",
        createdAt: new Date("2025-02-15T21:41:37.040Z"),
        updatedAt: new Date("2025-02-15T21:41:37.040Z"),
        deletedAt: null,
      };

      jest.spyOn(mockUserRepository, "findByEmail").mockResolvedValue(mockUser);
      (bcryptjs.compare as jest.Mock).mockImplementation(() =>
        Promise.resolve(true)
      );

      const result = await validateUserPassword(
        "test@example.com",
        "password123"
      );

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        "test@example.com"
      );
      expect((bcryptjs.compare as jest.Mock).mock.calls[0][0]).toBe(
        "password123"
      );
      expect((bcryptjs.compare as jest.Mock).mock.calls[0][1]).toBe(
        "hashedPassword"
      );
    });

    it("should return null when user not found", async () => {
      jest.spyOn(mockUserRepository, "findByEmail").mockResolvedValue(null);

      const result = await validateUserPassword(
        "nonexistent@example.com",
        "password123"
      );

      expect(result).toBeNull();
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        "nonexistent@example.com"
      );
    });

    it("should return null when password is invalid", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        passwordHash: "hashedPassword",
        role: "user",
        createdAt: new Date("2025-02-15T21:41:37.040Z"),
        updatedAt: new Date("2025-02-15T21:41:37.040Z"),
        deletedAt: null,
      };

      jest.spyOn(mockUserRepository, "findByEmail").mockResolvedValue(mockUser);
      (bcryptjs.compare as jest.Mock).mockImplementation(() =>
        Promise.resolve(false)
      );

      const result = await validateUserPassword(
        "test@example.com",
        "wrongpassword"
      );

      expect(result).toBeNull();
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        "test@example.com"
      );
      expect((bcryptjs.compare as jest.Mock).mock.calls[0][0]).toBe(
        "wrongpassword"
      );
      expect((bcryptjs.compare as jest.Mock).mock.calls[0][1]).toBe(
        "hashedPassword"
      );
    });
  });

  describe("getCurrentUser", () => {
    it("should return current user when session exists", async () => {
      mockSessionService.get.mockResolvedValue({ userId: 1 });
      jest.spyOn(mockUserRepository, "findById").mockResolvedValue(mockUser);

      const result = await getCurrentUser();

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
    });

    it("should return null when no session exists", async () => {
      mockSessionService.get.mockResolvedValue(null);

      const result = await getCurrentUser();

      expect(result).toBeNull();
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });
  });
});
