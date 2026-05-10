"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Building2, ChevronRight, LogOut, type LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** If true, sub-paths like /agent/tickets/123 will also match this item */
  matchSubPaths?: boolean;
};

export type ShellLayoutProps = {
  /** Navigation items rendered in the sidebar */
  navItems: NavItem[];
  /** Console subtitle shown below the QueueDesk wordmark (e.g. "Agent Console") */
  consoleName: string;
  /**
   * Derive the header page-title from the current pathname.
   * Called on every render; return a short string.
   */
  getPageTitle: (pathname: string) => string;
  /** Optional bottom-section settings link (full href) */
  settingsHref?: string;
  /** Show GlobalSearch + notifications bell in header */
  showSearch?: boolean;
  /** Extra header slot rendered after the notifications bell */
  headerRight?: React.ReactNode;
  /** Show user profile + sign-out at the bottom of the sidebar */
  showUserProfile?: boolean;
  /** Signed-in user info (display_name, email) */
  user?: { display_name: string | null; email: string } | null;
  children: React.ReactNode;
};

export default function ShellLayout({
  navItems,
  consoleName,
  getPageTitle,
  settingsHref,
  showSearch = false,
  headerRight,
  showUserProfile = false,
  user,
  children,
}: ShellLayoutProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const displayName = user?.display_name ?? user?.email?.split("@")[0] ?? "User";
  const initials = user?.display_name
    ? user.display_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?";

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
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium leading-tight">{consoleName}</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto" aria-label={consoleName}>
          {navItems.map(({ href, label, icon: Icon, matchSubPaths }) => {
            const active =
              pathname === href ||
              (matchSubPaths ? pathname.startsWith(href + "/") : false);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all group ${
                  active
                    ? "bg-blue-600 text-white font-medium shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    active ? "opacity-90" : "opacity-60 group-hover:opacity-100"
                  }`}
                  aria-hidden="true"
                />
                {label}
                {active && <ChevronRight className="w-3 h-3 ml-auto opacity-60" aria-hidden="true" />}
              </Link>
            );
          })}
        </nav>

        {/* Optional settings link */}
        {settingsHref && (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800">
            <Link
              href={settingsHref}
              aria-current={pathname === settingsHref ? "page" : undefined}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {/* Settings icon is injected by the nav items or left as plain text */}
              Settings
            </Link>
          </div>
        )}

        {/* User profile + sign out */}
        {showUserProfile && user && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0"
                aria-hidden="true"
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{displayName}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              Sign out
            </button>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between gap-4 shrink-0">
          <h1 className="text-base font-semibold text-slate-900 dark:text-white">{pageTitle}</h1>
          <div className="flex items-center gap-3">
            {headerRight}
            <button
              className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" aria-hidden="true" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true" />
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
