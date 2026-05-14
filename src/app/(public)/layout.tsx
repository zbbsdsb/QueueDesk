import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "QueueDesk — Ticket View",
  description: "View your support ticket",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <nav className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            QueueDesk
          </Link>
        </nav>
      </header>
      <main className="py-10">{children}</main>
    </div>
  );
}
