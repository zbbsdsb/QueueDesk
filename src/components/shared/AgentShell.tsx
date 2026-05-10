"use client";

import {
  LayoutDashboard,
  TicketCheck,
  ListTodo,
  BookOpen,
  Settings,
} from "lucide-react";
import GlobalSearch from "@/components/GlobalSearch";
import { useAuth } from "@/components/providers/AuthProvider";
import ShellLayout, { type NavItem } from "@/components/shared/ShellLayout";
import { usePathname } from "next/navigation";

const navItems: NavItem[] = [
  { href: "/agent/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agent/tickets", label: "All Tickets", icon: TicketCheck, matchSubPaths: true },
  { href: "/agent/queues", label: "Queues", icon: ListTodo },
  { href: "/agent/knowledge", label: "Knowledge Base", icon: BookOpen },
];

const PAGE_TITLES: Record<string, string> = {
  "/agent/dashboard": "Dashboard",
  "/agent/tickets": "Tickets",
  "/agent/tickets/new": "New Ticket",
  "/agent/queues": "Queues",
  "/agent/knowledge": "Knowledge Base",
  "/agent/settings": "Settings",
};

function getPageTitle(pathname: string) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/agent/tickets/")) return "Ticket Detail";
  return "Agent Console";
}

export default function AgentShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <ShellLayout
      navItems={navItems}
      consoleName="Agent Console"
      getPageTitle={getPageTitle}
      settingsHref={pathname === "/agent/settings" ? undefined : "/agent/settings"}
      showSearch
      headerRight={<GlobalSearch />}
      showUserProfile
      user={user}
    >
      {children}
    </ShellLayout>
  );
}
