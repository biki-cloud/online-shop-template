import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductImage } from "../product-image";

// Next.jsのImageコンポーネントのモック
jest.mock(
  "next/image",
  () =>
    function Image({
      src,
      alt,
      fill,
      className,
      sizes,
      onError,
      priority,
    }: any) {
      return (
        <img
          src={src}
          alt={alt}
          data-testid="next-image"
          className={className}
          data-fill={fill ? "true" : "false"}
          data-sizes={sizes}
          data-priority={priority ? "true" : "false"}
          onError={onError}
        />
      );
    }
);

describe("ProductImage", () => {
  it("有効な画像ソースが提供された場合、その画像を表示すること", () => {
    const testSrc = "/images/test-product.jpg";
    const testAlt = "テスト商品";

    render(<ProductImage src={testSrc} alt={testAlt} />);

    const image = screen.getByTestId("next-image");
    expect(image).toHaveAttribute("src", testSrc);
    expect(image).toHaveAttribute("alt", testAlt);
    expect(image).toHaveAttribute("data-fill", "true");
    expect(image).toHaveAttribute("data-priority", "false");
  });

  it("画像ソースがnullの場合、プレースホルダー画像を表示すること", () => {
    const testAlt = "テスト商品";

    render(<ProductImage src={null} alt={testAlt} />);

    const image = screen.getByTestId("next-image");
    expect(image).toHaveAttribute("src", "/images/product-placeholder.jpg");
    expect(image).toHaveAttribute("alt", testAlt);
  });

  it("priorityプロパティが渡された場合、優先度が高い画像として扱われること", () => {
    const testSrc = "/images/test-product.jpg";
    const testAlt = "テスト商品";

    render(<ProductImage src={testSrc} alt={testAlt} priority />);

    const image = screen.getByTestId("next-image");
    expect(image).toHaveAttribute("data-priority", "true");
  });

  it("画像読み込みエラーが発生した場合、プレースホルダー画像が表示されること", () => {
    const testSrc = "/images/test-product.jpg";
    const testAlt = "テスト商品";

    render(<ProductImage src={testSrc} alt={testAlt} />);

    const image = screen.getByTestId("next-image");
    expect(image).toHaveAttribute("src", testSrc);

    // エラーイベントを発火
    fireEvent.error(image);

    // エラー後はプレースホルダー画像に切り替わる
    expect(image).toHaveAttribute("src", "/images/product-placeholder.jpg");
  });
});
