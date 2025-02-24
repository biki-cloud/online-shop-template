import { z } from "zod";

/**
 * 環境変数のスキーマ定義
 */
const envSchema = z.object({
  VAPID_EMAIL: z.string().email(),
  VAPID_PRIVATE_KEY: z.string().min(1),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().min(1),
});

/**
 * 環境変数の型定義
 */
export type Env = z.infer<typeof envSchema>;

/**
 * 環境変数のバリデーションと取得
 */
export const env = envSchema.parse({
  VAPID_EMAIL: process.env.VAPID_EMAIL,
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
});

/**
 * 環境変数が正しく設定されているかチェック
 */
export function validateEnv(): void {
  try {
    envSchema.parse(env);
  } catch (error) {
    console.error("❌ Invalid environment variables:", error);
    throw new Error("Invalid environment variables");
  }
}
