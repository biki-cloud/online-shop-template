import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/products/product-details";
import { getProduct } from "@/app/actions/product";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: Props) {
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
