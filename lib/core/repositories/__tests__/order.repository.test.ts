import { OrderRepository } from "../order.repository.impl";
import { mockDb } from "@/lib/shared/test-utils/mock-repositories";
import { orders, orderItems, products } from "@/lib/infrastructure/db/schema";
import { eq } from "drizzle-orm";
import type { Database } from "@/lib/infrastructure/db/drizzle";

jest.mock("@/lib/infrastructure/db/drizzle", () => ({
  ...jest.requireActual("@/lib/infrastructure/db/drizzle"),
}));

describe("OrderRepository", () => {
  let repository: OrderRepository;
  const mockOrder = {
    id: 1,
    userId: 1,
    status: "pending" as const,
    totalAmount: "1000",
    currency: "jpy",
    stripeSessionId: null,
    stripePaymentIntentId: null,
    shippingAddress: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrderItem = {
    id: 1,
    orderId: 1,
    productId: 1,
    quantity: 1,
    price: "1000",
    currency: "jpy",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProduct = {
    id: 1,
    name: "Test Product",
    description: "Test Description",
    price: "1000",
    currency: "jpy",
    imageUrl: "test.jpg",
    stock: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new OrderRepository(mockDb as unknown as Database);
  });

  describe("findAll", () => {
    it("should return all orders", async () => {
      const db = mockDb as any;
      db.select.mockReturnThis();
      db.from.mockReturnValue([mockOrder]);

      const result = await repository.findAll();

      expect(result).toEqual([mockOrder]);
      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalledWith(orders);
    });
  });

  describe("findById", () => {
    it("should return order by id", async () => {
      const db = mockDb as any;
      db.select.mockReturnThis();
      db.from.mockReturnThis();
      db.where.mockReturnThis();
      db.limit.mockReturnValue([mockOrder]);

      const result = await repository.findById(1);

      expect(result).toEqual(mockOrder);
      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalledWith(orders);
      expect(db.where).toHaveBeenCalledWith(eq(orders.id, 1));
      expect(db.limit).toHaveBeenCalledWith(1);
    });

    it("should return null when order not found", async () => {
      const db = mockDb as any;
      db.select.mockReturnThis();
      db.from.mockReturnThis();
      db.where.mockReturnThis();
      db.limit.mockReturnValue([]);

      const result = await repository.findById(1);

      expect(result).toBeNull();
    });
  });

  describe("findByUserId", () => {
    it("should return orders by user id", async () => {
      const db = mockDb as any;
      db.select.mockReturnThis();
      db.from.mockReturnThis();
      db.where.mockReturnThis();
      db.orderBy.mockReturnValue([mockOrder]);

      const result = await repository.findByUserId(1);

      expect(result).toEqual([mockOrder]);
      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalledWith(orders);
      expect(db.where).toHaveBeenCalledWith(eq(orders.userId, 1));
      expect(db.orderBy).toHaveBeenCalledWith(orders.createdAt);
    });
  });

  describe("findByStripeSessionId", () => {
    it("should return order by stripe session id", async () => {
      const db = mockDb as any;
      db.select.mockReturnThis();
      db.from.mockReturnThis();
      db.where.mockReturnThis();
      db.limit.mockReturnValue([mockOrder]);

      const result = await repository.findByStripeSessionId("session_123");

      expect(result).toEqual(mockOrder);
      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalledWith(orders);
      expect(db.where).toHaveBeenCalledWith(
        eq(orders.stripeSessionId, "session_123")
      );
      expect(db.limit).toHaveBeenCalledWith(1);
    });

    it("should return null when order not found", async () => {
      const db = mockDb as any;
      db.select.mockReturnThis();
      db.from.mockReturnThis();
      db.where.mockReturnThis();
      db.limit.mockReturnValue([]);

      const result = await repository.findByStripeSessionId("session_123");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create new order", async () => {
      const db = mockDb as any;
      db.insert.mockReturnThis();
      db.values.mockReturnThis();
      db.returning.mockReturnValue([mockOrder]);

      const result = await repository.create({
        userId: 1,
        totalAmount: "1000",
        currency: "jpy",
      });

      expect(result).toEqual(mockOrder);
      expect(db.insert).toHaveBeenCalledWith(orders);
      expect(db.values).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          totalAmount: "1000",
          currency: "jpy",
          status: "pending",
        })
      );
      expect(db.returning).toHaveBeenCalled();
    });
  });

  describe("createOrderItems", () => {
    it("should create order items", async () => {
      const db = mockDb as any;
      db.insert.mockReturnThis();
      db.values.mockReturnThis();
      db.returning.mockReturnValue([mockOrderItem]);

      const items = [
        {
          productId: 1,
          quantity: 1,
          price: "1000",
          currency: "jpy",
        },
      ];

      const result = await repository.createOrderItems(1, items);

      expect(result).toEqual([mockOrderItem]);
      expect(db.insert).toHaveBeenCalledWith(orderItems);
      expect(db.values).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            orderId: 1,
            productId: 1,
            quantity: 1,
            price: "1000",
            currency: "jpy",
          }),
        ])
      );
      expect(db.returning).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update order", async () => {
      const db = mockDb as any;
      db.update.mockReturnThis();
      db.set.mockReturnThis();
      db.where.mockReturnThis();
      db.returning.mockReturnValue([{ ...mockOrder, status: "paid" }]);

      const result = await repository.update(1, { status: "paid" });

      expect(result).toEqual({ ...mockOrder, status: "paid" });
      expect(db.update).toHaveBeenCalledWith(orders);
      expect(db.set).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "paid",
          updatedAt: expect.any(Date),
        })
      );
      expect(db.where).toHaveBeenCalledWith(eq(orders.id, 1));
      expect(db.returning).toHaveBeenCalled();
    });

    it("should return null when order not found", async () => {
      const db = mockDb as any;
      db.update.mockReturnThis();
      db.set.mockReturnThis();
      db.where.mockReturnThis();
      db.returning.mockReturnValue([]);

      const result = await repository.update(1, { status: "paid" });

      expect(result).toBeNull();
    });
  });

  describe("getOrderItems", () => {
    it("should return order items with products", async () => {
      const mockOrderItemWithProduct = {
        ...mockOrderItem,
        product: {
          id: mockProduct.id,
        },
      };

      const db = mockDb as any;
      db.select.mockReturnThis();
      db.from.mockReturnThis();
      db.where.mockReturnThis();
      db.leftJoin.mockReturnThis();
      db.orderBy.mockReturnValue([mockOrderItemWithProduct]);

      const result = await repository.getOrderItems(1);

      expect(result).toEqual([mockOrderItemWithProduct]);
      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalledWith(orderItems);
      expect(db.where).toHaveBeenCalledWith(eq(orderItems.orderId, 1));
      expect(db.leftJoin).toHaveBeenCalledWith(
        products,
        eq(orderItems.productId, products.id)
      );
      expect(db.orderBy).toHaveBeenCalledWith(orderItems.createdAt);
    });
  });

  describe("idColumn", () => {
    it("should return the correct id column", () => {
      // @ts-ignore - accessing protected property for testing
      const idColumn = repository.idColumn;
      expect(idColumn).toBe(orders.id);
    });
  });
});
