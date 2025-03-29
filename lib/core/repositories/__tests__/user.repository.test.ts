import "reflect-metadata";
import { container } from "tsyringe";
import { UserRepository } from "../user.repository.impl";
import { mockDb } from "@/lib/shared/test-utils/mock-repositories";
import { users } from "@/lib/infrastructure/db/schema";
import type { User as DbUser } from "@/lib/infrastructure/db/schema";
import type {
  User,
  CreateUserInput,
  UpdateUserInput,
} from "@/lib/core/domain/user.domain";
import type { Database } from "@/lib/infrastructure/db/drizzle";
import { eq } from "drizzle-orm";

const mockAuthService = {
  comparePasswords: jest.fn(),
};

jest.mock("@/lib/core/services/auth.service.impl", () => ({
  AuthService: jest.fn().mockImplementation(() => mockAuthService),
}));

// モックデータベースをキャストしてTypeScriptエラーを解決
const typedMockDb = mockDb as any;

describe("UserRepository", () => {
  let userRepository: UserRepository;
  const mockDbUser: DbUser = {
    id: 1,
    email: "test@example.com",
    name: "Test User",
    passwordHash: "hashedPassword",
    role: "user",
    createdAt: new Date("2025-02-15T21:41:37.040Z"),
    updatedAt: new Date("2025-02-15T21:41:37.040Z"),
    deletedAt: null,
  };

  const mockDomainUser: User = {
    ...mockDbUser,
    role: "user",
  };

  beforeEach(() => {
    container.register("Database", { useValue: typedMockDb });
    container.register("AuthService", { useValue: mockAuthService });
    userRepository = container.resolve(UserRepository);
    jest
      .spyOn(userRepository as any, "toDomainUser")
      .mockReturnValue(mockDomainUser);
    jest.clearAllMocks();
  });

  describe("findByEmail", () => {
    it("should return user when found", async () => {
      const mockResult = [mockDbUser];
      typedMockDb.select.mockReturnThis();
      typedMockDb.from.mockReturnThis();
      typedMockDb.where.mockReturnThis();
      typedMockDb.limit.mockResolvedValue(mockResult);

      const result = await userRepository.findByEmail("test@example.com");

      expect(result).toEqual(mockDomainUser);
      expect(typedMockDb.select).toHaveBeenCalled();
      expect(typedMockDb.from).toHaveBeenCalledWith(users);
      expect(typedMockDb.where).toHaveBeenCalled();
      expect(typedMockDb.limit).toHaveBeenCalledWith(1);
    });

    it("should return null when user not found", async () => {
      typedMockDb.select.mockReturnThis();
      typedMockDb.from.mockReturnThis();
      typedMockDb.where.mockReturnThis();
      typedMockDb.limit.mockResolvedValue([]);

      const result = await userRepository.findByEmail(
        "nonexistent@example.com"
      );

      expect(result).toBeNull();
    });
  });

  describe("findById", () => {
    it("should return user when found", async () => {
      typedMockDb.select.mockReturnThis();
      typedMockDb.from.mockReturnThis();
      typedMockDb.where.mockReturnThis();
      typedMockDb.limit.mockResolvedValue([mockDbUser]);

      const result = await userRepository.findById(1);

      expect(result).toEqual(mockDbUser);
    });

    it("should return null when user not found", async () => {
      typedMockDb.select.mockReturnThis();
      typedMockDb.from.mockReturnThis();
      typedMockDb.where.mockReturnThis();
      typedMockDb.limit.mockResolvedValue([]);

      const result = await userRepository.findById(999);

      expect(result).toBeNull();
      expect(typedMockDb.select).toHaveBeenCalled();
      expect(typedMockDb.from).toHaveBeenCalledWith(users);
      expect(typedMockDb.where).toHaveBeenCalled();
      expect(typedMockDb.limit).toHaveBeenCalledWith(1);
    });
  });

  describe("findAll", () => {
    it("should return all users", async () => {
      const mockUsers = [
        mockDbUser,
        { ...mockDbUser, id: 2, email: "another@example.com" },
      ];
      typedMockDb.select.mockReturnThis();
      typedMockDb.from.mockResolvedValue(mockUsers);

      const result = await userRepository.findAll();

      expect(result).toHaveLength(2);
      expect(typedMockDb.select).toHaveBeenCalled();
      expect(typedMockDb.from).toHaveBeenCalledWith(users);
    });
  });

  describe("create", () => {
    it("should create and return a new user", async () => {
      const createUserInput: CreateUserInput = {
        email: "new@example.com",
        name: "New User",
        passwordHash: "newHashedPassword",
        role: "user",
      };

      const createdUser = { ...mockDbUser, ...createUserInput };

      typedMockDb.insert.mockReturnThis();
      typedMockDb.values.mockReturnThis();
      typedMockDb.returning.mockResolvedValue([createdUser]);

      const result = await userRepository.create(createUserInput);

      expect(result).toEqual(mockDomainUser);
      expect(typedMockDb.insert).toHaveBeenCalledWith(users);
      expect(typedMockDb.values).toHaveBeenCalledWith(createUserInput);
      expect(typedMockDb.returning).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update and return the user", async () => {
      const updateUserInput: UpdateUserInput = {
        name: "Updated Name",
        email: "updated@example.com",
      };

      const updatedUser = { ...mockDbUser, ...updateUserInput };

      typedMockDb.update.mockReturnThis();
      typedMockDb.set.mockReturnThis();
      typedMockDb.where.mockReturnThis();
      typedMockDb.returning.mockResolvedValue([updatedUser]);

      const result = await userRepository.update(1, updateUserInput);

      expect(result).toEqual(mockDomainUser);
      expect(typedMockDb.update).toHaveBeenCalledWith(users);
      expect(typedMockDb.set).toHaveBeenCalledWith(updateUserInput);
      expect(typedMockDb.where).toHaveBeenCalled();
      expect(typedMockDb.returning).toHaveBeenCalled();
    });

    it("should throw an error when user not found", async () => {
      const updateUserInput: UpdateUserInput = {
        name: "Updated Name",
      };

      typedMockDb.update.mockReturnThis();
      typedMockDb.set.mockReturnThis();
      typedMockDb.where.mockReturnThis();
      typedMockDb.returning.mockResolvedValue([]);

      await expect(userRepository.update(999, updateUserInput)).rejects.toThrow(
        "User not found"
      );
    });
  });

  describe("delete", () => {
    it("should delete and return true when user exists", async () => {
      typedMockDb.delete.mockReturnThis();
      typedMockDb.where.mockReturnThis();
      typedMockDb.returning.mockResolvedValue([mockDbUser]);

      const result = await userRepository.delete(1);

      expect(result).toBe(true);
      expect(typedMockDb.delete).toHaveBeenCalledWith(users);
      expect(typedMockDb.where).toHaveBeenCalled();
      expect(typedMockDb.returning).toHaveBeenCalled();
    });

    it("should return false when user not found", async () => {
      typedMockDb.delete.mockReturnThis();
      typedMockDb.where.mockReturnThis();
      typedMockDb.returning.mockResolvedValue([]);

      const result = await userRepository.delete(999);

      expect(result).toBe(false);
    });
  });

  describe("toDomainUser", () => {
    it("should convert database user to domain user", () => {
      // Spy実装を一時的に削除して実際のメソッドを呼び出す
      jest.spyOn(userRepository as any, "toDomainUser").mockRestore();

      const result = (userRepository as any).toDomainUser(mockDbUser);

      expect(result).toEqual({
        id: mockDbUser.id,
        email: mockDbUser.email,
        name: mockDbUser.name,
        role: mockDbUser.role,
        passwordHash: mockDbUser.passwordHash,
        createdAt: mockDbUser.createdAt,
        updatedAt: mockDbUser.updatedAt,
        deletedAt: mockDbUser.deletedAt,
      });
    });
  });
});
