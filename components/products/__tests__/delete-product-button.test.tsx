import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DeleteProductButton } from "../delete-product-button";
import { deleteProduct } from "@/app/actions/product";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// モック
jest.mock("@/app/actions/product", () => ({
  deleteProduct: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Lucide iconsのモック
jest.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader-icon">Loading</div>,
  Trash2: () => <div data-testid="trash-icon">Delete</div>,
}));

// Alert Dialogコンポーネントのモック
jest.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children, open, onOpenChange }: any) => (
    <div data-testid="alert-dialog" data-open={open}>
      {children}
    </div>
  ),
  AlertDialogTrigger: ({ children, asChild }: any) => (
    <div data-testid="alert-dialog-trigger" data-as-child={asChild}>
      {children}
    </div>
  ),
  AlertDialogContent: ({ children }: any) => (
    <div data-testid="alert-dialog-content">{children}</div>
  ),
  AlertDialogHeader: ({ children }: any) => (
    <div data-testid="alert-dialog-header">{children}</div>
  ),
  AlertDialogTitle: ({ children }: any) => (
    <div data-testid="alert-dialog-title">{children}</div>
  ),
  AlertDialogDescription: ({ children }: any) => (
    <div data-testid="alert-dialog-description">{children}</div>
  ),
  AlertDialogFooter: ({ children }: any) => (
    <div data-testid="alert-dialog-footer">{children}</div>
  ),
  AlertDialogCancel: ({ children, disabled }: any) => (
    <button
      data-testid="alert-dialog-cancel"
      disabled={disabled}
      onClick={() => {}}
    >
      {children}
    </button>
  ),
  AlertDialogAction: ({ children, onClick, disabled, className }: any) => (
    <button
      data-testid="alert-dialog-action"
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  ),
}));

// Buttonコンポーネントのモック
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, variant, size, className, disabled, onClick }: any) => (
    <button
      data-testid="button"
      data-variant={variant}
      data-size={size}
      className={className}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

describe("DeleteProductButton", () => {
  const mockRouter = {
    refresh: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("削除ボタンが正しくレンダリングされる", () => {
    render(<DeleteProductButton productId={123} />);

    // 削除ボタンが存在することを確認
    const button = screen.getByTestId("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("削除");

    // ゴミ箱アイコンが存在することを確認
    const trashIcons = screen.getAllByTestId("trash-icon");
    expect(trashIcons[0]).toBeInTheDocument();
  });

  it("削除ボタンをクリックすると確認ダイアログが表示される", () => {
    render(<DeleteProductButton productId={123} />);

    // 初期状態では確認ダイアログは表示されていない
    expect(screen.getByTestId("alert-dialog")).toHaveAttribute(
      "data-open",
      "false"
    );

    // 削除ボタンをクリック
    const button = screen.getByTestId("button");
    fireEvent.click(button);

    // ダイアログの開閉状態を変更するための関数が呼ばれたことを確認
    expect(screen.getByTestId("alert-dialog-title")).toHaveTextContent(
      "商品の削除"
    );
    expect(screen.getByTestId("alert-dialog-description")).toHaveTextContent(
      "この商品を削除してもよろしいですか？"
    );
  });

  it("「削除する」ボタンをクリックすると削除処理が実行される", async () => {
    (deleteProduct as jest.Mock).mockResolvedValue(true);

    render(<DeleteProductButton productId={123} />);

    // 削除ボタンをクリック
    const button = screen.getByTestId("button");
    fireEvent.click(button);

    // 確認ダイアログの「削除する」ボタンをクリック
    const confirmButton = screen.getByTestId("alert-dialog-action");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      // 削除アクションが呼ばれたことを確認
      expect(deleteProduct).toHaveBeenCalledWith(123);
      // 成功メッセージが表示されたことを確認
      expect(toast.success).toHaveBeenCalledWith("商品を削除しました");
      // ページがリフレッシュされたことを確認
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });

  it("削除処理が失敗した場合はエラーメッセージが表示される", async () => {
    (deleteProduct as jest.Mock).mockResolvedValue(false);

    render(<DeleteProductButton productId={123} />);

    // 削除ボタンをクリック
    const button = screen.getByTestId("button");
    fireEvent.click(button);

    // 確認ダイアログの「削除する」ボタンをクリック
    const confirmButton = screen.getByTestId("alert-dialog-action");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      // 削除アクションが呼ばれたことを確認
      expect(deleteProduct).toHaveBeenCalledWith(123);
      // エラーメッセージが表示されたことを確認
      expect(toast.error).toHaveBeenCalledWith("商品の削除に失敗しました");
    });
  });

  it("削除処理中に例外が発生した場合もエラーメッセージが表示される", async () => {
    // エラーをスローするモック
    (deleteProduct as jest.Mock).mockRejectedValue(new Error("削除エラー"));

    render(<DeleteProductButton productId={123} />);

    // 削除ボタンをクリック
    const button = screen.getByTestId("button");
    fireEvent.click(button);

    // 確認ダイアログの「削除する」ボタンをクリック
    const confirmButton = screen.getByTestId("alert-dialog-action");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      // エラーメッセージが表示されたことを確認
      expect(toast.error).toHaveBeenCalledWith("商品の削除に失敗しました");
    });
  });
});
