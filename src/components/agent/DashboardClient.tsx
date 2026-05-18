"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ArrowRight, TicketIcon, Users, CheckCircle2, Clock, TrendingUp } from "lucide-react";
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
  Area,
  AreaChart,
} from "recharts";
import {
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
      change: `${statTotalOpen} tickets pending`,
      icon: TicketIcon,
      accentColor: "blue" as const,
      changeType: "neutral" as const,
    },
    {
      label: "My Assigned",
      value: String(statMyAssigned),
      change: "Assigned to you",
      icon: Users,
      accentColor: "violet" as const,
      changeType: "neutral" as const,
    },
    {
      label: "Resolved Today",
      value: String(statResolvedToday),
      change: "Completed today",
      icon: CheckCircle2,
      accentColor: "emerald" as const,
      changeType: "up" as const,
    },
    {
      label: "Avg First Response",
      value: statAvgFirstResponse ?? "—",
      change: statAvgFirstResponse ? "Average response" : "Calculating…",
      icon: Clock,
      accentColor: "amber" as const,
      changeType: "neutral" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      {/* Page Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTYzZWIsMSwwKSIgstb3BlcmF0b3I6Im92ZXIiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        
        <div className="relative px-6 py-8">
          <div className="flex items-center justify-between max-w-[1400px] mx-auto">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Agent Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Welcome back! You have{" "}
                <span className="inline-flex items-center gap-1 font-semibold text-primary">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  {statMyAssigned} open ticket{statMyAssigned !== 1 ? "s" : ""}
                </span>{" "}
                assigned to you.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                href="/agent/tickets/new"
                className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
                New Ticket
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 max-w-[1400px] mx-auto space-y-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket Volume Trend */}
          <div className="lg:col-span-2 group relative overflow-hidden bg-surface border border-border/50 rounded-2xl p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-accent/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative flex items-center justify-between mb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h2 className="text-base font-semibold text-foreground">
                    Ticket Volume
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  Incoming vs resolved — last 7 days
                </p>
              </div>
              
              <div className="flex bg-secondary/30 rounded-xl p-1 gap-1">
                {(["week", "month"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`text-xs px-4 py-2 rounded-lg capitalize transition-all duration-200 font-medium ${
                      period === p
                        ? "bg-primary text-white shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            
            {weeklyStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={weeklyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12, fill: 'currentColor', className: 'text-muted-foreground' }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: 'currentColor', className: 'text-muted-foreground' }} 
                    axisLine={false} 
                    tickLine={false} 
                    width={28} 
                  />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.95)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="tickets" stroke="#2563eb" strokeWidth={2} fill="url(#blueGradient)" name="Incoming" />
                  <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} fill="url(#emeraldGradient)" name="Resolved" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[260px] text-sm text-muted-foreground">
                <div className="w-16 h-16 rounded-2xl bg-secondary/30 flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8 text-muted-foreground/50" />
                </div>
                No data yet
              </div>
            )}
            
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border/50">
              <span className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                <span className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/30" />
                Incoming
              </span>
              <span className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30" />
                Resolved
              </span>
            </div>
          </div>

          {/* Queue Breakdown */}
          <div className="group relative overflow-hidden bg-surface border border-border/50 rounded-2xl p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/3 to-primary/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative space-y-1 mb-5">
              <h2 className="text-base font-semibold text-foreground">
                Queue Breakdown
              </h2>
              <p className="text-xs text-muted-foreground">Active tickets by queue</p>
            </div>
            
            {queueData.length > 0 ? (
              <div className="flex items-center gap-6">
                <div className="relative">
                  <ResponsiveContainer width={140} height={140}>
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
                          <Cell key={index} fill={entry.color} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(15, 23, 42, 0.95)',
                          backdropFilter: 'blur(12px)',
                          border: '1px solid rgba(148, 163, 184, 0.2)',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Center Label */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">
                        {queueData.reduce((s, q) => s + q.value, 0)}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 space-y-3">
                  {queueData.map((q) => (
                    <div key={q.name} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: q.color }} />
                        {q.name}
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {q.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[140px] text-sm text-muted-foreground">
                <div className="w-12 h-12 rounded-xl bg-secondary/30 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                </div>
                No queue data yet
              </div>
            )}
            
            <div className="relative mt-5 pt-4 border-t border-border/50 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total active</span>
              <span className="text-sm font-bold text-foreground">
                {queueData.reduce((s, q) => s + q.value, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="group relative overflow-hidden bg-surface border border-border/50 rounded-2xl transition-all duration-300 hover:border-primary/20 hover:shadow-lg">
          <div className="relative flex items-center justify-between px-6 py-5 border-b border-border/50">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">
                Recent Tickets
              </h2>
              <p className="text-xs text-muted-foreground">Latest 5 tickets across all queues</p>
            </div>
            <Link
              href="/agent/tickets"
              className="group/link inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              View all
              <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
            </Link>
          </div>
          
          {recentTickets.length > 0 ? (
            <div className="divide-y divide-border/50">
              {recentTickets.map((ticket) => (
                <TicketRow key={ticket.id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <div className="px-6 py-14 text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary/30 flex items-center justify-center mx-auto mb-4">
                <TicketIcon className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground">No tickets yet.</p>
              <Link 
                href="/agent/tickets/new" 
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors mt-2"
              >
                Create one
                <Plus className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
