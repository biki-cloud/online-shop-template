import "reflect-metadata";
import { inject, injectable, container } from "tsyringe";
import type { Database } from "@/lib/infrastructure/db/drizzle";
import { stripe } from "@/lib/infrastructure/payments/stripe";
import { orders, orderItems, products } from "@/lib/infrastructure/db/schema";
import type { Order, OrderItem, Product } from "@/lib/infrastructure/db/schema";
import type { IPaymentRepository } from "./interfaces/payment.repository";
import { BaseRepository } from "./base.repository.impl";
import { eq } from "drizzle-orm";
import { getFullImageUrl } from "@/lib/shared/utils/url";
import { PgColumn } from "drizzle-orm/pg-core";
import { UrlService } from "@/lib/core/services/url.service";

class PaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentError";
  }
}

@injectable()
export class PaymentRepository
  extends BaseRepository<Order>
  implements IPaymentRepository
{
  private readonly urlService: UrlService;

  constructor(
    @inject("Database")
    protected readonly db: Database
  ) {
    super(db, orders);
    this.urlService = container.resolve(UrlService);
  }

  protected get idColumn(): PgColumn<any> {
    return orders.id;
  }

  async findById(id: number): Promise<Order | null> {
    const [result] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1)
      .execute();
    return result || null;
  }

  async findAll(): Promise<Order[]> {
    return await this.db.select().from(orders);
  }

  async create(data: {
    userId: number;
    totalAmount: string;
    currency: string;
    status?: string;
    shippingAddress?: string;
    stripeSessionId?: string;
    stripePaymentIntentId?: string;
  }): Promise<Order> {
    const [order] = await this.db
      .insert(orders)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return order;
  }

  async update(id: number, data: Partial<Order>): Promise<Order | null> {
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

  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .delete(orders)
      .where(eq(orders.id, id))
      .returning();
    return result.length > 0;
  }

  async createCheckoutSession(data: {
    userId: number;
    orderId: number;
  }): Promise<{ id: string; url: string }> {
    const order = await this.findById(data.orderId);
    if (!order) {
      throw new PaymentError("注文が見つかりません。");
    }

    type OrderItemWithProduct = OrderItem & {
      product: Pick<Product, "id" | "name" | "description" | "imageUrl">;
    };

    const items = await this.db
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
          description: products.description,
          imageUrl: products.imageUrl,
        },
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, data.orderId))
      .execute();

    if (!items.length) {
      throw new PaymentError("注文アイテムが見つかりません。");
    }

    const lineItems = items.map((item) => {
      if (!item.product) {
        throw new PaymentError("商品情報が見つかりません。");
      }

      const priceWithTax = Math.round(Number(item.price) * 1.1);
      const fullImageUrl = getFullImageUrl(item.product.imageUrl);

      return {
        price_data: {
          currency: item.currency.toLowerCase(),
          product_data: {
            name: item.product.name,
            description: item.product.description || undefined,
            images: fullImageUrl ? [fullImageUrl] : undefined,
          },
          unit_amount: priceWithTax,
        },
        quantity: item.quantity,
      };
    });

    if (!lineItems.length) {
      throw new PaymentError("商品情報の作成に失敗しました。");
    }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${this.urlService.getBaseUrl()}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${this.urlService.getBaseUrl()}/cart`,
        metadata: {
          orderId: order.id.toString(),
        },
      });

      return {
        id: session.id,
        url: session.url || "",
      };
    } catch (error) {
      console.error("Stripeセッションの作成に失敗しました:", error);
      throw new PaymentError("決済セッションの作成に失敗しました。");
    }
  }

  async handlePaymentSuccess(sessionId: string): Promise<void> {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const orderId = Number(session.metadata?.orderId);
    if (!orderId) {
      throw new PaymentError("注文IDが見つかりません。");
    }

    await this.update(orderId, {
      status: "paid",
      stripePaymentIntentId: session.payment_intent as string,
    });
  }

  async handlePaymentFailure(sessionId: string): Promise<void> {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const orderId = Number(session.metadata?.orderId);
    if (!orderId) {
      throw new PaymentError("注文IDが見つかりません。");
    }

    await this.update(orderId, {
      status: "failed",
    });
  }

  async getStripePrices() {
    const prices = await stripe.prices.list({
      expand: ["data.product"],
      active: true,
      type: "recurring",
    });

    return prices.data.map((price) => ({
      id: price.id,
      productId:
        typeof price.product === "string" ? price.product : price.product.id,
      unitAmount: price.unit_amount,
      currency: price.currency,
      interval: price.recurring?.interval,
      trialPeriodDays: price.recurring?.trial_period_days,
    }));
  }

  async getStripeProducts() {
    const products = await stripe.products.list({
      active: true,
      expand: ["data.default_price"],
    });

    return products.data.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      defaultPriceId:
        typeof product.default_price === "string"
          ? product.default_price
          : product.default_price?.id,
    }));
  }
}
