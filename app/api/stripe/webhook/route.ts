import Stripe from "stripe";
import {
  handlePaymentSuccess,
  handlePaymentFailure,
  stripe,
} from "@/lib/infrastructure/payments/stripe";
import { NextRequest, NextResponse } from "next/server";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed." },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status === "paid") {
          await handlePaymentSuccess(session);
        }
        break;
      case "checkout.session.expired":
        const expiredSession = event.data.object as Stripe.Checkout.Session;
        await handlePaymentFailure(expiredSession);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return NextResponse.json(
      { error: "Error processing webhook." },
      { status: 500 }
    );
  }
}
