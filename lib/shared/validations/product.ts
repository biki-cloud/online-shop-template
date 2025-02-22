import * as z from "zod";

export const productFormSchema = z.object({
  name: z.string().min(1, "商品名は必須です"),
  description: z.string().min(1, "商品説明は必須です"),
  price: z.coerce.number().min(0, "価格は0以上である必要があります"),
  stock: z.coerce.number().min(0, "在庫数は0以上である必要があります"),
  currency: z.string().default("JPY"),
  imageUrl: z.string().min(1, "商品画像は必須です"),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
