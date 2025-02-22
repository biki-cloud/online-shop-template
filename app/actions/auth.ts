"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createCheckoutSession } from "@/lib/infrastructure/payments/stripe";
import {
  validatedAction,
  validatedActionWithUser,
} from "@/lib/infrastructure/auth/middleware";
import { hashPassword, setSession } from "@/lib/infrastructure/auth/session";
import { getContainer } from "@/lib/di/container";
import type { IUserService } from "@/lib/core/services/interfaces/user.service";

function getUserService() {
  const container = getContainer();
  return container.resolve<IUserService>("UserService");
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;
  const userService = getUserService();

  const user = await userService.validatePassword(email, password);

  if (!user) {
    return {
      error: "メールアドレスまたはパスワードが正しくありません。",
      email,
      password,
    };
  }

  await setSession(user);

  const redirectTo = formData.get("redirect") as string | null;
  if (redirectTo === "checkout") {
    return createCheckoutSession({
      userId: user.id,
      cart: null,
      cartItems: [],
    });
  }

  redirect("/home");
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password, name } = data;
  const userService = getUserService();

  const existingUser = await userService.findByEmail(email);

  if (existingUser) {
    return {
      error: "このメールアドレスは既に登録されています。",
      email,
      password,
      name,
    };
  }

  const createdUser = await userService.create({
    email,
    password,
    name,
    role: "user",
  });

  if (!createdUser) {
    return {
      error: "ユーザーの作成に失敗しました。",
      email,
      password,
      name,
    };
  }

  await setSession(createdUser);

  const redirectTo = formData.get("redirect") as string | null;
  if (redirectTo === "checkout") {
    return createCheckoutSession({
      userId: createdUser.id,
      cart: null,
      cartItems: [],
    });
  }

  redirect("/home");
});

export async function signOut() {
  (await cookies()).delete("session");
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
    const userService = getUserService();

    const isValid = await userService.validatePassword(
      user.email,
      currentPassword
    );

    if (!isValid) {
      return { error: "現在のパスワードが正しくありません。" };
    }

    if (currentPassword === newPassword) {
      return {
        error: "新しいパスワードは現在のパスワードと異なる必要があります。",
      };
    }

    const newPasswordHash = await hashPassword(newPassword);

    await userService.update(user.id, { password: newPassword });

    return { success: "パスワードを更新しました。" };
  }
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100),
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;
    const userService = getUserService();

    const isValid = await userService.validatePassword(user.email, password);
    if (!isValid) {
      return { error: "パスワードが正しくありません。" };
    }

    await userService.delete(user.id);

    (await cookies()).delete("session");
    redirect("/sign-in");
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

    await userService.update(user.id, { name, email });

    return { success: "アカウント情報を更新しました。" };
  }
);
