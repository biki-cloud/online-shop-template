import type {
  Cart,
  CartItem,
  Order,
  OrderItem,
  Product,
  User,
} from "@/lib/infrastructure/db/schema";
import type { CreateCartInput } from "@/lib/core/domain/cart";
import type { CreateOrderInput } from "@/lib/core/domain/order";
import type { CreateProductInput } from "@/lib/core/domain/product";
import type { NewUser } from "@/lib/infrastructure/db/schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { Database } from "@/lib/infrastructure/db/drizzle";
import type {
  PgSelectBuilder,
  PgUpdateBuilder,
  PgInsertBuilder,
  PgDeleteBase,
} from "drizzle-orm/pg-core";

interface CartItemWithProduct extends CartItem {
  product?: {
    id: number;
    price: string;
    currency: string;
  } | null;
}

type MockBuilder = {
  select: jest.Mock;
  from: jest.Mock;
  where: jest.Mock;
  limit: jest.Mock;
  leftJoin: jest.Mock;
  insert: jest.Mock;
  values: jest.Mock;
  update: jest.Mock;
  set: jest.Mock;
  delete: jest.Mock;
  returning: jest.Mock;
  execute: jest.Mock;
  orderBy: jest.Mock;
};

type MockMethod = keyof MockBuilder;

const createMockBuilder = (): MockBuilder => {
  const builder: Partial<MockBuilder> = {};
  const methods: MockMethod[] = [
    "select",
    "from",
    "where",
    "limit",
    "leftJoin",
    "insert",
    "values",
    "update",
    "set",
    "delete",
    "returning",
    "execute",
    "orderBy",
  ];

  methods.forEach((method) => {
    builder[method] = jest.fn().mockReturnThis();
  });

  return builder as MockBuilder;
};

type MockDatabase = {
  select: jest.Mock;
  from: jest.Mock;
  where: jest.Mock;
  limit: jest.Mock;
  _: {};
  query: jest.Mock;
  $with: jest.Mock;
  $count: jest.Mock;
  $client: {};
  transaction: jest.Mock;
  $transaction: jest.Mock;
  $queryBuilder: jest.Mock;
  $drizzle: {};
};

export const mockDb = {
  ...createMockBuilder(),
  _: {},
  query: jest.fn(),
  $with: jest.fn(),
  $count: jest.fn(),
  $client: {},
  transaction: jest.fn(),
  $transaction: jest.fn(),
  $queryBuilder: jest.fn(),
  $drizzle: {},
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
} as unknown as MockDatabase;

export class MockCartRepository {
  async create(input: CreateCartInput): Promise<Cart> {
    const now = new Date();
    return {
      id: 1,
      createdAt: now,
      updatedAt: now,
      ...input,
    } as Cart;
  }

  async findActiveCartByUserId(userId: number): Promise<Cart | null> {
    const now = new Date();
    return {
      id: 1,
      createdAt: now,
      updatedAt: now,
      userId,
      status: "active",
    } as Cart;
  }

  async addToCart(
    cartId: number,
    productId: number,
    quantity: number
  ): Promise<CartItem> {
    const now = new Date();
    return {
      id: 1,
      createdAt: now,
      updatedAt: now,
      cartId,
      productId,
      quantity,
    } as CartItem;
  }

  async updateCartItemQuantity(
    cartItemId: number,
    quantity: number
  ): Promise<CartItem> {
    const now = new Date();
    return {
      id: cartItemId,
      createdAt: now,
      updatedAt: now,
      cartId: 1,
      productId: 1,
      quantity,
    } as CartItem;
  }

  async removeFromCart(cartItemId: number): Promise<boolean> {
    return true;
  }

  async getCartItems(cartId: number): Promise<CartItemWithProduct[]> {
    const now = new Date();
    return [
      {
        id: 1,
        createdAt: now,
        updatedAt: now,
        cartId,
        productId: 1,
        quantity: 1,
        product: {
          id: 1,
          price: "1000",
          currency: "jpy",
        },
      },
    ] as CartItemWithProduct[];
  }

  async clearCart(userId: number): Promise<void> {
    return;
  }
}

