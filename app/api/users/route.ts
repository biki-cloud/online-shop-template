import { NextResponse } from "next/server";
import { getContainer } from "@/lib/di/container";
import type { IUserService } from "@/lib/core/services/interfaces/user.service";
import { hash } from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, name, password } = await request.json();

    // 必須フィールドの検証
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "必須フィールドが不足しています" },
        { status: 400 }
      );
    }

    const container = getContainer();
    const userService = container.resolve<IUserService>("UserService");

    // メールアドレスの重複チェック
    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 400 }
      );
    }

    // パスワードのハッシュ化
    const passwordHash = await hash(password, 10);

    // ユーザーの作成
    const user = await userService.create({
      email,
      name,
      password: passwordHash,
      role: "user",
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "ユーザーの作成に失敗しました" },
      { status: 500 }
    );
  }
}
