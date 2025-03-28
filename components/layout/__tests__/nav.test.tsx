import React from "react";
import { render, screen } from "@testing-library/react";
import { Nav } from "../nav";
import { User } from "@/lib/infrastructure/db/schema";

// Iconのモック
jest.mock("lucide-react", () => ({
  Store: () => <div data-testid="store-icon">StoreIcon</div>,
  Package: () => <div data-testid="package-icon">PackageIcon</div>,
  ClipboardList: () => (
    <div data-testid="clipboard-list-icon">ClipboardListIcon</div>
  ),
  ShoppingCart: () => (
    <div data-testid="shopping-cart-icon">ShoppingCartIcon</div>
  ),
  LogIn: () => <div data-testid="login-icon">LogInIcon</div>,
  UserPlus: () => <div data-testid="user-plus-icon">UserPlusIcon</div>,
  Loader2: () => <div data-testid="loader-icon">LoaderIcon</div>,
  User: () => <div data-testid="user-icon">UserIcon</div>,
}));

// useUserのモック
jest.mock("@/lib/infrastructure/auth", () => ({
  useUser: jest.fn(),
}));

// Next.jsのusePathnameのモック
jest.mock("next/navigation", () => ({
  usePathname: () => "/products",
}));

// Buttonコンポーネントのモック
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, variant, size, className, disabled }: any) => (
    <button
      data-testid="button"
      data-variant={variant}
      data-size={size}
      className={className}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}));

// NextJSのLinkコンポーネントのモック
jest.mock(
  "next/link",
  () =>
    function Link({ href, children, className }: any) {
      return (
        <a
          href={href}
          data-testid="next-link"
          data-href={href}
          className={className}
        >
          {children}
        </a>
      );
    }
);

// UserStateコンポーネントのモック
jest.mock("../user-state", () => ({
  UserState: ({ user }: any) => (
    <div data-testid="user-state" data-user-id={user.id}>
      UserState Component
    </div>
  ),
}));

// Suspenseのモック
jest.mock("react", () => {
  const originalReact = jest.requireActual("react");
  return {
    ...originalReact,
    Suspense: ({ children }: any) => children,
  };
});

describe("Nav", () => {
  let mockUseUser: jest.Mock;

  beforeAll(() => {
    mockUseUser = require("@/lib/infrastructure/auth").useUser;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("ユーザーがログインしていない場合、サインインと新規登録リンクが表示されること", () => {
    mockUseUser.mockReturnValue({ user: null });

    render(<Nav />);

    // ショップロゴが表示されていることを確認
    expect(screen.getByText("Online Shop")).toBeInTheDocument();

    // ナビゲーションリンクが表示されていることを確認
    const links = screen.getAllByTestId("next-link");
    expect(
      links.some((link) => link.getAttribute("data-href") === "/products")
    ).toBeTruthy();
    expect(
      links.some((link) => link.getAttribute("data-href") === "/cart")
    ).toBeTruthy();
    expect(
      links.some((link) => link.getAttribute("data-href") === "/sign-in")
    ).toBeTruthy();
    expect(
      links.some((link) => link.getAttribute("data-href") === "/sign-up")
    ).toBeTruthy();

    // 管理者用と注文リンクが表示されていないことを確認
    expect(
      links.every(
        (link) => link.getAttribute("data-href") !== "/admin/products"
      )
    ).toBeTruthy();
    expect(
      links.every((link) => link.getAttribute("data-href") !== "/orders")
    ).toBeTruthy();

    // サインインと新規登録のアイコンが表示されていることを確認
    expect(screen.getByTestId("login-icon")).toBeInTheDocument();
    expect(screen.getByTestId("user-plus-icon")).toBeInTheDocument();

    // UserStateコンポーネントが表示されていないことを確認
    expect(screen.queryByTestId("user-state")).not.toBeInTheDocument();
  });

  it("一般ユーザーがログインしている場合、注文リンクが表示されること", () => {
    const mockUser = {
      id: 1,
      email: "user@example.com",
      name: "一般ユーザー",
      passwordHash: "hashed-password",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    mockUseUser.mockReturnValue({ user: mockUser });

    render(<Nav />);

    // ナビゲーションリンクが表示されていることを確認
    const links = screen.getAllByTestId("next-link");
    expect(
      links.some((link) => link.getAttribute("data-href") === "/products")
    ).toBeTruthy();
    expect(
      links.some((link) => link.getAttribute("data-href") === "/cart")
    ).toBeTruthy();
    expect(
      links.some((link) => link.getAttribute("data-href") === "/orders")
    ).toBeTruthy();

    // 管理者用リンクが表示されていないことを確認
    expect(
      links.every(
        (link) => link.getAttribute("data-href") !== "/admin/products"
      )
    ).toBeTruthy();

    // サインインと新規登録のリンクが表示されていないことを確認
    expect(
      links.every((link) => link.getAttribute("data-href") !== "/sign-in")
    ).toBeTruthy();
    expect(
      links.every((link) => link.getAttribute("data-href") !== "/sign-up")
    ).toBeTruthy();

    // UserStateコンポーネントが表示されていることを確認
    expect(screen.getByTestId("user-state")).toBeInTheDocument();
  });

  it("管理者ユーザーがログインしている場合、管理者用リンクが表示されること", () => {
    const mockAdminUser = {
      id: 2,
      email: "admin@example.com",
      name: "管理者ユーザー",
      passwordHash: "hashed-password",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    mockUseUser.mockReturnValue({ user: mockAdminUser });

    render(<Nav />);

    // ナビゲーションリンクが表示されていることを確認
    const links = screen.getAllByTestId("next-link");
    expect(
      links.some((link) => link.getAttribute("data-href") === "/products")
    ).toBeTruthy();
    expect(
      links.some((link) => link.getAttribute("data-href") === "/cart")
    ).toBeTruthy();
    expect(
      links.some((link) => link.getAttribute("data-href") === "/orders")
    ).toBeTruthy();
    expect(
      links.some((link) => link.getAttribute("data-href") === "/admin/products")
    ).toBeTruthy();

    // 管理者用アイコンが表示されていることを確認
    expect(screen.getByTestId("package-icon")).toBeInTheDocument();

    // UserStateコンポーネントが表示されていることを確認
    expect(screen.getByTestId("user-state")).toBeInTheDocument();
  });
});
