import { cn } from "../index";

describe("クラス名ユーティリティ", () => {
  describe("cn", () => {
    it("単一の文字列クラス名を処理できること", () => {
      expect(cn("text-red-500")).toBe("text-red-500");
    });

    it("複数のクラス名を結合できること", () => {
      expect(cn("text-red-500", "bg-blue-200", "p-4")).toBe(
        "text-red-500 bg-blue-200 p-4"
      );
    });

    it("条件付きクラス名を処理できること", () => {
      const isActive = true;
      const isPrimary = false;

      expect(
        cn("base-class", isActive && "active", isPrimary && "primary")
      ).toBe("base-class active");
    });

    it("クラス名の配列を処理できること", () => {
      expect(cn(["text-red-500", "p-4"])).toBe("text-red-500 p-4");
    });

    it("オブジェクト形式のクラス名を処理できること", () => {
      expect(
        cn({
          "text-red-500": true,
          "bg-blue-200": true,
          rounded: false,
        })
      ).toBe("text-red-500 bg-blue-200");
    });

    it("様々な形式の入力を混在させて処理できること", () => {
      const isDisabled = true;

      expect(
        cn("base-class", ["flex", "items-center"], {
          "opacity-50": isDisabled,
          "cursor-not-allowed": isDisabled,
        })
      ).toBe("base-class flex items-center opacity-50 cursor-not-allowed");
    });

    it("Tailwindのユーティリティの衝突を解決できること", () => {
      // p-4とp-6が衝突している場合、後者が優先される
      expect(cn("p-4", "p-6")).toBe("p-6");

      // text-redとtext-blueの衝突
      expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    });
  });
});
