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
      bg: "bg-blue-50 dark:bg-blue-950/40",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "My Assigned",
      value: String(statMyAssigned),
      change: `${statMyAssigned} assigned to you`,
      icon: Users,
      bg: "bg-violet-50 dark:bg-violet-950/40",
      iconColor: "text-violet-600 dark:text-violet-400",
    },
    {
      label: "Resolved Today",
      value: String(statResolvedToday),
      change: "vs yesterday",
      icon: CheckCircle2,
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Avg First Response",
      value: statAvgFirstResponse ?? "—",
      change: statAvgFirstResponse ? "vs last week" : "Calculating…",
      icon: Clock,
      bg: "bg-amber-50 dark:bg-amber-950/40",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Page header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Agent Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
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
