import { notFound } from "next/navigation";
import { getProduct } from "@/app/actions/product";
import { AdminProductDetail } from "@/components/admin/products/product-detail";
import { checkAdmin } from "@/lib/infrastructure/auth/middleware";

interface Props {
  params: {
    id: string;
  };
}

export default async function AdminProductDetailPage(props: Props) {
  try {
    const params = await Promise.resolve(props.params);
    const [isAdmin, product] = await Promise.all([
      checkAdmin(),
      getProduct(Number(params.id)),
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
