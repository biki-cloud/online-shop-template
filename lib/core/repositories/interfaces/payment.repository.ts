import { IBaseRepository } from "../base.repository";
import type { Order } from "@/lib/infrastructure/db/schema";

export interface IPaymentRepository extends IBaseRepository<Order> {
  createCheckoutSession(data: {
    userId: number;
    orderId: number;
  }): Promise<{ id: string; url: string }>;
  handlePaymentSuccess(sessionId: string): Promise<void>;
  handlePaymentFailure(sessionId: string): Promise<void>;
  getStripePrices(): Promise<any[]>;
  getStripeProducts(): Promise<any[]>;
}
