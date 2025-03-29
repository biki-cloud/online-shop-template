import React from "react";
import { render, act } from "@testing-library/react";
import { ServiceWorkerRegistration } from "../ServiceWorkerRegistration";

describe("ServiceWorkerRegistration", () => {
  // オリジナルのwindow.navigatorを保存
  const originalNavigator = global.navigator;
  // モックのserviceWorker
  const mockServiceWorker = {
    register: jest.fn().mockResolvedValue({ scope: "/" }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // コンソール出力をモック
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // テスト後にオリジナルのnavigatorを復元
    Object.defineProperty(global, "navigator", {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
    // コンソールモックを復元
    jest.restoreAllMocks();
  });

  it("何もレンダリングしない", () => {
    const { container } = render(<ServiceWorkerRegistration />);
    // コンテナが空であることを確認
    expect(container.firstChild).toBeNull();
  });

  it("serviceWorkerがサポートされている場合、registerが呼ばれる", async () => {
    // serviceWorkerをサポートするnavigatorをモック
    Object.defineProperty(global, "navigator", {
      value: {
        ...originalNavigator,
        serviceWorker: mockServiceWorker,
      },
      writable: true,
      configurable: true,
    });

    render(<ServiceWorkerRegistration />);

    // register関数が正しいパスで呼び出されたか確認
    expect(mockServiceWorker.register).toHaveBeenCalledWith(
      "/service-worker.js"
    );

    // Promiseが解決されるのを待つ
    await act(async () => {
      await Promise.resolve();
    });

    // 成功ログが出力されることを確認
    expect(console.log).toHaveBeenCalledWith(
      "Service Worker registered:",
      expect.anything()
    );
  });

  it("serviceWorkerがサポートされていない場合、エラーにならない", () => {
    // serviceWorkerをサポートしないnavigatorをモック
    Object.defineProperty(global, "navigator", {
      value: {
        ...originalNavigator,
        // serviceWorkerプロパティを完全に削除
      },
      writable: true,
      configurable: true,
    });

    // エラーがスローされないことを確認
    expect(() => render(<ServiceWorkerRegistration />)).not.toThrow();
    // register関数が呼び出されないことを確認
    expect(mockServiceWorker.register).not.toHaveBeenCalled();
  });

  it("register処理でエラーが発生した場合、エラーログが出力される", async () => {
    // registerがエラーをスローするようモック
    const mockError = new Error("Registration failed");
    const errorServiceWorker = {
      register: jest.fn().mockImplementation(() => {
        return Promise.reject(mockError);
      }),
    };

    // serviceWorkerをサポートするnavigatorをモック
    Object.defineProperty(global, "navigator", {
      value: {
        ...originalNavigator,
        serviceWorker: errorServiceWorker,
      },
      writable: true,
      configurable: true,
    });

    render(<ServiceWorkerRegistration />);

    // register関数が呼び出されたことを確認
    expect(errorServiceWorker.register).toHaveBeenCalledWith(
      "/service-worker.js"
    );

    // エラーを待つ
    await act(async () => {
      // すべてのPromiseが解決または拒否されるのを待つ
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // エラーログが出力されることを確認
    expect(console.error).toHaveBeenCalledWith(
      "Service Worker registration failed:",
      mockError
    );
  });
});
