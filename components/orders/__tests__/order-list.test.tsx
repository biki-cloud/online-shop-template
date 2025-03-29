import React from "react";
import { render, screen } from "@testing-library/react";
import { OrderList } from "../order-list";
import { Order, OrderItem } from "@/lib/core/domain/order.domain";
import { formatPrice } from "@/lib/shared/utils";

// モック
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, className }: any) => (
    <img src={src} alt={alt} className={className} data-testid="next-image" />
  ),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, className }: any) => (
    <a href={href} className={className} data-testid="next-link">
      {children}
    </a>
  ),
}));

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => (
      <div data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
  },
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
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant, className }: any) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

// テスト用のモックデータを作成
const createMockOrder = (
  id: number,
  totalAmount: string,
  itemCount: number
): Order & { items: OrderItem[] } => {
  const items: OrderItem[] = Array.from({ length: itemCount }, (_, i) => ({
    id: i + 1,
    orderId: id,
    productId: i + 100,
    quantity: 1,
    price: (1000 * (i + 1)).toString(),
    currency: "JPY",
    createdAt: new Date(),
    updatedAt: new Date(),
    product: {
      id: i + 100,
      name: `テスト商品${i + 1}`,
      description: `テスト説明${i + 1}`,
      price: (1000 * (i + 1)).toString(),
      currency: "JPY",
      imageUrl: `/test-image-${i + 1}.jpg`,
      stock: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  }));

  return {
    id,
    userId: 1,
    totalAmount,
    currency: "JPY",
    status: "completed",
    shippingAddress: "東京都渋谷区",
    stripeSessionId: `session_${id}`,
    stripePaymentIntentId: `pi_${id}`,
    createdAt: new Date("2023-01-01T10:00:00Z"),
    updatedAt: new Date(),
    items,
  };
};

describe("OrderList", () => {
  test("注文がない場合、何も表示されない", () => {
    render(<OrderList orders={[]} />);
    expect(screen.queryByTestId("card")).not.toBeInTheDocument();
  });

  test("単一の注文が正しく表示される", () => {
    const mockOrder = createMockOrder(12345, "1000", 1);

    render(<OrderList orders={[mockOrder]} />);

    // 注文番号が表示されていることを確認
    expect(screen.getByText("注文番号: 12345")).toBeInTheDocument();

    // 支払い完了バッジが表示されていることを確認
    expect(screen.getByText("支払い完了")).toBeInTheDocument();

    // 注文日が表示されていることを確認
    expect(screen.getByText(/注文日:/)).toBeInTheDocument();

    // 合計金額が表示されていることを確認
    expect(screen.getByText(formatPrice(1000, "JPY"))).toBeInTheDocument();

    // 商品数が表示されていることを確認
    expect(screen.getByText("1点の商品")).toBeInTheDocument();

    // 画像が表示されていることを確認
    expect(screen.getByTestId("next-image")).toBeInTheDocument();
    expect(screen.getByTestId("next-image")).toHaveAttribute(
      "src",
      "/test-image-1.jpg"
    );

    // リンクが正しいURLを持っていることを確認
    expect(screen.getByTestId("next-link")).toHaveAttribute(
      "href",
      "/orders/12345"
    );
  });

  test("複数の注文が正しく表示される", () => {
    const mockOrders = [
      createMockOrder(12345, "1000", 1),
      createMockOrder(67890, "3000", 2),
    ];

    render(<OrderList orders={mockOrders} />);

    // 両方の注文番号が表示されていることを確認
    expect(screen.getByText("注文番号: 12345")).toBeInTheDocument();
    expect(screen.getByText("注文番号: 67890")).toBeInTheDocument();

    // 両方の商品数が表示されていることを確認
    expect(screen.getByText("1点の商品")).toBeInTheDocument();
    expect(screen.getByText("2点の商品")).toBeInTheDocument();

    // 両方の注文へのリンクが存在することを確認
    const links = screen.getAllByTestId("next-link");
    expect(links[0]).toHaveAttribute("href", "/orders/12345");
    expect(links[1]).toHaveAttribute("href", "/orders/67890");
  });

  test("4つ以上の商品がある場合、最初の3つだけが表示され残りは+Nと表示される", () => {
    const mockOrder = createMockOrder(12345, "5000", 5);

    render(<OrderList orders={[mockOrder]} />);

    // 画像が3つだけ表示されていることを確認
    const images = screen.getAllByTestId("next-image");
    expect(images).toHaveLength(3);

    // 残りの商品数が表示されていることを確認
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  test("注文金額が正しくフォーマットされる", () => {
    const mockOrder = createMockOrder(12345, "12345", 1);

    render(<OrderList orders={[mockOrder]} />);

    // 金額が正しくフォーマットされていることを確認
    expect(screen.getByText(formatPrice(12345, "JPY"))).toBeInTheDocument();
  });
});
