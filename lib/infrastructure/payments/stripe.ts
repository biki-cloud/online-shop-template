import Stripe from "stripe";
import { redirect } from "next/navigation";
import type { Cart, CartItem, Product } from "@/lib/infrastructure/db/schema";
import { calculateOrderAmount } from "@/lib/shared/utils";
import {
  createOrder,
  createOrderItems,
  updateOrder,
} from "@/app/actions/order";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function getFullImageUrl(imageUrl: string | null): string | undefined {
  if (!imageUrl) return undefined;

  // 既に完全なURLの場合はそのまま返す
  if (isValidUrl(imageUrl)) {
    return imageUrl;
  }

  // 相対パスの場合は、BASE_URLと組み合わせて完全なURLを生成
  const baseUrl = process.env.BASE_URL?.replace(/\/$/, "");
  if (!baseUrl) return undefined;

  const fullUrl = `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  return isValidUrl(fullUrl) ? fullUrl : undefined;
}

export async function createCheckoutSession({
  userId,
  cart,
  cartItems,
}: {
  userId: number;
  cart: Cart | null;
  cartItems: (CartItem & { product: Product | null })[];
}) {
  if (!cartItems.length) {
    redirect("/cart");
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.product!.price) * item.quantity,
    0
  );

  const { total } = calculateOrderAmount(subtotal);

  const lineItems = cartItems
    .filter((item) => item.product !== null)
    .map((item) => {
      const priceWithTax = Math.round(Number(item.product!.price) * 1.1);
      const fullImageUrl = getFullImageUrl(item.product!.imageUrl);

      return {
        price_data: {
          currency: item.product!.currency.toLowerCase(),
          product_data: {
            name: item.product!.name,
            description: item.product!.description || undefined,
            images: fullImageUrl ? [fullImageUrl] : undefined,
          },
          unit_amount: priceWithTax,
        },
        quantity: item.quantity,
      };
    });

  const order = await createOrder({
    userId,
    totalAmount: total.toString(),
    currency: "JPY",
  });

  await createOrderItems(
    order.id,
    cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.product!.price,
      currency: item.product!.currency,
    }))
  );

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/cart`,
    metadata: {
      orderId: order.id.toString(),
    },
  });

  await updateOrder(order.id, {
    status: "pending",
    stripeSessionId: session.id,
  });

  redirect(session.url!);
}

export async function handlePaymentSuccess(session: Stripe.Checkout.Session) {
  const orderId = Number(session.metadata?.orderId);
  if (!orderId) {
    throw new Error("注文IDが見つかりません。");
  }

  await updateOrder(orderId, {
    status: "paid",
    stripePaymentIntentId: session.payment_intent as string,
  });
}

export async function handlePaymentFailure(session: Stripe.Checkout.Session) {
  const orderId = Number(session.metadata?.orderId);
  if (!orderId) {
    throw new Error("注文IDが見つかりません。");
  }

  await updateOrder(orderId, {
    status: "failed",
  });
}

export async function getStripePrices() {
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

export async function getStripeProducts() {
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
