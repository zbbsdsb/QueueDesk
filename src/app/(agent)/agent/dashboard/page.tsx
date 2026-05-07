// TODO: fetch agent dashboard stats from Supabase
export default function AgentDashboardPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        {/* TODO: SLA stats, open tickets, avg response time */}
        {["Open Tickets", "Avg Response Time", "Resolved Today"].map((s) => (
          <div key={s} className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground mb-1">{s}</p>
            <p className="text-2xl font-bold">—</p>
          </div>
        ))}
      </div>
    </div>
  );
}
