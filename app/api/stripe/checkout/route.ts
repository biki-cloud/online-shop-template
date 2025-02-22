import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/di/container";
import type { IPaymentService } from "@/lib/core/services/interfaces/payment.service";

export const runtime = "nodejs";
export const preferredRegion = "iad1";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.redirect(new URL("/cart", request.url));
  }

  try {
    const paymentService = container.resolve<IPaymentService>("PaymentService");
    const result = await paymentService.handleCheckoutSession(sessionId);
    return NextResponse.redirect(new URL(result.redirectUrl, request.url));
  } catch (error) {
    console.error("チェックアウト処理中にエラーが発生しました:", error);
    return NextResponse.redirect(new URL("/error", request.url));
  }
}
