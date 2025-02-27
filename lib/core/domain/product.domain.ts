export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  currency: string;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type CreateProductInput = Pick<
  Product,
  "name" | "description" | "price" | "stock" | "currency" | "imageUrl"
>;

export type UpdateProductInput = Partial<CreateProductInput>;
