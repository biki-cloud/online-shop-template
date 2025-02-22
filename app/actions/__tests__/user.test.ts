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
import { getSession } from "@/lib/infrastructure/auth/session";
import type { User } from "@/lib/core/domain/user";
import * as bcryptjs from "bcryptjs";

jest.mock("@/lib/infrastructure/auth/session", () => ({
  getSession: jest.fn(),
}));

jest.mock("@/lib/infrastructure/payments/stripe");

jest.mock("bcryptjs", () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue("hashedPassword"),
}));

describe("User Actions", () => {
  let mockUserRepository: MockUserRepository;
  const mockUser: User = {
    id: 1,
    email: "test@example.com",
    name: "Test User",
    passwordHash: "hashedPassword",
    role: "user",
    createdAt: new Date("2025-02-15T21:41:37.040Z"),
    updatedAt: new Date("2025-02-15T21:41:37.040Z"),
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
        password: "password123",
        role: "user",
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
        password: "password123",
        role: "user",
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
      jest.spyOn(bcryptjs, "compare").mockResolvedValue(true);

      const result = await validateUserPassword(
        "test@example.com",
        "password123"
      );

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        "test@example.com"
      );
      expect(bcryptjs.compare).toHaveBeenCalledWith(
        "password123",
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
      jest.spyOn(bcryptjs, "compare").mockResolvedValue(false);

      const result = await validateUserPassword(
        "test@example.com",
        "wrongpassword"
      );

      expect(result).toBeNull();
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        "test@example.com"
      );
      expect(bcryptjs.compare).toHaveBeenCalledWith(
        "wrongpassword",
        "hashedPassword"
      );
    });
  });

  describe("getCurrentUser", () => {
    it("should return current user when session exists", async () => {
      (getSession as jest.Mock).mockResolvedValue({
        user: { id: 1 },
      });
      jest.spyOn(mockUserRepository, "findById").mockResolvedValue(mockUser);

      const result = await getCurrentUser();

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
    });

    it("should return null when no session exists", async () => {
      (getSession as jest.Mock).mockResolvedValue(null);

      const result = await getCurrentUser();

      expect(result).toBeNull();
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });
  });
});
