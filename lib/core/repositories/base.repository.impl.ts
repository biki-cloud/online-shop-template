import { eq } from "drizzle-orm";
import { PgTable, TableConfig, PgColumn } from "drizzle-orm/pg-core";
import { Database } from "@/lib/infrastructure/db/drizzle";

export interface IBaseRepository<T, TCreateInput = Partial<T>> {
  findById(id: number): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: TCreateInput): Promise<T>;
  update(id: number, data: Partial<T>): Promise<T | null>;
  delete(id: number): Promise<boolean>;
}

export abstract class BaseRepository<T, TCreateInput = Partial<T>>
  implements IBaseRepository<T, TCreateInput>
{
  constructor(
    protected readonly db: Database,
    protected readonly table: PgTable<TableConfig>
  ) {}

  protected abstract get idColumn(): PgColumn<any>;

  async findById(id: number): Promise<T | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(eq(this.idColumn, id))
      .limit(1)
      .execute();
    return (result as T) || null;
  }

  async findAll(): Promise<T[]> {
    const result = await this.db.select().from(this.table).execute();
    return result as T[];
  }

  async create(data: TCreateInput): Promise<T> {
    const [result] = await this.db
      .insert(this.table)
      .values(data as any)
      .returning()
      .execute();
    return result as T;
  }

  async update(id: number, data: Partial<T>): Promise<T | null> {
    const [result] = await this.db
      .update(this.table)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(this.idColumn, id))
      .returning()
      .execute();
    return (result as T) || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .delete(this.table)
      .where(eq(this.idColumn, id))
      .returning()
      .execute();
    return result.length > 0;
  }
}
