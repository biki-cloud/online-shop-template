"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/infrastructure/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateProduct } from "@/app/actions/product";
import { toast } from "sonner";
import Image from "next/image";
import { uploadFile, deleteFile } from "@/lib/infrastructure/storage/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ArrowLeft, Upload, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface AdminProductFormProps {
  product: Product;
}

export function AdminProductForm({ product }: AdminProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(
    product.imageUrl || null
  );
  const [currentFileName, setCurrentFileName] = useState<string | null>(() => {
    if (product.imageUrl) {
      try {
        return new URL(product.imageUrl).pathname.split("/").pop() || null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (currentFileName) {
        await deleteFile(currentFileName);
      }

      const { url, fileName } = await uploadFile(file);
      setImagePreview(url);
      setCurrentFileName(fileName);
      toast.success("画像をアップロードしました");
    } catch (error) {
      toast.error("画像のアップロードに失敗しました");
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const updatedProduct = await updateProduct(product.id, {
          name: formData.get("name") as string,
          description: formData.get("description") as string,
          price: formData.get("price") as string,
          stock: Number(formData.get("stock")),
          imageUrl: imagePreview,
        });

        if (updatedProduct) {
          toast.success("商品を更新しました");
          router.push(`/admin/products/${product.id}`);
          router.refresh();
        } else {
          toast.error("商品の更新に失敗しました");
        }
      } catch (error) {
        toast.error("エラーが発生しました");
        console.error(error);
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden bg-white shadow-lg">
        <CardHeader className="border-b bg-gray-50/50">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">商品の編集</CardTitle>
              <p className="text-sm text-muted-foreground">
                商品情報を編集できます
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              戻る
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base">
                    商品名
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={product.name}
                    required
                    maxLength={255}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base">
                    商品説明
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={product.description || ""}
                    rows={5}
                    className="resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-base">
                      価格
                    </Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min={0}
                      step={1}
                      defaultValue={Number(product.price)}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock" className="text-base">
                      在庫数
                    </Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      min={0}
                      step={1}
                      defaultValue={product.stock}
                      required
                      className="h-11"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-base">商品画像</Label>
                <div className="relative aspect-square overflow-hidden rounded-lg border bg-gray-50">
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
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={async () => {
                        if (currentFileName) {
                          try {
                            await deleteFile(currentFileName);
                            setImagePreview(null);
                            setCurrentFileName(null);
                            toast.success("画像を削除しました");
                          } catch (error) {
                            toast.error("画像の削除に失敗しました");
                            console.error(error);
                          }
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="mt-2">
                  <Label
                    htmlFor="image"
                    className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    画像をアップロード
                    <Input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                type="submit"
                disabled={isPending}
                className="min-w-[120px]"
              >
                {isPending ? "更新中..." : "更新する"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
