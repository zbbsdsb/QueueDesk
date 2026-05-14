"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

type QueueRow = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  routing_mode: string;
  created_at: string;
};

type QueueWithCount = QueueRow & { ticket_count: number };

export default function QueuesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();

  const [queues, setQueues] = useState<QueueWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalTickets, setTotalTickets] = useState<number | null>(null);

  const tenantId = user?.tenant_id;

  const fetchQueues = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("queue")
        .select("*")
        .eq("tenant_id", tenantId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const queuesList: QueueRow[] = data ?? [];

      const { count: total } = await supabase
        .from("ticket")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .is("deleted_at", null)
        .not("status", "in", '("resolved","closed","cancelled")');

      setTotalTickets(total ?? 0);

      if (queuesList.length === 0) {
        setQueues([]);
        return;
      }

      const queueIds = queuesList.map((q) => q.id);

      const { data: ticketCounts, error: countError } = await supabase
        .from("ticket")
        .select("queue_id", { count: "exact" })
        .in("queue_id", queueIds)
        .eq("tenant_id", tenantId)
        .is("deleted_at", null)
        .not("status", "in", '("resolved","closed","cancelled")');

      if (countError) throw countError;

      const countMap: Record<string, number> = {};
      (ticketCounts ?? []).forEach((t: { queue_id: string }) => {
        countMap[t.queue_id] = (countMap[t.queue_id] ?? 0) + 1;
      });

      setQueues(
        queuesList.map((q) => ({
          ...q,
          ticket_count: countMap[q.id] ?? 0,
        }))
      );
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Failed to load queues",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }, [tenantId, supabase, toast]);

  useEffect(() => {
    if (tenantId) fetchQueues();
  }, [tenantId, fetchQueues]);

  if (loading) {
    return (
      <div className="px-6 py-6 space-y-4 max-w-3xl">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="px-6 py-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {queues.length} queue{queues.length !== 1 ? "s" : ""} ·{" "}
            {totalTickets !== null ? `${totalTickets} active ticket${totalTickets !== 1 ? "s" : ""}` : "—"}
          </p>
        </div>
      </div>

      {queues.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 py-16 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">No queues yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queues.map((queue) => (
            <div
              key={queue.id}
              className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                      {queue.name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        queue.status === "active"
                          ? "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                          : queue.status === "paused"
                          ? "bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {queue.status}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {queue.routing_mode.replace("_", " ")}
                    </span>
                  </div>
                  {queue.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                      {queue.description}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {queue.ticket_count}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">active</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
