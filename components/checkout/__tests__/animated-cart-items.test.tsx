import React from "react";
import { render, screen } from "@testing-library/react";
import { AnimatedCartItems } from "../animated-cart-items";
import { formatPrice } from "@/lib/shared/utils";
import { CartItem } from "@/lib/core/domain/cart.domain";
import { Product } from "@/lib/core/domain/product.domain";

// framer-motionをモック
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

describe("AnimatedCartItems", () => {
  // Productの型に合わせたモックデータ
  const mockProduct1: Product = {
    id: 1,
    name: "商品1",
    description: "商品1の説明",
    price: "1000",
    currency: "JPY",
    imageUrl: "https://example.com/image1.jpg",
    stock: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockProduct2: Product = {
    id: 2,
    name: "商品2",
    description: "商品2の説明",
    price: "2000",
    currency: "JPY",
    imageUrl: null,
    stock: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  // CartItemの型に合わせたモックデータ
  const mockCartItems: (CartItem & { product: Product | null })[] = [
    {
      id: 1,
      cartId: 1,
      productId: 1,
      quantity: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      product: mockProduct1,
    },
    {
      id: 2,
      cartId: 1,
      productId: 2,
      quantity: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      product: mockProduct2,
    },
  ];

  it("カート内の商品リストが正しくレンダリングされる", () => {
    render(<AnimatedCartItems items={mockCartItems} />);

    // 商品1の情報が表示されていることを確認
    expect(screen.getByText("商品1")).toBeInTheDocument();
    expect(screen.getByText("数量: 2")).toBeInTheDocument();

    // 商品1の価格が計算されて表示されていることを確認
    const product1 = mockCartItems[0].product;
    if (product1) {
      const expectedPrice = formatPrice(
        Number(product1.price) * mockCartItems[0].quantity,
        product1.currency
      );
      // getAllByTextを使用して複数の一致がある場合に対応
      const priceElements = screen.getAllByText(expectedPrice);
      expect(priceElements.length).toBeGreaterThan(0);
    }

    // 商品1の画像が表示されていることを確認
    const images = screen.getAllByRole("img");
    expect(images[0]).toHaveAttribute("src", "https://example.com/image1.jpg");
    expect(images[0]).toHaveAttribute("alt", "商品1");

    // 商品2の情報が表示されていることを確認
    expect(screen.getByText("商品2")).toBeInTheDocument();
    expect(screen.getByText("数量: 1")).toBeInTheDocument();
  });

  it("商品が空の場合は何も表示されない", () => {
    const { container } = render(<AnimatedCartItems items={[]} />);

    // containerのクエリを使って空の状態を確認
    const spaceYContainer = container.querySelector(".space-y-6");
    expect(spaceYContainer).toBeInTheDocument();
    expect(spaceYContainer?.children.length).toBe(0);
  });

  it("アニメーション用のコンポーネントが使用されている", () => {
    render(<AnimatedCartItems items={mockCartItems} />);

    // framer-motionのコンポーネントが使用されていることを確認
    const motionDivs = screen.getAllByTestId("motion-div");
    expect(motionDivs.length).toBe(2); // 2つの商品
  });

  it("productがnullの場合でもエラーを起こさずレンダリングされる", () => {
    const itemsWithNullProduct: (CartItem & { product: null })[] = [
      {
        id: 3,
        cartId: 1,
        productId: 3,
        quantity: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        product: null,
      },
    ];

    render(<AnimatedCartItems items={itemsWithNullProduct} />);

    // エラーが発生せずレンダリングされていることを確認
    expect(screen.getByTestId("motion-div")).toBeInTheDocument();

    // 商品名や画像は表示されない
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