export class MockOrderRepository {
  async findAll(): Promise<Order[]> {
    const now = new Date();
    return [
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
  }

  async create(input: CreateOrderInput): Promise<Order> {
    const now = new Date();
    return {
      id: 1,
      createdAt: now,
      updatedAt: now,
      ...input,
    } as Order;
  }

  async findByUserId(userId: number): Promise<Order[]> {
    const now = new Date();
    return [
      {
        id: 1,
        createdAt: now,
        updatedAt: now,
        userId,
        status: "pending",
        totalAmount: "1000",
        currency: "jpy",
        stripeSessionId: null,
        stripePaymentIntentId: null,
        shippingAddress: null,
      },
    ];
  }

  async findById(orderId: number): Promise<Order | null> {
    const now = new Date();
    return {
      id: orderId,
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
  }

  async findByStripeSessionId(sessionId: string): Promise<Order | null> {
    const now = new Date();
    return {
      id: 1,
      createdAt: now,
      updatedAt: now,
      userId: 1,
      status: "pending",
      totalAmount: "1000",
      currency: "jpy",
      stripeSessionId: sessionId,
      stripePaymentIntentId: null,
      shippingAddress: null,
    };
  }

  async createOrderItems(
    orderId: number,
    items: Array<{
      productId: number;
      quantity: number;
      price: string;
      currency: string;
    }>
  ): Promise<OrderItem[]> {
    const now = new Date();
    return items.map((item, index) => ({
      id: index + 1,
      createdAt: now,
      updatedAt: now,
      orderId,
      ...item,
    })) as OrderItem[];
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    const now = new Date();
    return [
      {
        id: 1,
        createdAt: now,
        updatedAt: now,
        orderId,
        productId: 1,
        quantity: 1,
        price: "1000",
        currency: "jpy",
      },
    ];
  }

  async update(id: number, data: Partial<Order>): Promise<Order> {
    const now = new Date();
    return {
      id,
      createdAt: now,
      updatedAt: now,
      userId: 1,
      status: data.status || "pending",
      totalAmount: "1000",
      currency: "jpy",
      stripeSessionId: data.stripeSessionId || null,
      stripePaymentIntentId: data.stripePaymentIntentId || null,
      shippingAddress: null,
      ...data,
    };
  }
}

export class MockPaymentRepository {
  async createCheckoutSession(data: {
    userId: number;
    orderId: number;
  }): Promise<{ id: string; url: string }> {
    return { id: "test_session_id", url: "https://example.com/checkout" };
  }

  async handlePaymentSuccess(sessionId: string): Promise<void> {}

  async handlePaymentFailure(sessionId: string): Promise<void> {}

  async getStripePrices(): Promise<any[]> {
    return [];
  }

  async getStripeProducts(): Promise<any[]> {
    return [];
  }

  async findById(id: number): Promise<Order | null> {
    return null;
  }

  async findAll(): Promise<Order[]> {
    return [];
  }

  async create(data: any): Promise<Order> {
    return {
      id: 1,
      userId: 1,
      status: "pending",
      totalAmount: "0",
      currency: "USD",
      stripeSessionId: null,
      stripePaymentIntentId: null,
      shippingAddress: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async update(id: number, data: Partial<Order>): Promise<Order | null> {
    return null;
  }

  async delete(id: number): Promise<boolean> {
    return true;
  }
}

export class MockProductRepository {
  async findAll(): Promise<Product[]> {
    return [];
  }

  async findById(id: number): Promise<Product | null> {
    return null;
  }

  async create(data: CreateProductInput): Promise<Product> {
    const now = new Date();
    return {
      id: 1,
      createdAt: now,
      updatedAt: now,
      ...data,
    } as Product;
  }

  async update(id: number, data: Partial<Product>): Promise<Product | null> {
    const now = new Date();
    return {
      id,
      createdAt: now,
      updatedAt: now,
      ...data,
    } as Product;
  }

  async delete(id: number): Promise<void> {
    return;
  }
}

export class MockUserRepository {
  async findById(id: number): Promise<User | null> {
    return null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return null;
  }

  async create(data: NewUser): Promise<User> {
    const now = new Date();
    return {
      id: 1,
      createdAt: now,
      updatedAt: now,
      ...data,
    } as User;
  }

  async update(id: number, data: Partial<User>): Promise<User | null> {
    const now = new Date();
    return {
      id,
      email: "test@example.com",
      name: "Test User",
      passwordHash: "hashedPassword",
      role: "user",
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      ...data,
    };
  }

  async delete(id: number): Promise<boolean> {
    return true;
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    if (email === "test@example.com" && password === "password123") {
      const now = new Date("2025-02-15T21:41:37.040Z");
      return {
        id: 1,
        email,
        name: "Test User",
        passwordHash: "hashedPassword",
        role: "user",
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };
    }
    return null;
  }
}
