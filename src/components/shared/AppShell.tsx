"use client";

import { Ticket, PlusCircle, User } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import ShellLayout, { type NavItem } from "@/components/shared/ShellLayout";

const navItems: NavItem[] = [
  { href: "/app/tickets", label: "My Tickets", icon: Ticket, matchSubPaths: true },
  { href: "/app/new", label: "New Request", icon: PlusCircle },
  { href: "/app/profile", label: "Profile", icon: User },
];

const PAGE_TITLES: Record<string, string> = {
  "/app/tickets": "My Tickets",
  "/app/new": "New Request",
  "/app/profile": "Profile",
};

function getPageTitle(pathname: string) {
  return PAGE_TITLES[pathname] ?? "Requester Portal";
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <ShellLayout
      navItems={navItems}
      consoleName="My Requests"
      getPageTitle={getPageTitle}
      showUserProfile
      user={user}
    >
      {children}
    </ShellLayout>
  );
}
