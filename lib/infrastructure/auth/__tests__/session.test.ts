import { cookies } from "next/headers";
import { getSessionService } from "@/lib/di/container";
import { User, UserRole } from "@/lib/core/domain/user";
import { ISessionService } from "@/lib/core/services/interfaces/session.service";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

const mockSessionService: jest.Mocked<ISessionService> = {
  get: jest.fn(),
  set: jest.fn(),
  clear: jest.fn(),
  refresh: jest.fn(),
};

jest.mock("@/lib/di/container", () => ({
  getSessionService: jest.fn(() => mockSessionService),
}));

describe("Auth Session", () => {
  const mockUser: User = {
    id: 1,
    email: "test@example.com",
    name: "Test User",
    role: "user" as UserRole,
    passwordHash: "hashedPassword123",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockSession = {
    userId: mockUser.id,
    role: mockUser.role,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getSession", () => {
    it("should return session data when session exists", async () => {
      mockSessionService.get.mockResolvedValue(mockSession);

      const session = await getSessionService().get();

      expect(session).toEqual(mockSession);
    });

    it("should return null when no session exists", async () => {
      mockSessionService.get.mockResolvedValue(null);

      const session = await getSessionService().get();

      expect(session).toBeNull();
    });
  });

  describe("setSession", () => {
    it("should set session cookie with correct parameters", async () => {
      await getSessionService().set(mockUser);

      expect(mockSessionService.set).toHaveBeenCalledWith(mockUser);
    });
  });

  describe("clearSession", () => {
    it("should clear session cookie", async () => {
      await getSessionService().clear();

      expect(mockSessionService.clear).toHaveBeenCalled();
    });
  });

  describe("refreshSession", () => {
    it("should refresh session when it exists", async () => {
      mockSessionService.get.mockResolvedValue(mockSession);

      await getSessionService().refresh();

      expect(mockSessionService.refresh).toHaveBeenCalled();
    });

    it("should not refresh session when it does not exist", async () => {
      mockSessionService.get.mockResolvedValue(null);

      await getSessionService().refresh();

      expect(mockSessionService.set).not.toHaveBeenCalled();
    });
  });
});
