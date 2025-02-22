import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/products/product-details";
import { getProduct } from "@/app/actions/product";

interface PageParams {
  id: string;
}

interface SearchParams {
  [key: string]: string | string[] | undefined;
}

interface Props {
  params: Promise<PageParams>;
  searchParams: Promise<SearchParams>;
}

export default async function ProductPage({ params, searchParams }: Props) {
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
