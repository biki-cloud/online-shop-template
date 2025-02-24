import { AuthForm } from "@/components/auth/auth-form";

export default function SignInPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AuthForm mode="signin" />
    </div>
  );
}
