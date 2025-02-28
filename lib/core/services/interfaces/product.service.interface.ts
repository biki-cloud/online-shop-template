import {
  Product,
  CreateProductInput,
  UpdateProductInput,
} from "@/lib/core/domain/product.domain";

export interface IProductService {
  findById(id: number): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  create(data: CreateProductInput): Promise<Product>;
  update(id: number, data: UpdateProductInput): Promise<Product | null>;
  delete(id: number): Promise<boolean>;
}
