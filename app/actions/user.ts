"use server";

import { hash } from "bcryptjs";
import type {
  User,
  CreateUserInput,
  UpdateUserInput,
} from "@/lib/core/domain/user";
import { getContainer } from "@/lib/di/container";
import type { IUserService } from "@/lib/core/services/interfaces/user.service";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/client";

function getUserService() {
  const container = getContainer();
  return container.resolve<IUserService>("UserService");
}

export async function getUserById(id: number): Promise<User | null> {
  const userService = getUserService();
  return await userService.findById(id);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const userService = getUserService();
  return await userService.findByEmail(email);
}

export async function createUser(data: CreateUserInput): Promise<User> {
  const userService = getUserService();
  return await userService.create(data);
}

export async function updateUser(
  id: number,
  data: UpdateUserInput
): Promise<User | null> {
  const userService = getUserService();
  return await userService.update(id, data);
}

export async function deleteUser(id: number): Promise<boolean> {
  const userService = getUserService();
  return await userService.delete(id);
}

export async function validateUserPassword(
  email: string,
  password: string
): Promise<User | null> {
  const userService = getUserService();
  return await userService.validatePassword(email, password);
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const userService = getUserService();

    // まずメールアドレスで検索
    if (user.email) {
      const dbUser = await userService.findByEmail(user.email);
      if (dbUser) return dbUser;
    }

    // メールアドレスで見つからない場合はIDで検索
    const userId =
      typeof user.id === "string" ? parseInt(user.id.split(".")[0]) : null;
    if (!userId || isNaN(userId)) return null;

    return await userService.findById(userId);
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}

const updateProfileSchema = z.object({
  name: z.string().min(1, "名前は必須です").max(100),
  email: z.string().email("メールアドレスの形式が正しくありません"),
});

export async function updateProfile(formData: FormData) {
  const validatedFields = updateProfileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      error: "入力内容を確認してください",
    };
  }

  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        error: "認証が必要です",
      };
    }

    const userService = getUserService();
    await userService.update(parseInt(user.id), validatedFields.data);

    // ユーザーメタデータも更新
    await supabase.auth.updateUser({
      data: {
        name: validatedFields.data.name,
      },
    });

    revalidatePath("/settings");
    return { success: "プロフィールを更新しました" };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "エラーが発生しました",
    };
  }
}

export async function deleteAccount(formData: FormData) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        error: "認証が必要です",
      };
    }

    const userService = getUserService();
    await userService.delete(parseInt(user.id));

    // Supabaseのユーザーも削除
    await supabase.auth.admin.deleteUser(user.id);

    return { success: "アカウントを削除しました" };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "エラーが発生しました",
    };
  }
}
