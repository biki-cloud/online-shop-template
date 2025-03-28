import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SignOutButton } from "../sign-out-button";
import { signOut } from "@/app/actions/auth";

// DropdownMenuItemコンポーネントのモック
jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenuItem: ({ children, onClick, className }: any) => (
    <button
      data-testid="dropdown-menu-item"
      onClick={onClick}
      className={className}
    >
      {children}
    </button>
  ),
}));

// signOutアクションのモック
jest.mock("@/app/actions/auth", () => ({
  signOut: jest.fn(),
}));

describe("SignOutButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // コンソール出力をモック
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("正しくレンダリングされること", () => {
    render(<SignOutButton />);

    const button = screen.getByTestId("dropdown-menu-item");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("サインアウト");
  });

  it("classNameプロパティが正しく適用されること", () => {
    render(<SignOutButton className="custom-class" />);

    const button = screen.getByTestId("dropdown-menu-item");
    expect(button.className).toContain("custom-class");
  });

  it("クリック時にsignOut関数が呼び出されること", async () => {
    render(<SignOutButton />);

    const button = screen.getByTestId("dropdown-menu-item");
    fireEvent.click(button);

    expect(signOut).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(
      "[SignOutButton] Attempting to sign out"
    );
  });

  it("signOutでエラーが発生した場合にエラーログが出力されること", async () => {
    const error = new Error("Sign out error");
    (signOut as jest.Mock).mockRejectedValueOnce(error);

    render(<SignOutButton />);

    const button = screen.getByTestId("dropdown-menu-item");
    fireEvent.click(button);

    // 非同期処理の完了を待つ
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(console.error).toHaveBeenCalledWith(
      "[SignOutButton] Error during sign out:",
      error
    );
  });
});
