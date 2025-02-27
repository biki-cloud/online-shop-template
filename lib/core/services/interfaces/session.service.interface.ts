import type { User } from "@/lib/core/domain/user";

export interface ISessionService {
  get(): Promise<{ userId: number; role: string } | null>;
  set(user: User): Promise<void>;
  clear(): Promise<void>;
  refresh(): Promise<void>;
}
