"use client";

import { useState, useEffect } from "react";
import { Building2, Save, Globe, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import type { Database, Json } from "@/lib/supabase/types";

type Tenant = Database["public"]["Tables"]["tenant"]["Row"];

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [allowPublic, setAllowPublic] = useState(true);
  const [requireAuth, setRequireAuth] = useState(true);

  useEffect(() => {
    if (user?.tenant_id) {
      supabase.from("tenant").select("*").eq("id", user.tenant_id).single().then(({ data }: { data: Tenant | null }) => {
        if (data) {
          setTenant(data as Tenant);
          setName(data.name);
          const settings = data.settings as Record<string, unknown> | null;
          setTimezone((settings?.timezone as string) ?? "UTC");
          setAllowPublic((settings?.allow_public_portal as boolean) ?? true);
          setRequireAuth((settings?.require_auth_for_portal as boolean) ?? true);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user?.tenant_id]);

  async function handleSave() {
    if (!tenant) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const settings = {
        timezone,
        allow_public_portal: allowPublic,
        require_auth_for_portal: requireAuth,
      };
      const { error: err } = await supabase
        .from("tenant")
        .update({ name, settings: settings as unknown as Json, updated_at: new Date().toISOString() })
        .eq("id", tenant.id);
      if (err) throw err;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError((err as Error).message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6 text-sm text-slate-400">Loading settings...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Workspace */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-400" /> Workspace
        </h2>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Workspace Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="w-full max-w-md px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {tenant && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-400 mb-1">Slug</p>
              <p className="text-sm font-mono text-slate-600 dark:text-slate-300">/{tenant.slug}</p>
              <p className="text-xs text-slate-400 mt-1">Slug cannot be changed after creation.</p>
            </div>
          )}
        </div>
      </section>

      {/* Localization */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Globe className="w-4 h-4 text-slate-400" /> Localization
        </h2>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Timezone</label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)}
              className="w-full max-w-sm px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Asia/Shanghai">China Standard Time (CST)</option>
              <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
              <option value="Europe/London">London (GMT/BST)</option>
              <option value="Europe/Paris">Central European Time (CET)</option>
              <option value="Asia/Singapore">Singapore (SGT)</option>
            </select>
            <p className="mt-1.5 text-xs text-slate-400">Used for SLA calculations and ticket timestamps.</p>
          </div>
        </div>
      </section>

      {/* Portal Access */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-400" /> Portal Access
        </h2>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={allowPublic} onChange={(e) => setAllowPublic(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500" />
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Allow public portal</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">External users who are not logged in can submit requests via the public portal.</p>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={requireAuth} onChange={(e) => setRequireAuth(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500" />
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Require authentication for requester portal</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Users must be logged in to view or submit requests. Disabling this makes the portal fully public.</p>
            </div>
          </label>
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors">
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saved && <span className="text-sm text-emerald-600 dark:text-emerald-400">Settings saved.</span>}
        {error && <span className="text-sm text-red-600 dark:text-red-400">{error}</span>}
      </div>
    </div>
  );
}
