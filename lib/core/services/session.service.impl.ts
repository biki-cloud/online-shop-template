import { injectable } from "tsyringe";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "@/lib/core/domain/user";
import type { ISessionService } from "./interfaces/session.service.interface";

interface SessionPayload {
  user: {
    id: number;
    role: string;
  };
  expires: string;
  [key: string]: any; // JWTPayloadの要件を満たすためのインデックスシグネチャ
}

@injectable()
export class SessionService implements ISessionService {
  private readonly key: Uint8Array;
  private readonly cookieName = "session";
  private readonly expirationTime = "1 day from now";

  constructor() {
    if (!process.env.AUTH_SECRET) {
      throw new Error("AUTH_SECRET environment variable is not set");
    }
    this.key = new TextEncoder().encode(process.env.AUTH_SECRET);
  }

  private async signToken(payload: SessionPayload) {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(this.expirationTime)
      .sign(this.key);
  }

  private async verifyToken(token: string): Promise<SessionPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.key, {
        algorithms: ["HS256"],
      });
      // 型安全のための検証
      const sessionPayload = payload as unknown as SessionPayload;
      if (
        !sessionPayload.user?.id ||
        !sessionPayload.user?.role ||
        !sessionPayload.expires
      ) {
        return null;
      }
      return sessionPayload;
    } catch {
      return null;
    }
  }

  async get() {
    const session = (await cookies()).get(this.cookieName)?.value;
    if (!session) return null;
    const payload = await this.verifyToken(session);
    if (!payload) return null;
    return {
      userId: payload.user.id,
      role: payload.user.role,
    };
  }

  async set(user: User) {
    const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session: SessionPayload = {
      user: {
        id: user.id,
        role: user.role,
      },
      expires: expiresInOneDay.toISOString(),
    };
    const encryptedSession = await this.signToken(session);
    (await cookies()).set(this.cookieName, encryptedSession, {
      expires: expiresInOneDay,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
  }

  async clear() {
    (await cookies()).delete(this.cookieName);
  }

  async refresh() {
    const session = await this.get();
    if (!session) return;
    await this.set({ id: session.userId, role: session.role } as User);
  }
}
