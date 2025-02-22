import {
  getOrders,
  getOrderById,
  getUserOrders,
  createOrder,
  createOrderItems,
  updateOrder,
  getOrderItems,
} from "../order";
import { getContainer } from "@/lib/di/container";
import type { Order, OrderItem } from "@/lib/core/domain/order";

const mockOrder: Order = {
  id: 1,
  userId: 1,
  totalAmount: "10000",
  currency: "JPY",
  status: "pending",
  shippingAddress: null,
  stripeSessionId: null,
  stripePaymentIntentId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOrderItem: OrderItem = {
  id: 1,
  orderId: 1,
  productId: 1,
  quantity: 2,
  price: "5000",
  currency: "JPY",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOrderService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  create: jest.fn(),
  createOrderItem: jest.fn(),
  update: jest.fn(),
  getOrderItems: jest.fn(),
};

jest.mock("@/lib/di/container", () => ({
  getContainer: jest.fn(() => ({
    resolve: jest.fn(() => mockOrderService),
  })),
}));

describe("Order Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getOrders", () => {
    it("should return all orders", async () => {
      const mockOrders = [mockOrder];
      mockOrderService.findAll.mockResolvedValue(mockOrders);

      const result = await getOrders();

      expect(mockOrderService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockOrders);
    });
  });

  describe("getOrderById", () => {
    it("should return an order by id", async () => {
      mockOrderService.findById.mockResolvedValue(mockOrder);

      const result = await getOrderById(1);

      expect(mockOrderService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockOrder);
    });

    it("should return null if order not found", async () => {
      mockOrderService.findById.mockResolvedValue(null);

      const result = await getOrderById(999);

      expect(mockOrderService.findById).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });

  describe("getUserOrders", () => {
    it("should return orders for a specific user", async () => {
      const mockOrders = [mockOrder];
      mockOrderService.findByUserId.mockResolvedValue(mockOrders);

      const result = await getUserOrders(1);

      expect(mockOrderService.findByUserId).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockOrders);
    });
  });

  describe("createOrder", () => {
    it("should create a new order", async () => {
      const input = {
        userId: 1,
        totalAmount: "10000",
        currency: "JPY",
      };
      mockOrderService.create.mockResolvedValue(mockOrder);

      const result = await createOrder(input);

      expect(mockOrderService.create).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockOrder);
    });
  });

  describe("createOrderItems", () => {
    it("should create order items", async () => {
      const items = [
        {
          productId: 1,
          quantity: 2,
          price: "5000",
          currency: "JPY",
        },
      ];
      mockOrderService.createOrderItem.mockResolvedValue(mockOrderItem);

      const result = await createOrderItems(1, items);

      expect(mockOrderService.createOrderItem).toHaveBeenCalledWith({
        ...items[0],
        orderId: 1,
      });
      expect(result).toEqual([mockOrderItem]);
    });
  });

  describe("updateOrder", () => {
    it("should update an existing order", async () => {
      const input = {
        status: "completed",
      };
      mockOrderService.update.mockResolvedValue({ ...mockOrder, ...input });

      const result = await updateOrder(1, input);

      expect(mockOrderService.update).toHaveBeenCalledWith(1, input);
      expect(result).toEqual({ ...mockOrder, ...input });
    });

    it("should return null if order not found", async () => {
      mockOrderService.update.mockResolvedValue(null);

      const result = await updateOrder(999, { status: "completed" });

      expect(mockOrderService.update).toHaveBeenCalledWith(999, {
        status: "completed",
      });
      expect(result).toBeNull();
    });
  });

  describe("getOrderItems", () => {
    it("should return order items for a specific order", async () => {
      const mockOrderItems = [mockOrderItem];
      mockOrderService.getOrderItems.mockResolvedValue(mockOrderItems);

      const result = await getOrderItems(1);

      expect(mockOrderService.getOrderItems).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockOrderItems);
    });
  });
});
