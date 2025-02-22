import { eq } from "drizzle-orm";
import "reflect-metadata";
import { inject, injectable } from "tsyringe";
import type { Database } from "@/lib/infrastructure/db/drizzle";
import {
  Order,
  OrderItem,
  orders,
  orderItems,
  products,
} from "@/lib/infrastructure/db/schema";
import type { IOrderRepository } from "./interfaces/order.repository";
import { BaseRepository } from "./base.repository";
import { PgColumn } from "drizzle-orm/pg-core";

@injectable()
export class OrderRepository
  extends BaseRepository<Order>
  implements IOrderRepository
{
  constructor(
    @inject("Database")
    protected readonly db: Database
  ) {
    super(db, orders);
  }

  protected get idColumn(): PgColumn<any> {
    return orders.id;
  }

  async findAll(): Promise<Order[]> {
    return await this.db.select().from(orders);
  }

  async findById(id: number): Promise<Order | null> {
    const result = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async findByUserId(userId: number): Promise<Order[]> {
    return await this.db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(orders.createdAt);
  }

  async findByStripeSessionId(sessionId: string): Promise<Order | null> {
    const result = await this.db
      .select()
      .from(orders)
      .where(eq(orders.stripeSessionId, sessionId))
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: {
    userId: number;
    totalAmount: string;
    currency: string;
    shippingAddress?: string;
    stripeSessionId?: string;
    stripePaymentIntentId?: string;
  }): Promise<Order> {
    const [order] = await this.db
      .insert(orders)
      .values({
        ...data,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return order;
  }

  async createOrderItems(
    orderId: number,
    items: {
      productId: number;
      quantity: number;
      price: string;
      currency: string;
    }[]
  ): Promise<OrderItem[]> {
    const orderItemsToInsert = items.map((item) => ({
      ...item,
      orderId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return await this.db
      .insert(orderItems)
      .values(orderItemsToInsert)
      .returning();
  }

  async update(
    id: number,
    data: Partial<{
      status: string;
      stripeSessionId: string;
      stripePaymentIntentId: string;
    }>
  ): Promise<Order | null> {
    const result = await this.db
      .update(orders)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();
    return result[0] ?? null;
  }

  async getOrderItems(orderId: number): Promise<
    (OrderItem & {
      product: {
        id: number;
        name: string;
        imageUrl: string | null;
      } | null;
    })[]
  > {
    return await this.db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        currency: orderItems.currency,
        createdAt: orderItems.createdAt,
        updatedAt: orderItems.updatedAt,
        product: {
          id: products.id,
          name: products.name,
          imageUrl: products.imageUrl,
        },
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId))
      .orderBy(orderItems.createdAt);
  }
}
