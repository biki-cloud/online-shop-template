import { cn } from "../utils";

describe("cn", () => {
  it("文字列を結合すること", () => {
    expect(cn("test-class")).toBe("test-class");
    expect(cn("test-class", "another-class")).toBe("test-class another-class");
  });

  it("条件付きクラスを処理すること", () => {
    expect(cn("base-class", { "conditional-class": true })).toBe(
      "base-class conditional-class"
    );
    expect(cn("base-class", { "conditional-class": false })).toBe("base-class");
  });

  it("配列を処理すること", () => {
    expect(cn("base-class", ["array-class-1", "array-class-2"])).toBe(
      "base-class array-class-1 array-class-2"
    );
  });

  it("tailwindのクラス競合を解決すること", () => {
    expect(cn("p-4", "p-5")).toBe("p-5");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("複雑なケースを処理すること", () => {
    expect(
      cn(
        "base-class",
        {
          "conditional-true": true,
          "conditional-false": false,
        },
        ["array-class"],
        undefined,
        null,
        "final-class"
      )
    ).toBe("base-class conditional-true array-class final-class");
  });
});
