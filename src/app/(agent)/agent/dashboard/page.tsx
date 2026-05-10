"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  TicketIcon,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Users,
  Zap,
  Plus,
  Search,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import {
  TICKET_STATUS_CONFIG,
  TICKET_PRIORITY_CONFIG,
  QUEUE_COLORS,
  SLA_STATUS_COLORS,
  type TicketStatus,
  type TicketPriority,
} from "@/lib/types";
import { getAge } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

type TicketWithQueue = {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  queue?: { name: string } | null;
  requester?: { display_name: string | null; email: string } | null;
};

type QueueCount = {
  name: string;
  value: number;
  color: string;
};

type DailyCount = {
  day: string;
  tickets: number;
  resolved: number;
};

type SLASummary = {
  label: string;
  onTrack: number;
  atRisk: number;
  breached: number;
  color: string;
};

// ── Sub-components ────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  change,
  icon: Icon,
  bg,
  iconColor,
}: {
  label: string;
  value: string | number;
  change: string;
  icon: React.ElementType;
  bg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`${bg} rounded-xl p-3`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{value}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{change}</p>
      </div>
    </div>
  );
}

function TicketRow({ ticket }: { ticket: TicketWithQueue }) {
  const statusCfg = TICKET_STATUS_CONFIG[ticket.status];
  const priorityCfg = TICKET_PRIORITY_CONFIG[ticket.priority];
  const age = getAge(ticket.created_at);

  return (
    <Link
      href={`/agent/tickets/${ticket.id}`}
      className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 group"
    >
      <span className="text-xs font-mono text-slate-400 dark:text-slate-500 w-16 shrink-0">
        {ticket.id.slice(0, 8)}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {ticket.subject}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          {ticket.requester?.display_name ?? ticket.requester?.email ?? "Unknown"}
        </p>
      </div>
      <span className="text-xs text-slate-500 dark:text-slate-400 w-24 shrink-0 text-center hidden sm:block">
        {ticket.queue?.name ?? "—"}
      </span>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize hidden md:flex items-center gap-1 w-20 shrink-0 justify-center ${priorityCfg.bg} ${priorityCfg.text}`}>
        {ticket.priority === "urgent" && <AlertCircle className="w-3 h-3" />}
        {priorityCfg.label}
      </span>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-20 shrink-0 text-center ${statusCfg.bg} ${statusCfg.text}`}>
        {statusCfg.label}
      </span>
      <span className="text-xs text-slate-400 dark:text-slate-500 w-16 shrink-0 text-right hidden lg:block">
        {age}
      </span>
      <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0 group-hover:text-blue-500 transition-colors" />
    </Link>
  );
}

// ── Main page ────────────────────────────────────────────────────────────

