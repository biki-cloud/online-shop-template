import "reflect-metadata";
import { container } from "tsyringe";
import { PaymentService } from "../payment.service.impl";
import {
  MockCartRepository,
  MockOrderRepository,
  MockPaymentRepository,
} from "@/lib/shared/test-utils/mock-repositories";
import { stripe } from "@/lib/infrastructure/payments/stripe";
import { redirect } from "next/navigation";
import { UrlService } from "../url.service.impl";
import { ICartRepository } from "@/lib/core/repositories/interfaces/cart.repository.interface";
import { IOrderRepository } from "@/lib/core/repositories/interfaces/order.repository.interface";
import { IPaymentRepository } from "@/lib/core/repositories/interfaces/payment.repository.interface";
import { CartItem } from "@/lib/core/domain/cart.domain";
import { Product } from "@/lib/core/domain/product.domain";

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
  let mockCartRepository: jest.Mocked<ICartRepository>;
  let mockOrderRepository: jest.Mocked<IOrderRepository>;
  let mockPaymentRepository: jest.Mocked<IPaymentRepository>;
  let mockUrlService: jest.Mocked<UrlService>;

  beforeEach(() => {
    // モックリポジトリの初期化
    mockCartRepository = {
      findActiveCartByUserId: jest.fn(),
      getCartItems: jest.fn(),
      clearCart: jest.fn(),
      // 他のメソッドも適宜追加
    } as unknown as jest.Mocked<ICartRepository>;

    mockOrderRepository = {
      create: jest.fn(),
      update: jest.fn(),
      createOrderItems: jest.fn(),
      findByStripeSessionId: jest.fn(),
      findById: jest.fn(),
      // 他のメソッドも適宜追加
    } as unknown as jest.Mocked<IOrderRepository>;

    mockPaymentRepository = {
      createCheckoutSession: jest.fn(),
      getStripePrices: jest.fn(),
      getStripeProducts: jest.fn(),
      // 他のメソッドも適宜追加
    } as unknown as jest.Mocked<IPaymentRepository>;

    mockUrlService = {
      getBaseUrl: jest.fn().mockReturnValue("http://localhost:3000"),
      getFullUrl: jest.fn(),
      isValidUrl: jest.fn().mockImplementation((url: string) => {
        return url.startsWith("http://") || url.startsWith("https://");
      }),
    } as unknown as jest.Mocked<UrlService>;

    // DIコンテナの設定
    container.register("CartRepository", { useValue: mockCartRepository });
    container.register("OrderRepository", { useValue: mockOrderRepository });
    container.register("PaymentRepository", {
      useValue: mockPaymentRepository,
    });
    container.register("UrlService", { useValue: mockUrlService });

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
            name: "テスト商品",
            description: "テスト説明",
            price: "1000",
            currency: "jpy",
            imageUrl: "/test.jpg",
            stock: 10,
          },
        },
      ];

      mockCartRepository.findActiveCartByUserId.mockResolvedValue({
        id: 1,
        createdAt: now,
        updatedAt: now,
        userId,
        status: "active",
      });
      mockCartRepository.getCartItems.mockResolvedValue(cartItems);

      mockOrderRepository.create.mockResolvedValue({
        id: 1,
        userId,
        totalAmount: "2000",
        currency: "jpy",
        status: "pending",
        createdAt: now,
        updatedAt: now,
        stripeSessionId: null,
        stripePaymentIntentId: null,
        shippingAddress: null,
      });

      mockPaymentRepository.createCheckoutSession.mockResolvedValue({
        id: "session_123",
        url: "https://checkout.stripe.com/session",
      });

      (stripe.checkout.sessions.retrieve as jest.Mock).mockResolvedValue({
        id: "session_123",
        url: "https://checkout.stripe.com/session",
      });

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
      mockCartRepository.findActiveCartByUserId.mockResolvedValue(null);

      await expect(paymentService.processCheckout(userId)).rejects.toThrow(
        "カートが見つかりません。"
      );
    });

    it("should throw error when cart is empty", async () => {
      const userId = 1;
      const now = new Date();
      mockCartRepository.findActiveCartByUserId.mockResolvedValue({
        id: 1,
        createdAt: now,
        updatedAt: now,
        userId,
        status: "active",
      });
      mockCartRepository.getCartItems.mockResolvedValue([]);

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
            name: "テスト商品",
            description: "テスト説明",
            price: "1000",
            currency: "jpy",
            imageUrl: "/test.jpg",
            stock: 10,
          },
        },
      ];

      mockCartRepository.findActiveCartByUserId.mockResolvedValue({
        id: 1,
        createdAt: now,
        updatedAt: now,
        userId,
        status: "active",
      });
      mockCartRepository.getCartItems.mockResolvedValue(cartItems);
      mockOrderRepository.create.mockResolvedValue({
        id: 1,
        userId,
        totalAmount: "2000",
        currency: "jpy",
        status: "pending",
        createdAt: now,
        updatedAt: now,
        stripeSessionId: null,
        stripePaymentIntentId: null,
        shippingAddress: null,
      });
      mockPaymentRepository.createCheckoutSession.mockResolvedValue(
        null as any
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
            name: "テスト商品",
            description: "テスト説明",
            price: "1000",
            currency: "jpy",
            imageUrl: "/test.jpg",
            stock: 10,
          },
        },
      ];

      mockCartRepository.findActiveCartByUserId.mockResolvedValue({
        id: 1,
        createdAt: now,
        updatedAt: now,
        userId,
        status: "active",
      });
      mockCartRepository.getCartItems.mockResolvedValue(cartItems);
      mockOrderRepository.create.mockResolvedValue({
        id: 1,
        userId,
        totalAmount: "2000",
        currency: "jpy",
        status: "pending",
        createdAt: now,
        updatedAt: now,
        stripeSessionId: null,
        stripePaymentIntentId: null,
        shippingAddress: null,
      });
      mockPaymentRepository.createCheckoutSession.mockResolvedValue({
        id: "session_123",
        url: undefined as any,
      });
      (stripe.checkout.sessions.retrieve as jest.Mock).mockResolvedValue({
        id: "session_123",
        // url is missing
      });

      await expect(paymentService.processCheckout(userId)).rejects.toThrow(
        "チェックアウトURLの取得に失敗しました。"
      );
    });
  });

  describe("handleCheckoutSession", () => {
    it("支払いが完了した場合は注文詳細ページにリダイレクトする", async () => {
      const sessionId = "session_123";
      const now = new Date();
      const mockOrder = {
        id: 1,
        userId: 1,
        status: "pending",
        createdAt: now,
        updatedAt: now,
        totalAmount: "1000",
        currency: "jpy",
        stripeSessionId: "session_123",
        stripePaymentIntentId: null,
        shippingAddress: null,
      };

      // stripeのモック
      (stripe.checkout.sessions.retrieve as jest.Mock).mockResolvedValue({
        id: sessionId,
        payment_status: "paid",
        metadata: { orderId: "1" },
      });

      // repositoryのモック
      mockOrderRepository.findByStripeSessionId.mockResolvedValue(mockOrder);

      // handlePaymentSuccessのモック
      jest.spyOn(paymentService, "handlePaymentSuccess").mockResolvedValue();

      const result = await paymentService.handleCheckoutSession(sessionId);

      expect(result).toEqual({ redirectUrl: `/orders/1` });
      expect(stripe.checkout.sessions.retrieve).toHaveBeenCalledWith(sessionId);
      expect(mockOrderRepository.findByStripeSessionId).toHaveBeenCalledWith(
        sessionId
      );
      expect(paymentService.handlePaymentSuccess).toHaveBeenCalled();
    });

    it("注文が見つからない場合はエラーをスローする", async () => {
      const sessionId = "session_123";

      // stripeのモック
      (stripe.checkout.sessions.retrieve as jest.Mock).mockResolvedValue({
        id: sessionId,
        payment_status: "unpaid",
      });

      // repositoryのモック
      mockOrderRepository.findByStripeSessionId.mockResolvedValue(null);

      await expect(
        paymentService.handleCheckoutSession(sessionId)
      ).rejects.toThrow("注文が見つかりません。");

      expect(stripe.checkout.sessions.retrieve).toHaveBeenCalledWith(sessionId);
      expect(mockOrderRepository.findByStripeSessionId).toHaveBeenCalledWith(
        sessionId
      );
    });

    it("支払いが未完了でも注文詳細ページにリダイレクトする", async () => {
      const sessionId = "session_123";
      const now = new Date();
      const mockOrder = {
        id: 1,
        userId: 1,
        status: "pending",
        createdAt: now,
        updatedAt: now,
        totalAmount: "1000",
        currency: "jpy",
        stripeSessionId: "session_123",
        stripePaymentIntentId: null,
        shippingAddress: null,
      };

      // stripeのモック
      (stripe.checkout.sessions.retrieve as jest.Mock).mockResolvedValue({
        id: sessionId,
        payment_status: "unpaid",
        metadata: { orderId: "1" },
      });

      // repositoryのモック
      mockOrderRepository.findByStripeSessionId.mockResolvedValue(mockOrder);

      // handlePaymentSuccessのモック（呼ばれないことを確認するため）
      const handlePaymentSuccessSpy = jest.spyOn(
        paymentService,
        "handlePaymentSuccess"
      );

      const result = await paymentService.handleCheckoutSession(sessionId);

      expect(result).toEqual({ redirectUrl: `/orders/1` });
      expect(stripe.checkout.sessions.retrieve).toHaveBeenCalledWith(sessionId);
      expect(mockOrderRepository.findByStripeSessionId).toHaveBeenCalledWith(
        sessionId
      );
      // handlePaymentSuccessは呼ばれない
      expect(handlePaymentSuccessSpy).not.toHaveBeenCalled();
    });
  });

  describe("handlePaymentSuccess", () => {
    it("注文ステータスを更新しカートをクリアする", async () => {
      const now = new Date();
      const session = {
        id: "session_123",
        payment_intent: "pi_123",
        metadata: { orderId: "1" },
      };

      mockOrderRepository.update.mockResolvedValue({
        id: 1,
        userId: 1,
        status: "paid",
        createdAt: now,
        updatedAt: now,
        totalAmount: "1000",
        currency: "jpy",
        stripeSessionId: "session_123",
        stripePaymentIntentId: "pi_123",
        shippingAddress: null,
      });

      mockOrderRepository.findById.mockResolvedValue({
        id: 1,
        userId: 1,
        status: "paid",
        createdAt: now,
        updatedAt: now,
        totalAmount: "1000",
        currency: "jpy",
        stripeSessionId: "session_123",
        stripePaymentIntentId: "pi_123",
        shippingAddress: null,
      });

      await paymentService.handlePaymentSuccess(session as any);

      expect(mockOrderRepository.update).toHaveBeenCalledWith(1, {
        status: "paid",
        stripePaymentIntentId: "pi_123",
      });
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(1);
      expect(mockCartRepository.clearCart).toHaveBeenCalledWith(1);
    });

    it("注文IDがない場合はエラーをスローする", async () => {
      const session = {
        id: "session_123",
        payment_intent: "pi_123",
        metadata: {}, // orderId なし
      };

      await expect(
        paymentService.handlePaymentSuccess(session as any)
      ).rejects.toThrow("注文IDが見つかりません。");
    });

    it("注文が見つからない場合はエラーをスローする", async () => {
      const now = new Date();
      const session = {
        id: "session_123",
        payment_intent: "pi_123",
        metadata: { orderId: "1" },
      };

      mockOrderRepository.update.mockResolvedValue({
        id: 1,
        status: "paid",
        userId: 1,
        createdAt: now,
        updatedAt: now,
        totalAmount: "1000",
        currency: "jpy",
        stripeSessionId: "session_123",
        stripePaymentIntentId: "pi_123",
        shippingAddress: null,
      });

      mockOrderRepository.findById.mockResolvedValue(null);

      await expect(
        paymentService.handlePaymentSuccess(session as any)
      ).rejects.toThrow("注文が見つかりません。");

      expect(mockOrderRepository.update).toHaveBeenCalled();
      expect(mockOrderRepository.findById).toHaveBeenCalled();
      expect(mockCartRepository.clearCart).not.toHaveBeenCalled();
    });
  });

  describe("handlePaymentFailure", () => {
    it("支払い失敗時に注文ステータスを更新する", async () => {
      const session = {
        id: "session_123",
        metadata: { orderId: "1" },
      };

      await paymentService.handlePaymentFailure(session as any);

      expect(mockOrderRepository.update).toHaveBeenCalledWith(1, {
        status: "failed",
      });
    });

    it("注文IDがない場合はエラーをスローする", async () => {
      const session = {
        id: "session_123",
        metadata: {}, // orderId なし
      };

      await expect(
        paymentService.handlePaymentFailure(session as any)
      ).rejects.toThrow("注文IDが見つかりません。");

      expect(mockOrderRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("price and product methods", () => {
    it("should call the repository to get stripe prices", async () => {
      const mockPrices = [
        { id: "price_1", product: "prod_1", unit_amount: 1000 },
      ];
      mockPaymentRepository.getStripePrices.mockResolvedValue(mockPrices);

      const prices = await paymentService.getStripePrices();

      expect(prices).toEqual(mockPrices);
      expect(mockPaymentRepository.getStripePrices).toHaveBeenCalled();
    });

    it("should call the repository to get stripe products", async () => {
      const mockProducts = [{ id: "prod_1", name: "Product 1" }];
      mockPaymentRepository.getStripeProducts.mockResolvedValue(mockProducts);

      const products = await paymentService.getStripeProducts();

      expect(products).toEqual(mockProducts);
      expect(mockPaymentRepository.getStripeProducts).toHaveBeenCalled();
    });
  });
});
