"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/hooks/useAuth";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface AuthFormProps {
  mode: "signin" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const searchParams = useSearchParams();
  const { signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === "signin") {
        await signIn(formData.email, formData.password);
      } else {
        await signUp(formData.email, formData.password, formData.name);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "signin" ? "サインイン" : "アカウント作成"}
        </CardTitle>
        <CardDescription>
          {mode === "signin"
            ? "アカウントにサインインしてください。"
            : "新しいアカウントを作成してください。"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">名前</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="名前を入力してください"
                className="w-full"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="メールアドレスを入力してください"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              placeholder="パスワードを入力してください"
              className="w-full"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700">{error}</div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "signin" ? "サインイン中..." : "アカウント作成中..."}
              </>
            ) : mode === "signin" ? (
              "サインイン"
            ) : (
              "アカウント作成"
            )}
          </Button>

          {mode === "signin" && (
            <div className="text-center mt-4">
              <Link
                href="/auth/reset-password"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                パスワードをお忘れですか？
              </Link>
            </div>
          )}

          <div className="text-center mt-4">
            {mode === "signin" ? (
              <p className="text-sm text-gray-600">
                アカウントをお持ちでない方は{" "}
                <Link
                  href="/sign-up"
                  className="text-blue-600 hover:text-blue-800"
                >
                  こちら
                </Link>
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                すでにアカウントをお持ちの方は{" "}
                <Link
                  href="/sign-in"
                  className="text-blue-600 hover:text-blue-800"
                >
                  こちら
                </Link>
              </p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