export default function AgentDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();

  const [period, setPeriod] = useState<"week" | "month">("week");
  const [loading, setLoading] = useState(true);

  // Data states
  const [statTotalOpen, setStatTotalOpen] = useState<number | null>(null);
  const [statMyAssigned, setStatMyAssigned] = useState<number | null>(null);
  const [statResolvedToday, setStatResolvedToday] = useState<number | null>(null);
  const [statAvgFirstResponse, setStatAvgFirstResponse] = useState<string | null>(null);

  const [weeklyStats, setWeeklyStats] = useState<DailyCount[]>([]);
  const [queueData, setQueueData] = useState<QueueCount[]>([]);
  const [recentTickets, setRecentTickets] = useState<TicketWithQueue[]>([]);
  const [slaSummary, setSlaSummary] = useState<SLASummary | null>(null);

  const tenantId = user?.tenant_id;

  // ── Data fetching ─────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);

    try {
      // 1. Stat cards
      const [
        totalOpenRes,
        myAssignedRes,
        resolvedTodayRes,
      ] = await Promise.all([
        supabase
          .from("ticket")
          .select("*", { count: "exact", head: true })
          .eq("tenant_id", tenantId)
          .is("deleted_at", null)
          .not("status", "in", '("resolved","closed","cancelled")'),

        supabase
          .from("ticket")
          .select("*", { count: "exact", head: true })
          .eq("tenant_id", tenantId)
          .eq("assigned_agent_id", user!.id)
          .is("deleted_at", null)
          .not("status", "in", '("resolved","closed","cancelled")'),

        supabase
          .from("ticket")
          .select("*", { count: "exact", head: true })
          .eq("tenant_id", tenantId)
          .eq("status", "resolved")
          .gte("updated_at", new Date().toISOString().slice(0, 10)),
      ]);

      setStatTotalOpen(totalOpenRes.count ?? 0);
      setStatMyAssigned(myAssignedRes.count ?? 0);
      setStatResolvedToday(resolvedTodayRes.count ?? 0);

      // 2. Weekly stats (last 7 days, by created_at date)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      const { data: weekTickets } = await supabase
        .from("ticket")
        .select("created_at,status,updated_at")
        .eq("tenant_id", tenantId)
        .gte("created_at", sevenDaysAgo.toISOString())
        .is("deleted_at", null);

      const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const buckets: Record<string, { tickets: number; resolved: number }> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = dayLabels[d.getDay()];
        buckets[key] = { tickets: 0, resolved: 0 };
      }
      (weekTickets ?? []).forEach((t: { created_at: string; status: string; updated_at: string }) => {
        const key = dayLabels[new Date(t.created_at).getDay()];
        if (buckets[key]) buckets[key].tickets++;
        if (t.status === "resolved") {
          const upd = new Date(t.updated_at).getTime();
          const created = new Date(t.created_at).getTime();
          // Only count if resolved within the week window
          if (upd >= sevenDaysAgo.getTime() && buckets[key]) {
            buckets[key].resolved++;
          }
        }
      });
      setWeeklyStats(
        Object.entries(buckets).map(([day, vals]) => ({ day, ...vals }))
      );

      // 3. Queue breakdown
      const { data: queueTickets } = await supabase
        .from("ticket")
        .select("queue:queue_id(name)")
        .eq("tenant_id", tenantId)
        .is("deleted_at", null)
        .not("status", "in", '("resolved","closed","cancelled")');

      const qCount: Record<string, number> = {};
      (queueTickets ?? []).forEach((t: { queue: { name: string } | null }) => {
        const name = t.queue?.name ?? "Unassigned";
        qCount[name] = (qCount[name] ?? 0) + 1;
      });
      setQueueData(
        Object.entries(qCount).map(([name, value], i) => ({
          name,
          value,
          color: QUEUE_COLORS[i % QUEUE_COLORS.length],
        }))
      );

      // 4. Recent tickets
      const { data: recent } = await supabase
        .from("ticket")
        .select(`
          id, subject, status, priority, created_at,
          queue:queue_id(name),
          requester:requester_id(display_name, email)
        `)
        .eq("tenant_id", tenantId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentTickets((recent as TicketWithQueue[]) ?? []);

      // 5. SLA summary (simplified: based on ticket counts by status)
      const { count: openCount } = await supabase
        .from("ticket")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .eq("status", "open")
        .is("deleted_at", null);

      const { count: inProgCount } = await supabase
        .from("ticket")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .eq("status", "in_progress")
        .is("deleted_at", null);

      // Simplified SLA: "on track" = recently updated, "at risk" = older than 4h, "breached" = older than 24h
      const fourHoursAgo = new Date(Date.now() - 4 * 3600000).toISOString();
      const oneDayAgo = new Date(Date.now() - 24 * 3600000).toISOString();

      const { count: breachedCount } = await supabase
        .from("ticket")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .in("status", ["open", "in_progress"])
        .lt("updated_at", oneDayAgo)
        .is("deleted_at", null);

      const { count: atRiskCount } = await supabase
        .from("ticket")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .in("status", ["open", "in_progress"])
        .lt("updated_at", fourHoursAgo)
        .gte("updated_at", oneDayAgo)
        .is("deleted_at", null);

      const totalActive = (openCount ?? 0) + (inProgCount ?? 0);
      const onTrack = Math.max(0, totalActive - (breachedCount ?? 0) - (atRiskCount ?? 0));

      setSlaSummary({
        label: "First Response",
        onTrack,
        atRisk: atRiskCount ?? 0,
        breached: breachedCount ?? 0,
        color: "blue",
      });

    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Failed to load dashboard",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }, [tenantId, supabase, user, toast]);

  useEffect(() => {
    if (tenantId) fetchAll();
  }, [tenantId, fetchAll]);

  // ── Derive stat cards from real data ──────────────────────────────────

  const statCards = [
    {
      label: "Total Open",
      value: statTotalOpen !== null ? String(statTotalOpen) : "…",
      change: statTotalOpen !== null ? `${statTotalOpen} open` : "Loading…",
      icon: TicketIcon,
      bg: "bg-blue-50 dark:bg-blue-950/40",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "My Assigned",
      value: statMyAssigned !== null ? String(statMyAssigned) : "…",
      change: statMyAssigned !== null ? `${statMyAssigned} assigned to you` : "Loading…",
      icon: Users,
      bg: "bg-violet-50 dark:bg-violet-950/40",
      iconColor: "text-violet-600 dark:text-violet-400",
    },
    {
      label: "Resolved Today",
      value: statResolvedToday !== null ? String(statResolvedToday) : "…",
      change: statResolvedToday !== null ? `vs yesterday` : "Loading…",
      icon: CheckCircle2,
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Avg First Response",
      value: statAvgFirstResponse ?? "…",
      change: statAvgFirstResponse ? "vs last week" : "Calculating…",
      icon: Clock,
      bg: "bg-amber-50 dark:bg-amber-950/40",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
  ];

  // ── Skeleton loader ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-5 animate-pulse">
          <div className="h-7 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-72 bg-slate-100 dark:bg-slate-800 rounded mt-2" />
        </div>
        <div className="px-6 py-6 space-y-6 max-w-[1400px]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Page header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Agent Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {statMyAssigned !== null && (
                <>
                  You have{" "}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {statMyAssigned} open ticket{statMyAssigned !== 1 ? "s" : ""}
                  </span>{" "}
                  assigned to you.
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/agent/tickets/new"
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Ticket
            </Link>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6 max-w-[1400px]">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket volume trend */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-slate-800 dark:text-white">
                  Ticket Volume
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Incoming vs resolved — last 7 days
                </p>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 gap-1">
                {(["week", "month"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`text-xs px-3 py-1.5 rounded-md capitalize transition-colors ${
                      period === p
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-medium"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            {weeklyStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyStats} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" className="dark:stroke-slate-800" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip
                    contentStyle={{
                      background: "#1e293b",
                      border: "none",
                      borderRadius: "10px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="tickets" fill="#3b82f6" radius={[6, 6, 0, 0]} name="In" />
                  <Bar dataKey="resolved" fill="#10b981" radius={[6, 6, 0, 0]} name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-sm text-slate-400">
                No data yet
              </div>
            )}
            <div className="flex items-center gap-5 mt-3">
              <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="w-3 h-3 rounded bg-blue-500 inline-block" />
                Incoming
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
                Resolved
              </span>
            </div>
          </div>

          {/* Queue breakdown */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-1">
              Queue Breakdown
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Active tickets by queue</p>
            {queueData.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie
                      data={queueData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {queueData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#1e293b",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {queueData.map((q) => (
                    <div key={q.name} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: q.color }} />
                        {q.name}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {q.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 mt-4">No queue data yet.</p>
            )}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">Total active</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {queueData.reduce((s, q) => s + q.value, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Recent tickets */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-white">
                Recent Tickets
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Latest 5 tickets across all queues</p>
            </div>
            <Link
              href="/agent/tickets"
              className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentTickets.length > 0 ? (
            recentTickets.map((ticket) => (
              <TicketRow key={ticket.id} ticket={ticket} />
            ))
          ) : (
            <div className="px-5 py-12 text-center text-sm text-slate-400">
              No tickets yet.{" "}
              <Link href="/agent/tickets/new" className="text-blue-600 hover:underline">
                Create one
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
