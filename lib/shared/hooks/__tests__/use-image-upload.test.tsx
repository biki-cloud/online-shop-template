import { renderHook, act } from "@testing-library/react";
import { useImageUpload } from "../use-image-upload";
import { UseFormSetValue } from "react-hook-form";
import { ProductFormValues } from "../../validations/product";

// モックの設定
const mockFetch = jest.fn();
global.fetch = mockFetch;

// コンソールエラーをモック化（エラーケースのテスト用）
const originalConsoleError = console.error;
console.error = jest.fn();

describe("useImageUpload", () => {
  // テスト前の準備
  const mockSetValue = jest.fn() as jest.MockedFunction<
    UseFormSetValue<ProductFormValues>
  >;
  const initialImageUrl = "https://example.com/initial-image.jpg";

  // モックファイル作成ヘルパー
  const createMockFileEvent = (file?: File) => {
    const mockEvent = {
      target: {
        files: file ? [file] : [],
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    return mockEvent;
  };

  // モックファイル
  const mockFile = new File(["dummy content"], "test-image.png", {
    type: "image/png",
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it("初期画像URLで正しく初期化されること", () => {
    const { result } = renderHook(() =>
      useImageUpload(initialImageUrl, mockSetValue)
    );

    expect(result.current.imagePreview).toBe(initialImageUrl);
  });

  it("空の初期値で正しく初期化されること", () => {
    const { result } = renderHook(() => useImageUpload(null, mockSetValue));

    expect(result.current.imagePreview).toBeNull();
  });

  it("ファイルがない場合は何も処理しないこと", async () => {
    const { result } = renderHook(() =>
      useImageUpload(initialImageUrl, mockSetValue)
    );

    await act(async () => {
      await result.current.handleImageUpload(createMockFileEvent());
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockSetValue).not.toHaveBeenCalled();
    expect(result.current.imagePreview).toBe(initialImageUrl);
  });

  it("ファイルがある場合、アップロードしてURLを設定すること", async () => {
    // 成功レスポンスをモック
    const mockResponse = {
      ok: true,
      json: jest
        .fn()
        .mockResolvedValue({ url: "https://example.com/uploaded-image.jpg" }),
    };
    mockFetch.mockResolvedValue(mockResponse);

    const { result } = renderHook(() =>
      useImageUpload(initialImageUrl, mockSetValue)
    );

    await act(async () => {
      await result.current.handleImageUpload(createMockFileEvent(mockFile));
    });

    // FormDataの検証は難しいので、fetchが呼ばれたことだけ確認
    expect(mockFetch).toHaveBeenCalledWith("/api/upload", expect.any(Object));

    // 値が正しく設定されていることを確認
    expect(mockSetValue).toHaveBeenCalledWith(
      "imageUrl",
      "https://example.com/uploaded-image.jpg"
    );
    expect(result.current.imagePreview).toBe(
      "https://example.com/uploaded-image.jpg"
    );
  });

  it("アップロード失敗時にエラーをスローすること", async () => {
    // 失敗レスポンスをモック
    const mockResponse = {
      ok: false,
    };
    mockFetch.mockResolvedValue(mockResponse);

    const { result } = renderHook(() =>
      useImageUpload(initialImageUrl, mockSetValue)
    );

    await expect(
      act(async () => {
        await result.current.handleImageUpload(createMockFileEvent(mockFile));
      })
    ).rejects.toThrow("画像のアップロードに失敗しました");

    expect(mockFetch).toHaveBeenCalledWith("/api/upload", expect.any(Object));
    expect(mockSetValue).not.toHaveBeenCalled();
    expect(result.current.imagePreview).toBe(initialImageUrl);
    expect(console.error).toHaveBeenCalled();
  });

  it("フェッチ中にエラーが発生した場合、エラーをスローすること", async () => {
    // ネットワークエラーなどをシミュレート
    mockFetch.mockRejectedValue(new Error("ネットワークエラー"));

    const { result } = renderHook(() =>
      useImageUpload(initialImageUrl, mockSetValue)
    );

    await expect(
      act(async () => {
        await result.current.handleImageUpload(createMockFileEvent(mockFile));
      })
    ).rejects.toThrow("ネットワークエラー");

    expect(mockFetch).toHaveBeenCalledWith("/api/upload", expect.any(Object));
    expect(mockSetValue).not.toHaveBeenCalled();
    expect(result.current.imagePreview).toBe(initialImageUrl);
    expect(console.error).toHaveBeenCalled();
  });
});
