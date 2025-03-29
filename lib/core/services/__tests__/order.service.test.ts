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

  describe("findAll", () => {
    it("すべての注文を返す", async () => {
      mockOrderRepository.findAll.mockResolvedValue([mockOrder]);

      const orders = await orderService.findAll();

      expect(orders).toEqual([mockOrder]);
      expect(mockOrderRepository.findAll).toHaveBeenCalled();
    });

    it("注文がない場合は空配列を返す", async () => {
      mockOrderRepository.findAll.mockResolvedValue([]);

      const orders = await orderService.findAll();

      expect(orders).toEqual([]);
      expect(mockOrderRepository.findAll).toHaveBeenCalled();
    });
  });

  describe("getOrderItems", () => {
    const mockOrderItems: (OrderItem & {
      product: {
        id: number;
        name: string;
        imageUrl: string | null;
      } | null;
    })[] = [
      {
        id: 1,
        orderId: 1,
        productId: 1,
        quantity: 2,
        price: "1000",
        currency: "JPY",
        createdAt: new Date(),
        updatedAt: new Date(),
        product: {
          id: 1,
          name: "テスト商品",
          imageUrl: "/images/test.jpg",
        },
      },
    ];

    it("指定された注文のアイテムを返す", async () => {
      mockOrderRepository.getOrderItems.mockResolvedValue(mockOrderItems);

      const orderItems = await orderService.getOrderItems(1);

      expect(orderItems).toEqual(mockOrderItems);
      expect(mockOrderRepository.getOrderItems).toHaveBeenCalledWith(1);
    });

    it("注文アイテムがない場合は空配列を返す", async () => {
      mockOrderRepository.getOrderItems.mockResolvedValue([]);

      const orderItems = await orderService.getOrderItems(1);

      expect(orderItems).toEqual([]);
      expect(mockOrderRepository.getOrderItems).toHaveBeenCalledWith(1);
    });
  });

  describe("createOrderItem", () => {
    const mockOrderItem: OrderItem = {
      id: 1,
      orderId: 1,
      productId: 1,
      quantity: 2,
      price: "1000",
      currency: "JPY",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("新しい注文アイテムを作成する", async () => {
      mockOrderRepository.createOrderItems.mockResolvedValue([mockOrderItem]);

      const orderItem = await orderService.createOrderItem({
        orderId: 1,
        productId: 1,
        quantity: 2,
        price: "1000",
        currency: "JPY",
      });

      expect(orderItem).toEqual(mockOrderItem);
      expect(mockOrderRepository.createOrderItems).toHaveBeenCalledWith(1, [
        {
          productId: 1,
          quantity: 2,
          price: "1000",
          currency: "JPY",
        },
      ]);
    });
  });

  describe("findByStripeSessionId", () => {
    it("Stripeセッションに関連する注文を返す", async () => {
      const mockOrderWithSession = {
        ...mockOrder,
        stripeSessionId: "session_id_123",
      };
      mockOrderRepository.findByStripeSessionId.mockResolvedValue(
        mockOrderWithSession
      );

      const order = await orderService.findByStripeSessionId("session_id_123");

      expect(order).toEqual(mockOrderWithSession);
      expect(mockOrderRepository.findByStripeSessionId).toHaveBeenCalledWith(
        "session_id_123"
      );
    });

    it("セッションIDに該当する注文がない場合はnullを返す", async () => {
      mockOrderRepository.findByStripeSessionId.mockResolvedValue(null);

      const order = await orderService.findByStripeSessionId(
        "non_existent_session"
      );

      expect(order).toBeNull();
      expect(mockOrderRepository.findByStripeSessionId).toHaveBeenCalledWith(
        "non_existent_session"
      );
    });
  });
});
