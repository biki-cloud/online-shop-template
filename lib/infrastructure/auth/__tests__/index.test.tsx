import React from "react";
import { render, screen, waitFor, renderHook } from "@testing-library/react";
import { UserProvider, useUser } from "../index";
import { User } from "@/lib/infrastructure/db/schema";
import { act } from "react-dom/test-utils";

// コンソールのログ出力をモック
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe("auth context", () => {
  const mockUser: User = {
    id: 1,
    email: "test@example.com",
    name: "Test User",
    passwordHash: "hashed_password",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  it("ユーザープロバイダーは子コンポーネントをレンダリングする", async () => {
    const userPromise = Promise.resolve(mockUser);
    render(
      <UserProvider userPromise={userPromise}>
        <div data-testid="child">テストコンテンツ</div>
      </UserProvider>
    );

    const childElement = screen.getByTestId("child");
    expect(childElement).toBeInTheDocument();
    expect(childElement).toHaveTextContent("テストコンテンツ");

    // userPromiseが解決されるのを待つ
    await waitFor(() => expect(userPromise).resolves.toEqual(mockUser));
  });

  it("useUserはUserProviderコンテキスト内でユーザー情報を返す", async () => {
    const userPromise = Promise.resolve(mockUser);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <UserProvider userPromise={userPromise}>{children}</UserProvider>
    );

    const { result } = renderHook(() => useUser(), {
      wrapper,
    });

    // 初期状態ではuserはnull
    expect(result.current.user).toBeNull();

    // コンテキストにはuserPromiseが含まれている
    expect(result.current.userPromise).toBe(userPromise);

    // userがセットされるのを待つ
    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });
  });

  it("useUserがUserProviderの外部で呼び出されるとエラーを投げる", () => {
    let error: Error | null = null;

    try {
      renderHook(() => useUser());
    } catch (e) {
      error = e as Error;
    }

    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe("useUser must be used within a UserProvider");
  });

  it("UserProviderはuserPromiseが変更されると再レンダリングされる", async () => {
    const firstUserPromise = Promise.resolve(mockUser);
    const updatedUser = { ...mockUser, name: "Updated User" };

    const TestComponent = () => {
      const { user } = useUser();
      return <div data-testid="user-name">{user?.name || "Loading..."}</div>;
    };

    const { rerender } = render(
      <UserProvider userPromise={firstUserPromise}>
        <TestComponent />
      </UserProvider>
    );

    // 最初のユーザー名がレンダリングされるのを待つ
    await waitFor(() => {
      expect(screen.getByTestId("user-name")).toHaveTextContent("Test User");
    });

    // 新しいuserPromiseでコンポーネントを再レンダリング
    const secondUserPromise = Promise.resolve(updatedUser);
    rerender(
      <UserProvider userPromise={secondUserPromise}>
        <TestComponent />
      </UserProvider>
    );

    // 更新されたユーザー名がレンダリングされるのを待つ
    await waitFor(() => {
      expect(screen.getByTestId("user-name")).toHaveTextContent("Updated User");
    });
  });
});
