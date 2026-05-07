"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  type TicketStatus,
  type TicketWithRelations,
  TICKET_STATUS_CONFIG,
  TICKET_PRIORITY_CONFIG,
} from "@/lib/types";
import {
  Ticket,
  PlusCircle,
  Search,
  ChevronRight,
  Clock,
  User,
  InboxIcon,
  RefreshCw,
} from "lucide-react";

const FILTER_TABS: { label: string; value: TicketStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Pending", value: "pending_customer" },
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function MyTicketsPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [tickets, setTickets] = useState<TicketWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<TicketStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "updated">("newest");

  async function loadTickets() {
    if (!user) return;
    setLoading(true);

    let query = supabase
      .from("ticket")
      .select(
        `
        id, tenant_id, queue_id, requester_id, assigned_agent_id,
        status, priority, subject, description, created_at, updated_at,
        queue:queue_id(name, slug),
        assigned_agent:assigned_agent_id(display_name, email)
      `
      )
      .eq("tenant_id", user.tenant_id)
      .eq("requester_id", user.id)
      .order("updated_at", { ascending: false });

    const { data, error } = await query;

    if (!error && data) {
      setTickets(data as unknown as TicketWithRelations[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadTickets();
  }, [user?.tenant_id, user?.id]);

  const filtered = tickets
    .filter((t) => activeFilter === "all" || t.status === activeFilter)
    .filter(
      (t) =>
        !search ||
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.queue?.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  const counts = FILTER_TABS.reduce(
    (acc, tab) => {
      acc[tab.value] = tab.value === "all" ? tickets.length : tickets.filter((t) => t.status === tab.value).length;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 shrink-0">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requests…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="updated">Recently updated</option>
        </select>

        {/* Refresh */}
        <button
          onClick={() => startTransition(() => loadTickets())}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* New Request */}
        <Link
          href="/app/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          New Request
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1 overflow-x-auto shrink-0">
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.value;
          const count = counts[tab.value] ?? 0;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Ticket List */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
                  </div>
                  <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <InboxIcon className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-base font-medium text-slate-700 dark:text-slate-300 mb-1">
              {search ? "No results found" : "No requests yet"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              {search ? `No requests matching "${search}"` : "Submit your first request to get started"}
            </p>
            {!search && (
              <Link
                href="/app/new"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Submit a Request
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((ticket) => {
              const statusCfg = TICKET_STATUS_CONFIG[ticket.status];
              const priorityCfg = TICKET_PRIORITY_CONFIG[ticket.priority];
              return (
                <Link
                  key={ticket.id}
                  href={`/app/tickets/${ticket.id}`}
                  className="block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 rounded-2xl p-5 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    {/* Priority dot */}
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${priorityCfg.dot}`} />

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                          {ticket.subject}
                        </h3>
                        <span
                          className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.bg} ${statusCfg.text}`}
                        >
                          {statusCfg.label}
                        </span>
                      </div>

                      {ticket.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">
                          {ticket.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                        {ticket.queue && (
                          <span className="flex items-center gap-1">
                            <Ticket className="w-3 h-3" />
                            {ticket.queue.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo(ticket.updated_at)}
                        </span>
                        {ticket.assigned_agent && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {ticket.assigned_agent.display_name ?? ticket.assigned_agent.email}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-400 dark:group-hover:text-blue-500 transition-colors mt-1 shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
