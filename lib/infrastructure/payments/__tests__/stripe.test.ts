import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import {
  createCheckoutSession,
  handlePaymentSuccess,
  handlePaymentFailure,
  getStripePrices,
  getStripeProducts,
  stripe,
} from "../stripe";
import { redirect } from "next/navigation";
import { calculateOrderAmount } from "@/lib/shared/utils";
import {
  createOrder,
  createOrderItems,
  updateOrder,
} from "@/app/actions/order";
import type { Cart, CartItem, Product } from "@/lib/infrastructure/db/schema";

// モックの設定
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/app/actions/order", () => ({
  createOrder: jest.fn(),
  createOrderItems: jest.fn(),
  updateOrder: jest.fn(),
}));

jest.mock("@/lib/shared/utils", () => ({
  calculateOrderAmount: jest.fn(),
}));

// Stripeのモック
jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: "session_123",
          url: "https://checkout.stripe.com/session",
        }),
      },
    },
    products: {
      list: jest.fn().mockResolvedValue({
        data: [
          {
            id: "prod_123",
            name: "Test Product",
            description: "Test Description",
            default_price: "price_123",
          },
        ],
      }),
    },
    prices: {
      list: jest.fn().mockResolvedValue({
        data: [
          {
            id: "price_123",
            product: "prod_123",
            unit_amount: 1000,
            currency: "jpy",
            recurring: {
              interval: "month",
              trial_period_days: 14,
            },
          },
        ],
      }),
    },
  }));
});

describe("Stripe Payment Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "test_key";
    process.env.BASE_URL = "http://localhost:3000";
  });

  describe("createCheckoutSession", () => {
    const mockUserId = 1;
    const mockCart: Cart = {
      id: 1,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "active",
    };
    const mockCartItems: (CartItem & { product: Product | null })[] = [
      {
        id: 1,
        cartId: 1,
        productId: 1,
        quantity: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        product: {
          id: 1,
          name: "Test Product",
          description: "Test Description",
          price: "1000",
          currency: "JPY",
          imageUrl: "/images/test.jpg",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          stock: 10,
        },
      },
    ];

    it("should create a checkout session successfully", async () => {
      // モックの設定
      (calculateOrderAmount as jest.Mock).mockReturnValue({
        total: 2200,
        tax: 200,
      });
      (createOrder as jest.Mock).mockResolvedValue({ id: 1 });
      (createOrderItems as jest.Mock).mockResolvedValue([]);

      await createCheckoutSession({
        userId: mockUserId,
        cart: mockCart,
        cartItems: mockCartItems,
      });

      // Stripeセッションの作成が正しく呼び出されたか確認
      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_method_types: ["card"],
          mode: "payment",
          success_url: expect.stringContaining(
            "session_id={CHECKOUT_SESSION_ID}"
          ),
          cancel_url: expect.stringContaining("/cart"),
          metadata: {
            orderId: "1",
          },
        })
      );

      // 注文の作成と更新が正しく行われたか確認
      expect(createOrder).toHaveBeenCalled();
      expect(createOrderItems).toHaveBeenCalled();
      expect(updateOrder).toHaveBeenCalledWith(1, {
        status: "pending",
        stripeSessionId: "session_123",
      });
      expect(redirect).toHaveBeenCalledWith(
        "https://checkout.stripe.com/session"
      );
    });

    it("should redirect to cart if no items", async () => {
      await createCheckoutSession({
        userId: mockUserId,
        cart: mockCart,
        cartItems: [],
      });

      expect(redirect).toHaveBeenCalledWith("/cart");
    });
  });

  describe("handlePaymentSuccess", () => {
    it("should update order status to paid", async () => {
      const mockSession = {
        metadata: { orderId: "1" },
        payment_intent: "pi_123",
      } as any;

      await handlePaymentSuccess(mockSession);

      expect(updateOrder).toHaveBeenCalledWith(1, {
        status: "paid",
        stripePaymentIntentId: "pi_123",
      });
    });

    it("should throw error if orderId is missing", async () => {
      const mockSession = {
        metadata: {},
      } as any;

      await expect(handlePaymentSuccess(mockSession)).rejects.toThrow(
        "注文IDが見つかりません。"
      );
    });
  });

  describe("handlePaymentFailure", () => {
    it("should update order status to failed", async () => {
      const mockSession = {
        metadata: { orderId: "1" },
      } as any;

      await handlePaymentFailure(mockSession);

      expect(updateOrder).toHaveBeenCalledWith(1, {
        status: "failed",
      });
    });

    it("should throw error if orderId is missing", async () => {
      const mockSession = {
        metadata: {},
      } as any;

      await expect(handlePaymentFailure(mockSession)).rejects.toThrow(
        "注文IDが見つかりません。"
      );
    });
  });

  describe("getStripePrices", () => {
    it("should return formatted prices", async () => {
      const prices = await getStripePrices();

      expect(prices).toEqual([
        {
          id: "price_123",
          productId: "prod_123",
          unitAmount: 1000,
          currency: "jpy",
          interval: "month",
          trialPeriodDays: 14,
        },
      ]);
    });
  });

  describe("getStripeProducts", () => {
    it("should return formatted products", async () => {
      const products = await getStripeProducts();

      expect(products).toEqual([
        {
          id: "prod_123",
          name: "Test Product",
          description: "Test Description",
          defaultPriceId: "price_123",
        },
      ]);
    });
  });
});
