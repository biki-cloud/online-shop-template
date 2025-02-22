export interface Cart {
  id: number;
  userId: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  product?: {
    id: number;
    name: string;
    description: string | null;
    price: string;
    currency: string;
    imageUrl: string | null;
    stock: number;
  } | null;
}

export type CreateCartInput = {
  userId: number;
  status?: string;
};

export type UpdateCartInput = Partial<{
  status: string;
}>;

export type CreateCartItemInput = {
  cartId: number;
  productId: number;
  quantity: number;
};

export type UpdateCartItemInput = Partial<{
  quantity: number;
}>;
