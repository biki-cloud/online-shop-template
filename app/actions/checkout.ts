"use server";

import { createServerSupabaseClient } from "@/lib/supabase/client";
import { container } from "@/lib/di/container";
import type { IPaymentService } from "@/lib/core/services/interfaces/payment.service";

export async function handleCheckout() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const paymentService = container.resolve<IPaymentService>("PaymentService");
  await paymentService.processCheckout(parseInt(user.id));
}
