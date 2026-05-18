import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  QUEUE_COLORS,
  type TicketStatus,
  type TicketPriority,
} from "@/lib/types";
import DashboardClient from "@/components/agent/DashboardClient";

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

export default async function AgentDashboardPage() {
  const supabase = await createClient();

  // 获取当前用户
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const { data: appUser } = await supabase
    .from("app_user")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (!appUser) {
    redirect("/login");
  }

  const tenantId = appUser.tenant_id;

  // 1. 获取统计数据
  const [
    totalOpenRes, myAssignedRes, resolvedTodayRes] = await Promise.all([
      supabase
      .from("ticket")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .is("deleted_at", null)
      .not("status", "in", '("resolved","closed")'),

    supabase
      .from("ticket")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("assignee_user_id", appUser.id)
      .is("deleted_at", null)
      .not("status", "in", '("resolved","closed")'),

    supabase
      .from("ticket")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("status", "resolved")
      .gte("updated_at", new Date().toISOString().slice(0, 10)),
  ]);

  const statTotalOpen = totalOpenRes.count ?? 0;
  const statMyAssigned = myAssignedRes.count ?? 0;
  const statResolvedToday = resolvedTodayRes.count ?? 0;
  const statAvgFirstResponse = null;

  // 2. 获取每周统计数据
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
      if (upd >= sevenDaysAgo.getTime() && buckets[key]) {
        buckets[key].resolved++;
      }
    }
  });
  const weeklyStats: DailyCount[] = Object.entries(buckets).map(([day, vals]) => ({ day, ...vals }));

  // 3. 获取队列分布数据
  const { data: queueTickets } = await supabase
    .from("ticket")
    .select("queue:queue_id(name)")
    .eq("tenant_id", tenantId)
    .is("deleted_at", null)
    .not("status", "in", '("resolved","closed")');

  const qCount: Record<string, number> = {};
  (queueTickets ?? []).forEach((t: { queue: { name: string } | null }) => {
    const name = t.queue?.name ?? "Unassigned";
    qCount[name] = (qCount[name] ?? 0) + 1;
  });
  const queueData: QueueCount[] = Object.entries(qCount).map(([name, value], i) => ({
    name,
    value,
    color: QUEUE_COLORS[i % QUEUE_COLORS.length],
  }));

  // 4. 获取最近的工单
  const { data: recent } = await supabase
    .from("ticket")
    .select(`
      id, subject, status, priority, created_at,
      queue:queue_id(name),
      requester:requester_user_id(display_name, email)
    `)
    .eq("tenant_id", tenantId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(5);

  const recentTickets: TicketWithQueue[] = (recent as any[]) ?? [];

  // 5. 获取 SLA 摘要信息
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
    .eq("status", "pending")
    .is("deleted_at", null);

  const fourHoursAgo = new Date(Date.now() - 4 * 3600000).toISOString();
  const oneDayAgo = new Date(Date.now() - 24 * 3600000).toISOString();

  const { count: breachedCount } = await supabase
    .from("ticket")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .in("status", ["open", "pending"])
    .lt("updated_at", oneDayAgo)
    .is("deleted_at", null);

  const { count: atRiskCount } = await supabase
    .from("ticket")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .in("status", ["open", "pending"])
    .lt("updated_at", fourHoursAgo)
    .gte("updated_at", oneDayAgo)
    .is("deleted_at", null);

  const totalActive = (openCount ?? 0) + (inProgCount ?? 0);
  const onTrack = Math.max(0, totalActive - (breachedCount ?? 0) - (atRiskCount ?? 0));

  const slaSummary: SLASummary = {
    label: "First Response",
    onTrack,
    atRisk: atRiskCount ?? 0,
    breached: breachedCount ?? 0,
    color: "blue",
  };

  return (
    <DashboardClient
      statTotalOpen={statTotalOpen}
      statMyAssigned={statMyAssigned}
      statResolvedToday={statResolvedToday}
      statAvgFirstResponse={statAvgFirstResponse}
      weeklyStats={weeklyStats}
      queueData={queueData}
      recentTickets={recentTickets}
      slaSummary={slaSummary}
    />
  );
}
