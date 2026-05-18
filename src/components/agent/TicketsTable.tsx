"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  TICKET_STATUS_CONFIG,
  TICKET_PRIORITY_CONFIG,
  SLA_STATUS_COLORS,
  type Ticket,
  type AppUser,
  type Queue,
} from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronDown,
  Plus,
  RefreshCw,
  ExternalLink,
  Clock,
} from "lucide-react";
import { getAge } from "@/lib/utils";

type TicketWithRelations = Ticket & {
  queue?: Pick<Queue, "name">;
  requester?: Pick<AppUser, "display_name" | "email">;
  assignee_user?: Pick<AppUser, "display_name" | "email"> | null;
};

type Filters = {
  status: Ticket["status"] | "all";
  priority: Ticket["priority"] | "all";
  search: string;
  sortBy: "created_at" | "updated_at" | "priority";
  sortOrder: "asc" | "desc";
};

const PRIORITY_ORDER: Record<Ticket["priority"], number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
};

function TicketRow({ ticket }: { ticket: TicketWithRelations }) {
  const statusCfg = TICKET_STATUS_CONFIG[ticket.status];
  const priorityCfg = TICKET_PRIORITY_CONFIG[ticket.priority];

  const age = getAge(ticket.created_at);
  const updated = getAge(ticket.updated_at);

  // Calculate SLA status
  let slaStatus: "on_track" | "at_risk" | "breached" | null = null;
  if (ticket.next_sla_breach_at) {
    const now = new Date();
    const deadline = new Date(ticket.next_sla_breach_at);
    const diffMs = deadline.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffMs < 0) {
      slaStatus = "breached";
    } else if (diffHours < 24) {
      slaStatus = "at_risk";
    } else {
      slaStatus = "on_track";
    }
  } else if (ticket.sla_deadline) {
    const now = new Date();
    const deadline = new Date(ticket.sla_deadline);
    const diffMs = deadline.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffMs < 0) {
      slaStatus = "breached";
    } else if (diffHours < 24) {
      slaStatus = "at_risk";
    } else {
      slaStatus = "on_track";
    }
  }

  return (
    <tr className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${priorityCfg.dot}`} />
          <div className="min-w-0">
            <Link
              href={`/agent/tickets/${ticket.id}`}
              className="text-sm font-medium text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1 transition-colors"
            >
              {ticket.subject}
            </Link>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500">#{ticket.ticket_no}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {ticket.queue?.name ?? "Unqueued"}
          </span>
          {ticket.requester && (
            <>
              <span className="text-xs text-slate-300 dark:text-slate-600">·</span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {ticket.requester.display_name ?? ticket.requester.email}
              </span>
            </>
          )}
        </div>
      </td>
      <td className="px-4 py-3.5">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${statusCfg.bg} ${statusCfg.text}`}
        >
          {statusCfg.label}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${priorityCfg.bg} ${priorityCfg.text}`}
        >
          {priorityCfg.label}
        </span>
      </td>
      <td className="px-4 py-3.5">
        {slaStatus && (ticket.next_sla_breach_at || ticket.sla_deadline) && (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${SLA_STATUS_COLORS[slaStatus].bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${SLA_STATUS_COLORS[slaStatus].dot}`} />
            {slaStatus === "breached"
              ? "Breached"
              : slaStatus === "at_risk"
              ? "At Risk"
              : "On Track"}
          </span>
        )}
      </td>
      <td className="px-4 py-3.5">
        {ticket.assignee_user ? (
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {ticket.assignee_user.display_name ?? ticket.assignee_user.email.split("@")[0]}
          </span>
        ) : (
          <span className="text-sm text-slate-400 dark:text-slate-600 italic">Unassigned</span>
        )}
      </td>
      <td className="px-4 py-3.5 text-right">
        <div className="flex items-center justify-end gap-1 text-xs text-slate-400 dark:text-slate-500">
          <Clock className="w-3 h-3" />
          <span>{age}</span>
          {updated !== age && (
            <span className="opacity-60">· {updated} ago</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3.5">
        <Link
          href={`/agent/tickets/${ticket.id}`}
          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all opacity-0 group-hover:opacity-100"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </td>
    </tr>
  );
}

