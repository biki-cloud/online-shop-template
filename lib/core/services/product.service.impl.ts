import "reflect-metadata";
import { inject, injectable } from "tsyringe";
import type { IProductRepository } from "../repositories/interfaces/product.repository.interface";
import type { IProductService } from "./interfaces/product.service.interface";
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
} from "@/lib/core/domain/product";

@injectable()
export class ProductService implements IProductService {
  constructor(
    @inject("ProductRepository")
    private readonly productRepository: IProductRepository
  ) {}

  async findById(id: number): Promise<Product | null> {
    return await this.productRepository.findById(id);
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.findAll();
  }

  async create(data: CreateProductInput): Promise<Product> {
    return await this.productRepository.create(data);
  }

  async update(id: number, data: UpdateProductInput): Promise<Product | null> {
    const product = await this.findById(id);
    if (!product) {
      throw new Error("商品が見つかりません");
    }
    return await this.productRepository.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    const product = await this.findById(id);
    if (!product) {
      throw new Error("商品が見つかりません");
    }
    return await this.productRepository.delete(id);
  }
}
