import "reflect-metadata";
import { inject, injectable } from "tsyringe";
import type { ICartRepository } from "../repositories/interfaces/cart.repository.interface";
import type { ICartService } from "./interfaces/cart.service";
import type { Cart, CartItem } from "@/lib/core/domain/cart";

@injectable()
export class CartService implements ICartService {
  constructor(
    @inject("CartRepository")
    private readonly cartRepository: ICartRepository
  ) {}

  async findActiveCart(userId: number): Promise<Cart | null> {
    return await this.cartRepository.findActiveCartByUserId(userId);
  }

  async getCartItems(cartId: number): Promise<CartItem[]> {
    return await this.cartRepository.getCartItems(cartId);
  }

  async addToCart(
    userId: number,
    productId: number,
    quantity: number = 1
  ): Promise<CartItem> {
    let cart = await this.findActiveCart(userId);

    if (!cart) {
      cart = await this.cartRepository.create({
        userId,
        status: "active",
      });
    }

    return await this.cartRepository.addToCart(cart.id, productId, quantity);
  }

  async updateCartItemQuantity(
    userId: number,
    cartItemId: number,
    quantity: number
  ): Promise<CartItem | null> {
    const cart = await this.findActiveCart(userId);
    if (!cart) return null;

    return await this.cartRepository.updateCartItemQuantity(
      cartItemId,
      quantity
    );
  }

  async removeFromCart(userId: number, cartItemId: number): Promise<boolean> {
    const cart = await this.findActiveCart(userId);
    if (!cart) return false;

    return await this.cartRepository.removeFromCart(cartItemId);
  }

  async clearCart(userId: number): Promise<void> {
    await this.cartRepository.clearCart(userId);
  }
}
