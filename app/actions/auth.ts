"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createCheckoutSession } from "@/lib/infrastructure/payments/stripe";
import {
  validatedAction,
  validatedActionWithUser,
} from "@/lib/infrastructure/auth/middleware";
import {
  getAuthService,
  getSessionService,
  getUserService,
} from "@/lib/di/container";

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;
  const authService = getAuthService();
  const sessionService = getSessionService();

  try {
    const user = await authService.signIn(email, password);
    await sessionService.set(user);

    const redirectTo = formData.get("redirect") as string | null;
    if (redirectTo === "checkout") {
      return createCheckoutSession({
        userId: user.id,
        cart: null,
        cartItems: [],
      });
    }
    return { redirect: "/home" };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "無効な認証情報です",
      email,
      password,
    };
  }
});

const signUpSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(100),
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password, name } = data;
  const authService = getAuthService();
  const sessionService = getSessionService();

  try {
    const user = await authService.signUp(email, password, name);
    await sessionService.set(user);

    const redirectTo = formData.get("redirect") as string | null;
    if (redirectTo === "checkout") {
      return createCheckoutSession({
        userId: user.id,
        cart: null,
        cartItems: [],
      });
    }
    return { redirect: "/home" };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "このメールアドレスは既に登録されています",
      email,
      password,
      name,
    };
  }
});

export async function signOut() {
  const authService = getAuthService();
  const sessionService = getSessionService();

  await authService.signOut();
  await sessionService.clear();
  redirect("/sign-in");
}

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100),
});

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, formData, user) => {
    const { currentPassword, newPassword } = data;
    const authService = getAuthService();

    try {
      const isValid = await authService.comparePasswords(
        currentPassword,
        user.passwordHash
      );
      if (!isValid) {
        return { error: "現在のパスワードが正しくありません" };
      }

      await authService.updatePassword(user.id, currentPassword, newPassword);
      return { success: "パスワードを更新しました。" };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "パスワードの更新に失敗しました",
      };
    }
  }
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100),
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, formData, user) => {
    const { password } = data;
    const authService = getAuthService();
    const userService = getUserService();

    try {
      const isValid = await authService.comparePasswords(
        password,
        user.passwordHash
      );
      if (!isValid) {
        return { error: "パスワードが正しくありません。" };
      }

      await userService.delete(user.id);
      await authService.signOut();
      redirect("/sign-in");
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "アカウントの削除に失敗しました",
      };
    }
  }
);

const updateAccountSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().min(3).max(255),
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, formData, user) => {
    const userService = getUserService();

    try {
      await userService.update(user.id, data);
      return { success: "アカウント情報を更新しました。" };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "アカウントの更新に失敗しました",
      };
    }
  }
);
