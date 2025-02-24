import "./globals.css";
import "reflect-metadata";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Nav } from "@/components/layout/nav";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Online Shop",
  description: "Online Shop Template",
};

export const viewport: Viewport = {
  maximumScale: 1,
  themeColor: "#4F46E5",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={cn(inter.className, "min-h-screen bg-gray-50")}>
        <Nav />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
