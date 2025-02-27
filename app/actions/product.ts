"use server";

import { revalidatePath } from "next/cache";
import { getContainer } from "@/lib/di/container";
import type { IProductService } from "@/lib/core/services/interfaces/product.service";
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
} from "@/lib/core/domain/product";
import { getCurrentUser } from "@/app/actions/user";
import {
  serverNotificationContainer,
  initializeServerNotificationContainer,
} from "@/lib/di/server-notification-container";
import { NOTIFICATION_TOKENS } from "@/lib/core/constants/notification";
import type { NotificationService } from "@/lib/core/services/server-notification.service";

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
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("権限がありません");
  }

  const productService = getProductService();
  const product = await productService.create(data);
  revalidatePath("/admin/products");

  try {
    // console.log("🔔 新商品の通知処理を開始します:", {
    //   productId: product.id,
    //   productName: product.name,
    // });

    // 新商品の通知を送信
    initializeServerNotificationContainer();
    // console.log("✅ サーバー通知コンテナを初期化しました");

    const notificationService =
      serverNotificationContainer.resolve<NotificationService>(
        NOTIFICATION_TOKENS.SERVICE
      );
    // console.log("✅ 通知サービスを取得しました");

    await notificationService.notifyNewProduct(product);
    // console.log("✅ 通知処理が完了しました");
  } catch (error) {
    console.error("❌ 通知の送信中にエラーが発生しました:", {
      error,
      productId: product.id,
      productName: product.name,
    });
    // 通知の失敗は商品作成には影響を与えない
  }

  revalidatePath("/products");
  return product;
}

export async function updateProduct(
  id: number,
  data: UpdateProductInput
): Promise<Product | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("権限がありません");
  }

  const productService = getProductService();
  const product = await productService.update(id, data);
  revalidatePath("/admin/products");
  revalidatePath(`/products/${id}`);
  return product;
}

export async function deleteProduct(id: number): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("権限がありません");
  }

  const productService = getProductService();
  const result = await productService.delete(id);
  revalidatePath("/admin/products");
  return result;
}
