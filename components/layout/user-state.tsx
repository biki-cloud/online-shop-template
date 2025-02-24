"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SignOutButton } from "./sign-out-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export function UserState() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-gray-500">読み込み中...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/sign-in"
          className="text-sm font-medium text-gray-700 hover:text-gray-800"
        >
          サインイン
        </Link>
        <Link
          href="/sign-up"
          className="text-sm font-medium text-gray-700 hover:text-gray-800"
        >
          アカウント作成
        </Link>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            {user.user_metadata?.name?.[0]?.toUpperCase() ??
              user.email?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium text-gray-700">
          {user.user_metadata?.name ?? user.email}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href="/settings">設定</Link>
        </DropdownMenuItem>
        <SignOutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
