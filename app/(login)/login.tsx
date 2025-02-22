"use client";

import { AuthForm } from "@/components/auth/auth-form";
import { AuthHeader } from "@/components/auth/auth-header";

export function Login({ mode = "signin" }: { mode?: "signin" | "signup" }) {
  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-50" />
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-200/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-orange-100/30 via-transparent to-transparent" />
      </div>
      <div className="relative z-10">
        <AuthHeader mode={mode} />
        <AuthForm mode={mode} />
      </div>
    </div>
  );
}
