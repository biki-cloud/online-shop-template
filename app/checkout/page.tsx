import { redirect } from "next/navigation";
import { container, getSessionService } from "@/lib/di/container";
import type { CartItem } from "@/lib/core/domain/cart";
import type { Product } from "@/lib/core/domain/product";
import type { ICartService } from "@/lib/core/services/interfaces/cart.service";
import { calculateOrderAmount } from "@/lib/shared/utils";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { handleCheckout } from "../actions/checkout";

export default async function CheckoutPage() {
  const sessionService = getSessionService();
  const session = await sessionService.get();
  if (!session) {
    redirect("/sign-in");
  }

  const cartService = container.resolve<ICartService>("CartService");

  const cart = await cartService.findActiveCart(session.userId);
  if (!cart) {
    redirect("/cart");
  }

  const cartItems = (await cartService.getCartItems(cart.id)) as (CartItem & {
    product: Product | null;
  })[];
  if (cartItems.length === 0) {
    redirect("/cart");
  }

  const subtotal = cartItems.reduce((acc: number, item) => {
    if (!item.product) return acc;
    return acc + Number(item.product.price) * item.quantity;
  }, 0);

  const { tax, total } = calculateOrderAmount(subtotal);

  return (
    <CheckoutForm
      cartItems={cartItems}
      subtotal={subtotal}
      tax={tax}
      total={total}
      onCheckout={handleCheckout}
    />
  );
}
