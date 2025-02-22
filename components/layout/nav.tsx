"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/infrastructure/auth";
import {
  Loader2,
  ShoppingCart,
  ClipboardList,
  Package,
  Store,
  LogIn,
  UserPlus,
} from "lucide-react";
import { Suspense } from "react";
import { UserState } from "./user-state";

export function Nav() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/60 dark:bg-gray-950/60 border-b border-gray-200/50 dark:border-gray-800/50 supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link
            href="/home"
            className="relative flex items-center space-x-2 transition-transform hover:scale-105"
          >
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-full opacity-20 animate-pulse" />
              <Store className="absolute inset-0 w-8 h-8 text-orange-500" />
            </div>
            <span className="hidden font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent sm:inline-block">
              Online Shop
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-1.5">
          <Link href="/products">
            <Button variant="ghost" size="icon" className="relative group">
              <Store className="h-5 w-5 transition-transform group-hover:scale-110 group-hover:text-orange-500" />
              <span className="sr-only">Products</span>
            </Button>
          </Link>
          {user?.role === "admin" && (
            <Link href="/admin/products">
              <Button variant="ghost" size="icon" className="relative group">
                <Package className="h-5 w-5 transition-transform group-hover:scale-110 group-hover:text-orange-500" />
                <span className="sr-only">Admin Products</span>
              </Button>
            </Link>
          )}
          {user && (
            <Link href="/orders">
              <Button variant="ghost" size="icon" className="relative group">
                <ClipboardList className="h-5 w-5 transition-transform group-hover:scale-110 group-hover:text-orange-500" />
                <span className="sr-only">Orders</span>
              </Button>
            </Link>
          )}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative group">
              <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110 group-hover:text-orange-500" />
              <span className="sr-only">Cart</span>
            </Button>
          </Link>
          <Suspense fallback={<UserLoadingState />}>
            {user ? (
              <UserState user={user} />
            ) : (
              <div className="flex items-center gap-1.5">
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:inline-block">サインイン</span>
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden sm:inline-block">新規登録</span>
                  </Button>
                </Link>
              </div>
            )}
          </Suspense>
        </nav>
      </div>
    </header>
  );
}

function UserLoadingState() {
  return (
    <Button variant="ghost" size="icon" disabled className="relative group">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="sr-only">Loading</span>
    </Button>
  );
}
