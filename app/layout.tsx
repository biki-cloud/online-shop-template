import "./globals.css";
import "reflect-metadata";
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { UserProvider } from "@/lib/infrastructure/auth";
import { getCurrentUser } from "@/app/actions/user";
import { Nav } from "@/components/layout/nav";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Next.js SaaS Starter",
  description: "Get started quickly with Next.js, Postgres, and Stripe.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon512_rounded.png",
  },
  themeColor: "#4F46E5",
};

export const viewport: Viewport = {
  maximumScale: 1,
};

const manrope = Manrope({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userPromise = getCurrentUser();

  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50">
        <UserProvider userPromise={userPromise}>
          <ServiceWorkerRegistration />
          <Nav />
          {children}
          <Toaster />
        </UserProvider>
      </body>
    </html>
  );
}
