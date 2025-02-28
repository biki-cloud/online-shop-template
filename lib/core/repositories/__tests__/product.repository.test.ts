import "reflect-metadata";
import { ProductRepository } from "../product.repository.impl";
import { mockDb } from "@/lib/shared/test-utils/mock-repositories";
import { products } from "@/lib/infrastructure/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import type { Database } from "@/lib/infrastructure/db/drizzle";

jest.mock("@/lib/infrastructure/db/drizzle", () => ({
  db: mockDb,
}));

describe("ProductRepository", () => {
  let repository: ProductRepository;
  const db = mockDb as any;
  const mockProduct = {
    id: 1,
    name: "Test Product",
    description: "Test Description",
    price: "1000",
    currency: "jpy",
    stock: 10,
    imageUrl: "test.jpg",
    createdAt: new Date("2025-02-15T14:06:24.881Z"),
    updatedAt: new Date("2025-02-15T14:06:24.881Z"),
    deletedAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new ProductRepository(db);
    db.select.mockReturnThis();
    db.from.mockReturnThis();
    db.where.mockReturnThis();
    db.insert.mockReturnThis();
    db.values.mockReturnThis();
    db.returning.mockReturnThis();
    db.update.mockReturnThis();
    db.set.mockReturnThis();
  });

  describe("findAll", () => {
    it("should return all products", async () => {
      db.execute.mockResolvedValueOnce([mockProduct]);

      const result = await repository.findAll();

      expect(result).toEqual([mockProduct]);
      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalledWith(products);
      expect(db.where).toHaveBeenCalledWith(isNull(products.deletedAt));
    });

    it("should return empty array when no products found", async () => {
      db.execute.mockResolvedValueOnce([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe("findById", () => {
    it("should return a product by id", async () => {
      db.execute.mockResolvedValueOnce([mockProduct]);

      const result = await repository.findById(1);

      expect(result).toEqual(mockProduct);
      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalledWith(products);
      expect(db.where).toHaveBeenCalledWith(
        and(eq(products.id, 1), isNull(products.deletedAt))
      );
    });

    it("should return null when product not found", async () => {
      db.execute.mockResolvedValueOnce([]);

      const result = await repository.findById(1);

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create a product", async () => {
      const productData = {
        name: "New Product",
        description: "New Description",
        price: "2000",
        stock: 5,
        imageUrl: "new.jpg",
        currency: "jpy",
      };

      db.execute.mockResolvedValueOnce([{ ...mockProduct, ...productData }]);

      const result = await repository.create(productData);

      expect(result).toEqual({ ...mockProduct, ...productData });
      expect(db.insert).toHaveBeenCalledWith(products);
      expect(db.values).toHaveBeenCalledWith({
        ...productData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(db.returning).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update a product", async () => {
      const updateData = {
        name: "Updated Product",
        description: "Updated Description",
      };

      db.execute.mockResolvedValueOnce([{ ...mockProduct, ...updateData }]);

      const result = await repository.update(1, updateData);

      expect(result).toEqual({ ...mockProduct, ...updateData });
      expect(db.update).toHaveBeenCalledWith(products);
      expect(db.set).toHaveBeenCalledWith({
        ...updateData,
        updatedAt: expect.any(Date),
      });
      expect(db.where).toHaveBeenCalledWith(eq(products.id, 1));
      expect(db.returning).toHaveBeenCalled();
    });

    it("should return null when product not found", async () => {
      db.execute.mockResolvedValueOnce([]);

      const result = await repository.update(1, { name: "Updated" });

      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should soft delete a product", async () => {
      const deletedAt = new Date("2025-02-15T14:09:42.407Z");

      db.execute.mockResolvedValueOnce([{ ...mockProduct, deletedAt }]);

      const result = await repository.delete(1);

      expect(result).toBeTruthy();
      expect(db.update).toHaveBeenCalledWith(products);
      expect(db.set).toHaveBeenCalledWith({
        deletedAt: expect.any(Date),
      });
      expect(db.where).toHaveBeenCalledWith(eq(products.id, 1));
    });

    it("should return false when product not found", async () => {
      db.execute.mockResolvedValueOnce([]);

      const result = await repository.delete(1);

      expect(result).toBeFalsy();
    });
  });

  describe("idColumn", () => {
    it("should return the id column", () => {
      // @ts-ignore - accessing protected property for testing
      const idColumn = repository.idColumn;
      expect(idColumn).toBe(products.id);
    });
  });
});
