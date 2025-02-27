import type Stripe from "stripe";

export interface IPaymentService {
  processCheckout(userId: number): Promise<void>;
  handlePaymentSuccess(session: Stripe.Checkout.Session): Promise<void>;
  handlePaymentFailure(session: Stripe.Checkout.Session): Promise<void>;
  getStripePrices(): Promise<Partial<Stripe.Price>[]>;
  getStripeProducts(): Promise<Partial<Stripe.Product>[]>;
  handleCheckoutSession(sessionId: string): Promise<{ redirectUrl: string }>;
}
