export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0; // SSRモード

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/app/actions/product";
import { DeleteProductButton } from "@/components/products/delete-product-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Eye, Edit } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/shared/utils";

export default async function AdminProductsPage() {
  const productList = await getProducts();

  return (
    <div className="container py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">商品管理</h2>
          <p className="text-muted-foreground">
            登録されている商品の一覧です。商品の追加、編集、削除が行えます。
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            新規商品登録
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productList.map((product) => (
          <Card key={product.id} className="overflow-hidden group">
            <div className="relative aspect-[4/3]">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Package className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge
                  variant={product.deletedAt ? "destructive" : "secondary"}
                >
                  {product.deletedAt ? "非公開" : "公開中"}
                </Badge>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="line-clamp-1">{product.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xl font-bold">
                    {formatPrice(Number(product.price), product.currency)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    在庫数: {product.stock}個
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link href={`/admin/products/${product.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      詳細
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      編集
                    </Link>
                  </Button>
                  <DeleteProductButton productId={product.id} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
