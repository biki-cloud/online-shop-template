import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Edge Runtimeでbcryptjsを使用しないように設定
export const runtime = "nodejs";

const protectedRoutes = ["/cart", "/checkout"];
const adminRoutes = ["/admin"];

// JWTの検証に使用する秘密鍵
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  //   console.log(`[Middleware] Accessing path: ${pathname}`);

  const token = request.cookies.get("session")?.value;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // ルートパスへのアクセスを/homeにリダイレクト
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // トークンの検証
  async function verifyAuth() {
    if (!token) return null;
    try {
      const verified = await jwtVerify(token, secret);
      return verified.payload;
    } catch {
      return null;
    }
  }

  // 管理者ルートのチェック
  if (isAdminRoute) {
    const payload = await verifyAuth();
    if (!payload || payload.role !== "admin") {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  // 保護されたルートでセッションがない場合
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // 認証ルートにセッションがある場合はリダイレクト
  if ((pathname === "/sign-in" || pathname === "/sign-up") && token) {
    const payload = await verifyAuth();
    if (payload) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
