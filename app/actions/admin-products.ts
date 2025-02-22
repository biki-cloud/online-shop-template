"use server";

import { revalidatePath } from "next/cache";
import { createProduct } from "@/app/actions/product";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().min(0),
  currency: z.string(),
  imageUrl: z.string(),
});

export async function createProductAction(data: z.infer<typeof productSchema>) {
  const validated = productSchema.parse(data);

  try {
    await createProduct({
      ...validated,
      price: validated.price.toString(),
    });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("商品の作成に失敗しました:", error);
    return { success: false, error: "商品の作成に失敗しました" };
  }
}
