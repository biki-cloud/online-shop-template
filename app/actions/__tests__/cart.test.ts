import { addToCart, removeFromCart, updateCartItemQuantity } from "../cart";
import { getCurrentUser } from "../user";
import { getContainer } from "@/lib/di/container";
import { ICartService } from "@/lib/core/services/interfaces/cart.service";
import { revalidatePath } from "next/cache";

// モックの設定
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("../user", () => ({
  getCurrentUser: jest.fn(),
}));

const mockCartService = {
  addToCart: jest.fn(),
  updateCartItemQuantity: jest.fn(),
  removeFromCart: jest.fn(),
};

jest.mock("@/lib/di/container", () => ({
  getContainer: jest.fn(() => ({
    resolve: jest.fn(() => mockCartService),
  })),
}));

describe("Cart Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addToCart", () => {
    it("should add item to cart for logged in user", async () => {
      const mockUser = { id: 1 };
      (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

      await addToCart(1, 2);

      expect(getCurrentUser).toHaveBeenCalled();
      expect(mockCartService.addToCart).toHaveBeenCalledWith(1, 1, 2);
      expect(revalidatePath).toHaveBeenCalledWith("/cart");
    });

    it("should throw error if user is not logged in", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      await expect(addToCart(1, 2)).rejects.toThrow("ログインが必要です");
      expect(mockCartService.addToCart).not.toHaveBeenCalled();
    });
  });

  describe("updateCartItemQuantity", () => {
    it("should update cart item quantity for logged in user", async () => {
      const mockUser = { id: 1 };
      (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

      await updateCartItemQuantity(1, 3);

      expect(getCurrentUser).toHaveBeenCalled();
      expect(mockCartService.updateCartItemQuantity).toHaveBeenCalledWith(
        1,
        1,
        3
      );
      expect(revalidatePath).toHaveBeenCalledWith("/cart");
    });

    it("should throw error if user is not logged in", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      await expect(updateCartItemQuantity(1, 3)).rejects.toThrow(
        "ログインが必要です"
      );
      expect(mockCartService.updateCartItemQuantity).not.toHaveBeenCalled();
    });
  });

  describe("removeFromCart", () => {
    it("should remove item from cart for logged in user", async () => {
      const mockUser = { id: 1 };
      (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

      await removeFromCart(1);

      expect(getCurrentUser).toHaveBeenCalled();
      expect(mockCartService.removeFromCart).toHaveBeenCalledWith(1, 1);
      expect(revalidatePath).toHaveBeenCalledWith("/cart");
    });

    it("should throw error if user is not logged in", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      await expect(removeFromCart(1)).rejects.toThrow("ログインが必要です");
      expect(mockCartService.removeFromCart).not.toHaveBeenCalled();
    });
  });
});
