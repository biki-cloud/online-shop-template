"use server";

import { getSessionService, getPaymentService } from "@/lib/di/container";

export async function handleCheckout() {
  const sessionService = getSessionService();
  const session = await sessionService.get();
  if (!session) return;

  const paymentService = getPaymentService();
  await paymentService.processCheckout(session.userId);
}
