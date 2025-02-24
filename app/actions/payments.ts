"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { getContainer } from "@/lib/di/container";
import type Stripe from "stripe";
import { IPaymentService } from "@/lib/core/services/interfaces/payment.service";

function getPaymentService() {
  const container = getContainer();
  return container.resolve<IPaymentService>("PaymentService");
}

export async function checkoutAction(formData: FormData) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in");
  }
  const paymentService = getPaymentService();
  await paymentService.processCheckout(parseInt(user.id));
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
