import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 現在のセッションを取得
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/home");
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("ログインに失敗しました");
      }
    },
    [router]
  );

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
          },
        });
        if (error) throw error;
        router.push("/home");
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("アカウント作成に失敗しました");
      }
    },
    [router]
  );

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/sign-in");
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("ログアウトに失敗しました");
    }
  }, [router]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("パスワードリセットメールの送信に失敗しました");
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("パスワードの更新に失敗しました");
    }
  }, []);

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };
}
