"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Bell, 
  ChevronRight, 
  LogOut, 
  Sparkles,
  type LucideIcon 
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import GlobalSearch from "@/components/GlobalSearch";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  matchSubPaths?: boolean;
};

export type ShellLayoutProps = {
  navItems: NavItem[];
  consoleName: string;
  getPageTitle: (pathname: string) => string;
  settingsHref?: string;
  showSearch?: boolean;
  headerRight?: React.ReactNode;
  showUserProfile?: boolean;
  user?: { display_name: string | null; email: string } | null;
  children: React.ReactNode;
};

function Logo({ consoleName }: { consoleName: string }) {
  return (
    <div className="relative group px-4 py-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <Link href="/" className="flex items-center gap-3">
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-500" />
        </div>
        <div className="space-y-0.5">
          <p className="font-bold text-sm text-foreground tracking-tight">QueueDesk</p>
          <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">{consoleName}</p>
        </div>
      </Link>
    </div>
  );
}

function NavItem({ 
  item, 
  isActive 
}: { 
  item: NavItem; 
  isActive: boolean; 
}) {
  const Icon = item.icon;
  
  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={`
        group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
        transition-all duration-200 ease-out-expo
        ${isActive 
          ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary" 
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        }
      `}
    >
      {isActive && (
        <>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-primary to-accent rounded-full" />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-transparent opacity-50" />
        </>
      )}
      <div className={`
        relative flex items-center justify-center w-8 h-8 rounded-lg
        transition-all duration-200 ease-out-expo
        ${isActive 
          ? "bg-primary/10 text-primary" 
          : "bg-secondary/50 text-muted-foreground group-hover:bg-secondary group-hover:text-foreground"
        }
      `}>
        <Icon className="w-4 h-4" aria-hidden="true" />
      </div>
      <span className="relative flex-1">{item.label}</span>
      {isActive && (
        <ChevronRight className="w-3.5 h-3.5 text-primary/60" aria-hidden="true" />
      )}
    </Link>
  );
}

function UserProfile({ 
  user, 
  onSignOut 
}: { 
  user: { display_name: string | null; email: string }; 
  onSignOut: () => void;
}) {
  const displayName = user?.display_name ?? user?.email?.split("@")[0] ?? "User";
  const initials = user?.display_name
    ? user.display_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="p-3 border-t border-border/50">
      <div className="relative group">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative p-3 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-primary/20">
                {initials}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-success rounded-full border-2 border-background">
                <div className="w-full h-full rounded-full bg-success/50 pulse-dot" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

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

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-[260px] bg-surface border-r border-border/50 flex flex-col shrink-0">
        <Logo consoleName={consoleName} />
        
        <div className="h-px mx-4 bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label={consoleName}>
          {navItems.map(({ href, label, icon, matchSubPaths }) => {
            const isActive = pathname === href || 
              (matchSubPaths ? pathname.startsWith(href + "/") : false);
            return (
              <NavItem 
                key={href} 
                item={{ href, label, icon, matchSubPaths }} 
                isActive={isActive} 
              />
            );
          })}
        </nav>

        {/* Settings */}
        {settingsHref && (
          <div className="p-3 border-t border-border/50">
            <Link
              href={settingsHref}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l1.004-.828a1.125 1.125 0 01.26-1.43l1.298-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              Settings
            </Link>
          </div>
        )}

        {/* User Profile */}
        {showUserProfile && user && (
          <UserProfile user={user} onSignOut={handleSignOut} />
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-background via-background to-secondary/5">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
              <div className="h-4 w-px bg-border/50" />
              <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Link href="/agent/dashboard" className="hover:text-foreground transition-colors">
                  Home
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground font-medium">{pageTitle}</span>
              </nav>
            </div>
            
            <div className="flex items-center gap-3">
              {headerRight}
              <button
                className="relative p-2 rounded-xl hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" aria-hidden="true" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-2 ring-background" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
