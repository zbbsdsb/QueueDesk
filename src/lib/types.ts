import type { Database } from "./supabase/types";

export type TicketStatus = Database["public"]["Tables"]["ticket"]["Row"]["status"];
export type TicketPriority = Database["public"]["Tables"]["ticket"]["Row"]["priority"];
export type TenantStatus = Database["public"]["Tables"]["tenant"]["Row"]["status"];
export type AppUserStatus = Database["public"]["Tables"]["app_user"]["Row"]["status"];
export type AppUserRole = Database["public"]["Tables"]["app_user"]["Row"]["role"];

// View models (what we actually use in the UI)
export type TicketWithRelations = {
  id: string;
  tenant_id: string;
  queue_id: string;
  requester_id: string;
  assigned_agent_id: string | null;
  ticket_no: number;
  status: TicketStatus;
  priority: TicketPriority;
  subject: string;
  description: string | null;
  lock_version: number;
  sla_deadline: string | null;
  breach_notified_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  queue?: { id: string; name: string; slug: string };
  requester?: { id: string; display_name: string | null; email: string };
  assigned_agent?: { id: string; display_name: string | null; email: string } | null;
  labels?: { id: string; name: string; color: string; slug: string }[];
};

export type TicketCommentWithAuthor = {
  id: string;
  ticket_id: string;
  author_id: string;
  author_type: "user" | "contact" | "system";
  visibility: "public" | "internal";
  body: string;
  status: "published" | "edited" | "redacted";
  mentions: string[];
  created_at: string;
  updated_at: string;
  author?: { id: string; display_name: string | null; email: string };
};

// Status display config
export const TICKET_STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; color: string; bg: string; text: string }
> = {
  open: { label: "Open", color: "blue", bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-700 dark:text-blue-300" },
  in_progress: { label: "In Progress", color: "violet", bg: "bg-violet-50 dark:bg-violet-950", text: "text-violet-700 dark:text-violet-300" },
  pending_approval: { label: "Pending Approval", color: "amber", bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300" },
  pending_customer: { label: "Awaiting Customer", color: "orange", bg: "bg-orange-50 dark:bg-orange-950", text: "text-orange-700 dark:text-orange-300" },
  resolved: { label: "Resolved", color: "green", bg: "bg-green-50 dark:bg-green-950", text: "text-green-700 dark:text-green-300" },
  closed: { label: "Closed", color: "slate", bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400" },
  cancelled: { label: "Cancelled", color: "red", bg: "bg-red-50 dark:bg-red-950", text: "text-red-700 dark:text-red-300" },
};

export const TICKET_PRIORITY_CONFIG: Record<
  TicketPriority,
  { label: string; color: string; bg: string; text: string; dot: string }
> = {
  low: { label: "Low", color: "slate", bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400", dot: "bg-slate-400" },
  normal: { label: "Normal", color: "blue", bg: "bg-blue-100 dark:bg-blue-900", text: "text-blue-700 dark:text-blue-300", dot: "bg-blue-500" },
  high: { label: "High", color: "amber", bg: "bg-amber-100 dark:bg-amber-900", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
  urgent: { label: "Urgent", color: "red", bg: "bg-red-100 dark:bg-red-900", text: "text-red-700 dark:text-red-300", dot: "bg-red-500" },
};

// Status transition rules
export const VALID_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  open: ["in_progress", "pending_approval", "cancelled"],
  in_progress: ["pending_approval", "pending_customer", "resolved", "cancelled"],
  pending_customer: ["in_progress", "cancelled"],
  pending_approval: ["in_progress", "cancelled"],
  resolved: ["in_progress", "closed"],
  closed: [],
  cancelled: [],
};

// ── AppUser role color config ─────────────────────────────
export const APP_USER_ROLE_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  owner: { label: "Owner", bg: "bg-violet-100 dark:bg-violet-900", text: "text-violet-700 dark:text-violet-300" },
  admin: { label: "Admin", bg: "bg-blue-100 dark:bg-blue-900", text: "text-blue-700 dark:text-blue-300" },
  agent: { label: "Agent", bg: "bg-cyan-100 dark:bg-cyan-900", text: "text-cyan-700 dark:text-cyan-300" },
  requester: { label: "Requester", bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400" },
};

// ── AppUser status color config ──────────────────────────
export const APP_USER_STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  active: { label: "Active", bg: "bg-emerald-100 dark:bg-emerald-900", text: "text-emerald-700 dark:text-emerald-300" },
  disabled: { label: "Disabled", bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-500 dark:text-slate-400" },
  invited: { label: "Invited", bg: "bg-amber-100 dark:bg-amber-900", text: "text-amber-700 dark:text-amber-300" },
};

// ── Queue display colors (for pie/bar charts) ──────────────
export const QUEUE_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#f59e0b", // amber
  "#10b981", // emerald
  "#ef4444", // red
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#84cc16", // lime
] as const;

// ── SLA status colors ─────────────────────────────────────
export const SLA_STATUS_COLORS: Record<string, { dot: string; bg: string }> = {
  on_track: { dot: "bg-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  at_risk: { dot: "bg-amber-500", bg: "bg-amber-50 dark:bg-amber-950/40" },
  breached: { dot: "bg-red-500", bg: "bg-red-50 dark:bg-red-950/40" },
};
