import { calculateTaxIncluded, calculateOrderAmount, TAX_RATE } from "../index";

describe("税計算ユーティリティ", () => {
  describe("calculateTaxIncluded", () => {
    it("税抜価格から税込価格を正しく計算すること", () => {
      expect(calculateTaxIncluded(1000)).toBe(1100); // 1000 * 1.1 = 1100
      expect(calculateTaxIncluded(0)).toBe(0); // 0 * 1.1 = 0
      expect(calculateTaxIncluded(999)).toBe(1099); // 999 * 1.1 = 1098.9 -> 1099（四捨五入）
    });

    it("小数点以下の価格を正しく丸めること", () => {
      // 123.45 * 1.1 = 135.795 -> 136（四捨五入）
      expect(calculateTaxIncluded(123.45)).toBe(136);

      // 555.5 * 1.1 = 611.05 -> 611（四捨五入）
      expect(calculateTaxIncluded(555.5)).toBe(611);
    });

    it("負の価格を正しく処理すること", () => {
      // -1000 * 1.1 = -1100
      expect(calculateTaxIncluded(-1000)).toBe(-1100);
    });
  });

  describe("calculateOrderAmount", () => {
    it("小計から税額と合計を正しく計算すること", () => {
      const result1 = calculateOrderAmount(1000);
      expect(result1.tax).toBe(100); // 1000 * 0.1 = 100
      expect(result1.total).toBe(1100); // 1000 + 100 = 1100

      const result2 = calculateOrderAmount(0);
      expect(result2.tax).toBe(0);
      expect(result2.total).toBe(0);
    });

    it("小数点以下の小計を正しく処理すること", () => {
      const result = calculateOrderAmount(1234.56);
      // 1234.56 * 0.1 = 123.456 -> 123（四捨五入）
      expect(result.tax).toBe(123);
      expect(result.total).toBe(1357.56); // 1234.56 + 123 = 1357.56
    });

    it("負の小計を正しく処理すること", () => {
      const result = calculateOrderAmount(-1000);
      expect(result.tax).toBe(-100);
      expect(result.total).toBe(-1100);
    });
  });

  describe("TAX_RATE", () => {
    it("税率が10%であること", () => {
      expect(TAX_RATE).toBe(0.1);
    });
  });
});
