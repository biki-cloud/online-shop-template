import "reflect-metadata";
import { PaymentRepository } from "../payment.repository";
import { mockDb } from "@/lib/shared/test-utils/mock-repositories";
import { orders, orderItems, products } from "@/lib/infrastructure/db/schema";
import { eq } from "drizzle-orm";
import type { Database } from "@/lib/infrastructure/db/drizzle";
import { stripe } from "@/lib/infrastructure/payments/stripe";
import { UrlService } from "@/lib/core/services/url.service";

// Stripeのモック
jest.mock("@/lib/infrastructure/payments/stripe", () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn(),
        retrieve: jest.fn(),
      },
    },
    prices: {
      list: jest.fn(),
    },
    products: {
      list: jest.fn(),
    },
  },
}));

// UrlServiceのモック
jest.mock("@/lib/core/services/url.service", () => ({
  UrlService: jest.fn().mockImplementation(() => ({
    getBaseUrl: jest.fn().mockReturnValue("http://localhost:3000"),
  })),
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

describe("PaymentRepository", () => {
  let repository: PaymentRepository;
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
    repository = new PaymentRepository(mockDb as unknown as Database);
  });

  describe("createCheckoutSession", () => {
    it("should create checkout session successfully", async () => {
      const mockOrder = {
        id: 1,
        userId: 1,
        status: "pending",
        totalAmount: "1000",
        currency: "jpy",
        stripeSessionId: null,
        stripePaymentIntentId: null,
        shippingAddress: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockOrderItems = [
        {
          id: 1,
          orderId: 1,
          productId: 1,
          quantity: 2,
          price: "1000",
          currency: "jpy",
          createdAt: new Date(),
          updatedAt: new Date(),
          product: {
            id: 1,
            name: "Test Product",
            description: "Test Description",
            imageUrl: "test.jpg",
          },
        },
      ];

      const mockSession = {
        id: "session_123",
        url: "https://example.com",
      };

      const db = mockDb as any;
      db.select.mockReturnThis();
      db.from.mockReturnThis();
      db.where.mockReturnThis();
      db.limit.mockReturnThis();
      db.leftJoin.mockReturnThis();
      db.execute.mockResolvedValueOnce([mockOrder]);
      db.execute.mockResolvedValueOnce(mockOrderItems);

      (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue(
        mockSession
      );

      const result = await repository.createCheckoutSession({
        userId: 1,
        orderId: 1,
      });

      expect(result).toEqual(mockSession);
      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalledWith(orders);
      expect(db.where).toHaveBeenCalledWith(eq(orders.id, 1));
      expect(db.limit).toHaveBeenCalledWith(1);
      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_method_types: ["card"],
          line_items: expect.arrayContaining([
            expect.objectContaining({
              price_data: expect.objectContaining({
                currency: "jpy",
                product_data: expect.objectContaining({
                  name: "Test Product",
                  description: "Test Description",
                }),
                unit_amount: 1100,
              }),
              quantity: 2,
            }),
          ]),
          mode: "payment",
          metadata: {
            orderId: "1",
          },
        })
      );
    });

    it("should handle external URLs in product images", async () => {
      const mockOrder = {
        id: 1,
        userId: 1,
        status: "pending",
        totalAmount: "1000",
        currency: "jpy",
        stripeSessionId: null,
        stripePaymentIntentId: null,
        shippingAddress: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockOrderItems = [
        {
          id: 1,
          orderId: 1,
          productId: 1,
          quantity: 2,
          price: "1000",
          currency: "jpy",
          createdAt: new Date(),
          updatedAt: new Date(),
          product: {
            id: 1,
            name: "Test Product",
            description: "Test Description",
            imageUrl: "https://external.com/image.jpg",
          },
        },
      ];

      const mockSession = {
        id: "session_123",
        url: "https://example.com",
      };

      const db = mockDb as any;
      db.select.mockReturnThis();
      db.from.mockReturnThis();
      db.where.mockReturnThis();
      db.limit.mockReturnThis();
      db.leftJoin.mockReturnThis();
      db.execute.mockResolvedValueOnce([mockOrder]);
      db.execute.mockResolvedValueOnce(mockOrderItems);

      (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue(
        mockSession
      );

      const result = await repository.createCheckoutSession({
        userId: 1,
        orderId: 1,
      });

      expect(result).toEqual(mockSession);
      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: expect.arrayContaining([
            expect.objectContaining({
              price_data: expect.objectContaining({
                product_data: expect.objectContaining({
                  images: ["https://external.com/image.jpg"],
                }),
              }),
            }),
          ]),
        })
      );
    });

    it("should throw error when order not found", async () => {
      const db = mockDb as any;
      db.select.mockReturnThis();
      db.from.mockReturnThis();
      db.where.mockReturnThis();
      db.limit.mockReturnThis();
      db.execute.mockResolvedValueOnce([]);

      await expect(
        repository.createCheckoutSession({
          userId: 1,
          orderId: 1,
        })
      ).rejects.toThrow("注文が見つかりません。");
    });

    it("should throw error when order items not found", async () => {
      const mockOrder = {
        id: 1,
        userId: 1,
        status: "pending",
        totalAmount: "1000",
        currency: "jpy",
        stripeSessionId: null,
        stripePaymentIntentId: null,
        shippingAddress: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const db = mockDb as any;
      db.select.mockReturnThis();
      db.from.mockReturnThis();
      db.where.mockReturnThis();
      db.limit.mockReturnThis();
      db.execute.mockResolvedValueOnce([mockOrder]);
      db.execute.mockResolvedValueOnce([]);

      await expect(
        repository.createCheckoutSession({
          userId: 1,
          orderId: 1,
        })
      ).rejects.toThrow("注文アイテムが見つかりません。");
    });

    it("should throw error when product information is missing", async () => {
      const mockOrder = {
        id: 1,
        userId: 1,
        status: "pending",
        totalAmount: "1000",
        currency: "jpy",
        stripeSessionId: null,
        stripePaymentIntentId: null,
        shippingAddress: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockOrderItems = [
        {
          id: 1,
          orderId: 1,
          productId: 1,
          quantity: 2,
          price: "1000",
          currency: "jpy",
          createdAt: new Date(),
          updatedAt: new Date(),
          product: null,
        },
      ];

      const db = mockDb as any;
      db.select.mockReturnThis();
      db.from.mockReturnThis();
      db.where.mockReturnThis();
      db.limit.mockReturnThis();
      db.leftJoin.mockReturnThis();
      db.execute.mockResolvedValueOnce([mockOrder]);
      db.execute.mockResolvedValueOnce(mockOrderItems);

      await expect(
        repository.createCheckoutSession({
          userId: 1,
          orderId: 1,
        })
      ).rejects.toThrow("商品情報が見つかりません。");
    });

    it("should throw error when Stripe session creation fails", async () => {
      const mockOrder = {
        id: 1,
        userId: 1,
        status: "pending",
        totalAmount: "1000",
        currency: "jpy",
        stripeSessionId: null,
        stripePaymentIntentId: null,
        shippingAddress: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockOrderItems = [
        {
          id: 1,
          orderId: 1,
          productId: 1,
          quantity: 2,
          price: "1000",
          currency: "jpy",
          createdAt: new Date(),
          updatedAt: new Date(),
          product: {
            id: 1,
            name: "Test Product",
            description: "Test Description",
            imageUrl: "test.jpg",
          },
        },
      ];

      const db = mockDb as any;
      db.select.mockReturnThis();
      db.from.mockReturnThis();
      db.where.mockReturnThis();
      db.limit.mockReturnThis();
      db.leftJoin.mockReturnThis();
      db.execute.mockResolvedValueOnce([mockOrder]);
      db.execute.mockResolvedValueOnce(mockOrderItems);

      (stripe.checkout.sessions.create as jest.Mock).mockRejectedValue(
        new Error("Stripe error")
      );

      await expect(
        repository.createCheckoutSession({
          userId: 1,
          orderId: 1,
        })
      ).rejects.toThrow("決済セッションの作成に失敗しました。");
    });
  });

  describe("handlePaymentSuccess", () => {
    it("should handle successful payment", async () => {
      const db = mockDb as any;
      db.update.mockReturnThis();
      db.set.mockReturnThis();
      db.where.mockReturnThis();
      db.returning.mockReturnValue([{ ...mockOrder, status: "paid" }]);

      const mockSession = {
        metadata: { orderId: "1" },
        payment_intent: "pi_123",
      };
      (stripe.checkout.sessions.retrieve as jest.Mock).mockResolvedValue(
        mockSession
      );

      await repository.handlePaymentSuccess("session_123");

      expect(db.update).toHaveBeenCalledWith(orders);
      expect(db.set).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "paid",
          stripePaymentIntentId: "pi_123",
        })
      );
    });

    it("should throw error when orderId not found in metadata", async () => {
      const mockSession = {
        metadata: {},
      };
      (stripe.checkout.sessions.retrieve as jest.Mock).mockResolvedValue(
        mockSession
      );

      await expect(
        repository.handlePaymentSuccess("session_123")
      ).rejects.toThrow("注文IDが見つかりません。");
    });

    it("should throw error when Stripe session retrieval fails", async () => {
      (stripe.checkout.sessions.retrieve as jest.Mock).mockRejectedValue(
        new Error("Stripe error")
      );

      await expect(
        repository.handlePaymentSuccess("session_123")
      ).rejects.toThrow();
    });
  });

  describe("handlePaymentFailure", () => {
    it("should handle payment failure", async () => {
      const db = mockDb as any;
      db.update.mockReturnThis();
      db.set.mockReturnThis();
      db.where.mockReturnThis();
      db.returning.mockReturnValue([{ ...mockOrder, status: "failed" }]);

      const mockSession = {
        metadata: { orderId: "1" },
      };
      (stripe.checkout.sessions.retrieve as jest.Mock).mockResolvedValue(
        mockSession
      );

      await repository.handlePaymentFailure("session_123");

      expect(db.update).toHaveBeenCalledWith(orders);
      expect(db.set).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "failed",
        })
      );
    });

    it("should throw error when orderId not found in metadata", async () => {
      const mockSession = {
        metadata: {},
      };
      (stripe.checkout.sessions.retrieve as jest.Mock).mockResolvedValue(
        mockSession
      );

      await expect(
        repository.handlePaymentFailure("session_123")
      ).rejects.toThrow("注文IDが見つかりません。");
    });

    it("should throw error when Stripe session retrieval fails", async () => {
      (stripe.checkout.sessions.retrieve as jest.Mock).mockRejectedValue(
        new Error("Stripe error")
      );

      await expect(
        repository.handlePaymentFailure("session_123")
      ).rejects.toThrow();
    });
  });

  describe("getStripePrices", () => {
    it("should return stripe prices", async () => {
      const mockPrices = {
        data: [
          {
            id: "price_1",
            product: "prod_1",
            unit_amount: 1000,
            currency: "jpy",
            recurring: {
              interval: "month",
              trial_period_days: 14,
            },
          },
        ],
      };
      (stripe.prices.list as jest.Mock).mockResolvedValue(mockPrices);

      const result = await repository.getStripePrices();

      expect(result).toEqual([
        {
          id: "price_1",
          productId: "prod_1",
          unitAmount: 1000,
          currency: "jpy",
          interval: "month",
          trialPeriodDays: 14,
        },
      ]);
    });

    it("should handle Stripe prices list error", async () => {
      (stripe.prices.list as jest.Mock).mockRejectedValue(
        new Error("Stripe error")
      );

      await expect(repository.getStripePrices()).rejects.toThrow();
    });
  });

  describe("getStripeProducts", () => {
    it("should return stripe products", async () => {
      const mockProducts = {
        data: [
          {
            id: "prod_1",
            name: "Test Product",
            description: "Test Description",
            default_price: "price_1",
          },
        ],
      };
      (stripe.products.list as jest.Mock).mockResolvedValue(mockProducts);

      const result = await repository.getStripeProducts();

      expect(result).toEqual([
        {
          id: "prod_1",
          name: "Test Product",
          description: "Test Description",
          defaultPriceId: "price_1",
        },
      ]);
    });

    it("should handle Stripe products list error", async () => {
      (stripe.products.list as jest.Mock).mockRejectedValue(
        new Error("Stripe error")
      );

      await expect(repository.getStripeProducts()).rejects.toThrow();
    });

    it("should handle products with expanded default_price", async () => {
      const mockProducts = {
        data: [
          {
            id: "prod_1",
            name: "Test Product",
            description: "Test Description",
            default_price: {
              id: "price_1",
              unit_amount: 1000,
            },
          },
        ],
      };
      (stripe.products.list as jest.Mock).mockResolvedValue(mockProducts);

      const result = await repository.getStripeProducts();

      expect(result).toEqual([
        {
          id: "prod_1",
          name: "Test Product",
          description: "Test Description",
          defaultPriceId: "price_1",
        },
      ]);
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
