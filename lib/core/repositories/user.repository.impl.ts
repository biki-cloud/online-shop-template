import { eq } from "drizzle-orm";
import "reflect-metadata";
import { inject, injectable } from "tsyringe";
import type { Database } from "@/lib/infrastructure/db/drizzle";
import { users } from "@/lib/infrastructure/db/schema";
import type { User as DbUser } from "@/lib/infrastructure/db/schema";
import type {
  User,
  UserRole,
  CreateUserInput,
  UpdateUserInput,
} from "@/lib/core/domain/user.domain";
import type { IUserRepository } from "./interfaces/user.repository.interface";

@injectable()
export class UserRepository implements IUserRepository {
  constructor(@inject("Database") protected readonly db: Database) {}

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0] ? this.toDomainUser(result[0]) : null;
  }

  private toDomainUser(dbUser: DbUser): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role as UserRole,
      passwordHash: dbUser.passwordHash,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
      deletedAt: dbUser.deletedAt,
    };
  }

  async findById(id: number): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] ? this.toDomainUser(result[0]) : null;
  }

  async findAll(): Promise<User[]> {
    const results = await this.db.select().from(users);
    return results.map(this.toDomainUser);
  }

  async create(input: CreateUserInput): Promise<User> {
    const result = await this.db.insert(users).values(input).returning();
    return this.toDomainUser(result[0]);
  }

  async update(id: number, input: UpdateUserInput): Promise<User> {
    const result = await this.db
      .update(users)
      .set(input)
      .where(eq(users.id, id))
      .returning();
    if (!result[0]) throw new Error("User not found");
    return this.toDomainUser(result[0]);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    return result.length > 0;
  }
}
