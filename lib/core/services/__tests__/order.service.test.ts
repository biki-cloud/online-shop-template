import "reflect-metadata";
import { container } from "tsyringe";
import { OrderService } from "../order.service.impl";
import { IOrderRepository } from "@/lib/core/repositories/interfaces/order.repository.interface";
import type { Order, OrderItem } from "@/lib/core/domain/order.domain";
import type { CreateOrderInput } from "@/lib/core/domain/order.domain";
import type { ISessionService } from "@/lib/core/services/interfaces/session.service.interface";

const mockSessionService: jest.Mocked<ISessionService> = {
  get: jest.fn(),
  set: jest.fn(),
  clear: jest.fn(),
  refresh: jest.fn(),
};

jest.mock("@/lib/di/container", () => ({
  getSessionService: jest.fn(() => mockSessionService),
}));

describe("OrderService", () => {
  let orderService: OrderService;
  let mockOrderRepository: jest.Mocked<IOrderRepository>;

  const mockOrder: Order = {
    id: 1,
    userId: 1,
    status: "pending",
    currency: "JPY",
    totalAmount: "1000",
    stripeSessionId: "",
    stripePaymentIntentId: "",
    shippingAddress: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockOrderRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByStripeSessionId: jest.fn(),
      create: jest.fn(),
      createOrderItems: jest.fn(),
      update: jest.fn(),
      getOrderItems: jest.fn(),
      delete: jest.fn(),
    };

    container.register("OrderRepository", { useValue: mockOrderRepository });
    orderService = container.resolve(OrderService);

    mockSessionService.get.mockResolvedValue({
      userId: mockOrder.userId,
      role: "user",
    });

    jest.clearAllMocks();
  });

  describe("findById", () => {
    it("should return order by id", async () => {
      mockOrderRepository.findById.mockResolvedValue(mockOrder);

      const order = await orderService.findById(1);

      expect(order).toEqual(mockOrder);
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(1);
    });

    it("should return null when order not found", async () => {
      mockOrderRepository.findById.mockResolvedValue(null);

      const order = await orderService.findById(1);

      expect(order).toBeNull();
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(1);
    });
  });

  describe("findByUserId", () => {
    it("should return orders by user id", async () => {
      mockOrderRepository.findByUserId.mockResolvedValue([mockOrder]);

      const orders = await orderService.findByUserId(1);

      expect(orders).toEqual([mockOrder]);
      expect(mockOrderRepository.findByUserId).toHaveBeenCalledWith(1);
    });

    it("should return empty array when no orders found", async () => {
      mockOrderRepository.findByUserId.mockResolvedValue([]);

      const orders = await orderService.findByUserId(1);

      expect(orders).toEqual([]);
      expect(mockOrderRepository.findByUserId).toHaveBeenCalledWith(1);
    });
  });

  describe("create", () => {
    it("should create new order", async () => {
      mockOrderRepository.create.mockResolvedValue(mockOrder);

      const createInput: CreateOrderInput = {
        userId: 1,
        currency: "JPY",
        totalAmount: "1000",
        stripeSessionId: "",
        stripePaymentIntentId: "",
        shippingAddress: "",
      };

      const order = await orderService.create(createInput);

      expect(order).toEqual(mockOrder);
      expect(mockOrderRepository.create).toHaveBeenCalledWith(createInput);
    });
  });

  describe("update", () => {
    it("should update order", async () => {
      mockOrderRepository.update.mockResolvedValue(mockOrder);

      const order = await orderService.update(1, {
        status: "completed",
      });

      expect(order).toEqual(mockOrder);
      expect(mockOrderRepository.update).toHaveBeenCalledWith(1, {
        status: "completed",
      });
    });

    it("should return null when order not found", async () => {
      mockOrderRepository.update.mockResolvedValue(null);

      const order = await orderService.update(1, {
        status: "completed",
      });

      expect(order).toBeNull();
      expect(mockOrderRepository.update).toHaveBeenCalledWith(1, {
        status: "completed",
      });
    });
  });
});
