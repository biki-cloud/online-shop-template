"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function SignOutButton() {
  const { signOut } = useAuth();

  return (
    <DropdownMenuItem
      className="text-destructive focus:text-destructive focus:bg-destructive/10"
      onClick={() => signOut()}
    >
      サインアウト
    </DropdownMenuItem>
  );
}
