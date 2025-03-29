import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { AdminProductForm } from "@/components/admin/products/product-form";
import { useRouter } from "next/navigation";
import * as productActions from "@/app/actions/product";
import * as storageModule from "@/lib/infrastructure/storage/storage";
import { Product } from "@/lib/infrastructure/db/schema";

// モック
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} data-testid="next-image" />;
  },
}));

jest.mock("@/lib/infrastructure/storage/storage", () => ({
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
}));

jest.mock("@/app/actions/product", () => ({
  updateProduct: jest.fn(),
}));

// UIコンポーネントのモック
jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="card-title">{children}</h2>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    variant,
    size,
    type,
    onClick,
    className,
    ...props
  }: any) => (
    <button
      data-testid={props["data-testid"] || "button"}
      data-variant={variant}
      data-size={size}
      type={type}
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/label", () => ({
  Label: ({ children, htmlFor, ...props }: any) => (
    <label
      data-testid={`label-${htmlFor || "generic"}`}
      htmlFor={htmlFor}
      className="text-base"
      {...props}
    >
      {children}
    </label>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({ ...props }: any) => (
    <input
      data-testid={`input-${props.name || "generic"}`}
      className="h-11"
      {...props}
    />
  ),
}));

jest.mock("@/components/ui/textarea", () => ({
  Textarea: ({ ...props }: any) => (
    <textarea
      data-testid={`textarea-${props.name || "generic"}`}
      className="resize-none"
      {...props}
    />
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

jest.mock("lucide-react", () => ({
  ArrowLeft: () => <div data-testid="arrow-left-icon">ArrowLeft</div>,
  Upload: () => <div data-testid="upload-icon">Upload</div>,
  Trash2: () => <div data-testid="trash-icon">Trash2</div>,
}));

// テストに使用するモック商品
const mockProduct: Product = {
  id: 123,
  name: "テスト商品",
  description: "商品の説明文",
  price: "1000",
  currency: "JPY",
  imageUrl: "https://example.com/test-image.jpg",
  stock: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
};

describe("AdminProductForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("フォームが正しく表示される", () => {
    render(<AdminProductForm product={mockProduct} />);

    // タイトルが正しく表示されていることを確認
    expect(screen.getByTestId("card-title")).toHaveTextContent("商品の編集");

    // 商品情報が正しく表示されていることを確認
    expect(screen.getByTestId("input-name")).toHaveAttribute(
      "value",
      "テスト商品"
    );
    expect(screen.getByTestId("textarea-description")).toHaveTextContent(
      "商品の説明文"
    );
    expect(screen.getByTestId("input-price")).toHaveAttribute("value", "1000");
    expect(screen.getByTestId("input-stock")).toHaveAttribute("value", "10");
    expect(screen.getByTestId("next-image")).toHaveAttribute(
      "src",
      "https://example.com/test-image.jpg"
    );
  });

  it("戻るボタンが正しく動作する", () => {
    render(<AdminProductForm product={mockProduct} />);

    // 戻るボタンを見つけてクリック
    const backButton = screen.getByText("戻る");
    fireEvent.click(backButton);

    // router.back()が呼ばれたことを確認
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it("フォーム送信が正しく動作する", async () => {
    (productActions.updateProduct as jest.Mock).mockResolvedValue({
      success: true,
    });

    render(<AdminProductForm product={mockProduct} />);

    // フォームの値を変更
    const nameInput = screen.getByTestId("input-name");
    fireEvent.change(nameInput, { target: { value: "更新された商品名" } });

    // フォームを送信
    const submitButton = screen.getByText("更新する");
    fireEvent.click(submitButton);

    // 更新処理が呼ばれたことを確認
    await waitFor(() => {
      expect(productActions.updateProduct).toHaveBeenCalledWith(
        123,
        expect.objectContaining({
          name: "更新された商品名",
        })
      );
    });
  });

  it("画像のアップロードが正しく動作する", async () => {
    (storageModule.uploadFile as jest.Mock).mockResolvedValue({
      url: "/new-image.jpg",
      fileName: "new-image.jpg",
    });

    render(<AdminProductForm product={mockProduct} />);

    // ファイル選択
    const file = new File(["dummy content"], "test.png", {
      type: "image/png",
    });
    const fileInput = screen.getByTestId("input-image");
    fireEvent.change(fileInput, { target: { files: [file] } });

    // アップロード処理が呼ばれたことを確認
    await waitFor(() => {
      expect(storageModule.uploadFile).toHaveBeenCalledWith(file);
    });
  });

  it("画像の削除が正しく動作する", async () => {
    // URLコンストラクタをモックしてパスが正しく解析されるようにする
    const originalURL = global.URL;
    global.URL = jest.fn(() => ({
      pathname: "/test-image.jpg",
    })) as any;

    // deleteFileのモックを設定
    (storageModule.deleteFile as jest.Mock).mockResolvedValue({
      success: true,
    });

    render(<AdminProductForm product={mockProduct} />);

    // 削除ボタンを探す
    const trashIcon = screen.getByTestId("trash-icon");
    const deleteButton = trashIcon.closest("button");

    if (!deleteButton) throw new Error("削除ボタンが見つかりません");

    // 削除ボタンをクリック
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(storageModule.deleteFile).toHaveBeenCalledWith("test-image.jpg");
    });

    // モックをリストア
    global.URL = originalURL;
  });

  it("フォーム送信エラーを正しく処理する", async () => {
    // エラーを発生させる
    (productActions.updateProduct as jest.Mock).mockRejectedValue(
      new Error("更新エラー")
    );

    render(<AdminProductForm product={mockProduct} />);

    // フォームを送信
    const submitButton = screen.getByText("更新する");
    fireEvent.click(submitButton);

    // エラーが発生したことを確認（エラーハンドリングは内部で行われる）
    await waitFor(() => {
      expect(productActions.updateProduct).toHaveBeenCalled();
    });
  });

  it("画像アップロードエラーを正しく処理する", async () => {
    // エラーを発生させる
    (storageModule.uploadFile as jest.Mock).mockRejectedValue(
      new Error("アップロードエラー")
    );

    render(<AdminProductForm product={mockProduct} />);

    // ファイル選択
    const file = new File(["dummy content"], "test.png", {
      type: "image/png",
    });
    const fileInput = screen.getByTestId("input-image");
    fireEvent.change(fileInput, { target: { files: [file] } });

    // エラーが発生したことを確認（エラーハンドリングは内部で行われる）
    await waitFor(() => {
      expect(storageModule.uploadFile).toHaveBeenCalled();
    });
  });
});
