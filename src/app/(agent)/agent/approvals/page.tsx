"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  TICKET_STATUS_CONFIG,
  TICKET_PRIORITY_CONFIG,
  type TicketStatus,
  type TicketPriority,
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

type Ticket = {
  id: string;
  ticket_no: number;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  queue_id: string;
  assignee_user_id: string | null;
  requester_user_id: string;
  created_at: string;
  updated_at: string;
  queue?: { name: string };
  requester?: { display_name: string | null; email: string };
  assignee_user_id?: string;
  requester?: { display_name: string | null; email: string };
  assignee?: { display_name: string | null; email: string } | null;
};

type Filters = {
  search: string;
  sortBy: "created_at" | "updated_at" | "priority";
  sortOrder: "asc" | "desc";
};

const PRIORITY_ORDER: Record<TicketPriority, number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
};

function TicketRow({ ticket }: { ticket: Ticket }) {
  const statusCfg = TICKET_STATUS_CONFIG[ticket.status];
  const priorityCfg = TICKET_PRIORITY_CONFIG[ticket.priority];

  const age = getAge(ticket.created_at);
  const updated = getAge(ticket.updated_at);

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
        {ticket.assignee ? (
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {ticket.assignee.display_name ?? ticket.assignee.email.split("@")[0]}
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


export default function ApprovalsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
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
        created_at, updated_at,
        queue:queue_id(name),
        requester:requester_user_id(display_name, email),
        assignee:assignee_user_id(display_name, email)
      `)
      .eq("tenant_id", user.tenant_id)
      .eq("status", "waiting_approval")
      .is("deleted_at", null);

    if (filters.search.trim()) {
      query = query.ilike("subject", `%${filters.search.trim()}%`);
    }

    const { data, error } = await query.order(filters.sortBy, {
      ascending: filters.sortOrder === "asc",
    });

    if (error) {
      toast({ variant: "destructive", title: "Failed to load approvals", description: error.message });
    } else {
      let result = (data ?? []) as Ticket[];

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

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Pending Approvals</h1>

          {/* Search */}
          <div className="relative flex-1 max-w-sm ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search approvals…"
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => startTransition(() => fetchTickets())}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
            </button>
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
            <p className="text-slate-600 dark:text-slate-400 font-medium">No pending approvals</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              All tickets have been approved or rejected!
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10">
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 pb-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Subject</th>
                <th className="px-4 pb-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status</th>
                <th className="px-4 pb-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Priority</th>
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
