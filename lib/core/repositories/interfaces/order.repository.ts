import { Order, OrderItem } from "@/lib/infrastructure/db/schema";
import { IBaseRepository } from "../base.repository";

export interface IOrderRepository extends IBaseRepository<Order> {
  findAll(): Promise<Order[]>;
  findById(id: number): Promise<Order | null>;
  findByUserId(userId: number): Promise<Order[]>;
  findByStripeSessionId(sessionId: string): Promise<Order | null>;
  create(data: {
    userId: number;
    totalAmount: string;
    currency: string;
    status?: string;
    shippingAddress?: string;
    stripeSessionId?: string;
    stripePaymentIntentId?: string;
  }): Promise<Order>;
  createOrderItems(
    orderId: number,
    items: {
      productId: number;
      quantity: number;
      price: string;
      currency: string;
    }[]
  ): Promise<OrderItem[]>;
  update(
    id: number,
    data: Partial<{
      status: string;
      stripeSessionId: string;
      stripePaymentIntentId: string;
    }>
  ): Promise<Order | null>;
  getOrderItems(orderId: number): Promise<
    (OrderItem & {
      product: {
        id: number;
        name: string;
        imageUrl: string | null;
      } | null;
    })[]
  >;
}
