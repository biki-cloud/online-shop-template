import { isValidUrl, getFullImageUrl } from "../url";
import { container } from "tsyringe";

// モック化
jest.mock("tsyringe", () => ({
  container: {
    resolve: jest.fn(),
  },
}));

// UrlServiceを直接インポートせず、モックのみを使用
jest.mock("@/lib/core/services/url.service.impl", () => ({
  UrlService: jest.fn().mockImplementation(() => ({
    getBaseUrl: jest.fn(),
  })),
}));

describe("URL ユーティリティ", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("isValidUrl", () => {
    it("有効なURLを検証すること", () => {
      expect(isValidUrl("https://example.com")).toBe(true);
      expect(isValidUrl("http://localhost:3000")).toBe(true);
      expect(isValidUrl("http://192.168.1.1:8080")).toBe(true);
      expect(isValidUrl("https://subdomain.example.co.jp/path?query=123")).toBe(
        true
      );
    });

    it("無効なURLを検出すること", () => {
      expect(isValidUrl("invalid-url")).toBe(false);
      expect(isValidUrl("example.com")).toBe(false);
      expect(isValidUrl("")).toBe(false);
      expect(isValidUrl("//example.com/path")).toBe(false);
    });
  });

  describe("getFullImageUrl", () => {
    const mockUrlService = {
      getBaseUrl: jest.fn(),
    };

    beforeEach(() => {
      (container.resolve as jest.Mock).mockReturnValue(mockUrlService);
      mockUrlService.getBaseUrl.mockReturnValue("https://example.com");
    });

    it("nullまたは空文字の場合、undefinedを返すこと", () => {
      expect(getFullImageUrl(null)).toBeUndefined();
    });

    it("すでに完全なURLの場合、そのまま返すこと", () => {
      const fullUrl = "https://external.com/image.jpg";
      expect(getFullImageUrl(fullUrl)).toBe(fullUrl);
      expect(mockUrlService.getBaseUrl).not.toHaveBeenCalled();
    });

    it("相対パスの場合、ベースURLと結合すること", () => {
      expect(getFullImageUrl("image.jpg")).toBe(
        "https://example.com/image.jpg"
      );
      expect(mockUrlService.getBaseUrl).toHaveBeenCalled();
    });

    it("スラッシュで始まる相対パスを正しく処理すること", () => {
      expect(getFullImageUrl("/image.jpg")).toBe(
        "https://example.com/image.jpg"
      );
      expect(mockUrlService.getBaseUrl).toHaveBeenCalled();
    });

    it("ベースURLの末尾にスラッシュがある場合、正しく処理すること", () => {
      mockUrlService.getBaseUrl.mockReturnValue("https://example.com/");
      expect(getFullImageUrl("image.jpg")).toBe(
        "https://example.com/image.jpg"
      );
    });

    it("ベースURLが空の場合、undefinedを返すこと", () => {
      mockUrlService.getBaseUrl.mockReturnValue("");
      expect(getFullImageUrl("image.jpg")).toBeUndefined();
    });

    it("結合した結果が無効なURLの場合、undefinedを返すこと", () => {
      mockUrlService.getBaseUrl.mockReturnValue("invalid-base-url");
      expect(getFullImageUrl("image.jpg")).toBeUndefined();
    });
  });
});
