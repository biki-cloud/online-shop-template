export const PAYMENT_CONSTANTS = {
  TAX_RATE: 1.1,
  DEFAULT_CURRENCY: "jpy",
  SUPPORTED_PAYMENT_METHODS: ["card"],
} as const;

export type PaymentStatus = "pending" | "paid" | "failed";
