import { createProductAction } from "@/app/actions/admin-products";
import { ProductForm } from "@/components/products/product-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewProductPage() {
  return (
    <div className="container py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">新規商品登録</h2>
          <p className="text-muted-foreground">
            新しい商品を登録します。必要な情報を入力してください。
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            商品一覧に戻る
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden bg-white shadow-lg">
        <CardHeader className="border-b bg-gray-50/50">
          <div className="flex items-center space-x-3">
            <Package className="h-5 w-5 text-muted-foreground" />
            <CardTitle>商品情報の入力</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <ProductForm onSubmit={createProductAction} />
        </CardContent>
      </Card>
    </div>
  );
}
