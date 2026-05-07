"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Ticket,
  PlusCircle,
  User,
  LayoutDashboard,
  Building2,
  Bell,
} from "lucide-react";
import GlobalSearch from "@/components/GlobalSearch";

const navItems = [
  { href: "/app/tickets", label: "My Tickets", icon: Ticket },
  { href: "/app/new", label: "New Request", icon: PlusCircle },
  { href: "/app/profile", label: "Profile", icon: User },
];

const SECTION_LABELS: Record<string, string> = {
  "/app/tickets": "My Tickets",
  "/app/new": "New Request",
  "/app/profile": "Profile",
};

function getPageTitle(pathname: string) {
  return SECTION_LABELS[pathname] ?? "Requester Portal";
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
        <div className="px-4 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">QueueDesk</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium leading-tight">My Requests</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? "bg-blue-600 text-white font-medium shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4 opacity-60" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
              AL
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">Alex Lee</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">IT Department</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between shrink-0">
          <h1 className="text-base font-semibold text-slate-900 dark:text-white">{pageTitle}</h1>
          <button className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
