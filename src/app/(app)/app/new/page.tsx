"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import {
  type TicketPriority,
  TICKET_PRIORITY_CONFIG,
} from "@/lib/types";
import {
  ArrowLeft,
  Send,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

type Queue = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export default function NewTicketPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [queueId, setQueueId] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("normal");
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loadingQueues, setLoadingQueues] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load queues when component mounts
  useEffect(() => {
    if (!user?.tenant_id) return;
    setLoadingQueues(true);
    const loadQueues = async () => {
      const { data } = await supabase
        .from("queue")
        .select("id, name, slug, description")
        .eq("tenant_id", user.tenant_id)
        .eq("status", "active")
        .order("name");
      setQueues((data as unknown as Queue[]) ?? []);
      if (data?.[0]) setQueueId(data[0].id);
      setLoadingQueues(false);
    };
    loadQueues();
  }, [user?.tenant_id]);

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!subject.trim()) newErrors.subject = "Subject is required.";
    if (subject.trim().length > 200) newErrors.subject = "Subject must be 200 characters or fewer.";
    if (!description.trim()) newErrors.description = "Please describe your request.";
    if (!queueId) newErrors.queue = "Please select a queue.";
    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    if (!user) {
      toast({ variant: "destructive", title: "Not authenticated", description: "Please sign in first." });
      return;
    }

    startTransition(async () => {
      const { data, error } = await supabase
        .from("ticket")
        .insert({
          tenant_id: user.tenant_id,
          queue_id: queueId,
          requester_id: user.id,
          subject: subject.trim(),
          description: description.trim(),
          priority,
          status: "open",
          lock_version: 1,
        })
        .select("id")
        .single();

      if (error) {
        toast({ variant: "destructive", title: "Failed to submit request", description: error.message });
      } else {
        toast({ title: "Request submitted!", description: "Your request has been created." });
        router.push("/app/tickets");
        router.refresh();
      }
    });
  }

  const priorityOptions: TicketPriority[] = ["urgent", "high", "normal", "low"];

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Back */}
      <Link
        href="/app/tickets"
        className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to My Requests
      </Link>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Submit a Request</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">We typically respond within 1 business hour.</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
          {/* Queue */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={queueId}
              onChange={(e) => setQueueId(e.target.value)}
              disabled={loadingQueues}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            >
              <option value="">Select a category…</option>
              {queues.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.name}
                </option>
              ))}
            </select>
            {errors.queue && <FieldError message={errors.queue} />}
            {queues.length === 0 && !loadingQueues && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5">
                No queues configured yet. Contact your administrator.
              </p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description of your request"
              maxLength={200}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
            <div className="flex items-start justify-between mt-1">
              {errors.subject ? <FieldError message={errors.subject} /> : <span />}
              <span className="text-xs text-slate-400">{subject.length}/200</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe your issue or request in detail. Include any relevant context, error messages, or steps to reproduce."
              rows={6}
              className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none"
            />
            {errors.description && <FieldError message={errors.description} />}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Priority
            </label>
            <div className="flex gap-2 flex-wrap">
              {priorityOptions.map((p) => {
                const cfg = TICKET_PRIORITY_CONFIG[p];
                const isSelected = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                      isSelected
                        ? `${cfg.bg} ${cfg.text} border-current/30`
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                    {p === "urgent" && (
                      <AlertCircle className="w-3 h-3 ml-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              Use <strong>Urgent</strong> only for critical issues affecting multiple users.
            </p>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors shadow-sm"
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {message}
    </p>
  );
}
