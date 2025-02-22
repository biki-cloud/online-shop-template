"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  productFormSchema,
  type ProductFormValues,
} from "@/lib/shared/validations/product";
import { useImageUpload } from "@/lib/shared/hooks/use-image-upload";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Package, Upload, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/shared/utils";

interface ProductFormProps {
  initialData?: Partial<ProductFormValues>;
  onSubmit: (
    data: ProductFormValues
  ) => Promise<{ success: boolean; error?: string }>;
}

const formAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

const itemAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function ProductForm({ initialData, onSubmit }: ProductFormProps) {
  const router = useRouter();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      currency: "JPY",
      imageUrl: "",
    },
  });

  const { imagePreview, handleImageUpload } = useImageUpload(
    initialData?.imageUrl ?? null,
    form.setValue
  );

  const handleSubmit = async (data: ProductFormValues) => {
    try {
      const result = await onSubmit(data);
      if (result.success) {
        toast.success("商品を保存しました");
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(result.error || "商品の保存に失敗しました");
      }
    } catch (error) {
      toast.error("商品の保存に失敗しました");
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <motion.div
          className="grid gap-8 md:grid-cols-2"
          variants={formAnimation}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="space-y-6" variants={itemAnimation}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">商品名</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="商品名を入力"
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">商品説明</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="商品の説明を入力"
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">価格</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">在庫数</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </motion.div>

          <motion.div className="space-y-6" variants={itemAnimation}>
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">商品画像</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="relative">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="cursor-pointer opacity-0 absolute inset-0 z-10"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-11"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          画像をアップロード
                        </Button>
                      </div>
                      <div
                        className={cn(
                          "relative aspect-square w-full overflow-hidden rounded-lg border bg-gray-50/50",
                          "transition-all duration-200 hover:bg-gray-50/80"
                        )}
                      >
                        {imagePreview ? (
                          <Image
                            src={imagePreview}
                            alt="商品画像プレビュー"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <Input type="hidden" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-8 flex gap-4"
          variants={itemAnimation}
          initial="hidden"
          animate="visible"
        >
          <Button
            type="submit"
            size="lg"
            className="px-8"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "保存中..." : "保存"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Button>
        </motion.div>
      </form>
    </Form>
  );
}
