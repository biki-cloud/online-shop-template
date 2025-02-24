import { NextResponse } from "next/server";
import { getContainer } from "@/lib/di/container";
import type { IUserService } from "@/lib/core/services/interfaces/user.service";
import { hash } from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { id, email, name } = await request.json();

    if (!id || !email) {
      return NextResponse.json(
        { error: "IDとメールアドレスは必須です" },
        { status: 400 }
      );
    }

    const container = getContainer();
    const userService = container.resolve<IUserService>("UserService");

    // まずメールアドレスで既存ユーザーを検索
    let user = await userService.findByEmail(email);
    if (user) {
      // ユーザーが存在する場合は情報を更新
      user = await userService.update(user.id, {
        name: name || user.name,
        email: email || user.email,
      });
      return NextResponse.json({ success: true, user });
    }

    // ユーザーが存在しない場合は新規作成
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await hash(tempPassword, 10);

    user = await userService.create({
      email,
      name: name || email,
      password: passwordHash,
      role: "user",
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error syncing user:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "ユーザー情報の同期に失敗しました" },
      { status: 500 }
    );
  }
}
