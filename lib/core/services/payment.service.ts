import { redirect } from "next/navigation";
import "reflect-metadata";
import { inject, injectable } from "tsyringe";
import type Stripe from "stripe";
import { stripe } from "@/lib/infrastructure/payments/stripe";
import type { IPaymentRepository } from "../repositories/interfaces/payment.repository.interface";
import type { ICartRepository } from "../repositories/interfaces/cart.repository.interface";
import type { IOrderRepository } from "../repositories/interfaces/order.repository.interface";
import type { Cart, CartItem } from "@/lib/core/domain/cart";
import type { IPaymentService } from "./interfaces/payment.service";
import { UrlService } from "./url.service";
import type { IUrlService } from "./interfaces/url.service";

@injectable()
export class PaymentService implements IPaymentService {
  constructor(
    @inject("PaymentRepository")
    private readonly paymentRepository: IPaymentRepository,
    @inject("CartRepository")
    private readonly cartRepository: ICartRepository,
    @inject("OrderRepository")
    private readonly orderRepository: IOrderRepository,
    @inject("UrlService")
    private readonly urlService: IUrlService
  ) {}

  private static isValidUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    } catch {
      return false;
    }
  }

  private getFullImageUrl(imageUrl: string | null): string | undefined {
    if (!imageUrl) return undefined;

    // 既に完全なURLの場合はそのまま返す
    if (PaymentService.isValidUrl(imageUrl)) {
      return imageUrl;
    }

    // 相対パスの場合は、urlServiceを使用して完全なURLを生成
    const baseUrl = this.urlService.getBaseUrl().replace(/\/$/, "");
    if (!baseUrl) return undefined;

    const fullUrl = `${baseUrl}${
      imageUrl.startsWith("/") ? "" : "/"
    }${imageUrl}`;
    return PaymentService.isValidUrl(fullUrl) ? fullUrl : undefined;
  }

  async processCheckout(userId: number): Promise<void> {
    const cart = await this.cartRepository.findActiveCartByUserId(userId);
    if (!cart) {
      throw new Error("カートが見つかりません。");
    }

    const cartItems = await this.cartRepository.getCartItems(cart.id);
    if (!cartItems.length) {
      throw new Error("カートが空です。");
    }

    const subtotal = cartItems.reduce(
      (sum, item) => sum + Number(item.product!.price) * item.quantity,
      0
    );

    const order = await this.orderRepository.create({
      userId,
      totalAmount: subtotal.toString(),
      currency: "jpy",
      status: "pending",
    });

    // 注文アイテムを作成
    await this.orderRepository.createOrderItems(
      order.id,
      cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product!.price,
        currency: item.product!.currency,
      }))
    );

    const session = await this.paymentRepository.createCheckoutSession({
      userId,
      orderId: order.id,
    });

    if (!session) {
      throw new Error("チェックアウトセッションの作成に失敗しました。");
    }

    await this.orderRepository.update(order.id, {
      stripeSessionId: session.id,
    });

    // セッション情報を取得して確認
    const stripeSession = await stripe.checkout.sessions.retrieve(session.id);
    if (!stripeSession.url) {
      throw new Error("チェックアウトURLの取得に失敗しました。");
    }

    // Stripeのチェックアウトページにリダイレクト
    redirect(stripeSession.url);
  }

  async handleCheckoutSession(
    sessionId: string
  ): Promise<{ redirectUrl: string }> {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const order = await this.orderRepository.findByStripeSessionId(sessionId);

    if (!order) {
      throw new Error("注文が見つかりません。");
    }

    if (session.payment_status === "paid") {
      await this.handlePaymentSuccess(session);
      return { redirectUrl: `/orders/${order.id}` };
    }

    return { redirectUrl: `/orders/${order.id}` };
  }

  async handlePaymentSuccess(session: Stripe.Checkout.Session): Promise<void> {
    const orderId = Number(session.metadata?.orderId);
    if (!orderId) {
      throw new Error("注文IDが見つかりません。");
    }

    await this.orderRepository.update(orderId, {
      status: "paid",
      stripePaymentIntentId: session.payment_intent as string,
    });

    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error("注文が見つかりません。");
    }

    await this.cartRepository.clearCart(order.userId);
  }

  async handlePaymentFailure(session: Stripe.Checkout.Session): Promise<void> {
    const orderId = Number(session.metadata?.orderId);
    if (!orderId) {
      throw new Error("注文IDが見つかりません。");
    }

    await this.orderRepository.update(orderId, {
      status: "failed",
    });
  }

  async getStripePrices() {
    return await this.paymentRepository.getStripePrices();
  }

  async getStripeProducts() {
    return await this.paymentRepository.getStripeProducts();
  }
}
