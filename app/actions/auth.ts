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

  try {
    const user = await authService.signIn(email, password);
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
      error: error instanceof Error ? error.message : "Invalid credentials",
      email,
      password,
    };
  }
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password, name } = data;
  const authService = getAuthService();

  try {
    const user = await authService.signUp(email, password, name);
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
      error: error instanceof Error ? error.message : "Failed to create user",
      email,
      password,
      name,
    };
  }
});

export async function signOut() {
  const authService = getAuthService();
  await authService.signOut();
  redirect("/sign-in");
}

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(100),
    newPassword: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  });

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword } = data;
    const authService = getAuthService();

    try {
      await authService.updatePassword(user.id, currentPassword, newPassword);
      return { success: "パスワードを更新しました。" };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to update password",
      };
    }
  }
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100),
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
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
          error instanceof Error ? error.message : "Failed to delete account",
      };
    }
  }
);

const updateAccountSchema = z.object({
  name: z.string().min(1, "名前は必須です").max(100),
  email: z.string().email("メールアドレスの形式が正しくありません"),
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;
    const userService = getUserService();

    try {
      await userService.update(user.id, { name, email });
      return { success: "アカウント情報を更新しました。" };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to update account",
      };
    }
  }
);
