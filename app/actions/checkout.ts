"use server";

import { getSession } from "@/lib/infrastructure/auth/session";
import { container } from "@/lib/di/container";
import type { IPaymentService } from "@/lib/core/services/interfaces/payment.service";

export async function handleCheckout() {
  const session = await getSession();
  if (!session?.user) return;

  const paymentService = container.resolve<IPaymentService>("PaymentService");
  await paymentService.processCheckout(session.user.id);
}
