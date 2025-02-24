"use server";

import { redirect } from "next/navigation";
import {
  getSessionService,
  getPaymentService as getPaymentServiceFromContainer,
} from "@/lib/di/container";
import type Stripe from "stripe";
import { IPaymentService } from "@/lib/core/services/interfaces/payment.service";

function getPaymentService(): IPaymentService {
  return getPaymentServiceFromContainer();
}

export async function checkoutAction(formData: FormData) {
  const sessionService = getSessionService();
  const session = await sessionService.get();
  if (!session) {
    redirect("/sign-in");
  }
  const paymentService = getPaymentService();
  await paymentService.processCheckout(session.userId);
}

export async function handleStripeWebhook(session: Stripe.Checkout.Session) {
  const paymentService = getPaymentService();
  if (session.payment_status === "paid") {
    await paymentService.handlePaymentSuccess(session);
  } else if (session.payment_status === "unpaid") {
    await paymentService.handlePaymentFailure(session);
  }
}

export async function getStripePrices() {
  const paymentService = getPaymentService();
  return await paymentService.getStripePrices();
}

export async function getStripeProducts() {
  const paymentService = getPaymentService();
  return await paymentService.getStripeProducts();
}
