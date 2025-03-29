import React from "react";
import { render, screen } from "@testing-library/react";
import { AdminProductDetail } from "../product-detail";
import { formatPrice } from "@/lib/shared/utils";
import { Product } from "@/lib/infrastructure/db/schema";

// モックコンポーネント
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    className,
  }: {
    src: string;
    alt: string;
    className: string;
  }) => (
    <img
      src={src}
      alt={alt}
      className={className}
      data-testid="product-image"
    />
  ),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} data-testid="link">
      {children}
    </a>
  ),
}));

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => (
      <div data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("lucide-react", () => ({
  Package: () => <div data-testid="package-icon" />,
  Edit: () => <div data-testid="edit-icon" />,
  ArrowLeft: () => <div data-testid="arrow-left-icon" />,
}));

describe("AdminProductDetail", () => {
  const mockProduct: Product = {
    id: 1,
    name: "テスト商品",
    description: "これはテスト商品です",
    price: "1000",
    currency: "JPY",
    stock: 10,
    imageUrl: "https://example.com/image.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  it("商品情報が正しく表示される（画像あり）", () => {
    render(<AdminProductDetail product={mockProduct} />);

    // 商品名
    expect(screen.getByText("テスト商品")).toBeInTheDocument();

    // 価格
    const formattedPrice = formatPrice(
      Number(mockProduct.price),
      mockProduct.currency
    );
    expect(screen.getByText(formattedPrice)).toBeInTheDocument();

    // 在庫
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("在庫あり")).toBeInTheDocument();

    // 説明
    expect(screen.getByText("これはテスト商品です")).toBeInTheDocument();

    // 画像
    expect(screen.getByTestId("product-image")).toBeInTheDocument();
    expect(screen.getByTestId("product-image")).toHaveAttribute(
      "src",
      mockProduct.imageUrl
    );

    // リンク
    const links = screen.getAllByTestId("link");
    expect(links[0]).toHaveAttribute("href", "/admin/products");
    expect(links[1]).toHaveAttribute(
      "href",
      `/admin/products/${mockProduct.id}/edit`
    );
  });

  it("商品情報が正しく表示される（画像なし）", () => {
    const productWithoutImage: Product = {
      ...mockProduct,
      imageUrl: null,
    };

    render(<AdminProductDetail product={productWithoutImage} />);

    // 商品名
    expect(screen.getByText("テスト商品")).toBeInTheDocument();

    // 画像の代わりにアイコンが表示される
    expect(screen.queryByTestId("product-image")).not.toBeInTheDocument();
    expect(screen.getByTestId("package-icon")).toBeInTheDocument();
  });

  it("在庫がない場合は在庫切れと表示される", () => {
    const outOfStockProduct: Product = {
      ...mockProduct,
      stock: 0,
    };

    render(<AdminProductDetail product={outOfStockProduct} />);

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("在庫切れ")).toBeInTheDocument();
  });

  it("説明がない場合はデフォルトメッセージが表示される", () => {
    const productWithoutDescription: Product = {
      ...mockProduct,
      description: null,
    };

    render(<AdminProductDetail product={productWithoutDescription} />);

    expect(screen.getByText("説明はありません")).toBeInTheDocument();
  });
});
