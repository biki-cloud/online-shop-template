import "reflect-metadata";
import { UrlService } from "../url.service.impl";

describe("UrlService", () => {
  let urlService: UrlService;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    urlService = new UrlService();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("getBaseUrl", () => {
    it("VERCELのURLが設定されている場合、それを使用すること", () => {
      process.env.VERCEL_URL = "example-vercel.com";
      expect(urlService.getBaseUrl()).toBe("https://example-vercel.com");
    });

    it("VERCELのURLが設定されていない場合、BASE_URLを使用すること", () => {
      process.env.VERCEL_URL = undefined;
      process.env.BASE_URL = "https://example-base.com";
      expect(urlService.getBaseUrl()).toBe("https://example-base.com");
    });

    it("どちらのURLも設定されていない場合、デフォルト値を使用すること", () => {
      process.env.VERCEL_URL = undefined;
      process.env.BASE_URL = undefined;
      expect(urlService.getBaseUrl()).toBe("http://localhost:3000");
    });
  });

  describe("getFullUrl", () => {
    beforeEach(() => {
      process.env.BASE_URL = "https://example.com";
    });

    it("パスを与えられたとき、完全なURLを返すこと", () => {
      expect(urlService.getFullUrl("test")).toBe("https://example.com/test");
    });

    it("スラッシュで始まるパスを与えられたとき、スラッシュを正規化すること", () => {
      expect(urlService.getFullUrl("/test")).toBe("https://example.com/test");
    });

    it("ベースURLの末尾にスラッシュがある場合、正しく処理すること", () => {
      process.env.BASE_URL = "https://example.com/";
      expect(urlService.getFullUrl("test")).toBe("https://example.com/test");
    });
  });

  describe("isValidUrl", () => {
    it("有効なURLを検証すること", () => {
      expect(urlService.isValidUrl("https://example.com")).toBe(true);
      expect(urlService.isValidUrl("http://localhost:3000")).toBe(true);
      expect(urlService.isValidUrl("http://192.168.1.1:8080")).toBe(true);
    });

    it("無効なURLを検出すること", () => {
      expect(urlService.isValidUrl("invalid-url")).toBe(false);
      expect(urlService.isValidUrl("example.com")).toBe(false);
      expect(urlService.isValidUrl("")).toBe(false);
    });
  });
});
