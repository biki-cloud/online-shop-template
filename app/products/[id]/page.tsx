import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/products/product-details";
import { getProduct } from "@/app/actions/product";
import { ReactElement } from "react";

interface SearchParamsProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductPage({
  params,
}: SearchParamsProps): Promise<ReactElement> {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container py-8">
      <ProductDetails product={product} />
    </div>
  );
}
