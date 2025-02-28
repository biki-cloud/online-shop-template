import "reflect-metadata";
import { container } from "tsyringe";
import { UserRepository } from "../user.repository.impl";
import { mockDb } from "@/lib/shared/test-utils/mock-repositories";
import { users } from "@/lib/infrastructure/db/schema";
import type { User as DbUser } from "@/lib/infrastructure/db/schema";
import type { User } from "@/lib/core/domain/user.domain";
import type { Database } from "@/lib/infrastructure/db/drizzle";

const mockAuthService = {
  comparePasswords: jest.fn(),
};

jest.mock("@/lib/core/services/auth.service.impl", () => ({
  AuthService: jest.fn().mockImplementation(() => mockAuthService),
}));

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
    container.register("Database", { useValue: mockDb as unknown as Database });
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
      (mockDb.select as jest.Mock).mockReturnThis();
      (mockDb.from as jest.Mock).mockReturnThis();
      (mockDb.where as jest.Mock).mockReturnThis();
      (mockDb.limit as jest.Mock).mockResolvedValue(mockResult);

      const result = await userRepository.findByEmail("test@example.com");

      expect(result).toEqual(mockDomainUser);
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

  describe("findById", () => {
    it("should return user when found", async () => {
      (mockDb.select as jest.Mock).mockReturnThis();
      (mockDb.from as jest.Mock).mockReturnThis();
      (mockDb.where as jest.Mock).mockReturnThis();
      (mockDb.limit as jest.Mock).mockResolvedValue([mockDbUser]);

      const result = await userRepository.findById(1);

      expect(result).toEqual(mockDbUser);
    });
  });
});
