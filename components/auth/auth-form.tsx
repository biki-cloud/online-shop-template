"use client";

import { useActionState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { signIn, signUp } from "@/app/actions/auth";
import { ActionState } from "@/lib/infrastructure/auth/middleware";
import Link from "next/link";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AuthFormProps {
  mode: "signin" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get("redirect");
  const priceId = searchParams.get("priceId");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === "signin" ? signIn : signUp,
    { error: "" }
  );

  useEffect(() => {
    if (state?.redirect) {
      router.push(state.redirect);
    }
  }, [state?.redirect, router]);

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <Card className="bg-white/50 backdrop-blur-sm border-none shadow-xl">
        <CardHeader>
          <div className="relative h-24">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 opacity-20 rounded-t-lg" />
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form className="space-y-6" action={formAction}>
            <input type="hidden" name="redirect" value={redirect || ""} />
            <input type="hidden" name="priceId" value={priceId || ""} />

            {mode === "signup" && (
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
                >
                  お名前
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  defaultValue={state.name}
                  required
                  maxLength={100}
                  className="rounded-lg transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="お名前を入力してください"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                メールアドレス
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={state.email}
                required
                maxLength={50}
                className="rounded-lg transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="メールアドレスを入力してください"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                パスワード
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                defaultValue={state.password}
                required
                minLength={8}
                maxLength={100}
                className="rounded-lg transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="パスワードを入力してください"
              />
              {mode === "signup" && (
                <div className="text-sm text-gray-500 mt-1">
                  <p>パスワードは以下の要件を満たす必要があります：</p>
                  <div className="space-y-1 mt-1 ml-4">
                    <div className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-gray-500" />
                      <span>8文字以上</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-gray-500" />
                      <span>少なくとも1つの数字</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-gray-500" />
                      <span>少なくとも1つの小文字</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-gray-500" />
                      <span>少なくとも1つの大文字</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-gray-500" />
                      <span>少なくとも1つの特殊文字（!@#$%^&*）</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {state?.error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                {state.error}
              </div>
            )}

            <Button
              type="submit"
              className={cn(
                "w-full py-2 px-4 rounded-lg shadow-sm text-sm font-medium text-white",
                "bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600",
                "hover:from-orange-500 hover:via-orange-600 hover:to-orange-700",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500",
                "transition-all duration-200 transform hover:scale-[1.02]"
              )}
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  読み込み中...
                </>
              ) : mode === "signin" ? (
                "サインイン"
              ) : (
                "アカウント作成"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="px-8 pb-8">
          <div className="w-full">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {mode === "signin"
                    ? "アカウントをお持ちでない方"
                    : "アカウントをお持ちの方"}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href={`${mode === "signin" ? "/sign-up" : "/sign-in"}${
                  redirect ? `?redirect=${redirect}` : ""
                }${priceId ? `&priceId=${priceId}` : ""}`}
                className={cn(
                  "w-full flex justify-center py-2 px-4 rounded-lg shadow-sm text-sm font-medium",
                  "border border-orange-200 bg-white text-orange-600",
                  "hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500",
                  "transition-all duration-200"
                )}
              >
                {mode === "signin"
                  ? "新規アカウントを作成"
                  : "既存のアカウントでサインイン"}
              </Link>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
