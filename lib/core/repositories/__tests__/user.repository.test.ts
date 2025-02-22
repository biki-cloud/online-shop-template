import "reflect-metadata";
import { container } from "tsyringe";
import { UserRepository } from "../user.repository";
import { mockDb } from "@/lib/shared/test-utils/mock-repositories";
import { users } from "@/lib/infrastructure/db/schema";
import type { User } from "@/lib/infrastructure/db/schema";
import { comparePasswords } from "@/lib/infrastructure/auth/session";
import type { Database } from "@/lib/infrastructure/db/drizzle";

jest.mock("@/lib/infrastructure/auth/session", () => ({
  comparePasswords: jest.fn(),
}));

describe("UserRepository", () => {
  let userRepository: UserRepository;
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
    // DIコンテナの設定
    container.register("Database", { useValue: mockDb as unknown as Database });

    // UserRepositoryのインスタンス化
    userRepository = container.resolve(UserRepository);

    // モックのリセット
    jest.clearAllMocks();
  });

  describe("findByEmail", () => {
    it("should return user when found", async () => {
      const mockResult = [mockUser];
      (mockDb.select as jest.Mock).mockReturnThis();
      (mockDb.from as jest.Mock).mockReturnThis();
      (mockDb.where as jest.Mock).mockReturnThis();
      (mockDb.limit as jest.Mock).mockResolvedValue(mockResult);

      const result = await userRepository.findByEmail("test@example.com");

      expect(result).toEqual(mockUser);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(users);
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalledWith(1);
    });

    it("should return null when user not found", async () => {
      (mockDb.select as jest.Mock).mockReturnThis();
      (mockDb.from as jest.Mock).mockReturnThis();
      (mockDb.where as jest.Mock).mockReturnThis();
      (mockDb.limit as jest.Mock).mockResolvedValue([]);

      const result = await userRepository.findByEmail(
        "nonexistent@example.com"
      );

      expect(result).toBeNull();
    });
  });

  describe("verifyPassword", () => {
    it("should return user when password is valid", async () => {
      (mockDb.select as jest.Mock).mockReturnThis();
      (mockDb.from as jest.Mock).mockReturnThis();
      (mockDb.where as jest.Mock).mockReturnThis();
      (mockDb.limit as jest.Mock).mockResolvedValue([mockUser]);
      (comparePasswords as jest.Mock).mockResolvedValue(true);

      const result = await userRepository.verifyPassword(
        "test@example.com",
        "password123"
      );

      expect(result).toEqual(mockUser);
      expect(comparePasswords).toHaveBeenCalledWith(
        "password123",
        mockUser.passwordHash
      );
    });

    it("should return null when user not found", async () => {
      (mockDb.select as jest.Mock).mockReturnThis();
      (mockDb.from as jest.Mock).mockReturnThis();
      (mockDb.where as jest.Mock).mockReturnThis();
      (mockDb.limit as jest.Mock).mockResolvedValue([]);

      const result = await userRepository.verifyPassword(
        "nonexistent@example.com",
        "password123"
      );

      expect(result).toBeNull();
      expect(comparePasswords).not.toHaveBeenCalled();
    });

    it("should return null when password is invalid", async () => {
      (mockDb.select as jest.Mock).mockReturnThis();
      (mockDb.from as jest.Mock).mockReturnThis();
      (mockDb.where as jest.Mock).mockReturnThis();
      (mockDb.limit as jest.Mock).mockResolvedValue([mockUser]);
      (comparePasswords as jest.Mock).mockResolvedValue(false);

      const result = await userRepository.verifyPassword(
        "test@example.com",
        "wrongpassword"
      );

      expect(result).toBeNull();
      expect(comparePasswords).toHaveBeenCalledWith(
        "wrongpassword",
        mockUser.passwordHash
      );
    });
  });

  describe("BaseRepository methods", () => {
    it("should have correct idColumn", () => {
      expect(userRepository["idColumn"]).toBe(users.id);
    });
  });
});
