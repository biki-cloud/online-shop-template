import "reflect-metadata";
import { container } from "tsyringe";
import { CartService } from "../cart.service";
import { MockCartRepository } from "@/lib/shared/test-utils/mock-repositories";

describe("CartService", () => {
  let cartService: CartService;
  let mockCartRepository: MockCartRepository;

  beforeEach(() => {
    // モックリポジトリの初期化
    mockCartRepository = new MockCartRepository();

    // メソッドのモック化
    jest.spyOn(mockCartRepository, "findActiveCartByUserId");
    jest.spyOn(mockCartRepository, "getCartItems");
    jest.spyOn(mockCartRepository, "create");
    jest.spyOn(mockCartRepository, "addToCart");
    jest.spyOn(mockCartRepository, "updateCartItemQuantity");
    jest.spyOn(mockCartRepository, "removeFromCart");
    jest.spyOn(mockCartRepository, "clearCart");

    // DIコンテナの設定
    container.register("CartRepository", { useValue: mockCartRepository });

    // CartServiceのインスタンス化
    cartService = container.resolve(CartService);

    // モックのリセット
    jest.clearAllMocks();
  });

  describe("findActiveCart", () => {
    it("should find active cart for user", async () => {
      const userId = 1;
      const now = new Date();
      const expectedCart = {
        id: 1,
        createdAt: now,
        updatedAt: now,
        userId,
        status: "active",
      };

      jest
        .spyOn(mockCartRepository, "findActiveCartByUserId")
        .mockResolvedValue(expectedCart);

      const result = await cartService.findActiveCart(userId);

      expect(result).toEqual(expectedCart);
      expect(mockCartRepository.findActiveCartByUserId).toHaveBeenCalledWith(
        userId
      );
    });

    it("should return null when no active cart is found", async () => {
      const userId = 1;

      jest
        .spyOn(mockCartRepository, "findActiveCartByUserId")
        .mockResolvedValue(null);

      const result = await cartService.findActiveCart(userId);

      expect(result).toBeNull();
      expect(mockCartRepository.findActiveCartByUserId).toHaveBeenCalledWith(
        userId
      );
    });
  });

  describe("getCartItems", () => {
    it("should get cart items", async () => {
      const cartId = 1;
      const now = new Date();
      const expectedItems = [
        {
          id: 1,
          createdAt: now,
          updatedAt: now,
          cartId,
          productId: 1,
          quantity: 1,
          product: {
            id: 1,
            price: "1000",
            currency: "jpy",
          },
        },
      ];

      jest
        .spyOn(mockCartRepository, "getCartItems")
        .mockResolvedValue(expectedItems);

      const result = await cartService.getCartItems(cartId);

      expect(result).toEqual(expectedItems);
      expect(mockCartRepository.getCartItems).toHaveBeenCalledWith(cartId);
    });
  });

  describe("addToCart", () => {
    it("should add item to existing cart", async () => {
      const userId = 1;
      const productId = 1;
      const quantity = 2;
      const now = new Date();
      const existingCart = {
        id: 1,
        createdAt: now,
        updatedAt: now,
        userId,
        status: "active",
      };
      const expectedCartItem = {
        id: 1,
        createdAt: now,
        updatedAt: now,
        cartId: existingCart.id,
        productId,
        quantity,
      };

      jest
        .spyOn(mockCartRepository, "findActiveCartByUserId")
        .mockResolvedValue(existingCart);
      jest
        .spyOn(mockCartRepository, "addToCart")
        .mockResolvedValue(expectedCartItem);

      const result = await cartService.addToCart(userId, productId, quantity);

      expect(result).toEqual(expectedCartItem);
      expect(mockCartRepository.findActiveCartByUserId).toHaveBeenCalledWith(
        userId
      );
      expect(mockCartRepository.addToCart).toHaveBeenCalledWith(
        existingCart.id,
        productId,
        quantity
      );
    });

    it("should create new cart and add item when no active cart exists", async () => {
      const userId = 1;
      const productId = 1;
      const quantity = 2;
      const now = new Date();
      const newCart = {
        id: 1,
        createdAt: now,
        updatedAt: now,
        userId,
        status: "active",
      };
      const expectedCartItem = {
        id: 1,
        createdAt: now,
        updatedAt: now,
        cartId: newCart.id,
        productId,
        quantity,
      };

      jest
        .spyOn(mockCartRepository, "findActiveCartByUserId")
        .mockResolvedValue(null);
      jest.spyOn(mockCartRepository, "create").mockResolvedValue(newCart);
      jest
        .spyOn(mockCartRepository, "addToCart")
        .mockResolvedValue(expectedCartItem);

      const result = await cartService.addToCart(userId, productId, quantity);

      expect(result).toEqual(expectedCartItem);
      expect(mockCartRepository.findActiveCartByUserId).toHaveBeenCalledWith(
        userId
      );
      expect(mockCartRepository.create).toHaveBeenCalledWith({
        userId,
        status: "active",
      });
      expect(mockCartRepository.addToCart).toHaveBeenCalledWith(
        newCart.id,
        productId,
        quantity
      );
    });
  });

  describe("updateCartItemQuantity", () => {
    it("should update cart item quantity when cart exists", async () => {
      const userId = 1;
      const cartItemId = 1;
      const quantity = 3;
      const now = new Date();
      const existingCart = {
        id: 1,
        createdAt: now,
        updatedAt: now,
        userId,
        status: "active",
      };
      const expectedCartItem = {
        id: cartItemId,
        createdAt: now,
        updatedAt: now,
        cartId: existingCart.id,
        productId: 1,
        quantity,
      };

      jest
        .spyOn(mockCartRepository, "findActiveCartByUserId")
        .mockResolvedValue(existingCart);
      jest
        .spyOn(mockCartRepository, "updateCartItemQuantity")
        .mockResolvedValue(expectedCartItem);

      const result = await cartService.updateCartItemQuantity(
        userId,
        cartItemId,
        quantity
      );

      expect(result).toEqual(expectedCartItem);
      expect(mockCartRepository.findActiveCartByUserId).toHaveBeenCalledWith(
        userId
      );
      expect(mockCartRepository.updateCartItemQuantity).toHaveBeenCalledWith(
        cartItemId,
        quantity
      );
    });

    it("should return null when cart does not exist", async () => {
      const userId = 1;
      const cartItemId = 1;
      const quantity = 3;

      jest
        .spyOn(mockCartRepository, "findActiveCartByUserId")
        .mockResolvedValue(null);

      const result = await cartService.updateCartItemQuantity(
        userId,
        cartItemId,
        quantity
      );

      expect(result).toBeNull();
      expect(mockCartRepository.findActiveCartByUserId).toHaveBeenCalledWith(
        userId
      );
      expect(mockCartRepository.updateCartItemQuantity).not.toHaveBeenCalled();
    });
  });

  describe("removeFromCart", () => {
    it("should remove item from cart when cart exists", async () => {
      const userId = 1;
      const cartItemId = 1;
      const now = new Date();
      const existingCart = {
        id: 1,
        createdAt: now,
        updatedAt: now,
        userId,
        status: "active",
      };

      jest
        .spyOn(mockCartRepository, "findActiveCartByUserId")
        .mockResolvedValue(existingCart);
      jest.spyOn(mockCartRepository, "removeFromCart").mockResolvedValue(true);

      const result = await cartService.removeFromCart(userId, cartItemId);

      expect(result).toBe(true);
      expect(mockCartRepository.findActiveCartByUserId).toHaveBeenCalledWith(
        userId
      );
      expect(mockCartRepository.removeFromCart).toHaveBeenCalledWith(
        cartItemId
      );
    });

    it("should return false when cart does not exist", async () => {
      const userId = 1;
      const cartItemId = 1;

      jest
        .spyOn(mockCartRepository, "findActiveCartByUserId")
        .mockResolvedValue(null);

      const result = await cartService.removeFromCart(userId, cartItemId);

      expect(result).toBe(false);
      expect(mockCartRepository.findActiveCartByUserId).toHaveBeenCalledWith(
        userId
      );
      expect(mockCartRepository.removeFromCart).not.toHaveBeenCalled();
    });
  });

  describe("clearCart", () => {
    it("should clear cart", async () => {
      const userId = 1;

      jest.spyOn(mockCartRepository, "clearCart").mockResolvedValue();

      await cartService.clearCart(userId);

      expect(mockCartRepository.clearCart).toHaveBeenCalledWith(userId);
    });
  });
});
