import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "QueueDesk — AI Service Desk",
  description: "AI-first internal service desk for modern teams",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Minimal nav */}
      <header className="border-b">
        <nav className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            QueueDesk
          </Link>
          <div className="flex gap-4 text-sm">
            <Link href="/login" className="hover:text-primary transition-colors">
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-foreground px-4 py-1.5 text-background text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
