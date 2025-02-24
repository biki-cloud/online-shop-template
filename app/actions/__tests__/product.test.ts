import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../product";
import { revalidatePath } from "next/cache";
import { getContainer } from "@/lib/di/container";
import type { Product } from "@/lib/core/domain/product";
import { getCurrentUser } from "../user";

// モックの設定
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("../user", () => ({
  getCurrentUser: jest.fn(),
}));

const mockProduct: Product = {
  id: 1,
  name: "Test Product",
  description: "Test Description",
  price: "1000",
  stock: 10,
  currency: "JPY",
  imageUrl: "test.jpg",
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockProductService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock("@/lib/di/container", () => ({
  getContainer: jest.fn(() => ({
    resolve: jest.fn(() => mockProductService),
  })),
}));

describe("Product Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 管理者権限を持つユーザーをモック
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: 1,
      email: "admin@example.com",
      name: "Admin User",
      role: "admin",
      passwordHash: "hashedPassword",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
  });

  describe("getProducts", () => {
    it("should return all products", async () => {
      const mockProducts = [mockProduct];
      mockProductService.findAll.mockResolvedValue(mockProducts);

      const result = await getProducts();

      expect(mockProductService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockProducts);
    });
  });

  describe("getProduct", () => {
    it("should return a product by id", async () => {
      mockProductService.findById.mockResolvedValue(mockProduct);

      const result = await getProduct(1);

      expect(mockProductService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProduct);
    });

    it("should return null if product not found", async () => {
      mockProductService.findById.mockResolvedValue(null);

      const result = await getProduct(999);

      expect(mockProductService.findById).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });

  describe("createProduct", () => {
    it("should create a new product", async () => {
      const input = {
        name: "New Product",
        description: "New Description",
        price: "2000",
        stock: 5,
        currency: "JPY",
        imageUrl: "new.jpg",
      };
      mockProductService.create.mockResolvedValue({ ...mockProduct, ...input });

      const result = await createProduct(input);

      expect(mockProductService.create).toHaveBeenCalledWith(input);
      expect(revalidatePath).toHaveBeenCalledWith("/admin/products");
      expect(result).toEqual({ ...mockProduct, ...input });
    });

    it("should throw error if user is not admin", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({
        id: 2,
        email: "user@example.com",
        name: "Regular User",
        role: "user",
        passwordHash: "hashedPassword",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const input = {
        name: "New Product",
        description: "New Description",
        price: "2000",
        stock: 5,
        currency: "JPY",
        imageUrl: "new.jpg",
      };

      await expect(createProduct(input)).rejects.toThrow("権限がありません");
    });
  });

  describe("updateProduct", () => {
    it("should update an existing product", async () => {
      const input = {
        name: "Updated Product",
        price: "3000",
      };
      mockProductService.update.mockResolvedValue({ ...mockProduct, ...input });

      const result = await updateProduct(1, input);

      expect(mockProductService.update).toHaveBeenCalledWith(1, input);
      expect(revalidatePath).toHaveBeenCalledWith("/admin/products");
      expect(revalidatePath).toHaveBeenCalledWith("/products/1");
      expect(result).toEqual({ ...mockProduct, ...input });
    });

    it("should return null if product not found", async () => {
      mockProductService.update.mockResolvedValue(null);

      const result = await updateProduct(999, { name: "Not Found" });

      expect(mockProductService.update).toHaveBeenCalledWith(999, {
        name: "Not Found",
      });
      expect(result).toBeNull();
    });

    it("should throw error if user is not admin", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({
        id: 2,
        email: "user@example.com",
        name: "Regular User",
        role: "user",
        passwordHash: "hashedPassword",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const input = {
        name: "Updated Product",
        price: "3000",
      };

      await expect(updateProduct(1, input)).rejects.toThrow("権限がありません");
    });
  });

  describe("deleteProduct", () => {
    it("should delete a product", async () => {
      mockProductService.delete.mockResolvedValue(true);

      const result = await deleteProduct(1);

      expect(mockProductService.delete).toHaveBeenCalledWith(1);
      expect(revalidatePath).toHaveBeenCalledWith("/admin/products");
      expect(result).toBe(true);
    });

    it("should return false if product not found", async () => {
      mockProductService.delete.mockResolvedValue(false);

      const result = await deleteProduct(999);

      expect(mockProductService.delete).toHaveBeenCalledWith(999);
      expect(result).toBe(false);
    });

    it("should throw error if user is not admin", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({
        id: 2,
        email: "user@example.com",
        name: "Regular User",
        role: "user",
        passwordHash: "hashedPassword",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      await expect(deleteProduct(1)).rejects.toThrow("権限がありません");
    });
  });
});
