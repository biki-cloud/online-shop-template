import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { uploadFile, deleteFile } from "../storage";

// Supabaseのモック
const mockStorageFrom = {
  upload: jest.fn().mockResolvedValue({
    data: { path: "test.jpg" },
    error: null,
  }),
  remove: jest.fn().mockResolvedValue({
    data: null,
    error: null,
  }),
  getPublicUrl: jest.fn().mockReturnValue({
    data: {
      publicUrl: "https://example.com/test.jpg",
    },
  }),
};

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => mockStorageFrom),
    },
  })),
}));

// crypto.randomUUIDのモック
const mockUUID = "123e4567-e89b-12d3-a456-426614174000";
const mockCrypto = {
  randomUUID: jest.fn(() => mockUUID),
  subtle: {} as SubtleCrypto,
  getRandomValues: jest.fn(),
};
Object.defineProperty(global, "crypto", {
  value: mockCrypto,
  writable: true,
});

describe("Storage Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("uploadFile", () => {
    it("should upload a file successfully", async () => {
      const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });

      const result = await uploadFile(mockFile);

      // ファイルのアップロードが正しく呼び出されたか確認
      expect(mockStorageFrom.upload).toHaveBeenCalledWith(
        `${mockUUID}.jpg`,
        mockFile
      );

      // 公開URLの取得が正しく呼び出されたか確認
      expect(mockStorageFrom.getPublicUrl).toHaveBeenCalledWith(
        `${mockUUID}.jpg`
      );

      // 結果が正しいか確認
      expect(result).toEqual({
        url: "https://example.com/test.jpg",
        fileName: `${mockUUID}.jpg`,
      });
    });

    it("should throw error if upload fails", async () => {
      const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const mockError = new Error("Upload failed");

      // アップロードエラーのモック
      mockStorageFrom.upload.mockResolvedValueOnce({
        data: null,
        error: mockError,
      });

      await expect(uploadFile(mockFile)).rejects.toThrow("Upload failed");
    });

    it("should use custom bucket name", async () => {
      const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const customBucket = "custom-bucket";

      await uploadFile(mockFile, customBucket);

      expect(mockStorageFrom.upload).toHaveBeenCalledWith(
        `${mockUUID}.jpg`,
        mockFile
      );
    });
  });

  describe("deleteFile", () => {
    it("should delete a file successfully", async () => {
      const fileName = "test.jpg";

      await deleteFile(fileName);

      // ファイルの削除が正しく呼び出されたか確認
      expect(mockStorageFrom.remove).toHaveBeenCalledWith([fileName]);
    });

    it("should throw error if delete fails", async () => {
      const fileName = "test.jpg";
      const mockError = new Error("Delete failed");

      // 削除エラーのモック
      mockStorageFrom.remove.mockResolvedValueOnce({
        data: null,
        error: mockError,
      });

      await expect(deleteFile(fileName)).rejects.toThrow("Delete failed");
    });

    it("should use custom bucket name", async () => {
      const fileName = "test.jpg";
      const customBucket = "custom-bucket";

      await deleteFile(fileName, customBucket);

      expect(mockStorageFrom.remove).toHaveBeenCalledWith([fileName]);
    });
  });
});
