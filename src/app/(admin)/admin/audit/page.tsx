"use client";

import { useState, useEffect } from "react";
import { Search, Download, Filter, Clock, User, FileText, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";

interface AuditLogEntry {
  audit_id: number;
  occurred_at: string;
  tenant_id: string;
  actor_user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  changed_fields: string[];
  before_data: any;
  after_data: any;
  payload: any;
  actor?: {
    id: string;
    display_name: string | null;
    email: string;
  } | null;
}

export default function AdminAuditPage() {
  const { user: currentUser } = useAuth();
  const supabase = createClient();

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<{ id: string; display_name: string | null; email: string }[]>([]);

  // Filters
  const [actorFilter, setActorFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const ACTION_OPTIONS = [
    "insert",
    "update",
    "delete",
    "soft_delete",
    "restore"
  ];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    // Load users for filter
    const { data: usersData } = await supabase
      .from("app_user")
      .select("id, display_name, email")
      .order("display_name");
    setUsers(usersData ?? []);

    // Load audit logs
    await loadAuditLogs();
    setLoading(false);
  }

  async function loadAuditLogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actorFilter !== "all") params.set("actorUserId", actorFilter);
      if (actionFilter !== "all") params.set("action", actionFilter);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(`/api/audit?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data ?? []);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  }

  function exportToCSV() {
    const headers = ["Timestamp", "Actor", "Action", "Entity Type", "Entity ID", "Changed Fields"];
    const rows = logs.map(log => [
      new Date(log.occurred_at).toLocaleString(),
      log.actor?.display_name ?? log.actor?.email ?? "System",
      log.action,
      log.entity_type,
      log.entity_id ?? "",
      (log.changed_fields ?? []).join(", ")
    ]);

    const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `audit-log-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            View and export audit logs of all actions in your workspace.
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select
          value={actorFilter}
          onChange={(e) => setActorFilter(e.target.value)}
          className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Actors</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.display_name ?? user.email}</option>
          ))}
        </select>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Actions</option>
          {ACTION_OPTIONS.map(action => (
            <option key={action} value={action}>{action.replace("_", " ")}</option>
          ))}
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-slate-400 text-sm">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={loadAuditLogs}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Apply Filters
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Timestamp</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Actor</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Action</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Entity</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-400">Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-400">No audit logs found.</td></tr>
            ) : (
              logs.map(log => (
                <tr key={log.audit_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {new Date(log.occurred_at).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {log.actor?.display_name ?? log.actor?.email ?? "System"}
                        </p>
                        {log.actor?.email && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {log.actor.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                      log.action === "insert" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                      log.action === "update" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                      log.action === "delete" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                      log.action === "soft_delete" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" :
                      log.action === "restore" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}>
                      {log.action.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-mono text-slate-700 dark:text-slate-300">
                      {log.entity_type}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {(log.changed_fields ?? []).length > 0 && (
                        <p className="text-xs">
                          Changed: {(log.changed_fields ?? []).join(", ")}
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
