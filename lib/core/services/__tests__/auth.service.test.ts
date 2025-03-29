import "reflect-metadata";
import { AuthService } from "../auth.service.impl";
import type { IUserRepository } from "../../repositories/interfaces/user.repository.interface";
import type { ISessionService } from "../interfaces/session.service.interface";
import type { User, CreateUserInput } from "@/lib/core/domain/user.domain";
import { UserValidation } from "@/lib/core/domain/user.domain";
import * as bcrypt from "bcryptjs";

// bcryptのモック
jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashedPassword"),
  compare: jest.fn(),
}));

describe("AuthService", () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockSessionService: jest.Mocked<ISessionService>;

  const mockUser: User = {
    id: 1,
    email: "test@example.com",
    name: "Test User",
    role: "user",
    passwordHash: "hashedPassword",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    };

    mockSessionService = {
      set: jest.fn().mockResolvedValue(undefined),
      get: jest.fn(),
      clear: jest.fn().mockResolvedValue(undefined),
      refresh: jest.fn().mockResolvedValue(undefined),
    };

    authService = new AuthService(mockUserRepository, mockSessionService);

    // デフォルトの成功ケースのモック設定
    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockUserRepository.create.mockResolvedValue(mockUser);

    // bcryptのcompareは初期状態ではtrueを返すように設定
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("signIn", () => {
    it("正常にサインインできること", async () => {
      const result = await authService.signIn(
        "test@example.com",
        "Password123!"
      );

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        "test@example.com"
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "Password123!",
        "hashedPassword"
      );
      expect(mockSessionService.set).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it("無効なメールアドレス形式でエラーが発生すること", async () => {
      await expect(
        authService.signIn("invalid-email", "Password123!")
      ).rejects.toThrow("Invalid email format");

      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    });

    it("ユーザーが存在しない場合にエラーが発生すること", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        authService.signIn("notfound@example.com", "Password123!")
      ).rejects.toThrow("Invalid credentials");
    });

    it("パスワードが一致しない場合にエラーが発生すること", async () => {
      // このテストでのみパスワード比較の結果をfalseに設定
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(
        authService.signIn("test@example.com", "WrongPassword123!")
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("signUp", () => {
    it("正常にサインアップできること", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await authService.signUp(
        "newuser@example.com",
        "Password123!",
        "New User"
      );

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        "newuser@example.com"
      );
      expect(bcrypt.hash).toHaveBeenCalledWith("Password123!", 12);

      const expectedInput: CreateUserInput = {
        email: "newuser@example.com",
        passwordHash: "hashedPassword",
        name: "New User",
        role: "user",
      };

      expect(mockUserRepository.create).toHaveBeenCalledWith(expectedInput);
      expect(mockSessionService.set).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it("無効なメールアドレス形式でエラーが発生すること", async () => {
      await expect(
        authService.signUp("invalid-email", "Password123!", "New User")
      ).rejects.toThrow("Invalid email format");

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it("無効なパスワード形式でエラーが発生すること", async () => {
      await expect(
        authService.signUp("valid@example.com", "weakpass", "New User")
      ).rejects.toThrow("Password does not meet security requirements");

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it("無効な名前形式でエラーが発生すること", async () => {
      await expect(
        authService.signUp("valid@example.com", "Password123!", "A")
      ).rejects.toThrow("Invalid name format");

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it("既存ユーザーがいる場合にエラーが発生すること", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(
        authService.signUp(
          "existing@example.com",
          "Password123!",
          "Existing User"
        )
      ).rejects.toThrow("User already exists");

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("signOut", () => {
    it("セッションをクリアすること", async () => {
      await authService.signOut();
      expect(mockSessionService.clear).toHaveBeenCalled();
    });
  });

  describe("validateSession", () => {
    it("有効なセッションを検証できること", async () => {
      mockSessionService.get.mockResolvedValue({ userId: 1, role: "user" });

      const result = await authService.validateSession();

      expect(mockSessionService.get).toHaveBeenCalled();
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it("セッションがない場合にnullを返すこと", async () => {
      mockSessionService.get.mockResolvedValue(null);

      const result = await authService.validateSession();

      expect(mockSessionService.get).toHaveBeenCalled();
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("updatePassword", () => {
    it("パスワードを正常に更新できること", async () => {
      await authService.updatePassword(1, "OldPassword123!", "NewPassword123!");

      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "OldPassword123!",
        "hashedPassword"
      );
      expect(bcrypt.hash).toHaveBeenCalledWith("NewPassword123!", 12);
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
        passwordHash: "hashedPassword",
      });
    });

    it("無効なパスワード形式でエラーが発生すること", async () => {
      await expect(
        authService.updatePassword(1, "OldPassword123!", "weak")
      ).rejects.toThrow("New password does not meet security requirements");

      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it("古いパスワードが一致しない場合にエラーが発生すること", async () => {
      // このテストでのみパスワード比較の結果をfalseに設定
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(
        authService.updatePassword(1, "WrongOldPassword", "NewPassword123!")
      ).rejects.toThrow("Invalid password");

      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it("ユーザーが見つからない場合にエラーが発生すること", async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        authService.updatePassword(999, "OldPassword123!", "NewPassword123!")
      ).rejects.toThrow("User not found");

      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("hashPassword", () => {
    it("パスワードをハッシュ化できること", async () => {
      const result = await authService.hashPassword("Password123!");

      expect(bcrypt.hash).toHaveBeenCalledWith("Password123!", 12);
      expect(result).toBe("hashedPassword");
    });
  });

  describe("comparePasswords", () => {
    it("パスワードを比較できること", async () => {
      const result = await authService.comparePasswords(
        "Password123!",
        "hashedPassword"
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "Password123!",
        "hashedPassword"
      );
      expect(result).toBe(true);
    });
  });

  describe("verifyToken", () => {
    it("トークンが有効な場合にtrueを返すこと", async () => {
      mockSessionService.get.mockResolvedValue({ userId: 1, role: "user" });

      const result = await authService.verifyToken("valid-token");

      expect(mockSessionService.get).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("トークンが無効な場合にfalseを返すこと", async () => {
      mockSessionService.get.mockRejectedValue(new Error("Invalid token"));

      const result = await authService.verifyToken("invalid-token");

      expect(mockSessionService.get).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe("getSessionUser", () => {
    it("validateSessionを呼び出すこと", async () => {
      // validateSessionのスパイを作成
      const validateSessionSpy = jest.spyOn(authService, "validateSession");
      mockSessionService.get.mockResolvedValue({ userId: 1, role: "user" });

      const result = await authService.getSessionUser();

      expect(validateSessionSpy).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe("refreshSession", () => {
    it("セッションをリフレッシュすること", async () => {
      await authService.refreshSession();
      expect(mockSessionService.refresh).toHaveBeenCalled();
    });
  });

  describe("generateToken", () => {
    it("実装されていないメソッドでエラーをスローすること", async () => {
      await expect(authService.generateToken(mockUser)).rejects.toThrow(
        "Method not implemented - use session service instead"
      );
    });
  });
});
