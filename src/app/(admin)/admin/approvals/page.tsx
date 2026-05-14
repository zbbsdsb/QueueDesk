"use client";

import { useState, useEffect } from "react";
import { GitBranch, ShieldCheck, ShieldOff, Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ApprovalSettings {
  high_priority_enabled: boolean;
  urgent_priority_enabled: boolean;
  auto_assign_approver: boolean;
}

const DEFAULT_SETTINGS: ApprovalSettings = {
  high_priority_enabled: false,
  urgent_priority_enabled: false,
  auto_assign_approver: false,
};

export default function AdminApprovalsPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [settings, setSettings] = useState<ApprovalSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadSettings() {
    if (!user?.tenant_id) return;
    setLoading(true);
    const { data } = await supabase
      .from("tenant")
      .select("settings")
      .eq("id", user.tenant_id)
      .single();

    const stored = data?.settings as Record<string, unknown> | null;
    setSettings({
      high_priority_enabled: stored?.high_priority_enabled === true,
      urgent_priority_enabled: stored?.urgent_priority_enabled === true,
      auto_assign_approver: stored?.auto_assign_approver === true,
    });
    setLoading(false);
  }

  useEffect(() => {
    void loadSettings();
  }, [user?.tenant_id]);

  async function handleToggle(key: keyof ApprovalSettings) {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    setSaving(true);

    const { error } = await supabase
      .from("tenant")
      .update({ settings: newSettings })
      .eq("id", user!.tenant_id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Save failed",
        description: error.message,
      });
      setSettings(settings);
    } else {
      toast({
        title: "Settings updated",
        description: "Approval configuration has been saved.",
      });
    }
    setSaving(false);
  }

  const toggles = [
    {
      key: "high_priority_enabled" as const,
      label: "High Priority Tickets",
      description: "Require approval before resolving high priority tickets.",
      icon: ShieldCheck,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
      key: "urgent_priority_enabled" as const,
      label: "Urgent Priority Tickets",
      description: "Require approval before resolving urgent priority tickets.",
      icon: ShieldCheck,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-950/30",
    },
    {
      key: "auto_assign_approver" as const,
      label: "Auto-assign Approvers",
      description: "Automatically assign a designated approver based on queue rules.",
      icon: GitBranch,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
  ] as const;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">Approval Workflow</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Control when tickets require a second pair of eyes before they can be resolved.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="space-y-4">
          {toggles.map(({ key, label, description, icon: Icon, color, bg }) => (
            <div
              key={key}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{label}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
                </div>
              </div>
              <button
                onClick={() => void handleToggle(key)}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
                  settings[key] ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
                }`}
                aria-label={`Toggle ${label}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    settings[key] ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}

          <div className="mt-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                {settings.high_priority_enabled || settings.urgent_priority_enabled ? (
                  <ShieldOff className="w-4 h-4 text-slate-500" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Status</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {settings.high_priority_enabled || settings.urgent_priority_enabled
                    ? "Approval is required for certain priority levels. Tickets will enter a \"pending approval\" state before resolution."
                    : "No approval requirements are currently active. All tickets can be resolved directly by agents."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
