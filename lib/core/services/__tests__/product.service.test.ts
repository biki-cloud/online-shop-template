import "reflect-metadata";
import { container } from "tsyringe";
import { ProductService } from "../product.service";
import { MockProductRepository } from "@/lib/shared/test-utils/mock-repositories";
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
} from "@/lib/core/domain/product";

describe("ProductService", () => {
  let productService: ProductService;
  let mockProductRepository: MockProductRepository;
  const mockProduct: Product = {
    id: 1,
    name: "Test Product",
    description: "Test Description",
    price: "1000",
    stock: 10,
    currency: "jpy",
    imageUrl: "test.jpg",
    createdAt: new Date("2025-02-15T21:41:37.040Z"),
    updatedAt: new Date("2025-02-15T21:41:37.040Z"),
    deletedAt: null,
  };

  beforeEach(() => {
    // モックリポジトリの初期化
    mockProductRepository = new MockProductRepository();

    // メソッドのモック化
    jest.spyOn(mockProductRepository, "findAll");
    jest.spyOn(mockProductRepository, "findById");
    jest.spyOn(mockProductRepository, "create");
    jest.spyOn(mockProductRepository, "update");
    jest.spyOn(mockProductRepository, "delete");

    // DIコンテナの設定
    container.register("ProductRepository", {
      useValue: mockProductRepository,
    });

    // ProductServiceのインスタンス化
    productService = container.resolve(ProductService);

    // モックのリセット
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return all products", async () => {
      jest
        .spyOn(mockProductRepository, "findAll")
        .mockResolvedValue([mockProduct]);

      const products = await productService.findAll();

      expect(products).toEqual([mockProduct]);
      expect(mockProductRepository.findAll).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("should return product by id", async () => {
      jest
        .spyOn(mockProductRepository, "findById")
        .mockResolvedValue(mockProduct);

      const product = await productService.findById(1);

      expect(product).toEqual(mockProduct);
      expect(mockProductRepository.findById).toHaveBeenCalledWith(1);
    });

    it("should return null when product not found", async () => {
      jest.spyOn(mockProductRepository, "findById").mockResolvedValue(null);

      const product = await productService.findById(1);

      expect(product).toBeNull();
      expect(mockProductRepository.findById).toHaveBeenCalledWith(1);
    });
  });

  describe("create", () => {
    const createInput: CreateProductInput = {
      name: "Test Product",
      description: "Test Description",
      price: "1000",
      stock: 10,
      currency: "jpy",
      imageUrl: "test.jpg",
    };

    it("should create new product", async () => {
      jest
        .spyOn(mockProductRepository, "create")
        .mockResolvedValue(mockProduct);

      const product = await productService.create(createInput);

      expect(product).toEqual(mockProduct);
      expect(mockProductRepository.create).toHaveBeenCalledWith(createInput);
    });
  });

  describe("update", () => {
    const updateInput: UpdateProductInput = {
      name: "Updated Product",
      description: "Updated Description",
      price: "2000",
      stock: 20,
      currency: "jpy",
      imageUrl: "updated.jpg",
    };

    it("should update product", async () => {
      jest
        .spyOn(mockProductRepository, "findById")
        .mockResolvedValue(mockProduct);
      jest
        .spyOn(mockProductRepository, "update")
        .mockResolvedValue(mockProduct);

      const product = await productService.update(1, updateInput);

      expect(product).toEqual(mockProduct);
      expect(mockProductRepository.update).toHaveBeenCalledWith(1, updateInput);
    });

    it("should throw error when product not found", async () => {
      jest.spyOn(mockProductRepository, "findById").mockResolvedValue(null);
      jest.spyOn(mockProductRepository, "update").mockResolvedValue(null);

      await expect(productService.update(1, updateInput)).rejects.toThrow(
        "商品が見つかりません"
      );
      expect(mockProductRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("should delete product", async () => {
      jest
        .spyOn(mockProductRepository, "findById")
        .mockResolvedValue(mockProduct);
      jest.spyOn(mockProductRepository, "delete").mockResolvedValue();

      await productService.delete(1);

      expect(mockProductRepository.delete).toHaveBeenCalledWith(1);
    });

    it("should throw error when product not found", async () => {
      jest.spyOn(mockProductRepository, "findById").mockResolvedValue(null);
      jest.spyOn(mockProductRepository, "delete").mockResolvedValue();

      await expect(productService.delete(1)).rejects.toThrow(
        "商品が見つかりません"
      );
      expect(mockProductRepository.delete).not.toHaveBeenCalled();
    });
  });
});
