// URL関連のユーティリティ関数のテスト実装

// URL検証関数
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// 画像URLの完全なパスを取得する関数
function getFullImageUrl(
  imageUrl: string | null,
  baseUrl: string = "https://example.com"
): string | undefined {
  if (!imageUrl) return undefined;

  if (isValidUrl(imageUrl)) {
    return imageUrl;
  }

  if (!baseUrl) return undefined;

  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
  const normalizedImageUrl = imageUrl.startsWith("/")
    ? imageUrl
    : `/${imageUrl}`;
  const fullUrl = `${normalizedBaseUrl}${normalizedImageUrl}`;

  return isValidUrl(fullUrl) ? fullUrl : undefined;
}

describe("URL Utilities", () => {
  describe("isValidUrl", () => {
    it("有効なURLを検証すること", () => {
      expect(isValidUrl("https://example.com")).toBe(true);
      expect(isValidUrl("http://localhost:3000")).toBe(true);
      expect(isValidUrl("http://192.168.1.1:8080")).toBe(true);
    });

    it("無効なURLを検出すること", () => {
      expect(isValidUrl("invalid-url")).toBe(false);
      expect(isValidUrl("example.com")).toBe(false);
      expect(isValidUrl("")).toBe(false);
    });
  });

  describe("getFullImageUrl", () => {
    it("nullまたは空文字の場合、undefinedを返すこと", () => {
      expect(getFullImageUrl(null)).toBeUndefined();
      expect(getFullImageUrl("")).toBeUndefined();
    });

    it("すでに完全なURLの場合、そのまま返すこと", () => {
      const fullUrl = "https://external.com/image.jpg";
      expect(getFullImageUrl(fullUrl)).toBe(fullUrl);
    });

    it("相対パスの場合、ベースURLと結合すること", () => {
      expect(getFullImageUrl("image.jpg")).toBe(
        "https://example.com/image.jpg"
      );
      expect(getFullImageUrl("/image.jpg")).toBe(
        "https://example.com/image.jpg"
      );
    });

    it("ベースURLの末尾にスラッシュがある場合、正しく処理すること", () => {
      expect(getFullImageUrl("image.jpg", "https://example.com/")).toBe(
        "https://example.com/image.jpg"
      );
    });

    it("ベースURLが空の場合、undefinedを返すこと", () => {
      expect(getFullImageUrl("image.jpg", "")).toBeUndefined();
    });

    it("カスタムベースURLを使用できること", () => {
      expect(getFullImageUrl("image.jpg", "https://custom.com")).toBe(
        "https://custom.com/image.jpg"
      );
    });
  });
});
