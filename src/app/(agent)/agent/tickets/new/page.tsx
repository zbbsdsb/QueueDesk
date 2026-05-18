"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AppUser = {
  id: string;
  display_name: string | null;
  email: string;
};

type Queue = {
  id: string;
  name: string;
};

export default function AgentNewTicketPage() {
  const { user, supabase } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");
  const [queueId, setQueueId] = useState("");
  const [requesterId, setRequesterId] = useState("");
  const [requesterSearch, setRequesterSearch] = useState("");
  const [requesterOptions, setRequesterOptions] = useState<AppUser[]>([]);
  const [showRequesterDropdown, setShowRequesterDropdown] = useState(false);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Load queues + requesters
  const loadData = useCallback(async () => {
    if (!user?.tenant_id) return;
    setLoadingData(true);
    const [queuesRes, usersRes] = await Promise.all([
      supabase
        .from("queue")
        .select("id,name")
        .eq("tenant_id", user.tenant_id)
        .eq("status", "active")
        .order("name"),
      supabase
        .from("app_user")
        .select("id,display_name,email")
        .eq("tenant_id", user.tenant_id)
        .eq("status", "active")
        .order("display_name", { ascending: true, nullsFirst: false })
        .limit(50),
    ]);
    const queues = (queuesRes.data ?? []) as Queue[];
    setQueues(queues);
    setRequesterOptions((usersRes.data ?? []) as AppUser[]);
    if (queues.length > 0) {
      setQueueId(queues[0].id);
    }
    setLoadingData(false);
  }, [user, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Requester search
  useEffect(() => {
    if (requesterSearch.length < 2) {
      setRequesterOptions([]);
      return;
    }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("app_user")
        .select("id,display_name,email")
        .eq("tenant_id", user?.tenant_id ?? "")
        .eq("status", "active")
        .or(`display_name.ilike.%${requesterSearch}%,email.ilike.%${requesterSearch}%`)
        .limit(10);
      setRequesterOptions((data ?? []) as AppUser[]);
    }, 300);
    return () => clearTimeout(timer);
  }, [requesterSearch, supabase, user?.tenant_id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !requesterId || !queueId) {
      toast({ variant: "destructive", title: "Missing fields", description: "Please fill in all required fields." });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("ticket")
      .insert({
        tenant_id: user!.tenant_id,
        queue_id: queueId,
        requester_user_id: requesterId,
        priority: priority as "low" | "normal" | "high" | "urgent",
        subject: subject.trim(),
        description: description.trim() || null,
      })
      .select("id, ticket_no")
      .single();

    setLoading(false);
    if (error) {
      toast({ variant: "destructive", title: "Failed to create ticket", description: error.message });
      return;
    }
    toast({ title: "Ticket created!" });
    router.push(`/agent/tickets/${data!.id}`);
  }

  const selectedRequester = requesterOptions.find((u) => u.id === requesterId);

  if (loadingData) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="mt-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Back */}
      <Link
        href="/agent/tickets"
        className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to tickets
      </Link>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">New Ticket</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Create a ticket on behalf of a customer.</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
          {/* Requester */}
          <div className="relative">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Requester <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={requesterSearch || (selectedRequester ? selectedRequester.display_name ?? selectedRequester.email : "")}
              onChange={(e) => {
                setRequesterSearch(e.target.value);
                setShowRequesterDropdown(true);
                if (!e.target.value) setRequesterId("");
              }}
              onFocus={() => setShowRequesterDropdown(true)}
              onBlur={() => setTimeout(() => setShowRequesterDropdown(false), 200)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {showRequesterDropdown && requesterOptions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-auto">
                {requesterOptions.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setRequesterId(u.id);
                      setRequesterSearch("");
                      setShowRequesterDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {(u.display_name?.[0] ?? u.email[0]).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                        {u.display_name ?? "—"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Queue */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Queue <span className="text-red-500">*</span>
            </label>
            <select
              value={queueId}
              onChange={(e) => setQueueId(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {queues.map((q) => (
                <option key={q.id} value={q.id}>{q.name}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Priority</label>
            <div className="flex gap-2">
              {(
                [
                  { value: "low", label: "Low", dot: "bg-slate-400" },
                  { value: "normal", label: "Normal", dot: "bg-blue-500" },
                  { value: "high", label: "High", dot: "bg-amber-500" },
                  { value: "urgent", label: "Urgent", dot: "bg-red-500" },
                ] as const
              ).map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm rounded-xl border transition-all ${
                    priority === p.value
                      ? "bg-blue-600 text-white border-blue-600 font-medium"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${p.dot}`} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Brief summary of the issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              required
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <textarea
              placeholder="Detailed description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? "Creating..." : "Create Ticket"}
            </button>
            <Link
              href="/agent/tickets"
              className="px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
