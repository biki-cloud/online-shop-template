import { and, eq } from "drizzle-orm";
import "reflect-metadata";
import { inject, injectable } from "tsyringe";
import type { Database } from "@/lib/infrastructure/db/drizzle";
import { cartItems, carts, products } from "@/lib/infrastructure/db/schema";
import { BaseRepository } from "./base.repository.impl";
import type { ICartRepository } from "./interfaces/cart.repository.interface";
import { PgColumn } from "drizzle-orm/pg-core";
import type { Cart, CartItem, CreateCartInput } from "@/lib/core/domain/cart";

@injectable()
export class CartRepository
  extends BaseRepository<Cart, CreateCartInput>
  implements ICartRepository
{
  constructor(
    @inject("Database")
    protected readonly db: Database
  ) {
    super(db, carts);
  }

  protected get idColumn(): PgColumn<any> {
    return carts.id;
  }

  async findActiveCartByUserId(userId: number): Promise<Cart | null> {
    const result = await this.db
      .select()
      .from(carts)
      .where(and(eq(carts.userId, userId), eq(carts.status, "active")))
      .limit(1);
    return result[0] ?? null;
  }

  async getCartItems(cartId: number): Promise<CartItem[]> {
    return await this.db
      .select({
        id: cartItems.id,
        cartId: cartItems.cartId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        createdAt: cartItems.createdAt,
        updatedAt: cartItems.updatedAt,
        product: {
          id: products.id,
          name: products.name,
          description: products.description,
          price: products.price,
          currency: products.currency,
          imageUrl: products.imageUrl,
          stock: products.stock,
        },
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, cartId));
  }

  async addToCart(
    cartId: number,
    productId: number,
    quantity: number = 1
  ): Promise<CartItem> {
    const existingItem = await this.db
      .select()
      .from(cartItems)
      .where(
        and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId))
      )
      .limit(1);

    if (existingItem.length > 0) {
      const result = await this.db
        .update(cartItems)
        .set({
          quantity: existingItem[0].quantity + quantity,
          updatedAt: new Date(),
        })
        .where(
          and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId))
        )
        .returning();
      return result[0];
    }

    const result = await this.db
      .insert(cartItems)
      .values({
        cartId,
        productId,
        quantity,
      })
      .returning();

    return result[0];
  }

  async updateCartItemQuantity(
    cartItemId: number,
    quantity: number
  ): Promise<CartItem | null> {
    const result = await this.db
      .update(cartItems)
      .set({
        quantity,
        updatedAt: new Date(),
      })
      .where(eq(cartItems.id, cartItemId))
      .returning();
    return result[0] || null;
  }

  async removeFromCart(cartItemId: number): Promise<boolean> {
    const result = await this.db
      .delete(cartItems)
      .where(eq(cartItems.id, cartItemId))
      .returning();
    return result.length > 0;
  }

  async clearCart(userId: number): Promise<void> {
    const cart = await this.findActiveCartByUserId(userId);
    if (!cart) return;

    await this.db
      .update(carts)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(carts.id, cart.id));
  }
}
