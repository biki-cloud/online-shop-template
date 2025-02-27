import { redirect } from "next/navigation";
import { CartItems } from "@/components/cart/cart-items";
import { CartSummary } from "@/components/cart/cart-summary";
import { container, getSessionService } from "@/lib/di/container";
import type { ICartService } from "@/lib/core/services/interfaces/cart.service";
import type { CartItem } from "@/lib/core/domain/cart";
import type { Product } from "@/lib/core/domain/product";
import { ShoppingCart } from "lucide-react";

export default async function CartPage() {
  const sessionService = getSessionService();
  const session = await sessionService.get();

  if (!session) {
    redirect("/sign-in");
  }

  const cartService = container.resolve<ICartService>("CartService");
  const cart = await cartService.findActiveCart(session.userId);

  if (!cart) {
    return (
      <div className="container max-w-7xl mx-auto py-16">
        <div className="flex items-center space-x-2 mb-8">
          <ShoppingCart className="h-6 w-6" />
          <h1 className="text-3xl font-bold">ショッピングカート</h1>
        </div>
        <div className="bg-background rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">カートは空です</p>
        </div>
      </div>
    );
  }

  const cartItems = (await cartService.getCartItems(cart.id)) as (CartItem & {
    product: Product | null;
  })[];

  return (
    <div className="container max-w-7xl mx-auto py-16">
      <div className="flex items-center space-x-2 mb-8">
        <ShoppingCart className="h-6 w-6" />
        <h1 className="text-3xl font-bold">ショッピングカート</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CartItems items={cartItems} />
        </div>
        <div>
          <CartSummary items={cartItems} />
        </div>
      </div>
    </div>
  );
}
