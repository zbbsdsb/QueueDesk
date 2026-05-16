"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ArrowRight, TicketIcon, Users, CheckCircle2, Clock } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  QUEUE_COLORS,
  type TicketStatus,
  type TicketPriority,
} from "@/lib/types";
import StatCard from "./StatCard";
import TicketRow from "./TicketRow";

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

interface DashboardClientProps {
  statTotalOpen: number;
  statMyAssigned: number;
  statResolvedToday: number;
  statAvgFirstResponse: string | null;
  weeklyStats: DailyCount[];
  queueData: QueueCount[];
  recentTickets: TicketWithQueue[];
  slaSummary: SLASummary;
}

export default function DashboardClient({
  statTotalOpen,
  statMyAssigned,
  statResolvedToday,
  statAvgFirstResponse,
  weeklyStats,
  queueData,
  recentTickets,
  slaSummary,
}: DashboardClientProps) {
  const [period, setPeriod] = useState<"week" | "month">("week");

  const statCards = [
    {
      label: "Total Open",
      value: String(statTotalOpen),
      change: `${statTotalOpen} open`,
      icon: TicketIcon,
      bg: "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "My Assigned",
      value: String(statMyAssigned),
      change: `${statMyAssigned} assigned to you`,
      icon: Users,
      bg: "bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/40 dark:to-violet-900/30",
      iconColor: "text-violet-600 dark:text-violet-400",
    },
    {
      label: "Resolved Today",
      value: String(statResolvedToday),
      change: "vs yesterday",
      icon: CheckCircle2,
      bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Avg First Response",
      value: statAvgFirstResponse ?? "—",
      change: statAvgFirstResponse ? "vs last week" : "Calculating…",
      icon: Clock,
      bg: "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      {/* Page header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800 px-6 py-6">
        <div className="flex items-center justify-between max-w-[1400px]">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Agent Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              You have{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {statMyAssigned} open ticket{statMyAssigned !== 1 ? "s" : ""}
              </span>{" "}
              assigned to you.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/agent/tickets/new"
              className="premium-btn flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-95 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              New Ticket
            </Link>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6 max-w-[1400px]">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket volume trend */}
          <div className="premium-card lg:col-span-2 bg-white/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Ticket Volume
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Incoming vs resolved — last 7 days
                </p>
              </div>
              <div className="flex bg-slate-100/70 dark:bg-slate-800/80 rounded-xl p-1 gap-1">
                {(["week", "month"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`text-xs px-4 py-2 rounded-lg capitalize transition-all font-medium ${
                      period === p
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            {weeklyStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={weeklyStats} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" className="dark:stroke-slate-800" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(30, 41, 59, 0.95)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="tickets" fill="url(#blueGradient)" radius={[8, 8, 0, 0]} name="In" />
                  <Bar dataKey="resolved" fill="url(#emeraldGradient)" radius={[8, 8, 0, 0]} name="Resolved" />
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0.9" />
                    </linearGradient>
                    <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[240px] text-sm text-slate-400">
                No data yet
              </div>
            )}
            <div className="flex items-center gap-6 mt-4">
              <span className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 inline-block shadow-sm" />
                Incoming
              </span>
              <span className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 inline-block shadow-sm" />
                Resolved
              </span>
            </div>
          </div>

          {/* Queue breakdown */}
          <div className="premium-card bg-white/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700 backdrop-blur-sm rounded-2xl p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
              Queue Breakdown
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Active tickets by queue</p>
            {queueData.length > 0 ? (
              <div className="flex items-center gap-5">
                <ResponsiveContainer width={150} height={150}>
                  <PieChart>
                    <Pie
                      data={queueData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {queueData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "rgba(30, 41, 59, 0.95)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(148, 163, 184, 0.2)",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2.5">
                  {queueData.map((q) => (
                    <div key={q.name} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-full inline-block shadow-sm" style={{ background: q.color }} />
                        {q.name}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {q.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 mt-4">No queue data yet.</p>
            )}
            <div className="mt-5 pt-4 border-t border-slate-100/60 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">Total active</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {queueData.reduce((s, q) => s + q.value, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Recent tickets */}
        <div className="premium-card bg-white/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700 backdrop-blur-sm rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100/60 dark:border-slate-700/60">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Recent Tickets
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Latest 5 tickets across all queues</p>
            </div>
            <Link
              href="/agent/tickets"
              className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentTickets.length > 0 ? (
            recentTickets.map((ticket) => (
              <TicketRow key={ticket.id} ticket={ticket} />
            ))
          ) : (
            <div className="px-6 py-14 text-center text-sm text-slate-400">
              No tickets yet.{" "}
              <Link href="/agent/tickets/new" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
                Create one
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
