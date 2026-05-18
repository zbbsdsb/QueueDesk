"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, Clock, Calendar } from "lucide-react";
import Modal from "@/components/shared/Modal";
import { createClient } from "@/lib/supabase/client";
import { minutesToSeconds, secondsToMinutes } from "@/lib/utils";
import type { SlaPolicy, BusinessCalendar } from "@/lib/types";

interface BusinessHoursDay {
  enabled: boolean;
  start_time: string;
  end_time: string;
}

interface SLAForm {
  name: string;
  description: string | null;
  business_calendar_id: string;
  first_response_seconds: number | null;
  next_response_seconds: number | null;
  resolution_seconds: number | null;
  pause_on_statuses: string[];
  business_hours: Record<string, BusinessHoursDay>;
}

function formatHours(seconds: number | null): string {
  if (!seconds) return "—";
  const minutes = secondsToMinutes(seconds);
  if (minutes < 60) return `${minutes}m`;
  if (minutes % 60 === 0) return `${minutes / 60}h`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export default function AdminSLAPage() {
  const supabase = createClient();
  const [policies, setPolicies] = useState<SlaPolicy[]>([]);
  const [calendars, setCalendars] = useState<BusinessCalendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editPolicy, setEditPolicy] = useState<SlaPolicy | null>(null);
  const [form, setForm] = useState<SLAForm>({
    name: "",
    description: null,
    business_calendar_id: "",
    first_response_seconds: 3600,
    next_response_seconds: 1800,
    resolution_seconds: 28800,
    pause_on_statuses: ["waiting_customer"],
    business_hours: {},
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    const [policiesRes, calendarsRes] = await Promise.all([
      supabase.from("sla_policy").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("business_calendar").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
    ]);
    setPolicies(policiesRes.data ?? []);
    setCalendars(calendarsRes.data ?? []);
    if (calendarsRes.data?.[0]) {
      setForm(prev => ({ ...prev, business_calendar_id: calendarsRes.data[0].id }));
    }
    setLoading(false);
  }

  useEffect(() => { void loadData(); }, []);

  async function getTenantId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: appUser } = await supabase.from("app_user").select("tenant_id").eq("id", user?.id).single();
    return appUser?.tenant_id ?? "";
  }

  async function handleSave(isNew: boolean) {
    if (!form.name) { setError("Name is required."); return; }
    if (!form.business_calendar_id) { setError("Business calendar is required."); return; }
    setSaving(true);
    setError("");
    try {
      const dbData = { ...form };
      
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
      await loadData();
    } catch (err) {
      setError((err as Error).message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(policy: SlaPolicy) {
    if (!confirm("Are you sure you want to delete this SLA policy?")) return;
    await supabase.from("sla_policy").update({ deleted_at: new Date().toISOString() }).eq("id", policy.id);
    await loadData();
  }

  function handleEditPolicy(policy: SlaPolicy) {
    setForm({
      name: policy.name,
      description: policy.description,
      business_calendar_id: policy.business_calendar_id,
      first_response_seconds: policy.first_response_seconds,
      next_response_seconds: policy.next_response_seconds,
      resolution_seconds: policy.resolution_seconds,
      pause_on_statuses: policy.pause_on_statuses,
      business_hours: (policy.business_hours as Record<string, BusinessHoursDay>) || {},
    });
    setError("");
    setEditPolicy(policy);
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
        <button onClick={() => { 
          setForm({ 
            name: "", 
            description: null, 
            business_calendar_id: calendars[0]?.id ?? "", 
            first_response_seconds: 3600, 
            next_response_seconds: 1800, 
            resolution_seconds: 28800, 
            pause_on_statuses: ["waiting_customer"],
            business_hours: {},
          }); 
          setError(""); 
          setCreateOpen(true); 
        }}
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
            const calendar = calendars.find(c => c.id === policy.business_calendar_id);
            
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
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        First response: <strong className="text-slate-700 dark:text-slate-300">{formatHours(policy.first_response_seconds)}</strong>
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Resolution: <strong className="text-slate-700 dark:text-slate-300">{formatHours(policy.resolution_seconds)}</strong>
                      </span>
                      {calendar && (
                        <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {calendar.name}
                        </span>
                      )}
                      {policy.description && <span className="text-xs text-slate-400 dark:text-slate-500">{policy.description}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleEditPolicy(policy)}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(policy)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
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
            <input value={form.description ?? ""} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value || null }))}
              placeholder="Default SLA for normal priority tickets"
              className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Business Calendar</label>
            <select value={form.business_calendar_id} onChange={(e) => setForm((p) => ({ ...p, business_calendar_id: e.target.value }))}
              className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {calendars.map(cal => (
                <option key={cal.id} value={cal.id}>{cal.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">First Response Target (minutes)</label>
              <input type="number" value={form.first_response_seconds ? secondsToMinutes(form.first_response_seconds) : 0} min={1}
                onChange={(e) => setForm((p) => ({ ...p, first_response_seconds: minutesToSeconds(parseInt(e.target.value) || 0) }))}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p className="mt-1 text-xs text-slate-400">e.g. 60 = 1h, 240 = 4h</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Next Response Target (minutes)</label>
              <input type="number" value={form.next_response_seconds ? secondsToMinutes(form.next_response_seconds) : 0} min={1}
                onChange={(e) => setForm((p) => ({ ...p, next_response_seconds: minutesToSeconds(parseInt(e.target.value) || 0) }))}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p className="mt-1 text-xs text-slate-400">e.g. 30 = 30m</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Resolution Target (minutes)</label>
            <input type="number" value={form.resolution_seconds ? secondsToMinutes(form.resolution_seconds) : 0} min={1}
              onChange={(e) => setForm((p) => ({ ...p, resolution_seconds: minutesToSeconds(parseInt(e.target.value) || 0) }))}
              className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p className="mt-1 text-xs text-slate-400">e.g. 480 = 8h, 1440 = 24h</p>
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
