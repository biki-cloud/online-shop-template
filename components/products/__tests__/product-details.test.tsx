import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProductDetails } from "../product-details";
import type { Product } from "@/lib/infrastructure/db/schema";
import { addToCart } from "@/app/actions/cart";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/shared/utils";

// モック
jest.mock("@/app/actions/cart", () => ({
  addToCart: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Next Image コンポーネントのモック
jest.mock(
  "next/image",
  () =>
    function Image({ src, alt, fill, className, sizes, priority }: any) {
      return (
        <img
          src={src}
          alt={alt}
          data-testid="product-image"
          className={className}
          data-fill={fill ? "true" : "false"}
          data-sizes={sizes}
          data-priority={priority ? "true" : "false"}
        />
      );
    }
);

// Lucide アイコンのモック
jest.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader-icon">LoaderIcon</div>,
  Package: () => <div data-testid="package-icon">PackageIcon</div>,
  Truck: () => <div data-testid="truck-icon">TruckIcon</div>,
  Shield: () => <div data-testid="shield-icon">ShieldIcon</div>,
}));

// UIコンポーネントのモック
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, className, onClick, disabled, size }: any) => (
    <button
      data-testid="button"
      className={className}
      data-size={size}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant, className }: any) => (
    <div data-testid="badge" data-variant={variant} className={className}>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/separator", () => ({
  Separator: ({ className }: any) => (
    <hr data-testid="separator" className={className} />
  ),
}));

jest.mock("@/components/ui/aspect-ratio", () => ({
  AspectRatio: ({ children, ratio }: any) => (
    <div data-testid="aspect-ratio" data-ratio={ratio}>
      {children}
    </div>
  ),
}));

// Framer-Motionのモック
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}));

describe("ProductDetails", () => {
  const mockProduct: Partial<Product> = {
    id: 1,
    name: "テスト商品",
    description: "テスト商品の詳細な説明です。",
    price: "2500",
    currency: "JPY",
    imageUrl: "/images/test-product.jpg",
    stock: 42,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("商品情報が正しく表示されること", () => {
    render(<ProductDetails product={mockProduct as Product} />);

    // 商品名が表示されていることを確認
    expect(screen.getByText(mockProduct.name!)).toBeInTheDocument();

    // 商品説明が表示されていることを確認
    expect(screen.getByText(mockProduct.description!)).toBeInTheDocument();

    // 価格が表示されていることを確認
    const formattedPrice = formatPrice(
      Number(mockProduct.price),
      mockProduct.currency || "JPY"
    );
    expect(screen.getByText(formattedPrice)).toBeInTheDocument();

    // 在庫情報が表示されていることを確認
    expect(
      screen.getByText(`在庫: ${mockProduct.stock} 個`)
    ).toBeInTheDocument();

    // 画像が表示されていることを確認
    const image = screen.getByTestId("product-image");
    expect(image).toHaveAttribute("src", mockProduct.imageUrl);
    expect(image).toHaveAttribute("alt", mockProduct.name);

    // ボタンが表示されていることを確認
    const button = screen.getByTestId("button");
    expect(button).toHaveTextContent("カートに追加");
    expect(button).not.toBeDisabled();

    // 配送情報が表示されていることを確認
    expect(screen.getByText("最短翌日お届け")).toBeInTheDocument();
    expect(screen.getByText("安心の梱包")).toBeInTheDocument();
    expect(screen.getByText("品質保証付き")).toBeInTheDocument();
  });

  it("必要な商品情報が不足している場合、エラーメッセージが表示されること", () => {
    const incompleteProduct = {
      id: 2,
      price: "500",
      currency: "JPY",
      stock: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    render(<ProductDetails product={incompleteProduct as Product} />);

    expect(screen.getByText("商品情報が見つかりません")).toBeInTheDocument();
  });

  it("カートに追加ボタンをクリックすると、addToCartが呼び出され、カートページに遷移すること", async () => {
    (addToCart as jest.Mock).mockResolvedValueOnce({ success: true });

    render(<ProductDetails product={mockProduct as Product} />);

    const button = screen.getByTestId("button");
    fireEvent.click(button);

    // ボタンがロード中の状態になっていることを確認
    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
    expect(screen.getByText("カートに追加中...")).toBeInTheDocument();

    await waitFor(() => {
      // addToCartが正しいパラメータで呼び出されたことを確認
      expect(addToCart).toHaveBeenCalledWith(mockProduct.id);
      // カートページに遷移したことを確認
      expect(mockRouter.push).toHaveBeenCalledWith("/cart");
    });
  });

  it("未ログイン状態でカートに追加を試みると、サインインページに遷移すること", async () => {
    // ログインが必要というエラーをシミュレート
    (addToCart as jest.Mock).mockRejectedValueOnce(
      new Error("ログインが必要です")
    );

    render(<ProductDetails product={mockProduct as Product} />);

    const button = screen.getByTestId("button");
    fireEvent.click(button);

    await waitFor(() => {
      // サインインページに遷移したことを確認
      expect(mockRouter.push).toHaveBeenCalledWith("/sign-in");
    });
  });

  it("その他のエラーが発生した場合、ローディングが解除されること", async () => {
    // その他のエラーをシミュレート
    (addToCart as jest.Mock).mockRejectedValueOnce(new Error("一般的なエラー"));

    render(<ProductDetails product={mockProduct as Product} />);

    const button = screen.getByTestId("button");
    fireEvent.click(button);

    // ロード状態になることを確認
    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
    expect(screen.getByText("カートに追加中...")).toBeInTheDocument();

    await waitFor(() => {
      // ローディングが解除されていることを確認
      expect(screen.queryByTestId("loader-icon")).not.toBeInTheDocument();
      expect(screen.getByText("カートに追加")).toBeInTheDocument();
      // ルーティングは発生していないことを確認
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });
});
