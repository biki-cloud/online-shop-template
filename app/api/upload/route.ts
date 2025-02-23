import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/infrastructure/storage/storage";

export async function POST(request: Request) {
  console.log("POST /api/upload");
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json(
        { error: "ファイルが見つかりません" },
        { status: 400 }
      );
    }

    const { url } = await uploadFile(file);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("画像アップロードエラー:", error);
    return NextResponse.json(
      { error: "画像のアップロードに失敗しました" },
      { status: 500 }
    );
  }
}
