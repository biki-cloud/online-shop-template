"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/app/actions/user";
import { getContainer } from "@/lib/di/container";
import { ICartService } from "@/lib/core/services/interfaces/cart.service";

function getCartService() {
  const container = getContainer();
  return container.resolve<ICartService>("CartService");
}

export async function addToCart(productId: number, quantity: number = 1) {
  console.log("[addToCart] Starting to add item to cart");
  console.log("[addToCart] Product ID:", productId, "Quantity:", quantity);

  const user = await getCurrentUser();
  console.log("[addToCart] Current user:", user);

  if (!user) {
    console.log("[addToCart] No user found, throwing error");
    throw new Error("ログインが必要です");
  }

  const cartService = getCartService();
  console.log("[addToCart] Adding item to cart for user:", user.id);

  try {
    const cartItem = await cartService.addToCart(user.id, productId, quantity);
    console.log("[addToCart] Successfully added item to cart:", cartItem);
    revalidatePath("/cart");
    return cartItem;
  } catch (error) {
    console.error("[addToCart] Error adding item to cart:", error);
    throw error;
  }
}

export async function updateCartItemQuantity(
  cartItemId: number,
  quantity: number
) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("ログインが必要です");
  }

  const cartService = getCartService();
  await cartService.updateCartItemQuantity(user.id, cartItemId, quantity);
  revalidatePath("/cart");
}

export async function removeFromCart(cartItemId: number) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("ログインが必要です");
  }

  const cartService = getCartService();
  await cartService.removeFromCart(user.id, cartItemId);
  revalidatePath("/cart");
}
