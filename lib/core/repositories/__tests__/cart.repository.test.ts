import { CartRepository } from "../cart.repository.impl";
import { mockDb } from "@/lib/shared/test-utils/mock-repositories";
import { cartItems, carts, products } from "@/lib/infrastructure/db/schema";
import { and, eq } from "drizzle-orm";
import type { Database } from "@/lib/infrastructure/db/drizzle";

jest.mock("@/lib/infrastructure/db/drizzle", () => ({
  ...jest.requireActual("@/lib/infrastructure/db/drizzle"),
}));

describe("CartRepository", () => {
  let repository: CartRepository;
  const mockCart = {
    id: 1,
    userId: 1,
    status: "active" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const mockCartItem = {
    id: 1,
    cartId: 1,
    productId: 1,
    quantity: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const mockProduct = {
    id: 1,
    name: "Test Product",
    description: "Test Description",
    price: 1000,
    currency: "USD",
    imageUrl: "test.jpg",
    stock: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new CartRepository(mockDb as unknown as Database);
  });

  describe("findActiveCartByUserId", () => {
    it("should return active cart for user", async () => {
      const db = mockDb as any;
      db.select.mockReturnThis();
      db.from.mockReturnThis();
      db.where.mockReturnThis();
      db.limit.mockReturnValue([mockCart]);

      const result = await repository.findActiveCartByUserId(1);

      expect(result).toEqual(mockCart);
      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalledWith(carts);
      expect(db.where).toHaveBeenCalledWith(
        and(eq(carts.userId, 1), eq(carts.status, "active"))
      );
      expect(db.limit).toHaveBeenCalledWith(1);
    });

    it("should return null when no active cart found", async () => {
      const db = mockDb as any;
      db.select.mockReturnThis();
      db.from.mockReturnThis();
      db.where.mockReturnThis();
      db.limit.mockReturnValue([]);

      const result = await repository.findActiveCartByUserId(1);

      expect(result).toBeNull();
    });
  });

  describe("getCartItems", () => {
    it("should return cart items with products", async () => {
      const mockCartItemWithProduct = {
        ...mockCartItem,
        product: mockProduct,
      };

      const db = mockDb as any;
      db.select.mockReturnThis();
      db.from.mockReturnThis();
      db.leftJoin.mockReturnThis();
      db.where.mockReturnValue([mockCartItemWithProduct]);

      const result = await repository.getCartItems(1);

      expect(result).toEqual([mockCartItemWithProduct]);
      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalledWith(cartItems);
      expect(db.leftJoin).toHaveBeenCalledWith(
        products,
        eq(cartItems.productId, products.id)
      );
      expect(db.where).toHaveBeenCalledWith(eq(cartItems.cartId, 1));
    });
  });

  describe("addToCart", () => {
    it("should update quantity if item exists", async () => {
      const db = mockDb as any;
      db.select.mockReturnThis();
      db.from.mockReturnThis();
      db.where.mockReturnThis();
      db.limit.mockReturnValue([mockCartItem]);
      db.update.mockReturnThis();
      db.set.mockReturnThis();
      db.returning.mockReturnValue([{ ...mockCartItem, quantity: 2 }]);

      const result = await repository.addToCart(1, 1, 1);

      expect(result).toEqual({ ...mockCartItem, quantity: 2 });
      expect(db.update).toHaveBeenCalledWith(cartItems);
      expect(db.set).toHaveBeenCalled();
    });

    it("should create new item if not exists", async () => {
      const db = mockDb as any;
      db.select.mockReturnThis();
      db.from.mockReturnThis();
      db.where.mockReturnThis();
      db.limit.mockReturnValue([]);
      db.insert.mockReturnThis();
      db.values.mockReturnThis();
      db.returning.mockReturnValue([mockCartItem]);

      const result = await repository.addToCart(1, 1, 1);

      expect(result).toEqual(mockCartItem);
      expect(db.insert).toHaveBeenCalledWith(cartItems);
      expect(db.values).toHaveBeenCalledWith({
        cartId: 1,
        productId: 1,
        quantity: 1,
      });
    });
  });

  describe("updateCartItemQuantity", () => {
    it("should update cart item quantity", async () => {
      const updatedCartItem = { ...mockCartItem, quantity: 2 };
      const db = mockDb as any;
      db.update.mockReturnThis();
      db.set.mockReturnThis();
      db.where.mockReturnThis();
      db.returning.mockReturnValue([updatedCartItem]);

      const result = await repository.updateCartItemQuantity(1, 2);

      expect(result).toEqual(updatedCartItem);
      expect(db.update).toHaveBeenCalledWith(cartItems);
      expect(db.set).toHaveBeenCalled();
      expect(db.where).toHaveBeenCalledWith(eq(cartItems.id, 1));
    });

    it("should return null if item not found", async () => {
      const db = mockDb as any;
      db.update.mockReturnThis();
      db.set.mockReturnThis();
      db.where.mockReturnThis();
      db.returning.mockReturnValue([]);

      const result = await repository.updateCartItemQuantity(1, 2);

      expect(result).toBeNull();
    });
  });

  describe("removeFromCart", () => {
    it("should remove cart item and return true", async () => {
      const db = mockDb as any;
      db.delete.mockReturnThis();
      db.where.mockReturnThis();
      db.returning.mockReturnValue([mockCartItem]);

      const result = await repository.removeFromCart(1);

      expect(result).toBe(true);
      expect(db.delete).toHaveBeenCalledWith(cartItems);
      expect(db.where).toHaveBeenCalledWith(eq(cartItems.id, 1));
    });

    it("should return false if item not found", async () => {
      const db = mockDb as any;
      db.delete.mockReturnThis();
      db.where.mockReturnThis();
      db.returning.mockReturnValue([]);

      const result = await repository.removeFromCart(1);

      expect(result).toBe(false);
    });
  });
});
