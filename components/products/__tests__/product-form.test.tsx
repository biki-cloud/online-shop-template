import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProductForm } from "../product-form";
import { useRouter } from "next/navigation";
import { useImageUpload } from "@/lib/shared/hooks/use-image-upload";
import { toast } from "sonner";

// モック
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/lib/shared/hooks/use-image-upload", () => ({
  useImageUpload: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Framer Motionのモック
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// UIコンポーネントのモック
jest.mock("@/components/ui/form", () => ({
  Form: ({ ...props }: any) => <form {...props} />,
  FormField: ({ control, name, render }: any) => (
    <div data-testid={`form-field-${name}`}>
      {render({
        field: {
          name,
          value: "",
          onChange: jest.fn(),
          onBlur: jest.fn(),
          ref: jest.fn(),
        },
      })}
    </div>
  ),
  FormItem: ({ children }: any) => (
    <div data-testid="form-item">{children}</div>
  ),
  FormLabel: ({ children }: any) => (
    <label data-testid="form-label">{children}</label>
  ),
  FormControl: ({ children }: any) => (
    <div data-testid="form-control">{children}</div>
  ),
  FormMessage: () => <div data-testid="form-message"></div>,
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({ type, name, placeholder, className, ...props }: any) => (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      className={className}
      data-testid={`input-${name || "generic"}`}
      {...props}
    />
  ),
}));

jest.mock("@/components/ui/textarea", () => ({
  Textarea: ({ name, placeholder, className, ...props }: any) => (
    <textarea
      name={name}
      placeholder={placeholder}
      className={className}
      data-testid={`textarea-${name || "generic"}`}
      {...props}
    />
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, type, variant, size, onClick, ...props }: any) => (
    <button
      type={type}
      data-variant={variant}
      data-size={size}
      onClick={onClick}
      data-testid="button"
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => (
    <img
      data-testid="next-image"
      src={props.src}
      alt={props.alt}
      className={props.className}
    />
  ),
}));

jest.mock("lucide-react", () => ({
  Package: () => <div data-testid="package-icon">Package</div>,
  Upload: () => <div data-testid="upload-icon">Upload</div>,
  ArrowLeft: () => <div data-testid="arrow-left-icon">ArrowLeft</div>,
}));

// React Hook Formのモック
jest.mock("react-hook-form", () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (onSubmit: any) => (data: any) => onSubmit(data),
    setValue: jest.fn(),
    formState: {
      isSubmitting: false,
    },
  }),
}));

describe("ProductForm", () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
  };

  const mockImageUpload = {
    imagePreview: "/test-image.jpg",
    handleImageUpload: jest.fn(),
  };

  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useImageUpload as jest.Mock).mockReturnValue(mockImageUpload);
    mockOnSubmit.mockResolvedValue({ success: true });
  });

  it("フォームが正しくレンダリングされる", () => {
    render(
      <ProductForm
        initialData={{
          name: "テスト商品",
          description: "テスト説明",
          price: 1000,
          stock: 10,
          currency: "JPY",
          imageUrl: "/test-image.jpg",
        }}
        onSubmit={mockOnSubmit}
      />
    );

    // 各フォームフィールドが存在することを確認
    expect(screen.getByTestId("form-field-name")).toBeInTheDocument();
    expect(screen.getByTestId("form-field-description")).toBeInTheDocument();
    expect(screen.getByTestId("form-field-price")).toBeInTheDocument();
    expect(screen.getByTestId("form-field-stock")).toBeInTheDocument();
    expect(screen.getByTestId("form-field-imageUrl")).toBeInTheDocument();

    // ラベルが正しく表示されていることを確認
    const labels = screen.getAllByTestId("form-label");
    expect(labels.some((label) => label.textContent === "商品名")).toBeTruthy();
    expect(
      labels.some((label) => label.textContent === "商品説明")
    ).toBeTruthy();
    expect(labels.some((label) => label.textContent === "価格")).toBeTruthy();
    expect(labels.some((label) => label.textContent === "在庫数")).toBeTruthy();
    expect(
      labels.some((label) => label.textContent === "商品画像")
    ).toBeTruthy();

    // 画像プレビューが表示されていることを確認
    expect(screen.getByTestId("next-image")).toBeInTheDocument();
    expect(screen.getByTestId("next-image")).toHaveAttribute(
      "src",
      "/test-image.jpg"
    );

    // ボタンが表示されていることを確認
    const buttons = screen.getAllByTestId("button");
    expect(
      buttons.some((button) => button.textContent === "保存")
    ).toBeTruthy();
    expect(
      buttons.some((button) => button.textContent?.includes("戻る"))
    ).toBeTruthy();
  });

  it("保存ボタンをクリックするとonSubmit関数が呼び出される", async () => {
    render(<ProductForm onSubmit={mockOnSubmit} />);

    // フォームの代わりに保存ボタンをクリックしてフォーム送信をシミュレート
    const saveButton = screen.getByText("保存");
    fireEvent.click(saveButton);

    // onSubmit関数が呼び出されたことを確認
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    // 送信成功時のリダイレクトとトースト表示を確認
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("商品を保存しました");
      expect(mockRouter.push).toHaveBeenCalledWith("/admin/products");
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });

  it("戻るボタンをクリックするとrouter.back()が呼び出される", () => {
    render(<ProductForm onSubmit={mockOnSubmit} />);

    // 戻るボタンを探してクリック
    const backButton = screen
      .getAllByTestId("button")
      .find((button) => button.textContent?.includes("戻る"));
    if (backButton) {
      fireEvent.click(backButton);
    }

    // router.back()が呼び出されたことを確認
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it("送信処理が失敗した場合はエラーメッセージが表示される", async () => {
    mockOnSubmit.mockResolvedValue({
      success: false,
      error: "保存に失敗しました",
    });

    render(<ProductForm onSubmit={mockOnSubmit} />);

    // 保存ボタンをクリックしてフォーム送信をシミュレート
    const saveButton = screen.getByText("保存");
    fireEvent.click(saveButton);

    // エラーメッセージが表示されたことを確認
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("保存に失敗しました");
    });
  });

  it("送信処理中に例外が発生した場合もエラーメッセージが表示される", async () => {
    mockOnSubmit.mockRejectedValue(new Error("送信エラー"));

    render(<ProductForm onSubmit={mockOnSubmit} />);

    // 保存ボタンをクリックしてフォーム送信をシミュレート
    const saveButton = screen.getByText("保存");
    fireEvent.click(saveButton);

    // エラーメッセージが表示されたことを確認
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("商品の保存に失敗しました");
    });
  });

  it("画像が選択されると画像アップロード処理が実行される", () => {
    render(<ProductForm onSubmit={mockOnSubmit} />);

    // 画像入力フィールドを探す
    const fileInput = screen.getByTestId("input-generic");

    // ファイル選択イベントを発生させる
    const file = new File(["dummy content"], "test.png", {
      type: "image/png",
    });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // 画像アップロード処理が呼び出されたことを確認
    expect(mockImageUpload.handleImageUpload).toHaveBeenCalled();
  });
});
