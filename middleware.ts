import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/cart", "/checkout"];
const adminRoutes = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const res = NextResponse.next();

  // Supabaseクライアントを作成
  const supabase = createMiddlewareClient({ req: request, res });

  // セッションを取得
  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log("[middleware] Path:", pathname);
  console.log("[middleware] Session:", session);

  // ルートパスへのアクセスを/homeにリダイレクト
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // 管理者ルートのチェック
  if (isAdminRoute(pathname)) {
    if (!session) {
      console.log(
        "[middleware] No session for admin route, redirecting to sign-in"
      );
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log("[middleware] Admin route user:", user);

    if (!user?.user_metadata?.role || user.user_metadata.role !== "admin") {
      console.log("[middleware] User is not admin, redirecting to home");
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  // 保護されたルートでセッションがない場合
  if (isProtectedRoute(pathname) && !session) {
    console.log(
      "[middleware] No session for protected route, redirecting to sign-in"
    );
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // 認証ルートにセッションがある場合はリダイレクト
  if (isAuthRoute(pathname) && session) {
    console.log(
      "[middleware] Session exists for auth route, redirecting to home"
    );
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return res;
}

// 保護されたルートかどうかをチェック
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

// 管理者ルートかどうかをチェック
function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some((route) => pathname.startsWith(route));
}

// 認証ルートかどうかをチェック
function isAuthRoute(pathname: string): boolean {
  return pathname === "/sign-in" || pathname === "/sign-up";
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
