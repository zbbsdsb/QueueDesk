"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Building2,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  const [displayName, setDisplayName] = useState(user?.display_name ?? "");
  const [tenantName, setTenantName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.tenant_id) return;

    async function fetchTenantName() {
      const { data, error } = await supabase
        .from("tenant")
        .select("name")
        .eq("id", user.tenant_id)
        .single();

      if (!error && data) {
        setTenantName(data.name);
      }
    }

    fetchTenantName();
  }, [user?.tenant_id, supabase]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setError("");
    setSaving(true);

    const { error: dbError } = await supabase
      .from("app_user")
      .update({ display_name: displayName.trim() || null })
      .eq("id", user.id);

    if (dbError) {
      setError(dbError.message);
      setSaving(false);
    } else {
      setSaved(true);
      setSaving(false);
      toast({ title: "Profile updated", description: "Your changes have been saved." });
      setTimeout(() => setSaved(false), 3000);
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const initials = user.display_name
    ? user.display_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user.email?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      {/* Avatar section */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
          {initials}
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {user.display_name ?? "Your Profile"}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
        <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
          Active
        </span>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            Profile Information
          </h3>
        </div>

        <form onSubmit={handleSave} className="px-6 py-5 space-y-5">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Display Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How should we address you?"
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
              Shown to support agents when you submit requests.
            </p>
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="email"
                value={user.email}
                readOnly
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
              Email cannot be changed. Contact your administrator.
            </p>
          </div>

          {/* Tenant (read-only) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Organization
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={tenantName ?? user.tenant_id}
                readOnly
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 rounded-xl">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Profile saved successfully.
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Danger zone */}
      <div className="mt-6 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/30">
          <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">Account Actions</h3>
        </div>
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Sign out of your account</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">You can sign back in anytime with your email.</p>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/login");
            }}
            className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors shrink-0"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
