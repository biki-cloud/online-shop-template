import "reflect-metadata";
import { container } from "tsyringe";
import { UserService } from "../user.service";
import { MockUserRepository } from "@/lib/shared/test-utils/mock-repositories";
import { hash } from "bcryptjs";
import type {
  User,
  CreateUserInput,
  UpdateUserInput,
} from "@/lib/core/domain/user";

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashedPassword"),
  compare: jest.fn().mockImplementation(async (password, hash) => {
    return password === "password123";
  }),
}));

describe("UserService", () => {
  let userService: UserService;
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

    // DIコンテナの設定
    container.register("UserRepository", { useValue: mockUserRepository });

    // UserServiceのインスタンス化
    userService = container.resolve(UserService);

    // モックのリセット
    jest.clearAllMocks();
  });

  describe("findById", () => {
    it("should return user by id", async () => {
      jest.spyOn(mockUserRepository, "findById").mockResolvedValue(mockUser);

      const user = await userService.findById(1);

      expect(user).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
    });

    it("should return null when user not found", async () => {
      jest.spyOn(mockUserRepository, "findById").mockResolvedValue(null);

      const user = await userService.findById(1);

      expect(user).toBeNull();
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
    });
  });

  describe("findByEmail", () => {
    it("should return user by email", async () => {
      jest.spyOn(mockUserRepository, "findByEmail").mockResolvedValue(mockUser);

      const user = await userService.findByEmail("test@example.com");

      expect(user).toEqual(mockUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        "test@example.com"
      );
    });

    it("should return null when user not found", async () => {
      jest.spyOn(mockUserRepository, "findByEmail").mockResolvedValue(null);

      const user = await userService.findByEmail("test@example.com");

      expect(user).toBeNull();
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        "test@example.com"
      );
    });
  });

  describe("create", () => {
    const createInput: CreateUserInput = {
      email: "test@example.com",
      name: "Test User",
      password: "password123",
      role: "user",
    };

    it("should create new user", async () => {
      jest.spyOn(mockUserRepository, "findByEmail").mockResolvedValue(null);
      jest.spyOn(mockUserRepository, "create").mockResolvedValue(mockUser);

      const user = await userService.create(createInput);

      expect(user).toEqual(mockUser);
      expect(hash).toHaveBeenCalledWith("password123", 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: createInput.email,
        name: createInput.name,
        role: createInput.role,
        passwordHash: "hashedPassword",
      });
    });

    it("should throw error when user with email already exists", async () => {
      const existingUser: User = {
        id: 1,
        email: "test@example.com",
        name: "Existing User",
        passwordHash: "hashedPassword",
        role: "user",
        createdAt: new Date("2025-02-15T21:41:37.040Z"),
        updatedAt: new Date("2025-02-15T21:41:37.040Z"),
        deletedAt: null,
      };

      jest
        .spyOn(mockUserRepository, "findByEmail")
        .mockResolvedValue(existingUser);

      await expect(userService.create(createInput)).rejects.toThrow(
        "このメールアドレスは既に登録されています。"
      );
    });
  });

  describe("update", () => {
    it("should update user without password", async () => {
      jest.spyOn(mockUserRepository, "findByEmail").mockResolvedValue(null);
      jest.spyOn(mockUserRepository, "update").mockResolvedValue(mockUser);

      const updateInput: UpdateUserInput = {
        name: "Updated User",
      };

      const user = await userService.update(1, updateInput);

      expect(user).toEqual(mockUser);
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, updateInput);
    });

    it("should update password if provided", async () => {
      jest.spyOn(mockUserRepository, "findByEmail").mockResolvedValue(null);
      jest.spyOn(mockUserRepository, "update").mockResolvedValue(mockUser);

      const updateInput: UpdateUserInput = {
        password: "newPassword",
      };

      const user = await userService.update(1, updateInput);

      expect(user).toEqual(mockUser);
      expect(hash).toHaveBeenCalledWith("newPassword", 10);
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
        passwordHash: "hashedPassword",
      });
    });

    it("should throw error when updating email to one that already exists", async () => {
      const existingUser: User = {
        id: 2,
        email: "existing@example.com",
        name: "Existing User",
        passwordHash: "hashedPassword",
        role: "user",
        createdAt: new Date("2025-02-15T21:41:37.051Z"),
        updatedAt: new Date("2025-02-15T21:41:37.051Z"),
        deletedAt: null,
      };

      jest
        .spyOn(mockUserRepository, "findByEmail")
        .mockResolvedValue(existingUser);

      await expect(
        userService.update(1, {
          email: "existing@example.com",
        })
      ).rejects.toThrow("このメールアドレスは既に使用されています。");
    });
  });

  describe("delete", () => {
    it("should delete user successfully", async () => {
      jest.spyOn(mockUserRepository, "delete").mockResolvedValue(true);

      const result = await userService.delete(1);

      expect(result).toBe(true);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
    });

    it("should return false when user deletion fails", async () => {
      jest.spyOn(mockUserRepository, "delete").mockResolvedValue(false);

      const result = await userService.delete(1);

      expect(result).toBe(false);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe("validatePassword", () => {
    it("should return user when email and password are valid", async () => {
      jest.spyOn(mockUserRepository, "findByEmail").mockResolvedValue(mockUser);

      const user = await userService.validatePassword(
        "test@example.com",
        "password123"
      );

      expect(user).toEqual(mockUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        "test@example.com"
      );
    });

    it("should return null when user is not found", async () => {
      jest.spyOn(mockUserRepository, "findByEmail").mockResolvedValue(null);

      const user = await userService.validatePassword(
        "test@example.com",
        "password123"
      );

      expect(user).toBeNull();
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        "test@example.com"
      );
    });

    it("should return null when password is invalid", async () => {
      jest.spyOn(mockUserRepository, "findByEmail").mockResolvedValue(mockUser);
      jest.spyOn(require("bcryptjs"), "compare").mockResolvedValueOnce(false);

      const user = await userService.validatePassword(
        "test@example.com",
        "wrongpassword"
      );

      expect(user).toBeNull();
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        "test@example.com"
      );
    });
  });
});
