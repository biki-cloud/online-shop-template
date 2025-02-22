import { eq, and, isNull } from "drizzle-orm";
import "reflect-metadata";
import { inject, injectable } from "tsyringe";
import type { Database } from "@/lib/infrastructure/db/drizzle";
import { products } from "@/lib/infrastructure/db/schema";
import type { IProductRepository } from "./interfaces/product.repository";
import { BaseRepository } from "./base.repository";
import { PgColumn } from "drizzle-orm/pg-core";
import type { Product, CreateProductInput } from "@/lib/core/domain/product";

@injectable()
export class ProductRepository
  extends BaseRepository<Product, CreateProductInput>
  implements IProductRepository
{
  constructor(
    @inject("Database")
    protected readonly db: Database
  ) {
    super(db, products);
  }

  protected get idColumn(): PgColumn<any> {
    return products.id;
  }

  async findAll(): Promise<Product[]> {
    const result = await this.db
      .select()
      .from(products)
      .where(isNull(products.deletedAt))
      .execute();
    return result;
  }

  async findById(id: number): Promise<Product | null> {
    const result = await this.db
      .select()
      .from(products)
      .where(and(eq(products.id, id), isNull(products.deletedAt)))
      .execute();
    return result[0] ?? null;
  }

  async create(
    data: Pick<
      Product,
      "name" | "description" | "price" | "stock" | "currency" | "imageUrl"
    >
  ): Promise<Product> {
    const [newProduct] = await this.db
      .insert(products)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .execute();

    return newProduct;
  }

  async update(
    id: number,
    data: Partial<
      Pick<
        Product,
        "name" | "description" | "price" | "stock" | "currency" | "imageUrl"
      >
    >
  ): Promise<Product | null> {
    const [updatedProduct] = await this.db
      .update(products)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning()
      .execute();

    return updatedProduct ?? null;
  }

  async delete(id: number): Promise<boolean> {
    const [deletedProduct] = await this.db
      .update(products)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning()
      .execute();

    return !!deletedProduct;
  }
}
