"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import {
  TICKET_STATUS_CONFIG,
  TICKET_PRIORITY_CONFIG,
  VALID_TRANSITIONS,
  type TicketStatus,
  type TicketPriority,
} from "@/lib/types";
import {
  ArrowLeft,
  RefreshCw,
  Send,
  Lock,
  ChevronDown,
  Clock,
  User,
  Tag,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type TicketDetail = {
  id: string;
  subject: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  queue_id: string;
  assigned_agent_id: string | null;
  requester_id: string;
  lock_version: number;
  created_at: string;
  updated_at: string;
  queue?: { id: string; name: string; slug: string };
  requester?: { id: string; display_name: string | null; email: string };
  assigned_agent?: { id: string; display_name: string | null; email: string } | null;
};

type Comment = {
  id: string;
  body: string;
  visibility: "public" | "internal";
  author_type: "user" | "contact" | "system";
  created_at: string;
  status: "published" | "edited" | "redacted";
  author?: { id: string; display_name: string | null; email: string };
};

function getAge(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "<1m";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function TicketDetail({ ticketId }: { ticketId: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [commentVisibility, setCommentVisibility] = useState<"public" | "internal">("public");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  async function fetchTicket() {
    const { data, error } = await supabase
      .from("ticket")
      .select(`
        id, subject, description, status, priority, queue_id, assigned_agent_id,
        requester_id, lock_version, created_at, updated_at,
        queue:queue_id(id, name, slug),
        requester:requester_id(id, display_name, email),
        assigned_agent:assigned_agent_id(id, display_name, email)
      `)
      .eq("id", ticketId)
      .single();

    if (error) {
      toast({ variant: "destructive", title: "Failed to load ticket", description: error.message });
      router.push("/agent/tickets");
      return;
    }
    setTicket(data as unknown as TicketDetail);
    fetchComments();
  }

  async function fetchComments() {
    const { data } = await supabase
      .from("ticket_comment")
      .select(`
        id, body, visibility, author_type, created_at, status,
        author:author_id(id, display_name, email)
      `)
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    setComments((data as unknown as Comment[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  async function handleStatusChange(newStatus: TicketStatus) {
    if (!ticket || !user) return;
    setShowStatusMenu(false);
    startTransition(async () => {
      const { error } = await supabase
        .from("ticket")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
          lock_version: ticket.lock_version + 1,
        })
        .eq("id", ticket.id)
        .eq("lock_version", ticket.lock_version);

      if (error) {
        toast({ variant: "destructive", title: "Failed to update status", description: error.message });
      } else {
        toast({ title: "Status updated", description: `Ticket moved to ${TICKET_STATUS_CONFIG[newStatus].label}.` });
        fetchTicket();
      }
    });
  }

  async function handleAssignSelf() {
    if (!ticket || !user) return;
    startTransition(async () => {
      const { error } = await supabase
        .from("ticket")
        .update({
          assigned_agent_id: user.id,
          status: ticket.status === "open" ? "in_progress" : ticket.status,
          updated_at: new Date().toISOString(),
          lock_version: ticket.lock_version + 1,
        })
        .eq("id", ticket.id)
        .eq("lock_version", ticket.lock_version);

      if (error) {
        toast({ variant: "destructive", title: "Failed to assign", description: error.message });
      } else {
        toast({ title: "Assigned", description: "Ticket has been assigned to you." });
        fetchTicket();
      }
    });
  }

  async function handleAddComment() {
    if (!ticket || !user || !newComment.trim()) return;
    setSubmittingComment(true);

    const { error } = await supabase.from("ticket_comment").insert({
      tenant_id: user.tenant_id,
      ticket_id: ticket.id,
      author_id: user.id,
      author_type: "user",
      visibility: commentVisibility,
      body: newComment.trim(),
    });

    if (error) {
      toast({ variant: "destructive", title: "Failed to post comment", description: error.message });
    } else {
      setNewComment("");
      fetchComments();
    }
    setSubmittingComment(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!ticket) return null;

  const statusCfg = TICKET_STATUS_CONFIG[ticket.status];
  const priorityCfg = TICKET_PRIORITY_CONFIG[ticket.priority];
  const validNextStatuses = VALID_TRANSITIONS[ticket.status] ?? [];

  const canTake = !ticket.assigned_agent_id && ticket.status === "open";
  const canAssignSelf = !ticket.assigned_agent_id;

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Ticket header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <button
              onClick={() => router.push("/agent/tickets")}
              className="mt-0.5 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white leading-tight">
                  {ticket.subject}
                </h1>
                <div className="flex items-center gap-2 shrink-0">
                  {canTake && (
                    <button
                      onClick={handleAssignSelf}
                      className="px-3 py-1.5 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors shadow-sm"
                    >
                      Take & Start
                    </button>
                  )}
                  {canAssignSelf && !canTake && (
                    <button
                      onClick={handleAssignSelf}
                      className="px-3 py-1.5 text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg transition-colors"
                    >
                      Assign to me
                    </button>
                  )}

                  {/* Status transition dropdown */}
                  {validNextStatuses.length > 0 && (
                    <div className="relative">
                      <button
                        onClick={() => setShowStatusMenu((v) => !v)}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${statusCfg.bg} ${statusCfg.text} border-current/20 hover:opacity-80`}
                      >
                        {statusCfg.label}
                        <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                      </button>
                      {showStatusMenu && (
                        <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 min-w-44 overflow-hidden">
                          {validNextStatuses.map((s) => {
                            const cfg = TICKET_STATUS_CONFIG[s];
                            return (
                              <button
                                key={s}
                                onClick={() => handleStatusChange(s)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${cfg.text}`}
                              >
                                <span className={`w-2 h-2 rounded-full ${cfg.bg.replace("bg-", "bg-").split(" ")[0]}`} />
                                {cfg.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Meta chips */}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${priorityCfg.bg} ${priorityCfg.text}`}>
                  {priorityCfg.label}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Clock className="w-3 h-3" />
                  {getAge(ticket.created_at)} old
                </span>
                {ticket.queue && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Tag className="w-3 h-3" />
                    {ticket.queue.name}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Lock className="w-3 h-3" />
                  v{ticket.lock_version}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {ticket.description && (
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>
        )}

        {/* Conversation */}
        <div className="flex-1 overflow-auto px-6 py-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Conversation
            <span className="ml-1 text-slate-400 font-normal">{comments.length}</span>
          </h3>
          <div className="space-y-4">
            {comments.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-slate-400 dark:text-slate-500">No comments yet. Add the first one below.</p>
              </div>
            )}
            {comments.map((comment) => {
              const isInternal = comment.visibility === "internal";
              return (
                <div
                  key={comment.id}
                  className={`flex gap-3 ${isInternal ? "opacity-80" : ""}`}
                >
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                    comment.author_type === "system"
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-500"
                      : "bg-violet-600 text-white"
                  }`}>
                    {comment.author_type === "system" ? "S" :
                      (comment.author?.display_name ?? comment.author?.email ?? "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {comment.author_type === "system" ? "System" :
                          (comment.author?.display_name ?? comment.author?.email ?? "Unknown")}
                      </span>
                      {isInternal && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-medium">
                          Internal
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{getAge(comment.created_at)}</span>
                      {comment.status === "edited" && (
                        <span className="text-xs text-slate-400">(edited)</span>
                      )}
                    </div>
                    <div className={`text-sm leading-relaxed rounded-xl px-4 py-3 ${
                      isInternal
                        ? "bg-amber-50 dark:bg-amber-950/30 text-slate-800 dark:text-slate-200"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    }`}>
                      {comment.body}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comment input */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex gap-2 mb-2">
            {(["public", "internal"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setCommentVisibility(v)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  commentVisibility === v
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                }`}
              >
                {v === "public" ? "Reply (public)" : "Internal note"}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleAddComment();
                }
              }}
              placeholder={
                commentVisibility === "public"
                  ? "Reply to customer… (Cmd+Enter to send)"
                  : "Add an internal note… (Cmd+Enter to send)"
              }
              rows={3}
              className="flex-1 resize-none px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
            <button
              onClick={handleAddComment}
              disabled={submittingComment || !newComment.trim()}
              className="self-end px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="p-5 space-y-5">
          {/* Requester */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Requester</h4>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300">
                {(ticket.requester?.display_name ?? ticket.requester?.email ?? "?")[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {ticket.requester?.display_name ?? "Unknown"}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{ticket.requester?.email}</p>
              </div>
            </div>
          </div>

          {/* Assigned Agent */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Assigned Agent</h4>
            {ticket.assigned_agent ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white">
                  {(ticket.assigned_agent.display_name ?? ticket.assigned_agent.email)[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {ticket.assigned_agent.display_name ?? ticket.assigned_agent.email.split("@")[0]}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Agent</p>
                </div>
              </div>
            ) : (
              <button
                onClick={handleAssignSelf}
                className="w-full px-3 py-2 text-sm border border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 dark:text-slate-400 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                Assign to me
              </button>
            )}
          </div>

          {/* Timeline */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Timeline</h4>
            <div className="space-y-2.5">
              <TimelineEvent icon={Clock} label="Created" value={new Date(ticket.created_at).toLocaleString()} />
              <TimelineEvent icon={RefreshCw} label="Updated" value={new Date(ticket.updated_at).toLocaleString()} />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function TimelineEvent({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <div>
        <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
        <p className="text-xs text-slate-700 dark:text-slate-300">{value}</p>
      </div>
    </div>
  );
}
