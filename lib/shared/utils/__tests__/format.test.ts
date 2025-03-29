import { formatPrice, formatNumber } from "../format";

describe("フォーマットユーティリティ", () => {
  describe("formatPrice", () => {
    it("デフォルト通貨（JPY）で価格を正しくフォーマットすること", () => {
      expect(formatPrice(1000)).toBe("￥1,000");
      expect(formatPrice(1234567)).toBe("￥1,234,567");
      expect(formatPrice(0)).toBe("￥0");
    });

    it("異なる通貨を指定した場合、その通貨記号でフォーマットすること", () => {
      expect(formatPrice(1000, "USD")).toBe("$1,000.00");
      expect(formatPrice(1234.56, "EUR")).toBe("€1,234.56");
    });

    it("小数点以下の価格を正しくフォーマットすること", () => {
      // JPYは小数点以下を表示しない（四捨五入される）
      expect(formatPrice(1000.5)).toBe("￥1,001");

      // 他の通貨は小数点以下を表示する
      expect(formatPrice(1000.5, "USD")).toBe("$1,000.50");
    });

    it("負の価格を正しくフォーマットすること", () => {
      expect(formatPrice(-1000)).toBe("-￥1,000");
      expect(formatPrice(-1000, "USD")).toBe("-$1,000.00");
    });
  });

  describe("formatNumber", () => {
    it("整数を正しくフォーマットすること", () => {
      expect(formatNumber(1000)).toBe("1,000");
      expect(formatNumber(1234567)).toBe("1,234,567");
      expect(formatNumber(0)).toBe("0");
    });

    it("小数点以下の数値を正しくフォーマットすること", () => {
      expect(formatNumber(1000.5)).toBe("1,000.5");
      expect(formatNumber(1234.56)).toBe("1,234.56");
    });

    it("負の数値を正しくフォーマットすること", () => {
      expect(formatNumber(-1000)).toBe("-1,000");
      expect(formatNumber(-1234.56)).toBe("-1,234.56");
    });
  });
});
