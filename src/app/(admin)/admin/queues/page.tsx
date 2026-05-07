"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Edit2, Archive, ListTodo } from "lucide-react";
import Modal from "@/components/shared/Modal";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Queue = Database["public"]["Tables"]["queue"]["Row"];

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  paused: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  archived: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

const ROUTING_LABELS: Record<string, string> = {
  manual: "Manual",
  round_robin: "Round Robin",
  skill_based: "Skill Based",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

const VISIBILITY_LABELS: Record<string, string> = {
  internal: "Internal",
  restricted: "Restricted",
};

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

interface QueueForm {
  name: string;
  slug: string;
  description: string;
  default_priority: "low" | "normal" | "high" | "urgent";
  routing_mode: "manual" | "round_robin" | "skill_based";
  visibility: "internal" | "restricted";
  status: "active" | "paused" | "archived";
}

export default function AdminQueuesPage() {
  const supabase = createClient();
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editQueue, setEditQueue] = useState<Queue | null>(null);
  const [form, setForm] = useState<QueueForm>({
    name: "", slug: "", description: "",
    default_priority: "normal", routing_mode: "manual",
    visibility: "internal", status: "active",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { loadQueues(); }, []);

  async function loadQueues() {
    setLoading(true);
    const { data } = await supabase.from("queue").select("*").is("deleted_at", null).order("created_at", { ascending: false });
    setQueues((data as Queue[]) ?? []);
    setLoading(false);
  }

  function generateSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  async function handleSave(isNew: boolean) {
    if (!form.name || !form.slug) { setError("Name and slug are required."); return; }
    setSaving(true);
    setError("");
    const payload = { ...form, updated_at: new Date().toISOString() };
    try {
      if (isNew) {
        // Get tenant_id from current user
        const { data: { user } } = await supabase.auth.getUser();
        const { data: appUser } = await supabase.from("app_user").select("tenant_id").eq("id", user?.id).single();
        const { error: err } = await supabase.from("queue").insert({ ...payload, tenant_id: appUser?.tenant_id ?? "" });
        if (err) throw err;
        setCreateOpen(false);
      } else if (editQueue) {
        const { error: err } = await supabase.from("queue").update(payload).eq("id", editQueue.id);
        if (err) throw err;
        setEditQueue(null);
      }
      await loadQueues();
    } catch (err: unknown) {
      setError((err as Error).message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(queue: Queue) {
    await supabase.from("queue").update({ status: "archived", updated_at: new Date().toISOString() }).eq("id", queue.id);
    await loadQueues();
  }

  const filtered = queues.filter((q) =>
    !search || q.name.toLowerCase().includes(search.toLowerCase()) || q.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">Queues route incoming tickets to the right teams and agents.</p>
        <button onClick={() => { setForm({ name: "", slug: "", description: "", default_priority: "normal", routing_mode: "manual", visibility: "internal", status: "active" }); setError(""); setCreateOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> New Queue
        </button>
      </div>

      <div className="mb-5 max-w-xs">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search queues..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="grid gap-3">
        {loading ? (
          <div className="text-center py-12 text-sm text-slate-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <ListTodo className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No queues yet. Create your first queue.</p>
          </div>
        ) : (
          filtered.map((queue) => (
            <div key={queue.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center shrink-0">
                  <ListTodo className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{queue.name}</h3>
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_COLORS[queue.status]}`}>{queue.status}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">/{queue.slug}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{ROUTING_LABELS[queue.routing_mode]}</span>
                    <span className="text-xs text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{PRIORITY_LABELS[queue.default_priority]} priority</span>
                    <span className="text-xs text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{VISIBILITY_LABELS[queue.visibility]}</span>
                  </div>
                  {queue.description && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{queue.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => { setForm({ name: queue.name, slug: queue.slug, description: queue.description ?? "", default_priority: queue.default_priority, routing_mode: queue.routing_mode, visibility: queue.visibility, status: queue.status }); setError(""); setEditQueue(queue); }}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                {queue.status !== "archived" && (
                  <button onClick={() => handleArchive(queue)}
                    className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                    <Archive className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={createOpen || !!editQueue}
        onClose={() => { setCreateOpen(false); setEditQueue(null); setError(""); }}
        title={editQueue ? "Edit Queue" : "New Queue"}
        footer={<>
          <button onClick={() => { setCreateOpen(false); setEditQueue(null); setError(""); }}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Cancel</button>
          <button onClick={() => handleSave(!!createOpen)} disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors">
            {saving ? "Saving..." : editQueue ? "Save Changes" : "Create Queue"}
          </button>
        </>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Name</label>
              <input value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value, slug: generateSlug(e.target.value) }))}
                placeholder="IT Support"
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Slug</label>
              <input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))}
                placeholder="it-support"
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2}
              placeholder="Handles all IT-related support requests..."
              className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Default Priority</label>
              <select value={form.default_priority} onChange={(e) => setForm((p) => ({ ...p, default_priority: e.target.value as QueueForm["default_priority"] }))}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Routing Mode</label>
              <select value={form.routing_mode} onChange={(e) => setForm((p) => ({ ...p, routing_mode: e.target.value as QueueForm["routing_mode"] }))}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="manual">Manual</option>
                <option value="round_robin">Round Robin</option>
                <option value="skill_based">Skill Based</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Visibility</label>
              <select value={form.visibility} onChange={(e) => setForm((p) => ({ ...p, visibility: e.target.value as QueueForm["visibility"] }))}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="internal">Internal</option>
                <option value="restricted">Restricted</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as QueueForm["status"] }))}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
