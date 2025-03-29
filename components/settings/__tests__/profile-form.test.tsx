import React from "react";
import { render, screen } from "@testing-library/react";
import { ProfileForm } from "../profile-form";
import { User } from "@/lib/infrastructure/db/schema";

// Lucide Reactのモック
jest.mock("lucide-react", () => ({
  Mail: () => <div data-testid="mail-icon">MailIcon</div>,
  User: () => <div data-testid="user-icon">UserIcon</div>,
  Shield: () => <div data-testid="shield-icon">ShieldIcon</div>,
  Calendar: () => <div data-testid="calendar-icon">CalendarIcon</div>,
}));

// Framer Motionのモック
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} data-testid="motion-div">
        {children}
      </div>
    ),
  },
}));

describe("ProfileForm", () => {
  const mockUser: Partial<User> = {
    id: 1,
    email: "test@example.com",
    name: "テストユーザー",
    role: "user",
    passwordHash: "hashedpassword",
    createdAt: new Date("2023-01-01T00:00:00.000Z"),
    updatedAt: new Date(),
    deletedAt: null,
  };

  it("ユーザー情報が正しく表示される", () => {
    render(<ProfileForm user={mockUser as User} />);

    // メールアドレスが表示されていることを確認
    expect(screen.getByTestId("mail-icon")).toBeInTheDocument();
    expect(screen.getByText("メールアドレス")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();

    // 名前が表示されていることを確認
    expect(screen.getByTestId("user-icon")).toBeInTheDocument();
    expect(screen.getByText("名前")).toBeInTheDocument();
    expect(screen.getByText("テストユーザー")).toBeInTheDocument();

    // ロールが表示されていることを確認
    expect(screen.getByTestId("shield-icon")).toBeInTheDocument();
    expect(screen.getByText("ロール")).toBeInTheDocument();
    expect(screen.getByText("user")).toBeInTheDocument();

    // アカウント作成日が表示されていることを確認
    expect(screen.getByTestId("calendar-icon")).toBeInTheDocument();
    expect(screen.getByText("アカウント作成日")).toBeInTheDocument();

    // 日付のフォーマットはロケールに依存するので、何らかの日付表示があることだけ確認
    const datePattern = /\d{1,4}[\/\-\.年月日\s]+/;
    const dateElements = screen.getAllByText(datePattern);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it("名前が未設定の場合は「未設定」と表示される", () => {
    const userWithoutName = {
      ...mockUser,
      name: null,
    };

    render(<ProfileForm user={userWithoutName as User} />);

    // 名前が「未設定」と表示されていることを確認
    expect(screen.getByText("未設定")).toBeInTheDocument();
  });

  it("管理者ロールのユーザー情報が正しく表示される", () => {
    const adminUser = {
      ...mockUser,
      role: "admin",
    };

    render(<ProfileForm user={adminUser as User} />);

    // ロールが「admin」と表示されていることを確認
    expect(screen.getByText("admin")).toBeInTheDocument();
  });
});
