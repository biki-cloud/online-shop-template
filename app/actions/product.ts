"use server";

import { revalidatePath } from "next/cache";
import { getContainer } from "@/lib/di/container";
import type { IProductService } from "@/lib/core/services/interfaces/product.service";
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
} from "@/lib/core/domain/product";

function getProductService() {
  const container = getContainer();
  return container.resolve<IProductService>("ProductService");
}

export async function getProducts(): Promise<Product[]> {
  const productService = getProductService();
  return await productService.findAll();
}

export async function getProduct(id: number): Promise<Product | null> {
  const productService = getProductService();
  return await productService.findById(id);
}

export async function createProduct(
  data: CreateProductInput
): Promise<Product> {
  const productService = getProductService();
  const product = await productService.create(data);
  revalidatePath("/admin/products");
  return product;
}

export async function updateProduct(
  id: number,
  data: UpdateProductInput
): Promise<Product | null> {
  const productService = getProductService();
  const product = await productService.update(id, data);
  revalidatePath("/admin/products");
  revalidatePath(`/products/${id}`);
  return product;
}

export async function deleteProduct(id: number): Promise<boolean> {
  const productService = getProductService();
  const result = await productService.delete(id);
  revalidatePath("/admin/products");
  return result;
}
