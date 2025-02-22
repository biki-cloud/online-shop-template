import { eq } from "drizzle-orm";
import "reflect-metadata";
import { inject, injectable } from "tsyringe";
import type { Database } from "@/lib/infrastructure/db/drizzle";
import { users } from "@/lib/infrastructure/db/schema";
import type { User } from "@/lib/infrastructure/db/schema";
import type { IUserRepository } from "./interfaces/user.repository";
import { BaseRepository } from "./base.repository";
import { PgColumn } from "drizzle-orm/pg-core";
import { comparePasswords } from "@/lib/infrastructure/auth/session";

@injectable()
export class UserRepository
  extends BaseRepository<User>
  implements IUserRepository
{
  constructor(
    @inject("Database")
    protected readonly db: Database
  ) {
    super(db, users);
  }

  protected get idColumn(): PgColumn<any> {
    return users.id;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0] ?? null;
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const isValid = await comparePasswords(password, user.passwordHash);
    return isValid ? user : null;
  }
}
