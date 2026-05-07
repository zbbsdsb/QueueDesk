"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  TicketCheck,
  ListTodo,
  BookOpen,
  Settings,
  Bell,
  ChevronRight,
  Building2,
  LogOut,
} from "lucide-react";
import GlobalSearch from "@/components/GlobalSearch";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/agent/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agent/tickets", label: "All Tickets", icon: TicketCheck },
  { href: "/agent/queues", label: "Queues", icon: ListTodo },
  { href: "/agent/knowledge", label: "Knowledge Base", icon: BookOpen },
];

const SECTION_LABELS: Record<string, string> = {
  "/agent/dashboard": "Dashboard",
  "/agent/tickets": "Tickets",
  "/agent/tickets/new": "New Ticket",
  "/agent/queues": "Queues",
  "/agent/knowledge": "Knowledge Base",
};

function getPageTitle(pathname: string) {
  for (const [prefix, label] of Object.entries(SECTION_LABELS)) {
    if (pathname === prefix) return label;
  }
  if (pathname.startsWith("/agent/tickets/")) return "Ticket Detail";
  return "Agent Console";
}

export default function AgentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const { user } = useAuth();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const displayName = user?.display_name ?? user?.email?.split("@")[0] ?? "Agent";
  const email = user?.email ?? "";
  const initials = user?.display_name
    ? user.display_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : email[0]?.toUpperCase() ?? "?";

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-4 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">QueueDesk</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium leading-tight">Agent Console</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/agent/dashboard" && pathname.startsWith(href + "/"));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all group ${
                  active
                    ? "bg-blue-600 text-white font-medium shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? "opacity-90" : "opacity-60 group-hover:opacity-100"}`} />
                {label}
                {active && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <Link
            href="/agent/settings"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Settings className="w-4 h-4 opacity-60" />
            Settings
          </Link>
        </div>

        {/* Agent profile + sign out */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{displayName}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-base font-semibold text-slate-900 dark:text-white">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            <GlobalSearch />
            <button className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