export default function TicketsTable() {
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [tickets, setTickets] = useState<TicketWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    status: "all",
    priority: "all",
    search: "",
    sortBy: "updated_at",
    sortOrder: "desc",
  });

  async function fetchTickets() {
    if (!user?.tenant_id) {
      setLoading(false);
      return;
    }
    setLoading(true);

    let query = supabase
      .from("ticket")
      .select(`
        id, ticket_no, subject, status, priority, queue_id, assignee_user_id, requester_user_id,
        created_at, updated_at, next_sla_breach_at, sla_deadline,
        queue:queue_id(name),
        requester:requester_user_id(display_name, email),
        assignee_user:assignee_user_id(display_name, email)
      `)
      .eq("tenant_id", user.tenant_id)
      .is("deleted_at", null);

    if (filters.status !== "all") {
      query = query.eq("status", filters.status);
    }
    if (filters.priority !== "all") {
      query = query.eq("priority", filters.priority);
    }
    if (filters.search.trim()) {
      query = query.ilike("subject", `%${filters.search.trim()}%`);
    }

    const { data, error } = await query.order(filters.sortBy, {
      ascending: filters.sortOrder === "asc",
    });

    if (error) {
      toast({ variant: "destructive", title: "Failed to load tickets", description: error.message });
    } else {
      let result = (data ?? []) as unknown as TicketWithRelations[];

      if (filters.priority !== "all") {
        // Already filtered via query
      }

      if (filters.sortBy === "priority") {
        result = result.sort((a, b) => {
          const diff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
          return filters.sortOrder === "asc" ? diff : -diff;
        });
      }

      setTickets(result ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh when filters change
  useEffect(() => {
    const timeout = setTimeout(fetchTickets, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const statusCounts = tickets.reduce(
    (acc, t) => {
      acc[t.status] = (acc[t.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const activeCount = Object.entries(statusCounts)
    .filter(([s]) => !["resolved", "closed", "cancelled"].includes(s))
    .reduce((sum, [, c]) => sum + c, 0);

  const STATUS_TABS: { key: Ticket["status"] | "all"; label: string; count?: number }[] = [
    { key: "all", label: "All" },
    { key: "open", label: "Open", count: statusCounts["open"] },
    { key: "pending", label: "Pending", count: statusCounts["pending"] },
    { key: "waiting_approval", label: "Pending Approval", count: statusCounts["waiting_approval"] },
    { key: "waiting_customer", label: "Awaiting Customer", count: statusCounts["waiting_customer"] },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tickets…"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  startTransition(() => fetchTickets());
                }
              }}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-xl border transition-all ${
              showFilters || filters.priority !== "all"
                ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {filters.priority !== "all" && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            )}
          </button>

          {/* Sort */}
          <select
            value={`${filters.sortBy}:${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split(":") as [Filters["sortBy"], Filters["sortOrder"]];
              setFilters((f) => ({ ...f, sortBy, sortOrder }));
            }}
            className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
          >
            <option value="updated_at:desc">Recently updated</option>
            <option value="created_at:desc">Newest first</option>
            <option value="created_at:asc">Oldest first</option>
            <option value="priority:desc">Urgent first</option>
            <option value="priority:asc">Low priority first</option>
          </select>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => startTransition(() => fetchTickets())}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => router.push("/agent/tickets/new")}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-700 hover:bg-blue-800 text-white rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Ticket
            </button>
          </div>
        </div>

        {/* Filter row */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Priority:</span>
            {(["all", "urgent", "high", "normal", "low"] as const).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setFilters((f) => ({ ...f, priority: p });
                  setTimeout(() => fetchTickets(), 0);
                }}
                className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
                  filters.priority === p
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {p === "all" ? "All" : TICKET_PRIORITY_CONFIG[p].label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status tabs */}
      <div className="px-6 pt-4 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setFilters((f) => ({ ...f, status: tab.key }));
                setTimeout(() => fetchTickets(), 0);
              }}
              className={`px-3 pb-2.5 text-sm font-medium border-b-2 transition-all ${
                filters.status === tab.key
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {tab.label}
              {tab.count != null && tab.count > 0 && (
                <span className={`ml-1.5 text-xs font-semibold ${
                  filters.status === tab.key ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
          <div className="ml-auto pb-2.5 text-xs text-slate-400 dark:text-slate-500">
            {loading ? "…" : `${tickets.length} ticket${tickets.length !== 1 ? "s" : ""}`}
            {activeCount > 0 && (
              <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">
                {activeCount} active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="space-y-1 p-2">
            {/* Header skeleton */}
            <div className="flex gap-4 px-4 py-2">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse ml-auto" />
            </div>
            {/* Row skeletons */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  <div className={`h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse ${i % 3 === 0 ? "w-3/5" : i % 3 === 1 ? "w-2/5" : "w-1/2"}`} />
                </div>
                <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse hidden sm:block" />
                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse ml-auto" />
                <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">No tickets found</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              {filters.search || filters.status !== "all" || filters.priority !== "all"
                ? "Try adjusting your filters."
                : "Create your first ticket to get started."}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10">
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 pb-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Subject</th>
                <th className="px-4 pb-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status</th>
                <th className="px-4 pb-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Priority</th>
                <th className="px-4 pb-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SLA</th>
                <th className="px-4 pb-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Assigned</th>
                <th className="px-4 pb-2.5 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Age</th>
                <th className="px-4 pb-2.5 w-10" />
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <TicketRow key={ticket.id} ticket={ticket} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
