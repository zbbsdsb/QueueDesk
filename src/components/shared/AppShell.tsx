"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/app/tickets", label: "My Tickets" },
  { href: "/app/new", label: "New Request" },
  { href: "/app/profile", label: "Profile" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <Link href="/" className="font-bold text-lg">
            QueueDesk
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === item.href
                  ? "bg-primary text-primary-foreground font-medium"
                  : "hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t">
          <div className="px-3 py-2 text-xs text-muted-foreground">
            Requester Portal
          </div>
        </div>
      </aside>
      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="font-semibold text-sm">My Requests</h2>
          {/* TODO: user avatar / sign out */}
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
