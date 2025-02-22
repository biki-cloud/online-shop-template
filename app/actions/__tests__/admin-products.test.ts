import { createProductAction } from "../admin-products";
import { createProduct } from "../product";
import { revalidatePath } from "next/cache";

// モックの設定
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("../product", () => ({
  createProduct: jest.fn(),
}));

describe("Admin Product Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createProductAction", () => {
    const validInput = {
      name: "Test Product",
      description: "Test Description",
      price: 1000,
      stock: 10,
      currency: "JPY",
      imageUrl: "test.jpg",
    };

    it("should create a product successfully", async () => {
      (createProduct as jest.Mock).mockResolvedValue({
        id: 1,
        ...validInput,
        price: validInput.price.toString(),
      });

      const result = await createProductAction(validInput);

      expect(createProduct).toHaveBeenCalledWith({
        ...validInput,
        price: validInput.price.toString(),
      });
      expect(revalidatePath).toHaveBeenCalledWith("/admin/products");
      expect(result).toEqual({ success: true });
    });

    it("should return error if product creation fails", async () => {
      (createProduct as jest.Mock).mockRejectedValue(
        new Error("Creation failed")
      );

      const result = await createProductAction(validInput);

      expect(createProduct).toHaveBeenCalledWith({
        ...validInput,
        price: validInput.price.toString(),
      });
      expect(result).toEqual({
        success: false,
        error: "商品の作成に失敗しました",
      });
    });

    it("should validate input data", async () => {
      const invalidInput = {
        name: "",
        description: "",
        price: -1,
        stock: -1,
        currency: "",
        imageUrl: "",
      };

      await expect(createProductAction(invalidInput)).rejects.toThrow();
      expect(createProduct).not.toHaveBeenCalled();
    });

    it("should handle minimum valid values", async () => {
      const minimalInput = {
        name: "A",
        description: "B",
        price: 0,
        stock: 0,
        currency: "JPY",
        imageUrl: "x",
      };

      (createProduct as jest.Mock).mockResolvedValue({
        id: 1,
        ...minimalInput,
        price: minimalInput.price.toString(),
      });

      const result = await createProductAction(minimalInput);

      expect(createProduct).toHaveBeenCalledWith({
        ...minimalInput,
        price: minimalInput.price.toString(),
      });
      expect(result).toEqual({ success: true });
    });
  });
});
