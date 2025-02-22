const mockStripe = {
  checkout: {
    sessions: {
      create: jest.fn().mockResolvedValue({
        id: "session_123",
        url: "https://checkout.stripe.com/session",
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: "session_123",
        payment_status: "paid",
        payment_intent: "pi_123",
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
    create: jest.fn().mockResolvedValue({
      id: "prod_123",
    }),
    update: jest.fn().mockResolvedValue({
      id: "prod_123",
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
    create: jest.fn().mockResolvedValue({
      id: "price_123",
    }),
    update: jest.fn().mockResolvedValue({
      id: "price_123",
    }),
  },
};

const Stripe = jest.fn(() => mockStripe);

export default Stripe;
