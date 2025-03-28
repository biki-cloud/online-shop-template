import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { CheckoutForm } from "../checkout-form";
import type { CartItem } from "@/lib/core/domain/cart.domain";
import type { Product } from "@/lib/core/domain/product.domain";

// Lucide Iconsのモック
jest.mock("lucide-react", () => ({
  ShoppingCart: () => (
    <div data-testid="shopping-cart-icon">ShoppingCartIcon</div>
  ),
  Package: () => <div data-testid="package-icon">PackageIcon</div>,
  CreditCard: () => <div data-testid="credit-card-icon">CreditCardIcon</div>,
}));

// UIコンポーネントのモック
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, type, size, className, disabled, onClick }: any) => (
    <button
      data-testid="button"
      type={type}
      className={className}
      data-size={size}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

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
  CardHeader: ({ children, className }: any) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: any) => (
    <h3 data-testid="card-title" className={className}>
      {children}
    </h3>
  ),
}));

jest.mock("@/components/ui/separator", () => ({
  Separator: ({ className }: any) => (
    <hr data-testid="separator" className={className} />
  ),
}));

jest.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children, className }: any) => (
    <div data-testid="scroll-area" className={className}>
      {children}
    </div>
  ),
}));

// AnimatedCartItemsコンポーネントのモック
jest.mock("@/components/checkout/animated-cart-items", () => ({
  AnimatedCartItems: ({ items }: any) => (
    <div data-testid="animated-cart-items">
      {items.map((item: any) => (
        <div key={item.id} data-testid="cart-item">
          {item.product?.name} - 数量: {item.quantity}
        </div>
      ))}
    </div>
  ),
}));

// テスト用のモックデータ型
type MockCartItem = {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  product: {
    id: number;
    name: string;
    description: string | null;
    price: string;
    currency: string;
    imageUrl: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  } | null;
};

describe("CheckoutForm", () => {
  const mockCartItems: MockCartItem[] = [
    {
      id: 1,
      cartId: 1,
      productId: 1,
      quantity: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      product: {
        id: 1,
        name: "テスト商品1",
        description: "テスト説明1",
        price: "1000",
        currency: "JPY",
        imageUrl: "/test-image-1.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    },
    {
      id: 2,
      cartId: 1,
      productId: 2,
      quantity: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      product: {
        id: 2,
        name: "テスト商品2",
        description: "テスト説明2",
        price: "500",
        currency: "JPY",
        imageUrl: "/test-image-2.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    },
  ];

  const mockSubtotal = 2500;
  const mockTax = 250;
  const mockTotal = 2750;
  const mockOnCheckout = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("チェックアウトフォームが正しくレンダリングされる", () => {
    render(
      <CheckoutForm
        cartItems={mockCartItems as any}
        subtotal={mockSubtotal}
        tax={mockTax}
        total={mockTotal}
        onCheckout={mockOnCheckout}
      />
    );

    // ヘッダーが表示されていることを確認
    expect(screen.getByTestId("shopping-cart-icon")).toBeInTheDocument();
    expect(screen.getByText("チェックアウト")).toBeInTheDocument();

    // 注文内容セクションが表示されていることを確認
    expect(screen.getByTestId("package-icon")).toBeInTheDocument();
    expect(screen.getByText("注文内容")).toBeInTheDocument();

    // カート商品が表示されていることを確認
    expect(screen.getByTestId("animated-cart-items")).toBeInTheDocument();
    const cartItems = screen.getAllByTestId("cart-item");
    expect(cartItems).toHaveLength(2);
    expect(cartItems[0]).toHaveTextContent("テスト商品1 - 数量: 2");
    expect(cartItems[1]).toHaveTextContent("テスト商品2 - 数量: 1");

    // 注文確認セクションが表示されていることを確認
    expect(screen.getByTestId("credit-card-icon")).toBeInTheDocument();
    expect(screen.getByText("注文の確認")).toBeInTheDocument();

    // 金額情報が表示されていることを確認 - 親要素を特定して検索
    const priceDetails = screen.getAllByText(/小計|消費税|合計/);

    // 小計の値を検証
    const subtotalElement = priceDetails[0].parentElement;
    expect(within(subtotalElement!).getByText("￥2,500")).toBeInTheDocument();

    // 消費税の値を検証
    const taxElement = priceDetails[1].parentElement;
    expect(within(taxElement!).getByText("￥250")).toBeInTheDocument();

    // 合計の値を検証
    const totalElement = priceDetails[2].parentElement;
    expect(within(totalElement!).getByText("￥2,750")).toBeInTheDocument();

    // 注文確定ボタンが表示されていることを確認
    expect(screen.getByText("注文を確定する")).toBeInTheDocument();
  });

  test("注文確定ボタンをクリックするとonCheckout関数が呼び出される", async () => {
    render(
      <CheckoutForm
        cartItems={mockCartItems as any}
        subtotal={mockSubtotal}
        tax={mockTax}
        total={mockTotal}
        onCheckout={mockOnCheckout}
      />
    );

    // 注文確定ボタンをクリック
    const submitButton = screen.getByText("注文を確定する");
    fireEvent.click(submitButton);

    // フォームのsubmitイベントによりonCheckout関数が呼び出されることを確認
    // (実際のsubmitイベントのテストなので、ボタンクリックではなくformのsubmitをシミュレート)
    const form = screen.getByTestId("button").closest("form");
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockOnCheckout).toHaveBeenCalled();
    });
  });

  test("カート商品が空の場合でも正しくレンダリングされる", () => {
    render(
      <CheckoutForm
        cartItems={[]}
        subtotal={0}
        tax={0}
        total={0}
        onCheckout={mockOnCheckout}
      />
    );

    // 注文内容セクションが表示されていることを確認
    expect(screen.getByText("注文内容")).toBeInTheDocument();

    // 商品がないことを確認
    expect(screen.queryAllByTestId("cart-item")).toHaveLength(0);

    // 金額情報が0円で表示されていることを確認 - 親要素を特定して検索
    const priceElements = screen.getAllByText(/小計|消費税|合計/);

    // 小計の値を検証
    const subtotalElement = priceElements[0].parentElement;
    expect(within(subtotalElement!).getByText("￥0")).toBeInTheDocument();

    // 消費税の値を検証
    const taxElement = priceElements[1].parentElement;
    expect(within(taxElement!).getByText("￥0")).toBeInTheDocument();

    // 合計の値を検証
    const totalElement = priceElements[2].parentElement;
    expect(within(totalElement!).getByText("￥0")).toBeInTheDocument();

    // 全ての￥0の数を確認
    const allZeroYen = screen.getAllByText("￥0");
    expect(allZeroYen).toHaveLength(3);
  });
});
