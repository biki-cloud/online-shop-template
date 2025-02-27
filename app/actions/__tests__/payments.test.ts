import "reflect-metadata";
import { container } from "tsyringe";
import {
  checkoutAction,
  handleStripeWebhook,
  getStripePrices,
  getStripeProducts,
} from "../payments";
import { redirect } from "next/navigation";
import { getSessionService, getPaymentService } from "@/lib/di/container";
import type { Stripe } from "stripe";
import type { IPaymentService } from "@/lib/core/services/interfaces/payment.service";
import type { ISessionService } from "@/lib/core/services/interfaces/session.service";

// モックの設定
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

const mockSession = {
  userId: 1,
  role: "user",
} as const;

const mockSessionService: jest.Mocked<ISessionService> = {
  get: jest.fn(),
  set: jest.fn(),
  clear: jest.fn(),
  refresh: jest.fn(),
};

const mockPaymentService: jest.Mocked<IPaymentService> = {
  processCheckout: jest.fn(),
  handlePaymentSuccess: jest.fn(),
  handlePaymentFailure: jest.fn(),
  getStripePrices: jest.fn(),
  getStripeProducts: jest.fn(),
  handleCheckoutSession: jest.fn(),
};

jest.mock("@/lib/di/container", () => ({
  getSessionService: jest.fn(() => mockSessionService),
  getPaymentService: jest.fn(() => mockPaymentService),
}));

describe("Payment Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("checkoutAction", () => {
    it("should redirect to sign-in if no session", async () => {
      mockSessionService.get.mockResolvedValue(null);

      const formData = new FormData();
      await checkoutAction(formData);

      expect(redirect).toHaveBeenCalledWith("/sign-in");
      expect(mockPaymentService.processCheckout).not.toHaveBeenCalled();
    });

    it("should process checkout when session exists", async () => {
      mockSessionService.get.mockResolvedValue(mockSession);
      mockPaymentService.processCheckout.mockResolvedValue();

      const formData = new FormData();
      await checkoutAction(formData);

      expect(mockPaymentService.processCheckout).toHaveBeenCalledWith(
        mockSession.userId
      );
    });

    it("should handle checkout error", async () => {
      mockSessionService.get.mockResolvedValue(mockSession);
      mockPaymentService.processCheckout.mockRejectedValue(
        new Error("Checkout failed")
      );

      const formData = new FormData();
      await expect(checkoutAction(formData)).rejects.toThrow("Checkout failed");
    });
  });

  describe("handleStripeWebhook", () => {
    it("should handle successful payment", async () => {
      const session = createMockStripeSession("paid");
      await handleStripeWebhook(session);
      expect(mockPaymentService.handlePaymentSuccess).toHaveBeenCalledWith(
        session
      );
    });

    it("should handle failed payment", async () => {
      const session = createMockStripeSession("unpaid");
      await handleStripeWebhook(session);
      expect(mockPaymentService.handlePaymentFailure).toHaveBeenCalledWith(
        session
      );
    });

    it("should not handle payment with unknown status", async () => {
      const session = createMockStripeSession("processing");
      await handleStripeWebhook(session);
      expect(mockPaymentService.handlePaymentSuccess).not.toHaveBeenCalled();
      expect(mockPaymentService.handlePaymentFailure).not.toHaveBeenCalled();
    });
  });

  describe("getStripePrices", () => {
    it("should return stripe prices", async () => {
      const mockPrices = [{ id: "price_1", amount: 1000 }];
      mockPaymentService.getStripePrices.mockResolvedValue(mockPrices);
      const result = await getStripePrices();
      expect(result).toEqual(mockPrices);
    });
  });

  describe("getStripeProducts", () => {
    it("should return stripe products", async () => {
      const mockProducts = [{ id: "prod_1", name: "Product 1" }];
      mockPaymentService.getStripeProducts.mockResolvedValue(mockProducts);
      const result = await getStripeProducts();
      expect(result).toEqual(mockProducts);
    });
  });
});

function createMockStripeSession(
  paymentStatus: string
): Stripe.Checkout.Session {
  return {
    id: "cs_test_123",
    object: "checkout.session",
    payment_status: paymentStatus as Stripe.Checkout.Session.PaymentStatus,
    livemode: false,
    metadata: {},
    created: 1234567890,
    expires_at: 1234567890,
    status: "complete",
  } as unknown as Stripe.Checkout.Session;
}
