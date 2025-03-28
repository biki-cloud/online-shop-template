import React from "react";
import { render, screen } from "@testing-library/react";
import { AuthHeader } from "../auth-header";

// Lucide Reactのモック
jest.mock("lucide-react", () => ({
  CircleIcon: () => <div data-testid="circle-icon">CircleIcon</div>,
}));

describe("AuthHeader", () => {
  it("サインインモードで正しくレンダリングされること", () => {
    render(<AuthHeader mode="signin" />);

    // アイコンが表示されていることを確認
    expect(screen.getByTestId("circle-icon")).toBeInTheDocument();

    // 見出しテキストが正しいことを確認
    expect(screen.getByText("アカウントにサインイン")).toBeInTheDocument();

    // 説明テキストが正しいことを確認
    expect(
      screen.getByText("オンラインショップへようこそ")
    ).toBeInTheDocument();
  });

  it("サインアップモードで正しくレンダリングされること", () => {
    render(<AuthHeader mode="signup" />);

    // アイコンが表示されていることを確認
    expect(screen.getByTestId("circle-icon")).toBeInTheDocument();

    // 見出しテキストが正しいことを確認
    expect(screen.getByText("新規アカウント作成")).toBeInTheDocument();

    // 説明テキストが正しいことを確認
    expect(
      screen.getByText("簡単な手続きでアカウントを作成できます")
    ).toBeInTheDocument();
  });
});
