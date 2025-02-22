import { getSession } from "@/lib/infrastructure/auth/session";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-lg font-semibold">管理画面</h1>
        </div>
      </header>
      <main className="flex-1">
        <div className="container p-4">{children}</div>
      </main>
    </div>
  );
}
