import "reflect-metadata";
import { container } from "tsyringe";
import { PaymentService } from "../payment.service";
import {
  MockCartRepository,
  MockOrderRepository,
  MockPaymentRepository,
} from "@/lib/shared/test-utils/mock-repositories";
import { stripe } from "@/lib/infrastructure/payments/stripe";
import { redirect } from "next/navigation";

// Stripeのモック
jest.mock("@/lib/infrastructure/payments/stripe", () => ({
  stripe: {
    checkout: {
      sessions: {
        retrieve: jest.fn(),
      },
    },
  },
}));

// next/navigationのモック
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

// process.envのモック
const originalEnv = process.env;
beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
});
afterAll(() => {
  process.env = originalEnv;
});

describe("PaymentService", () => {
  let paymentService: PaymentService;
  let mockCartRepository: MockCartRepository;
  let mockOrderRepository: MockOrderRepository;
  let mockPaymentRepository: MockPaymentRepository;

  beforeEach(() => {
    // モックリポジトリの初期化
    mockCartRepository = new MockCartRepository();
    mockOrderRepository = new MockOrderRepository();
    mockPaymentRepository = new MockPaymentRepository();

    // メソッドのモック化
    jest.spyOn(mockOrderRepository, "create");
    jest.spyOn(mockOrderRepository, "update");
    jest.spyOn(mockOrderRepository, "createOrderItems");
    jest.spyOn(mockOrderRepository, "findByStripeSessionId");
    jest.spyOn(mockOrderRepository, "findById");
    jest.spyOn(mockCartRepository, "clearCart");
    jest.spyOn(mockPaymentRepository, "getStripePrices");
    jest.spyOn(mockPaymentRepository, "getStripeProducts");

    // DIコンテナの設定
    container.register("CartRepository", { useValue: mockCartRepository });
    container.register("OrderRepository", { useValue: mockOrderRepository });
    container.register("PaymentRepository", {
      useValue: mockPaymentRepository,
    });

    // PaymentServiceのインスタンス化
    paymentService = container.resolve(PaymentService);

    // モックのリセット
    jest.clearAllMocks();
  });

  describe("processCheckout", () => {
    it("should process checkout successfully", async () => {
      // モックの設定
      const userId = 1;
      const now = new Date();
      const cartItems = [
        {
          id: 1,
          createdAt: now,
          updatedAt: now,
          cartId: 1,
          productId: 1,
          quantity: 2,
          product: {
            id: 1,
            price: "1000",
            currency: "jpy",
          },
        },
      ];

      jest
        .spyOn(mockCartRepository, "findActiveCartByUserId")
        .mockResolvedValue({
          id: 1,
          createdAt: now,
          updatedAt: now,
          userId,
          status: "active",
        });
      jest
        .spyOn(mockCartRepository, "getCartItems")
        .mockResolvedValue(cartItems);
      jest
        .spyOn(mockPaymentRepository, "createCheckoutSession")
        .mockResolvedValue({ id: "session_123", url: "https://example.com" });
      jest.spyOn(stripe.checkout.sessions, "retrieve").mockResolvedValue({
        id: "session_123",
        url: "https://checkout.stripe.com/session",
      } as any);

      // テストの実行
      await paymentService.processCheckout(userId);

      // アサーション
      expect(mockCartRepository.findActiveCartByUserId).toHaveBeenCalledWith(
        userId
      );
      expect(mockCartRepository.getCartItems).toHaveBeenCalledWith(1);
      expect(mockOrderRepository.create).toHaveBeenCalledWith({
        userId,
        totalAmount: "2000",
        currency: "jpy",
        status: "pending",
      });
      expect(mockOrderRepository.createOrderItems).toHaveBeenCalled();
      expect(mockPaymentRepository.createCheckoutSession).toHaveBeenCalledWith({
        userId,
        orderId: 1,
      });
      expect(mockOrderRepository.update).toHaveBeenCalledWith(1, {
        stripeSessionId: "session_123",
      });
      expect(stripe.checkout.sessions.retrieve).toHaveBeenCalledWith(
        "session_123"
      );
      expect(redirect).toHaveBeenCalledWith(
        "https://checkout.stripe.com/session"
      );
    });

    it("should throw error when cart is not found", async () => {
      const userId = 1;
      jest
        .spyOn(mockCartRepository, "findActiveCartByUserId")
        .mockResolvedValue(null);

      await expect(paymentService.processCheckout(userId)).rejects.toThrow(
        "カートが見つかりません。"
      );
    });

    it("should throw error when cart is empty", async () => {
      const userId = 1;
      const now = new Date();
      jest
        .spyOn(mockCartRepository, "findActiveCartByUserId")
        .mockResolvedValue({
          id: 1,
          createdAt: now,
          updatedAt: now,
          userId,
          status: "active",
        });
      jest.spyOn(mockCartRepository, "getCartItems").mockResolvedValue([]);

      await expect(paymentService.processCheckout(userId)).rejects.toThrow(
        "カートが空です。"
      );
    });

    it("should throw error when checkout session creation fails", async () => {
      const userId = 1;
      const now = new Date();
      const cartItems = [
        {
          id: 1,
          createdAt: now,
          updatedAt: now,
          cartId: 1,
          productId: 1,
          quantity: 2,
          product: {
            id: 1,
            price: "1000",
            currency: "jpy",
          },
        },
      ];

      jest
        .spyOn(mockCartRepository, "findActiveCartByUserId")
        .mockResolvedValue({
          id: 1,
          createdAt: now,
          updatedAt: now,
          userId,
          status: "active",
        });
      jest
        .spyOn(mockCartRepository, "getCartItems")
        .mockResolvedValue(cartItems);
      jest
        .spyOn(mockPaymentRepository, "createCheckoutSession")
        .mockRejectedValue(
          new Error("チェックアウトセッションの作成に失敗しました。")
        );

      await expect(paymentService.processCheckout(userId)).rejects.toThrow(
        "チェックアウトセッションの作成に失敗しました。"
      );
    });

    it("should throw error when checkout URL is not available", async () => {
      const userId = 1;
      const now = new Date();
      const cartItems = [
        {
          id: 1,
          createdAt: now,
          updatedAt: now,
          cartId: 1,
          productId: 1,
          quantity: 2,
          product: {
            id: 1,
            price: "1000",
            currency: "jpy",
          },
        },
      ];

      jest
        .spyOn(mockCartRepository, "findActiveCartByUserId")
        .mockResolvedValue({
          id: 1,
          createdAt: now,
          updatedAt: now,
          userId,
          status: "active",
        });
      jest
        .spyOn(mockCartRepository, "getCartItems")
        .mockResolvedValue(cartItems);
      jest
        .spyOn(mockPaymentRepository, "createCheckoutSession")
        .mockResolvedValue({ id: "session_123", url: "https://example.com" });
      jest
        .spyOn(stripe.checkout.sessions, "retrieve")
        .mockRejectedValue(
          new Error("チェックアウトURLの取得に失敗しました。")
        );

      await expect(paymentService.processCheckout(userId)).rejects.toThrow(
        "チェックアウトURLの取得に失敗しました。"
      );
    });
  });

  describe("handleCheckoutSession", () => {
    it("should handle successful payment", async () => {
      const sessionId = "session_123";
      const orderId = 1;
      const now = new Date();

      jest.spyOn(stripe.checkout.sessions, "retrieve").mockResolvedValue({
        payment_status: "paid",
        payment_intent: "pi_123",
        metadata: { orderId: orderId.toString() },
      } as any);

      jest
        .spyOn(mockOrderRepository, "findByStripeSessionId")
        .mockResolvedValue({
          id: orderId,
          createdAt: now,
          updatedAt: now,
          userId: 1,
          status: "pending",
          totalAmount: "1000",
          currency: "jpy",
          stripeSessionId: sessionId,
          stripePaymentIntentId: null,
          shippingAddress: null,
        });

      const result = await paymentService.handleCheckoutSession(sessionId);

      expect(result).toEqual({
        redirectUrl: `/orders/${orderId}`,
      });
      expect(mockOrderRepository.update).toHaveBeenCalledWith(orderId, {
        status: "paid",
        stripePaymentIntentId: "pi_123",
      });
    });

    it("should handle unpaid payment", async () => {
      const sessionId = "session_123";
      const orderId = 1;
      const now = new Date();

      jest.spyOn(stripe.checkout.sessions, "retrieve").mockResolvedValue({
        payment_status: "unpaid",
        metadata: { orderId: orderId.toString() },
      } as any);

      jest
        .spyOn(mockOrderRepository, "findByStripeSessionId")
        .mockResolvedValue({
          id: orderId,
          createdAt: now,
          updatedAt: now,
          userId: 1,
          status: "pending",
          totalAmount: "1000",
          currency: "jpy",
          stripeSessionId: sessionId,
          stripePaymentIntentId: null,
          shippingAddress: null,
        });

      const result = await paymentService.handleCheckoutSession(sessionId);

      expect(result).toEqual({
        redirectUrl: `/orders/${orderId}`,
      });
    });

    it("should throw error when order is not found", async () => {
      const sessionId = "session_123";

      jest.spyOn(stripe.checkout.sessions, "retrieve").mockResolvedValue({
        payment_status: "paid",
      } as any);

      jest
        .spyOn(mockOrderRepository, "findByStripeSessionId")
        .mockResolvedValue(null);

      await expect(
        paymentService.handleCheckoutSession(sessionId)
      ).rejects.toThrow("注文が見つかりません。");
    });
  });

  describe("handlePaymentSuccess", () => {
    it("should handle successful payment", async () => {
      const sessionId = "session_123";
      const orderId = 1;
      const userId = 1;
      const now = new Date();

      const session = {
        payment_intent: "pi_123",
        metadata: { orderId: orderId.toString() },
      } as any;

      jest.spyOn(mockOrderRepository, "findById").mockResolvedValue({
        id: orderId,
        createdAt: now,
        updatedAt: now,
        userId,
        status: "pending",
        totalAmount: "1000",
        currency: "jpy",
        stripeSessionId: sessionId,
        stripePaymentIntentId: null,
        shippingAddress: null,
      });

      await paymentService.handlePaymentSuccess(session);

      expect(mockOrderRepository.update).toHaveBeenCalledWith(orderId, {
        status: "paid",
        stripePaymentIntentId: "pi_123",
      });
      expect(mockCartRepository.clearCart).toHaveBeenCalledWith(userId);
    });

    it("should throw error when order is not found", async () => {
      const session = {
        payment_intent: "pi_123",
        metadata: { orderId: "999" },
      } as any;

      jest.spyOn(mockOrderRepository, "findById").mockResolvedValue(null);

      await expect(
        paymentService.handlePaymentSuccess(session)
      ).rejects.toThrow("注文が見つかりません。");
    });

    it("should throw error when orderId is not found in metadata", async () => {
      const session = {
        payment_intent: "pi_123",
        metadata: {},
      } as any;

      await expect(
        paymentService.handlePaymentSuccess(session)
      ).rejects.toThrow("注文IDが見つかりません。");
    });
  });

  describe("handlePaymentFailure", () => {
    it("should handle payment failure", async () => {
      const sessionId = "session_123";
      const orderId = 1;
      const now = new Date();

      const session = {
        metadata: { orderId: orderId.toString() },
      } as any;

      jest.spyOn(mockOrderRepository, "findById").mockResolvedValue({
        id: orderId,
        createdAt: now,
        updatedAt: now,
        userId: 1,
        status: "pending",
        totalAmount: "1000",
        currency: "jpy",
        stripeSessionId: sessionId,
        stripePaymentIntentId: null,
        shippingAddress: null,
      });

      await paymentService.handlePaymentFailure(session);

      expect(mockOrderRepository.update).toHaveBeenCalledWith(orderId, {
        status: "failed",
      });
    });

    it("should throw error when orderId is not found in metadata", async () => {
      const session = {
        metadata: {},
      } as any;

      await expect(
        paymentService.handlePaymentFailure(session)
      ).rejects.toThrow("注文IDが見つかりません。");
    });
  });

  describe("getStripePrices", () => {
    it("should return stripe prices", async () => {
      const mockPrices = [
        { id: "price_1", product: "prod_1", unit_amount: 1000 },
        { id: "price_2", product: "prod_2", unit_amount: 2000 },
      ];

      jest
        .spyOn(mockPaymentRepository, "getStripePrices")
        .mockResolvedValue(mockPrices);

      const result = await paymentService.getStripePrices();

      expect(result).toEqual(mockPrices);
      expect(mockPaymentRepository.getStripePrices).toHaveBeenCalled();
    });
  });

  describe("getStripeProducts", () => {
    it("should return stripe products", async () => {
      const mockProducts = [
        { id: "prod_1", name: "Product 1" },
        { id: "prod_2", name: "Product 2" },
      ];

      jest
        .spyOn(mockPaymentRepository, "getStripeProducts")
        .mockResolvedValue(mockProducts);

      const result = await paymentService.getStripeProducts();

      expect(result).toEqual(mockProducts);
      expect(mockPaymentRepository.getStripeProducts).toHaveBeenCalled();
    });
  });

  describe("URL utility functions", () => {
    it("should validate URLs correctly", () => {
      const validUrls = [
        "https://example.com",
        "http://localhost:3000",
        "https://sub.domain.com/path?query=1",
      ];
      const invalidUrls = [
        "not-a-url",
        "http://",
        "https://",
        "ftp://example.com",
        "",
      ];

      validUrls.forEach((url) => {
        // @ts-ignore: テスト用に private 関数にアクセス
        expect(PaymentService["isValidUrl"](url)).toBe(true);
      });

      invalidUrls.forEach((url) => {
        // @ts-ignore: テスト用に private 関数にアクセス
        expect(PaymentService["isValidUrl"](url)).toBe(false);
      });
    });

    it("should generate full image URLs correctly", () => {
      process.env.BASE_URL = "https://example.com";

      const testCases = [
        {
          input: null,
          expected: undefined,
        },
        {
          input: "https://external.com/image.jpg",
          expected: "https://external.com/image.jpg",
        },
        {
          input: "/images/local.jpg",
          expected: "https://example.com/images/local.jpg",
        },
        {
          input: "images/local.jpg",
          expected: "https://example.com/images/local.jpg",
        },
      ];

      testCases.forEach(({ input, expected }) => {
        // @ts-ignore: テスト用に private 関数にアクセス
        expect(PaymentService["getFullImageUrl"](input)).toBe(expected);
      });
    });

    it("should handle missing BASE_URL", () => {
      process.env.BASE_URL = undefined;

      // @ts-ignore: テスト用に private 関数にアクセス
      expect(PaymentService["getFullImageUrl"]("/image.jpg")).toBe(undefined);
    });
  });
});
