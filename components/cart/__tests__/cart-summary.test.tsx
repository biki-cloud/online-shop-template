import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { CartSummary } from "../cart-summary";
import { useRouter } from "next/navigation";

// モック
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// lucide-reactのモック
jest.mock("lucide-react", () => ({
  ShoppingBag: () => <div data-testid="shopping-bag-icon">Shopping Bag</div>,
}));

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<{}>) => (
      <div {...props}>{children}</div>
    ),
  },
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

describe("CartSummary", () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  test("合計金額が正しく計算され表示される", () => {
    const mockItems: MockCartItem[] = [
      {
        id: 1,
        cartId: 1,
        productId: 1,
        quantity: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        product: {
          id: 1,
          name: "商品1",
          description: "説明1",
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
          name: "商品2",
          description: "説明2",
          price: "500",
          currency: "JPY",
          imageUrl: "/test-image-2.jpg",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      },
    ];

    render(<CartSummary items={mockItems as any} />);

    // 小計、消費税、合計の表示を検証
    const subtotalElement = screen.getByText("小計").nextSibling;
    expect(subtotalElement).toHaveTextContent("￥2,500");

    const taxElement = screen.getByText("消費税（10%）").nextSibling;
    expect(taxElement).toHaveTextContent("￥250");

    const totalElement = screen.getByText("合計").nextSibling;
    expect(totalElement).toHaveTextContent("￥2,750");
  });

  test("'レジに進む'ボタンをクリックすると/checkoutページに遷移する", () => {
    const mockItems: MockCartItem[] = [
      {
        id: 1,
        cartId: 1,
        productId: 1,
        quantity: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        product: {
          id: 1,
          name: "商品1",
          description: "説明1",
          price: "1000",
          currency: "JPY",
          imageUrl: "/test-image-1.jpg",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      },
    ];

    render(<CartSummary items={mockItems as any} />);

    const checkoutButton = screen.getByText("レジに進む");
    fireEvent.click(checkoutButton);

    expect(mockRouter.push).toHaveBeenCalledWith("/checkout");
  });

  test("カートが空の場合、'レジに進む'ボタンは無効化される", () => {
    render(<CartSummary items={[]} />);

    const checkoutButton = screen.getByText("レジに進む");
    expect(checkoutButton).toBeDisabled();
  });

  test("カートの合計が0円の場合でも正しく表示される", () => {
    const mockItems: MockCartItem[] = [
      {
        id: 1,
        cartId: 1,
        productId: 1,
        quantity: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        product: {
          id: 1,
          name: "商品1",
          description: "説明1",
          price: "1000",
          currency: "JPY",
          imageUrl: "/test-image-1.jpg",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      },
    ];

    render(<CartSummary items={mockItems as any} />);

    // 小計、消費税、合計の表示を検証
    const subtotalElement = screen.getByText("小計").nextSibling;
    expect(subtotalElement).toHaveTextContent("￥0");

    const taxElement = screen.getByText("消費税（10%）").nextSibling;
    expect(taxElement).toHaveTextContent("￥0");

    const totalElement = screen.getByText("合計").nextSibling;
    expect(totalElement).toHaveTextContent("￥0");
  });
});
