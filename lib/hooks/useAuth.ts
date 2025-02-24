import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const syncUserWithDatabase = async (sessionUser: User) => {
    try {
      if (!sessionUser.email) {
        console.error("User email is missing");
        return;
      }

      const response = await fetch("/api/users/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: sessionUser.id,
          email: sessionUser.email,
          name:
            sessionUser.user_metadata?.name || sessionUser.email.split("@")[0],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          // 400エラーの場合は警告として記録
          console.warn("User sync warning:", data.error);
          return;
        }
        console.error("Failed to sync user with database:", data.error);
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error("Error syncing user:", error);
      // エラーをスローせず、同期の失敗を記録するだけにする
    }
  };

  useEffect(() => {
    let mounted = true;

    // 現在のセッションを取得
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted) {
          const sessionUser = session?.user ?? null;
          if (sessionUser) {
            await syncUserWithDatabase(sessionUser);
            setUser(sessionUser);
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Session error:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getSession();

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      const sessionUser = session?.user ?? null;
      if (sessionUser) {
        await syncUserWithDatabase(sessionUser);
        setUser(sessionUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
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
        // まず、アプリケーションのデータベースにユーザーを作成
        const response = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            name,
            password,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "アカウント作成に失敗しました");
        }

        // Supabaseで認証用のユーザーを作成
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
