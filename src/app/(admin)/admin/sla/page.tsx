"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Edit2, Archive, Clock } from "lucide-react";
import Modal from "@/components/shared/Modal";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";
import { minutesToSeconds, secondsToMinutes } from "@/lib/utils";

// Database uses seconds, but we'll use minutes in the UI
type SLAPolicyRow = Database["public"]["Tables"]["sla_policy"]["Row"];

interface SLAPolicyWithMinutes extends Omit<SLAPolicyRow, "first_response_target_minutes" | "resolution_target_minutes"> {
  first_response_seconds: number | null;
  next_response_seconds: number | null;
  resolution_seconds: number | null;
}

interface SLAForm {
  name: string;
  description: string;
  first_response_target_minutes: number;
  resolution_target_minutes: number;
  status: "active" | "archived";
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  archived: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

function formatHours(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  if (minutes % 60 === 0) return `${minutes / 60}h`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

interface SLAForm {
  name: string;
  description: string;
  first_response_target_minutes: number;
  resolution_target_minutes: number;
  status: "active" | "archived";
}

export default function AdminSLAPage() {
  const supabase = createClient();
  const [policies, setPolicies] = useState<SLAPolicyWithMinutes[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editPolicy, setEditPolicy] = useState<SLAPolicyWithMinutes | null>(null);
  const [form, setForm] = useState<SLAForm>({
    name: "", description: "",
    first_response_target_minutes: 60,
    resolution_target_minutes: 480,
    status: "active",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadPolicies() {
    setLoading(true);
    // Database schema uses seconds: first_response_seconds, resolution_seconds
    const { data } = await supabase.from("sla_policy").select("*").is("deleted_at", null).order("created_at", { ascending: false });
    setPolicies((data as unknown as SLAPolicyWithMinutes[]) ?? []);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void loadPolicies(); }, []);

  async function getTenantId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: appUser } = await supabase.from("app_user").select("tenant_id").eq("id", user?.id).single();
    return appUser?.tenant_id ?? "";
  }

  async function handleSave(isNew: boolean) {
    if (!form.name) { setError("Name is required."); return; }
    setSaving(true);
    setError("");
    try {
      // Convert minutes to seconds for database
      const dbData = {
        name: form.name,
        description: form.description,
        first_response_seconds: minutesToSeconds(form.first_response_target_minutes),
        resolution_seconds: minutesToSeconds(form.resolution_target_minutes),
        status: form.status,
      };
      
      if (isNew) {
        const tenantId = await getTenantId();
        const { error: err } = await supabase.from("sla_policy").insert({ ...dbData, tenant_id: tenantId });
        if (err) throw err;
        setCreateOpen(false);
      } else if (editPolicy) {
        const { error: err } = await supabase.from("sla_policy").update(dbData).eq("id", editPolicy.id);
        if (err) throw err;
        setEditPolicy(null);
      }
      await loadPolicies();
    } catch (err: unknown) {
      setError((err as Error).message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(policy: SLAPolicyWithMinutes) {
    await supabase.from("sla_policy").update({ status: "archived" }).eq("id", policy.id);
    await loadPolicies();
  }

  const filtered = policies.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          SLA policies define response and resolution time targets per priority level.
        </p>
        <button onClick={() => { setForm({ name: "", description: "", first_response_target_minutes: 60, resolution_target_minutes: 480, status: "active" }); setError(""); setCreateOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> New SLA Policy
        </button>
      </div>

      <div className="mb-5 max-w-xs">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search policies..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="grid gap-3">
        {loading ? (
          <div className="text-center py-12 text-sm text-slate-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No SLA policies yet.</p>
          </div>
        ) : (
          filtered.map((policy) => {
            // Convert seconds to minutes for display
            const firstRespMinutes = secondsToMinutes(policy.first_response_seconds);
            const resolutionMinutes = secondsToMinutes(policy.resolution_seconds);
            
            return (
              <div key={policy.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{policy.name}</h3>
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_COLORS[policy.status]}`}>{policy.status}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        First response: <strong className="text-slate-700 dark:text-slate-300">{formatHours(firstRespMinutes)}</strong>
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Resolution: <strong className="text-slate-700 dark:text-slate-300">{formatHours(resolutionMinutes)}</strong>
                      </span>
                      {policy.description && <span className="text-xs text-slate-400 dark:text-slate-500">{policy.description}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => { 
                    setForm({ 
                      name: policy.name, 
                      description: policy.description ?? "", 
                      first_response_target_minutes: firstRespMinutes, 
                      resolution_target_minutes: resolutionMinutes, 
                      status: policy.status 
                    }); 
                    setError(""); 
                    setEditPolicy(policy); 
                  }}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {policy.status !== "archived" && (
                    <button onClick={() => handleArchive(policy)}
                      className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                      <Archive className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal open={createOpen || !!editPolicy} onClose={() => { setCreateOpen(false); setEditPolicy(null); setError(""); }}
        title={editPolicy ? "Edit SLA Policy" : "New SLA Policy"}
        footer={<>
          <button onClick={() => { setCreateOpen(false); setEditPolicy(null); setError(""); }}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Cancel</button>
          <button onClick={() => handleSave(!!createOpen)} disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors">
            {saving ? "Saving..." : editPolicy ? "Save Changes" : "Create Policy"}
          </button>
        </>}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Policy Name</label>
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Standard SLA"
              className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description <span className="text-slate-400 font-normal">(optional)</span></label>
            <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Default SLA for normal priority tickets"
              className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">First Response Target (minutes)</label>
              <input type="number" value={form.first_response_target_minutes} min={1}
                onChange={(e) => setForm((p) => ({ ...p, first_response_target_minutes: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p className="mt-1 text-xs text-slate-400">e.g. 60 = 1h, 240 = 4h</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Resolution Target (minutes)</label>
              <input type="number" value={form.resolution_target_minutes} min={1}
                onChange={(e) => setForm((p) => ({ ...p, resolution_target_minutes: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p className="mt-1 text-xs text-slate-400">e.g. 480 = 8h, 1440 = 24h</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as SLAForm["status"] }))}
              className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
