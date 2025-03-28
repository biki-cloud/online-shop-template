import React from "react";
import { render, screen } from "@testing-library/react";
import { UserState } from "../user-state";
import { User } from "@/lib/infrastructure/db/schema";

// Lucide Iconのモック
jest.mock("lucide-react", () => ({
  User: () => <div data-testid="user-icon">UserIcon</div>,
}));

// DropdownMenuコンポーネントのモック
jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu-trigger">{children}</div>
  ),
  DropdownMenuContent: ({ children, align, className }: any) => (
    <div
      data-testid="dropdown-menu-content"
      data-align={align}
      className={className}
    >
      {children}
    </div>
  ),
  DropdownMenuItem: ({ children, asChild, className }: any) => (
    <div
      data-testid="dropdown-menu-item"
      data-as-child={asChild}
      className={className}
    >
      {children}
    </div>
  ),
}));

// Buttonコンポーネントのモック
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, variant, size, className }: any) => (
    <button
      data-testid="button"
      data-variant={variant}
      data-size={size}
      className={className}
    >
      {children}
    </button>
  ),
}));

// SignOutButtonコンポーネントのモック
jest.mock("../sign-out-button", () => ({
  SignOutButton: ({ className }: { className: string }) => (
    <div data-testid="sign-out-button" className={className}>
      サインアウト
    </div>
  ),
}));

// NextJSのLinkコンポーネントのモック
jest.mock(
  "next/link",
  () =>
    function Link({ href, children, className }: any) {
      return (
        <a href={href} data-testid="next-link" className={className}>
          {children}
        </a>
      );
    }
);

describe("UserState", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // コンソール出力をモック
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("ユーザーがログインしていない場合、サインインリンクが表示されること", () => {
    render(<UserState user={null} />);

    // サインインリンクが存在することを確認
    const link = screen.getByTestId("next-link");
    expect(link).toHaveAttribute("href", "/auth/signin");

    // Userアイコンが表示されていることを確認
    expect(screen.getByTestId("user-icon")).toBeInTheDocument();

    // ドロップダウンメニューが存在しないことを確認
    expect(screen.queryByTestId("dropdown-menu")).not.toBeInTheDocument();
  });

  it("ユーザーがログインしている場合、ドロップダウンメニューが表示されること", () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      name: "テストユーザー",
      passwordHash: "hashed-password",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    render(<UserState user={mockUser} />);

    // ドロップダウンメニューが存在することを確認
    expect(screen.getByTestId("dropdown-menu")).toBeInTheDocument();
    expect(screen.getByTestId("dropdown-menu-trigger")).toBeInTheDocument();
    expect(screen.getByTestId("dropdown-menu-content")).toBeInTheDocument();

    // ユーザー情報が表示されていることを確認
    const menuItems = screen.getAllByTestId("dropdown-menu-item");
    expect(menuItems[0]).toHaveTextContent("テストユーザー");
    expect(menuItems[0]).toHaveTextContent("test@example.com");

    // 設定リンクが存在することを確認
    const settingsLink = screen.getByText("設定");
    expect(settingsLink).toBeInTheDocument();

    // サインアウトボタンが存在することを確認
    expect(screen.getByTestId("sign-out-button")).toBeInTheDocument();
  });
});
