"use client";

import { Product } from "@/lib/infrastructure/db/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { formatPrice } from "@/lib/shared/utils";
import { useState } from "react";
import { addToCart } from "@/app/actions/cart";
import { Loader2, Package, Truck, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!product.name || !product.description || !product.imageUrl) {
    return <div>商品情報が見つかりません</div>;
  }

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      await addToCart(product.id);
      router.push("/cart");
    } catch (error) {
      if (error instanceof Error && error.message === "ログインが必要です") {
        router.push("/sign-in");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container max-w-7xl mx-auto px-4 py-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* 商品画像セクション */}
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden bg-gray-100">
            <AspectRatio ratio={1}>
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </AspectRatio>
          </div>
        </div>

        {/* 商品情報セクション */}
        <div className="space-y-8">
          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold tracking-tight"
            >
              {product.name}
            </motion.h1>
            <div className="flex items-center gap-4">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-primary"
              >
                {formatPrice(Number(product.price), product.currency)}
              </motion.p>
              <Badge variant="secondary" className="text-sm">
                在庫: {product.stock} 個
              </Badge>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">商品説明</h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 leading-relaxed"
            >
              {product.description}
            </motion.p>
          </div>

          <div className="space-y-6">
            <Button
              className="w-full h-12 text-lg"
              size="lg"
              onClick={handleAddToCart}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : null}
              {loading ? "カートに追加中..." : "カートに追加"}
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="h-5 w-5" />
                <span>最短翌日お届け</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Package className="h-5 w-5" />
                <span>安心の梱包</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-5 w-5" />
                <span>品質保証付き</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
