"use client";

import { useState, useEffect } from "react";
import { Building2, Save, Globe, Bell, MessageSquare, Send, RefreshCw } from "lucide-react";
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
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [slackWebhookUrl, setSlackWebhookUrl] = useState("");
  const [slackNotifyNew, setSlackNotifyNew] = useState(true);
  const [slackNotifyAssign, setSlackNotifyAssign] = useState(true);
  const [slackNotifyResolved, setSlackNotifyResolved] = useState(false);
  const [slackNotifyApproval, setSlackNotifyApproval] = useState(true);
  const [testingSlack, setTestingSlack] = useState(false);
  const [slackTestResult, setSlackTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (user?.tenant_id) {
      void supabase.from("tenant").select("*").eq("id", user.tenant_id).single().then(({ data }: { data: Tenant | null }) => {
        if (data) {
          setTenant(data as Tenant);
          setName(data.name);
          const settings = data.settings as Record<string, unknown> | null;
          setTimezone((settings?.timezone as string) ?? "UTC");
          setAllowPublic((settings?.allow_public_portal as boolean) ?? true);
          setRequireAuth((settings?.require_auth_for_portal as boolean) ?? true);
          const slack = settings?.slack as Record<string, unknown> | null;
          setSlackEnabled((slack?.enabled as boolean) ?? false);
          setSlackWebhookUrl((slack?.webhook_url as string) ?? "");
          setSlackNotifyNew((slack?.notify_new_ticket as boolean) ?? true);
          setSlackNotifyAssign((slack?.notify_assignment as boolean) ?? true);
          setSlackNotifyResolved((slack?.notify_resolved as boolean) ?? false);
          setSlackNotifyApproval((slack?.notify_approval as boolean) ?? true);
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(false);
      });
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
    }
  }, [user?.tenant_id]);

  async function handleSave() {
    if (!tenant) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const settings: Json = {
        timezone,
        allow_public_portal: allowPublic,
        require_auth_for_portal: requireAuth,
        slack: {
          enabled: slackEnabled,
          webhook_url: slackWebhookUrl,
          notify_new_ticket: slackNotifyNew,
          notify_assignment: slackNotifyAssign,
          notify_resolved: slackNotifyResolved,
          notify_approval: slackNotifyApproval,
        },
      };
      const { error: err } = await supabase
        .from("tenant")
        .update({ name, settings, updated_at: new Date().toISOString() })
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

  async function handleTestSlack() {
    if (!slackWebhookUrl) return;
    setTestingSlack(true);
    setSlackTestResult(null);
    try {
      const response = await fetch("/api/slack/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl: slackWebhookUrl }),
      });
      const data = await response.json();
      setSlackTestResult({ success: data.success, message: data.message || data.error || "Unknown error" });
    } catch (err) {
      setSlackTestResult({ success: false, message: err instanceof Error ? err.message : "Failed to test" });
    } finally {
      setTestingSlack(false);
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

      {/* Public Portal */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Public Portal
        </h3>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-violet-500" />
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Public Portal</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Allow requesters to submit tickets without login</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allowPublic}
                onChange={(e) => setAllowPublic(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-300 dark:peer-focus:ring-violet-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-violet-600" />
            </label>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-violet-500" />
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Require Auth for Portal</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Require requesters to log in before accessing portal</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={requireAuth}
                onChange={(e) => setRequireAuth(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-300 dark:peer-focus:ring-violet-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-violet-600" />
            </label>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Notifications
        </h3>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-violet-500" />
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Slack Notifications</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Send ticket notifications to Slack</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={slackEnabled}
                onChange={(e) => setSlackEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-300 dark:peer-focus:ring-violet-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-violet-600" />
            </label>
          </div>

          {slackEnabled && (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={slackWebhookUrl}
                  onChange={(e) => setSlackWebhookUrl(e.target.value)}
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Notify on:</p>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={slackNotifyNew}
                    onChange={(e) => setSlackNotifyNew(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-600 text-violet-600"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">New ticket created</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={slackNotifyAssign}
                    onChange={(e) => setSlackNotifyAssign(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-600 text-violet-600"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Ticket assigned</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={slackNotifyResolved}
                    onChange={(e) => setSlackNotifyResolved(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-600 text-violet-600"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Ticket resolved</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={slackNotifyApproval}
                    onChange={(e) => setSlackNotifyApproval(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-600 text-violet-600"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Approval required / completed</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTestSlack}
                  disabled={!slackWebhookUrl || testingSlack}
                  className="px-3 py-1.5 text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {testingSlack ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  {testingSlack ? "Sending..." : "Send Test Message"}
                </button>
                {slackTestResult && (
                  <span className={`text-xs font-medium ${slackTestResult.success ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {slackTestResult.message}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

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
