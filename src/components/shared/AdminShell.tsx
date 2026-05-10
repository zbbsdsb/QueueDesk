"use client";

import {
  Users,
  Layers,
  ShieldCheck,
  ListTodo,
  Clock,
  GitBranch,
  Settings,
} from "lucide-react";
import ShellLayout, { type NavItem } from "@/components/shared/ShellLayout";

const navItems: NavItem[] = [
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/teams", label: "Teams", icon: Layers },
  { href: "/admin/roles", label: "Roles & Permissions", icon: ShieldCheck },
  { href: "/admin/queues", label: "Queues", icon: ListTodo },
  { href: "/admin/sla", label: "SLA Policies", icon: Clock },
  { href: "/admin/approvals", label: "Approvals", icon: GitBranch },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const PAGE_TITLES: Record<string, string> = {
  "/admin/users": "Users",
  "/admin/teams": "Teams",
  "/admin/roles": "Roles & Permissions",
  "/admin/queues": "Queues",
  "/admin/sla": "SLA Policies",
  "/admin/approvals": "Approvals",
  "/admin/settings": "Settings",
};

function getPageTitle(pathname: string) {
  return PAGE_TITLES[pathname] ?? "Admin Console";
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <ShellLayout
      navItems={navItems}
      consoleName="Admin Console"
      getPageTitle={getPageTitle}
    >
      {children}
    </ShellLayout>
  );
}
