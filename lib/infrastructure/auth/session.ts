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
import { hash, verify } from "@node-rs/argon2";

const key = new TextEncoder().encode(process.env.AUTH_SECRET);

// パスワードのハッシュ化関数
export async function hashPassword(password: string): Promise<string> {
  return hash(password);
}

// パスワードの比較関数
export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return verify(hashedPassword, plainTextPassword);
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
