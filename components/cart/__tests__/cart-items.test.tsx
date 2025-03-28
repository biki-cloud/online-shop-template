import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CartItems } from "../cart-items";
import { updateCartItemQuantity, removeFromCart } from "@/app/actions/cart";
import { useRouter } from "next/navigation";
import { CartItem, Product } from "@/lib/infrastructure/db/schema";

// モック
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/app/actions/cart", () => ({
  updateCartItemQuantity: jest.fn(),
  removeFromCart: jest.fn(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} src={props.src || ""} />;
  },
}));

// lucide-reactのモック
jest.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader-icon">Loading</div>,
  Trash2: () => <div data-testid="trash-icon">Delete</div>,
  Minus: () => <div>-</div>,
  Plus: () => <div>+</div>,
}));

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<{}>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

const mockRouter = {
  refresh: jest.fn(),
};

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

describe("CartItems", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  test("空のカートが表示される", () => {
    render(<CartItems items={[]} />);
    expect(screen.getByText("カートは空です")).toBeInTheDocument();
  });

  test("カートアイテムが正しく表示される", () => {
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
          name: "テスト商品",
          description: "テスト説明",
          price: "1000",
          currency: "JPY",
          imageUrl: "/test-image.jpg",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      },
    ];

    render(<CartItems items={mockItems as any} />);

    expect(screen.getByText("テスト商品")).toBeInTheDocument();
    expect(screen.getByText("テスト説明")).toBeInTheDocument();
    expect(screen.getByText("￥1,000")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2")).toBeInTheDocument();
  });

  test("数量の増減ボタンが機能する", async () => {
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
          name: "テスト商品",
          description: "テスト説明",
          price: "1000",
          currency: "JPY",
          imageUrl: "/test-image.jpg",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      },
    ];

    render(<CartItems items={mockItems as any} />);

    // 増加ボタンをクリック
    const increaseButton = screen.getByText("+").closest("button");
    fireEvent.click(increaseButton!);

    await waitFor(() => {
      expect(updateCartItemQuantity).toHaveBeenCalledWith(1, 3);
      expect(mockRouter.refresh).toHaveBeenCalled();
    });

    // 減少ボタンをクリック
    const decreaseButton = screen.getByText("-").closest("button");
    fireEvent.click(decreaseButton!);

    await waitFor(() => {
      expect(updateCartItemQuantity).toHaveBeenCalledWith(1, 1);
      expect(mockRouter.refresh).toHaveBeenCalledTimes(2);
    });
  });

  test("入力フィールドで数量を直接変更できる", async () => {
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
          name: "テスト商品",
          description: "テスト説明",
          price: "1000",
          currency: "JPY",
          imageUrl: "/test-image.jpg",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      },
    ];

    render(<CartItems items={mockItems as any} />);

    // 数量フィールドを直接変更
    const quantityInput = screen.getByDisplayValue("2");
    fireEvent.change(quantityInput, { target: { value: "5" } });

    await waitFor(() => {
      expect(updateCartItemQuantity).toHaveBeenCalledWith(1, 5);
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });

  test("削除ボタンが機能する", async () => {
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
          name: "テスト商品",
          description: "テスト説明",
          price: "1000",
          currency: "JPY",
          imageUrl: "/test-image.jpg",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      },
    ];

    render(<CartItems items={mockItems as any} />);

    // 削除ボタンをクリック
    const deleteButton = screen.getByTestId("trash-icon").closest("button");
    fireEvent.click(deleteButton!);

    await waitFor(() => {
      expect(removeFromCart).toHaveBeenCalledWith(1);
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });
});
