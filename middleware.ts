import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { signToken, verifyToken } from "@/lib/infrastructure/auth/session";

const protectedRoutes = ["/cart", "/checkout"];
const adminRoutes = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`[Middleware] Accessing path: ${pathname}`);

  const sessionCookie = request.cookies.get("session");
  console.log(`[Middleware] Session cookie present: ${!!sessionCookie}`);

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  console.log(
    `[Middleware] Route type - Protected: ${isProtectedRoute}, Admin: ${isAdminRoute}`
  );

  // ルートパスへのアクセスを/homeにリダイレクト
  if (pathname === "/") {
    console.log("[Middleware] Redirecting root path to /home");
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // 管理者ルートのチェック
  if (isAdminRoute) {
    console.log("[Middleware] Checking admin route access");
    if (!sessionCookie) {
      console.log(
        "[Middleware] No session found for admin route, redirecting to sign-in"
      );
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    try {
      const session = await verifyToken(sessionCookie.value);
      console.log(`[Middleware] Admin route - User role: ${session.user.role}`);
      if (session.user.role !== "admin") {
        console.log(
          "[Middleware] Non-admin user attempting to access admin route"
        );
        return NextResponse.redirect(new URL("/home", request.url));
      }
    } catch (error) {
      console.error("[Middleware] Error verifying admin session:", error);
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  // 保護されたルートでセッションがない場合
  if (isProtectedRoute && !sessionCookie) {
    console.log(
      "[Middleware] Protected route access without session, redirecting to sign-in"
    );
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // 認証ルートにセッションがある場合はリダイレクト
  if ((pathname === "/sign-in" || pathname === "/sign-up") && sessionCookie) {
    console.log(
      "[Middleware] Authenticated user attempting to access auth routes"
    );
    return NextResponse.redirect(new URL("/home", request.url));
  }

  let res = NextResponse.next();

  // セッションの更新処理（保護されたルートの場合のみ）
  if (sessionCookie && (isProtectedRoute || isAdminRoute)) {
    console.log("[Middleware] Updating session for protected/admin route");
    try {
      const parsed = await verifyToken(sessionCookie.value);
      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

      res.cookies.set({
        name: "session",
        value: await signToken({
          ...parsed,
          expires: expiresInOneDay.toISOString(),
        }),
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        expires: expiresInOneDay,
      });
      console.log("[Middleware] Session successfully updated");
    } catch (error) {
      console.error("[Middleware] Error updating session:", error);
      res.cookies.delete("session");
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
