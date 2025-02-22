export interface Order {
  id: number;
  userId: number;
  totalAmount: string;
  currency: string;
  status: string;
  shippingAddress: string | null;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  product?: {
    id: number;
    name: string;
    imageUrl: string | null;
  } | null;
}

export type CreateOrderInput = {
  userId: number;
  totalAmount: string;
  currency: string;
  shippingAddress?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
};

export type UpdateOrderInput = Partial<{
  status: string;
  stripeSessionId: string;
  stripePaymentIntentId: string;
}>;

export type CreateOrderItemInput = {
  orderId: number;
  productId: number;
  quantity: number;
  price: string;
  currency: string;
};
