"use client";

import { useState } from "react";
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

// ── Mock / demo data ────────────────────────────────────────────────────────

const WEEKLY_STATS = [
  { day: "Mon", tickets: 12, resolved: 9 },
  { day: "Tue", tickets: 19, resolved: 15 },
  { day: "Wed", tickets: 8, resolved: 10 },
  { day: "Thu", tickets: 24, resolved: 18 },
  { day: "Fri", tickets: 16, resolved: 14 },
  { day: "Sat", tickets: 5, resolved: 6 },
  { day: "Sun", tickets: 3, resolved: 3 },
];

const QUEUE_DATA = [
  { name: "IT Support", value: 28, color: "#3b82f6" },
  { name: "HR", value: 15, color: "#8b5cf6" },
  { name: "Finance", value: 9, color: "#f59e0b" },
  { name: "Operations", value: 12, color: "#10b981" },
];

const RECENT_TICKETS = [
  {
    id: "TKT-0089",
    title: "VPN not connecting from home",
    requester: "alice@company.com",
    queue: "IT Support",
    priority: "high",
    status: "open",
    created: "10 min ago",
  },
  {
    id: "TKT-0088",
    title: "Password reset for payroll system",
    requester: "bob@company.com",
    queue: "IT Support",
    priority: "medium",
    status: "pending",
    created: "28 min ago",
  },
  {
    id: "TKT-0087",
    title: "Annual leave approval pending",
    requester: "carol@company.com",
    queue: "HR",
    priority: "low",
    status: "open",
    created: "1 hr ago",
  },
  {
    id: "TKT-0086",
    title: "Invoice reconciliation needed",
    requester: "david@company.com",
    queue: "Finance",
    priority: "high",
    status: "in_progress",
    created: "2 hr ago",
  },
  {
    id: "TKT-0085",
    title: "New laptop request — Marketing",
    requester: "eve@company.com",
    queue: "IT Support",
    priority: "medium",
    status: "resolved",
    created: "3 hr ago",
  },
];

const STAT_CARDS = [
  {
    label: "Total Open",
    value: "64",
    change: "+12%",
    icon: TicketIcon,
    color: "blue",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    label: "My Assigned",
    value: "18",
    change: "+3",
    icon: Users,
    color: "violet",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    label: "Resolved Today",
    value: "23",
    change: "+8 vs yesterday",
    icon: CheckCircle2,
    color: "emerald",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    label: "Avg First Response",
    value: "1.4h",
    change: "-22% vs last week",
    icon: Clock,
    color: "amber",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
];

const PRIORITY_COLOR: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  low: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
};

const STATUS_COLOR: Record<string, string> = {
  open: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  in_progress: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  closed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981"];

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  change,
  icon: Icon,
  bg,
  iconColor,
}: (typeof STAT_CARDS)[number]) {
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

function TicketRow({
  id,
  title,
  requester,
  queue,
  priority,
  status,
  created,
}: (typeof RECENT_TICKETS)[number]) {
  return (
    <Link
      href={`/agent/tickets/${id}`}
      className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 group"
    >
      <span className="text-xs font-mono text-slate-400 dark:text-slate-500 w-16 shrink-0">
        {id}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{requester}</p>
      </div>
      <span className="text-xs text-slate-500 dark:text-slate-400 w-24 shrink-0 text-center hidden sm:block">
        {queue}
      </span>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize hidden md:flex items-center gap-1 w-20 shrink-0 justify-center ${PRIORITY_COLOR[priority]}`}>
        {priority === "high" && <AlertCircle className="w-3 h-3" />}
        {priority}
      </span>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize w-20 shrink-0 text-center ${STATUS_COLOR[status]}`}>
        {status.replace("_", " ")}
      </span>
      <span className="text-xs text-slate-400 dark:text-slate-500 w-16 shrink-0 text-right hidden lg:block">
        {created}
      </span>
      <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0 group-hover:text-blue-500 transition-colors" />
    </Link>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function AgentDashboardPage() {
  const [period, setPeriod] = useState<"week" | "month">("week");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Page header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Agent Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Welcome back — you have <span className="font-semibold text-blue-600 dark:text-blue-400">18 open tickets</span> assigned to you.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/agent/tickets/new"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm"
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
          {STAT_CARDS.map((card) => (
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
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={WEEKLY_STATS} barGap={4}>
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
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie
                    data={QUEUE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {QUEUE_DATA.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
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
                {QUEUE_DATA.map((q, i) => (
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
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">Total open</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {QUEUE_DATA.reduce((s, q) => s + q.value, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Response time trend + SLA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Response time trend */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-slate-800 dark:text-white">
                  First Response Time
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Hours — rolling 7 days</p>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={[
                { day: "Mon", avg: 2.1 }, { day: "Tue", avg: 1.8 },
                { day: "Wed", avg: 1.5 }, { day: "Thu", avg: 1.6 },
                { day: "Fri", avg: 1.4 }, { day: "Sat", avg: 0.9 },
                { day: "Sun", avg: 0.7 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" className="dark:stroke-slate-800" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={28} unit="h" />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                  formatter={(v) => [`${v}h`, "Avg"]}
                />
                <Line
                  type="monotone"
                  dataKey="avg"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#8b5cf6" }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-3 flex items-center gap-2 bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 rounded-lg px-3 py-2">
              <Zap className="w-3.5 h-3.5 text-violet-500" />
              <p className="text-xs text-violet-700 dark:text-violet-300">
                Avg first response improved <strong>22%</strong> this week — keep it up!
              </p>
            </div>
          </div>

          {/* SLA summary */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-4">
              SLA Status
            </h2>
            <div className="space-y-4">
              {[
                { label: "First Response", onTrack: 87, atRisk: 9, breached: 4, color: "blue" },
                { label: "Resolution", onTrack: 72, atRisk: 15, breached: 13, color: "violet" },
              ].map((sla) => (
                <div key={sla.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      {sla.label}
                    </span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {sla.onTrack}% on track
                      </span>
                      <span className="text-yellow-600 dark:text-yellow-400">
                        {sla.atRisk}% at risk
                      </span>
                      <span className="text-red-500">
                        {sla.breached}% breached
                      </span>
                    </div>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 gap-0.5">
                    <div
                      className="bg-emerald-500 rounded-full"
                      style={{ width: `${sla.onTrack}%` }}
                    />
                    <div
                      className="bg-yellow-400 rounded-full"
                      style={{ width: `${sla.atRisk}%` }}
                    />
                    <div
                      className="bg-red-500 rounded-full"
                      style={{ width: `${sla.breached}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Tickets breaching SLA</span>
                <span className="text-sm font-bold text-red-500">7</span>
              </div>
              <Link
                href="/agent/tickets?filter=sla_breached"
                className="mt-2 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all breaching tickets <ArrowRight className="w-3 h-3" />
              </Link>
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
          <TicketRow {...RECENT_TICKETS[0]} />
          <TicketRow {...RECENT_TICKETS[1]} />
          <TicketRow {...RECENT_TICKETS[2]} />
          <TicketRow {...RECENT_TICKETS[3]} />
          <TicketRow {...RECENT_TICKETS[4]} />
        </div>
      </div>
    </div>
  );
}
