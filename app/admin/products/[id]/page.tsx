import { notFound } from "next/navigation";
import { getProduct } from "@/app/actions/product";
import { AdminProductDetail } from "@/components/admin/products/product-detail";
import { checkAdmin } from "@/lib/infrastructure/auth/middleware";

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

export default async function AdminProductDetailPage({
  params,
  searchParams,
}: Props) {
  try {
    const resolvedParams = await params;
    const [isAdmin, product] = await Promise.all([
      checkAdmin(),
      getProduct(Number(resolvedParams.id)),
    ]);

    if (!isAdmin || !product) {
      notFound();
    }

    return (
      <div className="container py-6">
        <AdminProductDetail product={product} />
      </div>
    );
  } catch (error) {
    console.error("Error loading product:", error);
    notFound();
  }
}
