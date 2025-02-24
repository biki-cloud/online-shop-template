import {
  checkoutAction,
  handleStripeWebhook,
  getStripePrices,
  getStripeProducts,
} from "../payments";
import { redirect } from "next/navigation";
import { getContainer, getSessionService } from "@/lib/di/container";
import type Stripe from "stripe";

// モックの設定
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

const mockSessionService = {
  get: jest.fn(),
  set: jest.fn(),
  clear: jest.fn(),
  refresh: jest.fn(),
};

const mockPaymentService = {
  processCheckout: jest.fn(),
  handlePaymentSuccess: jest.fn(),
  handlePaymentFailure: jest.fn(),
  getStripePrices: jest.fn(),
  getStripeProducts: jest.fn(),
};

jest.mock("@/lib/di/container", () => ({
  getContainer: jest.fn(() => ({
    resolve: jest.fn(() => mockPaymentService),
  })),
  getSessionService: jest.fn(() => mockSessionService),
}));

const createMockStripeSession = (
  paymentStatus: string
): Stripe.Checkout.Session =>
  ({
    id: "cs_test_123",
    object: "checkout.session",
    payment_status: paymentStatus as Stripe.Checkout.Session.PaymentStatus,
    // 必要最小限のプロパティを追加
    livemode: false,
    metadata: {},
    created: 1234567890,
    expires_at: 1234567890,
    status: "complete",
  } as unknown as Stripe.Checkout.Session);

describe("Payment Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("checkoutAction", () => {
    it("should process checkout for authenticated user", async () => {
      mockSessionService.get.mockResolvedValue({ userId: 1 });
      const formData = new FormData();

      await checkoutAction(formData);

      expect(mockPaymentService.processCheckout).toHaveBeenCalledWith(1);
      expect(redirect).not.toHaveBeenCalled();
    });

    it("should redirect to sign-in if user is not authenticated", async () => {
      mockSessionService.get.mockResolvedValue(null);
      const formData = new FormData();

      await expect(checkoutAction(formData)).rejects.toThrow();
      expect(redirect).toHaveBeenCalledWith("/sign-in");
      expect(mockPaymentService.processCheckout).not.toHaveBeenCalled();
    });
  });

  describe("handleStripeWebhook", () => {
    it("should handle successful payment", async () => {
      const mockSession = createMockStripeSession("paid");

      await handleStripeWebhook(mockSession);

      expect(mockPaymentService.handlePaymentSuccess).toHaveBeenCalledWith(
        mockSession
      );
      expect(mockPaymentService.handlePaymentFailure).not.toHaveBeenCalled();
    });

    it("should handle failed payment", async () => {
      const mockSession = createMockStripeSession("unpaid");

      await handleStripeWebhook(mockSession);

      expect(mockPaymentService.handlePaymentFailure).toHaveBeenCalledWith(
        mockSession
      );
      expect(mockPaymentService.handlePaymentSuccess).not.toHaveBeenCalled();
    });

    it("should not handle payment with unknown status", async () => {
      const mockSession = createMockStripeSession("processing");

      await handleStripeWebhook(mockSession);

      expect(mockPaymentService.handlePaymentSuccess).not.toHaveBeenCalled();
      expect(mockPaymentService.handlePaymentFailure).not.toHaveBeenCalled();
    });
  });

  describe("getStripePrices", () => {
    it("should return stripe prices", async () => {
      const mockPrices = [{ id: "price_1", amount: 1000 }];
      mockPaymentService.getStripePrices.mockResolvedValue(mockPrices);

      const result = await getStripePrices();

      expect(mockPaymentService.getStripePrices).toHaveBeenCalled();
      expect(result).toEqual(mockPrices);
    });
  });

  describe("getStripeProducts", () => {
    it("should return stripe products", async () => {
      const mockProducts = [{ id: "prod_1", name: "Product 1" }];
      mockPaymentService.getStripeProducts.mockResolvedValue(mockProducts);

      const result = await getStripeProducts();

      expect(mockPaymentService.getStripeProducts).toHaveBeenCalled();
      expect(result).toEqual(mockProducts);
    });
  });
});
