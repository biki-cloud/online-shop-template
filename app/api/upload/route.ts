import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { uploadFile } from "@/lib/infrastructure/storage/storage";
import { USE_MOCK } from "@/lib/di/config";

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

    if (USE_MOCK) {
      console.log("uploadFile local");
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // ファイル名をUUIDに基づいて生成
      const uniqueId = uuidv4();
      const extension = file.name.split(".").pop();
      const fileName = `${uniqueId}.${extension}`;

      // publicディレクトリ内のuploadsフォルダに保存
      const path = join(process.cwd(), "public", "uploads", fileName);
      await writeFile(path, buffer);

      // 画像のURLを返す
      const url = `/uploads/${fileName}`;
      return NextResponse.json({ url });
    } else {
      console.log("uploadFile s3", file);
      const { url } = await uploadFile(file);
      return NextResponse.json({ url });
    }
  } catch (error) {
    console.error("画像アップロードエラー:", error);
    return NextResponse.json(
      { error: "画像のアップロードに失敗しました" },
      { status: 500 }
    );
  }
}
