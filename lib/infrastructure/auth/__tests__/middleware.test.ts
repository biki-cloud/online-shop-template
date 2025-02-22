import { z } from "zod";
import { User } from "@/lib/infrastructure/db/schema";
import {
  validatedAction,
  validatedActionWithUser,
  checkAdmin,
  ActionState,
} from "../middleware";
import { getCurrentUser } from "@/app/actions/user";
import { getSession } from "../session";

jest.mock("@/app/actions/user", () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock("../session", () => ({
  getSession: jest.fn(),
}));

describe("Auth Middleware", () => {
  const mockUser: User = {
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
    jest.clearAllMocks();
  });

  describe("validatedAction", () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
    });

    const mockAction = jest.fn();
    const validatedActionFn = validatedAction(schema, mockAction);

    it("should call action with valid data", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "password123");

      const prevState = {};
      await validatedActionFn(prevState, formData);

      expect(mockAction).toHaveBeenCalledWith(
        {
          email: "test@example.com",
          password: "password123",
        },
        formData
      );
    });

    it("should return error for invalid data", async () => {
      const formData = new FormData();
      formData.append("email", "invalid-email");
      formData.append("password", "123");

      const prevState = {};
      const result = await validatedActionFn(prevState, formData);

      expect(result).toHaveProperty("error");
      expect(mockAction).not.toHaveBeenCalled();
    });
  });

  describe("validatedActionWithUser", () => {
    const schema = z.object({
      name: z.string(),
    });

    const mockAction = jest.fn();
    const validatedActionWithUserFn = validatedActionWithUser(
      schema,
      mockAction
    );

    it("should call action with valid data and authenticated user", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

      const formData = new FormData();
      formData.append("name", "New Name");

      const prevState = {};
      await validatedActionWithUserFn(prevState, formData);

      expect(mockAction).toHaveBeenCalledWith(
        { name: "New Name" },
        formData,
        mockUser
      );
    });

    it("should throw error when user is not authenticated", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      const formData = new FormData();
      formData.append("name", "New Name");

      const prevState = {};
      await expect(
        validatedActionWithUserFn(prevState, formData)
      ).rejects.toThrow("User is not authenticated");

      expect(mockAction).not.toHaveBeenCalled();
    });

    it("should return error for invalid data", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

      const formData = new FormData();
      // name フィールドを省略して無効なデータを作成

      const prevState = {};
      const result = await validatedActionWithUserFn(prevState, formData);

      expect(result).toHaveProperty("error");
      expect(mockAction).not.toHaveBeenCalled();
    });
  });

  describe("checkAdmin", () => {
    it("should return true for admin user", async () => {
      (getSession as jest.Mock).mockResolvedValue({
        user: { id: 1, role: "admin" },
      });

      const isAdmin = await checkAdmin();
      expect(isAdmin).toBe(true);
    });

    it("should return false for non-admin user", async () => {
      (getSession as jest.Mock).mockResolvedValue({
        user: { id: 1, role: "user" },
      });

      const isAdmin = await checkAdmin();
      expect(isAdmin).toBe(false);
    });

    it("should return false when no session exists", async () => {
      (getSession as jest.Mock).mockResolvedValue(null);

      const isAdmin = await checkAdmin();
      expect(isAdmin).toBe(false);
    });
  });
});
