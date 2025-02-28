import { Cart, CartItem, CreateCartInput } from "@/lib/core/domain/cart.domain";
import { IBaseRepository } from "../base.repository.impl";

export interface ICartRepository
  extends IBaseRepository<Cart, CreateCartInput> {
  findActiveCartByUserId(userId: number): Promise<Cart | null>;
  getCartItems(cartId: number): Promise<CartItem[]>;
  addToCart(
    cartId: number,
    productId: number,
    quantity?: number
  ): Promise<CartItem>;
  updateCartItemQuantity(
    cartItemId: number,
    quantity: number
  ): Promise<CartItem | null>;
  removeFromCart(cartItemId: number): Promise<boolean>;
  clearCart(userId: number): Promise<void>;
}
