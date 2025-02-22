"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignOutButton } from "./sign-out-button";
import { User as UserType } from "@/lib/infrastructure/db/schema";

interface UserStateProps {
  user: UserType | null;
}

export function UserState({ user }: UserStateProps) {
  console.log("[UserState] Current user state:", user);

  if (!user) {
    console.log("[UserState] No user found, showing sign-in/sign-up buttons");
    return (
      <Link href="/auth/signin">
        <Button variant="ghost" size="icon" className="relative group">
          <User className="h-5 w-5 transition-transform group-hover:scale-110 group-hover:text-orange-500" />
          <span className="sr-only">Sign in</span>
        </Button>
      </Link>
    );
  }

  console.log("[UserState] User is logged in:", user.email);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative group">
          <User className="h-5 w-5 transition-transform group-hover:scale-110 group-hover:text-orange-500" />
          <span className="sr-only">User menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem className="flex-col items-start gap-1 p-4">
          <p className="text-sm font-medium leading-none">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="w-full">
            設定
          </Link>
        </DropdownMenuItem>
        <SignOutButton className="w-full" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
