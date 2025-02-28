"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/app/actions/user";
import { getContainer } from "@/lib/di/container";
import { ICartService } from "@/lib/core/services/interfaces/cart.service.interface";

function getCartService() {
  const container = getContainer();
  return container.resolve<ICartService>("CartService");
}

export async function addToCart(productId: number, quantity: number = 1) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("ログインが必要です");
  }

  const cartService = getCartService();
  await cartService.addToCart(user.id, productId, quantity);
  revalidatePath("/cart");
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
