import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getProducts } from "@/app/actions/product";
import { Product } from "@/lib/infrastructure/db/schema";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "商品一覧 | Online Shop",
  description:
    "高品質な商品を取り揃えたオンラインショップの商品一覧ページです。",
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <section className="relative h-[300px] overflow-hidden rounded-xl mb-12">
        <Image
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070"
          alt="Products Hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white space-y-4">
            <h1 className="text-4xl font-bold">Our Collections</h1>
            <p className="text-lg max-w-2xl mx-auto">
              厳選されたアイテムで、あなたのライフスタイルをより豊かに
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div className="text-sm text-muted-foreground">
          {products.length} items found
        </div>
        <div className="flex gap-4">
          <Select defaultValue="featured">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">おすすめ順</SelectItem>
              <SelectItem value="newest">新着順</SelectItem>
              <SelectItem value="price-asc">価格の安い順</SelectItem>
              <SelectItem value="price-desc">価格の高い順</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのカテゴリー</SelectItem>
              <SelectItem value="clothing">衣類</SelectItem>
              <SelectItem value="accessories">アクセサリー</SelectItem>
              <SelectItem value="shoes">シューズ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product: Product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group"
          >
            <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow duration-300">
              <div className="relative">
                <AspectRatio ratio={3 / 4}>
                  <Image
                    src={product.imageUrl ?? "/images/product-placeholder.png"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </AspectRatio>
                <div className="absolute top-2 right-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full w-8 h-8 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                  >
                    <HeartIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold truncate">{product.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {product.description}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <div className="font-semibold">
                  ¥{parseInt(product.price).toLocaleString()}
                </div>
                <Button variant="secondary" size="sm">
                  詳細を見る
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold">商品が見つかりませんでした</h3>
          <p className="text-muted-foreground mt-2">
            検索条件を変更して、もう一度お試しください。
          </p>
        </div>
      )}
    </div>
  );
}

function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}
