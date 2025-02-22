"use client";

import { signOut } from "@/app/actions/auth";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface SignOutButtonProps {
  className?: string;
}

export function SignOutButton({ className }: SignOutButtonProps) {
  const handleSignOut = async () => {
    console.log("[SignOutButton] Attempting to sign out");
    try {
      await signOut();
      console.log("[SignOutButton] Sign out successful");
    } catch (error) {
      console.error("[SignOutButton] Error during sign out:", error);
    }
  };

  return (
    <DropdownMenuItem
      className={cn(
        "text-destructive focus:text-destructive focus:bg-destructive/10",
        className
      )}
      onClick={handleSignOut}
    >
      サインアウト
    </DropdownMenuItem>
  );
}
