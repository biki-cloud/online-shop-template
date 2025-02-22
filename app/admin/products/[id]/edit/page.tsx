import { notFound } from "next/navigation";
import { getProduct } from "@/app/actions/product";
import { checkAdmin } from "@/lib/infrastructure/auth/middleware";
import { AdminProductForm } from "@/components/admin/products/product-form";
import { ReactElement } from "react";

interface SearchParamsProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminProductEditPage({
  params,
}: SearchParamsProps): Promise<ReactElement> {
  const resolvedParams = await params;

  if (!resolvedParams?.id || isNaN(Number(resolvedParams.id))) {
    notFound();
  }

  const productId = Number(resolvedParams.id);

  try {
    const [isAdmin, product] = await Promise.all([
      checkAdmin(),
      getProduct(productId),
    ]);

    if (!isAdmin || !product) {
      notFound();
    }

    return (
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">商品の編集</h1>
        <AdminProductForm product={product} />
      </div>
    );
  } catch (error) {
    console.error("Error loading product:", error);
    notFound();
  }
}
