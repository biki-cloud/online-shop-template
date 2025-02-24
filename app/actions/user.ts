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
    console.log("[getCurrentUser] Starting to get current user");
    const supabase = createServerSupabaseClient();

    // セッション情報のログ追加
    const { data: sessionData } = await supabase.auth.getSession();
    console.log("[getCurrentUser] Session data:", sessionData);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("[getCurrentUser] Supabase user:", user);
    if (!user) {
      console.log("[getCurrentUser] No Supabase user found");
      return null;
    }

    const userService = getUserService();

    // まずメールアドレスで検索
    if (user.email) {
      console.log("[getCurrentUser] Searching by email:", user.email);
      const dbUser = await userService.findByEmail(user.email);
      if (dbUser) {
        console.log("[getCurrentUser] Found user by email:", dbUser);
        return dbUser;
      }
      console.log("[getCurrentUser] User not found by email");
    }

    // メールアドレスで見つからない場合はIDで検索
    const userId =
      typeof user.id === "string" ? parseInt(user.id.split(".")[0]) : null;
    console.log("[getCurrentUser] Trying to find by ID:", userId);

    if (!userId || isNaN(userId)) {
      console.log("[getCurrentUser] Invalid user ID");
      return null;
    }

    const idUser = await userService.findById(userId);
    console.log("[getCurrentUser] User found by ID:", idUser);
    return idUser;
  } catch (error) {
    console.error("[getCurrentUser] Error:", error);
    console.error(
      "[getCurrentUser] Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
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
