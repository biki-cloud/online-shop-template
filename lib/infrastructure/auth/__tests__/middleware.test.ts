import { z } from "zod";
import { User } from "@/lib/infrastructure/db/schema";
import {
  validatedAction,
  validatedActionWithUser,
  checkAdmin,
  ActionState,
} from "../middleware";
import { getCurrentUser } from "@/app/actions/user";

jest.mock("@/app/actions/user", () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

const mockSessionService = {
  get: jest.fn(),
  set: jest.fn(),
  clear: jest.fn(),
  refresh: jest.fn(),
};

jest.mock("@/lib/di/container", () => ({
  getSessionService: jest.fn(() => mockSessionService),
}));

describe("Auth Middleware", () => {
  const mockUser: User = {
    id: 1,
    email: "test@example.com",
    name: "Test User",
    role: "user",
    passwordHash: "hashedPassword123",
    createdAt: new Date("2025-02-27T11:39:29.748Z"),
    updatedAt: new Date("2025-02-27T11:39:29.748Z"),
    deletedAt: null,
  };

  const defaultState: ActionState = { data: {} };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validatedAction", () => {
    const schema = z.object({
      name: z.string(),
    });

    it("should validate and execute action with valid data", async () => {
      const action = jest.fn();
      const formData = new FormData();
      formData.append("name", "test");

      await validatedAction(schema, action)(defaultState, formData);

      expect(action).toHaveBeenCalledWith({ name: "test" }, formData);
    });

    it("should return validation error with invalid data", async () => {
      const action = jest.fn();
      const formData = new FormData();

      const result = await validatedAction(schema, action)(
        defaultState,
        formData
      );

      expect(result).toEqual({
        error: "Required",
      });
      expect(action).not.toHaveBeenCalled();
    });
  });

  describe("validatedActionWithUser", () => {
    const schema = z.object({
      name: z.string(),
    });

    it("should validate and execute action with valid data and user session", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
      const action = jest.fn();
      const formData = new FormData();
      formData.append("name", "test");

      await validatedActionWithUser(schema, action)(defaultState, formData);

      expect(action).toHaveBeenCalledWith({ name: "test" }, formData, mockUser);
    });

    it("should redirect to sign-in when no session", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);
      const action = jest.fn();
      const formData = new FormData();
      formData.append("name", "test");

      await expect(
        validatedActionWithUser(schema, action)(defaultState, formData)
      ).rejects.toThrow("User is not authenticated");

      expect(action).not.toHaveBeenCalled();
    });

    it("should return validation error with invalid data", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
      const action = jest.fn();
      const formData = new FormData();

      const result = await validatedActionWithUser(schema, action)(
        defaultState,
        formData
      );

      expect(result).toEqual({
        error: "Required",
      });
      expect(action).not.toHaveBeenCalled();
    });
  });

  describe("checkAdmin", () => {
    it("should return true for admin user", async () => {
      mockSessionService.get.mockResolvedValue({
        userId: 1,
        role: "admin",
      });

      const isAdmin = await checkAdmin();
      expect(isAdmin).toBe(true);
    });

    it("should return false for non-admin user", async () => {
      mockSessionService.get.mockResolvedValue({
        userId: 1,
        role: "user",
      });

      const isAdmin = await checkAdmin();
      expect(isAdmin).toBe(false);
    });

    it("should return false when no session exists", async () => {
      mockSessionService.get.mockResolvedValue(null);

      const isAdmin = await checkAdmin();
      expect(isAdmin).toBe(false);
    });
  });
});
