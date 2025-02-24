import { renderHook, act } from "@testing-library/react";
import { useAuth } from "../useAuth";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// モック
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      })),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
    },
  },
}));

describe("useAuth", () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    });
  });

  it("should handle sign in successfully", async () => {
    const { result } = renderHook(() => useAuth());
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      error: null,
    });

    await act(async () => {
      await result.current.signIn("test@example.com", "password");
    });

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password",
    });
    expect(mockRouter.push).toHaveBeenCalledWith("/home");
  });

  it("should handle sign in error", async () => {
    const { result } = renderHook(() => useAuth());
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      error: new Error("Invalid credentials"),
    });

    await expect(
      act(async () => {
        await result.current.signIn("test@example.com", "wrong-password");
      })
    ).rejects.toThrow();

    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("should handle sign up successfully", async () => {
    const { result } = renderHook(() => useAuth());
    (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
      error: null,
    });

    await act(async () => {
      await result.current.signUp("test@example.com", "password", "Test User");
    });

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password",
      options: {
        data: {
          name: "Test User",
        },
      },
    });
    expect(mockRouter.push).toHaveBeenCalledWith("/home");
  });

  it("should handle sign out successfully", async () => {
    const { result } = renderHook(() => useAuth());
    (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({
      error: null,
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith("/sign-in");
  });

  it("should handle password reset request successfully", async () => {
    const { result } = renderHook(() => useAuth());
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValueOnce({
      error: null,
    });

    await act(async () => {
      await result.current.resetPassword("test@example.com");
    });

    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      "test@example.com",
      {
        redirectTo: expect.stringContaining("/auth/update-password"),
      }
    );
  });

  it("should handle password update successfully", async () => {
    const { result } = renderHook(() => useAuth());
    (supabase.auth.updateUser as jest.Mock).mockResolvedValueOnce({
      error: null,
    });

    await act(async () => {
      await result.current.updatePassword("new-password");
    });

    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      password: "new-password",
    });
  });
});
