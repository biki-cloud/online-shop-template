import React from "react";
import { render, screen } from "@testing-library/react";
import { ProductCard } from "../product-card";
import type { Product } from "@/lib/infrastructure/db/schema";
import { formatPrice, formatNumber } from "@/lib/shared/utils/format";

// ProductImageコンポーネントのモック
jest.mock("../product-image", () => ({
  ProductImage: ({ src, alt, priority }: any) => (
    <img
      src={src}
      alt={alt}
      data-testid="product-image"
      data-priority={priority ? "true" : "false"}
    />
  ),
}));

// Cardコンポーネントのモック
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
  CardFooter: ({ children, className }: any) => (
    <div data-testid="card-footer" className={className}>
      {children}
    </div>
  ),
}));

// Buttonコンポーネントのモック
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, asChild, className }: any) => (
    <button
      data-testid="button"
      data-as-child={asChild ? "true" : "false"}
      className={className}
    >
      {children}
    </button>
  ),
}));

// NextJSのLinkコンポーネントのモック
jest.mock(
  "next/link",
  () =>
    function Link({ href, children }: any) {
      return (
        <a href={href} data-testid="next-link">
          {children}
        </a>
      );
    }
);

describe("ProductCard", () => {
  const mockProduct = {
    id: 1,
    name: "テスト商品",
    description: "これはテスト商品の説明です。",
    price: "1000",
    currency: "JPY",
    imageUrl: "/images/test-product.jpg",
    stock: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  it("製品情報が正しく表示されること", () => {
    render(<ProductCard product={mockProduct as Product} />);

    // 商品名が表示されていることを確認
    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();

    // 商品説明が表示されていることを確認
    expect(screen.getByText(mockProduct.description!)).toBeInTheDocument();

    // 価格が表示されていることを確認
    expect(
      screen.getByText(formatPrice(Number(mockProduct.price)))
    ).toBeInTheDocument();

    // 在庫数が表示されていることを確認
    expect(
      screen.getByText(`在庫: ${formatNumber(mockProduct.stock)}`)
    ).toBeInTheDocument();

    // 商品詳細リンクが表示されていることを確認
    const detailLink = screen.getByTestId("next-link");
    expect(detailLink).toHaveAttribute("href", `/products/${mockProduct.id}`);
    expect(detailLink).toHaveTextContent("商品詳細");

    // 画像が表示されていることを確認
    const image = screen.getByTestId("product-image");
    expect(image).toHaveAttribute("src", mockProduct.imageUrl);
    expect(image).toHaveAttribute("alt", mockProduct.name);
    expect(image).toHaveAttribute("data-priority", "true");
  });
});
