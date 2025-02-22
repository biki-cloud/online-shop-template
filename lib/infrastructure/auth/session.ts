export const runtime = "edge";
export const preferredRegion = "iad1";
export const dynamic = "force-dynamic";

// セキュリティのために環境変数の存在チェックを追加
if (!process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET environment variable is not set");
}

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NewUser } from "@/lib/infrastructure/db/schema";

const key = new TextEncoder().encode(process.env.AUTH_SECRET);

// PBKDF2のパラメータ
const ITERATIONS = 100000;
const HASH_LENGTH = 32;
const SALT_LENGTH = 16;

// バイト配列を16進数文字列に変換
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// 16進数文字列をバイト配列に変換
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

// パスワードのハッシュ化関数
export async function hashPassword(password: string): Promise<string> {
  // ソルトを生成
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

  // パスワードをUint8Arrayに変換
  const passwordBuffer = new TextEncoder().encode(password);

  // PBKDF2でハッシュ化
  const keyBuffer = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyBuffer,
    HASH_LENGTH * 8
  );

  // ソルトとハッシュを結合して16進数文字列として保存
  const hashBytes = new Uint8Array(hash);
  return `${bytesToHex(salt)}:${bytesToHex(hashBytes)}`;
}

// パスワードの比較関数
export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    // ソルトとハッシュを分離
    const [saltHex, hashHex] = hashedPassword.split(":");
    const salt = hexToBytes(saltHex);

    // 入力されたパスワードをハッシュ化
    const passwordBuffer = new TextEncoder().encode(plainTextPassword);
    const keyBuffer = await crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );

    const newHash = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: ITERATIONS,
        hash: "SHA-256",
      },
      keyBuffer,
      HASH_LENGTH * 8
    );

    // ハッシュを比較
    const newHashHex = bytesToHex(new Uint8Array(newHash));
    return newHashHex === hashHex;
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}

type SessionData = {
  user: {
    id: number;
    role: string;
  };
  expires: string;
};

export async function signToken(payload: SessionData) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1 day from now")
    .sign(key);
}

export async function verifyToken(input: string) {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload as SessionData;
}

export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  return await verifyToken(session);
}

export async function setSession(user: NewUser) {
  const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session: SessionData = {
    user: {
      id: user.id!,
      role: user.role ?? "user",
    },
    expires: expiresInOneDay.toISOString(),
  };
  const encryptedSession = await signToken(session);
  (await cookies()).set("session", encryptedSession, {
    expires: expiresInOneDay,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
}
