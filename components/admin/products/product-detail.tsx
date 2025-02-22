"use client";

import { Product } from "@/lib/infrastructure/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Package, Edit, ArrowLeft } from "lucide-react";
import { formatPrice } from "@/lib/shared/utils";
import { motion } from "framer-motion";

interface AdminProductDetailProps {
  product: Product;
}

export function AdminProductDetail({ product }: AdminProductDetailProps) {
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
              <CardTitle className="text-2xl font-bold">商品詳細</CardTitle>
              <p className="text-sm text-muted-foreground">
                商品の詳細情報を確認できます
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/products">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  一覧に戻る
                </Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link href={`/admin/products/${product.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  編集
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <div className="relative aspect-square overflow-hidden rounded-lg border bg-gray-50">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
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
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-500">商品名</h3>
                <p className="mt-1 text-2xl font-bold">{product.name}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-500">価格</h3>
                <p className="mt-1 text-2xl font-bold text-primary">
                  {formatPrice(Number(product.price), product.currency)}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-500">在庫状況</h3>
                <div className="mt-1 flex items-center space-x-2">
                  <p className="text-2xl font-bold">{product.stock}</p>
                  <Badge
                    variant={product.stock > 0 ? "secondary" : "destructive"}
                  >
                    {product.stock > 0 ? "在庫あり" : "在庫切れ"}
                  </Badge>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-500">商品説明</h3>
                <p className="mt-1 whitespace-pre-wrap text-gray-700">
                  {product.description || "説明はありません"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
