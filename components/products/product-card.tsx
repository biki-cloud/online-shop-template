"use client";

import Link from "next/link";
import { Product } from "@/lib/infrastructure/db/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductImage } from "./product-image";
import { formatPrice, formatNumber } from "@/lib/shared/utils/format";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden" role="article">
      <CardContent className="p-0">
        <ProductImage src={product.imageUrl} alt={product.name} priority />
        <div className="p-4">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {product.description}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-lg font-bold">
              {formatPrice(Number(product.price))}
            </p>
            <p className="text-sm text-gray-500">
              在庫: {formatNumber(product.stock)}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link href={`/products/${product.id}`}>商品詳細</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
