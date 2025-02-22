import { CircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthHeaderProps {
  mode: "signin" | "signup";
}

export function AuthHeader({ mode }: AuthHeaderProps) {
  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <div className="flex flex-col items-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-full opacity-20 animate-pulse" />
          <CircleIcon className="absolute inset-0 w-16 h-16 text-orange-500 transform hover:scale-110 transition-transform duration-200" />
        </div>
        <h2
          className={cn(
            "mt-6 text-center text-3xl font-extrabold",
            "bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400",
            "bg-clip-text text-transparent"
          )}
        >
          {mode === "signin" ? "アカウントにサインイン" : "新規アカウント作成"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {mode === "signin"
            ? "オンラインショップへようこそ"
            : "簡単な手続きでアカウントを作成できます"}
        </p>
      </div>
    </div>
  );
}
