import "reflect-metadata";
import { container } from "@/lib/di/container";
import { OrderService } from "../order.service";
import { MockOrderRepository } from "@/lib/shared/test-utils/mock-repositories";

// stripeのモック
jest.mock("@/lib/infrastructure/payments/stripe", () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn(),
        retrieve: jest.fn(),
      },
    },
    products: {
      list: jest.fn(),
    },
    prices: {
      list: jest.fn(),
    },
  },
}));

// sessionのモック
jest.mock("@/lib/infrastructure/auth/session", () => ({
  getSession: jest.fn(),
  createSession: jest.fn(),
  updateSession: jest.fn(),
}));

describe("OrderService", () => {
  let orderService: OrderService;
  let mockOrderRepository: MockOrderRepository;

  beforeEach(() => {
    // モックリポジトリの初期化
    mockOrderRepository = new MockOrderRepository();

    // メソッドのモック化
    jest.spyOn(mockOrderRepository, "findAll");
    jest.spyOn(mockOrderRepository, "findById");
    jest.spyOn(mockOrderRepository, "findByUserId");
    jest.spyOn(mockOrderRepository, "getOrderItems");
    jest.spyOn(mockOrderRepository, "create");
    jest.spyOn(mockOrderRepository, "createOrderItems");
    jest.spyOn(mockOrderRepository, "update");
    jest.spyOn(mockOrderRepository, "findByStripeSessionId");

    // DIコンテナの設定
    container.register("OrderRepository", { useValue: mockOrderRepository });

    // OrderServiceのインスタンス化
    orderService = container.resolve(OrderService);

    // モックのリセット
    jest.clearAllMocks();
  });

  afterEach(() => {
    // DIコンテナのリセット
    container.clearInstances();
  });

  describe("findAll", () => {
    it("should return all orders", async () => {
      const now = new Date();
      const mockOrders = [
        {
          id: 1,
          createdAt: now,
          updatedAt: now,
          userId: 1,
          status: "pending",
          totalAmount: "1000",
          currency: "jpy",
          stripeSessionId: null,
          stripePaymentIntentId: null,
          shippingAddress: null,
        },
      ];

      jest.spyOn(mockOrderRepository, "findAll").mockResolvedValue(mockOrders);

      const orders = await orderService.findAll();
      expect(orders).toEqual(mockOrders);
      expect(mockOrderRepository.findAll).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("should return order by id", async () => {
      const now = new Date();
      const mockOrder = {
        id: 1,
        createdAt: now,
        updatedAt: now,
        userId: 1,
        status: "pending",
        totalAmount: "1000",
        currency: "jpy",
        stripeSessionId: null,
        stripePaymentIntentId: null,
        shippingAddress: null,
      };

      jest.spyOn(mockOrderRepository, "findById").mockResolvedValue(mockOrder);

      const order = await orderService.findById(1);
      expect(order).toEqual(mockOrder);
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(1);
    });
  });

  describe("findByUserId", () => {
    it("should return orders by user id", async () => {
      const now = new Date();
      const mockOrders = [
        {
          id: 1,
          createdAt: now,
          updatedAt: now,
          userId: 1,
          status: "pending",
          totalAmount: "1000",
          currency: "jpy",
          stripeSessionId: null,
          stripePaymentIntentId: null,
          shippingAddress: null,
        },
      ];

      jest
        .spyOn(mockOrderRepository, "findByUserId")
        .mockResolvedValue(mockOrders);

      const orders = await orderService.findByUserId(1);
      expect(orders).toEqual(mockOrders);
      expect(mockOrderRepository.findByUserId).toHaveBeenCalledWith(1);
    });
  });

  describe("getOrderItems", () => {
    it("should return order items by order id", async () => {
      const now = new Date();
      const mockOrderItems = [
        {
          id: 1,
          createdAt: now,
          updatedAt: now,
          orderId: 1,
          productId: 1,
          quantity: 1,
          price: "1000",
          currency: "jpy",
        },
      ];

      jest
        .spyOn(mockOrderRepository, "getOrderItems")
        .mockResolvedValue(mockOrderItems);

      const orderItems = await orderService.getOrderItems(1);
      expect(orderItems).toEqual(mockOrderItems);
      expect(mockOrderRepository.getOrderItems).toHaveBeenCalledWith(1);
    });
  });

  describe("create", () => {
    it("should create order", async () => {
      const now = new Date();
      const mockOrder = {
        id: 1,
        createdAt: now,
        updatedAt: now,
        userId: 1,
        status: "pending",
        totalAmount: "1000",
        currency: "jpy",
        stripeSessionId: "session1",
        stripePaymentIntentId: null,
        shippingAddress: "123 Main St",
      };

      jest.spyOn(mockOrderRepository, "create").mockResolvedValue(mockOrder);

      const order = await orderService.create({
        userId: 1,
        totalAmount: "1000",
        currency: "jpy",
        shippingAddress: "123 Main St",
        stripeSessionId: "session1",
      });
      expect(order).toEqual(mockOrder);
      expect(mockOrderRepository.create).toHaveBeenCalledWith({
        userId: 1,
        totalAmount: "1000",
        currency: "jpy",
        shippingAddress: "123 Main St",
        stripeSessionId: "session1",
      });
    });
  });

  describe("createOrderItem", () => {
    it("should create order item", async () => {
      const now = new Date();
      const mockOrderItems = [
        {
          id: 1,
          createdAt: now,
          updatedAt: now,
          orderId: 1,
          productId: 1,
          quantity: 1,
          price: "1000",
          currency: "jpy",
        },
      ];

      jest
        .spyOn(mockOrderRepository, "createOrderItems")
        .mockResolvedValue(mockOrderItems);

      const orderItem = await orderService.createOrderItem({
        orderId: 1,
        productId: 1,
        quantity: 1,
        price: "1000",
        currency: "jpy",
      });
      expect(orderItem).toEqual(mockOrderItems[0]);
      expect(mockOrderRepository.createOrderItems).toHaveBeenCalledWith(1, [
        {
          productId: 1,
          quantity: 1,
          price: "1000",
          currency: "jpy",
        },
      ]);
    });
  });

  describe("update", () => {
    it("should update order", async () => {
      const now = new Date();
      const mockOrder = {
        id: 1,
        createdAt: now,
        updatedAt: now,
        userId: 1,
        status: "completed",
        totalAmount: "1000",
        currency: "jpy",
        stripeSessionId: "session1",
        stripePaymentIntentId: null,
        shippingAddress: null,
      };

      jest.spyOn(mockOrderRepository, "update").mockResolvedValue(mockOrder);

      const order = await orderService.update(1, {
        status: "completed",
        stripeSessionId: "session1",
      });
      expect(order).toEqual(mockOrder);
      expect(mockOrderRepository.update).toHaveBeenCalledWith(1, {
        status: "completed",
        stripeSessionId: "session1",
      });
    });
  });

  describe("findByStripeSessionId", () => {
    it("should return order by stripe session id", async () => {
      const now = new Date();
      const mockOrder = {
        id: 1,
        createdAt: now,
        updatedAt: now,
        userId: 1,
        status: "pending",
        totalAmount: "1000",
        currency: "jpy",
        stripeSessionId: "session1",
        stripePaymentIntentId: null,
        shippingAddress: null,
      };

      jest
        .spyOn(mockOrderRepository, "findByStripeSessionId")
        .mockResolvedValue(mockOrder);

      const order = await orderService.findByStripeSessionId("session1");
      expect(order).toEqual(mockOrder);
      expect(mockOrderRepository.findByStripeSessionId).toHaveBeenCalledWith(
        "session1"
      );
    });
  });
});
