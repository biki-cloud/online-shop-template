import { Suspense } from "react";
import { getProducts } from "@/app/actions/product";
import { ProductCard } from "./product-card";
import { Skeleton } from "@/components/ui/skeleton";

function ProductGrid({
  products,
}: {
  products: Awaited<ReturnType<typeof getProducts>>;
}) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">商品が見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-square" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export async function ProductList() {
  const products = await getProducts();

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">商品一覧</h1>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid products={products} />
      </Suspense>
    </div>
  );
}
